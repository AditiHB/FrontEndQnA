# Step 6: Objects & Prototypes - Boxes With Compartments

> **Like I'm 5:** An object is a box with labelled compartments. When you look for something in your box and it isn't there, you ask the box's parent box. The parent might have it. That chain of parent boxes is the prototype chain.

| | |
|---|---|
| **Concept lesson** | [6. Objects & prototypes](../concepts/06-objects-and-prototypes.md) |
| **Time** | About 45 minutes |
| **You will build** | Version 0.5 of the stand: a `stand` object and real menu items (name, emoji, price, stock) |
| **Files you touch** | `playground.js`, `cli.js` |
| **Before** | [Step 5: Closures](05-closures.md) |

## Words to know

| Word | Like I'm 5 |
|------|------------|
| **Object** | A box with labelled compartments. |
| **Property** | One compartment: a label (the **key**) and what is inside (the **value**). |
| **Method** | A property that holds a function, a thing the object can *do*. |
| **Prototype** | The object's parent box, where JavaScript looks if a compartment is missing. |
| **Prototype chain** | Parent, then grandparent, then great-grandparent... until the end (`null`). |
| **Optional chaining `?.`** | "Look inside, but if the box is missing, stop politely instead of crashing." |
| **Shallow vs deep copy** | Copying only the top box vs copying every box inside it too. |

---

## 1. The big idea

So far each thing in the stand has been a single value. But a lemonade is **many things at once**: a name, a picture (emoji), a price, a category, and how many are left. We need one box with many labelled compartments. That is an **object**.

```text
 lemonade
 ┌──────────────────────────────┐
 │ id:        'lemonade'        │
 │ name:      'Lemonade'        │
 │ emoji:     '🍋'              │
 │ pricePaise: 4000             │
 │ category:  'drink'           │
 │ stock:     10                │
 └──────────────────────────────┘
```

---

## 2. Play: making and changing objects

📄 **Replace `playground.js`**

```js
const user = {
  name: 'Asha',
  age: 30,
  greet() {
    return `Hi, I'm ${this.name}`; // `this` = the object the method belongs to (Step 11)
  },
};

console.log(user.name); // dot notation
console.log(user['age']); // bracket notation (the key is a string)

user.email = 'asha@example.com'; // add a compartment
delete user.age; // remove a compartment
console.log(user);
console.log(user.greet());

// Shorthand, and computed keys
const name = 'Asha';
const key = 'role';
const person = { name, [key]: 'admin' };
console.log(person);
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
Asha
30
{ name: 'Asha', greet: [Function: greet], email: 'asha@example.com' }
Hi, I'm Asha
{ name: 'Asha', role: 'admin' }
```

- `{ name }` is shorthand for `{ name: name }`.
- `{ [key]: 'admin' }` uses the **value** of `key` (`'role'`) as the label. The square brackets mean "work this out first".
- Use brackets when the key is in a variable or has odd characters, like `user['first-name']`.

---

## 3. Play: parents and the prototype chain

What happens when you ask for a compartment that is not in the box? JavaScript does not give up. It asks the box's **parent**.

📄 **Replace `playground.js`**

```js
const animal = { breathes: true };
const dog = Object.create(animal); // make a new object whose PARENT is animal
dog.barks = true;

console.log(dog.barks); // in dog itself
console.log(dog.breathes); // not in dog, found in the parent
console.log(dog.flies); // not found anywhere: undefined, not a crash

console.log(Object.getPrototypeOf(dog) === animal);
console.log(Object.hasOwn(dog, 'barks')); // dog's OWN compartment
console.log(Object.hasOwn(dog, 'breathes')); // inherited, not its own

// Classes are just a nicer way to write the same thing (Step 10)
class Animal {
  speak() {
    return 'sound';
  }
}
class Dog extends Animal {
  speak() {
    return 'woof';
  }
}
console.log(Object.getPrototypeOf(Dog.prototype) === Animal.prototype);
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
true
true
undefined
true
true
false
true
```

```text
 dog ──► animal ──► Object.prototype ──► null
 (own:    (own:        (toString, hasOwnProperty,
  barks)   breathes)    and friends)
```

The lookup goes up the chain until it finds the label or reaches `null`. That chain is why every object has `toString()` even though you never wrote it.

> **Good habits:** use `Object.hasOwn(obj, key)` to ask "is this *really* in this box?". And never change the built-in parents (like `Object.prototype`). You would change **every** object in your program.

---

## 4. Play: handy object tools, copying, and `?.`

📄 **Replace `playground.js`**

```js
const user = { name: 'Asha', city: 'Pune' };
console.log(Object.keys(user)); // the labels
console.log(Object.values(user)); // the contents
console.log(Object.entries(user)); // [label, content] pairs

