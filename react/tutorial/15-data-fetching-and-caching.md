# Lesson 15: Data Fetching and Caching – The Fridge and the Shop

> **Like I'm 5:** Fetching data is asking the shop for groceries. Caching is keeping the groceries in your fridge, so you don't walk to the shop every time you are hungry. Stale data is milk that is past its date: it can still be used, but you should buy fresh milk soon.

| | |
|---|---|
| **Concept reference** | [15 – Data fetching & caching](../concepts/15-data-fetching-and-caching.md) |
| **You will learn** | Why hand-written fetching is not enough, TanStack Query (`useQuery`, `useMutation`), query keys, `staleTime` and `gcTime`, cache invalidation, optimistic updates with rollback, server state vs client state |
| **We build** | A pretend server API, shared & cached toy data, saving new toys, and a ❤️ favorite button that updates instantly (and un-updates when the server says no) |
| **Time** | About 90 minutes |

## The story

Our `useToys` works, but it has a long wish-list we never built:

- **Cancel old requests** when you navigate away,
- **Share one request** between components that want the same data,
- **Remember** (cache) answers so going back is instant,
- **Refetch** when the data may be old, for example when you return to the tab,
- **Retry** failed requests,
- **Update** the screen when you change something on the server.

Writing all that by hand for every request is a lot. A **data library** does it for us. The most popular one for React is **TanStack Query** (it used to be called React Query).

## 1. Server state vs client state

This idea matters more than any API:

| | Server state | Client state |
|---|---|---|
| **Owned by** | The backend (a database) | Your app, in the browser |
| **Examples here** | Toys, favorites | Cart, theme, the open pop-up, the typed search text |
| **Properties** | You only see a **copy**; it can be out of date; loading and errors exist | Always up to date; instant |
| **Tool** | A query library (this lesson) | `useState`, `useReducer`, context, a store (Lesson 16) |

> **Never keep copies of server data in `useState`** when a query library can own it. The library keeps the one true copy and knows when it is old.

## 2. Install

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

The second package is a little debugging panel that shows the cache. It only appears while developing and is not included in the final production files.

## 3. A pretend server

We still have no real backend. So we write one function per "server request" in a file of its own, which **pretends** to be a server: it waits half a second (like a real network), reads `toys.json`, remembers new toys and favorites **in memory**, and sometimes says no. (Reloading the page resets this memory: it's a pretend database.)

If you later get a real server, this is the only file you change.

First update the `Toy` type: the "server" will tell us if a toy is a favorite.

📄 **`src/types.ts`** (replace everything)

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
  favorite?: boolean; // filled in by the (pretend) server
}

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

📄 **`src/api/toysApi.ts`** (new file)

```ts
import type { Toy } from '../types';

// This file PRETENDS to be a server. A real app would call a real API here.
const FAKE_DELAY_MS = import.meta.env.MODE === 'test' ? 0 : 500;
const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// The pretend database. It lives in memory, so reloading the page resets it.
const addedToys: Toy[] = [];
const favoriteIds = new Set<string>();

export async function fetchToys(signal?: AbortSignal): Promise<Toy[]> {
  await delay(FAKE_DELAY_MS);
  const response = await fetch('/toys.json', { signal });
  if (!response.ok) throw new Error(`The toy truck broke down (${response.status})`);
  const catalogue = (await response.json()) as Toy[];

  return [...catalogue, ...addedToys].map(toy => ({
    ...toy,
    favorite: favoriteIds.has(toy.id),
  }));
}

export async function fetchToy(id: string, signal?: AbortSignal): Promise<Toy> {
  const toys = await fetchToys(signal);
  const toy = toys.find(t => t.id === id);
  if (!toy) throw new Error(`There is no toy with id "${id}"`);
  return toy;
}

export async function createToy(toy: Toy): Promise<Toy> {
  await delay(FAKE_DELAY_MS);
  addedToys.push(toy);
  return toy;
}

export async function setFavorite(id: string, favorite: boolean): Promise<void> {
  await delay(FAKE_DELAY_MS);
  // So we can practise what happens when the server says no:
  if (id === 't12') throw new Error('The Mystery Box refuses to be a favorite!');
  if (favorite) favoriteIds.add(id);
  else favoriteIds.delete(id);
}
```

