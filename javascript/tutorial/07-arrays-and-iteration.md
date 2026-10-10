# Step 7: Arrays & Iteration - A Row of Lunch Boxes

> **Like I'm 5:** An array is a row of lunch boxes. `map` makes a new row where each box is changed. `filter` keeps only the boxes you like. `reduce` squashes the whole row into one answer, like a total.

| | |
|---|---|
| **Concept lesson** | [7. Arrays & iteration](../concepts/07-arrays-and-iteration.md) |
| **Time** | About 50 minutes |
| **You will build** | Version 0.6 of the stand: a real `menu` list and a shopping `cart` |
| **Files you touch** | `playground.js`, `cli.js` |
| **Before** | [Step 6: Objects & prototypes](06-objects-and-prototypes.md) |

## Words to know

| Word | Like I'm 5 |
|------|------------|
| **Array** | A row of boxes in order. |
| **Index** | The seat number of a box. **It starts at 0**, not 1. |
| **Element** | One thing in the row. |
| **Callback** | A little function you hand to `map`, `filter` and friends so they know what to do. |
| **Mutate** | Change the original row. |
| **Iterate** | Visit every box, one after another. |

---

## 1. The big idea

We have three items as three separate boxes: `lemonade`, `mango`, `cookie`. What if the stand sells 50 things? We cannot invent 50 names. We need **one row** that holds them all, a **menu**.

```text
 index:     0          1          2
         ┌────────┐ ┌────────┐ ┌────────┐
 menu =  │lemonade│ │ mango  │ │ cookie │   ← an array
         └────────┘ └────────┘ └────────┘
```

**Seats are numbered from 0.** The first item is `menu[0]`. This is called **zero-based indexing**, and it surprises everybody exactly once.

---

## 2. Play: making, reading, adding, removing

📄 **Replace `playground.js`**

```js
const fruits = ['apple', 'banana', 'cherry'];

console.log(fruits[0]); // first seat
console.log(fruits.at(-1)); // .at(-1) counts from the END
console.log(fruits.length); // how many
console.log(fruits[5]); // no such seat: undefined

fruits.push('date'); // add to the end
fruits.unshift('apricot'); // add to the front
console.log(fruits);

console.log(fruits.pop()); // remove from the end, and tell us what it was
console.log(fruits.shift()); // remove from the front
console.log(fruits);

console.log(fruits.includes('banana'));
console.log(fruits.indexOf('kiwi')); // -1 means "not found"
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
apple
cherry
3
undefined
[ 'apricot', 'apple', 'banana', 'cherry', 'date' ]
date
apricot
[ 'apple', 'banana', 'cherry' ]
true
-1
```

---

## 3. Play: the big four - map, filter, reduce, find

These four tools do most of the work in everyday JavaScript. Each one takes a little function (a **callback**) that says what to do with each box.

📄 **Replace `playground.js`**

```js
const prices = [10, 25, 5];

console.log(prices.map((p) => p * 2)); // a NEW row, every box changed
console.log(prices.filter((p) => p > 8)); // a NEW row, only the boxes you like
console.log(prices.reduce((sum, p) => sum + p, 0)); // squash into ONE answer
console.log(prices.find((p) => p > 20)); // the FIRST box that passes
console.log(prices.some((p) => p > 20)); // does ANY box pass?
console.log(prices.every((p) => p > 0)); // do ALL boxes pass?

// Chain them like a conveyor belt
const total = prices
  .filter((p) => p > 8)
  .map((p) => p * 2)
  .reduce((sum, p) => sum + p, 0);
console.log(total);
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
[ 20, 50, 10 ]
[ 10, 25 ]
40
25
true
true
70
```

```text
 [10, 25, 5]
     │ filter (p > 8)       keep 10 and 25
     ▼
 [10, 25]
     │ map (p * 2)          double them
     ▼
 [20, 50]
     │ reduce (sum, start 0)   add them up
     ▼
     70
```

How `reduce` works, step by step: it starts with the second argument (`0`) as the *running total*. For each box it calls your function with `(running total, this box)`, and whatever you return becomes the new running total.

---

## 4. Play: changing the row vs. making a new row

Some array tools **change the original row** (they *mutate* it). Others leave it alone and give you a new row. Mixing them up causes sneaky bugs.

| Changes the original | Gives a new row |
|----------------------|-----------------|
| `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse` | `concat`, `slice`, `map`, `filter`, `toSorted`, `toReversed`, `toSpliced` |

📄 **Replace `playground.js`**

```js
const numbers = [3, 1, 2];
const sorted = numbers.toSorted(); // a new, sorted row
console.log(sorted, numbers); // the original is untouched

numbers.sort(); // sort() changes the row itself!
console.log(numbers);

// Sorting numbers: the default sort compares as TEXT
console.log([10, 9, 100].sort());
console.log([10, 9, 100].sort((a, b) => a - b)); // give it a comparison function

const letters = ['a', 'b', 'c', 'd'];
console.log(letters.slice(1, 3)); // copy a piece: letters is unchanged
console.log(letters);
console.log(letters.splice(1, 2)); // cut a piece OUT of letters
console.log(letters);
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
[ 1, 2, 3 ] [ 3, 1, 2 ]
[ 1, 2, 3 ]
[ 10, 100, 9 ]
[ 9, 10, 100 ]
[ 'b', 'c' ]
[ 'a', 'b', 'c', 'd' ]
[ 'b', 'c' ]
[ 'a', 'd' ]
```

