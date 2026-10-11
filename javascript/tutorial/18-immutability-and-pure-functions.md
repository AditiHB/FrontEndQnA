# Step 18: Immutability & Pure Functions - The Drawing You Never Erase

> **Like I'm 5:** Imagine a drawing that you never erase. When you want a new picture, you copy the old one onto a new paper and change the copy. The old drawing stays the same, so everyone who looked at it still sees the same thing.

| | |
|---|---|
| **Concept lesson** | [18. Immutability & pure functions](../concepts/18-immutability-and-pure-functions.md) |
| **Time** | About 90 minutes |
| **You will build** | A **frozen menu**, a cart that **merges lines and checks stock** without changing anything old, a tiny **store** that notices changes, and a page where stock goes down when you buy |
| **Files you touch** | `playground.js`, `src/freeze.js` (new), `src/menu.js`, `src/errors.js`, `src/cart.js`, `src/store.js` (new), `src/index.js`, `src/ui.js`, `src/board.js` (new), `src/sections.js` (new), `src/main.js`, `styles.css`, `cli.js` |
| **Before** | [Step 17: Fetch & web APIs](17-fetch-and-web-apis.md) |

## Words to know

| Word | Like I'm 5 |
|------|------------|
| **Mutate** | Erase and rewrite on the same paper. |
| **Immutable** | The paper can never be erased. You make a new copy to change anything. |
| **Reference** | Which piece of paper a name points at. Two names can point at the **same** paper. |
| **Shallow vs deep** | Only the top layer, or every layer inside as well. |
| **Structural sharing** | The new picture re-uses the parts of the old one that did not change. |
| **Pure function** | Same input, same output, touches nothing outside (Step 4). |
| **Store** | One box that holds the whole app's data and tells you when it changes. |
| **Side effect** | Anything that reaches outside the function: the screen, the network, the clock. |

---

## 1. The big idea

Remember the surprise from Step 7? `cart.push(...)` changed the cart that *everybody* was looking at. The more parts of a program share the same data, the more dangerous it is to change that data in place.

**Immutability** is a simple promise: **never change data in place. Make a changed copy.**

```text
 MUTATING (risky)                       IMMUTABLE (safe)
 ┌────────┐                             ┌────────┐      ┌────────┐
 │ cart   │ ◄── you AND the page        │ cart A │      │ cart B │ ◄── the new one
 │ [🍋🍋] │     both hold this           │ [🍋🍋] │      │ [🍋🍋🍋]│
 └────────┘     and you rewrite it       └────────┘      └────────┘
                                          still [🍋🍋]    (A is untouched)
```

Why it is worth the effort:

1. **Predictable.** A value cannot change behind your back.
2. **Cheap change detection.** If it is a **new object** (`!==`), something changed. If it is the **same object** (`===`), nothing did. React, Angular `OnPush`, and signals all rely on this.
3. **Safe sharing** between functions, components, and a store.

---

## 2. Play: two names, one array

📄 **Replace `playground.js`**

```js
const original = [1, 2, 3];
const alias = original; // NOT a copy: two names for the same array
alias.push(4);
console.log(original);
console.log(original === alias);

const copy = [...original]; // a real copy
copy.push(5);
console.log(original, copy);
console.log(original === copy);
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
[ 1, 2, 3, 4 ]
true
[ 1, 2, 3, 4 ] [ 1, 2, 3, 4, 5 ]
false
```

Changing `alias` changed `original`, because **they were never two things**. Objects and arrays are handed around by **reference** (like a pointer to the paper), not copied.

### Changing without mutating

📄 **Replace `playground.js`**

```js
const state = { items: [1, 2], loading: false };

// Mutating (avoid): changes the object everyone shares
// state.items.push(3);
// state.loading = true;

// Immutable (prefer): build a new object
const next = { ...state, items: [...state.items, 3], loading: true };
console.log(state, next);

// The same idea for lists
const list = [1, 2, 3];
console.log(list.filter((x) => x !== 2)); // remove
console.log(list.map((x) => (x === 2 ? 20 : x))); // update
console.log(list.with(1, 20)); // replace by index (ES2023)
console.log([...list.slice(0, 1), ...list.slice(2)]); // remove by index
console.log(list.toSorted((a, b) => b - a)); // sorted copy
console.log(list); // the original never changed

// Structural sharing: the new object re-uses the parts that did not change
const before = { name: 'Asha', tags: ['a', 'b'] };
const after = { ...before, name: 'Asha R' };
console.log(before === after, before.tags === after.tags);
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
{ items: [ 1, 2 ], loading: false } { items: [ 1, 2, 3 ], loading: true }
[ 1, 3 ]
[ 1, 20, 3 ]
[ 1, 20, 3 ]
[ 1, 3 ]
[ 3, 2, 1 ]
[ 1, 2, 3 ]
false true
```

