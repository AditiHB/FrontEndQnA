# Step 17: Fetch & Web APIs - The Messenger and the Browser's Toolbox

> **Like I'm 5:** `fetch` is a messenger you send to a faraway house, asking for something. The browser also gives you other helpers: a notebook that remembers things (`localStorage`), a timer that tells you when something is visible on the screen, and a cancel button for messages.

| | |
|---|---|
| **Concept lesson** | [17. Fetch & web APIs](../concepts/17-fetch-and-web-apis.md) |
| **Time** | About 90 minutes |
| **You will build** | A stand that **talks to a server** (saves orders, lists recent orders), **remembers** your cart and theme, reads `?table=5` from the address, loads sections **when you scroll to them**, and crunches the report in a **Web Worker** |
| **Files you touch** | `tools/headers.js` (new), `tools/serve.js`, `playground.js`, `src/api.js`, `src/storage.js`, `src/report-worker.js`, `index.html`, `styles.css`, `src/ui.js`, `src/main.js` |
| **Before** | [Step 16: DOM & events](16-dom-and-events.md) |

## Words to know

| Word | Like I'm 5 |
|------|------------|
| **`fetch`** | Send a messenger to another computer and wait for the answer. |
| **API** | A menu of things you can ask a server to do, such as `GET /api/orders`. |
| **Request / Response** | Your message / the answer you get back. |
| **Status code** | A number that says how it went: `200` fine, `404` not found, `500` server broke. |
| **JSON** | A text format for data: `JSON.stringify` makes text, `JSON.parse` reads it back. |
| **`localStorage`** | A notebook in the browser that remembers things even after you close the tab. |
| **`sessionStorage`** | A sticky note that is thrown away when the tab closes. |
| **Observer** | A helper that taps you on the shoulder when something changes (visible, resized...). |
| **Web Worker** | A **second cook** in a second kitchen, so heavy work does not freeze the page. |
| **Query string** | The `?table=5&sort=new` part of an address. |

---

## 1. The big idea

So far our stand lives entirely inside your browser tab. A real shop needs to:

1. **Talk to a server**: save the order somewhere safe.
2. **Remember** things between visits.
3. **Notice** what is happening on the page (is this section visible yet?).
4. **Do heavy work** without freezing the page.

