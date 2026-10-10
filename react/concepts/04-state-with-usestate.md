# 4. State with `useState`

> **Like I'm 5:** State is a whiteboard in the room. When you write a new number on the whiteboard, React notices and redraws the room so it shows the new number.

## Basic state

```tsx
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```

## Updating from the previous value

```tsx
setCount(prev => prev + 1);   // safe when several updates happen in one event
```

Use the functional form whenever the new value depends on the old one.

## Objects and arrays must be replaced

```tsx
// Wrong: mutates the old object, React may not re-render
user.name = 'Ravi';
setUser(user);

// Right: create a new object
setUser({ ...user, name: 'Ravi' });

// Arrays
setItems(prev => [...prev, newItem]);
setItems(prev => prev.filter(i => i.id !== id));
setItems(prev => prev.map(i => (i.id === id ? { ...i, done: true } : i)));
```

## Lazy initial state

```tsx
const [data, setData] = useState(() => expensiveParse(localStorage.getItem('cache')));
```

The function runs only on the first render.

## State is per component instance

Two `<Counter />` components have separate counts. State lives in React, not in the function variable.

## Derived values are not state

```tsx
const [items, setItems] = useState<Item[]>([]);
const total = items.reduce((sum, i) => sum + i.price, 0);   // compute, don't store
```

Storing a value that can be calculated from other state creates bugs when the two get out of sync.

## Important points
- Keep state as small as possible.
- Put state in the lowest component that needs it, then lift it up if siblings need it.
- Updates are batched and applied after the event handler finishes. Reading `count` right after `setCount` still gives the old value.
