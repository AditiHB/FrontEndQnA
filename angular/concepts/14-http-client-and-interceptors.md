# 14. HTTP Client & Interceptors

## Key concepts
- `HttpClient` makes HTTP requests and returns cold observables.
- **Interceptors** run for every request and response, in registration order.
- Use `provideHttpClient()` in the app config.

## Setup

```ts
provideHttpClient(
  withFetch(),                                  // use the Fetch API (optional)
  withInterceptors([authInterceptor, errorInterceptor]),
);
```

## Typed requests

```ts
export interface Order { id: string; total: number; createdAt: string; }

@Injectable({ providedIn: 'root' })
export class OrderApi {
  private http = inject(HttpClient);
  private base = '/api/v1/orders';

  list(page = 0, size = 20) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PagedModel<Order>>(this.base, { params });
  }

  get(id: string) { return this.http.get<Order>(`${this.base}/${id}`); }

  create(body: CreateOrder) { return this.http.post<Order>(this.base, body); }

  update(id: string, body: Partial<Order>) {
    return this.http.patch<Order>(`${this.base}/${id}`, body);
  }

  remove(id: string) { return this.http.delete<void>(`${this.base}/${id}`); }
}
```

## Reading response details

```ts
this.http.get<Order>(url, { observe: 'response' }).subscribe(res => {
  console.log(res.status, res.headers.get('ETag'), res.body);
});
```

## Error handling and retry

```ts
this.http.get<Order[]>(url).pipe(
  timeout(10_000),
  retry({ count: 2, delay: (err, attempt) => timer(attempt * 500) }),
  catchError((err: HttpErrorResponse) => {
    return throwError(() => new Error(err.error?.detail ?? 'Request failed'));
  }),
);
```

## Functional interceptors

```ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  if (!token) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) inject(Router).navigate(['/login']);
      return throwError(() => err);
    }),
  );
```

## Request context and progress

```ts
const SKIP_LOADER = new HttpContextToken<boolean>(() => false);

this.http.get(url, { context: new HttpContext().set(SKIP_LOADER, true) });

this.http.post(url, formData, { reportProgress: true, observe: 'events' });
```

## Caching

Cache reads in a service with `shareReplay({ bufferSize: 1, refCount: true })`, or with an expiry map. Invalidate the cache after writes.

## Important points
- Always subscribe through `async`, `toSignal`, or a service that returns observables. Components should not own raw subscriptions.
- The server must validate every request. The frontend only improves UX.
- Test HTTP calls with `provideHttpClientTesting()` and `HttpTestingController`.
