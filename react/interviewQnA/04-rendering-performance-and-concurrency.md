# 4. Rendering, Performance & Concurrency

### Q1. What causes unnecessary re-renders? `Core`

> **Like I'm 5:** The whole class repaints the whole board because one kid wrote one word.

**Answer:** State set too high in the tree, a context value that changes often, new object or function props passed to memoized children, and parents re-rendering children that don't need it.

---

### Q2. How do you find performance problems in React? `Core`

> **Like I'm 5:** Use a stopwatch and a notebook to record who is working and for how long.

**Answer:** Use the React DevTools Profiler to record a session, look for components that re-render without visible change, and check why they rendered. Then fix the root cause, and measure again.

---

### Q3. Explain `React.memo`, `useMemo`, and `useCallback` together. `Advanced`

> **Like I'm 5:** Keep the answer, the tool, and the guard. Each one saves work in a different way.

**Answer:** `memo` skips a child render when its props are equal. `useMemo` caches expensive values. `useCallback` keeps function identity stable, so `memo` works. Use them together only when a profiler shows a real benefit.

---

### Q4. What is code splitting, and how do you do it? `Core`

> **Like I'm 5:** Pack only the toys you need for today, and fetch the rest from the storeroom when you ask.

**Answer:** Use `React.lazy` with dynamic `import()` and wrap in `Suspense`. Route-based splitting is the most common. Use `Suspense` boundaries to show fallbacks.

---

### Q5. How do you render a 50,000-row list efficiently? `Architect`

> **Like I'm 5:** Don't paint the whole wall of names. Only paint the rows that are visible through the window.

**Answer:** Virtualize the list with TanStack Virtual or react-window, use stable keys, paginate or filter on the server, and avoid heavy work per row.

---

### Q6. What is concurrent rendering? `Advanced`

> **Like I'm 5:** The cook can pause a slow dish, serve a quick snack, and then go back to the slow dish.

**Answer:** React can interrupt, pause, and resume rendering work. Updates have priorities: urgent (input, clicks) and non-urgent (transitions). React renders urgent updates first to keep the UI responsive.

---

### Q7. What is the difference between `useTransition` and debouncing? `Advanced`

> **Like I'm 5:** Debounce waits for quiet before answering. A transition answers right away, but tells React the slow part can wait.

**Answer:** Debouncing delays the work by time. A transition marks the state update as non-urgent so React can keep the input responsive while rendering the result. You can use both.

---

### Q8. How does `Suspense` work? `Advanced`

> **Like I'm 5:** A waiter puts a "food coming" sign on the table until the plate arrives.

**Answer:** A component that suspends (waiting for lazy code or data) causes the nearest `Suspense` boundary to show its fallback. Boundaries control how much UI shows loading at once. Data suspense requires a supporting data layer.

---

### Q9. What are error boundaries, and what do they not catch? `Core`

> **Like I'm 5:** A fire alarm for one room. It doesn't catch problems in the kitchen (event handlers) or the mail (async code) unless you wire those too.

**Answer:** Error boundaries catch errors during rendering and lifecycle in their children. They don't catch errors in event handlers, async callbacks, or the boundary itself. Use `try`/`catch` or query error states for those cases.

---

### Q10. Why are keys important for performance as well as correctness? `Advanced`

> **Like I'm 5:** With name tags, the teacher moves each child to the right seat. Without them, she recreates every child from scratch.

**Answer:** Stable keys let React reuse DOM nodes and component state when list order changes. Wrong keys cause unnecessary remounts and lost input state.

---

### Q11. What is hydration, and what causes mismatches? `Advanced`

> **Like I'm 5:** The server draws the picture on paper. The browser must trace it exactly, or the lines won't match.

**Answer:** Hydration attaches React to server-rendered HTML. Mismatches happen when the first client render differs from the server: non-deterministic values, `window` checks during render, or browser extensions that alter the markup.

---

### Q12. How do you reduce bundle size in a React app? `Core`

> **Like I'm 5:** Pack a smaller suitcase by leaving out the clothes you never wear.

**Answer:** Lazy-load routes and heavy components, import only what you need from libraries, analyze the bundle with a visualizer, and remove unused dependencies.
