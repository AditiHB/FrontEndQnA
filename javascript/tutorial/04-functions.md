# Step 4: Functions - The Vending Machines

> **Like I'm 5:** A function is a vending machine. You put in coins (arguments), it does a job, and it gives you back a snack (return value). You can even hand a machine to a friend to use later.

| | |
|---|---|
| **Concept lesson** | [4. Functions](../concepts/04-functions.md) |
| **Time** | About 45 minutes |
| **You will build** | Version 0.3 of the stand: prices, quantities, and discounts all become small machines |
| **Files you touch** | `playground.js`, `cli.js` |
| **Before** | [Step 3: Data types & coercion](03-data-types-and-coercion.md) |

## Words to know

| Word | Like I'm 5 |
|------|------------|
| **Function** | A machine with a name. You can use it again and again. |
| **Parameter** | A slot on the machine where a coin goes in. It has a name. |
| **Argument** | The actual coin you put into the slot. |
| **Return value** | The snack that falls out. |
| **Arrow function** | A short way to write a machine: `(a, b) => a + b`. |
| **Default parameter** | A coin the machine uses if you forget to put one in. |
| **Rest parameter** | A slot that catches *all* the leftover coins: `...coins`. |
| **Pure function** | A machine that only uses its slots and does nothing sneaky. |
| **Side effect** | Sneaky: changing something outside the machine, or talking to the outside world. |

---

## 1. The big idea

Look at the last program we wrote. Every time we need a price, we would have to copy and paste the maths. That is slow and easy to get wrong. Instead we build a **machine** once and use it forever.

```text
    arguments (coins in)
        │    │
        ▼    ▼
   ┌─────────────────┐
   │  lineTotal(     │   ← the function: a named machine
   │   price, qty)   │
   └────────┬────────┘
            ▼
      return value (snack out)
```

---

## 2. Play: three ways to build a machine

📄 **Replace `playground.js`**

```js
console.log(add(2, 3)); // works: function declarations are hoisted

// 1. A declaration
function add(a, b) {
  return a + b;
}

// 2. An expression: a nameless machine stored in a box
const subtract = function (a, b) {
  return a - b;
};

// 3. An arrow function: the short way
const multiply = (a, b) => a * b;
const square = (x) => x * x;

console.log(subtract(10, 4));
console.log(multiply(3, 4));
console.log(square(5));

function noReturn() {
  const lonely = 1;
}
console.log(noReturn()); // no "return" means the snack is "undefined"

// console.log(later(1)); // un-comment me: expressions are NOT hoisted
// const later = (x) => x;
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
5
6
12
25
undefined
```

| Style | Hoisted? | When to use |
|-------|----------|-------------|
| Declaration `function add() {}` | Yes. You can call it above its line. | Main named helpers |
| Expression `const f = function () {}` | No. It is a normal box, locked until its line. | Rare |
| Arrow `const f = () => {}` | No (same as above) | Short callbacks and small helpers |

If an arrow function has just one thing to return, you can skip the curly braces **and** the word `return`: `(a, b) => a * b`.

Un-comment the last two lines and you get `ReferenceError: Cannot access 'later' before initialization`. Same locked box as Step 2.

---

## 3. Play: slots with defaults, leftovers, and labels

📄 **Replace `playground.js`**

```js
// A default parameter: used when no coin is given
function greet(name = 'friend') {
  return `Hello ${name}`;
}
console.log(greet());
console.log(greet('Asha'));

// A rest parameter: collects ALL the extra coins into one list
function sum(...numbers) {
  let total = 0;
  for (const n of numbers) {
    total += n;
  }
  return total;
}
console.log(sum(1, 2, 3, 4));

// Defaults can use earlier parameters
function area(width, height = width) {
  return width * height;
}
console.log(area(3)); // a square: 3 x 3

// An options object: one slot with labelled compartments
function createUser({ name, role = 'viewer' } = {}) {
  return { name, role };
}
console.log(createUser({ name: 'Asha' }));
console.log(createUser());
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
Hello friend
Hello Asha
10
9
{ name: 'Asha', role: 'viewer' }
{ name: undefined, role: 'viewer' }
```

