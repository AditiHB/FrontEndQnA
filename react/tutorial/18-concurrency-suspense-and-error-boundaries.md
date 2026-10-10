# Lesson 18: Concurrency, Suspense and Error Boundaries – The Calm Kitchen

> **Like I'm 5:** Imagine a cook who can pause a slow dish to make a quick salad for a hungry guest. Transitions let React put slow updates aside so the screen stays responsive. Suspense is a sign that says "food is coming, here's a placeholder". An error boundary is a fire alarm for one room, so the rest of the house keeps running.

| | |
|---|---|
| **Concept reference** | [18 – Concurrency, Suspense & error boundaries](../concepts/18-concurrency-suspense-and-error-boundaries.md) |
| **You will learn** | Urgent vs non-urgent updates, `useTransition`, `useDeferredValue`, Suspense for data, error boundaries with `react-error-boundary`, resetting a boundary, and what boundaries do **not** catch |
| **We build** | A "Science Lab" page with three typing experiments and a crash test, a toy page that waits politely with Suspense, and a safety net around every page |
| **Time** | About 90 minutes |

## The story

Two kinds of trouble can ruin a visitor's day:

1. **Slowness.** Some updates take long (filtering a huge list). While React is busy, typing in a box feels *stuck*.
2. **Breakage.** Something throws an error while drawing, and the whole page turns white.

React has tools for both. We'll build a "Science Lab" page to play with them safely.

## 1. Concurrent rendering: urgent vs. not urgent

Typing in a text box must feel **instant**. Showing a filtered list can take a moment longer and nobody minds, as long as the box stays quick.

With **concurrent rendering**, React can *pause* a slow, non-urgent draw, handle an urgent update (a key press), and then resume. You tell React which updates are not urgent:

| Tool | Use it when |
|------|-------------|
| `useTransition` | **You** are the one calling `setState`, so you can wrap the slow update |
| `useDeferredValue` | You only receive a **value** (for example a prop) and can't wrap the update that changed it |

## 2. Install the error-boundary helper

```bash
npm install react-error-boundary
```

## 3. The lab

### A deliberately slow list

This list is slow **on purpose**: every row wastes one millisecond. 250 rows ≈ a quarter of a second per draw. (Never write real code like this! It only exists so we can *feel* the problem.)

📄 **`src/lab/SlowList.tsx`** (new file)

```tsx
import { memo } from 'react';
import { makeWarehouse } from '../lib/warehouse';

export const ALL_ITEMS = makeWarehouse(250).map(item => `${item.name} (${item.sku})`);

export function filterItems(items: string[], query: string): string[] {
  const needle = query.trim().toLowerCase();
  return items.filter(item => item.toLowerCase().includes(needle));
}

// Pretend each row is hard to draw. For experiments only!
function wasteTime(ms: number) {
  const start = performance.now();
  while (performance.now() - start < ms) {
    // do nothing, slowly
  }
}

function SlowItem({ text }: { text: string }) {
  wasteTime(1);
  return <li>{text}</li>;
}

export const SlowList = memo(function SlowList({ items }: { items: string[] }) {
  return (
    <ul className="slow-list">
      {items.map(item => (
        <SlowItem key={item} text={item} />
      ))}
    </ul>
  );
});
```

### Three search boxes

📄 **`src/lab/SearchLabs.tsx`** (new file)

```tsx
import {
  useDeferredValue,
  useMemo,
  useState,
  useTransition,
  type ChangeEvent,
} from 'react';
import { ALL_ITEMS, SlowList, filterItems } from './SlowList';

// Experiment 1: no help. Every key press redraws the slow list right away.
export function NoHelpSearch() {
  const [query, setQuery] = useState('');
  const results = filterItems(ALL_ITEMS, query);

  return (
    <div>
      <input
        aria-label="Search with no help"
        value={query}
        onChange={event => setQuery(event.target.value)}
      />
      <SlowList items={results} />
    </div>
  );
}

// Experiment 2: useTransition. The text is urgent; the list can wait.
export function TransitionSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(ALL_ITEMS);
  const [isPending, startTransition] = useTransition();

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setQuery(value); // urgent: the input stays responsive
    startTransition(() => {
      setResults(filterItems(ALL_ITEMS, value)); // not urgent: may be paused or dropped
    });
  }

  return (
    <div>
      <input aria-label="Search with a transition" value={query} onChange={handleChange} />
      {isPending && <span> Updating…</span>}
      <SlowList items={results} />
    </div>
  );
}

// Experiment 3: useDeferredValue. A copy of the value that lags behind.
export function DeferredSearch() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() => filterItems(ALL_ITEMS, deferredQuery), [deferredQuery]);

  return (
    <div>
      <input
        aria-label="Search with a deferred value"
        value={query}
        onChange={event => setQuery(event.target.value)}
      />
      {query !== deferredQuery && <span> Updating…</span>}
      <SlowList items={results} />
    </div>
  );
}
```

