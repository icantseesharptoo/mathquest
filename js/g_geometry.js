/* Problem generators: geometry, measure, trigonometry, transformations. */
const PI=3.14;
const D2R=Math.PI/180;
const sinD=a=>Math.sin(a*D2R),cosD=a=>Math.cos(a*D2R),tanD=a=>Math.tan(a*D2R);
const asinD=x=>Math.asin(x)/D2R,acosD=x=>Math.acos(x)/D2R,atanD=x=>Math.atan(x)/D2R;
const tolR=(v,rel=.004,abs=.06)=>Math.abs(v)*rel+abs;           // accepted error for rounded answers

// ---- parallel lines figure ----
function parallelSvg(theta,gReg,uReg,gLab,uLab){
  const y1=70,y2=160,cx=170,E=Ext(),s=[];
  const dx=(y2-y1)/tanD(theta),T1=[cx,y1],T2=[cx-dx,y2];
  s.push(`<line x1="20" y1="${y1}" x2="320" y2="${y1}" stroke="#111827" stroke-width="2.6"/><line x1="20" y1="${y2}" x2="320" y2="${y2}" stroke="#111827" stroke-width="2.6"/>`);
  [y1,y2].forEach(y=>s.push(`<polyline points="276,${y-6} 284,${y} 276,${y+6}" fill="none" stroke="#111827" stroke-width="2"/>`));
  const dirx=cosD(theta),diry=-sinD(theta),ext=55;
  const a=[T1[0]-dirx*ext,T1[1]-diry*ext],b=[T2[0]+dirx*ext,T2[1]+diry*ext];   // top end (up-right) and bottom end (down-left)
  const top=[T1[0]+dirx*ext,T1[1]+diry*ext],bot=[T2[0]-dirx*ext,T2[1]-diry*ext];
  s.push(`<line x1="${f1(top[0])}" y1="${f1(top[1])}" x2="${f1(bot[0])}" y2="${f1(bot[1])}" stroke="#111827" stroke-width="2.6"/>`);
  [[20,y1],[320,y2],top,bot].forEach(p=>E.add(p[0],p[1]));
  const val=k=>(k===1||k===3)?theta:180-theta,mid=k=>[theta/2,(theta+180)/2,180+theta/2,(180+theta+360)/2][k-1],span=k=>val(k);
  const place=(T,k,lab,unk)=>{const sp=span(k),fs=unk?19:16,w=boxW(lab,fs);const rr=Math.min(78,Math.max(40,(w/2+10)/Math.sin(rad(sp/2))));
    const [x,y]=P(T[0],T[1],rr,mid(k));s.push(`<path d="${arcPath(T[0],T[1],20,mid(k)-sp/2,mid(k)+sp/2)}" fill="none" stroke="${unk?COL_UNK:COL_ARC}" stroke-width="2.4"/>`+txt(x,y,lab,unk,fs));E.add(x,y,w,fs+4)};
  place(T1,gReg,gLab,false);place(T2,uReg,uLab,true);
  return svgFit(s.join(''),E);
}
function exteriorSvg(aLab,bLab,extLab,unk){
  const E=Ext(),B=[40,170],C=[200,170],A=[110,50],D=[290,170];let s=`<polygon points="${B} ${C} ${A}" fill="#eef2ff" stroke="#111827" stroke-width="2.6"/><line x1="${C[0]}" y1="170" x2="${D[0]}" y2="170" stroke="#111827" stroke-width="2.6"/>`;
  [B,C,A,D].forEach(p=>E.add(p[0],p[1]));
  const items=[[A[0],A[1]+34,aLab,unk==='a'],[B[0]+42,B[1]-12,bLab,unk==='b'],[C[0]+46,C[1]-20,extLab,unk==='e']];
  items.forEach(([x,y,l,u])=>{if(l){s+=txt(x,y,l,u,u?19:16);E.add(x,y,boxW(l,16),20)}});
  s+=`<path d="${arcPath(C[0],C[1],26,0,126.9)}" fill="none" stroke="${COL_UNK}" stroke-width="2.4"/>`;
  return svgFit(s,E);
}
// right-angled triangle with labelled sides (bottom leg, vertical leg, hypotenuse) and an angle at the bottom-right corner
function rightTri(legB,legV,labB,labV,labH,labA){
  const sc=Math.min(230/legB,170/legV),W=legB*sc,H=legV*sc,E=Ext(),P0=[0,H],Q=[W,H],R=[0,0];
  let s=`<polygon points="${P0} ${Q} ${R}" fill="#eef2ff" stroke="#111827" stroke-width="2.6" stroke-linejoin="round"/><polyline points="0,${H-16} 16,${H-16} 16,${H}" fill="none" stroke="#111827" stroke-width="2"/>`;
  [P0,Q,R].forEach(p=>E.add(p[0],p[1]));
  const hl=Math.hypot(W,H),nx=H/hl,ny=W/hl;                         // outward normal of the hypotenuse
  const put=(x,y,l,anchor)=>{if(!l)return;const u=/x|\?/.test(l);s+=txt(x,y,l,u,u?19:16,anchor);const w=boxW(l,16);E.add(anchor==='end'?x-w:anchor==='start'?x+w:x,y,anchor==='middle'?w:w*2,20)};
  put(W/2,H+20,labB,'middle');put(-9,H/2,labV,'end');put(W/2+nx*26,H/2-ny*26+0,labH,'middle');
  if(labA){
    const ang=atanD(legV/legB),w=boxW(labA,19),h2=23;
    s+=`<path d="M${f1(W-26*cosD(ang))},${f1(H-26*sinD(ang))} A26,26 0 0 1 ${f1(W-26)},${f1(H)}" fill="none" stroke="${COL_UNK}" stroke-width="2.6"/>`;
    const ux=-1-W/hl,uy=-H/hl,ul=Math.hypot(ux,uy),bx=ux/ul,by=uy/ul;                 // inward bisector at the corner
    const d=Math.max(40,(w/2+10)/Math.sin(rad(ang/2))),lx=W+bx*d,ly=H+by*d;
    const inside=lx-w/2>8&&ly+h2/2<H-6&&ly-h2/2>H*(lx+w/2)/W+4;
    if(inside){put(lx,ly,labA,'middle')}else{put(W+34+w/2,H-12,labA,'middle')}
  }
  return svgFit(s,E);
}

