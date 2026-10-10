# Lesson 14: Routing – The Signboard in the Hallway

> **Like I'm 5:** A router is the signboard in the hallway. The URL is the arrow on the sign, and the router shows the right room (component) for each arrow.

| | |
|---|---|
| **Concept reference** | [14 – Routing](../concepts/14-routing.md) |
| **You will learn** | Routes and pages, `Link` / `NavLink`, layout routes with `Outlet`, URL parameters, search parameters, navigating from code, protected routes, a catch-all "not found" page |
| **We build** | Separate pages: shop, toy details, cart & checkout, login, add-a-toy (login required), and a 404 page |
| **Time** | About 90 minutes |

## The story

Right now the whole shop is a single page. Customers can't share a link to a toy. The back button doesn't do anything useful. And the checkout is squeezed into a pop-up.

A real shop has **rooms**: the shelves, a toy's own page, the cart, the staff door. A **router** gives each room its own web address and shows the right component for the address in the browser.

```text
 /               → Shop (the shelves)
 /toys/t3        → The page for toy "t3"
 /cart           → Cart and checkout
 /login          → Grown-up login
 /add            → Add a toy (login required)
 /anything-else  → "This aisle doesn't exist"
```

## 1. Install the router

React doesn't include routing. The most popular library is **React Router**.

```bash
npm install react-router
```

> Package names and APIs have changed between React Router versions (for example, older versions used `react-router-dom`). This tutorial was written for the current version, where everything is in `react-router`. If you use a different version, check its docs.

## 2. The plan

We will reorganize the app:

```text
main.tsx            providers + <RouterProvider>
router.tsx          the map: URL → page
components/RootLayout.tsx   header + footer + <Outlet /> (where the page appears)
pages/
  HomePage.tsx      the shelves (the chosen category now lives in the URL!)
  ToyPage.tsx       /toys/:id
  CartPage.tsx      /cart (with checkout)
  LoginPage.tsx     /login
  AddToyPage.tsx    /add
  NotFoundPage.tsx  everything else
```

`App.tsx` is retired: its job is now split between `RootLayout` (the frame) and `HomePage` (the shelves).

Two data helpers go first, because several pages need the same information.

## 3. Share the toys with all pages

Until now `App` loaded the toys. Now several pages need them (home, toy page, add-toy). We put the toy list behind a context (Lesson 8) and a hook called `useToys()`:

📄 **`src/hooks/useToys.tsx`** (new file)

```tsx
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Toy } from '../types';
import { useFetch } from './useFetch';

type Status = 'loading' | 'error' | 'success';

interface ToysContextValue {
  toys: Toy[];
  status: Status;
  reload: () => void;
  addToy: (toy: Toy) => void;
}

const ToysContext = createContext<ToysContextValue | null>(null);
const NO_TOYS: Toy[] = [];

export function ToysProvider({ children }: { children: ReactNode }) {
  const { data, error, loading, reload } = useFetch<Toy[]>('/toys.json');
  // Toys the shopkeeper added in this visit (only kept in memory for now).
  const [addedToys, setAddedToys] = useState<Toy[]>([]);

  const catalogue = data ?? NO_TOYS;
  const status: Status = error ? 'error' : loading ? 'loading' : 'success';

  const value = useMemo<ToysContextValue>(
    () => ({
      toys: [...catalogue, ...addedToys],
      status,
      reload,
      addToy: toy => setAddedToys(prev => [...prev, toy]),
    }),
    [catalogue, addedToys, status, reload],
  );

  return <ToysContext.Provider value={value}>{children}</ToysContext.Provider>;
}

export function useToys() {
  const context = useContext(ToysContext);
  if (!context) throw new Error('useToys must be used inside <ToysProvider>');
  return context;
}
```

> Note the plan: pages will call `useToys()` and know nothing about *how* toys are loaded. In Lesson 15 we replace the inside of this file with a proper data library, and **the pages won't have to change**. That is the benefit of putting a hook in front of your data.

