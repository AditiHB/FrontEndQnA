# Step 2: Variables & Scope - Lunch Boxes With Labels

> **Like I'm 5:** `let` and `const` are lunch boxes that only exist inside your classroom. `var` is an old lunch bag that goes everywhere in the whole school. `const` means the lid can't be swapped for another box.

| | |
|---|---|
| **Concept lesson** | [2. Variables & scope](../concepts/02-variables-and-scope.md) |
| **Time** | About 30 minutes |
| **You will build** | The first version of the stand: it counts cups sold and money earned |
| **Files you touch** | `playground.js`, `cli.js` (new) |
| **Before** | [Step 1: How JavaScript runs](01-how-javascript-runs.md) |

## Words to know

| Word | Like I'm 5 |
|------|------------|
| **Variable** | A box with a name on it. You put a value inside. |
| **`const`** | A box whose lid is glued on. You can never swap in a different thing. |
| **`let`** | A box you can empty and refill. |
| **`var`** | The old kind of box. It has strange rules, so we avoid it. |
| **Scope** | Which rooms can see the box. |
| **Block** | A room made by curly braces `{ ... }`. |
| **Hoisting** | JavaScript knows about your boxes before it reads their line. |
| **Temporal dead zone** | The time when a `let` or `const` box exists but is locked. |
| **Shadowing** | A box in a small room has the same name as a box in a bigger room. The small room only sees its own. |

---

## 1. The big idea

Every program needs to **remember** things: the name of the stand, how many cups we sold, how much money is in the cash box. A **variable** is how JavaScript remembers. It is a labelled box.

```text
 ┌─────────────┐   ┌─────────────┐
 │  cupsSold   │   │  standName  │   ← the label on the box
 │      0      │   │ 'Sunny...'  │   ← what is inside
 └─────────────┘   └─────────────┘
```

---

## 2. Play: `const` and `let`

📄 **Replace `playground.js`**

```js
const standName = 'Sunny Lemonade Stand'; // glued lid: never reassigned
let cupsSold = 0;                          // refillable box

cupsSold = cupsSold + 1; // take the old number, add 1, put it back
cupsSold += 1;           // shortcut for the line above
cupsSold++;              // shortcut for "add one"

console.log(standName, cupsSold);

// Try un-commenting this line, save, and run again:
// standName = 'Another Stand';
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
Sunny Lemonade Stand 3
```

Now remove the `//` in front of `standName = 'Another Stand';` and run again. You get an error:

```text
TypeError: Assignment to constant variable.
```

That is `const` doing its job. It protects you from changing something by accident. Put the `//` back.

### The lid is glued, but the box can still be shaken

`const` stops you swapping the whole box. It does **not** freeze what is inside.

📄 **Replace `playground.js`**

```js
const prices = { lemonade: 40 };

prices.lemonade = 45; // allowed: we changed what is INSIDE the box
console.log(prices);

// prices = {};       // not allowed: that swaps the box itself
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
{ lemonade: 45 }
```

### Which one do I pick?

| Keyword | Use it when... |
|---------|----------------|
| `const` | **Almost always.** The label will always point at the same thing. |
| `let` | The value must change later, like a counter. |
| `var` | Never in new code. (You will see it in old code.) |

---

## 3. Play: scope (which rooms can see my box?)

A **block** is a room made by `{ }` curly braces. Boxes made with `let` and `const` stay inside their room. A `var` box ignores the walls and leaks out.

📄 **Replace `playground.js`**

```js
if (true) {
  let insideRoom = 'I only exist in here';
  var leaky = 'I leak out of the room';
}

console.log(leaky);
// console.log(insideRoom); // un-comment me to see an error
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
I leak out of the room
```

Un-comment the last line and you get:

```text
ReferenceError: insideRoom is not defined
```

Outside the room, `insideRoom` does not exist at all.

### Lexical scope: kids can see out, parents cannot see in

📄 **Replace `playground.js`**

```js
const school = 'Sunny School';

function classroom() {
  const teacher = 'Ms. Rao';

  function desk() {
    // A desk is inside the classroom, which is inside the school.
    console.log(school, teacher); // it can see both!
  }

  desk();
}

classroom();
// console.log(teacher); // un-comment me: the school cannot see into the classroom
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
Sunny School Ms. Rao
```

An inner room can see every box in the rooms around it. An outer room can never see into an inner room. **Lexical scope** means this is decided by **where you write the code**. You can see it with your eyes.

### Shadowing: two boxes, same name

📄 **Replace `playground.js`**