The last line is the clever part: `before === after` is `false` (a new object, so "something changed"), but `before.tags === after.tags` is `true` (the unchanged part was **shared**, not copied, so it is cheap).

| Instead of... | Use... |
|---------------|--------|
| `arr.push(x)` | `[...arr, x]` |
| `arr.splice(i, 1)` | `arr.filter(...)` or `arr.toSpliced(i, 1)` |
| `arr[i] = x` | `arr.with(i, x)` or `arr.map(...)` |
| `arr.sort()` | `arr.toSorted()` |
| `arr.reverse()` | `arr.toReversed()` |
| `obj.key = x` | `{ ...obj, key: x }` |
| `delete obj.key` | `const { key, ...rest } = obj` |

### Freezing: a lock on the paper

📄 **Replace `playground.js`**

```js
const config = Object.freeze({ env: 'prod', nested: { debug: false } });

try {
  config.env = 'dev'; // modules are strict, so this THROWS
} catch (error) {
  console.log(`${error.name}: ${error.message}`);
}

config.nested.debug = true; // freeze is SHALLOW: the inner box is not locked!
console.log(config.nested.debug);

// A helper that locks every layer
function deepFreeze(value) {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const inner of Object.values(value)) {
      deepFreeze(inner);
    }
  }
  return value;
}

const solid = deepFreeze({ env: 'prod', nested: { debug: false } });
try {
  solid.nested.debug = true;
} catch (error) {
  console.log(`${error.name}: ${error.message}`);
}
console.log(Object.isFrozen(solid.nested));
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
TypeError: Cannot assign to read only property 'env' of object '#<Object>'
true
TypeError: Cannot assign to read only property 'debug' of object '#<Object>'
true
```

`Object.freeze` is a **safety net**: it turns a silent bug into a loud error. It does not make you immutable. *You* still have to write code that makes copies.

### Pure functions, again

A function is **pure** when the same inputs always give the same output *and* it changes nothing outside itself. Pure functions are the easiest code in the world to test.

📄 **Replace `playground.js`**

```js
// IMPURE: changes the array it was given
function addImpure(cart, item) {
  cart.push(item);
  return cart;
}

// PURE: builds a new array and leaves the old one alone
function addPure(cart, item) {
  return [...cart, item];
}

const cart = ['🍋'];
const a = addPure(cart, '🍪');
console.log(cart, a); // cart is unchanged

const b = addImpure(cart, '🍪');
console.log(cart, b === cart); // oops: cart changed, and b is the very same array
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
[ '🍋' ] [ '🍋', '🍪' ]
[ '🍋', '🍪' ] true
```

> **The golden pattern: a pure core and an imperative shell.** Put your decisions (maths, validation, "what is the new cart?") in **pure functions**. Put the messy outside world (screen, network, clock, storage) in a thin outer layer that calls them. The core is easy to test; the shell is small enough to check by eye.

---

## 3. Build: make the stand immutable and pure

We make a long list of changes. They all serve one idea. Take them one at a time.

### The plan

| Piece | What changes |
|-------|--------------|
| **The menu** | Deeply frozen: nobody can change a price. `stock` moves **out** of the menu, because stock *changes* and the menu does not. |
| **Stock** | A plain object `{ lemonade: 10, ... }` that we **replace** with a new one after each sale. |
| **The cart** | `addToCart` merges same-item lines and **checks stock including what is already in the cart**. New `setQuantity` and `removeFromCart`. All pure. |
| **The store** | One place for the page's data. `update(fn)` takes the old state and **must return a new one**. It only tells listeners if the reference changed. |
| **The page** | `main.js` becomes a thin shell. Drawing, kitchen board, and lazy sections get their own files. |

