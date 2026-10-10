# Step 19: Strings, Numbers & Dates - Necklaces, Beads, and Calendar Cards

> **Like I'm 5:** Strings are necklaces of letters, numbers are counting beads, and dates are calendar cards. Each one has tricks, and some tricks surprise beginners, like calendar months starting at zero.

| | |
|---|---|
| **Concept lesson** | [19. Strings, numbers & dates](../concepts/19-strings-numbers-and-dates.md) |
| **Time** | About 60 minutes |
| **You will build** | Proper money (`₹80.60`, not `₹80.6`), "12 minutes ago" times, an `Order` that knows **when** it was placed, and a printed **receipt** |
| **Files you touch** | `playground.js`, `src/format.js` (new), `src/order.js`, `src/receipt.js` (new), `src/index.js`, `src/ui.js`, `cli.js`, `report-cli.js` |
| **Before** | [Step 18: Immutability & pure functions](18-immutability-and-pure-functions.md) |

## Words to know

| Word | Like I'm 5 |
|------|------------|
| **Template literal** | Text in backticks where `${...}` drops a value in. |
| **Immutable string** | You cannot change letters inside a string. Methods give you a **new** string. |
| **Padding** | Adding spaces (or stars) to make text a certain width. |
| **`Intl`** | The browser's built-in expert on how people write numbers, money, and dates in each country. |
| **Locale** | A language-and-country choice like `en-IN` (English, India) or `en-GB`. |
| **Epoch** | The starting moment all dates count from: 1 January 1970, 00:00 UTC. |
| **ISO string** | A standard way to write a moment: `2026-10-10T09:30:00.000Z`. |
| **UTC** | The world's reference clock. No daylight saving, no time zones. |

---

## 1. The big idea

Three kinds of everyday data, and each hides a surprise:

| Kind | Surprise |
|------|----------|
| **Strings** | Cannot be changed in place. Every method returns a *new* string. |
| **Numbers** | `0.1 + 0.2` is not `0.3`, and `toFixed` gives back **text**. |
| **Dates** | Months start at **0**, and the same date text can mean different moments in different time zones. |

And one big rule: **do not format for humans by hand.** `'₹' + price.toFixed(2)` looks fine until someone in another country wants `1.234,50 €`. Let the browser's `Intl` experts do it.

---

## 2. Play: strings

📄 **Replace `playground.js`**

```js
const name = 'Asha';

console.log(`Hello, ${name}! 2 + 3 = ${2 + 3}`); // template literal: any expression works
console.log(name.padStart(8, '*'), name.padEnd(8, '.') + '|');
console.log('banana'.replaceAll('a', 'A')); // replaceAll replaces EVERY match
console.log('banana'.replace('a', 'A')); // replace only changes the first
console.log('  trim me  '.trim() + '|');
console.log('a,b,c'.split(','), ['x', 'y'].join(' + '));
console.log(name.at(-1), name.slice(1, 3), name.toUpperCase());
console.log(name.includes('sh'), name.startsWith('As'), '-'.repeat(10));

// Strings are IMMUTABLE: methods return a new string and never change the old one
console.log(name.toUpperCase(), name);
try {
  name[0] = 'Z'; // strict mode: this throws
} catch (error) {
  console.log(error.name);
}
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
Hello, Asha! 2 + 3 = 5
****Asha Asha....|
bAnAnA
bAnana
trim me|
[ 'a', 'b', 'c' ] x + y
a sh ASHA
true true ----------
ASHA Asha
TypeError
```

`padStart` and `padEnd` are what you use to line text up in columns (we use them for the receipt below).

---

## 3. Play: numbers

📄 **Replace `playground.js`**

