# 5. Forms, Routing & Data Fetching

### Q1. How do you build a controlled form, and when would you use uncontrolled inputs? `Core`

> **Like I'm 5:** A controlled input is a puppet that only says what React tells it. An uncontrolled input remembers its own words until you ask.

**Answer:** Controlled inputs keep the value in state and update it with `onChange`. They make validation and dependent fields easy. Uncontrolled inputs read values with a ref or `FormData`, which is fine for simple forms and file inputs.

---

### Q2. How do you validate forms in React? `Core`

> **Like I'm 5:** Check the homework when it's handed in, and tell the student about mistakes clearly, not in a yelling voice.

**Answer:** Validate on blur or submit, show errors next to fields with accessible ARIA links, and validate again on the server. Use a schema library such as Zod with a form library such as React Hook Form.

---

### Q3. How does client-side routing work? `Core`

> **Like I'm 5:** The signboard changes the room shown, but the building stays the same, so you don't walk out the front door every time.

**Answer:** The app intercepts navigation, updates the URL with the History API, and renders the matching component without a full page reload. `Link` elements and `navigate` do this.

---

### Q4. How do you protect routes? `Core`

> **Like I'm 5:** A bouncer checks your ticket before you enter the VIP room. But the real lock on the safe is at the bank.

**Answer:** A wrapper component checks authentication and redirects to login. This improves experience only. The API must enforce access on every request.

---

### Q5. What is the difference between `loader` data fetching and fetching in `useEffect`? `Advanced`

> **Like I'm 5:** Ordering the food before you sit down means no empty plate. Waiting until you're seated means staring at an empty table first.

**Answer:** Loaders run during navigation, so data is ready before the page renders. `useEffect` fetching starts after render and can cause waterfalls and loading flashes. Loaders are better for route data.

---

### Q6. What problems does TanStack Query solve that `useEffect` does not? `Architect`

> **Like I'm 5:** A smart fridge that remembers what you bought, tells you when milk is old, and only buys what's missing.

**Answer:** Caching by query key, deduplicating requests, background refetching, retries, stale-while-revalidate behavior, mutation with invalidation, and consistent loading and error states.

---

### Q7. What is a race condition in data fetching, and how do you prevent it? `Core`

> **Like I'm 5:** You order pizza twice. The second pizza arrives first, and then the first one arrives and covers the table.

**Answer:** An older response can arrive after a newer one. Cancel the old request with `AbortController` in the effect cleanup, or ignore responses that don't match the latest key.

---

### Q8. What is the stale-while-revalidate pattern? `Advanced`

> **Like I'm 5:** Show yesterday's newspaper while a fresh one is being printed, then swap it in when it arrives.

**Answer:** The cache shows existing data immediately while a background request refreshes it. The UI updates when the new data arrives. TanStack Query uses this by default.

---

### Q9. How do you handle file uploads in React? `Advanced`

> **Like I'm 5:** Put the parcel in a box and show a progress bar until it reaches the post office.

**Answer:** Use `FormData` with `fetch` or `XMLHttpRequest`. `XMLHttpRequest` exposes upload progress events. For very large files, upload directly to storage using a presigned URL.

---

### Q10. What is the difference between `Link` and `<a href>` in a router? `Core`

> **Like I'm 5:** `<a href>` sends you out the front door and makes you walk back in. `Link` moves you to the next room without leaving the house.

**Answer:** `<a href>` causes a full page reload. `Link` updates the URL and renders the new route inside the app, keeping state and making navigation faster.
