import { Directive, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

// Tells screen readers "this box has a mistake in it" (aria-invalid).
// It only says so after the person has touched the box, so it does not scold too early.
//
// Lint (ng lint) normally wants directive selectors to be attributes that start with "app".
// Here we want it on EVERY form input without anybody having to remember it, so we turn that one rule off.
@Directive({
  selector:
    // eslint-disable-next-line @angular-eslint/directive-selector
    'input[formControlName], input[formControl], textarea[formControlName], textarea[formControl]',
  host: { '[attr.aria-invalid]': 'showInvalid() ? "true" : null' },
})
export class AriaInvalid {
  private control = inject(NgControl);

  showInvalid() {
    return !!this.control.touched && !!this.control.invalid;
  }
}
