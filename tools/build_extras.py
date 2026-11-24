"""Builds data/extras.js: a fun fact, a real-life application and fun/applied
YouTube videos for every topic.

    python tools/build_extras.py            # use cached search results
    python tools/build_extras.py --search   # search YouTube again for topics not in the cache

Facts and applications are written here by hand (two come from the Grade 10
learner book's "Did you know?" boxes). Videos are found by searching YouTube
for each topic's queries; results are cached in tools/extras_videos.json.
To choose a video by hand, put its id in PICK.
"""
import json, os, re, subprocess, sys, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, 'tools', 'extras_videos.json')

# title -> (fun fact, real-life application, [YouTube search queries])
# A key 'y10:Title' overrides 'Title' for Year 10.
E = {
 # ---------------- Year 8 (and shared) ----------------
 'Types of numbers': (
  'Legend says the ancient Greek Hippasus was thrown into the sea for proving that √2 cannot be written as a fraction: it was the first known irrational number.',
  'Computers store integers and decimals differently. That is why many programming languages say 0.1 + 0.2 = 0.30000000000000004.',
  ['irrational numbers explained', 'why 0.1 + 0.2 is not 0.3']),
 'Factors and prime factors': (
  'The largest known prime number, found in 2024, is <span style="white-space:nowrap">2<sup>136 279 841</sup> − 1</span>. It has more than 41 million digits.',
  'Online banking and messaging apps use RSA encryption. It is safe because nobody can quickly find the two prime factors of a huge number. Periodical cicadas also come out every 13 or 17 years, both prime numbers.',
  ['why are prime numbers important', 'cicadas prime numbers']),
 'Powers': (
  'The chessboard legend: put 1 grain of rice on the first square and double it on each square. The 64th square alone would need 2⁶³ ≈ 9.2 quintillion grains, more rice than has ever been grown.',
  'Computer memory comes in powers of 2: 2¹⁰ = 1024 bytes, and phone storage sizes are 64, 128, 256 and 512 GB.',
  ['rice on a chessboard exponential', 'powers of two computers explained']),
 'Square roots and cube roots': (
  'The √ sign was first printed in 1525 by Christoff Rudolff. It probably comes from a stretched letter r, for radix, the Latin word for root.',
  'To make a cube-shaped box that holds 1000 cm³, each edge must be ∛1000 = 10 cm. Square roots also give the side of a square field from its area.',
  ['history of the square root', 'babylonian square root method']),
 'Order of operations': (
  'The puzzle 8 ÷ 2(2 + 2) went viral in 2019 and split the internet between the answers 1 and 16. Clear brackets would have settled it.',
  'Spreadsheets and calculators follow the order of operations. In Excel =2+3*4 gives 14, not 20.',
  ['8÷2(2+2) viral math problem explained', 'order of operations why']),
 'Fraction skills': (
  'Ancient Egyptians wrote almost every fraction as a sum of different unit fractions, for example 3/4 = 1/2 + 1/4.',
  'Music uses fractions: a whole note splits into halves, quarters and eighths. Recipes and spanner sizes (5/8 inch) use them too.',
  ['egyptian fractions', 'fractions in music rhythm']),
 'Rounding': (
  'In 1982 the Vancouver Stock Exchange started a new index at 1000. Because it was cut off (truncated) instead of rounded after each trade, it fell to about 520 in under two years, when it should have been about 1098.',
  'Prices, weather forecasts, sports statistics and news headlines are all rounded so they are easy to read.',
  ['vancouver stock exchange rounding error', 'rounding numbers in real life']),
 'Powers of 10 (× and ÷ by 0.1 and 0.01)': (
  'The 1977 film “Powers of Ten” zooms out from a picnic by ×10 every 10 seconds, to the edge of the known universe, then zooms back into a carbon atom.',
  'Changing units uses powers of 10: 250 cm × 0.01 = 2.5 m, and 4 kg ÷ 0.001 = 4000 g.',
  ['Powers of Ten 1977 film', 'multiplying by 0.1 and 0.01']),
 'Significant figures': (
  'It is said that when Mount Everest was first measured at exactly 29 000 ft, the surveyors announced 29 002 ft so people would not think it was a rounded guess.',
  'Scientists give measurements to a sensible number of significant figures, and news reports say a city has “about 2.3 million people”.',
  ['significant figures why they matter', 'how tall is mount everest measured']),
 'Algebra terminology': (
  'The word algebra comes from “al-jabr” in the title of a book written by al-Khwarizmi in Baghdad around 820 AD. The word “algorithm” comes from his name.',
  'Programmers use variables just like x and y: score = score + 10 updates a game score.',
  ['al-Khwarizmi father of algebra', 'history of algebra']),
 'Algebra basic rules': (
  'Robert Recorde invented the equals sign in 1557 in “The Whetstone of Witte”, because “no two things can be more equal” than two parallel lines. (Grade 10 learner book)',
  'Totalling items at a till is collecting like terms: 3 apples + 2 apples = 5 apples, just like 3a + 2a = 5a.',
  ['history of the equals sign Robert Recorde', 'collecting like terms real life']),
 'Expressions and expanding brackets': (
  'Mental-maths trick: 23 × 12 = 23 × (10 + 2) = 230 + 46 = 276. That is expanding brackets!',
  'If a 4 m wide room is made x m longer than 3 m, its new area is 4(x + 3) = 4x + 12 square metres.',
  ['mental math tricks distributive property', 'expanding brackets real life']),
 'Substitution': (
  'Your phone’s map app substitutes distance and speed into time = distance ÷ speed thousands of times to predict when you will arrive.',
  'Change °C to °F with F = 1.8C + 32: substituting C = 37 gives a normal body temperature of 98.6 °F.',
  ['how does google maps calculate arrival time', 'celsius to fahrenheit formula explained']),
 'Forming expressions from words': (
  'Before symbols were invented, algebra was written entirely in words. Solving “x + 5 = 12” needed a whole sentence.',
  'A phone plan costing £10 a month plus 5p per text costs 10 + 0.05t pounds for t texts.',
  ['history of algebra symbols', 'writing algebraic expressions from words']),
 'Formulae and changing the subject': (
  'Einstein’s E = mc² can be rearranged to m = E ÷ c². Scientists change the subject of formulae every day.',
  'Rearranging speed = distance ÷ time to time = distance ÷ speed tells you how long a journey will take.',
  ['E=mc2 explained simply', 'rearranging formulas real life']),
 'Factorising linear expressions': (
  'Factorising makes sums quicker: 7 × 38 + 7 × 62 = 7 × (38 + 62) = 7 × 100 = 700.',
  'Packing 12 apples and 18 oranges into identical bags: 12a + 18o = 6(2a + 3o), so 6 bags each holding 2 apples and 3 oranges.',
  ['factorising explained', 'common factor real life']),
 'Solving equations and forming them from word problems': (
  'The Egyptian Rhind Papyrus (about 1550 BC) asks: “a quantity and its quarter added together make 15”. That is the equation x + x/4 = 15.',
  'Saving £15 a week for a £120 game: 15w = 120, so w = 8 weeks.',
  ['Rhind papyrus egyptian mathematics', 'solving equations real life']),
 'Inequalities': (
  'Thomas Harriot introduced the < and > signs. They were printed in his book in 1631, ten years after he died.',
  'Speed limits (v ≤ 30), age ratings (age ≥ 12) and lift weight limits are all inequalities.',
  ['inequalities in real life', 'inequality symbols history']),
 'Types of sequences': (
  'The Fibonacci sequence 1, 1, 2, 3, 5, 8, … appears in sunflower heads and pine cones, which often have 34 and 55 spirals.',
  'Rows in a theatre often grow by the same number of seats each row: an arithmetic sequence.',
  ['fibonacci sequence in nature', 'number sequences real life']),
 'The nth term': (
  'As a schoolboy, Carl Gauss is said to have added 1 to 100 in seconds by pairing 1 + 100, 2 + 99, …: 50 pairs of 101 make 5050.',
  'A taxi fare of £3 plus £2 per km is the sequence 5, 7, 9, …, with nth term 2n + 3.',
  ['Gauss sum 1 to 100 story', 'nth term real life']),
 'Finding the value of n': (
  'Is 2026 in the sequence 4, 7, 10, …? Solve 3n + 1 = 2026 to get n = 675, so yes: it is the 675th term!',
  'Solving for n tells you which week your savings reach a target, or which row of a stadium has 100 seats.',
  ['arithmetic sequence real life examples', 'patterns in maths']),
 'Finding a specific term': (
  'Leap years form a sequence: 2024, 2028, 2032, … The 10th leap year after 2020 is 2020 + 4 × 10 = 2060.',
  'Planners use term formulas to predict the 20th payment of a loan or the height of the 30th step of a staircase.',
  ['sequences and patterns in the real world', 'leap year explained']),
 'Angle facts review: triangles and exterior angles': (
  'On a sphere like the Earth, a triangle’s angles add to more than 180°. Go from the North Pole to the equator, a quarter of the way round, then back up: all three angles are 90°!',
  'Roof trusses, cranes and bridges are built from triangles because a triangle cannot change shape without bending.',
  ['why triangles are the strongest shape', 'triangle with three right angles sphere']),
 'Parallel lines': (
  'Railway tracks are parallel, yet in a photo they seem to meet at a “vanishing point”. Artists use this to draw in perspective.',
  'Road designers use corresponding and alternate angles for angled parking bays and zebra crossings.',
  ['vanishing point perspective parallel lines', 'parallel lines and angles real life']),
 'Quadrilaterals and their properties': (
  'A square belongs to four quadrilateral families at once: it is a rectangle, a rhombus, a parallelogram and a kite.',
  'Scissor lifts, folding gates and desk lamps use parallelograms, because opposite sides stay parallel as they move.',
  ['scissor lift how it works', 'quadrilaterals in real life']),
 'Polygons: exterior and interior angles': (
  'Bees build hexagonal cells. Thomas Hales proved in 1999 that hexagons divide a surface into equal cells using the least wall length.',
  'Only regular triangles, squares and hexagons tile a floor by themselves, because their interior angles (60°, 90°, 120°) divide 360°.',
  ['why do bees make hexagons', 'which shapes tessellate']),
 'Bearings': (
  'Runways are named after bearings: runway 27 points at about 270°, which is west. Its other end is runway 09.',
  'Ships, pilots, mountain rescue teams and orienteers all navigate using three-figure bearings.',
  ['how are runways numbered', 'how to use a compass bearing']),
 'Transformations': (
  'M. C. Escher’s famous tessellations of birds, fish and lizards are made by translating, rotating and reflecting one tile.',
  'Video games move characters with translations and rotations, and many logos have reflection or rotation symmetry.',
  ['Escher tessellations explained', 'transformations in video games']),
 'Simple constructions': (
  'Euclid’s “Elements” (about 300 BC) builds geometry using only a straight edge and compasses. It was used as a school textbook for over 2000 years.',
  'Builders and engineers bisect angles and draw perpendicular lines when they set out buildings on site.',
  ['compass and straightedge constructions history', 'euclid elements explained']),
 '3D vocabulary, nets and types of prisms': (
  'Euler’s formula: for a prism or pyramid, faces + vertices − edges = 2. For a cube that is 6 + 8 − 12 = 2.',
  'Every cardboard box and cereal packet starts as a flat net that a factory cuts out and folds.',
  ['how cardboard boxes are made', 'euler formula polyhedra']),
 'Volume of cuboids, prisms and cylinders': (
  'Archimedes is said to have shouted “Eureka!” when he realised that the water his body pushed out of the bath had the same volume as his body.',
  'Fish tanks, swimming pools and concrete are priced by volume. 1 m³ of water is 1000 litres and weighs a tonne.',
  ['Archimedes eureka story', 'volume in real life']),
 'Surface area': (
  'Your lungs have a surface area of about 70 m², roughly a third of a tennis court, folded up inside your chest.',
  'Painters work out how many tins of paint they need, and companies how much card a box needs, from surface area.',
  ['surface area to volume ratio real life', 'why elephants have big ears surface area']),
 'Real-world problems (pipes, tanks, pyramids)': (
  'The Great Pyramid of Giza was built from about 2.3 million stone blocks. Its volume is about 2.6 million m³.',
  'Engineers calculate the volume of water pipes and tanks to make sure a town has enough water.',
  ['how was the great pyramid built', 'volume of a cylinder real life']),
 'Drawing straight-line graphs: 3 methods': (
  'René Descartes is said to have invented coordinates while lying in bed watching a fly crawl across his ceiling.',
  'Taxi fares and phone bills (fixed charge + cost per unit) make straight-line graphs.',
  ['descartes coordinates fly story', 'straight line graphs real life']),
 'Recognising a graph from its picture': (
  'A road sign showing 25% (or 1 in 4) means the road rises 1 m for every 4 m along: a gradient of 0.25.',
  'Wheelchair ramps are usually built no steeper than 1 in 12 so they are safe to use.',
  ['gradient slope in real life', 'steepest street in the world']),
 'Real-world graphs (e.g. filling a bottle)': (
  'Fitness apps draw a distance–time graph of your run: the steeper the line, the faster you were going.',
  'Travel agents use conversion graphs to change pounds to euros, and doctors use growth charts.',
  ['distance time graphs explained', 'filling bottles graph']),
 'Percentage change': (
  'A 50% fall followed by a 50% rise does not get you back where you started: £100 → £50 → £75.',
  'Shops show discounts as percentages, and the news reports changes in prices and house values as percentage changes.',
  ['percentage increase and decrease explained', 'percentages in real life']),
 'Percentage applications': (
  'The % sign grew out of the Italian “per cento”, written as “p c°”. Over centuries it became %.',
  'VAT, tips, test scores, interest rates and your phone’s battery level all use percentages.',
  ['history of the percent sign', 'percentages in everyday life']),
 'Multipliers and compound change': (
  'Albert Einstein is often (probably wrongly) quoted as calling compound interest “the eighth wonder of the world”.',
  'Savings, loans, inflation and population growth all use repeated multipliers, such as × 1.05 each year.',
  ['compound interest explained', 'exponential growth explained']),
 'Ratio basics: simplifying': (
  'The golden ratio, about 1.618 : 1, appears in some flower spirals and in art, though many claims about it are exaggerated.',
  'Screen shapes are ratios: most TVs are 16 : 9, and photos are often 3 : 2 or 4 : 3.',
  ['aspect ratio explained', 'golden ratio myths']),
 'Ratio applications: sharing and scaling': (
  'OO gauge model railways are built at a scale of 1 : 76.2, so a 20 m carriage is about 26 cm long.',
  'Maps (1 : 25 000), recipes for more people and concrete (cement : sand : gravel = 1 : 2 : 3) all use ratio.',
  ['map scale explained', 'ratio in real life']),
 'Rates and the unitary method': (
  'Usain Bolt’s 100 m world record of 9.58 s is an average speed of about 10.4 m/s, or 37.6 km/h.',
  'Supermarket labels show the price per 100 g so you can find the best buy.',
  ['how fast is Usain Bolt', 'unit price best buy explained']),
 'Collecting data and sampling': (
  'In 1936 the Literary Digest asked over 2 million people and predicted the wrong winner of the US election. Their sample had too many wealthy people.',
  'Opinion polls, factory quality checks and the national census all depend on good sampling.',
  ['1936 literary digest poll sampling bias', 'sampling bias explained']),
 'Mean, median, mode and range': (
  'The “average family” has about 2.4 children. A mean does not have to be a value you could actually get!',
  'House prices are usually reported as a median, because a few mansions would make the mean misleadingly high.',
  ['mean median mode which average to use', 'averages in real life']),
 'Organising data: frequency tables': (
  'The Ishango bone from Central Africa, over 20 000 years old, has groups of notches that may be some of the oldest tally marks.',
  'Traffic surveys, bird counts and sports statistics are recorded in tally charts and frequency tables.',
  ['Ishango bone', 'tally charts and frequency tables']),
 'Displaying data: pie, bar, stem-and-leaf, histogram, time series': (
  'Florence Nightingale’s 1858 “rose diagram” showed that more soldiers died from disease than from wounds, and it helped change hospital hygiene.',
  'News websites, weather forecasts and election results use charts so you can see the pattern at a glance.',
  ['Florence Nightingale rose diagram', 'how charts can mislead']),
 'Interpreting and comparing two sets of data': (
  'In 2002 the Oakland Athletics baseball team used statistics, not scouts’ hunches, to choose players and compete with much richer teams (“Moneyball”).',
  'Sports scouts compare players’ averages (how good) and ranges (how consistent) before signing them.',
  ['Moneyball statistics explained', 'comparing data sets averages and range']),
 'Probability basics: finding P(event)': (
  'Probability theory began in 1654 with letters between Blaise Pascal and Pierre de Fermat about a gambling problem.',
  'A forecast of “70% chance of rain” is a probability of 0.7.',
  ['how weather forecast probability works', 'probability history Pascal Fermat']),
 'Relative frequency': (
  'Karl Pearson tossed a coin 24 000 times and got 12 012 heads: a relative frequency of 0.5005.',
  'Insurance companies use how often accidents happened in the past to set prices.',
  ['law of large numbers coin flip', 'relative frequency explained']),
 'Sample space diagrams and two-way tables': (
  'With two dice, 7 is the most likely total: 6 of the 36 outcomes make 7.',
  'Board games depend on dice totals, and doctors use two-way tables to compare test results with real outcomes.',
  ['two dice probability why 7 is most common', 'two way tables explained']),
 'Tree diagrams for compound events': (
  'In the Monty Hall game show puzzle, switching doors wins 2 times out of 3. A tree diagram shows why.',
  'Doctors use tree diagrams to work out how likely a positive medical test is to be correct.',
  ['Monty Hall problem explained', 'tree diagrams probability']),
 'Progression test practice (mixed review)': (
  'Spaced practice works: reviewing a topic again a few days later helps you remember it far better than cramming the night before.',
  'Mixing different types of question (interleaving), as in this review, is how exams test you, so it is the best way to revise.',
  ['how to study effectively spaced repetition', 'how to revise for maths exams']),
 # ---------------- Year 10 ----------------
 'Standard form': (
  'The Sun is about 1.5 × 10⁸ km from Earth, and a human hair is about 7 × 10⁻⁵ m wide.',
  'Scientists use standard form for very big and very small numbers. Calculators show it as 1.5E8.',
  ['scale of the universe', 'standard form real life']),
 'Roots and powers': (
  '2⁰ = 1, because each step down the powers of 2 halves the number: 8, 4, 2, 1, ½, ¼, …',
  'Earthquake (Richter) and sound (decibel) scales use powers of 10: each step up means 10 times more.',
  ['why is anything to the power of zero 1', 'logarithmic scale explained']),
 'Upper and lower bounds': (
  'Usain Bolt’s 9.58 s is timed to 0.01 s, so his real time lies between 9.575 s and 9.585 s.',
  'Engineers set tolerances: a bolt might be 10 mm ± 0.05 mm, which are its upper and lower bounds.',
  ['manufacturing tolerances explained', 'upper and lower bounds real life']),
 'Ratio and rate': (
  'A cheetah can sprint at about 100 km/h, roughly 2.7 times as fast as Usain Bolt.',
  'Exchange rates, fuel economy (km per litre) and pay rates (£ per hour) are all rates.',
  ['how fast is a cheetah', 'rates and ratios real life']),
 'Percentages': (
  '“Buy one, get one half price” is only a 25% discount on the two items.',
  'Discounts, tax, interest, exam marks and statistics in the news all use percentages.',
  ['percentages tricks', 'percentages in everyday life']),
 'Time and timetables': (
  'Before railways, every British town kept its own local time. Railways brought one standard time (GMT) across Britain from 1847.',
  'Bus, train and flight timetables use the 24-hour clock, and you add and subtract times to plan journeys.',
  ['how railways created time zones', 'reading timetables']),
 'Simple and compound interest': (
  'Double a penny every day for 30 days: on day 30 you get 2²⁹ pennies, which is more than £5 million.',
  'Savings accounts, loans, mortgages and credit cards all charge or pay compound interest.',
  ['penny doubled every day for 30 days', 'compound interest explained']),
 'Solving equations': (
  'A riddle about Diophantus says he was a boy for 1/6 of his life, a youth for 1/12, … Solving the equation shows he lived to 84.',
  'A business finds its break-even point by solving: cost = income.',
  ['Diophantus age riddle', 'solving equations real life']),
 'Simultaneous equations': (
  'The Chinese book “Nine Chapters on the Mathematical Art” (about 200 BC) solved simultaneous equations with counting rods, a method like the one computers use today.',
  'Comparing two phone plans: solve where their costs are equal to see when one becomes cheaper.',
  ['simultaneous equations real life', 'nine chapters mathematical art']),
 'Word problems: setting up a model': (
  'Mathematical models predict weather, the spread of diseases and traffic jams.',
  'Pricing a party at £50 plus £12 per guest is the model C = 50 + 12n.',
  ['what is mathematical modelling', 'how maths predicts the weather']),
 'Expressions': (
  'A spreadsheet formula like =B2*3+C2 is an algebraic expression where the cells are the variables.',
  'Programmers, engineers and accountants write expressions every day to calculate totals and sizes.',
  ['algebra in real life', 'why learn algebra']),
 'Rules of indices': (
  'A googol is 10¹⁰⁰. The name Google comes from a misspelling of it.',
  'Computer storage uses the index laws: 2¹⁰ × 2¹⁰ = 2²⁰ bytes, about 1 megabyte.',
  ['googol and googolplex', 'laws of indices explained']),
 'Expanding brackets': (
  '(a + b)² = a² + 2ab + b² can be drawn as a square cut into four pieces. Babylonian and Greek mathematicians proved it with pictures like this.',
  'Mental maths: 51² = (50 + 1)² = 2500 + 100 + 1 = 2601.',
  ['squaring numbers mental math trick', 'a plus b squared visual proof']),
 'Factorising': (
  'Babylonian clay tablets show that people were solving quadratic equations nearly 4000 years ago.',
  'A rectangle with area x² + 5x + 6 can be factorised to give its sides: (x + 2) and (x + 3).',
  ['history of the quadratic equation', 'factorising quadratics real life']),
 'Linear patterns (sequences)': (
  'Matchstick squares in a row need 4, 7, 10, … matches: each new square adds 3, so the nth term is 3n + 1.',
  'Fence panels, tiles and seats in rows grow in linear patterns, so builders use nth-term formulas to order materials.',
  ['linear sequences real life', 'matchstick patterns nth term']),
 'y = mx + c: setting up and drawing graphs': (
  'Nobody knows for sure why m is used for the gradient in y = mx + c.',
  'A taxi fare is a straight line: c is the fixed charge and m is the price per km.',
  ['y=mx+c real life examples', 'straight line graphs real life']),
 'Interpreting straight-line features': (
  'The gradient of a distance–time graph is the speed, and the gradient of a cost graph is the price per item.',
  'Scientists read gradients from graphs to find rates, such as how fast a plant grows each week.',
  ['gradient meaning real life graph', 'interpreting graphs']),
 'Straight-line graphs': (
  'The world’s steepest street, Ffordd Pen Llech in Wales, has a gradient of about 37.5%, so it rises about 3 m for every 8 m along.',
  'Road signs, ski slopes and wheelchair ramps all describe gradients.',
  ['steepest street in the world', 'gradient slope in real life']),
 'Equation from a picture of the graph': (
  'Scientists draw a line of best fit through their results and use its equation to make predictions, for example how far a spring stretches.',
  'Businesses read the equation of a trend line to predict next month’s sales.',
  ['line of best fit real life', 'hookes law graph']),
 'Curved graphs': (
  'A thrown ball, a fountain’s water jet and a basketball shot all follow a parabola.',
  'Engineers use curved graphs to design bridges, roller coasters and the shape of car bodies.',
  ['parabolas in real life', 'math of a basketball shot']),
 'Parabolas and hyperbolas': (
  'Satellite dishes and car headlights are parabolic: every signal that hits the dish bounces to one point, the focus.',
  'Boyle’s law, pressure × volume = constant, gives a hyperbola. So does the time a journey takes against your speed.',
  ['why satellite dishes are parabolic', 'hyperbola in real life']),
 'Intersections of graphs': (
  'Where a company’s cost line crosses its income line is its break-even point: after that it makes a profit.',
  'Comparing two price plans on a graph: where they cross, both plans cost the same.',
  ['break even point graph explained', 'intersection of graphs real life']),
 'Using intersections to solve equations and find roots': (
  'Before calculators, people solved hard equations by drawing accurate graphs and reading where they crossed.',
  'Engineers find roots to work out when a ball or rocket lands (when its height is 0).',
  ['solving equations graphically', 'when will the ball land quadratic']),
 'Coordinate geometry of straight lines': (
  'GPS gives your position as coordinates (latitude and longitude), accurate to a few metres.',
  'Game designers use the distance formula, which is Pythagoras on a grid, to check how far apart characters are.',
  ['how GPS works', 'distance formula in video games']),
 'Gradient and the gradient–intercept method': (
  'Most main-line railways are kept gentler than about 1 in 40 (2.5%), because steel wheels slip on steel rails.',
  'Gradients describe roads, roofs and ramps, and rates such as £ per hour on a graph.',
  ['steepest railway in the world', 'gradient explained real life']),
 'Intercepts': (
  'On a phone-bill graph, the y-intercept is the monthly charge you pay even if you make no calls.',
  'The x-intercept of a fuel graph tells a driver when the tank will be empty.',
  ['y intercept meaning real life', 'intercepts of a graph explained']),
 'Intersections of lines': (
  'Air traffic controllers check where planes’ straight-line paths cross, so the planes are never there at the same time.',
  'Two straight lines crossing shows when two companies charge the same, or when a car catches another.',
  ['how air traffic control works', 'intersection of two lines real life']),
 "Pythagoras' theorem: finding sides": (
  'A Babylonian clay tablet called Plimpton 322 (about 1800 BC) lists Pythagorean triples, more than 1000 years before Pythagoras.',
  'Builders use a 3–4–5 triangle (rope or tape) to mark out a perfect right angle.',
  ['Plimpton 322', '3 4 5 rule builders']),
 'Real-world Pythagoras (distances and bearings)': (
  'TV sizes are measured along the diagonal: a 55-inch TV is 55 inches from corner to corner.',
  'Pilots, sailors and drone operators use Pythagoras to find the direct distance from north and east distances.',
  ['why TV size is measured diagonally', 'pythagoras real life']),
 'The three trigonometric ratios': (
  'About 2200 years ago, Eratosthenes estimated the size of the Earth using the angles of shadows in two Egyptian cities.',
  'Architects, game designers and engineers use sin, cos and tan to find heights and angles they cannot measure directly.',
  ['Eratosthenes measures the earth', 'trigonometry in real life']),
 'Finding missing sides and angles': (
  'In the 1800s the Great Trigonometrical Survey of India used triangles to measure the height of Mount Everest.',
  'Measure an angle and a distance with a clinometer, and tan gives you the height of a tree or building.',
  ['how to measure the height of a tree trigonometry', 'great trigonometrical survey everest']),
 'Bearings and geometry': (
  'Magnetic north moves: it has recently travelled tens of kilometres a year towards Siberia, so maps have to be updated.',
  'Ships and planes use three-figure bearings: 045° is north-east and 270° is west.',
  ['magnetic north pole moving', 'bearings navigation explained']),
 'Trigonometry and areas (sine and cosine rules)': (
  'Surveyors mapped whole countries by triangulation: they measured one baseline, then used angles and the sine rule for everything else.',
  'Navigators, surveyors and astronomers use the sine and cosine rules for triangles without a right angle.',
  ['triangulation surveying explained', 'sine rule real life']),
 'Units and conversions': (
  'In 1999 NASA lost the $125 million Mars Climate Orbiter because one team used imperial units and another used metric.',
  'Cooking, medicine doses, travel and building work all need correct unit conversions.',
  ['Mars Climate Orbiter units mistake', 'metric vs imperial']),
 'Areas and perimeters': (
  'The coastline paradox: the more carefully you measure a coastline, the longer its perimeter gets.',
  'Fencing a garden uses perimeter, and buying carpet or turf uses area.',
  ['coastline paradox', 'area and perimeter real life']),
 '2D shapes and compound shapes': (
  'A hectare is 10 000 m². A football pitch is about 0.7 hectares. (Grade 10 learner book)',
  'House floor plans split into rectangles and triangles to work out the area of flooring.',
  ['how big is a hectare', 'area of compound shapes real life']),
 'Circles, arcs and sectors': (
  'π has been calculated to hundreds of trillions of digits, but NASA needs only about 15 decimal places to navigate spacecraft.',
  'A 16-inch pizza has more than twice the area of an 11-inch one, because area depends on r².',
  ['how many digits of pi does NASA use', 'pizza size area math']),
 '3D shapes: surface area, volume and unknown dimensions': (
  'A standard 330 ml drink can is a cylinder about 6.6 cm wide and 11.5 cm tall.',
  'Designers work backwards from a volume, such as 330 ml, to find the height or radius a container needs.',
  ['why are soda cans shaped like that', 'volume and surface area real life']),
 'Volume and surface area of solids': (
  'A sphere holds the most volume for its surface area, which is why soap bubbles are round.',
  'Packaging designers use surface area to save card and volume to fit the product.',
  ['why are bubbles round', 'surface area to volume ratio real life']),
 'Choosing the correct formula': (
  'Archimedes was so proud of proving that a sphere has 2/3 the volume of the cylinder around it that he asked for it to be carved on his tomb.',
  'Engineers choose the right formula for tanks, pipes, cones and domes when they design buildings and machines.',
  ['Archimedes sphere and cylinder', 'volume formulas explained']),
 'Real-world problems and compound solids': (
  'Grain silos are often cylinders with cone-shaped bottoms. Engineers add the volumes of the parts to find how much they hold.',
  'Ice-cream cones, rockets and buildings are compound solids made from simpler shapes.',
  ['volume of composite solids real life', 'how grain silos work']),
 'Past paper practice (mixed review)': (
  'Spaced practice works: reviewing a topic again a few days later helps you remember it far better than cramming the night before.',
  'Past papers show the style and timing of real exams. Practising them under timed conditions is the best rehearsal.',
  ['how to study effectively spaced repetition', 'how to revise for maths exams']),
}