## 4. Turn on the query library

A `QueryClient` is the fridge: it holds the cache. The `QueryClientProvider` puts it in a context (Lesson 8) so every hook can find it. We retire `ToysProvider`.

📄 **`src/main.tsx`** (replace everything)

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router/dom';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { router } from './router';

// The fridge. Make it ONCE, outside any component.
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
```

## 5. The hooks: `useQuery` and `useMutation`

Our hand-made `useToys.tsx` and `useFetch.ts` are done. Delete them. The new `useToys.ts` has the same name and the same return shape, so most pages won't notice the change.

```bash
rm src/hooks/useToys.tsx src/hooks/useFetch.ts
```

Read the code first, then we explain each idea below.

📄 **`src/hooks/useToys.ts`** (new file)

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createToy, fetchToy, fetchToys, setFavorite } from '../api/toysApi';
import type { Toy } from '../types';

const NO_TOYS: Toy[] = [];

// ── Reading: the whole shelf ──────────────────────────────────────────
export function useToys() {
  const query = useQuery({
    queryKey: ['toys'], // the label on the jar in the fridge
    queryFn: ({ signal }) => fetchToys(signal), // how to buy it at the shop
    staleTime: 60_000, // "fresh" for one minute: no refetch needed
  });

  const status = query.isPending ? 'loading' : query.isError ? 'error' : 'success';
  return {
    toys: query.data ?? NO_TOYS,
    status,
    reload: () => {
      void query.refetch();
    },
  } as const;
}

// ── Reading: one toy ──────────────────────────────────────────────────
export function useToy(id: string | undefined) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['toys', id], // includes the id: every toy has its own jar
    queryFn: ({ signal }) => fetchToy(id!, signal),
    enabled: id !== undefined,
    retry: false, // a toy that doesn't exist won't appear if we ask again
    // Start from the shelf we already have, so the page opens instantly.
    initialData: () =>
      queryClient.getQueryData<Toy[]>(['toys'])?.find(toy => toy.id === id),
  });
}

// ── Writing: add a toy ────────────────────────────────────────────────
export function useAddToy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createToy,
    // The shelf changed on the server → our copy is old → mark it stale.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['toys'] }),
  });
}

// ── Writing: ❤️ with an optimistic update ─────────────────────────────
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, favorite }: { id: string; favorite: boolean }) =>
      setFavorite(id, favorite),

    // 1. Before the request: update the screen straight away (optimistic).
    onMutate: async ({ id, favorite }) => {
      await queryClient.cancelQueries({ queryKey: ['toys'] }); // stop old answers overwriting our guess
      const previous = queryClient.getQueryData<Toy[]>(['toys']);
      queryClient.setQueryData<Toy[]>(['toys'], old =>
        old?.map(toy => (toy.id === id ? { ...toy, favorite } : toy)),
      );
      queryClient.setQueryData<Toy>(['toys', id], old => old && { ...old, favorite });
      return { previous }; // remember the old shelf, in case we must go back
    },

    // 2. If the server says no: put the old shelf back.
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(['toys'], context?.previous);
    },

    // 3. Either way: re-check with the server so we are really in sync.
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['toys'] }),
  });
}
```

### What each idea means

**`queryKey`: the label on the jar.** Data is stored in the cache under its key. Two components that ask for `['toys']` get the **same jar** and share one request. If the query depends on a variable (like `id`) **put it in the key**: `['toys', id]`. Different id → different jar. `invalidateQueries({ queryKey: ['toys'] })` empties/marks *every* jar whose key starts with `['toys']`, including all `['toys', id]` ones.

**`queryFn`: how to get it.** A function that returns a promise. It receives a `signal`, so the library can cancel the request when it's no longer wanted. We pass it on to `fetch`.

**`staleTime`: how long milk is "fresh".** During that time, asking for the same data gives the cached copy without any request. After it, the data is **stale**: the cache still shows it immediately, but also refetches in the background (for example when a component mounts again or the browser tab regains focus).

**`gcTime`: how long unused jars stay in the fridge.** When no component uses a query any more, its data is kept for a while (5 minutes by default) and then thrown away ("garbage collected"). Coming back inside that time is instant.

