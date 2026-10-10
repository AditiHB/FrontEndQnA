# Chapter 1: Set up and meet the CLI

> **Like I'm 5:** Before you build a toy shop, you need an empty shop building with the lights on and a helper robot who can fetch you bricks. The Angular CLI is that robot. You say what you want, and it builds the walls for you.

Concept reference: [01. Project setup and CLI](../concepts/01-project-setup-and-cli.md)

[Back: Chapter 0](00-welcome.md) · Next: [Chapter 2: Components](02-components.md)

## What we build today

An empty Toy Shop that runs in your browser and says "Toy Shop" with a welcome line. It is tiny, but it is a **real** Angular app: it builds, it has a test, and it can be shipped.

## The big idea

You *could* make an Angular project by hand: dozens of files, settings, and tools that must all agree with each other. That is like building a house and also forging your own nails.

Instead, we use the **Angular CLI** (CLI means *command-line interface*, a program you talk to by typing). One command, `ng new`, makes the whole house. Other commands run it (`ng serve`), test it (`ng test`), pack it for the world (`ng build`), and make new rooms (`ng generate`).

**Grown-up words:**

- **Workspace / project**: the folder with `angular.json` in it. It describes your app and how to build it.
- **Dev server**: a small web server for you only. It rebuilds and refreshes the page whenever you save.
- **Build**: turn your TypeScript, HTML, and CSS into plain files that any browser can run.
- **Schematic**: a recipe the CLI follows to create or change files (`ng generate component` runs one).

## Step 1: Install the CLI

Open a terminal and run:

```bash
npm install -g @angular/cli
```

`-g` means *global*: the `ng` command works from every folder. (If you cannot install globally, put `npx @angular/cli` in front of every `ng` command in this tutorial instead. For example `npx @angular/cli new toy-shop`.)

Check that it worked:

```bash
ng version
```

Outside a project it prints a few lines like this (your numbers will differ, but the first number must be **22**):

```
Angular CLI       : 22.2.2
Node.js           : 24.21.0
Package Manager   : npm 10.9.4
Operating System  : linux x64
```

## Step 2: Create the project

```bash
ng new toy-shop --routing --style=css --ssr=false --ai-config=none
```

What did we ask for?

| Flag | Meaning |
|------|---------|
| `toy-shop` | The name of the folder and the project |
| `--routing` | Include the router, so we can have many pages (Chapter 11) |
| `--style=css` | Plain CSS for styles. (Sass and others work too; we keep it simple.) |
| `--ssr=false` | No server rendering yet. We add it ourselves in Chapter 28, so you see how it works. |
| `--ai-config=none` | Do not add config files for AI helpers |

If you type just `ng new toy-shop`, the CLI asks the same questions one by one. Give the same answers.

The robot now writes the files, installs the packages (this takes a minute), and makes the first git commit. When it finishes:

```bash
cd toy-shop
```

You can see what `ng new` creates without making anything by adding `--dry-run`. It prints a list like this:

```
CREATE toy-shop/.prettierrc (161 bytes)
CREATE toy-shop/angular.json (1909 bytes)
CREATE toy-shop/package.json (783 bytes)
CREATE toy-shop/src/main.ts (222 bytes)
CREATE toy-shop/src/index.html (293 bytes)
CREATE toy-shop/src/app/app.ts (291 bytes)
...
```

## Step 3: Walk around the building

Open the folder in your editor (`code .` if you use VS Code). Here is the map of the files that matter:

| File | What it is for |
|------|----------------|
| `package.json` | The shopping list: which packages the project needs, and the scripts (`npm start`, `npm test`) |
| `angular.json` | The CLI's settings: how to build, serve, and test |
| `tsconfig.json` | The TypeScript rulebook (we use *strict* mode, the careful one) |
| `src/index.html` | The one real web page. Angular puts our app inside it. |
| `src/main.ts` | The front door: starts (bootstraps) the app |
| `src/styles.css` | Styles for the whole app |
| `src/app/app.ts` | The first component: the root of our shop |
| `src/app/app.html` | The root component's template (what it looks like) |
| `src/app/app.config.ts` | App-wide settings (we add router, HTTP, and more here later) |
| `src/app/app.routes.ts` | The list of pages (empty for now) |
| `src/app/app.spec.ts` | The first test |
| `public/` | Files that are copied as they are (the favicon, and later pictures) |

