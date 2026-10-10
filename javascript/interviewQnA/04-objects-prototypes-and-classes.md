# 4. Objects, Prototypes & Classes

### Q1. What is the prototype chain? `Core`

> **Like I'm 5:** If you look for a toy in your box and it isn't there, you ask the box's parent. If the parent doesn't have it, you ask their parent, and so on.

**Answer:** Every object has a hidden link to a prototype. Property lookup walks up the chain until it finds the property or reaches `null`. Methods of built-in types like arrays live on prototypes such as `Array.prototype`.

---

### Q2. How are ES6 classes different from prototypes? `Core`

> **Like I'm 5:** A class is a fancy wrapper with a nicer label on the outside. Inside, it still uses the same old boxes.

**Answer:** Classes are syntactic sugar over prototype-based inheritance. Methods are defined on the prototype, and `extends` sets up the prototype chain. Classes are not hoisted the way functions are, and their code runs in strict mode.

---

### Q3. What are private fields, and how do they differ from `_name`? `Core`

> **Like I'm 5:** `_name` is a sign that says "please don't touch". `#name` is a locked drawer.

**Answer:** `#field` is enforced by the language, so code outside the class cannot access it. `_name` is only a convention. Both are fine, but `#` is the real guarantee.

---

### Q4. What is the difference between `Object.freeze`, `Object.seal`, and `Object.preventExtensions`? `Advanced`

> **Like I'm 5:** Freeze locks every box and stops changes to what is inside. Seal stops adding or removing boxes, but you can still change what's in each one. Prevent extensions stops only adding new boxes.

**Answer:** `freeze` stops adding, removing, and changing properties (shallow). `seal` stops adding and removing properties but allows changes. `preventExtensions` stops only adding properties.

---

### Q5. What is the difference between `map` and a plain object? `Core`

> **Like I'm 5:** A plain object has a few pre-printed labels, and some labels come with the box. A Map is a blank notebook where you write any label you like.

**Answer:** `Map` accepts any key type, keeps insertion order, has a `size` property, and has no inherited keys. Use `Map` for dynamic keys and frequent additions and removals. Use plain objects for simple records.

---

### Q6. What does `Object.hasOwn` do, and why use it over `in`? `Core`

> **Like I'm 5:** `in` asks "does this box or any parent have it?". `Object.hasOwn` asks only "is it in this box?".

**Answer:** `'toString' in {}` is true because it's inherited. `Object.hasOwn({}, 'toString')` is false, which is usually what you want.

---

### Q7. How does `super` work in a class constructor? `Core`

> **Like I'm 5:** Before you decorate your own room, you must first ask your parent to set up the house. That's `super`.

**Answer:** In a derived class constructor, you must call `super()` before using `this`. It runs the parent constructor and creates the instance.

---

### Q8. What are getters and setters? `Core`

> **Like I'm 5:** A getter is a window you look through to see a value. A setter is a door that checks what you're putting in.

**Answer:** Getters and setters let you run code when a property is read or written, while keeping the normal property syntax. They're useful for validation and computed values.

---

### Q9. Why avoid modifying built-in prototypes? `Advanced`

> **Like I'm 5:** If you move the furniture in a shared classroom, everyone trips over it, including classmates who never asked for the change.

**Answer:** Extending `Array.prototype` or `Object.prototype` can conflict with libraries, future language features, and other code. Use helper functions or wrappers instead.

---

### Q10. How do you clone and merge objects safely? `Core`

> **Like I'm 5:** Make a photocopy of the form, not the original, and be careful with pages that are stapled together.

**Answer:** Use spread for shallow copies and `structuredClone` for deep copies. For merges, be careful with untrusted input, because keys like `__proto__` can cause prototype pollution.
