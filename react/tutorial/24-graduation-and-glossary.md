# Lesson 24: Graduation Day – The A to Z of React

> **Like I'm 5:** This is a picture dictionary of React words. Find a word, remember where you used it in the toy shop, then go back to the lesson if you want to see it again.

| | |
|---|---|
| **Concept reference** | [24 – A to Z glossary](../concepts/24-a-to-z-glossary.md) |
| **You will do** | Look back at what you built, match every React word to the place in the shop where you used it, take a mixed quiz, and choose what to build next |
| **Time** | About 45 minutes |

## 🎓 You did it!

Twenty-three lessons ago you typed `npm create vite@latest` and saw "Hello, Tiny Toy Shop!". Now you have a shop that:

- shows toys loaded from a (pretend) server, with loading and error states,
- filters by category and searches while you type,
- has a cart that remembers you, with a pop-up asking "are you sure?",
- has toy pages with tabs, reviews that appear instantly, and ❤️ favorites that update before the server answers,
- has a checkout that shows progress and keeps what you typed when something goes wrong,
- has a light/dark theme, a warehouse with 10,000 rows that scrolls smoothly, and a lab for experiments,
- is covered by 24 fast tests and 2 browser tests,
- can be packed into a Docker box and checked by a pipeline,

and a small Next.js sibling that shows the server side of React.

## 1. Tour of your project

This is what `src/` looks like now (trimmed; the numbers are the lesson where each thing was born):

```text
src/
├── main.tsx            providers + router (1, 8, 14, 15)
├── router.tsx          URL → page, lazy pages (14, 17)
├── index.css           design tokens, dark mode (1, 8)
├── types.ts            Toy, CartItem, … (3, 5, 15)
├── api/                the "pretend server" (15, 19)
├── components/         shared bricks
│   ├── ToyCard.tsx     props, state, memo, refs, CSS Module (3, 5, 7, 11, 22)
│   ├── Modal.tsx       portal + refs (7)
│   ├── Tabs.tsx        compound components (12)
│   ├── Field.tsx       accessible form fields (13)
│   ├── ToyReviews.tsx  use, Suspense, useOptimistic (19)
│   └── …
├── context/            theme and login contexts (8, 14)
├── features/
│   └── cart/           store, drop-down, page, checkout, tests, public door (16, 22)
├── hooks/              your own hooks (10, 15, 18)
├── lab/ + pages/       pages, experiments, warehouse (14, 17, 18)
├── lib/                small helpers
└── test/               test setup and a fake network (21)
```

And around it: `e2e/` (browser tests), `scripts/` (size budget, smoke test), `Dockerfile`, `nginx.conf`, `.github/workflows/ci.yml`, `.env*` files (23).

## 2. The A to Z picture dictionary

For every word in the [glossary](../concepts/24-a-to-z-glossary.md): what it means, **where you used it**, and which lesson to re-read.

