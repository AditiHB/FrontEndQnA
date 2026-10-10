import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-legacy-box',
  imports: [NgIf],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `<p *ngIf="open">Hello {{ name }}</p>`,
})
export class LegacyBox {
  @Input() name = 'friend';
  @Input() open = true;
}
