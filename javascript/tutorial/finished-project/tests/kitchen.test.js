import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addToCart } from '../src/cart.js';
import { prepareInOrder, prepareTogether, prepareWhatWeCan } from '../src/kitchen.js';
import { Order } from '../src/order.js';

// Lemonade takes 300 ms (a drink), the cookie takes 600 ms (a snack).
const order = Order.fromCart({
  id: 1,
  customer: 'Asha',
  cart: addToCart(addToCart([], 'lemonade', 2), 'cookie'),
});

describe('the kitchen (with a fake clock, so these tests take no real time)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('cooking together takes as long as the slowest dish', async () => {
    const done = vi.fn();
    prepareTogether(order).then(done);

    await vi.advanceTimersByTimeAsync(599);
    expect(done).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(done).toHaveBeenCalledWith(['🍋 Lemonade x2 is ready', '🍪 Choc Cookie x1 is ready']);
  });

  it('cooking one by one takes the sum of all the dishes', async () => {
    const done = vi.fn();
    prepareInOrder(order).then(done);

    await vi.advanceTimersByTimeAsync(899);
    expect(done).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('reports what worked and what did not', async () => {
    const result = prepareWhatWeCan(order, { broken: ['cookie'] });
    await vi.advanceTimersByTimeAsync(600);
    expect(await result).toEqual([
      '🍋 Lemonade x2 is ready',
      '❌ Sorry, we cannot make Choc Cookie right now',
    ]);
  });
});
