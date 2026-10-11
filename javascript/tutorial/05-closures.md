# Step 5: Closures - The Backpack

> **Like I'm 5:** A closure is a backpack. When a function is born inside another function, it packs the toys it needs into its backpack, and it keeps them even after the grown-up function has gone home.

| | |
|---|---|
| **Concept lesson** | [5. Closures](../concepts/05-closures.md) |
| **Time** | About 40 minutes |
| **You will build** | Version 0.4 of the stand: an order counter, a cash box with a private balance, and a discount factory |
| **Files you touch** | `playground.js`, `cli.js` |
| **Before** | [Step 4: Functions](04-functions.md) |

## Words to know

| Word | Like I'm 5 |
|------|------------|
| **Closure** | A function plus the backpack of boxes it remembers from where it was born. |
| **Private state** | A box that only the function's own backpack can reach. |
| **Factory function** | A machine that builds other machines. |

---

## 1. The big idea

Remember Step 2: an inner room can see boxes in the rooms around it. Now imagine the inner function *leaves* its room and goes out into the world. Does it forget everything?

**No.** It carries a backpack with every box it needs. The grown-up function can finish and "go home", and the child still has the toys.

```text
 makeCounter()  ─── runs once, then finishes ───┐
   │ let count = 0   ←─ packed into the backpack │
   │                                              │
   └─ returns ──► [ function ] 🎒 count = 0       │   the function walks away,
                                                  │   still carrying `count`
```

---

## 2. Play: a counter that remembers

📄 **Replace `playground.js`**

```js
function makeCounter() {
  let count = 0; // packed into the backpack
  return function () {
    count += 1;
    return count;
  };
}

const counterA = makeCounter();
const counterB = makeCounter();

console.log(counterA());
console.log(counterA());
console.log(counterB()); // counterB has its OWN backpack
console.log(typeof count); // from outside, `count` is invisible
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
1
2
1
undefined
```

- Every call to `makeCounter()` makes a **new** `count` and a **new** function with its own backpack. So `counterA` and `counterB` do not disturb each other.
- Nobody outside can touch `count`. The only way to change it is to call the function. This is **private state**, and it is the most useful thing closures give you.

---

## 3. Play: factories, and variables not values

A **factory** is a function that builds functions.

📄 **Replace `playground.js`**

```js
function makeMultiplier(factor) {
  return (x) => x * factor; // remembers `factor`
}

const double = makeMultiplier(2);
const triple = makeMultiplier(3);
console.log(double(5), triple(5));

// A closure remembers the VARIABLE, not a photo of its value
let flavor = 'lemon';
const showFlavor = () => console.log('The flavor is', flavor);

flavor = 'mango'; // changed AFTER showFlavor was made
showFlavor();
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
10 15
The flavor is mango
```

The closure did not take a snapshot of `'lemon'`. It kept a *link* to the box, so it saw the change. **Closures capture variables, not values.**

---

## 4. Play: the famous loop puzzle

This was one of the most famous interview questions in JavaScript history.

📄 **Replace `playground.js`**

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log('var says', i), 0);
}

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log('let says', j), 0);
}
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
var says 3
var says 3
var says 3
let says 0
let says 1
let says 2
```

Why?

- With `var`, there is **one** shared box `i` for the whole loop. The bells ring *after* the loop is done, when `i` is `3`. All three closures look at the same box.
- With `let`, each trip around the loop gets a **brand-new** box `j`. Each closure has its own backpack.

That is the best reason to never use `var`. (The bells use `setTimeout`, which Step 13 explains.)

---

## 5. A word about memory

A backpack is only as heavy as what you put in it. A closure keeps **everything it can see** alive for as long as the closure itself exists. If a long-living closure holds a giant list, that list cannot be thrown away.

```js
let bigData = loadHugeFile();
const getSize = () => bigData.length; // keeps bigData alive

// When you are finished with it:
bigData = null; // empty the box so the cleaning robot can take the old data
```

Step 20 explains the cleaning robot (garbage collection).

---

## 6. Build: version 0.4 of the stand

We use closures three times:

1. `makeDiscount(percent)` is a **factory** that replaces three hand-written discount functions.
2. `createOrderCounter()` hands out order numbers `1, 2, 3...` with a private memory.
3. `createCashbox()` keeps the money total in a private box. Only `deposit()` can change it.

📄 **Replace `cli.js`**

```js
// cli.js - the Lemonade Stand, version 0.4
const standName = 'Sunny Lemonade Stand';
const lemonadePricePaise = 4000;

function toRupees(paise) {
  return paise / 100;
}

function parseQuantity(text) {
  const quantity = Number(text);
  return Number.isInteger(quantity) && quantity > 0 ? quantity : null;
}

