# 1. Setup & the TypeScript Compiler

> **Like I'm 5:** The compiler is a teacher who reads your homework before you hand it in. It checks the labels on your toys, points out mistakes, and then turns your homework into plain JavaScript that browsers understand.

## Key concepts
- **TypeScript** (`.ts` files) is a superset of JavaScript. Every valid JavaScript file is also valid TypeScript (mostly).
- The **compiler** (`tsc`) checks types and converts TypeScript to JavaScript.
- Types are **erased** at runtime. They exist only to help you while coding and building.

## Install and run

```bash
npm install -g typescript
tsc --version

tsc hello.ts          # creates hello.js
tsc --init            # creates a tsconfig.json with explained options
tsc --watch           # recompiles on every save
tsc --noEmit          # only check types, produce no files
```

## Your first typed program

```ts
function greet(name: string): string {
  return `Hello, ${name}!`;
}

greet('Asha');   // OK
greet(42);       // Error: Argument of type 'number' is not assignable to parameter of type 'string'.
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "outDir": "dist",
    "rootDir": "src",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- `target`: which JavaScript version to output.
- `strict`: turns on the strongest checks. Always use it for new projects.
- `outDir` / `rootDir`: where the input and output files live.

## Important points
- Run `tsc --noEmit` in CI to check types without building.
- Keep `strict: true` from the start. Turning it on later is painful.
- Types can't check data from outside your app (like an API response) at runtime. Validate those values with code or a library such as Zod.
