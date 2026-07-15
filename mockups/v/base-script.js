/* ============================================================================
   PIVON — site script
   1) neural-field background (verbatim from field.js / heroA)
   2) hero generative console
   3) scroll reveals
   4) mobile nav
   5) booking appointment picker (mock backend = console.log)
   Each module reads prefers-reduced-motion itself; that's intentional.
   ============================================================================ */

/* ─── 1 · NEURAL FIELD (verbatim) ────────────────────────────────────────── */
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

/* ─── 2 · HERO GENERATIVE CONSOLE (from heroC) ───────────────────────────── */
(function () {
  'use strict';
  const prompts = [
    { text: "we're starting from zero",
      headline: 'Take your company from <span class="grad-text">0 to 100</span> on AI.',
      chips: ['0→100 AI Boost', 'AI Consulting', 'Use-Case Evaluation', 'Solution Building'], activeChip: 0 },
    { text: "find our best use cases",
      headline: 'We rank what\'s worth building — <span class="grad-text">so you don\'t guess.</span>',
      chips: ['Use-Case Evaluation', 'AI Consulting', 'ROI Mapping', 'Effort / Impact'], activeChip: 0 },
    { text: "build us a support agent",
      headline: 'Design, build, and ship — <span class="grad-text">wired into your stack.</span>',
      chips: ['Solution Building', 'Integration', 'LLM Pipelines', 'Ship & Hand Over'], activeChip: 0 }
  ];

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const promptDisplay  = document.getElementById('promptDisplay');
  const outputHeadline = document.getElementById('outputHeadline');
  const outputChips    = document.getElementById('outputChips');
  const generatingBar  = document.getElementById('generatingBar');
  const promptBtns     = document.querySelectorAll('.prompt-btn');
  if (!promptDisplay || !outputHeadline) return;

  let activeTimers = [];
  const clearTimers = () => { activeTimers.forEach(t => clearTimeout(t)); activeTimers = []; };
  const later = (fn, d) => { const t = setTimeout(fn, d); activeTimers.push(t); return t; };

  function typeOn(el, text, charDelay, done) {
    el.textContent = '';
    if (prefersReduced) { el.textContent = text; if (done) done(); return; }
    let i = 0;
    (function next() {
      if (i < text.length) { el.textContent += text[i++]; later(next, charDelay + Math.random() * charDelay * 0.4); }
      else if (done) done();
    })();
  }

  function streamHeadline(el, html, done) {
    if (prefersReduced) { el.innerHTML = html; if (done) done(); return; }
    const temp = document.createElement('div'); temp.innerHTML = html;
    const tokens = [];
    temp.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach(p => { if (p) tokens.push({ type:'text', text:p }); });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        node.textContent.split(/(\s+)/).forEach(p => { if (p) tokens.push({ type:'span', text:p, cls:node.className }); });
      }
    });
    el.innerHTML = '';
    const spans = tokens.map(tok => {
      const outer = document.createElement('span'); outer.className = 'word-token';
      if (tok.type === 'span') { const inner = document.createElement('span'); inner.className = tok.cls; inner.textContent = tok.text; outer.appendChild(inner); }
      else outer.textContent = tok.text;
      el.appendChild(outer); return outer;
    });
    let idx = 0;
    (function reveal() {
      if (idx < spans.length) { spans[idx++].classList.add('revealed'); later(reveal, 55 + Math.random() * 25); }
      else if (done) done();
    })();
  }

  function showChips(data, activeIndex, delay) {
    outputChips.innerHTML = '';
    data.forEach((label, i) => {
      const chip = document.createElement('span');
      chip.className = 'chip' + (i === activeIndex ? ' active-chip' : '');
      chip.setAttribute('role', 'listitem'); chip.textContent = label;
      outputChips.appendChild(chip);
      if (prefersReduced) chip.classList.add('visible');
      else later(() => chip.classList.add('visible'), delay + i * 120);
    });
  }

  function runPrompt(index) {
    const data = prompts[index]; clearTimers();
    promptBtns.forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
      btn.setAttribute('aria-pressed', i === index ? 'true' : 'false');
    });
    typeOn(promptDisplay, data.text, 38, () => {
      if (prefersReduced) { outputHeadline.innerHTML = data.headline; showChips(data.chips, data.activeChip, 0); return; }
      later(() => { generatingBar.classList.add('visible'); outputHeadline.innerHTML = ''; outputChips.innerHTML = ''; }, 120);
      later(() => {
        generatingBar.classList.remove('visible');
        streamHeadline(outputHeadline, data.headline, () => showChips(data.chips, data.activeChip, 80));
      }, 900);
    });
  }

  promptBtns.forEach((btn, i) => {
    btn.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    btn.addEventListener('click', () => runPrompt(i));
  });

  if (prefersReduced) {
    promptDisplay.textContent = prompts[0].text;
    outputHeadline.innerHTML = prompts[0].headline;
    showChips(prompts[0].chips, prompts[0].activeChip, 0);
  } else {
    later(() => runPrompt(0), 600);
  }
})();

/* ─── 3 · SCROLL REVEALS ─────────────────────────────────────────────────── */
(function () {
  'use strict';
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('in')); return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  els.forEach(el => io.observe(el));
})();

/* ─── 4 · MOBILE NAV ─────────────────────────────────────────────────────── */
(function () {
  'use strict';
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  if (!toggle || !menu) return;
  const set = (open) => {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => set(menu.hidden));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => set(false)));
})();

