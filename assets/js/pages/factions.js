'use strict';

import { fetch_factions } from '../services/content.js';
import { render_faction_list } from '../components/contentRenderer.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('[data-content-region="factions"]');
  if (!container) return;

  container.innerHTML = '<p class="loading-placeholder">Loading factions...</p>';

  try {
    const factions = await fetch_factions();
    render_faction_list(container, factions);
  } catch (err) {
    container.innerHTML = `<div class="error-message">
      Failed to load faction data. Check your connection and try again.
    </div>`;
    console.error(err);
  }
});
