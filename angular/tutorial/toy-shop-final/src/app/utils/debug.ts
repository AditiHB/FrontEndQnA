import { environment } from '../../environments/environment';

// Chatty messages for developers. They only print in practice mode,
// and stay silent in the real shop.
export function debug(...messages: unknown[]) {
  if (!environment.production) console.debug(...messages);
}
