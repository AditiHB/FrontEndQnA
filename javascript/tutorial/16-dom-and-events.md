# Step 16: DOM & Events - The Family Tree of the Page

> **Like I'm 5:** The DOM is a family tree of the page. Each element is a family member. `querySelector` finds a person by their name tag. An event is a shout in the house, and it travels up from the room where it started to every room above.

| | |
|---|---|
| **Concept lesson** | [16. DOM & events](../concepts/16-dom-and-events.md) |
| **Time** | About 90 minutes (this is a big, fun one) |
| **You will build** | **The real Lemonade Stand web page**: a menu with Add buttons, a cart, an order form, and a live kitchen board |
| **Files you touch** | `tools/serve.js`, `playground.html`, `playground.js`, `index.html`, `styles.css`, `src/ui.js`, `src/main.js` |
| **Before** | [Step 15: Error handling](15-error-handling.md) |

## Words to know

| Word | Like I'm 5 |
|------|------------|
| **DOM** | The page as a family tree of objects that JavaScript can touch. |
| **Element** | One member of the tree: a `<button>`, a `<li>`, a `<h1>`... |
| **Selector** | A name tag you use to find an element: `#menu`, `.row`, `h1.title`. |
| **Event** | Something that happened: a click, a key press, a form submit. |
| **Listener** | A function waiting for one kind of event on one element. |
| **Bubbling** | An event starts at the element you touched and floats **up** to its parents. |
| **Capturing** | The trip **down** from the top to the target, before bubbling starts. |
| **Event delegation** | One listener on a parent handles events for all its children. |
| **`preventDefault()`** | "Stop the browser from doing its normal thing." |
| **XSS** | A stranger sneaking their own script into your page (Step 21). |

---

## 1. The big idea

When a browser loads `index.html`, it builds a tree in memory, **the DOM**. Each tag becomes an object you can read and change from JavaScript, and when something happens, the browser tells you with an **event**.

```text
 document
 └── html
     └── body
         ├── header#top-bar
         │     └── h1#stand-name
         └── main
              └── ul#menu
                   ├── li.row  (data-id="lemonade")
                   │     └── button  ← you click here!
                   └── li.row  ...

 The click starts at the button and BUBBLES up:  button → li → ul → main → body → document
```

Two jobs for JavaScript on a page:

1. **Change the tree** (add rows, change text, switch classes).
2. **Listen for events** (clicks, typing, submits) and react.

---

## 2. A web server for your files

Up to now we opened `index.html` by double-clicking. That worked for one plain script. But **ES modules** (Step 9) are blocked by browsers when opened from a file, as a safety rule. We need a **web server**: a program that hands out files when a browser asks.

