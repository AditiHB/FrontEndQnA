import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { CurrencyPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product-service';
import { WishlistStore } from '../../services/wishlist-store';

@Component({
  imports: [CurrencyPipe, RouterLink, CdkDropList, CdkDrag, CdkDragHandle],
  selector: 'app-wishlist',
  styleUrl: './wishlist.css',
  templateUrl: './wishlist.html',
})
export class Wishlist {
  wishlist = inject(WishlistStore);
  private all = toSignal(inject(ProductService).getAll(), { initialValue: [] });

  // The wishlist stores only ids. Here we turn the ids back into whole toys.
  toys = computed(() =>
    this.wishlist
      .ids()
      .map((id) => this.all().find((p) => p.id === id))
      .filter((p) => p !== undefined),
  );

  // Called when a toy is dropped in a new place by the mouse or a finger.
  drop(event: CdkDragDrop<unknown>) {
    this.wishlist.move(event.previousIndex, event.currentIndex);
  }

  // The same thing, for people who use a keyboard instead of a mouse.
  moveBy(index: number, step: -1 | 1) {
    const target = index + step;
    if (target >= 0 && target < this.toys().length) this.wishlist.move(index, target);
  }
}
