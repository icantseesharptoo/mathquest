/* Interactive widgets — one per Year 7 topic. Each: {title, controls[], render(state)->html, after?(view,state,redraw)} */
const PAL=['#4f46e5','#d9480f','#16a34a','#f59e0b','#0ea5e9','#c026d3'];
function mountWidget(host,def){
  const st={};
  host.innerHTML=`<div class="wtitle">🧪 ${def.title}</div><div class="wctl"></div><div class="wview"></div>`;
  const ctl=$('.wctl',host),view=$('.wview',host);
  const draw=()=>{view.innerHTML=def.render(st);if(def.after)def.after(view,st,draw)};
  def.controls.forEach(c=>{
    st[c.id]=c.val;const d=document.createElement('div');d.className='wc';
    if(c.type==='select'){
      d.innerHTML=`<label>${c.label}</label><select>${c.opts.map(o=>`<option value="${o[0]}" ${String(o[0])===String(c.val)?'selected':''}>${o[1]}</option>`).join('')}</select>`;
      $('select',d).onchange=e=>{st[c.id]=e.target.value;draw()};
    }else if(c.type==='text'){
      d.innerHTML=`<label>${c.label}</label><input type="text" value="${c.val}" style="width:15rem">`;
      $('input',d).oninput=e=>{st[c.id]=e.target.value;draw()};
    }else{
      d.innerHTML=`<label>${c.label}: <b>${c.val}</b></label><input type="range" min="${c.min}" max="${c.max}" step="${c.step||1}" value="${c.val}">`;
      $('input',d).oninput=e=>{st[c.id]=+e.target.value;$('b',d).textContent=e.target.value;draw()};
    }
    ctl.appendChild(d);
  });
  draw();
}
const W={};
const dpOf=s=>s>=1?0:s===.1?1:2;

// ---- 1 integers ----
W.integers={title:'Number-line jumper',controls:[
 {id:'a',label:'Start at',min:-10,max:10,val:3},{id:'b',label:'Number',min:-10,max:10,val:-5},
 {id:'op',label:'Operation',type:'select',opts:[['+','add (+)'],['-','subtract (−)']],val:'+'}],
 render:s=>{
  const a=+s.a,b=+s.b,mv=s.op==='+'?b:-b,res=a+mv,X=v=>20+(v+20)*12;let g='';
  for(let v=-20;v<=20;v++)g+=`<line x1="${X(v)}" y1="62" x2="${X(v)}" y2="${v%5===0?74:68}" stroke="#111827"/>${v%5===0?`<text x="${X(v)}" y="90" font-size="11" text-anchor="middle" fill="#374151">${v}</text>`:''}`;
  g+=`<line x1="14" y1="62" x2="506" y2="62" stroke="#111827" stroke-width="2"/>`;
  if(mv!==0){const x1=X(a),x2=X(res),mx=(x1+x2)/2;g+=`<path d="M${x1},58 Q${mx},4 ${x2},58" fill="none" stroke="#d9480f" stroke-width="3"/><polygon points="${x2},60 ${x2+(x2>x1?-9:9)},48 ${x2+(x2>x1?-2:2)},46" fill="#d9480f"/>`}
  g+=`<circle cx="${X(a)}" cy="62" r="6" fill="#4f46e5"/><circle cx="${X(res)}" cy="62" r="6" fill="#d9480f"/>`;
  const expl=s.op==='+'?`${M(a)} + ${sg(b)} = <b>${M(res)}</b>`:`${M(a)} − ${sg(b)} = ${M(a)} + ${sg(-b)} = <b>${M(res)}</b>`;
  return svgWrap(g,520,100)+`<div class="wout">${expl}<br><small>${mv>0?'Move right':mv<0?'Move left':'No move'} by ${Math.abs(mv)}</small></div>`}};