# Channels known for good, classroom-safe maths and science videos
TRUSTED = ['TED-Ed', 'Numberphile', '3Blue1Brown', 'BBC', 'Mathologer', 'SciShow', 'Veritasium', 'Stand-up Maths',
           'Vsauce', 'Khan Academy', 'minutephysics', 'Science ABC', 'Real Engineering', 'Up and Atom', 'MinuteEarth',
           'Physics Girl', 'Tom Scott', 'Smithsonian', 'National Geographic', 'Vox', 'Wendover', 'The Royal Institution',
           'Corbettmaths', 'Math Antics', 'Kurzgesagt', 'NASA', 'Business Insider', 'Ted', 'Brain Stuff', 'BrainStuff',
           'Half as Interesting', 'Steve Mould', 'Domain of Science', 'Primer', 'Eddie Woo', 'Mashup Math']
# Videos chosen by hand where the search picked something off-topic.
# Each item is a video id from the search cache, or [id, title, channel, length].
PICK = {
 'Types of numbers': ['sbGjr_awePE', 'cLP7INqs3JM', 'NdEcjBGVr8s'],
 'Rounding': ['RdDIANVl7dc', 'KHAFeEVFLkI', 'fd-E18EqSVk'],
 'Inequalities': ['v7qxCbs9LQw', 'eVm063xmnow', 'mgHO-bsCDrA'],
 'Real-world graphs (e.g. filling a bottle)': ['yI93SLrCOG0', 'RM02SnuJ0MY', 'H5HkS5RnhSc'],
 'Polygons: exterior and interior angles': ['QEzlsjAqADA', 'kxDEcODUEP0'],
 'Quadrilaterals and their properties': ['VssnhTjDkNE', '6ePpUns-RpA'],
 'Surface area': ['huKUJsqik2I', 'GC7phTfotpE'],
 'Interpreting and comparing two sets of data': ['1iXt8bqvkZk', 'FM7Q2yVLZIc', 'PJmzCdykM5M'],
 'Progression test practice (mixed review)': ['eVajQPuRmk8', '-uMMRjrzPmE', 'z5kjpESPSM8'],
 'Past paper practice (mixed review)': ['eVajQPuRmk8', 'cVf38y07cfk', 'CYcfIBkZU1A'],
 'Roots and powers': ['yiwAS3R-mG0', 'zzu2POfYv0Y', 'sBhEi4L91Sg'],
 'Gradient and the gradient–intercept method': ['skR4VS6K8-c', 'G-7a0S5wsss', 'zVSq5b3PPfY'],
 'Coordinate geometry of straight lines': ['RSA3feQ9gKk', 'otIjqzKlnXc'],
 'Circles, arcs and sectors': [['l-vHGf4j90Y', 'How Many Digits of Pi Do We Really Need?', 'Real Engineering', '6:54'], 'YAawHbPiQfo', 'U_oIkd4rKaU'],
}
BAD = re.compile(r'(?i)#shorts|reaction|asmr|prank|\blive\b|hindi|urdu|tamil|class \d|lecture \d|full course|ncert|cbse')


