# 10. Classes

> **Like I'm 5:** A class is a cookie cutter. Each time you press it, you get a new cookie with the same shape. Private fields (`#`) are the sprinkles you keep hidden inside the cookie.

## Basic class

```js
class Account {
  #balance = 0;                  // private field
  static bankName = 'Acme';      // belongs to the class, not each object

  constructor(owner) {
    this.owner = owner;
  }

  deposit(amount) {
    if (amount <= 0) throw new RangeError('Amount must be positive');
    this.#balance += amount;
    return this;
  }

  get balance() {                // getter
    return this.#balance;
  }

  static create(owner) {         // static method
    return new Account(owner);
  }
}

const acc = new Account('Asha').deposit(100);
acc.balance;          // 100
acc.#balance;         // SyntaxError: private outside the class
```

## Inheritance

```js
class SavingsAccount extends Account {
  constructor(owner, rate) {
    super(owner);               // must call super before using this
    this.rate = rate;
  }

  addInterest() {
    return this.deposit(this.balance * this.rate);
  }
}
```

## `#private` vs `_convention`

- `#name` is enforced by JavaScript. Outside code can't read it.
- `_name` is only a naming convention. Anyone can still read it.

## Class fields and methods

```js
class Counter {
  count = 0;                   // class field, created for each instance
  increment = () => {          // arrow function field: keeps `this`
    this.count++;
  };
}
```

## Important points
- Methods defined in a class are shared through the prototype, not copied into each object.
- Use `#private` fields for internal state.
- Prefer composition over deep inheritance.
