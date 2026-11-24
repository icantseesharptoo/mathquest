/* Interactive video (H5P style): a YouTube video that pauses at checkpoints and asks a question,
   then ends with a summary quiz. Uses the YouTube IFrame Player API, which needs the site to be
   opened over http(s). Teachers can move, add and delete checkpoints and write their own questions;
   these are saved in this browser (localStorage maths.ivideo). */
let YT_READY=null;
function ytApi(){
  if(window.YT&&YT.Player)return Promise.resolve();
  if(YT_READY)return YT_READY;
  YT_READY=new Promise((res,rej)=>{const prev=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{if(prev)prev();res()};
    const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.onerror=()=>{YT_READY=null;rej(new Error('no api'))};document.head.appendChild(s)});
  return YT_READY;
}
const IV_KEY='maths.ivideo';
const ivAll=()=>{try{return JSON.parse(localStorage.getItem(IV_KEY))||{}}catch(e){return {}}};
const ivSave=(id,cfg)=>{const a=ivAll();if(cfg)a[id]=cfg;else delete a[id];localStorage.setItem(IV_KEY,JSON.stringify(a))};
const mmss=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const canEmbed=()=>!!window.IV_FORCE||location.protocol!=='file:';
const ytThumb=id=>`https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

// questions: a generated question from the topic, or the teacher's own {text, right, wrong:[3]}
function ivQuestion(cid,l,cp,seed){
  const r=mkR(seed);
  if(cp.own){const o=r.shuffle([cp.own.right,...cp.own.wrong.filter(Boolean)]);return {body:`<div class="qt">${esc(cp.own.text)}</div>`,list:o.map(esc),ok:o.indexOf(cp.own.right),steps:[]}}
  const p=lessonProblems(cid,l,1,seed,[cp.lv??1])[0],o=fourOptions(p,r);
  return {body:qBody(p),list:o.list,ok:o.ok,steps:p.steps,ans:ansText(p)};
}
function ivQuiz(host,q,onDone){
  host.innerHTML=`<div class="ivqq">${q.body}</div><div class="ivopts">${q.list.map((t,i)=>`<button data-i="${i}"><b>${'ABCD'[i]}</b> ${t}</button>`).join('')}</div><div class="ivfb"></div>`;
  $$('.ivopts button',host).forEach(b=>b.onclick=()=>{
    const i=+b.dataset.i,ok=i===q.ok;$$('.ivopts button',host).forEach((x,k)=>{x.disabled=true;if(k===q.ok)x.classList.add('right');else if(k===i)x.classList.add('wrong')});
    $('.ivfb',host).innerHTML=`<div class="fb ${ok?'ok':'no'}">${ok?'Correct!':'Not quite.'}</div>${!ok&&q.steps.length?`<ol class="sol">${q.steps.map(s=>`<li>${s}</li>`).join('')}<li>Answer: <b>${q.ans}</b></li></ol>`:''}`;
    onDone(ok)});
}

function interactiveVideo(cid,l,vid,opts={}){
  const h=document.createElement('div');h.className='iv';
  if(!canEmbed()){
    h.innerHTML=`<div class="ivoff"><a href="https://www.youtube.com/watch?v=${vid}" target="_blank" rel="noopener"><img src="${ytThumb(vid)}" alt=""><span>▶</span></a>
      <p class="note">Interactive video needs the site to be opened through a web address (for example GitHub Pages, or <code>python -m http.server</code> in the MathQuest folder). From a file, YouTube refuses to play embedded videos. <a href="https://www.youtube.com/watch?v=${vid}" target="_blank" rel="noopener">Open on YouTube ↗</a></p></div>`;
    return h;
  }
  const saved=ivAll()[vid];
  let cps=saved?saved.cps.map(c=>({...c})):null,dur=0,player=null,last=0,poll=null,results={},asking=false,editing=false,seed=rndSeed();
  const pid='ivp'+(++uid);
  h.innerHTML=`<div class="ivbox"><div class="ivframe"><div id="${pid}"></div></div><div class="ivq" hidden></div></div>
    <div class="ivtrack" title="Questions on the timeline"><i class="ivprog"></i><div class="ivmarks"></div></div>
    <div class="row ivctl"><span class="ivinfo">Loading video…</span><span class="sp"></span>
      <button class="btn alt ivsum">Summary quiz</button><button class="btn alt ivedit">✎ Edit questions</button></div>
    <div class="ivpanel" hidden></div>`;
  const info=$('.ivinfo',h),marks=$('.ivmarks',h),prog=$('.ivprog',h),qbox=$('.ivq',h),panel=$('.ivpanel',h);
  const store=()=>ivSave(vid,{cps:cps.map(({t,lv,own})=>({t,lv,...(own?{own}:{})}))});
  const sortCps=()=>cps.sort((a,b)=>a.t-b.t);
  const defaults=()=>{cps=[.3,.6,.85].map((f,i)=>({t:Math.round(dur*f),lv:i?1:0}))};
  const score=()=>{const v=Object.values(results);return `${v.filter(Boolean).length} / ${v.length}`};
  const drawInfo=()=>{info.textContent=`${cps.length} question${cps.length===1?'':'s'} in this video · score ${score()}`};
  const drawMarks=()=>{if(!dur)return;marks.innerHTML=cps.map((c,i)=>`<button class="ivm ${i in results?(results[i]?'ok':'no'):''}" style="left:${c.t/dur*100}%" data-i="${i}" title="Question ${i+1} at ${mmss(c.t)}">${i+1}</button>`).join('');
    $$('.ivm',marks).forEach(b=>b.onclick=()=>{const c=cps[+b.dataset.i];player.seekTo(Math.max(0,c.t-0.5),true);last=c.t-1;player.playVideo()});drawInfo()};
  const ask=i=>{
    asking=true;player.pauseVideo();const c=cps[i];qbox.hidden=false;
    qbox.innerHTML=`<div class="ivqh"><b>Question ${i+1}</b><span class="note">at ${mmss(c.t)}</span><span class="sp"></span></div><div class="ivqb"></div>
      <div class="row ivqa"><button class="btn alt ivback">↺ Watch that part again</button><span class="sp"></span><button class="btn ivgo" disabled>Continue ▶</button></div>`;
    ivQuiz($('.ivqb',qbox),ivQuestion(cid,l,c,seed+i*101),ok=>{results[i]=ok;$('.ivgo',qbox).disabled=false;drawMarks()});
    $('.ivgo',qbox).onclick=()=>{qbox.hidden=true;asking=false;player.playVideo()};
    $('.ivback',qbox).onclick=()=>{const prev=i?cps[i-1].t:0;qbox.hidden=true;asking=false;delete results[i];player.seekTo(Math.max(prev,c.t-30),true);last=Math.max(prev,c.t-30);player.playVideo();drawMarks()};
    h.ivAsking=i;
  };
  const summary=()=>{
    if(player&&player.pauseVideo)player.pauseVideo();asking=true;qbox.hidden=false;
    const n=3,qs=[0,1,2].map(k=>ivQuestion(cid,l,{lv:k},seed+7777+k));let done=0,right=0;
    const chk=Object.keys(results).length;
    qbox.innerHTML=`<div class="ivqh"><b>Summary quiz</b><span class="note">${chk?`Questions in the video: ${score()} correct`:''}</span><span class="sp"></span><button class="ghost ivclose" title="Close">✕</button></div>
      <div class="ivsumq">${qs.map((q,k)=>`<div class="ivsq"><div class="ivsn">${k+1}</div><div class="ivqb"></div></div>`).join('')}</div><div class="ivres"></div>`;
    $$('.ivsq .ivqb',qbox).forEach((b,k)=>ivQuiz(b,qs[k],ok=>{done++;if(ok)right++;if(done===n){const tot=right+Object.values(results).filter(Boolean).length,all=n+chk;
      $('.ivres',qbox).innerHTML=`<div class="ivscore">${tot} / ${all} <small>${tot===all?'Perfect! 🎉':tot>=all*.6?'Well done!':'Watch the video again and retry.'}</small></div><div class="row"><button class="btn alt ivagain">Start the video again</button></div>`;
      $('.ivagain',qbox).onclick=()=>{results={};seed=rndSeed();qbox.hidden=true;asking=false;drawMarks();player.seekTo(0,true);last=0;player.playVideo()}}}));
    $('.ivclose',qbox).onclick=()=>{qbox.hidden=true;asking=false};
  };
  const editor=()=>{
    panel.hidden=!editing;$('.ivedit',h).classList.toggle('on',editing);if(!editing)return;
    panel.innerHTML=`<p class="note">Questions pause the video at the time shown. <i>Topic question</i> uses a random question from this topic (new numbers each time); you can also write your own. Changes are saved in this browser.</p>
      <table class="ivtab"><tr><th>#</th><th>Time</th><th>Question</th><th></th></tr>${cps.map((c,i)=>`<tr><td>${i+1}</td><td><input class="ivt" data-i="${i}" value="${mmss(c.t)}" aria-label="time"></td>
        <td>${c.own?`Own: ${esc(c.own.text)}`:`Topic question (${['easy','medium','hard'][c.lv??1]})`}</td><td><button class="ghost ivdel" data-i="${i}" title="Delete">🗑</button></td></tr>`).join('')}</table>
      <div class="row"><button class="btn alt ivaddt">+ Topic question at ${mmss(player.getCurrentTime()||0)}</button><button class="btn alt ivaddo">+ My own question at ${mmss(player.getCurrentTime()||0)}</button><span class="sp"></span><button class="ghost ivreset">Reset to automatic</button></div>
      <form class="ivown" hidden><input name="text" placeholder="Question" required><input name="right" placeholder="Correct answer" required><input name="w1" placeholder="Wrong answer 1" required><input name="w2" placeholder="Wrong answer 2"><input name="w3" placeholder="Wrong answer 3"><button class="btn">Add question</button></form>`;
    const upd=()=>{sortCps();store();results={};drawMarks();editor()};
    $$('.ivt',panel).forEach(x=>x.onchange=()=>{const m=x.value.trim().match(/^(\d+)(?::(\d{1,2}))?$/);if(m){cps[+x.dataset.i].t=Math.min(dur,m[2]!=null?+m[1]*60+ +m[2]:+m[1])}upd()});
    $$('.ivdel',panel).forEach(b=>b.onclick=()=>{cps.splice(+b.dataset.i,1);upd()});
    $('.ivaddt',panel).onclick=()=>{cps.push({t:Math.round(player.getCurrentTime()),lv:1});upd()};
    $('.ivaddo',panel).onclick=()=>{const f=$('.ivown',panel);f.hidden=false;f.text.focus()};
    $('.ivown',panel).onsubmit=e=>{e.preventDefault();const f=e.target;cps.push({t:Math.round(player.getCurrentTime()),own:{text:f.text.value,right:f.right.value,wrong:[f.w1.value,f.w2.value,f.w3.value].filter(Boolean)}});upd()};
    $('.ivreset',panel).onclick=()=>{ivSave(vid,null);defaults();results={};drawMarks();editor()};
  };
  $('.ivedit',h).onclick=()=>{if(!player||!dur)return;editing=!editing;if(editing)player.pauseVideo();editor()};
  $('.ivsum',h).onclick=summary;
  const tick=()=>{
    if(!h.isConnected){clearInterval(poll);try{player.destroy()}catch(e){}return}
    if(!player||!player.getCurrentTime)return;
    if(!dur){dur=player.getDuration()||0;if(dur){if(!cps)defaults();sortCps();drawMarks()}}
    const t=player.getCurrentTime()||0;if(dur)prog.style.width=(t/dur*100)+'%';
    if(!asking&&!editing&&cps&&t>last&&t-last<1.5){const i=cps.findIndex((c,k)=>!(k in results)&&c.t>=last-0.25&&c.t<=t);if(i>=0){last=t;return ask(i)}}
    last=t;
  };
  h.ivTick=tick;
  ytApi().then(()=>{
    player=new YT.Player(pid,{videoId:vid,host:'https://www.youtube-nocookie.com',playerVars:{rel:0,modestbranding:1,playsinline:1,start:opts.start||0},
      events:{onReady:()=>{info.textContent='Press play. The video will stop for questions.';tick()},
        onStateChange:e=>{if(e.data===0&&!asking)summary()},
        onError:e=>{info.innerHTML=`This video cannot be played here (error ${e.data}). <a href="https://www.youtube.com/watch?v=${vid}" target="_blank" rel="noopener">Open on YouTube ↗</a>`}}});
    h.ivPlayer=player;poll=setInterval(tick,250);
  }).catch(()=>{info.innerHTML=`Could not reach YouTube. <a href="https://www.youtube.com/watch?v=${vid}" target="_blank" rel="noopener">Open on YouTube ↗</a>`});
  return h;
}
