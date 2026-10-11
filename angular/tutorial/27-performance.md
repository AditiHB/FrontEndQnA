# Chapter 27: Performance

> **Like I'm 5:** A fast shop opens its door quickly, does not carry every toy out at once, and does not make customers wait while the shopkeeper counts the whole stockroom. To make a shop faster, you do not guess. You use a stopwatch, find the slowest part, fix only that, and use the stopwatch again.

Concept reference: [31. Performance](../concepts/31-performance.md)

[Back: Chapter 26](26-security.md) · Next: [Chapter 28: Server-side rendering](28-server-side-rendering.md)

## What we build today

We make the shop **load faster**, and we prove it with numbers:

1. **Measure first** with the build report and **Lighthouse**.
2. **Lazy-load every page** except the home page.
3. **Stop downloading fonts** from another website (use the fonts already on the person's device).
4. Check the **budget** warning and decide what to do.
5. Measure again.

The result, from real runs in this tutorial's test environment:

| | Before (Chapter 26) | After (Chapter 27) |
|--|---------------------|---------------------|
| JavaScript and CSS the first page needs (raw) | 733.33 kB | **627.69 kB** |
| The same, compressed (what travels) | 179.37 kB | **160.85 kB** |
| Lighthouse performance score (mobile) | 92 | **93** |
| Largest Contentful Paint | 2.9 s | **2.6 s** |
| Total download size in Lighthouse | 242 KiB | **207 KiB** |

## The big idea

A fast web app is not about clever tricks. It is about doing **less, later**: download less, run less, and wait less. Performance has three parts:

| Part | Question | Tools |
|------|----------|-------|
| **Load performance** | How fast does the first page appear? | lazy loading, `@defer`, small bundles, fast fonts and images, server rendering (Chapter 28) |
| **Runtime performance** | Does the page stay smooth while you use it? | signals, `OnPush` (Chapter 16), `track` in `@for`, virtual scroll (Chapter 20), pure pipes |
| **Network performance** | How much and how often do we ask the server? | caching (`shareReplay`, Chapter 13), compression, a CDN, a service worker (Chapter 29) |

The user-focused measurements are called **Core Web Vitals**:

| Vital | Plain words | Good value |
|-------|-------------|-----------|
| **LCP** (Largest Contentful Paint) | When does the biggest thing on screen appear? | 2.5 s or less |
| **INP** (Interaction to Next Paint) | After a click, how long until the screen reacts? | 200 ms or less |
| **CLS** (Cumulative Layout Shift) | Does the page jump around while loading? | 0.1 or less |

Lighthouse also reports **FCP** (first content), **TBT** (how long the main thread was blocked), and a **performance score** from 0 to 100.

**The golden rule: measure first.** Programmers are bad at guessing where time goes.

**Grown-up words:**

- **Bundle**: the JavaScript files the build produces. **Initial bundle**: what must download before the first page works.
- **Lazy loading**: downloading code only when needed (Chapter 17).
- **Tree shaking**: the build removes code you never use.
- **Performance budget**: a size limit that makes the build warn or fail when you go over it.
- **Main thread**: the single thread that runs your JavaScript *and* paints the page. If it is busy, the page freezes.

## Step 1: Measure the bundle

```bash
npm run build
```

The end of the output is the report card. At the end of Chapter 26 it said:

```
Initial chunk files   | Names            |  Raw size | Estimated transfer size
main-BAER2KSV.js      | main             | 446.63 kB |                97.26 kB
chunk-CRNNGeK1.js     | -                | 216.56 kB |                63.52 kB
chunk-DqCEvcVd.js     | -                |  60.00 kB |                16.15 kB
styles-4LK7XISX.css   | styles           |   9.61 kB |                 1.89 kB
polyfills-CGB46XCN.js | polyfills        | 537 bytes |               537 bytes
                      | Initial total    | 733.33 kB |               179.37 kB

▲ [WARNING] bundle initial exceeded maximum budget. Budget 500.00 kB was not met by 233.33 kB with a total of 733.33 kB.
```

Two things to notice:

- **`main` is 446 kB.** That includes **every page** (cart, checkout, login, wishlist, product page), because all those routes are imported at the top of `app.routes.ts`. A visitor to the home page downloads the checkout code, too.
- The **budget warning**. `angular.json` has a limit on the initial bundle (we set it to 500 kB in Chapter 1's defaults), and we are over it. The build is telling us to look.

## Step 2: Lazy-load every page except the home page

In Chapter 17 we lazy-loaded `orders` and `admin`. Now we do the same for the other pages. Change `app.routes.ts` so that only `Home` and `NotFound` (small and needed immediately) are imported at the top:

**`src/app/app.routes.ts`**

```ts
import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin-guard';
import { authGuard } from './guards/auth-guard';
import { unsavedChangesGuard } from './guards/unsaved-changes-guard';
import { Home } from './pages/home/home';
import { NotFound } from './pages/not-found/not-found';

// Only the home page is in the first download. Every other page is fetched
// the first time somebody visits it (loadComponent), or quietly in the background
// when it says data: { preload: true }.
export const routes: Routes = [
  { path: '', component: Home, title: 'Toy Shop' },
  {
    path: 'product/:id',
    title: 'Toy details',
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then((m) => m.ProductDetail),
  },
  {
    path: 'cart',
    title: 'Your cart',
    data: { preload: true },
    loadComponent: () => import('./pages/cart/cart').then((m) => m.Cart),
  },
  {
    path: 'wishlist',
    title: 'My wishlist',
    loadComponent: () => import('./pages/wishlist/wishlist').then((m) => m.Wishlist),
  },
  {
    path: 'login',
    title: 'Log in',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'checkout',
    title: 'Checkout',
    canActivate: [authGuard],
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () => import('./pages/checkout/checkout').then((m) => m.Checkout),
  },
  {
    path: 'orders',
    title: 'My orders',
    canActivate: [authGuard],
    data: { preload: true },
    loadComponent: () => import('./pages/orders/orders').then((m) => m.Orders),
  },
  {
    path: 'admin',
    canMatch: [adminGuard],
    loadChildren: () => import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  { path: '**', component: NotFound, title: 'Page not found' },
];
```

What changed, for each page: `component: Cart` became `loadComponent: () => import('./pages/cart/cart').then((m) => m.Cart)`, and the `import { Cart } ...` line at the top was removed. A page that people are likely to visit next (`cart`) has `data: { preload: true }`, so our preloader (Chapter 17) fetches it quietly in the background.

> **Why not make the home page lazy too?** It is what *every* visitor needs first. Lazy loading it would add a round trip to the first screen and make it slower.

## Step 3: Remove the outside fonts

When we added Material in Chapter 20, `ng add` put three `<link>` tags for **Google Fonts** into `index.html`. Each is a request to another website (DNS lookup, connection, download) before the text can be drawn the way we want. Our shop looks fine with the fonts that are already on every device (`system-ui`), so we remove the links and tell the Material theme to use them.

**`src/index.html`** (what changed)

```diff
@@ -6,16 +6,6 @@
     <base href="/" />
     <meta name="viewport" content="width=device-width, initial-scale=1" />
     <link rel="icon" type="image/x-icon" href="favicon.ico" />
-    <link rel="preconnect" href="https://fonts.googleapis.com" />
-    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
-    <link
-      href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap"
-      rel="stylesheet"
-    />
-    <link
-      href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined"
-      rel="stylesheet"
-    />
   </head>
   <body>
     <app-root></app-root>
```

**`src/material-theme.scss`** (what changed)

```diff
@@ -13,7 +13,11 @@ html {
         primary: mat.$orange-palette,
         tertiary: mat.$cyan-palette,
       ),
-      typography: Roboto,
+      // Use the fonts already on the person's device: nothing to download.
+      typography: (
+        plain-family: (system-ui, -apple-system, 'Segoe UI', sans-serif),
+        brand-family: (system-ui, -apple-system, 'Segoe UI', sans-serif),
+      ),
       density: 0,
     )
   );
```

**Fonts are a trade-off.** A brand font gives a unique look, but costs download time and can cause layout shifts. If you must use one, host it yourself (not from another domain), use `font-display: swap`, and load only the weights you need.

## Step 4: A budget is a decision

The warning said we should stay under 500 kB. We are at 628 kB. Material and the CDK are big (Chapter 20 added about 250 kB), and a tutorial shop that uses a dialog, drag and drop, a snackbar, badges, and virtual scrolling pays for them. There are three honest options:

1. Remove features or libraries you do not need.
2. Lower the cost (lazy-load the heavy parts, which we just did).
3. **Raise the budget on purpose**, writing down why.

We chose to keep the features and move the warning to 700 kB. The error limit stays at 1 MB.

**`angular.json`** (what changed)

```diff
@@ -32,7 +32,7 @@
               "budgets": [
                 {
                   "type": "initial",
-                  "maximumWarning": "500kB",
+                  "maximumWarning": "700kB",
                   "maximumError": "1MB"
                 },
                 {
```

Budgets are guard rails: they only help if somebody *reads* the warning. In CI (Chapter 35) a budget **error** fails the pipeline, which is how teams keep apps from growing a few kilobytes at a time.

## Step 5: Measure again

```bash
npm run build
```

```
Initial chunk files   | Names            |  Raw size | Estimated transfer size
chunk-D6LESeQb.js     | -                | 216.56 kB |                63.56 kB
chunk-D7i-xsNV.js     | -                | 193.33 kB |                47.25 kB
main-RSUO36MS.js      | main             | 146.44 kB |                31.44 kB
chunk-DQGuXFTf.js     | -                |  60.01 kB |                16.15 kB
styles-PP25RTXV.css   | styles           |  10.81 kB |                 1.92 kB
polyfills-CGB46XCN.js | polyfills        | 537 bytes |               537 bytes
                      | Initial total    | 627.69 kB |               160.85 kB

Lazy chunk files      | Names            |  Raw size | Estimated transfer size
chunk-Boh8Ev0-.js     | wishlist         |  59.82 kB |                14.78 kB
chunk-CXB-CH2L.js     | cart             |  34.48 kB |                 8.57 kB
chunk-D2u4X465.js     | checkout         |   8.34 kB |                 2.83 kB
chunk-DB55VU0S.js     | admin-routes     |   5.49 kB |                 2.00 kB
chunk-_KzbssQa.js     | login            |   3.29 kB |                 1.38 kB
chunk-Bh5jNJwe.js     | product-detail   |   2.45 kB |                 1.18 kB
chunk-CW15kH3H.js     | orders           |   2.34 kB |                 1.08 kB
chunk-BDSUfz2h.js     | recommended-toys | 802 bytes |               802 bytes
...
```

- `main` dropped from **446.63 kB to 146.44 kB**. The first page no longer carries the other pages.
- The initial total fell from 733 kB to 628 kB (compressed: 179 kB to 161 kB), and the warning is gone.
- The cart page (34 kB) holds the dialog code, the wishlist page (60 kB) holds the drag-and-drop code. Visitors who never open those pages never pay for them. (Look for the biggest lazy chunk: it tells you which page is "expensive".)

Now the stopwatch: **Lighthouse**.

### Lighthouse

Lighthouse is Google's free auditing tool. It is built into Chrome DevTools (the **Lighthouse** tab), and also runs from a terminal. It must test a **production build** (the development server is slower and different). Serve one:

```bash
npm run build
npx http-server dist/toy-shop/browser -p 8080
```

(`http-server` is a tiny static file server. Our shop is a single-page app, so we only test the home address.) Then either open <http://localhost:8080/> in Chrome, open **DevTools**, **Lighthouse**, choose **Mobile** and **Performance**, **Analyze page load**, or from the terminal:

```bash
npx lighthouse http://localhost:8080/ --only-categories=performance,accessibility,best-practices \
  --form-factor=mobile --output=json --output-path=report.json
```

These were the real results (Lighthouse 13.5 with simulated mobile throttling in the tutorial's test environment; your numbers will differ with your computer, but the direction should match):

| Metric | Before | After |
|--------|--------|-------|
| Performance score | 92 | 93 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| First Contentful Paint | 2.2 s | 2.0 s |
| **Largest Contentful Paint** | 2.9 s | **2.6 s** |
| Total Blocking Time | 130 ms | 150 ms |
| Cumulative Layout Shift | 0.024 | 0.024 |
| Total download size | 242 KiB | **207 KiB** |
| "Reduce unused JavaScript" savings | 82 KiB | **48 KiB** |

**Be honest about the numbers.**

- The download size fell by 35 KiB. The compressed JavaScript fell by about 18 KiB (see the build report), so we think the rest came from the removed font requests. But we changed both things at once and did not measure them separately, so treat that split as a guess.
- The score barely moved (92 to 93), because it was already good. Real gains show in LCP and bytes.
- Total Blocking Time went *up* slightly (130 to 150 ms). A single Lighthouse run is **noisy**. Run it three to five times and use the median, or you will chase ghosts.
- Lighthouse still says there is unused JavaScript (48 KiB). That is mostly Angular and Material code that the first page touches only in part. Chapter 28 (server rendering) attacks the next big cost: showing something before any JavaScript runs.

## Step 6: Runtime performance, a short checklist

You already did most of these without calling them performance:

| Rule | Where we did it |
|------|-----------------|
| Use **signals** and **OnPush**, so Angular only checks what changed | Chapters 10 and 16 |
| Always write `track` in `@for` | Chapter 5 |
| Never call heavy methods in a template; use `computed` or a pure pipe | Chapters 7 and 10 |
| Draw only what you can see (virtual scroll) | Chapter 20 |
| Debounce work caused by typing | Chapter 12 |
| `@defer` for below-the-fold parts | Chapter 5 |
| Cancel old requests (`switchMap`) | Chapter 12 |
| Share one request (`shareReplay`) | Chapter 13 |
| Clean up timers and subscriptions | Chapters 8 and 12 |

## Bonus lab: images done right

Our toys are emoji, so the shop has no real pictures. In a real shop, images are usually the biggest cost. Angular's `NgOptimizedImage` directive is a ready-made set of best practices: you write `ngSrc` instead of `src`, and it adds lazy loading, priority hints, and warnings when you forget the image's size. [`extras/ch27/image-lab.spec.ts`](extras/ch27/image-lab.spec.ts) shows it in a test. Copy it to `src/app/extras/` and run it.

**`src/app/extras/image-lab.spec.ts`**

```ts
import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

// NgOptimizedImage is a directive for <img>: you write ngSrc instead of src, and Angular
// adds the performance best practices for you.
@Component({
  imports: [NgOptimizedImage],
  template: `
    <img id="hero" ngSrc="toy-hero.png" width="400" height="300" priority alt="A big toy" />
    <img id="below" ngSrc="toy-small.png" width="100" height="100" alt="A small toy" />
  `,
})
class Host {}

describe('NgOptimizedImage lab', () => {
  it('gives the main picture high priority and lazy-loads the others', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const hero: HTMLImageElement = fixture.nativeElement.querySelector('#hero');
    const below: HTMLImageElement = fixture.nativeElement.querySelector('#below');

    expect(hero.getAttribute('fetchpriority')).toBe('high'); // load it first: it is what people see first
    expect(hero.getAttribute('loading')).toBe('eager');
    expect(below.getAttribute('loading')).toBe('lazy'); // wait until it scrolls into view
    expect(below.getAttribute('src')).toBe('toy-small.png');
    // width and height are required: the browser can reserve the space, so the page does not jump
    expect(hero.getAttribute('width')).toBe('400');
  });
});
```

- The `priority` image (the main picture people see first) gets `fetchpriority="high"` and `loading="eager"`.
- All others get `loading="lazy"`: they load only when they scroll near.
- `width` and `height` are **required**, so the browser can reserve the space and the page does not jump (that is the **CLS** vital).
- With an image CDN you can also give `ngSrc` a loader, and Angular builds `srcset` variants for different screen sizes.

## Check it works

```bash
npx ng test --watch=false
```

```
 Test Files  35 passed (35)
      Tests  90 passed (90)
```

- [ ] `npm run build` has **no** budget warning, and `main` is about 146 kB.
- [ ] In the browser's **Network** tab (production build, throttled to **Slow 3G**), open the home page. You see **no** request to `fonts.googleapis.com`.
- [ ] Click **Cart**: it opens fast, because it was preloaded. Click **Wishlist** (not preloaded) and watch a new chunk arrive in the Network tab.
- [ ] A Lighthouse run gives a performance score of 90 or more.

## What you learned

- Measure before you optimize: the build report, Lighthouse, and DevTools are your stopwatches.
- Lazy loading every page except the first can cut the main bundle to a third.
- Outside fonts and scripts cost requests; system fonts are free.
- A budget is a decision; write down why you move it.
- One measurement is noise. Repeat, and use the median.
- Images are often the biggest cost; `NgOptimizedImage` helps.

## Try it yourself

1. Remove `data: { preload: true }` from the cart route. Compare the time it takes to open the cart on **Slow 3G**.
2. Lower the warning budget to `600kB` and run `npm run build`. Read the warning. What would you do about it?
3. Run Lighthouse five times and write down the LCP each time. What is the spread?
4. Find the biggest lazy chunk in your build report. Which page is it? What library is inside?

## If something goes wrong

**Lighthouse says 50 or lower and shows huge numbers:** you probably tested `ng serve` (the development server). Test the production build.

**The score changes a lot between runs:** your computer is busy, or an extension is active. Close other programs, use an incognito window, and run several times.

**A lazy page never loads, or shows an error after a deployment:** the browser asked for a chunk file name that no longer exists (a new version was published). The navigation error handler (Chapter 23) tells the person to try again; a service worker (Chapter 29) updates the whole set of files together.

**You made the page lazy but the bundle did not shrink:** another file still imports the component with a normal `import { Cart } from ...`. One static import pulls the code back into `main`. Search for it.

Next: [Chapter 28: Server-side rendering](28-server-side-rendering.md)
