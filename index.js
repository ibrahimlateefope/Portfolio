
/* ══════════════════════════════════════
   THEME — inherits device preference
══════════════════════════════════════ */
const html = document.documentElement;
const themeBtn = document.getElementById('themeToggle');

// Resolve starting theme: saved pref > system preference
const saved = localStorage.getItem('theme');
let isDark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;

html.setAttribute('data-theme', isDark ? 'dark' : 'light');
themeBtn.textContent = isDark ? '☀' : '☾';

themeBtn.addEventListener('click', () => {
  isDark = !isDark;
  html.setAttribute('data-theme', isDark ? 'dark' : 'light');
  themeBtn.textContent = isDark ? '☀' : '☾';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Sync if system theme changes and user hasn't saved a preference
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (!localStorage.getItem('theme')) {
    isDark = e.matches;
    html.setAttribute('data-theme', isDark ? 'dark' : 'light');
    themeBtn.textContent = isDark ? '☀' : '☾';
  }
});

/* ══════════════════════════════════════
   CURSOR — desktop only (pointer: fine)
══════════════════════════════════════ */
const isDesktop = window.matchMedia('(pointer: fine)').matches;

if (isDesktop) {
  const curDot  = document.getElementById('cur-dot');
  const curRing = document.getElementById('cur-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    curDot.style.left = mx + 'px';
    curDot.style.top  = my + 'px';
  });

  (function moveRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    curRing.style.left = rx + 'px';
    curRing.style.top  = ry + 'px';
    requestAnimationFrame(moveRing);
  })();

  document.querySelectorAll('a, button, .skill-card, .exp-item, .proj-card, .ch-item').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hover-active'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hover-active'));
  });
}

/* ══════════════════════════════════════
   SCROLL PROGRESS
══════════════════════════════════════ */
const pBar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  pBar.style.transform = `scaleX(${pct})`;
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ══════════════════════════════════════
   HAMBURGER
══════════════════════════════════════ */
const hamBtn = document.getElementById('hamBtn');
const mobNav = document.getElementById('mobile-nav');
let mobOpen = false;

hamBtn.addEventListener('click', () => {
  mobOpen = !mobOpen;
  hamBtn.classList.toggle('open', mobOpen);
  mobNav.classList.toggle('open', mobOpen);
  document.body.style.overflow = mobOpen ? 'hidden' : '';
});

function closeMob() {
  mobOpen = false;
  hamBtn.classList.remove('open');
  mobNav.classList.remove('open');
  document.body.style.overflow = '';
}

/* ══════════════════════════════════════
   BOOT SEQUENCE
══════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  const lines  = ['b1','b2','b3','b4','b5'];
  const delays = [300, 750, 1200, 1650, 2000];

  lines.forEach((id, i) => {
    setTimeout(() => { document.getElementById(id).style.opacity = '1'; }, delays[i]);
  });

  setTimeout(() => {
    const p = document.getElementById('bprog');
    const f = document.getElementById('bfill');
    p.style.opacity = '1';
    setTimeout(() => { f.style.width = '100%'; }, 80);
  }, 2300);

  setTimeout(() => {
    document.getElementById('bready').style.opacity = '1';
  }, 4800);

  setTimeout(() => {
    gsap.to('#boot', { opacity: 0, duration: 0.4, onComplete: () => {
      document.getElementById('boot').style.display = 'none';
      startAnimations();
    }});
  }, 5300);
});

/* ══════════════════════════════════════
   GSAP HERO + SCROLL REVEALS
══════════════════════════════════════ */
function startAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // Hero entrance
  gsap.timeline()
    .to('#hEye',     { opacity:1, y:0, duration:.7,  ease:'power2.out' }, 0)
    .to('#hTitle',   { opacity:1, y:0, duration:.9,  ease:'power2.out' }, .15)
    .to('#hBottom',  { opacity:1, y:0, duration:.7,  ease:'power2.out' }, .45)
    .to('#scrollCue',{ opacity:1, duration:.5 }, .9);

  // Scroll reveals — stagger resets per parent container so animations
  // make logical sense (siblings animate in together, not across sections)
  document.querySelectorAll('.fade-up').forEach(el => {
    // Find local index among .fade-up siblings in the same parent
    const siblings = Array.from(el.parentElement.querySelectorAll(':scope > .fade-up, .fade-up'));
    // Keep stagger tight and local: max 4 steps × 90ms
    const localIdx = Math.min(siblings.indexOf(el), 4);

    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: .6,
        delay: localIdx * 0.09,
        ease: 'power2.out'
      })
    });
  });

  initMeshCanvas();
  initProjectCanvases();
}

