import { TestBed } from '@angular/core/testing';
import { sampleProducts } from '../data/sample-products';
import { CartService } from './cart-service';

describe('CartService', () => {
  let cart: CartService;
  const [car, truck] = sampleProducts; // $12.50 and $18.00

  beforeEach(() => {
    localStorage.clear();
    cart = TestBed.inject(CartService);
  });

  it('starts empty', () => {
    expect(cart.count()).toBe(0);
    expect(cart.total()).toBe(0);
  });

  it('adds toys and works out the totals', () => {
    cart.add(car, 2); // 25.00
    cart.add(truck); // 18.00
    expect(cart.count()).toBe(3);
    expect(cart.subtotal()).toBeCloseTo(43);
    expect(cart.tax()).toBeCloseTo(3.44); // 8 percent
    expect(cart.total()).toBeCloseTo(46.44);
  });

  it('adds to the same line when the toy is already in the cart', () => {
    cart.add(car);
    cart.add(car);
    expect(cart.items().length).toBe(1);
    expect(cart.items()[0].quantity).toBe(2);
  });

  it('never lets you buy more than the stock', () => {
    cart.add(car, 99); // only 3 in stock
    expect(cart.items()[0].quantity).toBe(3);
  });

  it('removes a line when the quantity becomes zero', () => {
    cart.add(car);
    cart.setQuantity(car.id, 0);
    expect(cart.items()).toEqual([]);
  });

  it('remembers the cart in localStorage', () => {
    cart.add(car, 2);
    TestBed.tick(); // lets the effect run
    const saved = JSON.parse(localStorage.getItem('toyshop-cart') ?? '[]');
    expect(saved[0].quantity).toBe(2);
  });
});
