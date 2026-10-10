# 19. Strings, Numbers & Dates

> **Like I'm 5:** Strings are necklaces of letters, numbers are counting beads, and dates are calendar cards. Each one has tricks, and some tricks surprise beginners, like calendar months starting at zero.

## Strings

```js
const name = 'Asha';
`Hello, ${name}!`;              // template literal
name.padStart(6, '*');          // '**Asha'
name.replaceAll('a', 'A');      // 'AshA' (replaceAll replaces every match)
'  trim me  '.trim();           // 'trim me'
'a,b,c'.split(',');             // ['a', 'b', 'c']
name.at(-1);                    // 'a'
```

Strings are immutable. Methods return new strings.

## Numbers

```js
Number.isInteger(5);            // true
Number.isNaN('abc');            // false (no coercion)
(1234.5).toFixed(2);            // '1234.50' (returns a string)
Math.round(2.5);                // 3
Math.trunc(-2.7);               // -2
10n ** 20n;                     // BigInt for big integers
```

## Formatting with Intl

```js
new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(1234.5);
// '₹1,234.50'

new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(new Date(2026, 0, 15));
// '15 January 2026'

new Intl.RelativeTimeFormat('en').format(-2, 'day');   // '2 days ago'
```

Intl handles locale rules, so you don't write them yourself.

## Dates

```js
const now = new Date();
now.getMonth();                 // 0-11 (January is 0!)
now.toISOString();              // '2026-10-10T10:15:30.000Z' (UTC)
new Date('2026-10-10');         // parsed as UTC midnight
new Date(2026, 9, 10);          // October 10 in local time (month is 0-based)
```

## Date pitfalls
- Months are zero-based.
- `new Date('2026-10-10')` (date only) is UTC, but `new Date(2026, 9, 10)` is local. They can be different days in some time zones.
- Store and send dates as ISO strings in UTC.
- For real date math and time zones, consider libraries such as date-fns or Temporal (modern proposal, check browser support).

## Important points
- Use `Intl` for money, numbers, and dates shown to users.
- Use `Number.isNaN` and `Number.isInteger`, not the global `isNaN`.
- Don't do money math with floats. Use integer cents.
