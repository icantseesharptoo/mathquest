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
// ---------- number helpers for Year 7 ----------
function partition(r,n,T,min,max,step=1){
  const t=T/step,mn=Math.ceil(min/step),mx=Math.floor(max/step);
  for(let k=0;k<2000;k++){
    const a=[];let rem=t,ok=true;
    for(let i=0;i<n-1;i++){
      const hi=Math.min(mx,rem-mn*(n-1-i)),lo=Math.max(mn,rem-mx*(n-1-i));
      if(lo>hi){ok=false;break}
      const v=r.int(lo,hi);a.push(v);rem-=v;
    }
    if(ok&&rem>=mn&&rem<=mx){a.push(rem);return a.map(v=>v*step)}
  }
  return null;
}
// algebraic angles: p_i x + c_i  that sum to T
function algSet(r,n,T,{minA=25,maxA=150,pMax=3}={}){
  for(let t=0;t<3000;t++){
    const x=r.int(8,35),p=[],c=[];
    for(let i=0;i<n;i++)p.push(r.int(1,pMax));
    const sp=p.reduce((a,b)=>a+b,0); if(sp<3)continue;
    let rem=T-sp*x;
    for(let i=0;i<n-1;i++){const ci=r.int(-20,30);c.push(ci);rem-=ci}
    c.push(rem);
    const vals=p.map((pi,i)=>pi*x+c[i]);
    if(vals.every(v=>v>=minA&&v<=maxA)&&c.every(ci=>Math.abs(ci)<=45)&&c.some(ci=>ci!==0))return {x,p,c,vals};
  }
  return null;
}
const algLabel=(p,c)=>c===0?lin(p,0)+'°':'('+lin(p,c)+')°';
function algSteps(al,T,fact){
  const ex=al.p.map((p,i)=>'('+lin(p,al.c[i])+')').join(' + ');
  const sp=al.p.reduce((a,b)=>a+b,0),sc=al.c.reduce((a,b)=>a+b,0);
  const st=[fact,`${ex} = ${T}`,`Collect like terms: ${lin(sp,sc)} = ${T}`];
  if(sc!==0)st.push(`${sp}x = ${T} ${sc>0?'−':'+'} ${Math.abs(sc)} = ${T-sc}`);
  st.push(`x = ${T-sc} ÷ ${sp} = <b>${al.x}</b>`);
  return st;
}
const fx='<b>x</b>';

