# 5. Closures

> **Like I'm 5:** A closure is a backpack. When a function is born inside another function, it packs the toys it needs into its backpack, and it keeps them even after the grown-up function has gone home.

## Basic closure

```js
function makeCounter() {
  let count = 0;             // lives in the backpack
  return function () {
    count += 1;
    return count;
  };
}

const counter = makeCounter();
counter();   // 1
counter();   // 2
```

`count` is not accessible from outside, but the returned function remembers it.

## Common uses

### 1. Private state

```js
function createAccount(initial) {
  let balance = initial;
  return {
    deposit: (n) => (balance += n),
    get balance() { return balance; },
  };
}
```

### 2. Function factories

```js
const double = makeMultiplier(2);
const triple = makeMultiplier(3);

function makeMultiplier(factor) {
  return (x) => x * factor;
}
```

### 3. Event handlers that remember data

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);   // 0, 1, 2 with let
}
```

With `var`, all three callbacks would print `3`, because they share one variable. This was a classic interview question.

## Memory note

A closure keeps everything in its scope alive as long as the closure exists. Holding a large object in a long-lived closure can cause memory leaks. Null out references you no longer need.

## Important points
- Closures are how callbacks, event handlers, and modules keep state.
- Remember: closures capture variables, not values at the moment of creation.
- Use `let` or `const` in loops to avoid shared-variable bugs.
