/* Interactive demos for the slides. Each demo: {title, controls[], render(st)->html, steps?(st)->[html], after?(view,st,redraw)}.
   Controls: {id,label,type:'range'|'select'|'text',min,max,step,val,opts,when:st=>bool}.
   Demos with steps get "Next step / Show all / Start again" buttons; st.k = number of steps shown, so the figure can build up too. */
const DEMOS={};
function mountDemo(host,def,init={}){
  const st={k:0};
  host.innerHTML=`<div class="demo"><div class="dtitle">${def.title}</div><div class="dctl"></div><div class="dbody${def.steps?" has-steps":""}"><div class="dview"></div>${def.steps?`<div class="dsteps"><div class="row"><button class="btn" data-a="next">Next step ▶</button><button class="btn alt" data-a="all">Show all</button><button class="btn alt" data-a="reset">Start again</button></div><ol class="sol steplist"></ol></div>`:''}</div></div>`;
  const ctl=$('.dctl',host),view=$('.dview',host),wraps=[];
  const draw=()=>{
    wraps.forEach(([c,d])=>{d.style.display=!c.when||c.when(st)?'':'none'});
    let steps=[];if(def.steps){steps=def.steps(st);st.k=Math.min(st.k,steps.length)}
    view.innerHTML=def.render(st);if(def.after)def.after(view,st,draw);
    if(def.steps){$('.steplist',host).innerHTML=steps.slice(0,st.k).map((s,i)=>`<li class="${i===st.k-1?'new':''}">${s}</li>`).join('');$('[data-a=next]',host).disabled=st.k>=steps.length}
  };
  def.controls.forEach(c=>{
    const v0=init[c.id]!==undefined?init[c.id]:c.val;st[c.id]=v0;const d=document.createElement('div');d.className='wc';
    if(c.type==='select'){d.innerHTML=`<label>${c.label}</label><select>${c.opts.map(o=>`<option value="${o[0]}" ${String(o[0])===String(v0)?'selected':''}>${o[1]}</option>`).join('')}</select>`;$('select',d).onchange=e=>{st[c.id]=e.target.value;if(c.reset)st.k=0;draw()}}
    else if(c.type==='text'){d.innerHTML=`<label>${c.label}</label><input type="text" value="${v0}">`;$('input',d).oninput=e=>{st[c.id]=e.target.value;draw()}}
    else{d.innerHTML=`<label>${c.label}: <b>${c.fmt?c.fmt(v0):v0}</b></label><input type="range" min="${c.min}" max="${c.max}" step="${c.step||1}" value="${v0}">`;$('input',d).oninput=e=>{st[c.id]=+e.target.value;$('b',d).textContent=c.fmt?c.fmt(+e.target.value):e.target.value;draw()}}
    ctl.appendChild(d);wraps.push([c,d]);
  });
  if(def.steps){$('[data-a=next]',host).onclick=()=>{st.k++;draw()};$('[data-a=all]',host).onclick=()=>{st.k=99;draw()};$('[data-a=reset]',host).onclick=()=>{st.k=0;draw()}}
  host.demoNext=def.steps?()=>{if(st.k<def.steps(st).length){st.k++;draw();return true}return false}:null;
  draw();return st;
}
const box=(s,cls='')=>`<div class="dout ${cls}">${s}</div>`;

// ---------------- straight lines: 3 methods ----------------
DEMOS.line={title:'Drawing y = mx + c — three methods',controls:[
  {id:'meth',label:'Method',type:'select',opts:[['table','Table of values'],['gi','Gradient–intercept'],['cover','Dual intercept (cover-up)']],val:'table',reset:true},
  {id:'m',label:'Gradient m',min:-3,max:3,step:.5,val:2,fmt:half,when:s=>s.meth!=='cover'},{id:'c',label:'y-intercept c',min:-5,max:5,val:-1,when:s=>s.meth!=='cover'},
  {id:'a',label:'a (in ax + by = k)',min:1,max:6,val:2,when:s=>s.meth==='cover'},{id:'b',label:'b',min:-6,max:6,val:3,when:s=>s.meth==='cover'},{id:'kk',label:'k',min:-12,max:12,val:6,when:s=>s.meth==='cover'}],
 steps:s=>{
  if(s.meth==='cover'){const a=+s.a,b=+s.b||1,k=+s.kk,eq=`${cx(a,'x')} ${b<0?'−':'+'} ${Math.abs(b)===1?'':Math.abs(b)}y = ${k}`;
    return [`Equation: <b>${eq}</b>`,`Cover the x-term (x = 0): ${M(b)}y = ${k}, so y = ${fmtNum(rd(k/b,2))}. Plot (0, ${fmtNum(rd(k/b,2))}).`,`Cover the y-term (y = 0): ${a}x = ${k}, so x = ${fmtNum(rd(k/a,2))}. Plot (${fmtNum(rd(k/a,2))}, 0).`,`Join the two points with a ruler and extend the line.`]}
  const m=+s.m,c=+s.c,eq=lineEq(m,c);
  if(s.meth==='table')return [`Choose some x-values: −2, −1, 0, 1, 2.`,`Substitute each into ${eq}:${miniTable([['x',-2,-1,0,1,2].map((v,i)=>i?M(v):v),['y',...[-2,-1,0,1,2].map(x=>fmtNum(rd(m*x+c,2)))]])}`,`Plot the points (x, y).`,`Join them with a ruler: the graph of ${eq}.`];
  return [`Read the equation ${eq}: m = ${half(m)}, c = ${M(c)}.`,`Plot the y-intercept (0, ${M(c)}).`,`From (0, ${M(c)}) go ${Number.isInteger(m)?'1 right':'2 right'} and ${Math.abs(Number.isInteger(m)?m:2*m)} ${m>=0?'up':'down'}. Repeat.`,`Join the points: the graph of ${eq}.`]},
 render:s=>{
  const o={x0:-6,x1:6,y0:-8,y1:8,xl:2,yl:2,cls:'sq'},k=s.k;
  if(s.meth==='cover'){const a=+s.a,b=+s.b||1,K=+s.kk,yi=K/b,xi=K/a,pts=[];if(k>=2)pts.push({x:0,y:yi,label:`(0, ${fmtNum(rd(yi,2))})`});if(k>=3)pts.push({x:xi,y:0,label:`(${fmtNum(rd(xi,2))}, 0)`,dy:14});
    return plotSvg({...o,pts,lines:k>=4?[{m:-a/b,c:yi}]:[]})+(+s.b===0?box('b cannot be 0'):'')}
  const m=+s.m,c=+s.c,xs=[-2,-1,0,1,2];
  if(s.meth==='table')return plotSvg({...o,pts:k>=3?xs.map(x=>({x,y:m*x+c})):[],lines:k>=4?[{m,c,label:lineEq(m,c)}]:[]});
  const run=Number.isInteger(m)?1:2;
  return plotSvg({...o,pts:[...(k>=2?[{x:0,y:c,label:`(0, ${M(c)})`,a:'end',dx:-8}]:[]),...(k>=3?[{x:run,y:c+m*run},{x:2*run,y:c+2*m*run}]:[])],tris:k>=3?[{x:0,y:c,dx:run,dy:m*run,run:String(run),rise:fmtNum(m*run)},{x:run,y:c+m*run,dx:run,dy:m*run,run:String(run),rise:fmtNum(m*run)}]:[],lines:k>=4?[{m,c,label:lineEq(m,c)}]:[]});
 }};

