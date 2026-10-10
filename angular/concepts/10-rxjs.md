# 10. RxJS

> **Like I'm 5:** RxJS is a water pipe that carries data over time. Operators are valves that change the water on its way through. `subscribe` turns the tap on, and `unsubscribe` turns it off so nothing leaks.

> **Learn it by doing:** build this step by step in the tutorial: [Chapter 12: RxJS](../tutorial/12-rxjs.md).

## Key concepts
- **Observable**: a stream of values over time. Lazy: nothing happens until a subscriber subscribes.
- **Observer**: `next`, `error`, `complete` callbacks.
- **Operator**: a function that transforms a stream (`map`, `filter`, `switchMap`).
- **Subject**: an observable that is also an observer; it multicasts values.

## Creating and subscribing

```ts
import { of, interval, fromEvent } from 'rxjs';

of(1, 2, 3).subscribe(v => console.log(v));
interval(1000).subscribe(n => console.log(n));
fromEvent(document, 'click').subscribe(e => console.log(e));
```

## Common operators

```ts
import { map, filter, tap, debounceTime, distinctUntilChanged, switchMap, catchError, retry, take, shareReplay } from 'rxjs';

search$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  filter(term => term.length >= 2),
  switchMap(term => api.search(term).pipe(
    retry(2),
    catchError(() => of([]))
  )),
  shareReplay({ bufferSize: 1, refCount: true }),
).subscribe(results => this.results.set(results));
```

## Higher-order mapping operators

| Operator | Behavior |
|----------|----------|
| `switchMap` | Cancel previous inner, use latest |
| `mergeMap` | Run all in parallel |
| `concatMap` | Run one after another, in order |
| `exhaustMap` | Ignore new values while busy |

## Combination operators

```ts
combineLatest([filters$, page$])   // emit on any change, after each has emitted
forkJoin([a$, b$])                 // emit once when all complete
withLatestFrom(user$)              // sample the latest value of another stream
merge(a$, b$)                      // interleave
```

## Subjects

```ts
const refresh$ = new Subject<void>();
const orders$ = refresh$.pipe(startWith(undefined), switchMap(() => api.orders()));
refresh$.next();

const state$ = new BehaviorSubject<State>(initial);   // current value available
```

Expose read-only streams with `asObservable()`.

## Unsubscribe and cleanup

```ts
constructor() {
  this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(p => this.load(p.get('id')));
}
```

Use the `async` pipe in templates. It handles cleanup automatically.

## Error handling

```ts
api.save(data).pipe(
  retry({ count: 2, delay: 500 }),
  catchError(err => {
    this.toast.error(err.message);
    return EMPTY;
  })
).subscribe();
```

Keep `catchError` inside the inner observable so the outer stream keeps working.

## Testing

Marble diagrams with `TestScheduler` make time-based operators testable without real delays.

```ts
new TestScheduler((a, e) => {
  a('a-b|').pipe(debounceTime(2)).subscribe();
});
```

## Important points
- Avoid nested subscriptions. Use higher-order operators.
- `shareReplay` without `refCount` can leak. Use `{ bufferSize: 1, refCount: true }`.
- Prefer signals for state and RxJS for asynchronous events and cancellation.
