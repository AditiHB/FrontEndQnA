import { Component, forwardRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  AbstractControl,
  AsyncValidatorFn,
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { map, timer } from 'rxjs';

// 1. An ASYNC validator: it needs to ask "the server", so the answer comes later.
const emailTaken: AsyncValidatorFn = (control: AbstractControl) =>
  timer(300).pipe(map(() => (control.value === 'taken@toys.com' ? { taken: true } : null)));

// 2. A CUSTOM CONTROL: a row of stars that works with formControlName like a normal input.
//    ControlValueAccessor is the "plug adapter" between a form control and our own component.
@Component({
  selector: 'app-star-input',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StarInput), multi: true },
  ],
  template: `
    @for (n of [1, 2, 3, 4, 5]; track n) {
      <button
        type="button"
        [attr.aria-label]="n + ' stars'"
        [disabled]="disabled()"
        (click)="pick(n)"
      >
        {{ n <= value() ? '★' : '☆' }}
      </button>
    }
  `,
})
class StarInput implements ControlValueAccessor {
  value = signal(0);
  disabled = signal(false);
  private onChange: (v: number) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(v: number | null) {
    this.value.set(v ?? 0); // the form wrote a new value: show it
  }
  registerOnChange(fn: (v: number) => void) {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean) {
    this.disabled.set(isDisabled);
  }
  pick(n: number) {
    this.value.set(n);
    this.onChange(n); // tell the form
    this.onTouched();
  }
}

@Component({
  imports: [ReactiveFormsModule, StarInput],
  template: `<form [formGroup]="form"><app-star-input formControlName="stars" /></form>`,
})
class Host {
  form = new FormGroup({ stars: new FormControl(2, { nonNullable: true }) });
}

@Component({
  imports: [ReactiveFormsModule],
  template: `<input [formControl]="name" />`,
})
class BlurHost {
  name = new FormControl('', { nonNullable: true, updateOn: 'blur' });
}

describe('forms lab', () => {
  afterEach(() => vi.useRealTimers());

  it('an async validator is "pending" until the answer comes back', async () => {
    vi.useFakeTimers();
    const email = new FormControl('taken@toys.com', { asyncValidators: [emailTaken] });
    expect(email.pending).toBe(true);

    await vi.advanceTimersByTimeAsync(300);
    expect(email.pending).toBe(false);
    expect(email.errors).toEqual({ taken: true });

    email.setValue('free@toys.com');
    await vi.advanceTimersByTimeAsync(300);
    expect(email.valid).toBe(true);
  });

  it('updateOn: "blur" waits until you leave the box before the control gets the value', async () => {
    const fixture = TestBed.createComponent(BlurHost);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    input.value = 'Mia';
    input.dispatchEvent(new Event('input')); // typing...
    expect(fixture.componentInstance.name.value).toBe(''); // ...the control has not heard yet

    input.dispatchEvent(new Event('blur')); // leaving the box
    expect(fixture.componentInstance.name.value).toBe('Mia');
  });

  it('a custom control works with formControlName in both directions', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = fixture.componentInstance;
    const buttons = fixture.nativeElement.querySelectorAll('button');

    // form -> control: the form already says 2 stars
    expect(fixture.nativeElement.textContent.match(/★/g)?.length).toBe(2);

    // control -> form: click the 4th star
    buttons[3].click();
    await fixture.whenStable();
    expect(host.form.controls.stars.value).toBe(4);
    expect(host.form.controls.stars.touched).toBe(true);

    // form -> control again: the program sets 1
    host.form.controls.stars.setValue(1);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent.match(/★/g)?.length).toBe(1);

    // disabled flows down as well
    host.form.controls.stars.disable();
    await fixture.whenStable();
    expect(buttons[0].disabled).toBe(true);
  });
});