### The crash test

📄 **`src/lab/CrashLab.tsx`** (new file)

```tsx
import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button, DangerButton } from '../components/Button';

// A component that blows up while React is drawing it.
function Bomb({ armed }: { armed: boolean }) {
  if (armed) throw new Error('💥 The bomb went off while React was drawing!');
  return <p>The bomb is quiet. 😌</p>;
}

export function CrashLab() {
  const [armed, setArmed] = useState(false);
  const [message, setMessage] = useState('');

  // Errors in event handlers are NOT caught by boundaries. Use try/catch.
  function doSomethingRisky() {
    try {
      JSON.parse('{ this is not valid json');
    } catch (error) {
      setMessage(`Caught by try/catch: ${error instanceof Error ? error.message : 'unknown'}`);
    }
  }

  return (
    <div>
      <ErrorBoundary
        onReset={() => setArmed(false)}
        fallbackRender={({ error, resetErrorBoundary }) => (
          <div role="alert">
            <p>This part broke: {error instanceof Error ? error.message : 'unknown error'}</p>
            <Button onClick={resetErrorBoundary}>Defuse and try again</Button>
          </div>
        )}
      >
        <Bomb armed={armed} />
      </ErrorBoundary>

      <p>
        <DangerButton onClick={() => setArmed(true)}>Arm the bomb</DangerButton>{' '}
        <Button variant="ghost" onClick={doSomethingRisky}>
          Do something risky (try/catch)
        </Button>
      </p>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
```

📄 **`src/pages/LabPage.tsx`** (new file)

```tsx
import { Section } from '../components/Section';
import { CrashLab } from '../lab/CrashLab';
import { DeferredSearch, NoHelpSearch, TransitionSearch } from '../lab/SearchLabs';
import './LabPage.css';

export function LabPage() {
  return (
    <>
      <Section title="🔬 Science Lab: typing with a slow list">
        <p>
          Each list below has 250 slow rows. Type quickly in each box (try holding a letter
          key). Which one stays smooth?
        </p>
        <div className="lab__grid">
          <div>
            <h3>1. No help</h3>
            <NoHelpSearch />
          </div>
          <div>
            <h3>2. useTransition</h3>
            <TransitionSearch />
          </div>
          <div>
            <h3>3. useDeferredValue</h3>
            <DeferredSearch />
          </div>
        </div>
      </Section>

      <Section title="🧨 Science Lab: crash test">
        <CrashLab />
      </Section>
    </>
  );
}
```

📄 **`src/pages/LabPage.css`** (new file)

```css
.lab__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: var(--space-3);
}

.slow-list {
  max-height: 12rem;
  overflow: auto;
  margin: var(--space-2) 0 0;
  padding-left: var(--space-4);
  font-size: 0.85rem;
}
```

