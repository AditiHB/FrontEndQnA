import { StandError } from './errors.js';
import { TakeAwayOrder } from './order.js';
import { getVisitorId } from './storage.js';

// The server answered, but with a "not OK" status (like 400 or 500).
export class HttpError extends StandError {
  constructor(status, message) {
    super(message ?? `The server answered ${status}`);
    this.name = 'HttpError';
    this.status = status;
  }
}

// fetch() only throws when the network fails. A 404 or 500 is still a "successful" fetch,
// so we check response.ok ourselves, and we always set a timeout.
export async function fetchJson(url, { timeoutMs = 5000, ...options } = {}) {
  let response;
  try {
    response = await fetch(url, { ...options, signal: AbortSignal.timeout(timeoutMs) });
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new StandError(`The server took longer than ${timeoutMs}ms`, { cause: error });
    }
    throw new StandError('Could not reach the server', { cause: error });
  }

  const data = await response.json().catch(() => null); // not JSON? then no data
  if (!response.ok) {
    throw new HttpError(response.status, data?.error);
  }
  return data;
}

export function getOrders(options) {
  return fetchJson('/api/orders', options);
}

export function sendOrder(order, { table = null, ...options } = {}) {
  const payload = {
    visitorId: getVisitorId(),
    customer: order.customer,
    takeAway: order instanceof TakeAwayOrder,
    table,
    lines: order.lines.map(({ itemId, quantity }) => ({ itemId, quantity })),
  };
  return fetchJson('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    ...options,
  });
}
