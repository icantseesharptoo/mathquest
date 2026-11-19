/* Year 7 topic generators — Cambridge Lower Secondary Mathematics 7, Units 1–16.
   T7[id] = {easy:[fn(r)], medium:[...], hard:[...]}; every fn returns a problem object. */
const Qn=o=>Object.assign({label:'Answer =',unit:'',tol:1e-6,steps:[],hint:''},o);
const rd=(v,dp=6)=>Math.round(v*10**dp)/10**dp;
const sg=n=>n<0?'('+M(n)+')':''+n;
const fd=v=>M(rd(v,4));                       // decimal for display
const pr=n=>n.toLocaleString('en-GB').replace(/,/g,' ');
const FN='Enter a whole number, decimal or fraction (e.g. 5/6).';
function Fr(n,d){const g=gcd(n,d);return[n/g,d/g]}
const terminating=d=>{while(d%2===0)d/=2;while(d%5===0)d/=5;return d===1};
function fracAns(n,d,extra={}){
  const [a,b]=Fr(n,d),t=terminating(b);
  return Object.assign({ans:a/b,ansStr:b===1?String(a):`${a}/${b}`+(t?'':` (≈ ${rd(a/b,3)})`),tol:t?1e-6:.004,note:FN,label:'Answer ='},extra);
}
const mixed=(w,n,d)=>`${w} ${fr(n,d)}`;
const wrap10=g=>r=>{const p=g(r);p.label='x =';p.unit='';if(p.text===undefined)p.text='Solve the equation.';p.svg=null;return Qn(p)};
const T7={};
const ord=n=>n+(n%100>=11&&n%100<=13?'th':({1:'st',2:'nd',3:'rd'}[n%10]||'th'));
const money=v=>(Math.round(v*100)/100).toFixed(2);

// ---------- extra SVG helpers ----------
function gridSvg({R=6,pts=[],polys=[],vlines=[],fns=[]}){
  const u=120/R,o=130,X=x=>o+x*u,Y=y=>o-y*u;let s='';
  for(let i=-R;i<=R;i++){
    s+=`<line x1="${X(i)}" y1="${Y(-R)}" x2="${X(i)}" y2="${Y(R)}" stroke="${i===0?'#111827':'#d1d5db'}" stroke-width="${i===0?1.6:.7}"/><line x1="${X(-R)}" y1="${Y(i)}" x2="${X(R)}" y2="${Y(i)}" stroke="${i===0?'#111827':'#d1d5db'}" stroke-width="${i===0?1.6:.7}"/>`;
    if(i!==0&&i%2===0)s+=`<text x="${X(i)}" y="${Y(0)+11}" font-size="12" text-anchor="middle" fill="#4b5563" stroke="#fff" stroke-width="4" stroke-linejoin="round" paint-order="stroke">${i}</text><text x="${X(0)-7}" y="${Y(i)+4}" font-size="12" text-anchor="end" fill="#4b5563" stroke="#fff" stroke-width="4" stroke-linejoin="round" paint-order="stroke">${i}</text>`;
  }
  vlines.forEach(v=>{s+=`<line x1="${X(v.x)}" y1="${Y(-R)}" x2="${X(v.x)}" y2="${Y(R)}" stroke="#d9480f" stroke-width="2" stroke-dasharray="5 3"/><text x="${X(v.x)+3}" y="${Y(R)+10}" font-size="13" font-weight="700" fill="#d9480f" stroke="#fff" stroke-width="4" stroke-linejoin="round" paint-order="stroke">${v.label||''}</text>`});
  fns.forEach(f=>{const a=[];for(let x=-R;x<=R;x+=.25){const y=f.m*x+f.c;if(Math.abs(y)<=R)a.push(`${X(x)},${Y(y)}`)}s+=`<polyline points="${a.join(' ')}" fill="none" stroke="${f.color||'#4f46e5'}" stroke-width="2.4"/>`});
  polys.forEach(p=>{s+=`<polygon points="${p.pts.map(q=>X(q[0])+','+Y(q[1])).join(' ')}" fill="${p.color||'#6366f1'}" fill-opacity=".25" stroke="${p.color||'#4f46e5'}" stroke-width="2"/>`;
    if(p.names)p.pts.forEach((q,i)=>{s+=`<text x="${X(q[0])+4}" y="${Y(q[1])-5}" font-size="14" font-weight="700" fill="${p.color||'#4f46e5'}" stroke="#fff" stroke-width="4" stroke-linejoin="round" paint-order="stroke">${p.names[i]}</text>`})});
  pts.forEach(p=>{s+=`<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="4.5" fill="${p.color||'#d9480f'}"/><text x="${X(p.x)+7}" y="${Y(p.y)-6}" font-size="15" font-weight="700" fill="${p.color||'#d9480f'}" stroke="#fff" stroke-width="4" stroke-linejoin="round" paint-order="stroke">${p.label||''}</text>`});
  return svgWrap(s,260,260,14,'sq');
}
function barSvg(labels,vals,{max,unit='',w=340,h=220,color='#6366f1'}={}){
  const m=max||Math.ceil(Math.max(...vals)/5)*5||5,bx=40,bw=(w-bx-10)/vals.length;let s='';
  const step=m<=10?1:m<=20?2:m<=50?5:10;
  for(let v=0;v<=m;v+=step){const y=h-28-(v/m)*(h-50);s+=`<line x1="${bx}" y1="${y}" x2="${w-6}" y2="${y}" stroke="#e5e7eb"/><text x="${bx-4}" y="${y+3}" font-size="12" text-anchor="end" fill="#4b5563">${v}</text>`}
  vals.forEach((v,i)=>{const bh=(v/m)*(h-50),x=bx+i*bw+bw*.15;s+=`<rect x="${x}" y="${h-28-bh}" width="${bw*.7}" height="${bh}" fill="${color}"/><text x="${x+bw*.35}" y="${h-15}" font-size="13" font-weight="600" text-anchor="middle" fill="#1f2937">${labels[i]}</text>`});
  s+=`<line x1="${bx}" y1="10" x2="${bx}" y2="${h-28}" stroke="#111827" stroke-width="1.5"/><line x1="${bx}" y1="${h-28}" x2="${w-6}" y2="${h-28}" stroke="#111827" stroke-width="1.5"/>`;
  return svgWrap(s,w,h);
}
function polySymSvg(n,lines=true){
  const cx=130,cy=90,R=74,pts=[];for(let i=0;i<n;i++)pts.push(P(cx,cy,R,90+i*360/n));
  let s=`<polygon points="${pts.map(p=>f1(p[0])+','+f1(p[1])).join(' ')}" fill="#eef2ff" stroke="#111827" stroke-width="2.4"/>`;
  if(lines)for(let k=0;k<n;k++){const a=P(cx,cy,R+10,90+k*180/n),b=P(cx,cy,R+10,270+k*180/n);s+=`<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="#d9480f" stroke-width="1.4" stroke-dasharray="5 3"/>`}
  return svgWrap(s,260,180,20);
}
function rectSvg(w,h,u='cm',labels=true){
  const sc=Math.min(190/w,110/h),W=w*sc,H=h*sc,x=(260-W)/2,y=(150-H)/2+5;
  return svgWrap(`<rect x="${x}" y="${y}" width="${W}" height="${H}" fill="#eef2ff" stroke="#111827" stroke-width="2.4"/>`+txt(x+W/2,y+H+20,w+' '+u,false,16)+txt(x-10,y+H/2,h+' '+u,false,16,'end'),260,170,50);
}
function triSvg(b,h,u='cm'){
  const sc=Math.min(190/b,110/h),W=b*sc,H=h*sc,x=(260-W)/2,y=(150-H)/2+5,ax=x+W*.3;
  return svgWrap(`<polygon points="${x},${y+H} ${x+W},${y+H} ${ax},${y}" fill="#eef2ff" stroke="#111827" stroke-width="2.4"/><line x1="${ax}" y1="${y}" x2="${ax}" y2="${y+H}" stroke="#d9480f" stroke-dasharray="4 3" stroke-width="1.6"/>`+txt(x+W/2,y+H+20,b+' '+u,false,16)+txt(ax+9,y+H/2,h+' '+u,false,16,'start'),260,170,50);
}
function lShapeSvg(a,b,c,d,u='cm'){            // outer a(w) x b(h), top-right corner cut c(w) x d(h)
  const sc=Math.min(170/a,110/b),X0=45,Y0=20,A=a*sc,B=b*sc,C=c*sc,D=d*sc;
  const pts=[[X0,Y0+D],[X0+A-C,Y0+D],[X0+A-C,Y0],[X0+A,Y0],[X0+A,Y0+B],[X0,Y0+B]];  // simplified outline
  const p=[[X0,Y0],[X0+A-C,Y0],[X0+A-C,Y0+D],[X0+A,Y0+D],[X0+A,Y0+B],[X0,Y0+B]];
  return svgWrap(`<polygon points="${p.map(q=>q.join(',')).join(' ')}" fill="#eef2ff" stroke="#111827" stroke-width="2.4"/>`+txt(X0+A/2,Y0+B+20,a+' '+u,false,16)+txt(X0-10,Y0+B/2,b+' '+u,false,16,'end')+txt(X0+A-C/2,Y0+D-14,c+' '+u,false,16)+txt(X0+A-C-9,Y0+D/2,d+' '+u,false,16,'end'),260,175,50);
}
function bagSvg(c){
  const cols={red:'#dc2626',blue:'#2563eb',green:'#16a34a',yellow:'#eab308'};let items=[];
  Object.entries(c).forEach(([k,n])=>{for(let i=0;i<n;i++)items.push(cols[k])});
  const per=Math.min(items.length,8);let s='<rect x="55" y="20" width="150" height="130" rx="22" fill="#fef3c7" stroke="#b45309" stroke-width="3"/>';
  items.forEach((col,i)=>{const y=48+Math.floor(i/per)*30,x=per>1?78+(i%per)*(104/(per-1)):130;s+=`<circle cx="${x}" cy="${y}" r="11" fill="${col}" stroke="#fff" stroke-width="2"/>`});
  return svgWrap(s,260,170);
}
function lineChartSvg(labels,vals,{max,w=340,h=220}={}){
  const m=max||Math.ceil(Math.max(...vals)/5)*5,bx=40,dx=(w-bx-24)/(vals.length-1);let s='';
  const step=m<=10?1:m<=20?2:m<=50?5:10;
  for(let v=0;v<=m;v+=step){const y=h-28-(v/m)*(h-50);s+=`<line x1="${bx}" y1="${y}" x2="${w-6}" y2="${y}" stroke="#e5e7eb"/><text x="${bx-4}" y="${y+3}" font-size="12" text-anchor="end" fill="#4b5563">${v}</text>`}
  const pts=vals.map((v,i)=>[bx+10+i*dx,h-28-(v/m)*(h-50)]);
  s+=`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#4f46e5" stroke-width="2.6"/>`;
  pts.forEach((p,i)=>{s+=`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#d9480f"/><text x="${p[0]}" y="${h-12}" font-size="13" font-weight="600" text-anchor="middle">${labels[i]}</text>`});
  s+=`<line x1="${bx}" y1="10" x2="${bx}" y2="${h-28}" stroke="#111827" stroke-width="1.5"/><line x1="${bx}" y1="${h-28}" x2="${w-6}" y2="${h-28}" stroke="#111827" stroke-width="1.5"/>`;
  return svgWrap(s,w,h);
}