// =====================================================================
//  YEAR 7 — Angles
// =====================================================================
function sumProblem(kind,r,{n,T,min,max,step,level}){
  const vals=partition(r,n,T,min,max,step);
  const unk=r.int(0,n-1), ans=vals[unk];
  const labels=vals.map((v,i)=>i===unk?'x°':v+'°');
  const known=vals.filter((v,i)=>i!==unk), S=known.reduce((a,b)=>a+b,0);
  const fact={line:'Angles on a straight line add up to <b>180°</b>.',point:'Angles around a point add up to <b>360°</b>.',
              tri:'Angles in a triangle add up to <b>180°</b>.',quad:'Angles in a quadrilateral add up to <b>360°</b>.'}[kind];
  let svg;
  if(kind==='line') svg=raysDiagram({cx:130,cy:150,R:112,parts:vals,labels,unk,line:true,lr:64});
  else if(kind==='point') svg=raysDiagram({cx:130,cy:92,R:82,start:r.int(0,359),parts:vals,labels,unk,lr:50});
  else svg=polyDiagram(vals,labels,unk,{r});
  const order=labels.map(l=>l==='x°'?'x':l.replace('°','')).join(' + ');
  const steps=[fact,`${order} = ${T}`];
  if(n>2) steps.push(`x + ${S} = ${T}`);
  steps.push(`x = ${T} − ${S} = <b>${ans}</b>`);
  return {year:7,level,kind,text:'Find the size of angle <b>x</b>.',svg,ans,unit:'°',steps,hint:fact,note:kind==='tri'||kind==='quad'?'Diagram not drawn accurately.':''};
}
function algSumProblem(kind,r,n,T,level){
  const al=algSet(r,n,T,{minA:kind==='quad'?45:25,maxA:kind==='point'?200:150,pMax:3}); if(!al)return null;
  const labels=al.p.map((p,i)=>algLabel(p,al.c[i]));
  let svg;
  if(kind==='line') svg=raysDiagram({cx:130,cy:152,R:114,parts:al.vals,labels,unk:[],line:true,lr:70});
  else if(kind==='point') svg=raysDiagram({cx:130,cy:92,R:84,start:r.int(0,359),parts:al.vals,labels,unk:[],lr:52});
  else svg=polyDiagram(al.vals,labels,[],{r});
  const fact={line:'Angles on a straight line add up to <b>180°</b>.',point:'Angles around a point add up to <b>360°</b>.',
              tri:'Angles in a triangle add up to <b>180°</b>.',quad:'Angles in a quadrilateral add up to <b>360°</b>.'}[kind];
  return {year:7,level,kind,text:'Write an equation and find the value of <b>x</b>.',svg,ans:al.x,unit:'',label:'x =',steps:algSteps(al,T,fact),hint:fact+' Form an equation, then collect the x-terms.',note:kind==='tri'||kind==='quad'?'Diagram not drawn accurately.':''};
}
function voProblem(r,mode,level){
  const step=level==='easy'?5:1;
  const a=r.int(35/step|0,145/step|0)*step, parts=[a,180-a,a,180-a];
  const g=r.int(0,3), th=r.int(0,50);
  let u,ans,steps;
  if(mode==='opp'){u=(g+2)%4;ans=a;steps=['Vertically opposite angles are <b>equal</b>.',`x = <b>${a}</b>`]}
  else{u=(g+1+2*r.int(0,1))%4;ans=180-a;steps=['Angles on a straight line add up to <b>180°</b>.',`x + ${a} = 180`,`x = 180 − ${a} = <b>${ans}</b>`]}
  const labels=parts.map((p,i)=>i===g?a+'°':i===u?'x°':'');
  const svg=raysDiagram({cx:130,cy:90,R:92,start:th,parts,labels,unk:[u],lr:50,ar:22});
  return {year:7,level,kind:'vo',text:'Two straight lines cross. Find the size of angle <b>x</b>.',svg,ans,unit:'°',steps,hint:mode==='opp'?'Vertically opposite angles are equal.':'Angles on a straight line add up to 180°.'};
}
function algVoProblem(r,level){
  if(r.chance(.5)){ // vertically opposite expressions equal
    for(let t=0;t<2000;t++){
      const x=r.int(8,30),p1=r.int(2,5),p2=r.int(1,p1-1),c1=r.int(-30,30),A=p1*x+c1,c2=A-p2*x;
      if(A<35||A>145||Math.abs(c2)>45||(c1===0&&c2===0))continue;
      const th=r.int(0,50),parts=[A,180-A,A,180-A];
      const labels=[algLabel(p1,c1),'',algLabel(p2,c2),''];
      const svg=raysDiagram({cx:130,cy:90,R:94,start:th,parts,labels,unk:[],lr:56,ar:22});
      return {year:7,level,kind:'vo',text:'Two straight lines cross. Write an equation and find <b>x</b>.',svg,ans:x,unit:'',label:'x =',
        steps:['Vertically opposite angles are <b>equal</b>.',`${lin(p1,c1)} = ${lin(p2,c2)}`,`${lin(p1-p2,0)} = ${c2-c1}`,`x = ${c2-c1} ÷ ${p1-p2} = <b>${x}</b>`],hint:'Vertically opposite angles are equal, so set the two expressions equal.'};
    }
  }
  const al=algSet(r,2,180,{minA:35,maxA:145,pMax:3}); if(!al)return algVoProblem(r,level);
  const th=r.int(0,50),A=al.vals[0],parts=[A,180-A,A,180-A];
  const labels=[algLabel(al.p[0],al.c[0]),algLabel(al.p[1],al.c[1]),'',''];
  const svg=raysDiagram({cx:130,cy:90,R:94,start:th,parts,labels,unk:[],lr:58,ar:22});
  return {year:7,level,kind:'vo',text:'Two straight lines cross. Write an equation and find <b>x</b>.',svg,ans:al.x,unit:'',label:'x =',
    steps:algSteps(al,180,'The two angles are next to each other on a straight line, so they add up to <b>180°</b>.'),hint:'Adjacent angles on a straight line add up to 180°.'};
}
function triIsoProblem(r,level){
  const base=r.int(35,75),apex=180-2*base, A=base,B=base,C=apex;
  const givenApex=r.chance(.5);
  const labels=givenApex?['x°','',apex+'°']:[base+'°','','x°'];
  const un=givenApex?[0]:[2];
  const svg=polyDiagram([A,B,C],labels,un,{equal:[1,2]});
  const steps=givenApex?['The triangle is <b>isosceles</b>: the two base angles are equal.',`2x + ${apex} = 180`,`2x = 180 − ${apex} = ${180-apex}`,`x = ${180-apex} ÷ 2 = <b>${base}</b>`]
                       :['The triangle is <b>isosceles</b>: the two base angles are equal (both '+base+'°).',`x + ${base} + ${base} = 180`,`x = 180 − ${2*base} = <b>${apex}</b>`];
  return {year:7,level,kind:'tri',text:'This is an isosceles triangle (the dashes show equal sides). Find <b>x</b>.',svg,ans:givenApex?base:apex,unit:'°',steps,hint:'Equal sides mean equal base angles. Angles in a triangle add up to 180°.',note:'Diagram not drawn accurately.'};
}
function quadEqProblem(r,level){
  for(let t=0;t<500;t++){
    const x=r.int(50,120),a=r.int(50,150),b=360-2*x-a;
    if(b<50||b>150)continue;
    const order=r.shuffle([a+'°',b+'°','x°','x°']), ang=order.map(l=>l==='x°'?x:parseInt(l));
    const un=order.map((l,i)=>l==='x°'?i:-1).filter(i=>i>=0);
    const svg=polyDiagram(ang,order,un,{r});
    return {year:7,level,kind:'quad',text:'The two angles marked <b>x</b> are equal. Find <b>x</b>.',svg,ans:x,unit:'°',
      steps:['Angles in a quadrilateral add up to <b>360°</b>.',`x + x + ${a} + ${b} = 360`,`2x = 360 − ${a+b} = ${360-a-b}`,`x = ${360-a-b} ÷ 2 = <b>${x}</b>`],hint:'Angles in a quadrilateral add up to 360°. The two x angles are equal, so 2x.',note:'Diagram not drawn accurately.'};
  }
}

