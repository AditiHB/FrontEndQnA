import { inject, Service } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

// One place to show small messages at the bottom of the screen.
@Service()
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  show(message: string, duration = 5000, action = $localize`:@@notify.close:Close`) {
    return this.snackBar.open(message, action, { duration });
  }
}
