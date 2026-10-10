# 17. Advanced Patterns

> **Like I'm 5:** Advanced patterns are clever tricks. A branded type is a sticker that says "this apple is a red apple", so you can't accidentally use a green apple where a red one is needed, even though both are apples.

## Branded (nominal) types

TypeScript is structural: two types with the same shape are interchangeable. Brands make them distinct.

```ts
type UserId = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

function userId(value: string): UserId {
  return value as UserId;
}

function loadUser(id: UserId) { /* ... */ }

loadUser(userId('u-1'));   // OK
// loadUser('u-1');        // Error: plain string is not a UserId
```

## Builder pattern with method chaining

```ts
class QueryBuilder {
  private parts: string[] = [];

  select(fields: string): this {
    this.parts.push(`SELECT ${fields}`);
    return this;
  }

  from(table: string): this {
    this.parts.push(`FROM ${table}`);
    return this;
  }

  build(): string {
    return this.parts.join(' ');
  }
}

const sql = new QueryBuilder().select('*').from('users').build();
```

Returning `this` keeps the subclass type when chaining.

## Exhaustive handling

```ts
type Event =
  | { type: 'login'; userId: string }
  | { type: 'logout' };

function handle(e: Event) {
  switch (e.type) {
    case 'login': return `in ${e.userId}`;
    case 'logout': return 'out';
    default: {
      const _never: never = e;   // compile error if a case is missing
      return _never;
    }
  }
}
```

## Type-safe event map

```ts
interface Events {
  save: { id: string };
  error: { message: string };
}

function on<K extends keyof Events>(name: K, handler: (payload: Events[K]) => void) {
  // ...
}

on('save', p => console.log(p.id));   // p is typed from the name
```

## Opaque or readonly tuples for config

```ts
const config = ['api', 'v1', 3] as const;
```

## Recursive types

```ts
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
```

## Important points
- Advanced patterns should solve a real problem. Simple code is easier to maintain.
- Brands prevent mixing up IDs, which is a common source of bugs.
- Document clever types with a short example in a comment.
