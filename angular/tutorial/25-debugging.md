# Chapter 25: Debugging and DevTools

> **Like I'm 5:** When a toy does not work, a good repair person does not shake it and hope. She asks: what did it do? What should it do? She opens it, looks at one part at a time, and checks each part until she finds the broken one. Debugging is being a calm detective with good tools.

Concept reference: [28. Debugging and DevTools](../concepts/28-debugging-and-devtools.md)

[Back: Chapter 24](24-testing.md) · Next: [Chapter 26: Security](26-security.md)

## What we build today

Nothing new in the shop. Today we **break** it on purpose, six ways, and learn to read what Angular tells us. Every message in this chapter is a real one, copied from a real run while writing this tutorial. We also open the toolbox: browser DevTools, the `ng` helper in the console, breakpoints, and the VS Code debugger.

## The big idea

Bugs show up in three places. Look in the right place first:

| Where | What you see | What to read |
|-------|--------------|--------------|
| **The terminal** (`ng serve`, `ng build`) | `✘ [ERROR] ...` | compile-time errors: typos, wrong types, missing imports |
| **The browser console** (`F12`, **Console**) | red lines | run-time errors: `TypeError`, `NG0xxx` |
| **Test output** | `FAIL`, `AssertionError` | what the test expected and what it got |

Read an Angular error from top to bottom:

```
ɵNotFound: NG0201: No provider found for `SecretService`. Source: Standalone[_App]. Find more at https://v22.angular.dev/errors/NG0201
```

- `NG0201` is the **error code**. Every Angular error has one. Open `https://angular.dev/errors/NG0201` (the link at the end) for a full explanation with examples.
- The sentence says **what** is wrong. The `Source:` part says **where** (who was asking).
- For compile errors, the next lines show the file, the line and column, and a little `~~~~` under the exact place.

A method that works every time:

1. **Reproduce it.** Can you make it happen again? What are the exact steps?
2. **Read the message.** The whole thing, slowly.
3. **Find the smallest example.** Remove things until the bug is still there but little else is.
4. **Guess, then check.** Change one thing at a time, and look at one thing at a time (`console.log`, a breakpoint).
5. **Fix, then add a test** so it never comes back.

**Grown-up words:**

- **Source map**: a file that maps the compiled JavaScript back to your TypeScript, so DevTools shows *your* code. (Development builds have them.)
- **Breakpoint**: a place where the browser pauses your code so you can look around.
- **Stack trace**: the list of function calls that led to an error, newest first.
- **Development mode**: Angular's checks and helpers are on (`ng serve`). Production builds remove them.

## Step 1: The bug hunt

Let's meet six real bugs. Each one was made on purpose in a copy of the shop. You can do the same: make the change, look at the message, then undo it.

### Bug 1: A typo in a template

You write `{{ nme }}` instead of `{{ name }}` in the product card.

```
✘ [ERROR] TS2551: Property 'nme' does not exist on type 'ProductCard'. Did you mean 'name'? [plugin angular-compiler]

    src/app/components/product-card/product-card.html:5:9:
      5 │   <h3>{{ nme }}</h3>
```

Angular checks templates like TypeScript checks code. Read the "Did you mean": it is usually right.

### Bug 2: The wrong type

On the home page you write `[product]="p.name"` (a string) where a `Product` belongs.

```
✘ [ERROR] TS2322: Type 'string' is not assignable to type 'Product'. [plugin angular-compiler]

    src/app/pages/home/home.html:81:7:
      81 │       [product]="p.name"
         ╵        ~~~~~~~
```

The three little `~` point at the part that is wrong. TypeScript just saved you from a run-time crash.

### Bug 3: Forgot an import

You use `<app-site-header />` without adding `SiteHeader` to `imports` (Chapter 2).

```
✘ [ERROR] NG8001: 'app-site-header' is not a known element:
1. If 'app-site-header' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
```

### Bug 4: Nobody provides the service

You `inject(SecretService)`, but the class has no `@Service()` (Chapter 9).

```
ɵNotFound: NG0201: No provider found for `SecretService`. Source: Standalone[_App]. Find more at https://v22.angular.dev/errors/NG0201
```

### Bug 5: A value that is not there yet (a run-time bug)

Put `<p>Looking at: {{ product()!.name }}</p>` at the top of the toy page. The `!` says to TypeScript "trust me, it is not empty", so the build passes. But `product()` is `undefined` while the toy is still loading (Chapter 12). Open `/product/3` and look at the console:

