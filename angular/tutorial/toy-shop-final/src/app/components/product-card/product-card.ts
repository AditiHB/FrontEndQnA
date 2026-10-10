import { CurrencyPipe, NgClass, NgStyle } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Highlight } from '../../directives/highlight';
import { CATEGORY_LABELS } from '../../models/category-labels';
import { Product } from '../../models/product';
import { TruncatePipe } from '../../pipes/truncate-pipe';
import { QuantityStepper } from '../quantity-stepper/quantity-stepper';

export interface AddedEvent {
  product: Product;
  quantity: number;
}

@Component({
  imports: [QuantityStepper, NgClass, NgStyle, Highlight, CurrencyPipe, TruncatePipe, RouterLink],
  selector: 'app-product-card',
  styleUrl: './product-card.css',
  templateUrl: './product-card.html',
})
export class ProductCard {
  product = input.required<Product>();
  added = output<AddedEvent>();

  // The parent tells us if this toy is on the wishlist, and we tell it when the heart is pressed.
  liked = input(false);
  likeToggled = output<Product>();
  quantity = signal(1);

  stockLevel = computed(() => {
    const stock = this.product().stock;
    if (stock === 0) return 'out';
    return stock <= 3 ? 'low' : 'ok';
  });

  // ngClass takes an object: "add this class when the answer is true".
  cardClasses = computed(() => ({
    'sold-out': this.stockLevel() === 'out',
    popular: this.product().rating >= 4.7,
  }));

  categoryLabel = computed(() => CATEGORY_LABELS[this.product().category]);

  // Sentences that are built in TypeScript use $localize, so they can be translated too.
  heartLabel = computed(() => {
    const name = this.product().name;
    return this.liked()
      ? $localize`:@@card.heart.remove:Remove ${name}:name: from wishlist`
      : $localize`:@@card.heart.add:Add ${name}:name: to wishlist`;
  });

  ratingLabel = computed(
    () => $localize`:@@card.rating:Rated ${this.product().rating}:rating: out of 5`,
  );

  // ngStyle takes an object of CSS values. Here: how wide the star bar is.
  ratingPercent = computed(() => (this.product().rating / 5) * 100);

  add() {
    this.added.emit({ product: this.product(), quantity: this.quantity() });
  }
}
