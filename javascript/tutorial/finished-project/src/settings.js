import { StandError } from './errors.js';
import { safeMerge } from './security.js';

export const defaultSettings = { theme: 'light', language: 'en', notifications: { sound: true } };

// Turn saved text into settings. Saved text is UNTRUSTED: it may be broken, or hostile.
export function parseSettings(text) {
  try {
    const saved = JSON.parse(text ?? '{}');
    if (saved === null || typeof saved !== 'object' || Array.isArray(saved)) {
      throw new TypeError('Settings must be an object');
    }
    return safeMerge(defaultSettings, saved);
  } catch (error) {
    throw new StandError('The saved settings are broken', { cause: error });
  }
}
