import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable, retry, shareReplay, timeout } from 'rxjs';
import { SKIP_ERROR_TOAST } from '../interceptors/error-interceptor';
import { Product } from '../models/product';

@Service()
export class ProductService {
  // HttpClient is our mailman. He carries our questions to the server.
  private http = inject(HttpClient);

  // Ask the server only ONE time. shareReplay gives the same answer to everybody
  // who asks later, so we do not keep bothering the server.
  private readonly all$ = this.http
    .get<Product[]>('products.json', { context: new HttpContext().set(SKIP_ERROR_TOAST, true) })
    .pipe(
      timeout(5000), // give up if the server is silent for 5 seconds
      retry({ count: 2, delay: 500 }), // if it fails, try again (twice)
      shareReplay({ bufferSize: 1, refCount: false }),
    );

  getAll(): Observable<Product[]> {
    return this.all$;
  }

  getById(id: number): Observable<Product | null> {
    return this.getAll().pipe(map((list) => list.find((p) => p.id === id) ?? null));
  }

  search(term: string, category: string): Observable<Product[]> {
    const words = term.trim().toLowerCase();
    return this.getAll().pipe(
      map((list) =>
        list.filter(
          (p) =>
            (category === 'all' || p.category === category) &&
            (words === '' || p.name.toLowerCase().includes(words)),
        ),
      ),
    );
  }
}
