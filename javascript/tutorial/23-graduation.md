# Step 23: Graduation - Look What You Built

> **Like I'm 5:** This is a picture dictionary of JavaScript words, and you have now *used* every single word. Find a word, see which toy of yours it lives in, and follow the link back to the lesson.

| | |
|---|---|
| **Concept lesson** | [23. A to Z glossary](../concepts/23-a-to-z-glossary.md) |
| **Time** | About 20 minutes |
| **You will do** | Take a tour of everything you built, check that it all still works, and choose what to learn next |
| **Before** | [Step 22: Tooling & testing](22-tooling-and-testing.md) |

---

## 1. You did it

You started with this:

```js
console.log('Welcome to the Lemonade Stand! 🍋');
```

and you finished with a real web application that:

- shows a **menu** and a **cart** in the browser, built with the **DOM** and **events**;
- keeps its data in a frozen, **immutable store**, with **pure** functions deciding every change;
- talks to a **server** with `fetch`, has timeouts, and survives a server that is down;
- **remembers** your cart and theme, and reads the address bar safely;
- runs heavy work in a **Web Worker** and loads sections when you scroll to them;
- formats money, dates and times properly with **`Intl`**;
- defends itself against **XSS**, **prototype pollution**, and bad links, with a **Content Security Policy**;
- has a linter, a formatter, a bundler, and **69 automatic tests**.

That is not a toy. It is the same set of ideas you will meet in every real JavaScript project.

---

## 2. Your project, file by file

Every file, and the step where it was born:

```text
lemonade-stand/
├── index.html              Step 16 (grew in 17, 20, 21)    the page
├── styles.css              Step 16 (grew in 17, 18, 20, 21) the paint
├── cli.js                  Step 2  (rewritten as it grew)  the stand on the command line
├── report-cli.js           Step 13                         the end-of-day report
├── package.json            Step 9  (grew up in 22)         the control panel
├── package-lock.json       Step 22                         the exact-versions receipt
├── eslint.config.js        Step 22                         the hall monitor's rulebook
├── vite.config.js          Step 22                         the packing robot's settings
├── .prettierrc.json        Step 22                         the handwriting coach's rules
├── .prettierignore         Step 22
├── .gitignore              Step 22
│
├── tools/
│   ├── serve.js            Step 16 (grew in 17)            a tiny web server + orders API
│   └── headers.js          Step 17 (grew in 21)            security headers (CSP...)
│
├── src/                    ← the heart of the stand
│   ├── index.js            Step 9   the front desk (barrel file)
│   ├── stand.js            Step 9   the stand's details
│   ├── money.js            Step 9   paise, rupees, line totals
│   ├── menu.js             Step 9   the frozen menu, stock, search (18, 20)
│   ├── discounts.js        Step 9   discount rules (a factory, Step 5)
│   ├── cashbox.js          Step 9   a closure with a private balance (Step 5)
│   ├── order-numbers.js    Step 9   a generator (Step 14)
│   ├── cart.js             Step 9   pure cart functions (Step 18)
│   ├── order.js            Step 10  Order and TakeAwayOrder classes
│   ├── pickup-timer.js     Step 11  a class that remembers its `this`
│   ├── kitchen.js          Step 12  promises and an async generator (14)
│   ├── report.js           Step 13  the sales report, in chunks
│   ├── report-worker.js    Step 17  the same report in a Web Worker
│   ├── errors.js           Step 15  your own error classes
│   ├── settings.js         Step 15  settings, parsed safely (21)
│   ├── freeze.js           Step 18  deepFreeze
│   ├── store.js            Step 18  the tiny store
│   ├── format.js           Step 19  Intl money, times, "2 minutes ago"
│   ├── receipt.js          Step 19  a plain-text receipt (loaded on demand: --receipt)
│   ├── perf.js             Step 20  debounce and throttle
│   ├── security.js         Step 21  escapeHtml, safeUrl, safeMerge
│   ├── banner.js           Step 9   a banner (loaded on demand: node cli.js --banner)
│   │   ── the "shell" that touches the outside world ──
│   ├── api.js              Step 17  fetch, with timeouts and friendly errors
│   ├── storage.js          Step 17  localStorage / sessionStorage, guarded
│   ├── ui.js               Step 16  draws the page (18, 19)
│   ├── board.js            Step 18  the kitchen board (20)
│   ├── sections.js         Step 18  lazy loading + the worker
│   └── main.js             Step 16  wires it all together (grew in 17, 18, 20, 21)
│
└── tests/                  Step 22  nine files, 69 tests
```

