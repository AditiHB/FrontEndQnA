# 21. Testing

> **Like I'm 5:** Testing React is like testing a vending machine. You don't open the machine and poke the gears. You put in a coin, press a button, and check that the right snack comes out.

## Tools
- **Vitest** or **Jest**: test runner and assertions.
- **React Testing Library (RTL)**: renders components and queries them the way users do.
- **Playwright** or **Cypress**: end-to-end tests in a real browser.
- **MSW (Mock Service Worker)**: mocks network requests at the network layer.

## A component test

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  it('calls onAdd with the product id', async () => {
    const onAdd = vi.fn();
    render(<ProductCard id="p1" name="Shoe" price={49.9} onAdd={onAdd} />);

    await userEvent.click(screen.getByRole('button', { name: /add to cart/i }));

    expect(onAdd).toHaveBeenCalledWith('p1');
  });
});
```

## Query priority

Prefer queries that match how users find things:
1. `getByRole` (buttons, headings, inputs with labels)
2. `getByLabelText`
3. `getByText`
4. `getByTestId` as a last resort

## Async UI

```tsx
expect(await screen.findByText('Shoe')).toBeInTheDocument();
await waitFor(() => expect(onSave).toHaveBeenCalled());
```

## Mocking the network with MSW

```tsx
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.get('/api/products', () => HttpResponse.json([{ id: 'p1', name: 'Shoe' }])),
);
beforeAll(() => server.listen());
afterAll(() => server.close());
```

Testing at the network layer keeps components and data hooks honest.

## Testing hooks

```tsx
import { renderHook, act } from '@testing-library/react';

const { result } = renderHook(() => useCounter());
act(() => result.current.increment());
expect(result.current.count).toBe(1);
```

## What to test
- User-visible behavior: what appears, what happens on click.
- Edge cases: empty, loading, and error states.
- Critical flows end to end: login, checkout.

## Important points
- Avoid testing implementation details such as internal state or component names.
- Keep tests independent and deterministic. Reset mocks between tests.
- Run tests in CI and watch for flaky timing issues.
