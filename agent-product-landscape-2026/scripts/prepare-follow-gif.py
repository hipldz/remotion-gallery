"""Prepare the supplied GIF as a lossless atlas for frame-synced Remotion playback."""

import hashlib
import json
import math
from pathlib import Path

from PIL import Image


def main():
    root = Path(__file__).resolve().parents[1]
    source = root.parent / 'public' / 'Chibi-Bilibili-Follow-Level-Up-Animation.gif'
    original = source.read_bytes()
    digest = hashlib.sha256(original).hexdigest()
    frames = []
    timings = []
    elapsed = 0
    with Image.open(source) as gif:
        width, height = gif.size
        for index in range(gif.n_frames):
            gif.seek(index)
            # Pillow applies each frame's disposal before composing the next frame.
            frames.append(gif.convert('RGBA').copy())
            duration = max(1, gif.info.get('duration', 100))
            timings.append({'fromMs': elapsed, 'toMs': elapsed + duration})
            elapsed += duration

    columns = math.ceil(math.sqrt(len(frames)))
    rows = math.ceil(len(frames) / columns)
    atlas = Image.new('RGBA', (width * columns, height * rows))
    for index, frame in enumerate(frames):
        atlas.paste(frame, ((index % columns) * width, (index // columns) * height))

    relative_atlas = 'img/follow-lv2/frames.webp'
    destination = root / 'public' / relative_atlas
    destination.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(destination, 'WEBP', lossless=True, method=6, exact=True)
    # Check both the derivative and the original before writing playback metadata.
    with Image.open(destination) as decoded:
        decoded = decoded.convert('RGBA')
        for index, frame in enumerate(frames):
            x = (index % columns) * width
            y = (index // columns) * height
            restored = decoded.crop((x, y, x + width, y + height))
            assert restored.tobytes() == frame.tobytes(), f'Atlas changed frame {index}'
    assert hashlib.sha256(source.read_bytes()).hexdigest() == digest

    metadata = {
        'source': '../public/' + source.name,
        'sourceSha256': digest,
        'atlas': relative_atlas,
        'width': width,
        'height': height,
        'columns': columns,
        'rows': rows,
        'durationMs': elapsed,
        'frames': timings,
    }
    (root / 'src' / 'data' / 'follow-gif.json').write_text(
        json.dumps(metadata, indent=2, ensure_ascii=False) + '\n', encoding='utf-8'
    )
    print(f'Prepared {len(frames)} lossless frames / {elapsed} ms. Original GIF preserved.')


if __name__ == '__main__':
    main()
