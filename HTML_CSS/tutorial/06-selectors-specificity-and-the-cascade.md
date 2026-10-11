# Lesson 6: Selectors, Specificity and the Cascade

> **Like I'm 5:** Imagine a class of children. "Everybody stand up!" (all elements), "All the girls!" (a type), "Only the ones wearing red hats!" (a class), "Only Sam!" (an id). **Selectors are how you point at the right children.** And when two grown-ups give *different* orders to the same child, the **cascade** decides whose order wins.

| | |
|---|---|
| **You will learn** | All the main selector types, combinators, pseudo-classes and pseudo-elements, inheritance, and the three cascade rules (importance, specificity, order) |
| **You will build** | The first look of the header, buttons, prices, the tip box and the footer, all picked out with selectors |
| **Time** | About 75 minutes |

## The story

Bunny wants the two links in the hero to look like buttons, the prices to stand out, the footer to be dark, and the first link in each menu card to look different. She needs to point at *exactly* the right things. She also keeps seeing a style that "doesn't work", which is usually the cascade at work.

## 1. Selectors

A selector decides **which elements** a rule applies to. You already know one: the **type selector** (`p`, `h1`, `body`). Here is the whole family:

| Selector | Name | Picks | Example |
|----------|------|-------|---------|
| `p` | Type | every `<p>` | `h2 { … }` |
| `.card` | Class | every element with `class="card"` | `.price { … }` |
| `#menu` | ID | the one element with `id="menu"` | `#menu { … }` |
| `*` | Universal | everything | `* { … }` |
| `a, button` | Group | all of them | `h1, h2, h3 { … }` |
| `[target]` | Attribute | has the attribute | `[disabled] { … }` |
| `[target="_blank"]` | Attribute value | has that exact value | `a[target="_blank"] { … }` |
| `[href^="mailto:"]` | Starts with | value starts with… | `a[href^="https"] { … }` |
| `[href$=".pdf"]` | Ends with | value ends with… | `a[href$=".pdf"] { … }` |

**Classes** are your main tool. In HTML, `class="card featured"` gives an element two classes (separated by a space); in CSS you write a dot: `.card`, `.featured`. Classes can be reused on as many elements as you like. **IDs** must be unique on the page, and they are more "forceful" in the cascade (more below), so use them for links and labels, *not* for styling.

### Combinators: selectors that look at the family tree

| Selector | Name | Picks |
|----------|------|-------|
| `nav a` | **Descendant** (a space) | every `<a>` anywhere inside a `<nav>` |
| `ul > li` | **Child** (`>`) | `<li>`s that are *direct* children of a `<ul>` |
| `h2 + p` | **Next sibling** (`+`) | the `<p>` right after an `<h2>` |
| `h2 ~ p` | **Later siblings** (`~`) | all `<p>`s after an `<h2>` (same parent) |
| `a.button` | Both (no space) | an `<a>` that **also** has the class `button` |

Watch the spaces: `.card .price` (with a space) means "a `.price` *inside* a `.card`", while `.card.featured` (no space) means "one element that has *both* classes".

### Pseudo-classes: selecting by state or position (`:`)

| Selector | Picks |
|----------|-------|
| `a:hover` | a link under the mouse |
| `:focus-visible` | the element that has keyboard focus (what Tab stops on) |
| `:first-child`, `:last-child` | the first or last child of its parent |
| `:nth-child(2)`, `:nth-child(odd)`, `:nth-child(3n)` | by position |
| `:not(.card)` | everything except… |
| `input:checked`, `input:disabled`, `input:required` | form states |
| `:is(h1, h2, h3)` | any of these (a short way to write a group) |
| `:has(img)` | an element that **contains** an image (a "parent selector"; Lesson 16) |

### Pseudo-elements: parts of an element (`::`)

| Selector | Picks |
|----------|-------|
| `::before`, `::after` | A little generated box inside the element, before or after its content. You set its text with `content` |
| `::first-line`, `::first-letter` | The first line or letter of text |
| `::marker` | The bullet or number of a list item |
| `::placeholder` | The grey hint in a form input |

