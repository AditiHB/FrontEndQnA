import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Login } from './login';

describe('Login', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('does not send anything while the form is empty', async () => {
    const fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
    const server = TestBed.inject(HttpTestingController);

    fixture.componentInstance.submit();
    await fixture.whenStable();

    server.expectNone('/api/login');
    expect(fixture.nativeElement.textContent).toContain('Please type your email');
  });

  it('logs in and goes home when the form is filled in', async () => {
    const fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
    const server = TestBed.inject(HttpTestingController);
    const go = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    fixture.componentInstance.form.setValue({ email: 'mia@toys.com', password: 'toys123' });
    fixture.componentInstance.submit();
    server.expectOne('/api/login').flush({
      email: 'mia@toys.com',
      name: 'mia',
      role: 'shopper',
      token: 't',
    });

    expect(go).toHaveBeenCalledWith('/');
  });
});

describe('Login: safe redirect', () => {
  it('ignores a returnUrl that points to another website', async () => {
    TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(Login);
    fixture.componentRef.setInput('returnUrl', 'https://evil.example');
    await fixture.whenStable();
    const go = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    fixture.componentInstance.form.setValue({ email: 'mia@toys.com', password: 'toys123' });
    fixture.componentInstance.submit();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/login')
      .flush({ email: 'mia@toys.com', name: 'mia', role: 'shopper', token: 't' });

    expect(go).toHaveBeenCalledWith('/');
  });
});
