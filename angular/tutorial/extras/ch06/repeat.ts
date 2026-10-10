import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';

// A structural directive: it decides how many copies of a template to draw.
// Usage:  <span *appRepeat="3">⭐</span>
@Directive({ selector: '[appRepeat]' })
export class Repeat {
  times = input.required<number>({ alias: 'appRepeat' });

  private template = inject(TemplateRef);
  private container = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      this.container.clear();
      for (let i = 0; i < this.times(); i++) {
        this.container.createEmbeddedView(this.template, { $implicit: i });
      }
    });
  }
}