// Copy a box and change one thing (a SHALLOW copy)
const older = Object.assign({}, user, { age: 31 });
console.log(older);

// freeze: nobody can change the top level... but only the top level
const frozen = Object.freeze({ name: 'Asha', pet: { kind: 'cat' } });
frozen.name = 'Ravi'; // ignored
frozen.pet.kind = 'dog'; // works! the inner box is not frozen
console.log(frozen);

// structuredClone makes a DEEP copy: every box inside is copied too
const deep = structuredClone(frozen);
deep.pet.kind = 'fish';
console.log(frozen.pet.kind, deep.pet.kind);

// Optional chaining: stop politely instead of crashing
const shop = { owner: { name: 'Asha' } };
console.log(shop.owner?.name);
console.log(shop.manager?.name);
// console.log(shop.manager.name); // un-comment me to see the crash
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
[ 'name', 'city' ]
[ 'Asha', 'Pune' ]
[ [ 'name', 'Asha' ], [ 'city', 'Pune' ] ]
{ name: 'Asha', city: 'Pune', age: 31 }
{ name: 'Asha', pet: { kind: 'dog' } }
dog fish
Asha
undefined
```

Un-comment the last line and you get `TypeError: Cannot read properties of undefined (reading 'name')`. `shop.manager` is `undefined`, and you cannot look inside `undefined`. With `?.`, JavaScript sees `undefined` and just answers `undefined` for the whole chain. It is brilliant with `??` from Step 3: `shop.manager?.name ?? 'no manager'`.

| Tool | What it does |
|------|--------------|
| `Object.keys / values / entries` | Lists **own, enumerable** compartments only (not the parent's) |
| `Object.assign({}, a, b)` | Shallow copy plus changes |
| `Object.freeze(obj)` | No changes to the top level (shallow) |
| `structuredClone(obj)` | Deep copy |
| `Object.hasOwn(obj, key)` | "Is this key really in this box?" |
| `obj?.key` | Safe lookup |

---

## 5. Build: version 0.5 of the stand

Now the stand gets real items. Each menu item is an object. The stand itself is an object too, with a nested owner and opening hours.

📄 **Replace `cli.js`**

```js
// cli.js - the Lemonade Stand, version 0.5
const stand = {
  name: 'Sunny Lemonade Stand',
  owner: { name: 'Asha', phone: null },
  hours: { open: 9, close: 17 },
  describe() {
    return `${this.name}, open ${this.hours.open}:00 to ${this.hours.close}:00`;
  },
};

// Menu items. Object.freeze stops accidental price changes.
const lemonade = Object.freeze({
  id: 'lemonade',
  name: 'Lemonade',
  emoji: '🍋',
  pricePaise: 4000,
  category: 'drink',
  stock: 10,
});

const mango = Object.freeze({
  id: 'mango',
  name: 'Mango Juice',
  emoji: '🥭',
  pricePaise: 6000,
  category: 'drink',
  stock: 8,
});

const cookie = Object.freeze({
  id: 'cookie',
  name: 'Choc Cookie',
  emoji: '🍪',
  pricePaise: 2500,
  category: 'snack',
  stock: 12,
});

function toRupees(paise) {
  return paise / 100;
}

function describeItem(item) {
  return `${item.emoji} ${item.name} - ₹${toRupees(item.pricePaise)}`;
}