```js
console.log(Number.isInteger(5), Number.isInteger(5.5));
console.log(isNaN('abc'), Number.isNaN('abc')); // the old global isNaN guesses (coercion!)

console.log((1234.5).toFixed(2), typeof (1234.5).toFixed(2)); // toFixed gives TEXT
console.log(Math.round(2.5), Math.round(-2.5), Math.trunc(-2.7), Math.floor(-2.7));
console.log((1.005).toFixed(2)); // surprise: not 1.01!

console.log(10n ** 20n); // BigInt: giant exact whole numbers
console.log(Number.MAX_SAFE_INTEGER);

// Money: whole paise. Do the maths on integers, convert only when showing.
const price = 4000; // ₹40.00
const tax = Math.round(price * 0.05); // round ONCE, on whole paise
console.log(price + tax);
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
true false
true false
1234.50 string
3 -2 -2 -3
1.00
100000000000000000000n
9007199254740991
4200
```

- `isNaN('abc')` is `true` because it first *coerces* `'abc'` to a number. `Number.isNaN('abc')` is `false` because `'abc'` is not the value `NaN`. **Use `Number.isNaN`.**
- `Math.round(-2.5)` is `-2`: halves round toward positive infinity.
- `(1.005).toFixed(2)` is `'1.00'`, because 1.005 is really stored as 1.00499999999999989... This is why we count money in **whole paise**.

---

## 4. Play: `Intl`, the formatting expert

📄 **Replace `playground.js`**

```js
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
console.log(inr.format(1234.5));
console.log(inr.format(10199991.5)); // Indian grouping: lakhs and crores

console.log(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(1234.5));
console.log(new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(1234.5));
console.log(new Intl.NumberFormat('en', { notation: 'compact' }).format(1_250_000));

const march = new Date(Date.UTC(2026, 2, 5, 15, 30)); // a fixed moment (months start at 0!)
console.log(new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'UTC' }).format(march));
console.log(new Intl.DateTimeFormat('en-IN', { timeStyle: 'short', hourCycle: 'h23', timeZone: 'UTC' }).format(march));

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
console.log(relative.format(-2, 'day'), '|', relative.format(-1, 'day'), '|', relative.format(3, 'hour'));
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
₹1,234.50
₹1,01,99,991.50
$1,234.50
£1,234.50
1.3M
5 March 2026
15:30
2 days ago | yesterday | in 3 hours
```

Same number, several countries, several correct ways to write it (try `'de-DE'` with `'EUR'` yourself: it puts the symbol at the end and swaps the dots and commas). Writing that by hand would be a nightmare. `Intl` knows all of it.

---

## 5. Play: dates

📄 **Replace `playground.js`**

```js
const d = new Date(Date.UTC(2026, 9, 10, 9, 30)); // month 9 = OCTOBER
console.log(d.toISOString()); // the standard, safe way to write a moment
console.log(d.getUTCMonth(), d.getUTCDate(), d.getUTCFullYear()); // 9 is October

console.log(new Date('2026-10-10').toISOString()); // date-only text is read as UTC midnight
console.log(new Date(0).toISOString()); // the epoch
console.log(d.getTime()); // milliseconds since the epoch

// Date maths: add 30 days
const later = new Date(d);
later.setUTCDate(later.getUTCDate() + 30);
console.log(later.toISOString());
console.log((later - d) / (1000 * 60 * 60 * 24), 'days apart');

// A bad date does not throw. It becomes "Invalid Date" with a NaN time.
const broken = new Date('not a date');
console.log(Number.isNaN(broken.getTime()), String(broken));
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
2026-10-10T09:30:00.000Z
9 10 2026
2026-10-10T00:00:00.000Z
1970-01-01T00:00:00.000Z
1791624600000
2026-11-09T09:30:00.000Z
30 days apart
true Invalid Date
```

**The date traps, in one table:**

| Trap | Why | Do this |
|------|-----|---------|
| Months start at **0** | January is `0`, October is `9`. `getMonth()` (and `getUTCMonth()`) return 0 to 11 | Say it out loud when you write it |
| `new Date('2026-10-10')` is **UTC** midnight, but `new Date(2026, 9, 10)` is **local** midnight | In a time zone behind UTC, the first can be *yesterday's date* when you read it locally | Be consistent. Prefer ISO strings and UTC for storing and sending |
| `new Date('rubbish')` does not throw | You get `Invalid Date` | Check `Number.isNaN(date.getTime())` |
| Adding days by `+ 86400000` | Daylight-saving days are 23 or 25 hours long | `setDate(getDate() + n)` |
| Showing a UTC time to a person | They live in a time zone | Format with `Intl.DateTimeFormat` (it uses their zone unless you say otherwise) |

