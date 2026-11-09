/* =========================================================================
   Nandhini & Prabhu — Engagement invitation · script.js
   Vanilla JS. GSAP, ScrollTrigger and Lenis are optional enhancements:
   every feature checks for them, so the page stays complete without them.
   ========================================================================= */
'use strict';

/* ─────────────────────────────────────────────────────────────────────────
   1. CONFIG — change the details here; the layout updates itself.
      (Also update <title> and the og: tags in engagement/index.html,
       because link-preview crawlers do not run JavaScript.)
   ───────────────────────────────────────────────────────────────────────── */
const CONFIG = {
  /* Colour theme: 'royal' | 'midnight' | 'temple' | 'pastel' */
  theme: 'royal',
  /* Shows the little theme picker (bottom-left). Set to false before sharing with guests. */
  showThemeSwitcher: false,

  bride: { name: 'Nandhini', initial: 'N' },
  groom: { name: 'Prabhu', initial: 'P' },

  event: {
    title: 'Engagement Ceremony',
    subtitle: 'Nichayathartham',
    titleTamil: 'நிச்சயதார்த்தம்',
    tagline: 'Two hearts, one promise',
    date: '2026-11-15',          // YYYY-MM-DD, date at the venue
    startTime: '10:00',          // 24-hour time at the venue
    endTime: '12:00',
    utcOffset: '+05:30',         // IST — keeps the countdown right for guests abroad
    timeZoneName: 'Indian Standard Time (IST)',
  },

  venue: {
    name: 'At Our Home',
    address: '7/227, Sakthinagar, Sellampalayam, Karapadi Post, Punjaipuliampatti, Tamil Nadu – 638459',
    mapsLink: 'https://maps.app.goo.gl/wa59oftFmahTqYZN8',
    mapQuery: 'At Our Home, Sellampalayam, Punjaipuliampatti, Tamil Nadu 638459',  // what the embedded map searches for
  },

  /* Listed one below the other under "For any queries, call". An empty list hides the block. */
  contacts: [
    { name: 'Nandhini', phone: '+91 95978 93576' },
    { name: 'Prabhu', phone: '+91 77085 50125' },
  ],

  hosts: {
    intro: 'With love from',
    names: ['The family of Nandhini', 'The family of Prabhu'],
  },

  story: {
    eyebrow: 'How it all began',
    lines: [
      'Some stories begin with a glance, some with a conversation between two families. Theirs began with both — and a quiet “yes” that felt like it had always been written.',
      'Her name, Nandhini, means “one who brings joy”. His name, Prabhu, means “the lord”. We already know who will really be running the house.',
    ],
    wordplay: null,
  },

  /* Gallery: add/remove freely. Landscape photos are detected and laid out wide automatically.
     wide: true makes a photo span both columns on phones. Missing files are hidden. */
  gallery: [
    { src: '../assets/images/couple-1.jpg', alt: 'Nandhini smiling in a pink silk saree', caption: 'Her name means joy — and she lives up to it.', wide: true },
    { src: '../assets/images/couple-2.jpg', alt: 'Prabhu smiling in a white shirt', caption: 'The man with the never-ending smile.' },
    { src: '../assets/images/couple-3.jpg', alt: 'Nandhini in a purple silk saree in a garden', caption: 'Grace, draped in silk.' },
    { src: '../assets/images/couple-6.jpg', alt: 'Prabhu in a light blue shirt in front of a flower arch', caption: 'Dressed up, heart wide open.' },
    { src: '../assets/images/couple-7.jpg', alt: 'Nandhini in a pink and green saree standing on a village road', caption: 'Every road led here.' },
    { src: '../assets/images/couple-8.jpg', alt: 'Nandhini and Prabhu holding hands at a temple', caption: 'Two hearts, one promise.', wide: true },
  ],

  blessing: 'With the blessings of our families, we invite you to grace the occasion.',
  hashtag: '#PranaBegins',

  wedding: { label: 'The Wedding', when: 'February 2027', note: 'Save the date', link: '../wedding/' },
  footer: { madeBy: 'Karthikeyan', relation: "bride's brother" },
  music: { src: '../assets/audio/song1.mp4', volume: 0.5, fadeMs: 2000 },
};

/* Theme metadata used by the picker, the browser bar colour and the particles. */
const THEMES = {
  royal: {
    label: 'Royal Maroon', meta: '#6B0F1A', swatch: ['#6B0F1A', '#C9A227', '#FFF8EC'],
    particles: { kind: 'petal', colors: ['#B3122E', '#D63F5A', '#8E0E25', '#FFF6EA', '#F1DFC2'] },
  },
  midnight: {
    label: 'Midnight & Gold', meta: '#0F1A2E', swatch: ['#0F1A2E', '#D4AF37', '#FAF6EE'],
    particles: { kind: 'star', colors: ['#D4AF37', '#F6E7B0', '#FFFFFF'] },
  },
  temple: {
    label: 'Temple Festival', meta: '#B3001B', swatch: ['#B3001B', '#E8A317', '#2F5D3A'],
    particles: { kind: 'petal', colors: ['#F2A007', '#F7C02A', '#E8650C', '#FFB627', '#D9480F'] },
  },
  pastel: {
    label: 'Pastel Garden', meta: '#8E4B57', swatch: ['#B76E79', '#F6D5C3', '#A8B5A2'],
    particles: { kind: 'petal', colors: ['#F6D5C3', '#EDB3B0', '#B76E79', '#C8D3C1', '#FFFBF5'] },
  },
};

/* ─────────────────────────────────────────────────────────────────────────
   2. BOOT — runs immediately in <head> so the theme is set before paint
   ───────────────────────────────────────────────────────────────────────── */
