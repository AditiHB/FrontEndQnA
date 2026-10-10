# Step 22: Tooling & Testing - The Helper Team

> **Like I'm 5:** Tooling is your helper team. npm is the shop that gives you parts. ESLint is the hall monitor. Prettier is the neat-handwriting coach. A bundler is the packing robot. Tests are your homework check before you show it to the class.

| | |
|---|---|
| **Concept lesson** | [22. Tooling & testing](../concepts/22-tooling-and-testing.md) |
| **Time** | About 2 hours |
| **You will build** | A **professional setup**: `package.json` scripts, a linter, a formatter, a bundler with a dev server, and **69 automatic tests** that check the whole stand in under a second |
| **Files you touch** | `package.json`, `.gitignore`, `.prettierrc.json`, `.prettierignore`, `eslint.config.js`, `vite.config.js`, and nine files in `tests/` |
| **Before** | [Step 21: Security](21-security.md) |

## Words to know

| Word | Like I'm 5 |
|------|------------|
| **npm** | The shop (and the delivery person) for code parts other people made. |
| **Package** | One ready-made part from the shop. |
| **`package.json`** | Your project's shopping list and ID card. |
| **Dependency / devDependency** | A part the app needs while running / a tool only **you** need while building. |
| **Semver** | Version numbers: `MAJOR.MINOR.PATCH`. `^8.3.4` means "8.3.4 or any newer 8.x.y". |
| **Lock file** | A receipt listing the **exact** version of every part, so everyone gets the same ones. |
| **Script** | A nickname for a command: `npm test` instead of a long one. |
| **Linter** | A hall monitor that spots mistakes and bad habits without running the code. |
| **Formatter** | A neat-handwriting coach that rewrites your code in one tidy style. |
| **Bundler** | A packing robot that combines many files into a few small ones for the browser. |
| **Unit / integration / end-to-end test** | Check one piece / check pieces working together / check the whole app in a real browser. |
| **Mock** | A pretend helper (like a fake server) so a test does not need the real one. |

---

## 1. The big idea

You have written about 30 files by hand. Real teams use **tools** so that people spend their time on the *ideas* and not on the chores:

```text
   your code ──► ESLint ──► "that is a bug waiting to happen"      (finds mistakes)
             ──► Prettier ─► "let me tidy that up"                  (one style for everyone)
             ──► Vitest ───► "all 69 checks still pass"            (catches broken things)
             ──► Vite ─────► "here is a small, fast website"        (packs it for the browser)

   all of them are started with:   npm run <something>
```

---

## 2. Spring cleaning

Your playground files did their job. Say thank you and delete them. Even `hello.js`, your very first file. 🎉

🗑️ **Delete `playground.js`**

🗑️ **Delete `playground.html`**

🗑️ **Delete `hello.js`**

---

## 3. npm and `package.json`

Since Step 9 your `package.json` has been a tiny ID card. Now it becomes the project's **control panel**. First, the shop commands you should know:

| Command | What it does |
|---------|--------------|
| `npm init -y` | Creates a starter `package.json` for you (we wrote ours by hand in Step 9) |
| `npm install` | Reads `package.json` and downloads everything listed |
| `npm install lodash-es` | Adds a **runtime** dependency (the app needs it) |
| `npm install -D vitest` | Adds a **dev** dependency (only a build-time tool) |
| `npm uninstall name` | Removes one |
| `npm run name` | Runs the script called `name` from `package.json` |
| `npx name` | Runs a tool that is installed in this project |
| `npm ci` | A **clean**, exact install from the lock file (for servers and CI) |
| `npm audit` | Checks your packages for known security problems |

We will use six dev tools. To make sure you get exactly the versions this tutorial was tested with, replace your `package.json` with the full file (it is what `npm install -D ...` would have written, plus our scripts):

📄 **Replace `package.json`**

```json
{
  "name": "lemonade-stand",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=22"
  },
  "scripts": {
    "dev": "vite",
    "api": "node tools/serve.js",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "check": "npm run lint && npm run format:check && npm test && npm run build"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "eslint": "^10.12.0",
    "globals": "^17.13.0",
    "prettier": "^3.9.10",
    "vite": "^8.3.4",
    "vitest": "^5.0.3"
  }
}
```

| Field | Meaning |
|-------|---------|
| `"private": true` | "Do not publish this to npm by accident." |
| `"type": "module"` | Our files are ES modules (Step 9). |
| `"engines"` | Which Node versions the project is meant for. |
| `"scripts"` | Nicknames for commands. `npm run lint` runs `eslint .`. (`test` and `start` may skip the word `run`: `npm test`.) |
| `"devDependencies"` | The helper tools. **Notice there is no `"dependencies"`**: our stand needs no outside code to run! |

Tell git what **not** to keep (the downloaded parts and the built site can always be recreated):

📄 **Create `.gitignore`**

```text
node_modules
dist
```

Now fetch the parts.

▶️ **Run:** `npm install`

👀 **You should see something like:**

