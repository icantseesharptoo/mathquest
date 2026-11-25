/* Pages: home, course (module cards), topic (slides / practice / videos), exams, tools. */
const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const app=$('#app');
let uid=0,DECK=null,TIMER=null;
const TOOLS=[
  {n:'Wheel of names',u:'https://spinthewheel.io/',d:'Pick a student at random.'},
  {n:'Bouncy Balls',u:'https://bouncyballs.org/',d:'Classroom noise meter.'},
  {n:'Kahoot channel',u:'https://create.kahoot.it/channel/fb860daf-26f1-43c6-913f-98baf1ad0633',d:'Quizzes for the class.'}];
const toolLinks=(cls='')=>TOOLS.map(t=>`<a class="${cls}" href="${t.u}" target="_blank" rel="noopener" title="${t.d}">${t.n} ↗</a>`).join('');

// ---------- header: theme, timer, tools ----------
function applyTheme(){document.documentElement.dataset.theme=ST.theme;$('#themeBtn').textContent={system:'System',light:'Light',dark:'Dark'}[ST.theme]}
$('#themeBtn').onclick=()=>{ST.theme={system:'light',light:'dark',dark:'system'}[ST.theme];saveState();applyTheme()};
applyTheme();
$('#hdrTimer').innerHTML=timerHTML();
let CUR=null;   // the topic being shown, for exit ticket and battle
const classTools=()=>`<button data-tool="exit" ${CUR?'':'disabled title="Open a topic first"'}>🎟 Exit ticket</button><button data-tool="battle" ${CUR?'':'disabled title="Open a topic first"'}>⚔️ Battle</button><button data-tool="board">🖊 Whiteboard</button>${COURSE_IDS.map(c=>`<button data-tool="seat" data-cid="${c}">🪑 ${course(c).name} seats</button>`).join('')}<hr>`;
const refreshTools=()=>{$('#toolsMenu').innerHTML=classTools()+toolLinks()};refreshTools();
document.addEventListener('click',e=>{const b=e.target.closest('[data-tool]');if(!b||b.disabled)return;const d=b.closest('details');if(d)d.open=false;
  if(b.dataset.tool==='board')whiteboard();else if(b.dataset.tool==='seat')seating(b.dataset.cid);else if(CUR&&b.dataset.tool==='exit')exitTicket(CUR.cid,CUR.l);else if(CUR&&b.dataset.tool==='battle')battle(CUR.cid,CUR.l)});
window.onLessonWarn=()=>CUR?`<button data-tool="exit" class="btn">Open exit ticket</button>`:'';

// ---------- problem card ----------
function problemCard(p,o={}){
  const id=++uid,el=document.createElement('div');el.className='q';
  const label=p.label&&p.label!=='Answer ='?p.label:'Answer';
  const input=p.mc
    ?`<div class="opts">${p.choices.map((c,i)=>`<label><input type="radio" name="q${id}" value="${i}"><span>${c}</span></label>`).join('')}</div>${o.exam?'':'<div class="ans"><button class="btn chk">Check answer</button></div>'}`
    :`<div class="ans"><label>${label}</label><input type="text" autocomplete="off" inputmode="decimal" aria-label="answer"><span>${p.unit||''}</span>${o.exam?'':'<button class="btn chk">Check answer</button>'}</div>`;
  el.innerHTML=`<div class="qh"><span class="qn">${o.title||'Question'}</span><span class="lv">${p.level}</span><span class="status">${o.exam?'':'Not checked'}</span></div>
    <div class="qt">${p.text||''}</div>${p.eq?`<div class="eq">${p.eq}</div>`:''}${p.svg||''}${p.note&&!/Enter a whole/.test(p.note)?`<div class="note">${p.note}</div>`:''}
    ${input}${o.exam?'':'<div class="acts"><button class="hintBtn">Get a hint</button><button class="solBtn">Worked solution</button></div>'}<div class="fb"></div>
    <ol class="sol" hidden>${p.steps.map(s=>`<li>${s}</li>`).join('')}<li>Answer: <b>${ansText(p)}</b></li></ol>`;
  const value=()=>{if(p.mc){const c=$('input:checked',el);return c?c.value:''}return $('input[type=text]',el).value.trim()};
  const card={el,p,value,ok:null,tries:0,
    check(){const v=value();if(v===''){$('.fb',el).className='fb';$('.fb',el).textContent='Enter an answer.';return}
      const ok=checkAnswer(p,v);card.tries++;
      if(ok){card.ok=true;el.className='q ok';$('.status',el).textContent='Correct';$('.fb',el).className='fb ok';$('.fb',el).textContent='';$('.sol',el).hidden=false}
      else{if(card.ok!==true)card.ok=false;el.className='q no';$('.status',el).textContent='Not correct';$('.fb',el).className='fb no';$('.fb',el).textContent=''}
      if(o.onChange)o.onChange(card)}};
  if(!o.exam){
    $('.chk',el).onclick=()=>card.check();
    const t=$('input[type=text]',el);if(t)t.addEventListener('keydown',e=>{if(e.key==='Enter')card.check()});
    $('.hintBtn',el).onclick=()=>{const f=$('.fb',el);f.className='fb hint';f.textContent=p.hint||p.steps[0].replace(/<[^>]+>/g,'')};
    $('.solBtn',el).onclick=()=>{const s=$('.sol',el);s.hidden=!s.hidden};
  }
  return card;
}

