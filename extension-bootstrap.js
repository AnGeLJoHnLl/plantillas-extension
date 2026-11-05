/* ════════════════════════════════════════════════════════════════
   HITSS Tickets — Extension Bootstrap (Manifest V3 Compatible)
   Cero dependencias remotas, cero eval, integración con Laraigo
   ════════════════════════════════════════════════════════════════ */

const THEME_PALETTES = {
  'pink':         { c1: '#e11d48', c2: '#be123c', c3: '#f43f5e' },
  'pink-dark':    { c1: '#ec4899', c2: '#db2777', c3: '#f472b6' },
  'purple-light': { c1: '#7c3aed', c2: '#6d28d9', c3: '#9333ea' },
  'purple-dark':  { c1: '#8b5cf6', c2: '#7c3aed', c3: '#a78bfa' },
  'red-light':    { c1: '#dc2626', c2: '#b91c1c', c3: '#f43f5e' },
  'red-dark':     { c1: '#f43f5e', c2: '#e11d48', c3: '#fb7185' },
  'cyan-light':   { c1: '#0284c7', c2: '#0369a1', c3: '#06b6d4' },
  'cyan-dark':    { c1: '#06b6d4', c2: '#0891b2', c3: '#22d3ee' },
  'purple':       { c1: '#4f46e5', c2: '#7c3aed', c3: '#06b6d4' },
  'halloween':    { c1: '#f97316', c2: '#7e22ce', c3: '#22c55e' },
  'christmas':    { c1: '#dc2626', c2: '#16a34a', c3: '#fbbf24' }
};

function updateFaviconTheme(themeName) {
  const pal = THEME_PALETTES[themeName] || THEME_PALETTES['purple'];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><defs><linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${pal.c1}"/><stop offset="100%" stop-color="${pal.c2}"/></linearGradient></defs><rect x="3" y="3" width="58" height="58" rx="16" fill="url(#bgGrad)"/><rect x="4.5" y="4.5" width="55" height="55" rx="14.5" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/><path d="M19 14 C19 12.895 19.895 12 21 12 H43 C44.105 12 45 12.895 45 14 V26 C42.791 26 41 27.791 41 30 C41 32.209 42.791 34 45 34 V50 C45 51.105 44.105 52 43 52 H21 C19.895 52 19 51.105 19 50 V34 C21.209 34 23 32.209 23 30 C23 27.791 21.209 26 19 26 Z" fill="#ffffff"/><path d="M21 12 H43 C44.105 12 45 12.895 45 14 V19 H19 V14 C19 12.895 19.895 12 21 12 Z" fill="rgba(0,0,0,0.15)"/><path d="M34 16 L25 29 H32 L29 44 L40 28 H33 Z" fill="${pal.c1}"/><circle cx="25" cy="47" r="1.8" fill="${pal.c1}"/><circle cx="32" cy="47" r="1.8" fill="${pal.c2}"/><circle cx="39" cy="47" r="1.8" fill="${pal.c3}"/></svg>`;
  const fav = document.getElementById('appFavicon');
  if (fav) {
    fav.href = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }
}

function updateLockScreenTheme(themeName) {
  const img = document.getElementById('authGengarGif');
  if (!img) return;
  const theme = (themeName || document.documentElement.getAttribute('data-theme') || 'purple').toLowerCase();
  if (theme.startsWith('pink')) {
    img.src = 'chansey-lock.gif';
    img.alt = 'Chansey';
  } else if (theme.startsWith('purple')) {
    img.src = 'gengar-lock.gif';
    img.alt = 'Gengar';
  } else if (theme.startsWith('red') || theme === 'christmas') {
    img.src = 'blaziken.png';
    img.alt = 'Blaziken';
  } else if (theme.startsWith('cyan')) {
    img.src = 'squirtle.png';
    img.alt = 'Squirtle';
  } else {
    img.src = 'gengar-lock.gif';
    img.alt = 'Gengar';
  }
}

// Inicialización de tema guardado
(function() {
  const savedTheme = localStorage.getItem('hitss_theme') || 'purple';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateFaviconTheme(savedTheme);
})();

let _hwScreamAudio = null;
function playHalloweenScream() {
  try {
    if (!_hwScreamAudio) {
      _hwScreamAudio = new Audio('halloween-scream.wav');
      _hwScreamAudio.volume = 0.85;
    }
    _hwScreamAudio.currentTime = 0;
    const p = _hwScreamAudio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => playSynthScreamFallback());
    }
  } catch (err) {
    playSynthScreamFallback();
  }
}

