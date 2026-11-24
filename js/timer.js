/* Lesson timer.
   Automatic: during the school's lesson times (default 8:30–9:10, 9:15–9:55, 10:00–10:40) it counts down the
   current lesson by the clock, and between lessons it counts down the break. Click the timer's label to change
   the times. Pressing ▶/⏸ or ↺ during a lesson switches to manual timing until that lesson ends; 🕘 goes back
   to automatic timing. Outside the lesson times it is a manual 40-minute timer.
   Soft notifications (bottom-right, with a gentle chime) mark the lesson milestones.
   Any element with class "lt" shows the timer. The state is saved, so it survives page changes and reloads. */
const LT_TOTAL=40*60,LT_WARN=5*60,LT_KEY='maths.timer',LT_SLOTS_KEY='maths.slots',LT_DEF_SLOTS='8:30-9:10, 9:15-9:55, 10:00-10:40';
const LT=Object.assign({el:0,run:false,t0:0,sid:'m'+Date.now(),auto:true,manualUntil:0,fired:{}},(()=>{try{return JSON.parse(localStorage.getItem(LT_KEY))||{}}catch(e){return{}}})());
let LT_AC=null,LT_LAST=null;
const ltNow=()=>window.LT_CLOCK?window.LT_CLOCK():Date.now();   // tests can replace the clock
const ltSave=()=>{try{localStorage.setItem(LT_KEY,JSON.stringify(LT))}catch(e){}};
const ltElapsed=()=>Math.min(LT_TOTAL,LT.el+(LT.run?(ltNow()-LT.t0)/1000:0));
const ltHM=m=>`${Math.floor(m/60)}:${String(Math.round(m%60)).padStart(2,'0')}`;
const ltParse=s=>String(s).split(/[,;\n]+/).map(x=>x.trim().match(/^(\d{1,2})[:.](\d{2})\s*[-–—]\s*(\d{1,2})[:.](\d{2})$/)).filter(Boolean)
  .map(m=>[+m[1]*60+ +m[2],+m[3]*60+ +m[4]]).filter(([a,b])=>b>a).sort((a,b)=>a[0]-b[0]);
const ltSlots=()=>ltParse(localStorage.getItem(LT_SLOTS_KEY)||LT_DEF_SLOTS);
const ltSlotsText=()=>ltSlots().map(([a,b])=>`${ltHM(a)}-${ltHM(b)}`).join(', ');

