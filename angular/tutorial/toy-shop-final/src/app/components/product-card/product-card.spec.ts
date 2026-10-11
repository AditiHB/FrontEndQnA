import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { sampleProducts } from '../../data/sample-products';
import { ProductCard } from './product-card';

describe('ProductCard', () => {
  let fixture: ComponentFixture<ProductCard>;

  async function show(index: number) {
    fixture.componentRef.setInput('product', sampleProducts[index]);
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCard],
      // Links need a router, even an empty one, to find their way around.
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCard);
    await show(0);
  });

  it('shows the toy name', () => {
    expect(fixture.nativeElement.textContent).toContain('Racing Car');
  });

  it('warns when only a few are left', () => {
    expect(fixture.nativeElement.textContent).toContain('Only 3 left!');
  });

  it('says "Sold out" when there is no stock', async () => {
    await show(3); // Teddy Bear has stock 0
    expect(fixture.nativeElement.textContent).toContain('Sold out');
  });

  it('tells the parent when the heart is pressed', () => {
    let received: unknown;
    fixture.componentInstance.likeToggled.subscribe((p) => (received = p));
    fixture.nativeElement.querySelector('button.heart').click();
    expect(received).toEqual(sampleProducts[0]);
  });

  it('shows a red heart for a toy on the wishlist', async () => {
    fixture.componentRef.setInput('liked', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('button.heart').textContent).toContain('❤️');
  });

  it('tells the parent when "Add to cart" is pressed', () => {
    let received: unknown;
    fixture.componentInstance.added.subscribe((e) => (received = e));

    fixture.nativeElement.querySelector('button.btn:not(.secondary)').click();

    expect(received).toEqual({ product: sampleProducts[0], quantity: 1 });
  });
});
