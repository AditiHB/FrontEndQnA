# Lesson 19: Graduation Day: Going Live, Checklists and Cheat Sheets

> **Like I'm 5:** You built a bakery from nothing, and it works on every screen. Today you hang the **"OPEN" sign** (put it on the internet), check that the door, the windows and the lights all work (the **launch checklist**), and keep a **little cookbook** of the recipes you will use every day (the **cheat sheets**).

| | |
|---|---|
| **You will learn** | How to publish a static site, a launch checklist (HTML, CSS, responsive, accessibility, performance, sharing), the bugs everyone meets and their cures, one-page cheat sheets, an A to Z glossary, and where to go next |
| **You will build** | A launched site and a habit of checking it |
| **Time** | About 90 minutes (plus as long as you like in the quiz) |

## 1. What you have done

```text
 Part 1  HTML        0  Get ready            1  First page          2  Text, links, lists, images
                     3  Semantic + a11y      4  Forms and tables
 Part 2  CSS basics  5  Hello CSS            6  Selectors + cascade  7  The box model
                     8  Colours, fonts, units, variables             9  Backgrounds, shadows, motion
 Part 3  Layout     10  Flexbox             11  Grid                12  Positioning + stacking
 Part 4  Responsive 13  Basics + media queries                      14  Layouts, popover, container queries
                    15  Images + dark mode + print                  16  Modern CSS
 Part 5  Tailwind   17  Setup + utility-first                       18  Rebuild the bakery
 Part 6  Launch     19  You are here
```

You started with an empty file, and you finished with **a real website**: semantic, accessible, responsive, with dark mode, a mobile menu, adaptive pictures and a form, **written twice** (in plain CSS and in Tailwind). You can read other people's CSS, find what makes a page behave the way it does, and fix it.

## 2. Put it online

A static site (HTML, CSS, images, a bit of JS) is just **files**. To publish it you put the files on a computer that is always on, called a **host**. Several hosts are free for small sites. All of them are outside this repository, and their screens change from time to time, so follow their own guides.

| Host | How it works | Good for |
|------|--------------|----------|
| **GitHub Pages** | Put the files in a GitHub repository, switch on Pages in the settings | Projects you already keep on GitHub |
| **Netlify** (and **Netlify Drop**) | Drag your folder onto a web page, or connect a repository | The fastest first publish |
| **Cloudflare Pages**, **Vercel** | Connect a repository; they build and publish on every push | Projects that need a build step |

### What to upload

**The plain site** (`bunny-bakery`): everything in the folder: `index.html`, `styles.css`, `site.js` and the `images` folder.

**The Tailwind site** (`bunny-bakery-tailwind`): upload only what the *browser* needs:

```text
 upload:        index.html     site.js     images/      dist/output.css   (run npm run build first!)
 do NOT upload: node_modules/  src/  package.json       (they are only for building)
```

If you use a host that builds for you (Netlify, Cloudflare Pages, Vercel), you give it the **build command** `npm run build` and the **publish folder**, and it makes `dist/output.css` itself (then your page links `dist/output.css`; keep the output in the publish folder).

### A GitHub Pages walk-through

1. Create a new repository on GitHub (for example `bunny-bakery`).
2. Put the files in it. Either use **Add file → Upload files** on the repository page and drop your files, or use git in the terminal:
   ```bash
   git init
   git add .
   git commit -m "Bunny Bakery"
   git branch -M main
   git remote add origin https://github.com/YOUR-NAME/bunny-bakery.git
   git push -u origin main
   ```
   (Add a `.gitignore` file with the line `node_modules` first, if you use the Tailwind version.)
3. On the repository page, open **Settings → Pages**, choose **Deploy from a branch**, the branch `main` and the folder `/ (root)`, and save.
4. After a minute your site is at `https://YOUR-NAME.github.io/bunny-bakery/`.

**Relative paths matter.** The sites use paths like `images/logo.svg` and `styles.css` (without a leading `/`), so they work in a sub-folder such as `/bunny-bakery/`. A path starting with `/` would look at the root of the host and break.

### After publishing

- Open the live address **on your phone**, on mobile data.
- Check the **browser console** for red errors, and the **Network** tab for 404s (a wrong file name: the host is case-sensitive, so `Images/` and `images/` differ).
- Share the link with someone and ask: "What do you see?"

## 3. The launch checklist

Go through it before you share a site with the world.

### HTML

