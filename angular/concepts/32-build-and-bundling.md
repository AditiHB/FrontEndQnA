# 32. Build & Bundling

> **Like I'm 5:** Build is packing a suitcase before a trip. The build squeezes your code, leaves out the clothes you never wear (tree shaking), and folds everything neatly so it's ready to ship.

## Key concepts
- `ng build` compiles TypeScript, templates (AOT), styles, and assets into optimized output in `dist/`.
- Angular uses the **application builder** (`@angular/build:application`, built on esbuild, with a Vite-based dev server). Older projects may still use `@angular-devkit/build-angular:browser` (Webpack). The CLI has an opt-in migration to the new builder (see [35](35-upgrades-and-migration.md)).
- Production builds enable minification, tree shaking, file-name hashing, and lazy chunks. In a new project `ng build` uses the production configuration by default.
- With server-side rendering the output has two folders: `browser/` (what visitors download) and `server/` (what Node runs).
- Learn it by doing: [Tutorial chapter 33](../tutorial/33-build-and-bundling.md) measures, budgets, and analyses the Toy Shop's build.

## Common commands

```bash
ng build                                  # default configuration (production in new projects)
ng build --configuration development      # unminified, source maps, no hashing
ng build --stats-json                     # also writes browser-stats.json for analysis
ng build --source-map                     # production build with source maps (keep them private)
ng serve --configuration staging          # any configuration you define in angular.json
```

A real comparison from the tutorial's Toy Shop (same code, same machine):

| | Development | Production |
|--|-------------|------------|
| Initial download (raw) | 2.33 MB | 663 kB (about 172 kB compressed) |
| File names | `main.js` | `main-QGEUPIQV.js` (hash) |
| Source maps | yes | no |

## `angular.json` build target (excerpt)

```json
"build": {
  "builder": "@angular/build:application",
  "options": {
    "browser": "src/main.ts",
    "tsConfig": "tsconfig.app.json",
    "styles": ["src/styles.css"],
    "assets": [{ "glob": "**/*", "input": "public" }]
  },
  "configurations": {
    "production": {
      "budgets": [
        { "type": "initial", "maximumWarning": "700kB", "maximumError": "1MB" },
        { "type": "anyComponentStyle", "maximumWarning": "4kB", "maximumError": "8kB" }
      ],
      "outputHashing": "all"
    },
    "development": {
      "optimization": false,
      "extractLicenses": false,
      "sourceMap": true
    }
  },
  "defaultConfiguration": "production"
}
```

Per-environment values (API address and so on) are described in [33](33-environments-and-configuration.md).

## Budgets
- `initial`: everything the browser must download before the app can start.
- `anyComponentStyle`: the CSS of one component.
- A **warning** prints a message. An **error** fails the build, which stops the pipeline.
- Real messages:

```
▲ [WARNING] bundle initial exceeded maximum budget. Budget 500.00 kB was not met by 163.05 kB with a total of 663.05 kB.
✘ [ERROR] bundle initial exceeded maximum budget. Budget 600.00 kB was not met by 63.05 kB with a total of 663.05 kB.
```

Set limits a little above today's size and find out *why* when one trips, before you raise it.

## Analyzing the bundle

```bash
ng build --stats-json                     # writes dist/<app>/browser-stats.json
```

The stats file lists every input that went into every output. A small script can add the bytes up by package (the tutorial builds one: `npm run analyze`), or load the file into a visual analyzer. For a treemap from source maps:

```bash
ng build --source-map
npx source-map-explorer dist/<app>/browser/*.js
```

- Look for large libraries pulled into the initial chunk.
- Check that lazy features are in separate chunks.
- Measure before you optimise. In the Toy Shop, Angular and its CDK/Material/Router/Common/Forms libraries made up most of the weight; the pages written by hand were about 39 kB.

## Tree shaking
- Works with ES modules: the builder follows `import` and `export` and leaves out exports nobody uses. In an experiment, an unused exported function was **not** in the bundle, but a bare `import './legacy'` that runs code at load time **was**.
- CommonJS libraries cannot be shaken well. Prefer packages that ship ES modules.
- A service with `@Service()` or `providedIn: 'root'` is only included if something injects it.
- Mark a package as side-effect free in `package.json` only if it is true: `"sideEffects": false`. In the experiment, adding it to the app's own `package.json` made the bare side-effect import disappear, which is dangerous if that import was supposed to run.

## Source maps
- Generate them for development and for error tracking uploads.
- Do not publish production source maps to the public site unless you intend to. Anyone can read your original code with them. A production build with `--source-map` grew the output folder from 1.1 MB to 5.0 MB and added one `.map` file per chunk.

## Styles
- Global styles in `styles.css` (or `.scss`). Component styles are scoped by default.
- Keep Sass partials small. Use CSS custom properties for theming.

## Important points
- Keep the dev and prod builds close in behavior. Test the production build locally before a release (for example `ng build` and then run the built server or serve `dist/.../browser`).
- Piping `ng build` into another command that closes early (for example `| head`) can cut the build short.
- Commit the lock file so builds are reproducible.
- Pin the Node.js version in `.nvmrc` or `engines` to avoid CI differences.
