# Lesson 4: Lists, Keys and Conditional Rendering

> **Like I'm 5:** Each item in a list needs a name tag. When the list is shuffled, React uses the name tags to find the right item, instead of guessing by position.

| | |
|---|---|
| **Concept reference** | [10 – Lists, keys & conditional rendering](../concepts/10-lists-keys-and-conditional-rendering.md) |
| **You will learn** | Turning an array into a list of components with `.map()`, why every item needs a `key`, showing or hiding things with `&&`, `? :`, early returns and lookup tables |
| **We build** | A `ToyList` that shows all 12 toys, "Sold out" labels, an empty-shelf message and category labels |
| **Time** | About 40 minutes |

## The story

Last lesson we wrote three `ToyCard`s by hand. A real shop has hundreds of toys, and the list will change when we search or filter. We can't type a card for every toy. We hand React an **array** (a list of toys) and say: "make one card for each".

## 1. From an array to a list: `.map()`

`.map()` is an array method that turns each item into something else.

```tsx
const names = ['Ann', 'Ben', 'Cy'];
names.map(name => name.toUpperCase());   // ['ANN', 'BEN', 'CY']
```

In React we map each *toy* to a *card*:

```tsx
{toys.map(toy => (
  <ToyCard key={toy.id} toy={toy} onAdd={handleAdd} />
))}
```

React draws an array of elements exactly like several elements written one after another.

## 2. Name tags: the `key`

Every element that comes out of a `.map()` must have a `key`. Think of the key as a **name tag** on each child.

Why? Imagine the list is shuffled. Without name tags, React can only guess which card is which by position, and it might put Ben's backpack on Ann. With name tags it can say "Ben is still Ben, he just moved".

The rules for a good key:

1. **Stable**: the same toy gets the same key every time (a database id is perfect).
2. **Unique among siblings**: no two items in the same list share a key.
3. **Tied to the data**, not to the position.
4. Don't use the array **index** if the list can be reordered, inserted into or filtered. Then the wrong state sticks to the wrong item.
5. The key goes on the **outermost element** that `.map()` returns.
6. `key` is **not passed to your component** as a prop. If the child needs the id, pass it again under another name.

```tsx
// ❌ Bad when the list can change
{items.map((item, i) => <Row key={i} item={item} />)}

// ✅ Good
{items.map(item => <Row key={item.id} item={item} />)}
```

When you need a key on a fragment (an invisible wrapper), use the long form:

```tsx
import { Fragment } from 'react';

{toys.map(toy => (
  <Fragment key={toy.id}>
    <dt>{toy.name}</dt>
    <dd>{toy.description}</dd>
  </Fragment>
))}
```

## 3. Show or hide things: conditional rendering

JSX has no special `if` tag. We use plain JavaScript tools inside `{}`:

| Tool | Example | Use when |
|------|---------|----------|
| `&&` | `{isLoading && <Spinner />}` | Show something **or nothing** |
| `? :` | `{user ? <Profile /> : <LoginButton />}` | Choose **one of two** things |
| `null` | `{error ? <ErrorMessage /> : null}` | Explicitly draw nothing |
| early `return` | `if (status === 'loading') return <Skeleton />;` | Whole component draws something else |
| lookup table | `views[page] ?? <NotFound />` | **Many** cases |

### A famous trap: the lonely zero

```tsx
// ❌ If count is 0, React draws the number 0 on the page!
{count && <List />}

// ✅ Make it a real true/false question
{count > 0 && <List />}
```

`false`, `null` and `undefined` draw nothing. But the number `0` is a real value, so React draws it.

## 4. Build it

We will do four things: a lookup table for categories, a `CategoryBadge`, a smarter `ToyCard`, and the new `ToyList`.

### A lookup table for category names

A **lookup table** is just an object: you look up a key and get a value. It beats a long `if / else if` chain.

📄 **`src/lib/categories.ts`** (new file)