### A. A deep-freeze helper

📄 **Create `src/freeze.js`**

```js
// Freeze a value and everything inside it. (Object.freeze alone only freezes the top level.)
export function deepFreeze(value) {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const inner of Object.values(value)) {
      deepFreeze(inner);
    }
  }
  return value;
}
```

### B. A frozen menu, and stock kept separately

📄 **Replace `src/menu.js`**

```js
import { deepFreeze } from './freeze.js';

// The menu never changes while the app runs, so we freeze it. Nobody can change a price by accident.
const menu = deepFreeze([
  {
    id: 'lemonade',
    name: 'Lemonade',
    emoji: '🍋',
    pricePaise: 4000,
    category: 'drink',
  },
  {
    id: 'mango',
    name: 'Mango Juice',
    emoji: '🥭',
    pricePaise: 6000,
    category: 'drink',
  },
  {
    id: 'iced-tea',
    name: 'Iced Tea',
    emoji: '🧊',
    pricePaise: 5000,
    category: 'drink',
  },
  {
    id: 'cookie',
    name: 'Choc Cookie',
    emoji: '🍪',
    pricePaise: 2500,
    category: 'snack',
  },
  {
    id: 'sandwich',
    name: 'Cheese Sandwich',
    emoji: '🥪',
    pricePaise: 8000,
    category: 'snack',
  },
]);

// How many of each item we start the day with. This starting note never changes either.
// (Stock that goes down as we sell lives in the store as a NEW object each time.)
export const initialStock = deepFreeze({
  lemonade: 10,
  mango: 8,
  'iced-tea': 6,
  cookie: 12,
  sandwich: 5,
});

export function findItem(itemId) {
  return menu.find((item) => item.id === itemId);
}

export default menu;
```

