# 16. State Management

> **Like I'm 5:** State is what the app remembers right now. A store is one shared notebook, so the app does not have to keep every memory in a different place.

> **Learn it by doing:** build this step by step in the tutorial: [Chapter 18: State management](../tutorial/18-state-management.md).

## Key concepts
- **Local state**: owned by one component (signal in the component).
- **Shared state**: owned by a service and read by several components.
- **Global store**: a central, predictable container such as NgRx.
- **Server state**: data loaded from the API that needs caching, refresh, and invalidation.

## Choosing an approach

| Need | Approach |
|------|----------|
| UI toggle, form view state | Signal in component |
| Data shared by a feature | Service with private writable signals |
| Complex flows, many developers, audit | NgRx Store (actions, reducers, effects, selectors) |
| Lighter store with structure | NgRx SignalStore |
| Cached API data | Service with `shareReplay` or a query library |

## Signal service store

```ts
@Injectable({ providedIn: 'root' })
export class TodoStore {
  private api = inject(TodoApi);
  private _todos = signal<Todo[]>([]);
  private _loading = signal(false);

  readonly todos = this._todos.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly openCount = computed(() => this._todos().filter(t => !t.done).length);

  load() {
    this._loading.set(true);
    this.api.list().subscribe({
      next: items => { this._todos.set(items); this._loading.set(false); },
      error: () => this._loading.set(false),
    });
  }

  toggle(id: string) {
    this._todos.update(list => list.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }
}
```

## NgRx actions, reducer, selectors

```ts
// todos.actions.ts
export const TodoActions = createActionGroup({
  source: 'Todos',
  events: {
    'Load': emptyProps(),
    'Load Success': props<{ todos: Todo[] }>(),
    'Load Failure': props<{ error: string }>(),
  },
});

// todos.reducer.ts
export interface TodoState { todos: Todo[]; loading: boolean; }
const initial: TodoState = { todos: [], loading: false };

export const todosReducer = createReducer(
  initial,
  on(TodoActions.load, s => ({ ...s, loading: true })),
  on(TodoActions.loadSuccess, (s, { todos }) => ({ ...s, todos, loading: false })),
  on(TodoActions.loadFailure, s => ({ ...s, loading: false })),
);

// todos.selectors.ts
export const selectTodos = createFeatureSelector<TodoState>('todos');
export const selectOpen = createSelector(selectTodos, s => s.todos.filter(t => !t.done));
```

## NgRx effect

```ts
export const loadTodos$ = createEffect(
  (actions$ = inject(Actions), api = inject(TodoApi)) =>
    actions$.pipe(
      ofType(TodoActions.load),
      switchMap(() => api.list().pipe(
        map(todos => TodoActions.loadSuccess({ todos })),
        catchError(err => of(TodoActions.loadFailure({ error: err.message }))),
      )),
    ),
  { functional: true },
);
```

## Consuming in a component

```ts
store = inject(Store);
todos = this.store.selectSignal(selectOpen);   // signal from selector
ngOnInit() { this.store.dispatch(TodoActions.load()); }
```

## Server state

For data that is fetched, cached, and refreshed, keep the cache in a service and invalidate it after writes. Libraries such as TanStack Query (with an Angular adapter) provide this out of the box.

## Important points
- Keep state minimal and derive the rest with `computed` or selectors.
- Store raw data, not view data.
- Avoid putting the same data in two places. Keep one source of truth.
