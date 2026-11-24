# MathQuest

Interactive maths lessons for Year 8 and Year 10. Open `index.html` in Chrome or Edge. Nothing needs to be installed.

## What is in it
- **Year 8 and Year 10 courses.** The topics come from the school's Edupage teaching plans (`y8_plan_edupage.xls`, `y10_plan_edupage.xls`). Each chapter of a plan is a **module**, and each row is a **topic card** that shows its lesson numbers. Each module lists its curriculum objectives and has a module test.
- **Slides for every topic**, in this order:
  1. Title. The title's letters fade away and come back. This happens rarely (one effect every few seconds), and now and then a letter hangs from its last nail, wobbles and falls.
  2. Why it matters: a fun fact, a real-life use and up to three fun or applied YouTube videos. Press Space to reveal each part.
  3. Objectives: the curriculum objectives as a carousel. Each has its own background colour, the text fills the card, and the main words are bold. It moves on by itself and pauses while the mouse is over it.
  4. Video (Year 8)
  5. Interactive demo
  6. Three worked examples (easy, medium, hard). Each step appears when you click, and the figure is drawn as you go.
  7. Random-problem wheel
  8. Check (three questions)
  9. Practice

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
  - **🎟 Exit ticket** for the last 5 minutes. The screen splits into 20 numbered blocks: the same question with different numbers in each, and 4 options to choose from. Each student answers the block with their number; *Show answers* reveals them all. When the timer reaches 5 minutes, its banner has a button that opens it.
  - **⚔️ Battle.** The screen splits into left and right halves, each with a medium question of the same type but different numbers. Each side answers on its own on-screen numpad. A 2-minute timer runs, and the first correct answer wins the round. Scores add up over the rounds, and you can click a team name to rename it.
  - **🖊 Whiteboard.** Students can draw and write. It has a pen, straight lines, dots, text, an eraser, 6 colours, 4 sizes, undo and clear, a background that switches between grid, plain and dots, and *Save* to download a PNG. The drawing stays until you clear it.
    - **🎯 Task mode** shows a coordinate grid with a task. The task types are plot points, plot and join a shape, draw *y = mx + c*, draw *x = a* or *y = b*, midpoint, reflection, translation and rotation. You can also type your own task. Students answer with the Dot and Line tools, which snap to the grid (turn *Snap* off for free placement). *Check ✓* marks each dot and line green or red. *Show answer* draws the answer in dashed green, and *New task* picks new numbers.
- **Fits any screen.** Text, buttons and slides scale with the size of the window, and full-screen slides get bigger again for a projector. The exit ticket sets its text as large as possible while all 20 blocks still fit on the screen.
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
| `js/objectives.js`, `css/objectives.css` | Curriculum objectives carousel. |
| `css/scale.css` | Scaling of text, slides and buttons to the screen size. |
| `data/extras.js`, `tools/build_extras.py` | Fun facts, real-life uses and fun videos for each topic. `data/extras.js` is generated, so edit the Python file instead. |
| `js/intro.js`, `js/ivideo.js`, `css/intro.css` | The animated title slide, the *Why it matters* slide and the interactive video player. |
| `js/engine.js`, `js/ui.js` | Course model, exams, pages and slides. |
| `test.html`, `test_ui.html` | Self-tests. Open them in a browser; the result is shown at the top of the page. |

The older Year 7 app (`app.js`, `topics.js`, … in the root) and `tools/extract_books.py` are kept for reference. The site does not use them.
