# Step 10: Classes - The Cookie Cutter

> **Like I'm 5:** A class is a cookie cutter. Each time you press it, you get a new cookie with the same shape. Private fields (`#`) are the sprinkles you keep hidden inside the cookie.

| | |
|---|---|
| **Concept lesson** | [10. Classes](../concepts/10-classes.md) |
| **Time** | About 50 minutes |
| **You will build** | Version 0.9 of the stand: a real `Order` class (with private data and a tax rate), and a `TakeAwayOrder` that extends it |
| **Files you touch** | `playground.js`, `src/cart.js`, `src/order.js` (new), `src/index.js`, `cli.js` |
| **Before** | [Step 9: Modules](09-modules.md) |

## Words to know

| Word | Like I'm 5 |
|------|------------|
| **Class** | A cookie cutter: the shape for making many similar things. |
| **Instance** | One cookie pressed out by the cutter. |
| **`constructor`** | The part that runs when a cookie is pressed. It sets the cookie up. |
| **`new`** | The press. `new Order(...)` makes an instance. |
| **Field** | A compartment every cookie gets. |
| **`#private`** | A compartment hidden inside. Code outside the class cannot touch it. |
| **`static`** | Belongs to the cutter itself, not to each cookie. |
| **Getter** | A function that looks like a property: `order.total`. |
| **`extends` / `super`** | Make a fancier cutter from an existing one. `super` calls up to the original. |

---

## 1. The big idea

In Step 8 an "order" was just a cart plus a handful of loose functions. That works, but the data (lines, discounts, status) and the things you do with it (`total`, `markReady`) float apart, and anyone can change anything.

A **class** ties them together: the data, the rules, and the actions live in one package. And it can **hide** the parts nobody else should touch.

```text
  class Order  (the cutter)
 ┌──────────────────────────────┐
 │ id, customer          public │   ← anyone can read these
 │ #lines, #status       hidden │   ← only the class itself touches these
 │ get total             getter │   ← looks like data, is a calculation
 │ markReady()           method │   ← something an order can do
 │ static taxRate        shared │   ← one value for ALL orders
 └──────────────────────────────┘
        │ new Order(...)   │ new Order(...)
        ▼                  ▼
     order #1           order #2        ← instances (cookies)
```

---

## 2. Play: your first class

📄 **Replace `playground.js`**

```js
class Account {
  #balance = 0; // private field
  static bankName = 'Acme'; // belongs to the class, not each object

  constructor(owner) {
    this.owner = owner;
  }

  deposit(amount) {
    if (amount <= 0) throw new RangeError('Amount must be positive');
    this.#balance += amount;
    return this; // returning `this` lets us chain: a.deposit().deposit()
  }

  get balance() {
    return this.#balance; // a getter
  }

  static create(owner) {
    return new Account(owner); // a static method
  }
}

const acc = new Account('Asha').deposit(100).deposit(50);
console.log(acc.balance);
console.log(Account.bankName);
console.log(Account.create('Ravi').owner);
console.log(acc); // the private balance is NOT shown
// console.log(acc.#balance); // un-comment me: a SyntaxError, the lid is shut
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
150
Acme
Ravi
Account { owner: 'Asha' }
```

Un-comment the last line and Node refuses to even start: `SyntaxError: Private field '#balance' must be declared in an enclosing class`. The program is rejected **before** it runs, so there is no sneaky way around it.

### `#private` vs `_convention`

Some programmers use `_secret` to *politely ask* people not to touch something. That is only a request:

```js
class Old {
  constructor() {
    this._secret = 1;
  }
}
console.log(new Old()._secret); // 1  (anyone can still read it)
```

`#secret` is **enforced by JavaScript itself**. Use `#` for real privacy.

### Inheritance: a fancier cutter

📄 **Replace `playground.js`**

```js
class Account {
  #balance = 0;

  constructor(owner) {
    this.owner = owner;
  }

  deposit(amount) {
    this.#balance += amount;
    return this;
  }

  get balance() {
    return this.#balance;
  }
}

class SavingsAccount extends Account {
  constructor(owner, rate) {
    super(owner); // MUST call super first, before using `this`
    this.rate = rate;
  }

  addInterest() {
    return this.deposit(this.balance * this.rate);
  }
}

const savings = new SavingsAccount('Meera', 0.1).deposit(200);
savings.addInterest();
console.log(savings.balance);
console.log(savings instanceof SavingsAccount, savings instanceof Account);
console.log(Object.getPrototypeOf(SavingsAccount.prototype) === Account.prototype);
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
220
true true
true
```

- `class SavingsAccount extends Account` means "like an `Account`, plus more".
- `super(owner)` runs the parent's constructor. A child **must** call it before touching `this`.
- The last line proves what Step 6 told you: classes are a neat costume over **prototypes**. `SavingsAccount.prototype`'s parent is `Account.prototype`.

### Where do methods live?

📄 **Replace `playground.js`**

```js
class Counter {
  count = 0; // a class field: a fresh one for every counter
  decrement() {
    this.count--;
  }
  increment = () => {
    this.count++; // an arrow function FIELD: remembers `this` (see Step 11)
  };
}

const c1 = new Counter();
const c2 = new Counter();

console.log(c1.decrement === c2.decrement); // normal methods: ONE shared copy on the prototype
console.log(c1.increment === c2.increment); // arrow fields: each counter gets its own copy
console.log(Object.hasOwn(c1, 'count'), Object.hasOwn(c1, 'decrement'));

const { increment } = c1; // pull the function OUT of the object...
increment(); // ...and it still knows its counter
console.log(c1.count);
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
true
false
true false
1
```