const Y7={
  easy:[
    r=>sumProblem('line',r,{n:2,T:180,min:20,max:160,step:5,level:'easy'}),
    r=>sumProblem('point',r,{n:3,T:360,min:40,max:180,step:5,level:'easy'}),
    r=>voProblem(r,'opp','easy'),
    r=>sumProblem('tri',r,{n:3,T:180,min:30,max:110,step:5,level:'easy'}),
    r=>sumProblem('quad',r,{n:4,T:360,min:55,max:140,step:5,level:'easy'}),
  ],
  medium:[
    r=>sumProblem('line',r,{n:3,T:180,min:20,max:120,step:1,level:'medium'}),
    r=>sumProblem('point',r,{n:4,T:360,min:35,max:150,step:1,level:'medium'}),
    r=>voProblem(r,'adj','medium'),
    r=>triIsoProblem(r,'medium'),
    r=>quadEqProblem(r,'medium'),
    r=>sumProblem('tri',r,{n:3,T:180,min:23,max:120,step:1,level:'medium'}),
  ],
  hard:[
    r=>algSumProblem('line',r,2+r.int(0,1),180,'hard'),
    r=>algSumProblem('point',r,3,360,'hard'),
    r=>algVoProblem(r,'hard'),
    r=>algSumProblem('tri',r,3,180,'hard'),
    r=>algSumProblem('quad',r,4,360,'hard'),
  ]
};

