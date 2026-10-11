import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HasUnsavedChanges } from '../../guards/unsaved-changes-guard';
import { NewOrder, Order } from '../../models/order';
import { AuthService } from '../../services/auth-service';
import { CartService } from '../../services/cart-service';
import { OrderService } from '../../services/order-service';
import { AriaInvalid } from '../../directives/aria-invalid';

// A rule of our own: a ZIP code is exactly five digits.
export const zipCode: ValidatorFn = (control): ValidationErrors | null =>
  /^\d{5}$/.test(control.value) ? null : { zip: true };

// A rule that looks at TWO boxes at once: gift wrap needs a gift message.
export const giftNeedsMessage: ValidatorFn = (group): ValidationErrors | null => {
  const giftWrap = group.get('giftWrap')?.value;
  const notes = String(group.get('notes')?.value ?? '').trim();
  return giftWrap && !notes ? { giftMessage: true } : null;
};

@Component({
  imports: [AriaInvalid, ReactiveFormsModule, CurrencyPipe, RouterLink],
  selector: 'app-checkout',
  styleUrl: './checkout.css',
  templateUrl: './checkout.html',
})
export class Checkout implements HasUnsavedChanges {
  cart = inject(CartService);
  private auth = inject(AuthService);
  private orders = inject(OrderService);
  private fb = inject(FormBuilder).nonNullable;

  placed = signal<Order | null>(null);
  sending = signal(false);
  problem = signal('');

  form = this.fb.group(
    {
      name: [this.auth.user()?.name ?? '', [Validators.required, Validators.minLength(2)]],
      email: [this.auth.user()?.email ?? '', [Validators.required, Validators.email]],
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        zip: ['', [Validators.required, zipCode]],
      }),
      giftWrap: false,
      notes: '',
      // A FormArray is a list of boxes that can grow and shrink.
      giftTags: this.fb.array<string>([]),
    },
    { validators: giftNeedsMessage },
  );

  // Forms speak in streams (Observables). toSignal turns the stream into a signal box.
  giftWrap = toSignal(this.form.controls.giftWrap.valueChanges, { initialValue: false });

  // What the person is typing in the gift message. We show a preview of it with [innerHTML].
  // Angular cleans that HTML first (see the gift-preview in the template).
  giftMessage = toSignal(this.form.controls.notes.valueChanges, { initialValue: '' });

  addTag() {
    this.form.controls.giftTags.push(this.fb.control('', Validators.required));
  }

  removeTag(index: number) {
    this.form.controls.giftTags.removeAt(index);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const order: NewOrder = {
      name: v.name,
      email: v.email,
      address: `${v.address.street}, ${v.address.city} ${v.address.zip}`,
      giftWrap: v.giftWrap,
      notes: v.notes,
      giftTags: v.giftTags,
      lines: this.cart.items().map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
      })),
      total: this.cart.total(),
    };

    this.sending.set(true);
    this.problem.set('');
    this.orders.place(order).subscribe({
      next: (saved) => {
        this.placed.set(saved);
        this.cart.clear();
        this.form.markAsPristine(); // nothing left unsaved
        this.sending.set(false);
      },
      error: (e) => {
        this.problem.set(e.error?.message ?? 'The order did not go through. Please try again.');
        this.sending.set(false);
      },
    });
  }

  // The "are you sure?" guard asks this question before we leave the page.
  hasUnsavedChanges() {
    return this.form.dirty && !this.placed();
  }
}
