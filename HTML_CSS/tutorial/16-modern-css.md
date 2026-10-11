# Lesson 16: Modern CSS

> **Like I'm 5:** Old CSS was like building with bricks one by one and measuring everything with a ruler. **Modern CSS** gives you power tools: boxes that can sit inside boxes (nesting), a parent that can look at its children (`:has`), a paint box that mixes colours for you (`color-mix`), and rules that work in any language, left-to-right or right-to-left (logical properties).

| | |
|---|---|
| **You will learn** | CSS **nesting**, the **`:has()`** "parent selector", `:user-invalid`, `color-mix()` and relative colours, **logical properties** (`inline` and `block`), `text-wrap`, `accent-color`, **cascade layers** (`@layer`), **subgrid**, and how to use new features safely (`@supports`) |
| **You will build** | A tidier stylesheet (nested rules), size options that light up when chosen, required-field stars, a golden edge on cards with a badge, and a page that works in right-to-left languages |
| **Time** | About 2 hours |

## The story

Bunny's page is finished, and it works on every screen. But her stylesheet is 700 lines long and repeats itself, and she wants some fancy touches: form fields that react, and a page that would also work for her cousin's family in Cairo, who read from right to left. CSS has learned many new tricks in recent years. All the ones in this lesson work in **all current browsers** (Chrome, Edge, Firefox, Safari).

## 1. Nesting: rules inside rules

You have written this many times:

```css
.button { ... }
.button:hover { ... }
.button:active { ... }
.button.button-outline { ... }
```

**Nesting** lets a rule live *inside* the rule it belongs to, and remembers the parent for you:

```css
.button {
  ...
  &:hover { ... }                 /* the same as .button:hover */
  &:active { ... }                /* .button:active */
  &.button-outline { ... }        /* .button.button-outline (both classes on one element) */

  .icon { ... }                   /* .button .icon (a descendant) */

  @media (min-width: 48rem) {     /* media queries can nest too */
    padding-inline: 2rem;
  }
}
```

| You write inside `.button` | Becomes |
|---|---|
| `&:hover` | `.button:hover` |
| `&.big` | `.button.big` (no space: the same element) |
| `.icon` or `& .icon` | `.button .icon` (a descendant) |
| `& + &` | `.button + .button` |
| `.parent &` | `.parent .button` (the parent in front) |
| `@media (…) { … }` | The same rule, but only when the media query matches |

The `&` stands for "the selector that is outside". Nesting is **real CSS**, evaluated by the browser, with no build step. The specificity works as if you had written it out in full.

**Good habits:** nest **one or two levels**, at most three. Deep nesting makes selectors long and hard to override (just like the long selectors you learned to avoid in Lesson 6).

### Nest the buttons and the cards

The four button rules and the card rules each belong together. Edit `styles.css`: first the buttons.

📄 **`styles.css`** (edit these lines)

```diff
   transition: background-color 0.2s, border-color 0.2s, color 0.2s, transform 0.1s;
-}
-
-.button:hover {
-  background-color: var(--accent-strong);
-  border-color: var(--accent-strong);
-}
-
-.button:active {
-  transform: translateY(2px);
-}
-
-.button-outline {
-  background-color: transparent;
-  color: var(--accent);
-}
-
-.button-outline:hover {
-  background-color: var(--accent);
-  border-color: var(--accent);
-  color: var(--on-accent);
-}
+
+  &:hover {
+    background-color: var(--accent-strong);
+    border-color: var(--accent-strong);
+  }
+
+  &:active {
+    transform: translateY(2px);
+  }
+
+  /* The variation: an element with both classes, .button.button-outline */
+  &.button-outline {
+    background-color: transparent;
+    color: var(--accent);
+
+    &:hover {
+      background-color: var(--accent);
+      border-color: var(--accent);
+      color: var(--on-accent);
+    }
+  }
+}
```

Now the card: its hover rule, its text rules and the price margin all move inside it:

📄 **`styles.css`** (edit these lines)