```js
const x = 'outer';

function show() {
  const x = 'inner'; // a NEW box that hides the outer one inside this function
  console.log(x);
}

show();
console.log(x);
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
inner
outer
```

Both `x` boxes exist. Inside `show()` the closest one wins. This is called **shadowing**. It is legal, but confusing, so give your boxes different names when you can.

---

## 4. Play: hoisting and the locked box

Before JavaScript runs a room, it first walks around and notes down every box that will be made in it. That is **hoisting**.

📄 **Replace `playground.js`**

```js
console.log(a); // undefined: var is hoisted AND starts out as "nothing yet"
var a = 1;

// console.log(b); // un-comment me!
let b = 2;
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
undefined
```

Un-comment the `console.log(b)` line:

```text
ReferenceError: Cannot access 'b' before initialization
```

| Keyword | Is the box known early? | Can I use it before its line? |
|---------|-------------------------|-------------------------------|
| `var` | Yes | Yes, but it is `undefined` (a nasty surprise) |
| `let` / `const` | Yes | **No.** It is locked until its line. This locked time is the **temporal dead zone**. |

The locked box is **good**. An error that says "you used it too early" is much better than a silent `undefined` that causes a bug three screens later.

---

## 5. Build: the first version of the stand

Now let's use what we learned. Our stand needs to remember four things.

📄 **Create `cli.js`**

```js
// cli.js - the Lemonade Stand, version 0.1
const standName = 'Sunny Lemonade Stand';
const lemonadePrice = 40; // rupees, for now
let cupsSold = 0;
let earned = 0;

// Customer 1 buys a cup
cupsSold = cupsSold + 1;
earned = earned + lemonadePrice;

// Customer 2 buys a cup
cupsSold += 1;
earned += lemonadePrice;

if (earned >= 80) {
  const message = 'Great start!'; // this box only exists inside the curly braces
  console.log(message);
}

console.log(`${standName} sold ${cupsSold} cups and earned ₹${earned}.`);
```

▶️ **Run:** `node cli.js`

👀 **You should see:**

```text
Great start!
Sunny Lemonade Stand sold 2 cups and earned ₹80.
```

(The file is called `cli.js` because later it is a **c**ommand-**l**ine **i**nterface: a program you use from the terminal.)

**New trick:** the text in backticks `` ` ` `` is a **template literal**. Anything inside `${ ... }` is replaced by the value of that box. It is much nicer than gluing words together with `+`. (Step 19 has more.)

---

## 6. What just happened?

- `const` for things that never change: the stand name and the price.
- `let` for things that do change: `cupsSold` and `earned`.
- `message` lives only inside the `if { }` room. Nobody outside can see it.
- We never used `var`.

## 🧪 Try it yourself

1. Add a **third** customer. Run the program. Does "Great start!" still show?
2. Add a line **below** the `if` block that prints `message`. Predict the error before you run it. Then check yourself.
3. **Predict, then run.** What does this print?
   ```js
   var snack = 'cookie';
   function test() {
     console.log(snack);
     var snack = 'cake';
   }
   test();
   ```
   <details>
   <summary>Answer</summary>

   `undefined`. Inside `test`, the `var snack` is hoisted to the top of the function as an empty box, and it hides (shadows) the outer `snack`. When `console.log` runs, the inner box is still empty. If you change both to `let`, you get a clear `ReferenceError` instead. Which one is easier to debug?
   </details>

## ⚠️ Mistakes everyone makes

| Mistake | What you see | Fix |
|---------|--------------|-----|
| `const count = 0; count++` | `TypeError: Assignment to constant variable.` | Use `let` for things that change |
| `let a = 1; let a = 2;` in the same room | `SyntaxError: Identifier 'a' has already been declared` | Pick another name, or just assign `a = 2` |
| Using a box before its line | `ReferenceError: Cannot access 'x' before initialization` | Move the line up |
| Typing `cupsold` instead of `cupsSold` | `ReferenceError: cupsold is not defined` | Check spelling and capital letters |

## ✅ Checkpoint

- [ ] `node cli.js` prints the two lines shown above
- [ ] I can say when to use `const` and when to use `let`
- [ ] I know `const` stops swapping the box, not shaking what is inside
- [ ] I can explain block scope, and why `message` is not visible outside the `if`
- [ ] I know what hoisting and the temporal dead zone are
- [ ] I will not use `var` in new code

**Files in your project now:** `hello.js`, `index.html`, `playground.js`, `cli.js`

**Next:** [Step 3: Data types & coercion](03-data-types-and-coercion.md)
