// Created ONCE and reused: making a new Intl formatter is surprisingly slow (see Step 20).
const rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

// Paise (a whole number) in, text for people out: 8060 -> "₹80.60"
export function formatMoney(paise) {
  return rupees.format(paise / 100);
}

// A Date in, a time like "15:42" out. Leave `timeZone` out to use the person's own time zone.
export function formatTime(date, { timeZone } = {}) {
  return new Intl.DateTimeFormat('en-IN', {
    timeStyle: 'short',
    hourCycle: 'h23',
    timeZone,
  }).format(date);
}

// "2 minutes ago", "yesterday". `now` can be passed in, so the function stays pure and testable.
export function timeAgo(date, now = Date.now()) {
  const seconds = Math.trunc((new Date(date).getTime() - now) / 1000); // negative = in the past
  const units = [
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) {
      return relative.format(Math.trunc(seconds / size), unit);
    }
  }
  return relative.format(seconds, 'second');
}