```diff
   box-shadow: var(--shadow-s);
   transition: transform 0.2s, box-shadow 0.2s;
-}
-
-/* Lifting on hover only makes sense for devices that can hover (not fingers) */
-@media (hover: hover) {
-  .card:hover {
-    transform: translateY(-4px);
-    box-shadow: var(--shadow-m);
-  }
-}
-
-.card h3,
-.card p {
-  margin: 0 0 0.25rem;
-}
+
+  /* Lifting on hover only makes sense for devices that can hover (not fingers) */
+  @media (hover: hover) {
+    &:hover {
+      transform: translateY(-4px);
+      box-shadow: var(--shadow-m);
+    }
+  }
+
+  h3,
+  p {
+    margin: 0 0 0.25rem;
+  }
+
+  /* In a flex column, an auto top margin pushes the price to the bottom of the card */
+  .price {
+    margin-top: auto;
+  }
+}
@@
 .price {
   color: var(--accent);
   font-size: 1.125rem;
   font-weight: 700;
 }
-
-/* In a flex column, an auto top margin pushes the price to the bottom of the card */
-.card .price {
-  margin-top: auto;
-}
```

Save and refresh: **nothing changes**. The stylesheet is shorter and each component is in one place.

## 2. `:has()`: a selector that looks at the children

For years, CSS could only look **down** the tree: "a `p` inside a `.card`". It could never ask *"a `.card` that contains a `.badge`"*. That is what **`:has()`** does: it selects an element **if** something matching its argument exists inside it (or next to it).

```css
.card:has(.badge) { }               /* a card that contains a badge */
label:has(+ input:required) { }     /* a label followed directly by a required input */
form:has(:invalid) { }              /* a form with at least one invalid field */
div:has(> input:checked) { }        /* a div whose direct child input is checked */
body:has(dialog[open]) { }          /* the page, while a dialog is open */
```

It's the "parent selector" people wished for for 20 years. Think of it as `:if-contains(…)`.

### Four uses in the bakery

**1. A golden edge on cards with a badge.** Inside the `.card` rule, add:

📄 **`styles.css`** (edit these lines)

```diff
   transition: transform 0.2s, box-shadow 0.2s;
+
+  /* A card that contains a badge (:has) gets a golden edge */
+  &:has(.badge) {
+    border-color: var(--highlight);
+  }
 
   /* Lifting on hover only makes sense for devices that can hover (not fingers) */
```

**2. Size options as tiles that light up when chosen.** The "Size" radio buttons are plain. Make each option (the `<div>` that holds a radio and its label) a tile, and style the tile of the **checked** radio. At the bottom of the Forms section add:

📄 **`styles.css`** (edit these lines)

```diff
 textarea {
   max-width: none;
   resize: vertical;
 }
+
+/* The size options are tiles. The tile that has a checked radio button lights up */
+fieldset fieldset > div {
+  padding: var(--space-s) var(--space-m);
+  border: 2px solid var(--border);
+  border-radius: var(--radius);
+
+  &:has(input:checked) {
+    border-color: var(--accent);
+    background-color: var(--highlight-soft);
+  }
+}
```

**3. A star after the labels of required fields.** A label followed directly by a required input gets a star. We also add a sentence that explains it. First the HTML:

📄 **`index.html`** (edit these lines)

```diff
         <form method="get">
+          <p>Fields marked with <strong>*</strong> are required.</p>
           <fieldset>
```

Then the CSS, in the Forms section:

📄 **`styles.css`** (edit these lines)

```diff
 input[type="radio"] + label,
 input[type="checkbox"] + label {
   display: inline;
   font-weight: 400;
 }
+
+/* A star after the label of a required field. The empty text after the slash is the
+   "alt text" for screen readers, so that they don't read the star out. */
+label:has(+ input:required)::after,
+label:has(+ select:required)::after {
+  content: " *" / "";
+  color: var(--accent);
+}
```

**4. Wrong answers, but only after the person has touched the field.** The pseudo-class **`:invalid`** is true from the very first moment (an empty required field is "invalid" before anyone has typed). **`:user-invalid`** only becomes true after the person has *interacted* with the field. We need a colour for errors, so first a new token, then the rule:

📄 **`styles.css`** (edit these lines)

```diff
   --border-strong: light-dark(#b89a84, #8a7360);
+  --error: light-dark(#b3261e, #ff8a80);
```

📄 **`styles.css`** (edit these lines)

```diff
 textarea {
   max-width: none;
   resize: vertical;
 }
+
+/* After the visitor has touched a field, show clearly when it is wrong */
+input:user-invalid,
+select:user-invalid,
+textarea:user-invalid {
+  border-color: var(--error);
+  outline: 2px solid var(--error);
+}
+
+/* The browser's own radio buttons and checkboxes in our colour */
+input[type="radio"],
+input[type="checkbox"] {
+  accent-color: var(--accent);
+}
```

