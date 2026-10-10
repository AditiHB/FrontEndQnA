# Step 20: Performance & Memory - The Cleaning Robot

> **Like I'm 5:** Your room gets messy when you keep old toys you never play with. Garbage collection is the cleaning robot that takes away toys nobody can reach anymore. A memory leak is a toy you keep reaching for, so the robot can never take it away.

| | |
|---|---|
| **Concept lesson** | [20. Performance & memory](../concepts/20-performance-and-memory.md) |
| **Time** | About 75 minutes |
| **You will build** | A **search box** that waits until you stop typing (debounce), a kitchen board that times each order using a **WeakMap**, relative times that **refresh themselves** without leaking, and **measurements** you can read in the Console |
| **Files you touch** | `playground.js`, `src/perf.js` (new), `src/menu.js`, `index.html`, `styles.css`, `src/board.js`, `src/main.js` |
| **Before** | [Step 19: Strings, numbers & dates](19-strings-numbers-and-dates.md) |

## Words to know

| Word | Like I'm 5 |
|------|------------|
| **Garbage collection (GC)** | The cleaning robot. It throws away things nobody can reach any more. |
| **Memory leak** | A toy you keep a hold of by accident, so the robot can never take it. |
| **Reachable** | You can still get to it by following names from your program. |
| **`WeakMap` / `WeakRef`** | A way to point at something **without** stopping the robot from taking it. |
| **Debounce** | "Wait until they stop talking, then answer once." |
| **Throttle** | "I will answer at most once every little while, however much you talk." |
| **Hot path** | Code that runs again and again (scrolling, typing, drawing). Small waste there adds up. |
| **Profiling** | Measuring where the time and memory really go. |

---

## 1. The big idea

Two different worries:

1. **Memory.** JavaScript cleans up for you (the robot). But it can only clean what nobody can **reach**. If something still points at old stuff, it stays for ever. That is a **leak**.
2. **Speed.** Some code runs hundreds of times a second (typing, scrolling). Doing less work there makes the page feel smooth.

And the golden rule for both: **measure before you optimise.** Guessing what is slow is wrong most of the time.

```text
  reachable from your program ──► kept alive
  ┌──────────┐
  │  a toy   │ ◄── a forgotten listener / timer / cache / global still holds it
  └──────────┘
        ✗ nobody holds it ──► the robot takes it away (garbage collected)
```

---

## 2. Play: the four classic leaks

### Leak 1: forgotten event listeners

📄 **Replace `playground.js`**

```js
import { getEventListeners } from 'node:events';

const target = new EventTarget(); // pretend this is a long-lived thing, like `window`

function mount() {
  const controller = new AbortController();
  target.addEventListener('tick', () => {}, { signal: controller.signal });
  return () => controller.abort(); // the cleanup function
}

for (let i = 0; i < 3; i++) mount(); // we "forget" to clean these up
console.log('listeners after 3 forgotten mounts:', getEventListeners(target, 'tick').length);

const cleanups = [mount(), mount(), mount()];
console.log('after 3 more mounts:', getEventListeners(target, 'tick').length);

cleanups.forEach((cleanup) => cleanup()); // we DO clean up these three
console.log('after cleaning up those 3:', getEventListeners(target, 'tick').length);
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
listeners after 3 forgotten mounts: 3
after 3 more mounts: 6
after cleaning up those 3: 3
```

The three forgotten ones are still there, and each one **also keeps everything its function can see alive** (remember the closure backpack from Step 5). On a real page, forgetting this every time a component appears can add up to thousands. The fix: **give every listener a `signal`, and abort it when you are done.** You did exactly this in Step 16.

### Leak 2: timers that never stop

```js
const id = setInterval(tick, 1000);
// ... later, when the thing that needed it goes away:
clearInterval(id); // without this, tick runs for ever and keeps everything it references
```

### Leak 3: caches that only grow

A cache saves answers so you don't redo work. But a cache that never forgets is a slow leak. **Give every cache a limit.**

📄 **Replace `playground.js`**