function playSynthScreamFallback() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.01, now);
    master.gain.linearRampToValueAtTime(0.45, now + 0.06);
    master.gain.exponentialRampToValueAtTime(0.28, now + 0.55);
    master.gain.exponentialRampToValueAtTime(0.001, now + 1.35);
    master.connect(ctx.destination);

    [1, 1.49, 2.02].forEach((mult, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = idx === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(780 * mult, now);
      osc.frequency.exponentialRampToValueAtTime(1180 * mult, now + 0.14);
      osc.frequency.exponentialRampToValueAtTime(920 * mult, now + 0.55);
      osc.frequency.exponentialRampToValueAtTime(420 * mult, now + 1.3);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 22;
      lfoGain.gain.value = 35 * mult;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + 1.35);

      g.gain.value = idx === 0 ? 0.5 : 0.25;
      osc.connect(g);
      g.connect(master);
      osc.start(now);
      osc.stop(now + 1.35);
    });
  } catch (e) {}
}

let _xmasAudio = null;
function playChristmasJingle() {
  try {
    if (!_xmasAudio) {
      _xmasAudio = new Audio('christmas-chime.wav');
      _xmasAudio.volume = 0.85;
    }
    _xmasAudio.currentTime = 0;
    const p = _xmasAudio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => playSynthChristmasBellsFallback());
    }
  } catch (err) {
    playSynthChristmasBellsFallback();
  }
}

function playSynthChristmasBellsFallback() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [
      { f: 659.25, d: 0.18, p: 0.05 },
      { f: 659.25, d: 0.18, p: 0.05 },
      { f: 659.25, d: 0.36, p: 0.10 },
      { f: 659.25, d: 0.18, p: 0.05 },
      { f: 659.25, d: 0.18, p: 0.05 },
      { f: 659.25, d: 0.36, p: 0.10 },
      { f: 659.25, d: 0.18, p: 0.04 },
      { f: 783.99, d: 0.18, p: 0.04 },
      { f: 523.25, d: 0.18, p: 0.04 },
      { f: 587.33, d: 0.18, p: 0.04 },
      { f: 659.25, d: 0.60, p: 0.20 },
    ];
    let curTime = ctx.currentTime + 0.02;
    notes.forEach(n => {
      [1, 2.76, 5.4].forEach((harm, hIdx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f * harm, curTime);
        const amp = (hIdx === 0 ? 0.32 : (hIdx === 1 ? 0.16 : 0.07));
        gain.gain.setValueAtTime(amp, curTime);
        gain.gain.exponentialRampToValueAtTime(0.001, curTime + n.d + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(curTime);
        osc.stop(curTime + n.d + 0.5);
      });
      curTime += n.d + n.p;
    });
  } catch (e) {}
}

function setAppTheme(themeName) {
  const current = document.documentElement.getAttribute('data-theme');
  if (current && current !== 'halloween' && current !== 'christmas') {
    localStorage.setItem('hitss_prev_theme', current);
  }
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('hitss_theme', themeName);
  updateFaviconTheme(themeName);
  updateLockScreenTheme(themeName);
  if (typeof updateThemeMenuUI === 'function') {
    updateThemeMenuUI(themeName);
  }
  const btnHw = document.getElementById('btnQuickHalloween');
  if (btnHw) {
    btnHw.classList.toggle('is-active-hw', themeName === 'halloween');
  }
  const btnXmas = document.getElementById('btnQuickXmas');
  if (btnXmas) {
    btnXmas.classList.toggle('is-active-xmas', themeName === 'christmas');
  }
  if (themeName === 'halloween' && current !== 'halloween') {
    playHalloweenScream();
    triggerHalloweenLightning();
    setTimeout(() => {
      if (typeof gengarSpookyJump === 'function') gengarSpookyJump();
    }, 120);
  }
  if (themeName === 'christmas' && current !== 'christmas') {
    playChristmasJingle();
    triggerChristmasSnowBurst();
    setTimeout(() => {
      if (typeof blazikenActionJump === 'function') blazikenActionJump();
    }, 120);
  }
  const menu = document.getElementById('themeDropdownMenu');
  if (menu) menu.classList.add('hidden');
}

function triggerHalloweenLightning() {
  const flash = document.getElementById('hwLightningFlash');
  if (!flash) return;
  flash.classList.remove('is-flashing');
  void flash.offsetWidth;
  flash.classList.add('is-flashing');
  setTimeout(() => flash.classList.remove('is-flashing'), 1100);
}

