/* Year 8 problem generators — the school's Year 8 work scheme (7 modules).
   G.y8_*(r, lv) returns a problem like every other generator.
   Optional p.frames[k] is the figure to show once step k has been revealed
   (the worked-example slides redraw the picture as the solution builds up). */

// =====================================================================
//  small helpers
// =====================================================================
const Y8C={blue:'#2455d6',orange:'#d9480f',green:'#16a34a',purple:'#7c3aed',grey:'#94a3b8',ink:'#1f2937'};
const ln8=(x1,y1,x2,y2,c='#111827',w=2,dash='')=>`<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${c}" stroke-width="${w}"${dash?` stroke-dasharray="${dash}"`:''} stroke-linecap="round"/>`;
const tx8=(x,y,t,{c=Y8C.ink,fs=14,a='middle',fw=600,rot=0}={})=>`<text x="${f1(x)}" y="${f1(y)}" text-anchor="${a}" dominant-baseline="central" font-size="${fs}" font-weight="${fw}" fill="${c}" stroke="#fff" stroke-width="4" stroke-linejoin="round" paint-order="stroke"${rot?` transform="rotate(${rot} ${f1(x)} ${f1(y)})"`:''}>${t}</text>`;
const ptsAttr=a=>a.map(p=>f1(p[0])+','+f1(p[1])).join(' ');
const half=v=>{if(Number.isInteger(v))return M(v);const a=Math.abs(v),w=Math.floor(a+1e-9),f=rd(a-w,6);const fs=f===.5?'½':f===.25?'¼':f===.75?'¾':String(rd(f,3)).slice(1);return (v<0?'−':'')+(w?w:'')+fs};
const coefX=(m,v='x')=>m===1?v:m===-1?'−'+v:half(m)+v;
function lineEq(m,c,v='x',y='y'){let s=m===0?'':coefX(m,v);if(c!==0)s+=s?(c>0?' + '+half(c):' − '+half(-c)):half(c);return `${y} = ${s||'0'}`}
const timesX=(m,x)=>`${half(m)} × ${sg(x)}`;
const plusC=c=>c===0?'':c>0?` + ${half(c)}`:` − ${half(-c)}`;
const pad3=n=>String(((n%360)+360)%360).padStart(3,'0');
const sum=a=>a.reduce((x,y)=>x+y,0);
const lst=a=>a.map(M).join(', ');
const frStr=(n,d)=>{const [a,b]=Fr(n,d);return b===1?M(a):`${M(a)}/${b}`};
const dec=v=>M(rd(v,4));
// multiple choice with the options shuffled; duplicates of the correct answer are dropped
function mc8(r,text,correct,wrongs,steps,extra={}){
  const o=[correct];wrongs.forEach(w=>{if(w!=null&&!o.includes(w)&&o.length<4)o.push(w)});
  const s=r.shuffle(o);return MC(text,s,s.indexOf(correct),steps,extra);
}
const niceStep=span=>{for(const s of [1,2,5,10,20,25,50,100,200,500])if(span/s<=10)return s;return 1000};

// =====================================================================
//  coordinate grid (used by graphs, transformations and the demos)
// =====================================================================
function plotSvg(o){
  const {x0=-5,x1=5,y0=-5,y1=5,xs=1,ys=1,W=340,H=310,xt='x',yt='y',outer=false}=o;
  const xl=o.xl||xs,yl=o.yl||ys,L=outer?54:40,Rr=outer?16:22,T=16,B=outer?44:30,pw=W-L-Rr,ph=H-T-B;
  const X=x=>L+(x-x0)/(x1-x0)*pw,Y=y=>T+(y1-y)/(y1-y0)*ph,e=1e-9;
  const ticks=(a,b,s)=>{const t=[];for(let v=Math.ceil(a/s-e)*s;v<=b+e;v+=s)t.push(rd(v,6));return t};
  let s=`<rect x="${L}" y="${T}" width="${pw}" height="${ph}" fill="#fff"/>`;
  if(o.grid!==false){ticks(x0,x1,xs).forEach(x=>s+=ln8(X(x),T,X(x),T+ph,'#e5e7eb',1));ticks(y0,y1,ys).forEach(y=>s+=ln8(L,Y(y),L+pw,Y(y),'#e5e7eb',1))}
  const xa=(y0<=0&&0<=y1)?Y(0):T+ph,ya=(x0<=0&&0<=x1)?X(0):L,origin=Math.abs(xa-Y(0))<e&&Math.abs(ya-X(0))<e;
  s+=ln8(L,xa,L+pw+(outer?0:8),xa,'#111827',1.6)+ln8(ya,T+ph,ya,T-(outer?0:6),'#111827',1.6);
  ticks(x0,x1,xl).forEach(x=>{if(origin&&Math.abs(x)<e)return;s+=tx8(X(x),xa+13,M(x),{fs:12,c:'#4b5563',fw:500})});
  ticks(y0,y1,yl).forEach(y=>{if(origin&&Math.abs(y)<e)return;s+=tx8(ya-6,Y(y),M(y),{fs:12,c:'#4b5563',fw:500,a:'end'})});
  if(origin)s+=tx8(X(0)-6,Y(0)+12,'0',{fs:12,c:'#4b5563',fw:500,a:'end'});
  if(outer){s+=tx8(L+pw/2,T+ph+32,xt,{fs:13})+tx8(14,T+ph/2,yt,{fs:13,rot:-90})}
  else{s+=tx8(L+pw+12,xa,xt,{fs:14,fw:700,c:'#374151',a:'start'})+tx8(ya+10,T+2,yt,{fs:14,fw:700,c:'#374151',a:'start'})}
  (o.polys||[]).forEach(p=>{const c=p.color||Y8C.blue;s+=`<polygon points="${ptsAttr(p.pts.map(q=>[X(q[0]),Y(q[1])]))}" fill="${p.fill||c}" fill-opacity="${p.op??.22}" stroke="${c}" stroke-width="2.2" stroke-linejoin="round"${p.dash?` stroke-dasharray="${p.dash}"`:''}/>`;
    if(p.label){const cx=sum(p.pts.map(q=>q[0]))/p.pts.length,cy=sum(p.pts.map(q=>q[1]))/p.pts.length;s+=tx8(X(cx),Y(cy),p.label,{c,fs:15,fw:800})}
    if(p.names)p.pts.forEach((q,i)=>{s+=tx8(X(q[0])+8,Y(q[1])-9,p.names[i],{c,fs:12,fw:700})})});
  (o.lines||[]).forEach(l=>{
    let a=x0,b=x1;if(l.m!==0){const u=(y0-l.c)/l.m,v=(y1-l.c)/l.m;a=Math.max(x0,Math.min(u,v));b=Math.min(x1,Math.max(u,v))}else if(l.c<y0||l.c>y1)return;
    if(l.from!==undefined)a=Math.max(a,l.from);if(l.to!==undefined)b=Math.min(b,l.to);if(b<=a)return;
    s+=ln8(X(a),Y(l.m*a+l.c),X(b),Y(l.m*b+l.c),l.color||Y8C.blue,l.w||2.8,l.dash||'');
    if(l.label){const bx=b-(b-a)*.06;s+=tx8(X(bx),Y(l.m*bx+l.c)-14,l.label,{c:l.color||Y8C.blue,fs:13,fw:700,a:'end'})}});
  (o.segs||[]).forEach(g=>{s+=ln8(X(g.a[0]),Y(g.a[1]),X(g.b[0]),Y(g.b[1]),g.color||Y8C.orange,g.w||2,g.dash||'')});
  (o.tris||[]).forEach(t=>{const c=t.color||Y8C.green;s+=ln8(X(t.x),Y(t.y),X(t.x+t.dx),Y(t.y),c,2.4)+ln8(X(t.x+t.dx),Y(t.y),X(t.x+t.dx),Y(t.y+t.dy),c,2.4);
    s+=tx8(X(t.x+t.dx/2),Y(t.y)+(t.dy>=0?13:-13),t.run??`run ${t.dx}`,{c,fs:12,fw:700})+tx8(X(t.x+t.dx)+6,Y(t.y+t.dy/2),t.rise??`rise ${M(t.dy)}`,{c,fs:12,fw:700,a:'start'})});
  (o.pts||[]).forEach(p=>{const c=p.color||Y8C.orange;s+=`<circle cx="${f1(X(p.x))}" cy="${f1(Y(p.y))}" r="${p.r||4.6}" fill="${c}" stroke="#fff" stroke-width="1.5"/>`;if(p.label)s+=tx8(X(p.x)+(p.dx??8),Y(p.y)+(p.dy??-11),p.label,{c,fs:12.5,fw:700,a:p.a||'start'})});
  (o.txts||[]).forEach(t=>{s+=tx8(X(t.x)+(t.dx||0),Y(t.y)+(t.dy||0),t.t,{c:t.color||Y8C.ink,fs:t.fs||13,fw:t.fw||700,a:t.a||'middle'})});
  return svgWrap(s,W,H,0,o.cls||'');
}

// =====================================================================
//  3D drawings (oblique projection)
// =====================================================================
function prismDraw(face,depth,labels=[],{dir=[.62,-.42],fill='#c7d2fe'}={}){
  const ox=dir[0]*depth,oy=dir[1]*depth,back=face.map(p=>[p[0]+ox,p[1]+oy]),E=Ext();
  face.concat(back).forEach(p=>E.add(p[0],p[1]));
  const n=face.length,cx=sum(face.map(p=>p[0]))/n,cy=sum(face.map(p=>p[1]))/n;
  let hid='',vis='';
  for(let i=0;i<n;i++){
    const a=face[i],b=face[(i+1)%n],ex=b[0]-a[0],ey=b[1]-a[1];let nx=ey,ny=-ex;
    if(nx*((a[0]+b[0])/2-cx)+ny*((a[1]+b[1])/2-cy)<0){nx=-nx;ny=-ny}
    const quad=[a,b,back[(i+1)%n],back[i]];
    if(nx*ox+ny*oy>1e-6)vis+=`<polygon points="${ptsAttr(quad)}" fill="#e0e7ff" fill-opacity=".85" stroke="#111827" stroke-width="2" stroke-linejoin="round"/>`;
    else hid+=ln8(back[i][0],back[i][1],back[(i+1)%n][0],back[(i+1)%n][1],'#64748b',1.4,'5 4')+ln8(a[0],a[1],back[i][0],back[i][1],'#64748b',1.4,'5 4');
  }
  let s=hid+vis+`<polygon points="${ptsAttr(face)}" fill="${fill}" fill-opacity=".9" stroke="#111827" stroke-width="2.2" stroke-linejoin="round"/>`;
  labels.forEach(l=>{s+=tx8(l[0],l[1],l[2],{fs:14,fw:700,c:l[3]||Y8C.ink,a:l[4]||'middle'});E.add(l[0],l[1],boxW(l[2],14),18)});
  return svgFit(s,E,'',10);
}
function cuboidSvg(l,w,h,u='cm'){
  const k=Math.min(150/l,95/h,70/w,18),L=l*k,H=h*k,D=w*k,face=[[0,0],[L,0],[L,H],[0,H]].map(p=>[p[0],p[1]+D*.42]);
  return prismDraw(face,D,[[L/2,face[2][1]+16,`${l} ${u}`],[-8,face[0][1]+H/2,`${h} ${u}`,null,'end'],[L+D*.31+8,face[2][1]-D*.21+4,`${w} ${u}`,null,'start']]);
}
function triPrismSvg(b,h,len,u='cm',right=false){
  const k=Math.min(130/b,90/h,15),B=b*k,H=h*k,D=Math.min(len*k*.8,120),top=right?[0,0]:[B/2,0];
  const face=[[0,H],[B,H],top];
  const lab=[[B/2,H+16,`${b} ${u}`],[top[0]+(right?-8:0),H/2,`${h} ${u}`,null,right?'end':'middle'],[B+D*.31+8,H-D*.21+4,`${len} ${u}`,null,'start']];
  let s=prismDraw(face,D,lab);
  if(!right)s=s.replace('</svg>',ln8(B/2,0,B/2,H,Y8C.orange,1.6,'4 3')+'</svg>');
  return s;
}
function trapPrismSvg(a,b,h,len,u='cm'){
  const k=Math.min(140/b,80/h,14),A=a*k,B=b*k,H=h*k,D=Math.min(len*k*.8,120),off=(B-A)/2;
  return prismDraw([[0,H],[B,H],[off+A,0],[off,0]],D,[[B/2,H+16,`${b} ${u}`],[off+A/2,-14,`${a} ${u}`],[off+A+12,H/2,`${h} ${u}`,null,'start'],[B+D*.31+8,H-D*.21+4,`${len} ${u}`,null,'start']]);
}
function cylSvg(rr,h,u='cm'){
  const k=Math.min(70/rr,120/h,14),R=rr*k,H=h*k,ry=R*.32,cx=R+20,ty=ry+10,by=ty+H;
  let s=`<path d="M${cx-R},${ty} L${cx-R},${by} A${R},${ry} 0 0 0 ${cx+R},${by} L${cx+R},${ty}" fill="#e0e7ff" stroke="#111827" stroke-width="2"/>`;
  s+=`<path d="M${cx-R},${by} A${R},${ry} 0 0 1 ${cx+R},${by}" fill="none" stroke="#64748b" stroke-width="1.4" stroke-dasharray="5 4"/>`;
  s+=`<ellipse cx="${cx}" cy="${ty}" rx="${R}" ry="${ry}" fill="#c7d2fe" stroke="#111827" stroke-width="2"/>`+ln8(cx,ty,cx+R,ty,Y8C.orange,1.8)+tx8(cx+R/2,ty-11,`${rr} ${u}`,{fs:14,fw:700})+tx8(cx+R+10,ty+H/2,`${h} ${u}`,{fs:14,fw:700,a:'start'});
  return svgWrap(s,cx+R+70,by+ry+12,0);
}

