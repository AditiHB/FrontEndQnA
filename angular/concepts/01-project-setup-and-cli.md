# 1. Project Setup & Angular CLI

> **Like I'm 5:** Angular CLI is a helper robot. You say "make me a new app" (`ng new`) or "add a room" (`ng generate`), and it builds the boring parts for you and checks that everything works. `angular.json` is the robot's instruction card.

## Key concepts
- **Angular CLI** (`@angular/cli`): creates, builds, serves, tests, and updates Angular projects.
- **Workspace**: one or more projects described by `angular.json`.
- **Bootstrapping**: the entry point (`main.ts`) starts the root component with an application config.
- Angular 22 defaults for a new project: standalone components, **no `zone.js`** (zoneless), **OnPush** components, **Vitest** for unit tests, the `@angular/build` (esbuild) builder, strict TypeScript and template checks, and short file names (`app.ts`, not `app.component.ts`).
- Learn it by doing: [Tutorial chapter 1](../tutorial/01-set-up-and-meet-the-cli.md) creates the Toy Shop and explains every generated file.

## Common commands

```bash
npm install -g @angular/cli
ng new orders-app --routing --style=scss   # strict mode is already the default
cd orders-app
ng serve                     # dev server at http://localhost:4200
ng generate component orders/order-list   # alias: ng g c orders/order-list
ng generate service orders/order-api
ng generate guard auth/auth --implements CanActivate
ng build --configuration production
ng test                      # Vitest in Angular 22
ng add angular-eslint        # then: ng lint
ng version                   # CLI, Angular, Node, and package versions
ng add @angular/material     # runs schematics that configure the library
ng update @angular/core @angular/cli   # step-by-step major upgrades (see 35)
ng new demo --dry-run        # list what a command would create, write nothing
```

## Project structure (modern standalone app)

```
orders-app/
├── angular.json          # build, serve, test targets and budgets
├── package.json
├── tsconfig.json         # strict compiler options
├── src/
│   ├── main.ts           # bootstrapApplication(App, appConfig)
│   ├── index.html
│   ├── styles.scss
│   └── app/
│       ├── app.ts / app.html / app.scss
│       ├── app.config.ts # providers: router, http, animations, ...
│       └── app.routes.ts
```

## Bootstrapping a standalone app

```ts
// app.config.ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};

// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
bootstrapApplication(App, appConfig).catch(err => console.error(err));
```

## Important points
- Strict TypeScript and template type checking (`strictTemplates`) are on by default in new projects. Keep them on.
- `ng update` migrates code automatically between major versions; read the update guide first.
- Keep generated code consistent with the team's schematics or custom generators.
