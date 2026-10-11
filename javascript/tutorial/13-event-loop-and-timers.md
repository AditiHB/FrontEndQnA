# Step 13: Event Loop & Timers - The Cook's To-Do List

> **Like I'm 5:** The cook has a to-do list. Quick tasks (like tasting the sauce) go on a fast-lane pile that is checked before every new dish. Slow tasks (like "bake for 10 minutes") go on the main to-do list. The fast lane always goes first.

| | |
|---|---|
| **Concept lesson** | [13. Event loop & timers](../concepts/13-event-loop-and-timers.md) |
| **Time** | About 50 minutes |
| **You will build** | An **end-of-day sales report** that crunches 400,000 sales *without freezing* everything else |
| **Files you touch** | `playground.js`, `src/report.js` (new), `src/index.js`, `report-cli.js` (new) |
| **Before** | [Step 12: Promises & async/await](12-promises-and-async-await.md) |

## Words to know

| Word | Like I'm 5 |
|------|------------|
| **Call stack** | The cook's hands: the one job being done right now. |
| **Web APIs / Node APIs** | The kitchen helpers (timers, network, files) who work in the background. |
| **Macrotask queue** | The main to-do list: timers, clicks, network replies. |
| **Microtask queue** | The fast-lane pile: promise callbacks and `await` continuations. |
| **Event loop** | The loop that keeps checking: "stack empty? fast lane? main list?" |
| **Chunking** | Cutting a huge job into small pieces so others get a turn. |

---

## 1. The big idea

JavaScript has one cook (Step 1), and the cook never stops moving. After each job, the **event loop** decides what comes next:

```text
 ┌───────────────────────────────────────────────┐
 │  CALL STACK   the job being done right now     │
 └──────────────────────▲────────────────────────┘
                        │ when the stack is EMPTY, the loop picks the next job:
 ┌──────────────────────┴────────────────────────┐
 │ 1st  MICROTASK QUEUE  (the fast lane)          │  promise .then, await,
 │      drain ALL of it, every time               │  queueMicrotask
 ├────────────────────────────────────────────────┤
 │ (browser: repaint the screen if needed)        │
 ├────────────────────────────────────────────────┤
 │ 2nd  MACROTASK QUEUE  (the main to-do list)    │  setTimeout, setInterval,
 │      take just ONE, then go back to the top    │  clicks, network, files
 └──────────────────────▲────────────────────────┘
                        │ finished results arrive here
 ┌──────────────────────┴────────────────────────┐
 │ Web APIs / Node APIs  (timers, network, files) │ ← the helpers working in the background
 └────────────────────────────────────────────────┘
```

**One sentence to remember:** *finish the current job, run every fast-lane task, then take one task from the main list, and repeat.*

---

## 2. Play: who goes first?

📄 **Replace `playground.js`**

```js
console.log('1 sync');

setTimeout(() => console.log('5 timeout'), 0);

Promise.resolve().then(() => console.log('3 microtask (promise)'));
queueMicrotask(() => console.log('4 microtask (queueMicrotask)'));

console.log('2 sync');
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
1 sync
2 sync
3 microtask (promise)
4 microtask (queueMicrotask)
5 timeout
```

Even though the timer says `0` milliseconds, it goes through the main list, so **every promise callback runs before it**. The numbers in the labels show the order.

### `await` is just a promise in disguise

📄 **Replace `playground.js`**

```js
async function a() {
  console.log('a starts');
  await null; // everything after this line becomes a microtask
  console.log('a continues (a microtask)');
}

console.log('before');
a();
setTimeout(() => console.log('timeout'), 0);
console.log('after');
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
before
a starts
after
a continues (a microtask)
timeout
```

An `async` function runs normally until its first `await`. Then it steps aside, the rest of the program continues (`after`), and the second half of the function waits in the fast lane.

### The fast lane is drained completely

📄 **Replace `playground.js`**

```js
setTimeout(() => console.log('timeout 1'), 0);
setTimeout(() => console.log('timeout 2'), 0);

Promise.resolve().then(() => {
  console.log('micro 1');
  Promise.resolve().then(() => console.log('micro 2 (made by micro 1)'));
});
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
micro 1
micro 2 (made by micro 1)
timeout 1
timeout 2
```

`micro 2` was created *while* the fast lane was being drained, and it still cut in front of both timers. The loop does not leave the fast lane until it is completely empty.

> **Danger:** A microtask that keeps making new microtasks forever (`function loop() { queueMicrotask(loop); }`) would **starve** timers, clicks, and painting. The page would freeze for ever.

---

## 3. Play: timers are minimums, not promises

`setTimeout(fn, 50)` does **not** mean "run in exactly 50 ms". It means "run **no sooner than** 50 ms, as soon as the cook is free".

📄 **Replace `playground.js`**

