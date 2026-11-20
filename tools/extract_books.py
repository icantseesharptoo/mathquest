"""Builds data/y8.js, data/y10.js and img/<course>/NNN.jpg from the two textbooks.
Year 8: whole book, 27 weeks x 6 lessons.  Year 10: chapters 1-12, 14, 15 (~59% of the pages), 27 weeks x 5 lessons.
Usage: python extract_books.py [--no-images]"""
import re, sys, json, pathlib, io
import pypdfium2 as pdfium

HERE = pathlib.Path(__file__).resolve().parent
SITE = HERE.parent
BOOKS = SITE.parent
NO_IMG = "--no-images" in sys.argv
WEEKS = 27

# ----------------------------------------------------------------- tables of contents
Y8_UNITS = [
 (1, "Integers", ["Factors, multiples and primes", "Multiplying and dividing integers", "Square roots and cube roots", "Indices"]),
 (2, "Expressions, formulae and equations", ["Constructing expressions", "Using expressions and formulae", "Expanding brackets", "Factorising", "Constructing and solving equations", "Inequalities"]),
 (3, "Place value and rounding", ["Multiplying and dividing by 0.1 and 0.01", "Rounding"]),
 (4, "Decimals", ["Ordering decimals", "Multiplying decimals", "Dividing by decimals", "Making decimal calculations easier"]),
 (5, "Angles and constructions", ["Parallel lines", "The exterior angle of a triangle", "Constructions"]),
 (6, "Collecting data", ["Data collection", "Sampling"]),
 (7, "Fractions", ["Fractions and recurring decimals", "Ordering fractions", "Subtracting mixed numbers", "Multiplying an integer by a mixed number", "Dividing an integer by a fraction", "Making fraction calculations easier"]),
 (8, "Shapes and symmetry", ["Quadrilaterals and polygons", "The circumference of a circle", "3D shapes"]),
 (9, "Sequences and functions", ["Generating sequences", "Finding rules for sequences", "Using the nth term", "Representing simple functions"]),
 (10, "Percentages", ["Percentage increases and decreases", "Using a multiplier"]),
 (11, "Graphs", ["Functions", "Plotting graphs", "Gradient and intercept", "Interpreting graphs"]),
 (12, "Ratio and proportion", ["Simplifying ratios", "Sharing in a ratio", "Ratio and direct proportion"]),
 (13, "Probability", ["Calculating probabilities", "Experimental and theoretical probabilities"]),
 (14, "Position and transformation", ["Bearings", "The midpoint of a line segment", "Translating 2D shapes", "Reflecting shapes", "Rotating shapes", "Enlarging shapes"]),
 (15, "Distance, area and volume", ["Converting between miles and kilometres", "The area of a parallelogram and a trapezium", "Calculating the volume of triangular prisms", "Calculating the surface area of triangular prisms and pyramids"]),
 (16, "Interpreting and discussing results", ["Interpreting and drawing frequency diagrams", "Time series graphs", "Stem-and-leaf diagrams", "Pie charts", "Representing data", "Using statistics"]),
]
Y8_LAST_PAGE = 387

Y10_UNITS = [
 (1, "Reviewing number concepts", ["Different types of numbers", "Multiples and factors", "Prime numbers", "Powers and roots", "Working with directed numbers", "Order of operations", "Rounding numbers"]),
 (2, "Making sense of algebra", ["Using letters to represent unknown values", "Substitution", "Simplifying expressions", "Working with brackets", "Indices"]),
 (3, "Lines, angles and shapes", ["Lines and angles", "Triangles", "Quadrilaterals", "Polygons", "Circles", "Construction"]),
 (4, "Collecting, organising and displaying data", ["Collecting and classifying data", "Organising data", "Using charts to display data"]),
 (5, "Fractions and standard form", ["Equivalent fractions", "Operations on fractions", "Percentages", "Standard form", "Your calculator and standard form", "Estimation"]),
 (6, "Equations and rearranging formulae", ["Further expansions of brackets", "Solving linear equations", "Factorising algebraic expressions", "Rearrangement of a formula"]),
 (7, "Perimeter, area and volume", ["Perimeter and area in two dimensions", "Three-dimensional objects", "Surface areas and volumes of solids"]),
 (8, "Introduction to probability", ["Basic probability", "Theoretical probability", "The probability that an event does not happen", "Possibility diagrams", "Combining independent and mutually exclusive events"]),
 (9, "Sequences and sets", ["Sequences", "Rational and irrational numbers", "Sets"]),
 (10, "Straight lines and quadratic equations", ["Straight lines", "Quadratic (and other) expressions"]),
 (11, "Pythagoras' theorem and similar shapes", ["Pythagoras' theorem", "Understanding similar triangles", "Understanding similar shapes", "Understanding congruence"]),
 (12, "Averages and measures of spread", ["Different types of average", "Making comparisons using averages and ranges", "Calculating averages and ranges for frequency data", "Calculating averages and ranges for grouped continuous data", "Percentiles and quartiles", "Box-and-whisker plots"]),
 (14, "Further solving of equations and inequalities", ["Simultaneous linear equations", "Linear inequalities", "Regions in a plane", "Linear programming", "Completing the square", "Quadratic formula", "Factorising quadratics where the coefficient of x2 is not 1", "Algebraic fractions"]),
 (15, "Scale drawings, bearings and trigonometry", ["Scale drawings", "Bearings", "Understanding the tangent, cosine and sine ratios", "Solving problems using trigonometry", "Sines, cosines and tangents of angles more than 90°", "The sine and cosine rules", "Area of a triangle", "Trigonometry in three dimensions"]),
]
Y10_OFFSET = 9          # pdf index = printed page + 9
Y10_NEXT_CHAPTER_AFTER = {12: 13, 14: 15, 15: 16}   # chapter that follows (to find where a chapter's last section ends)

