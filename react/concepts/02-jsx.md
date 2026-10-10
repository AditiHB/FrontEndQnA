# 2. JSX

> **Like I'm 5:** JSX is a sketch that looks like HTML but lives inside JavaScript. Before the browser sees it, a helper turns each sketch line into a plain instruction React can understand.

## Basics

```tsx
const name = 'Asha';
const element = <h1 className="title">Hello, {name}!</h1>;
```

Rules:
- Return **one** root element, or a fragment `<>...</>`.
- Use `className` instead of `class`.
- Use `htmlFor` instead of `for`.
- Close every tag, including `<img />` and `<input />`.
- Attribute names are camelCase: `tabIndex`, `onClick`.

## Expressions in JSX

```tsx
<p>{user.name.toUpperCase()}</p>
<p>{items.length > 0 ? 'Has items' : 'Empty'}</p>
<p>{isLoggedIn && <Welcome />}</p>
```

Only expressions go inside `{}`. Statements like `if` and `for` don't.

## Fragments

```tsx
<>
  <dt>Name</dt>
  <dd>Asha</dd>
</>
```

Use `<Fragment key={id}>` when a fragment needs a key in a list.

## Spreading props

```tsx
const props = { id: 'email', type: 'email' };
<input {...props} />
```

## Escaping and safety

React escapes values in JSX by default, which protects against XSS.

```tsx
<p>{userInput}</p>               // safe: rendered as text
<div dangerouslySetInnerHTML={{ __html: html }} />  // only with sanitized HTML
```

## Important points
- JSX compiles to function calls (`jsx()` from `react/jsx-runtime`). No need to import React for JSX in modern setups.
- Keep JSX readable: extract big blocks into components.
