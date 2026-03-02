'use strict';

import { fetch_sessions } from '../services/content.js';
import { render_session_list } from '../components/contentRenderer.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('[data-content-region="sessions"]');
  if (!container) return;

  container.innerHTML = '<p class="loading-placeholder">Loading sessions...</p>';

  try {
    const sessions = await fetch_sessions();
    render_session_list(container, sessions);
  } catch (err) {
    container.innerHTML = `<div class="error-message">
      Failed to load session data. Check your connection and try again.
    </div>`;
    console.error(err);
  }
});