**Why the options object?** Compare these two calls:

```js
makeOrder('Asha', 2, true, false, 'kids'); // what do true and false mean?
makeOrder({ customer: 'Asha', quantity: 2, takeAway: true, discount: 'kids' }); // clear!
```

Labelled compartments make the call readable, and you can leave any of them out. (The `{ name, role = 'viewer' }` syntax is called *destructuring*. Step 8 teaches it fully. For now, read it as "open the box and take out `name` and `role`".)

> The extra `= {}` at the end means: "if no box is given at all, use an empty one". That is why `createUser()` does not crash.

---

## 4. Play: functions are values (you can hand a machine to a friend)

In JavaScript a function is just another kind of value. You can put it in a box, in a list, or in an object, and you can pass it to another function.

📄 **Replace `playground.js`**

```js
const square = (x) => x * x;
const double = (x) => x * 2;

// Store machines in an object, like a toolbox
const tools = { square, double };
console.log(tools.square(4));

// A function that takes another function as its argument
function applyTwice(machine, value) {
  return machine(machine(value));
}
console.log(applyTwice(double, 5)); // 5 -> 10 -> 20
console.log(applyTwice(square, 3)); // 3 -> 9 -> 81

// A function that RETURNS a function
function makeAdder(amount) {
  return (x) => x + amount;
}
const addTen = makeAdder(10);
console.log(addTen(5));
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
16
20
81
15
```

A function that takes or returns another function is called a **higher-order function**. You use them constantly: `[1, 2, 3].map(n => n * 2)` hands a function to `map` (Step 7). The `makeAdder` trick, where the inner machine remembers `amount`, is called a **closure**. That is the whole of Step 5.

---

## 5. Play: pure machines and sneaky machines

A **pure** function:

1. Gives the **same answer** for the **same inputs**, always.
2. Does **nothing sneaky** (no side effects).

📄 **Replace `playground.js`**

```js
// PURE: only uses what is put in its slots
const addTax = (amountPaise, taxPercent) => Math.round((amountPaise * (100 + taxPercent)) / 100);
console.log(addTax(4000, 5));
console.log(addTax(4000, 5)); // always the same

// IMPURE: reaches outside and changes something
let count = 0;
const increment = () => ++count;
console.log(increment());
console.log(increment()); // same call, different answer!

// An IIFE: a machine that is built and run on the spot (old trick, still seen)
(function () {
  const secret = 'hidden';
  console.log('I ran right away. Secret is', secret);
})();
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
4200
4200
1
2
I ran right away. Secret is hidden
```

| | Pure | Impure |
|--|------|--------|
| Same input, same output? | Always | Not always |
| Easy to test? | Very (just try some inputs) | Harder |
| Examples | maths, formatting, filtering | `console.log`, changing a variable outside, fetching from the internet, reading the clock |

You cannot avoid side effects completely (printing to the screen is a side effect!). The trick is to keep the **middle** of your program pure and push the messy side effects to the **edges**. We use this idea in the build below, and again in Step 18.

> The IIFE (**I**mmediately **I**nvoked **F**unction **E**xpression) was the old way to make a private room before modules existed. Step 9 shows the modern way.

---

## 6. Build: version 0.3 of the stand

Let's rebuild the stand from machines. Read the comments, they explain each machine.

📄 **Replace `cli.js`**

