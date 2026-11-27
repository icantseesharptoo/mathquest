# MathQuest

Interactive maths lessons for Year 8 and Year 10. Open `index.html` in Chrome or Edge. Nothing needs to be installed.

## What is in it
- **Year 8 and Year 10 courses.** The topics come from the school's Edupage teaching plans (`y8_plan_edupage.xls`, `y10_plan_edupage.xls`). Each chapter of a plan is a **module**, and each row is a **topic card** that shows its lesson numbers. Each module lists its curriculum objectives and has a module test.
- **Slides for every topic**, in this order:
  1. Title. The title's letters fade away and come back. This happens rarely (one effect every few seconds), and now and then a letter hangs from its last nail, wobbles and falls.
  2. Key words: the topic's words in English and Russian, with 🔊 buttons that read each word aloud (English and Russian voices, if the computer has them).
  3. Word meanings: each word with a simple explanation, an example and a picture. Press Space to bring the words in one at a time.
  4. Why it matters: a fun fact, a real-life use and up to three fun or applied YouTube videos. Press Space to reveal each part.
  5. Video (Year 8)
  6. Interactive demo
  7. Three worked examples (easy, medium, hard). Each step appears when you click, and the figure is drawn as you go. Steps are numbered 1), 2), 3).
  8. Meme break: a maths meme from r/mathmemes or r/MathematicsMemes, through [Meme_Api](https://github.com/D3vd/Meme_Api). It needs the internet. NSFW and spoiler posts and rude titles are left out, but the text inside a picture cannot be checked. *Save* good memes before the lesson and tick *Saved only* to show just those. *Hide* never shows a meme again.
  9. Random-problem wheel: one segment for each student in the class's seating plan (🪑), with their alias, and each student has their own problem. Spin to pick who answers; their avatar and name are shown with the problem. Without a class list the wheel has 8 numbered problems.
  10. Check (three questions)
  11. Practice

  Press **Space** to show the next step, use **← →** to change slides, and press **F** for full screen. In full screen (the *Full screen* button, or the browser's own F11), the slide fills the whole screen.
- **Interactive demos.** These cover:
  - straight lines (table, gradient–intercept and cover-up methods), matching a line to its equation, and real-life graphs
  - parallel lines, triangles, polygons, bearings and transformations
  - nets that fold into 3D shapes, and volume and surface area
  - ratio bars and percentage multipliers
  - averages, frequency tables, and charts (bar, pie, stem-and-leaf, histogram, time series)
  - a spinner experiment, sample spaces and tree diagrams
  - sequences
  - curves (Year 10)
- **Lesson timer** (top bar, and in the slides). It follows the school timetable by itself. During the lesson times (8:30–9:10, 9:15–9:55 and 10:00–10:40) it counts down the current lesson by the clock and shows *Lesson 1/2/3*, and between lessons it counts down the break. Click the word *Lesson* to change the times, or leave them empty to switch automatic timing off. Pressing ▶/⏸ or ↺ during a lesson switches to manual timing until that lesson ends, and 🕘 goes back to automatic timing. Outside the lesson times it is a manual 40-minute timer.
- **Soft notifications** appear in the bottom-right corner with a gentle chime at each lesson milestone:
  - the lesson starts
  - 5 min: new content
  - 13 min: worked examples
  - 21 min: practice
  - 7 minutes left: check understanding
  - 5 minutes left: exit ticket (with a button that opens it)
  - 1 minute left: pack up
  - the lesson ends (with the time of the next lesson)
  - 1 minute before the next lesson starts

  🔔 plays a test notification. Browsers only play sound after the page has been clicked once.
- **Classroom tools** (buttons in the slide bar, and in the Tools menu):
  - **🎟 Exit ticket** for the last 5 minutes. It first asks for the number of students (the size of the seating plan, or the last number used, is filled in). The screen then splits into one numbered block per student and 2 extra: the same question with different numbers in each, and 4 options to choose from. If the year has a seating plan, each block shows the student's alias and avatar; click the students who are absent before starting. *Students* changes the number, and *Show answers* reveals all the answers. When the timer reaches 5 minutes, its banner has a button that opens it.
  - **🔢 Number facts** (Tools menu). Shows a random fact about a number, or type any whole number up to 1 000 000 to see its prime factors, factors, special types, binary and Roman numeral. The facts are in `js/numfacts.js` and need no internet. 🔑 adds facts from the [math.tools Numbers API](https://math.tools/api/numbers), a paid service, if you enter a token; it is kept only in the browser. The Mars background pictures come from [Bootprint Space](https://bootprint.space).
  - **🪑 Seating plan** for each year (Tools menu, or the button on the year's page): 5 rows of 4 seats. Click a seat to type an alias and choose a [DiceBear](https://www.dicebear.com) avatar, or add a list of aliases at once. Drag students to move or swap them (on a touch screen, click the student and use *Move*), or shuffle the seats. It is stored only in this browser, and the avatar service gets a random code, never the alias.
  - **⚔️ Battle.** The screen splits into left and right halves, each with a hard question of the same type but different numbers. Several questions are tried and the ones that need the most working are kept, so very simple questions are left out. Each side answers on its own on-screen numpad. A 2-minute timer runs, and the first correct answer wins the round. Scores add up over the rounds, and you can click a team name to rename it. A wrong answer locks that side's numpad for 15 seconds, with a countdown, so teams cannot just guess.
  - **✏️ Pen.** Draw straight on top of the slides (button on the slide bar, or the **P** key). It has 6 colours, thin and thick lines, a highlighter, an eraser that removes a whole line, undo (Ctrl+Z) and clear. Each slide keeps its own drawing, saved in this browser, so it is still there when you open the lesson again (examples and random problems get new numbers each time, so clear those drawings if they no longer fit). The drawing moves with the slide when it scrolls, and the mouse wheel still scrolls. Press **Done**, **P** or Esc to use the slide again.
  - **🖊 Whiteboard.** Students can draw and write. It has a pen, straight lines, dots, text, an eraser, 6 colours, 4 sizes, undo and clear, a background that switches between grid, plain and dots, and *Save* to download a PNG. The drawing stays until you clear it.
    - **🎯 Task mode** shows a coordinate grid with a task. The task types are plot points, plot and join a shape, draw *y = mx + c*, draw *x = a* or *y = b*, midpoint, reflection, translation and rotation. You can also type your own task. Students answer with the Dot and Line tools, which snap to the grid (turn *Snap* off for free placement). *Check ✓* marks each dot and line green or red. *Show answer* draws the answer in dashed green, and *New task* picks new numbers.
- **Fits any screen.** Text, buttons and slides scale with the size of the window, and full-screen slides get bigger again for a projector. The exit ticket tries several block layouts and numbers of columns, and uses the one with the largest text that still fits on the screen. Wording that is the same in every block is shown once, above the blocks.
- **Tools menu.** Also links to [Wheel of names](https://spinthewheel.io/), [Bouncy Balls](https://bouncyballs.org/) (noise meter) and the [Kahoot channel](https://create.kahoot.it/channel/fb860daf-26f1-43c6-913f-98baf1ad0633).
- **Practice** (12 random questions per topic, with hints and worked solutions), **module tests** and a **final exam** for each year.

## Videos
**Interactive videos (H5P style).** When the site is opened through a web address, videos play in interactive mode. The video stops at checkpoints (by default at 30%, 60% and 85% of its length) and asks a 4-option question from the topic. A wrong answer shows the worked solution, and *Watch that part again* rewinds. After answering, close the question with ✕ or *Continue*. At the end, a summary quiz of three questions gives the total score. Markers on the timeline show each question and turn green or red once it is answered. Use *✎ Edit questions* to move or delete checkpoints, add a topic question at the current time, or write your own question. These changes are saved in the browser. Untick *Interactive* to use the plain YouTube player.

**Fun videos.** These were found by searching YouTube for each topic's real-life uses, and some were chosen by hand. Check a video before showing it to a class. To change them, edit `tools/build_extras.py` (the `E` table holds the facts and search queries, and `PICK` holds hand-chosen videos), then run `python tools/build_extras.py`. Add `--search` to search YouTube again.

Year 8 topics embed videos from the playlist *Cambridge Lower Secondary Mathematics Book 8* (`PLYl6YfuS48dsFXbJCmnv4WyVzcA6ACokX`), matched to topics by exercise number. YouTube does not play embedded or interactive videos in a page opened straight from a file (`file://`). In that case use **Open on YouTube**, or serve the folder over http, for example with GitHub Pages or `python -m http.server`.

## Files
| Path | Contents |
|---|---|
| `data/y8.js`, `data/y10.js` | Courses built from the Edupage plans. Do not edit these by hand. |
| `tools/build_plans.py` | Rebuilds the two data files. It also maps each topic to its question types, demo and videos. Run `python tools/build_plans.py` (the `.xls` plans must be in the folder above `MathQuest`). |
| `js/lib.js`, `js/g_*.js` | Problem generators. Each one takes `(random, level)` and returns a question with solution steps. Some also return optional figure frames for the step-by-step examples. |
| `js/demos.js` | Interactive demos. |
| `js/timer.js` | 40-minute lesson timer. |
| `js/tools.js`, `css/tools.css` | Exit ticket and battle mode, plus the styles for all three tools. |
| `js/board.js` | Whiteboard and its task mode. |
| `js/memes.js`, `js/seats.js`, `js/numfacts.js`, `css/class.css` | Meme slide, seating plans and number facts. |
| `css/scale.css` | Scaling of text, slides and buttons to the screen size. |
| `js/pen.js` | Pen mode for drawing on the slides; drawings are saved in localStorage (`maths.pen.<course>.<topic>`). |
| `data/terms.js`, `js/terms.js` | Key words for every topic (English, Russian, explanation, example) and the pictures for the *Word meanings* slide. |
| `data/extras.js`, `tools/build_extras.py` | Fun facts, real-life uses and fun videos for each topic. `data/extras.js` is generated, so edit the Python file instead. |
| `js/intro.js`, `js/ivideo.js`, `css/intro.css` | The animated title slide, the *Why it matters* slide and the interactive video player. |
| `js/engine.js`, `js/ui.js` | Course model, exams, pages and slides. |
| `test.html`, `test_ui.html` | Self-tests. Open them in a browser; the result is shown at the top of the page. |

The older Year 7 app (`app.js`, `topics.js`, … in the root) and `tools/extract_books.py` are kept for reference. The site does not use them.
