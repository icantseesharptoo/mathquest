/* Number facts: a random fact about a number, or facts worked out for any number typed in. Works without internet;
   only the Mars background pictures (Bootprint Space) are loaded from the web. */
const NF=[
  [0,'Zero has no Roman numeral. The Romans had no digit for nothing.'],[0,'Zero is an even number, because 0 = 2 × 0.'],
  [1,'1 is not a prime number. A prime has exactly two factors, and 1 has only one.'],[2,'2 is the only even prime number.'],
  [3,'To test whether a number divides by 3, add its digits. If the sum divides by 3, so does the number.'],[4,'“Four” is the only number whose English name has as many letters as its value.'],
  [4,'Four colours are enough to colour any flat map so that neighbouring countries differ. In 1976 it became the first major theorem proved with the help of a computer.'],
  [5,'There are exactly five Platonic solids: the tetrahedron, cube, octahedron, dodecahedron and icosahedron.'],[6,'6 is the smallest perfect number: its factors below 6 add up to it, 1 + 2 + 3 = 6. It also equals 1 × 2 × 3.'],
  [6,'Bees build hexagons, because hexagons tile a surface with the least wall for equal areas.'],[7,'1 ÷ 7 = 0.142857142857… Multiply 142857 by 2, 3, 4, 5 or 6 and you get the same digits in the same cyclic order.'],
  [7,'In a pair of dice, 7 is the most likely total: 6 of the 36 outcomes give it.'],[8,'8 is the largest cube in the Fibonacci sequence.'],
  [9,'In any multiple of 9, the digits add up to a multiple of 9. Try 9 × 47 = 423: 4 + 2 + 3 = 9.'],[10,'10 = 1 + 2 + 3 + 4, so ten bowling pins make a perfect triangle.'],
  [11,'11 × 11 = 121, 111 × 111 = 12321 and 1111 × 1111 = 1234321.'],[12,'Twelve balls can touch one ball of the same size all at once, and no more than twelve.'],
  [13,'Some cicadas come out of the ground every 13 or 17 years. Both are primes, which may help them avoid predators with regular cycles.'],
  [15,'In the 3 × 3 magic square made from 1 to 9, every row, column and diagonal adds up to 15.'],[16,'16 = 2⁴ = 4². It is the only number that can be written as aᵇ and bᵃ with two different whole numbers.'],
  [17,'There are exactly 17 kinds of repeating wallpaper pattern. Gauss also showed that a regular 17-sided polygon can be drawn with a ruler and compasses.'],
  [18,'A 3 by 6 rectangle has area 18 and perimeter 18.'],[20,'Maya mathematicians counted in twenties, and the French for 80 is still “four twenties” (quatre-vingts).'],
  [21,'Opposite faces of a dice add up to 7, so all its dots together add up to 21.'],[23,'In a group of 23 people, the chance that two share a birthday is a little over one half.'],
  [24,'24 = 1 × 2 × 3 × 4, so four books can be lined up on a shelf in 24 different orders.'],[25,'25 = 3² + 4² and also 5². It gives the famous 3–4–5 right-angled triangle.'],
  [26,'26 is the only whole number that sits exactly between a square (25) and a cube (27).'],[27,'Add the digits of 27³ = 19683: 1 + 9 + 6 + 8 + 3 = 27.'],
  [28,'28 is the second perfect number: 1 + 2 + 4 + 7 + 14 = 28.'],[30,'A 5–12–13 right-angled triangle has area 30 and perimeter 30.'],
  [36,'36 is both a square number (6²) and a triangular number (1 + 2 + … + 8).'],[37,'37 × 3 = 111, so 37 × 27 = 999. Multiply 37 by any multiple of 3 up to 27 and you get three equal digits.'],
  [40,'“Forty” is the only number whose English name has its letters in alphabetical order.'],[42,'In a 3 × 3 × 3 magic cube made from 1 to 27, every line adds up to 42.'],
  [43,'43 was the largest number of chicken nuggets you could not buy exactly with boxes of 6, 9 and 20.'],[45,'45² = 2025, and 20 + 25 = 45.'],
  [52,'A pack of 52 cards can be shuffled in about 8 × 10⁶⁷ ways, so a well-shuffled pack has almost certainly never been in that order before.'],
  [60,'Babylonians counted in sixties about 4000 years ago. That is why an hour has 60 minutes and a full turn has 360°.'],
  [64,'64 is both a square (8²) and a cube (4³). It is the number of squares on a chessboard.'],[65,'In a 5 × 5 magic square made from 1 to 25, every line adds up to 65.'],
  [73,'73 is the 21st prime. Its mirror image 37 is the 12th prime, and 12 is the mirror image of 21.'],[81,'9² = 81 and 8 + 1 = 9.'],
  [89,'1 ÷ 89 = 0.011235…, which starts with the Fibonacci numbers 0, 1, 1, 2, 3, 5.'],[90,'A 9–40–41 right-angled triangle has a perimeter of 90.'],
  [100,'1 + 3 + 5 + … + 19 = 100. The sum of the first n odd numbers is always n².'],[121,'121 reads the same in both directions, and it is the square of 11, which does too.'],
  [128,'Legend says one grain of rice, then two, then four: the eighth square of a chessboard already needs 128 grains.'],
  [144,'144 is the 12th Fibonacci number, and it is also 12².'],[153,'153 = 1³ + 5³ + 3³.'],[180,'The three angles of any flat triangle add up to 180°. On a sphere they add up to more.'],
  [220,'220 and 284 are “friendly” (amicable): the proper factors of each add up to the other.'],[256,'A byte has 8 bits, so it can store 2⁸ = 256 different values.'],
  [365,'365 = 10² + 11² + 12² = 13² + 14².'],[370,'370 = 3³ + 7³ + 0³.'],[407,'407 = 4³ + 0³ + 7³.'],[495,'Take a three-digit number whose digits are not all equal. Sort its digits down and up, subtract, and repeat: you always reach 495.'],
  [666,'666 = 1 + 2 + 3 + … + 36.'],[687,'A year on Mars lasts about 687 Earth days.'],[1001,'1001 = 7 × 11 × 13. Multiply a three-digit number by 1001 to write it twice: 345 × 1001 = 345345.'],
  [1089,'Take a three-digit number whose first and last digits differ by more than 1. Reverse it and subtract the smaller, then add the reverse of the result: you always get 1089.'],
  [1729,'1729 = 1³ + 12³ = 9³ + 10³. It is the smallest number that is a sum of two positive cubes in two ways, as Ramanujan told Hardy about a taxi.'],
  [1634,'1634 = 1⁴ + 6⁴ + 3⁴ + 4⁴.'],[5040,'5040 = 7! and it has 60 factors. Plato thought it the ideal number of citizens for a city.'],
  [6174,'Take a four-digit number whose digits are not all equal. Sort its digits down and up, subtract, and repeat: within 7 steps you reach 6174.'],
  [8128,'8128 is the fourth perfect number: its proper factors add up to it.'],[10000,'The word “myriad” comes from the Greek word for 10 000.'],
  [40320,'8! = 40 320 is the number of orders in which eight runners can finish a race without ties.'],[142857,'142857 × 7 = 999 999.'],
  [1000000,'Counting to one million at one number per second, without a break, takes about 11 days 14 hours.'],[1000000000,'One billion seconds is about 31.7 years.'],
  [3.14159,'π never ends and never repeats. About 40 decimal places would give the circumference of the visible universe to within the width of an atom.'],
  [1.61803,'The golden ratio φ is the only positive number that becomes its own square when you add 1.'],[2.71828,'Money growing at 100% a year, compounded every instant, is multiplied by e ≈ 2.71828 after one year.'],
  [1.41421,'Every A4, A3 or A5 sheet has sides in the ratio √2 : 1, so folding it in half keeps the shape.'],
  [0.38,'Gravity on Mars is about 0.38 of Earth’s, so a person who can lift 50 kg here could lift about 130 kg there.'],
  [2,'Mars has two small moons, Phobos and Deimos.'],[21.9,'The volcano Olympus Mons on Mars is about 21.9 km high, about two and a half times the height of Mount Everest above sea level.']
];
const nfFmt=n=>Number.isInteger(n)?String(n).replace(/\B(?=(\d{3})+$)/g,' '):String(n);
function nfRoman(n){let s='';for(const [v,t] of [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']])while(n>=v){s+=t;n-=v}return s}
function nfFactors(n){const f=[];for(let i=1;i*i<=n;i++)if(n%i===0){f.push(i);if(i*i!==n)f.push(n/i)}return f.sort((a,b)=>a-b)}
function nfPrimes(n){const o=[];for(let p=2;p*p<=n;p++){let k=0;while(n%p===0){n/=p;k++}if(k)o.push([p,k])}if(n>1)o.push([n,1]);return o}
// facts worked out for a whole number from 1 to 1 000 000
function nfWork(n){
  const o=[],F=nfFactors(n),pf=nfPrimes(n),sup=k=>k>1?`<sup>${k}</sup>`:'',s=Math.round(Math.sqrt(n)),c=Math.round(Math.cbrt(n)),t=Math.round((Math.sqrt(8*n+1)-1)/2);
  if(n===1)o.push('1 has only one factor, so it is neither prime nor composite.');
  else if(F.length===2){o.push(`${nfFmt(n)} is a <b>prime</b> number.`);let a=n-1,b=n+1;while(a>1&&nfFactors(a).length!==2)a--;while(nfFactors(b).length!==2)b++;o.push(a>1?`The primes next to it are ${nfFmt(a)} and ${nfFmt(b)}.`:`The next prime is ${nfFmt(b)}.`)}
  else{o.push(`As a product of primes: ${nfFmt(n)} = <b>${pf.map(([p,k])=>p+sup(k)).join(' × ')}</b>.`);o.push(`It has <b>${F.length} factors</b>${F.length<=16?': '+F.map(nfFmt).join(', '):''}.`)}
  if(n>1){const d=sum(F)-n;if(d===n)o.push('It is a <b>perfect number</b>: its proper factors add up to it.');else if(F.length>2)o.push(`Its proper factors add up to ${nfFmt(d)}, so it is ${d>n?'<b>abundant</b> (more than the number)':'<b>deficient</b> (less than the number)'}.`)}
  if(s*s===n)o.push(`It is a <b>square</b>: ${nfFmt(s)}² = ${nfFmt(n)}, the sum of the first ${s===1?'odd number':nfFmt(s)+' odd numbers'}.`);
  if(c*c*c===n)o.push(`It is a <b>cube</b>: ${c}³ = ${nfFmt(n)}.`);
  if(t*(t+1)/2===n)o.push(`It is a <b>triangular number</b>${t>1?`: 1 + … + ${nfFmt(t)} = ${nfFmt(n)}`:''}.`);
  let a=1,b=2;while(b<n)[a,b]=[b,a+b];if(n===1||b===n)o.push('It is a <b>Fibonacci number</b>.');
  if(String(n).length>1&&String(n)===[...String(n)].reverse().join(''))o.push('It is a <b>palindrome</b>: it reads the same in both directions.');
  if(s*s!==n)for(let x=1;x*x*2<=n;x++){const y=Math.round(Math.sqrt(n-x*x));if(x*x+y*y===n){o.push(`It is a sum of two squares: ${x}² + ${y}² = ${nfFmt(n)}.`);break}}
  o.push(`In binary it is <b>${n.toString(2)}</b>${n<4000?`, and in Roman numerals <b>${nfRoman(n)}</b>`:''}.`);
  return o;
}
function numberFacts(){
  const o=openOverlay('nf',`<div class="ovbar"><b>Number facts</b><span class="sp"></span><form class="row nfform"><input type="text" inputmode="numeric" name="n" placeholder="Type a number" aria-label="Number" autocomplete="off"><button class="btn alt">Facts about it</button></form><button class="btn" data-k="rnd">Random fact</button><button class="btn" data-close>Close ✕</button></div>
    <div class="nfbody"><img class="nfbg" alt="" referrerpolicy="no-referrer"><div class="nfcard"><div class="nfnum"></div><div class="nftext"></div></div><div class="nfsrc">Background: Mars, <a href="https://bootprint.space" target="_blank" rel="noopener">Bootprint Space</a></div></div>`);
  let bag=[];const bg=$('.nfbg',o);bg.onerror=()=>{bg.hidden=$('.nfsrc',o).hidden=true};bg.src=`https://cdn.bootprint.space/mars/${1+Math.floor(Math.random()*4)}.png`;
  const show=(n,h)=>{$('.nfnum',o).textContent=nfFmt(n);$('.nftext',o).innerHTML=h;const c=$('.nfcard',o);if(!REDUCED())c.animate([{transform:'scale(.9)',opacity:0},{transform:'none',opacity:1}],{duration:400,easing:'ease-out'})};
  const rnd=()=>{if(!bag.length)bag=mkR(rndSeed()).shuffle(NF);const [n,t]=bag.pop();show(n,`<p>${t}</p>`)};
  $('[data-k=rnd]',o).onclick=rnd;
  $('form',o).onsubmit=e=>{e.preventDefault();const n=Number(e.target.n.value.replace(/[\s,]/g,''));
    if(!e.target.n.value.trim()||!Number.isInteger(n)||n<0||n>1e6){$('.nfnum',o).textContent='?';$('.nftext',o).innerHTML='<p>Type a whole number from 0 to 1 000 000.</p>';return}
    const own=NF.filter(f=>f[0]===n).map(f=>f[1]);show(n,`<ul>${[...own,...(n?nfWork(n):[])].map(x=>`<li>${x}</li>`).join('')}</ul>`)};
  rnd();
}
