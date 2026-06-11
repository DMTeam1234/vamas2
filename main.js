/**
 * VAMAS.IN — Main JavaScript
 * Vanilla JS only. No jQuery. No external libraries.
 */

'use strict';

// ============================================================
// UTILITIES
// ============================================================

function $(sel, ctx) { return (ctx || document).querySelector(sel); }
function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

function formatPrice(paise) {
  return '₹' + (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function showToast(message, type) {
  let container = $('#toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast' + (type ? ' toast--' + type : '');
  const icon = type === 'success' ? '✓ ' : type === 'error' ? '✕ ' : '';
  toast.textContent = icon + message;
  container.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3200);
}

// ============================================================
// PAGE PROGRESS BAR
// ============================================================

class PageProgressBar {
  constructor() {
    this.bar = document.createElement('div');
    this.bar.id = 'page-progress';
    document.body.prepend(this.bar);
    this.run();
  }

  run() {
    this.set(15);
    setTimeout(() => this.set(55), 100);
    setTimeout(() => this.set(82), 320);
    setTimeout(() => this.complete(), 620);
  }

  set(pct) {
    this.bar.style.width = pct + '%';
    this.bar.style.opacity = '1';
  }

  complete() {
    this.bar.style.width = '100%';
    setTimeout(() => {
      this.bar.style.opacity = '0';
      setTimeout(() => { this.bar.style.width = '0%'; }, 300);
    }, 180);
  }
}

// ============================================================
// ANNOUNCEMENT BAR
// ============================================================

class AnnouncementBar {
  constructor() {
    this.el = $('.announcement-bar');
    if (!this.el) return;
    this.KEY = 'vamas_ann_dismissed_v1';
    if (this.isDismissed()) { this.el.classList.add('is-dismissed'); return; }
    this.bindClose();
    this.duplicateTrack();
  }

  isDismissed() {
    try { return localStorage.getItem(this.KEY) === '1'; } catch (e) { return false; }
  }

  dismiss() {
    try { localStorage.setItem(this.KEY, '1'); } catch (e) {}
    this.el.style.transition = 'max-height 0.3s ease, opacity 0.25s ease';
    this.el.style.maxHeight = this.el.offsetHeight + 'px';
    requestAnimationFrame(() => {
      this.el.style.maxHeight = '0';
      this.el.style.opacity = '0';
      this.el.style.overflow = 'hidden';
      setTimeout(() => this.el.classList.add('is-dismissed'), 340);
    });
  }

  bindClose() {
    const btn = this.el.querySelector('.announcement-bar__close');
    if (btn) btn.addEventListener('click', () => this.dismiss());
  }

  duplicateTrack() {
    const track = this.el.querySelector('.announcement-bar__track');
    if (!track) return;
    // Clone for seamless marquee loop
    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    this.el.insertBefore(clone, track.nextSibling);
  }
}

// ============================================================
// HEADER
// ============================================================

class Header {
  constructor() {
    this.el = $('.site-header');
    if (!this.el) return;

    this.hamburger = this.el.querySelector('.hamburger');
    this.mobileNav = $('.mobile-nav-overlay');
    this.searchWrapper = this.el.querySelector('.search-input-wrapper');
    this.searchInput = this.el.querySelector('.search-input-wrapper input');
    this.searchDropdown = this.el.querySelector('.search-dropdown');
    this.SCROLL_THRESHOLD = 80;
    this.rafPending = false;

    this.DEMO_RESULTS = [
      { name: 'Banarasi Silk Blouse – Amethyst', price: '₹4,200' },
      { name: 'Kanjeevaram Contrast Blouse', price: '₹5,800' },
      { name: 'Hand-embroidered Georgette Blouse', price: '₹3,600' },
      { name: 'Chanderi Cotton Blouse – Ivory', price: '₹2,900' },
      { name: 'Ikkat Printed Blouse – Teal', price: '₹3,100' },
    ];

    this.bindScroll();
    this.bindHamburger();
    this.bindSearch();
    this.bindMegaMenu();
  }

  bindScroll() {
    window.addEventListener('scroll', () => {
      if (!this.rafPending) {
        requestAnimationFrame(() => {
          this.el.classList.toggle('scrolled', window.scrollY > this.SCROLL_THRESHOLD);
          this.rafPending = false;
        });
        this.rafPending = true;
      }
    }, { passive: true });
  }

  bindHamburger() {
    if (!this.hamburger || !this.mobileNav) return;

    this.hamburger.addEventListener('click', () => {
      const open = this.hamburger.classList.toggle('is-open');
      this.mobileNav.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      this.hamburger.setAttribute('aria-expanded', String(open));
    });

    this.mobileNav.addEventListener('click', (e) => {
      if (e.target === this.mobileNav) this.closeMobile();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.mobileNav.classList.contains('is-open')) this.closeMobile();
    });
  }

  closeMobile() {
    this.hamburger.classList.remove('is-open');
    this.mobileNav.classList.remove('is-open');
    document.body.style.overflow = '';
    this.hamburger.setAttribute('aria-expanded', 'false');
  }

  bindSearch() {
    if (!this.searchInput || !this.searchDropdown) return;

    let debounce;

    this.searchInput.addEventListener('focus', () => {
      if (this.searchInput.value.trim().length > 1) {
        this.searchDropdown.classList.add('is-open');
      }
    });

    this.searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const q = this.searchInput.value.trim();
        if (q.length > 1) {
          this.renderSearch(q);
        } else {
          this.searchDropdown.classList.remove('is-open');
        }
      }, 200);
    });

    document.addEventListener('click', (e) => {
      if (this.searchWrapper && !this.searchWrapper.contains(e.target)) {
        this.searchDropdown.classList.remove('is-open');
      }
    });

    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.searchDropdown.classList.remove('is-open');
        this.searchInput.blur();
      }
    });
  }

  renderSearch(query) {
    const q = query.toLowerCase();
    const results = this.DEMO_RESULTS.filter(r => r.name.toLowerCase().includes(q));
    const list = results.length ? results : this.DEMO_RESULTS.slice(0, 3);

    this.searchDropdown.innerHTML =
      `<div class="search-dropdown__title">Results for "${query}"</div>` +
      list.map(r =>
        `<div class="search-dropdown__item" tabindex="0" role="option">
           <div class="search-dropdown__item-img" style="background:var(--color-surface);display:flex;align-items:center;justify-content:center;font-size:20px">👗</div>
           <div>
             <div style="font-size:13px;font-weight:500;color:var(--color-dark)">${r.name}</div>
             <div style="font-size:12px;font-weight:600;color:var(--color-primary)">${r.price}</div>
           </div>
         </div>`
      ).join('');

    this.searchDropdown.classList.add('is-open');
  }

  bindMegaMenu() {
    $$('.header-nav__item').forEach(item => {
      const link = item.querySelector('.header-nav__link');
      const menu = item.querySelector('.mega-menu');
      if (!menu || !link) return;

      link.setAttribute('aria-haspopup', 'true');
      link.setAttribute('aria-expanded', 'false');

      item.addEventListener('mouseenter', () => link.setAttribute('aria-expanded', 'true'));
      item.addEventListener('mouseleave', () => link.setAttribute('aria-expanded', 'false'));

      link.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const open = link.getAttribute('aria-expanded') === 'true';
          link.setAttribute('aria-expanded', String(!open));
        }
      });
    });
  }
}

