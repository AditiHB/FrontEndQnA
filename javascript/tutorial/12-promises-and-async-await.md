# Step 12: Promises & Async/Await - The Coffee-Shop Receipt

> **Like I'm 5:** A promise is a receipt from a coffee shop. You don't have the coffee yet, but you have a receipt that says it's coming. When it's ready, you exchange the receipt for the coffee. If the shop runs out, the receipt says "sorry".

| | |
|---|---|
| **Concept lesson** | [12. Promises & async/await](../concepts/12-promises-and-async-await.md) |
| **Time** | About 60 minutes |
| **You will build** | Version 0.11 of the stand: a **kitchen** that cooks slowly, in a line or all together, and can give up if it takes too long |
| **Files you touch** | `playground.js`, `src/kitchen.js` (new), `src/index.js`, `cli.js` |
| **Before** | [Step 11: `this` & binding](11-this-and-binding.md) |

## Words to know

| Word | Like I'm 5 |
|------|------------|
| **Promise** | A receipt for something that will arrive later. |
| **Pending** | "Still cooking." |
| **Fulfilled** | "Here is your coffee." (Also called *resolved*.) |
| **Rejected** | "Sorry, we ran out." |
| **Settled** | Finished, either way. A settled promise **never changes again**. |
| **`.then` / `.catch` / `.finally`** | "When it is ready, do this" / "if it fails, do this" / "either way, do this". |
| **`async` function** | A function that always hands you back a receipt (a promise). |
| **`await`** | "Wait here for this receipt, but let everyone else keep working." |

---

## 1. The big idea

Cooking takes time. Asking another computer for data takes time. Reading a file takes time. If JavaScript stood still and waited for every one of these (Step 1: blocking!), the whole page would freeze.

So instead, slow jobs **hand you a receipt immediately** (a promise) and carry on. You can:

- Do other things meanwhile.
- Say what should happen **when the receipt turns into the real thing**.

```text
   ask for coffee ───────► Promise { pending }  ← the receipt, right away
                                  │
        (the shop works)          │
                                  ▼
            ┌─────────────────────┴───────────────────┐
            ▼                                         ▼
   fulfilled: 'latte'                       rejected: Error('out of milk')
   .then(drink => ...)                      .catch(error => ...)
            └─────────────────────┬───────────────────┘
                                  ▼
                        .finally(() => ...)  ← always runs
```

---

## 2. Play: making a promise

📄 **Replace `playground.js`**

```js
const coffee = new Promise((resolve, reject) => {
  setTimeout(() => resolve('latte'), 200); // success after 200 ms
  // reject(new Error('out of milk'));     // failure
});

console.log('Receipt in hand:', coffee);

coffee
  .then((drink) => {
    console.log('Got', drink);
    return drink.toUpperCase(); // whatever you return goes to the NEXT .then
  })
  .then((loud) => console.log('Loud:', loud))
  .catch((error) => console.error(error))
  .finally(() => console.log('done'));
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
Receipt in hand: Promise { <pending> }
Got latte
Loud: LATTE
done
```

- The very first line shows the receipt while the coffee is still brewing: `Promise { <pending> }`.
- `resolve(value)` means success. `reject(error)` means failure.
- `.then` calls can be chained like a conveyor belt. Each one passes its result to the next.

### A promise settles once, and only once

📄 **Replace `playground.js`**

```js
const outOfMilk = new Promise((resolve, reject) => {
  reject(new Error('out of milk'));
  resolve('too late!'); // ignored: the promise is already settled
});

outOfMilk
  .then((drink) => console.log('Got', drink))
  .catch((error) => console.log('Sorry:', error.message))
  .finally(() => console.log('done'));
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
Sorry: out of milk
done
```

---

## 3. Play: `async` and `await`

`.then` chains work, but they get messy. `async`/`await` lets you write the same thing so it **reads like normal top-to-bottom code**.

📄 **Replace `playground.js`**

