# Step 21: Security - Don't Follow a Stranger's Note

> **Like I'm 5:** A stranger who sneaks a fake note into your lunch box is an attacker. Your job is to read notes carefully, never follow instructions from a stranger's note, and keep the lunch box closed.

| | |
|---|---|
| **Concept lesson** | [21. Security](../concepts/21-security.md) |
| **Time** | About 75 minutes |
| **You will build** | A **real attack** (so you understand it), then the defences: safe text, safe links, safe merging of saved settings, and a **Content Security Policy** |
| **Files you touch** | `playground.js`, `xss-lab.html` and `xss-lab.js` (temporary), `src/security.js` (new), `src/settings.js`, `tools/headers.js`, `index.html`, `styles.css`, `src/main.js` |
| **Before** | [Step 20: Performance & memory](20-performance-and-memory.md) |

> **A promise.** The "attacks" in this lesson run only against **your own** practice page on your own computer. Learning how an attack works is how you learn to stop it. Never try these on a site that is not yours.

## Words to know

| Word | Like I'm 5 |
|------|------------|
| **Untrusted input** | Anything a stranger could have written: form fields, the address bar, saved data, server answers. |
| **XSS** (cross-site scripting) | A stranger's note that your page **obeys as if it were your own instructions**. |
| **Escaping** | Turning dangerous characters (`<`, `>`, `&`...) into harmless text. |
| **Sanitizing** | Cleaning allowed HTML so only safe parts remain (use a library such as DOMPurify). |
| **CSP** (Content Security Policy) | A rulebook the server sends: "this page may only run scripts from here". |
| **Prototype pollution** | Sneaking a note into the **parent box of every object** (Step 6). |
| **HttpOnly cookie** | A secret the browser keeps for the server that your JavaScript cannot read. |

---

## 1. The big idea

Everything that comes **from outside** your code might be written by an attacker: what a person types, the `?name=` in the address, text saved in storage, even answers from a server. The rule is simple:

> **Treat all input as untrusted until you have checked it, and never let it become code.**

The most common way input becomes code is **XSS**:

```text
   a stranger types:   <img src=x onerror="stealEverything()">
                              │
   your page does:    element.innerHTML = thatText      ← "treat this as page code"
                              ▼
   the browser obeys: runs stealEverything() with YOUR page's powers
                      (reads localStorage, calls your server as the visitor, ...)
```

---

## 2. Play: escaping and safe links

📄 **Replace `playground.js`**

```js
// 1. Escaping: turn dangerous characters into harmless text
function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
console.log(escapeHtml('<img src=x onerror="alert(1)">'));

// 2. Links: a "link" can also be code. Only allow web addresses.
function safeUrl(value) {
  try {
    const url = new URL(value); // relative paths and nonsense throw an error
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

const candidates = [
  'https://example.com/party',
  'http://localhost:3000/',
  'javascript:alert(1)',
  'data:text/html,<h1>hi</h1>',
  '/relative/path',
  'not a url',
  null,
];
for (const candidate of candidates) {
  console.log(String(candidate).padEnd(28), '->', safeUrl(candidate));
}
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
&lt;img src=x onerror=&quot;alert(1)&quot;&gt;
https://example.com/party    -> https://example.com/party
http://localhost:3000/       -> http://localhost:3000/
javascript:alert(1)          -> null
data:text/html,<h1>hi</h1>   -> null
/relative/path               -> null
not a url                    -> null
null                         -> null
```

`javascript:alert(1)` is a **valid address** whose "page" is a script. `<a href="javascript:...">` runs it when clicked. That is why we only accept `http:` and `https:`. (Always an **allow-list** of good things, never a block-list of bad ones. Attackers are creative.)

---

## 3. Play: prototype pollution

Remember from Step 6: every plain object has the same parent, `Object.prototype`. Pollution means **writing something into that shared parent**, so *every* object in your program suddenly has it. It usually happens in code that **merges** two objects by looping over keys.

