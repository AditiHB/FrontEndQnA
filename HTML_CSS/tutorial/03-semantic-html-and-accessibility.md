# Lesson 3: Semantic HTML and Accessibility

> **Like I'm 5:** A toy box with labels ("cars", "blocks", "dolls") is easier to tidy than one big pile. **Semantic HTML** puts the right label on every part of the page, so people, screen readers and search engines all know where things are.

| | |
|---|---|
| **You will learn** | Landmark elements (`header`, `nav`, `main`, `section`, `footer`…), why `<div>` is the last resort, how headings form an outline, `figure`, `address`, skip links, and the basics of making a page work for everybody |
| **You will build** | The **final structure** of the whole Bunny Bakery page: header and navigation, hero, menu, story, visit, order and footer |
| **Time** | About 45 minutes |

## The story

Bunny's page now has everything on it, but it is one long pile. Before we can style it, each part needs a name: this is the header, this is the menu, this is the footer. The good news: giving the parts names also makes the page work better for **people who can't see the screen, can't use a mouse, or use a different device**. That is called **accessibility** (often written *a11y*), and it is not an extra: it is part of doing HTML properly.

## 1. `div` is a box with no label

HTML has two "nothing" containers:

| Element | Behaves as | Means |
|---------|-----------|-------|
| `<div>` | a block (starts on a new line) | *nothing* |
| `<span>` | inline (stays inside a line of text) | *nothing* |

They are useful when you need a box only for styling, which happens a lot from Lesson 7 on. But if you build a whole page out of `<div>`s, the browser has no idea what anything is:

```html
<!-- "div soup": looks fine, means nothing -->
<div class="top">
  <div class="logo">Bunny Bakery</div>
  <div class="links"> <div>Menu</div> <div>Story</div> </div>
</div>
```

The same page with **semantic** elements (elements whose *name* tells their job):

```html
<header>
  <a href="#top">Bunny Bakery</a>
  <nav> <ul> <li><a href="#menu">Menu</a></li> <li><a href="#story">Story</a></li> </ul> </nav>
</header>
```

You get a lot for free: screen readers announce "navigation", people can jump straight to the main content, search engines understand the page, and *you* can read the code a year later.

## 2. The page landmarks

These elements are called **landmarks**, like signposts in a city:

| Element | What it is | Use |
|---------|------------|-----|
| `<header>` | Introductory content | Logo and navigation of the page (or the heading of a section) |
| `<nav>` | A block of navigation links | The main menu. Not every group of links is a `<nav>` |
| `<main>` | The main content of the page | **Exactly one** per page |
| `<section>` | A themed group of content that has a heading | Menu, Our story, Visit us… |
| `<article>` | A piece that makes sense on its own | A blog post, a news story, a product card people could share |
| `<aside>` | Related but side content | A tip box, a sidebar |
| `<footer>` | Closing content | Copyright, small links, address |
| `<figure>` + `<figcaption>` | A picture (or diagram, code…) with a caption | Illustrations |
| `<address>` | Contact details for the page or the author | Phone, email, street |

