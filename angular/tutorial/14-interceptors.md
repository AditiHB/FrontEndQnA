# Chapter 14: Interceptors

> **Like I'm 5:** The mailman now passes through three guards at the shop door. One guard writes down "a letter went out". The second stamps your ID card on every letter. The third guard is a pretend post office that answers the letters for us. Every letter goes through the same guards, so no one has to remember to do it.

Concept reference: [14. HTTP client and interceptors](../concepts/14-http-client-and-interceptors.md) (the interceptor half)

[Back: Chapter 13](13-http-client.md) · Next: [Chapter 15: Forms](15-forms.md)

## What we build today

Three **interceptors** and the services behind them:

1. **Loading interceptor**: a thin coloured bar appears at the top of the page whenever any request is waiting.
2. **Auth interceptor**: stamps `Authorization: Bearer <token>` on every request to our own `/api/...`, once somebody is logged in.
3. **Fake backend interceptor**: a *pretend server* for `/api/login` and `/api/orders`, so we can build login and checkout pages without writing a real server.

You will not see a login page yet. That is Chapter 15. Today we build the machinery and prove it with tests.

## The big idea

Some work must happen to **every** request: show a spinner, add a login token, log errors, retry. Writing that in each service is boring, and someone will forget. An **interceptor** is a function that every HTTP request and response passes through:

```
 your code ──► [loading] ──► [auth] ──► [fake backend] ──► (the network)
 your code ◄── [loading] ◄── [auth] ◄── [fake backend] ◄── (the network)
```

Each interceptor receives the request `req` and a function `next`. It may:

- **look** at the request (and count it),
- **change** the request (`req.clone({...})`; requests are read-only, so we clone), then pass it on with `next(...)`,
- **answer by itself** without calling `next` (that is what a fake backend does),
- **change the response** by adding operators to what `next` returns.

The order in `withInterceptors([a, b, c])` is the order requests travel. Responses travel back the other way.

**Grown-up words:**

- **Functional interceptor**: a plain function of type `HttpInterceptorFn`. (Old class-based interceptors with `HTTP_INTERCEPTORS` still exist but are not needed.)
- **Bearer token**: a secret text proving who you are. The server reads it from the `Authorization` header.
- **Immutable request**: `HttpRequest` cannot be edited. You `clone` it with the changes.
- **Mock / fake backend**: a stand-in server for development and tests.

## Step 1: The loading guard

First a tiny service that counts how many requests are waiting:

**`src/app/services/loading-service.ts`**

```ts
import { computed, Service, signal } from '@angular/core';

// Counts how many requests are waiting for an answer right now.
@Service()
export class LoadingService {
  private pending = signal(0);
  readonly isLoading = computed(() => this.pending() > 0);

  start() {
    this.pending.update((n) => n + 1);
  }

  stop() {
    this.pending.update((n) => Math.max(0, n - 1));
  }
}
```

`pending` goes up by one when a request starts and down when it ends. `isLoading` is true while at least one is waiting. The `Math.max(0, ...)` is a safety belt: the number can never become negative.

Now the interceptor:

**`src/app/interceptors/loading-interceptor.ts`**

```ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading-service';

// A guard at the door: it notes when a letter leaves and when its answer comes back.
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);
  loading.start();
  return next(req).pipe(finalize(() => loading.stop()));
};
```

- `inject(LoadingService)` works inside an interceptor because Angular runs the function in an injection context (Chapter 9).
- `next(req)` sends the request on and returns the Observable of the answer.
- `finalize(...)` runs when that Observable **ends in any way**: success, error, or cancellation. So the counter always goes back down, even for failed requests.

Show the bar in the root component:

**`src/app/app.ts`** (what changed)

```diff
@@ -1,6 +1,7 @@
-import { Component } from '@angular/core';
+import { Component, inject } from '@angular/core';
 import { RouterOutlet } from '@angular/router';
 import { SiteHeader } from './components/site-header/site-header';
+import { LoadingService } from './services/loading-service';
 
 @Component({
   imports: [RouterOutlet, SiteHeader],
@@ -8,4 +9,6 @@ import { SiteHeader } from './components/site-header/site-header';
   styleUrl: './app.css',
   templateUrl: './app.html',
 })
-export class App {}
+export class App {
+  loading = inject(LoadingService);
+}
```

**`src/app/app.html`** (what changed)

```diff
@@ -1,6 +1,10 @@
+<!-- A thin bar at the very top that shows while any letter is waiting for an answer. -->
+@if (loading.isLoading()) {
+  <div class="loading-bar" role="progressbar" aria-label="Loading"></div>
+}
+
 <app-site-header />
 
 <main class="page">
-  <!-- The router puts the page that matches the address right here. -->
   <router-outlet />
 </main>
```