// ---- 2 balance ----
W.balance={title:'Balance scale — try values of x',controls:[
 {id:'a',label:'a (in ax + b)',min:1,max:6,val:2},{id:'b',label:'b',min:-6,max:9,val:3},{id:'c',label:'Right side',min:0,max:30,val:11},{id:'x',label:'Try x =',min:-5,max:12,val:0}],
 render:s=>{
  const a=+s.a,b=+s.b,c=+s.c,x=+s.x,L=a*x+b,Rr=c,ang=Math.max(-14,Math.min(14,(Rr-L)*1.5)),t=rad(ang);
  const lx=200-140*Math.cos(t),ly=130-140*Math.sin(t),rx=200+140*Math.cos(t),ry=130+140*Math.sin(t);
  let g=`<polygon points="180,215 220,215 200,130" fill="#6366f1"/><line x1="${lx}" y1="${ly}" x2="${rx}" y2="${ry}" stroke="#312e81" stroke-width="7" stroke-linecap="round"/>`;
  [[lx,ly,lin(a,b)+` = ${L}`],[rx,ry,String(c)]].forEach(([px,py,tx])=>{g+=`<line x1="${px}" y1="${py}" x2="${px-45}" y2="${py+52}" stroke="#6b7280"/><line x1="${px}" y1="${py}" x2="${px+45}" y2="${py+52}" stroke="#6b7280"/><rect x="${px-52}" y="${py+52}" width="104" height="32" rx="8" fill="#fde68a" stroke="#b45309" stroke-width="2"/>`+txt(px,py+68,tx,false,15)});
  const sol=(c-b)/a,bal=L===Rr;
  return svgWrap(g,400,240)+`<div class="wout">${lin(a,b)} = ${c} &nbsp;|&nbsp; x = ${x}: left = ${L}, right = ${c}<br>${bal?'<b style="color:#16a34a">⚖️ Balanced! x = '+x+' solves it.</b>':L>Rr?'⬅️ Left side is heavier — try a smaller x':'Right side is heavier ➡️ — try a bigger x'}<br><small>Solution: x = (${c} − ${sg(b)}) ÷ ${a} = ${Number.isInteger(sol)?sol:rd(sol,2)}</small></div>`}};

// ---- 3 place value & rounding ----
W.place={title:'Place value & rounding',controls:[
 {id:'w',label:'Whole part',min:0,max:9999,val:4672},{id:'d',label:'Hundredths',min:0,max:99,val:38},
 {id:'to',label:'Round to the nearest',type:'select',opts:[['10','10'],['100','100'],['1000','1000'],['1','1 (whole number)'],['0.1','0.1 (1 d.p.)'],['0.01','0.01 (2 d.p.)']],val:'10'}],
 render:s=>{
  const step=+s.to,n=+s.w+ +s.d/100,r=roundHalfUp(n,step),lo=rd(Math.floor(n/step+1e-9)*step),hi=rd(lo+step),dp=dpOf(step);
  const ws=String(Math.floor(+s.w)).padStart(4,'0'),ds=String(+s.d).padStart(2,'0'),cols=['Th','H','T','U','t','h'],digs=[...ws,...ds];
  const ri={1000:0,100:1,10:2,1:3,.1:4,.01:5}[step];
  let tb='<table class="pvt"><tr>'+cols.map((c,i)=>`<th ${i===ri?'class="hl"':''}>${c}</th>`).join('')+'</tr><tr>'+digs.map((d,i)=>`<td class="${i===ri?'hl':i===ri+1?'nx':''}">${d}</td>`).join('')+'</tr></table>';
  const f=(lo2)=>lo2.toFixed(dp),pos=(n-lo)/step,x=40+pos*340;
  const nl=svgWrap(`<line x1="40" y1="40" x2="380" y2="40" stroke="#111827" stroke-width="2.5"/><line x1="40" y1="32" x2="40" y2="48" stroke="#111827" stroke-width="2.5"/><line x1="380" y1="32" x2="380" y2="48" stroke="#111827" stroke-width="2.5"/><line x1="210" y1="34" x2="210" y2="46" stroke="#9ca3af"/><text x="40" y="66" font-size="14" text-anchor="middle" font-weight="700">${f(lo)}</text><text x="380" y="66" font-size="14" text-anchor="middle" font-weight="700">${f(hi)}</text><text x="210" y="66" font-size="11" text-anchor="middle" fill="#6b7280">halfway</text><circle cx="${x}" cy="40" r="7" fill="#d9480f"/><text x="${x}" y="20" font-size="13" text-anchor="middle" fill="#d9480f" font-weight="700">${n.toFixed(2)}</text>`,420,80);
  return tb+nl+`<div class="wout">${n.toFixed(2)} is ${pos<.5?'closer to <b>'+f(lo)+'</b>':'closer to <b>'+f(hi)+'</b>'} → rounds to <b>${r.toFixed(dp)}</b></div>`}};

