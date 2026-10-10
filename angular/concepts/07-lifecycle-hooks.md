# 7. Lifecycle Hooks

## Key concepts
Angular calls lifecycle hooks on components, directives, and pipes at specific moments. Implement the interface to use the hook.

## Order of execution

| Hook | When | Typical use |
|------|------|-------------|
| `constructor` | Object created | Dependency injection only |
| `ngOnChanges` | An input reference changed | React to input changes (receives `SimpleChanges`) |
| `ngOnInit` | After first `ngOnChanges` | Initial data loading |
| `ngDoCheck` | Every change detection run | Custom change checks (keep cheap) |
| `ngAfterContentInit` | After projected content is initialized | Access `@ContentChild` |
| `ngAfterContentChecked` | After projected content is checked | Rarely needed |
| `ngAfterViewInit` | After the view and child views are initialized | Access `@ViewChild`, third-party DOM libraries |
| `ngAfterViewChecked` | After view checks | Rarely needed |
| `ngOnDestroy` | Before removal | Cleanup: unsubscribe, clear timers, remove listeners |

## Example

```ts
import { Component, OnInit, OnChanges, OnDestroy, SimpleChanges, input } from '@angular/core';

@Component({ selector: 'app-chart', template: `<canvas #c></canvas>` })
export class ChartComponent implements OnChanges, OnInit, OnDestroy {
  data = input<number[]>([]);
  private timer?: ReturnType<typeof setInterval>;

  ngOnChanges(changes: SimpleChanges) {
    console.log('data changed', changes);
  }

  ngOnInit() {
    this.timer = setInterval(() => this.refresh(), 5000);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  private refresh() { /* ... */ }
}
```

## Modern alternatives
- **`DestroyRef`** with `takeUntilDestroyed()` replaces manual unsubscribe in `ngOnDestroy`:
  ```ts
  constructor() {
    interval(1000).pipe(takeUntilDestroyed()).subscribe(() => this.tick());
  }
  ```
- **`afterNextRender` / `afterRender`** run code after the DOM is updated, without the `ngAfterViewInit` boilerplate.
  ```ts
  // import { afterNextRender } from '@angular/core';
  constructor() {
    afterNextRender(() => this.chart = new Chart(this.canvas().nativeElement));
  }
  ```

## Pitfalls
- Do not read `@Input` values in the constructor. Use `ngOnInit`, or signals with `computed` / `effect`.
- Do not change bound values in `ngAfterViewInit` without care. It causes `ExpressionChangedAfterItHasBeenCheckedError` in dev mode.
