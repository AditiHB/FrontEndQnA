# 21. TypeScript A to Z Glossary

> **Like I'm 5:** This is a picture dictionary of TypeScript words. Find a word, read its one-line meaning, then follow the link to see the full lesson.

| Letter | Term | Meaning | Lesson |
|--------|------|---------|--------|
| **A** | `any` | Turns checking off. Avoid it. | [02](02-basic-types.md), [16](16-strictness-and-safe-typing.md) |
| **A** | `as` (type assertion) | "Trust me, this is this type." Use rarely. | [16](16-strictness-and-safe-typing.md) |
| **A** | `abstract class` | A class that can't be created directly. | [06](06-classes.md) |
| **A** | Async / `Promise<T>` | A typed value that arrives later. | [15](15-async-and-error-types.md) |
| **A** | `as const` | Makes values exact and read-only. | [08](08-union-intersection-and-literal-types.md) |
| **A** | Ambient declaration | A global type declaration with no import. | [18](18-declaration-files-and-third-party-types.md) |
| **B** | Branded type | A type with a hidden tag to keep similar values apart. | [17](17-advanced-patterns.md) |
| **B** | Barrel file | An `index.ts` that re-exports a folder. | [13](13-modules-and-declarations.md) |
| **B** | Builder pattern | Chaining methods that return `this`. | [17](17-advanced-patterns.md) |
| **C** | Class | A blueprint for objects. | [06](06-classes.md) |
| **C** | Compiler (`tsc`) | Checks types and outputs JavaScript. | [01](01-setup-and-compiler.md) |
| **C** | Conditional type | `T extends U ? X : Y`. | [11](11-mapped-and-conditional-types.md) |
| **C** | `const` assertion | See `as const`. | [08](08-union-intersection-and-literal-types.md) |
| **D** | Declaration file (`.d.ts`) | Types only, no code. | [13](13-modules-and-declarations.md), [18](18-declaration-files-and-third-party-types.md) |
| **D** | Decorator | A special annotation that adds behavior. | [14](14-decorators.md) |
| **D** | Discriminated union | A union with a shared literal field, like `kind`. | [09](09-narrowing-and-type-guards.md) |
| **E** | Enum | A named set of values. Modern alternative: const object. | [12](12-enums-vs-const-objects.md) |
| **E** | Excess property check | Errors on unknown fields in object literals. | [04](04-interfaces-and-type-aliases.md) |
| **E** | `exhaustive` check | Using `never` to force all cases to be handled. | [09](09-narrowing-and-type-guards.md) |
| **F** | Function overload | Several signatures for one function. | [05](05-functions.md) |
| **G** | Generic | A type with a placeholder, like `Array<T>`. | [07](07-generics.md) |
| **G** | Guard (type guard) | A check that narrows a type. | [09](09-narrowing-and-type-guards.md) |
| **H** | Hover | In the editor, hovering shows the type. | [03](03-type-inference-and-annotations.md) |
| **I** | Index signature | `[key: string]: T` for dynamic keys. | [04](04-interfaces-and-type-aliases.md) |
| **I** | Inference | The compiler works out a type for you. | [03](03-type-inference-and-annotations.md) |
| **I** | Interface | A named object shape. | [04](04-interfaces-and-type-aliases.md) |
| **I** | Intersection (`&`) | "Both types at once." | [08](08-union-intersection-and-literal-types.md) |
| **I** | `import type` | Imports a type only, removed at build time. | [13](13-modules-and-declarations.md) |
| **I** | `infer` | Pulls a type out of another type. | [11](11-mapped-and-conditional-types.md) |
| **K** | `keyof` | Union of an object's keys. | [11](11-mapped-and-conditional-types.md) |
| **L** | Literal type | An exact value as a type, like `'on'`. | [08](08-union-intersection-and-literal-types.md) |
| **M** | Mapped type | Builds a new type by looping over keys. | [11](11-mapped-and-conditional-types.md) |
| **M** | Module | A file with `import` or `export`. | [13](13-modules-and-declarations.md) |
| **N** | `never` | A type for values that never happen. | [02](02-basic-types.md) |
| **N** | Narrowing | Making a type more specific after a check. | [09](09-narrowing-and-type-guards.md) |
| **N** | Non-null assertion (`!`) | "I promise it is not null." Use rarely. | [16](16-strictness-and-safe-typing.md) |
| **N** | `NonNullable<T>` | Removes `null` and `undefined`. | [10](10-utility-types.md) |
| **O** | Optional property (`?`) | A property that may be missing. | [04](04-interfaces-and-type-aliases.md) |
| **O** | Overload | See function overload. | [05](05-functions.md) |
| **P** | `Partial<T>` | Makes every property optional. | [10](10-utility-types.md) |
| **P** | `Pick<T, K>` / `Omit<T, K>` | Keeps or removes some keys. | [10](10-utility-types.md) |
| **P** | Parameter property | `constructor(private x: number)`. | [06](06-classes.md) |
| **Q** | Quick fix | Editor shortcut that adds missing types or imports. | [19](19-tooling-and-configuration.md) |
| **R** | `Record<K, V>` | Object type with keys K and values V. | [10](10-utility-types.md) |
| **R** | `readonly` | Can't be changed after it is set. | [04](04-interfaces-and-type-aliases.md) |
| **R** | Rest parameter | `...values: number[]`. | [05](05-functions.md) |
| **S** | `satisfies` | Checks a type but keeps the exact inferred type. | [16](16-strictness-and-safe-typing.md) |
| **S** | `strict` | Turns on the strongest checks. | [16](16-strictness-and-safe-typing.md) |
| **S** | Structural typing | Types match by shape, not by name. | [17](17-advanced-patterns.md) |
| **T** | Tuple | A fixed-length array with a type per position. | [02](02-basic-types.md) |
| **T** | Template literal type | String types built from patterns. | [08](08-union-intersection-and-literal-types.md) |
| **T** | `tsconfig.json` | The rulebook for the compiler. | [19](19-tooling-and-configuration.md) |
| **T** | Type alias | `type Name = ...`. | [04](04-interfaces-and-type-aliases.md) |
| **U** | Union (`\|`) | "This OR that." | [08](08-union-intersection-and-literal-types.md) |
| **U** | `unknown` | Any value, but you must check it first. | [02](02-basic-types.md) |
| **U** | Utility type | Built-in helpers like `Partial` and `Pick`. | [10](10-utility-types.md) |
| **V** | `void` | A function returns nothing useful. | [02](02-basic-types.md), [05](05-functions.md) |
| **W** | Watch mode | `tsc --watch` rebuilds the code every time you save. | [01](01-setup-and-compiler.md) |
| **X** | `exactOptionalPropertyTypes` | Optional means missing, not `undefined`. | [16](16-strictness-and-safe-typing.md) |
| **Y** | `yield` in generators | Typed with `Generator<T>` or `Iterable<T>`. | [15](15-async-and-error-types.md) |
| **Z** | Zod | A library that validates data at runtime and infers types. | [15](15-async-and-error-types.md) |