### Test a selector in the browser

In DevTools, open the **Console** and type `$$(".price")` (Enter). The console lists every element that this selector picks. The same trick works with any selector, such as `$$("nav a")`. Use it to test before you write CSS.

## 2. Give the elements class names

CSS can only pick what it can *find*. Most of the page is already findable (`header`, `nav`, `footer`, `table`…), but a few things need a name: the skip link, the logo link, the hero parts, the cards, the prices, the tip, the submit button.

**Naming classes:** use lowercase words joined by hyphens, and name a thing by **what it is**, not how it looks (`.price`, never `.red-bold-text`: tomorrow it may be blue).

Open `index.html` and make these edits. Take your time: this is the only lesson with so many HTML changes.

📄 **`index.html`** (edit these lines)

```diff
-    <a href="#main">Skip to the content</a>
+    <a class="skip-link" href="#main">Skip to the content</a>
@@
-      <a href="#top"><img src="images/logo.svg" alt="" width="40" height="40"> Bunny Bakery</a>
+      <a class="brand" href="#top"><img src="images/logo.svg" alt="" width="40" height="40"> Bunny Bakery</a>
```

Now the hero. We wrap the words in a `<div class="hero-text">` (we need a box around them for the layout lessons), and give the paragraph, the buttons and the picture classes:

📄 **`index.html`** (edit these lines)

```diff
-      <section aria-labelledby="hero-title">
-        <h1 id="hero-title">Fresh bread and sweet treats, baked every morning</h1>
-        <p>
-          Welcome to <strong>Bunny Bakery</strong>, a small neighbourhood bakery in Meadowtown.
-          Everything is made by hand, in small batches, with real butter.
-        </p>
-        <p>
-          <a href="#menu">See the menu</a>
-          <a href="#order">Order a box</a>
-        </p>
-        <img src="images/hero-800.webp" alt="The Bunny Bakery shop front: a striped awning, a window full of fresh bread and a bunny baker holding a tray of rolls" width="800" height="600">
-      </section>
+      <section class="hero" aria-labelledby="hero-title">
+        <div class="hero-text">
+          <h1 id="hero-title">Fresh bread and sweet treats, baked every morning</h1>
+          <p class="lead">
+            Welcome to <strong>Bunny Bakery</strong>, a small neighbourhood bakery in Meadowtown.
+            Everything is made by hand, in small batches, with real butter.
+          </p>
+          <div class="actions">
+            <a class="button" href="#menu">See the menu</a>
+            <a class="button button-outline" href="#order">Order a box</a>
+          </div>
+        </div>
+        <img class="hero-img" src="images/hero-800.webp" alt="The Bunny Bakery shop front: a striped awning, a window full of fresh bread and a bunny baker holding a tray of rolls" width="800" height="600">
+      </section>
```

Next, the menu: a class for the list, one for each price, and one for the tip box:

📄 **`index.html`** (edit these lines)

```diff
-        <ul>
+        <ul class="cards">
           <li>
             <h3>Sourdough loaf</h3>
@@
             <p>Slow-risen, with a crackly crust and a soft middle.</p>
-            <p>$6.00</p>
+            <p class="price">$6.00</p>
@@
             <p>Flaky layers, golden on the outside, tender inside.</p>
-            <p>$3.50</p>
+            <p class="price">$3.50</p>
@@
             <p>Spiced sponge, cream-cheese frosting and a tiny candied carrot.</p>
-            <p>$4.00</p>
+            <p class="price">$4.00</p>
@@
             <p>Chewy in the middle, crisp at the edge.</p>
-            <p>$2.50</p>
+            <p class="price">$2.50</p>
@@
             <p>Warm, sticky and swirled with brown sugar.</p>
-            <p>$4.00</p>
+            <p class="price">$4.00</p>
@@
             <p>Crisp pastry, vanilla cream and fresh strawberries.</p>
-            <p>$5.00</p>
+            <p class="price">$5.00</p>
@@
-        <aside>
+        <aside class="tip">
```

