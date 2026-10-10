# 6. Refs & the DOM

> **Like I'm 5:** A ref is a sticky note with a pointer to one toy on the shelf. You can point to the toy and touch it directly, but changing the sticky note itself does not make the room redraw.

## `useRef` for DOM access

```tsx
import { useRef, useEffect } from 'react';

export function SearchBox() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} placeholder="Search" />;
}
```

## `useRef` for values that don't trigger renders

```tsx
const timerId = useRef<number | null>(null);

function start() {
  timerId.current = window.setInterval(tick, 1000);
}
function stop() {
  if (timerId.current) clearInterval(timerId.current);
}
```

Changing `ref.current` does not re-render. Use `useState` for values the UI shows.

## Refs in React 19

Function components can receive `ref` as a regular prop. `forwardRef` is no longer needed in new code.

```tsx
function TextInput({ ref, ...props }: { ref?: React.Ref<HTMLInputElement> } & React.ComponentProps<'input'>) {
  return <input ref={ref} {...props} />;
}
```

## Callback refs and cleanup

```tsx
<div ref={node => {
  if (node) observer.observe(node);
  return () => observer.disconnect();   // React 19: callback refs can return cleanup
}} />
```

## `useImperativeHandle`

Expose a small, controlled API from a child to a parent instead of the whole DOM node.

```tsx
useImperativeHandle(ref, () => ({
  focus: () => inputRef.current?.focus(),
  clear: () => setValue(''),
}), []);
```

Use sparingly. Props are usually the better way to communicate.

## Important points
- Use refs for focus, scroll position, measuring elements, third-party libraries, and timers.
- Don't read or write `ref.current` during render, except for lazy initialization.
- Prefer declarative state over imperative DOM changes.
