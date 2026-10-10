# 8. Unions, Intersections & Literal Types

> **Like I'm 5:** A union is "this OR that": a light is either `'on'` or `'off'`, nothing else. An intersection is "this AND that": a superhero is both a flyer and a swimmer.

## Union types

```ts
type Id = string | number;

function show(id: Id) {
  console.log(`ID: ${id}`);
}
```

## Literal types

```ts
type Direction = 'north' | 'south' | 'east' | 'west';
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;

let dir: Direction = 'north';
// dir = 'up';   // Error
```

Literal types are very useful for states and options. They replace many magic strings.

## Intersection types

```ts
type Named = { name: string };
type Aged = { age: number };

type Person = Named & Aged;   // must have both

const p: Person = { name: 'Asha', age: 30 };
```

## Combining unions and literals

```ts
type Status = 'idle' | 'loading' | 'success' | 'error';

interface RequestState {
  status: Status;
  data?: string[];
  error?: string;
}
```

Better: model states that cannot overlap, using a discriminated union (see [09-narrowing-and-type-guards.md](09-narrowing-and-type-guards.md)).

## Template literal types

```ts
type Event = `on${Capitalize<'click' | 'focus'>}`;   // 'onClick' | 'onFocus'
```

## `as const`

```ts
const colors = ['red', 'green'] as const;   // readonly ['red', 'green']
type Color = (typeof colors)[number];       // 'red' | 'green'
```

## Important points
- Use literal unions instead of plain `string` for fixed options.
- Derive a type from a constant (`typeof` plus `as const`) so the list is written once.
- A union of objects needs narrowing before you can use properties that only some members have.
