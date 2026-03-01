/* ============================================================
   ORIDRA — MAIN JAVASCRIPT
   Modules: Loader · Cursor · Navigation · Theme · Reveal
            Stats Counter · Like/Comment · Form · Toast
============================================================ */

/* ---- UTILITY ---- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   MODULE: LOADER
============================================================ */
(function initLoader() {
  const loader = $('#loader');
  const fill   = $('#loaderFill');
  if (!loader) return;

  setTimeout(() => { fill.style.width = '100%'; }, 100);

  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
    triggerReveal();
  }, 2000);

  document.body.style.overflow = 'hidden';
})();

/* ============================================================
   MODULE: CUSTOM CURSOR
============================================================ */
(function initCursor() {
  const cursor   = $('#cursor');
  const follower = $('#cursorFollower');
  if (!cursor || !follower) return;

  let fx = 0, fy = 0;
  let mx = 0, my = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  function animateFollower() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  document.querySelectorAll('a, button, .project-card, .skill-tag').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '16px';
      cursor.style.height = '16px';
      follower.style.width = '56px';
      follower.style.height = '56px';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width = '10px';
      cursor.style.height = '10px';
      follower.style.width = '36px';
      follower.style.height = '36px';
    });
  });
})();

/* ============================================================
   MODULE: NAVIGATION
============================================================ */
(function initNav() {
  const nav         = $('#nav');
  const menuBtn     = $('#menuBtn');
  const mobileMenu  = $('#mobileMenu');
  const mobileClose = $('#mobileClose');
  const mobileLinks = $$('.mobile-link');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  if (menuBtn) menuBtn.addEventListener('click', () => {
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  function closeMenu() {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (mobileClose) mobileClose.addEventListener('click', closeMenu);
  mobileLinks.forEach(l => l.addEventListener('click', closeMenu));

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();

/* ============================================================
   MODULE: MINDBLOWING THEME TOGGLE
   Works for BOTH index.html (id=themeToggle) and about.html (id=themeBtn)
============================================================ */
(function initTheme() {
  /* Support both button IDs */
  const btn  = document.getElementById('themeToggle') || document.getElementById('themeBtn');
  const html = document.documentElement;
  const KEY  = 'oridra-theme';

  /* Apply saved theme immediately */
  const saved = localStorage.getItem(KEY);
  if (saved) html.setAttribute('data-theme', saved);

  if (!btn) return;

  /* Build stars if the stars container exists (new toggle) */
  const starsEl = document.getElementById('themeStars');
  if (starsEl && starsEl.children.length === 0) {
    for (let i = 0; i < 12; i++) {
      const s    = document.createElement('div');
      s.className = 'theme-star';
      const size  = 1 + Math.random() * 2.5;
      s.style.cssText = `
        width:${size}px; height:${size}px;
        top:${10 + Math.random() * 80}%;
        left:${5  + Math.random() * 55}%;
        opacity:${0.4 + Math.random() * 0.6};
        animation: starTwinkle ${1.5 + Math.random() * 2}s ease-in-out
                   ${Math.random() * 2}s infinite alternate;
      `;
      starsEl.appendChild(s);
    }

    /* Inject star keyframe once */
    if (!document.getElementById('starKeyframe')) {
      const style = document.createElement('style');
      style.id = 'starKeyframe';
      style.textContent = `
        @keyframes starTwinkle {
          from { transform: scale(1);   opacity: 0.3; }
          to   { transform: scale(1.8); opacity: 1;   }
        }
      `;
      document.head.appendChild(style);
    }
  }

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';

    /* Burst animation (new toggle only) */
    btn.classList.add('bursting');
    btn.addEventListener('animationend', () => btn.classList.remove('bursting'), { once: true });

    /* Small delay so burst fires in old theme colour first */
    setTimeout(() => {
      html.setAttribute('data-theme', next);
      localStorage.setItem(KEY, next);
      showToast(next === 'dark' ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
    }, 80);
  });
})();

/* ============================================================
   MODULE: SCROLL REVEAL
============================================================ */
function triggerReveal() {
  const els = $$('.reveal-up, .reveal-left, .reveal-right');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => entry.target.classList.add('visible'), +delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}

window.addEventListener('load', () => {
  setTimeout(triggerReveal, 2100);
});

/* ============================================================
   MODULE: STATS COUNTER
============================================================ */
(function initStats() {
  const statCards = $$('.stat-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card  = entry.target;
        const numEl = card.querySelector('.stat-number');
        if (!numEl || card.classList.contains('animated')) return;

        card.classList.add('animated');
        const target    = parseFloat(numEl.dataset.target);
        const isDecimal = numEl.classList.contains('decimal');
        const duration  = 1800;
        const start     = performance.now();

        function update(now) {
          const elapsed  = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const ease     = 1 - Math.pow(1 - progress, 4);
          const current  = target * ease;
          numEl.textContent = isDecimal ? current.toFixed(2) : Math.round(current);
          if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
        observer.unobserve(card);
      }
    });
  }, { threshold: 0.4 });

  statCards.forEach(card => observer.observe(card));
})();

/* ============================================================
   MODULE: LIKE BUTTONS — Real counter starting from 0
============================================================ */
(function initLikeButtons() {
  const LIKES_KEY = 'oridra-likes-v2';      /* counts per project  */
  const LIKED_KEY = 'oridra-liked-state';   /* which ones YOU liked */

  /* Load stored data */
  function getLikeCounts() {
    try { return JSON.parse(localStorage.getItem(LIKES_KEY)) || {}; }
    catch { return {}; }
  }
  function getLikedState() {
    try { return JSON.parse(localStorage.getItem(LIKED_KEY)) || {}; }
    catch { return {}; }
  }
  function saveLikeCounts(obj) { localStorage.setItem(LIKES_KEY, JSON.stringify(obj)); }
  function saveLikedState(obj) { localStorage.setItem(LIKED_KEY, JSON.stringify(obj)); }

  /* Set every counter to its stored value (starts at 0 if never liked) */
  const counts = getLikeCounts();
  const liked  = getLikedState();

  $$('.like-btn').forEach(btn => {
    const id      = btn.dataset.id;
    const countEl = btn.querySelector('.like-count');
    const svgEl   = btn.querySelector('.like-heart svg');

    /* Show real count (default 0) */
    countEl.textContent = counts[id] || 0;

    /* Restore liked visual state */
    if (liked[id]) {
      btn.classList.add('liked');
      svgEl.style.fill = '#e8547a';
    }
  });

  $$('.like-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id      = btn.dataset.id;
      const countEl = btn.querySelector('.like-count');
      const svgEl   = btn.querySelector('.like-heart svg');
      const counts  = getLikeCounts();
      const liked   = getLikedState();

      if (!liked[id]) {
        /* ── LIKE ── */
        liked[id]  = true;
        counts[id] = (counts[id] || 0) + 1;
        saveLikedState(liked);
        saveLikeCounts(counts);

        btn.classList.add('liked', 'pop');
        svgEl.style.fill = '#e8547a';
        spawnParticles(btn);
        showToast('❤️ Liked!');
      } else {
        /* ── UNLIKE ── */
        delete liked[id];
        counts[id] = Math.max((counts[id] || 1) - 1, 0);
        saveLikedState(liked);
        saveLikeCounts(counts);

        btn.classList.remove('liked');
        svgEl.style.fill = 'transparent';
        showToast('💔 Unliked');
      }

      countEl.textContent = counts[id];
      btn.addEventListener('animationend', () => btn.classList.remove('pop'), { once: true });
    });
  });

  function spawnParticles(btn) {
    const container = btn.querySelector('.like-particles');
    if (!container) return;
    const colours = ['#e8547a', '#f5a623', '#f8e81c', '#f06', '#e879f9'];
    for (let i = 0; i < 8; i++) {
      const p     = document.createElement('span');
      p.className = 'particle';
      const angle = (i / 8) * 360;
      const dist  = 28 + Math.random() * 16;
      const tx    = Math.cos((angle * Math.PI) / 180) * dist;
      const ty    = Math.sin((angle * Math.PI) / 180) * dist;
      p.style.cssText = `
        background:${colours[i % colours.length]};
        --tx:${tx}px; --ty:${ty}px;
        animation-delay:${i * 0.03}s;
      `;
      container.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }
  }
})();