// =====================================================================
//  nets (2D)
// =====================================================================
const NET_SOLIDS={cube:['cube',6,12,8],cuboid:['cuboid',6,12,8],tri:['triangular prism',5,9,6],pyr:['square-based pyramid',5,8,5],tet:['tetrahedron (triangular-based pyramid)',4,6,4],cyl:['cylinder',3,2,0]};
function netSvg(kind,o={}){
  let s='';const E=Ext(),F='#e0e7ff',st='stroke="#111827" stroke-width="2" stroke-linejoin="round"';
  const poly=(p,f=F)=>{p.forEach(q=>E.add(q[0],q[1]));s+=`<polygon points="${ptsAttr(p)}" fill="${f}" ${st}/>`};
  const rect=(x,y,w,h,f)=>poly([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],f);
  const lab=(x,y,t)=>{s+=tx8(x,y,t,{fs:13,fw:700});E.add(x,y,boxW(t,13),18)};
  if(kind==='cube'){const a=o.a||34,cells=o.cells||[[1,0],[0,1],[1,1],[2,1],[3,1],[1,2]];cells.forEach(([c,r],i)=>rect(c*a,r*a,a,a,i%2?'#c7d2fe':F));if(o.s)lab(cells[1][0]*a+a/2,cells[1][1]*a+a+12,`${o.s} cm`)}
  else if(kind==='cuboid'){const k=o.k||9,l=(o.l||4)*k,w=(o.w||2)*k,h=(o.h||3)*k;
    rect(w,0,l,w,'#c7d2fe');rect(0,w,w,h);rect(w,w,l,h,'#c7d2fe');rect(w+l,w,w,h);rect(2*w+l,w,l,h,'#c7d2fe');rect(w,w+h,l,w);
    if(o.labels){lab(w+l/2,w+h/2,`${o.l} cm`);lab(w/2,w+h/2,`${o.w}`);lab(w+l/2,w+h+w/2,`${o.w} cm`);lab(2*w+l+l/2,w+h/2,`${o.h} cm ↕`)}}
  else if(kind==='tri'){const a=o.a||46,len=o.len||80,t=a*Math.sqrt(3)/2;[0,1,2].forEach(i=>rect(i*a,t,a,len,i===1?'#c7d2fe':F));poly([[a,t],[2*a,t],[1.5*a,0]],'#fde68a');poly([[a,t+len],[2*a,t+len],[1.5*a,2*t+len]],'#fde68a')}
  else if(kind==='pyr'){const a=o.a||56,t=a*Math.sqrt(3)/2*(o.tall||1);rect(t,t,a,a,'#c7d2fe');poly([[t,t],[t+a,t],[t+a/2,0]]);poly([[t,t+a],[t+a,t+a],[t+a/2,2*t+a]]);poly([[t,t],[t,t+a],[0,t+a/2]]);poly([[t+a,t],[t+a,t+a],[2*t+a,t+a/2]])}
  else if(kind==='tet'){const a=o.a||62,t=a*Math.sqrt(3)/2;poly([[0,2*t],[a,2*t],[a/2,t]]);poly([[a,2*t],[2*a,2*t],[1.5*a,t]]);poly([[a/2,t],[1.5*a,t],[a,0]]);poly([[a/2,t],[1.5*a,t],[a,2*t]],'#c7d2fe')}
  else if(kind==='cyl'){const R=22,w=2*Math.PI*R*.62,h=70;rect(0,2*R,w,h,'#c7d2fe');[[w/2,R],[w/2,3*R+h]].forEach(([x,y])=>{E.add(x-R,y-R);E.add(x+R,y+R);s+=`<circle cx="${f1(x)}" cy="${f1(y)}" r="${R}" fill="${F}" ${st}/>`})}
  return svgFit(s,E,'',8);
}
const CUBE_OK=[[[1,0],[0,1],[1,1],[2,1],[3,1],[1,2]],[[0,0],[0,1],[1,1],[2,1],[3,1],[3,2]],[[0,0],[0,1],[1,1],[2,1],[3,1],[1,2]],[[0,0],[0,1],[1,1],[2,1],[3,1],[2,2]],[[0,0],[1,0],[2,0],[2,1],[3,1],[4,1]],[[0,0],[1,0],[1,1],[2,1],[2,2],[3,2]]];
const CUBE_BAD=[[[0,0],[1,0],[2,0],[3,0],[4,0],[5,0]],[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],[[0,0],[1,0],[0,1],[1,1],[2,1],[3,1]],[[1,0],[0,1],[1,1],[2,1],[3,1],[4,1]],[[0,0],[1,0],[2,0],[1,1],[2,1],[3,1]]];
function fourNetsSvg(nets){
  const a=17;let s='';
  nets.forEach((cells,i)=>{const ox=(i%2)*150,oy=Math.floor(i/2)*92;
    s+=tx8(ox+6,oy+10,'ABCD'[i],{fs:15,fw:800,c:Y8C.blue,a:'start'});
    cells.forEach(([c,r2])=>{s+=`<rect x="${ox+22+c*a}" y="${oy+18+r2*a}" width="${a}" height="${a}" fill="#e0e7ff" stroke="#111827" stroke-width="1.6"/>`})});
  return svgWrap(s,300,184,4);
}

// =====================================================================
//  other figures
// =====================================================================
// two horizontal parallel lines cut by a transversal at angle th; marks: [{at:'U'|'L',pos:'ar'|'al'|'bl'|'br',label,unk,color}]
function parSvg(th,marks=[],{hl=false}={}){
  const W=400,H=250,ya=82,yb=172,dx=(yb-ya)/Math.tan(rad(th)),xu=200+dx/2,xl=200-dx/2;
  const span={ar:[0,th],al:[th,180],bl:[180,180+th],br:[180+th,360]};
  let s='';
  if(hl){const c='#fdba74',ray=(x,y,pos)=>pos==='ar'||pos==='br'?ln8(x,y,x+120,y,c,9):ln8(x,y,x-120,y,c,9);
    s+=ln8(xu,ya,xl,yb,c,9);marks.forEach(m=>{s+=m.at==='U'?ray(xu,ya,m.pos):ray(xl,yb,m.pos)})}
  s+=ln8(20,ya,380,ya,'#111827',2.6)+ln8(20,yb,380,yb,'#111827',2.6);
  [ya,yb].forEach(y=>{s+=`<polyline points="${330},${y-6} ${338},${y} ${330},${y+6}" fill="none" stroke="#111827" stroke-width="2"/>`});
  const ux=Math.cos(rad(th)),uy=-Math.sin(rad(th));
  s+=ln8(xl-75*ux,yb-75*uy,xu+75*ux,ya+75*uy,'#111827',2.6);
  marks.forEach(m=>{const [a0,a1]=span[m.pos],cx=m.at==='U'?xu:xl,cy=m.at==='U'?ya:yb,c=m.color||(m.unk?Y8C.orange:Y8C.blue),w=a1-a0;
    s+=`<path d="${arcPath(cx,cy,20,a0,a1)}" fill="none" stroke="${c}" stroke-width="2.6"/>`;
    const rr=Math.min(66,Math.max(36,20/Math.sin(rad(w/2))+10)),[lx,ly]=P(cx,cy,rr,(a0+a1)/2);
    if(m.label)s+=tx8(lx,ly,m.label,{c,fs:m.unk?17:15,fw:700})});
  return svgWrap(s,W,H);
}
function bearingSvg(b,{arc='N',ang=null,back=false,showB=true,lab=null}={}){
  const cx=150,cy=150,R=105,[bx,by]=P(cx,cy,R,90-b);let s='';
  const north=(x,y)=>ln8(x,y,x,y-72,'#111827',2)+`<polygon points="${x},${y-80} ${x-6},${y-66} ${x+6},${y-66}" fill="#111827"/>`+tx8(x,y-92,'N',{fs:15,fw:800});
  s+=north(cx,cy)+ln8(cx,cy,bx,by,'#111827',2.6)+`<circle cx="${cx}" cy="${cy}" r="4" fill="#111827"/>`+tx8(cx-12,cy+12,'A',{fs:15,fw:800});
  if(showB)s+=`<circle cx="${f1(bx)}" cy="${f1(by)}" r="4" fill="#111827"/>`+tx8(bx+(bx>cx?12:-12),by+(by>cy?12:-12),'B',{fs:15,fw:800});
  if(arc==='N'){s+=`<path d="${arcPath(cx,cy,30,90-b,90)}" fill="none" stroke="${Y8C.orange}" stroke-width="2.6"/>`;const [lx,ly]=P(cx,cy,b<40||b>320?62:50,90-b/2);s+=tx8(lx,ly,lab||`${b}°`,{c:Y8C.orange,fs:15,fw:700})}
  else if(arc){const ref={N:90,E:0,S:270,W:180}[arc],dir=((90-b)%360+360)%360;let a0=Math.min(ref,dir),a1=Math.max(ref,dir);if(a1-a0>180){const t=a0;a0=a1;a1=t+360}
    const dashRef=P(cx,cy,R*.75,ref);s+=ln8(cx,cy,dashRef[0],dashRef[1],'#64748b',1.6,'5 4');
    s+=`<path d="${arcPath(cx,cy,32,a0,a1)}" fill="none" stroke="${Y8C.blue}" stroke-width="2.6"/>`;const [lx,ly]=P(cx,cy,56,(a0+a1)/2);s+=tx8(lx,ly,`${ang}°`,{c:Y8C.blue,fs:15,fw:700})}
  if(back){const bb=(b+180)%360;s+=north(bx,by);s+=`<path d="${arcPath(bx,by,26,90-bb,90)}" fill="none" stroke="${Y8C.green}" stroke-width="2.6"/>`;const [lx,ly]=P(bx,by,48,90-bb/2);s+=tx8(lx,ly,`${bb}°`,{c:Y8C.green,fs:15,fw:700})}
  const E=Ext();E.add(cx-R-20,cy-R-20);E.add(cx+R+20,cy+R+20);if(back){E.add(bx-80,by-100);E.add(bx+80,by+80)}
  return svgFit(s,E,'sq',4);
}
function ratioBarSvg(parts,{names=[],per=null,shares=false}={}){
  const n=sum(parts),w=Math.min(48,340/n),cols=[Y8C.blue,Y8C.orange,Y8C.green];let s='',x=10;
  parts.forEach((p,i)=>{const x0=x;for(let j=0;j<p;j++){s+=`<rect x="${x}" y="30" width="${w}" height="38" fill="${cols[i]}" fill-opacity=".85" stroke="#fff" stroke-width="2"/>`;if(per!==null)s+=tx8(x+w/2,49,per,{fs:w<34?10:12,fw:700,c:'#fff'});x+=w}
    s+=tx8((x0+x)/2,16,names[i]||'',{fs:13,fw:700,c:cols[i]});
    if(shares)s+=`<path d="M${x0+2},76 L${x0+2},82 L${x-2},82 L${x-2},76" fill="none" stroke="${cols[i]}" stroke-width="2"/>`+tx8((x0+x)/2,96,shares[i],{fs:13,fw:800,c:cols[i]})});
  return svgWrap(s,x+10,shares?108:80);
}
function histSvg(bounds,freq,{xt='',yt='Frequency'}={}){
  const max=Math.max(...freq),top=Math.ceil((max+1)/2)*2,W=360,H=250,L=48,B=44,T=12,pw=W-L-14,ph=H-T-B,bw=pw/freq.length,Yv=v=>T+ph-(v/top)*ph;let s='';
  const st=top<=10?1:2;for(let v=0;v<=top;v+=st)s+=ln8(L,Yv(v),L+pw,Yv(v),'#e5e7eb',1)+tx8(L-6,Yv(v),v,{fs:11,fw:500,c:'#4b5563',a:'end'});
  freq.forEach((f,i)=>{s+=`<rect x="${f1(L+i*bw)}" y="${f1(Yv(f))}" width="${f1(bw)}" height="${f1(ph-(Yv(f)-T))}" fill="#93c5fd" stroke="#1e3a8a" stroke-width="1.5"/>`});
  bounds.forEach((b,i)=>{s+=tx8(L+i*bw,T+ph+13,b,{fs:11.5,fw:500,c:'#374151'})});
  s+=ln8(L,T,L,T+ph,'#111827',1.6)+ln8(L,T+ph,L+pw,T+ph,'#111827',1.6)+tx8(L+pw/2,T+ph+32,xt,{fs:13})+tx8(14,T+ph/2,yt,{fs:13,rot:-90});
  return svgWrap(s,W,H);
}
// probability tree: p1=[top,bottom] labels, p2=[[..],[..]], names1/names2, out=[4 strings], show=0..3, hl=[indices]
function treeSvg({n1,n2,p1,p2,out=[],show=3,hl=[],qs=['?','?']}){
  let s='';const x0=20,y0=135,x1=150,ys1=[70,200],x2=290,ys2=[[35,105],[165,235]];
  const br=(xa,ya,xb,yb,p,name,on)=>{let t=ln8(xa,ya,xb,yb,on?'#111827':'#cbd5e1',2.2)+tx8(xb+12,yb,name,{fs:15,fw:800,a:'start'});const mx=(xa+xb)/2,my=(ya+yb)/2;t+=tx8(mx-4,my+(yb<ya?-12:12),on?p:'?',{fs:13,fw:700,c:on?Y8C.blue:'#94a3b8',a:'end'});return t};
  [0,1].forEach(i=>{s+=br(x0,y0,x1,ys1[i],p1[i],n1[i],show>=1);
    [0,1].forEach(j=>{s+=br(x1+28,ys1[i],x2,ys2[i][j],p2[i][j],n2[j],show>=2);
      const k=i*2+j;if(show>=3){const on=hl.includes(k);if(on)s+=`<rect x="${x2+30}" y="${ys2[i][j]-13}" width="150" height="26" rx="6" fill="#fef3c7" stroke="#f59e0b"/>`;s+=tx8(x2+36,ys2[i][j],out[k]||'',{fs:13,fw:on?800:600,a:'start',c:on?'#92400e':Y8C.ink})}})});
  s+=tx8(x1-20,14,qs[0],{fs:12,fw:600,c:'#64748b'})+tx8(x2-10,14,qs[1],{fs:12,fw:600,c:'#64748b'});
  return svgWrap(s,490,260);
}
// matchstick patterns: kind 'sq' (3n+1), 'tri' (2n+1), 'house' (5n+1)
function sticksSvg(kind,ns=[1,2,3]){
  const u=26;let s='',ox=10;const L=(a,b,c,d)=>{s+=ln8(ox+a,c,ox+b,d,'#b45309',3.2)};
  ns.forEach(n=>{let w=0;
    if(kind==='sq'){for(let i=0;i<n;i++){L(i*u,(i+1)*u,40,40);L(i*u,(i+1)*u,40+u,40+u);L(i*u,i*u,40,40+u)}L(n*u,n*u,40,40+u);w=n*u}
    else if(kind==='tri'){const h=u*.87;for(let i=0;i<n;i++){const x=i*u/2;if(i%2===0){L(x,x+u/2,40+h,40);L(x+u/2,x+u,40,40+h)}else{L(x,x+u/2,40,40+h);L(x+u/2,x+u,40+h,40)}}
      const tops=Math.floor(n/2),bots=Math.ceil(n/2);for(let i=0;i<bots;i++)L(i*u,(i+1)*u,40+h,40+h);for(let i=0;i<tops;i++)L(u/2+i*u,u/2+(i+1)*u,40,40);w=(n+1)*u/2}
    else{for(let i=0;i<n;i++){L(i*u,(i+1)*u,50+u,50+u);L(i*u,(i+1)*u,50,50);L(i*u,i*u+u/2,50,50-u*.6);L(i*u+u/2,(i+1)*u,50-u*.6,50);L(i*u,i*u,50,50+u)}L(n*u,n*u,50,50+u);w=n*u}
    s+=tx8(ox+w/2,100,`Pattern ${n}`,{fs:12,fw:600,c:'#374151'});ox+=w+34});
  return svgWrap(s,ox,112);
}
const miniTable=(rows,hlCol=-1)=>`<table class="mini">${rows.map((r2,i)=>`<tr>${r2.map((c,j)=>i===0||j===0?`<th>${c}</th>`:`<td${j===hlCol?' class="hl"':''}>${c}</td>`).join('')}</tr>`).join('')}</table>`;

