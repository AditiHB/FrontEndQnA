# 6. Classes

> **Like I'm 5:** A class is a cookie cutter. It tells you the shape of every cookie you can make. Access modifiers are the "keep out" signs: `private` means only you can touch it, `public` means anyone can.

## Basic class

```ts
class Account {
  owner: string;
  balance: number = 0;

  constructor(owner: string) {
    this.owner = owner;
  }

  deposit(amount: number): void {
    this.balance += amount;
  }
}
```

## Parameter properties (shorthand)

```ts
class Account {
  constructor(public owner: string, private balance = 0) {}
}
```

Writing `public owner` in the constructor creates and assigns the property in one step.

## Access modifiers

| Modifier | Who can use it |
|----------|----------------|
| `public` | Anyone (default) |
| `protected` | This class and subclasses |
| `private` | This class only |
| `readonly` | Can be set once, in the constructor |

```ts
class Order {
  readonly id: string;
  private total = 0;
  protected status = 'new';

  constructor(id: string) { this.id = id; }
}
```

`private` is a compile-time check. For real runtime privacy, use the ECMAScript `#field` syntax:

```ts
class Secret {
  #code = 1234;   // truly private at runtime
}
```

## Inheritance and interfaces

```ts
interface Payable { pay(amount: number): void; }

abstract class Employee {
  constructor(protected name: string) {}
  abstract role(): string;          // subclasses must implement
}

class Manager extends Employee implements Payable {
  role() { return 'manager'; }
  pay(amount: number) { console.log(`${this.name} got ${amount}`); }
}
```

- `extends`: inherit from one class.
- `implements`: promise to follow an interface's shape.
- `abstract`: a base class that can't be created directly.

## Important points
- Prefer composition (passing objects in) over deep inheritance.
- Use `implements` to make the contract clear for other developers.
- In Angular and other frameworks, classes are used for components and services. The same modifiers apply.