G.anglesBasic=(r,lv)=>{const kind=pick(r,['line','point']),n=lv+2,T=kind==='line'?180:360,vals=partition(r,n,T,kind==='line'?25:40,kind==='line'?140:170,5);if(!vals)return G.anglesBasic(r,lv);const unk=r.int(0,n-1),labels=vals.map((v,i)=>i===unk?'x°':v+'°');
  const svg=kind==='line'?raysDiagram({cx:130,cy:150,R:112,parts:vals,labels,unk,line:true,lr:64}):raysDiagram({cx:130,cy:92,R:82,start:r.int(0,359),parts:vals,labels,unk,lr:50});
  return Qn({text:'Find the size of angle <b>x</b>.',svg,label:'x =',unit:'°',ans:vals[unk],steps:[kind==='line'?'Angles on a straight line add up to 180°.':'Angles around a point add up to 360°.',`x = ${T} − ${vals.filter((v,i)=>i!==unk).join(' − ')} = <b>${vals[unk]}°</b>`]})};
G.anglesVO=(r,lv)=>{const a=r.int(35,145),parts=[a,180-a,a,180-a],g=r.int(0,3),adj=lv>0&&r.chance(.6),u=adj?(g+1)%4:(g+2)%4;const labels=parts.map((p,i)=>i===g?a+'°':i===u?'x°':'');return Qn({text:'Two straight lines cross. Find the size of angle <b>x</b>.',svg:raysDiagram({cx:130,cy:90,R:92,start:r.int(0,50),parts,labels,unk:[u],lr:50,ar:22}),label:'x =',unit:'°',ans:adj?180-a:a,steps:[adj?'Angles on a straight line add up to 180°.':'Vertically opposite angles are equal.',`x = <b>${adj?180-a:a}°</b>`]})};
G.parallelAngles=(r,lv)=>{const theta=pick(r,[45,50,55,60,65,120,125,130,135]),kind=pick(r,['corresponding','alternate','co-interior']);let g,u;if(kind==='corresponding'){g=pick(r,[1,2,3,4]);u=g}else if(kind==='alternate'){g=pick(r,[3,4]);u=g===4?2:1}else{g=pick(r,[3,4]);u=g===4?1:2}
  const val=k=>(k===1||k===3)?theta:180-theta;if(kind==='alternate'&&val(g)!==val(u))return G.parallelAngles(r,lv);
  const ans=kind==='co-interior'?180-val(g):val(g);const rule={corresponding:'Corresponding angles are equal.',alternate:'Alternate angles are equal.','co-interior':'Co-interior angles add up to 180°.'}[kind];
  return Qn({text:'The two horizontal lines are parallel. Find the size of angle <b>x</b>.',svg:parallelSvg(theta,g,u,val(g)+'°','x°'),label:'x =',unit:'°',ans,steps:[rule,kind==='co-interior'?`x = 180° − ${val(g)}° = <b>${ans}°</b>`:`x = <b>${ans}°</b>`],hint:'Look for an F, Z or C shape.'})};
G.exterior=(r,lv)=>{const a=r.int(30,80),b=r.int(30,80),ext=a+b;if(lv===0)return Qn({text:`The exterior angle of a triangle equals the sum of the two opposite interior angles. Find the exterior angle <b>x</b>.`,svg:exteriorSvg(a+'°',b+'°','x°','e'),label:'x =',unit:'°',ans:ext,steps:[`x = ${a}° + ${b}° = <b>${ext}°</b>`]});
  return Qn({text:`Find the angle <b>x</b>.`,svg:exteriorSvg('x°',b+'°',ext+'°','a'),label:'x =',unit:'°',ans:a,steps:[`Exterior angle = sum of the two opposite interior angles`,`x = ${ext}° − ${b}° = <b>${a}°</b>`]})};
