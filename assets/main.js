/* ===========================================================================
   OrigoVia Partners : main.js (script commun aux 9 pages)
   ===========================================================================
   Ce fichier est chargé en bas de CHAQUE page avec <script src="assets/main.js">.
   Il ne dépend d'aucune bibliothèque (pas de jQuery, pas de npm) : c'est du
   JavaScript natif.

   Sommaire :
     1. Barre de navigation qui se réduit au défilement
     2. Apparition progressive des blocs (classe .reveal)
     3. Compteurs animés de la bande de chiffres (page d'accueil)
     4. Menu mobile (hamburger)
     5. Sélecteur de langue (branché sur Google Translate)
     6. Sous-menus du menu mobile
     7. Tableau comparatif en onglets sur mobile (page For Processors)

   Les éléments sont trouvés par leur id ou leur classe : si vous renommez un
   id ou une classe dans le HTML, mettez aussi à jour la ligne correspondante ici.

   IMPORTANT : toutes les valeurs affichées passent par textContent ou classList,
   jamais par innerHTML. Cela évite les failles XSS (injection de code).
   Gardez cette règle si vous ajoutez du code.
   =========================================================================== */

// ---------------------------------------------------------------------------
// 1. En-tête : ajoute la classe "scrolled" quand on descend de plus de 40 px.
//    Le CSS (header.scrolled) donne alors un fond bleu et réduit la hauteur.
//    Sur les pages intérieures, l'en-tête a déjà la classe "solid" dans le HTML.
// ---------------------------------------------------------------------------
// Header shrink on scroll
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

// ---------------------------------------------------------------------------
// 2. Apparition au défilement : tout élément avec la classe "reveal" reçoit la
//    classe "in" quand 18 % de sa hauteur est visible (le CSS fait le fondu).
//    Pour animer un nouveau bloc, ajoutez simplement class="reveal" dessus.
// ---------------------------------------------------------------------------
// Reveal-on-scroll
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('in');
  });
}, { threshold: 0.18 });
revealEls.forEach(el => io.observe(el));

// ---------------------------------------------------------------------------
// 3. Compteurs animés (bande bleue de la page d'accueil).
//    Dans le HTML : <div class="num" data-target="100" data-suffix="%">0</div>
//      - data-target : le nombre final à atteindre
//      - data-suffix : le texte affiché après le nombre (%, /50, ...)
//    L'animation dure 1,4 seconde et démarre quand le compteur est à moitié visible.
// ---------------------------------------------------------------------------
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
    // Fonction appelée à chaque image : calcule la progression (0 à 1) puis
    // applique un "easing" pour ralentir la fin de l'animation.
    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    // Le compteur ne doit se lancer qu'une seule fois.
    counterIO.unobserve(el);
  });
}, { threshold: 0.5 });
counters.forEach(el => counterIO.observe(el));

// ---------------------------------------------------------------------------
// 4. Menu mobile (visible sous 900 px de large, voir le CSS "MOBILE NAVIGATION").
//    Trois éléments du HTML sont utilisés (présents sur chaque page) :
//      #hamburger      : le bouton à trois barres
//      #mobileNav      : le panneau qui glisse depuis la droite
//      #mobileBackdrop : le voile sombre derrière le panneau
//    La classe "open" sur ces trois éléments affiche le menu.
//    On bloque aussi le défilement de la page (overflow hidden) tant qu'il est ouvert.
// ---------------------------------------------------------------------------
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
  // Un clic sur le bouton ouvre ou ferme le menu.
  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeMobileNav() : openMobileNav();
  });
  // Un clic sur le voile sombre ferme le menu.
  mobileBackdrop.addEventListener('click', closeMobileNav);
  // Un clic sur un lien du menu le ferme aussi (utile pour les liens #ancre).
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));
}
/* ---------------------------------------------------------------------------
   5. Sélecteur de langue (EN / FR / NL)
   ---------------------------------------------------------------------------
   Fonctionnement :
     - Le site est écrit en anglais. La traduction est faite par le widget
       Google Translate, chargé en bas de chaque page (script translate.google.com
       et fonction googleTranslateElementInit, dans le HTML).
     - Ce widget est caché (div #google_translate_element, classe .gt-hidden).
       Les visiteurs utilisent à la place notre propre <select class="lang-switch">,
       qui est plus propre visuellement.
     - Google mémorise la langue dans un cookie nommé "googtrans" dont la valeur
       est "/en/fr" pour le français. Ce cookie permet de garder la langue d'une
       page à l'autre.
   Pour AJOUTER une langue : ajoutez une <option value="xx"> dans les deux
   <select class="lang-switch"> de CHAQUE page, et ajoutez le code "xx" dans
   includedLanguages (fonction googleTranslateElementInit, dans chaque page).
   Les traductions sont automatiques : elles peuvent contenir des erreurs.
   --------------------------------------------------------------------------- */
/* ---------- Language switcher (plain <select> UI, driven by Google Translate) ---------- */
(function () {
  // Lit la langue courante dans le cookie. Retourne "en" s'il n'y a pas de cookie.
  // L'expression régulière n'accepte que des lettres et des tirets : aucune
  // valeur étrangère ne peut passer.
  function currentLang() {
    const m = document.cookie.match(/googtrans=\/en\/([a-zA-Z-]+)/);
    return m ? m[1] : 'en';
  }

  // Écrit le cookie de langue, avec et sans domaine, car Google le lit selon
  // les navigateurs de l'une ou l'autre façon.
  function setLangCookie(lang) {
    const value = '/en/' + lang;
    document.cookie = 'googtrans=' + value + '; path=/';
    document.cookie = 'googtrans=' + value + '; path=/; domain=' + window.location.hostname;
  }

  // Change la langue : met à jour le cookie, puis demande au widget Google de traduire.
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

  // Il y a deux sélecteurs par page (barre du haut et menu mobile) : on les
  // synchronise tous les deux avec la langue courante, puis on écoute les changements.
  const selects = document.querySelectorAll('.lang-switch');
  const active = currentLang();
  selects.forEach(sel => { sel.value = active; });
  selects.forEach(sel => {
    sel.addEventListener('change', (e) => applyLang(e.target.value));
  });
})();

/* ---------- Mobile nav: sub-menu toggle separate from the page link ---------- */
// ---------------------------------------------------------------------------
// 6. Sous-menus du menu mobile. Chaque groupe (.mobile-nav-group) contient un
//    lien de page, un bouton "+" (.mobile-nav-caret) et une liste cachée
//    (.sub-links). Le bouton affiche ou cache la liste et met à jour
//    aria-expanded pour les lecteurs d'écran.
//    Le texte "Afficher le sous-menu ..." (aria-label des boutons dans le HTML)
//    est en français alors que le site est en anglais : à harmoniser si besoin.
// ---------------------------------------------------------------------------
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
// ---------------------------------------------------------------------------
// 7. Tableau comparatif (page for-processors.html, section #compare-summary).
//    Sur ordinateur, le CSS affiche un vrai tableau (.cs-table). Sous 768 px,
//    il affiche à la place deux onglets : "Traditional Model" et "OrigoVia Model".
//    Lien entre bouton et contenu :
//      <button data-tab="trad">      <->   <div data-panel="trad">
//    Un clic active le bouton (classe "active", aria-selected) et n'affiche que
//    le panneau dont data-panel correspond ; les autres reçoivent l'attribut hidden.
//    Si vous ajoutez un onglet, gardez la même valeur dans data-tab et data-panel.
// ---------------------------------------------------------------------------
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
