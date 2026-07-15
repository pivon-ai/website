/* Pivon neural-field background engine (harvested from heroA, kept verbatim).
   Safe no-op if #neural-canvas is absent. Honors prefers-reduced-motion. */
(function () {
  'use strict';
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, dpr, midX;
  let mouse = { x: -9999, y: -9999 };
  let raf;
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const RGB = { cyan:[34,199,242], blue:[47,107,236], violet:[122,60,238], magenta:[229,37,142] };
  let traces = [], nodes = [], pulses = [], particles = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.offsetWidth; H = canvas.offsetHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr, dpr);
    midX = W * 0.5; buildLeft(); buildRight();
    if (REDUCED) drawFrame(1);
  }
  function buildLeft() {
    traces = []; nodes = []; pulses = [];
    const pad=60, xMin=pad, xMax=midX-20, yMin=80, yMax=H-60;
    const cols=Math.max(3,Math.floor((xMax-xMin)/90)), rows=Math.max(4,Math.floor((yMax-yMin)/90));
    const gx=(xMax-xMin)/(cols-1), gy=(yMax-yMin)/(rows-1);
    const pts=[];
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)pts.push({x:xMin+c*gx+(Math.random()-.5)*gx*.3,y:yMin+r*gy+(Math.random()-.5)*gy*.3});
    const used=new Set();
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
      const key=`${i}-${j}`; if(used.has(key))continue;
      const dx=pts[j].x-pts[i].x,dy=pts[j].y-pts[i].y,dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<60||dist>220)continue; if(Math.random()>.55)continue; used.add(key);
      const elbow=Math.random()>.5?{x:pts[j].x,y:pts[i].y}:{x:pts[i].x,y:pts[j].y};
      traces.push([pts[i],elbow,pts[j]]); nodes.push({x:pts[i].x,y:pts[i].y}); nodes.push({x:pts[j].x,y:pts[j].y});
    }
    nodes=nodes.filter((n,i)=>{for(let j=0;j<i;j++)if(Math.abs(nodes[j].x-n.x)<4&&Math.abs(nodes[j].y-n.y)<4)return false;return true;});
    if(!REDUCED)pulses=traces.map((_,i)=>({traceIdx:i,t:Math.random(),speed:.0004+Math.random()*.0006,alpha:.5+Math.random()*.5}));
  }
  function buildRight() {
    particles=[]; const count=Math.min(120,Math.floor(W/8));
    for(let i=0;i<count;i++){const x=midX+20+Math.random()*(W-midX-40),y=60+Math.random()*(H-120);
      particles.push({x,y,ox:x,oy:y,vx:(Math.random()-.5)*.18,vy:(Math.random()-.5)*.18,r:1+Math.random()*1.4,phase:Math.random()*Math.PI*2,speed:.0004+Math.random()*.0006,alpha:.25+Math.random()*.55,hue:Math.random()});}
  }
  function lerpColor(a,b,t){return[Math.round(a[0]+(b[0]-a[0])*t),Math.round(a[1]+(b[1]-a[1])*t),Math.round(a[2]+(b[2]-a[2])*t)];}
  function gradColor(t){let c;if(t<.33)c=lerpColor(RGB.cyan,RGB.blue,t/.33);else if(t<.66)c=lerpColor(RGB.blue,RGB.violet,(t-.33)/.33);else c=lerpColor(RGB.violet,RGB.magenta,(t-.66)/.34);return`rgb(${c[0]},${c[1]},${c[2]})`;}
  function ptOnTrace(tr,t){if(t<=.5){const s=t/.5;return{x:tr[0].x+(tr[1].x-tr[0].x)*s,y:tr[0].y+(tr[1].y-tr[0].y)*s};}const s=(t-.5)/.5;return{x:tr[1].x+(tr[2].x-tr[1].x)*s,y:tr[1].y+(tr[2].y-tr[1].y)*s};}
  function tracePct(tr){return(tr[0].y+tr[2].y)/2/H;}
  function drawFrame(am){
    ctx.clearRect(0,0,W,H);
    traces.forEach(tr=>{ctx.beginPath();ctx.moveTo(tr[0].x,tr[0].y);ctx.lineTo(tr[1].x,tr[1].y);ctx.lineTo(tr[2].x,tr[2].y);ctx.strokeStyle=gradColor(tracePct(tr)*.6);ctx.lineWidth=.8;ctx.globalAlpha=.18*am;ctx.stroke();});
    ctx.globalAlpha=.55*am;nodes.forEach(n=>{ctx.beginPath();ctx.arc(n.x,n.y,2.2,0,Math.PI*2);ctx.fillStyle=gradColor(n.y/H*.5);ctx.fill();});
    if(!REDUCED){pulses.forEach(p=>{const tr=traces[p.traceIdx],pt=ptOnTrace(tr,p.t);const dx=pt.x-mouse.x,dy=pt.y-mouse.y,d=Math.sqrt(dx*dx+dy*dy),boost=d<140?1-d/140:0;const r=5+boost*8,grd=ctx.createRadialGradient(pt.x,pt.y,0,pt.x,pt.y,r);grd.addColorStop(0,gradColor(p.t));grd.addColorStop(1,'rgba(255,255,255,0)');ctx.beginPath();ctx.arc(pt.x,pt.y,r,0,Math.PI*2);ctx.fillStyle=grd;ctx.globalAlpha=(p.alpha+boost*.4)*am;ctx.fill();ctx.beginPath();ctx.arc(pt.x,pt.y,1.5+boost,0,Math.PI*2);ctx.fillStyle='#FFFFFF';ctx.globalAlpha=(.9+boost*.1)*am;ctx.fill();});}
    else{traces.forEach((tr,ti)=>{const t=ti/traces.length,pt=ptOnTrace(tr,.5);ctx.beginPath();ctx.arc(pt.x,pt.y,3,0,Math.PI*2);const grd=ctx.createRadialGradient(pt.x,pt.y,0,pt.x,pt.y,6);grd.addColorStop(0,gradColor(t*.6));grd.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=grd;ctx.globalAlpha=.6;ctx.fill();});}
    ctx.globalAlpha=.1*am;
    for(let i=0;i<particles.length;i++)for(let j=i+1;j<particles.length;j++){const a=particles[i],b=particles[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.sqrt(dx*dx+dy*dy);if(d>80)continue;const t=(a.hue+b.hue)*.5,mx=(a.x+b.x)/2+(Math.random()-.5)*10,my=(a.y+b.y)/2+(Math.random()-.5)*10;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(mx,my,b.x,b.y);ctx.strokeStyle=gradColor(.5+t*.5);ctx.lineWidth=.7;ctx.globalAlpha=(1-d/80)*.18*am;ctx.stroke();}
    particles.forEach(p=>{const dx=p.x-mouse.x,dy=p.y-mouse.y,d=Math.sqrt(dx*dx+dy*dy),boost=d<120?(1-d/120)*.5:0,col=gradColor(.5+p.hue*.5),r=p.r+boost*3;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fillStyle=col;ctx.globalAlpha=(p.alpha+boost)*am;ctx.fill();});
    const seamGrd=ctx.createLinearGradient(0,0,0,H);seamGrd.addColorStop(0,'#22C7F2');seamGrd.addColorStop(.33,'#2F6BEC');seamGrd.addColorStop(.66,'#7A3CEE');seamGrd.addColorStop(1,'#E5258E');
    ctx.globalAlpha=.28*am;ctx.beginPath();ctx.moveTo(midX,0);ctx.lineTo(midX,H);ctx.strokeStyle=seamGrd;ctx.lineWidth=1.5;ctx.stroke();
    const seamGlow=ctx.createLinearGradient(midX-30,0,midX+30,0);seamGlow.addColorStop(0,'rgba(255,255,255,0)');seamGlow.addColorStop(.5,'rgba(122,60,238,.07)');seamGlow.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=seamGlow;ctx.globalAlpha=1;ctx.fillRect(midX-30,0,60,H);
    ctx.globalAlpha=1;
  }
  let lastT=0;
  function tick(t){const dt=t-lastT;lastT=t;
    pulses.forEach(p=>{p.t+=p.speed*dt;if(p.t>1)p.t-=1;});
    particles.forEach(p=>{p.phase+=p.speed*dt;p.x=p.ox+Math.cos(p.phase)*18+Math.sin(p.phase*.7)*10;p.y=p.oy+Math.sin(p.phase*1.1)*14+Math.cos(p.phase*.5)*8;if(p.x>midX+10){const dx=mouse.x-p.x,dy=mouse.y-p.y,d=Math.sqrt(dx*dx+dy*dy);if(d<100&&d>1){p.ox+=dx/d*.12;p.oy+=dy/d*.12;p.ox=Math.max(midX+20,Math.min(W-20,p.ox));p.oy=Math.max(60,Math.min(H-60,p.oy));}}});
    drawFrame(1);raf=requestAnimationFrame(tick);
  }
  function init(){resize();if(REDUCED)return;raf=requestAnimationFrame(t=>{lastT=t;tick(t);});}
  window.addEventListener('resize',()=>{cancelAnimationFrame(raf);resize();if(!REDUCED)raf=requestAnimationFrame(t=>{lastT=t;tick(t);});});
  document.addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;});
  document.addEventListener('mouseleave',()=>{mouse.x=-9999;mouse.y=-9999;});
  canvas.style.width='100%';canvas.style.height='100%';
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(init);else init();
})();