```js
// cli.js - the Lemonade Stand, version 0.3
const standName = 'Sunny Lemonade Stand';
const lemonadePricePaise = 4000;

// A declaration: paise in, rupees out.
function toRupees(paise) {
  return paise / 100;
}

// Typed text in, a good quantity (or null) out.
function parseQuantity(text) {
  const quantity = Number(text);
  return Number.isInteger(quantity) && quantity > 0 ? quantity : null;
}

// An arrow function: short and sweet.
const lineTotal = (pricePaise, quantity) => pricePaise * quantity;

// Functions are values, so we can keep them in an object, like a book of rules.
const discountRules = {
  none: (amountPaise) => amountPaise,
  kids: (amountPaise) => Math.round(amountPaise * 0.9),
  happyHour: (amountPaise) => Math.round(amountPaise * 0.8),
};

// An options object, with a default for every compartment.
function priceFor({ pricePaise = lemonadePricePaise, quantity = 1, discount = 'none' } = {}) {
  const fullPrice = lineTotal(pricePaise, quantity);
  return discountRules[discount](fullPrice);
}

// A rest parameter collects any number of amounts.
function sum(...amounts) {
  let total = 0;
  for (const amount of amounts) {
    total += amount;
  }
  return total;
}

// --- Use the machines ---
const first = priceFor({ quantity: parseQuantity('2') });
const second = priceFor({ quantity: parseQuantity('3'), discount: 'kids' });
const third = priceFor({ quantity: parseQuantity('banana') ?? 1, discount: 'happyHour' });

console.log(standName);
console.log('Customer 1 pays ₹' + toRupees(first));
console.log('Customer 2 pays ₹' + toRupees(second));
console.log('Customer 3 pays ₹' + toRupees(third));
console.log('Total today: ₹' + toRupees(sum(first, second, third)));
```

▶️ **Run:** `node cli.js`

👀 **You should see:**

```text
Sunny Lemonade Stand
Customer 1 pays ₹80
Customer 2 pays ₹108
Customer 3 pays ₹32
Total today: ₹220
```

---

## 7. What just happened?

- `toRupees`, `parseQuantity`, `lineTotal`, `priceFor`, and `sum` are all **pure**. Give them the same coins and you get the same snack. They are easy to test.
- The only **side effects** are the `console.log` lines at the very bottom: the edge of the program.
- `discountRules` stores **functions as values**. `discountRules[discount]` looks up a machine by name, and the next `(fullPrice)` runs it.
- `priceFor` takes **one options object** with defaults, so the calls read like sentences.
- `parseQuantity('banana')` gave back `null`, and `?? 1` turned that into a quantity of 1 (Step 3's `??` again).
- Customer 2: 3 cups × ₹40 = ₹120, minus 10% = ₹108. Customer 3: 1 cup × ₹40 = ₹40, minus 20% = ₹32.

## 🧪 Try it yourself

1. Add a new rule to `discountRules` called `teacher` that takes 50% off. Make a fourth customer who uses it.
2. Write an arrow function `isHappyHour(hour)` that returns `true` when `hour` is from 15 to 17 (inclusive). Test it in `playground.js`.
3. **Break it on purpose.** Call `priceFor({ discount: 'banana' })`. What error do you get? (Step 15 teaches us to throw friendlier errors.)
   <details>
   <summary>Answer</summary>

   `TypeError: discountRules[discount] is not a function`. The lookup `discountRules['banana']` found `undefined`, and you cannot call `undefined` like a machine.
   </details>
4. Rewrite `sum` so it does not need a `for` loop. (Hint: peek ahead at `reduce` in Step 7, then come back.)

## ⚠️ Mistakes everyone makes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| Forgetting `return` | The function gives back `undefined` | Add `return` (or use an arrow function without braces) |
| `const f = () => { a: 1 }` | Returns `undefined`: the braces are treated as a function body | Wrap in parentheses: `() => ({ a: 1 })` |
| Writing `greet` instead of `greet()` | You get the machine, not the snack | Add parentheses to run it |
| Writing 5 positional arguments | Nobody remembers the order | Use one options object |
| A function that does five different jobs | Hard to read, hard to test | Small functions that do one thing |

## ✅ Checkpoint

- [ ] `node cli.js` prints the five lines ending in `Total today: ₹220`
- [ ] I can write a declaration, an expression, and an arrow function
- [ ] I know the difference between a parameter and an argument
- [ ] I can use default parameters, a rest parameter, and an options object
- [ ] I understand that functions are values I can store, pass, and return
- [ ] I can tell a pure function from an impure one
- [ ] I keep side effects (like `console.log`) at the edge

**Files in your project now:** `hello.js`, `index.html`, `playground.js`, `cli.js`

**Next:** [Step 5: Closures](05-closures.md)
