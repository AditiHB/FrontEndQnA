import { describe, expect, it } from 'vitest';
import { formatMoney, formatTime, timeAgo } from '../src/format.js';

describe('formatMoney', () => {
  it('shows rupees with two decimals', () => {
    expect(formatMoney(4000)).toBe('₹40.00');
    expect(formatMoney(8060)).toBe('₹80.60');
  });

  it('uses Indian grouping (lakhs and crores)', () => {
    expect(formatMoney(1019999100)).toBe('₹1,01,99,991.00');
  });
});

describe('formatTime', () => {
  it('shows a 24-hour time in the time zone we ask for', () => {
    const moment = new Date(Date.UTC(2026, 9, 10, 9, 30));
    expect(formatTime(moment, { timeZone: 'UTC' })).toBe('09:30');
    expect(formatTime(moment, { timeZone: 'Asia/Kolkata' })).toBe('15:00');
  });
});

describe('timeAgo', () => {
  const now = Date.UTC(2026, 9, 10, 12, 0, 0); // we hand the clock in, so the answer never changes

  it.each([
    [0, 'now'],
    [30, '30 seconds ago'],
    [120, '2 minutes ago'],
    [3 * 3600, '3 hours ago'],
    [86400, 'yesterday'],
  ])('%i seconds ago is "%s"', (secondsAgo, expected) => {
    expect(timeAgo(now - secondsAgo * 1000, now)).toBe(expected);
  });
});
