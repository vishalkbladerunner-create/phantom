/* ==============================================================
   PHANTOM POST — SCRIPT
   Optimized for 60fps across all devices + mobile layout fixes
   ============================================================== */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Performance Tier Detection ---------- */
const PERF = (() => {
  const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
  const cores = navigator.hardwareConcurrency || 2;
  const memory = navigator.deviceMemory || 4;
  const isLowEnd = cores <= 4 || memory <= 4;
  const isHighEnd = cores >= 8 && memory >= 8 && !isMobile;
  const tier = isHighEnd ? 'high' : isLowEnd || isMobile ? 'low' : 'medium';

  return {
    tier,
    isMobile,
    isLowEnd,
    dpr: isHighEnd ? Math.min(1.5, window.devicePixelRatio || 1) : isMobile ? 1 : Math.min(1.25, window.devicePixelRatio || 1),
    flowParticles: isHighEnd ? 180 : 100,
    stormWords: isHighEnd ? 360 : 180,
    stormGridTitles: isHighEnd ? 14 : 8,
    stormFlowParticles: isHighEnd ? 30 : 16,
    horizonParticles: isHighEnd ? 80 : 50,
    disableShadows: tier !== 'high',
    disableMouse: isMobile,
    useCanvas: !(isMobile && isLowEnd)
  };
})();

window.addEventListener('pagehide', () => {
  document.querySelectorAll('canvas').forEach(cv => {
    cv.width = 1; cv.height = 1;
    const ctx = cv.getContext('2d');
    ctx && ctx.clearRect(0, 0, 1, 1);
  });
});

/* ---------- Visibility State Helper ---------- */
let DOC_VISIBLE = true;
document.addEventListener('visibilitychange', () => { DOC_VISIBLE = !document.hidden; });

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
  setTimeout(done, 2400);
})();

/* ---------- Canvas memory release on page hide ---------- */
window.addEventListener('pagehide', () => {
  document.querySelectorAll('canvas').forEach(cv => {
    cv.width = 1; cv.height = 1;
    const ctx = cv.getContext('2d');
    ctx && ctx.clearRect(0, 0, 1, 1);
  });
});

/* ---------- GSAP Global Setup ---------- */
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  if (PERF.isMobile || PERF.isLowEnd) {
    ScrollTrigger.normalizeScroll(true);
  }
}

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

/* ---------- Mobile nav toggle ---------- */
(function mobileNav(){
  const nav = document.querySelector('.nav');
  const links = document.querySelector('.nav-links');
  if (!nav || !links) return;

  const btn = document.createElement('button');
  btn.className = 'nav-toggle';
  btn.setAttribute('aria-label', 'Toggle navigation');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<span></span><span></span><span></span>';
  nav.insertBefore(btn, nav.querySelector('.nav-cta'));

  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
})();

