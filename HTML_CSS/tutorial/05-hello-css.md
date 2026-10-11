# Lesson 5: Hello, CSS

> **Like I'm 5:** HTML is a drawing in black and white. **CSS is the crayon box.** You say "all the headings: pink!" and "the whole page: cream paper!", and the browser colours everything in at once.

| | |
|---|---|
| **You will learn** | What a CSS rule looks like, how to link a stylesheet, the three ways to add CSS, how to edit styles live in DevTools, and what to do when a style does not work |
| **You will build** | `styles.css`: the first colours, fonts and picture rules for Bunny Bakery |
| **Time** | About 45 minutes |

## The story

Bunny looks at her page. All the facts are there, but it looks like a school report from 1995. Time to open the crayon box.

## 1. A CSS rule, piece by piece

CSS is a list of **rules**. Each rule says: *"find these elements, and give them these looks"*.

```css
h1 {
  color: #b3365f;
  font-size: 2rem;
}
```

```text
  h1  {                     ◄── selector: WHICH elements?   (all <h1>)
    color: #b3365f;         ◄── declaration: ONE look
    │      └── value        ◄── the setting (here a colour)
    └── property            ◄── WHAT to change (the colour of the text)
    font-size: 2rem;        ◄── another declaration
  }                         ◄── the curly braces hold the declarations
  └──────────── declaration block ───────────┘
```

- A **declaration** is `property: value;`. It ends with a **semicolon**.
- Many declarations go in one `{ … }` block.
- A selector can name several things, separated by commas: `h1, h2, h3 { … }` means "all of these".
- A comment is `/* a note for humans */`.

## 2. Create `styles.css` and link it

Create a new file next to `index.html`. Its name is up to you; `styles.css` is the habit. Put the first rule in it.

📄 **`styles.css`** (new file)

```css
/* Bunny Bakery: styles */

body {
  color: #4a2c17;
  background-color: #fff8f0;
}
```

The page does not know about this file yet. Tell it, inside `<head>`, with a `<link>`:

📄 **`index.html`** (edit these lines)

```diff
     <link rel="icon" href="images/logo.svg" type="image/svg+xml">
+    <link rel="stylesheet" href="styles.css">
   </head>
```

Save both files and refresh the browser. The page is now chocolate-brown text on warm cream paper. **You styled the whole page with one rule!** Why? The `<body>` holds everything, and some properties, such as `color`, are passed down to the children. You will meet that *inheritance* properly in the next lesson.

(`rel="stylesheet"` says "this is a stylesheet", `href` says where it is. It is a *void* element, so there is no closing tag.)

## 3. More rules

Let's style the text, headings, links and pictures. First, give `body` a font. Add two lines to the rule you already have:

📄 **`styles.css`** (edit these lines)

```diff
 body {
   color: #4a2c17;
   background-color: #fff8f0;
+  font-family: system-ui, sans-serif;
+  line-height: 1.6;
 }
```

Then add more rules at the bottom:

📄 **`styles.css`** (add to the bottom)

```css
/* Headings */
h1,
h2,
h3 {
  font-family: Georgia, serif;
  color: #b3365f;
  line-height: 1.2;
}

/* Links */
a {
  color: #b3365f;
}

/* Pictures: never wider than the space they are in */
img {
  max-width: 100%;
  height: auto;
}
```

Save and refresh. Now:

- The text uses your computer's friendly default font (`system-ui`) with comfortable line spacing.
- The headings are pink-berry and in an old-fashioned serif font (Georgia).
- The pictures shrink to fit the window: **the horizontal scroll bar is gone**. That one small rule is in almost every website in the world.

### What did each new line mean?

| Declaration | Meaning |
|-------------|---------|
| `font-family: system-ui, sans-serif;` | Use the system's UI font. If it does not exist, use any sans-serif font. A list of fonts is called a **font stack** |
| `line-height: 1.6;` | Each line is 1.6 times as tall as the text: roomy and readable. A number without a unit means "times the font size" |
| `color` | The colour of the **text** |
| `background-color` | The colour of the **background** |
| `max-width: 100%;` | "Never be wider than the box you sit in" |
| `height: auto;` | "Keep the picture's proportions when the width changes". The `width` and `height` attributes you gave in HTML give the browser the shape *before* the picture loads, so nothing jumps |

Colours here are written as **hex codes**: `#b3365f` is red `b3`, green `36`, blue `5f`. Don't worry about the maths; Lesson 8 explains colour names, RGB, HSL and more.

## 4. Three ways to add CSS

| Way | Looks like | Use it |
|-----|-----------|--------|
| **External stylesheet** | `<link rel="stylesheet" href="styles.css">` | **Almost always.** One file styles every page; the browser keeps it in its cache |
| **Internal** | `<style> h1 { color: red; } </style>` in the `<head>` | One-page experiments and emails |
| **Inline** | `<h1 style="color: red;">` on the element | Very rare. It is hard to override and cannot style hover, focus or small screens |