(In an editor, "find and replace" `<p>$` with `<p class="price">$` does all six prices at once.)

Finally, the submit button:

📄 **`index.html`** (edit these lines)

```diff
-          <button type="submit">Send my order</button>
+          <button class="button" type="submit">Send my order</button>
```

(Your page looks exactly the same: classes are just name tags until CSS uses them.)

## 3. Use the selectors

Add the header, link and button styles at the bottom of the stylesheet. Read the comments: each rule uses a different kind of selector.

📄 **`styles.css`** (add to the bottom)

```css
/* Header: a class and a descendant selector */
.brand {
  font-family: Georgia, serif;
  font-size: 1.25rem;
  font-weight: bold;
  color: #4a2c17;
  text-decoration: none;
}

nav a {
  color: #4a2c17;
  font-weight: 600;
  text-decoration: none;
}

/* A pseudo-class: only while the mouse is over the link */
nav a:hover {
  color: #b3365f;
  text-decoration: underline;
}

/* A pseudo-class for the keyboard: where is the focus? */
:focus-visible {
  outline: 3px solid #b3365f;
  outline-offset: 3px;
}

/* An attribute selector and a pseudo-element: a little arrow after links that open a new tab */
a[target="_blank"]::after {
  content: " ↗";
}

/* The lead paragraph and the highlighter */
.lead {
  font-size: 1.25rem;
}

mark {
  background-color: #ffd166;
  color: inherit;
}
```

Save and refresh. The logo link and the navigation lose their underlines, the nav links turn berry when you hover, the "Open the map" link gets an arrow, and the highlighted words keep their text colour.

Press **Tab** a few times: every link now gets a **berry-coloured ring**. That is the `:focus-visible` rule. (`:focus-visible` shows the ring for keyboard users and, in most browsers, not when you click with a mouse. Never remove focus rings without giving something at least as clear.)

### The buttons

📄 **`styles.css`** (add to the bottom)

```css
/* Buttons: two classes on one element */
.button {
  background-color: #b3365f;
  color: #fff;
  font-weight: 700;
  text-decoration: none;
}

.button:hover {
  background-color: #8f2a4c;
}

.button-outline {
  background-color: transparent;
  color: #b3365f;
}
```

Refresh. The two hero links are berry and white (they have no padding or rounded corners yet: that is the next lesson). The "Order a box" link should look different. Does it? Look at it: **`.button-outline` is supposed to be transparent with berry text**. Move the mouse over it. **The text vanishes!** Why? We will find out in a moment, with the cascade.

### Menu, tip, caption, tables and footer

📄 **`styles.css`** (add to the bottom)

```css
/* Menu */
.price {
  color: #b3365f;
  font-weight: 700;
}

.tip {
  background-color: #fff0d6;
  border-left: 6px solid #ffd166;
}

figcaption {
  color: #7a5a44;
  font-style: italic;
}

th {
  text-align: left;
}

/* Footer: a type selector, then a descendant selector */
footer {
  background-color: #4a2c17;
  color: #fff8f0;
}

footer a {
  color: #ffd166;
}
```

Refresh and scroll to the bottom. A dark footer with yellow links. Notice that the footer's link rule `footer a` **wins** over the earlier `a { color: #b3365f; }` rule. Why is that? Because of **specificity**, coming right up.

## 4. Inheritance: children copy their parents

Some properties are **inherited**: if you don't set them on an element, it uses its parent's value. This is why setting `color` and `font-family` on `body` styled the whole page in Lesson 5.

```text
  body  { color: brown; font-family: system-ui }
   └── main
        └── section
             └── p  ◄─ no rule of its own: it inherits brown and system-ui all the way down
```

| Usually inherited (text things) | Not inherited (box things) |
|----------------------------------|----------------------------|
| `color`, `font-family`, `font-size`, `font-weight`, `line-height`, `text-align`, `list-style`, `visibility` | `background`, `border`, `margin`, `padding`, `width`, `height`, `display`, `position` |