const ROOT = document.documentElement;
const STORE_THEME = 'np-invite-theme';
const STORE_MUSIC = 'np-invite-music';
const APP = { booted: false, reduced: false, lenis: null, petals: null, music: null, heroIntro: null };

function storageGet(type, key) {
  try { return window[type].getItem(key); } catch (err) { return null; }
}
function storageSet(type, key, value) {
  try { window[type].setItem(key, value); } catch (err) { /* storage blocked (private mode) */ }
}

function resolveTheme() {
  let fromUrl = null;
  try { fromUrl = new URLSearchParams(window.location.search).get('theme'); } catch (err) { fromUrl = null; }
  if (fromUrl && THEMES[fromUrl]) return fromUrl;
  if (CONFIG.showThemeSwitcher) {
    const saved = storageGet('localStorage', STORE_THEME);
    if (saved && THEMES[saved]) return saved;
  }
  return THEMES[CONFIG.theme] ? CONFIG.theme : 'royal';
}

function setThemeAttr(name) {
  ROOT.setAttribute('data-theme', name);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEMES[name].meta);
}

(function boot() {
  APP.reduced = Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  ROOT.classList.add('js');
  if ('IntersectionObserver' in window) ROOT.classList.add('can-reveal');
  setThemeAttr(resolveTheme());
  /* Failsafe: if wiring never completes (e.g. a CDN hangs), show the page anyway. */
  window.setTimeout(() => {
    if (!APP.booted) ROOT.classList.remove('js', 'can-reveal', 'is-locked');
  }, 9000);
})();

/* ─────────────────────────────────────────────────────────────────────────
   3. START — one DOMContentLoaded handler
   ───────────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  APP.booted = true;
  run(renderContent);
  run(initThemeSwitcher);

  if (document.body.dataset.page !== 'engagement') {
    run(initPetals);
    return;
  }

  run(initSmoothScroll);
  run(initMusic);
  run(initHero);
  run(initIntro, revealWithoutGate);
  run(initPetals);
  run(initGallery);
  run(initLightbox);
  run(initCountdown);
  run(initReveals);
  run(initBlessings);
  run(initProgress);
  run(initAnchors);
  run(initCursor);
  window.addEventListener('load', refreshScroll);
});

/* Runs one feature; if it throws, the rest of the page keeps working. */
function run(fn, fallback) {
  try {
    fn();
  } catch (err) {
    if (window.console && console.warn) console.warn(`[invite] ${fn.name} skipped:`, err);
    if (fallback) fallback();
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   4. HELPERS
   ───────────────────────────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const pad = (n) => String(n).padStart(2, '0');

function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

let gsapRegistered = false;
function hasGSAP() {
  if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') return false;
  if (!gsapRegistered) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    gsapRegistered = true;
  }
  return true;
}

function refreshScroll() {
  if (hasGSAP()) window.ScrollTrigger.refresh();
}
let refreshTimer = 0;
function refreshScrollSoon() {
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(refreshScroll, 250);
}

function lockScroll(lock) {
  ROOT.classList.toggle('is-locked', lock);
  if (APP.lenis) {
    if (lock) APP.lenis.stop();
    else APP.lenis.start();
  }
}

function eventDate(time) {
  const ev = CONFIG.event;
  return new Date(`${ev.date}T${time}:00${ev.utcOffset}`);
}

function format12h(time) {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${pad(m)} ${suffix}`;
}

function mapsUrl() {
  const v = CONFIG.venue;
  return v.mapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${v.name}, ${v.address}`)}`;
}

function mapEmbedUrl() {
  const v = CONFIG.venue;
  return `https://www.google.com/maps?q=${encodeURIComponent(v.mapQuery || `${v.name}, ${v.address}`)}&output=embed`;
}

/* ─────────────────────────────────────────────────────────────────────────
   5. CONTENT — fills the page from CONFIG
   ───────────────────────────────────────────────────────────────────────── */
function renderContent() {
  const c = CONFIG;
  const ev = c.event;
  const [y, m, d] = ev.date.split('-').map(Number);
  const utcDay = new Date(Date.UTC(y, m - 1, d));
  const dateText = (opts) => utcDay.toLocaleDateString('en-GB', Object.assign({ timeZone: 'UTC' }, opts));
  const couple = `${c.bride.name} & ${c.groom.name}`;

  const values = {
    'couple.names': couple,
    'bride.name': c.bride.name,
    'groom.name': c.groom.name,
    'bride.initial': c.bride.initial,
    'groom.initial': c.groom.initial,
    'event.titleTamil': ev.titleTamil,
    'event.subtitle': ev.subtitle,
    'event.tagline': ev.tagline,
    'date.dots': `${pad(d)} · ${pad(m)} · ${y}`,
    'date.weekday': dateText({ weekday: 'long' }),
    'date.long': `${d} ${dateText({ month: 'long' })} ${y}`,
    'date.short': `${d} ${dateText({ month: 'short' })} ${y}`,
    'time.range': `${format12h(ev.startTime)} – ${format12h(ev.endTime)}`,
    'time.zone': ev.timeZoneName,
    'venue.name': c.venue.name,
    'venue.address': c.venue.address,
    'hosts.intro': c.hosts.intro,
    blessing: c.blessing,
    hashtag: c.hashtag,
    'wedding.label': c.wedding.label,
    'wedding.when': c.wedding.when,
    'wedding.note': c.wedding.note,
    'footer.madeBy': c.footer.madeBy,
    'footer.relation': c.footer.relation,
    'story.eyebrow': c.story.eyebrow,
  };

  $$('[data-bind]').forEach((el) => {
    const value = values[el.dataset.bind];
    if (typeof value === 'string' && el.textContent !== value) el.textContent = value;
  });
  $$('[data-datetime="start"]').forEach((el) => el.setAttribute('datetime', `${ev.date}T${ev.startTime}${ev.utcOffset}`));
  $$('[data-href="maps"]').forEach((a) => { a.href = mapsUrl(); });
  $$('[data-href="wedding"]').forEach((a) => { a.href = c.wedding.link; });
  $$('[data-contact]').forEach((el) => { el.hidden = !c.contacts.length; });

  const map = $('[data-map]');
  if (map && map.getAttribute('src') !== mapEmbedUrl()) map.setAttribute('src', mapEmbedUrl());

  if (document.body.dataset.page === 'engagement') {
    document.title = `${couple} · Engagement · ${values['date.long']}`;
  }

  renderStory();
  renderWordplay();
  renderHosts();
  renderContacts();
  renderGallery();
}

