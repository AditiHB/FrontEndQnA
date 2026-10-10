# 1. Angular Core Concepts

### Q1. What is Angular, and how is it different from AngularJS? `Core`

> **Like I'm 5:** Angular is a toy kit for building websites. AngularJS was the old kit, and Angular is the newer one.

**Answer:**
- **AngularJS (1.x)** is an MVC/MVVM framework built on two-way binding and `$scope`/digest cycles. It was discontinued in 2022.
- **Angular (2+)** is a component-based framework written in TypeScript. It uses a component tree, unidirectional data flow by default, a hierarchical dependency injector, a compiled template system (AOT), RxJS for async work, and an explicit change detection model.

---

### Q2. What is the difference between standalone components and NgModule-based components? `Core`

> **Like I'm 5:** A standalone component carries its own tools in its own box. An NgModule component needs a big shared box that everyone has to sign up for.

**Answer:**
- **NgModule-based**: every component must be declared in exactly one `NgModule`, and modules import each other's dependencies.
- **Standalone** (the default since Angular 19; introduced as an option in Angular 14): a component declares its own `imports` and does not need a module. This removes boilerplate, makes lazy loading per component easy (`loadComponent`), and helps tree-shaking.

```ts
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `<a [routerLink]="['/users', user.id]">{{ user.created | date }}</a>`
})
export class UserCardComponent { @Input() user!: User; }
```

**Interview tip:** Mention how you migrated a large app with `ng generate @angular/core:standalone`, and any issues you hit (for example, shared modules that had to be split).

---

### Q3. Explain the component lifecycle hooks and their order. `Core`

> **Like I'm 5:** A component is born, grows up, and goes away. Each stage has an alarm clock (a hook) that rings, so you can do something at that moment.

**Answer:** In order of execution:

1. `constructor` (only for DI; do not read `@Input` values here)
2. `ngOnChanges` (runs when any input reference changes, before `ngOnInit`)
3. `ngOnInit` (inputs are ready; good place for initial data fetching)
4. `ngDoCheck` (custom change detection; runs often, so keep it cheap)
5. `ngAfterContentInit` / `ngAfterContentChecked` (after projected content, `@ContentChild`)
6. `ngAfterViewInit` / `ngAfterViewChecked` (after the view and `@ViewChild` are ready; use for DOM or third-party library setup)
7. `ngOnDestroy` (clean up subscriptions, timers, event listeners)

**Pitfall:** Changing a bound value inside `ngAfterViewInit` causes `ExpressionChangedAfterItHasBeenCheckedError` in development. Fix it by moving the change earlier, or by scheduling it with `setTimeout` or `afterNextRender`.

---

### Q4. What are signals, and how do they differ from RxJS observables? `Core`

> **Like I'm 5:** A signal is a box that tells people when its contents change. RxJS is a water pipe that keeps sending drops over time.

**Answer:**
- A **signal** is a value holder that notifies its readers when it changes. It is synchronous and always has a current value.
- An **observable** is a stream of values over time. It is lazy and can be asynchronous, with operators for timing, errors, and cancellation.

```ts
count = signal(0);
double = computed(() => this.count() * 2);

constructor() {
  effect(() => console.log('count is', this.count()));
}

increment() { this.count.update(c => c + 1); }
```

- Use **signals** for synchronous UI state (selected tab, form view state, derived values).
- Use **observables** for event streams, HTTP calls, debouncing, cancellation, and complex combinations.
- Bridge the two with `toSignal()` and `toObservable()` from `@angular/core/rxjs-interop`.

**Advanced point:** Signals enable fine-grained change detection. Angular can update only the views that read a changed signal, which is the foundation for zoneless applications.

---

### Q5. What is the difference between `effect()` and `computed()`? `Advanced`

> **Like I'm 5:** `computed` is a box whose answer is worked out from other boxes. `effect` is a helper who runs a job every time a box changes.

**Answer:**
- `computed()` is a **pure, lazy, memoized derivation**. It must not write to other signals.
- `effect()` runs **side effects** (logging, syncing to `localStorage`, calling a third-party library) whenever its tracked signals change. It runs asynchronously during change detection.

**Common mistake:** Using `effect()` to set another signal to derive state. Use `computed()` for that. Writing signals inside `effect()` is allowed in modern Angular, but it should be used sparingly.

