import { CurrencyPipe } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Component, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { QuantityStepper } from '../../components/quantity-stepper/quantity-stepper';
import { CartService } from '../../services/cart-service';
import { ProductService } from '../../services/product-service';

@Component({
  imports: [CurrencyPipe, QuantityStepper, RouterLink],
  selector: 'app-product-detail',
  styleUrl: './product-detail.css',
  templateUrl: './product-detail.html',
})
export class ProductDetail {
  private productService = inject(ProductService);
  private cart = inject(CartService);
  private router = inject(Router);

  id = input.required<string>();

  // Whenever the id changes, ask for the new toy. (switchMap forgets the old question.)
  // undefined = still loading, null = no such toy, otherwise the toy itself.
  product = toSignal(
    toObservable(this.id).pipe(switchMap((id) => this.productService.getById(Number(id)))),
  );

  quantity = signal(1);

  addAndGoToCart() {
    const toy = this.product();
    if (!toy) return;
    this.cart.add(toy, this.quantity());
    this.router.navigate(['/cart']);
  }
}
