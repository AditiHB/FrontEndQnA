# Step 11: `this` & Binding - "Who Is Talking Right Now?"

> **Like I'm 5:** `this` means "the person who is talking right now". If a friend says "I'm hungry", what "I" means depends on who said it. In JavaScript, `this` depends on how the function was called, not where it was written.

| | |
|---|---|
| **Concept lesson** | [11. `this` & binding](../concepts/11-this-and-binding.md) |
| **Time** | About 45 minutes |
| **You will build** | Version 0.10 of the stand: a `PickupTimer` that counts down "ready in 3... 2... 1..." |
| **Files you touch** | `playground.js`, `src/pickup-timer.js` (new), `src/index.js`, `cli.js` |
| **Before** | [Step 10: Classes](10-classes.md) |

## Words to know

| Word | Like I'm 5 |
|------|------------|
| **`this`** | A special word that means "the thing that is calling me right now". |
| **Call site** | The place where a function is *used* (not where it is written). |
| **`call` / `apply` / `bind`** | Three ways to say "run this function and let *this* be that thing". |
| **Lexical `this`** | An arrow function has no `this` of its own. It borrows the one from the code around it. |
| **Strict mode** | A stricter set of rules. Modules and classes always use it. |
| **Callback** | A function you hand to someone else to call later. |

---

## 1. The big idea

Most words in JavaScript mean the same thing wherever you write them. `this` is different. It is more like the word **"I"**:

- Asha says "I am hungry", so "I" means Asha.
- Ravi says the same sentence, so "I" now means Ravi.

A function is the same. `this` is decided **when the function is called**, by looking at *how* you called it:

```text
  user.greet()        ← there is a thing before the dot (user) → this = user
  greet()             ← nothing before it                    → this = undefined (strict)
  new Cookie()        ← made by `new`                        → this = the brand-new object
  greet.call(ravi)    ← you said who "I" is                  → this = ravi
```

And the big trap: when you hand a method to **someone else to call later** (a timer, a button), you often lose the thing before the dot, so you lose `this`.

---

## 2. Play: the rules, and losing `this`

📄 **Replace `playground.js`**

```js
const user = {
  name: 'Asha',
  greet() {
    console.log(`Hi, ${this.name}`);
  },
};

user.greet(); // called as obj.method() -> this = user

function whoAmI() {
  return this;
}
console.log(whoAmI()); // a plain call in strict code -> this = undefined

function Cookie(flavor) {
  this.flavor = flavor; // called with `new` -> this = the brand-new object
}
console.log(new Cookie('chocolate').flavor);

// Now watch `this` get LOST when we hand the method to someone else:
setTimeout(user.greet, 0); // lost!
setTimeout(() => user.greet(), 0); // fix 1: wrap it, so it is still called as user.greet()
setTimeout(user.greet.bind(user), 0); // fix 2: bind glues `this` on for good
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
Hi, Asha
undefined
chocolate
Hi, undefined
Hi, Asha
Hi, Asha
```

`setTimeout(user.greet, 0)` handed over only the *function*. The timer later called it with nothing before the dot, so `this` was not `user`. (In Node, `this` ends up being Node's internal timer object. In a browser it would be `window`. Either way it is not Asha.)

| How it's called | What `this` is |
|-----------------|----------------|
| `obj.method()` | `obj` |
| `fn()` (strict mode) | `undefined` |
| `new Fn()` | The new object |
| `fn.call(x)` / `fn.apply(x)` / `fn.bind(x)` | `x` |
| Arrow function | The `this` of the code **around** it |

> **Strict mode:** In very old JavaScript, a plain call like `fn()` set `this` to the giant global object, which let you change global things by accident. Strict mode (turned on with `'use strict'`, and always on inside **modules and classes**) makes it `undefined` instead. Much safer.

---

## 3. Play: `call`, `apply`, `bind`

These three let **you** decide who "I" is.

📄 **Replace `playground.js`**

```js
function intro(greeting, punctuation) {
  return `${greeting}, I'm ${this.name}${punctuation}`;
}

console.log(intro.call({ name: 'Ravi' }, 'Hello', '!')); // call: arguments one by one
console.log(intro.apply({ name: 'Meera' }, ['Namaste', '.'])); // apply: arguments in an Array

