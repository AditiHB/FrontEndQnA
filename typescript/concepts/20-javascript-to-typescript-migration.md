# 20. Migrating JavaScript to TypeScript

> **Like I'm 5:** Moving a messy toy room into a labelled room takes time. You don't move everything in one day. You label one shelf at a time, and keep playing while you work.

## Step-by-step plan

1. Install TypeScript and add `tsconfig.json` with `allowJs: true` and `strict: false` to start.
2. Rename one file from `.js` to `.ts` and fix the errors.
3. Add types to the most important modules first: API clients, models, shared utilities.
4. Turn on stricter flags one at a time, such as `noImplicitAny`, then `strictNullChecks`.
5. Add a CI check that stops new `.js` files from being added.

## Useful tsconfig settings during migration

```json
{
  "compilerOptions": {
    "allowJs": true,       // compile existing JavaScript
    "checkJs": true,       // type-check JavaScript using JSDoc comments
    "noImplicitAny": false // relax this at first, then turn it on
  },
  "include": ["src"]
}
```

## Typing JavaScript with JSDoc

If you can't convert a file yet, add JSDoc comments. TypeScript reads them.

```js
/**
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function add(a, b) {
  return a + b;
}
```

## Common migration problems

| Problem | Fix |
|---------|-----|
| Too many `any` at first | Start with `unknown` at the edges and narrow |
| Object shapes unknown | Write an interface from real data, then test it |
| Library without types | Write a small `.d.ts` or install `@types/...` |
| Long compile times | Use `incremental` and `skipLibCheck` |

## Tips
- Migrate from the edges inward: API boundary first, then business logic, then UI.
- Don't rewrite logic while you migrate. Change types only.
- Keep tests running during the migration. They protect behavior.

## Important points
- A gradual migration is safer than a big bang rewrite.
- Measure progress: count `.js` files and `any` uses in your reports.