```text
added 114 packages, and audited 115 packages in 10s

31 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

Two things appeared: a **`node_modules/`** folder (all the downloaded parts, big and disposable) and a **`package-lock.json`** (the receipt of exact versions). **Commit `package-lock.json`** to git, never `node_modules`.

---

## 4. ESLint: the hall monitor

ESLint reads your code **without running it** and complains about mistakes and risky habits. Its rules live in a config file.

📄 **Create `eslint.config.js`**

```js
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/', 'node_modules/'] },
  js.configs.recommended, // the standard set of "this is probably a bug" rules
  {
    languageOptions: {
      // Tell ESLint which built-in names exist, so it does not call `document` or `process` unknown.
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      eqeqeq: 'error', // always === (Step 3)
      'no-var': 'error', // let and const only (Step 2)
      'prefer-const': 'error', // use const if you never reassign (Step 2)
      // `({ stock, ...publicInfo }) => publicInfo` is a deliberate way to leave one thing out (Step 8).
      'no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },
];
```

▶️ **Run:** `npm run lint`

👀 **You should see:**

```text
> lemonade-stand@1.0.0 lint
> eslint .
```

Only those two header lines, and nothing else. **No complaints is the good news.** (The code you have been writing follows the habits ESLint likes: `===`, `const`, no unused names.)

### Break it on purpose

Make a file with three bad habits. You have been warned about each one in an earlier step:

📄 **Create `src/oops.js`**

```js
var oops = 1;
if (oops == '1') {
  console.log('hi');
}
const unused = 5;
```

▶️ **Run (skip):** `npx eslint src/oops.js`

👀 **You should see something like:**

```text
/home/you/lemonade-stand/src/oops.js
  1:1   error  Unexpected var, use let or const instead     no-var
  2:10  error  Expected '===' and instead saw '=='          eqeqeq
  5:7   error  'unused' is assigned a value but never used  no-unused-vars

✖ 3 problems (3 errors, 0 warnings)
  1 error and 0 warnings potentially fixable with the `--fix` option.
```

(ESLint has hundreds of rules. One you will love once you move to TypeScript is `no-floating-promises`, which shouts when you forget to `await` or handle a promise: the most common bug from Step 12.)

Each line says **where** (`line:column`), **how bad**, **what**, and the **rule name** (so you can look it up). Now clean up:

🗑️ **Delete `src/oops.js`**

---

## 5. Prettier: the neat-handwriting coach

ESLint finds *mistakes*. **Prettier** only cares about *looks*: spacing, quotes, line breaks. It rewrites your files so everyone's code looks the same, and nobody ever argues about style in a code review again.

📄 **Create `.prettierrc.json`**

```json
{
  "singleQuote": true,
  "printWidth": 100
}
```

📄 **Create `.prettierignore`**

```text
dist
node_modules
package-lock.json
```

▶️ **Run:** `npm run format:check`

👀 **You should see:**

```text
> lemonade-stand@1.0.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

All the code in this tutorial was written in Prettier's style already, so there is nothing to fix. Try messing it up:

📄 **Create `src/ugly.js`**

```js
const   a = {x:1,   y:2}
function f( a,b ){return a+b}
```

▶️ **Run (skip):** `npm run format:check`

👀 **You should see something like:**

```text
Checking formatting...
[warn] src/ugly.js
[warn] Code style issues found in the above file. Run Prettier with --write to fix.
```

▶️ **Run (skip):** `npm run format`

The file is rewritten for you:

```js
const a = { x: 1, y: 2 };
function f(a, b) {
  return a + b;
}
```

🗑️ **Delete `src/ugly.js`**

> **Tip:** Most editors can run Prettier **every time you save**, and show ESLint's complaints as red squiggles while you type. Look for the Prettier and ESLint extensions for your editor.

---

## 6. Vite: the packing robot (a bundler)

Browsers can load our modules one by one, and in development that is fine. But a real website wants **few, small, fast files**. A **bundler** reads `index.html`, follows every `import`, and packs your code into the smallest set of files. It also:

- **Removes unused code** ("tree shaking"). Only what the page really uses goes in.
- **Shrinks** the files (minifies: shorter names, no spaces or comments).
- **Adds a fingerprint** to file names so browsers know when a file has changed.

| Tool | What it is |
|------|------------|
| **Vite** | A fast dev server **and** a build tool. A common default today. |
| **esbuild** | A very fast bundler, often used underneath other tools. |
| **webpack** | A mature, very configurable bundler. Common in older projects. |

We use Vite. Its config is tiny: it only needs to know that requests starting with `/api` belong to **our own server** (`tools/serve.js`).

📄 **Create `vite.config.js`**

```js
import { defineConfig } from 'vitest/config';

// While developing, Vite serves the page and hands anything starting with /api to our own server.
const api = { '/api': 'http://localhost:3000' };

export default defineConfig({
  server: { proxy: api },
  preview: { proxy: api },
  test: { include: ['tests/**/*.test.js'] }, // Vitest looks for tests here
});
```

### Development: two terminals

Open **two** terminal windows in the project folder.

**Terminal 1** is the API (the same `serve.js` as before). **Terminal 2** is Vite.

▶️ **Run (skip):** `npm run api`

▶️ **Run (skip):** `npm run dev`

👀 **You should see something like (in terminal 2):**

```text
  VITE v8.3.4  ready in 345 ms

  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173**. It is your whole stand, served by Vite. Orders still reach the server because Vite forwards `/api/...` to port 3000. Change a file such as `styles.css` and save: the page updates **instantly**, without a reload. (This is called hot module replacement.)

> **A note about security headers.** Vite's dev server does not send our Content-Security-Policy header. That header lives in `tools/serve.js` (Step 21). For a real website, you configure the same headers on whatever **host** serves your `dist/` folder.

### Production: build it

▶️ **Run:** `npm run build`

👀 **You should see something like:**

```text
vite v8.3.4 building client environment for production...
transforming...
✓ 29 modules transformed.
rendering chunks...
computing gzip size...
dist/assets/report-worker-BlF2-bYF.js   1.00 kB
dist/index.html                         2.36 kB │ gzip: 0.89 kB
dist/assets/index-BM_e5YWq.css          1.74 kB │ gzip: 0.85 kB
dist/assets/index-BB9TmB3C.js          15.14 kB │ gzip: 5.97 kB

✓ built in 228ms
```

(Your file names and sizes will differ a little: the part like `BB9TmB3C` is a fingerprint of the file's contents.)

Look at that: all your modules became **one 15 kB script** (6 kB when compressed for the network), one CSS file, and the Web Worker as its own tiny file. Open `dist/assets/index-....js` in your editor (it is one long line of squashed code) and search for the words `SUNNY LEMONADE STAND`. **They are not there.** That text lives in `src/receipt.js`, which the web page never imports, so the bundler left it out. That is tree shaking at work. The text `calling your name`, which the page does use, *is* there.

▶️ **Run (skip):** `npm run preview`

Open **http://localhost:4173** (with `npm run api` still running). That is the real built site, the same files you would upload to a host.

---

## 7. Testing: your homework check

A **test** is a small program that uses your code and says **"yes, it does what I expected"** or **"no!"**. You write it once. After that it checks your work in a fraction of a second, forever.

| Kind | Checks | Speed | How many |
|------|--------|-------|----------|
| **Unit** | One function or class on its own (`addToCart`, `formatMoney`) | Very fast | Lots |
| **Integration** | Several pieces working together (store + cart + order) | Fast | Some |
| **End-to-end (e2e)** | The whole app in a real browser, clicking like a person (tools: **Playwright**, **Cypress**) | Slow | A few, for the most important journeys |

This is the **testing pyramid**: many small fast tests at the bottom, a few big slow ones at the top. We write unit and integration tests here with **Vitest**. (While this tutorial was being written, every step's web page was also driven in a real browser with Playwright to check that it worked. That is e2e testing.)

### The shape of a test

```js
import { describe, it, expect } from 'vitest';

describe('lineTotal', () => {            // a group of related checks
  it('multiplies price by quantity', () => {   // one check, described in plain words
    expect(lineTotal(2500, 3)).toBe(7500);     // "expect this to be that"
  });
});
```

Every test follows **arrange, act, assert**: set things up, do the thing, check the result. And you test **behaviour** ("a merged cart has one line with quantity 3"), not **implementation** ("`addToCart` calls `map` exactly once"). That way you can rewrite the inside and the tests still pass.

Why did we make everything **pure** in Step 18? *Because pure functions are the easiest thing in the world to test.* Same inputs in, same output out, nothing to set up, nothing to clean up.

### Test 1: money

📄 **Create `tests/money.test.js`**

```js
import { describe, expect, it } from 'vitest';
import { lineTotal, toRupees } from '../src/money.js';

describe('money', () => {
  it('turns paise into rupees', () => {
    expect(toRupees(4000)).toBe(40);
    expect(toRupees(8060)).toBe(80.6);
  });

  it('multiplies a price by a quantity', () => {
    expect(lineTotal(2500, 3)).toBe(7500);
  });
});
```

### Test 2: the cart (pure functions)

Look at the test that **freezes its input**. If `addToCart` ever mutated the cart, the frozen array would make it throw. The test proves purity.

📄 **Create `tests/cart.test.js`**

```js
import { describe, expect, it } from 'vitest';
import {
  addToCart,
  cartSubtotal,
  parseQuantity,
  reduceStock,
  removeFromCart,
  setQuantity,
} from '../src/cart.js';
import { InvalidQuantityError, OutOfStockError, UnknownItemError } from '../src/errors.js';
import { deepFreeze } from '../src/freeze.js';
import { initialStock } from '../src/menu.js';

describe('addToCart', () => {
  it('adds a new line', () => {
    expect(addToCart([], 'lemonade', 2)).toEqual([{ itemId: 'lemonade', quantity: 2 }]);
  });

  it('merges lines for the same item', () => {
    const cart = addToCart(addToCart([], 'lemonade', 2), 'lemonade', 1);
    expect(cart).toEqual([{ itemId: 'lemonade', quantity: 3 }]);
  });

  it('never changes the cart it was given (we freeze the input to prove it)', () => {
    const cart = deepFreeze([{ itemId: 'cookie', quantity: 1 }]);
    const next = addToCart(cart, 'lemonade');
    expect(cart).toHaveLength(1);
    expect(next).toHaveLength(2);
    expect(next).not.toBe(cart);
  });

  it('counts what is already in the cart against the stock', () => {
    const cart = addToCart([], 'sandwich', 4); // only 5 in stock
    expect(() => addToCart(cart, 'sandwich', 2)).toThrow(OutOfStockError);
    expect(() => addToCart(cart, 'sandwich', 1)).not.toThrow();
  });

  it.each([0, -1, 1.5, '2', NaN])('rejects the quantity %j', (quantity) => {
    expect(() => addToCart([], 'lemonade', quantity)).toThrow(InvalidQuantityError);
  });

  it('rejects things we do not sell', () => {
    expect(() => addToCart([], 'pizza')).toThrow(UnknownItemError);
  });
});

describe('setQuantity and removeFromCart', () => {
  const cart = addToCart(addToCart([], 'lemonade', 2), 'cookie');

  it('sets an exact quantity', () => {
    expect(setQuantity(cart, 'lemonade', 5)[0].quantity).toBe(5);
  });

  it('removes the line when the quantity becomes 0', () => {
    expect(setQuantity(cart, 'cookie', 0)).toEqual([{ itemId: 'lemonade', quantity: 2 }]);
  });

  it('gives back the SAME cart when there is nothing to remove', () => {
    expect(removeFromCart(cart, 'mango')).toBe(cart);
  });

  it('gives back a NEW cart when it removes something', () => {
    expect(removeFromCart(cart, 'cookie')).not.toBe(cart);
  });
});

describe('reduceStock', () => {
  it('returns a new stock object and leaves the starting note alone', () => {
    const stock = reduceStock(initialStock, [{ itemId: 'lemonade', quantity: 3 }]);
    expect(stock.lemonade).toBe(7);
    expect(initialStock.lemonade).toBe(10);
    expect(stock).not.toBe(initialStock);
  });
});

describe('parseQuantity and cartSubtotal', () => {
  it('reads typed numbers, and refuses nonsense', () => {
    expect(parseQuantity('3')).toBe(3);
    expect(() => parseQuantity('banana')).toThrow(InvalidQuantityError);
  });

  it('adds up the cart in paise', () => {
    const cart = addToCart(addToCart([], 'lemonade', 2), 'cookie');
    expect(cartSubtotal(cart)).toBe(10500);
  });
});
```

### Test 3: orders (a class)

📄 **Create `tests/order.test.js`**

```js
import { describe, expect, it } from 'vitest';
import { addToCart } from '../src/cart.js';
import { StandError } from '../src/errors.js';
import { Order, TakeAwayOrder } from '../src/order.js';

const cart = addToCart(addToCart(addToCart([], 'lemonade', 3), 'cookie'), 'sandwich');
const cookies = addToCart([], 'cookie', 4);

describe('Order', () => {
  it('works out subtotal, tax, and total in whole paise', () => {
    const order = Order.fromCart({ id: 1, customer: 'Asha', cart });
    expect(order.subtotal).toBe(22500);
    expect(order.tax).toBe(1125);
    expect(order.total).toBe(23625);
  });

  it('applies stacked discounts before tax', () => {
    const order = Order.fromCart({
      id: 2,
      customer: 'Ravi',
      cart: cookies,
      discountNames: ['kids', 'happyHour'],
    });
    expect(order.afterDiscounts).toBe(7200);
    expect(order.total).toBe(7560);
  });

  it('a take-away order adds the box fee, and is still an Order', () => {
    const order = TakeAwayOrder.fromCart({
      id: 3,
      customer: 'Meera',
      cart: cookies,
      discountNames: ['kids', 'happyHour'],
    });
    expect(order.total).toBe(8060);
    expect(order).toBeInstanceOf(Order);
  });

  it('hands out copies of its lines, so outsiders cannot change the order', () => {
    const order = Order.fromCart({ id: 4, customer: 'Asha', cart });
    order.lines.push({ itemId: 'x' });
    order.lines[0].quantity = 99;
    expect(order.lines).toHaveLength(3);
    expect(order.lines[0].quantity).toBe(3);
  });

  it('can be looped over', () => {
    const names = [...Order.fromCart({ id: 5, customer: 'Asha', cart })].map((line) => line.name);
    expect(names).toEqual(['Lemonade', 'Choc Cookie', 'Cheese Sandwich']);
  });

  it('refuses an empty order', () => {
    expect(() => Order.fromCart({ id: 6, customer: 'Nobody', cart: [] })).toThrow(StandError);
  });

  it('starts as new, and markReady changes the status', () => {
    const order = Order.fromCart({ id: 7, customer: 'Asha', cart });
    expect(order.status).toBe('new');
    expect(order.markReady().status).toBe('ready');
  });

  it('turns into clean JSON, with the date as an ISO string', () => {
    const placedAt = new Date(Date.UTC(2026, 9, 10, 9, 30));
    const order = Order.fromCart({ id: 8, customer: 'Asha', cart, placedAt });
    expect(JSON.parse(JSON.stringify(order))).toMatchObject({
      id: 8,
      customer: 'Asha',
      status: 'new',
      placedAt: '2026-10-10T09:30:00.000Z',
      total: 23625,
    });
  });
});
```

### Test 4: formatting (and passing the clock in)

Because `timeAgo` takes `now` as an argument (Step 19), the test needs no real clock. `it.each` runs the same test for a table of inputs.

📄 **Create `tests/format.test.js`**

```js
import { describe, expect, it } from 'vitest';
import { formatMoney, formatTime, timeAgo } from '../src/format.js';

describe('formatMoney', () => {
  it('shows rupees with two decimals', () => {
    expect(formatMoney(4000)).toBe('₹40.00');
    expect(formatMoney(8060)).toBe('₹80.60');
  });

  it('uses Indian grouping (lakhs and crores)', () => {
    expect(formatMoney(1019999100)).toBe('₹1,01,99,991.00');
  });
});

describe('formatTime', () => {
  it('shows a 24-hour time in the time zone we ask for', () => {
    const moment = new Date(Date.UTC(2026, 9, 10, 9, 30));
    expect(formatTime(moment, { timeZone: 'UTC' })).toBe('09:30');
    expect(formatTime(moment, { timeZone: 'Asia/Kolkata' })).toBe('15:00');
  });
});

describe('timeAgo', () => {
  const now = Date.UTC(2026, 9, 10, 12, 0, 0); // we hand the clock in, so the answer never changes

  it.each([
    [0, 'now'],
    [30, '30 seconds ago'],
    [120, '2 minutes ago'],
    [3 * 3600, '3 hours ago'],
    [86400, 'yesterday'],
  ])('%i seconds ago is "%s"', (secondsAgo, expected) => {
    expect(timeAgo(now - secondsAgo * 1000, now)).toBe(expected);
  });
});
```

### Test 5: the store, and a whole shopping trip (integration)

`vi.fn()` makes a **spy**: a pretend function that remembers how it was called. The last test is an **integration test**: it uses the store, the cart, the order, and the stock together, like a real customer.

📄 **Create `tests/store.test.js`**

```js
import { describe, expect, it, vi } from 'vitest';
import { addToCart, reduceStock } from '../src/cart.js';
import { initialStock } from '../src/menu.js';
import { Order } from '../src/order.js';
import { createStore } from '../src/store.js';

describe('createStore', () => {
  it('starts with a frozen copy of the state', () => {
    const store = createStore({ cart: [] });
    expect(Object.isFrozen(store.getState())).toBe(true);
    expect(() => store.getState().cart.push(1)).toThrow(TypeError);
  });

  it('replaces the state and tells the listeners', () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    store.subscribe(listener);
    store.update((state) => ({ ...state, count: state.count + 1 }));
    expect(store.getState().count).toBe(1);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ count: 1 });
  });

  it('tells nobody when the update gives back the very same state', () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    store.subscribe(listener);
    store.update((state) => state);
    expect(listener).not.toHaveBeenCalled();
  });

  it('stops telling a listener once it unsubscribes', () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.update((state) => ({ ...state, count: 1 }));
    expect(listener).not.toHaveBeenCalled();
  });

  it('keeps the old state when an update throws', () => {
    const store = createStore({ count: 0 });
    expect(() =>
      store.update(() => {
        throw new Error('nope');
      }),
    ).toThrow('nope');
    expect(store.getState()).toEqual({ count: 0 });
  });
});

