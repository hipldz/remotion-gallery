"""Decode the shared follow GIF for frame-accurate Remotion playback."""

import json
from pathlib import Path

from PIL import Image


root = Path(__file__).resolve().parent.parent
sources = list((root.parent / "public").glob("*.gif"))
if len(sources) != 1:
    raise RuntimeError("Expected exactly one GIF in ../public.")

source = sources[0]
destination = root / "public/img/follow-lv2"
destination.mkdir(parents=True, exist_ok=True)
frames = []
elapsed = 0
with Image.open(source) as image:
    width, height = image.size
    for index in range(image.n_frames):
        image.seek(index)
        duration = image.info.get("duration", 100) or 100
        name = f"frame-{index:02d}.png"
        image.convert("RGBA").save(destination / name, optimize=True)
        frames.append({
            "src": f"img/follow-lv2/{name}",
            "startMs": elapsed,
            "endMs": elapsed + duration,
        })
        elapsed += duration

metadata = {
    "source": f"../public/{source.name}",
    "width": width,
    "height": height,
    "durationMs": elapsed,
    "frames": frames,
}
(root / "src/data/follow-gif.json").write_text(
    json.dumps(metadata, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)
print(f"Prepared {len(frames)} frames / {elapsed} ms from {source.name}.")
