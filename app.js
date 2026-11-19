/* MathQuest — Year 7 (Cambridge Lower Secondary Mathematics) */
const $=(s,e=document)=>e.querySelector(s), $$=(s,e=document)=>[...e.querySelectorAll(s)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const rndSeed=()=>Math.floor(Math.random()*1e9);

// ---------------- state ----------------
const KEY='mathquest.v1';
const DEF={topic:'t01',lesson:1,plesson:0,level:'easy',proj:false,coins:100,xp:0,streak:0,best:0,solved:0,pity:0,tickets:0,inv:{},tp:{}};
let S=Object.assign({},DEF,(()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}})());
if(S.prog&&S.prog[7])Object.assign(S,S.prog[7]);      // saves from the two-year version: keep Year 7 progress
delete S.prog;S.tp=S.tp||{};
if(S.topic!=='all'&&!TMAP[S.topic])S.topic='t01';
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const REWARD={easy:10,medium:20,hard:35};
const TITLES=['Rookie','Explorer','Apprentice','Solver','Wizard','Master','Legend'];
const tname=id=>id==='all'?'🌍 Mixed review (all units)':`${TMAP[id].icon} Week ${TMAP[id].u} · ${TMAP[id].title}`;
function hud(){
  $('#hCoins').textContent=S.coins;$('#hTix').textContent=S.tickets;$('#hStreak').textContent=S.streak;
  const lv=Math.floor(S.xp/100)+1;$('#hLv').textContent=lv;$('#hTitle').textContent=TITLES[Math.min(TITLES.length-1,Math.floor((lv-1)/2))];
  $('#hXp').style.width=(S.xp%100)+'%';document.body.classList.toggle('proj',!!S.proj);
}
function toast(msg,ms=2200){const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),ms)}
var burst=function(emojis='🎉✨⭐',n=18,x=innerWidth/2,y=innerHeight/2){
  for(let i=0;i<n;i++){const e=document.createElement('span');e.className='burst';e.textContent=emojis[Math.floor(Math.random()*emojis.length)];
    e.style.left=x+'px';e.style.top=y+'px';e.style.setProperty('--dx',(Math.random()*500-250)+'px');e.style.setProperty('--dy',(Math.random()*-400-50)+'px');
    document.body.appendChild(e);setTimeout(()=>e.remove(),1300)}
};
function award(base,tries,tid){
  const c=Math.round(base*(tries===0?1:tries===1?.6:.3));
  S.streak++;S.best=Math.max(S.best,S.streak);
  const bonus=S.streak>=5?10:S.streak>=3?5:0;
  S.coins+=c+bonus;S.xp+=base;S.solved++;
  if(tid){const t=S.tp[tid]=S.tp[tid]||{solved:0};t.solved++}
  save();hud();return {c,bonus};
}
const stars=n=>n>=30?'⭐⭐⭐':n>=15?'⭐⭐':n>=5?'⭐':'';
const genP=(level,r,tid=S.topic)=>genTopic(tid,level,r);

// ---------------- problem card ----------------
function mountProblem(host,p,o={}){
  const reward=o.reward??REWARD[p.level];
  let tries=0,done=false,shown=0;
  host.innerHTML=`<div class="card ${o.boss?'boss':''}">
    <div class="row"><span class="tag ${p.level}">${p.level.toUpperCase()}</span>${o.boss?'<span class="tag r-legend">⚔️ BOSS ×3</span>':''}${p.tid?`<span class="tag tid" style="background:${TMAP[p.tid].color}">${TMAP[p.tid].icon} Unit ${TMAP[p.tid].u}</span>`:''}<span class="sp"></span><span class="pill" style="background:#fef3c7;color:#92400e">+${reward} 🪙</span></div>
    <div class="q-text">${p.text||''}</div>${p.eq?`<div class="eq">${p.eq}</div>`:''}${p.svg?`<div>${p.svg}</div>`:''}${p.note?`<div class="note">${p.note}</div>`:''}
    <div class="ansrow"><label>${p.label||''}</label><input inputmode="decimal" autocomplete="off" aria-label="answer"><span style="font-size:1.3rem">${p.unit||''}</span><button class="btn check">Check ✔</button></div>
    <div class="fb"></div>
    <div class="row" style="justify-content:center"><button class="btn alt hint">💡 Hint (−5🪙)</button><button class="btn alt sol">👁 Solution step by step</button>${o.next?'<button class="btn next">Next ➜</button>':''}</div>
    <ol class="steps" hidden></ol></div>`;
  const inp=$('input',host),fb=$('.fb',host),ol=$('.steps',host),card=$('.card',host);
  const finish=(msg,cls)=>{fb.textContent=msg;fb.className='fb '+cls};
  const check=()=>{
    if(done)return; if(inp.value.trim()===''){inp.focus();return}
    if(checkAnswer(p,inp.value)){
      done=true;const a=award(reward,tries,p.tid);
      finish(`✅ Correct! ${ansText(p)}   +${a.c}🪙${a.bonus?` +${a.bonus} streak bonus`:''}`,'ok');
      const r=inp.getBoundingClientRect();burst(o.boss?'👑🏆💎✨':'🎉✨⭐🪙',o.boss?30:14,r.left+60,r.top);
      if(o.onSolved)o.onSolved(p);
      showSteps(99);
    }else{
      tries++;S.streak=0;save();hud();card.classList.remove('shake');void card.offsetWidth;card.classList.add('shake');
      finish(tries>=2?'❌ Not yet — try the hint or open the solution.':'❌ Not quite. Check your signs and try again!','bad');
    }
  };
  const showSteps=n=>{
    ol.hidden=false;shown=Math.min(p.steps.length,Math.max(shown,n));
    ol.innerHTML=p.steps.slice(0,shown).map(s=>`<li>${s}</li>`).join('');
    if(shown>=p.steps.length&&!done){done=true;finish('Answer: '+ansText(p)+'  (no coins for peeking — try the next one!)','bad');S.streak=0;save();hud()}
  };
  $('.check',host).onclick=check;
  inp.addEventListener('keydown',e=>{if(e.key==='Enter')check()});
  $('.hint',host).onclick=()=>{if(S.coins>=5){S.coins-=5;save();hud()}finish('💡 '+(p.hint||'Think about the key idea of this unit.'),'ok')};
  $('.sol',host).onclick=()=>showSteps(shown+1);
  if(o.next)$('.next',host).onclick=o.next;
  setTimeout(()=>inp.focus(),50);
}