// =====================================================================
// 1  INTEGERS
// =====================================================================
T7.t01={
 easy:[
  r=>{const a=nz(r,-12,12),b=nz(r,-12,12);return Qn({text:`Work out <b>${M(a)} + ${sg(b)}</b>.`,ans:a+b,steps:[`Number line: start at ${M(a)} and move ${Math.abs(b)} ${b>0?'right':'left'}.`,`${M(a)} + ${sg(b)} = <b>${M(a+b)}</b>`],hint:'Adding a negative number moves you to the left.'})},
  r=>{const a=r.int(-9,9),b=nz(r,-9,9);return Qn({text:`Work out <b>${M(a)} − ${sg(b)}</b>.`,ans:a-b,steps:[`Subtracting ${sg(b)} is the same as adding the inverse, ${M(-b)}.`,`${M(a)} + ${sg(-b)} = <b>${M(a-b)}</b>`],hint:'Subtracting a negative = adding a positive.'})},
  r=>{const a=r.int(2,9),b=nz(r,-9,9);return Qn({text:`Work out <b>${sg(b)} × ${a}</b>.`,ans:a*b,steps:[`${b>0?'Positive × positive = positive':'Negative × positive = negative'}.`,`${a} × ${Math.abs(b)} = ${a*Math.abs(b)}, so the answer is <b>${M(a*b)}</b>`],hint:'Multiply the numbers, then decide the sign.'})},
  r=>{const t=r.int(-5,12),d=r.int(4,16);return Qn({text:`At noon the temperature is ${M(t)}°C. By midnight it has fallen by ${d}°C. What is the temperature at midnight?`,label:'Temperature =',unit:'°C',ans:t-d,steps:[`${M(t)} − ${d} = <b>${M(t-d)}</b>`],hint:'Falling means subtract.'})},
 ],
 medium:[
  r=>{const a=nz(r,-15,15),b=nz(r,-12,12),c=nz(r,-12,12);return Qn({text:`Work out <b>${M(a)} + ${sg(b)} − ${sg(c)}</b>.`,ans:a+b-c,steps:[`Work left to right.`,`${M(a)} + ${sg(b)} = ${M(a+b)}`,`${M(a+b)} − ${sg(c)} = ${M(a+b)} + ${sg(-c)} = <b>${M(a+b-c)}</b>`],hint:'Do the first two numbers first.'})},
  r=>{const q=nz(r,-9,9),b=nz(r,-9,9)||2,a=q*b;return Qn({text:`Work out <b>${M(a)} ÷ ${sg(b)}</b>.`,ans:q,steps:[`Same signs give a positive answer; different signs give a negative answer.`,`${Math.abs(a)} ÷ ${Math.abs(b)} = ${Math.abs(q)}`,`So the answer is <b>${M(q)}</b>`],hint:'Same signs → positive. Different signs → negative.'})},
  r=>{const [a,b]=r.pick([[4,6],[6,8],[9,12],[10,15],[8,12],[6,9],[12,16],[14,21],[15,20],[18,24]]);const l=lcm(a,b);return Qn({text:`Find the <b>lowest common multiple (LCM)</b> of ${a} and ${b}.`,ans:l,steps:[`Multiples of ${a}: ${[1,2,3,4,5,6].map(k=>a*k).join(', ')} …`,`Multiples of ${b}: ${[1,2,3,4,5,6].map(k=>b*k).join(', ')} …`,`First number in both lists: <b>${l}</b>`],hint:'List the multiples of each number.'})},
  r=>{const [a,b]=r.pick([[12,18],[24,36],[18,27],[20,30],[16,24],[30,45],[28,42],[36,48]]);const g=gcd(a,b);return Qn({text:`Find the <b>highest common factor (HCF)</b> of ${a} and ${b}.`,ans:g,steps:[`List the factors of each number and find the biggest shared one.`,`HCF(${a}, ${b}) = <b>${g}</b>`],hint:'The largest number that divides into both.'})},
  r=>{const sq=r.chance(.5),n=sq?r.int(2,15):r.int(2,6);return Qn({text:sq?`Work out <b>√${n*n}</b>.`:`Work out <b>∛${n**3}</b> (the cube root).`,ans:n,steps:[sq?`${n} × ${n} = ${n*n}`:`${n} × ${n} × ${n} = ${n**3}`,`So the answer is <b>${n}</b>`],hint:'Which number multiplied by itself (or three times) gives this?'})},
 ],
 hard:[
  r=>{const a=nz(r,-9,9),b=nz(r,-9,9),c=nz(r,-9,9),d=nz(r,-9,9);return Qn({text:`Work out <b>${sg(a)} × ${sg(b)} + ${sg(c)} × ${sg(d)}</b>.`,ans:a*b+c*d,steps:[`Multiply first (BIDMAS): ${sg(a)} × ${sg(b)} = ${M(a*b)} and ${sg(c)} × ${sg(d)} = ${M(c*d)}`,`${M(a*b)} + ${sg(c*d)} = <b>${M(a*b+c*d)}</b>`],hint:'Do the multiplications before adding.'})},
  r=>{const [a,b]=r.pick([[12,18],[15,20],[8,12],[10,25],[14,21],[16,24]]);return Qn({text:`Bus A leaves the station every ${a} minutes and bus B every ${b} minutes. They both leave at 9:00 am. After how many minutes do they next leave together?`,label:'Time =',unit:' min',ans:lcm(a,b),steps:[`We need the lowest common multiple of ${a} and ${b}.`,`LCM = <b>${lcm(a,b)}</b> minutes`],hint:'Think LCM.'})},
  r=>{const dg=r.pick([3,9]),a=r.int(1,9),b=r.int(1,9),low=r.chance(.5);let cand=[];for(let d=0;d<=9;d++)if((a+b+d)%dg===0)cand.push(d);const ans=low?cand[0]:cand[cand.length-1];return Qn({text:`The number <b>${a}d${b}</b> (with digit d in the middle) is divisible by ${dg}. Find the ${low?'smallest':'largest'} possible digit d.`,label:'d =',ans,steps:[`A number is divisible by ${dg} if its digit sum is divisible by ${dg}.`,`Digit sum = ${a} + d + ${b} = ${a+b} + d`,`Possible digits: ${cand.join(', ')}, so d = <b>${ans}</b>`],hint:'Add the digits.'})},
  r=>{const [a,b]=r.pick([[36,48],[60,84],[54,72],[45,60],[72,96]]);return Qn({text:`Two ribbons are ${a} cm and ${b} cm long. They are cut into equal pieces, as long as possible, with none left over. How long is each piece?`,label:'Length =',unit:' cm',ans:gcd(a,b),steps:[`We need the highest common factor of ${a} and ${b}.`,`HCF = <b>${gcd(a,b)}</b> cm`],hint:'Think HCF.'})},
  r=>{const a=r.int(3,12),b=r.int(2,5),c=r.int(2,6);return Qn({text:`Work out <b>√${a*a} + ∛${b**3} − ${c}²</b>.`,ans:a+b-c*c,steps:[`√${a*a} = ${a},  ∛${b**3} = ${b},  ${c}² = ${c*c}`,`${a} + ${b} − ${c*c} = <b>${M(a+b-c*c)}</b>`],hint:'Work out each part first.'})},
 ]};

// =====================================================================
// 2  EXPRESSIONS, FORMULAE AND EQUATIONS
// =====================================================================
T7.t02={
 easy:[
  r=>{const a=r.int(2,9),b=nz(r,-9,9),x=r.int(2,9);return Qn({text:`Work out the value of <b>${lin(a,b)}</b> when x = ${x}.`,ans:a*x+b,steps:[`Replace x with ${x}: ${a} × ${x} ${b>0?'+':'−'} ${Math.abs(b)}`,`= ${a*x} ${b>0?'+':'−'} ${Math.abs(b)} = <b>${a*x+b}</b>`],hint:'Substitute the number for x. Multiply before adding.'})},
  wrap10(Y10.easy[0]),wrap10(Y10.easy[1]),wrap10(Y10.easy[2]),
 ],
 medium:[
  r=>{const l=r.int(3,15),w=r.int(2,12);return Qn({text:`The perimeter of a rectangle is given by the formula <b>P = 2(l + w)</b>. Find P when l = ${l} and w = ${w}.`,label:'P =',ans:2*(l+w),steps:[`P = 2(${l} + ${w}) = 2 × ${l+w}`,`P = <b>${2*(l+w)}</b>`],hint:'Brackets first.'})},
  wrap10(Y10.easy[3]),wrap10(Y10.medium[4]),
  r=>{const a=r.int(2,6),b=r.int(1,9),c=r.int(1,6),x=r.int(1,6);return Qn({text:`Simplify <b>${a}(x + ${b}) + ${c}x</b>, then find its value when x = ${x}.`,ans:a*(x+b)+c*x,steps:[`Expand: ${a}x + ${a*b} + ${c}x`,`Collect like terms: ${a+c}x + ${a*b}`,`x = ${x}: ${a+c} × ${x} + ${a*b} = <b>${(a+c)*x+a*b}</b>`],hint:'Expand the bracket, collect like terms, then substitute.'})},
 ],
 hard:[
  wrap10(Y10.medium[0]),wrap10(Y10.medium[1]),
  r=>{const a=r.int(2,7),b=r.int(1,12),c=r.int(20,60);const k=Math.ceil((c+b)/a)-1;const strict=(a*k-b<c);return Qn({text:`Find the <b>largest whole number n</b> such that <b>${a}n − ${b} &lt; ${c}</b>.`,label:'n =',ans:k,steps:[`Add ${b}: ${a}n &lt; ${c+b}`,`Divide by ${a}: n &lt; ${rd((c+b)/a,3)}`,`The largest whole number below that is <b>${k}</b>`],hint:'Solve like an equation, then pick the largest whole number that is strictly smaller.'})},
  r=>{const c0=r.int(10,40),rate=r.int(5,25),h=r.int(2,9),T=c0+rate*h;return Qn({text:`A plumber charges £${c0} call-out fee plus £${rate} for each hour of work. The bill is £${T}. How many hours did the job take?`,label:'Hours =',ans:h,steps:[`Equation: ${rate}h + ${c0} = ${T}`,`${rate}h = ${T-c0}`,`h = ${T-c0} ÷ ${rate} = <b>${h}</b>`],hint:'Write an equation with h for the hours.'})},
 ]};

// =====================================================================
// 3  PLACE VALUE AND ROUNDING
// =====================================================================
const roundHalfUp=(v,step)=>rd(Math.floor(v/step+.5+1e-9)*step,6);
T7.t03={
 easy:[
  r=>{const k=r.pick([10,100,1000]),a=r.int(11,999)/r.pick([1,10,100]);return Qn({text:`Work out <b>${a} × ${pr(k)}</b>.`,ans:rd(a*k),steps:[`Multiplying by ${pr(k)} moves every digit ${String(k).length-1} place${k>10?'s':''} to the left.`,`${a} × ${pr(k)} = <b>${rd(a*k)}</b>`],hint:'Move the digits to the left (bigger).'})},
  r=>{const k=r.pick([10,100,1000]),a=r.int(11,9999);return Qn({text:`Work out <b>${a} ÷ ${pr(k)}</b>.`,ans:rd(a/k),steps:[`Dividing by ${pr(k)} moves every digit ${String(k).length-1} place${k>10?'s':''} to the right.`,`${a} ÷ ${pr(k)} = <b>${rd(a/k)}</b>`],hint:'Move the digits to the right (smaller).'})},
  r=>{const k=r.pick([10,100]),n=r.int(101,999)*(k===10?1:1)+r.int(0,0);const v=roundHalfUp(n+0.0,k);return Qn({text:`Round <b>${n}</b> to the nearest ${k}.`,ans:v,steps:[`Look at the digit in the ${k===10?'units':'tens'} place: ${k===10?n%10:Math.floor(n/10)%10}.`,`5 or more → round up; 4 or less → round down.`,`${n} rounds to <b>${v}</b>`],hint:'Look at the digit to the right of the rounding place.'})},
  r=>{const ds=r.shuffle([1,2,3,4,5,6,7,8,9]).slice(0,4),pos=r.int(0,3),dp=r.int(0,1);const num=ds[0]+''+ds[1]+''+ds[2]+'.'+ds[3];const names=['hundreds','tens','units','tenths'],vals=[100,10,1,.1];return Qn({text:`What is the <b>value</b> of the digit ${ds[pos]} in the number <b>${num}</b>?`,ans:rd(ds[pos]*vals[pos]),steps:[`The digit ${ds[pos]} is in the ${names[pos]} column.`,`Its value is ${ds[pos]} × ${vals[pos]} = <b>${rd(ds[pos]*vals[pos])}</b>`],hint:'Which column is the digit in?'})},
 ],
 medium:[
  r=>{const k=r.pick([100,1000]),n=r.int(1100,98999);return Qn({text:`Round <b>${pr(n)}</b> to the nearest ${pr(k)}.`,ans:roundHalfUp(n,k),steps:[`Look at the digit to the right of the ${pr(k)}s place.`,`${pr(n)} rounds to <b>${pr(roundHalfUp(n,k))}</b>`],hint:'5 or more → round up.'})},
  r=>{const m=r.int(1001,9999),n=m/1000;return Qn({text:`Round <b>${n}</b> to <b>1 decimal place</b>.`,ans:roundHalfUp(n,.1),steps:[`Look at the 2nd decimal digit: ${String(m).charAt(String(m).length-2)}.`,`${n} rounds to <b>${roundHalfUp(n,.1)}</b>`],hint:'The 2nd decimal digit decides whether the 1st decimal digit goes up.'})},
  r=>{const n=r.int(101,9999)/10;return Qn({text:`Round <b>${n}</b> to the <b>nearest whole number</b>.`,ans:roundHalfUp(n,1),steps:[`Look at the tenths digit: ${Math.round((n%1)*10)}.`,`${n} rounds to <b>${roundHalfUp(n,1)}</b>`],hint:'Tenths digit 5 or more → round up.'})},
  r=>{const a=r.int(23,97),b=r.int(12,48),ra=roundHalfUp(a,10),rb=roundHalfUp(b,10);return Qn({text:`Estimate <b>${a} × ${b}</b> by rounding each number to the nearest 10.`,ans:ra*rb,steps:[`${a} ≈ ${ra} and ${b} ≈ ${rb}`,`${ra} × ${rb} = <b>${ra*rb}</b>`],hint:'Round both numbers first.'})},
 ],
 hard:[
  r=>{const b=r.int(2,9),k=r.int(3,9),ar=b*k,a=ar+r.pick([-1,1])*r.int(1,4)/10,bb=b+r.pick([-1,1])*r.int(1,4)/10;return Qn({text:`Estimate <b>${rd(a,1)} ÷ ${rd(bb,1)}</b> by rounding each number to the nearest whole number.`,ans:k,steps:[`${rd(a,1)} ≈ ${ar} and ${rd(bb,1)} ≈ ${b}`,`${ar} ÷ ${b} = <b>${k}</b>`],hint:'Round both numbers to whole numbers.'})},
  r=>{const n=r.int(30,300)*100,low=r.chance(.5);return Qn({text:`The attendance at a match is ${pr(n)} to the nearest hundred. What is the ${low?'smallest':'largest'} whole number it could be?`,label:'Answer =',ans:low?n-50:n+49,steps:[`Rounding to the nearest hundred means within 50 of ${pr(n)}.`,low?`Smallest: ${pr(n)} − 50 = <b>${pr(n-50)}</b>`:`Largest whole number: ${pr(n)} + 49 = <b>${pr(n+49)}</b> (${pr(n+50)} would round up)`],hint:'Which numbers round to this value?'})},
  r=>{const a=r.int(11,99)/10,k1=r.pick([10,100,1000]),k2=r.pick([10,100]);return Qn({text:`Work out <b>${a} × ${pr(k1)} ÷ ${pr(k2)}</b>.`,ans:rd(a*k1/k2),steps:[`${a} × ${pr(k1)} = ${rd(a*k1)}`,`${rd(a*k1)} ÷ ${pr(k2)} = <b>${rd(a*k1/k2)}</b>`],hint:'Work left to right.'})},
  r=>{const m=r.int(10001,99999),n=m/10000;return Qn({text:`Round <b>${n}</b> to <b>2 decimal places</b>.`,ans:roundHalfUp(n,.01),steps:[`Look at the 3rd decimal digit: ${String(m).charAt(String(m).length-3)}.`,`${n} rounds to <b>${roundHalfUp(n,.01)}</b>`],hint:'The 3rd decimal digit decides.'})},
 ]};

