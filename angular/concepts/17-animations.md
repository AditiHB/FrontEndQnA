# 17. Animations

## Key concepts
- Angular supports animations through CSS transitions and keyframes, the Angular animation DSL in `@angular/animations`, and browser APIs such as the View Transitions API.
- The animation DSL is tied to `trigger`, `state`, `style`, `transition`, and `animate`. Newer Angular versions add native enter and leave animations through CSS. Check the current guidance for your version, because the recommended approach has been changing.

## Enabling animations

```ts
// app.config.ts
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig = {
  providers: [provideAnimationsAsync()],   // loads animation code lazily
};
```

## DSL example: fade in and out

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
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
  ],
  template: `<div @fade class="toast"><ng-content /></div>`,
})
export class ToastComponent {}
```

## State-based animation

```ts
trigger('expand', [
  state('closed', style({ height: '0px', overflow: 'hidden' })),
  state('open', style({ height: '*' })),
  transition('closed <=> open', animate('250ms ease')),
]);
```

```html
<div [@expand]="isOpen() ? 'open' : 'closed'">...</div>
```

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
