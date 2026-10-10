# 4. Directives

> **Like I'm 5:** A directive is a sticker you put on an element. Some stickers change how something looks (like a highlight). Others add or remove whole pieces of the picture.

## Key concepts
- **Component**: a directive with a template.
- **Attribute directive**: changes the appearance or behavior of an element (`ngClass`, `ngStyle`, custom).
- **Structural directive**: adds, removes, or repeats elements. In modern Angular, use `@if`, `@for`, and `@switch` (see [05-control-flow.md](05-control-flow.md)). Structural directives like `*ngIf` still work but are legacy.

## Built-in directives

```html
<div [ngClass]="{ 'is-error': hasError, 'is-large': size > 10 }"></div>
<div [ngStyle]="{ 'background-color': color }"></div>
```

## Custom attribute directive

```ts
import { Directive, ElementRef, inject, input } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  host: {
    '(mouseenter)': 'on()',
    '(mouseleave)': 'off()',
  },
})
export class HighlightDirective {
  color = input('yellow', { alias: 'appHighlight' });
  private el = inject<ElementRef<HTMLElement>>(ElementRef);

  on() { this.el.nativeElement.style.backgroundColor = this.color(); }
  off() { this.el.nativeElement.style.backgroundColor = ''; }
}
```

```html
<p [appHighlight]="'lightblue'">Hover me</p>
```

## Host bindings and listeners

Modern code uses the `host` property in the decorator. The older `@HostBinding` and `@HostListener` decorators still work.

```ts
@Directive({
  selector: '[appDisabledWhenLoading]',
  host: {
    '[attr.aria-busy]': 'loading()',
    '[class.is-disabled]': 'loading()',
  },
})
export class DisabledWhenLoadingDirective {
  loading = input(false);
}
```

## Structural directive (custom)

```ts
import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';

@Directive({ selector: '[appUnless]' })
export class UnlessDirective {
  private tpl = inject(TemplateRef<unknown>);
  private vcr = inject(ViewContainerRef);
  appUnless = input.required<boolean>();

  constructor() {
    effect(() => {
      this.vcr.clear();
      if (!this.appUnless()) this.vcr.createEmbeddedView(this.tpl);
    });
  }
}
```

## Host directives (composition)

```ts
@Component({
  selector: 'app-save-button',
  hostDirectives: [{ directive: HighlightDirective, inputs: ['appHighlight'] }],
  template: `<ng-content />`,
})
export class SaveButtonComponent {}
```

## Important points
- Directives should not own business logic. Keep them focused on DOM behavior.
- Clean up event listeners with `DestroyRef` or `host` bindings, which Angular removes automatically.