You don't need to understand this file yet. It is a tiny helper (about 40 lines) that uses Node.js's built-in networking (remember from Step 1: Node's kitchen has *networking*!). In Step 22 a professional tool will replace most of it.

📄 **Create `tools/serve.js`**

```js
// tools/serve.js - a tiny web server so the browser can load our files.
// Start it with: node tools/serve.js     (stop it with Ctrl+C)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const port = Number(process.env.PORT ?? 3000);

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

const server = createServer(async (request, response) => {
  const { pathname } = new URL(request.url, 'http://localhost');
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
      'Cache-Control': 'no-store',
    });
    response.end(body);
  } catch {
    response.writeHead(404).end('Not found');
  }
});

server.listen(port, () => {
  console.log(`Lemonade Stand is open at http://localhost:${port}`);
});
```

▶️ **Run (skip):** `node tools/serve.js`

👀 **You should see something like:**

```text
Lemonade Stand is open at http://localhost:3000
```

**Leave this terminal running.** Open a **second** terminal window (in the same folder) for any other commands. To stop the server later, click in its window and press `Ctrl+C`.

(The `catch {` with no name in brackets is allowed when you don't need the error. Here every failure just means "no such file".)

---

## 3. Play: find, change, create

We need a page to play in. This one is a throwaway.

📄 **Create `playground.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Playground</title>
    <link rel="icon" href="data:," />
    <script type="module" src="/playground.js"></script>
  </head>
  <body>
    <h1 class="title">Playground</h1>

    <div id="outer">
      outer
      <div id="inner">
        inner
        <button id="save">Save</button>
      </div>
    </div>

    <ul id="list">
      <li class="item" data-id="1">One</li>
      <li class="item" data-id="2">Two</li>
      <li class="item" data-id="3">Three</li>
    </ul>
  </body>
</html>
```

📄 **Replace `playground.js`**

```js
// Finding elements
const title = document.querySelector('h1.title'); // the FIRST match
const items = document.querySelectorAll('.item'); // ALL matches (a NodeList)
console.log('Found:', title.textContent);
console.log('How many items?', items.length, items instanceof NodeList);
console.log(document.getElementById('list').children.length);

// Changing elements
title.textContent = 'Hello from JavaScript!'; // safe: treated as plain text
title.classList.add('active');
title.setAttribute('aria-expanded', 'true');
title.style.color = 'teal';

// Creating elements
const card = document.createElement('li');
card.textContent = 'Four';
document.querySelector('#list').append(card);

console.log('Now', document.querySelectorAll('li').length, 'items');
console.log(title.className, title.getAttribute('aria-expanded'), title.style.color);
console.log('data-id of the first item is', items[0].dataset.id);
```

Open **http://localhost:3000/playground.html** in your browser, open the developer tools (`F12`), and look at the **Console** tab. You should also see the title on the page change to "Hello from JavaScript!" in teal.

▶️ **Run (skip):** open http://localhost:3000/playground.html and read the Console

👀 **You should see something like:**

```text
Found: Playground
How many items? 3 true
3
Now 4 items
title active true teal
data-id of the first item is 1
```

- `querySelector(selector)` gives the **first** match or `null`. `querySelectorAll(selector)` gives **all** matches as a `NodeList` (array-like: has `forEach` and `length`, but no `map`. Use `[...list]` to turn it into a real array).
- `textContent` sets plain text. **Always prefer it over `innerHTML` when the text comes from a person**, because `innerHTML` would treat their text as page code (XSS, Step 21).
- In HTML, `data-id="1"` becomes `element.dataset.id` in JavaScript. A handy place to hide small facts on an element.

---

## 4. Play: events, bubbling, and capturing

An event starts at the thing you touched (the **target**). First it travels **down** from the top (capturing), then it **bubbles up**.

📄 **Replace `playground.js`**

```js
const outer = document.querySelector('#outer');
const inner = document.querySelector('#inner');
const button = document.querySelector('#save');

outer.addEventListener('click', () => console.log('outer (bubbling up)'));
inner.addEventListener('click', () => console.log('inner (bubbling up)'));
button.addEventListener('click', (event) => {
  console.log('button clicked! target is', event.target.id);
});

// { capture: true } listens on the way DOWN instead
outer.addEventListener('click', () => console.log('outer (capturing, on the way DOWN)'), {
  capture: true,
});

button.click(); // pretend a person clicked the button
```

Refresh the playground page and read the Console:

▶️ **Run (skip):** refresh http://localhost:3000/playground.html and read the Console

👀 **You should see:**

```text
outer (capturing, on the way DOWN)
button clicked! target is save
inner (bubbling up)
outer (bubbling up)
```

```text
   capture ↓  outer ─────────────┐
              inner              │
              button  ← target   │
   bubble  ↑  inner              │
              outer ─────────────┘
```

Most of the time you only care about bubbling. It is what makes the next trick possible.

### Event delegation (one listener for many)

Say a list has 100 rows. Do we need 100 listeners? And what about rows added **later**? No: put **one** listener on the parent. Clicks on any child bubble up to it, and `event.target.closest(...)` tells you which child was clicked.

📄 **Replace `playground.js`**

```js
const list = document.querySelector('#list');

list.addEventListener('click', (event) => {
  const item = event.target.closest('.item'); // find the .item at or above the click
  if (!item) return; // the click was on something else
  console.log('You picked item', item.dataset.id, '-', item.textContent);
});

// An item added LATER works too, with no new listener
const later = document.createElement('li');
later.className = 'item';
later.dataset.id = '99';
later.textContent = 'Added later';
list.append(later);

document.querySelector('.item').click();
later.click();
```

▶️ **Run (skip):** refresh http://localhost:3000/playground.html and read the Console

👀 **You should see:**

```text
You picked item 1 - One
You picked item 99 - Added later
```

Delegation uses less memory and automatically handles rows that are added or removed later. **Use it for lists.** We use it in the build below.

### Taking listeners away

📄 **Replace `playground.js`**

```js
const button = document.querySelector('#save');
const controller = new AbortController();

button.addEventListener('click', () => console.log('saved!'), { signal: controller.signal });

button.click(); // prints "saved!"
controller.abort(); // removes the listener (and any others given the same signal)
button.click(); // prints nothing
console.log('after abort, nothing more was saved');
```

▶️ **Run (skip):** refresh http://localhost:3000/playground.html and read the Console

👀 **You should see:**

```text
saved!
after abort, nothing more was saved
```

Giving one `AbortController`'s signal to many listeners lets you remove them **all at once** with a single `abort()`. Very handy for cleaning up (Step 20).

| Listener option | What it does |
|-----------------|--------------|
| `{ capture: true }` | Listen on the way down |
| `{ once: true }` | Run once, then remove itself |
| `{ passive: true }` | Promise the browser you will **not** call `preventDefault()`, so scrolling can stay smooth. Use it for `scroll`, `touchstart`, `wheel`. |
| `{ signal }` | Remove the listener when the controller aborts |

> **Keep DOM work batched.** Reading a measurement (like `element.offsetHeight`) and then writing a style, again and again in a loop, forces the browser to recalculate the whole layout every time. This is called *layout thrashing*. Read everything first, then write everything.
> ```js
> // Slow: read, write, read, write...
> for (const box of boxes) box.style.height = box.offsetHeight + 10 + 'px';
> // Better: all the reads first, then all the writes
> const heights = boxes.map((box) => box.offsetHeight);
> boxes.forEach((box, i) => (box.style.height = heights[i] + 10 + 'px'));
> ```

---

## 5. Build: the Lemonade Stand web page

Four new files and one replaced. Take your time.

### A. The page (HTML)

This replaces the little page from Step 1. Notice `type="module"`: the browser will let our `import`s work.

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
  </body>
</html>
```

### B. The paint (CSS)

CSS is not our topic. Copy it as it is.

📄 **Create `styles.css`**

```css
/* styles.css - the paint. (CSS is not our topic; copy it as it is.) */
:root {
  --lemon: #facc15;
  --leaf: #15803d;
  --ink: #1f2937;
  --paper: #fffbeb;
  --card: #ffffff;
  --line: #e5e7eb;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: var(--ink);
  background: var(--paper);
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 12px 20px;
  background: var(--lemon);
  transition: box-shadow 0.2s;
}

.top-bar.scrolled {
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.25);
}

.top-bar h1,
.top-bar p {
  margin: 0;
}

.layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  padding: 16px 20px;
}

.panel {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 16px;
}

.panel h2 {
  margin-top: 0;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--line);
}

.row .label {
  flex: 1;
}

button {
  cursor: pointer;
  border: 0;
  border-radius: 8px;
  padding: 6px 12px;
  background: var(--leaf);
  color: white;
  font: inherit;
}

button:hover {
  filter: brightness(1.15);
}

.cart-total {
  font-weight: 700;
}

.order-form {
  display: grid;
  gap: 8px;
}

.order-form input[name='customer'] {
  width: 100%;
  padding: 6px;
}

[data-kind='error'] {
  color: #b91c1c;
}

.kitchen {
  margin: 0 20px 20px;
}

#board li {
  padding: 4px 0;
}

#board li.done {
  color: var(--leaf);
  font-weight: 700;
}

@media (max-width: 700px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
```

### C. Drawing helpers (`ui.js`)

This file knows how to **draw**: it turns data into elements. Every piece of text goes through `textContent`, never `innerHTML`.

📄 **Create `src/ui.js`**

```js
import { cartLines, cartSubtotal, lineTotal, toRupees } from './index.js';

// A tiny helper to build an element. `dataset` is handled separately because it cannot be assigned.
// Usage: el('li', { className: 'row' }, 'some text', anotherElement)
function el(tag, { dataset = {}, ...props } = {}, ...children) {
  const element = document.createElement(tag);
  Object.assign(element, props);
  Object.assign(element.dataset, dataset);
  element.append(...children);
  return element;
}

export function renderMenu(listElement, menu) {
  const rows = menu.map(({ id, name, emoji, pricePaise }) => {
    const button = el('button', { type: 'button', textContent: 'Add', dataset: { action: 'add' } });
    button.setAttribute('aria-label', `Add ${name} to cart`);
    return el(
      'li',
      { className: 'row', dataset: { id } },
      el('span', { className: 'label', textContent: `${emoji} ${name}` }),
      el('span', { textContent: `₹${toRupees(pricePaise)}` }),
      button,
    );
  });
  listElement.replaceChildren(...rows);
}

export function renderCart(listElement, totalElement, cart) {
  const rows = cartLines(cart).map(({ quantity, emoji, name, pricePaise }, index) => {
    const button = el('button', { type: 'button', textContent: '✕', dataset: { action: 'remove' } });
    button.setAttribute('aria-label', `Remove ${name} from cart`);
    return el(
      'li',
      { className: 'row', dataset: { index } },
      el('span', { className: 'label', textContent: `${quantity} x ${emoji} ${name}` }),
      el('span', { textContent: `₹${toRupees(lineTotal(pricePaise, quantity))}` }),
      button,
    );
  });
  listElement.replaceChildren(...rows);
  totalElement.textContent =
    cart.length === 0 ? 'Your cart is empty.' : `Total: ₹${toRupees(cartSubtotal(cart))}`;
}

export function setMessage(element, text, kind = 'info') {
  element.textContent = text;
  element.dataset.kind = kind;
}

export function addBoardLine(board, text) {
  const line = el('li', { textContent: text });
  board.append(line);
  return line;
}
```

### D. The page's brain (`main.js`)

Read the listeners slowly. Each one is a small named function. Find the **delegation**, the **`preventDefault`**, the **`{ passive: true }`**, and the **`signal`**.

📄 **Create `src/main.js`**

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
import { renderMenu, renderCart, setMessage, addBoardLine } from './ui.js';

const topBar = document.querySelector('#top-bar');
const menuList = document.querySelector('#menu');
const cartList = document.querySelector('#cart');
const cartTotal = document.querySelector('#cart-total');
const form = document.querySelector('#order-form');
const message = document.querySelector('#message');
const board = document.querySelector('#board');

// For now the page keeps its state in two plain variables. Step 18 organises this properly.
let cart = [];
const orderIds = orderNumbers();

// One controller removes EVERY listener below when the page goes away.
const cleanup = new AbortController();
const { signal } = cleanup;

function render() {
  renderCart(cartList, cartTotal, cart);
}

// Click on "Add": delegation. One listener on the whole list.
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

// Click on the little "x": delegation again.
function onCartClick(event) {
  const button = event.target.closest('button[data-action="remove"]');
  if (!button) return;
  const index = Number(button.closest('[data-index]').dataset.index);
  cart = cart.filter((_, position) => position !== index);
  render();
}

// Submit the order form.
async function onSubmit(event) {
  event.preventDefault(); // without this, the browser would reload the whole page
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
  setMessage(message, `Thank you, ${customer}! ${order.describe()}`);
  await watchKitchen(order);
}

// The kitchen board: stream the updates, then count down to pickup.
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

// A passive scroll listener, doing its DOM work once per frame with requestAnimationFrame.
let scrollQueued = false;
function onScroll() {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => {
    topBar.classList.toggle('scrolled', window.scrollY > 10);
    scrollQueued = false;
  });
}