def search(q):
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
    u = 'https://www.youtube.com/results?hl=en&gl=GB&search_query=' + urllib.parse.quote(q)
    s = subprocess.run(['curl', '-sL', '-A', UA, '-H', 'Accept-Language: en', '-b', 'CONSENT=YES+1; SOCS=CAI', u],
                       capture_output=True).stdout.decode('utf8', 'ignore')
    i = s.index('ytInitialData = ') + 16
    d, _ = json.JSONDecoder().raw_decode(s[i:])
    res = []

    def walk(o):
        if isinstance(o, dict):
            if 'videoRenderer' in o:
                v = o['videoRenderer']
                try:
                    res.append(dict(id=v['videoId'], t=''.join(r['text'] for r in v['title']['runs']),
                                    ch=v['ownerText']['runs'][0]['text'],
                                    len=v.get('lengthText', {}).get('simpleText', ''),
                                    views=v.get('viewCountText', {}).get('simpleText', '')))
                except Exception:
                    pass
                return
            for x in o.values():
                walk(x)
        elif isinstance(o, list):
            for x in o:
                walk(x)
    walk(d)
    return res[:12]


def secs(t):
    p = [int(x) for x in t.split(':')] if t else []
    s = 0
    for x in p:
        s = s * 60 + x
    return s


