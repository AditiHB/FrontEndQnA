# Step 14: Iterators & Generators - The Pausing Vending Machine

> **Like I'm 5:** An iterator is a vending machine that gives you one snack each time you press the button. A generator is a vending machine that can pause in the middle of its work and wait until you press again.

| | |
|---|---|
| **Concept lesson** | [14. Iterators & generators](../concepts/14-iterators-and-generators.md) |
| **Time** | About 50 minutes |
| **You will build** | Version 0.12 of the stand: order numbers from a **generator**, orders you can loop over, and a kitchen board that streams updates with an **async generator** |
| **Files you touch** | `playground.js`, `src/order-numbers.js`, `src/order.js`, `src/kitchen.js`, `src/index.js`, `cli.js` |
| **Before** | [Step 13: Event loop & timers](13-event-loop-and-timers.md) |

> **Why is this lesson here, after promises?** The last part (async generators) needs `await`, which you learned in Step 12. The first parts need nothing new.

## Words to know

| Word | Like I'm 5 |
|------|------------|
| **Iterable** | Anything you can loop over: arrays, strings, Maps, Sets... |
| **Iterator** | The button-pressing machine. It has a `next()` that gives `{ value, done }`. |
| **Generator** | A function that can **pause** at `yield` and continue later. Written `function*`. |
| **`yield`** | "Hand out this value, then pause right here." |
| **Lazy** | Making a value only when someone asks for it. |
| **Async generator** | A generator that can also `await`. You loop over it with `for await`. |

---

## 1. The big idea

You have used `for (const x of something)` many times. How does `for...of` know how to walk through *something*? It asks the thing for a little machine called an **iterator**, and presses its button (`next()`) again and again until the machine says `done: true`.

```text
  for (const n of range) { ... }
          │
          ▼ asks range for its button machine  [Symbol.iterator]()
     ┌──────────────┐
     │  iterator    │  next() → { value: 1, done: false }
     │              │  next() → { value: 2, done: false }
     │              │  next() → { value: 3, done: false }
     └──────────────┘  next() → { value: undefined, done: true }  ← stop
```

Anything that has this machine works with `for...of`, spread `[...x]`, and array destructuring `const [a, b] = x`.

---

## 2. Play: build an iterable by hand

📄 **Replace `playground.js`**

```js
const range = {
  from: 1,
  to: 3,
  [Symbol.iterator]() {
    // `Symbol.iterator` is the agreed secret name for "here is my button machine"
    let current = this.from;
    const last = this.to;
    return {
      next() {
        return current <= last
          ? { value: current++, done: false }
          : { value: undefined, done: true };
      },
    };
  },
};

for (const n of range) {
  console.log(n);
}
console.log([...range]);
const [first, second] = range;
console.log(first, second);

// Press the button yourself
const machine = range[Symbol.iterator]();
console.log(machine.next());
console.log(machine.next());
console.log(machine.next());
console.log(machine.next());
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
1
2
3
[ 1, 2, 3 ]
1 2
{ value: 1, done: false }
{ value: 2, done: false }
{ value: 3, done: false }
{ value: undefined, done: true }
```

That was a lot of typing just to count to three. Generators are the shortcut.

---

## 3. Play: generators (a machine that can pause)

📄 **Replace `playground.js`**

```js
function* countdown(n) {
  while (n > 0) {
    yield n; // hand out n, then PAUSE right here
    n--; // when someone presses next() again, we carry on from this line
  }
  return 'liftoff';
}

const it = countdown(2);
console.log(it.next());
console.log(it.next());
console.log(it.next()); // the loop ended; `return` gives the final value
console.log(it.next());

console.log([...countdown(3)]); // spread ignores the return value
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
{ value: 2, done: false }
{ value: 1, done: false }
{ value: 'liftoff', done: true }
{ value: undefined, done: true }
[ 3, 2, 1 ]
```

A generator function (`function*`) does **not** run when you call it. Calling it gives back a generator object (an iterator). The body runs only a bit at a time, each time you press `next()`.

### Lazy: only work when asked

📄 **Replace `playground.js`**

```js
function* noisy() {
  console.log('making 1');
  yield 1;
  console.log('making 2');
  yield 2;
}

const gen = noisy();
console.log('created it, and nothing has been made yet');
console.log(gen.next().value);

// Because it is lazy, a generator can go on FOR EVER
function* naturals() {
  let n = 0;
  while (true) {
    yield n++;
  }
}

function* take(count, iterable) {
  let taken = 0;
  if (count <= 0) return;
  for (const value of iterable) {
    yield value;
    taken += 1;
    if (taken >= count) return;
  }
}

console.log([...take(5, naturals())]);

for (const n of naturals()) {
  if (n > 3) break; // we simply stop asking. It never needs to finish.
  console.log('n =', n);
}
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
created it, and nothing has been made yet
making 1
1
[ 0, 1, 2, 3, 4 ]
n = 0
n = 1
n = 2
n = 3
```

