# Lesson 10: Custom Hooks – Your Own Recipe Cards

> **Like I'm 5:** A custom hook is a recipe card you write once. Any cook in the kitchen can use it to make the same dish with their own ingredients.

| | |
|---|---|
| **Concept reference** | [13 – Custom hooks](../concepts/13-custom-hooks.md) |
| **You will learn** | What a custom hook is, the rules of hooks, and how to write `useWindowWidth`, `useLocalStorage`, `useDebounce`, `useMediaQuery`, `useOnClickOutside`, `useFetch` and a hook built from other hooks |
| **We build** | A cart and theme that survive a page reload, a search that waits until you stop typing, a cart panel that closes when you click outside, and tidier components |
| **Time** | About 75 minutes |

## The story

Look at the code we wrote so far. Some patterns appear again and again:

- "listen to the window, and remove the listener" (footer, search box, modal),
- "fetch something with loading and error" (the toy list),
- "save to the browser and read it back" (we haven't done it yet, but we want to).

When you notice the same recipe twice, write it on a **recipe card** and share it. In React, a recipe card is a **custom hook**.

## 1. What is a custom hook?

A custom hook is a normal function that:

1. has a name starting with **`use`** (`useWindowWidth`), and
2. **calls other hooks** inside (`useState`, `useEffect`, …).

That's all. You pull the repeated logic out of the component, and the component shrinks:

```tsx
// Before: 8 lines of state + effect + cleanup inside the component
// After:
const width = useWindowWidth();
```

> **A custom hook shares logic, not state.** If two components call `useWindowWidth()`, each one gets its **own** separate `width`. The recipe is shared; the cake is not.

The name must start with `use` so React's lint rules can recognise it and check that it's used correctly.

## 2. The rules of hooks

Hooks (the built-in ones and yours) must be called like this:

1. **Only at the top level** of a component or another hook. Never inside `if`, loops, or nested functions.
2. **In the same order on every render.** React remembers state by the *order* of the hook calls.
3. **Only from React functions**: components and custom hooks, not regular functions.

```tsx
function Bad({ loggedIn }: { loggedIn: boolean }) {
  if (loggedIn) {
    const [name, setName] = useState('');   // ❌ sometimes called, sometimes not
  }
}
```

Our linter enforces this with the `react/rules-of-hooks` rule that has been on since Lesson 1. (Try it at the end of the lesson.)

## 3. Hook #1: `useWindowWidth`

This is the footer's code, moved out.

📄 **`src/hooks/useWindowWidth.ts`** (new file)

```ts
import { useEffect, useState } from 'react';

export function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return width;
}
```

The footer becomes simpler. It only worries about what to **show**:

📄 **`src/components/Footer.tsx`** (replace everything)

```tsx
import { useState } from 'react';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { Modal } from './Modal';
import './Footer.css';

const year = new Date().getFullYear();

export function Footer() {
  const width = useWindowWidth();
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span>
          © {year} Tiny Toy Shop · Your window is {width}px wide
        </span>
        <button type="button" className="footer__help" onClick={() => setHelpOpen(true)}>
          ❓ How to shop
        </button>
      </div>

      {helpOpen && (
        <Modal title="How to shop" onClose={() => setHelpOpen(false)}>
          <ol>
            <li>Pick a toy you like.</li>
            <li>Choose how many you want with the + and − buttons.</li>
            <li>Press “Add to cart”.</li>
            <li>Watch the cart in the top corner grow!</li>
          </ol>
          <p>Tip: press the “/” key to jump to the search box.</p>
        </Modal>
      )}
    </footer>
  );
}
```

## 4. Hook #2: `useLocalStorage`

`localStorage` is a little notebook that the browser keeps for your site. It survives page reloads. This hook works like `useState`, but also writes to the notebook.

First two helpers that read and write safely (a notebook can be blocked, full or hold garbage):

📄 **`src/lib/storage.ts`** (new file)

```ts
export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback; // blocked, or not valid JSON
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The storage may be full or blocked (private mode). The app still works.
  }
}
```

📄 **`src/hooks/useLocalStorage.ts`** (new file)

```ts
import { useEffect, useState } from 'react';
import { readJson, writeJson } from '../lib/storage';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Lazy initial state (Lesson 5): read the notebook only on the first render.
  const [value, setValue] = useState<T>(() => readJson(key, initialValue));

  // Whenever the value changes, write it down.
  useEffect(() => {
    writeJson(key, value);
  }, [key, value]);

  return [value, setValue] as const; // same shape as useState
}
```

`as const` tells TypeScript the return is a fixed pair `[T, setter]`, not a loose array.

### A hook built from hooks: `usePersistentReducer`

The cart uses `useReducer`, not `useState`. We can build a reducer version out of the same idea. `useReducer` accepts a third argument: a function that creates the starting state.

📄 **`src/hooks/usePersistentReducer.ts`** (new file)

```ts
import { useEffect, useReducer } from 'react';
import { readJson, writeJson } from '../lib/storage';

export function usePersistentReducer<State, Action>(
  reducer: (state: State, action: Action) => State,
  key: string,
  initialState: State,
) {
  // The third argument is a function that picks the starting state: saved, or the default.
  const [state, dispatch] = useReducer(reducer, initialState, fallback =>
    readJson<State>(key, fallback),
  );

  useEffect(() => {
    writeJson(key, state);
  }, [key, state]);

  return [state, dispatch] as const;
}
```

Use them. The theme remembers the visitor's choice, and the **first** time (nothing saved yet) follows their computer's dark-mode setting, which needs one more hook:

## 5. Hook #3: `useMediaQuery`

📄 **`src/hooks/useMediaQuery.ts`** (new file)

```ts
import { useEffect, useState } from 'react';

// Some environments (like the test runner we meet later) have no matchMedia.
const canMatch = typeof window !== 'undefined' && typeof window.matchMedia === 'function';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => (canMatch ? window.matchMedia(query).matches : false));

  useEffect(() => {
    if (!canMatch) return;
    const list = window.matchMedia(query);
    const onChange = () => setMatches(list.matches);
    onChange();
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
```

📄 **`src/context/ThemeContext.tsx`** (replace everything)

```tsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useMediaQuery } from '../hooks/useMediaQuery';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  // Saved choice wins. If nothing is saved, follow the computer's setting.
  const [theme, setTheme] = useLocalStorage<Theme>('theme', prefersDark ? 'dark' : 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggle: () => setTheme(current => (current === 'light' ? 'dark' : 'light')),
    }),
    [theme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return context;
}
```

And the cart keeps its items between visits with one changed line:

📄 **`src/context/CartContext.tsx`** (replace everything)

```tsx
import { createContext, useContext, type Dispatch, type ReactNode } from 'react';
import { usePersistentReducer } from '../hooks/usePersistentReducer';
import type { CartItem } from '../types';
import { cartReducer, type CartAction } from './cartReducer';

const CartStateContext = createContext<CartItem[] | null>(null);
const CartDispatchContext = createContext<Dispatch<CartAction> | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  // Same as before, but saved in the browser under the name "cart".
  const [items, dispatch] = usePersistentReducer(cartReducer, 'cart', []);

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

## 6. Hook #4: `useDebounce`

Typing "rainbow" fires seven key presses. Filtering after each one is wasteful when we only care about the final word. A debounced value is one that **catches up after the typing pauses**.

📄 **`src/hooks/useDebounce.ts`** (new file)

```ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id); // typing again cancels the old timer
  }, [value, delayMs]);

  return debounced;
}
```

How it works: every time `value` changes, the effect starts a stopwatch. If the value changes again before the time is up, the **cleanup** cancels the old stopwatch and a new one starts. Only when the typing pauses does the stopwatch finish.

## 7. Hook #5: `useOnClickOutside`

The cart panel should close when you click anywhere else.

📄 **`src/hooks/useOnClickOutside.ts`** (new file)

```ts
import { useEffect, type RefObject } from 'react';