// ---------------- worked example stepper ----------------
function workedExample(host,tid,li=0){
  let level='easy',p,shown=0;
  const draw=()=>{
    p=genTopic(tid,level,mkR(rndSeed()),li);shown=0;
    host.innerHTML=`<h3>🧩 Worked example <span class="tag ${level}">${level}</span></h3>
      <div class="chips">${['easy','medium','hard'].map(l=>`<button class="chip ${l} ${l===level?'on':''}" data-l="${l}">${l}</button>`).join('')}<button class="btn alt" id="exNew">🎲 New numbers</button></div>
      <div class="q-text">${p.text||''}</div>${p.eq?`<div class="eq">${p.eq}</div>`:''}${p.svg?`<div>${p.svg}</div>`:''}${p.note?`<div class="note">${p.note}</div>`:''}
      <div class="row" style="justify-content:center"><button class="btn green" id="exNext">▶ Next step</button><button class="btn alt" id="exAll">Show all</button></div>
      <ol class="steps" id="exSteps"></ol>`;
    $$('.chip',host).forEach(b=>b.onclick=()=>{level=b.dataset.l;draw()});
    $('#exNew',host).onclick=draw;
    const upd=()=>{$('#exSteps',host).innerHTML=p.steps.slice(0,shown).map(s=>`<li>${s}</li>`).join('')+(shown>=p.steps.length?`<li style="background:#fef9c3;border-color:#eab308">Answer: <b>${ansText(p)}</b></li>`:'')};
    $('#exNext',host).onclick=()=>{shown=Math.min(p.steps.length,shown+1);upd()};
    $('#exAll',host).onclick=()=>{shown=99;upd()};
  };
  draw();
}

// ---------------- topic picker ----------------
function topicSelect(id,val,allowAll=true,onchange){
  const terms=[1,2,3].map(t=>`<optgroup label="Term ${t}">${TOPICS.filter(x=>x.term===t).map(x=>`<option value="${x.id}" ${x.id===val?'selected':''}>${x.icon} Week ${x.u} · ${x.title}</option>`).join('')}</optgroup>`).join('');
  return `<select id="${id}" class="topicSel">${allowAll?`<option value="all" ${val==='all'?'selected':''}>🌍 Mixed review (all units)</option>`:''}${terms}</select>`;
}

// ---------------- Year map ----------------
const lessonSelectAll=(id,tid,val)=>`<select id="${id}" class="topicSel"><option value="0" ${val===0?'selected':''}>Whole week (all lessons)</option>${TMAP[tid].lessons.map(l=>`<option value="${l.n}" ${l.n===val?'selected':''}>Lesson ${l.n}${l.n===6?' · Review &amp; test':' · '+l.title}</option>`).join('')}</select>`;
function renderMap(){
  const el=$('#tab-map');
  const card=t=>{const n=(S.tp[t.id]||{}).solved||0,best=(S.tp[t.id]||{}).test;
    return `<div class="tcard" style="--c:${t.color}"><div class="tc-h"><span class="tc-i">${t.icon}</span><div><b>Week ${t.u}</b><div class="tc-t">${t.title}</div></div></div>
    <div class="tc-s">${t.strand}</div><div class="tc-o">${t.obj}</div>
    <ol class="lessonList">${t.lessons.map(l=>`<li><a href="#" data-go="slides" data-t="${t.id}" data-l="${l.n}"><b>L${l.n}</b> ${l.n===6?'Review &amp; unit test':l.title}</a></li>`).join('')}</ol>
    <div class="tc-p"><div class="pitybar"><i style="width:${Math.min(100,n/30*100)}%;background:${t.color}"></i></div><small>${n} solved ${stars(n)}${best!==undefined?` · test best ${best}/10`:''}</small></div>
    <div class="row"><button class="btn alt" data-go="practice" data-t="${t.id}">✏️ Practice</button><button class="btn alt" data-go="hw" data-t="${t.id}">🖨️ PDF worksheets</button></div></div>`};
  const names={1:'Term 1 · Autumn (weeks 1–5)',2:'Term 2 · Spring (weeks 6–10)',3:'Term 3 · Summer (weeks 11–16)'};
  el.innerHTML=`<h2>🗺️ Year 7 map — 16 weeks <small style="font-weight:400;color:#6b7280">Cambridge Lower Secondary Mathematics 7 · each week = 1 unit = 6 lessons × 40 min</small></h2>
   <p class="rates">Click a lesson to open its interactive slides (Lessons 1–5 teach, Lesson 6 = review + unit test). Or practise with random problems, or make PDF worksheets for any lesson. ⭐ = 5, ⭐⭐ = 15, ⭐⭐⭐ = 30 solved. <button class="btn alt" id="mixBtn" style="padding:.2rem .8rem">🌍 Mixed review</button></p>`+
   [1,2,3].map(tm=>`<h3 class="termh">${names[tm]}</h3><div class="tgrid">${TOPICS.filter(t=>t.term===tm).map(card).join('')}</div>`).join('');
  $$('[data-go]',el).forEach(b=>b.onclick=e=>{e.preventDefault();S.topic=b.dataset.t;if(b.dataset.l)S.lesson=+b.dataset.l;save();openTab(b.dataset.go)});
  $('#mixBtn').onclick=()=>{S.topic='all';save();openTab('practice')};
}

