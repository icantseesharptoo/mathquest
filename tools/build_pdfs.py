"""Builds the Year 7 handout PDFs (16 units + mixed review) by printing MathQuest's sheet view with headless Chrome/Edge.
Usage:  python build_pdfs.py            (from anywhere)   ->  ../../Handouts/Year7/"""
import subprocess, pathlib, urllib.parse, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT.parent / "Handouts" / "Year7"
OUT.mkdir(parents=True, exist_ok=True)
BROWSERS = [r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
            r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"]
browser = next(b for b in BROWSERS if pathlib.Path(b).exists())

# read unit ids / numbers / titles straight from topics.js so the two never drift apart
src = (ROOT / "topics.js").read_text(encoding="utf-8")
UNITS = [(m.group(1), int(m.group(2)), m.group(3)) for m in re.finditer(r"\{id:'(t\d\d)',u:(\d+),term:\d,icon:'[^']*',title:'([^']*)'", src)]
assert len(UNITS) == 16, UNITS

def slug(t): return re.sub(r"[^A-Za-z0-9]+", "", t.title())

import sys
only = {int(a) for a in sys.argv[1:]}          # optional: python build_pdfs.py 11 14 15  -> rebuild just those units
jobs = []
for tid, u, title in UNITS:
    if only and u not in only: continue
    base = f"Unit{u:02d}_{slug(title)}"
    for kind, seed, e, m, h in (("Handout", 7000 + u, 4, 4, 2), ("Homework", 7100 + u, 5, 5, 3)):
        jobs.append((f"{base}_{kind}.pdf", dict(topic=tid, e=e, m=m, h=h, seed=seed, key="none")))
        jobs.append((f"TEACHER_{base}_{kind}_AnswerKey.pdf", dict(topic=tid, e=e, m=m, h=h, seed=seed, key="only")))
if not only:
    jobs.append(("MixedReview_Handout.pdf", dict(topic="all", e=5, m=5, h=3, seed=7777, key="none")))
    jobs.append(("TEACHER_MixedReview_AnswerKey.pdf", dict(topic="all", e=5, m=5, h=3, seed=7777, key="only")))

for fn, q in jobs:
    url = (ROOT / "index.html").as_uri() + "#sheet?" + urllib.parse.urlencode(q)
    out = OUT / fn
    subprocess.run([browser, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                    f"--print-to-pdf={out}", "--virtual-time-budget=4000", url],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("ok", fn, out.stat().st_size // 1024, "KB", flush=True)