// =====================================================================
//  MODULE 1 — straight-line graphs
// =====================================================================
G.y8_lineTable=(r,lv)=>{
  let m,c,xs;
  if(lv===0){m=r.int(1,3);c=r.int(-3,4);xs=[-2,-1,0,1,2]}
  else if(lv===1){m=-r.int(1,3);c=nz(r,-4,4);xs=[-2,-1,0,1,2]}
  else{m=pick(r,[.5,-.5,1.5]);c=nz(r,-3,3);xs=[-4,-2,0,2,4]}
  const ys=xs.map(x=>rd(m*x+c)),t=r.int(0,4),eq=lineEq(m,c);
  const lo=Math.floor(Math.min(...ys,0))-1,hi=Math.ceil(Math.max(...ys,0))+1,yr={y0:lo,y1:hi,ys:1,yl:hi-lo>12?2:1};
  const base={x0:xs[0]-1,x1:xs[4]+1,...yr,xl:lv===2?2:1};
  const pts=xs.map((x,i)=>({x,y:ys[i],label:`(${M(x)}, ${M(ys[i])})`,dy:-11}));
  const row=xs.map((x,i)=>i===t?'<b style="color:#d9480f">?</b>':M(ys[i]));
  return Qn({text:`Complete the table of values for <b>${eq}</b>, then draw the graph. What is the missing value <b>?</b>`,
    eq:miniTable([['x',...xs.map(M)],['y',...row]]),svg:plotSvg(base),label:'? =',ans:ys[t],
    steps:[`Substitute x = ${M(xs[t])}: y = ${timesX(m,xs[t])}${plusC(c)} = <b>${M(ys[t])}</b>`,
      `Work out every y-value the same way:${miniTable([['x',...xs.map(M)],['y',...ys.map(M)]])}`,
      `Plot each pair (x, y) as a point.`,
      `Join the points with a ruler and extend the line. Label it <b>${eq}</b>.`],
    frames:[null,null,plotSvg({...base,pts}),plotSvg({...base,pts,lines:[{m,c,label:eq}]})],
    hint:'Put each x-value into the equation. Multiply before you add.'});
};
G.y8_lineGradInt=(r,lv)=>{
  let m,c,shown,pre=[];
  if(lv===0){m=r.int(1,3);c=nz(r,-4,4);shown=lineEq(m,c)}
  else if(lv===1){m=-r.int(1,3);c=r.int(1,6);shown=`y = ${c} − ${m===-1?'':-m}x`}
  else{const k=pick(r,[2,3]);m=nz(r,-3,3);c=nz(r,-4,4);if(r.chance(.5)){shown=`${k}y = ${lin(k*m,k*c)}`;pre=[`Divide every term by ${k}: ${shown} → <b>${lineEq(m,c)}</b>`]}else{shown=`y ${m<0?'+':'−'} ${Math.abs(m)===1?'':Math.abs(m)}x = ${M(c)}`;pre=[`Move the x-term to the other side: ${shown} → <b>${lineEq(m,c)}</b>`]}}
  const askM=lv===1?r.chance(.7):r.chance(.5),y2=c+2*m;
  const base={x0:-3,x1:4,y0:Math.min(0,c,y2,c-m)-2,y1:Math.max(0,c,y2,c-m)+2};base.yl=base.y1-base.y0>12?2:1;
  const p0={x:0,y:c,label:`(0, ${M(c)})`,a:'end',dx:-8};
  return Qn({text:`For the line <b>${shown}</b>, write down the ${askM?'<b>gradient</b>':'<b>y-intercept</b>'}, then sketch the line using the gradient–intercept method.`,
    svg:plotSvg(base),label:askM?'Gradient =':'y-intercept =',ans:askM?m:c,
    steps:[...pre,`Compare with <b>y = mx + c</b>: gradient m = <b>${M(m)}</b>, y-intercept c = <b>${M(c)}</b>.`,
      `Plot the y-intercept (0, ${M(c)}).`,
      `Gradient ${M(m)}: from (0, ${M(c)}) go 1 right and ${Math.abs(m)} ${m>0?'up':'down'} to (1, ${M(c+m)}). Repeat to get (2, ${M(y2)}).`,
      `Join the points with a ruler: this is the line ${lineEq(m,c)}.`],
    frames:[...pre.map(()=>null),null,plotSvg({...base,pts:[p0]}),plotSvg({...base,pts:[p0,{x:1,y:c+m},{x:2,y:y2}],tris:[{x:0,y:c,dx:1,dy:m,run:'1',rise:M(m)},{x:1,y:c+m,dx:1,dy:m,run:'1',rise:M(m)}]}),plotSvg({...base,pts:[p0,{x:1,y:c+m},{x:2,y:y2}],lines:[{m,c,label:lineEq(m,c)}]})],
    hint:'In y = mx + c, m is the number in front of x and c is the number on its own.'});
};
G.y8_coverUp=(r,lv)=>{
  let a,b,k,p,q;
  for(let t=0;t<200;t++){p=r.int(2,8);q=r.int(2,8);if(lv>=1&&r.chance(.6))q=-q;if(lv===2&&r.chance(.3))p=-p;k=lcm(Math.abs(p),Math.abs(q))*(r.chance(.3)?2:1);a=k/p;b=k/q;if(Math.abs(a)<=9&&Math.abs(b)<=9&&Number.isInteger(a)&&Number.isInteger(b)&&k<=48)break}
  const eq=`${cx(a,'x')} ${b<0?'−':'+'} ${Math.abs(b)===1?'':Math.abs(b)}y = ${k}`,m=-a/b;
  const base={x0:Math.min(0,p)-2,x1:Math.max(0,p)+2,y0:Math.min(0,q)-2,y1:Math.max(0,q)+2};base.xl=base.x1-base.x0>12?2:1;base.yl=base.y1-base.y0>12?2:1;
  const P1={x:0,y:q,label:`(0, ${M(q)})`,dx:8},P2={x:p,y:0,label:`(${M(p)}, 0)`,dy:14};
  const q2=lv===2?'area':r.chance(.5)?'x':'y';
  const steps=[`<b>y-intercept:</b> put x = 0 (cover the x-term): ${cx(b,'y')} = ${k}, so y = ${k} ÷ ${sg(b)} = <b>${M(q)}</b>. Plot (0, ${M(q)}).`,
    `<b>x-intercept:</b> put y = 0 (cover the y-term): ${cx(a,'x')} = ${k}, so x = ${k} ÷ ${sg(a)} = <b>${M(p)}</b>. Plot (${M(p)}, 0).`,
    `Join the two points with a ruler and extend the line past both of them.`];
  const frames=[plotSvg({...base,pts:[P1]}),plotSvg({...base,pts:[P1,P2]}),plotSvg({...base,pts:[P1,P2],lines:[{m,c:q,label:eq}]})];
  if(q2==='area'){steps.push(`The line and the axes make a right-angled triangle with sides ${Math.abs(p)} and ${Math.abs(q)}. Area = ½ × ${Math.abs(p)} × ${Math.abs(q)} = <b>${Math.abs(p*q)/2}</b>`);frames.push(plotSvg({...base,polys:[{pts:[[0,0],[p,0],[0,q]],color:Y8C.green,op:.25}],pts:[P1,P2],lines:[{m,c:q}]}))}
  return Qn({text:q2==='area'?`The line <b>${eq}</b> crosses the x-axis and the y-axis. Find the area of the triangle it makes with the two axes.`:`Use the <b>dual intercept (cover-up) method</b> to draw <b>${eq}</b>. Where does the line cross the <b>${q2}-axis</b>? Give the ${q2}-coordinate.`,
    svg:plotSvg(base),label:q2==='area'?'Area =':q2+' =',unit:q2==='area'?' units²':'',ans:q2==='area'?Math.abs(p*q)/2:q2==='x'?p:q,steps,frames,hint:'Cover the x-term to find where the line meets the y-axis, and the y-term for the x-axis.'});
};
G.y8_sketchMC=(r,lv)=>{
  let m,c;if(lv===0){m=r.int(1,3);c=r.int(1,4)}else if(lv===1){m=nz(r,-3,3);c=nz(r,-4,4);if(m>0&&c>0)m=-m}else{m=pick(r,[.5,-.5,2,-2,1.5]);c=nz(r,-3,3)}
  const run=Number.isInteger(m)?1:2,eq=lineEq(m,c);
  const base={x0:-6,x1:6,y0:-6,y1:6,xl:2,yl:2,cls:'sq'},L=[{m,c,color:'#111827'}];
  const w=[lineEq(-m,c),lineEq(m,-c),Number.isInteger(c)&&c!==m&&Math.abs(c)<=5?lineEq(c,m):lineEq(m,c+1),lineEq(m+(m>0?1:-1),c),lineEq(1/m===Math.round(1/m)?1/m:m*2,c)];
  return mc8(r,'Which equation matches the straight line shown on the grid?',eq,w,
    [`Find where the line crosses the y-axis: at (0, ${M(c)}), so <b>c = ${M(c)}</b>.`,
     `Choose two points on the line: (0, ${M(c)}) and (${run}, ${M(c+m*run)}). Gradient = rise ÷ run = ${M(m*run)} ÷ ${run} = <b>${half(m)}</b>.`,
     `${m<0?'The line slopes down from left to right, so the gradient is negative. ':''}So the equation is <b>${eq}</b>.`],
    {svg:plotSvg({...base,lines:L}),frames:[plotSvg({...base,lines:L,pts:[{x:0,y:c,label:`(0, ${M(c)})`}]}),plotSvg({...base,lines:L,pts:[{x:0,y:c},{x:run,y:c+m*run}],tris:[{x:0,y:c,dx:run,dy:m*run,run:String(run),rise:M(m*run)}]}),null]});
};
G.y8_gradFromGraph=(r,lv)=>{
  let dx,dy;if(lv===0){dx=r.int(1,3);dy=dx*r.int(1,3)}else if(lv===1){dx=r.int(1,3);dy=-dx*r.int(1,3)}else{dx=pick(r,[2,3,4]);dy=nz(r,-5,5);if(dy%dx===0)dy+=dy>0?1:-1}
  const x1=r.int(-4,-1),y1=r.int(-3,1),m=dy/dx,c=y1-m*x1,A={x:x1,y:y1,label:`A(${M(x1)}, ${M(y1)})`,a:'end',dx:-8},B={x:x1+dx,y:y1+dy,label:`B(${M(x1+dx)}, ${M(y1+dy)})`};
  const base={x0:-6,x1:6,y0:-7,y1:7,xl:2,yl:2,cls:'sq',lines:[{m,c,color:'#111827'}]};
  return Qn(Object.assign(lv===2?fracAns(dy,dx):{ans:m},{text:`The line passes through the points A and B. Find its <b>gradient</b>.`,svg:plotSvg({...base,pts:[A,B]}),label:'Gradient =',
    steps:[`Gradient = rise ÷ run (change in y ÷ change in x).`,`Run: from x = ${M(x1)} to x = ${M(x1+dx)} is <b>${dx}</b> to the right.`,`Rise: from y = ${M(y1)} to y = ${M(y1+dy)} is <b>${M(dy)}</b> (${dy>0?'up':'down'}).`,`Gradient = ${M(dy)} ÷ ${dx} = <b>${frStr(dy,dx)}</b>`],
    frames:[null,plotSvg({...base,pts:[A,B],segs:[{a:[x1,y1],b:[x1+dx,y1],color:Y8C.green,w:3}]}),plotSvg({...base,pts:[A,B],tris:[{x:x1,y:y1,dx,dy,run:String(dx),rise:M(dy)}]}),null],hint:'Count squares across, then up or down.'}));
};
const REAL=[
  {k:'taxi',xn:'distance',xu:'km',x:'Distance (km)',y:'Cost ($)',xm:10,f:[2,6],r:[1,3],dec:false,t:(f,rt)=>`A taxi charges a fixed fee of $${f} plus $${rt} for each kilometre.`,what:'cost',per:'the cost per kilometre',fixed:'the fixed fee'},
  {k:'plumber',xn:'time',xu:'hours',x:'Time (hours)',y:'Charge ($)',xm:6,f:[20,50,10],r:[10,30,5],t:(f,rt)=>`A plumber charges a call-out fee of $${f} plus $${rt} per hour.`,what:'charge',per:'the charge per hour',fixed:'the call-out fee'},
  {k:'tank',xn:'time',xu:'minutes',x:'Time (minutes)',y:'Water (litres)',xm:10,f:[10,40,5],r:[5,10],t:(f,rt)=>`A tank already holds ${f} litres of water. Water flows in at ${rt} litres per minute.`,what:'amount of water',per:'the number of litres added each minute',fixed:'the amount of water at the start'},
  {k:'candle',xn:'time',xu:'hours',x:'Time (hours)',y:'Height (cm)',xm:8,f:[18,30,2],r:[2,3],neg:true,t:(f,rt)=>`A candle is ${f} cm tall. It burns down ${rt} cm every hour.`,what:'height',per:'how many cm it burns each hour',fixed:'the height at the start'}];
