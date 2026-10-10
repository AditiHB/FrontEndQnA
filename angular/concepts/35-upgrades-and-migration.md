# 35. Upgrades & Migration

> **Like I'm 5:** Upgrading is moving to a new house one room at a time. `ng update` is the moving truck. It carries most of your stuff and tells you which boxes you need to pack by hand.

## Key concepts
- Angular releases a major version about every six months, and supports each major for a limited period.
- `ng update` applies official migrations automatically and tells you what to fix manually.
- Upgrade one major version at a time. Skipping versions makes problems harder to trace.

## Upgrade steps

```bash
git checkout -b chore/angular-upgrade
ng update                                  # shows available updates
ng update @angular/core @angular/cli       # upgrade core and CLI together
ng update @angular/material @angular/cdk
npm test && npm run build
```

Steps that usually help:
1. Read the official update guide for the target version.
2. Make sure tests pass before upgrading.
3. Upgrade Node.js to a version the new Angular version supports.
4. Upgrade third-party libraries that have peer dependency limits.
5. Run the app and smoke test the main journeys.

## Automated schematic migrations

```bash
ng generate @angular/core:standalone         # convert NgModules to standalone
ng generate @angular/core:control-flow       # convert *ngIf / *ngFor to @if / @for
ng generate @angular/core:inject             # constructor injection to inject()
```

Run each migration in its own commit, so the diff is easy to review.

## Migrating from `*ngIf` / `*ngFor` to control flow

```html
<!-- before -->
<li *ngFor="let item of items; trackBy: trackById">{{ item.name }}</li>

<!-- after -->
@for (item of items; track item.id) {
  <li>{{ item.name }}</li>
}
```

## Migrating from NgModules to standalone

```ts
// before
@NgModule({ declarations: [OrderCard], imports: [CommonModule], exports: [OrderCard] })
export class OrdersModule {}

// after
@Component({ selector: 'app-order-card', imports: [DatePipe], templateUrl: '...' })
export class OrderCardComponent {}
```

Migrate shared modules first, then feature modules, then routing (`loadComponent` and `loadChildren`).

## Migrating from `@Input` to signal inputs

```ts
// before
@Input() name!: string;

// after
name = input.required<string>();
```

## Migrating from zone-based to zoneless
1. Remove unnecessary `zone.run` and `NgZone` usage.
2. Convert state to signals.
3. Test third-party integrations and manual `markForCheck` calls.
4. Enable `provideZonelessChangeDetection()` in a branch and fix the failures.

## Migrating from AngularJS (1.x)
Use the hybrid approach with `@angular/upgrade`:
1. Bootstrap Angular alongside AngularJS.
2. Migrate leaf components first, then services, then routes.
3. Keep the same routes working for both during the transition.
4. Add tests for existing behavior before rewriting. Legacy apps often contain undocumented rules.

## Migrating build tools
When moving from the older Webpack-based builder to the application builder, update `angular.json`, remove custom Webpack configuration, and verify bundle output and budgets.

## Important points
- Keep a list of deprecations from each release and plan for them.
- Upgrade dependencies regularly (for example with Renovate) so migrations stay small.
- Track the upgrade in a changelog for the team.
