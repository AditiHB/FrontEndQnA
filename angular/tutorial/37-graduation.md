# Chapter 37: Graduation day

> **Like I'm 5:** Remember the first day, when the toy shop was an empty room with a sign on the door? Look around now. It has shelves, a cash desk, a back office, a night guard, a delivery truck, and a map for every visitor in two languages. You built it, one small step at a time, and you know where every nail went. Today we do not build anything new. We walk through the shop once, check that every light works, and look at where to go next.

Concept reference: [36. Angular A to Z glossary](../concepts/36-a-to-z-glossary.md)

[Back: Chapter 36](36-upgrades-and-migration.md) · Back to the start: [Tutorial home](README.md)

## What we do today

1. **Look back**: every concept, and the chapter where you built it.
2. **Run the final health check** on the finished Toy Shop.
3. **Take the tour** of the finished project.
4. **A Toy Shop glossary**: the words you now know.
5. **Look forward**: practice interviews, ideas, and what this tutorial did not cover.

## 1. What you built

The Toy Shop in numbers (the finished project, after Chapter 36):

| What | How many |
|------|----------|
| Components | 20 |
| Services | 13 |
| Directives / pipes | 2 / 1 |
| Lines of app code (TypeScript, without tests) | about 2,100 |
| Unit test files / tests | 39 / 99 |
| Browser (end-to-end) tests | 10, five of them are accessibility checks |
| Statement coverage | 87 percent |
| Languages | 2 (English and Hindi) |
| First download, production | 664 kB raw, about 172 kB compressed |
| Known security problems in the libraries we ship (`npm audit`) | 0 |

And here is every concept, in the order you met it. Each row links to the chapter and to the concept page in the reference folder.

