import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBadge } from '@angular/material/badge';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { CartService } from '../../services/cart-service';
import { WishlistStore } from '../../services/wishlist-store';
import { SHOP_NAME } from '../../tokens';

@Component({
  imports: [FormsModule, CurrencyPipe, RouterLink, RouterLinkActive, MatBadge],
  selector: 'app-site-header',
  styleUrl: './site-header.css',
  templateUrl: './site-header.html',
})
export class SiteHeader {
  shopName = inject(SHOP_NAME);
  cart = inject(CartService);
  auth = inject(AuthService);
  wishlist = inject(WishlistStore);
  private router = inject(Router);

  shopperName = signal('');

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
