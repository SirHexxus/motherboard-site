'use strict';

import { format_date, escape_html } from '../utils/format.js';

/******************************************************************************
 * Content Renderer
 * Each function takes a container element + data array and builds DOM.
 * Inserts into [data-content-region] placeholders in HTML.
 ******************************************************************************/

// ── Sessions ──────────────────────────────────────────────────────────────────

export const render_session_list = (container, sessions) => {
  if (!sessions || !sessions.length) {
    container.innerHTML = '<p class="text-secondary">No sessions recorded yet.</p>';
    return;
  }

  // Most recent first
  const sorted = [...sessions].sort((a, b) => b.number - a.number);

  const html = sorted.map((s) => {
    const is_complete = s.status === 'complete';
    const is_in_prep = s.status === 'in-prep';
    const modifier = is_complete ? 'session-entry--complete' : is_in_prep ? 'session-entry--in-prep' : 'session-entry--upcoming';

    const highlights_html = s.highlights && s.highlights.length
      ? `<div class="session-entry__highlights">
          <p class="session-entry__highlights-heading">Session highlights</p>
          <ul class="session-entry__highlight-list">
            ${s.highlights.map((h) => `<li>${escape_html(h)}</li>`).join('')}
          </ul>
        </div>`
      : '';

    const npcs_html = s.notable_npcs && s.notable_npcs.length
      ? `<div class="card__meta">
          <span class="text-xs font-mono text-secondary text-upper letter-wide">NPCs: </span>
          ${s.notable_npcs.map((n) => `<span class="badge badge--muted">${escape_html(n)}</span>`).join('')}
        </div>`
      : '';

    const tags_html = s.tags && s.tags.length
      ? s.tags.map((t) => `<span class="badge badge--muted">${escape_html(t)}</span>`).join('')
      : '';

    // Complete = cherenkov (calm, it's history); in-prep = phosphor (active, being built); upcoming = amber (warning)
    const status_badge = is_complete
      ? '<span class="badge badge--cherenkov">Complete</span>'
      : is_in_prep
        ? '<span class="badge badge--phosphor">In Prep</span>'
        : '<span class="badge badge--amber">Upcoming</span>';

    return `
      <article class="session-entry ${modifier}">
        <div class="session-entry__header">
          <div>
            <p class="session-entry__number">Session ${escape_html(String(s.number))}</p>
            <h2 class="session-entry__title">${escape_html(s.title)}</h2>
            ${s.subtitle ? `<p class="session-entry__subtitle">${escape_html(s.subtitle)}</p>` : ''}
            <time class="session-entry__date" datetime="${escape_html(s.date)}">
              ${format_date(s.date)}
            </time>
          </div>
          ${status_badge}
        </div>
        <p class="session-entry__summary">${escape_html(s.summary)}</p>
        ${highlights_html}
        ${npcs_html}
        ${tags_html ? `<div class="card__meta">${tags_html}</div>` : ''}
      </article>`;
  }).join('');

  container.innerHTML = `<div class="session-list">${html}</div>`;
};

// ── Characters ────────────────────────────────────────────────────────────────

// Maps faction string → CSS modifier class
const faction_to_class = (faction, tags) => {
  if (tags && tags.includes('party-asset')) return 'char-card--asset';
  if (!faction) return '';
  const f = faction.toLowerCase();
  if (f.includes('loyalist')) return 'char-card--loyalist';
  if (f.includes('unionist')) return 'char-card--unionist';
  if (f.includes('masses') || f.includes('agitator')) return 'char-card--masses';
  if (f.includes('wildcard')) return 'char-card--wildcard';
  return '';
};

// The remnant state cycle indicator, used on BR's card
const REMNANT_CYCLE_HTML = `
  <div class="remnant-cycle remnant-cycle--suppressed" aria-label="Remnant state cycle">
    <span class="remnant-cycle__label remnant-cycle__label--red">Red</span>
    <span class="remnant-cycle__arrow">&#8594;</span>
    <span class="remnant-cycle__label remnant-cycle__label--amber">Amber</span>
    <span class="remnant-cycle__arrow">&#8594;</span>
    <span class="remnant-cycle__label remnant-cycle__label--blue">Blue</span>
    <span class="remnant-cycle__arrow">&#8594;</span>
    <span class="remnant-cycle__label remnant-cycle__label--green">Green</span>
    <span class="remnant-cycle__arrow">&#8594;</span>
    <span class="remnant-cycle__label remnant-cycle__label--red">Red&hellip;</span>
    <span class="remnant-cycle__note">
      Condition suppressed &mdash; currently cycling Blue &rarr; Green
    </span>
  </div>`;

