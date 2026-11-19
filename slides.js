/* Interactive lesson decks.  1 unit = 1 week = 6 lessons x 40 min.
   Lessons 1-5:  Title -> Starter (5) -> Explore (8) -> Worked example (7) -> Your turn (12) -> Spot the mistake (3) -> Plenary (5)  [+ Extension slide]
   Lesson 6:     Title -> Starter (5) -> Revise (8) -> Mixed practice (7) -> Unit test (15) -> Reflect (5)                                     */
const lc=s=>s.charAt(0).toLowerCase()+s.slice(1);
const wrongAnswers=(a,r)=>{const c=[-a,a+1,a-1,a*2,a+10,a-10,a/10].map(x=>rd(x,4)).filter(x=>x!==a&&Number.isFinite(x)&&Math.abs(x)<1e7);return r.pick(c.length?c:[a+1])};

function prevPool(t,li){                       // where the starter questions come from
  if(li>1)return [t.id,li-1];
  const i=TOPICS.findIndex(x=>x.id===t.id);return i>0?[TOPICS[i-1].id,0]:[t.id,0];
}
function miniStarter(h,tid,li,n=3){
  h.innerHTML=`<div class="starterGrid"></div>`;
  const r=mkR(rndSeed()),g=$('.starterGrid',h);
  genTopicList(tid,'easy',n,r,li).forEach(p=>{const d=document.createElement('div');g.appendChild(d);mountProblem(d,p,{reward:5})});
}

