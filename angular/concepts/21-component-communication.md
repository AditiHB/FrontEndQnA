# 21. Component Communication

## Key concepts
Choose the simplest mechanism that matches the relationship between components:

| Relationship | Mechanism |
|--------------|-----------|
| Parent → child | `input()` / `@Input` |
| Child → parent | `output()` / `@Output` |
| Two-way (parent ↔ child) | `model()` / `[(...)]` |
| Parent reads child | `viewChild()` / `@ViewChild` |
| Parent passes markup | Content projection (`ng-content`) |
| Siblings or distant components | Shared service (signals or Subject) |
| Across routes | Router params, query params, route state, or a shared service |
| App-wide state | Store (NgRx or a signal store) |

## Parent to child and child to parent

```ts
// child
export class RatingComponent {
  value = input(0);
  max = input(5);
  changed = output<number>();

  select(n: number) { this.changed.emit(n); }
}

// parent template
<app-rating [value]="product.rating" (changed)="updateRating(product.id, $event)" />
```

## Two-way binding with `model()`

```ts
// child
value = model(0);
// parent
<app-counter [(value)]="quantity" />
```

## Calling child methods

```ts
@ViewChild(ChartComponent) chart!: ChartComponent;      // decorator
chart = viewChild.required(ChartComponent);             // signal query

refresh() { this.chart().redraw(); }
```

## Shared service

```ts
@Injectable({ providedIn: 'root' })
export class SelectionService {
  private _selected = signal<string | null>(null);
  readonly selected = this._selected.asReadonly();
  select(id: string) { this._selected.set(id); }
}
```

Components on different parts of the page inject this service, read `selected()`, and call `select()`.

## Event bus with RxJS (use sparingly)

```ts
@Injectable({ providedIn: 'root' })
export class EventBus {
  private events = new Subject<AppEvent>();
  events$ = this.events.asObservable();
  emit(e: AppEvent) { this.events.next(e); }
}
```

Prefer a typed service with explicit methods over a generic bus, which is harder to trace.

## Passing data through routes

```ts
// navigate with state (not persisted on refresh)
this.router.navigate(['/orders', id], { state: { order } });

// read it
const order = history.state.order;   // or router.currentNavigation()?.extras.state
```

Do not rely on navigation state for data that must survive a page refresh. Use a route parameter and fetch the data instead.

## Template reference across components

```html
<app-search #search />
<button (click)="search.clear()">Clear</button>
```

## Important points
- Keep data flowing down and events flowing up. Avoid components reaching into each other's internals.
- Use typed outputs and inputs so the compiler checks contracts.
- Remember that services hold state for their injector scope. A component-level service is not shared with siblings.
