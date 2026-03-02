'use strict';

// Format an ISO date string to a human-readable form.
// e.g. '2026-02-28' → 'February 28, 2026'
export const format_date = (iso_string) => {
  if (!iso_string) return '';
  const d = new Date(iso_string + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Escape HTML to prevent XSS when inserting user-supplied strings.
export const escape_html = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};
