# 15. Error Handling

> **Like I'm 5:** When you trip while running, a safety net catches you. `try` is the running part, `catch` is the safety net, and `finally` is the cleanup crew that comes no matter what.

## try, catch, finally

```js
function parseConfig(text) {
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Bad config:', err.message);
    return {};
  } finally {
    console.log('parse attempted');
  }
}
```

## Error types

```js
new Error('generic');
new TypeError('wrong type');
new RangeError('out of range');
new SyntaxError('bad syntax');
```

## Custom errors

```js
class NotFoundError extends Error {
  constructor(resource, id) {
    super(`${resource} ${id} not found`);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

try {
  throw new NotFoundError('User', 7);
} catch (err) {
  if (err instanceof NotFoundError) console.log(err.status);
}
```

## Error cause

```js
try {
  await loadUser();
} catch (err) {
  throw new Error('Could not start session', { cause: err });
}
```

`cause` keeps the original error, so you don't lose the root problem.

## Unhandled errors

```js
window.addEventListener('error', e => log(e.error));
window.addEventListener('unhandledrejection', e => log(e.reason));
```

Use these as a last-resort safety net and report to a monitoring tool.

## Important points
- Catch only what you can handle. Let other errors bubble up.
- Never swallow errors silently: at least log them.
- Throw `Error` objects, not strings, so you get a stack trace.
- Validate input early and fail with a clear message.