Normal methods are **shared** through the prototype (cheap: one copy for a million objects). Arrow-function fields are **copied** into every instance (more memory, but the method can never lose its `this`). Step 11 explains why that matters.

---

## 3. Build: an `Order` class

We will teach the stand what an *order* is. Three small changes first.

### Step A: a helper that turns a cart into order lines

An order must remember the price **at the moment it was placed**, even if the menu changes later. So we copy the useful details from the menu into each line.

📄 **Replace `src/cart.js`**

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

// Turn cart lines into "snapshot" lines that remember name and price at this moment.
export function cartLines(cart) {
  return cart.map(({ itemId, quantity }) => {
    const { name, emoji, pricePaise, category } = findItem(itemId);
    return { itemId, name, emoji, pricePaise, category, quantity };
  });
}
```

### Step B: the class itself

📄 **Create `src/order.js`**

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

### Step C: let the front desk share the new things

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
export * from './money.js'; // re-export EVERYTHING that money.js shares
```

### Step D: use orders in `cli.js`

We also trim the small demo lines from earlier steps so that the file stays friendly.

📄 **Replace `cli.js`**

```js
// cli.js - the Lemonade Stand, version 0.9 (now with classes!)
import {
  stand,
  menu,
  describeItem,
  createCashbox,
  createOrderCounter,
  addToCart,
  Order,
  TakeAwayOrder,
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

console.log('Status before:', first.status);
first.markReady();
console.log('Status after:', first.status);
console.log(
  'Second is a TakeAwayOrder?',
  second instanceof TakeAwayOrder,
  '| and an Order?',
  second instanceof Order,
);
console.log('Tax rate for ALL orders:', Order.taxRate);
console.log('Cash box now holds ₹' + toRupees(cashbox.balance));
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
Status before: new
Status after: ready
Second is a TakeAwayOrder? true | and an Order? true
Tax rate for ALL orders: 0.05
Cash box now holds ₹274.85
```

Notice the odd money like `₹80.6` and `₹3.6`. Real prices have two decimals (`₹80.60`). We fix that properly in Step 19.

---

## 4. What just happened?

- `new TakeAwayOrder(...)` was created by `TakeAwayOrder.fromCart(...)`. Inside the static method, `new this(...)` means "make one of **whichever class I was called on**". That is why `Order.fromCart` makes an `Order` and `TakeAwayOrder.fromCart` makes a `TakeAwayOrder`, with no extra code.
- `#lines`, `#discountNames`, and `#status` are hidden. The only way to see lines is the `lines` getter, which hands out **copies**. A caller cannot sneak in `order.lines.push(...)` and change our data.
- The only way to change `status` is `markReady()`. There is no `order.status = 'refunded'` back door (a getter without a setter ignores or rejects assignment).
- `TakeAwayOrder` reuses everything in `Order`, then **overrides** `total` and `describe`. `super.total` and `super.describe()` ask the parent for its answer first.
- `static taxRate` lives on the class: `Order.taxRate`. One value for all orders. Change it once and every order changes.
- `get subtotal`, `get tax`, `get total` are **getters**: they look like data but are recalculated every time, so they can never be out of date.

> **Prefer composition over deep inheritance.** One level of `extends` (like here) is fine. Chains of `A extends B extends C extends D` become hard to follow. When two things only *share a little code*, give one a helper object instead of inheriting.

## 🧪 Try it yourself

1. Add a `DeliveryOrder` class that extends `Order` with a `static deliveryFeePaise = 3000` and a `describe()` that mentions delivery. Place one with `placeOrder(DeliveryOrder, ...)`.
2. Add `Order.taxRate = 0.12;` as the first line after the imports in `cli.js`. Run again. Did **both** orders change?
3. Try `first.lines.push({ itemId: 'x' })` and print `first.lines.length`. Did the order's lines grow?
   <details>
   <summary>Answer</summary>

   No. `first.lines` is a fresh copy every time, so you only pushed onto a throwaway array. The real lines are safe in `#lines`.
   </details>
4. **Break it on purpose.** Remove `super(...)` from a class that extends another, or call `Order({...})` without `new`. Read the errors:
   - `ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor`
   - `TypeError: Class constructor Order cannot be invoked without 'new'`

## ⚠️ Mistakes everyone makes

| Mistake | What you see | Fix |
|---------|--------------|-----|
| Forgetting `new` | `TypeError: Class constructor ... cannot be invoked without 'new'` | `new Order(...)` |
| Using `this` before `super()` in a child | `ReferenceError: Must call super constructor...` | Call `super(...)` first |
| Reading `order.#lines` from outside | `SyntaxError: Private field ...` | Add a getter or a method |
| Writing `this.lines` when you meant `this.#lines` | `undefined` (it is a different thing) | The `#` is part of the name |
| Tall inheritance towers | Hard to understand, hard to change | Prefer composition |
| Using a class for something that has no changing data | Extra ceremony | A plain function or object is fine |

## ✅ Checkpoint

- [ ] `node cli.js` prints the output above, ending in `Cash box now holds ₹274.85`
- [ ] I can write a class with a constructor, methods, getters and a `static` member
- [ ] I can hide data with `#private`, and I know why it beats `_underscore`
- [ ] I can use `extends`, `super(...)` and `super.method()`
- [ ] I know normal methods are shared through the prototype
- [ ] I can explain why `fromCart` uses `new this`
- [ ] I prefer composition over deep inheritance

**Files in your project now:** `package.json`, `cli.js`, `hello.js`, `index.html`, `playground.js`, and `src/` with `stand.js`, `money.js`, `menu.js`, `discounts.js`, `cashbox.js`, `order-numbers.js`, `cart.js`, `order.js`, `index.js`, `banner.js`

**Next:** [Step 11: `this` & binding](11-this-and-binding.md)
