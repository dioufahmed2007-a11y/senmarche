/* ═══════════════════════════════════════════════════════════════
   SENMARCHÉ — fille-art.js
   Illustrations vectorielles de la boutique Fille (aucune image à charger) :
   hero (fenêtre en arche, bouquet, perles), une illustration par rayon, séparateur "fleuron".
   Pour mettre tes vraies photos : voir les fichiers fille-hero.jpg, cat-tenues.jpg, cat-soins.jpg, cat-cosmetiques.jpg
   ═══════════════════════════════════════════════════════════════ */
(function (root) {
  const GOLD = '#c9a063', GOLD2 = '#e6c98d', ROSE = '#d96f8c', ROSE2 = '#ee9db4', ROSE3 = '#f7c6d3', ROSE4 = '#fde6ec', SAGE = '#8fa58a', SAGE2 = '#aebfa8', ESP = '#1c120d';

  /* Fleur à pétales superposés (pivoine stylisée) */
  function flower(cx, cy, s, c) {
    const rings = [
      { n: 9, r: 30, rx: 17, ry: 25, fill: c[0], rot: 0 },
      { n: 7, r: 21, rx: 15, ry: 21, fill: c[1], rot: 20 },
      { n: 6, r: 13, rx: 11, ry: 15, fill: c[2], rot: 8 },
      { n: 5, r: 6, rx: 7, ry: 9, fill: c[3], rot: 30 }
    ];
    let g = '';
    rings.forEach(R => { for (let i = 0; i < R.n; i++) g += '<ellipse cx="0" cy="' + (-R.r) + '" rx="' + R.rx + '" ry="' + R.ry + '" fill="' + R.fill + '" stroke="rgba(150,50,80,.35)" stroke-width=".8" transform="rotate(' + (360 / R.n * i + R.rot) + ')"/>'; });
    g += '<circle r="4.5" fill="' + GOLD2 + '"/><circle r="1.6" fill="#fff" opacity=".7"/>';
    return '<g transform="translate(' + cx + ' ' + cy + ') scale(' + s + ')">' + g + '</g>';
  }
  const leaf = (x, y, rot, s, col) => '<path transform="translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + s + ')" d="M0 0C14-16 40-16 56 0C40 16 14 16 0 0Z" fill="' + (col || SAGE) + '" stroke="rgba(60,80,55,.35)" stroke-width=".8"/><path transform="translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + s + ')" d="M2 0H52" stroke="rgba(255,255,255,.45)" stroke-width="1"/>';
  const sparkle = (x, y, s, o) => '<path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" d="M0-10C1-3 3-1 10 0C3 1 1 3 0 10C-1 3-3 1-10 0C-3-1-1-3 0-10Z" fill="' + GOLD2 + '" opacity="' + (o || .9) + '"/>';
  const pearl = (x, y, r) => '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r + '" fill="url(#hp)" stroke="rgba(120,90,80,.25)" stroke-width=".6"/><circle cx="' + (x - r * .32).toFixed(1) + '" cy="' + (y - r * .35).toFixed(1) + '" r="' + (r * .28).toFixed(1) + '" fill="#fff" opacity=".9"/>';

  /* ── HERO : fenêtre en arche, bordée de perles, avec un bouquet ── */
  function hero() {
    let pearls = '';
    for (let y = 540; y >= 214; y -= 21) { pearls += pearl(41, y, 6.4) + pearl(399, y, 6.4); }
    const R = 179, n = 27;
    for (let i = 0; i <= n; i++) { const a = Math.PI - Math.PI * i / n; pearls += pearl(220 + R * Math.cos(a), 212 - R * Math.sin(a), 6.4); }
    const peon = [[ROSE3, ROSE2, ROSE, '#c24f72'], [ROSE4, ROSE3, ROSE2, ROSE], ['#fff3f6', ROSE4, ROSE3, ROSE2]];
    return '<svg class="art-hero" viewBox="0 0 440 560" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bouquet de fleurs dans une fenêtre en arche bordée de perles">' +
      '<defs><linearGradient id="hb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1f4"/><stop offset="1" stop-color="#f6c9d6"/></linearGradient>' +
      '<radialGradient id="hp" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#f4e8e4"/><stop offset="1" stop-color="#d9c3be"/></radialGradient>' +
      '<linearGradient id="hg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + GOLD2 + '"/><stop offset="1" stop-color="' + GOLD + '"/></linearGradient></defs>' +
      '<path d="M22 556V212A198 198 0 0 1 418 212V556Z" fill="url(#hb)" stroke="url(#hg)" stroke-width="3"/>' +
      '<path d="M58 556V214A162 162 0 0 1 382 214V556Z" fill="none" stroke="' + GOLD + '" stroke-width="1" opacity=".7"/>' +
      '<g opacity=".45"><circle cx="120" cy="170" r="34" fill="#fff"/><circle cx="330" cy="120" r="22" fill="#fff"/><circle cx="350" cy="300" r="40" fill="#fff"/><circle cx="90" cy="360" r="26" fill="#fff"/></g>' +
      pearls +
      '<g fill="none" stroke="' + SAGE + '" stroke-width="3" stroke-linecap="round"><path d="M220 556C220 470 220 360 220 262"/><path d="M200 556C185 480 160 410 150 345"/><path d="M240 556C255 480 280 400 292 330"/><path d="M215 556C170 500 130 460 112 410"/><path d="M225 556C275 505 315 465 336 410"/></g>' +
      leaf(222, 470, -40, 1, SAGE) + leaf(218, 430, -140, .9, SAGE2) + leaf(180, 480, -150, .85, SAGE2) + leaf(262, 478, -25, .85, SAGE) + leaf(206, 395, -130, .75, SAGE) + leaf(236, 375, -50, .75, SAGE2) +
      '<ellipse cx="112" cy="404" rx="9" ry="14" fill="' + ROSE2 + '" transform="rotate(-20 112 404)"/><ellipse cx="336" cy="404" rx="9" ry="14" fill="' + ROSE2 + '" transform="rotate(20 336 404)"/>' +
      flower(150, 338, 1, peon[1]) + flower(292, 322, 1.05, peon[2]) + flower(220, 252, 1.3, peon[0]) +
      sparkle(98, 250, 1.1) + sparkle(352, 214, .9) + sparkle(300, 110, .8, .7) + sparkle(140, 120, .7, .6) +
      '</svg>';
  }

  /* ── Illustrations de rayons (viewBox 320×240) ── */
  function frame(id, c1, c2, inner) {
    return '<svg class="art-cat" viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>' +
      '<linearGradient id="' + id + 'b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + GOLD2 + '"/><stop offset="1" stop-color="' + GOLD + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + ROSE2 + '"/><stop offset="1" stop-color="' + ROSE + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffaf5"/><stop offset="1" stop-color="#f0dcd2"/></linearGradient></defs>' +
      '<rect width="320" height="240" fill="url(#' + id + 'b)"/><circle cx="60" cy="50" r="42" fill="#fff" opacity=".28"/><circle cx="278" cy="196" r="52" fill="#fff" opacity=".22"/>' + inner + '</svg>';
  }
  function tenues() {
    const id = 'ct', pe = ['#f7c6d3', '#ee9db4', '#d96f8c', '#c24f72'];
    return frame(id, '#f3dfd6', '#e6c3c0',
      '<path d="M160 36V28C160 14 180 14 180 27" fill="none" stroke="url(#' + id + 'g)" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path d="M160 38L58 82H262Z" fill="none" stroke="url(#' + id + 'g)" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<path d="M104 84Q160 96 216 84L250 232Q160 246 70 232Z" fill="#46303a"/>' +
      '<path d="M104 84L62 178L86 188L122 108Z" fill="#46303a"/><path d="M216 84L258 178L234 188L198 108Z" fill="#46303a"/>' +
      '<path d="M124 88Q160 98 196 88L204 106Q160 118 116 106Z" fill="#5a4150"/>' +
      '<path d="M128 132H192" stroke="url(#' + id + 'g)" stroke-width="3" stroke-linecap="round"/><circle cx="160" cy="132" r="5" fill="url(#' + id + 'g)"/>' +
      '<path d="M118 150Q112 196 100 228M160 140V238M202 150Q208 196 220 228" stroke="rgba(255,255,255,.14)" stroke-width="2" fill="none"/>' +
      '<path d="M130 60h60" stroke="none"/>' +
      flower(272, 196, .55, pe) + leaf(250, 214, -150, .5, SAGE) + leaf(286, 214, -30, .5, SAGE2) + flower(44, 206, .38, pe) +
      sparkle(40, 100, 1) + sparkle(284, 70, .8));
  }
  function tendances() {
    const id = 'cd', pe = ['#f7c6d3', '#ee9db4', '#d96f8c', '#c24f72'];
    return frame(id, '#f7e4e8', '#efc9d3',
      '<path d="M160 36V28C160 14 180 14 180 27" fill="none" stroke="url(#' + id + 'g)" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path d="M160 38L66 80H254Z" fill="none" stroke="url(#' + id + 'g)" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<path d="M122 84Q160 96 198 84L194 130Q160 142 126 130Z" fill="url(#' + id + 'r)"/>' +
      '<path d="M126 130Q160 142 194 130L252 230Q160 246 68 230Z" fill="url(#' + id + 'r)"/>' +
      '<path d="M126 130Q160 142 194 130L196 140Q160 152 124 140Z" fill="#c24f72" opacity=".55"/>' +
      '<g fill="#fff" opacity=".6"><circle cx="110" cy="190" r="5"/><circle cx="150" cy="176" r="4"/><circle cx="190" cy="196" r="5"/><circle cx="222" cy="214" r="4"/><circle cx="92" cy="216" r="4"/><circle cx="164" cy="220" r="5"/></g>' +
      '<path d="M144 118q16 8 32 0M160 112v14" stroke="url(#' + id + 'g)" stroke-width="3" stroke-linecap="round" fill="none"/>' +
      flower(40, 62, .42, pe) + leaf(22, 80, -40, .45, SAGE) + sparkle(280, 110, 1) + sparkle(56, 150, .8) + sparkle(262, 60, .7));
  }
  function soins() {
    const id = 'cs';
    return frame(id, '#eaf0e4', '#dfe8d9',
      '<ellipse cx="124" cy="206" rx="86" ry="10" fill="rgba(60,80,55,.16)"/>' +
      '<rect x="62" y="124" width="124" height="82" rx="16" fill="url(#' + id + 'c)" stroke="' + GOLD + '" stroke-width="1.5"/>' +
      '<rect x="56" y="100" width="136" height="32" rx="12" fill="url(#' + id + 'g)"/><path d="M70 112H178" stroke="rgba(255,255,255,.5)" stroke-width="2" stroke-linecap="round"/>' +
      '<rect x="84" y="148" width="80" height="40" rx="8" fill="none" stroke="' + GOLD + '" stroke-width="1"/><path d="M96 162H152M104 174H144" stroke="' + ROSE + '" stroke-width="2" stroke-linecap="round"/>' +
      '<rect x="206" y="118" width="58" height="88" rx="16" fill="#f4d9a8" opacity=".95"/><rect x="206" y="118" width="58" height="88" rx="16" fill="none" stroke="' + GOLD + '" stroke-width="1.5"/>' +
      '<rect x="214" y="132" width="10" height="64" rx="5" fill="#fff" opacity=".5"/>' +
      '<rect x="224" y="98" width="22" height="24" rx="4" fill="url(#' + id + 'g)"/><rect x="228" y="62" width="14" height="40" rx="7" fill="#46303a"/><ellipse cx="235" cy="60" rx="10" ry="6" fill="#5a4150"/>' +
      '<path d="M240 188c-10-10-8-22 0-30 8 8 10 20 0 30z" fill="#fff" opacity=".55"/>' +
      leaf(26, 214, -60, .55, SAGE) + leaf(34, 218, -20, .6, SAGE2) + leaf(284, 214, -120, .55, SAGE) + leaf(292, 210, -160, .5, SAGE2) + sparkle(264, 46, .9) + sparkle(36, 92, .7));
  }
  function cosmetiques() {
    const id = 'cc';
    return frame(id, '#f9dbe4', '#f2bfd0',
      '<ellipse cx="160" cy="214" rx="120" ry="9" fill="rgba(150,50,80,.14)"/>' +
      '<rect x="64" y="146" width="40" height="68" rx="5" fill="url(#' + id + 'g)"/><rect x="66" y="112" width="36" height="38" rx="3" fill="#1c120d"/>' +
      '<path d="M68 114V76L86 57Q100 60 102 76V114Z" fill="url(#' + id + 'r)"/><path d="M74 108V82" stroke="rgba(255,255,255,.5)" stroke-width="3" stroke-linecap="round"/>' +
      '<rect x="128" y="120" width="30" height="94" rx="11" fill="url(#' + id + 'r)" opacity=".92"/><rect x="134" y="132" width="6" height="70" rx="3" fill="#fff" opacity=".45"/>' +
      '<rect x="125" y="86" width="36" height="38" rx="8" fill="url(#' + id + 'g)"/><path d="M132 98V112" stroke="rgba(255,255,255,.5)" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="236" cy="162" r="46" fill="url(#' + id + 'g)"/><circle cx="236" cy="162" r="37" fill="#fff4f7"/><circle cx="236" cy="162" r="30" fill="url(#' + id + 'r)" opacity=".85"/><path d="M216 150Q226 138 240 138" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".7"/>' +
      '<rect x="228" y="108" width="16" height="10" rx="3" fill="url(#' + id + 'g)"/>' + sparkle(40, 70, 1) + sparkle(286, 70, .9) + sparkle(190, 60, .7, .7));
  }
  /* Séparateur "fleuron" : deux traits dorés et une petite fleur */
  function fleuron() {
    let p = ''; for (let i = 0; i < 5; i++) p += '<ellipse cx="0" cy="-6.5" rx="3.6" ry="6.5" transform="rotate(' + (72 * i) + ')" fill="none" stroke="currentColor" stroke-width="1.3"/>';
    return '<svg class="fleuron" viewBox="0 0 220 28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g stroke="currentColor" stroke-width="1.2" fill="none"><path d="M8 14H84"/><path d="M136 14H212"/><path d="M84 14l5-3 5 3-5 3z" fill="currentColor"/><path d="M136 14l-5-3-5 3 5 3z" fill="currentColor"/></g><g transform="translate(110 14)">' + p + '<circle r="2.4" fill="currentColor"/></g><circle cx="20" cy="14" r="2" fill="currentColor"/><circle cx="200" cy="14" r="2" fill="currentColor"/></svg>';
  }
  root.FilleArt = { hero, tenues, tendances, soins, cosmetiques, fleuron };
  if (typeof module !== 'undefined') module.exports = root.FilleArt;
})(typeof window !== 'undefined' ? window : globalThis);
