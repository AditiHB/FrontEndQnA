import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Orders } from './orders';

describe('Orders', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('says there is nothing yet when the list is empty', async () => {
    const fixture = TestBed.createComponent(Orders);
    TestBed.inject(HttpTestingController).expectOne('/api/orders').flush([]);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('not ordered anything yet');
  });

  it('lists the orders it receives', async () => {
    const fixture = TestBed.createComponent(Orders);
    TestBed.inject(HttpTestingController)
      .expectOne('/api/orders')
      .flush([
        {
          id: 'T-1001',
          createdAt: '2026-10-10T10:00:00Z',
          total: 27,
          giftWrap: false,
          notes: '',
          giftTags: [],
          lines: [{ productId: 1, name: 'Racing Car', price: 12.5, quantity: 2 }],
        },
      ]);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('T-1001');
    expect(fixture.nativeElement.textContent).toContain('2 × Racing Car');
  });

  it('shows a friendly message when the server says no', async () => {
    const fixture = TestBed.createComponent(Orders);
    TestBed.inject(HttpTestingController)
      .expectOne('/api/orders')
      .flush({ message: 'nope' }, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('could not load your orders');
  });
});
