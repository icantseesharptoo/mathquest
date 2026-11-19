/* Scheme of work: every unit = 1 week = 6 lessons x 40 minutes.
   Lessons 1-5 teach; lesson 6 is review + a 20-minute unit test (built automatically).
   items: e/m/h + index into T7[unit].easy/medium/hard  (which generated problem types the lesson uses). */
const LESSON_DATA={
t01:[
 ['Adding & subtracting integers','Add and subtract positive and negative whole numbers using a number line.',['On a number line, adding a positive moves right; adding a negative moves left.','Subtracting a negative is the same as adding a positive: 5 − (−3) = 8.','Temperatures below zero are negative numbers.'],'e0 e1 e3 m0',{op:'+'}],
 ['Multiplying & dividing integers','Multiply and divide positive and negative numbers using the sign rules.',['Same signs → positive answer. Different signs → negative answer.','This works for both × and ÷.','Multiply or divide the numbers first, then decide the sign.'],'e2 m1 h0',{}],
 ['Multiples & lowest common multiple','Find multiples and the lowest common multiple (LCM) of two numbers.',['A multiple is in the times table of the number.','The LCM is the smallest number that is a multiple of both.','LCM problems: “when do two things happen together again?”'],'m2 h1',{}],
 ['Factors & highest common factor','Find factors and the highest common factor (HCF) of two numbers.',['A factor divides exactly into a number.','The HCF is the biggest factor shared by both numbers.','HCF problems: “cut into equal pieces, as long as possible”.'],'m3 h3',{}],
 ['Divisibility, squares & roots','Use divisibility tests and find square and cube roots.',['Divisible by 3 (or 9) if the digit sum is divisible by 3 (or 9).','√ undoes squaring; ∛ undoes cubing.','Work out roots and powers before adding or subtracting.'],'m4 h2 h4',{}]],
t02:[
 ['Substituting into expressions & formulae','Replace letters with numbers in expressions and formulae.',['An expression has no “=”; a formula links quantities with “=”.','Write the number in place of the letter, then follow BIDMAS.','3x means 3 × x.'],'e0 m0',{a:2,b:3,c:11,x:4}],
 ['Simplifying & expanding brackets','Expand a bracket and collect like terms.',['Multiply every term inside the bracket: 3(x + 4) = 3x + 12.','Like terms (same letter) can be added: 3x + 2x = 5x.','Check by substituting a number for x.'],'e0 m3',{}],
 ['Solving one-step equations','Solve equations using one inverse operation.',['Do the same to both sides to keep the equation balanced.','Undo + with −, × with ÷.','Check your answer by substituting.'],'e1 e2 e3',{a:1,b:5,c:12,x:0}],
 ['Solving two-step equations','Solve equations with two steps and build equations from words.',['Undo the + or − first, then the × or ÷.','“I think of a number…” → let the number be x.','Always write one step per line.'],'m1 m2 h3',{a:3,b:2,c:14,x:0}],
 ['Brackets, unknowns on both sides & inequalities','Solve harder equations and simple inequalities.',['Expand brackets first, then collect x-terms.','Collect x-terms on one side, numbers on the other.','An inequality (<, >) is solved like an equation; list the whole numbers that fit.'],'h0 h1 h2',{}]],
t03:[
 ['Place value','Read and write the value of digits in whole numbers and decimals.',['Each column is 10 times bigger than the one to its right.','The value of a digit = digit × its column.','Th H T U . tenths hundredths.'],'e3 e0',{to:'100'}],
 ['Multiplying & dividing by 10, 100, 1000','Move digits to multiply and divide by powers of 10.',['× 10: digits move 1 place left. × 100: 2 places. × 1000: 3 places.','÷ moves the digits right.','Chain operations: work left to right.'],'e0 e1 h2',{}],
 ['Rounding whole numbers','Round to the nearest 10, 100 and 1000.',['Look at the digit to the right of the rounding place.','5 or more rounds up; 4 or less rounds down.','“To the nearest hundred” means within 50.'],'e2 m0 m2 h1',{to:'10'}],
 ['Rounding decimals','Round to the nearest whole number and to decimal places.',['To round to 1 d.p., look at the 2nd decimal digit.','To round to 2 d.p., look at the 3rd decimal digit.','Write the final zero if needed (3.50).'],'m1 h3',{to:'0.1'}],
 ['Estimating calculations','Estimate answers by rounding first.',['Round each number to 1 significant figure or nearest 10.','Estimate first, then compare with the exact answer.','Use ≈ for “approximately equal to”.'],'m3 h0 m2',{to:'10'}]],
t04:[
 ['Ordering decimals','Compare and order decimals.',['Give each number the same number of decimal places.','Compare digit by digit from the left.','0.5 is bigger than 0.45!'],'e2 e0 e1',{}],
 ['Adding & subtracting decimals','Add and subtract decimals with the decimal points lined up.',['Line up the decimal points.','Fill empty places with zeros if it helps.','Money: always two decimal places.'],'e0 e1 h0',{}],
 ['Multiplying decimals','Multiply decimals by whole numbers and by decimals.',['Ignore the decimal points, multiply, then put the point back.','Count the total decimal places in the question.','0.3 × 0.4 = 0.12 (not 1.2).'],'m3 m0 h2 h3',{}],
 ['Dividing decimals','Divide decimals by whole numbers and by decimals.',['Divide as if there were no decimal point.','To divide by a decimal, multiply both numbers by 10 or 100.','6 ÷ 0.5 = 12 (how many halves in 6?).'],'m1 m2 h1',{}],
 ['Money & problem solving with decimals','Solve multi-step problems with decimals and money.',['Read the question twice; decide what to find first.','Use estimates to check your answer.','Show every step.'],'e0 e1 m3 h0 h3',{}]],
t05:[
 ['Angles on a straight line','Use “angles on a line add to 180°” to find missing angles.',['Angles on a straight line add up to 180°.','Name angles: acute, right, obtuse, reflex.','Write a calculation: 180 − 65 = 115.'],'e0 m0 h0',{k:'line'}],
 ['Angles around a point','Use “angles at a point add to 360°”.',['A full turn is 360°.','Add the known angles, subtract from 360°.','Check: all angles add up to 360°.'],'e1 m1 h1',{k:'point'}],
 ['Vertically opposite angles','Use the fact that vertically opposite angles are equal.',['When two lines cross, opposite angles are equal.','Neighbouring angles add up to 180°.','Draw the X shape and mark the equal pairs.'],'e2 m2 h2',{k:'vo'}],
 ['Angles in triangles','Use the angle sum of a triangle and properties of isosceles triangles.',['Angles in a triangle add up to 180°.','Equal sides (dashes) mean equal base angles.','Tear-the-corners shows 3 angles make a straight line.'],'e3 m3 m5 h3',{k:'tri'}],
 ['Angles in quadrilaterals','Use the angle sum of a quadrilateral (360°) and draw angles accurately.',['Angles in a quadrilateral add up to 360°.','Split a quadrilateral into two triangles: 2 × 180°.','Use a protractor: line up the baseline, read the correct scale.'],'e4 m4 h4',{k:'quad'}]],
t06:[
 ['Mode & range','Find the mode and range of a data set.',['Mode = the value that appears most often.','Range = largest − smallest.','There can be more than one mode, or none.'],'e1 e2 m3',{t:'2, 5, 5, 8, 9, 5, 12'}],
 ['The mean','Calculate the mean and use it to find missing values.',['Mean = total ÷ number of values.','Total = mean × number of values.','The mean does not have to be a whole number.'],'e3 m0 h0',{t:'6, 8, 8, 10, 13'}],
 ['The median','Find the median of odd and even sized data sets.',['Put the numbers in order first!','Odd count: the middle value.','Even count: the mean of the two middle values.'],'e0 m1',{t:'7, 2, 9, 4, 5'}],
 ['Frequency tables & comparing data','Use frequency tables and compare two sets of data.',['Mean from a table: Σ(value × frequency) ÷ Σ frequency.','Compare using an average AND the range.','Larger range = more spread out.'],'m2 h3 h1',{t:'1, 2, 2, 3, 3, 3, 4'}],
 ['Samples & problem solving with data','Explain samples and solve harder averages problems.',['A sample is a small group chosen from the population.','A bigger, random sample is fairer.','Missing value problems: use total = mean × n.'],'h2 h0 h1 m0',{}]],
t07:[
 ['Equivalent fractions & fractions of amounts','Find equivalent fractions and fractions of an amount.',['Multiply (or divide) top and bottom by the same number.','To find 3/5 of 40: ÷ 5, then × 3.','Simplest form: divide by the highest common factor.'],'e2 e1',{n:3,d:4,m:2}],
 ['Adding & subtracting fractions','Add and subtract fractions with the same and different denominators.',['Same denominator: add or subtract the numerators only.','Different denominators: find a common denominator first.','Simplify your answer.'],'e0 m3 m0',{n:1,d:2,m:2}],
 ['Mixed numbers & improper fractions','Add mixed numbers and convert to improper fractions.',['Add the whole numbers, then the fractions.','Improper fraction: top ≥ bottom (7/4).','Mixed number: whole + fraction (1 3/4).'],'m1 m0 e0',{n:7,d:4,m:1}],
 ['Multiplying fractions','Multiply fractions and mixed numbers.',['Top × top, bottom × bottom.','Change mixed numbers into improper fractions first.','Simplify before or after multiplying.'],'m2 e1 h3',{n:2,d:3,m:1}],
 ['Dividing fractions & problem solving','Divide fractions and solve fraction problems.',['Keep – change – flip: a/b ÷ c/d = a/b × d/c.','Find “the rest”: 1 − fraction spent.','Find the whole from a part: find one part first.'],'h0 h1 h2',{}]],
t08:[
 ['Lines of symmetry','Find lines of symmetry of 2D shapes.',['A line of symmetry splits a shape into two mirror images.','A regular polygon with n sides has n lines.','Test with a mirror or by folding.'],'e0 m1 h1 h3',{n:6}],
 ['Rotational symmetry','Find the order of rotational symmetry.',['Order = how many times a shape fits on itself in one full turn.','Smallest turn = 360° ÷ order.','No symmetry has order 1.'],'m0 m1 h2',{n:5}],
 ['Circles & regular polygons','Use circle words and properties of regular polygons.',['Diameter = 2 × radius.','Radius, diameter, chord, circumference.','A regular polygon has equal sides and equal angles.'],'e2 h1 e0',{n:8}],
 ['3D shapes: faces, edges, vertices','Count faces, edges and vertices and use Euler’s formula.',['Face = flat surface; edge = where faces meet; vertex = corner.','Euler: V − E + F = 2.','Prisms, pyramids, cubes, cuboids.'],'e1 h0',{n:4}],
 ['Congruent shapes','Recognise congruent shapes and use matching angles.',['Congruent shapes are identical in shape and size.','Matching angles and sides are equal (A↔P, B↔Q).','Shapes can be rotated or reflected and still be congruent.'],'m2 h2 e0',{n:3}]],
t09:[
 ['Term-to-term rules','Continue sequences using a term-to-term rule.',['Find the difference between terms.','The rule: “add 4” or “multiply by 2 and add 1”.','Fibonacci-type: add the previous two terms.'],'e0 e1 e2 m1 m3',{a:3,d:4,n:8}],
 ['Position-to-term rules','Find terms using the nth-term rule.',['nth term = 4n + 1 : replace n with the position.','n is the position of the term (1st, 2nd, 3rd…).','Check by finding the first terms.'],'m0 e2',{a:5,d:3,n:6}],
 ['Finding the nth term','Find the nth term of a linear sequence.',['The coefficient of n = the common difference.','nth term = d × n + (first term − d).','Test your rule on the first term.'],'m2 h3',{a:7,d:5,n:6}],
 ['Using the nth term','Decide whether a number is in a sequence and find the first term over a value.',['Solve dn + b = T to find the position n.','n must be a whole number.','“First term greater than…” → solve the inequality.'],'h0 h1',{a:2,d:6,n:8}],
 ['Patterns & problem solving','Use sequences to solve pattern problems (e.g. matchsticks).',['Draw the first few patterns and count.','Find how much each pattern grows.','Use the nth-term rule to predict a big pattern.'],'h2 m2 m0',{a:4,d:3,n:7}]],
t10:[
 ['Fractions, decimals & percentages','Convert between fractions, decimals and percentages.',['Percent means “out of 100”.','Fraction → decimal: divide. Decimal → percent: × 100.','1/2 = 0.5 = 50%, 1/4 = 0.25 = 25%.'],'e1 e2 h2',{p:50}],
 ['Percentages of amounts','Find a percentage of an amount.',['10% = ÷ 10. 50% = ÷ 2. 25% = ÷ 4.','Build other percentages from 10% and 1%.','Check: does your answer make sense?'],'e0 m0 h3',{p:35,a:240}],
 ['Percentage increase & decrease','Increase and decrease an amount by a percentage.',['Find the percentage, then add (increase) or subtract (decrease).','Sale price = original − discount.','Percentage of the original amount.'],'m1 e0',{p:20,a:200}],
 ['One quantity as a percentage of another','Write one number as a percentage of another.',['Part ÷ whole × 100.','Make the numbers into a fraction first.','Test scores: 18 out of 24 → 75%.'],'m2 e1 h3',{p:75}],
 ['Percentage change & problem solving','Find percentage change and reverse percentages.',['% change = change ÷ original × 100.','Reverse: if 20% is 30, then 1% is 1.5.','Always say increase or decrease.'],'h0 h1 h3',{p:15}]],
t11:[
 ['Function machines','Use function machines and work backwards through them.',['A function machine applies operations in order.','To find the input, use inverse operations backwards.','Write the rule as y = ...'],'e0 e2 m0',{m:2,c:1,x:2}],
 ['Coordinates & tables of values','Use coordinates and complete tables of values.',['(x, y): across first, then up or down.','Table: choose x, work out y.','Four quadrants: watch the signs.'],'e2 e1 m0',{m:1,c:2,x:1}],
 ['Plotting y = mx + c','Plot and read straight-line graphs.',['Make a table, plot the points, join with a ruler.','Read y for a given x (or x for a given y).','A straight line has equation y = mx + c.'],'e1 m0 m1',{m:2,c:-1,x:2}],
 ['Gradient & intercept','Find the gradient and y-intercept of a line.',['m is the gradient = rise ÷ run.','c is where the line crosses the y-axis.','Parallel lines have the same gradient.'],'m2 h2',{m:3,c:1,x:1}],
 ['Solving problems with graphs','Find unknown values and where two lines meet.',['At the crossing point the two y-values are equal.','Substitute a point to find an unknown.','Midpoint = mean of the coordinates.'],'h0 h1 h3 m1',{m:1,c:3,x:2}]],
t12:[
 ['Introducing ratio','Write and simplify ratios and use them in simple problems.',['A ratio compares parts: 3 : 2.','Simplify by dividing both parts by the same number.','Find the value of one part first.'],'e0 e2',{a:3,b:2,t:50}],
 ['Sharing in a ratio','Share an amount in a given ratio.',['Add the parts to find the total number of parts.','Divide the amount by the total parts = one part.','Multiply to find each share.'],'e2 m0 h0',{a:2,b:3,t:60}],
 ['Direct proportion & the unitary method','Solve proportion problems by finding the value of one.',['Unitary method: find the value of 1, then scale up.','Double the amount → double the price.','Unit price = price ÷ quantity.'],'e1 m1 h2',{a:1,b:4,t:40}],
 ['Ratio problems','Solve harder ratio problems with 3 parts or a given difference.',['A difference of d between shares is (b − a) parts.','Three-part ratios: add all three.','Draw a bar model.'],'m2 h0',{a:2,b:5,t:70}],
 ['Direct & inverse proportion','Solve direct and inverse proportion and compare best buys.',['More workers → fewer days (inverse).','Currency: multiply by the rate.','Best buy: compare the price of one.'],'h1 h3 m1',{a:3,b:3,t:90}]],
t13:[
 ['The probability scale','Use the probability scale and find P(event).',['0 = impossible, 1 = certain.','P(event) = favourable ÷ total.','Write probabilities as fractions, decimals or percentages.'],'e0 e2',{r:3,b:2,g:1}],
 ['Probability of “not”','Use P(not A) = 1 − P(A).',['All probabilities add up to 1.','P(not rain) = 1 − P(rain).','Check: the answer must be between 0 and 1.'],'e1 h0',{r:2,b:3,g:2}],
 ['Experimental probability','Compare experimental and theoretical probability.',['Relative frequency = successes ÷ trials.','More trials → closer to the theoretical value.','Expected number = probability × trials.'],'m2 m0',{r:1,b:1,g:1}],
 ['Outcomes & sample spaces','List all possible outcomes systematically.',['List outcomes in an organised way.','Two dice: 36 outcomes.','Count favourable outcomes carefully.'],'m1 h2',{r:4,b:4,g:0}],
 ['Probability problems','Solve multi-step probability problems.',['Total counters from a given probability.','Use 1 − (known probabilities).','Expected outcomes in a large number of trials.'],'h0 h1 h3',{r:2,b:5,g:1}]],
t14:[
 ['Translation','Translate shapes and points using left/right/up/down.',['Translation slides a shape without turning it.','Right/left changes x; up/down changes y.','Describe a translation with a vector.'],'e0 h2',{mode:'tr',tx:3,ty:-2}],
 ['Reflection','Reflect points in the x-axis, y-axis and vertical lines.',['The image is the same distance from the mirror line.','y-axis: x changes sign. x-axis: y changes sign.','Reflect in x = k: new x = 2k − x.'],'e1 e2 h1',{mode:'ry'}],
 ['Rotation','Rotate shapes 180° about the origin.',['Rotation turns a shape about a point.','180° about the origin: both signs change.','Use tracing paper to check.'],'m0 e0 h2',{mode:'rot'}],
 ['Enlargement','Enlarge shapes by a scale factor.',['Multiply all lengths by the scale factor.','Coordinates from the origin: multiply by k.','Area is multiplied by k².'],'m2 h0 h3',{mode:'en',k:2}],
 ['Maps & plans','Use scale on maps and plans.',['Scale 1 : 50 000 means 1 cm represents 50 000 cm.','Convert units: 100 000 cm = 1 km.','Measure carefully with a ruler.'],'m1 m3 m2',{}]],
t15:[
 ['Perimeter & area of rectangles','Find perimeter and area of rectangles.',['Perimeter = distance around: 2 × (l + w).','Area = l × w (square units).','Always include units: cm, cm².'],'e0 e1 h2',{sh:'rect',b:6,h:4}],
 ['Triangles & parallelograms','Find areas of triangles and parallelograms.',['Triangle: ½ × base × perpendicular height.','Parallelogram: base × perpendicular height.','The height is NOT the slanted side.'],'e2 m0 h1',{sh:'tri',b:8,h:5}],
 ['Compound shapes & hectares','Find areas of compound shapes and use hectares.',['Split into rectangles, or subtract a missing piece.','1 hectare = 10 000 m².','Convert before you compare.'],'m1 m2',{sh:'rect',b:9,h:6}],
 ['Volume of cuboids','Find the volume of cuboids.',['Volume = length × width × height.','Measured in cubic units: cm³.','Missing side: divide the volume by the other sides.'],'m3 h3',{sh:'cub',b:5,h:3,d:4}],
 ['Surface area & problem solving','Find surface area of cuboids and solve area/volume problems.',['Surface area = the area of all 6 faces.','Pairs of equal faces: 2(lw + lh + wh).','Draw the net to check.'],'h0 h3 m3',{sh:'cub',b:4,h:3,d:2}]],
t16:[
 ['Reading bar charts','Read and compare data in bar charts.',['Read from the top of the bar across to the scale.','Check the scale: it does not always count in 1s.','Total = add the bars.'],'e0 e1 e2',{}],
 ['Line graphs','Read and interpret line graphs.',['A line graph shows change over time.','Change = later value − earlier value.','Range = highest − lowest.'],'m1 h3',{}],
 ['Pie charts','Draw and interpret pie charts.',['Angle = frequency ÷ total × 360°.','Total of all angles = 360°.','To find frequency: angle ÷ 360 × total.'],'m0 m2 h1',{}],
 ['Comparing data sets','Compare data using averages and range.',['Compare an average AND the spread.','Combined mean = total of all ÷ number of all.','Say what the numbers mean in context.'],'h2 h3',{}],
 ['Interpreting results & problem solving','Interpret charts, calculate percentages and spot misleading graphs.',['Percentage = part ÷ total × 100.','Check axes and scale – graphs can mislead.','Choose the best chart for the data.'],'h0 m0 h2',{}]],
};

// attach lessons to TOPICS
const LV={e:'easy',m:'medium',h:'hard'};
TOPICS.forEach(t=>{
  const data=LESSON_DATA[t.id];
  t.lessons=data.map((d,i)=>({n:i+1,title:d[0],obj:d[1],ideas:d[2],items:d[3].split(/\s+/).map(c=>[LV[c[0]],+c.slice(1)]),init:d[4]||{}}));
  const all=[];for(const l of ['easy','medium','hard'])T7[t.id][l].forEach((_,i)=>all.push([l,i]));
  t.lessons.push({n:6,title:'Review & unit test',obj:`Review everything from this week and show what you know in a 15-minute test.`,ideas:t.ideas,items:all,init:{},test:true});
});
function lessonOf(tid,n){const t=TMAP[tid];return t.lessons[Math.max(1,Math.min(6,n||1))-1]}