Add the page to the router and header (it's another lazy page, so it costs nothing until visited):

📄 **`src/router.tsx`** (edit these lines)

```diff
 const WarehousePage = lazy(() =>
   import('./pages/WarehousePage').then(module => ({ default: module.WarehousePage })),
 );
+const LabPage = lazy(() =>
+  import('./pages/LabPage').then(module => ({ default: module.LabPage })),
+);
@@
       { path: 'warehouse', element: <WarehousePage /> },
+      { path: 'lab', element: <LabPage /> },
```

📄 **`src/components/Header.tsx`** (edit these lines)

```diff
           <NavLink to="/warehouse">Warehouse</NavLink>
+          <NavLink to="/lab">Lab</NavLink>
           {user ? (
```

Open **Lab**, and type fast in each box (or hold down a letter key):

1. **No help:** the box stutters and letters appear in bursts. Each key press draws 250 slow rows *before* the browser can show the letter.
2. **useTransition:** the box stays smooth and a little "Updating…" appears; the list catches up afterwards.
3. **useDeferredValue:** the same smoothness, with a different tool.

> On the test machine used to check this lesson, eight quick key presses took about **1.7 seconds** with no help and under **0.1 seconds** with either tool. Your numbers will differ, but the contrast will be clear.

## 4. How the two tools work

### `useTransition`

```tsx
const [isPending, startTransition] = useTransition();

setQuery(value);                                   // urgent
startTransition(() => setResults(filter(value)));  // can wait
```

- Updates inside `startTransition` are marked **non-urgent**. React can start drawing them, pause when you press another key, and even **throw away** an outdated draw.
- `isPending` is `true` while the transition is waiting, perfect for a small "Updating…" hint.

### `useDeferredValue`

```tsx
const deferredQuery = useDeferredValue(query);
const results = useMemo(() => filterItems(ALL_ITEMS, deferredQuery), [deferredQuery]);
```

- `deferredQuery` is `query` **after a delay**: React first draws with the *old* value (fast, so the input stays smooth), and in the background draws again with the *new* one.
- It works well with `memo` / `useMemo` (Lesson 11): while the value is still old, the slow list is skipped entirely. That's why `SlowList` is wrapped in `memo`.
- Use it when you can't wrap the update, for example a value that comes in as a **prop**.

**Rule of thumb:** mark *urgent* things (typing, clicking) differently from *non-urgent* ones (filtering a big list, switching to a heavy tab).

## 5. Suspense: "food is coming"

`<Suspense fallback={…}>` shows its fallback while something inside it is **not ready yet**. You already used it for lazy pages (Lesson 17). It also works for **data**, but only if the data layer cooperates: a framework, the `use(promise)` function (Lesson 19), or a library like TanStack Query in its Suspense mode.

TanStack Query has `useSuspenseQuery`: instead of giving you `isPending`, it *suspends*: the component stops drawing, the nearest Suspense shows its fallback, and when the data arrives the component draws with `data` that is **always defined**. Add a Suspense version of our "get one toy" hook:

📄 **`src/hooks/useToys.ts`** (edit these lines)

```diff
-import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
+import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
@@
       queryClient.getQueryData<Toy[]>(['toys'])?.find(toy => toy.id === id),
   });
 }
+
+// ── Reading: one toy, the "Suspense" way ──────────────────────────────
+// There is no isPending check: while loading, the component "suspends" and
+// the nearest <Suspense> shows its fallback. "data" is always a Toy.
+export function useSuspenseToy(id: string) {
+  const queryClient = useQueryClient();
+
+  return useSuspenseQuery({
+    queryKey: ['toys', id],
+    queryFn: ({ signal }) => fetchToy(id, signal),
+    retry: false,
+    initialData: () =>
+      queryClient.getQueryData<Toy[]>(['toys'])?.find(toy => toy.id === id),
+  });
+}
```

## 6. Error boundaries: a fire alarm for one room

If a component throws an error **while drawing**, React unmounts the whole tree by default: a white page. An **error boundary** catches the error below it and shows a fallback instead, so only that part of the page is affected.

Error boundaries must be *class* components, so we use the tiny `react-error-boundary` library, which gives us a ready-made one.

```tsx
<ErrorBoundary fallback={<p>Could not load the chart.</p>} onError={log}>
  <Chart />
</ErrorBoundary>
```

### What boundaries catch (and don't)

| Caught ✅ | NOT caught ❌ |
|-----------|--------------|
| Errors while **rendering** | Errors in **event handlers** (`onClick`) |
| Errors in lifecycle/effects in the tree *(rendering phase)* | Errors in **async** code (`setTimeout`, un-awaited promises) |
| Errors thrown by `useSuspenseQuery` | Errors in the **boundary itself** |

For the ❌ column use `try`/`catch` and show the result with state (like `doSomethingRisky` in the lab), or use your query library's error states.

### Where to put boundaries

Use **one boundary per independent part** of the page, so one failure does not take everything down. We'll add two:

1. **A big one** around all pages in the layout. If a page crashes, the header and footer stay alive.
2. **A small one** on the toy page, for the "this toy doesn't exist" case.

📄 **`src/components/RootLayout.tsx`** (replace everything)

```tsx
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet, useLocation } from 'react-router';
import { Button } from './Button';
import { Footer } from './Footer';
import { Header } from './Header';
import { PageLayout } from './PageLayout';
import { PageTitle } from './PageTitle';

export function RootLayout() {
  const location = useLocation();

  return (
    <PageLayout header={<Header title="Tiny Toy Shop" />} footer={<Footer />}>
      <PageTitle />
      <ErrorBoundary
        // Going to another page clears the error automatically.
        resetKeys={[location.pathname]}
        // In a real app, send this to a monitoring service.
        onError={error => console.error('Reported to monitoring:', error)}
        fallbackRender={({ error, resetErrorBoundary }) => (
          <div role="alert">
            <h2>Oops, something broke 🧯</h2>
            <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
            <Button onClick={resetErrorBoundary}>Try again</Button>
          </div>
        )}
      >
        <Suspense fallback={<p role="status">Loading page… ⏳</p>}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    </PageLayout>
  );
}
```

The toy page gets its own Suspense **and** boundary. The inner `ToyContent` has no loading or error code at all: it just uses `data`.

📄 **`src/pages/ToyPage.tsx`** (replace everything)

```tsx
import { Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Link, useParams } from 'react-router';
import { Button } from '../components/Button';
import { QuantityPicker } from '../components/QuantityPicker';
import { ToyDetails } from '../components/ToyDetails';
import { useToggleFavorite, useSuspenseToy, useToys } from '../hooks/useToys';
import { useCartStore } from '../store/cartStore';
import type { Toy } from '../types';
import './ToyPage.css';

export function ToyPage() {
  const { id = '' } = useParams();

  return (
    <div className="toy-page">
      <Link to="/">← Back to the shop</Link>

      {/* If anything below throws (like "no such toy"), show this instead. */}
      <ErrorBoundary
        resetKeys={[id]}
        fallback={
          <div role="alert">
            <h2>Hmm, we can't find that toy 🔍</h2>
            <Link to="/">Back to the shop</Link>
          </div>
        }
      >
        {/* While the toy loads, show this. */}
        <Suspense fallback={<p>Opening the toy box… 📦</p>}>
          <ToyContent id={id} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

function ToyContent({ id }: { id: string }) {
  const { data: toy } = useSuspenseToy(id); // always defined: no loading/error checks
  const { toys } = useToys();

  const index = toys.findIndex(t => t.id === toy.id);
  const next = index >= 0 ? toys[(index + 1) % toys.length] : undefined;

  return (
    <>
      {/* key: a different toy means a brand-new ToyView with a fresh quantity */}
      <ToyView key={toy.id} toy={toy} />
      {next && (
        <p>
          <Link to={`/toys/${next.id}`}>
            Next toy: {next.emoji} {next.name} →
          </Link>
        </p>
      )}
    </>
  );
}

function ToyView({ toy }: { toy: Toy }) {
  const addToCart = useCartStore(state => state.add);
  const toggleFavorite = useToggleFavorite();
  const [qty, setQty] = useState(1);

  return (
    <article>
      <h2>
        {toy.name}{' '}
        <button
          type="button"
          className="toy-page__heart"
          aria-pressed={Boolean(toy.favorite)}
          aria-label={toy.favorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={() => toggleFavorite.mutate({ id: toy.id, favorite: !toy.favorite })}
        >
          {toy.favorite ? '♥' : '♡'}
        </button>
      </h2>
      {toggleFavorite.isError && <p role="alert">{toggleFavorite.error.message}</p>}
      <ToyDetails toy={toy} />
      <div className="toy-page__buy">
        <QuantityPicker qty={qty} onChange={setQty} disabled={!toy.inStock} />
        <Button
          disabled={!toy.inStock}
          onClick={() => {
            addToCart(toy, qty);
            setQty(1);
          }}
        >
          {toy.inStock ? 'Add to cart' : 'Sold out'}
        </Button>
      </div>
    </article>
  );
}
```

## 7. Play with it

1. On the **Lab** page press **Arm the bomb**. The bomb's part is replaced by the red message, while the rest of the page and the header still work. Press **Defuse** to reset.
2. Press **Do something risky**: the error is caught by `try/catch` and shown as a message. A boundary wouldn't have helped there.
3. Open `/toys/t3`: you see "Opening the toy box…" for an instant (or not at all, if the list was already cached), then the toy.
4. Open `/toys/nonsense`: the toy page's little boundary shows "we can't find that toy". The header and footer are untouched. Click a header link: you're back to normal. (Open the browser console: the error is printed there in red too. React reports errors even when a boundary catches them, so that's normal.)

## 8. What just happened?

```text
RootLayout
 ├─ Header                         ← always alive
 ├─ ErrorBoundary (big)            ← catches anything a page throws
 │    └─ Suspense (pages)          ← waits for lazy pages
 │         └─ ToyPage
 │              ├─ ErrorBoundary (small)   ← "no such toy"
 │              │    └─ Suspense (toy)     ← waits for the toy
 │              │         └─ ToyContent (useSuspenseToy)
 └─ Footer                         ← always alive
```

- **Boundaries and Suspense nest.** The *closest* one above the component that suspends or throws handles it. That is how you choose "how much of the screen" waits or fails.
- **Reset a boundary.** `resetKeys={[location.pathname]}` clears the error when the key changes. Another way is to give the boundary a `key`: `<ErrorBoundary key={routeId}>`. Changing the key remounts it with a clean slate. A "Try again" button can call `resetErrorBoundary`.
- With TanStack Query in Suspense mode, a *failed* query is thrown to the boundary. To make "Try again" **refetch**, wrap the boundary in the library's `QueryErrorResetBoundary`. Check its docs when you need it.
- **Log errors.** The `onError` callback is the place to send errors to a monitoring tool.

### Good habits

- Mark urgent updates (typing, clicking) differently from non-urgent updates (filtering a big list).
- Use one boundary **per independent part** of the page.
- Place Suspense boundaries so visitors see the right amount of UI while waiting. Not too high (a whole-page spinner) and not too low (a hundred tiny spinners).
- Don't forget the ❌ column: handle event-handler and async errors yourself.

## 🧪 Try it yourself

1. **Compare in the Profiler.** Record typing in "No help" and in "useTransition" with the React DevTools Profiler. What differs?
2. **Remove `memo`** from `SlowList` in the deferred box. Is it still smooth? Why does `memo` matter here?
3. **Move a boundary.** Remove the small boundary from `ToyPage`. Now open `/toys/nonsense`. Which boundary catches it, and what does the visitor see?
4. **Move a Suspense.** Move the `<Suspense>` in `ToyPage` up to wrap the whole page including the "Back" link. What's the difference while loading?
5. **A key reset.** Give the lab's crash `ErrorBoundary` a `key` that you change on a button click instead of using `onReset`.
6. **Throw in an event handler** on purpose (`onClick={() => { throw new Error('x') }}`). Does a boundary catch it? Where do you see the error?

## ✅ Check yourself

<details>
<summary>1. When do you use <code>useTransition</code> and when <code>useDeferredValue</code>?</summary>

`useTransition` when you control the state update and can wrap it; `useDeferredValue` when you only get a value (for example as a prop) and want a lagging copy for the slow part.
</details>

<details>
<summary>2. What does Suspense do?</summary>

It shows a fallback while something inside is not ready (a lazy component, or data from a Suspense-aware source).
</details>

<details>
<summary>3. Name three kinds of errors that error boundaries do <em>not</em> catch.</summary>

Errors in event handlers, errors in asynchronous code (timeouts, un-awaited promises), and errors thrown by the boundary itself.
</details>

<details>
<summary>4. How do you reset an error boundary?</summary>

Change its `resetKeys` or `key`, or call `resetErrorBoundary` from the fallback.
</details>

## Recap

- Concurrent rendering lets React keep urgent updates smooth while non-urgent ones wait.
- `useTransition` wraps a state update; `useDeferredValue` gives a lagging copy of a value.
- Suspense shows a placeholder while code or data isn't ready; `useSuspenseQuery` makes queries cooperate.
- Error boundaries catch rendering errors in their children; use one per independent part of the page.
- Event-handler and async errors need `try`/`catch`.

➡️ **Next:** [Lesson 19 – React 19 features: new helpers in the kitchen](19-react-19-features.md)