- [ ] `<!doctype html>`, `<html lang="…">`, a `<meta charset>` and the **viewport** meta tag.
- [ ] A meaningful `<title>` and a `<meta name="description">` on every page.
- [ ] One `<h1>`; headings in order; landmarks: `header`, `nav`, `main`, `footer`.
- [ ] Every image has the right `alt` (empty `alt=""` for decoration) and `width` and `height`.
- [ ] Every form control has a `<label>`, and links have meaningful texts.
- [ ] Run the page through the **W3C validator** (validator.w3.org) and fix the errors.

### CSS and layout

- [ ] No horizontal scroll bar at 320, 375, 768, 1024 and 1440px, or at 200% zoom.
- [ ] Text is at least 16px, lines are not too long, and the contrast is at least 4.5 : 1.
- [ ] Every interactive element has a **visible keyboard focus**.
- [ ] Touch targets are about 44px; hover effects are inside `(hover: hover)`.
- [ ] `prefers-reduced-motion` and `prefers-color-scheme` are respected; the page is checked in both themes.
- [ ] A print preview looks sensible.

### Accessibility

- [ ] You can do **everything with the keyboard** alone (Tab, Shift+Tab, Enter, Space, Esc, arrows).
- [ ] A skip link works. Focus never gets trapped, and never disappears under a sticky header.
- [ ] You ran an automatic checker (**Lighthouse** in DevTools, or the **axe** extension) and fixed what it found.
- [ ] You tried a screen reader on the main page for five minutes.

### Performance

- [ ] Pictures are about as large as they are shown; `srcset` where it matters; WebP or AVIF; `loading="lazy"` below the fold; the hero has `fetchpriority="high"`.
- [ ] No huge files (check the Network tab; a good page is well under 1 MB for a first view).
- [ ] You ran **Lighthouse** → Performance on a phone profile.

### Sharing

- [ ] A **favicon** (we used `logo.svg`).
- [ ] **Social preview tags**, so that a link to your page shows a nice card in chat apps. In `<head>`:
  ```html
  <meta property="og:title" content="Bunny Bakery">
  <meta property="og:description" content="Fresh bread and sweet treats, baked every morning.">
  <meta property="og:image" content="https://YOUR-NAME.github.io/bunny-bakery/images/hero-1200.webp">
  <meta property="og:url" content="https://YOUR-NAME.github.io/bunny-bakery/">
  <meta name="twitter:card" content="summary_large_image">
  ```
  (`og:image` needs a full address, and a picture about 1200 × 630 works best.)
- [ ] A real page `<title>` for each page, and `rel="canonical"` if the same page has several addresses.

## 4. The bugs everyone meets

| The symptom | The usual cause | The cure |
|-------------|-----------------|----------|
| A horizontal scroll bar on phones | A fixed width, a wide image without `max-width: 100%`, a wide table, or `100vw` | Hunt it with the Console snippet (Lesson 13); use `max-width`, `min()`, `overflow-x: auto` |
| A picture is stretched or squashed | `width` and `height` both fixed | `height: auto`, or `object-fit: cover` with `aspect-ratio` |
| `z-index` does nothing | The element is not positioned, or it sits in a lower stacking context | `position: relative`, or fix the parent's stacking context, `isolation: isolate` |
| A child sticks out of a rounded parent | No clipping | `overflow: hidden` on the parent |
| Margins "disappear" or don't add up | Margin collapsing | Padding, `gap`, a flex or grid container, or `display: flow-root` |
| `position: sticky` doesn't stick | No `top`, or a parent has `overflow` | Add `top: 0`; remove `overflow` from the ancestors |
| A flex item overflows with long text | `min-width: auto` | `min-width: 0` on the item |
| A grid column is too wide | `1fr` can't shrink below its content | `minmax(0, 1fr)` |
| A style has no effect | A typo, a stronger rule, or the file is not linked or not saved | DevTools → Styles: crossed-out and warning lines; check the Network tab |
| A rule works in Chrome only | A very new feature | Check MDN's compatibility table; add a fallback; `@supports` |
| The page is tiny on a phone | The viewport meta tag is missing | Add it (Lesson 13) |
| The footer floats up on short pages | The body is not a full-height column | `min-height: 100dvh` plus a flexible `main` (Lesson 10) |
| Text is unreadable in dark mode | Hard-coded colours | Colour tokens with `light-dark()` (Lesson 15) |
| Tailwind class does nothing | The build is not running, or the class name is incomplete | Check the watcher; write whole class names (Lesson 18) |

**The three-step debugging habit:** (1) **Inspect** the element in DevTools. (2) Look at the **Computed** and **Styles** panes to see which rule wins and which are crossed out. (3) **Change one thing** in DevTools until it is right, then copy the fix to your file.

## 5. Cheat sheets

### Selectors