📄 **Replace `playground.js`**

```js
// A naive deep merge. Looks harmless!
function naiveMerge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      target[key] = naiveMerge(target[key] ?? {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// JSON.parse is allowed to create a key literally called "__proto__"
const evil = JSON.parse('{ "__proto__": { "isAdmin": true } }');
console.log('evil has its own key called __proto__?', Object.hasOwn(evil, '__proto__'));

naiveMerge({}, evil); // merge it into an ordinary object...
console.log('a brand new object is an admin?', {}.isAdmin); // ...and EVERY object is poisoned
delete Object.prototype.isAdmin; // clean up our own mess
console.log('after cleanup:', {}.isAdmin);

// The fix: refuse the dangerous keys (and never write into shared parents)
const dangerous = new Set(['__proto__', 'constructor', 'prototype']);
function safeMerge(target, source) {
  const result = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (dangerous.has(key)) continue;
    const bothPlain = value !== null && typeof value === 'object' && typeof result[key] === 'object';
    result[key] = bothPlain ? safeMerge(result[key], value) : value;
  }
  return result;
}
console.log({}.isAdmin, safeMerge({ theme: 'light' }, evil));

// Another fix: a dictionary with NO parent has nothing to pollute
const dictionary = Object.create(null);
dictionary['__proto__'] = 'just a normal key here';
console.log(Object.keys(dictionary), Object.getPrototypeOf(dictionary));
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
evil has its own key called __proto__? true
a brand new object is an admin? true
after cleanup: undefined
undefined { theme: 'light' }
[ '__proto__' ] null
```

Three defences: **skip** `__proto__`, `constructor`, and `prototype`; use `Object.create(null)` for dictionaries; or use a `Map`, which has no such trouble.

---

## 4. Play: a real XSS attack (on your own page)

We make a deliberately **vulnerable** practice page. It reads `?name=...` from the address and says hello. It does it three ways.

📄 **Create `xss-lab.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>XSS lab</title>
    <link rel="icon" href="data:," />
    <script type="module" src="/xss-lab.js"></script>
  </head>
  <body>
    <h1>XSS lab</h1>
    <p id="unsafe"></p>
    <p id="safe"></p>
  </body>
</html>
```

📄 **Create `xss-lab.js`**

```js
const name = new URLSearchParams(location.search).get('name') ?? 'friend';

// 1. DANGEROUS: the text is treated as page code
document.querySelector('#unsafe').innerHTML = `Hello, ${name}!`;

// 2. SAFE: the text is treated as plain text
document.querySelector('#safe').textContent = `Hello, ${name}!`;
```

Make sure the server is running. First a friendly visit:

▶️ **Run (skip):** open http://localhost:3000/xss-lab.html?name=Asha

You see "Hello, Asha!" twice. Now play the attacker. Paste this whole address into your browser:

```text
http://localhost:3000/xss-lab.html?name=<img src=x onerror="console.log('HACKED: a stranger just ran code on your page')">
```

▶️ **Run (skip):** open the address above and look at the Console

👀 **You should see something like:**

```text
HACKED: a stranger just ran code on your page
```

And on the page:

- The **first** line (the `innerHTML` one) *obeyed* the stranger: the browser built a broken `<img>` whose `onerror` ran **their** code.
- The **second** line (`textContent`) simply **showed the text** `<img src=x onerror=...>` as ordinary words. Nothing ran.

Here we only printed a message. A real attacker could read `localStorage`, send requests to your server **as the visitor**, or change the page. **That one line, `innerHTML = userText`, is the whole vulnerability.**

> **The #1 rule:** show people's text with **`textContent`** (or a framework template that escapes by default). Reach for `innerHTML` only with HTML **you** wrote, or after cleaning it with a trusted library like **DOMPurify**.

(Our real stand has been safe all along. Every word a person typed went through `textContent`. Try typing `<b>hi</b>` as your name on the stand page: you see the tags as text.)

