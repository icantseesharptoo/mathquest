/* Pages: home, course, lesson (slides / practice), exams. */
const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const app=$('#app');
const pad3=n=>String(n).padStart(3,'0');
let uid=0,DECK=null,TIMER=null;

// ---------- theme ----------
function applyTheme(){document.documentElement.dataset.theme=ST.theme;$('#themeBtn').textContent={system:'System',light:'Light',dark:'Dark'}[ST.theme]}
$('#themeBtn').onclick=()=>{ST.theme={system:'light',light:'dark',dark:'system'}[ST.theme];saveState();applyTheme()};
applyTheme();

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
  setNav('');app.className='';
  const n=id=>allLessons(id).length;
  app.innerHTML=`<h1>Mathematics</h1><div class="cards">${COURSE_IDS.map(id=>`<a class="card" href="#/${id}"><div class="t">${course(id).name}</div><div class="m">${course(id).weeks.length} weeks · ${n(id)} lessons</div><div class="go">Open →</div></a>`).join('')}
    <a class="card" href="#/exams"><div class="t">Exams</div><div class="m">${examDefs('y8').length+examDefs('y10').length} exams</div><div class="go">Open →</div></a></div>`;
}

function coursePage(cid){
  setNav(cid);app.className='';
  const c=course(cid),defs=Object.fromEntries(examDefs(cid).map(d=>[d.id,d]));
  app.innerHTML=`${crumbs(['Home','#/'],[c.name])}<h1>${c.name}</h1><input type="search" class="search" placeholder="Search lessons" aria-label="Search lessons">
  <div id="weeks">${c.weeks.map(w=>{
    const done=w.lessons.filter(l=>lessonComplete(cid,l.n)).length,ex=ST.exams[`${cid}-w${w.n}`];
    return `<details class="week" ${w.n===1?'open':''}><summary><span class="wn">Week ${w.n}</span><span class="wt">${w.title}</span><span class="wp">${done} / ${w.lessons.length}</span></summary>
      <ul class="lessons">${w.lessons.map(l=>`<li data-t="${(l.title+' '+l.sec).toLowerCase()}"><span class="tick">${lessonComplete(cid,l.n)?'✓':''}</span><span class="n">${l.sec}</span><a href="#/${cid}/l/${l.n}">${l.title}</a></li>`).join('')}
      <li class="testrow" data-t="test week ${w.n}"><span class="tick">${ex&&ex.best>=Math.ceil(ex.total*.7)?'✓':''}</span><span class="n">Test</span><a href="#/exam/${cid}-w${w.n}">Week ${w.n} test</a>${ex?`<span class="wp">${ex.best} / ${ex.total}</span>`:''}</li></ul></details>`}).join('')}</div>`;
  const s=$('.search');s.oninput=()=>{const q=s.value.trim().toLowerCase();$$('details.week').forEach(d=>{let any=false;$$('li',d).forEach(li=>{const m=!q||li.dataset.t.includes(q);li.style.display=m?'':'none';if(m)any=true});d.style.display=any?'':'none';if(q&&any)d.open=true})};
}