The browser has a **toolbox of built-in tools** (the Web APIs from Step 1's "browser kitchen") for each job.

```text
   your page ──fetch──► server        (asks, waits, gets an answer)
       │
       ├── localStorage / sessionStorage   (a notebook and a sticky note)
       ├── IntersectionObserver / ResizeObserver   (taps on the shoulder)
       └── Web Worker ─── a second cook doing heavy work on the side
```

---

## 2. Give the server a few doors (an API)

To practise `fetch` we need something to talk to. We upgrade `tools/serve.js` so that, besides handing out files, it has three **API doors**:

| Request | What it does |
|---------|--------------|
| `GET /api/orders` | Returns the 10 newest orders as JSON |
| `POST /api/orders` | Saves a new order (sent as JSON) |
| `GET /api/slow` | Answers after 3 seconds. On purpose, so we can practise timeouts! |

Do not worry about the server details. Skim the comments. The server keeps orders in a plain array in memory (they vanish when you restart it).

📄 **Create `tools/headers.js`**

```js
// Extra headers added to EVERY answer the server gives. We will use this file again in Step 21.
export const baseHeaders = {
  'Cache-Control': 'no-store', // while developing, never reuse an old copy of a file
};
```

📄 **Replace `tools/serve.js`**

```js
// tools/serve.js - a tiny web server for our files AND a tiny pretend "orders" API.
// Start it with: node tools/serve.js     (stop it with Ctrl+C)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { baseHeaders } from './headers.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const port = Number(process.env.PORT ?? 3000);

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

// Our "database": a plain array in memory. It is emptied whenever the server restarts.
const orders = [];

function sendJson(response, status, data) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    ...baseHeaders,
  });
  response.end(JSON.stringify(data));
}

// A request body arrives in pieces. A request is an ASYNC ITERABLE (Step 14!), so we can `for await` it.
async function readJson(request) {
  let text = '';
  for await (const chunk of request) {
    text += chunk;
  }
  return JSON.parse(text);
}

async function handleApi(request, response, pathname) {
  if (pathname === '/api/orders' && request.method === 'GET') {
    return sendJson(response, 200, orders.toReversed().slice(0, 10)); // newest 10
  }

  if (pathname === '/api/orders' && request.method === 'POST') {
    let order;
    try {
      order = await readJson(request);
    } catch {
      return sendJson(response, 400, { error: 'That was not valid JSON' });
    }
    const goodName = typeof order?.customer === 'string' && order.customer.trim() !== '';
    const goodLines = Array.isArray(order?.lines) && order.lines.length > 0;
    if (!goodName || !goodLines) {
      return sendJson(response, 400, { error: 'An order needs a customer name and some lines' });
    }
    const saved = {
      id: orders.length + 1,
      customer: order.customer.trim(),
      takeAway: Boolean(order.takeAway),
      table: order.table ?? null,
      visitorId: order.visitorId ?? null,
      lines: order.lines,
      receivedAt: new Date().toISOString(),
    };
    orders.push(saved);
    return sendJson(response, 201, saved);
  }

  if (pathname === '/api/slow') {
    await new Promise((resolve) => setTimeout(resolve, 3000)); // on purpose: to practise timeouts
    return sendJson(response, 200, { ok: true });
  }

  return sendJson(response, 404, { error: 'No such API' });
}

async function serveFile(response, pathname) {
  const file = normalize(join(root, pathname === '/' ? 'index.html' : pathname));

  // Never serve anything outside our project folder.
  if (!file.startsWith(root)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  try {
    const body = await readFile(file);
    response.writeHead(200, {
      'Content-Type': contentTypes[extname(file)] ?? 'application/octet-stream',
      ...baseHeaders,
    });
    response.end(body);
  } catch {
    response.writeHead(404).end('Not found');
  }
}

const server = createServer(async (request, response) => {
  try {
    const { pathname } = new URL(request.url, 'http://localhost');
    if (pathname.startsWith('/api/')) {
      await handleApi(request, response, pathname);
    } else {
      await serveFile(response, pathname);
    }
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: 'Something went wrong on the server' });
  }
});

server.listen(port, () => {
  console.log(`Lemonade Stand is open at http://localhost:${port}`);
});
```

**Stop the server** (click its terminal and press `Ctrl+C`) and **start it again** so it picks up the new file.

▶️ **Run (skip):** `node tools/serve.js`

---

## 3. Play: `fetch` (GET, errors, and the big surprise)

We use the playground page from Step 16 (`http://localhost:3000/playground.html`) and read the **Console**.

📄 **Replace `playground.js`**

```js
const response = await fetch('/api/orders'); // ask the server for the orders
console.log(response.status, response.ok, response.headers.get('content-type'));
console.log(await response.json()); // read the answer body as JSON (you can only read it ONCE)

// THE BIG SURPRISE: a 404 does not make fetch throw!
const missing = await fetch('/api/nothing-here');
console.log('missing:', missing.status, missing.ok);

// fetch only throws when the NETWORK fails (no answer at all)
try {
  await fetch('http://localhost:1/');
} catch (error) {
  console.log('network failure:', error.name);
}
```

▶️ **Run (skip):** refresh http://localhost:3000/playground.html and read the Console

👀 **You should see something like:**

```text
200 true application/json; charset=utf-8
[]
missing: 404 false
network failure: TypeError
```

(Chrome may also print its own red lines about the 404 and the failed request. That is normal.)

**The rule:** `fetch` only **rejects** if the request could not be made at all (network down). If the server answers with *any* status, even `404` or `500`, `fetch` happily succeeds. **You must check `response.ok` yourself.**

| Status | Meaning |
|--------|---------|
| `200` | OK |
| `201` | Created (a POST that saved something) |
| `400` | Bad request (you sent something wrong) |
| `404` | Not found |
| `500` | The server had a problem |

### POST: sending JSON

📄 **Replace `playground.js`**