// =====================================================================
// 4  DECIMALS
// =====================================================================
T7.t04={
 easy:[
  r=>{const a=r.int(11,99)/10,b=r.int(11,99)/10;return Qn({text:`Work out <b>${a} + ${b}</b>.`,ans:rd(a+b),steps:[`Line up the decimal points.`,`${a} + ${b} = <b>${rd(a+b)}</b>`],hint:'Line up the decimal points.'})},
  r=>{const b=r.int(11,59)/10,a=rd(b+r.int(11,59)/10);return Qn({text:`Work out <b>${a} − ${b}</b>.`,ans:rd(a-b),steps:[`Line up the decimal points.`,`${a} − ${b} = <b>${rd(a-b)}</b>`],hint:'Line up the decimal points.'})},
  r=>{const v=r.shuffle([r.int(41,49)/100,r.int(401,409)/1000,r.int(5,9)/10]);return Qn({text:`Which is the <b>largest</b> number: ${v.join(', ')}?`,label:'Largest =',ans:Math.max(...v),steps:[`Write each with 3 decimal places: ${v.map(x=>x.toFixed(3)).join(', ')}`,`The largest is <b>${Math.max(...v)}</b>`],hint:'Give each number the same number of decimal places.'})},
 ],
 medium:[
  r=>{const a=r.int(2,9)/10,b=r.int(2,9)/10;return Qn({text:`Work out <b>${a} × ${b}</b>.`,ans:rd(a*b),steps:[`${a*10} × ${b*10} = ${a*b*100}`,`There are 2 decimal places in total, so the answer is <b>${rd(a*b)}</b>`],hint:'Ignore the decimal points, multiply, then count decimal places.'})},
  r=>{const q=r.int(11,99)/10,b=r.int(2,9);return Qn({text:`Work out <b>${rd(q*b)} ÷ ${b}</b>.`,ans:q,steps:[`${rd(q*b*10)} ÷ ${b} = ${q*10}`,`So ${rd(q*b)} ÷ ${b} = <b>${q}</b>`],hint:'Divide as if there were no decimal point.'})},
  r=>{const d=r.pick([.5,.2,.1,.25]),k=r.int(2,12);const a=rd(d*k);return Qn({text:`Work out <b>${a} ÷ ${d}</b>.`,ans:k,steps:[`Multiply both numbers by ${d===.25?100:10} to make the divisor a whole number.`,`${rd(a*(d===.25?100:10))} ÷ ${d*(d===.25?100:10)} = <b>${k}</b>`],hint:'Make the number you divide by a whole number.'})},
  r=>{const a=r.int(11,99)/10,b=r.int(2,9);return Qn({text:`Work out <b>${a} × ${b}</b>.`,ans:rd(a*b),steps:[`${a*10} × ${b} = ${a*10*b}`,`Divide by 10: <b>${rd(a*b)}</b>`],hint:'Multiply ignoring the point, then put it back.'})},
 ],
 hard:[
  r=>{const p=r.int(11,29)/10*.5,n=r.int(2,5),q=r.int(110,260)/100,m=r.int(2,4);const pp=rd(p*2)/2*1;const pen=rd(r.int(105,195)/100),nb=rd(r.int(180,320)/100);const tot=rd(n*pen+m*nb);const pay=Math.ceil(tot/5)*5+5;return Qn({text:`${n} pens cost £${pen.toFixed(2)} each and ${m} notebooks cost £${nb.toFixed(2)} each. How much change from £${pay}?`,label:'Change = £',ans:rd(pay-tot),steps:[`Pens: ${n} × ${pen} = ${rd(n*pen)}`,`Notebooks: ${m} × ${nb} = ${rd(m*nb)}`,`Total = ${tot};  change = ${pay} − ${tot} = <b>${rd(pay-tot)}</b>`],hint:'Find the total cost first.'})},
  r=>{const d=r.pick([.02,.04,.05,.08,.03]),k=r.int(3,40);const a=rd(d*k);return Qn({text:`Work out <b>${a} ÷ ${d}</b>.`,ans:k,steps:[`Multiply both numbers by 100: ${rd(a*100)} ÷ ${rd(d*100)}`,`= <b>${k}</b>`],hint:'Multiply both by 100.'})},
  r=>{const a=r.int(21,89)/10,b=r.int(3,9)/10;return Qn({text:`Work out <b>${a} × ${b}</b>.`,ans:rd(a*b),steps:[`${a*10} × ${b*10} = ${a*b*100}`,`Decimal places: 1 + 1 = 2, so <b>${rd(a*b)}</b>`],hint:'Count the total decimal places.'})},
  r=>{const a=r.int(21,89)/10;return Qn({text:`Work out <b>${a} × 9.9</b> using ${a} × 10 − ${a} × 0.1.`,ans:rd(a*9.9),steps:[`${a} × 10 = ${rd(a*10)}`,`${a} × 0.1 = ${rd(a/10)}`,`${rd(a*10)} − ${rd(a/10)} = <b>${rd(a*9.9)}</b>`],hint:'9.9 is 10 − 0.1.'})},
 ]};

// =====================================================================
// 5  ANGLES (from generators.js)
// =====================================================================
T7.t05=Y7;

// =====================================================================
// 6  COLLECTING DATA / AVERAGES
// =====================================================================
const listTxt=a=>a.join(', ');
function dataSet(r,n,mean,spread){const a=[];let s=mean*n;for(let i=0;i<n-1;i++){const v=Math.max(1,mean+r.int(-spread,spread));a.push(v);s-=v}if(s<1||s>mean+spread*2)return dataSet(r,n,mean,spread);a.push(s);return r.shuffle(a)}
T7.t06={
 easy:[
  r=>{const a=r.shuffle(r.shuffle([...Array(30).keys()].map(i=>i+1)).slice(0,r.pick([5,7])));const s=[...a].sort((x,y)=>x-y);return Qn({text:`Find the <b>median</b> of: ${listTxt(a)}`,label:'Median =',ans:s[(s.length-1)/2],steps:[`Order the numbers: ${listTxt(s)}`,`The middle number is <b>${s[(s.length-1)/2]}</b>`],hint:'Put the numbers in order first.'})},
  r=>{const a=r.shuffle([...Array(20).keys()].map(i=>i+1)).slice(0,5),m=r.pick(a),l=r.shuffle([...a,m,m]);return Qn({text:`Find the <b>mode</b> of: ${listTxt(l)}`,label:'Mode =',ans:m,steps:[`The mode is the value that appears most often.`,`${m} appears 3 times: mode = <b>${m}</b>`],hint:'Which number appears most?'})},
  r=>{const a=r.shuffle([...Array(40).keys()].map(i=>i+1)).slice(0,6);return Qn({text:`Find the <b>range</b> of: ${listTxt(a)}`,label:'Range =',ans:Math.max(...a)-Math.min(...a),steps:[`Range = largest − smallest`,`${Math.max(...a)} − ${Math.min(...a)} = <b>${Math.max(...a)-Math.min(...a)}</b>`],hint:'Largest minus smallest.'})},
  r=>{const m=r.int(4,12),a=dataSet(r,4,m,3);return Qn({text:`Find the <b>mean</b> of: ${listTxt(a)}`,label:'Mean =',ans:m,steps:[`Add: ${a.join(' + ')} = ${m*4}`,`Divide by 4: ${m*4} ÷ 4 = <b>${m}</b>`],hint:'Add up, then divide by how many.'})},
 ],
 medium:[
  r=>{const m=r.int(5,15),n=r.pick([5,6]),a=dataSet(r,n,m,4);return Qn({text:`Find the <b>mean</b> of: ${listTxt(a)}`,label:'Mean =',ans:m,steps:[`Total = ${m*n}`,`${m*n} ÷ ${n} = <b>${m}</b>`],hint:'Add up, then divide.'})},
  r=>{const a=r.shuffle([...Array(30).keys()].map(i=>i+1)).slice(0,r.pick([6,8])),s=[...a].sort((x,y)=>x-y),n=s.length,m=(s[n/2-1]+s[n/2])/2;return Qn({text:`Find the <b>median</b> of: ${listTxt(a)}`,label:'Median =',ans:m,steps:[`Order: ${listTxt(s)}`,`Two middle numbers: ${s[n/2-1]} and ${s[n/2]}`,`Median = (${s[n/2-1]} + ${s[n/2]}) ÷ 2 = <b>${m}</b>`],hint:'With an even number of values, find the mean of the middle two.'})},
  r=>{for(;;){const f=[0,1,2,3,4].map(()=>r.int(1,9)),tot=f.reduce((a,b)=>a+b,0),sum=f.reduce((a,b,i)=>a+b*i,0);if(sum%tot===0){return Qn({text:`The table shows the number of pets owned by students.<table class="mini"><tr><th>Pets</th>${[0,1,2,3,4].map(i=>`<td>${i}</td>`).join('')}</tr><tr><th>Students</th>${f.map(i=>`<td>${i}</td>`).join('')}</tr></table>Find the <b>mean</b> number of pets.`,label:'Mean =',ans:sum/tot,steps:[`Total pets = ${f.map((x,i)=>`${x}×${i}`).join(' + ')} = ${sum}`,`Total students = ${tot}`,`Mean = ${sum} ÷ ${tot} = <b>${sum/tot}</b>`],hint:'Multiply each value by its frequency, add, then divide by the total frequency.'})}}},
  r=>{const a=r.int(12,30),s=r.int(3,9);return Qn({text:`The smallest value in a set of data is ${s} and the range is ${a}. What is the <b>largest</b> value?`,label:'Largest =',ans:s+a,steps:[`Range = largest − smallest`,`Largest = ${s} + ${a} = <b>${s+a}</b>`],hint:'Range = largest − smallest.'})},
 ],
 hard:[
  r=>{const m=r.int(5,12),n=5,a=dataSet(r,4,m,3),last=m*n-a.reduce((x,y)=>x+y,0);if(last<1)return T7.t06.hard[0](r);return Qn({text:`The mean of five numbers is ${m}. Four of the numbers are ${listTxt(a)}. Find the <b>fifth</b> number.`,label:'Fifth number =',ans:last,steps:[`Total of five numbers = ${m} × 5 = ${m*5}`,`Total of the four = ${a.reduce((x,y)=>x+y,0)}`,`Fifth = ${m*5} − ${a.reduce((x,y)=>x+y,0)} = <b>${last}</b>`],hint:'Total = mean × number of values.'})},
  r=>{const m=r.int(5,10),n=r.int(3,6),m2=m+r.int(1,3);return Qn({text:`The mean of ${n} numbers is ${m}. A new number is added and the mean becomes ${m2}. What is the new number?`,label:'New number =',ans:m2*(n+1)-m*n,steps:[`Old total = ${m} × ${n} = ${m*n}`,`New total = ${m2} × ${n+1} = ${m2*(n+1)}`,`New number = ${m2*(n+1)} − ${m*n} = <b>${m2*(n+1)-m*n}</b>`],hint:'Compare the totals before and after.'})},
  r=>{const s=r.pick([200,400,500,800,1200]),p=r.pick([5,10,20,25]);return Qn({text:`A school has ${s} students. A sample of ${p}% is chosen for a survey. How many students are in the sample?`,label:'Sample size =',ans:s*p/100,steps:[`${p}% of ${s} = ${s} × ${p} ÷ 100`,`= <b>${s*p/100}</b>`],hint:'Find the percentage of the total.'})},
  r=>{const m=r.int(6,12),a=dataSet(r,5,m,3),mx=Math.max(...a),mn=Math.min(...a);return Qn({text:`Class A scores: ${listTxt(a)}. Class B has a mean score of ${m+2}. What is the <b>difference between the two means</b> (B − A)?`,label:'Difference =',ans:2,steps:[`Mean of class A = ${m*5} ÷ 5 = ${m}`,`Difference = ${m+2} − ${m} = <b>2</b>`],hint:'Find the mean of class A first.'})},
 ]};

