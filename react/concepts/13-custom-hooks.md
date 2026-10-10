# 13. Custom Hooks

> **Like I'm 5:** A custom hook is a recipe card you write once. Any cook in the kitchen can use it to make the same dish with their own ingredients.

## A simple custom hook

```tsx
import { useEffect, useState } from 'react';

export function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return width;
}

// usage
const width = useWindowWidth();
```

Hook names must start with `use`, so the lint rules can check hook calls.

## Reusable data hook

```tsx
export function useFetch<T>(url: string) {
  const [state, setState] = useState<{ data?: T; error?: Error; loading: boolean }>({ loading: true });

  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true });
    fetch(url, { signal: controller.signal })
      .then(r => r.json() as Promise<T>)
      .then(data => setState({ data, loading: false }))
      .catch(error => { if (error.name !== 'AbortError') setState({ error, loading: false }); });
    return () => controller.abort();
  }, [url]);

  return state;
}
```

For production apps, a library such as TanStack Query is safer (see [15-data-fetching-and-caching.md](15-data-fetching-and-caching.md)).

## Useful hook patterns
- `useLocalStorage(key, initial)`: state synced with storage.
- `useDebounce(value, delay)`: returns a value that updates after a pause.
- `useMediaQuery(query)`: tracks a CSS media query.
- `useOnClickOutside(ref, handler)`: closes menus.

## Rules of hooks
1. Call hooks only at the top level of a component or another hook.
2. Call them in the same order every render.
3. Only call hooks from React functions.

## Important points
- A custom hook shares logic, not state. Each component calling the hook gets its own state.
- Keep hooks focused on one job and return a simple, typed value.
- Test hooks with a helper such as `renderHook` from Testing Library.
