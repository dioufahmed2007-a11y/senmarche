/* ═══════════════════════════════════════════════════════════════
   SENMARCHÉ — fille.js
   Tout l'univers Fille dans UNE seule page (fille.html) :
     fille.html            → l'accueil
     fille.html#tenues     → Tenues (Abayas & Voiles | Tendances)
     fille.html#cosmetiques→ Cosmétiques
     fille.html#soins      → Soins
     fille.html#routine    → Soins, avec la routine perso ouverte
   ═══════════════════════════════════════════════════════════════ */
(() => {
'use strict';
const app = document.getElementById('app');
if (typeof Boutique === 'undefined' || typeof FilleArt === 'undefined') { app.innerHTML = '<div class="pw" style="padding:3rem 0"><h2>Fichier manquant</h2><p>Mets <b>boutique.js</b>, <b>fille-art.js</b> et <b>boutique.css</b> dans le même dossier que fille.html.</p></div>'; return; }
const $ = id => document.getElementById(id), E = s => SE.esc(s), U = Boutique.util;
const FL = '<div class="fl">' + FilleArt.fleuron() + '</div>';

/* ── Soins : fiches + routine perso ── */
/* ── Données : chaque soin a une fiche (table soins_fiches). Sans fiche, on lit le nom et la description. ── */
const F = a => a._f || {}, H = (s, k) => (s || '').split(',').map(x => x.trim()).includes(k), T = a => (a.nom || '') + ' ' + (a.description || '');
async function prepareFiches(all) {
  const m = {};
  try { const { data } = await SE.sb.from('soins_fiches').select('*'); (data || []).forEach(f => m[f.article_reference] = f); } catch (e) {}
  all.forEach(a => a._f = m[a.reference]);
}

/* ── Routine perso (facultative) ── */
const Q = [
  { k: 'peau', t: 'Ta peau ressemble plutôt à…', o: [['grasse', 'Grasse (ça brille)'], ['seche', 'Sèche (ça tiraille)'], ['mixte', 'Mixte'], ['sensible', 'Sensible (ça réagit vite)'], ['nsp', 'Je ne sais pas']] },
  { k: 'souci', t: 'Ton souci principal ?', o: [['imperfections', 'Boutons et imperfections'], ['secheresse', 'Sécheresse, tiraillements'], ['taches', 'Taches et teint terne'], ['sensibilite', 'Rougeurs, sensibilité'], ['soleil', 'Me protéger du soleil'], ['routine', 'Rien de précis, une routine de base']] },
  { k: 'budget', t: 'Ton budget pour la routine ?', o: [['10000', 'Jusqu’à 10 000 FCFA'], ['20000', 'Jusqu’à 20 000 FCFA'], ['0', 'Peu importe']] },
  { k: 'taille', t: 'Tu préfères…', o: [['express', 'Express : 2 à 3 produits'], ['complete', 'Complète : 4 produits']] }
];
const LAB = { grasse: 'peau grasse', seche: 'peau sèche', mixte: 'peau mixte', sensible: 'peau sensible', nsp: 'type de peau non précisé', imperfections: 'imperfections', secheresse: 'sécheresse', taches: 'taches et teint terne', sensibilite: 'rougeurs et sensibilité', soleil: 'protection solaire', routine: 'routine de base' };
const KW = { grasse: /grasse|s[ée]bum|purifiant|imperfection|argile|niacinamide/i, mixte: /mixte|grasse|l[ée]g[èe]re/i, seche: /s[èe]che|nourrissant|riche|karit[ée]/i, sensible: /sensible|apais|rougeur|doux|douce/i, taches: /tache|[ée]clat|teint|vitamine|niacinamide/i, soleil: /solaire|spf/i, secheresse: /s[èe]che|nourrissant|riche|karit[ée]/i, imperfections: /imperfection|purifiant|argile|s[ée]bum/i, sensibilite: /sensible|apais|rougeur/i };
const SK = { grasse: 'grasse', seche: 'seche', mixte: 'mixte', sensible: 'sensible', nsp: 'normale' };
const STEPRE = { nettoyer: /nettoy|moussant|d[ée]maquill/i, cibler: /s[ée]rum|masque/i, hydrater: /cr[èe]me|hydratant|baume|karit/i, proteger: /solaire|spf/i };
const WHY = { nettoyer: 'Première étape : nettoyer en douceur, matin et soir.', cibler: 'Le soin ciblé, pour ton souci du moment.', hydrater: 'Hydrater : la base d’une peau confortable.', proteger: 'Protéger du soleil chaque matin : le geste le plus important.' };
const NAME = { nettoyer: 'Nettoyer', cibler: 'Cibler', hydrater: 'Hydrater', proteger: 'Protéger' };
let ans = {}, qi = 0, POOL = [];
const $q = id => document.getElementById(id), P = a => a.prix_vente_fcfa || 0;
function renderQ() {
  const box = $q('parcours'), q = Q[qi];
  box.innerHTML = '<div class="qcard"><div class="qprog">' + Q.map((_, i) => '<span class="' + (i <= qi ? 'on' : '') + '"></span>').join('') + '</div><h2>' + q.t + '</h2><div class="qo">' + q.o.map(o => '<button data-v="' + o[0] + '">' + o[1] + '</button>').join('') + '</div><p class="qnote">Conseils cosmétiques, pas un avis médical.</p></div>';
  box.querySelectorAll('.qo button').forEach(b => b.onclick = () => { ans[q.k] = b.dataset.v; qi++; qi < Q.length ? renderQ() : renderR(); });
}
function pick(step, skin, concern) {
  let best = null, bs = -1;
  POOL.forEach(a => {
    const f = a._f; let s = 0;
    if (f) { if (f.etape !== step) return; if (skin && H(f.types_peau, skin)) s += 2; if (concern && H(f.preoccupations, concern)) s += 3; }
    else { const t = T(a); if (!STEPRE[step].test(t) || /coffret|routine|pack|mains?\b/i.test(a.nom || '')) return; if (step === 'hydrater' && /solaire|spf/i.test(t)) return; if (step !== 'proteger' && /solaire|spf/i.test(t)) return; if (skin && KW[skin] && KW[skin].test(t)) s += 2; if (concern && KW[concern] && KW[concern].test(t)) s += 3; }
    if (s > bs || (s === bs && best && P(a) < P(best))) { best = a; bs = s; }
  });
  return best;
}
function renderR() {
  const skin = SK[ans.peau], concern = ans.souci, budget = +ans.budget, comp = ans.taille === 'complete';
  const steps = comp ? ['nettoyer', 'cibler', 'hydrater', 'proteger'] : (concern === 'imperfections' || concern === 'taches' ? ['nettoyer', 'cibler', 'hydrater'] : ['nettoyer', 'hydrater', 'proteger']);
  let plan = steps.map(s => ({ s, a: pick(s, skin, concern) })).filter(x => x.a);
  const total = () => plan.reduce((t, x) => t + P(x.a), 0); let over = false;
  if (budget) { while (total() > budget && plan.length > 2) { const opt = plan.filter(x => x.s !== 'nettoyer' && x.s !== 'hydrater').sort((a, b) => P(b.a) - P(a.a))[0]; if (!opt) break; plan = plan.filter(x => x !== opt); } over = total() > budget; }
  const box = $q('parcours');
  if (!plan.length) { box.innerHTML = '<div class="qcard"><h2>Je n’ai pas <em>encore</em> la routine idéale</h2><p class="lead">Ma sélection de soins se complète. Écris-nous : on te guide sur WhatsApp.</p><div class="qact"><a class="btn-p" target="_blank" rel="noopener" href="https://wa.me/221778038874?text=' + encodeURIComponent('Bonjour SenMarché, je cherche une routine de soins : ' + LAB[ans.peau] + ', ' + LAB[ans.souci]) + '">Demander conseil</a><button class="btn-g" id="again">Recommencer</button></div></div>'; $q('again').onclick = restart; return; }
  const msg = 'Bonjour SenMarché, voici ma routine (' + LAB[ans.peau] + ', ' + LAB[ans.souci] + ') : ' + plan.map(x => x.a.nom).join(', ') + '. Pouvez-vous me conseiller ?';
  box.innerHTML = '<div class="qcard"><h2>Ta routine <em>sur mesure</em></h2><p class="lead" style="margin:.3rem 0 .6rem">Pour : ' + LAB[ans.peau] + ' · ' + LAB[ans.souci] + '</p>' +
    plan.map(x => '<a class="step" href="produit.html?ref=' + encodeURIComponent(x.a.reference) + '" style="color:inherit;text-decoration:none"><img loading="lazy" src="' + SE.esc(SE.imgUrl(x.a.photo_url, 200)) + '" alt=""><div><small>' + NAME[x.s] + '</small><b>' + SE.esc(x.a.nom) + '</b><em>' + WHY[x.s] + '</em>' + (F(x.a).precautions ? '<em>⚠ ' + SE.esc(F(x.a).precautions) + '</em>' : '') + '<strong style="color:var(--prix)">' + SE.fprix(P(x.a)) + '</strong></div></a>').join('') +
    '<div class="qtot"><span>Total de la routine</span><b>' + SE.fprix(total()) + '</b></div>' + (over ? '<p class="qnote">Cette routine dépasse un peu ton budget : tu peux commencer par le nettoyant et la crème.</p>' : '') +
    '<div class="qact"><button class="btn-p" id="addall">Ajouter la routine au panier</button><a class="btn-g" target="_blank" rel="noopener" href="https://wa.me/221778038874?text=' + encodeURIComponent(msg) + '">Demander conseil sur WhatsApp</a><button class="btn-g" id="again">Recommencer</button></div>' +
    '<p class="qnote">Ces conseils sont cosmétiques et ne remplacent pas l’avis d’un médecin ou d’un dermatologue. Consulte un professionnel en cas de douleur, de plaie, de gonflement, d’aggravation rapide, ou si tu es enceinte ou allaites avant d’utiliser un actif. En cas d’irritation, arrête le produit.</p></div>';
  $q('addall').onclick = () => { plan.forEach(x => SE.Cart.add(x.a.reference, 1)); SE.toast('Routine ajoutée au panier'); setTimeout(() => location.href = 'panier.html', 700); };
  $q('again').onclick = restart;
}
function restart() { ans = {}; qi = 0; renderQ(); }
function openQ() { $q('parcours-wrap').classList.remove('hid'); restart(); $q('parcours-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' }); }


/* ── Les trois boutiques ── */
const CFG = {
  tenues: {
  key: 'tenues', title: 'Tenues', em: 'pour chaque envie',
  placeholder: 'Une abaya ? Un voile ? Une robe ? Un pantalon ?',
  parts: [
    { k: 'abayas', t: 'Abayas & Voiles', s: 'Abayas, voiles, ensembles', catRe: /abaya|voile|[ée]l[ée]gance/i, rayons: [
      { k: 'ensembles', t: 'Ensembles', re: /ensemble|\bset\b/i },
      { k: 'abayas', t: 'Abayas & kimonos', re: /abaya|kimono|jilbab|robe longue/i },
      { k: 'voiles', t: 'Voiles & hijabs', re: /voile|hijab|foulard|khimar|[ée]charpe/i },
      { k: 'acc', t: 'Accessoires', re: /bonnet|sous-voile|[ée]pingle|broche/i }] },
    { k: 'tendances', t: 'Tendances', s: 'Robes, pantalons, hauts', catRe: /tendance|robe/i, rayons: [
      { k: 'ensembles', t: 'Ensembles', re: /ensemble|\bset\b/i },
      { k: 'robes', t: 'Robes & jupes', re: /robe|jupe/i },
      { k: 'pantalons', t: 'Pantalons', re: /pantalon|jean|legging|short/i },
      { k: 'hauts', t: 'Hauts', re: /\btop\b|haut|chemise|t-shirt|pull|body|blouse/i }] }
  ],
  cross: [{href:'fille.html#cosmetiques',t:'Cosmétiques'},{href:'fille.html#soins',t:'Soins & ma routine'}]
},
  cosmetiques: {
  key: 'cosmetiques', title: 'Cosmétiques', em: 'tout en douceur',
  placeholder: 'Un gloss ? Un mascara ? Une brume ?',
  catRe: /cosm[ée]tique|gloss|maquillage|l[eè]vres/i,
  rayons: [
    { k: 'levres', t: 'Lèvres', re: /gloss|l[eè]vre|rouge|baume|lip/i },
    { k: 'teint', t: 'Teint', re: /fond de teint|teint|poudre|blush|anticernes|correcteur/i },
    { k: 'yeux', t: 'Yeux', re: /mascara|palette|fard|eye-?liner|sourcil|cils/i },
    { k: 'ongles', t: 'Ongles', re: /vernis|ongle/i },
    { k: 'parfums', t: 'Parfums', re: /parfum|brume|eau de/i },
    { k: 'pinceaux', t: 'Pinceaux', re: /pinceau|[ée]ponge|miroir|trousse/i }
  ],
  cross: [{href:'fille.html#tenues',t:'Tenues'},{href:'fille.html#soins',t:'Soins & ma routine'}]
},
  soins: {
  key: 'soins', title: 'Soins', em: 'rien que pour ta peau',
  placeholder: 'Un sérum ? Une crème ? Un nettoyant ?',
  catRe: /soins?\b/i,
  extraHtml: '<div class="pw"><div class="routine-cta"><div><b>Ma routine perso</b><span>Facultatif : 4 questions, une routine pensée pour ta peau.</span></div><button class="btn-p" id="start-q">Commencer</button></div></div><section class="pw quiz hid" id="parcours-wrap"><div id="parcours"></div></section>',
  rayons: [
    { k: 'coffrets', t: 'Routines & coffrets', g: 'Par étape', fn: a => F(a).etape === 'coffret' || /coffret|routine|pack/i.test(a.nom || '') },
    { k: 'nettoyants', t: 'Nettoyants & lotions', g: 'Par étape', fn: a => /nettoyer|tonifier/.test(F(a).etape || '') || (!a._f && /nettoy|moussant|d[ée]maquill|lotion|tonique/i.test(a.nom || '')) },
    { k: 'serums', t: 'Sérums & masques', g: 'Par étape', fn: a => F(a).etape === 'cibler' || (!a._f && /s[ée]rum|masque/i.test(a.nom || '')) },
    { k: 'cremes', t: 'Crèmes & hydratants', g: 'Par étape', fn: a => F(a).etape === 'hydrater' || (!a._f && /cr[èe]me|hydratant|baume|karit/i.test(a.nom || '')) },
    { k: 'solaire', t: 'Protection solaire', g: 'Par étape', fn: a => F(a).etape === 'proteger' || (!a._f && /solaire|spf/i.test(T(a))) },
    { k: 'imperfections', t: 'Boutons & imperfections', g: 'Par problème', pill: true, fn: a => H(F(a).preoccupations, 'imperfections') || (!a._f && KW.imperfections.test(T(a))) },
    { k: 'taches', t: 'Taches & teint terne', g: 'Par problème', pill: true, fn: a => H(F(a).preoccupations, 'taches') || (!a._f && KW.taches.test(T(a))) },
    { k: 'secheresse', t: 'Sécheresse', g: 'Par problème', pill: true, fn: a => H(F(a).preoccupations, 'secheresse') || (!a._f && KW.secheresse.test(T(a))) },
    { k: 'sensibilite', t: 'Peau sensible', g: 'Par problème', pill: true, fn: a => H(F(a).preoccupations, 'sensibilite') || (!a._f && KW.sensibilite.test(T(a))) }
  ],
  cross: [{href:'fille.html#cosmetiques',t:'Cosmétiques'},{href:'fille.html#tenues',t:'Tenues'}],
  prepare: prepareFiches,
  onReady: all => { POOL = all; $q('start-q').onclick = openQ; if (location.hash === '#routine') openQ(); }
}
};
const TITLES = { tenues: 'Tenues', cosmetiques: 'Cosmétiques', soins: 'Soins' };

/* ── Accueil ── */
const price = U.price, isDeal = U.isDeal, pct = U.pct, link = U.link;
const G = [
  { k: 'tenues', kick: 'Habits', t: 'Tenues', line: 'Abayas · Voiles · Robes', photo: 'cat-tenues.jpg', art: FilleArt.tenues, re: /abaya|voile|[ée]l[ée]gance|tendance|robe/i },
  { k: 'soins', kick: 'Peau', t: 'Soins', line: 'Crèmes · Sérums · Routine', photo: 'cat-soins.jpg', art: FilleArt.soins, re: /soins?\b/i },
  { k: 'cosmetiques', kick: 'Beauté', t: 'Cosmétiques', line: 'Gloss · Teint · Parfums', photo: 'cat-cosmetiques.jpg', art: FilleArt.cosmetiques, re: /cosm[ée]tique|gloss|maquillage|l[eè]vres/i }
];
const cardHtml = (g, n) => '<a class="cat" href="#' + g.k + '"><div class="cat-art">' + g.art() + '<img class="ph" src="' + g.photo + '" alt="" onload="this.parentNode.classList.add(\'has-photo\')" onerror="this.remove()"></div><div class="cat-body"><span class="kick2">' + g.kick + '</span><h3>' + g.t + '</h3><p>' + g.line + '</p><span class="cat-go">Découvrir <small>' + (n ? '· ' + n : '· bientôt') + '</small> →</span></div></a>';
function phare(a) {
  const left = a.quantite || 0;
  return '<div class="pf"><a class="im" href="' + link(a) + '"><img src="' + E(SE.imgUrl(a.photo_url, 800)) + '" alt="' + E(a.nom) + '"></a><div class="tx"><span class="tag" style="align-self:flex-start">✿ Coup de cœur</span><h2>' + E(a.nom) + '</h2><div class="fp"><b>' + SE.fprix(price(a)) + '</b>' + (isDeal(a) ? '<s>' + SE.fprix(a.prix_min_fcfa) + '</s>' : '') + '</div>' + (left > 0 && left <= 5 ? '<span class="low">Plus que ' + left + ' en stock</span>' : '') + '<a class="btn-p on-plum" style="align-self:flex-start" href="' + link(a) + '">Je le veux</a></div></div>';
}
async function hub() {
  document.title = 'Fille — SenMarché';
  app.innerHTML =
    '<section class="fh"><div class="fh-in"><div><span class="kick">Univers Fille</span><h1>Pour elle, <em>avec douceur</em></h1><p class="lead">Tenues, soins et cosmétiques.</p>' +
    '<div class="fh-cta"><button class="btn-p on-plum" id="go-b">Découvrir</button><a class="btn-gl" href="#routine">Ma routine perso</a></div></div>' +
    '<div class="fh-art" id="hero-art"><img class="ph" src="fille-hero.jpg" alt="" onload="this.parentNode.classList.add(\'has-photo\')" onerror="this.remove()"></div></div></section>' +
    '<div class="pw"><section class="sec" id="boutiques">' + FL + '<h2>Nos <em>boutiques</em></h2></section><div class="cats" id="cats"></div>' +
    '<div class="routine-cta"><div><b>Un souci de peau ?</b></div><a class="btn-p" href="#routine">Ma routine perso</a></div>' +
    '<div id="pf-wrap" class="hid"><section class="sec">' + FL + '<h2>Notre <em>coup de cœur</em></h2></section><div id="pf"></div></div>' +
    '<div id="packs-wrap" class="hid"><section class="sec">' + FL + '<h2>Coffrets &amp; <em>offres</em></h2></section><div class="packs" id="packs"></div></div>' +
    '<section class="sec">' + FL + '<h2>Nos <em>favorites</em></h2></section><div class="p-grid" id="grid"></div>' +
    '<div class="args"><div><i>🏠</i><b>Retrait ou livraison</b></div><div><i>💸</i><b>Paiement à la récupération</b></div><div><i>👀</i><b>Tu vérifies avant de payer</b></div><div><i>💬</i><b>Conseil sur WhatsApp</b></div></div>' +
    '<div class="ban cta" style="margin:2.6rem 0 3rem;border-radius:24px"><h3>Tu cherches <em>autre chose</em> ?</h3><a class="btn-p on-plum" href="demande-speciale.html">Demande spéciale</a></div></div>';
  $('hero-art').insertAdjacentHTML('afterbegin', FilleArt.hero());
  $('go-b').onclick = () => $('boutiques').scrollIntoView({ behavior: 'smooth' });
  $('cats').innerHTML = G.map(g => cardHtml(g, 0)).join('');
  try {
    await new Promise(r => setTimeout(r, 50));
    const arts = await SE.Articles.load();
    if (location.hash && location.hash !== '#') return;
    const group = {}; G.forEach(g => group[g.k] = []); const all = [];
    arts.forEach(a => {
      if ((a.quantite || 0) <= 0 || a.etat === 'Vendu') return;
      const n = (a.categorie && a.categorie.nom) || ''; if (!/fille/i.test(n)) return;
      const g = G.find(x => x.re.test(n)); if (g) { group[g.k].push(a); all.push(a); }
    });
    $('cats').innerHTML = G.map(g => cardHtml(g, group[g.k].length)).join('');
    const packs = all.filter(a => U.isPack(a, all)), notPack = all.filter(a => !U.isPack(a, all));
    const star = packs.concat(notPack).sort((a, b) => (isDeal(b) ? pct(b) : 0) - (isDeal(a) ? pct(a) : 0))[0];
    if (star) { $('pf-wrap').classList.remove('hid'); $('pf').innerHTML = phare(star); }
    if (packs.length) { $('packs-wrap').classList.remove('hid'); $('packs').innerHTML = packs.slice(0, 3).map(p => U.packHtml(p, all)).join(''); }
    const lists = G.map(g => group[g.k].filter(a => !U.isPack(a, all)).slice(0, 4)), mix = [];
    for (let i = 0; i < 4; i++) lists.forEach(l => { if (l[i]) mix.push(l[i]); });
    $('grid').innerHTML = mix.length ? mix.slice(0, 8).map(SE.productCard).join('') : '<div class="empty"><h3>De nouvelles pépites arrivent</h3></div>';
    if (!window.__fe) { window.__fe = 1; document.addEventListener('error', e => { const x = e.target; if (x.tagName === 'IMG' && !x.dataset.f && !x.classList.contains('ph')) { x.dataset.f = 1; x.src = 'https://placehold.co/600x750/f8e9ee/a84863?text=SenMarch%C3%A9'; } }, true); }
  } catch (e) { console.error(e); const g = $('grid'); if (g) g.innerHTML = '<div class="empty"><h3>Un souci de chargement</h3><p>' + String(e.message).replace(/</g, '&lt;') + '</p></div>'; }
}

/* ── Navigation ── */
function route() {
  const h = (location.hash || '').replace('#', '');
  const key = h === 'routine' ? 'soins' : (CFG[h] ? h : null);
  window.scrollTo(0, 0);
  if (key) { document.title = TITLES[key] + ' — SenMarché'; document.body.dataset.b = key; Boutique.init(CFG[key]); }
  else { document.body.dataset.b = 'fille'; hub(); }
}
window.addEventListener('hashchange', route);
route();
})();
