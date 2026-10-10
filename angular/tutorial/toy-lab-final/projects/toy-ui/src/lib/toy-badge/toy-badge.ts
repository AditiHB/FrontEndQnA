import { Component, input } from '@angular/core';

export type BadgeTone = 'happy' | 'warning';

// A little round label, like "New!" or "Only 2 left". Whatever you write
// between <toy-badge> and </toy-badge> shows up inside it.
@Component({
  selector: 'toy-badge',
  template: `<span class="badge" [class.warning]="tone() === 'warning'"><ng-content /></span>`,
  styles: `
    .badge {
      display: inline-block;
      padding: 0.125rem 0.625rem;
      border-radius: 999px;
      background: #d6f5ef;
      color: #064e4a;
      font:
        600 0.875rem system-ui,
        sans-serif;
    }
    .badge.warning {
      background: #fff0c2;
      color: #6b4a00;
    }
  `,
})
export class ToyBadge {
  tone = input<BadgeTone>('happy');
}
