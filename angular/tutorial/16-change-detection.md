# Chapter 16: Change detection

> **Like I'm 5:** The shop has a helper who walks around and repaints the price tags that changed. A lazy helper repaints every tag every time anything happens. A smart helper only visits the shelves where someone rang a bell. Angular 22 gives you the smart helper by default. You only have to remember to ring the bell.

Concept reference: [11. Change detection](../concepts/11-change-detection.md)

[Back: Chapter 15](15-forms.md) · Next: [Chapter 17: Lazy loading](17-lazy-loading.md)

## What we build today

Nothing new in the shop. This chapter is a **laboratory**. The shop already works because, without telling you, it has followed the rules of change detection since Chapter 1. Today we break the rules in a safe test page and watch what happens, so you understand *why* the rules exist.

## The big idea

**Change detection** is how Angular keeps the screen equal to your data. When data changes, Angular must find out and redraw the right parts. Two questions decide everything:

1. **Who tells Angular that "something might have changed"?** (the *trigger*)
2. **Which components does Angular look at?** (the *strategy*)

### The trigger

| Style | How Angular finds out | Where you meet it |
|-------|-----------------------|-------------------|
| **With `zone.js`** (older apps) | A library patches the browser, so *every* click, timer, and HTTP answer says "maybe something changed". Angular then checks everything. | Most apps written before 2024 |
| **Zoneless** (**the default in Angular 22**, and in our shop) | Angular only checks when it is **told**: a signal changed, a template event happened (`(click)`), the `async` pipe got a value, `markForCheck()` was called. | New apps |

Our `package.json` has no `zone.js`. That is a feature: less code to download, clearer reasons for every redraw, and faster apps.

### The strategy

| Strategy | Meaning |
|----------|---------|
| **`OnPush`** (**the default in Angular 22**) | Check this component only if: an `input()` got a *new* value, an event happened inside it, a signal it reads changed, or somebody marked it dirty. |
| **`Eager`** (was called `Default`) | Check this component on **every** round. This is the old behaviour. |

Remember Chapter 7's pipe lab, where we needed `ChangeDetectionStrategy.Eager` to see the impure pipe run? That was this.

### The rule that makes it all work

> **Put anything that changes and is shown on the screen into a signal. Replace objects instead of changing them in place.**

That is exactly what we have done: `likes = signal(0)`, `cart._items.update(list => [...list, item])`, `visible = toSignal(...)`.

**Grown-up words:**

- **Zone.js**: a library that patches async APIs to trigger change detection automatically.
- **Zoneless**: Angular without zone.js; it relies on notifications.
- **OnPush**: "check me only when I might have changed".
- **Dirty**: marked as needing a check.
- **`markForCheck()`**: tells Angular "this component is dirty" (and schedules a check).
- **Immutable update**: make a new object instead of editing the old one.

## Step 1: Build the laboratory

The lab has four tiny components that each do something different after 300 ms, and a parent with two buttons:

| Component | What it does | What do you expect? |
|-----------|--------------|---------------------|
| `LabPlain` | sets a **plain field** inside a `setTimeout` | ? |
| `LabMarked` | sets a plain field and calls `markForCheck()` | ? |
| `LabSignal` | sets a **signal** | ? |
| `LabChild` | shows `person().name` from an `input()` | ? |

The parent has a **mutate in place** button (`person.name = 'B'`) and a **replace** button (`person = { name: 'C' }`).

Make a folder `src/app/extras/` and save this as `src/app/extras/change-lab.ts` (it is also in [`extras/ch16`](extras/ch16/change-lab.ts)):

**`src/app/extras/change-lab.ts`**

```ts
import { ChangeDetectorRef, Component, inject, input, signal } from '@angular/core';

@Component({ selector: 'app-lab-plain', template: `<p id="plain">Plain field: {{ text }}</p>` })
export class LabPlain {
  text = 'old';
  constructor() {
    setTimeout(() => (this.text = 'NEW'), 300);
  }
}

@Component({
  selector: 'app-lab-marked',
  template: `<p id="marked">Plain + markForCheck: {{ text }}</p>`,
})
export class LabMarked {
  private cdr = inject(ChangeDetectorRef);
  text = 'old';
  constructor() {
    setTimeout(() => {
      this.text = 'NEW';
      this.cdr.markForCheck();
    }, 300);
  }
}

@Component({ selector: 'app-lab-signal', template: `<p id="sig">Signal: {{ text() }}</p>` })
export class LabSignal {
  text = signal('old');
  constructor() {
    setTimeout(() => this.text.set('NEW'), 300);
  }
}

@Component({
  selector: 'app-lab-child',
  template: `<p id="child">Child sees: {{ person().name }}</p>`,
})
export class LabChild {
  person = input.required<{ name: string }>();
}

@Component({
  selector: 'app-lab',
  imports: [LabPlain, LabMarked, LabSignal, LabChild],
  template: `
    <app-lab-plain /><app-lab-marked /><app-lab-signal />
    <app-lab-child [person]="person" />
    <button id="mutate" (click)="mutate()">mutate in place</button>
    <button id="replace" (click)="replace()">replace with new object</button>
  `,
})
export class Lab {
  person = { name: 'A' };
  mutate() {
    this.person.name = 'B';
  }
  replace() {
    this.person = { name: 'C' };
  }
}
```

Add a temporary route in `app.routes.ts`, **before** the `**` route:

```ts
import { Lab } from './extras/change-lab';
// ...
{ path: 'lab', component: Lab },
```

Open <http://localhost:4200/lab>.

## Step 2: Read the results

The lab was run in a real browser. These are the four lines of text, one second after the page opened, then after each button:

| | Plain field | Plain + markForCheck | Signal | Child (input) |
|---|---|---|---|---|
| 1 s after opening | `old` | **`NEW`** | **`NEW`** | `A` |
| after **mutate in place** | `old` | `NEW` | `NEW` | **`A`** (still!) |
| after **replace** | `old` | `NEW` | `NEW` | **`C`** |

Four lessons:

1. **A plain field changed in a timer stays `old` on the screen.** The data changed (`text` is `'NEW'` in memory), but nobody rang the bell, so Angular did not repaint. With `zone.js` it *would* have worked, because the zone would have rung the bell for every timer. That is why old tutorials never mention this, and why moving to zoneless means "use signals".
2. **`markForCheck()` rings the bell by hand.** It works, but you have to remember it every time.
3. **A signal rings the bell by itself.** This is why we use signals for everything that is displayed.
4. **Mutating an object that was passed down does not reach an `OnPush` child.** The child's input still points to the *same* object, so Angular thinks nothing changed. A *new* object (`replace`) is a new value, so the child updates. This is why the cart builds a new array in every `update`.

Remove the lab route when you are done (or keep it while you experiment).

## Step 3: See how the shop already follows the rules

Open a few files from earlier chapters and spot the rules in action:

| Rule | Where we followed it |
|------|----------------------|
| Displayed state is in signals | `CartService._items`, `Home.loading`, `Home.page` (Chapter 10) |
| Derived values are `computed` | `cart.total`, `stockLevel`, `pageItems` |
| New array/object on every update | `add()` in `CartService` uses `[...list, item]` or `list.map(...)` |
| Streams become signals or use `async` | `visible = toSignal(...)`, `topRated$ | async` (Chapter 12) |
| Events in templates ring the bell | `(click)="like()"`, `(added)="onAdded($event)"` |

## Step 4: When you do need to ring the bell yourself

Sometimes a plain field must change from code that Angular does not know about (a third-party library callback, a `setTimeout`). You have three choices, best first:

```ts
// 1. BEST: store it in a signal.
text = signal('old');
someLibrary.onChange(() => this.text.set('NEW'));

// 2. OK for legacy code: tell Angular this component is dirty.
private cdr = inject(ChangeDetectorRef);
someLibrary.onChange(() => { this.text = 'NEW'; this.cdr.markForCheck(); });

// 3. Last resort: run a check right now.
this.cdr.detectChanges();
```

Other tools in the same family:

| Tool | Use |
|------|-----|
| `afterNextRender(() => ...)` | Run code once, after the screen has been drawn (measure sizes, start a chart) |
| `afterEveryRender(() => ...)` | Same, after every draw |
| `cdr.detach()` / `reattach()` | Pause checking a heavy component |
| `ApplicationRef.whenStable()` | Wait until Angular has nothing left to do (tests and SSR use it) |

## Step 5: The old way, if you ever need it

If you maintain an app that still uses `zone.js`, you will see `ChangeDetectionStrategy.OnPush` written on components and `zone.js` in `angular.json` polyfills. To make a component check on every round, write:

```ts
@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  // ...
})
```

When you upgrade such an app to Angular 22 with `ng update`, a migration adds `Eager` to every component for you, so nothing changes until you are ready (you will see this in Chapter 36).

## Check it works

- [ ] The lab shows the table above. Your four lines match.
- [ ] Now a surprise. Change `LabPlain` to use `changeDetection: ChangeDetectionStrategy.Eager` (import it from `@angular/core`). The plain field now shows `NEW`! Why? Its neighbours `LabMarked` and `LabSignal` rang the bell at the same moment, and an `Eager` component is checked in **every** round, so it got repainted by accident. Remove the two neighbours from the lab's template (keep only `<app-lab-plain />`) and it stays `old` again. `Eager` borrows other people's bells; it is not a fix. This was checked in a real browser.
- [ ] The tests still pass: `npx ng test --watch=false` shows 23 files and 59 tests (the lab has no tests).

## What you learned

- Change detection has a **trigger** (who says "something changed?") and a **strategy** (which components are checked).
- In Angular 22 new apps are **zoneless** and components are **`OnPush`** by default.
- Signals tell Angular exactly what changed; plain fields changed in timers do not.
- `markForCheck()` is the manual bell; `ChangeDetectionStrategy.Eager` is the old "check me every time".
- Replace objects, do not mutate them, when they are passed to children.

## Try it yourself

1. Add a fifth lab component that stores its text in a signal but updates it from a `setInterval` every second. Does it keep ticking? (Yes. A signal always rings the bell.)
2. Make `Lab` hold `person = signal({ name: 'A' })` and pass `[person]="person()"`. Make the **mutate** button call `person.update(p => ({ ...p, name: 'B' }))`. Does the child update now?
3. Use Angular DevTools (Chapter 25) to see which components are re-checked when you click the buttons.
4. Why does the **replace** button repaint the child even though `person` is a plain field of `Lab`? (Hint: an event in a template marks the component that owns the template dirty, and the child then receives a *new* input value.)

## If something goes wrong

**"My data changes but the screen does not":** this is *the* question of zoneless Angular. Ask: is the changed value in a signal? Is it a new object? Did the change happen inside Angular's knowledge (a template event, `async` pipe, `toSignal`)? If not, use a signal or `markForCheck()`.

**`NG0100: ExpressionChangedAfterItHasBeenCheckedError`:** something changed a displayed value *during* a check, for example a getter that returns a new random value each time, or a child changing a parent's value while the page is being drawn. Fix the cause (derive with `computed`, or move the change to an event or `afterNextRender`). It only appears in development mode.

**A third-party library does not update the page:** its callbacks run outside Angular's knowledge. Wrap the data in a signal and set it from the callback.

Next: [Chapter 17: Lazy loading](17-lazy-loading.md)
