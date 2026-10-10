import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SaleCountdown } from './sale-countdown';

describe('SaleCountdown', () => {
  let fixture: ComponentFixture<SaleCountdown>;

  beforeEach(async () => {
    // Fake clock: we decide when time moves, so the test never has to wait.
    vi.useFakeTimers();
    await TestBed.configureTestingModule({ imports: [SaleCountdown] }).compileComponents();

    fixture = TestBed.createComponent(SaleCountdown);
    fixture.componentRef.setInput('endsAt', new Date(Date.now() + 65_000));
    fixture.detectChanges();
  });

  afterEach(() => vi.useRealTimers());

  it('shows the time left', () => {
    expect(fixture.nativeElement.textContent).toContain('1:05');
  });

  it('counts down every second', () => {
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('1:04');
  });

  it('stops its clock when it is destroyed', () => {
    const stop = vi.spyOn(globalThis, 'clearInterval');
    fixture.destroy();
    expect(stop).toHaveBeenCalled();
  });
});
