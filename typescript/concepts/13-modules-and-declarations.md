# 13. Modules & Declaration Files

> **Like I'm 5:** A module is a lunchbox. It has things inside it (exports), and you choose what to share with your friends. `import` is opening a friend's lunchbox. A declaration file (`.d.ts`) is a menu that describes what is in a lunchbox without showing the food.

## Export and import

```ts
// math.ts
export const PI = 3.14159;
export function area(r: number): number {
  return PI * r * r;
}
export default class Calculator {}

// app.ts
import Calculator, { PI, area } from './math';
import * as math from './math';
```

## Type-only imports

Use `import type` when you only need a type. It is removed at build time.

```ts
import type { User } from './models';
import { type Order, createOrder } from './orders';
```

Benefits: smaller bundles and no accidental runtime import cycles.

## Barrel files

```ts
// models/index.ts
export * from './user';
export * from './order';
```

Barrels make imports short, but they can slow builds and hide circular imports. Use them carefully.

## Path aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@app/*": ["src/app/*"] }
  }
}
```

```ts
import { UserService } from '@app/services/user.service';
```

Your bundler or test runner must understand the same aliases.

## Declaration files

```ts
// legacy-lib.d.ts
declare module 'legacy-lib' {
  export function doWork(input: string): number;
}
```

- `.d.ts` files contain types only.
- `@types/packageName` packages provide types for popular JavaScript libraries.
- Use `declare global` to add types to the global scope, rarely needed.

## Module formats
- **ESM** (`import`/`export`): the modern standard. Use it.
- **CommonJS** (`require`): older Node.js style. Still seen in some tools.

## Important points
- Avoid TypeScript `namespace` for new code. ES modules do the same job.
- Keep a single source of truth for types. Put shared types in one folder.
- Use `skipLibCheck: true` in tsconfig to speed up builds, since it skips checking `.d.ts` files.