describe('a whole shopping trip (an integration test)', () => {
  it('fills the cart, places an order, and takes the stock down', () => {
    const store = createStore({ cart: [], stock: initialStock });

    store.update((state) => ({
      ...state,
      cart: addToCart(state.cart, 'lemonade', 2, state.stock),
    }));
    store.update((state) => ({
      ...state,
      cart: addToCart(state.cart, 'lemonade', 1, state.stock),
    }));

    const order = Order.fromCart({ id: 1, customer: 'Asha', cart: store.getState().cart });
    store.update((state) => ({ ...state, cart: [], stock: reduceStock(state.stock, order.lines) }));

    expect(store.getState().cart).toEqual([]);
    expect(store.getState().stock.lemonade).toBe(7);
    expect(initialStock.lemonade).toBe(10); // the starting note never changed
    expect(order.total).toBe(12600); // 3 x 4000 = 12000, plus 600 tax
  });
});
```

### Test 6: time, without waiting (fake timers)

Debounce is all about *time*. We do not want a test that sleeps for real. A **fake clock** (`vi.useFakeTimers()`) lets the test say "pretend 100 ms passed" instantly.

📄 **Create `tests/perf.test.js`**

```js
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce, throttle } from '../src/perf.js';

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers()); // a fake clock: we decide when time passes
  afterEach(() => vi.useRealTimers());

  it('runs once, with the latest arguments, after the calls stop', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced('l');
    debounced('le');
    debounced('lem');
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('lem');
  });

  it('starts waiting again every time it is called', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced('a');
    vi.advanceTimersByTime(80);
    debounced('b');
    vi.advanceTimersByTime(80);
    expect(fn).not.toHaveBeenCalled(); // 160 ms passed, but never 100 ms of quiet
    vi.advanceTimersByTime(20);
    expect(fn).toHaveBeenCalledWith('b');
  });

  it('can cancel a pending call', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced('a');
    debounced.cancel();
    vi.advanceTimersByTime(500);
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('throttle', () => {
  it('runs at most once per window, using the clock we hand it', () => {
    let time = 1000;
    const fn = vi.fn();
    const throttled = throttle(fn, 50, () => time);

    throttled('a'); // runs
    throttled('b'); // too soon
    time += 49;
    throttled('c'); // still too soon
    time += 1;
    throttled('d'); // 50 ms have passed: runs

    expect(fn.mock.calls).toEqual([['a'], ['d']]);
  });
});
```

### Test 7: security helpers

📄 **Create `tests/security.test.js`**

```js
import { describe, expect, it } from 'vitest';
import { StandError } from '../src/errors.js';
import { escapeHtml, safeMerge, safeUrl } from '../src/security.js';
import { defaultSettings, parseSettings } from '../src/settings.js';

describe('escapeHtml', () => {
  it('turns markup into harmless text', () => {
    expect(escapeHtml('<img src=x onerror="alert(1)">')).toBe(
      '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;',
    );
  });

  it('also escapes & and single quotes', () => {
    expect(escapeHtml("Tom & Jerry's")).toBe('Tom &amp; Jerry&#39;s');
  });
});

describe('safeUrl', () => {
  it.each([
    ['https://example.com/party', 'https://example.com/party'],
    ['http://localhost:3000/', 'http://localhost:3000/'],
    ['javascript:alert(1)', null],
    ['  javascript:alert(1)', null],
    ['data:text/html,<h1>hi</h1>', null],
    ['/relative/path', null],
    ['not a url', null],
    [null, null],
  ])('%j becomes %j', (input, expected) => {
    expect(safeUrl(input)).toBe(expected);
  });
});

describe('safeMerge', () => {
  it('merges deeply and leaves its inputs alone', () => {
    const defaults = { theme: 'light', notifications: { sound: true, badge: true } };
    const merged = safeMerge(defaults, { notifications: { sound: false } });
    expect(merged).toEqual({ theme: 'light', notifications: { sound: false, badge: true } });
    expect(defaults.notifications.sound).toBe(true);
  });

  it('refuses to poison Object.prototype', () => {
    const evil = JSON.parse('{ "__proto__": { "isAdmin": true }, "theme": "dark" }');
    const merged = safeMerge({ theme: 'light' }, evil);
    expect({}.isAdmin).toBeUndefined();
    expect(merged).toEqual({ theme: 'dark' });
  });
});

describe('parseSettings', () => {
  it('uses the defaults when nothing was saved', () => {
    expect(parseSettings(null)).toEqual(defaultSettings);
  });

  it('keeps default values the saved text did not mention', () => {
    expect(parseSettings('{"theme":"dark"}')).toEqual({ ...defaultSettings, theme: 'dark' });
  });

  it('explains broken text, and keeps the real reason as the cause', () => {
    let caught;
    try {
      parseSettings('{ nope');
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(StandError);
    expect(caught.message).toBe('The saved settings are broken');
    expect(caught.cause).toBeInstanceOf(SyntaxError);
  });

  it('rejects saved text that is not an object', () => {
    expect(() => parseSettings('[1, 2, 3]')).toThrow(StandError);
  });
});
```

### Test 8: the network, without a network (mocking `fetch`)

Tests must not depend on a real server being up. We **mock** `fetch`: swap in a pretend one that gives the answer we choose (`mockResolvedValue`) or fails the way we choose (`mockRejectedValue`). `vi.stubGlobal` replaces the global, and `vi.unstubAllGlobals` puts the real one back afterwards. This is how we test the network *failures* that are hard to cause for real.

📄 **Create `tests/api.test.js`**

```js
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchJson, getOrders, HttpError, sendOrder } from '../src/api.js';
import { addToCart } from '../src/cart.js';
import { StandError } from '../src/errors.js';
import { Order } from '../src/order.js';

// A pretend server answer.
const answer = (body, status = 200) => new Response(JSON.stringify(body), { status });

afterEach(() => vi.unstubAllGlobals()); // put the real fetch back after every test

describe('fetchJson', () => {
  it('gives back the JSON when the server says OK', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(answer([{ id: 1 }])));
    expect(await getOrders()).toEqual([{ id: 1 }]);
  });

  it('turns a 400 into an HttpError that carries the server message', async () => {
    const message = 'An order needs a customer name and some lines';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(answer({ error: message }, 400)));
    const error = await fetchJson('/api/orders').catch((problem) => problem);
    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({ status: 400, message });
  });

  it('turns a network failure into a friendly StandError and keeps the cause', async () => {
    const down = new TypeError('Failed to fetch');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(down));
    const error = await fetchJson('/api/orders').catch((problem) => problem);
    expect(error).toBeInstanceOf(StandError);
    expect(error.message).toBe('Could not reach the server');
    expect(error.cause).toBe(down);
  });

  it('explains a timeout', async () => {
    const timeout = new DOMException('timed out', 'TimeoutError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(timeout));
    await expect(fetchJson('/api/slow', { timeoutMs: 10 })).rejects.toThrow('longer than 10ms');
  });
});

