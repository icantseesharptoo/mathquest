/* Classroom tools shown as full-screen overlays: exit ticket, battle mode, whiteboard.
   They open inside the full-screen slide deck too. Needs engine.js (makeProblem, checkAnswer, ansText). */
function openOverlay(cls,html){
  closeOverlay();
  const o=document.createElement('div');o.className='ovl '+cls;o.innerHTML=html;
  (document.fullscreenElement||document.body).appendChild(o);
  $$('[data-close]',o).forEach(b=>b.onclick=closeOverlay);
  return o;
}
function closeOverlay(){const o=$('.ovl');if(o){if(o.cleanup)o.cleanup();o.remove()}}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('.ovl')&&!['INPUT','TEXTAREA'].includes(e.target.tagName))closeOverlay()},true);
const stripTags=s=>String(s||'').replace(/<svg[\s\S]*?<\/svg>/g,'').replace(/<[^>]+>/g,'');
// a figure is shown only when the question refers to it (some figures are blank grids to draw on)
const FIG_RE=/shown|graph|histogram|chart|net|grid|points A and B|angle|the value of|find x|cuboid|prism|cylinder|sector|triangle|parallel|bottle|pattern|bag|line(s)? y|diagram shows|the line passes|spinner can|shape/i;
const needsFig=p=>!!p.svg&&FIG_RE.test(stripTags(p.text))&&!/^Use the dual intercept|^Complete the table|^For the line|Use a tree diagram/.test(stripTags(p.text));
const qBody=p=>`<div class="qt">${p.text||''}</div>${p.eq?`<div class="eq">${p.eq}</div>`:''}${needsFig(p)?p.svg:''}`;