```text
┌──────────────────────────── body ────────────────────────────┐
│ ┌────────────────────────── header ──────────────────────┐   │
│ │  logo                         nav ► Menu · Story · …   │   │
│ └────────────────────────────────────────────────────────┘   │
│ ┌────────────────────────── main ────────────────────────┐   │
│ │ ┌ section: hero ──────────────────────────────────────┐│   │
│ │ ├ section: menu    (… aside: a tip)                   ││   │
│ │ ├ section: story   (… figure + figcaption)            ││   │
│ │ ├ section: visit   (… address)                        ││   │
│ │ └ section: order                                      ││   │
│ └────────────────────────────────────────────────────────┘   │
│ ┌────────────────────────── footer ──────────────────────┐   │
│ └────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

The rule for choosing: **ask "what is this?" before "how should it look?"** If a semantic element fits, use it. Only if none fits, use `<div>` or `<span>`.

## 3. Build the final structure

We now reorganise the page into its final shape. Everything you wrote in Lesson 2 is still here, just in better boxes, with a few more pieces of content. Replace the whole file:

📄 **`index.html`** (replace everything)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bunny Bakery | Fresh bread and sweet treats</title>
    <meta name="description" content="Bunny Bakery in Meadowtown: sourdough, croissants, cupcakes and more, baked by hand every morning.">
    <link rel="icon" href="images/logo.svg" type="image/svg+xml">
  </head>
  <body>
    <a href="#main">Skip to the content</a>

    <header>
      <a href="#top"><img src="images/logo.svg" alt="" width="40" height="40"> Bunny Bakery</a>
      <nav aria-label="Main">
        <ul>
          <li><a href="#menu">Menu</a></li>
          <li><a href="#story">Our story</a></li>
          <li><a href="#visit">Visit</a></li>
          <li><a href="#order">Order</a></li>
        </ul>
      </nav>
    </header>

    <main id="main">
      <section aria-labelledby="hero-title">
        <h1 id="hero-title">Fresh bread and sweet treats, baked every morning</h1>
        <p>
          Welcome to <strong>Bunny Bakery</strong>, a small neighbourhood bakery in Meadowtown.
          Everything is made by hand, in small batches, with real butter.
        </p>
        <p>
          <a href="#menu">See the menu</a>
          <a href="#order">Order a box</a>
        </p>
        <img src="images/hero-800.webp" alt="The Bunny Bakery shop front: a striped awning, a window full of fresh bread and a bunny baker holding a tray of rolls" width="800" height="600">
      </section>

      <section id="menu" aria-labelledby="menu-title">
        <h2 id="menu-title">Our menu</h2>
        <p>New this week: <mark>carrot cupcakes</mark> with cream-cheese frosting.</p>
        <ul>
          <li>
            <h3>Sourdough loaf</h3>
            <p>Slow-risen, with a crackly crust and a soft middle.</p>
            <p>$6.00</p>
          </li>
          <li>
            <h3>Butter croissant</h3>
            <p>Flaky layers, golden on the outside, tender inside.</p>
            <p>$3.50</p>
          </li>
          <li>
            <h3>Carrot cupcake</h3>
            <p>Spiced sponge, cream-cheese frosting and a tiny candied carrot.</p>
            <p>$4.00</p>
          </li>
          <li>
            <h3>Oat and raisin cookie</h3>
            <p>Chewy in the middle, crisp at the edge.</p>
            <p>$2.50</p>
          </li>
          <li>
            <h3>Cinnamon bun</h3>
            <p>Warm, sticky and swirled with brown sugar.</p>
            <p>$4.00</p>
          </li>
          <li>
            <h3>Strawberry tart</h3>
            <p>Crisp pastry, vanilla cream and fresh strawberries.</p>
            <p>$5.00</p>
          </li>
        </ul>
        <aside>
          <h3>Bunny's tip</h3>
          <p>Bread tastes best on the day it is baked. The next day, toast it with butter.</p>
        </aside>
      </section>

      <section id="story" aria-labelledby="story-title">
        <h2 id="story-title">Our story</h2>
        <figure>
          <img src="images/story-wide-1280.webp" alt="Bunny in a chef's hat pointing at a glowing oven, with fresh loaves cooling on a table beside it" width="1280" height="720">
          <figcaption>Bunny checks the first loaves of the morning.</figcaption>
        </figure>
        <p>
          Bunny learned to bake in her grandmother's kitchen, standing on a wooden box
          to reach the counter. Her first loaf was a little flat, and everybody ate it anyway.
        </p>
        <p>
          Today she gets up before the sun to start the ovens, so that the first warm
          bread is on the shelf when the neighbours walk by. Every recipe is still made
          the slow, careful way she was taught.
        </p>
      </section>

      <section id="visit" aria-labelledby="visit-title">
        <h2 id="visit-title">Visit us</h2>
        <h3>Opening hours</h3>
        <ul>
          <li>Monday to Friday: 7:00 to 18:00</li>
          <li>Saturday: 8:00 to 16:00</li>
          <li>Sunday: 8:00 to 13:00</li>
        </ul>
        <h3>Find us</h3>
        <address>
          Bunny Bakery<br>
          12 Carrot Lane<br>
          Meadowtown<br>
          <a href="tel:+15550123">+1&nbsp;555&nbsp;0123</a><br>
          <a href="mailto:hello@bunnybakery.example">hello@bunnybakery.example</a>
        </address>
        <p>
          <a href="https://www.openstreetmap.org/search?query=Carrot%20Lane" target="_blank" rel="noopener">Open the map</a>
          (opens in a new tab)
        </p>
      </section>

      <section id="order" aria-labelledby="order-title">
        <h2 id="order-title">Order a box</h2>
        <p>Choose your treats and tell us when you will come by. We will have your box ready.</p>
        <!-- The order form arrives in Lesson 4 -->
      </section>
    </main>

    <footer>
      <p>&copy; 2026 Bunny Bakery. Made with &hearts; and a lot of butter.</p>
      <p><a href="#top">Back to the top</a></p>
    </footer>
  </body>
</html>
```

