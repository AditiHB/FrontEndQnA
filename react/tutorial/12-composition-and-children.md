# Lesson 12: Composition – One Box With a Slot

> **Like I'm 5:** Instead of building a new box for every toy, you build one box with a slot. Then you put any toy you like in the slot. That is composition.

| | |
|---|---|
| **Concept reference** | [12 – Composition & children](../concepts/12-composition-and-children.md) |
| **You will learn** | `children`, named slots, render props, specialization, compound components, wrapper components, and why React prefers composition to inheritance |
| **We build** | A page layout with slots, a sidebar layout, a reusable countdown, `Button` and `DangerButton`, and a "Quick look" window with tabs |
| **Time** | About 75 minutes |

## The story

Our `App` is doing too much. It decides where the header goes, where the footer goes, how the sidebar sits next to the toys, and it also builds every button. We'd like **layout bricks** that say *"I'll arrange things, you tell me what to put inside."*

That is **composition**: building big things by putting small things together, with open slots for the parts that change.

## 1. Children: the open slot

We have used `children` since Lesson 3 (`Section`). It is the simplest slot: whatever you write between the tags.

```tsx
<Section title="Profile">
  <Avatar />
  <Bio />
</Section>
```

`Section` doesn't know or care what's inside. It only provides the frame and the title. A component like this is called a **wrapper component**: it adds layout or behaviour around its children, and lets the parent decide the content.

## 2. Named slots with props

One slot is not enough for a page: we need a header slot, a footer slot, **and** the main content. A prop can hold JSX, so we can give each slot a name:

📄 **`src/components/PageLayout.tsx`** (new file)

```tsx
import type { ReactNode } from 'react';
import './PageLayout.css';

interface PageLayoutProps {
  header: ReactNode; // slot 1
  footer: ReactNode; // slot 2
  children: ReactNode; // the big open slot
}

export function PageLayout({ header, footer, children }: PageLayoutProps) {
  return (
    <div className="page-layout">
      {header}
      <main className="container page-layout__main">{children}</main>
      {footer}
    </div>
  );
}
```

📄 **`src/components/PageLayout.css`** (new file)

```css
.page-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-layout__main {
  flex: 1;
  width: 100%;
}
```

A second layout: a **side panel** next to the main content (for our search and filters).

📄 **`src/components/SplitView.tsx`** (new file)

```tsx
import type { ReactNode } from 'react';
import './SplitView.css';

interface SplitViewProps {
  side: ReactNode;
  children: ReactNode;
}

export function SplitView({ side, children }: SplitViewProps) {
  return (
    <div className="split-view">
      <aside className="split-view__side">{side}</aside>
      <div className="split-view__main">{children}</div>
    </div>
  );
}
```

📄 **`src/components/SplitView.css`** (new file)

```css
.split-view {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.split-view__side {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  align-self: start;
}

@media (min-width: 760px) {
  .split-view {
    grid-template-columns: 15rem 1fr;
  }
}
```

## 3. Render props: a slot that is a *function*

Sometimes the "slot" needs **data from the brick**. The sale banner's countdown has a number (`secondsLeft`) that changes every second. What if different pages want to show it in different ways?

A **render prop** is a prop (often `children`) that is a *function*. The brick calls the function and says "here's my data, draw whatever you like with it."

📄 **`src/components/Countdown.tsx`** (new file)

```tsx
import { useEffect, useState, type ReactNode } from 'react';

interface CountdownProps {
  seconds: number;
  children: (secondsLeft: number) => ReactNode; // children is a function!
}

// Handles the ticking. Knows nothing about how it looks.
export function Countdown({ seconds, children }: CountdownProps) {
  const [secondsLeft, setSecondsLeft] = useState(seconds);

  useEffect(() => {
    const id = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  return <>{children(secondsLeft)}</>;
}
```

The sale banner now only decides how it **looks**:

📄 **`src/components/SaleBanner.tsx`** (replace everything)

```tsx
import { Countdown } from './Countdown';
import './SaleBanner.css';

export function SaleBanner() {
  return (
    <Countdown seconds={60}>
      {secondsLeft =>
        secondsLeft === 0 ? (
          <p className="sale-banner">The flash sale is over. See you next time!</p>
        ) : (
          <p className="sale-banner">
            🔥 Flash sale! Ends in <strong>{secondsLeft}s</strong>
          </p>
        )
      }
    </Countdown>
  );
}
```

> **Hooks replaced most render props.** The same idea as a hook would be `const secondsLeft = useCountdown(60)`. Both share the ticking logic. You will still meet render props in libraries, so it's good to recognise them.

## 4. Specialization: a special version of a general brick

Build a **general** brick first (`Button` with a `variant`), then build **special** ones from it (`DangerButton`).

