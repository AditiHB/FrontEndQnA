# Chapter 36: Upgrades and migration

> **Like I'm 5:** Moving to a bigger house is easier if you move one room at a time. You also need a moving truck. `ng update` is the moving truck: it carries most of your furniture by itself, and it leaves little notes on the boxes it could not carry ("pack this one by hand"). The golden rule: move often and in small steps, not once every five years in one giant panic.

Concept reference: [35. Upgrades and migration](../concepts/35-upgrades-and-migration.md)

[Back: Chapter 35](35-cicd-and-deployment.md) · Next: [Chapter 37: Graduation day](37-graduation.md)

## What we build today

The Toy Shop is already on Angular 22, so there is nothing to upgrade in it. So we do two things:

1. A **real upgrade, step by step**, of a small practice app (`old-shop`) from **Angular 21 to Angular 22**. We ran it for real and show you what the truck really said.
2. We make the Toy Shop **easy to keep current**: a Node version file, an `engines` rule, and a robot that opens upgrade pull requests every week.

## The big idea

| Word | Plain words |
|------|-------------|
| **Major / minor / patch** | In `22.2.2`: `22` is the **major** (big changes allowed), `2` the **minor** (new features, nothing breaks), `2` the **patch** (bug fixes). |
| **Deprecated** | "Still works, but plan to stop using it." Deprecations are warnings from the future. |
| **Migration (schematic)** | A little program that edits your code to match a new version. |
| **`ng update`** | Updates the Angular packages **and** runs the migrations that go with the new version. |
| **Update guide** | A web page ([update.angular.dev](https://update.angular.dev/)) where you pick "from version" and "to version" and get a checklist. |

Facts to remember:

- Angular ships a **new major version about every six months**. Each major is supported for about **18 months**: roughly 6 months of regular updates, then 12 months where only critical fixes and security fixes arrive. Check the official release page for exact dates.
- **Upgrade one major version at a time** (21 to 22, then 22 to 23). Skipping makes it hard to find out what broke.
- Each Angular version needs certain **Node.js** versions. Angular CLI 22 needs `^22.22.3 || ^24.15.0 || >=26`. A too-old Node stops the CLI before it even starts.
- **Small and often beats big and rare.** Teams that upgrade every release spend an afternoon. Teams that wait three years spend a quarter.

## Step 1: Get the practice app

The files are in [`extras/ch36/old-shop`](extras/ch36/old-shop/). It is a plain Angular 21 app (what `ng new` made for 21) with three small files that look like "old style" code. Copy the folder somewhere, and install:

```bash
cd old-shop
npm install --legacy-peer-deps
git init && git add -A && git commit -m "angular 21 app"
```

(Why `--legacy-peer-deps`? See "If something goes wrong". And `ng update` wants a clean git folder, which is why we commit first.)

Here are the three old-style files:

**`old-shop/src/app/legacy-box.ts`**

```ts
import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-legacy-box',
  imports: [NgIf],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `<p *ngIf="open">Hello {{ name }}</p>`,
})
export class LegacyBox {
  @Input() name = 'friend';
  @Input() open = true;
}
```

**`old-shop/src/app/plain-box.ts`**

```ts
import { Component } from '@angular/core';

@Component({ selector: 'app-plain-box', template: `<b>plain</b>` })
export class PlainBox {}
```

**`old-shop/src/app/counter.ts`**

```ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Counter {
  count = 0;
}
```

- `legacy-box` uses `*ngIf` (the old control flow), `@Input()` decorators, and the old `Default` strategy name.
- `plain-box` is a component with **no** `changeDetection` setting at all.
- `counter` is a service written the old way, `@Injectable({ providedIn: 'root' })`.

## Step 2: Before you upgrade

A checklist, in order:

1. **Everything is committed** on a fresh branch (`git switch -c chore/angular-22`). `ng update` refuses to run on a dirty folder. We tried it:

   ```
   Error: Repository is not clean. Please commit or stash any changes before updating.
   ```
2. **Tests and build pass now.** If they fail before the upgrade, you will never know which failure is new.
3. **Read the update guide** for your versions, and the list of deprecations.
4. **Check your Node version** against the new Angular's requirement (`node -v`).
5. **Third-party libraries**: do they support the new Angular? `ng update` will complain if a library's peer dependency does not match.

## Step 3: Ask what can be updated

```bash
ng update
```

The real answer for `old-shop`:

```
Using package manager: npm
Collecting installed dependencies...
Found 15 dependencies.
    We analyzed your package.json, there are some packages to update:

      Name                       Version                  Command to update
     ------------------------------------------------------------------------
      @angular/cli               21.2.26 -> 22.2.2        ng update @angular/cli
      @angular/core              21.2.25 -> 22.2.2        ng update @angular/core

    There might be additional packages which don't provide 'ng update' capabilities that are outdated.
    You can update the additional packages by running the update command of your package manager.
```

Just asking changes nothing. (Note there is **no `--dry-run`** for `ng update`; we tried it and got `Error: Unknown argument: dry-run`. Your safety net is git and a branch, which is why Step 2 matters.)

## Step 4: Update

```bash
ng update @angular/core@22 @angular/cli@22 --create-commits
```

`--create-commits` makes one git commit **per step**, so you can read each change on its own. The real output (shortened):

```
The installed Angular CLI version is outdated.
Installing a temporary Angular CLI versioned 22 to perform the update.
Using package manager: npm
Collecting installed dependencies...
Found 15 dependencies.
Fetching dependency metadata from registry...
Updating package.json with dependency @angular/common to version 22.2.2...
Updating package.json with dependency @angular/compiler to version 22.2.2...
Updating package.json with dependency @angular/core to version 22.2.2...
...
Updating package.json with dependency typescript to version 6.0.3...
✔ Cleaning node modules directory
✔ Installing packages
  Committed migration step (d01fb9b18): Angular CLI update for packages - @angular/core@22, @angular/cli@22.
```

Look at what happened:

- The **old** CLI downloaded a temporary **new** CLI, and let it do the job. That is how an old project can start the upgrade.
- It rewrote the versions in `package.json` and reinstalled everything. That is the first commit:

  ```diff
  -    "@angular/core": "^21.2.0",
  +    "@angular/core": "^22.2.2",
  ...
  -    "typescript": "~5.9.2",
  +    "typescript": "~6.0.3",
  ```

  (The update also moved TypeScript from 5.9 to 6.0, the version Angular 22 works with.)

Then the **migrations** ran. Each one is a small program from the new Angular that edits your code:

```
** Executing migrations of package '@angular/core' **

❯ Adds the required third argument to canMatch callsites.
  Migration completed (No changes made).

❯ Adds `ChangeDetectionStrategy.Eager` to all components.
UPDATE src/app/app.ts (365 bytes)
UPDATE src/app/legacy-box.ts (362 bytes)
UPDATE src/app/plain-box.ts (211 bytes)
  Migration completed (3 files modified).
  Committed migration step (658eaeca4): @angular/core migration - change-detection-eager.

❯ Adds 'withXhr' to 'provideHttpClient' function calls when the 'HttpXhrBackend' is used.
  Migration completed (No changes made).

❯ Adds withNoIncrementalHydration() opt out to provideClientHydration() when incremental hydration is not enabled to retain pre-v22 behavior-.
  Migration completed (No changes made).

❯ Migrate broken duplicate outputs.
  Migration completed (No changes made).

❯ Wraps optional chaining expressions in $safeNavigationMigration().
  Migration completed (No changes made).

❯ Disables the 'nullishCoalescingNotNullable & optionalChainNotNullable extended diagnostics.
UPDATE tsconfig.app.json (624 bytes)
  Migration completed (1 file modified).
  Committed migration step (5abf7fe14): @angular/core migration - strict-safe-navigation-narrow.

❯ Adds 'strictTemplates: false' in tsconfig.json when not set.
  Migration completed (No changes made).

** Executing migrations of package '@angular/cli' **

❯ Add 'istanbul-lib-instrument' to 'devDependencies' if Karma unit testing is used.
  Migration completed (No changes made).

❯ Add 'trustProxyHeaders' configuration to 'AngularNodeAppEngine' or 'AngularAppEngine'.
  Migration completed (No changes made).

❯ Update the angular workspace configuration.
  Migration completed (No changes made).

** Optional migrations of package '@angular/cli' **

This package has 2 optional migrations that can be executed.
❯ Migrate projects using legacy Karma unit-test builder to the new unit-test builder with Vitest.
  ng update @angular/cli --name migrate-karma-to-vitest

❯ Migrate application projects to the new build system.
  ng update @angular/cli --name use-application-builder
```

Eleven migrations ran, only **two** changed anything. This is normal: most migrations look for something specific and do nothing if it is not there. The last block, **optional migrations**, is not run for you: it is a menu of bigger changes you may choose later (we meet them again at the end of this chapter). Read the two that did work:

### Migration: `ChangeDetectionStrategy.Eager`

Remember Chapter 16? In Angular 22, new components are **OnPush by default**, and the old name `Default` is now called **`Eager`**. If the migration did nothing, your old components would suddenly switch from "check me every time" to "check me only when told", and an old-style plain field might stop updating. So the truck pins **every** component to the **old behaviour** by writing `Eager` on it:

**`src/app/app.ts`** (after the migration)

```ts
import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('old-shop');
}
```

The same line was added to `plain-box.ts`, and `legacy-box.ts` had `Default` renamed to `Eager`.

This is a **safe first step**, not the end. Later, as in Chapter 16, you remove `Eager` one component at a time, and let each component become OnPush.

### Migration: diagnostics

```diff
+  "angularCompilerOptions": {
+    "extendedDiagnostics": {
+      "checks": {
+        "nullishCoalescingNotNullable": "suppress",
+        "optionalChainNotNullable": "suppress"
+      }
+    }
+  }
```

These two compiler warnings ("this `??` or `?.` is not needed here") belong to the way templates handle the safe navigation operator `?.` in Angular 22. The migration's own description is the one line you saw: *Disables the 'nullishCoalescingNotNullable & optionalChainNotNullable extended diagnostics.* The effect is that old code does not suddenly fill with new warnings. When you have cleaned up, you can switch the checks on again, and the release notes explain the details.

(Notice the migration also reformatted `include` and `exclude` in the same file. Migrations may touch layout.)

## Step 5: Does it still work?

```bash
npm run build
npm test
```

```
main-GXMGYLHJ.js  | main          | 216.83 kB |                59.61 kB
                    | Initial total | 216.83 kB |                59.61 kB
 Test Files  1 passed (1)
      Tests  2 passed (2)
```

Build works, tests pass. The upgrade is finished. Merge it, and move on to the real work.

## Step 6: Modernise, one schematic per commit

The upgrade itself keeps old code working. A different group of tools **rewrites old code into new style**. You run them when you want, one at a time, and commit after each:

```bash
ng generate @angular/core:<name>
```

The real list from Angular 22:

| Schematic | What it does |
|-----------|--------------|
| `control-flow` | `*ngIf`, `*ngFor`, `*ngSwitch` become `@if`, `@for`, `@switch` |
| `standalone` | NgModules become standalone components (in three passes) |
| `inject` | constructor injection becomes `inject()` |
| `signal-input-migration` | `@Input()` becomes `input()` |
| `outputs` | `@Output()` becomes `output()` |
| `signal-queries` | `@ViewChild` and friends become `viewChild()` and friends |
| `service` | `@Injectable` becomes `@Service()` |
| `common-to-standalone` | `CommonModule` becomes the exact imports you need |
| `ngclass-to-class`, `ngstyle-to-style` | `ngClass` and `ngStyle` become plain `class` and `style` bindings |
| `self-closing-tag` | `<app-x></app-x>` becomes `<app-x />` |
| `route-lazy-loading` | `component:` in routes becomes `loadComponent:` |
| `cleanup-unused-imports` | removes unused entries from `imports: []` |
| `signals` | runs all the signal ones together |

Unlike `ng update`, `ng generate` **has** a `--dry-run`. We ran the control-flow one that way first:

```bash
ng generate @angular/core:control-flow --dry-run
```

```
UPDATE src/app/legacy-box.ts (319 bytes)

NOTE: The "--dry-run" option means no changes were made.
```

It lists what it would change and writes nothing. Now for real, three of them, each in its own commit. First control flow:

```bash
ng generate @angular/core:control-flow
```

```diff
-import { NgIf } from '@angular/common';
 import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
 
 @Component({
   selector: 'app-legacy-box',
-  imports: [NgIf],
+  imports: [],
   changeDetection: ChangeDetectionStrategy.Eager,
-  template: `<p *ngIf="open">Hello {{ name }}</p>`,
+  template: `@if (open) {
+    <p>Hello {{ name }}</p>
+  }`,
 })
```

Second, signal inputs:

```bash
ng generate @angular/core:signal-input-migration
```

```
Successfully migrated to signal inputs 🎉
  -> Migrated 2/2 inputs.
UPDATE src/app/legacy-box.ts (344 bytes)
```

```diff
-import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
+import { ChangeDetectionStrategy, Component, input } from '@angular/core';
...
-  template: `@if (open) {
-    <p>Hello {{ name }}</p>
+  template: `@if (open()) {
+    <p>Hello {{ name() }}</p>
   }`,
...
-  @Input() name = 'friend';
-  @Input() open = true;
+  readonly name = input('friend');
+  readonly open = input(true);
```

Notice it also changed **how the template reads them** (`open` became `open()`). That is the real value of these tools: they follow every use.

Third, the service:

```bash
ng generate @angular/core:service
```

```diff
-import { Injectable } from '@angular/core';
+import { Service } from '@angular/core';
 
-@Injectable({ providedIn: 'root' })
+@Service()
 export class Counter {
```

One more, to see what "nothing to do" looks like:

```
$ ng generate @angular/core:cleanup-unused-imports
Scanning for unused imports using tsconfig.app.json

Schematic could not find unused imports in the project
Nothing to be done.
```

(The control-flow migration left `imports: []` behind. An empty list is not an *unused import*, so the tool correctly ignores it. Delete it by hand.)

After all of these, we built and tested again: **build ok (216.83 kB), 2 tests passed**.

> **Tips for migrations.** Run **one schematic per commit**. Run your tests after each. Read the diff, because a tool can be wrong in odd cases. If a tool says "skipped" for some file, finish that file by hand.

## Step 7: Keep the Toy Shop current

What does the Toy Shop look like now?

```bash
ng version
```

```
Angular CLI       : 22.2.2
Angular           : 22.2.2
Node.js           : 24.21.0
Package Manager   : npm 10.9.4
Operating System  : linux x64
...
│ @angular/core             │ 22.2.2            │ ^22.2.0           │
│ rxjs                      │ 7.8.2             │ ~7.8.0            │
│ typescript                │ 6.0.3             │ ~6.0.2            │
│ vitest                    │ 5.0.3             │ ^5.0.0            │
```

(The table lists every Angular package with the installed and the requested version. Include it when you ask for help.) Now ask npm what is outdated:

```bash
npm outdated
```

```
Package            Current   Wanted  Latest  Location
@playwright/test    1.56.1   1.64.0  1.64.0  node_modules/@playwright/test
@types/node        22.20.5  22.20.5  26.6.5  node_modules/@types/node
typescript           6.0.3    6.0.3   7.0.2  node_modules/typescript
typescript-eslint   8.69.0   8.69.0  8.71.1  node_modules/typescript-eslint
```

How to read it:

- **Wanted** is the newest version that your `package.json` range allows. `@playwright/test` can safely go from 1.56.1 to 1.64.0 with `npm update`.
- **Latest** is the newest version that exists. When Latest is a bigger **major** than Wanted (`typescript` 6 to 7, `@types/node` 22 to 26), that is a *decision*, not a command. Read the notes first.
- `@types/node` stays at 22 on purpose: it should match the **Node version you run**, not the newest.

Three small files make the future easier. First, a file that tells people (and tools like `nvm`) which Node the project uses:

**`.nvmrc`**

```
24
```

Second, a rule in `package.json`: npm warns anyone who tries to install with the wrong Node.

**`package.json`** (what changed)

```diff
@@ -17,6 +17,9 @@
   },
   "private": true,
   "packageManager": "npm@10.9.4",
+  "engines": {
+    "node": "^22.22.3 || ^24.15.0 || >=26.0.0"
+  },
   "dependencies": {
     "@angular/cdk": "^22.2.2",
     "@angular/common": "^22.2.0",
```

Third, a robot. **Dependabot** looks at your dependencies every week and opens a pull request when a newer version exists. Your CI robot (Chapter 35) then checks the pull request automatically, so you only read the result:

**`.github/dependabot.yml`**

```yaml
# A helper robot that opens pull requests when a newer version exists.
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    groups:
      angular:
        patterns: ['@angular/*', '@angular-eslint/*']
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
```

- `package-ecosystem: npm`: look at `package.json` weekly.
- `groups: angular`: all `@angular/*` and `@angular-eslint/*` packages arrive in **one** pull request, because they must move together.
- `package-ecosystem: github-actions`: also keep the actions in our workflow current (Chapter 35).

(Renovate is another popular robot that does the same job.)

A healthy routine for a team:

| When | What |
|------|------|
| **Every week** | Merge the green robot pull requests (patch and minor versions). |
| **Every Angular release** (about twice a year) | Run the full `ng update` steps above in one short-lived branch. |
| **Every quarter** | Look at `npm outdated` for the bigger decisions, and read the deprecation list. |
| **Every year** | Check the Node and TypeScript support windows. |

## Bigger migrations (reading only)

We did not build these. The Karma row and the builder row were even offered by the truck itself, in the "Optional migrations" menu above. Here is how to find your way:

| From | To | How |
|------|----|-----|
| NgModules | standalone | `ng generate @angular/core:standalone` runs in **three passes**: convert components, then remove unnecessary NgModules, then bootstrap with `bootstrapApplication`. Commit between passes. Shared modules first, feature modules next, routing last. |
| Karma and Jasmine | Vitest | `ng update @angular/cli --name migrate-karma-to-vitest --migrate-only` (this migration is in the Angular 22 CLI's list). Read what it says it converts, then fix the rest by hand; spies are the usual leftovers (`jasmine.createSpy` becomes `vi.fn`). |
| The old webpack-based builder (`@angular-devkit/build-angular:browser`) | the `application` builder | `ng update @angular/cli --name use-application-builder --migrate-only`. Remove custom webpack config first. Re-check budgets and bundle sizes (Chapter 33). |
| Zone.js | zoneless | Remove `NgZone` tricks, move state to signals (Chapter 10), test every `markForCheck`, then use `provideZonelessChangeDetection()` in a branch. New Angular 22 apps are already zoneless. |
| AngularJS (1.x) | Angular | Use the hybrid `@angular/upgrade` approach: run both side by side, migrate leaf components first, then services, then routes. Write tests for old behaviour **before** rewriting; old apps have undocumented rules. |

The `--name X --migrate-only` form is also how you re-run **one** migration on its own. You can see it in `ng update --help`:

```
--migrate-only    Only perform a migration, do not update the installed version.
--name            The name of the migration to run. Only available when a single package is updated.
-C, --create-commits  Create source control commits for updates and migrations.
```

## Check it works

- [ ] In `old-shop` after the upgrade, `package.json` says `^22.2.2` for the Angular packages and `~6.0.3` for TypeScript.
- [ ] `git log` shows three new commits: the package update and two migrations.
- [ ] `npm run build` and `npm test` pass.
- [ ] `ng generate @angular/core:control-flow --dry-run` lists files and changes none.
- [ ] In the Toy Shop, `ng version` shows Angular 22, and `npm outdated` runs.
- [ ] The Toy Shop has `.nvmrc`, an `engines` field, and `.github/dependabot.yml`.

## What you learned

- Angular has a major version about every six months. Upgrade **one major at a time**, often, and with a clean git branch.
- `ng update` changes the packages and runs migrations. `--create-commits` makes one commit per step. It has **no** dry run, so rely on git.
- `ng update` pinned our components to the old behaviour with `ChangeDetectionStrategy.Eager`, so that the upgrade could not change how anything updates. You decide later when to remove it.
- `ng generate @angular/core:<schematic>` modernises code (control flow, signal inputs, services, ...), has `--dry-run`, and should be run one per commit.
- `npm outdated` shows Current, Wanted, Latest. Minor and patch updates are routine; a new **major** is a decision.
- `.nvmrc`, `engines`, and Dependabot keep a project from drifting.

## Try it yourself

1. Do the whole upgrade on your own copy of `old-shop`. Look at `git log -p` for each commit.
2. Run `ng generate @angular/core:self-closing-tags-migration --dry-run` on the Toy Shop. Does it want to change anything?
3. Search the Toy Shop for `ChangeDetectionStrategy.Eager`. It finds nothing. Why? (Hint: the Toy Shop was created on Angular 22, so its components were already written for the new defaults.)
4. Run `npm outdated` in your own older project. Which update is a patch, which is a minor, which is a major?
5. Write a short "upgrade log" for your team: date, version from and to, commands run, problems met, time spent.
6. Change the Dependabot schedule to monthly. When would that be a bad idea?

## If something goes wrong

**`Error: Repository is not clean. Please commit or stash any changes before updating.`:** commit or stash first.

**`npm error Cannot read properties of null (reading 'edgesOut')` when installing a fresh Angular 21 project:** this is a bug in the npm we used (10.9.4) with the way the 21 project's dependencies are described. Install with `npm install --legacy-peer-deps`, or use a newer npm. We hit it, both while making the project and when installing the practice app.

**`Error: Unknown argument: dry-run`:** `ng update` has no dry run. (`ng generate` does.)

**`The installed Angular CLI version is outdated. Installing a temporary Angular CLI...`:** not an error. It is the normal way to start an upgrade.

**Peer dependency conflict (`ERESOLVE`):** a library does not support the new Angular yet. Check for a new version of the library, or wait. `--force` ignores the conflict and can break your app; use it only as a test.

**Tests fail only after the upgrade:** read the failing test, then the migration commit that touched that file. This is why we use `--create-commits`.

**The migration says `skipped` for a file:** the tool could not safely change it. Do that file by hand and read the message; it often says why.

**An old Node version:** the CLI stops with a message that your Node.js version is not supported. Install a supported Node (`nvm use` reads our `.nvmrc`).

Next: [Chapter 37: Graduation day](37-graduation.md)
