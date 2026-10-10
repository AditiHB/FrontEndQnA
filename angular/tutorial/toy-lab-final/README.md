# Toy Lab (finished)

The finished workspace for [Chapter 30: Libraries, monorepos and schematics](../30-libraries-and-schematics.md) and [Chapter 31: Web components](../31-web-components.md) of the Angular tutorial.

| Part | What it is | Chapter |
|------|------------|---------|
| `projects/toy-ui` | A component **library** (`ToyBadge`, `ToyStars`), built with ng-packagr | 30 |
| `projects/demo` | An app that uses the library | 30 |
| `projects/widget` | An app that turns `ToyStars` into the custom HTML tag `<toy-stars-widget>` | 31 |
| `toy-schematics` | Our own **schematic** (`toy-page`), a small separate npm package | 30 |

## Run it

```bash
npm ci
ng build toy-ui          # the demo and the widget read the library from dist/
ng test                  # tests for all projects
ng serve demo            # http://localhost:4200
ng build widget          # then serve dist/widget/browser with any static server
```

The schematic is compiled separately:

```bash
cd toy-schematics
npm install
npm run build
cd ..
ng generate ./toy-schematics/src/collection.json:toy-page about-us --dry-run
```

(`--dry-run` shows what would be created without writing files. The schematic is meant for a project that has `src/app/pages`, such as the Toy Shop; Chapter 30 runs it there.)

The extra widgets from the bonus lab of Chapter 31 are in [`../extras/ch31`](../extras/ch31/).
