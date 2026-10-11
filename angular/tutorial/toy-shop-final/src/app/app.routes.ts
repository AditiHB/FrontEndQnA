import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin-guard';
import { authGuard } from './guards/auth-guard';
import { unsavedChangesGuard } from './guards/unsaved-changes-guard';
import { Home } from './pages/home/home';
import { NotFound } from './pages/not-found/not-found';

// Only the home page is in the first download. Every other page is fetched
// the first time somebody visits it (loadComponent), or quietly in the background
// when it says data: { preload: true }.
export const routes: Routes = [
  { path: '', component: Home, title: 'Toy Shop' },
  {
    path: 'product/:id',
    title: 'Toy details',
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then((m) => m.ProductDetail),
  },
  {
    path: 'cart',
    title: 'Your cart',
    data: { preload: true },
    loadComponent: () => import('./pages/cart/cart').then((m) => m.Cart),
  },
  {
    path: 'wishlist',
    title: 'My wishlist',
    loadComponent: () => import('./pages/wishlist/wishlist').then((m) => m.Wishlist),
  },
  {
    path: 'login',
    title: 'Log in',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'checkout',
    title: 'Checkout',
    canActivate: [authGuard],
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () => import('./pages/checkout/checkout').then((m) => m.Checkout),
  },
  {
    path: 'orders',
    title: 'My orders',
    canActivate: [authGuard],
    data: { preload: true },
    loadComponent: () => import('./pages/orders/orders').then((m) => m.Orders),
  },
  {
    path: 'admin',
    canMatch: [adminGuard],
    loadChildren: () => import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  { path: '**', component: NotFound, title: 'Page not found' },
];
