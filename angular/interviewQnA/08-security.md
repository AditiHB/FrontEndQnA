# 8. Security

### Q1. How does Angular protect against XSS? `Core`

> **Like I'm 5:** Angular cleans user text before showing it, so bad scripts can't run.

**Answer:** Angular treats all bound values as untrusted. Interpolation (`{{ }}`) and property binding (`[innerHTML]`) are sanitized automatically. Dangerous values such as `javascript:` URLs or unsafe HTML are removed.

**Interview point:** Angular's sanitizer is a safety net, not a license. Avoid `DomSanitizer.bypassSecurityTrustHtml()` unless the HTML comes from a trusted source and is sanitized server-side.

---

### Q2. What is the difference between `[innerHTML]` and `{{ }}`? `Core`

> **Like I'm 5:** `{{ }}` shows text only. `[innerHTML]` lets HTML run, but Angular cleans it first.

**Answer:** `{{ value }}` always displays text. `[innerHTML]` parses HTML, and Angular sanitizes it. For rich content from a CMS, prefer a sanitizer library on the server (for example, OWASP Java HTML Sanitizer in Spring) and keep the frontend sanitizer enabled.

---

### Q3. How does CSRF protection work with `HttpClient`? `Advanced`

> **Like I'm 5:** A CSRF token is a secret handshake. The server gives it to you and checks it with every change you make.

**Answer:** `HttpClient` supports the XSRF pattern. It reads a cookie (default `XSRF-TOKEN`) and sends the value in an `X-XSRF-TOKEN` header for mutating requests, but only for relative URLs. The server must issue the cookie and validate the header. Spring Security does this with `CookieCsrfTokenRepository`.

**Important:** if you use a JWT in the `Authorization` header and no cookies, CSRF is generally not a risk, and you can disable CSRF in Spring for stateless APIs. If you use cookie-based authentication, keep CSRF protection on.

---

### Q4. Where should you store tokens, and what is the trade-off? `Architect`

> **Like I'm 5:** Keep the access token in memory and the refresh key in a locked cookie, which scripts can't read.

**Answer:** See the routing and HTTP section. The safest pattern is an access token in memory, and a refresh token in an HttpOnly, Secure, SameSite cookie, with a backend endpoint for refresh. `localStorage` is convenient but readable by any XSS payload.

---

### Q5. What is a Content Security Policy, and how does it help? `Advanced`

> **Like I'm 5:** CSP is a guest list for scripts. Only scripts from approved places are allowed to run.

**Answer:** A CSP header tells the browser which scripts, styles, and connections are allowed. Example: `script-src 'self'`. This blocks inline scripts and injected third-party scripts, which reduces the impact of XSS. Angular's production build works with a strict CSP, but inline styles and `eval` must be avoided. Configure CSP on the server or CDN, and test it in report-only mode first.

---

### Q6. Are route guards a security feature? `Core`

> **Like I'm 5:** A route guard is a sign on the door, not a lock. The real lock must be on the server.

**Answer:** No. Route guards control what the UI shows. Anyone can change the JavaScript in the browser or call the API directly. Authorization must be enforced on the backend for every endpoint, for example with `@PreAuthorize` in Spring Security, and checked against the resource owner, not only the role. This prevents **IDOR** (insecure direct object reference) attacks.

---

### Q7. How do you protect against clickjacking? `Core`

> **Like I'm 5:** Clickjacking hides your page inside someone else's page to trick people into clicking. A header tells browsers not to allow that.

**Answer:** Send `X-Frame-Options: DENY` or `Content-Security-Policy: frame-ancestors 'none'` from the server. Spring Security sends `X-Frame-Options` by default.

---

### Q8. How do you secure third-party dependencies? `Core`

> **Like I'm 5:** Check your third-party packages for known problems, and keep them updated.

**Answer:** Run `npm audit` and a tool such as Dependabot or Renovate in CI. Lock versions with `package-lock.json`. Review new packages before adding them, and remove unused ones. Use Software Composition Analysis (SCA) for both npm and Maven dependencies.

---

### Q9. What should you never put in an Angular application? `Core`

> **Like I'm 5:** Never put secret keys in the app, because anyone can open it and read them.

**Answer:** API secrets, private keys, client secrets for OAuth, and admin-only URLs or logic. Everything in the JavaScript bundle can be read by a user. Use a backend-for-frontend (BFF) pattern when an OAuth client secret is needed.

---

### Q10. How do you handle authentication with OAuth2 / OpenID Connect in Angular? `Architect`

> **Like I'm 5:** Use the proper login flow with PKCE, so only the right app can get a token.

**Answer:** For SPAs, use the **Authorization Code flow with PKCE**, not the implicit flow (which is deprecated). Use a library such as `angular-auth-oidc-client`, or let a BFF handle tokens so the browser only holds a session cookie. Validate tokens on the Java side with Spring Security's OAuth2 Resource Server support.
