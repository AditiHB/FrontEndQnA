# Lesson 1: Your First Web Page

> **Like I'm 5:** HTML is like putting name tags on boxes. You write "this box is a **heading**", "this box is a **paragraph**", and the browser knows how to show each one.

| | |
|---|---|
| **You will learn** | Elements, tags and attributes, the five parts every page needs (`doctype`, `html`, `head`, `meta`, `body`), and how the browser reads your file |
| **You will build** | `index.html`: a tiny first version of the Bunny Bakery page |
| **Time** | About 30 minutes |

## The story

Bunny has a blank folder and a big dream. Let's put the very first stone in place: a page that says "Bunny Bakery".

## 1. The parts of HTML

HTML is made of **elements**. An element is a piece of content wrapped in **tags**:

```html
<p class="intro">Fresh bread every morning.</p>
```

```text
  <p class="intro">   Fresh bread every morning.   </p>
  └──────┬───────┘   └──────────────┬────────────┘  └┬┘
    opening tag               content            closing tag
  (name + attributes)

   The whole thing, from "<" of the first tag to ">" of the last, is ONE ELEMENT.
```

- The **tag name** (`p`) says what kind of box it is (here: a paragraph).
- An **attribute** (`class="intro"`) gives extra information. It looks like `name="value"` and lives in the opening tag.
- The **closing tag** has a slash: `</p>`.
- Some elements have **no content** and no closing tag. They are called *void* elements: `<img>`, `<br>`, `<meta>`, `<input>`.
- Elements can be **nested** (put inside each other), like boxes in boxes:

```html
<p>Fresh <strong>bread</strong> daily.</p>
```

Always close the inner element before the outer one: `<p><strong>…</strong></p>`, never `<p><strong>…</p></strong>`.

## 2. Create the project

Make the folder for the whole course and go into it:

```bash
mkdir bunny-bakery
cd bunny-bakery
```

(Or create a folder called `bunny-bakery` with your file explorer, and open that folder in VS Code with **File → Open Folder**.)

## 3. The skeleton every page needs

Create a file called `index.html` inside the folder. `index.html` is the special name that web servers show first, like the front door of a house.

📄 **`index.html`** (new file)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bunny Bakery</title>
  </head>
  <body>
    <h1>Bunny Bakery</h1>
    <p>Fresh bread and sweet treats, baked every morning.</p>
  </body>
</html>
```

Save the file and open it in your browser (double-click it). You should see a big **Bunny Bakery** heading and a line of text. The browser tab says "Bunny Bakery". Your first web page! 🎉

## 4. What every line does

```text
<!doctype html>            "Hello browser: this is modern HTML." (Not a tag; a note to the browser.)
<html lang="en">           The root: everything lives inside. lang says the page is in English.
  <head>                   The "backstage" part: information ABOUT the page. Nothing here is shown on the page itself.
    <meta charset="utf-8">     Letters, accents and emoji from any language show correctly.
    <meta name="viewport" …>   Makes the page fit phone screens properly. REQUIRED for responsive design.
    <title>…</title>           The text in the browser tab, bookmarks and search results.
  </head>
  <body>                   The "on stage" part: everything people see.
    <h1>…</h1>                 The main heading (heading level 1).
    <p>…</p>                   A paragraph.
  </body>
</html>
```

Some of these deserve a closer look:

- **`<!doctype html>`** must be the very first line. Without it, browsers switch into an old "quirks mode" that behaves differently.
- **`lang="en"`** helps screen readers pick the right voice and helps browsers offer translation. Use the code for your page's language (`fr`, `hi`, `es`…).
- **`<meta name="viewport" …>`** looks like a small thing but it is the *secret ingredient* of responsive design. Without it, phones pretend to be a wide computer screen (about 980 pixels) and shrink your page into tiny text. With it, the page uses the real width of the phone. We come back to it in Lesson 13.
- **`<title>`** is one of the most important lines for people and search engines. Make it meaningful.

## 5. What just happened?

The browser reads your file from top to bottom and builds a **tree** called the **DOM** (Document Object Model). Each element is a branch:

```text
html
├── head
│   ├── meta
│   ├── meta
│   └── title  → "Bunny Bakery"
└── body
    ├── h1  → "Bunny Bakery"
    └── p   → "Fresh bread and sweet treats…"
```

You can see this tree in DevTools → **Elements**. Every lesson of this course is really about growing this tree and then styling its branches.

Good to know:

- **Whitespace is squashed.** Many spaces and line breaks in your file show as one space. Indentation is only for human eyes.
- **HTML forgives mistakes.** A forgotten closing tag will not crash the page; the browser guesses. That is kind, but guessing can surprise you. A **validator** points out mistakes: paste your page into [validator.w3.org](https://validator.w3.org/#validate_by_input) now and then.
- **Tag names are case-insensitive** (`<P>` works), but write them in lowercase. It's the convention.
- **Comments** are notes the browser ignores: `<!-- this is a note -->`.

## 🧪 Try it yourself

1. Change the `<title>` and refresh. Where does the new text appear?
2. Change `<h1>` to `<h2>` and back. What happens to the size? (We will not use headings to make text big. You will see why in Lesson 3.)
3. Add a second paragraph. Put **five spaces and three line breaks** in the middle of a sentence. What does the browser do with them?
4. Wrap the first paragraph's text in `<!-- and -->`. It disappears from the page but stays in your file. This is how you "hide" code while experimenting.
5. Delete the line `<!doctype html>` and look at DevTools → Elements. What does the page's root look like now? Then put it back.
6. Remove the closing `</p>` of one paragraph. Does the page still work? Open DevTools → Elements to see how the browser repaired it.

## ✅ Check yourself

<details>
<summary>1. What is the difference between a tag and an element?</summary>

A tag is the `<p>` or `</p>` marker. An element is the whole thing: opening tag, content and closing tag (for example `<p>Hello</p>`).
</details>

<details>
<summary>2. What is the difference between <code>&lt;head&gt;</code> and <code>&lt;body&gt;</code>?</summary>

`<head>` holds information about the page (title, character set, viewport, later the link to your CSS). `<body>` holds everything visitors see.
</details>

<details>
<summary>3. Why do we write <code>&lt;meta name="viewport" …&gt;</code>?</summary>

So phones use their real screen width instead of pretending to be a wide desktop screen. Responsive design depends on it.
</details>

<details>
<summary>4. Is <code>&lt;br&gt;</code> missing its closing tag?</summary>

No. `<br>` is a void element: it has no content, so it has no closing tag.
</details>

## Recap

- HTML is elements made of tags, attributes and content, nested like boxes in boxes.
- Every page needs `<!doctype html>`, `<html lang>`, a `<head>` (charset, viewport, title) and a `<body>`.
- The browser turns your file into a tree called the DOM. DevTools lets you see it.
- Use meaningful titles, lowercase tags and a validator.

➡️ **Next:** [Lesson 2 – Text, links, lists and images](02-text-links-lists-and-images.md)