**`isPending`**: there is no data yet. **`isError`**: the request failed (after retries, 3 by default, with growing waits). The library handles retries for you.

**`useMutation`: changing something on the server.** Unlike a query it doesn't run by itself; you call `mutation.mutate(variables)`.

**Invalidation.** After a successful change, mark the affected jars stale. Active queries refetch automatically, and the screen shows the truth from the server.

**Optimistic update.** For a button like ❤️ it feels better to show the result *immediately* and fix it later if the server refuses. The three steps in `useToggleFavorite` are the standard recipe: `onMutate` (change the cache, remember the old value), `onError` (roll back), `onSettled` (refetch to be sure).

## 6. Use the hooks

`useToys()` still returns `{ toys, status, reload }`, so **`HomePage` hardly changes**. It only gets the favorite button.

📄 **`src/components/ToyList.tsx`** (replace everything)

```tsx
import { memo } from 'react';
import type { Toy } from '../types';
import { ToyCard } from './ToyCard';
import './ToyList.css';

interface ToyListProps {
  toys: Toy[];
  onAdd: (toy: Toy, qty: number) => void;
  onToggleFavorite: (toy: Toy) => void;
}

export const ToyList = memo(function ToyList({ toys, onAdd, onToggleFavorite }: ToyListProps) {
  if (toys.length === 0) {
    return <p className="toy-list__empty">No toys found. The shelf is empty 🙈</p>;
  }

  return (
    <ul className="toy-grid">
      {toys.map(toy => (
        <li key={toy.id}>
          <ToyCard toy={toy} onAdd={onAdd} onToggleFavorite={onToggleFavorite} />
        </li>
      ))}
    </ul>
  );
});
```

📄 **`src/components/ToyCard.tsx`** (replace everything)

```tsx
import { memo, useState } from 'react';
import { Link } from 'react-router';
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
  onToggleFavorite: (toy: Toy) => void;
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

export const ToyCard = memo(function ToyCard({
  toy,
  badge,
  onAdd,
  onToggleFavorite,
}: ToyCardProps) {
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
      <button
        type="button"
        className="toy-card__heart"
        aria-pressed={Boolean(toy.favorite)}
        aria-label={
          toy.favorite ? `Remove ${toy.name} from favorites` : `Add ${toy.name} to favorites`
        }
        onClick={() => onToggleFavorite(toy)}
      >
        {toy.favorite ? '♥' : '♡'}
      </button>
      <div className="toy-card__emoji" aria-hidden="true">
        {toy.emoji}
      </div>
      <h3 className="toy-card__name">
        <Link to={`/toys/${toy.id}`}>{toy.name}</Link>
      </h3>
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
.toy-card__heart {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  background: transparent;
  border: 0;
  font-size: 1.4rem;
  line-height: 1;
  color: var(--color-danger-text);
}

/* Make room for the heart. */
.toy-card__badge--sold-out {
  right: 2.8rem;
}
```

📄 **`src/pages/HomePage.tsx`** (replace everything)

```tsx
import { useCallback, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Button } from '../components/Button';
import { CategoryFilter } from '../components/CategoryFilter';
import { SaleBanner } from '../components/SaleBanner';
import { SearchBox, type SearchBoxHandle } from '../components/SearchBox';
import { Section } from '../components/Section';
import { SplitView } from '../components/SplitView';
import { ToyList } from '../components/ToyList';
import { ToyRoulette } from '../components/ToyRoulette';
import { useCartDispatch } from '../context/CartContext';
import { useDebounce } from '../hooks/useDebounce';
import { useToggleFavorite, useToys } from '../hooks/useToys';
import { isCategory } from '../lib/categories';
import type { CategoryChoice, Toy } from '../types';
import './HomePage.css';

const luckySeed = Math.random();

export function HomePage() {
  const dispatch = useCartDispatch();
  const { toys, status, reload } = useToys();
  const toggleFavorite = useToggleFavorite();
  const searchRef = useRef<SearchBoxHandle>(null);

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const [params, setParams] = useSearchParams();
  const categoryParam = params.get('category');
  const category: CategoryChoice = isCategory(categoryParam) ? categoryParam : 'all';

  function selectCategory(choice: CategoryChoice) {
    setParams(choice === 'all' ? {} : { category: choice });
  }

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

  // "mutate" never changes, so this callback stays the same too.
  const { mutate } = toggleFavorite;
  const handleToggleFavorite = useCallback(
    (toy: Toy) => mutate({ id: toy.id, favorite: !toy.favorite }),
    [mutate],
  );

  return (
    <>
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
            <CategoryFilter selected={category} onSelect={selectCategory} />
          </>
        }
      >
        <Section title={status === 'success' ? `Our toys (${visibleToys.length})` : 'Our toys'}>
          {toggleFavorite.isError && (
            <p role="alert">Could not change the favorite: {toggleFavorite.error.message}</p>
          )}

          {status === 'loading' && <p>Opening the toy box… 📦</p>}

          {status === 'error' && (
            <div role="alert">
              <p>Oh no! The toy truck got lost on the way. 🚚💨</p>
              <Button onClick={reload}>Try again</Button>
            </div>
          )}

          {status === 'success' && (
            <ToyList
              toys={visibleToys}
              onAdd={handleAdd}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
        </Section>
      </SplitView>
    </>
  );
}
```

