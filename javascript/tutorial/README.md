# JavaScript Tutorial: Build a Lemonade Stand 🍋 (Like I'm 5)

Learn JavaScript by **building one real project, step by step**. Each step explains one idea in the simplest way we can, lets you play with it, and then adds a new piece to a Lemonade Stand that starts as one line of code and ends as a tested, bundled web application.

> **Like I'm 5:** You will not read about JavaScript. You will build a lemonade stand with it, one small piece at a time. Every piece teaches you one new magic word.

## What you will build

```text
┌──────────────────────────────────────────────────────────┐
│  🍋 Sunny Lemonade Stand           Open 9:00 to 17:00    │
├───────────────────────────────────┬──────────────────────┤
│  Menu   [ search...            ]  │  Your cart           │
│  🍋 Lemonade   10 left ₹40.00 Add │  🍋 Lemonade  − 2 +  │
│  🥭 Mango      8 left  ₹60.00 Add │  🍪 Cookie    − 1 +  │
│  🧊 Iced Tea   6 left  ₹50.00 Add │  Total: ₹105.00      │
│  🍪 Cookie     12 left ₹25.00 Add │  [ Place order ]     │
├───────────────────────────────────┴──────────────────────┤
│  Kitchen board:  ✔ 🍋 Lemonade x2 is ready ... ready! 🎉 │
│  Recent orders (from the server) · End-of-day report     │
└──────────────────────────────────────────────────────────┘
```

Along the way you also write a command-line version, a tiny server, a Web Worker, and 69 automatic tests.

## One step for every concept

This tutorial is the **hands-on partner** of the [JavaScript concepts reference](../concepts/README.md). The numbers match, so there is nothing to remember:

> **Step 5 teaches [Concept 5: Closures](../concepts/05-closures.md).**
> **Step 12 teaches [Concept 12: Promises & async/await](../concepts/12-promises-and-async-await.md).**

Read the concept file when you want the quick reference. Do the tutorial step when you want to *learn it with your hands*.

| Step | Topic | You build | Time |
|------|-------|-----------|------|
| [0](00-get-ready.md) | **Get ready** | Install Node.js, make the project folder, learn to read errors | 20 min |
| | **Part 1: Foundations** | | |
| [1](01-how-javascript-runs.md) | [How JavaScript runs](../concepts/01-how-javascript-runs.md) | `hello.js`, running in Node **and** the browser | 30 min |
| [2](02-variables-and-scope.md) | [Variables & scope](../concepts/02-variables-and-scope.md) | The first version of the stand: cups sold, money earned | 30 min |
| [3](03-data-types-and-coercion.md) | [Data types & coercion](../concepts/03-data-types-and-coercion.md) | Safe typed quantities, and money in whole paise | 40 min |
| [4](04-functions.md) | [Functions](../concepts/04-functions.md) | Price, quantity, and discount machines | 45 min |
| [5](05-closures.md) | [Closures](../concepts/05-closures.md) | An order counter and a cash box with a private balance | 40 min |
| [6](06-objects-and-prototypes.md) | [Objects & prototypes](../concepts/06-objects-and-prototypes.md) | Real menu items and the stand itself | 45 min |
| [7](07-arrays-and-iteration.md) | [Arrays & iteration](../concepts/07-arrays-and-iteration.md) | The menu list and a shopping cart | 50 min |
| | **Part 2: Modern structure** | | |
| [8](08-destructuring-spread-and-rest.md) | [Destructuring, spread & rest](../concepts/08-destructuring-spread-and-rest.md) | Cleaner code, a cart that no longer changes behind your back, stackable discounts | 40 min |
| [9](09-modules.md) | [Modules](../concepts/09-modules.md) | Split the big file into a tidy `src/` folder | 50 min |
| [10](10-classes.md) | [Classes](../concepts/10-classes.md) | An `Order` class with private data, plus `TakeAwayOrder` | 50 min |
| [11](11-this-and-binding.md) | [`this` & binding](../concepts/11-this-and-binding.md) | A `PickupTimer` that counts down | 45 min |
| | **Part 3: Async and errors** | | |
| [12](12-promises-and-async-await.md) | [Promises & async/await](../concepts/12-promises-and-async-await.md) | A kitchen that cooks slowly, together, or gives up | 60 min |
| [13](13-event-loop-and-timers.md) | [Event loop & timers](../concepts/13-event-loop-and-timers.md) | A sales report that does not freeze everything | 50 min |
| [14](14-iterators-and-generators.md) | [Iterators & generators](../concepts/14-iterators-and-generators.md) | Order numbers, loopable orders, and a streaming kitchen board | 50 min |
| [15](15-error-handling.md) | [Error handling](../concepts/15-error-handling.md) | Friendly errors for pizza orders and silly quantities | 50 min |
| | **Part 4: In the browser** | | |
| [16](16-dom-and-events.md) | [DOM & events](../concepts/16-dom-and-events.md) | **The web page**: menu, cart, order form, kitchen board | 90 min |
| [17](17-fetch-and-web-apis.md) | [Fetch & web APIs](../concepts/17-fetch-and-web-apis.md) | A server API, saved cart, observers, and a Web Worker | 90 min |
| | **Part 5: Quality** | | |
| [18](18-immutability-and-pure-functions.md) | [Immutability & pure functions](../concepts/18-immutability-and-pure-functions.md) | A frozen menu, a pure cart, a tiny store, stock that goes down | 90 min |
| [19](19-strings-numbers-and-dates.md) | [Strings, numbers & dates](../concepts/19-strings-numbers-and-dates.md) | Proper money, "2 minutes ago", and a printed receipt | 60 min |
| [20](20-performance-and-memory.md) | [Performance & memory](../concepts/20-performance-and-memory.md) | A debounced search box, leak-free cleanup, measurements | 75 min |
| [21](21-security.md) | [Security](../concepts/21-security.md) | A real XSS attack, then the defences and a CSP | 75 min |
| [22](22-tooling-and-testing.md) | [Tooling & testing](../concepts/22-tooling-and-testing.md) | npm scripts, ESLint, Prettier, Vite, and 69 tests | 120 min |
| [23](23-graduation.md) | [A to Z glossary](../concepts/23-a-to-z-glossary.md) | A tour of everything you built, and what to learn next | 20 min |

