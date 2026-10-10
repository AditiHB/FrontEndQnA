# 4. RxJS, State Management & Signals

### Q1. What is the difference between cold and hot observables? `Core`

> **Like I'm 5:** A cold observable is a movie that starts from the beginning for each viewer. A hot one is live TV, where everyone joins the same show.

**Answer:**
- **Cold**: each subscriber starts its own execution. `HttpClient` is cold: each subscribe makes a new request.
- **Hot**: the producer exists independently of subscribers. Subscribers see values from the moment they subscribe. Examples: DOM events, `Subject`, a WebSocket.
- `share()`, `shareReplay()`, or a `Subject` can turn a cold observable into a hot one.

---

### Q2. What is the difference between `Subject`, `BehaviorSubject`, and `ReplaySubject`? `Core`

> **Like I'm 5:** A Subject is a shout, and only people listening at that moment hear it. A BehaviorSubject remembers the last shout and tells new listeners. A ReplaySubject remembers several.

**Answer:**
- **`Subject`**: multicasts values. New subscribers get nothing until the next emission.
- **`BehaviorSubject`**: holds the latest value and emits it to new subscribers. Needs an initial value.
- **`ReplaySubject(n)`**: replays the last `n` values to new subscribers.
- Expose them as read-only `Observable`s (`.asObservable()`) so consumers cannot call `next()`.

---

### Q3. Explain `switchMap`, `mergeMap`, `concatMap`, and `exhaustMap`. `Core`

> **Like I'm 5:** `switchMap` throws away the old job when a new one arrives. `mergeMap` does all the jobs at once. `concatMap` lines them up. `exhaustMap` ignores new clicks while one job is running.

**Answer:** All four map a value to an inner observable. They differ in how they handle overlapping inner observables.

| Operator | Behavior | Typical use |
|----------|----------|-------------|
| `switchMap` | Cancels the previous inner, keeps the latest | Search, typeahead, route-based loading |
| `mergeMap` | Runs all in parallel | Independent writes, bulk operations |
| `concatMap` | Queues and runs one by one, in order | Ordered saves, sequential operations |
| `exhaustMap` | Ignores new outer values while one is active | Login button, prevent double submit |

**Interview example:** Using `exhaustMap` on a "Save" button stops the user from creating two orders with a double click.

---

### Q4. How do you avoid memory leaks with RxJS? `Core`

> **Like I'm 5:** When you leave a room, switch off the radio, so it doesn't keep playing in an empty room.

**Answer:**
- Use the `async` pipe in templates.
- Use `takeUntilDestroyed()` in constructors or injection context for manual subscriptions.
- Use `DestroyRef` for subscriptions created outside the constructor.
- Avoid nested `subscribe` calls. Use higher-order operators instead.

```ts
constructor() {
  this.route.params.pipe(takeUntilDestroyed()).subscribe(...);
}
```

---

### Q5. What is the `shareReplay` pitfall? `Advanced`

> **Like I'm 5:** `shareReplay` without limits keeps the water running even when nobody is listening. Add `refCount` so it turns off when everyone leaves.

**Answer:** `shareReplay()` without arguments keeps the source subscription open forever, even after all subscribers leave. This is a leak. Prefer:

```ts
shareReplay({ bufferSize: 1, refCount: true })
```

With `refCount: true`, the source is unsubscribed when the last subscriber leaves.

---

### Q6. How do you convert between signals and observables? `Core`

> **Like I'm 5:** A signal is a box you look at, and an observable is a stream. `toSignal` puts the stream's latest drop into a box. `toObservable` does the reverse.

**Answer:**
```ts
// Observable -> signal
users = toSignal(this.api.getUsers(), { initialValue: [] });

// Signal -> observable
search$ = toObservable(this.searchTerm);
```

`toSignal` subscribes immediately and unsubscribes on destroy. It must be called in an injection context (constructor or field initializer).

---

### Q7. How do you manage application state in a large app? Signals, services, or NgRx? `Architect`

> **Like I'm 5:** For a small house, use simple boxes. For a big house with many people, use one shared notebook, like NgRx.

**Answer:** Choose the simplest tool that fits.

