# Lesson 17: Performance – Tidy Up a Messy Room

> **Like I'm 5:** A slow room is a room with too much stuff. Performance is the art of putting away what you don't need right now, and fetching the rest only when you ask for it.

| | |
|---|---|
| **Concept reference** | [17 – Performance](../concepts/17-performance.md) |
| **You will learn** | Measuring before fixing, moving state down, splitting components, lazy-loading code with `lazy` and `Suspense`, virtualizing long lists, looking inside the bundle, image tips, and traps to avoid |
| **We build** | A warehouse page with **10,000 boxes** that still scrolls smoothly, and pages that download only when visited |
| **Time** | About 75 minutes |

## The story

The shopkeeper wants a **warehouse page** listing every box in the back room: ten thousand rows. If we just print them all, the browser will groan. Also, our shop downloads *everything* (cart page, add-toy form, …) in one big file even if you only look at the shelves.

Before fixing anything, let's learn the rule of this lesson.

## 1. Measure first!

> **Performance work is driven by measuring, not by guessing.**

Tools you have:

| Tool | Tells you |
|------|-----------|
| **React DevTools → Profiler** | Which components rendered, why, and how long each took |
| **Browser DevTools → Performance tab** | Where the browser spent time (scripts, layout, painting) |
| **Browser DevTools → Network tab** | What was downloaded and how big it was |
| **Lighthouse** (in Chrome DevTools) | A report on loading speed and **Core Web Vitals** (how quickly the main content appears, how fast clicks respond, whether the page jumps around) |
| `npm run build` output | The size of your JavaScript files |

Common causes of slow UIs:

1. State lives **too high**, so a big tree re-renders on each change.
2. A **context** value changes often and many consumers re-render.
3. **Huge lists** rendered all at once.
4. **Heavy calculations** on every render.
5. **Big bundles** that take long to download.

We'll fix 1, 3 and 5 in this lesson (2 and 4 we met in Lessons 8, 11 and 16).

## 2. Look at today's bundle

```bash
npm run build
```

At the end you see something like:

```text
dist/assets/index-xxxx.js   380 kB │ gzip: 119 kB
```

**One** JavaScript file with the entire shop. Remember this number. We'll make it smaller.

## 3. Install two helpers

```bash
npm install @tanstack/react-virtual
npm install -D rollup-plugin-visualizer
```

- `@tanstack/react-virtual` draws only the rows you can actually see.
- `rollup-plugin-visualizer` draws a picture of what is inside your bundle.

## 4. Build the warehouse (and the mistake to avoid)

### The data: 10,000 boxes, made up on the fly

📄 **`src/lib/warehouse.ts`** (new file)

```ts
export interface WarehouseItem {
  id: number;
  sku: string;
  name: string;
  stock: number;
}

const adjectives = ['Red', 'Blue', 'Tiny', 'Giant', 'Soft', 'Shiny', 'Wooden', 'Happy'];
const things = ['Blocks', 'Bear', 'Train', 'Puzzle', 'Robot', 'Kite', 'Drum', 'Ball'];

// Not random: the same call always gives the same boxes.
export function makeWarehouse(count: number): WarehouseItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    sku: `BOX-${String(index + 1).padStart(5, '0')}`,
    name: `${adjectives[index % adjectives.length]} ${things[Math.floor(index / 8) % things.length]}`,
    stock: (index * 7) % 100,
  }));
}
```

### Mistake #1: draw everything

The obvious way to show them:

```tsx
// ❌ Don't do this with 10,000 items
<ul>
  {items.map(item => (
    <li key={item.id}>{item.sku} {item.name}</li>
  ))}
</ul>
```

That puts 10,000 elements into the page. Drawing them takes long, scrolling gets jerky, and memory use balloons. But on screen you can only see about 15 rows at any moment!

### The fix: virtualization

**Virtualization** (also called *windowing*) draws **only the rows you can see** (plus a few extra) and moves them as you scroll. The scrollbar is real because we give the container the *full* height. It's like a long scroll of paper with a small window sliding along it: only what's in the window is painted.

📄 **`src/components/WarehouseList.tsx`** (new file)