G.triAngle=(r,lv)=>{if(lv===0||lv===1){const v=partition(r,3,180,30,110,5);const unk=r.int(0,2);return Qn({text:'Find the size of angle <b>x</b>.',svg:polyDiagram(v,v.map((x,i)=>i===unk?'x°':x+'°'),unk,{r}),label:'x =',unit:'°',ans:v[unk],steps:['Angles in a triangle add up to 180°.',`x = <b>${v[unk]}°</b>`]})}
  const base=r.int(35,75),apex=180-2*base,showApex=r.chance(.5);return Qn({text:'This is an isosceles triangle (the dashes show equal sides). Find <b>x</b>.',svg:polyDiagram([base,base,apex],showApex?['x°','',apex+'°']:[base+'°','','x°'],showApex?[0]:[2],{equal:[1,2]}),label:'x =',unit:'°',ans:showApex?base:apex,steps:['Base angles of an isosceles triangle are equal.',showApex?`2x = 180° − ${apex}° → x = <b>${base}°</b>`:`x = 180° − 2 × ${base}° = <b>${apex}°</b>`]})};
G.quadAngle=(r,lv)=>{const v=partition(r,4,360,55,140,5);if(!v)return G.quadAngle(r,lv);const unk=r.int(0,3);return Qn({text:'Find the size of angle <b>x</b>.',svg:polyDiagram(v,v.map((x,i)=>i===unk?'x°':x+'°'),unk,{r}),label:'x =',unit:'°',ans:v[unk],steps:['Angles in a quadrilateral add up to 360°.',`x = <b>${v[unk]}°</b>`]})};
G.polygon=(r,lv)=>{const n=r.int(5,12),m=pick(r,[5,6,8,9,10,12]),q=r.int(0,2);if(q===0)return Qn({text:`Find the sum of the interior angles of a polygon with <b>${n} sides</b>.`,label:'Sum =',unit:'°',ans:(n-2)*180,steps:[`(${n} − 2) × 180° = <b>${(n-2)*180}°</b>`]});
  if(q===1)return Qn({text:`Find the size of <b>one interior angle</b> of a regular polygon with ${m} sides.`,label:'Angle =',unit:'°',ans:(m-2)*180/m,steps:[`(${m} − 2) × 180° ÷ ${m} = <b>${(m-2)*180/m}°</b>`]});
  const k=pick(r,[5,6,8,9,10,12,15,18,20]);return Qn({text:`Each exterior angle of a regular polygon is <b>${360/k}°</b>. How many sides does it have?`,label:'Sides =',ans:k,steps:[`360° ÷ ${360/k}° = <b>${k}</b>`]})};
G.circleCalc=(r,lv)=>{const d=r.int(4,30),q=r.int(0,2);const rad_=d/2;if(q===0)return Qn({text:`A circle has diameter ${d} cm. Find its <b>circumference</b>. Use π = 3.14.`,label:'C =',unit:' cm',ans:rd(PI*d,2),tol:.011,steps:[`C = πd = 3.14 × ${d} = <b>${rd(PI*d,2)}</b>`]});
  if(q===1)return Qn({text:`A circle has radius ${rad_} cm. Find its <b>area</b>. Use π = 3.14.`,label:'A =',unit:' cm²',ans:rd(PI*rad_*rad_,2),tol:.011,steps:[`A = πr² = 3.14 × ${rad_}² = <b>${rd(PI*rad_*rad_,2)}</b>`]});
  return Qn({text:`The circumference of a circle is ${rd(PI*d,2)} cm. Find its <b>diameter</b>. Use π = 3.14.`,label:'d =',unit:' cm',ans:d,tol:.011,steps:[`d = C ÷ π = ${rd(PI*d,2)} ÷ 3.14 = <b>${d}</b>`]})};
G.bearing=(r,lv)=>{const b=r.int(10,350);const back=(b+180)%360;if(lv===0)return Qn({text:`The bearing of B from A is <b>${String(b).padStart(3,'0')}°</b>. Find the bearing of <b>A from B</b>.`,label:'Bearing =',unit:'°',ans:back,steps:[b<180?`${b}° + 180° = ${back}°`:`${b}° − 180° = ${back}°`,`<b>${String(back).padStart(3,'0')}°</b>`]});
  const d=r.int(3,8);return Qn({text:`A ship sails ${d} km on a bearing of 090° then ${d} km on a bearing of 180°. What is the bearing of its <b>starting point from its final position</b>?`,label:'Bearing =',unit:'°',ans:315,steps:[`The ship ends ${d} km east and ${d} km south of the start.`,`From the end, the start is north-west: <b>315°</b>`]})};
