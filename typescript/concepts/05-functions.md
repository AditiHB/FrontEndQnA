# 5. Functions

> **Like I'm 5:** A function is a recipe. The types say what ingredients go in (parameters) and what the dish looks like at the end (return type). If someone gives the wrong ingredient, the recipe says no.

## Typed functions

```ts
function multiply(a: number, b: number): number {
  return a * b;
}

const add = (a: number, b: number): number => a + b;
```

## Optional and default parameters

```ts
function greet(name: string, greeting = 'Hello', suffix?: string): string {
  return `${greeting}, ${name}${suffix ?? ''}`;
}
```

- `suffix?` is optional. It has type `string | undefined`.
- `greeting = 'Hello'` has a default.

## Rest parameters

```ts
function total(...values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0);
}
```

## Function types

```ts
type Formatter = (value: number) => string;

const currency: Formatter = (v) => `₹${v.toFixed(2)}`;
```

## Overloads

Use overloads when the return type depends on the input.

```ts
function parse(input: string): number;
function parse(input: number[]): number[];
function parse(input: string | number[]): number | number[] {
  return typeof input === 'string' ? Number(input) : input.map(Number);
}

const n = parse('42');        // number
const list = parse([1, 2]);   // number[]
```

## `this` parameter

```ts
interface Button { label: string; }

function click(this: Button) {
  console.log(this.label);
}
```

## `void` vs `never`

- `void`: returns normally, but the value is ignored.
- `never`: never returns (throws or loops forever).

## Important points
- Always type parameters. Let the return type be inferred for simple functions, and write it out for exported functions.
- Prefer overloads or generics over `any` when a function has several input/output combinations.
- Avoid callbacks that return `any`. It hides mistakes.
