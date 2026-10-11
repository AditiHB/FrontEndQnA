import { Component, signal } from '@angular/core';
import { email, form, FormField, minLength, required, submit } from '@angular/forms/signals';

// The same login form as Chapter 15, but built with "signal forms".
// The data lives in ONE signal (the model). The form is a thin layer around it.
@Component({
  selector: 'app-signal-login',
  imports: [FormField],
  template: `
    <form (submit)="onSubmit($event)" novalidate>
      <label for="email">Email</label>
      <input id="email" type="email" [formField]="loginForm.email" />
      @if (loginForm.email().touched() && loginForm.email().invalid()) {
        @for (error of loginForm.email().errors(); track error.kind) {
          <p class="error" role="alert">{{ error.message }}</p>
        }
      }

      <label for="password">Password</label>
      <input id="password" type="password" [formField]="loginForm.password" />
      @if (loginForm.password().touched() && loginForm.password().invalid()) {
        @for (error of loginForm.password().errors(); track error.kind) {
          <p class="error" role="alert">{{ error.message }}</p>
        }
      }

      <button type="submit">Log in</button>
    </form>
    @if (sentTo()) {
      <p class="ok">Sent: {{ sentTo() }}</p>
    }
  `,
})
export class SignalLogin {
  // 1. The model: plain data in a signal.
  model = signal({ email: '', password: '' });

  // 2. The form: rules written per field.
  loginForm = form(this.model, (path) => {
    required(path.email, { message: 'Please type your email.' });
    email(path.email, { message: 'That does not look like an email.' });
    required(path.password, { message: 'Please type a password.' });
    minLength(path.password, 4, { message: 'The password needs at least 4 letters.' });
  });

  sentTo = signal('');

  onSubmit(event: Event) {
    event.preventDefault();
    // submit() marks everything touched, and only runs our function when the form is valid.
    submit(this.loginForm, async () => {
      this.sentTo.set(this.model().email);
    });
  }
}