function triggerChristmasSnowBurst() {
  const stage = document.getElementById('christmasStage');
  if (!stage) return;
  const icons = ['❄️', '⭐', '🎄', '🎁', '🔔', '✨', '❅'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('span');
    p.className = 'xmas-burst-spark';
    p.textContent = icons[Math.floor(Math.random() * icons.length)];
    p.style.left = (Math.random() * 95) + 'vw';
    p.style.top = (10 + Math.random() * 40) + 'vh';
    p.style.setProperty('--tx', `${(Math.random() - 0.5) * 120}px`);
    p.style.setProperty('--ty', `${(Math.random() - 0.5) * 100}px`);
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1200);
  }
}

function onSantaPixelClick(e) {
  if (e) e.stopPropagation();
  playChristmasJingle();
  triggerChristmasSnowBurst();
  const flyer = document.getElementById('xmasSleighFlyer');
  if (flyer) {
    flyer.classList.add('santa-boosted');
    setTimeout(() => flyer.classList.remove('santa-boosted'), 1200);
  }
  if (typeof blazikenActionJump === 'function') blazikenActionJump();
}

// Rastro mágico del cursor en Modo Halloween y Modo Navideño
(function initHolidayInteractiveFX() {
  let lastTrailTime = 0;
  const hwIcons = ['✨', '🎃', '🦇', '👻', '🕸️', '🍬', '🍂'];
  const xmasIcons = ['❄️', '✨', '⭐', '🎄', '🎁', '🔔', '⛄', '❅'];
  document.addEventListener('mousemove', function(e) {
    const theme = document.documentElement.getAttribute('data-theme');
    if (theme !== 'halloween' && theme !== 'christmas') return;
    const now = performance.now();
    if (now - lastTrailTime < 95) return;
    lastTrailTime = now;

    const isXmas = theme === 'christmas';
    const icons = isXmas ? xmasIcons : hwIcons;
    const spark = document.createElement('span');
    spark.className = isXmas ? 'xmas-cursor-spark' : 'hw-cursor-spark';
    spark.textContent = icons[Math.floor(Math.random() * icons.length)];
    spark.style.left = (e.clientX + (Math.random() - 0.5) * 14) + 'px';
    spark.style.top = (e.clientY + (Math.random() - 0.5) * 14) + 'px';
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 750);
  }, { passive: true });
})();

function toggleHalloweenMode() {
  const current = document.documentElement.getAttribute('data-theme') || 'purple';
  if (current === 'halloween') {
    const prev = localStorage.getItem('hitss_prev_theme') || 'purple';
    setAppTheme(prev === 'halloween' ? 'purple' : prev);
  } else {
    setAppTheme('halloween');
  }
}

function toggleChristmasMode() {
  const current = document.documentElement.getAttribute('data-theme') || 'purple';
  if (current === 'christmas') {
    const prev = localStorage.getItem('hitss_prev_theme') || 'purple';
    setAppTheme(prev === 'christmas' ? 'purple' : prev);
  } else {
    setAppTheme('christmas');
  }
}

function mascotHappyJump() {
  const mascot = document.getElementById('pinkMascot');
  if (!mascot) return;
  mascot.classList.add('is-happy');
  setTimeout(() => mascot.classList.remove('is-happy'), 700);

  const bubble = document.getElementById('mascotBubble');
  if (bubble) {
    const msgs = ['¡Feliz día! 💕', '¡Tú puedes! ✨', '¡Ánimo! 🌸', '¡Chan-sey! 💖', '¡A darle con todo! ⭐'];
    bubble.textContent = msgs[Math.floor(Math.random() * msgs.length)];
    bubble.style.opacity = '1';
    bubble.style.transform = 'translateX(-50%) translateY(0) scale(1)';
    setTimeout(() => {
      bubble.style.opacity = '';
      bubble.style.transform = '';
    }, 1800);
  }

  const rect = mascot.getBoundingClientRect();
  for (let i = 0; i < 4; i++) {
    const heart = document.createElement('div');
    heart.className = 'mascot-heart-particle';
    heart.textContent = ['💖', '✨', '🌸', '💕'][Math.floor(Math.random() * 4)];
    const tx = (Math.random() - 0.5) * 60;
    heart.style.setProperty('--tx', `${tx}px`);
    heart.style.left = `${rect.left + rect.width / 2 - 10 + (i - 1.5) * 12}px`;
    heart.style.top = `${rect.top}px`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 950);
  }
}

