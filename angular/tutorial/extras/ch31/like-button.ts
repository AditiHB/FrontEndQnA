import { Component, input, output, signal } from '@angular/core';

// A bigger example: it has an input (the toy name) AND an output (an event for the page).
// Angular Elements turns the input into an attribute/property, and the output into a
// real DOM event that plain JavaScript can listen to.
@Component({
  selector: 'toy-like',
  template: `
    <button type="button" (click)="press()">
      {{ liked() ? '❤️' : '🤍' }} {{ toy() }}
    </button>
  `,
})
export class ToyLike {
  toy = input('a toy');
  liked = signal(false);
  changed = output<{ toy: string; liked: boolean }>();

  press() {
    this.liked.update((v) => !v);
    this.changed.emit({ toy: this.toy(), liked: this.liked() });
  }
}
