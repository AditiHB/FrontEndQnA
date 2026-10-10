import { httpResource, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { sampleProducts } from '../data/sample-products';
import { Product } from '../models/product';

// httpResource: "give me this URL as a signal". It also tells you if it is loading or failed,
// and it asks again by itself when the signals inside the URL function change.
@Component({
  selector: 'app-toy-list',
  template: `
    @if (toys.isLoading()) {
      <p>Loading…</p>
    } @else if (toys.error()) {
      <p>Oh no!</p>
    } @else {
      <p>{{ toys.value()?.length }} toys</p>
    }
  `,
})
class ToyList {
  category = signal<string | null>(null);
  toys = httpResource<Product[]>(() => {
    const c = this.category();
    return c ? `products.json?category=${c}` : 'products.json';
  });
}

// The resource sends its request when Angular runs its scheduled work, so we say "run it now"
// (TestBed.tick) and then play the part of the server.
function answer(
  server: HttpTestingController,
  url: string,
  body: unknown,
  options?: { status: number; statusText: string },
) {
  TestBed.tick();
  server.expectOne(url).flush(body as never, options);
}

describe('httpResource', () => {
  let server: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    server = TestBed.inject(HttpTestingController);
  });

  it('loads, then shows the answer', async () => {
    const fixture = TestBed.createComponent(ToyList);
    fixture.detectChanges(); // not whenStable(): a waiting request would make it wait forever
    expect(fixture.nativeElement.textContent).toContain('Loading');

    answer(server, 'products.json', sampleProducts);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('12 toys');
  });

  it('asks again by itself when a signal in the URL changes', async () => {
    const fixture = TestBed.createComponent(ToyList);
    fixture.detectChanges();
    answer(server, 'products.json', sampleProducts);
    await fixture.whenStable();

    fixture.componentInstance.category.set('cars');
    fixture.detectChanges();
    answer(server, 'products.json?category=cars', sampleProducts.slice(0, 3));
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('3 toys');
  });

  it('shows the error state when the server fails', async () => {
    const fixture = TestBed.createComponent(ToyList);
    fixture.detectChanges();
    answer(server, 'products.json', 'nope', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Oh no!');
  });
});
