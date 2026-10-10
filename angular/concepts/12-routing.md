# 12. Routing

> **Like I'm 5:** The router is a signboard for your app. Each URL points to a room (a component). `router-outlet` is the empty room where the current page appears.

## Key concepts
- The **router** maps URLs to components and manages navigation, history, and parameters.
- **RouterOutlet** is the placeholder where the matched component renders.
- **RouterLink** creates navigation links without full page reloads.

## Route configuration

```ts
// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'orders', loadChildren: () => import('./orders/orders.routes').then(m => m.ORDER_ROUTES) },
  { path: 'users/:id', component: UserDetailComponent, title: 'User' },
  { path: 'old-page', redirectTo: 'new-page', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent },   // wildcard: must be last
];
```

## Child routes

```ts
export const ORDER_ROUTES: Routes = [
  {
    path: '',
    component: OrdersShellComponent,
    children: [
      { path: '', component: OrderListComponent },
      { path: ':id', component: OrderDetailComponent },
    ],
  },
];
```

```html
<!-- orders-shell.html -->
<app-sidebar />
<router-outlet />
```

## Navigation

```html
<a routerLink="/orders" routerLinkActive="active">Orders</a>
<a [routerLink]="['/orders', order.id]">Order {{ order.id }}</a>
<a [routerLink]="['/search']" [queryParams]="{ q: 'shoes' }">Search</a>
```

```ts
private router = inject(Router);

goToOrder(id: string) {
  this.router.navigate(['/orders', id], { queryParams: { tab: 'items' } });
}
```

## Reading parameters

```ts
// Option 1: bind to inputs (recommended)
provideRouter(routes, withComponentInputBinding());

export class OrderDetailComponent {
  id = input.required<string>();        // from :id
  tab = input<string>();                // from ?tab=
}

// Option 2: observable
private route = inject(ActivatedRoute);
id$ = this.route.paramMap.pipe(map(p => p.get('id')));
```

## Route data, titles, and scroll

```ts
{ path: 'reports', component: ReportsComponent, data: { roles: ['admin'] } }

provideRouter(
  routes,
  withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
  withViewTransitions(),
);
```

Use a title strategy to set the page title per route:

```ts
export class AppTitleStrategy extends TitleStrategy {
  override updateTitle(snapshot: RouterStateSnapshot) {
    const t = this.buildTitle(snapshot);
    this.title.setTitle(t ? `${t} | Orders` : 'Orders');
  }
}
```

## Router events

```ts
router.events.pipe(filter(e => e instanceof NavigationEnd))
  .subscribe(e => analytics.pageView(e.urlAfterRedirects));
```

## Important points
- Use `pathMatch: 'full'` for empty-path redirects, or they match every URL.
- Put the wildcard route last.
- Guards and resolvers are covered in [../03-routing-and-http.md](../interviewQnA/03-routing-and-http.md). Interceptors are in [14-http-client-and-interceptors.md](14-http-client-and-interceptors.md).