| Letter | Term | Short meaning | Where in the shop | Lesson |
|:------:|------|---------------|-------------------|:------:|
| **A** | Action | A function given to a form or a transition; React tracks its pending state. | `CheckoutForm`, `postReview` | [19](19-react-19-features.md) |
| **A** | `useActionState` | Hook that connects an action to its result and pending flag. | `CheckoutForm`, the Next.js `SubscribeForm` | [19](19-react-19-features.md), [20](20-server-components-and-frameworks.md) |
| **B** | Batching | React groups several state updates into one redraw. | Quantity picker experiments | [5](05-state-with-usestate.md) |
| **C** | Component | A function that returns UI. | `Header`, `ToyCard`, `Section` | [3](03-components-and-props.md) |
| **C** | Context | Shares a value down the tree without passing props. | `ThemeContext`, `AuthContext` | [8](08-context-and-prop-drilling.md) |
| **C** | Controlled input | An input whose value comes from React state. | `SearchBox`, `AddToyForm` | [13](13-forms-and-controlled-inputs.md) |
| **C** | Custom hook | A `use…` function that shares logic. | `useDebounce`, `useLocalStorage` | [10](10-custom-hooks.md) |
| **C** | Concurrent rendering | React can pause and resume rendering work. | The Lab page | [18](18-concurrency-suspense-and-error-boundaries.md) |
| **D** | Derived state | Values computed from other state while drawing. | `visibleToys`, `selectCount` | [5](05-state-with-usestate.md) |
| **D** | Dependency array | The list that tells an effect when to run again. | The fetch and title effects | [6](06-effects-with-useeffect.md) |
| **D** | `useDeferredValue` | Lets a value lag behind for non-urgent work. | `DeferredSearch` in the Lab | [18](18-concurrency-suspense-and-error-boundaries.md) |
| **E** | Effect (`useEffect`) | Runs code after drawing to sync with the outside world. | `SaleBanner`, `Footer`, `Modal` | [6](06-effects-with-useeffect.md) |
| **E** | Error boundary | Catches rendering errors in its children. | `RootLayout`, `ToyPage`, `CrashLab` | [18](18-concurrency-suspense-and-error-boundaries.md) |
| **F** | Fragment | Groups elements without an extra DOM node. | `<>…</>` in `App` (Lesson 2) | [2](02-jsx-html-inside-javascript.md) |
| **H** | Hook | A `use…` function that adds React features. | Everywhere from Lesson 5 | [10](10-custom-hooks.md) |
| **H** | Hydration | Attaching React to server-rendered HTML. | `AddToCartButton` in the Next.js shop | [20](20-server-components-and-frameworks.md) |
| **I** | Immutability | Create new objects and arrays; never change old ones. | `cartStore` actions, reducers | [5](05-state-with-usestate.md) |
| **I** | `useImperativeHandle` | Exposes a controlled API from a child through a ref. | `SearchBox` (`focus`, `clear`) | [7](07-refs-and-the-dom.md) |
| **J** | JSX | HTML-like syntax that compiles to JavaScript. | Every `.tsx` file | [2](02-jsx-html-inside-javascript.md) |
| **K** | Key | A stable identifier for items in a list. | `ToyList`, `CartPage` | [4](04-lists-keys-and-conditional-rendering.md) |
| **L** | `lazy` | Loads a component only when first drawn. | `router.tsx`, `features/cart/index.ts` | [17](17-performance.md) |
| **L** | Lifting state up | Moving state to a parent so siblings can share it. | The first cart in `App` | [5](05-state-with-usestate.md) |
| **M** | `memo` | Skips redrawing when props haven't changed. | `ToyCard`, `ToyList` | [11](11-memoization.md) |
| **M** | Memoization | Caching results to avoid repeated work. | `useMemo`, `useCallback` | [11](11-memoization.md) |
| **N** | Nested routes | Child routes drawn inside a parent layout. | `RootLayout` + `<Outlet />` | [14](14-routing.md) |
| **O** | `useOptimistic` | Shows an expected result before the server confirms. | Reviews (and the ❤️ cache update) | [19](19-react-19-features.md), [15](15-data-fetching-and-caching.md) |
| **P** | Portal | Draws children in a different part of the DOM. | `Modal` | [7](07-refs-and-the-dom.md) |
| **P** | Props | Inputs passed from parent to child. | `ToyCard toy={…}` | [3](03-components-and-props.md) |
| **Q** | Query (TanStack Query) | A library that caches and manages server data. | `useToys`, `useToy` | [15](15-data-fetching-and-caching.md) |
| **R** | Re-render | React calls a component function again. | The console counter in Lesson 11 | [11](11-memoization.md), [17](17-performance.md) |
| **R** | Reconciliation | Comparing the old and new trees to update the DOM. | "The painter" | [1](01-meet-react-and-open-the-shop.md) |
| **R** | Reducer | A pure function that computes new state from an action. | `cartReducer` (Lesson 9) | [9](09-reducers-with-usereducer.md) |
| **R** | Ref | A stable container for a DOM node or a value. | `inputRef`, `timerId` | [7](07-refs-and-the-dom.md) |
| **R** | React Router | A library for URL-based navigation. | `router.tsx` | [14](14-routing.md) |
| **S** | Server Component | A component that runs only on the server. | `ToyCard` in the Next.js shop | [20](20-server-components-and-frameworks.md) |
| **S** | State | Data that changes and causes redraws. | `useState` everywhere | [5](05-state-with-usestate.md) |
| **S** | StrictMode | Development checks that find unsafe effects. | `main.tsx`; the doubled timer logs | [6](06-effects-with-useeffect.md) |
| **S** | Suspense | Shows a fallback while something is loading. | Lazy pages, `ToyPage`, reviews | [18](18-concurrency-suspense-and-error-boundaries.md) |
| **T** | `useTransition` | Marks an update as non-urgent. | `TransitionSearch` in the Lab | [18](18-concurrency-suspense-and-error-boundaries.md) |
| **U** | `use` | Reads a promise or context while drawing. | `ReviewsBody` | [19](19-react-19-features.md) |
| **U** | `'use client'` | Marks a file as client-side in frameworks. | `AddToCartButton` (Next.js) | [20](20-server-components-and-frameworks.md) |
| **V** | Virtual DOM | A light description of the UI that React compares. | "The painter" | [1](01-meet-react-and-open-the-shop.md) |
| **V** | Virtualization | Draws only the visible rows of a long list. | `WarehouseList` | [17](17-performance.md) |
| **W** | Wrapper component | Adds layout or behaviour around children. | `PageLayout`, `SplitView` | [12](12-composition-and-children.md) |
| **X** | XSS protection | React escapes text by default. | `{sneakyText}` in Lesson 2 | [2](02-jsx-html-inside-javascript.md) |
| **Y** | Your own hook | A custom hook you write to share logic. | `useWindowWidth` and friends | [10](10-custom-hooks.md) |
| **Z** | Zustand | A small store library for client state. | `useCartStore` | [16](16-state-management-libraries.md) |