G.milesKm=(r,lv)=>{const k=r.int(2,12)*5,toKm=r.chance(.5);return Qn({text:toKm?`5 miles = 8 km. Convert <b>${k} miles</b> to kilometres.`:`5 miles = 8 km. Convert <b>${k*8/5} km</b> to miles.`,label:toKm?'km =':'miles =',ans:toKm?k*8/5:k,steps:[toKm?`${k} ÷ 5 × 8 = <b>${k*8/5}</b>`:`${k*8/5} ÷ 8 × 5 = <b>${k}</b>`]})};
G.scaleDraw=(r,lv)=>{const sc=pick(r,[20,50,100,200,500,1000]),d=r.int(3,15);return Qn({text:`A plan has scale 1 : ${sc}. A wall is ${d} cm long on the plan. How long is the real wall in <b>metres</b>?`,label:'Length =',unit:' m',ans:d*sc/100,steps:[`${d} × ${sc} = ${d*sc} cm`,`= <b>${d*sc/100}</b> m`]})};

// ---- area, volume ----
G.area2d=(r,lv)=>{const q=r.int(0,3),a=r.int(4,14),b=r.int(3,10),h=r.int(3,10);if(q===0)return Qn({text:'Find the area of the rectangle.',svg:rectSvg(a,b),label:'Area =',unit:' cm²',ans:a*b,steps:[`${a} × ${b} = <b>${a*b}</b>`]});
  if(q===1)return Qn({text:'Find the area of the triangle.',svg:triSvg(a*2,h),label:'Area =',unit:' cm²',ans:a*h,steps:[`½ × ${a*2} × ${h} = <b>${a*h}</b>`]});
  if(q===2)return Qn({text:`A parallelogram has base ${a} cm and perpendicular height ${h} cm. Find its area.`,label:'Area =',unit:' cm²',ans:a*h,steps:[`${a} × ${h} = <b>${a*h}</b>`]});
  return Qn({text:`A trapezium has parallel sides ${a} cm and ${a+b} cm and height ${h} cm. Find its area.`,label:'Area =',unit:' cm²',ans:(2*a+b)*h/2,steps:[`½ × (${a} + ${a+b}) × ${h} = <b>${(2*a+b)*h/2}</b>`]})};
G.lShape=(r,lv)=>{const a=r.int(8,14),b=r.int(6,10),c=r.int(2,a-3),d=r.int(2,b-2);return Qn({text:'Find the area of this L-shape.',svg:lShapeSvg(a,b,c,d),label:'Area =',unit:' cm²',ans:a*b-c*d,steps:[`${a} × ${b} − ${c} × ${d} = <b>${a*b-c*d}</b>`]})};
G.hectares=(r,lv)=>{const l=pick(r,[100,200,250,400,500]),w=pick(r,[40,50,80,100,200]);return Qn({text:`A field is ${l} m by ${w} m. Find its area in <b>hectares</b>. (1 hectare = 10 000 m²)`,label:'Area =',unit:' ha',ans:l*w/10000,steps:[`${l*w} m² ÷ 10 000 = <b>${l*w/10000}</b> ha`]})};
G.prismVolume=(r,lv)=>{const b=r.int(3,10),h=r.int(2,8),L=r.int(4,15);if(lv===0)return Qn({text:`A cuboid is ${b} cm by ${h} cm by ${L} cm. Find its volume.`,label:'V =',unit:' cm³',ans:b*h*L,steps:[`${b} × ${h} × ${L} = <b>${b*h*L}</b>`]});return Qn({text:`A triangular prism has a triangular cross-section with base ${b*2} cm and height ${h} cm. Its length is ${L} cm. Find its volume.`,label:'V =',unit:' cm³',ans:b*h*L,steps:[`Area of triangle = ½ × ${b*2} × ${h} = ${b*h}`,`V = ${b*h} × ${L} = <b>${b*h*L}</b>`]})};
G.surfaceArea=(r,lv)=>{const l=r.int(3,9),w=r.int(2,6),h=r.int(2,8);if(lv===0)return Qn({text:`Find the surface area of a cuboid ${l} cm by ${w} cm by ${h} cm.`,label:'SA =',unit:' cm²',ans:2*(l*w+l*h+w*h),steps:[`2(${l*w} + ${l*h} + ${w*h}) = <b>${2*(l*w+l*h+w*h)}</b>`]});
  const a=pick(r,[3,6,9]),b=pick(r,[4,8,12]),c=pick(r,[5,10,15]).valueOf();const tri=[[3,4,5],[6,8,10]];const [p,q2,hy]=pick(r,tri),L=r.int(5,12);return Qn({text:`A triangular prism has a right-angled triangle cross-section with sides ${p} cm, ${q2} cm and ${hy} cm. Its length is ${L} cm. Find its surface area.`,label:'SA =',unit:' cm²',ans:p*q2+(p+q2+hy)*L,steps:[`Two triangles: 2 × ½ × ${p} × ${q2} = ${p*q2}`,`Three rectangles: (${p} + ${q2} + ${hy}) × ${L} = ${(p+q2+hy)*L}`,`Total = <b>${p*q2+(p+q2+hy)*L}</b>`]})};
