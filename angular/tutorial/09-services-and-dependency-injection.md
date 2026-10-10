# Chapter 9: Services and dependency injection

> **Like I'm 5:** A toy shop has a storeroom keeper. Instead of every shelf building its own storeroom, they all ask the one keeper: "Please bring me the Racing Car." Angular is the shop manager who always knows who the keeper is, and hands the right helper to anyone who asks.

Concept reference: [08. Dependency injection and services](../concepts/08-dependency-injection-and-services.md)

[Back: Chapter 8](08-lifecycle-hooks.md) · Next: [Chapter 10: Signals](10-signals.md)

## What we build today

We move the toy list out of the page and into a **service**, a helper that anybody can ask for. We also give the shop a name and a tax rate as **injected values**, so the name appears in the header and the page title from one single place.

(There is nothing new to *see* in this chapter. The shop looks the same. What changes is how it is built, and that is a big deal.)

## The big idea

Right now the home page owns the list of toys. If the cart page also needs toys, it would need its own copy. If the toys later come from a server, both pages would have to change.

The cure: put the toy-handling code in **one class**, a *service*, and let every component **ask** for it. The asking is called **dependency injection** (DI):

- A **dependency** is something a class needs (a helper).
- **Injection** means the class does not build it itself. Angular builds it and hands it over.

You ask with one word, `inject(...)`:

```ts
private productService = inject(ProductService);
```

Why is this great?

1. **One copy.** All components get the *same* `ProductService`. They share data and do not repeat work.
2. **Easy to change.** Swap the service and no component changes.
3. **Easy to test.** In a test you can hand over a fake service.

**Grown-up words:**

- **Service**: a plain class that does a job (data, logging, login, ...).
- **Provider**: the instruction that tells Angular how to make a dependency.
- **Injector**: Angular's helper-handing machinery. There is a *tree* of injectors (the app, then routes, then components), and a request walks up the tree until someone can provide the answer.
- **`@Service()`**: the modern way to say "make one of these for the whole app". Older code writes `@Injectable({ providedIn: 'root' })`, which works the same. You will see both.
- **Injection token**: a name tag for a value that is not a class (a string, a number, a setting).
- **Singleton**: one instance shared by everyone.

## Step 1: Make the service

```bash
ng generate service services/product
```

The file is named `product-service.ts`. Fill it in:

**`src/app/services/product-service.ts`**

```ts
import { Service } from '@angular/core';
import { sampleProducts } from '../data/sample-products';
import { Product } from '../models/product';

// @Service() tells Angular: "Make ONE of these for the whole app, and hand it to
// anyone who asks." (The older way to say the same thing is
// @Injectable({ providedIn: 'root' }).)
@Service()
export class ProductService {
  private readonly products = sampleProducts;

  getAll(): Product[] {
    return this.products;
  }

  getById(id: number): Product | undefined {
    return this.products.find((p) => p.id === id);
  }
}
```

- `@Service()` is the decorator that registers the class with the injector as an app-wide singleton.
- `private readonly products = sampleProducts` is the storeroom shelf. Nobody outside can touch it (`private`).
- `getAll()` and `getById(id)` are the only ways to get toys. Later (Chapter 13) their insides will talk to a server, but their outsides will stay the same.

Test it. A service is a class, so `TestBed.inject(ProductService)` is all you need:

**`src/app/services/product-service.spec.ts`**

```ts
import { TestBed } from '@angular/core/testing';
import { ProductService } from './product-service';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    service = TestBed.inject(ProductService);
  });

  it('knows all twelve toys', () => {
    expect(service.getAll().length).toBe(12);
  });

  it('finds a toy by its id', () => {
    expect(service.getById(3)?.name).toBe('Toy Train');
  });

  it('returns nothing for an unknown id', () => {
    expect(service.getById(999)).toBeUndefined();
  });
});
```

## Step 2: Ask for the service

In `home.ts`, delete the import of `sampleProducts`, and ask for the service instead:

**`src/app/pages/home/home.ts`** (what changed)

```diff
@@ -1,9 +1,9 @@
-import { Component, computed, ElementRef, signal, viewChild } from '@angular/core';
+import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
 import { AddedEvent, ProductCard } from '../../components/product-card/product-card';
 import { RecommendedToys } from '../../components/recommended-toys/recommended-toys';
 import { SaleCountdown } from '../../components/sale-countdown/sale-countdown';
-import { sampleProducts } from '../../data/sample-products';
 import { Category } from '../../models/product';
+import { ProductService } from '../../services/product-service';
 
 type CategoryChoice = 'all' | Category;
 
@@ -14,7 +14,10 @@ type CategoryChoice = 'all' | Category;
   templateUrl: './home.html',
 })
 export class Home {
-  products = sampleProducts;
+  // inject() asks Angular for the helper we need.
+  private productService = inject(ProductService);
+
+  products = this.productService.getAll();
   lastAdded = signal('');
 
   // The sale ends ten minutes from now.
```

`inject(ProductService)` is a request. Angular looks for a provider, finds `@Service()`, creates the one and only instance the first time, and hands it over. Every later request gets the same instance.

