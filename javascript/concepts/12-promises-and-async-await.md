# 12. Promises & Async/Await

> **Like I'm 5:** A promise is a receipt from a coffee shop. You don't have the coffee yet, but you have a receipt that says it's coming. When it's ready, you exchange the receipt for the coffee. If the shop runs out, the receipt says "sorry".

## Promise basics

```js
const coffee = new Promise((resolve, reject) => {
  setTimeout(() => resolve('latte'), 1000);   // success
  // reject(new Error('out of milk'));         // failure
});

coffee
  .then(drink => console.log('Got', drink))
  .catch(err => console.error(err))
  .finally(() => console.log('done'));
```

States: **pending**, then **fulfilled** or **rejected**. A settled promise never changes again.

## async and await

```js
async function getOrder(id) {
  try {
    const res = await fetch(`/api/orders/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Could not load order', err);
    throw err;
  }
}
```

- `async` makes a function always return a promise.
- `await` pauses that function until the promise settles, without blocking the rest of the page.

## Running things in parallel

```js
// Sequential: slow
const a = await getA();
const b = await getB();

// Parallel: fast
const [a2, b2] = await Promise.all([getA(), getB()]);
```

## Promise combinators

| Method | Resolves when | Rejects when |
|--------|---------------|--------------|
| `Promise.all` | All succeed | Any fails |
| `Promise.allSettled` | All finish (any outcome) | Never |
| `Promise.race` | First one settles | First one fails |
| `Promise.any` | First one succeeds | All fail |

```js
const results = await Promise.allSettled([getA(), getB()]);
results.forEach(r => r.status === 'fulfilled' ? use(r.value) : log(r.reason));
```

## Common mistakes
- Forgetting `await`, so you get a promise instead of a value.
- Using `await` in a loop when the calls could run in parallel.
- Creating a promise inside another promise unnecessarily.
- Leaving a rejected promise without `catch`.

## Important points
- Always handle rejections.
- Use `Promise.all` for independent work and `allSettled` when partial failure is acceptable.
- Add timeouts with `AbortController` for network calls.