// ---- 4 decimals ----
W.decimals={title:'Hundred-square decimals',controls:[{id:'a',label:'Blue squares (A)',min:0,max:100,val:37},{id:'b',label:'Orange squares (B)',min:0,max:100,val:25}],
 render:s=>{
  const a=+s.a,b=Math.min(+s.b,100-a);let g='';
  for(let i=0;i<100;i++){const r=Math.floor(i/10),c=i%10;g+=`<rect x="${10+c*20}" y="${10+r*20}" width="20" height="20" fill="${i<a?'#4f46e5':i<a+b?'#f59e0b':'#fff'}" stroke="#9ca3af"/>`}
  g+=`<rect x="10" y="10" width="200" height="200" fill="none" stroke="#111827" stroke-width="2"/>`;
  return svgWrap(g,220,220)+`<div class="wout"><span style="color:#4f46e5"><b>${a/100}</b></span> + <span style="color:#d97706"><b>${b/100}</b></span> = <b>${(a+b)/100}</b><br><small>Total shaded: ${a+b} out of 100 squares. Unshaded: ${rd(1-(a+b)/100,2)}</small></div>`}};

// ---- 5 angles ----
const EXPL={line:'Angles on a straight line add up to 180°',point:'Angles around a point add up to 360°',vo:'Vertically opposite angles are equal',tri:'Angles in a triangle add up to 180°',quad:'Angles in a quadrilateral add up to 360°'};
function explorerDraw(k,v){
  let svg,sum;
  if(k==='line'){const a=v[0],b=180-a;svg=raysDiagram({cx:130,cy:150,R:112,parts:[a,b],labels:[a+'°',b+'°'],lr:66});sum=`${a}° + ${b}° = 180°`}
  else if(k==='point'){let a=v[0],b=v[1];if(360-a-b<40)b=320-a;const c=360-a-b;svg=raysDiagram({cx:130,cy:92,R:84,start:20,parts:[a,b,c],labels:[a+'°',b+'°',c+'°'],lr:50});sum=`${a}° + ${b}° + ${c}° = 360°`}
  else if(k==='vo'){const a=v[0],b=180-a;svg=raysDiagram({cx:130,cy:90,R:92,start:15,parts:[a,b,a,b],labels:[a+'°',b+'°',a+'°',b+'°'],lr:50,ar:22});sum=`Opposite pairs: ${a}° = ${a}°  and  ${b}° = ${b}°`}
  else if(k==='tri'){let A=v[0],B=v[1];if(A+B>155)B=155-A;const C=180-A-B;svg=polyDiagram([A,B,C],[A+'°',B+'°',C+'°'],[]);sum=`${A}° + ${B}° + ${C}° = 180°`}
  else{let [A,B,C]=v;if(A+B+C>310)C=310-A-B;const D=360-A-B-C;svg=polyDiagram([A,B,C,D],[A+'°',B+'°',C+'°',D+'°'],[]);sum=`${A}° + ${B}° + ${C}° + ${D}° = 360°`}
  return {svg,sum};
}
W.angles={title:'Angle Explorer',controls:[
 {id:'k',label:'Angle fact',type:'select',opts:[['line','Straight line'],['point','Around a point'],['vo','Vertically opposite'],['tri','Triangle'],['quad','Quadrilateral']],val:'line'},
 {id:'a',label:'Angle a',min:30,max:150,val:65},{id:'b',label:'Angle b',min:40,max:110,val:70},{id:'c',label:'Angle c',min:60,max:120,val:95}],
 render:s=>{const o=explorerDraw(s.k,[+s.a,+s.b,+s.c]);return o.svg+`<div class="wout"><b>${EXPL[s.k]}</b><br>${o.sum}</div>`}};