function blazikenActionJump() {
  const mascot = document.getElementById('redMascot');
  if (!mascot) return;
  mascot.classList.add('is-action');
  setTimeout(() => mascot.classList.remove('is-action'), 700);

  const isXmas = document.documentElement.getAttribute('data-theme') === 'christmas';
  const bubble = document.getElementById('redMascotBubble');
  if (bubble) {
    const msgs = isXmas
      ? ['¡Jo, jo, jo! ¡Feliz Navidad! 🎄', '¡Fuego navideño y muchas bendiciones! 🎁', '¡Noche de paz y full plantillas! ⭐', '¡A festejar con todo! 🔔', '¡Felices Fiestas! ❄️']
      : ['¡A toda máquina! 🔥', '¡Fuego en el turno! ⚡', '¡Con todo el power! 💥', '¡Imparable! 🥊', '¡Blaziken! ⚔️'];
    bubble.textContent = msgs[Math.floor(Math.random() * msgs.length)];
    bubble.style.opacity = '1';
    bubble.style.transform = 'translateX(-50%) translateY(0) scale(1)';
    setTimeout(() => {
      bubble.style.opacity = '';
      bubble.style.transform = '';
    }, 1800);
  }

  const rect = mascot.getBoundingClientRect();
  const icons = isXmas ? ['🎁', '🎄', '⭐', '❄️', '🔔', '✨'] : ['🔥', '⚡', '💥', '✨'];
  for (let i = 0; i < 4; i++) {
    const flame = document.createElement('div');
    flame.className = 'mascot-flame-particle';
    flame.textContent = icons[Math.floor(Math.random() * icons.length)];
    const tx = (Math.random() - 0.5) * 60;
    flame.style.setProperty('--tx', `${tx}px`);
    flame.style.left = `${rect.left + rect.width / 2 - 10 + (i - 1.5) * 12}px`;
    flame.style.top = `${rect.top}px`;
    document.body.appendChild(flame);
    setTimeout(() => flame.remove(), 950);
  }
}

function gengarSpookyJump() {
  const mascot = document.getElementById('purpleMascot');
  if (!mascot) return;
  mascot.classList.add('is-spooky');
  setTimeout(() => mascot.classList.remove('is-spooky'), 700);

  const isHw = document.documentElement.getAttribute('data-theme') === 'halloween';
  const bubble = document.getElementById('purpleMascotBubble');
  if (bubble) {
    const msgs = isHw
      ? ['¡Dulce o truco! 🎃', '¡Feliz Halloween! 👻', '¡Noche de brujas! 🦇', '¡Ge-ge-ge! 🍬', '¡Buh! ¿Te asusté? 🕸️']
      : ['¡Ge-ge-ge! 👻', '¡Sombra lista! 😈', '¡Modo fantasma! 💜', '¡Nadie nos para! 🔮', '¡Gen-gar! ✨'];
    bubble.textContent = msgs[Math.floor(Math.random() * msgs.length)];
    bubble.style.opacity = '1';
    bubble.style.transform = 'translateX(-50%) translateY(0) scale(1)';
    setTimeout(() => {
      bubble.style.opacity = '';
      bubble.style.transform = '';
    }, 1800);
  }

  const rect = mascot.getBoundingClientRect();
  const icons = isHw ? ['🎃', '🦇', '👻', '🍬', '🕸️', '🕷️'] : ['👻', '😈', '💜', '🔮', '✨'];
  const count = isHw ? 6 : 4;
  for (let i = 0; i < count; i++) {
    const ghost = document.createElement('div');
    ghost.className = 'mascot-ghost-particle';
    ghost.textContent = icons[Math.floor(Math.random() * icons.length)];
    const tx = (Math.random() - 0.5) * 85;
    ghost.style.setProperty('--tx', `${tx}px`);
    ghost.style.left = `${rect.left + rect.width / 2 - 10 + (i - count / 2) * 12}px`;
    ghost.style.top = `${rect.top}px`;
    document.body.appendChild(ghost);
    setTimeout(() => ghost.remove(), 950);
  }
}

