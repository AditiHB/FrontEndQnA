import { toSignal } from '@angular/core/rxjs-interop';
import { Component, inject } from '@angular/core';
import { ProductService } from '../../services/product-service';

@Component({
  imports: [],
  selector: 'app-inventory',
  styleUrl: './inventory.css',
  templateUrl: './inventory.html',
})
export class Inventory {
  toys = toSignal(inject(ProductService).getAll(), { initialValue: [] });
}
