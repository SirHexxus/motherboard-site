'use strict';

/******************************************************************************
 * Submissions Service
 * POSTs form data to the Google Apps Script web app endpoint.
 *
 * Replace APPS_SCRIPT_URL with your deployed Apps Script URL after Phase 7.
 ******************************************************************************/

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzBxnlXPS3L0yoQQI8bwKN6uUVJLWUPd9M2L4ueLemU0eH4eijboTC9e1bfarl29MIw2A/exec';

export const submit_form = async (type, fields) => {
  const payload = JSON.stringify({ type, ...fields });

  // Content-Type: text/plain avoids a CORS preflight — Apps Script parses
  // the JSON body via e.postData.contents regardless of content type.
  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: payload,
  });

  if (!response.ok) {
    throw new Error(`Submission failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};
