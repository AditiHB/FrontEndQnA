# 19. Tooling & Configuration

> **Like I'm 5:** Tooling is your school's helper team. The compiler is the teacher, ESLint is the hall monitor who reminds you of rules, Prettier is the neat-handwriting coach, and tsconfig is the rulebook that tells everyone how strict to be.

## tsconfig essentials

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "declaration": false,
    "sourceMap": true,
    "incremental": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": { "@app/*": ["src/app/*"] }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- `incremental`: speeds up repeat builds.
- `paths`: short import names. Must match your bundler setup.

## Multiple configs

```json
// tsconfig.app.json
{ "extends": "./tsconfig.json", "include": ["src/**/*.ts"], "exclude": ["**/*.spec.ts"] }

// tsconfig.spec.json
{ "extends": "./tsconfig.json", "include": ["src/**/*.spec.ts", "src/**/*.d.ts"] }
```

Use `extends` to share rules, then change only what differs for app code and tests.

## Project references (monorepos)

```json
{
  "references": [{ "path": "./packages/core" }, { "path": "./packages/ui" }]
}
```

Use `tsc --build` to build the projects in dependency order.

## ESLint with TypeScript

```bash
npm install --save-dev eslint typescript-eslint
```

Useful rules:
- `@typescript-eslint/no-explicit-any`: flags `any`.
- `@typescript-eslint/no-floating-promises`: flags promises you forgot to `await`.
- `@typescript-eslint/no-unused-vars`: flags unused variables.

## Prettier

Prettier formats code. Let it handle style so reviews focus on logic. Run it through the editor on save, and in CI with `prettier --check`.

## Scripts in package.json

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest run"
  }
}
```

## Important points
- Run typecheck, lint, and tests in CI. A green build should mean all three pass.
- Keep one shared base tsconfig, and extend it per project.
- Pin the TypeScript version in the project so every developer uses the same compiler.