The toy page now asks for **one** toy with `useToy(id)` (using its own jar), and gets a ❤️ too:

📄 **`src/pages/ToyPage.tsx`** (replace everything)

```tsx
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Button } from '../components/Button';
import { QuantityPicker } from '../components/QuantityPicker';
import { ToyDetails } from '../components/ToyDetails';
import { useCartDispatch } from '../context/CartContext';
import { useToggleFavorite, useToy, useToys } from '../hooks/useToys';
import type { Toy } from '../types';
import './ToyPage.css';

export function ToyPage() {
  const { id } = useParams();
  const toyQuery = useToy(id);
  const { toys } = useToys();

  if (toyQuery.isPending) return <p>Opening the toy box… 📦</p>;
  if (toyQuery.isError) {
    return (
      <div>
        <h2>Hmm, we can't find that toy 🔍</h2>
        <Link to="/">Back to the shop</Link>
      </div>
    );
  }

  const toy = toyQuery.data;
  const index = toys.findIndex(t => t.id === toy.id);
  const next = index >= 0 ? toys[(index + 1) % toys.length] : undefined;

  return (
    <div className="toy-page">
      <Link to="/">← Back to the shop</Link>
      {/* key: a different toy means a brand-new ToyView with a fresh quantity */}
      <ToyView key={toy.id} toy={toy} />
      {next && (
        <p>
          <Link to={`/toys/${next.id}`}>
            Next toy: {next.emoji} {next.name} →
          </Link>
        </p>
      )}
    </div>
  );
}

function ToyView({ toy }: { toy: Toy }) {
  const dispatch = useCartDispatch();
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
            dispatch({ type: 'added', toy, qty });
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

📄 **`src/pages/ToyPage.css`** (add to the bottom)

```css
.toy-page__heart {
  background: transparent;
  border: 0;
  font-size: 1.5rem;
  color: var(--color-danger-text);
}
```

And adding a toy is now a **mutation**. While it saves, we tell the visitor; when it succeeds, we go home:

📄 **`src/pages/AddToyPage.tsx`** (replace everything)

```tsx
import { useNavigate } from 'react-router';
import { AddToyForm } from '../components/AddToyForm';
import { Section } from '../components/Section';
import { useAddToy } from '../hooks/useToys';