---

### Q6. What are the new signal-based `input()`, `output()`, and `model()` APIs? `Advanced`

> **Like I'm 5:** `input` is a mailbox for things coming in. `output` is a mailbox for things going out. `model` is a mailbox that works both ways.

**Answer:**
```ts
// Input
name = input<string>();                  // optional, type string | undefined
id = input.required<number>();           // must be provided

// Output
selected = output<Product>();            // emits with this.selected.emit(product)

// Two-way binding
value = model(0);                        // [(value)]="x" works
```

**Benefits over decorators:** inputs are read as signals, so computed values and effects update automatically. They also support type inference for required inputs and transforms: `input(0, { transform: numberAttribute })`.

---

### Q7. Explain data binding types in Angular. `Core`

> **Like I'm 5:** Data binding is a string between the page and your code. It can go one way or both ways.

**Answer:**
| Type | Syntax | Direction |
|------|--------|-----------|
| Interpolation | `{{ value }}` | Component → view |
| Property binding | `[disabled]="isOff"` | Component → DOM/input |
| Event binding | `(click)="save()"` | View → component |
| Two-way binding | `[(ngModel)]="name"` or `[(value)]` | Both |
| Attribute binding | `[attr.aria-label]="label"` | For attributes without DOM properties |
| Class/style binding | `[class.active]="isActive"`, `[style.width.px]="w"` | Component → DOM |

---

### Q8. What is the new control flow syntax, and why was it introduced? `Core`

> **Like I'm 5:** The new `@if` and `@for` say "show this if..." and "make a copy for each item". `track` gives each copy a name tag.

**Answer:** Angular 17 introduced built-in block syntax (`@if`, `@for`, `@switch`, `@defer`) to replace `*ngIf`, `*ngFor`, and `*ngSwitch`.

```html
@if (user(); as u) {
  <h2>{{ u.name }}</h2>
} @else {
  <p>Loading...</p>
}

@for (item of items; track item.id) {
  <app-item [item]="item" />
} @empty {
  <p>No items</p>
}
```

**Why it matters:**
- `@for` **requires** a `track` expression, which gives better list performance than `trackBy`.
- Better type checking and no need to import `NgIf`/`NgFor`.
- Faster rendering in some cases, because no structural directive is involved.

---

### Q9. What is content projection? Explain `<ng-content>` and `select`. `Core`

> **Like I'm 5:** Content projection is putting a gift inside a box. `ng-content` is the gap in the box where the gift goes, and `select` says which gift goes in which gap.

**Answer:** Content projection lets a parent pass markup into a child component's template.

```html
<!-- card.component.html -->
<div class="card">
  <header><ng-content select="[card-title]"></ng-content></header>
  <section><ng-content></ng-content></section>
</div>

<!-- usage -->
<app-card>
  <h3 card-title>Orders</h3>
  <p>Body text</p>
</app-card>
```

Use `<ng-content>` with a `select` attribute for named slots. Use `ngProjectAs` to match an element that does not have the attribute.

---

### Q10. What is the difference between `ng-template`, `ng-container`, and `ng-content`? `Core`

> **Like I'm 5:** `ng-template` is a recipe card that waits until you cook it. `ng-container` is an invisible bag. `ng-content` is a gap for gifts.

**Answer:**
- `<ng-template>`: a template that is not rendered until you instantiate it, using `*ngIf`, `ngTemplateOutlet`, or a `ViewContainerRef`.
- `<ng-container>`: a logical grouping element that renders no DOM node. Useful for applying structural directives without an extra `<div>`.
- `<ng-content>`: a projection slot that receives markup from a parent.

---

### Q11. What is the difference between `ViewChild` and `ContentChild`? How do signal queries change this? `Advanced`

> **Like I'm 5:** `ViewChild` looks inside the component's own room. `ContentChild` looks at the gifts someone put into the box.

**Answer:**
- `@ViewChild` / `@ViewChildren` query elements in the component's **own template**.
- `@ContentChild` / `@ContentChildren` query elements **projected** into the component.
- Signal alternatives: `viewChild()`, `viewChildren()`, `contentChild()`, `contentChildren()`. These return signals and update automatically.

```ts
input = viewChild.required<ElementRef<HTMLInputElement>>('searchBox');
```

