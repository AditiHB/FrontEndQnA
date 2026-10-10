import { Component, input } from '@angular/core';
import { Product } from '../../models/product';

@Component({
  imports: [],
  selector: 'app-recommended-toys',
  styleUrl: './recommended-toys.css',
  templateUrl: './recommended-toys.html',
})
export class RecommendedToys {
  toys = input.required<Product[]>();
}
