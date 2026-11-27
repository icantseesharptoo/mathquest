/* Key words slides: "Key words" (English and Russian) and "Word meanings" (simple explanation,
   example and a picture). The words are in data/terms.js; the pictures are drawn here as small SVGs. */
const TV={A:'#e8590c',B:'#1c7ed6',G:'#2f9e44',P:'#7c3aed',R:'#e03131'};
const tvS=b=>`<svg viewBox="0 0 200 120" class="tvis" aria-hidden="true">${b}</svg>`;
const tvT=(x,y,t,o={})=>`<text x="${x}" y="${y}" font-size="${o.s||13}" text-anchor="${o.a||'middle'}" dominant-baseline="central" fill="${o.c||'currentColor'}" font-weight="${o.w||600}"${o.i?' font-style="italic"':''}>${t}</text>`;
const tvL=(x1,y1,x2,y2,o={})=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.c||'currentColor'}" stroke-width="${o.w||2}"${o.d?' stroke-dasharray="4 3"':''} stroke-linecap="round"/>`;
const tvP=(pts,o={})=>`<polygon points="${pts}" fill="${o.f||'none'}" fill-opacity="${o.o||.25}" stroke="${o.c||'currentColor'}" stroke-width="${o.w||2}" stroke-linejoin="round"/>`;
const tvPL=(pts,o={})=>`<polyline points="${pts}" fill="none" stroke="${o.c||'currentColor'}" stroke-width="${o.w||2}" stroke-linejoin="round" stroke-linecap="round"${o.d?' stroke-dasharray="4 3"':''}/>`;
const tvC=(x,y,r,o={})=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${o.f||'none'}" fill-opacity="${o.o||.25}" stroke="${o.c||'currentColor'}" stroke-width="${o.w===undefined?2:o.w}"/>`;
const tvR=(x,y,w,h,o={})=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r||0}" fill="${o.f||'none'}" fill-opacity="${o.o||.25}" stroke="${o.c||'currentColor'}" stroke-width="${o.w===undefined?2:o.w}"/>`;
const tvPt=(cx,cy,r,a)=>[cx+r*Math.cos(a*Math.PI/180),cy-r*Math.sin(a*Math.PI/180)];
// angle arc from a0 to a1 degrees (anticlockwise, maths style), optionally filled
const tvArc=(cx,cy,r,a0,a1,o={})=>{const [x0,y0]=tvPt(cx,cy,r,a0),[x1,y1]=tvPt(cx,cy,r,a1),big=((a1-a0+360)%360)>180?1:0;
  return `<path d="M${o.fill?`${cx},${cy} L`:''}${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${big} 0 ${x1.toFixed(1)},${y1.toFixed(1)}${o.fill?' Z':''}" fill="${o.fill||'none'}" fill-opacity="${o.o||.3}" stroke="${o.c||TV.A}" stroke-width="${o.w||2}"/>`};
const tvSq=(x,y,s=9)=>tvPL(`${x+s},${y} ${x+s},${y-s} ${x},${y-s}`,{w:1.5});
const tvArrow=(x1,y1,x2,y2,c='currentColor')=>{const a=Math.atan2(y2-y1,x2-x1),h=7;return tvL(x1,y1,x2,y2,{c})+`<polygon points="${x2},${y2} ${(x2-h*Math.cos(a-.4)).toFixed(1)},${(y2-h*Math.sin(a-.4)).toFixed(1)} ${(x2-h*Math.cos(a+.4)).toFixed(1)},${(y2-h*Math.sin(a+.4)).toFixed(1)}" fill="${c}"/>`};
// graph axes: x from x0 to x1 and y from y0 to y1 mapped into the box; returns [svg, map]
const tvAx=(x0,x1,y0,y1,o={})=>{const L=o.l||22,Rr=o.r||188,T=o.t||8,B=o.b||112,mx=x=>L+(x-x0)/(x1-x0)*(Rr-L),my=y=>B-(y-y0)/(y1-y0)*(B-T);
  let s='';if(o.grid)for(let x=Math.ceil(x0);x<=x1;x++)s+=tvL(mx(x),T,mx(x),B,{c:'currentColor',w:.3});if(o.grid)for(let y=Math.ceil(y0);y<=y1;y++)s+=tvL(L,my(y),Rr,my(y),{c:'currentColor',w:.3});
  const ax=Math.max(x0,Math.min(x1,0)),ay=Math.max(y0,Math.min(y1,0));s+=tvArrow(L,my(ay),Rr,my(ay))+tvArrow(mx(ax),B,mx(ax),T)+tvT(Rr-4,my(ay)+(my(ay)>100?-9:9),'x',{s:11,i:1})+tvT(mx(ax)+9,T+4,'y',{s:11,i:1});
  return [s,(x,y)=>[+mx(x).toFixed(1),+my(y).toFixed(1)]]};
const tvCurve=(m,f,a,b,o={})=>{let p=[];for(let i=0;i<=60;i++){const x=a+(b-a)*i/60,y=f(x);if(Number.isFinite(y))p.push(m(x,y).join(','))}return tvPL(p.join(' '),{c:o.c||TV.B,w:o.w||2.5})};
const tvDot=(x,y,c=TV.A,r=4)=>tvC(x,y,r,{f:c,o:1,c,w:0});
const tvBox=(x,y,w,h,t,c)=>tvR(x,y,w,h,{f:c||'none',o:c?.2:0,r:4})+tvT(x+w/2,y+h/2,t);
const tvCube=(x,y,s,d,o={})=>{const f=o.f||TV.B;return tvP(`${x},${y} ${x+s},${y} ${x+s},${y+s} ${x},${y+s}`,{f,o:.15})+tvP(`${x},${y} ${x+d},${y-d} ${x+s+d},${y-d} ${x+s},${y}`,{f,o:.3})+tvP(`${x+s},${y} ${x+s+d},${y-d} ${x+s+d},${y+s-d} ${x+s},${y+s}`,{f,o:.45})};

