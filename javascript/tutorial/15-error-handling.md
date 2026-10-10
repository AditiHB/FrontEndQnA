# Step 15: Error Handling - The Safety Net

> **Like I'm 5:** When you trip while running, a safety net catches you. `try` is the running part, `catch` is the safety net, and `finally` is the cleanup crew that comes no matter what.

| | |
|---|---|
| **Concept lesson** | [15. Error handling](../concepts/15-error-handling.md) |
| **Time** | About 50 minutes |
| **You will build** | Version 0.13 of the stand: clear, friendly errors for pizza orders, silly quantities, empty orders, and broken settings |
| **Files you touch** | `playground.js`, `src/errors.js` (new), `src/settings.js` (new), `src/cart.js`, `src/order.js`, `src/index.js`, `cli.js` |
| **Before** | [Step 14: Iterators & generators](14-iterators-and-generators.md) |

## Words to know

| Word | Like I'm 5 |
|------|------------|
| **Error** | A note saying "something went wrong, here is what and where". |
| **`throw`** | Shouting "Trouble!" and stopping what you are doing. |
| **`try` / `catch`** | "Try this. If anyone shouts trouble, I will handle it here." |
| **`finally`** | The cleanup crew. It runs whether things went well or badly. |
| **Custom error** | Your own kind of trouble note, with a clear name. |
| **Error `cause`** | A note clipped to the new error saying what the *original* problem was. |
| **Unhandled error** | Trouble that nobody caught. It reaches the top and the program stops. |

---

## 1. The big idea

Things go wrong: a customer types `banana`, the internet drops, a file is missing. A grown-up program does not pretend these things never happen. It decides **what to do when they do**.

```text
   try {                       ← running along happily
     doSomethingRisky();       ← 💥 throws an Error
     neverReached();           ← skipped!
   } catch (error) {           ← the net catches it
     tellTheCustomerNicely();
   } finally {                 ← always runs, win or lose
     tidyUp();
   }
```

An error that is **thrown** travels up through the functions that called each other, like a ball thrown up a staircase, until some `catch` catches it. If nobody does, the program stops.

---

## 2. Play: try, catch, finally

📄 **Replace `playground.js`**

```js
function parseConfig(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.log('Bad config:', error.name);
    return {};
  } finally {
    console.log('parse attempted'); // runs even though `return` already happened
  }
}

console.log(parseConfig('{"open": 9}'));
console.log(parseConfig('{ oops'));
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
parse attempted
{ open: 9 }
Bad config: SyntaxError
parse attempted
{}
```

### The error family

JavaScript has a few built-in kinds of error. They are all `Error`s, with a more specific name.

📄 **Replace `playground.js`**

```js
const made = [
  new Error('generic'),
  new TypeError('wrong type'),
  new RangeError('out of range'),
  new SyntaxError('bad syntax'),
];
for (const error of made) {
  console.log(error.name, '-', error.message, '-', error instanceof Error);
}

console.log('--- real ones that JavaScript throws for you ---');
const troublemakers = [
  () => null.name, // looking inside nothing
  () => new Array(-1), // a silly size
  () => notDefinedAnywhere, // a word nobody made
];
for (const trouble of troublemakers) {
  try {
    trouble();
  } catch (error) {
    console.log(`${error.name}: ${error.message}`);
  }
}
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
Error - generic - true
TypeError - wrong type - true
RangeError - out of range - true
SyntaxError - bad syntax - true
--- real ones that JavaScript throws for you ---
TypeError: Cannot read properties of null (reading 'name')
RangeError: Invalid array length
ReferenceError: notDefinedAnywhere is not defined
```

| Error | Usually means |
|-------|---------------|
| `ReferenceError` | You used a name that doesn't exist |
| `TypeError` | The right name, but the wrong kind of thing (calling a non-function, reading inside `null`) |
| `RangeError` | A number outside its allowed range |
| `SyntaxError` | The code (or the JSON text) is written wrongly |

---

## 3. Play: your own errors, and `cause`

📄 **Replace `playground.js`**

```js
// A custom error: a clear name, plus extra facts
class NotFoundError extends Error {
  constructor(resource, id) {
    super(`${resource} ${id} not found`);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

try {
  throw new NotFoundError('User', 7);
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log(error.name, error.status, '-', error.message);
  } else {
    throw error; // not ours? Let it keep flying upward
  }
}

// `cause` keeps the ORIGINAL problem when you wrap it in a friendlier one
function loadUser() {
  throw new Error('database is down');
}
try {
  try {
    loadUser();
  } catch (error) {
    throw new Error('Could not start session', { cause: error });
  }
} catch (error) {
  console.log(error.message, '| because:', error.cause.message);
}

console.log(new Error('hi').stack.split('\n')[0]); // errors carry a stack trace

// Throwing plain text works, but you lose the stack trace. Do not do it.
try {
  throw 'just some text';
} catch (error) {
  console.log(typeof error, error.stack);
}
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
NotFoundError 404 - User 7 not found
Could not start session | because: database is down
Error: hi
string undefined
```

