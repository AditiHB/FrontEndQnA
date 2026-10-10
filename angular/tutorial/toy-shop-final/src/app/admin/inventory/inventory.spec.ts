import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { sampleProducts } from '../../data/sample-products';
import { Inventory } from './inventory';

describe('Inventory', () => {
  it('lists every toy and marks the ones running low', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(Inventory);
    await fixture.whenStable();
    TestBed.inject(HttpTestingController).expectOne('products.json').flush(sampleProducts);
    await fixture.whenStable();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(12);
    expect(fixture.nativeElement.querySelectorAll('tr.low').length).toBe(4); // Racing Car, Toy Train, Teddy Bear, Space Puzzle
    expect(fixture.nativeElement.textContent).toContain('running low');
  });
});
