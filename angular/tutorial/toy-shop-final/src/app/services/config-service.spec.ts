import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config-service';

describe('ConfigService', () => {
  let server: HttpTestingController;
  let service: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ConfigService);
    server = TestBed.inject(HttpTestingController);
  });

  it('starts with sensible defaults', () => {
    expect(service.config().shopName).toBe('Toy Shop');
  });

  it('takes the values it finds in config.json, and keeps defaults for the rest', async () => {
    const loading = service.load();
    server.expectOne('config.json').flush({ shopName: 'Mia’s Toys', saleMinutes: 3 });
    await loading;
    expect(service.config()).toEqual({ shopName: 'Mia’s Toys', taxRate: 0.08, saleMinutes: 3 });
  });

  it('keeps the defaults when config.json cannot be loaded', async () => {
    const loading = service.load();
    server.expectOne('config.json').flush('nope', { status: 404, statusText: 'Not Found' });
    await loading;
    expect(service.config().taxRate).toBe(0.08);
  });
});