def norm(t): return re.sub(r"[ \t]+", " ", t.replace("\r", ""))

class Book:
    def __init__(self, path):
        self.pdf = pdfium.PdfDocument(str(path))
        self.cache = {}
    def text(self, i):
        if i not in self.cache:
            self.cache[i] = norm(self.pdf[i].get_textpage().get_text_range())
        return self.cache[i]
    def find_heading(self, num, start, stop, title=None):
        numre = re.escape(num).replace(r"\.", r"\.\s?")
        stop = min(stop, start + 90)
        pat = re.compile(r"(?m)^\s*" + numre + r"\s+\S")
        for i in range(start, stop):
            if pat.search(self.text(i)): return i
        if title:                                   # fallback: heading is not at the start of a line
            w = re.escape(title.split()[0])
            pat = re.compile(r"(?<![\d.])" + numre + r"\s+" + w)
            for i in range(start, stop):
                if pat.search(self.text(i)): return i
        return None
    def find_chapter(self, n, start, stop):
        pat = re.compile(r"(?m)^\s*Chapter " + str(n) + r"\s*:")
        for i in range(start, stop):
            if pat.search(self.text(i)[:500]): return i
        return None

def y8_objectives(txt):
    m = re.search(r"In this section you will", txt)
    if not m: return []
    seg = txt[m.end():]
    items, cur = [], None
    for line in seg.splitlines():
        s = line.strip()
        if s.startswith("•"):
            if cur: items.append(cur)
            cur = s.lstrip("• ").strip()
        elif cur is not None and s and not re.match(r"^\d+\.\d+ ", s) and len(items) < 5 and not s.lower().startswith(("key words", "any ", "when ")):
            cur += " " + s
        else:
            if cur: items.append(cur); cur = None
            if items: break
    if cur: items.append(cur)
    return [re.sub(r"\s+", " ", x).strip(" .") for x in items][:4]

def y8_keywords(txt):
    m = re.search(r"Key words\s*\n", txt)
    if not m: return []
    out, cur = [], ""
    for raw in txt[m.end():].splitlines()[:16]:
        s = raw.strip()
        if not s or re.match(r"^[\d=+×÷()\- ]+$", s) or re.search(r"[=×.]", s): break
        if not cur and (s[0].isupper() or s.lower().startswith(("tip", "worked example", "example", "exercise"))): break
        cur += (" " if cur else "") + s
        if not raw.endswith(" "):
            out.append(cur); cur = ""
    if cur: out.append(cur)
    return [re.sub(r"\s+", " ", x) for x in out][:10]

def y10_chapter_info(txt):
    objs, keys = [], []
    for line in txt.splitlines():
        s = line.strip()
        if s.startswith("•"):
            t = s.lstrip("• ").strip()
            (keys if t[:1].isupper() else objs).append(t)
    return objs[:6], keys[:10]

def allocate(weights, total):
    s = sum(weights); raw = [w * total / s for w in weights]
    k = [max(1, int(x)) for x in raw]
    while sum(k) < total:
        i = max(range(len(k)), key=lambda j: raw[j] - k[j] if k[j] < weights[j] else -9); k[i] += 1
    while sum(k) > total:
        i = max(range(len(k)), key=lambda j: k[j] - raw[j] if k[j] > 1 else -9); k[i] -= 1
    return k

def chunks(pages, k):
    n = len(pages); out = []; a = 0
    for j in range(k):
        b = round((j + 1) * n / k)
        out.append(pages[a:b] or pages[-1:]); a = b
    return out

