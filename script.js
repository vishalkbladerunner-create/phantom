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

  // Show nav immediately with hero styling
  nav.classList.add('is-hero');

  const upd = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 30);
  };
  upd();
  window.addEventListener('scroll', upd, { passive: true });

  const premise = document.getElementById('premise');
  const heroLogo = document.querySelector('.hero-logo-wrap');
  if (premise) {
    const check = () => {
      const show = window.scrollY >= premise.offsetTop - window.innerHeight;
      // Remove is-hero when we've scrolled well past hero, keep nav visible
      if (show) {
        nav.classList.remove('is-hero');
        nav.classList.add('is-visible');
      } else {
        nav.classList.add('is-hero');
        nav.classList.remove('is-visible');
      }
      if (heroLogo) heroLogo.classList.add('is-hidden');
    };
    window.addEventListener('scroll', check, { passive: true });
    check();
  } else {
    nav.classList.add('is-visible');
    nav.classList.remove('is-hero');
    if (heroLogo) heroLogo.classList.add('is-hidden');
  }
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

/* ---------- Hero scroll progress indicator ---------- */
(function heroProgress(){
  const wrap = document.querySelector('.hero-wrap');
  const fill = document.getElementById('heroProgressFill');
  const ticks = document.querySelectorAll('.hp-ticks span');
  const indicator = document.querySelector('.hero-progress');
  if (!wrap || !fill) return;

  const upd = () => {
    const rect = wrap.getBoundingClientRect();
    const vh = window.innerHeight;
    // hero-wrap height minus viewport = total scrollable distance
    const total = wrap.offsetHeight - vh;
    const scrolled = Math.max(0, Math.min(total, -rect.top));
    const pct = total > 0 ? (scrolled / total) * 100 : 0;
    fill.style.height = pct + '%';

    // Tick activation at 20%, 40%, 60%, 80%, 100%
    ticks.forEach((t, i) => {
      t.classList.toggle('is-hit', pct >= (i * 20));
    });

    // Hide when outside hero
    if (indicator) {
      const inHero = rect.top < vh && rect.bottom > 0;
      indicator.classList.toggle('is-hidden', !inHero);
    }
  };

  window.addEventListener('scroll', upd, { passive: true });
  upd();
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
  let W = 0, H = 0, DPR = Math.min(1.5, window.devicePixelRatio || 1);
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

  const COUNT = () => Math.floor(Math.min(200, (W * H) / 10000));

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
  const hero = document.querySelector('.hero-wrap');
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
   TYPOGRAPHIC STORM v4 — Final Fixes (Flow Field + Physics)
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
    const flowCv = document.getElementById('flow-canvas');
    if (flowCv) flowCv.style.opacity = '0.85';
    return;
  }

  const ctx = cv.getContext('2d', { alpha: true });
  let DPR = Math.min(2, window.devicePixelRatio || 1);
  if (window.innerWidth > 3000 || window.innerHeight > 2000) DPR = Math.min(1.5, DPR);
  const TAU = Math.PI * 2;
  let W = 0, H = 0, raf;
  let isDrawing = false;

  let time = 0, lastTime = 0;
  let rawProgress = 0, smoothProgress = 0;

  // Mouse interaction
  let mouse = { x: -1000, y: -1000, vx: 0, vy: 0, active: false };
  cv.addEventListener('mousemove', (e) => {
    const r = cv.getBoundingClientRect();
    const nx = e.clientX - r.left;
    const ny = e.clientY - r.top;
    mouse.vx = nx - mouse.x;
    mouse.vy = ny - mouse.y;
    mouse.x = nx;
    mouse.y = ny;
    mouse.active = true;
  });
  cv.addEventListener('mouseleave', () => { mouse.active = false; });

  // Databases
  const NOISE = ["maybe", "sort of", "I guess", "unclear", "noise", "doubt", "probably", "somewhat", "vague", "random", "clutter", "messy", "lost", "static", "um", "like", "could be", "perhaps", "tbd"];
  const SIGNAL = ["conviction", "thesis", "principle", "observation", "pattern", "insight", "belief", "framework", "strategy", "vision", "authority", "clarity", "purpose", "signal", "truth", "leverage", "compound", "architecture"];
  const TITLES = [
    "The Architecture of Trust", "Scaling Culture", "Beyond Product Market Fit",
    "The Authority Engine", "Reputation as Infrastructure", "Navigating the Cycle",
    "Founder to CEO", "The Signal in the Noise", "Engineering Serendipity"
  ];

  let words = [];
  let gridTitles = [];
  let flowParticles = [];

  // Perlin noise approximation for flow field
  function noise(x, y) {
    return Math.sin(x * 0.05) * Math.cos(y * 0.05) + Math.sin(x * 0.02 + y * 0.03);
  }

  function init() {
    words = [];
    gridTitles = [];
    flowParticles = [];

    let signalCount = 0;
    const WORD_COUNT = () => Math.floor(Math.min(380, (W * H) / 4200)); 
    const MAX_SIGNAL = 24; // Limit assembled grid to 3x8 block

    // Init Words — full canvas coverage, no padding, no protect zone
    for(let i=0; i<WORD_COUNT(); i++) {
      const isSignal = Math.random() < 0.3;
      let col = 0, row = 0, keepsSlot = false;
      if (isSignal && signalCount < MAX_SIGNAL) {
        col = signalCount % 3;
        row = Math.floor(signalCount / 3);
        keepsSlot = true;
        signalCount++;
      }

      const startX = Math.random() * W;
      const startY = Math.random() * H;

      words.push({
        text: isSignal ? SIGNAL[Math.floor(Math.random() * SIGNAL.length)] : NOISE[Math.floor(Math.random() * NOISE.length)],
        isSignal,
        keepsSlot,
        ox: startX,
        oy: startY,
        x: startX,
        y: startY,
        z: Math.random() * 200, 
        vx: 0,
        vy: 0,
        baseSize: isSignal ? 16 + Math.random()*5 : 14 + Math.random()*4,
        alpha: 0,
        dissolved: false,
        orbA: Math.random() * TAU,
        orbR: 150 + Math.random() * 250,
        col: col,
        row: row,
        idx: i
      });
    }

    // Init Grid Titles
    for(let i=0; i<16; i++) {
      gridTitles.push({
        text: TITLES[Math.floor(Math.random() * TITLES.length)],
        x: Math.random() * W,
        y: Math.random() * H,
        alpha: 0,
        connections: []
      });
    }
    for(let i=0; i<gridTitles.length; i++) {
      for(let j=i+1; j<gridTitles.length; j++) {
        const dx = gridTitles[i].x - gridTitles[j].x;
        const dy = gridTitles[i].y - gridTitles[j].y;
        if(dx*dx + dy*dy < 60000) {
          gridTitles[i].connections.push(j);
        }
      }
    }

    // Init Flow Particles
    for(let i=0; i<35; i++) {
      flowParticles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: 0, vy: 0,
        life: Math.random() * 100,
        maxLife: 50 + Math.random() * 100,
        color: Math.random() > 0.5 ? 'rgba(255,94,0,0.15)' : 'rgba(26,106,255,0.15)'
      });
    }
  }

  let resizeTimer;
  function resize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      DPR = Math.min(2, window.devicePixelRatio || 1);
      if (window.innerWidth > 3000 || window.innerHeight > 2000) DPR = Math.min(1.5, DPR);
      cv.width = Math.floor(W * DPR);
      cv.height = Math.floor(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      init();
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }, 120);
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function easeInOutCubic(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  // Linear phases (monotonic — no fade-back-in)
  const phaseChaos    = (p) => Math.max(0, Math.min(1, p / 0.15));
  const phaseFilter   = (p) => Math.max(0, Math.min(1, (p - 0.15) / 0.20));
  const phaseAssemble = (p) => Math.max(0, Math.min(1, (p - 0.35) / 0.20));
  const phaseOutput   = (p) => Math.max(0, Math.min(1, (p - 0.55) / 0.20));
  const phaseNetwork  = (p) => Math.max(0, Math.min(1, (p - 0.75) / 0.20));
  const phaseFade     = (p) => Math.max(0, Math.min(1, (p - 0.95) / 0.05));

  function draw(now) {
    isDrawing = true;
    const t = now || performance.now();
    if (!lastTime) lastTime = t;
    let dt = (t - lastTime) / 1000;
    if(dt > 0.05) dt = 0.05;
    if (isNaN(dt)) dt = 0;
    lastTime = t;
    time += dt;

    smoothProgress += (rawProgress - smoothProgress) * clamp(1 - Math.pow(0.9, dt * 60), 0, 1);
    let p = smoothProgress;

    ctx.clearRect(0, 0, W, H);
    
    const cx = W / 2;
    const cy = H / 2;

    // Legacy normalized progress for overlay sections that need them
    const pOutput  = Math.max(0, Math.min(1, (p - 0.55) / 0.20));
    const pNetwork = Math.max(0, Math.min(1, (p - 0.75) / 0.20));
    const pFade    = Math.max(0, Math.min(1, (p - 0.95) / 0.05));

    // Vignette
    const outer = Math.max(W, H) * 0.95;
    const vig = ctx.createRadialGradient(cx, cy, outer * 0.2, cx, cy, outer);
    vig.addColorStop(0, 'transparent');
    vig.addColorStop(1, 'rgba(5,8,16,0.6)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    // Flow Field Background (always active)
    ctx.lineWidth = 1.5;
    flowParticles.forEach(fp => {
      let angle = noise(fp.x, fp.y) * TAU;
      fp.vx += Math.cos(angle) * 0.05;
      fp.vy += Math.sin(angle) * 0.05;
      fp.vx *= 0.95;
      fp.vy *= 0.95;
      
      ctx.beginPath();
      ctx.moveTo(fp.x, fp.y);
      fp.x += fp.vx * 2;
      fp.y += fp.vy * 2;
      ctx.lineTo(fp.x, fp.y);
      
      let lifeRatio = Math.sin((fp.life / fp.maxLife) * Math.PI);
      ctx.strokeStyle = fp.color.replace('0.15', `${0.3 * lifeRatio}`);
      ctx.stroke();

      fp.life++;
      if (fp.life > fp.maxLife || fp.x < 0 || fp.x > W || fp.y < 0 || fp.y > H) {
        fp.x = Math.random() * W;
        fp.y = Math.random() * H;
        fp.life = 0;
        fp.maxLife = 50 + Math.random() * 100;
        fp.vx = 0; fp.vy = 0;
      }
    });

    // Background Glow in Network
    if (pNetwork > 0) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 500);
      g.addColorStop(0, `rgba(255,94,0,${pNetwork * 0.12 * (1 - pFade)})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0,0,W,H);
    }

    // Grid Titles and Network
    if (pOutput > 0 && pFade < 1) {
      const gOp = pOutput * (1 - pFade);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '500 12px "JetBrains Mono", monospace';
      
      gridTitles.forEach((t, i) => {
        t.alpha = Math.min(1, gOp * (0.2 + 0.8 * Math.sin(i + time)));
        ctx.fillStyle = `rgba(244,244,248,${t.alpha * 0.18})`;
        ctx.fillText(t.text, t.x, t.y);

        if (pNetwork > 0) {
          t.connections.forEach(j => {
            const tj = gridTitles[j];
            ctx.beginPath();
            ctx.moveTo(t.x, t.y);
            ctx.lineTo(tj.x, tj.y);
            ctx.strokeStyle = `rgba(255,94,0,${pNetwork * gOp * 0.18 * (t.alpha + tj.alpha)/2})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          });
        }
      });
    }

    // Words
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Grid constants for assemble/output targets
    const colW = 180;
    const rowH = 36;
    const totalCols = 3;
    const startX = cx - (colW * totalCols) / 2 + colW / 2;
    const startY = cy - 120;

    const pc = phaseChaos(p);
    const pf = phaseFilter(p);
    const pa = phaseAssemble(p);
    const po = phaseOutput(p);

    // Reset dissolved words when returning to the chaos phase
    if (p < 0.15) {
      words.forEach(w => { w.dissolved = false; });
    }

    words.forEach((w) => {
      if (w.dissolved) return;

      let tx = w.x, ty = w.y, tz = w.z;
      let alpha = 1;
      let col = w.isSignal ? '#FF5E00' : '#B8B8CC';
      let font = `600 ${w.baseSize}px "Satoshi", sans-serif`;

      // Chaos Phase
      if (p < 0.15) {
        w.vx += (w.ox - w.x) * 0.001;
        w.vy += (w.oy - w.y) * 0.001;
        w.vx += Math.sin(time * 0.5 + w.idx) * 0.02;
        w.vy += Math.cos(time * 0.4 + w.idx) * 0.02;

        if (mouse.active) {
          let dx = w.x - mouse.x, dy = w.y - mouse.y;
          let dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 280) {
            let force = (280 - dist) / 280;
            w.vx += (mouse.vx * 0.02 + (dx/dist) * 0.5) * force;
            w.vy += (mouse.vy * 0.02 + (dy/dist) * 0.5) * force;
          }
        }

        w.vx *= 0.94;
        w.vy *= 0.94;
        w.x += w.vx;
        w.y += w.vy;

        tx = w.x;
        ty = w.y;
        alpha = 0.6 + 0.4 * Math.sin(time*2 + w.idx);
      }
      // Filter Phase
      else if (p < 0.35) {
        if (!w.isSignal) {
          w.vx += (w.x - cx) * 0.0005;
          w.vy += (w.y - cy) * 0.0005;
          w.x += w.vx;
          w.y += w.vy;
          alpha = 1 - pf;
          if (pf > 0.8) w.dissolved = true;
        } else {
          w.orbA += 0.015;
          const targetX = cx + Math.cos(w.orbA) * w.orbR;
          const targetY = cy + Math.sin(w.orbA) * (w.orbR * 0.3);
          w.x = lerp(w.x, targetX, easeInOutCubic(pf));
          w.y = lerp(w.y, targetY, easeInOutCubic(pf));
          tx = w.x;
          ty = w.y;
          tz = 100;
          col = '#FF5E00';
          alpha = Math.min(1, 0.4 + pf);
        }
      }
      // Assemble Phase
      else if (p < 0.55) {
        if (!w.isSignal) { w.dissolved = true; return; }
        col = (w.col === 1) ? '#1A6AFF' : '#FF5E00';
        const targetX = startX + w.col * colW;
        const targetY = startY + w.row * rowH;
        const orbitX = cx + Math.cos(w.orbA) * w.orbR;
        const orbitY = cy + Math.sin(w.orbA) * (w.orbR * 0.3);
        if (!w.keepsSlot) {
           w.x = orbitX;
           w.y = orbitY - pa * 100;
           tx = w.x; ty = w.y;
           alpha = 1 - easeInOutCubic(pa);
           if (pa > 0.8) w.dissolved = true;
        } else {
           w.x = lerp(orbitX, targetX, easeInOutCubic(pa));
           w.y = lerp(orbitY, targetY, easeInOutCubic(pa));
           tx = w.x;
           ty = w.y;
           tz = lerp(100, 0, pa);
        }
      }
      // Output & Network Phase
      else if (p < 0.95) {
        if (!w.isSignal || !w.keepsSlot) { w.dissolved = true; return; }
        col = (w.col === 1) ? '#1A6AFF' : '#FF5E00';
        const targetX = startX + w.col * colW;
        const targetY = startY + w.row * rowH;
        tz = 0;
        tx = targetX;
        ty = targetY - po * 420;
        alpha = Math.max(0, 1 - po * 1.45);
        if (alpha <= 0) w.dissolved = true;
      }
      // Fade
      else {
        alpha = 0;
      }

      if (alpha > 0 && !w.dissolved) {
        const scale = 500 / (500 + Math.max(0, tz));
        if (scale > 0 && scale < 10) {
          ctx.globalAlpha = alpha * Math.min(1, scale);
          ctx.font = font;
          ctx.fillStyle = col;
          ctx.save();
          ctx.translate(tx, ty);
          ctx.scale(scale, scale);
          if (w.isSignal && p > 0.15 && p < 0.95) {
            ctx.shadowColor = 'rgba(255,94,0,0.4)';
            ctx.shadowBlur = 12;
          }
          ctx.fillText(w.text, 0, 0);
          ctx.restore();
        }
      }
    });

    // Blue structural lines between columns (assemble phase)
    if (pa > 0.5) {
      for (let c = 0; c < totalCols; c++) {
        const lineX = startX + c * colW - colW/2 + 20;
        ctx.beginPath();
        ctx.moveTo(lineX, cy - 140);
        ctx.lineTo(lineX, cy + 140);
        ctx.strokeStyle = `rgba(26,106,255,${(pa - 0.5) * 2 * 0.4})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    updateFallbackUI(p);

    // Reset mouse velocities to decay if no movement
    mouse.vx *= 0.5;
    mouse.vy *= 0.5;

    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(draw);
  }

  // ---- GSAP ScrollTrigger + Timeline ----
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined'){
    gsap.registerPlugin(ScrollTrigger);

    const heroSticky = document.querySelector('.hero-sticky');
    ScrollTrigger.create({
      trigger: '.hero-wrap',
      start: 'top top',
      end: '+=550%',
      pin: '.hero-sticky',
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        rawProgress = self.progress;
        const revealed = self.progress > 0.80;
        if (heroContent) {
          heroContent.classList.toggle('is-revealed', revealed);
        }
        if (heroSticky) {
          heroSticky.classList.toggle('has-revealed', revealed);
        }
      }
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.hero-wrap',
        start: 'top top',
        end: '+=550%',
        scrub: 0.8
      }
    });

    overlays.forEach((el, i) => {
      const ranges = [0.02, 0.14, 0.32, 0.50, 0.68, 0.82];
      const start = ranges[i];
      const end = ranges[i+1];
      const duration = end - start;
      tl.fromTo(el,
        { opacity: 0, y: 55, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: duration * 0.35, ease: 'power2.out' },
        start
      );
      tl.to(el,
        { opacity: 0, y: -40, scale: 0.94, duration: duration * 0.25, ease: 'power2.in' },
        end - duration * 0.25
      );
    });

    if (heroContent){
      tl.fromTo(heroContent,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.10, ease: 'power2.out' },
        0.84
      );
    }

    tl.to('#storm-canvas',
      { opacity: 0, duration: 0.14, ease: 'power2.out' },
      0.82
    );
  }

  function updateFallbackUI(sp){
    if (typeof gsap !== 'undefined') return;
    const ranges = [0.02, 0.14, 0.32, 0.50, 0.68, 0.82];
    overlays.forEach((el, i) => {
      const start = ranges[i] || 1;
      const end = (ranges[i+1] || 1) - 0.02;
      el.classList.toggle('is-active', sp >= start && sp < end);
    });
    if (scrollIndicator) scrollIndicator.classList.toggle('is-hidden', sp > 0.03);
    if (heroContent) heroContent.classList.toggle('is-revealed', sp > 0.82);
  }

  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting){
        cancelAnimationFrame(raf);
        isDrawing = false;
        lastTime = 0;
        draw();
      } else {
        cancelAnimationFrame(raf);
        isDrawing = false;
      }
    }, { threshold: 0.02 });
    io.observe(wrap);
  }

  window.addEventListener('resize', resize);

  let started = false;
  function start(){
    if (started) return;
    started = true;
    cancelAnimationFrame(raf);
    isDrawing = false;
    const r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    DPR = Math.min(2, window.devicePixelRatio || 1);
    if (window.innerWidth > 3000 || window.innerHeight > 2000) DPR = Math.min(1.5, DPR);
    cv.width = Math.floor(W * DPR);
    cv.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    init();
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
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
  const DPR      = Math.min(1.5, window.devicePixelRatio || 1);
  const TAU      = Math.PI * 2;
  let W = 0, H = 0, progress = 0, time = 0, raf;

  /* ---- Particles ---- */
  const N = 80;
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
    'signal', 'vision', 'clarity', 'purpose'
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
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 5]);
      for (let r = 45; r <= 220; r += 44){
        const rr = r * (0.25 + p2 * 0.75);
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, TAU);
        ctx.strokeStyle = `rgba(255,94,0,${p2 * 0.24 * (1 - r / 260)})`;
        ctx.stroke();
      }
      ctx.setLineDash([]);
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

/* ==============================================================
   LENIS SMOOTH SCROLL
   ============================================================== */
if (typeof Lenis !== 'undefined') {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
