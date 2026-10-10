import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { AuthService } from '../services/auth-service';

// canMatch runs BEFORE the route is even picked. If we say "false", the router acts
// as if this route does not exist, and the code for it is never downloaded.
export const adminGuard: CanMatchFn = () => inject(AuthService).isAdmin();