> **The rule:** store and send dates as **ISO strings in UTC**. Convert to the person's local time only when you **show** it. For heavy date maths and time zones, use a library like date-fns, or the upcoming built-in `Temporal` (check browser support).

---

## 6. Build: proper formatting for the stand

### A. One file for everything that shows text to people

Two of the three formatters are created **once** and reused. (Step 20 measures why that is smart.) The `now` argument lets us pass the clock in, which keeps `timeAgo` **pure** (Step 18!) and easy to test.

📄 **Create `src/format.js`**

```js
// Created ONCE and reused: making a new Intl formatter is surprisingly slow (see Step 20).
const rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

// Paise (a whole number) in, text for people out: 8060 -> "₹80.60"
export function formatMoney(paise) {
  return rupees.format(paise / 100);
}

// A Date in, a time like "15:42" out. Leave `timeZone` out to use the person's own time zone.
export function formatTime(date, { timeZone } = {}) {
  return new Intl.DateTimeFormat('en-IN', {
    timeStyle: 'short',
    hourCycle: 'h23',
    timeZone,
  }).format(date);
}

// "2 minutes ago", "yesterday". `now` can be passed in, so the function stays pure and testable.
export function timeAgo(date, now = Date.now()) {
  const seconds = Math.trunc((new Date(date).getTime() - now) / 1000); // negative = in the past
  const units = [
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) {
      return relative.format(Math.trunc(seconds / size), unit);
    }
  }
  return relative.format(seconds, 'second');
}
```

### B. An order that knows when it was placed

Two additions: a `placedAt` date (stored as a real `Date`), and `toJSON()`, so `JSON.stringify(order)` produces clean data with the date as an ISO string. We also switch `describe()` to `formatMoney`.

📄 **Replace `src/order.js`**

```js
import { cartLines } from './cart.js';
import { discountRules } from './discounts.js';
import { StandError } from './errors.js';
import { formatMoney } from './format.js';
import { lineTotal } from './money.js';

export class Order {
  static taxRate = 0.05; // ONE tax rate shared by every order

  #lines; // hidden: only code inside this class can touch these
  #discountNames;
  #status = 'new';

  constructor({ id, customer = 'friend', lines, discountNames = [], placedAt = new Date() }) {
    if (lines.length === 0) {
      throw new StandError('An order needs at least one item');
    }
    this.id = id;
    this.customer = customer;
    this.placedAt = placedAt;
    this.#lines = lines.map((line) => ({ ...line })); // our own copies
    this.#discountNames = [...discountNames];
  }

  // A static method belongs to the class. `this` is the class that was called (Order or a child).
  static fromCart({ id, customer, cart, discountNames, placedAt }) {
    return new this({ id, customer, lines: cartLines(cart), discountNames, placedAt });
  }

  // `for (const line of order)` works. It hands out copies of the lines.
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
    return `Order #${id} for ${customer}: ${this.#lines.length} line(s), total ${formatMoney(total)}`;
  }

  // JSON.stringify(order) calls this. Private fields are not copied by default, so we choose what to share.
  toJSON() {
    return {
      id: this.id,
      customer: this.customer,
      status: this.#status,
      placedAt: this.placedAt.toISOString(), // dates travel as ISO strings in UTC
      lines: this.lines,
      total: this.total,
    };
  }
}

// A fancier order: it costs a little extra for the box.
export class TakeAwayOrder extends Order {
  static packagingFeePaise = 500;

  get total() {
    return super.total + TakeAwayOrder.packagingFeePaise;
  }

