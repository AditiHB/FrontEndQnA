# Lesson 10: Flexbox

> **Like I'm 5:** A flex container is a **shelf**. You put books on it, and then you just tell the shelf what to do: "push everything to the left", "spread the books out evenly", "stand them in the middle", "put the big book in the corner". You don't move any book by hand: the *shelf* does it.

| | |
|---|---|
| **You will learn** | `display: flex`, the main axis and the cross axis, `justify-content`, `align-items`, `flex-direction`, `flex-wrap`, `gap`, `flex-grow` / `flex-shrink` / `flex-basis` (`flex`), `align-self`, `order`, auto margins |
| **You will build** | A header with the logo on one side and the menu on the other, a row of buttons, a footer, and a page whose footer always sits at the bottom |
| **Time** | About 2 hours (with the games) |

## The story

Bunny's header looks wrong: the logo sits **above** the words "Bunny Bakery", and the menu is a vertical list. Her footer text is stacked, too. She wants rows: logo on the left, menu on the right, everything lined up in the middle. In the old days this took tricks (floats, tables, magic numbers). Now it takes one line: `display: flex`.

## 1. The big idea

Normally, boxes in the page flow **block after block** (blocks) or **word after word** (inline). With `display: flex` on a **parent**, its **children** become **flex items** and the parent controls how they are laid out along **one line** (a row or a column).

```css
.parent {
  display: flex;      /* the parent is now a flex container; its children are flex items */
}
```

Flexbox is **one-dimensional**: items go along a row *or* a column. (For rows *and* columns at the same time, you use Grid, the next lesson.)

### The two axes: the thing to understand

```text
 flex-direction: row  (the default)

   main axis  ──────────────────────────────►
   ┌────────────────────────────────────────────┐   ▲
   │  ┌────┐   ┌────────┐   ┌───┐                │   │
   │  │ 1  │   │   2    │   │ 3 │                │   │ cross
   │  └────┘   └────────┘   └───┘                │   │ axis
   └────────────────────────────────────────────┘   ▼

 flex-direction: column   (the axes swap!)

   cross axis ────►          main axis is now vertical
   ┌─────────────────────┐   │
   │ ┌────┐              │   │
   │ │ 1  │              │   │
   │ └────┘              │   ▼
   │ ┌────────┐          │
   │ │   2    │          │
   │ └────────┘          │
   └─────────────────────┘
```

- **`justify-content`** places items along the **main** axis.
- **`align-items`** places items along the **cross** axis.
- **`flex-direction`** turns the main axis. When it is `column`, "justify" becomes vertical, and "align" becomes horizontal. That is why people mix them up. Always ask yourself: *which way is my main axis?*

## 2. Properties of the container (the parent)

| Property | What it does | Values |
|----------|--------------|--------|
| `display` | Makes the container | `flex` (a block-level flex container), `inline-flex` (an inline one) |
| `flex-direction` | The main axis | `row`, `row-reverse`, `column`, `column-reverse` |
| `justify-content` | Space on the **main** axis | `flex-start`, `center`, `flex-end`, `space-between`, `space-around`, `space-evenly` |
| `align-items` | Alignment on the **cross** axis | `stretch` (default), `flex-start`, `center`, `flex-end`, `baseline` |
| `flex-wrap` | Allow several lines? | `nowrap` (default), `wrap`, `wrap-reverse` |
| `gap` | Space between items (and lines) | `1rem`, `0.5rem 1rem` (row gap, column gap) |
| `align-content` | Space between **lines** (needs `wrap`) | like `justify-content` |

How `justify-content` spreads three items in a row:

```text
 flex-start     │▓▓ ▓▓▓ ▓▓                    │
 center         │         ▓▓ ▓▓▓ ▓▓           │
 flex-end       │                    ▓▓ ▓▓▓ ▓▓│
 space-between  │▓▓           ▓▓▓           ▓▓│   (the first and last touch the edges)
 space-around   │   ▓▓       ▓▓▓       ▓▓   │   (half a space at the edges)
 space-evenly   │    ▓▓      ▓▓▓      ▓▓    │   (all the spaces are equal)
```

## 3. Properties of the items (the children)

| Property | What it does |
|----------|--------------|
| `flex-grow` | How much of the **free space** this item takes. `0` (default): none. `1`: a share. If two items have `1` and `2`, the second gets twice the share |
| `flex-shrink` | How willing the item is to get **smaller** when there is not enough room. `1` (default). `0`: never shrink |
| `flex-basis` | The **starting size** before growing or shrinking (`auto` means "use my width"), like a width along the main axis |
| **`flex`** | The shorthand for all three: `flex: grow shrink basis` |
| `align-self` | This item's own cross-axis alignment (overrides the container's `align-items`) |
| `order` | Changes the visual order without touching the HTML. Default `0`; smaller comes first |
| `margin: auto` | An auto margin swallows **all** the free space on that side |

The `flex` shorthand has a few forms you will use every day:

