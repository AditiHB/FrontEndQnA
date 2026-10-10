# 11. `this` & Binding

> **Like I'm 5:** `this` means "the person who is talking right now". If a friend says "I'm hungry", what "I" means depends on who said it. In JavaScript, `this` depends on how the function was called, not where it was written.

## The rules (most common first)

```js
const user = {
  name: 'Asha',
  greet() { return `Hi, ${this.name}`; },
};

user.greet();            // 'Hi, Asha'  -> this = user (called as a method)

const g = user.greet;
g();                     // Error or 'Hi, undefined'  -> this is lost

setTimeout(user.greet, 0);   // this is lost here too
```

| How it's called | What `this` is |
|-----------------|----------------|
| `obj.method()` | `obj` |
| `fn()` in strict mode | `undefined` |
| `new Fn()` | The new object |
| `fn.call(x)` / `fn.apply(x)` / `fn.bind(x)` | `x` |
| Arrow function | The `this` of the code around it (lexical) |

## Fixing lost `this`

```js
// 1. bind
const greet = user.greet.bind(user);

// 2. arrow wrapper
setTimeout(() => user.greet(), 0);

// 3. arrow function property (in classes, see 10-classes.md)
```

## call, apply, bind

```js
function intro(greeting, punctuation) {
  return `${greeting}, I'm ${this.name}${punctuation}`;
}

intro.call({ name: 'Ravi' }, 'Hello', '!');     // call: arguments one by one
intro.apply({ name: 'Ravi' }, ['Hello', '!']);  // apply: arguments as array
const bound = intro.bind({ name: 'Ravi' }, 'Hi');  // bind: returns a new function
```

## Arrow functions and `this`

```js
const timer = {
  seconds: 0,
  start() {
    setInterval(() => {
      this.seconds++;   // arrow keeps `this` from start()
    }, 1000);
  },
};
```

Do not use arrow functions as object methods that need their own `this`.

## Important points
- Think about how a function is called, not where it is defined.
- Use arrow functions for callbacks inside methods.
- In modules and classes, code runs in strict mode, so a plain function call gets `this = undefined`.