`naturals()` describes *all* the counting numbers, yet takes no memory. It only makes the next one when you ask. Generators are perfect for **big or endless lists, streams, and paging**.

---

## 4. Play: async generators (a pausing machine that can wait)

Add `async` and you get a generator that can `await`. Instead of `for...of`, you use **`for await...of`**.

This is perfect for paged data: "give me page 1... now page 2...".

📄 **Replace `playground.js`**

```js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// A pretend server with three pages of results
const fakeApi = {
  pages: [['a', 'b'], ['c'], ['d', 'e']],
  async next(cursor) {
    await wait(10); // pretend this is a slow network trip
    const index = cursor ?? 0;
    return {
      items: this.pages[index],
      nextCursor: index + 1 < this.pages.length ? index + 1 : null,
    };
  },
};

async function* allItems(api) {
  let cursor = null;
  do {
    const page = await api.next(cursor); // wait for a page
    yield* page.items; // hand out its items one by one
    cursor = page.nextCursor;
  } while (cursor !== null);
}

for await (const item of allItems(fakeApi)) {
  console.log(item);
}
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
a
b
c
d
e
```

The loop body doesn't know pages exist. It just sees a, b, c, d, e arriving one at a time, with the machine quietly fetching more when needed. (`yield*` means "hand out everything from this other iterable, one by one".)

---

## 5. Build: use all three in the stand

### A. Order numbers from a generator

In Step 5 we made order numbers with a closure. A generator does the same job in less code, with the "memory" being its paused place in the function.

📄 **Replace `src/order-numbers.js`**

```js
// A generator that never ends: 1, 2, 3, ... (it only makes the next number when asked)
export function* orderNumbers(start = 1) {
  let next = start;
  while (true) {
    yield next;
    next += 1;
  }
}
```

### B. Make an `Order` loopable

We add one method, `*[Symbol.iterator]()`, so `for (const line of order)` just works. A generator method is the shortest way to write it.

📄 **Replace `src/order.js`**

```js
import { cartLines } from './cart.js';
import { discountRules } from './discounts.js';
import { lineTotal, toRupees } from './money.js';

export class Order {
  static taxRate = 0.05; // ONE tax rate shared by every order

  #lines; // hidden: only code inside this class can touch these
  #discountNames;
  #status = 'new';

  constructor({ id, customer = 'friend', lines, discountNames = [] }) {
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

### C. A kitchen board that streams updates

The kitchen calls out each dish **as it is finished**, using an async generator. It loops over the order itself (thanks to B).

📄 **Add to the bottom of `src/kitchen.js`**

```js

// An async generator: the kitchen calls out each dish as soon as it is done.
export async function* kitchenUpdates(order, options) {
  for (const line of order) {
    try {
      yield await prepareLine(line, options);
    } catch (error) {
      yield `❌ ${error.message}`;
    }
  }
}
```

### D. Share the new names

📄 **Replace `src/index.js`**

```js
// The front desk: one place to import everything from.
export { stand } from './stand.js';
export { default as menu, findItem, describeItem } from './menu.js';
export { discountRules } from './discounts.js';
export { createCashbox } from './cashbox.js';
export { orderNumbers } from './order-numbers.js';
export { addToCart, cartSubtotal, cartLines } from './cart.js';
export { Order, TakeAwayOrder } from './order.js';
export { PickupTimer } from './pickup-timer.js';
export * from './kitchen.js';
export * from './report.js';
export * from './money.js'; // re-export EVERYTHING that money.js shares
```

### E. Use them in `cli.js`

📄 **Replace `cli.js`**

```js
// cli.js - the Lemonade Stand, version 0.12 (now with generators!)
import {
  stand,
  menu,
  describeItem,
  createCashbox,
  orderNumbers,
  addToCart,
  Order,
  TakeAwayOrder,
  kitchenUpdates,
  toRupees,
  lineTotal,
} from './src/index.js';

const orderIds = orderNumbers(); // a generator: each .next() gives the next order number
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

// --- Open the stand ---
console.log(stand.describe());
console.log('--- Menu ---');
for (const item of menu) {
  console.log(describeItem(item));
}

// --- Customers shop ---
let cart = [];
cart = addToCart(cart, 'lemonade', 2);
cart = addToCart(cart, 'cookie');
cart = addToCart(cart, 'sandwich');

