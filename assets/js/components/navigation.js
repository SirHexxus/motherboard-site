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

export const init_navigation = () => {
  set_active_link();
  init_hamburger();
};
