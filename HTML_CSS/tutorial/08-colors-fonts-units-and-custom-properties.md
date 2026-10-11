# Lesson 8: Colours, Fonts, Units and Custom Properties

> **Like I'm 5:** You have a paint box with a few paints you really like. Instead of mixing the pink again each time you paint, you write "**berry**" on one jar and always use that jar. If you later change the jar to teal, *everything painted with berry* changes at once. That jar is a **custom property**.

| | |
|---|---|
| **You will learn** | Colour formats (names, hex, `rgb()`, `hsl()`, `oklch()`), transparency, contrast; font stacks, sizes, weights and line height; `px`, `rem`, `em`, `%`, `ch`, `vw`, `vh`; custom properties (`--name` and `var()`) |
| **You will build** | A set of **design tokens** (colours, fonts, spaces) that the whole stylesheet uses, plus a proper type scale |
| **Time** | About 90 minutes |

## The story

Bunny has used the same berry-pink `#b3365f` in nineteen places. Tomorrow she may want a slightly different pink. Changing nineteen places is a recipe for mistakes. And her text sizes are all "whatever the browser decided". Time to choose a **palette** and a **type scale**, and to write each choice down once.

## 1. Colours

CSS has several ways to write the same colour. All of these are the exact same berry pink:

```css
color: #b3365f;               /* hex: red, green, blue as 2 hexadecimal digits each */
color: rgb(179 54 95);         /* red, green, blue from 0 to 255 */
color: hsl(340 54% 46%);       /* hue (0-360 on the colour wheel), saturation, lightness */
color: oklch(0.528 0.163 5);   /* modern: perceived lightness, chroma, hue */
```

| Format | Good for |
|--------|----------|
| **Names** (`tomato`, `rebeccapurple`, `transparent`, `currentColor`) | Quick tests and a few special words |
| **Hex** `#rrggbb` (`#rgb` for short) | What design tools give you; the most common |
| **`rgb()`** | When you need to add transparency or compute with numbers |
| **`hsl()`** | When you want to *think* about colour: "the same hue, but lighter" means changing only the last number |
| **`oklch()`** | Modern, evenly-bright colour changes. Supported in all current browsers |

### Transparency

Add a slash and an **alpha** value from `0` (invisible) to `1` (solid):

```css
background-color: rgb(179 54 95 / 0.15);   /* berry, 15% opaque */
background-color: hsl(340 54% 46% / 15%);  /* the same, with hsl */
```

Two special values: `transparent` (fully clear) and **`currentColor`** ("whatever the text colour is right now"). `border: 2px solid currentColor;` gives a border that always matches the text.

### Contrast: can people read it?

Text must stand out from its background. The **WCAG** guideline asks for a **contrast ratio** of at least **4.5 : 1** for normal text, and **3 : 1** for large text (about 24px, or 19px bold) and for the edges of controls. Contrast matters for *everyone*: tired eyes, bright sunlight, small screens, and most of all people with low vision or colour blindness.

The Bunny Bakery palette, measured:

| Text | Background | Ratio | Result |
|------|-----------|:-----:|--------|
| Brown `#4a2c17` | Cream `#fff8f0` | **11.98** | Excellent |
| Berry `#b3365f` | Cream `#fff8f0` | **5.52** | Passes |
| Berry `#b3365f` | White | **5.82** | Passes |
| Soft brown `#7a5a44` | Cream | **5.91** | Passes |
| Butter `#ffd166` | Brown `#4a2c17` | **8.75** | Excellent (yellow text in the dark footer) |
| Butter `#ffd166` | Cream | **1.37** | **Fails**: never yellow text on cream |
| Grey `#a0a0a0` | White | **2.61** | **Fails**: the classic "pretty but unreadable" grey |

Check any colour yourself: in DevTools click a colour square in the Styles pane. The colour picker shows the **contrast ratio** and tells you whether it passes (AA / AAA). Also, never use colour *alone* to mean something: a red border on an error should come with an error message.

## 2. Fonts and text

