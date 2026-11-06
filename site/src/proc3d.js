/* Дом собирается брус за брусом. Исходник, собирается в proc3d.min.js. */
import {WebGLRenderer,Scene,PerspectiveCamera,Color,AmbientLight,DirectionalLight,MeshLambertMaterial,LineBasicMaterial,BoxGeometry,Mesh,LineSegments,EdgesGeometry,Vector3,BufferGeometry,Float32BufferAttribute} from 'three';
export function init(canvas,box){
  const r=new WebGLRenderer({canvas,antialias:true,alpha:true});
  const scene=new Scene(),cam=new PerspectiveCamera(26,1,.1,300);
  const PAPER=new Color('#ECE6D8'),INK=new Color('#22242A');
  scene.add(new AmbientLight('#fff',2.3));const sun=new DirectionalLight('#fff',1.5);sun.position.set(14,20,18);scene.add(sun);
  const mW=new MeshLambertMaterial({color:PAPER,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
  const mL=new LineBasicMaterial({color:INK}),mPlan=new LineBasicMaterial({color:INK,transparent:true});
  const W=12,D=8,H=.24,TK=.2,OV=.32,CR=13;
  const box3=(len,h,t)=>{const g=new BoxGeometry(len,h,t),m=new Mesh(g,mW);m.add(new LineSegments(new EdgesGeometry(g),mL));return m};
  const beams=[];
  const add=(len,x,y,z,along)=>{const m=box3(len,H*.98,TK);m.userData={to:new Vector3(x,y,z),ry:along==='z'?Math.PI/2:0};scene.add(m);beams.push(m)};
  const open={front:[[-3.6,-1.5,3,11],[-.5,.6,0,11],[1.8,4.2,3,11]],back:[[-2.5,-1,5,11],[1.5,3,5,11]],left:[[-1.2,1.2,3,11]],right:[[-1,1,3,11]]};
  const spans=(a,b,ops,k)=>{let c=[[a,b]];for(const[o0,o1,k0,k1]of ops){if(k<k0||k>k1)continue;c=c.flatMap(([p,q])=>o1<=p||o0>=q?[[p,q]]:[[p,o0],[o1,q]].filter(s=>s[1]-s[0]>.05))}return c};
  for(let k=0;k<CR;k++){const y=H/2+k*H;
    for(const[s,e]of spans(-W/2-OV,W/2+OV,open.front,k))add(e-s,(s+e)/2,y,D/2,'x');
    for(const[s,e]of spans(-W/2-OV,W/2+OV,open.back,k))add(e-s,(s+e)/2,y,-D/2,'x');
    for(const[s,e]of spans(-D/2-OV,D/2+OV,open.left,k))add(e-s,-W/2,y+H/2,(s+e)/2,'z');
    for(const[s,e]of spans(-D/2-OV,D/2+OV,open.right,k))add(e-s,W/2,y+H/2,(s+e)/2,'z')}
  const RH=2.5,GN=Math.round(RH/H);
  for(let k=0;k<GN;k++){const y=H/2+(CR+k)*H+H/2,hw=(D/2+.1)*(1-k/GN);for(const x of[-W/2,W/2])add(hw*2,x,y,0,'z')}
  /* штабель перед домом, внутри кадра */
  const NB=beams.length,COLS=16;
  /* верхние ряды уходят на стены первыми, поэтому штабель тает сверху */
  beams.forEach((m,i)=>{const n=NB-1-i,row=Math.floor(n/COLS),col=n%COLS;m.userData.from=new Vector3(-1.5,H/2+row*H,D/2+2.7+col*.24);m.userData.delay=i/NB});
  const top=CR*H+H,ridge=top+RH,rise=RH+.28,run=D/2+.7,L=Math.hypot(run,rise),ang=Math.atan2(rise,run);
  const rafters=[];
  for(let x=-W/2-.5;x<=W/2+.51;x+=1.1)for(const s of[1,-1]){const g=new BoxGeometry(.1,.16,L),m=new Mesh(g,mW);m.add(new LineSegments(new EdgesGeometry(g),mL));m.rotation.x=s*ang;m.position.set(x,ridge-rise/2,s*run/2);m.userData.y=m.position.y;scene.add(m);rafters.push(m)}
  const roofs=[],RL=W+1.6;
  for(const s of[1,-1]){const g=new BoxGeometry(RL,.1,L+.1),m=new Mesh(g,mW);m.add(new LineSegments(new EdgesGeometry(g),mL));const lp=[];for(let t=-L/2;t<L/2;t+=.42)lp.push(-RL/2,.051,t,RL/2,.051,t);const lg=new BufferGeometry();lg.setAttribute('position',new Float32BufferAttribute(lp,3));m.add(new LineSegments(lg,mL));m.rotation.x=s*ang;m.position.set(0,ridge+.1-rise/2,s*run/2);m.userData.y=m.position.y;scene.add(m);roofs.push(m)}
  /* план: контур, стены, дверь, размеры */
  const pl=[],seg=(a,b,c,d)=>pl.push(a,.01,b,c,.01,d);
  [[-W/2,-D/2,W/2,-D/2],[W/2,-D/2,W/2,D/2],[W/2,D/2,-W/2,D/2],[-W/2,D/2,-W/2,-D/2],[-W/2+.2,-D/2+.2,W/2-.2,-D/2+.2],[W/2-.2,-D/2+.2,W/2-.2,D/2-.2],[W/2-.2,D/2-.2,-W/2+.2,D/2-.2],[-W/2+.2,D/2-.2,-W/2+.2,-D/2+.2],[-1.5,-D/2,-1.5,1],[-1.5,1,-W/2,1],[2,D/2,2,-1],[2,-1,W/2,-1],[2,-1,-.2,-1],[-5,-D/2,-5,1]].forEach(q=>seg(...q));
  for(let a=0;a<1.57;a+=.12)seg(-.5+1.1*Math.cos(a),D/2-1.1*Math.sin(a),-.5+1.1*Math.cos(a+.12),D/2-1.1*Math.sin(a+.12));
  [[-W/2,D/2+1.2,W/2,D/2+1.2],[-W/2,D/2+1,-W/2,D/2+1.4],[W/2,D/2+1,W/2,D/2+1.4],[W/2+1.2,-D/2,W/2+1.2,D/2],[W/2+1,-D/2,W/2+1.4,-D/2],[W/2+1,D/2,W/2+1.4,D/2]].forEach(q=>seg(...q));
  const pg=new BufferGeometry();pg.setAttribute('position',new Float32BufferAttribute(pl,3));const plan=new LineSegments(pg,mPlan);scene.add(plan);const PN=pl.length/3;
  const ss=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
  const camA=new Vector3(0,46,.01),camB=new Vector3(25,13,33),look=new Vector3();let cur=0,mob=false;
  function render(p){cur=p;
    const c=ss(.16,.28,p);cam.position.lerpVectors(camA,camB,c).multiplyScalar(mob?1.6+.42*c:1.04);
    look.set(1.2*c,1.2*c,1.2*c);cam.up.set(0,c<.02?0:1,c<.02?-1:0);cam.lookAt(look);
    plan.geometry.setDrawRange(0,Math.floor(PN*ss(-.08,.16,p)/2)*2);
    const dl=1-ss(.4,.5,p);
    const b=(p-.5)/.26;
    beams.forEach(m=>{const u=m.userData,t=Math.min(1,Math.max(0,(b-u.delay*.9)/.1)),e=t*t*(3-2*t);
      const show=ss(.27+(1-u.delay)*.1,.28+(1-u.delay)*.1,p);m.visible=show>0;m.scale.y=Math.max(.001,show);
      m.position.lerpVectors(u.from,u.to,e);m.position.x+=dl*(1-e)*6;m.position.y+=Math.sin(e*Math.PI)*2.4;m.rotation.y=u.ry*e});
    const ra=(p-.76)/.06;rafters.forEach((m,i)=>{const t=Math.min(1,Math.max(0,ra*1.3-i/rafters.length*.3));m.visible=t>0;m.position.y=m.userData.y+(1-t)*3});
    const rf=ss(.82,.87,p);roofs.forEach(m=>{m.visible=rf>0;m.position.y=m.userData.y+(1-rf)*4});
    r.render(scene,cam)}
  function resize(){const w=box.clientWidth,h=box.clientHeight;mob=w<768;r.setPixelRatio(Math.min(devicePixelRatio,mob?1.5:2));r.setSize(w,h,false);cam.aspect=w/h;
    /* дом сдвинут от текста: вправо на компьютере, вниз на телефоне */
    if(mob)cam.setViewOffset(w,h,0,-h*.08,w,h);else cam.setViewOffset(w,h,-w*.17,h*.02,w,h);
    cam.updateProjectionMatrix();render(cur)}
  resize();
  return {render,resize};
}
