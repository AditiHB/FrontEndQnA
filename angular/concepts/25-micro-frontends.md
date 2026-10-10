# 25. Micro-Frontends

## Key concepts
- A **micro-frontend** is an independently built and deployed part of a larger UI, often owned by one team.
- **Module Federation** (Webpack or Rspack) lets an app load code from another app at runtime and share dependencies.
- The **shell** (host) loads **remotes** (micro-frontends) by route or by name.

## When to use
- Several teams work on one product with separate release cycles.
- Parts of the UI have different technology or deployment needs.

## When not to use
- A small team or a single product. A well-structured monolith with lazy-loaded features is usually simpler.

## Setup with Module Federation

```bash
ng add @angular-architects/module-federation
ng g @angular-architects/module-federation:init --project shell --port 4200 --type host
ng g @angular-architects/module-federation:init --project orders --port 4201 --type remote
```

## Host configuration

```ts
// shell: federation.manifest.json
{
  "orders": "http://localhost:4201/remoteEntry.js"
}
```

```ts
// shell: app.routes.ts
export const routes: Routes = [
  {
    path: 'orders',
    loadChildren: () => loadRemoteModule({
      type: 'manifest',
      remoteName: 'orders',
      exposedModule: './routes',
    }).then(m => m.ORDER_ROUTES),
  },
];
```

## Remote configuration

```ts
// orders: exposes its routes
exposes: { './routes': './src/app/orders/orders.routes.ts' }
```

## Shared dependencies

```ts
shared: {
  '@angular/core': { singleton: true, strictVersion: true },
  '@angular/common': { singleton: true, strictVersion: true },
  '@angular/router': { singleton: true, strictVersion: true },
  rxjs: { singleton: true, strictVersion: true },
}
```

`singleton: true` makes sure only one copy of Angular runs. Two copies break DI and change detection.

## Communication between micro-frontends
- Prefer URL state and browser events (`CustomEvent` on `window`).
- Share a small typed contract library, not implementation code.
- Avoid shared mutable global state.

## Design system
A shared component library (published as a package, or as Web Components) keeps the look and behavior consistent across remotes.

## Important points
- Each remote must be deployable independently, with a stable public contract.
- Decide on a versioning policy for shared libraries.
- Monitor the total bundle size. Each remote adds a runtime download.