```js
// A tiny cache that remembers at most `limit` answers and forgets the oldest first.
function createCache(limit) {
  const entries = new Map(); // a Map remembers the order things were added
  return {
    get(key) {
      if (!entries.has(key)) return undefined;
      const value = entries.get(key);
      entries.delete(key);
      entries.set(key, value); // move it to the "recently used" end
      return value;
    },
    set(key, value) {
      entries.delete(key);
      entries.set(key, value);
      if (entries.size > limit) {
        entries.delete(entries.keys().next().value); // drop the oldest
      }
    },
    get size() {
      return entries.size;
    },
  };
}

const cache = createCache(3);
for (const word of ['a', 'b', 'c', 'd', 'e']) {
  cache.set(word, word.toUpperCase());
}
console.log(cache.size, cache.get('a'), cache.get('e'));
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
3 undefined E
```

Five things went in, only three stayed, and the oldest (`a`) is gone.

### Leak 4: detached DOM nodes

If you remove an element from the page but still keep it in a JavaScript variable or array, the browser keeps it and its whole subtree. After `replaceChildren(...)` or `remove()`, make sure no list in your code still holds the old elements.

---

## 3. Play: `WeakMap` and `WeakRef` (pointing without holding)

Sometimes you want to attach a note to an object **without keeping that object alive**. A `WeakMap` does that: its keys are held *weakly*. When nothing else holds the key object, the robot may take it, and the note disappears too. A `WeakRef` is the same idea for a single value.

📄 **Replace `playground.js`**

```js
// Run this one with:  node --expose-gc playground.js   (so we can call the cleaning robot ourselves)
let order = { id: 1, items: new Array(100_000).fill('x') };

const startedAt = new WeakMap(); // notes about orders, kept OUTSIDE the orders
startedAt.set(order, Date.now());
const ref = new WeakRef(order); // a pointer that does not keep the order alive

console.log('before:', ref.deref() !== undefined, startedAt.has(order));

order = null; // nobody holds the order any more
await new Promise((resolve) => setTimeout(resolve, 0));
globalThis.gc(); // ask the cleaning robot to run now (normally it decides itself)
await new Promise((resolve) => setTimeout(resolve, 0));

console.log('after: ', ref.deref() !== undefined);
```

▶️ **Run:** `node --expose-gc playground.js`

👀 **You should see:**

```text
before: true true
after:  false
```

After the robot ran, the order was gone, and so was its note in the `WeakMap`. With a normal `Map` the note would have kept the order alive for ever.

| | `Map` | `WeakMap` |
|--|-------|-----------|
| Keys can be | Anything | **Objects only** |
| Keeps the key alive? | **Yes** | **No** |
| Can you list its entries? | Yes | No (the robot may remove them any time) |
| Use it for | Normal lookups | Private notes about objects you do not own (DOM nodes, orders) |

> You almost never call `gc()` yourself. This is just so you can see the robot work. In real code, `WeakMap` simply means "this note must not be the reason an object stays".

---

## 4. Play: debounce and throttle

When someone types in a search box, `input` fires on **every keystroke**. Searching on each one wastes work. Two tools:

| | Idea | Use it for |
|--|------|-----------|
| **Debounce** | Wait until the calls **stop** for a moment, then run once with the latest | Search boxes, saving drafts, resizing |
| **Throttle** | Run **at most once** per time window | Scroll, mouse move, drag |

Both are closures (Step 5) that remember a timer or a timestamp.

📄 **Replace `playground.js`**

```js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function debounce(fn, ms) {
  let timerId;
  return (...args) => {
    clearTimeout(timerId); // each new call cancels the waiting one
    timerId = setTimeout(() => fn(...args), ms);
  };
}

function throttle(fn, ms) {
  let last = -Infinity;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...args);
    }
  };
}

const search = debounce((text) => console.log('searching for', text), 100);
search('l');
search('le');
search('lem'); // typed quickly: only the LAST call survives
await wait(150);

console.log('--- throttle');
const onScroll = throttle((label) => console.log('ran:', label), 50);
onScroll('a');
onScroll('b'); // too soon: dropped
onScroll('c'); // too soon: dropped
await wait(60);
onScroll('d'); // enough time has passed
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
searching for lem
--- throttle
ran: a
ran: d
```

---

## 5. Play: measuring (never guess!)

📄 **Replace `playground.js`**

