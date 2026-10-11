import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce, throttle } from '../src/perf.js';

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers()); // a fake clock: we decide when time passes
  afterEach(() => vi.useRealTimers());

  it('runs once, with the latest arguments, after the calls stop', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced('l');
    debounced('le');
    debounced('lem');
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('lem');
  });

  it('starts waiting again every time it is called', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced('a');
    vi.advanceTimersByTime(80);
    debounced('b');
    vi.advanceTimersByTime(80);
    expect(fn).not.toHaveBeenCalled(); // 160 ms passed, but never 100 ms of quiet
    vi.advanceTimersByTime(20);
    expect(fn).toHaveBeenCalledWith('b');
  });

  it('can cancel a pending call', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced('a');
    debounced.cancel();
    vi.advanceTimersByTime(500);
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('throttle', () => {
  it('runs at most once per window, using the clock we hand it', () => {
    let time = 1000;
    const fn = vi.fn();
    const throttled = throttle(fn, 50, () => time);

    throttled('a'); // runs
    throttled('b'); // too soon
    time += 49;
    throttled('c'); // still too soon
    time += 1;
    throttled('d'); // 50 ms have passed: runs

    expect(fn.mock.calls).toEqual([['a'], ['d']]);
  });
});
