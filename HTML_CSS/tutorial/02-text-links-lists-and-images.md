# Lesson 2: Text, Links, Lists and Images

> **Like I'm 5:** A page is like a picture book. It has **words** (headings and paragraphs), **lists** (what is on the menu), **doors to other places** (links) and **pictures**. HTML has a name tag for each of them.

| | |
|---|---|
| **You will learn** | Headings, paragraphs, bold and italic, lists, links (to other sites, to places on the same page, to email and phone), images with `alt` text, comments and special characters |
| **You will build** | A real, readable Bunny Bakery page: a hero picture, a menu list, opening hours, and links |
| **Time** | About 45 minutes |

## The story

Bunny's page says her name, but nobody can see her shop or her treats yet. Time to add words, a list and a picture.

## 1. Headings and paragraphs

HTML has six heading levels, `<h1>` (most important) to `<h6>` (least important). Think of the headings of a book:

```text
h1  The title of the whole page          (only ONE per page)
 ├── h2  A big section                   "Our menu"
 │    └── h3  A part of that section     "Breads"
 └── h2  Another big section             "Opening hours"
```

Rules of thumb:

- **One `<h1>`** per page: what the page is about.
- **Do not skip levels** (no `<h2>` straight to `<h4>`). Screen-reader users jump from heading to heading, like using a table of contents.
- **Choose a heading for its meaning, not its size.** Making text big is the job of CSS (Lesson 8).

Text in paragraphs goes in `<p>`. To stress a few words inside a paragraph, use:

| Element | Meaning | Looks like (by default) |
|---------|---------|-------------------------|
| `<strong>` | Important | **bold** |
| `<em>` | Emphasis (the way you would say it out loud) | *italic* |
| `<small>` | Fine print | smaller text |
| `<s>` | No longer correct | ~~strikethrough~~ |
| `<mark>` | Highlight | yellow marker |

Bold and italic are only the *default look*. `<strong>` means "this is important", whatever it looks like.

Open `index.html` and replace the `<body>` content:

📄 **`index.html`** (edit these lines)

```diff
   <body>
     <h1>Bunny Bakery</h1>
-    <p>Fresh bread and sweet treats, baked every morning.</p>
+    <p>Fresh <strong>bread</strong> and sweet treats, baked <em>every morning</em>.</p>
+    <p>New this week: carrot cupcakes with <mark>cream-cheese frosting</mark>.</p>
+
+    <h2>Our menu</h2>
+    <p>Everything is made by hand, in small batches, with real butter.</p>
   </body>
```

Save and refresh. Compare what you see with the code: bold, italic, and a yellow marker.

## 2. Lists

There are three kinds of lists.

| Element | Name | Use it for |
|---------|------|------------|
| `<ul>` | **U**nordered list (bullets) | Things where order does not matter: a menu |
| `<ol>` | **O**rdered list (numbers) | Steps, rankings |
| `<dl>` | **D**escription list | Term and meaning pairs: a glossary |

Inside `<ul>` and `<ol>`, every item is an `<li>` (**l**ist **i**tem). *Only `<li>` elements may be direct children of a list.* Lists can be nested: put a whole `<ul>` inside an `<li>`.

📄 **`index.html`** (edit these lines)

```diff
     <p>Everything is made by hand, in small batches, with real butter.</p>
+    <ul>
+      <li>Sourdough loaf</li>
+      <li>Butter croissant</li>
+      <li>Carrot cupcake</li>
+      <li>Oat and raisin cookie</li>
+      <li>Cinnamon bun</li>
+      <li>Strawberry tart</li>
+    </ul>
+
+    <h2>How to order a box</h2>
+    <ol>
+      <li>Pick your treats.</li>
+      <li>Tell us the day you want to collect them.</li>
+      <li>Come by and say hello!</li>
+    </ol>
   </body>
```

Save and refresh. The first list has bullets and the second has numbers: you never typed a bullet or a number. The browser added them.

## 3. Links

Links are what make the *web* a web. A link is an `<a>` (**a**nchor) element with an `href` (**h**ypertext **ref**erence) attribute that says where to go.

```html
<a href="https://developer.mozilla.org">Learn on MDN</a>
```

The `href` can point to many kinds of places:

| `href` | Goes to |
|--------|---------|
| `https://example.com/page` | Another website (an **absolute** URL, with the full address) |
| `about.html` or `pages/about.html` | Another file in your own site (a **relative** URL, from this file's folder) |
| `#opening-hours` | A spot on **this** page whose `id` is `opening-hours` |
| `mailto:hello@bunnybakery.example` | Opens the email app |
| `tel:+15550123` | Starts a phone call (on phones) |

### Link to a place on the same page

Any element can get an `id`, a unique name on the page. A link to `#that-id` scrolls there. Add an `id` to the "How to order" heading, then link to it from the top:

📄 **`index.html`** (edit these lines)

```diff
     <p>New this week: carrot cupcakes with <mark>cream-cheese frosting</mark>.</p>
+    <p><a href="#order-a-box">Jump to: how to order a box</a></p>

     <h2>Our menu</h2>
@@
-    <h2>How to order a box</h2>
+    <h2 id="order-a-box">How to order a box</h2>
     <ol>
```

### Link to other websites, email and phone

Add a "Find us" section at the bottom. The map link opens another website, so we add two small attributes:

📄 **`index.html`** (edit these lines)

```diff
       <li>Come by and say hello!</li>
     </ol>
+
+    <h2>Find us</h2>
+    <p>12 Carrot Lane, Meadowtown.</p>
+    <p>
+      <a href="https://www.openstreetmap.org/search?query=Carrot%20Lane" target="_blank" rel="noopener">Open the map</a> (opens in a new tab)
+    </p>
+    <p>
+      Call <a href="tel:+15550123">+1&nbsp;555&nbsp;0123</a>
+      or write to <a href="mailto:hello@bunnybakery.example">hello@bunnybakery.example</a>.
+    </p>
   </body>
```

- **`target="_blank"`** opens the link in a new tab. Use it sparingly: it takes control away from the visitor, so always tell them it will happen.
- **`rel="noopener"`** keeps the new tab from being able to control the old one. (Modern browsers do this automatically, but writing it is a harmless habit that also helps older browsers.)
- **`&nbsp;`** in the phone number is a space that never breaks across two lines, so the number stays in one piece (more about it in section 5).

**Write link text that makes sense alone.** Screen-reader users often listen to a list of all the links on a page. "Open the map" is helpful; "click here" and "read more" are not.

## 4. Images

An image is a *void* element (no closing tag):

```html
<img src="images/hero-800.webp" alt="..." width="800" height="600">
```

| Attribute | What it does |
|-----------|--------------|
| `src` | **Where** the picture file is (a relative path here) |
| `alt` | A text description. Read by screen readers, shown if the picture fails to load, and used by search engines. **Required.** |
| `width` and `height` | The picture's real size in pixels. They let the browser reserve the right amount of space *before* the picture loads, so the page doesn't jump around |

Bunny's pictures are ready for you in this repository, in `HTML_CSS/tutorial/finished-project/bunny-bakery/images/`. Copy that folder into your project folder (`bunny-bakery`), next to `index.html`. In the terminal (use the real path to your copy of this repository in place of `<this-repo>`):

```bash
cp -r <this-repo>/HTML_CSS/tutorial/finished-project/bunny-bakery/images images
```

Or copy and paste the `images` folder with your file explorer. Your project now looks like this:

```text
bunny-bakery/
├── images/
│   ├── logo.svg
│   ├── hero-400.webp   hero-800.webp   hero-1200.webp   hero-800.png
│   ├── story-wide-640.webp   story-wide-1280.webp   story-wide-1280.png
│   └── story-square-400.webp   story-square-800.webp
└── index.html
```

Several sizes of the same picture are there on purpose. In Lesson 15 you will let each phone or computer pick the size that suits it. For now, use the middle one.

📄 **`index.html`** (edit these lines)

```diff
     <h1>Bunny Bakery</h1>
     <p>Fresh <strong>bread</strong> and sweet treats, baked <em>every morning</em>.</p>
+    <img src="images/hero-800.webp" alt="The Bunny Bakery shop: a pink and white striped awning, a window full of fresh bread and a bunny baker holding a tray of rolls" width="800" height="600">
     <p>New this week: carrot cupcakes with <mark>cream-cheese frosting</mark>.</p>
```

Refresh. The shop appears! 🐰

### Writing good `alt` text

- **Describe what the picture *says*** in the place where it is used, in one short sentence, as if reading it to a friend over the phone.
- **Don't start with "Image of…"**: screen readers already say it is an image.
- **Decorative pictures** (pure decoration, nothing to say) get an *empty* alt: `alt=""`. Screen readers then skip them. Never leave `alt` out completely: some screen readers read the file name instead.
- **A logo** inside a link to the home page: `alt="Bunny Bakery"` (what the link *does*).

### Other things pictures can be

- **Format:** `.webp` is small and sharp (supported everywhere), `.png` for sharp-edged graphics, `.jpg` for photos, **`.svg`** for logos and icons: SVGs are tiny and stay crisp at any size.
- **Size matters.** A 5 MB photo on a phone is slow and expensive for the visitor. Make the file about as big as it is shown (Lesson 15).

## 5. Line breaks, dividing lines, comments and special characters

- `<br>` is a line break inside a paragraph (for addresses or poems; not to create spacing: that is CSS's job).
- `<hr>` is a thematic break between sections (a line by default).
- `<!-- … -->` is a **comment**. The browser ignores it.
- Special characters: `<` and `&` are part of HTML's own syntax, so to show them as text you write **entities**: `&lt;` (<), `&gt;` (>), `&amp;` (&), `&copy;` (©), `&nbsp;` (a space that never breaks).

Use them to improve the address, and to add a copyright line at the very end of the page:

📄 **`index.html`** (edit these lines)

```diff
     <h2>Find us</h2>
-    <p>12 Carrot Lane, Meadowtown.</p>
+    <!-- The address is a single paragraph with line breaks -->
+    <p>
+      Bunny Bakery<br>
+      12 Carrot Lane<br>
+      Meadowtown
+    </p>
@@
       or write to <a href="mailto:hello@bunnybakery.example">hello@bunnybakery.example</a>.
     </p>
+
+    <hr>
+    <p><small>&copy; 2026 Bunny Bakery &ndash; bread &amp; sweet treats</small></p>
   </body>
```

## 6. What just happened?

You used about ten elements and the page is already useful: it can be read, navigated, spoken aloud by a screen reader, and indexed by a search engine. It doesn't *look* designed yet, and that is on purpose: **HTML describes what things are, and the default look is only a polite suggestion.**

This is the whole file after this lesson (in case you want to compare):

```text
body
├── h1  Bunny Bakery
├── p   Fresh bread and sweet treats…      (strong, em)
├── img hero
├── p   New this week… (mark)
├── p   a link to #order-a-box
├── h2  Our menu
├── p
├── ul  → 6 × li
├── h2#order-a-box  How to order a box
├── ol  → 3 × li
├── h2  Find us
├── (comment)
├── p   address (br)
├── p   map link (target=_blank)
├── p   tel + mailto links
├── hr
└── p   small → © …
```

## 🧪 Try it yourself

1. Click "Jump to: how to order a box". The page scrolls (if the page is short, make the window smaller or add more text). Now look at the address bar: what was added at the end?
2. Remove the `width` and `height` from the `<img>`, then refresh several times with the DevTools **Network** tab throttled to "Slow 4G". Does the text below the picture jump when the picture arrives? Put them back.
3. Break the `src` on purpose (`hero-8000.webp`). What do you see in place of the picture? Now you know why `alt` matters.
4. Make the `<ol>` start at 5 with `<ol start="5">`, then try `<ol reversed>`.
5. Put an `<ul>` inside one of the `<li>` of the menu (for example, flavours inside "Carrot cupcake"). Notice that the bullets change shape on their own.
6. Write `5 < 7 & 3 > 2` in a paragraph. Then write it correctly with entities.
7. Use DevTools (**Elements**) to hover over the image. What size does the browser show for it? Is it the same as its `width` and `height` attributes?

## ✅ Check yourself

<details>
<summary>1. When do you use <code>&lt;strong&gt;</code> instead of <code>&lt;b&gt;</code>?</summary>

When the words are *important*. `<strong>` carries meaning (screen readers can stress it); `<b>` only draws attention visually, with no extra importance. When in doubt, use `<strong>`.
</details>

<details>
<summary>2. How do you make a link that jumps to a heading further down the same page?</summary>

Give the heading an `id` (`<h2 id="menu">`), and link with `<a href="#menu">`.
</details>

<details>
<summary>3. What is <code>alt</code> for, and what do you put in it for a purely decorative picture?</summary>

`alt` is the text alternative for people who can't see the image (screen-reader users, slow connections, broken links) and for search engines. For a purely decorative picture, use an empty `alt=""` so assistive technology skips it.
</details>

<details>
<summary>4. Why give <code>&lt;img&gt;</code> a <code>width</code> and <code>height</code>?</summary>

So the browser can reserve the space before the file arrives, which prevents the page content from jumping (called *layout shift*).
</details>

<details>
<summary>5. Why is "click here" a bad link text?</summary>

Out of context it says nothing. People who navigate by a list of links, and search engines, need the link text itself to describe where it goes.
</details>

## Recap

- Headings give structure (one `<h1>`, no skipped levels); paragraphs hold text; `<strong>` and `<em>` carry meaning.
- Lists are `<ul>`, `<ol>` and `<dl>`; only `<li>` goes directly inside `<ul>` and `<ol>`.
- `<a href>` makes links: to other sites, other files, a place on the same page (`#id`), email (`mailto:`) and phone (`tel:`).
- `<img>` needs `src`, a useful `alt` (or `alt=""` for decoration), and `width` and `height`.
- Entities (`&amp;`, `&lt;`, `&copy;`) show special characters; comments are `<!-- -->`.

➡️ **Next:** [Lesson 3 – Semantic HTML and accessibility](03-semantic-html-and-accessibility.md)
