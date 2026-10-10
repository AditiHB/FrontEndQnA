# 9. Narrowing & Type Guards

> **Like I'm 5:** When you look inside a bag that could hold a cat or a dog, you check first: "Does it have whiskers?" After that check, you know which animal it is. Narrowing is checking so TypeScript knows more.

## `typeof`

```ts
function format(value: string | number): string {
  if (typeof value === 'string') {
    return value.toUpperCase();    // value is string here
  }
  return value.toFixed(2);         // value is number here
}
```

## Truthiness and `null` checks

```ts
function greet(name?: string | null) {
  if (!name) return 'Hello, friend';
  return `Hello, ${name}`;
}
```

## `instanceof`

```ts
function describe(e: Error | string) {
  if (e instanceof Error) return e.message;
  return e;
}
```

## `in` operator

```ts
interface Fish { swim(): void }
interface Bird { fly(): void }

function move(animal: Fish | Bird) {
  if ('swim' in animal) animal.swim();
  else animal.fly();
}
```

## Discriminated unions (the best pattern)

Give each variant a shared literal field, called the discriminant.

```ts
type Result =
  | { kind: 'ok'; value: number }
  | { kind: 'error'; message: string };

function handle(r: Result) {
  switch (r.kind) {
    case 'ok':
      return r.value;        // narrowed to the ok variant
    case 'error':
      return r.message;      // narrowed to the error variant
  }
}
```

## Exhaustiveness check

```ts
type Shape = { kind: 'circle'; r: number } | { kind: 'square'; s: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle': return Math.PI * shape.r ** 2;
    case 'square': return shape.s ** 2;
    default: {
      const check: never = shape;   // error if a new kind is added and not handled
      return check;
    }
  }
}
```

## Custom type guards (type predicates)

```ts
interface User { id: string; name: string }

function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null
    && 'id' in value && 'name' in value;
}

const data: unknown = fetchSomething();
if (isUser(data)) {
  console.log(data.name);   // safe
}
```

## Assertion functions

```ts
function assertDefined<T>(v: T | undefined | null): asserts v is T {
  if (v == null) throw new Error('Value is missing');
}
```

## Important points
- Narrow with checks, not with `as`. `as` just tells the compiler to trust you.
- Use discriminated unions to model states like `loading | success | error`.
- The `never` exhaustiveness check catches forgotten cases when a union grows.