// =====================================================================
// 7  FRACTIONS
// =====================================================================
T7.t07={
 easy:[
  r=>{const d=r.int(5,12),a=r.int(1,d-2),b=r.int(1,d-a-1);return Qn(Object.assign(fracAns(a+b,d),{text:`Work out <b>${fr(a,d)} + ${fr(b,d)}</b>. Give your answer in simplest form.`,steps:[`The denominators are the same, so add the numerators: ${a} + ${b} = ${a+b}`,`${fr(a+b,d)} = <b>${Fr(a+b,d).join('/')}</b> in simplest form`],hint:'Same denominator: add the numerators only.'}))},
  r=>{const d=r.pick([3,4,5,6,8]),k=r.int(2,12),n=r.int(1,d-1),T=d*k;return Qn({text:`Work out <b>${fr(n,d)} of ${T}</b>.`,ans:n*k,steps:[`Divide by ${d}: ${T} ÷ ${d} = ${k}`,`Multiply by ${n}: ${k} × ${n} = <b>${n*k}</b>`],hint:'Divide by the denominator, multiply by the numerator.'})},
  r=>{const n=r.int(1,4),d=r.int(n+1,6),m=r.int(2,5);return Qn({text:`Find the missing number: <b>${fr(n,d)} = ${fr('?',d*m)}</b>`,label:'? =',ans:n*m,steps:[`${d} × ${m} = ${d*m}, so multiply the numerator by ${m} too.`,`${n} × ${m} = <b>${n*m}</b>`],hint:'Multiply top and bottom by the same number.'})},
 ],
 medium:[
  r=>{const [a,b]=r.pick([[2,3],[2,5],[3,4],[3,5],[4,5],[2,7],[3,8],[5,6]]),n1=r.int(1,a-1),n2=r.int(1,b-1);return Qn(Object.assign(fracAns(n1*b+n2*a,a*b),{text:`Work out <b>${fr(n1,a)} + ${fr(n2,b)}</b>.`,steps:[`Common denominator: ${a*b}`,`${fr(n1*b,a*b)} + ${fr(n2*a,a*b)} = ${fr(n1*b+n2*a,a*b)}`,`Simplest form: <b>${Fr(n1*b+n2*a,a*b).join('/')}</b>`],hint:'Find a common denominator first.'}))},
  r=>{const d=r.pick([4,5,8,10]),m=r.int(2,3),a=r.int(1,d-1),b=r.int(1,d-1),w1=r.int(1,3),w2=r.int(1,3);const T=(w1+w2)*d+a+b;return Qn(Object.assign(fracAns(T,d),{text:`Work out <b>${mixed(w1,a,d)} + ${mixed(w2,b,d)}</b>.`,steps:[`Add the whole numbers: ${w1} + ${w2} = ${w1+w2}`,`Add the fractions: ${fr(a+b,d)}`,`Total = ${fr(T,d)} improper = <b>${Fr(T,d).join('/')}</b> (as an improper fraction)`],hint:'Add whole numbers and fractions separately.'}))},
  r=>{const [a,b]=r.pick([[2,3],[3,4],[3,5],[4,5],[5,6],[3,8]]),c=r.int(1,a-1),e=r.int(1,b-1);return Qn(Object.assign(fracAns(c*e,a*b),{text:`Work out <b>${fr(c,a)} × ${fr(e,b)}</b>.`,steps:[`Multiply the numerators: ${c} × ${e} = ${c*e}`,`Multiply the denominators: ${a} × ${b} = ${a*b}`,`${fr(c*e,a*b)} = <b>${Fr(c*e,a*b).join('/')}</b>`],hint:'Top × top, bottom × bottom.'}))},
  r=>{const d=r.pick([5,8,10]),a=r.int(d/2+1|0,d-1),b=r.int(1,a-1);return Qn(Object.assign(fracAns(a-b,d),{text:`Work out <b>${fr(a,d)} − ${fr(b,d)}</b>. Give your answer in simplest form.`,steps:[`Subtract the numerators: ${a} − ${b} = ${a-b}`,`<b>${Fr(a-b,d).join('/')}</b>`],hint:'Same denominator: subtract the numerators.'}))},
 ],
 hard:[
  r=>{const [a,b]=r.pick([[3,4],[2,3],[5,6],[3,5]]),[c,d]=r.pick([[3,8],[1,6],[2,9],[1,4]]);return Qn(Object.assign(fracAns(a*d,b*c),{text:`Work out <b>${fr(a,b)} ÷ ${fr(c,d)}</b>.`,steps:[`Flip the second fraction and multiply: ${fr(a,b)} × ${fr(d,c)}`,`= ${fr(a*d,b*c)} = <b>${Fr(a*d,b*c).join('/')}</b>`],hint:'Keep, change, flip.'}))},
  r=>{const [a,b]=r.pick([[1,4],[1,5],[1,3],[2,5],[1,6]]),[c,d]=r.pick([[2,5],[1,2],[3,10],[1,4]]);const L=lcm(lcm(b,d),1);const n=L-(a*L/b)-(c*L/d);if(n<=0)return T7.t07.hard[1](r);return Qn(Object.assign(fracAns(n,L),{text:`Ali spends <b>${fr(a,b)}</b> of his money on books and <b>${fr(c,d)}</b> on food. What fraction of his money is left?`,steps:[`Spent: ${fr(a,b)} + ${fr(c,d)} = ${fr(a*L/b+c*L/d,L)}`,`Left: 1 − ${fr(a*L/b+c*L/d,L)} = ${fr(n,L)} = <b>${Fr(n,L).join('/')}</b>`],hint:'Add the fractions spent, then subtract from 1.'}))},
  r=>{const d=r.pick([3,4,5]),n=r.int(1,d-1),k=r.int(2,12);return Qn({text:`A tank is <b>${fr(n,d)}</b> full and contains ${n*k} litres. What is the full capacity of the tank?`,label:'Capacity =',unit:' litres',ans:d*k,steps:[`${fr(n,d)} of the tank = ${n*k} litres`,`1/${d} of the tank = ${n*k} ÷ ${n} = ${k} litres`,`Whole tank = ${k} × ${d} = <b>${d*k}</b> litres`],hint:'Find one part first.'})},
  r=>{const w1=r.int(1,3),w2=r.int(1,2),[a,b]=r.pick([[1,2],[3,4],[2,3]]),[c,d]=r.pick([[1,4],[1,3],[2,5]]);return Qn(Object.assign(fracAns((w1*b+a)*(w2*d+c),b*d),{text:`Work out <b>${mixed(w1,a,b)} × ${mixed(w2,c,d)}</b>.`,steps:[`Write as improper fractions: ${fr(w1*b+a,b)} × ${fr(w2*d+c,d)}`,`= ${fr((w1*b+a)*(w2*d+c),b*d)} = <b>${Fr((w1*b+a)*(w2*d+c),b*d).join('/')}</b>`],hint:'Convert mixed numbers to improper fractions first.'}))},
 ]};

// =====================================================================
// 8  SHAPES AND SYMMETRY
// =====================================================================
const POLY={3:'equilateral triangle',4:'square',5:'regular pentagon',6:'regular hexagon',7:'regular heptagon',8:'regular octagon',9:'regular nonagon',10:'regular decagon'};
const SOLIDS=[['cube',6,12,8],['cuboid',6,12,8],['triangular prism',5,9,6],['square-based pyramid',5,8,5],['tetrahedron',4,6,4],['pentagonal prism',7,15,10],['hexagonal prism',8,18,12]];
const SHAPES=[['rectangle',2,2],['parallelogram',0,2],['rhombus',2,2],['kite',1,1],['isosceles trapezium',1,1],['isosceles triangle',1,1],['equilateral triangle',3,3],['square',4,4]];
T7.t08={
 easy:[
  r=>{const n=r.int(3,8);return Qn({text:`How many <b>lines of symmetry</b> does this ${POLY[n]} have?`,svg:polySymSvg(n,false),label:'Lines =',ans:n,steps:[`A regular polygon with ${n} sides has ${n} lines of symmetry.`,`Answer: <b>${n}</b>`],hint:'A regular polygon has as many lines of symmetry as sides.'})},
  r=>{const [nm,f,e,v]=r.pick(SOLIDS),w=r.pick([['faces',f],['edges',e],['vertices',v]]);return Qn({text:`How many <b>${w[0]}</b> does a ${nm} have?`,label:w[0][0].toUpperCase()+w[0].slice(1)+' =',ans:w[1],steps:[`A ${nm}: ${f} faces, ${e} edges, ${v} vertices.`,`Answer: <b>${w[1]}</b>`],hint:'Picture the solid and count carefully.'})},
  r=>{const rr=r.int(3,25);const rad=r.chance(.5);return Qn({text:rad?`A circle has radius ${rr} cm. What is its <b>diameter</b>?`:`A circle has diameter ${rr*2} cm. What is its <b>radius</b>?`,label:rad?'Diameter =':'Radius =',unit:' cm',ans:rad?rr*2:rr,steps:[`Diameter = 2 × radius`,rad?`2 × ${rr} = <b>${rr*2}</b> cm`:`${rr*2} ÷ 2 = <b>${rr}</b> cm`],hint:'Diameter = 2 × radius.'})},
 ],
 medium:[
  r=>{const n=r.int(3,10);return Qn({text:`What is the <b>order of rotational symmetry</b> of a ${POLY[n]}?`,label:'Order =',ans:n,steps:[`It looks the same ${n} times in one full turn.`,`Order = <b>${n}</b>`],hint:'How many times does it fit on itself in one turn?'})},
  r=>{const [nm,l,o]=r.pick(SHAPES),which=r.chance(.5);return Qn({text:which?`How many <b>lines of symmetry</b> does a ${nm} have?`:`What is the <b>order of rotational symmetry</b> of a ${nm}?`,label:'Answer =',ans:which?l:o,steps:[`A ${nm} has ${l} line${l===1?'':'s'} of symmetry and rotational symmetry of order ${o}.`,`Answer: <b>${which?l:o}</b>`],hint:'Sketch the shape and test it.'})},
  r=>{const A=r.int(30,80),B=r.int(30,80);return Qn({text:`Triangle ABC is congruent to triangle PQR (A↔P, B↔Q, C↔R). Angle A = ${A}° and angle B = ${B}°. Find <b>angle R</b>.`,label:'Angle R =',unit:'°',ans:180-A-B,steps:[`Congruent shapes have equal matching angles, so angle C = angle R.`,`Angle C = 180° − ${A}° − ${B}° = <b>${180-A-B}°</b>`],hint:'Find the third angle of triangle ABC.'})},
 ],
 hard:[
  r=>{const [nm,f,e,v]=r.pick(SOLIDS),w=r.pick(['faces','edges','vertices']);const g={faces:[e,v],edges:[f,v],vertices:[f,e]}[w];const ans={faces:f,edges:e,vertices:v}[w];const t=w==='faces'?`${e} edges and ${v} vertices`:w==='edges'?`${f} faces and ${v} vertices`:`${f} faces and ${e} edges`;return Qn({text:`A polyhedron has ${t}. Use <b>V − E + F = 2</b> to find its number of <b>${w}</b>.`,label:w[0].toUpperCase()+w.slice(1)+' =',ans,steps:[`Euler's formula: V − E + F = 2`,`Substitute the numbers and solve.`,`Answer: <b>${ans}</b>`],hint:'Put the numbers you know into V − E + F = 2.'})},
  r=>{const n=r.int(5,12),s=r.int(3,9);return Qn({text:`A regular polygon has perimeter ${n*s} cm and each side is ${s} cm. How many <b>lines of symmetry</b> does it have?`,label:'Lines =',ans:n,steps:[`Number of sides = ${n*s} ÷ ${s} = ${n}`,`A regular polygon has as many lines of symmetry as sides: <b>${n}</b>`],hint:'Find the number of sides first.'})},
  r=>{const n=r.pick([3,4,5,6,8,9,10,12]);return Qn({text:`A regular shape has rotational symmetry of order ${n}. What is the <b>smallest angle</b> you can turn it through so that it looks the same?`,label:'Angle =',unit:'°',ans:360/n,steps:[`One full turn = 360°`,`360° ÷ ${n} = <b>${360/n}°</b>`],hint:'360° divided by the order.'})},
  r=>{return Qn({text:`How many lines of symmetry do a <b>rectangle</b> and a <b>square</b> have <b>altogether</b>?`,label:'Total =',ans:6,steps:[`Rectangle: 2 lines. Square: 4 lines.`,`2 + 4 = <b>6</b>`],hint:'Count each separately.'})},
 ]};

// =====================================================================
// 9  SEQUENCES AND FUNCTIONS
// =====================================================================
const seq=(a,d,n)=>Array.from({length:n},(_,i)=>a+d*i);
T7.t09={
 easy:[
  r=>{const a=r.int(1,20),d=nz(r,-6,9),s=seq(a,d,4);return Qn({text:`Find the next term: <b>${s.map(M).join(', ')}, …</b>`,label:'Next term =',ans:a+4*d,steps:[`The terms ${d>0?'go up':'go down'} by ${Math.abs(d)} each time.`,`${M(s[3])} ${d>0?'+':'−'} ${Math.abs(d)} = <b>${M(a+4*d)}</b>`],hint:'Find the difference between terms.'})},
  r=>{const a=r.int(1,15),d=r.int(2,9),s=seq(a,d,5);return Qn({text:`Find the missing term: <b>${s[0]}, ${s[1]}, ?, ${s[3]}, ${s[4]}</b>`,label:'Missing term =',ans:s[2],steps:[`The common difference is ${d}.`,`${s[1]} + ${d} = <b>${s[2]}</b>`],hint:'Find the common difference.'})},
  r=>{const a=r.int(1,6),d=r.int(2,5);return Qn({text:`A sequence starts at ${a}. The rule is <b>add ${d}</b>. What is the <b>5th term</b>?`,label:'5th term =',ans:a+4*d,steps:[`${seq(a,d,5).join(', ')}`,`5th term = <b>${a+4*d}</b>`],hint:'Write out the terms.'})},
 ],
 medium:[
  r=>{const a=r.int(2,7),b=nz(r,-5,6),n=r.int(8,20);return Qn({text:`The nth term of a sequence is <b>${lin(a,b,'n')}</b>. Find the <b>${ord(n)} term</b>.`,label:`${ord(n)} term =`,ans:a*n+b,steps:[`Replace n with ${n}: ${a} × ${n} ${b>0?'+':'−'} ${Math.abs(b)}`,`= <b>${a*n+b}</b>`],hint:'Substitute n.'})},
  r=>{const a=r.int(1,6),m=r.int(2,3),c=r.int(0,3);let t=a;const terms=[a];for(let i=0;i<4;i++){t=t*m+c;terms.push(t)}return Qn({text:`First term ${a}. Rule: <b>multiply by ${m}${c?' then add '+c:''}</b>. Find the <b>5th term</b>.`,label:'5th term =',ans:terms[4],steps:[`Terms: ${terms.join(', ')}`,`5th term = <b>${terms[4]}</b>`],hint:'Apply the rule 4 times.'})},
  r=>{const a=r.int(3,15),d=r.int(3,9),n=r.int(15,30);return Qn({text:`Find the <b>${ord(n)} term</b> of the sequence <b>${seq(a,d,4).join(', ')}, …</b>`,label:`${ord(n)} term =`,ans:a+(n-1)*d,steps:[`First term ${a}, difference ${d}.`,`${ord(n)} term = ${a} + ${n-1} × ${d} = <b>${a+(n-1)*d}</b>`],hint:'First term + (n − 1) × difference.'})},
  r=>{const a=r.int(1,5),b=r.int(1,5),s=[a,b];for(let i=0;i<4;i++)s.push(s[i]+s[i+1]);return Qn({text:`Each term is the <b>sum of the two terms before it</b>: <b>${s.slice(0,4).join(', ')}, …</b> Find the 6th term.`,label:'6th term =',ans:s[5],steps:[`${s.join(', ')}`,`6th term = <b>${s[5]}</b>`],hint:'Add the previous two terms.'})},
 ],
 hard:[
  r=>{const a=r.int(2,6),b=nz(r,-4,6),n=r.int(8,25),T=a*n+b;return Qn({text:`The nth term of a sequence is <b>${lin(a,b,'n')}</b>. Which <b>term number</b> n has the value <b>${T}</b>?`,label:'n =',ans:n,steps:[`${lin(a,b,'n')} = ${T}`,`${a}n = ${T-b}`,`n = ${T-b} ÷ ${a} = <b>${n}</b>`],hint:'Solve the equation.'})},
  r=>{const a=r.int(3,8),b=nz(r,-3,5),T=r.int(40,90);const n=Math.floor((T-b)/a)+1;return Qn({text:`The nth term is <b>${lin(a,b,'n')}</b>. What is the <b>first term greater than ${T}</b>?`,label:'Term =',ans:a*n+b,steps:[`Solve ${lin(a,b,'n')} > ${T}: n > ${rd((T-b)/a,2)}`,`Smallest whole n is ${n}`,`Term = ${a} × ${n} ${b>=0?'+':'−'} ${Math.abs(b)} = <b>${a*n+b}</b>`],hint:'Solve the inequality for n, then round up.'})},
  r=>{const s=r.int(3,6),d=r.int(2,4),n=r.int(10,20);return Qn({text:`Pattern 1 uses ${s} matchsticks. Each new pattern needs ${d} more matchsticks than the one before. How many matchsticks does <b>pattern ${n}</b> use?`,label:'Matchsticks =',ans:s+(n-1)*d,steps:[`Pattern ${n} = ${s} + ${n-1} × ${d}`,`= <b>${s+(n-1)*d}</b>`],hint:'First term + (n − 1) × difference.'})},
  r=>{const d=r.int(2,9),a=r.int(d+1,d+9);return Qn({text:`The sequence <b>${seq(a,d,4).join(', ')}, …</b> has nth term <b>dn + b</b>. Find the value of <b>b</b>.`,label:'b =',ans:a-d,steps:[`d = ${d} (the common difference).`,`The 1st term: ${d} × 1 + b = ${a}`,`b = ${a} − ${d} = <b>${a-d}</b>`],hint:'Use the first term: d + b = first term.'})},
 ]};