// ============================================================
// CART (localStorage demo)
// ============================================================

const CART_KEY = 'vamas_cart_v2';
const FREE_SHIP_THRESHOLD = 299900; // ₹2999 paise

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; }
}

function saveCart(cart) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
}

function cartTotal(cart) {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function cartCount(cart) {
  return cart.reduce((s, i) => s + i.qty, 0);
}

class CartDrawer {
  constructor() {
    this.drawer = $('.cart-drawer');
    this.overlay = $('.cart-drawer-overlay');
    this.cart = loadCart();

    if (!this.drawer) return;

    this.itemsEl = this.drawer.querySelector('.cart-drawer__items');
    this.footerEl = this.drawer.querySelector('.cart-drawer__footer');
    this.badgeEls = $$('.cart-badge');

    this.bindTriggers();
    this.bindClose();
    this.render();
  }

  bindTriggers() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-cart-trigger]')) this.open();
    });
  }

  bindClose() {
    const closeBtn = this.drawer.querySelector('.cart-drawer__close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    if (this.overlay) this.overlay.addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.drawer.classList.contains('is-open')) this.close();
    });
  }

  open() {
    this.render();
    this.drawer.classList.add('is-open');
    if (this.overlay) this.overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.drawer.classList.remove('is-open');
    if (this.overlay) this.overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  addItem(item) {
    const existing = this.cart.find(i => i.id === item.id && i.variant === item.variant);
    if (existing) {
      existing.qty += (item.qty || 1);
    } else {
      this.cart.push({ ...item, qty: item.qty || 1 });
    }
    saveCart(this.cart);
    this.render();
    this.bumpBadge();
    showToast('Added to cart!', 'success');
    this.open();
  }

  updateQty(id, variant, delta) {
    const item = this.cart.find(i => i.id === id && i.variant === variant);
    if (!item) return;
    item.qty = Math.max(0, item.qty + delta);
    if (item.qty === 0) this.cart = this.cart.filter(i => !(i.id === id && i.variant === variant));
    saveCart(this.cart);
    this.render();
  }

  remove(id, variant) {
    this.cart = this.cart.filter(i => !(i.id === id && i.variant === variant));
    saveCart(this.cart);
    this.render();
  }

  updateBadges() {
    const n = cartCount(this.cart);
    this.badgeEls.forEach(b => {
      b.textContent = n;
      b.style.display = n === 0 ? 'none' : 'flex';
    });
  }

  bumpBadge() {
    this.badgeEls.forEach(b => {
      b.classList.remove('bump');
      void b.offsetWidth;
      b.classList.add('bump');
    });
  }

  renderProgress(total) {
    const pct = Math.min(100, (total / FREE_SHIP_THRESHOLD) * 100);
    const rem = FREE_SHIP_THRESHOLD - total;
    const msg = rem > 0
      ? `Add <strong>${formatPrice(rem)}</strong> for free shipping`
      : `🎉 Free shipping unlocked!`;
    return `<div class="shipping-progress">
      <div class="shipping-progress__text type-small">${msg}</div>
      <div class="shipping-progress__bar"><div class="shipping-progress__fill" style="width:${pct}%"></div></div>
    </div>`;
  }

  render() {
    if (!this.drawer) return;
    const total = cartTotal(this.cart);

    // Shipping progress — inject after header
    const existingProg = this.drawer.querySelector('.shipping-progress');
    if (existingProg) existingProg.remove();
    const header = this.drawer.querySelector('.cart-drawer__header');
    if (header) header.insertAdjacentHTML('afterend', this.renderProgress(total));

    // Items
    if (this.itemsEl) {
      if (this.cart.length === 0) {
        this.itemsEl.innerHTML = `
          <div class="cart-drawer__empty">
            <div class="cart-drawer__empty-icon">🛍️</div>
            <div class="type-h4" style="margin-bottom:8px;color:var(--color-dark)">Your cart is empty</div>
            <p class="type-body">Discover our curated blouse collection.</p>
            <br>
            <a href="#" class="btn btn-primary btn--sm" style="display:inline-flex">Shop Now</a>
          </div>`;
      } else {
        this.itemsEl.innerHTML = this.cart.map(item => `
          <div class="cart-item" data-id="${item.id}" data-variant="${item.variant || ''}">
            <div class="cart-item__img" style="background:var(--color-surface);display:flex;align-items:center;justify-content:center;font-size:28px">${item.img || '👗'}</div>
            <div class="cart-item__info">
              <div class="cart-item__name">${item.name}</div>
              <div class="cart-item__variant type-small">${item.variant || ''}</div>
              <div class="cart-item__footer">
                <div class="qty-control">
                  <button class="qty-btn" data-qty="dec" aria-label="Decrease">−</button>
                  <div class="qty-value">${item.qty}</div>
                  <button class="qty-btn" data-qty="inc" aria-label="Increase">+</button>
                </div>
                <div class="cart-item__price">${formatPrice(item.price * item.qty)}</div>
                <button class="cart-item__remove" data-qty="rem" aria-label="Remove">×</button>
              </div>
            </div>
          </div>`).join('');

        $$('.cart-item', this.itemsEl).forEach(el => {
          const id = el.dataset.id;
          const variant = el.dataset.variant;
          el.querySelector('[data-qty="inc"]').addEventListener('click', () => this.updateQty(id, variant, 1));
          el.querySelector('[data-qty="dec"]').addEventListener('click', () => this.updateQty(id, variant, -1));
          el.querySelector('[data-qty="rem"]').addEventListener('click', () => this.remove(id, variant));
        });
      }
    }

    // Footer
    if (this.footerEl) {
      const tax = Math.round(total * 0.05);
      const ship = total >= FREE_SHIP_THRESHOLD ? 0 : 9900;
      const grand = total + tax + ship;
      const shipText = ship === 0 ? '<span class="text-success">Free</span>' : formatPrice(ship);

      this.footerEl.innerHTML = `
        <div class="cart-totals">
          <div class="cart-totals__row"><span>Subtotal</span><span>${formatPrice(total)}</span></div>
          <div class="cart-totals__row"><span>GST (5%)</span><span>${formatPrice(tax)}</span></div>
          <div class="cart-totals__row"><span>Shipping</span><span>${shipText}</span></div>
          <div class="cart-totals__row cart-totals__row--total"><span>Total</span><span>${formatPrice(grand)}</span></div>
        </div>
        ${this.cart.length > 0 ? `
          <a href="#" class="btn btn-primary w-full" style="display:flex;margin-bottom:12px">Proceed to Checkout</a>
          <a href="#" class="btn btn-secondary w-full" style="display:flex">View Full Cart</a>` : ''}`;
    }

    this.updateBadges();
  }
}

