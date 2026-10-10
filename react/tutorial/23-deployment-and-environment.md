# Lesson 23: Deployment and Environment Variables – Sending the Suitcase to the Hotel

> **Like I'm 5:** Building the app is packing a suitcase, and deploying is sending it to the hotel. Environment variables are the hotel address labels, which change depending on the trip.

| | |
|---|---|
| **Concept reference** | [23 – Deployment & environment variables](../concepts/23-deployment-and-environment.md) |
| **You will learn** | What a production build contains, environment variables in Vite (`VITE_`, modes, why they are not secrets), making single-page apps work on hosts, caching rules, Docker, a CI pipeline, a bundle-size budget, and a post-deploy smoke test |
| **We build** | A "STAGING" ribbon that depends on the environment, a Docker setup, a GitHub Actions pipeline, a size checker and a smoke test |
| **Time** | About 2 hours |

## The story

The shop works on **your** computer. To let customers in, someone has to:

1. **Build** the app into plain files,
2. **Configure** it for the place it is going (a test site? the real one?),
3. **Put the files on a server** that answers every web address correctly,
4. **Check** that nothing broke on the way, automatically, every time.

## 1. The build: what goes in the suitcase

```bash
npm run build
```

Look inside the new `dist/` folder:

```text
dist/
├── index.html
├── toys.json            ← copied from public/
└── assets/
    ├── index-Cgwtc_w6.js    ← our code, minified, with a fingerprint in the name
    ├── CartPage-CFM8Z6PT.js ← lazy chunks (Lesson 17)
    └── index-D3A2bkaI.css
```

- All plain files: HTML, JavaScript, CSS. They can be hosted on **any static host**. No Node needed at runtime.
- The **fingerprint** (`-Cgwtc_w6`) is a hash of the file's content. Change one letter of the code and the name changes. This is the key to caching (section 5).
- `npm run preview` serves `dist/` locally so you can try what visitors would get.

## 2. Environment variables

Your app often needs settings that **differ by place**: which server address to call, whether this is the test site or the real one. You shouldn't edit code for that. You use **environment variables**.

### How Vite handles them

Vite reads files named `.env`, `.env.<mode>` and `.env.local` in the project root. A **mode** is a name for a situation: `npm run dev` uses mode `development`, `npm run build` uses `production`, and you can invent your own, like `staging`.

| File | Loaded when |
|------|-------------|
| `.env` | Always |
| `.env.production` | `vite build` (mode `production`) |
| `.env.staging` | `vite build --mode staging` |
| `.env.local` | Always, but **not committed to git** (personal overrides) |

Rules to remember:

- Only variables that start with **`VITE_`** are exposed to your code. Others stay private to the build tools.
- You read them as `import.meta.env.VITE_SOMETHING`.
- The values are **baked into the JavaScript during the build**, as if you had typed them in the source. Changing a value means **building again**.
- ⚠️ **Never put secrets in `VITE_` variables** (passwords, private API keys). The final JavaScript is public. Anyone can read it in their browser. A secret key must live on a server.

### Our settings

Three small files. The most specific file for the current mode wins.

📄 **`.env`** (new file)

```ini
# Used in every mode, unless a more specific file overrides it.
VITE_APP_STAGE=local
```

📄 **`.env.staging`** (new file)

```ini
# Used by: npm run build:staging
VITE_APP_STAGE=staging
```

📄 **`.env.production`** (new file)

```ini
# Used by: npm run build
VITE_APP_STAGE=production

# When the toys come from a real server, set its address here:
# VITE_API_URL=https://api.example.com
```

Tell TypeScript which variables exist, so a typo becomes a red underline:

📄 **`src/env.d.ts`** (new file)

```ts
// Adds our own variables to Vite's built-in list.
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_APP_STAGE?: 'local' | 'staging' | 'production';
}
```

### Use them

First, the API address. If `VITE_API_URL` is not set, it is an empty string, which means "the same website", exactly what we had before:

📄 **`src/api/toysApi.ts`** (edit these lines)

```diff
 const FAKE_DELAY_MS = import.meta.env.MODE === 'test' ? 0 : 500;
+// Where the toy list lives. Empty means "this same website".
+const API_URL = import.meta.env.VITE_API_URL ?? '';
@@
-  const response = await fetch('/toys.json', { signal });
+  const response = await fetch(`${API_URL}/toys.json`, { signal });
```

Second, a ribbon that shows which environment you are looking at. Everyone has once tested something on the real site while thinking it was the test site! Real visitors never see it:

