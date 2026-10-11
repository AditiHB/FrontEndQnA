# Lesson 15: Responsive Images and What People Prefer

> **Like I'm 5:** Some people want a small picture book that fits in a pocket, and some want a big poster. A kind shopkeeper hands each person the right size. Some people also like the lights **low at night** (dark mode), some don't like things **wobbling** (reduced motion), and some are **holding paper** (printing). A kind page **listens** to all of them.

| | |
|---|---|
| **You will learn** | `srcset` and `sizes` (the right size), `<picture>` (a different crop or format), `loading="lazy"`, `fetchpriority`, `prefers-color-scheme` with `color-scheme` and `light-dark()`, naming colour tokens by **role**, `hover: hover`, and print styles |
| **You will build** | Pictures that load in the right size for each screen, a full **dark mode**, hover effects only for devices that hover, and a clean printout |
| **Time** | About 2 hours |

## The story

On Bunny's phone, the page takes a long time to load, and she has used a lot of data. Why? The shop picture is 1200 pixels wide, and her phone shows it at 300. Meanwhile, her cousin reads the page in bed at night and says the white page "burns his eyes". Two different problems, one idea: **the page should adapt to the person, not only to the screen**.

## 1. The three image problems

| Problem | Example | Tool |
|---------|---------|------|
| **Size.** A phone doesn't need a 1200px picture, and a high-resolution screen needs more pixels than a normal one | A 300px-wide slot on a phone | **`srcset` + `sizes`** |
| **Shape.** A wide picture shrunk onto a phone makes the subject tiny. A different **crop** would be better | The kitchen scene, 16:9, on a phone | **`<picture>` + `media`** (art direction) |
| **Format.** Newer formats are much smaller | WebP, AVIF | **`<picture>` + `type`**, or just use WebP |

## 2. `srcset` and `sizes`: let the browser choose

You give the browser a **menu of files** and tell it **how big the picture will be**. It then picks the best file for the screen **and** the connection, by itself.

```html
<img
  src="images/hero-800.webp"
  srcset="images/hero-400.webp 400w,
          images/hero-800.webp 800w,
          images/hero-1200.webp 1200w"
  sizes="(min-width: 48rem) 45vw, calc(100vw - 5rem)"
  alt="..." width="800" height="600">
```

| Part | Meaning |
|------|---------|
| `src` | The default (and the fallback for very old browsers) |
| `srcset="file 400w, ..."` | The files, each with its **real width in pixels** (a `w` descriptor) |
| `sizes="(condition) size, ..., default"` | How wide the picture will be **on the page** (not in the file): a list of media conditions and sizes, the first one that matches wins. The last is the default |

The browser multiplies the displayed width by the screen's **pixel density** (a retina screen has 2 or 3 device pixels per CSS pixel) and picks the **smallest file that is big enough**.

```text
 phone, 375px wide, density 2:   slot = 100vw - 5rem = 295px   × 2 = 590px  →  smallest file ≥ 590:  hero-800.webp
 phone, 375px wide, density 1:   slot = 295px              × 1 = 295px  →  hero-400.webp
 laptop, 1280px, density 1:      slot = 45vw = 576px                    →  hero-800.webp
 laptop, 1280px, density 2:      slot = 576px × 2 = 1152px              →  hero-1200.webp
```

A few important facts:

- `sizes` describes the **layout**, and it is read **before** the CSS is loaded. So it can't say "whatever the CSS makes it": you must tell it, and keep it up to date if you change the layout.
- The browser may choose a **larger** file than strictly needed (on a slow connection it may choose smaller). It is a hint, not a command.
- For pictures with a **fixed** size, such as a logo, there is a shorter form: `srcset="logo.png 1x, logo@2x.png 2x"` (density descriptors, no `sizes`).
- Always keep `width` and `height`: they reserve the space before the picture loads.

## 3. `<picture>`: art direction and formats

When you need a *different picture* (not just a different size), wrap the `<img>` in a `<picture>`, with `<source>` elements before it:

```html
<picture>
  <source media="(min-width: 48rem)" srcset="wide.webp" width="1280" height="720">
  <img src="square.webp" alt="..." width="800" height="800">
</picture>
```

The browser goes through the `<source>`s from top to bottom and uses the **first one that matches**; if none match, it uses the `<img>`. The `<img>` is **required**: it shows the picture, and it carries the `alt` text.

