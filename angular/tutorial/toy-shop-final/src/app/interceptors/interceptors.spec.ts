import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../services/auth-service';
import { LoadingService } from '../services/loading-service';
import { authInterceptor } from './auth-interceptor';
import { FAKE_BACKEND_DELAY_MS, fakeBackendInterceptor } from './fake-backend-interceptor';
import { loadingInterceptor } from './loading-interceptor';

describe('interceptors', () => {
  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('loadingInterceptor', () => {
    it('says "loading" until the answer comes back', () => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withInterceptors([loadingInterceptor])),
          provideHttpClientTesting(),
        ],
      });
      const loading = TestBed.inject(LoadingService);
      const server = TestBed.inject(HttpTestingController);

      TestBed.inject(HttpClient).get('/anything').subscribe();
      expect(loading.isLoading()).toBe(true);

      server.expectOne('/anything').flush({});
      expect(loading.isLoading()).toBe(false);
    });
  });

  describe('authInterceptor', () => {
    let server: HttpTestingController;
    let http: HttpClient;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withInterceptors([authInterceptor])),
          provideHttpClientTesting(),
        ],
      });
      server = TestBed.inject(HttpTestingController);
      http = TestBed.inject(HttpClient);
    });

    it('does nothing when nobody is logged in', () => {
      http.get('/api/orders').subscribe();
      const req = server.expectOne('/api/orders');
      expect(req.request.headers.has('Authorization')).toBe(false);
    });

    it('adds the token to our own API, but never to other websites', () => {
      // Pretend someone is logged in.
      const auth = TestBed.inject(AuthService);
      (auth as unknown as { _user: { set(u: unknown): void } })._user.set({
        email: 'a@b.c',
        name: 'a',
        role: 'shopper',
        token: 'secret',
      });

      http.get('/api/orders').subscribe();
      http.get('https://other-site.example/data').subscribe();

      expect(server.expectOne('/api/orders').request.headers.get('Authorization')).toBe(
        'Bearer secret',
      );
      expect(
        server.expectOne('https://other-site.example/data').request.headers.has('Authorization'),
      ).toBe(false);
    });
  });

  describe('fakeBackendInterceptor', () => {
    let http: HttpClient;

    beforeEach(() => {
      vi.useFakeTimers();
      localStorage.clear();
      TestBed.configureTestingModule({
        providers: [provideHttpClient(withInterceptors([authInterceptor, fakeBackendInterceptor]))],
      });
      http = TestBed.inject(HttpClient);
    });

    it('lets shoppers log in with the password toys123', async () => {
      let result: unknown;
      http.post('/api/login', { email: 'mia@toys.com', password: 'toys123' }).subscribe((r) => {
        result = r;
      });
      await vi.advanceTimersByTimeAsync(FAKE_BACKEND_DELAY_MS);
      expect(result).toMatchObject({ name: 'mia', role: 'shopper' });
    });

    it('says no to a wrong password', async () => {
      let status = 0;
      http.post('/api/login', { email: 'mia@toys.com', password: 'nope' }).subscribe({
        error: (e) => (status = e.status),
      });
      await vi.advanceTimersByTimeAsync(FAKE_BACKEND_DELAY_MS);
      expect(status).toBe(401);
    });

    it('refuses orders from people who are not logged in', async () => {
      let status = 0;
      http.get('/api/orders').subscribe({ error: (e) => (status = e.status) });
      await vi.advanceTimersByTimeAsync(FAKE_BACKEND_DELAY_MS);
      expect(status).toBe(401);
    });
  });
});
