# 7. Arrays & Iteration

> **Like I'm 5:** An array is a row of lunch boxes. `map` makes a new row where each box is changed. `filter` keeps only the boxes you like. `reduce` squashes the whole row into one answer, like a total.

## Creating and reading

```js
const fruits = ['apple', 'banana', 'cherry'];
fruits[0];           // 'apple'
fruits.at(-1);       // 'cherry' (from the end)
fruits.length;       // 3
```

## The big four: map, filter, reduce, find

```js
const prices = [10, 25, 5];

prices.map(p => p * 1.18);        // new array with tax
prices.filter(p => p > 8);        // [10, 25]
prices.reduce((sum, p) => sum + p, 0);   // 40
prices.find(p => p > 20);         // 25 (first match)
prices.some(p => p > 20);         // true
prices.every(p => p > 0);         // true
```

## Non-mutating vs mutating methods

| Mutates the original | Returns a new array |
|----------------------|---------------------|
| `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse` | `concat`, `slice`, `map`, `filter`, `toSorted`, `toReversed`, `toSpliced` |

```js
const sorted = [3, 1, 2].toSorted();   // [1, 2, 3], original unchanged
```

## Loops

```js
for (const item of fruits) console.log(item);      // values
fruits.forEach((item, index) => console.log(index, item));
for (const [i, v] of fruits.entries()) { /* ... */ }
```

- `for...of` works with any iterable and supports `break` and `continue`.
- `forEach` can't be stopped early with `break`.

## Grouping and searching

```js
Object.groupBy(people, p => p.city);   // ES2024: { Pune: [...], Delhi: [...] }
fruits.includes('banana');             // true
fruits.indexOf('kiwi');                // -1
```

## Sorting numbers

```js
[10, 9, 100].sort();                 // [10, 100, 9] (string comparison!)
[10, 9, 100].sort((a, b) => a - b);  // [9, 10, 100]
```

## Important points
- Chain `filter`, `map`, and `reduce` for readable data transformations.
- Use `toSorted` and other non-mutating methods in state-driven UI code.
- Avoid `reduce` when a simple loop is clearer.
- Always pass a comparison function to `sort` for numbers.
