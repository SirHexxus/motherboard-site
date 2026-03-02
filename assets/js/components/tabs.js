'use strict';

/******************************************************************************
 * Tabs
 * Generic tab switcher. Expects:
 *   - [data-tab-nav] on the nav container
 *   - [data-tab-btn="id"] on each button
 *   - [data-tab-panel="id"] on each panel
 * Activates the first tab by default.
 ******************************************************************************/

export const init_tabs = (root = document) => {
  const navs = root.querySelectorAll('[data-tab-nav]');

  navs.forEach((nav) => {
    const buttons = nav.querySelectorAll('[data-tab-btn]');
    if (!buttons.length) return;

    const activate = (target_id) => {
      // Deactivate all buttons in this nav
      buttons.forEach((btn) => {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-selected', 'false');
      });

      // Deactivate all panels associated with this nav
      const panel_ids = [...buttons].map((b) => b.getAttribute('data-tab-btn'));
      panel_ids.forEach((id) => {
        const panel = root.querySelector(`[data-tab-panel="${id}"]`);
        if (panel) panel.classList.remove('is-active');
      });

      // Activate target button + panel
      const activeBtn = nav.querySelector(`[data-tab-btn="${target_id}"]`);
      const activePanel = root.querySelector(`[data-tab-panel="${target_id}"]`);

      if (activeBtn) {
        activeBtn.classList.add('is-active');
        activeBtn.setAttribute('aria-selected', 'true');
      }
      if (activePanel) activePanel.classList.add('is-active');
    };

    // Wire click events
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        activate(btn.getAttribute('data-tab-btn'));
      });
    });

    // Activate first tab by default
    const firstId = buttons[0].getAttribute('data-tab-btn');
    activate(firstId);
  });
};
