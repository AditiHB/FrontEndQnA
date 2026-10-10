# 11. Change Detection

## Key concepts
- Change detection checks component templates and updates the DOM when bound values change.
- **Default** strategy checks every component on each run.
- **OnPush** checks a component only when its inputs change by reference, an event fires inside it, an `async` pipe emits, or a signal it reads changes.
- **Zone.js** triggers change detection after async browser events. **Zoneless** apps rely on signals and explicit notifications instead.

## OnPush

```ts
@Component({
  selector: 'app-product-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@for (p of products(); track p.id) { <app-product [product]="p" /> }`,
})
export class ProductListComponent {
  products = input.required<Product[]>();
}
```

Mutating an array in place does not notify OnPush components:

```ts
this.products.push(p);            // no update
this.products = [...this.products, p];  // update: new reference
```

## Manual control

```ts
import { ChangeDetectorRef, inject, ApplicationRef } from '@angular/core';

private cdr = inject(ChangeDetectorRef);

onExternalEvent() {
  this.cdr.markForCheck();   // mark this view and ancestors for checking
  // this.cdr.detectChanges(); // check this view now
}

// Force a full application check
inject(ApplicationRef).tick();
```

## Detaching for heavy components

```ts
constructor() {
  this.cdr.detach();          // stop automatic checks
  setInterval(() => this.cdr.detectChanges(), 100);
}
```

## Running work outside Angular (zone-based apps)

```ts
private zone = inject(NgZone);

ngOnInit() {
  this.zone.runOutsideAngular(() => {
    window.addEventListener('scroll', this.onScroll);
  });
}

onScroll = () => {
  this.zone.run(() => this.position.set(window.scrollY));
};
```

## Zoneless

```ts
bootstrapApplication(AppComponent, {
  providers: [provideZonelessChangeDetection()],
});
```

In zoneless mode, update state with signals or call `markForCheck` after non-signal updates.

## Pitfalls
- `ExpressionChangedAfterItHasBeenCheckedError` in dev mode means a value changed during a check. Move the change earlier or defer it.
- Expensive method calls in templates run on every check. Replace them with `computed` values or pure pipes.
- Third-party callbacks (charts, maps, timers) may need `zone.run` or `markForCheck`.
