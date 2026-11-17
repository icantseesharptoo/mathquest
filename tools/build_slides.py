"""Builds the two lesson decks (Year 7 Angles, Year 10 Linear equations) as .pptx
Run:  python build_slides.py     (needs python-pptx, matplotlib)"""
import math, pathlib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Arc, Polygon
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

HERE = pathlib.Path(__file__).resolve().parent
IMG = HERE / "img"; IMG.mkdir(exist_ok=True)
OUT = HERE.parent.parent / "Slides"; OUT.mkdir(exist_ok=True)

INDIGO = RGBColor(0x31, 0x2E, 0x81); BRAND = RGBColor(0x4F, 0x46, 0xE5); INK = RGBColor(0x1F, 0x29, 0x37)
GREEN = RGBColor(0x16, 0xA3, 0x4A); AMBER = RGBColor(0xF5, 0x9E, 0x0B); RED = RGBColor(0xDC, 0x26, 0x26)
LIGHT = RGBColor(0xEE, 0xF2, 0xFF); WHITE = RGBColor(255, 255, 255); MUTE = RGBColor(0x6B, 0x72, 0x80)
ORANGE = "#d9480f"; PURPLE = "#4f46e5"

# ------------------------------------------------------------------ images
def _save(fig, name, tight=True):
    p = IMG / name
    if tight: fig.savefig(p, dpi=200, transparent=True, bbox_inches="tight", pad_inches=0.05)
    else: fig.savefig(p, dpi=200, transparent=True)
    plt.close(fig); return str(p)

def rays(name, parts, labels, start=0, unk=(), line=False, lr=0.58, size=(4.4, 3.2)):
    fig, ax = plt.subplots(figsize=size); ax.set_aspect("equal"); ax.axis("off")
    b = [start]
    for p in parts: b.append(b[-1] + p)
    if line: ax.plot([-1.15, 1.15], [0, 0], "k", lw=3, solid_capstyle="round")
    for i, a in enumerate(b):
        if line and i in (0, len(b) - 1): continue
        if i == len(b) - 1 and abs(b[-1] - b[0] - 360) < 1e-6: continue
        ax.plot([0, math.cos(math.radians(a))], [0, math.sin(math.radians(a))], "k", lw=3, solid_capstyle="round")
    for i in range(len(parts)):
        col = ORANGE if i in unk else PURPLE
        ax.add_patch(Arc((0, 0), .36, .36, theta1=b[i], theta2=b[i + 1], color=col, lw=3))
        m = math.radians((b[i] + b[i + 1]) / 2)
        ax.text(lr * math.cos(m), lr * math.sin(m), labels[i], ha="center", va="center", fontsize=17 if len(labels[i]) < 7 else 14,
                fontweight="bold", color=ORANGE if i in unk else "#1f2937")
    ax.plot([0], [0], "ko", ms=5)
    ax.set_xlim(-1.25, 1.25); ax.set_ylim(-0.1 if line else -1.15, 1.15)
    return _save(fig, name)

def tri(name, A, B, labels, unk=(), equal=(), size=(4.4, 3.2)):
    C = 180 - A - B
    b = math.sin(math.radians(B)) / math.sin(math.radians(C))
    pts = [(0, 0), (1, 0), (b * math.cos(math.radians(A)), b * math.sin(math.radians(A)))]
    fig, ax = plt.subplots(figsize=size); ax.set_aspect("equal"); ax.axis("off")
    ax.add_patch(Polygon(pts, closed=True, fc="#eef2ff", ec="#111827", lw=3, joinstyle="round"))
    cx = sum(p[0] for p in pts) / 3; cy = sum(p[1] for p in pts) / 3
    for i, p in enumerate(pts):
        dx, dy = cx - p[0], cy - p[1]; d = math.hypot(dx, dy)
        off = .24 if (A, B, C)[i] >= 50 else .34
        ax.text(p[0] + dx / d * off, p[1] + dy / d * off, labels[i], ha="center", va="center", fontsize=16,
                fontweight="bold", color=ORANGE if i in unk else "#1f2937")
        ax.text(p[0] - dx / d * .09, p[1] - dy / d * .09, "ABC"[i], ha="center", va="center", fontsize=11, color="#9ca3af")
    for e in equal:
        a, c = pts[e], pts[(e + 1) % 3]; mx, my = (a[0] + c[0]) / 2, (a[1] + c[1]) / 2
        dx, dy = c[0] - a[0], c[1] - a[1]; d = math.hypot(dx, dy)
        ax.plot([mx + dy / d * .03, mx - dy / d * .03], [my - dx / d * .03, my + dx / d * .03], "k", lw=3)
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    ax.set_xlim(min(xs) - .15, max(xs) + .15); ax.set_ylim(min(ys) - .1, max(ys) + .1)
    return _save(fig, name)