```js
// 1. console.time: the quickest stopwatch
console.time('sum');
let total = 0;
for (let i = 0; i < 5_000_000; i++) total += i;
console.timeEnd('sum');

// 2. performance.mark / measure: named stopwatches you can see in DevTools
performance.mark('start');
for (let i = 0; i < 1_000_000; i++) total += i;
performance.mark('end');
const entry = performance.measure('loop', 'start', 'end');
console.log(entry.name, entry.duration > 0);

// 3. A real surprise: is making a formatter every time slow?
const N = 20_000;
let start = performance.now();
for (let i = 0; i < N; i++) {
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(i);
}
const slow = performance.now() - start;

const shared = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
start = performance.now();
for (let i = 0; i < N; i++) {
  shared.format(i);
}
const fast = performance.now() - start;

console.log('Reusing the formatter is faster:', fast < slow);
console.log(`new every time: ${slow.toFixed(0)} ms | reused: ${fast.toFixed(0)} ms`);
```

▶️ **Run:** `node playground.js`

👀 **You should see something like:**

```text
sum: 4.2ms
loop true
Reusing the formatter is faster: true
new every time: 816 ms | reused: 12 ms
```

(Your times will be different. The pattern will not: reusing the formatter is **dozens of times** faster.) That is exactly why `format.js` in Step 19 created its `Intl.NumberFormat` **once**, at the top of the file, instead of inside the function.

In a browser, the **Performance** and **Memory** tabs in DevTools do this at a larger scale: record while you use the page, then look for long tasks (red corners), and take heap snapshots to see what is being kept alive.

---

## 6. Build: put it into the stand

### A. Debounce and throttle, in their own file

The same two functions, promoted to a module. `debounce` also gets a `.cancel()` so a **pending** timer can be thrown away on cleanup. `throttle` can be given the clock to use, which makes it easy to test (Step 22).

📄 **Create `src/perf.js`**

```js
// Wait until calls STOP for `ms`, then run once with the latest arguments.
export function debounce(fn, ms) {
  let timerId;
  const debounced = (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), ms);
  };
  debounced.cancel = () => clearTimeout(timerId); // throw away a pending call
  return debounced;
}

// Run at most once every `ms`. Extra calls in between are dropped.
export function throttle(fn, ms, now = Date.now) {
  let last = -Infinity;
  return (...args) => {
    const current = now();
    if (current - last >= ms) {
      last = current;
      fn(...args);
    }
  };
}
```

### B. A pure menu filter

📄 **Add to the bottom of `src/menu.js`**

```js

// Keep the items whose name contains what the person typed (ignoring capital letters).
// With an empty search it returns the SAME array, so nothing needs redrawing.
export function filterMenu(items, query) {
  const text = query.trim().toLowerCase();
  return text === '' ? items : items.filter(({ name }) => name.toLowerCase().includes(text));
}
```

### C. A search box on the page

📄 **Replace `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Sunny Lemonade Stand</title>
    <link rel="icon" href="data:," />
    <link rel="stylesheet" href="/styles.css" />
    <script type="module" src="/src/main.js"></script>
  </head>
  <body>
    <header class="top-bar" id="top-bar">
      <h1 id="stand-name">Lemonade Stand</h1>
      <p id="stand-hours"></p>
      <p id="table-info"></p>
      <button type="button" id="theme-toggle">Dark</button>
    </header>

    <main class="layout">
      <section class="panel" aria-labelledby="menu-title">
        <h2 id="menu-title">Menu</h2>
        <label class="search">
          Search the menu
          <input type="search" id="search" autocomplete="off" />
        </label>
        <ul id="menu"></ul>
      </section>

      <aside class="panel" aria-labelledby="cart-title">
        <h2 id="cart-title">Your cart</h2>
        <ul id="cart"></ul>
        <p id="cart-total" class="cart-total"></p>
        <form id="order-form" class="order-form">
          <label>
            Your name
            <input name="customer" required autocomplete="off" />
          </label>
          <label>
            <input type="checkbox" name="takeAway" />
            Take-away (adds a box fee)
          </label>
          <button type="submit">Place order</button>
        </form>
        <p id="message" role="status"></p>
      </aside>
    </main>

    <section class="panel kitchen" aria-labelledby="kitchen-title">
      <h2 id="kitchen-title">Kitchen board</h2>
      <ul id="board"></ul>
    </section>

    <section class="panel wide" id="orders-section" aria-labelledby="orders-title">
      <h2 id="orders-title">Recent orders (from the server)</h2>
      <ul id="server-orders"></ul>
    </section>

    <section class="panel wide" id="report-section" aria-labelledby="report-title">
      <h2 id="report-title">End-of-day report (made by a Web Worker)</h2>
      <p id="report-status">Waiting until you scroll here...</p>
      <ul id="report"></ul>
    </section>

    <footer class="footer">
      <p id="layout-info"></p>
    </footer>
  </body>
</html>
```