const rng8=(r,a)=>a.length===3?r.int(a[0]/a[2],a[1]/a[2])*a[2]:r.int(a[0],a[1]);
G.y8_realLine=(r,lv)=>{
  if(lv===2){
    let x0,ra,rb,fa,fb;for(let t=0;t<100;t++){x0=r.int(2,8);ra=r.int(2,4);rb=r.int(1,ra-1);fa=r.int(1,6);fb=fa+(ra-rb)*x0;if(fb<=30)break}
    const ymax=Math.ceil((fb+rb*10)/5)*5,base={x0:0,x1:10,y0:0,y1:ymax,xs:1,ys:niceStep(ymax)/2,yl:niceStep(ymax),outer:true,xt:'Distance (km)',yt:'Cost ($)',H:300};
    const lines=[{m:ra,c:fa,color:Y8C.blue,label:'Company A'},{m:rb,c:fb,color:Y8C.orange,label:'Company B'}];
    return Qn({text:`Company A charges $${fa} plus $${ra} per km. Company B charges $${fb} plus $${rb} per km. The graph shows both. For what distance do both companies charge the <b>same</b>?`,svg:plotSvg({...base,lines}),label:'Distance =',unit:' km',ans:x0,
      steps:[`The charges are the same where the two lines <b>cross</b>.`,`Read down from the crossing point to the distance axis: <b>${x0} km</b> (both cost $${fa+ra*x0}).`,`Check with algebra: ${fa} + ${ra}d = ${fb} + ${rb}d → ${ra-rb}d = ${fb-fa} → d = <b>${x0}</b>.`],
      frames:[plotSvg({...base,lines,pts:[{x:x0,y:fa+ra*x0,color:Y8C.green,label:`(${x0}, ${fa+ra*x0})`}]}),plotSvg({...base,lines,pts:[{x:x0,y:fa+ra*x0,color:Y8C.green}],segs:[{a:[x0,fa+ra*x0],b:[x0,0],dash:'5 4',color:Y8C.green}]}),null],hint:'Where do the lines meet?'});
  }
  const C=pick(r,REAL),f=rng8(r,C.f),rt=rng8(r,C.r),m=C.neg?-rt:rt,xm=C.neg?Math.min(C.xm,Math.floor(f/rt)):C.xm;
  const ymax=C.neg?f+2:Math.ceil((f+rt*xm)/5)*5,ys=niceStep(ymax);
  const base={x0:0,x1:xm,y0:0,y1:ymax,xs:1,ys:ys/2>=1?ys/2:ys,yl:ys,outer:true,xt:C.x,yt:C.y,H:300,lines:[{m,c:f,to:C.neg?f/rt:undefined}]};
  if(lv===0){const x=r.int(2,xm-1),y=f+m*x;
    return Qn({text:`${C.t(f,rt)} The graph shows the ${C.what}. Use the graph to find the ${C.what} when the ${C.xn} is <b>${x} ${C.xu}</b>.`,svg:plotSvg(base),label:`${C.what[0].toUpperCase()+C.what.slice(1)} =`,ans:y,
      steps:[`Find ${x} ${C.xu} on the horizontal axis.`,`Go straight up to the line, then across to the vertical axis.`,`Read the value: <b>${y}</b>. (Check: ${f} ${C.neg?'−':'+'} ${rt} × ${x} = ${y}.)`],
      frames:[plotSvg({...base,pts:[{x,y:0,color:Y8C.green}]}),plotSvg({...base,segs:[{a:[x,0],b:[x,y],dash:'5 4',color:Y8C.green},{a:[x,y],b:[0,y],dash:'5 4',color:Y8C.green}],pts:[{x,y,color:Y8C.green}]}),null]})}
  const askRate=r.chance(.55),x2=C.neg?Math.min(xm,2):2;
  return Qn({text:`The graph shows the ${C.what}. ${C.k==='candle'?'The candle burns at a steady rate.':''} Use the graph to find <b>${askRate?C.per:C.fixed}</b>.`,svg:plotSvg(base),label:'Answer =',ans:askRate?rt:f,
    steps:askRate?[`The rate is the <b>gradient</b> of the line.`,`Read two points: (0, ${f}) and (${x2}, ${f+m*x2}).`,`Gradient = (${f+m*x2} − ${f}) ÷ ${x2} = ${M(m*x2)} ÷ ${x2} = ${M(m)}, so the answer is <b>${rt}</b>.`]
      :[`The fixed amount is where the line meets the <b>vertical axis</b> (when the ${C.xn} is 0).`,`The line starts at <b>${f}</b>.`],
    frames:askRate?[null,plotSvg({...base,pts:[{x:0,y:f,label:`(0, ${f})`},{x:x2,y:f+m*x2,label:`(${x2}, ${f+m*x2})`}]}),plotSvg({...base,tris:[{x:0,y:f,dx:x2,dy:m*x2,run:String(x2),rise:M(m*x2)}]})]:[null,plotSvg({...base,pts:[{x:0,y:f,label:`(0, ${f})`,color:Y8C.green}]})]});
};
G.y8_conversion=(r,lv)=>{
  const base={x0:0,x1:50,y0:0,y1:80,xs:5,ys:8,xl:10,yl:16,outer:true,xt:'Miles',yt:'Kilometres',H:300,lines:[{m:1.6,c:0}]};
  if(lv===0){const x=pick(r,[10,15,20,25,30,35,40,45]),y=x*1.6;return Qn({text:`The conversion graph changes miles into kilometres. Use it to convert <b>${x} miles</b> into kilometres.`,svg:plotSvg(base),label:'Distance =',unit:' km',ans:y,
    steps:[`Find ${x} miles on the horizontal axis and go up to the line.`,`Go across to the kilometres axis and read: <b>${y} km</b>.`],frames:[plotSvg({...base,segs:[{a:[x,0],b:[x,y],dash:'5 4',color:Y8C.green}]}),plotSvg({...base,segs:[{a:[x,0],b:[x,y],dash:'5 4',color:Y8C.green},{a:[x,y],b:[0,y],dash:'5 4',color:Y8C.green}],pts:[{x,y,color:Y8C.green}]})]})}
  if(lv===1){const y=pick(r,[16,24,32,40,48,56,64,72]),x=y/1.6;return Qn({text:`Use the conversion graph to change <b>${y} km</b> into miles.`,svg:plotSvg(base),label:'Distance =',unit:' miles',ans:x,
    steps:[`Find ${y} km on the vertical axis and go across to the line.`,`Go down to the miles axis and read: <b>${x} miles</b>.`],frames:[plotSvg({...base,segs:[{a:[0,y],b:[x,y],dash:'5 4',color:Y8C.green}]}),plotSvg({...base,segs:[{a:[0,y],b:[x,y],dash:'5 4',color:Y8C.green},{a:[x,y],b:[x,0],dash:'5 4',color:Y8C.green}],pts:[{x,y,color:Y8C.green}]})]})}
  const k=pick(r,[3,4,5,6]),x=50*k;return Qn({text:`The graph only goes up to 50 miles. Use it to convert <b>${x} miles</b> into kilometres.`,svg:plotSvg(base),label:'Distance =',unit:' km',ans:80*k,
    steps:[`Read a value you can see: 50 miles = 80 km.`,`${x} miles = ${k} × 50 miles.`,`So ${x} miles = ${k} × 80 = <b>${80*k} km</b>.`],frames:[plotSvg({...base,pts:[{x:50,y:80,color:Y8C.green,label:'(50, 80)',a:'end',dx:-8}]}),null,null]});
};

// =====================================================================
//  MODULE 2 — geometry
// =====================================================================
const PAIRS={corr:['corresponding','Corresponding angles are equal (F-shape).',true],alt:['alternate','Alternate angles are equal (Z-shape).',true],co:['co-interior','Co-interior angles add up to 180° (C-shape).',false],vo:['vertically opposite','Vertically opposite angles are equal.',true]};
function parPair(r,kind){
  const pos=['ar','al','bl','br'];
  if(kind==='corr'){const p=pick(r,pos);return [{at:'U',pos:p},{at:'L',pos:p}]}
  if(kind==='alt')return r.chance(.5)?[{at:'U',pos:'bl'},{at:'L',pos:'ar'}]:[{at:'U',pos:'br'},{at:'L',pos:'al'}];
  if(kind==='co')return r.chance(.5)?[{at:'U',pos:'bl'},{at:'L',pos:'al'}]:[{at:'U',pos:'br'},{at:'L',pos:'ar'}];
  const at=pick(r,['U','L']);return r.chance(.5)?[{at,pos:'ar'},{at,pos:'bl'}]:[{at,pos:'al'},{at,pos:'br'}];
}
const parVal=(th,pos)=>pos==='ar'||pos==='bl'?th:180-th;
const parTh=r=>{let t;do{t=r.int(35,145)}while(Math.abs(t-90)<12);return t};
G.y8_parallel=(r,lv)=>{
  const th=parTh(r),kind=lv===0?pick(r,['corr','alt']):lv===1?pick(r,['co','co','alt','corr']):pick(r,['corr','alt','co']);
  const [a,b]=r.shuffle(parPair(r,kind)),known=parVal(th,a.pos),target=parVal(th,b.pos),[nm,why,eq]=PAIRS[kind];
  if(lv<2){const marks=[{...a,label:`${known}°`},{...b,label:'x',unk:true}];
    return Qn({text:'The two horizontal lines are parallel. Find the size of angle <b>x</b>. Give a reason.',svg:parSvg(th,marks),label:'x =',unit:'°',ans:target,
      steps:[`x and ${known}° are <b>${nm}</b> angles.`,why,eq?`So x = <b>${target}°</b>`:`So x = 180° − ${known}° = <b>${target}°</b>`],frames:[parSvg(th,marks,{hl:true}),null,null],hint:'Look for an F, Z or C shape.'})}
  let k,c0,x;for(let t=0;t<100;t++){k=r.int(2,5);x=r.int(8,40);c0=target-k*x;if(c0!==0&&Math.abs(c0)<=60)break}
  const ex=`(${lin(k,c0)})°`,marks=[{...a,label:`${known}°`},{...b,label:ex,unk:true}];
  return Qn({text:'The two horizontal lines are parallel. Find the value of <b>x</b>.',svg:parSvg(th,marks),label:'x =',ans:x,
    steps:[`The two marked angles are <b>${nm}</b> angles. ${why}`,eq?`So ${lin(k,c0)} = ${known}`:`So ${lin(k,c0)} + ${known} = 180, which gives ${lin(k,c0)} = ${target}`,`${k}x = ${target} ${c0>0?'−':'+'} ${Math.abs(c0)} = ${k*x}`,`x = ${k*x} ÷ ${k} = <b>${x}</b>`],frames:[parSvg(th,marks,{hl:true}),null,null,null]});
};
G.y8_parallelPair=(r,lv)=>{
  const th=parTh(r),kind=pick(r,lv===0?['corr','alt','co']:['corr','alt','co','vo']),[a,b]=parPair(r,kind),[nm,why,eq]=PAIRS[kind];
  const marks=[{...a,label:'a'},{...b,label:'b',color:Y8C.orange}];
  if(lv<2)return mc8(r,'The horizontal lines are parallel. What type of angle pair are <b>a</b> and <b>b</b>?',nm[0].toUpperCase()+nm.slice(1),['Corresponding','Alternate','Co-interior','Vertically opposite'],[`Trace the lines that make the two angles.`,why],{svg:parSvg(th,marks),frames:[parSvg(th,marks,{hl:kind!=='vo'}),null]});
  return mc8(r,'The horizontal lines are parallel. Which statement about angles <b>a</b> and <b>b</b> is true?',eq?'a = b':'a + b = 180°',['a = b','a + b = 180°','a + b = 360°','a = 2b'],[`a and b are ${nm} angles.`,why],{svg:parSvg(th,marks),frames:[parSvg(th,marks,{hl:kind!=='vo'}),null]});
};
G.y8_triAlg=(r,lv)=>{
  for(let t=0;t<300;t++){
    let k,b,x,ang,eqTxt,equal=[];
    if(lv===0){k=[r.int(1,5),r.int(1,5),r.int(1,4)];const S=sum(k);if(180%S)continue;x=180/S;b=[0,0,0]}
    else if(lv===1){k=[r.int(1,3),r.int(1,2),1];x=r.int(15,50);b=[r.int(-4,8)*5,r.int(-4,8)*5,0];b[2]=180-sum(k)*x-b[0]-b[1];if(Math.abs(b[2])>60)continue}
    else{const a=r.int(1,3),c=r.int(1,3);x=r.int(12,40);const bb=r.int(-2,6)*5,d=180-2*(a*x+bb)-c*x;k=[a,a,c];b=[bb,bb,d];if(Math.abs(d)>60)continue;equal=[1,2]}
    ang=k.map((ki,i)=>ki*x+b[i]);if(ang.some(v=>v<18||v>140))continue;
    const ex=k.map((ki,i)=>b[i]===0?`${ki===1?'':ki}x`:lin(ki,b[i])),labels=ex.map(e=>(e.includes(' ')?`(${e})`:e)+'°');
    const S=sum(k),B=sum(b);
    const steps=[lv===2?'The dashes show an isosceles triangle, so the two base angles are equal. Angles in a triangle add up to 180°.':'Angles in a triangle add up to 180°.',
      `${labels.map(l=>l.replace('°','')).join(' + ')} = 180`,`Collect like terms: ${lin(S,B)} = 180`];
    if(B)steps.push(`${S}x = 180 ${B>0?'−':'+'} ${Math.abs(B)} = ${S*x}`);
    steps.push(`x = ${S*x} ÷ ${S} = <b>${x}</b>`,`Check: ${ang.join('° + ')}° = 180° ✓`);
    return Qn({text:`Find the value of <b>x</b>.`,svg:polyDiagram(ang,labels,[0,1,2],{equal}),label:'x =',ans:x,steps,hint:'Add the three expressions and set them equal to 180.'});
  }
};
G.y8_polyAngles=(r,lv)=>{
  if(lv===0){const n=pick(r,[5,6,8,9,10,12]),ext=360/n,askExt=r.chance(.5);return Qn({text:`Find the size of one <b>${askExt?'exterior':'interior'}</b> angle of a regular ${n}-sided polygon.`,label:'Angle =',unit:'°',ans:askExt?ext:180-ext,
    steps:[`The exterior angles of any polygon add up to 360°.`,`Exterior angle = 360° ÷ ${n} = ${ext}°`,...(askExt?[]:[`Interior + exterior = 180°, so interior = 180° − ${ext}° = <b>${180-ext}°</b>`])]})}
  if(lv===1){if(r.chance(.5)){const n=pick(r,[5,6,8,9,10,12,15,18,20]),ext=360/n;return Qn({text:`Each interior angle of a regular polygon is <b>${180-ext}°</b>. How many sides does it have?`,label:'Sides =',ans:n,steps:[`Exterior angle = 180° − ${180-ext}° = ${ext}°`,`Number of sides = 360° ÷ ${ext}° = <b>${n}</b>`]})}
    const n=r.int(5,12);return Qn({text:`Find the <b>sum of the interior angles</b> of a polygon with ${n} sides.`,label:'Sum =',unit:'°',ans:(n-2)*180,steps:[`A polygon with n sides splits into (n − 2) triangles from one vertex.`,`(${n} − 2) × 180° = ${n-2} × 180° = <b>${(n-2)*180}°</b>`]})}
  if(r.chance(.5)){const n=pick(r,[5,6]),S=(n-2)*180,a=Array.from({length:n-1},()=>r.int(95,150)),x=S-sum(a);if(x<60||x>175)return G.y8_polyAngles(r,lv);
    return Qn({text:`The interior angles of a ${n===5?'pentagon':'hexagon'} are ${a.map(v=>v+'°').join(', ')} and <b>x</b>. Find x.`,label:'x =',unit:'°',ans:x,steps:[`Sum of interior angles = (${n} − 2) × 180° = ${S}°`,`Known angles: ${a.join(' + ')} = ${sum(a)}°`,`x = ${S}° − ${sum(a)}° = <b>${x}°</b>`]})}
  const k=pick(r,[2,3,4,5,8]),ext=180/(k+1),n=360/ext;if(!Number.isInteger(n)||!Number.isInteger(ext))return G.y8_polyAngles(r,lv);
  return Qn({text:`In a regular polygon, each interior angle is <b>${k} times</b> the exterior angle. How many sides does the polygon have?`,label:'Sides =',ans:n,steps:[`Let the exterior angle be e. Then the interior angle is ${k}e.`,`Interior + exterior = 180°: ${k}e + e = 180°, so ${k+1}e = 180° and e = ${ext}°`,`Number of sides = 360° ÷ ${ext}° = <b>${n}</b>`]});
};
const QUADS=['Square','Rectangle','Rhombus','Parallelogram','Trapezium','Kite'];
const QFACTS=[
 [['Trapezium','exactly one pair of parallel sides'],['Square','four equal sides and four right angles'],['Rectangle','four right angles, but its sides are not all equal'],['Rhombus','four equal sides, but no right angles'],['Kite','two pairs of equal adjacent sides and no parallel sides'],['Parallelogram','two pairs of parallel sides, no right angles and adjacent sides of different lengths']],
 [['Rhombus','diagonals that cross at right angles and bisect each other, but are different lengths'],['Rectangle','diagonals that are equal and bisect each other, but do not cross at right angles'],['Kite','only one diagonal is bisected by the other, at right angles'],['Square','diagonals that are equal and cross at right angles']],
 [['Parallelogram','no lines of symmetry and rotational symmetry of order 2'],['Square','4 lines of symmetry'],['Rectangle','2 lines of symmetry and four right angles'],['Rhombus','2 lines of symmetry and no right angles'],['Kite','exactly 1 line of symmetry and no parallel sides']]];
