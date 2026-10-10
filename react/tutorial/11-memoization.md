# Lesson 11: Memoization – Sticky Notes With the Answers

> **Like I'm 5:** Memoization is keeping a sticky note with the answer to a hard sum. Next time someone asks the same sum, you read the note instead of working it out again.

| | |
|---|---|
| **Concept reference** | [09 – Memoization: `memo`, `useMemo`, `useCallback`](../concepts/09-memoization.md) |
| **You will learn** | Why components re-render, how to *see* re-renders, `memo`, `useMemo`, `useCallback`, why stable references matter, when **not** to memoize, and what the React Compiler does |
| **We build** | A shop where typing in the search box no longer redraws every toy card |
| **Time** | About 45 minutes |

## The story

Type a few letters in the search box. Something sneaky happens: every keystroke changes `query` in `App`, so **`App` draws again, and so does everything under it**, including all twelve toy cards, even though the cards themselves did not change.

Is that a problem? With twelve cards, honestly, **no**. Computers are fast. But the same pattern with 500 cards or a heavy calculation would feel slow. This lesson shows you how to *see* the waste and how to fix it. Remember the golden rule at the end: **measure first**.

## 1. Why does React re-render?

A component draws again when:

1. its **own state** changes, or
2. a **context** it reads changes, or
3. its **parent** draws again. (By default React redraws all children, even if their props are identical.)

Rule 3 is the one that causes "unnecessary" redraws. Redrawing is cheap; but not free.

Terms:

- **Render** = React calls your component function to get the JSX.
- **Re-render** = it does so again.
- A re-render doesn't always touch the real page. If the JSX is the same, React leaves the page alone. But it still ran your function.

## 2. Step 1: *see* the waste

Open `src/components/ToyCard.tsx` and add **one temporary line** at the top of the `ToyCard` function:

```tsx
export function ToyCard({ toy, badge, onAdd }: ToyCardProps) {
  console.count(`ToyCard drew: ${toy.name}`);   // 👀 temporary
  const [qty, setQty] = useState(1);
  // ...
```

Open the browser console (F12), clear it, and type a letter in the search box. You should see up to twelve lines, one per card, **for a single key press**.

> In development, `StrictMode` draws every component twice to hunt for bugs, so numbers may be doubled. Compare *before* and *after*, not the exact numbers.

Another way to see it: in the browser **React DevTools** extension, open *Components → ⚙ → "Highlight updates when components render"*. Type in the search box: all the cards flash.

## 3. Step 2: `memo` – skip the redraw if the props are the same

`memo` wraps a component and says: *"Before you redraw me, compare my new props with my old props. If they are the same, don't bother."*

```tsx
import { memo } from 'react';

export const ToyCard = memo(function ToyCard({ toy, badge, onAdd }: ToyCardProps) {
  // ...same as before...
});
```