📄 **Add to the bottom of `styles.css`**

```css

/* --- Step 20 additions --- */
.search {
  display: block;
  margin-bottom: 8px;
}

.search input {
  display: block;
  width: 100%;
  padding: 6px;
}
```

### D. The kitchen board times each order, with a `WeakMap`

The note "when did this order start?" lives **outside** the order object, in a `WeakMap`. When the order is gone, so is its note.

📄 **Replace `src/board.js`**

```js
import { PickupTimer, kitchenUpdates } from './index.js';
import { addBoardLine } from './ui.js';

// Private notes about each order, kept OUTSIDE the order. A WeakMap never stops an order from
// being cleaned up: when the order goes away, its note goes with it.
const startedAt = new WeakMap();

// The kitchen board: stream the updates, then count down to pickup.
export async function watchKitchen(board, order) {
  startedAt.set(order, performance.now());
  addBoardLine(board, `Order #${order.id} for ${order.customer}: the kitchen is cooking...`);
  for await (const update of kitchenUpdates(order)) {
    addBoardLine(board, `   ${update}`);
  }

  const status = addBoardLine(board, `Order #${order.id}: calling your name in 3...`);
  new PickupTimer(3, {
    onTick: (secondsLeft) => {
      status.textContent = `Order #${order.id}: calling your name in ${secondsLeft}...`;
    },
    onDone: () => {
      order.markReady();
      const seconds = ((performance.now() - startedAt.get(order)) / 1000).toFixed(1);
      status.textContent = `Order #${order.id} is ready! 🎉 (took ${seconds} s)`;
      status.classList.add('done');
    },
  }).start();
}
```

### E. `main.js`: debounce, refreshing times, cleanup, measuring

Four changes. Look for each:

1. The **search** is debounced, and its pending call is cancelled on cleanup.
2. The name **draft** is saved with a debounce too (and a pending save is cancelled on submit, so it cannot bring the old name back).
3. A `setInterval` refreshes the "x minutes ago" texts every 30 seconds, and **the same `signal` clears it**.
4. `measure(...)` wraps the menu drawing in `performance.mark/measure`, and prints the time if the address has `?debug`.

📄 **Replace `src/main.js`**

```js
import {
  stand,
  menu,
  initialStock,
  addToCart,
  setQuantity,
  removeFromCart,
  reduceStock,
  Order,
  TakeAwayOrder,
  StandError,
  orderNumbers,
  createStore,
} from './index.js';
import { filterMenu } from './menu.js';
import { debounce } from './perf.js';
import { getOrders, sendOrder } from './api.js';
import {
  loadCart,
  saveCart,
  loadSettings,
  saveSettings,
  loadDraftName,
  saveDraftName,
} from './storage.js';
import { renderMenu, renderCart, renderServerOrders, renderReport, setMessage } from './ui.js';
import { watchKitchen } from './board.js';
import { loadWhenVisible, runReportInWorker } from './sections.js';

const topBar = document.querySelector('#top-bar');
const tableInfo = document.querySelector('#table-info');
const themeButton = document.querySelector('#theme-toggle');
const searchBox = document.querySelector('#search');
const menuList = document.querySelector('#menu');
const cartList = document.querySelector('#cart');
const cartTotal = document.querySelector('#cart-total');
const form = document.querySelector('#order-form');
const message = document.querySelector('#message');
const board = document.querySelector('#board');
const ordersSection = document.querySelector('#orders-section');
const ordersList = document.querySelector('#server-orders');
const reportSection = document.querySelector('#report-section');
const reportStatus = document.querySelector('#report-status');
const reportList = document.querySelector('#report');
const layoutInfo = document.querySelector('#layout-info');

