# Lesson 7: The Box Model

> **Like I'm 5:** Every element on a web page is a **gift box**. Inside is the **toy** (the content). Around the toy is **bubble wrap** (padding). Then there is the **cardboard box** (border). And around the box is the **empty space on the shelf** (margin) so that it does not touch other boxes.

| | |
|---|---|
| **You will learn** | Content, padding, border and margin; `box-sizing`; shorthand values; centering with `margin: auto`; `width`, `max-width` and `height`; block, inline and inline-block; `display: none`; margin collapsing; `overflow` |
| **You will build** | A centered page container, padded and bordered cards, real-looking buttons, tidy tables and a neat form |
| **Time** | About 90 minutes |

## The story

Bunny's page now has colours, but everything is squeezed against the left edge of the window and stuck to everything else. She needs **space**: space inside things, space around things, and a page that sits in the middle of a wide screen instead of stretching edge to edge.

## 1. Everything is a box

Open your page, press **F12**, click the inspect arrow and click any card. In the **Computed** tab (or the **Layout** tab in Firefox) you see a diagram like this one:

```text
┌────────────────────────── margin ──────────────────────────┐
│   (empty space OUTSIDE the box; always transparent)         │
│   ┌──────────────────────── border ──────────────────────┐ │
│   │   (the box's edge: can have a colour and thickness)   │ │
│   │   ┌────────────────────── padding ─────────────────┐ │ │
│   │   │   (space INSIDE the box; shows the background)  │ │ │
│   │   │   ┌──────────────── content ───────────────┐   │ │ │
│   │   │   │   the text, picture or children         │   │ │ │
│   │   │   │              width × height             │   │ │ │
│   │   │   └─────────────────────────────────────────┘   │ │ │
│   │   └─────────────────────────────────────────────────┘ │ │
│   └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Property | Does it show the background colour? |
|-------|----------|-------------------------------------|
| **Content** | `width`, `height` | yes |
| **Padding** | `padding` | yes (the background extends under it) |
| **Border** | `border` | it *is* the border colour |
| **Margin** | `margin` | **no**: margins are always transparent |

If you remember one picture of CSS, make it this one. Almost every "why is there a gap here?" question is answered by the box model.

## 2. Writing sizes

### Shorthand: one property, four sides

`padding`, `margin` (and `border-width`) take one to four values. Think of a clock, starting at **the top**:

```css
padding: 1rem;                   /* all four sides */
padding: 1rem 2rem;              /* top and bottom | left and right */
padding: 1rem 2rem 3rem;         /* top | left and right | bottom */
padding: 1rem 2rem 3rem 4rem;    /* top | right | bottom | left  (clockwise!) */
```

Or one side at a time: `padding-top`, `padding-right`, `padding-bottom`, `padding-left` (and the same for `margin-`). For a border: `border: 2px solid #b3365f;` is *width, style, colour*. Styles are `solid`, `dashed`, `dotted`, `double`, `none`.

### Units (a first taste)

You will meet `rem`, `em`, `%` and more in Lesson 8. For now: **`1rem` is the normal text size of the page (usually 16px)**, so `padding: 1rem` is "one line of bubble wrap". `px` is a pixel, `%` a part of the parent's width.

## 3. The most important line of CSS in this lesson: `box-sizing`

By default, `width` means the width of the **content only**. Padding and border are *added on top*:

```text
  width: 300px; padding: 20px; border: 5px
  Total width on the page = 300 + 20+20 + 5+5 = 350px   ◄── surprise! Wider than you asked for.
```

This is a classic trap: `width: 100%` plus `padding` makes a box **wider than its parent** and the page grows a horizontal scroll bar. The fix is to say that `width` should include padding and border:

```text
  box-sizing: border-box;
  width: 300px; padding: 20px; border: 5px
  Total width on the page = 300px                  ◄── what you'd expect
```