```js
const order = { customer: 'Asha', takeAway: false, lines: [{ itemId: 'lemonade', quantity: 2 }] };

const response = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }, // "my body is JSON"
  body: JSON.stringify(order), // turn the object into text
});
const saved = await response.json();
console.log(response.status, saved.id, saved.customer);

// A bad order: the server says 400 and explains why
const bad = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ customer: '' }),
});
console.log(bad.status, bad.ok, await bad.json());
```

▶️ **Run (skip):** refresh http://localhost:3000/playground.html and read the Console

👀 **You should see something like:**

```text
201 1 Asha
400 false { error: 'An order needs a customer name and some lines' }
```

(The `1` is the server's order number. It goes up each time you refresh, because the server remembers orders until it restarts.)

### Cancelling and timeouts with `AbortController`

What if the server never answers? A request without a timeout can hang for ever. `fetch` accepts a **`signal`**, and an `AbortController` is the cancel button (you met it in Step 16).

📄 **Replace `playground.js`**

```js
// 1. The manual way: an AbortController plus a timer
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 500); // cancel after half a second
try {
  await fetch('/api/slow', { signal: controller.signal }); // this answers after 3 seconds
} catch (error) {
  console.log('manual abort:', error.name);
} finally {
  clearTimeout(timer);
}

// 2. The modern shortcut
try {
  await fetch('/api/slow', { signal: AbortSignal.timeout(500) });
} catch (error) {
  console.log('AbortSignal.timeout:', error.name);
}
```

▶️ **Run (skip):** refresh http://localhost:3000/playground.html and read the Console

👀 **You should see:**

```text
manual abort: AbortError
AbortSignal.timeout: TimeoutError
```

Unlike the `Promise.race` timeout from Step 12, an aborted `fetch` **really stops** (the browser cancels the request). Always set a timeout for network calls.

---

## 4. Play: the notebook (`localStorage` and `sessionStorage`)

📄 **Replace `playground.js`**

```js
localStorage.setItem('play-theme', 'dark'); // stays even after closing the browser
console.log(localStorage.getItem('play-theme'));
console.log(localStorage.getItem('play-nothing')); // never saved: null

// Storage keeps TEXT only. Objects need JSON.
const cart = [{ itemId: 'lemonade', quantity: 2 }];
localStorage.setItem('play-cart', JSON.stringify(cart));
const loaded = JSON.parse(localStorage.getItem('play-cart'));
console.log(loaded, loaded[0].quantity + 1);

localStorage.setItem('play-count', 5); // the 5 becomes the text '5'
console.log(typeof localStorage.getItem('play-count'));

sessionStorage.setItem('play-draft', 'half-typed...'); // gone when this tab closes
console.log(sessionStorage.getItem('play-draft'));

for (const key of ['play-theme', 'play-cart', 'play-count']) {
  localStorage.removeItem(key); // tidy up after ourselves
}
sessionStorage.removeItem('play-draft');
```

▶️ **Run (skip):** refresh http://localhost:3000/playground.html and read the Console

👀 **You should see:**

```text
dark
null
[ {…} ] 3
string
half-typed...
```

(Chrome shows the array as `[{…}]` that you can expand with the little arrow.)

| | `localStorage` | `sessionStorage` |
|--|----------------|------------------|
| Lives until | You delete it | The tab closes |
| Shared between tabs of the same site? | Yes | No |
| Good for | Settings, a saved cart | A half-typed form |

> **Never store secrets in `localStorage`.** Any script on your page can read it (Step 21). It is for convenience data like a theme or a cart, not passwords or tokens.

---

## 5. Play: addresses, UUIDs, and cloning

📄 **Replace `playground.js`**

```js
const url = new URL('/api/orders?table=5&sort=new', location.origin);
console.log(url.pathname, url.searchParams.get('table'));

url.searchParams.set('table', '6'); // change one
url.searchParams.append('tag', 'a b'); // add one: spaces are encoded for us
console.log(url.search);

// Reading the ?table=... from THIS page's address
const params = new URLSearchParams(location.search);
console.log('table on this page:', params.get('table'));
console.log(Object.fromEntries(new URLSearchParams('a=1&b=2')));

// A unique id, made by the browser
const id = crypto.randomUUID();
console.log(id.length, id === crypto.randomUUID());

// A deep copy (you met this in Step 6)
const original = { inner: { n: 1 } };
const copy = structuredClone(original);
copy.inner.n = 99;
console.log(original.inner.n, copy.inner.n);
```

▶️ **Run (skip):** open http://localhost:3000/playground.html?table=3 and read the Console

👀 **You should see:**

```text
/api/orders 5
?table=6&sort=new&tag=a+b
table on this page: 3
{ a: '1', b: '2' }
36 false
1 99
```

- `URL` and `URLSearchParams` take care of encoding for you. **Never glue query strings together by hand.**
- `crypto.randomUUID()` makes an id that will never repeat in practice (`'3b241101-e2bb-4255-8caf-4136c566a962'`).
- `structuredClone` makes a deep copy (Step 6).
- `Intl.NumberFormat` and `Intl.DateTimeFormat` format numbers, money, and dates the way each country writes them. They deserve their own lesson: **Step 19**.
- `Web Workers` (just below) run heavy work off the main thread.

---

## 6. Play: observers (taps on the shoulder)

Instead of asking over and over "has it appeared yet?", you tell an **observer** what you care about, and it taps you **when it happens**.

📄 **Replace `playground.js`**

```js
// Make the page tall, with a paragraph far at the bottom
const spacer = document.createElement('div');
spacer.style.height = '2000px';
const target = document.createElement('p');
target.textContent = 'I am far down the page!';
document.body.append(spacer, target);

const seen = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    console.log('is the paragraph on screen?', entry.isIntersecting);
  }
});
seen.observe(target);

const resized = new ResizeObserver(([entry]) => {
  console.log('body width is now', Math.round(entry.contentRect.width));
});
resized.observe(document.body);
```

Refresh the playground page. The Console will already say `is the paragraph on screen? false` and the body width. Now **scroll down** and watch it become `true`. Then make the window narrower and watch the width.

▶️ **Run (skip):** refresh http://localhost:3000/playground.html, scroll down, resize the window, and read the Console

👀 **You should see something like:**

```text
body width is now 1000
is the paragraph on screen? false
is the paragraph on screen? true
body width is now 700
```

`IntersectionObserver` is perfect for **lazy loading** (loading something only when the user scrolls to it) and infinite scrolling. `ResizeObserver` tells you when an *element's* size changes, which media queries cannot do.

---

## 7. Play: a second cook (Web Workers)

A **Web Worker** runs JavaScript on a **separate thread**. It cannot touch the page (no `document`), but it can crunch numbers while the page stays smooth. You talk to it by **sending messages**.

📄 **Replace `playground.js`**

```js
// A worker is normally its own file. For a quick play we make one from text.
const workerCode = `
  self.onmessage = (event) => {
    let total = 0;
    for (let i = 0; i < event.data; i++) total += i; // heavy work, but NOT on the main thread
    self.postMessage(total);
  };
`;
const worker = new Worker(URL.createObjectURL(new Blob([workerCode], { type: 'text/javascript' })));

worker.onmessage = (event) => {
  console.log('worker says:', event.data);
  worker.terminate(); // the worker is finished, so stop it
};
worker.postMessage(1_000_000);

console.log('the main thread is still free!');
```

▶️ **Run (skip):** refresh http://localhost:3000/playground.html and read the Console

👀 **You should see:**

```text
the main thread is still free!
worker says: 499999500000
```

---

## 8. Build: connect everything to the stand

Eight changes. Each one is small.

### A. Talking to the server (`api.js`)

This file wraps `fetch` once, properly: **a timeout, an `ok` check, JSON parsing, and friendly errors** (using the error skills from Step 15). The rest of the app never has to repeat these chores.

📄 **Create `src/api.js`**

```js
import { StandError } from './errors.js';
import { TakeAwayOrder } from './order.js';
import { getVisitorId } from './storage.js';

// The server answered, but with a "not OK" status (like 400 or 500).
export class HttpError extends StandError {
  constructor(status, message) {
    super(message ?? `The server answered ${status}`);
    this.name = 'HttpError';
    this.status = status;
  }
}

// fetch() only throws when the network fails. A 404 or 500 is still a "successful" fetch,
// so we check response.ok ourselves, and we always set a timeout.
export async function fetchJson(url, { timeoutMs = 5000, ...options } = {}) {
  let response;
  try {
    response = await fetch(url, { ...options, signal: AbortSignal.timeout(timeoutMs) });
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new StandError(`The server took longer than ${timeoutMs}ms`, { cause: error });
    }
    throw new StandError('Could not reach the server', { cause: error });
  }

  const data = await response.json().catch(() => null); // not JSON? then no data
  if (!response.ok) {
    throw new HttpError(response.status, data?.error);
  }
  return data;
}

export function getOrders(options) {
  return fetchJson('/api/orders', options);
}

export function sendOrder(order, { table = null, ...options } = {}) {
  const payload = {
    visitorId: getVisitorId(),
    customer: order.customer,
    takeAway: order instanceof TakeAwayOrder,
    table,
    lines: order.lines.map(({ itemId, quantity }) => ({ itemId, quantity })),
  };
  return fetchJson('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    ...options,
  });
}
```

### B. The notebook (`storage.js`)

Storage can be missing (private windows), full, or hold **damaged text**. So every read and write is guarded, and a failure means "carry on without it", never "crash the page".

📄 **Create `src/storage.js`**

```js
import { findItem } from './menu.js';
import { defaultSettings, parseSettings } from './settings.js';

// Storage can be blocked or full, so every read and write is guarded.
function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage is full or blocked: carry on without saving
  }
}

export function loadCart() {
  try {
    const saved = JSON.parse(read('stand-cart') ?? '[]');
    // Only keep lines for items we still sell.
    return Array.isArray(saved) ? saved.filter((line) => findItem(line?.itemId)) : [];
  } catch {
    return []; // damaged text: start with an empty cart
  }
}

export function saveCart(cart) {
  write('stand-cart', JSON.stringify(cart));
}

export function loadSettings() {
  try {
    return parseSettings(read('stand-settings'));
  } catch (error) {
    console.warn(error.message, 'because', error.cause);
    return { ...defaultSettings };
  }
}

export function saveSettings(settings) {
  write('stand-settings', JSON.stringify(settings));
}

// An id for this browser, made once and remembered.
export function getVisitorId() {
  let id = read('stand-visitor');
  if (!id) {
    id = crypto.randomUUID();
    write('stand-visitor', id);
  }
  return id;
}

// sessionStorage is forgotten when the tab closes: perfect for a half-typed name.
export function loadDraftName() {
  try {
    return sessionStorage.getItem('stand-draft-name') ?? '';
  } catch {
    return '';
  }
}

export function saveDraftName(name) {
  try {
    sessionStorage.setItem('stand-draft-name', name);
  } catch {
    // ignore: a draft is a nice-to-have
  }
}
```

### C. The second cook (`report-worker.js`)

This is the end-of-day report from Step 13. This time it runs inside a worker, so even the simple, blocking `buildReport` cannot hurt the page.

📄 **Create `src/report-worker.js`**

```js
import { buildReport, makeSales } from './report.js';

// A worker has no `document` or `window`, only `self`. It talks by messages.
self.onmessage = (event) => {
  const { count } = event.data;
  self.postMessage(buildReport(makeSales(count)));
};
```

### D. New spots on the page

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

/* --- Step 17 additions --- */
.top-bar {
  gap: 12px;
  flex-wrap: wrap;
}

.top-bar button {
  background: #1f2937;
}

.wide {
  margin: 0 20px 20px;
}

.footer {
  padding: 0 20px 20px;
  color: #6b7280;
}

body.dark {
  --paper: #111827;
  --card: #1f2937;
  --ink: #f9fafb;
  --line: #374151;
}
```

### E. Drawing the new lists

📄 **Add to the bottom of `src/ui.js`**

```js

export function renderServerOrders(listElement, orders) {
  const rows = orders.map(({ id, customer, takeAway, table, lines }) => {
    const extras = [takeAway ? 'take-away' : null, table ? `table ${table}` : null].filter(Boolean);
    const suffix = extras.length > 0 ? ` (${extras.join(', ')})` : '';
    return el('li', {
      className: 'row',
      textContent: `#${id} ${customer}${suffix}: ${lines.length} line(s)`,
    });
  });
  if (rows.length === 0) {
    rows.push(el('li', { className: 'row', textContent: 'No orders yet.' }));
  }
  listElement.replaceChildren(...rows);
}

export function renderReport(listElement, { totalPaise, byItem }) {
  const rows = Object.entries(byItem).map(([itemId, paise]) =>
    el('li', { className: 'row', textContent: `${itemId}: ₹${toRupees(paise)}` }),
  );
  rows.unshift(el('li', { className: 'row', textContent: `Total: ₹${toRupees(totalPaise)}` }));
  listElement.replaceChildren(...rows);
}
```

### F. Wire it all together (`main.js`)

Look for: `await`/`try/catch` around the network, the `IntersectionObserver` that **lazy-loads** two sections, the `Worker`, the `ResizeObserver`, the **`URLSearchParams`**, and the notebook (`load...`/`save...`).

📄 **Replace `src/main.js`**

```js
import {
  stand,
  menu,
  addToCart,
  Order,
  TakeAwayOrder,
  StandError,
  orderNumbers,
  kitchenUpdates,
  PickupTimer,
} from './index.js';
import { getOrders, sendOrder } from './api.js';
import { loadCart, saveCart, loadSettings, saveSettings, loadDraftName, saveDraftName } from './storage.js';
import {
  renderMenu,
  renderCart,
  renderServerOrders,
  renderReport,
  setMessage,
  addBoardLine,
} from './ui.js';

const topBar = document.querySelector('#top-bar');
const tableInfo = document.querySelector('#table-info');
const themeButton = document.querySelector('#theme-toggle');
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

// State: still plain variables for now (Step 18). But now they remember between visits!
let cart = loadCart();
let settings = loadSettings();
const orderIds = orderNumbers();
const table = new URLSearchParams(location.search).get('table'); // from ?table=5

const cleanup = new AbortController();
const { signal } = cleanup;

function render() {
  renderCart(cartList, cartTotal, cart);
  saveCart(cart);
}

function applyTheme() {
  document.body.classList.toggle('dark', settings.theme === 'dark');
  themeButton.textContent = settings.theme === 'dark' ? 'Light' : 'Dark';
}

function onThemeClick() {
  settings = { ...settings, theme: settings.theme === 'dark' ? 'light' : 'dark' };
  saveSettings(settings);
  applyTheme();
}

function onMenuClick(event) {
  const button = event.target.closest('button[data-action="add"]');
  if (!button) return;
  const { id } = button.closest('[data-id]').dataset;
  try {
    cart = addToCart(cart, id);
    setMessage(message, '');
  } catch (error) {
    if (!(error instanceof StandError)) throw error;
    setMessage(message, error.message, 'error');
  }
  render();
}

function onCartClick(event) {
  const button = event.target.closest('button[data-action="remove"]');
  if (!button) return;
  const index = Number(button.closest('[data-index]').dataset.index);
  cart = cart.filter((_, position) => position !== index);
  render();
}

function onNameInput(event) {
  saveDraftName(event.target.value);
}

async function onSubmit(event) {
  event.preventDefault();
  if (cart.length === 0) {
    setMessage(message, 'Your cart is empty. Add something tasty first!', 'error');
    return;
  }

  const data = new FormData(form);
  const customer = String(data.get('customer')).trim() || 'friend';
  const OrderType = data.get('takeAway') ? TakeAwayOrder : Order;
  const order = OrderType.fromCart({ id: orderIds.next().value, customer, cart });

  cart = [];
  render();
  form.reset();
  saveDraftName('');
  setMessage(message, `Thank you, ${customer}! ${order.describe()}`);

  saveOnServer(order); // runs in the background and handles its own errors
  await watchKitchen(order);
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
    renderServerOrders(ordersList, await getOrders());
  } catch (error) {
    setMessage(message, `Could not load recent orders: ${error.message}`, 'error');
  }
}

