import { CanDeactivateFn } from '@angular/router';

// Any page that wants to be asked "are you sure?" must have this method.
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

// Asks before leaving a page where the person has typed something that is not saved.
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (page) =>
  !page.hasUnsavedChanges() || confirm('You have not placed your order yet. Leave anyway?');