Let's read the three most important ones. First, the front door:

**`src/main.ts`**

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
```

`bootstrapApplication` means "start the app with this root component (`App`) and these settings (`appConfig`)". Next, the settings:

**`src/app/app.config.ts`**

```ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes)],
};
```

`providers` is a list of helpers the whole app can use. Right now there are two: one that reports unexpected errors in the browser, and the router. And the root component:

**`src/app/app.ts`**

```ts
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('toy-shop');
}
```

A **component** is a tiny piece of screen. `@Component(...)` is a label that tells Angular "this class is a component". We make our own components in Chapter 2, so do not worry about the details yet.

Two details to notice:

- The file is called `app.ts`, and the class is `App`. Older tutorials say `app.component.ts` and `AppComponent`. In Angular 22 the names are shorter.
- There is no `zone.js` in `package.json`. New apps are *zoneless*. We explain what that means in Chapter 16.

## Step 4: Run it

```bash
npm start
```

(`npm start` runs `ng serve`, which is the dev server. You can type `ng serve` too.) After a few seconds you see:

```
Application bundle generation complete.

Watch mode enabled. Watching for file changes...
NOTE: Raw file sizes do not reflect development server per-request transformations.
  ➜  Local:   http://localhost:4200/
```

Open <http://localhost:4200/>. You see Angular's big welcome page. Leave the terminal running. This is your dev server, and it will refresh the page each time you save a file.

## Step 5: Make it ours

The welcome page is 353 lines of demo. We do not need any of it. Open `src/app/app.html`, delete everything, and type this:

**`src/app/app.html`**

```html
<h1>{{ title() }}</h1>
<p>Welcome! Our toys are coming soon.</p>

<router-outlet />
```

Save the file. Look at the browser: it already changed, without you pressing refresh. That is the dev server's live reload.

The page still shows `{{ title() }}`, which means "put the value of `title` here". It shows the old name, so let's change it. In `src/app/app.ts`, change the one line:

**`src/app/app.ts`** (what changed)

```diff
@@ -8,5 +8,5 @@ import { RouterOutlet } from '@angular/router';
   templateUrl: './app.html',
 })
 export class App {
-  protected readonly title = signal('toy-shop');
+  protected readonly title = signal('Toy Shop');
 }
```

Also give the browser tab a nicer name. In `src/index.html`:

**`src/index.html`** (what changed)

```diff
@@ -2,7 +2,7 @@
 <html lang="en">
   <head>
     <meta charset="utf-8" />
-    <title>ToyShop</title>
+    <title>Toy Shop</title>
     <base href="/" />
     <meta name="viewport" content="width=device-width, initial-scale=1" />
     <link rel="icon" type="image/x-icon" href="favicon.ico" />
```

You should now see **Toy Shop** as a heading, and "Welcome! Our toys are coming soon." below it.

The `<router-outlet />` line is a hole where pages will appear. It is empty until Chapter 11.

## Step 6: Run the test

The CLI also made a test. Stop the dev server with `Ctrl+C` if you want a quiet terminal, or open a second terminal, and run:

```bash
npm test
```

It will fail, and that is a good sign! The test still expects the *old* title. Open `src/app/app.spec.ts` and update the second test:

**`src/app/app.spec.ts`** (what changed)

```diff
@@ -14,10 +14,10 @@ describe('App', () => {
     expect(app).toBeTruthy();
   });
 
-  it('should render title', async () => {
+  it('should render the shop title', async () => {
     const fixture = TestBed.createComponent(App);
     await fixture.whenStable();
     const compiled = fixture.nativeElement as HTMLElement;
-    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, toy-shop');
+    expect(compiled.querySelector('h1')?.textContent).toContain('Toy Shop');
   });
 });
```

(The test reads: "make the App, wait until it is drawn, look for the `h1`, and check that its words contain `Toy Shop`.") Run it once without watching:

```bash
npx ng test --watch=false
```

```
 Test Files  1 passed (1)
      Tests  2 passed (2)
