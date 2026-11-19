"""Build a local Noto Sans SC subset covering this project's actual text.

Optional regeneration: python -m pip install fonttools brotli
Then run: python scripts/prepare-fonts.py
"""
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "public" / "fonts"
SOURCE = "https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf"


def fetch(url):
    request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(request, timeout=45) as response:
        return response.read()


content = (ROOT / "storyboard.md").read_text(encoding="utf-8")
for path in (ROOT / "src").rglob("*"):
    if path.suffix in (".ts", ".tsx", ".json", ".css"):
        content += path.read_text(encoding="utf-8")
content += "".join(chr(i) for i in range(32, 127))
font = TTFont(BytesIO(fetch(SOURCE)))
needed = {ord(c) for c in content if "\u4e00" <= c <= "\u9fff"}
if needed - set(font.getBestCmap()):
    raise RuntimeError("Source font does not cover all Chinese characters")
options = subset.Options()
options.layout_features = ["*"]
subsetter = subset.Subsetter(options=options)
subsetter.populate(text="".join(sorted(set(content))))
subsetter.subset(font)
font.flavor = "woff2"
DEST.mkdir(parents=True, exist_ok=True)
font.save(DEST / "noto-sans-sc.woff2")
print(f"Noto Sans SC: {len(needed)} Chinese glyphs, {(DEST / 'noto-sans-sc.woff2').stat().st_size} bytes")