(That makes sense: if every `<p>` inherited a border from `<body>`, you would see boxes inside boxes.)

Four keywords work on any property:

| Keyword | Meaning |
|---------|---------|
| `inherit` | Use the parent's value, even for a property that does not inherit by default. You used it: `mark { color: inherit; }` |
| `initial` | Use the CSS default value |
| `unset` | `inherit` if the property is normally inherited, otherwise `initial` |
| `revert` | Go back to the browser's own stylesheet |

## 5. The cascade: who wins?

Many rules can reach the same element. When they disagree about the **same property**, the browser picks the winner with these rules, **in this order**:

```text
 1. IMPORTANCE   Is one of them marked !important? (and where does it come from: browser, user, you?)
        │ tie
        ▼
 2. LAYER        Is one in a stronger @layer?        (Lesson 16; skip for now)
        │ tie
        ▼
 3. SPECIFICITY  Whose selector is more specific?     ◄── the one that explains most surprises
        │ tie
        ▼
 4. ORDER        Whichever comes LATER in the CSS wins.
```

That is the cascade in "Cascading Style Sheets". Properties that no rule mentions are simply inherited or use their default.

### Specificity: a score for each selector

Count what a selector contains, in three columns, and compare **left to right**:

| Column | Counts | Examples |
|--------|--------|----------|
| **A** | IDs | `#menu` |
| **B** | classes, attributes, pseudo-classes | `.card`, `[target]`, `:hover` |
| **C** | element types, pseudo-elements | `p`, `::after` |

```text
 selector              A-B-C   explanation
 ───────────────────   ─────   ──────────────────────────────────────────────
 a                     0-0-1   one type
 footer a              0-0-2   two types       ──► beats  a      (so the footer links are yellow)
 .button               0-1-0   one class       ──► beats  footer a  (1 class > any number of types)
 .button:hover         0-2-0   class + pseudo-class
 a.button:hover        0-2-1
 a[target="_blank"]::after   0-1-2   attribute + type + pseudo-element
 #menu h2              1-0-1   one id          ──► beats every selector with no id
 style="…" (inline)    wins over all of the above
 *                     0-0-0   no weight at all
```

It's not a decimal number: **ten classes still lose to one ID** (column A is compared first). Only if columns tie do you compare the next one. If everything ties, the later rule wins.

### Solve the mystery of the vanishing text

Hover over "Order a box" and inspect it in DevTools. In the Styles pane you see:

```text
 .button:hover   (0-2-0)   background-color: #8f2a4c;     ◄── wins the background
 .button-outline (0-1-0)   background-color: transparent;   ◄── crossed out (loses)
                           color: #b3365f;                   ◄── still applies
```

On hover, the dark berry background (from `.button:hover`, more specific) sits behind berry-coloured text. **Berry on dark berry: invisible.** The fix: give the outline button its *own* hover rule that is just as specific, and put it **after** the others:

📄 **`styles.css`** (edit these lines)

```diff
 .button-outline {
   background-color: transparent;
   color: #b3365f;
 }
+
+.button-outline:hover {
+  background-color: #b3365f;
+  color: #fff;
+}
```

(`.button-outline:hover` has the same specificity, 0-2-0, as `.button:hover`, and comes later, so it wins.)

### `!important`: the red button

