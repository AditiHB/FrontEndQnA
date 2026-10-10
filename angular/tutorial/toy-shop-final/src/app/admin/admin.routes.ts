import { Routes } from '@angular/router';
import { AdminShell } from './admin-shell/admin-shell';
import { ErrorLab } from './error-lab/error-lab';
import { Inventory } from './inventory/inventory';
import { Warehouse } from './warehouse/warehouse';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminShell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inventory' },
      { path: 'inventory', component: Inventory, title: 'Inventory' },
      { path: 'error-lab', component: ErrorLab, title: 'Error lab' },
      { path: 'warehouse', component: Warehouse, title: 'Warehouse' },
    ],
  },
];
