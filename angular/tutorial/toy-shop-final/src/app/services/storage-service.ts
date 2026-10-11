import { DOCUMENT } from '@angular/common';
import { inject, Service } from '@angular/core';

type Kind = 'local' | 'session';

// A safe way to use the browser's notebooks (localStorage and sessionStorage).
// When the page is built on a SERVER there is no browser and no notebook, so
// this service pretends the notebook is empty instead of crashing.
@Service()
export class StorageService {
  private window = inject(DOCUMENT).defaultView;

  get(key: string, kind: Kind = 'local'): string | null {
    try {
      return this.box(kind)?.getItem(key) ?? null;
    } catch {
      return null; // some browsers block storage
    }
  }

  set(key: string, value: string, kind: Kind = 'local') {
    try {
      this.box(kind)?.setItem(key, value);
    } catch {
      // ignore: storage can be full or blocked
    }
  }

  remove(key: string, kind: Kind = 'local') {
    try {
      this.box(kind)?.removeItem(key);
    } catch {
      // ignore
    }
  }

  private box(kind: Kind): Storage | undefined {
    return kind === 'local' ? this.window?.localStorage : this.window?.sessionStorage;
  }
}
