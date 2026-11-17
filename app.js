/* MathQuest app logic */
const $=(s,e=document)=>e.querySelector(s), $$=(s,e=document)=>[...e.querySelectorAll(s)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const rndSeed=()=>Math.floor(Math.random()*1e9);

// ---------------- state ----------------
const KEY='mathquest.v1';
const DEF={year:7,level:'easy',coins:100,xp:0,streak:0,best:0,solved:0,pity:0,tickets:0,inv:{},proj:false};
let S=Object.assign({},DEF,(()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}})());
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const REWARD={easy:10,medium:20,hard:35};
const TITLES=['Rookie','Explorer','Apprentice','Solver','Wizard','Master','Legend'];
function hud(){
  $('#hCoins').textContent=S.coins;$('#hTix').textContent=S.tickets;$('#hStreak').textContent=S.streak;
  const lv=Math.floor(S.xp/100)+1;$('#hLv').textContent=lv;$('#hTitle').textContent=TITLES[Math.min(TITLES.length-1,Math.floor((lv-1)/2))];
  $('#hXp').style.width=(S.xp%100)+'%';
  $$('#yearSeg button').forEach(b=>b.classList.toggle('on',+b.dataset.y===S.year));
  document.body.classList.toggle('proj',!!S.proj);
}
function toast(msg,ms=2200){const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),ms)}
var burst=function(emojis='🎉✨⭐',n=18,x=innerWidth/2,y=innerHeight/2){
  for(let i=0;i<n;i++){const e=document.createElement('span');e.className='burst';e.textContent=emojis[Math.floor(Math.random()*emojis.length)];
    e.style.left=x+'px';e.style.top=y+'px';e.style.setProperty('--dx',(Math.random()*500-250)+'px');e.style.setProperty('--dy',(Math.random()*-400-50)+'px');
    document.body.appendChild(e);setTimeout(()=>e.remove(),1300)}
}
function award(base,tries){
  const c=Math.round(base*(tries===0?1:tries===1?.6:.3));
  S.streak++;S.best=Math.max(S.best,S.streak);
  const bonus=S.streak>=5?10:S.streak>=3?5:0;
  S.coins+=c+bonus;S.xp+=base;S.solved++;save();hud();return {c,bonus};
}
const topic=()=>S.year===7?'Angles':'Linear equations';

