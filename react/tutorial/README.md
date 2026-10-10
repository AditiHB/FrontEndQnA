# React Tutorial: Build the Tiny Toy Shop (Explained Like You're 5)

Learn React by building **one real project** from an empty folder to a deployed, tested shop. Every lesson teaches one topic from the [concepts reference](../concepts/README.md) in plain words, then builds it into the shop, step by step, with every file spelled out.

> **Like I'm 5:** You are opening a toy shop on the internet. Each day you add one new thing: a sign, a shelf, a cash register, a lock for the door. At the end you have a real shop, and you know why every part works.

## What you will build

A shop called **Tiny Toy Shop** 🧸 that:

- lists toys from a (pretend) server, with loading and error states, categories and live search,
- has a cart that remembers you, a checkout with progress and error messages, and a light/dark theme,
- has a page for every toy with tabs, reviews that appear instantly, and ❤️ favorites,
- lets a "shopkeeper" log in to add toys,
- has a warehouse page with 10,000 rows that still scrolls smoothly,
- is covered by fast tests and real-browser tests, and can be deployed with Docker and a CI pipeline.

## How this tutorial works

Each lesson has the same shape:

| Part | What it is |
|------|------------|
| 🧒 **Like I'm 5** | One picture to hold in your head |
| **The story** | Why the shop needs this today |
| **Steps** | Short explanations, then the code to type |
| **What just happened?** | The idea behind the code, with diagrams |
| 🧪 **Try it yourself** | Small experiments (break things on purpose!) |
| ✅ **Check yourself** | Questions with hidden answers (click to open) |
| **Recap** | The lesson in five bullets |

How code is shown:

- 📄 **`path/to/File.tsx`** *(new file)*: create this file with exactly the code shown.
- 📄 **`path/to/File.tsx`** *(replace everything)*: select all the old text and replace it.
- 📄 **`path/to/File.tsx`** *(add to the bottom)*: add the code at the end of the file.
- 📄 **`path/to/File.tsx`** *(edit these lines)* with a `diff` block: lines starting with **`-`** (red) are removed, lines starting with **`+`** (green) are added, lines with no sign show where you are, and `@@` separates separate places in the file. Do not type the `-` and `+` signs.
- `bash` blocks are commands for your terminal (in the project folder, unless the lesson says otherwise). Commands such as `rm`, `mv`, `cp` and `mkdir -p` work on Mac, Linux and in **Git Bash** on Windows. In plain Windows PowerShell, do the same thing in your editor's file explorer (delete, move, copy, new folder).

Tips for the best learning:

1. **Type the first few lessons by hand.** Your fingers learn what your eyes skim. Later, copying is fine, but read every comment.
2. **Keep `npm run dev` running** and look at the browser after every step.
3. **Commit after every lesson** so you can always go back:

   ```bash
   git init                      # once, at the start (Lesson 1)
   git add -A && git commit -m "lesson 1"
   ```
4. **Do the 🧪 experiments.** Breaking things on purpose is the fastest way to understand them.
5. **Be patient with errors.** Read the message to the end; in this course the tools often tell you exactly what to do.

## Before you start

- **Node.js 22.22 or newer** (check with `node -v`) and a code editor such as VS Code.
- Basic comfort with the terminal and with JavaScript: variables, functions, arrays, objects, `async`/`await`. If any of that feels new, read the [JavaScript concepts](../../javascript/concepts/README.md) first, and skim the [TypeScript concepts](../../typescript/concepts/README.md) (we use TypeScript from the first line).
- About **25 to 30 hours in total**. A good pace is one or two lessons per sitting.

## The lessons

Each lesson links to the matching page of the concepts reference, so you can read the short reference after (or before) the story.

### Part 1: The foundations