```ts
import type { Category } from '../types';

// "Record<Category, ...>" means: there must be an entry for EVERY category.
// If you add a new category to the type and forget it here, TypeScript tells you.
export const categoryInfo: Record<Category, { label: string; emoji: string }> = {
  blocks: { label: 'Blocks', emoji: '🧱' },
  plush: { label: 'Plush', emoji: '🧸' },
  vehicles: { label: 'Vehicles', emoji: '🚗' },
  puzzles: { label: 'Puzzles', emoji: '🧩' },
};

// ['blocks', 'plush', 'vehicles', 'puzzles']
export const categoryList = Object.keys(categoryInfo) as Category[];
```

📄 **`src/components/CategoryBadge.tsx`** (new file)

```tsx
import { categoryInfo } from '../lib/categories';
import type { Category } from '../types';
import './CategoryBadge.css';

export function CategoryBadge({ category }: { category: Category }) {
  const { emoji, label } = categoryInfo[category];
  return (
    <span className="category-badge">
      {emoji} {label}
    </span>
  );
}
```

📄 **`src/components/CategoryBadge.css`** (new file)

```css
.category-badge {
  display: inline-block;
  font-size: 0.8rem;
  color: var(--color-muted);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0 var(--space-2);
}
```

### A smarter `ToyCard`

Two conditionals are new: a "Sold out" label (`&&`) and the button text and `disabled` flag (`? :`).

📄 **`src/components/ToyCard.tsx`** (replace everything)

```tsx
import type { Toy } from '../types';
import { formatPrice } from '../lib/formatPrice';
import { CategoryBadge } from './CategoryBadge';
import './ToyCard.css';

interface ToyCardProps {
  toy: Toy;
  badge?: string;
  onAdd: (toy: Toy) => void;
}

export function ToyCard({ toy, badge, onAdd }: ToyCardProps) {
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
      <button
        type="button"
        className="toy-card__button"
        disabled={!toy.inStock}
        onClick={() => onAdd(toy)}
      >
        {toy.inStock ? 'Add to cart' : 'Sold out'}
      </button>
    </article>
  );
}
```

The sold-out label sits on the right so it doesn't overlap the badge on the left:

📄 **`src/components/ToyCard.css`** (add to the bottom)

```css
.toy-card__badge--sold-out {
  left: auto;
  right: var(--space-2);
  background: var(--color-danger);
  color: white;
}
```

### The list

`ToyList` uses an **early return**: if there are no toys it shows a friendly message and stops. Otherwise it draws the list.

Notice that we wrap each card in an `<li>` inside a `<ul>`. A list of things should be a real HTML list; screen readers understand it. The **key goes on the `<li>`**, because that is what `.map()` returns.

📄 **`src/components/ToyList.tsx`** (new file)

```tsx
import type { Toy } from '../types';
import { ToyCard } from './ToyCard';
import './ToyList.css';

interface ToyListProps {
  toys: Toy[];
  onAdd: (toy: Toy) => void;
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

📄 **`src/components/ToyList.css`** (new file)

```css
.toy-list__empty {
  padding: var(--space-4);
  text-align: center;
  color: var(--color-muted);
  background: var(--color-surface);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius);
}

.category-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  list-style: none;
  padding: 0;
  margin: 0;
}
```

### Use it in `App`

We list all toys, and a second small list shows the categories using the lookup table (one more `.map()`, this time over strings).

📄 **`src/App.tsx`** (replace everything)

```tsx
import { CategoryBadge } from './components/CategoryBadge';
import { Header } from './components/Header';
import { Section } from './components/Section';
import { ToyList } from './components/ToyList';
import { toys } from './data/toys';
import { categoryList } from './lib/categories';
import type { Toy } from './types';

