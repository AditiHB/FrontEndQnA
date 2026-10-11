# Lesson 14: Responsive Layouts

> **Like I'm 5:** Last time we taught the page to change when the *window* changes size. Now we teach each **piece** of the page to look after itself. A comic panel doesn't care how big the whole book is: it just fits its own frame. And a big menu with many links tucks itself into a **drawer** on a phone, which you open with a button.

| | |
|---|---|
| **You will learn** | The main responsive layout patterns, a no-JavaScript **pop-over menu** (the `popover` attribute), **container queries** (`@container`), scrolling wide tables safely, and a few intrinsic layout recipes |
| **You will build** | A "Menu" button that opens the navigation on phones, menu cards that lay themselves out in a row when they have room, a featured card, and a table that never breaks the page |
| **Time** | About 2 hours |

## The story

Bunny's page works on a phone, but three things still bother her. The navigation will soon have more links, and a long row of links does not fit on a small screen: she wants a **Menu button**. Her menu cards look lonely when they stretch wide on a tablet. And on the smallest phones the "Our boxes" table sticks out of the page.

## 1. Patterns that keep coming back

Responsive layouts are usually one of a few well-known shapes:

```text
 Mostly fluid              Column drop                Layout shifter            Off-canvas
 (our hero, story)         (our menu cards)           (reorders at breakpoints) (the menu button)

 ┌───────────┐             ┌─────┬─────┬─────┐        ┌───┬───────┐               ┌──────────┐
 │ 1  │  2   │   ──►       │  1  │  2  │  3  │        │ 1 │   2   │               │ ☰ Menu   │
 └───────────┘             └─────┴─────┴─────┘        ├───┴───────┤               └──────────┘
 ┌───────────┐ narrow:     narrow: columns drop       │ 3         │  narrow:      the menu is hidden
 │     1     │             into rows                  └───────────┘  shapes change   until you ask for it
 ├───────────┤
 │     2     │
 └───────────┘
```

## 2. A menu button, without JavaScript

Four links wrap nicely, but a real site has more. The standard answer on phones is a **menu button** that opens a panel. For years, this needed JavaScript or CSS hacks with a hidden checkbox. Now HTML does it: the **`popover`** attribute.

```html
<button popovertarget="site-nav">Menu</button>

<nav id="site-nav" popover>
  ...links...
</nav>
```

- An element with the **`popover`** attribute is **hidden** by default and shown in the **top layer** (above everything else on the page, whatever the `z-index`) when it is opened.
- A `<button>` with **`popovertarget="the-id"`** toggles it.
- The browser gives you, for free: opening with a click or Enter/Space, **closing with the Esc key**, **closing when you click outside** (called *light dismiss*), returning the keyboard focus to the button, and telling screen readers the button's expanded or collapsed state.

That is a lot of work you would otherwise write yourself, and often get wrong.

**Responsive twist:** we want the panel only on phones. On bigger screens the navigation should simply be visible in the header. So in CSS we will turn the "pop-over" back into a normal element from 48rem up, and hide the button.

### HTML

Open `index.html`. These edits add the button and make the navigation a popover. (The rest of the edits in this step are for the menu cards and the table, which we cover below: do them all now.)

📄 **`index.html`** (edit these lines)

