import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ErrorLab } from './error-lab';

describe('ErrorLab', () => {
  it('tells the page when the server fails', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(ErrorLab);
    await fixture.whenStable();

    fixture.componentInstance.breakServer();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/boom')
      .flush({}, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('HTTP 500');
  });

  it('throws when the code button is pressed', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const lab = TestBed.createComponent(ErrorLab).componentInstance;
    expect(() => lab.breakCode()).toThrow('broke on purpose');
  });
});
