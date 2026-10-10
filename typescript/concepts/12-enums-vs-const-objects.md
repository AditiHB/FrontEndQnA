# 12. Enums vs Const Objects

> **Like I'm 5:** An enum is a sticker sheet with numbered stickers. A const object is a sticker sheet with written names. Both let you pick a sticker by name, but the written version is easier to understand when you look at it later.

## Numeric enum

```ts
enum Level { Low, Medium, High }    // Low = 0, Medium = 1, High = 2

const l: Level = Level.High;
console.log(Level[2]);              // 'High' (reverse mapping)
```

## String enum

```ts
enum Role {
  Admin = 'ADMIN',
  Viewer = 'VIEWER',
}

const r: Role = Role.Admin;         // 'ADMIN' at runtime
```

## Problems with enums

- Numeric enums accept any number: `const x: Level = 99;` compiles.
- They produce extra JavaScript code, and some tools handle them badly.
- Their behavior is not the same as normal JavaScript objects.

## Modern alternative: `as const` object plus a union type

```ts
export const Role = {
  Admin: 'ADMIN',
  Viewer: 'VIEWER',
} as const;

export type Role = (typeof Role)[keyof typeof Role];   // 'ADMIN' | 'VIEWER'

const current: Role = Role.Admin;     // OK
// const bad: Role = 'GUEST';         // Error
```

Benefits:
- Plain JavaScript object, no special runtime behavior.
- Only the listed values are allowed.
- Easy to loop over with `Object.values(Role)`.

## Ask yourself
- Need a fixed list of strings? Use a const object with a union type.
- Working in a codebase that already uses `enum`? Keep it consistent.
- The `erasableSyntaxOnly` compiler option in newer TypeScript versions disallows enums. Check your project settings.

## Important points
- Choose one style for the whole project and document it.
- Avoid numeric enums for values that come from an API. Use strings.
