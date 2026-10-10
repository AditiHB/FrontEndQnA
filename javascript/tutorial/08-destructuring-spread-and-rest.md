# Step 8: Destructuring, Spread & Rest - Unpacking Gifts and Pouring Marbles

> **Like I'm 5:** Destructuring is unpacking a gift box and taking out only the toys you want. Spread is pouring all the marbles from one jar into another. Rest is collecting the leftover marbles into a new jar.

| | |
|---|---|
| **Concept lesson** | [8. Destructuring, spread & rest](../concepts/08-destructuring-spread-and-rest.md) |
| **Time** | About 40 minutes |
| **You will build** | Version 0.7 of the stand: cleaner code, a cart that no longer changes behind your back, and stackable discounts |
| **Files you touch** | `playground.js`, `cli.js` |
| **Before** | [Step 7: Arrays & iteration](07-arrays-and-iteration.md) |

## Words to know

| Word | Like I'm 5 |
|------|------------|
| **Destructuring** | Unpacking a box and giving the toys inside their own names, in one line. |
| **Spread `...`** | Pouring everything from one container out into another. |
| **Rest `...`** | Scooping up all the leftovers into one new container. |
| **Shallow copy** | A copy of the top box only. The boxes inside are still shared. |

---

## 1. The big idea

Look at this line from last time:

```js
const emoji = item.emoji;
const name = item.name;
const pricePaise = item.pricePaise;
```

Three lines, and every line repeats `item.`. JavaScript has a shortcut that does all three at once:

```js
const { emoji, name, pricePaise } = item;
```

And the **three dots `...`** do two opposite jobs:

| | Where you see it | The job |
|--|------------------|---------|
| **Spread** | When you *use* values: `[...a, 3]` | Pour things **out** |
| **Rest** | When you *name* values: `(...args)` or `const [a, ...others]` | Scoop things **in** |

---

## 2. Play: unpacking arrays

For arrays, **position** decides which name each toy gets.

📄 **Replace `playground.js`**

```js
const [first, second, ...others] = [1, 2, 3, 4];
console.log(first, second, others);

const [a = 0, b = 0] = [5]; // a default for a missing seat
console.log(a, b);

const [, , third] = ['x', 'y', 'z']; // empty commas skip seats
console.log(third);

let x = 1;
let y = 2;
[x, y] = [y, x]; // swap two boxes without a spare box
console.log(x, y);
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
1 2 [ 3, 4 ]
5 0
z
2 1
```

---

## 3. Play: unpacking objects

For objects, the **label** decides which name each toy gets. The order does not matter.

📄 **Replace `playground.js`**

```js
const user = { name: 'Asha', role: 'admin', city: 'Pune' };

const { name: userName, role = 'viewer' } = user; // rename, and a default
console.log(userName, role);

const { city: location } = user; // take `city`, call it `location`
console.log(location);

const { age = 30 } = user; // `age` is missing, so the default is used
console.log(age);

// Nested: dig into boxes inside boxes
const response = { data: { items: [{ id: 1 }] } };
const {
  data: {
    items: [{ id }],
  },
} = response;
console.log(id);

// Right in a function's parameters: very common
function show({ name, city = 'unknown' }) {
  return `${name} from ${city}`;
}
console.log(show(user));
console.log(show({ name: 'Ravi' }));
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
Asha admin
Pune
30
1
Asha from Pune
Ravi from unknown
```

> **Tip:** Nested destructuring is powerful but gets hard to read when deep. If you cannot read it out loud in one breath, break it into two lines.

---

## 4. Play: spread and rest

📄 **Replace `playground.js`**

```js
// SPREAD: pour out
const a = [1, 2];
const b = [...a, 3]; // a new array: a's items, then 3
console.log(b, a); // `a` is untouched

const base = { theme: 'light', lang: 'en' };
const next = { ...base, theme: 'dark' }; // copy, then override one label
console.log(next, base);

console.log(Math.max(...[4, 9, 2])); // pour the array in as separate arguments

// WARNING: spread only copies ONE level
const settings = { colors: { main: 'teal' } };
const copy = { ...settings };
copy.colors.main = 'red'; // the inner box is shared!
console.log(settings.colors.main);

// REST: scoop in
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}
console.log(sum(1, 2, 3));

const { id, ...withoutId } = { id: 1, name: 'Asha', age: 30 }; // "everything except id"
console.log(withoutId);
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
[ 1, 2, 3 ] [ 1, 2 ]
{ theme: 'dark', lang: 'en' } { theme: 'light', lang: 'en' }
9
red
6
{ name: 'Asha', age: 30 }
```

The pattern `{ ...base, theme: 'dark' }` is the most important one in this step. It means "a **new** object that is like `base`, except for this one change". You will use it all through Steps 16-18 to update data **without changing the original**, for example `{ ...state, loading: false }`.

