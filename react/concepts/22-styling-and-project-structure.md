# 22. Styling & Project Structure

> **Like I'm 5:** A good project is a well-organized toy room. Each toy has its own box, labelled by what it does, and the paint for each toy is kept with the toy.

## Styling options

| Approach | How it works | Trade-off |
|----------|--------------|-----------|
| Plain CSS / global CSS | Standard stylesheets | Simple, but names can clash |
| CSS Modules | `Button.module.css` gives scoped class names | Good default, no runtime cost |
| Tailwind CSS | Utility classes in JSX | Fast to build, markup gets long |
| CSS-in-JS (styled-components, Emotion) | Styles in JavaScript | Flexible, has runtime cost and SSR setup |

```tsx
import styles from './Button.module.css';

export function Button({ children }: { children: React.ReactNode }) {
  return <button className={styles.primary}>{children}</button>;
}
```

```css
/* Button.module.css */
.primary {
  background: teal;
  color: white;
}
```

## Design tokens

Store colors, spacing, and fonts as CSS variables. Components use the variables, so a theme change touches one file.

```css
:root {
  --color-brand: #0f766e;
  --space-2: 0.5rem;
}
```

## Folder structure options

**By type** (good for small apps):

```
src/
├── components/
├── hooks/
├── pages/
└── utils/
```

**By feature** (good for growing apps):

```
src/
├── features/
│   ├── cart/
│   │   ├── CartPage.tsx
│   │   ├── useCart.ts
│   │   ├── cart.api.ts
│   │   └── cart.test.tsx
│   └── products/
├── shared/
│   ├── ui/          # buttons, inputs, dialogs
│   └── lib/         # helpers
└── app/             # providers, routes, entry
```

## Naming
- Components: `PascalCase.tsx`.
- Hooks: `useSomething.ts`.
- Tests next to the code they test.

## Important points
- Start simple. Move to feature folders when it becomes hard to find things.
- Keep shared UI in one place with a clear API.
- Enforce import rules with lint to stop features from importing each other's internals.