// ============================================================
// WISHLIST
// ============================================================

const WISHLIST_KEY = 'vamas_wishlist_v1';

class Wishlist {
  constructor() {
    this.items = this.load();
    this.badges = $$('.wishlist-badge');
    this.updateAll();
    this.bindGlobal();
  }

  load() {
    try { return new Set(JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []); } catch (e) { return new Set(); }
  }

  save() {
    try { localStorage.setItem(WISHLIST_KEY, JSON.stringify([...this.items])); } catch (e) {}
  }

  toggle(id) {
    if (this.items.has(id)) {
      this.items.delete(id);
      showToast('Removed from wishlist');
    } else {
      this.items.add(id);
      showToast('Added to wishlist ♥', 'success');
    }
    this.save();
    this.updateAll();
  }

  updateAll() {
    $$('[data-wishlist-btn]').forEach(btn => {
      const id = btn.dataset.productId;
      if (id) btn.classList.toggle('is-wishlisted', this.items.has(id));
    });
    const n = this.items.size;
    this.badges.forEach(b => {
      b.textContent = n;
      b.style.display = n === 0 ? 'none' : 'flex';
    });
  }

  bindGlobal() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-wishlist-btn]');
      if (!btn) return;
      e.preventDefault();
      const id = btn.dataset.productId;
      if (id) this.toggle(id);
    });
  }
}