📄 **`src/components/Button.tsx`** (new file)

```tsx
import type { ComponentProps } from 'react';
import './Button.css';

type Variant = 'primary' | 'ghost' | 'danger';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant;
}

export function Button({
  variant = 'primary',
  type = 'button', // a button inside a form submits it, unless we say otherwise
  className = '',
  ...props
}: ButtonProps) {
  return <button type={type} className={`btn btn--${variant} ${className}`.trim()} {...props} />;
}

// Specialization: the same Button, but always "danger".
export function DangerButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="danger" />;
}
```

📄 **`src/components/Button.css`** (new file)

```css
.btn {
  border-radius: 999px;
  padding: var(--space-2) var(--space-3);
  font-weight: 600;
  border: 1px solid transparent;
}

.btn--primary {
  background: var(--color-brand);
  color: white;
}

.btn--ghost {
  background: transparent;
  color: var(--color-link);
  border-color: var(--color-link);
}

.btn--danger {
  background: var(--color-danger);
  color: white;
}

.btn:hover:not(:disabled) {
  filter: brightness(1.1);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

`ComponentProps<'button'>` means "every prop a normal `<button>` accepts" (`onClick`, `disabled`, `aria-label`…). `Button` keeps what it cares about (`variant`, `type`) and passes everything else along with `...props`.

## 5. Compound components: bricks that work as a team

A set of tabs is several parts that must cooperate: the row, each tab, each panel. Instead of one giant component with dozens of props, we make **small parts that share a secret through context** (Lesson 8). The user arranges the parts as they like:

```tsx
<Tabs defaultValue="about">
  <Tabs.List>
    <Tabs.Tab value="about">About</Tabs.Tab>
    <Tabs.Tab value="care">Care</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="about">…</Tabs.Panel>
  <Tabs.Panel value="care">…</Tabs.Panel>
</Tabs>
```

📄 **`src/components/Tabs.tsx`** (new file)

```tsx
import { createContext, useContext, useId, useState, type ReactNode } from 'react';
import './Tabs.css';

interface TabsContextValue {
  active: string;
  select: (value: string) => void;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tabs parts must be used inside <Tabs>');
  return context;
}

