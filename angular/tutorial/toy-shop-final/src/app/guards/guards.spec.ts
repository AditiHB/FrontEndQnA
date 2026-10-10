import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../services/auth-service';
import { adminGuard } from './admin-guard';
import { authGuard } from './auth-guard';
import { unsavedChangesGuard } from './unsaved-changes-guard';

describe('guards', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  describe('authGuard', () => {
    const run = () =>
      TestBed.runInInjectionContext(() =>
        authGuard({} as ActivatedRouteSnapshot, { url: '/checkout' } as RouterStateSnapshot),
      );

    it('sends people who are not logged in to the login page', () => {
      const result = run() as UrlTree;
      expect(TestBed.inject(Router).serializeUrl(result)).toBe('/login?returnUrl=%2Fcheckout');
    });

    it('lets logged-in shoppers through', () => {
      const auth = TestBed.inject(AuthService) as unknown as { _user: { set(u: unknown): void } };
      auth._user.set({ email: 'a@b.c', name: 'a', role: 'shopper', token: 't' });
      expect(run()).toBe(true);
    });
  });

  describe('adminGuard', () => {
    const run = () => TestBed.runInInjectionContext(() => adminGuard({} as never, [], {} as never));
    const logInAs = (role: 'admin' | 'shopper') => {
      const auth = TestBed.inject(AuthService) as unknown as { _user: { set(u: unknown): void } };
      auth._user.set({ email: 'a@b.c', name: 'a', role, token: 't' });
    };

    it('lets only admins match the admin route', () => {
      expect(run()).toBe(false);
      logInAs('shopper');
      expect(run()).toBe(false);
      logInAs('admin');
      expect(run()).toBe(true);
    });
  });

  describe('unsavedChangesGuard', () => {
    const run = (unsaved: boolean) =>
      TestBed.runInInjectionContext(() =>
        unsavedChangesGuard(
          { hasUnsavedChanges: () => unsaved },
          {} as ActivatedRouteSnapshot,
          {} as RouterStateSnapshot,
          {} as RouterStateSnapshot,
        ),
      );

    it('lets you leave when nothing is unsaved', () => {
      expect(run(false)).toBe(true);
    });

    it('asks first when something is unsaved', () => {
      const ask = vi.spyOn(globalThis, 'confirm').mockReturnValue(false);
      expect(run(true)).toBe(false);
      expect(ask).toHaveBeenCalled();
      ask.mockRestore();
    });
  });
});