Try it (wrap `ToyCard`, don't forget the closing `)` ). Type in the search box again.

**The cards still redraw!** Why? `memo` compares props one by one with `Object.is` (same reference?).

- `toy`: the same object as last time ✅
- `badge`: not given ✅
- `onAdd`: `handleAdd`, a function **created fresh every time `App` runs** ❌

A function is an object. A new function is a *different* object even if its code looks identical. This is the **stable reference** idea: `memo` only helps if the things you pass stay *the same object* between renders.

## 4. Step 3: `useCallback` – keep the same function

`useCallback(fn, deps)` returns **the same function** until a dependency changes:

```tsx
const handleAdd = useCallback(
  (toy: Toy, qty: number) => dispatch({ type: 'added', toy, qty }),
  [dispatch], // dispatch never changes, so neither does handleAdd
);
```

Think of it as writing the function on a sticky note and handing out the *same note* every time.

Now the cards' props really are equal. Type in the search box: **no cards log anything**. 🎉

## 5. Step 4: `useMemo` – remember a calculated value

`useMemo(fn, deps)` runs `fn`, remembers the result, and gives the same result again until a dependency changes.

```tsx
const visibleToys = useMemo(
  () => toys.filter(/* ... */),
  [toys, category, debouncedQuery],
);
```

Two reasons to use it:

1. The calculation is **slow**, and you don't want to repeat it needlessly.
2. The result is passed to a **memoized child** and must keep the same reference (an array made by `.filter()` is a new array every time!).

We have the second reason: wrap `ToyList` in `memo` too. If `visibleToys` stays the same array, `ToyList` doesn't redraw at all while you are typing (until the debounce settles and the filter changes).

One more detail: this line in `App` is a trap for `memo`:

```tsx
const toys = data ?? [];    // ❌ a brand-new [] on every render while loading
```

We replace it with a constant outside the component that never changes:

```tsx
const NO_TOYS: Toy[] = [];
const toys = data ?? NO_TOYS;   // ✅ the same empty array each time
```

(The linter helps here: it warns when something that is recreated each render is used in a dependency list.)

## 6. The finished files

Here are the finished files for this lesson. They have **no** `console.count` line (replace your temporary one).

📄 **`src/components/ToyCard.tsx`** (replace everything)

```tsx
import { memo, useState } from 'react';
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

function popIn(node: HTMLElement | null) {
  if (!node) return;
  const animation = node.animate?.(
    [
      { opacity: 0, transform: 'scale(0.9)' },
      { opacity: 1, transform: 'scale(1)' },
    ],
    { duration: 250, easing: 'ease-out' },
  );
  return () => animation?.cancel();
}

// memo: "only draw me again if my props are different from last time"
export const ToyCard = memo(function ToyCard({ toy, badge, onAdd }: ToyCardProps) {
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
});
```

📄 **`src/components/ToyList.tsx`** (replace everything)

```tsx
import { memo } from 'react';
import type { Toy } from '../types';
import { ToyCard } from './ToyCard';
import './ToyList.css';

interface ToyListProps {
  toys: Toy[];
  onAdd: (toy: Toy, qty: number) => void;
}

export const ToyList = memo(function ToyList({ toys, onAdd }: ToyListProps) {
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
});
```

📄 **`src/App.tsx`** (replace everything)

```tsx
import { useCallback, useMemo, useRef, useState } from 'react';
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

// One shared empty list, so "no toys yet" is always the SAME array.
const NO_TOYS: Toy[] = [];

export default function App() {
  const dispatch = useCartDispatch();

  const { data, error, loading, reload } = useFetch<Toy[]>('/toys.json');
  const toys = data ?? NO_TOYS;

  const [category, setCategory] = useState<CategoryChoice>('all');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [luckySeed] = useState(() => Math.random());
  const searchRef = useRef<SearchBoxHandle>(null);

  // useMemo: remember the filtered list until something it depends on changes.
  const visibleToys = useMemo(
    () =>
      toys.filter(toy => {
        const matchesCategory = category === 'all' || toy.category === category;
        const matchesQuery = toy.name
          .toLowerCase()
          .includes(debouncedQuery.trim().toLowerCase());
        return matchesCategory && matchesQuery;
      }),
    [toys, category, debouncedQuery],
  );

  const toyOfTheDay =
    toys.length > 0 ? toys[Math.floor(luckySeed * toys.length)] : undefined;

  // useCallback: hand the memoized ToyList the SAME function every time.
  const handleAdd = useCallback(
    (toy: Toy, qty: number) => dispatch({ type: 'added', toy, qty }),
    [dispatch],
  );

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

Run the experiment once more with `console.count` in your `ToyCard`, if you like. Typing in the search box now draws **zero** cards. When the filter settles (300 ms after you stop typing), cards that stay on the shelf are not redrawn either. Only cards that newly *appear* are drawn.

## 7. What just happened?

```text
 type a letter
     │
     ▼
 App draws (query changed) ──► new debounce timer
     │
     ├── Header, SearchBox, …  draw again (cheap)
     │
     └── <ToyList toys={visibleToys} onAdd={handleAdd} />
              toys: same array (useMemo)       ┐ props equal
              onAdd: same function (useCallback)┘ → memo says "skip!"
```

A tiny recap of the three tools:

| Tool | Remembers | Use it for |
|------|-----------|-----------|
| `memo(Component)` | The last props of a component | Skipping redraws of an expensive child |
| `useMemo(fn, deps)` | A **value** | Slow calculations, or keeping an array/object the same |
| `useCallback(fn, deps)` | A **function** | Passing a callback to a `memo` child |

`useCallback(fn, deps)` is just `useMemo(() => fn, deps)`.

## 8. Don't memoize everything!

Memoization isn't free. Each `memo`, `useMemo` and `useCallback` costs **memory and comparisons**, and it makes code harder to read. Use it when:

- ✅ The React DevTools **Profiler** shows a real slow render, or
- ✅ A **memoized child** receives callbacks or objects that would otherwise change every render.

Before you memoize, try cheaper fixes (Lesson 17 has more):

1. **Move state down** to the small component that needs it.
2. **Split components** so the busy part is small.

To measure: open the React DevTools **Profiler** tab, press record, type in the search box, stop. It shows which components drew and how long each took. You can also wrap a part of your own code in `<Profiler id="list" onRender={...}>` while developing.

> Honest note: with twelve cards, we did *not* need any of this. We used it to learn, and in Lesson 17 we meet a list of thousands where it does matter.

## 9. The React Compiler

The **React Compiler** is a build tool that adds memoization **automatically** to components that follow the rules of React (pure rendering, no mutation, hooks at the top level). If a project uses it, you write far fewer `useMemo` and `useCallback` calls. You get its benefit by following the rules we've practiced: pure components and immutable state.

Whether it is switched on depends on your project's setup. Check your build configuration and the official React docs for the current instructions. We have not enabled it in this tutorial, so that you can see and understand each manual tool.

## 🧪 Try it yourself

1. **Observe the baseline.** Add the `console.count` line to `ToyCard`, then switch the `memo`/`useCallback` parts off one at a time. Predict how many lines appear for one key press in each case:
   - nothing memoized,
   - only `memo(ToyCard)`,
   - `memo(ToyCard)` + `useCallback`,
   - all of it.
2. **Break the stable reference.** In `App`, change `const handleAdd = useCallback(…)` back to a plain function `function handleAdd(...) {…}`. Type in the search box. Do the cards redraw? Why?
3. **Create a "new object" prop.** Pass `style={{ margin: 0 }}` to a `memo` component. Does `memo` still help? (An object literal is a new object on every render.)
4. **Rules of hooks.** Try putting `useMemo` inside an `if` in `App` and run `npm run lint`.
5. **Profile it.** Install the React DevTools browser extension, open the Profiler, record typing in the search box before and after memoization and compare.

## ✅ Check yourself

<details>
<summary>1. When does a component re-render?</summary>

When its own state changes, when a context it reads changes, or when its parent re-renders (by default all children re-render too).
</details>

<details>
<summary>2. Why did <code>memo(ToyCard)</code> alone not stop the re-renders?</summary>

Because <code>onAdd</code> was a new function on every render of <code>App</code>, so the props were never equal. A function created inside a component is a new object each time.
</details>

<details>
<summary>3. What is the difference between <code>useMemo</code> and <code>useCallback</code>?</summary>

`useMemo` remembers a calculated **value**; `useCallback` remembers a **function**. `useCallback(fn, deps)` is the same as `useMemo(() => fn, deps)`.
</details>

<details>
<summary>4. When should you <em>not</em> use memoization?</summary>

When there's no measured problem and no memoized child depending on stable references. Memoization has a cost and makes code harder to read. Measure with the Profiler first.
</details>

## Recap

- Re-renders happen when state, context, or the parent changes. They are usually cheap.
- `memo` skips a child's redraw when its props are equal (by `Object.is`).
- Functions and objects created inside a component are new each render. `useCallback` and `useMemo` keep them the same.
- Measure first. Moving state down and splitting components come before memoization.
- The React Compiler can add memoization for you if your project enables it.

➡️ **Next:** [Lesson 12 – Composition: one box with a slot](12-composition-and-children.md)