const bound = intro.bind({ name: 'Asha' }, 'Hi'); // bind: returns a NEW function
console.log(bound('?'));
console.log(bound.call({ name: 'Ravi' }, '!!')); // bind is permanent: still Asha!
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
Hello, I'm Ravi!
Namaste, I'm Meera.
Hi, I'm Asha?
Hi, I'm Asha!!
```

| Tool | Runs it now? | Arguments | Memory trick |
|------|--------------|-----------|--------------|
| `fn.call(who, a, b)` | Yes | One by one | **C**ommas |
| `fn.apply(who, [a, b])` | Yes | In an **A**rray | **A**rray |
| `fn.bind(who, a)` | **No.** It gives you a new function to run later. | Can pre-fill the first ones | **B**ook it for later |

---

## 4. Play: arrow functions borrow `this`

An arrow function has **no `this` of its own**. It borrows the `this` of the place where it was written. That is *exactly* what we want inside callbacks.

📄 **Replace `playground.js`**

```js
const timer = {
  seconds: 0,
  start() {
    setTimeout(() => {
      this.seconds++; // the arrow borrows `this` from start(), which is timer
      console.log('arrow function sees seconds =', this.seconds);
    }, 10);

    setTimeout(function () {
      // a regular function gets its own `this`, decided by the timer
      console.log('regular function sees seconds =', this.seconds);
    }, 20);
  },
};

timer.start();

// A third fix: an arrow function PROPERTY in a class. Each object carries its own copy,
// and the arrow remembers `this` for ever (you met this in Step 10).
class Bell {
  name = 'front door';
  ring = () => console.log(`${this.name} bell: ding!`);
}
const bell = new Bell();
setTimeout(bell.ring, 30); // we hand the method over, and it still knows who it is
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
arrow function sees seconds = 1
regular function sees seconds = undefined
front door bell: ding!
```

So there are **three ways to fix a lost `this`**: wrap the call in an arrow function (`() => user.greet()`), `bind` it (`user.greet.bind(user)`), or define the method as an **arrow function property** in a class (`ring = () => ...`).

**Two golden rules:**

1. **Use arrow functions for callbacks inside methods.** They keep `this`.
2. **Do not use an arrow function as an object method that needs its own `this`.** Write `greet() { ... }` and not `greet: () => { ... }`. An arrow there borrows `this` from *outside the object* (in a module that is `undefined`).

---

## 5. Build: a pickup timer

When an order is placed, customers wait. We build a little class that counts down. It is a perfect test for `this`: it needs to remember its own `secondsLeft` inside a `setInterval` callback.

📄 **Create `src/pickup-timer.js`**

```js
export class PickupTimer {
  #intervalId = null;

  constructor(seconds, { onTick = () => {}, onDone = () => {} } = {}) {
    this.secondsLeft = seconds;
    this.onTick = onTick;
    this.onDone = onDone;
  }