// The last safety nets from Step 15.
window.addEventListener('error', (event) => console.error('Something broke:', event.error));
window.addEventListener('unhandledrejection', (event) => {
  console.error('A promise failed and nobody caught it:', event.reason);
});

// --- Start up ---
document.querySelector('#stand-name').textContent = stand.name;
document.querySelector('#stand-hours').textContent =
  `Open ${stand.hours.open}:00 to ${stand.hours.close}:00`;

renderMenu(menuList, menu);
render();

menuList.addEventListener('click', onMenuClick, { signal });
cartList.addEventListener('click', onCartClick, { signal });
form.addEventListener('submit', onSubmit, { signal });
window.addEventListener('scroll', onScroll, { passive: true, signal });
window.addEventListener('pagehide', () => cleanup.abort(), { once: true });
```

Now refresh. With the server still running, open **http://localhost:3000**.

▶️ **Run (skip):** open http://localhost:3000 and try the page

👀 **You should see something like:**

```text
┌─────────────────────────────────────────────────────────────┐
│ Sunny Lemonade Stand                       Open 9:00 to 17:00│
├────────────────────────────────────┬────────────────────────┤
│ Menu                               │ Your cart              │
│ 🍋 Lemonade           ₹40   [Add]  │ Your cart is empty.    │
│ 🥭 Mango Juice        ₹60   [Add]  │ Your name [          ] │
│ 🧊 Iced Tea           ₹50   [Add]  │ ☐ Take-away            │
│ 🍪 Choc Cookie        ₹25   [Add]  │ [Place order]          │
│ 🥪 Cheese Sandwich    ₹80   [Add]  │                        │
├────────────────────────────────────┴────────────────────────┤
│ Kitchen board                                               │
└─────────────────────────────────────────────────────────────┘
```

**Try the whole journey:**

1. Click **Add** on a few items. They appear in the cart and the total updates.
2. Click the **✕** on a cart line to remove it.
3. Click **Place order** with an empty cart. A red message appears.
4. Add a few things, type your name, and click **Place order**.
5. Watch the **Kitchen board**: dishes are called out one by one, then a countdown, then "ready! 🎉".

---

## 6. What just happened?

- **`querySelector` and `textContent`** found the page parts and put text in them. Every word a person could type goes through `textContent`, so it can never be mistaken for code.
- **`ui.js` builds the rows** with `createElement` (inside our `el` helper). It uses destructuring, rest, and `Object.assign` from Step 8. `replaceChildren(...rows)` swaps in the new rows in one go.
- **Delegation:** `onMenuClick` is the **only** listener for five Add buttons. `closest('button[data-action="add"]')` finds the button even if the click landed on text inside it. `closest('[data-id]').dataset.id` tells us which item.
- **`event.preventDefault()`** stopped the form from doing its default (sending itself to the server and reloading the page).
- **`FormData`** read the form's fields without us having to find each input.
- **The kitchen board** is the `for await` loop from Step 14 and the `PickupTimer` from Step 11 with its arrow-function `this` from Step 11, all working inside a real page.
- **`{ passive: true }`** promised the browser we never call `preventDefault()` on scroll, so it can scroll smoothly without waiting for us.
- **`requestAnimationFrame`** (Step 13!) waits for the browser's next paint. Scroll events can fire dozens of times per frame, so we use a flag (`scrollQueued`) to do our DOM work **once per frame**.
- **One `AbortController`** (`signal`) was handed to four listeners, so `cleanup.abort()` removes all of them when the page goes away.
- **`window.addEventListener('error' ...)`** is the last safety net from Step 15.

> **A rough edge, on purpose.** Click **Add** twice on lemonade. You get *two* lemonade lines instead of "2 x Lemonade". Our cart simply appends, so it also cannot notice that you added six sandwiches one click at a time when only five exist. We fix both properly in **Step 18**, the right way, without changing the old cart.

## 🧪 Try it yourself

1. In the browser's Console tab, type `document.querySelectorAll('#menu .row').length`. Is it 5?
2. Add a hover tooltip: in `ui.js`, give each menu `li` a `title` property such as `` `${stock} left` `` (also unpack `stock` from the menu item).
3. In DevTools, open the **Elements** tab and look at the tree. Find a menu `li` and its `data-id`.
4. **Break it on purpose.** In `main.js`, delete the line `event.preventDefault();` and submit the form. What happens to the page and to your cart? Put it back.
5. Add a second `signal`-less listener: `document.addEventListener('click', (e) => console.log(e.target))`, click around, and watch the Console. Which elements show up?
6. **Predict, then check.** What does this log if you click the ✕ button inside a cart row?
   ```js
   cartList.addEventListener('click', (e) => console.log(e.target.tagName, e.currentTarget.id));
   ```
   <details>
   <summary>Answer</summary>

   `BUTTON cart`. `event.target` is the thing you actually clicked (the button). `event.currentTarget` is the element the listener is attached to (the `ul#cart`). That difference is what delegation relies on.
   </details>