// The report is heavy, so a Web Worker (a second cook) does it, and the page stays smooth.
function loadReport() {
  reportStatus.textContent = 'Crunching 1,000,000 sales in a Web Worker...';
  const worker = new Worker(new URL('./report-worker.js', import.meta.url), { type: 'module' });
  worker.onmessage = (event) => {
    reportStatus.textContent = 'Done!';
    renderReport(reportList, event.data);
    worker.terminate();
  };
  worker.onerror = () => {
    reportStatus.textContent = 'The report worker failed.';
    worker.terminate();
  };
  worker.postMessage({ count: 1_000_000 });
}

// Do `load` only the first time `element` scrolls into view.
function loadWhenVisible(element, load) {
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect(); // we only need this once
    load();
  });
  observer.observe(element);
  signal.addEventListener('abort', () => observer.disconnect(), { once: true });
}

async function watchKitchen(order) {
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
      status.textContent = `Order #${order.id} is ready! 🎉`;
      status.classList.add('done');
    },
  }).start();
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
  tableInfo.textContent = `Table ${table}`; // textContent: safe even if the address is hostile
}
form.elements.customer.value = loadDraftName(); // restore a half-typed name

applyTheme();
renderMenu(menuList, menu);
render();

menuList.addEventListener('click', onMenuClick, { signal });
cartList.addEventListener('click', onCartClick, { signal });
form.addEventListener('submit', onSubmit, { signal });
form.elements.customer.addEventListener('input', onNameInput, { signal });
themeButton.addEventListener('click', onThemeClick, { signal });
window.addEventListener('scroll', onScroll, { passive: true, signal });
window.addEventListener('pagehide', () => cleanup.abort(), { once: true });