- **Always throw `Error` objects** (or your own subclasses), never strings, so you get a stack trace showing *where* it happened.
- `error instanceof NotFoundError` lets you handle **your** kinds of trouble and rethrow everything else.

### The last safety net

Some errors slip past every `try/catch`. Browsers and Node let you register a final net. Use it only to **log and report**, not to pretend nothing happened.

📄 **Replace `playground.js`**

```js
// Node's version of the last safety nets
process.on('unhandledRejection', (reason) => {
  console.log('Safety net caught a forgotten promise failure:', reason.message);
});
process.on('uncaughtException', (error) => {
  console.log('Last resort caught:', error.message);
});

Promise.reject(new Error('nobody handled me')); // no .catch anywhere!

setTimeout(() => {
  throw new Error('boom in a timer');
}, 10);
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
Safety net caught a forgotten promise failure: nobody handled me
Last resort caught: boom in a timer
```

In a browser, the same two nets look like this (you will use them in Step 16):

```js
window.addEventListener('error', (event) => report(event.error));
window.addEventListener('unhandledrejection', (event) => report(event.reason));
```

Send what they catch to a monitoring service, so you hear about problems before your customers do.

---

## 4. Build: friendly errors for the stand

### A. Our own kinds of trouble

We make one **base** error for everything our stand might complain about, and three specific ones. A single `instanceof StandError` can then mean "this is one of ours".

📄 **Create `src/errors.js`**

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
  constructor(item, requested) {
    super(`Only ${item.stock} ${item.name} left (you asked for ${requested})`);
    this.name = 'OutOfStockError';
    this.itemId = item.id;
  }
}
```

### B. Settings that can be broken

We will save settings in the browser soon (Step 17). Saved text can be damaged, so we parse it carefully and keep the **cause**.

📄 **Create `src/settings.js`**

```js
import { StandError } from './errors.js';

export const defaultSettings = { theme: 'light', language: 'en' };

// Turn saved text into settings. If the text is broken, say so clearly and keep the real reason.
export function parseSettings(text) {
  try {
    return { ...defaultSettings, ...JSON.parse(text ?? '{}') };
  } catch (error) {
    throw new StandError('The saved settings are broken', { cause: error });
  }
}
```

### C. The cart checks its input

Validate early, and fail with a clear message. `parseQuantity` is back, but this time it throws instead of returning `null`.

📄 **Replace `src/cart.js`**

```js
import { InvalidQuantityError, OutOfStockError, UnknownItemError } from './errors.js';
import { findItem } from './menu.js';
import { lineTotal } from './money.js';

// Typed text in, a good whole number out, or an InvalidQuantityError.
export function parseQuantity(text) {
  const quantity = Number(text);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new InvalidQuantityError(text);
  }
  return quantity;
}

// Returns a NEW cart. The old cart is left alone. Throws if the request makes no sense.
export function addToCart(cart, itemId, quantity = 1) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new InvalidQuantityError(quantity);
  }
  const item = findItem(itemId);
  if (!item) {
    throw new UnknownItemError(itemId);
  }
  if (quantity > item.stock) {
    throw new OutOfStockError(item, quantity);
  }
  return [...cart, { itemId, quantity }];
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

### D. An order must have something in it

📄 **Replace `src/order.js`**

```js
import { cartLines } from './cart.js';
import { discountRules } from './discounts.js';
import { StandError } from './errors.js';
import { lineTotal, toRupees } from './money.js';

export class Order {
  static taxRate = 0.05; // ONE tax rate shared by every order

  #lines; // hidden: only code inside this class can touch these
  #discountNames;
  #status = 'new';

  constructor({ id, customer = 'friend', lines, discountNames = [] }) {
    if (lines.length === 0) {
      throw new StandError('An order needs at least one item');
    }
    this.id = id;
    this.customer = customer;
    this.#lines = lines.map((line) => ({ ...line })); // our own copies
    this.#discountNames = [...discountNames];
  }

  // A static method belongs to the class. `this` is the class that was called (Order or a child).
  static fromCart({ id, customer, cart, discountNames }) {
    return new this({ id, customer, lines: cartLines(cart), discountNames });
  }

  // Now `for (const line of order)` works! It hands out copies of the lines.
  *[Symbol.iterator]() {
    yield* this.lines;
  }

  get lines() {
    return this.#lines.map((line) => ({ ...line })); // hand out copies, never our own
  }

  get status() {
    return this.#status;
  }

  get subtotal() {
    return this.#lines.reduce(
      (sum, { pricePaise, quantity }) => sum + lineTotal(pricePaise, quantity),
      0,
    );
  }

  get afterDiscounts() {
    return this.#discountNames.reduce(
      (amountPaise, name) => discountRules[name](amountPaise),
      this.subtotal,
    );
  }

  get tax() {
    return Math.round(this.afterDiscounts * Order.taxRate);
  }

  get total() {
    return this.afterDiscounts + this.tax;
  }

  markReady() {
    this.#status = 'ready';
    return this;
  }

  describe() {
    const { id, customer, total } = this;
    return `Order #${id} for ${customer}: ${this.#lines.length} line(s), total ₹${toRupees(total)}`;
  }
}