You can only call `inject()` in an *injection context*: while a class is being built (a field initializer or the constructor) or inside a function that Angular runs for you. That is why we write it as a field.

## Step 3: Values that are not classes

Where does the shop's name live? It is a text, not a class. For things like this, Angular has **injection tokens**. Create `src/app/tokens.ts`:

**`src/app/tokens.ts`**

```ts
import { InjectionToken } from '@angular/core';

// An InjectionToken is a name tag for a value that is not a class.
// The "factory" is the default value if nobody gives a different one.
export const SHOP_NAME = new InjectionToken<string>('SHOP_NAME', {
  factory: () => 'Toy Shop',
});

export const TAX_RATE = new InjectionToken<number>('TAX_RATE', {
  factory: () => 0.08, // 8 percent
});
```

- `new InjectionToken<string>('SHOP_NAME', { factory: () => 'Toy Shop' })` makes a name tag. The `factory` gives a **default** value, used when nobody provides another.
- `SHOP_NAME` is the name tag. The value is the text.

You can *replace* the default for the whole app in `app.config.ts`:

**`src/app/app.config.ts`** (what changed)

```diff
@@ -1,7 +1,14 @@
 import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
 import { provideRouter } from '@angular/router';
 import { routes } from './app.routes';
+import { SHOP_NAME, TAX_RATE } from './tokens';
 
 export const appConfig: ApplicationConfig = {
-  providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes)],
+  providers: [
+    provideBrowserGlobalErrorListeners(),
+    provideRouter(routes),
+    // Give the name tags their real values.
+    { provide: SHOP_NAME, useValue: 'Toy Shop' },
+    { provide: TAX_RATE, useValue: 0.08 },
+  ],
 };
```

`{ provide: SHOP_NAME, useValue: 'Toy Shop' }` reads: "when anyone asks for `SHOP_NAME`, give them this value."

Now the root component and the header stop hard-coding the name:

**`src/app/app.ts`** (what changed)

```diff
@@ -1,7 +1,8 @@
-import { Component, signal } from '@angular/core';
+import { Component, inject } from '@angular/core';
 import { RouterOutlet } from '@angular/router';
 import { SiteHeader } from './components/site-header/site-header';
 import { Home } from './pages/home/home';
+import { SHOP_NAME } from './tokens';
 
 @Component({
   imports: [RouterOutlet, SiteHeader, Home],
@@ -10,5 +11,5 @@ import { Home } from './pages/home/home';
   templateUrl: './app.html',
 })
 export class App {
-  protected readonly title = signal('Toy Shop');
+  protected readonly title = inject(SHOP_NAME);
 }
```

**`src/app/app.html`** (what changed)

```diff
@@ -1,7 +1,7 @@
 <app-site-header />
 
 <main class="page">
-  <h1>{{ title() }}</h1>
+  <h1>{{ title }}</h1>
   <app-home />
   <router-outlet />
 </main>
```

**`src/app/components/site-header/site-header.ts`** (what changed)

```diff
@@ -1,6 +1,7 @@
 import { DatePipe } from '@angular/common';
-import { Component, signal } from '@angular/core';
+import { Component, inject, signal } from '@angular/core';
 import { FormsModule } from '@angular/forms';
+import { SHOP_NAME } from '../../tokens';
 
 @Component({
   imports: [FormsModule, DatePipe],
@@ -9,6 +10,7 @@ import { FormsModule } from '@angular/forms';
   templateUrl: './site-header.html',
 })
 export class SiteHeader {
+  shopName = inject(SHOP_NAME);
   shopperName = signal('');
   today = new Date();
 }
```

**`src/app/components/site-header/site-header.html`** (what changed)

```diff
@@ -1,5 +1,5 @@
 <header class="site-header">
-  <span class="logo">🧸 Toy Shop</span>
+  <span class="logo">🧸 {{ shopName }}</span>
 
   <label class="name-box">
     Your name:
```

Rename the shop in `app.config.ts` and watch the header change. One place, whole shop.

Tokens are easy to test, too:

**`src/app/tokens.spec.ts`**

```ts
import { TestBed } from '@angular/core/testing';
import { SHOP_NAME, TAX_RATE } from './tokens';

describe('tokens', () => {
  it('have sensible default values', () => {
    expect(TestBed.inject(SHOP_NAME)).toBe('Toy Shop');
    expect(TestBed.inject(TAX_RATE)).toBe(0.08);
  });

  it('can be replaced with another value', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: SHOP_NAME, useValue: 'Test Shop' }],
    });
    expect(TestBed.inject(SHOP_NAME)).toBe('Test Shop');
  });
});
```

## Check it works

```bash
npx ng test --watch=false
```

```
 Test Files  12 passed (12)
      Tests  23 passed (23)
```

- [ ] The shop looks exactly as before.
- [ ] Change `useValue: 'Toy Shop'` to `'Mia\'s Toy Barn'` in `app.config.ts`: the header and the page title change. Change it back.

## Bonus lab: how the injector thinks

[`extras/ch09/di-lab.spec.ts`](extras/ch09/di-lab.spec.ts) is a test file that shows the rules of DI in five small tests. Copy it to `src/app/extras/` and run the tests.