// ---- 6 data ----
W.data={title:'Averages explorer — edit the data',controls:[{id:'t',label:'Numbers (comma separated)',type:'text',val:'3, 5, 5, 8, 9, 12'}],
 render:s=>{
  const v=String(s.t).split(/[,\s]+/).map(Number).filter(x=>!isNaN(x)&&String(x)!=='');
  if(v.length<1)return '<div class="wout">Type some numbers, e.g. 4, 7, 7, 10</div>';
  const so=[...v].sort((a,b)=>a-b),n=so.length,sum=v.reduce((a,b)=>a+b,0),mean=sum/n,med=n%2?so[(n-1)/2]:(so[n/2-1]+so[n/2])/2;
  const fq={};v.forEach(x=>fq[x]=(fq[x]||0)+1);const mf=Math.max(...Object.values(fq)),modes=Object.keys(fq).filter(k=>fq[k]===mf);
  const lo=so[0]-1,hi=so[n-1]+1,X=x=>30+(x-lo)/(hi-lo)*340;let g='<line x1="20" y1="150" x2="380" y2="150" stroke="#111827" stroke-width="2"/>';
  const stp=(hi-lo)>30?5:1;for(let t=Math.ceil(lo);t<=hi;t+=stp)g+=`<line x1="${X(t)}" y1="150" x2="${X(t)}" y2="156" stroke="#111827"/><text x="${X(t)}" y="170" font-size="10" text-anchor="middle">${t}</text>`;
  Object.entries(fq).forEach(([x,f])=>{for(let i=0;i<f;i++)g+=`<circle cx="${X(+x)}" cy="${140-i*17}" r="7" fill="${f===mf&&mf>1?'#d9480f':'#4f46e5'}"/>`});
  g+=`<polygon points="${X(mean)},150 ${X(mean)-7},138 ${X(mean)+7},138" fill="#16a34a" opacity=".0"/><line x1="${X(mean)}" y1="20" x2="${X(mean)}" y2="150" stroke="#16a34a" stroke-width="2" stroke-dasharray="5 3"/><text x="${X(mean)+4}" y="30" font-size="11" fill="#16a34a" font-weight="700">mean</text><line x1="${X(med)}" y1="40" x2="${X(med)}" y2="150" stroke="#9333ea" stroke-width="2" stroke-dasharray="2 3"/><text x="${X(med)+4}" y="50" font-size="11" fill="#9333ea" font-weight="700">median</text>`;
  return svgWrap(g,400,185)+`<div class="wout">Ordered: ${so.join(', ')}<br>Mean = ${sum} ÷ ${n} = <b>${rd(mean,2)}</b> &nbsp; Median = <b>${med}</b> &nbsp; Mode = <b>${mf>1?modes.join(', '):'none'}</b> &nbsp; Range = <b>${so[n-1]-so[0]}</b></div>`}};

// ---- 7 fractions ----
W.fractions={title:'Fraction bars & equivalent fractions',controls:[{id:'n',label:'Numerator',min:0,max:12,val:3},{id:'d',label:'Denominator',min:1,max:12,val:4},{id:'m',label:'Multiply top & bottom by',min:1,max:5,val:2}],
 render:s=>{
  const d=+s.d,n=Math.min(+s.n,d),m=+s.m;let g='';
  const bar=(y,den,num,col)=>{const w=360/den;for(let i=0;i<den;i++)g+=`<rect x="${20+i*w}" y="${y}" width="${w}" height="40" fill="${i<num?col:'#fff'}" stroke="#374151" stroke-width="1.5"/>`};
  bar(10,d,n,'#4f46e5');bar(65,d*m,n*m,'#d9480f');
  const [sn,sd]=Fr(n,d);
  return svgWrap(g,400,135)+`<div class="wout">${fr(n,d)} = ${fr(n*m,d*m)} = <b>${rd(n/d,3)}</b> = <b>${rd(n/d*100,1)}%</b><br><small>Simplest form: ${sd===1?sn:sn+'/'+sd}</small></div>`}};

