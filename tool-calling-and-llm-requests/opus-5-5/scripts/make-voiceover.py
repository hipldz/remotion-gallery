"""Generate caption-aligned Azure Speech narration using Downloads/demo.py."""
from __future__ import annotations

import argparse
import ast
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import time
from urllib.parse import urlparse
import wave
from xml.sax.saxutils import escape

import azure.cognitiveservices.speech as speechsdk

ROOT = Path(__file__).resolve().parents[1]
RATE = 24000


def config_from_sample(path: Path) -> dict:
    settings = {}
    wanted = {"endpoint_url", "speech_config.speech_synthesis_voice_name"}
    key_env = "AZURE_SPEECH_KEY"
    for node in ast.parse(path.read_text(encoding="utf-8-sig")).body:
        if isinstance(node, ast.Assign):
            for target in node.targets:
                name = ast.unparse(target)
                if name in wanted:
                    settings[name] = ast.literal_eval(node.value)
                elif name == "speech_key" and isinstance(node.value, ast.Call) and ast.unparse(node.value.func) == "os.getenv":
                    key_env = ast.literal_eval(node.value.args[0])
    for name in wanted:
        if name not in settings:
            raise ValueError(f"Missing {name} in {path.name}")
    key = os.environ.get(key_env)
    if not key:
        raise ValueError(f"{key_env} environment variable is not set")
    parsed = urlparse(settings["endpoint_url"])
    if parsed.scheme != "https" or not parsed.netloc:
        raise ValueError("demo.py must contain a valid HTTPS endpoint_url")
    return {
        "TARGET_MODEL": "azure-speech",
        "voice_id": settings["speech_config.speech_synthesis_voice_name"],
        "endpoint": f"{parsed.scheme}://{parsed.netloc}",
        "subscription": key,
    }


def synthesize_audio(text: str, settings: dict) -> bytes:
    config = speechsdk.SpeechConfig(subscription=settings["subscription"], endpoint=settings["endpoint"])
    config.speech_synthesis_voice_name = settings["voice_id"]
    config.set_speech_synthesis_output_format(speechsdk.SpeechSynthesisOutputFormat.Raw24Khz16BitMonoPcm)
    synthesizer = speechsdk.SpeechSynthesizer(speech_config=config, audio_config=None)
    voice = escape(settings["voice_id"], {'"': '&quot;'})
    ssml = f'<speak version="1.0" xml:lang="zh-CN" xmlns="http://www.w3.org/2001/10/synthesis"><voice name="{voice}"><prosody rate="+12%">{escape(text)}</prosody></voice></speak>'
    result = synthesizer.speak_ssml_async(ssml).get()
    if result.reason != speechsdk.ResultReason.SynthesizingAudioCompleted:
        details = result.cancellation_details
        raise RuntimeError(f"Azure Speech synthesis canceled: {details.error_code}; check network, endpoint and subscription")
    if not result.audio_data:
        raise RuntimeError("Azure Speech synthesis returned no audio")
    return result.audio_data


def spoken_text(text: str) -> str:
    replacements = {
        "WebUI lite": "Web UI lite",
        "POST /v1/responses": "POST responses",
        "response.id": "response 点 ID",
        "generation_id": "generation ID",
        "x-request-id": "x request ID",
        "call_id": "call ID",
        "Tool Calls": "工具调用",
        "Tool Call": "工具调用",
        "Tool Result": "工具结果",
        "Response 对象": "响应对象",
        "同一个 Response": "同一个响应",
        "3 次 Response": "三次响应",
        "1 个 Turn": "一个 Turn",
        "API Request": "API 请求",
        "一次 Request": "一次请求",
        "Provider 返回的 ID": "平台返回的 ID",
        "·": "，",
        "（": "，",
        "）": "",
        "——": "。",
        "……": "。",
    }
    for source, replacement in replacements.items():
        text = text.replace(source, replacement)
    return text


