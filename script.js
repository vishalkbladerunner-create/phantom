/* ==============================================================
   PHANTOM POST — SCRIPT
   ============================================================== */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Loader ---------- */
(function loader(){
  const el  = document.querySelector('.loader');
  const pct = document.getElementById('loaderPct');
  if (!el) return;
  let v = 0;
  const tick = () => {
    v = Math.min(100, v + Math.random() * 18 + 4);
    if (pct) pct.textContent = String(Math.floor(v)).padStart(3, '0');
    if (v < 100) setTimeout(tick, 90 + Math.random() * 100);
  };
  tick();
  const done = () => setTimeout(() => el.classList.add('is-done'), 600);
  if (document.readyState === 'complete') done();
  else window.addEventListener('load', done);
  setTimeout(done, 2400); // hard cap
})();

/* ---------- Filed date in hero side rail ---------- */
(function filedDate(){
  const el = document.getElementById('filedDate');
  if (!el) return;
  const d = new Date();
  el.textContent = d.toISOString().slice(0,10).replace(/-/g,'.');
})();

/* ---------- Footer year ---------- */
(function year(){
  const el = document.getElementById('footYear');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ---------- Nav scroll state ---------- */
(function navScroll(){
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const upd = () => nav.classList.toggle('is-scrolled', window.scrollY > 30);
  upd();
  window.addEventListener('scroll', upd, { passive: true });
})();

/* ---------- Reveal on scroll ---------- */
(function reveal(){
  const els = document.querySelectorAll('.reveal');
  if (!els.length || !('IntersectionObserver' in window)) {
    els.forEach(e => e.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('is-visible');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ---------- Manifesto in-view (triggers strike line) ---------- */
(function manifestoView(){
  const sec = document.querySelector('.manifesto');
  if (!sec || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(([en]) => {
    if (en.isIntersecting) { sec.classList.add('is-in-view'); io.disconnect(); }
  }, { threshold: 0.35 });
  io.observe(sec);
})();

/* ---------- Counters ---------- */
(function counters(){
  const els = document.querySelectorAll('[data-count]');
  if (!els.length || !('IntersectionObserver' in window)) {
    els.forEach(e => e.textContent = e.getAttribute('data-count'));
    return;
  }
  const ease = t => 1 - Math.pow(1 - t, 3);
  const animate = (el) => {
    const target = parseFloat(el.getAttribute('data-count')) || 0;
    const fromAttr = el.getAttribute('data-count-from');
    const fromVal = fromAttr !== null ? parseFloat(fromAttr) : 0;
    const isCountDown = fromAttr !== null;
    const dur = 1700; const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = ease(p);
      if (isCountDown) {
        el.textContent = Math.round(fromVal - eased * (fromVal - target));
      } else {
        el.textContent = Math.round(eased * target);
      }
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) { animate(en.target); io.unobserve(en.target); }
    });
  }, { threshold: 0.4 });
  els.forEach(el => io.observe(el));
})();

/* ---------- Process rail fill ---------- */
(function rail(){
  const fill  = document.getElementById('railFill');
  const stage = document.querySelector('.process-stage');
  if (!fill || !stage) return;
  const upd = () => {
    const r = stage.getBoundingClientRect();
    const vh = window.innerHeight;
    const startY = vh * 0.7;
    const endY   = vh * 0.2;
    const total = r.height;
    const traveled = Math.min(total, Math.max(0, startY - r.top));
    const span = total - (vh - endY - startY);
    const pct = Math.max(0, Math.min(1, traveled / Math.max(total, 1)));
    fill.style.height = (pct * 100) + '%';
  };
  upd();
  window.addEventListener('scroll', upd, { passive: true });
  window.addEventListener('resize', upd);
})();

/* ---------- Bento cursor glow ---------- */
(function bentoGlow(){
  document.querySelectorAll('.bento-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width  * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top ) / r.height * 100) + '%');
    });
  });
})();

/* ---------- Magnetic buttons ---------- */
(function magnetic(){
  if (REDUCED) return;
  const els = document.querySelectorAll('[data-magnetic]');
  els.forEach(el => {
    let raf;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top  + r.height / 2);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
      });
    });
    el.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      el.style.transform = '';
    });
  });
})();

/* ---------- Scramble text on hover for hero "visible" ---------- */
(function scramble(){
  if (REDUCED) return;
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-_\\/[]{}—=+*^?#';
  const run = (el) => {
    const text = el.dataset.text || el.textContent;
    const len = text.length;
    let frame = 0;
    const total = 26;
    const pick = () => CHARS[Math.floor(Math.random() * CHARS.length)];
    const tick = () => {
      frame++;
      let out = '';
      for (let i = 0; i < len; i++){
        const reveal = Math.floor((frame / total) * len);
        out += i < reveal ? text[i] : (text[i] === ' ' ? ' ' : pick());
      }
      el.textContent = out;
      if (frame < total) requestAnimationFrame(tick);
      else el.textContent = text;
    };
    tick();
  };
  document.querySelectorAll('.scramble').forEach(el => {
    el.addEventListener('mouseenter', () => run(el));
  });
  // Run once on load after entrance animation
  setTimeout(() => document.querySelectorAll('.scramble').forEach(run), 1700);
})();

/* ---------- Proof chart scroll reveal ---------- */
(function chartReveal(){
  const chart = document.getElementById('proofChart');
  if (!chart || !('IntersectionObserver' in window)) {
    if (chart) chart.classList.add('is-visible');
    return;
  }
  const io = new IntersectionObserver(([en]) => {
    if (en.isIntersecting) {
      chart.classList.add('is-visible');
      io.disconnect();
    }
  }, { threshold: 0.25 });
  io.observe(chart);
})();