/* ============================================================
   MODULE: COMMENT BUTTONS — Real counter starting from 0
============================================================ */
(function initComments() {
  const STORAGE_KEY = 'oridra-comments-v2';

  function getComments() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  }
  function saveComments(obj) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  }

  /* Render saved comments and update counter badge */
  function renderComments(projectId) {
    const list    = $(`#comments-${projectId}`);
    const countEl = $(`.comment-btn[data-id="${projectId}"] .comment-count`);
    if (!list) return;

    const all = getComments()[projectId] || [];
    list.innerHTML = '';
    all.forEach(text => appendComment(list, text));

    /* Set real count (0 if none) */
    if (countEl) countEl.textContent = all.length;
  }

  function appendComment(listEl, text) {
    const item = document.createElement('div');
    item.className  = 'comment-item';
    item.textContent = text;
    listEl.appendChild(item);
    listEl.scrollTop = listEl.scrollHeight;
  }

  /* Init all projects */
  ['1', '2', '3', '4', '5'].forEach(id => renderComments(id));

  /* Toggle comment box */
  $$('.comment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const projectId = btn.dataset.id;
      const box = $(`#comment-box-${projectId}`);
      if (!box) return;
      const isOpen = box.classList.contains('open');
      $$('.comment-box').forEach(b => b.classList.remove('open'));
      if (!isOpen) {
        box.classList.add('open');
        setTimeout(() => box.querySelector('.comment-input')?.focus(), 350);
      }
    });
  });

  /* Submit comment */
  $$('.comment-submit').forEach(btn => {
    btn.addEventListener('click', () => submitComment(btn.dataset.project));
  });
  $$('.comment-input').forEach(input => {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') submitComment(input.dataset.project);
    });
  });

  function submitComment(projectId) {
    const input   = $(`.comment-input[data-project="${projectId}"]`);
    const listEl  = $(`#comments-${projectId}`);
    const countEl = $(`.comment-btn[data-id="${projectId}"] .comment-count`);
    if (!input || !input.value.trim()) return;

    const text = input.value.trim();
    input.value = '';

    appendComment(listEl, text);

    /* Persist */
    const all = getComments();
    if (!all[projectId]) all[projectId] = [];
    all[projectId].push(text);
    saveComments(all);

    /* Update real count */
    if (countEl) countEl.textContent = all[projectId].length;

    showToast('💬 Comment posted!');
  }
})();

/* ============================================================
   MODULE: CONTACT FORM
============================================================ */
(function initContactForm() {
  const form    = $('#contactForm');
  const success = $('#contactSuccess');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name  = $('#fname')?.value.trim();
    const email = $('#femail')?.value.trim();
    const msg   = $('#fmessage')?.value.trim();

    if (!name || !email || !msg) {
      showToast('⚠️ Please fill in required fields');
      return;
    }
    if (!isValidEmail(email)) {
      showToast('⚠️ Please enter a valid email');
      return;
    }

    const btn = form.querySelector('.btn-submit');
    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = 'Sending...';

    setTimeout(() => {
      form.style.display = 'none';
      success.classList.add('show');
      showToast('✅ Message sent successfully!');
    }, 1500);
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
})();

/* ============================================================
   MODULE: TOAST
============================================================ */
let toastTimer;
function showToast(msg) {
  let toast = $('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}
