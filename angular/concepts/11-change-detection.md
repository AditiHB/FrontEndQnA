# 11. Change Detection

> **Like I'm 5:** Angular is a teacher checking everyone's homework. The old way was to check every student every time. The smart way (OnPush) is to check only the student whose paper actually changed, which saves time. In Angular 22 the smart way is the default.

## Key concepts
- Change detection checks component templates and updates the DOM when bound values change.
- **OnPush** checks a component only when its inputs change by reference, an event fires inside it, an `async` pipe emits, a signal it reads changes, or it is marked dirty. **In Angular 22 this is the default for every component.**
- **Eager** is the strategy that checks the component on each run. It is the old `Default` strategy, renamed in Angular 22. `ng update` adds `ChangeDetectionStrategy.Eager` to existing components so that upgrading does not change their behaviour (see [35](35-upgrades-and-migration.md)).
- **Zone.js** triggers change detection after async browser events. **Zoneless** apps rely on signals and explicit notifications instead. **New Angular 22 apps are zoneless** (no `zone.js` in `package.json`).
- Learn it by doing: [Tutorial chapter 16](../tutorial/16-change-detection.md) runs a small lab with all the cases.

## OnPush (the default) and Eager

```ts
// Angular 22: no changeDetection line needed. This component is OnPush.
@Component({
  selector: 'app-product-list',
  template: `@for (p of products(); track p.id) { <app-product [product]="p" /> }`,
})
export class ProductList {
  products = input.required<Product[]>();
}

// Opt back in to the old "check me on every round" behaviour:
@Component({
  selector: 'app-legacy-box',
  changeDetection: ChangeDetectionStrategy.Eager, // was ChangeDetectionStrategy.Default before Angular 22
  template: `...`,
})
export class LegacyBox {}
```

Use `Eager` only for old code that you have not made signal-based yet. A plain field that is changed inside a `setTimeout` is **not** repainted by an OnPush component in a zoneless app. A component marked `Eager` may *seem* to work only because a neighbour rang the bell in the same round (the tutorial chapter shows this). Do not rely on that.

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

## Running work outside Angular (apps that still use zone.js)

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

New Angular 22 apps are zoneless without any setting. In an older app that still loads `zone.js`, you opt in with the provider and then remove `zone.js` from the build:

```ts
bootstrapApplication(App, {
  providers: [provideZonelessChangeDetection()],
});
```

In zoneless mode, update state with signals or call `markForCheck` after non-signal updates. `NgZone.runOutsideAngular` and `zone.run` are not needed there.

## Pitfalls
- `ExpressionChangedAfterItHasBeenCheckedError` in dev mode means a value changed during a check. Move the change earlier or defer it.
- Expensive method calls in templates run on every check. Replace them with `computed` values or pure pipes.
- Third-party callbacks (charts, maps, timers) may need `zone.run` or `markForCheck`.