def render_cue(cue: dict, settings: dict, cache: Path) -> dict:
    signature = hashlib.sha256(json.dumps({"text": cue["speech"], "model": settings["TARGET_MODEL"], "voice": settings["voice_id"], "rate": 1.12, "endpoint": settings["endpoint"]}, sort_keys=True).encode()).hexdigest()[:16]
    raw = cache / f'{cue["id"]:02d}-{signature}.wav'
    aligned = cache / f'{cue["id"]:02d}-aligned.wav'
    if not raw.exists():
        for attempt in range(3):
            try:
                audio = synthesize_audio(cue["speech"], settings)
                with wave.open(str(raw), "wb") as handle:
                    handle.setnchannels(1)
                    handle.setsampwidth(2)
                    handle.setframerate(RATE)
                    handle.writeframes(audio)
                break
            except Exception as exc:
                if attempt == 2 or "ConnectionFailure" in str(exc):
                    raise RuntimeError(f'Speech synthesis failed for cue {cue["id"]}: {exc}') from None
                time.sleep(attempt + 1)

    # Remove only leading/trailing silence, then fit the whole sentence without
    # changing pitch or truncating words. Every cue stays inside its caption.
    trimmed = cache / f'{cue["id"]:02d}-trimmed.wav'
    subprocess.run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(raw),
        "-af", "silenceremove=start_periods=1:start_duration=0.02:start_threshold=-48dB,areverse,silenceremove=start_periods=1:start_duration=0.02:start_threshold=-48dB,areverse",
        "-ar", str(RATE), "-ac", "1", str(trimmed),
    ], check=True)
    with wave.open(str(trimmed), "rb") as handle:
        natural = handle.getnframes() / handle.getframerate()
    target = cue["end"] - cue["start"] - 0.10
    # Slightly slow very short readings; leave ordinary readings untouched.
    tempo = max(0.85, natural / target) if natural < target * 0.85 else max(1.0, natural / target)
    filters = []
    remaining = tempo
    while remaining > 2:
        filters.append("atempo=2")
        remaining /= 2
    filters += [f"atempo={remaining:.8f}", "afade=t=in:d=0.008"]
    subprocess.run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(trimmed),
        "-af", ",".join(filters), "-ar", str(RATE), "-ac", "1", str(aligned),
    ], check=True)
    with wave.open(str(aligned), "rb") as handle:
        duration = handle.getnframes() / RATE
    if duration > cue["end"] - cue["start"] + 0.02:
        raise RuntimeError(f'Cue {cue["id"]} does not fit its caption')
    return {**cue, "naturalDuration": round(natural, 3), "audioDuration": round(duration, 3), "tempo": round(tempo, 3), "file": aligned.relative_to(ROOT).as_posix()}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=Path, default=Path.home() / "Downloads/demo.py")
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--check-config", action="store_true", help="Validate local configuration without making API calls")
    args = parser.parse_args()
    settings = config_from_sample(args.config)
    if not shutil.which("ffmpeg"):
        raise RuntimeError("ffmpeg is required on PATH")
    captions = json.loads((ROOT / "src/film/captions.json").read_text(encoding="utf-8"))
    cues = [{"id": i + 1, "start": cap["start"], "end": cap["end"], "text": cap["text"], "speech": spoken_text(cap["text"])} for i, cap in enumerate(captions)]
    cache = ROOT / "production/voiceover/segments-azure"
    cache.mkdir(parents=True, exist_ok=True)
    (ROOT / "production/voiceover/input.json").write_text(json.dumps(cues, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (ROOT / "production/voiceover/script.zh-CN.txt").write_text("\n\n".join(f'[{cue["start"]:.1f}–{cue["end"]:.1f}] {cue["speech"]}' for cue in cues) + "\n", encoding="utf-8")
    if args.check_config:
        print(f'Configuration OK: {len(cues)} cues, {settings["voice_id"]}, credentials available', flush=True)
        return
    print(f'Synthesizing {len(cues)} cues with Azure Speech / {settings["voice_id"]}', flush=True)
    results = []
    # The first actual narration cue verifies credentials/model/voice before
    # opening parallel synthesis connections. Cached segments are reusable.
    results.append(render_cue(cues[0], settings, cache))
    print(f'1/{len(cues)} ready', flush=True)
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(render_cue, cue, settings, cache): cue for cue in cues[1:]}
        for future in as_completed(futures):
            result = future.result()
            results.append(result)
            print(f'{len(results)}/{len(cues)} ready: cue {result["id"]}, {result["audioDuration"]:.2f}s, tempo {result["tempo"]:.2f}', flush=True)
    results.sort(key=lambda cue: cue["id"])
    duration = 180
    mixed = bytearray(duration * RATE * 2)
    for cue in results:
        with wave.open(str(ROOT / cue["file"]), "rb") as handle:
            audio = handle.readframes(handle.getnframes())
        offset = round(cue["start"] * RATE) * 2
        mixed[offset:offset + len(audio)] = audio
    public = ROOT / "public/audio"
    public.mkdir(parents=True, exist_ok=True)
    final = public / "voiceover.zh-CN.wav"
    pending = public / "voiceover.azure.pending.wav"
    with wave.open(str(pending), "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(RATE)
        handle.writeframes(mixed)
    subprocess.run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(pending),
        "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", str(RATE),
        "-c:a", "pcm_s16le", str(public / "voiceover.normalized.wav"),
    ], check=True)
    output = ROOT / "output"
    output.mkdir(exist_ok=True)
    subprocess.run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(public / "voiceover.normalized.wav"),
        "-c:a", "libmp3lame", "-b:a", "192k", str(output / "toolcall-vs-request-voiceover.mp3"),
    ], check=True)
    (public / "voiceover.normalized.wav").replace(final)
    pending.unlink()
    manifest = {"provider": "azure-speech", "model": settings["TARGET_MODEL"], "voice": settings["voice_id"], "duration": duration, "sampleRate": RATE, "audio": final.relative_to(ROOT).as_posix(), "cues": results}
    (ROOT / "production/voiceover/manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    # Activate the Remotion track only after the complete real audio is saved.
    (ROOT / "src/film/voiceover.json").write_text(json.dumps({"enabled": True, "src": "audio/voiceover.zh-CN.wav"}, indent=2) + "\n", encoding="utf-8")
    print(f'DONE: {final.relative_to(ROOT)} (180 seconds)', flush=True)
    print('MP3: output/toolcall-vs-request-voiceover.mp3', flush=True)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
