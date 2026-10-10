# 22. Server-Side Rendering, Hydration & Prerendering

> **Like I'm 5:** Normally the browser cooks the meal (builds the page) after the recipe (JavaScript) arrives. With SSR, the server cooks it first and the browser just serves it fast. Hydration then makes the food interactive.

## Key concepts
- **CSR**: the browser renders everything after JavaScript loads.
- **SSR**: the server renders HTML for each request. Good for first paint and SEO.
- **Prerendering (SSG)**: HTML is generated at build time for known routes.
- **Hydration**: Angular attaches to the server-rendered DOM and makes it interactive without re-rendering it.

## Adding SSR

```bash
ng add @angular/ssr
```

This creates a server entry point and configures the build. Run:

```bash
ng dev:ssr      # or: ng serve --ssr (version-dependent)
ng build        # produces browser and server output
```

## Enabling hydration

```ts
// app.config.ts
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig = {
  providers: [
    provideClientHydration(withEventReplay()),   // captures early clicks and replays them
  ],
};
```

## Platform-safe code

```ts
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

private platformId = inject(PLATFORM_ID);

ngOnInit() {
  if (isPlatformBrowser(this.platformId)) {
    localStorage.setItem('visited', '1');
  }
}
```

Never access `window`, `document`, `localStorage`, or timers during server rendering without this check.

## Avoid double HTTP calls with TransferState

Angular's `HttpClient` can transfer responses from server to client automatically when hydration is enabled. For manual cases:

```ts
const KEY = makeStateKey<Product[]>('products');
const state = inject(TransferState);

const cached = state.get(KEY, null);
if (cached) return of(cached);

return this.http.get<Product[]>('/api/products').pipe(
  tap(data => state.set(KEY, data)),
);
```

## Incremental hydration

```html
@defer (hydrate on viewport) {
  <app-comments />
} @placeholder {
  <p>Loading comments…</p>
}
```

Non-critical parts of the page stay as server HTML until they are needed.

## Prerendering

In `angular.json`, enable prerendering for static routes, or provide a list of routes to render at build time. Good for marketing pages, documentation, and product catalogs that rarely change.

## Pitfalls
- Hydration mismatch: server and client render different HTML (for example, `new Date()` or random IDs). Keep rendering deterministic.
- Third-party libraries that touch the DOM on import break SSR. Load them in `afterNextRender` or with `@defer`.
- Server code must not depend on browser-only APIs or long-lived global state shared between users.