// A fancier order: it costs a little extra for the box.
export class TakeAwayOrder extends Order {
  static packagingFeePaise = 500;

  get total() {
    return super.total + TakeAwayOrder.packagingFeePaise;
  }

  describe() {
    const fee = toRupees(TakeAwayOrder.packagingFeePaise);
    return `${super.describe()} [take-away, includes ₹${fee} box fee]`;
  }
}
```

### E. Share the new names

📄 **Replace `src/index.js`**

```js
// The front desk: one place to import everything from.
export { stand } from './stand.js';
export { default as menu, findItem, describeItem } from './menu.js';
export { discountRules } from './discounts.js';
export { createCashbox } from './cashbox.js';
export { orderNumbers } from './order-numbers.js';
export { addToCart, cartSubtotal, cartLines, parseQuantity } from './cart.js';
export { Order, TakeAwayOrder } from './order.js';
export { PickupTimer } from './pickup-timer.js';
export { defaultSettings, parseSettings } from './settings.js';
export * from './errors.js';
export * from './kitchen.js';
export * from './report.js';
export * from './money.js'; // re-export EVERYTHING that money.js shares
```

### F. Handle the errors in `cli.js`

The rule: **catch only what you can handle.** Our `tryToAdd` handles `StandError`s (it tells the customer and keeps the old cart) and rethrows everything else, because something we did not expect should not be hidden.

📄 **Replace `cli.js`**

```js
// cli.js - the Lemonade Stand, version 0.13 (now with error handling!)
import {
  stand,
  menu,
  describeItem,
  createCashbox,
  orderNumbers,
  addToCart,
  parseQuantity,
  parseSettings,
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
function tryToAdd(cart, itemId, typedQuantity) {
  try {
    return addToCart(cart, itemId, parseQuantity(typedQuantity));
  } catch (error) {
    if (error instanceof StandError) {
      console.log(`  Oops (${error.name}): ${error.message}`);
      return cart;
    }
    throw error; // a surprise! Do not hide it.
  }
}

// --- Open the stand ---
console.log(stand.describe());
console.log('--- Menu ---');
for (const item of menu) {
  console.log(describeItem(item));
}

// --- A customer shops, and some things go wrong ---
console.log('--- Shopping ---');
let cart = [];
cart = tryToAdd(cart, 'lemonade', '2');
cart = tryToAdd(cart, 'cookie', '1');
cart = tryToAdd(cart, 'pizza', '1'); // we do not sell pizza
cart = tryToAdd(cart, 'sandwich', '50'); // not enough in stock
cart = tryToAdd(cart, 'mango', 'banana'); // not a number
cart = tryToAdd(cart, 'sandwich', '1');
console.log('Cart has', cart.length, 'lines');

// --- Orders ---
const first = placeOrder(Order, { customer: 'Asha', cart });
placeOrder(TakeAwayOrder, {
  customer: 'Ravi',
  cart: tryToAdd([], 'cookie', '4'),
  discountNames: ['kids', 'happyHour'],
});
console.log('Cash box now holds ₹' + toRupees(cashbox.balance));

// An empty order is not allowed. `finally` runs either way.
try {
  placeOrder(Order, { customer: 'Nobody', cart: [] });
} catch (error) {
  console.log('Could not place the order:', error.message);
} finally {
  console.log('(the till is tidied up either way)');
}

// Broken saved settings: our friendly error keeps the real reason as its `cause`.
try {
  parseSettings('{ not json');
} catch (error) {
  console.log(error.message, '| because:', error.cause.name);
}
console.log('Good settings:', parseSettings('{"theme":"dark"}'));

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
🍋 Lemonade - ₹40
🥭 Mango Juice - ₹60
🧊 Iced Tea - ₹50
🍪 Choc Cookie - ₹25
🥪 Cheese Sandwich - ₹80
--- Shopping ---
  Oops (UnknownItemError): We do not sell "pizza"
  Oops (OutOfStockError): Only 5 Cheese Sandwich left (you asked for 50)
  Oops (InvalidQuantityError): "banana" is not a good number of items
Cart has 3 lines
Order #1 for Asha: 3 line(s), total ₹194.25
  2 x 🍋 Lemonade = ₹80
  1 x 🍪 Choc Cookie = ₹25
  1 x 🥪 Cheese Sandwich = ₹80
  Items ₹185, after discounts ₹185, tax ₹9.25
Order #2 for Ravi: 1 line(s), total ₹80.6 [take-away, includes ₹5 box fee]
  4 x 🍪 Choc Cookie = ₹100
  Items ₹100, after discounts ₹72, tax ₹3.6
Cash box now holds ₹274.85
Could not place the order: An order needs at least one item
(the till is tidied up either way)
The saved settings are broken | because: SyntaxError
Good settings: { theme: 'dark', language: 'en' }
--- Kitchen board ---
  🍋 Lemonade x2 is ready
  🍪 Choc Cookie x1 is ready
  🥪 Cheese Sandwich x1 is ready
Order #1 is ready! 🎉 (status: ready)
```

---

## 5. What just happened?

- `addToCart` now **validates early**. Three kinds of bad input each get their own named error with a clear sentence.
- All three extend `StandError`. So `error instanceof StandError` means "one of ours", and `error.name` tells you which.
- In `tryToAdd`, the `catch` handles our errors and **rethrows** anything else (`throw error`). If a real bug like a `TypeError` happened, we would see it instead of hiding it behind a friendly message.
- The empty order: the `Order` constructor threw, `catch` told the user, and `finally` ran either way. Use `finally` for cleanup: closing files, hiding a spinner, clearing a timer.
- `parseSettings` wrapped a low-level `SyntaxError` inside a friendly `StandError`, and **kept the original as `cause`**, so a developer can still find the true reason.
- Order #3 would have used up a number: the failing empty order asked for an order number *before* it failed. Real receipt books have gaps like this too, so that is fine here.

## 🧪 Try it yourself

1. Add `cart = tryToAdd(cart, 'cookie', '-3');` and `cart = tryToAdd(cart, 'cookie', '2.5');`. Read both messages.
2. Add `throw new Error('surprise!')` at the top of `tryToAdd`'s `try` block. What happens, and why does it *not* print "Oops"? Remove it afterwards.
3. **Make an empty `catch` and feel the pain.** Change one of the `catch` blocks to `catch (error) {}`. Do something wrong on purpose. How hard is it to find the problem?
4. Add a new error class `ClosedError` that is thrown by `placeOrder` when the hour is outside `stand.hours`. (Hint: `new Date().getHours()`.)
5. **Predict, then run.** What does this print?
   ```js
   function test() {
     try {
       return 'try';
     } finally {
       console.log('finally runs first');
     }
   }
   console.log(test());
   ```
   <details>
   <summary>Answer</summary>

   `finally runs first`, then `try`. The `return` value is remembered, `finally` runs, and *then* the function really returns. (Tip: do not `return` inside `finally`. It would silently replace the original result.)
   </details>

## ⚠️ Mistakes everyone makes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| `catch (error) {}` (empty) | The problem vanishes silently; nobody can find it | At least `console.error(error)`, or rethrow |
| Catching everything and pretending all is well | Real bugs hide | Catch only what you can handle; rethrow the rest |
| `throw 'something'` | No stack trace | `throw new Error('something')` |
| Forgetting `await` inside `try` | The `catch` never sees the rejection | `await` the promise inside the `try` |
| Putting a giant block of code in one `try` | You can't tell what failed | Keep `try` blocks small |
| `return` inside `finally` | It overrides the real result or error | Use `finally` only for cleanup |
| Losing the original error when wrapping | Debugging is hard | `new Error('...', { cause: error })` |
| Validating late | A confusing crash far from the cause | Validate input at the door |

## ✅ Checkpoint

- [ ] `node cli.js` prints three friendly "Oops" lines, the empty-order message, and the settings message
- [ ] I can use `try`, `catch` and `finally`, and I know what each is for
- [ ] I know the built-in error types and what they usually mean
- [ ] I can write a custom error class, and use `instanceof` to handle only my own
- [ ] I rethrow what I cannot handle
- [ ] I use `cause` to keep the original error
- [ ] I always throw `Error` objects, never strings
- [ ] I never leave a `catch` block empty
- [ ] I know the browser and Node have last-resort nets for unhandled errors

**Files in your project now:** everything from Step 14, plus `src/errors.js` and `src/settings.js`

**Next:** [Step 16: DOM & events](16-dom-and-events.md). Time to build the web page!
