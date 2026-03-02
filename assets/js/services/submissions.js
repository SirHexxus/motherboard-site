'use strict';

/******************************************************************************
 * Submissions Service
 * POSTs form data to the Google Apps Script web app endpoint.
 *
 * Replace APPS_SCRIPT_URL with your deployed Apps Script URL after Phase 7.
 ******************************************************************************/

const APPS_SCRIPT_URL = 'REPLACE_WITH_APPS_SCRIPT_URL';

export const submit_form = async (type, fields) => {
  const payload = JSON.stringify({ type, ...fields });

  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
  });

  if (!response.ok) {
    throw new Error(`Submission failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};
