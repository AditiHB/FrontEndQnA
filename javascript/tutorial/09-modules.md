# Step 9: Modules - Lunchboxes With a Share Slot

> **Like I'm 5:** A module is a lunchbox with a sticker that says what you're sharing. Everything inside stays private unless you put it in the "share" slot (`export`). Your friend opens your lunchbox with `import`.

| | |
|---|---|
| **Concept lesson** | [9. Modules](../concepts/09-modules.md) |
| **Time** | About 50 minutes |
| **You will build** | Version 0.8 of the stand: the one big `cli.js` is split into small, tidy files in a new `src/` folder |
| **Files you touch** | `package.json` (new), `playground.js`, `playground-helper.js` (temporary), 9 files in `src/`, `cli.js` |
| **Before** | [Step 8: Destructuring, spread & rest](08-destructuring-spread-and-rest.md) |

## Words to know

| Word | Like I'm 5 |
|------|------------|
| **Module** | One file that keeps its stuff private unless it shares it. |
| **`export`** | Putting a toy into the share slot. |
| **`import`** | Taking a shared toy from a friend's lunchbox. |
| **Named export** | A shared toy with its own name tag. A file can share many. |
| **Default export** | The one "main" toy of a file. |
| **Barrel file** | A front desk that hands out toys from many lunchboxes in one place. |
| **Dynamic import** | Fetching a toy only when you really need it. |
| **ES modules vs CommonJS** | The new way (`import`/`export`) and the old Node way (`require`/`module.exports`). |

---

## 1. The big idea

`cli.js` is now about 170 lines. It holds the menu, the money maths, the discount rules, the cash box... all jumbled in one room. Finding anything is slow, and two ideas that have nothing to do with each other sit side by side.

We will split it into **small files that each do one job**, and let them share only what they choose to.

```text
 BEFORE                        AFTER
 ┌──────────────┐              cli.js ──imports──► src/index.js (front desk)
 │              │                                      │
 │   cli.js     │                      ┌───────────────┼───────────────┐
 │  (everything)│                      ▼               ▼               ▼
 │              │                  stand.js         menu.js         cart.js ...
 └──────────────┘                  (each file is its own lunchbox)
```

---

## 2. Tell Node you are using modules

Node needs a note saying "my `.js` files use `import`/`export`". That note lives in a file called `package.json`, which is the **ID card** of your project. (Step 22 explains it fully.)

📄 **Create `package.json`**

```json
{
  "name": "lemonade-stand",
  "version": "1.0.0",
  "private": true,
  "type": "module"
}
```

`"type": "module"` is the important line.

---

## 3. Play: share and import

First a lunchbox with a few toys in it. This is a throwaway file.

📄 **Create `playground-helper.js`**

```js
// A tiny module for experiments
export const PI = 3.14159; // a named export

export function area(radius) {
  return PI * radius * radius;
}

export default function describe() {
  // the default export: the file's "main" toy
  return 'math helpers';
}

// A live value that changes
export let count = 0;
export function increment() {
  count += 1;
}

const secret = 'not shared'; // no "export", so nobody outside can see this
```

📄 **Replace `playground.js`**

```js
import describe, { PI, area, count, increment } from './playground-helper.js';
import * as math from './playground-helper.js'; // take the WHOLE lunchbox

console.log(describe()); // default import has no braces, and you pick its name
console.log(PI, area(2)); // named imports have braces and exact names

console.log(count);
increment();
console.log(count); // imports are LIVE: we see the new value

console.log(Object.keys(math));
console.log(math.secret); // not exported, so not there

// In a module there is no `require` or `module` (those are the old CommonJS way)
console.log(typeof require, typeof module, import.meta.url.startsWith('file://'));
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
math helpers
3.14159 12.56636
0
1
[ 'PI', 'area', 'count', 'default', 'increment' ]
undefined
undefined undefined true
```

What to notice:

- **Named exports** are imported with `{ braces }` and must match the exact name. **The default export** has no braces, and the importer picks any name.
- **Imports are live.** `count` is not a copy. When the helper changed it, we saw the new value.
- The file's private `secret` is not in the lunchbox's share list.
- Modules always run in **strict mode** (stricter rules, fewer silent mistakes). That is why, from now on, things like assigning to a frozen object throw an error instead of being ignored.
- `import.meta.url` is the module's own address, something only modules have.

Delete the throwaway helper now (right-click it in your editor and choose Delete):

🗑️ **Delete `playground-helper.js`**

### ES modules vs CommonJS

You will see both in the wild. Here is how to tell them apart:

