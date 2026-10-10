# 6. Modern Features & Patterns

### Q1. What are ES modules, and how do they differ from CommonJS? `Core`

> **Like I'm 5:** ES modules are lunchboxes with stickers that say what they share. CommonJS is an older lunchbox that is opened at the moment you ask, instead of planned ahead.

**Answer:** ES modules use `import`/`export`, are statically analyzable, load asynchronously in browsers, and run in strict mode. CommonJS uses `require`/`module.exports`, loads synchronously, and is the default in older Node.js code.

---

### Q2. What is dynamic `import()`? `Core`

> **Like I'm 5:** You don't pack the whole suitcase for the trip. You buy the swimsuit only when you reach the beach.

**Answer:** `import('./x.js')` returns a promise and loads the module on demand. It's used for code splitting and lazy loading routes or features.

---

### Q3. What are optional chaining and nullish coalescing, and why are they useful? `Core`

> **Like I'm 5:** They save you from checking every box on the way down, and stop safely if a box is missing.

**Answer:** `user?.address?.city` returns `undefined` if any part is missing, rather than throwing. `??` gives a fallback for `null` and `undefined`. Together they reduce defensive checks.

---

### Q4. What are destructuring defaults and renaming? `Core`

> **Like I'm 5:** When you open a gift and the toy is missing, you use a backup toy. You can also call the toy by a nickname.

**Answer:** `const { role = 'viewer', name: userName } = user;` gives a default when `role` is `undefined`, and renames `name` to `userName`.

---

### Q5. What is the difference between `Map`, `Set`, `WeakMap`, and `WeakSet`? `Advanced`

> **Like I'm 5:** A `Set` is a bag where each toy appears once. A `Map` is a notebook of name-to-toy pairs. Weak versions let go of an item when nobody else is holding it.

**Answer:** `Map` and `Set` hold strong references and accept any key or value. `WeakMap` and `WeakSet` hold objects weakly, so entries can be garbage collected. Weak collections don't have `size` or iteration.

---

### Q6. What are `Proxy` and `Reflect`? `Advanced`

> **Like I'm 5:** A proxy is a receptionist who checks every visitor before they walk into the office.

**Answer:** `Proxy` intercepts operations on an object, such as get and set, so you can add validation, logging, or reactivity. `Reflect` provides default implementations of those operations. Vue 3 uses proxies for reactivity.

---

### Q7. What is the difference between `Array.prototype.sort` and `toSorted`? `Core`

> **Like I'm 5:** `sort` rearranges your own row of toys. `toSorted` makes a new row for you, and your original row stays the same.

**Answer:** `sort` mutates the array. `toSorted` returns a new sorted array. Use `toSorted` in immutable state code.

---

### Q8. What is `Object.groupBy`? `Advanced`

> **Like I'm 5:** You sort your pile of cards into piles by colour in one step.

**Answer:** `Object.groupBy(items, fn)` returns an object whose keys are the results of `fn` and whose values are arrays of matching items (ES2024). Use `Map.groupBy` when the keys aren't strings.

---

### Q9. What is the difference between `let` in a `for` loop and `var`? `Core`

> **Like I'm 5:** With `let`, each kid gets their own whiteboard. With `var`, they all share one.

**Answer:** `let` creates a fresh binding for each iteration, so closures capture each value. `var` shares one binding across the loop.

---

### Q10. What is a generator, and where would you use it? `Advanced`

> **Like I'm 5:** A generator is a storyteller who tells one chapter at a time, and waits for you to ask for the next.

**Answer:** A generator pauses at `yield` and resumes on the next call. Use generators for lazy sequences, streaming, and custom iteration.

---

### Q11. What is the pipeline or functional composition style? `Advanced`

> **Like I'm 5:** It's a factory line: each machine does one step and passes the product to the next machine.

**Answer:** Small pure functions are chained with `map`, `filter`, `reduce`, or a `pipe` helper. Each step is easy to test and reuse. Keep the chain readable and avoid overly clever compositions.

---

### Q12. What is the difference between `globalThis` and `window`? `Core`

> **Like I'm 5:** `window` is the name of the house in the browser. `globalThis` is the name that works in every house, including the Node.js one.

**Answer:** `globalThis` is a standard way to access the global object in any environment. `window` exists only in browsers.