```diff
     <link rel="stylesheet" href="styles.css">
+    <script src="site.js" defer></script>
   </head>
@@
-        <nav aria-label="Main">
+        <button class="nav-toggle" type="button" popovertarget="site-nav">
+          <span aria-hidden="true">☰</span> Menu
+        </button>
+        <nav id="site-nav" aria-label="Main" popover>
@@
-        <ul class="cards">
-          <li>
-            <h3>Sourdough loaf</h3>
-            <p>Slow-risen, with a crackly crust and a soft middle.</p>
-            <p class="price">$6.00</p>
-          </li>
-          <li>
-            <h3>Butter croissant</h3>
-            <p>Flaky layers, golden on the outside, tender inside.</p>
-            <p class="price">$3.50</p>
-          </li>
-          <li>
-            <h3>Carrot cupcake</h3>
-            <span class="badge">New</span>
-            <p>Spiced sponge, cream-cheese frosting and a tiny candied carrot.</p>
-            <p class="price">$4.00</p>
-          </li>
-          <li>
-            <h3>Oat and raisin cookie</h3>
-            <p>Chewy in the middle, crisp at the edge.</p>
-            <p class="price">$2.50</p>
-          </li>
-          <li>
-            <h3>Cinnamon bun</h3>
-            <p>Warm, sticky and swirled with brown sugar.</p>
-            <p class="price">$4.00</p>
-          </li>
-          <li>
-            <h3>Strawberry tart</h3>
-            <p>Crisp pastry, vanilla cream and fresh strawberries.</p>
-            <p class="price">$5.00</p>
-          </li>
-        </ul>
+        <ul class="cards">
+          <li class="featured">
+            <article class="card">
+              <span class="card-icon" aria-hidden="true">🍞</span>
+              <h3>Sourdough loaf</h3>
+              <span class="badge">Bestseller</span>
+              <p>Slow-risen, with a crackly crust and a soft middle.</p>
+              <p class="price">$6.00</p>
+            </article>
+          </li>
+          <li>
+            <article class="card">
+              <span class="card-icon" aria-hidden="true">🥐</span>
+              <h3>Butter croissant</h3>
+              <p>Flaky layers, golden on the outside, tender inside.</p>
+              <p class="price">$3.50</p>
+            </article>
+          </li>
+          <li>
+            <article class="card">
+              <span class="card-icon" aria-hidden="true">🧁</span>
+              <h3>Carrot cupcake</h3>
+              <span class="badge">New</span>
+              <p>Spiced sponge, cream-cheese frosting and a tiny candied carrot.</p>
+              <p class="price">$4.00</p>
+            </article>
+          </li>
+          <li>
+            <article class="card">
+              <span class="card-icon" aria-hidden="true">🍪</span>
+              <h3>Oat and raisin cookie</h3>
+              <p>Chewy in the middle, crisp at the edge.</p>
+              <p class="price">$2.50</p>
+            </article>
+          </li>
+          <li>
+            <article class="card">
+              <span class="card-icon" aria-hidden="true">🍩</span>
+              <h3>Cinnamon bun</h3>
+              <p>Warm, sticky and swirled with brown sugar.</p>
+              <p class="price">$4.00</p>
+            </article>
+          </li>
+          <li>
+            <article class="card">
+              <span class="card-icon" aria-hidden="true">🍓</span>
+              <h3>Strawberry tart</h3>
+              <p>Crisp pastry, vanilla cream and fresh strawberries.</p>
+              <p class="price">$5.00</p>
+            </article>
+          </li>
+          <li>
+            <article class="card">
+              <span class="card-icon" aria-hidden="true">🍋</span>
+              <h3>Lemon loaf cake</h3>
+              <p>Zesty lemon sponge under a thin, crackly sugar glaze.</p>
+              <p class="price">$4.50</p>
+            </article>
+          </li>
+        </ul>
@@
-        <table>
-          <caption>Our boxes</caption>
-          <thead>
-            <tr>
-              <th scope="col">Box</th>
-              <th scope="col">Treats</th>
-              <th scope="col">Great for</th>
-              <th scope="col">Price</th>
-            </tr>
-          </thead>
-          <tbody>
-            <tr>
-              <th scope="row">Small box</th>
-              <td>4</td>
-              <td>Breakfast for two</td>
-              <td>$14</td>
-            </tr>
-            <tr>
-              <th scope="row">Large box</th>
-              <td>8</td>
-              <td>A family treat</td>
-              <td>$26</td>
-            </tr>
-            <tr>
-              <th scope="row">Party box</th>
-              <td>16</td>
-              <td>Birthdays and office parties</td>
-              <td>$48</td>
-            </tr>
-          </tbody>
-        </table>
+        <section class="table-scroll" tabindex="0" aria-label="Our boxes (scrolls sideways on small screens)">
+          <table>
+            <caption>Our boxes</caption>
+            <thead>
+              <tr>
+                <th scope="col">Box</th>
+                <th scope="col">Treats</th>
+                <th scope="col">Great for</th>
+                <th scope="col">Price</th>
+              </tr>
+            </thead>
+            <tbody>
+              <tr>
+                <th scope="row">Small box</th>
+                <td>4</td>
+                <td>Breakfast for two</td>
+                <td>$14</td>
+              </tr>
+              <tr>
+                <th scope="row">Large box</th>
+                <td>8</td>
+                <td>A family treat</td>
+                <td>$26</td>
+              </tr>
+              <tr>
+                <th scope="row">Party box</th>
+                <td>16</td>
+                <td>Birthdays and office parties</td>
+                <td>$48</td>
+              </tr>
+            </tbody>
+          </table>
+        </section>
```

