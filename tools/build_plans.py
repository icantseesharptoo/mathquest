"""Builds data/y8.js and data/y10.js from the school's Edupage teaching plans
(y8_plan_edupage.xls, y10_plan_edupage.xls in the folder above MathQuest).

Each chapter of the plan becomes a module; each row becomes a topic card.
MAP below links every topic to its problem generators, interactive demo and
(Year 8) YouTube videos.  Run:  python tools/build_plans.py"""
import re, json, html, pathlib

HERE = pathlib.Path(__file__).resolve().parent
SITE = HERE.parent
PLANS = SITE.parent

# Year 8 videos: playlist "Cambridge Lower Secondary Mathematics Book 8"
PLAYLIST_Y8 = "PLYl6YfuS48dsFXbJCmnv4WyVzcA6ACokX"
V = {  # playlist index -> (video id, short title)
 1: ("TuCN6Xk2nL8", "Ex 1.1 Factor trees & prime factors"), 2: ("ccLp1LR02Ng", "Ex 1.2 Multiplying negative integers"),
 3: ("UFyCEfsIVwA", "Ex 1.3 Squares & cubes (Q1–6)"), 4: ("iEL7NUTP2rU", "Ex 1.3 Squares & cubes (Q7–11)"), 5: ("bLW3N7CeRbQ", "Ex 1.3 Squares & cubes (Q12–14)"),
 6: ("oF-3rkl0nF4", "Ex 1.4 Indices (powers)"), 7: ("GFqEG1JsSBg", "Ex 2.1 Algebraic expressions (Q4–8)"), 8: ("YnR0R1NMEUA", "Ex 2.1 Algebraic expressions (Q9–15)"),
 9: ("xOAkg0WFQlo", "Ex 2.2 Expressions, formulae & equations"), 10: ("rb3SFBrGQ6k", "Ex 2.3 Expanding brackets"),
 11: ("En_2FSNZIjU", "Ex 2.4 Factorising (Q1–7)"), 12: ("93tYgrc4foo", "Ex 2.4 Factorising (Q8–13)"),
 13: ("3KU1RP7jcT8", "Ex 2.5 Linear equations & formulae (Q1–5)"), 14: ("c64n6of9O1c", "Ex 2.5 Linear equations & formulae (Q7–9)"),
 15: ("FChyZ2iMDdw", "Ex 2.6 Inequalities"), 16: ("h3xYRnAXM3M", "Ex 3.1 Multiplying & dividing by 0.1 and 0.01"),
 17: ("TzJbTsjd6wE", "Ex 3.2 Rounding & significant figures (Q1–4)"), 18: ("dbreQKBPsvI", "Ex 3.2 Significant figures (Q8–11)"), 19: ("j_ZBNKBMut4", "Ex 3.2 Significant figures (Q12–14)"),
 24: ("BSdPIgklpls", "Ex 5.1 Parallel lines (Q1–4)"), 25: ("sYlF4Wiz_aU", "Ex 5.1 Parallel lines (Q5–9)"), 26: ("9yMiAn3mnAg", "Ex 5.1 Parallel lines (Q10–13)"),
 27: ("UnMY2ypDDgs", "Ex 5.2 Exterior angle of a triangle (Q1–4)"), 28: ("QOxbk4sNqyE", "Ex 5.2 Exterior angle of a triangle (Q5–8)"), 29: ("4ATIsHztxMw", "Ex 5.2 Exterior angle of a triangle (Q9–14)"),
 30: ("WrLrd3RH0-Y", "Ex 5.3 Constructions (Q1–4)"), 31: ("S-NNNBkbJ2o", "Ex 5.3 Constructions (Q5–8)"), 32: ("FPTBCVHCmhE", "Ex 5.3 Constructions (Q9–12)"),
 33: ("UV-OnfWtAP4", "Ex 6.1 Collecting data (Q1–4)"), 34: ("TDAMHZnLSw4", "Ex 6.1 Collecting data (Q5–6)"), 35: ("dp3aIF6Cy2E", "Ex 6.2 Sampling"),
 36: ("lNU0rKPGvvc", "Ex 7.1 Comparing fractions"), 37: ("AXZC7GSM3dw", "Ex 7.2 Ordering fractions"), 38: ("VslqEiz2-TQ", "Ex 7.3 Multiplying fractions"),
 39: ("j1nPhMHwnUg", "Ex 8.1 Line & rotational symmetry"), 40: ("BBkqa1LKI7k", "Ex 8.1 Special quadrilaterals"),
 41: ("1MyFgDp7OgU", "Ex 8.2 Perimeter of a semicircle"), 42: ("pmkl_VgFkzY", "Ex 8.2 Perimeter of a quarter circle"), 43: ("wVB3IPcFA70", "Ex 8.3 Faces, edges & vertices"),
 44: ("4tJ8CgOKcHc", "Ex 10.1 Percentage increase & decrease (Q1–7)"), 45: ("aKOre6NHRDA", "Ex 10.1 Percentage increase & decrease (Q8–15)"), 46: ("ac6IW8xTxkI", "Ex 10.2 Using a multiplier"),
 47: ("REZXqzsMOIg", "Ex 12.1 Simplifying ratios (Q1–5)"), 48: ("lKQhy5wyzUY", "Ex 12.1 Simplifying ratios (Q6–9)"),
 49: ("j9oT1IMFMY0", "Ex 12.2 Sharing in a ratio (Q1–7)"), 50: ("JYbNCzGPVGY", "Ex 12.2 Sharing in a ratio (Q8–13)"), 51: ("cVpR5OZXekc", "Ex 12.3 Ratio & proportion"),
 52: ("tTDCkLRELnY", "Ex 13.1 Complementary events (Q1–6)"), 53: ("PledmIMDvUI", "Ex 13.1 Complementary events (Q7–9)"), 54: ("xgjOuN5vHEc", "Ex 13.2 Theoretical & experimental probability"),
 55: ("yUwG-UMrRhc", "Ex 14.2 Midpoint of a line segment (Q1–6)"), 56: ("eyRrimlxnGs", "Ex 14.2 Midpoint of a line segment (Q8–14)"),
 57: ("EEp67vGomKs", "Ex 14.3 Translating 2D shapes"), 58: ("KqncAmSb9XE", "Ex 14.4 Reflecting & rotating shapes"), 59: ("Gw1T-ClVwZ8", "Ex 14.5 Rotating shapes"),
 60: ("C3hqdKe2xYQ", "Ex 14.6 Enlargement"), 61: ("iWkik7G-o60", "Ex 16.1 Frequency tables & diagrams"), 62: ("AVaQd6D4XlU", "Ex 16.2 Time series graphs"),
}