describe('sendOrder', () => {
  it('posts the order as JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue(answer({ id: 7 }, 201));
    vi.stubGlobal('fetch', fetchMock);
    const order = Order.fromCart({ id: 1, customer: 'Asha', cart: addToCart([], 'lemonade', 2) });

    expect(await sendOrder(order, { table: '5' })).toEqual({ id: 7 });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/orders');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toMatchObject({
      customer: 'Asha',
      takeAway: false,
      table: '5',
      lines: [{ itemId: 'lemonade', quantity: 2 }],
    });
  });
});
```

### Test 9: the async kitchen (fake timers and promises)

📄 **Create `tests/kitchen.test.js`**

```js
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addToCart } from '../src/cart.js';
import { prepareInOrder, prepareTogether, prepareWhatWeCan } from '../src/kitchen.js';
import { Order } from '../src/order.js';

// Lemonade takes 300 ms (a drink), the cookie takes 600 ms (a snack).
const order = Order.fromCart({
  id: 1,
  customer: 'Asha',
  cart: addToCart(addToCart([], 'lemonade', 2), 'cookie'),
});

describe('the kitchen (with a fake clock, so these tests take no real time)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('cooking together takes as long as the slowest dish', async () => {
    const done = vi.fn();
    prepareTogether(order).then(done);

    await vi.advanceTimersByTimeAsync(599);
    expect(done).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(done).toHaveBeenCalledWith(['🍋 Lemonade x2 is ready', '🍪 Choc Cookie x1 is ready']);
  });

  it('cooking one by one takes the sum of all the dishes', async () => {
    const done = vi.fn();
    prepareInOrder(order).then(done);

    await vi.advanceTimersByTimeAsync(899);
    expect(done).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('reports what worked and what did not', async () => {
    const result = prepareWhatWeCan(order, { broken: ['cookie'] });
    await vi.advanceTimersByTimeAsync(600);
    expect(await result).toEqual([
      '🍋 Lemonade x2 is ready',
      '❌ Sorry, we cannot make Choc Cookie right now',
    ]);
  });
});
```

### Run them all

▶️ **Run:** `npm test`

👀 **You should see something like:**

```text
> lemonade-stand@1.0.0 test
> vitest run

 RUN  v5.0.3 /home/you/lemonade-stand

 Test Files  9 passed (9)
      Tests  69 passed (69)
   Start at  15:39:26
   Duration  747ms
