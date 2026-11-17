"""Builds all handout PDFs by printing the MathQuest sheet view with headless Edge/Chrome.
Usage:  python build_pdfs.py            (run from anywhere)"""
import subprocess, pathlib, urllib.parse, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT.parent / "Handouts"
OUT.mkdir(exist_ok=True)
BROWSERS = [r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
            r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
            r"C:\Program Files\Google\Chrome\Application\chrome.exe"]
browser = next(b for b in BROWSERS if pathlib.Path(b).exists())

JOBS = []
for y, tag in ((7, "Y7_Angles"), (10, "Y10_LinearEquations")):
    for name, seed, e, m, h in (("ClassHandout_A", 7001, 4, 4, 2), ("ClassHandout_B", 7002, 4, 4, 2), ("Homework", 7101, 5, 5, 3)):
        JOBS.append((f"{tag}_{name}.pdf", dict(year=y, e=e, m=m, h=h, seed=seed, key="none")))
        JOBS.append((f"TEACHER_{tag}_{name}_AnswerKey.pdf", dict(year=y, e=e, m=m, h=h, seed=seed, key="only")))

for fn, q in JOBS:
    url = (ROOT / "index.html").as_uri() + "#sheet?" + urllib.parse.urlencode(q)
    out = OUT / fn
    subprocess.run([browser, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                    f"--print-to-pdf={out}", "--virtual-time-budget=4000", url],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("ok", out.name, out.stat().st_size // 1024, "KB")
