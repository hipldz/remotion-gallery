"""Download OFL fonts once; all playback then uses local WOFF2 files."""
from fontTools.ttLib import TTFont
from fontTools import subset as font_subset
from pathlib import Path
from io import BytesIO
import re
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'public' / 'fonts'
DEST.mkdir(parents=True, exist_ok=True)
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'}


def fetch(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=90) as response:
        return response.read()


content = (ROOT / 'Storyboard.md').read_text(encoding='utf-8')
for file in (ROOT / 'src').rglob('*'):
    if file.suffix in ('.ts', '.tsx', '.css', '.json'):
        content += file.read_text(encoding='utf-8')
content += (ROOT / 'production' / 'assets.json').read_text(encoding='utf-8')
subset = ''.join(sorted(set(content + ''.join(chr(i) for i in range(32, 127)))))
subset = ''.join(c for c in subset if ord(c) >= 32 and c not in '\r\n\t')

families = [
    ('Outfit:wght@100..900', 'outfit.woff2', None, 'outfit'),
    ('JetBrains Mono:wght@100..800', 'jetbrains-mono.woff2', None, 'jetbrainsmono'),
]
# Fetch Noto directly: the CSS API may split Chinese into many unicode-range files.
# A single last CSS block would only contain Latin glyphs.
noto_data = fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf')
font = TTFont(BytesIO(noto_data))
options = font_subset.Options()
options.flavor = 'woff2'
options.layout_features = ['*']
subsetter = font_subset.Subsetter(options=options)
subsetter.populate(text=subset)
subsetter.subset(font)
font.flavor = 'woff2'
font.save(DEST / 'noto-sans-sc.woff2')
(DEST / 'notosanssc-OFL.txt').write_bytes(fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/OFL.txt'))
print('noto-sans-sc.woff2', (DEST / 'noto-sans-sc.woff2').stat().st_size, 'bytes')

for family, filename, text, license_folder in families:
    query = {'family': family, 'display': 'swap'}
    if text:
        query['text'] = text
    css = fetch('https://fonts.googleapis.com/css2?' + urllib.parse.urlencode(query)).decode('utf-8')
    blocks = re.findall(r'@font-face\s*\{[^}]+\}', css)
    # Latin block is last for multi-script families; Noto is a single text subset.
    block = blocks[-1]
    match = re.search(r'url\((https://[^)]+)\)', block)
    if not match:
        raise RuntimeError('Google Fonts did not return a WOFF2 URL for ' + family)
    data = fetch(match.group(1))
    if data[:4] != b'wOF2':
        raise RuntimeError('Expected WOFF2: ' + filename)
    (DEST / filename).write_bytes(data)
    license_data = fetch(f'https://raw.githubusercontent.com/google/fonts/main/ofl/{license_folder}/OFL.txt')
    (DEST / (license_folder + '-OFL.txt')).write_bytes(license_data)
    print(filename, len(data), 'bytes')
print('Noto Sans SC text subset:', len(subset), 'characters')
