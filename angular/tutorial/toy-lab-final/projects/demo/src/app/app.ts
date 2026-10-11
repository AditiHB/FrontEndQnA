import { Component } from '@angular/core';
import { ToyBadge, ToyStars } from 'toy-ui';

@Component({
  imports: [ToyBadge, ToyStars],
  selector: 'app-root',
  template: `
    <h1>Toy UI demo</h1>
    <p>
      🏎️ Racing Car
      <toy-badge>New!</toy-badge>
      <toy-badge tone="warning">Only 3 left</toy-badge>
    </p>
    <p><toy-stars [rating]="4.5" /> 4.5</p>
  `,
})
export class App {}
