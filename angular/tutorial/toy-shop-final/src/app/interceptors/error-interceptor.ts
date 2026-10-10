import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service';
import { NotificationService } from '../services/notification-service';
import { API_URL } from '../tokens';

// A request can carry a little note. This note says: "I will explain a problem
// to the person myself, so please do not show a pop-up."
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);
  const auth = inject(AuthService);
  const router = inject(Router);
  const api = inject(API_URL);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const skip = req.context.get(SKIP_ERROR_TOAST);

      if (error.status === 0 && !skip) {
        notify.show($localize`:@@err.offline:We cannot reach the server. Is the internet on?`);
      } else if (error.status === 401 && req.url !== `${api}/login`) {
        // The login has run out. Log out and go back to the login page.
        auth.logout();
        router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
        notify.show($localize`:@@err.session:Your visit timed out. Please log in again.`);
      } else if (error.status >= 500 && !skip) {
        notify.show($localize`:@@err.server:The server is having trouble. Please try again soon.`);
      }

      // Pass the problem on, so the page that asked can still react to it.
      return throwError(() => error);
    }),
  );
};
