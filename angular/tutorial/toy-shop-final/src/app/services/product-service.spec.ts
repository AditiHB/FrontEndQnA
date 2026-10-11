import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { sampleProducts } from '../data/sample-products';
import { Product } from '../models/product';
import { ProductService } from './product-service';

describe('ProductService', () => {
  let service: ProductService;
  let server: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    server = TestBed.inject(HttpTestingController);
  });

  afterEach(() => server.verify()); // no surprise requests left over

  it('asks the server for products.json and gets all twelve toys', () => {
    let toys: Product[] = [];
    service.getAll().subscribe((list) => (toys = list));

    server.expectOne('products.json').flush(sampleProducts); // the pretend server answers

    expect(toys.length).toBe(12);
  });

  it('asks the server only once, even when many people ask', () => {
    service.getAll().subscribe();
    service.getAll().subscribe();
    service.getById(1).subscribe();

    server.expectOne('products.json').flush(sampleProducts);
  });

  it('finds a toy by id, or null', () => {
    const found: (Product | null)[] = [];
    service.getById(3).subscribe((p) => found.push(p));
    service.getById(999).subscribe((p) => found.push(p));

    server.expectOne('products.json').flush(sampleProducts);

    expect(found[0]?.name).toBe('Toy Train');
    expect(found[1]).toBeNull();
  });

  it('searches by name and category', () => {
    let names: string[] = [];
    service.search('BEAR', 'all').subscribe((list) => (names = list.map((p) => p.name)));
    server.expectOne('products.json').flush(sampleProducts);
    expect(names).toEqual(['Teddy Bear']);
  });
});
