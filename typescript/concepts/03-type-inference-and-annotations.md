# 3. Type Inference & Annotations

> **Like I'm 5:** You don't always need to write the label on the box. If you put a number in, TypeScript can read the label for you. You only write the label when the box is empty at first, or when you want to be extra clear.

## Inference

```ts
let count = 10;        // inferred as number
let title = 'Hello';   // inferred as string
const ready = true;    // inferred as the literal type `true`
```

Let TypeScript infer simple variables. You don't need to repeat the type.

## Annotations (when you should write them)

```ts
// 1. Function parameters: always annotate
function add(a: number, b: number) {
  return a + b;          // return type inferred as number
}

// 2. Variables declared without a value
let result: number;
result = compute();

// 3. Public APIs: annotate return types for clarity
export function findUser(id: string): User | undefined { /* ... */ return undefined; }
```

## `const` vs `let` and literal types

```ts
let mode = 'light';           // type: string
const mode2 = 'light';        // type: 'light' (literal type)

let direction: 'up' | 'down' = 'up';
```

## Arrays and objects

```ts
const items = [1, 2, 3];          // number[]
const mixed = [1, 'two'];         // (string | number)[]

const config = { debug: true };   // { debug: boolean }
```

## Important points
- Inference is good. Annotate function parameters and public return types, and let the rest be inferred.
- If inference gives a too-wide type, add a type or use `as const` (see [16-strictness-and-safe-typing.md](16-strictness-and-safe-typing.md)).
- Hovering over a variable in VS Code shows its inferred type. This is the fastest way to learn what TypeScript thinks.