G.solids=(r,lv)=>{const R=r.int(2,9),h=r.int(3,12),q=r.int(0,3);if(q===0)return Qn({text:`A cylinder has radius ${R} cm and height ${h} cm. Find its volume. Use π = 3.14.`,label:'V =',unit:' cm³',ans:rd(PI*R*R*h,1),tol:tolR(PI*R*R*h,.002,.2),steps:[`V = πr²h = 3.14 × ${R}² × ${h} = <b>${rd(PI*R*R*h,1)}</b>`]});
  if(q===1)return Qn({text:`A cone has radius ${R} cm and height ${h} cm. Find its volume. Use π = 3.14.`,label:'V =',unit:' cm³',ans:rd(PI*R*R*h/3,1),tol:tolR(PI*R*R*h/3,.002,.2),steps:[`V = ⅓πr²h = <b>${rd(PI*R*R*h/3,1)}</b>`]});
  if(q===2)return Qn({text:`A sphere has radius ${R} cm. Find its volume. Use π = 3.14.`,label:'V =',unit:' cm³',ans:rd(4/3*PI*R**3,1),tol:tolR(4/3*PI*R**3,.002,.2),steps:[`V = 4/3 πr³ = <b>${rd(4/3*PI*R**3,1)}</b>`]});
  const a=r.int(3,9),b=r.int(3,9);return Qn({text:`A square-based pyramid has base ${a} cm by ${a} cm and height ${h} cm. Find its volume.`,label:'V =',unit:' cm³',ans:rd(a*a*h/3,2),tol:.011,steps:[`V = ⅓ × ${a*a} × ${h} = <b>${rd(a*a*h/3,2)}</b>`]})};
G.shapes3d=(r,lv)=>{const S=[['cube',6,12,8],['triangular prism',5,9,6],['square-based pyramid',5,8,5],['tetrahedron',4,6,4],['pentagonal prism',7,15,10],['hexagonal prism',8,18,12]],[nm,f,e,v]=pick(r,S),w=r.int(0,2);return Qn({text:`How many <b>${['faces','edges','vertices'][w]}</b> does a ${nm} have?`,label:'Number =',ans:[f,e,v][w],steps:[`A ${nm}: ${f} faces, ${e} edges, ${v} vertices.`,`<b>${[f,e,v][w]}</b>`]})};
G.symmetry=(r,lv)=>{const S=[['rectangle',2,2],['parallelogram',0,2],['rhombus',2,2],['kite',1,1],['isosceles trapezium',1,1],['square',4,4],['equilateral triangle',3,3]],[nm,l,o]=pick(r,S),w=r.chance(.5);return Qn({text:w?`How many <b>lines of symmetry</b> does ${art(nm)} have?`:`What is the <b>order of rotational symmetry</b> of ${art(nm)}?`,label:'Number =',ans:w?l:o,steps:[`${art(nm)[0].toUpperCase()+art(nm).slice(1)}: ${l} line${l===1?'':'s'} of symmetry, rotational order ${o}.`]})};
G.circleWords=(r,lv)=>{const R=r.int(3,25),rad_=r.chance(.5);return Qn({text:rad_?`A circle has radius ${R} cm. What is its diameter?`:`A circle has diameter ${R*2} cm. What is its radius?`,label:rad_?'Diameter =':'Radius =',unit:' cm',ans:rad_?R*2:R,steps:[`Diameter = 2 × radius`]})};

// ---- Pythagoras and trigonometry ----
G.pythag=(r,lv)=>{const T=[[3,4,5],[6,8,10],[5,12,13],[8,15,17],[9,12,15],[7,24,25],[20,21,29]];if(lv<2){const [a,b,c]=pick(r,T),hypUnknown=lv===0||r.chance(.5);return Qn({text:hypUnknown?'Find the length of the hypotenuse <b>x</b>.':'Find the length of the side <b>x</b>.',svg:hypUnknown?rightTri(a,b,a+' cm',b+' cm','x cm'):rightTri(a,b,a+' cm','x cm',c+' cm'),label:'x =',unit:' cm',ans:hypUnknown?c:b,steps:hypUnknown?[`x² = ${a}² + ${b}² = ${a*a+b*b}`,`x = <b>${c}</b>`]:[`x² = ${c}² − ${a}² = ${c*c-a*a}`,`x = <b>${b}</b>`]})}
  const a=r.int(4,12),b=r.int(4,12),c=Math.sqrt(a*a+b*b);return Qn({text:'Find the length of the hypotenuse <b>x</b>. Give your answer to 1 decimal place.',svg:rightTri(a,b,a+' cm',b+' cm','x cm'),label:'x =',unit:' cm',ans:rd(c,1),tol:.06,steps:[`x² = ${a}² + ${b}² = ${a*a+b*b}`,`x = √${a*a+b*b} = <b>${rd(c,1)}</b>`]})};