A declaration marked `!important` jumps over specificity: `color: red !important;`. It looks like an easy fix and it is a trap: the only way to beat an `!important` is another `!important`, and soon the stylesheet is a shouting match. **Avoid it.** Fix the cause instead: change the order, use a more specific selector, or remove the conflicting rule. (Legitimate uses are rare: for example, utility classes, which you'll meet in Lesson 17.)

### Good habits that keep the cascade friendly

1. **Style with classes** (one class per rule, specificity 0-1-0). Avoid IDs and long chains such as `main section ul li a`.
2. **Don't use `!important`.**
3. **Order your CSS** from general to specific: element rules first, then components (`.button`), then variations (`.button-outline`).
4. **Keep selectors short.** The shorter the selector, the easier to override later.
5. **Use DevTools** to see which declaration wins and which lines are crossed out.

## 6. What just happened?

```text
 For the "Order a box" button the browser asked, property by property:
   background-color →  rules: .button (0-1-0) · .button-outline (0-1-0) · .button:hover (0-2-0, only on hover)
                       not hovering: tie on specificity → later wins → .button-outline → transparent
                       hovering: .button-outline:hover (0-2-0) comes after .button:hover (0-2-0) → wins
   color            →  rules: a (0-0-1) · .button (0-1-0) · .button-outline (0-1-0)
                       .button-outline comes later → berry text
```

## 🧪 Try it yourself

1. In the Console, type `$$("nav a")`, `$$(".price")` and `$$("a[target]")`. How many elements does each pick?
2. Add `.cards li:nth-child(even) { background-color: #fff0e3; }` and see the stripes. Try `:nth-child(3n)`, `:first-child` and `:last-child`. Then delete it: we will style the cards properly later.
3. Write `h2 + p { font-weight: bold; }`. Which paragraphs change? (The ones directly after an `<h2>`.)
4. Add `#menu-title { color: black; }` at the **top** of your stylesheet. The heading still turns black, even though `h1, h2, h3` comes later. Why? (Specificity: an ID, 1-0-0, beats a type, 0-0-1.) Delete it again.
5. Add `p { color: green !important; }` and see every paragraph change, whatever other rules say. Delete it.
6. Add `a::before { content: "→ "; }` and look at the page. Try `li::marker { color: #b3365f; }`.
7. Turn `h1, h2, h3` into `:is(h1, h2, h3)`. Does anything change? (No: the same elements, and `:is()` takes the specificity of its most specific argument.)
8. Add `:where(h1, h2, h3) { color: red; }` *after* the heading rule. Does it win? (No: `:where()` always has zero specificity, so it loses even though it comes last.)
9. Put the `.button-outline` rule *before* `.button` in the stylesheet. What happens to the outline button's background? Move it back.

## ✅ Check yourself

<details>
<summary>1. What is the difference between <code>.card p</code>, <code>.card &gt; p</code> and <code>p.card</code>?</summary>

`.card p` is every `<p>` anywhere inside an element with class `card`. `.card > p` is only `<p>`s that are *direct* children. `p.card` is a `<p>` that itself has the class `card`.
</details>

<details>
<summary>2. Which wins: <code>.button { color: white }</code> or <code>a { color: red }</code>, whichever comes last?</summary>

`.button` always wins: a class (0-1-0) is more specific than a type (0-0-1). Order only matters when specificity ties.
</details>

<details>
<summary>3. What is the specificity of <code>#menu .card:hover h3</code>?</summary>

1-2-1: one ID (`#menu`), two (class and pseudo-class: `.card` and `:hover`), one type (`h3`).
</details>

<details>
<summary>4. Why should you avoid <code>!important</code>?</summary>

It breaks the normal cascade. The only way to override it is another `!important`, so stylesheets become hard to change. Fix the real cause instead.
</details>

<details>
<summary>5. Which of these properties is inherited by default: <code>color</code>, <code>border</code>, <code>font-family</code>, <code>margin</code>?</summary>

`color` and `font-family`. Box-related properties (`border`, `margin`, `padding`, `background`) are not inherited.
</details>

## Recap

- Selectors point at elements: type, `.class`, `#id`, attribute, combinators (` `, `>`, `+`, `~`), pseudo-classes (`:hover`, `:focus-visible`, `:nth-child()`) and pseudo-elements (`::before`).
- Style with **classes**. Name them by what the thing *is*.
- Text properties are inherited; box properties are not. `inherit`, `initial`, `unset`, `revert` control it.
- The cascade: **importance, layer, specificity, then order**. Specificity is counted as ID-class-type, left to right.
- Keep selectors short, avoid IDs and `!important`, and use DevTools to see who wins.

➡️ **Next:** [Lesson 7 – The box model](07-the-box-model.md)
