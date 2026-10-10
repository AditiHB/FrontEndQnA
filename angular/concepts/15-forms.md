# 15. Forms

> **Like I'm 5:** A form is a set of boxes to fill in. Reactive forms keep the rules in your code. Validators are the rules, like "name must not be empty", and the form tells the user when a rule is broken.

## Key concepts
- **Template-driven forms**: `ngModel` in the template. Good for simple forms.
- **Reactive forms**: `FormControl`, `FormGroup`, and `FormArray` in TypeScript. Preferred for complex forms.
- **Validators**: sync, async, and cross-field.
- **ControlValueAccessor**: lets a custom component work with `formControl` and `ngModel`.

## Reactive form

```ts
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-address-form',
  imports: [ReactiveFormsModule],
  templateUrl: './address-form.html',
})
export class AddressFormComponent {
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    street: ['', Validators.required],
    city: ['', [Validators.required, Validators.minLength(2)]],
    zip: ['', Validators.pattern(/^\d{5}$/)],
    lines: this.fb.array<string>([]),
  });

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    console.log(this.form.getRawValue());
  }
}
```

```html
<form [formGroup]="form" (ngSubmit)="submit()">
  <input formControlName="street" />
  @if (form.controls.street.touched && form.controls.street.hasError('required')) {
    <small class="error">Street is required</small>
  }
  <input formControlName="city" />
  <button [disabled]="form.invalid">Save</button>
</form>
```

## Typed form values

```ts
form.value.city;        // string | undefined (partial)
form.getRawValue();     // full typed value
```

## Dynamic arrays

```ts
addLine() { this.form.controls.lines.push(this.fb.nonNullable.control('')); }
removeLine(i: number) { this.form.controls.lines.removeAt(i); }
```

## Custom validators

```ts
export const noWhitespace: ValidatorFn = (control) =>
  /\s/.test(control.value) ? { whitespace: true } : null;

export const passwordsMatch: ValidatorFn = (group) =>
  group.get('password')?.value === group.get('confirm')?.value ? null : { mismatch: true };

// on the group
this.fb.group({ password: [''], confirm: [''] }, { validators: passwordsMatch });
```

## Async validator with debounce

```ts
emailTaken(api: UserApi): AsyncValidatorFn {
  return (c) => timer(400).pipe(
    switchMap(() => api.isEmailTaken(c.value)),
    map(taken => (taken ? { taken: true } : null)),
    catchError(() => of(null)),
  );
}
```

## Update timing

```ts
email = new FormControl('', { nonNullable: true, updateOn: 'blur' });
```

## Custom control (ControlValueAccessor)

```ts
@Component({
  selector: 'app-toggle',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: ToggleComponent, multi: true }],
  template: `<button (click)="toggle()">{{ on() ? 'On' : 'Off' }}</button>`,
})
export class ToggleComponent implements ControlValueAccessor {
  on = signal(false);
  private onChange = (_: boolean) => {};
  private onTouched = () => {};

  writeValue(v: boolean) { this.on.set(!!v); }
  registerOnChange(fn: any) { this.onChange = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }
  toggle() { this.on.update(v => !v); this.onChange(this.on()); this.onTouched(); }
}
```

## Important points
- Show errors after `touched` or submit, not on the first render.
- Client validation is not security. Always validate on the server.
- Use `form.reset()` with `nonNullable` builders to restore default values.