function squirtleCoolJump() {
  const mascot = document.getElementById('cyanMascot');
  if (!mascot) return;
  mascot.classList.add('is-cool');
  setTimeout(() => mascot.classList.remove('is-cool'), 700);

  const bubble = document.getElementById('cyanMascotBubble');
  if (bubble) {
    const msgs = ['¡Vamo a calmarno! 😎', '¡Squirtle Squad! 🕶️', '¡Todo bajo control! 🌊', '¡Tranqui, yo me encargo! 💧', '¡Squir-tle! 🫧'];
    bubble.textContent = msgs[Math.floor(Math.random() * msgs.length)];
    bubble.style.opacity = '1';
    bubble.style.transform = 'translateX(-50%) translateY(0) scale(1)';
    setTimeout(() => {
      bubble.style.opacity = '';
      bubble.style.transform = '';
    }, 1800);
  }

  const rect = mascot.getBoundingClientRect();
  for (let i = 0; i < 4; i++) {
    const drop = document.createElement('div');
    drop.className = 'mascot-water-particle';
    drop.textContent = ['🌊', '🕶️', '💧', '🫧', '✨'][Math.floor(Math.random() * 5)];
    const tx = (Math.random() - 0.5) * 60;
    drop.style.setProperty('--tx', `${tx}px`);
    drop.style.left = `${rect.left + rect.width / 2 - 10 + (i - 1.5) * 12}px`;
    drop.style.top = `${rect.top}px`;
    document.body.appendChild(drop);
    setTimeout(() => drop.remove(), 950);
  }
}

// ════════════════════════════════════════════════════════════════
//  DESPACHADOR ULTRA-SEGURO DE EVENTOS (CERO EVAL / MANIFEST V3)
// ════════════════════════════════════════════════════════════════
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-onclick]');
  if (!el) return;

  const expr = (el.getAttribute('data-onclick') || '').trim();
  if (!expr) return;

  // 1. Selector especial: document.getElementById('fileInputOCR').click()
  if (expr.includes("document.getElementById('fileInputOCR').click()")) {
    const target = document.getElementById('fileInputOCR');
    if (target) target.click();
    return;
  }

  // 2. Llamada rápida: quickCopy(this, 'url')
  const qm = expr.match(/^quickCopy\s*\(\s*this\s*,\s*['"]([^'"]+)['"]\s*\)$/);
  if (qm) {
    if (typeof window.quickCopy === 'function') {
      window.quickCopy(el, qm[1]);
    }
    return;
  }

  // 3. Llamada a función general: fn(arg1, arg2...)
  const fnMatch = expr.match(/^([a-zA-Z0-9_$]+)\s*\((.*)\)\s*;?$/);
  if (fnMatch) {
    const fnName = fnMatch[1];
    const rawArgs = fnMatch[2].trim();
    if (typeof window[fnName] === 'function') {
      if (!rawArgs) {
        window[fnName]();
      } else {
        const args = rawArgs.split(',').map(a => {
          a = a.trim();
          if ((a.startsWith("'") && a.endsWith("'")) || (a.startsWith('"') && a.endsWith('"'))) {
            return a.slice(1, -1);
          }
          if (a === 'this') return el;
          if (a === 'event' || a === 'e') return e;
          if (!isNaN(Number(a))) return Number(a);
          return a;
        });
        window[fnName](...args);
      }
    }
  }
});

const isLaraigoDock = (window.self !== window.top) || window.location.search.includes('laraigo_dock');

function insertTemplateIntoLaraigoChat(text) {
  if (!text) {
    const txtEl = document.getElementById('txtPlantilla');
    if (txtEl) text = txtEl.value;
  }
  if (!text) return;

  // Enviar a la pestaña padre de Laraigo
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({
      type: 'HITSS_INSERT_CHAT',
      text: text
    }, '*');
  }

  // También copiar al portapapeles nativo
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}

