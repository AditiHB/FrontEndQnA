# Lesson 7: Refs and the DOM – Reaching Out and Touching

> **Like I'm 5:** A ref is a sticky note with a pointer to one toy on the shelf. You can point to the toy and touch it directly, but changing the sticky note itself does not make the room redraw.

| | |
|---|---|
| **Concept reference** | [06 – Refs & the DOM](../concepts/06-refs-and-the-dom.md) |
| **You will learn** | `useRef` for DOM elements and for values that don't redraw anything, `ref` as a normal prop (React 19), callback refs with cleanup, `useImperativeHandle`, portals (`createPortal`) |
| **We build** | A search box that takes focus and reacts to the "/" key, a "toy roulette", a card pop-in animation and a help pop-up window |
| **Time** | About 60 minutes |

## The story

Most of the time React draws everything for us from state, and we never touch the page directly. But sometimes we need to *reach out and touch* an element:

- put the blinking cursor in the search box,
- measure something,
- start a timer and remember its number so we can stop it later,
- show a pop-up window above everything else.

For those jobs React gives us **refs**.

## 1. What is a ref?

```tsx
const inputRef = useRef<HTMLInputElement>(null);
// ...
<input ref={inputRef} />
// later: inputRef.current is the real <input> element (or null before it exists)
```

A ref is a plain box with one slot: `{ current: ... }`. It has two jobs:

| Job | Example |
|-----|---------|
| **Point to a DOM element** | focus an input, scroll to something, measure |
| **Remember a value without redrawing** | a timer id, the previous value of something |

How is that different from state?

| | `useState` | `useRef` |
|---|-----------|----------|
| Survives re-renders | ✅ | ✅ |
| Changing it redraws the screen | ✅ | ❌ |
| Use it for | Things the **screen shows** | Things the **screen doesn't show** |

## 2. A text input that accepts a ref

In older React you needed a special wrapper called `forwardRef` to pass a ref through a component. **In React 19, `ref` is just a normal prop** for function components. That makes this wrapper very simple.

📄 **`src/components/TextInput.tsx`** (new file)

```tsx
import type { ComponentProps } from 'react';
import './TextInput.css';

// ComponentProps<'input'> means "every prop a normal <input> accepts, including ref".
export function TextInput({ ref, className = '', ...props }: ComponentProps<'input'>) {
  return <input ref={ref} className={`text-input ${className}`.trim()} {...props} />;
}
```

📄 **`src/components/TextInput.css`** (new file)

```css
.text-input {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
}

.text-input:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 1px;
}
```

(`...props` collects "everything else" and pours it onto the `<input>`, just like the spread in Lesson 2.)

## 3. Search box: focus, the "/" key and a remote control

We'll upgrade `SearchBox` with three tricks:

1. **Focus on load.** An effect uses the ref to call `.focus()` once the input exists.
2. **Press `/` anywhere** to jump to the search box (a global key listener, with cleanup, like Lesson 6).
3. **A small remote control for the parent.** With `useImperativeHandle` the search box gives its parent only two buttons: `focus()` and `clear()`, not the whole DOM element. The parent holds the remote in its own ref.

📄 **`src/components/SearchBox.tsx`** (replace everything)

```tsx
import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import { TextInput } from './TextInput';
import './SearchBox.css';

// The only two buttons on the remote control.
export interface SearchBoxHandle {
  focus: () => void;
  clear: () => void;
}

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  ref?: Ref<SearchBoxHandle>; // React 19: ref is a normal prop
}

export function SearchBox({ value, onChange, ref }: SearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Put the cursor in the box when the page opens.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 2. Press "/" anywhere (when not already typing) to jump to the box.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;
      if (event.key === '/' && !isTyping) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // 3. The remote control for the parent.
  useImperativeHandle(
    ref,
    () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => {
        onChange('');
        inputRef.current?.focus();
      },
    }),
    [onChange],
  );

  return (
    <div className="search-box">
      <label htmlFor="toy-search" className="visually-hidden">
        Search toys
      </label>
      <TextInput
        ref={inputRef}
        id="toy-search"
        type="search"
        placeholder="Search toys…  (press / to jump here)"
        value={value}
        onChange={event => onChange(event.target.value)}
      />
    </div>
  );
}
```

📄 **`src/components/SearchBox.css`** (replace everything)

```css
.search-box {
  flex: 1 1 16rem;
}

.search-box input {
  width: 100%;
  border-radius: 999px;
}
```

> **A note on kindness:** Taking focus automatically is fine for a demo. On real pages it can surprise screen-reader users and pop up the keyboard on phones, so do it only when the page's main job is that field.

