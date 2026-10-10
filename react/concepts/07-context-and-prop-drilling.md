# 7. Context & Prop Drilling

> **Like I'm 5:** Prop drilling is passing a cookie down a long line of kids to reach the one at the end. Context is a cookie jar in the middle of the room that anyone can reach directly.

## The problem: prop drilling

```tsx
<App theme="dark">
  <Layout theme="dark">
    <Sidebar theme="dark">
      <MenuItem theme="dark" />   // only this one needs it
```

Intermediate components pass the value along without using it.

## Context

```tsx
import { createContext, useContext, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';
const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const value = {
    theme,
    toggle: () => setTheme(t => (t === 'light' ? 'dark' : 'light')),
  };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
```

Any component below the provider can call `useTheme()`.

## Performance trap

When the context value changes, **every consumer re-renders**, even if it only uses one field. Mitigations:
- Split contexts: one for rarely changing values, one for frequently changing ones.
- Memoize the value object with `useMemo`.
- Keep the state close to where it is used.

## When to use context
- Theme, locale, current user, feature flags, and other values read in many places.
- Not a replacement for all state. Frequently changing or large state is usually better in a store (see [16-state-management-libraries.md](16-state-management-libraries.md)).

## Composition often beats context

Passing a component as `children` avoids drilling many props through layers. See [12-composition-and-children.md](12-composition-and-children.md).

## Important points
- Give the context a default value of `null` and throw a clear error if it's missing.
- Wrap providers near the top of the tree, close to what needs them.
