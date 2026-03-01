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
  const loader   = $('#loader');
  const fill     = $('#loaderFill');
  if (!loader) return;

  // Animate fill bar
  setTimeout(() => { fill.style.width = '100%'; }, 100);

  // Hide loader after animation
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

  let fx = 0, fy = 0;   // follower coords
  let mx = 0, my = 0;   // mouse coords

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  // Smooth follower
  function animateFollower() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Expand cursor on interactive elements
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
  const nav     = $('#nav');
  const menuBtn = $('#menuBtn');
  const mobileMenu  = $('#mobileMenu');
  const mobileClose = $('#mobileClose');
  const mobileLinks = $$('.mobile-link');

  // Scroll shrink
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  // Mobile menu open
  if (menuBtn) menuBtn.addEventListener('click', () => {
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  // Mobile menu close
  function closeMenu() {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (mobileClose) mobileClose.addEventListener('click', closeMenu);
  mobileLinks.forEach(l => l.addEventListener('click', closeMenu));

  // Smooth scroll for all anchor links
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
   MODULE: THEME TOGGLE
============================================================ */
(function initTheme() {
  const btn  = $('#themeToggle');
  const html = document.documentElement;
  const key  = 'oridra-theme';

  // Load saved theme
  const saved = localStorage.getItem(key);
  if (saved) html.setAttribute('data-theme', saved);

  btn?.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem(key, next);
    showToast(next === 'dark' ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
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
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, +delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}

// Also run reveal after page load in case loader finishes early
window.addEventListener('load', () => {
  setTimeout(triggerReveal, 2100);
});

/* ============================================================
   MODULE: STATS COUNTER
============================================================ */
(function initStats() {
  const statNumbers = $$('.stat-number');
  const statCards   = $$('.stat-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const numEl = card.querySelector('.stat-number');
        if (!numEl || card.classList.contains('animated')) return;

        card.classList.add('animated');
        const target  = parseFloat(numEl.dataset.target);
        const isDecimal = card.querySelector('.stat-number.decimal') !== null;
        const duration = 1800;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out quart
          const ease = 1 - Math.pow(1 - progress, 4);
          const current = target * ease;
          numEl.textContent = isDecimal
            ? current.toFixed(2)
            : Math.round(current);
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
   MODULE: LIKE BUTTONS
============================================================ */
(function initLikeButtons() {
  const STORAGE_KEY = 'oridra-likes';

  // Load liked state from localStorage
  function getLiked() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  }
  function saveLiked(obj) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  }

  // Apply initial liked state
  const liked = getLiked();
  $$('.like-btn').forEach(btn => {
    const id = btn.dataset.id;
    if (liked[id]) {
      btn.classList.add('liked');
      btn.querySelector('.like-heart svg').style.fill = '#e8547a';
    }
  });

  $$('.like-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id       = btn.dataset.id;
      const countEl  = btn.querySelector('.like-count');
      const svgEl    = btn.querySelector('.like-heart svg');
      const liked    = getLiked();
      let   count    = parseInt(countEl.textContent, 10);

      if (!liked[id]) {
        // ---- LIKE ----
        liked[id] = true;
        saveLiked(liked);
        count++;
        btn.classList.add('liked', 'pop');
        svgEl.style.fill = '#e8547a';
        spawnParticles(btn);
        showToast('❤️ Liked!');
      } else {
        // ---- UNLIKE ----
        delete liked[id];
        saveLiked(liked);
        count--;
        btn.classList.remove('liked');
        svgEl.style.fill = 'transparent';
        showToast('💔 Unliked');
      }

      countEl.textContent = count;
      // Remove pop class after animation
      btn.addEventListener('animationend', () => btn.classList.remove('pop'), { once: true });
    });
  });

  /* Spawn coloured particles on like */
  function spawnParticles(btn) {
    const container = btn.querySelector('.like-particles');
    if (!container) return;
    const colours = ['#e8547a', '#f5a623', '#f8e81c', '#f06', '#e879f9'];

    for (let i = 0; i < 8; i++) {
      const p = document.createElement('span');
      p.className = 'particle';
      const angle  = (i / 8) * 360;
      const dist   = 28 + Math.random() * 16;
      const tx     = Math.cos((angle * Math.PI) / 180) * dist;
      const ty     = Math.sin((angle * Math.PI) / 180) * dist;
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
   MODULE: COMMENT BUTTONS
============================================================ */
(function initComments() {
  const STORAGE_KEY = 'oridra-comments';

  function getComments() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  }
  function saveComments(obj) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  }

  // Render saved comments on load
  function renderComments(projectId) {
    const list = $(`#comments-${projectId}`);
    if (!list) return;
    const all = getComments()[projectId] || [];
    list.innerHTML = '';
    all.forEach(text => appendComment(list, text));
  }

  function appendComment(listEl, text) {
    const item = document.createElement('div');
    item.className = 'comment-item';
    item.textContent = text;
    listEl.appendChild(item);
    // Auto scroll to bottom
    listEl.scrollTop = listEl.scrollHeight;
  }

  // Init all projects
  ['1','2','3','4','5'].forEach(id => renderComments(id));

  // Toggle comment box
  $$('.comment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const projectId = btn.dataset.id;
      const box = $(`#comment-box-${projectId}`);
      if (!box) return;
      const isOpen = box.classList.contains('open');
      // Close all others
      $$('.comment-box').forEach(b => b.classList.remove('open'));
      if (!isOpen) {
        box.classList.add('open');
        const input = box.querySelector('.comment-input');
        setTimeout(() => input?.focus(), 350);
      }
    });
  });

  // Submit comment
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

    // Persist
    const all = getComments();
    if (!all[projectId]) all[projectId] = [];
    all[projectId].push(text);
    saveComments(all);

    // Update count
    if (countEl) countEl.textContent = parseInt(countEl.textContent, 10) + 1;

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
    const name = $('#fname')?.value.trim();
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

    // Simulate sending
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
