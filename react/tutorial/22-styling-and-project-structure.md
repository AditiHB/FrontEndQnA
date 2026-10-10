# Lesson 22: Styling and Project Structure – A Tidy Toy Room

> **Like I'm 5:** A good project is a well-organized toy room. Each toy has its own box, labelled by what it does, and the paint for each toy is kept with the toy.

| | |
|---|---|
| **Concept reference** | [22 – Styling & project structure](../concepts/22-styling-and-project-structure.md) |
| **You will learn** | The main ways to style React (plain CSS, CSS Modules, Tailwind, CSS-in-JS), design tokens, organizing a project by type or by feature, naming rules, and enforcing boundaries with lint |
| **We build** | `ToyCard` with a **CSS Module**, a new `features/cart` folder with its own public door, and a lint rule that keeps the doors honest |
| **Time** | About 75 minutes |

## The story

Our shop works, and has about 70 files. Finding things is starting to take a while ("where is the checkout code? in `components/`, `pages/`, `store/` or `api/`?"). And all our CSS class names live in **one shared global pool**, which is fine until two people name a class `.title`.

Time to tidy up: first the paint, then the boxes.

## 1. Four ways to style

| Approach | How it works | Trade-off |
|----------|--------------|-----------|
| **Plain / global CSS** | Normal stylesheets (what we've used) | Simple, but class names can clash |
| **CSS Modules** | `Button.module.css` → class names are made unique automatically | Good default, no runtime cost |
| **Tailwind CSS** | Small utility classes written right in the JSX | Fast to build, markup gets long |
| **CSS-in-JS** (styled-components, Emotion) | Styles written in JavaScript | Flexible and dynamic, but has a runtime cost and needs extra setup for server rendering |

There is no single right answer. The best choice is the one your team will use **consistently**.

### The problem with global CSS

```css
/* Cart.css */          .title { color: red; }
/* Toys.css */          .title { color: blue; }
```

Both files say `.title`. Whichever loads last wins, for **everyone**. We avoided this by writing long careful names (`toy-card__price`). A CSS Module makes the names safe by itself.

### CSS Modules in one minute

You name the file `Something.module.css` and import it as an object:

```tsx
import styles from './Button.module.css';

<button className={styles.primary}>Save</button>
```

At build time `.primary` is renamed to something unique like `_primary_x7k2q`, so it can never clash with another `.primary`. Vite supports this out of the box. TypeScript knows about `*.module.css` because of `vite/client` in our `tsconfig`.

### Tailwind and CSS-in-JS (a taste only)

We don't install them, so you can see the difference:

```tsx
// Tailwind: the style is written as small classes in the markup
<button className="rounded-full bg-orange-700 px-4 py-2 font-semibold text-white hover:brightness-110">
  Add to cart
</button>

// CSS-in-JS (styled-components style): the style is a tagged template in JavaScript
const AddButton = styled.button`
  border-radius: 999px;
  background: ${props => props.theme.brand};
`;
```

If you choose one of these later, follow its current install guide; the setup steps change often.

### Design tokens (what we already did right)

In Lesson 1 we put every colour and spacing value into CSS variables on `:root`, and in Lesson 8 dark mode just changed those variables. That is the idea of **design tokens**: components use `var(--color-brand)`, not `#c2410c`, so a redesign touches one file. Whatever styling approach you pick, keep tokens.

## 2. Move `ToyCard` to a CSS Module

`ToyCard` has the most CSS in the shop. We will rewrite its styles as a module. Class names become short, because nothing else can clash (`.card` instead of `.toy-card`, `.price` instead of `.toy-card__price`). A name that is more than one word uses camelCase (`soldOut`) so we can write `styles.soldOut`.

First, `ToyList` was quietly relying on a `.toy-grid` rule that lived in the card's stylesheet. Give it its own:

📄 **`src/components/ToyList.css`** (add to the bottom)

```css

.toy-grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-3);
}
```

Now delete the old stylesheet and create the module:

```bash
rm src/components/ToyCard.css
```

📄 **`src/components/ToyCard.module.css`** (new file)

```css
.card {
  position: relative;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: var(--space-3);
  text-align: center;
}

.badge {
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

/* Used together with .badge: this one is red and sits next to the heart. */
.soldOut {
  left: auto;
  right: 2.8rem;
  background: var(--color-danger);
  color: white;
}

.heart {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  background: transparent;
  border: 0;
  font-size: 1.4rem;
  line-height: 1;
  color: var(--color-danger-text);
}

.emoji {
  font-size: 3rem;
}

.name {
  margin: var(--space-2) 0 0;
  font-size: 1.05rem;
}

.name a {
  color: inherit;
  text-decoration: none;
}

.name a:hover {
  text-decoration: underline;
}

.price {
  margin: var(--space-1) 0 var(--space-3);
  color: var(--color-muted);
}

.actions {
  display: grid;
  gap: var(--space-2);
}

.button {
  background: var(--color-brand);
  color: white;
  border: 0;
  border-radius: 999px;
  padding: var(--space-2) var(--space-3);
  font-weight: 600;
}

.button:hover {
  filter: brightness(1.1);
}

.button:disabled {
  background: var(--color-border);
  color: var(--color-muted);
  cursor: not-allowed;
}
```

In the component, every `className="toy-card__something"` becomes `className={styles.something}`. To use two classes together (`badge` and `soldOut`) we join them with a template string. (Many teams use the tiny `clsx` package for this.)

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
import styles from './ToyCard.module.css';

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
    <article className={styles.card} ref={popIn}>
      {badge && <span className={styles.badge}>{badge}</span>}
      {!toy.inStock && <span className={`${styles.badge} ${styles.soldOut}`}>Sold out</span>}
      <button
        type="button"
        className={styles.heart}
        aria-pressed={Boolean(toy.favorite)}
        aria-label={
          toy.favorite ? `Remove ${toy.name} from favorites` : `Add ${toy.name} to favorites`
        }
        onClick={() => onToggleFavorite(toy)}
      >
        {toy.favorite ? '♥' : '♡'}
      </button>
      <div className={styles.emoji} aria-hidden="true">
        {toy.emoji}
      </div>
      <h3 className={styles.name}>
        <Link to={`/toys/${toy.id}`}>{toy.name}</Link>
      </h3>
      <CategoryBadge category={toy.category} />
      <p className={styles.price}>{formatPrice(toy.price)}</p>
      <QuantityPicker qty={qty} onChange={setQty} disabled={!toy.inStock} />
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.button}
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