G.y8_quadProps=(r,lv)=>{const [nm,f]=pick(r,QFACTS[lv]);return mc8(r,`Which quadrilateral has <b>${f}</b>?`,nm,r.shuffle(QUADS.filter(q=>q!==nm)),[`Check each property in turn.`,`A <b>${nm.toLowerCase()}</b> has ${f}.`])};
G.y8_bearing=(r,lv)=>{
  let b;do{b=r.int(12,348)}while(b%90<8||b%90>82);
  const ans=b,a3=`${pad3(b)}°`;
  if(lv===2){const bb=(b+180)%360;return Qn({text:`The bearing of B from A is <b>${a3}</b>. Find the bearing of <b>A from B</b>.`,svg:bearingSvg(b,{}),label:'Bearing =',unit:'°',ans:bb,ansStr:pad3(bb),
    steps:[`Draw a North line at B. The back bearing points the opposite way, so it differs by 180°.`,b<180?`${b}° + 180° = ${bb}°`:`${b}° − 180° = ${bb}°`,`Bearing of A from B = <b>${pad3(bb)}°</b>`],frames:[bearingSvg(b,{back:true}),null,null],hint:'Add 180° if the bearing is less than 180°, otherwise subtract 180°.'})}
  if(lv===0){if(b<180)return Qn({text:`Write the <b>bearing of B from A</b> as a three-figure bearing.`,svg:bearingSvg(b,{}),label:'Bearing =',unit:'°',ans,ansStr:pad3(b),steps:[`Bearings are measured <b>clockwise from North</b> and written with three figures.`,`The angle from North clockwise to B is ${b}°, so the bearing is <b>${a3}</b>.`]});
    const w=360-b;return Qn({text:`The angle between North and the line AB is ${w}°, measured <b>anticlockwise</b>. Find the bearing of B from A.`,svg:bearingSvg(b,{arc:'N',ang:w,lab:`${w}°`}).replace(`>${w}°<`,`>${w}°<`),label:'Bearing =',unit:'°',ans,ansStr:pad3(b),
      steps:[`Bearings are measured <b>clockwise</b> from North.`,`Clockwise angle = 360° − ${w}° = ${b}°`,`Bearing = <b>${a3}</b>`],frames:[null,bearingSvg(b,{}),null]})}
  const dir=((90-b)%360+360)%360,refs=[['N',90],['E',0],['S',270],['W',180]].map(([k,d])=>[k,Math.min(Math.abs(dir-d),360-Math.abs(dir-d))]).filter(([k])=>k!=='N').sort((x,y)=>x[1]-y[1]);
  const [ref,ang]=refs[0],word={E:'East',S:'South',W:'West'}[ref];
  return Qn({text:`B is ${ang}° from the <b>${word}</b> line, as shown. Find the bearing of B from A.`,svg:bearingSvg(b,{arc:ref,ang}),label:'Bearing =',unit:'°',ans,ansStr:pad3(b),
    steps:[`Bearings are measured clockwise from North. ${word} is on a bearing of ${({E:90,S:180,W:270})[ref]}°.`,`B is ${ang}° ${b>({E:90,S:180,W:270})[ref]?'clockwise':'anticlockwise'} from ${word}, so the bearing is ${({E:90,S:180,W:270})[ref]}° ${b>({E:90,S:180,W:270})[ref]?'+':'−'} ${ang}° = ${b}°`,`Bearing = <b>${a3}</b>`],frames:[null,bearingSvg(b,{}),null]});
};
const SHAPES8=[[[0,0],[2,0],[0,2]],[[0,0],[3,0],[0,1]],[[0,0],[2,0],[2,1],[1,1],[1,2],[0,2]],[[0,0],[1,0],[1,2],[0,1]],[[0,0],[3,0],[1,2]]];
const cv=(a,b)=>`<span class="cvec"><span>${M(a)}</span><span>${M(b)}</span></span>`;
const TR={
  tr:(a,b)=>({f:([x,y])=>[x+a,y+b],d:`Translation by the vector ${cv(a,b)}`,why:`Every point moves ${Math.abs(a)} ${a>=0?'right':'left'} and ${Math.abs(b)} ${b>=0?'up':'down'}.`,wr:[`Translation by the vector ${cv(b,a)}`,`Translation by the vector ${cv(-a,-b)}`,`Translation by the vector ${cv(a,-b)}`]}),
  rx:()=>({f:([x,y])=>[x,-y],d:'Reflection in the x-axis',mirror:{m:0,c:0},why:'Matching points are the same distance either side of the x-axis (y changes sign).',wr:['Reflection in the y-axis','Rotation 180° about (0, 0)','Reflection in the line y = x']}),
  ry:()=>({f:([x,y])=>[-x,y],d:'Reflection in the y-axis',vx:0,why:'Matching points are the same distance either side of the y-axis (x changes sign).',wr:['Reflection in the x-axis','Rotation 180° about (0, 0)','Rotation 90° clockwise about (0, 0)']}),
  vx:k=>({f:([x,y])=>[2*k-x,y],d:`Reflection in the line x = ${M(k)}`,vx:k,why:`The mirror line is halfway between matching points: the vertical line x = ${M(k)}.`,wr:[`Reflection in the line y = ${M(k)}`,`Reflection in the line x = ${M(-k)}`,'Reflection in the y-axis']}),
  hy:k=>({f:([x,y])=>[x,2*k-y],d:`Reflection in the line y = ${M(k)}`,mirror:{m:0,c:k},why:`The mirror line is halfway between matching points: the horizontal line y = ${M(k)}.`,wr:[`Reflection in the line x = ${M(k)}`,`Reflection in the line y = ${M(-k)}`,'Reflection in the x-axis']}),
  yx:()=>({f:([x,y])=>[y,x],d:'Reflection in the line y = x',mirror:{m:1,c:0},why:'Each point swaps its coordinates: (x, y) → (y, x).',wr:['Reflection in the line y = −x','Rotation 90° clockwise about (0, 0)','Reflection in the y-axis']}),
  r180:()=>({f:([x,y])=>[-x,-y],d:'Rotation 180° about (0, 0)',origin:true,why:'Both coordinates change sign: (x, y) → (−x, −y).',wr:['Reflection in the x-axis','Rotation 90° clockwise about (0, 0)','Reflection in the y-axis']}),
  cw:()=>({f:([x,y])=>[y,-x],d:'Rotation 90° clockwise about (0, 0)',origin:true,why:'A quarter turn clockwise about the origin: (x, y) → (y, −x).',wr:['Rotation 90° anticlockwise about (0, 0)','Rotation 180° about (0, 0)','Reflection in the line y = x']}),
  acw:()=>({f:([x,y])=>[-y,x],d:'Rotation 90° anticlockwise about (0, 0)',origin:true,why:'A quarter turn anticlockwise about the origin: (x, y) → (−y, x).',wr:['Rotation 90° clockwise about (0, 0)','Rotation 180° about (0, 0)','Reflection in the y-axis']}),
  en:k=>({f:([x,y])=>[k*x,k*y],d:`Enlargement, scale factor ${k}, centre (0, 0)`,rays:true,why:`Every distance from the origin is multiplied by ${k}: (x, y) → (${k}x, ${k}y).`,wr:[`Enlargement, scale factor ${k+1}, centre (0, 0)`,`Enlargement, scale factor ½, centre (0, 0)`,`Translation by the vector ${cv(k,k)}`]})};
function transformPick(r,lv){
  if(lv===0)return pick(r,[()=>TR.tr(nz(r,-5,5),nz(r,-4,4)),()=>TR.rx(),()=>TR.ry()])();
  if(lv===1)return pick(r,[()=>TR.vx(nz(r,-2,2)),()=>TR.hy(nz(r,-2,2)),()=>TR.yx(),()=>TR.r180()])();
  return pick(r,[()=>TR.cw(),()=>TR.acw(),()=>TR.en(pick(r,[2,3]))])();
}
G.y8_transform=(r,lv)=>{
  for(let t=0;t<200;t++){
    const T=transformPick(r,lv),sh=pick(r,SHAPES8),en=!!T.rays,ox=en?r.int(1,2):r.int(-5,3),oy=en?r.int(1,2):r.int(-5,3),obj=sh.map(([x,y])=>[x+ox,y+oy]),img=obj.map(T.f);
    const all=obj.concat(img),R=7;if(all.some(([x,y])=>Math.abs(x)>R||Math.abs(y)>R))continue;
    if(!en&&obj.some(p=>img.some(q=>q[0]===p[0]&&q[1]===p[1]))&&!T.origin)continue;
    const base={x0:-R,x1:R,y0:-R,y1:R,xl:2,yl:2,cls:'sq'},A=obj[0],A2=img[0];
    const polys=[{pts:obj,color:Y8C.blue,label:'A'},{pts:img,color:Y8C.orange,label:'B'}];
    const hl={...base,polys,pts:[{x:A[0],y:A[1],color:Y8C.blue,label:`(${M(A[0])}, ${M(A[1])})`},{x:A2[0],y:A2[1],color:Y8C.orange,label:`(${M(A2[0])}, ${M(A2[1])})`}]};
    const extra={...hl};
    if(T.mirror)extra.lines=[{...T.mirror,color:Y8C.green,dash:'7 5',w:2.4}];
    if(T.vx!==undefined)extra.segs=[{a:[T.vx,-R],b:[T.vx,R],color:Y8C.green,dash:'7 5',w:2.4}];
    if(T.rays)extra.segs=obj.map((p,i)=>({a:[0,0],b:img[i],color:Y8C.green,dash:'4 4',w:1.5}));
    if(T.origin)extra.pts=[...hl.pts,{x:0,y:0,color:Y8C.green,label:'centre (0, 0)',dy:14}];
    if(!T.mirror&&T.vx===undefined&&!T.rays&&!T.origin)extra.segs=[{a:A,b:A2,color:Y8C.green,w:2.4}];
    return mc8(r,'Describe fully the single transformation that maps shape <b>A</b> onto shape <b>B</b>.',T.d,T.wr,
      [`Compare a pair of matching vertices: (${M(A[0])}, ${M(A[1])}) → (${M(A2[0])}, ${M(A2[1])}).`,T.why,`So the transformation is: <b>${T.d}</b>.`],
      {svg:plotSvg({...base,polys}),frames:[plotSvg(hl),plotSvg(extra),null]});
  }
};

// =====================================================================
//  MODULE 3 — 3D shapes
// =====================================================================
G.y8_cuboid=(r,lv)=>{
  const l=r.int(3,12),w=r.int(2,8),h=r.int(2,9);
  if(lv===0)return Qn({text:`Find the <b>volume</b> of the cuboid.`,svg:cuboidSvg(l,w,h),label:'Volume =',unit:' cm³',ans:l*w*h,steps:[`Volume of a cuboid = length × width × height`,`= ${l} × ${w} × ${h}`,`= <b>${l*w*h} cm³</b>`]});
  if(lv===1)return Qn({text:`Find the <b>surface area</b> of the cuboid.`,svg:cuboidSvg(l,w,h),label:'Surface area =',unit:' cm²',ans:2*(l*w+l*h+w*h),
    steps:[`A cuboid has 3 pairs of identical faces.`,`Front and back: 2 × ${l} × ${h} = ${2*l*h} cm²`,`Top and bottom: 2 × ${l} × ${w} = ${2*l*w} cm²`,`Two ends: 2 × ${w} × ${h} = ${2*w*h} cm²`,`Total = ${2*l*h} + ${2*l*w} + ${2*w*h} = <b>${2*(l*w+l*h+w*h)} cm²</b>`]});
  if(r.chance(.5)){const s=r.int(2,9);return Qn({text:`A cube has a surface area of <b>${6*s*s} cm²</b>. Find its <b>volume</b>.`,label:'Volume =',unit:' cm³',ans:s**3,steps:[`A cube has 6 identical square faces. One face = ${6*s*s} ÷ 6 = ${s*s} cm²`,`Side length = √${s*s} = ${s} cm`,`Volume = ${s} × ${s} × ${s} = <b>${s**3} cm³</b>`]})}
  return Qn({text:`A cuboid has volume <b>${l*w*h} cm³</b>. Its length is ${l} cm and its width is ${w} cm. Find its <b>height</b>.`,label:'Height =',unit:' cm',ans:h,steps:[`Volume = length × width × height, so ${l*w*h} = ${l} × ${w} × h`,`${l*w*h} = ${l*w}h`,`h = ${l*w*h} ÷ ${l*w} = <b>${h} cm</b>`]});
};
G.y8_prism=(r,lv)=>{
  if(lv===0){let b,h;do{b=r.int(3,12);h=r.int(2,10)}while(b*h%2);const L=r.int(4,15),A=b*h/2;
    return Qn({text:`Find the <b>volume</b> of the triangular prism.`,svg:triPrismSvg(b,h,L),label:'Volume =',unit:' cm³',ans:A*L,steps:[`Volume of a prism = area of cross-section × length`,`Cross-section is a triangle: ½ × ${b} × ${h} = ${A} cm²`,`Volume = ${A} × ${L} = <b>${A*L} cm³</b>`]})}
  if(lv===1){let a,b,h;do{a=r.int(2,8);b=a+r.int(2,6);h=r.int(2,8)}while((a+b)*h%2);const L=r.int(4,12),A=(a+b)*h/2;
    return Qn({text:`The prism has a trapezium cross-section. Find its <b>volume</b>.`,svg:trapPrismSvg(a,b,h,L),label:'Volume =',unit:' cm³',ans:A*L,steps:[`Area of trapezium = ½ × (a + b) × h = ½ × (${a} + ${b}) × ${h} = ${A} cm²`,`Volume = area × length = ${A} × ${L} = <b>${A*L} cm³</b>`]})}
  const rr=r.int(2,9),h=r.int(3,15),V=Math.PI*rr*rr*h;
  return Qn({text:`Find the <b>volume</b> of the cylinder. Give your answer to 1 decimal place.`,svg:cylSvg(rr,h),label:'Volume =',unit:' cm³',ans:rd(V,1),tol:.051,ansStr:rd(V,1).toFixed(1),
    steps:[`A cylinder is a prism with a circular cross-section.`,`Area of circle = π × ${rr}² = ${rd(Math.PI*rr*rr,2)} cm²`,`Volume = ${rd(Math.PI*rr*rr,2)} × ${h} = ${rd(V,3)} ≈ <b>${rd(V,1).toFixed(1)} cm³</b>`]});
};
G.y8_netMC=(r,lv)=>{
  if(lv===2){const good=pick(r,CUBE_OK),bad=r.shuffle(CUBE_BAD).slice(0,3),nets=r.shuffle([good,...bad]),k=nets.indexOf(good);
    return MC('Only one of these nets folds to make a <b>cube</b>. Which one?',['Net A','Net B','Net C','Net D'],k,[`A cube net has 6 squares, with no 2 × 2 block and no more than 4 squares in a line.`,`Imagine folding each net: in the others two faces would overlap.`,`Net ${'ABCD'[k]} folds into a cube.`],{svg:fourNetsSvg(nets)})}
  const kind=lv===0?pick(r,['cube','cuboid','tri','pyr','tet','cyl']):pick(r,['cuboid','tri','pyr','tet']),[nm,F,E,V]=NET_SOLIDS[kind];
  if(lv===0)return mc8(r,'Which 3D shape can be made from this net?',nm[0].toUpperCase()+nm.slice(1),r.shuffle(Object.values(NET_SOLIDS).map(s=>s[0][0].toUpperCase()+s[0].slice(1))),[`Count the faces and look at their shapes.`,kind==='cyl'?'A rectangle and two circles make a cylinder.':`${F} faces: this net folds into a <b>${nm}</b>.`],{svg:netSvg(kind)});
  const q=pick(r,['faces','edges','vertices']),ans={faces:F,edges:E,vertices:V}[q];
  return Qn({text:`This net is folded to make a 3D shape. How many <b>${q}</b> will the shape have?`,svg:netSvg(kind),label:`${q[0].toUpperCase()+q.slice(1)} =`,ans,
    steps:[`The net folds into a ${nm}.`,`A ${nm} has ${F} faces, ${E} edges and ${V} vertices.`,`Check with Euler's rule: F + V − E = ${F} + ${V} − ${E} = 2 ✓`,`Number of ${q} = <b>${ans}</b>`]});
};
G.y8_netSA=(r,lv)=>{
  if(lv===0){const s=r.int(2,12);return Qn({text:`The net of a cube is shown. Each square has side ${s} cm. Find the <b>surface area</b> of the cube.`,svg:netSvg('cube',{s}),label:'Surface area =',unit:' cm²',ans:6*s*s,steps:[`The net is made of 6 identical squares.`,`Area of one square = ${s} × ${s} = ${s*s} cm²`,`Surface area = 6 × ${s*s} = <b>${6*s*s} cm²</b>`]})}
  if(lv===1){const l=r.int(4,9),w=r.int(2,4),h=r.int(2,6);return Qn({text:`The net of a cuboid is ${l} cm long, ${w} cm wide and ${h} cm high. Find the total area of the net (the surface area).`,svg:netSvg('cuboid',{l,w,h,labels:true,k:Math.min(10,90/(l+w))}),label:'Area =',unit:' cm²',ans:2*(l*w+l*h+w*h),
    steps:[`The net has 3 pairs of identical rectangles.`,`2 × (${l} × ${w}) = ${2*l*w}`,`2 × (${l} × ${h}) = ${2*l*h}`,`2 × (${w} × ${h}) = ${2*w*h}`,`Total = <b>${2*(l*w+l*h+w*h)} cm²</b>`]})}
  const k=r.int(1,3),a=3*k,b=4*k,c=5*k,L=r.int(5,15),T=a*b,R=(a+b+c)*L;
  return Qn({text:`A triangular prism has a right-angled triangle cross-section with sides ${a} cm, ${b} cm and ${c} cm. Its length is ${L} cm. Find its <b>surface area</b>.`,svg:triPrismSvg(a,b,L,'cm',true),label:'Surface area =',unit:' cm²',ans:T+R,
    steps:[`The net has 2 triangles and 3 rectangles.`,`Two triangles: 2 × ½ × ${a} × ${b} = ${T} cm²`,`Three rectangles: (${a} + ${b} + ${c}) × ${L} = ${R} cm²`,`Total = ${T} + ${R} = <b>${T+R} cm²</b>`]});
};
G.y8_volReal=(r,lv)=>{
  if(lv===0){const l=pick(r,[40,50,60,80,100]),w=pick(r,[20,25,30,40]),h=pick(r,[20,25,30,40,50]),V=l*w*h;
    return Qn({text:`A fish tank is a cuboid ${l} cm long, ${w} cm wide and ${h} cm high. How many <b>litres</b> of water does it hold when full? (1 litre = 1000 cm³)`,svg:cuboidSvg(l,w,h),label:'Capacity =',unit:' litres',ans:V/1000,steps:[`Volume = ${l} × ${w} × ${h} = ${pr(V)} cm³`,`1 litre = 1000 cm³, so divide by 1000.`,`${pr(V)} ÷ 1000 = <b>${V/1000} litres</b>`]})}
  if(lv===1){const a=pick(r,[5,10,20]),b=pick(r,[5,10,15]),c=pick(r,[4,5,10]),ka=r.int(2,6),kb=r.int(2,5),kc=r.int(2,4);
    return Qn({text:`Boxes measuring ${a} cm × ${b} cm × ${c} cm are packed into a crate ${a*ka} cm × ${b*kb} cm × ${c*kc} cm (the boxes all face the same way). How many boxes fit in the crate?`,svg:cuboidSvg(a*ka,b*kb,c*kc),label:'Boxes =',ans:ka*kb*kc,
      steps:[`Along the length: ${a*ka} ÷ ${a} = ${ka}`,`Along the width: ${b*kb} ÷ ${b} = ${kb}`,`Up the height: ${c*kc} ÷ ${c} = ${kc}`,`Number of boxes = ${ka} × ${kb} × ${kc} = <b>${ka*kb*kc}</b>`]})}
  for(let t=0;t<200;t++){const l=r.int(4,12),w=r.int(2,6),d=pick(r,[1,1.5,2]),rate=pick(r,[100,200,250,400,500]),V=rd(l*w*d),L=V*1000,mins=L/rate;
    if(!Number.isInteger(mins)||mins%30)continue;
    return Qn({text:`A paddling pool is a cuboid ${l} m long and ${w} m wide. It is filled to a depth of ${d} m. Water flows in at ${rate} litres per minute. How many <b>hours</b> does it take to fill? (1 m³ = 1000 litres)`,label:'Time =',unit:' hours',ans:mins/60,
      steps:[`Volume = ${l} × ${w} × ${d} = ${V} m³`,`In litres: ${V} × 1000 = ${pr(L)} litres`,`Time = ${pr(L)} ÷ ${rate} = ${mins} minutes`,`${mins} ÷ 60 = <b>${mins/60} hours</b>`]})}
};

