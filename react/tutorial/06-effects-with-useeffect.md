# Lesson 6: Effects – Talking to the World Outside React

> **Like I'm 5:** An effect is a note you leave for a helper outside the room: "when the door opens, ring the bell; when the door closes, turn the bell off." The helper runs the note after the room is drawn.

| | |
|---|---|
| **Concept reference** | [05 – Effects with `useEffect`](../concepts/05-effects-useeffect.md) |
| **You will learn** | What an effect is, the dependency array, cleanup, fetching data safely with `AbortController`, `StrictMode`'s double run, and when you do **not** need an effect |
| **We build** | A page title that shows the cart, a flash-sale countdown, a footer that knows the window size, and toys loaded from a (pretend) server |
| **Time** | About 60 minutes |

## The story

Our toy list is baked into the app. A real shop loads its toys from a server. Also, we'd like the browser tab to say "(3) Tiny Toy Shop" when the cart has items, and a countdown for a flash sale.

None of these is "draw something from props and state". They are about **things outside React**: the browser tab, a clock, the window, the network. React calls those **side effects**. We keep them out of the drawing code and put them in `useEffect`.

## 1. What is an effect?

Drawing a component must be **pure**: same props and state in, same picture out, no surprises. But the real world is messy. So React lets you say:

> "After you've drawn the screen, please run this code."

```tsx
useEffect(() => {
  // runs AFTER the screen is drawn
  return () => {
    // (optional) clean up before the next run, and when the component goes away
  };
}, [dependency1, dependency2]);   // when should it run again?
```

The three parts:

1. **The note** (the function): what to do.
2. **The cleanup** (the function you return): how to undo it. Turn the bell off.
3. **The dependency array**: the list of values the note uses. React runs the note again when one of them changed.

| Dependency array | When the effect runs |
|------------------|----------------------|
| *(none)* `useEffect(fn)` | After **every** render |
| `[]` | **Once**, after the first render |
| `[a, b]` | After the first render, and again whenever `a` or `b` changed |

## 2. Turn on the safety net (lint)

It's easy to forget a value in the list. Our linter can warn us. Replace the lint settings file:

📄 **`.oxlintrc.json`** (replace everything)

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "rules": {
    "react/rules-of-hooks": "error",
    "react/exhaustive-deps": "warn",
    "react/only-export-components": "off"
  }
}
```

- `react/rules-of-hooks` was already on. It makes sure hooks are called correctly.
- `react/exhaustive-deps` is new: it warns when an effect uses a value that is not in its dependency list.
- We turn off `only-export-components`, because from now on some files will export a component *and* a hook next to each other (good for sharing, only mildly annoying for hot reload).

Run `npm run lint` any time. **Fix warnings; don't silence them.**

## 3. Effect #1: the browser tab title

When the cart changes, the tab title should change. The browser tab is outside React, so this is a job for an effect.

We'll add this inside `App` soon. Read it first:

```tsx
useEffect(() => {
  document.title = cartCount > 0 ? `(${cartCount}) Tiny Toy Shop` : 'Tiny Toy Shop';
}, [cartCount]);   // run again only when cartCount changes
```

## 4. Effect #2: a flash-sale countdown with cleanup

A countdown needs a timer. A timer is something we **start** and must **stop**; otherwise it keeps ticking after the banner is gone. That's the cleanup's job.

📄 **`src/components/SaleBanner.tsx`** (new file)

```tsx
import { useEffect, useState } from 'react';
import './SaleBanner.css';

const SALE_SECONDS = 60;

export function SaleBanner() {
  const [secondsLeft, setSecondsLeft] = useState(SALE_SECONDS);

  useEffect(() => {
    console.log('⏰ timer started');
    const id = setInterval(() => {
      setSecondsLeft(s => Math.max(0, s - 1));
    }, 1000);

    // Cleanup: runs when the banner disappears (or before the effect runs again).
    return () => {
      console.log('🛑 timer stopped');
      clearInterval(id);
    };
  }, []); // [] = start once, when the banner first appears

  if (secondsLeft === 0) {
    return <p className="sale-banner">The flash sale is over. See you next time!</p>;
  }

  return (
    <p className="sale-banner">
      🔥 Flash sale! Ends in <strong>{secondsLeft}s</strong>
    </p>
  );
}
```

📄 **`src/components/SaleBanner.css`** (new file)

```css
.sale-banner {
  margin: var(--space-3) 0 0;
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  border: 2px dashed var(--color-brand);
  border-radius: var(--radius);
  text-align: center;
}
```

Two details:

- We use `setSecondsLeft(s => s - 1)` (the "previous value" form) because the interval was created once and would otherwise remember an old number.
- The effect needs nothing from outside, so its list is `[]`.

## 5. Effect #3: the footer knows the window size

A listener on `window` must be removed when we're done, too.

📄 **`src/components/Footer.tsx`** (new file)

```tsx
import { useEffect, useState } from 'react';
import './Footer.css';