// ============================================================
// SCROLL ANIMATIONS + COUNT-UP
// ============================================================

class ScrollAnimations {
  constructor() {
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.animEls = $$('.animate-on-scroll, .animate-from-left, .animate-from-right, .animate-scale');
    this.countEls = $$('.count-up');

    if (this.reduced) {
      this.animEls.forEach(el => el.classList.add('is-visible'));
      this.countEls.forEach(el => this.finishCount(el));
      return;
    }

    this.observe();
    this.observeStagger();
  }

  observe() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-visible');
        if (en.target.classList.contains('count-up')) this.countUp(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    this.animEls.forEach(el => io.observe(el));
    this.countEls.forEach(el => io.observe(el));
  }

  observeStagger() {
    $$('.stagger-children').forEach(parent => {
      Array.from(parent.children).forEach(child => child.classList.add('animate-on-scroll'));

      const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (!en.isIntersecting) return;
          Array.from(en.target.children).forEach(child => child.classList.add('is-visible'));
          io.unobserve(en.target);
        });
      }, { threshold: 0.08 });

      io.observe(parent);
    });
  }

  countUp(el) {
    const target = parseFloat(el.dataset.target || el.textContent) || 0;
    const dur = parseInt(el.dataset.duration || '1800');
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const t0 = performance.now();

    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(ease * target).toLocaleString('en-IN') + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  finishCount(el) {
    const target = parseFloat(el.dataset.target || el.textContent) || 0;
    el.textContent = (el.dataset.prefix || '') + target.toLocaleString('en-IN') + (el.dataset.suffix || '');
  }
}

