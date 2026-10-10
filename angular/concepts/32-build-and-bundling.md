# 32. Build & Bundling

> **Like I'm 5:** Build is packing a suitcase before a trip. The build squeezes your code, leaves out the clothes you never wear (tree shaking), and folds everything neatly so it's ready to ship.

## Key concepts
- `ng build` compiles TypeScript, templates (AOT), styles, and assets into optimized output in `dist/`.
- Modern Angular uses the **application builder** (esbuild and Vite-based dev server) by default in new projects.
- Production builds enable minification, tree shaking, hashing, and lazy chunks.

## Common commands

```bash
ng build                                  # default configuration (production in new projects)
ng build --configuration development      # faster, readable output
ng build --configuration production --stats-json
ng serve --configuration staging
```

## `angular.json` build target (excerpt)

```json
"build": {
  "builder": "@angular-devkit/build-angular:application",
  "options": {
    "outputPath": "dist/orders-app",
    "browser": "src/main.ts",
    "index": "src/index.html",
    "styles": ["src/styles.scss"],
    "polyfills": [],
    "outputHashing": "all",
    "sourceMap": false
  },
  "configurations": {
    "production": {
      "budgets": [
        { "type": "initial", "maximumWarning": "500kB", "maximumError": "1MB" },
        { "type": "anyComponentStyle", "maximumWarning": "4kB", "maximumError": "8kB" }
      ],
      "optimization": true,
      "fileReplacements": [
        { "replace": "src/environments/environment.ts", "with": "src/environments/environment.prod.ts" }
      ]
    }
  }
}
```

## Budgets
- `initial`: the main bundle loaded on startup.
- `anyComponentStyle`: component stylesheets.
- Budgets fail the build when a limit is exceeded. This stops unplanned growth.

## Analyzing the bundle

```bash
npx source-map-explorer dist/orders-app/browser/*.js
```

- Look for large libraries pulled into the main chunk.
- Check that lazy features are in separate chunks.

## Tree shaking
- Works with ES modules. Use `providedIn: 'root'` for services so unused ones are dropped.
- Avoid side-effect imports and global registration in library code.
- Mark packages as side-effect free in `package.json` if true: `"sideEffects": false`.

## Source maps
- Generate them for development and for error tracking uploads.
- Do not publish production source maps to the public site unless you intend to.

## Styles
- Global styles in `styles.scss`. Component styles are scoped by default.
- Keep Sass partials small. Use CSS custom properties for theming.

## Important points
- Keep the dev and prod builds close in behavior. Test the production build locally before a release (`ng build && npx http-server dist/...`).
- Commit the lock file so builds are reproducible.
- Pin the Node.js version in `.nvmrc` or `engines` to avoid CI differences.
