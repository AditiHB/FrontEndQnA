import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject, Service, signal } from '@angular/core';

// Knows whether the internet is on. (On a server there is no browser, so we say "yes".)
@Service()
export class ConnectionService {
  private window = inject(DOCUMENT).defaultView;
  readonly online = signal(this.window?.navigator.onLine ?? true);

  constructor() {
    const win = this.window;
    if (!win) return;

    const goOnline = () => this.online.set(true);
    const goOffline = () => this.online.set(false);
    win.addEventListener('online', goOnline);
    win.addEventListener('offline', goOffline);

    // When the service is destroyed, stop listening (no leaks!).
    inject(DestroyRef).onDestroy(() => {
      win.removeEventListener('online', goOnline);
      win.removeEventListener('offline', goOffline);
    });
  }
}
