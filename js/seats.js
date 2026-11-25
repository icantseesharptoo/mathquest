/* Class seating plan for each year: 5 rows of 4 seats, each with an alias and a DiceBear avatar.
   Stored only in this browser. The avatar service gets a random code, never the alias. */
const SEAT_ROWS=5,SEAT_COLS=4,SEAT_N=SEAT_ROWS*SEAT_COLS;
const AV_STYLES=[['fun-emoji','Emoji'],['adventurer','Adventurer'],['big-smile','Big smile'],['bottts','Robots'],['pixel-art','Pixel art'],['lorelei','Lorelei'],['thumbs','Thumbs'],['croodles','Doodles']];
const avSeed=()=>Math.random().toString(36).slice(2,10);
const avURL=a=>`https://api.dicebear.com/9.x/${a.style}/svg?seed=${a.seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
const avOK=a=>a&&AV_STYLES.some(s=>s[0]===a.style)&&/^[a-z0-9]+$/.test(a.seed||'');
const SEAT_KEY=cid=>'maths.class.'+cid;
function classSeats(cid){
  let a=[];try{a=JSON.parse(localStorage.getItem(SEAT_KEY(cid)))||[]}catch(e){}
  if(!Array.isArray(a))a=[];
  return Array.from({length:SEAT_N},(_,i)=>a[i]&&a[i].name?{name:String(a[i].name).slice(0,24),...(avOK(a[i])?{style:a[i].style,seed:a[i].seed}:{style:AV_STYLES[0][0],seed:avSeed()})}:null);
}
const classCount=cid=>classSeats(cid).filter(Boolean).length;
// the initial is shown underneath while the picture loads or when there is no internet
const avHTML=a=>`<span class="av"><i>${esc((a.name||'?').charAt(0).toUpperCase())}</i><img alt="" draggable="false" referrerpolicy="no-referrer" src="${avURL(a)}" onerror="this.remove()"></span>`;
function seating(cid){
  let seats=classSeats(cid),moving=-1,drag=-1;
  const o=openOverlay('seats',`<div class="ovbar"><b>${course(cid).name} seating plan</b><span class="xtsub seatcount"></span><span class="sp"></span><button class="btn alt" data-k="list">Add a list</button><button class="btn alt" data-k="mix">Shuffle seats</button><button class="btn alt" data-k="clear">Clear</button><button class="btn" data-close>Close ✕</button></div>
    <div class="seatwrap"><div class="seatboard">Board</div><div class="seatgrid"></div><div class="note seatnote">Click a seat to add or edit a student. Drag to move or swap. Use aliases: they stay in this browser. Avatars: <a href="https://www.dicebear.com" target="_blank" rel="noopener">DiceBear</a>.</div></div><div class="seatdlg" hidden></div>`);
  const grid=$('.seatgrid',o),dlg=$('.seatdlg',o);
  const save=()=>{try{localStorage.setItem(SEAT_KEY(cid),JSON.stringify(seats))}catch(e){alert('The seating plan could not be saved in this browser.')}draw()};
  const swap=(a,b)=>{if(a===b)return;[seats[a],seats[b]]=[seats[b],seats[a]];save()};
  function draw(){
    let k=0;
    grid.innerHTML=seats.map((s,i)=>`<button class="seat ${s?'':'empty'} ${i===moving?'moving':''}" data-i="${i}" draggable="${!!s}" aria-label="${s?esc(s.name):'Empty seat'}, row ${Math.floor(i/SEAT_COLS)+1} seat ${i%SEAT_COLS+1}">${s?`<span class="seatn">${++k}</span>${avHTML(s)}<span class="seatname">${esc(s.name)}</span>`:'<span class="seatplus">+</span>'}</button>`).join('');
    $('.seatcount',o).textContent=moving>=0?`Choose a seat for ${seats[moving].name}`:`${k} / ${SEAT_N} students`;
    $$('.seat',grid).forEach(b=>{const i=+b.dataset.i;
      b.onclick=()=>{if(moving>=0){const m=moving;moving=-1;if(m===i)draw();else swap(m,i)}else edit(i)};
      b.ondragstart=e=>{drag=i;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain','seat')};
      b.ondragover=e=>{if(drag>=0){e.preventDefault();b.classList.add('over')}};b.ondragleave=()=>b.classList.remove('over');
      b.ondragend=()=>{drag=-1};
      b.ondrop=e=>{e.preventDefault();const d=drag;drag=-1;b.classList.remove('over');if(d>=0)swap(d,i)}});
  }
  const shut=()=>{dlg.hidden=true;dlg.innerHTML=''};
  function edit(i){
    const s=seats[i],cur=s?{...s}:{name:'',style:AV_STYLES[Math.floor(Math.random()*AV_STYLES.length)][0],seed:avSeed()};let seeds=[cur.seed,...Array.from({length:11},avSeed)];
    dlg.innerHTML=`<form class="seatform"><h3>Row ${Math.floor(i/SEAT_COLS)+1}, seat ${i%SEAT_COLS+1}</h3><div class="row"><input type="text" name="nm" maxlength="24" placeholder="Alias" autocomplete="off" aria-label="Alias"><select name="st" aria-label="Avatar style">${AV_STYLES.map(x=>`<option value="${x[0]}">${x[1]}</option>`).join('')}</select><button type="button" class="btn alt" data-k="more">More avatars</button></div>
      <div class="avpick"></div><div class="row"><button class="btn">Save</button>${s?'<button type="button" class="btn alt" data-k="move">Move</button><button type="button" class="btn alt" data-k="del">Remove</button>':''}<span class="sp"></span><button type="button" class="btn alt" data-k="no">Cancel</button></div></form>`;
    dlg.hidden=false;const f=$('form',dlg);f.nm.value=cur.name;f.st.value=cur.style;
    const pickDraw=()=>{$('.avpick',f).innerHTML=seeds.map(x=>`<button type="button" class="${x===cur.seed?'on':''}" data-s="${x}" aria-label="Choose this avatar">${avHTML({name:f.nm.value,style:cur.style,seed:x})}</button>`).join('');
      $$('.avpick button',f).forEach(b=>b.onclick=()=>{cur.seed=b.dataset.s;$$('.avpick button',f).forEach(x=>x.classList.toggle('on',x===b))})};
    pickDraw();f.nm.focus();
    f.st.onchange=()=>{cur.style=f.st.value;pickDraw()};
    $('[data-k=more]',f).onclick=()=>{seeds=[cur.seed,...Array.from({length:11},avSeed)];pickDraw()};
    $('[data-k=no]',f).onclick=shut;
    f.onsubmit=e=>{e.preventDefault();const nm=f.nm.value.trim();if(!nm){f.nm.focus();return}cur.name=nm;seats[i]=cur;shut();save()};
    if(s){$('[data-k=move]',f).onclick=()=>{moving=i;shut();draw()};$('[data-k=del]',f).onclick=()=>{seats[i]=null;shut();save()}}
  }
  $('[data-k=list]',o).onclick=()=>{
    const free=seats.filter(s=>!s).length;
    dlg.innerHTML=`<form class="seatform"><h3>Add a list of aliases</h3><p class="note">One alias per line. They fill the ${free} empty seats in order, each with a random avatar.</p><textarea name="tx" rows="10"></textarea><div class="note seatmsg"></div><div class="row"><button class="btn">Add</button><span class="sp"></span><button type="button" class="btn alt" data-k="no">Cancel</button></div></form>`;
    dlg.hidden=false;const f=$('form',dlg);f.tx.focus();$('[data-k=no]',f).onclick=shut;
    f.onsubmit=e=>{e.preventDefault();const ns=f.tx.value.split(/[\n,;]+/).map(x=>x.trim().slice(0,24)).filter(Boolean);
      if(ns.length>free){$('.seatmsg',f).textContent=`There are ${ns.length} aliases but only ${free} empty seats.`;return}
      const st=mkR(rndSeed());ns.forEach(n=>{seats[seats.indexOf(null)]={name:n,style:st.pick(AV_STYLES)[0],seed:avSeed()}});shut();save()};
  };
  // only the students change places; empty seats stay empty
  $('[data-k=mix]',o).onclick=()=>{moving=-1;const at=seats.map((s,i)=>s?i:-1).filter(i=>i>=0),p=mkR(rndSeed()).shuffle(at.map(i=>seats[i]));at.forEach((i,k)=>{seats[i]=p[k]});save()};
  $('[data-k=clear]',o).onclick=()=>{if(confirm('Remove all students from this seating plan?')){moving=-1;seats=seats.map(()=>null);save()}};
  save();
}