- **Art direction:** a wide kitchen scene on tablets and computers, and a **square crop** that keeps Bunny large on phones. (We prepared both.)
- **Formats:** `<source type="image/avif" srcset="a.avif">` then `<source type="image/webp" srcset="a.webp">` and an `<img src="a.jpg">`: the browser uses the first format it understands.
- `width` and `height` **on each `<source>`** tell the browser the shape of that crop before it loads, so that the page doesn't jump when the shape changes.
- You can use `srcset` and `sizes` inside `<source>` too.

## 4. Loading pictures wisely

| Attribute | What it does | When |
|-----------|--------------|------|
| `loading="lazy"` | Don't download until the picture is **near the screen** | Every picture that is below the fold |
| `loading="eager"` (the default) | Download at once | The first screen |
| `fetchpriority="high"` | "This one is the most important picture" | The main picture at the top (the hero) |
| `decoding="async"` | Decode off the main thread so the page doesn't stutter | Big pictures |

**Never lazy-load the hero**: it is the first thing people see, and delaying it makes the page feel slower.

**Formats, shortly:** `.svg` for logos and icons (tiny, sharp at any size); `.webp` or `.avif` for photographs and illustrations (small); `.jpg` as the safe old choice for photos; `.png` for sharp pixel graphics and transparency. Tools that make smaller files: Squoosh (squoosh.app, free, in the browser), `cwebp`, ImageMagick, `sharp`. For each picture, make about 3 widths (for example 400, 800 and 1200).

## 5. Build: the hero and the story

The files are already in your `images/` folder (Lesson 2): `hero-400`, `hero-800`, `hero-1200` (all `.webp`), and `story-wide-640`, `story-wide-1280`, `story-square-400`, `story-square-800`.

📄 **`index.html`** (edit these lines)

```diff
     <meta name="viewport" content="width=device-width, initial-scale=1">
+    <meta name="color-scheme" content="light dark">
@@
-        <img class="hero-img" src="images/hero-800.webp" alt="The Bunny Bakery shop front: a striped awning, a window full of fresh bread and a bunny baker holding a tray of rolls" width="800" height="600">
+        <img
+          class="hero-img"
+          src="images/hero-800.webp"
+          srcset="images/hero-400.webp 400w, images/hero-800.webp 800w, images/hero-1200.webp 1200w"
+          sizes="(min-width: 48rem) 45vw, calc(100vw - 5rem)"
+          alt="The Bunny Bakery shop front: a striped awning, a window full of fresh bread and a bunny baker holding a tray of rolls"
+          width="800"
+          height="600"
+          fetchpriority="high">
@@
-          <img src="images/story-wide-1280.webp" alt="Bunny in a chef's hat pointing at a glowing oven, with fresh loaves cooling on a table beside it" width="1280" height="720">
+          <picture>
+            <source
+              media="(min-width: 48rem)"
+              srcset="images/story-wide-640.webp 640w, images/story-wide-1280.webp 1280w"
+              sizes="(min-width: 68rem) 520px, 45vw"
+              width="1280"
+              height="720">
+            <img
+              src="images/story-square-800.webp"
+              srcset="images/story-square-400.webp 400w, images/story-square-800.webp 800w"
+              sizes="calc(100vw - 2rem)"
+              alt="Bunny in a chef's hat pointing at a glowing oven, with fresh loaves cooling on a table beside it"
+              width="800"
+              height="800"
+              loading="lazy">
+          </picture>
```

(The `<meta name="color-scheme">` line is for the next part of the lesson: it tells the browser the page supports both light and dark, so that even the first flash before the CSS loads has the right colour.)

### Check which file the browser chose

1. Open DevTools → **Network** tab → filter **Img**. Reload the page.
2. Make the window narrow (phone). You'll see `hero-400.webp` or `hero-800.webp`, and `story-square-…`.
3. Make it wide and reload. Now `hero-800.webp` or `hero-1200.webp` and `story-wide-…` are used instead. (The browser may keep the bigger file it already has in its cache, so disable the cache or do a hard reload with `Ctrl+Shift+R`.)
4. Click a picture in the **Elements** pane. DevTools shows the **rendered size**, the **intrinsic size** (the real size of the file) and the **current source** (`currentSrc`).
5. In the device toolbar, change the **DPR** (device pixel ratio) from 1 to 2 or 3 and reload: the browser asks for bigger files.

