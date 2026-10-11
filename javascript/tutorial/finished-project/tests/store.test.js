import { describe, expect, it, vi } from 'vitest';
import { addToCart, reduceStock } from '../src/cart.js';
import { initialStock } from '../src/menu.js';
import { Order } from '../src/order.js';
import { createStore } from '../src/store.js';

describe('createStore', () => {
  it('starts with a frozen copy of the state', () => {
    const store = createStore({ cart: [] });
    expect(Object.isFrozen(store.getState())).toBe(true);
    expect(() => store.getState().cart.push(1)).toThrow(TypeError);
  });

  it('replaces the state and tells the listeners', () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    store.subscribe(listener);
    store.update((state) => ({ ...state, count: state.count + 1 }));
    expect(store.getState().count).toBe(1);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ count: 1 });
  });

  it('tells nobody when the update gives back the very same state', () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    store.subscribe(listener);
    store.update((state) => state);
    expect(listener).not.toHaveBeenCalled();
  });

  it('stops telling a listener once it unsubscribes', () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.update((state) => ({ ...state, count: 1 }));
    expect(listener).not.toHaveBeenCalled();
  });

  it('keeps the old state when an update throws', () => {
    const store = createStore({ count: 0 });
    expect(() =>
      store.update(() => {
        throw new Error('nope');
      }),
    ).toThrow('nope');
    expect(store.getState()).toEqual({ count: 0 });
  });
});

describe('a whole shopping trip (an integration test)', () => {
  it('fills the cart, places an order, and takes the stock down', () => {
    const store = createStore({ cart: [], stock: initialStock });

    store.update((state) => ({
      ...state,
      cart: addToCart(state.cart, 'lemonade', 2, state.stock),
    }));
    store.update((state) => ({
      ...state,
      cart: addToCart(state.cart, 'lemonade', 1, state.stock),
    }));

    const order = Order.fromCart({ id: 1, customer: 'Asha', cart: store.getState().cart });
    store.update((state) => ({ ...state, cart: [], stock: reduceStock(state.stock, order.lines) }));

    expect(store.getState().cart).toEqual([]);
    expect(store.getState().stock.lemonade).toBe(7);
    expect(initialStock.lemonade).toBe(10); // the starting note never changed
    expect(order.total).toBe(12600); // 3 x 4000 = 12000, plus 600 tax
  });
});