const params = new URLSearchParams(location.search);
const table = params.get('table');
const debug = params.has('debug'); // add ?debug to the address to see timings in the Console

const store = createStore({
  cart: loadCart(),
  stock: initialStock,
  settings: loadSettings(),
  query: '',
});
const orderIds = orderNumbers();
let latestOrders = null; // the last list we got from the server

const cleanup = new AbortController();
const { signal } = cleanup;

// Time a piece of work with performance.mark / measure. (Measure first, then optimise!)
function measure(label, work) {
  performance.mark(`${label}-start`);
  work();
  performance.mark(`${label}-end`);
  const entry = performance.measure(label, `${label}-start`, `${label}-end`);
  if (debug) console.log(`${label} took ${entry.duration.toFixed(2)} ms`);
}

function applyTheme({ theme }) {
  document.body.classList.toggle('dark', theme === 'dark');
  themeButton.textContent = theme === 'dark' ? 'Light' : 'Dark';
}

function drawMenu({ stock, query }) {
  const items = filterMenu(menu, query);
  renderMenu(menuList, items, stock);
  if (items.length === 0) {
    menuList.textContent = 'Nothing on the menu matches that.';
  }
}

// Redraw ONLY what changed. A new reference (!==) means "this part changed".
let shown = {};
function render(state) {
  if (state.stock !== shown.stock || state.query !== shown.query) {
    measure('draw menu', () => drawMenu(state));
  }
  if (state.cart !== shown.cart) {
    renderCart(cartList, cartTotal, state.cart);
    saveCart(state.cart);
  }
  if (state.settings !== shown.settings) {
    applyTheme(state.settings);
    saveSettings(state.settings);
  }
  shown = state;
}

function change(update) {
  try {
    store.update(update);
    setMessage(message, '');
  } catch (error) {
    if (!(error instanceof StandError)) throw error;
    setMessage(message, error.message, 'error');
  }
}

// Typing fires `input` on every key. We only search once the person pauses for a moment.
const applySearch = debounce((query) => {
  store.update((state) => ({ ...state, query }));
}, 250);

// The same for saving the half-typed name: no need to write storage on every keystroke.
const saveDraft = debounce(saveDraftName, 300);

function onSearchInput(event) {
  applySearch(event.target.value);
}

function onNameInput(event) {
  saveDraft(event.target.value);
}

function onMenuClick(event) {
  const button = event.target.closest('button[data-action="add"]');
  if (!button) return;
  const { id } = button.closest('[data-id]').dataset;
  change((state) => ({ ...state, cart: addToCart(state.cart, id, 1, state.stock) }));
}

function onCartClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const { id } = button.closest('[data-id]').dataset;
  const { action } = button.dataset;
  change((state) => {
    if (action === 'remove') {
      return { ...state, cart: removeFromCart(state.cart, id) };
    }
    const current = state.cart.find((line) => line.itemId === id)?.quantity ?? 0;
    const quantity = action === 'inc' ? current + 1 : current - 1;
    return { ...state, cart: setQuantity(state.cart, id, quantity, state.stock) };
  });
}

function onThemeClick() {
  store.update((state) => ({
    ...state,
    settings: { ...state.settings, theme: state.settings.theme === 'dark' ? 'light' : 'dark' },
  }));
}

async function onSubmit(event) {
  event.preventDefault();
  const { cart } = store.getState();
  if (cart.length === 0) {
    setMessage(message, 'Your cart is empty. Add something tasty first!', 'error');
    return;
  }

  const data = new FormData(form);
  const customer = String(data.get('customer')).trim() || 'friend';
  const OrderType = data.get('takeAway') ? TakeAwayOrder : Order;
  const order = OrderType.fromCart({ id: orderIds.next().value, customer, cart });

  store.update((state) => ({ ...state, cart: [], stock: reduceStock(state.stock, order.lines) }));
  form.reset();
  saveDraft.cancel(); // a pending save must not bring the old name back
  saveDraftName('');
  setMessage(message, `Thank you, ${customer}! ${order.describe()}`);

  saveOnServer(order);
  await watchKitchen(board, order);
}