```js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function makeCoffee() {
  console.log('1. grinding');
  await wait(100); // pause THIS function; the rest of the program keeps running
  console.log('2. brewing');
  await wait(100);
  return 'coffee'; // an async function ALWAYS gives back a promise
}

const promise = makeCoffee();
console.log(promise);
console.log('Got', await promise); // await works at the top of a module too

// try / catch / finally work with await
async function burnToast() {
  await wait(10);
  throw new Error('burnt toast');
}

try {
  await burnToast();
} catch (error) {
  console.log('Caught:', error.message);
} finally {
  console.log('cleanup');
}
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
1. grinding
Promise { <pending> }
2. brewing
Got coffee
Caught: burnt toast
cleanup
```

- `makeCoffee()` printed `1. grinding` immediately, then handed back a pending promise. It paused at `await`, and the main code carried on (that is why `Promise { <pending> }` printed *before* `2. brewing`).
- `await` unwraps the receipt into the real value. If the promise rejects, `await` throws, and `catch` catches it.

> `await` pauses **only the function it is in**. It never freezes the page. Remember Step 1's cook who put cookies in the oven.

The most common use of `async`/`await` is asking another computer for something. Here is the same shape with a network request. (It is only an illustration. There is no server yet; you build the real thing in Step 17.)

```js
async function getOrder(id) {
  try {
    const response = await fetch(`/api/orders/${id}`); // wait for the answer
    if (!response.ok) throw new Error(`HTTP ${response.status}`); // a 404 is NOT an error to fetch!
    return await response.json(); // wait for the body to be read as JSON
  } catch (error) {
    console.error('Could not load order', error);
    throw error;
  }
}
```

Notice the `response.ok` check. `fetch` does not throw for a `404` or `500`. Step 17 explains why, and also how to add a **timeout** with `AbortController`, which every network call should have.

---

## 4. Play: in a line, or all together?

Two jobs that don't need each other should not wait for each other.

📄 **Replace `playground.js`**

```js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const slowA = async () => {
  await wait(300);
  return 'A';
};
const slowB = async () => {
  await wait(300);
  return 'B';
};

let start = Date.now();
await slowA(); // wait for A to finish...
await slowB(); // ...and only THEN start B
console.log('One after the other took about', Math.round((Date.now() - start) / 300), 'waits');

start = Date.now();
const [a, b] = await Promise.all([slowA(), slowB()]); // start both NOW
console.log('Together took about', Math.round((Date.now() - start) / 300), 'wait', a, b);
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
One after the other took about 2 waits
Together took about 1 wait A B
```

Same two jobs: **twice as fast** when run together. `Promise.all` takes a list of promises, starts them all, and gives you back all the answers (in the order you asked, not the order they finished).

### The four helpers

📄 **Replace `playground.js`**

```js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const ok = (value, ms) => wait(ms).then(() => value);
const bad = (message, ms) =>
  wait(ms).then(() => {
    throw new Error(message);
  });

// all: everyone must succeed
console.log(await Promise.all([ok('A', 30), ok('B', 10)]));
try {
  await Promise.all([ok('A', 30), bad('B broke', 10)]);
} catch (error) {
  console.log('all() gave up:', error.message);
}

// allSettled: wait for everyone, whatever happens
const results = await Promise.allSettled([ok('A', 30), bad('B broke', 10)]);
console.log(results.map((result) => result.status));

// race: the first one to FINISH wins (success or failure)
console.log(await Promise.race([ok('slow', 50), ok('fast', 10)]));

// any: the first one to SUCCEED wins
console.log(await Promise.any([bad('x', 10), ok('winner', 30)]));
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
[ 'A', 'B' ]
all() gave up: B broke
[ 'fulfilled', 'rejected' ]
fast
winner
```

| Helper | Succeeds when | Fails when | Use it when |
|--------|---------------|------------|-------------|
| `Promise.all` | **All** succeed | **Any** fails | You need everything |
| `Promise.allSettled` | All finish (any outcome) | Never | Partial failure is OK |
| `Promise.race` | The first one **settles** | The first one fails | Timeouts |
| `Promise.any` | The first one **succeeds** | **All** fail | Several backup sources |

---

## 5. Build: the kitchen

Our stand needs a kitchen where each item takes time to make. Drinks take 300 ms, snacks 600 ms (we use short times so you do not fall asleep).

📄 **Create `src/kitchen.js`**

