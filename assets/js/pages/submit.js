'use strict';

import { init_tabs } from '../components/tabs.js';
import { submit_form } from '../services/submissions.js';
import { fetch_sessions } from '../services/content.js';

/******************************************************************************
 * Submit page
 * Initializes tab switcher, populates session dropdowns, wires form submits.
 ******************************************************************************/

// Set the loading state on a submit button
const set_loading = (btn, is_loading) => {
  btn.disabled = is_loading;
  btn.classList.toggle('is-loading', is_loading);
  btn.textContent = is_loading ? '' : btn.getAttribute('data-default-label');
};

// Show success state: hide form fields, show success message
const show_success = (form) => {
  const fields = form.querySelector('[data-form-fields]');
  const success = form.querySelector('[data-form-success]');
  if (fields) fields.classList.add('is-hidden');
  if (success) success.classList.add('is-visible');
};

// Show failure state: show error message with retry
const show_failure = (form) => {
  const failure = form.querySelector('[data-form-failure]');
  if (failure) failure.classList.add('is-visible');
};

// Reset loading state (on retry)
const reset_form_state = (form) => {
  const btn = form.querySelector('[data-submit-btn]');
  const failure = form.querySelector('[data-form-failure]');
  if (btn) {
    btn.disabled = false;
    btn.classList.remove('is-loading');
    btn.textContent = btn.getAttribute('data-default-label');
  }
  if (failure) failure.classList.remove('is-visible');
};

// Collect all named, non-empty form field values
const collect_fields = (form) => {
  const data = {};
  const elements = form.elements;
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (!el.name || el.type === 'submit') continue;
    data[el.name] = el.value.trim();
  }
  return data;
};

// Populate session number dropdowns from sessions.json
const populate_session_selects = async () => {
  const selects = document.querySelectorAll('[data-session-select]');
  if (!selects.length) return;

  try {
    const sessions = await fetch_sessions();
    const sorted = [...sessions].sort((a, b) => b.number - a.number);
    const options_html = sorted.map(
      (s) => `<option value="${s.number}">Session ${s.number} — ${s.title}</option>`
    ).join('');

    selects.forEach((sel) => {
      sel.insertAdjacentHTML('afterbegin', '<option value="">Select a session…</option>');
      sel.insertAdjacentHTML('beforeend', options_html);
    });
  } catch (err) {
    // Non-critical — dropdowns fall back to manual text entry
    console.warn('Could not populate session selects:', err);
  }
};

// Wire a single form's submit event
const wire_form = (form) => {
  const btn = form.querySelector('[data-submit-btn]');
  if (!btn) return;

  // Store label for reset
  btn.setAttribute('data-default-label', btn.textContent.trim());

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const type = form.getAttribute('data-form-type');
    const fields = collect_fields(form);

    set_loading(btn, true);

    try {
      await submit_form(type, fields);
      show_success(form);
    } catch (err) {
      show_failure(form);
      set_loading(btn, false);
      console.error('Submission error:', err);
    }
  });

  // Retry button
  const retry = form.querySelector('[data-form-retry]');
  if (retry) {
    retry.addEventListener('click', () => reset_form_state(form));
  }
};

document.addEventListener('DOMContentLoaded', () => {
  init_tabs();
  populate_session_selects();

  document.querySelectorAll('[data-form-type]').forEach(wire_form);
});