(The last rule uses **`accent-color`**: one line that colours the browser's own checkboxes, radio buttons, sliders and progress bars.)

Save and refresh, and try it:

- The carrot cupcake and the sourdough cards have a **golden border**.
- The size options are tiles: click a different size and the highlight moves.
- **Your name**, **Email**, **How many boxes?** and **Pick-up day** have a pink star; **Phone** hasn't.
- Click into **Email**, type `bunny`, and press Tab. The field gets a red border (before you touched it, it had none).

## 3. `color-mix()` and relative colours

**`color-mix()`** mixes two colours in a colour space, and works with variables, so it follows the theme:

```css
border-color: color-mix(in oklab, var(--accent) 40%, var(--border));
/*                         │         └── 40% accent + 60% border colour
                           └── mix in the "oklab" colour space (the mix looks natural) */
```

Use it for hover colours, subtle borders, tinted backgrounds, anything "a bit more of this colour". **Relative colours** go further: take a colour and change one part of it:

```css
background: oklch(from var(--accent) l c h / 0.15);          /* the same colour at 15% opacity */
background: oklch(from var(--accent) calc(l + 0.1) c h);    /* the same colour, a bit lighter */
```

Give the cards a soft pink edge on hover (still inside the hover media query):

📄 **`styles.css`** (edit these lines)

```diff
     &:hover {
       transform: translateY(-4px);
       box-shadow: var(--shadow-m);
+      border-color: color-mix(in oklab, var(--accent) 40%, var(--border));
     }
```

## 4. Logical properties: for every language

`left`, `right`, `top` and `bottom` assume text runs left-to-right and top-to-bottom. In Arabic, Hebrew, Persian and Urdu it runs **right-to-left**, and in some Asian writing modes it runs vertically. **Logical properties** say *start* and *end*, *inline* and *block*, and follow the writing direction:

| Physical (old) | Logical (new) |
|----------------|---------------|
| `margin-left` / `margin-right` | `margin-inline-start` / `margin-inline-end` |
| `margin: 0 auto` | `margin-inline: auto` |
| `padding-top` and `padding-bottom` | `padding-block` |
| `width` / `height` | `inline-size` / `block-size` |
| `border-left` | `border-inline-start` |
| `left: 1rem` | `inset-inline-start: 1rem` |
| `text-align: left` | `text-align: start` |
| `border-top-left-radius` | `border-start-start-radius` |

```text
  English (ltr)                                   Arabic (rtl: dir="rtl")
  ┌─────────────────────────────┐                 ┌─────────────────────────────┐
  │ inline-start ──► inline-end │                 │ inline-end ◄── inline-start │
  │ ▌ tip box with a border at   │                 │   tip box with a border at ▐│
  │   the inline START           │                 │   the inline START          │
  └─────────────────────────────┘                 └─────────────────────────────┘
```

Change the places where the bakery used left and right. (The CSS is unchanged for English readers.)

📄 **`styles.css`** (edit these lines)

```diff
   max-width: var(--page-width);
-  margin: 0 auto;
-  padding: 0 var(--space-m);
+  margin-inline: auto;
+  padding-inline: var(--space-m);
 }
@@
 caption {
   padding: var(--space-s) 0;
   font-weight: 700;
-  text-align: left;
+  text-align: start;
 }
 
 th {
-  text-align: left;
+  text-align: start;
 }
@@
   background-color: var(--highlight-soft);
-  border-left: 6px solid var(--highlight);
-  border-radius: 0 var(--radius) var(--radius) 0;
+  border-inline-start: 6px solid var(--highlight);
+  border-start-end-radius: var(--radius);
+  border-end-end-radius: var(--radius);
 }
@@
   top: -0.6rem;
-  right: var(--space-m);
+  inset-inline-end: var(--space-m);
@@
   top: -4rem;
-  left: var(--space-m);
+  inset-inline-start: var(--space-m);
@@
   top: -6rem;
-  right: -6rem;
+  inset-inline-end: -6rem;
```

### Try it: switch the page to right-to-left

Open `index.html` and change `<html lang="en">` to `<html lang="en" dir="rtl">`. Reload. **The page mirrors itself**: the logo goes to the right, the navigation to the left, the hero picture changes sides, the "New" badge jumps to the other corner, the tip box has its yellow bar on the right. Everything we wrote with Flexbox, Grid and logical properties flipped on its own. (If something stayed on the wrong side, it was written with `left` or `right`.) Change it back afterwards.

(In a real right-to-left page you would also change `lang` to the right language code, such as `ar`, and translate the text.)

## 5. Smaller treats

**Better line breaks with `text-wrap`.** `text-wrap: balance` makes the lines of a heading about equally long (no lonely word on the last line). `text-wrap: pretty` avoids a single orphan word on the last line of a paragraph.

📄 **`styles.css`** (edit these lines)

```diff
   font-family: var(--font-heading);
   line-height: 1.2;
+  text-wrap: balance;
 }
@@
 p {
   max-width: 65ch;
   margin: 0 0 var(--space-m);
+  text-wrap: pretty;
 }
```

Look at the main heading: it now breaks into lines of similar length.

## 6. Cascade layers: you choose who wins

Remember the cascade (Lesson 6): importance, **layers**, specificity, order. You skipped "layers" back then. Now you meet them.

A **layer** is a named group of rules. **Later layers beat earlier layers, whatever the specificity** of the rules inside. You declare the order once:

```css
@layer reset, base, components, utilities;
```

and then put rules into the layers:

```css
@layer reset {
  * { margin: 0; }              /* specificity 0-0-0, but it cannot beat ... */
}
@layer components {
  .card { margin: 1rem; }       /* ... anything in a later layer */
}
```

```text
  weakest ───────────────────────────────────────────────────────────────►  strongest
  reset layer   <   base layer   <   components   <   utilities   <   rules in no layer
  (the order of the @layer statement, left to right)        (!important turns the order around)
```

Two rules to remember:

1. **Rules outside any layer beat all layers.** (That is on purpose: your quick, plain CSS wins against third-party layered CSS.)
2. Inside the same layer, specificity and order work as usual.

This is how big sites tame third-party CSS and how frameworks such as **Tailwind CSS v4** (Lessons 17 and 18) organise themselves. For the bakery we use the simplest and most useful layer: a **`reset`** layer for the "everything" rules that should be easy to override:

📄 **`styles.css`** (edit these lines)

```diff
 /* ========== Base ========== */
 
-/* Padding and border count inside an element's width and height */
-*,
-*::before,
-*::after {
-  box-sizing: border-box;
+/* Padding and border count inside an element's width and height.
+   This is in the weakest layer, so any other rule can override it. */
+@layer reset {
+  *,
+  *::before,
+  *::after {
+    box-sizing: border-box;
+  }
 }
```

And, at the very top of the file, declare the order of all the layers we may ever use:

📄 **`styles.css`** (edit these lines)

```diff
 /* Bunny Bakery: styles */
 
+/* The order of the layers: the later ones win */
+@layer reset, base, components, utilities;
+
 /* ========== Design tokens ========== */
```

Nothing changes on screen: the page works as before. You have only given the reset the lowest priority, as a safety net.

## 7. Subgrid: grandchildren that follow the grid

A grid item can be a grid too, but its columns and rows are **its own**. With **`subgrid`**, the item **borrows** its parent's tracks instead, so the *insides* of different items line up with each other.

```css
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;      /* the rows are created by the content */
}
.cards .card {
  display: grid;
  grid-row: span 3;                    /* each card covers 3 rows of the parent... */
  grid-template-rows: subgrid;         /* ...and uses the parent's 3 row tracks as its own */
}
/* now every card's title is in row 1, text in row 2, price in row 3: they line up across the cards */
```

The classic use: cards with titles of different lengths, where you want all the descriptions to start at the same height. We don't need it for the bakery (the price margin trick does enough), but you'll find a place for it: try it in the experiments below.

## 8. Using new features safely

New CSS arrives all the time. Three habits keep you safe:

1. **Check support.** Search for a property on **MDN** (developer.mozilla.org): each page shows a compatibility table and a **Baseline** badge ("widely available" means it works in all major browsers; "newly available" means it works in the latest ones). **caniuse.com** shows numbers.
2. **Progressive enhancement.** Write the basic version first, then add the nicer one for browsers that understand it. Browsers ignore what they don't know, so the later line simply wins in newer browsers:
   ```css
   .box { width: 90%; width: min(90%, 40rem); }   /* old browsers stay with the first line */
   ```
3. **`@supports`** asks "do you understand this?":
   ```css
   @supports (grid-template-rows: subgrid) {
     .card { grid-template-rows: subgrid; }
   }
   ```

### Features worth watching

These exist in current browsers (some are very new). Look them up when you need them: **`@scope`** (styles that stop at a boundary), **anchor positioning** (tooltips attached to a button, in CSS), **view transitions** (animated page and element changes), **scroll-driven animations**, **`@property`** (typed custom properties that you can animate), **`@starting-style`** and `transition-behavior` (animate things that appear and disappear), **`field-sizing: content`** (a textarea that grows with its text), **`interpolate-size`** (animate to `height: auto`), and the **`<dialog>`** element for modals.

## 9. What just happened?

```text
 Before                                     After
 ──────────────────────────────────         ──────────────────────────────────────────────
 .button { }  .button:hover { }             .button { &:hover { } &.button-outline { } }
 .card p { }  .card:hover { }               .card { p { } &:hover { } }

 JavaScript to light up a chosen radio      div:has(input:checked) { }  ← one CSS rule
 JavaScript to add stars to required        label:has(+ input:required)::after
 margin-left / right: 1rem                  margin-inline-start / end: 1rem   ← also works in Arabic
 @media (prefers-color-scheme) + hex        light-dark() + color-mix()
```

Each of these used to need JavaScript, a build tool, or a workaround. Now they are a line or two of plain CSS.

## 🧪 Try it yourself

1. Nest `.site-header` and `.header-inner` rules inside each other, or nest `nav a:hover`. Is it easier to read? Stop when it is not.
2. Use DevTools to look at the nested rules in the Styles pane. How does it show `&:hover`?
3. Write `.card:has(.price:empty) { display: none; }`. Test it by emptying one price in DevTools.
4. Use `form:has(:user-invalid) button[type="submit"] { opacity: 0.6; }` to dim the submit button while a field is wrong.
5. Make the whole page react to a dialog: `body:has(dialog[open]) { overflow: hidden; }`. (There is no dialog here: you'll use this when you build one.)
6. Mix 20% of `--accent` into `--surface` for the table row hover: `background-color: color-mix(in oklab, var(--accent) 12%, var(--surface));`.
7. Use relative colour for a pale accent: `.tip { background: oklch(from var(--highlight) l c h / 0.25); }`.
8. In the right-to-left version of the page (`dir="rtl"`), find what did not flip. Fix it with a logical property.
9. Try subgrid on the **Visit us** section. First make the heading "Opening hours" much longer in the HTML, so that it wraps onto several lines, and compare where the table and the address start: they don't line up. Now add `.visit > div { display: grid; grid-row: span 2; grid-template-rows: subgrid; }`. The two columns now share the same rows, so the table and the address start at the same height.
10. Switch the layers around: change the declaration to `@layer base, reset;`. Does anything change? (No: the only layered rule, the reset, now beats nothing.) Explain why the layered `box-sizing` rule still works.
11. Put `h1 { text-wrap: wrap; }` in DevTools to compare with `balance`.

## ✅ Check yourself

<details>
<summary>1. What does <code>&amp;</code> mean in a nested rule?</summary>

It stands for the selector of the outer rule. `&:hover` inside `.button` is `.button:hover`, and `&.big` is `.button.big`.
</details>

<details>
<summary>2. Which elements does <code>.card:has(.badge)</code> select?</summary>

Every `.card` element that contains (as a descendant) an element with class `badge`.
</details>

<details>
<summary>3. What is the difference between <code>:invalid</code> and <code>:user-invalid</code>?</summary>

`:invalid` is true as soon as a field doesn't satisfy its rules, even before anyone has touched it (an empty required field). `:user-invalid` only applies after the person has interacted with the field, which avoids showing errors too early.
</details>

<details>
<summary>4. Why use <code>margin-inline-start</code> instead of <code>margin-left</code>?</summary>

It follows the writing direction: it is the left margin in a left-to-right language and the right margin in a right-to-left language, so the layout works in both without extra CSS.
</details>

<details>
<summary>5. A rule in a layer and a rule outside any layer both set the same property. Which one wins?</summary>

The rule **outside any layer** wins, whatever the specificity (for normal declarations).
</details>

## Recap

- **Nesting** (`&:hover`, `&.variant`, descendants, nested `@media`) groups rules that belong together. Keep it shallow.
- **`:has()`** selects an element by what it contains. Use it for tiles that light up, required stars, cards with badges, and more.
- `:user-invalid` shows errors only after interaction; `accent-color` colours native controls.
- `color-mix()` and relative colours calculate colours from your tokens.
- **Logical properties** (`inline`, `block`, `start`, `end`) make layouts work in every writing direction.
- `text-wrap: balance` and `pretty` improve line breaks.
- **`@layer`** lets you choose who wins before specificity is counted; unlayered CSS beats all layers. **Subgrid** lines up the insides of grid items.
- Check support on MDN and caniuse, enhance progressively, and use `@supports`.

➡️ **Next:** [Lesson 17 – Tailwind CSS: setup and the utility-first idea](17-tailwind-setup-and-utility-first.md)