# raw plan title (upper-cased) -> (display title, skills, demo, [video indexes])
MAP = {"y8": {
 "TYPES OF NUMBERS": ("Types of numbers", ["numberTypesMC", "squareCube"], None, []),
 "FACTORS AND PRIME FACTORS": ("Factors and prime factors", ["primeFactors", "hcfLcm", "factorCount", "isPrime"], None, [1]),
 "POWERS": ("Powers", ["indices", "indexSolve", "squareCube"], None, [6]),
 "TYPES OF ROOTS": ("Square roots and cube roots", ["squareCube", "indices"], None, [3, 4, 5]),
 "ORDER OF OPERATIONS": ("Order of operations", ["bidmas", "intOps"], None, [2]),
 "FRACTIONS SKILLS": ("Fraction skills", ["compareFrac", "addFrac", "subMixed", "mulIntMixed", "divIntFrac"], None, [36, 37, 38]),
 "ROUNDING": ("Rounding", ["rounding", "estimate"], None, [17]),
 "POWERS OF 10": ("Powers of 10 (× and ÷ by 0.1 and 0.01)", ["pow10"], None, [16]),
 "SIGNIFICANT FIGURES": ("Significant figures", ["y8_sigfig", "estimate"], None, [18, 19]),
 "TERMINOLOGY": ("Algebra terminology", ["y8_algTerms"], None, [9]),
 "ALGEBRA BASIC RULES": ("Algebra basic rules", ["simplifyExpr", "y8_algRules"], None, [7]),
 "EXPRESSIONS": ("Expressions and expanding brackets", ["buildExpr", "expand", "simplifyExpr"], None, [8, 10]),
 "SUBSTITUTIONS": ("Substitution", ["substitute"], None, []),
 "FORM AND MAKE EXPRESSIONS IN TERMS OF A VARIABLE": ("Forming expressions from words", ["y8_wordExpr", "buildExpr"], None, []),
 "FORMULAE": ("Formulae and changing the subject", ["rearrange", "substitute"], None, [13]),
 "FACTORISE LINEAR EXPRESSION": ("Factorising linear expressions", ["factorise"], None, [11, 12]),
 "EQUATION SOLUTIONFORM AND SOLVE EQUATION FROM WORD PROBLEM": ("Solving equations and forming them from word problems", ["linear", "linearFrac", "y8_wordEq"], None, [14]),
 "INEQUALITY": ("Inequalities", ["inequality"], None, [15]),
 "TYPES": ("Types of sequences", ["y8_seqArith", "y8_seqTerm", "seqNext"], "seq", []),
 "N TH TERM": ("The nth term", ["y8_nthMC", "seqFindNth", "y8_nthPattern"], "seq", []),
 "FIND VALUE OF N": ("Finding the value of n", ["seqUse", "y8_nthPattern"], "seq", []),
 "FIND SPECIFIC TERM": ("Finding a specific term", ["seqNth", "seqUse"], "seq", []),
 "REVIEW BASIC RELATIONSHIPS": ("Angle facts review: triangles and exterior angles", ["anglesBasic", "anglesVO", "y8_triAlg", "exterior"], "triangle", [27, 28, 29]),
 "PARALLEL LINES": ("Parallel lines", ["y8_parallel", "y8_parallelPair"], "parallel", [24, 25, 26]),
 "QUADRILATERALS AND PROPERTIES": ("Quadrilaterals and their properties", ["y8_quadProps", "quadAngle"], "polygon", [40, 39]),
 "POLYGONS EXT INTERIOR ANGLES": ("Polygons: exterior and interior angles", ["y8_polyAngles", "polygon"], "polygon", []),
 "BEARINGS": ("Bearings", ["y8_bearing"], "bearing", []),
 "TRANSFORMATIONS": ("Transformations", ["y8_transform", "translate", "reflect", "rotate", "enlarge", "midpoint"], "transform", [57, 58, 59, 60, 55, 56]),
 "SIMPLE CONSTRUCTIONS": ("Simple constructions", ["constructMC"], None, [30, 31, 32]),
 "VOCABULARY AND TYPES OF PRISMS": ("3D vocabulary, nets and types of prisms", ["y8_netMC", "shapes3d"], "net", [43]),
 "VOLUME SET UPS FOR CONVENTIONAL SHAPES": ("Volume of cuboids, prisms and cylinders", ["y8_cuboid", "y8_prism"], "solid", []),
 "SA SET UP FOR CONVENTIONAL SHAPES": ("Surface area", ["y8_netSA", "surfaceArea", "y8_cuboid"], "net", []),
 "REAL WORLD TYPES EG PIPE , PYRAMID": ("Real-world problems (pipes, tanks, pyramids)", ["y8_volReal", "y8_prism", "solids"], "solid", [41, 42]),
 "3 METHODS FOR DRAWING": ("Drawing straight-line graphs: 3 methods", ["y8_lineTable", "y8_lineGradInt", "y8_coverUp"], "line", []),
 "RECOGNISE GRAPH FROM PICTURE": ("Recognising a graph from its picture", ["y8_sketchMC", "y8_gradFromGraph", "lineIntercept"], "sketch", []),
 "REAL WORLD APPLICATIONS - EG FILL BOTTLE": ("Real-world graphs (e.g. filling a bottle)", ["y8_realLine", "y8_fillBottle", "y8_conversion"], "real", []),
 "PERCENTAGE CHANGE": ("Percentage change", ["percChange", "percentageChange"], "percent", [44, 45]),
 "APPLICATIONS": ("Percentage applications", ["percOf", "percOfAnother", "reversePerc", "simpleInterest"], "percent", []),
 "COMPOUND MULTIPLIERS": ("Multipliers and compound change", ["multiplier", "compound"], "percent", [46]),
 "BASICS - SIMPLIFYING": ("Ratio basics: simplifying", ["y8_ratioSimp", "y8_ratioOneN"], "ratio", [47, 48]),
 "APPLICATIONS@ratio": ("Ratio applications: sharing and scaling", ["y8_ratioShare", "y8_scale", "ratioDiff"], "ratio", [49, 50]),
 "RATES ; UNIT METHOD": ("Rates and the unitary method", ["proportion", "y8_bestBuy", "speedDist"], "ratio", [51]),
 "COLLECT DATA": ("Collecting data and sampling", ["collectMC", "sampling"], None, [33, 34, 35]),
 "MEAN MEDIAN MODE RANGE AND CALCULATIONS": ("Mean, median, mode and range", ["y8_avg", "missingMean"], "stats", []),
 "ORGANISE AND  DISPLAY ; SUMMARISE": ("Organising data: frequency tables", ["y8_freqTable", "freqMean"], "freq", [61]),
 "WAYS TO DISPLAY PI BAR STEM LEAF ; HISTOGRAM ; COMPARATIVE ; TIME SEQUENCE": ("Displaying data: pie, bar, stem-and-leaf, histogram, time series", ["y8_histRead", "pie", "stemLeaf", "timeSeries", "barRead"], "charts", [62]),
 "INTEPRET AND COMPARE 2 SETS OF DATA": ("Interpreting and comparing two sets of data", ["y8_compare", "y8_avg"], "stats", []),
 "BASICS  ; FINDING P FOR EVENT": ("Probability basics: finding P(event)", ["y8_probVocab", "probBag", "probNot"], "spinner", [52, 53]),
 "TABLE OF DATA  - RELATIVE FREQUENCY": ("Relative frequency", ["y8_relFreq", "probExp", "probExpected"], "spinner", [54]),
 "DIAGRAMS TO SHOW SAMPLE SPACES": ("Sample space diagrams and two-way tables", ["y8_sampleSpace", "y8_twoWay", "probDice"], "sample", []),
 "SIMPLE TREE DIGRAM TO SHOW OUTCOMES OF COMPOUND EVENTS.": ("Tree diagrams for compound events", ["y8_tree"], "tree", []),
 "PROGRESSION TEST PAST PAPERS FROM CAMBRIDGE SUPPORT SITE": ("Progression test practice (mixed review)", ["REVIEW"], None, []),
},
"y10": {
 "TYPES": ("Types of numbers", ["numberTypesMC", "squareCube"], None, []),
 "FACTORS AND PRIME FACTORS": ("Factors and prime factors", ["primeFactors", "hcfLcm", "factorCount"], None, []),
 "STANDARD FORM": ("Standard form", ["stdForm", "stdOrdinary", "stdMul"], None, []),
 "ROOTS AND POWERS": ("Roots and powers", ["squareCube", "indices", "zeroNegIndex"], None, []),
 "ORDER OF OPERATIONS": ("Order of operations", ["bidmas"], None, []),
 "BOUNDS": ("Upper and lower bounds", ["y10_bounds"], None, []),
 "RATIO AND RATE": ("Ratio and rate", ["ratioShare", "proportion", "speedDist", "y8_bestBuy"], "ratio", []),
 "PERCENTAGE": ("Percentages", ["percOf", "percChange", "percentageChange", "reversePerc"], "percent", []),
 "TIME": ("Time and timetables", ["y10_time"], None, []),
 "COMPOUND INTEREST": ("Simple and compound interest", ["compound", "simpleInterest"], "percent", []),
 "SUBSTITUTION": ("Substitution", ["substitute"], None, []),
 "EQUATION SOLUTION": ("Solving equations", ["linear", "linearFrac"], None, []),
 "SIMULTANEOU": ("Simultaneous equations", ["simultaneous", "y10_intersect"], None, []),
 "WORD SUM AND SET UP OF MODEL": ("Word problems: setting up a model", ["y8_wordEq", "buildExpr"], None, []),
 "EXPRESSIONS": ("Expressions", ["simplifyExpr", "buildExpr"], None, []),
 "INDEICES RULES": ("Rules of indices", ["indices", "zeroNegIndex", "indexSolve"], None, []),
 "EXPAND BRACKET": ("Expanding brackets", ["expand"], None, []),
 "BASIC FACTORS": ("Factorising", ["factorise", "quadFactor"], None, []),
 "LINEAR PATTERNS": ("Linear patterns (sequences)", ["seqNth", "seqFindNth", "seqUse"], "seq", []),
 "Y = MX+C SET UP ; DRAW GRAPHS": ("y = mx + c: setting up and drawing graphs", ["y8_lineTable", "y8_lineGradInt", "lineY"], "line", []),
 "INTERPRET STRAIGHT LINE FEATURES": ("Interpreting straight-line features", ["gradient", "lineIntercept", "lineParallel", "y8_sketchMC"], "sketch", []),
 "STRAIGHT LINE": ("Straight-line graphs", ["y8_lineGradInt", "y8_coverUp", "gradient", "lineParallel"], "line", []),
 "EQUATION FROM PICTURE": ("Equation from a picture of the graph", ["y8_sketchMC", "y8_gradFromGraph"], "sketch", []),
 "CURVED GRAPH": ("Curved graphs", ["y10_curve"], "curve", []),
 "PARABOLA HYPERBOLA": ("Parabolas and hyperbolas", ["y10_curveMC", "y10_curve"], "curve", []),
 "INTERSECTIONS": ("Intersections of graphs", ["y10_intersect", "simultaneous"], "curve", []),
 "INTERRET INTERSECTION TO SOLVE EQUATION AND FIND ROOTS": ("Using intersections to solve equations and find roots", ["y10_roots", "y10_intersect"], "curve", []),
 "RELATE TO STRAIGHT LINE": ("Coordinate geometry of straight lines", ["midpoint", "lineLength", "lineY"], "line", []),
 "GRADIENT / USE GRADIENT INTERCEPT METHO": ("Gradient and the gradient–intercept method", ["gradient", "y8_lineGradInt", "lineParallel"], "line", []),
 "INTERCEPT": ("Intercepts", ["lineIntercept", "y8_coverUp"], "line", []),
 "INTERSECTIONS@coord": ("Intersections of lines", ["y10_intersect", "simultaneous"], "sketch", []),
 "PYTHAGORAS AND FINDING SIDES": ("Pythagoras' theorem: finding sides", ["pythag"], None, []),
 "REAL WORLD PYTHAGORAS EG DISTANCE AND BEARINGS": ("Real-world Pythagoras (distances and bearings)", ["pythag", "lineLength", "bearing"], "bearing", []),
 "3 BASIC TRIG RATIOS": ("The three trigonometric ratios", ["trigSide", "trigAngle"], None, []),
 "FIND MISSING SIDES AND ANGLES": ("Finding missing sides and angles", ["trigSide", "trigAngle"], None, []),
 "BEARINGS - GEOMETRY LINK": ("Bearings and geometry", ["y8_bearing", "bearing"], "bearing", []),
 "TRIG AND AREAS": ("Trigonometry and areas (sine and cosine rules)", ["areaTrig", "sineRule", "cosineRule"], None, []),
 "UNITS AND CONVERSIONS": ("Units and conversions", ["y10_units", "milesKm", "hectares"], None, []),
 "AREAS AND PERIMETERS": ("Areas and perimeters", ["area2d", "lShape"], None, []),
 "2D SHAPES EG RE3CTANGLE / COMPOUND SHAPE": ("2D shapes and compound shapes", ["lShape", "area2d"], None, []),
 "CIRCLE AREAS AND PERIMETERS AND PARTS OF CIRCLE ; THE FORMULA FOR SA AND P": ("Circles, arcs and sectors", ["circleCalc", "y10_sector"], None, []),
 "BASIC 3 D SHAPES - SA AND VOLUME ; USE OF CORRECT FORMULA ; FIND UNKNOWN DIMENSION": ("3D shapes: surface area, volume and unknown dimensions", ["prismVolume", "surfaceArea", "y8_cuboid"], "solid", []),
 "LINK TO MEASUREMENT": ("Volume and surface area of solids", ["prismVolume", "surfaceArea", "solids"], "solid", []),
 "CORRECT FORMULAE": ("Choosing the correct formula", ["solids", "y8_prism"], "solid", []),
 "REAL WORLD INTERPRETIONS EG COMPOUND SHAPES": ("Real-world problems and compound solids", ["y8_volReal", "solids"], "solid", []),
 "PRACTICE PAST PAPER QUESTIONS EACH DAY": ("Past paper practice (mixed review)", ["REVIEW"], None, []),
}}
CHAPTER_TITLES = {"NUMBER BASICS": "Number basics", "ALGEBRA BASICS": "Algebra basics", "SEQUENCES": "Sequences", "GEOMETRY": "Geometry",
 "3D SHAPES": "3D shapes", "LINEAR GRAPHS": "Linear graphs", "PERCENTAGES": "Percentages", "RATIO AND PROPORTION": "Ratio and proportion",
 "STATISTICS": "Statistics", "PROBABILITY": "Probability", "REVIEW FOR END OF YEAR EXAMS": "Review for end-of-year exams",
 "NUMBER": "Number", "ALGEBRA": "Algebra", "GRAPHS": "Graphs", "CO-ORDINATE GEOMETRY": "Coordinate geometry", "TRIGONOMETRY": "Trigonometry",
 "MEASUREMENT": "Measurement", "3D SHAPES VOLUMES AND AREAS": "3D shapes: volumes and areas", "REVIEW FOR FINAL EXAMS": "Review for final exams"}