/* ---------- Phase IV Compounding Loop graph scroll reveal ---------- */
(function phase4Reveal(){
  const card = document.getElementById('phase4Graph');
  if (!card || !('IntersectionObserver' in window)) {
    if (card) card.classList.add('is-visible');
    return;
  }
  const io = new IntersectionObserver(([en]) => {
    if (en.isIntersecting) {
      card.classList.add('is-visible');
      io.disconnect();
    }
  }, { threshold: 0.3 });
  io.observe(card);
})();

/* ---------- Contact form ---------- */
(function form(){
  const f = document.getElementById('contactForm');
  const ok = document.getElementById('formSuccess');
  if (!f) return;
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    ok && ok.classList.add('is-shown');
    f.reset();
    setTimeout(() => ok && ok.classList.remove('is-shown'), 5000);
  });
})();

/* ==============================================================
   FLOW-FIELD HERO BACKGROUND
   Particles drifting through a Perlin-ish noise field, with
   subtle mouse repulsion. Brand orange + electric blue.
   ============================================================== */
(function flowField(){
  const cv = document.getElementById('flow-canvas');
  if (!cv || REDUCED) return;
  const ctx = cv.getContext('2d', { alpha: true });
  let W = 0, H = 0, DPR = Math.min(2, window.devicePixelRatio || 1);
  let particles = [];
  let mouse = { x: -9999, y: -9999, active: false };
  const TAU = Math.PI * 2;

  /* simplex-ish 2D value noise (cheap & smooth enough) */
  const perm = new Uint8Array(512);
  for (let i = 0; i < 256; i++) perm[i] = i;
  for (let i = 255; i > 0; i--){
    const j = (Math.random() * (i + 1)) | 0;
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + (b - a) * t;
  const grad = (h, x, y) => {
    const a = h & 7;
    const u = a < 4 ? x : y, v = a < 4 ? y : x;
    return ((a & 1) ? -u : u) + ((a & 2) ? -2*v : 2*v);
  };
  const noise = (x, y) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    x -= Math.floor(x); y -= Math.floor(y);
    const u = fade(x), v = fade(y);
    const A = perm[X] + Y, B = perm[X+1] + Y;
    return lerp(
      lerp(grad(perm[A], x, y),     grad(perm[B], x-1, y), u),
      lerp(grad(perm[A+1], x, y-1), grad(perm[B+1], x-1, y-1), u),
      v
    ) * 0.5; // -1..1
  };

  const resize = () => {
    const r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width  = Math.floor(W * DPR);
    cv.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    initParticles();
  };

  const COUNT = () => Math.floor(Math.min(280, (W * H) / 6500));

  const initParticles = () => {
    const n = COUNT();
    particles = new Array(n).fill(0).map(() => ({
      x: Math.random() * W,
      y: Math.random() * H,
      px: 0, py: 0,
      life: Math.random() * 240 + 80,
      hue: Math.random() < 0.55 ? 22 : 220, // orange or blue
      a: 0
    }));
    particles.forEach(p => { p.px = p.x; p.py = p.y; });
  };

  let t = 0;
  const step = () => {
    // gentle trail fade
    ctx.fillStyle = 'rgba(5, 8, 16, 0.08)';
    ctx.fillRect(0, 0, W, H);

    t += 0.0018;
    const SCALE = 0.0022;
    const SPEED = 0.9;

    for (let i = 0; i < particles.length; i++){
      const p = particles[i];
      p.px = p.x; p.py = p.y;

      const angle = noise(p.x * SCALE, p.y * SCALE + t) * TAU * 1.6;
      let vx = Math.cos(angle) * SPEED;
      let vy = Math.sin(angle) * SPEED;

      // mouse repulsion
      if (mouse.active){
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d2 = dx*dx + dy*dy;
        if (d2 < 22000){
          const f = (1 - d2 / 22000) * 2.6;
          const inv = 1 / (Math.sqrt(d2) + 0.001);
          vx += dx * inv * f;
          vy += dy * inv * f;
        }
      }

      p.x += vx; p.y += vy;
      p.life--; p.a = Math.min(0.55, p.a + 0.02);

      const off = p.x < -10 || p.x > W+10 || p.y < -10 || p.y > H+10;
      if (off || p.life <= 0){
        p.x = Math.random() * W; p.y = Math.random() * H;
        p.px = p.x; p.py = p.y;
        p.life = Math.random() * 240 + 80;
        p.a = 0;
        continue;
      }

      const sat = p.hue === 22 ? 100 : 90;
      const lit = p.hue === 22 ? 55  : 60;
      ctx.strokeStyle = `hsla(${p.hue}, ${sat}%, ${lit}%, ${p.a})`;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(p.px, p.py);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    raf = requestAnimationFrame(step);
  };

  let raf;
  const start = () => { cancelAnimationFrame(raf); step(); };

  cv.addEventListener('mousemove', (e) => {
    const r = cv.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.active = true;
  });
  cv.addEventListener('mouseleave', () => { mouse.active = false; });

  // Pause when hero out of view (perf)
  const hero = document.querySelector('.hero');
  if (hero && 'IntersectionObserver' in window){
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) start();
      else cancelAnimationFrame(raf);
    }, { threshold: 0.05 });
    io.observe(hero);
  }

  window.addEventListener('resize', resize);
  resize();
  start();
})();

/* ==============================================================
   TYPOGRAPHIC STORM v2 — Scroll-driven narrative (GSAP + Physics)
   Chaos → Filter → Align → Ship → Network → Reveal
   ============================================================== */
