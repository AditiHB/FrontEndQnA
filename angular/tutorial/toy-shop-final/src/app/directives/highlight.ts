import { Directive, input, signal } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  // "host" lets the directive talk to the element it is stuck on.
  host: {
    '(mouseenter)': 'turnOn()',
    '(mouseleave)': 'turnOff()',
    '[style.background-color]': 'background()',
  },
})
export class Highlight {
  // Usage: <p appHighlight="#ffe08a">  (if you give no color, we use yellow)
  color = input('', { alias: 'appHighlight' });

  protected background = signal('');

  turnOn() {
    this.background.set(this.color() || '#ffe08a');
  }

  turnOff() {
    this.background.set('');
  }
}