(`defer` makes the browser run the script after the page is read. `☰` is the "hamburger" character; `aria-hidden` stops screen readers from reading it out, because the word "Menu" is enough.)

### The only JavaScript in this course

There is one thing the popover can't do by itself: when you tap a link **inside** it that goes to another place **on the same page**, the panel stays open and covers the content. Closing it takes three lines of JavaScript. Create a new file next to `index.html`:

📄 **`site.js`** (new file)

```js
// On small screens the menu is a pop-over. Close it again after a link inside it is used.
const nav = document.getElementById("site-nav");

nav.addEventListener("click", (event) => {
  if (event.target.closest("a") && nav.matches(":popover-open")) {
    nav.hidePopover();
  }
});
```

This is **progressive enhancement**: without the script the menu still opens and closes (with the button, Esc or a click outside). The script only makes it a bit nicer.

### CSS: phone first

📄 **`styles.css`** (edit these lines)

```diff
 nav ul {
   display: flex;
-  flex-wrap: wrap;
-  gap: var(--space-s) var(--space-l);
+  flex-direction: column;
   margin: 0;
@@
 nav a {
-  display: inline-flex;
+  display: flex;
   align-items: center;
   min-height: 2.75rem;
@@
 nav a:hover {
   color: var(--berry);
   text-decoration: underline;
 }
+
+/* The Menu button: only for small screens */
+.nav-toggle {
+  display: inline-flex;
+  align-items: center;
+  gap: var(--space-s);
+  min-height: 2.75rem;
+  padding: 0.5rem 1rem;
+  border: 2px solid var(--line-strong);
+  border-radius: var(--radius-pill);
+  background-color: var(--white);
+  color: var(--brown);
+  font-weight: 700;
+  cursor: pointer;
+}
+
+/* On small screens the navigation is a panel that drops down from under the header */
+nav[popover] {
+  inset: 4.5rem var(--space-m) auto var(--space-m);
+  width: auto;
+  height: auto;
+  margin: 0;
+  padding: var(--space-s) var(--space-m);
+  border: 1px solid var(--line);
+  border-radius: var(--radius);
+  background-color: var(--white);
+  box-shadow: var(--shadow-m);
+}
```

### CSS: from 48rem up, the navigation is just a row

Back in the media query block at the bottom of the stylesheet, add the "bigger screens" version: the button disappears, and the navigation stops being a panel:

📄 **`styles.css`** (edit these lines)

```diff
   .visit h2 {
     grid-column: 1 / -1;
   }
+
+  .nav-toggle {
+    display: none;
+  }
+
+  nav[popover] {
+    display: block;
+    position: static;
+    inset: auto;
+    padding: 0;
+    border: 0;
+    background: none;
+    box-shadow: none;
+    overflow: visible;
+  }
+
+  nav ul {
+    flex-direction: row;
+    flex-wrap: wrap;
+    gap: var(--space-s) var(--space-l);
+  }
 }
```

