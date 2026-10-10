# 11. Mapped & Conditional Types

> **Like I'm 5:** A mapped type is a photocopier. It takes each line of a form and makes a new version of it, say, with every answer box turned into a tick box. A conditional type is a question machine: "If this is a number, answer 'math'; otherwise answer 'words'."

## `keyof` and `typeof`

```ts
interface Product { id: number; name: string; price: number }

type ProductKey = keyof Product;          // 'id' | 'name' | 'price'

const sample = { color: 'red', size: 3 };
type Sample = typeof sample;              // { color: string; size: number }
```

## Indexed access

```ts
type Price = Product['price'];            // number
type Values = Product[keyof Product];     // number | string
```

## Mapped types

```ts
type Optional<T> = { [K in keyof T]?: T[K] };
type ReadonlyDeep<T> = { readonly [K in keyof T]: T[K] };

// Make every property a getter that returns a Promise
type Async<T> = { [K in keyof T]: Promise<T[K]> };
```

Modifiers:
- `+readonly` / `-readonly`, `+?` / `-?` add or remove `readonly` and `?`.

```ts
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type Required2<T> = { [K in keyof T]-?: T[K] };
```

## Conditional types

```ts
type IsString<T> = T extends string ? 'yes' : 'no';

type A = IsString<'hello'>;   // 'yes'
type B = IsString<42>;        // 'no'
```

## `infer`

Pull a type out of another type.

```ts
type ElementOf<T> = T extends (infer U)[] ? U : never;

type Item = ElementOf<string[]>;   // string

type Unwrap<T> = T extends Promise<infer V> ? V : T;
```

## Distributive behavior

Conditional types on a union run for each member.

```ts
type ToArray<T> = T extends unknown ? T[] : never;

type R = ToArray<string | number>;   // string[] | number[]
```

## Template literal types with mapping

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
};

type UserGetters = Getters<{ name: string; age: number }>;
// { getName: () => string; getAge: () => number }
```

## Important points
- Start with simple utilities. Advanced types are harder to read for teammates, so document them.
- Hover in the editor to see the resolved type.
- Use `infer` when you need a type from inside another type, such as a function's return value.
