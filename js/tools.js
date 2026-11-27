/* Classroom tools shown as full-screen overlays: exit ticket and battle mode (the whiteboard is in board.js).
   They open inside the full-screen slide deck too. Needs engine.js (makeProblem, checkAnswer, ansText). */
function openOverlay(cls,html){
  closeOverlay();
  const o=document.createElement('div');o.className='ovl '+cls;o.innerHTML=html;
  (document.fullscreenElement||document.body).appendChild(o);
  $$('[data-close]',o).forEach(b=>b.onclick=closeOverlay);
  return o;
}
function closeOverlay(){const o=$('.ovl');if(o){if(o.cleanup)o.cleanup();o.remove();
  // the wheel shows the class list, so draw it again after the seating plan changes
  if(o.classList.contains('seats')&&typeof DECK!=='undefined'&&DECK&&DECK.h&&DECK.h.wheelN!==undefined)go(DECK.i)}}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('.ovl')&&!['INPUT','TEXTAREA'].includes(e.target.tagName))closeOverlay()},true);
const stripTags=s=>String(s||'').replace(/<svg[\s\S]*?<\/svg>/g,'').replace(/<[^>]+>/g,'');
// a figure is shown only when the question refers to it (some figures are blank grids to draw on)
const FIG_RE=/shown|graph|histogram|chart|net|grid|points A and B|angle|the value of|find x|cuboid|prism|cylinder|sector|triangle|parallel|bottle|pattern|bag|line(s)? y|diagram shows|the line passes|spinner can|shape/i;
const needsFig=p=>!!p.svg&&FIG_RE.test(stripTags(p.text))&&!/^Use the dual intercept|^Complete the table|^For the line|Use a tree diagram/.test(stripTags(p.text));
const qBody=p=>`<div class="qt">${p.text||''}</div>${p.eq?`<div class="eq">${p.eq}</div>`:''}${needsFig(p)?p.svg:''}`;

