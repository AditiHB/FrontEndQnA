# 9. Signals

> **Like I'm 5:** A signal is a box with a label on it. When someone changes what is inside, everyone looking at the box is told automatically. A `computed` box works out its value from other boxes.

## Key concepts
- A **signal** is a reactive value. Reading it inside a template or `computed` or `effect` registers a dependency.
- Signals are synchronous, glitch-free, and enable fine-grained updates.
- They are the foundation for zoneless Angular.

## Writable signals

```ts
import { signal } from '@angular/core';

const count = signal(0);
count();                        // read: 0
count.set(5);                   // write
count.update(n => n + 1);       // update based on previous value
```

Objects and arrays: always create new references, because signals compare by reference.

```ts
items.update(list => [...list, newItem]);     // correct
items().push(newItem);                         // no notification - wrong
```

## Computed signals

```ts
const total = computed(() => cart().reduce((sum, i) => sum + i.price * i.qty, 0));
```

- Lazy and memoized.
- Must be **pure**: do not write signals inside `computed`.

## Effects

```ts
constructor() {
  effect(() => {
    localStorage.setItem('theme', this.theme());
  });
}
```

- Run asynchronously when tracked signals change.
- Use for side effects (logging, storage, third-party APIs), not to derive state.
- Clean up with `onCleanup`:
  ```ts
  effect((onCleanup) => {
    const id = setInterval(() => this.tick(), 1000);
    onCleanup(() => clearInterval(id));
  });
  ```

## Linked and untracked

```ts
import { linkedSignal, untracked } from '@angular/core';

// Writable signal that resets when the source changes
selectedId = linkedSignal(() => this.products()[0]?.id);

// Read a signal without tracking it
effect(() => {
  const a = this.a();
  const b = untracked(() => this.b());   // changes to b do not re-run this effect
});
```

## Signal inputs, outputs, and queries

```ts
name = input.required<string>();
size = input(12, { transform: numberAttribute });
saved = output<Order>();
value = model(0);                      // two-way binding
inputEl = viewChild<ElementRef>('input');
rows = contentChildren(RowDirective);
```

## Interop with RxJS

```ts
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

users = toSignal(this.api.users$, { initialValue: [] });
search$ = toObservable(this.query);
```

## Resource API (async state)

Angular provides an async state model (`resource`, `httpResource`) for data that loads from a signal-driven request. Its status and stability have changed across versions, so check the version you use before relying on it.

## Important points
- Use signals for synchronous UI state and derived values. Use RxJS for event streams and cancellation.
- Read signals in templates directly: `{{ count() }}`.
- Avoid `effect` loops: writing to a signal that the effect reads causes repeated runs.