// ===================== exit ticket =====================
// one question type, 20 versions with different numbers, 4 options each
const shapeOf=p=>stripTags(p.text+' '+(p.eq||'')).replace(/[−-]?\d+([.,/]\d+)?/g,'#').replace(/\s+/g,' ').trim()+(p.mc?'|mc':'');
function exitTicketSet(l,seed){
  const r=mkR(seed);let best=null;
  for(const skill of r.shuffle(l.skills)){
    for(const lv of [1,0]){
      const groups={};
      for(let i=0;i<160;i++){let p;try{p=makeProblem(skill,r,lv)}catch(e){break}if(p.mc&&p.choices.length<4)break;(groups[shapeOf(p)]=groups[shapeOf(p)]||[]).push(p)}
      for(const g of Object.values(groups)){
        const uniq=[...new Map(g.map(p=>[stripTags(p.text+p.eq)+ansText(p),p])).values()];
        const len=sum(uniq.map(p=>stripTags(p.text+p.eq).length))/uniq.length,score=Math.min(uniq.length,20)*10-(needsFig(uniq[0])?60:0)-len/8;
        if(!best||score>best.score)best={score,ps:uniq,skill,lv};
      }
      if(best&&best.ps.length>=20&&!needsFig(best.ps[0]))break;
    }
    if(best&&best.ps.length>=20&&!needsFig(best.ps[0]))break;
  }
  if(!best)return exitTicketSet({...l,skills:['intOps']},seed);const ps=r.shuffle(best.ps).slice(0,20);while(ps.length<20)ps.push(makeProblem(best.skill,r,best.lv));
  return ps.map(p=>Object.assign(p,{opts:fourOptions(p,r)}));
}
function fourOptions(p,r){
  if(p.mc){const others=r.shuffle(p.choices.map((c,i)=>i).filter(i=>i!==p.ans)).slice(0,3),o=r.shuffle([p.ans,...others]);return {list:o.map(i=>p.choices[i]),ok:o.indexOf(p.ans)}}
  const u=p.unit||'',show=s=>`${s}${u}`,a=p.ans,main=String(p.ansStr||fmtNum(a)).split(' (')[0].replace(/^-/,'−');
  const frac=/^[−-]?\d+\/\d+$/.test(main);let c=[];
  if(frac){const [n,d]=main.replace('−','-').split('/').map(Number);c=[[n+1,d],[n,d+1],[d-n,d],[2*n,d],[n,2*d],[d,n],[n-1,d]].filter(([x,y])=>y>0&&x!==0).map(([x,y])=>({v:x/y,s:frStr(x,y)}))}
  else{const dp=(String(rd(a,6)).split('.')[1]||'').length,gap=(p.tol||0)*2.5;let st=dp?10**-dp:Math.max(1,Math.round(Math.abs(a)/10));if(st<=gap)st=rd(Math.ceil(gap/st+1)*st,6);const R=v=>rd(v,Math.max(dp,0));
    c=[a+st,a-st,a+2*st,a*2,R(a/2),-a,a*10,R(a/10),a+1,a-1,a+st*3].map(R).filter(v=>Number.isFinite(v)&&(a<0||v>=0)).map(v=>({v,s:fmtNum(v)}))}
  const far=v=>Math.abs(v-a)>Math.max((p.tol||0)*2.5,1e-9),seen=new Set([rd(a,6)]),w=[];for(const x of r.shuffle(c)){const k=rd(x.v,6);if(far(x.v)&&!seen.has(k)&&w.length<3){seen.add(k);w.push(x.s)}}
  let k=1;while(w.length<3){const v=rd(a+k*Math.max(7,(p.tol||0)*5),4);if(!seen.has(v)){seen.add(v);w.push(fmtNum(v))}k++}
  const o=r.shuffle([main,...w]);return {list:o.map(show),ok:o.indexOf(main)};
}
function exitTicket(cid,l){
  let seed=rndSeed(),ps,answered={};
  const o=openOverlay('xt',`<div class="ovbar"><b>Exit ticket</b><span class="xtsub">${l.title} · find the block with your number</span><span class="sp"></span><span class="xtscore"></span>${timerHTML()}<button class="btn alt" data-x="reveal">Show answers</button><button class="btn alt" data-x="new">New numbers</button><button class="btn" data-close>Close ✕</button></div><div class="xtgrid"></div>`);
  const grid=$('.xtgrid',o),score=()=>{const v=Object.values(answered);$('.xtscore',o).textContent=`Answered ${v.length} / 20 · correct ${v.filter(Boolean).length}`};
  const build=()=>{answered={};ps=exitTicketSet(l,seed);
    grid.innerHTML=ps.map((p,i)=>`<div class="xtb" data-i="${i}"><div class="xtn">${i+1}</div><div class="xtq">${qBody(p)}</div><div class="xto">${p.opts.list.map((t,j)=>`<button data-j="${j}"><b>${'ABCD'[j]}</b> ${t}</button>`).join('')}</div></div>`).join('');
    $$('.xtb',grid).forEach(b=>$$('button',b).forEach(btn=>btn.onclick=()=>{const i=+b.dataset.i;if(i in answered)return;const p=ps[i],j=+btn.dataset.j,ok=j===p.opts.ok;answered[i]=ok;
      btn.classList.add(ok?'right':'wrong');$$('button',b)[p.opts.ok].classList.add('right');b.classList.add(ok?'done-ok':'done-no');score()}));
    score();ltTick();};
  $('[data-x=new]',o).onclick=()=>{seed=rndSeed();build()};
  $('[data-x=reveal]',o).onclick=()=>$$('.xtb',grid).forEach((b,i)=>$$('button',b)[ps[i].opts.ok].classList.add('right'));
  build();
}