| # | Lesson | Concept | We add to the shop |
|:-:|--------|:-------:|--------------------|
| 1 | [Meet React and open the shop](01-meet-react-and-open-the-shop.md) | [1](../concepts/01-what-is-react-and-setup.md) | The project, `createRoot`, the Virtual DOM |
| 2 | [JSX: HTML inside JavaScript](02-jsx-html-inside-javascript.md) | [2](../concepts/02-jsx.md) | The first page: header, search field, footer |
| 3 | [Components and props](03-components-and-props.md) | [3](../concepts/03-components-and-props.md) | `Header`, `Section`, `ToyCard` |
| 4 | [Lists, keys and conditional rendering](04-lists-keys-and-conditional-rendering.md) | [10](../concepts/10-lists-keys-and-conditional-rendering.md) | `ToyList` with all 12 toys, "Sold out" |

### Part 2: State and effects

| # | Lesson | Concept | We add to the shop |
|:-:|--------|:-------:|--------------------|
| 5 | [State with `useState`](05-state-with-usestate.md) | [4](../concepts/04-state-with-usestate.md) | Quantity pickers, a cart count, filters, search |
| 6 | [Effects with `useEffect`](06-effects-with-useeffect.md) | [5](../concepts/05-effects-useeffect.md) | Tab title, flash-sale countdown, loading toys |
| 7 | [Refs and the DOM](07-refs-and-the-dom.md) | [6](../concepts/06-refs-and-the-dom.md) | Focus, a "/" shortcut, roulette, a pop-up (portal) |
| 8 | [Context and prop drilling](08-context-and-prop-drilling.md) | [7](../concepts/07-context-and-prop-drilling.md) | Light/dark theme |
| 9 | [Reducers with `useReducer`](09-reducers-with-usereducer.md) | [8](../concepts/08-reducers-and-usereducer.md) | A real cart: change, remove, clear |
| 10 | [Custom hooks](10-custom-hooks.md) | [13](../concepts/13-custom-hooks.md) | Saved cart and theme, debounced search, click-outside |

### Part 3: Patterns

| # | Lesson | Concept | We add to the shop |
|:-:|--------|:-------:|--------------------|
| 11 | [Memoization](11-memoization.md) | [9](../concepts/09-memoization.md) | Cards that skip needless redraws |
| 12 | [Composition and children](12-composition-and-children.md) | [12](../concepts/12-composition-and-children.md) | Layouts with slots, `Button`, `Tabs`, "Quick look" |
| 13 | [Forms and controlled inputs](13-forms-and-controlled-inputs.md) | [11](../concepts/11-forms-and-controlled-inputs.md) | "Add a toy" form with validation, a checkout form |

### Part 4: Pages and data

| # | Lesson | Concept | We add to the shop |
|:-:|--------|:-------:|--------------------|
| 14 | [Routing](14-routing.md) | [14](../concepts/14-routing.md) | Separate pages, URL filters, login and a protected page |
| 15 | [Data fetching and caching](15-data-fetching-and-caching.md) | [15](../concepts/15-data-fetching-and-caching.md) | A pretend server API, TanStack Query, optimistic ❤️ |
| 16 | [State management libraries](16-state-management-libraries.md) | [16](../concepts/16-state-management-libraries.md) | The cart in a Zustand store (and in Redux Toolkit for comparison) |

### Part 5: Fast and safe

| # | Lesson | Concept | We add to the shop |
|:-:|--------|:-------:|--------------------|
| 17 | [Performance](17-performance.md) | [17](../concepts/17-performance.md) | Lazy pages, a 10,000-row warehouse, bundle map |
| 18 | [Concurrency, Suspense and error boundaries](18-concurrency-suspense-and-error-boundaries.md) | [18](../concepts/18-concurrency-suspense-and-error-boundaries.md) | The Science Lab, a safety net around pages |

### Part 6: Modern React

| # | Lesson | Concept | We add to the shop |
|:-:|--------|:-------:|--------------------|
| 19 | [React 19 features](19-react-19-features.md) | [19](../concepts/19-react-19-features.md) | Checkout actions, instant reviews, `<title>` in JSX |
| 20 | [Server Components and frameworks](20-server-components-and-frameworks.md) | [20](../concepts/20-server-components-and-frameworks.md) | A trip to Next.js: a second, tiny project |

