import { ChangeDetectorRef, Component, inject, input, signal } from '@angular/core';

@Component({ selector: 'app-lab-plain', template: `<p id="plain">Plain field: {{ text }}</p>` })
export class LabPlain {
  text = 'old';
  constructor() {
    setTimeout(() => (this.text = 'NEW'), 300);
  }
}

@Component({
  selector: 'app-lab-marked',
  template: `<p id="marked">Plain + markForCheck: {{ text }}</p>`,
})
export class LabMarked {
  private cdr = inject(ChangeDetectorRef);
  text = 'old';
  constructor() {
    setTimeout(() => {
      this.text = 'NEW';
      this.cdr.markForCheck();
    }, 300);
  }
}

@Component({ selector: 'app-lab-signal', template: `<p id="sig">Signal: {{ text() }}</p>` })
export class LabSignal {
  text = signal('old');
  constructor() {
    setTimeout(() => this.text.set('NEW'), 300);
  }
}

@Component({
  selector: 'app-lab-child',
  template: `<p id="child">Child sees: {{ person().name }}</p>`,
})
export class LabChild {
  person = input.required<{ name: string }>();
}

@Component({
  selector: 'app-lab',
  imports: [LabPlain, LabMarked, LabSignal, LabChild],
  template: `
    <app-lab-plain /><app-lab-marked /><app-lab-signal />
    <app-lab-child [person]="person" />
    <button id="mutate" (click)="mutate()">mutate in place</button>
    <button id="replace" (click)="replace()">replace with new object</button>
  `,
})
export class Lab {
  person = { name: 'A' };
  mutate() {
    this.person.name = 'B';
  }
  replace() {
    this.person = { name: 'C' };
  }
}