(`describeItem` has left this file. Menu **data** lives here. How to *display* a price is somebody else's job, and we improve that in Step 19.)

### C. Errors that know how many are really left

📄 **Replace `src/errors.js`**

```js
// The base: anything our stand complains about.
export class StandError extends Error {
  constructor(message, options) {
    super(message, options); // `options` can carry { cause }
    this.name = 'StandError';
  }
}

export class InvalidQuantityError extends StandError {
  constructor(value) {
    super(`"${value}" is not a good number of items`);
    this.name = 'InvalidQuantityError';
    this.value = value;
  }
}

export class UnknownItemError extends StandError {
  constructor(itemId) {
    super(`We do not sell "${itemId}"`);
    this.name = 'UnknownItemError';
    this.itemId = itemId;
  }
}

export class OutOfStockError extends StandError {
  constructor(item, requested, available) {
    super(`Only ${available} ${item.name} left (you asked for ${requested})`);
    this.name = 'OutOfStockError';
    this.itemId = item.id;
  }
}
```

### D. A pure cart

Every function here returns a **new** value and changes **nothing**. Read `setQuantity` slowly. It is the heart of the cart.

📄 **Replace `src/cart.js`**

```js
import { InvalidQuantityError, OutOfStockError, UnknownItemError } from './errors.js';
import { findItem, initialStock } from './menu.js';
import { lineTotal } from './money.js';

// Typed text in, a good whole number out, or an InvalidQuantityError.
export function parseQuantity(text) {
  const quantity = Number(text);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new InvalidQuantityError(text);
  }
  return quantity;
}

function quantityInCart(cart, itemId) {
  return cart.find((line) => line.itemId === itemId)?.quantity ?? 0;
}

// Remove an item. If it was not in the cart, give back the SAME cart (nothing changed).
export function removeFromCart(cart, itemId) {
  const next = cart.filter((line) => line.itemId !== itemId);
  return next.length === cart.length ? cart : next;
}

// Make the quantity of one item exactly `quantity` (0 removes it). Returns a NEW cart.
export function setQuantity(cart, itemId, quantity, stock = initialStock) {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new InvalidQuantityError(quantity);
  }
  const item = findItem(itemId);
  if (!item) {
    throw new UnknownItemError(itemId);
  }
  const available = stock[itemId] ?? 0;
  if (quantity > available) {
    throw new OutOfStockError(item, quantity, available);
  }
  if (quantity === 0) {
    return removeFromCart(cart, itemId);
  }
  if (quantityInCart(cart, itemId) === 0) {
    return [...cart, { itemId, quantity }];
  }
  return cart.map((line) => (line.itemId === itemId ? { ...line, quantity } : line));
}

// Add some more of an item. Same items MERGE into one line, and stock includes what is in the cart.
export function addToCart(cart, itemId, quantity = 1, stock = initialStock) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new InvalidQuantityError(quantity);
  }
  return setQuantity(cart, itemId, quantityInCart(cart, itemId) + quantity, stock);
}

// After an order, how much is left? Returns a NEW stock object.
export function reduceStock(stock, lines) {
  const next = { ...stock }; // it is fine to change a copy that nobody else has seen yet
  for (const { itemId, quantity } of lines) {
    next[itemId] = (next[itemId] ?? 0) - quantity;
  }
  return next;
}

export function cartSubtotal(cart) {
  return cart.reduce(
    (sum, { itemId, quantity }) => sum + lineTotal(findItem(itemId).pricePaise, quantity),
    0,
  );
}

// Turn cart lines into "snapshot" lines that remember name and price at this moment.
export function cartLines(cart) {
  return cart.map(({ itemId, quantity }) => {
    const { name, emoji, pricePaise, category } = findItem(itemId);
    return { itemId, name, emoji, pricePaise, category, quantity };
  });
}
```

Notice `removeFromCart` returns the **same cart** when nothing was removed. That small detail matters: callers can use `===` to know that nothing changed.

### E. The store

A store is a closure (Step 5) that holds the state. The only way to change it is `update`, and `update` insists you **return a new state**.

📄 **Create `src/store.js`**

```js
import { deepFreeze } from './freeze.js';

// A tiny store. The state is frozen, so changing it in place is impossible.
export function createStore(initialState) {
  let state = deepFreeze(structuredClone(initialState));
  const listeners = new Set();

  return {
    getState: () => state,

    // `change` gets the old state and must RETURN a new one. It must never edit the old one.
    update(change) {
      const next = change(state);
      if (next === state) return; // the same reference means "nothing changed": tell nobody
      state = deepFreeze(next);
      for (const listener of listeners) {
        listener(state);
      }
    },

    // Returns a function that unsubscribes.
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
```

### F. Share the new names

📄 **Replace `src/index.js`**

```js
// The front desk: one place to import everything from.
export { stand } from './stand.js';
export { default as menu, initialStock, findItem } from './menu.js';
export { discountRules } from './discounts.js';
export { createCashbox } from './cashbox.js';
export { orderNumbers } from './order-numbers.js';
export {
  addToCart,
  setQuantity,
  removeFromCart,
  reduceStock,
  cartSubtotal,
  cartLines,
  parseQuantity,
} from './cart.js';
export { Order, TakeAwayOrder } from './order.js';
export { PickupTimer } from './pickup-timer.js';
export { createStore } from './store.js';
export { deepFreeze } from './freeze.js';
export { defaultSettings, parseSettings } from './settings.js';
export * from './errors.js';
export * from './kitchen.js';
export * from './report.js';
export * from './money.js'; // re-export EVERYTHING that money.js shares
```

### G. The command line, with immutability on show

📄 **Replace `cli.js`**

```js
// cli.js - the Lemonade Stand, version 0.14 (now with immutable data!)
import {
  stand,
  menu,
  initialStock,
  createCashbox,
  orderNumbers,
  addToCart,
  removeFromCart,
  reduceStock,
  parseQuantity,
  Order,
  TakeAwayOrder,
  StandError,
  kitchenUpdates,
  toRupees,
  lineTotal,
} from './src/index.js';

const orderIds = orderNumbers();
const nextOrderNumber = () => orderIds.next().value;
const cashbox = createCashbox();

const menuLine = ({ emoji, name, pricePaise }) => `${emoji} ${name} - ₹${toRupees(pricePaise)}`;

function placeOrder(OrderType, { customer, cart, discountNames = [] }) {
  const order = OrderType.fromCart({ id: nextOrderNumber(), customer, cart, discountNames });
  cashbox.deposit(order.total);

  console.log(order.describe());
  for (const { quantity, emoji, name, pricePaise } of order) {
    console.log(`  ${quantity} x ${emoji} ${name} = ₹${toRupees(lineTotal(pricePaise, quantity))}`);
  }
  const { subtotal, afterDiscounts, tax } = order;
  console.log(
    `  Items ₹${toRupees(subtotal)}, after discounts ₹${toRupees(afterDiscounts)}, tax ₹${toRupees(tax)}`,
  );
  return order;
}

// Add to the cart. If it goes wrong in a way WE know about, tell the customer and keep the old cart.
function tryToAdd(cart, itemId, typedQuantity, stock) {
  try {
    return addToCart(cart, itemId, parseQuantity(typedQuantity), stock);
  } catch (error) {
    if (error instanceof StandError) {
      console.log(`  Oops (${error.name}): ${error.message}`);
      return cart;
    }
    throw error;
  }
}

// Dynamic import (Step 9): the banner file is only loaded if asked: node cli.js --banner
if (process.argv.includes('--banner')) {
  const { showBanner } = await import('./src/banner.js');
  showBanner(stand);
}

// --- Open the stand ---
console.log(stand.describe());
console.log('--- Menu ---');
for (const item of menu) {
  console.log(`${menuLine(item)}  (${initialStock[item.id]} in stock)`);
}

// --- Immutability in action ---
console.log('--- Immutability ---');
try {
  menu[0].pricePaise = 1; // the menu is deep-frozen
} catch (error) {
  console.log('The menu is frozen:', error.name);
}
const cartA = addToCart([], 'lemonade', 2);
const cartB = addToCart(cartA, 'lemonade', 1);
console.log('cartA quantity:', cartA[0].quantity, '| cartB quantity:', cartB[0].quantity);
console.log('Same cart?', cartA === cartB);
console.log('Remove something that is not there, same cart?', removeFromCart(cartB, 'mango') === cartB);

// --- A customer shops, and some things go wrong ---
console.log('--- Shopping ---');
let stock = initialStock;
let cart = [];
cart = tryToAdd(cart, 'lemonade', '2', stock);
cart = tryToAdd(cart, 'cookie', '1', stock);
cart = tryToAdd(cart, 'lemonade', '1', stock); // merges into the lemonade line
cart = tryToAdd(cart, 'pizza', '1', stock);
cart = tryToAdd(cart, 'sandwich', '50', stock);
cart = tryToAdd(cart, 'mango', 'banana', stock);
cart = tryToAdd(cart, 'sandwich', '1', stock);
console.log('Cart has', cart.length, 'lines');

// --- Orders. After each one, we make a NEW stock object. ---
const first = placeOrder(Order, { customer: 'Asha', cart });
stock = reduceStock(stock, first.lines);
const second = placeOrder(TakeAwayOrder, {
  customer: 'Ravi',
  cart: tryToAdd([], 'cookie', '4', stock),
  discountNames: ['kids', 'happyHour'],
});
stock = reduceStock(stock, second.lines);
console.log('Lemonade left:', initialStock.lemonade, '->', stock.lemonade);
console.log('Cookies left:', initialStock.cookie, '->', stock.cookie);
console.log('Cash box now holds ₹' + toRupees(cashbox.balance));

// --- The kitchen calls out each dish as it is finished ---
console.log('--- Kitchen board ---');
for await (const update of kitchenUpdates(first)) {
  console.log('  ' + update);
}
first.markReady();
console.log(`Order #${first.id} is ready! 🎉 (status: ${first.status})`);
```

▶️ **Run:** `node cli.js`

👀 **You should see:**

```text
Sunny Lemonade Stand, open 9:00 to 17:00
--- Menu ---
🍋 Lemonade - ₹40  (10 in stock)
🥭 Mango Juice - ₹60  (8 in stock)
🧊 Iced Tea - ₹50  (6 in stock)
🍪 Choc Cookie - ₹25  (12 in stock)
🥪 Cheese Sandwich - ₹80  (5 in stock)
--- Immutability ---
The menu is frozen: TypeError
cartA quantity: 2 | cartB quantity: 3
Same cart? false
Remove something that is not there, same cart? true
--- Shopping ---
  Oops (UnknownItemError): We do not sell "pizza"
  Oops (OutOfStockError): Only 5 Cheese Sandwich left (you asked for 50)
  Oops (InvalidQuantityError): "banana" is not a good number of items
Cart has 3 lines
Order #1 for Asha: 3 line(s), total ₹236.25
  3 x 🍋 Lemonade = ₹120
  1 x 🍪 Choc Cookie = ₹25
  1 x 🥪 Cheese Sandwich = ₹80
  Items ₹225, after discounts ₹225, tax ₹11.25
Order #2 for Ravi: 1 line(s), total ₹80.6 [take-away, includes ₹5 box fee]
  4 x 🍪 Choc Cookie = ₹100
  Items ₹100, after discounts ₹72, tax ₹3.6
Lemonade left: 10 -> 7
Cookies left: 12 -> 7
Cash box now holds ₹316.85
--- Kitchen board ---
  🍋 Lemonade x3 is ready
  🍪 Choc Cookie x1 is ready
  🥪 Cheese Sandwich x1 is ready
Order #1 is ready! 🎉 (status: ready)
```

### H. The page: draw, watch the kitchen, load sections

The page's code now follows the **pure core / imperative shell** idea. Three new small files hold the side-effect-heavy parts, so `main.js` only wires things together.

📄 **Replace `src/ui.js`**

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

function actionButton(text, action, label, disabled = false) {
  const button = el('button', { type: 'button', textContent: text, disabled, dataset: { action } });
  button.setAttribute('aria-label', label);
  return button;
}

export function renderMenu(listElement, menu, stock) {
  const rows = menu.map(({ id, name, emoji, pricePaise }) => {
    const left = stock[id] ?? 0;
    return el(
      'li',
      { className: 'row', dataset: { id } },
      el('span', { className: 'label', textContent: `${emoji} ${name}` }),
      el('span', { className: 'stock', textContent: `${left} left` }),
      el('span', { textContent: `₹${toRupees(pricePaise)}` }),
      actionButton(left > 0 ? 'Add' : 'Sold out', 'add', `Add ${name} to cart`, left === 0),
    );
  });
  listElement.replaceChildren(...rows);
}

export function renderCart(listElement, totalElement, cart) {
  const rows = cartLines(cart).map(({ itemId, quantity, emoji, name, pricePaise }) =>
    el(
      'li',
      { className: 'row', dataset: { id: itemId } },
      el('span', { className: 'label', textContent: `${emoji} ${name}` }),
      actionButton('−', 'dec', `Fewer ${name}`),
      el('span', { className: 'qty', textContent: String(quantity) }),
      actionButton('+', 'inc', `More ${name}`),
      el('span', { textContent: `₹${toRupees(lineTotal(pricePaise, quantity))}` }),
      actionButton('✕', 'remove', `Remove ${name} from cart`),
    ),
  );
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

📄 **Create `src/board.js`**

```js
import { PickupTimer, kitchenUpdates } from './index.js';
import { addBoardLine } from './ui.js';

// The kitchen board: stream the updates, then count down to pickup.
export async function watchKitchen(board, order) {
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
```

📄 **Create `src/sections.js`**

```js
import { StandError } from './errors.js';

// Do `load` only the first time `element` scrolls into view.
export function loadWhenVisible(element, load, { signal } = {}) {
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect(); // we only need this once
    load();
  });
  observer.observe(element);
  signal?.addEventListener('abort', () => observer.disconnect(), { once: true });
}

