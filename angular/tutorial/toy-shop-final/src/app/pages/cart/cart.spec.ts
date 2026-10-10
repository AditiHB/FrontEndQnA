import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { sampleProducts } from '../../data/sample-products';
import { CartService } from '../../services/cart-service';
import { Cart } from './cart';

describe('Cart page', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('says the cart is empty when there is nothing in it', async () => {
    const fixture = TestBed.createComponent(Cart);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Your cart is empty');
  });

  it('lists the toys that were added', async () => {
    TestBed.inject(CartService).add(sampleProducts[0], 2);
    const fixture = TestBed.createComponent(Cart);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Racing Car');
    expect(fixture.nativeElement.textContent).toContain('$27.00');
  });
});

describe('Cart page: emptying', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('asks first, and empties the cart only after "Yes"', async () => {
    const cart = TestBed.inject(CartService);
    cart.add(sampleProducts[0]);
    const fixture = TestBed.createComponent(Cart);
    await fixture.whenStable();

    const emptyButton = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((b) => b.textContent?.includes('Empty the cart'));
    emptyButton?.click();
    await fixture.whenStable();

    // The pop-up lives outside our component, at the end of <body>.
    expect(document.body.textContent).toContain('Empty the cart?');
    expect(cart.count()).toBe(1); // still there

    const yes = Array.from<HTMLButtonElement>(
      document.querySelectorAll('mat-dialog-actions button'),
    ).find((b) => b.textContent?.includes('Yes, empty it'));
    yes?.click();

    // Closing the pop-up takes a moment, so we wait until the cart is empty.
    await vi.waitFor(() => expect(cart.count()).toBe(0));
  });
});
