# Lesson 2: JSX – HTML Inside JavaScript

> **Like I'm 5:** JSX is a sketch that looks like HTML but lives inside JavaScript. Before the browser sees it, a helper turns each line of the sketch into a plain instruction that React understands.

| | |
|---|---|
| **Concept reference** | [02 – JSX](../concepts/02-jsx.md) |
| **You will learn** | JSX rules, putting JavaScript values in `{}`, fragments, spreading props, why React text is safe from hackers |
| **We build** | The first real look of the shop: a header, an opening message, a search field and a footer |
| **Time** | About 30 minutes |

## The story

Yesterday the shop only said "Hello". Today we want a proper page: a banner, an "open / closed" message, a search box and a footer with the current year. Writing that in plain JavaScript would be painful. JSX lets us write it almost like HTML.

## 1. JSX looks like HTML, but it is not

In `src/App.tsx` we have been writing this:

```tsx
return <h1>Hello, Tiny Toy Shop!</h1>;
```

That `<h1>` is **not a string** and **not real HTML**. It is JSX. A tool in our build turns it into a plain function call. Roughly:

```tsx
// What you write:
<h1 className="title">Hello, {name}!</h1>

// What the build turns it into (simplified):
jsx('h1', { className: 'title', children: ['Hello, ', name, '!'] })
```

`jsx(...)` creates a small description object: "an `h1` with this class and these children". React reads those descriptions to draw the page. You never need to write `jsx()` yourself, and in a modern setup you don't even need `import React`.

## 2. The five JSX rules

JSX is a bit stricter than HTML. Here are the rules that trip up everybody at first:

| # | Rule | Wrong | Right |
|---|------|-------|-------|
| 1 | Return **one** root element (or a fragment) | `<h1/><p/>` | `<><h1/><p/></>` |
| 2 | `class` is `className` | `<div class="box">` | `<div className="box">` |
| 3 | `for` is `htmlFor` | `<label for="x">` | `<label htmlFor="x">` |
| 4 | **Close every tag** | `<img src="a.png">` | `<img src="a.png" />` |
| 5 | Attribute names are camelCase | `tabindex`, `onclick` | `tabIndex`, `onClick` |

Why `className` and `htmlFor`? Because `class` and `for` are already special words in JavaScript, and JSX lives inside JavaScript.

## 3. Curly braces: put JavaScript inside the sketch

Anything inside `{ }` is JavaScript that React runs, and the result is placed into the page.

```tsx
const name = 'Asha';

<p>Hello, {name}!</p>                       // Hello, Asha!
<p>2 + 2 = {2 + 2}</p>                      // 2 + 2 = 4
<p>{name.toUpperCase()}</p>                 // ASHA
<p>{isOpen ? 'We are open' : 'Closed'}</p>  // pick one of two things
<p>{isOpen && <b>Come in!</b>}</p>          // show it only when isOpen is true
```

> **Only expressions fit inside `{}`.** An *expression* is anything that produces a value (`2 + 2`, `name`, `a ? b : c`). A *statement* like `if (...) { }` or `for (...) { }` does not produce a value, so it can't go inside. For choices use `? :` or `&&`. For loops we use `.map()` (Lesson 4).

## 4. Build the page

Replace `src/App.tsx` with the code below. Read the comments; they point at each rule.

📄 **`src/App.tsx`** (replace everything)

```tsx
const shopName = 'Tiny Toy Shop';
const isOpen = true;
const hours = { opens: 9, closes: 17 };
// Worked out once, outside the component. Drawing a component should stay "pure" (Lesson 3).
const year = new Date().getFullYear();

// A bag of attributes we can pour onto an element in one go.
const searchProps = { id: 'search', type: 'search', placeholder: 'Find a toy…' };

// Text that LOOKS like HTML. React will show it as plain text, not run it.
const sneakyText = '<b>Hello!</b> I am just text, not bold.';

// HTML that WE wrote ourselves, so we know it is safe.
const ourOwnHtml = '<em>Free</em> gift wrapping on every toy';

export default function App() {
  // Rule 1: one root. A fragment <> </> groups things without adding a box.
  return (
    <>
      <header
        style={{ background: 'var(--color-brand)', color: 'white', padding: '1rem' }}
      >
        <h1 className="title">🧸 {shopName}</h1>
        <p>{isOpen ? 'We are open! Come in.' : 'Sorry, we are closed.'}</p>
      </header>

      <main className="container">
        <p>
          Open from {hours.opens}:00 to {hours.closes}:00.
        </p>

        <label htmlFor="search">Search for a toy </label>
        <input {...searchProps} />

        {isOpen && <p>🎉 Today only: every toy comes with a smile.</p>}

        <p>{sneakyText}</p>
        <p dangerouslySetInnerHTML={{ __html: ourOwnHtml }} />

        <img src="/favicon.svg" alt="" width="32" height="32" />
      </main>

      <footer className="container">
        © {year} {shopName}
      </footer>
    </>
  );
}
```