**`src/app/app.css`** (what changed)

```diff
@@ -0,0 +1,17 @@
+.loading-bar {
+  position: fixed;
+  top: 0;
+  left: 0;
+  right: 0;
+  height: 4px;
+  background: linear-gradient(90deg, var(--color-accent), var(--color-brand), var(--color-accent));
+  background-size: 200% 100%;
+  animation: slide 1s linear infinite;
+  z-index: 10;
+}
+
+@keyframes slide {
+  to {
+    background-position: -200% 0;
+  }
+}
```

## Step 2: Who is logged in? The auth service

The second guard needs a token, so we need a service that knows who is logged in. First the shapes of the data:

**`src/app/models/user.ts`**

```ts
export interface User {
  email: string;
  name: string;
  role: 'shopper' | 'admin';
  token: string;
}
```

**`src/app/models/order.ts`**

```ts
export interface OrderLine {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

// What the shopper sends when they press "Place order".
export interface NewOrder {
  name: string;
  email: string;
  address: string;
  giftWrap: boolean;
  notes: string;
  lines: OrderLine[];
  total: number;
}

// What the server sends back: the same thing, plus a number and a date.
export interface Order extends NewOrder {
  id: string;
  createdAt: string;
  userEmail: string;
}
```

**`src/app/services/auth-service.ts`**

```ts
import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Service, signal } from '@angular/core';
import { tap } from 'rxjs';
import { User } from '../models/user';

const SESSION_KEY = 'toyshop-user';

@Service()
export class AuthService {
  private http = inject(HttpClient);

  private readonly _user = signal<User | null>(this.load());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'admin');
  readonly token = computed(() => this._user()?.token ?? null);

  constructor() {
    // Remember who is logged in while this browser tab stays open.
    effect(() => {
      const user = this._user();
      if (user) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      else sessionStorage.removeItem(SESSION_KEY);
    });
  }

  login(email: string, password: string) {
    return this.http
      .post<User>('/api/login', { email, password })
      .pipe(tap((user) => this._user.set(user)));
  }

  logout() {
    this._user.set(null);
  }

  private load(): User | null {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null');
    } catch {
      return null;
    }
  }
}
```

This follows the pattern of the cart service (Chapter 10):

- `_user` is a private writable signal; `user` is the read-only view.
- `isLoggedIn`, `isAdmin`, and `token` are `computed` values.
- `login()` posts to `/api/login` and uses `tap` to put the answer (the user) into the signal.
- The `effect` keeps the user in `sessionStorage`, so a page refresh does not log you out, but closing the tab does.

## Step 3: The auth guard

**`src/app/interceptors/auth-interceptor.ts`**

```ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';

// Sticks the shopper's "ID card" (token) on every letter to OUR server.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();

  // Only our own API gets the token. Never send it to other websites!
  if (token && req.url.startsWith('/api/')) {
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }
  return next(req);
};
```

- `req.clone({ setHeaders: { ... } })` makes a copy with the extra header. The original stays untouched.
- **We only stamp requests to our own API** (`/api/...`). Sending your secret token to some other website would be a leak. Never skip that check.

## Step 4: A pretend server

The third guard answers requests itself. Real shops have real servers (Java, Node, ...). To learn without one, we pretend:

**`src/app/interceptors/fake-backend-interceptor.ts`**

```ts
import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { mergeMap, of, throwError, timer } from 'rxjs';
import { NewOrder, Order } from '../models/order';
import { User } from '../models/user';

export const FAKE_BACKEND_DELAY_MS = 300;
const ORDERS_KEY = 'toyshop-orders';

// A PRETEND server. It answers every address that starts with /api/ so we can
// learn without building a real backend. In a real project you delete this file
// and the real server (for example Spring Boot) answers instead.
export const fakeBackendInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) return next(req);

  // Answer after a short wait, like a real server would.
  const reply = (status: number, body: unknown) =>
    timer(FAKE_BACKEND_DELAY_MS).pipe(
      mergeMap(() =>
        status < 400
          ? of(new HttpResponse({ status, body }))
          : throwError(() => new HttpErrorResponse({ status, error: body, url: req.url })),
      ),
    );

  // POST /api/login  (the password is always "toys123")
  if (req.method === 'POST' && req.url === '/api/login') {
    const { email, password } = req.body as { email: string; password: string };
    if (password !== 'toys123') return reply(401, { message: 'Wrong email or password' });
    const user: User = {
      email,
      name: email.split('@')[0],
      role: email.startsWith('admin') ? 'admin' : 'shopper',
      token: `fake-token-${email}`,
    };
    return reply(200, user);
  }

  // Everything below needs a logged-in shopper.
  const token = req.headers.get('Authorization')?.replace('Bearer ', '') ?? '';
  const userEmail = token.startsWith('fake-token-') ? token.slice('fake-token-'.length) : '';
  if (!userEmail) return reply(401, { message: 'Please log in first' });

  if (req.method === 'GET' && req.url === '/api/orders') {
    return reply(
      200,
      loadOrders().filter((o) => o.userEmail === userEmail),
    );
  }

  if (req.method === 'POST' && req.url === '/api/orders') {
    const orders = loadOrders();
    const order: Order = {
      ...(req.body as NewOrder),
      id: `T-${1001 + orders.length}`,
      createdAt: new Date().toISOString(),
      userEmail,
    };
    localStorage.setItem(ORDERS_KEY, JSON.stringify([...orders, order]));
    return reply(201, order);
  }

  return reply(404, { message: 'The pretend server does not know that address' });
};

function loadOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) ?? '[]');
  } catch {
    return [];
  }
}
```

