import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { sampleProducts } from '../../data/sample-products';
import { Home } from './home';

describe('Home', () => {
  let server: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    server = TestBed.inject(HttpTestingController);
  });

  function names(root: HTMLElement) {
    return Array.from(root.querySelectorAll('app-product-card h2')).map((h) =>
      h.textContent?.trim(),
    );
  }

  async function openHome() {
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    // The pretend server answers the "products.json" question.
    server.expectOne('products.json').flush(sampleProducts);
    await fixture.whenStable();
    return fixture;
  }

  it('shows the first page of toys once the server answers', async () => {
    const fixture = await openHome();
    await vi.waitFor(() => expect(names(fixture.nativeElement).length).toBe(6));
  });

  it('filters the toys while you type', async () => {
    const fixture = await openHome();
    await vi.waitFor(() => expect(names(fixture.nativeElement).length).toBe(6));

    fixture.componentInstance.searchTerm.setValue('panda');

    await vi.waitFor(async () => {
      await fixture.whenStable();
      expect(names(fixture.nativeElement)).toEqual(['Sleepy Panda']);
    });
  });
});
