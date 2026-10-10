# 22. Server-Side Rendering, Hydration & Prerendering

> **Like I'm 5:** Normally the browser cooks the meal (builds the page) after the recipe (JavaScript) arrives. With SSR, the server cooks it first and the browser just serves it fast. Hydration then makes the food interactive.

## Key concepts
- **CSR**: the browser renders everything after JavaScript loads.
- **SSR**: the server renders HTML for each request. Good for first paint and SEO.
- **Prerendering (SSG)**: HTML is generated at build time for known routes.
- **Hydration**: Angular attaches to the server-rendered DOM and makes it interactive without re-rendering it.
- **Render modes per route**: `RenderMode.Prerender` (once, at build time), `RenderMode.Server` (fresh on every request), `RenderMode.Client` (in the browser). Pages about one person (cart, account) are `Client`; pages that show settings or data that change without a rebuild must not be `Prerender`.
- Learn it by doing: [Tutorial chapter 28](../tutorial/28-server-side-rendering.md) adds SSR to the Toy Shop and measures what the server sends.

## Adding SSR

```bash
ng new my-app --ssr          # new project with SSR
ng add @angular/ssr          # existing project
```

This creates a server entry point (`src/server.ts`, an Express app), a `main.server.ts`, and a route table `app.routes.server.ts`, and configures the build (`"outputMode": "server"`). Then:

```bash
ng serve                      # the dev server renders on the server too
ng build                      # produces browser/ and server/ output
node dist/<app>/server/server.mjs   # run the built server (port from PORT, default 4000)
```

The old `ng dev:ssr` command belongs to Angular Universal and no longer exists.

```ts
// app.routes.server.ts: who draws each page?
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'product/:id', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Client },
];
```

`ng add` writes a single rule that prerenders everything. Replace it with your own table.

### Which hosts may the server answer?

The server protects itself from host-header attacks. List the allowed host names in `angular.json` (`build.options.security.allowedHosts`, for example `["localhost"]`) or, at start-up, in the `NG_ALLOWED_HOSTS` environment variable (for example `NG_ALLOWED_HOSTS=shop.example.com`). A request with another host gets a 400. Behind a proxy you must also decide which `x-forwarded-*` headers to trust (`trustProxyHeaders`, see [34](34-cicd-and-deployment.md)).

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

Non-critical parts of the page stay as server HTML until they are needed. The Angular 22 `ng update` adds `withNoIncrementalHydration()` to existing apps that do not use it, to keep their pre-22 behaviour, which tells you that incremental hydration is now the default for `provideClientHydration()`.

## Prerendering

Mark routes with `RenderMode.Prerender` in `app.routes.server.ts`. The build then ends with a line such as `Prerendered 1 static route.`. Good for marketing pages, documentation, and product catalogs that rarely change. The HTML is frozen until the next build.

## Pitfalls
- Hydration mismatch: server and client render different HTML (for example, `new Date()` or random IDs). Keep rendering deterministic.
- Third-party libraries that touch the DOM on import break SSR. Load them in `afterNextRender` or with `@defer`.
- Server code must not depend on browser-only APIs or long-lived global state shared between users.