/* ---------- Nav scroll state ---------- */
(function navScroll(){
  const nav = document.querySelector('.nav');
  if (!nav) return;
  nav.classList.add('is-hero');

  const upd = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 30);
  };
  upd();
  window.addEventListener('scroll', upd, { passive: true });

  const premise = document.getElementById('premise');
  const heroLogo = document.querySelector('.hero-logo-wrap');
  let premiseTop = premise ? premise.offsetTop : 0;
  if (premise) {
    const check = () => {
      const show = window.scrollY >= premiseTop - window.innerHeight;
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
    window.addEventListener('resize', () => { premiseTop = premise.offsetTop; });
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

/* ---------- Manifesto scroll-driven handwriting + strike ---------- */
(function manifestoScrollScrub(){
  const sec = document.querySelector('.manifesto');
  if (!sec || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Ensure ScrollTrigger is registered (idempotent)
  if (gsap.registerPlugin) gsap.registerPlugin(ScrollTrigger);

  const strikeLine = sec.querySelector('.strike-line');
  const strikeWord = sec.querySelector('.strike-text');
  const strikeEl = sec.querySelector('.strike');
  const repSvg = sec.querySelector('.rep-strokes');
  const repLetters = sec.querySelectorAll('.rep-letter');
  if (!strikeLine || !strikeWord || !strikeEl || !repSvg || !repLetters.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Generous stroke length that safely exceeds any glyph outline at this size
  const SAFE_STROKE_LEN = 800;

  // Measure font metrics and position SVG letters
  function setupRepLetters() {
    const strikeStyle = getComputedStyle(strikeWord);
    const fontSize = parseFloat(strikeStyle.fontSize);
    const lineHeight = parseFloat(getComputedStyle(strikeEl).lineHeight) || fontSize;
    const repFont = 'italic 400 ' + strikeStyle.fontSize + ' "Instrument Serif", serif';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = repFont;

    // Measure ascent/descent using tall characters
    const metrics = ctx.measureText('Xp');
    const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.72;
    const descent = metrics.actualBoundingBoxDescent || fontSize * 0.28;

    // The SVG text baseline should align with the HTML text baseline.
    // In a line box, baseline from top = (lineHeight - fontSize)/2 + ascent
    const svgH = strikeWord.offsetHeight || Math.round(lineHeight);
    const baselineY = Math.round((svgH - fontSize) / 2 + ascent);

    // Position each letter using measured widths
    const strikePad = parseFloat(getComputedStyle(strikeEl).paddingLeft) || 0;
    let x = strikePad;
    let totalW = strikePad;
    repLetters.forEach((textEl) => {
      const letter = textEl.textContent;
      const w = ctx.measureText(letter).width;
      textEl.setAttribute('x', x.toFixed(2));
      textEl.setAttribute('y', baselineY);
      textEl.setAttribute('dominant-baseline', 'alphabetic');
      textEl.style.fontSize = strikeStyle.fontSize;
      textEl.style.strokeDasharray = String(SAFE_STROKE_LEN);
      textEl.style.strokeDashoffset = String(SAFE_STROKE_LEN);
      textEl.dataset.length = String(SAFE_STROKE_LEN);
      x += w;
      totalW += w;
    });
    totalW += strikePad;

    // Size SVG to fit the reputation letters; let it overflow the strike element naturally
    const repW = Math.ceil(totalW);
    const markW = strikeWord.offsetWidth;
    // Align left to push the following text when expanding width
    repSvg.setAttribute('width', repW);
    repSvg.setAttribute('height', svgH);
    repSvg.style.width = repW + 'px';
    repSvg.style.height = svgH + 'px';
    repSvg.style.left = '0px';

    sec._repW = repW;
    sec._markW = markW;


  }

  let activeTl = null;

  function buildTimeline() {
    // Kill previous timeline and its pinned ScrollTrigger
    if (activeTl) {
      if (activeTl.scrollTrigger) activeTl.scrollTrigger.kill();
      activeTl.kill();
      activeTl = null;
    }

    const wordStack = sec.querySelector('.word-stack');
    const repW = sec._repW || 0;
    const markW = sec._markW || 0;

    // Reset initial states
    gsap.set(wordStack, { width: markW });
    gsap.set(strikeLine, { scaleX: 0, opacity: 1, transformOrigin: 'left center' });
    gsap.set(strikeWord, { opacity: 1 });
    gsap.set(repSvg, { opacity: 0 });
    gsap.set(repLetters, { fill: 'none', strokeDashoffset: SAFE_STROKE_LEN });

    if (prefersReduced) {
      gsap.set(wordStack, { width: repW });
      gsap.set(strikeLine, { scaleX: 1, opacity: 0 });
      gsap.set(strikeWord, { opacity: 0, visibility: 'hidden' });
      gsap.set(repSvg, { opacity: 1 });
      gsap.set(repLetters, { strokeDashoffset: 0, fill: '#FF5E00' });
      return;
    }

    activeTl = gsap.timeline({
      scrollTrigger: {
        trigger: sec,
        start: 'center center',
        end: '+=140%',
        scrub: 0.5,
        pin: true,
        anticipatePin: 1
      }
    });

    // Phase 1: Strike line draws across "marketing" (0% - 14%)
    activeTl.fromTo(strikeLine,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.14, ease: 'none' },
      0
    );

    // Phase 2: "marketing" fades out (12% - 26%)
    activeTl.fromTo(strikeWord,
      { opacity: 1 },
      { opacity: 0, duration: 0.14, ease: 'none' },
      0.12
    );

    // Phase 2b: Strike line fades out alongside marketing (16% - 26%)
    activeTl.fromTo(strikeLine,
      { opacity: 1 },
      { opacity: 0, duration: 0.10, ease: 'none' },
      0.16
    );

    // Phase 3: "reputation" SVG fades in with slight rise (22% - 32%)
    activeTl.fromTo(repSvg,
      { opacity: 0, y: 4 },
      { opacity: 1, y: 0, duration: 0.10, ease: 'none' },
      0.22
    );
    activeTl.to(wordStack, {
      width: repW,
      duration: 0.20,
      ease: 'power1.inOut'
    }, 0.22);

    // Phase 4: Reputation letters draw one by one (30% - 72%)
    const letterDuration = 0.055;
    const letterGap = 0.038;
    repLetters.forEach((letter, i) => {
      activeTl.to(letter, {
        strokeDashoffset: 0,
        duration: letterDuration,
        ease: 'none'
      }, 0.30 + i * letterGap);
    });

    // Phase 5: Letters fill with orange color (68% - 84%)
    activeTl.to(repLetters, {
      fill: '#FF5E00',
      duration: 0.16,
      stagger: 0.015,
      ease: 'none'
    }, 0.68);

    // Phase 6: Hold final state (84% - 100%)
    activeTl.to({}, { duration: 0.06 });
  }

  // Wait for fonts then setup
  function init() {
    void strikeWord.offsetHeight; // force reflow
    setupRepLetters();
    buildTimeline();
  }

  if (document.fonts && document.fonts.ready) {
    const fontTimeout = new Promise(function(resolve){ setTimeout(resolve, 3000); });
    Promise.race([document.fonts.ready, fontTimeout]).then(init);
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  // Re-measure on resize with proper debounce
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      setupRepLetters();
      buildTimeline();
      ScrollTrigger.refresh();
    }, 250);
  });

  // Legacy is-in-view class
  ScrollTrigger.create({
    trigger: sec,
    start: 'top 70%',
    onEnter: () => sec.classList.add('is-in-view'),
    once: true
  });
})();

