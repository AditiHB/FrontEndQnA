# Lesson 11: CSS Grid

> **Like I'm 5:** Grid is a **sheet of graph paper**. You decide how many columns and rows it has. Then you tell each toy which squares to cover: "you take two squares across", "you take the whole top row". And the toys obey.

| | |
|---|---|
| **You will learn** | Grid terms (tracks, lines, cells, areas), `grid-template-columns` and `-rows`, `fr`, `repeat()`, `minmax()`, `gap`, placing items with `grid-column`, `grid-row` and `span`, named `grid-template-areas`, alignment in cells, and `repeat(auto-fit, minmax())` |
| **You will build** | A 3-column menu of cards that adapts by itself, a two-column hero and story, a two-column "Visit us" and a tidy order form |
| **Time** | About 2 hours (with the games) |

## The story

Bunny's six treats are stacked in a long single column, and her hero picture sits *under* the words, not next to them. She needs a layout with rows **and** columns. Flexbox puts things on a line; **Grid** puts things on a **sheet**.

## 1. Flexbox or Grid?

| | Flexbox | Grid |
|---|---------|------|
| Works in | **one** direction (a row *or* a column) | **two** directions (rows *and* columns) |
| Starts from | The **content**: items decide their size, the container arranges them | The **layout**: you draw the tracks, the items drop in |
| Great for | Menus, toolbars, button rows, centering one thing | Page layouts, card galleries, forms, anything with rows and columns that must line up |

They work together: a **grid** lays out the page, and **flexbox** lines up things inside each cell. You usually need both.

## 2. The words of Grid

```text
         column line 1   2          3          4         ◄── lines are numbered from 1 (and from -1 at the end)
                │         │          │          │
   row line 1 ──┼─────────┼──────────┼──────────┤
                │  cell   │  cell    │  cell    │   ◄── track: one ROW
   row line 2 ──┼─────────┼──────────┼──────────┤
                │  cell   │  cell    │  cell    │
   row line 3 ──┴─────────┴──────────┴──────────┘
                  ▲ track: one COLUMN
```

- **Grid container**: the parent with `display: grid`. **Grid items**: its direct children.
- **Tracks**: the columns and the rows. **Cells**: where a row and a column meet.
- **Lines**: the dividing lines, numbered from `1`. (`-1` is the last line, counting from the end.)
- **Area**: any rectangle of cells. **Gap**: the gutters between tracks.

## 3. Defining the tracks

```css
.cards {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;   /* three columns that share the space equally */
  gap: 1rem;                              /* space between the cells */
}
```

You list the **size of every column**, separated by spaces. The items fill the cells row by row (left to right, then down) and **new rows are created automatically**.

### The `fr` unit

`fr` means a **fraction of the free space**. `1fr 2fr` is "one share and two shares": the second column is twice as wide as the first. `fr` is smarter than `%`: it subtracts the gaps and the fixed-size tracks first.

```text
 grid-template-columns: 8rem 1fr 2fr     (container: 1000px wide, gap 0)
 ┌──────┬────────────────────┬──────────────────────────────────────────┐
 │ 8rem │   1fr (~290px)     │          2fr (~580px)                   │
 │128px │                    │                                          │
 └──────┴────────────────────┴──────────────────────────────────────────┘
```

### Handy helpers

| You write | Means |
|-----------|-------|
| `repeat(3, 1fr)` | `1fr 1fr 1fr` |
| `repeat(2, 5rem 1fr)` | `5rem 1fr 5rem 1fr` |
| `minmax(10rem, 1fr)` | "at least 10rem, at most one share" |
| `auto` | "the size of the content" (and the free space, if there is any) |
| `min-content`, `max-content` | The narrowest and the widest the content can be |
| `grid-template-rows: 5rem 1fr` | The same idea for rows (set one when the container has a height) |
| `grid-auto-rows: 8rem` | The size of the rows that are created automatically |
| `grid-auto-flow: column` | Fill column by column instead of row by row |

## 4. The most useful line in CSS Grid

```css
grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
```

Read it like a sentence: "**Make as many columns as fit**, each **at least 16rem** wide, and share any leftover space equally." The number of columns changes **by itself** when the window changes:

