# 4. Interfaces & Type Aliases

> **Like I'm 5:** An interface is a shape card that says "a user must have a name and an age". Any object with that shape can use the card, and the compiler checks it.

## Interfaces

```ts
interface User {
  readonly id: number;   // cannot be changed after creation
  name: string;
  email?: string;        // optional
}

const u: User = { id: 1, name: 'Asha' };
// u.id = 2;             // Error: read-only
```

## Type aliases

```ts
type Point = { x: number; y: number };
type ID = string | number;
```

## Interface vs type alias

| Feature | `interface` | `type` |
|---------|-------------|--------|
| Object shapes | Yes | Yes |
| Extend with `extends` | Yes | Yes (with `&`) |
| Merge declarations twice | Yes (declaration merging) | No |
| Unions, tuples, primitives | No | Yes |

```ts
interface Animal { name: string }
interface Animal { age: number }        // merged: has name and age

type Shape = Circle | Square;           // union: only type alias can do this
```

Rule of thumb: use `interface` for object shapes and public APIs. Use `type` for unions and computed types.

## Extending

```ts
interface Employee extends User {
  department: string;
}

type Admin = User & { role: 'admin' };  // intersection
```

## Index signatures and records

```ts
interface Dictionary {
  [key: string]: number;
}

const stock: Dictionary = { apples: 10, pears: 4 };
```

## Important points
- Excess property checks catch typos in object literals: `const u: User = { id: 1, nmae: 'x' }` fails.
- Do not use `interface` for things that need unions. Use `type`.
- Keep interfaces small and named after the thing they describe, such as `OrderSummary`.
