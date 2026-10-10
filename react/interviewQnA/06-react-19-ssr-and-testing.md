# 6. React 19, SSR & Testing

### Q1. What are Server Components, and how do they differ from SSR? `Architect`

> **Like I'm 5:** SSR is the kitchen cooking the whole meal and sending it out hot. Server Components are the kitchen cooking only the parts that don't need the customer's table, so less food travels to the customer.

**Answer:** SSR renders the whole page to HTML on the server, then hydrates client JavaScript. Server Components run only on the server, can access data directly, and send no JavaScript for their own code. They can include Client Components marked with `'use client'`.

---

### Q2. What are React 19 Actions? `Core`

> **Like I'm 5:** A waiter takes your order and tells you whether the kitchen is working on it, so you don't have to keep asking.

**Answer:** Actions are functions passed to `<form action>` or transitions. React manages the pending state, form reset, and error handling. `useActionState` connects an action to state, and `useFormStatus` reads the pending state in child components.

---

### Q3. What is `useOptimistic`? `Advanced`

> **Like I'm 5:** The menu says "on the way" right away, and if the food is cancelled the menu line disappears.

**Answer:** `useOptimistic` shows an expected state immediately while an async action runs. When the action settles, React uses the real state. If it fails, the optimistic value is removed.

---

### Q4. What does the `use` API do? `Advanced`

> **Like I'm 5:** A box that can be opened in the middle of a sentence, if the food is already there. If not, it waits politely.

**Answer:** `use` reads a promise or a context value during render. With a promise, it suspends until resolved. Unlike hooks, it can be called conditionally.

---

### Q5. What changed about `ref` in React 19? `Core`

> **Like I'm 5:** You used to need a special envelope to pass a sticky note to a child. Now the note can go in as a normal prop.

**Answer:** `ref` is a regular prop for function components, so `forwardRef` is no longer needed for new code. Callback refs can also return cleanup functions.

---

### Q6. What is hydration, and what is a hydration mismatch? `Advanced`

> **Like I'm 5:** Like a colouring book already coloured by someone else. You must trace the same lines, or it looks wrong.

**Answer:** Hydration attaches event handlers to server-rendered HTML. A mismatch happens when the client's first render differs from the server HTML, often caused by time, random values, or browser-only checks in render.

---

### Q7. What is the difference between Next.js and plain React? `Core`

> **Like I'm 5:** React is the paintbrush. Next.js is the whole art studio with a canvas, a delivery service, and a gallery.

**Answer:** React is a UI library. Next.js is a framework that adds routing, SSR, SSG, Server Components, data fetching conventions, and deployment support. Vite plus React Router is an alternative for client-side apps.

---

### Q8. How do you test React components? `Core`

> **Like I'm 5:** Test the vending machine by pressing the buttons, not by opening the case.

**Answer:** Use React Testing Library with Vitest or Jest. Query elements by role and label, simulate user events with `userEvent`, and assert on what the user sees. Mock network calls with MSW.

---

### Q9. Why avoid `getByTestId` as the first choice? `Advanced`

> **Like I'm 5:** A sticker that says "press me" is less useful than the button's real name, because the name is what users see.

**Answer:** Role and label queries test what users and assistive technology see, so they also check accessibility. Test IDs don't reflect the user experience, so use them only when no better query exists.

---

### Q10. How do you test asynchronous UI? `Core`

> **Like I'm 5:** Wait for the food to arrive before checking the plate.

**Answer:** Use `findBy*` queries or `waitFor` to wait for async updates. Mock the network layer so tests are fast and deterministic.

---

### Q11. What should you test end to end, and what should you unit test? `Architect`

> **Like I'm 5:** Unit tests check each recipe. End-to-end tests check whether the whole restaurant serves a complete meal.

**Answer:** Unit and component tests cover component behavior, edge states, and hooks. End-to-end tests with Playwright cover critical flows such as login and checkout in a real browser against a preview environment.