---

## 5. Build: defences for the stand

### A. A small toolbox of safe helpers

📄 **Create `src/security.js`**

```js
// Turn text into HTML-safe text. Use it on the rare day you MUST build an HTML string.
export function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Only allow real web addresses. Anything else (javascript:, data:, nonsense) becomes null.
export function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

const dangerousKeys = new Set(['__proto__', 'constructor', 'prototype']);
const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

// Merge `source` INTO a copy of `target`, deeply, but refuse the keys that can poison every object.
export function safeMerge(target, source) {
  const result = structuredClone(target);
  for (const [key, value] of Object.entries(source)) {
    if (dangerousKeys.has(key)) continue;
    result[key] =
      isPlainObject(value) && isPlainObject(result[key]) ? safeMerge(result[key], value) : value;
  }
  return result;
}
```

### B. Saved settings are untrusted too

Text in `localStorage` can be edited by anyone who can reach the browser, by a browser extension, or by an old bug. We merge it with `safeMerge`, and we insist it is a plain object. (We also add a nested `notifications` setting so the *deep* merge has something to do.)

📄 **Replace `src/settings.js`**

```js
import { StandError } from './errors.js';
import { safeMerge } from './security.js';

export const defaultSettings = { theme: 'light', language: 'en', notifications: { sound: true } };

// Turn saved text into settings. Saved text is UNTRUSTED: it may be broken, or hostile.
export function parseSettings(text) {
  try {
    const saved = JSON.parse(text ?? '{}');
    if (saved === null || typeof saved !== 'object' || Array.isArray(saved)) {
      throw new TypeError('Settings must be an object');
    }
    return safeMerge(defaultSettings, saved);
  } catch (error) {
    throw new StandError('The saved settings are broken', { cause: error });
  }
}
```

### C. A Content Security Policy (CSP)

Even if you make a mistake somewhere, a **Content Security Policy** can stop the damage. It is a header the server sends that tells the browser what the page may load and run. Our rule: *only scripts from our own files*. That blocks inline `<script>` tags and `onerror="..."` attributes, exactly what XSS needs.

We also add two simple, safe headers. All three live in `tools/headers.js`, which every response already uses.

📄 **Replace `tools/headers.js`**

```js
// Extra headers added to EVERY answer the server gives.
export const baseHeaders = {
  'Cache-Control': 'no-store', // while developing, never reuse an old copy of a file

  // Content Security Policy: a rulebook for what this page may load and run.
  'Content-Security-Policy': [
    "default-src 'self'", // by default, only load things from our own site
    "script-src 'self'", // scripts only from our own FILES: no inline <script>, no onerror="..."
    "style-src 'self'", // styles only from our own files
    "img-src 'self' data:", // images from our site (and tiny data: icons)
    "connect-src 'self'", // fetch() only to our own site
    "worker-src 'self'", // Web Workers only from our own files
    "base-uri 'none'", // nobody can change where relative links point
    "form-action 'self'", // forms may only send data to our own site
    "frame-ancestors 'none'", // nobody may put our page inside their frame (clickjacking)
  ].join('; '),

  'X-Content-Type-Options': 'nosniff', // browsers must not guess a file's type
  'Referrer-Policy': 'no-referrer', // do not tell other sites where the visitor came from
};
```

### D. A "back" link that cannot be turned into an attack

The page will accept `?back=https://...` and show a link. The link only appears if `safeUrl` says the address is a normal web address.

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
      <a id="back-link" class="back" rel="noopener noreferrer" hidden>Back to the party page</a>
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

