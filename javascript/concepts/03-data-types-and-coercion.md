# 3. Data Types & Coercion

> **Like I'm 5:** JavaScript is a friend who tries to help. If you ask "1 plus '2'?", it guesses you want "12". That helpful guessing is called coercion, and it causes many surprises. `===` is the strict friend who never guesses.

## The types

```js
typeof 'hello'        // 'string'
typeof 42             // 'number'
typeof 10n            // 'bigint'
typeof true           // 'boolean'
typeof undefined      // 'undefined'
typeof Symbol('id')   // 'symbol'
typeof null           // 'object'  (a famous historical bug)
typeof {}             // 'object'
typeof []             // 'object'  (use Array.isArray)
typeof function () {} // 'function'
```

## Equality: `==` vs `===`

```js
0 == '0'        // true  (converts types first)
0 === '0'       // false (no conversion)
null == undefined   // true
null === undefined  // false
NaN === NaN     // false (use Number.isNaN)
```

Always use `===` and `!==`.

## Truthy and falsy

Falsy values: `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined`, `NaN`. Everything else is truthy, including `'0'`, `[]`, and `{}`.

```js
if ([]) console.log('empty array is truthy');
```

## Coercion examples

```js
'5' + 3      // '53'  (number becomes string)
'5' - 3      // 2     (string becomes number)
true + 1     // 2
[] + {}      // '[object Object]'
```

## Converting explicitly

```js
Number('42')      // 42
Number('4x')      // NaN
parseInt('42px', 10)   // 42
String(123)       // '123'
Boolean('false')  // true (any non-empty string is truthy)
```

## Numbers

```js
0.1 + 0.2 === 0.3          // false (floating point)
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON   // true
Number.MAX_SAFE_INTEGER    // 9007199254740991
```

For money, use integers (cents) or a decimal library.

## Important points
- Prefer `===`, and convert types explicitly with `Number()`, `String()`, or `Boolean()`.
- Be careful with big IDs above `Number.MAX_SAFE_INTEGER`. Use strings or `BigInt`.
- `Object.is` treats `NaN` as equal to `NaN`, and distinguishes `0` from `-0`.
