/* Shared helpers and SVG figure code (reused from the Year 7 site). */
/* MathQuest problem generators — Year 7 Angles / Year 10 Linear equations
   Every generator takes a seeded RNG `r` and returns a problem object:
   { year, level, kind, text, eq, svg, ans, unit, steps[], hint, L, R }            */

// ---------- RNG ----------
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function mkR(seed){
  const f=mulberry32(seed>>>0);
  return {f,
    int:(a,b)=>a+Math.floor(f()*(b-a+1)),
    pick:a=>a[Math.floor(f()*a.length)],
    chance:p=>f()<p,
    sign:()=>f()<.5?1:-1,
    shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(f()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}};
}

// ---------- maths formatting ----------
const M=n=>n<0?'−'+(-n):''+n;                       // number with real minus sign
function lin(a,b,v='x'){                              // a·v + b  →  "3x − 5"
  let s='';
  if(a!==0) s+=(a===1?'':a===-1?'−':M(a))+v;
  if(b!==0) s+= s===''?M(b):(b>0?' + '+b:' − '+(-b));
  return s===''?'0':s;
}
const fr=(n,d)=>`<span class="frac"><span>${n}</span><span>${d}</span></span>`;
const brk=(k,inner)=>(k===1?'':k===-1?'−':M(k))+'('+inner+')';
function fmtAns(v){
  if(Number.isInteger(v)) return M(v);
  const t=Math.round(v*2);
  if(Math.abs(v*2-t)<1e-9){const neg=v<0,n=Math.abs(t);return (neg?'−':'')+(n/2)+' (= '+(neg?'−':'')+n+'/2)';}
  return M(Math.round(v*1000)/1000);
}
function parseNum(s){
  s=String(s).trim().replace(/−/g,'-').replace(',','.').replace(/^[a-z]\s*=\s*/i,'').replace(/°/g,'').replace(/\s+/g,'');
  if(/^-?\d+(\.\d+)?\/-?\d+(\.\d+)?$/.test(s)){const[a,b]=s.split('/');return +b===0?null:+a/+b}
  if(s===''||isNaN(Number(s)))return null;
  return Number(s);
}
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const lcm=(a,b)=>a*b/gcd(a,b);

// =====================================================================
//  SVG helpers (Year 7)
// =====================================================================
const rad=d=>d*Math.PI/180;
const P=(cx,cy,r,deg)=>[cx+r*Math.cos(rad(deg)),cy-r*Math.sin(rad(deg))];
const f1=n=>n.toFixed(1);
function arcPath(cx,cy,r,a0,a1){
  const [x0,y0]=P(cx,cy,r,a0),[x1,y1]=P(cx,cy,r,a1);
  return `M${f1(x0)},${f1(y0)} A${r},${r} 0 ${(a1-a0)>180?1:0} 0 ${f1(x1)},${f1(y1)}`;
}
// pad adds a margin around the drawing so labels can sit outside the lines when a sector/angle is too narrow
const svgWrap=(inner,w=260,h=180,pad=0,cls='')=>`<svg viewBox="${-pad} ${-pad*.6} ${w+2*pad} ${h+pad*1.2}" class="svg-fig ${cls}" xmlns="http://www.w3.org/2000/svg" font-family="Arial,Helvetica,sans-serif">${inner}</svg>`;
// text with a white halo so it stays readable if it ever touches a line
const txt=(x,y,t,unk,fs,anchor='middle')=>`<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" dominant-baseline="central" font-size="${fs||(unk?18:15)}" font-weight="${unk?700:600}" fill="${unk?'#d9480f':'#1f2937'}" stroke="#fff" stroke-width="5" stroke-linejoin="round" paint-order="stroke">${t}</text>`;
const COL_ARC='#4f46e5', COL_UNK='#d9480f';
const plainLen=t=>String(t).replace(/<[^>]+>/g,'').length;
const boxW=(t,fs)=>plainLen(t)*fs*.62+6;        // estimated pixel width of a label