(function typographicStorm(){
  const wrap = document.querySelector('.hero-wrap');
  const cv = document.getElementById('storm-canvas');
  const heroContent = document.getElementById('heroContent');
  const scrollIndicator = document.querySelector('.hero-scroll');
  const overlays = document.querySelectorAll('.storm-overlay');

  if (!cv || !wrap) return;
  if (REDUCED) {
    if (heroContent) heroContent.classList.add('is-revealed');
    if (scrollIndicator) scrollIndicator.style.display = 'none';
    return;
  }

  const ctx = cv.getContext('2d', { alpha: true });
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  const TAU = Math.PI * 2;
  let W = 0, H = 0, time = 0, raf;

  // Scroll progress driven by GSAP ScrollTrigger
  let progress = 0;
  let prevProgress = 0;
  let velocity = 0;

  // Word databases
  const NOISE = [
    'maybe','sort of','I guess','unclear','noise','doubt','probably','somewhat',
    'vague','random','scattered','unfocused','hesitant','tentative','uncertain',
    'confused','cluttered','messy','disjointed','fragmented','wandering','lost',
    'static','blur','guess','ordinary','generic','bland','weak','faded'
  ];
  const SIGNAL = [
    'conviction','thesis','principle','observation','pattern','insight','belief',
    'framework','strategy','vision','authority','clarity','purpose','position',
    'edge','signal','narrative','voice','resonance','platform','identity',
    'instinct','judgment','wisdom','architecture','machine','infrastructure'
  ];
  const PHRASES = [
    ['We','excavate','the','conviction'],
    ["you've",'never','written','down.'],
    ['We','codify','your','voice'],
    ['into','a','system','of'],
    ['precision.','We','ship','on'],
    ['cadence.','You','remain','the'],
    ['only','mind.','Reputation','compounds.']
  ];
  const TITLES = [
    'On Market Timing','The Operator\'s Edge','Why We Build','Against Consensus',
    'The Quiet Architecture','Signal & Noise','Founder Conviction',
    'Building in Public','The Invisible Machine','Reputation as Infrastructure'
  ];

  const WORD_COUNT = 180;
  let words = [];
  let phraseWords = [];
  let sparkles = [];
  let pubTitles = [];
  let orbitDots = [];
  let grain = [];
  let dustMotes = [];
  let pulseRings = [];

  // Utils
  function lerp(a, b, t){ return a + (b - a) * t; }
  function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }
  function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }
  function easeInOutCubic(t){ return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }
  function easeOutExpo(t){ return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  function spring(current, target, vel, tension, friction, dt){
    const ax = (target - current) * tension;
    vel += ax * dt;
    vel *= friction;
    return { value: current + vel * dt, velocity: vel };
  }

  // ---- Initialization ----

  function initWords(){
    words = [];
    for (let i = 0; i < WORD_COUNT; i++){
      const isSignal = Math.random() < 0.30;
      const text = isSignal ?
        SIGNAL[Math.floor(Math.random() * SIGNAL.length)] :
        NOISE[Math.floor(Math.random() * NOISE.length)];
      const angle = Math.random() * TAU;
      const radius = 60 + Math.random() * Math.min(W, H) * 0.34;
      const depth = Math.random();
      words.push({
        text, isSignal, angle, radius, depth,
        speed: 0.12 + Math.random() * 0.4,
        offset: Math.random() * TAU,
        rot: (Math.random() - 0.5) * 45,
        baseOp: 0.15 + Math.random() * 0.45,
        baseSize: (W < 600 ? 13 : 10) + Math.random() * (W < 600 ? 16 : 13),
        x: 0, y: 0, vx: 0, vy: 0,
        opacity: 0, scale: 1, rotation: 0,
        idx: i,
        mass: 0.8 + Math.random() * 0.4,
        tension: 0.04 + Math.random() * 0.02,
        friction: 0.86 + Math.random() * 0.06
      });
    }
  }

  function initPhraseWords(){
    phraseWords = [];
    const flat = PHRASES.flat();
    const colW = W < 600 ? 72 : 130;
    const startX = W / 2 - 1.5 * colW;
    const startY = H / 2 - 3.5 * 30;
    flat.forEach((text, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      phraseWords.push({
        text,
        x: startX + col * colW,
        y: startY + row * 30,
        opacity: 0,
        scale: 0.8,
        size: W < 600 ? 18 : 15
      });
    });
  }

  function initPubTitles(){
    pubTitles = [];
    for (let i = 0; i < 20; i++){
      pubTitles.push({
        text: TITLES[i % TITLES.length],
        x: Math.random() * W,
        y: Math.random() * H,
        opacity: 0.3 + Math.random() * 0.4,
        size: 9 + Math.random() * 3
      });
    }
  }

  function initOrbitDots(){
    orbitDots = [];
    for (let i = 0; i < 40; i++){
      orbitDots.push({
        angle: Math.random() * TAU,
        radius: 70 + Math.random() * 260,
        speed: 0.15 + Math.random() * 0.45,
        size: 1 + Math.random() * 2.5,
        opacity: 0.25 + Math.random() * 0.5
      });
    }
  }

  function initGrain(){
    grain = [];
    for (let i = 0; i < 350; i++){
      grain.push({
        x: Math.random() * W,
        y: Math.random() * H,
        opacity: 0.02 + Math.random() * 0.05
      });
    }
  }

  function initDustMotes(){
    dustMotes = [];
    for (let i = 0; i < 60; i++){
      dustMotes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.15,
        size: 0.5 + Math.random() * 1.5,
        opacity: 0.08 + Math.random() * 0.15
      });
    }
  }

  function initPulseRings(){
    pulseRings = [];
    for (let i = 0; i < 4; i++){
      pulseRings.push({ offset: i / 4 });
    }
  }

  function resize(){
    const r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = Math.floor(W * DPR);
    cv.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    initWords();
    initPhraseWords();
    initPubTitles();
    initOrbitDots();
    initGrain();
    initDustMotes();
    initPulseRings();
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  }

  // ---- Draw helpers ----

  function drawBackground(p5){
    const glowR = 240 + p5 * 320;
    const g = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, glowR);
    g.addColorStop(0, `rgba(255,94,0,${0.03 + p5 * 0.07})`);
    g.addColorStop(0.4, `rgba(26,106,255,${0.02 + p5 * 0.04})`);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawVignette(){
    const outer = Math.max(W, H) * 0.95;
    const g = ctx.createRadialGradient(W/2, H/2, outer * 0.25, W/2, H/2, outer);
    g.addColorStop(0, 'transparent');
    g.addColorStop(1, 'rgba(5,8,16,0.6)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawGrain(opacity){
    if (opacity <= 0.01) return;
    ctx.fillStyle = `rgba(154,154,181,${opacity})`;
    for (let i = 0; i < grain.length; i++){
      const g = grain[i];
      if ((i + Math.floor(time * 10)) % 3 !== 0){
        ctx.globalAlpha = g.opacity * opacity;
        ctx.fillRect(g.x, g.y, 1.2, 1.2);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawDustMotes(p1, p6){
    const masterOp = (1 - p6) * 0.7;
    if (masterOp <= 0.01) return;
    for (const m of dustMotes){
      m.x += m.vx;
      m.y += m.vy;
      if (m.x < -10) m.x = W + 10;
      if (m.x > W + 10) m.x = -10;
      if (m.y < -10) m.y = H + 10;
      if (m.y > H + 10) m.y = -10;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size, 0, TAU);
      ctx.fillStyle = `rgba(244,244,248,${m.opacity * masterOp})`;
      ctx.fill();
    }
  }

  function drawFilterLine(p2, cx, cy){
    if (p2 <= 0.01) return;
    const alpha = Math.min(1, p2 * 2.5);
    const lineW = W * 0.68 * Math.min(1, p2 * 1.8);
    const y = cy;

    ctx.save();
    ctx.shadowColor = 'rgba(255,94,0,0.6)';
    ctx.shadowBlur = 20 + Math.sin(time * 3) * 8;
    ctx.strokeStyle = `rgba(255,94,0,${alpha * 0.55})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx - lineW/2, y);
    ctx.lineTo(cx + lineW/2, y);
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = `rgba(255,138,61,${alpha * 0.9})`;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(cx - lineW/2, y);
    ctx.lineTo(cx + lineW/2, y);
    ctx.stroke();

    if (alpha > 0.25 && alpha < 0.95){
      const scanPos = (Math.sin(time * 2.8) + 1) / 2;
      const scanX = cx - lineW/2 + scanPos * lineW;
      ctx.save();
      ctx.shadowColor = 'rgba(255,255,255,0.9)';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(scanX, y, 3, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(scanX, y, 10, 0, TAU);
      ctx.fillStyle = 'rgba(255,200,150,0.12)';
      ctx.fill();
      ctx.restore();
    }
  }

  function drawBlueprintGrid(p3, cx, cy){
    if (p3 <= 0.06) return;
    const alpha = Math.min(1, (p3 - 0.06) / 0.35) * 0.25;
    const colW = W < 600 ? 72 : 130;
    const rowH = 28;
    const cols = 4;
    const rows = 7;
    const startX = cx - (cols * colW) / 2;
    const startY = cy - 110;

    ctx.strokeStyle = `rgba(26,106,255,${alpha})`;
    ctx.lineWidth = 0.4;
    for (let c = 0; c <= cols; c++){
      const x = startX + c * colW;
      const drawProg = Math.min(1, (p3 - 0.06 - c * 0.02) / 0.15);
      if (drawProg <= 0) continue;
      ctx.globalAlpha = drawProg;
      ctx.beginPath(); ctx.moveTo(x, startY); ctx.lineTo(x, startY + rows * rowH); ctx.stroke();
    }
    for (let r = 0; r <= rows; r++){
      const y = startY + r * rowH;
      const drawProg = Math.min(1, (p3 - 0.06 - r * 0.015) / 0.15);
      if (drawProg <= 0) continue;
      ctx.globalAlpha = drawProg;
      ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(startX + cols * colW, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawPubTitles(p4, p5){
    if (p4 <= 0.12) return;
    const alpha = Math.min(0.14, (p4 - 0.12) * 0.25) * (1 - p5 * 0.6);
    ctx.font = `400 10px "JetBrains Mono", monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    for (const t of pubTitles){
      t.y -= 0.15;
      if (t.y < -20) t.y = H + 20;
      ctx.globalAlpha = alpha * t.opacity;
      ctx.fillStyle = `rgba(244,244,248,${alpha * 2})`;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }

  function drawPulseRings(p5, cx, cy){
    if (p5 <= 0.15) return;
    const alpha = Math.min(1, (p5 - 0.15) / 0.4);
    for (const ring of pulseRings){
      const prog = (time * 0.35 + ring.offset) % 1;
      const r = 60 + prog * 320;
      const a = alpha * (1 - prog) * 0.35;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.strokeStyle = `rgba(255,94,0,${a})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function drawSparkles(){
    for (let i = sparkles.length - 1; i >= 0; i--){
      const s = sparkles[i];
      s.life -= s.decay;
      if (s.life <= 0){ sparkles.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = s.life * 0.95;
      ctx.fillStyle = '#FFF';
      ctx.shadowColor = 'rgba(255,200,150,0.95)';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 1.2 + s.life * 3, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  function spawnSparkles(p2, cx, cy){
    if (p2 < 0.12 || p2 > 0.88) return;
    if (Math.random() < 0.14){
      sparkles.push({
        x: cx + (Math.random() - 0.5) * W * 0.58,
        y: cy + (Math.random() - 0.5) * 8,
        life: 1,
        decay: 0.02 + Math.random() * 0.03
      });
    }
  }

  function drawChromaticWord(text, x, y, font, color, aberration, opacity){
    ctx.save();
    ctx.globalAlpha = opacity * 0.35;
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,60,0,0.55)';
    ctx.fillText(text, x - aberration, y);
    ctx.fillStyle = 'rgba(0,180,255,0.45)';
    ctx.fillText(text, x + aberration, y);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function updateAndDrawWords(p1, p2, p3, p4, p5, p6, cx, cy){
    words.sort((a, b) => a.depth - b.depth);
    const velStretch = 1 + Math.abs(velocity) * 20;

    for (const w of words){
      const spin = time * w.speed * (1 + p1 * 3);
      const r = w.radius * (1 + Math.sin(time * 0.4 + w.offset) * 0.08);
      let targetX = cx + Math.cos(w.angle + spin) * r;
      let targetY = cy + Math.sin(w.angle + spin) * r * 0.5;
      let op = w.baseOp;
      let rot = w.rot;
      let sc = 0.4 + w.depth * 1.0;
      let aberration = 0;

      if (p1 > 0.3 && p2 < 0.5){
        aberration = (1 - p2) * 2.5 * w.depth;
      }

      if (p2 > 0){
        if (w.isSignal){
          const pull = easeOutCubic(Math.min(1, p2 * 2.2));
          targetY = lerp(targetY, cy, pull * 0.8);
          targetX = lerp(targetX, cx + (targetX - cx) * 0.2, pull);
          op = lerp(op, 0.65 + w.depth * 0.3, pull);
          rot = lerp(rot, 0, pull);
          sc = lerp(sc, 0.8 + w.depth * 0.35, pull);
        } else {
          const fall = easeInOutCubic(Math.max(0, p2 - 0.1) * 1.5);
          targetY += fall * H * 0.6;
          op = lerp(op, 0, fall);
          rot += fall * 15;
        }
      }

      if (p3 > 0 && w.isSignal){
        const align = easeOutCubic(Math.min(1, p3 * 1.6));
        const col = w.idx % 4;
        const row = Math.floor(w.idx / 4) % 7;
        const colW = W < 600 ? 72 : 130;
        targetX = cx + (col - 1.5) * colW;
        targetY = cy - 110 + row * 28;
        op = lerp(op, 0.45 + w.depth * 0.5, align);
        rot = lerp(rot, 0, align);
      }

      if (p4 > 0 && w.isSignal){
        const ship = easeInOutCubic(Math.max(0, p4 - 0.06) * 1.3);
        targetY -= ship * H * 0.75;
        sc += ship * 2.2;
        op = lerp(op, 0, ship * 1.4);
      }

      if (p5 > 0 && w.isSignal && op > 0.02){
        const net = easeOutCubic(Math.min(1, p5 * 1.3));
        const orbitR = 100 + w.depth * 260 + Math.sin(w.offset + time * 0.5) * 30;
        const orbitA = w.angle + w.offset + time * 0.1;
        const ox = cx + Math.cos(orbitA) * orbitR;
        const oy = cy + Math.sin(orbitA) * orbitR * 0.45;
        targetX = lerp(targetX, ox, net);
        targetY = lerp(targetY, oy, net);
        op = lerp(op, 0.4 + w.depth * 0.5, net);
        sc = lerp(sc, 0.7 + w.depth * 0.25, net);
      }

      if (p6 > 0){
        op *= (1 - p6);
      }

      const sx = spring(w.x, targetX, w.vx, w.tension, w.friction, 1);
      const sy = spring(w.y, targetY, w.vy, w.tension, w.friction, 1);
      w.x = sx.value; w.vx = sx.velocity;
      w.y = sy.value; w.vy = sy.velocity;
      w.opacity = op; w.scale = sc; w.rotation = rot;

      if (op <= 0.005) continue;

      ctx.save();
      ctx.translate(w.x, w.y);
      ctx.rotate(rot * Math.PI / 180);
      const stretch = p1 > 0.2 && p2 < 0.8 ? velStretch : 1;
      ctx.scale(sc * stretch, sc / Math.sqrt(stretch));

      const isSignalActive = w.isSignal && (p2 > 0.2 || p3 > 0 || p4 > 0 || p5 > 0);
      let color, font;

      if (isSignalActive){
        color = (p5 > 0.4) ? '#FF9A5C' : '#FF5E00';
        font = p3 > 0.15 ?
          `600 ${w.baseSize}px "JetBrains Mono", monospace` :
          `500 ${w.baseSize}px "Satoshi", -apple-system, sans-serif`;
      } else {
        color = '#9A9AB5';
        font = `400 ${w.baseSize}px "Satoshi", -apple-system, sans-serif`;
      }

      if (aberration > 0.3){
        drawChromaticWord(w.text, 0, 0, font, color, aberration, op);
      } else {
        ctx.globalAlpha = op;
        ctx.fillStyle = color;
        ctx.font = font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(w.text, 0, 0);
      }
      ctx.restore();
    }
  }

  function drawPhraseWords(p3, p4, p5){
    if (p3 <= 0.02) return;
    const ship = p4 > 0 ? easeInOutCubic(Math.max(0, p4 - 0.04) * 1.3) : 0;
    const fade = p5 > 0 ? p5 * 0.8 : 0;

    phraseWords.forEach((pw, i) => {
      const stagger = i * 0.014;
      const appear = easeOutExpo(Math.min(1, Math.max(0, (p3 - 0.02 - stagger) / 0.3)));
      let op = appear * (1 - ship) * (1 - fade);
      if (op <= 0.005) return;
      let y = pw.y - ship * H * 0.55;
      let sc = lerp(0.85, 1.0, appear) * (1 + ship * 0.5);

      ctx.save();
      ctx.translate(pw.x, y);
      ctx.scale(sc, sc);
      ctx.globalAlpha = op;
      if (appear > 0.7 && ship < 0.3){
        ctx.shadowColor = 'rgba(255,255,255,0.15)';
        ctx.shadowBlur = 20;
      }
      ctx.fillStyle = '#F4F4F8';
      ctx.font = `500 ${pw.size}px "Satoshi", -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pw.text, 0, 0);
      ctx.restore();
    });
  }

  function drawNetwork(p5, cx, cy){
    if (p5 <= 0.06) return;
    const alpha = Math.min(1, (p5 - 0.06) / 0.5);
    const pulse = 0.5 + Math.sin(time * 2) * 0.5;

    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 220);
    g.addColorStop(0, `rgba(255,94,0,${alpha * 0.12 * pulse})`);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const nodes = words.filter(w => w.isSignal && w.opacity > 0.1);
    for (let i = 0; i < nodes.length; i++){
      for (let j = i + 1; j < nodes.length; j++){
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 200){
          const la = alpha * 0.2 * (1 - dist / 200);
          ctx.strokeStyle = `rgba(255,94,0,${la})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();

          const offset = (i * 7 + j * 13) % 100 / 100;
          const pkt = (time * 0.4 + offset) % 1;
          const px = nodes[i].x + (nodes[j].x - nodes[i].x) * pkt;
          const py = nodes[i].y + (nodes[j].y - nodes[i].y) * pkt;
          ctx.save();
          ctx.shadowColor = 'rgba(255,138,61,0.8)';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(px, py, 1.4, 0, TAU);
          ctx.fillStyle = `rgba(255,200,150,${la * 3})`;
          ctx.fill();
          ctx.restore();
        }
      }
    }

    for (const d of orbitDots){
      const a = d.angle + time * d.speed;
      const r = d.radius * (0.8 + Math.sin(time * 0.4 + d.angle) * 0.2);
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r * 0.5;
      ctx.beginPath();
      ctx.arc(x, y, d.size, 0, TAU);
      ctx.fillStyle = `rgba(255,160,80,${alpha * d.opacity * (0.4 + pulse * 0.6)})`;
      ctx.fill();
    }
  }

  function drawFinalLines(p6, cx, cy){
    if (p6 <= 0.12) return;
    const alpha = easeOutExpo(Math.min(1, (p6 - 0.12) / 0.35));
    ctx.save();
    ctx.globalAlpha = alpha * Math.max(0, 1 - p6 * 1.5);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const sz = clamp(26, W * 0.032, 44);
    ctx.font = `italic 400 ${sz}px "Instrument Serif", Georgia, serif`;
    ctx.fillStyle = '#F4F4F8';
    ctx.shadowColor = 'rgba(255,255,255,0.2)';
    ctx.shadowBlur = 30;
    ctx.fillText('The invisible machine', cx, cy - 26);
    ctx.fillStyle = '#FF9A5C';
    ctx.fillText('behind visible leaders.', cx, cy + 20);
    ctx.restore();
  }

  // ---- Main draw loop ----

  function draw(){
    ctx.clearRect(0, 0, W, H);
    time += 0.016;
    velocity = progress - prevProgress;
    prevProgress = progress;

    const sp = progress;
    const p1 = Math.min(1, sp / 0.14);
    const p2 = Math.max(0, Math.min(1, (sp - 0.06) / 0.22));
    const p3 = Math.max(0, Math.min(1, (sp - 0.24) / 0.22));
    const p4 = Math.max(0, Math.min(1, (sp - 0.42) / 0.22));
    const p5 = Math.max(0, Math.min(1, (sp - 0.58) / 0.22));
    const p6 = Math.max(0, Math.min(1, (sp - 0.84) / 0.16));

    const cx = W / 2;
    const cy = H / 2;

    drawBackground(p5);
    drawVignette();
    drawGrain(1 - p6);
    drawDustMotes(p1, p6);
    drawPubTitles(p4, p5);
    drawBlueprintGrid(p3, cx, cy);
    drawFilterLine(p2, cx, cy);
    spawnSparkles(p2, cx, cy);
    updateAndDrawWords(p1, p2, p3, p4, p5, p6, cx, cy);
    drawPhraseWords(p3, p4, p5);
    drawSparkles();
    drawPulseRings(p5, cx, cy);
    drawNetwork(p5, cx, cy);
    drawFinalLines(p6, cx, cy);
    updateFallbackUI(sp);

    raf = requestAnimationFrame(draw);
  }

  // ---- GSAP ScrollTrigger + Timeline ----

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined'){
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: '.hero-wrap',
      start: 'top top',
      end: '+=350%',
      pin: '.hero-sticky',
      scrub: 0.7,
      onUpdate: (self) => {
        progress = self.progress;
      }
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.hero-wrap',
        start: 'top top',
        end: '+=350%',
        scrub: 0.7
      }
    });

    overlays.forEach((el, i) => {
      const ranges = [0.02, 0.14, 0.32, 0.50, 0.70, 0.98];
      const start = ranges[i];
      const end = ranges[i+1];
      const duration = end - start;
      tl.fromTo(el,
        { opacity: 0, y: 30, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: duration * 0.35, ease: 'power2.out' },
        start
      );
      tl.to(el,
        { opacity: 0, y: -25, scale: 0.97, duration: duration * 0.25, ease: 'power2.in' },
        end - duration * 0.25
      );
    });

    tl.to('.hero-scroll',
      { opacity: 0, duration: 0.04, ease: 'power2.in' },
      0.03
    );

    if (heroContent){
      tl.fromTo(heroContent,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.08, ease: 'power2.out' },
        0.93
      );
    }

    tl.to('#storm-canvas',
      { opacity: 0.15, duration: 0.1, ease: 'power2.out' },
      0.88
    );
  } else {
    function updateScroll(){
      const rect = wrap.getBoundingClientRect();
      const dist = rect.height - window.innerHeight;
      progress = Math.max(0, Math.min(1, -rect.top / Math.max(dist, 1)));
    }
    window.addEventListener('scroll', updateScroll, { passive: true });
  }

  function updateFallbackUI(sp){
    if (typeof gsap !== 'undefined') return;
    const ranges = [0.02, 0.14, 0.32, 0.50, 0.70, 0.98];
    overlays.forEach((el, i) => {
      const start = ranges[i] || 1;
      const end = (ranges[i+1] || 1) - 0.02;
      el.classList.toggle('is-active', sp >= start && sp < end);
    });
    if (scrollIndicator) scrollIndicator.classList.toggle('is-hidden', sp > 0.03);
    if (heroContent) heroContent.classList.toggle('is-revealed', sp > 0.94);
  }

  // Lifecycle
  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting){ cancelAnimationFrame(raf); draw(); }
      else { cancelAnimationFrame(raf); }
    }, { threshold: 0.02 });
    io.observe(wrap);
  }

  window.addEventListener('resize', resize);

  // Wait for fonts then start
  function start(){
    resize();
    draw();
  }
  if (document.fonts && document.fonts.ready){
    document.fonts.ready.then(start);
    setTimeout(start, 1200);
  } else {
    start();
  }
})();

/* ==============================================================
   HORIZON EFFECT — Scroll-driven chaos → clarity visualization
   Text fragments CONVERGE (never vanish) — concepts get combined.
   ============================================================== */
(function horizonEffect(){
  const wrap = document.getElementById('horizon');
  const cv   = document.getElementById('horizon-canvas');
  if (!cv || !wrap) return;

  const acts     = wrap.querySelectorAll('.horizon-act');
  const dots     = wrap.querySelectorAll('.hp-dot');
  const fillBar  = document.getElementById('horizonFill');
  const foot     = wrap.querySelector('.horizon-foot');
  const ctx      = cv.getContext('2d', { alpha: true });
  const DPR      = Math.min(2, window.devicePixelRatio || 1);
  const TAU      = Math.PI * 2;
  let W = 0, H = 0, progress = 0, time = 0, raf;

  /* ---- Particles ---- */
  const N = 150;
  let particles = [];

  function initParticles(){
    particles = [];
    for (let i = 0; i < N; i++){
      particles.push({
        sx: Math.random() * W,
        sy: Math.random() * H,
        angle: Math.random() * TAU,
        radius: 18 + Math.random() * 180,
        speed: 0.18 + Math.random() * 0.48,
        hue: Math.random() < 0.55 ? 22 : 220,
        size: 1.4 + Math.random() * 3,
        offset: Math.random() * TAU
      });
    }
  }

  /* ---- Concept fragments (converge, never vanish) ---- */
  const FRAGS = [
    'strategy', 'voice', 'narrative', 'conviction',
    'signal', 'vision', 'identity', 'platform',
    'authority', 'clarity', 'purpose', 'resonance'
  ];
  let textFrags = [];

  function initFragments(){
    const cx = W * 0.72, cy = H * 0.5;
    const R = Math.min(W * 0.15, 155);
    textFrags = FRAGS.map((t, i) => {
      const convAngle = (i / FRAGS.length) * TAU - Math.PI / 2;
      return {
        text: t,
        sx: W * 0.2 + Math.random() * W * 0.7,
        sy: H * 0.06 + Math.random() * H * 0.88,
        convAngle: convAngle,
        convR: R,
        offset: Math.random() * TAU,
        baseAlpha: 0.24 + Math.random() * 0.16,
        size: 14 + Math.random() * 5,
        hue: i % 2 === 0 ? 22 : 220
      };
    });
  }

  /* ---- Resize ---- */
  function resize(){
    const r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width  = Math.floor(W * DPR);
    cv.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    initParticles();
    initFragments();
  }

  /* ---- Draw ---- */
  function draw(){
    ctx.clearRect(0, 0, W, H);
    time += 0.012;

    const cx = W * 0.72;
    const cy = H * 0.5;

    const p2   = Math.max(0, Math.min(1, (progress - 0.26) * 2.7));
    const p3   = Math.max(0, Math.min(1, (progress - 0.60) * 2.5));
    const conv = Math.max(0, Math.min(1, (progress - 0.08) / 0.58));

    /* --- ambient glow --- */
    const glR = 200 + p2 * 180;
    ctx.beginPath();
    ctx.arc(cx, cy, glR, 0, TAU);
    const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, glR);
    gg.addColorStop(0,   `rgba(255,94,0,${0.07 + p2 * 0.14})`);
    gg.addColorStop(0.45,`rgba(255,94,0,${0.02 + p2 * 0.05})`);
    gg.addColorStop(1,   'transparent');
    ctx.fillStyle = gg;
    ctx.fill();

    /* --- concentric rings --- */
    if (p2 > 0){
      for (let r = 45; r <= 220; r += 44){
        const rr = r * (0.25 + p2 * 0.75);
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, TAU);
        ctx.strokeStyle = `rgba(255,94,0,${p2 * 0.24 * (1 - r / 260)})`;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    /* --- crosshair --- */
    if (p2 > 0.15){
      const ca = (p2 - 0.15) / 0.85 * 0.18;
      ctx.strokeStyle = `rgba(244,244,248,${ca})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(cx - 240, cy); ctx.lineTo(cx + 240, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - 240); ctx.lineTo(cx, cy + 240); ctx.stroke();
    }

    /* --- pulsing outer ring (clarity) --- */
    if (p3 > 0){
      const pulse = 0.5 + Math.sin(time * 1.8) * 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 225 + pulse * 25, 0, TAU);
      ctx.strokeStyle = `rgba(255,94,0,${p3 * 0.14 * pulse})`;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    /* --- radiating signal lines --- */
    if (p3 > 0){
      for (let i = 0; i < 16; i++){
        const a = (i / 16) * TAU + time * 0.1;
        const inner = 220;
        const len   = 70 + p3 * 180;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
        ctx.lineTo(cx + Math.cos(a) * (inner + len), cy + Math.sin(a) * (inner + len));
        ctx.strokeStyle = `rgba(255,94,0,${p3 * 0.09})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    /* --- particles --- */
    for (const p of particles){
      const chaosX = p.sx + Math.sin(time * p.speed + p.offset) * 65;
      const chaosY = p.sy + Math.cos(time * p.speed * 0.7 + p.offset) * 65;
      const orbitA = p.angle + time * p.speed * 0.22;
      const orbitX = cx + Math.cos(orbitA) * p.radius;
      const orbitY = cy + Math.sin(orbitA) * p.radius;
      const x = chaosX + (orbitX - chaosX) * conv;
      const y = chaosY + (orbitY - chaosY) * conv;
      const sat = p.hue === 22 ? 100 : 90;
      const lit = p.hue === 22 ? 55  : 60;
      const alpha = 0.18 + conv * 0.58;
      const r = p.size * (0.55 + conv * 0.55);

      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fillStyle = `hsla(${p.hue},${sat}%,${lit}%,${alpha})`;
      ctx.fill();

      if (p3 > 0){
        ctx.beginPath();
        ctx.arc(x, y, r * 4, 0, TAU);
        ctx.fillStyle = `hsla(${p.hue},${sat}%,${lit}%,${p3 * 0.06})`;
        ctx.fill();
      }
    }

    /* --- center dot --- */
    if (p2 > 0.15){
      const da = Math.min(1, (p2 - 0.15) / 0.35);
      ctx.beginPath();
      ctx.arc(cx, cy, 5.5, 0, TAU);
      ctx.fillStyle = `rgba(244,244,248,${da * 0.95})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, TAU);
      ctx.fillStyle = `rgba(255,94,0,${da * 0.16})`;
      ctx.fill();
    }

    /* --- text fragments (converge toward center, NEVER vanish) --- */
    const fPos = [];
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const f of textFrags){
      const chaosX = f.sx + Math.sin(time * 0.28 + f.offset) * 40;
      const chaosY = f.sy + Math.cos(time * 0.22 + f.offset) * 40;

      const orbitA = f.convAngle + time * 0.04;
      const destX  = cx + Math.cos(orbitA) * f.convR;
      const destY  = cy + Math.sin(orbitA) * f.convR;

      const x = chaosX + (destX - chaosX) * conv;
      const y = chaosY + (destY - chaosY) * conv;
      fPos.push({ x, y });

      const alpha = f.baseAlpha + conv * 0.45;
      const rgb   = f.hue === 22 ? '255,138,61' : '106,140,255';
      const sz    = f.size * (1 - conv * 0.3);

      ctx.font = `600 ${sz}px "JetBrains Mono", monospace`;
      ctx.fillStyle = `rgba(${rgb},${alpha})`;
      ctx.fillText(f.text, x, y);
    }

    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';

    /* --- constellation lines between fragments --- */
    if (conv > 0.2){
      const lf = (conv - 0.2) / 0.8;
      const maxD = 260 - conv * 140;
      ctx.lineWidth = 0.6;
      for (let i = 0; i < fPos.length; i++){
        for (let j = i + 1; j < fPos.length; j++){
          const d = Math.hypot(fPos[i].x - fPos[j].x, fPos[i].y - fPos[j].y);
          if (d < maxD){
            ctx.beginPath();
            ctx.moveTo(fPos[i].x, fPos[i].y);
            ctx.lineTo(fPos[j].x, fPos[j].y);
            ctx.strokeStyle = `rgba(255,94,0,${lf * 0.14 * (1 - d / maxD)})`;
            ctx.stroke();
          }
        }
      }
    }

    raf = requestAnimationFrame(draw);
  }

  /* ---- Scroll binding ---- */
  function updateScroll(){
    const rect = wrap.getBoundingClientRect();
    const dist = rect.height - window.innerHeight;
    progress = Math.max(0, Math.min(1, -rect.top / Math.max(dist, 1)));

    const idx = progress >= 0.66 ? 2 : progress >= 0.33 ? 1 : 0;
    acts.forEach((a, i) => a.classList.toggle('is-active', i === idx));

    dots.forEach((d, i) => {
      const thresholds = [0.03, 0.33, 0.66];
      d.classList.toggle('is-hit', progress >= thresholds[i]);
    });

    if (fillBar) fillBar.style.height = (progress * 100) + '%';
    if (foot) foot.classList.toggle('is-shown', progress > 0.80);
  }

  /* ---- Lifecycle ---- */
  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting){ cancelAnimationFrame(raf); draw(); }
      else { cancelAnimationFrame(raf); }
    }, { threshold: 0.02 });
    io.observe(wrap);
  }

  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', resize);
  resize();
  updateScroll();

  if (REDUCED){
    ctx.clearRect(0, 0, W, H);
    acts.forEach((a, i) => a.classList.toggle('is-active', i === 0));
    return;
  }

  draw();
})();

/* ==============================================================
   RECORDING TOOL: CINEMATIC AUTO-SCROLL
   Press 'S' to start/stop a very smooth, slow scroll.
   Perfect for screen recordings for X.
   ============================================================== */
(function recordingTool() {
  let isScrolling = false;
  let currentPos = window.scrollY;
  const speed = 3.9; // Adjust for speed. 0.6-0.8 is great for "cinematic" feels.

  function step() {
    if (!isScrolling) return;
    currentPos += speed;
    window.scrollTo(0, currentPos);

    if (currentPos >= (document.documentElement.scrollHeight - window.innerHeight - 1)) {
      isScrolling = false;
      console.log("Cinematic Scroll: REACHED BOTTOM");
      return;
    }
    requestAnimationFrame(step);
  }

  window.addEventListener('keydown', (e) => {
    // Only trigger if not typing in an input/textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key.toLowerCase() === 's') {
      isScrolling = !isScrolling;
      if (isScrolling) {
        currentPos = window.scrollY;
        console.log("Cinematic Scroll: ACTIVE");
        step();
      } else {
        console.log("Cinematic Scroll: STOPPED");
      }
    }
  });
})();