/* ---------- Voice Fingerprint — Canvas procedural waves ---------- */
(function voiceFingerprintCanvas(){
  const container = document.querySelector('#bentoVoice .voice-print-art');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'voice-print-canvas';
  container.innerHTML = '';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W, H, dpr, time = 0, raf;

  function resize() {
    const rect = container.getBoundingClientRect();
    dpr = PERF.dpr;
    W = rect.width;
    H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawRidge(rx, ry, opacity) {
    ctx.beginPath();
    ctx.ellipse(W / 2, H / 2, rx, ry, 0, Math.PI, 0);
    ctx.strokeStyle = `rgba(244,244,248,${opacity})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(W / 2, H / 2, rx, ry, 0, 0, Math.PI);
    ctx.stroke();
  }

  function drawWave(yBase, amp, freq, speed, phase, color, lineWidth, glow) {
    ctx.beginPath();
    for (let x = 0; x <= W; x += 1.5) {
      // Additive synthesis: combine multiple sine waves for organic, non-periodic look
      const t = time * speed + phase;
      const y = yBase + (
        Math.sin(x * freq + t) * amp * 0.55 +
        Math.sin(x * freq * 2.17 + t * 1.31) * amp * 0.28 +
        Math.sin(x * freq * 0.53 + t * 0.79) * amp * 0.17
      );
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (glow) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
    } else {
      ctx.shadowBlur = 0;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Fingerprint ridges
    drawRidge(W * 0.42, H * 0.38, 0.06);
    drawRidge(W * 0.35, H * 0.30, 0.05);
    drawRidge(W * 0.28, H * 0.22, 0.04);
    drawRidge(W * 0.20, H * 0.15, 0.03);

    // Wave tracks
    drawWave(H * 0.18, H * 0.07, 0.022, 0.025, 0,     'rgba(26,106,255,0.35)', 1.2);
    drawWave(H * 0.32, H * 0.10, 0.018, 0.020, 1.5,   'rgba(110,60,255,0.40)',  1.4);
    drawWave(H * 0.52, H * 0.14, 0.015, 0.018, 3,     '#FF5E00',                2.2, true);
    drawWave(H * 0.72, H * 0.10, 0.017, 0.015, 4.5,   'rgba(255,138,61,0.40)',  1.4);
    drawWave(H * 0.86, H * 0.07, 0.019, 0.020, 6,     'rgba(255,94,0,0.30)',    1.2);

    // Scan bar — smooth ping-pong oscillation (no reset)
    const scanPhase = Math.sin(time * 0.0025);
    const scanX = (scanPhase * 0.5 + 0.5) * W;
    const scanAlpha = Math.pow(1 - Math.abs(scanPhase), 0.7);
    if (scanAlpha > 0.01) {
      const g = ctx.createLinearGradient(scanX, 0, scanX, H);
      g.addColorStop(0, 'rgba(255,94,0,0)');
      g.addColorStop(0.5, `rgba(255,94,0,${0.45 * scanAlpha})`);
      g.addColorStop(1, 'rgba(255,94,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(scanX - 1, 0, 2, H);
    }

    time += 1;
    raf = requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize);

  // Pause when off-screen to save GPU
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) { if (!raf) draw(); }
      else { cancelAnimationFrame(raf); raf = null; }
    });
    io.observe(container);
  }
})();

/* ---------- Counters ---------- */
(function counters(){
  let els = document.querySelectorAll('[data-count]');
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


/* ---------- Premise metric hover expand ---------- */
(function premiseMetrics(){
  var grid = document.querySelector('.ps-metric-grid');
  if (!grid) return;

  var metrics = grid.querySelectorAll('.ps-metric');
  var overlay = document.getElementById('psIntroOverlay');
  var isMobile = function(){ return window.matchMedia('(max-width: 900px)').matches; };
  var overlayDismissed = false;

  // Stage 1: Dismiss overlay on first grid hover
  if (overlay) {
    grid.addEventListener('mouseenter', function(){
      if (isMobile() || overlayDismissed) return;
      overlay.classList.add('is-hidden');
      overlayDismissed = true;
    });
  }

  // Stage 2: Individual tile hover — dim siblings + counter animation
  metrics.forEach(function(metric){
    metric.addEventListener('mouseenter', function(){
      if (isMobile()) return;

      // Dim sibling tiles
      metrics.forEach(function(m){
        if (m !== metric) {
          m.style.opacity = '0.15';
        }
      });

      // Animate the expanded counter
      var counterEl = metric.querySelector('.ps-metric-expand [data-count]');
      if (counterEl) {
        var target = parseFloat(counterEl.getAttribute('data-count')) || 0;
        var dur = 800;
        var start = performance.now();
        var ease = function(t){ return 1 - Math.pow(1 - t, 3); };
        var tick = function(t){
          var p = Math.min(1, (t - start) / dur);
          counterEl.textContent = Math.round(ease(p) * target);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    });

    metric.addEventListener('mouseleave', function(){
      if (isMobile()) return;
      // Restore all siblings
      metrics.forEach(function(m){
        m.style.opacity = '';
      });
    });
  });
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
    const total = r.height;
    const traveled = Math.min(total, Math.max(0, startY - r.top));
    const pct = Math.max(0, Math.min(1, traveled / Math.max(total, 1)));
    fill.style.height = (pct * 100) + '%';
  };
  upd();
  window.addEventListener('scroll', upd, { passive: true });
  window.addEventListener('resize', upd);
})();

/* ---------- Bento cursor glow ---------- */
(function bentoGlow(){
  if (PERF.isMobile) return;
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
    const inHero = rect.top < vh && rect.bottom > 0;
    if (indicator) {
      indicator.classList.toggle('is-hidden', !inHero);
    }
    if (!inHero) return;
    const total = wrap.offsetHeight - vh;
    const scrolled = Math.max(0, Math.min(total, -rect.top));
    const pct = total > 0 ? (scrolled / total) * 100 : 0;
    fill.style.height = pct + '%';
    ticks.forEach((t, i) => {
      t.classList.toggle('is-hit', pct >= (i * 20));
    });
  };

  window.addEventListener('scroll', upd, { passive: true });
  upd();
})();

/* ---------- Magnetic buttons ---------- */
(function magnetic(){
  if (REDUCED || PERF.isMobile) return;
  const els = document.querySelectorAll('[data-magnetic]');
  els.forEach(el => {
    let raf;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top  + r.height / 2);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = 'translate(' + (x * 0.18) + 'px,' + (y * 0.22) + 'px)';
      });
    });
    el.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      el.style.transform = '';
    });
  });
})();

/* ---------- Scramble text on hover ---------- */
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

/* ---------- Phase IV graph scroll reveal ---------- */
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
   FLOW-FIELD HERO BACKGROUND — Optimized
   ============================================================== */
(function flowField(){
  const cv = document.getElementById('flow-canvas');
  if (!cv || REDUCED) return;
  const ctx = cv.getContext('2d', { alpha: false });
  let W = 0, H = 0, DPR = PERF.dpr;
  let particles = [];
  let mouse = { x: -9999, y: -9999, active: false };
  let mouseRaf = 0;
  const TAU = Math.PI * 2;

  /* Simplex-ish 2D value noise */
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
    ) * 0.5;
  };

  const resize = () => {
    const r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width  = Math.floor(W * DPR);
    cv.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    initParticles();
  };

  const COUNT = () => Math.floor(Math.min(PERF.flowParticles, (W * H) / 12000));

  const initParticles = () => {
    const n = COUNT();
    particles = new Array(n);
    for (let i = 0; i < n; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      particles[i] = {
        x: x, y: y, px: x, py: y,
        life: Math.random() * 240 + 80,
        hue: Math.random() < 0.55 ? 22 : 220,
        a: 0
      };
    }
  };

  let t = 0;
  let raf;
  let lastFrame = 0;
  const heroContent = document.getElementById('heroContent');

  const step = (now) => {
    if (!DOC_VISIBLE) { raf = requestAnimationFrame(step); return; }

    // Pause background when hero content is revealed (storm canvas has faded)
    if (heroContent && heroContent.classList.contains('is-revealed')) {
      raf = requestAnimationFrame(step);
      return;
    }
    lastFrame = now;

    ctx.fillStyle = '#050810';
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

      if (mouse.active && !PERF.disableMouse){
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
      ctx.strokeStyle = 'hsla(' + p.hue + ',' + sat + '%,' + lit + '%,' + p.a + ')';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(p.px, p.py);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    raf = requestAnimationFrame(step);
  };

  const start = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(step); };

  if (!PERF.disableMouse) {
    cv.addEventListener('mousemove', (e) => {
      cancelAnimationFrame(mouseRaf);
      mouseRaf = requestAnimationFrame(() => {
        const r = cv.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
        mouse.active = true;
      });
    });
    cv.addEventListener('mouseleave', () => { mouse.active = false; });
  }

  const hero = document.querySelector('.hero-wrap');
  if (hero && 'IntersectionObserver' in window){
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) start();
      else cancelAnimationFrame(raf);
    }, { threshold: 0.05 });
    io.observe(hero);
  }

  let flowResizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(flowResizeTimer);
    flowResizeTimer = setTimeout(resize, 150);
  });
  window.addEventListener('orientationchange', () => {
    clearTimeout(flowResizeTimer);
    flowResizeTimer = setTimeout(resize, 200);
  });
  resize();
  start();
})();


/* ==============================================================
   TYPOGRAPHIC STORM v5 — Performance Optimized
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
  let DPR = PERF.dpr;
  const TAU = Math.PI * 2;
  let W = 0, H = 0, raf;
  let isDrawing = false;
  let time = 0, lastTime = 0;
  let rawProgress = 0, smoothProgress = 0;

  // Throttled mouse
  let mouse = { x: -1000, y: -1000, vx: 0, vy: 0, active: false };
  let mouseRaf = 0;
  if (!PERF.disableMouse) {
    cv.addEventListener('mousemove', (e) => {
      cancelAnimationFrame(mouseRaf);
      mouseRaf = requestAnimationFrame(() => {
        const r = cv.getBoundingClientRect();
        const nx = e.clientX - r.left;
        const ny = e.clientY - r.top;
        mouse.vx = nx - mouse.x;
        mouse.vy = ny - mouse.y;
        mouse.x = nx;
        mouse.y = ny;
        mouse.active = true;
      });
    });
    cv.addEventListener('mouseleave', () => { mouse.active = false; });
  }

  const NOISE = ["maybe","sort of","I guess","unclear","noise","doubt","probably","somewhat","vague","random","clutter","messy","lost","static","um","like","could be","perhaps","tbd"];
  const SIGNAL = ["conviction","thesis","principle","observation","pattern","insight","belief","framework","strategy","vision","authority","clarity","purpose","signal","truth","leverage","compound","architecture"];
  const TITLES = [
    "The Architecture of Trust","Scaling Culture","Beyond Product Market Fit",
    "The Authority Engine","Reputation as Infrastructure","Navigating the Cycle",
    "Founder to CEO","The Signal in the Noise","Engineering Serendipity"
  ];

  let words = [];
  let gridTitles = [];
  let flowParticles = [];

  function noiseFn(x, y) {
    return Math.sin(x * 0.05) * Math.cos(y * 0.05) + Math.sin(x * 0.02 + y * 0.03);
  }

  function init() {
    words = [];
    gridTitles = [];
    flowParticles = [];

    let signalCount = 0;
    const WORD_COUNT = () => Math.floor(Math.min(PERF.stormWords, (W * H) / 5000));
    const MAX_SIGNAL = 24;

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
        isSignal, keepsSlot,
        ox: startX, oy: startY,
        x: startX, y: startY,
        z: Math.random() * 200,
        vx: 0, vy: 0,
        baseSize: isSignal ? (window.innerWidth <= 900 ? 12 + Math.random()*3 : 16 + Math.random()*5) : (window.innerWidth <= 900 ? 10 + Math.random()*2 : 14 + Math.random()*4),
        alpha: 0, dissolved: false,
        orbA: Math.random() * TAU,
        orbR: 150 + Math.random() * 250,
        col, row, idx: i
      });
    }

    if (PERF.stormGridTitles > 0) {
      for(let i=0; i<PERF.stormGridTitles; i++) {
        gridTitles.push({
          text: TITLES[Math.floor(Math.random() * TITLES.length)],
          x: Math.random() * W, y: Math.random() * H,
          alpha: 0, connections: []
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
    }

    if (PERF.stormFlowParticles > 0) {
      for(let i=0; i<PERF.stormFlowParticles; i++) {
        flowParticles.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: 0, vy: 0,
          life: Math.random() * 100,
          maxLife: 50 + Math.random() * 100,
          color: Math.random() > 0.5 ? 'rgba(255,94,0,0.15)' : 'rgba(26,106,255,0.15)'
        });
      }
    }
  }

  let resizeTimer;
  function resize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      DPR = PERF.dpr;
      cv.width = Math.floor(W * DPR);
      cv.height = Math.floor(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      init();
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }, 150);
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function easeInOutCubic(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  const phaseChaos    = (p) => Math.max(0, Math.min(1, p / 0.15));
  const phaseFilter   = (p) => Math.max(0, Math.min(1, (p - 0.15) / 0.20));
  const phaseAssemble = (p) => Math.max(0, Math.min(1, (p - 0.35) / 0.20));
  const phaseOutput   = (p) => Math.max(0, Math.min(1, (p - 0.55) / 0.20));
  const phaseNetwork  = (p) => Math.max(0, Math.min(1, (p - 0.75) / 0.20));
  const phaseFade     = (p) => Math.max(0, Math.min(1, (p - 0.95) / 0.05));

  // Pre-create vignette gradient when possible
  let vignetteGrad = null;
  function getVignette(cx, cy, outer) {
    if (!vignetteGrad) {
      vignetteGrad = ctx.createRadialGradient(cx, cy, outer * 0.2, cx, cy, outer);
      vignetteGrad.addColorStop(0, 'transparent');
      vignetteGrad.addColorStop(1, 'rgba(5,8,16,0.6)');
    }
    return vignetteGrad;
  }

  let frameSkip = 0;
  function draw(now) {
    if (!DOC_VISIBLE) { raf = requestAnimationFrame(draw); return; }


    // Skip heavy rendering when storm has fully faded out
    if (smoothProgress >= 0.96) {
      raf = requestAnimationFrame(draw);
      return;
    }

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

    const pOutput  = Math.max(0, Math.min(1, (p - 0.55) / 0.20));
    const pNetwork = Math.max(0, Math.min(1, (p - 0.75) / 0.20));
    const pFade    = Math.max(0, Math.min(1, (p - 0.95) / 0.05));

    // Vignette (cached gradient)
    const outer = Math.max(W, H) * 0.95;
    ctx.fillStyle = getVignette(cx, cy, outer);
    ctx.fillRect(0, 0, W, H);

    // Flow Field Background
    if (PERF.stormFlowParticles > 0) {
      ctx.lineWidth = 1.5;
      for (let k = 0; k < flowParticles.length; k++) {
        const fp = flowParticles[k];
        let angle = noiseFn(fp.x, fp.y) * TAU;
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
        ctx.strokeStyle = fp.color.replace('0.15', (0.3 * lifeRatio).toFixed(2));
        ctx.stroke();
        fp.life++;
        if (fp.life > fp.maxLife || fp.x < 0 || fp.x > W || fp.y < 0 || fp.y > H) {
          fp.x = Math.random() * W; fp.y = Math.random() * H;
          fp.life = 0; fp.maxLife = 50 + Math.random() * 100;
          fp.vx = 0; fp.vy = 0;
        }
      }
    }

    // Background Glow in Network
    if (pNetwork > 0 && !PERF.disableShadows) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 500);
      g.addColorStop(0, 'rgba(255,94,0,' + (pNetwork * 0.12 * (1 - pFade)) + ')');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0,0,W,H);
    }

    // Grid Titles and Network
    if (pOutput > 0 && pFade < 1 && gridTitles.length > 0) {
      const gOp = pOutput * (1 - pFade);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '500 12px "JetBrains Mono", monospace';
      for (let k = 0; k < gridTitles.length; k++) {
        const t = gridTitles[k];
        t.alpha = Math.min(1, gOp * (0.2 + 0.8 * Math.sin(k + time)));
        ctx.fillStyle = 'rgba(244,244,248,' + (t.alpha * 0.18) + ')';
        ctx.fillText(t.text, t.x, t.y);
        if (pNetwork > 0) {
          for (let ci = 0; ci < t.connections.length; ci++) {
            const tj = gridTitles[t.connections[ci]];
            ctx.beginPath();
            ctx.moveTo(t.x, t.y);
            ctx.lineTo(tj.x, tj.y);
            ctx.strokeStyle = 'rgba(255,94,0,' + (pNetwork * gOp * 0.18 * (t.alpha + tj.alpha)/2) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    // Words
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const isMobileLayout = window.innerWidth <= 900;
    const colW = isMobileLayout ? Math.min(180, W / 3.2) : 180;
    const rowH = isMobileLayout ? 24 : 36;
    const totalCols = 3;
    const startX = cx - (colW * totalCols) / 2 + colW / 2;
    const startY = cy - 120;

    const pc = phaseChaos(p);
    const pf = phaseFilter(p);
    const pa = phaseAssemble(p);
    const po = phaseOutput(p);

    if (p < 0.15) {
      for (let k = 0; k < words.length; k++) { words[k].dissolved = false; }
    }

    // Batch words by shadow state to minimize shadowBlur changes
    const drawWord = (w, tx, ty, scale, alpha, col, font) => {
      const sa = alpha * Math.min(1, scale);
      if (sa <= 0.01) return;
      ctx.globalAlpha = sa;
      ctx.font = font;
      ctx.fillStyle = col;
      // Manual transform instead of save/restore
      const invScale = 1 / scale;
      ctx.translate(tx, ty);
      ctx.scale(scale, scale);
      ctx.fillText(w.text, 0, 0);
      ctx.scale(invScale, invScale);
      ctx.translate(-tx, -ty);
    };

    for (let k = 0; k < words.length; k++) {
      const w = words[k];
      if (w.dissolved) continue;

      let tx = w.x, ty = w.y, tz = w.z;
      let alpha = 1;
      let col = w.isSignal ? '#FF5E00' : '#B8B8CC';
      let font = '600 ' + w.baseSize + 'px "Satoshi", sans-serif';
      let useShadow = false;

      if (p < 0.15) {
        w.vx += (w.ox - w.x) * 0.001;
        w.vy += (w.oy - w.y) * 0.001;
        w.vx += Math.sin(time * 0.5 + w.idx) * 0.02;
        w.vy += Math.cos(time * 0.4 + w.idx) * 0.02;

        if (mouse.active && !PERF.disableMouse) {
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
        tx = w.x; ty = w.y;
        alpha = 0.6 + 0.4 * Math.sin(time*2 + w.idx);
      } else if (p < 0.35) {
        if (!w.isSignal) {
          w.vx += (w.x - cx) * 0.0005;
          w.vy += (w.y - cy) * 0.0005;
          w.x += w.vx; w.y += w.vy;
          alpha = 1 - pf;
          if (pf > 0.8) w.dissolved = true;
        } else {
          w.orbA += 0.015;
          const targetX = cx + Math.cos(w.orbA) * w.orbR;
          const targetY = cy + Math.sin(w.orbA) * (w.orbR * 0.3);
          w.x = lerp(w.x, targetX, easeInOutCubic(pf));
          w.y = lerp(w.y, targetY, easeInOutCubic(pf));
          tx = w.x; ty = w.y;
          tz = 100;
          col = '#FF5E00';
          alpha = Math.min(1, 0.4 + pf);
        }
      } else if (p < 0.55) {
        if (!w.isSignal) { w.dissolved = true; continue; }
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
           tx = w.x; ty = w.y;
           tz = lerp(100, 0, pa);
        }
      } else if (p < 0.95) {
        if (!w.isSignal || !w.keepsSlot) { w.dissolved = true; continue; }
        col = (w.col === 1) ? '#1A6AFF' : '#FF5E00';
        const targetX = startX + w.col * colW;
        const targetY = startY + w.row * rowH;
        tz = 0;
        tx = targetX;
        ty = targetY - po * 420;
        alpha = Math.max(0, 1 - po * 1.45);
        if (alpha <= 0) w.dissolved = true;
      } else {
        alpha = 0;
      }

      if (alpha > 0 && !w.dissolved) {
        const scale = 500 / (500 + Math.max(0, tz));
        if (scale > 0 && scale < 10) {
          // Apply shadow only for signal words in non-chaos phases
          const needsShadow = !PERF.disableShadows && w.isSignal && p > 0.15 && p < 0.95;
          if (needsShadow) {
            ctx.shadowColor = 'rgba(255,94,0,0.4)';
            ctx.shadowBlur = 12;
          } else {
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
          }
          drawWord(w, tx, ty, scale, alpha, col, font);
        }
      }
    }

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // Blue structural lines
    if (pa > 0.5) {
      const lineScroll = p >= 0.55 ? pOutput * 420 : 0;
      const lineAlpha = p >= 0.55 ? Math.max(0, 1 - pOutput * 1.45) : 1;
      for (let c = 0; c < totalCols; c++) {
        const lineX = startX + c * colW - colW/2 + 20;
        ctx.beginPath();
        ctx.moveTo(lineX, cy - 140 - lineScroll);
        ctx.lineTo(lineX, cy + 140 - lineScroll);
        ctx.strokeStyle = 'rgba(26,106,255,' + ((pa - 0.5) * 2 * 0.4 * lineAlpha) + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    updateFallbackUI(p);
    mouse.vx *= 0.5;
    mouse.vy *= 0.5;

    raf = requestAnimationFrame(draw);
  }

  // GSAP ScrollTrigger
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined'){
    gsap.registerPlugin(ScrollTrigger);

    const heroSticky = document.querySelector('.hero-sticky');
    ScrollTrigger.create({
      trigger: '.hero-wrap',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        rawProgress = self.progress;
        const revealed = self.progress > 0.80;
        if (heroContent) heroContent.classList.toggle('is-revealed', revealed);
        if (heroSticky) heroSticky.classList.toggle('has-revealed', revealed);
      }
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.hero-wrap',
        start: 'top top',
        end: 'bottom bottom',
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
        raf = requestAnimationFrame(draw);
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
    DPR = PERF.dpr;
    cv.width = Math.floor(W * DPR);
    cv.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    init();
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    raf = requestAnimationFrame(draw);
  }
  if (document.fonts && document.fonts.ready){
    document.fonts.ready.then(start);
    setTimeout(start, 1200);
  } else {
    start();
  }
})();


/* ==============================================================
   HORIZON EFFECT — Optimized
   ============================================================== */
(function horizonEffect(){
  const wrap = document.getElementById('horizon');
  const cv   = document.getElementById('horizon-canvas');
  if (!cv || !wrap) return;

  const acts     = wrap.querySelectorAll('.horizon-act');
  const dots     = wrap.querySelectorAll('.hp-dot');
  const fillBar  = document.getElementById('horizonFill');


  // Mobile scroll-driven animations are enabled — canvas and acts animate normally

  const ctx      = cv.getContext('2d', { alpha: true });
  const DPR      = PERF.dpr;
  const TAU      = Math.PI * 2;
  let W = 0, H = 0, progress = 0, time = 0, raf;

  const N = PERF.horizonParticles;
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

  const FRAGS = ['strategy','voice','narrative','conviction','signal','vision','clarity','purpose'];
  let textFrags = [];

  function initFragments(){
    const isMobileLayout = window.innerWidth <= 900;
    const cx = isMobileLayout ? W * 0.5 : W * 0.72;
    const cy = isMobileLayout ? H * 0.35 : H * 0.5;
    const R = Math.min(W * 0.15, 155);
    textFrags = FRAGS.map((t, i) => {
      const convAngle = (i / FRAGS.length) * TAU - Math.PI / 2;
      return {
        text: t,
        sx: W * 0.2 + Math.random() * W * 0.7,
        sy: H * 0.06 + Math.random() * H * 0.88,
        convAngle, convR: R,
        offset: Math.random() * TAU,
        baseAlpha: 0.24 + Math.random() * 0.16,
        size: 14 + Math.random() * 5,
        hue: i % 2 === 0 ? 22 : 220
      };
    });
  }

  function resize(){
    const r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width  = Math.floor(W * DPR);
    cv.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    initParticles();
    initFragments();
  }

  let lastFrame = 0;
  let frameSkip = 0;

  function draw(now){
    if (!DOC_VISIBLE) { raf = requestAnimationFrame(draw); return; }

    lastFrame = now;

    ctx.clearRect(0, 0, W, H);
    time += 0.012;

    const isMobileLayout = window.innerWidth <= 900;
    const cx = isMobileLayout ? W * 0.5 : W * 0.72;
    const cy = isMobileLayout ? H * 0.35 : H * 0.5;

    const p2   = Math.max(0, Math.min(1, (progress - 0.26) * 2.7));
    const p3   = Math.max(0, Math.min(1, (progress - 0.60) * 2.5));
    const conv = Math.max(0, Math.min(1, (progress - 0.08) / 0.58));

    // Ambient glow
    const glR = 200 + p2 * 180;
    ctx.beginPath();
    ctx.arc(cx, cy, glR, 0, TAU);
    const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, glR);
    gg.addColorStop(0, 'rgba(255,94,0,' + (0.07 + p2 * 0.14) + ')');
    gg.addColorStop(0.45,'rgba(255,94,0,' + (0.02 + p2 * 0.05) + ')');
    gg.addColorStop(1, 'transparent');
    ctx.fillStyle = gg;
    ctx.fill();

    // Concentric rings
    if (p2 > 0){
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 5]);
      for (let r = 45; r <= 220; r += 44){
        const rr = r * (0.25 + p2 * 0.75);
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, TAU);
        ctx.strokeStyle = 'rgba(255,94,0,' + (p2 * 0.24 * (1 - r / 260)) + ')';
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Crosshair
    if (p2 > 0.15){
      const ca = (p2 - 0.15) / 0.85 * 0.18;
      ctx.strokeStyle = 'rgba(244,244,248,' + ca + ')';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(cx - 240, cy); ctx.lineTo(cx + 240, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - 240); ctx.lineTo(cx, cy + 240); ctx.stroke();
    }

    // Pulsing outer ring
    if (p3 > 0){
      const pulse = 0.5 + Math.sin(time * 1.8) * 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 225 + pulse * 25, 0, TAU);
      ctx.strokeStyle = 'rgba(255,94,0,' + (p3 * 0.14 * pulse) + ')';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    // Radiating signal lines
    if (p3 > 0){
      ctx.strokeStyle = 'rgba(255,94,0,' + (p3 * 0.09) + ')';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 16; i++){
        const a = (i / 16) * TAU + time * 0.1;
        const inner = 220;
        const len   = 70 + p3 * 180;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
        ctx.lineTo(cx + Math.cos(a) * (inner + len), cy + Math.sin(a) * (inner + len));
        ctx.stroke();
      }
    }

    // Particles
    for (let i = 0; i < particles.length; i++){
      const p = particles[i];
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
      ctx.fillStyle = 'hsla(' + p.hue + ',' + sat + '%,' + lit + '%,' + alpha + ')';
      ctx.fill();

      if (p3 > 0 && !PERF.disableShadows){
        ctx.beginPath();
        ctx.arc(x, y, r * 4, 0, TAU);
        ctx.fillStyle = 'hsla(' + p.hue + ',' + sat + '%,' + lit + '%,' + (p3 * 0.06) + ')';
        ctx.fill();
      }
    }

    // Center dot
    if (p2 > 0.15){
      const da = Math.min(1, (p2 - 0.15) / 0.35);
      ctx.beginPath();
      ctx.arc(cx, cy, 5.5, 0, TAU);
      ctx.fillStyle = 'rgba(244,244,248,' + (da * 0.95) + ')';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, TAU);
      ctx.fillStyle = 'rgba(255,94,0,' + (da * 0.16) + ')';
      ctx.fill();
    }

    // Text fragments
    const fPos = [];
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < textFrags.length; i++){
      const f = textFrags[i];
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
      ctx.font = '600 ' + sz + 'px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(' + rgb + ',' + alpha + ')';
      ctx.fillText(f.text, x, y);
    }

    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';

    // Constellation lines
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
            ctx.strokeStyle = 'rgba(255,94,0,' + (lf * 0.14 * (1 - d / maxD)) + ')';
            ctx.stroke();
          }
        }
      }
    }

    raf = requestAnimationFrame(draw);
  }

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

  }

  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting){ cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }
      else { cancelAnimationFrame(raf); }
    }, { threshold: 0.02 });
    io.observe(wrap);
  }

  window.addEventListener('scroll', updateScroll, { passive: true });
  let horizonResizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(horizonResizeTimer);
    horizonResizeTimer = setTimeout(resize, 150);
  });
  window.addEventListener('orientationchange', () => {
    clearTimeout(horizonResizeTimer);
    horizonResizeTimer = setTimeout(resize, 200);
  });
  resize();
  updateScroll();

  if (REDUCED){
    ctx.clearRect(0, 0, W, H);
    acts.forEach((a, i) => a.classList.toggle('is-active', i === 0));
    return;
  }

  raf = requestAnimationFrame(draw);
})();

/* ==============================================================
   RECORDING TOOL: CINEMATIC AUTO-SCROLL
   ============================================================== */
(function recordingTool() {
  let isScrolling = false;
  let currentPos = window.scrollY;
  const speed = 3.9;

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
if (typeof Lenis !== 'undefined' && !PERF.isLowEnd && !PERF.isMobile) {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