// ---------- pages ----------
const crumbs=(...a)=>`<div class="crumbs">${a.map((x,i)=>i<a.length-1?`<a href="${x[1]}">${x[0]}</a><span>›</span>`:x[0]).join('')}</div>`;
function setNav(k){$$('header nav a').forEach(a=>a.classList.toggle('on',a.dataset.nav===k))}

function home(){
  setNav('');
  app.innerHTML=`<h1>Mathematics</h1><div class="cards">${COURSE_IDS.map(id=>{const c=course(id);return `<a class="card" href="#/${id}"><div class="t">${c.name}</div><div class="m">${c.modules.length} modules · ${allLessons(id).length} topics</div><div class="m small">From ${c.source}</div><div class="go">Open →</div></a>`}).join('')}
    <a class="card" href="#/exams"><div class="t">Exams</div><div class="m">${examDefs('y8').length+examDefs('y10').length} tests and exams</div><div class="go">Open →</div></a></div>
    <h2>Classroom tools</h2><div class="cards">${TOOLS.map(t=>`<a class="card" href="${t.u}" target="_blank" rel="noopener"><div class="t">${t.n} ↗</div><div class="m">${t.d}</div></a>`).join('')}<div class="card"><div class="t">Lesson timer</div><div class="m">40 minutes, with a sound when 5 minutes are left. It is at the top of every page and in full-screen slides.</div><div style="margin-top:.6rem">${timerHTML()}</div></div></div>`;
  ltTick();
}

function coursePage(cid){
  setNav(cid);const c=course(cid);
  const card=l=>{const pg=lessonProgress(cid,l.n);return `<a class="tcard" href="#/${cid}/l/${l.n}" data-t="${(l.title+' '+l.plan).toLowerCase()}">
      <div class="tc-top"><span class="tc-n">${l.sec}</span><span class="tc-l">Lesson${l.nLessons>1?'s':''} ${l.lessons}</span>${lessonComplete(cid,l.n)?'<span class="tc-ok">✓</span>':''}</div>
      <div class="tc-t">${l.title}</div>
      <div class="tc-m">${l.review?'Mixed questions from the whole year':`${l.skills.length} question type${l.skills.length>1?'s':''}`}${demoFor(l)?' · interactive demo':''}${l.videos?` · ${l.videos.length} video${l.videos.length>1?'s':''}`:''}</div>
      ${pg?`<div class="progress"><i style="width:${Math.min(100,pg.best/pg.total*100)}%"></i></div>`:''}</a>`};
  app.innerHTML=`${crumbs(['Home','#/'],[c.name])}<div class="row"><h1>${c.name}</h1><span class="sp"></span><button class="btn alt" data-tool="seat" data-cid="${cid}">🪑 Seating plan</button></div><p class="lead">Topics from the school teaching plan (<i>${c.source}</i>), grouped by module. Each card opens interactive slides and practice.</p>
   <input type="search" class="search" placeholder="Search topics" aria-label="Search topics">
   ${c.modules.map(m=>{const done=m.lessons.filter(l=>lessonComplete(cid,l.n)).length,ex=ST.exams[`${cid}-m${m.n}`],real=m.lessons.some(l=>!l.review);
     return `<section class="module" style="--mc:${m.color}"><div class="modh"><span class="mnum">${m.n}</span><div class="mtt"><div class="mk">Module ${m.n} · lessons ${m.lessons[0].lessons.split('–')[0]}–${m.lessons[m.lessons.length-1].lessons.split('–').pop()}</div><h2>${m.title}</h2></div><span class="sp"></span><span class="wp">${done} / ${m.lessons.length} done</span>${real?`<a class="btn alt" href="#/exam/${cid}-m${m.n}">Module test${ex?` · best ${ex.best}/${ex.total}`:''}</a>`:''}</div>
      ${m.goals.length?`<details class="goals"><summary>Curriculum objectives (${m.goals.length})</summary><ul>${m.goals.map(g=>`<li>${g}</li>`).join('')}</ul></details>`:''}
      <div class="tcards">${m.lessons.map(card).join('')}</div></section>`}).join('')}`;
  const s=$('.search');s.oninput=()=>{const q=s.value.trim().toLowerCase();$$('section.module').forEach(sec=>{let any=false;$$('.tcard',sec).forEach(c=>{const m=!q||c.dataset.t.includes(q);c.style.display=m?'':'none';if(m)any=true});sec.style.display=any?'':'none'})};
}