// ===================== exit ticket =====================
// one question type, one version per student (and 2 extra) with different numbers, 4 options each
const shapeOf=p=>stripTags(p.text+' '+(p.eq||'')).replace(/[−-]?\d+([.,/]\d+)?/g,'#').replace(/\s+/g,' ').trim()+(p.mc?'|mc':'');
const xtKey=p=>stripTags(p.text+p.eq)+ansText(p)+(needsFig(p)?p.svg:'')+(p.mc?p.choices[p.ans]:'');
function exitTicketSet(l,seed,n=20){
  const r=mkR(seed);let best=null;
  for(const skill of r.shuffle(l.skills)){
    for(const lv of [1,0]){
      const groups={};
      for(let i=0;i<Math.max(160,n*8);i++){let p;try{p=makeProblem(skill,r,lv)}catch(e){break}if(p.mc&&p.choices.length<4)break;(groups[shapeOf(p)]=groups[shapeOf(p)]||[]).push(p)}
      for(const g of Object.values(groups)){
        const uniq=[...new Map(g.map(p=>[xtKey(p),p])).values()];
        const len=sum(uniq.map(p=>stripTags(p.text+p.eq).length))/uniq.length,score=Math.min(uniq.length,n)/n*200-(needsFig(uniq[0])?60:0)-len/8;
        if(!best||score>best.score)best={score,ps:uniq,skill,lv};
      }
      if(best&&best.ps.length>=n&&!needsFig(best.ps[0]))break;
    }
    if(best&&best.ps.length>=n&&!needsFig(best.ps[0]))break;
  }
  if(!best)return exitTicketSet({...l,skills:['intOps']},seed,n);const ps=r.shuffle(best.ps).slice(0,n);// too few versions of that question: first other questions of the topic, then repeats
  const used=new Set(ps.map(xtKey));
  for(const same of [true,false])for(let t=0;t<300&&ps.length<n;t++){let p;try{p=makeProblem(same?best.skill:pick(r,l.skills),r,same?best.lv:t%3)}catch(e){continue}const k=xtKey(p);if(used.has(k)||p.mc&&p.choices.length<4)continue;used.add(k);ps.push(p)}
  while(ps.length<n)ps.push(makeProblem(best.skill,r,best.lv));
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
// the table or drawing is taken out of the text, so that it can stand beside it
function xtBody(p){
  const d=document.createElement('div');d.innerHTML=qBody(p);const fig=$$('table.mini,svg.svg-fig',d);
  fig.forEach(e=>e.replaceWith(' '));$$('.eq',d).forEach(e=>{if(!e.textContent.trim()&&!e.children.length)e.remove()});
  return `<div class="xtq">${d.innerHTML}</div>${fig.length?`<div class="xtfig">${fig.map(e=>e.outerHTML).join('')}</div>`:''}`;
}
function exitTicket(cid,l){
  let seed=rndSeed(),ps,answered={},N=0,who=[];const kids=classSeats(cid).filter(Boolean),away=new Set();const nKey='maths.nstud.'+cid;
  const o=openOverlay('xt',`<div class="ovbar"><b>Exit ticket</b><span class="xtsub">${l.title} · find your ${kids.length?'name':'number'}</span><span class="sp"></span><span class="xtscore"></span>${timerHTML()}<button class="btn alt" data-x="count">Students</button><button class="btn alt" data-x="reveal">Show answers</button><button class="btn alt" data-x="new">New numbers</button><button class="btn" data-close>Close ✕</button></div><div class="xtcommon" hidden></div><div class="xtgrid"></div><div class="xtask" hidden><form class="seatform xtn1"><h3>How many students?</h3><div class="xtcount"><button type="button" class="btn alt" data-d="-1" aria-label="One less">−</button><input type="number" name="n" min="1" max="40" step="1" required aria-label="Number of students"><button type="button" class="btn alt" data-d="1" aria-label="One more">+</button></div>${kids.length?`<div class="xtkids">${kids.map((k,i)=>`<button type="button" data-kid="${i}" aria-pressed="true">${avHTML(k)}<span>${esc(k.name)}</span></button>`).join('')}</div><p class="note">Click a student who is absent.</p>`:''}<p class="note">The exit ticket gets one question for each student and 2 extra.</p><div class="row"><button class="btn">Start exit ticket</button><span class="sp"></span><button type="button" class="btn alt" data-k="no">Cancel</button></div></form></div>`);
  const grid=$('.xtgrid',o),score=()=>{const v=Object.values(answered);$('.xtscore',o).textContent=`Answered ${v.length} / ${N} · correct ${v.filter(Boolean).length}`};
  const build=()=>{answered={};ps=exitTicketSet(l,seed,N);
    grid.innerHTML=ps.map((p,i)=>`<div class="xtb${i>=N-2?' extra':''}${who.length?' named':''}" data-i="${i}"><div class="xth"><span class="xtn">${i+1}</span>${who[i]?`${avHTML(who[i])}<span class="xtname">${esc(who[i].name)}</span>`:''}</div>${xtBody(p)}<div class="xto">${p.opts.list.map((t,j)=>`<button data-j="${j}"><b>${'ABCD'[j]}</b> ${t}</button>`).join('')}</div></div>`).join('');
    shareText();
    $$('.xtb',grid).forEach(b=>$$('button',b).forEach(btn=>btn.onclick=()=>{const i=+b.dataset.i;if(i in answered)return;const p=ps[i],j=+btn.dataset.j,ok=j===p.opts.ok;answered[i]=ok;
      btn.classList.add(ok?'right':'wrong');$$('button',b)[p.opts.ok].classList.add('right');b.classList.add(ok?'done-ok':'done-no');score()}));
    score();ltTick();fitXT(true);setTimeout(fitXT,120);setTimeout(fitXT,600);};
  // Text and buttons are as large as fits. Several layouts (figure above, beside or under the text, options in a row,
  // and different numbers of columns) are tried, and the one that allows the largest text is used.
  const over=()=>$$('.xtb',grid).some(b=>b.scrollHeight>b.clientHeight+1||b.scrollWidth>b.clientWidth+1||[...b.children].some(e=>(e.matches('.xtq')&&e.scrollHeight>e.clientHeight+1)||(e.matches('.xtq,.xtfig')&&e.scrollWidth>e.clientWidth+1)||(e.matches('.xtfig')&&e.scrollHeight>e.clientHeight+1)||(e.matches('.xto')&&(e.scrollWidth>e.clientWidth+1||[...e.children].some(x=>x.scrollWidth>x.clientWidth+1)))));
  const setF=f=>grid.style.setProperty('--xtf',f+'px');
  const setL=([c,k])=>{grid.style.setProperty('--xc',c);grid.style.setProperty('--xr',Math.ceil(N/c));grid.className='xtgrid '+k};
  // size of the writing inside the drawings
  const labels=()=>Math.min(99,...$$('.xtb:first-child .xtfig svg',grid).map(e=>{const v=e.viewBox.baseVal,b=e.getBoundingClientRect(),t=Math.max(0,...$$('text',e).map(x=>parseFloat(getComputedStyle(x).fontSize)||0));return v&&v.width&&t?Math.min(b.width/v.width,b.height/v.height)*t:99}));
  // sentences that are the same in every block are shown once, above the blocks
  function shareText(){
    const bar=$('.xtcommon',o),qs=$$('.xtq>.qt',grid);bar.hidden=true;bar.innerHTML='';if(qs.length<N||N<2)return;
    const parts=qs.map(q=>q.innerHTML.trim().replace(/\s+/g,' ').split(/(?<=[.?!:])\s+(?=[A-Z<])/));let n=0,safe=0;
    while(n<parts[0].length&&parts.every(p=>p[n]===parts[0][n])){n++;const t=parts[0].slice(0,n).join(' ');if((t.match(/<\w/g)||[]).length===(t.match(/<\//g)||[]).length&&!/<br|<svg|<table/.test(t))safe=n}
    const t=parts[0].slice(0,safe).join(' ');if(stripTags(t).length<12)return;
    bar.innerHTML=t;bar.hidden=false;qs.forEach((q,i)=>{q.innerHTML=parts[i].slice(safe).join(' ');if(!q.innerHTML)q.hidden=true});
  }
  let fitKey='';
  function fitXT(force){
    if(!grid.isConnected||!N)return;const key=[grid.clientWidth,grid.clientHeight,seed,N].join();if(force!==true&&key===fitKey&&!over())return;fitKey=key;
    const max=Math.max(10,Math.min(44,innerWidth/58,innerHeight/30)),c0=Math.ceil(Math.sqrt(N*1.25)),fig=!!$('.xtfig',grid);let best=null;
    for(const c of [c0,c0-1,c0+1])if(c>0)for(const k of fig?['','xl-row','xl-side','xl-split']:['','xl-row']){
      setL([c,k]);let lo=7,hi=max;setF(lo);if(over()){if(!best)best={f:7,l:[c,k],s:0};continue}
      setF(hi);if(!over())lo=hi;else while(hi-lo>.3){const m=(lo+hi)/2;setF(m);if(over())hi=m;else lo=m}
      setF(lo);const v=Math.min(lo,20),s=v+lo/20+2*Math.min(v,labels()*1.3)-Math.max(0,13-lo)*3+(k||c!==c0?0:.4);if(!best||s>best.s)best={f:lo,l:[c,k],s};
    }
    setL(best.l);setF(best.f);if(over())grid.classList.add('xtscroll');o.xtf=best.f;o.xtlab=labels();o.xtl=best.l;
  }
  let raf=0;const ro=new ResizeObserver(()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(fitXT)});ro.observe(grid);o.cleanup=()=>ro.disconnect();
  $('[data-x=new]',o).onclick=()=>{seed=rndSeed();build()};
  $('[data-x=reveal]',o).onclick=()=>$$('.xtb',grid).forEach((b,i)=>$$('button',b)[ps[i].opts.ok].classList.add('right'));
  const dlg=$('.xtask',o),f=$('form',dlg);
  const ask=()=>{dlg.hidden=false;f.n.value=N?N-2:(kids.length||+localStorage.getItem(nKey)||20);f.n.focus();f.n.select()};
  $$('[data-d]',f).forEach(b=>b.onclick=()=>{f.n.value=Math.max(1,Math.min(40,(+f.n.value||0)+ +b.dataset.d))});
  f.onsubmit=e=>{e.preventDefault();const k=Math.max(1,Math.min(40,Math.round(+f.n.value)||1));try{localStorage.setItem(nKey,k)}catch(e){}dlg.hidden=true;N=k+2;who=kids.filter((x,i)=>!away.has(i)).slice(0,k);build()};
  $$('[data-kid]',f).forEach(b=>b.onclick=()=>{const i=+b.dataset.kid;away.has(i)?away.delete(i):away.add(i);b.classList.toggle('away',away.has(i));b.setAttribute('aria-pressed',!away.has(i));f.n.value=Math.max(1,kids.length-away.size)});
  dlg.onclick=e=>{if(e.target===dlg&&N)dlg.hidden=true};
  $('[data-x=count]',o).onclick=ask;
  $('[data-k=no]',f).onclick=()=>{if(N)dlg.hidden=true;else closeOverlay()};
  ['new','reveal'].forEach(k=>{const b=$(`[data-x=${k}]`,o),go=b.onclick;b.onclick=()=>{if(N)go()}});
  ltTick();ask();
}

// ===================== battle mode =====================
// how much work a question needs: more steps and a less obvious answer score higher
function hardness(p){
  const a=Math.abs(p.ans),plain=!p.mc&&Number.isInteger(p.ans)&&a<=10;
  return p.steps.length*2+(p.mc?1:Math.min(4,String(p.ansStr||p.ans).replace(/[^0-9]/g,'').length))+stripTags(p.text||'').length/90-(plain?4:0)-(p.steps.length<2?3:0);
}
const LOCK=15;   // seconds a side waits after a wrong answer
const PAD=['7','8','9','4','5','6','1','2','3','−','0','.','/','⌫','C'];
function battle(cid,l){
  const score={L:0,R:0},lock={L:0,R:0},lockT={};let round=0,timer=null,live=false,secs=120,qs={};
  const side=k=>`<div class="bside" data-s="${k}"><div class="bhead"><span class="bteam" contenteditable="true" spellcheck="false">${k==='L'?'Left team':'Right team'}</span><span class="bpts">0</span></div>
    <div class="bq"></div><div class="bdisp"><span class="blab"></span><span class="bval"></span><span class="bunit"></span></div>
    <div class="bpadw"><div class="bpad">${PAD.map(k2=>`<button data-k="${k2}">${k2}</button>`).join('')}<button class="bgo" data-k="go">Submit ✔</button></div><div class="block" hidden>🔒 Wrong answer<b></b>seconds</div></div><div class="bmsg"></div></div>`;
  const o=openOverlay('battle',`<div class="ovbar"><b>Battle</b><span class="xtsub">${l.title} · first correct answer wins</span><span class="sp"></span><button class="btn" data-close>Close ✕</button></div>
    <div class="barena">${side('L')}<div class="bmid"><div class="bclock">2:00</div><button class="btn bstart">Start</button><div class="bround"></div></div>${side('R')}</div>`);
  const S=k=>$(`.bside[data-s=${k}]`,o),val={L:'',R:''};
  const showVal=k=>{$('.bval',S(k)).textContent=val[k]||' '};
  const unlock=k=>{clearInterval(lockT[k]);lock[k]=0;S(k).classList.remove('locked');$('.block',S(k)).hidden=true};
  const lockSide=k=>{
    const b=S(k),until=Date.now()+LOCK*1000,show=()=>{const s=Math.ceil((until-Date.now())/1000);if(s<=0||!live)return unlock(k);$('.block b',b).textContent=s};
    clearInterval(lockT[k]);lock[k]=until;b.classList.add('locked');$('.block',b).hidden=false;show();lockT[k]=setInterval(show,200);
  };
  const newRound=()=>{
    clearInterval(timer);unlock('L');unlock('R');live=false;secs=120;round++;$('.bclock',o).textContent='2:00';$('.bclock',o).className='bclock';$('.bround',o).textContent=`Round ${round}`;
    // hard questions only: try several and keep the ones that need the most work
    const r=mkR(rndSeed()),pool=l.skills.filter(s=>{try{return !makeProblem(s,mkR(7),2).mc}catch(e){return false}}),skills=pool.length?pool:l.skills;
    const best=(make,ok=()=>true)=>{let b=null;for(let t=0;t<14;t++){let p;try{p=make()}catch(e){continue}if(!ok(p))continue;p.hard=hardness(p);if(!b||p.hard>b.hard)b=p}return b};
    qs.L=best(()=>makeProblem(pick(r,skills),r,2));const skill=qs.L.skill;
    qs.R=best(()=>makeProblem(skill,r,2),p=>ansText(p)!==ansText(qs.L))||makeProblem(skill,r,2);
    ['L','R'].forEach(k=>{const p=qs[k],b=S(k);val[k]='';showVal(k);b.classList.remove('win','lose','shake');
      $('.bq',b).innerHTML=qBody(p)+(p.mc?`<ol class="bopts">${p.choices.map(c=>`<li>${c}</li>`).join('')}</ol>`:'');$('.bq',b).classList.add('hidden');
      $('.blab',b).textContent=p.mc?'Option number =':(p.label&&p.label!=='Answer ='?p.label:'Answer =');$('.bunit',b).textContent=p.unit||'';$('.bmsg',b).innerHTML='';});
    $('.bstart',o).textContent='Start';$('.bstart',o).disabled=false;
  };
  const finish=(win)=>{
    live=false;clearInterval(timer);unlock('L');unlock('R');
    ['L','R'].forEach(k=>{const b=S(k),p=qs[k];b.classList.add(win===k?'win':win?'lose':'');$('.bmsg',b).innerHTML=`${win===k?'<div class="bwin">🏆 Winner!</div>':''}<ol class="sol">${p.steps.map(x=>`<li>${x}</li>`).join('')}<li>Answer: <b>${ansText(p)}</b></li></ol>`});
    if(win){score[win]++;$('.bpts',S(win)).textContent=score[win]}else $('.bclock',o).textContent="Time's up";
    $('.bstart',o).textContent='Next round';$('.bstart',o).disabled=false;
  };
  const submit=k=>{
    if(!live||lock[k]||!val[k])return;const p=qs[k],v=val[k].replace(/−/g,'-');
    const ok=p.mc?Number(v)-1===p.ans:checkAnswer(p,v);
    if(ok)return finish(k);
    const b=S(k);b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');$('.bmsg',b).innerHTML=`<b class="bno">✗ Not correct — wait ${LOCK} seconds, then try again</b>`;val[k]='';showVal(k);lockSide(k);
  };
  $$('.bpad button',o).forEach(btn=>btn.onclick=()=>{
    const k=btn.closest('.bside').dataset.s,key=btn.dataset.k;if(!live||lock[k])return;
    if(key==='go')return submit(k);
    if(key==='⌫')val[k]=val[k].slice(0,-1);else if(key==='C')val[k]='';else if(key==='−'){val[k]=val[k].startsWith('−')?val[k].slice(1):'−'+val[k]}else if(val[k].length<12)val[k]+=key;
    $('.bmsg',S(k)).innerHTML='';showVal(k);
  });
  $('.bstart',o).onclick=()=>{
    if($('.bstart',o).textContent==='Next round')newRound();
    live=true;$('.bstart',o).disabled=true;$$('.bq',o).forEach(q=>q.classList.remove('hidden'));
    const t0=Date.now();timer=setInterval(()=>{secs=Math.max(0,120-Math.floor((Date.now()-t0)/1000));const c=$('.bclock',o);c.textContent=`${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`;c.className='bclock'+(secs<=20?' low':'');if(secs<=0)finish(null)},250);
  };
  o.cleanup=()=>{clearInterval(timer);clearInterval(lockT.L);clearInterval(lockT.R)};o.qs=qs;o.lock=lock;o.score=score;
  newRound();
}