**Self-test:** cover the "Where in the shop" column and try to name one place for each term. Look at the ones you missed.

## 3. Mixed quiz

Fifteen questions from all over the course. Answer out loud before you open the answer.

<details>
<summary>1. A button click should change what the screen shows. Where does the changing value live?</summary>

In **state** (`useState` / `useReducer`, or a store). Plain variables don't redraw anything.
</details>

<details>
<summary>2. You have <code>const [list, setList] = useState([])</code>. Why is <code>list.push(x); setList(list)</code> wrong?</summary>

It mutates the old array and passes the same array back, so React sees no change. Use `setList([...list, x])`.
</details>

<details>
<summary>3. Which values go in an effect's dependency array?</summary>

Every value from the component that the effect reads (props, state, functions). The linter checks this for you.
</details>

<details>
<summary>4. Which tool: shared <code>theme</code> that rarely changes, versus a <code>cart</code> that changes all the time?</summary>

Context for the theme; a store (Zustand/Redux Toolkit) for the busy cart.
</details>

<details>
<summary>5. Where should server data (toys) live: <code>useState</code> or a query library? Why?</summary>

A query library. It gives caching, deduplication, retries, refetching and invalidation; copying server data into `useState` means you must keep it in sync yourself.
</details>

<details>
<summary>6. Why does a list item need a <code>key</code>, and why not the array index?</summary>

The key tells React which item is which when the list changes. The index belongs to the position, so state can stick to the wrong item after reordering or filtering.
</details>

<details>
<summary>7. What does <code>memo</code> need to be useful?</summary>

Props that stay equal between renders, which often means `useCallback`/`useMemo` for functions and objects. And only use it after measuring.
</details>