const year = new Date().getFullYear();

export function Footer() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize); // cleanup
  }, []);

  return (
    <footer className="footer">
      <div className="container">
        © {year} Tiny Toy Shop · Your window is {width}px wide
      </div>
    </footer>
  );
}
```

📄 **`src/components/Footer.css`** (new file)

```css
.footer {
  margin-top: var(--space-5);
  padding: var(--space-3) 0;
  border-top: 1px solid var(--color-border);
  color: var(--color-muted);
  font-size: 0.9rem;
}
```

## 6. Effect #4: load the toys from a "server"

Real shops get their toys from a server. We don't have one, so we'll pretend: any file in the `public/` folder is served as it is. If we put `toys.json` there, we can ask for `/toys.json` exactly like a real web address.

Move the file and delete the old importer (we don't import the toys directly any more):

```bash
mv src/data/toys.json public/toys.json
rm src/data/toys.ts
rmdir src/data
```

> On Windows, drag `toys.json` from `src/data` to `public` in your editor, then delete `src/data`.

Now `App` fetches the file in an effect. It has to deal with **three moods** of a request:

```text
  loading ──► success   (show the toys)
     │
     └─────► error      (show a message + "Try again")
```

The rules for fetching in an effect:

1. Keep the result **and** the status (loading / error / success) in state.
2. Pass an `AbortController`'s `signal` to `fetch`, and call `controller.abort()` in the cleanup. That cancels old requests, so a slow old answer can never overwrite a newer one (a *race condition*).
3. Ignore the `AbortError` that cancelling causes: it's not a real error.
4. For "Try again", change a value the effect depends on (`attempt`) so the effect runs again.

📄 **`src/App.tsx`** (replace everything)

```tsx
import { useEffect, useState } from 'react';
import { CategoryFilter } from './components/CategoryFilter';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { SaleBanner } from './components/SaleBanner';
import { SearchBox } from './components/SearchBox';
import { Section } from './components/Section';
import { ToyList } from './components/ToyList';
import type { CartItem, CategoryChoice, Toy } from './types';
import './App.css';

type Status = 'loading' | 'error' | 'success';

export default function App() {
  // ── State ─────────────────────────────────────────────────────────
  const [toys, setToys] = useState<Toy[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [attempt, setAttempt] = useState(0); // bumped by "Try again"
  const [category, setCategory] = useState<CategoryChoice>('all');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [luckySeed] = useState(() => Math.random());

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
  // Load the toys. Runs once at the start, and again when "attempt" changes.
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
        // Cancelling on purpose is not a real problem.
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setStatus('error');
      });

    return () => controller.abort(); // cleanup: cancel the request if we're done with it
  }, [attempt]);

  // Keep the browser tab title in step with the cart.
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

        <Section title={status === 'success' ? `Our toys (${visibleToys.length})` : 'Our toys'}>
          <div className="toolbar">
            <SearchBox value={query} onChange={setQuery} />
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

Open the page. You'll see "Opening the toy box…" for a blink and then the toys. The tab title changes when you add something. The sale banner counts down. Resize the window and watch the footer.

## 7. What just happened?

### Effects run *after* drawing

React draws first, shows the page, and *then* runs your effects. That's why the page doesn't freeze while a request is in flight.

### The dependency array decides *when*

- `[attempt]` on the fetch effect: run at the start, and every time `attempt` goes up. Pressing "Try again" changes `attempt`, which re-runs the fetch. No other code needed.
- `[cartCount]` on the title effect: only touches `document.title` when the count actually changed.
- `[]` on the timer and the listener: they only need to be set up once.

**List every value from the component that the effect reads.** The lint rule checks this for you. Try removing `cartCount` from the title effect's list, run `npm run lint`, and read the warning.

### Cleanup runs "before the next run" and "on the way out"

```text
 mount:      effect runs
 re-run:     cleanup of the old effect → effect runs again with new values
 unmount:    cleanup runs one last time
```

