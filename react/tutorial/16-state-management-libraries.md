# Lesson 16: State Management Libraries – The Shared Notebook

> **Like I'm 5:** A store is one shared notebook in the classroom. Anyone can read it or write a new line, and everyone sees the same notes. Choosing a store means choosing how big and how strict your notebook should be.

| | |
|---|---|
| **Concept reference** | [16 – State management libraries](../concepts/16-state-management-libraries.md) |
| **You will learn** | How to choose the smallest tool for each kind of state, how to build a **Zustand** store with selectors, `persist` and `devtools`, how the same cart looks in **Redux Toolkit**, and why a store re-renders less than context |
| **We build** | The cart moves from context + reducer into a Zustand store |
| **Time** | About 60 minutes |

## The story

We have used five different tools for state so far. Which one should you pick when? Here is the cheat-sheet, straight from the concepts:

| Need | Tool | Where in our shop |
|------|------|-------------------|
| State in **one** component | `useState` / `useReducer` | The quantity picker, the search text |
| Shared by a **few nearby** components | Lift state up | (Lesson 5) |
| **Rarely changing** global value | Context | Theme, logged-in user |
| **Frequently changing** global client state | **Zustand** or **Redux Toolkit** | The cart (this lesson) |
| **Server** data (API responses, caching) | TanStack Query | Toys, favorites (Lesson 15) |
| **Form** state | The form's own state or React Hook Form | Add-a-toy form |

Always choose the **smallest tool that works**. Our cart worked fine in context. But it is a good example of "global client state that changes often", so we'll move it into a store to learn how that feels.

## 1. Why would a store be better than context?

With context (Lesson 8) **every component that reads the context re-renders when the value changes**, even if it only cares about one part. We worked around that by splitting the cart into two contexts.

A **store** lives *outside* React. Components **subscribe to a slice** of it with a **selector**:

```tsx
const count = useCartStore(state => state.items.length);   // only re-renders when this number changes
```

