# Lesson 8: Context – The Cookie Jar in the Middle of the Room

> **Like I'm 5:** Prop drilling is passing a cookie down a long line of kids to reach the one at the end. Context is a cookie jar in the middle of the room that anyone can reach directly.

| | |
|---|---|
| **Concept reference** | [07 – Context & prop drilling](../concepts/07-context-and-prop-drilling.md) |
| **You will learn** | What prop drilling is, `createContext`, a Provider, `useContext`, a safe custom hook with a clear error, why a changing context re-renders all its readers |
| **We build** | A light / dark theme switch that any component can read |
| **Time** | About 45 minutes |

## The story

Kids love dark mode. The theme (light or dark) is needed in lots of places: the header, the cards, the footer, a pop-up. Passing `theme` as a prop through every brick would be tiring. Let's see why, and then fix it.

## 1. The problem: prop drilling

Imagine the theme lives in `App` but only the little toggle button deep inside the header needs it:

```tsx
<App theme="dark">
  <Layout theme="dark">
    <Header theme="dark">
      <ThemeToggle theme="dark" />   {/* only this one needs it */}
```

`Layout` and `Header` don't care about `theme`. They just **pass it along** like a hot potato. That's **prop drilling**. When you add one more value (say, the language) you must change every brick in the chain. It gets worse as the app grows.

## 2. The cure: context

Context has three parts. Think of the cookie jar:

| Part | Cookie-jar picture | Code |
|------|-------------------|------|
| **Create** the jar | Make an empty jar with a label | `createContext(...)` |
| **Provide** the cookies | Put the jar on a table and fill it | `<ThemeContext.Provider value={...}>` |
| **Use** the cookies | Any kid in the room reaches in | `useContext(ThemeContext)` |

Everything **inside** the Provider can read the value, however deep it is. React walks up the tree from the component to the nearest Provider.

## 3. Build the theme context

We keep context code in its own folder.

📄 **`src/context/ThemeContext.tsx`** (new file)

```tsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

// The jar. "null" means "nobody has filled it yet".
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  // The page's CSS lives outside React, so we tell it with an effect.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Same object as long as "theme" doesn't change (more on this below).
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggle: () => setTheme(current => (current === 'light' ? 'dark' : 'light')),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// A small helper hook so nobody calls useContext(ThemeContext) directly.
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return context;
}
```

Look at the three important choices:

1. The default is **`null`**, and `useTheme` throws a clear error when the jar is empty. A friendly message beats "cannot read property of undefined" later.
2. `useTheme()` returns a non-null value, so TypeScript users don't need `?.` everywhere.
3. React 19 also lets you write `<ThemeContext value={value}>` without `.Provider`. Both work.

Now put the Provider **around the whole app**, high in the tree, so everything below can read it:

📄 **`src/main.tsx`** (replace everything)

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
```

## 4. Use it: the toggle button

`ThemeToggle` reaches straight into the jar. It doesn't receive any theme props, and neither does the `Header` that contains it.

📄 **`src/components/ThemeToggle.tsx`** (new file)

```tsx
import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === 'light' ? 'dark' : 'light';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${next} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

📄 **`src/components/ThemeToggle.css`** (new file)

```css
.theme-toggle {
  width: 2.5rem;
  height: 2.5rem;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  font-size: 1.2rem;
}
```

Add the toggle to the header. The header's props don't change:

📄 **`src/components/Header.tsx`** (replace everything)

```tsx
import { formatPrice } from '../lib/formatPrice';
import { ThemeToggle } from './ThemeToggle';
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
        <div className="header__actions">
          <p className="header__cart" aria-live="polite">
            🛒 {cartCount} {cartCount === 1 ? 'item' : 'items'} · {formatPrice(cartTotal)}
          </p>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
```

📄 **`src/components/Header.css`** (add to the bottom)

```css
.header__actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
```

## 5. Teach the CSS what "dark" means

The provider sets `data-theme="dark"` on the `<html>` element. Our colours are all CSS variables (the design tokens from Lesson 1), so dark mode is just a second set of values:

📄 **`src/index.css`** (add to the bottom)

```css
/* Dark mode: same names, different colours. */
[data-theme='dark'] {
  color-scheme: dark;
  --color-bg: #1c1a22;
  --color-surface: #2a2733;
  --color-text: #f1eef6;
  --color-muted: #b9b2c7;
  --color-brand-soft: #4a2a1a;
  --color-brand-text: #ffb38a;
  --color-link: #74c0fc;
  --color-border: #433e51;
  --color-accent: #339af0;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}
```

