# Chapter 24: Testing

> **Like I'm 5:** Before a toy goes on the shelf, an inspector tests it: does the wheel turn? Does the button click? She tests the small parts first (fast and cheap), then one whole toy, and sometimes she plays with the toy exactly as a child would. The tests stay in the toy box forever, so every time you change the toy, the inspector checks it again in seconds.

Concept reference: [27. Testing](../concepts/27-testing.md)

[Back: Chapter 23](23-error-handling.md) · Next: [Chapter 25: Debugging](25-debugging.md)

## What we build today

We have been writing tests since Chapter 1. Today we look at them as a **toolbox**, and we add the last layer: **end-to-end (e2e) tests** that drive the real app in a real browser, including an **accessibility test** that runs axe on every page. We also measure **coverage**.

At the end we will have two kinds of tests:

| Kind | Tool | Count in the shop now |
|------|------|-----------------------|
| **Unit and component tests** (fast, no real browser) | Vitest + jsdom | 86 tests in 34 files |
| **End-to-end tests** (slower, a real browser) | Playwright | 9 tests |

## The big idea

Tests come in layers, called the **testing pyramid**:

```
        /\         few   slow    expensive   "does the whole shop work for a person?"   (e2e)
       /  \
      /----\       some           "do these pieces work together?"                    (integration, component)
     /      \
    /--------\     many  fast    cheap       "does this one function/service work?"     (unit)
```

- **Many** small, fast tests at the bottom. When one fails, you know exactly where.
- **Fewer** tests that check pieces together (a component with its template).
- **A few** end-to-end tests for the journeys that must never break (log in, order).

A test has three parts, "Arrange, Act, Assert":

```ts
it('adds toys and works out the totals', () => {
  cart.add(car, 2);                    // Arrange + Act
  expect(cart.total()).toBeCloseTo(27); // Assert
});
```

Good tests are **fast, independent** (one test never depends on another), **deterministic** (the same result every time), and test **behaviour** (what the user sees) and not internals.

**Grown-up words:**

