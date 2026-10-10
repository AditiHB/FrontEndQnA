import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { sampleProducts } from '../../data/sample-products';
import { ProductDetail } from './product-detail';

describe('ProductDetail', () => {
  let server: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    server = TestBed.inject(HttpTestingController);
  });

  async function openToy(id: number) {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/product/${id}`, ProductDetail);
    server.expectOne('products.json').flush(sampleProducts);
    await harness.fixture.whenStable();
    return harness;
  }

  it('shows the toy that is in the address', async () => {
    const harness = await openToy(3);
    expect(harness.routeNativeElement?.textContent).toContain('Toy Train');
  });

  it('says sorry for a toy that does not exist', async () => {
    const harness = await openToy(999);
    expect(harness.routeNativeElement?.textContent).toContain('could not find');
  });
});