/* --- Step 21 additions --- */
.back {
  color: var(--ink);
}
```

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
import { safeUrl } from './security.js';
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
const backLink = document.querySelector('#back-link');
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

const applySearch = debounce((query) => {
  store.update((state) => ({ ...state, query }));
}, 250);

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
  tableInfo.textContent = `Table ${table}`; // textContent, never innerHTML: the address is untrusted
}

// The address is untrusted: show the "back" link only if it is a normal web address.
const backUrl = safeUrl(params.get('back'));
if (backUrl) {
  backLink.href = backUrl;
  backLink.hidden = false;
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

**Stop the server and start it again** so it uses the new headers.

▶️ **Run (skip):** `node tools/serve.js`

### E. Try the attack again (with the CSP on)

Open the attack address once more:

```text
http://localhost:3000/xss-lab.html?name=<img src=x onerror="console.log('HACKED: a stranger just ran code on your page')">
```

▶️ **Run (skip):** open the attack address and look at the Console

👀 **You should see something like:**

```text
Refused to execute inline event handler because it violates the following Content Security Policy directive: "script-src 'self'". ...
```

There is **no `HACKED` line any more**. The first line on the page is still built wrongly with `innerHTML`, but the browser **refused to run** the stranger's code. That is a **second layer of defence**. Fix your code *and* set a CSP.

You can see the headers your server sends. With the server running:

▶️ **Run (skip):** `node -e "fetch('http://localhost:3000/').then(r => console.log(r.headers.get('content-security-policy')))"`

👀 **You should see:**

```text
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; worker-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'
```

### F. Try the safe back link

- `http://localhost:3000/?back=https://example.com/party` shows a **Back to the party page** link.
- `http://localhost:3000/?back=javascript:alert(1)` shows **no link at all**.
- `http://localhost:3000/?table=<img src=x onerror=alert(1)>` shows the header **Table `<img src=x onerror=alert(1)>`** as plain text, because we use `textContent`.

Finally, **throw away the lab**. It was a deliberately broken page, and we do not want it hanging around.

🗑️ **Delete `xss-lab.html`**

🗑️ **Delete `xss-lab.js`**

---

## 6. What just happened?

- **`textContent` over `innerHTML`.** The vulnerable line and the safe line used the *same text*. The only difference was whether the browser treated it as code or as words.
- **An allow-list for links.** `safeUrl` does not try to spot bad things (`javascript:`, `data:`, `vbscript:`...). It only accepts the two good things (`http:` and `https:`).
- **Merging untrusted data safely.** `safeMerge` skips the three keys that can poison `Object.prototype`, and it works on a **copy** (`structuredClone`) so it never edits the defaults.
- **Saved settings are untrusted.** We insisted on a plain object and wrapped any failure in a friendly `StandError` with the real reason as `cause` (Step 15).
- **CSP is a seatbelt.** `script-src 'self'` means: *only run JavaScript from my own files*. Inline handlers and injected scripts are refused, even if some other bug lets them into the page. The other headers close small doors: `frame-ancestors 'none'` stops others from framing your page, `nosniff` stops file-type tricks, `no-referrer` stops leaking your address.
- **The CSP did not break the app.** The stand uses only its own files, `fetch` to its own server, a same-origin worker, and no inline styles or scripts, so every rule can be strict. (Your old `playground.html` experiment that made a worker from a `Blob` would now be **blocked**, and rightly so.)

### The short list of other rules

| Rule | Why |
|------|-----|
| **Never `eval(userText)` or `new Function(userText)`** | They turn text into code. |
| **Never put secrets in front-end code** | Anyone can read the bundle: API keys, passwords, private URLs. Keep secrets on the server. |
| **Keep tokens out of `localStorage` if you can** | Any script on the page can read it. Prefer **HttpOnly cookies** set by the server. |
| **Validate on the server too** | The browser can be bypassed. Our `serve.js` re-checks every order. |
| **Keep dependencies updated** | Run `npm audit` and keep packages current (Step 22). Review a new package before you add it. |
| **Set security headers on the server** | CSP and friends, as we just did. |
| **Treat server answers as untrusted** | If a server is hacked, its answers can contain hostile text. |

## 🧪 Try it yourself