  describe() {
    const fee = formatMoney(TakeAwayOrder.packagingFeePaise);
    return `${super.describe()} [take-away, includes ${fee} box fee]`;
  }
}
```

### C. A receipt, with padding

A real till roll is a fixed number of characters wide. `padEnd` pushes the price to the right edge, `padStart` centres the title, and `repeat` draws the dashed line. We keep this file separate because we only load it **on demand** (Step 9's dynamic `import()`).

📄 **Create `src/receipt.js`**

```js
import { formatMoney, formatTime } from './format.js';
import { lineTotal } from './money.js';
import { Order } from './order.js';

// A plain-text receipt, `width` characters wide, like a real till roll.
export function formatReceipt(order, { width = 32, timeZone } = {}) {
  const dash = '-'.repeat(width);
  const center = (text) => text.padStart(Math.floor((width + text.length) / 2));
  const row = (left, right) => left.padEnd(width - right.length) + right;

  const lines = [
    center('SUNNY LEMONADE STAND'),
    `Order #${order.id} for ${order.customer}`,
    `Placed at ${formatTime(order.placedAt, { timeZone })}`,
    dash,
    ...order.lines.map(({ quantity, name, pricePaise }) =>
      row(`${quantity} x ${name}`, formatMoney(lineTotal(pricePaise, quantity))),
    ),
    dash,
    row('Items', formatMoney(order.subtotal)),
  ];

  const discount = order.subtotal - order.afterDiscounts;
  if (discount > 0) {
    lines.push(row('Discounts', `-${formatMoney(discount)}`));
  }
  lines.push(row(`Tax (${Math.round(Order.taxRate * 100)}%)`, formatMoney(order.tax)));
  const boxFee = order.total - order.afterDiscounts - order.tax;
  if (boxFee > 0) {
    lines.push(row('Take-away box', formatMoney(boxFee)));
  }
  lines.push(row('TOTAL', formatMoney(order.total)), dash, center(`Thank you, ${order.customer}!`));

  return lines.join('\n');
}
```

### D. Share the new names

📄 **Replace `src/index.js`**

```js
// The front desk: one place to import everything from.
export { stand } from './stand.js';
export { default as menu, initialStock, findItem } from './menu.js';
export { discountRules } from './discounts.js';
export { createCashbox } from './cashbox.js';
export { orderNumbers } from './order-numbers.js';
export {
  addToCart,
  setQuantity,
  removeFromCart,
  reduceStock,
  cartSubtotal,
  cartLines,
  parseQuantity,
} from './cart.js';
export { Order, TakeAwayOrder } from './order.js';
export { PickupTimer } from './pickup-timer.js';
export { createStore } from './store.js';
export { deepFreeze } from './freeze.js';
export { defaultSettings, parseSettings } from './settings.js';
export * from './errors.js';
export * from './format.js';
export * from './kitchen.js';
export * from './report.js';
export * from './money.js'; // re-export EVERYTHING that money.js shares
```

### E. The page shows money and times properly

Only the text changes. Every `₹${toRupees(...)}` becomes `formatMoney(...)`, and the server's orders list shows `timeAgo(receivedAt)`.

📄 **Replace `src/ui.js`**

```js
import { cartLines, cartSubtotal, formatMoney, lineTotal, timeAgo } from './index.js';

// A tiny helper to build an element. `dataset` is handled separately because it cannot be assigned.
// Usage: el('li', { className: 'row' }, 'some text', anotherElement)
function el(tag, { dataset = {}, ...props } = {}, ...children) {
  const element = document.createElement(tag);
  Object.assign(element, props);
  Object.assign(element.dataset, dataset);
  element.append(...children);
  return element;
}

function actionButton(text, action, label, disabled = false) {
  const button = el('button', { type: 'button', textContent: text, disabled, dataset: { action } });
  button.setAttribute('aria-label', label);
  return button;
}

