# 7. Performance, Security & Tooling

### Q1. How do you find a memory leak in a JavaScript app? `Advanced`

> **Like I'm 5:** Take a photo of your room, play for a while, take another photo, and compare. The things that keep piling up are the leaks.

**Answer:** Use Chrome DevTools Memory panel: take heap snapshots before and after repeated actions, compare them, and look for growing retained objects and detached DOM nodes. Common causes are listeners, timers, and global caches.

---

### Q2. What is the difference between debounce and throttle? `Core`

> **Like I'm 5:** Debounce waits for quiet before answering. Throttle answers at a steady pace no matter how much noise there is.

**Answer:** Debounce runs after input stops for a set time. Throttle runs at most once per interval. Debounce suits search boxes, throttle suits scroll and resize.

---

### Q3. How do you prevent XSS? `Core`

> **Like I'm 5:** Never let strangers' notes be read as instructions. Treat their words as words.

**Answer:** Insert user content with `textContent`, avoid `innerHTML` with untrusted data, use framework templates that escape by default, sanitize HTML with DOMPurify when needed, and set a Content Security Policy.

---

### Q4. What is prototype pollution, and how do you prevent it? `Advanced`

> **Like I'm 5:** Someone sneaks a sticker into the family's shared rule book, and now every family member follows the sticker's rule.

**Answer:** Unsafe recursive merges can set `__proto__` or `constructor.prototype` properties, changing `Object.prototype` for all objects. Prevent it by blocking those keys, using `Map` for dictionaries, or using `Object.create(null)` for lookup objects.

---

### Q5. Why should you avoid `eval`? `Core`

> **Like I'm 5:** `eval` is a machine that runs any text you give it as code, even text from a stranger.

**Answer:** `eval` runs arbitrary code with access to the scope. It is slow, hard to debug, and dangerous with user input. It is also blocked by strict Content Security Policies.

---

### Q6. How do you measure performance in a browser? `Core`

> **Like I'm 5:** Use a stopwatch on the real kitchen, not just the recipe book.

**Answer:** Use the Performance panel and Lighthouse for lab tests, `performance.mark` and `measure` for code-level timing, and real user monitoring for Core Web Vitals like LCP, INP, and CLS.

---

### Q7. What is the difference between `npm install` and `npm ci`? `Core`

> **Like I'm 5:** `npm install` can change the shopping list as it goes. `npm ci` follows the exact list in the lock file, every time.

**Answer:** `npm ci` deletes `node_modules` and installs exactly what `package-lock.json` specifies. It's faster and reproducible, so it's the choice in CI.

---

### Q8. What do bundlers do? `Core`

> **Like I'm 5:** The packing robot takes many small boxes, removes the empty ones, and wraps them into a few big boxes for the trip.

**Answer:** Bundlers resolve modules, combine them, remove unused code (tree shaking), minify, and split code into chunks. Examples are Vite, esbuild, and webpack.

---

### Q9. What is tree shaking? `Advanced`

> **Like I'm 5:** You shake a tree, and the dead leaves fall off. Only the living leaves stay in your bag.

**Answer:** Tree shaking removes exports that are never imported. It works best with ES modules and when packages declare `"sideEffects": false`.

---

### Q10. What should you check before shipping a JavaScript change? `Architect`

> **Like I'm 5:** Before you serve the dish, taste it, check the temperature, and make sure no hair is in it.

**Answer:** Run lint, unit and integration tests, check the production build size, test critical flows end to end, check for security issues with `npm audit`, verify accessibility, and monitor errors and performance after release.