// =====================================================================
// 10  FRACTIONS, DECIMALS AND PERCENTAGES
// =====================================================================
T7.t10={
 easy:[
  r=>{const p=r.pick([10,20,25,50]),a=r.pick([40,60,80,120,200,240]);return Qn({text:`Work out <b>${p}% of ${a}</b>.`,ans:a*p/100,steps:[`${p}% = ${p}/100`,`${a} × ${p} ÷ 100 = <b>${a*p/100}</b>`],hint:'10% = divide by 10; 50% = half; 25% = quarter.'})},
  r=>{const [n,d]=r.pick([[1,2],[1,4],[3,4],[1,5],[2,5],[3,5],[1,10],[7,10],[1,20],[3,20]]);return Qn({text:`Write <b>${fr(n,d)}</b> as a percentage.`,unit:'%',ans:n/d*100,steps:[`${n} ÷ ${d} = ${n/d}`,`${n/d} × 100 = <b>${n/d*100}%</b>`],hint:'Divide, then multiply by 100.'})},
  r=>{const d=r.int(11,99)/100;return Qn({text:`Write <b>${d}</b> as a percentage.`,unit:'%',ans:rd(d*100),steps:[`Multiply by 100: ${d} × 100 = <b>${rd(d*100)}%</b>`],hint:'Multiply by 100.'})},
 ],
 medium:[
  r=>{for(;;){const p=r.pick([5,15,35,45,60,65,75,85]),a=r.pick([20,40,60,80,120,160,240,360]);if(a*p%100===0)return Qn({text:`Work out <b>${p}% of ${a}</b>.`,ans:a*p/100,steps:[`10% of ${a} = ${a/10}`,`${p}% = ${a*p/100}`,`Answer: <b>${a*p/100}</b>`],hint:'Build up from 10% and 5%.'})}},
  r=>{const p=r.pick([10,15,20,25]),a=r.pick([40,60,80,120,200]),up=r.chance(.5);return Qn({text:`${up?'Increase':'Decrease'} <b>£${a}</b> by <b>${p}%</b>.`,label:'Answer = £',ans:up?a*(100+p)/100:a*(100-p)/100,steps:[`${p}% of ${a} = ${a*p/100}`,`${a} ${up?'+':'−'} ${a*p/100} = <b>${up?a*(100+p)/100:a*(100-p)/100}</b>`],hint:'Find the percentage, then add or subtract it.'})},
  r=>{const t=r.pick([20,25,40,50,60,80]),p=r.pick([10,20,25,30,40,50,75]);const part=t*p/100;if(!Number.isInteger(part))return T7.t10.medium[2](r);return Qn({text:`What percentage is <b>${part} out of ${t}</b>?`,unit:'%',ans:p,steps:[`${part} ÷ ${t} = ${part/t}`,`× 100 = <b>${p}%</b>`],hint:'Fraction → decimal → percentage.'})},
 ],
 hard:[
  r=>{const a=r.pick([20,40,50,80,200]),p=r.pick([5,10,15,20,25,30,40]);const b=a*(100+p)/100;return Qn({text:`A price rises from £${a} to £${b}. Work out the <b>percentage increase</b>.`,unit:'%',ans:p,steps:[`Increase = ${b} − ${a} = ${b-a}`,`${b-a} ÷ ${a} × 100 = <b>${p}%</b>`],hint:'Percentage change = change ÷ original × 100.'})},
  r=>{const p=r.pick([10,20,25,30,40,60]),n=r.pick([50,70,100,150,200]);return Qn({text:`<b>${p}%</b> of a number is <b>${n*p/100}</b>. What is the number?`,label:'Number =',ans:n,steps:[`${p}% = ${n*p/100}`,`1% = ${n*p/100} ÷ ${p} = ${n/100}`,`100% = <b>${n}</b>`],hint:'Find 1% first.'})},
  r=>{const [n,d]=r.pick([[7,8],[5,8],[3,8],[1,8],[9,20],[11,40]]);return Qn({text:`Write <b>${fr(n,d)}</b> as a percentage.`,unit:'%',ans:n/d*100,steps:[`${n} ÷ ${d} = ${n/d}`,`× 100 = <b>${n/d*100}%</b>`],hint:'Divide, then × 100.'})},
  r=>{const c=r.pick([20,25,30,40]),b=r.pick([30,40,60,80]);return Qn({text:`In a class of ${c}, ${b}% are boys. How many are <b>girls</b>?`,label:'Girls =',ans:c*(100-b)/100,steps:[`Girls = ${100-b}%`,`${c} × ${100-b} ÷ 100 = <b>${c*(100-b)/100}</b>`],hint:'100% − boys%.'})},
 ]};

// =====================================================================
// 11  GRAPHS AND FUNCTIONS
// =====================================================================
T7.t11={
 easy:[
  r=>{const a=r.int(2,6),b=nz(r,-5,8),x=r.int(2,9);return Qn({text:`A function machine: <b>input x → ×${a} → ${b>0?'+':'−'}${Math.abs(b)} → output</b>. What is the output when x = ${x}?`,label:'Output =',ans:a*x+b,steps:[`${x} × ${a} = ${a*x}`,`${a*x} ${b>0?'+':'−'} ${Math.abs(b)} = <b>${a*x+b}</b>`],hint:'Follow the machine from left to right.'})},
  r=>{const m=r.int(1,3),c=r.int(-3,3),x=r.int(-3,3);if(Math.abs(m*x+c)>5)return T7.t11.easy[1](r);return Qn({text:`The graph shows the line <b>y = ${lin(m,c)}</b>. Read off the value of <b>y</b> when <b>x = ${x}</b>.`,svg:gridSvg({fns:[{m,c}],pts:[{x,y:m*x+c,label:`x=${x}`,color:'#d9480f'}]}),label:'y =',ans:m*x+c,steps:[`Go to x = ${x} on the horizontal axis, then up/down to the line.`,`y = ${m} × ${sg(x)} ${c>=0?'+':'−'} ${Math.abs(c)} = <b>${m*x+c}</b>`],hint:'Substitute x into the equation.'})},
  r=>{const m=r.int(2,5),c=r.int(1,6),x=r.int(1,8);return Qn({text:`The point (${x}, y) lies on the line <b>y = ${m}x + ${c}</b>. Find y.`,label:'y =',ans:m*x+c,steps:[`y = ${m} × ${x} + ${c}`,`y = <b>${m*x+c}</b>`],hint:'Substitute the x-value.'})},
 ],
 medium:[
  r=>{const m=nz(r,-4,5),c=nz(r,-6,6),x=r.int(-5,-1);return Qn({text:`Find the value of <b>y</b> when <b>x = ${x}</b> for the line <b>y = ${lin(m,c)}</b>.`,label:'y =',ans:m*x+c,steps:[`y = ${m} × ${sg(x)} ${c>0?'+':'−'} ${Math.abs(c)}`,`y = <b>${m*x+c}</b>`],hint:'Be careful with negative numbers.'})},
  r=>{const m=r.int(2,5),c=nz(r,-8,8),x=r.int(-3,8),y=m*x+c;return Qn({text:`For the line <b>y = ${lin(m,c)}</b>, find the value of <b>x</b> when <b>y = ${y}</b>.`,label:'x =',ans:x,steps:[`${lin(m,c)} = ${y}`,`${m}x = ${y-c}`,`x = ${y-c} ÷ ${m} = <b>${x}</b>`],hint:'Put y into the equation and solve for x.'})},
  r=>{const m=r.int(2,4),x=r.int(1,5),c=nz(r,-6,6),y=m*x+c;return Qn({text:`The line <b>y = ${m}x + c</b> passes through the point <b>(${x}, ${M(y)})</b>. Find <b>c</b>.`,label:'c =',ans:c,steps:[`Substitute x = ${x}, y = ${M(y)}: ${M(y)} = ${m} × ${x} + c`,`${M(y)} = ${m*x} + c`,`c = ${M(y)} − ${m*x} = <b>${M(c)}</b>`],hint:'Substitute the point into the equation.'})},
 ],
 hard:[
  r=>{const a=r.int(1,4),b=nz(r,-5,5),k=r.int(-4,6);const c=r.int(1,4);return Qn({text:`The point <b>(k, ${a*k+b})</b> lies on the line <b>y = ${lin(a,b)}</b>. Find <b>k</b>.`,label:'k =',ans:k,steps:[`${lin(a,b,'k')} = ${a*k+b}`,`${a}k = ${a*k}`,`k = <b>${k}</b>`],hint:'Substitute the coordinates.'})},
  r=>{const x=r.int(-4,8),m1=r.int(1,3),m2=m1+r.int(1,3),c1=nz(r,-5,5),c2=c1+(m1-m2)*x;return Qn({text:`Find the <b>x-coordinate</b> where the lines <b>y = ${lin(m1,c1)}</b> and <b>y = ${lin(m2,c2)}</b> cross.`,label:'x =',ans:x,steps:[`At the crossing point the y-values are equal: ${lin(m1,c1)} = ${lin(m2,c2)}`,`${m2-m1}x = ${c1-c2}`,`x = <b>${x}</b>`],hint:'Set the two expressions equal.'})},
  r=>{const x1=r.int(-3,2),y1=r.int(-3,3),dx=r.int(1,4),m=r.int(-3,3)||2,x2=x1+dx,y2=y1+m*dx;return Qn({text:`Find the <b>gradient</b> of the line through the points <b>(${x1}, ${y1})</b> and <b>(${x2}, ${y2})</b>.`,label:'Gradient =',ans:m,steps:[`Gradient = change in y ÷ change in x`,`(${y2} − ${sg(y1)}) ÷ (${x2} − ${sg(x1)}) = ${y2-y1} ÷ ${dx}`,`Gradient = <b>${m}</b>`],hint:'Rise over run.'})},
  r=>{const x1=r.int(-6,0)*2,y1=r.int(-4,4)*2,x2=x1+r.int(1,6)*2,y2=y1+r.int(-4,4)*2;return Qn({text:`Find the <b>x-coordinate of the midpoint</b> of the line joining <b>(${M(x1)}, ${M(y1)})</b> and <b>(${M(x2)}, ${M(y2)})</b>.`,label:'x =',ans:(x1+x2)/2,steps:[`Midpoint x = (${M(x1)} + ${sg(x2)}) ÷ 2`,`= <b>${M((x1+x2)/2)}</b>`],hint:'Add the x-coordinates and halve.'})},
 ]};

// =====================================================================
// 12  RATIO AND PROPORTION
// =====================================================================
T7.t12={
 easy:[
  r=>{const a=r.int(2,5),b=r.int(a+1,7),k=r.int(2,8);return Qn({text:`The ratio of boys to girls in a club is <b>${a} : ${b}</b>. There are ${a*k} boys. How many <b>girls</b> are there?`,label:'Girls =',ans:b*k,steps:[`${a} parts = ${a*k} boys, so 1 part = ${k}`,`Girls = ${b} × ${k} = <b>${b*k}</b>`],hint:'Find the value of one part.'})},
  r=>{const n=r.pick([4,5,8,10]),each=r.int(12,95)/20,tot=rd(each*n);return Qn({text:`${n} pens cost £${money(tot)}. How much does <b>1 pen</b> cost?`,label:'1 pen = £',ans:each,steps:[`£${money(tot)} ÷ ${n} = <b>£${money(each)}</b>`],hint:'Divide the cost by the number of pens.'})},
  r=>{const a=r.int(1,4),b=r.int(1,5),k=r.int(3,12),T=(a+b)*k;return Qn({text:`Share <b>£${T}</b> in the ratio <b>${a} : ${b}</b>. How much is the <b>second</b> share?`,label:'Share = £',ans:b*k,steps:[`Total parts = ${a} + ${b} = ${a+b}`,`1 part = ${T} ÷ ${a+b} = ${k}`,`Second share = ${b} × ${k} = <b>${b*k}</b>`],hint:'Add the parts, divide, then multiply.'})},
 ],
 medium:[
  r=>{const a=r.int(2,5),b=r.int(1,4),c=r.int(1,3),k=r.int(2,9),T=(a+b+c)*k;return Qn({text:`Red, blue and green counters are in the ratio <b>${a} : ${b} : ${c}</b>. There are ${T} counters. How many are <b>blue</b>?`,label:'Blue =',ans:b*k,steps:[`Parts: ${a} + ${b} + ${c} = ${a+b+c}`,`1 part = ${T} ÷ ${a+b+c} = ${k}`,`Blue = ${b} × ${k} = <b>${b*k}</b>`],hint:'Add up all the parts first.'})},
  r=>{const p=r.pick([4,6,8]),f=r.pick([200,300,250,150]),n=r.pick([2,3,5,10,12]);const k=f/p*n;return Qn({text:`A recipe for ${p} people uses ${f} g of flour. How much flour is needed for <b>${n} people</b>?`,label:'Flour =',unit:' g',ans:k,steps:[`For 1 person: ${f} ÷ ${p} = ${rd(f/p,3)} g`,`For ${n}: ${rd(f/p,3)} × ${n} = <b>${rd(k)}</b> g`],hint:'Find the amount for one person.'})},
  r=>{const [a,b]=[r.int(3,6),r.int(2,3)],k=r.int(4,15);return Qn({text:`Yellow and blue paint are mixed in the ratio <b>${a} : ${b}</b>. You use <b>${a*k} litres</b> of yellow. How many litres of paint are there <b>in total</b>?`,label:'Total =',unit:' litres',ans:(a+b)*k,steps:[`1 part = ${a*k} ÷ ${a} = ${k} litres`,`Total parts = ${a+b}; total = ${a+b} × ${k} = <b>${(a+b)*k}</b>`],hint:'Find one part first.'})},
 ],
 hard:[
  r=>{const a=r.int(2,5),b=a+r.int(1,3),k=r.int(3,12);return Qn({text:`Two sisters share some money in the ratio <b>${a} : ${b}</b>. The difference between their shares is <b>£${(b-a)*k}</b>. How much money is shared <b>altogether</b>?`,label:'Total = £',ans:(a+b)*k,steps:[`Difference = ${b-a} parts = £${(b-a)*k}, so 1 part = £${k}`,`Total = ${a+b} parts = ${a+b} × ${k} = <b>£${(a+b)*k}</b>`],hint:'The difference is a number of parts.'})},
  r=>{const w=r.pick([4,6,8,12]),d=r.pick([6,9,12,18]),w2=r.pick([2,3,24,36].filter(x=>(w*d)%x===0));return Qn({text:`${w} workers take ${d} days to build a wall. How many days would <b>${w2} workers</b> take (working at the same rate)?`,label:'Days =',ans:w*d/w2,steps:[`Total work = ${w} × ${d} = ${w*d} worker-days`,`${w*d} ÷ ${w2} = <b>${w*d/w2}</b> days`],hint:'More workers → fewer days.'})},
  r=>{const rate=r.pick([1.25,1.5,2,1.2,0.8]),gbp=r.pick([20,40,60,80,100]);return Qn({text:`£1 = ${rate} euros. Convert <b>£${gbp}</b> to euros.`,label:'Euros =',ans:rd(gbp*rate),steps:[`${gbp} × ${rate} = <b>${rd(gbp*rate)}</b> euros`],hint:'Multiply by the rate.'})},
  r=>{const n1=r.pick([4,5,6]),p1=r.pick([3,4,5]),n2=r.pick([8,10,12]);const per1=p1/n1;const p2=Math.round(per1*n2*r.pick([.9,1.1])*100)/100;return Qn({text:`Pack A: ${n1} bottles for £${money(p1)}. Pack B: ${n2} bottles for £${money(p2)}. How much cheaper is <b>one bottle</b> in the cheaper pack, in <b>pence</b>? (Round to the nearest penny; enter a positive number.)`,label:'Difference =',unit:' p',ans:rd(Math.abs(per1-p2/n2)*100),tol:.6,steps:[`Pack A: ${p1} ÷ ${n1} = £${rd(per1,3)} each`,`Pack B: ${money(p2)} ÷ ${n2} = £${rd(p2/n2,3)} each`,`Difference ≈ <b>${rd(Math.abs(per1-p2/n2)*100,1)} p</b>`],hint:'Compare the cost of one bottle.'})},
 ]};

