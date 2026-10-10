# 18. Declaration Files & Third-Party Types

> **Like I'm 5:** When a friend gives you a toy from another country, you need a picture guide that explains how it works. A declaration file is that guide. `@types` packages are guides that someone else wrote for popular toys.

## Installing types

```bash
npm install lodash
npm install --save-dev @types/lodash   # types for a JavaScript library
```

Many modern libraries ship their own types, so you don't need `@types`. Check the package first.

## Writing a declaration for an untyped module

```ts
// src/types/legacy.d.ts
declare module 'old-chart-lib' {
  export interface ChartOptions {
    width: number;
    height: number;
  }
  export function render(el: HTMLElement, options: ChartOptions): void;
}
```

Make sure the folder is included in `tsconfig.json`.

## Declaring global values

```ts
// src/types/global.d.ts
declare const __APP_VERSION__: string;

interface Window {
  analytics: { track(event: string): void };
}
```

## Declaring assets

```ts
// src/types/assets.d.ts
declare module '*.svg' {
  const url: string;
  export default url;
}
```

## Ambient vs module declarations
- A `.d.ts` file with no top-level `import`/`export` is **ambient**. Its declarations are global.
- A file with `import` or `export` is a **module**. Use `declare module 'name'` inside it to add types for another package.

## Common mistakes
- Using `any` for the whole library. Write just what you use.
- Forgetting to include the `.d.ts` folder in `tsconfig.json`.
- Copying types out of date. Prefer types the library ships, or a maintained `@types` package.

## Important points
- Start with `skipLibCheck: true` to avoid errors inside other packages' `.d.ts` files.
- Write small, accurate declarations for only what your code uses.
- Check whether a package exports its own types in its `package.json` `types` field.