1. On the stand page, type `<script>alert(1)</script>` as the customer name and place an order. What do you see in the message, the board, and the Recent orders list? (Text, nothing more.)
2. Temporarily change `tableInfo.textContent = ...` in `main.js` to `tableInfo.innerHTML = ...`, then visit `/?table=<img src=x onerror=alert(1)>`. With the CSP on, does the `alert` run? Now **take the CSP header away** (comment out the `Content-Security-Policy` line in `tools/headers.js`, restart the server, reload). What happens now? Put everything back.
   <details>
   <summary>Answer</summary>

   With the CSP, the browser refuses to run the inline `onerror`, and nothing pops up. Without the CSP, `alert(1)` runs: a **reflected XSS** attack, where a crafted link makes your page attack its own visitor. This is why both defences matter.
   </details>
3. In the Console, run `localStorage.setItem('stand-settings', '{"__proto__":{"polluted":true},"theme":"dark"}')`, reload, and then run `({}).polluted`. What do you get? (`undefined`: the dark theme loads, and nothing was poisoned.)
4. Add the `escapeHtml` function to the vulnerable line in `xss-lab.js` (you deleted it, so recreate it): `` innerHTML = `Hello, ${escapeHtml(name)}!` ``. Is the attack still possible?
5. **Predict, then run.** Which of these do you think `safeUrl` accepts?
   ```js
   safeUrl('HTTPS://EXAMPLE.COM/a b');
   safeUrl('  javascript:alert(1)');
   safeUrl('java\nscript:alert(1)');
   ```
   <details>
   <summary>Answer</summary>

   The first one: `https://example.com/a%20b` (the URL parser normalizes the case and the space). The other two give `null`: the parser strips the leading space and the newline *before* working out the scheme, so it correctly sees `javascript:`. This is why you should **always parse** a URL with `new URL(...)` and look at `url.protocol`, rather than checking the start of the text yourself.
   </details>

## ⚠️ Mistakes everyone makes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| `element.innerHTML = userText` | XSS | `textContent` |
| `<a href={userUrl}>` without checking | `javascript:` links run code | `safeUrl` (allow-list `http:`/`https:`) |
| Building HTML by gluing strings with user data | XSS | Create elements, or escape, or sanitize with DOMPurify |
| Checking only in the browser | Attackers skip the browser and talk to your server directly | Validate on the server |
| A blocklist of "bad words" (`<script>`) | Attackers use `<img onerror>`, `<svg onload>`... | Allow-lists and escaping |
| Merging objects with `for...in` and recursion | Prototype pollution | Skip `__proto__`/`constructor`/`prototype`; use `Map`/`Object.create(null)` |
| Secrets in the JS bundle | Everyone can read them | Keep them on the server |
| Tokens in `localStorage` | Stolen by any injected script | HttpOnly cookies |
| Setting a CSP with `'unsafe-inline'` everywhere | You lose the protection | Keep scripts in files; avoid inline code |
| Never updating packages | Known holes stay open | `npm audit`, update regularly |

## ✅ Checkpoint

- [ ] I ran the XSS lab, saw `HACKED` appear without a CSP, and saw it **blocked** with one
- [ ] The stand page shows hostile text (like `<img src=x onerror=...>`) as plain text everywhere
- [ ] `?back=javascript:alert(1)` shows no link; `?back=https://example.com` shows one
- [ ] The `Content-Security-Policy` header appears when I fetch the page
- [ ] I can explain XSS in one sentence, and why `textContent` is safe
- [ ] I can explain prototype pollution, and the three ways to avoid it
- [ ] I know why secrets do not belong in front-end code, and why tokens do not belong in `localStorage`
- [ ] I know about `npm audit` and keeping dependencies updated

**Files in your project now:** everything from Step 20, plus `src/security.js`. `src/settings.js`, `tools/headers.js`, `index.html`, `styles.css`, and `src/main.js` have changed. (The two XSS lab files are deleted again.)

**Next:** [Step 22: Tooling & testing](22-tooling-and-testing.md)