// =====================================================================
// 13  PROBABILITY
// =====================================================================
T7.t13={
 easy:[
  r=>{const t=r.pick([4,5,8,10]),red=r.int(1,t-1),blue=t-red;return Qn(Object.assign(fracAns(red,t),{text:`A bag contains ${red} red and ${blue} blue counters. One is picked at random. What is the <b>probability it is red</b>?`,svg:bagSvg({red,blue}),steps:[`P(red) = number of red ÷ total`,`${red} ÷ ${t} = <b>${Fr(red,t).join('/')}</b> = ${rd(red/t,3)}`],hint:'Favourable ÷ total.'}))},
  r=>{const t=r.pick([5,10,20]),k=r.int(1,t-1);return Qn({text:`The probability that it rains tomorrow is <b>${rd(k/t)}</b>. What is the probability that it <b>does not rain</b>?`,label:'P(no rain) =',ans:rd(1-k/t),steps:[`P(not) = 1 − P(rain)`,`1 − ${rd(k/t)} = <b>${rd(1-k/t)}</b>`],hint:'The probabilities add up to 1.'})},
  r=>{const t=r.pick([4,8,10]),a=r.int(1,3),b=r.int(1,3),g=t-a-b;if(g<1)return T7.t13.easy[2](r);return Qn(Object.assign(fracAns(g,t),{text:`A bag has ${a} red, ${b} blue and ${g} green counters. Find the <b>probability of picking green</b>.`,svg:bagSvg({red:a,blue:b,green:g}),steps:[`Total = ${t}`,`P(green) = <b>${Fr(g,t).join('/')}</b>`],hint:'Count all the counters first.'}))},
 ],
 medium:[
  r=>{const p=r.pick([.1,.2,.25,.3,.4,.5]),n=r.pick([100,150,200,300,400]);return Qn({text:`The probability of a biased coin landing heads is ${p}. It is flipped <b>${n} times</b>. How many heads would you <b>expect</b>?`,label:'Heads =',ans:p*n,steps:[`Expected = probability × number of trials`,`${p} × ${n} = <b>${rd(p*n)}</b>`],hint:'Probability × number of trials.'})},
  r=>{const s=r.int(2,12),ways=6-Math.abs(s-7);return Qn({text:`Two fair dice are rolled and the scores are added. In how many ways can you get a total of <b>${s}</b>?`,label:'Ways =',ans:ways,steps:[`List the pairs that add to ${s}.`,`There are <b>${ways}</b> ways`],hint:'List the pairs systematically.'})},
  r=>{const n=r.pick([20,25,40,50]),k=r.int(2,n/2|0);return Qn(Object.assign(fracAns(k,n),{text:`A spinner is spun ${n} times and lands on blue ${k} times. What is the <b>experimental probability</b> of blue?`,steps:[`Relative frequency = ${k} ÷ ${n}`,`= <b>${Fr(k,n).join('/')}</b> = ${rd(k/n,3)}`],hint:'Frequency ÷ number of trials.'}))},
 ],
 hard:[
  r=>{const p1=r.pick([.2,.25,.3,.35]),p2=r.pick([.3,.4,.45]),n=r.pick([20,40,60,80,100]);const g=rd(1-p1-p2);return Qn({text:`A bag has red, blue and green counters. P(red) = ${p1} and P(blue) = ${p2}. There are ${n} counters in total. How many are <b>green</b>?`,label:'Green =',ans:rd(g*n),steps:[`P(green) = 1 − ${p1} − ${p2} = ${g}`,`${g} × ${n} = <b>${rd(g*n)}</b>`],hint:'Probabilities add up to 1.'})},
  r=>{const q=r.pick([3,4,5]),red=r.int(2,6),T=q*red;return Qn({text:`A bag has <b>${red} red</b> counters and some blue counters only. The probability of picking red is <b>1/${q}</b>. How many <b>blue</b> counters are there?`,label:'Blue =',ans:T-red,steps:[`Total = ${red} × ${q} = ${T}`,`Blue = ${T} − ${red} = <b>${T-red}</b>`],hint:'If P(red) = 1/q, red is 1 part of q.'})},
  r=>{return Qn({text:`Three fair coins are flipped. How many of the <b>8 possible outcomes</b> have <b>exactly 2 heads</b>?`,label:'Outcomes =',ans:3,steps:[`HHT, HTH, THH`,`<b>3</b> outcomes`],hint:'List them all.'})},
  r=>{const a=r.pick([1,2,3]),p=r.pick([.2,.3,.1]),q=r.pick([.15,.25,.35]),n=r.pick([200,400,500]);return Qn({text:`P(a train is late) = ${p} and P(a train is cancelled) = ${q}. Out of ${n} trains, how many would you expect to be <b>on time</b>?`,label:'On time =',ans:rd((1-p-q)*n),steps:[`P(on time) = 1 − ${p} − ${q} = ${rd(1-p-q)}`,`${rd(1-p-q)} × ${n} = <b>${rd((1-p-q)*n)}</b>`],hint:'Find P(on time) first.'})},
 ]};

// =====================================================================
// 14  POSITION AND TRANSFORMATION
// =====================================================================
T7.t14={
 easy:[
  r=>{const x=r.int(-3,3),y=r.int(-3,3),dx=nz(r,-3,3),dy=nz(r,-3,3),xs=r.chance(.5);return Qn({text:`Point A is at (${M(x)}, ${M(y)}). It is translated <b>${Math.abs(dx)} ${dx>0?'right':'left'}</b> and <b>${Math.abs(dy)} ${dy>0?'up':'down'}</b>. What is the new <b>${xs?'x':'y'}-coordinate</b>?`,svg:gridSvg({pts:[{x,y,label:'A',color:'#4f46e5'}]}),label:xs?'x =':'y =',ans:xs?x+dx:y+dy,steps:[xs?`Right/left changes x: ${x} + ${sg(dx)} = <b>${x+dx}</b>`:`Up/down changes y: ${y} + ${sg(dy)} = <b>${y+dy}</b>`],hint:'Left/right changes x. Up/down changes y.'})},
  r=>{const x=nz(r,-5,5),y=nz(r,-5,5);return Qn({text:`Point A (${M(x)}, ${M(y)}) is reflected in the <b>y-axis</b>. What is the new <b>x-coordinate</b>?`,svg:gridSvg({pts:[{x,y,label:'A',color:'#4f46e5'}]}),label:'x =',ans:-x,steps:[`Reflecting in the y-axis changes the sign of x.`,`New x = <b>${M(-x)}</b>`],hint:'The y-axis is the vertical axis.'})},
  r=>{const x=nz(r,-5,5),y=nz(r,-5,5);return Qn({text:`Point A (${M(x)}, ${M(y)}) is reflected in the <b>x-axis</b>. What is the new <b>y-coordinate</b>?`,svg:gridSvg({pts:[{x,y,label:'A',color:'#4f46e5'}]}),label:'y =',ans:-y,steps:[`Reflecting in the x-axis changes the sign of y.`,`New y = <b>${M(-y)}</b>`],hint:'The x-axis is the horizontal axis.'})},
 ],
 medium:[
  r=>{const x=nz(r,-6,6),y=nz(r,-6,6),xs=r.chance(.5);return Qn({text:`The point (${M(x)}, ${M(y)}) is rotated <b>180°</b> about the origin. What is the new <b>${xs?'x':'y'}-coordinate</b>?`,label:xs?'x =':'y =',ans:xs?-x:-y,steps:[`A 180° turn about the origin changes both signs: (${M(-x)}, ${M(-y)})`,`Answer: <b>${xs?M(-x):M(-y)}</b>`],hint:'Both coordinates change sign.'})},
  r=>{const a=r.pick([2,3,4,5]),sc=r.pick([20,25,50,100,200]),d=rd(r.int(15,60)/10);return Qn({text:`On a map the scale is <b>1 : ${pr(sc*1000)}</b> (1 cm represents ${sc/100} km). Two towns are <b>${d} cm</b> apart on the map. How far apart are they in real life in <b>km</b>?`,label:'Distance =',unit:' km',ans:rd(d*sc/100),steps:[`1 cm = ${sc/100} km`,`${d} × ${sc/100} = <b>${rd(d*sc/100)}</b> km`],hint:'Multiply the map distance by the scale.'})},
  r=>{const k=r.int(2,5),l=r.int(2,9);return Qn({text:`A rectangle with length ${l} cm is <b>enlarged</b>. The enlarged length is ${l*k} cm. What is the <b>scale factor</b>?`,label:'Scale factor =',ans:k,steps:[`Scale factor = new ÷ old = ${l*k} ÷ ${l}`,`= <b>${k}</b>`],hint:'New length ÷ old length.'})},
  r=>{const sc=r.pick([20,50,100]),d=r.int(3,12);return Qn({text:`A plan has scale <b>1 : ${sc}</b>. A room is <b>${d} cm</b> long on the plan. How long is the real room in <b>metres</b>?`,label:'Length =',unit:' m',ans:d*sc/100,steps:[`Real length = ${d} × ${sc} = ${d*sc} cm`,`${d*sc} cm = <b>${d*sc/100}</b> m`],hint:'Multiply by the scale, then change cm to m.'})},
 ],
 hard:[
  r=>{const x=nz(r,-4,4),y=nz(r,-4,4),k=r.int(2,3),xs=r.chance(.5);return Qn({text:`The point (${M(x)}, ${M(y)}) is <b>enlarged</b> by scale factor <b>${k}</b> with centre the origin. What is the new <b>${xs?'x':'y'}-coordinate</b>?`,label:xs?'x =':'y =',ans:k*(xs?x:y),steps:[`Multiply both coordinates by ${k}: (${M(k*x)}, ${M(k*y)})`,`Answer: <b>${M(k*(xs?x:y))}</b>`],hint:'Multiply the coordinates by the scale factor.'})},
  r=>{const a=nz(r,-4,6),v=r.int(1,4),k=r.int(-4,4);return Qn({text:`The point A (${M(a)}, ${M(v)}) is reflected in the line <b>x = ${k}</b>. What is the new <b>x-coordinate</b>?`,svg:gridSvg({pts:[{x:a,y:v,label:'A',color:'#4f46e5'}],vlines:[{x:k,label:'x='+k}]}),label:'x =',ans:2*k-a,steps:[`A is ${Math.abs(a-k)} ${a>k?'to the right':'to the left'} of the line.`,`The image is ${Math.abs(a-k)} on the other side: x = 2×${sg(k)} − ${sg(a)} = <b>${M(2*k-a)}</b>`],hint:'The image is the same distance from the mirror line, on the other side.'})},
  r=>{const x=nz(r,-4,4),y=nz(r,-4,4),dx=nz(r,-4,4),dy=nz(r,-4,4);return Qn({text:`The point (${M(x)}, ${M(y)}) is first <b>reflected in the x-axis</b>, then <b>translated ${Math.abs(dx)} ${dx>0?'right':'left'} and ${Math.abs(dy)} ${dy>0?'up':'down'}</b>. What is the final <b>y-coordinate</b>?`,label:'y =',ans:-y+dy,steps:[`Reflect in the x-axis: (${M(x)}, ${M(-y)})`,`Translate: y = ${M(-y)} + ${sg(dy)} = <b>${M(-y+dy)}</b>`],hint:'Do the transformations in order.'})},
  r=>{const a=r.int(2,9),k=r.int(2,4);return Qn({text:`A shape has an area of ${a} cm². It is enlarged by scale factor <b>${k}</b>. What is the area of the <b>enlarged shape</b>?`,label:'Area =',unit:' cm²',ans:a*k*k,steps:[`Lengths × ${k}, so areas × ${k}² = ${k*k}`,`${a} × ${k*k} = <b>${a*k*k}</b> cm²`],hint:'Area scale factor = (length scale factor)².'})},
 ]};