| You write | It means | Use it for |
|-----------|----------|------------|
| `flex: 1` | `1 1 0%` | "Share the space equally" |
| `flex: auto` | `1 1 auto` | "Grow and shrink from my own size" |
| `flex: none` | `0 0 auto` | "Don't change my size" |
| `flex: 0 0 12rem` | no grow, no shrink, `12rem` | A fixed-size column |

### The auto-margin trick

In a flex container, `margin-left: auto` on an item pushes it (and everything after it) to the right end: the margin takes all the free space. It is the shortest way to put the logo on the left and the menu on the right.

```css
.logo { margin-right: auto; }   /* everything after .logo is pushed to the far end */
```

## 4. Play before you build

The best way to understand flexbox is to move things around. Do these now. Both pages are in this repository's `playgrounds/` folder and work offline: just double-click them.

1. **[Flexbox playground](playgrounds/flexbox-playground.html)**: change every setting with menus and sliders, click a box to give it its own settings, drag the corner of the dashed area to resize it. Spend ten minutes. Try each value of `justify-content` and `align-items` with `row` and then with `column`. The page writes the CSS for you.
2. **[Flexbox challenges](playgrounds/flexbox-challenges.html)**: a game with 8 levels. You write the CSS, and the page compares your result with the goal. Hints are available (and so is the answer, but try first!).

