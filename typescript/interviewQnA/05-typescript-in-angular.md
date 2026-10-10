# 5. TypeScript in Angular & Full Stack

### Q1. Why does Angular rely so heavily on TypeScript? `Core`

> **Like I'm 5:** Angular is a big LEGO castle. TypeScript is the instruction sheet that tells you which brick fits where, before you build.

**Answer:** Angular uses TypeScript for component classes, services, DI tokens, and strict template type checking. With `strictTemplates`, the compiler checks template bindings against component types, catching errors at build time instead of in the browser.

---

### Q2. How do `input()`, `output()`, and `model()` use types? `Core`

> **Like I'm 5:** A mailbox with a label tells you exactly what kind of letter goes in and out.

**Answer:** `input<string>()` gives the input the type `string | undefined`. `input.required<T>()` removes `undefined`. `output<T>()` types the emitted payload. The template checker enforces these types when parents bind values.

---

### Q3. What is `inject()` with generics, and how do you type tokens? `Advanced`

> **Like I'm 5:** A name tag on a box tells the librarian what book to fetch. The tag's type tells the librarian what kind of book it is.

**Answer:** `inject(TOKEN)` returns the type given to `InjectionToken<T>`. Typing the token precisely (`new InjectionToken<AppConfig>('APP_CONFIG')`) keeps the injected value safe.

---

### Q4. How do you type HTTP responses in Angular? `Core`

> **Like I'm 5:** When the mailman brings a letter, you write on the envelope what kind of letter you expect.

**Answer:** `this.http.get<User[]>(url)` types the response. This is a compile-time assertion, not validation, so validate untrusted data in critical flows.

---

### Q5. What is `strictTemplates`? `Advanced`

> **Like I'm 5:** A checker looks at your picture, not only your code, and says "this label doesn't match the toy you put in it."

**Answer:** `strictTemplates: true` in `angularCompilerOptions` type-checks template expressions, bindings, and event payloads against component types. I enable it in every Angular project.

---

### Q6. How do you share types between an Angular frontend and a Java backend? `Architect`

> **Like I'm 5:** The front room and back room of a shop should use the same menu, or customers get the wrong food.

**Answer:** Generate TypeScript interfaces from the backend's OpenAPI spec using a generator such as `openapi-typescript` or `openapi-generator`. Keep the spec as the contract, and regenerate on each backend change. Pair this with runtime validation for untrusted data.

---

### Q7. How do you handle `Date` values from JSON? `Core`

> **Like I'm 5:** JSON sends dates as words, not as real calendar objects. You must turn the words back into dates.

**Answer:** JSON has no `Date` type. Type the field as `string` (ISO 8601) and convert it with `new Date(value)` where needed. Be honest about this in your DTO types, so no one assumes a `Date` object arrives.

---

### Q8. How do you type a reactive form in Angular? `Core`

> **Like I'm 5:** A form is a box of boxes. Each small box has its own label, and the form remembers all of them.

**Answer:** Typed reactive forms infer control types from initial values, for example `new FormControl('', { nonNullable: true })` is `string`. Use `nonNullable` so `reset()` returns to the default value instead of `null`.

---

### Q9. What are some common TypeScript pitfalls in Angular code? `Advanced`

> **Like I'm 5:** These are the classic traps: using a crayon of the wrong color, forgetting to wait for paint to dry, and leaving a sign that says "trust me".

**Answer:**
- Using `any` for component state or HTTP results.
- Using `!` (non-null assertion) for `@ViewChild` results that may not exist yet.
- Forgetting `await` or subscription cleanup, detected by lint rules.
- Mutating objects in place, which breaks `OnPush` and signal updates.
