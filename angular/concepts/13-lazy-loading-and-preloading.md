# 13. Lazy Loading & Preloading

> **Like I'm 5:** It's like ordering pizza only when you are hungry. The app doesn't carry every feature in its backpack on day one. It fetches a feature when you need it, and preloading fetches it a little early so it's ready.

## Key concepts
- **Lazy loading** downloads a feature's code only when the user navigates to it.
- **Preloading** downloads lazy code in the background after the initial load, so later navigation is fast.
- **Code splitting** happens automatically at each dynamic `import()`.

## Lazy routes

```ts
export const routes: Routes = [
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.routes').then(m => m.REPORT_ROUTES),
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent),
  },
];
```

## Preloading strategies

```ts
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';

provideRouter(routes, withPreloading(PreloadAllModules));
```

Custom strategy: preload only routes marked with `data: { preload: true }`.

```ts
@Injectable({ providedIn: 'root' })
export class SelectivePreload implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    return route.data?.['preload'] ? load() : of(null);
  }
}

provideRouter(routes, withPreloading(SelectivePreload));
```

## Lazy components in templates (`@defer`)

```html
@defer (on interaction) {
  <app-advanced-editor />
} @placeholder {
  <button>Open editor</button>
}
```

## Lazy loading a library on demand

```ts
async exportPdf() {
  const { jsPDF } = await import('jspdf');   // loaded only when clicked
  const doc = new jsPDF();
  doc.save('report.pdf');
}
```

## Verify the split
- `ng build` prints chunk sizes. Check that each feature has its own chunk.
- Use `source-map-explorer` or `webpack-bundle-analyzer`-style tools to find large dependencies.

## Important points
- Do not import a lazy feature's module or service into the shell. That pulls it into the main bundle.
- Use `providedIn: 'root'` for shared services, and route-level `providers` for feature services, to avoid duplicate instances.
- Add `canMatch` guards so unauthorized users never download a restricted feature.
