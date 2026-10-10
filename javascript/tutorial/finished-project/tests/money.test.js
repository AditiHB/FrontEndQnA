import { describe, expect, it } from 'vitest';
import { lineTotal, toRupees } from '../src/money.js';

describe('money', () => {
  it('turns paise into rupees', () => {
    expect(toRupees(4000)).toBe(40);
    expect(toRupees(8060)).toBe(80.6);
  });

  it('multiplies a price by a quantity', () => {
    expect(lineTotal(2500, 3)).toBe(7500);
  });
});