loadWhenVisible(ordersSection, refreshOrders);
loadWhenVisible(reportSection, loadReport);

const resizeObserver = new ResizeObserver(([entry]) => {
  const width = Math.round(entry.contentRect.width);
  // Change the page in the NEXT frame. Changing it right here can make the page resize again
  // inside the observer, and the browser would complain about a "ResizeObserver loop".
  requestAnimationFrame(() => {
    layoutInfo.textContent = `Page width: ${width}px (${width < 700 ? 'narrow' : 'wide'} layout)`;
  });
});
resizeObserver.observe(document.body);
signal.addEventListener('abort', () => resizeObserver.disconnect(), { once: true });
```

Make sure the server is running (restart it if you have not since Part 2), then reload **http://localhost:3000/?table=5**.

▶️ **Run (skip):** open http://localhost:3000/?table=5 and try the page

**Try the whole journey:**

1. The header shows **Table 5**. Change the address to `?table=9`: it changes.
2. Add things to the cart, then **reload the page**. Your cart is still there!
3. Click **Dark**, then reload. The theme is remembered.
4. Start typing a name, reload. The name is still there (but it disappears if you close the tab).
5. Place an order. Watch the message change to "saved on the server as #1", and the **Recent orders** list update.
6. Scroll to the bottom. The **report** says "Crunching..." and then shows totals. The page stays smooth while it works.
7. Resize the window and watch "Page width" at the bottom change.
8. **Stop the server** (`Ctrl+C`), then place an order. You should see a friendly error ("Could not reach the server") instead of a broken page.

---

## 9. What just happened?

- **`api.js`** is the one place that knows how to talk to the server. It adds a **timeout** (`AbortSignal.timeout`), checks **`response.ok`**, reads **JSON**, and turns every failure into a friendly `StandError` with the real reason kept as `cause`. The rest of the app just says `await sendOrder(order)`.
- **`JSON.stringify` / `JSON.parse`** moved the cart in and out of `localStorage` (text only). `loadCart` also checks the saved data is **trustworthy**: it is an array, and every line is for an item we still sell. Saved data can be old or damaged.
- **`URLSearchParams`** read `?table=5`, and we showed it with `textContent`, so even a hostile address cannot inject code (Step 21 shows what happens otherwise).
- **`IntersectionObserver`** loads "recent orders" and the report **only when you scroll to them**, and disconnects after the first time.
- **The Web Worker** ran the 1,000,000-sale report on its own thread. The page never froze, even though we used the simple `buildReport` that would have blocked a normal page.
- **`ResizeObserver`** tells us the page size without us asking over and over. We update the text inside `requestAnimationFrame`, because writing it right away changes the page height, which would trigger the observer again in the same frame (the browser reports that as a "ResizeObserver loop" error; we met it for real while testing this tutorial). We also disconnect it through the same `signal` as our other cleanup.
- `saveOnServer(order)` is called **without `await`** on purpose: saving online and the kitchen board happen **at the same time**, and `saveOnServer` handles its own errors (so no forgotten rejections).
- `crypto.randomUUID()` made a visitor id (remembered in `localStorage`) so the server could tell browsers apart.

## 🧪 Try it yourself

1. Visit `http://localhost:3000/api/orders` directly in your browser. You see the raw JSON your page was reading.
2. In `api.js`, change the timeout in `getOrders` calls to `1` millisecond (`getOrders({ timeoutMs: 1 })` in `refreshOrders`). What message do you see? Put it back.
3. In the Console, type `JSON.parse(localStorage.getItem('stand-cart'))` to see your saved cart. Then run `localStorage.setItem('stand-cart', '{{{broken')` and reload. Does the page survive? (It should: `loadCart` catches the damage and starts with an empty cart.)
4. Place two orders, then look at the **Recent orders** list. Which one is on top?
5. **Predict, then run.** What does this print in the Console?
   ```js
   const r = await fetch('/api/orders');
   await r.json();
   console.log(await r.json());
   ```
   <details>
   <summary>Answer</summary>

   An error: `TypeError: Failed to execute 'json' on 'Response': body stream already read`. A response body can be read **only once**. Call `.json()` once and keep the result.
   </details>

