# 17. Animations

> **Like I'm 5:** Animations are small cartoon moves, like something sliding in or fading out, so the user understands what just happened. Keep them quick, and turn them off for people who don't want motion.

## Key concepts
- For things that **arrive and leave** (a toast, a list item, a dialog), Angular 22 has two template attributes: `animate.enter` and `animate.leave`. They add CSS classes, and Angular waits for a leave animation to finish before it removes the element. The animation itself is plain CSS (`@keyframes` or `transition`).
- The older Angular animation DSL in `@angular/animations` (`trigger`, `state`, `transition`, `animate`, `provideAnimations`) is **deprecated** in Angular 22. Its npm page says to use `animate.enter` and `animate.leave` instead. Many existing codebases still use it, so it is shown below as *legacy*.
- Plain CSS transitions handle simple state changes (hover, focus, open and closed).
- The browser's View Transitions API animates between route changes (`withViewTransitions()`).
- Learn it by doing: [Tutorial chapter 19](../tutorial/19-animations.md) animates the Toy Shop's cart lines and cards.

## `animate.enter` and `animate.leave` (recommended)

```html
@if (visible()) {
  <div class="toast" animate.enter="fade-in" animate.leave="fade-out">
    <ng-content />
  </div>
}
```

```css
@keyframes fade-in  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }

.fade-in  { animation: fade-in  200ms ease-out; }
.fade-out { animation: fade-out 150ms ease-in; }
```

- `animate.enter="fade-in"`: when the element is added, Angular puts the class `fade-in` on it.
- `animate.leave="fade-out"`: when the element is about to be removed (for example by `@if` or `@for`), Angular puts the class on it, waits for the animation to end, then removes it.
- No module, no provider, and no TypeScript imports are needed. It works on any element.

## Legacy: the `@angular/animations` DSL (deprecated)

You will meet this in older code. It needs `provideAnimationsAsync()` in the app config and the `@angular/animations` package:

```ts
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-toast',
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'none' })),
      ]),
      transition(':leave', [animate('150ms ease-in', style({ opacity: 0 }))]),
    ]),
  ],
  template: `<div @fade class="toast"><ng-content /></div>`,
})
export class Toast {}
```

State-based version (`state`, `[@expand]="isOpen() ? 'open' : 'closed'"`) works the same way. When you migrate, replace each `:enter` and `:leave` transition with `animate.enter` and `animate.leave` and a CSS keyframes class, and remove `provideAnimationsAsync()`.

## CSS-only transitions (simplest)

```scss
.card {
  transition: transform 200ms ease, box-shadow 200ms ease;
  &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgb(0 0 0 / 0.15); }
}
```

## View Transitions

```ts
provideRouter(routes, withViewTransitions());
```

The browser animates between route changes when the document supports the API.

## Accessibility
- Respect `prefers-reduced-motion`:
  ```scss
  @media (prefers-reduced-motion: reduce) {
    * { transition: none !important; animation: none !important; }
  }
  ```
- Avoid animations that flash more than three times per second.

## Important points
- Animate `transform` and `opacity`, which are cheap for the browser. Avoid animating layout properties.
- Keep animations short (150–300 ms) for UI feedback.