| Chapter | Concept page | What the Toy Shop got |
|---------|--------------|------------------------|
| [0. Welcome](00-welcome.md) | | The plan, the tools, the rules of the game |
| [1. Set up and meet the CLI](01-set-up-and-meet-the-cli.md) | [01 Project setup and CLI](../concepts/01-project-setup-and-cli.md) | A running project, and the files inside it |
| [2. Components](02-components.md) | [02 Components](../concepts/02-components.md) | The product card, the header, and the first tests |
| [3. Templates and data binding](03-templates-and-data-binding.md) | [03 Templates](../concepts/03-templates-and-data-binding.md) | Toy data drawn on the screen, clicks and typing |
| [4. Talking between components](04-talking-between-components.md) | [21 Component communication](../concepts/21-component-communication.md) | Inputs, outputs, two-way models, content projection |
| [5. Control flow](05-control-flow.md) | [05 Control flow](../concepts/05-control-flow.md) | `@if`, `@for`, `@switch`, `@defer` |
| [6. Directives](06-directives.md) | [04 Directives](../concepts/04-directives.md) | Our own directives, `ngStyle`, host bindings |
| [7. Pipes](07-pipes.md) | [06 Pipes](../concepts/06-pipes.md) | Prices, dates, and a pipe of our own |
| [8. Lifecycle hooks](08-lifecycle-hooks.md) | [07 Lifecycle hooks](../concepts/07-lifecycle-hooks.md) | The sale countdown that starts and stops cleanly |
| [9. Services and dependency injection](09-services-and-dependency-injection.md) | [08 Dependency injection](../concepts/08-dependency-injection-and-services.md) | Cart service, tokens, providers |
| [10. Signals](10-signals.md) | [09 Signals](../concepts/09-signals.md) | The reactive cart and totals |
| [11. Routing](11-routing.md) | [12 Routing](../concepts/12-routing.md) | Pages, parameters, page titles |
| [12. RxJS](12-rxjs.md) | [10 RxJS](../concepts/10-rxjs.md) | Live search with `debounceTime` and `switchMap` |
| [13. The HTTP client](13-http-client.md) | [14 HTTP client](../concepts/14-http-client-and-interceptors.md) | Loading toys from a file, loading and error states |
| [14. Interceptors](14-interceptors.md) | [14 Interceptors](../concepts/14-http-client-and-interceptors.md) | Loading bar, login token, error pop-ups, a fake backend |
| [15. Forms](15-forms.md) | [15 Forms](../concepts/15-forms.md) | Login and checkout with validation and an unsaved-changes guard |
| [16. Change detection](16-change-detection.md) | [11 Change detection](../concepts/11-change-detection.md) | OnPush, zoneless, and when the screen updates |
| [17. Lazy loading](17-lazy-loading.md) | [13 Lazy loading](../concepts/13-lazy-loading-and-preloading.md) | Cart, orders, admin loaded only when needed |
| [18. State management](18-state-management.md) | [16 State management](../concepts/16-state-management.md) | A wishlist as a signal service, then as an NgRx SignalStore |
| [19. Animations](19-animations.md) | [17 Animations](../concepts/17-animations.md) | Enter and leave animations, kind to reduced motion |
| [20. Material and CDK](20-material-and-cdk.md) | [20 Material and CDK](../concepts/20-material-and-cdk.md) | Snackbars, dialogs, drag and drop, virtual scroll |
| [21. Accessibility](21-accessibility.md) | [19 Accessibility](../concepts/19-accessibility.md) | Skip link, focus, announcements, 0 axe problems |
| [22. Internationalization](22-internationalization.md) | [18 i18n](../concepts/18-internationalization-i18n.md) | A Hindi shop |
| [23. Error handling](23-error-handling.md) | [29 Error handling](../concepts/29-error-handling-and-logging.md) | A safety net that logs and tells the person |
| [24. Testing](24-testing.md) | [27 Testing](../concepts/27-testing.md) | Unit, component, service, and browser tests |
| [25. Debugging](25-debugging.md) | [28 Debugging](../concepts/28-debugging-and-devtools.md) | DevTools, `ng.*` helpers, bug hunting |
| [26. Security](26-security.md) | [30 Security](../concepts/30-security.md) | Safe templates, token rules, an XSS lab |
| [27. Performance](27-performance.md) | [31 Performance](../concepts/31-performance.md) | Images, `@defer`, Lighthouse before and after |
| [28. Server-side rendering](28-server-side-rendering.md) | [22 SSR](../concepts/22-ssr-hydration-and-prerendering.md) | Server-drawn pages with hydration |
| [29. PWA](29-pwa.md) | [23 Service workers](../concepts/23-service-workers-and-pwa.md) | Install, offline, update prompt |
| [30. Libraries and schematics](30-libraries-and-schematics.md) | [26 Libraries](../concepts/26-libraries-monorepos-and-schematics.md) | A component library and our own generator |
| [31. Web components](31-web-components.md) | [24 Web components](../concepts/24-web-components-elements.md) | The star rating as a plain HTML tag |
| [32. Micro-frontends](32-micro-frontends.md) | [25 Micro-frontends](../concepts/25-micro-frontends.md) | A shell loading a remote shelf |
| [33. Build and bundling](33-build-and-bundling.md) | [32 Build](../concepts/32-build-and-bundling.md) | Budgets, the size report, tree shaking |
| [34. Environments and configuration](34-environments-and-configuration.md) | [33 Environments](../concepts/33-environments-and-configuration.md) | Environment files and a runtime `config.json` |
| [35. CI/CD and deployment](35-cicd-and-deployment.md) | [34 CI/CD](../concepts/34-cicd-and-deployment.md) | Lint, Docker, nginx, a GitHub Actions robot |
| [36. Upgrades and migration](36-upgrades-and-migration.md) | [35 Upgrades](../concepts/35-upgrades-and-migration.md) | A real 21-to-22 upgrade, Dependabot |

## 2. The final health check

Run every check, from the project folder, in this order:

```bash
npm ci
npm run format:check
npm run lint
npm audit --audit-level=high --omit=dev
npm run test:coverage
npm run build
npx playwright install chromium   # first time only
npm run e2e
```

What you should see (our real results on the finished project):

```
npm run format:check   All matched files use Prettier code style!
npm run lint           All files pass linting.
npm audit              found 0 vulnerabilities
npm run test:coverage  Test Files  39 passed (39)
                       Tests  99 passed (99)
                       Statements : 87.09%
npm run build          Initial total   664.03 kB   171.75 kB
npm run e2e            10 passed
```