```

**69 checks across 9 files in well under a second.** Every time you change the code, run `npm test`. If something you did broke something else, you hear about it in a heartbeat, not from a customer.

### See red, then green

Tests are only useful if they can **fail**. Let's break the code on purpose. In `src/money.js`, change the maths in `lineTotal` from `pricePaise * quantity` to `pricePaise + quantity` and run the money test:

▶️ **Run (skip):** `npx vitest run tests/money.test.js`

👀 **You should see something like:**

```text
 FAIL  tests/money.test.js > money > multiplies a price by a quantity
AssertionError: expected 2503 to be 7500 // Object.is equality

- Expected
+ Received

- 7500
+ 2503

 ❯ tests/money.test.js:11:32
      9|
     10|   it('multiplies a price by a quantity', () => {
     11|     expect(lineTotal(2500, 3)).toBe(7500);
       |                                ^
     12|   });

 Test Files  1 failed (1)
      Tests  1 failed | 1 passed (2)
```

It tells you **which test**, **what it expected** (`7500`), **what it got** (`2503`), and **the exact line**. Change the `+` back to `*` and the test passes again. (Also try `npm run test:watch`: it re-runs tests every time you save a file.)

---

## 8. One command to check everything

▶️ **Run:** `npm run check`

👀 **You should see something like (the end of a long output):**

```text
 Test Files  9 passed (9)
      Tests  69 passed (69)