// ---- 8 symmetry ----
W.symmetry={title:'Symmetry lab — regular polygons',controls:[{id:'n',label:'Number of sides',min:3,max:12,val:5},{id:'rot',label:'Rotate by (°)',min:0,max:360,val:0}],
 render:s=>{
  const n=+s.n,rt=+s.rot,cx=150,cy=100,R=78,pts=[];for(let i=0;i<n;i++)pts.push(P(cx,cy,R,90+i*360/n+rt));
  let g=`<polygon points="${pts.map(p=>f1(p[0])+','+f1(p[1])).join(' ')}" fill="#eef2ff" stroke="#111827" stroke-width="2.4"/>`;
  for(let k=0;k<n;k++){const a=P(cx,cy,R+12,90+k*180/n),b=P(cx,cy,R+12,270+k*180/n);g+=`<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="#d9480f" stroke-width="1.3" stroke-dasharray="5 3"/>`}
  g+=`<circle cx="${f1(pts[0][0])}" cy="${f1(pts[0][1])}" r="6" fill="#16a34a"/>`;
  const q=360/n,fit=Math.abs(rt/q-Math.round(rt/q))<.003;
  return svgWrap(g,300,205)+`<div class="wout"><b>${n} lines of symmetry</b> (dashed) · rotational symmetry of <b>order ${n}</b><br>It fits onto itself every ${rd(q,2)}°. ${fit?'<b style="color:#16a34a">✔ It looks the same after turning '+rt+'°!</b>':'Turn the slider to a multiple of '+rd(q,2)+'° to see it fit.'}</div>`}};

// ---- 9 sequence ----
W.sequence={title:'Sequence builder',controls:[{id:'a',label:'First term',min:-5,max:20,val:3},{id:'d',label:'Common difference',min:-6,max:10,val:4},{id:'n',label:'Terms shown',min:4,max:12,val:8}],
 render:s=>{
  const a=+s.a,d=+s.d,n=+s.n,t=Array.from({length:n},(_,i)=>a+d*i),mn=Math.min(...t,0),mx=Math.max(...t,1),X=i=>35+i*(320/(n-1)),Y=v=>170-(v-mn)/(mx-mn||1)*140;
  let g=`<line x1="30" y1="${Y(0)}" x2="385" y2="${Y(0)}" stroke="#9ca3af"/><polyline points="${t.map((v,i)=>X(i)+','+Y(v)).join(' ')}" fill="none" stroke="#c7d2fe" stroke-width="2"/>`;
  t.forEach((v,i)=>{g+=`<circle cx="${X(i)}" cy="${Y(v)}" r="6" fill="#4f46e5"/>${txt(X(i),Y(v)-14,v,false,11)}${txt(X(i),190,i+1,false,10)}`});
  return svgWrap(g,400,200)+`<div class="wout">${t.slice(0,6).map(M).join(', ')}, …<br>Rule: ${d>=0?'add':'subtract'} ${Math.abs(d)} each time &nbsp;·&nbsp; nth term = <b>${lin(d,a-d,'n')}</b><br><small>Check: n = ${n} → ${d} × ${n} ${a-d>=0?'+':'−'} ${Math.abs(a-d)} = ${M(d*n+a-d)}</small></div>`}};

// ---- 10 percent ----
W.percent={title:'Percentage grid',controls:[{id:'p',label:'Percentage',min:0,max:100,val:35},{id:'a',label:'Amount',min:10,max:500,step:10,val:240}],
 render:s=>{
  const p=+s.p,a=+s.a;let g='';
  for(let i=0;i<100;i++){const r=Math.floor(i/10),c=i%10;g+=`<rect x="${10+c*20}" y="${10+r*20}" width="20" height="20" fill="${i<p?'#d9480f':'#fff'}" stroke="#9ca3af"/>`}
  g+=`<rect x="10" y="10" width="200" height="200" fill="none" stroke="#111827" stroke-width="2"/>`;
  return svgWrap(g,220,220)+`<div class="wout"><b>${p}%</b> = ${fr(p,100)} = ${rd(p/100,2)}<br>10% of ${a} = ${rd(a/10,2)}<br><b>${p}% of ${a} = ${rd(a*p/100,2)}</b></div>`}};