export function useOnClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;

    function onPointerDown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    }

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [ref, handler, enabled]);
}
```

Use it in the cart drop-down. The listener is only active while the panel is open and the "Are you sure?" pop-up is not showing:

📄 **`src/components/CartDropdown.tsx`** (replace everything)

```tsx
import { useRef, useState } from 'react';
import { cartCount, cartTotal } from '../context/cartReducer';
import { useCart, useCartDispatch } from '../context/CartContext';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { formatPrice } from '../lib/formatPrice';
import { Modal } from './Modal';
import { QuantityPicker } from './QuantityPicker';
import './CartDropdown.css';

export function CartDropdown() {
  const items = useCart();
  const dispatch = useCartDispatch();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Click anywhere outside the cart → close the panel.
  useOnClickOutside(rootRef, () => setOpen(false), open && !confirmOpen);

  const count = cartCount(items);
  const total = cartTotal(items);

  function emptyCart() {
    dispatch({ type: 'cleared' });
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

## 8. Hook #6: `useFetch`

This is the loading / error / success dance from Lesson 6, written once.

📄 **`src/hooks/useFetch.ts`** (new file)

```ts
import { useEffect, useState } from 'react';

interface FetchState<T> {
  data?: T;
  error?: Error;
  loading: boolean;
}

export function useFetch<T>(url: string) {
  const [state, setState] = useState<FetchState<T>>({ loading: true });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true });

    fetch(url, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        return response.json() as Promise<T>;
      })
      .then(data => setState({ data, loading: false }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setState({
          error: error instanceof Error ? error : new Error(String(error)),
          loading: false,
        });
      });

    return () => controller.abort();
  }, [url, attempt]); // new address or a retry → fetch again

  // "Try again": bump the counter, which re-runs the effect.
  function reload() {
    setAttempt(a => a + 1);
  }

  return { ...state, reload };
}
```

## 9. Use the hooks in `App`

Compare this `App` with the one from Lesson 9: the whole fetch effect and three `useState`s are gone, replaced by one line. The search also uses `useDebounce`.

📄 **`src/App.tsx`** (replace everything)

```tsx
import { useRef, useState } from 'react';
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
import { useDebounce } from './hooks/useDebounce';
import { useFetch } from './hooks/useFetch';
import type { CategoryChoice, Toy } from './types';
import './App.css';

export default function App() {
  const dispatch = useCartDispatch();

  // One line replaces the old toys / status / attempt / effect.
  const { data, error, loading, reload } = useFetch<Toy[]>('/toys.json');
  const toys = data ?? [];

  const [category, setCategory] = useState<CategoryChoice>('all');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300); // catches up when typing pauses
  const [luckySeed] = useState(() => Math.random());
  const searchRef = useRef<SearchBoxHandle>(null);

  const visibleToys = toys.filter(toy => {
    const matchesCategory = category === 'all' || toy.category === category;
    const matchesQuery = toy.name.toLowerCase().includes(debouncedQuery.trim().toLowerCase());
    return matchesCategory && matchesQuery;
  });
  const toyOfTheDay =
    toys.length > 0 ? toys[Math.floor(luckySeed * toys.length)] : undefined;

  function handleAdd(toy: Toy, qty: number) {
    dispatch({ type: 'added', toy, qty });
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

        <Section title={data ? `Our toys (${visibleToys.length})` : 'Our toys'}>
          <div className="toolbar">
            <SearchBox ref={searchRef} value={query} onChange={setQuery} />
            {query !== '' && (
              <button type="button" onClick={() => searchRef.current?.clear()}>
                Clear search
              </button>
            )}
            <CategoryFilter selected={category} onSelect={setCategory} />
          </div>

          {loading && <p>Opening the toy box… 📦</p>}

          {error && (
            <div role="alert">
              <p>Oh no! The toy truck got lost on the way. 🚚💨</p>
              <button type="button" onClick={reload}>
                Try again
              </button>
            </div>
          )}

          {data && <ToyList toys={visibleToys} onAdd={handleAdd} />}
        </Section>
      </main>
      <Footer />
    </>
  );
}
```

Test it:

1. Add a toy to the cart and **reload the page**. The cart is still there.
2. Switch to dark mode and reload. Still dark.
3. Open the cart panel, then click on the page background. The panel closes.
4. Type quickly in the search box. The list updates only after you pause for a moment.

Open the browser dev tools → *Application* → *Local Storage* to see the saved `cart` and `theme` entries.

## 10. What just happened?

- **Components got smaller** and describe what to *show*. The *how* (listeners, notebooks, timers) is in hooks you can name and reuse.
- **Hooks can call other hooks.** `usePersistentReducer` uses `useReducer` and `useEffect`; `ThemeProvider` uses `useMediaQuery` and `useLocalStorage`.
- Each call gets **its own state**. If the footer and another component both call `useWindowWidth()`, each has a private `width`.
- A hook returns **whatever is convenient**: a value (`useWindowWidth`), a pair like `useState` (`useLocalStorage`), or an object (`useFetch`). Keep the result small and typed.
- `useFetch` is a good lesson, not a final answer. It doesn't share results between components or cache them. Lesson 15 replaces it with a library.

### More ideas for hooks

| Hook | What it does |
|------|--------------|
| `useToggle(initial)` | `[on, toggle]` for pop-ups and menus |
| `useInterval(fn, ms)` | A safe `setInterval` that cleans up |
| `usePrevious(value)` | Remembers the last value (with a ref) |
| `useKeyPress(key)` | Reacts to a key |

Hooks are easy to test: with React Testing Library's `renderHook` you test a hook without drawing a screen (Lesson 21).

## 🧪 Try it yourself

1. **Break rule 1.** In `ToyRoulette.tsx`, put `if (toys.length > 0) { const [x] = useState(0); }` at the top of the component and run `npm run lint`. Read the error. Then remove it.
2. **Write `useToggle`.** Create `src/hooks/useToggle.ts` returning `[value, toggle]` and use it for the help pop-up in `Footer`. (Hint: `setValue(v => !v)`.)
3. **Use `useDebounce` differently.** Debounce the window width in the footer so it only updates when you stop resizing.
4. **Two components, two states.** Call `useWindowWidth()` in a second place too (for example, show the width in the `Header`). Both show the same number because they listen to the same window, but inside React each call has its own private `width` state.
5. **A corrupted notebook.** In dev tools → Application → Local Storage, change the `cart` value to `hello` (not valid JSON) and reload. The shop still opens with an empty cart. Which function saved us? (`readJson`'s `try/catch`.)

## ✅ Check yourself

<details>
<summary>1. What makes a function a custom hook?</summary>

Its name starts with `use` and it calls other hooks inside it.
</details>

<details>
<summary>2. If two components call the same custom hook, do they share state?</summary>

No. They share the *logic*; each call has its own state.
</details>

<details>
<summary>3. Name two of the rules of hooks.</summary>

Call hooks only at the top level (not in loops, conditions or nested functions), in the same order every render, and only from components or other hooks.
</details>

<details>
<summary>4. Why does <code>useDebounce</code> return the cleanup <code>clearTimeout(id)</code>?</summary>

So that if the value changes again before the delay is over, the old timer is cancelled and only the last value gets through.
</details>

## Recap

- A custom hook is a `use…` function that calls other hooks. It shares logic, not state.
- Follow the rules of hooks: top level, same order, only in React functions.
- We wrote `useWindowWidth`, `useLocalStorage`, `usePersistentReducer`, `useMediaQuery`, `useDebounce`, `useOnClickOutside` and `useFetch`.
- Good hooks do one job and return a simple, typed value.

➡️ **Next:** [Lesson 11 – Memoization: sticky notes with answers](11-memoization.md)