```
[uncaught] TypeError: Cannot read properties of undefined (reading 'name')
    at ProductDetail_Template (http://localhost:4200/main.js:2888:70)
    at executeTemplate (.../core-BlyeT3IW.js:4369:3)
    at refreshView (.../core-BlyeT3IW.js:4926:28)
```

Notes:

- `[uncaught]` is the prefix our own global handler (Chapter 23) puts on every uncaught error. It *wrote it down*, too.
- `Cannot read properties of undefined (reading 'name')` is the most common JavaScript error in the world. Translation: "you asked an empty thing for its `name`".
- `ProductDetail_Template` tells you which component's **template** crashed. Click the link (`main.js:2888`) and, thanks to source maps, DevTools opens `product-detail.html` at the line.
- The fix is the guard we already have: `@if (product(); as p) { ... }`. Never silence the compiler with `!` unless you are *sure*.

### Bug 6: The screen does not change

You change a plain field in a timer and nothing happens on screen. That is Chapter 16's lab. The question to ask: *is it in a signal?*

## Step 2: The browser's toolbox

Open DevTools with `F12` (or `Ctrl+Shift+I`, and `Cmd+Option+I` on a Mac). The tabs you will use most:

| Tab | Use it to... |
|-----|--------------|
| **Elements** | see the real HTML and CSS; edit them live; see `_ngcontent-...` attributes (Chapter 2) |
| **Console** | read errors; type JavaScript; try `ng.getComponent($0)` |
| **Sources** | find your `.ts` files (source maps!), set breakpoints, step through code |
| **Network** | see every request, its status, timing, and answer; throttle to "Slow 3G" |
| **Application** | look at Local/Session Storage, cookies, and the service worker (Chapter 29) |
| **Performance** | record what the page does and find slow parts |
| **Memory** | find leaks with heap snapshots |
| **Lighthouse** | audit speed, accessibility, and best practices (Chapter 27) |

### Breakpoints: freeze time

1. In **Sources**, press `Ctrl+P` (`Cmd+P`) and type `cart-service` to open the file.
2. Click a line number inside `add(...)` to set a **breakpoint**.
3. Add a toy to the cart. The page freezes at that line. On the right you see the **Scope** (every variable and its value) and the **Call Stack**.
4. Use the buttons: **Resume** (go on), **Step over** (next line), **Step into** (go inside a function), **Step out**.

Two tricks:

- **Conditional breakpoint:** right-click the line number, **Add conditional breakpoint**, type `product.id === 3`. It only pauses for the Toy Train.
- **Logpoint:** right-click, **Add logpoint**, type `'adding', product.name`. It prints to the console **without** changing your code. No more forgotten `console.log`!

You can also write `debugger;` in your code. When DevTools is open, the page pauses there. (Do not commit it.)

### The `ng` helper: talk to your components

In a development build, Angular puts a helper called `ng` on `window`. In **Elements**, click a `<app-product-card>` element so it is selected, then in the **Console**, `$0` means "the selected element":

```js
const card = ng.getComponent($0);   // the component's object
card.product().name                 // "Racing Car"
card.quantity.set(3)                // change its signal...
ng.applyChanges($0)                 // ...and tell Angular to redraw
```

We ran exactly this in a real browser: `ng.getComponent` returned the card (`_ProductCard`), `product().name` gave `Racing Car`, and after `quantity.set(3)` and `ng.applyChanges`, the stepper showed **3**. The full list of helpers in Angular 22 includes:

```
getComponent, getOwningComponent, getRootComponents, getDirectives, getHostElement,
getContext, getInjector, getListeners, getDirectiveMetadata, applyChanges,
isSignal, toggleWatchSignal, enableProfiling
```

`ng.getOwningComponent($0)` returned `Home` (the page that contains the card), and `ng.getDirectives(price)` found our `Highlight` sticker. (`ng` exists only in development builds.)

### Angular DevTools

**Angular DevTools** is a free extension for Chrome and Edge (search "Angular DevTools" in the web store). It adds an **Angular** tab to DevTools with:

- a **component tree** with each component's inputs, signals, and state, which you can edit,
- an **injector tree** (which provider an `inject()` would find),
- a **profiler** that records change detection and shows which components were checked and for how long,
- a route tree.

(We describe this tool from its documentation. It is a browser extension, so it could not be run in the environment where this tutorial was tested.)

## Step 3: Logging that helps

- `console.log(value)` is fine for quick looks. Log **objects**, not strings glued together: `console.log('product', product)` lets you expand the object.
- `console.table(array)` prints an array of objects as a table. Try `console.table(cart.items())`.
- `console.group('checkout')` ... `console.groupEnd()` indents related lines.
- `console.time('search')` ... `console.timeEnd('search')` measures how long something takes.
- `console.trace()` prints *who called me*.
- `console.error` and `console.warn` stand out in red and yellow, and you can filter by level.