G.trigSide=(r,lv)=>{const th=r.int(20,70),f=pick(r,['sin','cos','tan']),L=r.int(5,20),unknownIsHyp=lv===2&&f!=='tan';
  // triangle: angle at bottom-right; opposite = vertical leg, adjacent = bottom leg
  let given,ans,lb='',lv_='',lh='',steps;
  if(f==='sin'){ if(!unknownIsHyp){given=L;ans=L*sinD(th);lh=L+' cm';lv_='x cm';steps=[`sin ${th}° = opposite ÷ hypotenuse`,`x = ${L} × sin ${th}° = <b>${rd(ans,1)}</b>`]}else{given=L;ans=L/sinD(th);lv_=L+' cm';lh='x cm';steps=[`sin ${th}° = ${L} ÷ x`,`x = ${L} ÷ sin ${th}° = <b>${rd(ans,1)}</b>`]}}
  else if(f==='cos'){ if(!unknownIsHyp){ans=L*cosD(th);lh=L+' cm';lb='x cm';steps=[`cos ${th}° = adjacent ÷ hypotenuse`,`x = ${L} × cos ${th}° = <b>${rd(ans,1)}</b>`]}else{ans=L/cosD(th);lb=L+' cm';lh='x cm';steps=[`cos ${th}° = ${L} ÷ x`,`x = ${L} ÷ cos ${th}° = <b>${rd(ans,1)}</b>`]}}
  else { if(lv<2){ans=L*tanD(th);lb=L+' cm';lv_='x cm';steps=[`tan ${th}° = opposite ÷ adjacent`,`x = ${L} × tan ${th}° = <b>${rd(ans,1)}</b>`]}else{ans=L/tanD(th);lv_=L+' cm';lb='x cm';steps=[`tan ${th}° = ${L} ÷ x`,`x = ${L} ÷ tan ${th}° = <b>${rd(ans,1)}</b>`]}}
  const hb=10,vb=10*tanD(th);return Qn({text:`Find the length <b>x</b>. Give your answer to 1 decimal place.`,svg:rightTri(hb,vb,lb,lv_,lh,th+'°'),label:'x =',unit:' cm',ans:rd(ans,1),tol:tolR(ans),steps,hint:'SOH CAH TOA'})};
G.trigAngle=(r,lv)=>{const a=r.int(4,15),b=r.int(4,15),f=pick(r,['tan','sin','cos']);let h,opp,adj,ang;if(f==='tan'){opp=b;adj=a;ang=atanD(b/a)}else{h=Math.max(a,b)+r.int(2,6);opp=Math.min(a,b);adj=Math.sqrt(h*h-opp*opp);ang=f==='sin'?asinD(opp/h):acosD(adj/h);if(f==='cos'){adj=Math.min(a,b);opp=Math.sqrt(h*h-adj*adj);ang=acosD(adj/h)}}
  const lbB=f==='sin'?'':(f==='tan'?adj:adj)+' cm',lbV=f==='cos'?'':opp+' cm',lbH=f==='tan'?'':h+' cm';
  const vb=f==='tan'?adj:Math.sqrt(h*h-(f==='sin'?opp:opp)**2),vv=f==='cos'?opp:(f==='tan'?opp:opp);
  const text=f==='tan'?`Find angle <b>x</b> given the opposite = ${opp} cm and adjacent = ${adj} cm. Give your answer to 1 decimal place.`:f==='sin'?`In a right-angled triangle the hypotenuse is ${h} cm and the side opposite angle x is ${opp} cm. Find angle <b>x</b> to 1 decimal place.`:`In a right-angled triangle the hypotenuse is ${h} cm and the side adjacent to angle x is ${adj} cm. Find angle <b>x</b> to 1 decimal place.`;
  const steps=f==='tan'?[`tan x = ${opp} ÷ ${adj}`,`x = tan⁻¹(${rd(opp/adj,4)}) = <b>${rd(ang,1)}°</b>`]:f==='sin'?[`sin x = ${opp} ÷ ${h}`,`x = sin⁻¹(${rd(opp/h,4)}) = <b>${rd(ang,1)}°</b>`]:[`cos x = ${adj} ÷ ${h}`,`x = cos⁻¹(${rd(adj/h,4)}) = <b>${rd(ang,1)}°</b>`];
  return Qn({text,label:'x =',unit:'°',ans:rd(ang,1),tol:.06,steps,hint:'Use the inverse function on your calculator.'})};