Then start the real production server and ask it the smoke questions:

```bash
npm run serve:ssr:toy-shop &
node scripts/smoke.mjs http://localhost:4000
```

```
PASS  the health page says ok  (/healthz)
PASS  the home page already contains the toys (server rendering works)  (/)
PASS  a product page opens  (/product/1)
PASS  config.json is never cached for long  (/config.json)
PASS  the service worker file is never cached for long  (/ngsw-worker.js)
PASS  the security policy uses the same nonce as the page  (/)

All good.
```

That is the same list your GitHub Actions robot runs on every change (Chapter 35). You now have a project that can prove it works.

## 3. Take the tour

The finished project is in the [`toy-shop-final`](toy-shop-final/) folder, next to this file. Open its [README](toy-shop-final/README.md): it has the commands, the settings, and a map of the folders.

How to read the project like a detective:

1. Start at `src/main.ts` and `src/app/app.config.ts`. Everything the app needs at start-up is **provided** here (Chapters 9, 13, 14, 28, 29, 34).
2. Then open `src/app/app.routes.ts`. It is the table of contents (Chapters 11, 17).
3. Pick a page folder (`pages/home`). Read the `.ts`, then the `.html`, then the test (Chapters 2, 3, 24).
4. Follow one request: click **Add to cart**, find the service that handles it (`cart-service.ts`), and find where the number in the header comes from (Chapters 9, 10).
5. Follow one HTTP call: the home page asks `ProductService`, the interceptors wrap the call, the fake backend or the file answers (Chapters 13, 14).
6. Read the tests last. They are the best description of what the code is meant to do.

The two bigger side projects live next to it:

- [`toy-lab-final`](toy-lab-final/): the component library, the web-component widget, and the schematic (Chapters 30 and 31).
- [`toy-federation-final`](toy-federation-final/): the shell and remote (Chapter 32).

## 4. A Toy Shop glossary

Words you now know, with the chapter where you met them. For the full dictionary see the [A to Z glossary](../concepts/36-a-to-z-glossary.md).

| Word | Short meaning | Chapter |
|------|---------------|---------|
| **AOT** | Templates are compiled during the build, not in the browser | 1, 33 |
| **Artifact** | A thing a pipeline makes (a build folder, an image) | 35 |
| **Binding** | A live link between data and the screen: `{{ }}`, `[x]`, `(x)`, `[(x)]` | 3 |
| **Budget** | A size limit the build must stay under | 33 |
| **Change detection** | Angular's check of what to redraw | 16 |
| **Component** | A reusable piece of screen: a class, a template, and styles | 2 |
| **Computed** | A signal that is calculated from other signals | 10 |
| **CSP** | A browser rule listing which scripts may run | 26, 35 |
| **DI** (dependency injection) | Angular hands a class the helpers it asks for | 9 |
| **Directive** | Adds behaviour to an existing element | 6 |
| **Effect** | Code that runs again when the signals it reads change | 10 |
| **Guard** | A route check: may this person enter? | 11 |
| **Hydration** | A server-drawn page is "woken up" by the browser | 28 |
| **i18n** | Making an app ready for many languages | 22 |
| **Interceptor** | A function every HTTP request and response passes through | 14 |
| **Lazy loading** | Download code only when it is needed | 17 |
| **Migration** | A program that edits your code for a new version | 36 |
| **Nonce** | A one-time random word that proves a script is allowed | 35 |
| **Observable** | A stream of values over time (RxJS) | 12 |
| **OnPush** | Check this component only when something it uses changes | 16 |
| **Pipe** | Changes how a value looks in a template | 7 |
| **Provider** | A recipe that tells DI how to make a value | 9 |
| **PWA** | A website that can be installed and works offline | 29 |
| **Reactive form** | A form described in code with `FormGroup` and `FormControl` | 15 |
| **Title strategy** | Decides the title of each page (and, for us, announces it) | 21 |
| **Schematic** | A code generator or migration | 30, 36 |
| **Service worker** | A background script that caches files and handles updates | 29 |
| **Signal** | A value that tells Angular who reads it | 10 |
| **SSR** | The server draws the first page | 28 |
| **Standalone** | A component that lists its own imports (no NgModule) | 2 |
| **Tree shaking** | Unused code is left out of the build | 33 |
| **Zoneless** | Angular updates the screen when told (signals), without Zone.js watching everything | 16 |

