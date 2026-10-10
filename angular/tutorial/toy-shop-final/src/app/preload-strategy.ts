import { PreloadingStrategy, Route } from '@angular/router';
import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';

// After the first page is ready, quietly download the routes that say
// data: { preload: true }, so they open fast later. Everything else waits.
@Service()
export class SelectivePreload implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    return route.data?.['preload'] ? load() : of(null);
  }
}
