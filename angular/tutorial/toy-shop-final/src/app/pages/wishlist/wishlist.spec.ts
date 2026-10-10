import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { sampleProducts } from '../../data/sample-products';
import { WishlistStore } from '../../services/wishlist-store';
import { Wishlist } from './wishlist';

describe('Wishlist page', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('says it is empty when nothing was saved', async () => {
    const fixture = TestBed.createComponent(Wishlist);
    await fixture.whenStable();
    TestBed.inject(HttpTestingController).expectOne('products.json').flush(sampleProducts);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Nothing here yet');
  });

  it('shows the saved toys by name', async () => {
    TestBed.inject(WishlistStore).toggle(3);
    const fixture = TestBed.createComponent(Wishlist);
    await fixture.whenStable();
    TestBed.inject(HttpTestingController).expectOne('products.json').flush(sampleProducts);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Toy Train');
  });
});