// ---------------- Practice ----------------
function renderPractice(){
  const el=$('#tab-practice');
  const T=S.topic==='all'?null:TMAP[S.topic],pl=T?S.plesson:0;
  el.innerHTML=`<h2>✏️ Practice</h2><div class="row">${topicSelect('pTopic',S.topic)}${T?lessonSelectAll('pLesson',S.topic,pl):''}</div>
   <div class="chips" id="lvl" style="margin-top:.6rem">${['easy','medium','hard'].map(l=>`<button class="chip ${l} ${l===S.level?'on':''}" data-l="${l}">${l==='easy'?'🟢 Easy':l==='medium'?'🟡 Medium':'🔴 Hard'} (+${REWARD[l]}🪙)</button>`).join('')}</div>
   <div class="grid2"><div id="pHost"></div>
   <div class="card"><h3>📊 Your stats</h3><p>Solved: <b id="stS"></b> · Best streak: <b id="stB"></b></p>
     <p class="rates">Streak bonus: 3 in a row = +5🪙 · 5 in a row = +10🪙.<br>First-try answers pay full coins. Collect 50🪙 → open a capsule in the 🎰 Gacha tab!</p>
     <p class="rates">Answers: whole numbers, decimals (2.5) or fractions (5/2).</p>
     ${T?`<div class="card" style="background:#eef2ff;margin-top:.6rem"><b>${pl?`Lesson ${pl}: ${T.lessons[pl-1].title}`:`Key ideas — ${T.title}`}</b><ul>${(pl?T.lessons[pl-1].ideas:T.ideas).map(i=>`<li>${i}</li>`).join('')}</ul></div>`:''}</div></div>`;
  $('#pTopic').onchange=e=>{S.topic=e.target.value;S.plesson=0;save();renderPractice()};
  if(T)$('#pLesson').onchange=e=>{S.plesson=+e.target.value;save();renderPractice()};
  $$('#lvl .chip').forEach(b=>b.onclick=()=>{S.level=b.dataset.l;save();renderPractice()});
  const next=()=>{const p=genTopic(S.topic,S.level,mkR(rndSeed()),pl);mountProblem($('#pHost'),p,{next,onSolved:()=>{$('#stS').textContent=S.solved;$('#stB').textContent=S.best}})};
  $('#stS').textContent=S.solved;$('#stB').textContent=S.best;next();
}
// ---------------- Gacha ----------------
const MON=[
 {id:'c1',n:'Protractor Pup',e:'🐶',r:'common'},{id:'c2',n:'Ruler Rat',e:'🐀',r:'common'},{id:'c3',n:'Pencil Penguin',e:'🐧',r:'common'},
 {id:'c4',n:'Eraser Egg',e:'🥚',r:'common'},{id:'c5',n:'Compass Cat',e:'🐱',r:'common'},{id:'c6',n:'Sum Snail',e:'🐌',r:'common'},
 {id:'r1',n:'Right-Angle Fox',e:'🦊',r:'rare'},{id:'r2',n:'Equation Owl',e:'🦉',r:'rare'},{id:'r3',n:'Vertex Frog',e:'🐸',r:'rare'},{id:'r4',n:'Balance Panda',e:'🐼',r:'rare'},
 {id:'e1',n:'Algebra Dragon',e:'🐲',r:'epic'},{id:'e2',n:'Triangle Tiger',e:'🐯',r:'epic'},{id:'e3',n:'Pi Unicorn',e:'🦄',r:'epic'},
 {id:'l1',n:'Euclid the Lion',e:'🦁',r:'legend'},{id:'l2',n:'Phoenix of 360°',e:'🦅',r:'legend'}];