## 5. Look forward

### Practice for interviews

The Toy Shop gave you something to *talk about*: "In my project I..." beats any memorised definition. The question banks in the [interview Q&A folder](../interviewQnA/README.md) now have a real project behind them:

| Interview topic | Q&A file | Your chapters |
|-----------------|----------|----------------|
| Core concepts | [Core concepts](../interviewQnA/01-core-concepts.md) | 2 to 8, 16 |
| DI and architecture | [Dependency injection and architecture](../interviewQnA/02-dependency-injection-and-architecture.md) | 9, 17, 18 |
| Routing and HTTP | [Routing and HTTP](../interviewQnA/03-routing-and-http.md) | 11, 13, 14 |
| RxJS, state, signals | [RxJS, state and signals](../interviewQnA/04-rxjs-state-and-signals.md) | 10, 12, 18 |
| Forms | [Forms](../interviewQnA/05-forms.md) | 15 |
| Performance | [Performance](../interviewQnA/06-performance.md) | 16, 17, 27, 33 |
| Testing | [Testing](../interviewQnA/07-testing.md) | 24 |
| Security | [Security](../interviewQnA/08-security.md) | 26, 35 |
| Full stack (Angular and Java) | [Full stack](../interviewQnA/09-fullstack-angular-java.md) | 13, 14, 34, 35 |
| System design and leadership | [System design and leadership](../interviewQnA/10-system-design-and-leadership.md) | 30 to 36 |

A good drill: pick one question, answer it out loud in under two minutes, and **point at a file in the Toy Shop** as your example.

### Ideas to grow the shop

Each of these is a real exercise, small enough for a week and big enough to teach something:

1. **A real backend.** Replace the fake backend interceptor with a small server (for example Spring Boot or Express). Your `API_URL` setting (Chapter 34) is the only address you have to change.
2. **Signal forms for checkout.** Chapter 15 showed a small signal-form lab. Rewrite the checkout with it and compare.
3. **Pagination or infinite scroll** for the toy list, using `@defer (on viewport)` or virtual scroll.
4. **A review system**: star input (a form control that you write yourself), a list of reviews, a moderation page in the admin corner.
5. **Search by voice or a barcode scanner** with a browser API, wrapped in a service you can fake in tests.
6. **A third language** (Spanish?). How many strings are new? How long does it take now that the workflow is known?
7. **Real-time stock** with Server-Sent Events or a WebSocket, shown through a signal.
8. **Performance budget in CI**: run Lighthouse in the pipeline and fail when the score drops.
9. **A feature flag** in `config.json` for a new checkout, with a staged roll-out.
10. **Replace one piece with a library you wrote**: move the `ToyBadge` from the app into your `toy-ui` library (Chapter 30) and use it from there.

### What this tutorial did not cover

Be honest about the edges of your map:

- **The classic NgRx Store** (actions, reducers, effects). We used the lighter SignalStore. Many big projects still use the Store.
- **Real authentication**: OAuth 2 and OpenID Connect, refresh tokens, secure cookies. Our login is a pretend.
- **Real payments.** Never handle card numbers in your own front end; use a hosted payment page of a payment provider.
- **Very large apps**: Nx or other monorepo tools, module boundaries, design systems at scale, and team workflows.
- **Advanced RxJS**: custom operators, multicasting, marble tests.
- **Observability in production**: error tracking services, real-user monitoring, and logs you can search.
- **Ongoing change**: Angular keeps moving. Read the release notes every six months, and use Chapter 36's routine.

### A last word

You did not just read about Angular. You built a shop with it, broke it on purpose, fixed it, tested it, measured it, locked it down, put it in a box, and learned how to move it to a new house. The commands will change a little with each release. The ideas you learned will not: **small pieces, clear data flow, tests as a safety net, measure before you optimise, and keep upgrading in small steps**.

Go build something.

[Back to the tutorial home](README.md)