// ---------------- match the sketch ----------------
DEMOS.sketch={title:'Match the line — find m and c',controls:[{id:'m',label:'Your gradient m',min:-3,max:3,step:.5,val:1,fmt:half},{id:'c',label:'Your intercept c',min:-5,max:5,val:0}],
 steps:s=>{const t=s.t||{m:2,c:-1};return [`Where does the black line cross the y-axis? At (0, ${M(t.c)}), so c = ${M(t.c)}.`,`Pick two grid points on it and work out rise ÷ run: gradient = ${half(t.m)}.`,`The black line is <b>${lineEq(t.m,t.c)}</b>.`]},
 render:s=>{
  if(!s.t)s.t={m:pick(mkR(rndSeed()),[-2,-1.5,-1,-.5,.5,1,1.5,2,3]),c:mkR(rndSeed()).int(-4,4)};const t=s.t,ok=+s.m===t.m&&+s.c===t.c;
  return plotSvg({x0:-6,x1:6,y0:-8,y1:8,xl:2,yl:2,cls:'sq',lines:[{m:t.m,c:t.c,color:'#111827',w:4},{m:+s.m,c:+s.c,color:Y8C.orange,dash:'7 5',label:'your line'}],pts:s.k>=1?[{x:0,y:t.c,color:Y8C.green}]:[],tris:s.k>=2?[{x:0,y:t.c,dx:Number.isInteger(t.m)?1:2,dy:t.m*(Number.isInteger(t.m)?1:2)}]:[]})
   +box(ok?'✅ <b>Match!</b> '+lineEq(t.m,t.c):`Your line: ${lineEq(+s.m,+s.c)}`,ok?'ok':'')+'<div class="row" style="justify-content:center"><button class="btn alt" data-new>New line</button></div>'},
 after:(v,s,redraw)=>{$('[data-new]',v).onclick=()=>{s.t=null;s.k=0;redraw()}}};

// ---------------- real-life line graphs ----------------
const RCTX={taxi:['Taxi: $ fixed fee + $ per km','Distance (km)','Cost ($)'],phone:['Phone plan: $ per month + $ per GB','Data (GB)','Cost ($)'],candle:['Candle: starts tall, burns down','Time (hours)','Height (cm)'],tank:['Tank filling: litres at start + litres per minute','Time (min)','Water (litres)']};
DEMOS.real={title:'Real-life straight-line graphs',controls:[{id:'ctx',label:'Situation',type:'select',opts:Object.entries(RCTX).map(([k,v])=>[k,v[0]]),val:'taxi'},{id:'f',label:'Start value (intercept)',min:0,max:20,val:4},{id:'r',label:'Rate (gradient)',min:1,max:5,val:2},{id:'x',label:'Read off at',min:0,max:10,val:6}],
 render:s=>{const [t,xt,yt]=RCTX[s.ctx],neg=s.ctx==='candle',f=+s.f+(neg?10:0),rt=+s.r,m=neg?-rt:rt,xm=neg?Math.min(10,f/rt):10,x=Math.min(+s.x,xm),y=f+m*x,ymax=Math.max(10,Math.ceil((neg?f:f+rt*10)/5)*5),st=niceStep(ymax);
  return plotSvg({x0:0,x1:10,y0:0,y1:ymax,xs:1,ys:st/2>=1?st/2:st,yl:st,outer:true,xt,yt,lines:[{m,c:f,to:xm}],segs:[{a:[x,0],b:[x,y],dash:'5 4',color:Y8C.green},{a:[x,y],b:[0,y],dash:'5 4',color:Y8C.green}],pts:[{x,y,color:Y8C.green,label:`(${fmtNum(rd(x,2))}, ${fmtNum(rd(y,2))})`},{x:0,y:f,color:Y8C.orange}]})
  +box(`Equation: <b>y = ${f} ${neg?'−':'+'} ${rt}x</b><br>Intercept ${f} = the value at the start (fixed amount) · Gradient ${M(m)} = the rate of change`)}};

// ---------------- parallel lines ----------------
DEMOS.parallel={title:'Angles on parallel lines',controls:[{id:'th',label:'Angle of the crossing line',min:25,max:155,val:60},{id:'pair',label:'Angle pair',type:'select',opts:[['corr','Corresponding (F)'],['alt','Alternate (Z)'],['co','Co-interior (C)'],['vo','Vertically opposite (X)']],val:'corr'}],
 render:s=>{const th=+s.th,P2={corr:[{at:'U',pos:'ar'},{at:'L',pos:'ar'}],alt:[{at:'U',pos:'bl'},{at:'L',pos:'ar'}],co:[{at:'U',pos:'bl'},{at:'L',pos:'al'}],vo:[{at:'L',pos:'ar'},{at:'L',pos:'bl'}]}[s.pair],[nm,why]=PAIRS[s.pair];
  const marks=P2.map((m,i)=>({...m,label:parVal(th,m.pos)+'°',color:i?Y8C.orange:Y8C.blue}));
  return parSvg(th,marks,{hl:s.pair!=='vo'})+box(`<b>${cap(nm)} angles:</b> ${marks[0].label} and ${marks[1].label}. ${why}`)}};

