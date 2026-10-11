# 34. CI/CD & Deployment

> **Like I'm 5:** CI/CD is a robot on an assembly line. Every time you change the code, it checks it, builds it, tests it, and ships it, as long as every step passes.

## Key concepts
- **CI (continuous integration)**: every change is built and tested automatically.
- **CD (continuous delivery/deployment)**: every passing build is deployed through environments (dev → test → staging → production).
- An Angular app **without** server-side rendering is static files after the build. It can be hosted on a CDN, a static host, or Nginx.
- An Angular app **with** server-side rendering (SSR) needs Node to run. The natural package is a container (a Docker image) with Nginx or a load balancer in front.
- Learn it by doing: [Tutorial chapter 35](../tutorial/35-cicd-and-deployment.md) builds the pipeline, the Docker image, and the Nginx config for the Toy Shop, and runs them.

## Pipeline stages

1. Install dependencies (`npm ci`).
2. Format check and lint.
3. Security scan (`npm audit`, SAST).
4. Unit tests with coverage.
5. Production build with budgets.
6. E2E tests against the real production server (or a preview environment).
7. Build and publish the image, then deploy to staging, then production with approval.
8. Post-deploy smoke tests and monitoring checks.

Put the cheap checks first, so a mistake stops the pipeline early.

## GitHub Actions example

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read            # least power for the robot

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true  # a new push cancels the older run

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run format:check
      - run: npm run lint
      - run: npm audit --audit-level=high --omit=dev
      - run: npm run test:coverage
      - run: npm run build            # budgets can fail the build
      - uses: actions/upload-artifact@v7
        with:
          name: web-dist
          path: dist/toy-shop
```

Check the current major versions of the actions on their release pages, and let Dependabot or Renovate propose updates (see [35](35-upgrades-and-migration.md)). Node 24 is one of the versions Angular 22 supports.

## Docker image for an SSR app

```dockerfile
# Stage 1: build (thrown away afterwards)
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: the small image we ship
FROM node:24-alpine
ENV NODE_ENV=production PORT=4000
WORKDIR /app
COPY --from=build /app/dist/toy-shop ./dist/toy-shop
USER node
EXPOSE 4000
HEALTHCHECK CMD node -e "fetch('http://localhost:4000/healthz').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "dist/toy-shop/server/server.mjs"]
```

The server bundle contains what it needs, so the second stage copies only the build output. Run as the non-root `node` user. For an app **without** SSR, use an Nginx image and copy `dist/<app>/browser` instead.

Settings for the container, as environment variables at start-up (no rebuild):
- `NG_ALLOWED_HOSTS=shop.example.com`: the host names the server answers to. Others get a 400.
- `BEHIND_PROXY=true` (a switch in your own server code, see below): trust `x-forwarded-for` and `x-forwarded-proto` from a proxy.
- A mounted `config.json` (see [33](33-environments-and-configuration.md)).

## Nginx in front of the Node server

```nginx
http {
  gzip on;
  gzip_types text/css application/javascript application/json image/svg+xml;

  upstream app { server 127.0.0.1:4000; }

  server {
    listen 8080;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
      proxy_pass http://app;
      proxy_http_version 1.1;
      proxy_set_header Host $http_host;           # keep the port: the SSR server calls itself
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  }
}
```

In the tutorial's measurement, gzip through Nginx cut the home page HTML from 35,224 to 6,933 bytes and the main script from 154,051 to 38,981 bytes. Using `$host` instead of `$http_host` drops the port, so the SSR server fetched its own files on port 80 and the page showed a "cannot reach the server" message.

For an app without SSR, serve static files:

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  location / { try_files $uri $uri/ /index.html; }   # SPA fallback
}
```

## Cache rules (important)

| Files | Header | Why |
|-------|--------|-----|
| `main-XXXX.js`, `chunk-XXXX.js`, `styles-XXXX.css` (fingerprint in the name) | `public, max-age=31536000, immutable` | A changed file gets a new name |
| `index.html`, `config.json`, `ngsw.json`, `ngsw-worker.js`, `manifest.webmanifest`, `remoteEntry.json` | `no-cache` | The browser must ask every time, or visitors keep old versions (and a service worker never updates) |

The server generated by the Angular CLI caches **every** static file for a year by default. The tutorial fixes this with a `setHeaders` rule that tells fingerprinted files from the rest.

## Security headers and a CSP

A strict Content Security Policy with a per-request **nonce** limits what an injected script can do:

- `ngCspNonce="PLACEHOLDER"` on `<app-root>` in `index.html`, and the server swaps the placeholder for a random value on every request and sends the matching `Content-Security-Policy` header.
- The `autoCsp` build option cannot be combined with SSR (`Cannot set both SSR and auto-CSP at the same time.`), so the nonce is set by hand.
- Style attributes (`style="width: 90%"`) cannot carry a nonce; allow them with `style-src-attr 'unsafe-inline'`.

Behind a proxy, Angular's server only believes `x-forwarded-*` headers when you list them in `trustProxyHeaders` on `AngularNodeAppEngine`. Without it you see: `Received "x-forwarded-for" header but "trustProxyHeaders" was not set up to allow it.`

## Health check and smoke test
- Add a `/healthz` route that answers `{ "status": "ok" }`, for Docker, load balancers, and smoke tests.
- After each deployment, run a small script that checks the health route, a page that needs server rendering, the cache headers of `config.json` and the service worker, and the CSP.

## Static hosting options
- **Azure Static Web Apps / Firebase Hosting / Netlify / Vercel**: simple SPA hosting with rewrite rules (for apps without SSR).
- **AWS S3 + CloudFront**: upload the build, invalidate the cache for `index.html` on each release, and set a custom error response to `/index.html` for 404s.
- **Kubernetes / container platforms**: run the Node image behind an ingress. Route `/api` to the backend.

## Release strategies
- **Rolling**: replace instances gradually.
- **Blue-green**: deploy the new version beside the old one, then switch traffic.
- **Canary**: send a small percentage of traffic to the new version and watch error rates.
- **Feature flags**: deploy code dark and enable it later.

## Preview environments
Create a preview URL for each pull request, and run E2E tests against it. Delete the environment when the pull request closes. (Playwright can test any running address when the base URL is configurable, for example with a `BASE_URL` variable.)

## Rollback
- Tag images with the commit id, and keep previous images available.
- Roll back by running the previous tag, not by rebuilding.
- Because `index.html` references hashed files, old and new versions can co-exist on the CDN during a rollout.

## Post-deploy checks
- Smoke test the main user journeys.
- Watch error rates, Core Web Vitals, and API latency for the first hour.
- Check that the new version is served (for example by a version string in the footer or a `/version` endpoint).

## Important points
- Use `npm ci`, not `npm install`, in CI for reproducible installs.
- Store environment-specific values outside the build (see [33-environments-and-configuration.md](33-environments-and-configuration.md)).
- Protect the production environment with approvals.
- A pipeline file you cannot run locally is only partly tested. Run its steps yourself first, and watch its first real run.
- Flaky browser tests have causes. In an SSR app a common one is acting before hydration finishes; wait for the app to signal that it is ready instead of using fixed sleeps.