export default function App() {
  function handleAdd(toy: Toy) {
    alert(`${toy.name} says: "Put me in the cart!"`);
  }

  return (
    <>
      <Header title="Tiny Toy Shop" />
      <main className="container">
        <Section title="Shelves">
          <ul className="category-legend">
            {categoryList.map(category => (
              <li key={category}>
                <CategoryBadge category={category} />
              </li>
            ))}
          </ul>
        </Section>

        <Section title={`All our toys (${toys.length})`}>
          <ToyList toys={toys} onAdd={handleAdd} />
        </Section>
      </main>
    </>
  );
}
```

Look at the browser: twelve cards, two with a red **Sold out** label and a disabled button, and a row of category labels on top.

## 5. What just happened?

- `toys.map(toy => <li key={toy.id}>…)` made one `<li>` per toy. React remembers each `<li>` by its `key`.
- The empty-shelf message uses an **early return**: when there is nothing to list, we `return` something else and the rest of the function never runs. This keeps the main markup free of `if` nesting.
- The card uses `&&` for "maybe show a label", `? :` for "pick one of two words", and `disabled={!toy.inStock}` to switch the button off.
- `categoryInfo[category]` is a **lookup table**: no `if (category === 'blocks') … else if …`.

## 🧪 Try it yourself

**Experiment 1: see the empty shelf.** In `App.tsx`, pass an empty array: `<ToyList toys={[]} onAdd={handleAdd} />`. Then put `toys` back.

**Experiment 2: the lonely zero.** In `App.tsx`, temporarily add this line inside `<main>`:

```tsx
{[].length && <p>We have toys!</p>}
```

You will see a stray `0` on the page. Now change it to `{[].length > 0 && <p>We have toys!</p>}`. The `0` is gone. Delete the line.

**Experiment 3: why keys matter.** This one shows what goes wrong with the index as a key. It uses `useState`, which you meet in the next lesson, so just copy it for now.

Create a throw-away file `src/components/KeyExperiment.tsx`:

```tsx
import { useState } from 'react';

export function KeyExperiment() {
  const [names, setNames] = useState(['Ann', 'Ben', 'Cy']);

  return (
    <div>
      <button type="button" onClick={() => setNames(list => [...list].reverse())}>
        Reverse the list
      </button>
      <ul>
        {names.map((name, index) => (
          <li key={index}>
            {name}: <input aria-label={`Note for ${name}`} />
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Show it by adding `<KeyExperiment />` (and its import) inside `<main>` in `App.tsx`. Then:

1. Type "hello" next to **Ann** and "bye" next to **Ben**.
2. Click **Reverse the list**.
3. The names move, but the typed words stay in their old positions! The text now sits next to the wrong person. React matched rows by position because the keys were indexes.
4. Change `key={index}` to `key={name}` and try again. Now the notes travel with their owners.

Delete the experiment file and its use when you are done.

**Experiment 4: data in, cards out.** Add a new toy object to the end of `src/data/toys.json` with a fresh `id` such as `"t13"`. It appears on the shelf without touching any component. That is the power of rendering from data. (Remove it again afterwards so your list matches the lessons.)

## ✅ Check yourself

<details>
<summary>1. Why does every item in a <code>.map()</code> need a <code>key</code>?</summary>

So React can tell which item is which when the list changes (reordered, added, removed) and keep each item's state and DOM with the right data.
</details>

<details>
<summary>2. When is it a bad idea to use the array index as a key?</summary>

When the list can be reordered, filtered, inserted into or deleted from. The index belongs to the position, not to the item, so state can stick to the wrong item.
</details>

<details>
<summary>3. What will <code>{count && &lt;List /&gt;}</code> show when <code>count</code> is <code>0</code>?</summary>

The number `0`. Write `{count > 0 && <List />}` instead.
</details>

<details>
<summary>4. Which tool would you use to choose between 5 different views?</summary>

A lookup table (an object mapping each case to its element), for example `views[page] ?? <NotFound />`.
</details>

## Recap

- `.map()` turns an array of data into an array of elements.
- Every list item needs a stable, unique `key` from the data (not the index when the list can change).
- Conditional rendering uses `&&`, `? :`, `null`, early returns and lookup tables.
- Use `count > 0 &&`, never `count &&`, to avoid drawing a stray `0`.

➡️ **Next:** [Lesson 5 – State: the whiteboard that makes the screen change](05-state-with-usestate.md)