export function renderMenu(listElement, menu, stock) {
  const rows = menu.map(({ id, name, emoji, pricePaise }) => {
    const left = stock[id] ?? 0;
    return el(
      'li',
      { className: 'row', dataset: { id } },
      el('span', { className: 'label', textContent: `${emoji} ${name}` }),
      el('span', { className: 'stock', textContent: `${left} left` }),
      el('span', { textContent: formatMoney(pricePaise) }),
      actionButton(left > 0 ? 'Add' : 'Sold out', 'add', `Add ${name} to cart`, left === 0),
    );
  });
  listElement.replaceChildren(...rows);
}

export function renderCart(listElement, totalElement, cart) {
  const rows = cartLines(cart).map(({ itemId, quantity, emoji, name, pricePaise }) =>
    el(
      'li',
      { className: 'row', dataset: { id: itemId } },
      el('span', { className: 'label', textContent: `${emoji} ${name}` }),
      actionButton('−', 'dec', `Fewer ${name}`),
      el('span', { className: 'qty', textContent: String(quantity) }),
      actionButton('+', 'inc', `More ${name}`),
      el('span', { textContent: formatMoney(lineTotal(pricePaise, quantity)) }),
      actionButton('✕', 'remove', `Remove ${name} from cart`),
    ),
  );
  listElement.replaceChildren(...rows);
  totalElement.textContent =
    cart.length === 0 ? 'Your cart is empty.' : `Total: ${formatMoney(cartSubtotal(cart))}`;
}

export function setMessage(element, text, kind = 'info') {
  element.textContent = text;
  element.dataset.kind = kind;
}

export function addBoardLine(board, text) {
  const line = el('li', { textContent: text });
  board.append(line);
  return line;
}

export function renderServerOrders(listElement, orders) {
  const rows = orders.map(({ id, customer, takeAway, table, lines, receivedAt }) => {
    const extras = [takeAway ? 'take-away' : null, table ? `table ${table}` : null].filter(Boolean);
    const suffix = extras.length > 0 ? ` (${extras.join(', ')})` : '';
    return el('li', {
      className: 'row',
      textContent: `#${id} ${customer}${suffix}: ${lines.length} line(s), ${timeAgo(receivedAt)}`,
    });
  });
  if (rows.length === 0) {
    rows.push(el('li', { className: 'row', textContent: 'No orders yet.' }));
  }
  listElement.replaceChildren(...rows);
}

export function renderReport(listElement, { totalPaise, byItem }) {
  const rows = Object.entries(byItem).map(([itemId, paise]) =>
    el('li', { className: 'row', textContent: `${itemId}: ${formatMoney(paise)}` }),
  );
  rows.unshift(el('li', { className: 'row', textContent: `Total: ${formatMoney(totalPaise)}` }));
  listElement.replaceChildren(...rows);
}
```

### F. The command line, with receipts on demand

We pretend the first order was placed at exactly **9:30 UTC on 10 October 2026**, so that your screen matches the book. (`Date.UTC(2026, 9, 10, 9, 30)`: month **9** is October!) Normally you leave the time zone out, and the person's own one is used.

📄 **Replace `cli.js`**

```js
// cli.js - the Lemonade Stand, version 0.15 (now with proper formatting!)
import {
  stand,
  menu,
  createCashbox,
  orderNumbers,
  addToCart,
  reduceStock,
  initialStock,
  Order,
  TakeAwayOrder,
  kitchenUpdates,
  formatMoney,
  formatTime,
  timeAgo,
  lineTotal,
} from './src/index.js';

const orderIds = orderNumbers();
const nextOrderNumber = () => orderIds.next().value;
const cashbox = createCashbox();

const menuLine = ({ emoji, name, pricePaise }) => `${emoji} ${name} - ${formatMoney(pricePaise)}`;

function placeOrder(OrderType, { customer, cart, discountNames = [], placedAt }) {
  const order = OrderType.fromCart({
    id: nextOrderNumber(),
    customer,
    cart,
    discountNames,
    placedAt,
  });
  cashbox.deposit(order.total);

  console.log(order.describe());
  for (const { quantity, emoji, name, pricePaise } of order) {
    console.log(
      `  ${quantity} x ${emoji} ${name} = ${formatMoney(lineTotal(pricePaise, quantity))}`,
    );
  }
  const { subtotal, afterDiscounts, tax } = order;
  console.log(
    `  Items ${formatMoney(subtotal)}, after discounts ${formatMoney(afterDiscounts)}, tax ${formatMoney(tax)}`,
  );
  return order;
}