function renderContacts() {
  const list = $('[data-render="contacts"]');
  if (!list) return;
  list.innerHTML = CONFIG.contacts.map((p) =>
    `<li><a class="venue__tel" href="tel:${esc(p.phone.replace(/[^\d+]/g, ''))}">${esc(p.name)} · ${esc(p.phone)}</a></li>`).join('');
}

function renderStory() {
  const box = $('[data-render="story"]');
  if (!box) return;
  box.innerHTML = CONFIG.story.lines.map((line) => `<p class="story__line" data-reveal>${esc(line)}</p>`).join('');
}

function renderWordplay() {
  const box = $('[data-render="wordplay"]');
  const w = CONFIG.story.wordplay;
  if (!box) return;
  if (!w) { box.remove(); return; }
  const a = [w.first.slice(0, w.firstTake), w.first.slice(w.firstTake)];
  const b = [w.second.slice(0, w.secondTake), w.second.slice(w.secondTake)];
  box.innerHTML = `
    <p class="visually-hidden">Take ${esc(a[0])} from ${esc(w.first)} and ${esc(b[0])} from ${esc(w.second)}, and you get ${esc(w.result)}.</p>
    <p class="prana__eq" aria-hidden="true">
      <span class="prana__word"><b>${esc(a[0])}</b><span class="prana__rest">${esc(a[1])}</span></span>
      <span class="prana__op">+</span>
      <span class="prana__word"><b>${esc(b[0])}</b><span class="prana__rest">${esc(b[1])}</span></span>
      <span class="prana__break"></span>
      <span class="prana__op">=</span>
      <span class="prana__result">${esc(w.result)}</span>
    </p>
    <p class="prana__meaning">${esc(w.meaning)}</p>`;
}

function renderHosts() {
  const list = $('[data-render="hosts"]');
  if (!list) return;
  list.innerHTML = CONFIG.hosts.names.map((name) => `<li>${esc(name)}</li>`).join('');
}

