/* ═══════════════════════════════════════════════════════════════
   SEN·MARCHÉ — collection-themes.js
   Une collection existe pour une RAISON. Chaque raison (thème) a :
   un nom, une icône, une ambiance, et la liste des sections de sa page.

   Comment choisir le thème d'une collection ?
   → remplis la colonne  theme_visuel  avec : froid, chaleur, promo
   → sinon on le devine à partir du nom ("Promo…", "Soldes…", "Hiver…", "Été…")
   → sinon : thème neutre "defaut".

   Pour AJOUTER un thème : copie un bloc dans THEMES, change la clé,
   le nom, l'icône et les sections. Le style se règle dans marche-ui.css (.t-<clé>).

   Usage : MTheme.of(collection) → { key, label, icon, effect, tagline, titles, sections, year }
          MTheme.discount(article) → { ref, pct }
   ═══════════════════════════════════════════════════════════════ */
window.MTheme = (function () {
  'use strict';
  const svg = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

  const SECTIONS_STYLE = ['manifeste', 'piece', 'grille', 'guides', 'engagement', 'suite'];

  const THEMES = {
    froid: {
      label: 'Vêtements chauds',
      icon: svg('<path d="M12 2v20M4.2 7l15.6 10M19.8 7 4.2 17"/><path d="M9.5 3.8 12 6.3l2.5-2.5M9.5 20.2 12 17.7l2.5 2.5"/>'),
      effect: 'snow',
      tagline: 'Les pièces pour affronter le froid.',
      titles: { grille: 'Les pièces <i>chaudes</i>', guides: 'Comment les <i>porter</i>' },
      sections: SECTIONS_STYLE
    },
    chaleur: {
      label: 'Tenues légères',
      icon: svg('<circle cx="12" cy="12" r="4.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>'),
      effect: 'sun',
      tagline: 'Les pièces légères pour la chaleur.',
      titles: { grille: 'Les pièces <i>légères</i>', guides: 'Comment les <i>porter</i>' },
      sections: SECTIONS_STYLE
    },
    promo: {
      label: 'Promotions',
      icon: svg('<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.2"/>'),
      effect: '',
      tagline: 'Des prix réduits sur une sélection.',
      titles: { grille: 'Toutes les <i>promos</i>', remises: 'Les <i>remises</i>', top: 'Les plus grosses <i>remises</i>' },
      sections: ['remises', 'top', 'grille', 'engagement', 'suite']
    },
    defaut: {
      label: 'Collection',
      icon: '',
      effect: '',
      tagline: '',
      titles: { grille: 'À <i>explorer</i>', guides: 'Comment les <i>porter</i>' },
      sections: SECTIONS_STYLE
    }
  };

  /* mots-clés pour deviner le thème à partir du nom / de theme_visuel */
  const GUESS = [
    ['promo', /promo|solde|remise|r[ée]duc|bon plan|offre/],
    ['froid', /froid|hiver|winter|snow|neige|chaud/],
    ['chaleur', /chaleur|summer|sun|soleil|l[ée]ger|(^|[^a-z])(ete|été)([^a-z]|$)/]
  ];

  function of(col) {
    col = col || {};
    const t = String(col.theme_visuel || '').trim().toLowerCase();
    const n = String(col.nom || '').toLowerCase();
    let key = THEMES[t] ? t : '';
    if (!key) for (const [k, re] of GUESS) { if (re.test(t) || re.test(n)) { key = k; break; } }
    if (!key) key = 'defaut';
    const m = String(col.nom || '').match(/\d{4}/);
    const year = m ? m[0] : '';
    return Object.assign({ key, year }, THEMES[key]);
  }

  /* promotion : on utilise prix_min_fcfa comme prix de référence barré,
     exactement comme le fait déjà le catalogue (app.js). */
  function discount(a) {
    const prix = a.prix_vente_fcfa || 0;
    const ref = a.prix_min_fcfa && a.prix_min_fcfa > prix ? a.prix_min_fcfa : 0;
    return { ref, pct: ref ? Math.round((1 - prix / ref) * 100) : 0 };
  }

  return { of, discount, THEMES };
})();
