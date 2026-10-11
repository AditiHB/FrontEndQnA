import { Component, inject, InjectionToken, Service } from '@angular/core';
import { TestBed } from '@angular/core/testing';

// A counter service. @Service() = "one shared copy for the whole app".
@Service()
class Counter {
  count = 0;
}

// A message that can be swapped for another class.
class RealGreeter {
  greet() {
    return 'Hello from the real greeter';
  }
}
class FakeGreeter {
  greet() {
    return 'Hello from the fake greeter';
  }
}

const GREETER = new InjectionToken<RealGreeter>('GREETER', { factory: () => new RealGreeter() });
const OPTIONAL_THING = new InjectionToken<string>('OPTIONAL_THING');

// Two components that both ask for a Counter.
@Component({ selector: 'app-a', template: '' })
class A {
  counter = inject(Counter);
}

// This one lists Counter in its OWN providers, so it gets its own private copy.
@Component({ selector: 'app-b', template: '', providers: [Counter] })
class B {
  counter = inject(Counter);
}

describe('dependency injection lab', () => {
  it('a root service is shared: everyone gets the same one', () => {
    const a = TestBed.createComponent(A).componentInstance;
    const a2 = TestBed.createComponent(A).componentInstance;
    a.counter.count = 5;
    expect(a2.counter.count).toBe(5);
    expect(a.counter).toBe(TestBed.inject(Counter));
  });

  it('a component-level provider gives that component its own private copy', () => {
    const shared = TestBed.inject(Counter);
    const b = TestBed.createComponent(B).componentInstance;
    b.counter.count = 99;
    expect(shared.count).toBe(0);
    expect(b.counter).not.toBe(shared);
  });

  it('useClass swaps one class for another (great for tests)', () => {
    TestBed.configureTestingModule({ providers: [{ provide: GREETER, useClass: FakeGreeter }] });
    expect(TestBed.inject(GREETER).greet()).toBe('Hello from the fake greeter');
  });

  it('useFactory builds the value with your own code', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: GREETER, useFactory: () => ({ greet: () => 'made by a factory' }) }],
    });
    expect(TestBed.inject(GREETER).greet()).toBe('made by a factory');
  });

  it('{ optional: true } gives null instead of an error when nobody provides it', () => {
    const thing = TestBed.runInInjectionContext(() => inject(OPTIONAL_THING, { optional: true }));
    expect(thing).toBeNull();
  });
});
