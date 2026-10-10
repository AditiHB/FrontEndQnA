# 5. Forms

### Q1. What is the difference between template-driven and reactive forms? `Core`

**Answer:**
- **Template-driven**: the form model is in the template (`ngModel`). It is simple for small forms, but harder to test and less predictable for complex logic.
- **Reactive**: the form model is in TypeScript (`FormGroup`, `FormControl`, `FormArray`). It is explicit, testable, and better for dynamic or complex forms. Most enterprise apps use reactive forms.

---

### Q2. How do you write strongly typed reactive forms? `Core`

**Answer:** Since Angular 14, forms are typed by default.

```ts
form = new FormGroup({
  name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  age: new FormControl<number | null>(null),
});

// form.value.name is string, not string | undefined
```

Use `nonNullable: true` so `reset()` returns to the default value and not to `null`.

---

### Q3. What are validators, async validators, and cross-field validators? `Core`

**Answer:**
```ts
// Sync validator
const noSpaces: ValidatorFn = c => /\s/.test(c.value) ? { noSpaces: true } : null;

// Async validator (for example, checking if a username exists)
checkUsername(): AsyncValidatorFn {
  return c => timer(400).pipe(   // debounce
    switchMap(() => this.api.isTaken(c.value)),
    map(taken => (taken ? { taken: true } : null)),
    catchError(() => of(null))
  );
}

// Cross-field validator (group-level)
const passwordsMatch: ValidatorFn = g =>
  g.get('password')?.value === g.get('confirm')?.value ? null : { mismatch: true };
```

---

### Q4. How do you create a custom form control that works with `[formControl]`? `Advanced`

**Answer:** Implement `ControlValueAccessor`, a bridge between the form API and your component.

```ts
@Component({
  selector: 'app-star-rating',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StarRatingComponent), multi: true }]
})
export class StarRatingComponent implements ControlValueAccessor {
  value = signal(0);
  private onChange: (v: number) => void = () => {};
  private onTouched = () => {};

  writeValue(v: number) { this.value.set(v ?? 0); }
  registerOnChange(fn: any) { this.onChange = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }
  setDisabledState?(disabled: boolean) { /* disable UI */ }

  select(v: number) {
    this.value.set(v);
    this.onChange(v);
    this.onTouched();
  }
}
```

---

### Q5. What is `updateOn`, and when do you use it? `Advanced`

**Answer:** `updateOn` controls when a value updates: `'change'` (default), `'blur'`, or `'submit'`. Use `'blur'` on expensive validation (for example, server checks) to avoid sending a request on every keystroke.

---

### Q6. How do you build dynamic forms, for example forms defined by a backend schema? `Architect`

**Answer:**
1. Describe fields in a config model (type, label, validators, options).
2. Map the config to controls with a `FormBuilder` loop, or a `FormArray` for repeating groups.
3. Render controls with a single generic component that switches on `type`, or with `@switch` in the template.
4. Keep the schema validation on the backend, and let the frontend mirror it for UX.

---

### Q7. How do you show validation errors in a consistent way? `Core`

**Answer:** Create a reusable `<app-field-error>` component, or a directive that reads `control.errors` and shows messages from a central map. Show errors only when `control.touched || form.submitted`, not on the first load.

---

### Q8. What are the trade-offs of client-side validation? `Core`

**Answer:** Client-side validation improves user experience, but it is **never** a security control. Every rule must be enforced on the server (for example, Bean Validation with `@Valid` in Spring). I keep the rules in sync by generating or sharing the validation contract, for example from an OpenAPI schema.

---

### Q9. How do you reset a form and keep the values? `Core`

**Answer:** Use `form.reset()` to clear values and states. Use `form.markAsPristine()` if you only want to clear the dirty flag. Use `patchValue()` to update some fields without triggering validation on all of them, and `setValue()` to set all fields (it throws if a key is missing).

---

### Q10. Signal-based forms: what do you know about them? `Advanced`

**Answer:** Angular is introducing signal-based form APIs that model form state (value, validity, touched) as signals, so templates and computed values update automatically. Check the current status for your version, since this area changes quickly. Mention that reactive forms remain fully supported, and that you would evaluate the new API for new projects after it is stable.
