# 31. Performance

> **Like I'm 5:** Performance is making the app feel quick. Send less stuff (small bundles), show things sooner (lazy loading and defer), and don't repeat the same work (caching).

## Key concepts
- Performance has three parts: **load** (how fast the app starts), **runtime** (how smooth interactions are), and **network** (how much data moves).
- Measure before optimizing. Use real user data (RUM) and lab tools (Lighthouse, Chrome DevTools).
- Core Web Vitals: **LCP** (loading), **INP** (interaction responsiveness), **CLS** (layout stability).

## Load performance

```ts
// Lazy routes
{ path: 'reports', loadComponent: () => import('./reports/reports').then(m => m.ReportsComponent) }

// Defer non-critical UI
@defer (on viewport) { <app-recommendations /> }

// Preload likely next routes
provideRouter(routes, withPreloading(PreloadAllModules));
```

Also: SSR or prerendering for public pages, `NgOptimizedImage` for images, and font loading with `font-display: swap`.

## Runtime performance

```ts
// OnPush for presentational components
@Component({ changeDetection: ChangeDetectionStrategy.OnPush, ... })

// Stable identities for lists
@for (item of items(); track item.id) { ... }

// Cache derived values
total = computed(() => this.lines().reduce((s, l) => s + l.amount, 0));
```

- Avoid function calls in templates that run on every check.
- Use virtual scrolling for long lists.
- Run high-frequency work (scroll, mouse, animation loops) outside the zone when using Zone.js.

## Network performance
- Cache API responses where it is safe.
- Use pagination and filters on the server.
- Compress responses (gzip or Brotli) and set cache headers for static assets.
- Avoid duplicate requests. Share one request among components.

## Bundle size
- Import only what you use (`lodash-es`, not `lodash`).
- Check the bundle with `ng build --stats-json` and an analyzer such as `source-map-explorer`.
- Set **budgets** in `angular.json` so the build fails when limits are exceeded (see [32-build-and-bundling.md](32-build-and-bundling.md)).

## Measuring

```ts
// Custom performance marks
performance.mark('orders-start');
// ... work ...
performance.measure('orders', 'orders-start');
```

Use Lighthouse CI in pull requests and track RUM dashboards in production.

## Important points
- Optimize the largest bottleneck first.
- A fast UI that feels slow (poor INP) is still a problem. Keep event handlers short.
- Re-measure after each change and keep the results in your notes.
