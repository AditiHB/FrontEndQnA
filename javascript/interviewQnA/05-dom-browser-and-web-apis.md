# 5. DOM, Browser & Web APIs

### Q1. What is the DOM? `Core`

> **Like I'm 5:** The DOM is a family tree of the page. Each part of the page is a family member that you can find, change, or give a new toy.

**Answer:** The Document Object Model is a tree of objects representing the HTML. JavaScript reads and updates it through APIs such as `querySelector`, `textContent`, and `classList`.

---

### Q2. What is event bubbling and capturing? `Core`

> **Like I'm 5:** When you press a bell in a room, the sound travels up through the whole house, from the room to the hall to the roof.

**Answer:** An event is dispatched in three phases: capture (from the window down to the target), target, and bubble (from the target back up). Listeners run in these phases, and `stopPropagation` stops the travel.

---

### Q3. What is event delegation, and why use it? `Core`

> **Like I'm 5:** Instead of putting a bell in every room, you put one bell in the hall. When any room rings, the hall hears it and knows which room it was.

**Answer:** Attach one listener to a parent and use `event.target` (often with `closest`) to find the clicked child. It works for items added later and uses less memory.

---

### Q4. What is the difference between `innerHTML` and `textContent`? `Core`

> **Like I'm 5:** `innerHTML` takes the words and turns any picture tags into real pictures. `textContent` just writes the words, so nobody can sneak in a tag.

**Answer:** `innerHTML` parses HTML and can execute injected scripts through event attributes, which causes XSS. `textContent` inserts plain text safely.

---

### Q5. What is the difference between `localStorage`, `sessionStorage`, and cookies? `Core`

> **Like I'm 5:** `localStorage` is a notebook that stays in the house. `sessionStorage` is a notebook that gets thrown away when you leave the tab. Cookies are little notes that travel with every visit to the house.

**Answer:** `localStorage` persists until cleared. `sessionStorage` lasts for the tab's lifetime. Cookies are sent to the server on each request and can be `HttpOnly` and `Secure`, which storage cannot. Don't store secrets in web storage.

---

### Q6. How does `fetch` differ from `XMLHttpRequest`? `Core`

> **Like I'm 5:** `fetch` is a modern messenger with a clear envelope. `XMLHttpRequest` is the old messenger who shouts updates through callbacks.

**Answer:** `fetch` is promise-based, simpler, and works with streams. It doesn't reject on HTTP error statuses, so check `res.ok`. `XMLHttpRequest` is callback-based and still supported.

---

### Q7. How do you cancel a fetch and avoid race conditions in UI code? `Advanced`

> **Like I'm 5:** If you ask for pizza twice and the second pizza arrives first, you should eat the second and throw away the first.

**Answer:** Use `AbortController` to cancel the previous request when a new one starts, or track a request ID and ignore stale responses.

---

### Q8. What are `IntersectionObserver` and `ResizeObserver` used for? `Advanced`

> **Like I'm 5:** An intersection observer is a guard who tells you when a picture walks into view. A resize observer tells you when a picture gets bigger or smaller.

**Answer:** `IntersectionObserver` reports when an element enters or leaves the viewport, used for lazy loading and infinite scroll. `ResizeObserver` reports size changes of an element, used for responsive layouts.

---

### Q9. What is the difference between a Web Worker and the main thread? `Advanced`

> **Like I'm 5:** The main thread is the single cook in the kitchen. A Web Worker is a second cook in a separate kitchen who can cook heavy food without slowing the main cook.

**Answer:** Workers run in a separate thread with no DOM access. They communicate with `postMessage`. Use them for CPU-heavy work such as parsing big files.

---

### Q10. Why does layout thrashing hurt performance? `Advanced`

> **Like I'm 5:** If you keep measuring and painting one wall, then measuring again, then painting again, the painter has to stop and redo the work every time.

**Answer:** Reading a layout property (like `offsetHeight`) after changing styles forces the browser to recalculate layout synchronously. Batch reads first, then writes, or use `requestAnimationFrame`.