function buildDeck(t,li=1){
  const L=lessonOf(t.id,li);
  if(L.test)return buildTestDeck(t,L);
  const [ptid,pli]=prevPool(t,li),pt=TMAP[ptid];
  const slides=[
  {name:'Start',min:0,mount:h=>{
    h.innerHTML=`<div class="s-title" style="--c:${t.color}"><div class="s-ico">${t.icon}</div><div class="s-u">Week ${t.u} · Lesson ${li} of 6 · ${t.strand}</div><h1>${L.title}</h1>
      <p class="s-obj"><b>Learning objective:</b> ${L.obj}</p>
      <div class="timeline"><span style="flex:5">Starter 5′</span><span style="flex:8">Explore 8′</span><span style="flex:7">Example 7′</span><span style="flex:12">Your turn 12′</span><span style="flex:3">Mistake 3′</span><span style="flex:5">Plenary 5′</span></div>
      <div class="s-vocab">${t.vocab.slice(0,5).map(v=>`<span>${v}</span>`).join('')}</div></div>`}},
  {name:'Starter',min:5,mount:h=>{
    h.innerHTML=`<h3 class="sh">⏱ Starter · 5 minutes — recall from ${li>1?'the last lesson':'last week'}${li===1&&pt!==t?` (${pt.title})`:''}</h3><div class="sbody"></div>`;
    miniStarter($('.sbody',h),ptid,pli,3)}},
  {name:'Explore',min:8,mount:h=>{
    h.innerHTML=`<div class="grid2 fillrow"><div class="card"><h3>💡 Key ideas <small>(click each one to reveal)</small></h3><ul class="ideas">${L.ideas.map(i=>`<li class="blur">${i}</li>`).join('')}</ul></div><div class="card wbox"></div></div>`;
    $$('.blur',h).forEach(li2=>li2.onclick=()=>li2.classList.remove('blur'));
    mountWidget($('.wbox',h),W[t.widget],L.init)}},
  {name:'Worked example',min:7,mount:h=>{h.innerHTML='<div class="card wide"></div>';workedExample($('.card',h),t.id,li)}},
  {name:'Your turn',min:12,mount:h=>{
    let lvl='easy';
    h.innerHTML=`<h3 class="sh">✏️ Your turn · 12 minutes — whiteboards or workbooks, then check!</h3><div class="chips" style="justify-content:center"></div><div class="tryHost wide"></div>`;
    const draw=()=>{
      $('.chips',h).innerHTML=['easy','medium','hard'].map(l=>`<button class="chip ${l} ${l===lvl?'on':''}" data-l="${l}">${l==='easy'?'🟢 Easy':l==='medium'?'🟡 Medium':'🔴 Hard'}</button>`).join('');
      $$('.chip',h).forEach(b=>b.onclick=()=>{lvl=b.dataset.l;draw()});
      const next=()=>mountProblem($('.tryHost',h),genTopic(t.id,lvl,mkR(rndSeed()),li),{next});next();
    };draw()}},
  {name:'Spot the mistake',min:3,mount:h=>{
    if(li===3&&t.mistake){
      const m=t.mistake;
      h.innerHTML=`<div class="card wide"><h3>🔍 Spot the mistake · 3 minutes</h3><div class="wrongbox">${m.wrong.map(l=>`<div>${l}</div>`).join('')}</div><p>Talk to your partner: <b>what went wrong?</b></p>
        <button class="btn" id="rvBtn">Reveal the error</button><div class="rv" hidden><p>❌ ${m.why}</p><p>✅ ${m.fix}</p></div></div>`;
      $('#rvBtn',h).onclick=()=>{$('.rv',h).hidden=false;$('#rvBtn',h).hidden=true};return;
    }
    const r=mkR(rndSeed()),p=genTopic(t.id,'medium',r,li),w=wrongAnswers(p.ans,r);
    h.innerHTML=`<div class="card wide"><h3>🔍 Spot the mistake · 3 minutes</h3><div class="q-text">${p.text||''}</div>${p.eq?`<div class="eq">${p.eq}</div>`:''}${p.svg?`<div>${p.svg}</div>`:''}
      <div class="wrongbox">A student answered: <b>${p.label} ${M(w)}${p.unit||''}</b></div><p>Is this right? Work it out on your whiteboard, then check.</p>
      <button class="btn" id="rvBtn">Reveal</button><div class="rv" hidden><ol class="steps">${p.steps.map(s=>`<li>${s}</li>`).join('')}</ol><p>✅ Correct answer: <b>${ansText(p)}</b></p><p>❌ The student’s answer was wrong. What error might they have made?</p></div></div>`;
    $('#rvBtn',h).onclick=()=>{$('.rv',h).hidden=false;$('#rvBtn',h).hidden=true}}},
  {name:'Extension',min:0,mount:h=>{
    h.innerHTML=`<h3 class="sh">⚔️ Extension — boss challenge (finished early?)</h3><div class="bossHost wide"></div>`;
    const next=()=>mountProblem($('.bossHost',h),genTopic(t.id,'hard',mkR(rndSeed()),li),{boss:true,reward:60,next});next()}},
  {name:'Plenary',min:5,mount:h=>{
    const key='l'+li,done=(S.tp[t.id]||{})[key];
    h.innerHTML=`<div class="grid2 fillrow"><div class="card"><h3>✅ Plenary · 5 minutes — I can…</h3>
      <label class="ick"><input type="checkbox"> ${lc(L.obj).replace(/^/,'')}</label><label class="ick"><input type="checkbox"> explain my method to a partner</label><label class="ick"><input type="checkbox"> check my answer by substituting or estimating</label>
      <button class="btn gold" id="claim" disabled>${done?'Already claimed ✔':'Tick everything to claim +10 🪙'}</button>
      <p class="rates">Exit ticket: ${li<5?`Next lesson: <b>${t.lessons[li].title}</b>`:'Tomorrow: Review &amp; unit test!'}</p></div>
      <div class="card"><h3>📘 Key words</h3><ul>${t.vocab.map(v=>`<li>${v}</li>`).join('')}</ul><h3>🏆 Challenge</h3><p>${t.challenge}</p></div></div>`;
    const cb=$$('input',h),btn=$('#claim',h);
    cb.forEach(c=>c.onchange=()=>{btn.disabled=done||!cb.every(x=>x.checked)});
    btn.onclick=()=>{S.coins+=10;(S.tp[t.id]=S.tp[t.id]||{solved:0})[key]=true;save();hud();btn.textContent='Claimed! +10 🪙';btn.disabled=true;burst('🪙✨🎉',14)}}},
  ];
  return slides;
}

