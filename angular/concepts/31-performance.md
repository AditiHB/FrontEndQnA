# 31. Performance

> **Like I'm 5:** Performance is making the app feel quick. Send less stuff (small bundles), show things sooner (lazy loading and defer), and don't repeat the same work (caching).

## Key concepts
- Performance has three parts: **load** (how fast the app starts), **runtime** (how smooth interactions are), and **network** (how much data moves).
- Measure before optimizing. Use real user data (RUM) and lab tools (Lighthouse, Chrome DevTools).
- Core Web Vitals: **LCP** (loading), **INP** (interaction responsiveness), **CLS** (layout stability).
- Learn it by doing: [Tutorial chapter 27](../tutorial/27-performance.md) runs Lighthouse on the Toy Shop before and after fixes (performance 92 to 93, LCP 2.9 s to 2.6 s, page weight 242 KiB to 207 KiB in that run).

## Load performance

```ts
// Lazy routes
{ path: 'reports', loadComponent: () => import('./reports/reports').then(m => m.Reports) }

// Defer non-critical UI
@defer (on viewport) { <app-recommendations /> }

// Preload likely next routes
provideRouter(routes, withPreloading(PreloadAllModules));
```

Also: SSR or prerendering for public pages, `NgOptimizedImage` for images, and font loading with `font-display: swap`.

## Runtime performance

```ts
// OnPush is the default for components in Angular 22 (the old strategy is called Eager).
// In older projects, opt in explicitly:
@Component({ changeDetection: ChangeDetectionStrategy.OnPush, ... })

// Stable identities for lists
@for (item of items(); track item.id) { ... }

// Cache derived values
total = computed(() => this.lines().reduce((s, l) => s + l.amount, 0));
```

- Avoid function calls in templates that run on every check.
- Use virtual scrolling for long lists.
- In an app that still uses Zone.js, run high-frequency work (scroll, mouse, animation loops) outside the zone. Zoneless apps (the Angular 22 default) do not need this.

## Network performance
- Cache API responses where it is safe.
- Use pagination and filters on the server.
- Compress responses (gzip or Brotli) and set cache headers for static assets.
- Avoid duplicate requests. Share one request among components.

## Bundle size
- Import only what you use (`lodash-es`, not `lodash`).
- Check the bundle with `ng build --stats-json` (plus a small script or an analyzer) or `source-map-explorer` on a build made with `--source-map`. In the tutorial's Toy Shop, Angular core was 266 kB and the CDK 168 kB of the output, while all hand-written pages together were 39 kB.
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
