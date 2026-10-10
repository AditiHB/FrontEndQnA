# 2. Components

## Key concepts
- A **component** is a class with a `@Component` decorator, a template, and optional styles. It is the basic building block of the UI.
- **Standalone** components declare their own dependencies in `imports`. This is the default in modern Angular.
- **Encapsulation** controls how styles apply: `Emulated` (default), `None`, `ShadowDom`.

## Basic component

```ts
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-order-card',
  imports: [DatePipe, CurrencyPipe],
  templateUrl: './order-card.html',
  styleUrl: './order-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'order-card' },
})
export class OrderCardComponent {
  order = input.required<Order>();
  cancelled = output<string>();

  cancel() {
    this.cancelled.emit(this.order().id);
  }
}
```

```html
<!-- order-card.html -->
<h3>Order #{{ order().id }}</h3>
<p>{{ order().createdAt | date:'mediumDate' }}</p>
<p>{{ order().total | currency:'USD' }}</p>
<button (click)="cancel()">Cancel</button>
```

## Content projection

```html
<!-- panel.html -->
<section class="panel">
  <header><ng-content select="[panel-header]" /></header>
  <ng-content />  <!-- default slot -->
</section>

<!-- usage -->
<app-panel>
  <h2 panel-header>Recent orders</h2>
  <app-order-list />
</app-panel>
```

## Encapsulation

```ts
@Component({
  selector: 'app-badge',
  template: `<span class="badge"><ng-content /></span>`,
  styles: `.badge { padding: 2px 6px; }`,
  encapsulation: ViewEncapsulation.ShadowDom,   // real Shadow DOM isolation
})
export class BadgeComponent {}
```

## Component host and view queries

```ts
import { viewChild, ElementRef } from '@angular/core';

export class SearchComponent {
  inputRef = viewChild.required<ElementRef<HTMLInputElement>>('q');
  focus() { this.inputRef().nativeElement.focus(); }
}
// template: <input #q type="search" />
```

## Important points
- Prefer small, focused components and a clear split between container and presentational components.
- Avoid `nativeElement` where a template binding or directive can do the job; it breaks SSR and testing.
- `selector` names should use a prefix (for example `app-`) and be unique across the project.