| Property | What it does | Example |
|----------|--------------|---------|
| `font-family` | The typeface: a **stack** from first choice to a generic fallback | `Georgia, "Times New Roman", serif` |
| `font-size` | How big | `1.25rem` |
| `font-weight` | Thickness: `400` normal, `600` semi-bold, `700` bold | `700` |
| `font-style` | `normal`, `italic` | `italic` |
| `line-height` | Space between lines. A unitless number is a multiple of the font size | `1.6` |
| `letter-spacing` | Space between letters | `-0.01em`, `0.05em` |
| `text-align` | `left`, `center`, `right` | `center` |
| `text-transform` | `uppercase`, `capitalize` | `uppercase` |
| `text-decoration` | Underline, `none`... | `underline` |
| `text-wrap` | `balance` makes headings break nicely (Lesson 16) | `balance` |

**Font stacks.** A computer only has the fonts that are installed. So you give a list: the browser uses the first one it has. The last item should always be a **generic family**: `serif`, `sans-serif`, `monospace`, `system-ui`.

```css
font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;  /* the device's own UI font */
font-family: Georgia, "Times New Roman", serif;                         /* a classic serif */
```

Names with spaces need quotes. The *system* stack is fast (nothing to download) and looks native on every device. We use it for the text, and Georgia for the headings.

**Line length and line height.** Text is easiest to read at **45 to 75 characters per line** and a line height of about **1.4 to 1.7** for body text (headings can be tighter: 1.1 to 1.3). The unit `ch` (the width of a "0") helps: `max-width: 65ch` limits a paragraph to about 65 characters.

> **Web fonts (not used in this course).** To use a font that visitors don't have, you load it from a font file with `@font-face` or from a service such as Google Fonts or Bunny Fonts. Every font file costs download time, so: choose one or two families and only the weights you need, use the `woff2` format, add `font-display: swap` so that text appears at once, and prefer **variable fonts** (one file, many weights). Example:
>
> ```css
> @font-face {
>   font-family: "Fraunces";
>   src: url("fonts/fraunces.woff2") format("woff2");
>   font-weight: 400 800;
>   font-display: swap;
> }
> ```

## 3. Units

| Unit | Is relative to | Use it for |
|------|----------------|-----------|
| `px` | Nothing: a CSS pixel | Thin borders (`1px`), shadows. Avoid for text |
| **`rem`** | The font size of the **root** (`<html>`, 16px by default) | **Font sizes and spacing**: it respects the visitor's own text-size setting |
| `em` | The font size of **this element** | Spacing that should grow with the text, such as button padding or `letter-spacing` |
| `%` | The parent's matching size | Widths: `width: 50%` |
| `ch` | Width of the digit "0" in the current font | Line length: `max-width: 65ch` |
| `vw`, `vh` | 1% of the viewport width / height | Full-screen things. On phones use `dvh` (dynamic viewport height), because the browser toolbars move |
| `fr` | A share of the free space in a grid | Lesson 11 |
| (no unit) | A multiplier | `line-height: 1.6`, `0` |

**Why `rem` for text?** Some people set a bigger default text size in their browser. `font-size: 1.25rem` honours it (1.25 × their size); `font-size: 20px` ignores it. It is a real accessibility win.

```text
 html { font-size: 100% }                  (the visitor's choice; usually 16px)
 1rem    = 16px      1.25rem = 20px       2rem = 32px
 and if the visitor sets their browser to 20px: 1rem = 20px, 2rem = 40px ... everything grows together
```

`em` compounds when nested (an `em` inside an `em` multiplies), which is why we keep `rem` as the default and `em` for a few special things.

**Maths in CSS:** `calc(100% - 2rem)`, `min(100%, 40rem)`, `max(1rem, 3vw)`, `clamp(1rem, 2.5vw, 2rem)` (a value that scales, with a minimum and a maximum). You will use them in Lesson 13.

## 4. Type scale for the bakery

First, the headings. Let's give them real sizes (you'll make them fluid in Lesson 13), and make the lead paragraph calmer:

📄 **`styles.css`** (edit these lines)

