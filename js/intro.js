/* Topic opening slides: an animated title, then "Why it matters" (fun fact, real-life use, fun videos). */
const extrasFor=(cid,l)=>(window.EXTRAS||{})[`${cid}:${l.title}`]||(window.EXTRAS||{})[l.title]||null;
const REDUCED=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

// Title letters fade away and come back; now and then one hangs from its last nail, wobbles and falls.
function titleSlide(h,cid,l,m,c){
  const words=l.title.split(' ').map(w=>`<span class="tw">${[...w].map(ch=>`<span class="tl">${esc(ch)}</span>`).join('')}</span>`).join(' ');
  h.innerHTML=`<div class="tslide" style="--mc:${m.color}"><div class="ts-k">${c.name} · Module ${m.n}</div><h1 class="ts-t">${words}</h1>
    <div class="ts-s">${m.title} · Lesson${l.nLessons>1?'s':''} ${l.lessons}</div><div class="ts-go note">Press → to begin</div></div>`;
  h.classList.add('fill');
  const box=$('.tslide',h),ls=$$('.tl',h).filter(x=>/[^\s.,:;()'’\-–]/.test(x.textContent));
  const busy=new Set();let falling=false,timer=null;
  const alive=()=>h.isConnected&&!document.hidden;
  const free=()=>{const f=ls.filter(x=>!busy.has(x));return f.length?f[Math.floor(Math.random()*f.length)]:null};
  const fade=el=>{busy.add(el);const a=el.animate([{opacity:1},{opacity:0,offset:.35},{opacity:0,offset:.6},{opacity:1}],{duration:2400+Math.random()*1600,easing:'ease-in-out'});a.onfinish=a.oncancel=()=>busy.delete(el)};
  const fall=el=>{
    busy.add(el);falling=true;const left=Math.random()<.5,s=left?1:-1;
    el.classList.add(left?'nail-l':'nail-r');el.style.transformOrigin=left?'18% 10%':'82% 10%';
    const R=d=>`rotate(${s*d}deg)`;
    const wob=el.animate([{transform:R(0)},{transform:R(14),offset:.12},{transform:R(6),offset:.22},{transform:R(22),offset:.4},{transform:R(15),offset:.5},{transform:R(30),offset:.66},{transform:R(24),offset:.74},{transform:R(38),offset:.9},{transform:R(35)}],{duration:2800,easing:'ease-in-out',fill:'forwards'});
    wob.onfinish=()=>setTimeout(()=>{
      if(!h.isConnected)return;el.classList.remove('nail-l','nail-r');
      const drop=box.getBoundingClientRect().bottom-el.getBoundingClientRect().top+60;
      const f=el.animate([{transform:R(35),opacity:1},{transform:`translate(${s*24}px,${drop*.25}px) rotate(${s*80}deg)`,opacity:1,offset:.45},{transform:`translate(${s*50}px,${drop}px) rotate(${s*170}deg)`,opacity:1}],{duration:950,easing:'cubic-bezier(.55,0,1,.45)',fill:'forwards'});
      wob.cancel();
      f.onfinish=()=>{box.animate([{transform:'translateY(0)'},{transform:'translateY(5px)'},{transform:'translateY(-3px)'},{transform:'translateY(1px)'},{transform:'translateY(0)'}],{duration:320});
        setTimeout(()=>{f.cancel();el.style.transformOrigin='';
          const back=el.animate([{transform:'translateY(-90px)',opacity:0},{transform:'translateY(6px)',opacity:1,offset:.7},{transform:'translateY(-2px)',offset:.85},{transform:'none',opacity:1}],{duration:800,easing:'ease-out'});
          back.onfinish=back.oncancel=()=>{busy.delete(el);falling=false}},1800+Math.random()*1500)};
    },350);
  };
  const step=()=>{
    if(!h.isConnected)return;
    if(alive()&&ls.length){const el=free();if(el){if(!falling&&!REDUCED()&&Math.random()<.35)fall(el);else fade(el)}}
    timer=setTimeout(step,3500+Math.random()*8000);   // rare: one effect every 3.5–11.5 s
  };
  timer=setTimeout(step,1500+Math.random()*2500);
  h.titleLetters=ls;
}

function whySlide(h,cid,l){
  const x=extrasFor(cid,l);
  if(!x){h.innerHTML='<div class="big">Why it matters</div>';return}
  const vids=x.videos||[];
  h.innerHTML=`<div class="big">Why it matters</div>
    <div class="whycards"><div class="whyc fact"><div class="wi">💡</div><div><b>Fun fact</b><p>${x.fact}</p></div></div>
      <div class="whyc use"><div class="wi">🌍</div><div><b>In real life</b><p>${x.use}</p></div></div></div>
    ${vids.length?`<h3 class="funh">Fun videos about this topic</h3><div class="funv">${vids.map(([id,t,ch,len],i)=>`<div class="fv">
      <button class="fvthumb" data-i="${i}" title="${canEmbed()?'Play here with questions':'Open on YouTube'}"><img src="${ytThumb(id)}" alt="" loading="lazy"><span class="fvlen">${len||''}</span><span class="fvplay">▶</span></button>
      <div class="fvt"><a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener">${esc(t)} ↗</a><small>${esc(ch||'')}</small></div></div>`).join('')}</div>
      <div class="funplay"></div><p class="note">Links open on YouTube. Check a video before showing it to the class.</p>`:''}`;
  $$('.fvthumb',h).forEach(b=>b.onclick=()=>{const id=vids[+b.dataset.i][0];
    if(!canEmbed()){window.open(`https://www.youtube.com/watch?v=${id}`,'_blank','noopener');return}
    const p=$('.funplay',h);p.innerHTML='';p.appendChild(interactiveVideo(cid,l,id));p.scrollIntoView({behavior:'smooth',block:'nearest'})});
  // Space: reveal the fact, then the use, then the videos
  const parts=[$('.whyc.fact',h),$('.whyc.use',h),$('.funh',h),$('.funv',h)].filter(Boolean);
  let k=0;parts.forEach((p,i)=>{if(i)p.classList.add('pending')});
  const reveal=()=>{if(k>=parts.length-1)return false;k++;parts[k].classList.remove('pending');if(parts[k].classList.contains('funh')&&parts[k+1]){k++;parts[k].classList.remove('pending')}return true};
  parts.forEach(p=>p.addEventListener('click',e=>{if(!p.classList.contains('pending'))return;e.stopPropagation();e.preventDefault();while(p.classList.contains('pending')&&reveal());},true));
  h.stepNext=reveal;
}