Run the shop and look at a card with the dev tools (right-click → Inspect). The class is no longer `toy-card` but a unique name like `_card_1a2b3`. That's the module at work. The shop looks exactly the same. You can convert the other components one by one at your own pace; plain CSS files and CSS Modules happily live side by side.

> Our tests still pass because they find things by role and text, never by class name. Another reason for the advice in Lesson 21.

## 3. Folder structure: by type or by feature?

**By type** means folders named after *what a file is* (good for small apps):

```text
src/
├── components/   ← every component
├── hooks/
├── pages/
├── store/
├── api/
└── lib/
```

**By feature** means folders named after *what the file is for*, with everything that feature needs inside (good for growing apps):

```text
src/
├── features/
│   ├── cart/          ← everything about the cart
│   │   ├── CartPage.tsx
│   │   ├── CartDropdown.tsx
│   │   ├── CheckoutForm.tsx
│   │   ├── cartStore.ts
│   │   ├── cartStore.test.ts
│   │   └── index.ts   ← the feature's public door
│   └── toys/
├── shared/            ← used by many features (buttons, inputs, helpers)
└── app/               ← providers, routes, entry
```

The rule of thumb: **start simple** (by type). Move to features when it gets hard to find things or when a change in one feature makes you open five folders. Let's turn the **cart** into a feature, as a rehearsal.