```js
const start = Date.now();

setTimeout(() => {
  const waited = Date.now() - start;
  console.log('I asked for 50 ms. Did I wait at least 200 ms?', waited >= 200);
}, 50);

// The cook is busy staring at a pot for 200 ms...
while (Date.now() - start < 200) {
  // busy
}
console.log('done being busy');
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
done being busy
I asked for 50 ms. Did I wait at least 200 ms? true
```

The timer was ready at 50 ms, but the cook's hands were full until 200 ms. A long job delays **everything**: timers, clicks, and painting.

### Starting and stopping timers

📄 **Replace `playground.js`**

```js
const cancelled = setTimeout(() => console.log('this never prints'), 100);
clearTimeout(cancelled); // changed our mind

let count = 0;
const interval = setInterval(() => {
  count += 1;
  console.log('tick', count);
  if (count === 3) {
    clearInterval(interval); // stop repeating
  }
}, 20);
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
tick 1
tick 2
tick 3
```

Always keep the id that `setTimeout`/`setInterval` returns, so you can clear it. A forgotten `setInterval` keeps running forever. (This is why `PickupTimer` has a `stop()` method.)

---

## 4. Build: a report that does not freeze everything

At closing time, the stand adds up all the day's sales. Imagine 400,000 of them (a very busy day!). Let's write two versions:

1. **`buildReport`** does it all in one go. While it runs, nothing else can run.
2. **`buildReportInChunks`** does 20,000 sales at a time, then goes to the back of the line with `setTimeout(..., 0)` so everyone else gets a turn.

📄 **Create `src/report.js`**

```js
import menu from './menu.js';
import { lineTotal } from './money.js';

// Pretend sales for testing. No randomness, so the answer is always the same.
export function makeSales(count) {
  return Array.from({ length: count }, (_, i) => ({
    itemId: menu[i % menu.length].id,
    quantity: (i % 3) + 1,
  }));
}

const emptyReport = () => ({ totalPaise: 0, byItem: {} });

function addSale(report, { itemId, quantity }) {
  const item = menu.find((candidate) => candidate.id === itemId);
  const paise = lineTotal(item.pricePaise, quantity);
  report.totalPaise += paise;
  report.byItem[itemId] = (report.byItem[itemId] ?? 0) + paise;
}

// Does ALL the work in one go. Nothing else can run until it is finished.
export function buildReport(sales) {
  const report = emptyReport();
  for (const sale of sales) {
    addSale(report, sale);
  }
  return report;
}

// Does the work in small chunks and lets the event loop breathe in between.
export function buildReportInChunks(sales, chunkSize = 10_000) {
  return new Promise((resolve) => {
    const report = emptyReport();
    let index = 0;

    function doChunk() {
      const end = Math.min(index + chunkSize, sales.length);
      for (; index < end; index++) {
        addSale(report, sales[index]);
      }
      if (index < sales.length) {
        setTimeout(doChunk, 0); // go to the back of the line: others get a turn
      } else {
        resolve(report);
      }
    }

    doChunk();
  });
}
```

(`Array.from({ length: count }, (_, i) => ...)` builds an array of `count` things. The `_` is the usual name for "I don't need this argument". `10_000` is just `10000`; the underscore makes big numbers easier to read.)

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
export * from './report.js';
export * from './money.js'; // re-export EVERYTHING that money.js shares
```

Now a program to compare them. It starts a **heartbeat**, a timer that ticks every 5 ms. If the heartbeat keeps ticking while we work, the program is "alive". If it stops, the page would be frozen.

📄 **Create `report-cli.js`**

```js
// report-cli.js - the end-of-day report. Run it with: node report-cli.js
import { makeSales, buildReport, buildReportInChunks, toRupees } from './src/index.js';

// Count how many times a "heartbeat" timer manages to tick while the work is happening.
async function countHeartbeats(work) {
  let ticks = 0;
  const heartbeat = setInterval(() => {
    ticks += 1;
  }, 5);
  const result = await work();
  clearInterval(heartbeat);
  return { ticks, result };
}

const describe = ({ ticks }) => (ticks > 0 ? 'yes' : 'no (frozen!)');

const sales = makeSales(400_000);
console.log(`Built ${sales.length} pretend sales.`);

const blocking = await countHeartbeats(() => buildReport(sales));
console.log('Blocking report: did the heartbeat keep ticking?', describe(blocking));

const chunked = await countHeartbeats(() => buildReportInChunks(sales, 20_000));
console.log('Chunked report:  did the heartbeat keep ticking?', describe(chunked));

console.log(
  'Same answer both ways?',
  JSON.stringify(blocking.result) === JSON.stringify(chunked.result),
);