def angle_demo(name, a, label):
    fig, ax = plt.subplots(figsize=(2.4, 2)); ax.set_aspect("equal"); ax.axis("off")
    ax.plot([0, 1], [0, 0], "k", lw=3); ax.plot([0, math.cos(math.radians(a))], [0, math.sin(math.radians(a))], "k", lw=3)
    ax.add_patch(Arc((0, 0), .5, .5, theta1=0, theta2=a, color=ORANGE, lw=3))
    ax.text(0.5, -0.32, label, ha="center", fontsize=15, fontweight="bold", color="#1f2937")
    ax.set_xlim(-1.1, 1.2); ax.set_ylim(-.6, 1.1)
    return _save(fig, name)

def eq_img(name, latex, size=26, w=6, h=1.0):
    fig = plt.figure(figsize=(w, h)); fig.text(.5, .5, f"${latex}$", ha="center", va="center", fontsize=size, color="#1f2937")
    return _save(fig, name)

def steps_img(name, rows, size=24, w=9, h=None):
    """rows = [(latex, comment)] — aligned working with comments on the right."""
    h = h or 0.9 * len(rows)
    fig = plt.figure(figsize=(w, h))
    for i, (lt, cm) in enumerate(rows):
        y = 1 - (i + .5) / len(rows)
        fig.text(.30, y, f"${lt}$", ha="center", va="center", fontsize=size, color="#1f2937")
        if cm: fig.text(.56, y, cm, ha="left", va="center", fontsize=size * .62, color="#16a34a", fontweight="bold")
    return _save(fig, name, tight=False)

def steps_pic(s, name, rows, size, y, w=10, x=None, rowh=.9):
    path = steps_img(name, rows, size, w, rowh * len(rows))
    s.shapes.add_picture(path, Inches((13.333 - w) / 2 if x is None else x), Inches(y), width=Inches(w))

def balance(name, left, right):
    fig, ax = plt.subplots(figsize=(7, 3.4)); ax.axis("off"); ax.set_xlim(-4, 4); ax.set_ylim(-1.4, 2.4)
    ax.add_patch(Polygon([(-.4, -1.2), (.4, -1.2), (0, 0)], fc="#6366f1", ec="#312e81", lw=2))
    ax.plot([-3.3, 3.3], [.6, .6], color="#312e81", lw=6, solid_capstyle="round"); ax.plot([0, 0], [0, .6], color="#312e81", lw=6)
    for x0, t in ((-2.6, left), (2.6, right)):
        ax.plot([x0 - 1.2, x0, x0 + 1.2], [-.1, .6, -.1], color="#6b7280", lw=2)
        ax.add_patch(Polygon([(x0 - 1.4, -.1), (x0 + 1.4, -.1), (x0 + 1.1, -.45), (x0 - 1.1, -.45)], fc="#fbbf24", ec="#b45309", lw=2))
        ax.text(x0, .55 + 0.5, t, ha="center", va="center", fontsize=24, fontweight="bold", color="#1f2937",
                bbox=dict(boxstyle="round,pad=.35", fc="#e0e7ff", ec="#6366f1", lw=2))
    return _save(fig, name)

# ------------------------------------------------------------------ pptx helpers
def new_deck():
    p = Presentation(); p.slide_width = Inches(13.333); p.slide_height = Inches(7.5); return p

def _bg(s, color):
    f = s.background.fill; f.solid(); f.fore_color.rgb = color

def tb(s, x, y, w, h, text, size=24, bold=False, color=INK, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, font="Calibri"):
    t = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h)); tf = t.text_frame; tf.word_wrap = True
    tf.vertical_anchor = anchor
    lines = text if isinstance(text, list) else [text]
    for i, ln in enumerate(lines):
        para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        r = para.add_run(); r.text = ln; r.font.size = Pt(size); r.font.bold = bold; r.font.color.rgb = color; r.font.name = font
        para.alignment = align; para.space_after = Pt(size * .4)
    return t

def bullets(s, x, y, w, h, items, size=24, color=INK):
    t = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h)); tf = t.text_frame; tf.word_wrap = True
    for i, it in enumerate(items):
        para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        r = para.add_run(); r.text = "•  " + it; r.font.size = Pt(size); r.font.color.rgb = color; r.font.name = "Calibri"
        para.space_after = Pt(size * .5)
    return t

def box(s, x, y, w, h, fill=LIGHT, line=BRAND):
    r = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    r.fill.solid(); r.fill.fore_color.rgb = fill; r.line.color.rgb = line; r.line.width = Pt(2.5); r.adjustments[0] = .08
    r.shadow.inherit = False; return r

