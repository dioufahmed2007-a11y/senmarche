/* ═══════════════════════════════════════════════════════════════
   SEN·MARCHÉ — collections.js
   Affiche les collections (en cours, à venir, passées) dans #se-collections.
   Les styles sont dans marche-ui.css (classes .dcol-*).
   <div id="se-collections" data-header="off"></div> masque le titre du module.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const WA_NUMBER = '221778038874';
  const SUPA = 'https://axgpohmhzmdgozndlntj.supabase.co/storage/v1/object/public/photos/';

  const esc = s => (s === null || s === undefined) ? '' : String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad2 = n => String(n).padStart(2, '0');
  const fprix = n => Math.round(n || 0).toLocaleString('fr-FR').replace(/\u202f/g, ' ') + ' FCFA';
  const imgUrl = url => !url ? '' : (url.startsWith('http') ? url : SUPA + url);
  const bg = url => { const u = imgUrl(url); return u ? ` style="background-image:url('${esc(u)}')"` : ''; };

  function countdownParts(target) {
    const diff = new Date(target) - new Date();
    if (diff <= 0) return null;
    return { j: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) };
  }

  async function loadCollections() {
    try {
      if (!window.SE || !SE.sb) return [];
      const { data: collections, error } = await SE.sb.from('collections').select('*').neq('statut', 'epuisee').order('statut', { ascending: true }).order('date_lancement', { ascending: true });
      if (error) throw error;
      if (!collections || !collections.length) return [];

      return await Promise.all(collections.map(async col => {
        try {
          const { data: liens } = await SE.sb.from('collection_articles').select('article_ref').eq('collection_id', col.id).limit(4);
          if (!liens || !liens.length) return { ...col, articles: [] };
          const { data: articles, error: artErr } = await SE.sb.from('articles').select('reference, nom, prix_vente_fcfa, photo_url, quantite').in('reference', liens.map(l => l.article_ref)).limit(4);
          if (artErr) throw artErr;
          return { ...col, articles: articles || [] };
        } catch { return { ...col, articles: [] }; }
      }));
    } catch (e) {
      console.warn('[Collections] Erreur chargement:', e.message);
      return [];
    }
  }

  function renderAVenir(col) {
    const cd = col.date_lancement ? countdownParts(col.date_lancement) : null;
    const pieces = (col.articles || []).slice(0, 2).map(a => `<div${bg(a.photo_url)}></div>`).join('') || '<div></div><div></div>';
    const cdHtml = cd ? `<div class="dcol-cd" data-cdwrap="${esc(col.id)}">
        <div><b data-cd="j">${pad2(cd.j)}</b><small>Jours</small></div><div><b data-cd="h">${pad2(cd.h)}</b><small>Heures</small></div>
        <div><b data-cd="m">${pad2(cd.m)}</b><small>Min</small></div><div><b data-cd="s">${pad2(cd.s)}</b><small>Sec</small></div></div>` : '';
    const wa = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Bonjour, je veux être notifié en avant-première pour la collection "${col.nom}" de SenMarché.`)}`;
    return `<article class="dcol dcol-soon rv">
      <div class="dcol-teaser">${pieces}</div>
      <div>
        <span class="dcol-tag">✦ Bientôt</span>
        <h3 class="dcol-name">${esc(col.nom)}</h3>
        ${col.description ? `<p class="dcol-desc">${esc(col.description)}</p>` : ''}
        ${cdHtml}
        <a href="${wa}" class="btn-s btn-wa" target="_blank" rel="noopener">Être notifié en avant-première</a>
      </div></article>`;
  }

  function renderEnCours(col) {
    const arts = (col.articles || []).slice(0, 3).map(a => {
      const q = a.quantite || 0;
      const stock = q > 0 && q <= 3 ? `<span class="dcol-art-stock low">${q} restant${q > 1 ? 's' : ''}</span>` : (q > 3 ? '<span class="dcol-art-stock ok">En stock</span>' : '');
      return `<a href="produit.html?ref=${esc(a.reference)}" class="dcol-art"><div class="dcol-art-img"${bg(a.photo_url)}></div>
        <div><div class="dcol-art-name">${esc(a.nom)}</div><div class="dcol-art-prix">${fprix(a.prix_vente_fcfa)}</div>${stock}</div></a>`;
    }).join('');
    return `<article class="dcol dcol-live rv">
      <div class="dcol-head"><div><span class="dcol-tag dcol-tag--live">● Disponible maintenant</span>
        <h3 class="dcol-name">${esc(col.nom)}</h3>${col.description ? `<p class="dcol-desc">${esc(col.description)}</p>` : ''}</div>
        <a href="collection.html?id=${esc(col.id)}" class="btn-s">Voir la collection →</a></div>
      ${arts ? `<div class="dcol-arts">${arts}</div>` : ''}
      <p class="dcol-note">Stock limité · Paiement à la récupération</p></article>`;
  }

  function renderPassee(col) {
    const n = (col.articles || []).reduce((s, a) => s + (a.quantite || 0), 0);
    if (n === 0) return '';
    return `<article class="dcol dcol-past rv"><div class="dcol-past-row"><div>
      <span class="dcol-tag dcol-tag--past">Collection précédente</span>
      <h4 class="dcol-past-name">${esc(col.nom)}</h4>
      <p class="dcol-past-stock">${n} pièce${n > 1 ? 's' : ''} encore disponible${n > 1 ? 's' : ''}</p></div>
      <a href="collection.html?id=${esc(col.id)}" class="btn-s btn-dark">Voir les pièces →</a></div></article>`;
  }

  function renderFallback() {
    return `<div class="empty-note"><h3 class="t-big">Pas de collection <i>pour le moment</i></h3>
      <p>Les prochaines arrivent bientôt. En attendant, tout est dans le catalogue.</p>
      <a href="catalogue.html" class="btn-s">Voir le catalogue</a></div>`;
  }

  function renderSection(collections, opts = {}) {
    const avenir = collections.filter(c => c.statut === 'a_venir');
    const enCours = collections.filter(c => c.statut === 'en_cours');
    const passees = collections.filter(c => c.statut === 'passee');
    if (!avenir.length && !enCours.length && !passees.length) return renderFallback();

    const list = [...enCours.map(renderEnCours), ...avenir.map(renderAVenir), ...passees.map(renderPassee).filter(Boolean)].join('');
    const header = opts.header === false ? '' : `<div class="sh"><span class="sh-n">✦</span><h2>Collections &amp; <i>drops</i></h2></div>`;
    return `${header}<div class="dcol-list">${list}</div>`;
  }

  function startCountdowns(container, collections) {
    const avenir = collections.filter(c => c.statut === 'a_venir' && c.date_lancement);
    if (!avenir.length) return;
    setInterval(() => {
      avenir.forEach(col => {
        const cd = countdownParts(col.date_lancement); if (!cd) return;
        const wrap = container.querySelector(`[data-cdwrap="${col.id}"]`); if (!wrap) return;
        ['j', 'h', 'm', 's'].forEach(k => { const el = wrap.querySelector(`[data-cd="${k}"]`); if (el) el.textContent = pad2(cd[k]); });
      });
    }, 1000);
  }

  async function mount(containerId = 'se-collections') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const opts = { header: container.dataset.header !== 'off' };
    container.innerHTML = '<div class="skel" style="height:280px;border-radius:22px"></div>';
    try {
      const collections = await loadCollections();
      container.innerHTML = renderSection(collections, opts);
      const al = document.getElementById('archives-link'); if (al) al.hidden = !collections.some(c => c.statut === 'passee');
      startCountdowns(container, collections);
    } catch (e) {
      console.warn('[SE Collections] Erreur:', e);
      container.innerHTML = renderFallback();
    }
  }

  window.SE_Collections = { mount, loadCollections, renderSection };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mount());
  else mount();
})();
