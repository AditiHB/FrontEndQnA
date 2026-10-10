import { Component, input, model } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-quantity-stepper',
  styleUrl: './quantity-stepper.css',
  templateUrl: './quantity-stepper.html',
})
export class QuantityStepper {
  // model() is a two-way mailbox: the parent can read it and write it.
  value = model(1);

  // input() is a one-way mailbox: the parent sends, we only read.
  min = input(1);
  max = input(10);

  decrease() {
    this.value.update((v) => Math.max(this.min(), v - 1));
  }

  increase() {
    this.value.update((v) => Math.min(this.max(), v + 1));
  }
}