On a phone, the story picture is now a **square crop** where Bunny is large and clear. On a computer, it is the wide kitchen scene.

## 6. Listening to the person: preference media queries

Operating systems let people set preferences. CSS can read them:

| Media feature | Asks | Typical use |
|---------------|------|-------------|
| `prefers-color-scheme: dark` | Does the person want a dark theme? | Dark mode |
| `prefers-reduced-motion: reduce` | Do they want less motion? | Turn off animation (Lessons 9 and 12) |
| `prefers-contrast: more` | Do they want stronger contrast? | Darker borders and text |
| `prefers-reduced-data: reduce` | Do they want to save data? (limited support) | Skip heavy extras |
| `forced-colors: active` | Is high-contrast mode (Windows) on? | Make sure borders and focus rings still show |
| `hover: hover` / `pointer: coarse` | Can the device hover? Is it a finger? | Hover effects, bigger tap targets |
| `print` | Is the page being printed? | A clean printout |

## 7. Dark mode

Dark mode is easy **if your colours are tokens** (Lesson 8). We only need to give each token two values: one for light, one for dark. Two small CSS tools do it:

- **`color-scheme: light dark;`** on `:root` tells the browser that the page supports both. It makes the browser's own parts (form controls, scroll bars, default text and background) follow the person's choice.
- **`light-dark(light-value, dark-value)`** picks the first or the second colour depending on the **current colour scheme**.

```css
:root {
  color-scheme: light dark;
  --page: light-dark(#fff8f0, #1c1410);    /* cream by day, dark brown by night */
}
body { background-color: var(--page); }
```

(The older way is `@media (prefers-color-scheme: dark) { :root { --page: #1c1410; } }`. It works everywhere and does the same, but `light-dark()` keeps both values side by side.)

### First: names that tell the truth

Our colour tokens are named after **the colour**: `--white`, `--cream`, `--brown`. In dark mode, `--white` would be dark and `--brown` would be light: the names would lie. This is the moment to rename them by **role** (what the colour is *for*). Do it with your editor's **find and replace in all files** (VS Code: `Ctrl+Shift+H`; type the old name, the new name, and replace all). **Do them in this order**, because some names start with another (`--brown-soft` begins with `--brown`):

📄 **`styles.css`** (find and replace everywhere)

```text
--brown-soft → --text-soft
--brown → --text
--cream → --page
--peach → --tint
--white → --surface
--berry-dark → --accent-strong
--berry → --accent
--butter-pale → --highlight-soft
--butter → --highlight
--line-strong → --border-strong
--line → --border
```

Save and refresh. **The page looks exactly the same.** That is how a safe refactoring feels.

### Then: two values for each colour

Replace the colour tokens in `:root` with versions that have a light and a dark value. There are four new roles too: `--on-accent` (the text on an accent-coloured button), `--on-highlight` (the text on a yellow highlight), and `--footer` and `--on-footer` (the footer should stay dark in both modes). The shadows also become stronger in dark mode, where soft brown shadows would not show.

📄 **`styles.css`** (edit these lines)

```diff
 :root {
+  color-scheme: light dark;
+
-  /* Colours */
-  --text: #4a2c17;
-  --text-soft: #7a5a44;
-  --page: #fff8f0;
-  --tint: #ffe4d1;
-  --surface: #fff;
-  --accent: #b3365f;
-  --accent-strong: #8f2a4c;
-  --highlight: #ffd166;
-  --highlight-soft: #fff0d6;
-  --border: #e8d5c4;
-  --border-strong: #b89a84;
+  /* Colours: light-dark(value for light, value for dark) */
+  --text: light-dark(#4a2c17, #f7ebdd);
+  --text-soft: light-dark(#7a5a44, #cdb8a4);
+  --page: light-dark(#fff8f0, #1c1410);
+  --tint: light-dark(#ffe4d1, #3a281c);
+  --surface: light-dark(#fff, #2a1f19);
+  --accent: light-dark(#b3365f, #ff8fb1);
+  --accent-strong: light-dark(#8f2a4c, #ffb3cb);
+  --on-accent: light-dark(#fff, #2a1f19);
+  --highlight: #ffd166;
+  --on-highlight: #4a2c17;
+  --highlight-soft: light-dark(#fff0d6, #3b2d14);
+  --border: light-dark(#e8d5c4, #4a382c);
+  --border-strong: light-dark(#b89a84, #8a7360);
+  --footer: light-dark(#4a2c17, #120d0a);
+  --on-footer: light-dark(#fff8f0, #e9dccd);
@@
-  --shadow-s: 0 1px 2px rgb(74 44 23 / 0.08), 0 2px 8px rgb(74 44 23 / 0.08);
-  --shadow-m: 0 10px 30px rgb(74 44 23 / 0.18);
+  --shadow-s:
+    0 1px 2px light-dark(rgb(74 44 23 / 0.08), rgb(0 0 0 / 0.4)),
+    0 2px 8px light-dark(rgb(74 44 23 / 0.08), rgb(0 0 0 / 0.4));
+  --shadow-m: 0 10px 30px light-dark(rgb(74 44 23 / 0.18), rgb(0 0 0 / 0.55));
 }
```

