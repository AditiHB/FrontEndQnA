# 6. Tooling & Best Practices

### Q1. What does `tsconfig.json` control? `Core`

> **Like I'm 5:** `tsconfig.json` is the rulebook for the teacher. It says how strict to be, which homework to check, and where to put the finished work.

**Answer:** It defines compiler options (target, module system, strictness), which files to include or exclude, output directories, path aliases, and project references. Projects often share a base config and extend it.

---

### Q2. What is `skipLibCheck`, and when should you use it? `Core`

> **Like I'm 5:** You don't need to check every page of a friend's textbook again. You trust it's correct and only check your own notes.

**Answer:** `skipLibCheck: true` skips type checking of `.d.ts` files, which speeds up builds. It can hide conflicts between library types, so I enable it by default and keep it on for most projects.

---

### Q3. What is the difference between `tsc` and a bundler like Vite, esbuild, or webpack? `Advanced`

> **Like I'm 5:** `tsc` is the teacher who checks the homework. A bundler is the packing robot that puts the finished homework into one box for shipping.

**Answer:** `tsc` checks types, and it can also emit JavaScript. Modern bundlers such as esbuild and Vite strip types fast, but they don't check them. So CI should run `tsc --noEmit` alongside the bundler.

---

### Q4. What is `isolatedModules`, and why does it matter? `Advanced`

> **Like I'm 5:** Each page of a book must make sense on its own, so the printing machine can handle each page separately.

**Answer:** `isolatedModules` requires each file to be transpilable on its own. Bundlers and esbuild need it, because they can't see types from other files. It flags re-exports of types that need `export type`.

---

### Q5. What are the ESLint rules you find most useful for TypeScript? `Core`

> **Like I'm 5:** The hall monitor catches the common mistakes before you're in trouble.

**Answer:** `no-explicit-any`, `no-floating-promises`, `no-unused-vars`, `no-non-null-assertion`, and `consistent-type-imports`. I add them through `typescript-eslint`.

---

### Q6. What is the value of `import type`? `Core`

> **Like I'm 5:** When you only need a picture of a toy for your notes, you don't have to bring the real toy home.

**Answer:** `import type` removes the import at build time. It avoids unnecessary runtime loading and prevents circular dependency problems.

---

### Q7. How would you migrate a large JavaScript codebase to TypeScript? `Architect`

> **Like I'm 5:** You move a messy room one shelf at a time, and keep playing while you do it.

**Answer:** Enable `allowJs` and `checkJs`, convert the most important modules first, add types at the API boundary, then turn on strict flags one at a time. Track progress by counting `.js` files and `any` uses, and block new `.js` files in CI.

---

### Q8. When would you use `any` in a real project? `Core`

> **Like I'm 5:** `any` is like a temporary cardboard box. It's fine for a short time while you build the real one, but you shouldn't keep using it forever.

**Answer:** Rarely: during a migration, or for a value that truly can't be typed, and then with a comment and a plan to fix it. I prefer `unknown` with a check, and I use lint rules to track `any` use.

---

### Q9. How do you keep types and runtime validation in sync? `Architect`

> **Like I'm 5:** A recipe card and the real cake should match. If you write the card from the cake, they stay the same.

**Answer:** Define the schema once (for example with Zod), and infer the TypeScript type from it. Then the runtime check and the compile-time type can't drift apart.

---

### Q10. What TypeScript features should a senior developer be comfortable with? `Architect`

> **Like I'm 5:** A senior developer knows the whole toolbox and when to use each tool, not just the hammer.

**Answer:** Generics with constraints, conditional and mapped types, discriminated unions, `satisfies`, `as const`, type guards and assertion functions, declaration files, project references, and a clear strategy for strictness and migration. Most importantly, knowing when a simple type is better than a clever one.