  start() {
    // An ARROW function: it borrows `this` from start(), so `this` is the timer.
    // (A regular `function () {}` here would get the wrong `this`.)
    this.#intervalId = setInterval(() => {
      this.secondsLeft -= 1;
      this.onTick(this.secondsLeft);
      if (this.secondsLeft <= 0) {
        this.stop();
        this.onDone();
      }
    }, 1000);
    return this;
  }

  stop() {
    clearInterval(this.#intervalId);
    this.#intervalId = null;
  }
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
export * from './money.js'; // re-export EVERYTHING that money.js shares
```

Now use it in `cli.js`. We also remove the "status before and after" lines from last time, because now the **timer** decides when an order becomes ready.

📄 **Replace `cli.js`**

```js
// cli.js - the Lemonade Stand, version 0.10 (now with a pickup timer!)
import {
  stand,
  menu,
  describeItem,
  createCashbox,
  createOrderCounter,
  addToCart,
  Order,
  TakeAwayOrder,
  PickupTimer,
  toRupees,
  lineTotal,
} from './src/index.js';

const nextOrderNumber = createOrderCounter();
const cashbox = createCashbox();

// OrderType is a CLASS passed in like any other value: Order or TakeAwayOrder.
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
const second = placeOrder(TakeAwayOrder, {
  customer: 'Ravi',
  cart: addToCart([], 'cookie', 4),
  discountNames: ['kids', 'happyHour'],
});

console.log(
  'Second is a TakeAwayOrder?',
  second instanceof TakeAwayOrder,
  '| and an Order?',
  second instanceof Order,
);
console.log('Tax rate for ALL orders:', Order.taxRate);
console.log('Cash box now holds ₹' + toRupees(cashbox.balance));

// --- Wait for the first order ---
console.log(`Order #${first.id} status: ${first.status}. Ready in 3 seconds...`);
new PickupTimer(3, {
  onTick: (secondsLeft) => console.log(`  ... ${secondsLeft}`),
  onDone: () => {
    first.markReady();
    console.log(`Order #${first.id} is ready! 🎉 (status: ${first.status})`);
  },
}).start();
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
Second is a TakeAwayOrder? true | and an Order? true
Tax rate for ALL orders: 0.05
Cash box now holds ₹274.85
Order #1 status: new. Ready in 3 seconds...
  ... 2
  ... 1
  ... 0
Order #1 is ready! 🎉 (status: ready)
```

The countdown takes three real seconds. Watch it tick.

---

## 6. What just happened?

- Inside `start()`, `this` is the timer (because we wrote `new PickupTimer(...).start()`, a call with a thing before the dot).
- The arrow function passed to `setInterval` **borrowed** that `this`. So `this.secondsLeft` is the timer's own number, on every tick.
- Had we written `setInterval(function () { this.secondsLeft -= 1 ... }, 1000)`, the timer system would have chosen `this`, and the countdown would have crashed or printed `NaN`.
- `onTick` and `onDone` are **callbacks**: functions we hand to the timer so it can call us later. They are arrow functions that do not use `this` at all, so they cannot be confused.

## 🧪 Try it yourself

1. **Make the bug.** At the bottom of `cli.js` add:
   ```js
   const spare = new PickupTimer(5);
   setTimeout(spare.stop, 100);
   ```
   Run it. You get:
   ```text
   TypeError: Cannot read private member #intervalId from an object whose class did not declare it
   ```
   `spare.stop` was handed over **without** `spare`, so `this` was wrong. Fix it **two ways**: with `.bind(spare)` and with `() => spare.stop()`. Then remove the lines.
2. In `src/pickup-timer.js`, change the arrow function inside `setInterval` to `function () { ... }` and run `node cli.js`. You get `TypeError: this.onTick is not a function`. Why? (The timer system chose `this`, so `this.secondsLeft` and `this.onTick` were looked up on the wrong thing.) Put the arrow back.
3. Use `call` to borrow a method: `Math.max.apply(null, [3, 9, 4])` gives `9`. What do you think `null` is for here? (Hint: `Math.max` does not use `this`, so we pass nothing useful.)
4. **Predict, then run.** What does this print?
   ```js
   const robot = {
     name: 'Robo',
     hi: () => `I am ${this?.name}`,
   };
   console.log(robot.hi());
   ```
   <details>
   <summary>Answer</summary>

   `I am undefined`. The arrow function borrows `this` from where it was *written*, which is the top of the module, where `this` is `undefined`. It never sees `robot`. The `?.` stops it from crashing. Write `hi() { ... }` instead.
   </details>

## ⚠️ Mistakes everyone makes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| Passing `obj.method` as a callback | `this` is lost | `() => obj.method()` or `obj.method.bind(obj)` |
| Using an arrow function as an object method | `this` is not the object | Use method shorthand `name() {}` |
| Using a regular `function` inside a method for a callback | The inner function has its own, wrong `this` | Use an arrow function |
| Calling `fn.bind(x)` and ignoring the result | `bind` returns a **new** function; the original is unchanged | `const bound = fn.bind(x)` |
| Trying to `bind` an arrow function | Nothing happens. Arrows ignore `bind`/`call`/`apply` for `this`. | Use a regular function if you need to choose `this` |
| Forgetting `new` on a constructor function | `this` is `undefined` | Use `class` + `new` |

## ✅ Checkpoint

- [ ] `node cli.js` prints the orders, then counts down `2, 1, 0` and says `Order #1 is ready!`
- [ ] I can say "`this` depends on **how** a function is called, not where it is written"
- [ ] I know the five rules in the table by heart
- [ ] I can fix a lost `this` three ways (arrow wrapper, `.bind`, arrow function)
- [ ] I can tell `call`, `apply`, and `bind` apart
- [ ] I know arrows borrow `this` and why that is perfect for callbacks inside methods
- [ ] I know modules and classes run in strict mode

**Files in your project now:** `package.json`, `cli.js`, `hello.js`, `index.html`, `playground.js`, and `src/` with `stand.js`, `money.js`, `menu.js`, `discounts.js`, `cashbox.js`, `order-numbers.js`, `cart.js`, `order.js`, `pickup-timer.js`, `index.js`, `banner.js`

**Next:** [Step 12: Promises & async/await](12-promises-and-async-await.md)
