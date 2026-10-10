# 9. Modules

> **Like I'm 5:** A module is a lunchbox with a sticker that says what you're sharing. Everything inside stays private unless you put it in the "share" slot (`export`). Your friend opens your lunchbox with `import`.

## Named and default exports

```js
// math.js
export const PI = 3.14159;
export function area(r) {
  return PI * r * r;
}
export default function describe() {
  return 'math helpers';
}

// app.js
import describe, { PI, area } from './math.js';
import * as math from './math.js';
```

## Re-exporting

```js
// index.js (barrel file)
export { area, PI } from './math.js';
export * from './format.js';
```

## Dynamic import (load on demand)

```js
button.addEventListener('click', async () => {
  const { default: chart } = await import('./chart.js');
  chart.draw();
});
```

Dynamic imports return a promise and are a common way to split code.

## ES modules vs CommonJS

| | ES modules | CommonJS |
|--|-----------|----------|
| Syntax | `import` / `export` | `require` / `module.exports` |
| Loading | Static, analyzable | Dynamic, at runtime |
| Default in browsers | Yes (`type="module"`) | No |
| Strict mode | Always | Not by default |

In Node.js, set `"type": "module"` in `package.json` to use ES modules.

## Top-level await

```js
// only inside ES modules
const config = await fetch('/config.json').then(r => r.json());
```

## Important points
- Modules run in strict mode and have their own scope.
- Imports are live bindings: if the exporter changes the value, importers see the new one.
- Avoid circular imports. They cause values to be undefined at the wrong time.