Dark mode needed **different** accent colours, not just darker ones: a dark pink on a dark background would be hard to read, so in dark mode the accent becomes a **lighter** pink (`#ff8fb1`). Each pair was chosen so that text keeps a good **contrast ratio** in both modes.

Now the few places where a colour was really being used for a *different role* than its name:

📄 **`styles.css`** (edit these lines)

```diff
 mark {
   background-color: var(--highlight);
-  color: inherit;
+  color: var(--on-highlight);
 }
@@
-  background-color: var(--text);
-  color: var(--page);
+  background-color: var(--footer);
+  color: var(--on-footer);
@@
   border-radius: var(--radius-pill);
   background-color: var(--accent);
-  color: var(--surface);
+  color: var(--on-accent);
@@
   border-color: var(--accent);
-  color: var(--surface);
+  color: var(--on-accent);
@@
   background-color: var(--highlight);
-  color: var(--text);
+  color: var(--on-highlight);
@@
   border-radius: 0 0 var(--radius) var(--radius);
   background-color: var(--accent);
-  color: var(--surface);
+  color: var(--on-accent);
@@
 textarea {
   font: inherit;
+  color: inherit;
 }
```

(Form fields don't inherit the text colour by default, only the font if you ask. With `color: inherit`, they follow our tokens in both themes.)

### Try dark mode

- Chrome and Edge: DevTools → press `Ctrl+Shift+P` (Cmd+Shift+P on Mac) → type **"Emulate CSS prefers-color-scheme: dark"**. Firefox: the little sun/moon icon in the **Inspector** (Styles pane).
- Or change your operating system's theme (Windows: Settings → Personalization → Colors; Mac: System Settings → Appearance).

The whole page turns dark: a dark brown background, cream text, a lighter pink accent, dark cards. The footer is darker still. Form fields, the scroll bar and the date picker are dark too, thanks to `color-scheme`. Switch back to light to check that nothing changed.

**Test both themes, with contrast!** Open the dark page in DevTools and use the colour picker on text, or run a Lighthouse accessibility check in both themes.

### A switch for people who want to choose

`light-dark()` follows `color-scheme`, which you can also set on any element. A "theme" button with a little JavaScript sets `document.documentElement.style.colorScheme = "dark"` (or `"light"`) and saves the choice. We don't need it here; the person's operating system choice is a good default.

## 8. Hover only where it makes sense

On a touch screen, there is no hover: tapping a card makes it "stick" in its hovered state until you tap somewhere else. Wrap hover-only effects in `(hover: hover)` so that they exist only on devices that hover:

📄 **`styles.css`** (edit these lines)

```diff
-.card:hover {
-  transform: translateY(-4px);
-  box-shadow: var(--shadow-m);
-}
+/* Lifting on hover only makes sense for devices that can hover (not fingers) */
+@media (hover: hover) {
+  .card:hover {
+    transform: translateY(-4px);
+    box-shadow: var(--shadow-m);
+  }
+}
```

## 9. Print styles

Some people print pages (a menu, a recipe, a ticket) or save them as PDF. A small `@media print` block removes what makes no sense on paper and shows the address of links:

📄 **`styles.css`** (add to the bottom)

```css
/* ========== Printing ========== */
@media print {
  .site-header,
  .site-footer,
  .skip-link,
  form,
  .hero::before {
    display: none;
  }

  body {
    background: #fff;
    color: #000;
  }

  .card {
    box-shadow: none;
    break-inside: avoid;
  }

  a[href^="http"]::after {
    content: " (" attr(href) ")";
  }
}
```

Press `Ctrl+P` (Cmd+P) and look at the preview: no header, footer or form, black text on white, and the map link shows its address. `break-inside: avoid` keeps a card from being cut in two by a page break.

## 10. What just happened?

```text
          the person's device says...            your CSS listens with...

   "I'm on a phone with a retina screen"      srcset + sizes  ──► the right file size
   "I'm on a phone, portrait"                 <picture media>  ──► the right crop
   "I prefer dark"                            color-scheme + light-dark()   ──► the right theme
   "I can't hover (touch)"                    @media (hover: hover)         ──► no sticky hover
   "I'm printing"                             @media print                  ──► a clean page
```

Because the colours were **tokens** (Lesson 8), supporting a second theme took about forty lines of CSS and no changes to the rules that use them. That is the payoff of naming things by role.

## 🧪 Try it yourself

1. Change `sizes` on the hero to `100vw` (wrong on purpose) and look at the Network tab on a wide screen. Which file is chosen now? Why is an honest `sizes` important?
2. In the Network tab, set **Throttling** to "Slow 4G" and reload. Does the page become usable before all pictures arrive? Which attribute helps most for that?
3. Remove `width` and `height` from the story `<img>` and reload with a slow connection. Does the content jump? Put them back.
4. Remove `loading="lazy"` from the story picture. Is the picture downloaded now when you haven't scrolled there? (Network tab, look at the time it appears.)
5. Add `fetchpriority="high"` to the story picture too. Why would that be a mistake? (Only one picture can be the most important.)
6. Open `images/logo.svg` directly in the browser and zoom to 800%. Then zoom a `.webp` picture the same way. Why are SVGs the best format for logos?
7. In dark mode, change only `--accent` to `#b3365f` (the light value). Check a heading's contrast with the DevTools colour picker. Why does it fail?
8. Make the images a little dimmer in dark mode: `@media (prefers-color-scheme: dark) { img { filter: brightness(0.9); } }`.
9. Try a manual dark-mode switch: in the DevTools console type `document.documentElement.style.colorScheme = "dark"`. The page follows, whatever the system says (`light-dark()` reads `color-scheme`).
10. Turn on "Emulate CSS media feature forced-colors: active" in DevTools → Rendering. Is the focus ring still visible? Are buttons still recognisable as buttons?
11. Print preview in landscape and portrait. Does anything get cut in the middle?

## ✅ Check yourself

<details>
<summary>1. What does <code>480w</code> mean in <code>srcset="small.webp 480w"</code>?</summary>

That the file `small.webp` is 480 pixels wide (its real, intrinsic width). It is not a screen width.
</details>

<details>
<summary>2. What is <code>sizes</code> for, and why is it needed?</summary>

It tells the browser how wide the picture will be on the page, so it can calculate how many pixels it needs. The browser must choose a file before the CSS has loaded, so it can't find the width by itself.
</details>

<details>
<summary>3. When do you use <code>&lt;picture&gt;</code> instead of just <code>srcset</code>?</summary>

When you need a different crop for different screens (art direction), or different image formats. For the same picture in different sizes, `srcset` and `sizes` on an `<img>` are enough.
</details>

<details>
<summary>4. Which picture should <em>not</em> have <code>loading="lazy"</code>?</summary>

The ones visible on the first screen, especially the main (hero) picture: lazy loading would delay what people see first.
</details>

<details>
<summary>5. Why did we rename <code>--white</code> to <code>--surface</code> before adding dark mode?</summary>

A token should be named after its role, not its value. In dark mode the "white" surface is dark, so the old name would be misleading.
</details>

## Recap

- `srcset` + `sizes` let the browser pick the best file size; `<picture>` lets you swap crops (art direction) or formats. Keep `width` and `height`; use `loading="lazy"` below the fold and `fetchpriority="high"` for the hero.
- `prefers-color-scheme`, `prefers-reduced-motion`, `prefers-contrast`, `hover` and `print` let CSS listen to the person.
- Dark mode: `color-scheme: light dark` plus tokens with `light-dark()`. Name tokens by **role**.
- Wrap hover-only effects in `@media (hover: hover)`, and give the page a small print stylesheet.
- Test: the Network tab for images, emulated preferences in DevTools for the rest.

➡️ **Next:** [Lesson 16 – Modern CSS](16-modern-css.md)