// ---- Lesson 6: revise + unit test ----
function mountTest(h,t){
  const r=mkR(rndSeed()),probs=[...genTopicList(t.id,'easy',4,r),...genTopicList(t.id,'medium',4,r),...genTopicList(t.id,'hard',2,r)];
  h.innerHTML=`<div class="testbar"><b>📝 ${t.title} — unit test</b><span class="sp"></span><span id="tTimer" class="pill" style="background:#fee2e2;color:#991b1b">⏱ 15:00</span></div>
   <div class="testgrid">${probs.map((p,i)=>`<div class="tq"><div class="qn2">Q${i+1} <span class="tag ${p.level}">${p.level}</span></div><div class="q-text">${p.text||''}</div>${p.eq?`<div class="eq">${p.eq}</div>`:''}${p.svg?`<div>${p.svg}</div>`:''}
     <div class="ansrow"><label>${p.label||''}</label><input inputmode="decimal" autocomplete="off"><span>${p.unit||''}</span></div><div class="tres"></div></div>`).join('')}</div>
   <div style="text-align:center;margin:1rem"><button class="btn green" id="tSubmit" style="font-size:1.2rem">Submit test ✔</button><div id="tScore" class="eq"></div></div>`;
  let secs=900,done=false;
  const tick=setInterval(()=>{
    if(!document.body.contains(h)||done){clearInterval(tick);return}
    secs--;const el=$('#tTimer',h);if(el)el.textContent=`⏱ ${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`;
    if(secs<=0){clearInterval(tick);submit()}
  },1000);
  function submit(){
    if(done)return;done=true;let score=0;
    $$('.tq',h).forEach((q,i)=>{const p=probs[i],v=$('input',q).value,ok=v.trim()!==''&&checkAnswer(p,v);if(ok)score++;
      $('.tres',q).innerHTML=ok?'<b style="color:#16a34a">✔ Correct</b>':`<b style="color:#dc2626">✘</b> Answer: <b>${ansText(p)}</b>`;q.classList.add(ok?'tok':'tbad');$('input',q).disabled=true});
    const medal=score>=9?'🥇 Gold':score>=7?'🥈 Silver':score>=5?'🥉 Bronze':'Keep practising!';
    const coins=score*5;S.coins+=coins;S.xp+=coins;const tp=S.tp[t.id]=S.tp[t.id]||{solved:0};tp.test=Math.max(tp.test||0,score);save();hud();
    $('#tScore',h).innerHTML=`Score: <b>${score} / ${probs.length}</b> — ${medal} <small>(+${coins} 🪙)</small>`;$('#tSubmit',h).disabled=true;
    if(score>=7)burst('🏆🥇🎉✨',24);
    if(h.scrollIntoView)$('#tScore',h).scrollIntoView({block:'center'});
  }
  $('#tSubmit',h).onclick=submit;
}
function buildTestDeck(t,L){
  const prev=t.lessons[4];
  return [
  {name:'Start',min:0,mount:h=>{
    h.innerHTML=`<div class="s-title" style="--c:${t.color}"><div class="s-ico">${t.icon}</div><div class="s-u">Week ${t.u} · Lesson 6 of 6 · ${t.strand}</div><h1>Review &amp; unit test</h1><p class="s-obj"><b>Learning objective:</b> ${L.obj}</p>
      <div class="timeline"><span style="flex:5">Starter 5′</span><span style="flex:8">Revise 8′</span><span style="flex:7">Practice 7′</span><span style="flex:15">Unit test 15′</span><span style="flex:5">Reflect 5′</span></div>
      <div class="s-vocab">${t.lessons.slice(0,5).map((l,i)=>`<span>L${i+1} ${l.title}</span>`).join('')}</div></div>`}},
  {name:'Starter',min:5,mount:h=>{
    h.innerHTML=`<h3 class="sh">⏱ Starter · 5 minutes — quick recall from this week</h3><div class="sbody"></div>`;
    miniStarter($('.sbody',h),t.id,0,3)}},
  {name:'Revise',min:8,mount:h=>{
    h.innerHTML=`<div class="grid2 fillrow"><div class="card"><h3>💡 This week’s big ideas <small>(click to reveal)</small></h3><ul class="ideas">${t.lessons.slice(0,5).map(l=>`<li class="blur"><b>${l.title}:</b> ${l.ideas[0]}</li>`).join('')}</ul></div><div class="card wbox"></div></div>`;
    $$('.blur',h).forEach(li2=>li2.onclick=()=>li2.classList.remove('blur'));
    mountWidget($('.wbox',h),W[t.widget],t.lessons[0].init)}},
  {name:'Mixed practice',min:7,mount:h=>{
    let lvl='medium';
    h.innerHTML=`<h3 class="sh">✏️ Mixed practice · 7 minutes — any lesson from this week</h3><div class="chips" style="justify-content:center"></div><div class="tryHost wide"></div>`;
    const draw=()=>{
      $('.chips',h).innerHTML=['easy','medium','hard'].map(l=>`<button class="chip ${l} ${l===lvl?'on':''}" data-l="${l}">${l==='easy'?'🟢 Easy':l==='medium'?'🟡 Medium':'🔴 Hard'}</button>`).join('');
      $$('.chip',h).forEach(b=>b.onclick=()=>{lvl=b.dataset.l;draw()});
      const next=()=>mountProblem($('.tryHost',h),genTopic(t.id,lvl,mkR(rndSeed())),{next});next();
    };draw()}},
  {name:'Unit test',min:15,mount:h=>mountTest(h,t)},
  {name:'Reflect',min:5,mount:h=>{
    const done=(S.tp[t.id]||{}).claimed;
    h.innerHTML=`<div class="grid2 fillrow"><div class="card"><h3>✅ Week review — I can…</h3>${t.ican.map(c=>`<label class="ick"><input type="checkbox"> ${c}</label>`).join('')}
      <button class="btn gold" id="claim" disabled>${done?'Already claimed ✔':'Tick everything to claim +20 🪙'}</button></div>
      <div class="card"><h3>🏆 Challenge</h3><p>${t.challenge}</p><h3>📘 Key words</h3><ul>${t.vocab.map(v=>`<li>${v}</li>`).join('')}</ul><p class="rates">Next week: <b>${TOPICS[TOPICS.findIndex(x=>x.id===t.id)+1]?.title||'Well done — Year 7 complete! 🎓'}</b></p></div></div>`;
    const cb=$$('input',h),btn=$('#claim',h);
    cb.forEach(c=>c.onchange=()=>{btn.disabled=done||!cb.every(x=>x.checked)});
    btn.onclick=()=>{S.coins+=20;(S.tp[t.id]=S.tp[t.id]||{solved:0}).claimed=true;save();hud();btn.textContent='Claimed! +20 🪙';btn.disabled=true;burst('🪙✨🎉',16)}}},
  ];
}