// =====================================================================
//  MODULE 4 — ratio
// =====================================================================
const coprime=(r,lo,hi)=>{let p,q;do{p=r.int(lo,hi);q=r.int(lo,hi)}while(p===q||gcd(p,q)!==1);return [p,q]};
const rt=a=>a.join(' : ');
G.y8_ratioSimp=(r,lv)=>{
  if(lv===0){const [p,q]=coprime(r,1,9),k=r.int(2,12),a=p*k,b=q*k,f=[2,3,4,5,6].find(d=>k%d===0&&d<k);
    return mc8(r,`Write the ratio <b>${a} : ${b}</b> in its simplest form.`,rt([p,q]),[rt([q,p]),f?rt([a/f,b/f]):rt([p+1,q+1]),rt([a-b>0?a-b:b-a,q]),rt([p,q*2])],[`Find the highest common factor of ${a} and ${b}: HCF = ${k}.`,`Divide both parts by ${k}: ${a} ÷ ${k} = ${p} and ${b} ÷ ${k} = ${q}.`,`Simplest form: <b>${rt([p,q])}</b>`])}
  if(lv===1){const U=pick(r,[['cm','m',100],['g','kg',1000],['minutes','hour',60],['ml','litres',1000],['mm','cm',10]]),[p,q]=coprime(r,1,9);
    let big,small;for(let t=0;t<100;t++){const k=r.int(2,40);small=p*k;big=q*k;if(big%U[2]===0||(big*2)%U[2]===0)break}
    const bigU=rd(big/U[2],3),bigTxt=`${bigU} ${U[1]}`,k=gcd(small,big);
    return mc8(r,`Write <b>${small} ${U[0]} : ${bigTxt}</b> as a ratio in its simplest form.`,rt([small/k,big/k]),[rt([small/gcd(small,Math.round(bigU*10))*1,Math.round(bigU*10)/gcd(small,Math.round(bigU*10))]),rt([big/k,small/k]),rt([small,bigU]),rt([small/k,big/k*2])],
      [`Change to the same units: ${bigTxt} = ${big} ${U[0]}.`,`The ratio is ${small} : ${big}. HCF = ${k}.`,`Divide both parts by ${k}: <b>${rt([small/k,big/k])}</b> (no units in the answer).`])}
  if(r.chance(.5)){let p,q,s;do{p=r.int(1,6);q=r.int(1,6);s=r.int(1,6)}while(gcd(gcd(p,q),s)!==1||new Set([p,q,s]).size<3);const k=r.int(2,8);
    return mc8(r,`Simplify the ratio <b>${rt([p*k,q*k,s*k])}</b>.`,rt([p,q,s]),[rt([s,q,p]),rt([p*2,q*2,s*2]),rt([p,q,s+1]),rt([q,p,s])],[`HCF of ${p*k}, ${q*k} and ${s*k} is ${k}.`,`Divide every part by ${k}: <b>${rt([p,q,s])}</b>`])}
  const [p,q]=coprime(r,1,9),a=rd(p/10*pick(r,[1,2,5])),b=rd(a*q/p);if(!Number.isInteger(rd(b*10,6)))return G.y8_ratioSimp(r,lv);
  const A=Math.round(a*10),B=Math.round(b*10),k=gcd(A,B);
  return mc8(r,`Write the ratio <b>${a} : ${b}</b> in its simplest form using whole numbers.`,rt([A/k,B/k]),[rt([A,B]),rt([B/k,A/k]),rt([Math.round(a),Math.round(b)]),rt([A/k+1,B/k])],[`Multiply both parts by 10 to remove the decimals: ${A} : ${B}`,`HCF of ${A} and ${B} is ${k}.`,`Divide by ${k}: <b>${rt([A/k,B/k])}</b>`]);
};
G.y8_ratioOneN=(r,lv)=>{
  const a=pick(r,[2,4,5,8,10]),n=lv===0?r.int(2,9):lv===1?r.int(2,9)+.5:rd(r.int(5,40)/10*(a===8?1:1)),b=rd(a*n,4);
  if(!Number.isInteger(rd(b*100,6)))return G.y8_ratioOneN(r,0);
  return Qn({text:`Write the ratio <b>${a} : ${b}</b> in the form <b>1 : n</b>. What is n?`,label:'n =',ans:rd(b/a,4),steps:[`Divide both parts by the first number, ${a}.`,`${a} ÷ ${a} = 1 and ${b} ÷ ${a} = ${rd(b/a,4)}`,`So the ratio is 1 : <b>${rd(b/a,4)}</b>`]});
};
G.y8_ratioShare=(r,lv)=>{
  const names=pick(r,[['Amy','Ben','Cal'],['Sara','Tom','Uma'],['Lia','Max','Noor']]);
  if(lv===0){const [p,q]=coprime(r,1,7),k=pick(r,[3,4,5,6,8,10,12,15]),T=(p+q)*k,who=r.int(0,1);
    return Qn({text:`${names[0]} and ${names[1]} share <b>$${T}</b> in the ratio <b>${p} : ${q}</b>. How much does <b>${names[who]}</b> get?`,svg:ratioBarSvg([p,q],{names}),label:'Share = $',ans:[p,q][who]*k,
      steps:[`Total number of parts = ${p} + ${q} = ${p+q}`,`One part = $${T} ÷ ${p+q} = $${k}`,`${names[who]} gets ${[p,q][who]} parts: ${[p,q][who]} × $${k} = <b>$${[p,q][who]*k}</b>`],
      frames:[null,ratioBarSvg([p,q],{names,per:'$'+k}),ratioBarSvg([p,q],{names,per:'$'+k,shares:['$'+p*k,'$'+q*k]})]})}
  if(lv===1){let p,q,s;do{p=r.int(1,5);q=r.int(1,5);s=r.int(1,5)}while(new Set([p,q,s]).size<3);const k=pick(r,[2,4,5,6,10,20]),T=(p+q+s)*k,parts=[p,q,s],i=parts.indexOf(Math.max(...parts));
    return Qn({text:`${names.join(', ')} share <b>${T} sweets</b> in the ratio <b>${rt(parts)}</b>. How many sweets does ${names[i]} get?`,svg:ratioBarSvg(parts,{names}),label:'Sweets =',ans:parts[i]*k,
      steps:[`Total parts = ${parts.join(' + ')} = ${p+q+s}`,`One part = ${T} ÷ ${p+q+s} = ${k}`,`${names[i]}: ${parts[i]} × ${k} = <b>${parts[i]*k}</b>`],frames:[null,ratioBarSvg(parts,{names,per:k}),ratioBarSvg(parts,{names,per:k,shares:parts.map(x=>x*k)})]})}
  const [p,q]=coprime(r,1,9),k=r.int(3,15);
  if(r.chance(.5))return Qn({text:`${names[0]} and ${names[1]} share some money in the ratio <b>${p} : ${q}</b>. ${names[1]} gets <b>$${q*k}</b>. How much money is shared <b>altogether</b>?`,svg:ratioBarSvg([p,q],{names}),label:'Total = $',ans:(p+q)*k,
    steps:[`${names[1]}'s ${q} parts = $${q*k}, so one part = $${q*k} ÷ ${q} = $${k}`,`Total parts = ${p+q}`,`Total = ${p+q} × $${k} = <b>$${(p+q)*k}</b>`],frames:[ratioBarSvg([p,q],{names,per:'$'+k}),null,ratioBarSvg([p,q],{names,per:'$'+k,shares:['$'+p*k,'$'+q*k]})]});
  const d=Math.abs(p-q);if(!d)return G.y8_ratioShare(r,lv);
  return Qn({text:`${names[0]} and ${names[1]} share money in the ratio <b>${p} : ${q}</b>. ${p>q?names[0]:names[1]} gets <b>$${d*k}</b> more than ${p>q?names[1]:names[0]}. How much is shared altogether?`,svg:ratioBarSvg([p,q],{names}),label:'Total = $',ans:(p+q)*k,
    steps:[`The difference is ${d} part${d>1?'s':''} = $${d*k}, so one part = $${k}`,`Total parts = ${p+q}`,`Total = ${p+q} × $${k} = <b>$${(p+q)*k}</b>`],frames:[ratioBarSvg([p,q],{names,per:'$'+k}),null,ratioBarSvg([p,q],{names,per:'$'+k,shares:['$'+p*k,'$'+q*k]})]});
};
G.y8_scale=(r,lv)=>{
  const ing=pick(r,[['flour','g'],['rice','g'],['milk','ml'],['sugar','g']]);
  if(lv===0){const n=pick(r,[2,3,4,5]),f=r.int(2,4),q=pick(r,[50,75,100,120,150,200,250]);
    return Qn({text:`A recipe for ${n} people uses <b>${q} ${ing[1]} of ${ing[0]}</b>. How much ${ing[0]} is needed for <b>${n*f} people</b>?`,label:`${ing[0][0].toUpperCase()+ing[0].slice(1)} =`,unit:' '+ing[1],ans:q*f,steps:[`${n*f} people is ${f} times as many as ${n} people (${n*f} ÷ ${n} = ${f}).`,`Multiply the amount by ${f}: ${q} × ${f} = <b>${q*f} ${ing[1]}</b>`]})}
  if(lv===1){const pp=pick(r,[15,20,25,30,40,45,50,60,75]),n1=pick(r,[4,5,6,8]);let n2;do{n2=r.int(2,12)}while(n2===n1||n2%n1===0||n1%n2===0);
    return Qn({text:`A recipe for ${n1} people uses <b>${pp*n1} ${ing[1]} of ${ing[0]}</b>. How much ${ing[0]} is needed for <b>${n2} people</b>?`,label:`${ing[0][0].toUpperCase()+ing[0].slice(1)} =`,unit:' '+ing[1],ans:pp*n2,steps:[`Use the unitary method: first find the amount for 1 person.`,`1 person: ${pp*n1} ÷ ${n1} = ${pp} ${ing[1]}`,`${n2} people: ${pp} × ${n2} = <b>${pp*n2} ${ing[1]}</b>`]})}
  const s=pick(r,[25000,50000,200000]),dcm=pick(r,[2,3,4,5,6,7,8])+pick(r,[0,.5]),cm=dcm*s,km=rd(cm/100000,4);
  return Qn({text:`A map has a scale of <b>1 : ${pr(s)}</b>. Two villages are <b>${dcm} cm</b> apart on the map. What is the real distance in <b>km</b>?`,label:'Distance =',unit:' km',ans:km,steps:[`1 cm on the map is ${pr(s)} cm in real life.`,`${dcm} × ${pr(s)} = ${pr(cm)} cm`,`÷ 100 to get metres: ${pr(cm/100)} m; ÷ 1000 to get km: <b>${km} km</b>`]});
};
G.y8_bestBuy=(r,lv)=>{
  for(let t=0;t<300;t++){
    const n=lv===2?3:2,unit=pick(r,[['g',100],['ml',100]]),sizes=r.shuffle([200,250,300,400,500,600,750,800,1000]).slice(0,n);if(lv===0&&sizes[1]%sizes[0]&&sizes[0]%sizes[1])continue;
    const per=sizes.map(()=>rd(r.int(30,90)/100,2)),price=sizes.map((s,i)=>rd(per[i]*s/unit[1],6));if(price.some(p=>!Number.isInteger(rd(p*100,6))))continue;
    const best=per.indexOf(Math.min(...per));if(per.filter(p=>p===per[best]).length>1)continue;
    const L='ABC';
    return MC(`Which pack is the <b>best value</b>?<br>${sizes.map((s,i)=>`Pack ${L[i]}: ${s} ${unit[0]} for $${money(price[i])}`).join('<br>')}`,sizes.map((_,i)=>`Pack ${L[i]}`),best,
      [`Compare the price for the same amount: work out the cost of ${unit[1]} ${unit[0]} for each pack.`,...sizes.map((s,i)=>`Pack ${L[i]}: $${money(price[i])} ÷ ${s/unit[1]} = $${money(per[i])} per ${unit[1]} ${unit[0]}`),`The lowest cost per ${unit[1]} ${unit[0]} is <b>Pack ${L[best]}</b>.`]);
  }
};

