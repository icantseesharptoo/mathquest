/* Courses (built from the Edupage plans), problem sets, answer checking, exams, saved progress. */
const LEVELS=['easy','medium','hard'];
const STORE_KEY='maths.v2';
let ST=(()=>{try{return JSON.parse(localStorage.getItem(STORE_KEY))||{}}catch(e){return{}}})();
ST.done=ST.done||{};ST.exams=ST.exams||{};ST.theme=ST.theme||'system';
const saveState=()=>{try{localStorage.setItem(STORE_KEY,JSON.stringify(ST))}catch(e){}};

// ---------- courses: plan chapters -> modules, plan rows -> topics (one card each) ----------
const COURSE_IDS=['y8','y10'];
const MOD_COLORS=['#2455d6','#7c3aed','#0d9488','#c2410c','#0891b2','#be185d','#15803d','#b45309','#4f46e5','#dc2626','#475569'];
window.COURSES={};
COURSE_IDS.forEach(cid=>{
  const P=window.PLANS[cid];let n=0;
  const modules=P.chapters.map((ch,i)=>({n:i+1,title:ch.title,goals:ch.goals,color:MOD_COLORS[i%MOD_COLORS.length],
    lessons:ch.topics.map((t,j)=>Object.assign({},t,{n:++n,week:i+1,inweek:j+1,sec:`${i+1}.${j+1}`,part:1,obj:[]}))}));
  const all=[...new Set(modules.flatMap(m=>m.lessons.flatMap(l=>l.skills)).filter(s=>s!=='REVIEW'))];
  modules.forEach(m=>m.lessons.forEach(l=>{if(l.skills.includes('REVIEW')){l.review=true;l.skills=all}}));
  window.COURSES[cid]={id:cid,name:P.name,source:P.source,playlist:P.playlist,modules,weeks:modules};
});
const course=id=>window.COURSES[id];
const allLessons=id=>course(id).modules.flatMap(m=>m.lessons);
const lessonN=(id,n)=>allLessons(id)[n-1];
const sectionSkills=(cid,sec)=>{const l=allLessons(cid).find(x=>x.sec===sec);return l?l.skills:[]};

// typed hyphens before digits become real minus signs (never inside SVG markup)
const fixMinus=s=>typeof s==='string'?s.replace(/(^|[\s(=×÷+,>])-(?=\d)/g,'$1−'):s;
function makeProblem(name,r,lv){
  for(let t=0;t<30;t++){
    let p=null;try{p=G[name](r,lv)}catch(e){p=null}
    if(p&&p.steps&&p.steps.length&&(p.mc||Number.isFinite(p.ans))){
      p.text=fixMinus(p.text);p.eq=fixMinus(p.eq);p.steps=p.steps.map(fixMinus);if(p.choices)p.choices=p.choices.map(fixMinus);
      p.skill=name;p.lv=lv;p.level=LEVELS[lv];return p;
    }
  }
  throw new Error('generator failed: '+name);
}
function checkAnswer(p,s){
  if(p.mc)return s!==''&&Number(s)===p.ans;
  const v=parseNum(s);return v!==null&&Math.abs(v-p.ans)<=(p.tol||1e-6);
}
function ansText(p){
  if(p.mc)return p.choices[p.ans];
  const v=fixMinus(p.ansStr||fmtNum(p.ans));
  return `${p.label&&p.label!=='Answer ='?p.label+' ':''}${v}${p.unit||''}`.trim();
}

// problems for one topic: its skills in turn, easy → hard
function lessonProblems(cid,lesson,n,seed,levels){
  const r=mkR(seed),names=lesson.review?r.shuffle(lesson.skills):lesson.skills,out=[];
  const pat=levels||[0,0,0,0,1,1,1,1,1,2,2,2];
  for(let i=0;i<n;i++)out.push(makeProblem(names[i%names.length],r,pat[i%pat.length]));
  return out;
}
const moduleSkills=(cid,mods)=>[...new Set(mods.flatMap(m=>course(cid).modules[m-1].lessons.filter(l=>!l.review).flatMap(l=>l.skills)))];
function examProblems(cid,mods,n,seed){
  const r=mkR(seed),names=moduleSkills(cid,mods),out=[];
  const lvs=Array.from({length:n},(_,i)=>i<n*.3?0:i<n*.75?1:2),order=r.shuffle(names);
  for(let i=0;i<n;i++)out.push(makeProblem(order[i%order.length],r,lvs[i]));
  return out;
}
function examDefs(cid){
  const c=course(cid),defs=[],real=c.modules.filter(m=>m.lessons.some(l=>!l.review));
  real.forEach(m=>defs.push({id:`${cid}-m${m.n}`,cid,kind:'module',title:`${m.title} test`,weeks:[m.n],n:12,min:20,sub:`Module ${m.n}`}));
  defs.push({id:`${cid}-final`,cid,kind:'final',title:`${c.name} final exam`,weeks:real.map(m=>m.n),n:40,min:90,sub:'All modules'});
  return defs;
}
const markLessonDone=(cid,n,score,total)=>{const k=`${cid}-${n}`,o=ST.done[k]||{best:0,total};o.best=Math.max(o.best,score);o.total=total;ST.done[k]=o;saveState()};
const lessonProgress=(cid,n)=>ST.done[`${cid}-${n}`];
const lessonComplete=(cid,n)=>{const o=lessonProgress(cid,n);return !!o&&o.best>=Math.ceil(o.total*.7)};
const rndSeed=()=>Math.floor(Math.random()*1e9);
