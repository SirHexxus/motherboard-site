'use strict';

import { fetch_world } from '../services/content.js';
import { render_world_sections } from '../components/contentRenderer.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('[data-content-region="world"]');
  if (!container) return;

  container.innerHTML = '<p class="loading-placeholder">Loading world data...</p>';

  try {
    const sections = await fetch_world();
    render_world_sections(container, sections);
  } catch (err) {
    container.innerHTML = `<div class="error-message">
      Failed to load world data. Check your connection and try again.
    </div>`;
    console.error(err);
  }
});