// =====================================================================
//  MODULE 5 — statistics
// =====================================================================
const median8=a=>{const s=[...a].sort((x,y)=>x-y),n=s.length;return n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2};
G.y8_avg=(r,lv)=>{
  if(lv===0){const askMode=r.chance(.5),n=7;let d;
    for(let t=0;t<100;t++){d=Array.from({length:n},()=>r.int(2,20));const c={};d.forEach(v=>c[v]=(c[v]||0)+1);const mx=Math.max(...Object.values(c));if(!askMode||(mx>=2&&Object.values(c).filter(v=>v===mx).length===1))break}
    const s=[...d].sort((a,b)=>a-b),c={};d.forEach(v=>c[v]=(c[v]||0)+1),mode=+Object.keys(c).find(k=>c[k]===Math.max(...Object.values(c)));
    return askMode?Qn({text:`Find the <b>mode</b> of: ${lst(d)}`,label:'Mode =',ans:mode,steps:[`Order the data: ${lst(s)}`,`The mode is the value that appears most often: <b>${mode}</b> (${c[mode]} times).`]})
      :Qn({text:`Find the <b>range</b> of: ${lst(d)}`,label:'Range =',ans:s[n-1]-s[0],steps:[`Largest value = ${s[n-1]}, smallest value = ${s[0]}`,`Range = ${s[n-1]} − ${s[0]} = <b>${s[n-1]-s[0]}</b>`]})}
  if(lv===1){const n=pick(r,[6,8]),d=Array.from({length:n},()=>r.int(3,40)),s=[...d].sort((a,b)=>a-b),m=median8(d);
    return Qn({text:`Find the <b>median</b> of: ${lst(d)}`,label:'Median =',ans:m,steps:[`Order the data: ${lst(s)}`,`There are ${n} values (even), so the median is halfway between the ${ord(n/2)} and ${ord(n/2+1)} values: ${s[n/2-1]} and ${s[n/2]}.`,`Median = (${s[n/2-1]} + ${s[n/2]}) ÷ 2 = <b>${fmtNum(m)}</b>`]})}
  const n=pick(r,[5,6,7,8]),d=Array.from({length:n},()=>r.int(10,60)),S=sum(d),mean=S/n,ex=Number.isInteger(rd(mean*10,6));
  return Qn({text:`Find the <b>mean</b> of: ${lst(d)}${ex?'':' Give your answer to 1 decimal place.'}`,label:'Mean =',ans:rd(mean,1),tol:ex?1e-6:.051,ansStr:ex?fmtNum(rd(mean,1)):rd(mean,1).toFixed(1),
    steps:[`Add up all the values: ${d.join(' + ')} = ${S}`,`Divide by how many values there are (${n}): ${S} ÷ ${n} = ${fmtNum(rd(mean,4))}`,ex?`Mean = <b>${fmtNum(mean)}</b>`:`Mean ≈ <b>${rd(mean,1).toFixed(1)}</b> (1 d.p.)`]});
};
const FCTX=[['Number of goals','goals'],['Number of pets','pets'],['Number of brothers and sisters','siblings'],['Books read last month','books']];
G.y8_freqTable=(r,lv)=>{
  const [head]=pick(r,FCTX),vals=[0,1,2,3,4,5];let f;
  for(let t=0;t<200;t++){f=vals.map(()=>r.int(1,9));if(lv===0&&f.filter(v=>v===Math.max(...f)).length>1)continue;if(lv===1&&sum(f)%2===0)continue;break}
  const N=sum(f),tb=miniTable([[head,...vals],['Frequency',...f]]);
  if(lv===0){const mode=vals[f.indexOf(Math.max(...f))];return Qn({text:`The table shows the results of a survey.${tb}Find the <b>mode</b>.`,label:'Mode =',ans:mode,steps:[`The mode is the value with the highest frequency.`,`The highest frequency is ${Math.max(...f)}, for the value <b>${mode}</b>.`],hint:'Do not give the frequency — give the value!'})}
  if(lv===1){const pos=(N+1)/2;let c=0,med=0,cum=[];for(let i=0;i<6;i++){c+=f[i];cum.push(c);if(c>=pos&&!med&&med!==0)med=vals[i]}let m2=vals[cum.findIndex(x=>x>=pos)];
    return Qn({text:`The table shows the results of a survey.${tb}Find the <b>median</b>.`,label:'Median =',ans:m2,steps:[`Total frequency = ${N}, so the median is the ${ord(pos)} value ((${N} + 1) ÷ 2).`,`Running totals: ${cum.join(', ')}`,`The ${ord(pos)} value is in the group with value <b>${m2}</b>.`]})}
  const fx=f.map((v,i)=>v*vals[i]),S=sum(fx),mean=S/N;
  return Qn({text:`The table shows the results of a survey.${tb}Calculate the <b>mean</b>. Give your answer to 1 decimal place.`,label:'Mean =',ans:rd(mean,1),tol:.051,ansStr:rd(mean,1).toFixed(1),
    steps:[`Add a row for value × frequency (fx):${miniTable([[head,...vals],['f',...f],['fx',...fx]])}`,`Total of fx = ${S}; total frequency = ${N}`,`Mean = ${S} ÷ ${N} = ${rd(mean,3)} ≈ <b>${rd(mean,1).toFixed(1)}</b>`]});
};
G.y8_histRead=(r,lv)=>{
  const start=pick(r,[130,140,150]),b=[0,1,2,3,4,5].map(i=>start+i*10),f=[0,1,2,3,4].map(()=>r.int(2,14)),svg=histSvg(b,f,{xt:'Height (cm)'}),cls=i=>`${b[i]} – ${b[i+1]} cm`;
  if(lv===0){const i=r.int(0,4);return Qn({text:`The histogram shows the heights of some students. How many students have a height in the class <b>${cls(i)}</b>?`,svg,label:'Students =',ans:f[i],steps:[`Find the bar for ${cls(i)}.`,`Read across from the top of the bar to the frequency axis: <b>${f[i]}</b>`]})}
  if(lv===1){if(r.chance(.5)){const k=r.int(2,4);return Qn({text:`The histogram shows the heights of some students. How many students are taller than <b>${b[k]} cm</b>?`,svg,label:'Students =',ans:sum(f.slice(k)),steps:[`Add the frequencies of the bars to the right of ${b[k]} cm.`,`${f.slice(k).join(' + ')} = <b>${sum(f.slice(k))}</b>`]})}
    return Qn({text:`The histogram shows the heights of some students. How many students are there <b>altogether</b>?`,svg,label:'Students =',ans:sum(f),steps:[`Add the frequencies of all the bars.`,`${f.join(' + ')} = <b>${sum(f)}</b>`]})}
  const N=sum(f),pos=(N+1)/2;let c=0,k=0;for(;k<5;k++){c+=f[k];if(c>=pos)break}
  return MC(`The histogram shows the heights of ${N} students. Which class contains the <b>median</b> height?`,[0,1,2,3,4].map(cls),k,[`There are ${N} students, so the median is the ${ord(pos)} value${N%2?'':' (halfway between the middle two)'}.`,`Running totals: ${f.map((_,i)=>sum(f.slice(0,i+1))).join(', ')}`,`The ${ord(Math.ceil(pos))} value is in the class <b>${cls(k)}</b>.`],{svg});
};