(`reload` comes from `useFetch`; it's a new function on every render, so `useMemo` will recompute the value on each render of the provider. The provider only renders when its own state changes, so this is fine here.)

## 4. A fake login

Adding toys is for shopkeepers. We pretend to have a login, remembered in the browser with the hook from Lesson 10.

📄 **`src/context/AuthContext.tsx`** (new file)

```tsx
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AuthContextValue {
  user: string | null;
  login: (name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<string | null>('user', null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: name => setUser(name),
      logout: () => setUser(null),
    }),
    [user, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
```

## 5. Protected routes

A **guard** is a component that either shows its children or sends the visitor somewhere else. `Navigate` redirects. We remember where the visitor wanted to go (`state={{ from: location }}`) so we can send them back after they log in.

📄 **`src/components/RequireAuth.tsx`** (new file)

```tsx
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // "replace" swaps the current history entry, so Back doesn't bounce.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
```

> **Important:** a guard in the browser is for **good manners**, not security. Anyone can open the dev tools and change it. The **server** must check permissions for real.

## 6. The frame: `RootLayout` and the `Outlet`

This is a **layout route**. It draws the parts every page shares (header, footer) and an **`<Outlet />`**, which marks the spot where the matched child page appears.

📄 **`src/components/RootLayout.tsx`** (new file)

```tsx
import { Outlet } from 'react-router';
import { Footer } from './Footer';
import { Header } from './Header';
import { PageLayout } from './PageLayout';
import { PageTitle } from './PageTitle';

export function RootLayout() {
  return (
    <PageLayout header={<Header title="Tiny Toy Shop" />} footer={<Footer />}>
      <PageTitle />
      {/* the page for the current URL appears here */}
      <Outlet />
    </PageLayout>
  );
}
```

The header gets real navigation. **Use `Link` and `NavLink`, not `<a href>`**, so that moving around does not reload the whole page. `NavLink` also knows when it points at the current page and marks it with `aria-current="page"`, which we style.

📄 **`src/components/Header.tsx`** (replace everything)

```tsx
import { NavLink } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { CartDropdown } from './CartDropdown';
import { ThemeToggle } from './ThemeToggle';
import './Header.css';

interface HeaderProps {
  title: string;
  tagline?: string;
}

export function Header({ title, tagline = 'Toys for tiny hands' }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="container header__inner">
        <div>
          <h1 className="header__title">🧸 {title}</h1>
          <p className="header__tagline">{tagline}</p>
        </div>

        <nav aria-label="Main" className="header__nav">
          <NavLink to="/" end>
            Shop
          </NavLink>
          <NavLink to="/add">Add a toy</NavLink>
          {user ? (
            <>
              <span>Hi, {user}</span>
              <button type="button" className="header__link-button" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <NavLink to="/login">Log in</NavLink>
          )}
        </nav>

        <div className="header__actions">
          <CartDropdown />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
```

📄 **`src/components/Header.css`** (add to the bottom)

```css
.header__nav {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.header__nav a,
.header__link-button {
  color: white;
  text-decoration: none;
  padding: var(--space-1) var(--space-2);
  border-radius: 999px;
}

.header__link-button {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

/* NavLink adds aria-current="page" to the link of the page you are on. */
.header__nav a[aria-current='page'] {
  background: rgba(255, 255, 255, 0.25);
  font-weight: 700;
}
```

## 7. The pages

### Helper: is this text a real category?

Query parameters in the URL (the `?category=plush` part) are just text, and anyone can type nonsense into the address bar. We check:

📄 **`src/lib/categories.ts`** (add to the bottom)

```ts

// Is this text one of our categories? Anyone can type anything in the address bar!
export function isCategory(value: string | null): value is Category {
  return value !== null && Object.hasOwn(categoryInfo, value);
}
```

### The shop page

This is the old `App`, with two changes:

- The **chosen category now lives in the URL** (`/?category=plush`) instead of in `useState`. That means the Back button works, and you can share a filtered view. We read it with `useSearchParams`.
- Toys come from `useToys()`.

> **Why only the category?** We tried to put the *search text* in the URL too, and it broke typing: when you type fast, letters get lost (`rainbow blocks` became `rnols`). The router updates the URL a moment *after* each key press, but a controlled input needs its value **right now**. The rule of thumb: **text that is being typed stays in `useState`; settled choices (a category, a tab, a page number) can live in the URL.**

📄 **`src/pages/HomePage.tsx`** (new file)

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
import { useToys } from '../hooks/useToys';
import { isCategory } from '../lib/categories';
import type { CategoryChoice, Toy } from '../types';
import './HomePage.css';

// Worked out once when the page loads, so "toy of the day" stays the same
// while you walk around the shop.
const luckySeed = Math.random();

export function HomePage() {
  const dispatch = useCartDispatch();
  const { toys, status, reload } = useToys();
  const searchRef = useRef<SearchBoxHandle>(null);

  // ── The text being typed stays in state ───────────────────────────
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  // ── The chosen category lives in the URL: /?category=plush ────────
  const [params, setParams] = useSearchParams();
  const categoryParam = params.get('category');
  const category: CategoryChoice = isCategory(categoryParam) ? categoryParam : 'all';

  function selectCategory(choice: CategoryChoice) {
    // Writing to the URL. "all" means no parameter at all.
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
          {status === 'loading' && <p>Opening the toy box… 📦</p>}

          {status === 'error' && (
            <div role="alert">
              <p>Oh no! The toy truck got lost on the way. 🚚💨</p>
              <Button onClick={reload}>Try again</Button>
            </div>
          )}

          {status === 'success' && <ToyList toys={visibleToys} onAdd={handleAdd} />}
        </Section>
      </SplitView>
    </>
  );
}
```

The home page keeps its old styles. Move `App.css` there, and delete the retired `App.tsx`:

```bash
mkdir -p src/pages
mv src/App.css src/pages/HomePage.css
rm src/App.tsx
```

### Cards link to the toy's own page

Each toy name becomes a link to `/toys/<id>`:

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
.toy-card__name a {
  color: inherit;
  text-decoration: none;
}

.toy-card__name a:hover {
  text-decoration: underline;
}
```

### The toy's own page: URL parameters

The route `/toys/:id` has a **parameter**. `:id` is a hole in the address. `useParams()` returns what filled it. When the visitor goes to `/toys/t3`, `id` is `"t3"`.

We split the page in two: `ToyPage` finds the toy; the inner `ToyView` shows it. The inner one gets `key={toy.id}`, which makes React build a **fresh** `ToyView` (with the quantity back at 1) when you move from one toy to another. That's the "reset with a key" trick from Lesson 6.

📄 **`src/pages/ToyPage.tsx`** (new file)

```tsx
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Button } from '../components/Button';
import { QuantityPicker } from '../components/QuantityPicker';
import { ToyDetails } from '../components/ToyDetails';
import { useCartDispatch } from '../context/CartContext';
import { useToys } from '../hooks/useToys';
import type { Toy } from '../types';
import './ToyPage.css';

export function ToyPage() {
  const { id } = useParams(); // from the "/toys/:id" in the URL
  const { toys, status } = useToys();

  if (status === 'loading') return <p>Opening the toy box… 📦</p>;
  if (status === 'error') return <p role="alert">Could not load the toys.</p>;

  const toy = toys.find(t => t.id === id);
  if (!toy) {
    return (
      <div>
        <h2>Hmm, we can't find that toy 🔍</h2>
        <Link to="/">Back to the shop</Link>
      </div>
    );
  }

  const index = toys.indexOf(toy);
  const next = toys[(index + 1) % toys.length];

  return (
    <div className="toy-page">
      <Link to="/">← Back to the shop</Link>
      {/* key: a different toy means a brand-new ToyView with a fresh quantity */}
      <ToyView key={toy.id} toy={toy} />
      <p>
        <Link to={`/toys/${next.id}`}>Next toy: {next.emoji} {next.name} →</Link>
      </p>
    </div>
  );
}

function ToyView({ toy }: { toy: Toy }) {
  const dispatch = useCartDispatch();
  const [qty, setQty] = useState(1);

  return (
    <article>
      <h2>{toy.name}</h2>
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

📄 **`src/pages/ToyPage.css`** (new file)

```css
.toy-page {
  margin-top: var(--space-4);
  max-width: 36rem;
}

.toy-page a {
  color: var(--color-link);
}

.toy-page__buy {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.toy-page__buy .qty {
  margin-bottom: 0;
}
```

### The cart page and checkout

The checkout form moves from a pop-up to this page. Because *clearing the cart* would also make the form disappear (the cart becomes empty!), the page itself remembers "an order was placed". `CheckoutForm` is simplified: it just calls `onPlaced(name)`.

📄 **`src/components/CheckoutForm.tsx`** (replace everything)

```tsx
import { cartCount, cartTotal } from '../context/cartReducer';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/formatPrice';
import { Button } from './Button';
import { Field } from './Field';
import { TextInput } from './TextInput';

export function CheckoutForm({ onPlaced }: { onPlaced: (name: string) => void }) {
  const items = useCart();
  const count = cartCount(items);

  // React 19 calls this with the form's data when the visitor submits.
  function placeOrder(formData: FormData) {
    onPlaced(String(formData.get('name') ?? ''));
  }

  return (
    <form action={placeOrder}>
      <p>
        You are buying {count} {count === 1 ? 'toy' : 'toys'} for{' '}
        <strong>{formatPrice(cartTotal(items))}</strong>.
      </p>

      <Field label="Your name">
        {a11y => <TextInput {...a11y} name="name" required autoComplete="name" />}
      </Field>

      <Field label="Delivery address">
        {a11y => (
          <TextInput {...a11y} name="address" required autoComplete="street-address" />
        )}
      </Field>

      <label className="form-check">
        <input type="checkbox" name="gift" />
        This is a gift 🎁
      </label>

      <div className="form-actions">
        <Button type="submit">Place order</Button>
      </div>
    </form>
  );
}
```

📄 **`src/pages/CartPage.tsx`** (new file)

```tsx
import { useState } from 'react';
import { Link } from 'react-router';
import { CheckoutForm } from '../components/CheckoutForm';
import { QuantityPicker } from '../components/QuantityPicker';
import { Section } from '../components/Section';
import { cartTotal } from '../context/cartReducer';
import { useCart, useCartDispatch } from '../context/CartContext';
import { formatPrice } from '../lib/formatPrice';
import './CartPage.css';

export function CartPage() {
  const items = useCart();
  const dispatch = useCartDispatch();
  const [thanksName, setThanksName] = useState<string | null>(null);

  function handleOrder(name: string) {
    dispatch({ type: 'cleared' });
    setThanksName(name);
  }

  if (thanksName !== null) {
    return (
      <Section title="Order placed 🎉">
        <p>
          Thank you, <strong>{thanksName}</strong>! Your toys are on their way.
        </p>
        <Link to="/">Back to the shop</Link>
      </Section>
    );
  }

  if (items.length === 0) {
    return (
      <Section title="Your cart">
        <p>Your cart is empty. Go find a toy! 🧸</p>
        <Link to="/">Back to the shop</Link>
      </Section>
    );
  }

  return (
    <Section title="Your cart">
      <ul className="cart-page__list">
        {items.map(item => (
          <li key={item.toyId} className="cart-page__row">
            <span>
              {item.emoji} {item.name}
            </span>
            <QuantityPicker
              qty={item.qty}
              onChange={qty => dispatch({ type: 'quantityChanged', toyId: item.toyId, qty })}
            />
            <span>{formatPrice(item.price * item.qty)}</span>
            <button
              type="button"
              className="cart-page__remove"
              aria-label={`Remove ${item.name}`}
              onClick={() => dispatch({ type: 'removed', toyId: item.toyId })}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <p className="cart-page__total">
        Total: <strong>{formatPrice(cartTotal(items))}</strong>
      </p>

      <h3>Checkout</h3>
      <CheckoutForm onPlaced={handleOrder} />
    </Section>
  );
}
```

📄 **`src/pages/CartPage.css`** (new file)

```css
.cart-page__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.cart-page__row {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
}

.cart-page__row .qty {
  margin-bottom: 0;
}

.cart-page__remove {
  background: transparent;
  border: 0;
  color: var(--color-danger-text);
}

.cart-page__total {
  text-align: right;
  font-size: 1.2rem;
}
```

The little cart drop-down in the header becomes a quick peek, with a link to the full page instead of its own checkout pop-up:

📄 **`src/components/CartDropdown.tsx`** (replace everything)

```tsx
import { useRef, useState } from 'react';
import { Link } from 'react-router';
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
              <div className="cart__confirm-buttons">
                <Link to="/cart" className="cart__link" onClick={() => setOpen(false)}>
                  Go to checkout →
                </Link>
                <DangerButton onClick={() => setConfirmOpen(true)}>Clear cart</DangerButton>
              </div>
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

📄 **`src/components/CartDropdown.css`** (add to the bottom)

```css
.cart__link {
  align-self: center;
  color: var(--color-link);
  font-weight: 600;
}
```

### Add a toy, login, and "not found"

`useNavigate()` gives a function for going somewhere from code, for example after a form succeeds.

📄 **`src/pages/AddToyPage.tsx`** (new file)

```tsx
import { useNavigate } from 'react-router';
import { AddToyForm } from '../components/AddToyForm';
import { Section } from '../components/Section';
import { useToys } from '../hooks/useToys';

export function AddToyPage() {
  const { addToy } = useToys();
  const navigate = useNavigate();

  return (
    <Section title="Add a toy">
      <AddToyForm
        onAdd={toy => {
          addToy(toy);
          navigate('/'); // go back to the shelves to see it
        }}
      />
    </Section>
  );
}
```

The login page sends the visitor back to where they wanted to go (`from`), or to the shop:

📄 **`src/pages/LoginPage.tsx`** (new file)

```tsx
import { useLocation, useNavigate } from 'react-router';
import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { Section } from '../components/Section';
import { TextInput } from '../components/TextInput';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // RequireAuth stored the page the visitor wanted in location.state.
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';

  function handleLogin(formData: FormData) {
    const name = String(formData.get('name') ?? '').trim();
    if (!name) return;
    login(name);
    navigate(from, { replace: true });
  }

  return (
    <Section title="Grown-up login">
      <p>Only shopkeepers can add toys. Type your name to come in. (This is a pretend login!)</p>
      <form action={handleLogin}>
        <Field label="Your name">
          {a11y => <TextInput {...a11y} name="name" required autoComplete="username" />}
        </Field>
        <Button type="submit">Log in</Button>
      </form>
    </Section>
  );
}
```

📄 **`src/pages/NotFoundPage.tsx`** (new file)

```tsx
import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
      <p style={{ fontSize: '4rem', margin: 0 }}>🙈</p>
      <h2>This aisle doesn't exist</h2>
      <Link to="/">Back to the shop</Link>
    </div>
  );
}
```

## 8. The map: `router.tsx`

All routes in one place. `children` are drawn inside the parent's `<Outlet />`. `index: true` means "the page for the parent's own URL". `*` matches anything not matched above.

📄 **`src/router.tsx`** (new file)

```tsx
import { createBrowserRouter } from 'react-router';
import { RequireAuth } from './components/RequireAuth';
import { RootLayout } from './components/RootLayout';
import { AddToyPage } from './pages/AddToyPage';
import { CartPage } from './pages/CartPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ToyPage } from './pages/ToyPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'toys/:id', element: <ToyPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'login', element: <LoginPage /> },
      {
        path: 'add',
        element: (
          <RequireAuth>
            <AddToyPage />
          </RequireAuth>
        ),
      },
      { path: '*', element: <NotFoundPage /> }, // catch-all
    ],
  },
]);
```

Finally, `main.tsx` plugs in the new providers and starts the router. `RouterProvider` comes from `react-router/dom`, the browser version.

📄 **`src/main.tsx`** (replace everything)

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToysProvider } from './hooks/useToys';
import { router } from './router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ToysProvider>
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </ToysProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
```

Run the shop and try it:

1. Click a toy's name. The address bar changes to `/toys/t3` and the toy page opens. Press the browser's **Back** button.
2. Click **Plush** on the shelves. Look at the address: `/?category=plush`. Click **Blocks**, then press the browser's **Back** button: you are back on Plush. Reload: the filter is still there! Copy the link into a new tab.
3. Click **Add a toy**. You're sent to **Log in** (you're not a shopkeeper yet). Type a name. You land on the add form. 
4. Open `/some/nonsense`: the 404 page.
5. Add toys to the cart and click **Go to checkout →**.

## 9. What just happened?

### How a URL becomes a page

```text
 browser address /toys/t3
        │
        ▼
 router.tsx: matches "toys/:id"   (inside the "/" route)
        │
        ▼
 <RootLayout>          ← the parent route's element
    …header…
    <Outlet />  ──►  <ToyPage />   ← the child route's element
    …footer…
```

- **Nested routes** are drawn inside their parent's `<Outlet />`. The header and footer are built once and stay while the page changes.
- **`Link`/`NavLink`** change the URL without reloading the page. A plain `<a href>` would reload the whole app and lose all state.
- **`useParams()`** reads `:id`. **`useSearchParams()`** reads and writes the part after the `?`, like `?category=plush`.
- **`useNavigate()`** moves from code. `navigate('/login', { replace: true })` swaps the current history entry instead of adding one.
- **`Navigate`** (the component) redirects while drawing, as in `RequireAuth`.

### State in the URL

Anything that a visitor might want to **share, bookmark, or reach with the Back button** (the chosen category, the current tab, the page number) is better in the URL than in `useState`. Things like "is this pop-up open" are not worth putting in the URL.

But remember the warning from the home page: **text that is being typed is different.** It must stay in `useState` so the input always shows the latest letters at once. If you want a search link to be shareable, keep the typed text in state and copy it to the URL *after a pause* (a debounce).

### Why we need a "fall back to index.html" setting later

Our server must answer `/toys/t3` with the same `index.html` as `/`, and let the router decide what to show. The dev server and `vite preview` do that. A real web host needs a rule for it (Lesson 23).

### Loaders: data before the page

Modern routers can load data **before** showing a page, so you don't see a spinner in the middle. You attach a `loader` function to a route and read its result with `useLoaderData()`:

```tsx
{
  path: 'toys/:id',
  loader: ({ params }) => fetchToy(params.id!),
  element: <ToyPage />,
}
```

We won't use loaders. In the next lesson a data library gives us caching and loading states in a different way, and the two approaches can be combined later.

### Good habits

- Keep route definitions in **one place** (or one per feature in a big app).
- **Lazy load** big pages (Lesson 17).
- Always have a **catch-all** route for the not-found page.
- Route guards are for UX; the **server** enforces access.

## 🧪 Try it yourself

1. **Case-sensitive?** Visit `/Cart` (capital C). Is it found?
2. **Bad parameter.** Visit `/toys/nope`. Which branch of `ToyPage` shows? What if you also click "Next toy →" on a good toy page? Does the quantity reset to 1? (Remove the `key` to see the difference.)
3. **Bad query text.** Visit `/?category=hacker`. What does `isCategory` do for you?
4. **Redirect memory.** Log out, click **Add a toy**, log in. Why did you end up on the add form and not on the shop?
5. **Add a new page.** Create an "About" page at `/about` and a `NavLink` to it. You need to touch two files.
6. **Active link styling.** `NavLink` can take `className={({ isActive }) => …}`. Use it to make the active link orange instead of the translucent white.

## ✅ Check yourself

<details>
<summary>1. What's the difference between <code>&lt;a href&gt;</code> and <code>&lt;Link&gt;</code>?</summary>

`<a href>` makes the browser load a new page (the whole app restarts, state is lost). `<Link>` changes the URL and tells the router to show the new route, with no page reload.
</details>

<details>
<summary>2. What does <code>&lt;Outlet /&gt;</code> do?</summary>

It marks the place in a parent (layout) route where the matching child route's element is drawn.
</details>

<details>
<summary>3. How do you read <code>t3</code> from the address <code>/toys/t3</code>?</summary>

Define the route as `toys/:id` and call `const { id } = useParams()`.
</details>

<details>
<summary>4. Why is a client-side route guard not real security?</summary>

Everything in the browser can be changed by the user. The server must check permissions for every request.
</details>

<details>
<summary>5. When should state live in the URL instead of <code>useState</code>?</summary>

When a person might want to bookmark, share or reload that state, or use the Back button with it (filters, selected tab, page number).
</details>

## Recap

- A router maps URLs to components. `createBrowserRouter` + `RouterProvider` set it up.
- Nested routes draw into the parent's `<Outlet />`; `index` and `*` routes cover the home and not-found cases.
- Use `Link` / `NavLink` to move around. `useParams`, `useSearchParams`, `useNavigate`, `Navigate` and `useLocation` read and change the location.
- Protect pages with a guard component, but enforce real access on the server.
- Keep shareable state (filters) in the URL.
- A hook like `useToys()` hides *how* data is loaded from pages.

➡️ **Next:** [Lesson 15 – Data fetching and caching: the fridge and the shop](15-data-fetching-and-caching.md)
