# Lesson 5: State – The Whiteboard That Makes the Screen Change

> **Like I'm 5:** State is a whiteboard in the room. When you write a new number on the whiteboard, React notices and redraws the room so it shows the new number.

| | |
|---|---|
| **Concept reference** | [04 – State with `useState`](../concepts/04-state-with-usestate.md) |
| **You will learn** | `useState`, re-rendering, updating from the previous value, replacing objects and arrays (immutability), lazy initial state, state per component instance, derived values, lifting state up, batching |
| **We build** | A quantity picker on every toy, a real cart count and total in the header, category buttons and a search box |
| **Time** | About 60 minutes |

## The story

Right now **Add to cart** shows an alert and forgets. A shop needs a memory: how many of each toy does the visitor want? What is in the cart? Which category did they click?

Plain variables can't do this. When a normal variable changes, React doesn't know, and nothing is redrawn. We need a special place React *watches*. That place is **state**.

## 1. What is state?

```tsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```

`useState(0)` gives you back **two things** (a pair, so we grab them with `[ , ]`):

| Piece | What it is |
|-------|-----------|
| `count` | The **current** value on the whiteboard (starts at `0`) |
| `setCount` | A function that **writes a new value** and tells React to redraw |

The magic loop:

```text
 click ──► setCount(1) ──► React: "the whiteboard changed!"
                                   │
                                   ▼
                       calls Counter() again (a "re-render")
                                   │
                                   ▼
                  this time useState gives count = 1
                                   │
                                   ▼
        new JSX → React compares with old → updates only the text
```

Important: **the function runs again from the top** on every re-render. The variable `count` is a fresh const each time. The value is kept safe by React, not by the function.

## 2. Step A: each toy gets a quantity picker

Every card needs its own number: "I want 3 Rainbow Blocks but 1 Cuddly Bear."

First a small presentational brick, the picker. It gets the number and a function to change it. It has no state of its own.

📄 **`src/components/QuantityPicker.tsx`** (new file)

```tsx
import './QuantityPicker.css';

const MIN = 1;
const MAX = 9;

interface QuantityPickerProps {
  qty: number;
  onChange: (qty: number) => void;
  disabled?: boolean;
}

export function QuantityPicker({ qty, onChange, disabled = false }: QuantityPickerProps) {
  return (
    <div className="qty" role="group" aria-label="Quantity">
      <button
        type="button"
        aria-label="One less"
        disabled={disabled || qty <= MIN}
        onClick={() => onChange(qty - 1)}
      >
        −
      </button>
      <output aria-live="polite">{qty}</output>
      <button
        type="button"
        aria-label="One more"
        disabled={disabled || qty >= MAX}
        onClick={() => onChange(qty + 1)}
      >
        +
      </button>
    </div>
  );
}
```

📄 **`src/components/QuantityPicker.css`** (new file)

```css
.qty {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.qty button {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-weight: 700;
}

.qty button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.qty output {
  min-width: 1.5rem;
  text-align: center;
  font-weight: 700;
}
```

Now `ToyCard` gets a whiteboard. It also calls `onAdd` with *how many* the visitor chose, and then resets the number to 1.

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