const RAR={common:{name:'COMMON',refund:10},rare:{name:'RARE',refund:25},epic:{name:'EPIC',refund:60},legend:{name:'LEGENDARY',refund:150}};
const PULL=50;
const rollRar=()=>{const x=Math.random();return x<.04?'legend':x<.15?'epic':x<.40?'rare':'common'};
function pullOne(){
  S.pity++;let rar=rollRar();
  if(S.pity>=10&&(rar==='common'||rar==='rare'))rar=Math.random()<.8?'epic':'legend';
  if(rar==='epic'||rar==='legend')S.pity=0;
  const pool=MON.filter(m=>m.r===rar),m=pool[Math.floor(Math.random()*pool.length)];
  const dup=(S.inv[m.id]||0)>0;S.inv[m.id]=(S.inv[m.id]||0)+1;
  if(dup)S.coins+=RAR[rar].refund;
  return {m,dup};
}
const monHTML=(m,extra='')=>`<div class="mon ${m.r}"><div class="rr">${RAR[m.r].name}</div><div class="em">${m.e}</div><div class="nm">${m.n}</div>${extra}</div>`;
function collectionHTML(){
  const have=MON.filter(m=>S.inv[m.id]).length;
  return `<h3>📖 Collection ${have}/${MON.length}</h3><div class="collection">${MON.map(m=>S.inv[m.id]?`<div class="mon ${m.r}"><span class="cnt">×${S.inv[m.id]}</span><div class="rr">${RAR[m.r].name}</div><div class="em">${m.e}</div><div class="nm">${m.n}</div></div>`:`<div class="mon locked"><div class="rr">${RAR[m.r].name}</div><div class="em">${m.e}</div><div class="nm">???</div></div>`).join('')}</div>`;
}
function renderGacha(){
  const el=$('#tab-gacha');
  el.innerHTML=`<h2>🎰 Gacha Lab</h2>
  <div class="grid2">
   <div class="card machine"><h3>🎲 Problem Capsule <small style="color:#6b7280">(free!)</small></h3>
     <div>${topicSelect('gTopic',S.topic)}</div>
     <div class="capsule" id="cap1">🔮</div><div><button class="btn gold" id="sumBtn">✨ Summon a problem</button></div>
     <p class="rates">Common (easy) 55% · Rare (medium) 30% · Epic (hard) 12% · <b>Legendary BOSS</b> 3% — pays ×3 coins + a 🎟️ free-pull ticket!</p></div>
   <div class="card machine"><h3>🎁 Prize Capsule <small style="color:#6b7280">(${PULL}🪙 or 🎟️)</small></h3>
     <div class="capsule" id="cap2">🥚</div><div class="row" style="justify-content:center">
       <button class="btn gold" id="p1">Pull ×1</button><button class="btn gold" id="p10">Pull ×10 (${PULL*9}🪙)</button></div>
     <div style="margin:.6rem auto;max-width:300px"><div class="pitybar"><i id="pity" style="width:${Math.min(100,S.pity*10)}%"></i></div><div class="rates" id="pityTxt"></div></div>
     <p class="rates">Common 60% · Rare 25% · Epic 11% · Legendary 4%. Duplicates turn into bonus coins.</p></div>
  </div>
  <div id="pRes" style="margin-top:1rem"></div><div id="gRes" class="reveal"></div>
  <div class="card" id="coll" style="margin-top:1rem"></div>
  <p class="rates noprint">Teacher demo: <button class="btn alt" id="demoCoins" style="padding:.2rem .7rem;font-size:.8rem">+200 🪙</button> <button class="btn alt" id="resetAll" style="padding:.2rem .7rem;font-size:.8rem">Reset progress</button></p>`;
  const refresh=()=>{hud();$('#pity').style.width=Math.min(100,S.pity*10)+'%';$('#pityTxt').textContent=`Guaranteed Epic+ in ${Math.max(0,10-S.pity)} pulls`;$('#coll').innerHTML=collectionHTML();
    $('#p1').disabled=!(S.tickets>0||S.coins>=PULL);$('#p10').disabled=S.coins<PULL*9;$('#p1').textContent=S.tickets>0?'Pull ×1 (🎟️)':'Pull ×1';};
  refresh();
  $('#gTopic').onchange=e=>{S.topic=e.target.value;save()};
  $('#demoCoins').onclick=()=>{S.coins+=200;save();refresh()};
  $('#resetAll').onclick=()=>{if(confirm('Reset all progress (coins, collection, solved counts)?')){const t=S.topic;S=Object.assign({},DEF,{topic:t});save();hud();renderGacha()}};
  let busy=false;
  $('#sumBtn').onclick=async()=>{
    if(busy)return;busy=true;const cap=$('#cap1');cap.classList.add('spin');await sleep(1400);cap.classList.remove('spin');
    const x=Math.random();const rar=x<.03?'legend':x<.15?'epic':x<.45?'rare':'common';
    const lvl={common:'easy',rare:'medium',epic:'hard',legend:'hard'}[rar],rew={common:15,rare:30,epic:60,legend:150}[rar];
    const p=genP(lvl,mkR(rndSeed()),$('#gTopic').value);
    $('#pRes').innerHTML=`<div class="row" style="justify-content:center"><span class="tag r-${rar}" style="font-size:1rem">${RAR[rar].name} PROBLEM</span></div><div id="pc" style="max-width:640px;margin:.5rem auto"></div>`;
    burst(rar==='legend'?'👑💎🔥':'✨',rar==='common'?5:16);
    mountProblem($('#pc'),p,{reward:rew,boss:rar==='legend',onSolved:()=>{if(rar==='legend'){S.tickets++;toast('🎟️ Boss defeated! Free pull ticket earned')}save();refresh()}});
    busy=false;
  };
  const doPull=async n=>{
    if(busy)return;
    if(n===1){if(S.tickets>0)S.tickets--;else if(S.coins>=PULL)S.coins-=PULL;else return}
    else{if(S.coins<PULL*9)return;S.coins-=PULL*9}
    busy=true;save();hud();const cap=$('#cap2');cap.classList.add('spin');$('#gRes').innerHTML='';await sleep(1400);cap.classList.remove('spin');
    const res=[];for(let i=0;i<n;i++)res.push(pullOne());save();
    $('#gRes').innerHTML=res.map(o=>monHTML(o.m,o.dup?`<small>Duplicate → +${RAR[o.m.r].refund}🪙</small>`:'<small>✨ NEW!</small>')).join('');
    const order=['common','rare','epic','legend'],best=res.reduce((a,o)=>Math.max(a,order.indexOf(o.m.r)),0);
    burst(best>=3?'👑💎🔥🌟':best==2?'💜✨':'✨',best*8+8);
    refresh();busy=false;
  };
  $('#p1').onclick=()=>doPull(1);$('#p10').onclick=()=>doPull(10);
}