(Optional extra, outside this repository: the free game **Flexbox Froggy** at [flexboxfroggy.com](https://flexboxfroggy.com) teaches the same ideas with a frog. These websites may change, so no lesson depends on them.)

## 5. Build: header, buttons, footer

Now apply it to the bakery. We change the stylesheet in several places. Read each hunk: what did you just learn about?

### The header

📄 **`styles.css`** (edit these lines)

```diff
   box-shadow: var(--shadow-s);
 }
+
+.header-inner {
+  display: flex;
+  flex-wrap: wrap;
+  align-items: center;
+  justify-content: space-between;
+  gap: var(--space-s) var(--space-l);
+}
@@
 .brand {
+  display: inline-flex;
+  align-items: center;
+  gap: var(--space-s);
   color: var(--brown);
@@
 nav ul {
+  display: flex;
+  flex-wrap: wrap;
+  gap: var(--space-s) var(--space-l);
   margin: 0;
```

Save and refresh. The header becomes **one row**: the logo and the name side by side (the `.brand` link is a flex container, too!), the menu links in a row on the right.

Now make the window narrow (or use DevTools' device mode). The menu **wraps below** the logo instead of overflowing, because of `flex-wrap: wrap`. Nice: no media query needed.

### The hero buttons

The two buttons used `margin` for the space between them. Flexbox has `gap`, which is cleaner (no extra space after the last one):

📄 **`styles.css`** (edit these lines)

```diff
   color: var(--brown-soft);
   font-size: 1.25rem;
 }
+
+.actions {
+  display: flex;
+  flex-wrap: wrap;
+  gap: var(--space-s);
+}
@@
   padding: 0.75rem 1.25rem;
-  margin: 0 var(--space-s) var(--space-s) 0;
   border: 2px solid var(--berry);
```

### The footer

📄 **`styles.css`** (edit these lines)

```diff
 .site-footer a {
   color: var(--butter);
 }
+
+.site-footer .container {
+  display: flex;
+  flex-wrap: wrap;
+  align-items: center;
+  justify-content: space-between;
+  gap: var(--space-s) var(--space-l);
+}
+
+.site-footer p {
+  margin: 0;
+}
```

The two footer paragraphs now sit on one line (copyright left, "Back to the top" right), and wrap to two lines on a phone. We set `p { margin: 0 }` because margins of flex items don't collapse and would add a gap under both.

### A footer that stays at the bottom

On a page with little content, the footer floats up in the middle of the window, which looks silly. The fix is a **column flex container** that fills the window, and a `main` that grows to take all the free space:

📄 **`styles.css`** (edit these lines)

```diff
 body {
   margin: 0;
+  display: flex;
+  flex-direction: column;
+  min-height: 100dvh;
   color: var(--brown);
@@
 .container {
+  width: 100%;
   max-width: var(--page-width);
@@
 main > section {
   padding: var(--space-xl) 0;
 }
+
+main {
+  flex: 1;
+}
```

How it works: `body` is a column flex container at least as tall as the window (`100dvh`: the *dynamic* viewport height, which is correct on phones where the address bar appears and disappears). `main` has `flex: 1`, so it **grows** to fill all the free space and pushes the footer to the bottom.

**A classic trap you just avoided:** `.container` has `margin: 0 auto`. An item with auto margins in a flex container does **not** stretch to full width: it shrinks to fit its content. That is why we added `width: 100%` to `.container`: now it takes the full width up to `max-width`, and the auto margins center it. If you ever see a flex item "mysteriously" shrink-wrapping, look for auto margins.

### Check it

1. The header is a row. Narrow the window: the menu wraps below the logo.
2. The hero buttons are side by side, wrapping on narrow screens.
3. The footer: copyright left, link right.
4. Hide most of the page (in DevTools, add `display: none` to a few sections): the footer stays at the bottom of the window.

## 6. What just happened?

```text
   .header-inner  { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap }
   ┌────────────────────────────────────────────────────────────────────────────┐
   │ ┌──────────────┐                              ┌──────────────────────────┐ │
   │ │ 🐰 Bunny Bakery│     ◄── free space ──►      │ Menu  Our story  Visit  Order │ │
   │ └──────────────┘                              └──────────────────────────┘ │
   └────────────────────────────────────────────────────────────────────────────┘
        flex item 1  (itself a flex container: logo + name)          flex item 2  (itself a flex container: the list)
```

- Flex containers **nest**: the header is a flex container, its child `.brand` is a flex container of its own, and `nav ul` is another.
- `justify-content: space-between` put the free space *between* the two children.
- `align-items: center` lined up their middles, whatever their heights.
- `flex-wrap` plus `gap` made the header adapt to narrow screens.

## 7. Flexbox gotchas

- **Only direct children are flex items.** `display: flex` on a list does not affect the text inside each `<li>`.
- **`justify-content` and `align-items` do nothing** when there is no free space in that direction. For `align-items` to matter, the container needs extra height (`min-height`, a taller sibling...). For `justify-content: space-between` the items must not fill the line.
- **Long text or wide pictures in a flex item can overflow**, because a flex item won't shrink below its content's minimum size. The cure is `min-width: 0` on the item (and `overflow-wrap: anywhere` for text).
- **`gap`** is better than margins: no extra space at the ends, and it works with wrapping.
- **Don't use Flexbox for a grid of cards** with rows *and* columns. Use Grid (next lesson). Flexbox is for a *line* of things: menus, toolbars, button rows, a label next to an input, centering one thing inside another.
- **Centering anything, anywhere:**
  ```css
  .parent { display: flex; justify-content: center; align-items: center; }
  ```

## 🧪 Try it yourself

1. In DevTools, click the little **flex** badge next to `.header-inner` in the Elements pane. The browser draws an overlay of the axes and free space. Do the same for `nav ul`.
2. Change `.header-inner`'s `justify-content` to `center`, then `flex-end`, `space-around`. Which one would you keep?
3. Remove `justify-content` and instead write `nav { margin-left: auto; }`. The result is the same: auto margins!
4. Add `flex-direction: column;` to `nav ul`. Now try `align-items: flex-end`. Which axis moved?
5. Add `order: -1;` to the `nav` rule (or give `.brand` `order: 2`). The visual order changes, but press **Tab**: the keyboard order doesn't. Why is that a caution? (Visual order and reading order should match.)
6. Give `.actions a:first-child` `flex: 1;`. The first button fills the free space.
7. Turn off `flex-wrap` on the header and shrink the window. What squeezes? What overflows?
8. Add a long word to a flex item, such as `Supercalifragilisticexpialidocious`, and see what happens. Then add `min-width: 0` to the item.
9. Finish all **8 levels** of the [Flexbox challenges](playgrounds/flexbox-challenges.html) if you have not.

## ✅ Check yourself

<details>
<summary>1. A row of items needs to be centered horizontally <em>and</em> vertically in a tall box. Which two properties?</summary>

On the container: `display: flex; justify-content: center; align-items: center;` (the container needs some height).
</details>

<details>
<summary>2. When <code>flex-direction</code> is <code>column</code>, which property controls the vertical placement of the items?</summary>

`justify-content`. It always follows the *main axis*, and in a column the main axis is vertical.
</details>

<details>
<summary>3. What does <code>flex: 1</code> mean?</summary>

`flex-grow: 1; flex-shrink: 1; flex-basis: 0%`: the item can grow to share the free space equally with other `flex: 1` items.
</details>

<details>
<summary>4. Why did the page footer need <code>main { flex: 1 }</code>?</summary>

`body` is a column flex container at least as tall as the window. `flex: 1` lets `main` grow to take all the leftover height, which pushes the footer to the bottom.
</details>

<details>
<summary>5. What is the difference between <code>gap</code> and <code>margin</code> for spacing flex items?</summary>

`gap` only puts space *between* items (not at the edges), is set once on the container, and works with wrapped lines. Margins are set per item and add space at the ends too.
</details>

## Recap

- `display: flex` on the parent turns its children into flex items laid out along one axis.
- `justify-content` = the main axis; `align-items` = the cross axis; `flex-direction` swaps them; `flex-wrap` and `gap` handle many items.
- On items: `flex` (grow, shrink, basis), `align-self`, `order`, and auto margins.
- Containers nest. A flex item can itself be a flex container.
- Flexbox is for one line of things. For rows *and* columns, use Grid.

➡️ **Next:** [Lesson 11 – CSS Grid](11-css-grid.md)
