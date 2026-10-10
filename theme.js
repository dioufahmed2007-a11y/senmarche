/* ═══════════════════════════════════════════════════════════════
   SEN·MARCHÉ — THEME.JS v7
   Deux thèmes : clair et sombre.
   - Variables appliquées IMMÉDIATEMENT sur <html> (pas de flash)
   - Ajoute data-se-theme="light|dark" sur <html> pour que les pages
     puissent adapter leurs propres couleurs (voir index.html)
   - Migre les anciens choix (nuit-doree, nuit-bleue) vers "sombre"
   → À charger dans le <head> : <script src="theme.js"></script>
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const KEY = 'se_theme';

  const THEMES = {
    'clair': {
      label: 'Clair', desc: 'Crème chaud, énergie accessible', icon: '☀',
      class: 'theme-clair', scheme: 'light', meta: '#FAF6F0',
      preview: ['#FAF6F0', '#1A1A1A', '#E8DDD0'],
      vars: {
        '--bg': '#FAF6F0', '--bg2': '#F2EBE0', '--card': '#FFFFFF', '--card2': '#EDE4D8',
        '--border': 'rgba(30,20,10,.1)',
        '--or': '#1A1A1A', '--or2': '#333333', '--prix': '#B8882A',
        '--or-dim': 'rgba(30,20,10,.06)', '--or-line': 'rgba(30,20,10,.15)',
        '--ink': '#1A1208', '--slate': '#3D2E1E', '--stone': '#7A6655', '--muted': '#A89080',
        '--green': '#16A34A', '--red': '#DC2626', '--blue': '#2563EB',
        '--ff-d': "'DM Sans', system-ui, sans-serif", '--ff-b': "'DM Sans', system-ui, sans-serif",
        '--hero-bg': 'linear-gradient(150deg, #FAF6F0 0%, #F2EBE0 100%)'
      }
    },
    'sombre': {
      label: 'Sombre', desc: 'Fond charbon, accents dorés', icon: '☾',
      class: '', scheme: 'dark', meta: '#0F0F0F',
      preview: ['#0F0F0F', '#D4AF37', '#1A1A1A'],
      vars: {
        '--bg': '#0F0F0F', '--bg2': '#141414', '--card': '#1A1A1A', '--card2': '#212121',
        '--border': 'rgba(255,255,255,.08)',
        '--or': '#D4AF37', '--or2': '#E0C04A', '--prix': '#F5C842',
        '--or-dim': 'rgba(212,175,55,.1)', '--or-line': 'rgba(212,175,55,.2)',
        '--ink': '#F5F5F5', '--slate': '#C0C0C0', '--stone': '#9A9A9A', '--muted': '#6A6A6A',
        '--green': '#4ADE80', '--red': '#F87171', '--blue': '#60A5FA',
        '--ff-d': "'Cormorant Garamond', Georgia, serif", '--ff-b': "'DM Sans', system-ui, sans-serif",
        '--hero-bg': 'linear-gradient(150deg, #0F0F0F 0%, #161616 100%)'
      }
    }
  };

  const LEGACY = { 'nuit-doree': 'sombre', 'nuit-bleue': 'sombre' };
  const ALL_CLASSES = ['theme-clair', 'theme-nuit-bleue'];

  function get() {
    let v = null;
    try { v = localStorage.getItem(KEY); } catch (e) {}
    if (v && LEGACY[v]) { v = LEGACY[v]; try { localStorage.setItem(KEY, v); } catch (e) {} }
    return THEMES[v] ? v : 'clair';
  }

  function paintBody(theme) {
    const b = document.body;
    if (!b) return;
    b.classList.remove(...ALL_CLASSES);
    if (theme.class) b.classList.add(theme.class);
    b.style.background = theme.vars['--bg'];
    b.style.color = theme.vars['--ink'];
  }

  function apply(name) {
    const theme = THEMES[name] || THEMES.clair;
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.setAttribute('data-se-theme', theme.scheme);   /* light | dark */
    root.style.colorScheme = theme.scheme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme.meta);

    if (document.body) paintBody(theme);
    else document.addEventListener('DOMContentLoaded', () => paintBody(theme));

    try { localStorage.setItem(KEY, name); } catch (e) {}

    document.querySelectorAll('[data-theme]').forEach(btn => {
      const active = btn.dataset.theme === name;
      btn.setAttribute('aria-pressed', active);
      btn.style.borderColor = active ? theme.vars['--or'] : 'rgba(128,128,128,.15)';
      btn.style.background = active ? theme.vars['--or-dim'] : 'transparent';
      const check = btn.querySelector('.theme-check');
      if (check) check.style.opacity = active ? '1' : '0';
    });
  }

  function renderWidget(container) {
    if (!container) return;
    const cur = get();
    container.innerHTML = Object.entries(THEMES).map(([key, t]) => {
      const active = cur === key;
      return `
        <button data-theme="${key}" aria-pressed="${active}" style="
          display:flex;align-items:center;gap:.85rem;padding:.85rem 1rem;
          background:${active ? t.vars['--or-dim'] : 'transparent'};
          border:1px solid ${active ? t.vars['--or'] : 'rgba(128,128,128,.15)'};
          border-radius:6px;cursor:pointer;width:100%;color:inherit;
          transition:.2s;font-family:inherit;margin-bottom:.5rem">
          <div style="display:flex;gap:2px;flex-shrink:0;border-radius:3px;overflow:hidden;border:1px solid rgba(128,128,128,.2)">
            ${t.preview.map(c => `<div style="width:14px;height:32px;background:${c}"></div>`).join('')}
          </div>
          <span style="flex:1;text-align:left">
            <strong style="display:block;font-size:.88rem;font-weight:600">${t.icon} ${t.label}</strong>
            <small style="font-size:.72rem;opacity:.6">${t.desc}</small>
          </span>
          <span class="theme-check" style="color:${t.vars['--or']};opacity:${active ? 1 : 0};transition:.2s;font-size:.9rem">✓</span>
        </button>`;
    }).join('');
    container.querySelectorAll('[data-theme]').forEach(btn => {
      btn.addEventListener('click', () => { apply(btn.dataset.theme); renderWidget(container); });
    });
  }

  /* bouton « retour » : une page restaurée depuis l'historique ne doit jamais rester blanche */
  window.addEventListener('pageshow', e => {
    if (!e.persisted) return;
    document.documentElement.style.visibility = '';
    if (document.body) document.body.style.opacity = '';
    apply(get());
  });

  apply(get());
  window.SE_Theme = { apply, get, themes: THEMES, renderWidget };
  document.addEventListener('DOMContentLoaded', () => {
    const w = document.getElementById('se-theme-widget');
    if (w) renderWidget(w);
  });
})();
