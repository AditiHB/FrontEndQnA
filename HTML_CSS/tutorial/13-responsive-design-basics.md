# Lesson 13: Responsive Design Basics

> **Like I'm 5:** Water takes the shape of the glass it is poured into. A **responsive** page is like water: put it in a tiny phone-shaped glass or a huge monitor-shaped glass, and it fills the glass nicely. A page that is **not** responsive is like a block of ice: it only fits one glass, and breaks or overflows in the others.

| | |
|---|---|
| **You will learn** | The three ingredients of responsive design, the viewport meta tag, media queries, **mobile-first** CSS, choosing breakpoints, fluid sizes with `min()`, `max()` and `clamp()`, touch-friendly sizes, and how to test on many screens |
| **You will build** | A site whose hero, story and "Visit us" sections stack on phones and sit side by side on tablets and computers, with fluid headings and finger-sized buttons |
| **Time** | About 2 hours |

## The story

Bunny opens her page on her phone. The menu cards and the form look fine (thank you, Grid), but the hero, the story and the visit sections are **squeezed into two narrow columns**, and a horizontal scroll bar appears. Most of her customers will look at the page on a phone. This is the most important lesson of the course.

## 1. What is responsive design?

One website, **every screen size**: from a 320px-wide phone to a 4K monitor, in portrait or landscape, zoomed in or out. Three ingredients, which together make a page responsive:

