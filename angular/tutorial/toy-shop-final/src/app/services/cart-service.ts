import { computed, effect, inject, Service, signal } from '@angular/core';
import { CartItem } from '../models/cart-item';
import { Product } from '../models/product';
import { TAX_RATE } from '../tokens';
import { StorageService } from './storage-service';

const STORAGE_KEY = 'toyshop-cart';

@Service()
export class CartService {
  private taxRate = inject(TAX_RATE);
  private storage = inject(StorageService);

  // A private box we can change, and a read-only view that everyone else uses.
  private readonly _items = signal<CartItem[]>(this.load());
  readonly items = this._items.asReadonly();

  // computed() boxes work themselves out from other boxes.
  readonly count = computed(() => this._items().reduce((n, i) => n + i.quantity, 0));
  readonly subtotal = computed(() =>
    this._items().reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  );
  readonly tax = computed(() => this.subtotal() * this.taxRate);
  readonly total = computed(() => this.subtotal() + this.tax());

  constructor() {
    // effect() runs by itself every time the cart changes: save it for next time.
    effect(() => {
      this.storage.set(STORAGE_KEY, JSON.stringify(this._items()));
    });
  }

  add(product: Product, quantity = 1) {
    this._items.update((list) => {
      const found = list.find((i) => i.product.id === product.id);
      if (!found) {
        return [...list, { product, quantity: Math.min(quantity, product.stock) }];
      }
      return list.map((i) =>
        i.product.id === product.id
          ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
          : i,
      );
    });
  }

  setQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    this._items.update((list) =>
      list.map((i) => (i.product.id === productId ? { ...i, quantity } : i)),
    );
  }

  remove(productId: number) {
    this._items.update((list) => list.filter((i) => i.product.id !== productId));
  }

  clear() {
    this._items.set([]);
  }

  private load(): CartItem[] {
    try {
      return JSON.parse(this.storage.get(STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  }
}