Click the 🌙 button. The whole shop turns dark, and the sun button brings it back. Nothing in `ToyCard`, `Section` or `Footer` had to change, because they only use variables.

## 6. What just happened?

```text
main.tsx
 └─ <ThemeProvider>        ← fills the jar: { theme: 'light', toggle }
     └─ <App>
         └─ <Header>       ← didn't touch the theme
             └─ <ThemeToggle>  ← useTheme() reaches up and grabs it
```

1. `ThemeToggle` calls `useTheme()` → `useContext(ThemeContext)`.
2. React looks up the tree for the nearest `ThemeContext.Provider` and returns its `value`.
3. A click calls `toggle()` → `setTheme(...)` inside the provider → the provider re-renders with a new `theme`.
4. **Every component that reads this context re-renders** with the new value, and the effect updates the `<html data-theme>` attribute.

### The performance trap

When the context `value` changes, **every consumer re-renders**, even if it only uses one field of the value.

Worse, if you write the value like this:

```tsx
// ❌ A brand-new object on every render of the provider
<ThemeContext.Provider value={{ theme, toggle }}>
```

then every re-render of `ThemeProvider` creates a new object, and all consumers re-render even though `theme` didn't change. That's why we wrapped our value in `useMemo`. (Lesson 11 explains `useMemo` properly.)

Ways to keep contexts cheap:

- **Split contexts** by how often they change: one for rarely-changing things (theme, language, current user), one for busy things. In the next lesson we'll even split a cart into a "state" jar and an "actions" jar.
- **Memoize** the value object.
- **Keep state close** to where it's used. Not everything needs to be global.

### When to use context (and when not)

| Good for | Not so good for |
|----------|-----------------|
| Theme, language, current user, feature flags | Data that changes many times a second |
| Values read in many places, far apart | Big, busy state (use a store, Lesson 16) |
| Avoiding long prop chains | Server data (use a data library, Lesson 15) |

Context is also not always the answer to drilling. Sometimes **composition** is simpler: pass a ready-made component as `children` instead of drilling many props. See Lesson 12.

## 🧪 Try it yourself

1. **See the safety error.** In `main.tsx`, take `<ThemeProvider>` away (just wrap `<App />` alone). Read the red error: `useTheme must be used inside <ThemeProvider>`. Put it back.
2. **Read the theme somewhere else.** Make the `Footer` show `Current theme: …` using `useTheme()`. No new props needed!
3. **A third mode.** Add `'sepia'` to the `Theme` type. What does TypeScript tell you that you must handle? Make the toggle cycle through three themes.
4. **Count the re-renders.** Add `console.log('ThemeToggle drew')` to `ThemeToggle`. Type in the search box. It logs on every key press, even though the theme didn't change. Why? `App` re-renders (its `query` state changed), so `Header` re-renders, so `ThemeToggle` re-renders. That is normal React behaviour and has nothing to do with context. Lesson 11 shows how to skip re-renders that aren't needed.
5. **Nest a provider.** Providers can be nested; the nearest one wins. Think of one place where two different themes at once would make sense (a "preview" panel?).

## ✅ Check yourself

<details>
<summary>1. What is prop drilling?</summary>

Passing a prop through several layers of components that don't use it, just so a deep component can receive it.
</details>

<details>
<summary>2. What are the three steps of using context?</summary>

Create it (`createContext`), provide a value near the top (`<Context.Provider value>`), and read it anywhere below (`useContext`).
</details>

<details>
<summary>3. Why do we throw an error in <code>useTheme</code> when the context is <code>null</code>?</summary>

So a forgotten Provider produces a clear message right away, and so the hook can promise a non-null value to TypeScript.
</details>

<details>
<summary>4. What happens to components that read a context when its value changes?</summary>

All of them re-render, even if they use only a small part of the value. Memoize the value, split contexts, or keep state closer.
</details>

## Recap

- Prop drilling = passing props through bricks that don't need them.
- Context = a jar at the top of the tree that anyone below can read with `useContext`.
- Wrap access in a custom hook (`useTheme`) that throws when the Provider is missing.
- Changing a context value re-renders every reader: memoize the value and don't put busy state in it.
- Colours as CSS variables made dark mode a few lines of CSS.

➡️ **Next:** [Lesson 9 – Reducers: the rule book for the cart](09-reducers-with-usereducer.md)
