import { ChangeDetectionStrategy, Component, Pipe, PipeTransform, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

let pureCalls = 0;
let impureCalls = 0;

// A normal ("pure") pipe runs again only when its input value changes.
@Pipe({ name: 'pureCount' })
class PureCount implements PipeTransform {
  transform(value: number) {
    pureCalls++;
    return value;
  }
}

// An impure pipe runs every time Angular checks the page. Use with great care!
@Pipe({ name: 'impureCount', pure: false })
class ImpureCount implements PipeTransform {
  transform(value: number) {
    impureCalls++;
    return value;
  }
}

// Eager = "check me on every round". (In Angular 22 components are OnPush by default, and an
// untouched OnPush component is skipped, which would hide the difference we want to see.)
@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [PureCount, ImpureCount],
  template: `{{ n() | pureCount }} {{ n() | impureCount }}`,
})
class Host {
  n = signal(1);
}

describe('pure and impure pipes', () => {
  it('a pure pipe runs once per new value, an impure pipe runs on every check', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();

    // Ask Angular to check the page five more times. Nothing changed.
    for (let i = 0; i < 5; i++) fixture.detectChanges();
    expect(pureCalls).toBe(1);
    expect(impureCalls).toBeGreaterThan(5);

    // Now the value really changes: the pure pipe runs one more time.
    fixture.componentInstance.n.set(2);
    await fixture.whenStable();
    expect(pureCalls).toBe(2);
  });
});
