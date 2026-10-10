# 3. Routing & HTTP

### Q1. How do you configure lazy loading routes? `Core`

**Answer:**
```ts
export const routes: Routes = [
  { path: 'orders', loadChildren: () => import('./features/orders/orders.routes').then(m => m.ORDER_ROUTES) },
  { path: 'profile', loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent) },
];
```

Lazy loading splits the bundle, so users download code only when they navigate to a feature. Use `loadComponent` for a single standalone component and `loadChildren` for a group of routes.

---

### Q2. What are the different route guards, and what is the difference between `canActivate`, `canMatch`, and `canDeactivate`? `Advanced`

**Answer:**
- **`canMatch`**: decides whether a route can be matched at all. If it returns false, the router keeps looking for other matches. Useful for role-based route variants and for stopping a lazy bundle from loading.
- **`canActivate`**: decides whether to enter the route. Runs after matching.
- **`canActivateChild`**: applies to child routes.
- **`canDeactivate`**: asks before leaving a route, for example to warn about unsaved changes.
- **`resolve`**: fetches data before the route activates.

**Important:** A guard on the client only improves UX. The backend must still enforce authorization.

---

### Q3. How do you prevent a user from losing unsaved changes? `Core`

**Answer:**
```ts
export const unsavedChangesGuard: CanDeactivateFn<FormComponent> = (component) =>
  component.form.pristine || confirm('You have unsaved changes. Leave anyway?');
```

Also handle `beforeunload` for browser tab close, since router guards do not cover that.

---

### Q4. How do you read route parameters? Why is `paramMap` better than `snapshot`? `Core`

**Answer:**
- `ActivatedRoute.snapshot.paramMap` reads the value once. If the component is reused (for example, `/users/1` → `/users/2`), the snapshot does not update.
- `ActivatedRoute.paramMap` (an observable) or `input()` with `withComponentInputBinding()` updates when the parameter changes.

```ts
provideRouter(routes, withComponentInputBinding());

export class UserDetailComponent {
  id = input.required<string>();   // bound from :id automatically
}
```

---

### Q5. What is a route resolver, and when would you use it instead of fetching in `ngOnInit`? `Advanced`

**Answer:** A resolver fetches data before the route activates, so the component never renders an empty state. Use it for critical data that the page cannot work without. For slow or optional data, fetch in the component so the page can render quickly and show a skeleton.

---

### Q6. What are preloading strategies? `Advanced`

**Answer:** After the initial load, Angular can download lazy bundles in the background.
- `PreloadAllModules`: loads everything. Simple, but can waste bandwidth.
- A custom strategy: preload only routes that have a `data: { preload: true }` flag, or wait for an idle browser or a fast network connection (`navigator.connection`).

---

### Q7. How does `HttpClient` work, and why does it return observables? `Core`

**Answer:** `HttpClient` returns **cold** observables. Nothing is sent until someone subscribes. This allows cancellation (unsubscribe aborts the request), retries, and composing requests with operators. With `async` pipe or `toSignal`, the subscription is managed for you.

---

### Q8. How do HTTP interceptors work? Give a real use case. `Core`

**Answer:** Interceptors run for each request and response, in order. Common uses:
- Adding an `Authorization` header.
- Global error handling (for example, redirect to login on 401).
- Showing and hiding a global loading indicator.
- Adding a correlation ID for tracing.

```ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).accessToken();
  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req);
};
```

---

### Q9. How do you implement refresh-token handling without breaking concurrent requests? `Architect`

**Answer:** This is a common senior-level question.

1. Attach the access token in an interceptor.
2. On a `401`, call the refresh endpoint **once**.
3. While the refresh is in progress, **queue** other failing requests. Do not start more refresh calls.
4. When the refresh completes, retry the queued requests with the new token. If the refresh fails, log out.

```ts
let refresh$: Observable<string> | null = null;

// inside interceptor on 401:
refresh$ ??= auth.refreshToken().pipe(
  finalize(() => (refresh$ = null)),
  shareReplay(1)
);
return refresh$.pipe(switchMap(token => next(withToken(req, token))));
```

**Edge cases to mention:** do not intercept the refresh call itself (it would loop), and handle logout across multiple browser tabs.

---

### Q10. Where should JWT tokens be stored, and what are the trade-offs? `Architect`

**Answer:**
- **`localStorage` / `sessionStorage`**: easy to use, but any XSS can read the token.
- **In-memory** (service variable) with a refresh token in an **HttpOnly, Secure, SameSite cookie**: the access token is not readable by JavaScript, and the refresh token is not accessible to scripts. This is the preferred pattern for banking-style apps.
- The trade-off is that the page loses the token on refresh, so you need a silent refresh on startup.

---

### Q11. How do you handle HTTP errors globally and locally? `Core`

**Answer:**
- **Global**: an error interceptor or a custom `ErrorHandler` that logs to a monitoring tool (Sentry, Datadog) and shows a generic toast.
- **Local**: `catchError` in the service or component for specific messages, such as "email already exists" on a `409`.
- Map backend error bodies (for example, RFC 7807 `ProblemDetail` from Spring) into a single frontend `ApiError` type.

---

### Q12. How do you cancel an in-flight HTTP request when the user types quickly in a search box? `Core`

**Answer:** Use `debounceTime`, `distinctUntilChanged`, and `switchMap`. `switchMap` unsubscribes from the previous request and cancels it.

```ts
searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => this.api.search(term))
).subscribe(results => this.results.set(results));
```

---

### Q13. How do you upload a file with progress tracking? `Advanced`

**Answer:** Use `reportProgress: true` and `observe: 'events'`. Then check for `HttpEventType.UploadProgress`.

```ts
this.http.post(url, formData, { reportProgress: true, observe: 'events' }).subscribe(event => {
  if (event.type === HttpEventType.UploadProgress && event.total) {
    this.progress.set(Math.round(100 * event.loaded / event.total));
  }
});
```

---

### Q14. What is the `Router` navigation lifecycle, and how do you handle navigation errors? `Advanced`

**Answer:** Navigation goes through matching, guards, resolvers, activation, and then the view update. Listen to `NavigationStart`, `NavigationEnd`, `NavigationCancel`, and `NavigationError` on `router.events`. Use a global listener for loading bars and analytics page views.

---

### Q15. Why use `withComponentInputBinding()`, and what are its limits? `Advanced`

**Answer:** It binds route params, query params, and resolver data directly to component inputs. It simplifies components, but route data keys can clash with input names. Use explicit names and keep the component focused on inputs that come from the route.