### Move the files

The cart is spread over six folders. Gather it:

```bash
mkdir -p src/features/cart
mv src/store/cartStore.ts src/store/cartStore.test.ts src/features/cart/
mv src/components/CartDropdown.tsx src/components/CartDropdown.css src/features/cart/
mv src/components/CheckoutForm.tsx src/features/cart/
mv src/pages/CartPage.tsx src/pages/CartPage.css src/pages/CartPage.test.tsx src/features/cart/
mv src/api/ordersApi.ts src/features/cart/
rm -r src/store
```

(The last line deletes `src/store/`, which now only holds the Redux comparison file from Lesson 16. It served its purpose.)

> **In VS Code**, you can drag files in the Explorer instead. When it asks *"Update imports for moved file?"*, answer **Yes** and the editor fixes almost every import for you. The edits below show what the imports should end up as, so you can check (or type them yourself). The editor may sort the lines differently, which is fine.

### Fix the imports inside the moved files

Files moved two levels deeper, so `'../lib/...'` becomes `'../../lib/...'`, and neighbours became `'./...'`.

📄 **`src/features/cart/cartStore.ts`** (edit these lines)

```diff
-import type { CartItem, Toy } from '../types';
+import type { CartItem, Toy } from '../../types';
```

📄 **`src/features/cart/cartStore.test.ts`** (edit these lines)

```diff
-import { testToys } from '../test/server';
+import { testToys } from '../../test/server';
```

📄 **`src/features/cart/CartDropdown.tsx`** (edit these lines)

```diff
-import { useOnClickOutside } from '../hooks/useOnClickOutside';
-import { formatPrice } from '../lib/formatPrice';
-import { selectCount, selectTotal, useCartStore } from '../store/cartStore';
-import { Button, DangerButton } from './Button';
-import { Modal } from './Modal';
-import { QuantityPicker } from './QuantityPicker';
+import { Button, DangerButton } from '../../components/Button';
+import { Modal } from '../../components/Modal';
+import { QuantityPicker } from '../../components/QuantityPicker';
+import { useOnClickOutside } from '../../hooks/useOnClickOutside';
+import { formatPrice } from '../../lib/formatPrice';
+import { selectCount, selectTotal, useCartStore } from './cartStore';
 import './CartDropdown.css';
```

📄 **`src/features/cart/CartPage.tsx`** (edit these lines)

```diff
-import { CheckoutForm } from '../components/CheckoutForm';
-import { QuantityPicker } from '../components/QuantityPicker';
-import { Section } from '../components/Section';
-import { formatPrice } from '../lib/formatPrice';
-import { selectTotal, useCartStore } from '../store/cartStore';
+import { QuantityPicker } from '../../components/QuantityPicker';
+import { Section } from '../../components/Section';
+import { formatPrice } from '../../lib/formatPrice';
+import { CheckoutForm } from './CheckoutForm';
+import { selectTotal, useCartStore } from './cartStore';
 import './CartPage.css';
```

📄 **`src/features/cart/CartPage.test.tsx`** (edit these lines)

```diff
-import { useCartStore } from '../store/cartStore';
-import { testToys } from '../test/server';
-import { renderWithProviders } from '../test/utils';
+import { testToys } from '../../test/server';
+import { renderWithProviders } from '../../test/utils';
 import { CartPage } from './CartPage';
+import { useCartStore } from './cartStore';
```

📄 **`src/features/cart/CheckoutForm.tsx`** (edit these lines)

```diff
-import { submitOrder } from '../api/ordersApi';
-import { formatPrice } from '../lib/formatPrice';
-import { selectCount, selectTotal, useCartStore } from '../store/cartStore';
-import { Field } from './Field';
-import { SubmitButton } from './SubmitButton';
-import { TextInput } from './TextInput';
+import { Field } from '../../components/Field';
+import { SubmitButton } from '../../components/SubmitButton';
+import { TextInput } from '../../components/TextInput';
+import { formatPrice } from '../../lib/formatPrice';
+import { selectCount, selectTotal, useCartStore } from './cartStore';
+import { submitOrder } from './ordersApi';
```