// ---- 11 graph ----
W.graph={title:'Straight-line graphs  y = mx + c',controls:[{id:'m',label:'Gradient m',min:-4,max:4,val:2},{id:'c',label:'Intercept c',min:-6,max:6,val:1},{id:'x',label:'Point at x =',min:-5,max:5,val:2}],
 render:s=>{
  const m=+s.m,c=+s.c,x=+s.x,y=m*x+c,pts=Math.abs(y)<=6?[{x,y,label:`(${x}, ${y})`}]:[];
  const tbl='<table class="pvt"><tr><th>x</th>'+[-2,-1,0,1,2].map(v=>`<td>${v}</td>`).join('')+'</tr><tr><th>y</th>'+[-2,-1,0,1,2].map(v=>`<td>${m*v+c}</td>`).join('')+'</tr></table>';
  return gridSvg({fns:[{m,c}],pts})+`<div class="wout"><b>y = ${lin(m,c,'x')}</b> — gradient ${m}, crosses the y-axis at ${c}<br>${tbl}</div>`}};

// ---- 12 ratio ----
W.ratio={title:'Ratio sharing bar',controls:[{id:'a',label:'First part',min:1,max:9,val:3},{id:'b',label:'Second part',min:1,max:9,val:2},{id:'t',label:'Total to share',min:10,max:120,step:5,val:60}],
 render:s=>{
  const a=+s.a,b=+s.b,t=+s.t,n=a+b,w=360/n;let g='';
  for(let i=0;i<n;i++)g+=`<rect x="${20+i*w}" y="20" width="${w}" height="44" fill="${i<a?'#4f46e5':'#d9480f'}" stroke="#fff" stroke-width="2"/>`;
  g+=txt(20+a*w/2,85,`${a} parts`,false,13)+txt(20+a*w+b*w/2,85,`${b} parts`,false,13);
  const one=t/n;
  return svgWrap(g,400,100)+`<div class="wout">Ratio <b>${a} : ${b}</b> — total parts = ${n}<br>1 part = ${t} ÷ ${n} = <b>${rd(one,2)}</b><br>Shares: ${a} × ${rd(one,2)} = <b>${rd(a*one,2)}</b> and ${b} × ${rd(one,2)} = <b>${rd(b*one,2)}</b></div>`}};

// ---- 13 probability ----
W.prob={title:'Spinner lab — theory vs experiment',controls:[{id:'r',label:'Red sectors',min:0,max:8,val:3},{id:'b',label:'Blue sectors',min:0,max:8,val:2},{id:'g',label:'Green sectors',min:0,max:8,val:1}],
 render:s=>{
  const cnt={r:+s.r,b:+s.b,g:+s.g},tot=cnt.r+cnt.b+cnt.g,sig=`${cnt.r}${cnt.b}${cnt.g}`;
  if(s._sig!==sig){s._sig=sig;s.tally={r:0,b:0,g:0,n:0};s.last=''}
  if(tot===0)return '<div class="wout">Add some sectors!</div>';
  const cols=['#dc2626','#2563eb','#16a34a'],names=['Red','Blue','Green'],keys=['r','b','g'];
  let g='',a0=90;const order=[];keys.forEach((k,i)=>{for(let j=0;j<cnt[k];j++)order.push(i)});
  order.forEach((ci,idx)=>{const a1=a0+360/tot,[x0,y0]=P(110,100,85,a0),[x1,y1]=P(110,100,85,a1);g+=`<path d="M110,100 L${f1(x0)},${f1(y0)} A85,85 0 0 0 ${f1(x1)},${f1(y1)} Z" fill="${cols[ci]}" stroke="#fff" stroke-width="2"/>`;a0=a1});
  g+=`<polygon points="110,6 100,-6 120,-6" fill="#111827" transform="translate(0,14)"/>`;
  const rows=keys.map((k,i)=>{const th=cnt[k]/tot,ex=s.tally.n?s.tally[k]/s.tally.n:0;return `<tr><td style="color:${cols[i]}"><b>${names[i]}</b></td><td>${cnt[k]}/${tot} = ${rd(th,3)}</td><td>${s.tally[k]}/${s.tally.n}${s.tally.n?' = '+rd(ex,3):''}</td></tr>`}).join('');
  return `<div style="display:flex;flex-wrap:wrap;gap:1rem;align-items:center;justify-content:center">${svgWrap(g,220,200)}<div><div class="row"><button class="btn spin" data-k="1">Spin ×1</button><button class="btn spin" data-k="10">×10</button><button class="btn spin" data-k="100">×100</button><button class="btn alt spin" data-k="0">Reset</button></div><div class="wout">Last spin: ${s.last||'—'}<table class="pvt"><tr><th>Colour</th><th>Theory</th><th>Experiment</th></tr>${rows}</table></div></div></div><div class="wout"><small>The more spins, the closer experiment gets to theory!</small></div>`},
 after:(v,s,redraw)=>{$$('.spin',v).forEach(b=>b.onclick=()=>{const k=+b.dataset.k;if(!k){s.tally={r:0,b:0,g:0,n:0};s.last=''}else{const tot=+s.r+ +s.b+ +s.g;for(let i=0;i<k;i++){const x=Math.random()*tot,key=x<+s.r?'r':x<+s.r+ +s.b?'b':'g';s.tally[key]++;s.tally.n++;s.last={r:'🔴',b:'🔵',g:'🟢'}[key]}}redraw()})}};

