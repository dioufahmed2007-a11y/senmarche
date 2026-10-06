/* ═══════════════════════════════════════════════════════════════
   SEN·MARCHÉ — marche-ui.js  (panier coulissant + outils partagés)
   À charger après app.js. Usage : MUI.init();
   ═══════════════════════════════════════════════════════════════ */
window.MUI = (function () {
  'use strict';
  const SUPA = 'https://axgpohmhzmdgozndlntj.supabase.co/storage/v1/object/public/photos/';
  const NOIMG = "var p=this.parentNode;this.remove();p.classList.add('noimg')";

  const esc = s => (s === null || s === undefined) ? '' : String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fprix = n => Math.round(n || 0).toLocaleString('fr-FR') + ' FCFA';

  function imgUrl(u, w = 800) {
    if (!u) return '';
    if (u.startsWith('http')) {
      if (u.includes('unsplash.com')) return `${u}${u.includes('?') ? '&' : '?'}w=${w}&auto=format&fit=crop`;
      return u;
    }
    if (u.startsWith('photo-')) return `https://images.unsplash.com/${u}?w=${w}&auto=format&fit=crop`;
    return SUPA + u;
  }
  /* <img> avec repli sur le fond de marque si la photo ne se charge pas */
  const photo = (u, w, alt, extra = '') => u ? `<img src="${esc(imgUrl(u, w))}" alt="${esc(alt)}" loading="lazy" ${extra} onerror="${NOIMG}">` : '';

  /* ── Panier coulissant ── */
  const cart = {
    open() { document.getElementById('cart-drawer').classList.add('open'); document.getElementById('drawer-overlay').classList.add('open'); document.body.style.overflow = 'hidden'; },
    close() { document.getElementById('cart-drawer').classList.remove('open'); document.getElementById('drawer-overlay').classList.remove('open'); document.body.style.overflow = ''; },
    update() {
      try {
        const items = SE.Cart.all(), body = document.getElementById('drawer-body'), footer = document.getElementById('drawer-footer');
        if (!items || !items.length) { body.innerHTML = '<div class="drawer-empty">Votre panier est vide.</div>'; footer.style.display = 'none'; return; }
        let total = 0;
        body.innerHTML = items.map(i => {
          const a = SE.Articles.cache ? SE.Articles.cache.find(x => x.reference === i.ref) : null;
          const nom = a ? a.nom : i.ref, prix = a ? (a.prix_vente_fcfa || 0) : 0, stock = a ? (a.quantite || 0) : 0;
          total += prix * (i.qte || 1);
          const u = a && a.photo_url ? imgUrl(a.photo_url, 100) : '';
          const pic = u ? `<img src="${esc(u)}" alt="${esc(nom)}" onerror="this.outerHTML='<div class=&quot;drawer-ph&quot;></div>'">` : '<div class="drawer-ph"></div>';
          return `<div class="drawer-item">${pic}<div class="drawer-item-info"><h4>${esc(nom)}</h4><p>${fprix(prix)}</p>
            <div class="drawer-qty-controls"><button class="qty-btn" data-action="dec" data-ref="${esc(i.ref)}">−</button><span class="qty-val">${i.qte || 1}</span>
            <button class="qty-btn" data-action="inc" data-ref="${esc(i.ref)}" ${(i.qte || 1) >= stock ? 'disabled' : ''}>+</button>
            <button class="remove-btn" data-action="rm" data-ref="${esc(i.ref)}">Retirer</button></div></div></div>`;
        }).join('');
        document.getElementById('drawer-total-val').textContent = fprix(total);
        footer.style.display = 'block';
      } catch (e) { console.warn('[MUI] panier', e); }
    },
    add(ref, qte = 1) { SE.Cart.add(ref, qte); badge(); cart.update(); setTimeout(cart.open, 350); }
  };

  function badge() {
    try {
      const n = SE?.Cart?.count?.() ?? 0, b = document.getElementById('cart-count');
      if (b) { b.textContent = n || ''; b.classList.toggle('show', n > 0); }
    } catch (e) {}
  }

  function mountDrawer() {
    if (document.getElementById('cart-drawer')) return;
    document.body.insertAdjacentHTML('beforeend',
      `<div class="drawer-overlay" id="drawer-overlay"></div>
       <div class="cart-drawer" id="cart-drawer"><div class="cart-handle"></div>
         <div class="drawer-head"><h3 class="disp">Panier</h3><button class="drawer-close" id="drawer-close" aria-label="Fermer">×</button></div>
         <div class="cart-drawer-inner" id="drawer-body"><div class="drawer-empty">Votre panier est vide.</div></div>
         <div class="drawer-footer" id="drawer-footer" style="display:none"><div class="drawer-total"><span>Total</span><span id="drawer-total-val">0 FCFA</span></div><a href="panier.html" class="drawer-btn">Voir le panier</a></div>
       </div>`);
    document.getElementById('drawer-overlay').addEventListener('click', cart.close);
    document.getElementById('drawer-close').addEventListener('click', cart.close);
    document.getElementById('drawer-body').addEventListener('click', e => {
      const btn = e.target.closest('[data-action]'); if (!btn) return;
      const ref = btn.dataset.ref, act = btn.dataset.action;
      const item = SE.Cart.all().find(i => i.ref === ref);
      const art = SE.Articles.cache ? SE.Articles.cache.find(x => x.reference === ref) : null;
      const stock = art ? (art.quantite || 0) : 0;
      if (act === 'inc' && item) { if (item.qte < stock) SE.Cart.setQte(ref, item.qte + 1); }
      else if (act === 'dec' && item) { if (item.qte > 1) SE.Cart.setQte(ref, item.qte - 1); else SE.Cart.remove(ref); }
      else if (act === 'rm' && item) SE.Cart.remove(ref);
      badge(); cart.update();
    });
    /* ajout au panier depuis n'importe quel bouton [data-cart-add] */
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-cart-add]'); if (!b) return;
      e.preventDefault(); e.stopPropagation();
      cart.add(b.dataset.cartAdd);
      const old = b.textContent; b.textContent = '✓'; setTimeout(() => { b.textContent = old; }, 1200);
    });
  }

  /* apparition : gérée en CSS (.rv), rien à faire ici */
  function reveal() {}

  /* ── Compte à rebours : remplit [data-cd="j|h|m|s"] dans root ── */
  function countdown(date, root) {
    if (!date || !root) return;
    const target = new Date(date).getTime();
    const set = (k, v) => { const el = root.querySelector(`[data-cd="${k}"]`); if (el) el.textContent = String(v).padStart(2, '0'); };
    function tick() {
      const d = Math.max(0, target - Date.now());
      set('j', Math.floor(d / 86400000)); set('h', Math.floor((d % 86400000) / 3600000));
      set('m', Math.floor((d % 3600000) / 60000)); set('s', Math.floor((d % 60000) / 1000));
    }
    tick(); setInterval(tick, 1000);
  }

  function init() {
    mountDrawer(); badge(); cart.update();
    const nav = document.getElementById('nav');
    if (nav) { const f = () => nav.classList.toggle('scrolled', window.scrollY > 40); window.addEventListener('scroll', f, { passive: true }); f(); }
    document.addEventListener('cart:updated', badge);
    reveal();
  }

  return { esc, fprix, imgUrl, photo, cart, badge, reveal, countdown, init, NOIMG };
})();
