# MathQuest

Interactive maths lessons for Year 8 and Year 10. Open `index.html` in Chrome or Edge. Nothing needs to be installed.

## What is in it
- **Year 8 and Year 10 courses.** The topics come from the school's Edupage teaching plans (`y8_plan_edupage.xls`, `y10_plan_edupage.xls`). Each chapter of a plan is a **module**, and each row is a **topic card** that shows its lesson numbers. Each module lists its curriculum objectives and has a module test.
- **Slides for every topic**, in this order:
  1. Objectives
  2. Video (Year 8)
  3. Interactive demo
  4. Three worked examples (easy, medium, hard). Each step appears when you click, and the figure is drawn as you go.
  5. Random-problem wheel
  6. Check (three questions)
  7. Practice

  Press **Space** to show the next step, use **← →** to change slides, and press **F** for full screen.
- **Interactive demos.** These cover:
  - straight lines (table, gradient–intercept and cover-up methods), matching a line to its equation, and real-life graphs
  - parallel lines, triangles, polygons, bearings and transformations
  - nets that fold into 3D shapes, and volume and surface area
  - ratio bars and percentage multipliers
  - averages, frequency tables, and charts (bar, pie, stem-and-leaf, histogram, time series)
  - a spinner experiment, sample spaces and tree diagrams
  - sequences
  - curves (Year 10)
- **Lesson timer** (top bar, and in full-screen slides). It counts down 40 minutes, plays a sound and shows a banner when **5 minutes are left**, and chimes at the end. 🔔 tests the sound. Browsers only play sound after a click, so start the timer with its ▶ button.
- **Tools menu.** Links to [Wheel of names](https://spinthewheel.io/), [Bouncy Balls](https://bouncyballs.org/) (noise meter) and the [Kahoot channel](https://create.kahoot.it/channel/fb860daf-26f1-43c6-913f-98baf1ad0633).
- **Practice** (12 random questions per topic, with hints and worked solutions), **module tests** and a **final exam** for each year.

## Videos
Year 8 topics embed videos from the playlist *Cambridge Lower Secondary Mathematics Book 8* (`PLYl6YfuS48dsFXbJCmnv4WyVzcA6ACokX`), matched to topics by exercise number. YouTube does not play embedded videos in a page opened straight from a file (`file://`). In that case use **Open on YouTube**, or serve the folder over http, for example with GitHub Pages or `python -m http.server`.

## Files
| Path | Contents |
|---|---|
| `data/y8.js`, `data/y10.js` | Courses built from the Edupage plans. Do not edit these by hand. |
| `tools/build_plans.py` | Rebuilds the two data files. It also maps each topic to its question types, demo and videos. Run `python tools/build_plans.py` (the `.xls` plans must be in the folder above `MathQuest`). |
| `js/lib.js`, `js/g_*.js` | Problem generators. Each one takes `(random, level)` and returns a question with solution steps. Some also return optional figure frames for the step-by-step examples. |
| `js/demos.js` | Interactive demos. |
| `js/timer.js` | 40-minute lesson timer. |
| `js/engine.js`, `js/ui.js` | Course model, exams, pages and slides. |
| `test.html`, `test_ui.html` | Self-tests. Open them in a browser; the result is shown at the top of the page. |

The older Year 7 app (`app.js`, `topics.js`, … in the root) and `tools/extract_books.py` are kept for reference. The site does not use them.