// =====================================================================
//  YEAR 10 — Solving linear equations
// =====================================================================
const eqS=(l,rr)=>`${l} = ${rr}`;
function addTerm(b){return b>0?`+ ${b}`:`− ${-b}`}
function nz(r,a,b){let v;do{v=r.int(a,b)}while(v===0);return v}

const Y10={
 easy:[
  r=>{const x=nz(r,-9,15),a=nz(r,-12,12);const b=x+a;
    return {eq:eqS(lin(1,a),M(b)),ans:x,L:v=>v+a,R:()=>b,
      steps:[`Undo the ${a>0?'+':'−'}${Math.abs(a)} by doing the <b>opposite</b> to both sides`,`x = ${M(b)} ${a>0?'−':'+'} ${Math.abs(a)}`,`x = <b>${M(x)}</b>`],hint:'Do the opposite operation to both sides.'}},
  r=>{const x=nz(r,-8,12),a=r.int(2,9);const b=a*x;
    return {eq:eqS(lin(a,0),M(b)),ans:x,L:v=>a*v,R:()=>b,
      steps:[`${a}x means ${a} × x. Do the opposite: divide both sides by ${a}`,`x = ${M(b)} ÷ ${a}`,`x = <b>${M(x)}</b>`],hint:'Divide both sides by the number in front of x.'}},
  r=>{const a=r.int(2,9),b=nz(r,-6,9),x=a*b;
    return {eq:eqS(fr('x',a),M(b)),ans:x,L:v=>v/a,R:()=>b,
      steps:[`x is divided by ${a}. Do the opposite: multiply both sides by ${a}`,`x = ${M(b)} × ${a}`,`x = <b>${M(x)}</b>`],hint:'Multiply both sides by the denominator.'}},
  r=>{const a=r.int(2,9),x=nz(r,-8,12),b=nz(r,-15,15),c=a*x+b;
    return {eq:eqS(lin(a,b),M(c)),ans:x,L:v=>a*v+b,R:()=>c,
      steps:[`Step 1: ${b>0?'subtract':'add'} ${Math.abs(b)} on both sides`,`${a}x = ${M(c)} ${b>0?'−':'+'} ${Math.abs(b)} = ${M(c-b)}`,`Step 2: divide both sides by ${a}`,`x = ${M(c-b)} ÷ ${a} = <b>${M(x)}</b>`],hint:'Undo the + or − first, then undo the multiplication.'}},
 ],
 medium:[
  r=>{let a,c,x,b,d;do{a=r.int(3,9);c=r.int(1,a-1);x=nz(r,-8,10);b=nz(r,-12,12);d=(a-c)*x+b}while(d===0);
    return {eq:eqS(lin(a,b),lin(c,d)),ans:x,L:v=>a*v+b,R:v=>c*v+d,
      steps:[`Collect the x-terms: subtract ${c===1?'':c}x from both sides`,`${lin(a-c,b)} = ${M(d)}`,`${b>0?'Subtract':'Add'} ${Math.abs(b)} on both sides: ${lin(a-c,0)} = ${M(d-b)}`,`Divide by ${a-c}: x = <b>${M(x)}</b>`],hint:'Get all the x terms on one side first.'}},
  r=>{const a=r.int(2,8),b=nz(r,-9,9),x=nz(r,-8,10),c=a*(x+b);
    return {eq:eqS(brk(a,lin(1,b)),M(c)),ans:x,L:v=>a*(v+b),R:()=>c,
      steps:[`Expand the bracket: ${a}x ${b>0?'+':'−'} ${a*Math.abs(b)} = ${M(c)}`,`${a}x = ${M(c)} ${b>0?'−':'+'} ${a*Math.abs(b)} = ${M(c-a*b)}`,`x = ${M(c-a*b)} ÷ ${a} = <b>${M(x)}</b>`],hint:`Either expand the bracket, or divide both sides by ${a} first (giving x ${addTerm(b)} = ${M(c/a)}).`}},
  r=>{let a,b,x,c;do{a=r.int(2,6);c=r.int(2,9);x=nz(r,-8,12);b=a*c-x}while(b===0);
    return {eq:eqS(fr(lin(1,b),a),M(c)),ans:x,L:v=>(v+b)/a,R:()=>c,
      steps:[`Multiply both sides by ${a}`,`${lin(1,b)} = ${c} × ${a} = ${a*c}`,`x = ${a*c} ${b>0?'−':'+'} ${Math.abs(b)} = <b>${M(x)}</b>`],hint:'Multiply both sides by the denominator first.'}},
  r=>{let a,c,x,b,d;do{a=r.int(2,7);c=r.int(2,7);x=nz(r,-8,8);b=nz(r,-12,12);d=a*x+b+c*x}while(d===0);
    return {eq:eqS(lin(a,b),`${M(d)} − ${c===1?'':c}x`),ans:x,L:v=>a*v+b,R:v=>d-c*v,
      steps:[`Add ${c}x to both sides so the x-terms are together`,`${lin(a+c,b)} = ${M(d)}`,`${b>0?'Subtract':'Add'} ${Math.abs(b)}: ${a+c}x = ${M(d-b)}`,`x = ${M(d-b)} ÷ ${a+c} = <b>${M(x)}</b>`],hint:'Add the x-term on the right to both sides.'}},
  r=>{let a,b,x,c;do{a=r.int(2,7);b=r.int(1,12);x=r.int(2,12);c=a*x-b}while(c<=0);
    return {text:`I think of a number, multiply it by ${a} and subtract ${b}. The answer is ${c}. What is my number?`,eq:null,wordEq:eqS(lin(a,-b),c),ans:x,L:v=>a*v-b,R:()=>c,
      steps:[`Let the number be x. Write an equation: ${lin(a,-b)} = ${c}`,`Add ${b} to both sides: ${a}x = ${c+b}`,`x = ${c+b} ÷ ${a} = <b>${x}</b>`],hint:'Let the number be x and write the equation.'}},
 ],
 hard:[
  r=>{let a,c,x,b,d,e;do{a=r.int(2,7);c=r.int(2,6);b=nz(r,-6,6);d=nz(r,-6,6);x=nz(r,-9,9);e=a*(x+b)-c*(x+d)}while(a===c);
    const k=a-c, cst=a*b-c*d;
    return {eq:eqS(`${brk(a,lin(1,b))} − ${brk(c,lin(1,d))}`,M(e)),ans:x,L:v=>a*(v+b)-c*(v+d),R:()=>e,
      steps:[`Expand both brackets: ${a}x ${b<0?'−':'+'} ${a*Math.abs(b)} − ${c}x ${d<0?'+':'−'} ${c*Math.abs(d)} = ${M(e)}`,`Collect like terms: ${lin(k,cst)} = ${M(e)}`,`${lin(k,0)} = ${M(e)} ${cst>0?'−':'+'} ${Math.abs(cst)} = ${M(e-cst)}`,`x = ${M(e-cst)} ÷ ${M(k)} = <b>${M(x)}</b>`],hint:'Be careful with the minus sign in front of the second bracket: it changes both signs inside.'}},
  r=>{let b,d,x,k,a,c;do{b=r.int(2,6);d=r.int(2,6);x=nz(r,-8,12);k=nz(r,-4,6);a=b*k-x;c=d*k-x}while(b===d||a===0||c===0);
    return {eq:eqS(fr(lin(1,a),b),fr(lin(1,c),d)),ans:x,L:v=>(v+a)/b,R:v=>(v+c)/d,
      steps:[`Cross-multiply: ${d}(${lin(1,a)}) = ${b}(${lin(1,c)})`,`Expand: ${lin(d,d*a)} = ${lin(b,b*c)}`,`Collect x-terms: ${lin(d-b,0)} = ${M(b*c-d*a)}`,`x = ${M(b*c-d*a)} ÷ ${M(d-b)} = <b>${M(x)}</b>`],hint:'Multiply both sides by both denominators (cross-multiply).'}},
  r=>{const [a,b]=r.shuffle([2,3,4,5,6]).slice(0,2),m=lcm(a,b),x=m*r.int(1,4),c=x/a+x/b;
    return {eq:eqS(`${fr('x',a)} + ${fr('x',b)}`,c),ans:x,L:v=>v/a+v/b,R:()=>c,
      steps:[`Multiply every term by the lowest common multiple, ${m}`,`${m/a}x + ${m/b}x = ${c*m}`,`${(m/a)+(m/b)}x = ${c*m}`,`x = ${c*m} ÷ ${(m/a)+(m/b)} = <b>${x}</b>`],hint:`Multiply every term by ${m}.`}},
  r=>{let a,b,c,d,x;do{a=r.int(2,9);c=r.int(1,8);b=nz(r,-12,12);d=nz(r,-12,12);if(a===c)continue;x=(d-b)/(a-c)}while(a===c||x===0||Number.isInteger(x*2)===false||Number.isInteger(x)||Math.abs(x)>12);
    const k=a-c;
    return {text:'Solve. Give your answer as a fraction or a decimal.',eq:eqS(lin(a,b),lin(c,d)),ans:x,L:v=>a*v+b,R:v=>c*v+d,
      steps:[`Subtract ${c===1?'':c}x from both sides: ${lin(k,b)} = ${M(d)}`,`${b>0?'Subtract':'Add'} ${Math.abs(b)}: ${lin(k,0)} = ${M(d-b)}`,`x = ${M(d-b)} ÷ ${M(k)} = <b>${fmtAns(x)}</b>`],hint:'The answer is not a whole number: that is OK!'}},
  r=>{let x,a,b,c,d;do{x=r.int(3,12);a=r.int(1,4);b=r.int(1,6);c=r.int(1,3);d=r.int(-2,4)}while(c*x+d<=0||a*x+b<=0||a*x+b===c*x+d);
    const P=2*((a+c)*x+b+d),k=a+c,s=b+d;
    return {text:`A rectangle has length (${lin(a,b)}) cm and width (${lin(c,d)}) cm. Its perimeter is ${P} cm. Find x.`,eq:null,wordEq:'',ans:x,L:v=>2*((a+c)*v+b+d),R:()=>P,
      steps:[`Perimeter = 2 × (length + width): 2(${lin(a,b)} + ${lin(c,d)}) = ${P}`,`Simplify the bracket: 2(${lin(k,s)}) = ${P}`,`Divide both sides by 2: ${lin(k,s)} = ${P/2}`,`${lin(k,0)} = ${P/2-s}, so x = <b>${x}</b>`],hint:'Perimeter = 2 × (length + width). Write an equation.'}},
  r=>{let p,q,rr,x,s;do{q=r.int(2,7);rr=r.int(1,5);p=nz(r,-10,20);x=nz(r,-8,8);s=p-q*x-rr*x}while(s===0);
    return {eq:eqS(`${p} − ${q===1?'':q}x`,lin(rr,s)),ans:x,L:v=>p-q*v,R:v=>rr*v+s,
      steps:[`Add ${q}x to both sides so the x-term is positive: ${p} = ${lin(q+rr,s)}`,`${s>0?'Subtract':'Add'} ${Math.abs(s)}: ${M(p-s)} = ${q+rr}x`,`x = ${M(p-s)} ÷ ${q+rr} = <b>${M(x)}</b>`],hint:'Move the x-terms to the side where x stays positive.'}},
 ]
};

// -------- unified API --------
const GEN={7:Y7,10:Y10};
function genProblem(year,level,r){
  const list=GEN[year][level];
  for(let t=0;t<50;t++){
    const g=r.pick(list); let p;
    try{p=g(r)}catch(e){p=null}
    if(!p)continue;
    p.year=year;p.level=level;
    if(year===10){p.kind='eq';p.unit='';p.label='x =';if(p.text===undefined)p.text='Solve the equation.';p.svg=null}
    p.label=p.label||'x =';
    return p;
  }
  throw new Error('generator failed');
}
function checkAnswer(p,s){const v=parseNum(s);return v!==null&&Math.abs(v-p.ans)<=(p.tol||1e-6)}
function ansText(p){
  const v=p.ansStr||(p.tid?M(rd(p.ans,4)):fmtAns(p.ans));   // Year 7 topics show plain decimals
  return `${p.label||''} ${v}${p.unit||''}`.trim();
}