G.sineRule=(r,lv)=>{const A=r.int(30,80),B=r.int(30,80),a=r.int(6,20);if(A+B>150)return G.sineRule(r,lv);if(lv===0){const b=a*sinD(B)/sinD(A);return Qn({text:`In triangle ABC, angle A = ${A}°, angle B = ${B}° and BC = a = ${a} cm. Find AC = b to 1 decimal place.`,label:'b =',unit:' cm',ans:rd(b,1),tol:tolR(b),steps:[`b ÷ sin ${B}° = ${a} ÷ sin ${A}°`,`b = <b>${rd(b,1)}</b>`]})}
  const b=r.int(8,20),Bv=r.int(30,80),sa=a*sinD(Bv)/b;if(sa>=1)return G.sineRule(r,lv);const Av=asinD(sa);return Qn({text:`In triangle ABC, a = ${a} cm, b = ${b} cm and angle B = ${Bv}°. Angle A is acute. Find angle A to 1 decimal place.`,label:'A =',unit:'°',ans:rd(Av,1),tol:.06,steps:[`sin A ÷ ${a} = sin ${Bv}° ÷ ${b}`,`A = <b>${rd(Av,1)}°</b>`]})};
G.cosineRule=(r,lv)=>{const b=r.int(5,15),c=r.int(5,15),A=r.int(30,110);const a=Math.sqrt(b*b+c*c-2*b*c*cosD(A));return Qn({text:`In triangle ABC, b = ${b} cm, c = ${c} cm and angle A = ${A}°. Find a to 1 decimal place.`,label:'a =',unit:' cm',ans:rd(a,1),tol:tolR(a),steps:[`a² = ${b}² + ${c}² − 2 × ${b} × ${c} × cos ${A}°`,`a = <b>${rd(a,1)}</b>`]})};
G.areaTrig=(r,lv)=>{const a=r.int(5,15),b=r.int(5,15),C=r.int(25,130),A=.5*a*b*sinD(C);return Qn({text:`In triangle ABC, a = ${a} cm, b = ${b} cm and angle C = ${C}°. Find the area to 1 decimal place.`,label:'Area =',unit:' cm²',ans:rd(A,1),tol:tolR(A),steps:[`Area = ½ab sin C = ½ × ${a} × ${b} × sin ${C}° = <b>${rd(A,1)}</b>`]})};
G.trig3d=(r,lv)=>{const l=r.int(3,9),w=r.int(3,9),h=r.int(3,9);if(lv===0)return Qn({text:`A cuboid is ${l} cm by ${w} cm by ${h} cm. Find the length of the diagonal of the base to 1 decimal place.`,label:'Length =',unit:' cm',ans:rd(Math.hypot(l,w),1),tol:.06,steps:[`√(${l}² + ${w}²) = <b>${rd(Math.hypot(l,w),1)}</b>`]});const d=Math.sqrt(l*l+w*w+h*h);return Qn({text:`A cuboid is ${l} cm by ${w} cm by ${h} cm. Find the length of the <b>space diagonal</b> to 1 decimal place.`,label:'Length =',unit:' cm',ans:rd(d,1),tol:.06,steps:[`√(${l}² + ${w}² + ${h}²) = √${l*l+w*w+h*h} = <b>${rd(d,1)}</b>`]})};
G.similar=(r,lv)=>{const k=r.int(2,5),a=r.int(3,9);if(lv===0)return Qn({text:`Two triangles are similar. A side of length ${a} cm in the small triangle matches a side of ${a*k} cm in the large one. What is the <b>scale factor</b>?`,label:'Scale factor =',ans:k,steps:[`${a*k} ÷ ${a} = <b>${k}</b>`]});
  const A=r.int(2,9);if(lv===1)return Qn({text:`Two similar shapes have lengths in the ratio 1 : ${k}. The smaller has area ${A} cm². Find the area of the larger.`,label:'Area =',unit:' cm²',ans:A*k*k,steps:[`Area scale factor = ${k}² = ${k*k}`,`<b>${A*k*k}</b>`]});
  const V=r.int(2,9),k2=pick(r,[2,3,4]);return Qn({text:`Two similar solids have lengths in the ratio 1 : ${k2}. The smaller has volume ${V} cm³. Find the volume of the larger.`,label:'Volume =',unit:' cm³',ans:V*k2**3,steps:[`Volume scale factor = ${k2}³ = ${k2**3}`,`<b>${V*k2**3}</b>`]})};
G.congruentMC=(r,lv)=>{const Q=[['Two sides and the angle between them are equal','SAS'],['Three sides are equal','SSS'],['Two angles and a side are equal','ASA'],['A right angle, the hypotenuse and one other side are equal','RHS']],i=r.int(0,3),opts=['SSS','SAS','ASA','RHS'];return MC(`Triangles are congruent when: <b>${Q[i][0]}</b>. Which condition is this?`,opts,opts.indexOf(Q[i][1]),[`This is the ${Q[i][1]} condition.`])};
G.constructMC=(r,lv)=>{const Q=[['To bisect an angle you','draw arcs from the arms and then equal arcs that intersect inside the angle'],['A perpendicular bisector of AB passes through','the midpoint of AB at 90°'],['Every point on the perpendicular bisector of AB is','the same distance from A and B'],['The locus of points a fixed distance from a point is','a circle']],i=r.int(0,3),wrong=['a straight line parallel to AB','a square','the longest side of the triangle'];const opts=r.shuffle([Q[i][1],...wrong.slice(0,3)]);return MC(`${Q[i][0]} …`,opts,opts.indexOf(Q[i][1]),[`${Q[i][0]} ${Q[i][1]}.`])};