// =====================================================================
// 15  SHAPES, AREA AND VOLUME
// =====================================================================
T7.t15={
 easy:[
  r=>{const w=r.int(3,14),h=r.int(2,10);return Qn({text:`Find the <b>area</b> of the rectangle.`,svg:rectSvg(w,h),label:'Area =',unit:' cm²',ans:w*h,steps:[`Area = length × width`,`${w} × ${h} = <b>${w*h}</b> cm²`],hint:'Length × width.'})},
  r=>{const w=r.int(3,14),h=r.int(2,10);return Qn({text:`Find the <b>perimeter</b> of the rectangle.`,svg:rectSvg(w,h),label:'Perimeter =',unit:' cm',ans:2*(w+h),steps:[`Perimeter = 2 × (${w} + ${h})`,`= <b>${2*(w+h)}</b> cm`],hint:'Add all four sides.'})},
  r=>{const b=r.int(3,8)*2,h=r.int(3,9);return Qn({text:`Find the <b>area</b> of the triangle.`,svg:triSvg(b,h),label:'Area =',unit:' cm²',ans:b*h/2,steps:[`Area = ½ × base × height`,`½ × ${b} × ${h} = <b>${b*h/2}</b> cm²`],hint:'Half base × height.'})},
 ],
 medium:[
  r=>{const b=r.int(4,12),h=r.int(3,9);return Qn({text:`A parallelogram has base ${b} cm and perpendicular height ${h} cm. Find its <b>area</b>.`,label:'Area =',unit:' cm²',ans:b*h,steps:[`Area = base × perpendicular height`,`${b} × ${h} = <b>${b*h}</b> cm²`],hint:'Base × perpendicular height.'})},
  r=>{const a=r.int(8,14),b=r.int(6,10),c=r.int(2,a-3),d=r.int(2,b-2);return Qn({text:`Find the <b>area</b> of this L-shape.`,svg:lShapeSvg(a,b,c,d),label:'Area =',unit:' cm²',ans:a*b-c*d,steps:[`Big rectangle: ${a} × ${b} = ${a*b}`,`Cut-out: ${c} × ${d} = ${c*d}`,`Area = ${a*b} − ${c*d} = <b>${a*b-c*d}</b> cm²`],hint:'Whole rectangle minus the missing corner.'})},
  r=>{const l=r.pick([100,150,200,250,400,500]),w=r.pick([40,50,80,100,200]);return Qn({text:`A field is ${l} m long and ${w} m wide. Find its area in <b>hectares</b>. (1 hectare = 10 000 m²)`,label:'Area =',unit:' ha',ans:l*w/10000,steps:[`Area = ${l} × ${w} = ${pr(l*w)} m²`,`${pr(l*w)} ÷ 10 000 = <b>${l*w/10000}</b> ha`],hint:'Divide m² by 10 000.'})},
  r=>{const l=r.int(3,9),w=r.int(2,6),h=r.int(2,8);return Qn({text:`Find the <b>volume</b> of a cuboid ${l} cm by ${w} cm by ${h} cm.`,label:'Volume =',unit:' cm³',ans:l*w*h,steps:[`Volume = l × w × h`,`${l} × ${w} × ${h} = <b>${l*w*h}</b> cm³`],hint:'Multiply the three lengths.'})},
 ],
 hard:[
  r=>{const l=r.int(3,9),w=r.int(2,6),h=r.int(2,8);return Qn({text:`Find the <b>surface area</b> of a cuboid ${l} cm by ${w} cm by ${h} cm.`,label:'Surface area =',unit:' cm²',ans:2*(l*w+l*h+w*h),steps:[`Three pairs of faces: ${l}×${w}, ${l}×${h}, ${w}×${h}`,`2 × (${l*w} + ${l*h} + ${w*h}) = <b>${2*(l*w+l*h+w*h)}</b> cm²`],hint:'Find the area of each different face; there are two of each.'})},
  r=>{const b=r.int(4,10)*2,h=r.int(3,9),A=b*h/2;return Qn({text:`A triangle has area ${A} cm² and base ${b} cm. Find its <b>perpendicular height</b>.`,label:'Height =',unit:' cm',ans:h,steps:[`½ × ${b} × h = ${A}`,`${b/2} × h = ${A}`,`h = ${A} ÷ ${b/2} = <b>${h}</b> cm`],hint:'Area = ½ × base × height. Work backwards.'})},
  r=>{const l=r.int(8,14),w=r.int(3,7);return Qn({text:`A rectangle has perimeter ${2*(l+w)} cm and length ${l} cm. Find its <b>area</b>.`,label:'Area =',unit:' cm²',ans:l*w,steps:[`l + w = ${l+w}, so w = ${l+w} − ${l} = ${w}`,`Area = ${l} × ${w} = <b>${l*w}</b> cm²`],hint:'Find the width first.'})},
  r=>{const l=r.int(3,8),w=r.int(2,6),h=r.int(2,8),V=l*w*h;return Qn({text:`A cuboid has volume ${V} cm³, length ${l} cm and width ${w} cm. Find its <b>height</b>.`,label:'Height =',unit:' cm',ans:h,steps:[`${l} × ${w} × h = ${V}`,`${l*w} × h = ${V}`,`h = ${V} ÷ ${l*w} = <b>${h}</b> cm`],hint:'Volume = l × w × h.'})},
 ]};

// =====================================================================
// 16  INTERPRETING RESULTS
// =====================================================================
const CATS=['Pizza','Pasta','Salad','Soup','Rice','Curry'];
T7.t16={
 easy:[
  r=>{const lab=CATS.slice(0,4),v=lab.map(()=>r.int(2,9)*2),i=r.int(0,3);return Qn({text:`The bar chart shows favourite foods. How many students chose <b>${lab[i]}</b>?`,svg:barSvg(lab,v,{max:20}),label:'Students =',ans:v[i],steps:[`Read the height of the ${lab[i]} bar.`,`Answer: <b>${v[i]}</b>`],hint:'Read across from the top of the bar.'})},
  r=>{const lab=CATS.slice(0,4),v=lab.map(()=>r.int(2,9)*2);return Qn({text:`The bar chart shows favourite foods. How many students were asked <b>altogether</b>?`,svg:barSvg(lab,v,{max:20}),label:'Total =',ans:v.reduce((a,b)=>a+b,0),steps:[`${v.join(' + ')}`,`Total = <b>${v.reduce((a,b)=>a+b,0)}</b>`],hint:'Add all the bars.'})},
  r=>{const lab=CATS.slice(0,4),v=r.shuffle([4,6,10,14]),i=v.indexOf(14),j=v.indexOf(4);return Qn({text:`How many <b>more</b> students chose ${lab[i]} than ${lab[j]}?`,svg:barSvg(lab,v,{max:15}),label:'Difference =',ans:10,steps:[`${lab[i]}: 14, ${lab[j]}: 4`,`14 − 4 = <b>10</b>`],hint:'Read both bars and subtract.'})},
 ],
 medium:[
  r=>{const T=r.pick([30,40,60,90,120,180]),f=r.pick([5,10,15,20,30]);if(f>=T)return T7.t16.medium[0](r);return Qn({text:`${f} of ${T} students chose football. On a <b>pie chart</b>, what angle represents football?`,label:'Angle =',unit:'°',ans:rd(f/T*360),steps:[`Fraction = ${f}/${T}`,`Angle = ${f} ÷ ${T} × 360 = <b>${rd(f/T*360)}°</b>`],hint:'Fraction of 360°.'})},
  r=>{const days=['Mon','Tue','Wed','Thu','Fri'],v=days.map(()=>r.int(8,22)),i=r.int(0,3);return Qn({text:`The line graph shows the temperature (°C). By how many degrees did it <b>rise</b> from ${days[i]} to ${days[i+1]}? (Enter a negative number if it fell.)`,svg:lineChartSvg(days,v,{max:25}),label:'Change =',unit:'°C',ans:v[i+1]-v[i],steps:[`${days[i]}: ${v[i]}°C, ${days[i+1]}: ${v[i+1]}°C`,`${v[i+1]} − ${v[i]} = <b>${v[i+1]-v[i]}</b>`],hint:'Later − earlier.'})},
  r=>{const T=r.pick([20,25,40,50]),p=r.pick([10,20,25,40]),a=T*p/100;if(!Number.isInteger(a))return T7.t16.medium[2](r);return Qn({text:`A pie chart sector for tennis is <b>${rd(p*3.6)}°</b>. ${T} people were surveyed. How many chose tennis?`,label:'People =',ans:a,steps:[`${rd(p*3.6)}° out of 360° = ${p}%`,`${p}% of ${T} = <b>${a}</b>`],hint:'Angle ÷ 360 × total.'})},
 ],
 hard:[
  r=>{const lab=CATS.slice(0,4),v=r.pick([[5,10,15,20],[10,10,20,10],[4,8,12,16],[2,6,12,20]]),i=r.int(0,3),T=v.reduce((a,b)=>a+b,0);return Qn({text:`The bar chart shows favourite foods. What <b>percentage</b> of students chose <b>${lab[i]}</b>?`,svg:barSvg(lab,v,{max:20}),label:'Percentage =',unit:'%',ans:rd(v[i]/T*100),steps:[`Total = ${v.join(' + ')} = ${T}`,`${v[i]} ÷ ${T} × 100 = <b>${rd(v[i]/T*100)}%</b>`],hint:'Part ÷ total × 100.'})},
  r=>{const T=r.pick([120,200,240,360]),a=r.pick([30,45,54,60,72,90]);const n=T*a/360;if(!Number.isInteger(n))return T7.t16.hard[1](r);return Qn({text:`A pie chart shows how ${T} people travel to work. The "bus" sector has an angle of <b>${a}°</b>. How many people go by bus?`,label:'People =',ans:n,steps:[`${a}/360 of ${T}`,`${T} × ${a} ÷ 360 = <b>${n}</b>`],hint:'Fraction of the circle × total.'})},
  r=>{const m1=r.int(5,9),n1=r.int(4,8),m2=r.int(5,9);const n2=r.pick([5,6,10]);const s1=m1*n1,s2=m2*n2;return Qn({text:`Group A: ${n1} students with a mean score of ${m1}. Group B: ${n2} students with a mean score of ${m2}. What is the <b>mean score of all the students</b> together? (1 decimal place)`,label:'Mean =',tol:.06,ans:rd((s1+s2)/(n1+n2),1),steps:[`Total A = ${n1} × ${m1} = ${s1}`,`Total B = ${n2} × ${m2} = ${s2}`,`Mean = (${s1} + ${s2}) ÷ ${n1+n2} = <b>${rd((s1+s2)/(n1+n2),1)}</b>`],hint:'Find the total score of each group first.'})},
  r=>{const days=['Mon','Tue','Wed','Thu','Fri'],v=days.map(()=>r.int(6,24)),mx=Math.max(...v),mn=Math.min(...v);return Qn({text:`The line graph shows the temperature (°C) each day. What is the <b>range</b> of the temperatures?`,svg:lineChartSvg(days,v,{max:25}),label:'Range =',unit:'°C',ans:mx-mn,steps:[`Highest = ${mx}, lowest = ${mn}`,`Range = ${mx} − ${mn} = <b>${mx-mn}</b>`],hint:'Highest − lowest.'})},
 ]};