function renderGallery() {
  const track = $('[data-gallery-track]');
  if (!track) return;
  const items = CONFIG.gallery;
  let column = 0;

  track.innerHTML = items.map((g, i) => {
    const classes = ['gallery__item'];
    let delay = 0;
    if (g.wide) {
      classes.push('gallery__item--wide');
      column = 0;
    } else {
      if (column === 1) { classes.push('gallery__item--offset'); delay = 1; }
      column = 1 - column;
    }
    return `<li class="${classes.join(' ')}" data-reveal="clip" style="--d:${delay}">
      <button class="gallery__btn" type="button" data-gallery-index="${i}" aria-label="Open photo ${i + 1} of ${items.length}: ${esc(g.caption)}">
        <span class="gallery__frame"><img class="gallery__img" src="${esc(g.src)}" alt="${esc(g.alt)}" loading="lazy" decoding="async"></span>
      </button>
      <p class="gallery__caption"><span class="gallery__num">${pad(i + 1)}</span>${esc(g.caption)}</p>
    </li>`;
  }).join('');

  /* Landscape photos get a wide frame; missing files are hidden instead of showing a broken image. */
  $$('.gallery__img', track).forEach((img) => {
    const item = img.closest('.gallery__item');
    const onLoad = () => {
      if (img.naturalWidth > img.naturalHeight * 1.15) {
        item.classList.add('gallery__item--wide');
        item.classList.remove('gallery__item--offset');
        img.parentElement.style.setProperty('--ar', `${img.naturalWidth} / ${img.naturalHeight}`);
        refreshScrollSoon();
      }
    };
    const onError = () => {
      item.classList.add('is-missing');
      refreshScrollSoon();
    };
    if (img.complete && img.naturalWidth) onLoad();
    else {
      img.addEventListener('load', onLoad, { once: true });
      img.addEventListener('error', onError, { once: true });
    }
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   6. SMOOTH SCROLL — Lenis synced with ScrollTrigger
   ───────────────────────────────────────────────────────────────────────── */
function initSmoothScroll() {
  if (APP.reduced || typeof window.Lenis !== 'function') return;
  const lenis = new window.Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  APP.lenis = lenis;

  if (hasGSAP()) {
    lenis.on('scroll', window.ScrollTrigger.update);
    window.gsap.ticker.add((time) => lenis.raf(time * 1000));
    window.gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (time) => { lenis.raf(time); window.requestAnimationFrame(raf); };
    window.requestAnimationFrame(raf);
  }
  if (ROOT.classList.contains('is-locked')) lenis.stop();
}

/* ─────────────────────────────────────────────────────────────────────────
   7. INTRO GATE — loader, doors, music start, scroll unlock
   ───────────────────────────────────────────────────────────────────────── */
function initIntro() {
  const gate = $('[data-gate]');
  const gated = $$('[data-gated]');

  if (!gate || !ROOT.classList.contains('js')) {
    revealWithoutGate();
    return;
  }

  if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  lockScroll(true);
  gated.forEach((el) => { el.inert = true; });

  const button = $('[data-gate-open]', gate);
  const status = $('[data-gate-status]', gate);
  const heroImg = $('.hero__img');

  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready.catch(() => null) : Promise.resolve();
  const imageReady = new Promise((resolve) => {
    if (!heroImg || (heroImg.complete && heroImg.naturalWidth)) { resolve(); return; }
    heroImg.addEventListener('load', resolve, { once: true });
    heroImg.addEventListener('error', resolve, { once: true });
  });
  const maxWait = new Promise((resolve) => window.setTimeout(resolve, 3000));

  Promise.race([Promise.all([fontsReady, imageReady]), maxWait]).then(() => {
    gate.classList.add('is-ready');
    button.disabled = false;
    if (status) status.textContent = 'Your invitation is ready';
    button.focus({ preventScroll: true });
  });

  button.addEventListener('click', () => {
    if (gate.classList.contains('is-open')) return;
    if (APP.music) APP.music.start();           // the tap is the gesture that allows audio on iOS/Android
    gate.classList.add('is-open');

    window.setTimeout(() => { if (APP.heroIntro) APP.heroIntro(); }, APP.reduced ? 80 : 700);
    window.setTimeout(() => {
      gate.hidden = true;
      gated.forEach((el) => { el.inert = false; });
      lockScroll(false);
      showFloatingControls();
      const title = $('[data-hero-title]');
      if (title) title.focus({ preventScroll: true });
      refreshScroll();
    }, APP.reduced ? 650 : 1650);
  });
}

function revealWithoutGate() {
  const gate = $('[data-gate]');
  if (gate) gate.hidden = true;
  $$('[data-gated]').forEach((el) => { el.inert = false; });
  lockScroll(false);
  if (APP.heroIntro) APP.heroIntro();
  else ROOT.classList.remove('js');
  showFloatingControls();
}

function showFloatingControls() {
  const music = $('[data-music-toggle]');
  if (music && !music.dataset.broken) {
    music.hidden = false;
    window.requestAnimationFrame(() => music.classList.add('is-visible'));
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   8. HERO — letter split, entrance, parallax
   ───────────────────────────────────────────────────────────────────────── */
function initHero() {
  const hero = $('[data-hero]');
  if (!hero) return;

  let i = 0;
  $$('[data-split]', hero).forEach((el, index) => {
    const text = el.textContent.trim();
    el.textContent = '';
    Array.from(text).forEach((ch) => {
      const span = document.createElement('span');
      span.className = 'hero__letter';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.style.setProperty('--i', i);
      i += 1;
      el.appendChild(span);
    });
    if (index === 0) {
      const amp = $('.hero__amp-inner', hero);
      if (amp) amp.style.setProperty('--i', i);
      i += 2;
    }
  });

  APP.heroIntro = () => hero.classList.add('is-in');

  if (!hasGSAP() || APP.reduced) return;
  const gsap = window.gsap;
  const trigger = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('[data-hero-media]', { yPercent: 16, ease: 'none', scrollTrigger: trigger });
  gsap.to($$('[data-hero-content]', hero), { yPercent: -14, opacity: 0.1, ease: 'none', scrollTrigger: Object.assign({}, trigger) });
}

/* ─────────────────────────────────────────────────────────────────────────
   9. PARTICLES — hero petals (or stars) on canvas
   ───────────────────────────────────────────────────────────────────────── */
const SPRITE = 48;

function makeSprite(kind, color) {
  const c = document.createElement('canvas');
  c.width = SPRITE;
  c.height = SPRITE;
  const g = c.getContext('2d');
  g.translate(SPRITE / 2, SPRITE / 2);
  if (kind === 'star') {
    const glow = g.createRadialGradient(0, 0, 0, 0, 0, 22);
    glow.addColorStop(0, color);
    glow.addColorStop(0.2, hexToRgba(color, 0.55));
    glow.addColorStop(1, hexToRgba(color, 0));
    g.fillStyle = glow;
    g.beginPath(); g.arc(0, 0, 22, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,.95)';
    g.beginPath();
    g.moveTo(0, -18); g.quadraticCurveTo(1.6, -1.6, 18, 0); g.quadraticCurveTo(1.6, 1.6, 0, 18);
    g.quadraticCurveTo(-1.6, 1.6, -18, 0); g.quadraticCurveTo(-1.6, -1.6, 0, -18);
    g.fill();
  } else {
    const fill = g.createLinearGradient(0, -18, 0, 18);
    fill.addColorStop(0, color);
    fill.addColorStop(1, shade(color, -0.22));
    g.fillStyle = fill;
    g.beginPath();
    g.moveTo(0, 19);
    g.bezierCurveTo(-12, 12, -17, -2, -9, -16);
    g.quadraticCurveTo(-4, -20, 0, -13);
    g.quadraticCurveTo(4, -20, 9, -16);
    g.bezierCurveTo(17, -2, 12, 12, 0, 19);
    g.fill();
    g.globalAlpha = 0.3;
    g.strokeStyle = '#fff';
    g.lineWidth = 1;
    g.beginPath(); g.moveTo(0, 15); g.quadraticCurveTo(2.5, 0, 0, -11); g.stroke();
  }
  return c;
}

function hexToRgba(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v + v * amount)));
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

function initPetals() {
  const canvas = $('[data-petals]');
  if (!canvas || APP.reduced) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const area = canvas.parentElement;
  const count = window.matchMedia('(min-width: 768px)').matches ? 24 : 16;
  const petals = [];
  let sprites = [];
  let kind = 'petal';
  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = 0;
  let last = 0;
  let inView = true;

  function setTheme(name) {
    const conf = (THEMES[name] || THEMES.royal).particles;
    kind = conf.kind;
    sprites = conf.colors.map((color) => makeSprite(kind, color));
    petals.forEach((p) => { p.sprite = sprites[Math.floor(Math.random() * sprites.length)]; });
  }

  function resize() {
    const rect = area.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }

  function spawn(p, anywhere) {
    p.x = Math.random() * width;
    p.y = anywhere ? Math.random() * height : -30 - Math.random() * 120;
    p.size = kind === 'star' ? 0.18 + Math.random() * 0.32 : 0.28 + Math.random() * 0.34;
    p.vy = kind === 'star' ? 8 + Math.random() * 14 : 26 + Math.random() * 34;
    p.vx = -10 + Math.random() * 20;
    p.swing = 16 + Math.random() * 34;
    p.swingSpeed = 0.35 + Math.random() * 0.7;
    p.phase = Math.random() * Math.PI * 2;
    p.rot = Math.random() * Math.PI * 2;
    p.vr = (Math.random() - 0.5) * 2.2;
    p.flip = Math.random() * Math.PI * 2;
    p.vflip = 1.2 + Math.random() * 2.2;
    p.alpha = 0.55 + Math.random() * 0.4;
    p.sprite = sprites[Math.floor(Math.random() * sprites.length)];
  }

  function frame(now) {
    rafId = window.requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of petals) {
      p.phase += p.swingSpeed * dt;
      p.rot += p.vr * dt;
      p.flip += p.vflip * dt;
      p.y += p.vy * dt;
      p.x += p.vx * dt;
      if (p.y > height + 40 || p.x < -60 || p.x > width + 60) spawn(p, false);
      const x = p.x + Math.sin(p.phase) * p.swing;
      const sy = p.size * dpr;
      const sx = kind === 'star' ? sy : sy * Math.cos(p.flip);
      const cos = Math.cos(p.rot);
      const sin = Math.sin(p.rot);
      ctx.globalAlpha = kind === 'star' ? p.alpha * (0.45 + 0.55 * Math.abs(Math.sin(p.phase * 2.4))) : p.alpha;
      ctx.setTransform(cos * sx, sin * sx, -sin * sy, cos * sy, x * dpr, p.y * dpr);
      ctx.drawImage(p.sprite, -SPRITE / 2, -SPRITE / 2);
    }
  }

  function start() {
    if (rafId || document.hidden || !inView) return;
    last = performance.now();
    rafId = window.requestAnimationFrame(frame);
  }
  function stop() {
    window.cancelAnimationFrame(rafId);
    rafId = 0;
  }

  setTheme(ROOT.dataset.theme);
  resize();
  for (let i = 0; i < count; i += 1) {
    const p = {};
    spawn(p, true);
    petals.push(p);
  }

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 150);
  });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      if (inView) start(); else stop();
    }).observe(area);
  }

  APP.petals = { setTheme };
  start();
}

