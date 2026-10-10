# Lesson 21: Testing – The Vending Machine

> **Like I'm 5:** Testing React is like testing a vending machine. You don't open the machine and poke the gears. You put in a coin, press a button, and check that the right snack comes out.

| | |
|---|---|
| **Concept reference** | [21 – Testing](../concepts/21-testing.md) |
| **You will learn** | Unit, component and end-to-end tests, Vitest, React Testing Library, `userEvent`, query priority, async UI (`findBy`, `waitFor`), faking the network with MSW, testing hooks with `renderHook`, and a real-browser test with Playwright |
| **We build** | A safety net of 24 fast tests plus 2 browser tests for the toy shop |
| **Time** | About 2 hours |

> Back in the **Vite `toy-shop`** project (not the Next.js one) for this lesson and the next two.

## The story

Every lesson we changed something and clicked around to check that nothing broke. That works for 10 lines, but not for 10,000. A **test** is a tiny robot that does the clicking for you, in milliseconds, every time you save. When a test turns red, you know *what* you broke, *before* a customer finds it.

## 1. The three layers

```text
        ▲  few, slow, realistic
       ╱ ╲     End-to-end tests   a real browser walks through the whole shop (Playwright)
      ╱───╲
     ╱     ╲   Component / integration tests   draw a page, click it, check the screen
    ╱───────╲                                   (Vitest + Testing Library + MSW)
   ╱         ╲ Unit tests         one function, one hook, one store (Vitest)
  ▔▔▔▔▔▔▔▔▔▔▔▔▔  many, fast, simple
```

| Tool | Job |
|------|-----|
| **Vitest** | The **test runner**: finds your tests, runs them, prints results; also provides `expect` |
| **jsdom** | A pretend browser inside Node, so components can be drawn without opening Chrome |
| **React Testing Library (RTL)** | Draws components and finds things **the way a user does** |
| **user-event** | Types, clicks and tabs like a real person |
| **jest-dom** | Friendly checks like `toBeInTheDocument()` and `toBeDisabled()` |
| **MSW** (Mock Service Worker) | Fakes the **network** so pages can load "from a server" that is really a script |
| **Playwright** | A real browser robot for end-to-end tests |

The golden rule: **test what the user sees and does, not how the code is built inside.** If you can rename an internal variable and every test still passes, your tests are good.

## 2. Install

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom msw
```

Teach Vite about tests. Only two things change: we import `defineConfig` from `vitest/config` (it's Vite's, plus a `test` option), and we add a `test` block:

📄 **`vite.config.ts`** (replace everything)

```ts
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    react(),
    process.env.ANALYZE ? visualizer({ filename: 'dist/stats.html', gzipSize: true }) : null,
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

- `environment: 'jsdom'` gives tests a pretend browser.
- `setupFiles` runs before every test file. We write it in a moment.
- `include` keeps Vitest out of the browser tests we write later.

Add the commands to `package.json`:

📄 **`package.json`** (edit these lines)

```diff
     "lint": "oxlint",
+    "test": "vitest run",
+    "test:watch": "vitest",
+    "test:e2e": "playwright test",
     "preview": "vite preview"
```

- `npm test` runs all tests once (what CI does).
- `npm run test:watch` stays on and re-runs the tests that are affected whenever you save: your best friend while coding.

## 3. Three helper files

### A pretend network (MSW)

MSW sits in the way of every `fetch`. When our code asks for `/toys.json`, MSW answers with a tiny shelf that **we** control, so tests never depend on the real data and never touch a real server.

📄 **`src/test/server.ts`** (new file)

```ts
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { Toy } from '../types';

// A tiny, predictable shelf. Tests never depend on the real toys.json.
export const testToys: Toy[] = [
  {
    id: 'b1',
    name: 'Rainbow Blocks',
    price: 12.5,
    emoji: '🧱',
    category: 'blocks',
    inStock: true,
    description: 'Colourful blocks for towers.',
  },
  {
    id: 'p1',
    name: 'Cuddly Bear',
    price: 15,
    emoji: '🧸',
    category: 'plush',
    inStock: true,
    description: 'A soft bear.',
  },
  {
    id: 'v1',
    name: 'Rescue Helicopter',
    price: 21,
    emoji: '🚁',
    category: 'vehicles',
    inStock: false,
    description: 'Currently out of stock.',
  },
];

// MSW pretends to be the network. Any request to */toys.json gets this answer.
export const handlers = [http.get('*/toys.json', () => HttpResponse.json(testToys))];

export const server = setupServer(...handlers);
export { http, HttpResponse };
```

