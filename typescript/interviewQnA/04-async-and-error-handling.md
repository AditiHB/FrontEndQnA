# 4. Async & Error Handling

### Q1. How do you type an async function? `Core`

> **Like I'm 5:** An async function promises to bring back a toy later. The type says what toy it will bring.

**Answer:** Return `Promise<T>`, for example `async function getUser(id: string): Promise<User>`. TypeScript infers the return type of an `async` function, but I write it explicitly for exported APIs.

---

### Q2. What type does `await` return? `Core`

> **Like I'm 5:** `await` opens the promise's box and gives you the toy inside. The type of the toy is the type inside the promise.

**Answer:** `await p` where `p: Promise<T>` has type `T`. `await` on a non-promise returns the value unchanged.

---

### Q3. How does `Promise.all` keep types? `Advanced`

> **Like I'm 5:** When you ask three friends for three toys at once, you get back a list where each toy is still the right kind.

**Answer:** `Promise.all([a, b])` returns a tuple type, so each element keeps its own type. This avoids casting the results.

---

### Q4. Why is `catch` variable `unknown` by default in strict mode? `Core`

> **Like I'm 5:** The note inside the envelope could say anything. You must read it before you believe it.

**Answer:** Any value can be thrown in JavaScript, not only `Error` objects. With `useUnknownInCatchVariables`, TypeScript forces you to narrow the error before using `.message`.

---

### Q5. How do you model a result that can succeed or fail without throwing? `Advanced`

> **Like I'm 5:** Instead of a teacher yelling when you fail, the paper has a tick or a cross, and you read it calmly.

**Answer:** Use a discriminated union, such as `{ ok: true; value: T } | { ok: false; error: E }`. Callers must check `ok` before reading the value, which makes errors hard to ignore.

---

### Q6. How do you validate API responses in TypeScript? `Architect`

> **Like I'm 5:** When a letter arrives from outside, you read it and check it before trusting it, even if the sender is usually nice.

**Answer:** Types vanish at runtime, so `res.json() as User` is only a promise by the programmer. Validate at the boundary with a type guard or a schema library such as Zod, then trust the typed value inside the app. Zod can infer the TypeScript type from the schema, so the two never drift apart.

---

### Q7. What is the risk of unhandled promises? `Core`

> **Like I'm 5:** If you forget to open a letter, you never learn it said "your house is on fire".

**Answer:** A rejected promise without `catch` or `await` causes an unhandled rejection. The lint rule `@typescript-eslint/no-floating-promises` finds forgotten promises at build time.

---

### Q8. How do you type a generic retry helper? `Advanced`

> **Like I'm 5:** If a vending machine fails, you try again a few times. The helper can work with any snack, so it is generic.

**Answer:**

```ts
async function retry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); } catch (e) { lastError = e; }
  }
  throw lastError;
}
```

The return type is `Promise<T>`, so the caller keeps the result type.

---

### Q9. What is `Awaited<T>`? `Advanced`

> **Like I'm 5:** `Awaited` is a tool that opens the promise box for you in the type world, so you can see the toy's type.

**Answer:** `Awaited<Promise<User>>` is `User`. It unwraps nested promises and is useful with `ReturnType` for async functions.

---

### Q10. What are async iterators and generators in TypeScript? `Architect`

> **Like I'm 5:** A generator hands you one toy at a time, when you ask. An async generator hands you toys that arrive later.

**Answer:** `AsyncIterable<T>` and `AsyncGenerator<T>` type streams of values. They are used for paginated APIs and server-sent events. Typing the yielded value keeps each step safe.

---

### Q11. How do you handle errors in a typed way across layers? `Architect`

> **Like I'm 5:** Each room in a house has a different job, and each one hands over a clear note to the next room.

**Answer:** Define domain error types (for example, `NotFound`, `Forbidden`, `Network`) as a discriminated union. Repositories return these errors, services map them, and the UI shows user-friendly messages. This keeps HTTP details out of business logic.
