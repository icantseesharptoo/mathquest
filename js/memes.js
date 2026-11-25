/* Meme slide: maths memes from Reddit through Meme_Api (github.com/D3vd/Meme_Api).
   NSFW and spoiler posts and rude titles are left out; saved and hidden memes are kept in this browser. */
const MEME_SUBS=['mathmemes','MathematicsMemes'],MEME_KEY='maths.memes';
const MEME_RUDE=/fuck|shit|\bass(es|hole)?\b|bitch|\bsex|porn|nude|naked|\bdick|cock\b|pussy|cunt|whore|slut|bastard|damn|\bhell\b|wtf|stfu|lmfao|\bgay\b|retard|suicid|kill (my|your)self|\bkms\b|\b69\b|\b420\b|weed|drunk|beer|cocaine|meth\b|hitler|nazi|rape|horny|milf|boob|tits|penis|vagina|orgasm|hentai|onlyfans/i;
const memeStore=()=>{let s={};try{s=JSON.parse(localStorage.getItem(MEME_KEY))||{}}catch(e){}return {kept:s.kept||[],hidden:s.hidden||[],only:!!s.only}};
const memeSave=s=>{try{localStorage.setItem(MEME_KEY,JSON.stringify(s))}catch(e){}};
const memeOK=m=>m&&!m.nsfw&&!m.spoiler&&/^https:\/\/i\.redd\.it\/[\w.-]+\.(png|jpe?g|gif|webp)$/i.test(m.url||'')&&/^https:\/\/(redd\.it|www\.reddit\.com)\//.test(m.postLink||'')&&!MEME_RUDE.test(m.title||'');
let MEME_POOL=[],MEME_SEEN=new Set(),MEME_LOAD=null;
function memeFetch(){
  return MEME_LOAD=MEME_LOAD||Promise.all(MEME_SUBS.map(s=>fetch(`https://meme-api.com/gimme/${s}/50`).then(r=>r.ok?r.json():{}).then(d=>d.memes||[]).catch(()=>[]))).then(a=>{
    const all=[...new Map(a.flat().filter(memeOK).map(m=>[m.url,{url:m.url,title:m.title,postLink:m.postLink,subreddit:m.subreddit,author:m.author}])).values()];
    MEME_POOL=mkR(rndSeed()).shuffle(all.filter(m=>!MEME_SEEN.has(m.url)));if(!MEME_POOL.length){MEME_SEEN.clear();MEME_POOL=mkR(rndSeed()).shuffle(all)}
  }).finally(()=>{MEME_LOAD=null});
}
async function memeNext(){
  const s=memeStore(),saved=()=>{const k=s.kept.filter(m=>!MEME_SEEN.has(m.url));const p=k.length?k:s.kept;return p.length?p[Math.floor(Math.random()*p.length)]:null};
  let m=null;
  if(s.only&&s.kept.length)m=saved();
  else{
    const take=()=>{while(MEME_POOL.length){const x=MEME_POOL.pop();if(!s.hidden.includes(x.url))return x}return null};
    m=take();if(!m){await memeFetch();m=take()}
    if(!m)m=saved();   // no internet: use the saved ones
  }
  if(m)MEME_SEEN.add(m.url);
  if(MEME_POOL.length)new Image().src=MEME_POOL[MEME_POOL.length-1].url;
  return m;
}
function memeSlide(h){
  h.classList.add('fill');
  h.innerHTML=`<div class="meme"><div class="memet"></div><div class="memeimg"></div><div class="row memebar"><a class="memesrc" target="_blank" rel="noopener noreferrer"></a><span class="sp"></span><label class="memeonly"><input type="checkbox"> Saved only</label><button class="btn alt memekeep"></button><button class="btn alt memehide" title="Never show this meme again">🚫 Hide</button><button class="btn memenew">Another meme</button></div></div>`;
  const box=$('.memeimg',h),only=$('.memeonly input',h);let cur=null,turn=0;
  const bar=()=>{const s=memeStore(),k=!!cur&&s.kept.some(m=>m.url===cur.url);$('.memekeep',h).textContent=k?'★ Saved':'☆ Save';$('.memekeep',h).disabled=$('.memehide',h).disabled=!cur;
    only.checked=s.only;$('.memeonly',h).hidden=!s.kept.length};
  const load=async(tries=0)=>{
    const t=++turn;cur=null;box.innerHTML='<p class="note">Loading a meme…</p>';$('.memet',h).textContent='';$('.memesrc',h).textContent='';bar();
    const m=await memeNext();if(t!==turn||!h.isConnected)return;
    if(!m){box.innerHTML='<p class="note">No meme could be loaded. Check the internet connection, then press “Another meme”.</p>';return}
    const im=new Image();im.alt=m.title;im.referrerPolicy='no-referrer';
    im.onload=()=>{if(t!==turn)return;cur=m;box.innerHTML='';box.appendChild(im);$('.memet',h).textContent=m.title;$('.memesrc',h).textContent=`r/${m.subreddit} · u/${m.author}`;$('.memesrc',h).href=m.postLink;bar()};
    im.onerror=()=>{if(t!==turn)return;if(tries<4)load(tries+1);else box.innerHTML='<p class="note">The picture could not be loaded. Press “Another meme”.</p>'};
    im.src=m.url;
  };
  $('.memenew',h).onclick=()=>load();
  $('.memekeep',h).onclick=()=>{const s=memeStore();if(s.kept.some(m=>m.url===cur.url)){s.kept=s.kept.filter(m=>m.url!==cur.url);if(!s.kept.length)s.only=false}else s.kept.push(cur);memeSave(s);bar()};
  $('.memehide',h).onclick=()=>{const s=memeStore();s.hidden.push(cur.url);s.kept=s.kept.filter(m=>m.url!==cur.url);if(!s.kept.length)s.only=false;memeSave(s);load()};
  only.onchange=()=>{const s=memeStore();s.only=only.checked;memeSave(s);load()};
  load();
}
