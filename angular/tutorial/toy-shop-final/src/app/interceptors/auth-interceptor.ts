import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { API_URL } from '../tokens';

// Sticks the shopper's "ID card" (token) on every letter to OUR server.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  const api = inject(API_URL);

  // Only our own API gets the token. Never send it to other websites!
  if (token && req.url.startsWith(api + '/')) {
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }
  return next(req);
};