### Setup that runs around every test

📄 **`src/test/setup.ts`** (new file)

```ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { useCartStore } from '../store/cartStore';
import { server } from './server';

// Start the pretend network. A request nobody planned for is an error.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// After each test: tidy up, so tests never affect each other.
afterEach(() => {
  cleanup(); // remove what the test drew
  server.resetHandlers(); // forget handlers added with server.use(...)
  localStorage.clear();
  useCartStore.setState({ items: [] });
});

afterAll(() => server.close());
```

- `'@testing-library/jest-dom/vitest'` adds the friendly `expect(...).toBeInTheDocument()` checks.
- `onUnhandledRequest: 'error'` means: if the code asks for a URL nobody planned for, fail loudly.
- After **each** test we clean up. A test that leaves a mess behind makes the next test fail for strange reasons ("flaky" tests).

### "Draw it like the real app"

Pages need a query cache (Lesson 15) and a router (Lesson 14). This helper wraps whatever we draw in both:

📄 **`src/test/utils.tsx`** (new file)

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';

// Draw a component the way the real app does: with a query cache and a router.
export function renderWithProviders(ui: ReactElement, { route = '/' } = {}) {
  // A fresh cache for every test (and no automatic retries, so errors show up fast).
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}
```

## 4. Your first test: a plain function

A test file sits next to the code it tests and ends with `.test.ts(x)`.

📄 **`src/lib/formatPrice.test.ts`** (new file)

```ts
import { describe, expect, it } from 'vitest';
import { formatPrice } from './formatPrice';

describe('formatPrice', () => {
  it('shows dollars with two decimals', () => {
    expect(formatPrice(12.5)).toBe('$12.50');
  });

  it('shows whole numbers with .00', () => {
    expect(formatPrice(5)).toBe('$5.00');
  });
});
```

Run it:

```bash
npm test
```

You should see green ticks. The anatomy:

- `describe('name', () => { … })` groups tests.
- `it('does something', () => { … })` is one test (`test` means the same).
- `expect(actual).toBe(expected)` is the **assertion**. If it is false, the test fails.
- The recipe for every test is **Arrange → Act → Assert**: set things up, do the thing, check the result.

Try breaking `formatPrice` (change `en-US` to `de-DE`) and watch the test turn red with a helpful message. Then fix it.

## 5. Testing the cart store (pure logic)

The Zustand store from Lesson 16 is plain JavaScript. We can test it without drawing anything, which makes these tests the fastest and the simplest:

📄 **`src/store/cartStore.test.ts`** (new file)

```ts
import { describe, expect, it } from 'vitest';
import { testToys } from '../test/server';
import { selectCount, selectTotal, useCartStore } from './cartStore';

// The store is plain JavaScript, so we can test it without drawing anything.
const [blocks, bear] = testToys;

describe('cart store', () => {
  it('adds a toy', () => {
    useCartStore.getState().add(blocks, 2);
    expect(useCartStore.getState().items).toEqual([
      { toyId: 'b1', name: 'Rainbow Blocks', emoji: '🧱', price: 12.5, qty: 2 },
    ]);
  });

  it('adds to the amount when the toy is already in the cart', () => {
    useCartStore.getState().add(blocks, 1);
    useCartStore.getState().add(blocks, 3);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].qty).toBe(4);
  });

  it('removes a toy when its amount becomes 0', () => {
    useCartStore.getState().add(blocks, 1);
    useCartStore.getState().setQty('b1', 0);
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('calculates the count and the total', () => {
    useCartStore.getState().add(blocks, 2); // 2 × 12.50
    useCartStore.getState().add(bear, 1); //   1 × 15.00
    expect(selectCount(useCartStore.getState())).toBe(3);
    expect(selectTotal(useCartStore.getState())).toBe(40);
  });

  it('empties the cart', () => {
    useCartStore.getState().add(blocks, 2);
    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toEqual([]);
  });
});
```

(The cart is emptied after each test by our setup file, so every test starts fresh.)

## 6. Testing hooks with `renderHook`

Hooks only work inside components, so RTL gives us `renderHook`, a tiny invisible component that calls your hook. `act(...)` tells React "I'm about to cause an update; apply it before I look". For `useDebounce` we also use **fake timers** so the test doesn't really wait 300 ms.

📄 **`src/hooks/hooks.test.ts`** (new file)

```ts
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDebounce } from './useDebounce';
import { useLocalStorage } from './useLocalStorage';

