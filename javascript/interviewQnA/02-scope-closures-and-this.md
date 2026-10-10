# 2. Scope, Closures & `this`

### Q1. What is lexical scope? `Core`

> **Like I'm 5:** Your room's rules come from the room you were born in, not from the room you visit.

**Answer:** Scope is determined by where code is written. An inner function can access variables from its outer functions, but not the other way around.

---

### Q2. What is a closure? Give a practical example. `Core`

> **Like I'm 5:** A closure is a backpack a function carries. It keeps the toys it needs, even after the grown-up who made it has left.

**Answer:** A closure is a function that keeps access to variables from its creation scope. A common example is a counter or private state.

```js
function createCounter() {
  let count = 0;
  return () => ++count;
}
```

---

### Q3. Why does `var` in a loop with `setTimeout` print the same value? `Core`

> **Like I'm 5:** Three kids all look at the same whiteboard. By the time they read it, the teacher has written the final number.

**Answer:** `var` is function-scoped, so all callbacks share one variable whose final value is used. `let` creates a new binding per iteration, so each callback keeps its own value.

---

### Q4. What are the rules for determining `this`? `Core`

> **Like I'm 5:** `this` means "the one who is calling me right now". Who calls the function decides who `this` is.

**Answer:** In order: `new` binding, explicit binding with `call`, `apply`, or `bind`, implicit binding when called as `obj.method()`, and finally the default binding (`undefined` in strict mode, global object otherwise). Arrow functions take `this` from their surrounding scope.

---

### Q5. Why does a method lose `this` when passed as a callback? `Core`

> **Like I'm 5:** You took the phone away from the person who was talking, so nobody knows who "I" is anymore.

**Answer:** Extracting `obj.method` into a variable or passing it as a callback calls it without the object, so `this` falls back to the default binding. Fix it with `bind`, an arrow wrapper, or an arrow function class field.

---

### Q6. What is the difference between `call`, `apply`, and `bind`? `Core`

> **Like I'm 5:** `call` lets you lend a toy and say the items one by one. `apply` says them in a bag. `bind` makes a new toy that always belongs to your friend.

**Answer:** `call` and `apply` invoke immediately with a given `this`. `call` takes arguments individually, `apply` takes an array. `bind` returns a new function with `this` fixed.

---

### Q7. What is an IIFE, and is it still useful? `Advanced`

> **Like I'm 5:** An IIFE is a picnic that sets up, eats, and cleans up right away, so nothing is left lying around in the park.

**Answer:** An immediately invoked function expression runs once and keeps its variables private. ES modules have replaced most uses, but the pattern still appears in older code.

---

### Q8. How do closures cause memory leaks? `Advanced`

> **Like I'm 5:** If a backpack holds a huge box of toys, it stays heavy as long as the backpack exists, even if the toys aren't used.

**Answer:** A closure keeps its whole scope alive, not just the variables it uses. If a long-lived closure captures a large object, that object cannot be collected. Null out references or keep the closure's scope small.

---

### Q9. What is shadowing? `Core`

> **Like I'm 5:** A kid in the front row wears a loud hat, and nobody can see the quieter hat behind them.

**Answer:** Declaring a variable with the same name in an inner scope hides the outer variable inside that scope. It's legal but can confuse readers; avoid it.

---

### Q10. Why are arrow functions not suitable for object methods? `Advanced`

> **Like I'm 5:** An arrow function has no name tag of its own. It borrows the tag of the room it was built in, so `this` points to the wrong person.

**Answer:** Arrow functions take `this` from the surrounding lexical scope, so `this` in an arrow method points to the outer scope, not the object. Use regular method syntax for object methods and arrows for callbacks.