// ===================== battle mode =====================
const PAD=['7','8','9','4','5','6','1','2','3','−','0','.','/','⌫','C'];
function battle(cid,l){
  const score={L:0,R:0};let round=0,timer=null,live=false,secs=120,qs={};
  const side=k=>`<div class="bside" data-s="${k}"><div class="bhead"><span class="bteam" contenteditable="true" spellcheck="false">${k==='L'?'Left team':'Right team'}</span><span class="bpts">0</span></div>
    <div class="bq"></div><div class="bdisp"><span class="blab"></span><span class="bval"></span><span class="bunit"></span></div>
    <div class="bpad">${PAD.map(k2=>`<button data-k="${k2}">${k2}</button>`).join('')}<button class="bgo" data-k="go">Submit ✔</button></div><div class="bmsg"></div></div>`;
  const o=openOverlay('battle',`<div class="ovbar"><b>Battle</b><span class="xtsub">${l.title} · first correct answer wins</span><span class="sp"></span><button class="btn" data-close>Close ✕</button></div>
    <div class="barena">${side('L')}<div class="bmid"><div class="bclock">2:00</div><button class="btn bstart">Start</button><div class="bround"></div></div>${side('R')}</div>`);
  const S=k=>$(`.bside[data-s=${k}]`,o),val={L:'',R:''};
  const showVal=k=>{$('.bval',S(k)).textContent=val[k]||' '};
  const newRound=()=>{
    clearInterval(timer);live=false;secs=120;round++;$('.bclock',o).textContent='2:00';$('.bclock',o).className='bclock';$('.bround',o).textContent=`Round ${round}`;
    const r=mkR(rndSeed()),pool=l.skills.filter(s=>{try{return !makeProblem(s,mkR(7),1).mc}catch(e){return false}}),skill=pick(r,pool.length?pool:l.skills);
    qs.L=makeProblem(skill,r,1);for(let t=0;t<30;t++){qs.R=makeProblem(skill,r,1);if(ansText(qs.R)!==ansText(qs.L))break}
    ['L','R'].forEach(k=>{const p=qs[k],b=S(k);val[k]='';showVal(k);b.classList.remove('win','lose','shake');
      $('.bq',b).innerHTML=qBody(p)+(p.mc?`<ol class="bopts">${p.choices.map(c=>`<li>${c}</li>`).join('')}</ol>`:'');$('.bq',b).classList.add('hidden');
      $('.blab',b).textContent=p.mc?'Option number =':(p.label&&p.label!=='Answer ='?p.label:'Answer =');$('.bunit',b).textContent=p.unit||'';$('.bmsg',b).innerHTML='';});
    $('.bstart',o).textContent='Start';$('.bstart',o).disabled=false;
  };
  const finish=(win)=>{
    live=false;clearInterval(timer);
    ['L','R'].forEach(k=>{const b=S(k),p=qs[k];b.classList.add(win===k?'win':win?'lose':'');$('.bmsg',b).innerHTML=`${win===k?'<div class="bwin">🏆 Winner!</div>':''}<ol class="sol">${p.steps.map(x=>`<li>${x}</li>`).join('')}<li>Answer: <b>${ansText(p)}</b></li></ol>`});
    if(win){score[win]++;$('.bpts',S(win)).textContent=score[win]}else $('.bclock',o).textContent="Time's up";
    $('.bstart',o).textContent='Next round';$('.bstart',o).disabled=false;
  };
  const submit=k=>{
    if(!live||!val[k])return;const p=qs[k],v=val[k].replace(/−/g,'-');
    const ok=p.mc?Number(v)-1===p.ans:checkAnswer(p,v);
    if(ok)return finish(k);
    const b=S(k);b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');$('.bmsg',b).innerHTML='<b class="bno">✗ Not correct — try again</b>';val[k]='';showVal(k);
  };
  $$('.bpad button',o).forEach(btn=>btn.onclick=()=>{
    const k=btn.closest('.bside').dataset.s,key=btn.dataset.k;if(!live)return;
    if(key==='go')return submit(k);
    if(key==='⌫')val[k]=val[k].slice(0,-1);else if(key==='C')val[k]='';else if(key==='−'){val[k]=val[k].startsWith('−')?val[k].slice(1):'−'+val[k]}else if(val[k].length<12)val[k]+=key;
    $('.bmsg',S(k)).innerHTML='';showVal(k);
  });
  $('.bstart',o).onclick=()=>{
    if($('.bstart',o).textContent==='Next round')newRound();
    live=true;$('.bstart',o).disabled=true;$$('.bq',o).forEach(q=>q.classList.remove('hidden'));
    const t0=Date.now();timer=setInterval(()=>{secs=Math.max(0,120-Math.floor((Date.now()-t0)/1000));const c=$('.bclock',o);c.textContent=`${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`;c.className='bclock'+(secs<=20?' low':'');if(secs<=0)finish(null)},250);
  };
  o.cleanup=()=>clearInterval(timer);o.qs=qs;o.score=score;
  newRound();
}

