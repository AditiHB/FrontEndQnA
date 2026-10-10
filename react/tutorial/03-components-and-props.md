# Lesson 3: Components and Props – LEGO Bricks With Slots

> **Like I'm 5:** A component is a LEGO brick with labelled slots on it. Props are the pieces you snap into the slots when you use the brick. The brick can't change the pieces you gave it, but it can show them.

| | |
|---|---|
| **Concept reference** | [03 – Components & props](../concepts/03-components-and-props.md) |
| **You will learn** | Writing components, typed props, optional props, default values, `children`, callback props, "props are read-only", the rules of pure components |
| **We build** | `Header`, `Section` and `ToyCard` bricks, and a page with our first three toys |
| **Time** | About 45 minutes |

## The story

Our `App.tsx` is one big file. If we put every toy, button and banner in there, it will turn into spaghetti. Instead we cut the page into **bricks** (components). Each brick does one job, and we can use it as many times as we like.

## 1. Bricks and slots

Imagine a toy-card brick. It has a few **slots**: one for the toy's name, one for its price, one for a picture. The first time you use the brick you snap in "Rainbow Blocks, $12.50". The second time you snap in "Cuddly Bear, $15.00". Same brick, different pieces.

In React:

- the **brick** is a function that returns JSX → a **component**;
- the **slots** are its inputs → **props** (short for *properties*);
- **using** the brick looks like an HTML tag: `<ToyCard toy={...} />`.

```tsx
function Greeting({ name }: { name: string }) {
  return <p>Hello, {name}!</p>;
}

<Greeting name="Asha" />   // Hello, Asha!
<Greeting name="Ravi" />   // Hello, Ravi!
```

## 2. Describe the toys

First we need the data. We will describe what a toy looks like (a TypeScript **type**) and write our toy catalogue.

📄 **`src/types.ts`** (new file)

```ts
// The only categories a toy can have.
export type Category = 'blocks' | 'plush' | 'vehicles' | 'puzzles';

// The shape of one toy. TypeScript will complain if we forget a field.
export interface Toy {
  id: string;
  name: string;
  price: number;
  emoji: string;
  category: Category;
  inStock: boolean;
  description: string;
}
```

> **Why types?** They are labels on the boxes. If you try to put a number where a name should go, your editor underlines it in red *before* you run anything.

Now our catalogue as a JSON file. JSON is plain data, and later it becomes the answer of a "pretend server".

📄 **`src/data/toys.json`** (new file)

```json
[
  { "id": "t1", "name": "Rainbow Blocks", "price": 12.5, "emoji": "🧱", "category": "blocks", "inStock": true, "description": "Fifty chunky blocks in every colour. Perfect for towers that wobble." },
  { "id": "t2", "name": "Castle Builder Set", "price": 29, "emoji": "🏰", "category": "blocks", "inStock": true, "description": "Build gates, towers and a drawbridge. Dragons not included." },
  { "id": "t3", "name": "Cuddly Bear", "price": 15, "emoji": "🧸", "category": "plush", "inStock": true, "description": "A soft bear who is always ready for a hug." },
  { "id": "t4", "name": "Sleepy Bunny", "price": 13.5, "emoji": "🐰", "category": "plush", "inStock": true, "description": "Long floppy ears and a very quiet voice." },
  { "id": "t5", "name": "Red Race Car", "price": 9.9, "emoji": "🏎️", "category": "vehicles", "inStock": true, "description": "Pull it back, let go, and zoom!" },
  { "id": "t6", "name": "Rescue Helicopter", "price": 21, "emoji": "🚁", "category": "vehicles", "inStock": false, "description": "Spinning blades and a winch for tiny rescues." },
  { "id": "t7", "name": "Choo-Choo Train", "price": 24.5, "emoji": "🚂", "category": "vehicles", "inStock": true, "description": "A wooden train with five carriages and a bridge." },
  { "id": "t8", "name": "Animal Puzzle", "price": 8, "emoji": "🧩", "category": "puzzles", "inStock": true, "description": "Twenty-four big pieces with friendly farm animals." },
  { "id": "t9", "name": "Space Puzzle", "price": 11, "emoji": "🚀", "category": "puzzles", "inStock": true, "description": "Fifty pieces of planets, stars and one rocket." },
  { "id": "t10", "name": "Dino Plush", "price": 17, "emoji": "🦖", "category": "plush", "inStock": true, "description": "Roars very softly. Teeth are made of felt." },
  { "id": "t11", "name": "Magnet Blocks", "price": 19.9, "emoji": "🧲", "category": "blocks", "inStock": false, "description": "Blocks that click together with magnets." },
  { "id": "t12", "name": "Mystery Box", "price": 5, "emoji": "🎁", "category": "puzzles", "inStock": true, "description": "Nobody knows what's inside. Even the shopkeeper." }
]
```