## ⚠️ Mistakes everyone makes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| `document.querySelector('#nope').textContent = 'x'` | `TypeError: Cannot set properties of null` | Check the selector. Is the script loaded after the element exists? |
| Using `innerHTML` with text from a person | Their text can run as code (XSS) | `textContent` |
| One listener per row of a big list | Slow and heavy | Delegate to the parent |
| Forgetting `event.preventDefault()` on a form | The page reloads and your state is lost | Call it first |
| `addEventListener('click', doIt())` | `doIt` runs now, and its **return value** becomes the listener | `addEventListener('click', doIt)` |
| `nodeList.map(...)` | `TypeError: nodeList.map is not a function` | `[...nodeList].map(...)` |
| Re-adding listeners every time you re-render | Listeners pile up and fire many times | Delegate once; or clean up with a signal |
| Mixing reads and writes of layout in a loop | Slow (layout thrashing) | Read first, then write |
| Using a regular `function` listener and expecting `this` to be your object | `this` is the element (Step 11) | Use an arrow function or `.bind` |

## ✅ Checkpoint

- [ ] `node tools/serve.js` is running and http://localhost:3000 shows the stand
- [ ] I can add items, remove items, place an order, and watch the kitchen board
- [ ] I can find elements with `querySelector(All)` and change them with `textContent`, `classList`, `setAttribute`, and `dataset`
- [ ] I can create and append elements
- [ ] I can explain bubbling and capturing
- [ ] I can write a delegated listener with `event.target.closest(...)`
- [ ] I know why `preventDefault()` matters on forms
- [ ] I know what `{ passive: true }` and `{ signal }` do
- [ ] I prefer `textContent` to `innerHTML` for anything a person typed
- [ ] I can say what layout thrashing is

**Files in your project now:** everything from Step 15, plus `tools/serve.js`, `playground.html`, `styles.css`, `src/ui.js`, `src/main.js`, and a new `index.html`

**Next:** [Step 17: Fetch & web APIs](17-fetch-and-web-apis.md)
