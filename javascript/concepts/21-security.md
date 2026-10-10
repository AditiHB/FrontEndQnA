# 21. Security

> **Like I'm 5:** A stranger who sneaks a fake note into your lunch box is an attacker. Your job is to read notes carefully, never follow instructions from a stranger's note, and keep the lunch box closed.

## Cross-site scripting (XSS)

```js
// Dangerous: user input becomes HTML
el.innerHTML = userComment;

// Safe: treated as text
el.textContent = userComment;
```

If you must render HTML, sanitize it with a library such as DOMPurify.

## Other common risks

```js
// Avoid eval and new Function with user data
eval(userInput);                      // never

// Avoid javascript: URLs
a.href = userUrl;                     // validate that it starts with https:
```

## Prototype pollution

Merging untrusted objects can overwrite `__proto__` and affect every object.

```js
// Dangerous merge
function merge(target, source) {
  for (const key in source) {
    target[key] = source[key];          // key may be '__proto__'
  }
}
```

Fix by skipping `__proto__`, `constructor`, and `prototype`, or use `Object.create(null)` for dictionaries, or `Map`.

## Content Security Policy

Set a header such as:

```
Content-Security-Policy: default-src 'self'; script-src 'self'
```

This blocks inline scripts and scripts from unknown domains, which limits XSS damage.

## Storage and secrets
- Don't store tokens in `localStorage` if you can avoid it. Use HttpOnly cookies set by the server.
- Never put secrets in front-end code. Anyone can read the bundle.

## Dependencies
- Run `npm audit`, and keep packages updated.
- Review new packages before adding them.

## Important points
- Treat all user input and all server responses as untrusted until validated.
- Prefer `textContent`, safe DOM APIs, and framework templates that escape by default.
- Set security headers on the server.