// ---- deck controller ----
const DECK={i:0,slides:[],t:null,li:1};
function lessonSelect(id,tid,val){
  return `<select id="${id}" class="topicSel">${TOPICS.find(x=>x.id===tid).lessons.map(l=>`<option value="${l.n}" ${l.n===val?'selected':''}>Lesson ${l.n}${l.n===6?' · Review &amp; test':' · '+l.title}</option>`).join('')}</select>`;
}
function renderSlides(){
  const el=$('#tab-slides');
  if(S.topic==='all')S.topic='t01';
  const t=TMAP[S.topic],li=Math.max(1,Math.min(6,S.lesson||1)),L=lessonOf(t.id,li);
  el.innerHTML=`<div class="row noprint" style="margin-bottom:.6rem"><b>Week:</b> ${topicSelect('sTopic',S.topic,false)} <b>Lesson:</b> ${lessonSelect('sLesson',t.id,li)}<span class="sp"></span><button class="btn alt" id="fsBtn">⛶ Present full screen (F)</button></div>
  <div id="deck" class="deck" style="--c:${t.color}"><div class="deckbar"><b>${t.icon} Week ${t.u} · Lesson ${li}/6 · ${li===6?'Review &amp; unit test':L.title}</b><span class="sp"></span><span id="dName"></span></div>
  <div id="dDots" class="dots"></div><div id="stage" class="stage"></div>
  <div class="decknav"><button class="btn alt" id="dPrev">◀ Back</button><span id="dNum"></span><button class="btn" id="dNext">Next ▶</button></div></div>`;
  $('#sTopic').onchange=e=>{S.topic=e.target.value;S.lesson=1;save();renderSlides()};
  $('#sLesson').onchange=e=>{S.lesson=+e.target.value;save();renderSlides()};
  $('#fsBtn').onclick=toggleFullscreen;
  DECK.slides=buildDeck(t,li);DECK.t=t;DECK.li=li;DECK.i=0;
  $('#dPrev').onclick=()=>goSlide(DECK.i-1);$('#dNext').onclick=()=>goSlide(DECK.i+1);
  goSlide(0);
}
function toggleFullscreen(){
  const d=$('#deck');if(!d)return;
  if(document.fullscreenElement)document.exitFullscreen();
  else (d.requestFullscreen||d.webkitRequestFullscreen||(()=>{})).call(d);
}
function goSlide(i){
  i=Math.max(0,Math.min(DECK.slides.length-1,i));DECK.i=i;
  const st=$('#stage');st.innerHTML='';st.scrollTop=0;const h=document.createElement('div');h.className='slideIn';st.appendChild(h);
  DECK.slides[i].mount(h);
  $('#dName').textContent=DECK.slides[i].name+(DECK.slides[i].min?` · ${DECK.slides[i].min} min`:'');$('#dNum').textContent=`${i+1} / ${DECK.slides.length}`;
  $('#dDots').innerHTML=DECK.slides.map((s,k)=>`<button class="dot ${k===i?'on':''} ${k<i?'seen':''}" data-k="${k}" title="${s.name}"></button>`).join('');
  $$('#dDots .dot').forEach(b=>b.onclick=()=>goSlide(+b.dataset.k));
  $('#dPrev').disabled=i===0;$('#dNext').disabled=i===DECK.slides.length-1;
}
document.addEventListener('keydown',e=>{
  const tab=$('#tab-slides');if(!tab||!tab.classList.contains('on'))return;
  if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;
  if(e.key==='ArrowRight'||e.key==='PageDown')goSlide(DECK.i+1);
  else if(e.key==='ArrowLeft'||e.key==='PageUp')goSlide(DECK.i-1);
  else if(e.key==='f'||e.key==='F')toggleFullscreen();
});
