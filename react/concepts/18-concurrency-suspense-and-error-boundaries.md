# 18. Concurrency, Suspense & Error Boundaries

> **Like I'm 5:** Imagine a cook who can pause a slow dish to make a quick salad for a hungry guest. Transitions let React put slow updates aside so the screen stays responsive. Suspense is a sign that says "food is coming, here's a placeholder". An error boundary is a fire alarm for one room, so the rest of the house keeps running.

## Transitions: `useTransition`

```tsx
import { useState, useTransition } from 'react';

export function Search({ items }: { items: string[] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(items);
  const [isPending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);                  // urgent: input stays responsive
    startTransition(() => {
      setResults(items.filter(i => i.includes(e.target.value)));   // can wait
    });
  }

  return (
    <>
      <input value={query} onChange={onChange} />
      {isPending && <span>Updating…</span>}
      <List items={results} />
    </>
  );
}
```

## Deferred values: `useDeferredValue`

```tsx
const deferredQuery = useDeferredValue(query);
const filtered = useMemo(() => heavyFilter(deferredQuery), [deferredQuery]);
```

Use it when you can't wrap the update in `startTransition`, such as a value passed in as a prop.

## Suspense

```tsx
<Suspense fallback={<Skeleton />}>
  <ProfileDetails />     {/* may suspend while data loads */}
</Suspense>
```

- A component that "suspends" shows the nearest fallback.
- Suspense for data requires support from the data layer (a framework, `use(promise)`, or a library such as TanStack Query with suspense mode).
- Place boundaries to show the right amount of UI while waiting.

## Error boundaries

Error boundaries catch errors during rendering in their children. They must be class components, or use the `react-error-boundary` package.

```tsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<p>Could not load the chart.</p>} onError={log}>
  <Chart />
</ErrorBoundary>
```

Error boundaries do **not** catch errors in event handlers, async code, or the boundary itself. Handle those with `try`/`catch` or query error states.

## Reset a boundary

```tsx
<ErrorBoundary key={routeId} fallback={<Retry />}>
```

Changing the `key` remounts the boundary and clears the error.

## Important points
- Mark urgent updates (typing, clicking) and non-urgent updates (filtering a big list) differently.
- Use one boundary per independent part of the page, so one failure doesn't break everything.
- Log errors to a monitoring tool from `onError`.
