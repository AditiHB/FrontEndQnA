import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { safeReturnUrl } from '../../utils/safe-url';
import { AriaInvalid } from '../../directives/aria-invalid';

@Component({
  imports: [AriaInvalid, ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  // The guard adds ?returnUrl=... to the address, and the router gives it to us.
  returnUrl = input<string>();

  message = signal('');

  // A form is a group of little boxes (controls). nonNullable means "never null".
  form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // show every error at once
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.message.set('');
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigateByUrl(safeReturnUrl(this.returnUrl())),
      error: (e) => this.message.set(e.error?.message ?? 'Something went wrong'),
    });
  }
}
