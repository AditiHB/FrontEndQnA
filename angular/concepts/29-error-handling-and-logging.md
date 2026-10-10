# 29. Error Handling & Logging

> **Like I'm 5:** When something breaks, the whole app should not crash. Error handling is a safety net under a trapeze artist: it catches the fall, shows the user a kind message, and writes a note about what happened.

> **Learn it by doing:** build this step by step in the tutorial: [Chapter 23: Error handling and logging](../tutorial/23-error-handling.md).

## Key concepts
- Errors come from several places: templates and code (runtime errors), HTTP calls, route navigation, and unhandled promises or events.
- A global strategy catches errors, logs them, and shows a friendly message.

## Global error handler

```ts
import { ErrorHandler, Injectable, inject } from '@angular/core';
import { LoggingService } from './logging.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private logger = inject(LoggingService);

  handleError(error: unknown): void {
    this.logger.error(error);
    console.error(error);
  }
}

// app.config.ts
providers: [{ provide: ErrorHandler, useClass: GlobalErrorHandler }]
```

## Global listeners (Angular 20+ and in many setups)

```ts
providers: [provideBrowserGlobalErrorListeners()]
```

This registers listeners for unhandled errors and promise rejections, so they reach the Angular error handler.

## HTTP errors

```ts
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const message = err.status === 0
        ? 'Network unavailable'
        : err.error?.detail ?? 'Something went wrong';
      inject(ToastService).error(message);
      return throwError(() => err);
    }),
  );
```

Map backend `ProblemDetail` responses (RFC 7807) to a single `ApiError` shape, and show a generic message with a correlation ID for support.

## Error boundaries for parts of the UI

Use `@defer` with an `@error` block so a failing widget does not break the page:

```html
@defer {
  <app-revenue-chart />
} @error {
  <p>Chart unavailable. <button (click)="retry()">Retry</button></p>
}
```

## Routing errors

```ts
provideRouter(routes, withNavigationErrorHandler(err => {
  inject(Router).navigate(['/error'], { queryParams: { code: 'nav' } });
}));
```

Also listen to `NavigationError` in router events for analytics.

## Logging service

```ts
@Injectable({ providedIn: 'root' })
export class LoggingService {
  error(err: unknown, context?: Record<string, unknown>) {
    const payload = {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      url: location.href,
      release: APP_VERSION,
      ...context,
    };
    navigator.sendBeacon('/api/v1/client-logs', JSON.stringify(payload));
  }
}
```

Send errors to a monitoring tool (Sentry, Datadog RUM, Application Insights) for alerts, grouping, and source-mapped stack traces.

## Important points
- Never show raw stack traces or technical messages to users.
- Log enough context to reproduce: route, user role (not PII), app version, and request ID.
- Scrub sensitive data (tokens, emails, card numbers) before sending logs.
- Mark expected errors (such as validation failures) so they do not flood alerts.
