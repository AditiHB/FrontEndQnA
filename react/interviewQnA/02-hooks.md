# 2. Hooks

### Q1. How does `useState` work, and why must you not mutate state? `Core`

> **Like I'm 5:** State is a whiteboard. If you erase and rewrite the same board without telling React, React doesn't notice the change. You must give React a new board.

**Answer:** `useState` returns the current value and a setter. React compares the new value by reference. Mutating an object or array doesn't change its reference, so React may skip the re-render. Create new objects with spread or immutable array methods.

---

### Q2. When should you use the functional form of a state update? `Core`

> **Like I'm 5:** If two kids both add one point to the score at the same time, you want the final score to show both points. The functional form makes sure each one adds to the latest score.

**Answer:** Use `setCount(prev => prev + 1)` when the new value depends on the previous one, especially when several updates happen in one event.

---

### Q3. What does `useEffect` do, and what is its cleanup? `Core`

> **Like I'm 5:** An effect is a note for a helper outside the room. The cleanup is the note that says "undo that when you leave".

**Answer:** `useEffect` runs code after the render commits, to synchronize with systems outside React such as timers, subscriptions, and the network. The function it returns runs before the next effect and on unmount.

---

### Q4. What is the difference between `useEffect` and `useLayoutEffect`? `Advanced`

> **Like I'm 5:** `useEffect` paints the room first and then rearranges the furniture. `useLayoutEffect` moves the furniture before the paint dries, so the user never sees the messy version.

**Answer:** `useLayoutEffect` runs synchronously after DOM mutations and before the browser paints. Use it for measurements that must happen before paint. Prefer `useEffect` otherwise, since layout effects block painting.

---

### Q5. When should you avoid `useEffect`? `Architect`

> **Like I'm 5:** Don't leave a note for a helper to do a job you can do yourself while you're already in the room.

**Answer:**
- Derived values: compute them during render.
- Responding to user events: do it in the event handler.
- Resetting state when a prop changes: use a `key`.
- Fetching data: use a query library that handles cancellation and caching.

Unnecessary effects cause extra renders and sync bugs.

---

### Q6. What is the difference between `useMemo` and `useCallback`? `Core`

> **Like I'm 5:** `useMemo` keeps the answer to a hard sum. `useCallback` keeps the same tool in the drawer, so the helper doesn't think it's a new tool every time.

**Answer:** `useMemo` caches a computed value. `useCallback` caches a function reference. `useCallback(fn, deps)` is the same as `useMemo(() => fn, deps)`. They matter most when passing values to memoized children.

---

### Q7. When does `React.memo` help, and when doesn't it? `Advanced`

> **Like I'm 5:** `memo` is a guard who stops you from redrawing a picture when nothing new is given to it. But if you keep handing over a new frame each time, the guard can't help.

**Answer:** `memo` skips re-rendering when props are shallowly equal. It helps when a parent re-renders often but the child's props rarely change. It doesn't help if props include new objects, arrays, or functions on every render, unless they are memoized too.

---

### Q8. What is `useRef`, and how is it different from state? `Core`

> **Like I'm 5:** A ref is a sticky note you can scribble on without asking the room to redraw.

**Answer:** `useRef` returns a mutable object that persists across renders. Changing `ref.current` doesn't re-render. It's used for DOM nodes, timers, and values that don't affect the UI.

---

### Q9. What is `useReducer`, and when would you choose it? `Advanced`

> **Like I'm 5:** A reducer is a rulebook. You announce what happened, and the rulebook decides the new score.

**Answer:** `useReducer` handles state with complex transitions or several related fields. It centralizes update logic in a pure function, which is easy to test. Use it when many actions change the same state in related ways.

---

### Q10. What is `useContext`? What is its main performance concern? `Core`

> **Like I'm 5:** A cookie jar in the middle of the room. Everyone who looks at it gets a new cookie whenever the jar is refilled, even if they only wanted one kind.

**Answer:** `useContext` reads the nearest provider's value. When the value changes, all consumers re-render. Split contexts or keep frequently changing state in a store.

---

### Q11. How do you write a custom hook? `Core`

> **Like I'm 5:** A recipe card you write once, and any cook can follow.

**Answer:** A custom hook is a function whose name starts with `use` and that calls other hooks. It shares logic, not state. Each component that calls it gets its own state.

---

### Q12. What is `useId`, and why is it useful? `Advanced`

> **Like I'm 5:** A name tag generator that gives each form field a unique tag, even when the same form appears twice on the page.

**Answer:** `useId` generates a stable ID that is consistent between server and client rendering. It's used to connect labels and inputs, and to link ARIA attributes, without hard-coding IDs that might clash.

---

### Q13. What are `useTransition` and `useDeferredValue` for? `Advanced`

> **Like I'm 5:** Typing is urgent, so the letters appear right away. Filtering a long list is less urgent, so React can finish it a bit later.

**Answer:** Both mark updates as non-urgent so urgent input stays responsive. `useTransition` wraps the update in `startTransition`. `useDeferredValue` gives you a delayed copy of a value to render with.

---

### Q14. How would you fix a stale closure in an effect or callback? `Advanced`

> **Like I'm 5:** You wrote a note with yesterday's score, and you keep reading that note even though today's score is on the board.

**Answer:** The function captured an old value. Add the value to the dependency array, use the functional state update so you don't need the old value, or store the latest value in a ref when the callback must stay stable.
