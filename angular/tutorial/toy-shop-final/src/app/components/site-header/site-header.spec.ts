import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SiteHeader } from './site-header';

describe('SiteHeader', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SiteHeader],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('shows the shop name and a way to log in', async () => {
    const fixture = TestBed.createComponent(SiteHeader);
    await fixture.whenStable();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Toy Shop');
    expect(text).toContain('Log in');
  });
});
