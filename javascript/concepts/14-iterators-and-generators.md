# 14. Iterators & Generators

> **Like I'm 5:** An iterator is a vending machine that gives you one snack each time you press the button. A generator is a vending machine that can pause in the middle of its work and wait until you press again.

## Iterables and iterators

```js
const range = {
  from: 1,
  to: 3,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        return current <= last
          ? { value: current++, done: false }
          : { value: undefined, done: true };
      },
    };
  },
};

for (const n of range) console.log(n);   // 1, 2, 3
[...range];                               // [1, 2, 3]
```

Anything with `[Symbol.iterator]` works with `for...of`, spread, and destructuring.

## Generators

```js
function* countdown(n) {
  while (n > 0) {
    yield n;        // pause here and hand out a value
    n--;
  }
  return 'liftoff';
}

const it = countdown(3);
it.next();   // { value: 3, done: false }
it.next();   // { value: 2, done: false }
```

## Lazy sequences

Generators compute values only when asked, so they can handle very large or infinite sequences.

```js
function* naturals() {
  let n = 0;
  while (true) yield n++;
}

for (const n of naturals()) {
  if (n > 3) break;
  console.log(n);
}
```

## Async generators

```js
async function* pages(api) {
  let cursor = null;
  do {
    const page = await api.next(cursor);
    yield* page.items;
    cursor = page.nextCursor;
  } while (cursor);
}

for await (const item of pages(api)) {
  console.log(item);
}
```

## Important points
- `for...of` and spread use iterators under the hood.
- Generators are good for streaming data, paging, and lazy pipelines.
- `for await...of` consumes async iterables, such as streaming responses.