// ---------------- triangle ----------------
DEMOS.triangle={title:'Angles in a triangle and the exterior angle',controls:[{id:'A',label:'Angle A',min:20,max:120,val:55},{id:'B',label:'Angle B',min:20,max:120,val:70}],
 render:s=>{let A=+s.A,B=+s.B;if(A+B>165)B=165-A;const C=180-A-B,R=Math.sin(rad(B))/Math.sin(rad(C)),sc=200,ax=40,ay=180,bx=ax+sc,cxp=ax+sc*R*Math.cos(rad(A)),cyp=ay-sc*R*Math.sin(rad(A));
  let g=`<polygon points="${ax},${ay} ${bx},${ay} ${f1(cxp)},${f1(cyp)}" fill="#eef2ff" stroke="#111827" stroke-width="2.4"/>`+ln8(bx,ay,bx+90,ay,'#111827',2.4,'6 4');
  g+=`<path d="${arcPath(ax,ay,26,0,A)}" fill="none" stroke="${Y8C.blue}" stroke-width="2.4"/><path d="${arcPath(bx,ay,26,180-B,180)}" fill="none" stroke="${Y8C.blue}" stroke-width="2.4"/><path d="${arcPath(bx,ay,34,0,180-B)}" fill="none" stroke="${Y8C.orange}" stroke-width="2.6"/>`;
  g+=tx8(ax+42,ay-14,A+'°',{c:Y8C.blue})+tx8(bx-44,ay-14,B+'°',{c:Y8C.blue})+tx8(cxp,cyp+26,C+'°',{c:Y8C.green})+tx8(bx+52,ay-22,(A+B)+'°',{c:Y8C.orange,fw:800});
  const E=Ext();E.add(ax-10,ay+10);E.add(bx+100,ay+10);E.add(cxp,cyp-10);E.add(ax,Math.min(cyp,ay-60));
  return svgFit(g,E)+box(`A + B + C = ${A} + ${B} + ${C} = <b>180°</b><br>Exterior angle = A + B = ${A} + ${B} = <b style="color:${Y8C.orange}">${A+B}°</b> (= 180° − ${B}°)`)}};

// ---------------- polygons ----------------
DEMOS.polygon={title:'Polygon angles',controls:[{id:'n',label:'Number of sides',min:3,max:12,val:5},{id:'show',label:'Show',type:'select',opts:[['tri','Split into triangles'],['ext','Exterior angles']],val:'tri'}],
 render:s=>{const n=+s.n,cx=150,cy=130,R=105,p=[];for(let i=0;i<n;i++)p.push(P(cx,cy,R,-90-180/n+i*360/n));let g='';
  if(s.show==='tri'){for(let i=1;i<n-1;i++)g+=`<polygon points="${ptsAttr([p[0],p[i],p[i+1]])}" fill="${i%2?'#c7d2fe':'#fde68a'}" stroke="#94a3b8"/>`}
  g+=`<polygon points="${ptsAttr(p)}" fill="none" stroke="#111827" stroke-width="2.4"/>`;
  if(s.show==='ext')p.forEach((q,i)=>{const nx=p[(i+1)%n],dx=nx[0]-q[0],dy=nx[1]-q[1],L=Math.hypot(dx,dy);g+=ln8(nx[0],nx[1],nx[0]+dx/L*45,nx[1]+dy/L*45,Y8C.orange,2,'5 4')});
  const S=(n-2)*180;return svgWrap(g,300,260)+box(s.show==='tri'?`${n} sides → <b>${n-2} triangles</b> → sum of interior angles = (${n} − 2) × 180° = <b>${S}°</b><br>Regular: each interior angle = ${S} ÷ ${n} = <b>${fmtNum(rd(S/n,2))}°</b>`:`Exterior angles always add up to <b>360°</b><br>Regular: each exterior angle = 360° ÷ ${n} = <b>${fmtNum(rd(360/n,2))}°</b>; interior = 180° − exterior = ${fmtNum(rd(180-360/n,2))}°`)}};

// ---------------- bearings ----------------
DEMOS.bearing={title:'Bearings — clockwise from North',controls:[{id:'b',label:'Bearing of B from A',min:0,max:359,val:125},{id:'back',label:'Back bearing',type:'select',opts:[['0','Hide'],['1','Show bearing of A from B']],val:'0'}],
 render:s=>{const b=+s.b,bb=(b+180)%360;return bearingSvg(Math.max(1,b),{back:s.back==='1'})+box(`Bearing of B from A = <b>${pad3(b)}°</b>${s.back==='1'?`<br>Bearing of A from B = ${b} ${b<180?'+':'−'} 180 = <b style="color:${Y8C.green}">${pad3(bb)}°</b>`:''}<br><small>Always measure clockwise from North and use three figures.</small>`)}};

// ---------------- transformations ----------------
DEMOS.transform={title:'Transformations step by step',controls:[{id:'t',label:'Transformation',type:'select',opts:[['tr','Translation'],['rx','Reflection in the x-axis'],['ry','Reflection in the y-axis'],['vx','Reflection in x = 1'],['yx','Reflection in y = x'],['r180','Rotation 180° about (0, 0)'],['cw','Rotation 90° clockwise about (0, 0)'],['acw','Rotation 90° anticlockwise about (0, 0)'],['en','Enlargement, scale factor 2, centre (0, 0)']],val:'tr',reset:true},
  {id:'a',label:'Move right (+) / left (−)',min:-5,max:5,val:3,when:s=>s.t==='tr'},{id:'b',label:'Move up (+) / down (−)',min:-5,max:5,val:-4,when:s=>s.t==='tr'}],
 steps:s=>{const T=s.t==='tr'?TR.tr(+s.a,+s.b):s.t==='vx'?TR.vx(1):s.t==='en'?TR.en(2):TR[s.t](),o=[[1,1],[3,1],[1,2]],im=o.map(T.f);
  return [`Start with the object: A(1, 1), B(3, 1), C(1, 2).`,`Map one vertex: A(1, 1) → A′(${im[0].map(M).join(', ')}). ${T.why}`,`Map the other vertices: B′(${im[1].map(M).join(', ')}), C′(${im[2].map(M).join(', ')}).`,`Join the image. It is <b>${T.d}</b>.`]},
 render:s=>{const T=s.t==='tr'?TR.tr(+s.a,+s.b):s.t==='vx'?TR.vx(1):s.t==='en'?TR.en(2):TR[s.t](),o=[[1,1],[3,1],[1,2]],im=o.map(T.f),k=s.k;
  const o2={x0:-7,x1:7,y0:-7,y1:7,xl:2,yl:2,cls:'sq',polys:[{pts:o,color:Y8C.blue,names:['A','B','C']}],pts:[],segs:[],lines:[]};
  if(T.mirror)o2.lines.push({...T.mirror,color:Y8C.green,dash:'7 5',w:2.2});if(T.vx!==undefined)o2.segs.push({a:[T.vx,-7],b:[T.vx,7],color:Y8C.green,dash:'7 5',w:2.2});
  const n=k>=3?3:k>=2?1:0;for(let i=0;i<n;i++){o2.pts.push({x:im[i][0],y:im[i][1],color:Y8C.orange,label:'ABC'[i]+'′'});o2.segs.push({a:o[i],b:im[i],color:'#94a3b8',dash:'3 4',w:1.4})}
  if(k>=4)o2.polys.push({pts:im,color:Y8C.orange});
  return plotSvg(o2)}};

