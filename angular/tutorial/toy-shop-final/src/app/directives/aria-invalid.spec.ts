import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AriaInvalid } from './aria-invalid';

@Component({
  imports: [ReactiveFormsModule, AriaInvalid],
  template: `<input [formControl]="name" />`,
})
class TestHost {
  name = new FormControl('', Validators.required);
}

describe('AriaInvalid', () => {
  it('says "invalid" only after the box was touched and is wrong', async () => {
    const fixture = TestBed.createComponent(TestHost);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(input.getAttribute('aria-invalid')).toBeNull(); // not touched yet

    input.dispatchEvent(new Event('blur')); // the person left the box, still empty
    await fixture.whenStable();
    expect(input.getAttribute('aria-invalid')).toBe('true');

    input.value = 'Mia';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });
});
