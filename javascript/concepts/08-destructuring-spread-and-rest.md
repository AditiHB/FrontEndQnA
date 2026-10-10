# 8. Destructuring, Spread & Rest

> **Like I'm 5:** Destructuring is unpacking a gift box and taking out only the toys you want. Spread is pouring all the marbles from one jar into another. Rest is collecting the leftover marbles into a new jar.

## Array destructuring

```js
const [first, second, ...others] = [1, 2, 3, 4];
// first = 1, second = 2, others = [3, 4]

const [a = 0, b = 0] = [5];    // defaults: a = 5, b = 0

let x = 1, y = 2;
[x, y] = [y, x];               // swap without a temp variable
```

## Object destructuring

```js
const user = { name: 'Asha', role: 'admin', city: 'Pune' };

const { name, role = 'viewer' } = user;
const { city: location } = user;   // rename: location = 'Pune'

function show({ name, city = 'unknown' }) {
  return `${name} from ${city}`;
}
```

## Nested destructuring

```js
const response = { data: { items: [{ id: 1 }] } };
const { data: { items: [{ id }] } } = response;   // id = 1
```

Nested destructuring is powerful but hard to read when deep. Break it up when it gets long.

## Spread

```js
const a = [1, 2];
const b = [...a, 3];                  // [1, 2, 3]

const base = { theme: 'light', lang: 'en' };
const next = { ...base, theme: 'dark' };  // { theme: 'dark', lang: 'en' }

Math.max(...[4, 9, 2]);               // 9
```

Spread makes a **shallow** copy. Nested objects are still shared.

## Rest

```js
function sum(...numbers) {
  return numbers.reduce((s, n) => s + n, 0);
}

const { id, ...withoutId } = { id: 1, name: 'Asha', age: 30 };
// withoutId = { name: 'Asha', age: 30 }
```

## Important points
- Use destructuring in function parameters to make options clear.
- Use spread for immutable updates in state: `{ ...state, loading: false }`.
- Remember spread copies only one level deep.
