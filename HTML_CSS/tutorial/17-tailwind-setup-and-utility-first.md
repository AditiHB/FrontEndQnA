# Lesson 17: Tailwind CSS: Setup and the Utility-First Idea

> **Like I'm 5:** Until now, every time we wanted something pink and round we wrote a new **recipe card** (a CSS rule) with a name, and then used the name. **Tailwind** gives you a big **box of ready-made stickers**: `pink`, `round`, `big`, `padded`. You just stick the stickers you want on each thing, right in the HTML. No recipe cards to write and name.

| | |
|---|---|
| **You will learn** | What Tailwind CSS is and the **utility-first** idea, how it works (it scans your HTML), how to install **Tailwind v4** with its command line tool, the spacing and colour scales, the most common utilities, **variants** (`hover:`, `md:`, `dark:`), arbitrary values, and customising with `@theme` |
| **You will build** | A new project, `bunny-bakery-tailwind`, with its first styled card, and a Bunny Bakery **theme** (colours, fonts and shapes) |
| **Time** | About 2 hours |

## The story

Bunny's cousin builds websites for a living and says: "Nobody writes a stylesheet by hand any more, use **Tailwind**." Is he right? The honest answer: *many* teams use it, many others prefer plain CSS, and it is very useful to **know both**. You wrote the whole bakery in plain CSS, so you understand what is going on under the hood. Now you rebuild it with Tailwind (Lessons 17 and 18) and then compare (Lesson 19).

## 1. The idea: utility-first

Compare two ways to make a pink rounded button.

```html
<!-- Plain CSS: invent a name, then write the rule somewhere else -->
<a class="button" href="#order">Order</a>

.button { padding: 0.5rem 1.25rem; border-radius: 999px; background: #b3365f; color: #fff; font-weight: 700; }
```

```html
<!-- Tailwind: compose the look from small single-purpose classes, in the HTML -->
<a class="rounded-full bg-rose-700 px-5 py-2 font-bold text-white" href="#order">Order</a>
```

Each class does **one small job**: `px-5` is "padding left and right: 1.25rem", `font-bold` is `font-weight: 700`, `rounded-full` is `border-radius: 9999px`. These are called **utility classes**. You do not write the CSS: Tailwind already has it.

| | Plain (semantic) CSS | Utility-first (Tailwind) |
|---|---|---|
| You invent | Class names (`.card`, `.price`) | Nothing: you use ready-made names |
| Styles live | In a stylesheet, away from the HTML | On the element, in the HTML |
| A change needs | Finding the rule, hoping nothing else uses it | Editing the element you are looking at |
| The stylesheet | Grows with every new thing | Stays small (only the classes you used) |
| Consistency | You keep it by discipline (tokens, naming) | Built in: a fixed scale of sizes and colours |
| Downsides | Naming is hard; CSS gets old and nobody dares delete it | Long class lists; you must learn the vocabulary; repeated markup needs components |

Many people dislike it at first sight ("it looks like inline styles!") and like it after a week. The difference from inline styles: utilities have a **design scale** (a limited set of sizes and colours), they can use **states and breakpoints** (`hover:`, `md:`), and they are limited to what you actually use.

## 2. How Tailwind works

```text
   your HTML files                 Tailwind (build step)                  dist/output.css
 ┌───────────────────┐         ┌──────────────────────────────┐        ┌───────────────────────┐
 │ class="px-5 py-2  │  scan   │ 1. read all your files as     │        │ .px-5 { padding... }  │
 │ font-bold md:p-8" │ ──────► │    text, find class names     │ ─────► │ .py-2 { padding... }  │
 │ ...               │         │ 2. generate CSS for ONLY      │        │ .font-bold { ... }    │
 └───────────────────┘         │    the classes it found       │        │ @media (min-width...) │
                               └──────────────────────────────┘        └───────────────────────┘
```

1. Tailwind is a **tool you run**: it **scans** your HTML (and JS) files **as plain text**, looking for class names.
2. For every class it knows, it writes the CSS rule into one output file, `dist/output.css`.
3. Your page links to that file, like any other stylesheet.

Consequences:

- The CSS file contains **only what you use**: usually a few KB, even for large sites.
- **Never build class names by gluing strings** (`"text-" + color + "-500"`): the scanner would not see the full name. Write complete class names.
- **You must re-run the build** when you add a class. In development you run it in **watch mode**, and it rebuilds on every save.

## 3. Create the project

Make a **new folder next to** `bunny-bakery` (go to the folder that *contains* `bunny-bakery`, not into it), so that you can compare both versions later:

```bash
mkdir bunny-bakery-tailwind
cd bunny-bakery-tailwind
```

You need **Node.js** (version 20 or newer; check with `node -v`). Node is only used to **run Tailwind's build tool**: your site is still plain HTML and CSS, and nothing from Node goes to the visitors.

First a small `package.json`, which describes the project and holds two shortcuts (scripts):

📄 **`package.json`** (new file)

```json
{
  "name": "bunny-bakery-tailwind",
  "private": true,
  "scripts": {
    "dev": "tailwindcss -i ./src/input.css -o ./dist/output.css --watch",
    "build": "tailwindcss -i ./src/input.css -o ./dist/output.css --minify"
  }
}
```

Then install Tailwind and its command line tool:

```bash
npm install tailwindcss @tailwindcss/cli
```

This creates a `node_modules` folder (the installed tools; never edit it and never upload it) and adds both packages to `package.json`.

### The input stylesheet

Your own CSS file is the *input*. In Tailwind v4 its first line is all you need:

📄 **`src/input.css`** (new file)

```css
@import "tailwindcss";
```

`@import "tailwindcss"` loads Tailwind's three ingredients: its **theme** (the scales of sizes and colours), its **base** styles (a modern reset, called *Preflight*), and the **utilities**.

### A first page

Now a page that uses only classes. Notice it links to `dist/output.css`, which does not exist yet: the build tool will create it.

📄 **`index.html`** (new file)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bunny Bakery with Tailwind</title>
    <link rel="stylesheet" href="dist/output.css">
  </head>
  <body class="bg-orange-50 p-6 text-stone-800">
    <main>
      <h1 class="text-3xl font-bold text-rose-700">Hello, Tailwind!</h1>
      <p class="mt-2">This page has no stylesheet of its own: only class names.</p>
    </main>
  </body>