```text
 p            type            .card        class          #menu       id (avoid in CSS)
 a[href]      attribute       a[target="_blank"]          [href^="https"]   starts with
 nav a        descendant      ul > li      child          h2 + p      next sibling
 a:hover  :focus-visible  :first-child  :nth-child(2n)  :not(.x)  :is(h1, h2)  :has(img)
 ::before  ::after  ::first-line  ::marker  ::placeholder
 specificity:  ids – classes/pseudo-classes/attributes – types   (inline wins; !important breaks the order)
```

### The box model and display

```text
 content → padding → border → margin       box-sizing: border-box;
 margin: 0 auto  (center)    margin-inline: auto     padding: 1rem 2rem  (vertical | horizontal)
 display: block | inline | inline-block | flex | grid | none
 width: 100%;  max-width: 65ch;  min-height: 100dvh;  aspect-ratio: 16 / 9;  overflow: auto;
```

### Units and sizes

```text
 rem   root font size (text, spacing)     em   this element's font size     %   of the parent
 ch    width of "0" (line length)         vw / vh / dvh   viewport          fr  grid share
 px    hairlines only                     clamp(min, ideal, max)   min()   max()   calc()
```

### Flexbox

```text
 container: display: flex;  flex-direction: row | column;  flex-wrap: wrap;  gap: 1rem;
            justify-content: flex-start | center | flex-end | space-between | space-around | space-evenly   (main axis)
            align-items:     stretch | flex-start | center | flex-end | baseline                              (cross axis)
 items:     flex: 1;  (grow 1, shrink 1, basis 0)    flex: none;   align-self: center;   order: -1;   margin-left: auto;
 centered:  display: flex; justify-content: center; align-items: center;
```

### Grid

```text
 container: display: grid;  grid-template-columns: repeat(3, 1fr);  grid-template-rows: auto 1fr;  gap: 1rem;
            grid-template-areas: "header header" "side main";      place-items: center;
 adaptive:  grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr));
 items:     grid-column: 1 / -1;  grid-column: span 2;  grid-row: span 2;  grid-area: header;
 subgrid:   grid-template-rows: subgrid;
```

### Responsive

```text
 <meta name="viewport" content="width=device-width, initial-scale=1">
 mobile-first:  @media (min-width: 48rem) { ... }      container:  .wrap { container: card / inline-size }   @container card (min-width: 28rem) { ... }
 preferences:   (prefers-color-scheme: dark)  (prefers-reduced-motion: reduce)  (hover: hover)  print
 images:        <img srcset="a.webp 400w, b.webp 800w" sizes="(min-width: 48rem) 45vw, 100vw">     <picture><source media="…"><img></picture>
 fluid text:    font-size: clamp(2rem, 1.4rem + 2.6vw, 3rem);
```

### Modern CSS

```text
 nesting:   .card { &:hover { } .title { } @media (…) { } }
 :has():    .card:has(.badge) { }     label:has(+ input:required) { }
 colour:    color-mix(in oklab, var(--accent) 40%, white)    light-dark(#fff, #000)     color-scheme: light dark
 logical:   margin-inline  padding-block  inline-size  inset-inline-start  text-align: start
 layers:    @layer reset, base, components, utilities;
 other:     text-wrap: balance;   accent-color: var(--accent);   scroll-margin-top: 5rem;   :user-invalid
```

### Positioning

```text
 position: relative (anchor)   absolute (out of flow, relative to the anchor)   fixed (to the window)   sticky + top: 0
 inset: 0;   z-index: 10;   isolation: isolate;     popover:  <button popovertarget="x"> + <nav id="x" popover>
```

### The most used Tailwind classes

```text
 spacing   p-4 px-6 py-2 pt-2 m-4 mx-auto mt-2 gap-4 space-y-4              (1 unit = 0.25rem)
 size      w-full max-w-md min-h-11 h-dvh size-10 aspect-video
 layout    flex flex-col flex-wrap items-center justify-between grid grid-cols-3 col-span-2 hidden
 text      text-sm text-xl font-bold leading-snug text-center text-balance uppercase underline
 colour    bg-accent text-ink border-line bg-black/50                           (from your @theme)
 looks     rounded-xl border shadow-md opacity-50 transition
 position  relative absolute sticky top-0 inset-0 z-10
 variants  hover: focus-visible: md: lg: dark: has-[.x]: group-hover: @md: print: motion-safe:
 custom    w-[17rem]  grid-cols-[1fr_2fr]  bg-[#b3365f]
```

## 6. A to Z glossary

