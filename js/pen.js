/* Pen mode: draw on top of the slides. The drawing on each slide is kept while the lesson is open,
   and it moves with the slide when the slide scrolls. Turn it on with ✏️ Pen or the P key. */
const PEN_COLS=['#e03131','#1c7ed6','#2f9e44','#f08c00','#111111','#ffffff'];
const PEN={on:false,col:PEN_COLS[0],w:4,mode:'pen',ink:{},cv:null,undo:[]};

function penHTML(){return `<div class="penbar" hidden>${PEN_COLS.map(c=>`<button class="pcol" data-col="${c}" style="--c:${c}" title="Colour"></button>`).join('')}
  <span class="psep"></span><button data-w="3" title="Thin">●</button><button data-w="8" title="Thick" class="pbig">●</button>
  <button data-m="hi" title="Highlighter">🖍</button><button data-m="er" title="Eraser: touch a line to remove it">🧽</button>
  <span class="psep"></span><button data-a="undo" title="Undo (Ctrl+Z)">↶</button><button data-a="clear" title="Clear this slide">🗑</button><button data-a="off" class="pdone" title="Stop drawing (P)">Done</button></div>`}

// set up the pen for a new deck: the canvas sits over the stage
function penMount(deck){
  PEN.on=false;PEN.ink={};PEN.undo=[];
  const st=$('#stage',deck),cv=document.createElement('canvas');cv.className='pencv';st.parentNode.insertBefore(cv,st.nextSibling);PEN.cv=cv;
  const bar=$('.penbar',deck),ctx=cv.getContext('2d');
  const W=()=>st.clientWidth||1;
  const fit=()=>{const r=window.devicePixelRatio||1;cv.style.left=st.offsetLeft+'px';cv.style.top=st.offsetTop+'px';cv.style.width=st.clientWidth+'px';cv.style.height=st.clientHeight+'px';
    const w=Math.round(st.clientWidth*r),h=Math.round(st.clientHeight*r);if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}penDraw()};
  PEN.fit=fit;
  // points are kept as fractions of the stage width, measured from the top of the slide, so they follow scrolling and resizing
  const pt=e=>{const b=cv.getBoundingClientRect(),w=W();return [(e.clientX-b.left)/w,(e.clientY-b.top+st.scrollTop)/w]};
  const strokes=()=>PEN.ink[DECK.i]||(PEN.ink[DECK.i]=[]);
  const near=(s,p)=>{const r=Math.max(.012,s.w/W());return s.p.some(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<r)};
  let cur=null;
  cv.addEventListener('pointerdown',e=>{if(!PEN.on||!DECK)return;e.preventDefault();cv.setPointerCapture(e.pointerId);const p=pt(e);
    if(PEN.mode==='er'){cur={er:true};erase(p);return}
    cur={c:PEN.col,w:PEN.mode==='hi'?Math.max(18,PEN.w*3):PEN.w,hi:PEN.mode==='hi',p:[p],sw:W()};strokes().push(cur);PEN.undo.push({i:DECK.i,add:cur});penDraw()});
  cv.addEventListener('pointermove',e=>{if(!cur)return;const c=e.getCoalescedEvents&&e.getCoalescedEvents(),evs=c&&c.length?c:[e];
    if(cur.er)return evs.forEach(x=>erase(pt(x)));evs.forEach(x=>cur.p.push(pt(x)));penDraw()});
  const end=()=>{cur=null};cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);
  const erase=p=>{const s=strokes(),k=s.findIndex(x=>near(x,p));if(k<0)return;PEN.undo.push({i:DECK.i,del:s[k],at:k});s.splice(k,1);penDraw()};
  // the wheel still scrolls the slide while drawing
  cv.addEventListener('wheel',e=>{st.scrollTop+=e.deltaY;e.preventDefault()},{passive:false});
  st.addEventListener('scroll',penDraw);
  if(window.ResizeObserver)new ResizeObserver(fit).observe(st);else addEventListener('resize',fit);
  bar.onclick=e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.col){PEN.col=b.dataset.col;if(PEN.mode==='er')PEN.mode='pen'}
    else if(b.dataset.w){PEN.w=+b.dataset.w;if(PEN.mode==='er')PEN.mode='pen'}
    else if(b.dataset.m)PEN.mode=PEN.mode===b.dataset.m?'pen':b.dataset.m;
    else if(b.dataset.a==='undo')penUndo();
    else if(b.dataset.a==='clear'){const s=strokes();if(s.length){PEN.undo.push({i:DECK.i,clear:s.slice()});s.length=0;penDraw()}}
    else if(b.dataset.a==='off')penToggle(false);
    penBar()};
  penBar();fit();
}
function penBar(){const d=$('#deck');if(!d)return;const bar=$('.penbar',d);
  $$('[data-col]',bar).forEach(b=>b.classList.toggle('on',PEN.mode!=='er'&&b.dataset.col===PEN.col));
  $$('[data-w]',bar).forEach(b=>b.classList.toggle('on',+b.dataset.w===PEN.w));
  $$('[data-m]',bar).forEach(b=>b.classList.toggle('on',b.dataset.m===PEN.mode));
  const pb=$('#pen',d);if(pb){pb.classList.toggle('on',PEN.on);pb.setAttribute('aria-pressed',PEN.on)}
  bar.hidden=!PEN.on;d.classList.toggle('penon',PEN.on);
  if(PEN.cv)PEN.cv.dataset.mode=PEN.mode;
}
function penToggle(v){if(!$('#deck')||!PEN.cv)return;PEN.on=v===undefined?!PEN.on:v;penBar();PEN.fit&&PEN.fit()}
function penUndo(){const u=PEN.undo.pop();if(!u)return;const s=PEN.ink[u.i]||(PEN.ink[u.i]=[]);
  if(u.add){const k=s.indexOf(u.add);if(k>=0)s.splice(k,1)}else if(u.del)s.splice(u.at,0,u.del);else if(u.clear)s.push(...u.clear);
  if(DECK&&u.i!==DECK.i)go(u.i);penDraw()}
function penDraw(){
  const cv=PEN.cv;if(!cv||!cv.isConnected||!DECK)return;const st=$('#stage'),ctx=cv.getContext('2d'),r=window.devicePixelRatio||1,w=st.clientWidth||1,y0=st.scrollTop;
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);ctx.setTransform(r,0,0,r,0,0);ctx.lineCap='round';ctx.lineJoin='round';
  for(const s of PEN.ink[DECK.i]||[]){
    ctx.globalAlpha=s.hi?.35:1;ctx.strokeStyle=s.c;ctx.lineWidth=s.w*w/(s.sw||w);ctx.beginPath();
    s.p.forEach(([x,y],k)=>{const X=x*w,Y=y*w-y0;k?ctx.lineTo(X,Y):ctx.moveTo(X,Y)});
    if(s.p.length===1){const [x,y]=s.p[0];ctx.lineTo(x*w+.01,y*w-y0)}
    ctx.stroke();
  }
  ctx.globalAlpha=1;
}
document.addEventListener('keydown',e=>{
  if(!$('#deck')||$('.ovl')||e.target.isContentEditable||['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;
  if((e.key==='p'||e.key==='P')&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();penToggle()}
  else if(PEN.on&&e.key==='Escape')penToggle(false);
  else if((e.ctrlKey||e.metaKey)&&(e.key==='z'||e.key==='Z')&&(PEN.on||(PEN.ink[DECK&&DECK.i]||[]).length)){e.preventDefault();penUndo()}
});