const { totalPaise, byItem } = chunked.result;
console.log('Total sales: ₹' + toRupees(totalPaise));
for (const [itemId, paise] of Object.entries(byItem)) {
  console.log(`  ${itemId}: ₹${toRupees(paise)}`);
}
```

▶️ **Run:** `node report-cli.js`

👀 **You should see:**

```text
Built 400000 pretend sales.
Blocking report: did the heartbeat keep ticking? no (frozen!)
Chunked report:  did the heartbeat keep ticking? yes
Same answer both ways? true
Total sales: ₹40799910
  lemonade: ₹6400000
  mango: ₹9599940
  iced-tea: ₹8000050
  cookie: ₹4000000
  sandwich: ₹12799920
```

---

## 5. What just happened?

- The **blocking** version never let go of the cook's hands. The heartbeat timer was ready many times, but no timer can run until the stack is empty. Zero ticks.
- The **chunked** version did a slice of work, then asked for `setTimeout(doChunk, 0)`: "put me at the back of the main to-do list". In between, the loop got a chance to run the heartbeat. Several ticks.
- Both gave **the same answer**. Chunking changes *when* the work happens, not *what* it computes.
- On this machine each version takes only a few dozen milliseconds. On a phone, or with a million sales, the blocking one would freeze the screen for seconds. That is why this trick matters in browsers, where the main thread also paints the screen and handles clicks.
- `await work()` for the blocking one made no difference: the work was **already done** before `await` could do anything. `await` cannot rescue a function that hogs the cook.

> **Chunking is a patch, not a cure.** If the work is truly heavy, the best answer is a **Web Worker**: a second cook in a second kitchen. We use that in Step 17 with this same report.

In the browser there is one more helper: `requestAnimationFrame(fn)` runs `fn` right **before the next repaint**. It is the right tool for animations. You will use it in Step 16.

## 🧪 Try it yourself

1. In `report-cli.js`, change the chunk size from `20_000` to `400_000` (the whole thing in one chunk). Run again. What happens to the chunked heartbeat? Why?
   <details>
   <summary>Answer</summary>

   It says `no (frozen!)`. One giant chunk is the same as no chunking at all. The cook never gets a break.
   </details>
2. Change the chunk size to `100` and run again. Is it faster or slower overall? Why? (Hint: every chunk pays for a trip through the main list.)
   <details>
   <summary>Answer</summary>

   Much **slower**: several seconds here instead of a fraction of a second. There are now 4,000 chunks, and every one waits its turn in the main list. Chunks that are too small waste time on the trips. Chunks that are too big freeze the page. Pick a size in the middle and measure.
   </details>
3. **Predict, then run.** In which order do A to F print?
   ```js
   console.log('A');
   setTimeout(() => console.log('B'), 0);
   Promise.resolve().then(() => console.log('C'));
   (async () => {
     console.log('D');
     await null;
     console.log('E');
   })();
   console.log('F');
   ```
   <details>
   <summary>Answer</summary>

   `A D F C E B`. Sync code first: A, then D (an `async` function runs synchronously until its first `await`), then F. Then the fast lane: C, then E. Finally the timer: B.
   </details>
4. Write a function `sleep(ms)` that returns a promise using `setTimeout`. (You already know it: it is `wait` from Step 12.) Use it to print "Hello", pause for 1 second, and print "World".

## ⚠️ Mistakes everyone makes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| `setTimeout(doIt(), 1000)` | `doIt` runs **now**; the timer gets its return value | `setTimeout(doIt, 1000)` or `setTimeout(() => doIt(), 1000)` |
| Believing `setTimeout(fn, 100)` runs at exactly 100 ms | It can run later if the cook is busy | Treat delays as "at least" |
| Never calling `clearInterval` | The timer runs for ever and leaks memory | Keep the id; clear it on cleanup |
| Using a loop to "wait" (`while (Date.now() < end) {}`) | Freezes everything | `await wait(ms)` |
| Endless chains of microtasks | Timers and clicks never get a turn | Use a timer (macrotask) to continue |
| Heavy work on the main thread | Frozen page | Chunk it, or use a Web Worker |
| Animating with `setInterval` | Choppy, wastes battery | `requestAnimationFrame` |

## ✅ Checkpoint

- [ ] `node report-cli.js` shows `no (frozen!)` for blocking and `yes` for chunked, with the totals above
- [ ] I can draw the stack, the fast lane (microtasks), and the main list (macrotasks)
- [ ] I can say: *stack empty → drain all microtasks → one macrotask → repeat*
- [ ] I can predict the order of sync code, promises, and timers
- [ ] I know `await` turns the rest of a function into a microtask
- [ ] I know timer delays are minimums
- [ ] I always keep timer ids and clear them
- [ ] I know why chunking works, and why a Web Worker is better for real heavy work

**Files in your project now:** everything from Step 12, plus `src/report.js` and `report-cli.js`

**Next:** [Step 14: Iterators & generators](14-iterators-and-generators.md)