export function ToyCard({ toy, badge, onAdd }: ToyCardProps) {
  // Every ToyCard has its OWN whiteboard. Twelve cards = twelve separate numbers.
  const [qty, setQty] = useState(1);

  function handleAdd() {
    onAdd(toy, qty);
    setQty(1); // clear the whiteboard for the next customer
  }

  return (
    <article className="toy-card">
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

`ToyList` only needs its type updated, because `onAdd` now takes two things. We also remove the category-legend style we no longer need.

📄 **`src/components/ToyList.tsx`** (replace everything)

```tsx
import type { Toy } from '../types';
import { ToyCard } from './ToyCard';
import './ToyList.css';

interface ToyListProps {
  toys: Toy[];
  onAdd: (toy: Toy, qty: number) => void;
}

export function ToyList({ toys, onAdd }: ToyListProps) {
  if (toys.length === 0) {
    return <p className="toy-list__empty">No toys found. The shelf is empty 🙈</p>;
  }

  return (
    <ul className="toy-grid">
      {toys.map(toy => (
        <li key={toy.id}>
          <ToyCard toy={toy} onAdd={onAdd} />
        </li>
      ))}
    </ul>
  );
}
```

📄 **`src/components/ToyList.css`** (replace everything)

```css
.toy-list__empty {
  padding: var(--space-4);
  text-align: center;
  color: var(--color-muted);
  background: var(--color-surface);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius);
}
```

## 3. Step B: lift the cart up

The cart is needed in two places: `ToyCard` adds to it, and `Header` shows how many things are inside. Two bricks that are *not parent and child* need the same information.

The rule: **put the state in the nearest parent that contains everyone who needs it**. That is `App`. Moving state up to a shared parent is called **lifting state up**.

```text
          App  ← owns the cart (state)
         /    \
     Header   ToyList → ToyCard
   (shows it)         (adds to it through onAdd)
```

First, the shape of a cart line and of the filter choice. We add to the bottom of `types.ts`:

📄 **`src/types.ts`** (add to the bottom)

```ts
// One line in the shopping cart.
export interface CartItem {
  toyId: string;
  name: string;
  emoji: string;
  price: number;
  qty: number;
}

// The category buttons: one per category, plus "all".
export type CategoryChoice = Category | 'all';
```

Now the header shows what's in the cart:

📄 **`src/components/Header.tsx`** (replace everything)

```tsx
import { formatPrice } from '../lib/formatPrice';
import './Header.css';

interface HeaderProps {
  title: string;
  tagline?: string;
  cartCount: number;
  cartTotal: number;
}

export function Header({
  title,
  tagline = 'Toys for tiny hands',
  cartCount,
  cartTotal,
}: HeaderProps) {
  return (
    <header className="header">
      <div className="container header__inner">
        <div>
          <h1 className="header__title">🧸 {title}</h1>
          <p className="header__tagline">{tagline}</p>
        </div>
        <p className="header__cart" aria-live="polite">
          🛒 {cartCount} {cartCount === 1 ? 'item' : 'items'} · {formatPrice(cartTotal)}
        </p>
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

.header__cart {
  margin: 0;
  background: rgba(255, 255, 255, 0.2);
  padding: var(--space-2) var(--space-3);
  border-radius: 999px;
  font-weight: 600;
}
```

## 4. Step C: filter and search

Two more whiteboards for `App`: which category button is chosen, and what the visitor typed in the search box. Two small bricks to show them.

📄 **`src/components/CategoryFilter.tsx`** (new file)

```tsx
import { categoryInfo, categoryList } from '../lib/categories';
import type { CategoryChoice } from '../types';
import './CategoryFilter.css';

const choices: CategoryChoice[] = ['all', ...categoryList];

interface CategoryFilterProps {
  selected: CategoryChoice;
  onSelect: (choice: CategoryChoice) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="category-filter" role="group" aria-label="Filter by category">
      {choices.map(choice => (
        <button
          key={choice}
          type="button"
          className="category-filter__button"
          aria-pressed={choice === selected}
          onClick={() => onSelect(choice)}
        >
          {choice === 'all'
            ? 'All'
            : `${categoryInfo[choice].emoji} ${categoryInfo[choice].label}`}
        </button>
      ))}
    </div>
  );
}
```

📄 **`src/components/CategoryFilter.css`** (new file)

```css
.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.category-filter__button {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: var(--space-1) var(--space-3);
}

.category-filter__button[aria-pressed='true'] {
  background: var(--color-brand);
  border-color: var(--color-brand);
  color: white;
}
```

📄 **`src/components/SearchBox.tsx`** (new file)

```tsx
import './SearchBox.css';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBox({ value, onChange }: SearchBoxProps) {
  return (
    <div className="search-box">
      <label htmlFor="toy-search" className="visually-hidden">
        Search toys
      </label>
      <input
        id="toy-search"
        type="search"
        placeholder="Search toys…"
        value={value}
        onChange={event => onChange(event.target.value)}
      />
    </div>
  );
}
```

📄 **`src/components/SearchBox.css`** (new file)

```css
.search-box input {
  width: 100%;
  min-width: 14rem;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface);
  color: var(--color-text);
}
```

(The text in the input is *controlled by React*: the `value` always comes from state, and `onChange` writes typed letters back to the state. We study forms in depth in Lesson 13.)

## 5. Step D: the new `App`

This is where all the state lives. Read the comments slowly; this file is the heart of the lesson.

📄 **`src/App.tsx`** (replace everything)

```tsx
import { useState } from 'react';
import { CategoryFilter } from './components/CategoryFilter';
import { Header } from './components/Header';
import { SearchBox } from './components/SearchBox';
import { Section } from './components/Section';
import { ToyList } from './components/ToyList';
import { toys } from './data/toys';
import type { CartItem, CategoryChoice, Toy } from './types';
import './App.css';

export default function App() {
  // ── State: things that change and must be remembered ──────────────
  const [category, setCategory] = useState<CategoryChoice>('all');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Lazy initial state: the function runs only on the very first render,
  // so the "lucky number" stays the same while the visitor browses.
  const [luckySeed] = useState(() => Math.random());

  // ── Derived values: worked out from state while drawing ───────────
  // They are NOT stored in state. They can never get out of sync.
  const visibleToys = toys.filter(toy => {
    const matchesCategory = category === 'all' || toy.category === category;
    const matchesQuery = toy.name.toLowerCase().includes(query.trim().toLowerCase());
    return matchesCategory && matchesQuery;
  });
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const toyOfTheDay = toys[Math.floor(luckySeed * toys.length)];

  // ── Events ────────────────────────────────────────────────────────
  function handleAdd(toy: Toy, qty: number) {
    // "prev" is the cart as it is RIGHT NOW. We never change it; we build a new array.
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

  return (
    <>
      <Header title="Tiny Toy Shop" cartCount={cartCount} cartTotal={cartTotal} />
      <main className="container">
        <p className="toy-of-the-day">
          ⭐ Toy of the day: {toyOfTheDay.emoji} <strong>{toyOfTheDay.name}</strong>
        </p>

        <Section title={`Our toys (${visibleToys.length})`}>
          <div className="toolbar">
            <SearchBox value={query} onChange={setQuery} />
            <CategoryFilter selected={category} onSelect={setCategory} />
          </div>
          <ToyList toys={visibleToys} onAdd={handleAdd} />
        </Section>
      </main>
    </>
  );
}
```

📄 **`src/App.css`** (new file)

```css
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.toy-of-the-day {
  margin: var(--space-3) 0 0;
  padding: var(--space-2) var(--space-3);
  background: var(--color-brand-soft);
  border-radius: var(--radius);
}
```

Try the shop! Choose 3 on one toy and press **Add to cart**: the header changes. Click **Plush** to see only plush toys. Type "bear" in the search. Press the picker on one card and notice that the *other* cards are not affected.

## 6. What just happened?

### Every state variable is a separate whiteboard

`App` has four: `category`, `query`, `cart`, `luckySeed`. Each `ToyCard` has its own `qty`. State belongs to **one component instance** at one spot in the tree. Two `ToyCard`s have two separate quantities.

### Re-render in slow motion

Click **+** on a card:

1. `onChange(qty + 1)` runs → that is `setQty(2)`.
2. React saves `2` and says "this `ToyCard` needs redrawing".
3. React calls **only that `ToyCard`** (and its children) again. `useState(1)` now returns `2`.
4. The new JSX has `<output>2</output>`. React compares, changes the one text.

### Replace, never mutate

State must be treated as **read-only**. To change an object or array, make a **new copy** and hand that to the setter.

```tsx
// ❌ Wrong: changes the old array in place. React may not notice.
cart.push(newItem);
setCart(cart);

// ✅ Right: a new array
setCart([...cart, newItem]);               // add
setCart(cart.filter(i => i.toyId !== id)); // remove
setCart(cart.map(i => i.toyId === id ? { ...i, qty: 5 } : i)); // change one
```

For objects: `setUser({ ...user, name: 'Ravi' })` copies the old fields (`...user`) and overrides `name`. This habit is called **immutability**.

React decides "did it change?" by comparing **references**. A mutated array is still the same array, so React sees "no change".

### Use the "previous value" form when the new value depends on the old one

In `handleAdd` we wrote `setCart(prev => …)`. The function receives the latest value, so it is always right, even when several updates are queued together.

```tsx
setCount(prev => prev + 1);   // ✅ safe
setCount(count + 1);          // ⚠️ uses the count from this render
```

### Updates are batched, and `count` is a snapshot

When several `setSomething` calls happen in one click, React waits until your handler finishes, then redraws **once** (this is called **batching**). It also means that inside the handler the variable still holds the value from *this* render:

```tsx
function handleClick() {
  setQty(qty + 1);
  console.log(qty);   // still the OLD number! The new one arrives on the next render.
}
```

### Derived values are not state

`visibleToys`, `cartCount`, `cartTotal` and `toyOfTheDay` are **calculated** every time `App` draws. If we had stored `cartCount` in state *as well as* `cart`, we would have to keep the two in step, and one day they would disagree. Rule: **if you can work it out from other state, don't store it.** Keep state as small as possible.

### Lazy initial state

`useState(() => Math.random())` passes a **function**. React calls it only on the first render and ignores it afterwards. We used it for a random number, which is not allowed straight in the render (a component must be pure, remember?). If we had written `Math.random()` directly in the component body, "Toy of the day" would change on every re-render. Storing the seed in state keeps it steady. Lazy initial state is also the right tool for slow starts, like `useState(() => parseBigThing(localStorage.getItem('x')))`.

### Where should state live?

Start in the component that uses it. If a sibling needs it too, lift it to the nearest shared parent. Putting everything in `App` makes lots of things re-render and gets messy. Later lessons give you better places (context, reducers, stores).

## 🧪 Try it yourself

1. **Prove the cards are separate.** Raise the number on two different cards. Reload the page: it all resets. State lives in memory only. (Lesson 10 saves the cart in the browser.)
2. **Batching experiment.** In `ToyCard`, add this temporary function and a button that calls it:

   ```tsx
   function addThreeWrong() {
     setQty(qty + 1);
     setQty(qty + 1);
     setQty(qty + 1);
   }
   ```

   It adds **1**, not 3, because each line uses the same old `qty`. Change each line to `setQty(q => q + 1)` and it adds 3 (the picker caps at 9 in the UI, but the state can go higher). Remove the experiment afterwards.
3. **Mutation bug.** In `handleAdd`, replace the body with `cart.push({ toyId: toy.id, name: toy.name, emoji: toy.emoji, price: toy.price, qty }); setCart(cart);` and click Add. Does the header change? Why not? (Type a letter in the search box: suddenly the cart count catches up, because something else caused a re-render.) Put the real code back.
4. **Derived state.** Where would you have to add extra code if `cartCount` were its own state? (Hint: everywhere the cart changes.)
5. **Make it yours.** Add a **Reset filters** button next to the category buttons. When clicked it should set the category back to `'all'` and clear the search text. Which two setters do you need to call?

## ✅ Check yourself

<details>
<summary>1. Why can't a normal variable replace state?</summary>

Changing a normal variable doesn't tell React to redraw, and the variable is recreated from scratch every time the function runs. State is stored by React between renders, and the setter triggers a re-render.
</details>

<details>
<summary>2. What is wrong with <code>cart.push(item); setCart(cart);</code>?</summary>

It mutates the existing array and passes the same array back. React compares by reference, sees no change, and may not re-render. Make a new array: `setCart([...cart, item])`.
</details>

<details>
<summary>3. When do you use <code>setX(prev =&gt; …)</code>?</summary>

Whenever the new value depends on the old one, so that several updates in one event stack up correctly.
</details>

<details>
<summary>4. Should <code>cartCount</code> be a state variable if we already have <code>cart</code>?</summary>

No. It can be calculated from `cart`, so it is a derived value. Storing it would risk the two getting out of sync.
</details>

<details>
<summary>5. What does "lifting state up" mean?</summary>

Moving state to the nearest parent that contains every component that needs it, and passing the value and setters down through props.
</details>

## Recap

- `const [value, setValue] = useState(initial)` gives a remembered value and a setter that triggers a re-render.
- State is per component instance. Treat it as read-only: replace objects and arrays instead of mutating them.
- Use `setX(prev => …)` when the next value depends on the previous one.
- Calculate what you can instead of storing it (derived values).
- Updates are batched; the variable in your handler is a snapshot of this render.
- Lift state up to the nearest shared parent when siblings need it.

➡️ **Next:** [Lesson 6 – Effects: talking to the world outside React](06-effects-with-useeffect.md)