That's how timers and listeners stay tidy. Forgetting a cleanup means a timer keeps ticking in a component nobody can see: a **leak**.

### What is `StrictMode` doing to my effects? (Look at the console)

Open the browser console (F12) while the dev server runs. You'll see:

```text
⏰ timer started
🛑 timer stopped
⏰ timer started
```

In development only, `StrictMode` **mounts, unmounts and mounts again** every component once. It's a free test: *"does your effect clean up properly?"* If your effect breaks when run twice, the cleanup is missing. In the production build this doesn't happen. Likewise you may see two `/toys.json` requests in the network tab during development; the first one is cancelled by the `AbortController`.

### You might not need an effect

Effects are for talking to the outside world. Beginners often use them for things React can do by itself. Here are three places to **not** use an effect:

1. **A value you can calculate** → calculate it while drawing. That's what `visibleToys` is. This would be a mistake:

   ```tsx
   // ❌ Extra state + extra render + risk of being out of date
   const [visible, setVisible] = useState<Toy[]>([]);
   useEffect(() => { setVisible(toys.filter(…)); }, [toys, query]);
   ```

2. **Reacting to a click or a typed letter** → put the logic in the event handler (`handleAdd`), not in an effect that watches state.
3. **Starting a component fresh when an input changes** → give it a `key`. `<Profile key={userId} />` throws away the old `Profile` (and all its state) and builds a new one when `userId` changes. No effect needed.

An effect *is* right for: the document title, timers, subscriptions, listeners, and (for now) fetching.

### About fetching in effects

What we wrote is correct, but it has a long wish-list we haven't built: caching, sharing one request between components, retries, refetching when you return to the tab. In Lesson 15 we replace this by a data library. For now it's the best way to learn what the library does for us.

## 🧪 Try it yourself

1. **Watch the timer cleanup.** Keep the console open. In `App.tsx`, temporarily wrap the banner with `{query === '' && <SaleBanner />}`. Type a letter in the search box: the banner disappears and you see "timer stopped". Delete the letter: it comes back and starts again at 60. Remove your change.
2. **Break the network.** In the browser dev tools "Network" tab choose "Offline" and press F5, or temporarily change `'/toys.json'` to `'/toys-missing.json'`. You should see the error message. Press **Try again** after fixing the name.
3. **Make a mistake on purpose.** Remove `[cartCount]` so it reads `}, []);` and run `npm run lint`. Read the warning, then fix it.
4. **Make a second timer.** What happens if you remove the `return () => clearInterval(id)`? Hint: look at the console while StrictMode double-runs the effect, and watch the countdown. It runs twice as fast!
5. **Add a "Back to top" button** that appears when `window.scrollY > 300`. You'll need a `scroll` listener with cleanup, and a piece of state.

## ✅ Check yourself

<details>
<summary>1. When does <code>useEffect(fn, [])</code> run?</summary>

Once, after the first render (and again in development because of `StrictMode`'s extra mount).
</details>

<details>
<summary>2. What is the cleanup function for?</summary>

To undo what the effect started (stop timers, remove listeners, cancel requests). It runs before the effect runs again and when the component is removed.
</details>

<details>
<summary>3. Why do we pass an <code>AbortController</code> signal to <code>fetch</code>?</summary>

So the cleanup can cancel an outdated request. Otherwise a slow old response could arrive after a newer one and overwrite it (a race condition).
</details>

<details>
<summary>4. Name two things you should <em>not</em> do with an effect.</summary>

Calculate a value that could be derived during render, and respond to a user click (that belongs in the event handler). Also: resetting state when a prop changes (use `key`).
</details>

<details>
<summary>5. Why does <code>StrictMode</code> run effects twice in development?</summary>

To reveal missing cleanups. If running the effect twice breaks something, the effect isn't properly undoing itself.
</details>

## Recap

- Effects synchronize React with the outside world: the document, timers, listeners, the network.
- The dependency array tells React when to re-run; list **every** value the effect reads (let the linter check).
- Return a cleanup function to undo what the effect started.
- Fetch with `AbortController`, and keep `loading` / `error` / `success` in state.
- `StrictMode` double-runs effects in development on purpose.
- Prefer deriving values, using event handlers and `key` over reaching for an effect.

➡️ **Next:** [Lesson 7 – Refs and the DOM: reaching out and touching](07-refs-and-the-dom.md)