function TabsRoot({ defaultValue, children }: { defaultValue: string; children: ReactNode }) {
  const [active, setActive] = useState(defaultValue);
  const baseId = useId(); // a unique id for linking tabs and panels

  return (
    <TabsContext.Provider value={{ active, select: setActive, baseId }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }: { children: ReactNode }) {
  return (
    <div role="tablist" className="tabs__list">
      {children}
    </div>
  );
}

function Tab({ value, children }: { value: string; children: ReactNode }) {
  const { active, select, baseId } = useTabs();
  const selected = active === value;

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${value}`}
      className="tabs__tab"
      onClick={() => select(value)}
    >
      {children}
    </button>
  );
}

function Panel({ value, children }: { value: string; children: ReactNode }) {
  const { active, baseId } = useTabs();
  if (active !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      className="tabs__panel"
    >
      {children}
    </div>
  );
}

// Glue the parts onto Tabs so they can be written as <Tabs.Tab>.
export const Tabs = Object.assign(TabsRoot, { List: TabList, Tab, Panel });
```

📄 **`src/components/Tabs.css`** (new file)

```css
.tabs__list {
  display: flex;
  gap: var(--space-1);
  border-bottom: 2px solid var(--color-border);
}

.tabs__tab {
  background: transparent;
  color: var(--color-muted);
  border: 0;
  border-bottom: 3px solid transparent;
  padding: var(--space-2) var(--space-3);
  margin-bottom: -2px;
}

.tabs__tab[aria-selected='true'] {
  color: var(--color-text);
  border-bottom-color: var(--color-brand);
  font-weight: 700;
}

.tabs__panel {
  padding: var(--space-3) 0;
}
```

Now a brick that uses the tabs to show a toy's details (we reuse it again in Lesson 14):

📄 **`src/components/ToyDetails.tsx`** (new file)

```tsx
import { formatPrice } from '../lib/formatPrice';
import type { Category, Toy } from '../types';
import { CategoryBadge } from './CategoryBadge';
import { Tabs } from './Tabs';

const careTips: Record<Category, string> = {
  blocks: 'Wipe with a damp cloth. Count the blocks after playtime!',
  plush: 'Machine wash on a gentle cycle and let it air dry.',
  vehicles: 'Keep the wheels free of sand and dust.',
  puzzles: 'Keep the pieces in the box so none go missing.',
};

export function ToyDetails({ toy }: { toy: Toy }) {
  return (
    <div>
      <p style={{ fontSize: '3rem', margin: 0 }} aria-hidden="true">
        {toy.emoji}
      </p>
      <p>
        <CategoryBadge category={toy.category} /> <strong>{formatPrice(toy.price)}</strong>
      </p>

      <Tabs defaultValue="about">
        <Tabs.List>
          <Tabs.Tab value="about">About</Tabs.Tab>
          <Tabs.Tab value="care">Care</Tabs.Tab>
          <Tabs.Tab value="safety">Safety</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="about">{toy.description}</Tabs.Panel>
        <Tabs.Panel value="care">{careTips[toy.category]}</Tabs.Panel>
        <Tabs.Panel value="safety">
          Suitable for ages 3 and up. Always play with a grown-up nearby.
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
```

## 6. Use the new bricks

The card gets a **Quick look** button that opens the `Modal` from Lesson 7 with the details inside (children again!):

📄 **`src/components/ToyCard.tsx`** (replace everything)

```tsx
import { memo, useState } from 'react';
import type { Toy } from '../types';
import { formatPrice } from '../lib/formatPrice';
import { Button } from './Button';
import { CategoryBadge } from './CategoryBadge';
import { Modal } from './Modal';
import { QuantityPicker } from './QuantityPicker';
import { ToyDetails } from './ToyDetails';
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

export const ToyCard = memo(function ToyCard({ toy, badge, onAdd }: ToyCardProps) {
  const [qty, setQty] = useState(1);
  const [lookOpen, setLookOpen] = useState(false);

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
      <div className="toy-card__actions">
        <button
          type="button"
          className="toy-card__button"
          disabled={!toy.inStock}
          onClick={handleAdd}
        >
          {toy.inStock ? 'Add to cart' : 'Sold out'}
        </button>
        <Button variant="ghost" onClick={() => setLookOpen(true)}>
          Quick look
        </Button>
      </div>

      {lookOpen && (
        <Modal title={toy.name} onClose={() => setLookOpen(false)}>
          <ToyDetails toy={toy} />
        </Modal>
      )}
    </article>
  );
});
```

📄 **`src/components/ToyCard.css`** (add to the bottom)

```css
.toy-card__actions {
  display: grid;
  gap: var(--space-2);
}
```

The cart uses `DangerButton` for the scary buttons and a ghost `Button` for the safe one:

📄 **`src/components/CartDropdown.tsx`** (replace everything)

```tsx
import { useRef, useState } from 'react';
import { cartCount, cartTotal } from '../context/cartReducer';
import { useCart, useCartDispatch } from '../context/CartContext';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { formatPrice } from '../lib/formatPrice';
import { Button, DangerButton } from './Button';
import { Modal } from './Modal';
import { QuantityPicker } from './QuantityPicker';
import './CartDropdown.css';

export function CartDropdown() {
  const items = useCart();
  const dispatch = useCartDispatch();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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
              <DangerButton onClick={() => setConfirmOpen(true)}>Clear cart</DangerButton>
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

`App` now just **assembles** the layout bricks. App.css loses the toolbar (the side panel handles layout now):

📄 **`src/App.css`** (replace everything)

```css
.toy-of-the-day {
  margin: var(--space-3) 0 0;
  padding: var(--space-2) var(--space-3);
  background: var(--color-brand-soft);
  border-radius: var(--radius);
}
```

📄 **`src/App.tsx`** (replace everything)

```tsx
import { useCallback, useMemo, useRef, useState } from 'react';
import { Button } from './components/Button';
import { CategoryFilter } from './components/CategoryFilter';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { PageLayout } from './components/PageLayout';
import { PageTitle } from './components/PageTitle';
import { SaleBanner } from './components/SaleBanner';
import { SearchBox, type SearchBoxHandle } from './components/SearchBox';
import { Section } from './components/Section';
import { SplitView } from './components/SplitView';
import { ToyList } from './components/ToyList';
import { ToyRoulette } from './components/ToyRoulette';
import { useCartDispatch } from './context/CartContext';
import { useDebounce } from './hooks/useDebounce';
import { useFetch } from './hooks/useFetch';
import type { CategoryChoice, Toy } from './types';
import './App.css';

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

  const handleAdd = useCallback(
    (toy: Toy, qty: number) => dispatch({ type: 'added', toy, qty }),
    [dispatch],
  );

  return (
    <PageLayout header={<Header title="Tiny Toy Shop" />} footer={<Footer />}>
      <PageTitle />
      <SaleBanner />

      {toyOfTheDay && (
        <p className="toy-of-the-day">
          ⭐ Toy of the day: {toyOfTheDay.emoji} <strong>{toyOfTheDay.name}</strong>
        </p>
      )}

      {toys.length > 0 && <ToyRoulette toys={toys} />}

      <SplitView
        side={
          <>
            <SearchBox ref={searchRef} value={query} onChange={setQuery} />
            {query !== '' && (
              <Button variant="ghost" onClick={() => searchRef.current?.clear()}>
                Clear search
              </Button>
            )}
            <CategoryFilter selected={category} onSelect={setCategory} />
          </>
        }
      >
        <Section title={data ? `Our toys (${visibleToys.length})` : 'Our toys'}>
          {loading && <p>Opening the toy box… 📦</p>}

          {error && (
            <div role="alert">
              <p>Oh no! The toy truck got lost on the way. 🚚💨</p>
              <Button onClick={reload}>Try again</Button>
            </div>
          )}

          {data && <ToyList toys={visibleToys} onAdd={handleAdd} />}
        </Section>
      </SplitView>
    </PageLayout>
  );
}
```

Open the shop. The search and filters now sit in a side panel on wide screens (and on top on a phone). Click **Quick look** on a toy: a window opens with About / Care / Safety tabs. In the cart, **Clear cart** is red.

## 7. What just happened?

| Pattern | Where | The idea |
|---------|-------|----------|
| **children** | `Section`, `Modal`, `PageLayout` | One open slot |
| **Named slots** | `PageLayout` (`header`, `footer`), `SplitView` (`side`) | Several open slots, each filled with JSX passed as a prop |
| **Render prop** | `Countdown` | The slot is a *function* that receives data from the brick |
| **Specialization** | `DangerButton` from `Button` | A specific version built from a general one |
| **Compound components** | `Tabs`, `Tabs.Tab`, … | Parts that share state through context and are arranged by the user |
| **Wrapper component** | `PageLayout`, `SplitView` | Adds layout or behaviour around whatever is inside |

Notice what **didn't** happen: there's no `class DangerButton extends Button`. React uses **composition instead of inheritance**. Rather than "this brick *is a kind of* that brick", you say "this brick *contains* that brick." Props and children give all the flexibility inheritance would, with less tangle.

### Choosing between them

- Use **children** when there's one open area.
- Use **named props** when there are a few separate areas.
- Use a **hook** (instead of a render prop) when you only share logic.
- Use **compound components** for a family of parts (tabs, menus, accordions).
- Passing a ready-made component down as `children` is also a good way to avoid prop drilling (Lesson 8).

### A note on accessibility

`Tabs` uses the right `role`s and links tabs to panels with ids made by `useId`, so screen readers understand it. A complete tab widget also lets you move between tabs with the arrow keys; a good exercise below.

## 🧪 Try it yourself

1. **A new slot.** Give `PageLayout` an optional `banner` slot above the main area and move `SaleBanner` into it from `App`.
2. **A new special button.** Create `GhostButton` from `Button`, like `DangerButton`.
3. **Arrow keys for tabs.** Add `onKeyDown` handling to the tab list so `ArrowRight` / `ArrowLeft` select the next / previous tab. (Hint: you need to know the list of tab values. Maybe `Tabs.Tab`s can register themselves, or `ToyDetails` can pass the values.)
4. **Another render prop.** Make `<MouseTracker>{({x, y}) => …}</MouseTracker>` and then rewrite it as a `useMousePosition()` hook. Which one is easier to read?
5. **Break the compound.** Use `<Tabs.Tab>` outside `<Tabs>` and read the error from `useTabs`.

## ✅ Check yourself

<details>
<summary>1. What is the difference between <code>children</code> and a named slot prop?</summary>

`children` is the content between a component's tags (one open slot). A named slot is any prop that carries JSX, such as `header` or `side`, which lets a component offer several slots.
</details>

<details>
<summary>2. What is a render prop?</summary>

A prop (often `children`) whose value is a function. The component calls it with some data and renders whatever the function returns.
</details>

<details>
<summary>3. How are compound components like <code>Tabs.Tab</code> connected to <code>Tabs</code>?</summary>

Through context. `Tabs` provides the shared state (active tab); the parts read it with a hook.
</details>

<details>
<summary>4. Why doesn't React use inheritance between components?</summary>

Composition (props, children, slots) is flexible enough and avoids deep class hierarchies. You build specific components from general ones by wrapping and configuring them.
</details>

## Recap

- Composition builds big pieces from small ones with open slots: `children`, named props, render props.
- Wrapper components add layout or behaviour around whatever you pass in.
- Specialization: make `DangerButton` from `Button` by fixing a prop.
- Compound components share state through context, so users can arrange the parts freely.
- Prefer composition over inheritance.

➡️ **Next:** [Lesson 13 – Forms: puppets and free-thinking kids](13-forms-and-controlled-inputs.md)
