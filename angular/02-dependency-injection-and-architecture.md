# 2. Dependency Injection & Architecture

### Q1. How does Angular's dependency injection work? `Core`

**Answer:** Angular builds a hierarchy of **injectors**. When a class asks for a dependency, the injector looks for a provider in its own level and then moves up to the parent. The lookup order is:

1. **Element injectors**: providers declared on a component or directive (`providers: [...]`) or `viewProviders`.
2. **Route / environment injectors**: providers added to lazy routes (`providers` in a route definition).
3. **Root (environment) injector**: `providedIn: 'root'` or `bootstrapApplication` providers.
4. **Platform injector**.

A component-level provider creates a new instance for that component subtree, so it is not shared.

---

### Q2. What is the difference between `providedIn: 'root'` and providing in a module or component? `Core`

**Answer:**
- `@Injectable({ providedIn: 'root' })` registers a singleton for the app and enables **tree-shaking**: if nothing injects the service, it is removed from the bundle.
- Providing in `providers: []` of a component creates a new instance for that component and its children. Use this for state that should be per-screen, such as a form wizard state service.

---

### Q3. What problem happens with services provided in lazy-loaded modules? `Advanced`

**Answer:** In the older NgModule architecture, if a module with `providers: [MyService]` was imported both eagerly and lazily, the lazy module got its own instance. This caused **duplicate state**, for example two separate auth services or two separate caches.

**Fix:** Use `providedIn: 'root'` for shared services. Put only truly feature-scoped services in the lazy route's `providers`. Never import a `forRoot()` pattern in more than one module.

---

### Q4. What is `InjectionToken` and when do you use it? `Advanced`

**Answer:** An `InjectionToken` lets you inject values that are not classes, such as configuration, feature flags, or base URLs.

```ts
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

// app.config.ts
providers: [{ provide: API_BASE_URL, useValue: environment.apiUrl }]

// service
private baseUrl = inject(API_BASE_URL);
```

Use `InjectionToken` with a `factory` for default values, so the token works without an explicit provider.

---

### Q5. What is `inject()`, and why is it preferred over constructor injection? `Core`

**Answer:** `inject()` works inside field initializers, factories, and functional guards or interceptors. It keeps constructors short and makes it easy to write **functional** APIs.

```ts
export class OrderService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
}
```

---

### Q6. What are multi-providers? Give a real example. `Advanced`

**Answer:** `multi: true` lets several providers contribute values to the same token, returned as an array. The most common example is HTTP interceptors (in the legacy `HTTP_INTERCEPTORS` token) and `APP_INITIALIZER`.

```ts
providers: [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
]
```

A real example: a plugin system where each feature registers a menu item in a shared `MENU_ITEMS` token.

---

### Q7. Explain `useClass`, `useValue`, `useFactory`, and `useExisting`. `Advanced`

**Answer:**
- `useClass`: provide a different implementation (for example, `MockApiService` in tests).
- `useValue`: provide a constant (config object).
- `useFactory`: compute a value using other dependencies, such as `() => new Logger(inject(Config).level)`.
- `useExisting`: alias one token to another, without creating a second instance.

---

### Q8. How do you structure a large enterprise Angular application? `Architect`

**Answer:** A common approach that scales well:

```
src/app/
├── core/            # singletons: auth, http interceptors, guards, global error handler
├── shared/          # reusable, dumb UI components, pipes, directives (no business logic)
├── features/
│   ├── orders/
│   │   ├── data-access/     # services, API calls, state stores
│   │   ├── feature/         # smart (container) components, routes
│   │   ├── ui/              # presentational components
│   │   ├── models/
│   │   └── orders.routes.ts
│   └── customers/
└── app.config.ts
```

**Rules I usually follow:**
- Features are **lazy loaded**, and features do not import each other directly. Shared logic goes into `shared` or `core`.
- Enforce boundaries with ESLint rules (for example, `@nx/enforce-module-boundaries` in an Nx monorepo).
- Use **smart and dumb components**: smart components fetch data, dumb components receive `input()` and emit `output()`.

---

### Q9. What is the difference between a smart (container) and a dumb (presentational) component? `Core`

**Answer:**
- **Smart**: knows about services, routing, and state. Fetches data and handles business actions.
- **Dumb**: only uses inputs and outputs, and has no injected business services. It is easy to test and reuse, and works well with `OnPush`.

---

### Q10. How do you use environment-specific configuration? `Core`

**Answer:** Use `environment.ts` / `environment.prod.ts` with `fileReplacements` in `angular.json` for build-time values. For values that change per deployment without a rebuild, load a `config.json` at startup with `APP_INITIALIZER` or `provideAppInitializer`, and then inject it through an `InjectionToken`.

**Never put secrets in the frontend bundle.** Anything in the Angular bundle is public.

---

### Q11. What are functional guards and interceptors, and why did Angular move to them? `Advanced`

**Answer:** Class-based guards and interceptors are replaced by plain functions registered with the router or `HttpClient`.

```ts
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() || router.createUrlTree(['/login']);
};

provideHttpClient(withInterceptors([authInterceptor]));
```

Benefits: less boilerplate, easier composition and testing, and no need for class-based DI in simple cases.

---

### Q12. How do you avoid circular dependencies between services? `Advanced`

**Answer:**
- Split the shared logic into a third service (for example, `TokenStore`) that both services depend on.
- Use events or `Subject`s instead of direct calls.
- Use `Injector` lazily (`inject(Injector).get(...)`) only as a last resort.
- A circular dependency is often a design smell: a service doing too much.