- **Local component state**: a signal in the component.
- **Feature state shared by a few components**: a service with signals (`private _items = signal<Item[]>([])` and a `readonly items = this._items.asReadonly()`).
- **Complex, many-team, time-travel-debuggable state**: NgRx Store with actions, reducers, effects, and selectors. Or NgRx SignalStore for a lighter approach.
- **Server state** (caching, refetching, stale data): specialized tools such as TanStack Query (has an Angular adapter) or a custom cache service in `data-access`.

**Trade-off to mention:** NgRx adds boilerplate and a learning curve, but gives predictability, auditability, and good devtools. For small apps it is overkill.

---

### Q8. Explain the NgRx flow. `Advanced`

> **Like I'm 5:** You tell the store what happened (an action). A worker does the slow job (an effect). A rule writes the new state (a reducer). You read the notebook through a window (a selector).

**Answer:**
1. A component dispatches an **action** (`loadOrders()`).
2. An **effect** listens for the action, calls the API, and dispatches `loadOrdersSuccess` or `loadOrdersFailure`.
3. A **reducer** (pure function) returns the new state for those actions.
4. **Selectors** (memoized) read the state for components.

```ts
export const loadOrders$ = createEffect(
  (actions$ = inject(Actions), api = inject(OrderApi)) =>
    actions$.pipe(
      ofType(OrderActions.load),
      switchMap(() => api.getAll().pipe(
        map(orders => OrderActions.loadSuccess({ orders })),
        catchError(error => of(OrderActions.loadFailure({ error })))
      ))
    ),
  { functional: true }
);
```

---

### Q9. How do you handle errors in an effect so the stream does not die? `Advanced`

> **Like I'm 5:** If a worker drops a job and breaks, it stops working for good. Catch the problem inside the job, so the worker keeps going.

**Answer:** Put `catchError` **inside** the inner observable (as shown above), not on the outer action stream. An error on the outer stream terminates the effect, and the app stops responding to that action.

---

### Q10. What is a memoized selector and why does it matter? `Advanced`

> **Like I'm 5:** A memoized selector remembers its last answer. If nothing it depends on changed, it gives back the same answer without working again.

**Answer:** `createSelector` caches the last result. If the input state slices do not change, the selector returns the same reference. This helps `OnPush` components and avoids expensive recomputation (for example, filtering 10,000 rows).

---

### Q11. What is the difference between `combineLatest`, `forkJoin`, `zip`, and `withLatestFrom`? `Advanced`

> **Like I'm 5:** `combineLatest` shows the latest of each. `forkJoin` waits until all are finished. `withLatestFrom` peeks at the latest value when you press a button.

**Answer:**
- `combineLatest`: emits whenever any source emits, after all have emitted at least once. Good for combining live filters.
- `forkJoin`: waits for all sources to **complete**, then emits the last values. Good for parallel HTTP calls that run once.
- `zip`: pairs values by index. Rarely the right choice.
- `withLatestFrom`: emits when the main source emits, using the latest value of the secondary source. Good for "submit with current form value".

---

### Q12. How do you handle race conditions in RxJS? `Advanced`

> **Like I'm 5:** Two answers can arrive in the wrong order. `switchMap` keeps only the newest request's answer.

**Answer:** A race happens when an older response arrives after a newer one. Use `switchMap` so only the latest request's result is used. For ordered writes, use `concatMap`. For optimistic UI updates, store a request version or ID and ignore stale responses.

---

### Q13. What is an optimistic update, and how do you roll it back? `Architect`

> **Like I'm 5:** Show the change right away. If the server says no, put the old thing back and say sorry.

**Answer:** Update the UI immediately, then send the request. If it fails, restore the previous state.

```ts
const previous = this.items();
this.items.update(list => list.map(i => i.id === id ? { ...i, done: true } : i));
this.api.complete(id).subscribe({
  error: () => {
    this.items.set(previous);
    this.toast.error('Could not save, please try again');
  }
});
```

Use this for low-risk operations (toggles, likes). For payments or irreversible actions, wait for the server response.

---

### Q14. What is a Signal Store? `Advanced`

> **Like I'm 5:** A Signal Store is a small toy box with its own state and buttons, with less paperwork than NgRx.

**Answer:** `@ngrx/signals` provides `signalStore()` with state, computed values, and methods, in a structure similar to a service. It uses signals internally and avoids the action, reducer, and effect boilerplate. It is a good middle ground between services and full NgRx.