describe('useDebounce', () => {
  afterEach(() => vi.useRealTimers());

  it('only changes after the delay', () => {
    vi.useFakeTimers(); // we control the clock
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'ab' });
    expect(result.current).toBe('a'); // still the old value

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('ab'); // caught up
  });
});

describe('useLocalStorage', () => {
  it('starts from the saved value', () => {
    localStorage.setItem('mood', JSON.stringify('happy'));
    const { result } = renderHook(() => useLocalStorage('mood', 'sleepy'));
    expect(result.current[0]).toBe('happy');
  });

  it('saves changes', () => {
    const { result } = renderHook(() => useLocalStorage('mood', 'sleepy'));
    act(() => result.current[1]('excited'));
    expect(result.current[0]).toBe('excited');
    expect(JSON.parse(localStorage.getItem('mood')!)).toBe('excited');
  });
});
```

## 7. Testing components

### How RTL finds things

Find elements **the way a user finds them**. Use this priority list:

1. `getByRole` (buttons, headings, inputs with a label): *best*, because it also checks accessibility.
2. `getByLabelText` (form fields)
3. `getByText` (visible text)
4. `getByTestId` (a `data-testid` attribute): **last resort**, because users can't see it.

And three families of queries:

| Query | If missing | Use for |
|-------|-----------|---------|
| `getBy…` | throws an error | Something that must be there **now** |
| `queryBy…` | returns `null` | Asserting that something is **not** there |
| `findBy…` | waits (up to 1 s), then throws | Something that will appear **soon** (async) |

### `ToyCard`

📄 **`src/components/ToyCard.test.tsx`** (new file)

```tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { testToys } from '../test/server';
import { renderWithProviders } from '../test/utils';
import { ToyCard } from './ToyCard';

const [blocks, , helicopter] = testToys;

describe('ToyCard', () => {
  it('calls onAdd with the toy and the chosen quantity', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    renderWithProviders(<ToyCard toy={blocks} onAdd={onAdd} onToggleFavorite={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'One more' }));
    await user.click(screen.getByRole('button', { name: 'Add to cart' }));

    expect(onAdd).toHaveBeenCalledWith(blocks, 2);
  });

  it('cannot add a toy that is sold out', () => {
    renderWithProviders(<ToyCard toy={helicopter} onAdd={vi.fn()} onToggleFavorite={vi.fn()} />);

    expect(screen.getAllByText('Sold out').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Sold out' })).toBeDisabled();
  });

  it('asks to toggle the favorite', async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();
    renderWithProviders(<ToyCard toy={blocks} onAdd={vi.fn()} onToggleFavorite={onToggleFavorite} />);

    await user.click(screen.getByRole('button', { name: /add rainbow blocks to favorites/i }));

    expect(onToggleFavorite).toHaveBeenCalledWith(blocks);
  });
});
```

Notice we never look at `useState` or class names. We click what a user clicks and check what a user sees (or what the parent was told).

### `AddToyForm`

📄 **`src/components/AddToyForm.test.tsx`** (new file)

```tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/utils';
import { AddToyForm } from './AddToyForm';