// what the timer shows now: a scheduled lesson, a break, or the manual timer
function ltState(){
  const now=ltNow(),d=new Date(now),mid=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime(),min=(now-mid)/60000,day=`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
  if(LT.manualUntil&&now>=LT.manualUntil){LT.manualUntil=0;LT.run=false;LT.el=0;ltSave()}
  const S=ltSlots();
  if(LT.auto&&!LT.manualUntil&&S.length){
    const i=S.findIndex(([a,b])=>min>=a&&min<b);
    if(i>=0){const [a,b]=S[i];return {mode:'slot',i,total:(b-a)*60,el:(min-a)*60,run:true,sid:`${day}-L${i}`,label:`Lesson ${i+1}`,range:`${ltHM(a)}–${ltHM(b)}`,end:mid+b*60000}}
    const j=S.findIndex(([a])=>min<a);
    if(j>0)return {mode:'break',i:j,wait:(S[j][0]-min)*60,sid:`${day}-B${j}`,label:'Break',range:`Lesson ${j+1} at ${ltHM(S[j][0])}`,end:mid+S[j][0]*60000};
  }
  const sl=S.findIndex(([a,b])=>min>=a&&min<b);
  return {mode:'manual',total:LT_TOTAL,el:ltElapsed(),run:LT.run,sid:LT.sid,label:'Lesson',range:LT.manualUntil?'Manual timing until the lesson ends':LT.auto&&S.length?`Lesson times: ${ltSlotsText()}`:'Manual 40-minute timer',slot:sl};
}

// ---------- sound ----------
function ltAudio(){
  try{if(!LT_AC)LT_AC=new (window.AudioContext||window.webkitAudioContext)();if(LT_AC.state==='suspended')LT_AC.resume()}catch(e){}
  return LT_AC;
}
function ltTone(freq,start,dur,vol=.2,type='sine'){
  const ac=ltAudio();if(!ac)return;const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+start;
  o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.03);g.gain.exponentialRampToValueAtTime(.001,t+dur);
  o.connect(g).connect(ac.destination);o.start(t);o.stop(t+dur+.05);
}
const ltSoftSound=()=>{ltTone(660,0,.6,.12);ltTone(880,.16,.8,.1)};
const ltWarnSound=()=>{[0,.3,.6].forEach(s=>ltTone(880,s,.35,.22))};
const ltEndSound=()=>{[[784,0],[659,.3],[523,.6],[392,.9]].forEach(([f,s])=>ltTone(f,s,.9,.25,'triangle'))};

// ---------- soft notifications ----------
function ltToast(icon,title,text,o={}){
  const host=document.fullscreenElement||document.body;let box=$('.lttoasts',host);
  if(!box){box=document.createElement('div');box.className='lttoasts';box.setAttribute('aria-live','polite');host.appendChild(box)}
  const ms=o.ms||9000,t=document.createElement('div');t.className='lttoast '+(o.cls||'');
  t.innerHTML=`<div class="lti">${icon}</div><div class="ltc"><b>${title}</b>${text?`<div>${text}</div>`:''}${o.extra||''}</div><button class="ltx" title="Dismiss">✕</button><i class="ltbar" style="animation-duration:${ms}ms"></i>`;
  box.appendChild(t);const close=()=>{t.classList.add('out');setTimeout(()=>t.remove(),300)};
  $('.ltx',t).onclick=close;t.addEventListener('click',e=>{if(e.target.closest('[data-tool]'))close()});
  let timer=setTimeout(close,ms);t.onmouseenter=()=>{clearTimeout(timer);t.classList.add('hold')};t.onmouseleave=()=>{t.classList.remove('hold');timer=setTimeout(close,3000)};
  while(box.children.length>3)box.firstChild.remove();
  if(o.sound!==false)(o.sound||ltSoftSound)();
  return t;
}
// milestones follow the lesson plan on the Objectives slide: starter 5′, demo 8′, examples 8′, practice 12′, check 7′
const LT_MS=[
  {k:'start',at:0,icon:'🚀',title:s=>`${s.label} has started`,text:s=>`${s.range&&s.mode==='slot'?s.range+' · ':''}Starter: 5 minutes.`},
  {k:'demo',at:300,icon:'💡',title:()=>'New content',text:()=>'Time for the interactive demo or the new idea (8 minutes).'},
  {k:'ex',at:780,icon:'✏️',title:()=>'Worked examples',text:()=>'Go through the examples step by step (8 minutes).'},
  {k:'prac',at:1260,icon:'🧠',title:()=>'Practice time',text:()=>'Practice for 12 minutes: random problems, a battle or the whiteboard.'},
  {k:'check',end:420,icon:'✅',title:()=>'7 minutes left',text:()=>'Check understanding.'},
  {k:'warn',end:300,icon:'⏰',title:()=>'5 minutes left',text:()=>'Time for the exit ticket.',cls:'warn',sound:()=>ltWarnSound(),extra:()=>window.onLessonWarn?window.onLessonWarn():''},
  {k:'pack',end:60,icon:'🎒',title:()=>'1 minute left',text:()=>'Pack up and tidy the room.'},
  {k:'end',end:0,icon:'🔔',title:s=>`${s.label} is over`,text:s=>{const S=ltSlots(),n=s.mode==='slot'?S[s.i+1]:null;return n?`Next: Lesson ${s.i+2} at ${ltHM(n[0])}.`:''},cls:'over',sound:()=>ltEndSound(),ms:14000}];
const ltFired=(sid,k)=>(LT.fired[sid]||[]).includes(k);
const ltFire=(sid,k)=>{LT.fired={[sid]:[...(LT.fired[sid]||[]),k]};ltSave()};
function ltMilestones(s){
  if(s.mode==='break'){if(s.wait<=60&&!ltFired(s.sid,'soon')){ltFire(s.sid,'soon');ltToast('⏳',`${s.range.split(' at ')[0]} starts in 1 minute`,'Get ready.')}return}
  if(!s.run&&!(s.mode==='manual'&&s.el>=s.total))return;
  for(const m of LT_MS){
    const at=m.end!=null?s.total-m.end:m.at;
    if(s.el>=at&&!ltFired(s.sid,m.k)){ltFire(s.sid,m.k);if(s.el-at<90||m.k==='end'&&s.el-at<300)ltToast(m.icon,m.title(s),m.text(s),{cls:m.cls,sound:m.sound,extra:m.extra?m.extra():'',ms:m.ms||(m.k==='warn'?20000:9000)})}
  }
}

function ltFmt(sec){const s=Math.max(0,Math.ceil(sec));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`}
function ltTick(){
  const s=ltState();
  if(s.mode==='manual'&&LT.run&&s.el>=s.total){LT.el=s.total;LT.run=false;ltSave();s.run=false}
  // a scheduled lesson that just ended (the timer has moved on to the break): announce its end
  if(LT_LAST&&LT_LAST.mode==='slot'&&s.sid!==LT_LAST.sid&&!ltFired(LT_LAST.sid,'end')){const p=LT_LAST,m=LT_MS[LT_MS.length-1];ltFire(p.sid,'end');ltToast(m.icon,m.title(p),m.text(p),{cls:m.cls,sound:m.sound,ms:m.ms})}
  ltMilestones(s);LT_LAST=s;
  const rem=s.mode==='break'?s.wait:s.total-s.el,over=s.mode!=='break'&&rem<=0&&(s.el>0),
    state=s.mode==='break'?'brk':over?'over':rem<=LT_WARN&&(s.run||s.el>0)?'warn':'';
  $$('.lt').forEach(el=>{el.className=`lt ${state}${s.run?' run':''}${s.mode==='slot'||s.mode==='break'?' auto':''}`;el.title=`${s.label}${s.range?' · '+s.range:''}`;
    const lab=$('.ltlab',el);if(lab)lab.textContent=s.label;const r=$('.ltrange',el);if(r)r.textContent=s.mode==='slot'?s.range:s.mode==='break'?s.range:'';
    const t=$('.ltime',el);if(t)t.textContent=ltFmt(rem);
    const b=$('[data-lt=toggle]',el);if(b){const paus=s.run&&s.mode!=='break';b.textContent=paus?'⏸':'▶';b.title=paus?'Pause (switches to manual timing)':'Start a 40-minute lesson timer'}
    const a=$('[data-lt=auto]',el);if(a){a.hidden=!ltSlots().length||(LT.auto&&!LT.manualUntil);a.title='Back to automatic timing ('+ltSlotsText()+')'}});
}
// manual timing lasts until the current lesson (or break) ends, then the schedule takes over again
function ltManual(s){if(s.end)LT.manualUntil=s.end}
function ltToggle(){
  ltAudio();const s=ltState();
  if(s.mode==='slot'){ltManual(s);LT.el=s.el;LT.run=false;LT.sid=s.sid}
  else if(s.mode==='break'){ltManual(s);Object.assign(LT,{el:0,run:true,t0:ltNow(),sid:'m'+ltNow()})}
  else if(LT.run){LT.el=ltElapsed();LT.run=false}
  else{if(ltElapsed()>=LT_TOTAL)Object.assign(LT,{el:0,sid:'m'+ltNow()});LT.run=true;LT.t0=ltNow()}
  ltSave();ltTick();
}
function ltReset(){const s=ltState();if(s.mode!=='manual')ltManual(s);Object.assign(LT,{el:0,run:false,t0:0,sid:'m'+ltNow()});ltSave();ltTick()}
function ltAuto(){LT.auto=true;LT.manualUntil=0;LT.run=false;LT.el=0;ltSave();ltTick()}
function ltEditSlots(){
  const v=prompt('Lesson times, separated by commas (for example 8:30-9:10, 9:15-9:55).\nThe timer follows them automatically. Leave empty to turn automatic timing off.',LT.auto?ltSlotsText():'');
  if(v===null)return;
  if(!v.trim()){LT.auto=false;LT.manualUntil=0}else{const p=ltParse(v);if(!p.length){alert('Write the times like 8:30-9:10, 9:15-9:55.');return}localStorage.setItem(LT_SLOTS_KEY,p.map(([a,b])=>`${ltHM(a)}-${ltHM(b)}`).join(', '));LT.auto=true;LT.manualUntil=0}
  ltSave();ltTick();
}
const timerHTML=()=>`<span class="lt"><button class="ltlab" data-lt="slots" title="Change the lesson times">Lesson</button><span class="ltrange"></span><span class="ltime">40:00</span><button data-lt="toggle" class="ltb">▶</button><button data-lt="reset" class="ltb" title="Reset to 40:00 (manual timing)">↺</button><button data-lt="auto" class="ltb" hidden>🕘</button><button data-lt="test" class="ltb" title="Test the sound">🔔</button></span>`;
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-lt]');if(!b)return;const a=b.dataset.lt;
  if(a==='toggle')ltToggle();else if(a==='reset')ltReset();else if(a==='auto')ltAuto();else if(a==='slots')ltEditSlots();
  else if(a==='test'){ltAudio();ltToast('🔔','Sound test','Milestone notifications sound like this.')}
});
document.addEventListener('pointerdown',()=>ltAudio(),{once:true});   // browsers only allow sound after a click
setInterval(ltTick,250);
