/* Curriculum objectives as a carousel: one objective per coloured card, text scaled to fill it, main words bold. */
const OBJ_COLS=[['#1d4ed8','#3730a3'],['#047857','#065f46'],['#b91c1c','#9f1239'],['#7c3aed','#5b21b6'],['#b45309','#92400e'],['#0e7490','#155e75'],['#be185d','#86198f']];
// everyday and instruction words stay normal; the remaining words (the maths) are bold
const OBJ_PLAIN=new Set(('a an and or the of to in on at by for from with without as is are be been being was were has have had do does can could may might must should will would that this these those it its their them they there than then when where which who whose what how if not no all any each every some other such both only also more most one two into onto within between over under up out off including include includes etc where appropriate '
 +'understand use uses used using know recognise recognising identify identifying describe describing explain find finding work make give given solve solving calculate calculating demonstrate derive interpret interpreting apply applying carry set express extend generate generating show choose design conduct construct draw plot read record select manipulate simplify estimate order '
 +'follow familiarity terms context contexts different same simple basic related concepts knowledge understanding ability reasonable various particular possible relevant need needs involving about through means way ways').split(' '));
const objBold=t=>esc(t).replace(/(&[a-z]+;)|[A-Za-zÀ-ÿ]+(?:[-’'][A-Za-zÀ-ÿ]+)*/g,(w,ent)=>ent||(w.length<3||OBJ_PLAIN.has(w.toLowerCase())?w:`<b>${w}</b>`)).replace(/<\/b>(\s)<b>/g,'$1');
// "8Ni.01 text" -> code and text; "– text" belongs to the objective before it; a short line before a code is a heading
function objParse(goals){
  const out=[];let head='';const code=g=>/^\d+[A-Za-z]+\.\d+/.test(g||'');
  goals.forEach((g,i)=>{g=g.trim();if(!g)return;
    if(/^[–—-]\s/.test(g)&&out.length){out[out.length-1].sub.push(g.replace(/^[–—-]\s*/,''));return}
    if(!code(g)&&code(goals[i+1])&&g.length<60&&!/[.:]$/.test(g)){head=g;return}
    const m=g.match(/^(\d+[A-Za-z]+\.\d+)\s*(.*)$/),t=m?m[2]:g;// long objectives are split at sentences and semicolons so the text stays large
    (t.length>150?t.split(/(?<=[.;])\s+(?=[A-Za-z])(?<!e\.g\.\s|i\.e\.\s)/):[t]).forEach(p=>{p=p.replace(/[;\s]+$/,'').replace('andalgebraically','and algebraically');if(p)out.push({code:m?m[1]:'',head,text:p.charAt(0).toUpperCase()+p.slice(1),sub:[]})})});
  return out;
}
function objectivesCarousel(goals,h){
  const items=objParse(goals),n=items.length,box=document.createElement('div');if(!n)return null;
  box.className='objc';let i=0,timer=null,paused=false,hover=false;
  const still=REDUCED();
  box.innerHTML=`<div class="objtop"><b>Curriculum objectives</b><span class="objn"></span></div><div class="objview"></div>
    <div class="objnav"><button class="objp" aria-label="Previous objective">‹</button><div class="objdots">${items.map((x,k)=>`<button data-k="${k}" aria-label="Objective ${k+1}"></button>`).join('')}</div><button class="objpause" aria-label="Pause or play"></button><button class="objx" aria-label="Next objective">›</button></div>`;
  const view=$('.objview',box);
  // largest text that fits the card
  const fit=()=>{const c=$('.objcard:not(.leave)',view),t=c&&$('.objfit',c);if(!t||!c.clientHeight)return;
    const room=c.clientHeight-2*parseFloat(getComputedStyle(c).paddingTop);let lo=12,hi=110;
    for(let k=0;k<9;k++){const mid=(lo+hi)/2;t.style.fontSize=mid+'px';if(t.scrollHeight<=room&&t.scrollWidth<=t.clientWidth+1)lo=mid;else hi=mid}t.style.fontSize=lo+'px'};
  const show=(k,dir)=>{
    i=(k+n)%n;const x=items[i],[a,b]=OBJ_COLS[i%OBJ_COLS.length],old=$('.objcard:not(.leave)',view),c=document.createElement('div');
    c.className='objcard';c.style.background=`linear-gradient(135deg,${a},${b})`;
    c.innerHTML=`<div class="objfit">${x.code||x.head?`<div class="objcode">${esc([x.code,x.head].filter(Boolean).join(' · '))}</div>`:''}<div class="objtext">${objBold(x.text)}</div>${x.sub.length?`<ul>${x.sub.map(s=>`<li>${objBold(s)}</li>`).join('')}</ul>`:''}</div>`;
    $$('.leave',view).forEach(e=>e.remove());
    if(old){if(still)old.remove();else old.classList.add('leave')}
    view.appendChild(c);fit();
    if(old&&!still){const d=dir<0?-1:1,o={duration:600,easing:'cubic-bezier(.4,0,.2,1)'};
      old.animate([{transform:'none',opacity:1},{transform:`translateX(${-100*d}%) scale(.85)`,opacity:.2}],o).onfinish=()=>old.remove();
      c.animate([{transform:`translateX(${100*d}%) scale(.85)`,opacity:.2},{transform:'none',opacity:1}],o)}
    $('.objn',box).textContent=`${i+1} / ${n}`;$$('.objdots button',box).forEach((e,j)=>{e.classList.toggle('on',j===i);e.style.background=j===i?a:''});
  };
  const auto=()=>{clearTimeout(timer);$('.objpause',box).textContent=paused||still?'▶':'⏸';if(paused||still||n<2)return;
    timer=setTimeout(()=>{if(!box.isConnected)return;if(!hover&&!document.hidden)show(i+1,1);auto()},Math.min(14000,5000+items[i].text.length*35))};
  const step=d=>{show(i+d,d);auto()};
  $('.objp',box).onclick=()=>step(-1);$('.objx',box).onclick=()=>step(1);
  $('.objpause',box).hidden=still;
  $('.objpause',box).onclick=()=>{paused=!paused;auto()};
  $$('.objdots button',box).forEach(b=>b.onclick=()=>{const k=+b.dataset.k;if(k!==i){show(k,k<i?-1:1);auto()}});
  box.onmouseenter=()=>hover=true;box.onmouseleave=()=>hover=false;
  if(n<2)$('.objnav',box).hidden=true;
  new ResizeObserver(fit).observe(view);
  if(h)h.stepNext=()=>{if(i>=n-1)return false;step(1);return true};
  show(0,1);auto();box.items=items;
  return box;
}
