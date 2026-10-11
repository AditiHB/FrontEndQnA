import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';
import { ShellHome } from './shell-home';

export const routes: Routes = [
  { path: '', component: ShellHome },
  {
    path: 'toys',
    // Ask the remote app for its ToyShelf, over the network, only when somebody visits /toys.
    loadComponent: () => loadRemoteModule('toys-remote', './ToyShelf').then((m) => m.ToyShelf),
  },
];