// Run the end-of-day report in a Web Worker (a second cook) and wrap it in a promise.
export function runReportInWorker(count) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./report-worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = (event) => {
      resolve(event.data);
      worker.terminate();
    };
    worker.onerror = () => {
      reject(new StandError('The report worker failed'));
      worker.terminate();
    };
    worker.postMessage({ count });
  });
}
```

📄 **Add to the bottom of `styles.css`**

```css

/* --- Step 18 additions --- */
.stock {
  color: #6b7280;
  font-size: 0.85rem;
}

.qty {
  min-width: 1.5em;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
```

### I. `main.js`: the store wires it together

Read it top to bottom. The page's data lives in **one frozen state**: `{ cart, stock, settings }`. Handlers do not change it. They call `store.update(...)` with a function that **returns a new state**. `render` compares slices with `!==` and redraws only what changed.

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
import { getOrders, sendOrder } from './api.js';
import {
  loadCart,
  saveCart,
  loadSettings,
  saveSettings,
  loadDraftName,
  saveDraftName,
} from './storage.js';
import {
  renderMenu,
  renderCart,
  renderServerOrders,
  renderReport,
  setMessage,
} from './ui.js';
import { watchKitchen } from './board.js';
import { loadWhenVisible, runReportInWorker } from './sections.js';

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

// ONE place for the page's data. Its state is frozen: it can only be replaced, never edited.
const store = createStore({ cart: loadCart(), stock: initialStock, settings: loadSettings() });
const orderIds = orderNumbers();
const table = new URLSearchParams(location.search).get('table');

const cleanup = new AbortController();
const { signal } = cleanup;

function applyTheme({ theme }) {
  document.body.classList.toggle('dark', theme === 'dark');
  themeButton.textContent = theme === 'dark' ? 'Light' : 'Dark';
}

// Redraw ONLY what changed. A new reference (!==) means "this part changed".
let shown = {};
function render(state) {
  if (state.stock !== shown.stock) renderMenu(menuList, menu, state.stock);
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

// Run an update. If it fails in a way we know about, show the message and keep the old state.
function change(update) {
  try {
    store.update(update);
    setMessage(message, '');
  } catch (error) {
    if (!(error instanceof StandError)) throw error;
    setMessage(message, error.message, 'error');
  }
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

function onNameInput(event) {
  saveDraftName(event.target.value);
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

  // One update: empty the cart AND take the bought items out of stock (a NEW stock object).
  store.update((state) => ({ ...state, cart: [], stock: reduceStock(state.stock, order.lines) }));
  form.reset();
  saveDraftName('');
  setMessage(message, `Thank you, ${customer}! ${order.describe()}`);

  saveOnServer(order); // runs in the background and handles its own errors
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
    renderServerOrders(ordersList, await getOrders());
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

store.subscribe(render); // from now on, every change redraws what changed
render(store.getState()); // and draw once to begin with

menuList.addEventListener('click', onMenuClick, { signal });
cartList.addEventListener('click', onCartClick, { signal });
form.addEventListener('submit', onSubmit, { signal });
form.elements.customer.addEventListener('input', onNameInput, { signal });
themeButton.addEventListener('click', onThemeClick, { signal });
window.addEventListener('scroll', onScroll, { passive: true, signal });
window.addEventListener('pagehide', () => cleanup.abort(), { once: true });

loadWhenVisible(ordersSection, refreshOrders, { signal });
loadWhenVisible(reportSection, loadReport, { signal });

const resizeObserver = new ResizeObserver(([entry]) => {
  const width = Math.round(entry.contentRect.width);
  requestAnimationFrame(() => {
    layoutInfo.textContent = `Page width: ${width}px (${width < 700 ? 'narrow' : 'wide'} layout)`;
  });
});
resizeObserver.observe(document.body);
signal.addEventListener('abort', () => resizeObserver.disconnect(), { once: true });
```

Reload **http://localhost:3000** and try:

▶️ **Run (skip):** open http://localhost:3000 and try the page

**Try the journey:**

1. Click **Add** on lemonade three times: **one** line, quantity 3 (it merges now).
2. Use **+**, **−**, and **✕** on the cart line.
3. Click **Add** on sandwiches six times. After five, you get a red message and the sixth is refused. Stock **includes what is in your cart**.
4. Place an order. The menu's "left" numbers drop, and a sold-out item gets a disabled **Sold out** button.
5. Reload the page. Your cart stays (we save it), but the **stock numbers reset**, because we only save the cart and the settings. (A real stand would keep stock on its server. Could you add a `GET /api/stock` door to `tools/serve.js` as a challenge?)

---

## 4. What just happened?

- **The menu is deep-frozen.** In `cli.js`, `menu[0].pricePaise = 1` threw a `TypeError` instead of silently corrupting a price. Modules are strict, so frozen objects *shout*.
- **`addToCart` is pure.** `cartA` still said `2` after we built `cartB` with `3`. Neither call changed anything it was given. The merge uses `map` + spread (`{ ...line, quantity }`), and the only new line uses `[...cart, newLine]`.
- **Same reference when nothing changed.** `removeFromCart(cartB, 'mango') === cartB` is `true`. That is what lets the store (and later frameworks) skip work.
- **Stock is state, not menu data.** `reduceStock` makes a *new* stock object. The original `initialStock` is still `10` for lemonade (`10 -> 7`).
- **`store.update(fn)`** passes the old frozen state to `fn`, which returns a new one. If `fn` returns the **same** object, no listener is called. If it **throws** (like `OutOfStockError`), the state is untouched and the page shows the message.
- **`render` compares `state.cart !== shown.cart`.** That single `!==` is the whole change-detection trick behind React's `useState`, Angular's `OnPush`, and signals.
- **Pure core, imperative shell.** `cart.js`, `store.js`, `money.js`, `order.js` never touch the screen or network. `ui.js`, `board.js`, `sections.js`, `api.js`, `storage.js`, and `main.js` do all the messy outside-world work. The pure part is easy to test (Step 22!).
- Notice that `runReportInWorker` is **Step 12's receipt idea**: it wraps the worker's callbacks into a promise.

## 🧪 Try it yourself

1. In `cli.js`, add `cartB.push({ itemId: 'x', quantity: 1 })`. It works, since `addToCart` returned an ordinary array. Now temporarily add `store.getState().cart.push({ itemId: 'x', quantity: 1 });` to the end of `main.js`. What happens in the browser Console? (You get `TypeError: Cannot add property 0, object is not extensible`, because the state is frozen. Remove the line again.)
2. Add a `clearCart` helper to `src/cart.js` that returns `[]`. Why is it fine for it to return a **new** empty array each time? When would you rather return the same one? (Hint: change detection.)
3. Write `renameItem(menu, id, newName)` that returns a **new** menu with one item renamed, using `map` and spread. Test it in `playground.js`. Does the original `menu` stay the same?
4. **Predict, then run.** What does this print?
   ```js
   const a = { list: [1, 2] };
   const b = Object.freeze({ ...a });
   b.list.push(3);
   console.log(a.list, b.list === a.list);
   ```
   <details>
   <summary>Answer</summary>

   `[ 1, 2, 3 ] true`. Spread copies one level, so `b.list` is the **same array** as `a.list`. Freezing `b` locks only `b` itself. Push changes the shared array. Use `deepFreeze` and copy the inner array too.
   </details>

## ⚠️ Mistakes everyone makes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| `const copy = original` | Two names, one object | `[...original]` or `{ ...original }` |
| Spread and expecting a deep copy | Inner objects are still shared | `structuredClone`, or spread each level you change |
| Trusting `Object.freeze` to protect inner objects | Only the top level is locked | `deepFreeze` |
| `arr.sort()` / `arr.reverse()` on shared data | The shared array is reordered | `toSorted` / `toReversed` |
| A pure-looking function that secretly reads `Date.now()` or a global that changes | Not actually pure; hard to test | Pass the changing thing in as an argument |
| Returning a new object even when nothing changed | Needless re-renders | Return the same reference |
| Mutating inside the store's `update` function | Defeats change detection (and the frozen state throws) | Always return a new object |
| Over-copying huge data on every keystroke | Slow | Share unchanged parts (structural sharing); measure first |

## ✅ Checkpoint

- [ ] `node cli.js` prints the immutability section (`The menu is frozen: TypeError`, `cartA quantity: 2 | cartB quantity: 3`) and ends with the kitchen board saying `Lemonade x3`
- [ ] On the page, adding the same item merges into one line, and `+`, `−`, `✕` work
- [ ] On the page, I cannot add more of an item than the stock allows, and stock goes down after an order
- [ ] I can explain a **reference** and why `alias.push(4)` changed `original`
- [ ] I can update objects and arrays without mutating: spread, `map`, `filter`, `with`, `toSorted`
- [ ] I know `Object.freeze` is shallow and why `deepFreeze` exists
- [ ] I can say what makes a function pure
- [ ] I understand how `!==` on a new reference becomes change detection
- [ ] I can describe a "pure core and imperative shell"

**Files in your project now:** everything from Step 17, plus `src/freeze.js`, `src/store.js`, `src/board.js`, `src/sections.js`. `src/menu.js`, `src/errors.js`, `src/cart.js`, `src/index.js`, `src/ui.js`, `src/main.js`, and `cli.js` are rewritten.

**Next:** [Step 19: Strings, numbers & dates](19-strings-numbers-and-dates.md)