```tsx
import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { WarehouseItem } from '../lib/warehouse';
import './WarehouseList.css';

const ROW_HEIGHT = 44;

export function WarehouseList({ items }: { items: WarehouseItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // This lint rule warns about libraries that don't play well with the React
  // Compiler (Lesson 11). We don't use the compiler, so we silence it here.
  // oxlint-disable-next-line react/incompatible-library
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8, // draw a few extra rows above and below to avoid blank flashes
  });

  return (
    <div ref={scrollRef} className="warehouse-list" role="list" aria-label="Warehouse boxes">
      {/* A tall invisible box makes the scrollbar the right size. */}
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map(row => {
          const item = items[row.index];
          return (
            <div
              key={row.key}
              role="listitem"
              className="warehouse-list__row"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: row.size,
                transform: `translateY(${row.start}px)`,
              }}
            >
              <span className="warehouse-list__sku">{item.sku}</span>
              <span>{item.name}</span>
              <span className="warehouse-list__stock">{item.stock} in stock</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

📄 **`src/components/WarehouseList.css`** (new file)

```css
.warehouse-list {
  height: 24rem;
  overflow: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.warehouse-list__row {
  display: grid;
  grid-template-columns: 7rem 1fr auto;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.warehouse-list__sku {
  font-family: ui-monospace, Consolas, monospace;
  color: var(--color-muted);
}

.warehouse-list__stock {
  color: var(--color-muted);
}
```

### Mistake #2: state that lives too high

The warehouse has a live clock ("Stock count at 10:42:03"). Where does its state go? If we put it at the top of the page:

```tsx
// ❌ The clock state sits at the top of the page
export function WarehousePage() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <>
      <p>Stock count at {now.toLocaleTimeString()}</p>
      <WarehouseList items={items} />      {/* redrawn every second for nothing! */}
    </>
  );
}
```

Every second the **whole page** (including the big list) re-renders just to change one line of text. The fix is free: **move the state down** into a tiny component that owns it. Only that tiny component re-renders each second.

📄 **`src/components/StockClock.tsx`** (new file)

```tsx
import { useEffect, useState } from 'react';

// The clock's state lives here, so only THIS little component redraws each second.
export function StockClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return <p>Stock count at {now.toLocaleTimeString()}</p>;
}
```

📄 **`src/pages/WarehousePage.tsx`** (new file)

```tsx
import { useMemo } from 'react';
import { Section } from '../components/Section';
import { StockClock } from '../components/StockClock';
import { WarehouseList } from '../components/WarehouseList';
import { makeWarehouse } from '../lib/warehouse';

export function WarehousePage() {
  // Make the 10,000 boxes once, not on every render.
  const items = useMemo(() => makeWarehouse(10_000), []);

  return (
    <Section title="Warehouse: 10,000 boxes">
      <StockClock />
      <WarehouseList items={items} />
    </Section>
  );
}
```

## 5. Download pages only when needed: `lazy` and `Suspense`

By default `import { CartPage } from './pages/CartPage'` puts that page's code in the **main file**, so visitors download it even if they never open the cart.

`lazy` turns an `import()` into a component that is **downloaded the first time it is drawn**. While it downloads, the nearest `<Suspense>` shows a fallback (a "waiting" sign).

`lazy` wants a module with a **default export**; our pages use named exports, so we map the name to `default`:

📄 **`src/router.tsx`** (replace everything)

```tsx
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import { RequireAuth } from './components/RequireAuth';
import { RootLayout } from './components/RootLayout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ToyPage } from './pages/ToyPage';