// ===================== whiteboard =====================
const WB={canvas:null,undo:[],color:'#111827',size:4,tool:'pen',bg:'grid'};
function whiteboard(){
  const cols=['#111827','#2455d6','#dc2626','#16a34a','#ea580c','#7c3aed'];
  const o=openOverlay('wb',`<div class="ovbar wbbar"><b>Whiteboard</b>
    <span class="wbgrp">${cols.map(c=>`<button class="wbc" data-c="${c}" style="background:${c}" title="Colour"></button>`).join('')}</span>
    <span class="wbgrp">${[2,4,8,16].map(s=>`<button class="wbs" data-s="${s}" title="Pen size"><i style="width:${s+2}px;height:${s+2}px"></i></button>`).join('')}</span>
    <span class="wbgrp"><button data-t="pen">✏️ Pen</button><button data-t="line">╱ Line</button><button data-t="text">T Text</button><button data-t="eraser">🧽 Eraser</button></span>
    <span class="wbgrp"><button data-a="undo">↶ Undo</button><button data-a="clear">🗑 Clear</button><button data-a="bg">▦ Grid</button><button data-a="save">💾 Save</button></span>
    <span class="sp"></span>${timerHTML()}<button class="btn" data-close>Close ✕</button></div><div class="wbarea"></div>`);
  const area=$('.wbarea',o),dpr=window.devicePixelRatio||1;
  if(!WB.canvas){WB.canvas=document.createElement('canvas');WB.canvas.className='wbcanvas'}
  const cv=WB.canvas;area.appendChild(cv);area.dataset.bg=WB.bg;
  const fit=()=>{const w=area.clientWidth,h=area.clientHeight;if(cv.width===Math.round(w*dpr)&&cv.height===Math.round(h*dpr))return;
    const old=cv.width?cv.getContext('2d').getImageData(0,0,cv.width,cv.height):null;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);cv.style.width=w+'px';cv.style.height=h+'px';if(old)cv.getContext('2d').putImageData(old,0,0)};
  fit();const ro=new ResizeObserver(fit);ro.observe(area);o.cleanup=()=>ro.disconnect();
  const ctx=cv.getContext('2d'),snap=()=>{WB.undo.push(ctx.getImageData(0,0,cv.width,cv.height));if(WB.undo.length>30)WB.undo.shift()};
  const mark=()=>{$$('.wbc',o).forEach(b=>b.classList.toggle('on',b.dataset.c===WB.color));$$('.wbs',o).forEach(b=>b.classList.toggle('on',+b.dataset.s===WB.size));$$('[data-t]',o).forEach(b=>b.classList.toggle('on',b.dataset.t===WB.tool));area.dataset.tool=WB.tool};
  $$('.wbc',o).forEach(b=>b.onclick=()=>{WB.color=b.dataset.c;if(WB.tool==='eraser')WB.tool='pen';mark()});
  $$('.wbs',o).forEach(b=>b.onclick=()=>{WB.size=+b.dataset.s;mark()});
  $$('[data-t]',o).forEach(b=>b.onclick=()=>{WB.tool=b.dataset.t;mark()});
  $('[data-a=undo]',o).onclick=()=>{const d=WB.undo.pop();if(d)ctx.putImageData(d,0,0);else ctx.clearRect(0,0,cv.width,cv.height)};
  $('[data-a=clear]',o).onclick=()=>{snap();ctx.clearRect(0,0,cv.width,cv.height)};
  $('[data-a=bg]',o).onclick=()=>{WB.bg={grid:'plain',plain:'dots',dots:'grid'}[WB.bg];area.dataset.bg=WB.bg};
  $('[data-a=save]',o).onclick=()=>{const c2=document.createElement('canvas');c2.width=cv.width;c2.height=cv.height;const x=c2.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c2.width,c2.height);x.drawImage(cv,0,0);const a=document.createElement('a');a.download='whiteboard.png';a.href=c2.toDataURL('image/png');a.click()};
  const pos=e=>{const b=cv.getBoundingClientRect();return [(e.clientX-b.left)*dpr,(e.clientY-b.top)*dpr]};
  let down=false,last=null,start=null,base=null;
  const setPen=(w)=>{ctx.lineCap='round';ctx.lineJoin='round';ctx.globalCompositeOperation=WB.tool==='eraser'?'destination-out':'source-over';ctx.strokeStyle=WB.color;ctx.lineWidth=w*dpr};
  cv.onpointerdown=e=>{
    if(WB.tool==='text'){e.preventDefault();return textAt(e)}
    try{cv.setPointerCapture(e.pointerId)}catch(err){}down=true;snap();last=pos(e);start=last;base=ctx.getImageData(0,0,cv.width,cv.height);
    setPen(WB.tool==='eraser'?WB.size*5:WB.size);ctx.beginPath();ctx.arc(last[0],last[1],ctx.lineWidth/2,0,Math.PI*2);if(WB.tool==='pen'){ctx.fillStyle=WB.color;ctx.fill()}
  };
  cv.onpointermove=e=>{if(!down)return;
    if(WB.tool==='line'){ctx.putImageData(base,0,0);const p=pos(e);setPen(WB.size);ctx.beginPath();ctx.moveTo(...start);ctx.lineTo(...p);ctx.stroke();return}
    const evs=e.getCoalescedEvents?e.getCoalescedEvents():[];if(!evs.length)evs.push(e);for(const ev of evs){const p=pos(ev),pr=ev.pressure&&ev.pointerType==='pen'?.5+ev.pressure:1;setPen((WB.tool==='eraser'?WB.size*5:WB.size)*pr);ctx.beginPath();ctx.moveTo(...last);ctx.lineTo(...p);ctx.stroke();last=p}};
  cv.onpointerup=cv.onpointercancel=()=>{down=false;ctx.globalCompositeOperation='source-over'};
  function textAt(e){
    const b=area.getBoundingClientRect(),inp=document.createElement('input');inp.className='wbtext';inp.style.left=(e.clientX-b.left)+'px';inp.style.top=(e.clientY-b.top-14)+'px';inp.style.color=WB.color;inp.style.fontSize=(16+WB.size*2)+'px';inp.placeholder='Type, then Enter';
    area.appendChild(inp);setTimeout(()=>inp.focus(),0);
    let done=false;const commit=()=>{if(done)return;done=true;if(inp.value.trim()){snap();ctx.globalCompositeOperation='source-over';ctx.fillStyle=WB.color;ctx.font=`600 ${(16+WB.size*2)*dpr}px "Segoe UI",Arial,sans-serif`;ctx.textBaseline='middle';ctx.fillText(inp.value,(e.clientX-b.left)*dpr,(e.clientY-b.top)*dpr)}inp.remove()};
    inp.onkeydown=ev=>{if(ev.key==='Enter')commit();else if(ev.key==='Escape')inp.remove();ev.stopPropagation()};inp.onblur=commit;
  }
  mark();
}
