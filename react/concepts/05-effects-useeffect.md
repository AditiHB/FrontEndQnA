# 5. Effects with `useEffect`

> **Like I'm 5:** An effect is a note you leave for a helper outside the room: "when the door opens, ring the bell; when the door closes, turn the bell off". The helper runs the note after the room is drawn.

## Basic effect

```tsx
import { useEffect, useState } from 'react';

export function WindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);   // cleanup
  }, []);   // empty array: run once on mount

  return <p>Width: {width}</p>;
}
```

## The dependency array

| Array | When it runs |
|-------|--------------|
| (none) | After every render |
| `[]` | Once after the first render |
| `[a, b]` | When `a` or `b` changes |

Always list every value the effect reads. The lint rule `react-hooks/exhaustive-deps` helps.

## Cleanup

The function returned from an effect runs before the next effect and when the component unmounts. Use it for timers, subscriptions, and listeners.

```tsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);
```

## Data fetching with cleanup

```tsx
useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/users/${id}`, { signal: controller.signal })
    .then(r => r.json())
    .then(setUser)
    .catch(err => { if (err.name !== 'AbortError') setError(err); });
  return () => controller.abort();
}, [id]);
```

This prevents race conditions when `id` changes quickly. For real apps, prefer a data library (see [15-data-fetching-and-caching.md](15-data-fetching-and-caching.md)).

## Don't use effects for everything

You often don't need an effect:
- Derived values: compute during render.
- Reacting to a user event: put the logic in the event handler.
- Resetting state when a prop changes: use a `key` on the component.

## StrictMode

In development, React mounts, unmounts, and remounts components once to test cleanup. If your effect breaks when run twice, it is missing a cleanup.

## Important points
- Effects synchronize React with things outside React: DOM, network, timers, third-party libraries.
- Keep effects small and focused. Split them by purpose.
- Lint your dependency arrays and fix the warnings instead of disabling them.