describe('AddToyForm', () => {
  it('shows friendly errors when submitted empty, and sends nothing', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    renderWithProviders(<AddToyForm onAdd={onAdd} />);

    await user.click(screen.getByRole('button', { name: 'Add to the shelf' }));

    expect(screen.getByText(/at least 3 letters/i)).toBeInTheDocument();
    expect(screen.getByText(/price above 0/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Toy name')).toBeInvalid();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('sends a clean toy when everything is valid', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    renderWithProviders(<AddToyForm onAdd={onAdd} />);

    await user.type(screen.getByLabelText('Toy name'), '  Super Kite ');
    await user.type(screen.getByLabelText('Price in dollars'), '7.5');
    await user.type(screen.getByLabelText('Description'), 'A kite that flies very high.');
    await user.click(screen.getByRole('button', { name: 'Add to the shelf' }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Super Kite', price: 7.5, category: 'blocks', inStock: true }),
    );
  });
});
```

`toBeInvalid()` checks the `aria-invalid` attribute we added in Lesson 13. A good accessibility habit pays off twice: the test can find things too.

## 8. Testing a whole page with a fake network

This is the most valuable kind of test: draw the **whole** page, load its data from the pretend server, and use it like a visitor.

📄 **`src/pages/HomePage.test.tsx`** (new file)

```tsx
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useCartStore } from '../store/cartStore';
import { HttpResponse, http, server } from '../test/server';
import { renderWithProviders } from '../test/utils';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('shows a loading message, then the toys', async () => {
    renderWithProviders(<HomePage />);

    expect(screen.getByText(/opening the toy box/i)).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Rainbow Blocks' })).toBeInTheDocument(); // waits for the "network"
    expect(screen.getByRole('heading', { name: 'Cuddly Bear' })).toBeInTheDocument();
  });

  it('filters by category', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);
    await screen.findByRole('heading', { name: 'Rainbow Blocks' });

    await user.click(screen.getByRole('button', { name: /plush/i, pressed: false }));

    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Rainbow Blocks' })).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Cuddly Bear' })).toBeInTheDocument();
  });

  it('searches by name', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);
    await screen.findByRole('heading', { name: 'Rainbow Blocks' });

    await user.type(screen.getByRole('searchbox', { name: /search toys/i }), 'bear');

    // The search waits 300 ms after typing, so we wait for the result.
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Rainbow Blocks' })).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Cuddly Bear' })).toBeInTheDocument();
  });

  it('shows a friendly message when nothing matches', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);
    await screen.findByRole('heading', { name: 'Rainbow Blocks' });

    await user.type(screen.getByRole('searchbox', { name: /search toys/i }), 'zzzz');

    expect(await screen.findByText(/the shelf is empty/i)).toBeInTheDocument();
  });

  it('puts a toy into the cart', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);
    const card = (await screen.findByRole('heading', { name: 'Rainbow Blocks' })).closest('article')!;

    await user.click(within(card).getByRole('button', { name: 'Add to cart' }));

    expect(useCartStore.getState().items).toMatchObject([{ toyId: 'b1', qty: 1 }]);
  });

  it('shows an error and recovers when you try again', async () => {
    const user = userEvent.setup();
    // For THIS test only, the pretend network breaks.
    server.use(http.get('*/toys.json', () => new HttpResponse(null, { status: 500 })));
    renderWithProviders(<HomePage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/got lost/i);

    // Fix the network, then press the button.
    server.resetHandlers();
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('heading', { name: 'Rainbow Blocks' })).toBeInTheDocument();
  });
});
```

Study these parts:

- `await screen.findByRole('heading', { name: 'Rainbow Blocks' })` **waits** until the toys have "arrived".
- We look for the card's *heading* because the same toy name might also appear in the random "toy of the day" banner. A precise query avoids confusion.
- The search waits 300 ms (debounce), so we use `waitFor(() => expect(…))`, which retries until the check passes or a timeout.
- `server.use(...)` replaces the answer **for one test**; the setup file's `resetHandlers()` restores normal service afterwards. That's how we test the error case.
- We test the cart by asking the store, because that's where the data goes.

Testing at the **network layer** (MSW) instead of mocking our own functions keeps components and data hooks honest: the same code that runs in production runs in the test.

## 9. Testing the checkout (forms and actions)

📄 **`src/pages/CartPage.test.tsx`** (new file)

```tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useCartStore } from '../store/cartStore';
import { testToys } from '../test/server';
import { renderWithProviders } from '../test/utils';
import { CartPage } from './CartPage';

