import { computed, effect, linkedSignal, signal, untracked } from '@angular/core';
import { TestBed } from '@angular/core/testing';

describe('signals lab', () => {
  it('a signal is a box: read it with (), change it with set() or update()', () => {
    const likes = signal(0);
    likes.set(5);
    likes.update((n) => n + 1);
    expect(likes()).toBe(6);
  });

  it('computed is lazy and remembers its answer until something it reads changes', () => {
    let runs = 0;
    const n = signal(2);
    const double = computed(() => {
      runs++;
      return n() * 2;
    });

    expect(runs).toBe(0); // nobody asked yet, so it did not work
    expect(double()).toBe(4);
    expect(double()).toBe(4); // asked again: the remembered answer
    expect(runs).toBe(1);

    n.set(3); // an ingredient changed
    expect(double()).toBe(6);
    expect(runs).toBe(2);
  });

  it('setting the same value again changes nothing', () => {
    const seen: number[] = [];
    TestBed.runInInjectionContext(() => {
      const n = signal(1);
      effect(() => seen.push(n()));
      TestBed.tick();
      n.set(1); // same value
      TestBed.tick();
      expect(seen).toEqual([1]);
    });
  });

  it('an array must be replaced, not changed in place', () => {
    const seen: number[] = [];
    TestBed.runInInjectionContext(() => {
      const list = signal([1]);
      effect(() => seen.push(list().length));
      TestBed.tick();

      list().push(2); // sneaky: the box never heard about it
      TestBed.tick();
      expect(seen).toEqual([1]);

      list.update((l) => [...l, 3]); // a new array: the box notices
      TestBed.tick();
      expect(seen).toEqual([1, 3]);
    });
  });

  it('an effect runs when the signals it reads change, but not for untracked reads', () => {
    const log: string[] = [];
    TestBed.runInInjectionContext(() => {
      const user = signal('mia');
      const clicks = signal(0);
      effect(() => {
        // We depend on "user", but only peek at "clicks".
        log.push(`${user()} has ${untracked(clicks)} clicks`);
      });
      TestBed.tick();

      clicks.set(1); // not tracked: no new log line
      TestBed.tick();
      user.set('sam'); // tracked: runs again and sees the latest clicks
      TestBed.tick();

      expect(log).toEqual(['mia has 0 clicks', 'sam has 1 clicks']);
    });
  });

  it('linkedSignal goes back to a start value when its source changes, but you can also set it', () => {
    const category = signal('cars');
    const page = linkedSignal({ source: category, computation: () => 1 });

    page.set(3); // the shopper clicked page 3
    expect(page()).toBe(3);

    category.set('soft'); // a new category: back to page 1
    expect(page()).toBe(1);
  });
});
