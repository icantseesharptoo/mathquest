/* Whiteboard: pen, line, dot, text, eraser, colours, sizes, undo, backgrounds, save.
   Task mode: a coordinate grid with a task (plot points, draw a line, reflect, translate, …).
   Dots and lines drawn in task mode snap to the grid and can be checked. */
const WB={canvas:null,hist:[],color:'#111827',size:4,tool:'pen',bg:'grid',task:null,taskOn:false,marks:[],snap:true,type:'random',own:''};
const TASK_TYPES=[['random','Random task'],['points','Plot points'],['shape','Plot and join a shape'],['line','Draw y = mx + c'],['hv','Draw x = a or y = b'],
  ['midpoint','Midpoint'],['reflect','Reflection'],['translate','Translation'],['rotate','Rotation'],['own','My own task']];
const ptxt=(x,y)=>`(${fmtNum(x)}, ${fmtNum(y)})`;
const yEq=(m,c)=>{const ms=m===1?'':m===-1?'−':m===.5?'½':m===-.5?'−½':fmtNum(m);return `y = ${m?ms+'x':''}${c?(m?(c>0?' + ':' − ')+Math.abs(c):fmtNum(c)):(m?'':'0')}`};

// ---------- tasks ----------
function makeTask(type,R,seed){
  const r=mkR(seed),I=(a,b)=>r.int(a,b),nz=(a,b)=>{let v=0;while(!v)v=I(a,b);return v};
  const pt=(lim=R)=>[I(-lim,lim),I(-lim,lim)],key=p=>p.join(','),L='ABCDEFG';
  if(type==='random')type=r.pick(TASK_TYPES.map(t=>t[0]).filter(t=>t!=='random'&&t!=='own'));
  const T={type,given:[],dots:[],segs:[],lines:[]};
  if(type==='points'){const s=new Set();while(s.size<4){const p=pt();if(r.chance(.25))p[r.int(0,1)]=0;s.add(key(p))}
    T.dots=[...s].map((k,i)=>{const [x,y]=k.split(',').map(Number);return {x,y,l:L[i]}});T.text=`Plot the points ${T.dots.map(d=>`${d.l}${ptxt(d.x,d.y)}`).join(', ')}.`}
  else if(type==='shape'){
    const kind=r.pick(['rectangle','square','parallelogram','right-angled triangle','isosceles triangle']);let P;
    const a=I(-R,R-4),b=I(-R,R-4);
    if(kind==='rectangle'){const w=I(2,Math.min(6,R-a)),h=nz(2,Math.min(4,R-b));P=[[a,b],[a+w,b],[a+w,b+h],[a,b+h]]}
    else if(kind==='square'){const s=I(2,Math.min(4,R-a,R-b));P=[[a,b],[a+s,b],[a+s,b+s],[a,b+s]]}
    else if(kind==='parallelogram'){const w=I(2,4),s=I(1,2),h=I(2,3);P=[[a-2,b],[a-2+w,b],[a-2+w+s,b+h],[a-2+s,b+h]]}
    else if(kind==='right-angled triangle'){const w=I(2,5),h=I(2,4);P=[[a,b],[a+w,b],[a,b+h]]}
    else{const w=I(1,3),h=I(2,5);P=[[a-w,b],[a+w,b],[a,b+h]]}
    P=P.map(([x,y])=>[Math.max(-R,Math.min(R,x)),Math.max(-R,Math.min(R,y))]);
    T.dots=P.map(([x,y],i)=>({x,y,l:L[i]}));T.segs=P.map((p,i)=>[...p,...P[(i+1)%P.length]]);T.kind=kind;
    T.text=`Plot ${T.dots.map(d=>`${d.l}${ptxt(d.x,d.y)}`).join(', ')} and join them in order back to ${L[0]}. What shape have you drawn?`}
  else if(type==='line'){const m=r.pick([1,2,3,-1,-2,-3,.5,-.5]),c=I(-4,4);T.lines=[{m,c}];T.text=`Draw the line ${yEq(m,c)}. Mark at least two points on it, then join them with a long straight line.`}
  else if(type==='hv'){const v=nz(-R+1,R-1);if(r.chance(.5)){T.lines=[{v:v}];T.text=`Draw the line x = ${fmtNum(v)}.`}else{T.lines=[{m:0,c:v}];T.text=`Draw the line y = ${fmtNum(v)}.`}}
  else if(type==='midpoint'){let A,B;do{A=pt();B=pt()}while((A[0]+B[0])%2||(A[1]+B[1])%2||key(A)===key(B));
    T.given=[{x:A[0],y:A[1],l:'A'},{x:B[0],y:B[1],l:'B'}];T.segs0=[[...A,...B]];T.dots=[{x:(A[0]+B[0])/2,y:(A[1]+B[1])/2,l:'M'}];T.text=`Plot M, the midpoint of A${ptxt(...A)} and B${ptxt(...B)}.`}
  else if(type==='reflect'){const m=r.pick(['y','x','yx','xk']);let P,Q,txt;
    for(;;){P=[nz(-R,R),nz(-R,R)];if(m==='y'){Q=[-P[0],P[1]];txt='the y-axis'}else if(m==='x'){Q=[P[0],-P[1]];txt='the x-axis'}else if(m==='yx'){Q=[P[1],P[0]];txt='the line y = x'}
      else{const k=nz(-3,3);Q=[2*k-P[0],P[1]];txt=`the line x = ${fmtNum(k)}`;T.mirror={v:k}}if(Math.abs(Q[0])<=R&&Math.abs(Q[1])<=R&&key(P)!==key(Q))break}
    if(m==='yx')T.mirror={m:1,c:0};T.given=[{x:P[0],y:P[1],l:'P'}];T.dots=[{x:Q[0],y:Q[1],l:'P′'}];T.text=`Reflect P${ptxt(...P)} in ${txt}. Plot P′.`}
  else if(type==='translate'){let P,v;do{P=pt();v=[nz(-5,5),nz(-5,5)]}while(Math.abs(P[0]+v[0])>R||Math.abs(P[1]+v[1])>R);
    T.given=[{x:P[0],y:P[1],l:'P'}];T.dots=[{x:P[0]+v[0],y:P[1]+v[1],l:'P′'}];T.text=`Translate P${ptxt(...P)} by the vector <span class="cvec"><span>${fmtNum(v[0])}</span><span>${fmtNum(v[1])}</span></span>. Plot P′.`}
  else if(type==='rotate'){const k=r.pick(['cw','acw','180']);let P;do{P=pt()}while(!P[0]||!P[1]);
    const Q=k==='cw'?[P[1],-P[0]]:k==='acw'?[-P[1],P[0]]:[-P[0],-P[1]];
    T.given=[{x:P[0],y:P[1],l:'P'}];T.dots=[{x:Q[0],y:Q[1],l:'P′'}];T.text=`Rotate P${ptxt(...P)} ${k==='180'?'180°':`90° ${k==='cw'?'clockwise':'anticlockwise'}`} about the origin O. Plot P′.`}
  else{T.type='own';T.text=''}
  T.label=(TASK_TYPES.find(t=>t[0]===T.type)||[])[1];
  return T;
}
// distance from a point to an infinite line {m,c} or {v}
const lineDist=(L,x,y)=>L.v!=null?Math.abs(x-L.v):Math.abs(L.m*x-y+L.c)/Math.hypot(L.m,1);
function checkTask(T,marks){
  const dots=marks.filter(m=>m.t==='dot'),segs=marks.filter(m=>m.t==='line'),tol=.3,used=new Set();let need=0,got=0;
  marks.forEach(m=>m.ok=null);
  for(const d of T.dots){need++;const k=dots.find(m=>Math.hypot(m.x-d.x,m.y-d.y)<tol);if(k){got++;k.ok=true;used.add(k)}}
  for(const s of T.segs){need++;const same=(m,a,b,c,d)=>Math.hypot(m.x1-a,m.y1-b)<tol&&Math.hypot(m.x2-c,m.y2-d)<tol;
    const k=segs.find(m=>same(m,...s)||same(m,s[2],s[3],s[0],s[1]));if(k){got++;k.ok=true;used.add(k)}}
  for(const L of T.lines){need++;const on=(x,y)=>lineDist(L,x,y)<.25;
    const k=segs.find(m=>on(m.x1,m.y1)&&on(m.x2,m.y2)&&Math.hypot(m.x2-m.x1,m.y2-m.y1)>=3);if(k){got++;k.ok=true;used.add(k)}
    dots.forEach(m=>{if(on(m.x,m.y)){m.ok=true;used.add(m)}})}
  const extra=marks.filter(m=>!used.has(m));extra.forEach(m=>m.ok=false);
  return {need,got,extra:extra.length,all:got===need&&!extra.length};
}

