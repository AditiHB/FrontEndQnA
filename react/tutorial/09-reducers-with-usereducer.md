# Lesson 9: Reducers – The Rule Book for the Cart

> **Like I'm 5:** A reducer is a rule book for a game. You don't change the score directly. You write down what happened ("player scored 2 points"), and the rule book works out the new score.

| | |
|---|---|
| **Concept reference** | [08 – Reducers & `useReducer`](../concepts/08-reducers-and-usereducer.md) |
| **You will learn** | Actions, reducers, `useReducer`, when to prefer it over `useState`, why reducers must be pure, sharing state and `dispatch` with two contexts |
| **We build** | A real shopping cart: change amounts, remove items, empty the cart (with a confirmation pop-up) |
| **Time** | About 60 minutes |

## The story

The cart is getting serious. Customers want to:

- add toys (we have that),
- change the amount of a toy already in the cart,
- remove a toy,
- empty the whole cart.

If every one of those is a different `setCart(...)` scattered in different components, nobody can tell all the ways the cart can change. We want **one rule book**.

## 1. Actions and reducers

Two ideas:

1. An **action** is a small note describing *what happened*, not *how to change things*:

   ```ts
   { type: 'added', toy, qty: 2 }
   { type: 'removed', toyId: 't3' }
   { type: 'cleared' }
   ```

2. A **reducer** is the rule book: a function that takes the **current state** and an **action**, and returns the **next state**:

   ```text
   (currentState, action)  ──►  reducer  ──►  nextState
   ```

React's `useReducer` hands you the current state and a function called `dispatch`. You call `dispatch(action)`; React runs your reducer and redraws with the new state.

```text
 button click ──► dispatch({type:'removed', toyId:'t3'})
                      │
                      ▼
            reducer(oldCart, action)   ← the rule book (pure function)
                      │
                      ▼
                 new cart  ──► React redraws
```

## 2. Write the rule book

The reducer goes in **its own file**. It doesn't import React at all, which makes it easy to test.

📄 **`src/context/cartReducer.ts`** (new file)

```ts
import type { CartItem, Toy } from '../types';

// Every thing that can happen to the cart. A "discriminated union":
// the "type" field tells TypeScript which other fields exist.
export type CartAction =
  | { type: 'added'; toy: Toy; qty: number }
  | { type: 'quantityChanged'; toyId: string; qty: number }
  | { type: 'removed'; toyId: string }
  | { type: 'cleared' };

export function cartReducer(items: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'added': {
      const { toy, qty } = action;
      const existing = items.find(item => item.toyId === toy.id);
      if (existing) {
        return items.map(item =>
          item.toyId === toy.id ? { ...item, qty: item.qty + qty } : item,
        );
      }
      return [
        ...items,
        { toyId: toy.id, name: toy.name, emoji: toy.emoji, price: toy.price, qty },
      ];
    }

    case 'quantityChanged':
      return items
        .map(item => (item.toyId === action.toyId ? { ...item, qty: action.qty } : item))
        .filter(item => item.qty > 0); // zero means "gone"

    case 'removed':
      return items.filter(item => item.toyId !== action.toyId);

    case 'cleared':
      return [];

    default: {
      // If we ever add an action and forget to handle it, TypeScript
      // complains here: "action" is no longer of type "never".
      const unhandled: never = action;
      throw new Error(`Unknown cart action: ${JSON.stringify(unhandled)}`);
    }
  }
}

// Handy calculations. They are derived from the items, never stored.
export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}
```

The rules every reducer must follow:

| Rule | Why |
|------|-----|
| **Pure**: no network calls, no random numbers, no changing outside things | Same input must always give the same output |
| **Never mutate** the old state; return a **new** array/object | React compares references (Lesson 5) |
| **Handle every action** (the `never` check) | The compiler finds the forgotten ones |
| **Describe what happened** in actions, not how to change the state | Rules live in one place |

## 3. Share it with two contexts

We want the cart everywhere (header, pages, checkout). We use **context** from Lesson 8, but with a twist: **two jars**.

- Jar 1 holds the **cart items** (changes often).
- Jar 2 holds **`dispatch`** (never changes: React keeps it the same function forever).

Components that only *add* to the cart read only jar 2, so they are not redrawn every time the cart changes.