// tally marks: groups of four lines crossed by a fifth
const tvTally=(x,y,n)=>{let s='',k=0;for(let g=0;g<n;g+=5){const m=Math.min(5,n-g);for(let i=0;i<Math.min(4,m);i++)s+=tvL(x+k+i*5,y-7,x+k+i*5,y+7,{w:1.5});if(m===5)s+=tvL(x+k-3,y+5,x+k+18,y-5,{w:1.5});k+=28}return s};
const TVIS={
count:()=>tvS([1,2,3,4,5].map((n,i)=>tvC(25+i*37,50,13,{f:TV.B})+tvT(25+i*37,50,n)+tvT(25+i*37,85,'●'.repeat(Math.min(n,5)),{s:9,c:TV.B})).join('')+tvT(100,108,'1, 2, 3, 4, 5 …',{s:12})),
numline:()=>{let s=tvArrow(10,60,192,60)+tvL(192,60,8,60);for(let n=-4;n<=4;n++){const x=100+n*21;s+=tvL(x,54,x,66)+tvT(x,80,n<0?'−'+(-n):n,{s:12,c:n<0?TV.R:n>0?TV.B:'currentColor'})}
  return tvS(s+tvT(40,35,'negative',{s:12,c:TV.R})+tvT(160,35,'positive',{s:12,c:TV.B})+tvT(100,35,'0',{s:12}))},
sets:()=>tvS(tvR(6,6,188,108,{r:14,f:TV.P,o:.08})+tvR(24,22,150,88,{r:12,f:TV.B,o:.1})+tvR(44,40,96,64,{r:10,f:TV.G,o:.12})+tvT(100,16,'rational  ¾, 0.5, −2',{s:11})+tvT(100,32,'integers  −3, 0, 7',{s:11})+tvT(92,64,'natural',{s:11})+tvT(92,82,'1, 2, 3',{s:11})+tvT(185,100,'√2',{s:12,c:TV.R,a:'end'})),
sqdots:()=>{let s='';[1,2,3,4].forEach((n,k)=>{const x0=[10,32,66,112][k];for(let i=0;i<n;i++)for(let j=0;j<n;j++)s+=tvDot(x0+i*12,82-j*12,TV.B,4);s+=tvT(x0+(n-1)*6,104,n*n,{s:13})});return tvS(s+tvT(178,60,'4 × 4',{s:12})+tvT(178,76,'= 16',{s:12}))},
cube:()=>tvS(tvCube(20,50,34,14)+tvT(44,104,'2³ = 8',{s:12})+tvCube(100,40,52,20)+tvL(100,40,152,40,{w:.6})+tvL(117,40,117,92,{w:.6})+tvL(135,40,135,92,{w:.6})+tvL(100,57,152,57,{w:.6})+tvL(100,75,152,75,{w:.6})+tvT(135,110,'3³ = 27',{s:12})),
factors:()=>{const p=[[1,12],[2,6],[3,4]];let s='';p.forEach(([a,b],k)=>{const y=14+k*36;for(let i=0;i<a;i++)for(let j=0;j<b;j++)s+=tvR(8+j*8,y+i*8,7,7,{f:[TV.B,TV.G,TV.P][k],o:.6,w:0});s+=tvT(120,y+a*4,`${a} × ${b} = 12`,{s:12,a:'start'})});return tvS(s)},
multiples:()=>{let s=tvL(10,80,190,80);for(let n=0;n<=15;n++){const x=12+n*11.5;s+=tvL(x,76,x,84,{w:1})}for(let k=0;k<5;k++){const x0=12+k*3*11.5,x1=x0+3*11.5;s+=`<path d="M${x0},76 Q${(x0+x1)/2},40 ${x1},76" fill="none" stroke="${TV.A}" stroke-width="2"/>`+tvT(x1,96,(k+1)*3,{s:12,c:TV.A})}return tvS(s+tvT(12,96,'0',{s:12})+tvT(100,30,'+3  +3  +3 …',{s:12}))},
prime:()=>{let s='';for(let i=0;i<7;i++)s+=tvR(14+i*20,30,16,16,{f:TV.B,o:.6,w:0});for(let i=0;i<3;i++)for(let j=0;j<2;j++)s+=tvR(14+i*20,72+j*18,16,16,{f:TV.R,o:.5,w:0});
  return tvS(s+tvT(180,38,'7 ✔',{s:13,c:TV.G})+tvT(110,88,'6 = 2 × 3',{s:12,a:'start'})+tvT(110,104,'not prime',{s:11,a:'start',c:TV.R}))},
ftree:()=>tvS(tvT(100,14,'12',{s:14})+tvL(94,22,72,44)+tvL(106,22,128,44)+tvT(66,52,'4',{s:14})+tvC(134,52,10,{c:TV.A})+tvT(134,52,'3',{s:14,c:TV.A})+tvL(60,60,44,82)+tvL(72,60,88,82)+tvC(40,90,10,{c:TV.A})+tvT(40,90,'2',{s:14,c:TV.A})+tvC(92,90,10,{c:TV.A})+tvT(92,90,'2',{s:14,c:TV.A})+tvT(150,108,'12 = 2 × 2 × 3',{s:12})),
venn:()=>tvS(tvC(76,58,46,{f:TV.B,o:.12})+tvC(124,58,46,{f:TV.G,o:.12})+tvT(26,16,'12',{s:13,c:TV.B})+tvT(174,16,'18',{s:13,c:TV.G})+tvT(52,62,'2',{s:14})+tvT(100,50,'2',{s:14})+tvT(100,70,'3',{s:14})+tvT(148,62,'3',{s:14})+tvT(100,112,'HCF = 2 × 3 = 6',{s:12,c:TV.A})),
lcm:()=>tvS(tvT(8,30,'4:',{s:12,a:'start'})+[4,8,12,16,20].map((v,i)=>tvT(46+i*30,30,v,{s:13,c:v===12?TV.A:'currentColor',w:v===12?800:500})).join('')+tvT(8,66,'6:',{s:12,a:'start'})+[6,12,18,24,30].map((v,i)=>tvT(46+i*30,66,v,{s:13,c:v===12?TV.A:'currentColor',w:v===12?800:500})).join('')+tvR(92,18,28,60,{c:TV.A,r:8})+tvT(100,102,'LCM = 12',{s:13,c:TV.A})),
sqroot:()=>tvS(tvR(50,14,84,84,{f:TV.B,o:.15})+tvT(92,56,'49',{s:20})+tvT(92,108,'7',{s:13,c:TV.A})+tvT(36,56,'7',{s:13,c:TV.A})+tvT(170,56,'√49 = 7',{s:13})),
inverse:()=>tvS(tvBox(10,44,40,32,'5')+tvArrow(54,52,92,52,TV.B)+tvT(73,40,'× 3',{s:12,c:TV.B})+tvBox(96,44,40,32,'15')+tvArrow(92,70,54,70,TV.A)+tvT(73,86,'÷ 3',{s:12,c:TV.A})+tvT(168,60,'undo',{s:12,c:TV.A})),
bidmas:()=>tvS(['B  ( )','I  x²','D M  ÷ ×','A S  + −'].map((t,i)=>tvR(30+i*10,8+i*27,140-i*20,23,{f:[TV.R,TV.A,TV.B,TV.G][i],o:.25,r:4})+tvT(100,20+i*27,t,{s:12})).join('')),
fraction:()=>{let s='';for(let i=0;i<4;i++){const a0=90-i*90,[x0,y0]=tvPt(50,60,42,a0),[x1,y1]=tvPt(50,60,42,a0-90);s+=`<path d="M50,60 L${x0},${y0} A42,42 0 0 1 ${x1},${y1} Z" fill="${i<3?TV.B:'none'}" fill-opacity=".4" stroke="currentColor" stroke-width="2"/>`}
  return tvS(s+tvT(140,40,'3',{s:22,c:TV.B})+tvL(124,60,156,60)+tvT(140,80,'4',{s:22,c:TV.A})+tvT(185,40,'have',{s:10,a:'end'})+tvT(192,80,'parts',{s:10,a:'end'}))},
equiv:()=>{const bar=(y,n,k,c)=>Array.from({length:n},(_,i)=>tvR(20+i*120/n,y,120/n,22,{f:i<k?c:'none',o:.45})).join('');return tvS(bar(8,2,1,TV.B)+bar(46,4,2,TV.G)+bar(84,8,4,TV.P)+tvT(170,19,'1/2',{s:13})+tvT(170,57,'2/4',{s:13})+tvT(170,95,'4/8',{s:13}))},
mixed:()=>{const pie=(cx,k)=>{let s='';for(let i=0;i<4;i++){const a0=90-i*90,[x0,y0]=tvPt(cx,52,27,a0),[x1,y1]=tvPt(cx,52,27,a0-90);s+=`<path d="M${cx},52 L${x0},${y0} A27,27 0 0 1 ${x1},${y1} Z" fill="${i<k?TV.B:'none'}" fill-opacity=".4" stroke="currentColor" stroke-width="2"/>`}return s};
  return tvS(pie(34,4)+pie(100,4)+pie(166,3)+tvT(67,52,'+',{s:16})+tvT(133,52,'+',{s:16})+tvT(100,104,'2¾ = 11/4',{s:13}))},
round:()=>{let s=tvL(14,60,186,60);for(let n=30;n<=50;n++){const x=14+(n-30)*8.6;s+=tvL(x,n%10?56:50,x,n%10?64:70,{w:n%10?1:2})}return tvS(s+tvT(14,84,'30',{s:12})+tvT(100,84,'40',{s:12,c:TV.A})+tvT(186,84,'50',{s:12})+tvDot(14+7*8.6,60,TV.B,5)+tvT(14+7*8.6,36,'37',{s:13,c:TV.B})+tvArrow(14+7*8.6+6,44,96,48,TV.A)+tvT(100,108,'37 → 40',{s:12}))},
placevalue:()=>tvS(['H','T','U','.','t','h'].map((h,i)=>tvR(10+i*30,20,30,26,{f:i===3?'none':TV.B,o:.12,w:1})+tvT(25+i*30,33,h,{s:12})).join('')+['','','3','.','7','2'].map((d,i)=>tvT(25+i*30,66,d,{s:20,c:i===4?TV.A:'currentColor'})).join('')+tvT(100,100,'7 tenths = 0.7',{s:12,c:TV.A})),
pow10:()=>tvS(['T','U','.','t','h'].map((h,i)=>tvT(30+i*34,14,h,{s:11})).join('')+tvT(64,40,'5',{s:18})+tvT(98,40,'.',{s:18})+tvT(132,40,'0',{s:18,c:'#999'})+tvArrow(64,52,128,80,TV.A)+tvT(98,90,'.',{s:18})+tvT(132,90,'5',{s:18,c:TV.A})+tvT(64,90,'0',{s:18})+tvT(100,112,'5 × 0.1 = 0.5',{s:12})),
bounds:()=>{let s=tvL(14,60,186,60);[6,6.5,7,7.5,8].forEach((v,i)=>{const x=20+i*40;s+=tvL(x,54,x,66)+tvT(x,82,v,{s:12})});return tvS(tvR(60,48,80,24,{f:TV.A,o:.2,w:0})+s+tvT(60,30,'lower',{s:11,c:TV.B})+tvT(140,30,'upper',{s:11,c:TV.R})+tvDot(100,60,TV.G,5)+tvT(100,104,'7 cm (nearest cm)',{s:12}))},
balance:()=>tvS(tvP('100,64 88,108 112,108',{f:'currentColor',o:.4})+tvL(20,64,180,64,{w:3})+tvL(40,64,30,34)+tvL(40,64,50,34)+tvL(160,64,150,34)+tvL(160,64,170,34)+tvR(14,18,52,18,{f:TV.B,o:.2,r:4})+tvT(40,27,'2x + 1',{s:12})+tvR(134,18,52,18,{f:TV.G,o:.2,r:4})+tvT(160,27,'9',{s:12})+tvT(100,40,'=',{s:16})+tvT(100,10,'x = 4',{s:11,c:TV.A})),
ineq:()=>{let s=tvArrow(10,60,192,60);for(let n=0;n<=7;n++){const x=20+n*23;s+=tvL(x,55,x,65)+tvT(x,80,n,{s:12})}return tvS(s+tvC(20+3*23,60,6,{c:TV.A,f:'#fff',o:1})+tvArrow(20+3*23+6,60,190,60,TV.A)+tvL(95,60,186,60,{c:TV.A,w:4})+tvT(100,30,'x > 3',{s:14,c:TV.A})+tvT(100,104,'○ not included   ● included',{s:11}))},
expand:()=>tvS([['3',22],['(',33],['x',44],['+',60],['4',76],[')',88],['=',104],['3x + 12',148]].map(([t,x])=>tvT(x,72,t,{s:18})).join('')+`<path d="M24,58 Q34,34 44,58" fill="none" stroke="${TV.A}" stroke-width="2"/><path d="M24,58 Q50,14 76,58" fill="none" stroke="${TV.B}" stroke-width="2"/>`+tvT(34,36,'×',{s:12,c:TV.A})+tvT(50,22,'×',{s:12,c:TV.B})),
subst:()=>tvS(tvT(60,40,'2x + 1',{s:18})+tvT(150,40,'x = 3',{s:14,c:TV.A})+tvArrow(150,52,72,70,TV.A)+tvT(100,90,'2 × 3 + 1 = 7',{s:16})),
simul:()=>{const [a,m]=tvAx(-1,8,-1,8);return tvS(a+tvCurve(m,x=>10-x,2,8,{c:TV.B})+tvCurve(m,x=>x-2,2,8,{c:TV.G})+tvDot(...m(6,4))+tvT(m(6,4)[0]+6,m(6,4)[1]+14,'(6, 4)',{s:11,a:'start',c:TV.A}))},
seq:()=>tvS([2,5,8,11,14].map((v,i)=>tvC(22+i*39,70,15,{f:TV.B,o:.15})+tvT(22+i*39,70,v,{s:14})).join('')+[0,1,2,3].map(i=>`<path d="M${28+i*39},54 Q${41+i*39},30 ${55+i*39},54" fill="none" stroke="${TV.A}" stroke-width="2"/>`+tvT(41+i*39,30,'+3',{s:11,c:TV.A})).join('')+tvT(100,106,'term-to-term: + 3',{s:12})),
nth:()=>tvS(tvT(14,22,'n',{s:13,a:'start',i:1})+[1,2,3,4].map(n=>tvT(50+n*30,22,n,{s:13})).join('')+tvT(14,54,'term',{s:12,a:'start'})+[5,8,11,14].map((v,i)=>tvT(80+i*30,54,v,{s:14,c:TV.B})).join('')+tvL(10,38,190,38,{w:1})+tvT(100,96,'nth term = 3n + 2',{s:15,c:TV.A})),
pattern:()=>{let s='';[1,2,3].forEach((k,j)=>{const x0=[16,66,132][j];for(let i=0;i<=k;i++)s+=tvR(x0+i*14,66,13,13,{f:TV.B,o:.5,w:1});for(let i=1;i<=k;i++)s+=tvR(x0,66-i*14,13,13,{f:TV.B,o:.5,w:1});s+=tvT(x0+k*7+6,96,2*k+1,{s:13})});return tvS(s+tvT(100,14,'+2 each time',{s:12,c:TV.A}))},
angle:()=>tvS(tvL(40,90,180,90)+tvL(40,90,140,20)+tvArc(40,90,36,0,35)+tvT(96,74,'35°',{s:13,c:TV.A})+tvDot(40,90,'currentColor',3)+tvT(40,104,'vertex',{s:10})),
angtypes:()=>tvS(tvL(10,90,60,90)+tvL(10,90,50,55)+tvArc(10,90,18,0,40)+tvT(34,108,'acute',{s:11})+tvL(80,90,130,90)+tvL(80,90,58,50)+tvArc(80,90,16,0,120)+tvT(100,108,'obtuse',{s:11})+tvL(160,70,195,70)+tvL(160,70,140,100)+tvArc(160,70,14,0,235,{c:TV.R})+tvT(165,108,'reflex',{s:11})),
rightang:()=>tvS(tvL(50,100,170,100)+tvL(50,100,50,14)+tvR(50,86,14,14,{c:TV.A})+tvT(110,60,'90°',{s:16,c:TV.A})),
straight:()=>tvS(tvL(10,90,190,90)+tvL(100,90,124,24)+tvArc(100,90,22,0,70)+tvArc(100,90,30,70,180,{c:TV.B})+tvT(134,76,'70°',{s:12,c:TV.A})+tvT(66,58,'110°',{s:12,c:TV.B})+tvT(100,110,'70° + 110° = 180°',{s:12})),
vertopp:()=>tvS(tvL(30,20,170,100)+tvL(30,100,170,20)+tvArc(100,60,22,150,210)+tvArc(100,60,22,330,30)+tvT(64,60,'60°',{s:12,c:TV.A})+tvT(136,60,'60°',{s:12,c:TV.A})),
tri:()=>tvS(tvP('20,100 150,100 73,8',{f:TV.B,o:.1})+tvArc(20,100,20,0,60)+tvArc(150,100,20,130,180,{c:TV.G})+tvArc(73,8,16,240,300,{c:TV.P})+tvT(50,90,'60°',{s:11,c:TV.A})+tvT(124,91,'50°',{s:11,c:TV.G})+tvT(73,36,'70°',{s:11,c:TV.P})+tvT(178,60,'= 180°',{s:12})),
exterior:()=>tvS(tvP('20,96 140,96 70,22',{f:TV.B,o:.1})+tvL(140,96,192,96,{d:1})+tvArc(140,96,18,0,133)+tvT(160,78,'e',{s:13,c:TV.A,i:1})+tvArc(20,96,18,0,56,{c:TV.G})+tvArc(70,22,14,236,315,{c:TV.G})+tvT(100,112,'e = sum of the two opposite angles',{s:10})),
parallel:()=>tvS(tvL(10,40,190,40)+tvL(10,90,190,90)+tvArrow(90,40,100,40)+tvArrow(90,90,100,90)+tvL(60,112,140,10,{c:TV.A})+tvT(166,18,'transversal',{s:10,c:TV.A})),
alternate:()=>tvS(tvL(10,40,190,40)+tvL(10,90,190,90)+tvL(60,112,140,10)+tvArc(77,90,16,0,52)+tvArc(116.5,40,16,180,232)+tvT(102,82,'50°',{s:11,c:TV.A})+tvT(92,48,'50°',{s:11,c:TV.A})+tvPL('40,40 116.5,40 77,90 160,90',{c:TV.A,w:3,d:1})),
corresponding:()=>tvS(tvL(10,40,190,40)+tvL(10,90,190,90)+tvL(60,112,140,10)+tvArc(116.5,40,14,52,180)+tvArc(77,90,14,52,180)+tvT(100,24,'130°',{s:11,c:TV.A})+tvT(60,74,'130°',{s:11,c:TV.A})),
cointerior:()=>tvS(tvL(10,40,190,40)+tvL(10,90,190,90)+tvL(60,112,140,10)+tvArc(116.5,40,16,232,360)+tvArc(77,90,16,0,52,{c:TV.B})+tvT(142,54,'130°',{s:11,c:TV.A})+tvT(104,80,'50°',{s:11,c:TV.B})),
quads:()=>tvS(tvP('8,40 44,40 44,80 8,80',{f:TV.B})+tvP('54,80 66,40 98,40 86,80',{f:TV.G})+tvP('108,80 120,40 144,40 156,80',{f:TV.P})+tvP('179,34 194,52 179,86 164,52',{f:TV.A})+tvT(100,104,'4 sides, angles add to 360°',{s:11})),
parallelogram:()=>tvS(tvP('20,90 60,24 180,24 140,90',{f:TV.B,o:.15})+tvArrow(110,24,120,24)+tvArrow(70,90,80,90)+tvL(38,57,44,61,{w:1.5})+tvL(158,57,164,61,{w:1.5})),
rhombus:()=>tvS(tvP('100,10 160,60 100,110 40,60',{f:TV.G,o:.15})+tvL(100,10,100,110,{d:1})+tvL(40,60,160,60,{d:1})+tvR(100,50,10,10,{w:1})+['70,32','130,32','70,88','130,88'].map(p=>tvT(...p.split(',').map(Number),'|',{s:12})).join('')),
trapezium:()=>tvS(tvP('20,96 180,96 140,26 60,26',{f:TV.P,o:.15})+tvArrow(96,26,106,26)+tvArrow(96,96,106,96)+tvT(100,14,'a',{s:12,i:1})+tvT(100,110,'b',{s:12,i:1})+tvL(140,26,140,96,{d:1,c:TV.A})+tvT(150,62,'h',{s:12,i:1,c:TV.A})),
kite:()=>tvS(tvP('100,8 150,44 100,112 50,44',{f:TV.A,o:.15})+tvL(100,8,100,112,{d:1})+tvL(50,44,150,44,{d:1})+tvT(70,22,'|',{s:12})+tvT(130,22,'|',{s:12})+tvT(70,82,'||',{s:12})+tvT(130,82,'||',{s:12})),
diagonal:()=>tvS(tvR(30,20,140,80,{f:TV.B,o:.1})+tvL(30,20,170,100,{c:TV.A})+tvL(170,20,30,100,{c:TV.A})),
polygon:()=>{const p=Array.from({length:6},(_,i)=>tvPt(80,60,46,90+i*60));const s=tvP(p.map(q=>q.map(v=>v.toFixed(1)).join(',')).join(' '),{f:TV.B,o:.12})+tvL(p[1][0],p[1][1],p[1][0]+(p[1][0]-p[0][0])*.8,p[1][1]+(p[1][1]-p[0][1])*.8,{d:1})+tvArc(p[1][0],p[1][1],14,270,30)+tvArc(p[1][0],p[1][1],20,210,270,{c:TV.G});
  return tvS(s+tvT(160,40,'interior 120°',{s:10,c:TV.A})+tvT(160,60,'exterior 60°',{s:10,c:TV.G})+tvT(160,84,'hexagon',{s:11}))},
bearing:()=>tvS(tvArrow(90,104,90,10)+tvT(100,14,'N',{s:13,a:'start'})+tvL(90,104,...tvPt(90,104,90,30).map(v=>v.toFixed(1)),{c:TV.A})+tvArc(90,104,30,60,90)+tvT(116,60,'060°',{s:12,c:TV.A})+tvDot(90,104,'currentColor',3)+tvT(160,96,'clockwise ↻',{s:11,c:TV.B})),
translate:()=>{const [a,m]=tvAx(0,9,0,6,{grid:1});const sh=(dx,dy,c)=>tvP([[1,1],[3,1],[1,3]].map(([x,y])=>m(x+dx,y+dy).join(',')).join(' '),{f:c,o:.4});return tvS(a+sh(0,0,TV.B)+sh(4,2,TV.A)+tvArrow(...m(1,1),...m(5,3),TV.G))},
reflect:()=>tvS(tvL(100,8,100,102,{d:1,c:TV.A})+tvP('30,90 80,90 30,30',{f:TV.B,o:.3})+tvP('170,90 120,90 170,30',{f:TV.G,o:.3})+tvT(100,113,'mirror line',{s:10,c:TV.A})),
rotate:()=>tvS(tvP('100,50 160,50 160,30',{f:TV.B,o:.3})+tvP('100,50 100,110 120,110',{f:TV.G,o:.3})+tvDot(100,50)+tvArc(100,50,34,-90,0,{c:TV.A})+tvT(40,30,'90° clockwise',{s:11,c:TV.A})),
enlarge:()=>tvS(tvP('20,100 50,100 20,70',{f:TV.B,o:.3})+tvP('90,100 150,100 90,40',{f:TV.G,o:.3})+tvT(32,112,'3',{s:11})+tvT(120,112,'6',{s:11})+tvT(160,40,'× 2',{s:16,c:TV.A})),
vector:()=>{const [a,m]=tvAx(0,8,-1,4,{grid:1});return tvS(a+tvArrow(...m(1,3),...m(5,1),TV.A)+`<text x="160" y="30" font-size="13" text-anchor="middle" font-weight="700" fill="${TV.A}"><tspan x="160" dy="0">( 4 )</tspan><tspan x="160" dy="16">(−2)</tspan></text>`)},
midpoint:()=>{const [a,m]=tvAx(0,8,0,9);return tvS(a+tvL(...m(2,4),...m(6,8))+tvDot(...m(2,4),TV.B)+tvDot(...m(6,8),TV.B)+tvDot(...m(4,6),TV.A,5)+tvT(m(4,6)[0]+30,m(4,6)[1]+6,'(4, 6)',{s:11,c:TV.A}))},
arc:()=>tvS(tvL(40,90,160,90)+tvDot(40,90,'currentColor',3)+tvDot(160,90,'currentColor',3)+tvArc(40,90,80,20,70,{c:TV.A})+tvArc(160,90,80,110,160,{c:TV.A})+tvT(100,106,'arcs cross',{s:11,c:TV.A})),
perpbis:()=>tvS(tvL(30,70,170,70)+tvDot(30,70,'currentColor',3)+tvDot(170,70,'currentColor',3)+tvL(100,8,100,116,{c:TV.A})+tvR(100,60,10,10,{w:1,c:TV.A})+tvArc(30,70,90,35,52,{c:TV.B,w:1.5})+tvArc(170,70,90,128,145,{c:TV.B,w:1.5})+tvT(65,84,'equal',{s:10})+tvT(135,84,'equal',{s:10})),
angbis:()=>tvS(tvL(20,100,190,100)+tvL(20,100,170,14)+tvL(20,100,190,55,{c:TV.A})+tvArc(20,100,50,0,15,{c:TV.G})+tvArc(20,100,58,15,30,{c:TV.B})+tvT(160,72,'cuts in half',{s:10,c:TV.A})),
cubefev:()=>tvS(tvCube(50,42,60,24)+tvT(80,72,'face',{s:11})+tvL(110,42,134,18,{c:TV.A,w:4})+tvT(150,26,'edge',{s:11,c:TV.A,a:'start'})+tvDot(134,18,TV.G,5)+tvT(150,10,'vertex',{s:11,c:TV.G,a:'start'})),
net:()=>tvS([[70,8],[40,38],[70,38],[100,38],[130,38],[70,68]].map(([x,y],i)=>tvR(x,y,30,30,{f:i===2?TV.A:TV.B,o:.2})).join('')+tvT(100,108,'6 faces of a cube',{s:11})),
prism:()=>tvS(tvP('20,96 70,96 45,52',{f:TV.A,o:.4})+tvP('45,52 145,22 170,66 70,96',{f:TV.B,o:.08})+tvL(170,66,120,66,{d:1})+tvL(120,66,145,22,{d:1})+tvL(70,96,170,66)+tvT(46,110,'cross-section',{s:10,c:TV.A})),
cuboid:()=>tvS(tvP('30,50 130,50 130,100 30,100',{f:TV.G,o:.15})+tvP('30,50 54,26 154,26 130,50',{f:TV.G,o:.3})+tvP('130,50 154,26 154,76 130,100',{f:TV.G,o:.45})+tvT(80,110,'length',{s:10})+tvT(160,90,'height',{s:10,a:'start'})+tvT(160,34,'width',{s:10,a:'start'})+tvT(80,75,'V = l × w × h',{s:11})),
cylinder:()=>tvS(`<ellipse cx="80" cy="24" rx="40" ry="12" fill="${TV.A}" fill-opacity=".3" stroke="currentColor" stroke-width="2"/><path d="M40,24 L40,96 A40,12 0 0 0 120,96 L120,24" fill="${TV.B}" fill-opacity=".1" stroke="currentColor" stroke-width="2"/>`+tvL(80,24,120,24,{c:TV.A})+tvT(100,16,'r',{s:11,i:1,c:TV.A})+tvT(132,60,'h',{s:12,i:1})+tvT(170,60,'πr²h',{s:13,c:TV.A})),
pyramid:()=>tvS(tvP('30,96 130,96 160,70 60,70',{f:TV.B,o:.1})+tvL(95,14,30,96)+tvL(95,14,130,96)+tvL(95,14,160,70)+tvL(95,14,60,70,{d:1})+tvL(95,14,95,83,{d:1,c:TV.A})+tvT(104,56,'h',{s:12,i:1,c:TV.A})),
cone:()=>tvS(`<ellipse cx="80" cy="96" rx="44" ry="12" fill="${TV.A}" fill-opacity=".2" stroke="currentColor" stroke-width="2"/>`+tvL(36,96,80,12)+tvL(124,96,80,12)+tvL(80,12,80,96,{d:1,c:TV.A})+tvL(80,96,124,96,{c:TV.B})+tvT(100,108,'r',{s:11,i:1,c:TV.B})+tvT(88,56,'h',{s:12,i:1,c:TV.A})+tvT(165,56,'⅓πr²h',{s:13,c:TV.A})),
sphere:()=>tvS(tvC(80,60,46,{f:TV.B,o:.12})+`<ellipse cx="80" cy="60" rx="46" ry="12" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3"/>`+tvL(80,60,126,60,{c:TV.A})+tvT(104,52,'r',{s:12,i:1,c:TV.A})+tvT(170,60,'4/3 πr³',{s:13,c:TV.A})),
compound3d:()=>tvS(`<ellipse cx="80" cy="56" rx="36" ry="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M44,56 L44,104 A36,10 0 0 0 116,104 L116,56" fill="${TV.B}" fill-opacity=".1" stroke="currentColor" stroke-width="2"/>`+tvL(44,56,80,8)+tvL(116,56,80,8)+tvT(150,30,'cone',{s:11,c:TV.A})+tvT(156,84,'cylinder',{s:11,c:TV.B})),
area:()=>{let s='';for(let i=0;i<4;i++)for(let j=0;j<3;j++)s+=tvR(40+i*26,16+j*26,26,26,{f:TV.B,o:.2,w:1});return tvS(s+tvR(40,16,104,78)+tvT(92,106,'4 cm',{s:11})+tvT(160,55,'3 cm',{s:11})+tvT(92,55,'12 cm²',{s:15,c:TV.A}))},
perimeter:()=>tvS(tvR(40,20,110,70,{f:TV.B,o:.08,w:4,c:TV.A})+tvT(95,12,'4',{s:12})+tvT(95,102,'4',{s:12})+tvT(30,55,'3',{s:12})+tvT(162,55,'3',{s:12})+tvT(95,55,'P = 14 cm',{s:13,c:TV.A})),
lshape:()=>tvS(tvP('30,10 70,10 70,66 160,66 160,106 30,106',{f:TV.B,o:.12})+tvL(30,66,70,66,{d:1,c:TV.A})+tvT(50,40,'A',{s:14,c:TV.A})+tvT(100,86,'B',{s:14,c:TV.A})),
circle:()=>tvS(tvC(70,60,48,{f:TV.B,o:.1})+tvL(70,60,118,60,{c:TV.A})+tvT(94,52,'r',{s:12,i:1,c:TV.A})+tvL(36,26,104,94,{c:TV.G})+tvT(48,48,'d',{s:12,i:1,c:TV.G})+tvDot(70,60,'currentColor',3)+tvT(160,40,'C = πd',{s:13})+tvT(160,64,'A = πr²',{s:13})),
sector:()=>tvS(tvC(70,60,48)+tvArc(70,60,48,0,90,{fill:TV.A,c:TV.A})+tvArc(70,60,48,90,360,{c:TV.B,w:4})+tvT(150,40,'sector',{s:12,c:TV.A})+tvT(150,64,'arc',{s:12,c:TV.B})),
units:()=>tvS(tvBox(10,40,50,30,'1 m')+tvArrow(64,55,104,55,TV.A)+tvT(84,44,'× 100',{s:11,c:TV.A})+tvBox(108,40,82,30,'100 cm')+tvT(100,98,'big unit → small unit: ×',{s:11})),
coord:()=>{const [a,m]=tvAx(-1,6,-1,4,{grid:1});return tvS(a+tvL(...m(3,0),...m(3,2),{d:1,c:TV.A})+tvL(...m(0,2),...m(3,2),{d:1,c:TV.A})+tvDot(...m(3,2))+tvT(m(3,2)[0]+24,m(3,2)[1]-8,'(3, 2)',{s:12,c:TV.A}))},
table:()=>tvS(tvR(10,24,180,64,{w:1.5})+tvL(10,56,190,56,{w:1})+tvL(46,24,46,88,{w:1})+tvT(28,40,'x',{s:13,i:1})+tvT(28,72,'y',{s:13,i:1})+[0,1,2,3].map((x,i)=>tvT(66+i*36,40,x,{s:13})+tvT(66+i*36,72,2*x+1,{s:13,c:TV.B})).join('')+tvT(100,106,'y = 2x + 1',{s:12})),
gradient:()=>{const [a,m]=tvAx(-1,4,-1,7);return tvS(a+tvCurve(m,x=>2*x+1,-.5,3)+tvPL([m(0,1),m(2,1),m(2,5)].map(p=>p.join(',')).join(' '),{c:TV.A,d:1})+tvT(m(1,1)[0],m(1,1)[1]+9,'run 2',{s:10,c:TV.A})+tvT(m(2,3)[0]+22,m(2,3)[1],'rise 4',{s:10,c:TV.A})+tvT(160,86,'m = 4 ÷ 2 = 2',{s:11}))},
line:()=>{const [a,m]=tvAx(-4,4,-3,6);return tvS(a+tvCurve(m,x=>x+2,-4,4)+tvDot(...m(0,2))+tvDot(...m(-2,0),TV.G)+tvT(m(0,2)[0]+30,m(0,2)[1]+4,'y-int',{s:10,c:TV.A})+tvT(m(-2,0)[0]-4,m(-2,0)[1]+12,'x-int',{s:10,c:TV.G}))},
posneg:()=>{const [a,m]=tvAx(-3,3,-3,3);return tvS(a+tvCurve(m,x=>x,-2.6,2.6,{c:TV.G})+tvCurve(m,x=>-x,-2.6,2.6,{c:TV.R})+tvT(176,20,'+',{s:16,c:TV.G})+tvT(34,20,'−',{s:16,c:TV.R}))},
coverup:()=>{const [a,m]=tvAx(-1,7,-1,5);return tvS(a+tvCurve(m,x=>4-2*x/3,0,6)+tvDot(...m(0,4))+tvDot(...m(6,0))+tvT(m(0,4)[0]+30,m(0,4)[1],'(0, 4)',{s:11,c:TV.A})+tvT(m(6,0)[0],m(6,0)[1]-12,'(6, 0)',{s:11,c:TV.A})+tvT(130,22,'2x + 3y = 12',{s:11}))},
realgraph:()=>{const [a,m]=tvAx(0,6,0,6);return tvS(a+tvPL([m(0,0),m(2,4),m(4,4),m(5.5,5.5)].map(p=>p.join(',')).join(' '),{c:TV.B,w:2.5})+tvT(m(1,2)[0]-10,m(1,2)[1]-8,'fast',{s:10,c:TV.A})+tvT(m(3,4)[0],m(3,4)[1]-10,'stop',{s:10,c:TV.A})+tvT(110,112,'time',{s:10})+tvT(4,40,'dist',{s:10,a:'start'}))},
convgraph:()=>{const [a,m]=tvAx(0,10,0,16,{grid:0});return tvS(a+tvCurve(m,x=>1.6*x,0,10)+tvPL([m(5,0),m(5,8),m(0,8)].map(p=>p.join(',')).join(' '),{c:TV.A,d:1})+tvT(m(5,0)[0]+24,104,'5 miles',{s:10})+tvT(m(0,8)[0]+24,m(0,8)[1]-8,'8 km',{s:10,c:TV.A}))},
intersect:()=>{const [a,m]=tvAx(-2,4,-1,5);return tvS(a+tvCurve(m,x=>x+1,-2,4)+tvCurve(m,x=>3-x,-2,4,{c:TV.G})+tvDot(...m(1,2),TV.A,5)+tvT(m(1,2)[0]+26,m(1,2)[1]+2,'(1, 2)',{s:11,c:TV.A}))},
parabola:()=>{const [a,m]=tvAx(-3.5,3.5,-5,6);return tvS(a+tvCurve(m,x=>x*x-4,-3.1,3.1)+tvDot(...m(-2,0),TV.G)+tvDot(...m(2,0),TV.G)+tvDot(...m(0,-4),TV.A)+tvL(...m(0,-5),...m(0,6),{d:1,c:TV.A,w:1})+tvT(m(2,0)[0]+16,m(2,0)[1]+12,'root',{s:10,c:TV.G})+tvT(196,110,'turning point',{s:10,c:TV.A,a:'end'}))},
hyperbola:()=>{const [a,m]=tvAx(-5,5,-5,5);return tvS(a+tvCurve(m,x=>3/x,.6,5)+tvCurve(m,x=>3/x,-5,-.6)+tvT(170,28,'y = 3/x',{s:11}))},
cubic:()=>{const [a,m]=tvAx(-2.2,2.2,-6,6);return tvS(a+tvCurve(m,x=>x*x*x/1.5,-2.05,2.05)+tvT(165,28,'y = x³',{s:11}))},
seglen:()=>{const [a,m]=tvAx(0,6,0,6,{grid:1});return tvS(a+tvL(...m(1,1),...m(4,5),{c:TV.A,w:3})+tvL(...m(1,1),...m(4,1),{d:1})+tvL(...m(4,1),...m(4,5),{d:1})+tvT(m(2.5,1)[0],m(2.5,1)[1]+9,'3',{s:11})+tvT(m(4,3)[0]+8,m(4,3)[1],'4',{s:11})+tvT(m(2.5,3)[0]-10,m(2.5,3)[1]-8,'5',{s:12,c:TV.A}))},
rtri:()=>tvS(tvP('30,100 150,100 30,20',{f:TV.B,o:.1})+tvR(30,88,12,12,{w:1.5})+tvL(30,20,150,100,{c:TV.A,w:4})+tvT(100,52,'hypotenuse',{s:11,c:TV.A,a:'start'})+tvT(90,112,'leg',{s:11})+tvT(16,60,'leg',{s:11})),
pythag:()=>tvS(tvP('70,70 110,70 70,40',{f:TV.B,o:.1})+tvR(70,70,40,40,{f:TV.G,o:.2,w:1})+tvR(40,40,30,30,{f:TV.P,o:.2,w:1})+tvP('70,40 110,70 140,30 100,0',{f:TV.A,o:.15,w:1})+tvT(90,90,'b²',{s:12})+tvT(55,55,'a²',{s:12})+tvT(105,35,'c²',{s:13,c:TV.A})+tvT(170,100,'a²+b²=c²',{s:11})),
trilab:()=>tvS(tvP('20,100 170,100 170,20',{f:TV.B,o:.08})+tvR(158,88,12,12,{w:1.5})+tvArc(20,100,26,0,28)+tvT(54,92,'θ',{s:13,c:TV.A})+tvT(84,47,'hyp',{s:12,c:TV.P})+tvT(186,60,'opp',{s:12,c:TV.R})+tvT(95,112,'adj',{s:12,c:TV.G})),
soh:()=>TVIS.trilab().replace('</svg>',tvT(60,26,'sin θ = opp/hyp',{s:12,c:TV.A})+'</svg>'),
cah:()=>TVIS.trilab().replace('</svg>',tvT(60,26,'cos θ = adj/hyp',{s:12,c:TV.A})+'</svg>'),
toa:()=>TVIS.trilab().replace('</svg>',tvT(60,26,'tan θ = opp/adj',{s:12,c:TV.A})+'</svg>'),
sohcah:()=>tvS(['S O H','C A H','T O A'].map((t,i)=>tvR(8+i*64,30,58,42,{f:[TV.R,TV.G,TV.B][i],o:.15,r:8})+tvT(37+i*64,51,t,{s:15,w:800})).join('')+tvT(100,98,'sin = O/H   cos = A/H   tan = O/A',{s:10})),
elevation:()=>tvS(tvL(20,100,190,100)+tvL(160,100,160,18,{w:4,c:TV.G})+tvC(160,18,10,{f:TV.G,c:TV.G})+tvL(30,96,160,18,{d:1,c:TV.A})+tvArc(30,96,30,0,31)+tvT(76,86,'angle',{s:10,c:TV.A})+tvT(30,108,'👁',{s:12})),
trigen:()=>tvS(tvP('20,100 180,100 70,16',{f:TV.P,o:.1})+tvT(12,106,'A',{s:12})+tvT(188,106,'B',{s:12})+tvT(70,8,'C',{s:12})+tvT(100,112,'c',{s:12,i:1})+tvT(134,54,'a',{s:12,i:1})+tvT(36,54,'b',{s:12,i:1})),
percent:()=>{let s='';for(let i=0;i<10;i++)for(let j=0;j<10;j++)s+=tvR(20+i*8,14+j*9,7,8,{f:i*10+j<25?TV.A:TV.B,o:i*10+j<25?.7:.15,w:0});return tvS(s+tvT(150,50,'25%',{s:20,c:TV.A})+tvT(150,74,'= 25/100',{s:12}))},
percchange:()=>tvS(tvR(10,30,120,26,{f:TV.B,o:.3})+tvT(70,43,'£40 (100%)',{s:12})+tvR(10,70,120,26,{f:TV.B,o:.3})+tvR(130,70,30,26,{f:TV.A,o:.5})+tvT(70,83,'£40',{s:12})+tvT(145,83,'+10',{s:11})+tvT(180,83,'£50',{s:12,c:TV.A})+tvT(100,112,'10 ÷ 40 = 25% increase',{s:11})),
multiplier:()=>tvS(tvBox(10,40,50,30,'£80')+tvArrow(66,55,122,55,TV.A)+tvT(94,42,'× 1.15',{s:12,c:TV.A})+tvBox(128,40,62,30,'£92')+tvT(100,96,'+15%  →  × 1.15',{s:12})),
interest:()=>{const v=[100,105,110.25,115.76];return tvS(v.map((x,i)=>tvR(22+i*44,104-(x-80)*2.4,30,(x-80)*2.4,{f:TV.G,o:.4})+tvT(37+i*44,96-(x-80)*2.4,'£'+Math.round(x),{s:10})+tvT(37+i*44,114,'yr '+i,{s:9})).join(''))},
ratio:()=>tvS([0,1].map(i=>tvR(14+i*30,30,30,28,{f:TV.B,o:.4})).join('')+[0,1,2].map(i=>tvR(84+i*30,30,30,28,{f:TV.A,o:.4})).join('')+tvT(44,74,'2 parts',{s:11,c:TV.B})+tvT(129,74,'3 parts',{s:11,c:TV.A})+tvT(100,100,'2 : 3',{s:16})),
speed:()=>tvS(tvP('100,10 160,100 40,100',{f:TV.B,o:.1})+tvL(62,68,138,68)+tvT(100,48,'D',{s:16})+tvT(76,86,'S',{s:16})+tvT(124,86,'T',{s:16})+tvL(100,72,100,100,{w:1})+tvT(178,30,'S = D ÷ T',{s:10,a:'end'})),
bestbuy:()=>tvS(tvR(14,20,70,60,{f:TV.G,o:.2,r:6})+tvT(49,40,'500 g',{s:12})+tvT(49,60,'£2.00',{s:13})+tvR(116,30,60,50,{f:TV.B,o:.2,r:6})+tvT(146,46,'300 g',{s:12})+tvT(146,64,'£1.50',{s:13})+tvT(49,96,'40p/100 g ✔',{s:10,c:TV.G})+tvT(146,96,'50p/100 g',{s:10})),
proportion:()=>{const [a,m]=tvAx(0,5,0,15);return tvS(a+tvCurve(m,x=>3*x,0,5)+tvDot(...m(2,6))+tvDot(...m(4,12))+tvT(m(2,6)[0]+24,m(2,6)[1]+4,'2 kg £6',{s:10,c:TV.A})+tvT(m(4,12)[0]-30,m(4,12)[1]-4,'4 kg £12',{s:10,c:TV.A}))},
clock:()=>{let s=tvC(60,60,46,{f:TV.B,o:.08});for(let h=1;h<=12;h++){const [x,y]=tvPt(60,60,37,90-h*30);s+=tvT(x.toFixed(1),y.toFixed(1),h,{s:9})}return tvS(s+tvL(60,60,60+18*Math.cos(Math.PI/180*-22),60-18*Math.sin(Math.PI/180*-22),{w:3})+tvL(60,60,26,60,{w:2,c:TV.A})+tvT(150,44,'3:45 pm',{s:13})+tvT(150,72,'= 15:45',{s:15,c:TV.A}))},
timetable:()=>tvS(tvR(10,10,180,100,{w:1.5})+[['Station','Train'],['Leeds','08:15'],['York','08:52'],['Hull','09:40']].map((r,i)=>tvT(50,24+i*26,r[0],{s:11,w:i?500:800})+tvT(145,24+i*26,r[1],{s:12,w:i?600:800,c:i?TV.B:'currentColor'})).join('')+tvL(10,36,190,36,{w:1})),
timeline:()=>tvS(tvL(14,60,186,60)+tvDot(20,60,TV.B)+tvDot(180,60,TV.B)+tvT(20,80,'08:15',{s:11})+tvT(180,80,'09:40',{s:11})+tvT(70,80,'09:00',{s:11})+tvL(70,55,70,65)+`<path d="M20,52 Q45,30 70,52" fill="none" stroke="${TV.A}" stroke-width="2"/><path d="M70,52 Q125,20 180,52" fill="none" stroke="${TV.A}" stroke-width="2"/>`+tvT(45,30,'45 min',{s:10,c:TV.A})+tvT(125,24,'40 min',{s:10,c:TV.A})+tvT(100,104,'1 h 25 min',{s:13})),
datalist:()=>tvS(tvR(30,14,140,92,{r:8,f:TV.B,o:.08})+['152','160','148','171','165','158'].map((v,i)=>tvT(60+(i%3)*40,38+Math.floor(i/3)*34,v,{s:14})).join('')+tvT(100,98,'heights (cm)',{s:10})),
survey:()=>tvS(tvR(40,8,120,104,{r:6,f:TV.B,o:.06})+tvT(100,24,'How do you travel?',{s:10})+['walk','bus','car'].map((t,i)=>tvR(56,40+i*22,12,12,{w:1.5})+tvT(78,46+i*22,t,{s:11,a:'start'})).join('')+tvT(62,46,'✔',{s:12,c:TV.G})),
sample:()=>{let s='';for(let i=0;i<10;i++)for(let j=0;j<5;j++)s+=tvDot(16+i*18,16+j*20,(i===2||i===6)&&(j===1||j===3)||(i===4&&j===2)?TV.A:TV.B,4);return tvS(s+tvC(80,56,40,{c:TV.A})+tvT(170,112,'sample',{s:10,c:TV.A}))},
mean:()=>tvS([2,4,9].map((v,i)=>tvR(20+i*30,100-v*9,24,v*9,{f:TV.B,o:.4})+tvT(32+i*30,108,v,{s:11})).join('')+[5,5,5].map((v,i)=>tvR(120+i*24,100-v*9,20,v*9,{f:TV.G,o:.4})).join('')+tvArrow(104,60,116,60,TV.A)+tvT(150,20,'mean 5',{s:12,c:TV.G})),
median:()=>tvS([1,3,7,8,10].map((v,i)=>tvC(24+i*38,50,15,{f:i===2?TV.A:TV.B,o:i===2?.5:.15})+tvT(24+i*38,50,v,{s:14})).join('')+tvT(100,90,'middle value = 7',{s:12,c:TV.A})),
mode:()=>tvS([2,3,3,5,3,7].map((v,i)=>tvC(20+i*32,50,13,{f:v===3?TV.A:TV.B,o:v===3?.5:.15})+tvT(20+i*32,50,v,{s:13})).join('')+tvT(100,90,'3 appears most: mode 3',{s:12,c:TV.A})),
rangev:()=>tvS(tvL(14,60,186,60)+[2,5,11].map(v=>tvDot(14+v*15,60,TV.B,5)+tvT(14+v*15,78,v,{s:12})).join('')+`<path d="M44,48 L44,40 L179,40 L179,48" fill="none" stroke="${TV.A}" stroke-width="2"/>`+tvT(112,28,'range = 11 − 2 = 9',{s:12,c:TV.A})),
spread:()=>tvS(tvL(14,40,186,40)+tvL(14,88,186,88)+[9,10,11,12].map(v=>tvDot(v*10,40,TV.G,5)).join('')+[2,5,9,14,17].map(v=>tvDot(v*10,88,TV.R,5)).join('')+tvT(100,20,'consistent (small range)',{s:11,c:TV.G})+tvT(100,108,'spread out (big range)',{s:11,c:TV.R})),
freq:()=>tvS(tvR(16,10,168,100,{w:1.5})+tvL(16,32,184,32,{w:1})+tvL(70,10,70,110,{w:1})+tvL(140,10,140,110,{w:1})+tvT(43,21,'colour',{s:10,w:800})+tvT(105,21,'tally',{s:10,w:800})+tvT(162,21,'freq',{s:10,w:800})+[['red',3],['blue',7],['green',4]].map((r,i)=>tvT(43,48+i*24,r[0],{s:11})+tvTally(86,48+i*24,r[1])+tvT(162,48+i*24,r[1],{s:12,c:TV.A})).join('')),
bar:()=>tvS(tvL(20,104,190,104)+tvL(20,104,20,10)+[[3,TV.R],[7,TV.B],[4,TV.G],[5,TV.P]].map(([v,c],i)=>tvR(34+i*38,104-v*12,26,v*12,{f:c,o:.6,w:0})).join('')),
pie:()=>{const v=[180,90,60,30],c=[TV.B,TV.A,TV.G,TV.P];let a=90,s='';v.forEach((d,i)=>{s+=tvArc(70,60,48,a-d,a,{fill:c[i],c:'#fff',o:.7});a-=d});return tvS(s+tvT(160,40,'half = 180°',{s:10,c:TV.B})+tvT(160,62,'quarter = 90°',{s:10,c:TV.A}))},
stem:()=>tvS(tvL(60,10,60,100,{w:2})+[['2','4 7'],['3','1 2 5 8'],['4','0 6']].map((r,i)=>tvT(44,24+i*28,r[0],{s:15,c:TV.B})+tvT(72,24+i*28,r[1],{s:15,a:'start'})).join('')+tvT(140,108,'3 | 2 means 32',{s:11,c:TV.A})),
hist:()=>tvS(tvL(20,104,190,104)+tvL(20,104,20,10)+[3,6,8,5,2].map((v,i)=>tvR(28+i*32,104-v*11,32,v*11,{f:TV.B,o:.45,w:1.5})).join('')+tvT(100,113,'no gaps',{s:10})),
timeseries:()=>{const v=[3,4,7,9,8,5];return tvS(tvL(20,104,190,104)+tvL(20,104,20,10)+tvPL(v.map((y,i)=>`${32+i*30},${104-y*10}`).join(' '),{c:TV.B,w:2.5})+v.map((y,i)=>tvDot(32+i*30,104-y*10,TV.A,3.5)).join('')+tvT(110,113,'month',{s:10}))},
probscale:()=>tvS(tvL(14,56,186,56,{w:3})+[[0,'0','impossible'],[.5,'½','even'],[1,'1','certain']].map(([p,t,w])=>tvL(14+p*172,48,14+p*172,64)+tvT(14+p*172,76,t,{s:13})+tvT(Math.min(172,Math.max(28,14+p*172)),96,w,{s:10})).join('')+tvDot(14+.5*172,56,TV.A,5)+tvT(100,30,'P(heads)',{s:11,c:TV.A})),
dice:()=>{const face=(x,n)=>{const d={1:[[1,1]],2:[[0,0],[2,2]],3:[[0,0],[1,1],[2,2]],4:[[0,0],[2,0],[0,2],[2,2]],5:[[0,0],[2,0],[1,1],[0,2],[2,2]],6:[[0,0],[2,0],[0,1],[2,1],[0,2],[2,2]]}[n];return tvR(x,36,28,28,{r:5,f:TV.B,o:.1})+d.map(([i,j])=>tvDot(x+6+i*8,42+j*8,'currentColor',2.3)).join('')};
  return tvS([1,2,3,4,5,6].map(n=>face(6+(n-1)*32,n)).join('')+tvT(100,90,'each 1/6',{s:12,c:TV.A}))},
relfreq:()=>tvS(tvT(100,30,'sixes: 14',{s:13})+tvT(100,52,'rolls: 60',{s:13})+tvT(100,86,'14 ÷ 60 ≈ 0.23',{s:16,c:TV.A})),
spinner:()=>{let s='';const c=[TV.R,TV.B,TV.G,TV.A];for(let i=0;i<4;i++)s+=tvArc(70,60,46,i*90,(i+1)*90,{fill:c[i],c:'#fff',o:.6});return tvS(s+tvArrow(70,60,96,30)+tvT(156,50,'spin 50 times',{s:10})+tvT(156,70,'= 50 trials',{s:10,c:TV.A}))},
grid:()=>{let s='';for(let i=1;i<=6;i++){s+=tvT(52+i*20,10,i,{s:9,c:TV.B})+tvT(42,10+i*16,i,{s:9,c:TV.G});for(let j=1;j<=6;j++)s+=tvT(52+i*20,10+j*16,i+j,{s:9,c:i+j===7?TV.A:'currentColor'})}return tvS(s+tvL(44,4,44,110,{w:1})+tvL(36,18,190,18,{w:1})+tvT(20,60,'+',{s:14}))},
twoway:()=>tvS(tvR(10,10,180,96,{w:1.5})+tvL(10,34,190,34,{w:1})+tvL(70,10,70,106,{w:1})+tvL(130,10,130,106,{w:1})+tvT(100,22,'walk',{s:11,w:800})+tvT(160,22,'bus',{s:11,w:800})+tvT(40,50,'boys',{s:11,w:800})+tvT(40,82,'girls',{s:11,w:800})+tvT(100,50,'12',{s:13})+tvT(160,50,'8',{s:13})+tvT(100,82,'9',{s:13})+tvT(160,82,'11',{s:13})+tvL(10,66,190,66,{w:1})),
treed:()=>tvS(tvL(14,60,70,30)+tvL(14,60,70,90)+tvL(84,30,140,14)+tvL(84,30,140,46)+tvL(84,90,140,74)+tvL(84,90,140,106)+tvT(78,30,'H',{s:12})+tvT(78,90,'T',{s:12})+[['H',14],['T',46],['H',74],['T',106]].map(([t,y])=>tvT(148,y,t,{s:11})).join('')+tvT(38,36,'½',{s:11,c:TV.A})+tvT(38,86,'½',{s:11,c:TV.A})+tvT(178,14,'¼',{s:11,c:TV.A})),
};

