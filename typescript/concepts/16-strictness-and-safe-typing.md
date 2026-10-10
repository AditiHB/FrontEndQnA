# 16. Strictness & Safe Typing

> **Like I'm 5:** Strict mode is a teacher who checks every corner of your homework. It is annoying at first, but it catches mistakes you would otherwise find in front of the whole class.

## The `strict` family

Setting `"strict": true` turns on these checks:

| Flag | What it catches |
|------|-----------------|
| `noImplicitAny` | Variables and parameters that silently become `any` |
| `strictNullChecks` | Using a value that may be `null` or `undefined` |
| `strictFunctionTypes` | Unsafe function parameter types |
| `strictPropertyInitialization` | Class properties not set in the constructor |
| `useUnknownInCatchVariables` | Catch values typed as `unknown` |
| `alwaysStrict` | Emits `"use strict"` |

Extra recommended flags:
- `noUncheckedIndexedAccess`: `arr[0]` is `T | undefined`.
- `exactOptionalPropertyTypes`: an optional property can't be set to `undefined` explicitly.
- `noImplicitOverride`: subclass methods must say `override`.
- `noFallthroughCasesInSwitch`: catches forgotten `break`.

## Null safety

```ts
function getLength(s: string | null): number {
  // return s.length;        // Error: s may be null
  return s?.length ?? 0;     // optional chaining and nullish coalescing
}
```

## `as const`

```ts
const routes = { home: '/', about: '/about' } as const;
// type: { readonly home: '/'; readonly about: '/about' }
```

## `satisfies` (TypeScript 4.9+)

Checks that a value matches a type, but keeps the exact inferred type.

```ts
type Palette = Record<string, string | number[]>;

const colors = {
  red: '#f00',
  green: [0, 255, 0],
} satisfies Palette;

colors.green.map(x => x);   // still knows it is an array
```

## Avoid `any`

| Instead of | Use |
|-----------|-----|
| `any` for unknown input | `unknown` plus a check |
| `any` for a callback | A typed function signature |
| `as any` to silence an error | Fix the type, or write a type guard |
| `object` for any object | `Record<string, unknown>` or a real interface |

## Non-null assertion `!`

```ts
const el = document.getElementById('app')!;   // you promise it exists
```

Use it only when you are sure. It removes the safety check.

## Important points
- Turn on `strict` and the extra flags from day one.
- Treat `as` as "trust me", and `!` as "I promise". Use them rarely, and add a comment when you do.
- Run `tsc --noEmit` in CI so type errors block merges.