📄 **`src/context/CartContext.tsx`** (new file)

```tsx
import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import type { CartItem } from '../types';
import { cartReducer, type CartAction } from './cartReducer';

const CartStateContext = createContext<CartItem[] | null>(null);
const CartDispatchContext = createContext<Dispatch<CartAction> | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  // useReducer(rule book, starting state) → [current state, dispatch]
  const [items, dispatch] = useReducer(cartReducer, []);

  return (
    <CartStateContext.Provider value={items}>
      <CartDispatchContext.Provider value={dispatch}>{children}</CartDispatchContext.Provider>
    </CartStateContext.Provider>
  );
}

export function useCart() {
  const items = useContext(CartStateContext);
  if (!items) throw new Error('useCart must be used inside <CartProvider>');
  return items;
}

export function useCartDispatch() {
  const dispatch = useContext(CartDispatchContext);
  if (!dispatch) throw new Error('useCartDispatch must be used inside <CartProvider>');
  return dispatch;
}
```

## 4. The cart screen

A drop-down panel in the header. It shows each line with the quantity picker from Lesson 5, a remove button, the total, and a **Clear cart** button that first asks "Are you sure?" in the pop-up from Lesson 7.

📄 **`src/components/CartDropdown.tsx`** (new file)

```tsx
import { useState } from 'react';
import { cartCount, cartTotal } from '../context/cartReducer';
import { useCart, useCartDispatch } from '../context/CartContext';
import { formatPrice } from '../lib/formatPrice';
import { Modal } from './Modal';
import { QuantityPicker } from './QuantityPicker';
import './CartDropdown.css';

export function CartDropdown() {
  const items = useCart();
  const dispatch = useCartDispatch();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const count = cartCount(items);
  const total = cartTotal(items);

  function emptyCart() {
    dispatch({ type: 'cleared' });
    setConfirmOpen(false);
    setOpen(false);
  }

  return (
    <div className="cart">
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
                      onChange={qty =>
                        dispatch({ type: 'quantityChanged', toyId: item.toyId, qty })
                      }
                    />
                    <span className="cart-row__price">
                      {formatPrice(item.price * item.qty)}
                    </span>
                    <button
                      type="button"
                      className="cart-row__remove"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => dispatch({ type: 'removed', toyId: item.toyId })}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              <p className="cart__total">
                Total: <strong>{formatPrice(total)}</strong>
              </p>
              <button type="button" onClick={() => setConfirmOpen(true)}>
                Clear cart
              </button>
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
            <button type="button" onClick={emptyCart}>
              Yes, empty it
            </button>
            <button type="button" onClick={() => setConfirmOpen(false)}>
              Keep shopping
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
```

📄 **`src/components/CartDropdown.css`** (new file)

```css
.cart {
  position: relative;
}

.cart__button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 0;
  border-radius: 999px;
  padding: var(--space-2) var(--space-3);
  font-weight: 600;
}

.cart__panel {
  position: absolute;
  right: 0;
  top: calc(100% + var(--space-2));
  z-index: 50;
  width: min(28rem, 90vw);
  padding: var(--space-3);
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.cart__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.cart-row {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
}

.cart-row .qty {
  margin-bottom: 0;
}

.cart-row__remove {
  background: transparent;
  border: 0;
  color: var(--color-danger);
}

.cart__total {
  text-align: right;
}

.cart__confirm-buttons {
  display: flex;
  gap: var(--space-2);
}
```

The header now uses the cart drop-down instead of the plain text, so it doesn't need `cartCount` or `cartTotal` props any more:

📄 **`src/components/Header.tsx`** (replace everything)

```tsx
import { CartDropdown } from './CartDropdown';
import { ThemeToggle } from './ThemeToggle';
import './Header.css';

interface HeaderProps {
  title: string;
  tagline?: string;
}

export function Header({ title, tagline = 'Toys for tiny hands' }: HeaderProps) {
  return (
    <header className="header">
      <div className="container header__inner">
        <div>
          <h1 className="header__title">🧸 {title}</h1>
          <p className="header__tagline">{tagline}</p>
        </div>
        <div className="header__actions">
          <CartDropdown />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
```

📄 **`src/components/Header.css`** (replace everything)