---

### Q12. What is the difference between pure and impure pipes? Why is the `async` pipe important? `Core`

> **Like I'm 5:** A pure pipe only works when it gets a brand-new value. An impure pipe checks again every time, which is slower. The `async` pipe turns the tap on and off for you.

**Answer:**
- **Pure pipes** run only when the input reference changes. They are cheap and recommended.
- **Impure pipes** run on every change detection cycle. They are expensive and should be avoided unless needed.
- The **`async` pipe** subscribes to an observable (or promise), returns the latest value, marks the view for check, and **unsubscribes automatically** on destroy. This prevents memory leaks.

---

### Q13. Explain change detection. What is the difference between Default (Eager) and OnPush? `Core`

> **Like I'm 5:** The old way checks every student every time. OnPush only checks the student whose paper changed. In Angular 22, OnPush is the default.

**Answer:**
- **Default** strategy (renamed **`Eager`** in Angular 22): Angular checks every component in the tree on every round. Simple, but can get slow in large trees. This was the default before Angular 22; `ng update` writes `ChangeDetectionStrategy.Eager` on existing components so upgrading does not change their behaviour.
- **OnPush** (**the default for components in Angular 22**): a component is checked only when:
  1. One of its `@Input` references changes.
  2. An event originates from the component or its children.
  3. You explicitly call `markForCheck()` or `detectChanges()`.
  4. An `async` pipe receives a new value.
  5. A signal it reads changes (in modern Angular).

```ts
// Angular 22: OnPush is already the default, so nothing is needed.
// Older projects write it explicitly:
@Component({ changeDetection: ChangeDetectionStrategy.OnPush, ... })

// Opt in to the old behaviour:
@Component({ changeDetection: ChangeDetectionStrategy.Eager, ... })
```

**Advanced point:** OnPush requires **immutable** data updates. Mutating an object in place (`this.items.push(x)`) does not change the reference, so the component is not updated. Return new arrays and objects, or use signals.

---

### Q14. What is Zone.js, and what does zoneless Angular mean? `Advanced`

> **Like I'm 5:** Zone.js is a helper that tells Angular when something happened. Zoneless means Angular notices changes by itself, with no helper.

**Answer:**
- **Zone.js** patches browser async APIs (events, timers, promises, XHR) to know when to run change detection. It is the reason Angular updated the UI automatically in older versions.
- **Zoneless** Angular removes Zone.js. Change detection is triggered by signal updates, `markForCheck`, and template events. It reduces bundle size and makes stack traces and performance easier to reason about. **New Angular 22 apps are zoneless by default** (no `zone.js` in `package.json`).

```ts
// Older apps that still load zone.js opt in with the provider, then remove zone.js:
bootstrapApplication(App, {
  providers: [provideZonelessChangeDetection()]
});
```

In a zoneless app, a plain field that is changed in a `setTimeout` is not repainted; put screen data in signals (or call `markForCheck()`).

**Trade-off:** Third-party libraries that rely on zone-based updates may need manual `ChangeDetectorRef` calls. Check compatibility before migrating.

---

### Q15. What is `@defer` and when would you use it? `Advanced`

> **Like I'm 5:** `@defer` says "load this part later, when it is needed", so the page starts faster.

**Answer:** `@defer` lazily loads part of a template and its dependencies, based on a trigger.

```html
@defer (on viewport; prefetch on idle) {
  <app-heavy-chart [data]="data" />
} @placeholder {
  <div class="skeleton"></div>
} @loading (minimum 300ms) {
  <spinner />
} @error {
  <p>Could not load chart</p>
}
```

Use it for below-the-fold widgets, rarely used dialogs, or heavy third-party components. It reduces the initial bundle without creating a separate route.

---

### Q16. How do you use `trackBy` and `track`? `Core`

> **Like I'm 5:** `track` gives each item in a list a name tag, so Angular knows which copy is which when the list changes.

**Answer:** When a list changes, Angular needs to know which DOM nodes map to which items. Without a tracking function, it recreates every DOM node when the array reference changes. Use a stable identifier:

```html
@for (order of orders; track order.id) { ... }
```

**Pitfall:** Do not use the array index as the track key when items are reordered or inserted. This causes DOM reuse bugs.