// These pages are downloaded only when somebody visits them.
const AddToyPage = lazy(() =>
  import('./pages/AddToyPage').then(module => ({ default: module.AddToyPage })),
);
const CartPage = lazy(() =>
  import('./pages/CartPage').then(module => ({ default: module.CartPage })),
);
const WarehousePage = lazy(() =>
  import('./pages/WarehousePage').then(module => ({ default: module.WarehousePage })),
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'toys/:id', element: <ToyPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'warehouse', element: <WarehousePage /> },
      { path: 'login', element: <LoginPage /> },
      {
        path: 'add',
        element: (
          <RequireAuth>
            <AddToyPage />
          </RequireAuth>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
```

Now put the "waiting sign" around the place where pages appear:

📄 **`src/components/RootLayout.tsx`** (replace everything)

```tsx
import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { Footer } from './Footer';
import { Header } from './Header';
import { PageLayout } from './PageLayout';
import { PageTitle } from './PageTitle';

export function RootLayout() {
  return (
    <PageLayout header={<Header title="Tiny Toy Shop" />} footer={<Footer />}>
      <PageTitle />
      {/* While a lazy page downloads, show this sign. The header stays put. */}
      <Suspense fallback={<p role="status">Loading page… ⏳</p>}>
        <Outlet />
      </Suspense>
    </PageLayout>
  );
}
```

And a link to the new page in the header:

📄 **`src/components/Header.tsx`** (edit these lines)

```diff
           <NavLink to="/add">Add a toy</NavLink>
+          <NavLink to="/warehouse">Warehouse</NavLink>
           {user ? (
```

## 6. Look inside the bundle

Teach the build to draw a picture when we ask for it:

📄 **`vite.config.ts`** (replace everything)

```ts
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    // Only when you ask: ANALYZE=true npm run build
    process.env.ANALYZE ? visualizer({ filename: 'dist/stats.html', gzipSize: true }) : null,
  ],
});
```

Now:

```bash
npm run build
```

The output lists **several** files. The page chunks (`CartPage`, `AddToyPage`, `WarehousePage`, and the virtual-list library) are separate, and the main file shrank. Then make the picture:

```bash
ANALYZE=true npm run build      # Mac / Linux
```

(On Windows PowerShell: `$env:ANALYZE="true"; npm run build`.) Open `dist/stats.html` in your browser: a map of rectangles, one per package, sized by weight. The biggest rectangle is usually React itself, then the router and the query library. This is how you find out *what is heavy* instead of guessing.

## 7. Try the warehouse

Run the shop and click **Warehouse**. You'll briefly see "Loading page…" the first time (the chunk downloads). Then scroll the list: it's smooth, and the clock ticks every second.

Check how few rows really exist. Open the browser console and run:

```js
document.querySelectorAll('[role="listitem"]').length
```

You'll see roughly 20, not 10,000!

## 8. What just happened?

### The five fixes in one place

| Problem | Fix | In our shop |
|---------|-----|-------------|
| State too high | **Move state down**, so only a small component redraws | `StockClock` |
| Big component redraws for a small change | **Split components** | `StockClock` / `WarehouseList` |
| Expensive child redraws needlessly | `memo`, `useMemo`, `useCallback` (Lesson 11) | `ToyList`, `ToyCard` |
| Huge list | **Virtualize** | `WarehouseList` |
| Big download | **Code splitting** with `lazy` + `Suspense` | pages in `router.tsx` |

### Other good habits

- **Import only what you need:** `import { debounce } from 'lodash-es'` (tree-shakeable) instead of `import _ from 'lodash'`, which can pull in the whole library.
- **Images:** serve the right size, use modern formats (WebP/AVIF), give `<img>` a `width` and `height` (so the page doesn't jump), and use `loading="lazy"` for pictures below the fold:

  ```tsx
  <img src="/photos/castle.webp" alt="A toy castle" width="400" height="300" loading="lazy" />
  ```
- **Fonts and scripts:** load only what you use.
- **Check the production build**, not just the dev server. Dev mode is slower on purpose.

### Traps to avoid

- Creating new objects, arrays or functions in props each render when the child is memoized (Lesson 11).
- Using `useEffect` to derive state: it causes an **extra** render. Compute it while rendering instead (Lesson 6).
- Fetching again on every render because of a missing dependency (Lesson 6).
- Putting fast-changing values in a context that many components read (Lessons 8 and 16).

### The React Compiler

The React Compiler (Lesson 11) can reduce *manual* memoization work, but it can't fix state that lives in the wrong place, huge lists or giant bundles. Structure first, then measure, then optimize.

### One honest caution about virtualization

Because only some rows exist in the page, the browser's built-in "find in page" won't find the others, and screen readers see only the rendered rows. Use virtualization when you really have thousands of rows, and offer search or filtering next to it.

## 🧪 Try it yourself

1. **Feel the mistake.** In `WarehouseList`, temporarily replace the virtual rows with a plain `items.map(...)` of all 10,000 items. Reload and scroll. How does it feel? Check the number of listitems in the console. Then undo.
2. **Profile the clock.** Install React DevTools, open the Profiler, record a few seconds on the warehouse page. Which components rendered each second? Then move `StockClock`'s `useState` into `WarehousePage` (the mistake above) and profile again.
3. **Throttle the network.** In the Network tab choose "Slow 4G" and open the Cart for the first time. Do you see "Loading page…"? Which file was downloaded?
4. **Run Lighthouse.** In Chrome DevTools open **Lighthouse** and generate a report for the home page (use the `npm run preview` version). What are your scores? What does it suggest?
5. **Add `loading="lazy"`.** Pretend `ToyCard` had a photo. Where would you add the `width`, `height` and `loading="lazy"` attributes? Why `width` and `height`?

## ✅ Check yourself

<details>
<summary>1. What should you do before optimizing?</summary>

Measure: use the React DevTools Profiler, the browser's Performance and Network tabs, and the bundle visualizer to find the real problem.
</details>

<details>
<summary>2. How does "moving state down" make an app faster?</summary>

Only the component that owns the state and its children re-render when it changes. Putting a ticking clock in its own component keeps the big list from re-rendering every second.
</details>

<details>
<summary>3. What does <code>lazy</code> do, and why is <code>Suspense</code> needed with it?</summary>

`lazy` delays downloading a component's code until it's first drawn. While it downloads, the component "suspends" and `Suspense` shows the fallback.
</details>

<details>
<summary>4. Why does virtualization help with 10,000 rows?</summary>

It renders only the visible rows (plus a few extras), so the page has ~20 DOM nodes instead of thousands, even though the scrollbar behaves as if all rows exist.
</details>

## Recap

- Measure first: Profiler, Network, Lighthouse and the bundle picture.
- Move state down and split components before reaching for memoization.
- Split code with `lazy` + `Suspense` so people download only what they use.
- Virtualize long lists with a library like TanStack Virtual.
- Keep bundles small (import only what you need), and optimize images.

➡️ **Next:** [Lesson 18 – Concurrency, Suspense and error boundaries: the calm kitchen](18-concurrency-suspense-and-error-boundaries.md)
