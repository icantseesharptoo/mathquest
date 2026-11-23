/* Extra generators for topics in the Edupage plans (Year 8 and Year 10). Needs lib.js and g_y8.js. */

// =====================================================================
//  Year 8 additions
// =====================================================================
const sigRound=(v,s)=>{if(v===0)return 0;const k=Math.floor(Math.log10(Math.abs(v)))+1-s;return rd(Math.round(v/10**k)*10**k,10)};
G.y8_sigfig=(r,lv)=>{
  let v,s;
  if(lv===0){v=r.int(1000,99999);s=pick(r,[1,2])}else if(lv===1){v=rd(r.int(1000,99999)/pick(r,[10,100,1000]),4);s=pick(r,[2,3])}else{v=rd(r.int(1001,9999)/pick(r,[100000,10000]),6);s=pick(r,[1,2,3])}
  const a=sigRound(v,s),first=String(v).replace(/^[0.]+/,'');
  return Qn({text:`Round <b>${v}</b> to <b>${s} significant figure${s>1?'s':''}</b>.`,label:'Answer =',ans:a,ansStr:fmtNum(a),
    steps:[`The first significant figure is the first non-zero digit${v<1?' (zeros at the front do not count)':''}: <b>${first[0]}</b>.`,`Count ${s} significant figure${s>1?'s':''}, then look at the next digit: 5 or more rounds up.`,`${v} ≈ <b>${fmtNum(a)}</b>${Number.isInteger(a)&&a>=10&&a%10===0?' (zeros keep the place value)':''}`],hint:'Start counting at the first non-zero digit.'});
};
const TERMS=[['an expression','3x + 5','has no equals sign'],['an equation','3x + 5 = 20','has an equals sign and can be solved to find x'],['a formula','A = l × w','connects two or more different quantities'],['an identity','2(x + 3) ≡ 2x + 6','is true for every value of x'],['a term','5x²','is a single part of an expression']];
const cap=s=>s[0].toUpperCase()+s.slice(1);
G.y8_algTerms=(r,lv)=>{
  if(lv<2){const [nm,ex,why]=pick(r,TERMS);return mc8(r,`What is <b>${ex}</b>?`,cap(nm),TERMS.map(t=>cap(t[0])),[`${ex} ${why}.`,`So it is <b>${nm}</b>.`])}
  const a=r.int(2,9),b=r.int(2,9),c=r.int(2,9),e=`${a}x² + ${b}x − ${c}`,q=pick(r,['terms','coefficient','constant']);
  return Qn({text:`For the expression <b>${e}</b>, ${q==='terms'?'how many <b>terms</b> are there?':q==='coefficient'?'what is the <b>coefficient of x</b>?':'what is the <b>constant term</b>? (include its sign)'}`,label:'Answer =',ans:q==='terms'?3:q==='coefficient'?b:-c,
    steps:[`The terms are ${a}x², ${b}x and −${c}.`,q==='terms'?`There are <b>3</b> terms.`:q==='coefficient'?`The coefficient of x is the number in front of x: <b>${b}</b>.`:`The constant term has no letter: <b>−${c}</b>.`]});
};
G.y8_algRules=(r,lv)=>{
  const a=r.int(2,7),b=r.int(2,7);
  if(lv===0){const q=pick(r,[[`${a}x × ${b}`,`${a*b}x`],[`${a}x × ${b}x`,`${a*b}x²`],[`${a*b}x ÷ ${a}`,`${b}x`],['x × x × x','x³']]);
    return mc8(r,`Simplify <b>${q[0]}</b>.`,q[1],[`${a+b}x`,`${a*b}x²`,`${a*b}x`,`${a}${b}x`,'3x'],[`Multiply (or divide) the numbers, then the letters: x × x = x².`,`${q[0]} = <b>${q[1]}</b>`])}
  const A=r.int(3,9),B=r.int(1,8),C=r.int(1,A-1),D=r.int(1,8),x=r.int(2,6);
  if(lv===1)return Qn({text:`Simplify <b>${A}x + ${B} − ${C}x + ${D}</b>, then work out its value when x = ${x}.`,ans:(A-C)*x+B+D,steps:[`Collect the x-terms: ${A}x − ${C}x = ${cx(A-C,'x')}`,`Collect the numbers: ${B} + ${D} = ${B+D}`,`${cx(A-C,'x')} + ${B+D}; when x = ${x}: ${A-C} × ${x} + ${B+D} = <b>${(A-C)*x+B+D}</b>`]});
  return Qn({text:`Simplify <b>${A}x² + ${cx(B,'x')} − ${C}x² + ${cx(D,'x')}</b>. What is the <b>coefficient of x²</b>?`,label:'Coefficient =',ans:A-C,steps:[`x² terms and x terms are unlike terms: collect them separately.`,`x² terms: ${A}x² − ${C}x² = ${cx(A-C,'x²')}; x terms: ${cx(B,'x')} + ${cx(D,'x')} = ${B+D}x`,`So the coefficient of x² is <b>${A-C}</b>.`]});
};
G.y8_wordExpr=(r,lv)=>{
  const a=r.int(2,9),b=r.int(1,12);
  const opts=lv===0?[[`I think of a number n, multiply it by ${a} and then add ${b}.`,`${a}n + ${b}`,[`${a}(n + ${b})`,`n + ${a+b}`,`${b}n + ${a}`]],[`I think of a number n, add ${b} and then multiply by ${a}.`,`${a}(n + ${b})`,[`${a}n + ${b}`,`n + ${a*b}`,`${a+b}n`]]]
    :lv===1?[[`Pens cost p cents each and a ruler costs ${b*5} cents. Write the cost of ${a} pens and one ruler.`,`${a}p + ${b*5}`,[`${a}(p + ${b*5})`,`${a+b*5}p`,`p + ${a*b*5}`]],[`Sam is x years old. His mother is ${a} times as old as Sam. His aunt is ${b} years younger than his mother. Write the aunt's age.`,`${a}x − ${b}`,[`${a}x + ${b}`,`${a}(x − ${b})`,`x − ${a*b}`]]]
    :[[`I think of a number n, subtract ${b}, then divide by ${a}.`,`(n − ${b}) ÷ ${a}`,[`n − ${b} ÷ ${a}`,`${a}(n − ${b})`,`n ÷ ${a} − ${b}`]],[`A rectangle is (x + ${b}) cm long and ${a} cm wide. Write its perimeter.`,`2x + ${2*b+2*a}`,[`${a}x + ${a*b}`,`x + ${b+a}`,`2x + ${b+a}`]]];
  const [t,ok,w]=pick(r,opts);return mc8(r,`${t} Which expression is correct?`,ok,w,[`Write the operations in the order they happen. Use brackets for anything that must be done first.`,`Answer: <b>${ok}</b>`]);
};
G.y8_wordEq=(r,lv)=>{
  if(lv===0){const a=r.int(2,9),b=r.int(1,20),n=r.int(2,15);return Qn({text:`I think of a number, multiply it by ${a} and add ${b}. The answer is <b>${a*n+b}</b>. What was my number?`,label:'Number =',ans:n,steps:[`Let the number be n: ${a}n + ${b} = ${a*n+b}`,`Subtract ${b}: ${a}n = ${a*n}`,`Divide by ${a}: n = <b>${n}</b>`]})}
  if(lv===1){const w=r.int(3,15),k=r.int(2,5),P=2*(w+k*w);return Qn({text:`A rectangle is ${k} times as long as it is wide. Its perimeter is <b>${P} cm</b>. Find its <b>width</b>.`,label:'Width =',unit:' cm',ans:w,steps:[`Let the width be w. The length is ${k}w.`,`Perimeter: 2(w + ${k}w) = ${P}, so ${2*(k+1)}w = ${P}`,`w = ${P} ÷ ${2*(k+1)} = <b>${w} cm</b>`]})}
  const x=r.int(3,20),a=r.int(3,6),b=r.int(1,15),c=r.int(1,a-1),d=(a-c)*x+b;
  return Qn({text:`Ali has x marbles. Ben has ${a}x + ${b} marbles. Cara has ${cx(c,'x')} + ${d} marbles. Ben and Cara have the <b>same</b> number of marbles. How many marbles does Ali have?`,label:'x =',ans:x,steps:[`Form an equation: ${a}x + ${b} = ${cx(c,'x')} + ${d}`,`Subtract ${cx(c,'x')} from both sides: ${cx(a-c,'x')} + ${b} = ${d}`,`Subtract ${b}: ${cx(a-c,'x')} = ${d-b}`,`x = <b>${x}</b>`]});
};
// depth of water against time while a bottle fills at a steady rate
const BOTTLES={cyl:'M30,20 L30,120 L90,120 L90,20',wideTop:'M45,120 L75,120 L95,20 L25,20',narrowTop:'M25,120 L95,120 L75,20 L45,20',flask:'M20,120 L100,120 L100,70 L72,42 L72,15 M48,15 L48,42 L20,70 L20,120'};
const depthAt=(k,t)=>k==='cyl'?t:k==='wideTop'?Math.sqrt(t):k==='narrowTop'?1-Math.sqrt(1-t):t<.7?t/.7*.5:.5+(t-.7)/.3*.5;
function depthGraph(kind,ox,oy,lab){
  const pts=[];for(let i=0;i<=24;i++){const t=i/24;pts.push([ox+t*90,oy-depthAt(kind,t)*80])}
  return ln8(ox,oy,ox+96,oy,'#111827',1.6)+ln8(ox,oy,ox,oy-86,'#111827',1.6)+`<polyline points="${ptsAttr(pts)}" fill="none" stroke="${Y8C.blue}" stroke-width="2.6"/>`+tx8(ox+48,oy+14,'time',{fs:11,fw:500})+tx8(ox-9,oy-40,'depth',{fs:11,fw:500,rot:-90})+tx8(ox+8,oy-92,lab,{fs:14,fw:800,c:Y8C.blue,a:'start'});
}
G.y8_fillBottle=(r,lv)=>{
  const kinds=lv===0?['cyl','wideTop','narrowTop']:['cyl','wideTop','narrowTop','flask'],k=pick(r,kinds),order=r.shuffle(kinds),idx=order.indexOf(k);
  const why={cyl:'The bottle is the same width all the way up, so the depth rises at a steady rate: a straight line.',wideTop:'The bottle gets wider towards the top, so the depth rises more and more slowly: the graph gets less steep.',narrowTop:'The bottle gets narrower towards the top, so the depth rises faster and faster: the graph gets steeper.',flask:'The wide bottom fills slowly (gentle slope), then the narrow neck fills quickly (steep slope).'}[k];
  let s=`<path d="${BOTTLES[k]}" fill="#dbeafe" stroke="#111827" stroke-width="2.4" stroke-linejoin="round" transform="translate(0,12)"/>`;order.forEach((o,i)=>{s+=depthGraph(o,155+i*125,128,'ABCD'[i])});
  return MC('Water is poured into the bottle at a steady rate. Which graph shows how the <b>depth</b> of the water changes with <b>time</b>?',order.map((_,i)=>`Graph ${'ABCD'[i]}`),idx,[`Think about the width of the bottle at each height: where it is wider, the level rises more slowly.`,why,`So the answer is <b>Graph ${'ABCD'[idx]}</b>.`],{svg:svgWrap(s,155+order.length*125,150)});
};
G.y8_compare=(r,lv)=>{
  const A=Array.from({length:7},()=>r.int(5,30)),B=Array.from({length:7},()=>r.int(8,26)),range=a=>Math.max(...a)-Math.min(...a),mA=sum(A)/7,mB=sum(B)/7;
  const tb=miniTable([['Class 8A',...A],['Class 8B',...B]]);
  if(lv===0){const w=r.chance(.5)?'A':'B',d=w==='A'?A:B;return Qn({text:`Test scores for two classes:${tb}Find the <b>range</b> for Class 8${w}.`,label:'Range =',ans:range(d),steps:[`Range = highest − lowest = ${Math.max(...d)} − ${Math.min(...d)} = <b>${range(d)}</b>`]})}
  if(lv===1){const d=rd(Math.abs(mA-mB),2);if(d===0)return G.y8_compare(r,lv);return Qn({text:`Test scores for two classes:${tb}Find the <b>difference between the means</b> of the two classes. Give your answer to 2 decimal places if needed.`,label:'Difference =',ans:d,tol:.011,
    steps:[`Mean of 8A = ${sum(A)} ÷ 7 = ${rd(mA,2)}`,`Mean of 8B = ${sum(B)} ÷ 7 = ${rd(mB,2)}`,`Difference = <b>${d}</b>`]})}
  const rA=range(A),rB=range(B);if(Math.abs(mA-mB)<.5||rA===rB)return G.y8_compare(r,lv);
  const hi=mA>mB?'8A':'8B',lo=hi==='8A'?'8B':'8A',cons=rA<rB?'8A':'8B',inc=cons==='8A'?'8B':'8A',ok=`Class ${hi} did better on average; class ${cons} was more consistent.`;
  return mc8(r,`Test scores for two classes:${tb}Which statement is correct?`,ok,[`Class ${hi} did better on average; class ${inc} was more consistent.`,`Class ${lo} did better on average; class ${cons} was more consistent.`,`Class ${lo} did better on average; class ${inc} was more consistent.`],
    [`Compare an average: mean 8A = ${rd(mA,2)}, mean 8B = ${rd(mB,2)}, so ${hi} did better on average.`,`Compare the spread: range 8A = ${rA}, range 8B = ${rB}. The smaller range is more consistent: ${cons}.`,`<b>${ok}</b>`]);
};

