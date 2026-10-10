# 23. Service Workers & PWA

## Key concepts
- A **service worker** is a script that runs in the background, intercepts network requests, and caches responses.
- A **Progressive Web App (PWA)** is a web app that can be installed, works offline, and sends push notifications.
- Angular provides `@angular/service-worker`, configured with `ngsw-config.json`.

## Adding PWA support

```bash
ng add @angular/pwa
```

This adds the manifest, icons, the service worker registration, and `ngsw-config.json`.

## Registration

```ts
// app.config.ts
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
```

## Caching configuration

```json
{
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": { "files": ["/index.html", "/*.js", "/*.css"] }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": { "files": ["/assets/**"] }
    }
  ],
  "dataGroups": [
    {
      "name": "api",
      "urls": ["/api/**"],
      "cacheConfig": { "strategy": "freshness", "maxSize": 100, "maxAge": "1h", "timeout": "5s" }
    }
  ]
}
```

- `performance` strategy: cached first, fast.
- `freshness` strategy: network first, falls back to cache. Good for API data.

## Handling updates

```ts
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';

private swUpdate = inject(SwUpdate);

constructor() {
  if (this.swUpdate.isEnabled) {
    this.swUpdate.versionUpdates
      .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
      .subscribe(() => {
        if (confirm('A new version is available. Reload now?')) location.reload();
      });
  }
}
```

## Push notifications

```ts
private swPush = inject(SwPush);

subscribe() {
  this.swPush.requestSubscription({ serverPublicKey: VAPID_PUBLIC_KEY })
    .then(sub => this.api.saveSubscription(sub));
}
```

## Offline behavior
- Show an offline banner using `navigator.onLine` and the `online` / `offline` events, or an RxJS `fromEvent` stream.
- Queue writes locally (IndexedDB) and sync when the connection returns, for critical flows.

## Important points
- Service workers only work over HTTPS (localhost is an exception for development).
- Caching bugs are hard to debug. Use a versioned build hash, and test the update flow.
- Do not cache sensitive authenticated responses in a shared cache.
