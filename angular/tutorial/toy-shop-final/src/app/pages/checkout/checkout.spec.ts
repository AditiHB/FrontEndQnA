import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { sampleProducts } from '../../data/sample-products';
import { CartService } from '../../services/cart-service';
import { Checkout, giftNeedsMessage, zipCode } from './checkout';

describe('Checkout', () => {
  let fixture: ComponentFixture<Checkout>;
  let page: Checkout;
  let server: HttpTestingController;

  const goodAnswers = {
    name: 'Mia',
    email: 'mia@toys.com',
    address: { street: '1 Toy Lane', city: 'Toyville', zip: '12345' },
    giftWrap: false,
    notes: '',
  };

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Checkout],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    TestBed.inject(CartService).add(sampleProducts[0], 2); // 2 racing cars
    server = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Checkout);
    page = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('is not valid until everything is filled in', () => {
    expect(page.form.valid).toBe(false);
    page.form.patchValue(goodAnswers);
    expect(page.form.valid).toBe(true);
  });

  it('shows the errors after pressing "Place order" on an empty form', async () => {
    page.submit();
    await fixture.whenStable();
    server.expectNone('/api/orders');
    expect(fixture.nativeElement.textContent).toContain('Please type your street');
  });

  it('asks for a gift message when gift wrap is on', () => {
    page.form.patchValue({ ...goodAnswers, giftWrap: true, notes: '' });
    expect(page.form.hasError('giftMessage')).toBe(true);
    page.form.patchValue({ notes: 'Happy birthday!' });
    expect(page.form.valid).toBe(true);
  });

  it('sends the order, empties the cart, and says thank you', async () => {
    page.form.patchValue(goodAnswers);
    page.submit();

    const request = server.expectOne('/api/orders');
    expect(request.request.body.lines[0]).toMatchObject({ name: 'Racing Car', quantity: 2 });
    request.flush({ ...request.request.body, id: 'T-1001', createdAt: 'now', userEmail: 'x' });
    await fixture.whenStable();

    expect(TestBed.inject(CartService).count()).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Thank you, Mia');
    expect(page.hasUnsavedChanges()).toBe(false);
  });

  it('knows when the person has typed something that is not saved', () => {
    expect(page.hasUnsavedChanges()).toBe(false);
    page.form.controls.name.markAsDirty();
    expect(page.hasUnsavedChanges()).toBe(true);
  });

  it('shows <b> in the gift preview but removes dangerous HTML', async () => {
    page.form.patchValue({ giftWrap: true });
    page.form.controls.notes.setValue(
      'Hi <b>Sam</b><img src="x" onerror="alert(1)"><script>alert(2)</script>',
    );
    await fixture.whenStable();

    const html = fixture.nativeElement.querySelector('.gift-preview span').innerHTML;
    expect(html).toContain('<b>Sam</b>'); // harmless formatting stays
    expect(html).not.toContain('onerror'); // the attack attribute is gone
    expect(html).not.toContain('<script'); // and so is the script
  });

  describe('our own rules', () => {
    it('zipCode wants exactly five digits', () => {
      expect(zipCode(new FormControl('12345'))).toBeNull();
      expect(zipCode(new FormControl('1234'))).toEqual({ zip: true });
      expect(zipCode(new FormControl('12a45'))).toEqual({ zip: true });
    });

    it('giftNeedsMessage only complains when gift wrap is on and the message is empty', () => {
      const group = (giftWrap: boolean, notes: string) =>
        ({ get: (k: string) => ({ value: { giftWrap, notes }[k] }) }) as never;
      expect(giftNeedsMessage(group(true, ''))).toEqual({ giftMessage: true });
      expect(giftNeedsMessage(group(false, ''))).toBeNull();
      expect(giftNeedsMessage(group(true, 'Hi'))).toBeNull();
    });
  });
});
