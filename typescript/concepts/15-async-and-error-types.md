# 15. Async Code & Error Types

> **Like I'm 5:** A Promise is a promise to bring you a toy later. The type of the promise says what toy it will bring. If it breaks, the error is a note that says what went wrong, and you must read the note before you use it.

## Promises with types

```ts
interface User { id: string; name: string }

async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<User>;   // trust-based cast: validate in real apps
}

const user = await fetchUser('1');     // type: User
```

## Parallel work

```ts
const [user, orders] = await Promise.all([
  fetchUser('1'),
  fetchOrders('1'),
]);
```

`Promise.all` keeps each result's type in the tuple.

## Unknown errors

Since TypeScript 4.4, catch variables are `unknown` when `useUnknownInCatchVariables` is on, which `strict` enables.

```ts
try {
  await fetchUser('1');
} catch (err: unknown) {
  if (err instanceof Error) {
    console.error(err.message);
  } else {
    console.error('Unknown error', err);
  }
}
```

## Typed result pattern

Instead of throwing, return a value that says success or failure.

```ts
type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

async function safeFetch(id: string): Promise<Result<User>> {
  try {
    return { ok: true, value: await fetchUser(id) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown' };
  }
}

const r = await safeFetch('1');
if (r.ok) console.log(r.value.name);   // narrowed
else console.log(r.error);
```

## Validating data from outside

Types disappear at runtime, so API responses need checking. Options:
- Write a type guard (see [09-narrowing-and-type-guards.md](09-narrowing-and-type-guards.md)).
- Use a schema library like Zod: `const User = z.object({ id: z.string(), name: z.string() }); type User = z.infer<typeof User>;`

## Important points
- Type async functions with `Promise<T>` for public APIs.
- Treat `catch` values as `unknown`, then narrow them.
- Validate network data once at the boundary, then trust the typed value inside your app.
