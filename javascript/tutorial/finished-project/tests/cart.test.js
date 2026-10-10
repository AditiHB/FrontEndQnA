import { describe, expect, it } from 'vitest';
import {
  addToCart,
  cartSubtotal,
  parseQuantity,
  reduceStock,
  removeFromCart,
  setQuantity,
} from '../src/cart.js';
import { InvalidQuantityError, OutOfStockError, UnknownItemError } from '../src/errors.js';
import { deepFreeze } from '../src/freeze.js';
import { initialStock } from '../src/menu.js';

describe('addToCart', () => {
  it('adds a new line', () => {
    expect(addToCart([], 'lemonade', 2)).toEqual([{ itemId: 'lemonade', quantity: 2 }]);
  });

  it('merges lines for the same item', () => {
    const cart = addToCart(addToCart([], 'lemonade', 2), 'lemonade', 1);
    expect(cart).toEqual([{ itemId: 'lemonade', quantity: 3 }]);
  });

  it('never changes the cart it was given (we freeze the input to prove it)', () => {
    const cart = deepFreeze([{ itemId: 'cookie', quantity: 1 }]);
    const next = addToCart(cart, 'lemonade');
    expect(cart).toHaveLength(1);
    expect(next).toHaveLength(2);
    expect(next).not.toBe(cart);
  });

  it('counts what is already in the cart against the stock', () => {
    const cart = addToCart([], 'sandwich', 4); // only 5 in stock
    expect(() => addToCart(cart, 'sandwich', 2)).toThrow(OutOfStockError);
    expect(() => addToCart(cart, 'sandwich', 1)).not.toThrow();
  });

  it.each([0, -1, 1.5, '2', NaN])('rejects the quantity %j', (quantity) => {
    expect(() => addToCart([], 'lemonade', quantity)).toThrow(InvalidQuantityError);
  });

  it('rejects things we do not sell', () => {
    expect(() => addToCart([], 'pizza')).toThrow(UnknownItemError);
  });
});

describe('setQuantity and removeFromCart', () => {
  const cart = addToCart(addToCart([], 'lemonade', 2), 'cookie');

  it('sets an exact quantity', () => {
    expect(setQuantity(cart, 'lemonade', 5)[0].quantity).toBe(5);
  });

  it('removes the line when the quantity becomes 0', () => {
    expect(setQuantity(cart, 'cookie', 0)).toEqual([{ itemId: 'lemonade', quantity: 2 }]);
  });

  it('gives back the SAME cart when there is nothing to remove', () => {
    expect(removeFromCart(cart, 'mango')).toBe(cart);
  });

  it('gives back a NEW cart when it removes something', () => {
    expect(removeFromCart(cart, 'cookie')).not.toBe(cart);
  });
});

describe('reduceStock', () => {
  it('returns a new stock object and leaves the starting note alone', () => {
    const stock = reduceStock(initialStock, [{ itemId: 'lemonade', quantity: 3 }]);
    expect(stock.lemonade).toBe(7);
    expect(initialStock.lemonade).toBe(10);
    expect(stock).not.toBe(initialStock);
  });
});

describe('parseQuantity and cartSubtotal', () => {
  it('reads typed numbers, and refuses nonsense', () => {
    expect(parseQuantity('3')).toBe(3);
    expect(() => parseQuantity('banana')).toThrow(InvalidQuantityError);
  });

  it('adds up the cart in paise', () => {
    const cart = addToCart(addToCart([], 'lemonade', 2), 'cookie');
    expect(cartSubtotal(cart)).toBe(10500);
  });
});
