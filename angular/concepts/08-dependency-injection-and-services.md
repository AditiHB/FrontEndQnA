# 8. Dependency Injection & Services

## Key concepts
- **Service**: a class that holds logic or state and is shared through DI.
- **Injector hierarchy**: element injectors (components), route injectors (lazy routes), and the root (environment) injector.
- Angular resolves a dependency by walking up the hierarchy until it finds a provider.

## Creating a service

```ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private _items = signal<CartItem[]>([]);

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((n, i) => n + i.qty, 0));

  add(item: CartItem) {
    this._items.update(list => [...list, item]);
  }
}
```

## Provider types

```ts
providers: [
  CartService,                                        // class provider
  { provide: API_URL, useValue: 'https://api.example.com' },
  { provide: Logger, useClass: ConsoleLogger },
  { provide: Config, useFactory: () => loadConfig(inject(HttpClient)) },
  { provide: Shortcut, useExisting: CartService },    // alias
  { provide: HTTP_INTERCEPTORS, useClass: X, multi: true },  // multi-provider
]
```

## Tokens

```ts
export const FEATURE_FLAGS = new InjectionToken<Record<string, boolean>>('FEATURE_FLAGS', {
  providedIn: 'root',
  factory: () => ({ newCheckout: false }),
});

const flags = inject(FEATURE_FLAGS);
```

## Scope options

| Scope | How | Instance |
|-------|-----|----------|
| App-wide singleton | `providedIn: 'root'` | One per app |
| Lazy feature | `providers` in route config | One per lazy route |
| Component subtree | `providers` in `@Component` | One per component instance |

```ts
export const ORDER_ROUTES: Routes = [
  { path: '', component: OrderListComponent, providers: [OrderFilterService] },
];
```

## Modifiers

```ts
import { Optional, Self, SkipSelf, Host } from '@angular/core';

private logger = inject(Logger, { optional: true });   // null if missing
private local = inject(Theme, { self: true });         // only this injector
private parent = inject(Theme, { skipSelf: true });    // ignore this injector
```

## Important points
- Prefer `inject()` in field initializers. It works in functions too (guards, interceptors).
- Services must not hold component-specific state unless provided at component level.
- Avoid circular dependencies. Move shared logic into a third service.
- Use `providedIn: 'root'` for tree-shakable services. Unused services are removed from the bundle.
