'use strict';

import { BASE_PATH } from '../utils/config.js';

/******************************************************************************
 * Content Service
 * fetch + parse JSON data files. Each function returns the parsed data array.
 ******************************************************************************/

const fetch_json = async (path) => {
  const response = await fetch(BASE_PATH + path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

export const fetch_sessions = async () => {
  const data = await fetch_json('/data/sessions.json');
  return data.sessions;
};

export const fetch_characters = async () => {
  return fetch_json('/data/characters.json');
};

export const fetch_factions = async () => {
  const data = await fetch_json('/data/factions.json');
  return data.factions;
};

export const fetch_world = async () => {
  const data = await fetch_json('/data/world.json');
  return data.sections;
};