def slide(deck, title, notes="", tag=None, tagcolor=BRAND):
    s = deck.slides.add_slide(deck.slide_layouts[6]); _bg(s, RGBColor(0xF8, 0xFA, 0xFC))
    band = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, deck.slide_width, Inches(1.15)); band.fill.solid(); band.fill.fore_color.rgb = INDIGO; band.line.fill.background()
    tb(s, .5, .15, 10.5, .9, title, 34, True, WHITE, anchor=MSO_ANCHOR.MIDDLE)
    if tag:
        b = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(11.0), Inches(.3), Inches(2.1), Inches(.55)); b.fill.solid(); b.fill.fore_color.rgb = tagcolor; b.line.fill.background()
        b.text_frame.text = tag; pr = b.text_frame.paragraphs[0]; pr.alignment = PP_ALIGN.CENTER
        pr.runs[0].font.size = Pt(18); pr.runs[0].font.bold = True; pr.runs[0].font.color.rgb = WHITE
    if notes: s.notes_slide.notes_text_frame.text = notes
    return s

def pic(s, path, x, y, w=None, h=None):
    kw = {}
    if w: kw["width"] = Inches(w)
    if h: kw["height"] = Inches(h)
    return s.shapes.add_picture(path, Inches(x), Inches(y), **kw)

def title_slide(deck, title, sub, line3, emoji):
    s = deck.slides.add_slide(deck.slide_layouts[6]); _bg(s, INDIGO)
    tb(s, .8, 1.3, 11.5, 1.2, emoji, 72)
    tb(s, .8, 2.6, 11.7, 1.5, title, 54, True, WHITE)
    tb(s, .8, 4.3, 11.7, .8, sub, 28, False, RGBColor(0xC7, 0xD2, 0xFE))
    tb(s, .8, 5.3, 11.7, .8, line3, 20, False, RGBColor(0xA5, 0xB4, 0xFC))
    return s

def objectives(deck, lo, success, ru, notes=""):
    s = slide(deck, "Today’s goals 🎯", notes)
    box(s, .5, 1.4, 12.3, 1.7); tb(s, .8, 1.5, 11.8, 1.5, ["Learning objective", lo], 24, True, INDIGO)
    tb(s, .6, 3.3, 6.2, .6, "Success criteria — I can…", 26, True, BRAND)
    bullets(s, .6, 3.9, 7.2, 3.4, success, 22)
    box(s, 8.2, 3.3, 4.6, 3.8, WHITE, AMBER)
    tb(s, 8.4, 3.4, 4.2, .6, "Key words / Ключевые слова", 20, True, AMBER)
    tb(s, 8.4, 4.0, 4.2, 3.0, ru, 20)
    return s