| Word | Meaning | Lesson |
|------|---------|:------:|
| **Accessibility (a11y)** | Making pages usable by everyone, whatever their abilities and devices | 3 |
| **Alt text** | A text that describes an image for people who can't see it | 2 |
| **Aspect ratio** | The shape of a box: width divided by height (`16 / 9`) | 9 |
| **Box model** | Content, padding, border and margin around every element | 7 |
| **Breakpoint** | A width at which the layout changes | 13 |
| **Cascade** | The rules for deciding which CSS wins: importance, layer, specificity, order | 6 |
| **Class** | A reusable name on an element, selected with `.name` | 6 |
| **Container query** | A query on the size of a parent, not of the window | 14 |
| **Contrast ratio** | How strongly text stands out from its background | 8 |
| **Custom property** | A variable in CSS: `--accent`, used with `var()` | 8 |
| **Declaration** | One `property: value;` pair | 5 |
| **DevTools** | The browser's built-in inspector | 0 |
| **DOM** | The tree of elements the browser builds from your HTML | 1 |
| **Element** | An opening tag, content and closing tag | 1 |
| **Flexbox** | One-dimensional layout, along a row or a column | 10 |
| **Fluid** | Sizes that change smoothly with the space (`%`, `clamp()`) | 13 |
| **Grid** | Two-dimensional layout with rows and columns | 11 |
| **Inheritance** | Children copying certain values (such as colour and font) from their parent | 6 |
| **Landmark** | A page region (`header`, `nav`, `main`, `footer`) that assistive technology can jump to | 3 |
| **Layer (`@layer`)** | A named group of rules whose order beats specificity | 16 |
| **Logical property** | A property in terms of *start* and *end* instead of *left* and *right* | 16 |
| **Media query** | A condition on the device or the person's preferences | 13 |
| **Mobile-first** | Writing the phone layout first, adding for larger screens | 13 |
| **Nesting** | Writing a rule inside another rule | 16 |
| **Popover** | An element shown in the top layer, opened by a button | 14 |
| **Pseudo-class** | A state or position selector (`:hover`, `:has()`) | 6 |
| **Pseudo-element** | A generated part of an element (`::before`) | 6 |
| **Responsive design** | One site that adapts to every screen | 13 |
| **Selector** | The part of a rule that says which elements it applies to | 5 |
| **Semantic HTML** | Elements whose names describe their meaning | 3 |
| **Specificity** | The score that decides between two rules that target the same element | 6 |
| **Stacking context** | A group of elements stacked together, in which `z-index` is local | 12 |
| **Token (design token)** | A named value (colour, size) that the whole stylesheet uses | 8 |
| **Utility class** | A one-purpose class such as `px-4` (Tailwind) | 17 |
| **Viewport** | The visible part of the page in the window | 13 |
| **Variant (Tailwind)** | A prefix such as `hover:` or `md:` that says *when* a utility applies | 17 |

## 7. Where next?

You now have the foundations. Good next steps, in the order that most people take them:

1. **Build things.** The best way to improve is to make your own pages (ideas below).
2. **JavaScript:** make pages interactive. Start with the [JavaScript concepts](../../javascript/concepts/README.md) in this repository.
3. **A framework:** the [React tutorial](../../react/tutorial/README.md) in this repository builds a whole shop, and its styling lesson uses what you learned here. TypeScript adds safety: see the [TypeScript concepts](../../typescript/concepts/README.md).
4. **More CSS depth:** animation (`@keyframes`, view transitions), `@property`, typography, design systems, CSS architecture (BEM, utility-first, CSS Modules).
5. **Accessibility in depth:** read the WCAG guidelines, and try a screen reader every week.

### Project ideas

| Project | What it practises |
|---------|-------------------|
| A personal page or portfolio | Everything, plus your own design |
| A recipe page that prints well | Semantic HTML, typography, print styles |
| A restaurant menu with a gallery | Grid, responsive images, dark mode |
| A landing page for an event | Hero sections, forms, responsive layout |
| A pricing table | Tables, grid, container queries |
| A blog page with a sidebar | Layout, `clamp()`, readable text |
| The same page in plain CSS and Tailwind | Both skills, and an honest opinion |
| Recreate a favourite site's layout (no copying code) | Reading layouts, Flexbox and Grid |

### Games and references (all outside this repository, and they may change)

- **Games:** Flexbox Froggy (flexboxfroggy.com), Grid Garden (cssgridgarden.com), CSS Diner (flukeout.github.io, selectors).
- **Reference:** MDN Web Docs (developer.mozilla.org) is the best place to look things up. **web.dev/learn** has free courses. **caniuse.com** shows browser support. **tailwindcss.com/docs** is the Tailwind reference.
- **Tools:** the W3C validator (validator.w3.org), Lighthouse (in Chrome DevTools), the axe DevTools extension, Squoosh (squoosh.app) for images.