Why is `[10, 9, 100].sort()` equal to `[10, 100, 9]`? Without help, `sort` turns everything into **text** and compares letter by letter. `'10'` comes before `'9'` because `'1'` comes before `'9'`. The comparison function `(a, b) => a - b` says "if the answer is negative, `a` goes first". **Always give `sort` a comparison function for numbers.**

> **Rule of thumb:** Use the non-mutating versions (`toSorted`, `slice`, `map`, `filter`) whenever you can. Step 18 shows why this matters so much.

---

## 5. Play: walking through every box (loops)

📄 **Replace `playground.js`**

```js
const fruits = ['apple', 'banana', 'cherry'];

for (const fruit of fruits) {
  console.log(fruit); // each VALUE
}

fruits.forEach((fruit, index) => console.log(index, fruit)); // value AND seat number

// entries() hands out [seat, value] pairs. (The [index, fruit] part is destructuring: Step 8.)
for (const [index, fruit] of fruits.entries()) {
  console.log('seat', index, 'holds', fruit);
}

for (const fruit of fruits) {
  if (fruit === 'banana') continue; // skip this one and go on to the next
  console.log('not banana:', fruit);
}

for (const fruit of fruits) {
  if (fruit === 'banana') break; // for...of can stop early
  console.log('before banana:', fruit);
}

// Group things into piles (new in ES2024)
const people = [
  { name: 'Asha', city: 'Pune' },
  { name: 'Ravi', city: 'Delhi' },
  { name: 'Meera', city: 'Pune' },
];
const grouped = Object.groupBy(people, (person) => person.city);
console.log(Object.keys(grouped));
console.log(grouped.Pune.map((person) => person.name));
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
apple
banana
cherry
0 apple
1 banana
2 cherry
seat 0 holds apple
seat 1 holds banana
seat 2 holds cherry
not banana: apple
not banana: cherry
before banana: apple
[ 'Pune', 'Delhi' ]
[ 'Asha', 'Meera' ]
```

| Loop | Good for | Can `break`? |
|------|----------|--------------|
| `for (const x of array)` | Almost everything. Works with any iterable (Step 14). | Yes (`break`), and `continue` skips one |
| `for (const [i, x] of array.entries())` | When you need the seat number **and** the value | Yes |
| `array.forEach(fn)` | Doing something for each, no early exit | **No** |
| `array.map(fn)` | Making a new row | No |

---

## 6. Build: version 0.6 of the stand

Time to put the stand's menu in a row, and to add a **shopping cart**, which is also an array: a row of `{ itemId, quantity }` lines.

Look for these array tools while you type: `for...of`, `filter`, `map`, `join`, `toSorted`, `some`, `every`, `Object.groupBy`, `find`, `reduce`, `push`, and `forEach`.

📄 **Replace `cli.js`**

```js
// cli.js - the Lemonade Stand, version 0.6
const stand = {
  name: 'Sunny Lemonade Stand',
  owner: { name: 'Asha', phone: null },
  hours: { open: 9, close: 17 },
  describe() {
    return `${this.name}, open ${this.hours.open}:00 to ${this.hours.close}:00`;
  },
};

// The menu: a row of lunch boxes, each one an object.
// (We dropped Object.freeze: stock will change as we sell. Step 18 shows the safe way.)
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

function describeItem(item) {
  return `${item.emoji} ${item.name} - ₹${toRupees(item.pricePaise)}`;
}

const lineTotal = (pricePaise, quantity) => pricePaise * quantity;

function makeDiscount(percentOff) {
  return (amountPaise) => Math.round((amountPaise * (100 - percentOff)) / 100);
}

const discountRules = {
  none: makeDiscount(0),
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

// --- Menu and cart tools (these use arrays!) ---
function findItem(itemId) {
  return menu.find((item) => item.id === itemId);
}

// Adds a line to the cart. NOTE: push() changes the original array. Step 8 and 18 improve this.
function addToCart(cart, itemId, quantity = 1) {
  cart.push({ itemId, quantity });
  return cart;
}

function cartSubtotal(cart) {
  return cart.reduce(
    (sum, line) => sum + lineTotal(findItem(line.itemId).pricePaise, line.quantity),
    0,
  );
}

function checkout(cart, discount = 'none') {
  const orderNumber = nextOrderNumber();
  const totalPaise = discountRules[discount](cartSubtotal(cart));
  cashbox.deposit(totalPaise);

  console.log(`Order #${orderNumber}`);
  cart.forEach((line) => {
    const item = findItem(line.itemId);
    const lineText = `${line.quantity} x ${item.emoji} ${item.name}`;
    console.log(`  ${lineText} = ₹${toRupees(lineTotal(item.pricePaise, line.quantity))}`);
  });
  const note = discount === 'none' ? '' : ` (${discount} discount)`;
  console.log(`  Total: ₹${toRupees(totalPaise)}${note}`);
}

