/* ═══════════════════════════════════════════
   02 IT Solutions — script.js
═══════════════════════════════════════════ */

'use strict';

// ── Custom Cursor ───────────────────────────
const cursor         = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');

let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

function animateFollower() {
  followerX += (mouseX - followerX) * 0.1;
  followerY += (mouseY - followerY) * 0.1;
  cursorFollower.style.left = followerX + 'px';
  cursorFollower.style.top  = followerY + 'px';
  requestAnimationFrame(animateFollower);
}
animateFollower();

// ── Scroll Reveal ───────────────────────────
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
);
revealEls.forEach(el => revealObserver.observe(el));

// ── Testimonials Slider ─────────────────────
const track     = document.getElementById('testiTrack');
const dotsWrap  = document.getElementById('tDots');
const cards     = Array.from(track.querySelectorAll('.testi-card'));
let current     = 0;
let autoTimer   = null;

function getVisible() {
  const w = window.innerWidth;
  if (w < 768)  return 1;
  if (w < 1024) return 2;
  return 3;
}

function buildDots() {
  dotsWrap.innerHTML = '';
  const total = Math.ceil(cards.length / getVisible());
  for (let i = 0; i < total; i++) {
    const d = document.createElement('button');
    d.className = 'tdot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Slide ${i + 1}`);
    d.addEventListener('click', () => slideTo(i * getVisible()));
    dotsWrap.appendChild(d);
  }
}

function updateDots() {
  const dots = dotsWrap.querySelectorAll('.tdot');
  const idx  = Math.round(current / getVisible());
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
}

function slideTo(idx) {
  const max = cards.length - getVisible();
  current = Math.max(0, Math.min(idx, max));
  const cardW = cards[0].offsetWidth + 20;
  track.style.transform = `translateX(-${current * cardW}px)`;
  updateDots();
}

function next() {
  const nextIdx = current + getVisible();
  slideTo(nextIdx < cards.length ? nextIdx : 0);
}

function prev() {
  const prevIdx = current - getVisible();
  slideTo(prevIdx >= 0 ? prevIdx : Math.max(0, cards.length - getVisible()));
}

document.getElementById('tNext').addEventListener('click', () => { next(); resetAuto(); });
document.getElementById('tPrev').addEventListener('click', () => { prev(); resetAuto(); });

function startAuto() {
  autoTimer = setInterval(next, 5000);
}

function resetAuto() {
  clearInterval(autoTimer);
  startAuto();
}

buildDots();
startAuto();

window.addEventListener('resize', () => {
  buildDots();
  slideTo(0);
});

// ── Touch / Swipe for Slider ────────────────
let touchStartX = 0;
track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
track.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  resetAuto();
}, { passive: true });

// ── Careers Apply Button ────────────────────
document.querySelectorAll('.job-apply').forEach(btn => {
  btn.addEventListener('click', function () {
    const title = this.closest('.job-item').querySelector('.job-title').textContent;
    const original = this.textContent;
    this.textContent = '✓ Sent!';
    this.style.background = 'rgba(69,194,219,0.15)';
    this.style.borderColor = 'rgba(69,194,219,0.4)';
    this.style.color = '#45C2DB';
    setTimeout(() => {
      this.textContent = original;
      this.style.background = '';
      this.style.borderColor = '';
      this.style.color = '';
    }, 2500);
    console.log(`Applied for: ${title}`);
  });
});

// ── Active nav highlight on scroll ─────────
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('a[href^="#"]');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 120;
  sections.forEach(sec => {
    const top    = sec.offsetTop;
    const height = sec.offsetHeight;
    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(a => {
        a.classList.remove('nav-active');
        if (a.getAttribute('href') === '#' + sec.id) a.classList.add('nav-active');
      });
    }
  });
}, { passive: true });

// ── Smooth stat counter animation ──────────
function animateCounter(el, target, suffix = '') {
  const duration = 1600;
  const start    = performance.now();
  const from     = 0;

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3);
    const value    = Math.round(from + (target - from) * ease);
    el.firstChild.textContent = value;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const raw = el.dataset.count;
      if (raw) animateCounter(el, parseInt(raw));
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-val').forEach(el => {
  const text   = el.textContent.replace(/[^0-9]/g, '');
  const suffix = el.textContent.replace(/[0-9]/g, '');
  if (text) {
    el.dataset.count = text;
    el.innerHTML     = `0<span>${suffix}</span>`;
    statObserver.observe(el);
  }
});

// ── Parallax glow on mouse move ─────────────
document.addEventListener('mousemove', e => {
  const x = (e.clientX / window.innerWidth  - 0.5) * 30;
  const y = (e.clientY / window.innerHeight - 0.5) * 30;
  document.querySelectorAll('.glow').forEach((g, i) => {
    const factor = i % 2 === 0 ? 1 : -1;
    g.style.transform = `translate(${x * factor * 0.4}px, ${y * factor * 0.4}px)`;
  });
});