describe('CartPage', () => {
  it('invites you to shop when the cart is empty', () => {
    renderWithProviders(<CartPage />);
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('places an order and empties the cart', async () => {
    const user = userEvent.setup();
    useCartStore.getState().add(testToys[0], 2);
    renderWithProviders(<CartPage />);

    expect(screen.getByText(/^Total:/)).toHaveTextContent('Total: $25.00');

    await user.type(screen.getByLabelText('Your name'), 'Asha');
    await user.type(screen.getByLabelText('Delivery address'), '1 Toy Lane');
    await user.click(screen.getByRole('button', { name: 'Place order' }));

    expect(await screen.findByText(/thank you/i)).toBeInTheDocument();
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('keeps what you typed when the order is refused', async () => {
    const user = userEvent.setup();
    useCartStore.getState().add(testToys[0], 1);
    renderWithProviders(<CartPage />);

    await user.type(screen.getByLabelText('Your name'), 'Asha');
    await user.type(screen.getByLabelText('Delivery address'), 'Nowhere Street');
    await user.click(screen.getByRole('button', { name: 'Place order' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/cannot deliver/i);
    expect(screen.getByLabelText('Your name')).toHaveValue('Asha');
    expect(useCartStore.getState().items).toHaveLength(1); // nothing was bought
  });
});
```

This test covers a lot of earlier lessons at once: a Zustand store, a React 19 form action, `useActionState`, async errors and `defaultValue` keeping the typed text.

Run everything:

```bash
npm test
```

```text
(your output will look something like this)

 ✓ src/lib/formatPrice.test.ts (2 tests)
 ✓ src/store/cartStore.test.ts (5 tests)
 ✓ src/hooks/hooks.test.ts (3 tests)
 ✓ src/components/ToyCard.test.tsx (3 tests)
 ✓ src/components/AddToyForm.test.tsx (2 tests)
 ✓ src/pages/HomePage.test.tsx (6 tests)
 ✓ src/pages/CartPage.test.tsx (3 tests)

 Test Files  7 passed (7)
      Tests  24 passed (24)
```

## 10. A real browser: end-to-end tests with Playwright

jsdom is a pretend browser. Before a release you also want one test that drives a **real** one through the most important journey: find a toy, add to the cart, check out.

```bash
npm install -D @playwright/test
npx playwright install chromium
```

The second command downloads a browser for Playwright to control.

📄 **`playwright.config.ts`** (new file)

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // Build the shop and serve it, then run the browser tests against it.
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
  },
  use: { baseURL: 'http://localhost:4173' },
});
```

📄 **`e2e/shop.spec.ts`** (new file)

```ts
import { expect, test } from '@playwright/test';

test('a visitor can find a toy, add it to the cart and check out', async ({ page }) => {
  await page.goto('/');

  // Find a toy.
  await page.getByRole('searchbox', { name: /search toys/i }).fill('bear');
  const bear = page.getByRole('heading', { name: 'Cuddly Bear' });
  await expect(bear).toBeVisible();

  // Add two to the cart.
  const card = page.locator('article', { has: bear });
  await card.getByRole('button', { name: 'One more' }).click();
  await card.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByRole('button', { name: /2 items/ })).toBeVisible();

  // Go to checkout and place the order.
  await page.getByRole('button', { name: /2 items/ }).click();
  await page.getByRole('link', { name: /go to checkout/i }).click();
  await page.getByLabel('Your name').fill('Asha');
  await page.getByLabel('Delivery address').fill('1 Toy Lane');
  await page.getByRole('button', { name: 'Place order' }).click();

  await expect(page.getByText(/thank you, asha/i)).toBeVisible();
});

test('an unknown address shows the not-found page', async ({ page }) => {
  await page.goto('/this/does/not/exist');
  await expect(page.getByRole('heading', { name: /this aisle doesn't exist/i })).toBeVisible();
});
```

Add the folders it creates to `.gitignore`, so they are not committed:

📄 **`.gitignore`** (add to the bottom)

```text

# Test output
test-results
playwright-report
coverage
```

Run it:

```bash
npm run test:e2e
```

Playwright builds the shop, starts the preview server, opens a headless browser and runs both tests. (Playwright's assertions like `expect(locator).toBeVisible()` retry automatically, so you rarely write waits.)

## 11. What just happened?

- **24 fast tests** protect the logic (store, hooks, validation), the components, and two whole pages in about **two seconds**, plus **2 browser tests** for the big journey.
- Each test **starts clean** and never depends on another.
- The fake network lets us test **loading, success, empty and error** states, which are hard to see by hand.

### What to test

- ✅ **User-visible behaviour**: what appears, what happens on click.
- ✅ **Edge cases**: empty, loading and error states.
- ✅ **Critical flows** end to end: checkout, login.
- ❌ **Implementation details**: internal state names, which hook was called, how many times a component rendered. Such tests break whenever you refactor, even when nothing is wrong.

### Good habits

- Keep tests **independent and deterministic**: no real network, no real clock, no shared leftovers. Reset mocks between tests.
- Name tests like sentences ("keeps what you typed when the order is refused").
- Run the tests in **CI** on every pull request (Lesson 23) and watch for flaky timing.
- Start with the highest-value tests (checkout, login); don't chase 100% coverage. (To see coverage numbers install `@vitest/coverage-v8` and run `vitest run --coverage`.)

## 🧪 Try it yourself

1. **Break something on purpose.** In `src/store/cartStore.ts`, change the `add` action so that adding a toy that is already in the cart *replaces* its quantity instead of adding to it. Run `npm test`. Which test fails, and is the message clear? Then undo the change.
2. **Test-drive a change.** Write a failing test first: "the cart caps one toy at 9". Watch it fail (red), then change the store (green).
3. **Test `ThemeToggle`.** It needs `ThemeProvider`; add it to `renderWithProviders` (or a new helper). Check that clicking toggles `document.documentElement.dataset.theme`. (jsdom lacks `matchMedia`; remember the guard in `useMediaQuery`.)
4. **Test a not-found toy.** Render `<ToyPage />` at `/toys/nope` (you'll need a `Routes` setup) and check the error boundary message.
5. **Query priority.** Change a `getByRole` query to `getByText`. Does it still work? Which one would catch an accessibility bug?
6. **Add an e2e test** for logging in and adding a toy.

## ✅ Check yourself

<details>
<summary>1. What's the difference between <code>getBy</code>, <code>queryBy</code> and <code>findBy</code>?</summary>

`getBy` throws if the element isn't there now; `queryBy` returns `null` (good for asserting absence); `findBy` waits for the element to appear (for async changes).
</details>

<details>
<summary>2. Why prefer <code>getByRole</code> over <code>getByTestId</code>?</summary>

Users (and screen readers) find things by role, label and text. Queries that mirror that give you tests that match real use and also catch accessibility problems.
</details>

<details>
<summary>3. Why mock the network with MSW instead of mocking your own fetch functions?</summary>

The real data hooks and API code still run, so the test covers more of the real path and doesn't break when you refactor how data is fetched.
</details>

<details>
<summary>4. Why do tests clean up after each test?</summary>

So no test depends on leftovers from another; otherwise tests pass or fail depending on order, which makes them flaky.
</details>

<details>
<summary>5. When would you choose Playwright over Testing Library?</summary>

For a few critical journeys that must work in a real browser (routing, real layout, the whole stack). Use Testing Library for the many faster component tests.
</details>

## Recap

- Test pyramid: many fast unit tests, some component/integration tests, a few end-to-end tests.
- Vitest runs tests; React Testing Library draws components and queries them like a user; `userEvent` interacts; MSW fakes the network.
- Prefer `getByRole`/`getByLabelText`; use `findBy`/`waitFor` for async UI; `renderHook` for hooks.
- Test behaviour, not internals. Keep tests independent and deterministic.
- Run tests automatically in CI (next lessons).

➡️ **Next:** [Lesson 22 – Styling and project structure: a tidy toy room](22-styling-and-project-structure.md)
