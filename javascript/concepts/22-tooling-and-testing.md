# 22. Tooling & Testing

> **Like I'm 5:** Tooling is your helper team. npm is the shop that gives you parts. ESLint is the hall monitor. Prettier is the neat-handwriting coach. A bundler is the packing robot. Tests are your homework check before you show it to the class.

## npm and package.json

```bash
npm init -y
npm install lodash-es           # runtime dependency
npm install -D vitest eslint    # dev dependency
npm ci                          # clean, reproducible install in CI
npx vitest run                  # run a local binary
```

```json
{
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

## ESLint and Prettier

- ESLint finds bugs and style problems (`no-unused-vars`, `eqeqeq`, `no-floating-promises` with TypeScript).
- Prettier formats code. Let it decide spacing and quotes, so reviews focus on logic.

## Bundlers

- **Vite**: fast dev server and build, a common default.
- **esbuild**: very fast bundler, often used under other tools.
- **webpack**: mature and configurable, used in many older projects.

Bundlers combine modules, remove unused code, and minify.

## Testing

```js
// sum.test.js (Vitest or Jest syntax)
import { describe, it, expect } from 'vitest';
import { sum } from './sum.js';

describe('sum', () => {
  it('adds numbers', () => {
    expect(sum(1, 2)).toBe(3);
  });

  it('handles empty input', () => {
    expect(sum()).toBe(0);
  });
});
```

Test types:
- **Unit**: one function.
- **Integration**: several modules together.
- **End-to-end**: a real browser, with Playwright or Cypress.

## Mocking

```js
import { vi } from 'vitest';

const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 1 }) });
vi.stubGlobal('fetch', fetchMock);
```

## Important points
- Commit the lock file and use `npm ci` in CI.
- Keep dev tools in `devDependencies`.
- Test behavior, not implementation details.