# ====================================================================== YEAR 7
def build_y7():
    d = new_deck()
    title_slide(d, "Angles", "Lines, points & triangles · Year 7 Mathematics", "Cambridge Lower Secondary · Geometry & Measure · Unit 5 “Angles and constructions”", "📐")
    objectives(d, "Use angle facts to find unknown angles on a line, at a point, in triangles and quadrilaterals.",
        ["name acute, right, obtuse and reflex angles", "use ‘180° on a line’ and ‘360° at a point’", "use vertically opposite angles", "use ‘180° in a triangle’ and ‘360° in a quadrilateral’", "write a short calculation to explain my answer"],
        ["angle — угол", "vertex — вершина", "straight line — прямая", "vertically opposite — вертикальные", "sum / total — сумма", "protractor — транспортир"],
        "1 min. Read the objective aloud. Ask: ‘Where do you see angles in real life?’ (roofs, clocks, football pitch, ramps).")
    # starter
    s = slide(d, "Starter · Name that angle! (5 min)", "Answers: 35° acute, 90° right, 130° obtuse, 250° reflex. Use mini-whiteboards: students write the word. Ask a student to estimate before revealing the number.", "STARTER", GREEN)
    for i, (a, w) in enumerate(((35, "35°"), (90, "90°"), (130, "130°"), (250, "250°"))):
        if a == 250:
            fig, ax = plt.subplots(figsize=(2.4, 2)); ax.set_aspect("equal"); ax.axis("off")
            ax.plot([0, 1], [0, 0], "k", lw=3); ax.plot([0, math.cos(math.radians(a))], [0, math.sin(math.radians(a))], "k", lw=3)
            ax.add_patch(Arc((0, 0), .5, .5, theta1=0, theta2=a, color=ORANGE, lw=3)); ax.text(0, -1.25, w, ha="center", fontsize=15, fontweight="bold")
            ax.set_xlim(-1.1, 1.2); ax.set_ylim(-1.5, 1.1); path = _save(fig, f"y7_ang_{i}.png")
        else: path = angle_demo(f"y7_ang_{i}.png", a, w)
        pic(s, path, .5 + i * 3.15, 1.8, w=2.9)
    tb(s, .6, 5.2, 12, 1.2, "Is it acute (< 90°), right (90°), obtuse (90°–180°) or reflex (> 180°)?   Write your answer on your whiteboard.", 26, True, INDIGO)
    tb(s, .6, 6.3, 12, .7, "Then: estimate — roughly how big is each angle? ✋ Show me with your arms!", 22, False, MUTE)
    # fact 1
    s = slide(d, "Fact 1 · Angles on a straight line", "Demo in the MathQuest app: Learn tab → Angle Explorer → ‘Straight line’. Drag the slider; the two angles always add to 180°. Worked: 125° + x = 180°, so x = 180° − 125° = 55°.", "180°", BRAND)
    pic(s, rays("y7_f1.png", [125, 55], ["125°", "x"], unk=(1,), line=True, lr=.62), .5, 1.5, w=6.2)
    box(s, 7.1, 1.6, 5.7, 4.9); tb(s, 7.3, 1.7, 5.3, .8, "Angles on a straight line add up to 180°", 26, True, INDIGO)
    tb(s, 7.3, 3.0, 5.3, 3.3, ["125° + x = 180°", "x = 180° − 125°", "x = 55°"], 32, True, BRAND)
    # fact 2
    s = slide(d, "Fact 2 · Angles around a point", "120 + 95 + 80 = 295; 360 − 295 = 65. Ask: ‘What would the total be if we walked all the way round once?’ (full turn).", "360°", BRAND)
    pic(s, rays("y7_f2.png", [120, 95, 80, 65], ["120°", "95°", "80°", "x"], start=15, unk=(3,), lr=.6), .5, 1.4, w=6.2)
    box(s, 7.1, 1.6, 5.7, 4.9); tb(s, 7.3, 1.7, 5.3, .8, "Angles around a point add up to 360°", 26, True, INDIGO)
    tb(s, 7.3, 3.0, 5.3, 3.3, ["120° + 95° + 80° + x = 360°", "295° + x = 360°", "x = 65°"], 28, True, BRAND)
    # fact 3
    s = slide(d, "Fact 3 · Vertically opposite angles", "Draw the X shape. The ‘top’ and ‘bottom’ angles are equal; the ‘left’ and ‘right’ angles are equal. Key idea: both are 180° minus the same angle.", "a = a", BRAND)
    pic(s, rays("y7_f3.png", [70, 110, 70, 110], ["70°", "110°", "x", "110°"], start=20, unk=(2,), lr=.55), .5, 1.4, w=6.2)
    box(s, 7.1, 1.6, 5.7, 4.9); tb(s, 7.3, 1.7, 5.3, .8, "Vertically opposite angles are equal", 26, True, INDIGO)
    tb(s, 7.3, 3.0, 5.3, 3.3, ["x = 70°", "(opposite to 70°)", "Check: 70° + 110° = 180° ✔"], 28, True, BRAND)
    # worked example
    s = slide(d, "Worked example · put the facts together", "Cover the answers; let students suggest each step. a = 180 − 65 = 115 (straight line). b = 65 (vertically opposite to 65). c = 115 (vertically opposite to a, or straight line with b).", "EXAMPLE", AMBER)
    pic(s, rays("y7_we.png", [65, 115, 65, 115], ["65°", "a", "b", "c"], start=25, unk=(1, 2, 3), lr=.56), .5, 1.4, w=6.2)
    bullets(s, 7.1, 1.7, 5.9, 4.8, ["a = 180° − 65° = 115°  (angles on a straight line)", "b = 65°  (vertically opposite 65°)", "c = 115°  (vertically opposite a)", "Total check: 65 + 115 + 65 + 115 = 360° ✔"], 24)
    # mini quiz
    s = slide(d, "Show me! · Mini-whiteboards (4 min)", "Answers on next slide: 142°, 130°, 60°. Give 20 seconds per question, then ‘3-2-1 show me’.", "QUIZ", GREEN)
    pic(s, rays("y7_q1.png", [38, 142], ["38°", "x"], unk=(1,), line=True, lr=.62, size=(3.6, 2.6)), .3, 1.8, w=4.1)
    pic(s, rays("y7_q2.png", [130, 100, 130], ["130°", "100°", "x"], start=40, unk=(2,), lr=.62, size=(3.6, 2.6)), 4.6, 1.7, w=4.1)
    pic(s, tri("y7_q3.png", 72, 48, ["72°", "48°", "x"], unk=(2,), size=(3.6, 2.6)), 8.9, 1.8, w=4.1)
    tb(s, .5, 5.2, 12.3, 1, "Q1 line      Q2 point      Q3 triangle   —   Find x. Write the calculation, then the answer.", 24, True, INDIGO)
    s = slide(d, "Show me! · Answers", "", "ANSWERS", GREEN)
    bullets(s, .8, 1.7, 11.5, 4.5, ["Q1:  38° + x = 180°   →   x = 142°", "Q2:  130° + 100° + x = 360°   →   230° + x = 360°   →   x = 130°",
                                   "Q3:  72° + 48° + x = 180°   →   x = 60°"], 28)
    # triangles
    s = slide(d, "Fact 4 · Triangles and quadrilaterals", "Tear-the-corners demo: tear the three corners of a paper triangle and place them side by side on a line → 180°. Isosceles: dashes on the sides mean those sides are equal, and the angles opposite them are equal (base angles). 2x + 40 = 180 → x = 70.", "180° / 360°", BRAND)
    pic(s, tri("y7_f4.png", 50, 65, ["50°", "65°", "x"], unk=(2,), size=(3.8, 2.8)), .6, 1.4, h=3.3)
    pic(s, tri("y7_f4b.png", 70, 70, ["x", "x", "40°"], unk=(0, 1), equal=(1, 2), size=(3.8, 2.8)), 5.0, 1.4, h=3.3)
    box(s, 8.9, 1.5, 4.1, 4.9); tb(s, 9.05, 1.55, 3.8, 4.8, ["Triangle: 180°", "Quadrilateral: 360°", "Isosceles: two equal base angles"], 22, True, INDIGO)
    tb(s, .5, 4.9, 8.2, 1.8, ["50° + 65° + x = 180°  →  x = 65°", "x + x + 40° = 180°  →  2x = 140°  →  x = 70°"], 24, True, BRAND)
    # algebra
    s = slide(d, "Level up · Angles with algebra", "Solution: (2x + 10) + (x + 20) = 180; 3x + 30 = 180; 3x = 150; x = 50. The angles are 110° and 70°. Link to Year 10 / linear equations: same idea!", "BOSS", RED)
    pic(s, rays("y7_alg.png", [110, 70], ["(2x + 10)°", "(x + 20)°"], line=True, lr=.7), .4, 1.5, w=6.4)
    tb(s, 7.1, 1.6, 5.9, 5, ["Angles on a line add to 180°:", "(2x + 10) + (x + 20) = 180", "3x + 30 = 180", "3x = 150", "x = 50", "Check: 110° + 70° = 180° ✔"], 26, True, BRAND)
    # gacha
    s = slide(d, "Game time! 🎰 MathQuest", "Open MathQuest/index.html on the projector (use the 📽️ Projector button). Pick Year 7 → Gacha tab → ‘Summon a problem’. Students answer on whiteboards; the class wins coins together. Use ‘+200 demo coins’ to show the Prize Capsule pull and the pity bar. Individual play: students can open the same file on their devices.", "PLAY", GREEN)
    bullets(s, .6, 1.5, 7.6, 5.5, ["Summon a Problem Capsule: the rarer the capsule, the harder the problem (Boss = 3× coins!)", "Answer correctly → win coins 🪙 and XP", "Spend 50 🪙 on a Prize Capsule → collect Math Monsters", "10 pulls without an Epic? The next one is guaranteed!", "Streak bonus: 3 in a row +5 🪙, 5 in a row +10 🪙"], 24)
    box(s, 8.5, 1.6, 4.4, 4.8, WHITE, AMBER); tb(s, 8.7, 1.8, 4.0, 4.5, ["🔮 Common 55% · easy", "🔮 Rare 30% · medium", "🔮 Epic 12% · hard", "👑 Legendary 3% · BOSS", "", "Prize rarity:", "60% · 25% · 11% · 4%"], 22, True, INDIGO)
    # handout
    s = slide(d, "Your handout (12 min)", "Hand out Y7_Angles_ClassHandout_A / _B (alternate versions to neighbours). Differentiate: all start at Level 1; fast finishers go to Level 3 and the Challenge corner (protractor drawing from book section 5.3). Circulate and use the 3-question check: ‘What fact did you use? Why? Is the answer sensible?’", "WORK", AMBER)
    bullets(s, .6, 1.5, 7.5, 5.5, ["🟢 Level 1 — warm-up: one fact, one step", "🟡 Level 2 — more steps, isosceles, equal angles", "🔴 Level 3 — angles with algebra (boss round)", "🏆 Challenge corner — measure & draw with a protractor", "Show your calculation for every answer!", "Stuck? Look at the Remember box → ask a partner → ask me"], 24)
    box(s, 8.5, 1.6, 4.4, 4.8, WHITE, GREEN); tb(s, 8.7, 1.8, 4.0, 4.5, ["⏱ 12 minutes", "", "Mark your own with the answer key on the board.", "", "Score ___ / 10"], 24, True, INDIGO)
    # plenary
    s = slide(d, "Plenary · Spot the mistake 🔍", "Mistake: Jo used 360° (angles at a point) instead of 180° (angles on a straight line). Correct: 100° + x = 180° → x = 80°. Ask students to explain WHICH fact applies to WHICH diagram.", "THINK", RED)
    pic(s, rays("y7_mis.png", [100, 80], ["100°", "x"], unk=(1,), line=True, lr=.62), .5, 1.5, w=6.0)
    box(s, 7.1, 1.7, 5.8, 4.2, WHITE, RED)
    tb(s, 7.3, 1.8, 5.4, 4.0, ["Jo wrote:", "100° + x = 360°", "x = 260°", "", "What is wrong? Fix it!"], 26, True, INK)
    tb(s, .6, 5.9, 12, 1, "Hint: which total do you use for a straight line?", 22, False, MUTE)
    # exit
    s = slide(d, "Exit ticket 🎟️", "Collect on the way out. Possible answers: yes/no/sort-of. Use to plan next lesson (parallel lines, drawing).", "EXIT", GREEN)
    bullets(s, .8, 1.6, 11.5, 4.5, ["Write the 4 angle facts in your own words (180°, 360°, equal, 180°/360°).", "Find x:  x + 2x + 60° = 180°", "Rate yourself:  😟  😐  🙂  😄", "Homework: MathQuest → PDF Worksheets (Homework sheet) or the printed Homework."], 26)
    d.save(OUT / "Y7_Angles_Lesson_Slides.pptx")

