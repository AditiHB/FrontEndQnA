# Toy Shop

The finished project from the [Angular tutorial](../README.md): a small online toy shop built step by step, using almost every Angular concept in the [concepts reference](../../concepts/README.md).

Run it:

```bash
npm ci
npm start          # http://localhost:4200
```

Pretend accounts (there is no real server; `src/app/interceptors/fake-backend-interceptor.ts` plays the server):

| Who     | Email            | Password  |
| ------- | ---------------- | --------- |
| Shopper | `mia@toys.com`   | `toys123` |
| Admin   | `admin@toys.com` | `toys123` |

## Commands

| Command                                        | What it does                                             |
| ---------------------------------------------- | -------------------------------------------------------- |
| `npm start`                                    | Dev server with live reload                              |
| `npm run start -- --configuration hi`          | Dev server in Hindi                                      |
| `npm test`                                     | Unit tests (Vitest), watch mode                          |
| `npm run test:coverage`                        | Unit tests once, with a coverage report                  |
| `npm run e2e`                                  | Browser tests (Playwright + axe accessibility checks)    |
| `npm run lint`                                 | ESLint for TypeScript and templates                      |
| `npm run format` / `npm run format:check`      | Prettier                                                 |
| `npm run build`                                | Production build (size budgets are enforced)             |
| `npm run analyze`                              | Production build plus a bundle size report               |
| `npm run serve:ssr:toy-shop`                   | Run the built server (`dist/toy-shop/server/server.mjs`) |
| `node scripts/smoke.mjs http://localhost:4000` | Quick "is it really up?" check                           |

## Settings

| Where                | What                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| `public/config.json` | Shop name, tax rate, sale length. Read when the app starts, so it can change **without** a rebuild. |
| `src/environments/`  | Build-time values (the API address).                                                                |
| `PORT`               | Port of the Node server (default 4000).                                                             |
| `BEHIND_PROXY=true`  | Trust `x-forwarded-for` and `x-forwarded-proto` from nginx or a load balancer.                      |
| `NG_ALLOWED_HOSTS`   | Extra host names the server answers to, for example `shop.example.com`.                             |

## Folder map

```
src/app/
  pages/        one folder per screen (home, product-detail, cart, checkout, login, orders, wishlist, not-found)
  admin/        lazy-loaded admin corner (inventory, warehouse, error lab)
  components/   reusable pieces (product-card, quantity-stepper, site-header, panel, dialogs, ...)
  services/     cart, auth, products, orders, wishlist store, config, logger, notifications, ...
  interceptors/ loading, auth, error, fake backend
  guards/       auth, admin, unsaved changes
  directives/ pipes/ models/ utils/
src/locale/     Hindi translation files
e2e/            Playwright tests
deploy/         nginx.conf
scripts/        bundle report and smoke test
Dockerfile      container image
.github/        CI workflow and Dependabot
```

Each chapter of the tutorial builds one part of this project, so you can read the chapters in order and see how every file came to be.
