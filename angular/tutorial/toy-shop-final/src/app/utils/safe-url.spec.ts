import { safeReturnUrl } from './safe-url';

describe('safeReturnUrl', () => {
  it('keeps paths inside the shop', () => {
    expect(safeReturnUrl('/checkout')).toBe('/checkout');
    expect(safeReturnUrl('/product/3?x=1')).toBe('/product/3?x=1');
  });

  it('sends everything else home', () => {
    expect(safeReturnUrl(undefined)).toBe('/');
    expect(safeReturnUrl('')).toBe('/');
    expect(safeReturnUrl('https://evil.example')).toBe('/');
    expect(safeReturnUrl('//evil.example')).toBe('/');
    expect(safeReturnUrl('/\\evil.example')).toBe('/');
    expect(safeReturnUrl('javascript:alert(1)')).toBe('/');
  });
});
