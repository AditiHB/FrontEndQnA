# 10. Utility Types

> **Like I'm 5:** Utility types are magic scissors and glue for types. They can make a copy of a shape with some parts removed, some parts optional, or some parts locked, without you rewriting it.

## The most used ones

```ts
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

type PartialUser = Partial<User>;                    // all fields optional
type RequiredUser = Required<PartialUser>;           // all fields required
type ReadonlyUser = Readonly<User>;                  // all fields read-only
type PublicUser = Omit<User, 'password'>;            // remove a field
type UserPreview = Pick<User, 'id' | 'name'>;        // keep only some fields
type Roles = Record<'admin' | 'viewer', User[]>;     // object with fixed keys
```

## Working with functions and promises

```ts
function createUser(name: string) {
  return { id: 1, name, createdAt: new Date() };
}

type Created = ReturnType<typeof createUser>;   // { id: number; name: string; createdAt: Date }

type Params = Parameters<typeof createUser>;    // [name: string]

async function load() { return { ok: true }; }
type Loaded = Awaited<ReturnType<typeof load>>; // { ok: boolean }
```

## Working with unions

```ts
type Status = 'draft' | 'published' | 'archived';

type Live = Exclude<Status, 'draft'>;    // 'published' | 'archived'
type Editable = Extract<Status, 'draft' | 'published'>;  // 'draft' | 'published'
type Maybe = string | null | undefined;
type Safe = NonNullable<Maybe>;          // string
```

## Quick reference

| Utility | What it does |
|---------|--------------|
| `Partial<T>` | Every property optional |
| `Required<T>` | Every property required |
| `Readonly<T>` | Every property read-only |
| `Pick<T, K>` | Keep only keys `K` |
| `Omit<T, K>` | Remove keys `K` |
| `Record<K, V>` | Object with keys `K` and values `V` |
| `Exclude<U, X>` | Remove `X` from union `U` |
| `Extract<U, X>` | Keep only `X` from union `U` |
| `NonNullable<T>` | Remove `null` and `undefined` |
| `ReturnType<F>` | Return type of function `F` |
| `Parameters<F>` | Parameter tuple of function `F` |
| `Awaited<P>` | Value type inside a Promise |

## Important points
- Derive types from the source (`Omit`, `Pick`) so you don't copy fields by hand. Copies drift apart over time.
- `Partial` is common for update (PATCH) payloads.
- Combine them: `Partial<Omit<User, 'id'>>` is "any user field except id, all optional".