// ---------- the board ----------
function whiteboard(){
  const cols=['#111827','#2455d6','#dc2626','#16a34a','#ea580c','#7c3aed'];
  const o=openOverlay('wb',`<div class="ovbar wbbar"><b>Whiteboard</b>
    <span class="wbgrp">${cols.map(c=>`<button class="wbc" data-c="${c}" style="background:${c}" title="Colour"></button>`).join('')}</span>
    <span class="wbgrp">${[2,4,8,16].map(s=>`<button class="wbs" data-s="${s}" title="Pen size"><i style="width:${s+2}px;height:${s+2}px"></i></button>`).join('')}</span>
    <span class="wbgrp"><button data-t="pen">✏️ Pen</button><button data-t="line">╱ Line</button><button data-t="dot">● Dot</button><button data-t="text">T Text</button><button data-t="eraser">🧽 Eraser</button></span>
    <span class="wbgrp"><button data-a="undo">↶ Undo</button><button data-a="clear">🗑 Clear</button><button data-a="bg">▦ Grid</button><button data-a="task">🎯 Task</button><button data-a="save">💾 Save</button></span>
    <span class="sp"></span>${timerHTML()}<button class="btn" data-close>Close ✕</button></div>
    <div class="wbtaskbar" hidden><select class="wbtype" aria-label="Task type">${TASK_TYPES.map(([k,n])=>`<option value="${k}">${n}</option>`).join('')}</select>
      <div class="wbtasktxt"></div><input class="wbown" placeholder="Type the task for the class" hidden>
      <span class="wbres"></span><button class="btn alt" data-k="new">New task</button><button class="btn" data-k="check">Check ✓</button><button class="btn alt" data-k="answer">Show answer</button>
      <button class="ghost" data-k="snap" title="Dots and lines snap to the grid">Snap</button></div>
    <div class="wbarea"><canvas class="wbgridc"></canvas><canvas class="wbmarks"></canvas></div>`);
  const area=$('.wbarea',o),dpr=window.devicePixelRatio||1,gc=$('.wbgridc',o),mk=$('.wbmarks',o),tb=$('.wbtaskbar',o);
  if(!WB.canvas){WB.canvas=document.createElement('canvas');WB.canvas.className='wbcanvas'}
  const cv=WB.canvas;area.insertBefore(cv,mk);
  let G={u:30,ox:0,oy:0,xm:8,ym:8,R:6},showAns=false,preview=null;
  const fit=()=>{const w=area.clientWidth,h=area.clientHeight;
    for(const c of [gc,mk]){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);c.style.width=w+'px';c.style.height=h+'px'}
    const u=Math.max(18,Math.floor(Math.min(w,h)/16));G={u,ox:Math.round(w/2),oy:Math.round(h/2),xm:Math.floor((w/2-10)/u),ym:Math.floor((h/2-10)/u)};G.R=Math.max(3,Math.min(6,G.xm-1,G.ym-1));
    if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){const old=cv.width?cv.getContext('2d').getImageData(0,0,cv.width,cv.height):null;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);cv.style.width=w+'px';cv.style.height=h+'px';if(old)cv.getContext('2d').putImageData(old,0,0)}
    drawGrid();drawMarks()};
  const P=(x,y)=>[(G.ox+x*G.u)*dpr,(G.oy-y*G.u)*dpr];
  const toG=e=>{const b=cv.getBoundingClientRect();let x=(e.clientX-b.left-G.ox)/G.u,y=(G.oy-(e.clientY-b.top))/G.u;if(WB.snap){x=Math.round(x);y=Math.round(y)}return [rd(x,2),rd(y,2)]};
  function drawGrid(){
    const c=gc.getContext('2d');c.clearRect(0,0,gc.width,gc.height);if(!WB.taskOn)return;
    const {u,xm,ym}=G,step=u<26?2:1;c.lineWidth=dpr;c.font=`${Math.max(11,u*.4)*dpr}px "Segoe UI",Arial,sans-serif`;
    for(let i=-xm;i<=xm;i++){c.strokeStyle=i?'#e2e8f0':'#334155';c.lineWidth=(i?1:2)*dpr;c.beginPath();c.moveTo(...P(i,ym+.4));c.lineTo(...P(i,-ym-.4));c.stroke()}
    for(let j=-ym;j<=ym;j++){c.strokeStyle=j?'#e2e8f0':'#334155';c.lineWidth=(j?1:2)*dpr;c.beginPath();c.moveTo(...P(-xm-.4,j));c.lineTo(...P(xm+.4,j));c.stroke()}
    c.fillStyle='#475569';c.textAlign='center';c.textBaseline='top';
    for(let i=-xm;i<=xm;i++)if(i&&i%step===0){const [x,y]=P(i,0);c.fillText(fmtNum(i),x,y+4*dpr)}
    c.textAlign='right';c.textBaseline='middle';for(let j=-ym;j<=ym;j++)if(j&&j%step===0){const [x,y]=P(0,j);c.fillText(fmtNum(j),x-5*dpr,y)}
    c.textAlign='right';c.textBaseline='top';c.fillText('0',P(0,0)[0]-5*dpr,P(0,0)[1]+4*dpr);
    c.font=`italic 600 ${Math.max(13,u*.5)*dpr}px "Segoe UI",Arial,sans-serif`;c.textAlign='left';c.fillText('x',P(xm+.15,0)[0],P(0,-.2)[1]);c.textBaseline='bottom';c.fillText('y',P(.25,0)[0],P(0,ym+.4)[1]+16*dpr)}
  function dotAt(c,x,y,r,fill,ring){const [px,py]=P(x,y);c.beginPath();c.arc(px,py,r*dpr,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill()}if(ring){c.strokeStyle=ring;c.lineWidth=3*dpr;c.stroke()}}
  function label(c,x,y,t,col){const [px,py]=P(x,y);c.font=`700 ${Math.max(14,G.u*.5)*dpr}px "Segoe UI",Arial,sans-serif`;c.fillStyle=col;c.textAlign='left';c.textBaseline='bottom';c.fillText(t,px+6*dpr,py-4*dpr)}
  function infLine(c,L){const a=L.v!=null?[[L.v,-G.ym-1],[L.v,G.ym+1]]:[[-G.xm-1,L.m*(-G.xm-1)+L.c],[G.xm+1,L.m*(G.xm+1)+L.c]];c.beginPath();c.moveTo(...P(...a[0]));c.lineTo(...P(...a[1]));c.stroke()}
  function drawMarks(){
    const c=mk.getContext('2d');c.clearRect(0,0,mk.width,mk.height);if(!WB.taskOn)return;const T=WB.task;
    c.lineCap='round';
    if(T&&T.mirror){c.strokeStyle='#94a3b8';c.setLineDash([8*dpr,6*dpr]);c.lineWidth=2*dpr;infLine(c,T.mirror);c.setLineDash([])}
    if(T&&T.segs0)for(const s of T.segs0){c.strokeStyle='#2455d6';c.lineWidth=2*dpr;c.beginPath();c.moveTo(...P(s[0],s[1]));c.lineTo(...P(s[2],s[3]));c.stroke()}
    if(T)for(const g of T.given){dotAt(c,g.x,g.y,6,'#2455d6');label(c,g.x,g.y,g.l,'#2455d6')}
    for(const m of WB.marks.concat(preview?[preview]:[])){
      const col=m.ok===true?'#16a34a':m.ok===false?'#dc2626':m.c;
      if(m.t==='line'){c.strokeStyle=col;c.lineWidth=(m.w||3)*dpr;c.beginPath();c.moveTo(...P(m.x1,m.y1));c.lineTo(...P(m.x2,m.y2));c.stroke()}
      else dotAt(c,m.x,m.y,6,col,m.ok!=null?(m.ok?'#bbf7d0':'#fecaca'):null)}
    if(showAns&&T){c.strokeStyle='#16a34a';c.fillStyle='#16a34a';c.lineWidth=3*dpr;c.setLineDash([10*dpr,7*dpr]);
      for(const L of T.lines)infLine(c,L);for(const s of T.segs){c.beginPath();c.moveTo(...P(s[0],s[1]));c.lineTo(...P(s[2],s[3]));c.stroke()}c.setLineDash([]);
      for(const d of T.dots){dotAt(c,d.x,d.y,9,null,'#16a34a');label(c,d.x,d.y,d.l,'#16a34a')}}
  }
  const ctx=cv.getContext('2d');
  const push=e=>{WB.hist.push(e);if(WB.hist.length>40)WB.hist.shift()};
  const snapImg=()=>push({img:ctx.getImageData(0,0,cv.width,cv.height)});
  const snapMarks=()=>push({marks:WB.marks.map(m=>({...m}))});
  const mark=()=>{$$('.wbc',o).forEach(b=>b.classList.toggle('on',b.dataset.c===WB.color));$$('.wbs',o).forEach(b=>b.classList.toggle('on',+b.dataset.s===WB.size));
    $$('[data-t]',o).forEach(b=>b.classList.toggle('on',b.dataset.t===WB.tool));area.dataset.tool=WB.tool;area.dataset.bg=WB.taskOn?'plain':WB.bg;
    $('[data-a=task]',o).classList.toggle('on',WB.taskOn);$('[data-k=snap]',tb).classList.toggle('on',WB.snap);tb.hidden=!WB.taskOn};
  const res=$('.wbres',tb);
  const showTask=()=>{const T=WB.task,own=T.type==='own';$('.wbtype',tb).value=WB.type;
    $('.wbtasktxt',tb).innerHTML=own?'':`${WB.type==='random'?`<span class="wbtl">${T.label}</span> `:''}${T.text}`;$('.wbown',tb).hidden=!own;$('.wbown',tb).value=WB.own;
    $('[data-k=check]',tb).hidden=$('[data-k=answer]',tb).hidden=own;res.textContent='';res.className='wbres';drawMarks()};
  const newTask=()=>{WB.task=makeTask(WB.type,G.R,rndSeed());WB.marks=[];showAns=false;WB.hist=WB.hist.filter(h=>!h.marks);showTask()};
  $$('.wbc',o).forEach(b=>b.onclick=()=>{WB.color=b.dataset.c;if(WB.tool==='eraser')WB.tool='pen';mark()});
  $$('.wbs',o).forEach(b=>b.onclick=()=>{WB.size=+b.dataset.s;mark()});
  $$('[data-t]',o).forEach(b=>b.onclick=()=>{WB.tool=b.dataset.t;mark()});
  $('[data-a=undo]',o).onclick=()=>{const e=WB.hist.pop();if(!e)return;if(e.img)ctx.putImageData(e.img,0,0);if(e.marks){WB.marks=e.marks;WB.marks.forEach(m=>m.ok=null)}drawMarks()};
  $('[data-a=clear]',o).onclick=()=>{push({img:ctx.getImageData(0,0,cv.width,cv.height),marks:WB.marks.map(m=>({...m}))});ctx.clearRect(0,0,cv.width,cv.height);WB.marks=[];showAns=false;drawMarks()};
  $('[data-a=bg]',o).onclick=()=>{if(WB.taskOn)return;WB.bg={grid:'plain',plain:'dots',dots:'grid'}[WB.bg];mark()};
  $('[data-a=task]',o).onclick=()=>{WB.taskOn=!WB.taskOn;if(WB.taskOn){if(!WB.task)WB.task=makeTask(WB.type,G.R,rndSeed());if(WB.tool==='pen')WB.tool='dot';showTask()}mark();fit()};
  $('[data-a=save]',o).onclick=()=>{const c2=document.createElement('canvas');c2.width=cv.width;c2.height=cv.height;const x=c2.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c2.width,c2.height);
    if(WB.taskOn)x.drawImage(gc,0,0);x.drawImage(cv,0,0);if(WB.taskOn)x.drawImage(mk,0,0);const a=document.createElement('a');a.download='whiteboard.png';a.href=c2.toDataURL('image/png');a.click()};
  $('.wbtype',tb).onchange=e=>{WB.type=e.target.value;newTask()};
  $('.wbown',tb).oninput=e=>{WB.own=e.target.value};$('.wbown',tb).onkeydown=e=>e.stopPropagation();
  $('[data-k=new]',tb).onclick=newTask;
  $('[data-k=snap]',tb).onclick=()=>{WB.snap=!WB.snap;mark()};
  $('[data-k=answer]',tb).onclick=()=>{showAns=!showAns;$('[data-k=answer]',tb).textContent=showAns?'Hide answer':'Show answer';drawMarks()};
  $('[data-k=check]',tb).onclick=()=>{const r=checkTask(WB.task,WB.marks);
    res.className='wbres '+(r.all?'ok':'no');res.textContent=r.all?'✓ All correct!':`${r.got} of ${r.need} correct${r.extra?` · ${r.extra} wrong mark${r.extra>1?'s':''} (red)`:''}`;drawMarks()};
  const pos=e=>{const b=cv.getBoundingClientRect();return [(e.clientX-b.left)*dpr,(e.clientY-b.top)*dpr]};
  let down=false,last=null,start=null,base=null,gStart=null;
  const setPen=w=>{ctx.lineCap='round';ctx.lineJoin='round';ctx.globalCompositeOperation=WB.tool==='eraser'?'destination-out':'source-over';ctx.strokeStyle=WB.color;ctx.lineWidth=w*dpr};
  const eraseMarks=e=>{const [x,y]=(()=>{const b=cv.getBoundingClientRect();return [(e.clientX-b.left-G.ox)/G.u,(G.oy-(e.clientY-b.top))/G.u]})(),r=WB.size*2.5/G.u+.25;
    const segD=m=>{const dx=m.x2-m.x1,dy=m.y2-m.y1,t=Math.max(0,Math.min(1,((x-m.x1)*dx+(y-m.y1)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(m.x1+t*dx-x,m.y1+t*dy-y)};
    const n=WB.marks.length;WB.marks=WB.marks.filter(m=>(m.t==='dot'?Math.hypot(m.x-x,m.y-y):segD(m))>r);if(WB.marks.length!==n)drawMarks()};
  cv.onpointerdown=e=>{
    if(WB.tool==='text'){e.preventDefault();return textAt(e)}
    try{cv.setPointerCapture(e.pointerId)}catch(err){}
    if(WB.taskOn&&(WB.tool==='dot'||WB.tool==='line')){
      const g=toG(e);if(WB.tool==='dot'){snapMarks();WB.marks.push({t:'dot',x:g[0],y:g[1],c:WB.color});drawMarks();return}
      down=true;gStart=g;preview={t:'line',x1:g[0],y1:g[1],x2:g[0],y2:g[1],c:WB.color};drawMarks();return}
    if(WB.tool==='dot'){snapImg();const [x,y]=pos(e);ctx.globalCompositeOperation='source-over';ctx.fillStyle=WB.color;ctx.beginPath();ctx.arc(x,y,(WB.size*1.2+3)*dpr,0,Math.PI*2);ctx.fill();return}
    down=true;snapImg();if(WB.taskOn&&WB.tool==='eraser'){WB.hist[WB.hist.length-1].marks=WB.marks.map(m=>({...m}));eraseMarks(e)}
    last=pos(e);start=last;base=ctx.getImageData(0,0,cv.width,cv.height);
    setPen(WB.tool==='eraser'?WB.size*5:WB.size);ctx.beginPath();ctx.arc(last[0],last[1],ctx.lineWidth/2,0,Math.PI*2);if(WB.tool==='pen'){ctx.fillStyle=WB.color;ctx.fill()}
  };
  cv.onpointermove=e=>{if(!down)return;
    if(preview){const g=toG(e);preview.x2=g[0];preview.y2=g[1];drawMarks();return}
    if(WB.tool==='line'){ctx.putImageData(base,0,0);const p=pos(e);setPen(WB.size);ctx.beginPath();ctx.moveTo(...start);ctx.lineTo(...p);ctx.stroke();return}
    if(WB.taskOn&&WB.tool==='eraser')eraseMarks(e);
    const evs=e.getCoalescedEvents?e.getCoalescedEvents():[];if(!evs.length)evs.push(e);for(const ev of evs){const p=pos(ev),pr=ev.pressure&&ev.pointerType==='pen'?.5+ev.pressure:1;setPen((WB.tool==='eraser'?WB.size*5:WB.size)*pr);ctx.beginPath();ctx.moveTo(...last);ctx.lineTo(...p);ctx.stroke();last=p}};
  cv.onpointerup=cv.onpointercancel=()=>{
    if(preview){const m=preview;preview=null;if(Math.hypot(m.x2-m.x1,m.y2-m.y1)>=.5){snapMarks();WB.marks.push(m)}drawMarks()}
    down=false;ctx.globalCompositeOperation='source-over'};
  function textAt(e){
    const b=area.getBoundingClientRect(),inp=document.createElement('input');inp.className='wbtext';inp.style.left=(e.clientX-b.left)+'px';inp.style.top=(e.clientY-b.top-14)+'px';inp.style.color=WB.color;inp.style.fontSize=(16+WB.size*2)+'px';inp.placeholder='Type, then Enter';
    area.appendChild(inp);setTimeout(()=>inp.focus(),0);
    let done=false;const commit=()=>{if(done)return;done=true;if(inp.value.trim()){snapImg();ctx.globalCompositeOperation='source-over';ctx.fillStyle=WB.color;ctx.font=`600 ${(16+WB.size*2)*dpr}px "Segoe UI",Arial,sans-serif`;ctx.textBaseline='middle';ctx.fillText(inp.value,(e.clientX-b.left)*dpr,(e.clientY-b.top)*dpr)}inp.remove()};
    inp.onkeydown=ev=>{if(ev.key==='Enter')commit();else if(ev.key==='Escape')inp.remove();ev.stopPropagation()};inp.onblur=commit;
  }
  if(WB.taskOn&&WB.task)showTask();
  mark();fit();const ro=new ResizeObserver(fit);ro.observe(area);o.cleanup=()=>ro.disconnect();
  o.G=()=>G;o.P=P;
}
