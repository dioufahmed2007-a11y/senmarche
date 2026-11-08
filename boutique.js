/* ═══════════════════════════════════════════════════════════════
   SENMARCHÉ — boutique.js v2
   Moteur commun des boutiques Fille (Tenues, Cosmétiques, Soins).
   Chaque page = une fiche de réglages passée à Boutique.init({...}).
   Une boutique a deux vues :
     • la VITRINE (courte) : rayons, bons plans, coffrets comparés, indispensables
     • la LISTE (complète) : filtres + flux, quand la cliente le demande
   ═══════════════════════════════════════════════════════════════ */
(() => {
'use strict';
const $ = id => document.getElementById(id), E = s => SE.esc(s);
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const price = a => a.prix_vente_fcfa || 0;
const isDeal = a => a.prix_min_fcfa && a.prix_min_fcfa > price(a);
const pct = a => Math.round((1 - price(a) / a.prix_min_fcfa) * 100);
const link = a => 'produit.html?ref=' + encodeURIComponent(a.reference);
const PACK = /coffret|\bpack\b|\blot de|\bkit\b|routine/i;
const FL = '<div class="fl">' + "<svg class=\"fleuron\" viewBox=\"0 0 220 28\" xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"true\"><g stroke=\"currentColor\" stroke-width=\"1.2\" fill=\"none\"><path d=\"M8 14H84\"/><path d=\"M136 14H212\"/><path d=\"M84 14l5-3 5 3-5 3z\" fill=\"currentColor\"/><path d=\"M136 14l-5-3-5 3 5 3z\" fill=\"currentColor\"/></g><g transform=\"translate(110 14)\"><ellipse cx=\"0\" cy=\"-6.5\" rx=\"3.6\" ry=\"6.5\" transform=\"rotate(0)\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"/><ellipse cx=\"0\" cy=\"-6.5\" rx=\"3.6\" ry=\"6.5\" transform=\"rotate(72)\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"/><ellipse cx=\"0\" cy=\"-6.5\" rx=\"3.6\" ry=\"6.5\" transform=\"rotate(144)\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"/><ellipse cx=\"0\" cy=\"-6.5\" rx=\"3.6\" ry=\"6.5\" transform=\"rotate(216)\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"/><ellipse cx=\"0\" cy=\"-6.5\" rx=\"3.6\" ry=\"6.5\" transform=\"rotate(288)\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"/><circle r=\"2.4\" fill=\"currentColor\"/></g><circle cx=\"20\" cy=\"14\" r=\"2\" fill=\"currentColor\"/><circle cx=\"200\" cy=\"14\" r=\"2\" fill=\"currentColor\"/></svg>" + '</div>';
const real = a => a && a.photo_url && !/placehold\.co/.test(a.photo_url);
const B = window.Boutique = { all: [] };

/* Coffrets : on retrouve les produits cités dans la description pour comparer avec les vrais prix */
const comps = (p, all) => { const d = norm(p.description || ''); return all.filter(a => a !== p && norm(a.nom).length > 5 && d.includes(norm(a.nom))); };
const isPack = (a, all) => PACK.test(a.nom || '') || (/ensemble/i.test(a.nom || '') && comps(a, all).length >= 2);
function packHtml(p, all) {
  const c = comps(p, all), sum = c.reduce((t, a) => t + price(a), 0), ok = c.length >= 2 && sum > price(p);
  return '<a class="pack" href="' + link(p) + '"><span class="pi"><img loading="lazy" src="' + E(SE.imgUrl(p.photo_url, 500)) + '" alt=""></span><span class="pt"><span class="tag">✿ Offre</span><b>' + E(p.nom) + '</b>' +
    (ok ? '<span class="cmp"><span>Séparément <s>' + SE.fprix(sum) + '</s></span><span>Ensemble <strong>' + SE.fprix(price(p)) + '</strong></span></span><span class="save">Tu économises ' + SE.fprix(sum - price(p)) + ' (' + Math.round((sum - price(p)) / sum * 100) + ' %)</span><small>Contient : ' + c.map(a => E(a.nom)).join(' + ') + '</small>' : '<span class="fp2">' + SE.fprix(price(p)) + '</span><small>' + E(p.description || '') + '</small>') + '</span></a>';
}
B.util = { isPack, packHtml, isDeal, pct, price, link };

const initInner = function (cfg) {
  const PAGE = 14, parts = cfg.parts || null, PK = 'se_part_' + cfg.key;
  const S = { q: '', ray: null, sort: 'recent', max: null, shown: PAGE, part: null, mode: 'vitrine' };
  let ALL = [], lastKey = null, lastShown = 0;
  try { const v = localStorage.getItem(PK); if (parts && parts.some(p => p.k === v)) S.part = v; } catch (e) {}
  const HC = {}, card = a => HC[a.reference] || (HC[a.reference] = SE.productCard(a));
  const txt = a => (a.nom || '') + ' ' + ((a.categorie && a.categorie.nom) || '') + ' ' + (a.description || '');
  const rtest = (a, r) => r.fn ? r.fn(a) : r.re.test(txt(a));
  const curRays = () => parts ? (S.part ? parts.find(p => p.k === S.part).rayons : []) : (cfg.rayons || []);
  const inPart = a => !parts || a._p === S.part;
  const items = () => ALL.filter(inPart);

  $('app').innerHTML =
    '<section class="bh"><div class="pw"><div class="bc"><a href="fille.html">Fille</a><i>/</i><span>' + cfg.title + '</span></div>' +
    '<h1>' + cfg.title + ' <em>' + cfg.em + '</em></h1><p class="lead">' + cfg.lead + '</p>' +
    (parts ? '<div class="parts" id="parts"></div>' : '') +
    '<div class="hs"><input id="q" type="search" placeholder="' + E(cfg.placeholder || 'Chercher…') + '" autocomplete="off" aria-label="Chercher"></div></div></section>' +
    (cfg.extraHtml || '') +
    '<div class="pw" id="view"></div>' +
    '<div id="listing" class="hid"><div class="tb" id="tb"><div class="pw"><div class="row"><button class="chip back" id="back">← Vitrine</button><div class="chips" id="chips"></div><select class="sel" id="sort" aria-label="Trier"><option value="recent">Nouveautés</option><option value="asc">Prix ↑</option><option value="desc">Prix ↓</option></select></div></div></div>' +
    '<div class="pw"><p class="count" id="count"></p><div class="p-grid" id="grid"></div><div class="more hid" id="more" aria-hidden="true"></div></div></div>' +
    '<div class="pw"><section class="cross"><div class="sec" style="margin-top:0">' + FL + '<h2>Découvre <em>aussi</em></h2></div><div class="cc">' + (cfg.cross || []).map(c => '<a class="c" href="' + c.href + '"><i>→</i><b>' + c.t + '</b><span>' + c.s + '</span></a>').join('') + '</div></section></div>';

  function list() {
    const r = curRays().find(x => x.k === S.ray);
    const l = items().filter(a => (!S.ray || (r && rtest(a, r))) && (!S.max || price(a) <= S.max) && (!S.q || txt(a).toLowerCase().includes(S.q.toLowerCase())));
    if (S.sort === 'asc') l.sort((a, b) => price(a) - price(b));
    if (S.sort === 'desc') l.sort((a, b) => price(b) - price(a));
    return l;
  }
  const sec = (t, sub) => '<section class="sec">' + FL + '<h2>' + t + '</h2>' + (sub ? '<p>' + sub + '</p>' : '') + '</section>';
  const hrow = l => '<div class="hrow">' + l.map(card).join('') + '</div>';

  /* ── VITRINE ── */
  function vitrine() {
    const v = $('view');
    if (parts && !S.part) {
      const AR = window.FilleArt ? { abayas: FilleArt.tenues, tendances: FilleArt.tendances } : {};
      v.innerHTML = sec('Par quoi <em>commencer</em> ?', 'Choisis ta partie, tu pourras changer à tout moment.') + '<div class="cats two">' + parts.map(p => { const l = ALL.filter(a => a._p === p.k); return '<button class="cat" data-part="' + p.k + '"><div class="cat-art">' + (AR[p.k] ? AR[p.k]() : '<span class="glyph">✿</span>') + '</div><div class="cat-body"><span class="kick2">' + l.length + ' article' + (l.length > 1 ? 's' : '') + '</span><h3>' + p.t + '</h3><p>' + p.s + '</p><span class="cat-go">Choisir <small>→</small></span></div></button>'; }).join('') + '</div>';
      v.querySelectorAll('[data-part]').forEach(b => b.onclick = () => setPart(b.dataset.part));
      return;
    }
    const its = items(), rs = curRays().map(r => ({ r, l: its.filter(a => rtest(a, r)) })).filter(x => x.l.length);
    const packs = its.filter(a => isPack(a, ALL)), deals = its.filter(a => isDeal(a) && !isPack(a, ALL)).sort((a, b) => pct(b) - pct(a));
    const ess = its.filter(a => !isPack(a, ALL)).slice(0, 8);
    let h = '';
    if (!its.length) h = '<div class="empty" style="margin-top:2rem"><h3>Bientôt de nouvelles pièces</h3><p>Cette boutique se prépare. Dis-nous ce que tu cherches et on te la déniche.</p><a class="btn-p" href="demande-speciale.html">Faire une demande spéciale</a></div>';
    else {
      const groups = [...new Set(rs.map(x => x.r.g || ''))];
      h += sec('Nos <em>rayons</em>', 'Touche un rayon pour tout voir.');
      groups.forEach(g => {
        const gr = rs.filter(x => (x.r.g || '') === g);
        if (g) h += '<p class="glabel">' + g + '</p>';
        if (gr[0].r.pill) h += '<div class="pillrow">' + gr.map(x => '<button class="pill" data-k="' + x.r.k + '">' + x.r.t + ' <small>' + x.l.length + '</small></button>').join('') + '</div>';
        else h += '<div class="rays">' + gr.map(x => { const f = x.l.find(real); return '<button class="ray" data-k="' + x.r.k + '"><span class="a">' + (f ? '<img loading="lazy" src="' + E(SE.imgUrl(f.photo_url, 400)) + '" alt="">' : '✿') + '</span><b>' + x.r.t + '</b><small>' + x.l.length + ' article' + (x.l.length > 1 ? 's' : '') + '</small></button>'; }).join('') + '</div>';
      });
      if (deals.length) h += sec('Bons <em>plans</em>', 'Des prix qui font plaisir.') + hrow(deals.slice(0, 8));
      if (packs.length) h += sec('Coffrets &amp; <em>offres</em>', 'Plus de plaisir, un meilleur prix : compare.') + '<div class="packs">' + packs.slice(0, 4).map(p => packHtml(p, ALL)).join('') + '</div>';
      if (ess.length) h += sec('Les <em>indispensables</em>', 'Nos pièces les plus récentes.') + '<div class="p-grid vit">' + ess.map(card).join('') + '</div>';
      h += '<p class="all"><button class="btn-p" id="seeall">Voir les ' + its.length + ' articles</button></p>';
    }
    v.innerHTML = h;
    v.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { S.ray = b.dataset.k; toListe(); });
    const sa = $('seeall'); if (sa) sa.onclick = () => { S.ray = null; toListe(); };
  }

  /* ── LISTE ── */
  function units(l) {
    const u = [], deals = items().filter(isDeal).sort((a, b) => pct(b) - pct(a)), plain = !!(S.q || S.ray || S.max) || S.sort !== 'recent';
    l.forEach((a, i) => {
      u.push({ t: 'p', a }); if (plain) return;
      if (i === 5 && (deals[0] || l[0])) u.push({ t: 'feat', a: deals[0] || l[0] });
      if (i === 11) u.push({ t: 'trust' });
      if (i === 17) u.push({ t: 'ask' });
    });
    return u;
  }
  function unitHtml(u) {
    if (u.t === 'p') return card(u.a);
    if (u.t === 'feat') { const a = u.a, left = a.quantite || 0; return '<div class="ban feat"><a class="im" href="' + link(a) + '"><img loading="lazy" src="' + E(SE.imgUrl(a.photo_url, 700)) + '" alt="' + E(a.nom) + '"></a><div class="tx"><span class="tag">✿ Coup de cœur</span><h3>' + E(a.nom) + '</h3><div class="fp"><b>' + SE.fprix(price(a)) + '</b>' + (isDeal(a) ? '<s>' + SE.fprix(a.prix_min_fcfa) + '</s>' : '') + '</div>' + (left > 0 && left <= 5 ? '<span class="low">Plus que ' + left + ' en stock</span>' : '') + '<a class="btn-p on-plum" href="' + link(a) + '">Je le veux</a></div></div>'; }
    if (u.t === 'trust') return '<div class="ban plain"><div class="trust"><div><i>🏠</i><span><b>Retrait ou livraison</b><br>Tu choisis.</span></div><div><i>💸</i><span><b>Paiement à la récupération</b><br>Espèces, Wave ou Orange Money.</span></div><div><i>👀</i><span><b>Tu vérifies avant de payer</b><br>Zéro mauvaise surprise.</span></div></div></div>';
    if (u.t === 'ask') return '<div class="ban cta"><h3>Tu cherches <em>autre chose</em> ?</h3><p>Une pièce, une teinte, une marque précise ? On te la déniche.</p><a class="btn-p on-plum" href="demande-speciale.html">Faire une demande spéciale</a></div>';
    return '';
  }
  function renderListe() {
    const l = list(), n = l.length, g = $('grid');
    $('count').innerHTML = '<b>' + SE.fnum(n) + '</b> article' + (n > 1 ? 's' : '');
    if (!n) { lastKey = null; $('more').classList.add('hid'); g.innerHTML = '<div class="empty"><h3>Rien ne correspond…</h3><p>Essaie un autre mot ou un autre filtre.</p><button class="btn-g" id="reset">Retour à la vitrine</button></div>'; $('reset').onclick = toVitrine; return; }
    const u = units(l), key = u.map(x => x.t + (x.a ? x.a.reference : '')).join('|');
    if (key === lastKey && S.shown >= lastShown) { if (S.shown > lastShown) g.insertAdjacentHTML('beforeend', u.slice(lastShown, S.shown).map(unitHtml).join('')); }
    else { g.innerHTML = u.slice(0, S.shown).map(unitHtml).join(''); if (lastKey !== null && !matchMedia('(prefers-reduced-motion:reduce)').matches) g.animate([{ opacity: .4 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' }); }
    lastKey = key; lastShown = Math.min(S.shown, u.length);
    $('more').classList.toggle('hid', u.length <= S.shown);
  }
  function chips() {
    const its = items(), rs = curRays().filter(r => its.some(a => rtest(a, r)));
    $('chips').innerHTML = '<button class="chip' + (!S.ray && !S.max ? ' on' : '') + '" data-k="">Tout</button>' + rs.map(r => '<button class="chip' + (S.ray === r.k ? ' on' : '') + '" data-k="' + r.k + '">' + r.t + '</button>').join('') + [5000, 10000, 20000].map((m, i) => '<button class="chip' + (i === 0 ? ' sep' : '') + (S.max === m ? ' on' : '') + '" data-m="' + m + '">Moins de ' + SE.fnum(m) + '</button>').join('');
    $('chips').querySelectorAll('.chip').forEach(b => b.onclick = () => { if (b.dataset.m) S.max = S.max === +b.dataset.m ? null : +b.dataset.m; else S.ray = b.dataset.k || null; S.shown = PAGE; chips(); renderListe(); });
  }

  /* ── Navigation entre vues ── */
  function show() {
    const liste = S.mode === 'liste' && !(parts && !S.part);
    $('view').classList.toggle('hid', liste); $('listing').classList.toggle('hid', !liste);
    if (liste) { chips(); renderListe(); } else vitrine();
  }
  function toListe() { S.mode = 'liste'; S.shown = PAGE; show(); const t = $('listing').getBoundingClientRect().top + scrollY - 70; scrollTo({ top: t > 0 ? t : 0, behavior: 'smooth' }); }
  function toVitrine() { Object.assign(S, { mode: 'vitrine', ray: null, q: '', max: null, sort: 'recent', shown: PAGE }); $('q').value = ''; $('sort').value = 'recent'; show(); }
  function setPart(k) { S.part = k; try { localStorage.setItem(PK, k); } catch (e) {} Object.assign(S, { mode: 'vitrine', ray: null, q: '', max: null }); parts_ui(); show(); }
  function parts_ui() { if (!parts) return; $('parts').innerHTML = parts.map(p => '<button class="part' + (S.part === p.k ? ' on' : '') + '" data-p="' + p.k + '">' + p.t + '</button>').join(''); $('parts').querySelectorAll('.part').forEach(b => b.onclick = () => setPart(b.dataset.p)); }
  function loadMore() { const m = $('more'); if (m.classList.contains('hid') || S.mode !== 'liste') return; S.shown += PAGE; renderListe(); requestAnimationFrame(() => { if (!m.classList.contains('hid') && m.getBoundingClientRect().top < innerHeight + 900) loadMore(); }); }

  (async () => { try {
    await new Promise(r => setTimeout(r, 50));
    const arts = await SE.Articles.load();
    const inCat = a => { const n = (a.categorie && a.categorie.nom) || ''; return parts ? parts.some(p => p.catRe.test(n)) : cfg.catRe.test(n); };
    ALL = arts.filter(a => inCat(a) && (a.quantite || 0) > 0 && a.etat !== 'Vendu');
    if (parts) ALL.forEach(a => { const p = parts.find(x => x.catRe.test((a.categorie && a.categorie.nom) || '')); a._p = p && p.k; });
    if (cfg.prepare) { try { await cfg.prepare(ALL); } catch (e) { console.warn('prepare:', e); } }
    B.all = ALL; parts_ui(); show();
    let t;
    $('q').oninput = e => { const v = e.target.value.trim(); clearTimeout(t); t = setTimeout(() => { S.q = v; if (v) { if (parts && !S.part) { S.part = parts[0].k; parts_ui(); } S.mode = 'liste'; S.ray = null; S.shown = PAGE; show(); const tp = $('listing').getBoundingClientRect().top + scrollY - 70; scrollTo({ top: tp > 0 ? tp : 0, behavior: 'smooth' }); } else toVitrine(); }, 400); };
    $('sort').onchange = e => { S.sort = e.target.value; S.shown = PAGE; renderListe(); };
    $('back').onclick = toVitrine;
    new IntersectionObserver(es => { if (es[0].isIntersecting) loadMore(); }, { rootMargin: '900px' }).observe($('more'));
    document.addEventListener('error', e => { const x = e.target; if (x.tagName === 'IMG' && !x.dataset.f) { x.dataset.f = 1; x.src = 'https://placehold.co/600x750/f8e9ee/a84863?text=SenMarch%C3%A9'; } }, true);
    if (cfg.onReady) cfg.onReady(ALL, { toListe, S, show });
  } catch (e) { console.error(e); $('view').innerHTML = '<div class="empty" style="margin-top:2rem"><h3>Un souci de chargement</h3><p>' + String(e.message).replace(/</g, '&lt;') + '</p></div>'; } })();
};
B.init = cfg => { try { initInner(cfg); } catch (e) { console.error(e); const a = $('app'); if (a) a.innerHTML = '<div class="pw" style="padding:3rem 0"><h2>La page n’a pas pu s’afficher</h2><p>' + String(e.message).replace(/</g, '&lt;') + '</p></div>'; } };
})();
