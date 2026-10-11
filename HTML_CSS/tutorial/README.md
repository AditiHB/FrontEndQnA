# HTML and CSS Tutorial: Build the Bunny Bakery (Explained Like You're 5)

Learn HTML and CSS by building **one real website** from an empty file to a finished, responsive, accessible site. Every lesson teaches a few ideas in plain words, then builds them into the page, step by step, with every change spelled out.

> **Like I'm 5:** A baker called Bunny wants a website for her new bakery. Every day you add one more thing: first the words, then the colours, then the layout, then a menu that works on a phone. At the end Bunny has a real website, and you know why every part works.

## What you will build

A website for the **Bunny Bakery** 🐰🍞 that:

- has a header with the logo and a **menu button on phones** (a no-JavaScript pop-over) that turns into a row of links on bigger screens,
- shows a hero with a picture that loads in the **right size** for each screen, a menu of seven treats as **cards that adapt** to their room, a story with a different crop on phones, opening hours, and an order form with **validation**,
- looks right from a **320px phone to a 1440px monitor**, in **light and dark** mode, in **right-to-left** languages, and on **paper**,
- is **accessible**: keyboard friendly, with a skip link, landmarks, labels and good contrast,
- and then is built **a second time with Tailwind CSS**.

```text
 Computer (1280px)                                  Phone (375px)
 ┌──────────────────────────────────────────────┐   ┌─────────────────────┐
 │ Bunny Bakery      Menu  Story  Visit  Order  │   │ Bunny Bakery  [Menu]│
 ├──────────────────────────────────────────────┤   ├─────────────────────┤
 │ Fresh bread and sweet     ┌────────────────┐ │   │ Fresh bread and     │
 │ treats, baked every       │  shop picture  │ │   │ sweet treats ...    │
 │ morning.  [Menu] [Order]  └────────────────┘ │   │ [Menu]  [Order]     │
 ├──────────────────────────────────────────────┤   │ ┌─────────────────┐ │
 │ ┌─ Sourdough (featured, wide) ──── $6.00 ──┐ │   │ │  shop picture   │ │
 │ └──────────────────────────────────────────┘ │   │ └─────────────────┘ │
 │ ┌────────┐  ┌────────┐  ┌────────┐           │   ├─────────────────────┤
 │ │  card  │  │  card  │  │  card  │  ...      │   │ ┌─────────────────┐ │
 │ └────────┘  └────────┘  └────────┘           │   │ │      card       │ │
 ├──────────────────────────────────────────────┤   │ └─────────────────┘ │
 │ story: picture | text   hours | address      │   │   ... one column    │
 │ order form                                   │   │ order form          │
 ├──────────────────────────────────────────────┤   ├─────────────────────┤
 │ footer                                       │   │ footer              │
 └──────────────────────────────────────────────┘   └─────────────────────┘
```

## How this tutorial works

Each lesson has the same shape:

| Part | What it is |
|------|------------|
| 🧒 **Like I'm 5** | One picture to hold in your head |
| **The story** | Why the bakery needs this today |
| **Steps** | Short explanations, then the code to type |
| **What just happened?** | The idea behind the code, with diagrams |
| 🧪 **Try it yourself** | Small experiments (break things on purpose!) |
| ✅ **Check yourself** | Questions with hidden answers (click to open) |
| **Recap** | The lesson in a few bullets |

How code is shown:

- 📄 **`path/to/file`** *(new file)*: create this file with exactly the code shown.
- 📄 **`path/to/file`** *(replace everything)*: select all the old text and replace it.
- 📄 **`path/to/file`** *(add to the bottom)*: add the code at the end of the file.
- 📄 **`path/to/file`** *(edit these lines)* with a `diff` block: lines starting with **`-`** (red) are removed, lines starting with **`+`** (green) are added, lines with no sign show where you are, and `@@` separates different places in the file. Do not type the `-` and `+` signs.
- 📄 **`path/to/file`** *(find and replace everywhere)*: use your editor's find and replace in all files (in VS Code, `Ctrl+Shift+H`).
- `bash` blocks are terminal commands. There are only a few. You can always do the same with your file explorer (new folder, copy).

Tips for the best learning:

1. **Type the first lessons by hand.** Later, copying is fine, but read every comment.
2. **Keep the page open next to your editor.** Save, refresh, look. After every change.
3. **Use DevTools all the time** (`F12`). It shows why something looks the way it does and lets you change it live.
4. **Do the 🧪 experiments**, and break things on purpose.
5. **Play the games** in Lessons 10 and 11. They are the fastest way to understand Flexbox and Grid.
6. **Be patient with typos.** CSS ignores what it doesn't understand, so a typo is silent. DevTools shows ignored lines with a warning.

## Before you start

- A modern browser (Chrome, Edge, Firefox or Safari) and a code editor such as [VS Code](https://code.visualstudio.com/). **No experience needed.**
- **Node.js 20 or newer** is needed only for Lessons 17 and 18 (Tailwind), to run its build tool. Check with `node -v`.
- About **25 hours in total**. A good pace is one or two lessons per sitting.

## The lessons

### Part 1: HTML, the skeleton

| # | Lesson | We add to the bakery |
|:-:|--------|----------------------|
| 0 | [Get ready](00-get-ready.md) | An empty folder, and DevTools |
| 1 | [Your first web page](01-your-first-web-page.md) | `index.html`: the five parts every page needs |
| 2 | [Text, links, lists and images](02-text-links-lists-and-images.md) | A readable page: headings, a menu list, links, the shop picture |
| 3 | [Semantic HTML and accessibility](03-semantic-html-and-accessibility.md) | The final structure: header, nav, main, sections, footer, a skip link |
| 4 | [Forms and tables](04-forms-and-tables.md) | Opening hours, a table of boxes, the order form |

### Part 2: CSS basics, the clothes

| # | Lesson | We add to the bakery |
|:-:|--------|----------------------|
| 5 | [Hello, CSS](05-hello-css.md) | `styles.css`: first colours, fonts and picture rules |
| 6 | [Selectors, specificity and the cascade](06-selectors-specificity-and-the-cascade.md) | Class names, buttons, focus rings, a dark footer |
| 7 | [The box model](07-the-box-model.md) | Padding, borders, a centered page, spaced cards and form |
| 8 | [Colours, fonts, units and custom properties](08-colors-fonts-units-and-custom-properties.md) | Design tokens and a type scale |
| 9 | [Backgrounds, borders, shadows and transitions](09-backgrounds-borders-shadows-and-transitions.md) | A gradient hero, rounded cards that lift, a wiggling logo |

### Part 3: Layout

| # | Lesson | We add to the bakery |
|:-:|--------|----------------------|
| 10 | [Flexbox](10-flexbox.md) | The header row, button rows, the footer, a footer that stays at the bottom. **Playground and game** |
| 11 | [CSS Grid](11-css-grid.md) | A card gallery that adapts by itself, the hero, story and visit sections, the form. **Playground and game** |
| 12 | [Positioning and stacking](12-positioning-and-stacking.md) | A sticky header, a skip link that appears, a "New" badge, a glow behind the hero |

### Part 4: Responsive design

| # | Lesson | We add to the bakery |
|:-:|--------|----------------------|
| 13 | [Responsive design basics](13-responsive-design-basics.md) | Mobile-first layouts, media queries, fluid headings, finger-sized buttons |
| 14 | [Responsive layouts](14-responsive-layouts.md) | A menu button (the `popover` attribute), container-query cards, a scrolling table |
| 15 | [Responsive images and what people prefer](15-responsive-images-and-user-preferences.md) | `srcset` and `<picture>`, **dark mode**, hover only where it exists, print styles |
| 16 | [Modern CSS](16-modern-css.md) | Nesting, `:has()`, `color-mix()`, logical properties (right-to-left), `@layer` |

### Part 5: Tailwind CSS

| # | Lesson | We add to the bakery |
|:-:|--------|----------------------|
| 17 | [Tailwind CSS: setup and the utility-first idea](17-tailwind-setup-and-utility-first.md) | A new project with the Tailwind v4 CLI, utilities, variants and the bakery's theme |
| 18 | [Rebuild the bakery with Tailwind](18-rebuild-the-bakery-with-tailwind.md) | The same site, with utility classes, components and a translation guide |

### Part 6: Launch

| # | Lesson | We add to the bakery |
|:-:|--------|----------------------|
| 19 | [Graduation day: going live, checklists and cheat sheets](19-graduation-checklists-and-cheat-sheets.md) | Publishing, a launch checklist, common bugs, cheat sheets, a glossary and a quiz |

## The project as it grows

```text
Lesson  1-4    a complete, plain page                      ── HTML: structure, content, forms
Lesson  5-9    colours, type, spacing, shadows             ── CSS basics: the look
Lesson 10-12   rows, columns, sticky header, badges        ── Layout: Flexbox, Grid, positioning
Lesson 13-16   every screen, dark mode, modern CSS         ── Responsive design
Lesson 17-18   the same site, with Tailwind                ── A second way to write CSS
Lesson 19      published, checked, and in your cookbook
```

## Hands-on practice

Open these with a double-click (they work offline). They have their own page in the lessons, but you can use them any time.

| Page | What you do |
|------|-------------|
| [Flexbox playground](playgrounds/flexbox-playground.html) | Change every Flexbox setting with menus and sliders, click a box to give it its own settings, resize the area, and copy the CSS it writes |
| [Flexbox challenges](playgrounds/flexbox-challenges.html) | A game with 8 levels: write the CSS so that the carrots land where the goal shows |
| [Grid playground](playgrounds/grid-playground.html) | Type your own tracks, change gaps and alignment, make an item span, and see the grid lines |
| [Grid challenges](playgrounds/grid-challenges.html) | A game with 9 levels, from "three columns" to a page layout with named areas |

## The finished projects

If you get stuck, compare your folder with these, which are the complete sites at the end of Lesson 16 and Lesson 18:

- [`finished-project/bunny-bakery`](finished-project/bunny-bakery): plain HTML and CSS.
- [`finished-project/bunny-bakery-tailwind`](finished-project/bunny-bakery-tailwind): the same site with Tailwind CSS (run `npm install` and `npm run build` in it to rebuild the CSS).

The pictures for both are in `finished-project/bunny-bakery/images`. They are drawings made for this course (SVG source rendered to WebP and PNG in several sizes).

## Tested with these versions

Every lesson was run **in order, from an empty folder**, against a real project. After each lesson the page was checked automatically:

- the HTML against the **html-validate** rules,
- the CSS against **stylelint** (standard configuration, relaxed for teaching),
- the page loaded in **Chromium** at 320, 375, 414, 768, 1024, 1280 and 1440px: no console errors, no broken pictures, and (from Lesson 13) **no horizontal scrolling**,
- an accessibility scan with **axe-core** (and, from Lesson 15, in dark mode too),
- a script for each lesson that clicks, types, resizes and measures what the lesson just built: the menu, the container queries, the form, the dark mode, right-to-left, print and more.

The playground pages and games were tested the same way: every one of the 17 game levels is solved by its own answer, and wrong approaches are rejected.

| Tool | Version |
|------|---------|
| Node.js | 22.22 |
| Tailwind CSS and its CLI (Lessons 17 and 18) | 4.3 |
| Chromium used for the checks | 141 |
| html-validate / stylelint / axe-core | 11.16 / 17.16 / 4.14 |

**Browser support.** Everything in the lessons works in the current versions of Chrome, Edge, Firefox and Safari. A few extras (such as `text-wrap: pretty`) are simply ignored where a browser doesn't know them. The automatic checks ran in Chromium only, so test your own work in more browsers, and look at MDN's compatibility tables if you must support old ones.

A few things were **not** run in the verification: publishing to a real host (Lesson 19 follows the hosts' own guides), real phones and tablets, screen readers, Firefox and Safari rendering, Lighthouse scores, and most of the small "Try it yourself" experiments.

The tools in this list move fast. If you start later, `npm` will install newer versions of Tailwind and a few details (generated file names, option names, messages) may differ. The ideas stay the same. When something differs, the tool's own documentation wins.

## If something doesn't work

1. Open DevTools (`F12`) → **Console**. Read the first red message, all of it.
2. Look at the element in the **Elements** pane and its **Styles** pane: is your rule there? Is it crossed out? Is the line marked with a warning?
3. Check the **Network** tab: are `styles.css` and the pictures loaded (no red 404)?
4. Compare your file with the lesson's code, character by character. **Replace everything** means all the old text goes away.
5. Did you save, and refresh?
6. Compare with the finished project folder.
7. Stuck on a version difference or on a new feature? Search for the property on **MDN** (developer.mozilla.org).

## After the tutorial

- Keep building: Lesson 19 has project ideas, a launch checklist, cheat sheets and a glossary.
- Make your pages interactive with [JavaScript](../../javascript/README.md), or build a bigger app with [React](../../react/README.md).
- Look things up in the **cheat sheets** at the end of Lesson 19 and on MDN.