Look at the shape: the files at the top of `src/` are **pure** (no screen, no network), and the files at the bottom are the **shell**. That split, which you made in Step 18, is what made the tests in Step 22 so easy.

The finished, tested version of this whole project is in [`finished-project/`](finished-project/) in this repository. Compare it with yours if anything looks different.

---

## 3. Every concept, and where it lives

| Step | Concept | Where you used it in the stand |
|------|---------|--------------------------------|
| 1 | [How JavaScript runs](../concepts/01-how-javascript-runs.md) | Node and the browser both run your files; `defer`/`type="module"` in `index.html` |
| 2 | [Variables & scope](../concepts/02-variables-and-scope.md) | `const`/`let` everywhere; never `var` |
| 3 | [Data types & coercion](../concepts/03-data-types-and-coercion.md) | `parseQuantity` converts typed text; money in whole paise |
| 4 | [Functions](../concepts/04-functions.md) | Pure helpers in `src/money.js`, options objects, default parameters |
| 5 | [Closures](../concepts/05-closures.md) | `src/cashbox.js`, `src/store.js`, `src/perf.js`, `src/discounts.js` |
| 6 | [Objects & prototypes](../concepts/06-objects-and-prototypes.md) | The menu items, `stand`, `?.`, `Object.freeze` |
| 7 | [Arrays & iteration](../concepts/07-arrays-and-iteration.md) | `map`/`filter`/`reduce`/`find` in `src/cart.js` and `src/ui.js` |
| 8 | [Destructuring, spread & rest](../concepts/08-destructuring-spread-and-rest.md) | `{ ...state }`, `[...cart, line]`, `(...args)` in `src/perf.js` |
| 9 | [Modules](../concepts/09-modules.md) | All of `src/`, the `index.js` barrel, dynamic `import()` in `cli.js` |
| 10 | [Classes](../concepts/10-classes.md) | `Order`, `TakeAwayOrder` with `#private` fields and `static` members |
| 11 | [`this` & binding](../concepts/11-this-and-binding.md) | `PickupTimer`'s arrow function inside `setInterval` |
| 12 | [Promises & async/await](../concepts/12-promises-and-async-await.md) | `src/kitchen.js`, `src/api.js`, `src/sections.js` |
| 13 | [Event loop & timers](../concepts/13-event-loop-and-timers.md) | `buildReportInChunks`, `requestAnimationFrame` in `src/main.js` |
| 14 | [Iterators & generators](../concepts/14-iterators-and-generators.md) | `orderNumbers`, `Order`'s iterator, `kitchenUpdates` |
| 15 | [Error handling](../concepts/15-error-handling.md) | `src/errors.js`, `try/catch/finally`, `cause` |
| 16 | [DOM & events](../concepts/16-dom-and-events.md) | `src/ui.js`, `src/main.js`: delegation, `preventDefault`, `{ signal }` |
| 17 | [Fetch & web APIs](../concepts/17-fetch-and-web-apis.md) | `src/api.js`, `src/storage.js`, observers, the Web Worker |
| 18 | [Immutability & pure functions](../concepts/18-immutability-and-pure-functions.md) | `src/cart.js`, `src/store.js`, `src/freeze.js` |
| 19 | [Strings, numbers & dates](../concepts/19-strings-numbers-and-dates.md) | `src/format.js`, `src/receipt.js`, `Order.toJSON` |
| 20 | [Performance & memory](../concepts/20-performance-and-memory.md) | `src/perf.js`, the `WeakMap` in `src/board.js`, one cleanup path |
| 21 | [Security](../concepts/21-security.md) | `src/security.js`, `textContent`, `tools/headers.js` (CSP) |
| 22 | [Tooling & testing](../concepts/22-tooling-and-testing.md) | `package.json`, ESLint, Prettier, Vite, `tests/` |
| 23 | [A to Z glossary](../concepts/23-a-to-z-glossary.md) | This page |

---

## 4. The A to Z tour: where did *you* use each word?

The [glossary](../concepts/23-a-to-z-glossary.md) lists 46 words. Here is where each one lives in **your** stand.

