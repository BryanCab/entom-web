/* Fumigaciones ENTOM - main.js (Vanilla JS) - Mejorado 2026-02-19 */
(function () {
  /* =========================
     Helpers
  ========================== */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* Config: WhatsApp (unificado) */
  const WA_NUMBER = '527535396749'; // +52 753 539 6749

  /* =========================
     Footer: Año dinámico
  ========================== */
  const yearEl = $('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* =========================
     Tema claro/oscuro (persistente)
  ========================== */
  const themeToggle = $('[data-theme-toggle]');
  const THEME_KEY = 'entom_theme';

  function applyTheme(theme) {
    if (!theme) {
      document.documentElement.removeAttribute('data-theme');
      if (themeToggle) themeToggle.setAttribute('aria-pressed', 'false');
      return;
    }
    document.documentElement.setAttribute('data-theme', theme);
    if (themeToggle) themeToggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
  }

  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    });
  }

  /* =========================
     Menú móvil
  ========================== */
  const navToggle = $('[data-nav-toggle]');
  const navMenu = $('[data-nav-menu]');

  function closeMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
  function openMenu() {
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

  /* =========================
     Lightbox (galería)
  ========================== */
  const lightbox = $('[data-lightbox]');
  const lightboxImg = $('[data-lightbox-img]');
  const lightboxCaption = $('[data-lightbox-caption]');
  const lightboxCloseBtn = $('[data-lightbox-close]');
  let lastFocus = null;

  function openLightbox(src, caption = '') {
    if (!lightbox || !lightboxImg) return;
    lastFocus = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = caption || 'Imagen ampliada';
    if (lightboxCaption) lightboxCaption.textContent = caption;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lightboxCloseBtn) lightboxCloseBtn.focus();
  }
  function closeLightbox() {
    if (!lightbox || !lightboxImg) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxImg.src = '';
    lightboxImg.alt = '';
    if (lightboxCaption) lightboxCaption.textContent = '';
    if (lastFocus) lastFocus.focus();
  }
  if (lightbox && lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  }
  document.addEventListener('click', (e) => {
    const item = e.target.closest('[data-lightbox-item]');
    if (!item) return;
    const src = item.getAttribute('data-src');
    const caption = item.getAttribute('data-caption') || '';
    if (src) openLightbox(src, caption);
  });

  /* =========================
     Scroll reveal
  ========================== */
  const revealEls = $('[data-reveal]') ? $$('[data-reveal]') : [];
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

  /* =========================
     Accordion
  ========================== */
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

  /* =========================
     Productos: búsqueda/filtros
  ========================== */
  const searchInput = $('[data-product-search]');
  const productsGrid = $('[data-products-grid]');
  const emptyMsg = $('[data-products-empty]');
  const chipButtons = $$('.chip');

  function normalize(str) {
    return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  function filterProducts() {
    if (!productsGrid) return;
    const q = normalize(searchInput ? searchInput.value : '');
    const active = chipButtons.find(b => b.classList.contains('is-active'));
    const cat = active ? active.getAttribute('data-filter') : 'all';
    let visible = 0;
    $$('[data-product]', productsGrid).forEach(card => {
      const name = normalize(card.getAttribute('data-name'));
      const category = normalize(card.getAttribute('data-category'));
      const matchesText = !q || name.includes(q) || category.includes(q);
      const matchesCat = (cat === 'all') || (category === normalize(cat));
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

  /* =========================
     Modal de producto
  ========================== */
  const productModal = $('[data-product-modal]');
  const modalCloseBtn = productModal ? $('[data-modal-close]', productModal) : null;
  let lastModalFocus = null;

  function openModal(mod) {
    if (!mod) return;
    lastModalFocus = document.activeElement;
    mod.hidden = false;
    mod.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    const closeBtn = $('[data-modal-close]', mod);
    if (closeBtn) closeBtn.focus();
  }
  function closeModal(mod) {
    if (!mod) return;
    mod.classList.remove('is-open');
    mod.hidden = true;
    document.body.style.overflow = '';
    if (lastModalFocus) lastModalFocus.focus();
  }
  if (productModal && modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => closeModal(productModal));
    productModal.addEventListener('click', (e) => { if (e.target === productModal) closeModal(productModal); });
  }

  // Abrir modal desde cards + preparar datos para carrito y WhatsApp
  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-product-open]');
    if (!openBtn) return;

    const card = e.target.closest('[data-product]');
    if (!card) return;

    const title = $('h3', card)?.textContent?.trim() || '';
    const desc = $('p.muted', card)?.textContent?.trim() || '';
    const priceLabel = $('[data-price]', card)?.getAttribute('data-price') || '';

    if (productModal) {
      $('#productTitle', productModal).textContent = title;
      $('[data-product-desc]', productModal).textContent = desc;
      $('[data-product-price]', productModal).textContent = priceLabel;

      // WhatsApp del modal (producto único)
      const waBtn = $('[data-wa-btn]', productModal);
      const waText = `Hola, me interesa el producto "${title}" (${priceLabel}). ¿Me das más información?`;
      if (waBtn) waBtn.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`;

      // Datos para botón "Agregar al carrito"
      const addBtn = $('[data-add-cart]', productModal);
      if (addBtn) {
        addBtn.dataset.id = card.getAttribute('data-id');
        addBtn.dataset.name = title;
        // ✅ regex corregido
        addBtn.dataset.price = priceLabel.replace(/[^0-9.]/g, '');
        const imgEl = card.querySelector('img[data-product-img]') || card.querySelector('img');
        if (imgEl) addBtn.dataset.img = imgEl.currentSrc || imgEl.src;

        // Actualiza imagen del modal (si existe)
        const modalImg = $('[data-modal-img]', productModal);
        if (modalImg && imgEl) {
          modalImg.src = imgEl.currentSrc || imgEl.src;
          modalImg.alt = imgEl.alt || '';
        }
      }

      openModal(productModal);
    }
  });

  /* =========================
     ESC global
  ========================== */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
      closeLightbox();
      if (productModal && productModal.classList.contains('is-open')) closeModal(productModal);
      if (cartModal && cartModal.classList.contains('is-open')) closeCart();
    }
  });

  /* =========================
     Carrito (modal)
  ========================== */
  const cartModal = $('[data-cart-modal]');
  const cartToggleBtn = $('[data-cart-toggle]');
  const cartCloseBtn = $('[data-cart-close]');
  const cartList = $('[data-cart-list]');
  const cartTotalEl = $('[data-cart-total]');
  const cartCountEl = $('[data-cart-count]');
  const cartEmpty = $('[data-cart-empty]');
  const cartClearBtn = $('[data-cart-clear]');
  const cartWaBtn = $('[data-cart-wa]');

  // A11y: si puedes, en HTML pon aria-live directamente: <button class="cart-btn" aria-live="polite" ...>
  if (cartToggleBtn && !cartToggleBtn.hasAttribute('aria-live')) {
    cartToggleBtn.setAttribute('aria-live', 'polite');
  }

  const CART_KEY = 'entom_cart';
  let cart = [];

  function loadCart() {
    try { cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch { cart = []; }
  }
  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
  function cartTotal() {
    return cart.reduce((s, i) => s + i.price * i.qty, 0);
  }
  function formatMXN(n) {
    return `$${n.toFixed(2)} MXN`;
  }

  function updateCartBadgeA11y() {
    if (!cartToggleBtn || !cartCountEl) return;
    const count = cart.reduce((s, i) => s + i.qty, 0);
    cartCountEl.textContent = count;
    cartToggleBtn.setAttribute('aria-label', `Abrir carrito (${count} artículo${count === 1 ? '' : 's'})`);
  }

  function renderCart() {
    if (!cartList) return;

    const isSafeURL = (u) => /^https?:\/\//.test(u) || /^data:image\//.test(u);

    cartList.innerHTML = '';
    if (cart.length === 0) {
      if (cartEmpty) cartEmpty.hidden = false;
    } else {
      if (cartEmpty) cartEmpty.hidden = true;
      cart.forEach(item => {
        const li = document.createElement('li');
        li.className = 'cart-item';

        const imgHTML = (item.img && isSafeURL(item.img))
          ? `<img src="${item.img}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:10px;border:1px solid var(--border);">`
          : `<svg width="48" height="48" viewBox="0 0 24 24" fill="none"
               xmlns="http://www.w3.org/2000/svg" style="border-radius:10px;border:1px solid var(--border);background:var(--surface);">
               <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" opacity=".25"/>
               <path d="M8 15l2.5-3 2 2.5L15 12l3 4H8z" fill="currentColor" opacity=".25"/>
             </svg>`;

        li.innerHTML = `
          <div class="cart-item__left" style="display:flex;align-items:center;gap:10px;">
            ${imgHTML}
            <div>
              <div class="cart-item__name">${item.name}</div>
              <div class="cart-item__price">${formatMXN(item.price)}</div>
            </div>
          </div>
          <div class="cart-item__right">
            <div class="cart-item__qty">
              <button class="cart-item__btn" data-dec data-id="${item.id}">–</button>
              <span aria-live="polite">${item.qty}</span>
              <button class="cart-item__btn" data-inc data-id="${item.id}">+</button>
              <button class="cart-item__btn" data-remove data-id="${item.id}" aria-label="Eliminar">✕</button>
            </div>
          </div>`;
        cartList.appendChild(li);
      });
    }

    if (cartTotalEl) cartTotalEl.textContent = formatMXN(cartTotal());
    updateCartBadgeA11y();
  }

  function openCart() {
    if (!cartModal) return;
    cartModal.hidden = false;
    cartModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (cartToggleBtn) cartToggleBtn.setAttribute('aria-expanded', 'true');
  }
  function closeCart() {
    if (!cartModal) return;
    cartModal.classList.remove('is-open');
    cartModal.hidden = true;
    document.body.style.overflow = '';
    if (cartToggleBtn) cartToggleBtn.setAttribute('aria-expanded', 'false');
  }

  // Delegación de eventos del carrito
  document.addEventListener('click', (e) => {
    // Add to cart desde el modal de producto
    const addBtn = e.target.closest('[data-add-cart]');
    if (addBtn) {
      const id = addBtn.dataset.id;
      const name = addBtn.dataset.name;
      const price = parseFloat(addBtn.dataset.price || '0'); // ✅ robusto
      const img = addBtn.dataset.img || '';

      const found = cart.find(i => i.id === id);
      if (found) found.qty += 1;
      else cart.push({ id, name, price, img, qty: 1 });

      saveCart(); renderCart(); openCart();
    }

    // Abrir/cerrar carrito
    if (e.target.closest('[data-cart-toggle]')) { openCart(); }
    if (e.target.closest('[data-cart-close]')) { closeCart(); }

    // Controles de cantidad
    if (e.target.closest('[data-inc]')) {
      const id = e.target.closest('[data-inc]').dataset.id;
      const item = cart.find(i => i.id === id);
      if (item) { item.qty += 1; saveCart(); renderCart(); }
    }
    if (e.target.closest('[data-dec]')) {
      const id = e.target.closest('[data-dec]').dataset.id;
      const item = cart.find(i => i.id === id);
      if (item) { item.qty = Math.max(1, item.qty - 1); saveCart(); renderCart(); }
    }
    if (e.target.closest('[data-remove]')) {
      const id = e.target.closest('[data-remove]').dataset.id;
      cart = cart.filter(i => i.id !== id); saveCart(); renderCart();
    }
  });

  // Cerrar carrito por overlay
  if (cartModal) {
    cartModal.addEventListener('click', (e) => { if (e.target === cartModal) closeCart(); });
  }

  // Vaciar carrito
  if (cartClearBtn) {
    cartClearBtn.addEventListener('click', () => { cart = []; saveCart(); renderCart(); });
  }

  // Enviar carrito por WhatsApp
  if (cartWaBtn) {
    cartWaBtn.addEventListener('click', () => {
      if (cart.length === 0) { openCart(); return; }
      const lines = cart
        .map(i => `• ${i.name} x${i.qty} — ${formatMXN(i.price)} = ${formatMXN(i.price * i.qty)}`)
        .join('\n');
      const total = formatMXN(cartTotal());
      const text = `Hola, quiero información y disponibilidad de:\n${lines}\nTotal: ${total}`;
      const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank', 'noopener');
    });
  }

  /* =========================
     Formulario (mailto)
  ========================== */
  const emailForm = $('[data-email-form]');
  if (emailForm) {
    emailForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(emailForm);
      const nombre = (fd.get('nombre') || '').toString().trim();
      const correo = (fd.get('correo') || '').toString().trim();
      const tel = (fd.get('telefono') || '').toString().trim();
      const mensaje = (fd.get('mensaje') || '').toString().trim();
      const subject = `Solicitud de servicio/productos - ${nombre}`;
      const body =
        `Nombre: ${nombre}%0D%0A` +
        `Correo: ${correo}%0D%0A` +
        `Teléfono: ${tel}%0D%0A` +
        `Mensaje: ${encodeURIComponent(mensaje)}`;
      window.location.href = `mailto:fumigaciones-entom@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
      emailForm.reset();
    });
  }

  /* =========================
     Init
  ========================== */
  loadCart();
  renderCart();

})();
