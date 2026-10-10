import { TestBed } from '@angular/core/testing';
import { SHOP_NAME, TAX_RATE } from './tokens';

describe('tokens', () => {
  it('have sensible default values', () => {
    expect(TestBed.inject(SHOP_NAME)).toBe('Toy Shop');
    expect(TestBed.inject(TAX_RATE)).toBe(0.08);
  });

  it('can be replaced with another value', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: SHOP_NAME, useValue: 'Test Shop' }],
    });
    expect(TestBed.inject(SHOP_NAME)).toBe('Test Shop');
  });
});
