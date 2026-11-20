/* Problem sets, answer checking, exams, saved progress. */
const LEVELS=['easy','medium','hard'];
const STORE_KEY='maths.v1';
let ST=(()=>{try{return JSON.parse(localStorage.getItem(STORE_KEY))||{}}catch(e){return{}}})();
ST.done=ST.done||{};ST.exams=ST.exams||{};ST.theme=ST.theme||'system';
const saveState=()=>{try{localStorage.setItem(STORE_KEY,JSON.stringify(ST))}catch(e){}};

const COURSE_IDS=['y8','y10'];
const course=id=>window.COURSES[id];
const allLessons=id=>course(id).weeks.flatMap(w=>w.lessons);
const lessonN=(id,n)=>allLessons(id)[n-1];
const sectionSkills=(cid,sec)=>SKILLS[cid][sec]||[];

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

// problems for one lesson: its section's skills, emphasising the skill of this part of the section
function lessonProblems(cid,lesson,n,seed,levels){
  const r=mkR(seed),names=sectionSkills(cid,lesson.sec),out=[];
  const pat=levels||[0,0,0,0,1,1,1,1,1,2,2,2];
  for(let i=0;i<n;i++){
    const lv=pat[i%pat.length],name=names[(i+lesson.part-1)%names.length];
    out.push(makeProblem(name,r,lv));
  }
  return out;
}
function weekSections(cid,weeks){
  const s=[];weeks.forEach(w=>course(cid).weeks[w-1].lessons.forEach(l=>{if(!s.includes(l.sec))s.push(l.sec)}));return s;
}
function examProblems(cid,weeks,n,seed){
  const r=mkR(seed),secs=weekSections(cid,weeks),out=[];
  const lvs=Array.from({length:n},(_,i)=>i<n*.3?0:i<n*.75?1:2);
  for(let i=0;i<n;i++){
    const sec=secs[(i*7+r.int(0,secs.length-1))%secs.length],names=sectionSkills(cid,sec);
    out.push(makeProblem(pick(r,names),r,lvs[i]));
    out[i].sec=sec;
  }
  return out;
}
function examDefs(cid){
  const nm=course(cid).name,defs=[];
  course(cid).weeks.forEach(w=>defs.push({id:`${cid}-w${w.n}`,cid,kind:'week',title:`Week ${w.n} test`,weeks:[w.n],n:12,min:20,sub:w.title}));
  [[1,9],[10,18],[19,27]].forEach(([a,b],i)=>defs.push({id:`${cid}-t${i+1}`,cid,kind:'term',title:`Term ${i+1} exam`,weeks:Array.from({length:b-a+1},(_,k)=>a+k),n:25,min:45,sub:`Weeks ${a}–${b}`}));
  defs.push({id:`${cid}-final`,cid,kind:'final',title:`${nm} final exam`,weeks:Array.from({length:27},(_,k)=>k+1),n:40,min:90,sub:'Weeks 1–27'});
  return defs;
}
const markLessonDone=(cid,n,score,total)=>{const k=`${cid}-${n}`,o=ST.done[k]||{best:0,total};o.best=Math.max(o.best,score);o.total=total;ST.done[k]=o;saveState()};
const lessonProgress=(cid,n)=>ST.done[`${cid}-${n}`];
const lessonComplete=(cid,n)=>{const o=lessonProgress(cid,n);return !!o&&o.best>=Math.ceil(o.total*.7)};
const rndSeed=()=>Math.floor(Math.random()*1e9);