## 8. The graduation quiz

Twenty questions from the whole course. Try to answer *before* opening each one.

<details>
<summary>1. Why do we write <code>&lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;</code>?</summary>

So phones use their real width instead of pretending to be a wide desktop. Without it, media queries and responsive layouts don't work as expected.
</details>

<details>
<summary>2. What makes HTML "semantic"?</summary>

Elements that describe what content *is* (`nav`, `main`, `article`, `button`), not just how it looks. Screen readers, search engines and other developers rely on it.
</details>

<details>
<summary>3. When do you use <code>alt=""</code>?</summary>

For purely decorative images, so that screen readers skip them. Never leave the attribute out.
</details>

<details>
<summary>4. How are a <code>&lt;label&gt;</code> and its input connected?</summary>

`for` on the label equals `id` on the input (or the input is nested inside the label). Clicking the label focuses the input, and screen readers announce it.
</details>

<details>
<summary>5. What is the specificity of <code>.card:hover h3</code>?</summary>

0-2-1: two for the class and the pseudo-class, one for the type `h3`.
</details>

<details>
<summary>6. Which comes first in the cascade: specificity or source order?</summary>

Specificity (after importance and layers). Order only decides when specificity is equal.
</details>

<details>
<summary>7. What does <code>box-sizing: border-box</code> change?</summary>

`width` and `height` include padding and border, so a box is as wide as you said.
</details>

<details>
<summary>8. Why use <code>rem</code> for text instead of <code>px</code>?</summary>

`rem` follows the user's chosen default text size, so people who need bigger text get it.
</details>

<details>
<summary>9. What is the advantage of custom properties over fixed values?</summary>

They live in one place, can be re-defined for a part of the page or a theme (dark mode), and are read by the browser at run time.
</details>

<details>
<summary>10. How do you center an item horizontally and vertically in a box?</summary>

`display: flex; justify-content: center; align-items: center;` (or `display: grid; place-items: center;`) on the box, which needs some height.
</details>

<details>
<summary>11. What is the difference between Flexbox and Grid?</summary>

Flexbox lays out items along one axis (a row or a column); Grid lays out in two dimensions at once. They are often used together.
</details>

<details>
<summary>12. What does <code>repeat(auto-fit, minmax(16rem, 1fr))</code> do?</summary>

It makes as many columns as fit, each at least 16rem wide, sharing the leftover space, and changes the column count by itself without media queries.
</details>

<details>
<summary>13. What is the difference between <code>position: relative</code> and <code>absolute</code>?</summary>

`relative` keeps the element in the flow and offsets it from its normal place; `absolute` takes it out of the flow and places it relative to its nearest positioned ancestor.
</details>

<details>
<summary>14. Why might <code>z-index: 9999</code> not work?</summary>

The element isn't positioned, or it lives inside a stacking context that is lower than the other element. `z-index` is only compared within one stacking context.
</details>

<details>
<summary>15. What is "mobile-first" CSS?</summary>

Base styles for phones, then `@media (min-width: …)` queries add layout for larger screens.
</details>

<details>
<summary>16. When do you use a container query instead of a media query?</summary>

When a *component* should adapt to the room it has been given, wherever it is placed, rather than to the window.
</details>

<details>
<summary>17. How do <code>srcset</code> and <code>sizes</code> work together?</summary>

`srcset` lists files with their widths; `sizes` tells the browser how wide the image will be on the page. The browser multiplies by the screen's pixel density and picks the smallest file that is big enough.
</details>

<details>
<summary>18. How do you support dark mode with tokens?</summary>

`color-scheme: light dark` on `:root`, and `light-dark(lightValue, darkValue)` in the colour tokens (or redefine the tokens in `@media (prefers-color-scheme: dark)`).
</details>

<details>
<summary>19. What does <code>.card:has(.badge)</code> select?</summary>

Cards that contain a `.badge`.
</details>

<details>
<summary>20. How does Tailwind decide which CSS to generate?</summary>

It scans your source files as text, finds class names it knows, and generates CSS for only those. So you must write complete class names.
</details>

## Recap

- A static site is files. Publish it to GitHub Pages, Netlify, Cloudflare Pages or Vercel, with relative paths, and upload only what the browser needs.
- Use the launch checklist: HTML, CSS and layout, accessibility, performance and sharing. Test on real devices and with the keyboard.
- Keep the cheat sheets near you and learn the DevTools debugging habit: inspect, read the Styles and Computed panes, change one thing.
- You can write plain CSS **and** Tailwind. Choose the one that fits the project.
- Keep building. Congratulations on finishing the course! 🐰🎉