function lessonPage(cid,n,tab,slide){
  setNav(cid);const l=lessonN(cid,n),c=course(cid);
  if(!l){app.innerHTML='<h1>Not found</h1>';return}
  CUR={cid,l};refreshTools();const m=c.modules[l.week-1];
  app.innerHTML=`${crumbs(['Home','#/'],[c.name,`#/${cid}`],[`Module ${l.week}: ${m.title}`])}<h1>${l.title}</h1>
    <div class="tabs"><a href="#/${cid}/l/${n}/slides" class="${tab==='slides'?'on':''}">Slides</a><a href="#/${cid}/l/${n}/practice" class="${tab==='practice'?'on':''}">Practice</a>${l.videos||extrasFor(cid,l)?`<a href="#/${cid}/l/${n}/videos" class="${tab==='videos'?'on':''}">Videos${l.videos?` (${l.videos.length})`:''}</a>`:''}<span class="sp"></span>
    ${n>1?`<a href="#/${cid}/l/${n-1}/${tab}" class="pn">← Previous topic</a>`:''}${n<allLessons(cid).length?`<a href="#/${cid}/l/${n+1}/${tab}" class="pn">Next topic →</a>`:''}</div><div id="tabBody"></div>`;
  if(tab==='practice')practice(cid,l);else if(tab==='videos')videosTab(cid,l);else{slides(cid,l);if(slide)go(+slide)}
  window.scrollTo(0,0);
}

// ---------- videos ----------
const fileNote=()=>location.protocol==='file:'?`<p class="note">YouTube does not play videos inside a page opened straight from a file. Use “Open on YouTube”, or open the site through a web address (for example GitHub Pages).</p>`:'';
const ytFrame=id=>`<div class="yt"><iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0" title="YouTube video" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
const ivMode=()=>canEmbed()&&localStorage.getItem('maths.ivmode')!=='plain';
function videoBlock(cid,l){
  const v=l.videos;let i=0;const h=document.createElement('div');
  const draw=()=>{const iv=ivMode();
    h.innerHTML=`<div class="vidwrap"><div class="vmain">${iv?'':ytFrame(v[i][0])}</div><div class="vlist"><b>Videos for this topic</b>${v.map((x,k)=>`<button class="vbtn ${k===i?'on':''}" data-k="${k}">${x[1]}</button>`).join('')}
    ${canEmbed()?`<label class="ivsw"><input type="checkbox" ${iv?'checked':''}> Interactive: stop for questions</label>`:''}
    <a href="https://www.youtube.com/watch?v=${v[i][0]}&list=${course(cid).playlist}&index=${v[i][2]}" target="_blank" rel="noopener">Open on YouTube ↗</a>${fileNote()}</div></div>`;
    if(iv)$('.vmain',h).appendChild(interactiveVideo(cid,l,v[i][0]));
    $$('.vbtn',h).forEach(b=>b.onclick=()=>{i=+b.dataset.k;draw()});
    const sw=$('.ivsw input',h);if(sw)sw.onchange=()=>{localStorage.setItem('maths.ivmode',sw.checked?'on':'plain');draw()}};
  draw();return h;
}
function videosTab(cid,l){
  const b=$('#tabBody');if(l.videos)b.appendChild(videoBlock(cid,l));
  if(extrasFor(cid,l)){const w=document.createElement('div');w.className='vtabwhy';b.appendChild(w);whySlide(w,cid,l);while(w.stepNext());}
}

// ---------- practice ----------
function practice(cid,l){
  const body=$('#tabBody');let seed=rndSeed(),cards=[],extra=0;
  body.innerHTML=`<div class="row"><span class="stat">Correct <span id="cc">0</span> / <span id="ct">12</span></span><div class="progress"><i id="pb" style="width:0"></i></div><span class="sp"></span><button class="btn alt" id="more">More questions</button><button class="btn" id="newset">New set</button></div><div id="qs"></div>`;
  const upd=()=>{const first=cards.slice(0,12),c=first.filter(x=>x.ok===true).length;$('#cc').textContent=c;$('#ct').textContent=first.length;$('#pb').style.width=(c/first.length*100)+'%';markLessonDone(cid,l.n,c,first.length)};
  const add=(ps,start)=>ps.forEach((p,i)=>{const c=problemCard(p,{title:`Question ${start+i+1}`,onChange:upd});cards.push(c);$('#qs').appendChild(c.el)});
  const build=()=>{cards=[];$('#qs').innerHTML='';add(lessonProblems(cid,l,12,seed),0);upd()};
  $('#newset').onclick=()=>{seed=rndSeed();extra=0;build();window.scrollTo(0,0)};
  $('#more').onclick=()=>{extra++;add(lessonProblems(cid,l,6,seed+extra*977,[1,1,2,0,1,2]),cards.length)};
  window.CARDS=()=>cards;
  build();
}

// ---------- step-by-step worked example ----------
function exampleSlide(h,cid,l,start){
  let lv=start.lv,skill=start.skill,p,shown=0;
  const draw=()=>{
    p=makeProblem(skill,mkR(rndSeed()),lv);shown=0;
    h.innerHTML=`<div class="row exbar"><span class="lvtag">${['Easy','Medium','Hard'][lv]}</span><select class="exlv" aria-label="Level"><option value="0">Easy</option><option value="1">Medium</option><option value="2">Hard</option></select>
      ${l.skills.length>1?`<select class="exsk" aria-label="Question type">${l.skills.map((s,i)=>`<option value="${s}" ${s===skill?'selected':''}>Type ${i+1}</option>`).join('')}</select>`:''}
      <button class="btn alt exnew">New example</button><span class="sp"></span><button class="btn exnext">Show next step ▶</button><button class="btn alt exall">Show all</button></div>
      <div class="exgrid ${p.svg?'':'nofig'}"><div class="exq q"><div class="qt">${p.text||''}</div>${p.eq?`<div class="eq">${p.eq}</div>`:''}${p.mc?`<ol class="opts mc" type="A">${p.choices.map(c=>`<li>${c}</li>`).join('')}</ol>`:''}
        <ol class="sol steplist" hidden></ol></div>${p.svg?`<div class="exfig">${p.svg}</div>`:''}</div>`;
    $('.exlv',h).value=lv;$('.exlv',h).onchange=e=>{lv=+e.target.value;draw()};if($('.exsk',h))$('.exsk',h).onchange=e=>{skill=e.target.value;draw()};
    $('.exnew',h).onclick=draw;$('.exnext',h).onclick=next;$('.exall',h).onclick=()=>{while(next());};
  };
  const upd=()=>{
    const s=$('.steplist',h),n=p.steps.length;s.hidden=shown===0;
    s.innerHTML=p.steps.slice(0,shown).map((x,i)=>`<li class="${i===shown-1?'new':''}">${x}</li>`).join('')+(shown>n?`<li class="final new">Answer: <b>${ansText(p)}</b></li>`:'');
    if(p.frames&&$('.exfig',h)){let f=p.svg;for(let i=0;i<Math.min(shown,n);i++)if(p.frames[i])f=p.frames[i];$('.exfig',h).innerHTML=f}
    if(p.mc&&shown>n)$$('.opts.mc li',h)[p.ans].classList.add('right');
    $('.exnext',h).disabled=shown>n;$('.exnext',h).textContent=shown>=n?'Show answer ▶':'Show next step ▶';
  };
  function next(){if(shown>p.steps.length)return false;shown++;upd();return true}
  h.stepNext=next;draw();
}

// ---------- random problem wheel ----------
function wheelSlide(h,cid,l){
  const N=8,cols=['#2455d6','#d9480f','#16a34a','#7c3aed','#0891b2','#be185d','#b45309','#4f46e5'];let rot=0,probs;
  const fresh=()=>{probs=lessonProblems(cid,l,N,rndSeed(),[0,1,0,1,2,1,0,2])};fresh();
  let g='';for(let i=0;i<N;i++){const a0=90-i*45,a1=a0-45,[x0,y0]=P(150,150,140,a0),[x1,y1]=P(150,150,140,a1);g+=`<path d="M150,150 L${f1(x0)},${f1(y0)} A140,140 0 0 1 ${f1(x1)},${f1(y1)} Z" fill="${cols[i]}" stroke="#fff" stroke-width="3"/>`;const [tx,ty]=P(150,150,95,a0-22.5);g+=`<text x="${f1(tx)}" y="${f1(ty)}" font-size="26" font-weight="800" fill="#fff" text-anchor="middle" dominant-baseline="central">${i+1}</text>`}
  h.innerHTML=`<div class="wheelwrap"><div class="wheelbox"><div class="pointer">▼</div><svg viewBox="0 0 300 300" class="wheel">${g}<circle cx="150" cy="150" r="16" fill="#fff" stroke="#111827" stroke-width="3"/></svg>
    <div class="row" style="justify-content:center"><button class="btn spinw">Spin the wheel</button><button class="btn alt neww">New problems</button></div>
    <p class="note">Spin for a random problem from this topic. To pick a student, use <a href="https://spinthewheel.io/" target="_blank" rel="noopener">Wheel of names ↗</a>.</p></div><div class="wheelq"><div class="big">Random problem</div><p class="note">Press “Spin the wheel”.</p></div></div>`;
  const wheel=$('.wheel',h);
  $('.neww',h).onclick=()=>{fresh();$('.wheelq',h).innerHTML='<div class="big">Random problem</div><p class="note">New problems are ready. Spin!</p>'};
  $('.spinw',h).onclick=()=>{const b=$('.spinw',h);b.disabled=true;rot+=1440+Math.floor(Math.random()*360);wheel.style.transform=`rotate(${rot}deg)`;
    setTimeout(()=>{const k=Math.floor(((360-rot%360)%360)/45);const q=$('.wheelq',h);q.innerHTML=`<div class="big" style="color:${cols[k]}">Problem ${k+1}</div>`;q.appendChild(problemCard(probs[k],{title:`Problem ${k+1}`}).el);b.disabled=false},3200)};
}

// ---------- slides ----------
function slides(cid,l){
  const body=$('#tabBody'),c=course(cid),m=c.modules[l.week-1],demo=demoFor(l),sk=l.review?lessonProblems(cid,l,3,rndSeed()).map(p=>p.skill):l.skills;
  const ex=[0,1,2].map(i=>({skill:sk[i%sk.length],lv:i}));
  const items=[
    {name:'Title',mount:h=>titleSlide(h,cid,l,m,c)},
    ...(extrasFor(cid,l)?[{name:'Why it matters',mount:h=>whySlide(h,cid,l)}]:[]),
    ...(l.videos?[{name:'Video',mount:h=>{h.appendChild(videoBlock(cid,l))}}]:[]),
    ...(demo&&DEMOS[demo]?[{name:'Interactive demo',mount:h=>{const d=document.createElement('div');h.appendChild(d);mountDemo(d,DEMOS[demo]);h.stepNext=()=>d.demoNext?d.demoNext():false}}]:[]),
    ...ex.map((e,i)=>({name:`Example ${i+1}`,mount:h=>exampleSlide(h,cid,l,e)})),
    {name:'Meme break',mount:h=>memeSlide(h)},
    {name:'Random problem',mount:h=>wheelSlide(h,cid,l)},
    {name:'Check',mount:h=>{
      const ps=lessonProblems(cid,l,3,rndSeed(),[0,1,2]);h.innerHTML='<div class="big">Check your understanding</div><div id="ck"></div>';
      ps.forEach((p,i)=>$('#ck',h).appendChild(problemCard(p,{title:`Question ${i+1}`}).el))}},
    {name:'Practice',mount:h=>{h.innerHTML=`<div class="big">Practice</div><p><a class="btn" href="#/${cid}/l/${l.n}/practice">Start practice (12 questions)</a></p>${l.n<allLessons(cid).length?`<p><a href="#/${cid}/l/${l.n+1}">Next topic: ${lessonN(cid,l.n+1).title} →</a></p>`:''}<p class="note">Quiz the class on Kahoot: <a href="${TOOLS[2].u}" target="_blank" rel="noopener">open the channel ↗</a></p>`}},
  ];
  body.innerHTML=`<div class="deck" id="deck" style="--mc:${m.color}"><div class="deckbar"><span id="dn"></span><div class="dots" id="dots"></div><span class="sp"></span>${timerHTML()}<details class="dtools"><summary>Tools</summary><div>${classTools()}${toolLinks()}</div></details><button class="ghost" data-tool="exit" title="Exit ticket for the last 5 minutes">🎟 Exit ticket</button><button class="ghost" data-tool="battle">⚔️ Battle</button><button class="ghost" data-tool="board">🖊 Board</button><button class="ghost" id="fs">Full screen</button></div><div class="stage" id="stage"></div><div class="decknav"><button class="btn alt" id="pv">Back</button><span id="num"></span><span class="note">Space = next step</span><button class="btn" id="nt">Next</button></div></div>`;
  DECK={i:0,items,h:null};
  $('#pv').onclick=()=>go(DECK.i-1);$('#nt').onclick=()=>go(DECK.i+1);$('#fs').onclick=toggleFS;
  go(0);ltTick();fsState();
}
function go(i){
  if(!DECK)return;i=Math.max(0,Math.min(DECK.items.length-1,i));DECK.i=i;
  const st=$('#stage');st.innerHTML='';st.scrollTop=0;const h=document.createElement('div');h.className='slideIn';st.appendChild(h);DECK.h=h;DECK.items[i].mount(h);
  $('#dn').textContent=DECK.items[i].name;$('#num').textContent=`${i+1} / ${DECK.items.length}`;
  $('#dots').innerHTML=DECK.items.map((s,k)=>`<button class="dot ${k===i?'on':k<i?'seen':''}" data-k="${k}" title="${s.name}"></button>`).join('');
  $$('#dots .dot').forEach(b=>b.onclick=()=>go(+b.dataset.k));
  $('#pv').disabled=i===0;$('#nt').disabled=i===DECK.items.length-1;
}
// full screen: the Full screen button (.fs), or the browser's own full screen such as F11 (.bfs) — the deck then fills the screen
function fsState(){const r=document.documentElement,deck=!!$('#deck'),browser=!window.NO_BFS&&!document.fullscreenElement&&((window.matchMedia&&matchMedia('(display-mode: fullscreen)').matches)||(innerHeight>=screen.height-2&&innerWidth>=screen.width-2));
  r.classList.toggle('fs',!!document.fullscreenElement);r.classList.toggle('bfs',browser&&deck);document.body.classList.toggle('has-deck',deck)}
addEventListener('resize',fsState);document.addEventListener('fullscreenchange',fsState);
function toggleFS(){const d=$('#deck');if(!d)return;if(document.fullscreenElement)document.exitFullscreen();else (d.requestFullscreen||d.webkitRequestFullscreen||(()=>{})).call(d)}
document.addEventListener('keydown',e=>{
  if(!DECK||!$('#deck')||$('.ovl')||e.target.isContentEditable)return;if(['INPUT','SELECT','TEXTAREA','BUTTON'].includes(e.target.tagName)&&e.key!=='Escape')return;
  if(e.key==='ArrowRight'||e.key==='PageDown')go(DECK.i+1);else if(e.key==='ArrowLeft'||e.key==='PageUp')go(DECK.i-1);else if(e.key==='f'||e.key==='F')toggleFS();
  else if(e.key===' '&&DECK.h&&DECK.h.stepNext){e.preventDefault();DECK.h.stepNext()}
});

// ---------- exams ----------
function examsPage(){
  setNav('exams');
  const link=d=>{const b=ST.exams[d.id];return `<a class="examlink" href="#/exam/${d.id}"><b>${d.title}</b><small>${d.n} questions · ${d.min} min</small>${b?`<div class="best">Best ${b.best} / ${b.total}</div>`:''}</a>`};
  app.innerHTML=`<h1>Exams</h1>${COURSE_IDS.map(cid=>{const ds=examDefs(cid);return `<h2>${course(cid).name}</h2><h3>Final exam</h3><div class="examgrid">${ds.filter(d=>d.kind==='final').map(link).join('')}</div><h3 style="margin-top:1rem">Module tests</h3><div class="examgrid">${ds.filter(d=>d.kind==='module').map(link).join('')}</div>`}).join('')}`;
}
function examPage(id){
  setNav('exams');clearInterval(TIMER);
  const cid=id.split('-')[0],def=COURSE_IDS.includes(cid)&&examDefs(cid).find(d=>d.id===id);
  if(!def){app.innerHTML='<h1>Not found</h1>';return}
  app.innerHTML=`${crumbs(['Home','#/'],['Exams','#/exams'],[def.title])}<h1>${def.title}</h1><p>${def.n} questions · ${def.min} minutes · ${def.sub}</p><button class="btn" id="start">Start</button>`;
  $('#start').onclick=()=>runExam(def);
}
function runExam(def){
  const probs=examProblems(def.cid,def.weeks,def.n,rndSeed());let secs=def.min*60,done=false;
  app.innerHTML=`${crumbs(['Home','#/'],['Exams','#/exams'],[def.title])}<h1>${def.title}</h1><div class="timer"><span class="time" id="tm"></span><span class="sp"></span><button class="btn" id="sub">Submit</button></div><div id="qs"></div>`;
  const cards=probs.map((p,i)=>{const c=problemCard(p,{exam:true,title:`Question ${i+1}`});$('#qs').appendChild(c.el);return c});
  window.CARDS=()=>cards;
  const show=()=>{$('#tm').textContent=`${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`};show();
  const submit=()=>{
    if(done)return;done=true;clearInterval(TIMER);let score=0;
    cards.forEach(c=>{const v=c.value(),ok=v!==''&&checkAnswer(c.p,v);if(ok)score++;c.el.className='q '+(ok?'ok':'no');$('.status',c.el).textContent=ok?'Correct':(v===''?'No answer':'Not correct');$('.sol',c.el).hidden=false;$$('input',c.el).forEach(i=>i.disabled=true)});
    const b=ST.exams[def.id]||{best:0,total:def.n};b.best=Math.max(b.best,score);b.total=def.n;ST.exams[def.id]=b;saveState();
    $('.timer').innerHTML=`<span class="result">Score ${score} / ${def.n} · ${Math.round(score/def.n*100)}%</span><span class="sp"></span><a class="btn alt" href="#/exams">All exams</a><a class="btn" href="#/exam/${def.id}">Try again</a>`;
    window.scrollTo(0,0);
  };
  $('#sub').onclick=()=>{if(confirm('Submit the exam?'))submit()};
  TIMER=setInterval(()=>{if(!$('#tm')){clearInterval(TIMER);return}secs--;show();if(secs<=0)submit()},1000);
}

// ---------- router ----------
function route(){
  clearInterval(TIMER);DECK=null;CUR=null;closeOverlay();setTimeout(fsState);if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
  const p=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);
  if(!p.length)return home();
  if(p[0]==='exams')return examsPage();
  if(p[0]==='exam')return examPage(p[1]);
  if(COURSE_IDS.includes(p[0])){
    if(p[1]==='l')return lessonPage(p[0],+p[2],['practice','videos'].includes(p[3])?p[3]:'slides',p[4]);
    return coursePage(p[0]);
  }
  home();
}
window.addEventListener('hashchange',route);
route();
