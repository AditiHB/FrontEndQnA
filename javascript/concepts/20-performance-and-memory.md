# 20. Performance & Memory

> **Like I'm 5:** Your room gets messy when you keep old toys you never play with. Garbage collection is the cleaning robot that takes away toys nobody can reach anymore. A memory leak is a toy you keep reaching for, so the robot can never take it away.

## Garbage collection
- JavaScript frees memory automatically when an object can no longer be reached from a live root.
- You can't force it, and you don't need to manage memory manually.
- A leak happens when something still references an object you no longer need.

## Common leaks

```js
// 1. Forgotten event listeners
element.addEventListener('scroll', onScroll);   // remove when the element goes away

// 2. Timers that keep running
const id = setInterval(tick, 1000);   // clearInterval(id) when done

// 3. Global caches that never shrink
const cache = new Map();   // use WeakMap for objects, or limit its size

// 4. Detached DOM nodes still referenced in JavaScript
```

## WeakMap and WeakRef

```js
const meta = new WeakMap();
meta.set(domNode, { clicks: 0 });   // entry goes away when domNode is collected
```

## Debounce and throttle

```js
function debounce(fn, ms) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  };
}

function throttle(fn, ms) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...args);
    }
  };
}

window.addEventListener('resize', debounce(relayout, 200));
window.addEventListener('scroll', throttle(onScroll, 100));
```

- Debounce: run after the user stops for a while (search boxes).
- Throttle: run at most once per interval (scroll, resize).

## Measuring

```js
console.time('build');
buildList();
console.timeEnd('build');

performance.mark('start');
// ... work ...
performance.measure('work', 'start');
```

Use the Performance and Memory panels in DevTools for real investigation.

## Important points
- Remove listeners and timers in cleanup code.
- Avoid unnecessary work in hot paths (scroll, input, render loops).
- Measure before optimizing.