const TERM_COLORS=['#2455d6','#d9480f','#16a34a','#7c3aed','#0891b2','#be185d','#b45309'];
function termsFor(cid,l){
  const T=window.KEYWORDS;if(!T)return[];
  if(l.review){const ids=[...new Set(allLessons(cid).flatMap(x=>T.T[cid+':'+x.title]||T.T[x.title]||[]))],r=mkR(rndSeed());return r.shuffle(ids).slice(0,6).map(k=>[k,T.D[k]]).filter(x=>x[1])}
  return (T.T[cid+':'+l.title]||T.T[l.title]||[]).map(k=>[k,T.D[k]]).filter(x=>x[1]);
}
// a picture: a named drawing, or the text shown large with the [part in brackets] highlighted
function termVis(v){
  if(v&&v[0]==='@'&&TVIS[v.slice(1)])return TVIS[v.slice(1)]();
  return `<div class="tvx">${String(v||'').replace(/\[([^\]]*)\]/g,'<mark>$1</mark>')}</div>`;
}
const canSay=()=>'speechSynthesis' in window&&typeof SpeechSynthesisUtterance!=='undefined';
function sayTerm(text,lang){if(!canSay())return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text.replace(/\(.*?\)/g,''));u.lang=lang;u.rate=.9;speechSynthesis.speak(u)}
function sayBtns(h){$$('[data-say]',h).forEach(b=>b.onclick=()=>sayTerm(b.dataset.say,b.dataset.lang))}

