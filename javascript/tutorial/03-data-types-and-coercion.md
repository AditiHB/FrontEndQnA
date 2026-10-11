# Step 3: Data Types & Coercion - Kinds of Stuff, and a Friend Who Guesses

> **Like I'm 5:** JavaScript is a friend who tries to help. If you ask "1 plus '2'?", it guesses you want "12". That helpful guessing is called coercion, and it causes many surprises. `===` is the strict friend who never guesses.

| | |
|---|---|
| **Concept lesson** | [3. Data types & coercion](../concepts/03-data-types-and-coercion.md) |
| **Time** | About 40 minutes |
| **You will build** | Version 0.2 of the stand: it reads a typed quantity safely and stores money as whole numbers |
| **Files you touch** | `playground.js`, `cli.js` |
| **Before** | [Step 2: Variables & scope](02-variables-and-scope.md) |

## Words to know

| Word | Like I'm 5 |
|------|------------|
| **Type** | The kind of thing in a box: words, a number, yes/no, nothing... |
| **Primitive** | A simple, single value like a number or a word. |
| **`undefined`** | "Nobody has put anything in this box yet." |
| **`null`** | "I put **nothing** in this box, on purpose." |
| **Coercion** | JavaScript quietly changing one kind of thing into another. |
| **Truthy / falsy** | What the computer decides when you ask a yes/no question about *any* value. |
| **`NaN`** | "Not a Number." What you get from a maths problem that makes no sense. |

---

## 1. The big idea

A box can hold different **kinds** of things, and the kind matters. You can add two numbers. You cannot sensibly add a banana and a Tuesday.

| Type | Example | What it is |
|------|---------|------------|
| `string` | `'hello'` | Words (text) |
| `number` | `42`, `3.14` | Any ordinary number |
| `bigint` | `10n` | A giant whole number |
| `boolean` | `true`, `false` | Yes or no |
| `undefined` | `undefined` | Not filled in yet |
| `null` | `null` | Empty on purpose |
| `symbol` | `Symbol('id')` | A guaranteed-unique tag (rarely needed) |
| `object` | `{}`, `[]` | A bag of other values (Step 6 and Step 7) |

---

## 2. Play: ask JavaScript "what kind is this?"

`typeof` answers that question.

📄 **Replace `playground.js`**

```js
console.log(typeof 'hello');
console.log(typeof 42);
console.log(typeof 10n);
console.log(typeof true);
console.log(typeof undefined);
console.log(typeof Symbol('id'));
console.log(typeof null);
console.log(typeof {});
console.log(typeof []);
console.log(typeof function () {});
console.log(Array.isArray([]));
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
string
number
bigint
boolean
undefined
symbol
object
object
object
function
true
```

Three surprises, all explained:

- `typeof null` says `object`. That is a famous **old bug** from 1995 that can never be fixed because the whole web depends on it. Just remember it.
- `typeof []` says `object`, because an array is a kind of object. To ask "is this an array?", use `Array.isArray(...)`.
- Functions say `function`. They are special objects you can call.

### `undefined` vs `null`

📄 **Replace `playground.js`**

```js
let nickname; // never filled in
const middleName = null; // empty on purpose

console.log(nickname);
console.log(middleName);
console.log(null == undefined);
console.log(null === undefined);
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
undefined
null
true
false
```

Think of a form. A blank line nobody filled in is `undefined`. A line where someone wrote "none" is `null`.

---

## 3. Play: two friends, `==` and `===`

- `==` is the **guessing friend**. If the two things are different types, it converts them first, then compares.
- `===` is the **strict friend**. Different types? Not equal. No guessing.

📄 **Replace `playground.js`**

```js
console.log(0 == '0'); // guesses: turns '0' into 0 first
console.log(0 === '0'); // strict: a number is not a string

console.log(NaN === NaN); // NaN is not even equal to itself!
console.log(Number.isNaN(NaN)); // the right way to check
console.log(Object.is(NaN, NaN)); // Object.is also treats NaN as equal to itself
console.log(Object.is(0, -0)); // ...and tells apart 0 and -0
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
true
false
false
true
true
false
```

> **Rule:** always use `===` and `!==`. The guessing friend causes bugs. (Step 22 teaches a hall-monitor tool called ESLint that shouts at you if you forget.)