---

## 5. Build: version 0.7 of the stand

We make five improvements. Look for the `...` and the `{ }` and `[ ]` on the left of `=`:

1. `describeItem` unpacks its parameter right in the parentheses.
2. `addToCart` stops using `push`. It now returns a **new** cart (`[...cart, newLine]`) and leaves the old one alone. This fixes the problem we noticed in Step 7.
3. `checkout(cart, ...discountNames)` uses a **rest parameter**, so discounts can **stack**: `checkout(cart, 'kids', 'happyHour')`.
4. We unpack the cheapest item with `const [cheapest, ...others] = byPrice`.
5. A "customer menu board" hides `stock` using object rest: `({ stock, ...publicInfo }) => publicInfo`.

📄 **Replace `cli.js`**

```js
// cli.js - the Lemonade Stand, version 0.7
const stand = {
  name: 'Sunny Lemonade Stand',
  owner: { name: 'Asha', phone: null },
  hours: { open: 9, close: 17 },
  describe() {
    return `${this.name}, open ${this.hours.open}:00 to ${this.hours.close}:00`;
  },
};

const menu = [
  {
    id: 'lemonade',
    name: 'Lemonade',
    emoji: '🍋',
    pricePaise: 4000,
    category: 'drink',
    stock: 10,
  },
  {
    id: 'mango',
    name: 'Mango Juice',
    emoji: '🥭',
    pricePaise: 6000,
    category: 'drink',
    stock: 8,
  },
  {
    id: 'iced-tea',
    name: 'Iced Tea',
    emoji: '🧊',
    pricePaise: 5000,
    category: 'drink',
    stock: 6,
  },
  {
    id: 'cookie',
    name: 'Choc Cookie',
    emoji: '🍪',
    pricePaise: 2500,
    category: 'snack',
    stock: 12,
  },
  {
    id: 'sandwich',
    name: 'Cheese Sandwich',
    emoji: '🥪',
    pricePaise: 8000,
    category: 'snack',
    stock: 5,
  },
];

function toRupees(paise) {
  return paise / 100;
}

// 1. Unpack the item right in the parameter list.
function describeItem({ emoji, name, pricePaise }) {
  return `${emoji} ${name} - ₹${toRupees(pricePaise)}`;
}

const lineTotal = (pricePaise, quantity) => pricePaise * quantity;

function makeDiscount(percentOff) {
  return (amountPaise) => Math.round((amountPaise * (100 - percentOff)) / 100);
}

const discountRules = {
  kids: makeDiscount(10),
  happyHour: makeDiscount(20),
};

function createOrderCounter(start = 0) {
  let last = start;
  return function nextOrderNumber() {
    last += 1;
    return last;
  };
}

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

function findItem(itemId) {
  return menu.find((item) => item.id === itemId);
}

// 2. Spread: return a NEW cart. The old cart is left alone.
function addToCart(cart, itemId, quantity = 1) {
  return [...cart, { itemId, quantity }];
}

function cartSubtotal(cart) {
  return cart.reduce(
    (sum, { itemId, quantity }) => sum + lineTotal(findItem(itemId).pricePaise, quantity),
    0,
  );
}

// 3. Rest: collect any number of discount names, and apply them one after another.
function checkout(cart, ...discountNames) {
  const orderNumber = nextOrderNumber();
  const totalPaise = discountNames.reduce(
    (amountPaise, name) => discountRules[name](amountPaise),
    cartSubtotal(cart),
  );
  cashbox.deposit(totalPaise);

  console.log(`Order #${orderNumber}`);
  for (const { itemId, quantity } of cart) {
    const { emoji, name, pricePaise } = findItem(itemId);
    console.log(`  ${quantity} x ${emoji} ${name} = ₹${toRupees(lineTotal(pricePaise, quantity))}`);
  }
  const note = discountNames.length > 0 ? ` (${discountNames.join(' + ')} discount)` : '';
  console.log(`  Total: ₹${toRupees(totalPaise)}${note}`);
}

// --- Open the stand ---
console.log(stand.describe());
const {
  owner: { name: ownerName },
} = stand;
console.log(`Run by ${ownerName}`);

console.log('--- Menu ---');
for (const item of menu) {
  console.log(describeItem(item));
}

// 4. Array destructuring: the cheapest, and "everyone else".
const byPrice = menu.toSorted((a, b) => a.pricePaise - b.pricePaise);
const [cheapest, ...others] = byPrice;
console.log(`Cheapest: ${cheapest.name} (and ${others.length} pricier items)`);

// 5. Object rest: show customers everything EXCEPT stock.
const menuBoard = menu.map(({ stock, ...publicInfo }) => publicInfo);
console.log('Menu board keys:', Object.keys(menuBoard[0]));

