# 18. Immutability & Pure Functions

> **Like I'm 5:** Imagine a drawing that you never erase. When you want a new picture, you copy the old one onto a new paper and change the copy. The old drawing stays the same, so everyone who looked at it still sees the same thing.

## Why immutability matters
- Predictable code: a value doesn't change behind your back.
- Easy change detection: a new reference means "something changed" (this is how React, Angular `OnPush`, and signals work).
- Safer sharing between functions and components.

## Updating without mutation

```js
const state = { items: [1, 2], loading: false };

// Mutating (avoid)
state.items.push(3);
state.loading = true;

// Immutable (prefer)
const next = {
  ...state,
  items: [...state.items, 3],
  loading: true,
};
```

## Common immutable operations

```js
const list = [1, 2, 3];
list.filter(x => x !== 2);      // remove
list.map(x => (x === 2 ? 20 : x));   // update
[...list.slice(0, 1), 9, ...list.slice(2)];   // replace by index
[...list.slice(0, 1), ...list.slice(1)];      // copy
```

## Freezing

```js
const config = Object.freeze({ env: 'prod' });
config.env = 'dev';        // ignored (throws in strict mode)
```

`Object.freeze` is shallow. Use a deep freeze helper or an immutable library for nested data.

## Pure functions

```js
// Pure
const addTax = (price, rate) => price * (1 + rate);

// Impure
let total = 0;
const addToTotal = (price) => { total += price; };
```

## Important points
- Prefer `const`, spread, `map`, `filter`, and `toSorted` over mutation.
- Keep pure logic separate from side effects (network, DOM, storage).
- Use `structuredClone` when you need an independent deep copy.