</html>
```

### Build it, and keep it building

Run the **dev** script in a terminal. It builds once and then **keeps watching** your files:

```bash
npm run dev
```

Leave it running (open a second terminal for other commands). Whenever you save a file, the CSS is rebuilt in a fraction of a second. Open `index.html` in your browser: a big pink-red heading on a soft orange page. (For a one-time build, use `npm run build`: it also *minifies* the CSS to make it smaller.)

Open `dist/output.css` and look inside. You will see three `@layer` blocks (`theme`, `base`, `utilities`: the cascade layers you met in Lesson 16!) and, at the bottom, only the few rules for the classes you used: `.text-3xl`, `.font-bold`, `.bg-orange-50`... Try adding a class and watch it appear.

## 4. The vocabulary of utilities

Tailwind has hundreds of classes but they follow a **pattern**: `property-value`. Learn the families once.

### Spacing: one scale for everything

`p-4`, `px-6`, `mt-2`, `gap-4`, `w-64`... The number is in **quarters of a rem**: `1` = 0.25rem (4px), `4` = 1rem (16px), `8` = 2rem. The same scale for padding (`p`), margin (`m`), gap, width, height...

| Class | Means |
|-------|-------|
| `p-4` | padding on all sides: 1rem |
| `px-6` / `py-2` | padding left+right: 1.5rem / top+bottom: 0.5rem |
| `pt-2`, `pe-2`, `pb-2`, `ps-2` | top, end, bottom, start (`e` and `s` are logical, like Lesson 16) |
| `m-4`, `mx-auto`, `mt-2`, `-mt-1` | margins (`mx-auto` centers; a minus sign makes it negative) |
| `gap-4`, `gap-x-6`, `gap-y-2` | the gap in flex and grid |
| `space-y-4` | space between the children of this element, vertically |

### Colours: name + shade

`bg-rose-700`, `text-stone-800`, `border-orange-200`: **`property-colour-shade`**, with the shade from `50` (lightest) to `950` (darkest). Add `/` and a number for transparency: `bg-black/50`, `text-rose-700/80`.

### Typography

| Class | Means |
|-------|-------|
| `text-sm`, `text-base`, `text-xl`, `text-3xl` | font sizes (with a matching line height) |
| `font-bold`, `font-semibold`, `font-normal` | weight |
| `leading-snug`, `leading-relaxed` | line height |
| `tracking-tight` | letter spacing |
| `text-center`, `text-start` | alignment |
| `uppercase`, `underline`, `no-underline` | text transform and decoration |
| `font-sans`, `font-serif`, `font-mono` | font family |
| `text-balance`, `text-pretty` | line breaks (Lesson 16) |

### Layout and size

| Class | Means |
|-------|-------|
| `flex`, `grid`, `hidden`, `block`, `inline-flex` | `display` |
| `flex-col`, `flex-wrap`, `items-center`, `justify-between`, `gap-4` | Flexbox (Lesson 10, the same names) |
| `grid-cols-3`, `col-span-2`, `place-items-center` | Grid (Lesson 11) |
| `w-full`, `max-w-sm`, `min-h-11`, `size-10`, `h-dvh` | sizes |
| `mx-auto max-w-4xl` | a centered container |
| `relative`, `absolute`, `sticky top-0`, `z-10`, `inset-0` | positioning (Lesson 12) |

### Looks

`rounded-xl`, `border`, `border-2`, `border-orange-200`, `shadow-md`, `opacity-50`, `transition`, `duration-200`, `bg-linear-to-br from-orange-100 to-white`...

You do not have to memorise them: the documentation (**tailwindcss.com/docs**) has a search box, and the **Tailwind CSS IntelliSense** extension for VS Code suggests class names as you type and shows the CSS behind each one when you hover.

## 5. Build a card

Add a treat card to the page. Read the classes aloud, from left to right: "margin-top 6, flex, maximum width small, items centered, gap 4, rounded extra-large, border, border orange 200, white background, padding 4, medium shadow".

📄 **`index.html`** (edit these lines)

```diff
       <p class="mt-2">This page has no stylesheet of its own: only class names.</p>
+
+      <article class="mt-6 flex max-w-sm items-center gap-4 rounded-xl border border-orange-200 bg-white p-4 shadow-md">
+        <span class="text-4xl" aria-hidden="true">🥐</span>
+        <div>
+          <h2 class="text-xl font-bold text-rose-700">Butter croissant</h2>
+          <p class="text-stone-600">Flaky layers, golden on the outside, tender inside.</p>
+          <p class="mt-2 font-bold text-rose-700">$3.50</p>
+        </div>
+      </article>
     </main>