1. **A fluid layout.** Widths in `%`, `fr`, `rem` and `max-width`, not fixed pixel widths. (You've done this: containers, Flexbox with wrapping, Grid with `auto-fit`.)
2. **Flexible media.** Pictures and videos that never overflow (`max-width: 100%; height: auto`). (Done in Lesson 5. More in Lesson 15.)
3. **Media queries.** CSS rules that apply **only when the screen has certain features** (a minimum width, a dark theme...). That is today's new tool.

## 2. The viewport meta tag, again

You wrote this in Lesson 1, in the `<head>`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

Without it, phones pretend to be a ~980px-wide desktop screen, and shrink the whole page to fit. With it, the page's width is the **real width of the screen**, and media queries mean what you expect.

**See it:** open `index.html`, switch DevTools to a phone (device toolbar), then comment out the `<meta name="viewport" …>` line (`<!-- … -->`) and reload. The page becomes a tiny, zoomed-out desktop page. Remove the comment markers again. Never ship without it.

## 3. Test on many screen sizes

You can't own every phone. These tools get you close:

| Tool | How |
|------|-----|
| **DevTools device toolbar** | `Ctrl+Shift+M` (Cmd+Shift+M on Mac). Choose a device, or **drag the edge** of "Responsive" mode to any width. Drag slowly from 320px up to 1400px and watch where the layout breaks |
| **Rotate** | The toolbar has a "rotate" button: portrait and landscape are different widths |
| **Zoom** | Zoom the page to 200% and 400%: a narrow window is exactly what zooming makes. People with low vision do this all the time |
| **Throttling** | In the toolbar and in the Network tab, simulate a slow network and a slow CPU |
| **A real phone** | The only way to feel how it really is. Many editors can serve your page on your Wi-Fi |
| **Hunting an overflow** | Paste this in the Console. It lists every element that sticks out of the right edge of the page: `[...document.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > document.documentElement.clientWidth)` |

The main width ranges to look at: **320px** (the smallest phones), **375 to 430px** (most phones), **768px** (tablets), **1024px** (small laptops) and **1280px and up**. These aren't rules, just good places to look.

## 4. Media queries

A media query is an `@media` rule with a condition. Everything inside applies only when the condition is true:

```css
@media (min-width: 48rem) {
  .hero {
    grid-template-columns: 1.1fr 1fr;
  }
}
```

"**When the window is at least 48rem (768px) wide**, make the hero two columns."

| Condition | True when |
|-----------|-----------|
| `(min-width: 48rem)` | The width is 48rem **or more** |
| `(max-width: 47.99rem)` | The width is **less** than 48rem |
| `(width >= 48rem)` | The modern "range syntax": the same as `min-width`. Supported in all current browsers. `(40rem <= width < 64rem)` also works |
| `(min-width: 40rem) and (max-width: 63.99rem)` | Between 40rem and 64rem |
| `(orientation: landscape)` | The window is wider than it is tall |
| `(hover: hover)` | The main input can hover (a mouse), unlike a finger |
| `(prefers-color-scheme: dark)` | The person chose a dark theme (Lesson 15) |
| `(prefers-reduced-motion: reduce)` | The person asked for less motion (Lesson 9) |
| `print` | When printing |

Good habits:

- **Write breakpoints in `rem` (or `em`).** In a media query these units are based on the browser's default text size (usually 16px), not on your CSS. People who enlarge their text get the tablet layout *sooner*, which is exactly what they need. `48rem` is 768px for most people.
- **Put your breakpoints at the places where your *content* breaks**, not at the sizes of this year's phones. Drag the window and see where it looks bad, then add a breakpoint there.
- **Use few breakpoints.** Two or three are enough for most pages. Every query is more CSS to keep consistent.

## 5. Mobile-first

There are two ways to write responsive CSS:

```text
 Desktop-first                                  Mobile-first  ◄── recommended
 ────────────────────────────                   ────────────────────────────
 base rules: for big screens                    base rules: for phones (one simple column)
 @media (max-width: …) { undo and simplify }    @media (min-width: …) { add more as space allows }
```

**Mobile-first** means: write the CSS for the smallest screen first (it is the simplest: one column, normal flow), then use `min-width` queries to **add** complexity as the screen grows. Why?

- Phones download less CSS that they then have to ignore.
- The simple layout is the *default*, so nothing breaks if a query fails.
- It is easier to add (two columns) than to take away (undo a desktop layout).
- Most visitors are on phones.

## 6. Fluid sizes: `min()`, `max()` and `clamp()`

Between two breakpoints you don't want sizes to jump. CSS can calculate:

| Function | Means | Example |
|----------|-------|---------|
| `min(a, b)` | The smaller of the two | `width: min(100%, 40rem)`: full width, but never over 40rem |
| `max(a, b)` | The bigger of the two | `padding: max(1rem, 5vw)` |
| `clamp(min, ideal, max)` | `ideal`, but never under `min` or over `max` | `font-size: clamp(2rem, 1.4rem + 2.6vw, 3rem)` |
| `calc()` | Maths, mixing units | `width: calc(100% - 2rem)` |

`clamp()` is the star: a **fluid heading** that grows smoothly with the window, with a safe floor and ceiling.

```text
 font-size: clamp(2rem, 1.4rem + 2.6vw, 3rem)

 size 48px ┤                              ┌──────────── max: 3rem
           │                         ╱────┘
           │                    ╱────   ◄── grows with the window (1.4rem + 2.6vw)
 32px      ┤──────────────╱────         min: 2rem
           └──┬────────────┬──────────┬────────►  window width
             320px        640px      1000px
```

**Always include a `rem` part** in the middle value (`1.4rem + 2.6vw`, not just `5vw`). Text sized only in `vw` doesn't grow when the person zooms the page or enlarges their text size, which fails the accessibility guidelines. The `rem` part makes sure it does.

## 7. Build: stack on phones, spread on bigger screens

We turn the three squeezed sections into **mobile-first** layouts: first the single column, then a media query that adds the second column.

### The hero

📄 **`styles.css`** (edit these lines)

```diff
 .hero {
   display: grid;
   position: relative;
   overflow: hidden;
   isolation: isolate;
-  grid-template-columns: 1.1fr 1fr;
   align-items: center;
   gap: var(--space-xl);
   margin: var(--space-l) 0 var(--space-m);
-  padding: var(--space-xl);
+  padding: var(--space-l);
```

### The story: the same areas, drawn again for each size

On a phone the story is one column: title, picture, text. The areas are drawn as a stack. On bigger screens we **redraw** the areas with two columns (below, in the media query).

📄 **`styles.css`** (edit these lines)

```diff
 .story {
   display: grid;
-  grid-template-columns: 1fr 1fr;
   grid-template-areas:
-    "title title"
-    "picture text";
-  align-items: center;
-  gap: 0 var(--space-xl);
+    "title"
+    "picture"
+    "text";
+  gap: var(--space-m) var(--space-xl);
 }
```

### The visit section

📄 **`styles.css`** (edit these lines)

```diff
 .visit {
   display: grid;
-  grid-template-columns: repeat(2, 1fr);
   gap: 0 var(--space-xl);
 }
-
-.visit h2 {
-  grid-column: 1 / -1;
-}
```

### The media query that adds the columns

📄 **`styles.css`** (add to the bottom)

```css
/* ========== Bigger screens (mobile-first) ========== */
/* The rules above are for phones. These add the columns from 48rem (768px) up. */
@media (min-width: 48rem) {
  .hero {
    grid-template-columns: 1.1fr 1fr;
    padding: var(--space-xl);
  }

  .story {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "title title"
      "picture text";
    align-items: center;
  }

  .visit {
    grid-template-columns: repeat(2, 1fr);
  }

  .visit h2 {
    grid-column: 1 / -1;
  }
}
```

Save and refresh. Open the device toolbar and drag the width slowly:

- **Below 768px:** the hero, the story and the visit section are single columns. No horizontal scroll bar.
- **At 768px and above:** two columns, exactly like before.

### Fluid headings and a lead paragraph

📄 **`styles.css`** (edit these lines)

```diff
 h1 {
-  font-size: 2.5rem;
+  font-size: clamp(2rem, 1.4rem + 2.6vw, 3rem);
   letter-spacing: -0.01em;
 }
 
 h2 {
-  font-size: 2rem;
+  font-size: clamp(1.6rem, 1.3rem + 1.4vw, 2rem);
 }
@@
 .lead {
   color: var(--brown-soft);
-  font-size: 1.25rem;
+  font-size: clamp(1.1rem, 1rem + 0.5vw, 1.25rem);
 }
```

Drag the window width and watch the main heading change size smoothly, instead of jumping.

### Safe on the tiniest screens

The `minmax(16rem, 1fr)` in the menu grid has a flaw: if a screen is narrower than 16rem + the page padding (about 288px), a column can't shrink below 16rem and sticks out. `min(16rem, 100%)` means "16rem, or the whole width if that is smaller":

📄 **`styles.css`** (edit these lines)

```diff
-  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
+  grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr));
@@
-  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
+  grid-template-columns: repeat(auto-fit, minmax(min(14rem, 100%), 1fr));
```

### Finger-sized targets

Fingers are bigger than mouse pointers. Guidelines recommend touch targets of about **44 by 44 pixels** (the minimum in WCAG 2.2 is 24px). Make the buttons and the navigation links tall enough:

📄 **`styles.css`** (edit these lines)

```diff
 nav a {
+  display: inline-flex;
+  align-items: center;
+  min-height: 2.75rem;
   color: var(--brown);
@@
 .button {
-  display: inline-block;
-  padding: 0.75rem 1.25rem;
+  display: inline-flex;
+  align-items: center;
+  justify-content: center;
+  min-height: 2.75rem;
+  padding: 0.5rem 1.25rem;
   border: 2px solid var(--berry);
```

`2.75rem` is 44px at the normal text size, and it grows with the text size. (Each `.button` is now a small flex container, which centers its text vertically.)

## 8. What just happened?

```text
                phones (< 768px)                         tablets and up (≥ 768px)
  ┌────────────────────┐                        ┌─────────────────────────────────────┐
  │ header (wraps)     │                        │ header                              │
  ├────────────────────┤                        ├─────────────────────────────────────┤
  │ hero text          │                        │ hero text          │ hero picture   │
  │ hero picture       │                        ├────────────────────┴────────────────┤
  ├────────────────────┤        ──────►         │ menu: 3 cards in a row (auto-fit)   │
  │ menu: 1 card/row   │                        ├────────────────────┬────────────────┤
  ├────────────────────┤                        │ story picture      │ story text     │
  │ story picture      │                        ├────────────────────┼────────────────┤
  │ story text         │                        │ hours              │ address        │
  │ …                  │                        │ …                                    │
  └────────────────────┘                        └─────────────────────────────────────┘
```

Three techniques worked together, and you should know when to use each:

| Technique | Used for | Example here |
|-----------|----------|--------------|
| **Intrinsic layout** (no query): `auto-fit`, `minmax()`, `flex-wrap`, `clamp()` | Things that can adapt *themselves* | Menu cards, form fields, header wrapping, headings |
| **Media query** | Big structural changes at a chosen width | One column → two columns |
| **Container query** | A component that adapts to *its own box* (Lesson 14) | Cards |

Reach for the intrinsic tools first; they need no breakpoints. Add a media query when the layout needs to **change shape**.

## 9. Responsive checklist

Before you call a page "responsive", check at 320, 375, 768, 1024 and 1440px:

- [ ] No horizontal scroll bar at any width (the main sign of a broken layout).
- [ ] Text is readable without zooming (at least 16px for body text), lines aren't too long (65ch) or too short.
- [ ] Everything you tap is at least about 44px tall, with room around it.
- [ ] Pictures fit and aren't squashed or blurry.
- [ ] It still works at 200% zoom and with a larger default text size.
- [ ] Landscape works too.
- [ ] Nothing important is hidden on small screens (hiding content is rarely the answer).

## 🧪 Try it yourself

1. Drag the width of the page in the device toolbar. At what exact width does it become a two-column layout? Change the breakpoint to `40rem`, and then to `64rem`. Which looks best? Why?
2. Add a **temporary** rule that shows the active breakpoint, to see it change while you resize:
   ```css
   body::before { content: "phone"; position: fixed; bottom: 0; right: 0; z-index: 999; padding: 0.25rem 0.5rem; background: black; color: white; }
   @media (min-width: 48rem) { body::before { content: "tablet+"; } }
   ```
   Delete it afterwards.
3. Write the same breakpoint with the range syntax, `@media (width >= 48rem)`. It should behave identically.
4. Change `clamp(2rem, 1.4rem + 2.6vw, 3rem)` to `clamp(2rem, 5vw, 3rem)`. Now zoom the page to 300%. What happens to the heading? Why is the `rem` part valuable?
5. Make the hero image **come first** on phones with `.hero-img { order: -1; }`. (Careful: this changes the visual order but not the reading order. Is that acceptable here?)
6. Add `@media (orientation: landscape) and (max-height: 30rem) { .site-header { position: static; } }`. Why might a sticky header be a bad idea on a phone in landscape?
7. In the Console, run the overflow-hunting snippet from section 3 at 320px. What does it list?
8. Set the browser's default text size to "Very large" (in settings) and reload. Is the layout still fine? Which breakpoint did you reach sooner?
9. Add `@media print { .site-header, .site-footer, form { display: none; } }` and look at the print preview (`Ctrl+P`). A tiny rule, a much nicer printout.

## ✅ Check yourself

<details>
<summary>1. What is the difference between <code>min-width</code> and <code>max-width</code> in a media query?</summary>

`(min-width: 48rem)` is true when the window is *at least* 48rem wide (so it applies to wider screens). `(max-width: 48rem)` is true when it is *at most* 48rem wide (so it applies to narrower ones).
</details>

<details>
<summary>2. What does "mobile-first" mean, and why is it recommended?</summary>

Write the base CSS for phones (the simplest layout) and use `min-width` queries to add columns and extras on bigger screens. It sends less to phones, is simpler to maintain, and works as a safe fallback.
</details>

<details>
<summary>3. What does <code>clamp(1rem, 2.5vw, 2rem)</code> return when the viewport is 400px wide? And 1200px?</summary>

At 400px, `2.5vw` is 10px, which is below the minimum, so the result is `1rem` (16px). At 1200px, `2.5vw` is 30px, which is between the limits, so the result is 30px. It stops growing at `2rem` (32px), from a width of 1280px.
</details>

<details>
<summary>4. Why write breakpoints in <code>rem</code> instead of <code>px</code>?</summary>

In media queries `rem` follows the browser's default text size. People who enlarge their text reach the larger layout sooner, which gives their bigger text the space it needs.
</details>

<details>
<summary>5. A page has a horizontal scroll bar on phones only. How do you find the culprit?</summary>

Resize to the problem width and, in DevTools, look for elements wider than the viewport (the Console snippet from section 3), or toggle elements off one by one. Common causes: a fixed `width` in px, an image without `max-width: 100%`, long unbroken text, a wide table, or `100vw` (which includes the scroll bar).
</details>

## Recap

- Responsive design: fluid layouts, flexible media, and media queries.
- Always have `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- Write **mobile-first**: base CSS for phones, `@media (min-width: …)` to add more on larger screens. Use `rem` for breakpoints and choose them where your content breaks.
- Use intrinsic tools first (`auto-fit`, `minmax()`, `flex-wrap`, `clamp()`); use media queries for big structural changes.
- `clamp(min, ideal, max)` makes fluid text and spacing: include a `rem` part so zoom works.
- Touch targets of about 44px, no horizontal scrolling, and test at many widths, with zoom.

➡️ **Next:** [Lesson 14 – Responsive layouts](14-responsive-layouts.md)