# a title used twice in a plan is told apart by the chapter it is in
DUP = {("RATIO AND PROPORTION", "APPLICATIONS"): "APPLICATIONS@ratio", ("CO-ORDINATE GEOMETRY", "INTERSECTIONS"): "INTERSECTIONS@coord"}


def rows(path):
    x = path.read_text(encoding="utf-8-sig")
    sheet = re.search(r"<Worksheet.*?</Worksheet>", x, re.S).group(0)
    for row in re.findall(r"<Row[^>]*>(.*?)</Row>", sheet, re.S):
        yield [html.unescape(re.sub(r"<[^>]+>", "", c)).strip() for c in re.findall(r"<Data[^>]*>(.*?)</Data>", row, re.S)]


def goals(text, per_line=False):
    out = []
    for line in text.split("\n"):
        t = re.sub(r"^\s*-\s*", "", line).strip()
        if not t: continue
        new = per_line or t.startswith("•") or re.match(r"^\d{1,2}[A-Z][a-z]\.\d\d", t) or not out or out[-1].rstrip().endswith(".")
        t = t.lstrip("• ").strip()
        if t.startswith("o "): out.append("– " + t[2:]); continue
        if new: out.append(t)
        else: out[-1] += " " + t
    return [g for g in out if len(g) > 3]


