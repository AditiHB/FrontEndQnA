import { Component, computed, input, numberAttribute } from '@angular/core';

// Shows a rating out of 5 as stars: <toy-stars [rating]="4.5" />
@Component({
  selector: 'toy-stars',
  template: `
    <span class="stars" role="img" [attr.aria-label]="'Rated ' + rating() + ' out of 5'">
      <span class="fill" [style.width.%]="percent()">★★★★★</span>
      <span class="back" aria-hidden="true">★★★★★</span>
    </span>
  `,
  styles: `
    .stars {
      position: relative;
      display: inline-block;
      font-size: 1.25rem;
      letter-spacing: 0.1em;
    }
    .back {
      color: #d4d4dc;
    }
    .fill {
      position: absolute;
      top: 0;
      left: 0;
      overflow: hidden;
      white-space: nowrap;
      color: #e8a100;
    }
  `,
})
export class ToyStars {
  // numberAttribute lets this work as an HTML attribute too: rating="4.5" arrives as text.
  rating = input(0, { transform: numberAttribute });
  percent = computed(() => Math.min(100, Math.max(0, (this.rating() / 5) * 100)));
}