```css
.header {
  background: var(--color-brand);
  color: white;
  padding: var(--space-3) 0;
}

.header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.header__title {
  margin: 0;
  font-size: 1.6rem;
}

.header__tagline {
  margin: 0;
  opacity: 0.9;
}

.header__actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
```

One small job is left over: the browser-tab title used the cart count that `App` had. We give that job to a tiny component that draws nothing and only runs the effect:

📄 **`src/components/PageTitle.tsx`** (new file)

```tsx
import { useEffect } from 'react';
import { cartCount } from '../context/cartReducer';
import { useCart } from '../context/CartContext';

// Draws nothing. Its only job is to keep the browser tab title in step with the cart.
export function PageTitle() {
  const count = cartCount(useCart());

  useEffect(() => {
    document.title = count > 0 ? `(${count}) Tiny Toy Shop` : 'Tiny Toy Shop';
  }, [count]);

  return null;
}
```

## 5. Plug everything in

The provider goes around the app (inside the theme provider, anywhere above `App`):

📄 **`src/main.tsx`** (replace everything)

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </ThemeProvider>
  </StrictMode>,
);
```

`App` gets much shorter. It no longer owns the cart: it only **dispatches** into it. Compare with Lesson 7: the whole `setCart` block is gone.

📄 **`src/App.tsx`** (replace everything)

```tsx
import { useEffect, useRef, useState } from 'react';
import { CategoryFilter } from './components/CategoryFilter';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { PageTitle } from './components/PageTitle';
import { SaleBanner } from './components/SaleBanner';
import { SearchBox, type SearchBoxHandle } from './components/SearchBox';
import { Section } from './components/Section';
import { ToyList } from './components/ToyList';
import { ToyRoulette } from './components/ToyRoulette';
import { useCartDispatch } from './context/CartContext';
import type { CategoryChoice, Toy } from './types';
import './App.css';

type Status = 'loading' | 'error' | 'success';