Save and refresh. It still looks plain, but compare it to the Lesson 2 page: there is a header with navigation, six treats, a caption under a picture, and a footer. Click the navigation links and see how the page scrolls to each section.

> **Pictures sticking out?** If your window is narrow, the pictures are wider than the page and a horizontal scroll bar appears. That is expected: the browser shows each picture at its full size, and we have not told it anything else yet. One line of CSS fixes it in Lesson 5.

## 4. What changed, and why

**`<a href="#main">Skip to the content</a>`: the skip link.** Keyboard users move through links with the **Tab** key. Without this link they would tab through every navigation link on *every* page before reaching the content. The link jumps over the header. (In Lesson 12 we will hide it until someone presses Tab, which is the usual way.)

**`<nav aria-label="Main">`.** A page can have several navigations (the main one, a footer one…). `aria-label` gives each a name that screen readers read out ("Main navigation").

**Logo image with `alt=""`.** The picture sits right next to the words "Bunny Bakery" inside the same link, so a screen reader would say the name twice. Empty `alt` means "decoration".

**`<section aria-labelledby="menu-title">`.** `aria-labelledby` points to the `id` of the heading that names the section. A `<section>` without a name is just a `<div>` to screen readers; with a name it becomes a landmark called "Our menu".

**`<main id="main">`.** One per page. It is the target of the skip link.

**One `<h1>`, then `<h2>` per section, `<h3>` inside.** Look at the outline:

```text
h1  Fresh bread and sweet treats, baked every morning
h2  Our menu
      h3  Sourdough loaf  … (6 items)
      h3  Bunny's tip
h2  Our story
h2  Visit us
      h3  Opening hours
      h3  Find us
h2  Order a box
```

If you read only the headings you understand the page. That's exactly what screen-reader users do.

**`<address>`.** Only for *contact information* about the page's owner. Not for any postal address (for example, a delivery address typed in a form).

**`<figure>` and `<figcaption>`.** Tie a picture to its caption. The figure can be moved around the page without losing its caption.

**Text that carries the meaning.** Notice the link texts: "See the menu", "Order a box", "Open the map". None says "click here".

## 5. Accessibility, in five habits

Accessibility means your page works for people who:

- cannot see (use a **screen reader**, which reads the page aloud),
- cannot use a mouse (use the **keyboard**, a switch, or voice control),
- see poorly or are colour-blind (zoom, high contrast),
- are deaf or hard of hearing, or have a different language, or are in bright sunlight, or have a broken arm…

Almost everything you need is *using the right HTML element*. Five habits:

1. **Use the element made for the job.** A link is `<a href>` (goes somewhere). A button is `<button>` (does something). Never make a clickable `<div>`: it can't be reached with Tab, and screen readers don't call it a button.
2. **Describe images** (`alt`) and **name your links** (not "click here").
3. **Keep the heading outline in order.** One `<h1>`, no skipped levels.
4. **Make everything reachable and visible with the keyboard.** Interactive elements must show where you are (the "focus ring") when you press Tab. Never remove it without giving something better (Lesson 6 and 9).
5. **Do not rely on colour alone**, and keep enough contrast between text and background (Lesson 8).

