# 6. Objects & Prototypes

> **Like I'm 5:** An object is a box with labelled compartments. When you look for something in your box and it isn't there, you ask the box's parent box. The parent might have it. That chain of parent boxes is the prototype chain.

## Objects

```js
const user = {
  name: 'Asha',
  age: 30,
  greet() {
    return `Hi, I'm ${this.name}`;
  },
};

user.name;          // 'Asha'
user['age'];        // 30
user.email = 'a@b.com';   // add a property
delete user.age;          // remove it
```

## Shorthand and computed keys

```js
const name = 'Asha';
const key = 'role';
const person = { name, [key]: 'admin' };   // { name: 'Asha', role: 'admin' }
```

## Prototype chain

```js
const animal = { breathes: true };
const dog = Object.create(animal);   // dog's prototype is animal
dog.barks = true;

dog.barks;      // true (own property)
dog.breathes;   // true (found on the prototype)
Object.getPrototypeOf(dog) === animal;   // true
```

Lookups go up the chain until they find the property or reach `null`.

## Classes are sugar over prototypes

```js
class Animal {
  speak() { return 'sound'; }
}
class Dog extends Animal {
  speak() { return 'woof'; }
}
// Under the hood: Dog.prototype.__proto__ === Animal.prototype
```

## Useful object methods

```js
Object.keys(user);             // ['name', 'greet']
Object.values(user);
Object.entries(user);          // [['name', 'Asha'], ...]
Object.assign({}, user, { age: 31 });   // shallow copy plus changes
Object.freeze(user);           // no changes allowed (shallow)
structuredClone(user);         // deep copy (modern browsers and Node)
```

## Important points
- Use `Object.hasOwn(obj, key)` to check for own properties, not inherited ones.
- Prefer plain objects and classes. Avoid changing built-in prototypes.
- `Object.freeze` is shallow. Nested objects can still change.
- `Object.keys` and similar methods return only own, enumerable properties.