// Enlazar eventos de formulario y modal de asesor (100% CSP compliant)
function setupFormEventListeners() {
  // 1. Modal Perfil Asesor
  const userProfileForm = document.getElementById('userProfileForm');
  if (userProfileForm) {
    userProfileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (typeof window.saveUserProfile === 'function') {
        window.saveUserProfile(e);
      }
    });
  }

  const btnSaveProfile = document.getElementById('btnSaveProfile');
  if (btnSaveProfile) {
    btnSaveProfile.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof window.saveUserProfile === 'function') {
        window.saveUserProfile(e);
      }
    });
  }

  const profNombre = document.getElementById('profNombre');
  const profUserE = document.getElementById('profUserE');
  if (profNombre) {
    profNombre.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (profUserE) profUserE.focus();
      }
    });
  }
  if (profUserE) {
    profUserE.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (typeof window.saveUserProfile === 'function') {
          window.saveUserProfile(e);
        }
      }
    });
  }

  // 2. SOT Numero
  const secNum = document.getElementById('seccionNumero');
  if (secNum) {
    secNum.addEventListener('input', (e) => {
      if (typeof window.actualizarNumero === 'function') {
        window.actualizarNumero(e.target.value);
      }
    });
    secNum.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (typeof window.actualizarNumero === 'function') window.actualizarNumero(e.target.value);
        if (typeof window.guardarFormActual === 'function') window.guardarFormActual();
        if (typeof window.generarPlantilla === 'function') window.generarPlantilla();
        e.target.blur();
      }
    });
  }

  // 3. Ticket Form
  const ticketForm = document.getElementById('ticketForm');
  if (ticketForm) {
    ticketForm.addEventListener('submit', (e) => e.preventDefault());
  }

  // 4. Selects de Gestión, Equipos y Estados
  const tipoGestion = document.getElementById('tipoGestion');
  if (tipoGestion) {
    tipoGestion.addEventListener('change', () => {
      if (typeof window.onTipoChange === 'function') window.onTipoChange();
    });
  }

  const modeloEquipo = document.getElementById('modeloEquipo');
  if (modeloEquipo) {
    modeloEquipo.addEventListener('change', () => {
      if (typeof window.onModeloChange === 'function') window.onModeloChange();
    });
  }

  const modeloRepetidor = document.getElementById('modeloRepetidor');
  if (modeloRepetidor) {
    modeloRepetidor.addEventListener('change', () => {
      if (typeof window.onModeloRepetidorChange === 'function') window.onModeloRepetidorChange();
    });
  }

  const estado = document.getElementById('estado');
  if (estado) {
    estado.addEventListener('change', () => {
      if (typeof window.onEstadoChange === 'function') window.onEstadoChange();
    });
  }

  // 5. Code E-User
  const codeEUser = document.getElementById('codeEUser');
  if (codeEUser) {
    codeEUser.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase();
      if (typeof window.guardarCodeEUser === 'function') window.guardarCodeEUser();
    });
  }

  // 6. MAC input
  const macInput = document.getElementById('macInput');
  if (macInput) {
    macInput.addEventListener('input', () => {
      if (typeof window.convertirMAC === 'function') window.convertirMAC();
    });
  }

  // 7. RX FTTH
  const rxValue = document.getElementById('rxValue');
  if (rxValue) {
    rxValue.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        if (typeof window.verificarNivelFTTH === 'function') window.verificarNivelFTTH();
      }
    });
  }
}

// Inicialización de UI al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  updateLockScreenTheme();

  // Si estamos dentro de Laraigo, adaptar diseño para que sea ultra-cómodo
  if (isLaraigoDock) {
    document.body.classList.add('is-laraigo-embedded');
  } else if (window.self === window.top && !window.location.search.includes('fullscreen')) {
    document.body.classList.add('is-extension-popup');
  }

  // Añadir botón "Pegar en Laraigo" en la sección de plantilla generada
  const btnCopy = document.getElementById('btnCopy');
  if (btnCopy && btnCopy.parentElement) {
    const btnInsertChat = document.createElement('button');
    btnInsertChat.type = 'button';
    btnInsertChat.id = 'btnInsertLaraigoChat';
    btnInsertChat.className = 'btn-copy btn-insert-laraigo';
    btnInsertChat.innerHTML = '⚡ Pegar en Laraigo';
    btnInsertChat.title = 'Pega la plantilla directamente en el chat abierto de Laraigo';
    btnInsertChat.disabled = btnCopy.disabled;
    btnInsertChat.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    btnInsertChat.style.color = '#ffffff';
    btnInsertChat.style.fontWeight = '700';

    btnInsertChat.addEventListener('click', () => {
      const txt = document.getElementById('txtPlantilla');
      if (txt && txt.value) {
        insertTemplateIntoLaraigoChat(txt.value);
      }
    });

    // Insertar antes del botón copiar
    btnCopy.parentElement.insertBefore(btnInsertChat, btnCopy);

    // Sincronizar estado disabled con btnCopy
    const observer = new MutationObserver(() => {
      btnInsertChat.disabled = btnCopy.disabled;
    });
    observer.observe(btnCopy, { attributes: true, attributeFilter: ['disabled'] });
  }

  // Enlazar eventos de formulario y modal de asesor
  setupFormEventListeners();
});
