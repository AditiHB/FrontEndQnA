import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth-service';

describe('AuthService', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('starts logged out', () => {
    const auth = TestBed.inject(AuthService);
    expect(auth.isLoggedIn()).toBe(false);
    expect(auth.token()).toBeNull();
  });

  it('remembers the user after a good login, and forgets on logout', () => {
    const auth = TestBed.inject(AuthService);
    const server = TestBed.inject(HttpTestingController);

    auth.login('admin@toys.com', 'toys123').subscribe();
    server.expectOne('/api/login').flush({
      email: 'admin@toys.com',
      name: 'admin',
      role: 'admin',
      token: 'fake-token-admin@toys.com',
    });

    expect(auth.isLoggedIn()).toBe(true);
    expect(auth.isAdmin()).toBe(true);

    auth.logout();
    expect(auth.isLoggedIn()).toBe(false);
  });
});
