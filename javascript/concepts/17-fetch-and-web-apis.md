# 17. Fetch & Web APIs

> **Like I'm 5:** `fetch` is a messenger you send to a faraway house, asking for something. The browser also gives you other helpers: a notebook that remembers things (`localStorage`), a timer that tells you when something is visible on the screen, and a cancel button for messages.

## fetch

```js
async function getUsers(signal) {
  const res = await fetch('/api/users', {
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);   // timeout after 5 seconds
const users = await getUsers(controller.signal);
```

- `fetch` only rejects on network failure. Check `res.ok` for HTTP errors.
- Send JSON with `body: JSON.stringify(data)` and `'Content-Type': 'application/json'`.

## Storage

```js
localStorage.setItem('theme', 'dark');   // persists across visits
localStorage.getItem('theme');           // 'dark'
sessionStorage.setItem('draft', '...');  // cleared when the tab closes
```

- Strings only. Use `JSON.stringify` for objects.
- Not secure for tokens, because any script on the page can read it.

## Observing the page

```js
const io = new IntersectionObserver(entries => {
  entries.forEach(e => e.isIntersecting && load(e.target));
});
io.observe(document.querySelector('#footer'));

const ro = new ResizeObserver(entries => { /* react to size changes */ });
ro.observe(document.querySelector('#panel'));
```

## Other useful APIs
- `URL` and `URLSearchParams` for building and reading URLs.
- `structuredClone` for deep copies.
- `crypto.randomUUID()` for IDs.
- `Intl.NumberFormat` and `Intl.DateTimeFormat` for locale-aware formatting.
- `Web Workers` to run heavy work off the main thread.

```js
const worker = new Worker('heavy.js');
worker.postMessage({ data: bigArray });
worker.onmessage = e => console.log(e.data);
```

## Important points
- Always set a timeout or abort for network calls.
- Don't store secrets in `localStorage`.
- Use `Intl` for formatting numbers, currency, and dates, not string concatenation.