```text
 wide window:    ┌──────┐ ┌──────┐ ┌──────┐         narrow window:   ┌─────────────┐
                 │  1   │ │  2   │ │  3   │                         │      1      │
                 ├──────┤ ├──────┤ ├──────┤                         ├─────────────┤
                 │  4   │ │  5   │ │  6   │                         │      2      │
                 └──────┘ └──────┘ └──────┘                         ├─────────────┤
                  3 columns                                         │      3  ...   │
                                                                      1 column
```

No media queries, no breakpoints. `auto-fit` collapses empty tracks (so the items stretch to fill the row), and `auto-fill` keeps them (so the items keep their size and leave empty space). With plenty of items they behave the same.

## 5. Placing items

By default, every item takes the next free cell. To break the rule, name the lines:

```css
.item-1 { grid-column: 1 / 3; }      /* from column line 1 to line 3: spans two columns */
.item-1 { grid-column: span 2; }     /* the same, without counting lines */
.item-2 { grid-row: 1 / -1; }        /* from the first row line to the last: every row */
.title  { grid-column: 1 / -1; }     /* the whole width, however many columns there are */
```

`grid-column` is short for `grid-column-start` and `grid-column-end`; the same for `grid-row`.

### Name the areas

Sometimes it is easier to draw the layout:

```css
.story {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    "title   title"
    "picture text";
}
.story h2     { grid-area: title; }
.story figure { grid-area: picture; }
.story-text   { grid-area: text; }
```

Each string is a **row**, each word a **cell**. Repeating a name makes one area span several cells. A dot (`.`) is an empty cell. Reading the CSS is like looking at the page.

### Alignment inside the grid

The same words as Flexbox, with two directions:

| Property | Works on | Does |
|----------|----------|------|
| `justify-items` / `align-items` | The **container** | Where *every item* sits inside its cell, horizontally / vertically (`stretch` is the default, then `start`, `center`, `end`) |
| `justify-self` / `align-self` | One **item** | The same, for one item |
| `place-items: center` | The container | The short form of `align-items` and `justify-items` |
| `justify-content` / `align-content` | The **container** | Where the **whole grid** sits when the tracks are smaller than the container (`start`, `center`, `end`, `space-between`...) |

## 6. See the grid

In DevTools, in the **Elements** pane, find an element with `display: grid`. A small **grid** badge appears next to it: click it. The browser draws the **lines, numbers and gaps** on the page. In the **Layout** tab (Chrome, Edge), you can also show line numbers and area names, and switch overlays on and off. Use it every time: nothing makes the grid clearer.

## 7. Play before you build

Do these now. They are in this repository's `playgrounds/` folder and work offline:

1. **[Grid playground](playgrounds/grid-playground.html)**: type your own `grid-template-columns` (try `1fr 2fr`, `100px 1fr 100px`, `repeat(auto-fit, minmax(7rem, 1fr))`), change the gaps and alignment, click a box and give it `span 2`. Pink dashed cells show the grid. Drag the corner of the area to resize it and watch `auto-fit` change the columns.
2. **[Grid challenges](playgrounds/grid-challenges.html)**: a game with 9 levels, from "three columns" to a full page layout with named areas.

