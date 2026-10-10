# 6. Performance & Optimization

### Q1. How do you improve the initial load time of a large Angular app? `Core`

**Answer:** I measure first (Lighthouse, Chrome DevTools, `source-map-explorer`, Angular's bundle budgets), then:
1. **Lazy load routes** and heavy features.
2. **Defer** non-critical UI with `@defer`.
3. **Remove unused libraries** and import only what is needed (for example, `lodash-es` instead of `lodash`).
4. **Enable production build** optimizations: AOT, minification, tree shaking, and differential loading in older versions.
5. **Preload** likely next routes.
6. **Use SSR or prerendering** (Angular Universal, now part of `@angular/ssr`) for public pages, so content is visible before JavaScript runs.
7. Set **budgets** in `angular.json` so the build fails when the bundle grows too much.

---

### Q2. What is the difference between CSR, SSR, SSG, and hydration? `Advanced`

**Answer:**
- **CSR (client-side rendering)**: the browser downloads JS and renders everything. Blank page until JS runs.
- **SSR (server-side rendering)**: the server renders HTML for each request. Better first paint and SEO.
- **SSG / prerendering**: HTML is generated at build time for known routes.
- **Hydration**: after SSR, Angular reuses the server DOM and attaches event listeners, without re-rendering it. Use `provideClientHydration()`. Incremental hydration can defer parts of the page.

**Pitfalls:** code that uses `window` or `localStorage` must check the platform (`isPlatformBrowser`), and HTTP responses can be transferred with `TransferState` to avoid calling the API twice.

---

### Q3. How do you optimize change detection in a large component tree? `Advanced`

**Answer:**
- Use `OnPush` on all presentational components.
- Use signals so only the views that read the changed signal are updated.
- Avoid function calls in templates that run on every check, such as `{{ format(item) }}`. Use a pure pipe or a `computed`.
- Run high-frequency events (scroll, mousemove) outside Angular with `NgZone.runOutsideAngular` (only with Zone.js), and re-enter only when needed.
- Consider zoneless change detection for new apps.

---

### Q4. How do you handle a list with 50,000 rows? `Advanced`

**Answer:** Use **virtual scrolling** from `@angular/cdk/scrolling`: render only the rows visible in the viewport.

```html
<cdk-virtual-scroll-viewport itemSize="48" class="viewport">
  <div *cdkVirtualFor="let row of rows; trackBy: trackById">{{ row.name }}</div>
</cdk-virtual-scroll-viewport>
```

Also: server-side paging or infinite scroll, and avoid heavy per-row components.

---

### Q5. What is the difference between `ngZone.runOutsideAngular` and `ChangeDetectorRef.detach`? `Architect`

**Answer:**
- `runOutsideAngular` prevents Zone.js from triggering change detection for code that does not need UI updates, such as a canvas animation loop. You call `ngZone.run()` only when the UI must update.
- `detach()` stops the component's own change detection. You call `detectChanges()` manually. It is useful for very heavy components, such as a live trading grid updating every 100 ms.

---

### Q6. How do you find and fix memory leaks in an Angular app? `Advanced`

**Answer:**
1. Reproduce by navigating back and forth between screens.
2. Take heap snapshots in Chrome DevTools and compare them. Look for detached DOM nodes and growing arrays.
3. Check the usual suspects: unsubscribed observables, `setInterval` without `clearInterval`, event listeners without removal, global `Subject`s holding references, and `shareReplay` without `refCount`.
4. Add `ngOnDestroy` cleanup, `takeUntilDestroyed`, and `DestroyRef`.

---

### Q7. What are the best practices for HTTP performance? `Core`

**Answer:**
- Cache reads with `shareReplay` or a cache service, with a TTL.
- Avoid duplicate requests (for example, two components requesting the same user). Use a shared store or deduplicate in the service.
- Use pagination, filtering on the server, and field selection (sparse fieldsets, GraphQL) for large payloads.
- Enable gzip or Brotli on the server, and use `ETag` / `Cache-Control` headers.
- Batch requests where possible.

---

### Q8. How do you optimize images and fonts? `Core`

**Answer:** Use `NgOptimizedImage` (`ngSrc`) for lazy loading, sizing, and priority on the hero image. Serve modern formats (WebP, AVIF) with responsive `srcset`. Use `font-display: swap` and preload critical fonts.

---

### Q9. How do you use `trackBy` / `track` and pure pipes to reduce DOM work? `Core`

**Answer:** See the core concepts section. Stable track keys keep DOM nodes when a list is reordered. Pure pipes and `computed` values avoid recalculating derived data on every check.

---

### Q10. How do you measure performance in production? `Architect`

**Answer:** Use Real User Monitoring (RUM) with Core Web Vitals: **LCP** (largest contentful paint), **INP** (interaction to next paint, which replaced FID), and **CLS** (cumulative layout shift). Send them to an analytics tool, and set alerts for regressions. Use the Angular DevTools profiler to find slow components locally. Add performance budgets to CI so pull requests that make the bundle bigger are flagged.