export function AddToyPage() {
  const addToy = useAddToy();
  const navigate = useNavigate();

  return (
    <Section title="Add a toy">
      <AddToyForm
        onAdd={toy => addToy.mutate(toy, { onSuccess: () => navigate('/') })}
      />
      {addToy.isPending && <p role="status">Saving… ⏳</p>}
      {addToy.isError && <p role="alert">Could not save: {addToy.error.message}</p>}
    </Section>
  );
}
```

## 7. See it work

Run the shop and open the page.

1. The first load shows "Opening the toy box…" for half a second. That's our pretend network delay.
2. Click a toy name, then **Back**. The shop comes back **instantly**: the shelf is in the cache.
3. Click ♡ on a toy. The heart fills **at once**, even though the "server" takes half a second.
4. Click ♡ on the **Mystery Box**. The heart fills, then after half a second it **un-fills** and a red message appears. That is the rollback.
5. Go to **Add a toy** (log in first), add something. The page says "Saving…", you go home, and the new toy is there. Reload the page: the pretend database resets and the toy is gone (it only lived in memory).
6. Click the little **flower icon** in the corner (the devtools). Open the cache: see the `['toys']` and `['toys', 't3']` entries, their status and when they go stale.
7. Switch to another browser tab for a minute and come back: stale data is refetched in the background (watch the network tab).

## 8. What just happened?

```text
 component asks useQuery(['toys'])
        │
        ├─ in cache and fresh?  ──► return it. No request.
        ├─ in cache but stale?  ──► return it now + refetch in the background.
        └─ not in cache?        ──► isPending… run queryFn… store the answer.

 several components ask for the same key → ONE request, shared.
```

- Loading, error, caching, deduping, cancelling and retrying: all handled. We deleted our own `useFetch` and wrote *less* code.
- Because we hid data behind `useToys()` (Lesson 14), **`HomePage` and friends barely changed**. Changing the engine under a well-named hook is cheap.
- **Invalidation** keeps the shelf honest after changes. **Optimistic updates** keep the UI snappy and undo themselves on failure.

### Good habits

- Let the query library own server data. Use `useState` for client state only.
- Put **every variable** the query depends on in its key.
- Choose a **realistic `staleTime`**: data that rarely changes can stay fresh for minutes; a stock ticker needs seconds.
- Always handle **loading, error, and empty** states explicitly.
- A mutation that changes the server should end with an **invalidation** (or a careful cache update).
- Optimistic updates need a **rollback path** (`onError`).

## 🧪 Try it yourself

1. **Watch the sharing.** Open the browser's Network tab. Reload the home page and count the requests for `toys.json`. Then navigate to a toy page and back. Why are there so few?
2. **Change `staleTime`** to `0` in `useToys` and go to a toy page and back. What do you see in the network tab now?
3. **Break the server.** Rename `public/toys.json` for a moment. The home page shows the error after three quick retries (watch the delay). Then rename it back and press **Try again**.
4. **Make the heart pessimistic.** Remove `onMutate` from `useToggleFavorite`. The heart now waits for the server. Which feels better?
5. **Invalidate by hand.** In the devtools, click "Invalidate" on `['toys']`. What happens on screen?
6. **A new mutation.** Write `useRemoveToy` (add a `deleteToy` function to the API) and make `invalidateQueries` update the shelf.

## ✅ Check yourself

<details>
<summary>1. What is the difference between server state and client state?</summary>

Server state is owned by the backend; you only hold a copy that can be old. Client state is owned by the browser app (cart, theme, UI). Use a query library for the first, and `useState`/`useReducer`/stores for the second.
</details>

<details>
<summary>2. What is a query key for?</summary>

It identifies the cached data. Components with the same key share it, and every variable the query depends on must be in the key.
</details>

<details>
<summary>3. What's the difference between <code>staleTime</code> and <code>gcTime</code>?</summary>

`staleTime`: how long data counts as fresh (no refetch needed). `gcTime`: how long *unused* data stays in memory before being deleted.
</details>

<details>
<summary>4. Why do we call <code>invalidateQueries</code> after a mutation?</summary>

The server data changed, so the cached copy is out of date. Invalidating marks it stale so active queries refetch and the UI shows the truth.
</details>

<details>
<summary>5. What are the three steps of an optimistic update?</summary>

`onMutate` (update the cache now and remember the old value), `onError` (roll back using the remembered value), `onSettled` (refetch to sync with the server).
</details>

## Recap

- Hand-written fetching misses cancelling, sharing, caching, retries and refetching. TanStack Query provides them.
- `useQuery({ queryKey, queryFn, staleTime })` reads; `useMutation` writes; `invalidateQueries` refreshes.
- `staleTime` = freshness; `gcTime` = how long unused data stays.
- Optimistic updates make the UI instant, with a rollback if the server says no.
- Server state belongs to the query library; client state belongs to React state or a store.

➡️ **Next:** [Lesson 16 – State management libraries: the shared notebook](16-state-management-libraries.md)
