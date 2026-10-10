# 2. Variables & Scope

> **Like I'm 5:** `let` and `const` are lunch boxes that only exist inside your classroom. `var` is an old lunch bag that goes everywhere in the whole school. `const` means the lid can't be swapped for another box.

## `let`, `const`, `var`

```js
const name = 'Asha';    // cannot be reassigned
let count = 0;          // can be reassigned
count = count + 1;

var old = 'legacy';     // function-scoped, avoid in new code
```

| Keyword | Scope | Reassign? | Hoisted? |
|---------|-------|-----------|----------|
| `const` | Block | No | Yes, but in the TDZ until declared |
| `let` | Block | Yes | Yes, but in the TDZ until declared |
| `var` | Function | Yes | Yes, starts as `undefined` |

## Block scope

```js
if (true) {
  let inside = 'yes';
  var leaks = 'yes';
}
// console.log(inside);  // ReferenceError
console.log(leaks);      // 'yes' (var ignores blocks)
```

## Hoisting and the temporal dead zone

```js
console.log(a);   // undefined (var is hoisted and set to undefined)
var a = 1;

// console.log(b); // ReferenceError: cannot access 'b' before initialization
let b = 2;
```

`let` and `const` exist from the start of the block, but you can't use them before their declaration. That gap is the **temporal dead zone**.

## Shadowing

```js
const x = 'outer';
function show() {
  const x = 'inner';   // shadows the outer x
  console.log(x);
}
```

## Important points
- Use `const` by default. Use `let` only when you need to reassign.
- Avoid `var` in new code.
- `const` makes the binding constant, not the value. An object declared with `const` can still change its properties.