(Optional extra, outside this repository: **Grid Garden**, a free game at [cssgridgarden.com](https://cssgridgarden.com), teaches the same ideas with carrots.)

## 8. Build: the bakery in a grid

Five parts of the page get a grid. For two of them we need some HTML first (a grid needs the **right parents**).

### HTML: wrappers

The story's two paragraphs need one box around them, so that the story has only three children (title, picture, text). And the "Visit us" section needs one box for the opening hours and one for the address. In your `index.html`, make these edits. (The visit change re-indents a few lines; the browser doesn't care, but your code stays tidy.)

📄 **`index.html`** (edit these lines)

```diff
-      <section id="story" aria-labelledby="story-title">
+      <section class="story" id="story" aria-labelledby="story-title">
@@
-        <p>
-          Bunny learned to bake in her grandmother's kitchen, standing on a wooden box
-          to reach the counter. Her first loaf was a little flat, and everybody ate it anyway.
-        </p>
-        <p>
-          Today she gets up before the sun to start the ovens, so that the first warm
-          bread is on the shelf when the neighbours walk by. Every recipe is still made
-          the slow, careful way she was taught.
-        </p>
+        <div class="story-text">
+          <p>
+            Bunny learned to bake in her grandmother's kitchen, standing on a wooden box
+            to reach the counter. Her first loaf was a little flat, and everybody ate it anyway.
+          </p>
+          <p>
+            Today she gets up before the sun to start the ovens, so that the first warm
+            bread is on the shelf when the neighbours walk by. Every recipe is still made
+            the slow, careful way she was taught.
+          </p>
+        </div>
@@
-      <section id="visit" aria-labelledby="visit-title">
+      <section class="visit" id="visit" aria-labelledby="visit-title">
@@
-        <h3>Opening hours</h3>
-        <table>
-          <caption>Our weekly opening times</caption>
-          <thead>
-            <tr>
-              <th scope="col">Day</th>
-              <th scope="col">Opens</th>
-              <th scope="col">Closes</th>
-            </tr>
-          </thead>
-          <tbody>
-            <tr>
-              <th scope="row">Monday to Friday</th>
-              <td>7:00</td>
-              <td>18:00</td>
-            </tr>
-            <tr>
-              <th scope="row">Saturday</th>
-              <td>8:00</td>
-              <td>16:00</td>
-            </tr>
-            <tr>
-              <th scope="row">Sunday</th>
-              <td>8:00</td>
-              <td>13:00</td>
-            </tr>
-          </tbody>
-        </table>
-        <h3>Find us</h3>
-        <address>
-          Bunny Bakery<br>
-          12 Carrot Lane<br>
-          Meadowtown<br>
-          <a href="tel:+15550123">+1&nbsp;555&nbsp;0123</a><br>
-          <a href="mailto:hello@bunnybakery.example">hello@bunnybakery.example</a>
-        </address>
-        <p>
-          <a href="https://www.openstreetmap.org/search?query=Carrot%20Lane" target="_blank" rel="noopener">Open the map</a>
-          (opens in a new tab)
-        </p>
+        <div>
+          <h3>Opening hours</h3>
+          <table>
+            <caption>Our weekly opening times</caption>
+            <thead>
+              <tr>
+                <th scope="col">Day</th>
+                <th scope="col">Opens</th>
+                <th scope="col">Closes</th>
+              </tr>
+            </thead>
+            <tbody>
+              <tr>
+                <th scope="row">Monday to Friday</th>
+                <td>7:00</td>
+                <td>18:00</td>
+              </tr>
+              <tr>
+                <th scope="row">Saturday</th>
+                <td>8:00</td>
+                <td>16:00</td>
+              </tr>
+              <tr>
+                <th scope="row">Sunday</th>
+                <td>8:00</td>
+                <td>13:00</td>
+              </tr>
+            </tbody>
+          </table>
+        </div>
+        <div>
+          <h3>Find us</h3>
+          <address>
+            Bunny Bakery<br>
+            12 Carrot Lane<br>
+            Meadowtown<br>
+            <a href="tel:+15550123">+1&nbsp;555&nbsp;0123</a><br>
+            <a href="mailto:hello@bunnybakery.example">hello@bunnybakery.example</a>
+          </address>
+          <p>
+            <a href="https://www.openstreetmap.org/search?query=Carrot%20Lane" target="_blank" rel="noopener">Open the map</a>
+            (opens in a new tab)
+          </p>
+        </div>
```

Two form fields need a class so they can use the full width of the form:

📄 **`index.html`** (edit these lines)

```diff
-            <div>
-              <label for="notes">Anything we should know? (allergies, a birthday&hellip;)</label>
+            <div class="field-wide">
+              <label for="notes">Anything we should know? (allergies, a birthday&hellip;)</label>
@@
-            <div>
-              <input id="sms" name="sms" type="checkbox" value="yes">
+            <div class="field-wide">
+              <input id="sms" name="sms" type="checkbox" value="yes">
```

### CSS: the menu cards

The six cards become a grid that adapts itself. Inside each card we use **flexbox** (a column) to push the price to the bottom, so that all prices line up even when the text above has different lengths. That is Grid and Flexbox working together.

📄 **`styles.css`** (edit these lines)

```diff
-/* Cards are stacked for now: Lesson 11 puts them in a grid */
+/* Cards: a grid that chooses its own number of columns */
 .cards {
+  display: grid;
+  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
+  gap: var(--space-m);
   list-style: none;
@@
 .cards li {
-  margin-bottom: var(--space-m);
+  display: flex;
+  flex-direction: column;
   padding: var(--space-m);
```

Then the price: an auto margin on top, in a flex column, takes all the free space above it:

📄 **`styles.css`** (edit these lines)

```diff
 .price {
   color: var(--berry);
   font-size: 1.125rem;
   font-weight: 700;
 }
+
+/* In a flex column, an auto top margin pushes the price to the bottom of the card */
+.cards .price {
+  margin-top: auto;
+}
```

Why `.cards .price` and not `.price`? Remember Lesson 6: the rule `.cards p { margin: 0 0 0.25rem }` has the specificity 0-1-1, so a lone `.price` (0-1-0) would **lose** and the margin would stay `0`. `.cards .price` is 0-2-0 and wins.

### CSS: the hero, the story, the visit section

📄 **`styles.css`** (edit these lines)

```diff
 .hero {
+  display: grid;
+  grid-template-columns: 1.1fr 1fr;
+  align-items: center;
+  gap: var(--space-xl);
   margin: var(--space-l) 0 var(--space-m);
```

Now the story (named areas!) and the visit section. Add this at the bottom:

📄 **`styles.css`** (add to the bottom)

```css
/* ========== Grid layouts ========== */

/* Our story: a title across the top, then picture and text side by side */
.story {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    "title title"
    "picture text";
  align-items: center;
  gap: 0 var(--space-xl);
}

.story h2 {
  grid-area: title;
}

.story figure {
  grid-area: picture;
  margin: 0;
}

.story-text {
  grid-area: text;
}

/* Visit us: the title across the top, hours and address side by side */
.visit {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0 var(--space-xl);
}

.visit h2 {
  grid-column: 1 / -1;
}
```

### CSS: the order form

Each `<fieldset>` becomes a small grid: as many columns of at least 14rem as fit. The nested "Size" fieldset and the two wide fields take the whole row.

📄 **`styles.css`** (edit these lines)

```diff
 fieldset {
+  display: grid;
+  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
+  gap: var(--space-m);
   margin: 0 0 var(--space-l);
@@
-fieldset > div {
-  margin-bottom: var(--space-m);
+fieldset fieldset,
+.field-wide {
+  grid-column: 1 / -1;
+}
+
+fieldset fieldset {
+  margin: 0;
 }
@@
 textarea {
+  max-width: none;
   resize: vertical;
 }
```

(Since the `gap` now provides the space between fields, we replaced the old `fieldset > div { margin-bottom }` rule.)

### Look at it

Save and refresh.

- **Menu:** three columns of equal cards. Narrow the window slowly: it becomes **two columns**, then **one**, with no media query. The prices sit on one line at the bottom of each row of cards.
- **Hero:** the words on the left, the picture on the right, vertically centered.
- **Story:** the picture and the text side by side.
- **Visit us:** hours on the left, address on the right.
- **Order form:** fields in columns, the sizes in a row, the notes and the checkbox across the full width.

Open the Grid overlay in DevTools on the `.cards` list, then on `.story` (you can see the named areas), then on a `<fieldset>`.

**And now shrink the window to phone width.** The cards and the form look fine, but the **hero, the story and the visit section stay in two columns** and get squeezed. That is the problem of the next lessons: the layout must *change* on a small screen. Lesson 13 solves it with media queries.

## 9. What just happened?

```text
 .cards  { display: grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); gap: 1rem }

 1000px wide:  3 columns of 1fr     ┌───┐ ┌───┐ ┌───┐
 700px wide:   2 columns            ┌─────┐ ┌─────┐
 300px wide:   1 column             ┌───────────┐
```

- You wrote **zero** media queries and the menu is already responsive. Intrinsic layouts (made of `auto-fit`, `minmax`, `fr` and `flex-wrap`) adapt to the **space available**.
- The same element, `.cards li`, is a **grid item** of `.cards` and a **flex container** for its own children.
- Named areas (`grid-template-areas`) read like a map of the page.

## 10. Grid gotchas

- **Only direct children** are grid items. A grandchild is not placed by the grid.
- **Items stretch** to fill the cell by default (`justify-items: stretch`). If you want an item to keep its own size, set `align-self` / `justify-self` (or `place-items: start`).
- **`gap` never adds space on the outside.** Use padding on the container for that.
- **`fr` units and long content:** a `1fr` column cannot shrink below the width of its content (`min-content`) unless you write `minmax(0, 1fr)`. If a code block or a long word makes a grid column overflow, `minmax(0, 1fr)` is the fix.
- **Percentages and `fr`:** `1fr 1fr` is *not* the same as `50% 50%` when there is a gap: the `fr` version subtracts the gap and fits, the percentage version overflows.
- **Order and accessibility:** just like `order` in Flexbox, moving items visually with `grid-area` or `grid-row` does not move them in the Tab order or for screen readers. Keep the source order meaningful.

## 🧪 Try it yourself

1. In the Grid overlay, switch on **line numbers** for `.story`. Name the line numbers of the picture's area.
2. Change `.story`'s `grid-template-columns` to `1fr 2fr`. Then to `2fr 1fr`.
3. Make the first card span two columns: `.cards li:first-child { grid-column: span 2; }`. What happens to the other cards? Add `grid-auto-flow: dense;` to `.cards` and see whether the holes fill.
4. Change `minmax(16rem, 1fr)` to `minmax(10rem, 1fr)`, and then to `minmax(24rem, 1fr)`. How many columns at your window width?
5. Change `auto-fit` to `auto-fill` and use only two cards (hide four with `display: none`). Compare: with `auto-fit` the two cards stretch, with `auto-fill` they keep their size and leave an empty space.
6. Put `align-items: start;` on `.hero`. What changes? Now `place-items: center;`.
7. Make the order form's first fieldset a 3-column grid with `grid-template-columns: repeat(3, 1fr)`. What happens at 320px? (It is cramped: this is why `auto-fit` is better.)
8. Rewrite `.story` without `grid-template-areas`: place the `h2` with `grid-column: 1 / -1` and let the other two items flow. Same picture?
9. Finish the **9 levels** of the [Grid challenges](playgrounds/grid-challenges.html).

## ✅ Check yourself

<details>
<summary>1. What does <code>1fr 2fr 1fr</code> mean?</summary>

Three columns that share the free space in the proportion 1 : 2 : 1 (the middle one is twice as wide as each of the others).
</details>

<details>
<summary>2. What does <code>repeat(auto-fit, minmax(16rem, 1fr))</code> do?</summary>

It creates as many columns as fit in the container, each at least 16rem wide, and shares the leftover space equally. The number of columns changes by itself when the container's width changes.
</details>

<details>
<summary>3. How do you make an item span the full width of a grid with any number of columns?</summary>

`grid-column: 1 / -1;` (from the first line to the last line).
</details>

<details>
<summary>4. What is the difference between <code>align-items</code> and <code>align-content</code> in a grid?</summary>

`align-items` places each item *inside its own cell*. `align-content` places the *whole set of tracks* inside the container, and only matters when the tracks are smaller than the container.
</details>

<details>
<summary>5. When would you choose Flexbox, and when Grid?</summary>

Flexbox for one line of items (menus, toolbars, button rows, centering). Grid when you have rows and columns that must line up (page layouts, galleries, forms). They combine well.
</details>

## Recap

- `display: grid` + `grid-template-columns` / `-rows` define the tracks; `fr`, `repeat()` and `minmax()` size them; `gap` spaces them.
- `repeat(auto-fit, minmax(16rem, 1fr))` makes a layout that adapts itself.
- Items are placed with `grid-column`, `grid-row`, `span`, or named areas (`grid-template-areas` and `grid-area`).
- `place-items`, `justify-self` and `align-self` align items in their cells; `justify-content` and `align-content` place the whole grid.
- Grid lays out the page, Flexbox lines up the inside. Use both.

➡️ **Next:** [Lesson 12 – Positioning and stacking](12-positioning-and-stacking.md)
