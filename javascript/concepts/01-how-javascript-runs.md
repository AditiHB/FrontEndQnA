# 1. How JavaScript Runs

> **Like I'm 5:** JavaScript is a cook with one pair of hands. The cook does one dish at a time, but while a dish is in the oven, the cook can start another one. The cook's to-do list is the event loop.

## Key concepts
- JavaScript is **single-threaded**: one call stack, one thing at a time.
- An **engine** runs the code. V8 (Chrome and Node.js), SpiderMonkey (Firefox), and JavaScriptCore (Safari) are examples.
- The **runtime** adds features around the engine. The browser gives you the DOM, timers, and `fetch`. Node.js gives you the file system and networking.
- Non-blocking work (timers, network, events) is handled by the browser or Node, and the results come back through the **event loop**.

## Browser vs Node.js

| Feature | Browser | Node.js |
|---------|---------|---------|
| `window`, `document` | Yes | No |
| `fs`, `process` | No | Yes |
| `fetch` | Yes | Yes (modern versions) |
| `globalThis` | Yes | Yes |

```js
console.log(typeof window);      // 'object' in browser, 'undefined' in Node
console.log(typeof globalThis);  // 'object' in both
```

## Running code

```bash
node script.js         # run in Node.js
```

Open the browser developer tools console to run code in a page.

## Script loading

```html
<script src="app.js" defer></script>   <!-- runs after HTML is parsed -->
<script src="analytics.js" async></script> <!-- runs as soon as it downloads -->
<script type="module" src="main.js"></script> <!-- ES module, deferred by default -->
```

## Important points
- Long synchronous work blocks the page. Keep heavy work short or move it to a Web Worker.
- Understanding the event loop (see [13-event-loop-and-timers.md](13-event-loop-and-timers.md)) explains most "why did this run first?" puzzles.
