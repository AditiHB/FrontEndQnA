import { deepFreeze } from './freeze.js';

// A tiny store. The state is frozen, so changing it in place is impossible.
export function createStore(initialState) {
  let state = deepFreeze(structuredClone(initialState));
  const listeners = new Set();

  return {
    getState: () => state,

    // `change` gets the old state and must RETURN a new one. It must never edit the old one.
    update(change) {
      const next = change(state);
      if (next === state) return; // the same reference means "nothing changed": tell nobody
      state = deepFreeze(next);
      for (const listener of listeners) {
        listener(state);
      }
    },

    // Returns a function that unsubscribes.
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
