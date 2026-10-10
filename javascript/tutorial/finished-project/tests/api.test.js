import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchJson, getOrders, HttpError, sendOrder } from '../src/api.js';
import { addToCart } from '../src/cart.js';
import { StandError } from '../src/errors.js';
import { Order } from '../src/order.js';

// A pretend server answer.
const answer = (body, status = 200) => new Response(JSON.stringify(body), { status });

afterEach(() => vi.unstubAllGlobals()); // put the real fetch back after every test

describe('fetchJson', () => {
  it('gives back the JSON when the server says OK', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(answer([{ id: 1 }])));
    expect(await getOrders()).toEqual([{ id: 1 }]);
  });

  it('turns a 400 into an HttpError that carries the server message', async () => {
    const message = 'An order needs a customer name and some lines';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(answer({ error: message }, 400)));
    const error = await fetchJson('/api/orders').catch((problem) => problem);
    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({ status: 400, message });
  });

  it('turns a network failure into a friendly StandError and keeps the cause', async () => {
    const down = new TypeError('Failed to fetch');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(down));
    const error = await fetchJson('/api/orders').catch((problem) => problem);
    expect(error).toBeInstanceOf(StandError);
    expect(error.message).toBe('Could not reach the server');
    expect(error.cause).toBe(down);
  });

  it('explains a timeout', async () => {
    const timeout = new DOMException('timed out', 'TimeoutError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(timeout));
    await expect(fetchJson('/api/slow', { timeoutMs: 10 })).rejects.toThrow('longer than 10ms');
  });
});

describe('sendOrder', () => {
  it('posts the order as JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue(answer({ id: 7 }, 201));
    vi.stubGlobal('fetch', fetchMock);
    const order = Order.fromCart({ id: 1, customer: 'Asha', cart: addToCart([], 'lemonade', 2) });

    expect(await sendOrder(order, { table: '5' })).toEqual({ id: 7 });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/orders');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toMatchObject({
      customer: 'Asha',
      takeAway: false,
      table: '5',
      lines: [{ itemId: 'lemonade', quantity: 2 }],
    });
  });
});
