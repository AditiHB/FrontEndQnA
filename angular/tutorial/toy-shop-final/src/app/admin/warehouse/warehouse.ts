import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { Component } from '@angular/core';

interface Box {
  id: number;
  label: string;
  toys: number;
}

@Component({
  // CdkFixedSizeVirtualScroll is the part that understands itemSize. Do not forget it!
  imports: [CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf],
  selector: 'app-warehouse',
  styleUrl: './warehouse.css',
  templateUrl: './warehouse.html',
})
export class Warehouse {
  // Five thousand boxes! Drawing all of them would make the page slow.
  boxes: Box[] = Array.from({ length: 5000 }, (_, i) => ({
    id: i + 1,
    label: `Box #${i + 1}`,
    toys: (i * 7) % 40,
  }));

  trackById(_index: number, box: Box) {
    return box.id;
  }
}