Almost every website sets this for every element. Open `styles.css` and add it at the **top**, together with `body { margin: 0 }`. (Browsers give `<body>` a default margin of 8px, which we don't want.)

📄 **`styles.css`** (edit these lines)

```diff
 /* Bunny Bakery: styles */
 
+/* Padding and border count inside an element's width and height */
+*,
+*::before,
+*::after {
+  box-sizing: border-box;
+}
+
 body {
+  margin: 0;
   color: #4a2c17;
```

(`*, *::before, *::after` means "every element and every generated `::before`/`::after` box".)

Save and refresh: the page now touches the very edge of the window. Good: from here on we add our own space.

## 4. A page that sits in the middle: `max-width` and `margin: auto`

On a huge monitor, lines of text 2000 pixels wide are impossible to read. The classic fix: a **container** with a maximum width, centered.

Two rules do it:

- **`max-width: 68rem;`** means "as wide as you want, but never wider than 68rem" (about 1090px). On a phone it just shrinks.
- **`margin: 0 auto;`** means "no vertical margin, and *automatically split the leftover horizontal space* between left and right". That centers a block box.

We need a `container` for the content of the header, the main part and the footer. In the HTML, make three edits:

📄 **`index.html`** (edit these lines)

```diff
-    <header>
-      <a class="brand" href="#top"><img src="images/logo.svg" alt="" width="40" height="40"> Bunny Bakery</a>
-      <nav aria-label="Main">
-        <ul>
-          <li><a href="#menu">Menu</a></li>
-          <li><a href="#story">Our story</a></li>
-          <li><a href="#visit">Visit</a></li>
-          <li><a href="#order">Order</a></li>
-        </ul>
-      </nav>
-    </header>
+    <header class="site-header">
+      <div class="container header-inner">
+        <a class="brand" href="#top"><img src="images/logo.svg" alt="" width="40" height="40"> Bunny Bakery</a>
+        <nav aria-label="Main">
+          <ul>
+            <li><a href="#menu">Menu</a></li>
+            <li><a href="#story">Our story</a></li>
+            <li><a href="#visit">Visit</a></li>
+            <li><a href="#order">Order</a></li>
+          </ul>
+        </nav>
+      </div>
+    </header>
 
-    <main id="main">
+    <main id="main" class="container">
@@
-    <footer>
-      <p>&copy; 2026 Bunny Bakery. Made with &hearts; and a lot of butter.</p>
-      <p><a href="#top">Back to the top</a></p>
-    </footer>
+    <footer class="site-footer">
+      <div class="container">
+        <p>&copy; 2026 Bunny Bakery. Made with &hearts; and a lot of butter.</p>
+        <p><a href="#top">Back to the top</a></p>
+      </div>
+    </footer>
```

The header and footer **bars** stretch across the whole window (for their background colours), while their **content** sits in a centered container. Now the CSS. Add this at the bottom of `styles.css`:

📄 **`styles.css`** (add to the bottom)

```css
/* Layout containers */
.container {
  max-width: 68rem;
  margin: 0 auto;
  padding: 0 1rem;
}

.site-header {
  padding: 0.75rem 0;
  background-color: #fff;
  border-bottom: 1px solid #e8d5c4;
}

.site-footer {
  padding: 1.5rem 0;
}

main > section {
  padding: 2rem 0;
}
```

Save and refresh. Make the window wide: the content stays in the middle with space on both sides. Make it narrow: it shrinks with 1rem gutters. `main > section` ("a `<section>` that is a **direct child** of `<main>`", from Lesson 6) gives each part of the page 2rem of breathing room above and below.

Inspect the `<main>` element in DevTools: hover to see the orange margin on the left and right. That is the auto margin at work.

## 5. Space between things

Headings and paragraphs get default **margins** from the browser (look at an `<h2>` in DevTools: it has a top and bottom margin that you never wrote). Let's decide the spacing ourselves.

📄 **`styles.css`** (edit these lines)

```diff
 h1,
 h2,
 h3 {
   font-family: Georgia, serif;
   color: #b3365f;
   line-height: 1.2;
+  margin: 0 0 0.5rem;
 }
@@
 /* Pictures: never wider than the space they are in */
 img {
+  display: block;
   max-width: 100%;
   height: auto;
 }
```

Now the other things that need space. Pictures were *inline* (see below), which leaves a small gap under them; `display: block` removes it. Add the next block at the bottom:

📄 **`styles.css`** (add to the bottom)

```css
/* Text blocks */
p {
  margin: 0 0 1rem;
}

figure {
  margin: 0 0 1rem;
}

address {
  font-style: normal;
}

.tip :last-child {
  margin-bottom: 0;
}
```

Then the tip box needs space inside, and the buttons, which currently look like plain links, need to be boxes. The trick for the buttons is `display: inline-block` (explained in section 7) and `padding`:

📄 **`styles.css`** (edit these lines)

```diff
 .tip {
+  padding: 1rem;
+  margin: 1.5rem 0;
   background-color: #fff0d6;
   border-left: 6px solid #ffd166;
 }
@@
 .button {
+  display: inline-block;
+  padding: 0.75rem 1.25rem;
+  margin: 0 0.5rem 0.5rem 0;
+  border: 2px solid #b3365f;
   background-color: #b3365f;
   color: #fff;
   font-weight: 700;
   text-decoration: none;
 }
 
 .button:hover {
   background-color: #8f2a4c;
+  border-color: #8f2a4c;
 }
@@
 .button-outline:hover {
   background-color: #b3365f;
+  border-color: #b3365f;
   color: #fff;
 }
```

Save and refresh. The hero links are now button-shaped boxes, with a gap *between* them (the right margin) and *under* them (the bottom margin).

## 6. Cards, tables and forms

📄 **`styles.css`** (add to the bottom)

```css
/* Menu cards (stacked for now: Lesson 11 puts them in a grid) */
.cards {
  list-style: none;
  margin: 0 0 1.5rem;
  padding: 0;
}

.cards li {
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #fff;
  border: 1px solid #e8d5c4;
}

.cards h3,
.cards p {
  margin: 0 0 0.25rem;
}

/* Navigation: plain list for now, a row in Lesson 10 */
nav ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Tables */
table {
  width: 100%;
  margin-bottom: 1.5rem;
  border-collapse: collapse;
}

caption {
  padding: 0.5rem 0;
  font-weight: 700;
  text-align: left;
}

th,
td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #e8d5c4;
}

/* Forms */
button,
input,
select,
textarea {
  font: inherit;
}

fieldset {
  margin: 0 0 1.5rem;
  padding: 1rem;
  border: 1px solid #e8d5c4;
}

legend {
  padding: 0 0.5rem;
  font-weight: 700;
}

fieldset > div {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
}

/* A label that comes right after a radio button or checkbox sits beside it */
input[type="radio"] + label,
input[type="checkbox"] + label {
  display: inline;
  font-weight: 400;
}

input:not([type="radio"], [type="checkbox"]),
select,
textarea {
  width: 100%;
  max-width: 28rem;
  padding: 0.5rem;
  border: 1px solid #b89a84;
  background-color: #fff;
}

textarea {
  resize: vertical;
}
```

Save, refresh and scroll to the "Order a box" section. The form now has spaced fields, input boxes that are as wide as the form (up to a limit), and labels above them. The radio buttons and checkboxes have their labels *beside* them.

Notice `input:not([type="radio"], [type="checkbox"])`: "any input that is not a radio button or checkbox". Without it, `width: 100%` would stretch the round radio buttons too.

## 7. `display`: how a box behaves in the flow

Every element has a **display** type that decides how it sits among its neighbours:

| Value | Behaves like | Examples |
|-------|--------------|----------|
| `block` | Takes the **whole row**. Starts on a new line. `width`, `height`, margin and padding all work | `div`, `p`, `h1`, `ul`, `section`, `form` |
| `inline` | Flows **inside a line of text**. Ignores `width`/`height`; vertical padding and margin don't push other lines away | `a`, `span`, `strong`, `em` |
| `inline-block` | Flows inside a line **but** has a block's sizes and spacing | Buttons, badges |
| `none` | Removed completely: no box, no space. (Hidden from screen readers too) | Things that should not appear |
| `flex`, `grid` | A box that lays out its **children** in a smart way | Lessons 10 and 11 |

```text
 block:           inline:                  inline-block:
 ┌───────────┐    some text [link] more     some text ┌──────┐ more
 │  a block  │    text keeps flowing            ┌────►│ a    │
 └───────────┘    around it                          │ box  │
 ┌───────────┐                                       └──────┘
 │ next one  │
 └───────────┘
```

That's why the buttons needed `inline-block`: `<a>` is inline, and an inline element ignores `padding` above and below the line (the padding is drawn, but it overlaps the lines around it).

## 8. Heights, overflow, margin collapsing

- **Don't set a fixed `height`** on things that contain text. A box should be as tall as its content. If the text grows (bigger font, a longer language), a fixed height lets the text spill out. Use `min-height` instead.
- **`overflow`** says what happens when content is bigger than its box: `visible` (spills out, the default), `hidden` (clipped), `auto` (scrollbar only when needed), `scroll`. We use `overflow: auto` in Lesson 14 for wide tables.
- **Margin collapsing:** when the *vertical* margins of two blocks touch, they do **not** add up: the bigger one wins. A paragraph with `margin-bottom: 1rem` followed by one with `margin-top: 2rem` has **2rem** between them, not 3. Horizontal margins never collapse, and neither do margins inside flex or grid containers (Lessons 10 and 11).

## 9. What just happened?

You wrote the CSS for the *shape* of every part of the page. The recipe, again, so you can use it anywhere:

1. `box-sizing: border-box` for everything.
2. A **container** (`max-width` + `margin: 0 auto` + side padding) holds the content.
3. **Padding** is the space *inside* a box; **margin** is the space *between* boxes. Use padding when the background should extend, margin to separate.
4. `display` decides how a box sits in the flow. Links used as buttons need `inline-block`.

## 🧪 Try it yourself

1. Select a card with DevTools' inspect arrow and look at the box diagram in the **Computed** tab. Hover each coloured layer: blue is the content, green the padding, yellow the border, orange the margin.
2. Change `.cards li { padding: 1rem }` to `padding: 1rem 3rem;` and then to `padding: 0 0 0 2rem;`. Which sides moved?
3. Temporarily comment out `box-sizing: border-box` (put `/* */` around it). Look at the form inputs and the table. Which things become wider than the page? Restore it.
4. Give `.container` a border (`border: 2px solid red;`) so you can see exactly where it is. Resize the window. Delete the border.
5. Remove `margin: 0 auto;` from `.container`. Where does the page go?
6. Change `.button` to `display: inline;` and look at the hero buttons. What does the vertical padding do now?
7. Add `.cards li:first-child { margin-top: 3rem; }`. Does the `ul`'s margin and the list item's margin add up or collapse? (Check the `.cards` margin: it is zero at the top, so you'll see the item's margin push down. Now give `.cards` `margin-top: 2rem`: the larger margin wins.)
8. Add `display: none;` to `.tip`. Where did it go? Is the gap gone too? Remove it.
9. Put `overflow: hidden; height: 3rem;` on a card and see the text cut off. This is why we don't fix heights. Remove them.
10. Write `border-radius: 0.5rem;` on a card. (A preview of Lesson 9.)

## ✅ Check yourself

<details>
<summary>1. From the inside out, what are the four layers of the box model?</summary>

Content, padding, border, margin.
</details>

<details>
<summary>2. A box has <code>width: 200px; padding: 20px; border: 5px solid</code>. How wide is it with <code>box-sizing: content-box</code> (the default) and with <code>border-box</code>?</summary>

`content-box`: 200 + 2×20 + 2×5 = 250px. `border-box`: exactly 200px (the content shrinks to 150px to make room).
</details>

<details>
<summary>3. How do you center a block-level box horizontally?</summary>

Give it a width (or <code>max-width</code>) and set its left and right margins to <code>auto</code>: <code>margin: 0 auto;</code>.
</details>

<details>
<summary>4. What does <code>margin: 10px 20px 30px 40px</code> mean?</summary>

Top 10px, right 20px, bottom 30px, left 40px (clockwise from the top).
</details>

<details>
<summary>5. Why can't you give an inline <code>&lt;a&gt;</code> a width?</summary>

Inline elements flow inside a line of text and ignore `width` and `height`. Use `display: inline-block` or `block` (or make its parent a flex/grid container).
</details>

## Recap

- Every element is a box: content, padding, border, margin.
- `box-sizing: border-box` makes `width` include padding and border. Put it on everything.
- Padding is inside (shows the background), margin is outside (transparent, can collapse vertically).
- `max-width` + `margin: 0 auto` makes a centered container.
- `display` (`block`, `inline`, `inline-block`, `none`) decides how a box flows; `flex` and `grid` come next.
- Don't fix heights; let boxes grow with their content.

➡️ **Next:** [Lesson 8 – Colours, fonts, units and custom properties](08-colors-fonts-units-and-custom-properties.md)
