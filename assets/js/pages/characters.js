'use strict';

import { fetch_characters } from '../services/content.js';
import { render_character_grid } from '../components/contentRenderer.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('[data-content-region="characters"]');
  if (!container) return;

  container.innerHTML = '<p class="loading-placeholder">Loading characters...</p>';

  try {
    const data = await fetch_characters();
    render_character_grid(container, data.pcs, data.npcs);
  } catch (err) {
    container.innerHTML = `<div class="error-message">
      Failed to load character data. Check your connection and try again.
    </div>`;
    console.error(err);
  }
});
