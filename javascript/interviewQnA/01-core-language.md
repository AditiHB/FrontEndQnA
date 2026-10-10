# 1. Core Language

### Q1. What is the difference between `var`, `let`, and `const`? `Core`

> **Like I'm 5:** `var` is an old lunch bag that anyone in the school can open. `let` is a lunch box for one classroom. `const` is a lunch box whose lid can never be swapped.

**Answer:** `var` is function-scoped and hoisted with the value `undefined`. `let` and `const` are block-scoped and sit in the temporal dead zone until declared. `const` prevents reassignment of the binding, not mutation of the object. I use `const` by default and `let` when reassignment is needed.

---

### Q2. What is hoisting? `Core`

> **Like I'm 5:** The teacher reads the whole class list before school starts, so she knows every name, even if the student hasn't walked in yet.

**Answer:** Declarations are processed before code runs. Function declarations are fully hoisted. `var` variables are hoisted and start as `undefined`. `let` and `const` are hoisted too, but accessing them before the declaration throws a `ReferenceError`.

---

### Q3. What is the difference between `==` and `===`? `Core`

> **Like I'm 5:** `==` is a friend who changes your words before comparing. `===` compares exactly what you said.

**Answer:** `==` performs type coercion before comparing, which leads to surprises like `0 == ''` being true. `===` compares type and value without conversion. I use `===` everywhere except a deliberate `x == null` check.

---

### Q4. What values are falsy in JavaScript? `Core`

> **Like I'm 5:** Falsy values are the empty boxes: `false`, `0`, empty text, `null`, `undefined`, and `NaN`.

**Answer:** `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined`, and `NaN`. Everything else is truthy, including `'0'`, `[]`, and `{}`.

---

### Q5. What is `typeof null`, and why? `Core`

> **Like I'm 5:** It's an old label mistake that stayed in the school for years because changing it would break other classes.

**Answer:** `typeof null` returns `'object'`. This is a bug from the first version of JavaScript that was kept for compatibility. Check for `null` with `=== null`.

---

### Q6. What is the difference between `null` and `undefined`? `Core`

> **Like I'm 5:** `undefined` means nobody has put anything in the box. `null` means someone deliberately put in nothing.

**Answer:** `undefined` is the default for missing values. `null` is an explicit empty value set by the programmer. JSON has `null` but not `undefined`, which matters when serializing objects.

---

### Q7. What are `??` and `?.`, and how do they differ from `||`? `Core`

> **Like I'm 5:** `||` gives a backup when the toy is broken, even if it's just empty. `??` gives a backup only when the toy is really missing. `?.` says "if there is a box, look inside, otherwise stop".

**Answer:** `a || b` returns `b` when `a` is any falsy value, including `0` and `''`. `a ?? b` returns `b` only when `a` is `null` or `undefined`. `a?.b` short-circuits to `undefined` when `a` is nullish.

---

### Q8. What is `Object.is`, and how is it different from `===`? `Advanced`

> **Like I'm 5:** `===` says `NaN` is not equal to itself, which is odd. `Object.is` is the careful friend who says "yes, NaN is NaN", and also tells `0` and `-0` apart.

**Answer:** `Object.is` treats `NaN` as equal to `NaN`, and distinguishes `+0` from `-0`. Otherwise it behaves like `===`.

---

### Q9. What is the difference between `Number.isNaN` and the global `isNaN`? `Core`

> **Like I'm 5:** The global `isNaN` first tries to turn the word into a number, which can fool you. `Number.isNaN` only answers for real numbers.

**Answer:** The global `isNaN('abc')` coerces to a number first and returns `true`. `Number.isNaN` returns `false` for non-numbers. Use `Number.isNaN`.

---

### Q10. Why are floating point numbers imprecise, and how do you handle money? `Advanced`

> **Like I'm 5:** Computers count with bead strings that can't hold every fraction exactly. For money, count in cents, which are whole numbers.

**Answer:** `0.1 + 0.2` is `0.30000000000000004` because binary floating point can't represent some decimals exactly. For money, store integer minor units (cents or paise) or use a decimal library, and format with `Intl.NumberFormat`.

---

### Q11. What is `BigInt`, and when do you need it? `Advanced`

> **Like I'm 5:** A normal number box can only hold up to a certain size. BigInt is a bigger box for very large counting, but you can't mix it with normal numbers without asking first.

**Answer:** `BigInt` holds integers beyond `Number.MAX_SAFE_INTEGER`. You can't mix it with `Number` in arithmetic, so `1n + 1` throws. Use it for large IDs or financial counters, or send them as strings in JSON.

---

### Q12. What is the difference between shallow and deep copies? `Core`

> **Like I'm 5:** A shallow copy copies the box but not the toys inside. Changing a toy in the copy changes the original too.

**Answer:** Spread and `Object.assign` create shallow copies. Nested objects are shared. `structuredClone` creates a deep copy for most data types, but not functions or class instances with methods.