### The feature's public door: `index.ts`

Other parts of the app should not reach into the cart's insides. The feature offers a short list of things it is happy to share:

📄 **`src/features/cart/index.ts`** (new file)

```ts
import { lazy } from 'react';

// The cart's public door: the only file other folders should import from.
export { CartDropdown } from './CartDropdown';
export { selectCount, selectTotal, useCartStore } from './cartStore';

// The cart page is only downloaded when somebody visits it (Lesson 17).
// The feature decides this itself, so nobody else has to remember to lazy-load it.
export const CartPage = lazy(() =>
  import('./CartPage').then(module => ({ default: module.CartPage })),
);
```

> **Why is `lazy` inside `index.ts`?** In Lesson 17 the router lazy-loaded the cart page. If the router now wrote `import('./features/cart')`, the build would warn that the dynamic import *"will not move the module into another chunk"*. The reason: the header, the home page and others import the same `index.ts` the normal way, so its code has to be in the main file anyway. A lazy import only splits code that **nobody else imports directly**. Because `CartPage.tsx` is now reached **only** through `lazy(() => import('./CartPage'))`, it (and the checkout form) get their own downloadable chunk. Whenever you add an `index.ts` "door" to a folder, watch the build output for this warning.

Everything not listed here (`CheckoutForm`, `ordersApi`, …) is a private detail we may change freely without breaking anyone.

### Fix the imports that point *at* the cart

Everyone outside now imports from `features/cart`:

📄 **`src/components/Header.tsx`** (edit these lines)

```diff
 import { useAuth } from '../context/AuthContext';
-import { CartDropdown } from './CartDropdown';
+import { CartDropdown } from '../features/cart';
 import { ThemeToggle } from './ThemeToggle';
```

📄 **`src/pages/HomePage.tsx`** (edit these lines)

```diff
-import { useCartStore } from '../store/cartStore';
+import { useCartStore } from '../features/cart';
```

📄 **`src/pages/ToyPage.tsx`** (edit these lines)

```diff
-import { useCartStore } from '../store/cartStore';
+import { useCartStore } from '../features/cart';
```

📄 **`src/components/PageTitle.tsx`** (edit these lines)

```diff
-import { selectCount, useCartStore } from '../store/cartStore';
+import { selectCount, useCartStore } from '../features/cart';
```

📄 **`src/pages/HomePage.test.tsx`** (edit these lines)

```diff
-import { useCartStore } from '../store/cartStore';
+import { useCartStore } from '../features/cart';
```

📄 **`src/test/setup.ts`** (edit these lines)

```diff
-import { useCartStore } from '../store/cartStore';
+import { useCartStore } from '../features/cart';
```

📄 **`src/router.tsx`** (edit these lines)

```diff
 import { RootLayout } from './components/RootLayout';
+import { CartPage } from './features/cart';
 import { HomePage } from './pages/HomePage';
@@
-const CartPage = lazy(() =>
-  import('./pages/CartPage').then(module => ({ default: module.CartPage })),
-);
 const WarehousePage = lazy(() =>
```

The router no longer needs to lazy-load the cart itself: it just imports `CartPage` from the feature (which is already lazy). The `<Suspense>` we put in `RootLayout` in Lesson 17 shows "Loading page…" while it downloads.

## 4. Let the computer guard the doors

Rules in a document get forgotten. Rules in the linter don't. This one says: *"Nobody may import from inside a feature's folder. Use its `index.ts`."*