// bounding box tracker: the viewBox is fitted to the drawing PLUS its label boxes, so nothing is ever clipped
function Ext(){const e={x0:1e9,y0:1e9,x1:-1e9,y1:-1e9};e.add=(x,y,w=0,h=0)=>{e.x0=Math.min(e.x0,x-w/2);e.x1=Math.max(e.x1,x+w/2);e.y0=Math.min(e.y0,y-h/2);e.y1=Math.max(e.y1,y+h/2)};return e}
const svgFit=(inner,e,cls='',m=8)=>`<svg viewBox="${f1(e.x0-m)} ${f1(e.y0-m)} ${f1(e.x1-e.x0+2*m)} ${f1(e.y1-e.y0+2*m)}" class="svg-fig ${cls}" xmlns="http://www.w3.org/2000/svg" font-family="Arial,Helvetica,sans-serif">${inner}</svg>`;

function raysDiagram({cx,cy,R,start=0,parts,labels,unk=[],line=false,lr=60,ar=20}){
  const K=1.25;cx*=K;cy*=K;R*=K;lr*=K;ar*=K*.9;            // draw the geometry larger relative to the text
  const un=Array.isArray(unk)?unk:[unk],E=Ext();
  let s='';
  const b=[start]; parts.forEach(p=>b.push(b[b.length-1]+p));
  if(line){s+=`<line x1="${cx-R-8}" y1="${cy}" x2="${cx+R+8}" y2="${cy}" stroke="#111827" stroke-width="2.6"/>`;E.add(cx-R-8,cy);E.add(cx+R+8,cy)}
  b.forEach((a,i)=>{
    if(line&&(i===0||i===b.length-1))return;
    if(i===b.length-1&&Math.abs(b[b.length-1]-b[0]-360)<1e-6)return;
    const [x,y]=P(cx,cy,R,a);E.add(x,y);
    s+=`<line x1="${cx}" y1="${cy}" x2="${f1(x)}" y2="${f1(y)}" stroke="#111827" stroke-width="2.6"/>`;
  });
  if(!line&&Math.abs(b[b.length-1]-b[0]-360)<1e-6){for(let a=0;a<360;a+=45)E.add(...P(cx,cy,R,a))}
  parts.forEach((p,i)=>{
    const isU=un.includes(i);
    s+=`<path d="${arcPath(cx,cy,ar,b[i],b[i+1])}" fill="none" stroke="${isU?COL_UNK:COL_ARC}" stroke-width="2.6"/>`;
    const lab=labels[i];if(lab===''||lab==null)return;
    const fs=isU?19:16,wpx=boxW(lab,fs),hpx=fs+4,m=(b[i]+b[i+1])/2;
    // find a radius at which the label box clears both boundary rays; if impossible, put it outside the lines
    let rr=Math.max(lr,ar+hpx);
    if(p<180){
      const proj=Math.max(...[b[i],b[i+1]].map(a=>Math.abs(Math.sin(rad(a)))*wpx/2+Math.abs(Math.cos(rad(a)))*hpx/2));
      rr=Math.max(rr,(proj+6)/Math.sin(rad(p/2)));
    }
    if(rr>R-8)rr=R+14+Math.abs(Math.cos(rad(m)))*wpx/2+Math.abs(Math.sin(rad(m)))*hpx/2;
    const [lx,ly]=P(cx,cy,rr,m);
    s+=txt(lx,ly,lab,isU,fs);E.add(lx,ly,wpx,hpx);
  });
  s+=`<circle cx="${cx}" cy="${cy}" r="3.5" fill="#111827"/>`;E.add(cx,cy);
  return svgFit(s,E);
}
// polygon with exact interior angles (angles in degrees, counter-clockwise from A→B)
function polyFromAngles(ang,r){
  const n=ang.length;
  const d=[0]; for(let i=1;i<n;i++) d.push(d[i-1]+180-ang[i]);       // edge directions
  const dv=i=>[Math.cos(rad(d[i])),Math.sin(rad(d[i]))];
  const tryLens=l2=>{
    const L=new Array(n).fill(0); L[0]=100;
    let known=[0,0]; known[0]+=L[0]*dv(0)[0]; known[1]+=L[0]*dv(0)[1];
    let u1,u2;
    if(n===3){u1=1;u2=2}else{L[1]=l2;known[0]+=L[1]*dv(1)[0];known[1]+=L[1]*dv(1)[1];u1=2;u2=3}
    const a=dv(u1),b=dv(u2), det=a[0]*b[1]-a[1]*b[0];
    if(Math.abs(det)<1e-6)return null;
    const l1=(-known[0]*b[1]+known[1]*b[0])/det, l2b=(-a[0]*known[1]+a[1]*known[0])/det;
    if(l1<22||l2b<22)return null;
    L[u1]=l1;L[u2]=l2b;return L;
  };
  let L=null;
  if(n===3)L=tryLens();
  else{ // quadrilateral: pick the free side length that gives the most 'balanced' shape
    let best=-1;
    for(let l2=40;l2<=170;l2+=5){const c=tryLens(l2);if(!c)continue;const sc=Math.min(...c)/Math.max(...c);if(sc>best){best=sc;L=c}}
  }
  if(!L)return null;
  const pts=[[0,0]];
  for(let i=0;i<n-1;i++){const v=dv(i);pts.push([pts[i][0]+L[i]*v[0],pts[i][1]+L[i]*v[1]])}
  return pts;
}
function polyDiagram(ang,labels,unk,{equal=[],names=true,r,w=330,h=225}={}){
  const raw=polyFromAngles(ang,r)||[[0,0],[200,0],[170,90],[30,90]].slice(0,ang.length);
  const xs=raw.map(p=>p[0]),ys=raw.map(p=>p[1]);
  const minx=Math.min(...xs),maxx=Math.max(...xs),miny=Math.min(...ys),maxy=Math.max(...ys);
  const pad=10, sc=Math.min((w-2*pad)/(maxx-minx||1),(h-2*pad)/(maxy-miny||1));
  const ox=(w-(maxx-minx)*sc)/2, oy=(h-(maxy-miny)*sc)/2;
  const pts=raw.map(p=>[ox+(p[0]-minx)*sc, h-(oy+(p[1]-miny)*sc)]);
  const n=pts.length, un=Array.isArray(unk)?unk:[unk],E=Ext();
  pts.forEach(p=>E.add(p[0],p[1]));
  let s=`<polygon points="${pts.map(p=>f1(p[0])+','+f1(p[1])).join(' ')}" fill="#eef2ff" stroke="#111827" stroke-width="2.6" stroke-linejoin="round"/>`;
  equal.forEach((ei,k)=>{
    const a=pts[ei],b=pts[(ei+1)%n],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;
    const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),nx=-dy/len*7,ny=dx/len*7;
    s+=`<line x1="${f1(mx-nx)}" y1="${f1(my-ny)}" x2="${f1(mx+nx)}" y2="${f1(my+ny)}" stroke="#111827" stroke-width="2.8"/>`;
  });
  const inPoly=(x,y)=>{let c=false;for(let i=0,j=n-1;i<n;j=i++){const [xi,yi]=pts[i],[xj,yj]=pts[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c};
  const dSeg=(x,y,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(x-(a[0]+t*dx),y-(a[1]+t*dy))};
  const placed=[],hit=(x,y,wp,hp)=>placed.some(q=>Math.abs(q[0]-x)<(q[2]+wp)/2+3&&Math.abs(q[1]-y)<(q[3]+hp)/2+2);
  pts.forEach((v,i)=>{
    const pr=pts[(i+n-1)%n],nx=pts[(i+1)%n];
    const l1=Math.hypot(pr[0]-v[0],pr[1]-v[1]),l2=Math.hypot(nx[0]-v[0],nx[1]-v[1]);
    const e1=[(pr[0]-v[0])/l1,(pr[1]-v[1])/l1],e2=[(nx[0]-v[0])/l2,(nx[1]-v[1])/l2];
    let ux=e1[0]+e2[0],uy=e1[1]+e2[1];const ul=Math.hypot(ux,uy)||1;ux/=ul;uy/=ul;   // inward bisector
    const lab=labels[i];let inside=true;
    if(lab!==''&&lab!=null){
      const fs=un.includes(i)?19:16,wpx=boxW(lab,fs),hpx=fs+4;
      const projE=e=>Math.abs(e[1])*wpx/2+Math.abs(e[0])*hpx/2;           // box half-extent along that edge's normal
      const need=(Math.max(projE(e1),projE(e2))+6)/Math.sin(rad(ang[i]/2));
      const d=Math.max(28,need),cx=v[0]+ux*d,cy=v[1]+uy*d;
      const clear=pts.every((p,k)=>dSeg(cx,cy,p,pts[(k+1)%n])>=hpx/2+4);
      let X,Y;
      if(d<=.75*Math.min(l1,l2)&&inPoly(cx,cy)&&clear&&!hit(cx,cy,wpx,hpx)){X=cx;Y=cy}
      else{inside=false;const o=14+Math.abs(ux)*wpx/2+Math.abs(uy)*hpx/2;X=v[0]-ux*o;Y=v[1]-uy*o}
      s+=txt(X,Y,lab,un.includes(i),fs);placed.push([X,Y,wpx,hpx]);E.add(X,Y,wpx,hpx);
    }
    if(names&&inside){const lx=v[0]-ux*17,ly=v[1]-uy*17;s+=`<text x="${f1(lx)}" y="${f1(ly)}" text-anchor="middle" dominant-baseline="central" font-size="14" fill="#9ca3af">${'ABCD'[i]}</text>`;E.add(lx,ly,14,14)}
  });
  return svgFit(s,E);
}

const Qn=o=>Object.assign({label:'Answer =',unit:'',tol:1e-6,steps:[],hint:''},o);
const rd=(v,dp=6)=>Math.round(v*10**dp)/10**dp;
const sg=n=>n<0?'('+M(n)+')':''+n;
const fd=v=>M(rd(v,4));                       // decimal for display
const pr=n=>n.toLocaleString('en-GB').replace(/,/g,' ');
const FN='Enter a whole number, decimal or fraction (e.g. 5/6).';
function Fr(n,d){const g=gcd(n,d),a=[n/g,d/g];a.join=function(s){return this[1]===1?String(this[0]):Array.prototype.join.call(this,s)};return a}
const terminating=d=>{while(d%2===0)d/=2;while(d%5===0)d/=5;return d===1};
function fracAns(n,d,extra={}){
  const [a,b]=Fr(n,d),t=terminating(b);
  return Object.assign({ans:a/b,ansStr:b===1?String(a):`${a}/${b}`+(t?'':` (≈ ${rd(a/b,3)})`),tol:t?1e-6:.004,note:FN,label:'Answer ='},extra);
}
const mixed=(w,n,d)=>`${w} ${fr(n,d)}`;
const ord=n=>n+(n%100>=11&&n%100<=13?'th':({1:'st',2:'nd',3:'rd'}[n%10]||'th'));
const money=v=>(Math.round(v*100)/100).toFixed(2);

// ---------- extra SVG helpers ----------
function gridSvg({R=6,pts=[],polys=[],vlines=[],fns=[]}){
  const u=120/R,o=130,X=x=>o+x*u,Y=y=>o-y*u;let s='';
  for(let i=-R;i<=R;i++){
    s+=`<line x1="${X(i)}" y1="${Y(-R)}" x2="${X(i)}" y2="${Y(R)}" stroke="${i===0?'#111827':'#d1d5db'}" stroke-width="${i===0?1.6:.7}"/><line x1="${X(-R)}" y1="${Y(i)}" x2="${X(R)}" y2="${Y(i)}" stroke="${i===0?'#111827':'#d1d5db'}" stroke-width="${i===0?1.6:.7}"/>`;
    if(i!==0&&i%2===0)s+=`<text x="${X(i)}" y="${Y(0)+11}" font-size="12" text-anchor="middle" fill="#4b5563" stroke="#fff" stroke-width="4" stroke-linejoin="round" paint-order="stroke">${i}</text><text x="${X(0)-7}" y="${Y(i)+4}" font-size="12" text-anchor="end" fill="#4b5563" stroke="#fff" stroke-width="4" stroke-linejoin="round" paint-order="stroke">${i}</text>`;
  }
  vlines.forEach(v=>{s+=`<line x1="${X(v.x)}" y1="${Y(-R)}" x2="${X(v.x)}" y2="${Y(R)}" stroke="#d9480f" stroke-width="2" stroke-dasharray="5 3"/><text x="${X(v.x)+3}" y="${Y(R)+10}" font-size="13" font-weight="700" fill="#d9480f" stroke="#fff" stroke-width="4" stroke-linejoin="round" paint-order="stroke">${v.label||''}</text>`});
  fns.forEach(f=>{const a=[];for(let x=-R;x<=R;x+=.25){const y=f.m*x+f.c;if(Math.abs(y)<=R)a.push(`${X(x)},${Y(y)}`)}s+=`<polyline points="${a.join(' ')}" fill="none" stroke="${f.color||'#4f46e5'}" stroke-width="2.4"/>`});
  polys.forEach(p=>{s+=`<polygon points="${p.pts.map(q=>X(q[0])+','+Y(q[1])).join(' ')}" fill="${p.color||'#6366f1'}" fill-opacity=".25" stroke="${p.color||'#4f46e5'}" stroke-width="2"/>`;
    if(p.names)p.pts.forEach((q,i)=>{s+=`<text x="${X(q[0])+4}" y="${Y(q[1])-5}" font-size="14" font-weight="700" fill="${p.color||'#4f46e5'}" stroke="#fff" stroke-width="4" stroke-linejoin="round" paint-order="stroke">${p.names[i]}</text>`})});
  pts.forEach(p=>{s+=`<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="4.5" fill="${p.color||'#d9480f'}"/><text x="${X(p.x)+7}" y="${Y(p.y)-6}" font-size="15" font-weight="700" fill="${p.color||'#d9480f'}" stroke="#fff" stroke-width="4" stroke-linejoin="round" paint-order="stroke">${p.label||''}</text>`});
  return svgWrap(s,260,260,14,'sq');
}
function barSvg(labels,vals,{max,unit='',w=340,h=220,color='#6366f1'}={}){
  const m=max||Math.ceil(Math.max(...vals)/5)*5||5,bx=40,bw=(w-bx-10)/vals.length;let s='';
  const step=m<=10?1:m<=20?2:m<=50?5:10;
  for(let v=0;v<=m;v+=step){const y=h-28-(v/m)*(h-50);s+=`<line x1="${bx}" y1="${y}" x2="${w-6}" y2="${y}" stroke="#e5e7eb"/><text x="${bx-4}" y="${y+3}" font-size="12" text-anchor="end" fill="#4b5563">${v}</text>`}
  vals.forEach((v,i)=>{const bh=(v/m)*(h-50),x=bx+i*bw+bw*.15;s+=`<rect x="${x}" y="${h-28-bh}" width="${bw*.7}" height="${bh}" fill="${color}"/><text x="${x+bw*.35}" y="${h-15}" font-size="13" font-weight="600" text-anchor="middle" fill="#1f2937">${labels[i]}</text>`});
  s+=`<line x1="${bx}" y1="10" x2="${bx}" y2="${h-28}" stroke="#111827" stroke-width="1.5"/><line x1="${bx}" y1="${h-28}" x2="${w-6}" y2="${h-28}" stroke="#111827" stroke-width="1.5"/>`;
  return svgWrap(s,w,h);
}
function polySymSvg(n,lines=true){
  const cx=130,cy=90,R=74,pts=[];for(let i=0;i<n;i++)pts.push(P(cx,cy,R,90+i*360/n));
  let s=`<polygon points="${pts.map(p=>f1(p[0])+','+f1(p[1])).join(' ')}" fill="#eef2ff" stroke="#111827" stroke-width="2.4"/>`;
  if(lines)for(let k=0;k<n;k++){const a=P(cx,cy,R+10,90+k*180/n),b=P(cx,cy,R+10,270+k*180/n);s+=`<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="#d9480f" stroke-width="1.4" stroke-dasharray="5 3"/>`}
  return svgWrap(s,260,180,20);
}
function rectSvg(w,h,u='cm',labels=true){
  const sc=Math.min(190/w,110/h),W=w*sc,H=h*sc,x=(260-W)/2,y=(150-H)/2+5;
  return svgWrap(`<rect x="${x}" y="${y}" width="${W}" height="${H}" fill="#eef2ff" stroke="#111827" stroke-width="2.4"/>`+txt(x+W/2,y+H+20,w+' '+u,false,16)+txt(x-10,y+H/2,h+' '+u,false,16,'end'),260,170,50);
}
function triSvg(b,h,u='cm'){
  const sc=Math.min(190/b,110/h),W=b*sc,H=h*sc,x=(260-W)/2,y=(150-H)/2+5,ax=x+W*.3;
  return svgWrap(`<polygon points="${x},${y+H} ${x+W},${y+H} ${ax},${y}" fill="#eef2ff" stroke="#111827" stroke-width="2.4"/><line x1="${ax}" y1="${y}" x2="${ax}" y2="${y+H}" stroke="#d9480f" stroke-dasharray="4 3" stroke-width="1.6"/>`+txt(x+W/2,y+H+20,b+' '+u,false,16)+txt(ax+9,y+H/2,h+' '+u,false,16,'start'),260,170,50);
}
function lShapeSvg(a,b,c,d,u='cm'){            // outer a(w) x b(h), top-right corner cut c(w) x d(h)
  const sc=Math.min(170/a,110/b),X0=45,Y0=20,A=a*sc,B=b*sc,C=c*sc,D=d*sc;
  const pts=[[X0,Y0+D],[X0+A-C,Y0+D],[X0+A-C,Y0],[X0+A,Y0],[X0+A,Y0+B],[X0,Y0+B]];  // simplified outline
  const p=[[X0,Y0],[X0+A-C,Y0],[X0+A-C,Y0+D],[X0+A,Y0+D],[X0+A,Y0+B],[X0,Y0+B]];
  return svgWrap(`<polygon points="${p.map(q=>q.join(',')).join(' ')}" fill="#eef2ff" stroke="#111827" stroke-width="2.4"/>`+txt(X0+A/2,Y0+B+20,a+' '+u,false,16)+txt(X0-10,Y0+B/2,b+' '+u,false,16,'end')+txt(X0+A-C/2,Y0+D-14,c+' '+u,false,16)+txt(X0+A-C-9,Y0+D/2,d+' '+u,false,16,'end'),260,175,50);
}
function bagSvg(c){
  const cols={red:'#dc2626',blue:'#2563eb',green:'#16a34a',yellow:'#eab308'};let items=[];
  Object.entries(c).forEach(([k,n])=>{for(let i=0;i<n;i++)items.push(cols[k])});
  const per=Math.min(items.length,8);let s='<rect x="55" y="20" width="150" height="130" rx="22" fill="#fef3c7" stroke="#b45309" stroke-width="3"/>';
  items.forEach((col,i)=>{const y=48+Math.floor(i/per)*30,x=per>1?78+(i%per)*(104/(per-1)):130;s+=`<circle cx="${x}" cy="${y}" r="11" fill="${col}" stroke="#fff" stroke-width="2"/>`});
  return svgWrap(s,260,170);
}
function lineChartSvg(labels,vals,{max,w=340,h=220}={}){
  const m=max||Math.ceil(Math.max(...vals)/5)*5,bx=40,dx=(w-bx-24)/(vals.length-1);let s='';
  const step=m<=10?1:m<=20?2:m<=50?5:10;
  for(let v=0;v<=m;v+=step){const y=h-28-(v/m)*(h-50);s+=`<line x1="${bx}" y1="${y}" x2="${w-6}" y2="${y}" stroke="#e5e7eb"/><text x="${bx-4}" y="${y+3}" font-size="12" text-anchor="end" fill="#4b5563">${v}</text>`}
  const pts=vals.map((v,i)=>[bx+10+i*dx,h-28-(v/m)*(h-50)]);
  s+=`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#4f46e5" stroke-width="2.6"/>`;
  pts.forEach((p,i)=>{s+=`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#d9480f"/><text x="${p[0]}" y="${h-12}" font-size="13" font-weight="600" text-anchor="middle">${labels[i]}</text>`});
  s+=`<line x1="${bx}" y1="10" x2="${bx}" y2="${h-28}" stroke="#111827" stroke-width="1.5"/><line x1="${bx}" y1="${h-28}" x2="${w-6}" y2="${h-28}" stroke="#111827" stroke-width="1.5"/>`;
  return svgWrap(s,w,h);
}


// ---------- additions ----------
function nz(r,a,b){let v;do{v=r.int(a,b)}while(v===0);return v}
const roundHalfUp=(v,step)=>rd(Math.floor(v/step+.5+1e-9)*step,6);
// plain decimal text for any number (never "6.1e-7"), with a real minus sign
const fmtNum=x=>{let s=String(rd(x,10));if(/e/.test(s))s=x.toFixed(12).replace(/0+$/,'').replace(/\.$/,'');return s.replace(/^-/,'−')};
const cx=(c,v)=>c===1?v:c===-1?'−'+v:M(c)+v;                    // coefficient + letter
const art=w=>(/^[aeiou]/i.test(w)?'an ':'a ')+w;
const pick=(r,a)=>a[Math.floor(r.f()*a.length)];
// multiple-choice problem: ans is the index of the correct option
function MC(text,options,correct,steps,extra={}){
  const order=extra.fixed?options.map((_,i)=>i):null;
  return Object.assign({text,choices:options,ans:correct,steps:steps||[],hint:'',mc:true,label:'',unit:'',tol:0},extra);
}
