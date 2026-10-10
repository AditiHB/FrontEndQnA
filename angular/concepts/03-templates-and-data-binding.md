# 3. Templates & Data Binding

> **Like I'm 5:** A template is a picture on a sheet of paper. Data binding is a string that connects a box on the picture to a value in your code. When the value changes, the picture changes too.

> **Learn it by doing:** build this step by step in the tutorial: [Chapter 3: Templates and data binding](../tutorial/03-templates-and-data-binding.md).

## Key concepts
- **Templates** are HTML with Angular syntax. Angular compiles them ahead of time (AOT) and type-checks them with `strictTemplates`.
- Binding types: interpolation, property, event, two-way, attribute, class, and style.

## Binding syntax

```html
<!-- Interpolation: component -> text -->
<h1>{{ title }}</h1>

<!-- Property binding: component -> DOM property or input -->
<img [src]="product.imageUrl" [alt]="product.name" />
<button [disabled]="!form.valid">Save</button>

<!-- Attribute binding: when there is no DOM property (ARIA, SVG) -->
<button [attr.aria-expanded]="isOpen">Menu</button>

<!-- Class and style bindings -->
<div [class.active]="isActive" [style.width.%]="progress"></div>

<!-- Event binding: DOM -> component -->
<input (input)="onSearch($any($event.target).value)" />
<form (ngSubmit)="save()"></form>

<!-- Two-way binding -->
<input [(ngModel)]="name" />           <!-- needs FormsModule or reactive forms -->
<app-rating [(value)]="rating" />      <!-- works with model() in the child -->
```

## Template variables and references

```html
<input #emailInput type="email" />
<button (click)="sendTo(emailInput.value)">Send</button>

<!-- @let declares a local value (Angular 18.1+) -->
@let total = price * quantity;
<p>Total: {{ total | currency }}</p>
```

## Safe navigation, non-null assertion, and `$any`

```html
<p>{{ user?.address?.city }}</p>        <!-- avoids errors on null -->
<p>{{ order!.id }}</p>                  <!-- non-null assertion (use carefully) -->
<p>{{ $any(value).unknownField }}</p>   <!-- bypasses type checking; avoid -->
```

## Template expressions: rules
- Expressions must be side-effect free. Do not call services or change state in them.
- Avoid calling methods that create new objects on every check, such as `getItems()` returning a new array. Use signals or `computed` instead.

## Important points
- `strictTemplates: true` (set with `ng new --strict`) catches many template type errors at build time.
- Use `ngNonBindable` to display raw `{{ }}` text, for example in a documentation page.
- Keep templates readable; move complex logic into `computed` values or pipes.