```diff
 h1,
 h2,
 h3 {
   font-family: Georgia, serif;
   color: #b3365f;
   line-height: 1.2;
   margin: 0 0 0.5rem;
 }
+
+h1 {
+  font-size: 2.5rem;
+  letter-spacing: -0.01em;
+}
+
+h2 {
+  font-size: 2rem;
+}
+
+h3 {
+  font-size: 1.25rem;
+}
@@
 .lead {
   font-size: 1.25rem;
+  color: #7a5a44;
 }
```

Save and refresh. The headings now have a clear order of importance: 40px, 32px and 20px (on a normal browser setting).

## 5. Custom properties: write each choice down once

A **custom property** (also called a **CSS variable**) is a value that you name yourself. Names start with **two dashes**:

```css
:root {
  --berry: #b3365f;          /* define it */
}

h2 {
  color: var(--berry);       /* use it */
}

.badge {
  color: var(--berry, hotpink);   /* with a fallback if --berry doesn't exist */
}
```

Facts to remember:

- **`:root`** means the `<html>` element. A property defined there is available everywhere. (It is like `html`, but a bit stronger.)
- **Custom properties are inherited**, just like `color`. You can *redefine* one inside a part of the page, and only that part changes:
  ```css
  .dark-section { --berry: #ffd166; }   /* inside .dark-section, "berry" is now yellow */
  ```
- They live in the **browser**, at runtime. (Not like a Sass variable that is replaced before the page is shown.) That means you can change them with media queries, JavaScript, or DevTools, and the page updates immediately. Dark mode (Lesson 15) is built on that.
- They can hold any value: colours, sizes, lists of fonts, shadows. They are written *without* a unit if they are a bare number you multiply later.
- Name them by **meaning**: `--berry`, `--space-m`, `--font-heading`. Not by value: not `--pink-179`.

### Design tokens

A set of custom properties for the colours, fonts and spaces of a site is called **design tokens**. They are the *only* places where actual values appear; the rest of the stylesheet just says `var(--…)`.

Our tokens:

```text
Colours   --brown (text)   --brown-soft (quiet text)   --cream (page)   --white (cards)
          --berry (accent)   --berry-dark (hover)   --butter (highlight)   --butter-pale (tip box)
          --line (soft borders)   --line-strong (form fields)
Fonts     --font-body (system)    --font-heading (Georgia)
Space     --space-s 0.5rem   --space-m 1rem   --space-l 1.5rem   --space-xl 2rem
Size      --page-width 68rem
```

## 6. Put the tokens to work

Replacing every colour in the stylesheet by hand would be 60 small edits, so here is the whole stylesheet again, with the tokens at the top and every colour, font and common space replaced by `var(--…)`. It also gets a bit better organised: headings, links and pictures are grouped under "Base", then "Layout", "Hero and buttons", "Menu", "Tables" and "Forms". Select everything in `styles.css` and replace it with this:

📄 **`styles.css`** (replace everything)

