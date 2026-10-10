# 28. Debugging & DevTools

> **Like I'm 5:** Debugging is detective work. DevTools is your magnifying glass. Use it to look inside a component, see what the network sent, and find where things went wrong.

## Key concepts
- **Angular DevTools**: a browser extension for inspecting the component tree, inputs, outputs, signals, and change detection cycles.
- **Browser DevTools**: Elements, Console, Network, Performance, Memory, and Sources panels.
- **Source maps**: map minified production code back to TypeScript.

## Angular DevTools
- **Component explorer**: select a component and inspect its inputs, outputs, and signal values.
- **Profiler**: record a session to see which components were checked and how long they took.
- Use it to find unnecessary checks and slow components.

## Debugging in the console (development builds)

```js
ng.getComponent($0)           // $0 = selected element in Elements panel
ng.getOwningComponent($0)
ng.getInjector($0)
ng.applyChanges($0)
```

These helpers are available only in development mode.

## Breakpoints and logging

```ts
debugger;                              // pauses if DevTools is open
console.table(this.orders());          // readable tables
console.group('Checkout'); console.log(total); console.groupEnd();
```

For reactive streams, log in a `tap` operator, and remove the log before merging:

```ts
orders$.pipe(tap(v => console.debug('orders', v)))
```

## Signals and effects
- Use `effect` with a log to see which signals trigger a re-run.
- Check for unexpected loops: an effect that writes to a signal it reads.

## Network debugging
- Filter by `Fetch/XHR`. Check status, timing, request payload, and response.
- Use "Copy as cURL" to reproduce a failing request outside the browser.
- Simulate slow networks and offline mode in the Network panel.

## Memory leaks
1. Open the Memory panel and take a heap snapshot.
2. Navigate between screens several times.
3. Take another snapshot and compare. Look for detached DOM and growing arrays.

## Production issues
- Enable source maps for error tracking only, and upload them to the monitoring tool. Do not serve them publicly.
- Capture the user's route, the app version, and recent actions with the error.

## Common errors and causes

| Error | Usual cause |
|-------|-------------|
| `NG0304: 'x' is not a known element` | Component not in `imports` |
| `NG0303: Can't bind to 'x'` | Input missing or misspelled |
| `NG0100: ExpressionChangedAfterItHasBeenChecked` | Value changed during check |
| `NullInjectorError: No provider` | Service not provided or not `providedIn` |
| `NG0200: Circular dependency` | Services inject each other |
| `ERROR TypeError: Cannot read properties of undefined` | Data not loaded yet; use `@if` guards |

## Important points
- Reproduce the bug first, then isolate the smallest case.
- Use a debugger and breakpoints before adding console logs everywhere.