If something else in the store changes (but `items.length` doesn't), this component is left alone. That is the main practical difference.

## 2. Install

```bash
npm install zustand @reduxjs/toolkit
```

`zustand` ("German for *state*") is small and has no Provider. `@reduxjs/toolkit` is for the comparison later in this lesson.

## 3. The cart store

Everything the cart knows and can do is in one place. Compare it with the old `cartReducer`: the *same rules*, but written as plain functions that call `set`.

📄 **`src/store/cartStore.ts`** (new file)

```ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { CartItem, Toy } from '../types';

interface CartState {
  items: CartItem[];
  add: (toy: Toy, qty: number) => void;
  setQty: (toyId: string, qty: number) => void;
  remove: (toyId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  // devtools: lets the Redux DevTools browser extension show every change
  devtools(
    // persist: saves to localStorage and restores on load (no more usePersistentReducer)
    persist(
      set => ({
        items: [],

        add: (toy, qty) =>
          set(state => {
            const existing = state.items.find(item => item.toyId === toy.id);
            if (existing) {
              return {
                items: state.items.map(item =>
                  item.toyId === toy.id ? { ...item, qty: item.qty + qty } : item,
                ),
              };
            }
            return {
              items: [
                ...state.items,
                { toyId: toy.id, name: toy.name, emoji: toy.emoji, price: toy.price, qty },
              ],
            };
          }),

        setQty: (toyId, qty) =>
          set(state => ({
            items: state.items
              .map(item => (item.toyId === toyId ? { ...item, qty } : item))
              .filter(item => item.qty > 0),
          })),

        remove: toyId =>
          set(state => ({ items: state.items.filter(item => item.toyId !== toyId) })),

        clear: () => set({ items: [] }),
      }),
      {
        name: 'toyshop-cart', // the localStorage key
        partialize: state => ({ items: state.items }), // save the data, not the functions
      },
    ),
    { name: 'CartStore', enabled: import.meta.env.DEV },
  ),
);

// Selectors: small functions that pick (or calculate) something from the state.
// They return plain numbers, so components re-render only when the number changes.
export const selectCount = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.qty, 0);

export const selectTotal = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.price * item.qty, 0);
```

Reading the code:

- `create<CartState>()(...)` makes the hook `useCartStore`. The store is a module, not a component. There is **no Provider** to put in `main.tsx`.
- `set(partial)` **merges** into the state. `set(state => …)` gets the current state, just like `setX(prev => …)` in React. We still **never mutate**: we return new arrays.
- `persist` replaces our `usePersistentReducer` and `localStorage` code. We gave it a *new* key (`toyshop-cart`) because it stores data in a different format than our old `cart` key.
- Selectors like `selectCount` hold derived values (Lesson 5: don't store what you can calculate).

> **Selecting rule:** a selector must return the **same value** when nothing relevant changed. `state => state.items` is fine (same array until changed). `state => ({ a: state.a })` creates a new object every time and causes endless re-renders; for that case use `useShallow` from `zustand/react/shallow`.

## 4. Use the store

Delete the old context, reducer and persistence hook, and switch the components over.

```bash
rm src/context/CartContext.tsx src/context/cartReducer.ts src/hooks/usePersistentReducer.ts
```

No Provider any more:

📄 **`src/main.tsx`** (replace everything)

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router/dom';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { router } from './router';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
```

The page title only needs the **count**:

📄 **`src/components/PageTitle.tsx`** (replace everything)

```tsx
import { useEffect } from 'react';
import { selectCount, useCartStore } from '../store/cartStore';

// Draws nothing. Its only job is to keep the browser tab title in step with the cart.
export function PageTitle() {
  const count = useCartStore(selectCount);

  useEffect(() => {
    document.title = count > 0 ? `(${count}) Tiny Toy Shop` : 'Tiny Toy Shop';
  }, [count]);

  return null;
}
```

The cart drop-down picks exactly what it needs. Functions like `setQty` never change, so selecting them is free.

📄 **`src/components/CartDropdown.tsx`** (replace everything)

```tsx
import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { formatPrice } from '../lib/formatPrice';
import { selectCount, selectTotal, useCartStore } from '../store/cartStore';
import { Button, DangerButton } from './Button';
import { Modal } from './Modal';
import { QuantityPicker } from './QuantityPicker';
import './CartDropdown.css';

export function CartDropdown() {
  const items = useCartStore(state => state.items);
  const count = useCartStore(selectCount);
  const total = useCartStore(selectTotal);
  const setQty = useCartStore(state => state.setQty);
  const remove = useCartStore(state => state.remove);
  const clear = useCartStore(state => state.clear);

  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(rootRef, () => setOpen(false), open && !confirmOpen);

  function emptyCart() {
    clear();
    setConfirmOpen(false);
    setOpen(false);
  }

  return (
    <div className="cart" ref={rootRef}>
      <button
        type="button"
        className="cart__button"
        aria-expanded={open}
        aria-controls="cart-panel"
        onClick={() => setOpen(isOpen => !isOpen)}
      >
        🛒 {count} {count === 1 ? 'item' : 'items'} · {formatPrice(total)}
      </button>

      {open && (
        <div id="cart-panel" className="cart__panel">
          {items.length === 0 ? (
            <p>Your cart is empty. Go find a toy! 🧸</p>
          ) : (
            <>
              <ul className="cart__list">
                {items.map(item => (
                  <li key={item.toyId} className="cart-row">
                    <span className="cart-row__name">
                      {item.emoji} {item.name}
                    </span>
                    <QuantityPicker
                      qty={item.qty}
                      onChange={qty => setQty(item.toyId, qty)}
                    />
                    <span className="cart-row__price">
                      {formatPrice(item.price * item.qty)}
                    </span>
                    <button
                      type="button"
                      className="cart-row__remove"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => remove(item.toyId)}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              <p className="cart__total">
                Total: <strong>{formatPrice(total)}</strong>
              </p>
              <div className="cart__confirm-buttons">
                <Link to="/cart" className="cart__link" onClick={() => setOpen(false)}>
                  Go to checkout →
                </Link>
                <DangerButton onClick={() => setConfirmOpen(true)}>Clear cart</DangerButton>
              </div>
            </>
          )}
        </div>
      )}

      {confirmOpen && (
        <Modal title="Empty the cart?" onClose={() => setConfirmOpen(false)}>
          <p>
            All {count} {count === 1 ? 'toy goes' : 'toys go'} back on the shelf.
          </p>
          <div className="cart__confirm-buttons">
            <DangerButton onClick={emptyCart}>Yes, empty it</DangerButton>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Keep shopping
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
```

📄 **`src/pages/CartPage.tsx`** (replace everything)

```tsx
import { useState } from 'react';
import { Link } from 'react-router';
import { CheckoutForm } from '../components/CheckoutForm';
import { QuantityPicker } from '../components/QuantityPicker';
import { Section } from '../components/Section';
import { formatPrice } from '../lib/formatPrice';
import { selectTotal, useCartStore } from '../store/cartStore';
import './CartPage.css';

export function CartPage() {
  const items = useCartStore(state => state.items);
  const total = useCartStore(selectTotal);
  const setQty = useCartStore(state => state.setQty);
  const remove = useCartStore(state => state.remove);
  const clear = useCartStore(state => state.clear);
  const [thanksName, setThanksName] = useState<string | null>(null);

  function handleOrder(name: string) {
    clear();
    setThanksName(name);
  }

  if (thanksName !== null) {
    return (
      <Section title="Order placed 🎉">
        <p>
          Thank you, <strong>{thanksName}</strong>! Your toys are on their way.
        </p>
        <Link to="/">Back to the shop</Link>
      </Section>
    );
  }

  if (items.length === 0) {
    return (
      <Section title="Your cart">
        <p>Your cart is empty. Go find a toy! 🧸</p>
        <Link to="/">Back to the shop</Link>
      </Section>
    );
  }

  return (
    <Section title="Your cart">
      <ul className="cart-page__list">
        {items.map(item => (
          <li key={item.toyId} className="cart-page__row">
            <span>
              {item.emoji} {item.name}
            </span>
            <QuantityPicker qty={item.qty} onChange={qty => setQty(item.toyId, qty)} />
            <span>{formatPrice(item.price * item.qty)}</span>
            <button
              type="button"
              className="cart-page__remove"
              aria-label={`Remove ${item.name}`}
              onClick={() => remove(item.toyId)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <p className="cart-page__total">
        Total: <strong>{formatPrice(total)}</strong>
      </p>

      <h3>Checkout</h3>
      <CheckoutForm onPlaced={handleOrder} />
    </Section>
  );
}
```

Three smaller files get **diffs**. In a diff block, lines starting with **`-`** (red) are removed, lines starting with **`+`** (green) are added, and lines with no sign just show you where you are. Don't type the `-`, `+` signs themselves.

📄 **`src/components/CheckoutForm.tsx`** (edit these lines)

```diff
-import { cartCount, cartTotal } from '../context/cartReducer';
-import { useCart } from '../context/CartContext';
 import { formatPrice } from '../lib/formatPrice';
+import { selectCount, selectTotal, useCartStore } from '../store/cartStore';
 import { Button } from './Button';
@@
-  const items = useCart();
-  const count = cartCount(items);
+  const count = useCartStore(selectCount);
+  const total = useCartStore(selectTotal);
@@
-        <strong>{formatPrice(cartTotal(items))}</strong>.
+        <strong>{formatPrice(total)}</strong>.
```

(`@@` lines just separate the separate places to edit.)

📄 **`src/pages/HomePage.tsx`** (edit these lines)

```diff
-import { useCartDispatch } from '../context/CartContext';
 import { useDebounce } from '../hooks/useDebounce';
 import { useToggleFavorite, useToys } from '../hooks/useToys';
 import { isCategory } from '../lib/categories';
+import { useCartStore } from '../store/cartStore';
 import type { CategoryChoice, Toy } from '../types';
@@
-  const dispatch = useCartDispatch();
+  const addToCart = useCartStore(state => state.add);
   const { toys, status, reload } = useToys();
@@
-  const handleAdd = useCallback(
-    (toy: Toy, qty: number) => dispatch({ type: 'added', toy, qty }),
-    [dispatch],
-  );
-
   // "mutate" never changes, so this callback stays the same too.
@@
-              onAdd={handleAdd}
+              onAdd={addToCart}
```

(`addToCart` is a store action: a function that never changes, so it's perfect for a `memo` child, and we don't even need `useCallback`.)

📄 **`src/pages/ToyPage.tsx`** (edit these lines)

```diff
 import { ToyDetails } from '../components/ToyDetails';
-import { useCartDispatch } from '../context/CartContext';
 import { useToggleFavorite, useToy, useToys } from '../hooks/useToys';
+import { useCartStore } from '../store/cartStore';
 import type { Toy } from '../types';
@@
-  const dispatch = useCartDispatch();
+  const addToCart = useCartStore(state => state.add);
   const toggleFavorite = useToggleFavorite();
@@
-            dispatch({ type: 'added', toy, qty });
+            addToCart(toy, qty);
```

Try it. Add toys, change amounts, reload (the cart is back, from the new `toyshop-cart` key), empty the cart, check out. The shop behaves exactly as before. We changed the engine, not the car. If you installed the **Redux DevTools** browser extension, open it: you will see every `set` call.

## 5. The same cart in Redux Toolkit

**Redux** is the older, stricter cousin: one big store, plain-object **actions**, **reducers** (just like Lesson 9!), middleware, and excellent dev tools. **Redux Toolkit (RTK)** is its modern, much shorter form. Many big teams use it for its strict conventions.

Here is our cart in RTK. It's a **comparison file**: nothing in the shop imports it, so you can delete it afterwards. Read it next to `cartStore.ts`.

📄 **`src/store/redux-demo/cartSlice.ts`** (new file)

```ts
import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, Toy } from '../../types';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] as CartItem[] },
  reducers: {
    added(state, action: PayloadAction<{ toy: Toy; qty: number }>) {
      const { toy, qty } = action.payload;
      const existing = state.items.find(item => item.toyId === toy.id);
      if (existing) {
        existing.qty += qty; // Immer lets you write "mutations" safely
      } else {
        state.items.push({
          toyId: toy.id,
          name: toy.name,
          emoji: toy.emoji,
          price: toy.price,
          qty,
        });
      }
    },
    removed(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.toyId !== action.payload);
    },
    cleared(state) {
      state.items = [];
    },
  },
});

export const { added, removed, cleared } = cartSlice.actions;

export const reduxStore = configureStore({
  reducer: { cart: cartSlice.reducer },
});

export type RootState = ReturnType<typeof reduxStore.getState>;
```

Using it in a component needs the `react-redux` package, a `<Provider store={reduxStore}>` at the top, and two hooks:

```tsx
// not part of our shop: how it would look
const count = useSelector((state: RootState) => state.cart.items.length);
const dispatch = useDispatch();
dispatch(added({ toy, qty: 2 }));
```

Notice what RTK adds: **Immer** (write `existing.qty += qty` and it still creates a new immutable state behind the scenes), slices that bundle actions + reducer, and a Provider.

### Zustand or Redux Toolkit?

| | Zustand | Redux Toolkit |
|---|---------|---------------|
| Size / boilerplate | Tiny; a store is one function | More structure (slices, store, Provider) |
| Provider needed | No | Yes (`react-redux`) |
| Style | Free-form; you decide | Strict conventions; good for big teams |
| Middleware / tooling | Small set (`persist`, `devtools`, …) | Large ecosystem, time-travel debugging, RTK Query |
| Choose it when… | You want a small, simple global store | A large team wants one clear, enforced way |

Neither is "better". Both are far smaller than the problem of **not** choosing a tool and passing everything through props.

## 6. What just happened?

- The cart state now lives **outside React**, in a store with its own actions. Components subscribe to **slices** through selectors.
- We deleted three files (context, reducer, persistence hook) and one Provider. The store is shorter than the three files together.
- `persist` and `devtools` are **middleware**: wrappers that add features around the store.
- The code that **uses** the cart got simpler: `remove(id)` instead of `dispatch({ type: 'removed', toyId: id })`.

### Rules for stores

- **Don't put server responses in a client store** if a query library can manage them (Lesson 15).
- **Keep store state small and normalized.** Derive the rest with selectors.
- **Select only what you need.** `useCartStore(selectCount)` re-renders when the count changes; `useCartStore()` (the whole store) re-renders on every change.
- Use the **dev tools** (Redux DevTools, Zustand's `devtools` middleware) to see what changed and when.

## 🧪 Try it yourself

1. **Prove slices.** Make a tiny component `DistinctToys` that shows `useCartStore(state => state.items.length)` and put `console.count('DistinctToys drew')` inside. Raise the quantity of a toy already in the cart. Does it log? (No: the number of different toys didn't change.) Now think about how the context version would have behaved.
2. **Break the selector.** Change a selector to `state => ({ items: state.items })` and see the "maximum update depth" or infinite-loop warning. Then fix it with `useShallow`.
3. **Add a feature.** Add a `discount` to the store (`discount: number`, `setDiscount(n)`) and show a discounted total with a selector. No other file should need to change except the one that shows the total.
4. **Look inside storage.** Open dev tools → Application → Local Storage. Find `toyshop-cart`. What shape is it (`state`, `version`)?
5. **Persist the theme too.** The theme lives in context and `useLocalStorage`. Could it be a store? Should it? (Think of the table at the top of this lesson.)

## ✅ Check yourself

<details>
<summary>1. When is context a better choice than a store?</summary>

For rarely changing global values such as the theme, language or logged-in user. A store is better for frequently changing global state where components should subscribe to small slices.
</details>

<details>
<summary>2. What is a selector?</summary>

A function that picks or calculates a part of the store's state. A component that uses a selector re-renders only when the selected value changes.
</details>

<details>
<summary>3. Where did we put the Zustand "Provider"?</summary>

Nowhere. A Zustand store is a module and the hook `useCartStore` can be used anywhere.
</details>

<details>
<summary>4. Why not keep API responses in a Zustand store?</summary>

A query library like TanStack Query already handles caching, staleness, retries and sharing for server data. Copying it into a store means you have to keep both in sync.
</details>

## Recap

- Choose the smallest tool: `useState` → lifted state → context → store; use a query library for server data.
- Zustand is a small, Provider-free store; Redux Toolkit is a stricter, bigger one.
- Components subscribe to slices with selectors, so they re-render less than with context.
- Middleware (`persist`, `devtools`) adds features without changing the components.
- Keep store state minimal, don't duplicate server data in it, and use the dev tools.

➡️ **Next:** [Lesson 17 – Performance: tidy up a messy room](17-performance.md)