vite v8.3.4 building client environment for production...
✓ 29 modules transformed.
...
✓ built in 228ms
```

`npm run check` runs **lint, format check, tests, and build**, one after the other, and stops at the first failure. Run it before every commit. Teams run exactly this on a server for every change (**continuous integration**, or CI). For example, a file `.github/workflows/ci.yml` like this (optional, not part of the project) makes GitHub run the check on every push:

```yaml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci # a clean, exact install from package-lock.json
      - run: npm run check
```

▶️ **Run (skip):** `npm audit`

👀 **You should see something like:**

```text
found 0 vulnerabilities
```

`npm audit` checks every package against a list of known security problems (Step 21). Run it from time to time, and keep your packages updated.

---

## 9. What just happened?

- **`package.json` scripts** gave long commands short names. Now `npm test`, `npm run lint`, `npm run build` work the same way for you, for a teammate, and for a CI server.
- **The lock file** pins every package's exact version, so `npm ci` gives a server the **same** result as your laptop.
- **ESLint** found nothing because the habits from Steps 2, 3, and 8 were already in place. On the "oops" file it found three problems without running the code.
- **Prettier** gave the whole codebase one style. The **two** tools do different jobs: ESLint for *correctness*, Prettier for *looks*.
- **Vite** gave a fast dev server with live updates (and an `/api` proxy), and a production build that **tree-shook** the unused receipt code, minified, and fingerprinted the files.
- **Vitest** ran 69 tests in under a second. They work because earlier steps made the code **testable**: pure functions (Step 4, 18), a store (Step 18), the clock passed in (Step 19), `fetch` wrapped in one file (Step 17), and classes with clear public methods (Step 10).
- **Mocks and fake timers** let us test failure and time without a real network or real waiting.

## 🧪 Try it yourself

1. Add a test file `tests/menu.test.js` for `findItem`: `findItem('lemonade').pricePaise` should be `4000`, and `findItem('pizza')` should be `undefined`.
2. In `tests/cart.test.js`, add a test that adding `'mango'` ten times in a row (use a loop and `addToCart`) throws `OutOfStockError` on the ninth call (stock is 8).
3. Break `deepFreeze` on purpose (make it do nothing: put `return value;` as the first line of the function) and run `npm test`. **Which tests catch it?**
   <details>
   <summary>Answer</summary>

   Exactly **one**: `starts with a frozen copy of the state` in `tests/store.test.js`. The cart test that freezes its input still passes, because `addToCart` really *is* pure. The frozen input there is only a **tripwire** that would go off if `addToCart` ever started mutating. Tests can only catch what they actually check. Put `deepFreeze` back.
   </details>
4. Run `npm run test:watch`, then edit a test and save. Press `q` to quit.
5. In ESLint's config, add the rule `'no-console': 'warn'` and run `npm run lint`. What happens? (Many warnings: `cli.js` uses `console.log` on purpose. You could turn the rule off for `cli.js` only. Remove the rule afterwards.)
6. **Predict, then run.** Will this test pass or fail, and why?
   ```js
   it('is the same cart', () => {
     expect(addToCart([], 'lemonade')).toBe(addToCart([], 'lemonade'));
   });
   ```
   <details>
   <summary>Answer</summary>

   It **fails**. `toBe` uses `Object.is` (like `===`): two separate arrays are never the *same object*, even when their contents match. Use `toEqual` to compare **contents**. This is the same "reference vs value" idea from Step 18.
   </details>

## ⚠️ Mistakes everyone makes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| Committing `node_modules` | A giant, slow repository | `.gitignore` it |
| **Not** committing `package-lock.json` | "Works on my machine": versions differ | Commit it, and use `npm ci` in CI |
| Putting build tools in `dependencies` | Heavier production installs | `npm install -D tool` |
| Fighting Prettier over style | Wasted time | Let it decide; set `printWidth`/quotes once |
| Turning off lint rules to make errors vanish | Real bugs slip through | Fix the code, or document a rare exception |
| Testing implementation details | Every refactor breaks tests | Test behaviour: inputs and outputs |
| Tests that depend on a real server or the real clock | Slow and flaky | Mock `fetch`, use fake timers |
| One huge test with ten checks | When it fails you do not know why | Small tests with clear names |
| `toBe` on objects and arrays | Fails even when the contents match | `toEqual` |
| Never running the tests | They rot | `npm run check` before every commit |
| Skipping `npm audit` and updates | Known holes stay open | Check regularly |

## ✅ Checkpoint

- [ ] `npm install` finished, and I have `node_modules/` and `package-lock.json`
- [ ] `npm run lint` shows no problems
- [ ] `npm run format:check` says all files use Prettier code style
- [ ] `npm test` shows **69 tests passed** in 9 files
- [ ] `npm run build` made a `dist/` folder, and I know why the receipt text is not in it
- [ ] `npm run api` plus `npm run dev` shows the stand at http://localhost:5173
- [ ] `npm run check` passes from start to end
- [ ] I broke a test on purpose, read the failure, and fixed it
- [ ] I can explain: npm vs `package.json` vs the lock file; dependency vs devDependency; linter vs formatter vs bundler
- [ ] I can say what a unit test, an integration test, and an e2e test are
- [ ] I know what a mock is, and why fake timers help

**Files in your project now:** the whole stand: `index.html`, `styles.css`, `cli.js`, `report-cli.js`, `package.json`, `package-lock.json`, `eslint.config.js`, `vite.config.js`, `.prettierrc.json`, `.prettierignore`, `.gitignore`, `tools/` (2 files), `src/` (28 files), and `tests/` (9 files). `playground.*` and `hello.js` are gone.

**Next:** [Step 23: Graduation](23-graduation.md)