For signals: a `computed` or `effect` that logs when something changes is a cheap way to watch it:

```ts
effect(() => console.log('cart is now', this._items()));
```

Remember to remove such debugging effects before you commit. (Chapter 34 adds a tidier `debug()` helper.)

## Step 4: Debugging in VS Code

`ng new` wrote a `.vscode/launch.json` that lets you debug in the editor:

**`.vscode/launch.json`**

```json
{
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "name": "ng serve",
      "type": "chrome",
      "request": "launch",
      "preLaunchTask": "npm: start",
      "url": "http://localhost:4200/"
    },
    {
      "name": "ng test",
      "type": "chrome",
      "request": "launch",
      "preLaunchTask": "npm: test",
      "url": "http://localhost:9876/debug.html"
    }
  ]
}
```

- The **`ng serve`** entry starts the dev server (`preLaunchTask`), opens Chrome, and lets you set breakpoints **in VS Code** instead of in the browser. Press `F5`, choose it, and click in the gutter next to a line.
- The second entry, **`ng test`**, was written for the older Karma test runner. Angular 22 uses Vitest, so it does not apply. To debug unit tests, run `npx ng test --debug` (it waits for a Node.js inspector, which VS Code's *JavaScript Debug Terminal* can attach to), or run the Vitest UI with `npx ng test --ui`.

Tip: in a test, write `it.only('...', ...)` to run just one test while you investigate (and remove the `.only` afterwards).

## Step 5: Memory leaks and production bugs

- **Leaks.** A leak happens when something that should be thrown away is still held: a timer nobody cleared (Chapter 8), a subscription nobody ended (Chapter 12), an event listener never removed. In **Memory**, take a **heap snapshot**, use the app (open and close a page ten times), take another, and compare: if the count of a component grows, it is leaking.
- **Production.** Production builds are minified, so names look like `a.b(c)`. To read errors from real users, upload **source maps** to your monitoring service (Sentry, Datadog) and keep them off the public web. (Chapter 33 builds source maps.)
- **Reproduce with data.** In a bug report, ask for: the steps, the browser and version, the URL, a screenshot, and what the console said.

## Check it works

You have no new code. Check your skills instead:

- [ ] Break the product card template with `{{ nme }}`. Read the terminal error out loud. Fix it.
- [ ] Open `cart-service.ts` in Sources, set a **conditional breakpoint** on `product.id === 3` in `add`, and add the Toy Train. Look at the Scope panel.
- [ ] Select a card in Elements and run `ng.getComponent($0).product().name` in the console.
- [ ] Open the Network tab and find the request for `products.json`. What is its status? How big is it?
- [ ] Run `npx ng test --watch=false`: still 34 test files and 86 tests passing (nothing changed).

## What you learned

- Bugs show up in the terminal (compile), the console (run time), or the tests; read the message completely, including the error code.
- `NG0xxx` and `NG8xxx` codes have pages at `angular.dev/errors`.
- Breakpoints, conditional breakpoints, and logpoints beat sprinkling `console.log`.
- The `ng` helper in development builds lets you inspect and change components from the console.
- Reproduce, isolate, hypothesize, check, fix, and add a test.

## Try it yourself

1. Cause each of the six bugs in a copy of the shop and compare your messages with the ones here.
2. Add a toy to the cart, open the cart page, select the `<h1>` in **Elements**, and run `ng.getOwningComponent($0).cart.items()` in the Console. (We ran this: the owning component was `Cart`, and `items()` held the Racing Car.) Why can you reach the service through the component?
3. Add `console.table(this.cart.items())` to `Cart` and look at the table in the Console.
4. Use the Performance tab to record clicking through the shelf pages. Find the longest task. What is it?

## If something goes wrong

**The breakpoint never hits:** the code never runs (a different branch, or the page uses a different component), or you are looking at the compiled `main.js` and not the `.ts` file. Check **Sources**, then `localhost:4200`, `src/app/...`.

**DevTools shows minified code (`a.b(c)`):** you are looking at a production build. Use `ng serve` while debugging.

**`ng` is not defined:** you are on a production build (`ng` exists only in development builds), or the page has not finished loading.

**You fix the bug but the old behaviour stays:** the dev server did not rebuild (look at the terminal for errors) or the browser cached the old file (hard reload with `Ctrl+Shift+R`).

**It works on your computer but not on the server:** compare the build mode (`production` is stricter), the data, and the environment settings (Chapter 34).

Next: [Chapter 26: Security](26-security.md)
