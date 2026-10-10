import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage-service';

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('saves and reads from the browser notebooks', () => {
    const storage = TestBed.inject(StorageService);
    storage.set('a', '1');
    storage.set('b', '2', 'session');
    expect(storage.get('a')).toBe('1');
    expect(storage.get('b', 'session')).toBe('2');
    expect(localStorage.getItem('a')).toBe('1');

    storage.remove('a');
    expect(storage.get('a')).toBeNull();
  });

  it('pretends the notebook is empty when there is no browser (on a server)', () => {
    TestBed.configureTestingModule({
      // A "document" without a window, like the one on a server.
      providers: [{ provide: DOCUMENT, useValue: { defaultView: null } }],
    });
    const storage = TestBed.inject(StorageService);
    expect(() => storage.set('a', '1')).not.toThrow();
    expect(storage.get('a')).toBeNull();
  });
});