/* ─────────────────────────────────────────────────────────────────────────
   10. GALLERY — pinned horizontal rail (desktop) + hover tilt
   ───────────────────────────────────────────────────────────────────────── */
function initGallery() {
  const section = $('#gallery');
  const pin = section && $('[data-gallery-pin]', section);
  const track = section && $('[data-gallery-track]', section);
  if (!track) return;

  /* Rail images sit off-screen sideways, so load them once the section is near. */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      $$('img[loading="lazy"]', track).forEach((img) => { img.loading = 'eager'; });
      io.disconnect();
    }, { rootMargin: '800px 0px' });
    io.observe(section);
  }

  initTilt(track);

  if (!hasGSAP() || APP.reduced) return;
  const gsap = window.gsap;
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    ROOT.classList.add('gallery-pinned');
    const distance = () => Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
    const rail = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
    $$('.gallery__item', track).forEach((item) => {
      gsap.fromTo($('.gallery__img', item), { xPercent: -6 }, {
        xPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: item, containerAnimation: rail, start: 'left right', end: 'right left', scrub: true },
      });
    });
    return () => ROOT.classList.remove('gallery-pinned');
  });
}

function initTilt(track) {
  if (APP.reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  let rect = null;
  let frame = null;
  track.addEventListener('pointerover', (e) => {
    const btn = e.target.closest('.gallery__btn');
    if (!btn) return;
    rect = btn.getBoundingClientRect();
    frame = $('.gallery__frame', btn);
  });
  track.addEventListener('pointermove', (e) => {
    if (!frame || !rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    frame.style.setProperty('--ry', `${(x * 8).toFixed(2)}deg`);
    frame.style.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`);
    frame.style.setProperty('--s', '1.03');
  });
  track.addEventListener('pointerout', (e) => {
    const btn = e.target.closest('.gallery__btn');
    if (!btn || btn.contains(e.relatedTarget)) return;
    const f = $('.gallery__frame', btn);
    f.style.setProperty('--rx', '0deg');
    f.style.setProperty('--ry', '0deg');
    f.style.setProperty('--s', '1');
    frame = null;
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   11. LIGHTBOX — swipe, ESC, arrow keys, focus trap
   ───────────────────────────────────────────────────────────────────────── */
function initLightbox() {
  const box = $('[data-lightbox]');
  const track = $('[data-gallery-track]');
  if (!box || !track) return;

  const img = $('[data-lightbox-img]', box);
  const caption = $('[data-lightbox-caption]', box);
  const counter = $('[data-lightbox-count]', box);
  const closeBtn = $('[data-lightbox-close]', box);
  const items = CONFIG.gallery;
  let index = 0;
  let opener = null;
  let token = 0;

  const available = () => items
    .map((_, i) => i)
    .filter((i) => {
      const btn = $(`[data-gallery-index="${i}"]`, track);
      return btn && !btn.closest('.is-missing');
    });

  function show(i) {
    const list = available();
    if (!list.length) return;
    index = i;
    const item = items[i];
    const mine = ++token;
    img.classList.add('is-switching');
    const pre = new Image();
    pre.src = item.src;
    const decoded = pre.decode ? pre.decode().catch(() => null) : Promise.resolve();
    Promise.all([decoded, new Promise((r) => window.setTimeout(r, 180))]).then(() => {
      if (mine !== token) return;
      img.src = item.src;
      img.alt = item.alt;
      caption.textContent = item.caption;
      counter.textContent = `${list.indexOf(i) + 1} / ${list.length}`;
      window.requestAnimationFrame(() => img.classList.remove('is-switching'));
    });
    [step(1, true), step(-1, true)].forEach((n) => { new Image().src = items[n].src; });
  }

  function step(delta, peek) {
    const list = available();
    const pos = list.indexOf(index);
    const next = list[(pos + delta + list.length) % list.length];
    if (peek) return next;
    show(next);
    return next;
  }

  function open(i) {
    opener = document.activeElement;
    box.hidden = false;
    void box.offsetWidth;
    box.classList.add('is-open');
    lockScroll(true);
    show(i);
    closeBtn.focus({ preventScroll: true });
    document.addEventListener('keydown', onKey);
  }

  function close() {
    box.classList.remove('is-open');
    document.removeEventListener('keydown', onKey);
    lockScroll(false);
    window.setTimeout(() => { if (!box.classList.contains('is-open')) box.hidden = true; }, 350);
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'Tab') {
      const focusables = $$('button', box);
      const first = focusables[0];
      const lastEl = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
    }
  }

  track.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-gallery-index]');
    if (btn) open(Number(btn.dataset.galleryIndex));
  });
  closeBtn.addEventListener('click', close);
  $('[data-lightbox-prev]', box).addEventListener('click', () => step(-1));
  $('[data-lightbox-next]', box).addEventListener('click', () => step(1));
  box.addEventListener('click', (e) => {
    if (e.target === box || e.target.classList.contains('lightbox__figure')) close();
  });

  let startX = null;
  let startY = 0;
  box.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  box.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    startX = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) close();
  }, { passive: true });
}

/* ─────────────────────────────────────────────────────────────────────────
   12. COUNTDOWN — explicit +05:30 offset, rolling digits
   ───────────────────────────────────────────────────────────────────────── */
function initCountdown() {
  const wrap = $('[data-countdown]');
  if (!wrap) return;
  const ev = CONFIG.event;
  const start = eventDate(ev.startTime);
  const dayEnd = new Date(`${ev.date}T23:59:59${ev.utcOffset}`);
  const grid = $('[data-countdown-grid]', wrap);
  const message = $('[data-countdown-message]', wrap);
  const label = $('.countdown__label', wrap);
  const units = {};
  $$('[data-unit]', wrap).forEach((el) => { units[el.dataset.unit] = el; });
  let firstPaint = true;
  let lastMinute = -1;
  let timer = 0;

  showLocalTime(start);

  function tick() {
    const now = Date.now();
    if (now >= start.getTime()) {
      const over = now > dayEnd.getTime();
      grid.hidden = true;
      message.hidden = false;
      message.textContent = over ? 'Thank you for blessing us' : 'The celebration has begun 💛';
      if (label) label.textContent = over ? 'With gratitude' : 'Today is the day';
      wrap.setAttribute('aria-label', message.textContent);
      if (over) window.clearInterval(timer);
      return;
    }
    const total = Math.floor((start.getTime() - now) / 1000);
    const parts = {
      days: Math.floor(total / 86400),
      hours: Math.floor((total % 86400) / 3600),
      minutes: Math.floor((total % 3600) / 60),
      seconds: total % 60,
    };
    Object.keys(parts).forEach((key) => {
      if (units[key]) rollTo(units[key], pad(parts[key]), !firstPaint && !APP.reduced);
    });
    if (parts.minutes !== lastMinute) {
      lastMinute = parts.minutes;
      wrap.setAttribute('aria-label', `${parts.days} days, ${parts.hours} hours and ${parts.minutes} minutes until the ceremony`);
    }
    firstPaint = false;
  }

  tick();
  timer = window.setInterval(tick, 1000);
}

function rollTo(el, value, animate) {
  if (el.dataset.value === value) return;
  el.dataset.value = value;
  const old = $('.countdown__digit:not(.is-out)', el);
  const next = document.createElement('span');
  next.className = 'countdown__digit';
  next.textContent = value;
  if (!old) {
    el.textContent = '';
    el.appendChild(next);
    return;
  }
  if (!animate) {
    old.replaceWith(next);
    return;
  }
  next.classList.add('is-in');
  el.appendChild(next);
  void next.offsetWidth;
  old.classList.add('is-out');
  next.classList.remove('is-in');
  window.setTimeout(() => old.remove(), 650);
}

/* For relatives abroad: show the ceremony time in their own timezone. */
function showLocalTime(start) {
  const el = $('[data-local-time]');
  if (!el) return;
  const [, sign, hh, mm] = CONFIG.event.utcOffset.match(/([+-])(\d{2}):(\d{2})/) || [];
  if (!sign) return;
  const venueOffset = (sign === '-' ? -1 : 1) * (Number(hh) * 60 + Number(mm));
  if (-start.getTimezoneOffset() === venueOffset) return;
  const when = start.toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  let zone = '';
  try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop().replace(/_/g, ' '); } catch (err) { zone = ''; }
  el.textContent = `That is ${when} your time${zone ? ` (${zone})` : ''}`;
  el.hidden = false;
}

/* ─────────────────────────────────────────────────────────────────────────
   13. ADD TO CALENDAR — Google link + generated .ics
   ───────────────────────────────────────────────────────────────────────── */
function calendarEvent() {
  const c = CONFIG;
  const pageUrl = window.location.href.split('#')[0];
  return {
    title: `${c.bride.name} & ${c.groom.name} — Engagement (${c.event.subtitle})`,
    start: eventDate(c.event.startTime),
    end: eventDate(c.event.endTime),
    location: `${c.venue.name}, ${c.venue.address}`,
    details: `${c.event.tagline}. Join us for the engagement ceremony of ${c.bride.name} & ${c.groom.name}.\n\nDirections: ${mapsUrl()}\nInvitation: ${pageUrl}`,
  };
}

const utcStamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

function googleCalendarUrl(ev) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: ev.title,
    dates: `${utcStamp(ev.start)}/${utcStamp(ev.end)}`,
    details: ev.details,
    location: ev.location,
    ctz: 'Asia/Kolkata',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function icsText(ev) {
  const escapeText = (s) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Nandhini and Prabhu//Engagement Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${`engagement-${CONFIG.event.date}-${CONFIG.bride.name}-${CONFIG.groom.name}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-')}@invitation`,
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART:${utcStamp(ev.start)}`,
    `DTEND:${utcStamp(ev.end)}`,
    `SUMMARY:${escapeText(ev.title)}`,
    `DESCRIPTION:${escapeText(ev.details)}`,
    `LOCATION:${escapeText(ev.location)}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(`Tomorrow: ${ev.title}`)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

/* RFC 5545: lines longer than 75 octets are folded. */
function foldLine(line) {
  const encoder = new TextEncoder();
  const out = [];
  let current = '';
  let bytes = 0;
  for (const ch of line) {
    const size = encoder.encode(ch).length;
    const limit = out.length ? 74 : 75;
    if (bytes + size > limit) {
      out.push(current);
      current = '';
      bytes = 0;
    }
    current += ch;
    bytes += size;
  }
  out.push(current);
  return out.join('\r\n ');
}

function downloadIcs(ev) {
  const blob = new Blob([icsText(ev)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${CONFIG.bride.name}-${CONFIG.groom.name}-engagement.ics`.toLowerCase().replace(/[^a-z0-9.-]+/g, '-');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function initCalendar() {
  const wrap = $('[data-cal]');
  if (!wrap) return;
  const toggle = $('[data-cal-toggle]', wrap);
  const menu = $('.cal__menu', wrap);
  const google = $('[data-cal-google]', wrap);
  const ics = $('[data-cal-ics]', wrap);
  const ev = calendarEvent();

  google.href = googleCalendarUrl(ev);

  function open() {
    menu.hidden = false;
    window.requestAnimationFrame(() => menu.classList.add('is-open'));
    toggle.setAttribute('aria-expanded', 'true');
  }
  function close() {
    if (menu.hidden) return;
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    window.setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 260);
  }

  toggle.addEventListener('click', () => (menu.hidden ? open() : close()));
  google.addEventListener('click', close);
  ics.addEventListener('click', () => { downloadIcs(ev); close(); });
  document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) close(); });
  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { close(); toggle.focus(); }
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   14. MUSIC — fade in, remember choice, hide if the file is missing
   ───────────────────────────────────────────────────────────────────────── */
function initMusic() {
  const button = $('[data-music-toggle]');
  if (!button || typeof window.Audio !== 'function') return;

  const audio = new window.Audio();
  audio.loop = true;
  audio.preload = 'none';
  audio.src = CONFIG.music.src;
  let fadeId = 0;
  let resumeOnShow = false;

  function setState(playing) {
    button.classList.toggle('is-playing', playing);
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'Pause background music' : 'Play background music');
  }

  function fade(to, ms, done) {
    window.cancelAnimationFrame(fadeId);
    const from = audio.volume;
    const t0 = performance.now();
    const stepFade = (now) => {
      const k = Math.min(1, (now - t0) / ms);
      try { audio.volume = from + (to - from) * k; } catch (err) { /* iOS: volume is read-only */ }
      if (k < 1) fadeId = window.requestAnimationFrame(stepFade);
      else if (done) done();
    };
    fadeId = window.requestAnimationFrame(stepFade);
  }

  function play() {
    try { audio.volume = 0; } catch (err) { /* iOS */ }
    const attempt = audio.play();
    setState(true);
    if (attempt && attempt.then) {
      attempt.then(() => fade(CONFIG.music.volume, CONFIG.music.fadeMs)).catch(() => setState(false));
    } else {
      fade(CONFIG.music.volume, CONFIG.music.fadeMs);
    }
  }

  function pause() {
    setState(false);
    fade(0, 400, () => audio.pause());
  }

  audio.addEventListener('error', () => {
    button.dataset.broken = 'true';
    button.hidden = true;
    setState(false);
  });

  button.addEventListener('click', () => {
    if (button.classList.contains('is-playing')) {
      pause();
      storageSet('sessionStorage', STORE_MUSIC, 'off');
    } else {
      play();
      storageSet('sessionStorage', STORE_MUSIC, 'on');
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !audio.paused) {
      resumeOnShow = true;
      audio.pause();
    } else if (!document.hidden && resumeOnShow) {
      resumeOnShow = false;
      const attempt = audio.play();
      if (attempt && attempt.catch) attempt.catch(() => setState(false));
    }
  });

  APP.music = {
    start() {
      if (storageGet('sessionStorage', STORE_MUSIC) !== 'off') play();
    },
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   15. SCROLL REVEALS, PROGRESS BAR, ANCHORS
   ───────────────────────────────────────────────────────────────────────── */
function initReveals() {
  if (!ROOT.classList.contains('can-reveal')) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  $$('[data-reveal]').forEach((el) => io.observe(el));
}

function initProgress() {
  const bar = $('[data-progress]');
  if (!bar) return;
  let queued = false;
  const update = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    bar.style.transform = `scaleX(${progress.toFixed(4)})`;
  };
  window.addEventListener('scroll', () => {
    if (!queued) { queued = true; window.requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

function initAnchors() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href');
    const target = id.length > 1 ? document.getElementById(id.slice(1)) : null;
    if (!target) return;
    e.preventDefault();
    if (APP.lenis) APP.lenis.scrollTo(id === '#top' ? 0 : target, { duration: 1.6 });
    else target.scrollIntoView({ behavior: APP.reduced ? 'auto' : 'smooth' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   16. BLESSINGS — one-time gold sparkle & petal burst
   ───────────────────────────────────────────────────────────────────────── */
function initBlessings() {
  const section = $('#blessings');
  const canvas = section && $('[data-burst]', section);
  if (!canvas || APP.reduced || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    burst(canvas);
  }, { threshold: 0.3 });
  io.observe(section);
}

function burst(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);

  const theme = THEMES[ROOT.dataset.theme] || THEMES.royal;
  const stars = ['#F3D27A', '#FFF1C1', '#D9B648'].map((col) => makeSprite('star', col));
  const petals = theme.particles.colors.slice(0, 3).map((col) => makeSprite('petal', col));
  const cx = rect.width / 2;
  const cy = Math.min(rect.height * 0.3, 280);
  const parts = [];
  const total = rect.width < 600 ? 56 : 84;

  for (let i = 0; i < total; i += 1) {
    const isPetal = i % 3 === 0;
    const angle = Math.random() * Math.PI * 2;
    const speed = 110 + Math.random() * (rect.width < 600 ? 260 : 420);
    parts.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 140,
      life: 0,
      ttl: 1.8 + Math.random() * 1.6,
      size: isPetal ? 0.32 + Math.random() * 0.3 : 0.25 + Math.random() * 0.5,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 6,
      gravity: isPetal ? 170 : 90,
      sprite: isPetal ? petals[i % petals.length] : stars[i % stars.length],
    });
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;
    for (const p of parts) {
      p.life += dt;
      if (p.life >= p.ttl) continue;
      alive += 1;
      p.vx *= 0.986;
      p.vy = p.vy * 0.986 + p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      const k = 1 - p.life / p.ttl;
      const s = p.size * dpr;
      ctx.globalAlpha = Math.min(1, k * 1.8);
      ctx.setTransform(Math.cos(p.rot) * s, Math.sin(p.rot) * s, -Math.sin(p.rot) * s, Math.cos(p.rot) * s, p.x * dpr, p.y * dpr);
      ctx.drawImage(p.sprite, -SPRITE / 2, -SPRITE / 2);
    }
    if (alive) window.requestAnimationFrame(frame);
    else {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  window.requestAnimationFrame(frame);
}

/* ─────────────────────────────────────────────────────────────────────────
   17. CUSTOM CURSOR — desktop pointers only
   ───────────────────────────────────────────────────────────────────────── */
function initCursor() {
  if (APP.reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  dot.setAttribute('aria-hidden', 'true');
  ring.setAttribute('aria-hidden', 'true');
  document.body.append(dot, ring);

  let mx = -100;
  let my = -100;
  let rx = mx;
  let ry = my;
  let scale = 1;
  let target = 1;
  let rafId = 0;
  let started = false;

  function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    scale += (target - scale) * 0.2;
    ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
    const settled = Math.abs(mx - rx) < 0.1 && Math.abs(my - ry) < 0.1 && Math.abs(target - scale) < 0.01;
    rafId = settled ? 0 : window.requestAnimationFrame(loop);
  }

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    if (!started) {
      started = true;
      rx = mx;
      ry = my;
      ROOT.classList.add('has-cursor');
    }
    ROOT.classList.remove('cursor-hidden');
    if (!rafId) rafId = window.requestAnimationFrame(loop);
  }, { passive: true });

  document.addEventListener('pointerover', (e) => {
    target = e.target.closest('a, button, [data-gallery-index]') ? 1.7 : 1;
    if (!rafId) rafId = window.requestAnimationFrame(loop);
  });
  document.addEventListener('pointerout', (e) => {
    if (!e.relatedTarget) ROOT.classList.add('cursor-hidden');
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   18. THEME SWITCHER — preview the 4 colour themes live
   ───────────────────────────────────────────────────────────────────────── */
function initThemeSwitcher() {
  const box = $('[data-theme-switcher]');
  if (!box) return;
  if (!CONFIG.showThemeSwitcher) {
    box.remove();
    return;
  }

  box.innerHTML = '<span class="themes__label" aria-hidden="true">Theme</span>'
    + Object.keys(THEMES).map((key) => {
      const t = THEMES[key];
      return `<button class="themes__swatch" type="button" data-theme-option="${key}" aria-pressed="false" aria-label="${esc(t.label)} theme" title="${esc(t.label)}" style="--sw-a:${t.swatch[0]};--sw-b:${t.swatch[1]};--sw-c:${t.swatch[2]}"></button>`;
    }).join('')
    + '<span class="themes__toast" role="status" aria-live="polite"></span>';
  box.hidden = false;

  const toast = $('.themes__toast', box);
  let toastTimer = 0;
  const sync = () => $$('[data-theme-option]', box).forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.themeOption === ROOT.dataset.theme));
  });

  box.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-theme-option]');
    if (!btn) return;
    applyTheme(btn.dataset.themeOption);
    sync();
    toast.textContent = THEMES[btn.dataset.themeOption].label;
    toast.classList.add('is-shown');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-shown'), 1800);
  });
  sync();
}

function applyTheme(name) {
  if (!THEMES[name] || ROOT.dataset.theme === name) return;
  storageSet('localStorage', STORE_THEME, name);
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('theme', name);
    window.history.replaceState(null, '', url);   // copy the URL to share this exact theme
  } catch (err) { /* very old browser */ }
  const swap = () => {
    setThemeAttr(name);
    if (APP.petals) APP.petals.setTheme(name);
  };
  if (document.startViewTransition && !APP.reduced) document.startViewTransition(swap);
  else swap();
}
