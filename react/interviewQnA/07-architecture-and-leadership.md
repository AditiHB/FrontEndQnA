# 7. Architecture & Leadership

### Q1. How do you structure a large React application? `Architect`

> **Like I'm 5:** A big toy room works best with boxes labelled by feature, plus one shelf for toys everyone shares.

**Answer:** Organize by feature (components, hooks, API calls, tests together), keep shared UI and utilities in `shared`, and enforce import boundaries with lint. Use a router for pages and a query library for server state.

---

### Q2. How do you design a reusable component library? `Architect`

> **Like I'm 5:** Make LEGO bricks with standard studs, so any builder can use them, and every brick has a clear instruction card.

**Answer:** Keep components small and composable, use clear props with TypeScript types, support `className` and `ref`, use design tokens for theming, make them accessible, document them in Storybook, and version them carefully.

---

### Q3. How do you design a component API that stays flexible? `Architect`

> **Like I'm 5:** A box with slots is more useful than a box that does only one thing.

**Answer:** Prefer composition with `children` and named slots, expose a small set of meaningful props, avoid boolean prop explosions (`isPrimary`, `isSmall`, `isOutlined`), and use variants or compound components.

---

### Q4. How would you handle authentication in a React SPA? `Architect`

> **Like I'm 5:** Show your ticket at the door. Don't keep the vault key in your pocket where anyone can pick it.

**Answer:** Use secure HTTP-only cookies for sessions when possible, or short-lived access tokens with refresh handled by the backend. Keep tokens out of `localStorage` when feasible. Protect routes in the UI and enforce authorization on the API. Handle expiry with a central fetch wrapper.

---

### Q5. How do you handle errors across an app? `Architect`

> **Like I'm 5:** A school has a principal's office, a classroom alarm, and a first-aid kit. Each problem goes to the right place.

**Answer:** Use error boundaries around major sections, query error states for data, a central fetch wrapper for HTTP errors, and a logging service with source maps. Show friendly messages and retry options.

---

### Q6. How do you design a feature that needs real-time updates? `Architect`

> **Like I'm 5:** A class bell that rings whenever something changes, instead of the teacher checking every desk every minute.

**Answer:** Use WebSockets or Server-Sent Events for updates. Keep one connection per app, push events into the query cache or store, handle reconnection with backoff, and refetch after a long disconnect to catch missed events.

---

### Q7. How do you migrate a class component codebase to hooks? `Architect`

> **Like I'm 5:** Move the furniture room by room. Keep the house working while you do it.

**Answer:** Convert new components to function components with hooks, migrate leaf components first, replace lifecycle methods with effects carefully, and keep class error boundaries because they are still needed. Write tests before refactoring.

---

### Q8. How do you approach code reviews for React? `Leadership`

> **Like I'm 5:** A good reviewer checks the recipe for safety and taste, not whether the chef used a particular spoon.

**Answer:** Focus on correctness, state placement, effect dependencies, accessibility, error and loading states, and test coverage. Automate style with Prettier and lint, so reviews focus on design.

---

### Q9. How do you mentor developers new to React? `Leadership`

> **Like I'm 5:** Show them how the LEGO bricks fit together by building a small castle with them, then let them build their own.

**Answer:** Pair on a small feature, explain the mental model (state, render, effects), share a checklist for common mistakes, and encourage reading the official docs. Review with reasons, not just rules.

---

### Q10. Tell me about a React performance issue you fixed. `Leadership`

> **Like I'm 5:** Tell the story of the slow room, what you looked at first, and how the room got fast.

**Answer:** Use a STAR structure: the situation (for example, a slow dashboard), the measurement with the Profiler, the root cause (context causing re-renders), the fix, and the result with real numbers.

---

### Q11. How do you decide between adopting a library and writing your own? `Architect`

> **Like I'm 5:** Buy a ready-made bookshelf if it fits. Build your own only when your room has a shape nothing on the market fits.

**Answer:** Consider maturity, maintenance, bundle size, team familiarity, and how well it fits the problem. Prefer well-maintained libraries for hard problems like forms, dates, and data caching. Write your own for small, domain-specific logic.