- **Vitest**: the test runner (Angular 22's default). **jsdom** is a pretend browser made of JavaScript, so unit tests need no real browser.
- **TestBed**: Angular's helper that builds a small Angular world for a test (components, providers).
- **Fixture**: the test's handle on a component: `fixture.componentInstance`, `fixture.nativeElement`.
- **Mock / fake / spy**: stand-ins for real things. A *spy* records how it was called (`vi.spyOn`).
- **E2E**: end-to-end, tests through the real UI. **Playwright** is the tool we use.
- **Flaky test**: passes sometimes and fails sometimes. The enemy.
- **Coverage**: the percentage of code that tests ran.

## Step 1: A tour of the tests we already wrote

Almost every technique is in the shop already. This table is your index, so you can find a model for any situation:

| You want to test... | Look at | Technique |
|---------------------|---------|-----------|
| A plain function or pipe | `pipes/truncate-pipe.spec.ts` (Ch. 7) | create the class with `new`, call `transform` |
| A service with signals | `services/cart-service.spec.ts` (Ch. 10) | `TestBed.inject`, `TestBed.tick()` for effects |
| A component | `components/product-card/product-card.spec.ts` (Ch. 4, 5) | `fixture.componentRef.setInput(...)`, query the DOM, click |
| Component `output()`s | the same file | `componentInstance.added.subscribe(...)` |
| Time (timers, countdown) | `sale-countdown.spec.ts` (Ch. 8) | `vi.useFakeTimers()`, `vi.advanceTimersByTime` |
| HTTP | `services/product-service.spec.ts` (Ch. 13) | `HttpTestingController`: `expectOne`, `flush`, `verify` |
| Interceptors | `interceptors/interceptors.spec.ts` (Ch. 14) | HTTP testing + `withInterceptors([...])` |
| Forms and validators | `pages/checkout/checkout.spec.ts` (Ch. 15) | `form.patchValue`, `form.valid` |
| Route guards | `guards/guards.spec.ts` (Ch. 15, 17) | `TestBed.runInInjectionContext(() => guard(...))` |
| A routed page | `pages/product-detail/product-detail.spec.ts` (Ch. 11) | `RouterTestingHarness` |
| A Material dialog | `pages/cart/cart.spec.ts` (Ch. 20) | look in `document`, `vi.waitFor` |
| A custom directive | `directives/highlight.spec.ts` (Ch. 6) | a tiny host component |
| Error handling | `error-handling.spec.ts` (Ch. 23) | spies on the notifier, fake HTTP failures |

Three habits that appear again and again:

1. **`await fixture.whenStable()`** lets Angular finish its work before you look at the page. (With fake timers, use `fixture.detectChanges()`; Chapter 8.)
2. **`vi.waitFor(() => expect(...))`** retries until something becomes true, great for things that arrive "soon".
3. **Reset shared state** (`localStorage.clear()`) in `beforeEach`, so tests stay independent.

## Step 2: Useful commands

```bash
npm test                          # watch mode: re-runs when you save
npx ng test --watch=false         # run once (what CI does)
npx ng test --filter "Cart"       # only tests whose name matches
npx ng test --include "**/cart*"  # only some files
npx ng test --watch=false --coverage
```

(`ng test --help` lists them all, including `--ui` for Vitest's browser dashboard, `--reporters`, and `--browsers`.)

**Always check that a test can fail.** A test that cannot fail is worthless. Let's break the tax rate on purpose, from `0.08` to `0.1` in `tokens.ts`, and run the tests. Three tests fail, and each message points at the problem:

```
FAIL  src/app/tokens.spec.ts > tokens > have sensible default values
AssertionError: expected 0.1 to be 0.08

FAIL  src/app/services/cart-service.spec.ts > CartService > adds toys and works out the totals
AssertionError: expected 4.3 to be close to 3.44

FAIL  src/app/pages/cart/cart.spec.ts > Cart page > lists the toys that were added
AssertionError: expected 'Your cart 🛒🏎️Racing Car$12.50 − 2 +  Remove Toys$25.00Tax$2.50Total$27.50 ...' to contain '$27.00'

Tests  3 failed | 83 passed (86)
```

The tests protected us. Put the `0.08` back.

## Step 3: Measure coverage

```bash
npm run test:coverage
```

(This script is in `package.json`: `ng test --watch=false --coverage`. It needs the package `@vitest/coverage-v8`. Install it with `npm install --save-dev @vitest/coverage-v8`.) At this point of the shop, the real result is:

```
File               | % Stmts | % Branch | % Funcs | % Lines
All files          |   85.65 |    84.56 |   71.96 |   87.66
 app/directives    |     100 |    95.23 |     100 |     100
 app/interceptors  |    75.4 |    65.21 |   84.61 |   75.92
 app/pages/cart    |    92.4 |    84.61 |   57.14 |   89.18
 app/pages/home    |    75.9 |    73.52 |      50 |   83.48
 app/services      |   92.12 |    83.58 |   94.91 |    92.3
```

How to read it:

- **Statements / lines**: how much code ran. **Branches**: how many `if`/`else` paths ran. **Functions**: how many functions were called.
- Coverage tells you what is **not** tested (look at the uncovered lines). It does **not** tell you the tests are *good*. A test with no `expect` gives coverage and no protection.
- A useful goal is "high where it matters" (services, guards, validators, reducers), not 100 percent everywhere.

## Step 4: End-to-end tests with Playwright

Unit tests use a pretend browser. e2e tests use **a real one**, click real buttons, and read the real page. Install Playwright and the axe adapter:

```bash
npm install --save-dev @playwright/test @axe-core/playwright
npx playwright install chromium
```

(`playwright install` downloads a browser for the tests.) Then add the config. Playwright can start your app for you:

**`playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    // Some build machines run as "root" and need this switch for Chromium to start.
    launchOptions: { args: process.env['CI'] ? ['--no-sandbox'] : [] },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Playwright starts the app for us (or reuses it if it is already running).
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
  },
});
```

- `webServer.command: 'npm start'` starts the dev server (and reuses it if it is already running).
- `baseURL` lets tests write `page.goto('/cart')`.
- The `--no-sandbox` switch is only for machines that run as root (some CI containers).

Add two scripts to `package.json` (`test:coverage` and `e2e`) and ignore Playwright's reports in `.gitignore`:

**`package.json`** (what changed)

```diff
@@ -6,7 +6,9 @@
     "start": "ng serve",
     "build": "ng build",
     "watch": "ng build --watch --configuration development",
-    "test": "ng test"
+    "test": "ng test",
+    "test:coverage": "ng test --watch=false --coverage",
+    "e2e": "playwright test"
   },
   "private": true,
   "packageManager": "npm@10.9.4",
@@ -28,6 +30,9 @@
     "@angular/cli": "^22.2.2",
     "@angular/compiler-cli": "^22.2.0",
     "@angular/localize": "^22.2.2",
+    "@axe-core/playwright": "^4.13.0",
+    "@playwright/test": "^1.56.1",
+    "@vitest/coverage-v8": "^5.0.3",
     "jsdom": "^30.0.0",
     "prettier": "^3.8.1",
     "typescript": "~6.0.2",
```

**`.gitignore`** (what changed)

```diff
@@ -42,3 +42,7 @@ __screenshots__/
 # System files
 .DS_Store
 Thumbs.db
+
+# Test reports
+/test-results
+/playwright-report
```

Write the journeys:

**`e2e/shop.spec.ts`**

```ts
import { expect, test } from '@playwright/test';

test('the home page shows toys, and the groups filter them', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'All toys', level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Racing Car' })).toBeVisible();

  await page.getByRole('link', { name: 'Puzzles' }).click();
  await expect(page).toHaveURL(/category=puzzles/);
  await expect(page.getByRole('link', { name: 'Jigsaw Castle' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Racing Car' })).toHaveCount(0);
});

test('searching finds a toy by name', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Search toys' }).fill('panda');
  await expect(page.getByRole('link', { name: 'Sleepy Panda' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Racing Car' })).toHaveCount(0);
});

test('a shopper can fill the cart, log in, and place an order', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add to cart' }).first().click();
  await expect(page.getByRole('link', { name: /Cart/ })).toContainText('$13.50');

  // Checkout needs a login, so the guard sends us to the login page first.
  await page.getByRole('link', { name: /Cart/ }).click();
  await page.getByRole('link', { name: 'Go to checkout' }).click();
  await expect(page).toHaveURL(/\/login\?returnUrl=%2Fcheckout/);

  await page.getByLabel('Email').fill('mia@toys.com');
  await page.getByLabel('Password').fill('toys123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/\/checkout$/);

  // Pressing the button too early shows what is missing.
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page.getByText('Please type your street.')).toBeVisible();

  await page.getByLabel('Street').fill('1 Toy Lane');
  await page.getByLabel('City').fill('Toyville');
  await page.getByLabel('ZIP code').fill('12345');
  await page.getByRole('button', { name: 'Place order' }).click();

  await expect(page.getByRole('heading', { name: /Thank you, mia/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Cart/ })).toContainText('$0.00');
});

test('visitors cannot open the admin corner, but admins can', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: /Oops/ })).toBeVisible();

  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@toys.com');
  await page.getByLabel('Password').fill('toys123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('heading', { name: /Admin corner/ })).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
});
```

Notice how e2e tests are written like a person would speak:

- `page.getByRole('heading', { name: 'All toys', level: 1 })`: find things by **role and name**, the way a screen reader does. This makes tests stable *and* checks accessibility at the same time. Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors.
- `await expect(...).toBeVisible()` **waits** (up to 5 seconds) until the condition is true. You almost never need a fixed `sleep`.
- The order test tells the whole story: add to cart, get sent to log in, log in, come back, make a mistake, fix it, place the order.

And the accessibility test from Chapter 21, as a loop over all pages:

**`e2e/accessibility.spec.ts`**

```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// axe is a robot that checks a page for common accessibility mistakes
// (missing labels, low color contrast, bad heading order, and more).
for (const path of ['/', '/cart', '/login', '/wishlist', '/product/1']) {
  test(`${path} has no automatic accessibility problems`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}
```

Run them:

```bash
npm run e2e
```

```
Running 9 tests using 2 workers

  ✓  /cart has no automatic accessibility problems
  ✓  / has no automatic accessibility problems
  ...
  ✓  the home page shows toys, and the groups filter them
  ✓  searching finds a toy by name
  ✓  a shopper can fill the cart, log in, and place an order
  ✓  visitors cannot open the admin corner, but admins can

  9 passed
```

Handy Playwright tools:

| Command | What it does |
|---------|--------------|
| `npx playwright test --ui` | A window where you can run, replay, and time-travel through each step |
| `npx playwright test --headed` | Show the browser while it runs |
| `npx playwright codegen http://localhost:4200` | Records your clicks and writes the test code for you |
| `npx playwright show-trace trace.zip` | Replays a failed test (traces are saved on the first retry) |

## Bonus lab: component harnesses

A *harness* is a "remote control" for a Material component. Instead of searching the DOM for `mat-dialog-actions button` (which breaks when Material changes its inner HTML), you ask a harness. [`extras/ch24/dialog-harness.spec.ts`](extras/ch24/dialog-harness.spec.ts) tests the "Empty the cart" dialog this way. Copy it to `src/app/extras/` and run it.

**`src/app/extras/dialog-harness.spec.ts`**

```ts
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { provideRouter } from '@angular/router';
import { sampleProducts } from '../data/sample-products';
import { Cart } from '../pages/cart/cart';
import { CartService } from '../services/cart-service';

// A "harness" is a helper that knows how to operate a Material component for you,
// like a remote control. Tests then read like a person using the page, and they keep
// working even if Material changes its inner HTML.
describe('emptying the cart, tested with a dialog harness', () => {
  let loader: HarnessLoader;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    TestBed.inject(CartService).add(sampleProducts[0], 2);
    const fixture = TestBed.createComponent(Cart);
    await fixture.whenStable();
    // documentRootLoader can see overlays such as dialogs, which live outside our component.
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const button = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((b) => b.textContent?.includes('Empty the cart'));
    button?.click();
  });

  it('opens a dialog with the question, and closing it keeps the cart', async () => {
    const dialog = await loader.getHarness(MatDialogHarness);
    const text = await (await dialog.host()).text();
    expect(text).toContain('Empty the cart?');
    expect(text).toContain('No, keep it');

    await dialog.close(); // like pressing Escape
    expect(TestBed.inject(CartService).count()).toBe(2);
  });
});
```

- `TestbedHarnessEnvironment.documentRootLoader(fixture)` can see **overlays** like dialogs, which live outside your component.
- `getHarness(MatDialogHarness)` finds the open dialog; `dialog.close()` is like pressing Escape.
- Material ships a harness for each component (`MatButtonHarness`, `MatSelectHarness`, `MatTableHarness`...). You can write harnesses for your own components, too.

## Check it works

```bash
npx ng test --watch=false
```

```
 Test Files  34 passed (34)
      Tests  86 passed (86)
```

- [ ] `npm run test:coverage` prints a coverage table.
- [ ] `npm run e2e` says `9 passed`.
- [ ] You broke the tax rate on purpose and saw the failing tests (then fixed it).

## What you learned

- The testing pyramid: many fast unit tests, some component tests, a few e2e tests.
- `TestBed`, fixtures, `setInput`, spies, fake timers, `HttpTestingController`, and `RouterTestingHarness` cover almost every unit-test need.
- Coverage shows untested code, not test quality.
- Playwright drives a real browser; find elements by role and name; assertions wait automatically.
- Accessibility can be checked in every e2e run with axe.
- Always watch a test fail once.

## Try it yourself

1. Write an e2e test that adds two different toys to the cart and checks the header total. (Racing Car $12.50 plus Fire Truck $18.00, plus 8% tax: $32.94.)
2. Find the file with the lowest coverage in the report. Write one test for it.
3. Write a Playwright test that logs in with a wrong password and checks the error message.
4. Run `npx playwright test --ui` and use time-travel to look at the state of the page before and after a click.

## If something goes wrong

**`browserType.launch: Executable doesn't exist`:** run `npx playwright install chromium`.

**On a Linux server or container, Chromium will not start:** run it with `--no-sandbox` (our config does this when `CI` is set) or add the missing system libraries with `npx playwright install --with-deps chromium`.

**An e2e test is flaky (passes only sometimes):** look for `waitForTimeout` (replace with an auto-waiting `expect`), shared state between tests (give each test a fresh browser context, which Playwright does by default), and typing before the page is ready (Chapter 35 meets a real example).

**`NG0201: No provider found for ...` in a unit test:** the test module is missing a provider. Add what the real app provides (`provideRouter([])`, `provideHttpClient()` + `provideHttpClientTesting()`).

**The test hangs forever on `await fixture.whenStable()`:** something never finishes: fake timers (use `detectChanges`) or a pending HTTP request nobody answered (`flush` it).

Next: [Chapter 25: Debugging](25-debugging.md)