// ---------------- Worksheets ----------------
const mixedRemember=`<h4>📌 Remember</h4><ul><li>Read each question carefully and <b>show your working</b>.</li><li>Check that your answer is sensible (estimate first!).</li><li>Use the key facts from each unit — ask your teacher if you are stuck.</li></ul>`;
const DEFCFG=()=>({topic:S.topic,lesson:0,e:4,m:4,h:2,seed:7001,key:'none',title:'',theory:true,challenge:true});
let HW=DEFCFG();
function qCard(p,id){
  return `<div class="qcard ${p.svg?'':'alg'}"><div class="qn">${id}</div><div class="qt">${p.text||''}</div>${p.eq?`<div class="eq">${p.eq}</div>`:''}${p.svg||''}${p.note&&!/Enter a whole/.test(p.note)?`<div class="note">${p.note}</div>`:''}<div class="qa">${p.label||''} <u>&nbsp;</u> ${p.unit||''}</div></div>`;
}
function buildSheetHTML(cfg){
  const tid=cfg.topic,T=tid==='all'?null:TMAP[tid],r=mkR(cfg.seed),li=T?(cfg.lesson||0):0,L=li?T.lessons[li-1]:null,isTest=!!(L&&L.test);
  const ttl=cfg.title||(isTest?T.title+' — unit test':L?L.title:T?T.title:'Mixed review');
  const lv=[['easy','A',cfg.e,'🟢 Level 1 — Warm-up','one or two steps'],['medium','B',cfg.m,'🟡 Level 2 — Getting stronger','more steps'],['hard','C',cfg.h,'🔴 Level 3 — Boss round','think carefully!']];
  const sets=lv.map(([l,LL,n])=>genTopicList(tid,l,n,r,li));
  const total=cfg.e+cfg.m+cfg.h;
  const sub=T?`CAMBRIDGE LOWER SECONDARY · MATHEMATICS · YEAR 7 · WEEK ${T.u} · ${li?(isTest?'LESSON 6 OF 6 · TEST':`LESSON ${li} OF 6`):T.strand.toUpperCase()}`:'CAMBRIDGE LOWER SECONDARY · MATHEMATICS · YEAR 7 · MIXED REVIEW';
  const head=(t)=>`<div class="sh-head"><div><div class="sub">${sub}</div><h1>${t}</h1></div><div style="font-size:26pt">${T?T.icon:'🎲'}</div></div>`;
  const key=()=>{
    let rows='';
    lv.forEach(([l,L],i)=>sets[i].forEach((p,j)=>{rows+=`<tr><td><b>${L}${j+1}</b></td><td class="a">${ansText(p)}</td><td class="eqs">${p.eq?p.eq+' &nbsp;→&nbsp; ':''}${p.steps.join(' &nbsp;→&nbsp; ')}</td></tr>`}));
    return `<div class="sheet ${cfg.key==='with'?'pb':''}">${head('ANSWER KEY — '+ttl)}<p><b>Teacher copy.</b> Total marks: ${total}. Seed ${cfg.seed}.</p><table class="keytbl"><tr><th>Q</th><th>Answer</th><th>Working</th></tr>${rows}</table></div>`;
  };
  if(cfg.key==='only')return key();
  let h=`<div class="sheet">${head(ttl)}<div class="sh-fields"><span>Name:</span><span>Class:</span><span>Date:</span><span class="sc">Score: /${total}</span></div>${isTest?`<div class="testnote"><b>Unit test</b> · Time allowed: <b>15 minutes</b> · Show your working · ${total} marks</div>`:L?`<div class="testnote"><b>Lesson ${li}:</b> ${L.obj}</div>`:''}`;
  if(cfg.theory){
    h+=`<div class="remember">${T?`<h4>📌 Remember</h4><ul>${(L?L.ideas:T.ideas).map(i=>`<li>${i}</li>`).join('')}</ul><div class="gloss"><b>Words:</b> ${T.vocab.join(' · ')}</div>`:mixedRemember}</div>`;
    const ex=genTopicList(tid,'medium',1,mkR(cfg.seed+777),li)[0];
    h+=`<div class="example"><h4>✍️ Worked example</h4><div class="ex-flex"><div style="flex:1">${ex.text?`<div>${ex.text}</div>`:''}${ex.eq?`<div class="eq">${ex.eq}</div>`:''}<ol>${ex.steps.map(s=>`<li>${s}</li>`).join('')}</ol></div>${ex.svg?`<div style="flex:0 0 170px">${ex.svg}</div>`:''}</div></div>`;
  }
  lv.forEach(([l,L,n,ttl2,sub2],i)=>{if(n>0)h+=`<div class="lvl ${l}">${ttl2}<small>${sub2} · ${n} question${n>1?'s':''}</small></div><div class="qgrid">${sets[i].map((p,j)=>qCard(p,L+(j+1))).join('')}</div>`});
  if(cfg.challenge)h+=`<div class="challenge"><h4>🏆 Challenge corner</h4>${T?T.challenge:'Pick your favourite question above and write a new one with different numbers. Swap with a partner and solve each other’s!'}<div class="drawbox"></div></div>`;
  h+=`<div class="exit"><span><b>Exit ticket:</b> Today I learned …………………………………………</span><span>I feel: 😟 &nbsp; 😐 &nbsp; 🙂 &nbsp; 😄</span></div><div class="seedtag">MathQuest · Year 7 · seed ${cfg.seed}</div></div>`;
  if(cfg.key==='with')h+=key();
  return h;
}
function renderHW(){
  const el=$('#tab-hw');HW.topic=S.topic;const c=HW;
  el.innerHTML=`<div class="noprint"><h2>🖨️ PDF worksheets</h2>
   <div class="card"><div class="row" style="margin-bottom:.6rem"><b>Week:</b> ${topicSelect('hwTopic',S.topic)}${S.topic!=='all'?lessonSelectAll('hwLesson',S.topic,c.lesson||0):''}</div>
   <div class="chips"><span style="font-weight:700;padding:.4rem 0">Presets:</span>
     <button class="chip" data-p="4,4,2">Class handout 4/4/2</button><button class="chip" data-p="5,5,3">Homework 5/5/3</button><button class="chip" data-p="0,6,4">Challenge 0/6/4</button><button class="chip" data-p="8,0,0">Easy drill 8/0/0</button></div>
   <div class="ctl">
    <div><label>Title (optional)</label><input id="hwT" value="${c.title}"></div>
    <div><label>🟢 Easy</label><input id="hwE" type="number" min="0" max="12" value="${c.e}"></div>
    <div><label>🟡 Medium</label><input id="hwM" type="number" min="0" max="12" value="${c.m}"></div>
    <div><label>🔴 Hard</label><input id="hwH" type="number" min="0" max="12" value="${c.h}"></div>
    <div><label>Seed (same seed = same sheet)</label><input id="hwS" type="number" value="${c.seed}"></div>
    <div><label>Answer key</label><select id="hwK"><option value="none">None (student copy)</option><option value="with">Add at the end</option><option value="only">Answer key only</option></select></div>
    <div><label>&nbsp;</label><label style="font-size:.9rem;color:#111"><input type="checkbox" id="hwTh" ${c.theory?'checked':''} style="width:auto"> Remember box + example</label></div>
    <div><label>&nbsp;</label><label style="font-size:.9rem;color:#111"><input type="checkbox" id="hwCh" ${c.challenge?'checked':''} style="width:auto"> Challenge corner</label></div>
   </div>
   <div class="row" style="margin-top:.8rem"><button class="btn alt" id="hwDice">🎲 New numbers</button><button class="btn green" id="hwPrint">🖨️ Print / Save as PDF</button>
   <span class="rates">In the print dialog choose <b>“Save as PDF”</b>, A4, and turn <b>off</b> “Headers and footers”.</span></div></div></div>
   <div class="preview" id="sheetHost"></div>`;
  $('#hwK').value=c.key;
  const upd=()=>{
    c.title=$('#hwT').value;c.e=Math.max(0,+$('#hwE').value||0);c.m=Math.max(0,+$('#hwM').value||0);c.h=Math.max(0,+$('#hwH').value||0);
    c.seed=+$('#hwS').value||1;c.key=$('#hwK').value;c.theory=$('#hwTh').checked;c.challenge=$('#hwCh').checked;
    $('#sheetHost').innerHTML=buildSheetHTML(c);
  };
  $('#hwTopic').onchange=e=>{S.topic=e.target.value;HW.title='';HW.lesson=0;save();renderHW()};
  if(S.topic!=='all')$('#hwLesson').onchange=e=>{HW.lesson=+e.target.value;const test=HW.lesson===6,les=HW.lesson>0&&!test;HW.e=test?5:les?3:4;HW.m=test?6:les?3:4;HW.h=test?4:2;HW.theory=!test;HW.challenge=!test;HW.title='';renderHW()};
  $$('.ctl input,.ctl select',el).forEach(i=>i.onchange=upd);
  $$('.chip[data-p]',el).forEach(b=>b.onclick=()=>{const [e,m,h]=b.dataset.p.split(',');$('#hwE').value=e;$('#hwM').value=m;$('#hwH').value=h;upd()});
  $('#hwDice').onclick=()=>{$('#hwS').value=Math.floor(Math.random()*90000)+1000;upd()};
  $('#hwPrint').onclick=()=>window.print();
  upd();
}

