import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { mergeMap, of, throwError, timer } from 'rxjs';
import { NewOrder, Order } from '../models/order';
import { User } from '../models/user';
import { StorageService } from '../services/storage-service';
import { API_URL } from '../tokens';

export const FAKE_BACKEND_DELAY_MS = 300;
const ORDERS_KEY = 'toyshop-orders';

// A PRETEND server. It answers every address that starts with /api/ so we can
// learn without building a real backend. In a real project you delete this file
// and the real server (for example Spring Boot) answers instead.
export const fakeBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const api = inject(API_URL);
  if (!req.url.startsWith(api + '/')) return next(req);
  const storage = inject(StorageService);

  // Answer after a short wait, like a real server would.
  const reply = (status: number, body: unknown) =>
    timer(FAKE_BACKEND_DELAY_MS).pipe(
      mergeMap(() =>
        status < 400
          ? of(new HttpResponse({ status, body }))
          : throwError(() => new HttpErrorResponse({ status, error: body, url: req.url })),
      ),
    );

  // GET /api/boom always fails with a 500, so we can practice handling errors.
  if (req.url === `${api}/boom`)
    return reply(500, { message: 'Boom! The server broke on purpose.' });

  // POST /api/login  (the password is always "toys123")
  if (req.method === 'POST' && req.url === `${api}/login`) {
    const { email, password } = req.body as { email: string; password: string };
    if (password !== 'toys123') return reply(401, { message: 'Wrong email or password' });
    const user: User = {
      email,
      name: email.split('@')[0],
      role: email.startsWith('admin') ? 'admin' : 'shopper',
      token: `fake-token-${email}`,
    };
    return reply(200, user);
  }

  // Everything below needs a logged-in shopper.
  const token = req.headers.get('Authorization')?.replace('Bearer ', '') ?? '';
  const userEmail = token.startsWith('fake-token-') ? token.slice('fake-token-'.length) : '';
  if (!userEmail) return reply(401, { message: 'Please log in first' });

  if (req.method === 'GET' && req.url === `${api}/orders`) {
    return reply(
      200,
      loadOrders(storage).filter((o) => o.userEmail === userEmail),
    );
  }

  if (req.method === 'POST' && req.url === `${api}/orders`) {
    const orders = loadOrders(storage);
    const order: Order = {
      ...(req.body as NewOrder),
      id: `T-${1001 + orders.length}`,
      createdAt: new Date().toISOString(),
      userEmail,
    };
    storage.set(ORDERS_KEY, JSON.stringify([...orders, order]));
    return reply(201, order);
  }

  return reply(404, { message: 'The pretend server does not know that address' });
};

function loadOrders(storage: StorageService): Order[] {
  try {
    return JSON.parse(storage.get(ORDERS_KEY) ?? '[]');
  } catch {
    return [];
  }
}