def build(cid, name, book, units, lessons_total, per_week, sections_info):
    secs = []        # flat list of dicts
    for sec in sections_info:
        secs.append(sec)
    weights = [len(s["pages"]) for s in secs]
    ks = allocate(weights, lessons_total)
    lessons = []
    for s, k in zip(secs, ks):
        parts = chunks(s["pages"], k)
        for pi, pg in enumerate(parts):
            lessons.append(dict(sec=s["num"], unit=s["unit"], unitTitle=s["unitTitle"], title=s["title"] + (f" (part {pi+1})" if k > 1 else ""),
                                part=pi + 1, parts=k, pages=pg, obj=s["obj"], keys=s["keys"] if pi == 0 else s["keys"]))
    assert len(lessons) == lessons_total, (len(lessons), lessons_total)
    weeks = []
    for w in range(lessons_total // per_week):
        ls = lessons[w * per_week:(w + 1) * per_week]
        ut = []
        for l in ls:
            if l["unitTitle"] not in ut: ut.append(l["unitTitle"])
        title = ut[0] if len(ut) == 1 else " · ".join(ut[:2]) if len(ut) == 2 else f"{ut[0]} · {ut[-1]}"
        for i, l in enumerate(ls): l["n"] = w * per_week + i + 1; l["week"] = w + 1; l["inweek"] = i + 1
        weeks.append(dict(n=w + 1, title=title, lessons=ls))
    return dict(id=cid, name=name, perWeek=per_week, weeks=weeks, units=[dict(n=u[0], title=u[1]) for u in units])

def y8():
    b = Book(BOOKS / "year-8-lb-4-pdf-free.pdf")
    # unit start pages
    starts = {}; lo = 9
    for u, title, secs in Y8_UNITS:
        p = b.find_heading(f"{u}.1", lo, Y8_LAST_PAGE + 1)
        starts[u] = p; lo = p
    sec_starts = []
    lo = 9
    for u, title, secs in Y8_UNITS:
        for si, st in enumerate(secs, 1):
            p = b.find_heading(f"{u}.{si}", lo, Y8_LAST_PAGE + 1, st)
            if p is None: raise SystemExit(f"cannot find {u}.{si} {st}")
            sec_starts.append((u, si, st, title, p)); lo = p
    info = []
    for idx, (u, si, st, ut, p) in enumerate(sec_starts):
        end = (sec_starts[idx + 1][4] - 1) if idx + 1 < len(sec_starts) else Y8_LAST_PAGE
        if end < p: end = p
        txt = b.text(p)
        info.append(dict(num=f"{u}.{si}", unit=u, unitTitle=ut, title=st, pages=list(range(p, end + 1)), obj=y8_objectives(txt), keys=y8_keywords(txt)))
    # unit openers (pages before first section of a unit) belong to the previous unit's last section end already; add the unit's opener pages to its first section
    for s in info:
        if s["num"].endswith(".1"):
            u = s["unit"]
            if u > 1:
                pass
    return build("y8", "Year 8", b, Y8_UNITS, WEEKS * 6, 6, info), b

def y10():
    b = Book(BOOKS / "cambridge-igcse-mathematics-core-and-extended.pdf")
    n = len(b.pdf)
    sec_starts = []; lo = 10
    for u, title, secs in Y10_UNITS:
        for si, st in enumerate(secs, 1):
            p = b.find_heading(f"{u}.{si}", lo, n, st)
            if p is None: raise SystemExit(f"cannot find {u}.{si} {st}")
            sec_starts.append((u, si, st, title, p)); lo = p
    first = {u: p for (u, si, st, t, p) in sec_starts if si == 1}
    opener = {u: p - 1 for u, p in first.items()}                  # chapter opener page precedes section 1
    order = [u[0] for u in Y10_UNITS]
    chap_end = {}
    for k, u in enumerate(order):
        if k + 1 < len(order) and order[k + 1] == u + 1:
            chap_end[u] = opener[order[k + 1]] - 1
        else:                                                      # next chapter is not part of the course: find its opener
            chap_end[u] = b.find_chapter(u + 1, first[u], n) - 1
    info = []
    for idx, (u, si, st, ut, p) in enumerate(sec_starts):
        last = idx + 1 == len(sec_starts) or sec_starts[idx + 1][0] != u
        end = chap_end[u] if last else sec_starts[idx + 1][4] - 1
        if end < p: end = p
        pages = list(range(opener[u], end + 1)) if si == 1 else list(range(p, end + 1))
        objs, keys = y10_chapter_info(b.text(opener[u])) if si == 1 else ([], [])
        info.append(dict(num=f"{u}.{si}", unit=u, unitTitle=ut, title=st, pages=pages, obj=objs, keys=keys))
    return build("y10", "Year 10", b, Y10_UNITS, WEEKS * 5, 5, info), b
def render(book, cid, pages):
    out = SITE / "img" / cid; out.mkdir(parents=True, exist_ok=True)
    done = 0
    for i in sorted(set(pages)):
        f = out / f"{i:03d}.jpg"
        if f.exists(): continue
        im = book.pdf[i].render(scale=1.5).to_pil().convert("RGB")
        im.save(f, "JPEG", quality=58, optimize=True)
        done += 1
        if done % 50 == 0: print(cid, "rendered", done, flush=True)

if __name__ == "__main__":
    (SITE / "data").mkdir(exist_ok=True)
    for fn, cid in ((y8, "y8"), (y10, "y10")):
        data, book = fn()
        (SITE / "data" / f"{cid}.js").write_text("window.COURSES=window.COURSES||{};window.COURSES['%s']=%s;\n" % (cid, json.dumps(data, ensure_ascii=False, separators=(",", ":"))), encoding="utf-8")
        pages = [p for w in data["weeks"] for l in w["lessons"] for p in l["pages"]]
        print(cid, "weeks", len(data["weeks"]), "lessons", sum(len(w["lessons"]) for w in data["weeks"]), "pages used", len(set(pages)), flush=True)
        if not NO_IMG: render(book, cid, pages)
