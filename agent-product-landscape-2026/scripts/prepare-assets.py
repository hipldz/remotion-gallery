"""Import real screenshots using the exact deterministic crops in the storyboard."""
from pathlib import Path
import json
import sys
import hashlib
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1]).expanduser().resolve() if len(sys.argv) > 1 else ROOT / '回头看到2026年的Agent产品' / '图片和附件'
if not source.is_dir():
    raise SystemExit('Source directory does not exist: ' + str(source))
manifest = json.loads((ROOT / 'production' / 'assets.json').read_text(encoding='utf-8'))
destination = ROOT / 'public' / 'shots'
destination.mkdir(parents=True, exist_ok=True)
count = 0
provenance = []
for asset in manifest:
    original = ROOT / asset['originalPath'] if asset.get('originalPath') else source / asset['original']
    if not original.is_file():
        raise SystemExit('Required source screenshot missing: ' + str(original))
    with Image.open(original) as image:
        image.load()
        expected = (asset['width'], asset['height'])
        if image.size != expected:
            raise SystemExit(f"Size mismatch: {original.name}: {image.size}, expected {expected}; review crop coordinates first.")
        if 'crop' in asset:
            image = image.crop(tuple(asset['crop']))
        image.save(destination / asset['file'])
    print('Imported:', asset['file'])
    provenance.append({'id': asset['id'], 'source': str(original.relative_to(ROOT)), 'output': 'public/shots/' + asset['file'],
                       'sha256': hashlib.sha256(original.read_bytes()).hexdigest(), 'crop': asset.get('crop'), 'sourceUrl': asset.get('sourceUrl', ''), **({'downloadUrl': asset['downloadUrl']} if asset.get('downloadUrl') else {})})
    count += 1
(ROOT / 'production' / 'source-provenance.json').write_text(json.dumps(provenance, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Imported {count}/{len(manifest)} verified screenshots. image 7.png is WorkBuddy, not CodeBuddy; excluded.')
