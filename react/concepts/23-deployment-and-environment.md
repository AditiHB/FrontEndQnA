# 23. Deployment & Environment Variables

> **Like I'm 5:** Building the app is packing a suitcase, and deploying is sending it to the hotel. Environment variables are the hotel address labels, which change depending on the trip.

## Build

```bash
npm run build      # outputs static files to dist/
npm run preview    # serve the production build locally
```

Vite outputs `index.html` and hashed JavaScript and CSS files. Those can be hosted on any static host.

## Environment variables (Vite)

```bash
# .env.production
VITE_API_URL=https://api.example.com
```

```tsx
const apiUrl = import.meta.env.VITE_API_URL;
```

- Only variables starting with `VITE_` are exposed to the browser.
- Values are baked into the build. Changing them requires a new build.
- Never put secrets in `VITE_` variables. Anyone can read the bundle.

## Single-page app routing on hosts

If the app uses client-side routes, the host must serve `index.html` for unknown paths.

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

Netlify, Vercel, Azure Static Web Apps, and Firebase Hosting have similar rewrite rules.

## Docker

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

## CI pipeline

1. `npm ci`
2. Lint and type-check (`tsc --noEmit`)
3. Unit tests
4. `npm run build`
5. Deploy the `dist/` artifact to staging, then production
6. Smoke test after deploy

## Caching
- Hashed asset files can be cached for a year.
- `index.html` should not be cached for long, so new releases are picked up.

## Important points
- Build once per environment, and keep configuration in environment variables.
- Check the bundle size as part of CI.
- Use preview deployments for pull requests to test before merging.