```js
// The kitchen cooks slowly. Everything here returns a PROMISE.
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const prepTimeMs = { drink: 300, snack: 600 };

// Make one order line. `broken` is a list of item ids we cannot make today.
export async function prepareLine(line, { broken = [] } = {}) {
  const { itemId, emoji, name, quantity, category } = line;
  await wait(prepTimeMs[category] ?? 400);
  if (broken.includes(itemId)) {
    throw new Error(`Sorry, we cannot make ${name} right now`);
  }
  return `${emoji} ${name} x${quantity} is ready`;
}

// One line after another (slow).
export async function prepareInOrder(order, options) {
  const messages = [];
  for (const line of order.lines) {
    messages.push(await prepareLine(line, options));
  }
  return messages;
}

// Everybody works at the same time (fast). Fails if any line fails.
export function prepareTogether(order, options) {
  return Promise.all(order.lines.map((line) => prepareLine(line, options)));
}

// Everybody works at the same time, and we report what worked and what did not.
export async function prepareWhatWeCan(order, options) {
  const results = await Promise.allSettled(order.lines.map((line) => prepareLine(line, options)));
  return results.map((result) =>
    result.status === 'fulfilled' ? result.value : `❌ ${result.reason.message}`,
  );
}

// Give up if the promise takes too long.
export function withTimeout(promise, ms) {
  let timerId;
  const timeout = new Promise((_, reject) => {
    timerId = setTimeout(() => reject(new Error(`Took longer than ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timerId));
}
```

📄 **Replace `src/index.js`**

```js
// The front desk: one place to import everything from.
export { stand } from './stand.js';
export { default as menu, findItem, describeItem } from './menu.js';
export { discountRules } from './discounts.js';
export { createCashbox } from './cashbox.js';
export { createOrderCounter } from './order-numbers.js';
export { addToCart, cartSubtotal, cartLines } from './cart.js';
export { Order, TakeAwayOrder } from './order.js';
export { PickupTimer } from './pickup-timer.js';
export * from './kitchen.js';
export * from './money.js'; // re-export EVERYTHING that money.js shares
```

Now let the CLI use the kitchen. (The `PickupTimer` is not needed here any more. We will give it a job on the web page in Step 16.)

📄 **Replace `cli.js`**

```js
// cli.js - the Lemonade Stand, version 0.11 (now with an async kitchen!)
import {
  stand,
  menu,
  describeItem,
  createCashbox,
  createOrderCounter,
  addToCart,
  Order,
  TakeAwayOrder,
  prepareInOrder,
  prepareTogether,
  prepareWhatWeCan,
  withTimeout,
  toRupees,
  lineTotal,
} from './src/index.js';

const nextOrderNumber = createOrderCounter();
const cashbox = createCashbox();

function placeOrder(OrderType, { customer, cart, discountNames = [] }) {
  const order = OrderType.fromCart({ id: nextOrderNumber(), customer, cart, discountNames });
  cashbox.deposit(order.total);

  console.log(order.describe());
  for (const { quantity, emoji, name, pricePaise } of order.lines) {
    console.log(`  ${quantity} x ${emoji} ${name} = ₹${toRupees(lineTotal(pricePaise, quantity))}`);
  }
  const { subtotal, afterDiscounts, tax } = order;
  console.log(
    `  Items ₹${toRupees(subtotal)}, after discounts ₹${toRupees(afterDiscounts)}, tax ₹${toRupees(tax)}`,
  );
  return order;
}