// ============================================================
// PRODUCT PAGE
// ============================================================

class ProductPage {
  constructor(cartDrawer) {
    this.page = $('.product-page');
    if (!this.page) return;
    this.cart = cartDrawer;
    this.thumbs = $$('.thumb', this.page);
    this.mainImg = this.page.querySelector('.product-gallery__main img');
    this.lightbox = $('.lightbox');
    this.stickyAtc = $('.sticky-atc');
    this.currentIdx = 0;

    this.initThumbs();
    this.initLightbox();
    this.initStickyAtc();
    this.initAccordion();
    this.initVariants();
    this.initAtcButtons();
  }

  initThumbs() {
    this.thumbs.forEach((th, i) => {
      th.addEventListener('click', () => this.setThumb(i));
    });
  }

  setThumb(idx) {
    this.currentIdx = idx;
    this.thumbs.forEach((t, i) => t.classList.toggle('is-active', i === idx));
    const src = this.thumbs[idx]?.querySelector('img')?.src;
    if (src && this.mainImg) this.mainImg.src = src;
  }

  initLightbox() {
    const container = this.page.querySelector('.product-gallery__main');
    if (!container || !this.lightbox) return;

    const lbImg = this.lightbox.querySelector('.lightbox__img');
    const close = () => { this.lightbox.classList.remove('is-open'); document.body.style.overflow = ''; };

    container.addEventListener('click', () => {
      if (lbImg && this.mainImg) lbImg.src = this.mainImg.src;
      this.lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });

    this.lightbox.querySelector('.lightbox__close')?.addEventListener('click', close);
    this.lightbox.addEventListener('click', (e) => { if (e.target === this.lightbox) close(); });

    this.lightbox.querySelector('.lightbox__prev')?.addEventListener('click', () => {
      this.navigateLightbox(-1, lbImg);
    });
    this.lightbox.querySelector('.lightbox__next')?.addEventListener('click', () => {
      this.navigateLightbox(1, lbImg);
    });

    document.addEventListener('keydown', (e) => {
      if (!this.lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') this.navigateLightbox(1, lbImg);
      if (e.key === 'ArrowLeft') this.navigateLightbox(-1, lbImg);
    });
  }

  navigateLightbox(dir, lbImg) {
    const total = this.thumbs.length;
    if (!total) return;
    this.currentIdx = (this.currentIdx + dir + total) % total;
    this.setThumb(this.currentIdx);
    if (lbImg && this.mainImg) lbImg.src = this.mainImg.src;
  }

  initStickyAtc() {
    if (!this.stickyAtc) return;
    const form = this.page.querySelector('.product-atc-form');
    if (!form) return;

    const io = new IntersectionObserver((entries) => {
      this.stickyAtc.classList.toggle('is-visible', !entries[0].isIntersecting);
    });
    io.observe(form);
  }

  initAccordion() {
    $$('.accordion__trigger', this.page).forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.accordion__item');
        if (!item) return;
        const wasOpen = item.classList.contains('is-open');
        $$('.accordion__item.is-open', this.page).forEach(i => i.classList.remove('is-open'));
        if (!wasOpen) item.classList.add('is-open');
      });
    });
  }

  initVariants() {
    $$('.size-btn', this.page).forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('is-unavailable')) return;
        const group = btn.closest('.size-btns');
        $$('.size-btn', group).forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const label = btn.closest('.variant-group')?.querySelector('.variant-group__selected');
        if (label) label.textContent = btn.textContent.trim();
      });
    });

    $$('.swatch', this.page).forEach(sw => {
      sw.addEventListener('click', () => {
        const group = sw.closest('[class*="swatch"]')?.parentElement;
        if (group) $$('.swatch', group).forEach(s => s.classList.remove('is-active'));
        sw.classList.add('is-active');
      });
    });
  }

  initAtcButtons() {
    $$('[data-atc-btn]', this.page).forEach(btn => {
      btn.addEventListener('click', () => {
        if (!this.cart) return;
        const size = this.page.querySelector('.size-btn.is-active')?.textContent?.trim() || 'M';
        const name = this.page.querySelector('.product-info__title')?.textContent?.trim() || 'Vamas Blouse';
        const rawPrice = this.page.querySelector('[data-product-price]')?.dataset?.productPrice || '380000';

        this.cart.addItem({
          id: 'prod-' + name.slice(0, 6).replace(/\s/g, '').toLowerCase(),
          name,
          variant: 'Size: ' + size,
          price: parseInt(rawPrice, 10) || 380000,
          qty: 1,
          img: '👗',
        });
      });
    });
  }
}