/* ══════════════════════════════════════
   HERO MESH / WAVEFORM CANVAS
══════════════════════════════════════ */
function initMeshCanvas() {
  const canvas = document.getElementById('meshCanvas');
  const ctx = canvas.getContext('2d');
  let mx_norm = 0.5;

  if (isDesktop) {
    document.addEventListener('mousemove', e => { mx_norm = e.clientX / window.innerWidth; });
  }

  function resize() {
    canvas.width  = canvas.offsetWidth  || window.innerWidth;
    canvas.height = canvas.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width, h = canvas.height;
    const cy = h * 0.5;
    const amp = h * 0.22;

    [
      { freq: 1.2 + mx_norm, amp: amp, alpha: 0.9, lw: 1.5 },
      { freq: 2.4 + mx_norm * .5, amp: amp * .4, alpha: .4, lw: 1 },
      { freq: 0.6, amp: amp * .6, alpha: .3, lw: 0.8 }
    ].forEach(wave => {
      ctx.beginPath();
      for (let x = 0; x <= w; x++) {
        const nx = x / w;
        const envelope = Math.sin(nx * Math.PI);
        const y = cy + Math.sin(nx * Math.PI * 2 * wave.freq + t) * wave.amp * envelope;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      ctx.strokeStyle = dark ? `rgba(245,166,35,${wave.alpha})` : `rgba(196,125,10,${wave.alpha * .7})`;
      ctx.lineWidth = wave.lw;
      ctx.shadowColor = dark ? '#F5A623' : '#C47D0A';
      ctx.shadowBlur = wave.lw * 8;
      ctx.stroke();
    });

    t += 0.016;
    requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════
   PROJECT SIGNAL CANVASES
══════════════════════════════════════ */
function initProjectCanvases() {
  const configs = [
    { id:'pc0', freq: 1.3, phase: 0 },
    { id:'pc1', freq: 2.1, phase: 1.5 },
    { id:'pc2', freq: 0.85, phase: 3.0 }
  ];

  configs.forEach(cfg => {
    const canvas = document.getElementById(cfg.id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = canvas.offsetWidth  || 400;
      canvas.height = canvas.offsetHeight || 400;
    }
    resize();
    window.addEventListener('resize', resize);

    let t = cfg.phase;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width, h = canvas.height;
      const cy = h / 2;
      const amp = h * 0.28;

      ctx.beginPath();
      for (let x = 0; x <= w; x++) {
        const nx = x / w;
        const y = cy + Math.sin(nx * Math.PI * 2 * cfg.freq + t) * amp * Math.sin(nx * Math.PI);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      ctx.strokeStyle = dark ? 'rgba(245,166,35,0.8)' : 'rgba(196,125,10,0.7)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = dark ? '#F5A623' : '#C47D0A';
      ctx.shadowBlur = 10;
      ctx.stroke();
      t += 0.014;
      requestAnimationFrame(draw);
    }
    draw();
  });
}

/* ══════════════════════════════════════
   ACTIVE NAV LINK
══════════════════════════════════════ */
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 200) current = s.id;
  });
  navLinks.forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === '#' + current);
  });
}, { passive: true });