Why does this work? The browser's own stylesheet says "a `popover` element that is not open is `display: none`" and "popovers are `position: fixed`". **Author CSS always beats the browser's own CSS**, whatever the specificity. So `display: block` brings the navigation back, `position: static` puts it back into the normal flow of the header, and removing the decoration (border, background, shadow) makes it look like before. (This applies only from 48rem up. On phones the browser's `display: none` stays in charge until you open the menu.)

### Try the menu

Save and refresh. Open the device toolbar at 375px:

1. The header now shows the logo and a **☰ Menu** button.
2. Click it: a white panel with four links drops from under the header.
3. Press **Esc**, or click anywhere outside: it closes.
4. Open it again and click "Our story": the page scrolls there and the panel closes (that's the script).
5. Press **Tab** to focus the button, **Enter** to open it, **Tab** to move into the links. Press **Esc**: the focus goes back to the button.

Now drag the window wider than 768px: the button disappears and the four links are back in the header.

## 3. Container queries

A **media query** asks about the *window*. But a component often doesn't know how wide the window is. What it cares about is **how much room it has been given**, and that depends on where you place it: the same card can be in a narrow sidebar or in a wide column.

A **container query** asks about the size of the **nearest container** instead.

```css
/* 1. Say which element is the "container" you want to measure */
.cards li {
  container: card / inline-size;     /* name: card; measure its width (the inline size) */
}

/* 2. Ask about it. Rules inside apply to the container's DESCENDANTS */
@container card (min-width: 28rem) {
  .card h3 { font-size: 1.5rem; }
}
```

Two rules to remember:

- **The container can't style itself.** A container query styles the *children* of the container. That's why a component usually has an outer wrapper (the container) and an inner box (the component that adapts).
- **`container-type: inline-size`** (the `container` shorthand sets it) means the browser measures the container's *width* without letting its content decide it. A container's width can't depend on its children.

There are also **container query units**: `1cqi` is 1% of the container's width. `font-size: clamp(1rem, 5cqi, 2rem)` makes text that scales with its **component** instead of the window.

### Build the menu cards as components

Each card now needs an outer box (the container, the `<li>`) and an inner box (the `.card` component). The HTML edits for this are in the diff you applied above: every `<li>` now contains an `<article class="card">`, gets an emoji icon, and the first card is `featured` (and has a "Bestseller" badge). We also added a seventh item, so that the grid has a complete last row.

Now the CSS. We rename the card rules (`.cards li` becomes `.card`) and add the container:

📄 **`styles.css`** (edit these lines)

```diff
-.cards li {
+/* Each list item is a container: the card inside it can ask how much room it has */
+.cards li {
+  container: card / inline-size;
+}
+
+/* The featured card takes the whole row */
+.featured {
+  grid-column: 1 / -1;
+}
+
+.card {
   display: flex;
   flex-direction: column;
   position: relative;
+  height: 100%;
   padding: var(--space-m);
@@
-.cards li:hover {
+.card:hover {
@@
-.cards h3,
-.cards p {
+.card h3,
+.card p {
   margin: 0 0 0.25rem;
 }
@@
-.cards .price {
+.card .price {
   margin-top: auto;
 }
```

(`height: 100%` makes the card fill its `<li>`, which stretches to the height of the row, so that all cards in a row keep the same height.)

Finally the new rules, at the bottom of `styles.css`: the icon, and the container query that puts the card in a row when it has room:

📄 **`styles.css`** (add to the bottom)

```css
/* ========== Components that adapt to their container ========== */
.card-icon {
  margin-bottom: var(--space-s);
  font-size: 2rem;
  line-height: 1;
}

/* A card with room (28rem or more): icon on the left, text in the middle, price on the right */
@container card (min-width: 28rem) {
  .card {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-areas:
      "icon title price"
      "icon text  price";
    column-gap: var(--space-l);
    align-items: center;
  }

  .card-icon {
    grid-area: icon;
    margin: 0;
    font-size: 3rem;
  }

  .card h3 {
    grid-area: title;
  }

  .card p:not(.price) {
    grid-area: text;
  }

  .card .price {
    grid-area: price;
    margin: 0;
    font-size: 1.5rem;
  }
}
```

Save and refresh.

- At a desktop width, the **featured** sourdough card stretches across all three columns, so it has room: **it lays itself out in a row**. The other six cards are narrow, and stay in the vertical layout.
- Make the window narrower: with two columns the featured card still spans both, and stays horizontal; at phone width it is one column, and it becomes vertical again.
- And there is a window width (roughly 450 to 560px) where *every* card is wide enough to be horizontal, because they are one column of wide cards.

**The same `.card` code, three layouts, and not one media query.** The card does not know (or care) about the window. That is what makes components reusable: put the same card in a narrow sidebar or a wide page and it adapts.

## 4. Wide tables

Tables can be wider than a phone, especially with many columns. At the tiniest widths, our four-column "Our boxes" table sticks out of the page. A common, safe fix is to let the table **scroll sideways inside its own box**, so that the page itself never scrolls sideways. (The HTML wrapper was in the diff above.)

📄 **`styles.css`** (add to the bottom)

```css
/* A wide table scrolls inside its own box, not the page */
.table-scroll {
  margin-bottom: var(--space-l);
  overflow-x: auto;
}

.table-scroll table {
  margin-bottom: 0;
}
```

`overflow-x: auto` shows a scroll bar **only when the table doesn't fit**. Two accessibility details in the HTML: `tabindex="0"` lets keyboard users **focus** the box and scroll it with the arrow keys (a scrolling area that a keyboard can't reach is a problem), and a `<section>` with an `aria-label` is announced by screen readers as a named region.

Check it: narrow the window to 280px (type it in the device toolbar). The table gets a scroll bar inside the page. At 320px and wider it fits without one.

Other ways to handle tables on small screens:

| Approach | When |
|----------|------|
| **Scroll inside a wrapper** (we did) | Data tables with many columns that must stay a table |
| **Stack the rows** as little cards (`display: block` on `tr`, `td` with a `data-label` and `::before`) | Few rows, where each row is a record |
| **Hide less important columns** (carefully!) | When some columns are optional |
| **Make it smaller** | Shorter headings, less padding |

## 5. Layout recipes that need no media query

A short collection of "intrinsic" patterns, which you can use in your own projects:

**A sidebar that drops below when there's no room** (Flexbox):

```css
.with-sidebar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.with-sidebar > :first-child {      /* the sidebar */
  flex: 1 1 15rem;                   /* about 15rem; may grow */
}
.with-sidebar > :last-child {       /* the content */
  flex: 999 1 0;                     /* grows 999 times faster: takes the rest */
  min-width: min(100%, 25rem);       /* when it can't be 25rem, wrap onto the next line */
}
```

**Cards that never get narrower than a number** (Grid): `grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr));` (you've used it).

**A page that is "full-bleed" but with a centered content column** (Grid):

```css
.page {
  display: grid;
  grid-template-columns: 1fr min(65ch, 100% - 2rem) 1fr;   /* edges | content | edges */
}
.page > * { grid-column: 2; }              /* everything goes in the middle... */
.page > .full-width { grid-column: 1 / -1; } /* ...except what needs the full width */
```

**Pictures that keep a shape:** `aspect-ratio: 16 / 9; object-fit: cover; width: 100%;`.

## 6. What just happened?

```text
 Phone (375px)                               Desktop (1280px)
 ┌─────────────────────────┐                 ┌───────────────────────────────────────────┐
 │ 🐰 Bunny Bakery  ☰ Menu │                 │ 🐰 Bunny Bakery     Menu Story Visit Order │
 ├─────────────────────────┤                 ├───────────────────────────────────────────┤
 │ ┌─────────────────────┐ │                 │ ┌───────────────────────────────────────┐ │
 │ │ Menu                │ │ ◄─ popover       │ │ 🍞  Sourdough loaf                $6.00 │ │ ◄─ featured card (wide: row)
 │ │ Our story  ...      │ │   (top layer)    │ └───────────────────────────────────────┘ │
 │ └─────────────────────┘ │                 │ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
 │ card (vertical)         │                 │ │ vertical │ │ vertical │ │ vertical │    │
 └─────────────────────────┘                 │ └──────────┘ └──────────┘ └──────────┘    │
```

- **The window decides** the big shape (one column or two, button or links): *media queries*.
- **The component's room decides** the shape of each card: *container queries*.
- **The content decides** how many columns fit and whether items wrap: *intrinsic layout*.

## 🧪 Try it yourself

1. Tab to the Menu button on a phone-width window and open the menu with the **keyboard**. Press Esc. Where did the focus go?
2. Delete the `<script>` line from `index.html` and tap a link in the open menu. What changes? (Then put it back.)
3. Change `popover` to `popover="manual"` on the `<nav>`. What no longer works? (Esc and click-outside: a "manual" popover is closed only by you.)
4. In DevTools, inspect the open menu. In the Elements pane you see a `#top-layer` marker. Where is the popover in the page structure?
5. Change the container query breakpoint from `28rem` to `20rem`. At which window widths are the cards horizontal now?
6. Remove `.featured`'s `grid-column` rule. The sourdough card is now narrow again: the container query adapts it back to vertical.
7. Add `font-size: clamp(1rem, 6cqi, 1.6rem);` to `.card h3` and resize the window: the title grows with its card.
8. Put the same card in a very narrow place: add `max-width: 12rem;` to `.featured`. What is the card layout now?
9. Remove `overflow-x: auto` from `.table-scroll` and look at 280px again. Then restore it.
10. Try the sidebar recipe in a small test page with two `<div>`s.

## ✅ Check yourself

<details>
<summary>1. What is the difference between a media query and a container query?</summary>

A media query tests the size (or features) of the window or device. A container query tests the size of the nearest ancestor that is declared as a container, so a component adapts to the room it was given, wherever it is placed.
</details>

<details>
<summary>2. Why can't a container query change the styles of the container itself?</summary>

A container's size must not depend on its own contents. If the query could change the container, its size could change, which could change the query result, in an endless loop. So queries only style descendants, and you need a wrapper (container) around the thing that adapts.
</details>

<details>
<summary>3. What does the browser give you for free with the <code>popover</code> attribute?</summary>

Showing in the top layer, toggling with a `popovertarget` button, closing with Esc and when you click outside, returning focus to the button, and the right state for assistive technology, without JavaScript.
</details>

<details>
<summary>4. Why does the scrollable table wrapper have <code>tabindex="0"</code>?</summary>

So that keyboard users can focus it and scroll it with the arrow keys. A scrolling area that can only be reached with a mouse or touch would be inaccessible.
</details>

<details>
<summary>5. When would you use a media query instead of a container query?</summary>

For changes that belong to the whole page or layout and depend on the screen itself: the number of page columns, showing the menu button, preference queries (`prefers-color-scheme`), print styles.
</details>

## Recap

- Common patterns: mostly fluid, column drop, layout shifter, off-canvas menus.
- The `popover` attribute with a `popovertarget` button gives a menu panel with Esc, click-outside and focus handling for free. Turn it back into a normal element on big screens by overriding the browser's styles. A tiny script can close it after a link is used.
- **Container queries** (`container: name / inline-size` and `@container name (min-width: …)`) make components adapt to their own room. Containers style their *descendants*, so give a component an outer wrapper.
- Let wide tables scroll in their own box (`overflow-x: auto` + `tabindex="0"`), never in the page.
- Prefer intrinsic layouts (`flex-wrap`, `auto-fit`, `min()`) and use queries when the layout has to change shape.

➡️ **Next:** [Lesson 15 – Responsive images and what people prefer](15-responsive-images-and-user-preferences.md)