// ---------------- 3D solids ----------------
DEMOS.solid={title:'Volume and surface area',controls:[{id:'sh',label:'Shape',type:'select',opts:[['cub','Cuboid'],['tri','Triangular prism'],['cyl','Cylinder'],['pyr','Square-based pyramid']],val:'cub'},{id:'a',label:'Length / base / radius',min:1,max:12,val:6},{id:'b',label:'Width / height of triangle',min:1,max:10,val:4},{id:'c',label:'Height / length',min:1,max:15,val:5}],
 render:s=>{const a=+s.a,b=+s.b,c=+s.c;
  if(s.sh==='cub')return cuboidSvg(a,b,c)+box(`V = l × w × h = ${a} × ${b} × ${c} = <b>${a*b*c} cm³</b><br>SA = 2(lw + lh + wh) = 2(${a*b} + ${a*c} + ${b*c}) = <b>${2*(a*b+a*c+b*c)} cm²</b>`);
  if(s.sh==='tri')return triPrismSvg(a,b,c)+box(`Cross-section = ½ × ${a} × ${b} = ${a*b/2} cm²<br>V = area of cross-section × length = ${a*b/2} × ${c} = <b>${a*b*c/2} cm³</b>`);
  if(s.sh==='cyl')return cylSvg(a,c)+box(`V = πr²h = π × ${a}² × ${c} = <b>${rd(Math.PI*a*a*c,1)} cm³</b><br>SA = 2πr² + 2πrh = <b>${rd(2*Math.PI*a*a+2*Math.PI*a*c,1)} cm²</b>`);
  const sl=Math.hypot(a/2,c);return pyramidSvg(a,c)+box(`V = ⅓ × base area × height = ⅓ × ${a*a} × ${c} = <b>${rd(a*a*c/3,2)} cm³</b><br>Slant height = √(${a/2}² + ${c}²) = ${rd(sl,2)}; SA = ${a*a} + 4 × ½ × ${a} × ${rd(sl,2)} = <b>${rd(a*a+2*a*sl,1)} cm²</b>`)}};

function pyramidSvg(a,h){const k=Math.min(130/a,120/h,16),A=a*k,H=h*k,dx=A*.5,dy=-A*.3,b=[[0,H],[A,H],[A+dx,H+dy],[dx,H+dy]],ap=[A/2+dx/2,H+dy/2-H];let s=`<polygon points="${ptsAttr(b)}" fill="#e0e7ff" stroke="#111827" stroke-width="2"/>`;b.forEach((q,i)=>{s+=ln8(q[0],q[1],ap[0],ap[1],'#111827',i===3?1.4:2,i===3?'5 4':'')});s+=ln8(ap[0],ap[1],ap[0],H+dy/2,Y8C.orange,1.6,'4 3')+tx8(A/2,H+16,`${a} cm`,{fs:14})+tx8(ap[0]+8,ap[1]+H/2,`h = ${h} cm`,{fs:14,a:'start',c:Y8C.orange});const E=Ext();b.concat([ap]).forEach(q=>E.add(q[0],q[1]));E.add(A/2,H+26);E.add(ap[0]+90,ap[1]+H/2);return svgFit(s,E,'',10)}
// ---------------- nets that fold (CSS 3D) ----------------
const NETS3D={
  cube:{n:'Cube',F:6,E:12,V:8,f:90,faces:[{p:[[0,0],[80,0],[80,80],[0,80]]},{par:0,e:0},{par:0,e:1},{par:0,e:2},{par:0,e:3},{par:3,e:2}],sq:80},
  cuboid:{n:'Cuboid',F:6,E:12,V:8,f:90,faces:[{p:[[0,0],[110,0],[110,60],[0,60]]},{par:0,e:0,h:50},{par:0,e:1,h:50},{par:0,e:2,h:50},{par:0,e:3,h:50},{par:3,e:2,h:60}]},
  tri:{n:'Triangular prism',F:5,E:9,V:6,f:120,faces:[{p:[[0,0],[70,0],[70,120],[0,120]]},{par:0,e:1,h:70},{par:0,e:3,h:70},{par:0,e:0,tri:true,fold:90},{par:0,e:2,tri:true,fold:90}]},
  pyr:{n:'Square-based pyramid',F:5,E:8,V:5,f:180-54.7356,faces:[{p:[[0,0],[90,0],[90,90],[0,90]]},{par:0,e:0,tri:true},{par:0,e:1,tri:true},{par:0,e:2,tri:true},{par:0,e:3,tri:true}]},
  tet:{n:'Tetrahedron',F:4,E:6,V:4,f:180-70.5288,faces:[{p:[[0,0],[100,0],[50,-86.6]]},{par:0,e:0,tri:true},{par:0,e:1,tri:true},{par:0,e:2,tri:true}]}};