// ---- 14 transformations ----
W.transform={title:'Transformation studio',controls:[
 {id:'mode',label:'Transformation',type:'select',opts:[['tr','Translation'],['rx','Reflect in x-axis'],['ry','Reflect in y-axis'],['rot','Rotate 180° about origin'],['en','Enlarge (centre origin)']],val:'tr'},
 {id:'tx',label:'Move right/left',min:-6,max:6,val:3},{id:'ty',label:'Move up/down',min:-6,max:6,val:-2},{id:'k',label:'Scale factor',min:1,max:3,val:2}],
 render:s=>{
  const o=[[1,1],[3,1],[1,3]],tx=+s.tx,ty=+s.ty,k=+s.k;
  const f={tr:p=>[p[0]+tx,p[1]+ty],rx:p=>[p[0],-p[1]],ry:p=>[-p[0],p[1]],rot:p=>[-p[0],-p[1]],en:p=>[p[0]*k,p[1]*k]}[s.mode],im=o.map(f);
  const desc={tr:`Translation: ${Math.abs(tx)} ${tx>=0?'right':'left'}, ${Math.abs(ty)} ${ty>=0?'up':'down'}`,rx:'Reflection in the x-axis: y changes sign',ry:'Reflection in the y-axis: x changes sign',rot:'Rotation of 180° about the origin: both coordinates change sign',en:`Enlargement, scale factor ${k}: multiply coordinates by ${k}`}[s.mode];
  return gridSvg({R:9,polys:[{pts:o,color:'#4f46e5',names:['A','B','C']},{pts:im,color:'#d9480f',names:["A'","B'","C'"]}]})+`<div class="wout"><b>${desc}</b><br>A(1,1)→A'(${im[0]}) · B(3,1)→B'(${im[1]}) · C(1,3)→C'(${im[2]})${s.mode==='en'?`<br>Area: 2 → ${2*k*k} (× ${k*k})`:''}</div>`}};

