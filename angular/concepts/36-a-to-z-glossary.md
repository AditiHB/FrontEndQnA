# 36. Angular A to Z Glossary

> **Like I'm 5:** This is a dictionary of Angular words, from A to Z. Look up a word, then follow its link to learn more.

The tutorial's last chapter, [Chapter 37: Graduation day](../tutorial/37-graduation.md), has a shorter glossary with the chapter where you met each word.

Quick reference for every letter. Each entry links to the topic document for details.

## A
- **AOT (Ahead-of-Time compilation)**: templates compiled during build, not in the browser. Faster startup and type checking. → [01](01-project-setup-and-cli.md), [32](32-build-and-bundling.md)
- **Angular CLI**: command-line tool for creating, building, testing, and updating projects. → [01](01-project-setup-and-cli.md)
- **Animations**: effects on elements: `animate.enter` / `animate.leave` plus CSS (the older `@angular/animations` package is deprecated). → [17](17-animations.md)
- **Async pipe**: subscribes to observables in templates and cleans up automatically. → [06](06-pipes.md)
- **Attribute directive**: changes the look or behavior of an element. → [04](04-directives.md)

## B
- **bootstrapApplication**: starts a standalone app. → [01](01-project-setup-and-cli.md)
- **Budgets**: build limits on bundle size. → [32](32-build-and-bundling.md)
- **BehaviorSubject**: a Subject that holds a current value. → [10](10-rxjs.md)

## C
- **Change detection**: checks templates and updates the DOM. → [11](11-change-detection.md)
- **CDK (Component Dev Kit)**: behavior-only building blocks. → [20](20-material-and-cdk.md)
- **Components**: the basic UI building blocks. → [02](02-components.md)
- **Content projection**: passing markup into a component with `ng-content`. → [02](02-components.md)
- **computed**: a memoized signal derived from other signals. → [09](09-signals.md)
- **CSP (Content Security Policy)**: browser policy against injected scripts. → [30](30-security.md)

## D
- **Dependency injection**: providing services to classes through an injector. → [08](08-dependency-injection-and-services.md)
- **Defer (`@defer`)**: lazy-loads template parts. → [05](05-control-flow.md)
- **Directives**: attribute, structural (legacy), and component-based. → [04](04-directives.md)
- **DestroyRef**: lets you run cleanup when a component is destroyed. → [07](07-lifecycle-hooks.md)

## E
- **effect**: runs side effects when signals change. → [09](09-signals.md)
- **Environments**: build-time and runtime configuration per environment. → [33](33-environments-and-configuration.md)
- **ErrorHandler**: global hook for unhandled errors. → [29](29-error-handling-and-logging.md)
- **Elements (Angular Elements)**: Angular components as Web Components. → [24](24-web-components-elements.md)
- **Eager**: the change detection strategy that checks a component on every round; the old `Default`, renamed in Angular 22. → [11](11-change-detection.md)

## F
- **Forms**: template-driven and reactive forms with validators. → [15](15-forms.md)
- **Functional guards and interceptors**: function-based route and HTTP hooks. → [12](12-routing.md), [14](14-http-client-and-interceptors.md)
- **fileReplacements**: swaps files at build time, for example environments. → [33](33-environments-and-configuration.md)

## G
- **Guards**: decide whether navigation can proceed (`canActivate`, `canMatch`, `canDeactivate`). → [12](12-routing.md), [../interviewQnA/03-routing-and-http.md](../interviewQnA/03-routing-and-http.md)
- **Generated code (`ng generate`)**: schematics that create components, services, and more. → [01](01-project-setup-and-cli.md)

## H
- **HttpClient**: the built-in HTTP client. → [14](14-http-client-and-interceptors.md)
- **Hydration**: attaching to server-rendered HTML without re-rendering. → [22](22-ssr-hydration-and-prerendering.md)
- **Host bindings**: `host` metadata on components and directives. → [04](04-directives.md)

## I
- **i18n**: internationalization and localization. → [18](18-internationalization-i18n.md)
- **Injector hierarchy**: root, route, and component injectors. → [08](08-dependency-injection-and-services.md)
- **Input / Output**: parent-child communication. → [21](21-component-communication.md)
- **Interceptors**: middleware for HTTP requests and responses. → [14](14-http-client-and-interceptors.md)
- **INP (Interaction to Next Paint)**: Core Web Vital for responsiveness. → [31](31-performance.md)

## J
- **JIT (Just-in-Time compilation)**: compiles templates in the browser. Used in some dev and test setups; production uses AOT. → [32](32-build-and-bundling.md)
- **Jasmine**: the older test framework used with Karma; Angular 22 projects use Vitest by default. → [27](27-testing.md)

## K
- **Karma**: the older test runner that launches browsers; replaced by Vitest as the default. → [27](27-testing.md)
- **Keyboard navigation**: every interactive element reachable with a keyboard. → [19](19-accessibility.md)

## L
- **Lazy loading**: loading routes and components only when needed. → [13](13-lazy-loading-and-preloading.md)
- **Lifecycle hooks**: `ngOnInit`, `ngOnDestroy`, and others. → [07](07-lifecycle-hooks.md)
- **linkedSignal**: a writable signal that resets when its source changes. → [09](09-signals.md)
- **LCP (Largest Contentful Paint)**: Core Web Vital for loading. → [31](31-performance.md)