// ---------------- problem card ----------------
function mountProblem(host,p,o={}){
  const reward=o.reward??REWARD[p.level];
  let tries=0,done=false,shown=0;
  host.innerHTML=`<div class="card ${o.boss?'boss':''}">
    <div class="row"><span class="tag ${p.level}">${p.level.toUpperCase()}</span>${o.boss?'<span class="tag r-legend">⚔️ BOSS ×3</span>':''}<span class="sp"></span><span class="pill" style="background:#fef3c7;color:#92400e">+${reward} 🪙</span></div>
    <div class="q-text">${p.text||''}</div>${p.eq?`<div class="eq">${p.eq}</div>`:''}${p.svg?`<div>${p.svg}</div>`:''}${p.note?`<div class="note">${p.note}</div>`:''}
    <div class="ansrow"><label>${p.label}</label><input inputmode="decimal" autocomplete="off" aria-label="answer"><span style="font-size:1.3rem">${p.unit||''}</span><button class="btn check">Check ✔</button></div>
    <div class="fb"></div>
    <div class="row" style="justify-content:center"><button class="btn alt hint">💡 Hint (−5🪙)</button><button class="btn alt sol">👁 Solution step by step</button>${o.next?'<button class="btn next">Next ➜</button>':''}</div>
    <ol class="steps" hidden></ol></div>`;
  const inp=$('input',host),fb=$('.fb',host),ol=$('.steps',host),card=$('.card',host);
  const finish=(msg,cls)=>{fb.textContent=msg;fb.className='fb '+cls};
  const check=()=>{
    if(done)return; if(inp.value.trim()===''){inp.focus();return}
    if(checkAnswer(p,inp.value)){
      done=true;const a=award(reward,tries);
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
  $('.hint',host).onclick=()=>{if(S.coins>=5){S.coins-=5;save();hud()}finish('💡 '+p.hint,'ok')};
  $('.sol',host).onclick=()=>showSteps(shown+1);
  if(o.next)$('.next',host).onclick=o.next;
  setTimeout(()=>inp.focus(),50);
  return {reveal:()=>showSteps(99)};
}

// ---------------- Learn ----------------
let EX=null; // current worked example
function workedExample(host,year,withGuess){
  let level='easy',p,shown=0;
  const draw=()=>{
    p=genProblem(year,level,mkR(rndSeed()));EX=p;shown=0;
    host.innerHTML=`<h3>🧩 Worked example <span class="tag ${level}">${level}</span></h3>
      <div class="chips">${['easy','medium','hard'].map(l=>`<button class="chip ${l} ${l===level?'on':''}" data-l="${l}">${l}</button>`).join('')}<button class="btn alt" id="exNew">🎲 New numbers</button></div>
      <div class="q-text">${p.text||''}</div>${p.eq?`<div class="eq">${p.eq}</div>`:''}${p.svg?`<div>${p.svg}</div>`:''}${p.note?`<div class="note">${p.note}</div>`:''}
      <div class="row" style="justify-content:center"><button class="btn green" id="exNext">▶ Next step</button><button class="btn alt" id="exAll">Show all</button></div>
      <ol class="steps" id="exSteps"></ol>
      ${withGuess?`<hr><h3>⚖️ Guess &amp; check</h3><div class="q-text">Try a value of x. Does the balance stay level?</div>
        <div class="ansrow"><label>x =</label><input id="gIn" inputmode="decimal"><button class="btn" id="gBtn">Test</button></div><div class="eq" id="gOut" style="font-size:1.3rem"></div>`:''}`;
    $$('.chip',host).forEach(b=>b.onclick=()=>{level=b.dataset.l;draw()});
    $('#exNew',host).onclick=draw;
    const upd=()=>{$('#exSteps',host).innerHTML=p.steps.slice(0,shown).map(s=>`<li>${s}</li>`).join('')};
    $('#exNext',host).onclick=()=>{shown=Math.min(p.steps.length,shown+1);upd()};
    $('#exAll',host).onclick=()=>{shown=99;upd()};
    if(withGuess){
      const go=()=>{const v=parseNum($('#gIn',host).value);if(v===null)return;
        const l=p.L(v),rr=p.R(v),f=n=>Math.round(n*1000)/1000;
        $('#gOut',host).innerHTML=`Left = ${M(f(l))} &nbsp; Right = ${M(f(rr))}<br>`+(Math.abs(l-rr)<1e-9?'⚖️ <b style="color:#16a34a">Balanced! x is the solution.</b>':l>rr?'⬅️ Left side is heavier':'Right side is heavier ➡️')};
      $('#gBtn',host).onclick=go;$('#gIn',host).addEventListener('keydown',e=>{if(e.key==='Enter')go()});
    }
  };
  draw();
}
const EXPL={
  line:{name:'Straight line',n:'180°',txt:'Angles on a straight line add up to 180°',sl:[['Angle a',20,160,60]]},
  point:{name:'Around a point',n:'360°',txt:'Angles around a point add up to 360°',sl:[['Angle a',40,160,100],['Angle b',40,160,110]]},
  vo:{name:'Vertically opposite',n:'a = a',txt:'Vertically opposite angles are equal',sl:[['Angle a',35,145,65]]},
  tri:{name:'Triangle',n:'180°',txt:'Angles in a triangle add up to 180°',sl:[['Angle A',30,100,55],['Angle B',30,100,65]]},
  quad:{name:'Quadrilateral',n:'360°',txt:'Angles in a quadrilateral add up to 360°',sl:[['Angle A',60,120,80],['Angle B',60,120,95],['Angle C',60,120,100]]},
};
function explorerDraw(k,v){
  let svg,sum;
  if(k==='line'){const a=v[0],b=180-a;svg=raysDiagram({cx:130,cy:150,R:112,parts:[a,b],labels:[a+'°',b+'°'],lr:66});sum=`${a}° + ${b}° = 180°`}
  else if(k==='point'){let a=v[0],b=v[1];if(360-a-b<40)b=320-a;const c=360-a-b;svg=raysDiagram({cx:130,cy:92,R:84,start:20,parts:[a,b,c],labels:[a+'°',b+'°',c+'°'],lr:50});sum=`${a}° + ${b}° + ${c}° = 360°`}
  else if(k==='vo'){const a=v[0],b=180-a;svg=raysDiagram({cx:130,cy:90,R:92,start:15,parts:[a,b,a,b],labels:[a+'°',b+'°',a+'°',b+'°'],lr:50,ar:22});sum=`Opposite pairs: ${a}° = ${a}° and ${b}° = ${b}°`}
  else if(k==='tri'){let A=v[0],B=v[1];if(A+B>155)B=155-A;const C=180-A-B;svg=polyDiagram([A,B,C],[A+'°',B+'°',C+'°'],[]);sum=`${A}° + ${B}° + ${C}° = 180°`}
  else{let [A,B,C]=v;if(A+B+C>310)C=310-A-B;const D=360-A-B-C;svg=polyDiagram([A,B,C,D],[A+'°',B+'°',C+'°',D+'°'],[]);sum=`${A}° + ${B}° + ${C}° + ${D}° = 360°`}
  return {svg,sum};
}
function renderLearn(){
  const el=$('#tab-learn');
  if(S.year===7){
    el.innerHTML=`<h2>📘 Year 7 · Angles <small style="font-weight:400;color:#6b7280">— Cambridge Lower Secondary, Unit 5 “Angles and constructions”</small></h2>
    <div class="grid2"><div class="card"><h3>🔭 Angle Explorer — drag the sliders</h3><div class="facts" id="facts"></div><div id="expSl"></div><div id="expFig"></div><div class="eq" id="expSum" style="font-size:1.3rem"></div></div>
    <div class="card" id="exCard"></div></div>`;
    let cur='line';const vals={};
    const facts=$('#facts');
    const draw=()=>{
      const E=EXPL[cur];$$('.fact',facts).forEach(f=>f.classList.toggle('on',f.dataset.k===cur));
      $('#expSl').innerHTML=E.sl.map((s,i)=>`<div class="row"><label style="min-width:5rem;font-weight:700">${s[0]}</label><input type="range" min="${s[1]}" max="${s[2]}" value="${vals[cur][i]}" data-i="${i}" style="flex:1"></div>`).join('');
      $$('#expSl input').forEach(r=>r.oninput=()=>{vals[cur][+r.dataset.i]=+r.value;fig()});fig();
    };
    const fig=()=>{const o=explorerDraw(cur,vals[cur]);$('#expFig').innerHTML=o.svg;$('#expSum').textContent=EXPL[cur].txt+' → '+o.sum};
    Object.entries(EXPL).forEach(([k,E])=>{vals[k]=E.sl.map(s=>s[3]);const d=document.createElement('div');d.className='fact';d.dataset.k=k;d.innerHTML=`<b class="n">${E.n}</b><span><b>${E.name}</b><br>${E.txt}</span>`;d.onclick=()=>{cur=k;draw()};facts.appendChild(d)});
    draw();workedExample($('#exCard'),7,false);
  }else{
    el.innerHTML=`<h2>📘 Year 10 · Solving linear equations <small style="font-weight:400;color:#6b7280">— Cambridge IGCSE Mathematics 0580, Algebra</small></h2>
    <div class="grid2"><div class="card"><h3>⚖️ The Golden Rules</h3>
      <div class="facts">
      <div class="fact"><b class="n">⚖️</b><span><b>Keep it balanced</b><br>Whatever you do to one side, do to the other side.</span></div>
      <div class="fact"><b class="n">+ ↔ −</b><span><b>Inverse operations</b><br>Undo + with −, undo × with ÷.</span></div>
      <div class="fact"><b class="n">①②③</b><span><b>Order of attack</b><br>1 Expand brackets / clear fractions · 2 x-terms together · 3 numbers together · 4 divide</span></div>
      <div class="fact"><b class="n">✔</b><span><b>Always check</b><br>Substitute your x back into the original equation.</span></div></div>
      <div class="eq" style="font-size:1.3rem">3x + 5 = 20 &nbsp;→&nbsp; 3x = 15 &nbsp;→&nbsp; x = 5</div></div>
    <div class="card" id="exCard"></div></div>`;
    workedExample($('#exCard'),10,true);
  }
}

// ---------------- Practice ----------------
let curP=null;
function renderPractice(){
  const el=$('#tab-practice');
  el.innerHTML=`<h2>✏️ Practice — ${topic()}</h2>
   <div class="chips" id="lvl">${['easy','medium','hard'].map(l=>`<button class="chip ${l} ${l===S.level?'on':''}" data-l="${l}">${l==='easy'?'🟢 Easy':l==='medium'?'🟡 Medium':'🔴 Hard'} (+${REWARD[l]}🪙)</button>`).join('')}</div>
   <div class="grid2"><div id="pHost"></div>
   <div class="card"><h3>📊 Your stats</h3><p>Solved: <b id="stS"></b> · Best streak: <b id="stB"></b></p>
     <p class="rates">Streak bonus: 3 in a row = +5🪙 · 5 in a row = +10🪙.<br>First-try answers pay full coins. Collect 50🪙 → open a capsule in the 🎰 Gacha tab!</p>
     <p class="rates">Answer formats: whole numbers, decimals (2.5) or fractions (5/2).</p></div></div>`;
  $$('#lvl .chip').forEach(b=>b.onclick=()=>{S.level=b.dataset.l;save();renderPractice()});
  const next=()=>{curP=genProblem(S.year,S.level,mkR(rndSeed()));
    mountProblem($('#pHost'),curP,{next,onSolved:()=>{$('#stS').textContent=S.solved;$('#stB').textContent=S.best}});};
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
     <div class="capsule" id="cap1">🔮</div><div><button class="btn gold" id="sumBtn">✨ Summon a ${topic()} problem</button></div>
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
  $('#demoCoins').onclick=()=>{S.coins+=200;save();refresh()};
  $('#resetAll').onclick=()=>{if(confirm('Reset all progress?')){S=Object.assign({},DEF);save();hud();renderGacha()}};
  let busy=false;
  $('#sumBtn').onclick=async()=>{
    if(busy)return;busy=true;const cap=$('#cap1');cap.classList.add('spin');await sleep(1400);cap.classList.remove('spin');
    const x=Math.random();const rar=x<.03?'legend':x<.15?'epic':x<.45?'rare':'common';
    const lvl={common:'easy',rare:'medium',epic:'hard',legend:'hard'}[rar],rew={common:15,rare:30,epic:60,legend:150}[rar];
    const p=genProblem(S.year,lvl,mkR(rndSeed()));
    $('#pRes').innerHTML=`<div class="row" style="justify-content:center"><span class="tag r-${rar}" style="font-size:1rem">${RAR[rar].name} PROBLEM</span></div><div id="pc" style="max-width:640px;margin:.5rem auto"></div>`;
    burst(rar==='legend'?'👑💎🔥':'✨',rar==='common'?5:16);
    mountProblem($('#pc'),p,{reward:rew,boss:rar==='legend',next:null,onSolved:()=>{if(rar==='legend'){S.tickets++;toast('🎟️ Boss defeated! Free pull ticket earned');}save();refresh()}});
    busy=false;
  };
  const doPull=async n=>{
    if(busy)return;
    if(n===1){if(S.tickets>0)S.tickets--;else if(S.coins>=PULL)S.coins-=PULL;else return}
    else{if(S.coins<PULL*9)return;S.coins-=PULL*9}
    busy=true;save();hud();const cap=$('#cap2');cap.classList.add('spin');$('#gRes').innerHTML='';await sleep(1400);cap.classList.remove('spin');
    const res=[];for(let i=0;i<n;i++)res.push(pullOne());save();
    $('#gRes').innerHTML=res.map(o=>monHTML(o.m,o.dup?`<small>Duplicate → +${RAR[o.m.r].refund}🪙</small>`:'<small>✨ NEW!</small>')).join('');
    const best=res.reduce((a,o)=>['common','rare','epic','legend'].indexOf(o.m.r)>a?['common','rare','epic','legend'].indexOf(o.m.r):a,0);
    burst(best>=3?'👑💎🔥🌟':best==2?'💜✨':'✨',best*8+8);
    refresh();busy=false;
  };
  $('#p1').onclick=()=>doPull(1);$('#p10').onclick=()=>doPull(10);
}

// ---------------- Worksheets ----------------
const TITLES_SHEET={7:'Angles: lines, points &amp; triangles',10:'Solving linear equations'};
const SUB={7:'CAMBRIDGE LOWER SECONDARY · MATHEMATICS · YEAR 7 · GEOMETRY',10:'CAMBRIDGE IGCSE MATHEMATICS (0580) · YEAR 10 · ALGEBRA'};
const REMEMBER={
7:`<h4>📌 Remember</h4><ul><li>Angles on a <b>straight line</b> add up to <b>180°</b></li><li>Angles around a <b>point</b> add up to <b>360°</b></li><li><b>Vertically opposite</b> angles (X-shape) are <b>equal</b></li><li>Angles in a <b>triangle</b> add up to <b>180°</b>; in a <b>quadrilateral</b> to <b>360°</b></li><li>Equal sides (dashes) in an isosceles triangle mean <b>equal base angles</b></li></ul>
<div class="gloss"><b>Words:</b> angle — угол · vertex — вершина · straight line — прямая · vertically opposite — вертикальные углы · triangle — треугольник · quadrilateral — четырёхугольник · sum — сумма · protractor — транспортир</div>`,
10:`<h4>📌 Remember</h4><ul><li><b>Golden rule:</b> whatever you do to one side, do the same to the other side.</li><li>Use <b>inverse operations</b>: + ↔ −, × ↔ ÷</li><li><b>Order:</b> ① expand brackets / clear fractions ② x-terms to one side ③ numbers to the other ④ divide ⑤ <b>check</b> by substituting</li></ul>
<div class="gloss"><b>Words:</b> equation — уравнение · solve — решить · expand — раскрыть скобки · inverse operation — обратная операция · term — слагаемое · coefficient — коэффициент · fraction — дробь · substitute — подставить</div>`};
const DEFCFG=()=>({year:S.year,e:4,m:4,h:2,seed:7001,key:'none',title:'',theory:true,challenge:true});
let HW=DEFCFG();

function genList(year,level,n,r){
  const gens=r.shuffle(GEN[year][level]),out=[];
  for(let i=0;i<n;i++){
    let p=null;for(let t=0;t<30&&!p;t++){try{p=gens[(i+t)%gens.length](r)}catch(e){p=null}}
    p.year=year;p.level=level;p.label=p.label||'x =';
    if(year===10){p.unit='';if(p.text===undefined)p.text='Solve the equation.';p.svg=null}
    out.push(p);
  }
  return out;
}
function qCard(p,id){
  return `<div class="qcard ${p.year===10?'alg':''}"><div class="qn">${id}</div><div class="qt">${p.text||''}</div>${p.eq?`<div class="eq">${p.eq}</div>`:''}${p.svg||''}${p.note?`<div class="note">${p.note}</div>`:''}<div class="qa">${p.label} <u>&nbsp;</u> ${p.unit||''}</div></div>`;
}
function buildSheetHTML(cfg){
  const y=cfg.year,r=mkR(cfg.seed);
  const lv=[['easy','A',cfg.e,'🟢 Level 1 — Warm-up','one or two steps'],['medium','B',cfg.m,'🟡 Level 2 — Getting stronger','more steps'],['hard','C',cfg.h,'🔴 Level 3 — Boss round','think carefully!']];
  const sets=lv.map(([l,L,n])=>genList(y,l,n,r));
  const total=cfg.e+cfg.m+cfg.h;
  const head=`<div class="sh-head"><div><div class="sub">${SUB[y]}</div><h1>${cfg.title||TITLES_SHEET[y]}</h1></div><div style="font-size:26pt">🎲</div></div>`;
  const key=()=>{
    let rows='';
    lv.forEach(([l,L],i)=>sets[i].forEach((p,j)=>{rows+=`<tr><td><b>${L}${j+1}</b></td><td class="a">${ansText(p)}</td><td class="eqs">${p.eq?p.eq+' &nbsp;→&nbsp; ':''}${p.steps.join(' &nbsp;→&nbsp; ')}</td></tr>`}));
    return `<div class="sheet ${cfg.key==='with'?'pb':''}" style="${cfg.key==='with'?'':''}">${head.replace(cfg.title||TITLES_SHEET[y],'ANSWER KEY — '+(cfg.title||TITLES_SHEET[y]))}<p><b>Teacher copy.</b> Total marks: ${total}. Seed ${cfg.seed}.</p><table class="keytbl"><tr><th>Q</th><th>Answer</th><th>Working</th></tr>${rows}</table></div>`;
  };
  if(cfg.key==='only')return key();
  let h=`<div class="sheet">${head}<div class="sh-fields"><span>Name:</span><span>Class:</span><span>Date:</span><span class="sc">Score: /${total}</span></div>`;
  if(cfg.theory){
    h+=`<div class="remember">${REMEMBER[y]}</div>`;
    const ex=genList(y,'medium',1,mkR(cfg.seed+777))[0];
    h+=`<div class="example"><h4>✍️ Worked example</h4><div class="ex-flex"><div style="flex:1">${ex.text?`<div>${ex.text}</div>`:''}${ex.eq?`<div class="eq">${ex.eq}</div>`:''}<ol>${ex.steps.map(s=>`<li>${s}</li>`).join('')}</ol></div>${ex.svg?`<div style="flex:0 0 170px">${ex.svg}</div>`:''}</div></div>`;
  }
  lv.forEach(([l,L,n,ttl,sub],i)=>{if(n>0)h+=`<div class="lvl ${l}">${ttl}<small>${sub} · ${n} question${n>1?'s':''}</small></div><div class="qgrid">${sets[i].map((p,j)=>qCard(p,L+(j+1))).join('')}</div>`});
  if(cfg.challenge){
    const rr=mkR(cfg.seed+31);
    h+=y===7?`<div class="challenge"><h4>🏆 Challenge corner — measure &amp; draw</h4>
      Use a protractor and ruler. Draw angle <b>${rr.int(3,8)*10+5}°</b> and angle <b>${rr.int(11,16)*10+5}°</b> (label the vertex). Then draw two crossing lines, measure all four angles and check that they add up to <b>360°</b>.<div class="drawbox"></div></div>`
      :`<div class="challenge"><h4>🏆 Challenge corner</h4><b>Error hunt:</b> Sam solves 3(x + 4) = 21 like this: <i>3x + 4 = 21 → 3x = 17 → x = 17/3</i>. Find Sam’s mistake and solve it correctly.<br><b>Create:</b> write your own equation with x on both sides whose solution is x = 5. Swap with a partner and solve it!<div class="drawbox" style="height:22mm"></div></div>`;
  }
  h+=`<div class="exit"><span><b>Exit ticket:</b> Today I learned …………………………………………</span><span>I feel: 😟 &nbsp; 😐 &nbsp; 🙂 &nbsp; 😄</span></div><div class="seedtag">MathQuest · seed ${cfg.seed}</div></div>`;
  if(cfg.key==='with')h+=key();
  return h;
}
function renderHW(){
  const el=$('#tab-hw');HW.year=S.year;
  const c=HW;
  el.innerHTML=`<div class="noprint"><h2>🖨️ PDF worksheets — ${topic()}</h2>
   <div class="card"><div class="chips"><span style="font-weight:700;padding:.4rem 0">Presets:</span>
     <button class="chip" data-p="4,4,2">Class handout 4/4/2</button><button class="chip" data-p="5,5,3">Homework 5/5/3</button><button class="chip" data-p="0,6,4">Challenge 0/6/4</button><button class="chip" data-p="8,0,0">Easy drill 8/0/0</button></div>
   <div class="ctl">
    <div><label>Title (optional)</label><input id="hwT" value="${c.title}" placeholder="${TITLES_SHEET[S.year].replace(/&amp;/g,'&')}"></div>
    <div><label>🟢 Easy</label><input id="hwE" type="number" min="0" max="12" value="${c.e}"></div>
    <div><label>🟡 Medium</label><input id="hwM" type="number" min="0" max="12" value="${c.m}"></div>
    <div><label>🔴 Hard</label><input id="hwH" type="number" min="0" max="12" value="${c.h}"></div>
    <div><label>Seed (same seed = same sheet)</label><input id="hwS" type="number" value="${c.seed}"></div>
    <div><label>Answer key</label><select id="hwK"><option value="none">None (student copy)</option><option value="with">Add at the end</option><option value="only">Answer key only</option></select></div>
    <div><label>&nbsp;</label><label style="font-size:.9rem;color:#111"><input type="checkbox" id="hwTh" ${c.theory?'checked':''} style="width:auto"> Remember box + example</label></div>
    <div><label>&nbsp;</label><label style="font-size:.9rem;color:#111"><input type="checkbox" id="hwCh" ${c.challenge?'checked':''} style="width:auto"> Challenge corner</label></div>
   </div>
   <div class="row" style="margin-top:.8rem"><button class="btn alt" id="hwDice">🎲 New numbers</button><button class="btn green" id="hwPrint">🖨️ Print / Save as PDF</button>
   <span class="rates">In the print dialog choose <b>“Save as PDF”</b>, paper A4, margins Default, turn <b>off</b> “Headers and footers”.</span></div></div></div>
   <div class="preview" id="sheetHost"></div>`;
  $('#hwK').value=c.key;
  const upd=()=>{
    c.title=$('#hwT').value;c.e=Math.max(0,+$('#hwE').value||0);c.m=Math.max(0,+$('#hwM').value||0);c.h=Math.max(0,+$('#hwH').value||0);
    c.seed=+$('#hwS').value||1;c.key=$('#hwK').value;c.theory=$('#hwTh').checked;c.challenge=$('#hwCh').checked;
    $('#sheetHost').innerHTML=buildSheetHTML(c);
  };
  $$('.ctl input,.ctl select',el).forEach(i=>i.onchange=upd);
  $$('.chip[data-p]',el).forEach(b=>b.onclick=()=>{const [e,m,h]=b.dataset.p.split(',');$('#hwE').value=e;$('#hwM').value=m;$('#hwH').value=h;upd()});
  $('#hwDice').onclick=()=>{$('#hwS').value=Math.floor(Math.random()*90000)+1000;upd()};
  $('#hwPrint').onclick=()=>window.print();
  upd();
}

// ---------------- tabs / init ----------------
const R_={learn:renderLearn,practice:renderPractice,gacha:renderGacha,hw:renderHW};
function openTab(t){
  $$('nav.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
  $$('.tab').forEach(s=>s.classList.toggle('on',s.id==='tab-'+t));
  R_[t]();
}
const curTab=()=>$('nav.tabs button.on').dataset.t;
$$('nav.tabs button').forEach(b=>b.onclick=()=>openTab(b.dataset.t));
$$('#yearSeg button').forEach(b=>b.onclick=()=>{S.year=+b.dataset.y;HW.title='';save();hud();openTab(curTab())});
$('#projBtn').onclick=()=>{S.proj=!S.proj;save();hud()};

function selfTest(){
  const bad=[];let n=0;
  for(const y of [7,10])for(const l of ['easy','medium','hard'])for(let i=0;i<1500;i++){
    n++;let p;
    try{p=genProblem(y,l,mkR(i*7919+y))}catch(e){bad.push(`${y}/${l}/${i}: ${e.message}`);continue}
    if(!Number.isFinite(p.ans)||!p.steps.length)bad.push(`${y}/${l}/${i}: no answer`);
    if(y===10&&Math.abs(p.L(p.ans)-p.R(p.ans))>1e-9)bad.push(`10/${l}/${i}: L!=R ${p.L(p.ans)} ${p.R(p.ans)} ${p.eq}`);
    if(y===10&&p.eq&&/NaN|undefined/.test(p.eq+p.steps.join('')))bad.push(`10/${l}/${i}: NaN text`);
    if(y===7&&/NaN|undefined/.test((p.svg||'')+p.steps.join('')))bad.push(`7/${l}/${i}: NaN svg`);
  }
  // UI flow: correct answer pays out, wrong one does not
  if(location.hash!=='#selftest-anim')burst=()=>{};   // headless browsers crash on the emoji animation
  if(location.hash!=='#selftest-gen')for(const y of [7,10]){
    const host=document.createElement('div');document.body.appendChild(host);
    const p=genProblem(y,'medium',mkR(5));const c0=S.coins;
    mountProblem(host,p,{});
    if(location.hash==='#selftest-mount'){continue}
    $('input',host).value='12345';$('.check',host).click();
    if(!$('.fb',host).classList.contains('bad'))bad.push('wrong answer not flagged');
    if(location.hash==='#selftest-wrong'){continue}
    $('input',host).value=fmtAns(p.ans).split(' ')[0].replace('−','-');$('.check',host).click();
    if(!$('.fb',host).classList.contains('ok')||S.coins<=c0)bad.push('correct answer failed y'+y+' '+fmtAns(p.ans));
  }
  // gacha distribution + pity
  const cnt={common:0,rare:0,epic:0,legend:0};S.pity=0;let maxGap=0,gap=0;
  for(let i=0;i<20000;i++){const o=pullOne();cnt[o.m.r]++;if(o.m.r==='epic'||o.m.r==='legend'){gap=0}else{gap++;maxGap=Math.max(maxGap,gap)}}
  if(maxGap>9)bad.push('pity broken, gap '+maxGap);
  bad.push('INFO pulls '+JSON.stringify(cnt)+' maxGap '+maxGap);
  document.title='SELFTEST '+n+' problems, '+bad.filter(b=>!b.startsWith('INFO')).length+' bad';
  const pre=document.createElement('pre');pre.id='selftest';pre.textContent=document.title+'\n'+bad.slice(0,30).join('\n');document.body.prepend(pre);
}

(function init(){
  const h=location.hash;
  if(h.startsWith('#selftest')){selfTest();return}
  if(h.startsWith('#sheet')){
    const q=new URLSearchParams(h.split('?')[1]||'');
    document.body.classList.add('sheet-only');
    S.year=+(q.get('year')||7);
    HW={year:S.year,e:+(q.get('e')??4),m:+(q.get('m')??4),h:+(q.get('h')??2),seed:+(q.get('seed')||7001),key:q.get('key')||'none',title:q.get('title')||'',theory:q.get('theory')!=='0',challenge:q.get('challenge')!=='0'};
    $$('.tab').forEach(s=>s.classList.toggle('on',s.id==='tab-hw'));
    // build sheet directly (no controls)
    $('#tab-hw').innerHTML=`<div class="preview" id="sheetHost">${buildSheetHTML(HW)}</div>`;
    return;
  }
  const m=h.match(/^#tab=(\w+)(?:&year=(\d+))?/);
  if(m&&m[2]){S.year=+m[2]}
  hud();openTab(m&&R_[m[1]]?m[1]:'learn');
})();