📄 **`.oxlintrc.json`** (replace everything)

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "rules": {
    "react/rules-of-hooks": "error",
    "react/exhaustive-deps": "warn",
    "react/only-export-components": "off",
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["**/features/*/*"],
            "message": "Import from the feature's index.ts, not from its inner files."
          }
        ]
      }
    ]
  }
}
```

The pattern `**/features/*/*` matches a path with **two** parts after `features` (`features/cart/cartStore`) but not one (`features/cart`).

Now prove everything still works:

```bash
npm run lint
npm test
npm run build
```

All green. Then try to cheat: in `HomePage.tsx` change the import to `'../features/cart/cartStore'` and run `npm run lint`. You get:

```text
'../features/cart/cartStore' import is restricted from being used by a pattern.
help: Import from the feature's index.ts, not from its inner files.
```

Change it back.

## 5. What just happened?

- **Styling:** `ToyCard` now has private class names. The rest of the shop didn't notice.
- **Structure:** all the cart's code lives in one folder. A change to the checkout touches one place. Deleting the feature means deleting one folder.
- **A public API per feature:** `index.ts` is a door with a sign. Everything else stays private, so features can change their insides without breaking each other.
- **Lint as a guard rail:** boundaries are enforced automatically in the editor and in CI.

### Naming habits

- Components: `PascalCase.tsx` (`ToyCard.tsx`).
- Hooks: `useSomething.ts` (`useDebounce.ts`).
- Tests sit **next to** the code they test: `cartStore.test.ts`.
- One main component per file, named like the file.
- CSS Modules: `Component.module.css`, camelCase class names.

### Rules of thumb

- **Start simple.** Move to feature folders only when it hurts.
- Keep **shared UI** (buttons, inputs, dialogs) in one place with a clear API (`components/` here; many teams call it `shared/ui/`).
- Features may import from `shared`, but should **not** reach into each other's insides. If two features need the same thing, move it to `shared`.
- Avoid giant `utils` files; name helpers by what they do.

## 🧪 Try it yourself

1. **Prove isolation.** Add `.price { color: red; }` to a plain CSS file, for example `Footer.css`. Does the `ToyCard` price turn red? (No: its class is `_price_x…`.) Remove it.
2. **Convert another component.** Turn `QuantityPicker.css` into `QuantityPicker.module.css` and update the component.
3. **Move the toys.** Move `ToyCard`, `ToyList`, `ToyDetails` and `ToyReviews` into `src/features/toys/` with their own `index.ts`. Let the TypeScript compiler (`npm run build`) show you every import to fix.
4. **A second boundary rule.** Think about whether `features/cart` should be allowed to import from `features/toys`. How would you write a lint rule to forbid it?
5. **Share a token.** Add `--color-star: #f59f00` to `index.css` and use it somewhere with `var(--color-star)`. Add a dark-mode override as well.
6. **Use `clsx`.** Install it (`npm install clsx`) and replace the template string for `badge`/`soldOut`.

## ✅ Check yourself

<details>
<summary>1. What problem do CSS Modules solve?</summary>

Global class-name clashes: each class gets a unique generated name, so styles stay local to the component that imports them.
</details>

<details>
<summary>2. What are design tokens, and why use them?</summary>

Named values (colours, spacing, fonts) stored as CSS variables. Components use the names, so a theme change or redesign touches one file.
</details>

<details>
<summary>3. When should you switch from "by type" to "by feature" folders?</summary>

When the app grows and it becomes hard to find things, or a change to one feature means editing files in many folders.
</details>

<details>
<summary>4. What is the purpose of a feature's <code>index.ts</code>?</summary>

It is the feature's public API: it exports only what others may use, so the inner files can change without breaking other features.
</details>

## Recap

- Styling options: plain CSS, CSS Modules, Tailwind, CSS-in-JS. Pick one approach and be consistent. Always keep design tokens.
- CSS Modules scope class names to the component that imports them.
- Start with folders by type; move to folders by feature as the project grows.
- A feature exposes a small public API (`index.ts`) and hides the rest.
- Enforce boundaries with a lint rule rather than hope.

➡️ **Next:** [Lesson 23 – Deployment and environment variables: sending the suitcase to the hotel](23-deployment-and-environment.md)
