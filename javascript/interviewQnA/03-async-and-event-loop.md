# 3. Async & the Event Loop

### Q1. Explain the event loop. `Core`

> **Like I'm 5:** The cook has one pair of hands. They finish the quick tasks first, then start the next dish, and keep checking the to-do list.

**Answer:** JavaScript runs one task at a time on the call stack. Async work is handled by the browser or Node. When the stack is empty, the event loop drains the microtask queue (promise callbacks), then runs one macrotask (such as a timer), and repeats.

---

### Q2. In what order do `setTimeout(0)` and `Promise.then` run? `Core`

> **Like I'm 5:** A promise receipt goes to the fast lane. A timer goes to the regular lane. The fast lane always runs first.

**Answer:** Promise callbacks (microtasks) run before timer callbacks (macrotasks), even with a `0` ms delay. Synchronous code runs first, then all microtasks, then the timer.

---

### Q3. What is a callback hell, and how do you avoid it? `Core`

> **Like I'm 5:** You ask a friend to fetch a toy, then ask them to fetch another, then another, and each step is written inside the previous one, like nesting boxes that no one can open.

**Answer:** Deeply nested callbacks are hard to read and handle errors in. Promises flatten the chain with `.then`, and `async`/`await` makes it look sequential. Use `Promise.all` for independent steps.

---

### Q4. What is the difference between `Promise.all`, `allSettled`, `race`, and `any`? `Core`

> **Like I'm 5:** `all` needs every friend to succeed. `allSettled` waits for every friend and writes down who failed. `race` takes whoever finishes first. `any` takes the first one who succeeds.

**Answer:** `all` rejects on the first failure. `allSettled` waits for all and reports each outcome. `race` settles with the first result, success or failure. `any` resolves with the first success and rejects with an `AggregateError` only if all fail.

---

### Q5. How do you run promises in parallel with `async`/`await`? `Core`

> **Like I'm 5:** If you ask for three toys one at a time, you wait three times. If you ask for all three at once, you wait only as long as the slowest one.

**Answer:** Start the promises first, then await them together: `const [a, b] = await Promise.all([getA(), getB()])`. Awaiting each one in sequence serializes the work unnecessarily.

---

### Q6. What is a common mistake with `forEach` and `await`? `Advanced`

> **Like I'm 5:** `forEach` shouts instructions to everyone and walks away. It doesn't wait for anyone to finish.

**Answer:** `forEach` doesn't await async callbacks, so the code continues before they complete. Use `for...of` with `await` for sequential work, or `Promise.all(items.map(...))` for parallel work.

---

### Q7. How do you cancel a fetch request? `Core`

> **Like I'm 5:** You hand the messenger a cancel card, and the messenger stops when you show it.

**Answer:** Create an `AbortController`, pass `controller.signal` to `fetch`, and call `controller.abort()`. The promise rejects with an `AbortError` that you should handle separately from real failures.

---

### Q8. What is the difference between `microtask` and `macrotask` queues? `Advanced`

> **Like I'm 5:** Microtasks are sticky notes that must all be finished before the next big job starts. Macrotasks are big jobs, and only one runs at a time.

**Answer:** The microtask queue (promises, `queueMicrotask`) is fully drained after each macrotask. Macrotasks (timers, I/O, events) are processed one per loop iteration. Long microtask chains can delay rendering and timers.

---

### Q9. How do you handle errors in async code? `Core`

> **Like I'm 5:** Wrap the risky step in a safety net. Also, a promise without a net will fall silently, so always add one.

**Answer:** Use `try`/`catch` around `await`, or `.catch` on promise chains. Unhandled rejections are reported as errors in the browser and can crash Node processes by default. Listen to `unhandledrejection` as a last-resort safety net.

---

### Q10. How do generators relate to async code? `Advanced`

> **Like I'm 5:** A generator is a vending machine that pauses until you press again. `async`/`await` is built on the same idea of pausing until a receipt is ready.

**Answer:** Async functions were built on the same suspension mechanism as generators. `for await...of` consumes async iterables, which is useful for streams and paginated APIs.

---

### Q11. What is debouncing vs throttling? `Core`

> **Like I'm 5:** Debounce is waiting until someone stops talking before you answer. Throttle is answering at most once every few seconds, no matter how much they talk.

**Answer:** Debounce delays a call until input stops for a set time (search boxes). Throttle limits calls to one per interval (scroll and resize handlers).