| | ES modules (new) | CommonJS (old Node style) |
|--|-----------------|---------------------------|
| Syntax | `import x from './x.js'` / `export` | `const x = require('./x')` / `module.exports` |
| When is it loaded? | Analysed **before** running (static), so tools can remove unused code | While running (dynamic) |
| In browsers | Yes: `<script type="module">` | No |
| Strict mode | Always | Only if you ask |
| Needs `.js` in the path? | Yes (`'./math.js'`) | Optional |

### Loading on demand, and top-level `await` (an illustration)

You will see these two patterns in real web pages. (They are only illustrations. Our stand uses the same ideas in `cli.js` below.)

```js
// A big chart library is only downloaded when the person actually asks for it
button.addEventListener('click', async () => {
  const { default: chart } = await import('./chart.js'); // import() returns a promise
  chart.draw();
});

// Top-level await: only inside ES modules, no wrapper function needed
const config = await fetch('/config.json').then((response) => response.json());
```

---

## 4. Build: split the stand into modules

Each file gets one job. Type them one by one. Most of the code is exactly what you wrote before. We only add `export`, `import`, and a new home.

### The stand's details

📄 **Create `src/stand.js`**

```js
// The stand's details. Other files use: import { stand } from './stand.js'
export const stand = {
  name: 'Sunny Lemonade Stand',
  owner: { name: 'Asha', phone: null },
  hours: { open: 9, close: 17 },
  describe() {
    return `${this.name}, open ${this.hours.open}:00 to ${this.hours.close}:00`;
  },
};
```

### Money helpers

📄 **Create `src/money.js`**

```js
// Tiny money helpers. Money is always whole paise (100 paise = ₹1).
export function toRupees(paise) {
  return paise / 100;
}

export const lineTotal = (pricePaise, quantity) => pricePaise * quantity;
```

### The menu

This file imports from `money.js`, which shows one module using another. It has a **default export** (the menu) and **named exports** (helpers).

📄 **Create `src/menu.js`**

```js
import { toRupees } from './money.js';

const menu = [
  {
    id: 'lemonade',
    name: 'Lemonade',
    emoji: '🍋',
    pricePaise: 4000,
    category: 'drink',
    stock: 10,
  },
  {
    id: 'mango',
    name: 'Mango Juice',
    emoji: '🥭',
    pricePaise: 6000,
    category: 'drink',
    stock: 8,
  },
  {
    id: 'iced-tea',
    name: 'Iced Tea',
    emoji: '🧊',
    pricePaise: 5000,
    category: 'drink',
    stock: 6,
  },
  {
    id: 'cookie',
    name: 'Choc Cookie',
    emoji: '🍪',
    pricePaise: 2500,
    category: 'snack',
    stock: 12,
  },
  {
    id: 'sandwich',
    name: 'Cheese Sandwich',
    emoji: '🥪',
    pricePaise: 8000,
    category: 'snack',
    stock: 5,
  },
];

export function findItem(itemId) {
  return menu.find((item) => item.id === itemId);
}

export function describeItem({ emoji, name, pricePaise }) {
  return `${emoji} ${name} - ₹${toRupees(pricePaise)}`;
}

export default menu;
```

### Discounts

`makeDiscount` has no `export`. It is a private helper that no other file can touch. Only `discountRules` is shared.

📄 **Create `src/discounts.js`**

```js
// Not exported: only used inside this file. Other files cannot reach it.
function makeDiscount(percentOff) {
  return (amountPaise) => Math.round((amountPaise * (100 - percentOff)) / 100);
}

export const discountRules = {
  kids: makeDiscount(10),
  happyHour: makeDiscount(20),
};
```

### The cash box and the order counter

📄 **Create `src/cashbox.js`**

```js
export function createCashbox(startingPaise = 0) {
  let balancePaise = startingPaise;
  return {
    deposit(amountPaise) {
      balancePaise += amountPaise;
      return balancePaise;
    },
    get balance() {
      return balancePaise;
    },
  };
}
```

📄 **Create `src/order-numbers.js`**

```js
export function createOrderCounter(start = 0) {
  let last = start;
  return function nextOrderNumber() {
    last += 1;
    return last;
  };
}
```

### The cart

📄 **Create `src/cart.js`**

```js
import { findItem } from './menu.js';
import { lineTotal } from './money.js';

// Returns a NEW cart. The old cart is left alone.
export function addToCart(cart, itemId, quantity = 1) {
  return [...cart, { itemId, quantity }];
}

export function cartSubtotal(cart) {
  return cart.reduce(
    (sum, { itemId, quantity }) => sum + lineTotal(findItem(itemId).pricePaise, quantity),
    0,
  );
}
```

### The front desk (a barrel file)

Instead of making `cli.js` remember eight different file names, we make one **barrel file** that re-exports everything. Other files import from this single place.

📄 **Create `src/index.js`**

