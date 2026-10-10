import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

// A bouncer at the door: only logged-in shoppers may enter.
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.isLoggedIn()) return true;

  // Otherwise send them to the login page, and remember where they wanted to go.
  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
