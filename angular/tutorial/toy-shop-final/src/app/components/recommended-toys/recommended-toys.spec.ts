import { ComponentFixture, TestBed } from '@angular/core/testing';
import { sampleProducts } from '../../data/sample-products';
import { RecommendedToys } from './recommended-toys';

describe('RecommendedToys', () => {
  let fixture: ComponentFixture<RecommendedToys>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecommendedToys],
    }).compileComponents();

    fixture = TestBed.createComponent(RecommendedToys);
    // "toys" is a required input, so the test must hand some toys over.
    fixture.componentRef.setInput('toys', sampleProducts.slice(0, 2));
    await fixture.whenStable();
  });

  it('lists the toys it was given', () => {
    const items = fixture.nativeElement.querySelectorAll('li');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Racing Car');
  });
});
