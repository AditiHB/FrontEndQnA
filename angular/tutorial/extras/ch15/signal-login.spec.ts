import { TestBed } from '@angular/core/testing';
import { SignalLogin } from './signal-login';

describe('SignalLogin (signal forms)', () => {
  function type(input: HTMLInputElement, text: string) {
    input.value = text;
    input.dispatchEvent(new Event('input'));
  }

  it('writes what you type into the model signal', async () => {
    const fixture = TestBed.createComponent(SignalLogin);
    await fixture.whenStable();
    const email = fixture.nativeElement.querySelector('#email');

    type(email, 'mia@toys.com');
    await fixture.whenStable();

    expect(fixture.componentInstance.model().email).toBe('mia@toys.com');
  });

  it('shows messages for an empty form after pressing submit, and does not send', async () => {
    const fixture = TestBed.createComponent(SignalLogin);
    await fixture.whenStable();

    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Please type your email.');
    expect(text).toContain('Please type a password.');
    expect(fixture.componentInstance.sentTo()).toBe('');
  });

  it('sends when everything is fine', async () => {
    const fixture = TestBed.createComponent(SignalLogin);
    await fixture.whenStable();
    type(fixture.nativeElement.querySelector('#email'), 'mia@toys.com');
    type(fixture.nativeElement.querySelector('#password'), 'toys123');
    await fixture.whenStable();

    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();

    expect(fixture.componentInstance.sentTo()).toBe('mia@toys.com');
  });
});