function parseQuantity(text) {
  const quantity = Number(text);
  return Number.isInteger(quantity) && quantity > 0 ? quantity : null;
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

function priceFor({ item = lemonade, quantity = 1, discount = 'none' } = {}) {
  const fullPrice = lineTotal(item.pricePaise, quantity);
  return discountRules[discount](fullPrice);
}

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

function checkout(options) {
  const orderNumber = nextOrderNumber();
  const amountPaise = priceFor(options);
  cashbox.deposit(amountPaise);
  const quantity = options.quantity ?? 1;
  const { item } = options;
  console.log(
    `Order #${orderNumber}: ${item.emoji} ${item.name} x${quantity} = ₹${toRupees(amountPaise)}`,
  );
}

// --- Open the stand ---
console.log(stand.describe());
console.log('Owner phone:', stand.owner.phone ?? 'not given');
console.log('Owner city:', stand.owner.address?.city ?? 'unknown'); // no address? no crash!

console.log(describeItem(lemonade));
console.log(describeItem(mango));
console.log(describeItem(cookie));

// A special item: copy lemonade, then change a few compartments
const pinkLemonade = Object.assign({}, lemonade, {
  id: 'pink-lemonade',
  name: 'Pink Lemonade',
  pricePaise: 4500,
});
console.log(describeItem(pinkLemonade));

checkout({ item: lemonade, quantity: parseQuantity('2') });
checkout({ item: mango, quantity: parseQuantity('3'), discount: 'kids' });
checkout({ item: cookie, quantity: parseQuantity('banana') ?? 1, discount: 'happyHour' });
console.log('Cash box now holds ₹' + toRupees(cashbox.balance));
```

▶️ **Run:** `node cli.js`

👀 **You should see:**

```text
Sunny Lemonade Stand, open 9:00 to 17:00
Owner phone: not given
Owner city: unknown
🍋 Lemonade - ₹40
🥭 Mango Juice - ₹60
🍪 Choc Cookie - ₹25
🍋 Pink Lemonade - ₹45
Order #1: 🍋 Lemonade x2 = ₹80
Order #2: 🥭 Mango Juice x3 = ₹162
Order #3: 🍪 Choc Cookie x1 = ₹20
Cash box now holds ₹262
```

---

## 6. What just happened?

- Each item is an **object** with six labelled compartments. `priceFor` now takes the whole `item` instead of a loose `pricePaise`.
- `stand.describe()` is a **method**. `this` means "the stand it was called on".
- `stand.owner.address?.city` would have **crashed** without `?.`, because the owner has no `address`. Now it quietly gives `undefined`, and `?? 'unknown'` fills in a friendly word.
- `Object.freeze` protects the original menu items from accidental edits. `pinkLemonade` is a **copy** (`Object.assign({}, ...)`), so it is not frozen, and we changed three compartments on it without touching the original.
- `Object.assign` only copies the top level (**shallow**). That is fine here because our items have no inner boxes. If they had, you would use `structuredClone`.

## 🧪 Try it yourself

1. Add a `sandwich` object: `id: 'sandwich'`, `name: 'Cheese Sandwich'`, `emoji: '🥪'`, `pricePaise: 8000`, `category: 'snack'`, `stock: 5`. Add a line to describe it.
2. Try `lemonade.pricePaise = 1;` and then print `describeItem(lemonade)`. Did the price change? (In strict code, like modules from Step 9, the line would throw an error instead.)
3. Give the stand's `owner` an `address` of `{ city: 'Pune' }`. Run again. What does "Owner city" print now?
4. **Predict, then run.** What does this print?
   ```js
   const a = { inner: { n: 1 } };
   const b = Object.assign({}, a);
   b.inner.n = 99;
   console.log(a.inner.n);
   ```
   <details>
   <summary>Answer</summary>

   `99`. The copy is shallow. `a.inner` and `b.inner` are the *same* inner box. Use `structuredClone(a)` to get a true deep copy.
   </details>

## ⚠️ Mistakes everyone makes

| Mistake | What happens | Fix |
|---------|--------------|-----|
| `user.address.city` when `address` is missing | `TypeError: Cannot read properties of undefined` | `user.address?.city` |
| Thinking `const` or `freeze` protects inner boxes | Inner boxes still change | `structuredClone`, or freeze deeper |
| Copying with `b = a` and expecting a new box | Both names point to the **same** box | `Object.assign({}, a)` or `structuredClone(a)` |
| Using `for...in` without checking `Object.hasOwn` | You may also visit inherited keys | Use `Object.keys/entries` |
| Changing `Object.prototype` | Every object in the program is affected | Never |
| Using an arrow function as an object method that needs `this` | `this` is not the object | Use method shorthand `describe() {}` (Step 11) |

## ✅ Checkpoint

- [ ] `node cli.js` prints the 11 lines ending in `Cash box now holds ₹262`
- [ ] I can make an object, read with dot and bracket, add and delete
- [ ] I know shorthand `{ name }` and computed keys `{ [key]: value }`
- [ ] I can explain the prototype chain as "ask the parent box"
- [ ] I use `Object.hasOwn`, `Object.keys/values/entries`, `Object.assign`, `Object.freeze` and `structuredClone`
- [ ] I know `freeze` and `assign` are shallow
- [ ] I use `?.` to avoid crashes on missing boxes

**Files in your project now:** `hello.js`, `index.html`, `playground.js`, `cli.js`

**Next:** [Step 7: Arrays & iteration](07-arrays-and-iteration.md)