// Dynamic import (Step 9): the banner file is only loaded if asked: node cli.js --banner
if (process.argv.includes('--banner')) {
  const { showBanner } = await import('./src/banner.js');
  showBanner(stand);
}

// --- Open the stand ---
console.log(stand.describe());
console.log('--- Menu ---');
for (const item of menu) {
  console.log(menuLine(item));
}

// --- Two orders, at a pretend time: 10 October 2026, 09:30 UTC (month 9 is October!) ---
const opening = Date.UTC(2026, 9, 10, 9, 30);
console.log('--- Orders ---');

let cart = addToCart([], 'lemonade', 3);
cart = addToCart(cart, 'cookie');
cart = addToCart(cart, 'sandwich');
const first = placeOrder(Order, { customer: 'Asha', cart, placedAt: new Date(opening) });

const second = placeOrder(TakeAwayOrder, {
  customer: 'Ravi',
  cart: addToCart([], 'cookie', 4),
  discountNames: ['kids', 'happyHour'],
  placedAt: new Date(opening + 5 * 60 * 1000), // five minutes later
});

const stock = reduceStock(reduceStock(initialStock, first.lines), second.lines);
console.log('Lemonade left:', stock.lemonade, '| Cookies left:', stock.cookie);
console.log('Cash box now holds', formatMoney(cashbox.balance));

// --- Dates ---
const now = opening + 12 * 60 * 1000; // pretend it is now 12 minutes after opening
console.log(
  `Asha ordered ${timeAgo(first.placedAt, now)}, Ravi ordered ${timeAgo(second.placedAt, now)}`,
);
console.log('Asha ordered at', formatTime(first.placedAt, { timeZone: 'UTC' }), 'UTC');
console.log('As data:', JSON.stringify(second).slice(0, 78) + '...');

// Dynamic import (Step 9): the receipt code is only loaded if asked: node cli.js --receipt
if (process.argv.includes('--receipt')) {
  const { formatReceipt } = await import('./src/receipt.js');
  console.log();
  console.log(formatReceipt(first, { timeZone: 'UTC' }));
  console.log();
  console.log(formatReceipt(second, { timeZone: 'UTC' }));
  console.log();
}

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
🍋 Lemonade - ₹40.00
🥭 Mango Juice - ₹60.00
🧊 Iced Tea - ₹50.00
🍪 Choc Cookie - ₹25.00
🥪 Cheese Sandwich - ₹80.00
--- Orders ---
Order #1 for Asha: 3 line(s), total ₹236.25
  3 x 🍋 Lemonade = ₹120.00
  1 x 🍪 Choc Cookie = ₹25.00
  1 x 🥪 Cheese Sandwich = ₹80.00
  Items ₹225.00, after discounts ₹225.00, tax ₹11.25
Order #2 for Ravi: 1 line(s), total ₹80.60 [take-away, includes ₹5.00 box fee]
  4 x 🍪 Choc Cookie = ₹100.00
  Items ₹100.00, after discounts ₹72.00, tax ₹3.60
