# 5. Control Flow & Template Blocks

> **Like I'm 5:** Control flow is the "if" and "repeat" of a template. `@if` shows something only when it is true. `@for` makes one copy for each item in a list, and `track` gives each copy a name tag so Angular can tell them apart.

> **Learn it by doing:** build this step by step in the tutorial: [Chapter 5: Control flow](../tutorial/05-control-flow.md).

## Key concepts
- Built-in blocks (`@if`, `@for`, `@switch`, `@defer`) were introduced in Angular 17 and replace `*ngIf`, `*ngFor`, and `*ngSwitch`.
- They are type-checked, need no imports, and are faster for many cases.

## `@if`

```html
@if (user(); as u) {
  <h2>Welcome, {{ u.name }}</h2>
} @else if (loading()) {
  <spinner />
} @else {
  <a routerLink="/login">Log in</a>
}
```

The `as` alias stores the value in a local variable.

## `@for` with `track`

```html
@for (item of items(); track item.id; let i = $index, last = $last) {
  <li [class.last]="last">{{ i + 1 }}. {{ item.name }}</li>
} @empty {
  <li>No items yet</li>
}
```

- `track` is **required**. Use a stable unique key, never the index for reorderable lists.
- Context variables: `$index`, `$first`, `$last`, `$even`, `$odd`, `$count`.

## `@switch`

```html
@switch (status()) {
  @case ('pending') { <badge color="orange">Pending</badge> }
  @case ('shipped') { <badge color="blue">Shipped</badge> }
  @default { <badge>Unknown</badge> }
}
```

## `@defer` (lazy template parts)

```html
@defer (on viewport; prefetch on idle) {
  <app-revenue-chart [data]="data()" />
} @placeholder (minimum 200ms) {
  <div class="skeleton"></div>
} @loading (after 100ms; minimum 500ms) {
  <spinner />
} @error {
  <p>Chart failed to load.</p>
}
```

Triggers:
| Trigger | Meaning |
|---------|---------|
| `on idle` | Browser is idle (default) |
| `on viewport` | Element enters the viewport |
| `on interaction` | User clicks or focuses the placeholder |
| `on hover` | Pointer hovers over the placeholder |
| `on timer(2s)` | After a delay |
| `on immediate` | Load right after the initial render |
| `when condition` | When an expression becomes true |

## `ng-template` and `ngTemplateOutlet`

```html
<ng-template #emptyState>
  <p>Nothing to show</p>
</ng-template>

<ng-container *ngTemplateOutlet="items().length ? list : emptyState" />
```

Use `ng-template` for reusable template fragments and for passing templates to child components. Modern code often uses content projection instead.

## Important points
- Use `@defer` to split heavy UI from the initial bundle. It needs the dependencies to be standalone components.
- `@let` is useful for avoiding repeated expressions, but keep names clear.
