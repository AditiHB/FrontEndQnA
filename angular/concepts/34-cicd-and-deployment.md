# 34. CI/CD & Deployment

## Key concepts
- **CI (continuous integration)**: every change is built and tested automatically.
- **CD (continuous delivery/deployment)**: every passing build is deployed through environments (dev → test → staging → production).
- An Angular app is static files after the build. It can be hosted on a CDN, a static host, Nginx, or inside a container.

## Pipeline stages

1. Install dependencies (`npm ci`).
2. Lint and format check.
3. Unit tests with coverage.
4. Production build with budgets.
5. Security scan (`npm audit`, SAST).
6. E2E tests on a preview environment.
7. Deploy to staging, then production with approval.
8. Post-deploy smoke tests and monitoring checks.

## GitHub Actions example

```yaml
name: frontend
on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx ng lint
      - run: npx ng test --watch=false --code-coverage
      - run: npx ng build --configuration production
      - uses: actions/upload-artifact@v4
        with:
          name: web-dist
          path: dist/orders-app/browser

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: web-dist
          path: dist
      # deploy step for your target (S3 + CloudFront, Azure Static Web Apps, Firebase, etc.)
```

## Docker image with Nginx

```dockerfile
# build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx ng build --configuration production

# runtime stage
FROM nginx:1.27-alpine
COPY --from=build /app/dist/orders-app/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

```nginx
# nginx.conf
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  # SPA fallback: unknown routes go to index.html
  location / {
    try_files $uri $uri/ /index.html;
  }

  # hashed assets: cache for a long time
  location ~* \.(js|css|woff2|png|jpg|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # index.html and config: never cache
  location = /index.html {
    add_header Cache-Control "no-cache";
  }
}
```

## Static hosting options
- **Azure Static Web Apps / Firebase Hosting / Netlify / Vercel**: simple SPA hosting with rewrite rules.
- **AWS S3 + CloudFront**: upload the build, invalidate the cache for `index.html` on each release, and set a custom error response to `/index.html` for 404s.
- **Kubernetes**: serve the Nginx image behind an ingress. Route `/api` to the backend.

## Release strategies
- **Rolling**: replace instances gradually.
- **Blue-green**: deploy the new version beside the old one, then switch traffic.
- **Canary**: send a small percentage of traffic to the new version and watch error rates.
- **Feature flags**: deploy code dark and enable it later.

## Preview environments
Create a preview URL for each pull request, and run E2E tests against it. Delete the environment when the pull request closes.

## Rollback
- Keep the previous build artifact available.
- Roll back by pointing the host to the previous version, not by rebuilding.
- Because `index.html` references hashed files, old and new versions can co-exist on the CDN during a rollout.

## Post-deploy checks
- Smoke test the main user journeys.
- Watch error rates, Core Web Vitals, and API latency for the first hour.
- Check that the new version is served (for example by a version string in the footer or a `/version` endpoint).

## Important points
- Use `npm ci`, not `npm install`, in CI for reproducible installs.
- Store environment-specific values outside the build (see [33-environments-and-configuration.md](33-environments-and-configuration.md)).
- Protect the production environment with approvals.
