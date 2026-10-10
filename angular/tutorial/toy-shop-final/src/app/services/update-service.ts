import { DOCUMENT } from '@angular/common';
import { inject, Service } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';
import { NotificationService } from './notification-service';

// When a NEW version of the shop has been downloaded in the background,
// offer a "Reload" button so the person gets it right away.
@Service()
export class UpdateService {
  private updates = inject(SwUpdate);
  private notify = inject(NotificationService);
  private document = inject(DOCUMENT);

  constructor() {
    if (!this.updates.isEnabled) return; // the service worker only runs in a production build

    this.updates.versionUpdates
      .pipe(
        filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.notify
          .show(
            $localize`:@@update.ready:A new version of the shop is ready.`,
            0,
            $localize`:@@update.reload:Reload`,
          )
          .onAction()
          .subscribe(() => this.document.location.reload());
      });
  }
}
