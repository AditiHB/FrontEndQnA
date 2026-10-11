import { CurrencyPipe } from '@angular/common';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';
import { QuantityStepper } from '../../components/quantity-stepper/quantity-stepper';
import { CartService } from '../../services/cart-service';

@Component({
  imports: [CurrencyPipe, QuantityStepper, RouterLink],
  selector: 'app-cart',
  styleUrl: './cart.css',
  templateUrl: './cart.html',
})
export class Cart {
  cart = inject(CartService);
  private dialog = inject(MatDialog);
  private announcer = inject(LiveAnnouncer);

  remove(id: number, name: string) {
    this.cart.remove(id);
    // Without this, a person using a screen reader would not know anything happened.
    this.announcer.announce(
      $localize`:@@cart.removedAnnounce:${name}:name: removed from your cart`,
    );
  }

  confirmEmpty() {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          title: $localize`:@@cart.confirm.title:Empty the cart?`,
          message: $localize`:@@cart.confirm.message:All the toys will be taken out of your cart.`,
          confirmLabel: $localize`:@@cart.confirm.yes:Yes, empty it`,
        },
      })
      .afterClosed()
      .subscribe((yes) => {
        if (yes) this.cart.clear();
      });
  }
}
