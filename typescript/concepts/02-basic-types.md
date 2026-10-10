# 2. Basic Types

> **Like I'm 5:** Types are labels on boxes. A "number" box holds only numbers, a "string" box holds only words, and a "boolean" box holds only yes or no.

## Primitive types

```ts
let age: number = 30;
let name: string = 'Asha';
let isActive: boolean = true;
let big: bigint = 9007199254740993n;
let id: symbol = Symbol('id');
let nothing: null = null;
let notSet: undefined = undefined;
```

## Arrays and tuples

```ts
let scores: number[] = [90, 85, 77];
let names: Array<string> = ['Asha', 'Ravi'];

// Tuple: fixed length, fixed type at each position
let pair: [string, number] = ['age', 30];
const [label, value] = pair;   // label: string, value: number
```

## Objects

```ts
let user: { id: number; name: string; email?: string } = {
  id: 1,
  name: 'Asha',          // email is optional
};
```

## Special types

| Type | Meaning | Example |
|------|---------|---------|
| `any` | Turns off checking. Avoid it. | `let x: any = 1; x.foo();` compiles and fails at runtime |
| `unknown` | Any value, but you must check it before using it | Safe version of `any` |
| `void` | A function returns nothing | `function log(): void {}` |
| `never` | A value that never happens | A function that always throws |
| `null` / `undefined` | Missing values | Checked when `strictNullChecks` is on |

```ts
function fail(message: string): never {
  throw new Error(message);
}

let input: unknown = JSON.parse('{"a":1}');
// input.a;                       // Error: needs checking first
if (typeof input === 'object' && input !== null && 'a' in input) {
  console.log(input);             // now it is safe
}
```

## Enums (simple version)

```ts
enum Status { Pending, Shipped, Delivered }
const s: Status = Status.Shipped;   // 1
```

See [12-enums-vs-const-objects.md](12-enums-vs-const-objects.md) for a safer modern option.

## Important points
- Prefer `unknown` over `any`. Use `any` only when you migrate old code step by step.
- With `strict` on, `null` and `undefined` are not allowed in normal types unless you say so: `string | null`.