```js
// The front desk: one place to import everything from.
export { stand } from './stand.js';
export { default as menu, findItem, describeItem } from './menu.js';
export { discountRules } from './discounts.js';
export { createCashbox } from './cashbox.js';
export { createOrderCounter } from './order-numbers.js';
export { addToCart, cartSubtotal } from './cart.js';
export * from './money.js'; // re-export EVERYTHING that money.js shares
```

### A module we load only when asked

📄 **Create `src/banner.js`**

```js
// A fancy sign. We only load this file when someone asks for it.
export function showBanner({ name }) {
  const line = '='.repeat(name.length + 4);
  console.log(line);
  console.log(`| ${name} |`);
  console.log(line);
}
```

### The new, shorter `cli.js`

📄 **Replace `cli.js`**

```js
// cli.js - the Lemonade Stand, version 0.8 (now with modules!)
import {
  stand,
  menu,
  describeItem,
  findItem,
  discountRules,
  createCashbox,
  createOrderCounter,
  addToCart,
  cartSubtotal,
  toRupees,
  lineTotal,
} from './src/index.js';

const nextOrderNumber = createOrderCounter();
const cashbox = createCashbox();

function checkout(cart, ...discountNames) {
  const orderNumber = nextOrderNumber();
  const totalPaise = discountNames.reduce(
    (amountPaise, name) => discountRules[name](amountPaise),
    cartSubtotal(cart),
  );
  cashbox.deposit(totalPaise);

  console.log(`Order #${orderNumber}`);
  for (const { itemId, quantity } of cart) {
    const { emoji, name, pricePaise } = findItem(itemId);
    console.log(`  ${quantity} x ${emoji} ${name} = ₹${toRupees(lineTotal(pricePaise, quantity))}`);
  }
  const note = discountNames.length > 0 ? ` (${discountNames.join(' + ')} discount)` : '';
  console.log(`  Total: ₹${toRupees(totalPaise)}${note}`);
}

// Dynamic import + top-level await: load the banner ONLY if asked: node cli.js --banner
if (process.argv.includes('--banner')) {
  const { showBanner } = await import('./src/banner.js');
  showBanner(stand);
}

// --- Open the stand ---
console.log(stand.describe());
const {
  owner: { name: ownerName },
} = stand;
console.log(`Run by ${ownerName}`);

console.log('--- Menu ---');
for (const item of menu) {
  console.log(describeItem(item));
}

const byPrice = menu.toSorted((a, b) => a.pricePaise - b.pricePaise);
const [cheapest, ...others] = byPrice;
console.log(`Cheapest: ${cheapest.name} (and ${others.length} pricier items)`);

const menuBoard = menu.map(({ stock, ...publicInfo }) => publicInfo);
console.log('Menu board keys:', Object.keys(menuBoard[0]));

// --- A customer shops ---
let cart = [];
cart = addToCart(cart, 'lemonade', 2);
cart = addToCart(cart, 'cookie');
cart = addToCart(cart, 'sandwich');

const biggerCart = addToCart(cart, 'mango');
console.log('Old cart:', cart.length, 'lines. New cart:', biggerCart.length, 'lines.');

checkout(cart);
checkout(addToCart([], 'cookie', 4), 'kids', 'happyHour');
console.log('Cash box now holds ₹' + toRupees(cashbox.balance));
```

▶️ **Run:** `node cli.js`

👀 **You should see:**

```text
Sunny Lemonade Stand, open 9:00 to 17:00
Run by Asha
--- Menu ---
🍋 Lemonade - ₹40
🥭 Mango Juice - ₹60
🧊 Iced Tea - ₹50
🍪 Choc Cookie - ₹25
🥪 Cheese Sandwich - ₹80
Cheapest: Choc Cookie (and 4 pricier items)
Menu board keys: [ 'id', 'name', 'emoji', 'pricePaise', 'category' ]
Old cart: 3 lines. New cart: 4 lines.
Order #1
  2 x 🍋 Lemonade = ₹80
  1 x 🍪 Choc Cookie = ₹25
  1 x 🥪 Cheese Sandwich = ₹80
  Total: ₹185
Order #2
  4 x 🍪 Choc Cookie = ₹100
  Total: ₹72 (kids + happyHour discount)
Cash box now holds ₹257
```

**The output is exactly the same as Step 8.** That is the goal of tidying up: the program behaves identically, but the code is easier to live in. (Programmers call this *refactoring*.)

Now ask for the banner. The `banner.js` file is loaded **only** when you add `--banner`:

▶️ **Run:** `node cli.js --banner`

👀 **You should see:**

```text
========================
| Sunny Lemonade Stand |
========================
Sunny Lemonade Stand, open 9:00 to 17:00
Run by Asha
--- Menu ---
🍋 Lemonade - ₹40
🥭 Mango Juice - ₹60
🧊 Iced Tea - ₹50
🍪 Choc Cookie - ₹25
🥪 Cheese Sandwich - ₹80
Cheapest: Choc Cookie (and 4 pricier items)
Menu board keys: [ 'id', 'name', 'emoji', 'pricePaise', 'category' ]
Old cart: 3 lines. New cart: 4 lines.
Order #1
  2 x 🍋 Lemonade = ₹80
  1 x 🍪 Choc Cookie = ₹25
  1 x 🥪 Cheese Sandwich = ₹80
  Total: ₹185