// =====================================================================
//  TOPIC METADATA (lessons, vocab, misconceptions…)
// =====================================================================
const TOPICS=[
{id:'t01',u:1,term:1,icon:'➕',title:'Integers',strand:'Number',color:'#2563eb',
 obj:'Add, subtract, multiply and divide positive and negative whole numbers; find LCM, HCF, square and cube roots.',
 ideas:['On a number line, adding moves right and adding a negative moves left.','Subtracting a negative = adding a positive: 5 − (−3) = 8.','Same signs → positive answer; different signs → negative answer (× and ÷).','LCM = smallest shared multiple; HCF = biggest shared factor.'],
 vocab:['integer — целое число','inverse — противоположный','multiple — кратное','factor — делитель','square root — квадратный корень'],
 mistake:{wrong:['−4 − (−6)','= −4 − 6','= −10'],why:'The student ignored the double negative.',fix:'−4 − (−6) = −4 + 6 = <b>2</b>'},
 ican:['add and subtract negative numbers','multiply and divide integers','find LCM and HCF','use square and cube roots'],
 challenge:'Make up a temperature puzzle with an answer of −7°C and swap it with a partner.',widget:'integers'},
{id:'t02',u:2,term:1,icon:'🔤',title:'Expressions, formulae & equations',strand:'Algebra',color:'#7c3aed',
 obj:'Use letters for numbers: substitute into expressions and formulae, expand brackets and solve simple equations.',
 ideas:['An expression has no “=”; an equation does.','Substitute: replace the letter with the number, then follow BIDMAS.','Expand: 3(x + 4) = 3x + 12 (multiply every term in the bracket).','Solve by doing the same to both sides (keep the balance).'],
 vocab:['expression — выражение','equation — уравнение','formula — формула','substitute — подставить','expand — раскрыть скобки','inequality — неравенство'],
 mistake:{wrong:['3(x + 4) = 21','3x + 4 = 21','3x = 17'],why:'Only the first term in the bracket was multiplied.',fix:'3(x + 4) = 3x + 12, so 3x = 9 and x = <b>3</b>'},
 ican:['substitute values into expressions','expand a single bracket','solve one- and two-step equations','solve simple inequalities'],
 challenge:'Write an equation whose solution is x = 4 that has x on both sides.',widget:'balance'},
{id:'t03',u:3,term:1,icon:'🔢',title:'Place value & rounding',strand:'Number',color:'#0891b2',
 obj:'Multiply and divide by powers of 10 and round numbers to a given place or number of decimal places.',
 ideas:['Each column is 10 times bigger than the one to its right.','× 10 moves digits left; ÷ 10 moves digits right.','Rounding: look at the next digit — 5 or more rounds up.','Estimate by rounding numbers first.'],
 vocab:['place value — разряд','round — округлять','decimal place — знак после запятой','estimate — оценка','power of 10 — степень десяти'],
 mistake:{wrong:['Round 3.46 to 1 dp','Look at the 4 → round down','= 3.4'],why:'The student looked at the wrong digit.',fix:'The 2nd decimal digit is 6, so round up: <b>3.5</b>'},
 ican:['multiply and divide by 10, 100, 1000','round to the nearest 10, 100, 1000','round to decimal places','estimate calculations'],
 challenge:'Find three different numbers that round to 3.7 to 1 decimal place.',widget:'place'},
{id:'t04',u:4,term:1,icon:'🔟',title:'Decimals',strand:'Number',color:'#059669',
 obj:'Order, add, subtract, multiply and divide decimals.',
 ideas:['Line up the decimal points when adding and subtracting.','To multiply: ignore the points, multiply, then count decimal places.','To divide by a decimal: multiply both numbers by 10 or 100.','0.5 × 0.4 = 0.2 (not 2!).'],
 vocab:['decimal point — десятичная запятая','tenth — десятая','hundredth — сотая','divisor — делитель'],
 mistake:{wrong:['0.3 × 0.4','= 12','(3 × 4)'],why:'The decimal places were forgotten.',fix:'3 × 4 = 12, with 2 decimal places: <b>0.12</b>'},
 ican:['order decimals','add and subtract decimals','multiply and divide decimals','solve money problems'],
 challenge:'Create a shopping problem with a total of £7.85.',widget:'decimals'},
{id:'t05',u:5,term:1,icon:'📐',title:'Angles & constructions',strand:'Geometry & Measure',color:'#dc2626',
 obj:'Use angle facts to find unknown angles on a line, at a point, in triangles and quadrilaterals; draw angles accurately.',
 ideas:['Angles on a straight line add to 180°.','Angles around a point add to 360°.','Vertically opposite angles are equal.','Triangle: 180°. Quadrilateral: 360°.'],
 vocab:['angle — угол','vertex — вершина','vertically opposite — вертикальные','protractor — транспортир','perpendicular — перпендикулярный'],
 mistake:{wrong:['100° + x = 360°','x = 260°','(angles on a straight line)'],why:'360° is for a full turn, not a straight line.',fix:'Straight line → 180°: x = <b>80°</b>'},
 ican:['name types of angle','use line, point and vertically opposite facts','use triangle and quadrilateral sums','draw angles with a protractor'],
 challenge:'Draw two crossing lines, measure all four angles and check the total is 360°.',widget:'angles'},
{id:'t06',u:6,term:2,icon:'📊',title:'Collecting data',strand:'Statistics',color:'#d97706',
 obj:'Find the mean, median, mode and range, and plan how to collect data from a sample.',
 ideas:['Mean = total ÷ number of values.','Median = middle value when in order (mean of the middle two if even).','Mode = most common; range = largest − smallest.','A sample is a small part of a population.'],
 vocab:['mean — среднее','median — медиана','mode — мода','range — размах','sample — выборка'],
 mistake:{wrong:['Median of 7, 2, 9, 4, 5','= 9 (middle of the list)'],why:'The data were not put in order.',fix:'Order: 2, 4, 5, 7, 9 → median = <b>5</b>'},
 ican:['calculate mean, median, mode and range','use frequency tables','find a missing value from the mean','explain a sample'],
 challenge:'Collect the shoe sizes of 10 classmates and work out all four averages.',widget:'data'},
{id:'t07',u:7,term:2,icon:'🍕',title:'Fractions',strand:'Number',color:'#e11d48',
 obj:'Order, add, subtract, multiply and divide fractions and mixed numbers.',
 ideas:['Equivalent fractions: multiply top and bottom by the same number.','Add/subtract: use a common denominator.','Multiply: top × top, bottom × bottom.','Divide: flip the second fraction and multiply.'],
 vocab:['numerator — числитель','denominator — знаменатель','equivalent — равносильный','improper fraction — неправильная дробь','mixed number — смешанное число'],
 mistake:{wrong:['1/2 + 1/3','= 2/5'],why:'Numerators and denominators were added separately.',fix:'Common denominator 6: 3/6 + 2/6 = <b>5/6</b>'},
 ican:['find equivalent fractions','add and subtract fractions','multiply and divide fractions','find a fraction of an amount'],
 challenge:'Find three fractions that lie between 1/3 and 1/2.',widget:'fractions'},
{id:'t08',u:8,term:2,icon:'🔷',title:'Shapes & symmetry',strand:'Geometry & Measure',color:'#9333ea',
 obj:'Identify lines and rotational symmetry, properties of circles and polygons, congruent shapes and 3D shapes.',
 ideas:['A regular polygon with n sides has n lines of symmetry and rotational order n.','Diameter = 2 × radius.','Congruent shapes are identical in shape and size.','Euler: vertices − edges + faces = 2.'],
 vocab:['symmetry — симметрия','congruent — равные (конгруэнтные)','polygon — многоугольник','face — грань','edge — ребро','vertex — вершина'],
 mistake:{wrong:['Lines of symmetry of a rectangle','= 4 (like a square)'],why:'The diagonals are not lines of symmetry for a rectangle.',fix:'A rectangle has only <b>2</b> lines of symmetry'},
 ican:['find lines of symmetry','find the order of rotational symmetry','count faces, edges and vertices','use circle words'],
 challenge:'Design a shape with exactly 1 line of symmetry and rotational order 1, and another with order 2 but 0 lines.',widget:'symmetry'},
{id:'t09',u:9,term:2,icon:'🔁',title:'Sequences & functions',strand:'Algebra',color:'#0d9488',
 obj:'Generate and describe sequences using term-to-term rules and nth-term rules; use function machines.',
 ideas:['A sequence goes up or down by a common difference.','nth term = d × n + (first term − d).','Term-to-term rule uses the previous term; position-to-term uses n.','A function machine applies operations in order.'],
 vocab:['sequence — последовательность','term — член','nth term — n-й член','common difference — разность','function machine — машина функций'],
 mistake:{wrong:['Sequence 3, 7, 11, 15','nth term = 3n + 4'],why:'The coefficient should be the difference, 4.',fix:'nth term = <b>4n − 1</b>'},
 ican:['continue a sequence','use a term-to-term rule','find a term from the nth term','find the nth term'],
 challenge:'Invent a sequence whose 10th term is 52.',widget:'sequence'},
{id:'t10',u:10,term:2,icon:'💯',title:'Fractions, decimals & percentages',strand:'Number',color:'#ea580c',
 obj:'Convert between fractions, decimals and percentages and find percentages of amounts.',
 ideas:['Percent means “out of 100”.','Fraction → decimal: divide. Decimal → percent: × 100.','10% = ÷ 10, 50% = ÷ 2, 25% = ÷ 4.','Percentage change = change ÷ original × 100.'],
 vocab:['percentage — процент','per cent — на сто','increase — увеличение','decrease — уменьшение','original — исходный'],
 mistake:{wrong:['Increase £40 by 10%','= £40 + 10','= £50'],why:'10% is not £10.',fix:'10% of 40 = 4, so <b>£44</b>'},
 ican:['convert between F, D and P','find a percentage of an amount','increase and decrease by a percentage','find percentage change'],
 challenge:'Find a fraction, decimal and percentage that all equal 0.375.',widget:'percent'},
{id:'t11',u:11,term:3,icon:'📈',title:'Graphs & functions',strand:'Algebra',color:'#4f46e5',
 obj:'Use coordinates, function tables and plot and read straight-line graphs y = mx + c.',
 ideas:['Coordinates are written (x, y): across first, then up.','To plot y = 2x + 1: choose x, calculate y.','m is the gradient (steepness), c is where the line crosses the y-axis.','Gradient = rise ÷ run.'],
 vocab:['coordinates — координаты','axis — ось','gradient — наклон','intercept — пересечение','function — функция'],
 mistake:{wrong:['Point (3, 5)','Plotted 5 across, 3 up'],why:'x comes first.',fix:'(3, 5) means <b>3 across, 5 up</b>'},
 ican:['plot coordinates','make a table of values','draw y = mx + c','read values from a graph'],
 challenge:'Find a line that passes through (0, 3) and (2, 7).',widget:'graph'},
{id:'t12',u:12,term:3,icon:'⚖️',title:'Ratio & proportion',strand:'Number',color:'#0284c7',
 obj:'Use ratios to share quantities and solve direct and inverse proportion problems.',
 ideas:['A ratio compares parts: 3 : 2.','Add the parts, divide to find one part, then multiply.','Unitary method: find the value of 1, then scale up.','More workers → fewer days (inverse proportion).'],
 vocab:['ratio — отношение','proportion — пропорция','share — разделить','unit price — цена за единицу','scale — масштаб'],
 mistake:{wrong:['Share £20 in ratio 3 : 2','£20 ÷ 3 and £20 ÷ 2'],why:'The total number of parts must be found first.',fix:'3 + 2 = 5 parts; 1 part = £4: <b>£12 and £8</b>'},
 ican:['simplify a ratio','share in a given ratio','use the unitary method','solve proportion problems'],
 challenge:'Write a recipe for 12 people from a recipe for 4 — then for 10 people.',widget:'ratio'},
{id:'t13',u:13,term:3,icon:'🎲',title:'Probability',strand:'Statistics & Probability',color:'#c026d3',
 obj:'Use the probability scale, calculate theoretical probabilities and compare with experimental results.',
 ideas:['Probability is between 0 (impossible) and 1 (certain).','P(event) = favourable outcomes ÷ total outcomes.','P(not A) = 1 − P(A).','Experimental probability = frequency ÷ trials; more trials → closer to theory.'],
 vocab:['probability — вероятность','outcome — исход','event — событие','random — случайный','expected — ожидаемый'],
 mistake:{wrong:['P(red) = 3 : 5'],why:'Probability is a fraction of all outcomes, not a ratio.',fix:'3 red out of 8 total → P(red) = <b>3/8</b>'},
 ican:['use the probability scale','calculate P(event)','use P(not A) = 1 − P(A)','compare experimental and theoretical'],
 challenge:'Design a spinner where P(red) = 0.25 and P(blue) = 0.5.',widget:'prob'},
{id:'t14',u:14,term:3,icon:'🗺️',title:'Position & transformation',strand:'Geometry & Measure',color:'#16a34a',
 obj:'Use coordinates in four quadrants; reflect, rotate, translate and enlarge shapes; use scale on maps and plans.',
 ideas:['Translation: slide by a vector (left/right changes x, up/down changes y).','Reflection in the y-axis changes the sign of x; in the x-axis changes the sign of y.','Enlargement multiplies lengths by the scale factor (area by its square).','Scale 1 : 100 000 → 1 cm = 1 km.'],
 vocab:['translation — параллельный перенос','reflection — отражение','rotation — поворот','enlargement — увеличение','scale factor — коэффициент'],
 mistake:{wrong:['Reflect (3, 2) in the x-axis','= (−3, 2)'],why:'That is the y-axis reflection.',fix:'The x-axis reflection changes y: <b>(3, −2)</b>'},
 ican:['translate, reflect and rotate shapes','enlarge by a scale factor','use map and plan scales','describe transformations'],
 challenge:'Draw a triangle, reflect it, then translate the image. Describe both moves.',widget:'transform'},
{id:'t15',u:15,term:3,icon:'📦',title:'Shapes, area & volume',strand:'Geometry & Measure',color:'#b45309',
 obj:'Find the area of rectangles, triangles, parallelograms and compound shapes; use hectares; find volume and surface area of cuboids.',
 ideas:['Rectangle: length × width. Triangle: ½ × base × height.','Parallelogram: base × perpendicular height.','Compound shape: split it up or subtract a piece.','Cuboid volume = l × w × h; 1 hectare = 10 000 m².'],
 vocab:['area — площадь','perimeter — периметр','volume — объём','hectare — гектар','cuboid — прямоугольный параллелепипед','surface area — площадь поверхности'],
 mistake:{wrong:['Triangle base 6, height 4','Area = 6 × 4 = 24'],why:'The ½ was forgotten.',fix:'Area = ½ × 6 × 4 = <b>12</b>'},
 ican:['find areas of 2D shapes','find area of compound shapes','use hectares','find volume and surface area of a cuboid'],
 challenge:'Find the dimensions of a cuboid with volume 48 cm³ in three different ways.',widget:'area'},
{id:'t16',u:16,term:3,icon:'📉',title:'Interpreting results',strand:'Statistics & Probability',color:'#475569',
 obj:'Interpret and draw bar charts, line graphs and pie charts, and compare data sets using averages and range.',
 ideas:['Read bar charts from the top of the bar across to the scale.','Pie chart angle = frequency ÷ total × 360°.','Compare data sets using an average and the range.','Check the axes and scale — graphs can mislead!'],
 vocab:['bar chart — столбчатая диаграмма','pie chart — круговая диаграмма','line graph — линейный график','frequency — частота','compare — сравнить'],
 mistake:{wrong:['10 out of 40 students','Angle = 10°'],why:'The angle must be a fraction of 360°.',fix:'10 ÷ 40 × 360° = <b>90°</b>'},
 ican:['read bar charts and line graphs','draw pie charts','compare data using averages and range','spot misleading graphs'],
 challenge:'Survey 12 classmates, then draw a pie chart of the results.',widget:'interpret'},
];
const TMAP=Object.fromEntries(TOPICS.map(t=>[t.id,t]));

// a lesson (1-6) uses only the problem types listed in lessons.js; li=0 means the whole unit
function poolFor(tid,li,level){
  if(li&&tid!=='all'){
    const les=lessonOf(tid,li);
    const order={easy:['easy','medium','hard'],medium:['medium','easy','hard'],hard:['hard','medium','easy']}[level];
    for(const lv of order){const f=les.items.filter(x=>x[0]===lv).map(x=>T7[tid][lv][x[1]]);if(f.length)return f}
  }
  return T7[tid][level];
}
function genTopic(tid,level,r,li=0){
  if(tid==='all'){tid=r.pick(TOPICS).id;li=0}
  const list=poolFor(tid,li,level);
  for(let t=0;t<60;t++){
    let p;try{p=r.pick(list)(r)}catch(e){p=null}
    if(!p)continue;
    return finishP(p,tid,level);
  }
  throw new Error('topic generator failed '+tid+' '+level);
}
function finishP(p,tid,level){
  p.year=7;p.tid=tid;p.level=level;
  if(p.label===undefined)p.label='x =';
  if(p.unit===undefined)p.unit='';
  if(!p.tol)p.tol=1e-6;
  return p;
}
function genTopicList(tid,level,n,r,li=0){
  const out=[];
  if(tid==='all'){for(let i=0;i<n;i++)out.push(genTopic('all',level,r));return out}
  const gens=r.shuffle(poolFor(tid,li,level));
  for(let i=0;i<n;i++){
    let p=null;for(let t=0;t<30&&!p;t++){try{p=gens[(i+t)%gens.length](r)}catch(e){p=null}}
    out.push(finishP(p,tid,level));
  }
  return out;
}