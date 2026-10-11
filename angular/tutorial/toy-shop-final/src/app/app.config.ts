import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  isDevMode,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withNavigationErrorHandler,
  withPreloading,
  withViewTransitions,
  TitleStrategy,
} from '@angular/router';
import { GlobalErrorHandler } from './error-handler';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth-interceptor';
import { errorInterceptor } from './interceptors/error-interceptor';
import { fakeBackendInterceptor } from './interceptors/fake-backend-interceptor';
import { loadingInterceptor } from './interceptors/loading-interceptor';
import { SelectivePreload } from './preload-strategy';
import { AnnouncingTitleStrategy } from './title-strategy';
import { ConfigService } from './services/config-service';
import { LoggerService } from './services/logger-service';
import { NotificationService } from './services/notification-service';
import { SHOP_NAME, TAX_RATE } from './tokens';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
      // Quietly download the pages marked data: { preload: true } in the background.
      withPreloading(SelectivePreload),
      // Let the browser fade smoothly from one page to the next.
      withViewTransitions(),
      // If a page cannot even be opened (for example its code did not download), tell the person.
      withNavigationErrorHandler((failure) => {
        inject(LoggerService).error(failure.error, 'navigation');
        inject(NotificationService).show(
          $localize`:@@err.navigation:We could not open that page. Please try again.`,
        );
      }),
    ),
    provideHttpClient(
      withFetch(),
      // Every letter passes through these guards, in this order.
      // The pretend server goes LAST, so it can see the token the others added.
      withInterceptors([
        loadingInterceptor,
        authInterceptor,
        errorInterceptor,
        fakeBackendInterceptor,
      ]),
    ),
    // Say the new page title out loud after every navigation.
    { provide: TitleStrategy, useExisting: AnnouncingTitleStrategy },
    // Our own safety net replaces Angular's plain one.
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    // Before the app starts, read config.json (the settings that can change without a rebuild).
    provideAppInitializer(() => inject(ConfigService).load()),
    { provide: SHOP_NAME, useFactory: () => inject(ConfigService).config().shopName },
    { provide: TAX_RATE, useFactory: () => inject(ConfigService).config().taxRate },
    // After the server's page arrives, Angular "wakes it up" (hydration) instead of redrawing it.
    // withEventReplay remembers clicks that happen BEFORE it wakes up, and plays them back.
    provideClientHydration(withEventReplay()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