# ====================================================================== YEAR 10
def build_y10():
    d = new_deck()
    title_slide(d, "Solving linear equations", "Year 10 Mathematics · Algebra", "Cambridge IGCSE Mathematics (0580) · Solve linear equations: unknowns on one or both sides, brackets and fractions", "⚖️")
    objectives(d, "Solve linear equations, including brackets, fractions and the unknown on both sides.",
        ["undo operations using inverse operations", "keep an equation balanced", "expand brackets and clear fractions", "collect x-terms when x is on both sides", "check my answer by substitution"],
        ["equation — уравнение", "solve — решить", "expand — раскрыть скобки", "inverse operation — обратная операция", "term — слагаемое", "substitute — подставить"],
        "1 min. Link: ‘Today’s goal is the skill behind almost every formula and word problem in IGCSE.’")
    # starter
    s = slide(d, "Starter · Think of a number (5 min)", "Answer: 5 (work backwards: 13 − 3 = 10; 10 ÷ 2 = 5). Second puzzle: ×3 then −4 = 17 → 7. Ask students to explain HOW they got it: ‘working backwards’ = inverse operations.", "STARTER", GREEN)
    box(s, .6, 1.6, 12.1, 2.1, WHITE, GREEN)
    tb(s, .9, 1.8, 11.5, 1.8, ["“I think of a number, double it and add 3.", "The answer is 13. What was my number?”"], 32, True, INDIGO)
    pic(s, eq_img("y10_st.png", r"2x + 3 = 13", 40, 7, 1.2), 3, 4.0, w=7)
    tb(s, .6, 5.8, 12, 1, "Talk to your partner: how did you find it? What did you do first?", 24, False, MUTE)
    # balance
    s = slide(d, "The big idea · an equation is a balance ⚖️", "Show the balance. Do: ‘take 3 from both sides’ — the scale stays level. Emphasize: whatever you do to one side you must do to the other. Demo in MathQuest: Year 10 Learn tab → ‘Guess & check’ to test values of x.", "IDEA", BRAND)
    pic(s, balance("y10_bal.png", "x + 3", "7"), .4, 1.5, w=6.6)
    box(s, 7.3, 1.6, 5.6, 4.9); tb(s, 7.5, 1.7, 5.2, .8, "Golden rule", 30, True, INDIGO)
    tb(s, 7.5, 2.6, 5.2, 3.8, ["Whatever you do to one side, you must do to the other side.", "", "x + 3 = 7", "x + 3 − 3 = 7 − 3", "x = 4"], 24, True, BRAND)
    # inverse
    s = slide(d, "Inverse operations — the ‘undo’ buttons", "Quick whiteboard check: ‘Operation ×5 — what undoes it?’ etc. Mention order: undo +/− first, then × / ÷ (reverse of BIDMAS).", "TOOLKIT", BRAND)
    rows = [("Operation", "Inverse (undo)"), ("+ 5", "− 5"), ("− 3", "+ 3"), ("× 4", "÷ 4"), ("÷ 2", "× 2")]
    tbl = s.shapes.add_table(5, 2, Inches(2.2), Inches(1.8), Inches(8.9), Inches(3.6)).table
    for i, (a, b) in enumerate(rows):
        for j, v in enumerate((a, b)):
            c = tbl.cell(i, j); c.text = v; p = c.text_frame.paragraphs[0]; p.alignment = PP_ALIGN.CENTER; p.runs[0].font.size = Pt(30); p.runs[0].font.bold = (i == 0)
    tb(s, 1.5, 5.8, 10.5, 1, "Undo + and − first, then × and ÷.", 28, True, INDIGO, PP_ALIGN.CENTER)
    # two step
    s = slide(d, "Example 1 · Two-step equations", "Check at the end: 3 × 5 + 5 = 20 ✔. Ask: ‘Why do we subtract 5 BEFORE dividing by 3?’", "EXAMPLE", AMBER)
    steps_pic(s, "y10_e1.png", [("3x + 5 = 20", ""), ("3x = 15", "−5 from both sides"), ("x = 5", "÷3 on both sides")], 30, 1.7, rowh=1.1)
    tb(s, 1.5, 5.4, 10, 1, "Check: 3 × 5 + 5 = 20 ✔", 28, True, GREEN)
    # both sides
    s = slide(d, "Example 2 · x on both sides", "Rule of thumb: collect x-terms on the side where the coefficient stays positive (here the left). Check: 5×4+7 = 27; 2×4+19 = 27 ✔.", "EXAMPLE", AMBER)
    steps_pic(s, "y10_e2.png", [("5x + 7 = 2x + 19", ""), ("3x + 7 = 19", "−2x from both sides"), ("3x = 12", "−7 from both sides"), ("x = 4", "÷3 on both sides")], 30, 1.5)
    tb(s, 1.5, 5.5, 10, 1, "Check:  5(4) + 7 = 27   and   2(4) + 19 = 27 ✔", 26, True, GREEN)
    # brackets
    s = slide(d, "Example 3 · Brackets", "Common errors: forgetting to multiply the second term (3x − 2 instead of 3x − 6) and sign errors with negative numbers. Check: 3(11−2)=27, 2(11)+5=27 ✔.", "EXAMPLE", AMBER)
    steps_pic(s, "y10_e3.png", [(r"3(x - 2) = 2x + 5", ""), (r"3x - 6 = 2x + 5", "expand the bracket"), (r"x - 6 = 5", "−2x from both sides"), (r"x = 11", "+6 on both sides")], 30, 1.5)
    tb(s, 1.5, 5.5, 10, 1, "Check:  3(11 − 2) = 27   and   2(11) + 5 = 27 ✔", 26, True, GREEN)
    # fractions
    s = slide(d, "Example 4 · Fractions", "Cross-multiplying = multiplying both sides by 3 and by 4. Answer 13/5 = 2.6. Stress that non-integer answers are allowed; give exact fraction or decimal. Check: (2.6+3)/4 = 1.4; (5.2−1)/3 = 1.4 ✔.", "BOSS", RED)
    steps_pic(s, "y10_e4.png", [(r"\frac{x+3}{4} = \frac{2x-1}{3}", ""), (r"3(x+3) = 4(2x-1)", "cross-multiply"), (r"3x + 9 = 8x - 4", "expand"), (r"13 = 5x", "collect: +4, −3x"), (r"x = \frac{13}{5} = 2.6", "÷5")], 28, 1.4, rowh=1.0)
    # negative
    s = slide(d, "Example 5 · Negative answers", "Check: 7 − 2(−5) = 17; −5 + 22 = 17 ✔. Don’t panic about negatives! Alternative: move x-terms to the right so it stays positive.", "BOSS", RED)
    steps_pic(s, "y10_e5.png", [(r"7 - 2x = x + 22", ""), (r"7 = 3x + 22", "+2x on both sides"), (r"-15 = 3x", "−22 from both sides"), (r"x = -5", "÷3")], 30, 1.5)
    tb(s, 1.5, 5.5, 10, 1, "Check:  7 − 2(−5) = 17   and   −5 + 22 = 17 ✔", 26, True, GREEN)
    # quick fire
    s = slide(d, "Show me! · Quick-fire boards (4 min)", "Answers: 19, 9, 8, 7. Use ‘3-2-1 show me’. If many get Q4 wrong, redo the ‘x on both sides’ example.", "QUIZ", GREEN)
    for i, (lt, y) in enumerate((("x - 7 = 12", 1.6), ("4x = 36", 2.7), ("2x + 9 = 25", 3.8), ("6x - 5 = 4x + 9", 4.9))):
        box(s, 2.5, y, 8.3, .95, WHITE, BRAND)
        pic(s, eq_img(f"y10_qf{i}.png", lt, 30, 5, .7), 3.2, y + .08, h=.75)
        tb(s, 2.7, y + .12, .8, .7, f"{i+1}", 30, True, BRAND)
    s = slide(d, "Show me! · Answers", "", "ANSWERS", GREEN)
    bullets(s, 1.2, 1.7, 11, 4.5, ["1)  x = 19", "2)  x = 9", "3)  2x = 16  →  x = 8", "4)  6x − 5 = 4x + 9  →  2x − 5 = 9  →  2x = 14  →  x = 7"], 30)
    # error hunt
    s = slide(d, "Spot the mistake 🔍", "Mistake: the bracket was expanded wrongly — 3(x + 4) = 3x + 12, not 3x + 4. Correct: 3x + 12 = 21 → 3x = 9 → x = 3. Alternative: divide by 3 first: x + 4 = 7 → x = 3.", "THINK", RED)
    box(s, .8, 1.6, 6.0, 3.8, WHITE, RED)
    tb(s, 1.0, 1.7, 5.6, 3.6, ["Sam solves  3(x + 4) = 21", "", "3x + 4 = 21", "3x = 17", "x = 17/3"], 28, True, INK)
    tb(s, 7.2, 1.8, 5.6, 3.6, ["Find Sam’s mistake.", "Then solve it correctly.", "Check by substituting your answer!"], 26, True, INDIGO)
    # real life
    s = slide(d, "Real-life modelling · perimeter", "Solution: 2[(2x+3)+(x−1)] = 40 → 2(3x+2) = 40 → 3x+2 = 20 → 3x = 18 → x = 6. Length = 2(6)+3 = 15 cm, width = 6−1 = 5 cm. Ask: ‘Why must we check the width is positive?’", "APPLY", AMBER)
    box(s, .8, 1.6, 6.5, 3.2, WHITE, AMBER)
    tb(s, 1.0, 1.7, 6.1, 3.0, ["A rectangle has", "length (2x + 3) cm", "width (x − 1) cm", "perimeter 40 cm. Find x."], 28, True, INK)
    steps_pic(s, "y10_e6.png", [(r"2[(2x+3)+(x-1)] = 40", ""), (r"2(3x+2) = 40", "simplify inside"), (r"3x + 2 = 20", "÷2"), (r"x = 6", "")], 24, 1.6, w=5.6, x=7.4, rowh=.9)
    tb(s, .8, 5.3, 12, 1.2, "Check: length 15 cm, width 5 cm → 2 × (15 + 5) = 40 ✔", 28, True, GREEN)
    # gacha
    s = slide(d, "Game time! 🎰 MathQuest", "Open MathQuest/index.html (📽️ Projector). Select Year 10 → Gacha → ‘Summon a problem’. Teams solve on mini-whiteboards; reveal the worked solution step by step. Students can also play individually on their devices; progress is saved in the browser.", "PLAY", GREEN)
    bullets(s, .6, 1.5, 7.6, 5.5, ["Summon a Problem Capsule: rarity = difficulty", "Boss problems pay ×3 coins and give a free-pull ticket 🎟️", "Spend 50 🪙 on a Prize Capsule → collect Math Monsters", "Use hints (−5 🪙) wisely, or open the step-by-step solution", "Random numbers every time — no two students get the same problem!"], 24)
    box(s, 8.5, 1.6, 4.4, 4.8, WHITE, AMBER); tb(s, 8.7, 1.8, 4.0, 4.5, ["🔮 Common 55% · easy", "🔮 Rare 30% · medium", "🔮 Epic 12% · hard", "👑 Legendary 3% · BOSS", "", "Prize rarity:", "60% · 25% · 11% · 4%"], 22, True, INDIGO)
    # handout
    s = slide(d, "Your handout (12 min)", "Hand out Y10_LinearEquations_ClassHandout_A / _B alternately. Early finishers: Level 3 + Challenge corner (error hunt and ‘create your own’). Remind: write every line of working; check by substitution.", "WORK", AMBER)
    bullets(s, .6, 1.5, 7.5, 5.5, ["🟢 Level 1 — one- and two-step equations", "🟡 Level 2 — brackets, fractions, x on both sides", "🔴 Level 3 — boss round: perimeter, fractions, decimals", "🏆 Challenge — error hunt & make your own", "One line per step. Equals signs lined up!", "Always CHECK by substituting"], 24)
    box(s, 8.5, 1.6, 4.4, 4.8, WHITE, GREEN); tb(s, 8.7, 1.8, 4.0, 4.5, ["⏱ 12 minutes", "", "Self-mark with the answer key.", "", "Score ___ / 10"], 24, True, INDIGO)
    # exit
    s = slide(d, "Exit ticket 🎟️", "Answers: x = 4 (2x + 1 = 9, 2x = 8). Collect on the way out; sort into ‘secure / nearly / not yet’.", "EXIT", GREEN)
    bullets(s, .8, 1.6, 11.5, 4.5, ["Solve:  2x + 1 = 9", "Write the 3 steps you use to solve an equation with x on both sides.", "Rate yourself:  😟  😐  🙂  😄", "Homework: MathQuest → PDF Worksheets (Homework sheet) or the printed Homework."], 26)
    d.save(OUT / "Y10_LinearEquations_Lesson_Slides.pptx")

if __name__ == "__main__":
    build_y7(); build_y10(); print("slides ok ->", OUT)