---

## 4. Play: truthy and falsy

When you write `if (something)`, JavaScript turns `something` into yes or no. The values that become **no** (**falsy**) are exactly these eight:

`false`, `0`, `-0`, `0n`, `''` (empty text), `null`, `undefined`, `NaN`

**Everything else is truthy**, even things that feel empty.

📄 **Replace `playground.js`**

```js
console.log(Boolean(0));
console.log(Boolean(''));
console.log(Boolean(null));
console.log(Boolean(undefined));
console.log(Boolean(NaN));
console.log('--- now the surprising ones ---');
console.log(Boolean('0')); // text that says zero
console.log(Boolean('false')); // text that says false
console.log(Boolean([])); // an empty array
console.log(Boolean({})); // an empty object
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
false
false
false
false
false
--- now the surprising ones ---
true
true
true
true
```

### The "default" tool: `??` (nullish coalescing)

Sometimes you want a fallback only when a box is **really** empty.

📄 **Replace `playground.js`**

```js
const volume = 0; // the user chose silent mode on purpose

console.log(volume || 10); // || replaces ANY falsy value, so 0 becomes 10 (oops)
console.log(volume ?? 10); // ?? only replaces null and undefined, so 0 stays

const nick = null;
console.log(nick ?? 'friend');
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
10
0
friend
```

`a ?? b` means: "use `a`, unless `a` is `null` or `undefined`, then use `b`."

---

## 5. Play: coercion (the helpful guessing)

When you mix types, JavaScript guesses what you want.

📄 **Replace `playground.js`**

```js
const glued = '5' + 3; // + with any text means "glue words together"
console.log(glued, typeof glued);

const taken = '5' - 3; // - only makes sense for numbers, so '5' becomes 5
console.log(taken, typeof taken);

console.log(true + 1); // true becomes 1
console.log([] + {}); // both become text, then glue
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
53 string
2 number
2
[object Object]
```

`'5' + 3` is `'53'` but `'5' - 3` is `2`. Same two numbers-in-disguise, totally different results. This is exactly why we do not let JavaScript guess.

### Converting on purpose (explicit conversion)

Instead of letting it guess, **tell** JavaScript what you want:

📄 **Replace `playground.js`**

```js
console.log(Number('42')); // text -> number
console.log(Number('4x')); // not a real number
console.log(parseInt('42px', 10)); // read as much number as you can, in base 10
console.log(String(123) + 1); // number -> text, then glue
console.log(Boolean('false')); // any non-empty text is truthy
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
42
NaN
42
1231
true
```

| Tool | Use it for |
|------|-----------|
| `Number(x)` | Strict: `'4x'` becomes `NaN` |
| `parseInt(x, 10)` | Forgiving: reads digits from the start |
| `String(x)` | Anything to text |
| `Boolean(x)` | Anything to yes/no |

---

## 6. Play: numbers and money

Computers store numbers in a way that cannot hold some decimals exactly, like 0.1 and 0.2.

📄 **Replace `playground.js`**

```js
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON); // "close enough" check

console.log(Number.MAX_SAFE_INTEGER);
console.log(Number.MAX_SAFE_INTEGER + 2); // too big: the answer is wrong!
console.log(9007199254740991n + 2n); // BigInt keeps giant numbers exact
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
0.30000000000000004
false
true
9007199254740991
9007199254740992
9007199254740993n
```

- `0.1 + 0.2` is **not** exactly `0.3`. Every language that uses these numbers does this. It is not a JavaScript bug.
- Above `Number.MAX_SAFE_INTEGER` whole numbers become unreliable. For giant IDs use text or `BigInt`.

### The golden rule for money

> **Never do money maths with decimals.** Count the smallest coin as a whole number.

In India the smallest coin is the **paisa** (100 paise = ₹1). So a ₹40 lemonade is stored as `4000` paise. Whole numbers add up perfectly. We only divide by 100 at the very end, when we *show* the price to a person.

---

## 7. Build: version 0.2 of the stand

Let's fix two things in our stand:

1. Money becomes whole **paise**, never decimals.
2. A customer *types* how many cups they want. Typed text is **always a string**, so we must convert it, and check that it makes sense.