## ⚠️ Mistakes everyone makes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| Assuming `fetch` rejects on `404`/`500` | Your code treats an error page as success | Check `response.ok` |
| No timeout | A slow server freezes your UI's spinner for ever | `AbortSignal.timeout(ms)` |
| Forgetting `JSON.stringify` and the `Content-Type` header on POST | The server gets `[object Object]` | Send `JSON.stringify(data)` with `'Content-Type': 'application/json'` |
| Reading the response body twice | `TypeError: ... body stream already read` | Read once and keep the value |
| Saving an object in `localStorage` directly | You get the text `"[object Object]"` | `JSON.stringify` / `JSON.parse` |
| Trusting what is in `localStorage` | Old or damaged data crashes the page | Parse in `try/catch` and validate the shape |
| Storing tokens or passwords in `localStorage` | Any script on the page can steal them | Do not (Step 21) |
| Building URLs by hand: `'?name=' + name` | Spaces and `&` break it | `URLSearchParams` / `URL` |
| Heavy loops on the main thread | Frozen page | A Web Worker |
| Forgetting `observer.disconnect()` | The observer keeps working for ever | Disconnect when done |
| Changing the page's size inside a `ResizeObserver` callback | `ResizeObserver loop completed with undelivered notifications` | Make the change in `requestAnimationFrame(...)` |

## ✅ Checkpoint

- [ ] The page remembers my cart, my name draft, and my theme after a reload
- [ ] `?table=5` shows "Table 5" in the header
- [ ] Placing an order saves it on the server, and the Recent orders list shows it
- [ ] With the server stopped, I get a friendly error and the page does not break
- [ ] The report appears when I scroll to it, and the page stays smooth
- [ ] I know `fetch` rejects only on network failure, so I check `response.ok`
- [ ] I can send JSON with `method`, `headers`, `body`
- [ ] I can cancel a request with `AbortController` or `AbortSignal.timeout`
- [ ] I know the difference between `localStorage` and `sessionStorage`, and that they only store text
- [ ] I can use `URL`, `URLSearchParams`, `crypto.randomUUID()`, and `structuredClone`
- [ ] I can use `IntersectionObserver` and `ResizeObserver`
- [ ] I can start a Web Worker and talk to it with `postMessage`

**Files in your project now:** everything from Step 16, plus `src/api.js`, `src/storage.js`, `src/report-worker.js`. `tools/serve.js`, `index.html`, `styles.css`, `src/ui.js`, and `src/main.js` have grown.

**Next:** [Step 18: Immutability & pure functions](18-immutability-and-pure-functions.md)
