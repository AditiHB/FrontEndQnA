import { findItem } from './menu.js';
import { defaultSettings, parseSettings } from './settings.js';

// Storage can be blocked or full, so every read and write is guarded.
function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage is full or blocked: carry on without saving
  }
}

export function loadCart() {
  try {
    const saved = JSON.parse(read('stand-cart') ?? '[]');
    // Only keep lines for items we still sell.
    return Array.isArray(saved) ? saved.filter((line) => findItem(line?.itemId)) : [];
  } catch {
    return []; // damaged text: start with an empty cart
  }
}

export function saveCart(cart) {
  write('stand-cart', JSON.stringify(cart));
}

export function loadSettings() {
  try {
    return parseSettings(read('stand-settings'));
  } catch (error) {
    console.warn(error.message, 'because', error.cause);
    return { ...defaultSettings };
  }
}

export function saveSettings(settings) {
  write('stand-settings', JSON.stringify(settings));
}

// An id for this browser, made once and remembered.
export function getVisitorId() {
  let id = read('stand-visitor');
  if (!id) {
    id = crypto.randomUUID();
    write('stand-visitor', id);
  }
  return id;
}

// sessionStorage is forgotten when the tab closes: perfect for a half-typed name.
export function loadDraftName() {
  try {
    return sessionStorage.getItem('stand-draft-name') ?? '';
  } catch {
    return '';
  }
}

export function saveDraftName(name) {
  try {
    sessionStorage.setItem('stand-draft-name', name);
  } catch {
    // ignore: a draft is a nice-to-have
  }
}
