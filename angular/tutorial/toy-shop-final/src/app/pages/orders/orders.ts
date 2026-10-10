import { CurrencyPipe, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Order } from '../../models/order';
import { OrderService } from '../../services/order-service';

@Component({
  imports: [CurrencyPipe, DatePipe, RouterLink],
  selector: 'app-orders',
  styleUrl: './orders.css',
  templateUrl: './orders.html',
})
export class Orders {
  // null = still waiting for the server.
  orders = signal<Order[] | null>(null);
  problem = signal('');

  constructor() {
    inject(OrderService)
      .mine()
      .pipe(takeUntilDestroyed()) // stop listening if we leave the page
      .subscribe({
        next: (list) => this.orders.set(list),
        error: () => this.problem.set('We could not load your orders.'),
      });
  }
}
