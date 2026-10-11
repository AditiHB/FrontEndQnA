# Lesson 12: Positioning and Stacking

> **Like I'm 5:** Imagine a table with sheets of paper on it. Usually the sheets lie in a neat pile, one under the other (**normal flow**). But sometimes you want to **stick a note on a corner** of a sheet (`absolute`), keep a note **glued to the screen** while you scroll (`fixed`), or have a title that **follows you** until you reach the end of the page (`sticky`). And when two papers overlap, you need to say **which one is on top** (`z-index`).

| | |
|---|---|
| **You will learn** | `position` (`static`, `relative`, `absolute`, `fixed`, `sticky`), `top` / `right` / `bottom` / `left` / `inset`, the containing block, `z-index` and stacking contexts, `isolation`, `scroll-margin` |
| **You will build** | A header that sticks to the top while you scroll, a "skip to content" link that appears when you press Tab, a "New" badge on a card, and a soft decoration behind the hero |
| **Time** | About 75 minutes |

## The story

Bunny wants four small touches. Her menu should stay in reach while visitors scroll the long page. The "Skip to the content" link, which is now ugly and always visible, should only show up for people who use the keyboard. Her carrot cupcake is new this week and deserves a "New" badge in the corner of its card. And the hero needs a soft glow behind it. All four are about **where things go** and **what covers what**.

## 1. Normal flow, and leaving it

Everything so far has been in the **normal flow**: blocks stack down, inline things run along the line, and flex and grid arrange their children. This is `position: static`, the default. It is the right choice for 95% of the page.

The `position` property lets an element step out of it:

| Value | Where does the element go? | Does it leave a hole? |
|-------|----------------------------|----------------------|
| `static` | Normal flow (the default). `top`, `left`... do nothing | – |
| `relative` | Normal flow, **then shifted** by `top`/`left`... from where it would have been. Its old space stays reserved | No: the space stays |
| `absolute` | **Removed** from the flow; placed relative to its **containing block** (see below) | Yes: siblings close the gap |
| `fixed` | Removed from the flow; placed relative to the **window** and **stays there** when you scroll | Yes |
| `sticky` | Normal flow until you scroll to a limit (`top: 0`), then it **sticks** there while its parent is on screen | No |

The offsets are `top`, `right`, `bottom`, `left` (distances from the matching edge of the containing block). `inset: 0` is the shorthand for `top: 0; right: 0; bottom: 0; left: 0` (stretch to all four edges), and `inset: 1rem 2rem` works like margin: vertical and horizontal.

### The containing block: the rule you must know

An `absolute` element is positioned relative to its **nearest ancestor that is not `static`** (that has any `position` other than `static`). If there is none, it is placed relative to the page.

```text
 ┌─ .card  { position: relative }  ◄── "the anchor": any non-static position works
 │   ┌────────┐
 │   │ .badge │ { position: absolute; top: -0.6rem; right: 1rem }   ──► measured from the CARD's edges
 │   └────────┘
 │   Sourdough loaf ...
 └────────────────────────
```

So the usual recipe is: **`position: relative` on the parent (just to be the anchor), `position: absolute` on the child.** Forgetting the first part is the most common positioning bug: the badge flies off to a corner of the whole page.

### When to use which

- **`relative`**: as an anchor for an absolute child, and (rarely) for a small visual nudge.
- **`absolute`**: badges, icons in the corner of a box, overlays, tooltips and decorations that should not take up space.
- **`fixed`**: things glued to the window: a cookie banner, a "chat" button.
- **`sticky`**: headers, table headings, a side menu that follows you.
- **Never use `absolute` to lay out a page.** That is the job of Flexbox and Grid, and absolute layouts break on every other screen size.

## 2. Stacking: what is on top?

When two boxes overlap, the browser paints them in this order, from back to front:

```text
  back   1. backgrounds and borders of the stacking context itself
    │    2. children with a NEGATIVE z-index
    │    3. normal-flow (static) elements, in HTML order
    │    4. positioned elements with z-index: auto (or 0), in HTML order
    ▼    5. children with a POSITIVE z-index (bigger numbers on top)
  front
```

