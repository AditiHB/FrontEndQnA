import { TestBed } from '@angular/core/testing';
import { Warehouse } from './warehouse';

describe('Warehouse', () => {
  it('has thousands of boxes but draws only a few rows', async () => {
    const fixture = TestBed.createComponent(Warehouse);
    await fixture.whenStable();

    expect(fixture.componentInstance.boxes.length).toBe(5000);
    const drawn = fixture.nativeElement.querySelectorAll('.box-row').length;
    expect(drawn).toBeLessThan(100);
  });
});
