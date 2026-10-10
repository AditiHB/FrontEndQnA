# 4. Functions

> **Like I'm 5:** A function is a vending machine. You put in coins (arguments), it does a job, and it gives you back a snack (return value). You can even hand a machine to a friend to use later.

## Ways to write functions

```js
// Declaration: hoisted, can be called before it appears
function add(a, b) {
  return a + b;
}

// Expression: not hoisted
const subtract = function (a, b) {
  return a - b;
};

// Arrow function: short, no own `this`
const multiply = (a, b) => a * b;
const square = x => x * x;
```

## Default, rest, and named arguments

```js
function greet(name = 'friend', ...extras) {
  return `Hello ${name}`;
}

function createUser({ name, role = 'viewer' } = {}) {
  return { name, role };
}

createUser({ name: 'Asha' });   // { name: 'Asha', role: 'viewer' }
```

Passing an options object is clearer than many positional arguments.

## Functions are values

```js
const operations = { add, subtract };
[1, 2, 3].map(n => n * 2);     // a function passed as an argument
```

## Pure functions

```js
// Pure: same input, same output, no side effects
const total = (items) => items.reduce((sum, i) => sum + i.price, 0);

// Impure: changes something outside
let count = 0;
const increment = () => ++count;
```

Pure functions are easier to test and reason about.

## IIFE (old pattern, still seen)

```js
(function () {
  const secret = 'hidden';
})();
```

Modules have replaced most uses of IIFEs for private scope.

## Important points
- Use arrow functions for callbacks. Use regular functions for methods that need their own `this`.
- Keep functions small and do one thing.
- Default parameters are evaluated each call, so they can safely use other parameters.