const first = placeOrder(Order, { customer: 'Asha', cart });
placeOrder(TakeAwayOrder, {
  customer: 'Ravi',
  cart: addToCart([], 'cookie', 4),
  discountNames: ['kids', 'happyHour'],
});
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
🍋 Lemonade - ₹40
🥭 Mango Juice - ₹60
🧊 Iced Tea - ₹50
🍪 Choc Cookie - ₹25
🥪 Cheese Sandwich - ₹80
Order #1 for Asha: 3 line(s), total ₹194.25
  2 x 🍋 Lemonade = ₹80
  1 x 🍪 Choc Cookie = ₹25
  1 x 🥪 Cheese Sandwich = ₹80
  Items ₹185, after discounts ₹185, tax ₹9.25
Order #2 for Ravi: 1 line(s), total ₹80.6 [take-away, includes ₹5 box fee]
  4 x 🍪 Choc Cookie = ₹100
  Items ₹100, after discounts ₹72, tax ₹3.6
Cash box now holds ₹274.85
--- Kitchen board ---
  🍋 Lemonade x2 is ready
  🍪 Choc Cookie x1 is ready
  🥪 Cheese Sandwich x1 is ready
Order #1 is ready! 🎉 (status: ready)
```

Watch the kitchen board: the lines appear one at a time, about half a second apart, as each dish is finished.

---

## 6. What just happened?

- `orderNumbers()` is a generator that never ends. `orderIds.next().value` presses the button and reads the number. The paused function remembers `next`, just like the backpack in Step 5. (`createOrderCounter` is gone: **same job, less code**.)
- `*[Symbol.iterator]() { yield* this.lines; }` taught `Order` how to be looped over. Now `for (const line of order)` works, and so would `[...order]`.
- `kitchenUpdates` is an **async generator**. It `await`s each dish and `yield`s the message right away. `for await` in `cli.js` receives each message the moment it appears, not after all three are done.
- If a dish fails, the `try/catch` inside the generator turns the error into a `❌` message so the board keeps going. (Step 15 is all about errors.)
- The two `for await`/`for...of` loops didn't know or care *how* the values are made. That is the power of the iterator idea.

## 🧪 Try it yourself

1. Use the board with a broken machine: change the call to `kitchenUpdates(first, { broken: ['sandwich'] })`. What does the third line become?
2. Write a generator `function* evens()` that yields `0, 2, 4, ...` forever. Print the first five with `take(5, evens())` (copy `take` from the playground into `playground.js`).
3. Make `menu` fancier: write `function* drinksOnly(items)` that does `for (const item of items) if (item.category === 'drink') yield item;`. Print `[...drinksOnly(menu)].map((i) => i.name)`.
4. **Predict, then run.** What does this print?
   ```js
   function* g() {
     const x = yield 1;
     console.log('got', x);
   }
   const it = g();
   it.next();
   it.next('hello');
   ```
   <details>
   <summary>Answer</summary>

   `got hello`. The value you pass to `next(...)` becomes the result of the paused `yield`. Generators can receive values as well as hand them out. You will rarely need this, but it is how some libraries drive generators.
   </details>

## ⚠️ Mistakes everyone makes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| Calling a generator and expecting it to have run | Nothing happened; it is just paused at the start | Press `next()` or loop over it |
| Re-using a finished generator | It stays `done`; loops over it do nothing | Call the generator function again to get a fresh one |
| `[...naturals()]` on an infinite generator | The program hangs and runs out of memory | Use `take`, or `break` out of a `for...of` |
| `for (x of asyncGenerator)` without `await` | `TypeError: ... is not iterable` | `for await (x of asyncGenerator)` |
| Putting `yield` inside a normal callback (`items.forEach(x => { yield x })`) | `SyntaxError` | `yield` only works directly in the generator; use `for...of` or `yield*` |
| Forgetting the `*` | `yield` is a syntax error | `function*` or `async function*` |

## ✅ Checkpoint

- [ ] `node cli.js` prints the output above, with the kitchen board appearing one dish at a time
- [ ] I can explain an **iterator** as a machine with `next()` giving `{ value, done }`
- [ ] I know `for...of`, spread, and destructuring all use `[Symbol.iterator]`
- [ ] I can write a generator with `function*` and `yield`
- [ ] I know generators are **lazy** and can be infinite
- [ ] I can use `for await...of` with an async generator
- [ ] I understand `yield*` as "hand out everything from this other iterable"

**Files in your project now:** everything from Step 13, but `src/order-numbers.js` now holds a generator

**Next:** [Step 15: Error handling](15-error-handling.md)