```

Green! Tests are like a toy inspector who checks every toy before it goes on the shelf. We will write many more starting from Chapter 2, and Chapter 24 is all about testing.

## Step 7: Build it for the world

The dev server is for you. To make files you can *put on a real website*, run:

```bash
npm run build
```

```
Initial chunk files | Names         |  Raw size | Estimated transfer size
main-XBFRWUB6.js    | main          | 190.24 kB |                51.99 kB
styles-5INURTSO.css | styles        |   0 bytes |                 0 bytes

                    | Initial total | 190.24 kB |                51.99 kB

Application bundle generation complete.
Output location: .../toy-shop/dist/toy-shop
```

(Your file names have different random letters. The letters are a *fingerprint* of the content, and they matter in Chapter 35.)

Two numbers: **190 kB raw** is the real size of the JavaScript, and **52 kB** is how much travels over the internet after compression. Angular ships a runtime plus your code, so the very first app is not zero. The files are in `dist/toy-shop/browser`. We will watch these numbers as the shop grows (Chapters 27 and 33).

## Step 8: Meet the generator (just look)

The CLI can write new pieces for you. Ask it what it *would* create, without creating anything:

```bash
ng generate component components/hello --dry-run
```

```
CREATE src/app/components/hello/hello.css (0 bytes)
CREATE src/app/components/hello/hello.spec.ts (525 bytes)
CREATE src/app/components/hello/hello.ts (181 bytes)
CREATE src/app/components/hello/hello.html (20 bytes)

NOTE: The "--dry-run" option means no changes were made.
```

One command: a class, a template, a style file, and a test. We will use `ng generate` constantly from Chapter 2 on. `--dry-run` is a handy habit: look before you leap. To see everything it can generate, run `ng generate --help` (components, directives, pipes, services, guards, interceptors, and more).

## Step 9: Commit

```bash
git add -A
git commit -m "Chapter 1: set up the Toy Shop"
```

`ng new` already started a git history for you. From now on, commit at the end of every chapter.

## Check it works

- [ ] `npm start` shows the page with **Toy Shop** and the welcome line.
- [ ] `npx ng test --watch=false` says `Tests  2 passed (2)`.
- [ ] `npm run build` ends with `Application bundle generation complete.`

## Cheat sheet: the commands you will use all the time

| Command | What it does |
|---------|--------------|
| `ng new name` | Make a new project |
| `ng serve` (or `npm start`) | Run the dev server |
| `ng test` | Run the tests |
| `ng build` | Make the production files |
| `ng generate component name` | Make a component (`ng g c name` is short) |
| `ng add package` | Install a package *and* set it up |
| `ng update` | Upgrade Angular and fix your code (Chapter 36) |
| `ng version` | Show versions |
| `ng generate ... --dry-run` | Show what would be created, create nothing |

## What you learned

- The Angular CLI creates, runs, tests, builds, and extends your project.
- A project is a workspace: `angular.json` for the CLI, `package.json` for packages, `src/` for your code.
- `main.ts` starts the app, `app.config.ts` holds app-wide helpers, and `app.ts` is the first component.
- `ng serve` live-reloads, `ng test` runs Vitest, and `ng build` makes the files you ship.

## Try it yourself

1. Change the welcome line to something that sounds like your own shop. Does the test still pass? (It only checks the `h1`.)
2. Add `<p>Open every day!</p>` under the welcome line.
3. Run `ng build --configuration development` and compare its size with the production build. Why is the production one smaller?
4. Run `ng generate pipe shout --dry-run`. Which four files would it create?

## If something goes wrong

**The Angular CLI refuses to start:**

```
Node.js version v22.22.0 detected.
The Angular CLI requires a minimum Node.js version of v22.22.3 or v24.15.0 or v26.0.0.
```

Your Node is too old. Install a newer one (`nvm install 24` if you use nvm) and try again.

**`ng: command not found`:** the global install is not on your PATH. Use `npx @angular/cli ...` instead, or fix your PATH.

**The dev server will not start:**

```
Port 4200 is already in use. Use '--port' to specify a different port.
```

Another program (maybe another `ng serve`) uses that port. Stop it, or run `ng serve --port 4300`.

**`npm install` shows `EBADENGINE` warnings:** these mean some package prefers a different Node version. Updating Node removes them.

Next: [Chapter 2: Components](02-components.md)
