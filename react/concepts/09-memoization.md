# 9. Memoization: `memo`, `useMemo`, `useCallback`

> **Like I'm 5:** Memoization is keeping a sticky note with the answer to a hard sum. Next time someone asks the same sum, you read the note instead of working it out again.

## `React.memo`: skip re-rendering a child

```tsx
const ProductRow = memo(function ProductRow({ product, onSelect }: Props) {
  return <li onClick={() => onSelect(product.id)}>{product.name}</li>;
});
```

`memo` re-renders only when props change by reference (`Object.is`).

## `useMemo`: cache an expensive value

```tsx
const visible = useMemo(
  () => products.filter(p => p.name.includes(query)),
  [products, query]
);
```

Use it when the calculation is slow, or when the result is passed to a memoized child and must keep the same reference.

## `useCallback`: keep a function reference stable

```tsx
const handleSelect = useCallback((id: string) => {
  setSelected(id);
}, []);

<ProductRow onSelect={handleSelect} />   // memo child won't re-render needlessly
```

Without `useCallback`, a new function is created each render, which defeats `memo`.

## Don't memoize everything

Memoization has a cost: extra comparisons and memory. Add it when:
- A profiler shows a real problem.
- A memoized child receives callbacks or objects that would otherwise change every render.

## The React Compiler

The React Compiler can automatically add memoization for components and hooks that follow the rules of React. If your project uses it, you write less `useMemo` and `useCallback`. Check your setup to see whether it is enabled.

## Rules of hooks reminder
- Call hooks at the top level of a component or custom hook, never inside loops or conditions.

## Important points
- Measure first with React DevTools Profiler.
- Fix unnecessary re-renders by moving state down or splitting components before adding memoization.
- Use `memo` on expensive children, not on every component.
