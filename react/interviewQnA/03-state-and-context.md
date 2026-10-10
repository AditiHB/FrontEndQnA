# 3. State Management & Context

### Q1. How do you decide where state should live? `Core`

> **Like I'm 5:** Put the toy where the kids who play with it can reach it, not in the teacher's cupboard.

**Answer:** Keep state in the lowest component that needs it. Lift it up only when siblings share it. Move it to context or a store only when many distant components need it.

---

### Q2. What is prop drilling, and how do you fix it? `Core`

> **Like I'm 5:** Passing a cookie down a long line of kids to reach one child at the end.

**Answer:** Passing props through layers that don't use them. Fixes: component composition (`children`), context for widely shared values, or a store for frequently changing state.

---

### Q3. What are the performance problems with Context? `Advanced`

> **Like I'm 5:** When the cookie jar changes, every kid who looks at it goes to get a new cookie, even if they only wanted a different kind.

**Answer:** All consumers re-render when the provider value changes, even when they use only a part of it. Mitigations: split contexts by change frequency, memoize the value, or move the state to a store with selectors.

---

### Q4. Context or Redux/Zustand? How do you choose? `Architect`

> **Like I'm 5:** A cookie jar is good for one kind of snack that rarely changes. A snack store with shelves lets everyone grab exactly what they need.

**Answer:** Context is good for stable, app-wide values such as theme, locale, and the current user. Stores are better for frequently changing, shared client state, since components can subscribe to slices. For server data, use a query library.

---

### Q5. What is Zustand, and why choose it? `Core`

> **Like I'm 5:** A small shared notebook with no complicated rules. Each person reads only the page they need.

**Answer:** Zustand is a small store library with a hook-based API, no providers, and selector-based subscriptions, so components re-render only for the slices they read.

---

### Q6. What is Redux Toolkit, and what problems does it solve? `Advanced`

> **Like I'm 5:** A rulebook with a helper who writes the boring parts of the rules for you.

**Answer:** Redux Toolkit reduces boilerplate with `createSlice` and `configureStore`, uses Immer for safe updates, and includes good defaults and devtools. It suits large teams that value strict conventions and middleware.

---

### Q7. Client state vs server state: what is the difference? `Core`

> **Like I'm 5:** Your own drawing is client state. A library book is server state: it belongs to someone else, may be out of date, and you must return it or renew it.

**Answer:** Client state is owned by the UI (open panels, selections). Server state comes from an API, can be stale, and needs caching, refetching, and invalidation. Query libraries like TanStack Query handle server state well.

---

### Q8. How do you handle optimistic updates? `Architect`

> **Like I'm 5:** You write "ordered" on the board right away. If the order fails, you erase it and write a sorry note.

**Answer:** Update the cache or state immediately, send the request, and roll back on error using the previous snapshot. With TanStack Query, use `onMutate`, `onError`, and `onSettled`. React 19 offers `useOptimistic`.

---

### Q9. What is the difference between a reducer and a store? `Advanced`

> **Like I'm 5:** A reducer is the rulebook for one game. A store is the whole classroom with many games and the notebook that keeps them all.

**Answer:** A reducer is a pure function that computes state from an action. A store holds state and provides subscriptions. Redux uses reducers inside a store, and Zustand uses functions that call `set`.

---

### Q10. How do you structure global state in a large app? `Architect`

> **Like I'm 5:** Put toys in labelled boxes by category, not in one big pile.

**Answer:** Separate by domain (cart, user, filters), keep state normalized (IDs and lookup maps), derive values with selectors, and keep server data in a query cache. Limit global state to what truly needs to be global.