export default function App() {
  const dispatch = useCartDispatch();

  // ── State ─────────────────────────────────────────────────────────
  const [toys, setToys] = useState<Toy[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [attempt, setAttempt] = useState(0);
  const [category, setCategory] = useState<CategoryChoice>('all');
  const [query, setQuery] = useState('');
  const [luckySeed] = useState(() => Math.random());
  const searchRef = useRef<SearchBoxHandle>(null);

  // ── Derived values ────────────────────────────────────────────────
  const visibleToys = toys.filter(toy => {
    const matchesCategory = category === 'all' || toy.category === category;
    const matchesQuery = toy.name.toLowerCase().includes(query.trim().toLowerCase());
    return matchesCategory && matchesQuery;
  });
  const toyOfTheDay =
    toys.length > 0 ? toys[Math.floor(luckySeed * toys.length)] : undefined;

  // ── Effects ───────────────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();

    fetch('/toys.json', { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error(`The toy truck broke down (${response.status})`);
        return response.json() as Promise<Toy[]>;
      })
      .then(data => {
        setToys(data);
        setStatus('success');
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setStatus('error');
      });

    return () => controller.abort();
  }, [attempt]);

  // ── Events ────────────────────────────────────────────────────────
  function handleAdd(toy: Toy, qty: number) {
    dispatch({ type: 'added', toy, qty });
  }

  function retry() {
    setStatus('loading');
    setAttempt(a => a + 1);
  }

  return (
    <>
      <PageTitle />
      <Header title="Tiny Toy Shop" />
      <main className="container">
        <SaleBanner />

        {toyOfTheDay && (
          <p className="toy-of-the-day">
            ⭐ Toy of the day: {toyOfTheDay.emoji} <strong>{toyOfTheDay.name}</strong>
          </p>
        )}

        {toys.length > 0 && <ToyRoulette toys={toys} />}

        <Section title={status === 'success' ? `Our toys (${visibleToys.length})` : 'Our toys'}>
          <div className="toolbar">
            <SearchBox ref={searchRef} value={query} onChange={setQuery} />
            {query !== '' && (
              <button type="button" onClick={() => searchRef.current?.clear()}>
                Clear search
              </button>
            )}
            <CategoryFilter selected={category} onSelect={setCategory} />
          </div>

          {status === 'loading' && <p>Opening the toy box… 📦</p>}

          {status === 'error' && (
            <div role="alert">
              <p>Oh no! The toy truck got lost on the way. 🚚💨</p>
              <button type="button" onClick={retry}>
                Try again
              </button>
            </div>
          )}

          {status === 'success' && <ToyList toys={visibleToys} onAdd={handleAdd} />}
        </Section>
      </main>
      <Footer />
    </>
  );
}
```

Try the cart: add some toys, open the **🛒** button, change an amount, remove a line, and press **Clear cart**. A pop-up asks for confirmation. The tab title still shows the number of items.

## 6. What just happened?

### The `dispatch` loop

1. You press **✕** → `dispatch({ type: 'removed', toyId })`.
2. React calls `cartReducer(currentItems, thatAction)`.
3. The reducer returns a **new** array.
4. React stores it and re-renders the components that read `CartStateContext`: `CartDropdown` and `PageTitle`.

### Why two contexts?

`App` only needs `dispatch`, which **never changes**. Because `App` reads only `CartDispatchContext`, it is **not** redrawn when the cart changes. (Try it: put `console.log('App drew')` in `App` and add something to the cart. It stays silent. Then put the `console.log` in `CartDropdown`. It speaks every time.) If we had used one context with `{ items, dispatch }` together, every change in the cart would redraw `App` and everything under it.

### `useState` or `useReducer`?

| Choose `useState` when… | Choose `useReducer` when… |
|-------------------------|---------------------------|
| One simple value | Several values that change together |
| Updates are independent | The next state depends on the previous one in complicated ways |
| The logic fits in one line | You want all the changes in **one place**, easy to read and test |

### Reducers are pure (and StrictMode checks!)

React is allowed to call your reducer more than once. In development `StrictMode` calls it **twice on purpose** and checks that both results match. An impure reducer (random numbers, `Date.now()`, a `fetch`) would give different results and reveal itself. Side effects belong in event handlers or effects, never in the reducer.

### Small things worth noticing

- Actions describe *what happened* (`'removed'`), not *how to change the cart*. The "how" lives only in the reducer.
- The `QuantityPicker` from Lesson 5 worked in a new place without changes. That's what reusable bricks are for.
- The `Modal` from Lesson 7 is reused for the confirmation.
- Keep the reducer in its own file so it can be tested without drawing anything. (In Lesson 16 these same rules move into a store, and Lesson 21 tests them there.)

## 🧪 Try it yourself

1. **Forget an action.** Add `| { type: 'halved' }` to `CartAction` and see TypeScript complain in the reducer's `default` branch. Handle it (halve every quantity, minimum 1) or remove it.
2. **Impurity detector.** Add `console.log('reducer ran', action.type)` at the top of `cartReducer`. Click once and count the log lines (two in development!). Remove it.
3. **A new action.** Add `{ type: 'incremented'; toyId: string }` so a "+1" button can use it instead of `quantityChanged`.
4. **Max 9.** The picker stops at 9, but the `added` action keeps adding. Put the "max 9 of one toy" rule in the reducer with `Math.min`. Where is the best place for a business rule?
5. **Break the rule.** Change `case 'cleared': return [];` to `items.length = 0; return items;` and click Clear. What happens (or doesn't) and why?

## ✅ Check yourself

<details>
<summary>1. What does a reducer receive and return?</summary>

The current state and an action; it returns the next state.
</details>

<details>
<summary>2. Why must reducers be pure and never mutate state?</summary>

React may call them more than once and compares old and new state by reference. Side effects or mutation lead to inconsistent results and missed updates.
</details>

<details>
<summary>3. Why did we use two contexts instead of one?</summary>

`dispatch` never changes, while the items change often. Components that only dispatch can read the `dispatch` context and avoid re-rendering whenever the items change.
</details>

<details>
<summary>4. What does the <code>never</code> check in the <code>default</code> branch give us?</summary>

If an action type is added but not handled, TypeScript reports an error, so we can't forget a case.
</details>

## Recap

- An action says *what happened*; a reducer decides *the next state*.
- `useReducer(reducer, initial)` returns `[state, dispatch]`.
- Reducers are pure, never mutate, and handle every action.
- Pair a reducer with context to share state without prop drilling; split state and dispatch into separate contexts.
- Keep reducers in their own files so they are easy to test.

➡️ **Next:** [Lesson 10 – Custom hooks: your own recipe cards](10-custom-hooks.md)
