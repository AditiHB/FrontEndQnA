# 13. Event Loop & Timers

> **Like I'm 5:** The cook has a to-do list. Quick tasks (like tasting the sauce) go on a fast-lane pile that is checked before every new dish. Slow tasks (like "bake for 10 minutes") go on the main to-do list. The fast lane always goes first.

## The pieces
- **Call stack**: the function currently running.
- **Web APIs / Node APIs**: timers, network, and events run outside the stack.
- **Microtask queue**: promise callbacks (`.then`, `await` continuations) and `queueMicrotask`.
- **Macrotask (task) queue**: `setTimeout`, `setInterval`, user events, I/O.

## Order of execution

```js
console.log('1 sync');

setTimeout(() => console.log('4 timeout'), 0);

Promise.resolve().then(() => console.log('3 microtask'));

console.log('2 sync');

// Output:
// 1 sync
// 2 sync
// 3 microtask
// 4 timeout
```

The loop runs: finish the current stack, drain **all** microtasks, render if needed, then run one macrotask, and repeat.

## Timers are minimums

```js
setTimeout(fn, 0);   // runs after the current code finishes, not immediately
```

A long-running task blocks timers and rendering. Break heavy work into chunks:

```js
function processInChunks(items) {
  let i = 0;
  function next() {
    const end = Math.min(i + 500, items.length);
    for (; i < end; i++) handle(items[i]);
    if (i < items.length) setTimeout(next, 0);   // yield to the browser
  }
  next();
}
```

## Useful APIs

```js
const id = setTimeout(() => {}, 1000);
clearTimeout(id);

const interval = setInterval(tick, 1000);
clearInterval(interval);

queueMicrotask(() => console.log('soon, before timers'));
requestAnimationFrame(() => {});   // runs before the next paint in browsers
```

## Important points
- Promise callbacks run before timers, even with a 0ms delay.
- Clear timers and intervals when a component or page is destroyed.
- Use `requestAnimationFrame` for animations.
