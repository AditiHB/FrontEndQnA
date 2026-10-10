# 1. Project Setup & Angular CLI

> **Like I'm 5:** Angular CLI is a helper robot. You say "make me a new app" (`ng new`) or "add a room" (`ng generate`), and it builds the boring parts for you and checks that everything works. `angular.json` is the robot's instruction card.

## Key concepts
- **Angular CLI** (`@angular/cli`): creates, builds, serves, tests, and updates Angular projects.
- **Workspace**: one or more projects described by `angular.json`.
- **Bootstrapping**: the entry point (`main.ts`) starts the root component with an application config.

## Common commands

```bash
npm install -g @angular/cli
ng new orders-app --routing --style=scss --strict
cd orders-app
ng serve                     # dev server at http://localhost:4200
ng generate component orders/order-list   # alias: ng g c orders/order-list
ng generate service orders/order-api
ng generate guard auth/auth --functional
ng build --configuration production
ng test
ng lint                      # if the lint builder is configured
ng add @angular/material     # runs schematics that configure the library
ng update @angular/core @angular/cli   # step-by-step major upgrades
```

## Project structure (modern standalone app)

```
orders-app/
├── angular.json          # build, serve, test targets and budgets
├── package.json
├── tsconfig.json         # strict compiler options
├── src/
│   ├── main.ts           # bootstrapApplication(AppComponent, appConfig)
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
bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
```

## Important points
- Use `--strict` for strict TypeScript and template type checking (`strictTemplates`).
- `ng update` migrates code automatically between major versions; read the update guide first.
- Keep generated code consistent with the team's schematics or custom generators.
