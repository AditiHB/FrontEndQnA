# 2. Types, Unions & Narrowing

### Q1. What is a union type, and how do you use it safely? `Core`

> **Like I'm 5:** A union is a box that can hold a cat or a dog. Before you play with the animal, check which one it is.

**Answer:** A union (`A | B`) allows a value to be one of several types. Before using type-specific members, narrow the value with `typeof`, `in`, `instanceof`, equality checks, or a discriminant property.

---

### Q2. What is a discriminated union? Give an example. `Core`

> **Like I'm 5:** Each animal wears a name tag that says what it is. You read the tag first, and then you know what it can do.

**Answer:** A discriminated union shares a literal property, like `kind` or `status`, across members. A `switch` on that property narrows the type automatically.

```ts
type Payment =
  | { method: 'card'; last4: string }
  | { method: 'upi'; vpa: string };

function describe(p: Payment) {
  switch (p.method) {
    case 'card': return `Card ending ${p.last4}`;
    case 'upi': return `UPI ${p.vpa}`;
  }
}
```

---

### Q3. How do you make sure every case in a union is handled? `Advanced`

> **Like I'm 5:** If your checklist has 5 boxes and you only tick 4, the teacher should tell you. The `never` trick is that teacher.

**Answer:** In the `default` branch, assign the value to a `never` variable. If a new member is added to the union and not handled, the assignment fails at compile time.

---

### Q4. What are type predicates (custom type guards)? `Advanced`

> **Like I'm 5:** A type guard is a helper who looks in the bag and says "yes, this is a user" so the rest of the class can trust it.

**Answer:** A function returning `value is T` tells the compiler that when it returns `true`, the value is of type `T`.

```ts
function isUser(x: unknown): x is User {
  return typeof x === 'object' && x !== null && 'id' in x;
}
```

---

### Q5. What is the difference between `as const` and a type annotation? `Core`

> **Like I'm 5:** A type annotation says "this box holds crayons". `as const` says "this box holds exactly these three crayons, and nothing can be swapped".

**Answer:** `as const` makes the value and its nested properties readonly and gives the narrowest literal types. A type annotation widens the type to a broader one. `as const` is often combined with `typeof` to derive a union from a list of values.

---

### Q6. What are literal types, and why are they useful? `Core`

> **Like I'm 5:** A literal type is a sign that says exactly which word is allowed, like "on" or "off", and nothing else.

**Answer:** Literal types restrict a value to a specific string, number, or boolean. They're useful for options, states, and configuration keys. Combined with unions, they prevent typos such as `'primry'` in button variants.

---

### Q7. Explain `keyof`, `typeof`, and indexed access types. `Advanced`

> **Like I'm 5:** `keyof` makes a list of all the labels on the boxes. `typeof` copies the shape of a toy you already have. Indexed access picks out one box and asks "what's inside?"

**Answer:**
- `keyof T` produces a union of property names of `T`.
- `typeof value` reads the type of a runtime value.
- `T[K]` is the type of property `K` in `T`.

```ts
const config = { host: 'localhost', port: 8080 };
type Config = typeof config;        // { host: string; port: number }
type Port = Config['port'];         // number
type Key = keyof Config;            // 'host' | 'port'
```

---

### Q8. What is an intersection type, and when would you use it? `Core`

> **Like I'm 5:** A superhero is someone who can fly AND swim. An intersection says "must have both".

**Answer:** `A & B` requires a value to satisfy both types. I use it to combine a base model with extra fields, such as `User & { role: Role }`. Conflicting property types reduce to `never`, which is a useful signal that the combination is invalid.

---

### Q9. What is a mapped type? Show an example. `Advanced`

> **Like I'm 5:** A mapped type is a photocopier that goes through every line of a form and makes a changed copy, like turning every answer into an optional answer.

**Answer:** A mapped type loops over keys with `[K in keyof T]`. It's the basis of `Partial`, `Readonly`, and `Record`.

```ts
type Nullable<T> = { [K in keyof T]: T[K] | null };
```

---

### Q10. What is a conditional type? What does `infer` do? `Advanced`

> **Like I'm 5:** A conditional type is a question machine: "If it's a list, tell me the type of things inside it; otherwise, say never."

**Answer:** `T extends U ? X : Y` chooses a type based on a condition. `infer` captures part of a type inside the condition.

```ts
type ElementType<T> = T extends (infer E)[] ? E : never;
```

Conditional types distribute over unions: each member is checked separately, and the results are combined. So `ElementType<string | number[]>` checks `string` (gives `never`) and `number[]` (gives `number`), and the final result is `number`.

---

### Q11. How do you narrow `unknown` safely? `Core`

> **Like I'm 5:** Before you play with an unknown toy, check its label, then its colour, then its size. Each check tells you a bit more.

**Answer:** Use `typeof`, `Array.isArray`, `instanceof`, `in`, or a custom type guard. Combine checks for objects: `typeof x === 'object' && x !== null && 'id' in x`.

---

### Q12. What is the difference between `Exclude` and `Omit`? `Core`

> **Like I'm 5:** `Exclude` removes a color from a list of colors. `Omit` removes a field from a form.

**Answer:** `Exclude<Union, X>` removes members from a union. `Omit<Object, Keys>` removes properties from an object type.