```css
/* Bunny Bakery: styles */

/* ========== Design tokens ========== */
:root {
  /* Colours */
  --brown: #4a2c17;
  --brown-soft: #7a5a44;
  --cream: #fff8f0;
  --white: #fff;
  --berry: #b3365f;
  --berry-dark: #8f2a4c;
  --butter: #ffd166;
  --butter-pale: #fff0d6;
  --line: #e8d5c4;
  --line-strong: #b89a84;

  /* Fonts */
  --font-body: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-heading: Georgia, "Times New Roman", serif;

  /* Space */
  --space-s: 0.5rem;
  --space-m: 1rem;
  --space-l: 1.5rem;
  --space-xl: 2rem;

  /* Sizes */
  --page-width: 68rem;
}

/* ========== Base ========== */

/* Padding and border count inside an element's width and height */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  color: var(--brown);
  background-color: var(--cream);
  font-family: var(--font-body);
  line-height: 1.6;
}

h1,
h2,
h3 {
  margin: 0 0 var(--space-s);
  color: var(--berry);
  font-family: var(--font-heading);
  line-height: 1.2;
}

h1 {
  font-size: 2.5rem;
  letter-spacing: -0.01em;
}

h2 {
  font-size: 2rem;
}

h3 {
  font-size: 1.25rem;
}

/* Text never gets wider than about 65 characters */
p {
  max-width: 65ch;
  margin: 0 0 var(--space-m);
}

a {
  color: var(--berry);
}

/* Pictures: never wider than the space they are in */
img {
  display: block;
  max-width: 100%;
  height: auto;
}

figure {
  margin: 0 0 var(--space-m);
}

figcaption {
  color: var(--brown-soft);
  font-style: italic;
}

address {
  font-style: normal;
}

mark {
  background-color: var(--butter);
  color: inherit;
}

/* Where is the keyboard focus? */
:focus-visible {
  outline: 3px solid var(--berry);
  outline-offset: 3px;
}

/* A little arrow after links that open a new tab */
a[target="_blank"]::after {
  content: " ↗";
}

/* ========== Layout ========== */
.container {
  max-width: var(--page-width);
  margin: 0 auto;
  padding: 0 var(--space-m);
}

main > section {
  padding: var(--space-xl) 0;
}

.site-header {
  padding: 0.75rem 0;
  background-color: var(--white);
  border-bottom: 1px solid var(--line);
}

.brand {
  color: var(--brown);
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: bold;
  text-decoration: none;
}

nav ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

nav a {
  color: var(--brown);
  font-weight: 600;
  text-decoration: none;
}

nav a:hover {
  color: var(--berry);
  text-decoration: underline;
}

.site-footer {
  padding: var(--space-l) 0;
  background-color: var(--brown);
  color: var(--cream);
}

.site-footer a {
  color: var(--butter);
}

/* ========== Hero and buttons ========== */
.lead {
  color: var(--brown-soft);
  font-size: 1.25rem;
}

.button {
  display: inline-block;
  padding: 0.75rem 1.25rem;
  margin: 0 var(--space-s) var(--space-s) 0;
  border: 2px solid var(--berry);
  background-color: var(--berry);
  color: var(--white);
  font-weight: 700;
  text-decoration: none;
}

.button:hover {
  background-color: var(--berry-dark);
  border-color: var(--berry-dark);
}

.button-outline {
  background-color: transparent;
  color: var(--berry);
}

.button-outline:hover {
  background-color: var(--berry);
  border-color: var(--berry);
  color: var(--white);
}

/* ========== Menu ========== */
/* Cards are stacked for now: Lesson 11 puts them in a grid */
.cards {
  list-style: none;
  margin: 0 0 var(--space-l);
  padding: 0;
}

.cards li {
  margin-bottom: var(--space-m);
  padding: var(--space-m);
  background-color: var(--white);
  border: 1px solid var(--line);
}

.cards h3,
.cards p {
  margin: 0 0 0.25rem;
}

.price {
  color: var(--berry);
  font-size: 1.125rem;
  font-weight: 700;
}

.tip {
  padding: var(--space-m);
  margin: var(--space-l) 0;
  background-color: var(--butter-pale);
  border-left: 6px solid var(--butter);
}

.tip :last-child {
  margin-bottom: 0;
}

/* ========== Tables ========== */
table {
  width: 100%;
  margin-bottom: var(--space-l);
  border-collapse: collapse;
}

caption {
  padding: var(--space-s) 0;
  font-weight: 700;
  text-align: left;
}

th {
  text-align: left;
}

th,
td {
  padding: var(--space-s) 0.75rem;
  border-bottom: 1px solid var(--line);
}

/* ========== Forms ========== */
button,
input,
select,
textarea {
  font: inherit;
}

fieldset {
  margin: 0 0 var(--space-l);
  padding: var(--space-m);
  border: 1px solid var(--line);
}

legend {
  padding: 0 var(--space-s);
  font-weight: 700;
}

fieldset > div {
  margin-bottom: var(--space-m);
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
  padding: var(--space-s);
  border: 1px solid var(--line-strong);
  background-color: var(--white);
}

textarea {
  resize: vertical;
}
```

Save and refresh. **The page looks (almost) exactly the same**, except for the new sizes: that is the point. You changed *how the stylesheet is written*, not the look. Notice a few things:

- `footer` and `footer a` became `.site-footer` and `.site-footer a`: classes everywhere, remember? (Lesson 6)
- `p { max-width: 65ch; }` keeps paragraphs readable on wide screens.
- Every colour you see in the rest of the file is `var(--something)`.

### The magic moment

Open DevTools, select the `<html>` element and look at the Styles pane: all your tokens are listed under `:root`. **Click the berry colour square** and choose a different colour. The headings, prices, links and the primary button *all change at once.* Reload to undo it. Imagine doing this with 19 separate hex codes!

## 7. What just happened?

```text
          :root { --berry: #b3365f }
                      │  (inherited by every element)
   ┌──────────────────┼───────────────────┬────────────────────┐
   h1,h2,h3          .price             a { color: var(--berry) }    .button { background: var(--berry) }
```

- **One source of truth.** To retheme the site, change the tokens.
- **A shared vocabulary.** "Use `--space-m`" is easier than "use... 1rem? 16px? 15px?".
- **Tokens are the seed of a design system.** Big sites keep them in one file. Tailwind CSS (Lessons 17 and 18) is built on exactly this idea.

## 🧪 Try it yourself

1. In DevTools, change `--berry` to `teal`. Then to `hsl(340 54% 30%)` (darker). Does anything stop passing the contrast check?
2. Write the same colour in three formats: change `--cream` to `rgb(255 248 240)`, then `hsl(30 100% 97%)`. The page should not change.
3. Add `--radius: 0.75rem;` to `:root` and use `border-radius: var(--radius);` on `.cards li`. (More about this in Lesson 9.)
4. Try a fallback: `color: var(--does-not-exist, hotpink);` on `h1`. What colour does it have? Now remove the fallback. What happens to `color`? (It becomes inherited/initial: the declaration is invalid at computed-value time.)
5. Redefine a token for one part: `.site-footer { --butter: white; }`. The footer links change but the rest of the page doesn't.
6. Open the browser's settings, increase the default font size (Chrome: Settings → Appearance → Font size), and reload the page. Everything with `rem` grows. Would it have grown if we had used `px`?
7. Use DevTools' colour picker on the footer link and check the contrast ratio.
8. Change `p { max-width: 65ch; }` to `40ch` and `90ch`. Where do the lines break now?
9. Try `h1 { text-transform: uppercase; letter-spacing: 0.1em; }`. When is this a good idea?

## ✅ Check yourself

<details>
<summary>1. Why prefer <code>rem</code> over <code>px</code> for font sizes?</summary>

`rem` is relative to the root font size, which people can change in their browser settings. Sizes in `rem` respect that choice; sizes in `px` ignore it.
</details>

<details>
<summary>2. What does <code>rgb(179 54 95 / 0.5)</code> mean?</summary>

The berry colour at 50% opacity: the last value (after the slash) is the alpha (transparency).
</details>

<details>
<summary>3. How do you define and use a custom property?</summary>

Define it with two dashes inside a rule (usually `:root`): `--berry: #b3365f;`. Use it with `var(--berry)`, optionally with a fallback: `var(--berry, hotpink)`.
</details>

<details>
<summary>4. What contrast ratio does normal text need to pass WCAG level AA?</summary>

At least 4.5 : 1 (3 : 1 for large text and for UI component edges).
</details>

<details>
<summary>5. Why does a font stack end with a generic family such as <code>sans-serif</code>?</summary>

It is the last fallback: if none of the named fonts is installed on the visitor's device, the browser still picks a font of the right style.
</details>

## Recap

- Colours: hex, `rgb()`, `hsl()`, `oklch()`; alpha for transparency; always check the contrast (4.5 : 1 for text).
- Fonts: a stack ending in a generic family; line height about 1.6 for body text; lines of 45 to 75 characters (`ch`).
- Use `rem` for text and spacing, `em` for things that grow with the text, `%` and `ch` for widths, `px` for hairlines.
- Custom properties (`--name`, `var(--name)`) are inherited, live in the browser, and can be redefined in a part of the page.
- A page's design tokens belong in one place (`:root`), and everything else refers to them.

➡️ **Next:** [Lesson 9 – Backgrounds, borders, shadows and transitions](09-backgrounds-borders-shadows-and-transitions.md)
