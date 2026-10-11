# 33. Environments & Configuration

> **Like I'm 5:** Environments are outfits for different places: home (dev), school (test), and a party (production). Settings like the server address change depending on which outfit the app is wearing.

## Key concepts
- **Build-time configuration** is fixed when the app is built (environment files swapped with `fileReplacements`).
- **Runtime configuration** is loaded when the app starts (for example, `config.json`). It allows one build to run in many environments.
- Never store secrets in frontend configuration. It is public: every visitor downloads it. (The tutorial shows the server address sitting readable inside the production JavaScript.)
- Learn it by doing: [Tutorial chapter 34](../tutorial/34-environments-and-configuration.md) builds both kinds and changes the shop's name without rebuilding.

## Build-time with `fileReplacements`

New projects have no environment files. Create them with:

```bash
ng generate environments
```

It creates `src/environments/environment.ts` (the **default, meant for production**) and `environment.development.ts`, and adds a `fileReplacements` entry to the `development` configuration (and one for every other build configuration you have, which you may delete if it is not an environment, such as a language build). The old name `environment.prod.ts` is not used any more.

```ts
// src/environments/environment.ts  (production, used by `ng build`)
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com/api',
};
```

```ts
// src/environments/environment.development.ts  (used by `ng serve`)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
};
```

```json
"development": {
  "fileReplacements": [
    { "replace": "src/environments/environment.ts", "with": "src/environments/environment.development.ts" }
  ]
}
```

See [32-build-and-bundling.md](32-build-and-bundling.md) for the build configurations. A check like `if (!environment.production) console.debug(...)` stops the message from printing in production, but the text stays in the bundle.

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
@Service()
export class ConfigService {
  private http = inject(HttpClient);
  readonly config = signal<AppConfig>(DEFAULTS);

  load() {
    return firstValueFrom(this.http.get<Partial<AppConfig>>('config.json').pipe(catchError(() => of({}))))
      .then((fromFile) => this.config.set({ ...DEFAULTS, ...fromFile }));
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => inject(ConfigService).load()),
  ],
};
```

Load the configuration before the app renders, so every service sees the correct values. Keep `defaults`, so a missing file does not break the app. Call `inject()` **before** the first `await`; after an `await` there is no injection context any more. Use `HttpClient` rather than a bare `fetch` so server-side rendering and tests work the same way.

Pages that show runtime values must not be prerendered (the value would be frozen into the HTML at build time). Use `RenderMode.Server` for them ([22](22-ssr-hydration-and-prerendering.md)).

## Environment variables in CI

Use a template and substitute values during the deployment step:

```bash
envsubst < public/config.template.json > dist/orders-app/browser/config.json
```

Or mount `config.json` from a Kubernetes ConfigMap or a Docker volume, so changes do not require a rebuild:

```bash
docker run -v "$(pwd)/config.json:/app/dist/toy-shop/browser/config.json:ro" toy-shop
```

Serve `config.json` with `Cache-Control: no-cache`, or browsers keep showing the old values ([34](34-cicd-and-deployment.md)).

## Feature flags
- Keep flags in configuration or a flag service (LaunchDarkly, Unleash, or your own).
- Remove a flag and its code once it is fully rolled out.

## Important points
- Build once, deploy everywhere. Runtime configuration keeps artifacts identical across environments.
- Validate the configuration on startup and show a clear error if a required value is missing.
- Use separate backend URLs per environment, and make sure CORS allows each frontend origin.
