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
    const dur = 1700; const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      el.textContent = Math.round(ease(p) * target);
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