📄 **Replace `cli.js`**

```js
// cli.js - the Lemonade Stand, version 0.2
const standName = 'Sunny Lemonade Stand';
const lemonadePricePaise = 4000; // ₹40.00 stored as WHOLE paise (100 paise = ₹1)
let cupsSold = 0;
let earnedPaise = 0;

// A customer types a number into a box. Typed things always arrive as TEXT!
const typedQuantity = '3';
const quantity = Number(typedQuantity); // explicit conversion: text -> number

if (Number.isNaN(quantity) || quantity <= 0) {
  console.log('Please type a number bigger than zero.');
} else {
  cupsSold += quantity;
  earnedPaise += quantity * lemonadePricePaise;
}

const nickname = null; // we do not know this customer's nickname
console.log(`Hello, ${nickname ?? 'friend'}!`);
console.log(`${standName} sold ${cupsSold} cups and earned ₹${earnedPaise / 100}.`);
```

▶️ **Run:** `node cli.js`

👀 **You should see:**

```text
Hello, friend!
Sunny Lemonade Stand sold 3 cups and earned ₹120.
```

---

## 8. What just happened?

- `typedQuantity` was text (`'3'`). `Number('3')` turned it into the number `3` **on purpose**.
- `Number.isNaN(quantity)` safely catches silly input like `'banana'`. (We use `Number.isNaN`, not `===`, because `NaN === NaN` is `false`.)
- `earnedPaise` is only whole numbers, so there are no surprise decimals.
- We divide by `100` only at the very end, to *show* rupees.
- `nickname ?? 'friend'` gave a friendly default because `nickname` was `null`.

## 🧪 Try it yourself

1. Change `typedQuantity` to `'banana'`. What does the program print? Then try `'0'`, `'-2'`, and `'2.5'`. (Notice that `'2.5'` is accepted. Is half a cup OK? Step 4 fixes that.)
2. **See the trap with your own eyes.** In `cli.js`, temporarily change `cupsSold += quantity;` to `cupsSold += typedQuantity;`. Run it. What is `cupsSold` now? Why? Put it back afterwards.
   <details>
   <summary>Answer</summary>

   `0 + '3'` glues instead of adding, so `cupsSold` becomes the **text** `'03'`. That is coercion, the "helpful" friend, in action.
   </details>
3. **Predict, then run.** What do these print?
   ```js
   console.log(1 + '2' + 3);
   console.log(1 + 2 + '3');
   ```
   <details>
   <summary>Answer</summary>

   `123` and `33`. JavaScript works left to right. In the first, `1 + '2'` is `'12'`, then `'12' + 3` is `'123'`. In the second, `1 + 2` is `3` first, then `3 + '3'` is `'33'`.
   </details>

## ⚠️ Mistakes everyone makes

| Mistake | Why it hurts | Fix |
|---------|--------------|-----|
| Using `==` | The guessing friend gives surprising `true`s | Use `===` |
| `if (x === NaN)` | `NaN` is never equal to anything, even itself | `Number.isNaN(x)` |
| Money as `0.1 + 0.2` | Tiny decimal errors | Whole paise (or cents) |
| `if (count)` when `0` is valid | `0` is falsy, so a real zero looks like "nothing" | `if (count !== undefined)` or `count ?? ...` |
| `typeof x === 'object'` to check for an object | `null` is also `'object'` | Also check `x !== null` |
| Trusting typed input | It is always text | Convert, then check with `Number.isNaN` |

## ✅ Checkpoint

- [ ] `node cli.js` prints `Hello, friend!` and `...earned ₹120.`
- [ ] I can name the main types and use `typeof`
- [ ] I know `undefined` (not filled in) from `null` (empty on purpose)
- [ ] I always use `===`
- [ ] I can list the falsy values, and I know `'0'`, `[]` and `{}` are truthy
- [ ] I know when to use `??` instead of `||`
- [ ] I store money as whole paise (or cents) and divide only to display
- [ ] I convert typed text with `Number(...)` and check with `Number.isNaN`

**Files in your project now:** `hello.js`, `index.html`, `playground.js`, `cli.js`

**Next:** [Step 4: Functions](04-functions.md)
