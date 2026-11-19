"""Builds every Year 7 worksheet PDF by printing MathQuest's sheet view with headless Chrome/Edge.
One unit = one week = 6 lessons x 40 min.  For each week:  lesson 1-5 worksheets, lesson 6 unit test, a weekly homework sheet
(+ a teacher answer key for each).  Output: ../../Handouts/Year7/WeekNN_Title/ .
Usage:  python build_pdfs.py            all weeks
        python build_pdfs.py 5 14       only weeks 5 and 14"""
import subprocess, pathlib, urllib.parse, re, sys, tempfile, shutil
from concurrent.futures import ThreadPoolExecutor

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT.parent / "Handouts" / "Year7"
BROWSERS = [r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
            r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"]
browser = next(b for b in BROWSERS if pathlib.Path(b).exists())

topics_js = (ROOT / "topics.js").read_text(encoding="utf-8")
lessons_js = (ROOT / "lessons.js").read_text(encoding="utf-8")
UNITS = [(m.group(1), int(m.group(2)), m.group(3)) for m in re.finditer(r"\{id:'(t\d\d)',u:(\d+),term:\d,icon:'[^']*',title:'([^']*)'", topics_js)]
assert len(UNITS) == 16, UNITS
# lesson titles = first quoted string on each " ['Title',..." line inside lessons.js
LESSONS = {}
cur = None
for line in lessons_js.splitlines():
    m = re.match(r"^(t\d\d):\[", line)
    if m: cur = m.group(1); LESSONS[cur] = []
    m = re.match(r"^ \['([^']*)'", line)
    if m and cur: LESSONS[cur].append(m.group(1))
assert len(LESSONS) == 16 and all(len(v) == 5 for v in LESSONS.values()), {k: len(v) for k, v in LESSONS.items()}

def slug(t): return re.sub(r"[^A-Za-z0-9]+", "", t.title())[:34]
only = {int(a) for a in sys.argv[1:]}

jobs = []
for tid, u, title in UNITS:
    if only and u not in only: continue
    d = OUT / f"Week{u:02d}_{slug(title)}"
    d.mkdir(parents=True, exist_ok=True)
    for n in range(1, 7):
        if n < 6:
            name = f"Lesson{n}_{slug(LESSONS[tid][n - 1])}"
            q = dict(topic=tid, lesson=n, e=3, m=3, h=2, seed=u * 100 + n)     # 8 questions ~ 12-15 min of a 40-min lesson
        else:
            name = "Lesson6_UnitTest"
            q = dict(topic=tid, lesson=6, e=5, m=6, h=4, seed=u * 100 + 6, theory=0, challenge=0)
        jobs.append((d / f"{name}.pdf", dict(q, key="none")))
        jobs.append((d / f"TEACHER_{name}_AnswerKey.pdf", dict(q, key="only")))
    q = dict(topic=tid, lesson=0, e=5, m=5, h=3, seed=u * 100 + 9)
    jobs.append((d / "WeeklyHomework.pdf", dict(q, key="none")))
    jobs.append((d / "TEACHER_WeeklyHomework_AnswerKey.pdf", dict(q, key="only")))
if not only:
    OUT.mkdir(parents=True, exist_ok=True)
    q = dict(topic="all", lesson=0, e=5, m=5, h=3, seed=7777)
    jobs.append((OUT / "MixedReview.pdf", dict(q, key="none")))
    jobs.append((OUT / "TEACHER_MixedReview_AnswerKey.pdf", dict(q, key="only")))

def run(job):
    out, q = job
    url = (ROOT / "index.html").as_uri() + "#sheet?" + urllib.parse.urlencode(q)
    prof = tempfile.mkdtemp(prefix="mq_")
    try:
        subprocess.run([browser, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", f"--user-data-dir={prof}",
                        f"--print-to-pdf={out}", "--virtual-time-budget=4000", url],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=180)
    finally:
        shutil.rmtree(prof, ignore_errors=True)
    return out.name

if __name__ == "__main__":
    print(len(jobs), "PDFs to build", flush=True)
    with ThreadPoolExecutor(max_workers=4) as ex:
        for i, name in enumerate(ex.map(run, jobs), 1):
            print(f"[{i}/{len(jobs)}] {name}", flush=True)