// ---------------- tabs / init ----------------
const R_={map:renderMap,slides:renderSlides,practice:renderPractice,gacha:renderGacha,hw:renderHW};
function openTab(t){
  $$('nav.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
  $$('.tab').forEach(s=>s.classList.toggle('on',s.id==='tab-'+t));
  R_[t]();window.scrollTo(0,0);
}
$$('nav.tabs button').forEach(b=>b.onclick=()=>openTab(b.dataset.t));
$('#projBtn').onclick=()=>{S.proj=!S.proj;save();hud()};

function selfTest(){
  const bad=[];let n=0;
  for(const tp of TOPICS)for(const l of ['easy','medium','hard'])for(let i=0;i<300;i++){
    n++;let p;
    try{p=genTopic(tp.id,l,mkR(i*7919+tp.u))}catch(e){bad.push(`${tp.id}/${l}/${i}: ${e.message}`);continue}
    const ctx=`${tp.id}/${l}/${i}`;
    if(!Number.isFinite(p.ans))bad.push(ctx+': ans not finite');
    if(!p.steps||!p.steps.length)bad.push(ctx+': no steps');
    if(/NaN|undefined|Infinity/.test((p.text||'')+(p.eq||'')+(p.svg||'')+p.steps.join('')+ansText(p)))bad.push(ctx+': bad text '+(p.text||'').slice(0,60));
    if(!checkAnswer(p,String(p.ans)))bad.push(ctx+': own answer rejected');
    if(p.ansStr&&/^-?\d+\/\d+/.test(p.ansStr)&&!checkAnswer(p,p.ansStr.split(' ')[0]))bad.push(ctx+': ansStr rejected '+p.ansStr);
    if(tp.id==='t02'&&p.L&&Math.abs(p.L(p.ans)-p.R(p.ans))>1e-9)bad.push(ctx+': L!=R');
  }
  // worksheets build for every topic
  for(const tp of [...TOPICS,{id:'all'}]){try{const h=buildSheetHTML({topic:tp.id,e:4,m:4,h:2,seed:1234,key:'with',title:'',theory:true,challenge:true});if(/NaN|undefined/.test(h))bad.push('sheet '+tp.id+' has NaN/undefined')}catch(e){bad.push('sheet '+tp.id+' '+e.message)}}
  // widgets render without error
  for(const tp of TOPICS){try{const host=document.createElement('div');document.body.appendChild(host);mountWidget(host,W[tp.widget]);if(/NaN|undefined/.test(host.innerHTML))bad.push('widget '+tp.widget+' NaN');host.remove()}catch(e){bad.push('widget '+tp.widget+': '+e.message)}}
  // UI flow
  if(location.hash!=='#selftest-anim')burst=()=>{};
  for(const tid of ['t01','t07']){
    const host=document.createElement('div');document.body.appendChild(host);
    const p=genTopic(tid,'medium',mkR(5));const c0=S.coins;
    mountProblem(host,p,{});$('input',host).value='12345';$('.check',host).click();
    if(!$('.fb',host).classList.contains('bad'))bad.push('wrong answer not flagged');
    $('input',host).value=String(p.ans);$('.check',host).click();
    if(!$('.fb',host).classList.contains('ok')||S.coins<=c0)bad.push('correct answer failed '+tid);
    if(!S.tp[tid]||S.tp[tid].solved<1)bad.push('topic stat not counted '+tid);
  }
  // every lesson: valid problem types, problems generate, deck + worksheet build
  for(const tp of TOPICS){
    if(tp.lessons.length!==6)bad.push('lessons '+tp.id);
    for(const L of tp.lessons){
      for(const [lv,ix] of L.items)if(typeof T7[tp.id][lv][ix]!=='function')bad.push(`bad item ${tp.id} L${L.n} ${lv}${ix}`);
      for(const lv of ['easy','medium','hard'])for(let i=0;i<40;i++){try{const p=genTopic(tp.id,lv,mkR(i*31+L.n),L.n);if(!Number.isFinite(p.ans)||!checkAnswer(p,String(p.ans)))bad.push(`lesson answer ${tp.id} L${L.n}`)}catch(e){bad.push(`lesson gen ${tp.id} L${L.n}: `+e.message)}}
      try{const d=buildDeck(tp,L.n);if(d.length<6)bad.push('deck short '+tp.id+' L'+L.n);const h=document.createElement('div');document.body.appendChild(h);d.forEach(s=>s.mount(h));if(/NaN|undefined/.test(h.innerHTML))bad.push('deck NaN '+tp.id+' L'+L.n);h.remove()}catch(e){bad.push('deck '+tp.id+' L'+L.n+': '+e.message)}
      try{const sh=buildSheetHTML({topic:tp.id,lesson:L.n,e:4,m:4,h:2,seed:99,key:'with',title:'',theory:!L.test,challenge:!L.test});if(/NaN|undefined/.test(sh))bad.push('sheet NaN '+tp.id+' L'+L.n)}catch(e){bad.push('sheet '+tp.id+' L'+L.n+': '+e.message)}
    }
  }
  // gacha pity
  S.pity=0;let gap=0,maxGap=0;for(let i=0;i<5000;i++){const o=pullOne();if(o.m.r==='epic'||o.m.r==='legend')gap=0;else{gap++;maxGap=Math.max(maxGap,gap)}}
  if(maxGap>9)bad.push('pity broken');
  document.title='SELFTEST '+n+' problems, '+bad.length+' bad';
  const pre=document.createElement('pre');pre.id='selftest';pre.textContent=document.title+'\n'+bad.slice(0,40).join('\n');document.body.prepend(pre);
}

(function init(){
  const h=location.hash;
  if(h.startsWith('#selftest')){selfTest();return}
  if(h.startsWith('#scheme')){   // printable scheme of work: 16 weeks x 6 lessons
    const rows=TOPICS.map(t=>`<tr class="wk"><td colspan="3"><b>Week ${t.u}</b> · ${t.icon} ${t.title} <span class="st">${t.strand} · Term ${t.term}</span></td></tr>`+t.lessons.map(l=>`<tr><td class="ln">L${l.n}</td><td><b>${l.n===6?'Review &amp; unit test':l.title}</b></td><td>${l.obj}</td></tr>`).join('')).join('');
    document.body.innerHTML=`<div class="sheet" style="box-shadow:none;width:auto;max-width:none"><div class="sh-head"><div><div class="sub">CAMBRIDGE LOWER SECONDARY · MATHEMATICS · YEAR 7</div><h1>Scheme of work — 16 weeks × 6 lessons × 40 minutes</h1></div><div style="font-size:26pt">🗓️</div></div>
      <p><b>Each week is one unit.</b> Lessons 1–5 teach new content; Lesson 6 is review + a 15-minute unit test. Every lesson has interactive slides (MathQuest → Interactive slides) and a printable worksheet with answer key; every week has a homework sheet.</p>
      <div class="remember"><h4>⏱ Lesson structure (40 min)</h4>Starter 5′ (recall) → Explore 8′ (key ideas + interactive widget) → Worked example 7′ → Your turn 12′ (Easy / Medium / Hard) → Spot the mistake 3′ → Plenary 5′ &nbsp;·&nbsp; Extension: boss challenge for early finishers.<br><b>Lesson 6:</b> Starter 5′ → Revise 8′ → Mixed practice 7′ → Unit test 15′ → Reflect 5′.</div>
      <table class="keytbl"><tr><th style="width:7%">Lesson</th><th style="width:28%">Title</th><th>Learning objective</th></tr>${rows}</table></div>`;
    const st=document.createElement('style');st.textContent='tr.wk td{background:#e0e7ff;font-size:11pt}.st{float:right;font-weight:400;color:#4b5563;font-size:9pt}td.ln{font-weight:800;text-align:center}tr{break-inside:avoid}body{background:#fff}';document.head.appendChild(st);return}
  if(h.startsWith('#figs')){   // developer aid: show many figures at once to check label placement
    const ids=(new URLSearchParams(h.split('?')[1]||'').get('t')||'t05').split(','),lv=['medium','hard'];let out='';
    ids.forEach(id=>lv.forEach(l=>{for(let i=0;i<6;i++){const p=genTopic(id,l,mkR(500+i*17));out+=`<div style="border:1px solid #ccc;padding:4px;width:380px;display:inline-block;vertical-align:top;font-size:12px">${p.text||''}${p.svg||''}<b>${ansText(p)}</b></div>`}}));
    document.body.innerHTML='<div style="background:#fff;padding:6px">'+out+'</div>';return}
  if(h.startsWith('#dump')){   // developer aid: print sample problems with answers for proof-reading
    const out=[];const strip=s=>String(s||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ');
    for(const tp of TOPICS)for(const l of ['easy','medium','hard'])for(let i=0;i<2;i++){const p=genTopic(tp.id,l,mkR(100+i*13+tp.u));out.push(`${tp.id} ${l}: ${strip(p.text)} ${strip(p.eq)} => ${ansText(p)} || ${strip(p.steps.join(' ; '))}`)}
    document.body.innerHTML='<pre id="dump">'+out.join('\n').replace(/</g,'&lt;')+'</pre>';return}
  if(h.startsWith('#sheet')){
    const q=new URLSearchParams(h.split('?')[1]||'');
    document.body.classList.add('sheet-only');
    HW={topic:q.get('topic')||'t01',lesson:+(q.get('lesson')||0),e:+(q.get('e')??4),m:+(q.get('m')??4),h:+(q.get('h')??2),seed:+(q.get('seed')||7001),key:q.get('key')||'none',title:q.get('title')||'',theory:q.get('theory')!=='0',challenge:q.get('challenge')!=='0'};
    $$('.tab').forEach(s=>s.classList.toggle('on',s.id==='tab-hw'));
    $('#tab-hw').innerHTML=`<div class="preview" id="sheetHost">${buildSheetHTML(HW)}</div>`;
    return;
  }
  const m=h.match(/^#tab=(\w+)(?:&topic=(\w+))?(?:&lesson=(\d+))?(?:&slide=(\d+))?/);
  if(m&&m[2]&&(m[2]==='all'||TMAP[m[2]]))S.topic=m[2];
  if(m&&m[3])S.lesson=+m[3];
  hud();openTab(m&&R_[m[1]]?m[1]:'map');
  if(m&&m[1]==='slides'&&m[4])goSlide(+m[4]);
})();