Read the shape of it:

- Anything that does **not** start with `/api/` (like `products.json`) is passed on with `next(req)`. Only our API is pretended.
- `POST /api/login`: any email with the password `toys123` works. Emails starting with `admin` become admins. A wrong password answers `401`.
- Everything else needs a token. It reads the `Authorization` header (that is why the auth interceptor must run *before* this one), and answers `401` if it is missing.
- `GET /api/orders` returns this user's orders; `POST /api/orders` stores a new one with an id like `T-1001`. Orders are kept in `localStorage`, so they survive a reload.
- `reply(status, body)` waits 300 ms and then answers. For an error status it throws an `HttpErrorResponse`, exactly what a real failed call gives you.

**In a real project you delete this file** and let the real server answer. Nothing else changes. That is the beauty of putting the pretending in an interceptor.

## Step 5: Plug the guards in

All three go into `provideHttpClient`, in the right order:

**`src/app/app.config.ts`** (what changed)

```diff
@@ -1,21 +1,26 @@
-import { provideHttpClient, withFetch } from '@angular/common/http';
+import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
 import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
 import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
 import { routes } from './app.routes';
+import { authInterceptor } from './interceptors/auth-interceptor';
+import { fakeBackendInterceptor } from './interceptors/fake-backend-interceptor';
+import { loadingInterceptor } from './interceptors/loading-interceptor';
 import { SHOP_NAME, TAX_RATE } from './tokens';
 
 export const appConfig: ApplicationConfig = {
   providers: [
     provideBrowserGlobalErrorListeners(),
-    // The mailman: HttpClient. withFetch() uses the browser's modern fetch.
-    provideHttpClient(withFetch()),
     provideRouter(
       routes,
-      // Hand the address blanks (:id and ?category=) straight to input() boxes.
       withComponentInputBinding(),
-      // Go back to the top of the page when we move to a new page.
       withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
     ),
+    provideHttpClient(
+      withFetch(),
+      // Every letter passes through these guards, in this order.
+      // The pretend server goes LAST, so it can see the token the others added.
+      withInterceptors([loadingInterceptor, authInterceptor, fakeBackendInterceptor]),
+    ),
     { provide: SHOP_NAME, useValue: 'Toy Shop' },
     { provide: TAX_RATE, useValue: 0.08 },
   ],
```

The order is `loading`, `auth`, `fakeBackend`. The fake backend is **last**, because it must see the token the auth interceptor added.

## Step 6: Test each guard alone

Because interceptors are plain functions, each can be tested with just the HTTP testing tools:

**`src/app/interceptors/interceptors.spec.ts`**

