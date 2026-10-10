import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterLink],
  selector: 'app-root',
  template: `
    <h1>Shell app</h1>
    <nav>
      <a routerLink="/">Shell home</a> |
      <a routerLink="/toys">Toys (from another app)</a>
    </nav>
    <router-outlet />
  `,
})
export class App {}
