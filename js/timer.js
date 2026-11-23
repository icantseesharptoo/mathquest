/* 40-minute lesson timer. Sound signal (3 beeps) when 5 minutes are left, a chime when time is up.
   Any element with class "lt" shows the timer; buttons with data-lt="toggle|reset|test" control it.
   The state is saved, so the timer keeps running when you change pages or reload. */
const LT_TOTAL=40*60,LT_WARN=5*60,LT_KEY='maths.timer';
const LT=Object.assign({el:0,run:false,t0:0,warned:false,ended:false},(()=>{try{return JSON.parse(localStorage.getItem(LT_KEY))||{}}catch(e){return{}}})());
let LT_AC=null;
const ltSave=()=>{try{localStorage.setItem(LT_KEY,JSON.stringify(LT))}catch(e){}};
const ltElapsed=()=>LT.el+(LT.run?(Date.now()-LT.t0)/1000:0);
function ltAudio(){
  try{if(!LT_AC)LT_AC=new (window.AudioContext||window.webkitAudioContext)();if(LT_AC.state==='suspended')LT_AC.resume()}catch(e){}
  return LT_AC;
}
function ltTone(freq,start,dur,vol=.35,type='sine'){
  const ac=ltAudio();if(!ac)return;const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+start;
  o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+dur);
  o.connect(g).connect(ac.destination);o.start(t);o.stop(t+dur+.05);
}
const ltWarnSound=()=>{[0,.35,.7].forEach(s=>ltTone(880,s,.25,.4,'square'))};
const ltEndSound=()=>{[[784,0],[659,.3],[523,.6],[392,.9]].forEach(([f,s])=>ltTone(f,s,.9,.4,'triangle'))};
function ltBanner(msg,cls,extra=''){
  const b=document.createElement('div');b.className='ltbanner '+cls;b.innerHTML=`<b>${msg}</b>${extra}<button class="ltok">OK</button>`;b.addEventListener('click',e=>{if(e.target.closest('[data-tool]'))b.remove()});
  (document.fullscreenElement||document.body).appendChild(b);$('.ltok',b).onclick=()=>b.remove();setTimeout(()=>b.remove(),12000);
}
function ltFmt(sec){const s=Math.max(0,Math.ceil(sec));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`}
function ltTick(){
  const rem=LT_TOTAL-ltElapsed();
  if(LT.run&&rem<=LT_WARN&&!LT.warned){LT.warned=true;ltSave();ltWarnSound();ltBanner('⏰ 5 minutes left in the lesson — time to wrap up!',  'warn',window.onLessonWarn?window.onLessonWarn():'')}
  if(LT.run&&rem<=0&&!LT.ended){LT.ended=true;LT.el=LT_TOTAL;LT.run=false;ltSave();ltEndSound();ltBanner('🔔 The 40-minute lesson is over.','over')}
  const state=LT.ended?'over':rem<=LT_WARN&&(LT.run||LT.el>0)?'warn':'';
  $$('.lt').forEach(el=>{el.className='lt '+state+(LT.run?' run':'');const t=$('.ltime',el);if(t)t.textContent=ltFmt(rem);const b=$('[data-lt=toggle]',el);if(b){b.textContent=LT.run?'⏸':'▶';b.title=LT.run?'Pause the lesson timer':'Start the 40-minute lesson timer'}});
}
function ltToggle(){ltAudio();if(LT.run){LT.el=ltElapsed();LT.run=false}else{if(LT.ended)ltReset();LT.run=true;LT.t0=Date.now()}ltSave();ltTick()}
function ltReset(){Object.assign(LT,{el:0,run:false,t0:0,warned:false,ended:false});ltSave();ltTick()}
const timerHTML=()=>`<span class="lt" title="40-minute lesson timer: a sound plays when 5 minutes are left"><span class="ltlab">Lesson</span><span class="ltime">40:00</span><button data-lt="toggle" class="ltb">▶</button><button data-lt="reset" class="ltb" title="Reset to 40:00">↺</button><button data-lt="test" class="ltb" title="Test the sound">🔔</button></span>`;
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-lt]');if(!b)return;const a=b.dataset.lt;
  if(a==='toggle')ltToggle();else if(a==='reset')ltReset();else if(a==='test'){ltAudio();ltWarnSound()}
});
document.addEventListener('pointerdown',()=>{if(LT.run)ltAudio()},{once:true});   // browsers only allow sound after a click
setInterval(ltTick,250);
