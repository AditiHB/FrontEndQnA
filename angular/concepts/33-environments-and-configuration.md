# 33. Environments & Configuration

> **Like I'm 5:** Environments are outfits for different places: home (dev), school (test), and a party (production). Settings like the server address change depending on which outfit the app is wearing.

## Key concepts
- **Build-time configuration** is fixed when the app is built (for example, `environment.prod.ts`).
- **Runtime configuration** is loaded when the app starts (for example, `config.json`). It allows one build to run in many environments.
- Never store secrets in frontend configuration. It is public.

## Build-time with `fileReplacements`

```ts
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
};
```

```ts
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com/api',
};
```

`angular.json` replaces the file during the production build (see [32-build-and-bundling.md](32-build-and-bundling.md)).

## Injecting configuration with a token

```ts
export const API_URL = new InjectionToken<string>('API_URL');

providers: [{ provide: API_URL, useValue: environment.apiUrl }]

// in a service
private apiUrl = inject(API_URL);
```

Tokens make the value easy to override in tests.

## Runtime configuration

```json
// public/config.json (replaced per environment during deployment)
{ "apiUrl": "https://api.example.com/api", "featureFlags": { "newCheckout": true } }
```

```ts
export const CONFIG = new InjectionToken<AppConfig>('CONFIG');

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(async () => {
      const cfg = await fetch('/config.json').then(r => r.json());
      inject(CONFIG_STORE).set(cfg);
    }),
  ],
};
```

Load the configuration before the app renders, so every service sees the correct values.

## Environment variables in CI

Use a template and substitute values during the deployment step:

```bash
envsubst < public/config.template.json > dist/orders-app/browser/config.json
```

Or mount `config.json` from a Kubernetes ConfigMap, so changes do not require a rebuild.

## Feature flags
- Keep flags in configuration or a flag service (LaunchDarkly, Unleash, or your own).
- Remove a flag and its code once it is fully rolled out.

## Important points
- Build once, deploy everywhere. Runtime configuration keeps artifacts identical across environments.
- Validate the configuration on startup and show a clear error if a required value is missing.
- Use separate backend URLs per environment, and make sure CORS allows each frontend origin.