Look at the browser. You should see an orange header, the search box, a line that shows the tags as text (`<b>Hello!</b> ...`), and a line with *Free* in italics.

## 5. What just happened?

Let's walk through the interesting bits.

### Fragments `<> ... </>`

`App` wants to return a header, a main part and a footer. Rule 1 says only one root. Wrapping them in a `<div>` would add an extra box to the page for no reason. A **fragment** is an invisible wrapper. It groups elements without adding anything to the page.

If a fragment sits inside a list and needs a `key` (Lesson 4), write the long form `<Fragment key={id}>…</Fragment>` imported from `'react'`.

### Two pairs of braces: `style={{ ... }}`

`style={{ background: 'red' }}` looks like double braces, but they are two different things:

- The **outer** `{ }` says "here comes JavaScript".
- The **inner** `{ }` is a normal JavaScript **object**: `{ background: 'red' }`.

In style objects, CSS names become camelCase: `background-color` → `backgroundColor`. (Use `className` and CSS files for most styling. We do that from Lesson 3 on.)

### Spreading props: `{...searchProps}`

`searchProps` is a bag of attributes. `<input {...searchProps} />` pours them all onto the input. It is the same as writing `<input id="search" type="search" placeholder="Find a toy…" />`. Handy when you pass many attributes along.

### React keeps you safe from hackers (XSS)

Look at `sneakyText`. It contains `<b>…</b>`, but the page shows the tags as plain text. **React turns anything you put in `{}` into text and escapes it.** That protects you from **XSS** (cross-site scripting), where a bad person types `<script>…</script>` into a form hoping your site will run it.

The one door to open on purpose is `dangerouslySetInnerHTML`. The name is a warning:

```tsx
<div dangerouslySetInnerHTML={{ __html: html }} />
```

Rules for that door:

- Only use it with HTML **you wrote** or HTML that was **cleaned by a sanitizer** (for example the DOMPurify library).
- **Never** pass raw text a visitor typed.

### Keep JSX readable

If a block of JSX grows large, cut it into smaller pieces. That is exactly what components are for, and what we do in the next lesson.

## 🧪 Try it yourself

1. Change `isOpen` to `false`. Which parts of the page change? Why does the 🎉 line vanish?
2. Remove the `<>` and `</>` from `App`. Read the error message. (Then put them back.)
3. Change `className="title"` to `class="title"`. What does TypeScript tell you?
4. Try `{if (isOpen) { 'hi' }}` inside the `<main>`. What error do you get? Then rewrite it with `? :`.
5. Put your own text inside `sneakyText`, such as `<script>alert(1)</script>`. It appears as text and does nothing. That is React protecting you.

## ✅ Check yourself

<details>
<summary>1. Why do we write <code>className</code> and not <code>class</code>?</summary>

JSX lives inside JavaScript, and `class` is already a reserved word in JavaScript. So JSX uses `className` (and `htmlFor` instead of `for`).
</details>

<details>
<summary>2. What can go inside <code>{ }</code> in JSX: statements or expressions?</summary>

Only **expressions** (things that produce a value). Use `? :`, `&&`, or `.map()` instead of `if` and `for`.
</details>

<details>
<summary>3. What is a fragment, and when do you use it?</summary>

`<>…</>` groups several elements into one root without adding an extra element to the page.
</details>

<details>
<summary>4. Why is <code>{userText}</code> safe, but <code>dangerouslySetInnerHTML</code> is risky?</summary>

React escapes everything in `{}` and shows it as text. `dangerouslySetInnerHTML` inserts raw HTML, which could contain scripts, so it must only get HTML you trust or have sanitized.
</details>

## Recap

- JSX is HTML-like syntax that the build turns into `jsx()` calls.
- Rules: one root (or a fragment), `className`, `htmlFor`, close every tag, camelCase names.
- `{}` puts JavaScript expressions into JSX. Choices use `? :` and `&&`.
- `{...obj}` spreads many props at once.
- React escapes text by default, so avoid `dangerouslySetInnerHTML` unless the HTML is trusted.

➡️ **Next:** [Lesson 3 – Components and props: building with LEGO bricks](03-components-and-props.md)