**`src/app/extras/di-lab.spec.ts`**

```ts
import { Component, inject, InjectionToken, Service } from '@angular/core';
import { TestBed } from '@angular/core/testing';

// A counter service. @Service() = "one shared copy for the whole app".
@Service()
class Counter {
  count = 0;
}

// A message that can be swapped for another class.
class RealGreeter {
  greet() {
    return 'Hello from the real greeter';
  }
}
class FakeGreeter {
  greet() {
    return 'Hello from the fake greeter';
  }
}

const GREETER = new InjectionToken<RealGreeter>('GREETER', { factory: () => new RealGreeter() });
const OPTIONAL_THING = new InjectionToken<string>('OPTIONAL_THING');

// Two components that both ask for a Counter.
@Component({ selector: 'app-a', template: '' })
class A {
  counter = inject(Counter);
}

// This one lists Counter in its OWN providers, so it gets its own private copy.
@Component({ selector: 'app-b', template: '', providers: [Counter] })
class B {
  counter = inject(Counter);
}

describe('dependency injection lab', () => {
  it('a root service is shared: everyone gets the same one', () => {
    const a = TestBed.createComponent(A).componentInstance;
    const a2 = TestBed.createComponent(A).componentInstance;
    a.counter.count = 5;
    expect(a2.counter.count).toBe(5);
    expect(a.counter).toBe(TestBed.inject(Counter));
  });

  it('a component-level provider gives that component its own private copy', () => {
    const shared = TestBed.inject(Counter);
    const b = TestBed.createComponent(B).componentInstance;
    b.counter.count = 99;
    expect(shared.count).toBe(0);
    expect(b.counter).not.toBe(shared);
  });

  it('useClass swaps one class for another (great for tests)', () => {
    TestBed.configureTestingModule({ providers: [{ provide: GREETER, useClass: FakeGreeter }] });
    expect(TestBed.inject(GREETER).greet()).toBe('Hello from the fake greeter');
  });

  it('useFactory builds the value with your own code', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: GREETER, useFactory: () => ({ greet: () => 'made by a factory' }) }],
    });
    expect(TestBed.inject(GREETER).greet()).toBe('made by a factory');
  });

  it('{ optional: true } gives null instead of an error when nobody provides it', () => {
    const thing = TestBed.runInInjectionContext(() => inject(OPTIONAL_THING, { optional: true }));
    expect(thing).toBeNull();
  });
});
```

What it proves:

| Test | Lesson |
|------|--------|
| Two components get the same `Counter` | A root service is a **singleton** |
| `providers: [Counter]` on a component | That component gets its **own private copy**. The injector finds the nearest provider first. |
| `useClass: FakeGreeter` | Swap an implementation, for example in a test |
| `useFactory: () => ...` | Build the value with your own code |
| `inject(TOKEN, { optional: true })` | Get `null` instead of an error if nobody provides it. (Other options: `self`, `skipSelf`, `host`.) |

The four provider "recipes" in one table:

| Recipe | Meaning |
|--------|---------|
| `useValue` | Here is the finished value |
| `useClass` | Make one with this class |
| `useFactory` | Run this function to make it |
| `useExisting` | It is an alias for another provider |

## What you learned

- A service is a class that does a job; `@Service()` makes it one shared app-wide copy.
- `inject(Thing)` asks Angular for a helper. You do not use `new`.
- Components stay small and testable because the shared work lives in services.
- `InjectionToken` names values that are not classes; `provide`/`useValue` sets them.
- The injector looks upwards from the component to find a provider; a component-level provider gives a private copy.

## Try it yourself

1. Add a method `count()` to `ProductService` that returns how many toys there are. Show it in the home page's heading: "All toys (12)".
2. Use `TAX_RATE` somewhere: inject it into `ProductCard` and show "price with tax" under the price. (Hint: `price * (1 + tax)` with the `currency` pipe.)
3. Make a `LoggerService` with a `log(message)` method that calls `console.log`. Inject it into `Home` and log when a toy is added.
4. In a test for `Home`, swap `ProductService` for a fake that returns only two toys. (Hint: `providers: [{ provide: ProductService, useValue: { getAll: () => [...] } }]`.)

## If something goes wrong

**You inject something nobody provides:**

```
ɵNotFound: NG0201: No provider found for `SecretService`. Source: Standalone[_App].
```

This is the most famous DI error. The class has no `@Service()` (or `providedIn`), or it is not listed in any `providers`. Add `@Service()` to the class. The `Source:` part tells you who was asking.

**`inject() must be called from an injection context`:** you called `inject()` inside a normal method, such as a button handler. Call it in a field initializer or in the constructor and keep the result in a field.

**A test fails with `No provider for ...`:** the test module does not know the service either. If the service is `@Service()` it works automatically; otherwise add it to `providers` in `TestBed.configureTestingModule`.

**Old tutorials inject through the constructor** (`constructor(private product: ProductService)`). That still works, but `inject()` is shorter, works in functions (guards, interceptors), and is what this tutorial uses.

Next: [Chapter 10: Signals](10-signals.md)