// ---- transformations ----
G.translate=(r,lv)=>{const x=r.int(-4,4),y=r.int(-4,4),dx=nz(r,-4,4),dy=nz(r,-4,4),xs=r.chance(.5);return Qn({text:`Point A (${M(x)}, ${M(y)}) is translated by the vector (${M(dx)}, ${M(dy)}). What is the new <b>${xs?'x':'y'}-coordinate</b>?`,svg:gridSvg({pts:[{x,y,label:'A',color:'#4f46e5'}]}),label:xs?'x =':'y =',ans:xs?x+dx:y+dy,steps:[xs?`${M(x)} + ${sg(dx)} = <b>${M(x+dx)}</b>`:`${M(y)} + ${sg(dy)} = <b>${M(y+dy)}</b>`]})};
G.reflect=(r,lv)=>{const x=nz(r,-5,5),y=nz(r,-5,5),w=r.int(0,lv>0?3:1),k=r.int(-3,3);if(w===0)return Qn({text:`Point A (${M(x)}, ${M(y)}) is reflected in the <b>y-axis</b>. What is the new x-coordinate?`,svg:gridSvg({pts:[{x,y,label:'A',color:'#4f46e5'}]}),label:'x =',ans:-x,steps:[`<b>${M(-x)}</b>`]});
  if(w===1)return Qn({text:`Point A (${M(x)}, ${M(y)}) is reflected in the <b>x-axis</b>. What is the new y-coordinate?`,svg:gridSvg({pts:[{x,y,label:'A',color:'#4f46e5'}]}),label:'y =',ans:-y,steps:[`<b>${M(-y)}</b>`]});
  if(w===2)return Qn({text:`Point A (${M(x)}, ${M(y)}) is reflected in the line <b>x = ${M(k)}</b>. What is the new x-coordinate?`,svg:gridSvg({pts:[{x,y,label:'A',color:'#4f46e5'}],vlines:[{x:k,label:'x='+k}]}),label:'x =',ans:2*k-x,steps:[`2 × ${sg(k)} − ${sg(x)} = <b>${M(2*k-x)}</b>`]});
  return Qn({text:`Point A (${M(x)}, ${M(y)}) is reflected in the line <b>y = x</b>. What is the new x-coordinate?`,label:'x =',ans:y,steps:[`Reflection in y = x swaps the coordinates: (${M(y)}, ${M(x)})`]})};
G.rotate=(r,lv)=>{const x=nz(r,-5,5),y=nz(r,-5,5),w=r.int(0,2);if(w===0)return Qn({text:`Point A (${M(x)}, ${M(y)}) is rotated <b>180°</b> about the origin. What is the new x-coordinate?`,label:'x =',ans:-x,steps:[`(${M(-x)}, ${M(-y)})`]});
  if(w===1)return Qn({text:`Point A (${M(x)}, ${M(y)}) is rotated <b>90° clockwise</b> about the origin. What is the new x-coordinate?`,svg:gridSvg({pts:[{x,y,label:'A',color:'#4f46e5'}]}),label:'x =',ans:y,steps:[`90° clockwise: (x, y) → (y, −x)`,`New point (${M(y)}, ${M(-x)})`]});
  return Qn({text:`Point A (${M(x)}, ${M(y)}) is rotated <b>90° anticlockwise</b> about the origin. What is the new y-coordinate?`,svg:gridSvg({pts:[{x,y,label:'A',color:'#4f46e5'}]}),label:'y =',ans:x,steps:[`90° anticlockwise: (x, y) → (−y, x)`,`New point (${M(-y)}, ${M(x)})`]})};
G.enlarge=(r,lv)=>{const x=nz(r,-4,4),y=nz(r,-4,4),k=lv===2?pick(r,[-1,-2,-3]):r.int(2,3),xs=r.chance(.5);return Qn({text:`Point A (${M(x)}, ${M(y)}) is enlarged by scale factor <b>${M(k)}</b> with centre the origin. What is the new ${xs?'x':'y'}-coordinate?`,label:xs?'x =':'y =',ans:k*(xs?x:y),steps:[`Multiply both coordinates by ${M(k)}: (${M(k*x)}, ${M(k*y)})`]})};
G.mapScale=(r,lv)=>{const sc=pick(r,[20,25,50,100]),d=rd(r.int(15,60)/10);return Qn({text:`On a map 1 cm represents ${sc/100} km. Two towns are ${d} cm apart on the map. How far apart are they in km?`,label:'Distance =',unit:' km',ans:rd(d*sc/100,3),steps:[`${d} × ${sc/100} = <b>${rd(d*sc/100,3)}</b>`]})};