// Run an async job and say how long it took (rounded to half seconds).
async function timed(label, task) {
  const start = Date.now();
  const result = await task();
  const seconds = Math.round((Date.now() - start) / 500) / 2;
  console.log(`${label} took about ${seconds} second(s)`);
  return result;
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

// --- The kitchen cooks (this is async!) ---
console.log('--- Kitchen ---');
await timed('One by one', () => prepareInOrder(first));
const messages = await timed('All together', () => prepareTogether(first));
console.log(messages.join('\n'));

// One thing is broken today: show what worked and what did not.
const partial = await prepareWhatWeCan(first, { broken: ['sandwich'] });
console.log(partial.join('\n'));

// Give up if it takes too long.
try {
  await withTimeout(prepareTogether(first), 100);
} catch (error) {
  console.log('Gave up:', error.message);
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
--- Kitchen ---
One by one took about 1.5 second(s)
All together took about 0.5 second(s)
🍋 Lemonade x2 is ready
🍪 Choc Cookie x1 is ready
🥪 Cheese Sandwich x1 is ready
🍋 Lemonade x2 is ready
🍪 Choc Cookie x1 is ready
❌ Sorry, we cannot make Cheese Sandwich right now
Gave up: Took longer than 100ms
Order #1 is ready! 🎉 (status: ready)
```

---

## 6. What just happened?

- `prepareInOrder` used `await` **inside a loop**, so the three items were made one by one: 300 + 600 + 600 = about 1.5 s. Correct here (a one-pot kitchen!), but wasteful when jobs are independent.
- `prepareTogether` used `Promise.all(... .map(...))`. The `.map` *starts* all three promises immediately and `all` waits for the slowest: about 0.5 s.
- `prepareWhatWeCan` used `Promise.allSettled`, so a broken sandwich machine did not spoil the lemonade and cookie. We turned each result into a friendly message.
- `withTimeout` used `Promise.race` between the real work and a stopwatch that rejects. The stopwatch won, and we caught the error with `try/catch`.
- Inside `withTimeout` we `clearTimeout` in `.finally`, so a **won** race does not leave a stopwatch ticking forever.
- **Important:** giving up on a promise does **not** stop the work. The cooks kept cooking for the abandoned order in the background. To really cancel work you need an `AbortController`, which you meet in Step 17.
- Top-level `await` (Step 9) let us write `await` straight in `cli.js` with no wrapper function.

## 🧪 Try it yourself

1. Change the `withTimeout` limit from `100` to `2000`. Run. Does it still "give up"?
2. Add `iced-tea` and `mango` to the cart, mark `broken: ['mango', 'sandwich']`, and look at the `allSettled` result.
3. **Turn a callback into a promise.** Wrap `PickupTimer` (from Step 11) so you can `await` it:
   ```js
   import { PickupTimer } from './src/index.js'; // add to the imports
   const countdown = (seconds) =>
     new Promise((resolve) => {
       new PickupTimer(seconds, { onDone: resolve }).start();
     });
   await countdown(2);
   console.log('Two seconds passed!');
   ```
4. **Predict, then run.** What do these print?
   ```js
   const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
   const result = wait(10).then(() => 5);
   console.log(result + 1);
   console.log((await result) + 1);
   ```
   <details>
   <summary>Answer</summary>

   `[object Promise]1`, then `6`. Without `await` you added a number to the *receipt*, not to the coffee. Forgetting `await` is the most common promise bug.
   </details>

## ⚠️ Mistakes everyone makes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| Forgetting `await` | You get a `Promise` instead of the value | Add `await` |
| `await` inside a loop for independent jobs | Slow: jobs wait in a line | `Promise.all(items.map(...))` |
| Using `await` in a plain (non-async) function in a script | `SyntaxError` | Make the function `async` (or use a module) |
| A promise that rejects with no `catch` | `unhandledRejection` crash in Node | Always handle failures |
| `new Promise(...)` wrapped around something that already returns a promise | Needless noise, and errors can be swallowed | Just return the promise |
| `forEach(async ...)` | `forEach` ignores the promises, so nothing waits | `for...of` with `await`, or `Promise.all(map(...))` |
| Thinking `race` with a timeout cancels the work | The work keeps running | Use `AbortController` (Step 17) |

## ✅ Checkpoint

- [ ] `node cli.js` prints the kitchen section: 1.5 s one by one, 0.5 s together, a broken sandwich, and a timeout
- [ ] I can say the three states: pending, fulfilled, rejected
- [ ] I can chain `.then`, `.catch` and `.finally`
- [ ] I can write an `async` function and use `await` with `try/catch`
- [ ] I know `async` functions always return promises
- [ ] I can run independent jobs in parallel with `Promise.all`
- [ ] I know `all`, `allSettled`, `race` and `any`, and when to use each
- [ ] I know a timeout does not cancel the work

**Files in your project now:** `package.json`, `cli.js`, `hello.js`, `index.html`, `playground.js`, and `src/` with `stand.js`, `money.js`, `menu.js`, `discounts.js`, `cashbox.js`, `order-numbers.js`, `cart.js`, `order.js`, `pickup-timer.js`, `kitchen.js`, `index.js`, `banner.js`

**Next:** [Step 13: Event loop & timers](13-event-loop-and-timers.md)