// ============================================================
// COLLECTION FILTER
// ============================================================

class CollectionFilter {
  constructor() {
    this.wrap = $('.collection-filter');
    if (!this.wrap) return;
    this.pills = $$('.filter-pill', this.wrap);
    this.cards = $$('.product-card');
    this.active = new Set(['all']);
    this.bindPills();
  }

  bindPills() {
    this.pills.forEach(pill => {
      pill.addEventListener('click', () => {
        const f = pill.dataset.filter;
        if (!f) return;

        if (f === 'all' || pill.classList.contains('filter-pill--clear')) {
          this.active.clear();
          this.active.add('all');
        } else {
          this.active.delete('all');
          this.active.has(f) ? this.active.delete(f) : this.active.add(f);
          if (this.active.size === 0) this.active.add('all');
        }

        this.updatePills();
        this.applyFilters();
      });
    });
  }

  updatePills() {
    this.pills.forEach(p => {
      const f = p.dataset.filter;
      p.classList.toggle('is-active', f === 'all'
        ? this.active.has('all')
        : this.active.has(f));
    });
  }

  applyFilters() {
    const isAll = this.active.has('all');
    this.cards.forEach(card => {
      const tags = (card.dataset.tags || '').split(',').map(t => t.trim());
      const show = isAll || [...this.active].some(f => tags.includes(f));

      if (show) {
        card.style.display = '';
        requestAnimationFrame(() => {
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        });
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.96)';
        card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        setTimeout(() => { if (card.style.opacity === '0') card.style.display = 'none'; }, 280);
      }
    });
  }
}

// ============================================================
// QUICK-ADD (collection grids)
// ============================================================