function lessonPage(cid,n,tab,slide){
  setNav(cid);const l=lessonN(cid,n),c=course(cid);
  if(!l){app.innerHTML='<h1>Not found</h1>';return}
  app.className=tab==='practice'?'':'';
  app.innerHTML=`${crumbs(['Home','#/'],[c.name,`#/${cid}`],[`Week ${l.week}`])}<h1>${l.title}</h1>
    <div class="tabs"><a href="#/${cid}/l/${n}/slides" class="${tab==='slides'?'on':''}">Slides</a><a href="#/${cid}/l/${n}/practice" class="${tab==='practice'?'on':''}">Practice</a></div><div id="tabBody"></div>`;
  if(tab==='practice')practice(cid,l);else{slides(cid,l);if(slide)go(+slide)}
  window.scrollTo(0,0);
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

// ---------- slides ----------
function slides(cid,l){
  const body=$('#tabBody');
  const items=[
    {name:'Objectives',mount:h=>{
      const objs=l.obj&&l.obj.length?l.obj:[l.title];
      h.innerHTML=`<div class="big">${l.title}</div><ul class="objs">${objs.map(o=>`<li>${o}</li>`).join('')}</ul>${l.keys&&l.keys.length?`<div class="keys">${l.keys.map(k=>`<span>${k}</span>`).join('')}</div>`:''}`}},
    ...l.pages.map((p,i)=>({name:`Book page ${p}`,mount:h=>{h.innerHTML=`<div class="page"><img src="img/${cid}/${pad3(p)}.jpg" alt="Book page ${p}"></div>`;const pg=$('.page',h);pg.onclick=()=>pg.classList.toggle('zoom')}})),
    {name:'Worked example',mount:h=>{
      let lv=0;
      const draw=()=>{const p=makeProblem(pick(mkR(rndSeed()),sectionSkills(cid,l.sec)),mkR(rndSeed()),lv);let shown=0;
        h.innerHTML=`<div class="row" style="margin-bottom:.6rem"><select id="lv"><option value="0">Easy</option><option value="1">Medium</option><option value="2">Hard</option></select><button class="btn alt" id="nw">New example</button><span class="sp"></span><button class="btn" id="nx">Next step</button><button class="btn alt" id="all">Show all</button></div>
          <div class="q"><div class="qt">${p.text||''}</div>${p.eq?`<div class="eq">${p.eq}</div>`:''}${p.svg||''}${p.mc?`<div class="opts">${p.choices.map(c=>`<label><span>${c}</span></label>`).join('')}</div>`:''}<ol class="sol" id="st" hidden></ol></div>`;
        $('#lv',h).value=lv;$('#lv',h).onchange=e=>{lv=+e.target.value;draw()};$('#nw',h).onclick=draw;
        const upd=()=>{const s=$('#st',h);s.hidden=shown===0;s.innerHTML=p.steps.slice(0,shown).map(x=>`<li>${x}</li>`).join('')+(shown>=p.steps.length?`<li>Answer: <b>${ansText(p)}</b></li>`:'')};
        $('#nx',h).onclick=()=>{shown=Math.min(p.steps.length+1,shown+1);upd()};$('#all',h).onclick=()=>{shown=99;upd()}};
      draw()}},
    {name:'Check',mount:h=>{
      const ps=lessonProblems(cid,l,3,rndSeed(),[0,1,2]);h.innerHTML='<div id="ck"></div>';
      ps.forEach((p,i)=>$('#ck',h).appendChild(problemCard(p,{title:`Question ${i+1}`}).el))}},
    {name:'Practice',mount:h=>{h.innerHTML=`<div class="big">Practice</div><p><a class="btn" href="#/${cid}/l/${l.n}/practice">Start practice</a></p>${l.n<allLessons(cid).length?`<p><a href="#/${cid}/l/${l.n+1}">Next lesson →</a></p>`:''}`}},
  ];
  body.innerHTML=`<div class="deck" id="deck"><div class="deckbar"><span id="dn"></span><span class="sp"></span><div class="dots" id="dots"></div><button class="ghost" id="fs">Full screen</button></div><div class="stage" id="stage"></div><div class="decknav"><button class="btn alt" id="pv">Back</button><span id="num"></span><button class="btn" id="nt">Next</button></div></div>`;
  DECK={i:0,items};
  $('#pv').onclick=()=>go(DECK.i-1);$('#nt').onclick=()=>go(DECK.i+1);$('#fs').onclick=toggleFS;
  go(0);
}
function go(i){
  if(!DECK)return;i=Math.max(0,Math.min(DECK.items.length-1,i));DECK.i=i;
  const st=$('#stage');st.innerHTML='';st.scrollTop=0;const h=document.createElement('div');st.appendChild(h);DECK.items[i].mount(h);
  $('#dn').textContent=DECK.items[i].name;$('#num').textContent=`${i+1} / ${DECK.items.length}`;
  $('#dots').innerHTML=DECK.items.map((s,k)=>`<button class="dot ${k===i?'on':k<i?'seen':''}" data-k="${k}" title="${s.name}"></button>`).join('');
  $$('#dots .dot').forEach(b=>b.onclick=()=>go(+b.dataset.k));
  $('#pv').disabled=i===0;$('#nt').disabled=i===DECK.items.length-1;
}
function toggleFS(){const d=$('#deck');if(!d)return;if(document.fullscreenElement)document.exitFullscreen();else (d.requestFullscreen||d.webkitRequestFullscreen||(()=>{})).call(d)}
document.addEventListener('keydown',e=>{
  if(!DECK||!$('#deck'))return;if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;
  if(e.key==='ArrowRight'||e.key==='PageDown')go(DECK.i+1);else if(e.key==='ArrowLeft'||e.key==='PageUp')go(DECK.i-1);else if(e.key==='f'||e.key==='F')toggleFS();
});

// ---------- exams ----------
function examsPage(){
  setNav('exams');app.className='';
  const link=d=>{const b=ST.exams[d.id];return `<a class="examlink" href="#/exam/${d.id}"><b>${d.title.replace(/^.* (test|exam)$/,m=>m)}</b><small>${d.n} questions · ${d.min} min</small>${b?`<div class="best">Best ${b.best} / ${b.total}</div>`:''}</a>`};
  app.innerHTML=`<h1>Exams</h1>${COURSE_IDS.map(cid=>{const ds=examDefs(cid);return `<h2>${course(cid).name}</h2><h3>Final and term exams</h3><div class="examgrid">${ds.filter(d=>d.kind!=='week').map(link).join('')}</div><h3 style="margin-top:1rem">Week tests</h3><div class="examgrid">${ds.filter(d=>d.kind==='week').map(link).join('')}</div>`}).join('')}`;
}
function examPage(id){
  setNav('exams');app.className='';clearInterval(TIMER);
  const cid=id.split('-')[0],def=examDefs(cid).find(d=>d.id===id);
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
  clearInterval(TIMER);DECK=null;if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
  const p=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);
  if(!p.length)return home();
  if(p[0]==='exams')return examsPage();
  if(p[0]==='exam')return examPage(p[1]);
  if(COURSE_IDS.includes(p[0])){
    if(p[1]==='l')return lessonPage(p[0],+p[2],p[3]==='practice'?'practice':'slides',p[4]);
    return coursePage(p[0]);
  }
  home();
}
window.addEventListener('hashchange',route);
route();
