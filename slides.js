/* Interactive slides: every Year 7 topic gets the same 7-slide deck, built from its data + widget + generators. */
function buildDeck(t){
  return [
  {name:'Start',mount:h=>{
    h.innerHTML=`<div class="s-title" style="--c:${t.color}"><div class="s-ico">${t.icon}</div><div class="s-u">Unit ${t.u} · ${t.strand}</div><h1>${t.title}</h1><p class="s-obj">${t.obj}</p>
      <div class="s-vocab">${t.vocab.map(v=>`<span>${v}</span>`).join('')}</div><p class="rates">Use ◀ ▶ buttons or the arrow keys. Click blurred ideas to reveal them!</p></div>`}},
  {name:'Explore',mount:h=>{
    h.innerHTML=`<div class="grid2"><div class="card"><h3>💡 Key ideas <small>(click each one to reveal)</small></h3><ul class="ideas">${t.ideas.map(i=>`<li class="blur">${i}</li>`).join('')}</ul></div><div class="card wbox"></div></div>`;
    $$('.blur',h).forEach(li=>li.onclick=()=>li.classList.remove('blur'));
    mountWidget($('.wbox',h),W[t.widget])}},
  {name:'Worked example',mount:h=>{h.innerHTML='<div class="card" style="max-width:760px;margin:auto"></div>';workedExample($('.card',h),t.id)}},
  {name:'Your turn',mount:h=>{
    let lvl='easy';
    h.innerHTML=`<h3 style="text-align:center">✏️ Your turn — whiteboards up, then check!</h3><div class="chips" style="justify-content:center"></div><div class="tryHost" style="max-width:680px;margin:auto"></div>`;
    const draw=()=>{
      $('.chips',h).innerHTML=['easy','medium','hard'].map(l=>`<button class="chip ${l} ${l===lvl?'on':''}" data-l="${l}">${l==='easy'?'🟢 Easy':l==='medium'?'🟡 Medium':'🔴 Hard'}</button>`).join('');
      $$('.chip',h).forEach(b=>b.onclick=()=>{lvl=b.dataset.l;draw()});
      const next=()=>mountProblem($('.tryHost',h),genTopic(t.id,lvl,mkR(rndSeed())),{next});next();
    };draw()}},
  {name:'Spot the mistake',mount:h=>{
    const m=t.mistake;
    h.innerHTML=`<div class="card" style="max-width:640px;margin:auto"><h3>🔍 Spot the mistake</h3><div class="wrongbox">${m.wrong.map(l=>`<div>${l}</div>`).join('')}</div><p>Talk to your partner: <b>what went wrong?</b></p>
      <button class="btn" id="rvBtn">Reveal the error</button><div class="rv" hidden><p>❌ ${m.why}</p><p>✅ ${m.fix}</p></div></div>`;
    $('#rvBtn',h).onclick=()=>{$('.rv',h).hidden=false;$('#rvBtn',h).hidden=true}}},
  {name:'Boss',mount:h=>{
    h.innerHTML=`<h3 style="text-align:center">⚔️ Boss challenge</h3><div class="bossHost" style="max-width:680px;margin:auto"></div>`;
    const next=()=>mountProblem($('.bossHost',h),genTopic(t.id,'hard',mkR(rndSeed())),{boss:true,reward:60,next});next()}},
  {name:'Exit',mount:h=>{
    const done=(S.tp[t.id]||{}).claimed;
    h.innerHTML=`<div class="grid2"><div class="card"><h3>✅ I can…</h3>${t.ican.map((c,i)=>`<label class="ick"><input type="checkbox"> ${c}</label>`).join('')}
      <button class="btn gold" id="claim" disabled>${done?'Already claimed ✔':'Tick everything to claim +20 🪙'}</button></div>
      <div class="card"><h3>📘 Key words</h3><ul>${t.vocab.map(v=>`<li>${v}</li>`).join('')}</ul><h3>🏆 Challenge</h3><p>${t.challenge}</p></div></div>`;
    const cb=$$('input',h),btn=$('#claim',h);
    const upd=()=>{btn.disabled=done||!cb.every(c=>c.checked)};
    cb.forEach(c=>c.onchange=upd);
    btn.onclick=()=>{S.coins+=20;(S.tp[t.id]=S.tp[t.id]||{solved:0}).claimed=true;save();hud();btn.textContent='Claimed! +20 🪙';btn.disabled=true;burst('🪙✨🎉',16)}}},
  ];
}

const DECK={i:0,slides:[],t:null};
function renderSlides(){
  const el=$('#tab-slides');
  if(S.topic==='all')S.topic='t01';
  const t=TMAP[S.topic];
  el.innerHTML=`<div class="row noprint" style="margin-bottom:.6rem"><b>Unit:</b> ${topicSelect('sTopic',S.topic,false)}<span class="sp"></span><button class="btn alt" id="fsBtn">⛶ Present full screen</button></div>
  <div id="deck" class="deck" style="--c:${t.color}"><div class="deckbar"><b>${t.icon} Unit ${t.u} · ${t.title}</b><span class="sp"></span><span id="dName"></span></div>
  <div id="dDots" class="dots"></div><div id="stage" class="stage"></div>
  <div class="decknav"><button class="btn alt" id="dPrev">◀ Back</button><span id="dNum"></span><button class="btn" id="dNext">Next ▶</button></div></div>`;
  $('#sTopic').onchange=e=>{S.topic=e.target.value;save();renderSlides()};
  $('#fsBtn').onclick=()=>{const d=$('#deck');(d.requestFullscreen||d.webkitRequestFullscreen||(()=>{})).call(d)};
  DECK.slides=buildDeck(t);DECK.t=t;DECK.i=0;
  $('#dPrev').onclick=()=>goSlide(DECK.i-1);$('#dNext').onclick=()=>goSlide(DECK.i+1);
  goSlide(0);
}
function goSlide(i){
  i=Math.max(0,Math.min(DECK.slides.length-1,i));DECK.i=i;
  const st=$('#stage');st.innerHTML='';const h=document.createElement('div');h.className='slideIn';st.appendChild(h);
  DECK.slides[i].mount(h);
  $('#dName').textContent=DECK.slides[i].name;$('#dNum').textContent=`${i+1} / ${DECK.slides.length}`;
  $('#dDots').innerHTML=DECK.slides.map((s,k)=>`<button class="dot ${k===i?'on':''} ${k<i?'seen':''}" data-k="${k}" title="${s.name}"></button>`).join('');
  $$('#dDots .dot').forEach(b=>b.onclick=()=>goSlide(+b.dataset.k));
  $('#dPrev').disabled=i===0;$('#dNext').disabled=i===DECK.slides.length-1;
}
document.addEventListener('keydown',e=>{
  const tab=$('#tab-slides');if(!tab||!tab.classList.contains('on'))return;
  if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;
  if(e.key==='ArrowRight'||e.key==='PageDown')goSlide(DECK.i+1);
  else if(e.key==='ArrowLeft'||e.key==='PageUp')goSlide(DECK.i-1);
});
