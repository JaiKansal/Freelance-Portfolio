/* ═══════════════════════════════════════
   PORTFOLIO SCRIPT — Jai Kansal
═══════════════════════════════════════ */

// ── FOOTER YEAR ──
document.getElementById('footer-year').textContent = new Date().getFullYear();

// ── MOUSE SPOTLIGHT & CURSOR ──
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
const progressBar = document.getElementById('scroll-progress');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  dot.style.left  = mx + 'px';
  dot.style.top   = my + 'px';
  
  // Spotlight
  document.body.style.setProperty('--mouse-x', mx + 'px');
  document.body.style.setProperty('--mouse-y', my + 'px');
});

(function animRing() {
  rx += (mx - rx) * 0.14;
  ry += (my - ry) * 0.14;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(animRing);
})();

// ── SCROLL PROGRESS & NAV SCROLL ──
const nav = document.getElementById('main-nav');
const backToTop = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  backToTop.classList.toggle('visible', window.scrollY > 500);

  // Progress Bar
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  progressBar.style.width = scrolled + "%";
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── MOBILE MENU ──
const burger   = document.getElementById('nav-burger');
const mobileMenu = document.getElementById('mobile-menu');
let menuOpen = false;
burger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileMenu.style.display = menuOpen ? 'block' : 'none';
});
document.querySelectorAll('.mobile-link').forEach(l => {
  l.addEventListener('click', () => {
    menuOpen = false;
    mobileMenu.style.display = 'none';
  });
});

// ── BACKGROUND CANVAS (PARTICLE NETWORK) ──
const canvas = document.getElementById('bg-canvas');
const ctx    = canvas.getContext('2d');
let W, H;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const PARTICLE_COUNT = 90;
const particles = [];

class Particle {
  constructor() { this.reset(true); }
  reset(init) {
    this.x  = Math.random() * W;
    this.y  = init ? Math.random() * H : (Math.random() < .5 ? -4 : H + 4);
    this.r  = Math.random() * 1.5 + .3;
    this.vx = (Math.random() - .5) * .25;
    this.vy = (Math.random() - .5) * .25;
    this.alpha = Math.random() * .6 + .2;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < -10 || this.x > W+10 || this.y < -10 || this.y > H+10) this.reset(false);
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(124,58,237,${this.alpha})`;
    ctx.fill();
  }
}

for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

const LINK_DIST = 130;
function drawLinks() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i+1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d  = Math.sqrt(dx*dx + dy*dy);
      if (d < LINK_DIST) {
        const alpha = (1 - d/LINK_DIST) * .18;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(124,58,237,${alpha})`;
        ctx.lineWidth = .6;
        ctx.stroke();
      }
    }
  }
}

// Mouse interaction
let mouseX = -999, mouseY = -999;
document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

function drawMouseLinks() {
  particles.forEach(p => {
    const dx = p.x - mouseX;
    const dy = p.y - mouseY;
    const d  = Math.sqrt(dx*dx + dy*dy);
    if (d < 160) {
      const alpha = (1 - d/160) * .45;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(mouseX, mouseY);
      ctx.strokeStyle = `rgba(6,182,212,${alpha})`;
      ctx.lineWidth = .8;
      ctx.stroke();
    }
  });
}

function bgLoop() {
  ctx.clearRect(0, 0, W, H);
  drawLinks();
  drawMouseLinks();
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(bgLoop);
}
bgLoop();

// ── REVEAL ON SCROLL ──
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

// ── COUNT-UP ANIMATION ──
function countUp(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1500;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current);
    if (current >= target) clearInterval(timer);
  }, 16);
}

const statNums = document.querySelectorAll('.stat-num');
const statIo = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      countUp(entry.target);
      statIo.unobserve(entry.target);
    }
  });
}, { threshold: .5 });
statNums.forEach(el => statIo.observe(el));

// ── SMOOTH ACTIVE NAV ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const secIo = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: .4 });
sections.forEach(s => secIo.observe(s));

// Add active nav style
const style = document.createElement('style');
style.textContent = `.nav-link.active { color: var(--text) !important; }`;
document.head.appendChild(style);

// ── 3D TILT — ABOUT CARD ──
const card = document.getElementById('about-card');
if (card) {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - .5;
    const y = (e.clientY - r.top)  / r.height - .5;
    card.style.transform = `rotateY(${x*12}deg) rotateX(${-y*8}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateY(0) rotateX(0)';
  });
}

// ── 3D TILT — PROJECT CARDS ──
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(pCard => {
  pCard.addEventListener('mousemove', e => {
    const r = pCard.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    pCard.style.transform = `translateY(-6px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  });
  pCard.addEventListener('mouseleave', () => {
    pCard.style.transform = 'translateY(0) rotateY(0) rotateX(0)';
  });
});

// ── MAGNETIC BUTTONS ──
const magneticEls = document.querySelectorAll('.magnetic');
magneticEls.forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'translate(0, 0)';
  });
});