A tiny file turns that JSON into typed toys that the rest of the app can import:

📄 **`src/data/toys.ts`** (new file)

```ts
import type { Toy } from '../types';
import toysJson from './toys.json';

// Tell TypeScript "trust me, every item in the JSON is a Toy".
export const toys = toysJson as Toy[];
```

And one small helper that turns `12.5` into `$12.50`:

📄 **`src/lib/formatPrice.ts`** (new file)

```ts
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatPrice(amount: number): string {
  return money.format(amount);
}
```

## 3. Brick one: `Header`

`Header` has two slots: a `title` (must be given) and a `tagline` (may be left out). The `?` in the type makes a prop **optional**. The `= 'Toys for tiny hands'` is a **default value** used when nobody fills the slot.

📄 **`src/components/Header.tsx`** (new file)

```tsx
import './Header.css';

interface HeaderProps {
  title: string;
  tagline?: string; // "?" means optional
}

export function Header({ title, tagline = 'Toys for tiny hands' }: HeaderProps) {
  return (
    <header className="header">
      <div className="container header__inner">
        <h1 className="header__title">🧸 {title}</h1>
        <p className="header__tagline">{tagline}</p>
      </div>
    </header>
  );
}
```

📄 **`src/components/Header.css`** (new file)

```css
.header {
  background: var(--color-brand);
  color: white;
  padding: var(--space-3) 0;
}

.header__inner {
  display: flex;
  align-items: baseline;
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
```

What is happening in `{ title, tagline = '...' }: HeaderProps`? React hands every component **one object** with all its props: `{ title: 'Tiny Toy Shop' }`. We **destructure** it (pull the pieces out into variables) right in the parameter list, and we say what type that object has.

## 4. Brick two: `Section` and the special prop `children`

Some bricks are *containers*. A `Section` has a title and a free area in the middle where we can put anything. Whatever you write **between** the opening and closing tag is passed in a special prop called `children`.

📄 **`src/components/Section.tsx`** (new file)

```tsx
import type { ReactNode } from 'react';
import './Section.css';

interface SectionProps {
  title: string;
  children: ReactNode; // anything React can draw: text, elements, lists…
}

export function Section({ title, children }: SectionProps) {
  return (
    <section className="section">
      <h2 className="section__title">{title}</h2>
      <div>{children}</div>
    </section>
  );
}
```

📄 **`src/components/Section.css`** (new file)

```css
.section {
  margin: var(--space-4) 0;
}

.section__title {
  margin: 0 0 var(--space-3);
}
```

`ReactNode` is the TypeScript name for "anything that can be put on the page".

## 5. Brick three: `ToyCard`

The `ToyCard` shows one toy. It has three props:

- `toy`: the toy to show (an object, a bigger piece to snap in).
- `badge`: an optional label such as "Best seller".
- `onAdd`: a **function**. When the button is clicked, the card calls it. This is how a child brick **talks back up** to its parent.

📄 **`src/components/ToyCard.tsx`** (new file)

```tsx
import type { Toy } from '../types';
import { formatPrice } from '../lib/formatPrice';
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
      <div className="toy-card__emoji" aria-hidden="true">
        {toy.emoji}
      </div>
      <h3 className="toy-card__name">{toy.name}</h3>
      <p className="toy-card__price">{formatPrice(toy.price)}</p>
      <button type="button" className="toy-card__button" onClick={() => onAdd(toy)}>
        Add to cart
      </button>
    </article>
  );
}
```

📄 **`src/components/ToyCard.css`** (new file)

```css
/* Cards sit in a grid. */
.toy-grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-3);
}

.toy-card {
  position: relative;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: var(--space-3);
  text-align: center;
}

.toy-card__badge {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  background: var(--color-brand-soft);
  color: var(--color-brand-text);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}

.toy-card__emoji {
  font-size: 3rem;
}

.toy-card__name {
  margin: var(--space-2) 0 0;
  font-size: 1.05rem;
}

.toy-card__price {
  margin: var(--space-1) 0 var(--space-3);
  color: var(--color-muted);
}

.toy-card__button {
  background: var(--color-brand);
  color: white;
  border: 0;
  border-radius: 999px;
  padding: var(--space-2) var(--space-3);
  font-weight: 600;
}

.toy-card__button:hover {
  filter: brightness(1.1);
}

.toy-card__button:disabled {
  background: var(--color-border);
  color: var(--color-muted);
  cursor: not-allowed;
}
```

Two things in the card worth a look:

- `{badge && <span>…</span>}` means *"if there is a badge, show it"*. If `badge` is `undefined`, nothing is drawn.
- `onClick={() => onAdd(toy)}` gives the button a little function that calls our `onAdd` prop. We wrap it in `() =>` so it runs **on click**, not while drawing. (Writing `onClick={onAdd(toy)}` would call it immediately!)

