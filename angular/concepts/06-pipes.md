# 6. Pipes

> **Like I'm 5:** A pipe is a machine on a conveyor belt. A value goes in one end and a nicer-looking value comes out the other. For example, a plain date goes in and a pretty date comes out.

> **Learn it by doing:** build this step by step in the tutorial: [Chapter 7: Pipes](../tutorial/07-pipes.md).

## Key concepts
- A **pipe** transforms a value in a template: `{{ value | pipeName:arg }}`.
- **Pure pipes** (default) run only when the input reference changes. They are cheap.
- **Impure pipes** run on every change detection cycle. Avoid them unless necessary.

## Built-in pipes

```html
{{ today | date:'fullDate' }}           <!-- Monday, 10 October 2026 -->
{{ price | currency:'INR':'symbol' }}    <!-- ₹ -->
{{ ratio | percent:'1.0-1' }}
{{ 1234.5 | number:'1.2-2' }}
{{ 'hello' | uppercase }}
{{ user | json }}                        <!-- debugging only -->
{{ items | slice:0:5 }}
{{ dict | keyvalue }}                    <!-- iterate over object keys -->
{{ data$ | async }}                      <!-- subscribe and unsubscribe automatically -->
```

## Async pipe

```html
@if (orders$ | async; as orders) {
  <app-order-list [orders]="orders" />
} @else {
  <spinner />
}
```

The `async` pipe handles subscription, unsubscription, and change detection for observables and promises. Prefer it over manual `subscribe` in components with `OnPush`.

## Custom pipe

```ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate', pure: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string | null, limit = 50, suffix = '…'): string {
    if (!value) return '';
    return value.length > limit ? value.slice(0, limit) + suffix : value;
  }
}
```

```html
<p>{{ description | truncate:80 }}</p>
```

Standalone pipes are used directly in a component's `imports` array.

## Impure pipe example (use with care)

```ts
@Pipe({ name: 'timeAgo', pure: false })
export class TimeAgoPipe implements PipeTransform {
  transform(date: Date): string { /* recalculated on every check */ }
}
```

## Important points
- Pipes are good for presentation formatting. Keep business logic in services.
- Heavy pipes in long lists hurt performance. Use `computed` signals to cache results.
- Use `DatePipe` with a `locale` and `timezone` argument for consistent output across users.