Order #2
  4 x 🍪 Choc Cookie = ₹100
  Total: ₹72 (kids + happyHour discount)
Cash box now holds ₹257
```

---

## 5. What just happened?

Your project now looks like this:

```text
lemonade-stand/
├── package.json         ← says "type": "module"
├── cli.js               ← the program you run
├── hello.js, index.html, playground.js
└── src/
    ├── index.js         ← the front desk (barrel file)
    ├── stand.js         ← the stand's details
    ├── menu.js          ← the menu + findItem + describeItem
    ├── money.js         ← toRupees, lineTotal
    ├── discounts.js     ← discountRules (makeDiscount stays private)
    ├── cashbox.js       ← createCashbox
    ├── order-numbers.js ← createOrderCounter
    ├── cart.js          ← addToCart, cartSubtotal
    └── banner.js        ← loaded only on demand
```

- Each file has **one job** and a short list of things it shares.
- `makeDiscount` is private. If someone asks `import { makeDiscount } from './discounts.js'` they get an error. That is the whole point of a share slot.
- `export * from './money.js'` and `export { ... } from '...'` are **re-exports**: the barrel simply forwards things.
- `await import('./src/banner.js')` is a **dynamic import**. It returns a promise (Step 12), and the banner file is not even read unless `--banner` is on the command line. That is how big web apps **split their code** and load heavy parts on demand.
- `await` at the top of `cli.js` is **top-level await**, allowed only in modules.

## 🧪 Try it yourself

1. In `src/index.js`, delete the `describeItem` re-export and run `node cli.js`. Read the error. Which file and which name does it complain about? Put it back.
2. Create `src/receipt.js` with an exported function `printLine(text)` that logs `* ${text}`. Import it in `cli.js` and use it once.
3. Add a second **named** export to `src/banner.js`, then import both from a dynamic import: `const { showBanner, other } = await import(...)`.
4. **Predict, then run.** Both files below import each other (a *circular import*). What do you expect?
   ```js
   // a.js:  import { b } from './b.js'; export const a = 'A'; console.log('in a, b is', b);
   // b.js:  import { a } from './a.js'; export const b = 'B'; console.log('in b, a is', a);
   // run:   node a.js
   ```
   <details>
   <summary>Answer</summary>

   You get an error: `ReferenceError: Cannot access 'a' before initialization`. `b.js` runs first (it is a dependency of `a.js`), and at that moment `a.js` has not finished creating `a`. Circular imports make values appear "too early". Avoid them by moving the shared piece into a third file.
   </details>

## ⚠️ Mistakes everyone makes

| Mistake | What you see | Fix |
|---------|--------------|-----|
| Forgetting `"type": "module"` | `SyntaxError: Cannot use import statement outside a module` (or a warning) | Add it to `package.json` |
| Leaving out `.js` in the path: `from './money'` | `ERR_MODULE_NOT_FOUND` | Write the full name: `'./money.js'` |
| Using braces for a default import (or none for a named one) | `undefined`, or a "does not provide an export" error | Default: no braces. Named: braces. |
| Circular imports | Values are `undefined` or "before initialization" | Move shared code to a third file |
| Using `require` in a module | `ReferenceError: require is not defined in ES module scope` | Use `import` |
| Opening a module page by double-clicking `index.html` | A CORS error in the browser Console | Modules in the browser need a server. We build one in Step 16. |

## ✅ Checkpoint

- [ ] `node cli.js` prints the **same** output as Step 8, and `node cli.js --banner` adds a banner on top
- [ ] I can write named and default exports and import both kinds
- [ ] I know imports are live and modules are strict
- [ ] I can make a barrel file and re-export with `export { x } from` and `export *`
- [ ] I can use a dynamic `import()` and top-level `await`
- [ ] I can tell ES modules from CommonJS
- [ ] My `src/` folder has 9 files and `playground-helper.js` is deleted

**Files in your project now:** `package.json`, `cli.js`, `hello.js`, `index.html`, `playground.js`, and `src/` with `stand.js`, `money.js`, `menu.js`, `discounts.js`, `cashbox.js`, `order-numbers.js`, `cart.js`, `index.js`, `banner.js`

**Next:** [Step 10: Classes](10-classes.md)