Two surprising consequences:

1. **A positioned element is painted above a non-positioned one**, even if it comes earlier in the HTML. (That is why a `position: relative` card can cover a sticky header, as you will see.)
2. **`z-index` only works on positioned elements** (and on flex and grid items). Writing `z-index: 999` on a `static` block does nothing.

### Stacking contexts: z-index is local

A **stacking context** is a self-contained "layer group". Everything inside it is stacked among itself, and the whole group is then placed as one block among the group's siblings. A `z-index: 9999` inside a group with the lowest level will never climb above a sibling group.

Things that **create** a stacking context: the root `<html>`; `position: fixed` or `sticky`; a positioned element with a numeric `z-index`; a flex or grid item with a numeric `z-index`; `opacity` below 1; any `transform`, `filter`, `perspective`; `isolation: isolate`; `will-change: transform`.

The classic bug: *"I set `z-index: 9999` and it still goes behind!"* The element is inside a stacking context that is below the other one. The cure is usually to put the `z-index` on the **parent** that creates the context, or to give the right parent `isolation: isolate`.

**Use small numbers and name them.** A site rarely needs more than a handful of layers: `1` (raised), `10` (sticky header), `100` (the skip link), `1000` (a modal dialog).

## 3. Build: a sticky header

We start with the easy one. Add two lines to the header:

📄 **`styles.css`** (edit these lines)

```diff
 .site-header {
+  position: sticky;
+  top: 0;
   padding: 0.75rem 0;
```

Save and refresh. Scroll the page: **the header stays glued to the top of the window**. `sticky` needs a `top` to know *where* to stick; `top: 0` means "stick at the very top".

(Sticky has a few conditions: none of its parents may have `overflow: hidden/auto/scroll` (they would become the scrolling box), and it only sticks while its own parent is on screen. Our `<header>` is a direct child of `<body>`, so it sticks all the way.)

## 4. Build: a "New" badge, and a bug to find

The carrot cupcake is new this week. Add a badge to its card. In `index.html`:

📄 **`index.html`** (edit these lines)

```diff
             <h3>Carrot cupcake</h3>
+            <span class="badge">New</span>
             <p>Spiced sponge, cream-cheese frosting and a tiny candied carrot.</p>
```

Then the card becomes the anchor and the badge floats in its corner:

📄 **`styles.css`** (edit these lines)

```diff
 .cards li {
   display: flex;
   flex-direction: column;
+  position: relative;
   padding: var(--space-m);
```

📄 **`styles.css`** (add to the bottom)

```css
/* ========== Positioning ========== */

/* The "New" badge sits on the top right corner of its card */
.badge {
  position: absolute;
  top: -0.6rem;
  right: var(--space-m);
  padding: 0.15rem 0.7rem;
  border-radius: var(--radius-pill);
  background-color: var(--butter);
  color: var(--brown);
  font-size: 0.8rem;
  font-weight: 700;
  transform: rotate(4deg);
}
```

Refresh. The carrot cupcake card has a little yellow "New" ribbon, sticking out of the top edge, in its right corner. The card is `relative` (the anchor), the badge is `absolute` and is placed with `top` and `right`.

### 🐞 Now find the bug

Scroll the page slowly so that the menu cards pass **under the sticky header**. **The cards are painted on top of the header!** Why? Both the header and the cards are *positioned* with `z-index: auto`, and when two positioned elements overlap, the **later one in the HTML** is on top. The cards come after the header in the HTML.

The fix is to give the header a layer that is clearly above the page content:

📄 **`styles.css`** (edit these lines)

```diff
 .site-header {
   position: sticky;
   top: 0;
+  z-index: 10;
   padding: 0.75rem 0;
```

Scroll again: the header now stays above everything. (This is why it is good to scroll your whole page every time you add a `position`.)

## 5. Build: a skip link that appears on demand

