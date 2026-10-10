# 7. Generics

> **Like I'm 5:** A generic is a box with a blank label. You decide the label when you use the box. A "box of X" can hold apples, and the compiler still remembers that it holds apples.

## Generic function

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const n = first([1, 2, 3]);       // number | undefined
const s = first(['a', 'b']);      // string | undefined
```

## Generic interface and type

```ts
interface ApiResponse<T> {
  data: T;
  status: number;
}

const res: ApiResponse<User[]> = { data: [], status: 200 };
```

## Constraints

Use `extends` to say what the type must have.

```ts
function getLength<T extends { length: number }>(value: T): number {
  return value.length;
}

getLength('hello');     // OK
getLength([1, 2]);      // OK
// getLength(42);       // Error: number has no length
```

## Multiple type parameters

```ts
function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}
```

## Default type parameters

```ts
interface Paged<T = unknown> {
  items: T[];
  total: number;
}
```

## Generic classes

```ts
class Repository<T extends { id: string }> {
  private items = new Map<string, T>();

  save(item: T): void { this.items.set(item.id, item); }
  find(id: string): T | undefined { return this.items.get(id); }
}

const users = new Repository<User>();
```

## `keyof` and constrained keys

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: 'Asha', age: 30 };
getProperty(user, 'name');     // string
// getProperty(user, 'email'); // Error
```

## Important points
- Name type parameters clearly when there are several, like `TKey` and `TValue`. Single letters are fine for simple cases.
- Add constraints (`extends`) so the generic does only what it's allowed to do.
- Let TypeScript infer type arguments. Write them out only when inference fails.