📄 **`src/components/EnvRibbon.tsx`** (new file)

```tsx
import './EnvRibbon.css';

// Vite replaces VITE_APP_STAGE with a plain text while building.
const stage = import.meta.env.VITE_APP_STAGE ?? 'local';

export function EnvRibbon() {
  if (stage === 'production') return null; // customers never see this

  return (
    <div className="env-ribbon" role="note">
      {stage.toUpperCase()} build
    </div>
  );
}
```

📄 **`src/components/EnvRibbon.css`** (new file)

```css
.env-ribbon {
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 90;
  padding: var(--space-1) var(--space-3);
  background: #212529;
  color: #ffd43b;
  font-size: 0.8rem;
  font-weight: 700;
  border-top-right-radius: var(--radius);
}
```

📄 **`src/components/RootLayout.tsx`** (edit these lines)

```diff
 import { Button } from './Button';
+import { EnvRibbon } from './EnvRibbon';
 import { Footer } from './Footer';
@@
       <PageTitle />
+      <EnvRibbon />
       <ErrorBoundary
```

Add the commands we will need to `package.json`:

📄 **`package.json`** (edit these lines)

```diff
     "build": "tsc -b && vite build",
+    "build:staging": "tsc -b && vite build --mode staging",
+    "typecheck": "tsc -b",
     "lint": "oxlint",
@@
     "test:e2e": "playwright test",
+    "check:size": "node scripts/check-bundle-size.mjs",
     "preview": "vite preview"
```

Try the three situations:

```bash
npm run dev                  # a "LOCAL build" ribbon in the corner
npm run build:staging && npm run preview   # a "STAGING build" ribbon
npm run build && npm run preview           # no ribbon: this is what customers see
```

And see for yourself that the value is baked in. After `npm run build:staging`, search the output:

```bash
grep -r "staging" dist/assets | head -c 300
```

You'll find the word inside the JavaScript. That is why secrets must never go in `VITE_` variables.

> **One build per environment.** Because values are baked in, the staging site and the production site get *different builds*. Some teams prefer one build for all, with settings loaded at startup from a small `config.json` that sits next to the site. Both approaches are common.

## 3. Single-page apps and "unknown" addresses

Our app has routes like `/toys/t3` and `/cart`. In the browser, React Router draws them. But if a visitor types `https://myshop.com/toys/t3` straight into the address bar (or refreshes), the **host** receives a request for a file called `toys/t3`, which doesn't exist, and answers **404**.

The host must be told: *"if there is no such file, send `index.html` and let the router decide."* Every host has a way to say it:

| Host | Setting |
|------|---------|
| **Netlify** and Cloudflare Pages | a `_redirects` file in `public/`: `/*  /index.html  200` |
| **Vercel** | `vercel.json`: `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }` |
| **Firebase Hosting** | `firebase.json` rewrites to `/index.html` |
| **Azure Static Web Apps** | `navigationFallback` in `staticwebapp.config.json` |
| **nginx** | `try_files $uri $uri/ /index.html;` (see below) |

For Netlify-style hosts, one small file does it. Anything in `public/` is copied into `dist/` as is:

📄 **`public/_redirects`** (new file)

```text
/*    /index.html   200
```

> **Hosting under a sub-folder** (for example GitHub Pages at `https://you.github.io/toy-shop/`)? Then set `base: '/toy-shop/'` in `vite.config.ts` and pass `{ basename: '/toy-shop' }` as the second argument of `createBrowserRouter`. Otherwise the files and links point to the wrong place.

## 4. Our own server: nginx and Docker

**nginx** is a fast, popular web server. This config does two jobs: the single-page-app fallback from section 3, and **caching rules** (section 5).

📄 **`nginx.conf`** (new file)

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  # Files in /assets/ have a fingerprint in their name, so they never change.
  # Browsers may keep them for a year.
  location /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
  }

  # index.html must always be re-checked, so a new release is noticed quickly.
  location = /index.html {
    add_header Cache-Control "no-cache";
  }

  # Everything else: if there is no such file, give the app and let the router decide.
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

**Docker** packs our site and the server into one portable box (an *image*) that runs the same everywhere. The recipe has **two stages**: a big one that builds the site (needs Node), and a small final one that only has nginx and the finished files. The Node tools never reach production.

📄 **`Dockerfile`** (new file)