def build(cid, name):
    chapters, ch = [], None
    for r in rows(PLANS / f"{cid}_plan_edupage.xls"):
        if len(r) >= 3 and r[1] and not re.match(r"^\d+\.", r[1]) and r[1] not in ("Lesson",):
            title = r[1].strip()
            if title.upper() == "NO CHAPTER NAME": ch = None; continue
            ch = {"title": CHAPTER_TITLES.get(title.upper(), title.title()), "goals": goals(r[2], cid == "y10") if len(r) > 2 and len(r[2]) > 3 else [], "topics": []}
            chapters.append(ch); continue
        if ch is None or len(r) < 4 or not re.match(r"^\d+\.", r[1] or ""): continue
        raw = r[3].strip()
        if not raw: continue
        key = DUP.get((next(k for k, v in CHAPTER_TITLES.items() if v == ch["title"]), raw.upper()), raw.upper())
        if key not in MAP[cid]: raise SystemExit(f"{cid}: no MAP entry for {raw!r}")
        title, skills, demo, vids = MAP[cid][key]
        nums = [int(n) for n in re.findall(r"\d+", r[1])]
        les = f"{nums[0]}–{nums[1]}" if len(nums) > 1 else str(nums[0])
        t = {"title": title, "plan": raw, "lessons": les, "nLessons": (nums[1] - nums[0] + 1) if len(nums) > 1 else 1, "skills": skills}
        if demo: t["demo"] = demo
        if vids: t["videos"] = [list(V[i]) + [i] for i in vids]
        ch["topics"].append(t)
    chapters = [c for c in chapters if c["topics"]]
    data = {"id": cid, "name": name, "source": f"{cid}_plan_edupage.xls", "playlist": PLAYLIST_Y8 if cid == "y8" else None, "chapters": chapters}
    (SITE / "data" / f"{cid}.js").write_text("window.PLANS=window.PLANS||{};window.PLANS['%s']=%s;\n" % (cid, json.dumps(data, ensure_ascii=False, indent=0)), encoding="utf-8")
    print(cid, len(chapters), "chapters,", sum(len(c["topics"]) for c in chapters), "topics")


if __name__ == "__main__":
    build("y8", "Year 8")
    build("y10", "Year 10")