def views(v):
    m = re.sub(r'[^\d]', '', v or '')
    return int(m) if m else 0


def score(v, rank):
    s = secs(v['len'])
    if not 45 <= s <= 20 * 60 or BAD.search(v['t']):
        return -1
    sc = 10 - rank + min(8, len(str(views(v['views']))))
    if any(t.lower() in v['ch'].lower() for t in TRUSTED):
        sc += 6
    if s > 12 * 60:
        sc -= 3
    return sc


def main():
    cache = json.load(open(CACHE, encoding='utf8')) if os.path.exists(CACHE) else {}
    if '--search' in sys.argv:
        for title, (_, _, qs) in E.items():
            for q in qs:
                if not cache.get(q):
                    try:
                        cache[q] = search(q)
                        print('searched', q, len(cache[q]))
                    except Exception as e:
                        print('FAILED', q, e)
        json.dump(cache, open(CACHE, 'w', encoding='utf8'), ensure_ascii=False, indent=0)
    used, out = {}, {}
    for title, (fact, app, qs) in E.items():
        cands = []
        for q in qs:
            for rank, v in enumerate(cache.get(q, [])):
                sc = score(v, rank) - 4 * used.get(v['id'], 0)
                if sc > 0:
                    cands.append((sc, v))
        cands.sort(key=lambda x: -x[0])
        pick, seen = [], set()
        ids = PICK.get(title)
        if ids:
            allv = {v['id']: v for vs in cache.values() for v in vs}
            pick = [dict(id=i[0], t=i[1], ch=i[2], len=i[3]) if isinstance(i, list) else allv[i] for i in ids]
        else:
            for _, v in cands:
                if v['id'] in seen:
                    continue
                seen.add(v['id'])
                pick.append(v)
                if len(pick) == 3:
                    break
        for v in pick:
            used[v['id']] = used.get(v['id'], 0) + 1
        out[title] = dict(fact=fact, use=app, videos=[[v['id'], v['t'], v['ch'], v['len']] for v in pick])
    js = '// Generated by tools/build_extras.py. Edit that file, not this one.\nwindow.EXTRAS=' + json.dumps(out, ensure_ascii=False, indent=0) + ';\n'
    open(os.path.join(ROOT, 'data', 'extras.js'), 'w', encoding='utf8').write(js)
    print('topics', len(out), 'with videos', sum(1 for o in out.values() if o['videos']))


if __name__ == '__main__':
    main()
