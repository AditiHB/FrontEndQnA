import { describe, expect, it } from 'vitest';
import { addToCart } from '../src/cart.js';
import { StandError } from '../src/errors.js';
import { Order, TakeAwayOrder } from '../src/order.js';

const cart = addToCart(addToCart(addToCart([], 'lemonade', 3), 'cookie'), 'sandwich');
const cookies = addToCart([], 'cookie', 4);

describe('Order', () => {
  it('works out subtotal, tax, and total in whole paise', () => {
    const order = Order.fromCart({ id: 1, customer: 'Asha', cart });
    expect(order.subtotal).toBe(22500);
    expect(order.tax).toBe(1125);
    expect(order.total).toBe(23625);
  });

  it('applies stacked discounts before tax', () => {
    const order = Order.fromCart({
      id: 2,
      customer: 'Ravi',
      cart: cookies,
      discountNames: ['kids', 'happyHour'],
    });
    expect(order.afterDiscounts).toBe(7200);
    expect(order.total).toBe(7560);
  });

  it('a take-away order adds the box fee, and is still an Order', () => {
    const order = TakeAwayOrder.fromCart({
      id: 3,
      customer: 'Meera',
      cart: cookies,
      discountNames: ['kids', 'happyHour'],
    });
    expect(order.total).toBe(8060);
    expect(order).toBeInstanceOf(Order);
  });

  it('hands out copies of its lines, so outsiders cannot change the order', () => {
    const order = Order.fromCart({ id: 4, customer: 'Asha', cart });
    order.lines.push({ itemId: 'x' });
    order.lines[0].quantity = 99;
    expect(order.lines).toHaveLength(3);
    expect(order.lines[0].quantity).toBe(3);
  });

  it('can be looped over', () => {
    const names = [...Order.fromCart({ id: 5, customer: 'Asha', cart })].map((line) => line.name);
    expect(names).toEqual(['Lemonade', 'Choc Cookie', 'Cheese Sandwich']);
  });

  it('refuses an empty order', () => {
    expect(() => Order.fromCart({ id: 6, customer: 'Nobody', cart: [] })).toThrow(StandError);
  });

  it('starts as new, and markReady changes the status', () => {
    const order = Order.fromCart({ id: 7, customer: 'Asha', cart });
    expect(order.status).toBe('new');
    expect(order.markReady().status).toBe('ready');
  });

  it('turns into clean JSON, with the date as an ISO string', () => {
    const placedAt = new Date(Date.UTC(2026, 9, 10, 9, 30));
    const order = Order.fromCart({ id: 8, customer: 'Asha', cart, placedAt });
    expect(JSON.parse(JSON.stringify(order))).toMatchObject({
      id: 8,
      customer: 'Asha',
      status: 'new',
      placedAt: '2026-10-10T09:30:00.000Z',
      total: 23625,
    });
  });
});
