# 7. Testing

### Q1. What testing types do you use in an Angular project, and what is the split? `Core`

**Answer:** I use the testing pyramid:
- **Unit tests** (majority): pure functions, services, pipes, and reducers. Fast and isolated.
- **Component tests**: a component with its template, using mocked services. Verify rendering and interactions.
- **Integration tests**: several components with real services and a mocked HTTP layer.
- **End-to-end tests** (few): Playwright or Cypress for critical user journeys such as login and checkout.

---

### Q2. What is `TestBed`, and how do you set up a component test? `Core`

**Answer:**
```ts
beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [OrderListComponent],           // standalone component
    providers: [{ provide: OrderApi, useValue: apiStub }],
  }).compileComponents();

  fixture = TestBed.createComponent(OrderListComponent);
  fixture.detectChanges();
});

it('shows empty message', () => {
  apiStub.getAll.and.returnValue(of([]));
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('No orders');
});
```

---

### Q3. How do you test HTTP calls? `Core`

**Answer:** Use `provideHttpClientTesting()` and `HttpTestingController`.

```ts
const httpMock = TestBed.inject(HttpTestingController);
service.getUser(1).subscribe(u => expect(u.name).toBe('Asha'));

const req = httpMock.expectOne('/api/users/1');
expect(req.request.method).toBe('GET');
req.flush({ id: 1, name: 'Asha' });
httpMock.verify();   // no unexpected requests
```

---

### Q4. How do you test asynchronous code? `Core`

**Answer:**
- `fakeAsync` with `tick()` and `flush()` for timers and debounce.
- `async` / `await` with `fixture.whenStable()` for promises.
- For observables: `marbles` with `TestScheduler` for complex operators such as `debounceTime` and `switchMap`.

---

### Q5. How do you test signals and `OnPush` components? `Advanced`

**Answer:** Signals are synchronous, so you can set a value and read the computed directly.

```ts
const counter = new CounterStore();
counter.increment();
expect(counter.double()).toBe(2);
```

For `OnPush` components, change inputs with `fixture.componentRef.setInput('name', 'Asha')` instead of mutating the component directly, and then call `fixture.detectChanges()`.

---

### Q6. How do you test routing and guards? `Advanced`

**Answer:** Test the guard as a function, passing mock `ActivatedRouteSnapshot` and `RouterStateSnapshot`, and wrap it in `TestBed.runInInjectionContext`. For navigation, use `RouterTestingHarness` to load a route with real guards and resolvers.

---

### Q7. How do you mock services effectively? `Core`

**Answer:** Prefer a **fake** (a small in-memory implementation) for stateful services, and `jasmine.createSpyObj` or `jest.fn()` for simple interactions. Avoid mocking everything, because tests then only verify wiring. Use `overrideProvider` in `TestBed` when a provider is deep in the tree.

---

### Q8. What are Component Harnesses, and why use them? `Advanced`

**Answer:** Harnesses from Angular CDK Testing (`ComponentHarness`) wrap DOM interactions in a stable API, such as `await button.click()`. They make tests resilient to markup changes and are shared between teams, for example for a design-system component library.

---

### Q9. How do you keep tests fast and stable in a CI pipeline? `Architect`

**Answer:**
- Run unit tests on every pull request, parallelized, with code coverage thresholds for changed files.
- Use a headless browser only for component tests that need the DOM.
- Quarantine flaky tests, fix them, and never retry blindly. Track flakiness in CI reports.
- Keep e2e tests to a few critical flows, run them against a deployed preview environment, and use stable test IDs (`data-testid`) instead of CSS classes.
- Consider Vitest or Jest for faster unit tests when the project allows it. Check the current Angular test runner support for your version.

---

### Q10. What is the difference between a unit test, a mock, a stub, and a fake? `Core`

**Answer:**
- **Stub**: returns canned values.
- **Mock**: records calls and lets you assert on them.
- **Fake**: a working but simplified implementation (for example, an in-memory repository).
- **Spy**: wraps a real function to watch calls.