function initQuickAdd(cart) {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.quick-add-btn');
    if (!btn || !cart) return;
    const card = btn.closest('.product-card');
    if (!card) return;

    const name = card.querySelector('.product-card__name')?.textContent?.trim() || 'Blouse';
    const rawPrice = card.querySelector('[data-price]')?.dataset?.price
      || card.querySelector('.product-card__price')?.textContent?.replace(/[^\d]/g, '') + '00'
      || '320000';
    const id = card.dataset.productId || 'qa-' + Math.random().toString(36).slice(2, 7);

    cart.addItem({ id, name, variant: 'Default', price: parseInt(rawPrice, 10) || 320000, qty: 1, img: '👗' });
  });
}

// ============================================================
// NEWSLETTER
// ============================================================

function initNewsletter() {
  const form = $('.newsletter__form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (!input?.value) return;
    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Subscribing…'; }

    setTimeout(() => {
      form.style.display = 'none';
      const success = $('.newsletter__success');
      if (success) success.classList.add('is-visible');
      showToast('Welcome to the Vamas family!', 'success');
    }, 900);
  });
}

// ============================================================
// MOBILE NAV SUBMENUS
// ============================================================

function initMobileSubmenus() {
  $$('.mobile-nav__link[data-has-submenu]').forEach(link => {
    const sub = link.nextElementSibling;
    if (!sub?.classList.contains('mobile-nav__sub')) return;

    sub.style.cssText = 'max-height:0;overflow:hidden;transition:max-height 0.3s ease';

    link.addEventListener('click', (e) => {
      e.preventDefault();
      const open = link.classList.toggle('is-open');
      sub.style.maxHeight = open ? sub.scrollHeight + 'px' : '0';
    });
  });
}

// ============================================================
// HERO PARALLAX
// ============================================================

function initHeroParallax() {
  const bg = $('.hero__bg');
  if (!bg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hero = bg.closest('.hero');
  if (!hero) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight * 1.2) {
      bg.style.transform = `translateY(${y * 0.22}px)`;
    }
  }, { passive: true });
}

// ============================================================
// LAZY IMAGES
// ============================================================

function initLazyImages() {
  const imgs = $$('img[data-src]');
  if (!imgs.length) return;

  if ('loading' in HTMLImageElement.prototype) {
    imgs.forEach(img => { img.src = img.dataset.src; img.removeAttribute('data-src'); });
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.src = en.target.dataset.src;
      en.target.removeAttribute('data-src');
      io.unobserve(en.target);
    });
  }, { rootMargin: '200px' });

  imgs.forEach(img => io.observe(img));
}

// ============================================================
// SMOOTH SCROLL
// ============================================================

function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
  new PageProgressBar();

  const announcementBar = new AnnouncementBar();  // eslint-disable-line no-unused-vars
  const header = new Header();                    // eslint-disable-line no-unused-vars
  const cart = new CartDrawer();
  const wishlist = new Wishlist();                // eslint-disable-line no-unused-vars
  const scroll = new ScrollAnimations();          // eslint-disable-line no-unused-vars
  const productPage = new ProductPage(cart);      // eslint-disable-line no-unused-vars
  const filter = new CollectionFilter();          // eslint-disable-line no-unused-vars

  initQuickAdd(cart);
  initNewsletter();
  initMobileSubmenus();
  initHeroParallax();
  initLazyImages();
  initSmoothScroll();

  // Generic add-to-cart demo button handler
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add-demo]');
    if (!btn) return;
    cart.addItem({
      id: btn.dataset.addDemo || 'demo-' + Date.now(),
      name: btn.dataset.name || 'Vamas Designer Blouse',
      variant: btn.dataset.variant || 'Size: M',
      price: parseInt(btn.dataset.price || '380000', 10),
      qty: 1,
      img: '👗',
    });
  });

  // Expose to window for inline onclick use
  window.VamasCart = cart;
  window.VamasWishlist = wishlist;

  console.log(
    '%c✦ VAMAS.IN %c— Crafted with love',
    'color:#6B2D8B;font-weight:700;font-size:16px',
    'color:#D4A853;font-size:13px'
  );
});