```

Save (the watcher rebuilds) and refresh. A card, with no CSS written. Compare it with the plain-CSS cards of Lesson 7 or 9: the same ideas (box model, flex, radius, shadow), written as classes.

### Preflight: Tailwind's reset

Look at the heading: Tailwind made it exactly as big as you said, not "browser default big". That is **Preflight**, a built-in reset that removes the browser's own styling: headings and paragraphs lose their sizes and margins, lists lose their bullets, images become `display: block; max-width: 100%`, and links inherit the text colour. Everything is a blank slate that you style yourself. (It is the same idea as the small reset you wrote in Lesson 7, but complete.) The downside: if you write `<h2>` without classes it looks like plain text. That is normal in Tailwind.

## 6. Variants: states, breakpoints and dark mode

A **variant** is a prefix with a colon that says *when* the class applies. This is where Tailwind replaces pseudo-classes and media queries:

| Variant | CSS it stands for | Example |
|---------|-------------------|---------|
| `hover:` | `:hover` (only on devices that can hover) | `hover:bg-rose-800` |
| `focus:` / `focus-visible:` | `:focus` / `:focus-visible` | `focus-visible:outline-2` |
| `active:` | `:active` | `active:translate-y-0.5` |
| `md:` | `@media (min-width: 48rem)` | `md:flex-row` |
| `sm:` `lg:` `xl:` | 40rem, 64rem, 80rem | `lg:grid-cols-3` |
| `dark:` | `@media (prefers-color-scheme: dark)` | `dark:bg-stone-800` |
| `first:` `last:` `odd:` `even:` | `:first-child`, ... | `odd:bg-white` |
| `has-[...]:` | `:has(...)` (Lesson 16) | `has-checked:bg-rose-50` |
| `group-hover:` | when a parent marked `group` is hovered | `group-hover:underline` |
| `print:` | `@media print` | `print:hidden` |
| `@md:` | a **container query** (Lesson 14) | `@md:flex-row` |

Variants can be **stacked**: `md:hover:bg-rose-800` means "on tablets and up, when hovered". And Tailwind is **mobile-first**, just like Lesson 13: a class with no prefix applies at every width, and `md:` *adds* to it from 768px up.

Make the card respond to the mouse, to the screen width and to dark mode:

📄 **`index.html`** (edit these lines)

```diff
-      <article class="mt-6 flex max-w-sm items-center gap-4 rounded-xl border border-orange-200 bg-white p-4 shadow-md">
+      <article class="mt-6 flex max-w-xl flex-col items-center gap-4 rounded-xl border border-orange-200 bg-white p-4 text-center shadow-md transition hover:-translate-y-1 hover:shadow-xl md:flex-row md:text-start dark:border-stone-700 dark:bg-stone-800">
```

Try it: on a phone-width window the card's content is stacked and centered. From 768px up it is a row with the text on the start side. Hover over it: it lifts. Switch DevTools to "prefers-color-scheme: dark": the card turns dark.

(There is one more thing to fix for dark mode: the page itself stays light, since `bg-orange-50` is not changed. We solve all of dark mode in the next section, in a better way.)

### Arbitrary values: when the scale doesn't have what you need

Square brackets let you use any value: `w-[17rem]`, `bg-[#b3365f]`, `grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]`, `top-[4.5rem]`, `text-[clamp(2rem,1rem+3vw,3rem)]`. Use them sparingly: if you need the same value in several places, add it to the theme (next).

## 7. Make it yours: `@theme`

The default palette (`rose-700`, `stone-800`...) is large and nice. But Bunny already has a design: her **tokens** from Lesson 8 and 15. In Tailwind v4 you declare design tokens in `src/input.css`, inside **`@theme`**. Each token creates **utility classes** automatically:

```css
@theme {
  --color-accent: #b3365f;     →   bg-accent  text-accent  border-accent  ring-accent ...
  --font-heading: Georgia, serif;   →   font-heading
  --radius-card: 0.75rem;      →   rounded-card
  --text-hero: 3rem;           →   text-hero
}
```

The names have a **prefix that decides which utilities** are made (`--color-` for colours, `--font-` for font families, `--text-` for font sizes, `--radius-` for corners, `--shadow-` for shadows, `--spacing-`, `--breakpoint-`, `--container-`...). And, as in plain CSS, they are real **CSS variables** that you can also use directly: `var(--color-accent)`.

Here are the bakery's tokens from Lesson 15, with **light and dark values** (`light-dark()`!). Because the tokens themselves flip with the person's colour scheme, you will not need `dark:` classes for the colours:

📄 **`src/input.css`** (replace everything)

```css
@import "tailwindcss";

/* The Bunny Bakery design tokens. Every --color-*, --font-*, --text-* and --shadow-* here
   also creates utility classes (bg-page, text-ink, font-heading, shadow-card, ...) */
@theme {
  /* Colours: light-dark(value for light, value for dark) */
  --color-ink: light-dark(#4a2c17, #f7ebdd);
  --color-ink-soft: light-dark(#7a5a44, #cdb8a4);
  --color-page: light-dark(#fff8f0, #1c1410);
  --color-tint: light-dark(#ffe4d1, #3a281c);
  --color-surface: light-dark(#fff, #2a1f19);
  --color-accent: light-dark(#b3365f, #ff8fb1);
  --color-accent-strong: light-dark(#8f2a4c, #ffb3cb);
  --color-on-accent: light-dark(#fff, #2a1f19);
  --color-highlight: #ffd166;
  --color-on-highlight: #4a2c17;
  --color-highlight-soft: light-dark(#fff0d6, #3b2d14);
  --color-line: light-dark(#e8d5c4, #4a382c);
  --color-line-strong: light-dark(#b89a84, #8a7360);
  --color-error: light-dark(#b3261e, #ff8a80);
  --color-footer: light-dark(#4a2c17, #120d0a);
  --color-on-footer: light-dark(#fff8f0, #e9dccd);

  /* Fonts */
  --font-body: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-heading: Georgia, "Times New Roman", serif;

  /* Fluid type sizes (and their line heights) */
  --text-hero: clamp(2rem, 1.4rem + 2.6vw, 3rem);
  --text-hero--line-height: 1.2;
  --text-title: clamp(1.6rem, 1.3rem + 1.4vw, 2rem);
  --text-title--line-height: 1.2;
  --text-lead: clamp(1.1rem, 1rem + 0.5vw, 1.25rem);

  /* Depth */
  --shadow-card: 0 1px 2px light-dark(rgb(74 44 23 / 0.08), rgb(0 0 0 / 0.4)),
    0 2px 8px light-dark(rgb(74 44 23 / 0.08), rgb(0 0 0 / 0.4));
  --shadow-lift: 0 10px 30px light-dark(rgb(74 44 23 / 0.18), rgb(0 0 0 / 0.55));

  /* The page width: the utility max-w-page */
  --container-page: 68rem;
}

/* Tell the browser that the page supports light and dark: light-dark() needs this */
@layer base {
  html {
    color-scheme: light dark;
  }
}
```

Now use the theme names in the page. Because Tailwind rebuilds as you save, the page changes at once (and the bakery's cream, brown and berry replace the default palette):

📄 **`index.html`** (edit these lines)

```diff
-  <body class="bg-orange-50 p-6 text-stone-800">
+  <body class="bg-page p-6 font-body text-ink">
     <main>
-      <h1 class="text-3xl font-bold text-rose-700">Hello, Tailwind!</h1>
+      <h1 class="font-heading text-hero font-bold text-accent">Hello, Tailwind!</h1>
@@
-      <article class="mt-6 flex max-w-xl flex-col items-center gap-4 rounded-xl border border-orange-200 bg-white p-4 text-center shadow-md transition hover:-translate-y-1 hover:shadow-xl md:flex-row md:text-start dark:border-stone-700 dark:bg-stone-800">
+      <article class="mt-6 flex max-w-xl flex-col items-center gap-4 rounded-xl border border-line bg-surface p-4 text-center shadow-card transition hover:-translate-y-1 hover:shadow-lift md:flex-row md:text-start">
@@
-          <h2 class="text-xl font-bold text-rose-700">Butter croissant</h2>
-          <p class="text-stone-600">Flaky layers, golden on the outside, tender inside.</p>
-          <p class="mt-2 font-bold text-rose-700">$3.50</p>
+          <h2 class="font-heading text-xl font-bold text-accent">Butter croissant</h2>
+          <p class="text-ink-soft">Flaky layers, golden on the outside, tender inside.</p>
+          <p class="mt-2 font-bold text-accent">$3.50</p>
```

Save, refresh, and toggle light/dark in DevTools: the **whole page**, including the card, follows, with no `dark:` class at all. We chose the tokens to do the work, exactly like in Lesson 15. (When a single element needs something special in dark mode, you still have `dark:`.)

Finally, run a real build once, to see the size of the generated CSS (stop the watcher with `Ctrl+C` first, or use another terminal):

```bash
npm run build
```

The `dist/output.css` file is only about 10 KB, and most of that is the modern reset and the theme variables: the handful of utilities this page uses take very little. (The CSS of the whole bakery in Lesson 18 will be only a bit bigger.)

## 8. What just happened?

```text
 src/input.css  ──(Tailwind CLI)──►  dist/output.css  ◄──link──  index.html
   @import "tailwindcss"             one file with:                 class="bg-page p-6 ..."
   @theme { --color-accent … }         @layer theme  (your tokens)
                                       @layer base   (Preflight reset)
        ▲                              @layer utilities (only what the HTML uses)
        └── you edit this              ▲
                                       └── Tailwind scans index.html for class names
```

- You wrote **no rule**. You composed classes in the HTML, and wrote tokens once, in `input.css`.
- Tailwind's output uses **cascade layers** (`theme`, `base`, `components`, `utilities`): the same idea you learned in Lesson 16. That's why a utility always beats the base reset, whatever the selectors' specificity.
- Everything is still **plain CSS** in the browser. DevTools shows `.bg-page { background-color: var(--color-page) }`: you can read it, and your CSS knowledge applies completely.

## 🧪 Try it yourself

1. Change `gap-4` to `gap-8` and `p-4` to `p-8` in the card. Which classes did Tailwind add to `dist/output.css`? (Look at the file or in DevTools.)
2. Add `lg:max-w-3xl` to the card and watch what happens at 1024px.
3. Use the VS Code extension (Tailwind CSS IntelliSense): hover a class name. What CSS does it show?
4. Try an arbitrary value: `w-[17rem]` on the card. Then `bg-[#ffd166]`. Then add `bg-accent/20` for a 20% pink.
5. Add a **new colour** to `@theme`: `--color-mint: #96d5b5;` and use `bg-mint` on the page. Did you need to restart anything?
6. Break the scanner on purpose: write a class as `class="text-{{size}}"` or build it from parts in JavaScript. Does the CSS appear? (No: Tailwind needs to see the complete class name.)
7. Add `group` to the card and `group-hover:text-accent-strong` to its price. Hover the card.
8. Add a `<button class="rounded-full bg-accent px-5 py-2 font-bold text-on-accent hover:bg-accent-strong active:translate-y-0.5">Order</button>`. Compare the class list with the 35 lines of `.button` rules from Lessons 7, 9 and 13.
9. Try `print:hidden` on the heading, then print preview (`Ctrl+P`).
10. Open **play.tailwindcss.com** in your browser (an online playground, outside this repository) and try the same card there.

## ✅ Check yourself

<details>
<summary>1. What does "utility-first" mean?</summary>

You style elements by combining many small, single-purpose classes (`px-5`, `font-bold`, `rounded-full`) directly in the HTML, instead of writing a new named rule for each component in a stylesheet.
</details>

<details>
<summary>2. How does Tailwind know which CSS to put in the output file?</summary>

Its build tool scans your source files as plain text, finds the class names it knows, and generates CSS only for those. That is why you must write complete class names.
</details>

<details>
<summary>3. What do <code>p-4</code>, <code>px-6</code> and <code>gap-2</code> mean in rem?</summary>

The number counts in quarters of a rem: `p-4` is 1rem of padding on all sides, `px-6` is 1.5rem on the left and right, and `gap-2` is a 0.5rem gap.
</details>

<details>
<summary>4. How would you make a card stack on phones and become a row from 768px up?</summary>

`flex flex-col md:flex-row`. Classes without a prefix apply at every width (mobile-first), and `md:` adds the rule from 48rem (768px) up.
</details>

<details>
<summary>5. What does adding <code>--color-accent: #b3365f;</code> inside <code>@theme</code> do?</summary>

It creates a CSS variable `--color-accent` and all the colour utilities that use it: `bg-accent`, `text-accent`, `border-accent`, `ring-accent`, and so on.
</details>

## Recap

- Tailwind is a **utility-first** framework: small single-purpose classes composed in the HTML. A build tool scans your files and generates only the CSS you use.
- Setup (v4): `npm install tailwindcss @tailwindcss/cli`, an `input.css` with `@import "tailwindcss"`, and the CLI in watch mode (`npm run dev`). Link the output file in the page.
- Learn the families: spacing (quarters of a rem), colours (`name-shade`), typography, layout, borders and shadows. Use the docs and IntelliSense.
- **Variants** (`hover:`, `md:`, `dark:`, `has-*:`, `@md:`, `print:`) replace pseudo-classes, media queries and container queries. Mobile-first.
- `@theme` declares your design tokens, which become variables **and** utilities. Tokens with `light-dark()` give you dark mode for free.
- Never glue class names together from pieces.

➡️ **Next:** [Lesson 18 – Rebuild the bakery with Tailwind](18-rebuild-the-bakery-with-tailwind.md)