## 4. A toy roulette: a ref that holds a timer id

Press **Spin** and toys flash by. Press **Stop** and you've "won" one. We start an interval and must remember its **id** so that Stop can cancel it. The id is **not shown on screen**, so it belongs in a ref. Whether it is currently spinning *is* shown (the button label), so that part is state.

📄 **`src/components/ToyRoulette.tsx`** (new file)

```tsx
import { useEffect, useRef, useState } from 'react';
import type { Toy } from '../types';
import './ToyRoulette.css';

export function ToyRoulette({ toys }: { toys: Toy[] }) {
  const [index, setIndex] = useState(0);
  const [spinning, setSpinning] = useState(false); // the screen shows this
  const timerId = useRef<number | null>(null); // the screen does NOT show this

  function spin() {
    if (timerId.current !== null) return;
    timerId.current = window.setInterval(() => {
      setIndex(i => (i + 1) % toys.length);
    }, 120);
    setSpinning(true);
  }

  function stop() {
    if (timerId.current === null) return;
    window.clearInterval(timerId.current);
    timerId.current = null; // changing a ref does NOT redraw anything
    setSpinning(false);
  }

  // If the roulette is removed while it is spinning, stop the timer.
  useEffect(() => {
    return () => {
      if (timerId.current !== null) window.clearInterval(timerId.current);
    };
  }, []);

  const toy = toys[index];

  return (
    <div className="roulette">
      <span className="roulette__toy" aria-live="polite">
        🎰 {toy.emoji} {toy.name}
      </span>
      <button type="button" onClick={spinning ? stop : spin}>
        {spinning ? 'Stop' : 'Spin'}
      </button>
    </div>
  );
}
```

📄 **`src/components/ToyRoulette.css`** (new file)

```css
.roulette {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin: var(--space-3) 0 0;
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.roulette button {
  background: var(--color-accent);
  color: white;
  border: 0;
  border-radius: 999px;
  padding: var(--space-1) var(--space-3);
  font-weight: 600;
}
```

## 5. Callback refs: a pop-in animation for cards

Instead of a `{ current }` box you can give `ref` a **function**. React calls it with the real element as soon as it is on the page. In React 19, that function can **return a cleanup function** (just like an effect).

We'll make each card gently pop in when it appears.

📄 **`src/components/ToyCard.tsx`** (replace everything)

```tsx
import { useState } from 'react';
import type { Toy } from '../types';
import { formatPrice } from '../lib/formatPrice';
import { CategoryBadge } from './CategoryBadge';
import { QuantityPicker } from './QuantityPicker';
import './ToyCard.css';

interface ToyCardProps {
  toy: Toy;
  badge?: string;
  onAdd: (toy: Toy, qty: number) => void;
}

// A callback ref. It lives OUTSIDE the component so it is the very same
// function on every render. React calls it once, when the card appears.
function popIn(node: HTMLElement | null) {
  if (!node) return;
  const animation = node.animate?.(
    [
      { opacity: 0, transform: 'scale(0.9)' },
      { opacity: 1, transform: 'scale(1)' },
    ],
    { duration: 250, easing: 'ease-out' },
  );
  return () => animation?.cancel(); // cleanup, new in React 19
}

export function ToyCard({ toy, badge, onAdd }: ToyCardProps) {
  const [qty, setQty] = useState(1);

  function handleAdd() {
    onAdd(toy, qty);
    setQty(1);
  }

  return (
    <article className="toy-card" ref={popIn}>
      {badge && <span className="toy-card__badge">{badge}</span>}
      {!toy.inStock && (
        <span className="toy-card__badge toy-card__badge--sold-out">Sold out</span>
      )}
      <div className="toy-card__emoji" aria-hidden="true">
        {toy.emoji}
      </div>
      <h3 className="toy-card__name">{toy.name}</h3>
      <CategoryBadge category={toy.category} />
      <p className="toy-card__price">{formatPrice(toy.price)}</p>
      <QuantityPicker qty={qty} onChange={setQty} disabled={!toy.inStock} />
      <button
        type="button"
        className="toy-card__button"
        disabled={!toy.inStock}
        onClick={handleAdd}
      >
        {toy.inStock ? 'Add to cart' : 'Sold out'}
      </button>
    </article>
  );
}
```

> **Why outside the component?** If you wrote the arrow function *inline* (`ref={node => …}`), it would be a brand-new function on every render. React would think "the ref changed", run the old cleanup and call the new function again, replaying the animation each time you press **+**. A function defined outside the component never changes. (Lesson 11 shows `useCallback` for the cases where the function must live inside.)

