# 26. Libraries, Monorepos & Schematics

> **Like I'm 5:** A library is a toolbox you share with friends. A monorepo is one big toy box holding many toolboxes. A schematic is a robot helper that writes code from a template for you.

> **Learn it by doing:** build this step by step in the tutorial: [Chapter 30: Libraries, monorepos and schematics](../tutorial/30-libraries-and-schematics.md).

## Key concepts
- A **library** is reusable Angular code (components, services, pipes) published as a package.
- A **workspace** can hold several applications and libraries.
- **Nx** is a popular tool for managing monorepos, with dependency graphs, affected builds, and caching.
- **Schematics** are code generators that create or modify files in a project.

## Create a library

```bash
ng generate library ui-kit
ng generate component button --project=ui-kit
ng build ui-kit                 # uses ng-packagr
```

Library structure:

```
projects/ui-kit/
├── ng-package.json             # ng-packagr config
├── package.json                # peerDependencies on @angular/*
└── src/
    ├── public-api.ts           # exports the public surface
    └── lib/
        └── button/button.component.ts
```

```ts
// public-api.ts
export * from './lib/button/button.component';
```

## Use the library in the app

```ts
// tsconfig.json paths (created by ng generate library)
"paths": { "@acme/ui-kit": ["dist/ui-kit"] }
```

```ts
import { ButtonComponent } from '@acme/ui-kit';
```

## Peer dependencies

```json
{
  "peerDependencies": {
    "@angular/core": ">=19.0.0",
    "@angular/common": ">=19.0.0"
  }
}
```

Do not bundle Angular inside the library. The consuming app supplies it.

## Nx monorepo

```bash
npx create-nx-workspace@latest acme --preset=angular-monorepo
nx g @nx/angular:library --name=orders-data-access --directory=libs/orders/data-access
nx affected -t build test lint
nx graph
```

Boundary rules (`@nx/enforce-module-boundaries`) prevent a feature from importing another feature's internal files.

## Writing a schematic

```bash
ng generate schematic my-feature
```

Schematics use `@angular-devkit/schematics` to create files from templates. A common use is generating a feature folder with routes, a service, and tests, following team conventions.

## Versioning and publishing
- Use semantic versioning. Breaking changes need a major version.
- Publish to a private registry (npm, Azure Artifacts, GitHub Packages).
- Keep a changelog. Tools such as Changesets help automate releases.

## Important points
- Keep libraries framework-focused and free of app-specific state.
- Use `@angular/cdk` and `@angular/material` as peer dependencies if your library depends on them.
- Enforce module boundaries in lint, not just in code review.