const render_char_card = (c, is_pc) => {
  const tags_html = c.tags && c.tags.length
    ? `<div class="char-card__tags">
        ${c.tags.map((t) => `<span class="badge badge--muted">${escape_html(t)}</span>`).join('')}
      </div>`
    : '';

  const role_line = is_pc
    ? `${escape_html(c.class)} / ${escape_html(c.subclass)}`
    : escape_html(c.role || c.faction || '');

  const faction_class = is_pc ? '' : faction_to_class(c.faction, c.tags);
  const show_cycle = c.tags && c.tags.includes('party-asset') && c.tags.includes('remnant');

  return `
    <article class="char-card${is_pc ? ' char-card--pc' : ''}${faction_class ? ' ' + faction_class : ''}">
      <h3 class="char-card__name">${escape_html(c.name)}</h3>
      <p class="char-card__role">${role_line}</p>
      <p class="char-card__description">${escape_html(c.description)}</p>
      ${show_cycle ? REMNANT_CYCLE_HTML : ''}
      ${tags_html}
    </article>`;
};

export const render_character_grid = (container, pcs, npcs) => {
  const pcs_html = pcs && pcs.length
    ? `<section class="characters-section">
        <h2 class="characters-section__heading">The Party</h2>
        <div class="character-grid">
          ${pcs.map((c) => render_char_card(c, true)).join('')}
        </div>
      </section>`
    : '';

  const npcs_html = npcs && npcs.length
    ? `<section class="characters-section">
        <h2 class="characters-section__heading">Notable NPCs</h2>
        <div class="npc-grid">
          ${npcs.map((c) => render_char_card(c, false)).join('')}
        </div>
      </section>`
    : '';

  container.innerHTML = pcs_html + npcs_html;
};

// ── Factions ──────────────────────────────────────────────────────────────────

// Faction size badge — cherenkov (standard operating, informational)
// Stance badge — amber (warning, authority)
export const render_faction_list = (container, factions) => {
  if (!factions || !factions.length) {
    container.innerHTML = '<p class="text-secondary">No factions on record.</p>';
    return;
  }

  const html = factions.map((f) => {
    const size_html = f.size_pct
      ? `<span class="badge badge--cherenkov">${escape_html(f.size_pct)}</span>`
      : '';

    const stance_html = f.stance
      ? `<span class="badge badge--amber">${escape_html(f.stance)}</span>`
      : '';

    return `
      <article class="faction-entry">
        <div class="faction-entry__header">
          <div>
            <h2 class="faction-entry__name">${escape_html(f.name)}</h2>
            <p class="faction-entry__meta">
              ${f.leader ? 'Led by ' + escape_html(f.leader) : ''}
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            ${size_html}
            ${stance_html}
          </div>
        </div>
        <p class="faction-entry__description">${escape_html(f.description)}</p>
      </article>`;
  }).join('');

  container.innerHTML = `<div class="faction-list">${html}</div>`;
};

// ── World ─────────────────────────────────────────────────────────────────────

// Inline remnant cycle for the Remnants world section body
const WORLD_REMNANT_CYCLE_HTML = `
  <div class="remnant-cycle" aria-label="Remnant state cycle" style="margin-top: 1rem;">
    <span class="remnant-cycle__label remnant-cycle__label--blue">Blue</span>
    <span class="remnant-cycle__arrow">&#8594;</span>
    <span class="remnant-cycle__label remnant-cycle__label--green">Green</span>
    <span class="remnant-cycle__arrow">&#8594;</span>
    <span class="remnant-cycle__label remnant-cycle__label--amber">Amber</span>
    <span class="remnant-cycle__arrow">&#8594;</span>
    <span class="remnant-cycle__label remnant-cycle__label--red">Red</span>
    <span class="remnant-cycle__cues">
      <span class="remnant-cycle__label remnant-cycle__label--blue">Calm</span>
      <span class="remnant-cycle__arrow">&#8594;</span>
      <span class="remnant-cycle__label remnant-cycle__label--green">Communicative</span>
      <span class="remnant-cycle__arrow">&#8594;</span>
      <span class="remnant-cycle__label remnant-cycle__label--amber">Warning</span>
      <span class="remnant-cycle__arrow">&#8594;</span>
      <span class="remnant-cycle__label remnant-cycle__label--red">Fury</span>
    </span>
  </div>`;

export const render_world_sections = (container, sections) => {
  if (!sections || !sections.length) {
    container.innerHTML = '<p class="text-secondary">No world content yet.</p>';
    return;
  }

  const html = sections.map((s) => {
    const accent_class = s.accent ? ` world-section--${escape_html(s.accent)}` : '';

    const tags_html = s.tags && s.tags.length
      ? `<div class="world-section__tags">
          ${s.tags.map((t) => `<span class="badge badge--muted">${escape_html(t)}</span>`).join('')}
        </div>`
      : '';

    // body_html: trusted markup (GM-supplied) rendered directly
    // body: plain text, split on double-newlines into escaped paragraphs
    const paragraphs = s.body_html
      ? s.body_html
      : s.body.split(/\n\n+/).map(
          (para) => `<p>${escape_html(para.trim())}</p>`
        ).join('');

    const cycle_html = s.show_remnant_cycle ? WORLD_REMNANT_CYCLE_HTML : '';

    return `
      <section class="world-section${accent_class}" id="${escape_html(s.id)}">
        <h2 class="world-section__title">${escape_html(s.title)}</h2>
        <div class="world-section__body">
          ${paragraphs}
        </div>
        ${cycle_html}
        ${tags_html}
      </section>`;
  }).join('');

  container.innerHTML = `<div class="world-sections">${html}</div>`;
};
