import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { SKIP_ERROR_TOAST } from '../interceptors/error-interceptor';
import { NewOrder, Order } from '../models/order';
import { API_URL } from '../tokens';

@Service()
export class OrderService {
  private http = inject(HttpClient);
  private api = inject(API_URL);

  place(order: NewOrder) {
    return this.http.post<Order>(`${this.api}/orders`, order, { context: quiet() });
  }

  mine() {
    return this.http.get<Order[]>(`${this.api}/orders`, { context: quiet() });
  }
}

// The checkout and orders pages show their own friendly messages.
const quiet = () => new HttpContext().set(SKIP_ERROR_TOAST, true);
