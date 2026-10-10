import { provideHttpClient, withInterceptors, HttpClient, HttpContext } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { GlobalErrorHandler } from './error-handler';
import { errorInterceptor, SKIP_ERROR_TOAST } from './interceptors/error-interceptor';
import { LoggerService } from './services/logger-service';
import { NotificationService } from './services/notification-service';

describe('error handling', () => {
  let notify: { show: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    sessionStorage.clear();
    notify = { show: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: NotificationService, useValue: notify },
      ],
    });
  });

  describe('GlobalErrorHandler', () => {
    it('writes the mistake in the notebook and tells the person', () => {
      TestBed.configureTestingModule({ providers: [GlobalErrorHandler] });
      vi.spyOn(console, 'error').mockImplementation(() => undefined);

      TestBed.inject(GlobalErrorHandler).handleError(new Error('kaboom'));

      expect(TestBed.inject(LoggerService).errors()[0].message).toBe('kaboom');
      expect(notify.show).toHaveBeenCalled();
    });
  });

  describe('errorInterceptor', () => {
    const fail = (status: number, url = '/api/anything', context?: HttpContext) => {
      let heard: unknown;
      TestBed.inject(HttpClient)
        .get(url, { context })
        .subscribe({ error: (e) => (heard = e) });
      TestBed.inject(HttpTestingController).expectOne(url).flush({}, { status, statusText: 'x' });
      return heard as { status: number };
    };

    it('shows a pop-up when the server is broken, and still passes the error on', () => {
      expect(fail(500).status).toBe(500);
      expect(notify.show).toHaveBeenCalledTimes(1);
    });

    it('stays quiet when the page said "I will explain it myself"', () => {
      fail(500, '/api/anything', new HttpContext().set(SKIP_ERROR_TOAST, true));
      expect(notify.show).not.toHaveBeenCalled();
    });

    it('sends people to the login page when their visit has timed out (401)', () => {
      const go = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
      fail(401);
      expect(go).toHaveBeenCalledWith(['/login'], expect.anything());
      expect(notify.show).toHaveBeenCalled();
    });

    it('does not do that for a wrong password at the login (that page explains itself)', () => {
      const go = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
      fail(401, '/api/login');
      expect(go).not.toHaveBeenCalled();
    });
  });
});
