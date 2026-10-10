# 1. TypeScript Fundamentals

### Q1. What is TypeScript, and how does it differ from JavaScript? `Core`

> **Like I'm 5:** JavaScript is a toy box with no labels. TypeScript is the same box with labels, so you know which toy goes where before you play.

**Answer:** TypeScript is a typed superset of JavaScript, developed by Microsoft. It adds static types and compile-time checks. The compiler removes all types and produces plain JavaScript. Types exist only during development and build; they are not present at runtime.

---

### Q2. What does `strict: true` do, and why is it important? `Core`

> **Like I'm 5:** Strict mode is a teacher who checks every corner of your homework, even the tiny ones.

**Answer:** It enables a group of checks, including `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictPropertyInitialization`, and `useUnknownInCatchVariables`. Together they catch many runtime errors at compile time, especially `null` and `undefined` problems. I enable it in every new project, and I add `noUncheckedIndexedAccess` for arrays.

---

### Q3. What is the difference between `any` and `unknown`? `Core`

> **Like I'm 5:** `any` is a box where you can do anything with what's inside, even things that will break. `unknown` is a sealed box: you must open it and check first.

**Answer:** `any` turns off type checking for that value. `unknown` accepts any value, but you must narrow it (with `typeof`, `instanceof`, or a type guard) before using it. Use `unknown` for untrusted input such as API responses or `catch` variables.

---

### Q4. What is the difference between `interface` and `type`? `Core`

> **Like I'm 5:** An interface is a shape card for an object. A type is a more flexible card, and it can also describe a choice like "red or blue".

**Answer:** Both describe object shapes. Interfaces support declaration merging and are a good default for public object contracts. Type aliases can express unions, intersections, tuples, and mapped types. Use `interface` for object shapes and `type` when you need unions or computed types.

---

### Q5. What is type inference? When should you write types explicitly? `Core`

> **Like I'm 5:** You don't always have to write the label on a box. If the toy is already in the box, the compiler can read the label for you.

**Answer:** TypeScript infers types for variables from their initial values, and infers return types from the function body. I annotate function parameters, exported function return types, and variables declared without a value. I let simple local variables be inferred.

---

### Q6. What is structural typing? `Advanced`

> **Like I'm 5:** If two toys have the same shape and colors, the compiler treats them as the same kind of toy, even if they came from different shops.

**Answer:** TypeScript compares types by their structure (their shape), not their names. An object is compatible with an interface if it has all the required properties. This makes code flexible, but it means two different concepts with the same shape can be mixed up. Branded types solve this when it matters.

---

### Q7. What is the difference between `null` and `undefined`? `Core`

> **Like I'm 5:** `undefined` means nobody put anything in the box yet. `null` means someone put in "nothing" on purpose.

**Answer:** `undefined` is the default value for an uninitialized variable or a missing property. `null` is an explicit "no value". With `strictNullChecks`, you must declare them in types, for example `string | null`, and handle them before use.

---

### Q8. What is `never`, and where is it useful? `Advanced`

> **Like I'm 5:** `never` is a box that can never be opened because nothing will ever be put inside it.

**Answer:** `never` describes values that never occur, such as the return type of a function that always throws, or an unreachable branch. It's most useful for exhaustiveness checks: if a new case is added to a union and not handled, assigning the leftover value to a `never` variable causes a compile error.

---

### Q9. How do `enum`s compare with `as const` objects? `Advanced`

> **Like I'm 5:** An enum is a sticker sheet with its own special rules. A const object is a plain sticker sheet that everyone understands.

**Answer:** Numeric enums accept any number and generate extra code. String enums are safer but still add runtime behavior. A `const` object with `as const` plus a union type gives the same safety with plain JavaScript output. I prefer the const object pattern in new code, and I keep existing enums consistent.

---

### Q10. What is the `readonly` modifier, and how is it different from `const`? `Core`

> **Like I'm 5:** `const` says "this label can't be moved to another box". `readonly` says "you can look inside the box, but you can't change what's in it".

**Answer:** `const` prevents reassigning a variable. `readonly` prevents changing a property after it's set. An array can be `const` but still have items pushed into it, unless it's typed as `readonly T[]`.

---

### Q11. How do you handle optional properties? `Core`

> **Like I'm 5:** Some toys have an optional extra sticker. The compiler makes sure you check that the sticker is there before you use it.

**Answer:** Mark them with `?` (`email?: string`). Read them with optional chaining (`user.email?.toLowerCase()`) and defaults (`?? 'none'`). With `exactOptionalPropertyTypes`, you cannot assign `undefined` to an optional property explicitly, which avoids a common source of bugs.

---

### Q12. What are type assertions, and when are they dangerous? `Core`

> **Like I'm 5:** `as` is you telling the teacher, "Trust me, this paper is a math test." If you're wrong, the teacher won't notice until the test is marked.

**Answer:** `value as Type` tells the compiler to treat a value as a type without checking. It's useful when you know more than the compiler, but it can hide real bugs. Prefer type guards or validation. `as` also cannot convert between unrelated types, which the compiler will flag.