## M
- **Material**: Angular's Material Design component library. → [20](20-material-and-cdk.md)
- **Micro-frontends**: independently deployed UI parts. → [25](25-micro-frontends.md)
- **model()**: two-way binding signal for inputs. → [21](21-component-communication.md)
- **Module Federation**: runtime sharing of code between builds. → [25](25-micro-frontends.md)
- **Monorepo (Nx)**: several apps and libraries in one repository. → [26](26-libraries-monorepos-and-schematics.md)

## N
- **ng-content**: projection slot. → [02](02-components.md)
- **NgRx**: state management library based on Redux principles. → [16](16-state-management.md)
- **NgZone**: the zone that triggers change detection. → [11](11-change-detection.md)
- **NgOptimizedImage**: image directive for performance. → [31](31-performance.md)
- **ngsw (Angular service worker)**: caching and offline support. → [23](23-service-workers-and-pwa.md)

## O
- **OnPush**: change detection strategy that checks only when inputs or signals change. The default in Angular 22 (the old strategy is `Eager`). → [11](11-change-detection.md)
- **Observable**: a stream of values over time. → [10](10-rxjs.md)
- **output()**: typed event emitter for components. → [21](21-component-communication.md)

## P
- **Pipes**: transform values in templates. → [06](06-pipes.md)
- **Preloading**: loading lazy routes in the background. → [13](13-lazy-loading-and-preloading.md)
- **Providers**: configuration that tells the injector how to create a dependency. → [08](08-dependency-injection-and-services.md)
- **PWA (Progressive Web App)**: installable, offline-capable web app. → [23](23-service-workers-and-pwa.md)
- **Prerendering**: building HTML pages at build time. → [22](22-ssr-hydration-and-prerendering.md)

## Q
- **Queries**: `viewChild`, `contentChild`, and their plural forms. → [21](21-component-communication.md)
- **Query parameters**: `?key=value` values read with `input()` or `ActivatedRoute`. → [12](12-routing.md)

## R
- **Reactive forms**: forms built in TypeScript with `FormGroup` and `FormControl`. → [15](15-forms.md)
- **Router**: maps URLs to components. → [12](12-routing.md)
- **RxJS**: reactive streams library used by Angular. → [10](10-rxjs.md)
- **Resolvers**: load data before a route activates. → [../interviewQnA/03-routing-and-http.md](../interviewQnA/03-routing-and-http.md)

## S
- **Signals**: reactive values with `signal`, `computed`, and `effect`. → [09](09-signals.md)
- **SSR (Server-Side Rendering)**: rendering HTML on the server. → [22](22-ssr-hydration-and-prerendering.md)
- **Standalone components**: components without NgModules. → [02](02-components.md)
- **Services**: shared logic and state. → [08](08-dependency-injection-and-services.md)
- **@Service()**: the Angular 22 decorator that registers a class as an app-wide singleton service (the older form is `@Injectable({ providedIn: 'root' })`). → [08](08-dependency-injection-and-services.md)
- **Structural directives**: `*ngIf` and similar (legacy in favor of control flow). → [05](05-control-flow.md)

## T
- **Templates**: HTML with Angular syntax. → [03](03-templates-and-data-binding.md)
- **TestBed**: testing utility for components and services. → [27](27-testing.md)
- **track (in `@for`)**: stable key for list items. → [05](05-control-flow.md)
- **TransferState**: passes server data to the browser to avoid duplicate requests. → [22](22-ssr-hydration-and-prerendering.md)
- **Two-way binding**: `[(ngModel)]` and `model()`. → [03](03-templates-and-data-binding.md)

## U
- **Universal**: former name of Angular SSR, now `@angular/ssr`. → [22](22-ssr-hydration-and-prerendering.md)
- **Unit tests**: test small units in isolation. → [27](27-testing.md)
- **Upgrades (`ng update`)**: automated major-version migration. → [35](35-upgrades-and-migration.md)

## V
- **ViewChild / viewChild()**: query elements in a component's own template. → [21](21-component-communication.md)
- **Virtual scrolling**: renders only visible rows. → [20](20-material-and-cdk.md)
- **View Transitions**: browser animations between route changes. → [17](17-animations.md)
- **Validators**: rules for form controls. → [15](15-forms.md)
- **Vitest**: the default unit test runner in Angular 22. → [27](27-testing.md)

## W
- **Web Components**: browser standard for custom elements. → [24](24-web-components-elements.md)
- **Workspace**: one `angular.json` covering several projects. → [01](01-project-setup-and-cli.md)
- **WCAG**: accessibility guidelines targeted at AA level. → [19](19-accessibility.md)

## X
- **XSRF (CSRF) token**: header sent with state-changing requests. → [30](30-security.md)
- **XSS (Cross-site scripting)**: injected script attacks, mitigated by sanitization and CSP. → [30](30-security.md)

## Y
- **Yarn / npm**: package managers used by Angular projects. Use lock files and `npm ci` in CI. → [34](34-cicd-and-deployment.md)
- **YAML**: format for CI pipelines such as GitHub Actions. → [34](34-cicd-and-deployment.md)

## Z
- **Zone.js**: library that patches async APIs to trigger change detection. Not used by new Angular 22 apps. → [11](11-change-detection.md)
- **Zoneless**: Angular without Zone.js, driven by signals and explicit updates. The default for new Angular 22 apps. → [11](11-change-detection.md)
