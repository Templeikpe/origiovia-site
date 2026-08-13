// Header shrink on scroll
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

// Reveal-on-scroll
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('in');
  });
}, { threshold: 0.18 });
revealEls.forEach(el => io.observe(el));

// KPI counters
const counters = document.querySelectorAll('.kpi .num');
const counterIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterIO.unobserve(el);
  });
}, { threshold: 0.5 });
counters.forEach(el => counterIO.observe(el));

// Mobile nav toggle
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
const mobileBackdrop = document.getElementById('mobileBackdrop');
function closeMobileNav(){
  hamburger.classList.remove('open');
  mobileNav.classList.remove('open');
  mobileBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}
function openMobileNav(){
  hamburger.classList.add('open');
  mobileNav.classList.add('open');
  mobileBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}
if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeMobileNav() : openMobileNav();
  });
  mobileBackdrop.addEventListener('click', closeMobileNav);
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));
}
/* ---------- Language switcher (plain <select> UI, driven by Google Translate) ---------- */
(function () {
  function currentLang() {
    const m = document.cookie.match(/googtrans=\/en\/([a-zA-Z-]+)/);
    return m ? m[1] : 'en';
  }

  function setLangCookie(lang) {
    const value = '/en/' + lang;
    document.cookie = 'googtrans=' + value + '; path=/';
    document.cookie = 'googtrans=' + value + '; path=/; domain=' + window.location.hostname;
  }

  function applyLang(lang) {
    setLangCookie(lang);
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      combo.value = lang;
      combo.dispatchEvent(new Event('change'));
    } else {
      // Widget not ready yet — reload so the cookie takes effect on load.
      window.location.reload();
    }
  }

  const selects = document.querySelectorAll('.lang-switch');
  const active = currentLang();
  selects.forEach(sel => { sel.value = active; });
  selects.forEach(sel => {
    sel.addEventListener('change', (e) => applyLang(e.target.value));
  });
})();

/* ---------- Mobile nav: sub-menu toggle separate from the page link ---------- */
document.querySelectorAll('.mobile-nav-group .mobile-nav-caret').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.closest('.mobile-nav-group');
    const sub = group.querySelector('.sub-links');
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!isOpen));
    if (isOpen) {
      sub.setAttribute('hidden', '');
    } else {
      sub.removeAttribute('hidden');
    }
  });
});

/* ---------- Comparison table — mobile tab switcher ---------- */
document.querySelectorAll('.cs-tab-buttons').forEach(group => {
  const buttons = group.querySelectorAll('.cs-tab-btn');
  const wrap = group.closest('.cs-tabs');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      buttons.forEach(b => {
        const isActive = b === btn;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', String(isActive));
      });
      wrap.querySelectorAll('.cs-tab-panel').forEach(panel => {
        if (panel.getAttribute('data-panel') === target) {
          panel.removeAttribute('hidden');
        } else {
          panel.setAttribute('hidden', '');
        }
      });
    });
  });
});
