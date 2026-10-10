# 16. State Management Libraries

> **Like I'm 5:** A store is one shared notebook in the classroom. Anyone can read it or write a new line, and everyone sees the same notes. Choosing a store means choosing how big and how strict your notebook should be.

## Choose the smallest tool that works

| Need | Tool |
|------|------|
| State in one component | `useState` / `useReducer` |
| Shared by a few nearby components | Lift state up |
| Rarely changing global value (theme, locale) | Context |
| Frequently changing global client state | Zustand or Redux Toolkit |
| Server data (API responses, caching) | TanStack Query |
| Form state | React Hook Form or the form's own state |

## Zustand

```tsx
import { create } from 'zustand';

type CartState = {
  items: string[];
  add: (item: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()((set) => ({
  items: [],
  add: (item) => set((s) => ({ items: [...s.items, item] })),
  clear: () => set({ items: [] }),
}));

// usage: only re-renders when the selected slice changes
const count = useCart(s => s.items.length);
```

Zustand is small and has no providers. Select only the slice you need.

## Redux Toolkit

```tsx
import { createSlice, configureStore } from '@reduxjs/toolkit';

const cart = createSlice({
  name: 'cart',
  initialState: { items: [] as string[] },
  reducers: {
    added(state, action: { payload: string }) {
      state.items.push(action.payload);   // Immer lets you write "mutations" safely
    },
    cleared(state) {
      state.items = [];
    },
  },
});

export const store = configureStore({ reducer: { cart: cart.reducer } });
export const { added, cleared } = cart.actions;
```

Redux Toolkit is a good fit for large teams that want strict conventions, middleware, and devtools.

## Context vs store

- Context re-renders all consumers when its value changes.
- Stores (Zustand, Redux) let components subscribe to specific slices.

## Important points
- Don't put server responses in a client store if a query library can manage them.
- Keep store state normalized and minimal. Derive the rest in selectors.
- Use devtools (Redux DevTools, Zustand middleware) to debug state changes.
