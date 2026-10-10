# 19. Accessibility (a11y)

> **Like I'm 5:** Accessibility means everyone can use the app, including people who use only a keyboard, a screen reader, or large text. Use real buttons and real labels, and helpers can read your app.

> **Learn it by doing:** build this step by step in the tutorial: [Chapter 21: Accessibility](../tutorial/21-accessibility.md).

## Key concepts
- Accessible apps work with keyboards, screen readers, zoom, and high-contrast settings.
- Target **WCAG 2.2 AA** as a baseline.
- Angular CDK (`@angular/cdk/a11y`) provides focus management and live announcements.

## Semantic HTML first

```html
<!-- Good -->
<button type="button" (click)="save()">Save</button>
<nav aria-label="Main"><a routerLink="/orders">Orders</a></nav>

<!-- Bad -->
<div class="button" (click)="save()">Save</div>
```

## Labels and ARIA

```html
<label for="email">Email</label>
<input id="email" type="email" [attr.aria-invalid]="email.invalid && email.touched"
       [attr.aria-describedby]="email.invalid ? 'email-error' : null" />
<small id="email-error" role="alert">Enter a valid email</small>

<button [attr.aria-expanded]="open()" aria-controls="menu">Menu</button>
<ul id="menu" [hidden]="!open()">...</ul>
```

## Live announcements

```ts
import { LiveAnnouncer } from '@angular/cdk/a11y';

private announcer = inject(LiveAnnouncer);
onSaved() { this.announcer.announce('Order saved'); }
```

## Focus management

```ts
import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';

// Keep focus inside a dialog
private trapFactory = inject(FocusTrapFactory);
trap = this.trapFactory.create(this.dialogEl.nativeElement);
ngOnInit() { this.trap.focusInitialElementWhenReady(); }
ngOnDestroy() { this.trap.destroy(); }
```

Use `cdkTrapFocus` in the template for simple cases:

```html
<div cdkTrapFocus cdkTrapFocusAutoCapture role="dialog" aria-modal="true" aria-labelledby="t">
  <h2 id="t">Confirm</h2>
</div>
```

## Route changes

After navigation, move focus to the main heading or announce the page title, because single-page apps do not reload the page.

## Keyboard support

- Every interactive element must be reachable with `Tab`.
- Custom widgets follow the ARIA Authoring Practices patterns (for example, arrow keys in a menu).
- Visible focus styles must not be removed: `:focus-visible` is the usual approach.

## Testing
- Automated: `axe-core` in unit or e2e tests (for example `@axe-core/playwright`).
- Manual: keyboard-only walkthroughs and screen reader checks (NVDA, VoiceOver).

## Important points
- Prefer native elements over custom widgets. Angular Material components are accessible by default.
- Color contrast: at least 4.5:1 for normal text.