// =====================================================================
//  Year 10 additions
// =====================================================================
G.y10_bounds=(r,lv)=>{
  if(lv===0){const acc=pick(r,[1,10,0.1]),v=acc===1?r.int(5,90):acc===10?r.int(5,90)*10:rd(r.int(20,99)/10,1),lower=r.chance(.5),b=rd(lower?v-acc/2:v+acc/2,4),u=pick(r,['cm','kg','m']);
    return Qn({text:`A length is ${v} ${u}, correct to the nearest ${acc===1?'whole number':acc===10?'10':'0.1'} ${u}. Write down its <b>${lower?'lower':'upper'} bound</b>.`,label:'Bound =',unit:' '+u,ans:b,steps:[`Half of the accuracy: ${acc} ÷ 2 = ${acc/2}`,`${lower?'Lower':'Upper'} bound = ${v} ${lower?'−':'+'} ${acc/2} = <b>${b}</b>`]})}
  const a=r.int(5,20),b=r.int(3,15),acc=1;
  if(lv===1)return Qn({text:`A rectangle measures ${a} cm by ${b} cm, both to the nearest cm. Find the <b>upper bound</b> of its area.`,label:'Area =',unit:' cm²',ans:rd((a+.5)*(b+.5),4),steps:[`Upper bounds: ${a+.5} cm and ${b+.5} cm`,`Largest area = ${a+.5} × ${b+.5} = <b>${rd((a+.5)*(b+.5),4)} cm²</b>`]});
  const d=r.int(100,300),t=r.int(2,6);return Qn({text:`A car travels ${d} km (to the nearest km) in ${t} hours (to the nearest hour). Find the <b>lower bound</b> of its average speed. Give your answer to 2 decimal places.`,label:'Speed =',unit:' km/h',ans:rd((d-.5)/(t+.5),2),tol:.011,
    steps:[`Speed = distance ÷ time. For the smallest speed use the smallest distance and the largest time.`,`Lower bound of distance = ${d-.5} km; upper bound of time = ${t+.5} h`,`${d-.5} ÷ ${t+.5} = <b>${rd((d-.5)/(t+.5),2)} km/h</b>`]});
};
const hm=m=>`${String(Math.floor(m/60)%24).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
G.y10_time=(r,lv)=>{
  if(lv===0){const h=r.int(13,23),m=r.int(0,11)*5;return Qn({text:`Write <b>${hm(h*60+m)}</b> (24-hour clock) as a 12-hour time. How many hours past noon is it? (Enter the hour on a 12-hour clock.)`,label:'Hour =',ans:h-12,steps:[`Subtract 12 from the hour: ${h} − 12 = ${h-12}`,`${hm(h*60+m)} = <b>${h-12}:${String(m).padStart(2,'0')} pm</b>`]})}
  const s=r.int(6*12,20*12)*5,d=r.int(7,60)*5;
  if(lv===1)return Qn({text:`A train leaves at <b>${hm(s)}</b> and arrives at <b>${hm(s+d)}</b>. How many <b>minutes</b> does the journey take?`,label:'Time =',unit:' min',ans:d,steps:[`Count up from ${hm(s)} to the next whole hour, then on to ${hm(s+d)}.`,`Journey time = <b>${d} minutes</b> (${Math.floor(d/60)} h ${d%60} min)`]});
  const dist=r.int(4,30)*10,v=pick(r,[40,50,60,80]),mins=dist/v*60;if(!Number.isInteger(mins))return G.y10_time(r,lv);
  return Qn({text:`A bus leaves at ${hm(s)} and travels ${dist} km at an average speed of ${v} km/h. At what time does it arrive? Give the number of <b>minutes past the hour</b>.`,label:'Minutes =',ans:(s+mins)%60,steps:[`Time = distance ÷ speed = ${dist} ÷ ${v} = ${rd(dist/v,3)} h = ${mins} minutes`,`${hm(s)} + ${mins} min = <b>${hm(s+mins)}</b>`]});
};
const quadTxt=(a,b,c)=>`y = ${a===1?'':a===-1?'−':a}x²${b?(b>0?' + ':' − ')+(Math.abs(b)===1?'':Math.abs(b))+'x':''}${c?(c>0?' + ':' − ')+Math.abs(c):''}`;
function curveSvg(fns,{x0=-5,x1=5,y0=-8,y1=8,pts=[],segs=[]}={}){
  let s='';const W=340,H=310,L=40,T=16,pw=W-62,ph=H-46,X=x=>L+(x-x0)/(x1-x0)*pw,Y=y=>T+(y1-y)/(y1-y0)*ph;
  const base=plotSvg({x0,x1,y0,y1,xl:1,yl:2,pts,segs,cls:'sq'});
  fns.forEach(f=>{let d='';for(let i=0;i<=200;i++){const x=x0+(x1-x0)*i/200,y=f.f(x);if(!Number.isFinite(y)||y<y0-1||y>y1+1||(f.skip&&Math.abs(x)<.06)){d+=' ';continue}d+=(d.endsWith(' ')||!d?'M':'L')+f1(X(x))+','+f1(Y(Math.max(y0,Math.min(y1,y))))}s+=`<path d="${d.replace(/\s+/g,' ')}" fill="none" stroke="${f.color||Y8C.blue}" stroke-width="2.6"/>`});
  return base.replace('</svg>',s+'</svg>');
}
G.y10_curve=(r,lv)=>{
  if(lv<2){const a=lv===0?1:pick(r,[1,-1,2]),b=nz(r,-4,4),c=r.int(-5,5),x=nz(r,-3,3),y=a*x*x+b*x+c;
    return Qn({text:`Complete the table of values for <b>${quadTxt(a,b,c)}</b>. What is y when x = ${M(x)}?`,label:'y =',ans:y,steps:[`Substitute x = ${M(x)}: ${a===1?'':a+' × '}(${M(x)})² ${b>0?'+':'−'} ${Math.abs(b)} × ${sg(x)} ${c>=0?'+':'−'} ${Math.abs(c)}`,`= ${a*x*x} ${b*x>=0?'+':'−'} ${Math.abs(b*x)} ${c>=0?'+':'−'} ${Math.abs(c)} = <b>${y}</b>`,`Square first: (${M(x)})² = ${x*x} is positive.`],hint:'A negative number squared is positive.'})}
  const k=pick(r,[6,8,12,24]),x=pick(r,[1,2,3,4,6].filter(v=>k%v===0));return Qn({text:`For the reciprocal graph <b>y = ${k}/x</b>, find y when x = ${x}.`,svg:curveSvg([{f:t=>k/t,skip:true}],{y0:-12,y1:12}),label:'y =',ans:k/x,steps:[`y = ${k} ÷ ${x} = <b>${k/x}</b>`,`The graph is a hyperbola: it never touches the axes.`]});
};
G.y10_curveMC=(r,lv)=>{
  const types=[['Straight line (linear)',t=>2*t+1],['Parabola (quadratic)',t=>t*t-3],['Hyperbola (reciprocal)',t=>4/t],['Cubic',t=>t*t*t/3]],i=r.int(0,3),[nm,f]=types[i];
  return MC('What type of graph is shown?',types.map(t=>t[0]),i,[`Look at the shape: ${['a straight line has a constant gradient','a parabola is a U (or ∩) shape with one turning point','a hyperbola has two separate branches and never touches the axes','a cubic has an S shape'][i]}.`,`So it is a <b>${nm.toLowerCase()}</b>.`],{svg:curveSvg([{f,skip:i===2}])});
};
G.y10_intersect=(r,lv)=>{
  const x=r.int(-3,4),m1=nz(r,-3,3);let m2;do{m2=nz(r,-3,3)}while(m2===m1);const y=r.int(-3,4),c1=y-m1*x,c2=y-m2*x,ask=lv===2?'y':'x';
  return Qn({text:`The lines <b>${lineEq(m1,c1)}</b> and <b>${lineEq(m2,c2)}</b> are drawn. Find the <b>${ask}-coordinate</b> of the point where they cross.`,svg:plotSvg({x0:-6,x1:6,y0:-8,y1:8,xl:2,yl:2,cls:'sq',lines:[{m:m1,c:c1},{m:m2,c:c2,color:Y8C.orange}]}),label:ask+' =',ans:ask==='x'?x:y,
    steps:[`At the crossing point both equations give the same y: ${lin(m1,c1)} = ${lin(m2,c2)}`,`${cx(m1-m2,'x')} = ${M(c2-c1)}, so x = <b>${x}</b>`,`y = ${m1} × ${sg(x)} ${c1>=0?'+':'−'} ${Math.abs(c1)} = <b>${y}</b>. The lines cross at (${x}, ${y}).`],
    frames:[null,null,plotSvg({x0:-6,x1:6,y0:-8,y1:8,xl:2,yl:2,cls:'sq',lines:[{m:m1,c:c1},{m:m2,c:c2,color:Y8C.orange}],pts:[{x,y,color:Y8C.green,label:`(${x}, ${y})`}]})]});
};
const fac=v=>v===0?'x':`(x ${v>0?'−':'+'} ${Math.abs(v)})`;
G.y10_roots=(r,lv)=>{
  let p,q;do{p=r.int(-4,3);q=r.int(-3,4)}while(p>=q);const b=-(p+q),c=p*q,big=lv===2;
  const svg=curveSvg([{f:t=>t*t+b*t+c}],{y0:-8,y1:8});
  return Qn({text:`The graph of <b>${quadTxt(1,b,c)}</b> is shown. Use it to solve <b>${quadTxt(1,b,c).slice(4)} = 0</b>. Give the ${big?'larger':'smaller'} root.`,svg,label:'x =',ans:big?q:p,
    steps:[`The roots are where the curve crosses the x-axis (y = 0).`,`It crosses at x = ${p} and x = ${q}.`,`Check by factorising: ${fac(p)}${fac(q)} = 0. The ${big?'larger':'smaller'} root is <b>${big?q:p}</b>.`],
    frames:[null,curveSvg([{f:t=>t*t+b*t+c}],{y0:-8,y1:8,pts:[{x:p,y:0,color:Y8C.green,label:String(p),dy:14},{x:q,y:0,color:Y8C.green,label:String(q),dy:14}]}),null]});
};
const UNITS=[['km','m',1000],['m','cm',100],['cm','mm',10],['kg','g',1000],['litres','ml',1000],['m²','cm²',10000],['cm³','mm³',1000],['hours','minutes',60]];
G.y10_units=(r,lv)=>{
  const [big,small,k]=lv===2?pick(r,UNITS.slice(5,7)):pick(r,UNITS.filter((u,i)=>i<5||i===7)),v=lv===0?r.int(2,40):rd(r.int(11,99)/10,2),toSmall=r.chance(.5);
  return toSmall?Qn({text:`Convert <b>${v} ${big}</b> into ${small}.`,label:'Answer =',unit:' '+small,ans:rd(v*k,6),steps:[`1 ${big} = ${pr(k)} ${small}${big==='m²'?' (100 × 100)':big==='cm³'?' (10 × 10 × 10)':''}`,`${v} × ${pr(k)} = <b>${fmtNum(rd(v*k,6))} ${small}</b>`]})
    :Qn({text:`Convert <b>${fmtNum(rd(v*k,6))} ${small}</b> into ${big}.`,label:'Answer =',unit:' '+big,ans:v,steps:[`1 ${big} = ${pr(k)} ${small}`,`${fmtNum(rd(v*k,6))} ÷ ${pr(k)} = <b>${v} ${big}</b>`]});
};
G.y10_sector=(r,lv)=>{
  const R=r.int(3,15),a=pick(r,[30,45,60,72,90,120,135,150,240]),area=lv!==0&&r.chance(.6),v=area?Math.PI*R*R*a/360:2*Math.PI*R*a/360;
  const s=`<path d="M100,100 L${f1(P(100,100,80,0)[0])},${f1(P(100,100,80,0)[1])} ${arcPath(100,100,80,0,a).replace(/^M[^A]+/,'')} Z" fill="#c7d2fe" stroke="#111827" stroke-width="2.2"/>`+tx8(100+40,108,`${R} cm`,{fs:13})+tx8(...P(100,100,24,a/2),`${a}°`,{fs:13,c:Y8C.orange});
  if(lv===2&&!area){const per=v+2*R;return Qn({text:`A sector has radius ${R} cm and angle ${a}°. Find its <b>perimeter</b> to 1 decimal place.`,svg:svgWrap(s,200,200,10),label:'Perimeter =',unit:' cm',ans:rd(per,1),tol:.051,ansStr:rd(per,1).toFixed(1),steps:[`Arc length = ${a}/360 × 2π × ${R} = ${rd(v,3)} cm`,`Perimeter = arc + 2 radii = ${rd(v,3)} + ${2*R} = <b>${rd(per,1).toFixed(1)} cm</b>`]})}
  return Qn({text:`A sector has radius ${R} cm and angle ${a}°. Find its <b>${area?'area':'arc length'}</b> to 1 decimal place.`,svg:svgWrap(s,200,200,10),label:area?'Area =':'Arc =',unit:area?' cm²':' cm',ans:rd(v,1),tol:.051,ansStr:rd(v,1).toFixed(1),
    steps:[`The sector is ${a}/360 of the whole circle.`,area?`Area = ${a}/360 × π × ${R}² = ${rd(v,3)}`:`Arc length = ${a}/360 × 2π × ${R} = ${rd(v,3)}`,`≈ <b>${rd(v,1).toFixed(1)} ${area?'cm²':'cm'}</b>`]});
};
