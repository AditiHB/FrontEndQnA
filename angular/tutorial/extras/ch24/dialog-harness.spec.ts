import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { provideRouter } from '@angular/router';
import { sampleProducts } from '../data/sample-products';
import { Cart } from '../pages/cart/cart';
import { CartService } from '../services/cart-service';

// A "harness" is a helper that knows how to operate a Material component for you,
// like a remote control. Tests then read like a person using the page, and they keep
// working even if Material changes its inner HTML.
describe('emptying the cart, tested with a dialog harness', () => {
  let loader: HarnessLoader;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    TestBed.inject(CartService).add(sampleProducts[0], 2);
    const fixture = TestBed.createComponent(Cart);
    await fixture.whenStable();
    // documentRootLoader can see overlays such as dialogs, which live outside our component.
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const button = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((b) => b.textContent?.includes('Empty the cart'));
    button?.click();
  });

  it('opens a dialog with the question, and closing it keeps the cart', async () => {
    const dialog = await loader.getHarness(MatDialogHarness);
    const text = await (await dialog.host()).text();
    expect(text).toContain('Empty the cart?');
    expect(text).toContain('No, keep it');

    await dialog.close(); // like pressing Escape
    expect(TestBed.inject(CartService).count()).toBe(2);
  });
});
