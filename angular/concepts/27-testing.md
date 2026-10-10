# 27. Testing

## Key concepts
- **Unit tests**: test one class, function, or component in isolation.
- **Component tests**: test rendering and interactions with `TestBed`.
- **Integration tests**: several parts together, with a mocked backend.
- **End-to-end (E2E) tests**: test the running app in a real browser (Playwright or Cypress).
- Test runners: Jasmine and Karma (classic defaults), or Jest and Vitest (common alternatives). Check your project's configured runner.

## Component test with TestBed

```ts
describe('CartBadgeComponent', () => {
  let fixture: ComponentFixture<CartBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartBadgeComponent],
      providers: [{ provide: CartService, useValue: { count: signal(3) } }],
    }).compileComponents();

    fixture = TestBed.createComponent(CartBadgeComponent);
    fixture.detectChanges();
  });

  it('shows the item count', () => {
    expect(fixture.nativeElement.textContent).toContain('3');
  });
});
```

## Signal inputs

```ts
fixture.componentRef.setInput('product', { id: '1', name: 'Shoe' });
fixture.detectChanges();
```

## Services with HTTP

```ts
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  service = TestBed.inject(OrderApi);
  http = TestBed.inject(HttpTestingController);
});

it('loads orders', () => {
  let result: Order[] | undefined;
  service.list().subscribe(r => result = r.content);
  http.expectOne(req => req.url === '/api/v1/orders').flush({ content: [{ id: '1' }] });
  expect(result?.length).toBe(1);
  http.verify();
});
```

## Async: fakeAsync and fixtures

```ts
it('debounces search', fakeAsync(() => {
  component.search.setValue('ab');
  tick(300);
  fixture.detectChanges();
  expect(api.search).toHaveBeenCalledWith('ab');
}));
```

## Component harnesses (CDK)

```ts
const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, MatButtonHarness);
await harness.click();
```

Harnesses hide DOM details and make tests stable when markup changes.

## Routing tests

```ts
const harness = await RouterTestingHarness.create();
await harness.navigateByUrl('/orders/1');
expect(harness.routeNativeElement?.textContent).toContain('Order 1');
```

## E2E with Playwright

```ts
import { test, expect } from '@playwright/test';

test('user can place an order', async ({ page }) => {
  await page.goto('/products');
  await page.getByRole('button', { name: 'Add to cart' }).first().click();
  await page.getByRole('link', { name: 'Checkout' }).click();
  await expect(page.getByText('Order placed')).toBeVisible();
});
```

Prefer role-based and test-id locators (`data-testid`) over CSS classes.

## Accessibility checks in tests

```ts
import AxeBuilder from '@axe-core/playwright';

const results = await new AxeBuilder({ page }).analyze();
expect(results.violations).toEqual([]);
```

## Coverage and CI
- Run unit tests on every pull request. Enforce coverage on changed code.
- Run E2E tests on a deployed preview environment.
- Quarantine flaky tests and fix them. Do not retry blindly.

## Important points
- Test behavior, not implementation details.
- Mock at system boundaries (HTTP, browser APIs), not every service.
- Use `fixture.detectChanges()` after changing state, and `whenStable()` for async work.