That is about **22 hours** in total. Do one or two steps in a sitting, and take breaks.

> **A small note on order.** The [concepts reading path](../concepts/README.md) puts "Iterators & generators" (14) before "this" (11). In the tutorial it comes **after** promises (12) and the event loop (13), because the last part of that lesson, *async generators*, needs `await`. The numbers still match the concept files.

## How every step is laid out

1. **Like I'm 5:** the idea as a story, plus a table of *Words to know*.
2. **Play:** try the idea in a scribble file called `playground.js` and see what happens.
3. **Build:** use the idea to add a real piece to the stand.
4. **What just happened?:** a plain explanation of the code you typed.
5. **🧪 Try it yourself:** challenges, with answers hidden in a click-to-open box.
6. **⚠️ Mistakes everyone makes:** a table of the traps and their fixes.
7. **✅ Checkpoint:** a checklist. Tick every box before you move on.

And a few signs you will learn in [Step 0](00-get-ready.md): 📄 (make or change a file), ▶️ (run a command), 👀 (what you should see), 🗑️ (delete a file).

## What you need

- **Node.js 22 or newer** (the LTS version from [nodejs.org](https://nodejs.org))
- A **code editor** (we suggest Visual Studio Code)
- A **web browser** (we say Chrome)
- No other experience. Step 0 starts at the very beginning.

## Is the code tested?

Yes. Every code block marked 📄 and every output marked 👀 in these steps was **rebuilt from an empty folder and run for real** (Node.js 22), and the web page from Step 16 onwards was driven in a real Chromium browser. Where the book shows exact output, the output was compared automatically with what the program printed. Where a number depends on your machine (like timings), the book says "something like".

If you get stuck, open the **finished project** and compare it with yours:

📁 **[`finished-project/`](finished-project/)** is the complete Lemonade Stand as you will have it after Step 22.

## Other ways to use this folder

| If you are... | Do this |
|---------------|---------|
| Brand new to programming | Start at [Step 0](00-get-ready.md) and go in order. |
| Comfortable with another language | Skim the "Like I'm 5" parts, and focus on the **Play** and **Mistakes** sections. |
| Revising for an interview | Do the steps for your weak topics, then try the [interview Q&A](../interviewQnA/README.md). |
| Teaching someone | Each step is a self-contained 30-90 minute lesson with exercises and answers. |

**Ready? [Start with Step 0: Get ready](00-get-ready.md).**