```dockerfile
# Stage 1: build the site
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: serve the finished files with nginx
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

Why `COPY package*.json` first and `npm ci` before copying the rest? Docker remembers each step. If only your source changed, the slow install step is reused from memory.

Tell Docker which folders to leave out of the box:

📄 **`.dockerignore`** (new file)

```text
node_modules
dist
.git
test-results
playwright-report
```

If you have Docker installed:

```bash
docker build -t toy-shop .
docker run -p 8080:80 toy-shop
```

Then open `http://localhost:8080`, go to the cart, and press refresh.

## 5. Caching: the rule of two files

Browsers keep files so they don't download them twice. That is wonderful for speed, but dangerous for releases: if the browser keeps an *old* `index.html`, it will keep asking for *old* JavaScript files.

The rule of two:

| File | Rule | Why |
|------|------|-----|
| `assets/*.js`, `assets/*.css` (fingerprinted) | Cache for **a year**, `immutable` | A new release has *new file names*, so old copies are never reused by mistake |
| `index.html` | **Don't cache for long** (`no-cache`) | It is the small file that points at the current fingerprinted files |

That is exactly what our `nginx.conf` says.

## 6. The pipeline: check everything automatically (CI)

**CI** (continuous integration) means a robot runs your checks on every change, so a broken shop never reaches a customer. The steps from the concepts:

1. `npm ci` (install exactly what `package-lock.json` says; faster and stricter than `npm install`),
2. Lint and type-check,
3. Unit tests,
4. Build,
5. Check the bundle size,
6. (Run the browser tests),
7. Deploy `dist/` to staging, then production,
8. Smoke test after deploy.

GitHub Actions reads workflow files from `.github/workflows/`:

📄 **`.github/workflows/ci.yml`** (new file)

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
      - run: npm run check:size

      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e

      # Keep the finished site so a later "deploy" job (or a person) can use it.
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist
```

> Version numbers like `@v4` change over time; use the current major versions of these actions. Every `run:` line is a command you can run on your own computer, so you can test your pipeline before the robot does.

Add a **deploy job** that `needs: check` once you pick a host (Netlify, Vercel, Azure and others each have an official action). Many hosts also give **preview deployments**: every pull request gets its own temporary web address, so reviewers can click around the change *before* it is merged.

## 7. A bundle-size budget

Websites get heavier slowly, one package at a time, until someone notices they are slow. A **budget** is a rule that fails the pipeline when the weight crosses a line. Ours adds up the *compressed* size of all JavaScript files:

📄 **`scripts/check-bundle-size.mjs`** (new file)

```js
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const BUDGET_KB = 160; // the most compressed JavaScript we allow
const dir = 'dist/assets';

let totalBytes = 0;
for (const file of readdirSync(dir).filter(name => name.endsWith('.js'))) {
  const bytes = gzipSync(readFileSync(path.join(dir, file))).length;
  totalBytes += bytes;
  console.log(`${(bytes / 1024).toFixed(1).padStart(7)} kB  ${file}`);
}

const totalKb = totalBytes / 1024;
console.log(`\nTotal: ${totalKb.toFixed(1)} kB compressed (budget: ${BUDGET_KB} kB)`);

if (totalKb > BUDGET_KB) {
  console.error('❌ The JavaScript is over budget. Check what grew (ANALYZE=true npm run build).');
  process.exit(1);
}
console.log('✅ Within budget.');
```

```bash
npm run build
npm run check:size
```

## 8. After the deploy: a smoke test

Even a passing pipeline can ship something that's broken *on the server* (a missing rewrite rule, a wrong setting). A **smoke test** is a tiny check you run against the **live address**: "does it even switch on?" (Like turning on a new toaster before trusting it.)

📄 **`scripts/smoke-test.mjs`** (new file)

```js
// Usage: node scripts/smoke-test.mjs https://my-shop.example.com
const base = process.argv[2];
if (!base) {
  console.error('Usage: node scripts/smoke-test.mjs <site-url>');
  process.exit(2);
}

const checks = [
  { path: '/', mustContain: '<div id="root">' },
  { path: '/toys.json', mustContain: 'Rainbow Blocks' },
  // A deep link only works if the host sends index.html for unknown addresses:
  { path: '/toys/t1', mustContain: '<div id="root">' },
  { path: '/cart', mustContain: '<div id="root">' },
];