| | Word | Where it lives in your stand | Lesson |
|--|------|------------------------------|--------|
| **A** | `async` / `await` | `prepareLine` in `src/kitchen.js`; `fetchJson` in `src/api.js` | [Step 12](12-promises-and-async-await.md) |
| **A** | AbortController | `cleanup` in `src/main.js`; `AbortSignal.timeout` in `src/api.js` | [Steps 16](16-dom-and-events.md), [17](17-fetch-and-web-apis.md) |
| **A** | Arrow function | `src/pickup-timer.js` (keeps `this`); callbacks everywhere | [Steps 4](04-functions.md), [11](11-this-and-binding.md) |
| **B** | Bubbling | `onMenuClick` in `src/main.js` hears clicks that bubble up from buttons | [Step 16](16-dom-and-events.md) |
| **B** | Bundler | Vite: `npm run build` | [Step 22](22-tooling-and-testing.md) |
| **C** | Call stack | The blocking vs chunked report in `src/report.js` | [Steps 1](01-how-javascript-runs.md), [13](13-event-loop-and-timers.md) |
| **C** | Class | `Order` and `TakeAwayOrder` in `src/order.js` | [Step 10](10-classes.md) |
| **C** | Closure | `createCashbox`, `createStore`, `debounce` | [Step 5](05-closures.md) |
| **C** | Coercion | `parseQuantity` in `src/cart.js` turns typed text into a number on purpose | [Step 3](03-data-types-and-coercion.md) |
| **D** | Debounce | The search box, via `src/perf.js` | [Step 20](20-performance-and-memory.md) |
| **D** | Destructuring | `{ itemId, quantity }` in `src/cart.js` and `src/report.js` | [Step 8](08-destructuring-spread-and-rest.md) |
| **D** | DOM | `src/ui.js` builds elements; `src/main.js` finds them | [Step 16](16-dom-and-events.md) |
| **E** | Event delegation | One listener on `#menu` handles every Add button | [Step 16](16-dom-and-events.md) |
| **E** | Event loop | Kitchen timers and the chunked report; promises before timers | [Step 13](13-event-loop-and-timers.md) |
| **F** | `fetch` | `fetchJson`, `getOrders`, `sendOrder` in `src/api.js` | [Step 17](17-fetch-and-web-apis.md) |
| **G** | Garbage collection | The `WeakMap` in `src/board.js` never keeps an old order alive | [Step 20](20-performance-and-memory.md) |
| **G** | Generator | `orderNumbers` in `src/order-numbers.js`; `kitchenUpdates` in `src/kitchen.js` | [Step 14](14-iterators-and-generators.md) |
| **H** | Hoisting | Function declarations such as `function render(state)` in `src/main.js` | [Step 2](02-variables-and-scope.md) |
| **I** | Immutability | `addToCart` returns a new cart; the store's state is frozen | [Step 18](18-immutability-and-pure-functions.md) |
| **I** | Iterator | `*[Symbol.iterator]()` in `src/order.js` | [Step 14](14-iterators-and-generators.md) |
| **I** | `Intl` | `formatMoney`, `formatTime`, `timeAgo` in `src/format.js` | [Step 19](19-strings-numbers-and-dates.md) |
| **J** | JSON | `JSON.parse`/`stringify` in `src/api.js` and `src/storage.js`; `Order.toJSON` | [Step 17](17-fetch-and-web-apis.md) |
| **L** | Lexical scope | Every inner function in the store and debounce sees its outer boxes | [Step 2](02-variables-and-scope.md) |
| **M** | Microtask | Every `await` continuation in `src/kitchen.js` | [Step 13](13-event-loop-and-timers.md) |
| **M** | Module | Every file in `src/`; the barrel in `src/index.js` | [Step 9](09-modules.md) |
| **N** | `null` vs `undefined` | `findItem('pizza')` gives `undefined`; `parseSettings(null)` means "nothing saved" | [Step 3](03-data-types-and-coercion.md) |
| **N** | Nullish coalescing (`??`) | `?? 0` in `src/cart.js`; `?? '[]'` in `src/storage.js` | [Step 3](03-data-types-and-coercion.md) |
| **O** | Optional chaining (`?.`) | `cart.find(...)?.quantity ?? 0` in `src/cart.js` | [Step 6](06-objects-and-prototypes.md) |
| **P** | Prototype | `TakeAwayOrder extends Order`; `safeMerge` protects `Object.prototype` | [Steps 6](06-objects-and-prototypes.md), [21](21-security.md) |
| **P** | Promise | `wait` in `src/kitchen.js`; `runReportInWorker` in `src/sections.js` | [Step 12](12-promises-and-async-await.md) |
| **P** | Pure function | `addToCart`, `formatMoney`, `timeAgo`, `filterMenu` | [Steps 4](04-functions.md), [18](18-immutability-and-pure-functions.md) |
| **Q** | `querySelector` | The first lines of `src/main.js` | [Step 16](16-dom-and-events.md) |
| **R** | Rest parameter | `(...args)` in `debounce` and `throttle` in `src/perf.js` | [Step 8](08-destructuring-spread-and-rest.md) |
| **S** | Spread | `[...cart, line]` in `src/cart.js`; `{ ...state, cart }` in `src/main.js` | [Step 8](08-destructuring-spread-and-rest.md) |
| **S** | `Symbol` | `Symbol.iterator` | [Steps 3](03-data-types-and-coercion.md), [14](14-iterators-and-generators.md) |
| **S** | Strict mode | Every module is strict, so assigning to the frozen menu throws | [Step 11](11-this-and-binding.md) |
| **T** | Temporal dead zone | The `const` declarations at the top of each module | [Step 2](02-variables-and-scope.md) |
| **T** | Throttle | `throttle` in `src/perf.js` | [Step 20](20-performance-and-memory.md) |
| **T** | `this` | `PickupTimer` in `src/pickup-timer.js` | [Step 11](11-this-and-binding.md) |
| **T** | Truthy / falsy | `if (!item)` in `src/cart.js` | [Step 3](03-data-types-and-coercion.md) |
| **V** | `var` | Never used, and ESLint's `no-var` rule keeps it that way | [Steps 2](02-variables-and-scope.md), [22](22-tooling-and-testing.md) |
| **W** | Web Worker | `src/report-worker.js`, started by `src/sections.js` | [Step 17](17-fetch-and-web-apis.md) |
| **W** | WeakMap | `startedAt` in `src/board.js` | [Step 20](20-performance-and-memory.md) |
| **X** | XSS | Prevented by `textContent` in `src/ui.js`; blocked again by the CSP | [Step 21](21-security.md) |
| **Y** | `yield` | `orderNumbers` and `kitchenUpdates` | [Step 14](14-iterators-and-generators.md) |
| **Z** | Zero-based index | `menu[i % menu.length]` in `src/report.js`; October is month `9` in `Date.UTC(2026, 9, 10, 9, 30)` in `cli.js` | [Steps 7](07-arrays-and-iteration.md), [19](19-strings-numbers-and-dates.md) |

