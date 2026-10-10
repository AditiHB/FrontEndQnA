# 35. Upgrades & Migration

> **Like I'm 5:** Upgrading is moving to a new house one room at a time. `ng update` is the moving truck. It carries most of your stuff and tells you which boxes you need to pack by hand.

## Key concepts
- Angular releases a major version about every six months. Each major is supported for about 18 months: roughly 6 months of regular updates, then 12 months of critical and security fixes only. Check the official release page for exact dates.
- `ng update` changes the package versions **and** runs official migrations (small programs that edit your code). It prints what it did and what you must fix by hand.
- Upgrade one major version at a time. Skipping versions makes problems harder to trace.
- Each Angular version supports certain Node.js versions. Angular CLI 22 needs `^22.22.3 || ^24.15.0 || >=26`.
- Learn it by doing: [Tutorial chapter 36](../tutorial/36-upgrades-and-migration.md) runs a real Angular 21 to 22 upgrade and shows each commit.

## Upgrade steps

```bash
git switch -c chore/angular-upgrade        # a clean branch; ng update refuses a dirty folder
ng update                                  # shows what can be updated (changes nothing)
ng update @angular/core@22 @angular/cli@22 --create-commits   # one git commit per step
ng update @angular/material@22 @angular/cdk@22                # if you use them
npm test && npm run build
```

Notes from a real run:
- `ng update` has **no `--dry-run`** (`Error: Unknown argument: dry-run`). Your safety net is git. Without a clean folder you get `Error: Repository is not clean. Please commit or stash any changes before updating.`
- If the installed CLI is older, it installs a temporary new CLI and uses that. This is normal.
- `--create-commits` (`-C`) makes a commit for the package change and one for each migration that changed files.
- `ng update` also lists **optional** migrations at the end (for example Karma to Vitest and the move to the application builder). Run one with `ng update @angular/cli --name <migration> --migrate-only`.
- A `npm error Cannot read properties of null (reading 'edgesOut')` seen with npm 10.9.4 on a fresh Angular 21 project is an npm problem; installing with `--legacy-peer-deps` avoided it.

Steps that usually help:
1. Read the update guide at <https://update.angular.dev/> for the target version.
2. Make sure tests and the build pass before upgrading.
3. Upgrade Node.js to a version the new Angular version supports.
4. Upgrade third-party libraries that have peer dependency limits.
5. Run the app and smoke test the main journeys.

## What the Angular 22 update did in the tutorial's practice app

- Updated the Angular packages to 22.2.2 and TypeScript from 5.9 to 6.0.
- `ChangeDetectionStrategy.Eager` was added to every component. In Angular 22 the default is OnPush and the old `Default` is now called `Eager`; the migration keeps old behaviour until you choose to remove it ([11](11-change-detection.md)).
- Two template compiler checks about unnecessary `??` and `?.` were switched off in `tsconfig.app.json` so old code does not fill with new warnings.
- Several migrations looked for something (a `canMatch` guard needing a third argument, `HttpXhrBackend`, duplicate outputs, hydration settings, `trustProxyHeaders`) and made no change, because the project did not use it.

## Automated schematic migrations

These rewrite old code to new style. Run each in its own commit, then run the tests. Unlike `ng update`, `ng generate` **does** have `--dry-run`.

```bash
ng generate @angular/core:control-flow --dry-run   # list what would change
ng generate @angular/core:control-flow             # *ngIf / *ngFor to @if / @for
ng generate @angular/core:standalone               # NgModules to standalone (three passes)
ng generate @angular/core:inject                   # constructor injection to inject()
ng generate @angular/core:signal-input-migration   # @Input() to input() (and updates templates)
ng generate @angular/core:outputs                  # @Output() to output()
ng generate @angular/core:signal-queries           # @ViewChild etc. to viewChild() etc.
ng generate @angular/core:service                  # @Injectable to @Service()
ng generate @angular/core:cleanup-unused-imports   # remove unused imports from standalone components
ng generate @angular/core:route-lazy-loading       # component: to loadComponent:
```

Others in Angular 22: `common-to-standalone`, `ngclass-to-class`, `ngstyle-to-style`, `self-closing-tag`, `router-testing-module-migration`, and `signals` (runs all the signal migrations together).

## Migrating from `*ngIf` / `*ngFor` to control flow

```html
<!-- before -->
<li *ngFor="let item of items; trackBy: trackById">{{ item.name }}</li>

<!-- after -->
@for (item of items; track item.id) {
  <li>{{ item.name }}</li>
}
```

The migration leaves `imports: []` behind in a component that no longer needs `NgIf`. An empty list is not an "unused import", so delete it by hand.

## Migrating from NgModules to standalone

```ts
// before
@NgModule({ declarations: [OrderCard], imports: [CommonModule], exports: [OrderCard] })
export class OrdersModule {}

// after
@Component({ selector: 'app-order-card', imports: [DatePipe], templateUrl: '...' })
export class OrderCard {}
```

Run `ng generate @angular/core:standalone` in its three passes (convert components, remove unnecessary NgModules, bootstrap with `bootstrapApplication`) and commit between passes. Migrate shared modules first, then feature modules, then routing (`loadComponent` and `loadChildren`).

## Migrating from `@Input` to signal inputs

```ts
// before
@Input() name!: string;

// after
name = input.required<string>();
```

Real result: `@Input() name = 'friend'` became `readonly name = input('friend')`, and the template's `{{ name }}` became `{{ name() }}`.

## Migrating from zone-based to zoneless
New Angular 22 apps are already zoneless. For an older app:
1. Remove unnecessary `zone.run` and `NgZone` usage.
2. Convert state to signals.
3. Test third-party integrations and manual `markForCheck` calls.
4. Enable `provideZonelessChangeDetection()` in a branch and fix the failures, then remove `zone.js` from the build.

## Migrating test runners
`ng update @angular/cli --name migrate-karma-to-vitest --migrate-only` moves a Karma project to the Vitest-based unit test builder. Expect to fix spies and fake-timer code by hand ([27](27-testing.md)).

## Migrating from AngularJS (1.x)
Use the hybrid approach with `@angular/upgrade`:
1. Bootstrap Angular alongside AngularJS.
2. Migrate leaf components first, then services, then routes.
3. Keep the same routes working for both during the transition.
4. Add tests for existing behavior before rewriting. Legacy apps often contain undocumented rules.

## Migrating build tools
When moving from the older Webpack-based builder to the application builder, run `ng update @angular/cli --name use-application-builder --migrate-only` (a migration in the Angular 22 CLI), remove custom Webpack configuration, and verify bundle output and budgets ([32](32-build-and-bundling.md)).

## Keeping current
- Add `.nvmrc` and an `engines` field to `package.json`, so everyone uses a supported Node.
- Let Dependabot or Renovate open pull requests every week. Group the `@angular/*` packages into one pull request.
- Use `npm outdated` (Current, Wanted, Latest). A new **major** version is a decision, not a command.
- Keep a list of deprecations from each release and plan for them.
- Track the upgrade in a changelog for the team.

## Important points
- Upgrade often and in small steps.
- Use git, a branch, and `--create-commits`; there is no dry run for `ng update`.
- Read the diff of every migration. A tool can be wrong in odd cases.