// --- Open the stand ---
console.log(stand.describe());

console.log('--- Menu ---');
for (const item of menu) {
  console.log(describeItem(item));
}

const drinks = menu.filter((item) => item.category === 'drink');
console.log('Drinks:', drinks.map((item) => item.name).join(', '));

const byPrice = menu.toSorted((a, b) => a.pricePaise - b.pricePaise);
console.log('Cheapest first:', byPrice.map((item) => item.name).join(', '));
console.log('Anything over ₹70?', menu.some((item) => item.pricePaise > 7000));
console.log('Everything in stock?', menu.every((item) => item.stock > 0));

const byCategory = Object.groupBy(menu, (item) => item.category);
for (const category of Object.keys(byCategory)) {
  console.log(`${category}: ${byCategory[category].length} item(s)`);
}

// --- A customer shops ---
const cart = [];
addToCart(cart, 'lemonade', 2);
addToCart(cart, 'cookie', 1);
addToCart(cart, 'sandwich');
console.log('Cart lines:', cart.length);

checkout(cart);
checkout(addToCart([], 'mango', 3), 'kids');
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
Drinks: Lemonade, Mango Juice, Iced Tea
Cheapest first: Choc Cookie, Lemonade, Iced Tea, Mango Juice, Cheese Sandwich
Anything over ₹70? true
Everything in stock? true
drink: 3 item(s)
snack: 2 item(s)
Cart lines: 3
Order #1
  2 x 🍋 Lemonade = ₹80
  1 x 🍪 Choc Cookie = ₹25
  1 x 🥪 Cheese Sandwich = ₹80
  Total: ₹185
Order #2
  3 x 🥭 Mango Juice = ₹180
  Total: ₹162 (kids discount)
Cash box now holds ₹347
```

---

## 7. What just happened?

- `menu` is an **array of objects**: the real shape of data in almost every app.
- `find` looked up an item by `id`. `reduce` squashed the cart into one subtotal. `filter` + `map` + `join` made a readable sentence from the drinks.
- `toSorted` gave us a sorted menu **without** shuffling the real `menu`. If we had used `sort`, the menu itself would have changed order, a classic bug.
- `cart` is another array, and `addToCart` uses `push`, which **changes the original** array. That works, but it is the kind of thing that causes confusing bugs when two parts of a program share the same array. We fix it for real in Steps 8 and 18.
- `priceFor` from the last version is gone. Discounts now apply to the **whole cart**, which is how real shops work.

## 🧪 Try it yourself

1. Print all items **cheaper than ₹50** using `filter`.
2. Use `reduce` to find the **total stock** of the whole menu. (It should be 41.)
3. Print the **most expensive** item. (Hint: sort by price, then use `.at(-1)`.)
4. Add `addToCart(cart, 'mango')` *before* the first `checkout`. How do the total and the number of lines change?
5. **Predict, then run.** What does this print?
   ```js
   console.log(['1', '2', '3'].map(parseInt));
   ```
   <details>
   <summary>Answer</summary>

   `[ 1, NaN, NaN ]`. `map` passes **three** arguments to your callback (`value, index, array`), and `parseInt(value, index)` treats the index as the number base. Fix: `['1','2','3'].map((s) => parseInt(s, 10))` or `.map(Number)`.
   </details>

## ⚠️ Mistakes everyone makes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| `numbers.sort()` for numbers | Sorted as text: `[10, 100, 9]` | `sort((a, b) => a - b)` |
| `menu.sort(...)` when you only wanted a sorted copy | The real `menu` changes order | `menu.toSorted(...)` |
| Using `map` just to loop | You throw away a new array for nothing | Use `for...of` or `forEach` |
| Forgetting the start value in `reduce` | An empty array crashes with `TypeError` | `reduce(fn, 0)` |
| `array[array.length]` for the last item | `undefined` (that seat does not exist) | `array.at(-1)` |
| `break` inside `forEach` | `SyntaxError`. `forEach` cannot be stopped | Use `for...of` |
| Making `reduce` do everything | Hard to read | A simple loop is fine when it is clearer |

## ✅ Checkpoint

- [ ] `node cli.js` prints the long output above, ending in `Cash box now holds ₹347`
- [ ] I know indexes start at 0 and I can use `.at(-1)`
- [ ] I can use `map`, `filter`, `reduce`, `find`, `some`, `every`
- [ ] I know which methods change the original array and which do not
- [ ] I always give `sort` a comparison function for numbers
- [ ] I can loop with `for...of` and know why `forEach` cannot `break`
- [ ] I can group with `Object.groupBy`

**Files in your project now:** `hello.js`, `index.html`, `playground.js`, `cli.js`

**Next:** [Step 8: Destructuring, spread & rest](08-destructuring-spread-and-rest.md)