You are using the first one. Keep CSS in the stylesheet and HTML in the page.

## 5. Where did my style go? Debugging

Open **DevTools** (F12), click the arrow icon and click a heading on the page. In the **Styles** pane you see every rule that touches that element:

```text
Elements                      Styles
─────────                    ──────────────────────────────────────────
 <h2 id="menu-title">         element.style {}
   Our menu                   h1, h2, h3 {              styles.css:12
 </h2>                          ☑ font-family: Georgia, serif;
                                ☑ color: ▪ #b3365f;
                                ☑ line-height: 1.2;
                              }
                              h2 {  ◄ user agent stylesheet (the browser's own default)
                                  font-size: 1.5em;
                                  ...
```

Things to do there:

- **Click a checkbox** (or the declaration) to turn a line off and see what it was doing.
- **Click a value and edit it.** On numbers, press **↑ / ↓** to change them. Click the tiny colour square for a colour picker.
- **Add a new declaration** by clicking inside the block and typing.
- **Click the file name on the right** (`styles.css:12`) to jump to the line in your CSS.
- In the **Computed** tab you see the final value of every property.

Edits in DevTools are temporary (reload and they're gone). When you like a change, copy it into `styles.css`.

### When a style does nothing

1. **Did you save, and refresh?** (Yes, really, it is the most common reason.)
2. **Is the stylesheet loaded?** In DevTools → **Network** (reload), look for `styles.css`. If it is red or 404, the `href` path is wrong.
3. **A typo?** CSS **ignores** what it does not understand and carries on. `colour: red;`, `color red;`, `color: #b3365;` are all ignored. In DevTools such a line shows with a **strike-through and a yellow warning icon**.
4. **A missing `;` or `}`?** One missing character can swallow the next rule. VS Code underlines such errors.
5. **Another rule is stronger.** DevTools shows the loser crossed out. That is the next lesson (the **cascade**).

## 6. What just happened?

```text
styles.css ──►  browser reads it  ──►  for every element, finds the rules that match
                                       ──►  works out its final looks
                                       ──►  paints the page
```

The browser does this on every load and again every time something changes (a window resize, a mouse hover…). That is why CSS can react instantly.

## 🧪 Try it yourself

1. Change the `background-color` of `body` to `lightblue`, and then to `#fff8f0` again. Colour names such as `red`, `tomato`, `rebeccapurple` all work.
2. Make the `h1` bigger: `font-size: 3rem;` (add it to the headings rule, or a new `h1 { … }` rule). What about `h1 { text-align: center; }`?
3. Add `text-decoration: none;` to the `a` rule. Do you miss the underline? (You will: links that don't look like links are a problem. Put it back.)
4. Delete `max-width: 100%;` from the `img` rule and shrink your window. What happens?
5. Spell a property wrong (`colr: red;`). What does DevTools show?
6. Use DevTools to change the page's text colour live. Then reload.
7. Make an *internal* style: add `<style> p { color: green; } </style>` inside `<head>`, *below* the `<link>`. Which one wins for paragraphs? (Hint: the rule that comes later. Details in Lesson 6.) Remove it again.
8. Write a **comment** around a whole rule (`/* … */`). It stops working, but is kept in the file.

## ✅ Check yourself

<details>
<summary>1. Name the parts of <code>p { color: red; }</code>.</summary>

`p` is the selector. `color: red;` is a declaration, made of the property `color` and the value `red`, ending with a semicolon. The `{ }` hold the declaration block.
</details>

<details>
<summary>2. Why is an external stylesheet usually the best way to add CSS?</summary>

One file can style every page of the site, you change a look in one place, the browser caches it, and it keeps content (HTML) and looks (CSS) separate.
</details>

<details>
<summary>3. What does the browser do with a CSS line it doesn't understand?</summary>

It ignores that line and carries on with the rest. This is useful (old browsers cope with new CSS) but makes typos silent. DevTools shows the ignored line with a warning.
</details>

<details>
<summary>4. Why do we set <code>img { max-width: 100%; height: auto; }</code>?</summary>

So that pictures never overflow the box they are in, and keep their proportions when they shrink.
</details>

<details>
<summary>5. You edited a colour in DevTools and it looks perfect. What must you do so it stays?</summary>

Copy the change into your `styles.css` file and save. DevTools edits only live in the open browser tab.
</details>

## Recap

- A rule is `selector { property: value; }`. Many declarations can share a block; many selectors can share a rule (commas).
- Link an external stylesheet with `<link rel="stylesheet" href="…">` in the `<head>`.
- Colours, fonts, spacing and so on are properties. Some (like `color` and `font-family`) are inherited from parent to child.
- `img { max-width: 100%; height: auto; }` keeps pictures inside their box.
- DevTools' Styles pane shows, explains and lets you change every rule. A typo is silently ignored.

➡️ **Next:** [Lesson 6 – Selectors, specificity and the cascade](06-selectors-specificity-and-the-cascade.md)