async function saveOnServer(order) {
  try {
    const saved = await sendOrder(order, { table });
    setMessage(
      message,
      `Thank you, ${order.customer}! Your order is saved on the server as #${saved.id}.`,
    );
    await refreshOrders();
  } catch (error) {
    setMessage(message, `We could not save your order online: ${error.message}`, 'error');
  }
}

async function refreshOrders() {
  try {
    latestOrders = await getOrders();
    renderServerOrders(ordersList, latestOrders);
  } catch (error) {
    setMessage(message, `Could not load recent orders: ${error.message}`, 'error');
  }
}

async function loadReport() {
  reportStatus.textContent = 'Crunching 1,000,000 sales in a Web Worker...';
  try {
    renderReport(reportList, await runReportInWorker(1_000_000));
    reportStatus.textContent = 'Done!';
  } catch (error) {
    reportStatus.textContent = error.message;
  }
}

let scrollQueued = false;
function onScroll() {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => {
    topBar.classList.toggle('scrolled', window.scrollY > 10);
    scrollQueued = false;
  });
}

window.addEventListener('error', (event) => console.error('Something broke:', event.error));
window.addEventListener('unhandledrejection', (event) => {
  console.error('A promise failed and nobody caught it:', event.reason);
});

// --- Start up ---
document.querySelector('#stand-name').textContent = stand.name;
document.querySelector('#stand-hours').textContent =
  `Open ${stand.hours.open}:00 to ${stand.hours.close}:00`;
if (table) {
  tableInfo.textContent = `Table ${table}`;
}
form.elements.customer.value = loadDraftName();

store.subscribe(render);
render(store.getState());

menuList.addEventListener('click', onMenuClick, { signal });
cartList.addEventListener('click', onCartClick, { signal });
form.addEventListener('submit', onSubmit, { signal });
form.elements.customer.addEventListener('input', onNameInput, { signal });
searchBox.addEventListener('input', onSearchInput, { signal });
themeButton.addEventListener('click', onThemeClick, { signal });
window.addEventListener('scroll', onScroll, { passive: true, signal });
window.addEventListener('pagehide', () => cleanup.abort(), { once: true });

loadWhenVisible(ordersSection, refreshOrders, { signal });
loadWhenVisible(reportSection, loadReport, { signal });

// Keep "3 minutes ago" fresh. And, like every timer, make sure it STOPS when we clean up.
const refreshTimes = setInterval(() => {
  if (latestOrders) renderServerOrders(ordersList, latestOrders);
}, 30_000);

const resizeObserver = new ResizeObserver(([entry]) => {
  const width = Math.round(entry.contentRect.width);
  requestAnimationFrame(() => {
    layoutInfo.textContent = `Page width: ${width}px (${width < 700 ? 'narrow' : 'wide'} layout)`;
  });
});
resizeObserver.observe(document.body);

// ONE cleanup path: everything that could leak is stopped here.
signal.addEventListener(
  'abort',
  () => {
    clearInterval(refreshTimes);
    applySearch.cancel();
    saveDraft.cancel();
    resizeObserver.disconnect();
  },
  { once: true },
);
```

Reload **http://localhost:3000** and try it.

▶️ **Run (skip):** open http://localhost:3000?debug and try the page

**Try the journey:**

1. Type `cook` quickly into **Search the menu**. The list filters **once**, shortly after you stop typing. Type something silly like `xyz` to see the "Nothing on the menu matches" message. Clear the box to get everything back.
2. Open the Console (`F12`). With `?debug` on the address you see lines like `draw menu took 0.40 ms` every time the menu is redrawn.
3. Place an order. The kitchen board's last line now says how long it took: `Order #1 is ready! 🎉 (took 4.3 s)`.
4. Open the **Performance** tab in DevTools, click Record, type in the search box and add things to the cart, stop recording. Look at the timeline. Do you see any long red-cornered tasks? (You should not.)

---

## 7. What just happened?

