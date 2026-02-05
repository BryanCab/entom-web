
/* Fumigaciones ENTOM - main.js
   Vanilla JS only.
*/

(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const yearEl = $('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Theme toggle
  const themeToggle = $('[data-theme-toggle]');
  const themeKey = 'entom_theme';

  function applyTheme(theme){
    if (!theme) {
      document.documentElement.removeAttribute('data-theme');
      if (themeToggle) themeToggle.setAttribute('aria-pressed', 'false');
      return;
    }
    document.documentElement.setAttribute('data-theme', theme);
    if (themeToggle) themeToggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
  }

  const savedTheme = localStorage.getItem(themeKey);
  if (savedTheme) applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      localStorage.setItem(themeKey, next);
    });
  }

  // Mobile nav
  const navToggle = $('[data-nav-toggle]');
  const navMenu = $('[data-nav-menu]');

  function closeMenu(){
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  function openMenu(){
    if (!navMenu || !navToggle) return;
    navMenu.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      expanded ? closeMenu() : openMenu();
    });

    $$('.nav__link', navMenu).forEach(a => a.addEventListener('click', closeMenu));

    document.addEventListener('click', (e) => {
      if (!navMenu.classList.contains('is-open')) return;
      const inside = navMenu.contains(e.target) || navToggle.contains(e.target);
      if (!inside) closeMenu();
    });
  }

  // Lightbox
  const lightbox = $('[data-lightbox]');
  const lightboxImg = $('[data-lightbox-img]');
  const lightboxCaption = $('[data-lightbox-caption]');
  const lightboxCloseBtn = $('[data-lightbox-close]');

  function openLightbox(src, caption=''){
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = caption || 'Imagen ampliada';
    if (lightboxCaption) lightboxCaption.textContent = caption;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lightboxCloseBtn) lightboxCloseBtn.focus();
  }

  function closeLightbox(){
    if (!lightbox || !lightboxImg) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxImg.src = '';
    lightboxImg.alt = '';
    if (lightboxCaption) lightboxCaption.textContent = '';
  }

  window.closeLightbox = closeLightbox;

  if (lightbox && lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
      closeLightbox();
    }
  });

  document.addEventListener('click', (e) => {
    const item = e.target.closest('[data-lightbox-item]');
    if (!item) return;
    const src = item.getAttribute('data-src');
    const caption = item.getAttribute('data-caption') || '';
    if (src) openLightbox(src, caption);
  });

  // Scroll reveal
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // Accordion
  const accordion = $('[data-accordion]');
  if (accordion) {
    $$('.accordion__btn', accordion).forEach(btn => {
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        $$('.accordion__btn', accordion).forEach(b => {
          b.setAttribute('aria-expanded', 'false');
          const panel = b.parentElement.querySelector('.accordion__panel');
          if (panel) panel.hidden = true;
        });
        btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        const panel = btn.parentElement.querySelector('.accordion__panel');
        if (panel) panel.hidden = expanded;
      });
    });
  }

  // Products filter/search
  const searchInput = $('[data-product-search]');
  const productsGrid = $('[data-products-grid]');
  const emptyMsg = $('[data-products-empty]');
  const chipButtons = $$('.chip');

  function normalize(str){
    return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function filterProducts(){
    if (!productsGrid) return;
    const q = normalize(searchInput ? searchInput.value : '');
    const active = chipButtons.find(b => b.classList.contains('is-active'));
    const cat = active ? active.getAttribute('data-filter') : 'all';
    let visible = 0;

    $$('[data-product]', productsGrid).forEach(card => {
      const name = normalize(card.getAttribute('data-name'));
      const category = normalize(card.getAttribute('data-category'));
      const matchesText = !q || name.includes(q) || category.includes(q);
      const matchesCat = (cat === 'all') || category === normalize(cat);
      const show = matchesText && matchesCat;
      card.hidden = !show;
      if (show) visible++;
    });

    if (emptyMsg) emptyMsg.hidden = visible !== 0;
  }

  if (searchInput && productsGrid) searchInput.addEventListener('input', filterProducts);

  if (chipButtons.length && productsGrid) {
    chipButtons.forEach(btn => btn.addEventListener('click', () => {
      chipButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      filterProducts();
    }));
  }

  // Form -> WhatsApp
  const form = $('[data-contact-form]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const nombre = (fd.get('nombre') || '').toString().trim();
      const tel = (fd.get('telefono') || '').toString().trim();
      const mensaje = (fd.get('mensaje') || '').toString().trim();

      const base = 'https://wa.me/7535396749';
      const text = `Hola, soy ${nombre}. Mi teléfono es ${tel}. ${mensaje}`;
      const url = `${base}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank', 'noopener');
      form.reset();
    });
  }
})();
