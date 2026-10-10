import { Component } from '@angular/core';
import { Highlight } from '../directives/highlight';

// hostDirectives: this component comes with the Highlight sticker already stuck on.
@Component({
  selector: 'app-fancy-note',
  hostDirectives: [{ directive: Highlight, inputs: ['appHighlight: color'] }],
  template: `<ng-content />`,
})
export class FancyNote {}