## 6. A pop-up window with a portal

A pop-up (a **modal**) must sit on top of everything and block clicks behind it. If we draw it deep inside the page, a parent with `overflow: hidden` or a `transform` can clip it or trap it underneath other things.

A **portal** solves it: the component stays where it is in the React tree, but its HTML is drawn somewhere else, here directly inside `<body>`.

```text
 React tree:        App → Footer → Modal           (where you wrote it)
 Real page (DOM):   <body> … <div id="root">…</div>  <div class="modal-backdrop">…</div>
                                                     ▲ drawn here by createPortal
```

The modal also uses refs and effects: it moves focus to its **Close** button when it opens and closes when you press **Escape**.

📄 **`src/components/Modal.tsx`** (new file)

```tsx
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Move the cursor into the pop-up when it opens.
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  // Escape closes it.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={event => event.stopPropagation()}
      >
        <header className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="modal__close"
            aria-label="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
```

📄 **`src/components/Modal.css`** (new file)

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: var(--space-3);
  background: rgba(0, 0, 0, 0.5);
}

.modal {
  width: min(32rem, 100%);
  max-height: 90vh;
  overflow: auto;
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: var(--radius);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.modal__title {
  margin: 0;
  font-size: 1.2rem;
}

.modal__close {
  background: transparent;
  color: var(--color-text);
  border: 0;
  font-size: 1.2rem;
}

.modal__body {
  padding: var(--space-3);
}
```

The `<div className="modal" onClick={e => e.stopPropagation()}>` matters. **Events in a portal still bubble through the React tree**, not through the real page structure. A click inside the modal would reach the backdrop's `onClick` (which closes it) unless we stop it.

Use the modal from the footer's new "How to shop" button:

📄 **`src/components/Footer.tsx`** (replace everything)

```tsx
import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import './Footer.css';

const year = new Date().getFullYear();

export function Footer() {
  const [width, setWidth] = useState(window.innerWidth);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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

📄 **`src/components/Footer.css`** (replace everything)

```css
.footer {
  margin-top: var(--space-5);
  padding: var(--space-3) 0;
  border-top: 1px solid var(--color-border);
  color: var(--color-muted);
  font-size: 0.9rem;
}

.footer__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.footer__help {
  background: transparent;
  color: var(--color-link);
  border: 1px solid var(--color-link);
  border-radius: 999px;
  padding: var(--space-1) var(--space-3);
}
```

## 7. Put it all in `App`

Two changes: `App` keeps a ref to the search box's remote control, and shows a **Clear search** button. It also adds the roulette.

📄 **`src/App.tsx`** (replace everything)

```tsx
import { useEffect, useRef, useState } from 'react';
import { CategoryFilter } from './components/CategoryFilter';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { SaleBanner } from './components/SaleBanner';
import { SearchBox, type SearchBoxHandle } from './components/SearchBox';
import { Section } from './components/Section';
import { ToyList } from './components/ToyList';
import { ToyRoulette } from './components/ToyRoulette';
import type { CartItem, CategoryChoice, Toy } from './types';
import './App.css';

type Status = 'loading' | 'error' | 'success';

export default function App() {
  // ── State ─────────────────────────────────────────────────────────
  const [toys, setToys] = useState<Toy[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [attempt, setAttempt] = useState(0);
  const [category, setCategory] = useState<CategoryChoice>('all');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [luckySeed] = useState(() => Math.random());

  // A ref that will point at the SearchBox's remote control.
  const searchRef = useRef<SearchBoxHandle>(null);

  // ── Derived values ────────────────────────────────────────────────
  const visibleToys = toys.filter(toy => {
    const matchesCategory = category === 'all' || toy.category === category;
    const matchesQuery = toy.name.toLowerCase().includes(query.trim().toLowerCase());
    return matchesCategory && matchesQuery;
  });
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
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

  useEffect(() => {
    document.title = cartCount > 0 ? `(${cartCount}) Tiny Toy Shop` : 'Tiny Toy Shop';
  }, [cartCount]);

  // ── Events ────────────────────────────────────────────────────────
  function handleAdd(toy: Toy, qty: number) {
    setCart(prev => {
      const existing = prev.find(item => item.toyId === toy.id);
      if (existing) {
        return prev.map(item =>
          item.toyId === toy.id ? { ...item, qty: item.qty + qty } : item,
        );
      }
      return [
        ...prev,
        { toyId: toy.id, name: toy.name, emoji: toy.emoji, price: toy.price, qty },
      ];
    });
  }

  function retry() {
    setStatus('loading');
    setAttempt(a => a + 1);
  }

  return (
    <>
      <Header title="Tiny Toy Shop" cartCount={cartCount} cartTotal={cartTotal} />
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

Reload. The cursor is already in the search box. Press `Tab` away, then press `/`, and it jumps back. Type "cu" and press **Clear search**. Press **Spin**, then **Stop**. Click **❓ How to shop**, then press **Escape**.

## 8. What just happened?

- `useRef<HTMLInputElement>(null)` makes a box. React fills `inputRef.current` with the real `<input>` **after** the first draw, and sets it back to `null` if the element goes away. That's why the focus effect uses `inputRef.current?.focus()` with the `?.`.
- **`ref` is a normal prop** in React 19: `SearchBox` and `TextInput` simply receive it and pass it on. No `forwardRef` needed.
- **`useImperativeHandle`** replaces what the parent sees in `searchRef.current`. Instead of the whole `<input>` it gets `{ focus, clear }`. This keeps the inner details private. Use it sparingly: ordinary props are usually a clearer way to talk to a child. (A `clear` prop would work too.)
- **A ref holding a timer id** (`timerId.current`) survived re-renders but didn't redraw anything when we set it. That is the second job of refs.
- **A callback ref** (`popIn`) received the real `<article>` once, started an animation, and returned a cleanup.
- **`createPortal(jsx, document.body)`** drew the pop-up at the end of `<body>`, while React still treats it as a child of `Footer`.

### Rules of thumb

- Use refs for: **focus, scroll position, measuring elements, third-party libraries, timers**.
- **Don't read or write `ref.current` while drawing** (in the middle of the component function). The only exception is one-time lazy setup. Read and write refs in event handlers and effects.
- Prefer **declarative state** to poking at the DOM. If you can describe it with props and state, do that.
- A modal built by hand is a fine lesson, but real ones need more (trapping the Tab key inside, restoring focus when closed). The native `<dialog>` element or a library helps; keep that in mind for real projects.

## 🧪 Try it yourself

1. **See the "inline ref" trap.** In `ToyCard.tsx`, temporarily replace `ref={popIn}` with `ref={node => popIn(node)}`. Click **+** on a card and watch it replay the animation every time. Put `ref={popIn}` back.
2. **Roulette cleanup.** Press **Spin** and leave it running while you use the page. Now think: what would happen if the cleanup effect in `ToyRoulette` were missing and the roulette were removed from the page while it was still spinning? (The timer would keep calling `setIndex` for a component that no longer exists.)
3. **Bubbling.** In `Modal.tsx` remove `onClick={event => event.stopPropagation()}`. Open the help window and click inside the text. What happens? Put it back.
4. **A second remote button.** Add `select: () => inputRef.current?.select()` to the `SearchBoxHandle` and use it somewhere.
5. **Escape key rules.** Open the help window, press `Escape`. Check the console for errors: there should be none.

## ✅ Check yourself

<details>
<summary>1. What is the difference between <code>useRef</code> and <code>useState</code>?</summary>

Both survive re-renders. Changing state redraws the component; changing `ref.current` does not. Use state for what the screen shows and refs for everything else (DOM nodes, timer ids).
</details>

<details>
<summary>2. In React 19, how does a function component receive a <code>ref</code>?</summary>

As a normal prop named `ref`. `forwardRef` is no longer needed for new code.
</details>

<details>
<summary>3. Why is <code>ref.current</code> <code>null</code> at first?</summary>

React fills it only after the element has been drawn on the page. So read it in effects or event handlers, not during rendering.
</details>

<details>
<summary>4. Why use a portal for a modal?</summary>

So the pop-up's HTML sits at the top level of the page and can't be clipped or hidden by a parent's `overflow` or `z-index`, while it still belongs to the same place in the React tree (events bubble through React parents).
</details>

<details>
<summary>5. When should you use <code>useImperativeHandle</code>?</summary>

Rarely: when a parent truly needs to trigger an action in a child (like `focus()`), and you want to expose a small controlled API instead of the whole DOM node.
</details>

## Recap

- A ref is a `{ current }` box that survives re-renders; changing it doesn't redraw.
- Use refs to touch the DOM (focus, measure, scroll) and to hold values the screen doesn't show (timer ids).
- In React 19 `ref` is a normal prop, and callback refs can return a cleanup.
- `useImperativeHandle` exposes a small remote control instead of the whole element.
- `createPortal` draws children somewhere else in the page while keeping them in the React tree.
- Never read or write `ref.current` during rendering.

➡️ **Next:** [Lesson 8 – Context: the cookie jar in the middle of the room](08-context-and-prop-drilling.md)