// ── TERMINAL LOGIC ──
const terminalOverlay = document.getElementById('terminal-overlay');
const terminalInput   = document.getElementById('terminal-input');
const terminalBody    = document.getElementById('terminal-body');
const terminalClose   = document.getElementById('terminal-close');
const navTerminalBtn  = document.getElementById('nav-terminal-btn');
const terminalFab     = document.getElementById('terminal-fab');

function openTerminal() {
  terminalOverlay.classList.add('active');
  setTimeout(() => terminalInput.focus(), 100);
}

function closeTerminal() {
  terminalOverlay.classList.remove('active');
}

terminalClose.addEventListener('click', closeTerminal);
navTerminalBtn.addEventListener('click', () => {
  terminalOverlay.classList.contains('active') ? closeTerminal() : openTerminal();
});
terminalFab.addEventListener('click', () => {
  terminalOverlay.classList.contains('active') ? closeTerminal() : openTerminal();
});

window.addEventListener('keydown', e => {
  if (e.key === '`' || (e.key === 't' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT')) {
    e.preventDefault();
    terminalOverlay.classList.contains('active') ? closeTerminal() : openTerminal();
  }
  if (e.key === 'Escape') closeTerminal();
});

const commands = {
  help: () => 'Available commands: about, experience, projects, skills, contact, clear, exit, sudo',
  about: () => 'Jai Kansal: B.Tech CSE @ DU. Co-founder of ManoSathi. Cloud/DevOps enthusiast.',
  experience: () => 'ManoSathi (Founder), Cequence Security (Intern), VCriate (Problem Setter).',
  projects: () => 'ManoSathi (AI Mental Wellness), Cloud Demo Infra.',
  skills: () => 'Next.js, Node.js, GCP, AWS, Terraform, Docker, Kubernetes, Java, C++, Python.',
  contact: () => 'Email: jaikansal85@gmail.com | LinkedIn: jai-kansal-371738297',
  clear: () => {
    const lines = terminalBody.querySelectorAll('.terminal-line');
    lines.forEach(l => l.remove());
    return null;
  },
  exit: () => { closeTerminal(); return 'Closing...'; },
  sudo: () => 'Nice try! But you already have root access to my portfolio. 😉'
};

terminalInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const cmd = terminalInput.value.trim().toLowerCase();
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.innerHTML = `<span class="prompt">guest@jaikansal:~$</span> ${cmd}`;
    terminalBody.insertBefore(line, terminalInput.parentElement);

    if (cmd) {
      const response = commands[cmd] ? commands[cmd]() : `Command not found: ${cmd}. Type 'help' for assistance.`;
      if (response) {
        const respLine = document.createElement('div');
        respLine.className = 'terminal-line';
        respLine.style.color = '#aaa';
        respLine.textContent = response;
        terminalBody.insertBefore(respLine, terminalInput.parentElement);
      }
    }

    terminalInput.value = '';
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }
});

// ── PRELOADER BOOT SEQUENCE ──
const preloader = document.getElementById('preloader');
const preloaderBar = document.getElementById('preloader-bar');
const preloaderLogs = document.getElementById('preloader-logs');
const logs = [
  'MOUNTING_CLOUD_VOLUMES...',
  'ESTABLISHING_FIREBASE_CONNECTION...',
  'INITIALIZING_VERTEX_AI_MODEL...',
  'SECURING_API_GATEWAY_GATEKEEPER...',
  'OPTIMIZING_INFRASTRUCTURE_NODES...',
  'BOOTING_JK_OS_V1.0.4...',
  'SYSTEM_READY.'
];

let logIndex = 0;
function nextLog() {
  if (logIndex < logs.length) {
    const p = document.createElement('div');
    p.className = 'p-log';
    p.textContent = logs[logIndex];
    preloaderLogs.appendChild(p);
    preloaderLogs.scrollTop = preloaderLogs.scrollHeight;
    
    logIndex++;
    const progress = (logIndex / logs.length) * 100;
    preloaderBar.style.width = progress + '%';
    
    setTimeout(nextLog, 150 + Math.random() * 300);
  } else {
    setTimeout(() => {
      preloader.classList.add('loaded');
      document.body.style.overflow = 'auto'; // Re-enable scroll
    }, 500);
  }
}

// Disable scroll during preloader
document.body.style.overflow = 'hidden';
window.addEventListener('load', () => {
  setTimeout(nextLog, 400);
});

// ── TYPING EFFECT — hero subtitle ──
const subtitle = document.getElementById('h-sub');
if (subtitle) {
  const texts = [
    'Co-Founder · Full-Stack Engineer · Cloud Architect',
    'Builder of AI-powered products',
    'Infrastructure meets Product',
  ];
  let ti = 0, ci = 0, deleting = false;
  subtitle.textContent = '';

  function type() {
    const txt = texts[ti];
    if (!deleting) {
      subtitle.textContent = txt.slice(0, ++ci);
      if (ci === txt.length) { deleting = true; setTimeout(type, 2200); return; }
    } else {
      subtitle.textContent = txt.slice(0, --ci);
      if (ci === 0) { deleting = false; ti = (ti+1) % texts.length; }
    }
    setTimeout(type, deleting ? 40 : 65);
  }
  setTimeout(type, 1500);
}