/* ─── 5 · BOOKING APPOINTMENT PICKER ─────────────────────────────────────── */
(function () {
  'use strict';
  const card = document.getElementById('bkCard');
  if (!card) return;

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // Booking window: weekdays from tomorrow through ~24 calendar days out (~16 business days).
  const today = new Date(); today.setHours(0,0,0,0);
  const minDate = new Date(today); minDate.setDate(minDate.getDate() + 1);
  const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + 24);
  const startMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

  let viewMonth = new Date(startMonth);
  const state = { date: null, slot: null };

  const calLabel = document.getElementById('calLabel');
  const calGrid  = document.getElementById('calGrid');
  const calPrev  = document.getElementById('calPrev');
  const calNext  = document.getElementById('calNext');
  const slotGrid = document.getElementById('slotGrid');
  const chosenDate = document.getElementById('chosenDate');
  const chosenSlot = document.getElementById('chosenSlot');
  const toDetails = document.getElementById('toDetails');
  const stepper = document.getElementById('bkStepper');
  const panels = card.querySelectorAll('.bk-panel');
  const steps = stepper.querySelectorAll('.step');

  const sameDay = (a, b) => a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
  const isWeekend = (d) => d.getDay()===0 || d.getDay()===6;
  const fmtDate = (d) => `${DOW[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  // Local YYYY-MM-DD — NOT toISOString(), which shifts to UTC and can roll the day back.
  const isoLocal = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  function gotoStep(n) {
    panels.forEach(p => { p.hidden = p.dataset.panel !== String(n); });
    steps.forEach(s => {
      const sn = Number(s.dataset.step);
      s.classList.toggle('active', sn === Number(n));
      s.classList.toggle('done', sn < Number(n));
    });
    stepper.hidden = false;
  }

  /* — calendar — */
  function renderCalendar() {
    calLabel.textContent = `${MONTHS[viewMonth.getMonth()]} ${viewMonth.getFullYear()}`;
    calPrev.disabled = viewMonth <= startMonth;
    calNext.disabled = viewMonth >= endMonth;
    calGrid.innerHTML = '';
    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7; // Monday-first
    const days = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    for (let i = 0; i < offset; i++) {
      const b = document.createElement('button');
      b.className = 'empty'; b.disabled = true; b.tabIndex = -1; b.setAttribute('aria-hidden','true');
      calGrid.appendChild(b);
    }
    for (let day = 1; day <= days; day++) {
      const d = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = String(day);
      const selectable = !isWeekend(d) && d >= minDate && d <= maxDate;
      if (!selectable) { b.disabled = true; }
      else {
        b.setAttribute('aria-label', fmtDate(d));
        if (sameDay(d, state.date)) b.classList.add('sel');
        b.addEventListener('click', () => {
          state.date = d; state.slot = null;
          renderCalendar();
          chosenDate.firstChild.textContent = fmtDate(d) + ' ';
          renderSlots();
          gotoStep(2);
        });
      }
      calGrid.appendChild(b);
    }
  }

  /* — time slots (09:00–16:30, 30-min; a few "taken" per day for realism) — */
  function renderSlots() {
    slotGrid.innerHTML = '';
    const taken = new Set([3, 11, (state.date.getDate() % 12)]); // deterministic per-date
    let idx = 0;
    for (let m = 9 * 60; m <= 16 * 60 + 30; m += 30, idx++) {
      const label = `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = label;
      if (taken.has(idx)) { b.disabled = true; b.setAttribute('aria-label', label + ' — unavailable'); }
      else {
        if (state.slot === label) b.classList.add('sel');
        b.addEventListener('click', () => {
          state.slot = label;
          slotGrid.querySelectorAll('button').forEach(x => x.classList.remove('sel'));
          b.classList.add('sel');
          toDetails.disabled = false;
        });
      }
      slotGrid.appendChild(b);
    }
    toDetails.disabled = !state.slot;
  }

  /* — step navigation — */
  card.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => gotoStep(Number(btn.dataset.goto)));
  });
  toDetails.addEventListener('click', () => {
    chosenSlot.firstChild.textContent = `${fmtDate(state.date)} · ${state.slot} `;
    gotoStep(3);
  });

  /* — details + submit — */
  const form = document.getElementById('bkForm');
  const emailInput = document.getElementById('f-email');
  const emailErr = document.getElementById('err-email');
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const email = String(fd.get('email') || '').trim();
    if (!EMAIL_RE.test(email)) {
      emailErr.hidden = false; emailInput.setAttribute('aria-invalid', 'true'); emailInput.focus();
      return;
    }
    emailErr.hidden = true; emailInput.removeAttribute('aria-invalid');

    const payload = {
      date: isoLocal(state.date),
      time: state.slot,
      name: String(fd.get('name') || '').trim(),
      email,
      company: String(fd.get('company') || '').trim(),
      teamSize: String(fd.get('teamSize') || ''),
      topic: String(fd.get('topic') || '').trim()
    };

    // ponytail: mock backend. Swap this console.log for a real POST when the
    // calendar endpoint exists, e.g. fetch('/api/book', {method:'POST', body: JSON.stringify(payload)}).
    console.log('PIVON booking (stub):', payload);

    document.getElementById('doneSummary').textContent =
      `${fmtDate(state.date)} at ${state.slot}. A confirmation would go to ${email}.`;
    panels.forEach(p => { p.hidden = p.dataset.panel !== 'done'; });
    stepper.hidden = true;
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  renderCalendar();
})();