Lemonade left: 7 | Cookies left: 7
Cash box now holds ₹316.85
Asha ordered 12 minutes ago, Ravi ordered 7 minutes ago
Asha ordered at 09:30 UTC
As data: {"id":2,"customer":"Ravi","status":"new","placedAt":"2026-10-10T09:35:00.000Z"...
--- Kitchen board ---
  🍋 Lemonade x3 is ready
  🍪 Choc Cookie x1 is ready
  🥪 Cheese Sandwich x1 is ready
Order #1 is ready! 🎉 (status: ready)
```

No more `₹80.6`: it is `₹80.60`. Now ask for the receipts:

▶️ **Run:** `node cli.js --receipt`

👀 **You should see:**

```text
Sunny Lemonade Stand, open 9:00 to 17:00
--- Menu ---
🍋 Lemonade - ₹40.00
🥭 Mango Juice - ₹60.00
🧊 Iced Tea - ₹50.00
🍪 Choc Cookie - ₹25.00
🥪 Cheese Sandwich - ₹80.00
--- Orders ---
Order #1 for Asha: 3 line(s), total ₹236.25
  3 x 🍋 Lemonade = ₹120.00
  1 x 🍪 Choc Cookie = ₹25.00
  1 x 🥪 Cheese Sandwich = ₹80.00
  Items ₹225.00, after discounts ₹225.00, tax ₹11.25
Order #2 for Ravi: 1 line(s), total ₹80.60 [take-away, includes ₹5.00 box fee]
  4 x 🍪 Choc Cookie = ₹100.00
  Items ₹100.00, after discounts ₹72.00, tax ₹3.60
Lemonade left: 7 | Cookies left: 7
Cash box now holds ₹316.85
Asha ordered 12 minutes ago, Ravi ordered 7 minutes ago
Asha ordered at 09:30 UTC
As data: {"id":2,"customer":"Ravi","status":"new","placedAt":"2026-10-10T09:35:00.000Z"...

      SUNNY LEMONADE STAND
Order #1 for Asha
Placed at 09:30
--------------------------------
3 x Lemonade             ₹120.00
1 x Choc Cookie           ₹25.00
1 x Cheese Sandwich       ₹80.00
--------------------------------
Items                    ₹225.00
Tax (5%)                  ₹11.25
TOTAL                    ₹236.25
--------------------------------
        Thank you, Asha!

      SUNNY LEMONADE STAND
Order #2 for Ravi
Placed at 09:35
--------------------------------
4 x Choc Cookie          ₹100.00
--------------------------------
Items                    ₹100.00
Discounts                -₹28.00
Tax (5%)                   ₹3.60
Take-away box              ₹5.00
TOTAL                     ₹80.60
--------------------------------
        Thank you, Ravi!

--- Kitchen board ---
  🍋 Lemonade x3 is ready
  🍪 Choc Cookie x1 is ready
  🥪 Cheese Sandwich x1 is ready
Order #1 is ready! 🎉 (status: ready)
```

### G. The report, in lakhs and crores

📄 **Replace `report-cli.js`**

```js
// report-cli.js - the end-of-day report. Run it with: node report-cli.js
import { makeSales, buildReport, buildReportInChunks, formatMoney } from './src/index.js';

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
console.log('Total sales:', formatMoney(totalPaise));
for (const [itemId, paise] of Object.entries(byItem)) {
  console.log(`  ${itemId}: ${formatMoney(paise)}`);
}
```

▶️ **Run:** `node report-cli.js`

👀 **You should see:**

```text
Built 400000 pretend sales.
Blocking report: did the heartbeat keep ticking? no (frozen!)
Chunked report:  did the heartbeat keep ticking? yes
Same answer both ways? true
Total sales: ₹4,07,99,910.00
  lemonade: ₹64,00,000.00
  mango: ₹95,99,940.00
  iced-tea: ₹80,00,050.00
  cookie: ₹40,00,000.00
  sandwich: ₹1,27,99,920.00
```

Reload the page at **http://localhost:3000**. Prices show as `₹40.00`, the report totals use lakhs and crores, and after you place an order, the **Recent orders** list says things like "now" and "1 minute ago". (It does not update by itself yet. We fix that in Step 20.)

---

## 7. What just happened?

- **`Intl.NumberFormat('en-IN', ...)`** formatted `8060` paise as `₹80.60` and used **lakh/crore grouping** (`₹4,07,99,910.00`) for Indian readers. We never wrote a rule for any of that.
- **Money maths stayed on whole numbers.** We only divide by 100 inside `formatMoney`, at the very edge.
- **`timeAgo(date, now)`** takes the clock as an argument: it is pure, so the same inputs always give "12 minutes ago". In the browser we call it without `now`, and the default `Date.now()` is used.
- **Dates travel as ISO strings.** `toJSON()` turned `placedAt` into `"2026-10-10T09:35:00.000Z"`, a standard, time-zone-proof format.
- **`padEnd`, `padStart`, `repeat`** drew a receipt. Without `Intl`, `formatMoney` could never have given us right-aligned columns that look this tidy.
- **Dynamic import again:** `receipt.js` is only loaded when you pass `--receipt`.
- The receipt computes the *discount* and the *box fee* from totals (`subtotal - afterDiscounts`, `total - afterDiscounts - tax`) so it needs no special code for `TakeAwayOrder`.

## 🧪 Try it yourself

1. Change `formatMoney` in `src/format.js` to use `'en-US'` and `'USD'`. Reload the page. Did the whole app change at once? (That is the benefit of formatting in **one** place.) Put it back.
2. Change `width` in the receipt to `40`. Do the columns still line up?
3. Print the order's date in the long form: `new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short', timeZone: 'UTC' }).format(first.placedAt)` at the bottom of `cli.js`.
4. **Predict, then run.** What do these print?
   ```js
   console.log(new Date(2026, 0, 31).getMonth());
   console.log(0.1 * 3, (0.1 * 3).toFixed(2));
   console.log(['b', 'a', 'C'].sort(), ['b', 'a', 'C'].sort((x, y) => x.localeCompare(y)));
   ```
   <details>
   <summary>Answer</summary>

   `0` (January is month 0), then `0.30000000000000004 0.30`, then `[ 'C', 'a', 'b' ]` and `[ 'a', 'b', 'C' ]`. The default sort compares character codes (capital letters come first). `localeCompare` sorts the way people expect.
   </details>

## ⚠️ Mistakes everyone makes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| `'₹' + price.toFixed(2)` for display | Wrong for other countries; `toFixed` rounds oddly | `Intl.NumberFormat` |
| Money as decimals | `0.1 + 0.2 !== 0.3` | Whole paise or cents |
| `price.toFixed(2) + 1` | `toFixed` returns **text**, so you get `"40.001"` | Do maths first, `toFixed` last, and only to display |
| `isNaN('abc')` | `true`, because of coercion | `Number.isNaN` |
| `new Date(2026, 10, 1)` expecting November... | It *is* November (10 = November) but the surprise is the other way: people write `10` meaning October | Months start at 0 |
| Storing dates as local text like `"10/11/2026"` | Is that 10 November or 11 October? | ISO strings in UTC |
| Calling `new Intl.NumberFormat(...)` inside a loop | Slow | Create it once and reuse (Step 20) |
| `string.replace('a', 'b')` expecting all matches | Only the first changes | `replaceAll` |
| `text[0] = 'Z'` | Silently does nothing (or throws in strict mode) | Strings are immutable: build a new one |

## ✅ Checkpoint

- [ ] `node cli.js` shows `₹80.60`-style money, "12 minutes ago", and ISO data; `node cli.js --receipt` prints two aligned receipts
- [ ] `node report-cli.js` shows `₹4,07,99,910.00` style totals
- [ ] The page shows `₹40.00` and "now"/"1 minute ago"-style times in Recent orders
- [ ] I can use template literals, `padStart`, `padEnd`, `replaceAll`, `trim`, `split`, `at`
- [ ] I know strings are immutable
- [ ] I know `toFixed` returns text, and why money uses whole paise
- [ ] I use `Number.isNaN` and `Number.isInteger`
- [ ] I use `Intl` for money, numbers, dates, and relative times
- [ ] I know months start at 0, and I store dates as ISO strings in UTC

**Files in your project now:** everything from Step 18, plus `src/format.js` and `src/receipt.js`. `src/order.js`, `src/index.js`, `src/ui.js`, `cli.js`, and `report-cli.js` are updated.

**Next:** [Step 20: Performance & memory](20-performance-and-memory.md)