function termsSlide(h,cid,l){
  const ts=termsFor(cid,l),say=canSay();
  h.innerHTML=`<div class="big">Key words <span class="tru">Ключевые слова</span></div>
    <table class="tterms"><thead><tr><th></th><th>English</th><th>Русский</th></tr></thead><tbody>${ts.map(([k,d],i)=>`<tr style="--tc:${TERM_COLORS[i%7]}"><td class="tn">${i+1}</td>
      <td><b>${d[0]}</b>${say?` <button class="tsay" data-say="${esc(d[0])}" data-lang="en-GB" title="Listen">🔊</button>`:''}</td>
      <td>${d[1]}${say?` <button class="tsay" data-say="${esc(d[1])}" data-lang="ru-RU" title="Слушать">🔊</button>`:''}</td></tr>`).join('')}</tbody></table>
    <p class="note">Next slide: what each word means, with an example and a picture.</p>`;
  sayBtns(h);
}
function termsExplain(h,cid,l){
  const ts=termsFor(cid,l);let shown=0;
  h.innerHTML=`<div class="row tbar"><div class="big">Word meanings <span class="tru">Значения слов</span></div><span class="sp"></span><button class="btn alt tall">Show all</button></div>
    <div class="kwcards n${Math.min(ts.length,6)}">${ts.map(([k,d],i)=>`<div class="kwcard" style="--tc:${TERM_COLORS[i%7]}" data-k="${k}"><div class="tvwrap">${termVis(d[4])}</div>
      <div class="ttxt"><div class="tname">${d[0]} <span class="tru">${d[1]}</span></div><div class="tdef">${d[2]}</div><div class="tex"><b>Example:</b> ${d[3]}</div></div></div>`).join('')}</div>`;
  const cards=$$('.kwcard',h);
  const upd=()=>cards.forEach((c,i)=>c.classList.toggle('dim',i>=shown&&shown<cards.length));
  // Space shows the words one at a time; they all start visible, so "Show all" is only needed after stepping
  h.stepNext=()=>{if(shown>=cards.length)return false;if(shown===0)shown=1;else shown++;upd();cards[shown-1].scrollIntoView({block:'nearest',behavior:'smooth'});return true};
  $('.tall',h).onclick=()=>{shown=cards.length;upd()};
}
