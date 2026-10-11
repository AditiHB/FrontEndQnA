import { computed, effect, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

import { StorageService } from './storage-service';

const STORAGE_KEY = 'toyshop-wishlist';

function load(storage: StorageService): number[] {
  try {
    return JSON.parse(storage.get(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

// A signalStore is a ready-made kit for state. You pick the pieces you need:
// withState = what we remember, withComputed = answers worked out from it,
// withMethods = the buttons that change it, withHooks = things to do at start-up.
export const WishlistStore = signalStore(
  { providedIn: 'root' },

  // A function: it runs when the store is created, so it can ask Angular for helpers.
  withState(() => ({ ids: load(inject(StorageService)) })),

  withComputed(({ ids }) => ({
    count: computed(() => ids().length),
  })),

  withMethods((store) => ({
    has: (id: number) => store.ids().includes(id),

    // patchState is the ONLY way to change the state: one clear door.
    toggle(id: number) {
      patchState(store, ({ ids }) => ({
        ids: ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id],
      }));
    },

    move(from: number, to: number) {
      patchState(store, ({ ids }) => {
        const next = [...ids];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        return { ids: next };
      });
    },
  })),

  withHooks({
    // onInit runs once when the store is created: keep the list saved.
    onInit(store) {
      const storage = inject(StorageService);
      effect(() => storage.set(STORAGE_KEY, JSON.stringify(store.ids())));
    },
  }),
);

// signalStore() gives us a value. This line also makes "WishlistStore" usable as a type.
export type WishlistStore = InstanceType<typeof WishlistStore>;
