# 30. Security

> **Like I'm 5:** The frontend is a front door that everyone can see. The real lock must be on the server. Never hide secret keys in the app, because anyone can peek inside.

> **Learn it by doing:** build this step by step in the tutorial: [Chapter 26: Security](../tutorial/26-security.md).

## Key concepts
- Angular protects against many common web attacks by default, but application code can still introduce vulnerabilities.
- The frontend is **not** a security boundary. Every rule must be enforced by the server.

## Cross-site scripting (XSS)
- Angular sanitizes values bound to `innerHTML`, `href`, `style`, and similar properties.
- Avoid bypassing the sanitizer:

```ts
// Dangerous unless the content is trusted and sanitized on the server
this.safe = this.sanitizer.bypassSecurityTrustHtml(userContent);
```

- For rich text from users, sanitize on the server (for example OWASP Java HTML Sanitizer) and render with `[innerHTML]`.

## Cross-site request forgery (CSRF)
- `HttpClient` sends the `X-XSRF-TOKEN` header from the `XSRF-TOKEN` cookie for relative URLs.
- The server must issue the cookie and validate the header.
- Stateless bearer-token APIs (no cookies) generally do not need CSRF protection.

## Authentication and tokens

```ts
// Access token in memory, refresh token in an HttpOnly cookie set by the server
private accessToken = signal<string | null>(null);
```

| Storage | Risk |
|---------|------|
| Memory | Lost on refresh, safest from XSS |
| `localStorage` | Readable by any injected script |
| HttpOnly cookie | Not readable by JavaScript, needs CSRF protection |

Use OAuth 2.0 Authorization Code flow with PKCE for SPAs. Avoid the implicit flow.

## Authorization
- Route guards hide screens. They do not protect data.
- Enforce permissions on every API endpoint (for example `@PreAuthorize` in Spring) and check resource ownership to prevent IDOR.

## Content Security Policy

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; img-src 'self' data:; connect-src 'self' https://api.example.com
```

- Avoid inline scripts and `eval`.
- Angular production builds work with a strict CSP. Test with `Content-Security-Policy-Report-Only` first.

## Other headers
- `X-Frame-Options: DENY` or `frame-ancestors 'none'` to prevent clickjacking.
- `Strict-Transport-Security` to enforce HTTPS.
- `Referrer-Policy: strict-origin-when-cross-origin`.

## Secrets
- Never put API secrets or private keys in the frontend bundle or in `environment.ts`.
- Use a backend-for-frontend (BFF) to hold client secrets.

## Dependencies
- Run `npm audit` in CI, and use Dependabot or Renovate.
- Commit lock files. Review new packages before adding them.

## Important points
- Sanitize and validate input on the server, and encode output.
- Avoid `window.location` or `eval` with user-controlled strings.
- Keep Angular and its dependencies updated, because security fixes are released regularly.
