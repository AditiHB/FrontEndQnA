import { ErrorHandler, inject, Service } from '@angular/core';
import { LoggerService } from './services/logger-service';
import { NotificationService } from './services/notification-service';

// The safety net under the whole app. Any mistake that nobody caught ends up here.
// (provideBrowserGlobalErrorListeners() in app.config.ts makes sure of that.)
@Service({ autoProvided: false })
export class GlobalErrorHandler implements ErrorHandler {
  private logger = inject(LoggerService);
  private notify = inject(NotificationService);

  handleError(error: unknown): void {
    this.logger.error(error, 'uncaught');
    this.notify.show($localize`:@@err.generic:Something went wrong. We wrote it down.`);
  }
}