const lineTotal = (pricePaise, quantity) => pricePaise * quantity;

// A factory: builds a discount machine that remembers its percentage.
function makeDiscount(percentOff) {
  return (amountPaise) => Math.round((amountPaise * (100 - percentOff)) / 100);
}

const discountRules = {
  none: makeDiscount(0),
  kids: makeDiscount(10),
  happyHour: makeDiscount(20),
};

function priceFor({ pricePaise = lemonadePricePaise, quantity = 1, discount = 'none' } = {}) {
  const fullPrice = lineTotal(pricePaise, quantity);
  return discountRules[discount](fullPrice);
}

// A counter with a private memory. Nobody can change `last` except by calling the function.
function createOrderCounter(start = 0) {
  let last = start;
  return function nextOrderNumber() {
    last += 1;
    return last;
  };
}

// A cash box with a private balance. Only deposit() can change it.
function createCashbox(startingPaise = 0) {
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

const nextOrderNumber = createOrderCounter();
const cashbox = createCashbox();

function checkout(options) {
  const orderNumber = nextOrderNumber();
  const amountPaise = priceFor(options);
  cashbox.deposit(amountPaise);
  console.log(`Order #${orderNumber}: ₹${toRupees(amountPaise)}`);
}

console.log(standName);
checkout({ quantity: parseQuantity('2') });
checkout({ quantity: parseQuantity('3'), discount: 'kids' });
checkout({ quantity: parseQuantity('banana') ?? 1, discount: 'happyHour' });
console.log('Cash box now holds ₹' + toRupees(cashbox.balance));
```

▶️ **Run:** `node cli.js`

👀 **You should see:**

```text
Sunny Lemonade Stand
Order #1: ₹80
Order #2: ₹108
Order #3: ₹32
Cash box now holds ₹220
```

---

## 7. What just happened?

- `createOrderCounter()` ran once and finished, yet `nextOrderNumber` still remembers `last`. That is the backpack.
- `createCashbox()` returns an object with two doors: `deposit` and `balance`. The variable `balancePaise` itself has **no door**. Nobody can set the balance to a million rupees by mistake.
- `get balance()` is a *getter*: it looks like a normal property (`cashbox.balance`), but it is really a function.
- `makeDiscount(10)` and `makeDiscount(20)` are two machines from the same factory, each with a different `percentOff` in its backpack.
- This is how **callbacks, event handlers, and modules** keep their private state in JavaScript. You will see the same trick in Step 16 (buttons that remember things) and Step 18 (a tiny store).

## 🧪 Try it yourself

1. Create a second stand with its own counter: `const nextOrderNumberB = createOrderCounter(100);`. What number does its first order get?
2. At the bottom of `cli.js`, try `cashbox.balance = 999999;` and then print `cashbox.balance`. What happens? (In strict code, such as the modules you will use from Step 9, this line would throw an error.)
   <details>
   <summary>Answer</summary>

   The balance stays `22000` paise (₹220). There is no setter, so the assignment is ignored. The money is safe.
   </details>
3. Write `makeGreeter(greeting)` so that `makeGreeter('Namaste')('Asha')` returns `'Namaste, Asha!'`.
4. **Predict, then run.** What does this print?
   ```js
   function outer() {
     const items = [];
     for (let i = 0; i < 3; i++) {
       items.push(() => i);
     }
     return items;
   }
   console.log(outer().map((f) => f()));
   ```
   <details>
   <summary>Answer</summary>

   `[ 0, 1, 2 ]`. Each loop turn has its own `i`. Change `let` to `var` and you get `[ 3, 3, 3 ]`.
   </details>

## ⚠️ Mistakes everyone makes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| Using `var` in a loop with a callback | All callbacks see the final value | Use `let` or `const` |
| Expecting a closure to freeze a value | It sees later changes | Copy the value into a new `const` inside the loop if you need a snapshot |
| Keeping giant data in a long-living closure | It can never be cleaned up | Set the variable to `null` when finished |
| Calling the factory every time instead of once | You get a fresh counter at 1 each time | Call `createOrderCounter()` **once** and keep the result |

## ✅ Checkpoint

- [ ] `node cli.js` prints orders #1 to #3 and a cash box of `₹220`
- [ ] I can explain a closure as "a function with a backpack"
- [ ] I can write a factory (`makeMultiplier`) and a function with private state (`makeCounter`)
- [ ] I know closures capture **variables**, not values
- [ ] I know why `let` fixes the `setTimeout` loop puzzle
- [ ] I know a long-living closure can keep memory alive

**Files in your project now:** `hello.js`, `index.html`, `playground.js`, `cli.js`

**Next:** [Step 6: Objects & prototypes](06-objects-and-prototypes.md)
