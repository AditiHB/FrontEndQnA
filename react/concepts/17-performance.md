# 17. Performance

> **Like I'm 5:** A slow room is a room with too much stuff. Performance is the art of putting away what you don't need right now, and fetching the rest only when you ask for it.

## Measure first

Use the React DevTools **Profiler** to see which components rendered, why, and how long each one took. Look for components that re-render without visible changes.

## Common causes of slow UIs
1. State lives too high, so a big tree re-renders on each change.
2. Context value changes often, and many consumers re-render.
3. Large lists rendered all at once.
4. Heavy calculations on every render.
5. Big bundles that take long to download.

## Fixes

### Move state down
Keep state close to the components that use it.

### Split components
A small component that owns the frequently changing part avoids re-rendering the whole page.

### Memoize expensive children
`memo`, `useMemo`, `useCallback`, as in [09-memoization.md](09-memoization.md).

### Lazy load code

```tsx
import { lazy, Suspense } from 'react';

const Chart = lazy(() => import('./Chart'));

<Suspense fallback={<Spinner />}>
  <Chart data={data} />
</Suspense>
```

### Virtualize long lists

Libraries such as TanStack Virtual or react-window render only the rows visible on screen.

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';
// create a scroll container, then render only virtualizer.getVirtualItems()
```

### Keep bundles small
- Import only what you need: `import { debounce } from 'lodash-es'`.
- Analyze the bundle with `rollup-plugin-visualizer` or a similar tool.

### Images
- Use correct sizes, modern formats, and `loading="lazy"` for images below the fold.

## Avoid these traps
- Creating new objects or arrays in props on every render, if the child is memoized.
- Using `useEffect` to derive state, which causes an extra render.
- Re-fetching data on every render because of a missing dependency.

## Important points
- Performance work should be driven by profiling and real user metrics, not guesses.
- The React Compiler can reduce manual memoization, but state structure still matters.