Back in Lesson 3 you added a "Skip to the content" link. It is useful for keyboard users and distracting for everybody else. Move it off the top of the screen, and bring it back when it gets focus:

📄 **`styles.css`** (add to the bottom)

```css
/* The skip link hides above the window, and drops down when it gets keyboard focus */
.skip-link {
  position: absolute;
  top: -4rem;
  left: var(--space-m);
  z-index: 100;
  padding: 0.5rem 1rem;
  border-radius: 0 0 var(--radius) var(--radius);
  background-color: var(--berry);
  color: var(--white);
  font-weight: 700;
}

.skip-link:focus {
  top: 0;
}
```

Reload, and press **Tab** once. The link slides into view at the top-left corner. Press **Tab** again and it goes away. Press Tab, then **Enter** to jump to the main content.

(We moved the link with `top`, not `display: none`: a `display: none` link can't get keyboard focus at all, so it would defeat its own purpose. Hiding things *visually* but keeping them for the keyboard and screen readers is a useful trick.)

## 6. Build: a glow behind the hero

A decoration should not need extra HTML. A **pseudo-element** (`::before`) can be positioned and stacked just like a real one. We place a soft yellow circle in the top right corner of the hero, **behind** the content:

📄 **`styles.css`** (edit these lines)

```diff
 .hero {
   display: grid;
+  position: relative;
+  overflow: hidden;
+  isolation: isolate;
   grid-template-columns: 1.1fr 1fr;
```

📄 **`styles.css`** (add to the bottom)

```css
/* A decoration made only of CSS: no extra HTML */
.hero::before {
  content: "";
  position: absolute;
  top: -6rem;
  right: -6rem;
  z-index: -1;
  width: 20rem;
  height: 20rem;
  border-radius: 50%;
  background: radial-gradient(circle, var(--butter) 0%, transparent 70%);
  opacity: 0.6;
}
```

Look at the lines you just added to `.hero`:

- `position: relative` makes the hero the anchor for the glow.
- `overflow: hidden` clips the glow, which sticks out of the box, at the hero's rounded corners.
- `isolation: isolate` makes the hero its **own stacking context**. Without it, the glow, with `z-index: -1`, would slip *behind the hero's own background* and become invisible. With it, "behind the content" means "behind the hero's text and picture but in front of the hero's background". Try removing `isolation: isolate` and see.

`content: ""` is required: a pseudo-element with no `content` is not created at all.

## 7. Build: scrolling to the right spot

Now that the header sticks, the navigation links have a problem. Click "Visit" in the header: the browser scrolls the "Visit us" heading to the very top of the window, **under the sticky header**. Two small rules fix it, and a third makes the scroll smooth:

📄 **`styles.css`** (edit these lines)

```diff
 main > section {
   padding: var(--space-xl) 0;
+  scroll-margin-top: 5rem;
 }
```

📄 **`styles.css`** (add to the bottom)

```css
/* Smooth scrolling, but only for people who have not asked for less motion */
@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}
```

`scroll-margin-top` tells the browser "when you scroll to this element, leave 5rem of space above it". Click the links in the header now: each section stops just under the sticky bar.

## 8. What just happened?

```text
 Painting order of the page now (back → front):

    body background and static content (the sections, text, images)
    positioned content, in HTML order: cards (position: relative), badge (absolute)
    ─────────────────────────────────────────────────────
    .site-header   (sticky, z-index: 10)         ◄── above all of the page content
    .skip-link     (absolute, z-index: 100)      ◄── above everything, when focused

    Inside .hero (its own stacking context, thanks to isolation):
       .hero's own background
       .hero::before  (z-index: -1: behind the content, in front of the background)
       text and image
```

DevTools can show you stacking: in Chrome, **More tools → Layers**, or just toggle `z-index` values live in the Styles pane.

## 9. Positioning gotchas

- **`position: absolute` with no positioned parent** puts the element relative to the page. Add `position: relative` to the parent.
- **Absolute elements don't take space.** The parent doesn't know about them, and may collapse or overlap.
- **`z-index` needs `position`** (or a flex/grid item). And every `z-index` is local to its stacking context.
- **`position: fixed` can disappear on small screens or when zoomed in** and cover the content. Test with zoom at 200% and 400%.
- **`position: sticky` fails** if a parent has `overflow` other than `visible`, or if you forget `top`.
- **Don't center with `top: 50%; left: 50%; transform: translate(-50%, -50%)`** unless you must. `display: grid; place-items: center` is simpler.
- **Hidden is not gone.** `display: none` and `visibility: hidden` remove an element from keyboard and screen-reader access; an element moved off-screen with `top: -4rem` stays reachable. Choose on purpose.

## 🧪 Try it yourself

1. Remove `position: relative` from `.cards li`. Where does the "New" badge go? Put it back.
2. Change the badge to `top: 0; right: 0; transform: none;`. Then try `bottom: -0.6rem; left: 1rem;`.
3. Give the badge `z-index: -1`. Does it vanish behind the card's white background? (The card has `transform` on hover, which also creates a stacking context.)
4. Use `inset: 0;` on `.hero::before` with `width: auto; height: auto;` so that the glow covers the whole hero. Reduce `opacity`.
5. Make the **header** `position: fixed; top: 0; left: 0; right: 0;` instead of sticky. What happens to the content under it? (It slides under it, because a fixed element leaves no space.) Put `sticky` back.
6. Make the tip box (`.tip`) `position: fixed; bottom: 1rem; right: 1rem; width: 16rem;`. Scroll. Remove it.
7. Make table headings sticky: `th { position: sticky; top: 4rem; background: var(--cream); }`. Scroll the long order form... or add more rows. (This is how data tables keep their headings.)
8. Remove `isolation: isolate` from `.hero` and see where the glow goes.
9. Press **Tab** through the whole page and watch the focus ring. Is the focused link ever hidden under the sticky header? (Modern browsers scroll it into view, and `scroll-margin-top` helps.)

## ✅ Check yourself

<details>
<summary>1. What is the "containing block" of an <code>absolute</code> element?</summary>

Its nearest ancestor that has a `position` other than `static`. If there is none, it is the initial containing block (the page).
</details>

<details>
<summary>2. What is the difference between <code>relative</code> and <code>absolute</code>?</summary>

`relative` keeps the element in the flow (its old space stays reserved) and shifts it from its normal spot. `absolute` removes it from the flow entirely and places it relative to the nearest positioned ancestor.
</details>

<details>
<summary>3. A sticky header has <code>top: 0</code> but doesn't stick. Name two possible reasons.</summary>

An ancestor has `overflow` set to `hidden`, `auto` or `scroll`; the parent is too short (it sticks only while its parent is on screen); or the `top` value is missing.
</details>

<details>
<summary>4. Why can <code>z-index: 9999</code> still be behind another element?</summary>

`z-index` is only compared inside the same stacking context. If the element lives in a stacking context that is below the other one, no number inside it will lift it above.
</details>

<details>
<summary>5. Why is the skip link moved with <code>top: -4rem</code> and not hidden with <code>display: none</code>?</summary>

A `display: none` element cannot receive keyboard focus at all, so keyboard users could never reach it. Moving it off-screen keeps it focusable, and `:focus` brings it into view.
</details>

## Recap

- `position`: `static` (default), `relative` (shifted, space kept), `absolute` (out of flow, relative to the nearest positioned ancestor), `fixed` (stuck to the window), `sticky` (flows until a limit, then sticks).
- The recipe for badges and decorations: `position: relative` on the parent, `position: absolute` and offsets on the child.
- `z-index` only works on positioned (or flex/grid) elements and only inside one stacking context. Use `isolation: isolate` to create one on purpose. Keep the numbers small.
- Never lay out a page with absolute positioning: use Flexbox and Grid.
- `scroll-margin-top` keeps anchored sections out from under a sticky header.

➡️ **Next:** [Lesson 13 – Responsive design basics](13-responsive-design-basics.md)
