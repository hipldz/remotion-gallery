import {useEffect, useId, useMemo, useRef, useState, type RefObject} from 'react';
import type {PlayerRef} from '@remotion/player';
import {alignVoiceRecording, getVoiceCaptions, getVoiceRange, parseVoiceManifest, voiceCoverage, voiceDurationLabel, voiceSeconds, voiceTimeline,
  type VoiceCueTiming, type VoiceManifest, type VoiceoverProject, type VoiceoverStorage, type VoiceScope, type VoiceTrack} from '../core/index.js';
import {microphoneError, recorderMimeType, recordingToWave} from './audio.js';
import {createHttpVoiceoverStorage} from './storage.js';
import {VoiceScriptEditor} from './VoiceScriptEditor.js';

type Phase = 'idle' | 'requesting' | 'countdown' | 'recording' | 'processing' | 'saving' | 'audition';
type Take = {scope: VoiceScope; startFrame: number; durationInFrames: number; wav: Blob; url: string; saved: boolean;
  baseProject: VoiceoverProject; project: VoiceoverProject; flexible: boolean};
type Session = {
  recorder: MediaRecorder; stream: MediaStream; context: AudioContext; analyser: AnalyserNode;
  scope: VoiceScope; start: number; frames: number; chunks: Blob[]; cancelled: boolean;
  startedAt: number; raf: number; timer: ReturnType<typeof setTimeout> | null;
  project: VoiceoverProject; flexible: boolean; cueIndex: number; cueStart: number; timings: VoiceCueTiming[];
};
export type VoiceRecorderProps = {
  project: VoiceoverProject; player: RefObject<PlayerRef | null>; currentSceneId?: string; frame: number; manifest: VoiceManifest;
  storage?: VoiceoverStorage; assetUrl?: (src: string) => string;
  onManifest: (manifest: VoiceManifest) => void; onBusy: (busy: boolean) => void;
  onDraft: (track: VoiceTrack | null) => void; onSeek: (frame: number) => void;
  /** Connect to useVoiceover().setProjectDraft to preview extended scenes. */
  onProject?: (project: VoiceoverProject | null) => void;
  maxRecordingSeconds?: number;
};

const MicIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
  <rect x="8" y="2" width="8" height="13" rx="4"/><path d="M 5 10 v 2 a 7 7 0 0 0 14 0 v -2 M 12 19 v 3 M 8 22 h 8"/>
</svg>;

const defaultAssetUrl = (src: string) => /^(blob:|data:|https?:\/\/|\/)/.test(src) ? src : `/${src}`;