function netFaces(def){   // each face in its own frame: hinge edge along the x-axis, face drawn above (negative y)
  const out=[];def.faces.forEach((f,i)=>{
    if(!f.par&&f.par!==0){out.push({poly:f.p,par:-1});return}
    const pp=out[f.par].poly,a=pp[f.e],b=pp[(f.e+1)%pp.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
    const h=f.tri?L*Math.sqrt(3)/2:(f.h||L);
    out.push({par:f.par,a,b,L,poly:f.tri?[[0,0],[L,0],[L/2,-h]]:[[0,0],[L,0],[L,-h],[0,-h]],fold:f.fold});
  });return out;
}
function netHTML(def,t){
  const F=netFaces(def),cols=['#93c5fd','#fca5a5','#86efac','#fde68a','#c4b5fd','#fdba74'];
  // parent frame of a face is its own polygon frame; the base face's polygon orientation decides the outward side
  const html=i=>{const f=F[i],kids=F.map((g,j)=>g.par===i?j:-1).filter(j=>j>=0);
    const xs=f.poly.map(p=>p[0]),ys=f.poly.map(p=>p[1]),x0=Math.min(...xs),y0=Math.min(...ys),w=Math.max(...xs)-x0,hh=Math.max(...ys)-y0;
    const svg=`<svg class="nf" style="left:${x0}px;top:${y0}px" width="${w}" height="${hh}" viewBox="${x0} ${y0} ${w} ${hh}"><polygon points="${ptsAttr(f.poly)}" fill="${cols[i%6]}" fill-opacity=".92" stroke="#1f2937" stroke-width="1.5"/></svg>`;
    let tr=f.par<0?`transform:translate(${f1(-sum(f.poly.map(p=>p[0]))/f.poly.length)}px,${f1(-sum(f.poly.map(p=>p[1]))/f.poly.length)}px)`:'';if(f.par>=0){const pf=F[f.par],cxp=sum(pf.poly.map(p=>p[0]))/pf.poly.length,cyp=sum(pf.poly.map(p=>p[1]))/pf.poly.length;let a=f.a,b=f.b;
      const ux=(b[0]-a[0])/f.L,uy=(b[1]-a[1])/f.L;if(((cxp-a[0])*(-uy)+(cyp-a[1])*ux)<0){a=f.b;b=f.a}   // keep the parent below the hinge (positive y in the child frame)
      const ang=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI,fold=(f.fold??def.f)*t;tr=`transform:translate(${f1(a[0])}px,${f1(a[1])}px) rotate(${f1(ang)}deg) rotateX(${f1(-fold)}deg)`}
    return `<div class="nfr" style="${tr}">${svg}${kids.map(html).join('')}</div>`};
  return html(0);
}
DEMOS.net={title:'Nets — fold them into 3D shapes',controls:[{id:'s',label:'Solid',type:'select',opts:Object.entries(NETS3D).map(([k,v])=>[k,v.n]),val:'cube'},{id:'t',label:'Fold',min:0,max:100,val:0,fmt:v=>v+'%'},{id:'turn',label:'Turn',min:-60,max:60,val:-20,fmt:v=>v+'°'}],
 render:s=>{const d=NETS3D[s.s],t=+s.t/100;return `<div class="net3d"><div class="netscene" style="transform:scale(1.6) rotateX(${40+20*t}deg) rotateZ(${+s.turn}deg)">${netHTML(d,t)}</div></div>`+box(`${d.n}: <b>${d.F}</b> faces, <b>${d.E}</b> edges, <b>${d.V}</b> vertices · Euler: F + V − E = ${d.F} + ${d.V} − ${d.E} = <b>2</b>`)}};

// ---------------- ratio ----------------
DEMOS.ratio={title:'Ratio bar model',controls:[{id:'mode',label:'Problem',type:'select',opts:[['share','Share an amount'],['simp','Simplify a ratio'],['scale','Scale a recipe']],val:'share',reset:true},{id:'a',label:'First part',min:1,max:9,val:3},{id:'b',label:'Second part',min:1,max:9,val:2},{id:'t',label:'Amount',min:10,max:200,step:5,val:60,when:s=>s.mode!=='simp'},{id:'k',label:'Multiply both by',min:2,max:6,val:4,when:s=>s.mode==='simp'}],
 steps:s=>{const a=+s.a,b=+s.b,T=+s.t;
  if(s.mode==='simp'){const k=+s.k,g=gcd(a*k,b*k);return [`Ratio ${a*k} : ${b*k}`,`HCF of ${a*k} and ${b*k} is ${g}.`,`Divide both parts by ${g}: <b>${a*k/g} : ${b*k/g}</b>`]}
  if(s.mode==='scale')return [`A recipe for ${a} people uses ${T} g.`,`For 1 person: ${T} ÷ ${a} = ${fmtNum(rd(T/a,2))} g`,`For ${b} people: ${fmtNum(rd(T/a,2))} × ${b} = <b>${fmtNum(rd(T*b/a,2))} g</b>`];
  const one=T/(a+b);return [`Total parts: ${a} + ${b} = ${a+b}`,`One part: ${T} ÷ ${a+b} = ${fmtNum(rd(one,2))}`,`Shares: ${a} × ${fmtNum(rd(one,2))} = <b>${fmtNum(rd(a*one,2))}</b> and ${b} × ${fmtNum(rd(one,2))} = <b>${fmtNum(rd(b*one,2))}</b>`]},
 render:s=>{const a=+s.a,b=+s.b,T=+s.t,k=s.k;
  if(s.mode==='simp'){const K=+s.k,g=gcd(a*K,b*K);return ratioBarSvg([a*K/g*(k>=3?1:g),b*K/g*(k>=3?1:g)].map(v=>Math.min(v,40)),{names:['A','B']})}
  if(s.mode==='scale')return ratioBarSvg([a],{names:[`${a} people`],per:k>=2?fmtNum(rd(T/a,1)):null})+ratioBarSvg([b],{names:[`${b} people`],per:k>=3?fmtNum(rd(T/a,1)):null});
  const one=fmtNum(rd(T/(a+b),2));return ratioBarSvg([a,b],{names:['A','B'],per:k>=2?one:null,shares:k>=3?[fmtNum(rd(a*T/(a+b),2)),fmtNum(rd(b*T/(a+b),2))]:false})}};

// ---------------- averages ----------------
DEMOS.stats={title:'Averages and range — edit the data',controls:[{id:'d',label:'Data (comma separated)',type:'text',val:'4, 7, 7, 9, 12, 15, 3, 7'}],
 steps:s=>{const v=(s.d.match(/-?\d+(\.\d+)?/g)||[]).map(Number);if(!v.length)return [];const o=[...v].sort((a,b)=>a-b),n=v.length,c={};v.forEach(x=>c[x]=(c[x]||0)+1);const mx=Math.max(...Object.values(c)),modes=Object.keys(c).filter(k=>c[k]===mx);
  return [`Order the data: ${lst(o)} (n = ${n})`,`Mode = most common: <b>${mx>1?modes.join(' and '):'no mode'}</b>`,`Median = middle value${n%2?'':' (mean of the middle two)'}: <b>${fmtNum(median8(v))}</b>`,`Mean = ${sum(v)} ÷ ${n} = <b>${fmtNum(rd(sum(v)/n,2))}</b>`,`Range = ${o[n-1]} − ${o[0]} = <b>${o[n-1]-o[0]}</b>`]},
 render:s=>{const v=(s.d.match(/-?\d+(\.\d+)?/g)||[]).map(Number);if(!v.length)return box('Type some numbers.');const lo=Math.min(...v),hi=Math.max(...v),W=420,X=x=>30+(x-lo)/((hi-lo)||1)*(W-60),c={};let g=ln8(20,150,W-20,150,'#111827',1.6);
  const st=niceStep(hi-lo||1)/(hi-lo>20?1:2);for(let x=Math.ceil(lo/st)*st;x<=hi;x+=st)g+=ln8(X(x),150,X(x),156,'#111827',1)+tx8(X(x),168,fmtNum(rd(x,2)),{fs:11,fw:500});
  v.forEach(x=>{c[x]=(c[x]||0)+1;g+=`<circle cx="${f1(X(x))}" cy="${150-c[x]*16}" r="6.5" fill="${Y8C.blue}"/>`});
  if(s.k>=3){const m=median8(v);g+=ln8(X(m),40,X(m),150,Y8C.green,2.4,'6 4')+tx8(X(m),32,'median',{fs:12,c:Y8C.green})}
  if(s.k>=4){const m=sum(v)/v.length;g+=ln8(X(m),50,X(m),150,Y8C.orange,2.4)+tx8(X(m),46,'mean',{fs:12,c:Y8C.orange})}
  if(s.k>=5)g+=`<path d="M${X(lo)},186 L${X(lo)},192 L${X(hi)},192 L${X(hi)},186" fill="none" stroke="${Y8C.purple}" stroke-width="2"/>`+tx8((X(lo)+X(hi))/2,204,'range',{fs:12,c:Y8C.purple});
  return svgWrap(g,W,212)}};

// ---------------- frequency table ----------------
DEMOS.freq={title:'Frequency table → mean, median, mode',controls:[0,1,2,3,4,5].map(i=>({id:'f'+i,label:`Frequency of ${i}`,min:0,max:12,val:[2,5,8,4,3,1][i]})),
 render:s=>{const f=[0,1,2,3,4,5].map(i=>+s['f'+i]),N=sum(f);if(!N)return box('All frequencies are 0.');const fx=f.map((v,i)=>v*i),mean=sum(fx)/N,cum=f.map((_,i)=>sum(f.slice(0,i+1))),med=(cum.findIndex(c=>c>=(N+1)/2)+cum.findIndex(c=>c>=(N+2)/2))/2,mode=f.indexOf(Math.max(...f));
  return barSvg(['0','1','2','3','4','5'],f,{max:12,w:340,h:200})+box(miniTable([['Value x',0,1,2,3,4,5,'Total'],['Frequency f',...f,N],['f × x',...fx,sum(fx)]])+`Mode = <b>${mode}</b> · Median = ${ord(Math.floor((N+1)/2))}${N%2?'':'/'+ord(N/2+1)} value = <b>${fmtNum(med)}</b> · Mean = ${sum(fx)} ÷ ${N} = <b>${fmtNum(rd(mean,2))}</b>`)}};

// ---------------- charts ----------------
DEMOS.charts={title:'Ways to display data',controls:[{id:'c',label:'Chart',type:'select',opts:[['bar','Bar chart'],['pie','Pie chart'],['stem','Stem-and-leaf'],['hist','Histogram'],['time','Time series']],val:'bar'}],
 render:s=>{const r=mkR(s.seed||(s.seed=rndSeed()));let out='';
  if(s.c==='bar'||s.c==='pie'){const lab=['Bus','Car','Walk','Bike'],v=lab.map(()=>r.int(3,15)),T=sum(v);
    if(s.c==='bar')out=barSvg(lab,v,{max:16})+box(`Read from the top of each bar across to the scale. Total = ${v.join(' + ')} = <b>${T}</b>`);
    else{let g='',a0=90;v.forEach((x,i)=>{const a1=a0+x/T*360,[x0,y0]=P(110,110,95,a0),[x1,y1]=P(110,110,95,a1);g+=`<path d="M110,110 L${f1(x0)},${f1(y0)} A95,95 0 ${x/T>.5?1:0} 0 ${f1(x1)},${f1(y1)} Z" fill="${['#60a5fa','#f87171','#4ade80','#facc15'][i]}" stroke="#fff" stroke-width="2"/>`;a0=a1});
      out=svgWrap(g,220,220)+box(miniTable([['Travel',...lab],['Frequency',...v],['Angle',...v.map(x=>fmtNum(rd(x/T*360,1))+'°')]])+`Angle = frequency ÷ ${T} × 360°`)}}
  else if(s.c==='stem'){const v=Array.from({length:13},()=>r.int(12,58)).sort((a,b)=>a-b),st={};v.forEach(x=>(st[Math.floor(x/10)]=st[Math.floor(x/10)]||[]).push(x%10));
    out=box(`<table class="mini sl"><tr><th>Stem</th><th>Leaf</th></tr>${Object.entries(st).map(([k,l])=>`<tr><td>${k}</td><td style="text-align:left">${l.join(' ')}</td></tr>`).join('')}</table>Key: 2 | 5 = 25 · Median = 7th value = <b>${v[6]}</b> · Range = ${v[12]} − ${v[0]} = <b>${v[12]-v[0]}</b>`)}
  else if(s.c==='hist'){const f=[0,1,2,3,4].map(()=>r.int(2,14));out=histSvg([140,150,160,170,180,190],f,{xt:'Height (cm)'})+box(`Continuous data: the bars touch. Modal class = <b>${140+f.indexOf(Math.max(...f))*10}–${150+f.indexOf(Math.max(...f))*10} cm</b>`)}
  else{const d=['Mon','Tue','Wed','Thu','Fri','Sat'],v=d.map(()=>r.int(8,24));out=lineChartSvg(d,v,{max:25})+box('Time goes along the horizontal axis. Look for the trend: is it rising, falling or staying level?')}
  return out+'<div class="row" style="justify-content:center"><button class="btn alt" data-new>New data</button></div>'},
 after:(v,s,redraw)=>{$('[data-new]',v).onclick=()=>{s.seed=rndSeed();redraw()}}};

// ---------------- spinner experiment ----------------
DEMOS.spinner={title:'Spinner — theory vs relative frequency',controls:[{id:'r',label:'Red sectors',min:0,max:8,val:3},{id:'b',label:'Blue sectors',min:0,max:8,val:2},{id:'g',label:'Green sectors',min:0,max:8,val:1}],
 render:s=>{const cnt={r:+s.r,b:+s.b,g:+s.g},tot=cnt.r+cnt.b+cnt.g,sig=`${cnt.r}${cnt.b}${cnt.g}`;if(s._sig!==sig){s._sig=sig;s.T={r:0,b:0,g:0,n:0};s.hist=[]}
  if(!tot)return box('Add some sectors!');const cols={r:'#dc2626',b:'#2563eb',g:'#16a34a'},keys=['r','b','g'];let g='',a0=90,order=[];keys.forEach(k=>{for(let j=0;j<cnt[k];j++)order.push(k)});
  order.forEach(k=>{const a1=a0+360/tot,[x0,y0]=P(100,100,85,a0),[x1,y1]=P(100,100,85,a1);g+=`<path d="M100,100 L${f1(x0)},${f1(y0)} A85,85 0 ${tot===1?1:0} 0 ${f1(x1)},${f1(y1)} Z" fill="${cols[k]}" stroke="#fff" stroke-width="2"/>`;a0=a1});
  if(s.last){const a=s.lastA;g+=ln8(100,100,...P(100,100,70,a),'#111827',4)}g+=`<circle cx="100" cy="100" r="6" fill="#111827"/>`;
  let ch='';if(s.hist.length>1){const W=260,H=150,n=s.hist.length;['r','b','g'].forEach(k=>{if(!cnt[k])return;ch+=`<polyline points="${s.hist.map((h,i)=>`${f1(30+i/(n-1)*(W-40))},${f1(H-20-h[k]*(H-30))}`).join(' ')}" fill="none" stroke="${cols[k]}" stroke-width="2"/>`+ln8(30,H-20-cnt[k]/tot*(H-30),W-10,H-20-cnt[k]/tot*(H-30),cols[k],1.2,'4 4')});ch=svgWrap(ln8(30,10,30,H-20,'#111827')+ln8(30,H-20,W-10,H-20,'#111827')+tx8(18,H-20,'0',{fs:10})+tx8(18,10+2,'1',{fs:10})+tx8(W/2,H-6,'number of spins',{fs:11,fw:500})+ch,W,H)}
  const rows=keys.map(k=>`<tr><td style="color:${cols[k]}"><b>${{r:'Red',b:'Blue',g:'Green'}[k]}</b></td><td>${cnt[k]}/${tot} = ${rd(cnt[k]/tot,3)}</td><td>${s.T[k]}/${s.T.n}${s.T.n?' = '+rd(s.T[k]/s.T.n,3):''}</td></tr>`).join('');
  return `<div class="row" style="justify-content:center;align-items:center">${svgWrap(g,200,200)}<div><div class="row"><button class="btn spin" data-k="1">Spin ×1</button><button class="btn spin" data-k="10">×10</button><button class="btn spin" data-k="100">×100</button><button class="btn alt spin" data-k="0">Reset</button></div><table class="mini"><tr><th>Colour</th><th>Theory</th><th>Relative frequency</th></tr>${rows}</table></div>${ch}</div>`},
 after:(v,s,redraw)=>{$$('.spin',v).forEach(b=>b.onclick=()=>{const k=+b.dataset.k,tot=+s.r+ +s.b+ +s.g;if(!k){s.T={r:0,b:0,g:0,n:0};s.hist=[];s.last=null}else for(let i=0;i<k;i++){const x=Math.random()*tot,key=x<+s.r?'r':x<+s.r+ +s.b?'b':'g';s.T[key]++;s.T.n++;s.last=key;s.lastA=90-x/tot*360;s.hist.push({r:s.T.r/s.T.n,b:s.T.b/s.T.n,g:s.T.g/s.T.n})}if(s.hist.length>300)s.hist=s.hist.filter((_,i)=>i%2===0);redraw()})}};

// ---------------- sample space ----------------
DEMOS.sample={title:'Sample space diagram',controls:[{id:'p',label:'Experiment',type:'select',opts:[['dd','Two dice'],['ds','Dice and 4-sided spinner'],['ss','Two 3-sided spinners']],val:'dd'},{id:'e',label:'Event',type:'select',opts:[['sum','Total = target'],['gt','Total > target'],['dbl','Both the same'],['even','Product is even']],val:'sum'},{id:'t',label:'Target',min:2,max:12,val:7,when:s=>s.e==='sum'||s.e==='gt'}],
 render:s=>{const A=[1,2,3,4,5,6].slice(0,s.p==='ss'?3:6),B=s.p==='dd'?[1,2,3,4,5,6]:s.p==='ds'?[1,2,3,4]:[1,2,3],t=+s.t,fn=s.e==='even'?'prod':'sum';
  const cond=(a,b)=>s.e==='sum'?a+b===t:s.e==='gt'?a+b>t:s.e==='dbl'?a===b:(a*b)%2===0,k=A.reduce((c,a)=>c+B.filter(b=>cond(a,b)).length,0),N=A.length*B.length;
  return box(ssTable(A,B,fn,(a,b)=>cond(a,b))+`<b>${k}</b> of the <b>${N}</b> equally likely outcomes → P = ${k}/${N}${k?` = <b>${frStr(k,N)}</b>`:''}`)}};

// ---------------- tree diagram ----------------
DEMOS.tree={title:'Tree diagram',controls:[{id:'mode',label:'Type',type:'select',opts:[['ind','Independent events'],['wr','Without replacement']],val:'ind',reset:true},{id:'p',label:'P(A) first event',min:.05,max:.95,step:.05,val:.3,when:s=>s.mode==='ind',fmt:v=>rd(v,2)},{id:'q',label:'P(A) second event',min:.05,max:.95,step:.05,val:.6,when:s=>s.mode==='ind',fmt:v=>rd(v,2)},{id:'R',label:'Red counters',min:1,max:8,val:4,when:s=>s.mode==='wr'},{id:'B',label:'Blue counters',min:1,max:8,val:3,when:s=>s.mode==='wr'},{id:'w',label:'Find',type:'select',opts:[['0','first AND second'],['12','exactly one'],['3','neither'],['03','same result']],val:'12'}],
 steps:s=>{const T=treeData(s),need=s.w.split('').map(Number);return [`First branches: ${T.p1.join(' and ')} (they add up to 1).`,`Second branches: ${T.p2[0].join(', ')} | ${T.p2[1].join(', ')}.`,`Multiply along each path: ${T.out.join('; ')}.`,`Add the paths you need: ${need.map(i=>T.val[i]).join(' + ')} = <b>${T.add(need)}</b>`]},
 render:s=>{const T=treeData(s);return treeSvg({n1:T.n,n2:T.n,p1:T.p1,p2:T.p2,out:T.out,show:Math.min(3,s.k),hl:s.k>=4?s.w.split('').map(Number):[],qs:['1st','2nd']})}};
function treeData(s){
  if(s.mode==='wr'){const R=+s.R,B=+s.B,n=R+B,den=n*(n-1),nums=[R*(R-1),R*B,B*R,B*(B-1)];return {n:['R','B'],p1:[`${R}/${n}`,`${B}/${n}`],p2:[[`${R-1}/${n-1}`,`${B}/${n-1}`],[`${R}/${n-1}`,`${B-1}/${n-1}`]],out:['RR','RB','BR','BB'].map((x,i)=>`${x}: ${frStr(nums[i],den)}`),val:nums.map(v=>frStr(v,den)),add:need=>frStr(sum(need.map(i=>nums[i])),den)}}
  const p=rd(+s.p,2),q=rd(+s.q,2),pr2=[p*q,p*(1-q),(1-p)*q,(1-p)*(1-q)].map(v=>rd(v,4));
  return {n:['A','not A'],p1:[String(p),String(rd(1-p,2))],p2:[[String(q),String(rd(1-q,2))],[String(q),String(rd(1-q,2))]],out:['A, A','A, not A','not A, A','not A, not A'].map((x,i)=>`${x}: ${pr2[i]}`),val:pr2.map(String),add:need=>String(rd(sum(need.map(i=>pr2[i])),4))};
}

// ---------------- sequences ----------------
DEMOS.seq={title:'Sequence builder and the nth term',controls:[{id:'a',label:'First term',min:-5,max:15,val:5},{id:'d',label:'Common difference',min:-5,max:8,val:3},{id:'n',label:'Find term number',min:1,max:100,val:20}],
 steps:s=>{const a=+s.a,d=+s.d,b=a-d,n=+s.n;return [`The terms go up by ${M(d)} each time, so the rule starts <b>${M(d)}n</b>.`,`${M(d)}n gives ${lst([1,2,3].map(i=>d*i))}… Each term of our sequence is ${M(b)} ${b>=0?'more':'less'} (the zero term is ${a} − ${sg(d)} = ${M(b)}).`,`nth term = <b>${nthText(d,b)}</b>`,`The ${ord(n)} term = ${M(d)} × ${n} ${b>=0?'+':'−'} ${Math.abs(b)} = <b>${d*n+b}</b>`]},
 render:s=>{const a=+s.a,d=+s.d,t=terms(a,d,6);let g='';const pos=Math.max(...t.map(Math.abs),1);
  t.forEach((v,i)=>{const x=20+i*72,n=Math.min(Math.abs(v),30);for(let j=0;j<n;j++)g+=`<circle cx="${x+(j%5)*11+6}" cy="${170-Math.floor(j/5)*11}" r="4.5" fill="${v<0?Y8C.orange:Y8C.blue}"/>`;g+=tx8(x+28,195,M(v),{fs:15,fw:800})+tx8(x+28,212,`n = ${i+1}`,{fs:11,fw:500,c:'#64748b'});if(i)g+=tx8(x-8,120,(d>=0?'+':'')+M(d),{fs:12,c:Y8C.green})});
  return svgWrap(g,450,222)+box(miniTable([['n',1,2,3,4,5,6],['term',...t.map(M)]]))}};

// ---------------- percentages ----------------
DEMOS.percent={title:'Percentage change with a multiplier',controls:[{id:'v',label:'Original amount',min:10,max:500,step:10,val:200},{id:'p',label:'Percentage change',min:-60,max:80,step:5,val:15},{id:'y',label:'Repeat (years)',min:1,max:6,val:1}],
 steps:s=>{const v=+s.v,p=+s.p,y=+s.y,m=rd(1+p/100,4);return [`${p>=0?'Increase':'Decrease'} by ${Math.abs(p)}% → you keep ${100+p}% of the amount.`,`Multiplier = ${100+p}% = <b>${m}</b>`,y>1?`Repeat ${y} times: ${v} × ${m}<sup>${y}</sup> = <b>${fmtNum(rd(v*m**y,2))}</b>`:`New amount = ${v} × ${m} = <b>${fmtNum(rd(v*m,2))}</b>`]},
 render:s=>{const v=+s.v,p=+s.p,m=1+p/100,W=420,u=300/Math.max(v,v*m**+s.y);let g='';
  g+=`<rect x="20" y="20" width="${f1(v*u)}" height="34" fill="${Y8C.blue}" fill-opacity=".8"/>`+tx8(26,37,`100% = ${v}`,{fs:13,fw:700,c:'#fff',a:'start'});
  const nv=v*m**+s.y;g+=`<rect x="20" y="70" width="${f1(nv*u)}" height="34" fill="${p>=0?Y8C.green:Y8C.orange}" fill-opacity=".85"/>`+tx8(26,87,`${fmtNum(rd(100*m**+s.y,2))}% = ${fmtNum(rd(nv,2))}`,{fs:13,fw:700,c:'#fff',a:'start'});
  return svgWrap(g,W,115)}};

// ---------------- curves (Year 10) ----------------
DEMOS.curve={title:'Graphs of functions',controls:[{id:'f',label:'Type',type:'select',opts:[['lin','Linear  y = ax + b'],['quad','Quadratic  y = ax² + b'],['rec','Reciprocal  y = a/x'],['cub','Cubic  y = ax³ + b']],val:'quad'},{id:'a',label:'a',min:-3,max:3,step:.5,val:1,fmt:half},{id:'b',label:'b',min:-6,max:6,val:-4},{id:'l',label:'Horizontal line y =',min:-6,max:6,val:0}],
 render:s=>{const a=+s.a||.5,b=+s.b,L=+s.l,f={lin:x=>a*x+b,quad:x=>a*x*x+b,rec:x=>a*4/x,cub:x=>a*x*x*x/4+b}[s.f];
  const xs=[];for(let x=-5;x<=5;x+=.01){const y1=f(x),y2=f(x+.01);if(Number.isFinite(y1)&&Number.isFinite(y2)&&(y1-L)*(y2-L)<=0&&Math.abs(y1-y2)<5)xs.push(rd(x+.005,1))}
  const roots=[...new Set(xs)];return curveSvg([{f,skip:s.f==='rec'},{f:()=>L,color:Y8C.orange}],{y0:-8,y1:8,pts:roots.map(x=>({x,y:L,color:Y8C.green}))})+box(`Solutions of ${{lin:`${half(a)}x + ${b}`,quad:`${half(a)}x² + ${b}`,rec:`${half(a*4)}/x`,cub:`${half(a/4)}x³ + ${b}`}[s.f]} = ${L}: <b>${roots.length?roots.map(x=>'x ≈ '+fmtNum(x)).join(', '):'none'}</b> (where the curve meets the line)`)}};

// demo for a lesson: its own, or a guess from its skills
const DEMO_BY_SKILL=[[/^y8_line|^lineY|^lineGraph/,'line'],[/sketch|gradient|lineIntercept|lineParallel/,'sketch'],[/realLine|conversion|fillBottle/,'real'],[/parallel|anglesVO|anglesBasic/,'parallel'],[/triAngle|exterior|triAlg/,'triangle'],[/poly|quad(Angle|Props)/,'polygon'],[/bearing/,'bearing'],[/transform|translate|reflect|rotate|enlarge/,'transform'],[/net|shapes3d/,'net'],[/prism|cuboid|surfaceArea|solids|volReal/,'solid'],[/ratio|scale|bestBuy|proportion/,'ratio'],[/avg|average|missingMean|compare|quartile|boxplot/,'stats'],[/freq/,'freq'],[/hist|pie|stemLeaf|timeSeries|barRead/,'charts'],[/prob(Vocab|Bag|Not|Exp)|relFreq/,'spinner'],[/sample|twoWay|probDice/,'sample'],[/tree|probIndep|probExclusive/,'tree'],[/seq|nth/,'seq'],[/perc|multiplier|compound|interest/,'percent'],[/y10_(curve|roots|intersect)/,'curve']];
function demoFor(l){if(l.demo)return l.demo;for(const s of l.skills||[])for(const [re,d] of DEMO_BY_SKILL)if(re.test(s))return d;return null}