<details>
<summary>8. Typing in a box feels laggy because a big list redraws on each key. Which two tools can help?</summary>

`useTransition` (wrap the slow state update) or `useDeferredValue` (a lagging copy of the value). Also consider moving state down and virtualizing the list.
</details>

<details>
<summary>9. Why is a route guard in the browser not security?</summary>

Everything in the browser can be changed by the user. The server must check access on every request.
</details>

<details>
<summary>10. What do error boundaries catch, and what don't they catch?</summary>

They catch errors thrown while rendering. They don't catch errors in event handlers or async code (use `try`/`catch` there).
</details>

<details>
<summary>11. A button inside a form should be disabled while the form is sending. Which hook gives it that information?</summary>

`useFormStatus` (in a component rendered inside the `<form>`), or `isPending` from `useActionState`.
</details>

<details>
<summary>12. What is the difference between <code>VITE_API_URL</code> and a secret key?</summary>

`VITE_` variables are copied into the public JavaScript at build time. Secrets must never use them; keep secrets on a server.
</details>

<details>
<summary>13. In a Next.js app, when does a component need <code>'use client'</code>?</summary>

When it uses state, effects, event handlers or browser APIs. Keep those components small, and leave the rest as Server Components.
</details>

<details>
<summary>14. How should you find a button in a Testing Library test, and why?</summary>

With `getByRole('button', { name: … })`, which matches how users and screen readers find it, and checks accessibility too.
</details>

<details>
<summary>15. Why cache <code>assets/*.js</code> for a year but <code>index.html</code> not at all?</summary>

Asset file names contain a content hash, so every release has new names. `index.html` keeps its name and points to the current assets, so it must always be re-checked.
</details>

## 4. Where to go next

**Make the shop your own.** Learning sticks when you build. Pick one:

1. **A wish-list page.** List only favorites with a query, with its own route and a test.
2. **Order history.** Save orders in a pretend server and show them with TanStack Query (try pagination).
3. **Real data.** Replace `public/toys.json` and `toysApi.ts` with a real backend (your own small server, or a hosted database) and set `VITE_API_URL`.
4. **Accessibility pass.** Navigate the whole shop with only a keyboard and a screen reader. Add the arrow-key support to `Tabs`. Trap focus inside `Modal`.
5. **Another language.** Add translations for the labels and a language switcher (a context and a hook).
6. **Deploy it.** Put it on a free host, add the SPA rewrite, set up the CI deploy job, run the smoke test against the live address.
7. **Rebuild a page with Next.js** or React Router's framework mode, with the toy list rendered on the server.

**Keep learning.**

- Practice explaining things: the [React interview Q&A](../interviewQnA/README.md) has "Like I'm 5" answers *and* the deeper version.
- Re-read any [concept page](../concepts/README.md) as a reference; now the code snippets there will feel familiar.
- Strengthen the foundations: [JavaScript concepts](../../javascript/concepts/README.md) (closures, async, the event loop) and [TypeScript concepts](../../typescript/concepts/README.md).
- The official docs at [react.dev](https://react.dev) are excellent and always up to date. When this tutorial and the docs disagree about a new version, trust the docs.

## 5. Habits worth keeping

- **Describe the UI as a function of state.** When something looks wrong, check the data first.
- **Keep state small and close.** Derive what you can.
- **Immutability, always.**
- **Effects are for the outside world.** Not for calculating things.
- **Measure before you optimize.**
- **Test what users see.**
- **Make it work, make it clear, then make it fast.**
- **Read error messages to the end.** (In this course, Next.js and Vite told us exactly what to do more than once.)

## Recap

- You built a real, tested, deployable React app, concept by concept.
- Every word in the A to Z has a place in your shop.
- The best next step is to build something of your own.

🎉 **Congratulations, graduate!** 🧸

⬅️ **Back to the tutorial home:** [README](README.md)