let failed = false;
for (const { path, mustContain } of checks) {
  const response = await fetch(new URL(path, base));
  const text = await response.text();
  const ok = response.ok && text.includes(mustContain);
  console.log(`${ok ? '✅' : '❌'} ${response.status} ${path}`);
  if (!ok) failed = true;
}
process.exit(failed ? 1 : 0);
```

Try it on your local preview server:

```bash
npm run build && npm run preview     # in one terminal
node scripts/smoke-test.mjs http://localhost:4173     # in another
```

Run it again against your real address after every deploy (a pipeline job can do it automatically). If `/cart` or `/toys/t1` fails, your host is missing the single-page-app rewrite from section 3.

## 9. Hosting options at a glance

| Option | Good for | Notes |
|--------|----------|-------|
| **Netlify / Vercel / Cloudflare Pages** | Quick start, previews per pull request | Connect your git repo; they build for you |
| **GitHub Pages** | Free hosting for small sites | Needs the `base` setting (section 3) |
| **Azure Static Web Apps / Firebase Hosting / AWS Amplify** | Teams already on those clouds | Same idea, different config files |
| **Object storage + CDN** (S3 + CloudFront, Azure Blob + CDN) | Big traffic, full control | You write the rewrite and cache rules |
| **Docker + a server or Kubernetes** | Companies with their own platform | Our `Dockerfile` |

## 10. What just happened?

- The build made plain, fingerprinted files that any host can serve.
- **Environment variables** let one codebase behave differently per place, **without** editing code. They're baked in at build time, and they're public.
- The server must serve `index.html` for unknown addresses (the SPA fallback) and use two caching rules.
- A **pipeline** runs lint, types, tests, build, a size budget and browser tests on every change. A **smoke test** checks the live site.

### Good habits

- Keep configuration in **environment variables**, not in the code. Keep secrets on servers.
- Check **bundle size** in CI.
- Use **preview deployments** for pull requests.
- Make deploys **boring and repeatable**: the same steps from a script, never "click around and hope".
- Keep a way to **roll back** to the previous version quickly.

## 🧪 Try it yourself

1. **Prove the secret problem.** Add `VITE_SECRET_PASSWORD=hunter2` to `.env.staging` (don't commit it!). Build for staging and search `dist` for `hunter2`. Then remove it.
2. **Break the budget.** Change `BUDGET_KB` to `50` and run `npm run check:size`. Read the message. Put it back.
3. **See the fallback fail.** Run `npx serve dist` (or any server without rewrites) and open `/cart` directly. Compare it with `npm run preview`.
4. **Add a mode.** Create `.env.demo` with a different `VITE_APP_STAGE` and a `build:demo` script.
5. **A deploy job.** Read the docs of the host you like and add a `deploy` job to `ci.yml` that runs only on `main` and `needs: check`.
6. **Roll back.** Describe how you would roll back a bad release if your site is served from a Docker image.

## ✅ Check yourself

<details>
<summary>1. Why do we put <code>VITE_</code> in front of a variable name?</summary>

Vite only exposes variables with that prefix to the browser code. It protects other variables (like build tokens) from being bundled by accident.
</details>

<details>
<summary>2. Why can't a password live in a <code>VITE_</code> variable?</summary>

Its value is copied into the JavaScript at build time, and every visitor downloads that JavaScript. Secrets must stay on a server.
</details>

<details>
<summary>3. Why does a single-page app need the host to serve <code>index.html</code> for unknown paths?</summary>

Routes like <code>/cart</code> exist only in the browser's router. When someone reloads or opens the link directly, the host looks for a file named <code>cart</code>; without a fallback it would answer 404.
</details>

<details>
<summary>4. Why cache <code>assets/*.js</code> for a year but not <code>index.html</code>?</summary>

Asset file names contain a content hash, so a new version has a new name and can never be confused with the old. <code>index.html</code> keeps the same name and points to the current files, so it must always be re-checked.
</details>

<details>
<summary>5. What does <code>npm ci</code> do differently from <code>npm install</code>?</summary>

It installs exactly the versions in <code>package-lock.json</code> (and fails if the lock file and <code>package.json</code> disagree), giving reproducible, faster CI builds.
</details>

## Recap

- `npm run build` creates fingerprinted static files in `dist/`. `npm run preview` serves them locally.
- Vite env vars: `VITE_` prefix, read with `import.meta.env`, baked in at build time, never secret. Modes pick `.env.<mode>` files.
- Single-page apps need a rewrite to `index.html` on the host.
- Cache fingerprinted assets for a year and `index.html` not at all.
- A pipeline runs `npm ci`, lint, types, tests, build, a size budget, browser tests, then deploy and a smoke test.

➡️ **Next:** [Lesson 24 – Graduation day: the A to Z of React](24-graduation-and-glossary.md)
