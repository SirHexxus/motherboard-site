'use strict';

import { init_navigation } from './components/navigation.js';

// Universal init — navigation only.
// Page-specific logic lives in assets/js/pages/*.js
document.addEventListener('DOMContentLoaded', () => {
  init_navigation();
});
