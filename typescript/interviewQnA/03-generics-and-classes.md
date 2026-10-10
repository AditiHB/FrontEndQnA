# 3. Generics & Classes

### Q1. What are generics, and why are they useful? `Core`

> **Like I'm 5:** A generic is a box with a blank label. You fill in the label when you use the box, and the compiler remembers it.

**Answer:** Generics let a function, class, or type work with many types while keeping type safety. `first<T>(items: T[]): T | undefined` returns the same type as the input without using `any`.

---

### Q2. What is a generic constraint? `Core`

> **Like I'm 5:** A constraint is a rule on the blank label: "the label must be a box that has a `length`."

**Answer:** `T extends { length: number }` restricts `T` to types that have the required shape. The function can then safely use those members.

---

### Q3. What is the `keyof` constraint pattern? `Advanced`

> **Like I'm 5:** You can only pick a key that is really written on the box. Asking for a key that isn't there is a mistake the compiler catches.

**Answer:** `function get<T, K extends keyof T>(obj: T, key: K): T[K]` returns the correct property type and rejects unknown keys at compile time.

---

### Q4. How do you write a generic repository or service? `Architect`

> **Like I'm 5:** One shelf-maker can build shelves for books, shoes, or toys. You tell it what it will hold, and it builds the right shelf.

**Answer:** Define a generic class with a constraint on the entity (`T extends { id: string }`), and expose typed methods (`save`, `find`). Use the class for each entity type. This avoids repeating the same CRUD code for every model, but keep entity-specific logic in subclasses or separate services.

---

### Q5. What is the difference between `public`, `protected`, `private`, and `#private`? `Core`

> **Like I'm 5:** `public` is a toy on the table for everyone. `protected` is a toy only the family can use. `private` is a toy only you can use. `#private` is a toy in a locked drawer that even the compiler can't peek into at runtime.

**Answer:** `private` and `protected` are compile-time checks only. The JavaScript output still has the property. `#field` is enforced at runtime by JavaScript itself.

---

### Q6. What is parameter-property shorthand? `Core`

> **Like I'm 5:** Instead of writing the name on the box twice, you write it once in the constructor, and the box is ready.

**Answer:** `constructor(private readonly repo: UserRepo) {}` declares and assigns the property in one step. It keeps constructors short, but I use it only when the property is simple.

---

### Q7. When would you use `abstract` classes? `Advanced`

> **Like I'm 5:** An abstract class is a cookie-cutter sketch. You can't bake cookies from the sketch alone; you must make a real cutter from it.

**Answer:** An abstract class defines shared behavior and requires subclasses to implement certain methods with `abstract`. Use it for a template of behavior, such as a base report generator. For a pure contract, an interface is often simpler.

---

### Q8. What does `implements` do? `Core`

> **Like I'm 5:** A promise on paper: "I will have everything this card asks for."

**Answer:** `class X implements I` checks that `X` has all members of `I`. It doesn't inherit any code. Use it to document and enforce a contract.

---

### Q9. What does `override` do? `Advanced`

> **Like I'm 5:** `override` is a note that says "I am replacing this toy's instruction on purpose". If the original toy doesn't exist, the note is an error.

**Answer:** `override` marks a method that replaces a base class method. With `noImplicitOverride`, forgetting it is a compile error. This catches typos and renamed base methods.

---

### Q10. What is a generic default type parameter? `Core`

> **Like I'm 5:** If you don't write the label, the box uses its default label.

**Answer:** `interface Page<T = unknown>` provides a default type when none is given.

---

### Q11. How do you type a function that returns different types based on input? `Advanced`

> **Like I'm 5:** A vending machine gives a drink or a snack depending on the button you press. The compiler should know which one you'll get.

**Answer:** Use overloads, or a generic with a conditional type. For a key-to-value lookup, map the key to the return type with an object type, then index it with a generic key.

---

### Q12. What is the difference between `class` and `interface` for defining a type? `Core`

> **Like I'm 5:** A class is a cookie cutter that can also bake cookies. An interface is only a picture of the cookie.

**Answer:** A class creates runtime code and a type. An interface exists only at compile time. Use interfaces for data shapes and contracts, and classes when you need instances with behavior.