---

## 5. One last health check

Run the whole team once more:

▶️ **Run (skip):** `npm run check`

👀 **You should see something like (the end of the output):**

```text
 Test Files  9 passed (9)
      Tests  69 passed (69)
...
✓ built in 228ms
```

Then start the stand, one last time:

▶️ **Run (skip):** `npm run api`

▶️ **Run (skip):** `npm run dev`

Open **http://localhost:5173**, add a lemonade, place an order, and watch the kitchen board count down to **"ready! 🎉"**.

---

## 6. What to learn next

### Make the stand better (challenges)

Each one uses things you already know. Pick one.

1. **Stock on the server.** Add `GET /api/stock` and `POST /api/stock` to `tools/serve.js`, so the numbers survive a reload (Steps 17, 18).
2. **A discount picker.** Add a menu of discounts (kids, happy hour) to the order form, and stack them with `...discountNames` (Steps 8, 10).
3. **Order history.** Keep each order's receipt, and add a "Show receipt" button that loads `src/receipt.js` on demand (Steps 9, 19).
4. **Keyboard and screen reader polish.** Move focus to the message after an order, and test with a screen reader (Step 16).
5. **A real e2e test.** Install Playwright and write a test that adds a cookie, places an order, and waits for "ready" (Step 22).
6. **Offline mode.** Cache the files with a Service Worker so the stand opens without a network.

### Keep climbing the ladder

| If you want to... | Go to |
|-------------------|-------|
| Check yourself with interview-style questions | [JavaScript interview Q&A](../interviewQnA/README.md) |
| Look up any topic quickly | [JavaScript concepts reference](../concepts/README.md) |
| Add **types** to your project (the stand is a perfect candidate) | [TypeScript](../../typescript/README.md) |
| Build the same stand with a UI library | [React](../../react/README.md) |
| Build it with a full framework | [Angular](../../angular/README.md) |

Every one of those builds on exactly what you just learned: modules, closures, immutability, async, events, and tests.

---

## ✅ Final checkpoint

- [ ] `npm run check` passes: lint, format, 69 tests, and a build
- [ ] The stand works at http://localhost:5173 (and I can explain what the API server and Vite each do)
- [ ] I can explain, in my own words, each of the 22 concepts, and point to a file in my stand that uses it
- [ ] I picked one challenge to try next

> **Like I'm 5:** You started the day not knowing what a cook with one pair of hands was. Now you can build a whole lemonade stand, check it with tests, protect it from strangers, and put it on the internet. Go and make something new. 🍋🎉