> **The first rule of ARIA:** ARIA is a set of extra attributes (`aria-label`, `aria-labelledby`, `role`…) that fill in meaning where HTML has no element for it. But **no ARIA is better than bad ARIA**. If a native element exists (`<button>`, `<nav>`), use it and skip the ARIA.

### Test it with the keyboard

Put your mouse away and press **Tab** repeatedly:

- The first stop is the skip link; press **Enter** and the focus jumps over the header.
- Every link gets focus in a sensible order (top to bottom).
- Press **Shift+Tab** to go back.

### Look at what the browser understands

In Chrome or Edge: DevTools → **Elements** → **Accessibility** tab shows the *accessibility tree*: the page as a screen reader sees it ("banner", "navigation", "main", "heading level 2"…). In Firefox: DevTools → **Accessibility**. There you will find a ready-made check for common problems too. Another free tool is **Lighthouse** (DevTools → Lighthouse → Accessibility), and **axe DevTools** is a browser extension that finds many mistakes in one click.

Tools find only about a third of the problems, so also try the keyboard, and zoom the page to 200%.

## 🧪 Try it yourself

1. Press **Tab** through the page. Where does the focus go first? Press **Enter** on it.
2. Open the Accessibility tree in DevTools. Find the landmarks "banner" (header), "navigation", "main", "contentinfo" (footer), and the regions named after your section headings.
3. Change `<h3>Sourdough loaf</h3>` to `<h5>`. Look at the outline in DevTools. Why is skipping levels a problem? Undo it.
4. Delete `aria-labelledby="menu-title"` from the `<section id="menu">`. Is it still a "region" landmark in the accessibility tree?
5. Replace the `<main>` element with `<div>`. What happens to the skip link target, and to the accessibility tree? Undo it.
6. Turn on a screen reader (VoiceOver on Mac with `Cmd+F5`, NVDA on Windows (free), TalkBack on Android) and listen to the first screen of the page. Does it make sense without looking?
7. Zoom your browser to 200% (`Ctrl` and `+`). Does everything remain readable?

## ✅ Check yourself

<details>
<summary>1. Why is <code>&lt;nav&gt;</code> better than <code>&lt;div class="nav"&gt;</code>?</summary>

`<nav>` *means* "navigation": browsers, screen readers and search engines understand it and let people jump to it. A `<div>` means nothing, whatever its class is called.
</details>

<details>
<summary>2. How many <code>&lt;main&gt;</code> and <code>&lt;h1&gt;</code> elements should a page have?</summary>

One `<main>` and (normally) one `<h1>`.
</details>

<details>
<summary>3. When is it correct to use <code>&lt;div&gt;</code>?</summary>

When no semantic element fits and you need a container only for grouping or styling (for example, a wrapper you will lay out with Flexbox in Lesson 10).
</details>

<details>
<summary>4. What is a skip link for?</summary>

It lets keyboard and screen-reader users jump over the repeated header and navigation straight to the main content.
</details>

<details>
<summary>5. A friend made a clickable <code>&lt;div&gt;</code> that works like a button. What is wrong with that?</summary>

A `<div>` can't be reached with the Tab key, can't be activated with Enter or Space, and screen readers don't announce it as a button. A real `<button>` gives you all of that for free.
</details>

## Recap

- Use the element that *means* the right thing: `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`, `figure`, `address`. Use `div` and `span` only when nothing else fits.
- One `<main>`, one `<h1>`, headings in order: the headings form the outline of the page.
- Name your landmarks (`aria-label`, `aria-labelledby`), give images useful `alt` text, write clear link texts, and add a skip link.
- Test with the keyboard (Tab) and with DevTools' accessibility tools.
- Native HTML first. ARIA only to fill gaps.

➡️ **Next:** [Lesson 4 – Forms and tables](04-forms-and-tables.md)