```ts
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../services/auth-service';
import { LoadingService } from '../services/loading-service';
import { authInterceptor } from './auth-interceptor';
import { FAKE_BACKEND_DELAY_MS, fakeBackendInterceptor } from './fake-backend-interceptor';
import { loadingInterceptor } from './loading-interceptor';

describe('interceptors', () => {
  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('loadingInterceptor', () => {
    it('says "loading" until the answer comes back', () => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withInterceptors([loadingInterceptor])),
          provideHttpClientTesting(),
        ],
      });
      const loading = TestBed.inject(LoadingService);
      const server = TestBed.inject(HttpTestingController);

      TestBed.inject(HttpClient).get('/anything').subscribe();
      expect(loading.isLoading()).toBe(true);

      server.expectOne('/anything').flush({});
      expect(loading.isLoading()).toBe(false);
    });
  });

  describe('authInterceptor', () => {
    let server: HttpTestingController;
    let http: HttpClient;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withInterceptors([authInterceptor])),
          provideHttpClientTesting(),
        ],
      });
      server = TestBed.inject(HttpTestingController);
      http = TestBed.inject(HttpClient);
    });

    it('does nothing when nobody is logged in', () => {
      http.get('/api/orders').subscribe();
      const req = server.expectOne('/api/orders');
      expect(req.request.headers.has('Authorization')).toBe(false);
    });

    it('adds the token to our own API, but never to other websites', () => {
      // Pretend someone is logged in.
      const auth = TestBed.inject(AuthService);
      (auth as unknown as { _user: { set(u: unknown): void } })._user.set({
        email: 'a@b.c',
        name: 'a',
        role: 'shopper',
        token: 'secret',
      });

      http.get('/api/orders').subscribe();
      http.get('https://other-site.example/data').subscribe();

      expect(server.expectOne('/api/orders').request.headers.get('Authorization')).toBe(
        'Bearer secret',
      );
      expect(
        server.expectOne('https://other-site.example/data').request.headers.has('Authorization'),
      ).toBe(false);
    });
  });

  describe('fakeBackendInterceptor', () => {
    let http: HttpClient;

    beforeEach(() => {
      vi.useFakeTimers();
      localStorage.clear();
      TestBed.configureTestingModule({
        providers: [provideHttpClient(withInterceptors([authInterceptor, fakeBackendInterceptor]))],
      });
      http = TestBed.inject(HttpClient);
    });

    it('lets shoppers log in with the password toys123', async () => {
      let result: unknown;
      http.post('/api/login', { email: 'mia@toys.com', password: 'toys123' }).subscribe((r) => {
        result = r;
      });
      await vi.advanceTimersByTimeAsync(FAKE_BACKEND_DELAY_MS);
      expect(result).toMatchObject({ name: 'mia', role: 'shopper' });
    });

    it('says no to a wrong password', async () => {
      let status = 0;
      http.post('/api/login', { email: 'mia@toys.com', password: 'nope' }).subscribe({
        error: (e) => (status = e.status),
      });
      await vi.advanceTimersByTimeAsync(FAKE_BACKEND_DELAY_MS);
      expect(status).toBe(401);
    });

    it('refuses orders from people who are not logged in', async () => {
      let status = 0;
      http.get('/api/orders').subscribe({ error: (e) => (status = e.status) });
      await vi.advanceTimersByTimeAsync(FAKE_BACKEND_DELAY_MS);
      expect(status).toBe(401);
    });
  });
});
```

Highlights:

- The loading test checks `isLoading()` is `true` after subscribing and `false` after `flush`.
- The auth test checks the header exists for `/api/orders` but **not** for `https://other-site.example/data`.
- The fake backend tests use **fake timers** (`vi.useFakeTimers`, `advanceTimersByTimeAsync`) so we do not wait 300 ms for real.

And a short test for the auth service:

**`src/app/services/auth-service.spec.ts`**

```ts
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth-service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

## Check it works

```bash
npx ng test --watch=false
```

```
 Test Files  19 passed (19)
      Tests  44 passed (44)
```

In the browser:

- [ ] Open DevTools, **Network**, set throttling to **Slow 3G**, and reload. A thin moving bar appears at the very top of the page until `products.json` arrives.
- [ ] Switch throttling back to **No throttling**.

(The login and order parts of the fake backend are not visible yet. They come alive in the next chapter.)

## What you learned

- An interceptor is a function `(req, next) => ...` that every request passes through; add them with `provideHttpClient(withInterceptors([...]))`.
- Requests are immutable: `clone` to change them.
- Interceptors can count (loading), change (auth header), or answer by themselves (fake backend), and the order of the list matters.
- Only add secrets to requests that go to **your own** server.
- `finalize` runs when a request ends in any way.

## Try it yourself

1. Add a fourth interceptor, `loggingInterceptor`, that does `console.log(req.method, req.url)` and passes the request on. Where in the list would you put it to see the token already attached?
2. Make `FAKE_BACKEND_DELAY_MS` 2000 and use the **Slow 3G** idea again. How does the bar behave?
3. In the loading interceptor, add `tap({ error: (e) => console.warn('failed', req.url, e.status) })` after `next(req).pipe(`. When does it print?
4. Write a test that proves the fake backend gives each user only their own orders. (Hint: log in two users, post an order as one, read as the other.)

## If something goes wrong

**The token never reaches the fake backend:** the order is wrong. `authInterceptor` must come **before** `fakeBackendInterceptor` in the list.

**`inject() must be called from an injection context`:** you called `inject` after an `await` or inside a callback. In an interceptor, call it at the top of the function.

**The loading bar never goes away:** some request never ended (a request that hangs, or one cancelled in a way that skips `finalize`). Check the Network tab for a request that stays "pending".

**Your own page starts getting `401` errors:** the fake backend answers `401` for every `/api/...` address without a token, which is the right behaviour. Log in first (Chapter 15).

Next: [Chapter 15: Forms](15-forms.md)