// =====================================================================
//  MODULE 6 — probability
// =====================================================================
const WORDS=['Impossible','Unlikely','Even chance','Likely','Certain'];
G.y8_probVocab=(r,lv)=>{
  if(lv===0){const [p,w]=pick(r,[[0,0],['0.1',1],['0.2',1],['1/5',1],['0.3',1],['1/2',2],['0.5',2],['0.7',3],['0.85',3],['4/5',3],['1',4]]);
    return mc8(r,`An event has a probability of <b>${p}</b>. Which word best describes how likely it is?`,WORDS[w],WORDS,[`Probabilities go from 0 (impossible) to 1 (certain); ½ is an even chance.`,`${p} is ${w===0?'zero':w===4?'one':w===2?'exactly one half':w<2?'between 0 and ½':'between ½ and 1'}, so the event is <b>${WORDS[w].toLowerCase()}</b>.`])}
  if(lv===1){const ev=pick(r,[['a prime number',[2,3,5]],['a multiple of 3',[3,6]],['a number greater than 4',[5,6]],['an even number',[2,4,6]],['a factor of 6',[1,2,3,6]],['a square number',[1,4]]]);
    return Qn(Object.assign(fracAns(ev[1].length,6),{text:`A fair six-sided dice is rolled. Find the probability that it shows <b>${ev[0]}</b>.`,
      steps:[`P(event) = number of favourable outcomes ÷ total number of outcomes`,`Favourable outcomes: ${ev[1].join(', ')} → ${ev[1].length} outcomes out of 6`,`P = ${ev[1].length}/6 = <b>${frStr(ev[1].length,6)}</b>`]}))}
  let p;do{p=[r.int(1,6),r.int(1,6),r.int(1,6)].map(v=>v*5)}while(sum(p)>=95);const x=100-sum(p),cols=['Red','Blue','Green','Yellow'],i=r.int(0,3),pp=p.slice();pp.splice(i,0,'x');
  return Qn({text:`A spinner can land on four colours.${miniTable([['Colour',...cols],['Probability',...pp.map(v=>v==='x'?'<b>x</b>':rd(v/100,2))]])}Find the value of <b>x</b>.`,label:'x =',ans:x/100,
    steps:[`The probabilities of all the outcomes add up to 1.`,`${p.map(v=>rd(v/100,2)).join(' + ')} = ${rd(sum(p)/100,2)}`,`x = 1 − ${rd(sum(p)/100,2)} = <b>${rd(x/100,2)}</b>`]});
};
G.y8_relFreq=(r,lv)=>{
  if(lv===0){const N=pick(r,[20,25,40,50,80,100,200]),k=r.int(2,Math.floor(N*.6));return Qn(Object.assign(fracAns(k,N),{text:`A dice is rolled <b>${N}</b> times. It lands on six <b>${k}</b> times. What is the <b>relative frequency</b> of getting a six?`,
    steps:[`Relative frequency = number of times it happened ÷ number of trials`,`= ${k} ÷ ${N} = <b>${frStr(k,N)}</b> (= ${rd(k/N,4)})`]}))}
  if(lv===1){const N=pick(r,[20,25,40,50,100]),k=r.int(2,N-2),Mx=pick(r,[200,300,400,500,1000]);if(!Number.isInteger(Mx*k/N))return G.y8_relFreq(r,lv);
    return Qn({text:`A spinner is spun ${N} times and lands on red ${k} times. Estimate how many times it will land on red in <b>${Mx}</b> spins.`,label:'Red =',ans:Mx*k/N,steps:[`Relative frequency of red = ${k}/${N} = ${rd(k/N,4)}`,`Expected number ≈ relative frequency × number of spins`,`${rd(k/N,4)} × ${Mx} = <b>${Mx*k/N}</b>`]})}
  const N=[10,50,100,500],p=r.int(20,45)/100,k=N.map((n,i)=>i===3?Math.round(n*p):Math.max(1,Math.round(n*(p+r.int(-12,12)/100)))),rf=k.map((v,i)=>rd(v/N[i],3));
  const opts=[...new Set(rf.map(String))];if(opts.length<4)return G.y8_relFreq(r,lv);
  return MC(`Tia spins a spinner and records how often it lands on red.${miniTable([['Total spins',...N],['Number of reds',...k]])}Which is the <b>best estimate</b> of the probability of red?`,rf.map(String),3,[`Each relative frequency = reds ÷ spins: ${rf.join(', ')}`,`The more trials, the more reliable the estimate.`,`Best estimate: ${k[3]} ÷ 500 = <b>${rf[3]}</b>`]);
};
const ITEMS=[['dice',[1,2,3,4,5,6]],['four-sided spinner (1–4)',[1,2,3,4]],['three-sided spinner (1–3)',[1,2,3]]];
const ssTable=(A,B,fn,hl)=>`<table class="mini ss"><tr><th>${'+×'[fn==='sum'?0:1]}</th>${B.map(b=>`<th>${b}</th>`).join('')}</tr>${A.map(a=>`<tr><th>${a}</th>${B.map(b=>{const v=fn==='sum'?a+b:a*b;return `<td${hl&&hl(a,b,v)?' class="hl"':''}>${v}</td>`}).join('')}</tr>`).join('')}</table>`;
G.y8_sampleSpace=(r,lv)=>{
  const [nA,A]=pick(r,ITEMS),[nB,B]=pick(r,ITEMS.slice(1)),N=A.length*B.length;
  if(lv===0){if(r.chance(.4))return Qn({text:`A fair coin is thrown and a fair ${nA} is rolled/spun. How many outcomes are in the sample space?`,label:'Outcomes =',ans:2*A.length,steps:[`List them: ${['H','T'].map(c=>A.map(a=>c+a).join(', ')).join(', ')}`,`2 × ${A.length} = <b>${2*A.length}</b> outcomes`]});
    return Qn({text:`A ${nA} and a ${nB} are used together. How many different outcomes are possible?`,label:'Outcomes =',ans:N,steps:[`Draw a sample space diagram: ${A.length} rows and ${B.length} columns.${ssTable(A,B,'sum')}`,`Number of outcomes = ${A.length} × ${B.length} = <b>${N}</b>`]})}
  const fn=lv===1?'sum':pick(r,['sum','prod']);let cond,desc;
  if(fn==='sum'){if(lv===1){const t=r.int(4,A[A.length-1]+B[B.length-1]-1);cond=(a,b,v)=>v===t;desc=`the total is <b>${t}</b>`}else{const t=r.int(4,A[A.length-1]+B[B.length-1]-2);cond=(a,b,v)=>v>t;desc=`the total is <b>greater than ${t}</b>`}}
  else{const ev=r.chance(.5);cond=(a,b,v)=>ev?v%2===0:v%2===1;desc=`the product is <b>${ev?'even':'odd'}</b>`}
  const k=A.reduce((s,a)=>s+B.filter(b=>cond(a,b,fn==='sum'?a+b:a*b)).length,0);if(!k)return G.y8_sampleSpace(r,lv);
  return Qn(Object.assign(fracAns(k,N),{text:`A fair ${nA} and a fair ${nB} are used. The two scores are ${fn==='sum'?'added':'multiplied'}. Find the probability that ${desc}.`,
    steps:[`Draw a sample space diagram of all ${N} outcomes:${ssTable(A,B,fn)}`,`Highlight the outcomes where ${desc.replace(/<[^>]+>/g,'')}: ${ssTable(A,B,fn,cond)}`,`${k} out of ${N} outcomes, so P = ${k}/${N} = <b>${frStr(k,N)}</b>`]}));
};
G.y8_twoWay=(r,lv)=>{
  const cols=['Football','Swimming','Tennis'],B=cols.map(()=>r.int(3,15)),Gl=cols.map(()=>r.int(3,15)),TB=sum(B),TG=sum(Gl),Tc=cols.map((_,i)=>B[i]+Gl[i]),T=TB+TG;
  const show=(hide)=>miniTable([['',...cols,'Total'],['Boys',...B.map((v,i)=>hide==='b'+i?'<b>?</b>':v),TB],['Girls',...Gl.map((v,i)=>hide==='g'+i?'<b>?</b>':v),TG],['Total',...Tc,T]]);
  if(lv===0){const i=r.int(0,2),boy=r.chance(.5);return Qn({text:`The two-way table shows the favourite sport of some students.${show((boy?'b':'g')+i)}Find the missing number.`,label:'? =',ans:boy?B[i]:Gl[i],
    steps:boy?[`Use the column total for ${cols[i]}: ${Tc[i]} − ${Gl[i]} = <b>${B[i]}</b>`,`Check the row: ${B.join(' + ')} = ${TB} ✓`]:[`Use the column total for ${cols[i]}: ${Tc[i]} − ${B[i]} = <b>${Gl[i]}</b>`,`Check the row: ${Gl.join(' + ')} = ${TG} ✓`]})}
  const i=r.int(0,2),boy=r.chance(.5),n=boy?B[i]:Gl[i],grp=boy?'boy':'girl',tot=boy?TB:TG;
  if(lv===1)return Qn(Object.assign(fracAns(n,T),{text:`The two-way table shows the favourite sport of some students.${show()}A student is chosen at random. Find the probability that the student is a <b>${grp} who chose ${cols[i].toLowerCase()}</b>.`,steps:[`Total number of students = ${T}`,`Number of ${grp}s who chose ${cols[i].toLowerCase()} = ${n}`,`P = ${n}/${T} = <b>${frStr(n,T)}</b>`]}));
  return Qn(Object.assign(fracAns(n,tot),{text:`The two-way table shows the favourite sport of some students.${show()}A <b>${grp}</b> is chosen at random. Find the probability that they chose <b>${cols[i].toLowerCase()}</b>.`,steps:[`Only look at the ${grp}s: there are ${tot} of them.`,`${n} of the ${grp}s chose ${cols[i].toLowerCase()}.`,`P = ${n}/${tot} = <b>${frStr(n,tot)}</b>`]}));
};
G.y8_tree=(r,lv)=>{
  const d=v=>String(rd(v,4));
  if(lv<2){
    const p1=r.int(1,9)/10,p2=lv===0?p1:r.int(1,9)/10,q1=rd(1-p1),q2=rd(1-p2);
    const ctx=lv===0?{n1:['R','not R'],n2:['R','not R'],qs:['1st spin','2nd spin'],t:`A spinner lands on red with probability <b>${p1}</b>. It is spun twice.`}:{n1:['W','L'],n2:['W','L'],qs:['Game 1','Game 2'],t:`The probability that Ravi wins his first game is <b>${p1}</b>. The probability that he wins his second game is <b>${p2}</b>. The games are independent.`};
    const prods=[p1*p2,p1*q2,q1*p2,q1*q2].map(v=>rd(v,4)),o=ctx.n1.map(a=>ctx.n2.map(b=>`${a}, ${b}`)).flat();
    const ask=lv===0?pick(r,[[0],[3],[1,2]]):pick(r,[[1,2],[3],[0,1,2]]),what=lv===0?{0:'lands on red both times',3:'does not land on red either time','1,2':'lands on red exactly once'}[ask.join()]:{'1,2':'exactly one game','3':'neither game','0,1,2':'at least one game'}[ask.join()];
    const ans=rd(sum(ask.map(i=>prods[i])),4),base={n1:ctx.n1,n2:ctx.n2,qs:ctx.qs,p1:[d(p1),d(q1)],p2:[[d(p2),d(q2)],[d(p2),d(q2)]],out:o.map((x,i)=>`${x}: ${d(prods[i])}`)};
    return Qn({text:`${ctx.t} Use a tree diagram to find the probability that ${lv===0?'it ':'he wins '}<b>${what}</b>.`,svg:treeSvg({...base,show:0}),label:'P =',ans,
      steps:[`First branches: P = ${d(p1)}, so the other branch is 1 − ${d(p1)} = ${d(q1)}.`,`Second branches: ${d(p2)} and 1 − ${d(p2)} = ${d(q2)}.`,`Multiply along each path: ${o.map((x,i)=>`(${x}) = ${[d(p1),d(p1),d(q1),d(q1)][i]} × ${[d(p2),d(q2),d(p2),d(q2)][i]} = ${d(prods[i])}`).join('; ')}`,
        ask.length>1?`Add the paths you need: ${ask.map(i=>d(prods[i])).join(' + ')} = <b>${d(ans)}</b>`:`The path you need: <b>${d(ans)}</b>`],
      frames:[treeSvg({...base,show:1}),treeSvg({...base,show:2}),treeSvg({...base,show:3}),treeSvg({...base,show:3,hl:ask})],hint:'Multiply along the branches, add between the outcomes you want.'});
  }
  let R,B;do{R=r.int(2,7);B=r.int(2,7)}while(R+B>10);const n=R+B,same=r.chance(.5);
  const pr2=[[R*(R-1),R*B],[B*R,B*(B-1)]],den=n*(n-1),need=same?[0,3]:[1,2],k=same?pr2[0][0]+pr2[1][1]:pr2[0][1]+pr2[1][0];
  const base={n1:['R','B'],n2:['R','B'],qs:['1st counter','2nd counter'],p1:[`${R}/${n}`,`${B}/${n}`],p2:[[`${R-1}/${n-1}`,`${B}/${n-1}`],[`${R}/${n-1}`,`${B-1}/${n-1}`]],out:[`RR: ${pr2[0][0]}/${den}`,`RB: ${pr2[0][1]}/${den}`,`BR: ${pr2[1][0]}/${den}`,`BB: ${pr2[1][1]}/${den}`]};
  return Qn(Object.assign(fracAns(k,den),{text:`A bag has ${R} red and ${B} blue counters. Two counters are taken out <b>without replacement</b>. Find the probability that they are <b>${same?'the same colour':'different colours'}</b>.`,svg:treeSvg({...base,show:0}),
    steps:[`First counter: P(R) = ${R}/${n}, P(B) = ${B}/${n}.`,`Second counter: one counter has gone, so there are ${n-1} left and the numbers change.`,`Multiply along each path (fractions out of ${den}).`,`Add the paths you need: ${need.map(i=>[pr2[0][0],pr2[0][1],pr2[1][0],pr2[1][1]][i]).join(' + ')} = ${k}, so P = ${k}/${den} = <b>${frStr(k,den)}</b>`],
    frames:[treeSvg({...base,show:1}),treeSvg({...base,show:2}),treeSvg({...base,show:3}),treeSvg({...base,show:3,hl:need})]}));
};

// =====================================================================
//  MODULE 7 — algebraic sequences
// =====================================================================
const terms=(a,d,n)=>Array.from({length:n},(_,i)=>rd(a+d*i));
function nthText(d,b){return d===0?M(b):lin(d,b,'n')}
G.y8_seqTerm=(r,lv)=>{
  if(lv===0){const a=r.int(1,20),d=nz(r,-6,9),t=terms(a,d,6);return Qn({text:`The first term of a sequence is <b>${a}</b>. The term-to-term rule is <b>${d>0?'add '+d:'subtract '+(-d)}</b>. Find the <b>6th term</b>.`,label:'6th term =',ans:t[5],steps:[`Start at ${a} and keep ${d>0?'adding '+d:'subtracting '+(-d)}.`,`Terms: ${lst(t)}`,`6th term = <b>${M(t[5])}</b>`]})}
  if(lv===1){const [mul,add]=pick(r,[[2,1],[2,-1],[3,-2],[2,3],[3,1]]),a=r.int(1,5),t=[a];for(let i=1;i<5;i++)t.push(t[i-1]*mul+add);
    return Qn({text:`The first term of a sequence is <b>${a}</b>. The term-to-term rule is <b>multiply by ${mul}, then ${add>0?'add '+add:'subtract '+(-add)}</b>. Find the <b>5th term</b>.`,label:'5th term =',ans:t[4],steps:[...t.slice(1).map((v,i)=>`${ord(i+2)} term: ${t[i]} × ${mul} ${add>0?'+':'−'} ${Math.abs(add)} = ${v}`),`5th term = <b>${t[4]}</b>`]})}
  const a=r.int(30,90),d=r.int(3,9);let n=0;while(a-d*n>=0)n++;const t=terms(a,-d,n+1);
  return Qn({text:`A sequence starts at <b>${a}</b> and the rule is <b>subtract ${d}</b>. What is the <b>first negative term</b>?`,label:'Term =',ans:a-d*n,steps:[`Keep subtracting ${d}: ${lst(t)}`,`The first negative term is <b>${M(a-d*n)}</b>.`,`(Quick way: ${a} ÷ ${d} = ${rd(a/d,2)}, so after ${n} subtractions we pass 0.)`]});
};
G.y8_seqArith=(r,lv)=>{
  if(lv===0){const a=r.int(1,9),d=r.int(2,7),A=terms(a,d,5),Gm=[a,a*2,a*4,a*8,a*16],Sq=[1,4,9,16,25],Tr=[1,3,6,10,15],Fb=[1,1,2,3,5];
    return mc8(r,'Which of these is an <b>arithmetic</b> sequence?',lst(A)+', …',[Gm,Sq,Tr,Fb].map(s=>lst(s)+', …'),[`In an arithmetic sequence the terms go up or down by the <b>same amount</b> each time (the common difference).`,`${lst(A)}: the difference is always ${d}, so this one is arithmetic.`])}
  if(lv===1){const decm=r.chance(.4),a=decm?rd(r.int(10,60)/10,1):r.int(-10,30),d=decm?rd(nz(r,-9,9)/10,1):nz(r,-8,8),t=terms(a,d,5);
    return Qn({text:`What is the <b>common difference</b> of the arithmetic sequence ${lst(t)}, …?`,label:'d =',ans:d,steps:[`Subtract a term from the next term: ${M(t[1])} − ${sg(t[0])} = ${M(d)}`,`Check: ${M(t[2])} − ${sg(t[1])} = ${M(d)} ✓ so d = <b>${M(d)}</b>`]})}
  const a=r.int(-5,20),d=nz(r,-7,9),t=terms(a,d,4),k=r.int(1,2);
  return Qn({text:`These are the first four terms of an arithmetic sequence: <b>${M(t[0])}, ☐, ☐, ${M(t[3])}</b>. Find the ${k===1?'second':'third'} term.`,label:'Term =',ans:t[k],steps:[`From the 1st term to the 4th term there are 3 equal steps.`,`3d = ${M(t[3])} − ${sg(t[0])} = ${M(3*d)}, so d = ${M(d)}`,`The terms are ${lst(t)}, so the ${k===1?'second':'third'} term is <b>${M(t[k])}</b>.`]});
};
G.y8_nthMC=(r,lv)=>{
  let d,b,given,steps0=[];
  if(lv===0){d=r.int(2,8);b=r.int(-5,9);given=`<b>${lst(terms(d+b,d,4))}, …</b>`}
  else if(lv===1){d=-r.int(2,6);b=r.int(15,40);given=`<b>${lst(terms(d+b,d,4))}, …</b>`}
  else{d=r.int(2,7);b=r.int(-6,9);const i=r.int(3,6),j=i+r.int(2,5);given=`a sequence whose <b>${ord(i)} term is ${d*i+b}</b> and <b>${ord(j)} term is ${d*j+b}</b>`;steps0=[`From the ${ord(i)} to the ${ord(j)} term there are ${j-i} steps: ${d*j+b} − ${d*i+b} = ${d*(j-i)}, so d = ${d*(j-i)} ÷ ${j-i} = ${d}.`]}
  const a=d+b,fx=d<0?`${b} − ${-d===1?'':-d}n`:nthText(d,b);
  const wr=[d<0?`${a} − ${-d}n`:nthText(d,a),d<0?nthText(-d,b):nthText(a,d),d<0?`${b} + ${-d}n`:nthText(d+1,b-1),nthText(1,d+ (d>0?b:0))];
  return mc8(r,`Which expression gives the <b>nth term</b> of ${given}?`,fx,wr,
    [...steps0,...(lv<2?[`The terms ${d>0?'go up':'go down'} by ${Math.abs(d)} each time, so the common difference is ${M(d)} and the rule contains <b>${M(d)}n</b>.`]:[`So the rule contains <b>${M(d)}n</b>.`]),
     `${M(d)}n gives ${lst(terms(d,d,3))}, …; the sequence is ${b>=0?b:-b} ${b>=0?'more':'less'} each time.`,`nth term = <b>${fx}</b>. Check n = 1: ${M(d)} ${b>=0?'+':'−'} ${Math.abs(b)} = ${a} ✓`]);
};
G.y8_nthPattern=(r,lv)=>{
  const [kind,d,b,name]=pick(r,[['sq',3,1,'squares'],['tri',2,1,'triangles'],['house',5,1,'houses']]),f=n=>d*n+b,svg=sticksSvg(kind);
  if(lv===0)return Qn({text:`Matchsticks are used to make patterns of ${name}. How many matchsticks are needed for <b>Pattern 4</b>?`,svg,label:'Matchsticks =',ans:f(4),steps:[`Count the matchsticks: ${f(1)}, ${f(2)}, ${f(3)}`,`Each pattern uses ${d} more matchsticks.`,`Pattern 4: ${f(3)} + ${d} = <b>${f(4)}</b>`]});
  if(lv===1){const n=r.int(12,40);return Qn({text:`Matchsticks are used to make patterns of ${name}. How many matchsticks are needed for <b>Pattern ${n}</b>?`,svg,label:'Matchsticks =',ans:f(n),steps:[`Sequence: ${f(1)}, ${f(2)}, ${f(3)}, … The common difference is ${d}.`,`nth term = ${d}n + ${b} (check: n = 1 gives ${f(1)} ✓)`,`Pattern ${n}: ${d} × ${n} + ${b} = <b>${f(n)}</b>`]})}
  const n=r.int(15,60);return Qn({text:`Matchsticks are used to make patterns of ${name}. Which pattern uses exactly <b>${f(n)}</b> matchsticks?`,svg,label:'Pattern',ans:n,steps:[`Sequence: ${f(1)}, ${f(2)}, ${f(3)}, … so the nth term is ${d}n + ${b}.`,`Solve ${d}n + ${b} = ${f(n)} → ${d}n = ${f(n)-b}`,`n = ${f(n)-b} ÷ ${d} = <b>${n}</b>`]});
};