// ---- 15 area & volume ----
W.area={title:'Area & volume builder',controls:[
 {id:'sh',label:'Shape',type:'select',opts:[['rect','Rectangle'],['tri','Triangle'],['par','Parallelogram'],['cub','Cuboid']],val:'rect'},
 {id:'b',label:'Base / length',min:1,max:12,val:6},{id:'h',label:'Height',min:1,max:10,val:4},{id:'d',label:'Depth (cuboid)',min:1,max:8,val:3}],
 render:s=>{
  const b=+s.b,h=+s.h,d=+s.d,sc=Math.min(260/(b+(s.sh==='par'?2:0)),150/h,24);let g='';const ox=40,oy=185;
  if(s.sh==='rect'){for(let i=0;i<b;i++)for(let j=0;j<h;j++)g+=`<rect x="${ox+i*sc}" y="${oy-(j+1)*sc}" width="${sc}" height="${sc}" fill="#c7d2fe" stroke="#fff"/>`;g+=`<rect x="${ox}" y="${oy-h*sc}" width="${b*sc}" height="${h*sc}" fill="none" stroke="#111827" stroke-width="2.4"/>`;}
  else if(s.sh==='tri'){g+=`<polygon points="${ox},${oy} ${ox+b*sc},${oy} ${ox+b*sc*.3},${oy-h*sc}" fill="#c7d2fe" stroke="#111827" stroke-width="2.4"/><line x1="${ox+b*sc*.3}" y1="${oy-h*sc}" x2="${ox+b*sc*.3}" y2="${oy}" stroke="#d9480f" stroke-dasharray="4 3" stroke-width="2"/>`;}
  else if(s.sh==='par'){const sl=2*sc;g+=`<polygon points="${ox},${oy} ${ox+b*sc},${oy} ${ox+b*sc+sl},${oy-h*sc} ${ox+sl},${oy-h*sc}" fill="#c7d2fe" stroke="#111827" stroke-width="2.4"/><line x1="${ox+b*sc}" y1="${oy-h*sc}" x2="${ox+b*sc}" y2="${oy}" stroke="#d9480f" stroke-dasharray="4 3" stroke-width="2"/>`;}
  else{const s2=Math.min(200/b,110/h,22),dx=d*s2*.55,dy=d*s2*.4,W2=b*s2,H2=h*s2;g+=`<polygon points="${ox},${oy-H2} ${ox+dx},${oy-H2-dy} ${ox+W2+dx},${oy-H2-dy} ${ox+W2},${oy-H2}" fill="#e0e7ff" stroke="#111827" stroke-width="2"/><polygon points="${ox+W2},${oy-H2} ${ox+W2+dx},${oy-H2-dy} ${ox+W2+dx},${oy-dy} ${ox+W2},${oy}" fill="#a5b4fc" stroke="#111827" stroke-width="2"/><rect x="${ox}" y="${oy-H2}" width="${W2}" height="${H2}" fill="#c7d2fe" stroke="#111827" stroke-width="2"/>`;}
  const out={rect:`Area = ${b} × ${h} = <b>${b*h}</b> cm²  (Perimeter ${2*(b+h)} cm)`,tri:`Area = ½ × ${b} × ${h} = <b>${b*h/2}</b> cm²`,par:`Area = ${b} × ${h} = <b>${b*h}</b> cm²`,cub:`Volume = ${b} × ${h} × ${d} = <b>${b*h*d}</b> cm³<br>Surface area = 2(${b*h} + ${b*d} + ${h*d}) = <b>${2*(b*h+b*d+h*d)}</b> cm²`}[s.sh];
  return svgWrap(g,360,205)+`<div class="wout">${out}</div>`}};

// ---- 16 interpreting results ----
W.interpret={title:'Pie chart & bar chart together',controls:CATS_W().map((c,i)=>({id:'v'+i,label:c,min:2,max:40,val:[12,18,30,20][i]})),
 render:s=>{
  const names=CATS_W(),v=names.map((_,i)=>+s['v'+i]),T=v.reduce((a,b)=>a+b,0);let g='',a0=90;
  v.forEach((x,i)=>{const a1=a0+x/T*360,[x0,y0]=P(100,100,85,a0),[x1,y1]=P(100,100,85,a1);g+=`<path d="M100,100 L${f1(x0)},${f1(y0)} A85,85 0 ${x/T>.5?1:0} 0 ${f1(x1)},${f1(y1)} Z" fill="${PAL[i]}" stroke="#fff" stroke-width="2"/>`;a0=a1});
  const rows=v.map((x,i)=>`<tr><td style="color:${PAL[i]}"><b>${names[i]}</b></td><td>${x}</td><td>${rd(x/T*360,1)}°</td><td>${rd(x/T*100,1)}%</td></tr>`).join('');
  return `<div style="display:flex;flex-wrap:wrap;gap:1rem;align-items:center;justify-content:center">${svgWrap(g,200,200)}${barSvg(names,v,{max:40,w:260,h:190})}</div><div class="wout"><table class="pvt"><tr><th>Item</th><th>Frequency</th><th>Angle</th><th>%</th></tr>${rows}<tr><td><b>Total</b></td><td><b>${T}</b></td><td>360°</td><td>100%</td></tr></table><small>Angle = frequency ÷ ${T} × 360°</small></div>`}};
function CATS_W(){return ['Football','Swimming','Tennis','Chess']}