### Part 7: Ship it

| # | Lesson | Concept | We add to the shop |
|:-:|--------|:-------:|--------------------|
| 21 | [Testing](21-testing.md) | [21](../concepts/21-testing.md) | 24 fast tests and 2 browser tests |
| 22 | [Styling and project structure](22-styling-and-project-structure.md) | [22](../concepts/22-styling-and-project-structure.md) | A CSS Module and a `features/cart` folder |
| 23 | [Deployment and environment variables](23-deployment-and-environment.md) | [23](../concepts/23-deployment-and-environment.md) | Env settings, nginx, Docker, CI, a size budget |
| 24 | [Graduation day: the A to Z of React](24-graduation-and-glossary.md) | [24](../concepts/24-a-to-z-glossary.md) | Every glossary word, matched to your shop |

### Why the order is not exactly the order of the concept pages

The [concepts reference](../concepts/README.md) is organized by topic, so you can look things up. A project needs a different order: you can't search a list before you have a list, and you can't test a cart before you have one. The lessons follow the *suggested learning path* from the concepts page (foundations → hooks and patterns → data and routing → performance → modern React → quality and delivery), with **lists and keys** moved up to Lesson 4 because the shop needs a list of toys almost immediately. Every concept page has its own lesson, shown in the "Concept" column above.

## The project as it grows

```text
Lesson  1-4   a static page with cards            ── Vite, JSX, components, lists
Lesson  5-10  an interactive shop                 ── state, effects, refs, context, reducers, hooks
Lesson 11-13  clean building blocks               ── memo, composition, forms
Lesson 14-16  a multi-page app with real data     ── router, TanStack Query, Zustand
Lesson 17-20  fast, safe, modern                  ── lazy/virtual, Suspense, React 19, Next.js
Lesson 21-23  ready for the world                 ── tests, structure, deployment
```

## Tested with these versions

Every lesson was run **in order, from an empty folder**, against a real project. After each lesson the project was type-checked, linted and built, a browser opened it and clicked through the new features, and from Lesson 21 on the tests ran too. These are the versions used:

| Tool | Version |
|------|---------|
| Node.js | 22.22 |
| React / React DOM | 19.3 |
| Vite | 8.3 (project created with `create-vite` 9) |
| TypeScript | 6.0 |
| React Router | 8.4 |
| TanStack Query | 5.104 |
| Zustand | 5.0 |
| Redux Toolkit | 2.13 |
| Vitest | 5.0 |
| React Testing Library / user-event | 16.3 / 14.6 |
| MSW | 2.15 |
| Playwright | 1.64 |
| Next.js (Lesson 20) | 16.4 |
| Linter | oxlint (the one `create-vite` sets up) |

The tools in this list move fast. If you start later, `npm` will install newer versions and a few details (file names generated by `create-vite`, option names, error messages) may differ. The ideas stay the same. When something differs, the tool's own documentation wins.

A few things were **not** run in the verification: building the Docker image (Lesson 23; the nginx configuration and the build stage were tested separately) and the GitHub Actions workflow (its commands were run one by one on a computer instead).

## If something doesn't work

1. Read the **first** error in the terminal or the browser console, all of it.
2. Compare your file with the lesson's code, character by character (`npm run build` shows type errors with file and line number).
3. Check you pasted into the right file, and that **replace everything** really replaced everything.
4. Make sure the dev server is running and you saved the file.
5. If you committed after the previous lesson, `git diff` shows exactly what you changed since.
6. Stuck on a version difference? Search the error message together with the tool's name.

## After the tutorial

- Practise explaining: the [React interview Q&A](../interviewQnA/README.md).
- Look things up: the [concepts reference](../concepts/README.md) and its [A to Z glossary](../concepts/24-a-to-z-glossary.md).
- Build your own thing! Lesson 24 has a list of ideas.
