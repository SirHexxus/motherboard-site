'use strict';

/******************************************************************************
 * Navigation
 * - Sets is-active + aria-current="page" by matching window.location.pathname
 * - Hamburger toggle: flips is-open on .site-nav, updates aria-expanded
 * - Closes on Escape and outside-click
 ******************************************************************************/

const set_active_link = () => {
  const pathname = window.location.pathname;
  const links = document.querySelectorAll('[data-nav-link]');

  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Normalize both paths: strip trailing slashes for comparison
    const normalizedHref = href.replace(/\/$/, '') || '/';
    const normalizedPath = pathname.replace(/\/$/, '') || '/';

    // Exact match, or home page special case
    const isActive = normalizedPath === normalizedHref ||
      (href === '/' && (pathname === '/' || pathname === '/index.html'));

    if (isActive) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    }
  });
};

const init_hamburger = () => {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-site-nav]');

  if (!toggle || !nav) return;

  const close_nav = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  const open_nav = () => {
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  };

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.contains('is-open');
    if (isOpen) {
      close_nav();
    } else {
      open_nav();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      close_nav();
      toggle.focus();
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (
      nav.classList.contains('is-open') &&
      !nav.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      close_nav();
    }
  });
};

// ── Search ────────────────────────────────────────────────────────────────────

let searchState = null; // cached { idx, docsMap }

const strip_html = (str) =>
  str ? str.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';

const build_search_index = async () => {
  if (searchState) return searchState;

  try {
    const [sessionsData, charsData, worldData, factionsData] = await Promise.all([
      fetch('/data/sessions.json').then((r) => r.json()),
      fetch('/data/characters.json').then((r) => r.json()),
      fetch('/data/world.json').then((r) => r.json()),
      fetch('/data/factions.json').then((r) => r.json()),
    ]);

    const docs = [];

    sessionsData.sessions.forEach((s) => {
      docs.push({
        ref: `session-${s.id}`,
        title: `Session ${s.number}: ${s.title}`,
        body: s.summary + ' ' + (s.highlights || []).join(' '),
        type: 'Session',
        url: '/pages/sessions/',
      });
    });

    [...charsData.pcs, ...charsData.npcs].forEach((c) => {
      docs.push({
        ref: `char-${c.id}`,
        title: c.name,
        body: c.description,
        type: 'Character',
        url: '/pages/characters/',
      });
    });

    worldData.sections.forEach((s) => {
      docs.push({
        ref: `world-${s.id}`,
        title: s.title,
        body: strip_html(s.body_html || s.body || ''),
        type: 'World',
        url: '/pages/world/',
      });
    });

    factionsData.factions.forEach((f) => {
      docs.push({
        ref: `faction-${f.id}`,
        title: f.name,
        body: f.description,
        type: 'Faction',
        url: '/pages/factions/',
      });
    });

    const docsMap = {};
    docs.forEach((d) => { docsMap[d.ref] = d; });

    // lunr is loaded as a global script before this module
    const idx = window.lunr(function () {
      this.ref('ref');
      this.field('title', { boost: 10 });
      this.field('body');
      docs.forEach((d) => this.add(d));
    });

    searchState = { idx, docsMap };
    return searchState;
  } catch (err) {
    console.warn('Search index build failed:', err);
    return null;
  }
};

const render_search_results = (results, hits, docsMap) => {
  if (!hits.length) {
    results.innerHTML = '<p class="search-result--empty">No results found.</p>';
    results.hidden = false;
    return;
  }

  results.innerHTML = hits.slice(0, 6).map((hit) => {
    const doc = docsMap[hit.ref];
    if (!doc) return '';
    return `<a class="search-result" href="${doc.url}">
      <div class="search-result__title">${doc.title}</div>
      <div class="search-result__type">${doc.type}</div>
    </a>`;
  }).join('');
  results.hidden = false;
};

const init_search = () => {
  const toggle = document.querySelector('[data-search-toggle]');
  const input = document.querySelector('[data-search-input]');
  const results = document.querySelector('[data-search-results]');

  if (!toggle || !input || !results) return;
  if (typeof window.lunr === 'undefined') return;

  // Pre-warm the index in the background
  build_search_index();

  toggle.addEventListener('click', () => {
    const isOpen = input.classList.contains('is-open');
    if (isOpen) {
      input.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      results.hidden = true;
      input.value = '';
    } else {
      input.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      input.focus();
    }
  });

  let searchTimer = null;
  input.addEventListener('input', () => {
    clearTimeout(searchTimer);
    const query = input.value.trim();
    if (!query) {
      results.hidden = true;
      return;
    }

    searchTimer = setTimeout(async () => {
      const state = await build_search_index();
      if (!state) return;

      let hits = [];
      try {
        hits = state.idx.search(query + '*');
      } catch (_) {
        try { hits = state.idx.search(query); } catch (__) { hits = []; }
      }
      render_search_results(results, hits, state.docsMap);
    }, 180);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && input.classList.contains('is-open')) {
      input.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      results.hidden = true;
      input.value = '';
      toggle.focus();
    }
  });

  document.addEventListener('click', (e) => {
    const container = toggle.closest('.site-header__search');
    if (container && !container.contains(e.target)) {
      results.hidden = true;
    }
  });
};

export const init_navigation = () => {
  set_active_link();
  init_hamburger();
  init_search();
};
