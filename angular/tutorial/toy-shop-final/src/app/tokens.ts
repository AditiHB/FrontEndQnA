import { InjectionToken } from '@angular/core';
import { environment } from '../environments/environment';

// An InjectionToken is a name tag for a value that is not a class.
// The "factory" is the default value if nobody gives a different one.
export const SHOP_NAME = new InjectionToken<string>('SHOP_NAME', {
  factory: () => 'Toy Shop',
});

export const TAX_RATE = new InjectionToken<number>('TAX_RATE', {
  factory: () => 0.08, // 8 percent
});

// The address of the server. It comes from the environment file, so production
// and practice mode can use different servers without changing any other code.
export const API_URL = new InjectionToken<string>('API_URL', {
  factory: () => environment.apiUrl,
});