export const VoiceRecorder = ({project, player, currentSceneId, frame, manifest, onManifest, onBusy, onDraft, onSeek,
  onProject, maxRecordingSeconds = 600, storage: providedStorage, assetUrl = defaultAssetUrl}: VoiceRecorderProps) => {
  const FPS = project.fps;
  const scenes = project.scenes ?? [];
  const recordable = scenes.filter(scene => scene.recordable !== false);
  const storage = useMemo(() => providedStorage ?? createHttpVoiceoverStorage(project), [providedStorage, project]);
  const scopeId = useId();
  const [scope, setScope] = useState<VoiceScope>(recordable[0]?.id ?? 'full');
  const [mode, setMode] = useState<'reading' | 'fixed'>(onProject ? 'reading' : 'fixed');
  const [cuePage, setCuePage] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [countdown, setCountdown] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [level, setLevel] = useState(0);
  const [microphone, setMicrophone] = useState('系统默认麦克风');
  const [take, setTake] = useState<Take | null>(null);
  const [message, setMessage] = useState('选择镜头，跟着画面和字幕录音。');
  const [error, setError] = useState<string | null>(null);
  const session = useRef<Session | null>(null);
  const token = useRef(0);
  const mounted = useRef(true);
  const restoreMuted = useRef(false);
  const draftUrl = useRef<string | null>(null);
  const pending = useRef<{stream: MediaStream; context?: AudioContext} | null>(null);
  const takeAudio = useRef<HTMLAudioElement>(null);
  const busy = phase !== 'idle';
  const selected = getVoiceRange(scope, project);
  const startFrame = selected.from;
  const durationFrames = selected.durationInFrames;
  const cues = getVoiceCaptions(scope, project);
  const activeCue = cues.find(cue => frame >= cue.startFrame && frame < cue.endFrame);
  const activeIndex = activeCue ? cues.indexOf(activeCue) : cues.reduce((index, cue, at) => cue.startFrame <= frame ? at : index, 0);
  const shownCue = cues[Math.min(cuePage, cues.length - 1)];
  const followingSpeech = phase === 'recording' && session.current?.flexible && scope !== 'full';
  const saved = manifest.tracks.find(track => track.scope === scope);
  const coverage = voiceCoverage(manifest.tracks, project);
  const nextScene = scope === 'full' ? undefined : recordable[recordable.findIndex(scene => scene.id === scope) + 1];

  useEffect(() => {onBusy(busy);}, [busy, onBusy]);
  useEffect(() => {
    const current = scenes.find(scene => scene.id === currentSceneId);
    if (!busy && scope !== 'full' && (!take || take.saved) && current && current.recordable !== false) {
      setScope(current.id);
      if (take?.saved && take.scope !== current.id) {
        setTake(null);
        if (draftUrl.current) URL.revokeObjectURL(draftUrl.current);
        draftUrl.current = null;
      }
    }
  }, [currentSceneId]);
  useEffect(() => {if (!followingSpeech) setCuePage(activeIndex);}, [activeIndex, scope, phase]);
  const setStatus = (next: Phase) => {if (mounted.current) setPhase(next);};
  const restorePlayer = () => {
    player.current?.pause();
    if (restoreMuted.current) player.current?.mute(); else player.current?.unmute();
  };
  const release = (s: Session) => {
    cancelAnimationFrame(s.raf);
    if (s.timer) clearTimeout(s.timer);
    s.stream.getTracks().forEach(track => track.stop());
    if (s.context.state !== 'closed') void s.context.close().catch(() => undefined);
    if (pending.current?.stream === s.stream) pending.current = null;
    if (session.current === s) session.current = null;
    if (mounted.current) setLevel(0);
  };
  const stopRecording = () => {
    const s = session.current;
    if (!s || s.recorder.state === 'inactive') return;
    cancelAnimationFrame(s.raf);
    if (s.timer) clearTimeout(s.timer);
    setStatus('processing');
    s.recorder.stop();
    player.current?.pause();
  };
  const cancel = () => {
    token.current++;
    const s = session.current;
    if (s) {
      s.cancelled = true;
      if (s.recorder.state !== 'inactive') s.recorder.stop();
      release(s);
    }
    if (pending.current) {
      pending.current.stream.getTracks().forEach(track => track.stop());
      if (pending.current.context?.state !== 'closed') void pending.current.context?.close().catch(() => undefined);
      pending.current = null;
    }
    onDraft(null);
    onProject?.(take && !take.saved ? take.project : null);
    restorePlayer();
    setStatus('idle');
    setMessage('已取消，可以重新录制。');
  };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false; token.current++;
      const s = session.current;
      if (s) {s.cancelled = true; if (s.recorder.state !== 'inactive') s.recorder.stop(); release(s);}
      if (pending.current) {
        pending.current.stream.getTracks().forEach(track => track.stop());
        if (pending.current.context?.state !== 'closed') void pending.current.context?.close().catch(() => undefined);
      }
      if (draftUrl.current) URL.revokeObjectURL(draftUrl.current);
    };
  }, []);

  const nextCue = () => {
    const s = session.current;
    if (!s?.flexible || s.scope === 'full' || s.recorder.state !== 'recording') return;
    const lines = getVoiceCaptions(s.scope, s.project);
    const current = lines[s.cueIndex], next = lines[s.cueIndex + 1];
    const at = Math.floor((performance.now() - s.startedAt) / 1000 * FPS);
    if (!current || !next || at <= s.cueStart) return;
    s.timings.push({index: s.cueIndex, startFrame: s.cueStart, endFrame: at});
    s.cueIndex++;
    s.cueStart = at + Math.max(0, next.startFrame - current.endFrame);
    setCuePage(s.cueIndex);
    onSeek(Math.max(s.start, current.endFrame));
  };
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || !session.current?.flexible || session.current.scope === 'full' ||
        session.current.recorder.state !== 'recording' ||
        (event.target instanceof HTMLElement && (event.target.isContentEditable || event.target.closest('input, textarea, select, audio') ||
          (event.target.closest('button') && !event.target.closest('.voice-script-nav'))))) return;
      event.preventDefault();
      const s = session.current;
      if (s.cueIndex < getVoiceCaptions(s.scope, s.project).length - 1) nextCue(); else stopRecording();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });
  useEffect(() => {
    const onVisibility = () => {if (document.hidden && session.current?.recorder.state === 'recording') stopRecording();};
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const record = async () => {
    const request = ++token.current;
    setError(null); onDraft(null); setElapsed(0); setCountdown(3);
    const baseProject = take && !take.saved ? take.baseProject : project;
    const range = getVoiceRange(scope, baseProject);
    const lines = getVoiceCaptions(scope, baseProject);
    const flexible = mode === 'reading' && Boolean(onProject);
    onProject?.(null); setCuePage(0);
    player.current?.pause();
    takeAudio.current?.pause();
    restoreMuted.current = player.current?.isMuted() ?? false;
    player.current?.mute();
    setStatus('requesting'); setMessage('请允许浏览器使用麦克风。');
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        throw new Error('请用 Chrome 或 Edge，通过 localhost 或 HTTPS 打开录音页。');
      }
      const stream = await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true, noiseSuppression: true, autoGainControl: true}});
      if (request !== token.current || !mounted.current) {stream.getTracks().forEach(track => track.stop()); return;}
      pending.current = {stream};
      const context = new AudioContext();
      pending.current.context = context;
      await context.resume();
      if (request !== token.current || !mounted.current) return;
      const analyser = context.createAnalyser(); analyser.fftSize = 256;
      context.createMediaStreamSource(stream).connect(analyser);
      const mimeType = recorderMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? {mimeType, audioBitsPerSecond: 128000} : undefined);
      const s: Session = {recorder, stream, context, analyser, scope, start: range.from, frames: range.durationInFrames,
        chunks: [], cancelled: false, startedAt: 0, raf: 0, timer: null, project: baseProject, flexible,
        cueIndex: 0, cueStart: Math.max(0, (lines[0]?.startFrame ?? range.from) - range.from), timings: []};
      session.current = s;
      setMicrophone(stream.getAudioTracks()[0]?.label || '麦克风已连接');
      recorder.ondataavailable = event => {if (event.data.size) s.chunks.push(event.data);};
      recorder.onerror = () => {setError('麦克风录音中断，请重新录制。'); cancel();};
      recorder.onstop = async () => {
        const blob = new Blob(s.chunks, {type: recorder.mimeType});
        release(s);
        if (s.cancelled || request !== token.current || !mounted.current) return;
        restorePlayer();
        try {
          const wave = await recordingToWave(blob, s.flexible ? maxRecordingSeconds : s.frames / FPS);
          if (request !== token.current || !mounted.current) return;
          if (wave.seconds < .1) throw new Error('录音太短，请再录一次。');
          const frames = s.flexible ? Math.ceil(wave.seconds * FPS - 1e-6) : Math.floor(wave.seconds * FPS + 1e-6);
          const timings = s.timings.filter(timing => timing.startFrame < frames).map(timing =>
            ({...timing, endFrame: Math.min(timing.endFrame, frames)}));
          if (s.scope !== 'full' && lines[s.cueIndex] && frames > s.cueStart && !timings.some(timing => timing.index === s.cueIndex)) {
            timings.push({index: s.cueIndex, startFrame: s.cueStart, endFrame: frames});
          }
          const edited = s.flexible ? alignVoiceRecording(s.project, s.scope, frames, timings) : s.project;
          if (draftUrl.current) URL.revokeObjectURL(draftUrl.current);
          const url = URL.createObjectURL(wave.blob); draftUrl.current = url;
          onProject?.(s.flexible ? edited : null);
          setTake({scope: s.scope, startFrame: s.start, durationInFrames: frames, wav: wave.blob, url, saved: false,
            baseProject: s.project, project: edited, flexible: s.flexible});
          const extra = (edited.durationInFrames - s.project.durationInFrames) / FPS;
          setMessage(extra > 0 ? `录音完成，片段延长 ${extra.toFixed(1)} 秒。试听后保存到工程。` : '录音完成。先试听，满意后保存。');
          setStatus('idle');
        } catch (err) {setError(microphoneError(err)); setStatus('idle');}
      };
      onSeek(s.start);
      setStatus('countdown'); setMessage('倒计时结束后开始朗读。');
      const meter = new Float32Array(analyser.fftSize);
      let lastUpdate = 0;
      const tick = (now: number) => {
        if (s.cancelled || session.current !== s) return;
        analyser.getFloatTimeDomainData(meter);
        if (now - lastUpdate > 60) {
          const rms = Math.sqrt(meter.reduce((sum, value) => sum + value * value, 0) / meter.length);
          setLevel(Math.min(1, rms * 5));
          if (s.startedAt) setElapsed(s.flexible ? (now - s.startedAt) / 1000 : Math.min(s.frames / FPS, (now - s.startedAt) / 1000));
          lastUpdate = now;
        }
        if (s.startedAt) {
          const elapsedFrames = Math.floor((now - s.startedAt) / 1000 * FPS);
          let frameNow = s.start + elapsedFrames;
          if (s.flexible && s.scope !== 'full' && lines[s.cueIndex]) {
            const cue = lines[s.cueIndex];
            frameNow = Math.max(s.start, Math.min(cue.endFrame - 1, cue.startFrame + elapsedFrames - s.cueStart));
          }
          // The preview follows the recording clock, even if a 3D frame is slow.
          if (frameNow >= s.start + s.frames) {
            if (!s.flexible) {onSeek(s.start + s.frames - 1); stopRecording(); return;}
            frameNow = s.start + s.frames - 1;
          }
          if (player.current?.getCurrentFrame() !== frameNow) onSeek(frameNow);
        }
        s.raf = requestAnimationFrame(tick);
      };
      s.raf = requestAnimationFrame(tick);
      for (const count of [3, 2, 1]) {
        if (request !== token.current) return;
        setCountdown(count);
        await new Promise<void>(done => setTimeout(done, 1000));
      }
      if (request !== token.current) return;
      recorder.onstart = () => {
        s.startedAt = performance.now();
        setStatus('recording'); setMessage('正在录音，影片已静音。');
        s.timer = setTimeout(stopRecording, (s.flexible ? maxRecordingSeconds : s.frames / FPS) * 1000 + 100);
      };
      recorder.start(250);
    } catch (err) {
      if (request !== token.current || !mounted.current) return;
      const s = session.current; if (s) release(s);
      if (pending.current) {
        pending.current.stream.getTracks().forEach(track => track.stop());
        if (pending.current.context?.state !== 'closed') void pending.current.context?.close().catch(() => undefined);
        pending.current = null;
      }
      restorePlayer(); onProject?.(take && !take.saved ? take.project : null); setError(microphoneError(err)); setStatus('idle');
    }
  };

  const audition = async () => {
    if (!take) return;
    takeAudio.current?.pause();
    setError(null); setStatus('audition'); setMessage('跟画面试听中。');
    const request = ++token.current;
    restoreMuted.current = player.current?.isMuted() ?? false;
    player.current?.unmute();
    onDraft({id: 'draft', scope: take.scope, src: take.url, startFrame: take.startFrame,
      durationInFrames: take.durationInFrames, recordedAt: new Date().toISOString()});
    onSeek(take.startFrame);
    await new Promise<void>(done => requestAnimationFrame(() => requestAnimationFrame(() => done())));
    if (request !== token.current || !mounted.current) return;
    player.current?.play();
  };
  useEffect(() => {
    if (phase !== 'audition' || !take) return;
    if (frame >= take.startFrame + take.durationInFrames - 1) {
      onDraft(null); player.current?.pause();
      if (restoreMuted.current) player.current?.mute();
      setPhase('idle'); setMessage('试听完成，可以保存或重录。');
    }
  }, [frame, phase, take, onDraft]);

  const save = async () => {
    if (!take) return;
    setError(null); setStatus('saving');
    try {
      const value = await storage.save(take.scope, take.wav, take.flexible ?
        {timeline: voiceTimeline(take.project), expectedTimeline: voiceTimeline(take.baseProject)} : undefined);
      onManifest(parseVoiceManifest(value, project));
      onProject?.(null); onDraft(null);
      setTake({...take, saved: true}); setMessage('已保存到工程，配音已生效。');
    } catch (err) {setError(err instanceof Error ? err.message : '保存失败，可先下载 WAV 保留录音。');}
    finally {setStatus('idle');}
  };
  const remove = async () => {
    setStatus('saving'); setError(null);
    try {
      const value = await storage.remove(scope);
      onManifest(parseVoiceManifest(value, project)); setMessage('已从影片移除，原始录音仍保存在工程中。');
    } catch (err) {setError(err instanceof Error ? err.message : '移除失败');}
    finally {setStatus('idle');}
  };
  const discard = () => {
    onDraft(null); onProject?.(null); setTake(null); setCuePage(0);
    if (draftUrl.current) URL.revokeObjectURL(draftUrl.current);
    draftUrl.current = null; setMessage('选择镜头，跟着画面和字幕录音。');
  };
  const nextTake = () => {
    const previousScope = take?.scope;
    const advance = take?.saved && previousScope !== 'full';
    discard();
    if (advance) {
      const next = recordable[recordable.findIndex(scene => scene.id === previousScope) + 1];
      if (next) {setScope(next.id); onSeek(next.from);}
    }
  };

  return <div className="voice-recorder" data-testid="voice-recorder" data-phase={phase}>
    <div className="voice-intro"><strong>口播录音</strong><p>{mode === 'reading' ? '按自己的语速读，读完再停止。' : '跟着画面录制，满意后保存。'}</p></div>
    <div className="voice-progress"><span>已配音 {coverage} / {recordable.length || 1} {recordable.length ? '段' : '整片'}</span><span>真人录音</span></div>
    <div className="voice-settings"><label className="voice-label" htmlFor={scopeId}>录制范围
    <select id={scopeId} aria-label="录制范围" disabled={busy || Boolean(take && !take.saved)} value={scope}
      onChange={event => {discard(); setScope(event.target.value); onSeek(getVoiceRange(event.target.value, project).from);}}>
      <option value="full">整片 · {voiceDurationLabel(project.durationInFrames, FPS)}</option>
      {recordable.map(scene => <option key={scene.id} value={scene.id}>{scene.id} · {scene.title} · {voiceDurationLabel(scene.durationInFrames, FPS)}</option>)}
    </select></label>
    {onProject && <label className="voice-label">时间方式<select aria-label="录音时间方式" disabled={busy || Boolean(take && !take.saved)}
      value={mode} onChange={event => setMode(event.target.value as 'reading' | 'fixed')}>
      <option value="reading">按朗读节奏</option><option value="fixed">按画面时长</option></select></label>}</div>
    {onProject && <VoiceScriptEditor project={project} scope={scope} storage={storage} disabled={busy || Boolean(take && !take.saved)}
      onManifest={onManifest} onBusy={onBusy} onSeek={onSeek}/>}
    <div className="voice-script" aria-label="朗读稿">
      {!cues.length && <div className="voice-silent-intro">此范围没有提词稿，可以直接跟画面录音。</div>}
      {scope === 'full' && cues.length > 0 && cues[0].startFrame > 0 && <div className="voice-silent-intro">第一句从 {(cues[0].startFrame / FPS).toFixed(1)} 秒开始。</div>}
      {shownCue && <p data-active="true" className="current-line">{shownCue.text}</p>}
      {cues.length > 0 && <div className="voice-script-nav">
        <button disabled={busy || cuePage === 0} onClick={() => {setCuePage(cuePage - 1); onSeek(cues[cuePage - 1].startFrame);}}>上一句</button>
        <span>{Math.min(cuePage + 1, cues.length)} / {cues.length}</span>
        <button disabled={cuePage >= cues.length - 1 || (busy && !followingSpeech)} onClick={() => {
          if (followingSpeech) nextCue(); else {setCuePage(cuePage + 1); onSeek(cues[cuePage + 1].startFrame);}
        }}>{followingSpeech ? '读完，下一句' : '下一句'}</button>
      </div>}
    </div>
    <div className="voice-audio-input"><div className="voice-microphone"><MicIcon/><span title={microphone}>{microphone}</span></div>
    <div className="voice-meter" role="meter" aria-label="麦克风电平" aria-valuenow={Math.round(level * 100)} aria-valuemin={0} aria-valuemax={100}>
      {Array.from({length:20},(_,i) => <span key={i} className={level * 20 > i ? i > 16 ? 'hot' : 'lit' : ''}/>)}
    </div></div>
    <div className="voice-status" role="status">
      {phase === 'countdown' ? <><span className="voice-countdown">{countdown}</span><span>{message}</span></> :
        phase === 'recording' ? <><span className="record-dot"/><strong>{elapsed.toFixed(1)}s{mode === 'fixed' ? ` / ${(durationFrames / FPS).toFixed(1)}s` : ''}</strong>
          <span>{mode === 'reading' ? '读完再停止' : '正在录音'}</span></> :
          <span>{phase === 'processing' ? '正在整理录音…' : phase === 'saving' ? '正在保存到工程…' : message}</span>}
    </div>
    {error && <div className="voice-error" role="alert">{error}</div>}
    <div className="voice-actions">{phase === 'recording' ? <button className="voice-button stop" onClick={stopRecording}>停止录音</button> :
      !busy ? <button className="voice-button primary" onClick={() => void record()}><MicIcon/>{take ? '重新录制' : '开始录音'}</button> : null}
    {busy && phase !== 'processing' && phase !== 'saving' && <button className="voice-button secondary" onClick={cancel}>{phase === 'audition' ? '停止试听' : '取消录音'}</button>}</div>
    {take && !busy && <div className="voice-take" data-testid="voice-take">
      <div className="voice-take-heading"><span>{take.scope} · {(take.durationInFrames / FPS).toFixed(1)}s</span><span>{take.saved ? '已保存' : '尚未保存'}</span></div>
      <audio ref={takeAudio} controls src={take.url} preload="metadata" aria-label="仅试听录音" onPlay={() => player.current?.pause()}/>
      <div className="voice-take-actions"><button className="voice-button secondary" onClick={() => void audition()}>跟画面试听</button>
      <button className="voice-button primary" disabled={take.saved} onClick={() => void save()}>{take.saved ? '已保存并使用' : '保存并使用'}</button></div>
      <div className="voice-take-links"><a href={take.url} download={`${take.scope.replace(/[<>:"/\\|?*]/g, '_')}-voiceover.wav`}>下载 WAV</a><button onClick={nextTake}>{take.saved ? !nextScene ? '完成本次录音' : '录下一段' : '放弃这次'}</button></div>
    </div>}
    {saved && !take && !busy && <div className="voice-saved" data-testid="saved-voice">
      <div>这段已有配音 · {voiceSeconds(saved, project)}s</div>
      <div className="voice-take-links"><a href={assetUrl(saved.src)} download>下载录音</a><button onClick={() => void remove()}>移除配音</button></div>
    </div>}
    <p className="voice-local-note">{mode === 'reading' && scope !== 'full' && cues.length > 1 ? '空格切下一句，最后一句按空格停止。' :
      mode === 'reading' && scope === 'full' ? '整片可超时录制。逐句对齐请选分段录音。' : '保存后，预览与工程会使用你的配音。'}</p>
  </div>;
};
