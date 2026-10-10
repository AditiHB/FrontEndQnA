import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminShell } from './admin-shell';

describe('AdminShell', () => {
  it('shows the admin heading and menu', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(AdminShell);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Admin corner');
    expect(fixture.nativeElement.textContent).toContain('Inventory');
  });
});