// --- A customer shops ---
let cart = [];
cart = addToCart(cart, 'lemonade', 2);
cart = addToCart(cart, 'cookie');
cart = addToCart(cart, 'sandwich');

const biggerCart = addToCart(cart, 'mango');
console.log('Old cart:', cart.length, 'lines. New cart:', biggerCart.length, 'lines.');

checkout(cart);
checkout(addToCart([], 'cookie', 4), 'kids', 'happyHour');
console.log('Cash box now holds ₹' + toRupees(cashbox.balance));
```

▶️ **Run:** `node cli.js`

👀 **You should see:**

```text
Sunny Lemonade Stand, open 9:00 to 17:00
Run by Asha
--- Menu ---
🍋 Lemonade - ₹40
🥭 Mango Juice - ₹60
🧊 Iced Tea - ₹50
🍪 Choc Cookie - ₹25
🥪 Cheese Sandwich - ₹80
Cheapest: Choc Cookie (and 4 pricier items)
Menu board keys: [ 'id', 'name', 'emoji', 'pricePaise', 'category' ]
Old cart: 3 lines. New cart: 4 lines.
Order #1
  2 x 🍋 Lemonade = ₹80
  1 x 🍪 Choc Cookie = ₹25
  1 x 🥪 Cheese Sandwich = ₹80
  Total: ₹185
Order #2
  4 x 🍪 Choc Cookie = ₹100
  Total: ₹72 (kids + happyHour discount)
Cash box now holds ₹257
```

---

## 6. What just happened?

- `function describeItem({ emoji, name, pricePaise })` opens the item box in the doorway. The body no longer needs `item.` anywhere.
- `addToCart` used to change its input. Now `addToCart(cart, 'mango')` gives back a **new** cart (4 lines) while `cart` keeps its 3 lines. That is how you update data safely. We write `cart = addToCart(cart, ...)` to catch the new one.
- `...discountNames` collected `'kids', 'happyHour'` into an array. Then `reduce` ran each discount in turn: ₹100 → ₹90 (kids) → ₹72 (happy hour).
- `const [cheapest, ...others] = byPrice` took the first seat for itself and scooped up the other four.
- `({ stock, ...publicInfo }) => publicInfo` took `stock` out and kept "everything else". (In Step 22 you will meet ESLint, which may grumble that `stock` is unused. That is a *deliberate* leftover, and we will tell ESLint it is fine.)

## 🧪 Try it yourself

1. Add `'kids'` twice: `checkout(cart, 'kids', 'kids')`. What happens to the price? Is that what a real shop would want?
2. Write `const [firstDrink, secondDrink] = menu.filter(...)` for drinks only and print both names.
3. Use spread to make a **sale item**: `const saleLemonade = { ...menu[0], pricePaise: 3000 };`. Print `describeItem(saleLemonade)` and `describeItem(menu[0])`. Is the original untouched?
4. **Predict, then run.** What does this print?
   ```js
   const original = { prices: [1, 2, 3] };
   const copy = { ...original };
   copy.prices.push(4);
   console.log(original.prices.length);
   ```
   <details>
   <summary>Answer</summary>

   `4`. Spread copies only one level. `copy.prices` and `original.prices` are the same array. Use `structuredClone(original)` for a deep copy, or make a new inner array too: `{ ...original, prices: [...original.prices, 4] }`.
   </details>

## ⚠️ Mistakes everyone makes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| Destructuring `undefined` or `null`: `const { a } = undefined` | `TypeError: Cannot destructure property 'a' of 'undefined'` | Give the parameter a default: `function f({ a } = {})` |
| Thinking spread is a deep copy | Inner boxes are still shared | `structuredClone`, or spread the inner box too |
| Putting `...rest` in the middle: `[a, ...rest, b]` | `SyntaxError`. Rest must be **last**. | Move it to the end |
| Forgetting the `cart = ` when a function returns a new cart | The new cart is thrown away | `cart = addToCart(cart, ...)` |
| Super-deep nested destructuring | Nobody can read it | Break it into steps |

## ✅ Checkpoint

- [ ] `node cli.js` prints the long output ending in `Cash box now holds ₹257`
- [ ] I can unpack arrays by position and objects by label
- [ ] I can rename (`{ city: location }`) and give defaults (`{ role = 'viewer' }`)
- [ ] I can say what spread does and what rest does (same dots, opposite jobs)
- [ ] I know `{ ...obj, key: newValue }` makes a changed copy
- [ ] I know spread copies **only one level** deep
- [ ] My `addToCart` returns a new cart instead of changing the old one

**Files in your project now:** `hello.js`, `index.html`, `playground.js`, `cli.js`

**Next:** [Step 9: Modules](09-modules.md). The file is getting big, and it is time to tidy up.