- **Debounce.** `applySearch` is a closure around one `timerId`. Every keystroke cancels the waiting timer and starts a new 250 ms one. Only when typing pauses does the search actually run, once, with the final text.
- **`.cancel()` matters.** If the page is torn down with a timer still waiting, that timer would fire later and touch things that are gone. And on submit, a *pending* draft-save could re-save the old name, so we cancel it first.
- **One cleanup path.** The `abort` handler clears the interval, cancels the debounces, and disconnects the observer. Combined with `{ signal }` on every listener, **one `cleanup.abort()` frees everything.** That is how you avoid the leaks from the first part of this step.
- **`WeakMap` in `board.js`** holds each order's start time *outside* the order. The notes can never be the reason an old order is kept in memory.
- **`filterMenu` returns the same array for an empty search**, a tiny trick from Step 18, so an empty query does not cause extra work.
- **`performance.mark/measure`** gave real numbers. The point of measuring is that it usually tells you the page is already fast enough, and then you can stop. (Remember: *measure before you optimise*.)
- **Reuse expensive objects.** `format.js` creates its `Intl` formatters **once**. The experiment showed why: about 70 times faster.

## 🧪 Try it yourself

1. Change the debounce time from `250` to `1500`. Type in the box. How does it feel? What is the trade-off between a short and a long wait?
2. Temporarily remove `signal` from the `searchBox.addEventListener(...)` line (and in `DevTools > Console`, run `getEventListeners(document.querySelector('#search'))`). What is different?
3. Use `throttle` on the `onScroll` handler instead of the `requestAnimationFrame` flag, like `const onScroll = throttle(() => { ... }, 100);`. Both work. When would you prefer each? (`requestAnimationFrame` is tied to painting, so it suits visual updates. `throttle` is a fixed rate and suits work that is not about drawing.)
4. **Find a leak.** What is wrong with this, and how would you fix it?
   ```js
   function showToast(text) {
     const toast = document.createElement('div');
     toast.textContent = text;
     document.body.append(toast);
     window.addEventListener('resize', () => toast.remove());
   }
   ```
   <details>
   <summary>Answer</summary>

   Every toast adds a **new `resize` listener that is never removed**, and each listener keeps its `toast` element alive, even after it has been removed from the page (a *detached DOM node*). Fix: use `{ once: true }`, or pass a `signal` and abort it when the toast goes away.
   </details>

## ⚠️ Mistakes everyone makes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| `addEventListener` with no matching removal | Listeners pile up and keep things alive | `{ signal }` + `abort()` |
| `setInterval` with no `clearInterval` | The timer runs for ever | Keep the id and clear it |
| A global `Map` used as a cache with no limit | Memory grows for ever | Limit its size (LRU), or use `WeakMap` for object keys |
| Holding removed DOM elements in a variable | They stay in memory | Drop the reference |
| Optimising before measuring | Wasted effort, harder code | Measure first (`console.time`, DevTools) |
| Debouncing something that needs instant feedback | The UI feels laggy | Debounce only where waiting is fine (search, save) |
| Creating `Intl.*Format`, `RegExp`, or workers inside a hot loop | Slow | Create once, reuse |
| Forgetting a debounced call is still pending when you tear down | It runs later on a dead page | `.cancel()` it |

## ✅ Checkpoint

- [ ] The search box filters the menu once I stop typing, and shows a message when nothing matches
- [ ] With `?debug`, the Console prints `draw menu took ... ms`
- [ ] The kitchen board says `(took ... s)` when an order is ready
- [ ] `node --expose-gc playground.js` showed `before: true true` and `after: false` in the `WeakMap` experiment
- [ ] I can explain garbage collection as "the robot takes what nobody can reach"
- [ ] I can name four common leaks: listeners, timers, growing caches, detached DOM nodes
- [ ] I know when to use `WeakMap` and `WeakRef`
- [ ] I can write debounce and throttle, and I know which suits which job
- [ ] I measure with `console.time` and `performance.mark/measure` before optimising
- [ ] I make every long-lived thing (listener, timer, observer) stoppable from one cleanup

**Files in your project now:** everything from Step 19, plus `src/perf.js`. `src/menu.js`, `index.html`, `styles.css`, `src/board.js`, and `src/main.js` have grown.

**Next:** [Step 21: Security](21-security.md)
