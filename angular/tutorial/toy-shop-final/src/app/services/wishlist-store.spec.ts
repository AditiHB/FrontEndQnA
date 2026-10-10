import { TestBed } from '@angular/core/testing';
import { WishlistStore } from './wishlist-store';

describe('WishlistStore', () => {
  let wishlist: WishlistStore;

  beforeEach(() => {
    localStorage.clear();
    wishlist = TestBed.inject(WishlistStore);
  });

  it('starts empty', () => {
    expect(wishlist.count()).toBe(0);
    expect(wishlist.has(1)).toBe(false);
  });

  it('adds a toy the first time and removes it the second time', () => {
    wishlist.toggle(3);
    expect(wishlist.has(3)).toBe(true);
    expect(wishlist.count()).toBe(1);

    wishlist.toggle(3);
    expect(wishlist.has(3)).toBe(false);
    expect(wishlist.count()).toBe(0);
  });

  it('can move a toy to a new place in the list', () => {
    [1, 2, 3].forEach((id) => wishlist.toggle(id));
    wishlist.move(0, 2);
    expect(wishlist.ids()).toEqual([2, 3, 1]);
  });

  it('remembers the list in localStorage', () => {
    wishlist.toggle(5);
    TestBed.tick();
    expect(JSON.parse(localStorage.getItem('toyshop-wishlist') ?? '[]')).toEqual([5]);
  });
});