## 6. Put the bricks together

Now `App` becomes small. It only arranges bricks and gives them pieces.

📄 **`src/App.tsx`** (replace everything)

```tsx
import { Header } from './components/Header';
import { Section } from './components/Section';
import { ToyCard } from './components/ToyCard';
import { toys } from './data/toys';
import type { Toy } from './types';

export default function App() {
  function handleAdd(toy: Toy) {
    alert(`${toy.name} says: "Put me in the cart!"`);
  }

  return (
    <>
      <Header title="Tiny Toy Shop" />
      <main className="container">
        <Section title="Our first three toys">
          <div className="toy-grid">
            <ToyCard toy={toys[0]} badge="Best seller" onAdd={handleAdd} />
            <ToyCard toy={toys[1]} onAdd={handleAdd} />
            <ToyCard toy={toys[2]} onAdd={handleAdd} />
          </div>
        </Section>
      </main>
    </>
  );
}
```

Save, look at the browser, and click **Add to cart**. An alert pops up. Later we replace the alert with a real cart.

## 7. What just happened?

### Data goes down, events go up

```text
            App  (owns handleAdd)
             │  props flow DOWN ↓
   ┌─────────┼───────────────┐
 Header   Section          ToyCard ── click! ──► calls onAdd(toy)
                              ▲                      │
                              └──── event goes UP ◄──┘
```

- A **parent** gives pieces to a **child** through props.
- A **child** never reaches up and changes the parent's data. It calls a function the parent gave it (a *callback prop*), and the parent decides what to do.

### Props are read-only

A component must treat its props like a gift it may look at but not change. This is a bug:

```tsx
function ToyCard({ toy }: { toy: Toy }) {
  toy.name = 'Boring toy';   // ❌ never change props
  return <h3>{toy.name}</h3>;
}
```

If the child wants something to change, the **parent** owns the data and passes down a callback. In the next lessons, *state* will be the place where changing data lives.

### Default values

Use normal JavaScript default parameters: `tagline = 'Toys for tiny hands'`. You may see old tutorials with `Component.defaultProps`. That style is deprecated for function components.

### Pure components

A component should be a **pure** recipe: the same props (and state) always give the same picture, and drawing must not change anything outside itself. That means:

- ✅ Compute things from props and show them.
- ❌ Don't change variables outside the component while drawing.
- ❌ Don't draw random numbers or `Date.now()` straight into the page (the picture would change on every redraw). Later lessons show the right places for those.

### Don't build bricks inside bricks

```tsx
function App() {
  // ❌ A new Card brick is created every time App draws.
  function Card() { return <div>…</div>; }
  return <Card />;
}
```

Because `Card` is a brand-new function each time, React thinks it is a different component, throws the old one away, and its inner state is lost. Always define components **at the top level of a file**.

### Naming and files

- Components use `PascalCase` names: `ToyCard`, `Header`.
- One main component per file, and the file has the same name: `ToyCard.tsx`.
- Each component has its own small CSS file next to it. We name classes like `toy-card__price` so styles for different bricks don't clash. (Lesson 22 shows other ways to style.)

## 🧪 Try it yourself

1. Give the second card a badge: `badge="New"`.
2. Remove `title` from `<Header />`. What does TypeScript say? Put it back.
3. Add `tagline="Open every day"` to `<Header />`. Then remove it again. Where did the old tagline come from?
4. Show a fourth card with `toys[3]`.
5. Try changing `onClick={() => onAdd(toy)}` to `onClick={onAdd(toy)}`. TypeScript complains, and when the page loads the alerts pop up immediately, before anyone clicked. Then undo it.

## ✅ Check yourself

<details>
<summary>1. What is the difference between a component and its props?</summary>

The component is the reusable function (the brick). Props are the inputs you give it each time you use it (the pieces in the slots).
</details>

<details>
<summary>2. How does a child component tell its parent that something happened?</summary>

The parent passes a function as a prop (such as `onAdd`). The child calls that function, and the parent decides what to do.
</details>

<details>
<summary>3. Why should you never define a component inside another component?</summary>

It would be re-created on every render, so React would treat it as a new component each time and lose its state.
</details>

<details>
<summary>4. What does <code>children</code> contain?</summary>

Whatever you put between the component's opening and closing tags.
</details>

## Recap

- A component is a function that returns JSX; props are its (read-only) inputs.
- Use TypeScript interfaces to describe props. `?` makes a prop optional; defaults come from destructuring.
- `children` lets a component wrap other content.
- Data flows down through props. Events flow up through callback props.
- Keep components pure, small and defined at the top level.

➡️ **Next:** [Lesson 4 – Lists, keys and conditional rendering](04-lists-keys-and-conditional-rendering.md)
