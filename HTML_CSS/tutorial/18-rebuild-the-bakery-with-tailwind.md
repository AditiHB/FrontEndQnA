# Lesson 18: Rebuild the Bakery with Tailwind

> **Like I'm 5:** You have built a LEGO castle with a custom plan. Now you build **the same castle** again, this time from a kit with lots of ready-made pieces. It looks the same, but you build it differently. And by building it twice, you really *understand* the castle.

| | |
|---|---|
| **You will learn** | How every idea of Lessons 5 to 16 looks in Tailwind: layout, responsive variants, container queries, `has-*`, `group`, pseudo-elements, dark mode, arbitrary values, **components** with `@apply`, and when to write plain CSS in a Tailwind project |
| **You will build** | The **complete** Bunny Bakery site again, in `bunny-bakery-tailwind`, identical to the plain version |
| **Time** | About 2 to 3 hours |

## The story

Bunny's cousin looks at the Tailwind version over her shoulder. "It's the same page! Where is all the CSS?" Bunny smiles: "In the class names, and a bit in `input.css`." In this lesson you will translate the whole site, piece by piece, and see exactly where each plain-CSS rule went.

## 1. Plan

You already have the folder `bunny-bakery-tailwind` from Lesson 17, with Tailwind installed, a theme in `src/input.css` and a small test page. We will:

1. copy the pictures and the tiny script from the plain site,
2. extend `src/input.css` (an animation, a few base rules, and **components**),
3. replace the test page with the full bakery.

Make sure you are inside `bunny-bakery-tailwind`, and copy the pictures and the script from the plain project (they sit next to this folder):

```bash
cp -r ../bunny-bakery/images images
cp ../bunny-bakery/site.js site.js
```

(Or copy and paste them in your file explorer.) Start the watcher in a terminal (`npm run dev`) and keep it running while you work.

## 2. `src/input.css`: the theme, the base and the components

The theme is the one you wrote in Lesson 17, plus an animation. Below it, two new `@layer` blocks. Replace the whole file:

📄 **`src/input.css`** (replace everything)

```css
@import "tailwindcss";

/* The Bunny Bakery design tokens. Every --color-*, --font-*, --text-*, --shadow-* and --animate-*
   here also creates utility classes (bg-page, text-ink, font-heading, shadow-card, animate-wiggle...) */
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

  /* An animation: the utility animate-wiggle */
  --animate-wiggle: wiggle 0.6s ease-in-out;

  @keyframes wiggle {
    0%,
    100% {
      transform: rotate(0deg);
    }

    25% {
      transform: rotate(-8deg);
    }

    75% {
      transform: rotate(8deg);
    }
  }
}

/* Plain CSS for the whole page, in the base layer */
@layer base {
  html {
    color-scheme: light dark;
  }

  /* Where is the keyboard focus? */
  :focus-visible {
    outline: 3px solid var(--color-accent);
    outline-offset: 3px;
  }

  /* People who asked their device for less motion get (almost) none */
  @media (prefers-reduced-motion: reduce) {
    *,
    ::before,
    ::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
}

/* Our own components: a few classes that bundle utilities we use many times */
@layer components {
  .btn {
    @apply inline-flex min-h-11 items-center justify-center rounded-full border-2 border-accent bg-accent px-5 py-2 font-bold text-on-accent transition hover:border-accent-strong hover:bg-accent-strong active:translate-y-0.5;
  }

  .btn-outline {
    @apply bg-transparent text-accent hover:border-accent hover:bg-accent hover:text-on-accent;
  }

  .badge {
    @apply absolute -top-2.5 end-4 rotate-3 rounded-full bg-highlight px-3 py-0.5 text-xs font-bold text-on-highlight;
  }

  .field {
    @apply w-full max-w-md rounded-lg border border-line-strong bg-surface p-2 user-invalid:border-error user-invalid:outline-2 user-invalid:outline-error;
  }

  /* A star after the label of a required field. The empty text after the slash is the alt text
     for screen readers, so that they do not read the star out. */
  label:has(+ input:required)::after,
  label:has(+ select:required)::after {
    content: " *" / "";
    color: var(--color-accent);
  }
}
```

What is new here:

- **`--animate-wiggle`** and the `@keyframes` inside `@theme`: this creates the utility `animate-wiggle`. (The logo wiggle of Lesson 9.)
- **`@layer base`**: plain CSS for things that are the same everywhere: `color-scheme` (for `light-dark()`), the keyboard focus ring, and the reduced-motion safety net. You already wrote this CSS in Lessons 6, 9 and 15; here it is unchanged.
- **`@layer components`**: your own classes, made of utilities with **`@apply`**. `@apply` pastes the declarations of utility classes into a rule.
- **Plain CSS where it is simpler.** The "star after required labels" rule uses `:has()` and `::after` with alt text: it is cleaner as three lines of CSS than as a long class string repeated four times. Mixing is normal.

Why put `.btn` and `.field` in `components`? Because the same group of utilities is used **three or more times**. Layers also decide who wins: `components` come *before* `utilities`, so a single utility on an element can always adjust a component (`class="btn mt-4"`, or `class="field max-w-none"`).

## 3. `index.html`: the whole bakery

Now the page. It is long (like in Lesson 3 and 4, the content is the same), but read it: **it is the same document**, with `class` attributes where there were none. Every class name in it is either a Tailwind utility or one of your three components. Replace the whole file:

📄 **`index.html`** (replace everything)

```html
<!doctype html>
<html lang="en" class="motion-safe:scroll-smooth">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <title>Bunny Bakery | Fresh bread and sweet treats</title>
    <meta name="description" content="Bunny Bakery in Meadowtown: sourdough, croissants, cupcakes and more, baked by hand every morning.">
    <link rel="icon" href="images/logo.svg" type="image/svg+xml">
    <link rel="stylesheet" href="dist/output.css">
    <script src="site.js" defer></script>
  </head>
  <body class="flex min-h-dvh flex-col bg-page font-body leading-relaxed text-ink">
    <a class="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-0 focus:z-100 focus:rounded-b-xl focus:bg-accent focus:px-4 focus:py-2 focus:font-bold focus:text-on-accent" href="#main">Skip to the content</a>

    <header class="sticky top-0 z-10 border-b border-line bg-surface py-3 shadow-card print:hidden">
      <div class="mx-auto flex w-full max-w-page flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4">
        <a class="group inline-flex items-center gap-2 font-heading text-xl font-bold" href="#top">
          <img class="group-hover:animate-wiggle" src="images/logo.svg" alt="" width="40" height="40"> Bunny Bakery
        </a>
        <button class="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-line-strong bg-surface px-4 py-2 font-bold md:hidden" type="button" popovertarget="site-nav">
          <span aria-hidden="true">☰</span> Menu
        </button>
        <nav id="site-nav" aria-label="Main" popover class="fixed inset-x-4 top-[4.5rem] bottom-auto m-0 h-auto w-auto rounded-xl border border-line bg-surface px-4 py-2 text-ink shadow-lift md:static md:block md:overflow-visible md:border-0 md:bg-transparent md:p-0 md:shadow-none">
          <ul class="flex flex-col md:flex-row md:flex-wrap md:gap-x-6 md:gap-y-2">
            <li><a class="flex min-h-11 items-center font-semibold hover:text-accent hover:underline" href="#menu">Menu</a></li>
            <li><a class="flex min-h-11 items-center font-semibold hover:text-accent hover:underline" href="#story">Our story</a></li>
            <li><a class="flex min-h-11 items-center font-semibold hover:text-accent hover:underline" href="#visit">Visit</a></li>
            <li><a class="flex min-h-11 items-center font-semibold hover:text-accent hover:underline" href="#order">Order</a></li>
          </ul>
        </nav>
      </div>
    </header>

    <main id="main" class="mx-auto w-full max-w-page flex-1 px-4">
      <section class="relative isolate my-6 grid items-center gap-8 overflow-hidden rounded-3xl bg-linear-to-br from-tint to-page to-75% p-6 before:absolute before:-end-24 before:-top-24 before:-z-10 before:size-80 before:rounded-full before:bg-[radial-gradient(circle,var(--color-highlight)_0%,transparent_70%)] before:opacity-60 md:grid-cols-[1.1fr_1fr] md:p-8" aria-labelledby="hero-title">
        <div>
          <h1 id="hero-title" class="mb-2 font-heading text-hero font-bold tracking-tight text-accent text-balance">Fresh bread and sweet treats, baked every morning</h1>
          <p class="mb-4 max-w-prose text-lead text-ink-soft text-pretty">
            Welcome to <strong>Bunny Bakery</strong>, a small neighbourhood bakery in Meadowtown.
            Everything is made by hand, in small batches, with real butter.
          </p>
          <div class="flex flex-wrap gap-2">
            <a class="btn" href="#menu">See the menu</a>
            <a class="btn btn-outline" href="#order">Order a box</a>
          </div>
        </div>
        <img
          class="rounded-xl shadow-lift"
          src="images/hero-800.webp"
          srcset="images/hero-400.webp 400w, images/hero-800.webp 800w, images/hero-1200.webp 1200w"
          sizes="(min-width: 48rem) 45vw, calc(100vw - 5rem)"
          alt="The Bunny Bakery shop front: a striped awning, a window full of fresh bread and a bunny baker holding a tray of rolls"
          width="800"
          height="600"
          fetchpriority="high">
      </section>

      <section id="menu" class="scroll-mt-20 py-8" aria-labelledby="menu-title">
        <h2 id="menu-title" class="mb-2 font-heading text-title font-bold text-accent text-balance">Our menu</h2>
        <p class="mb-4 max-w-prose text-pretty">New this week: <mark class="bg-highlight text-on-highlight">carrot cupcakes</mark> with cream-cheese frosting.</p>
        <ul class="mb-6 grid grid-cols-[repeat(auto-fit,minmax(min(16rem,100%),1fr))] gap-4">
          <li class="@container/card col-span-full">
            <article class="relative flex h-full flex-col rounded-xl border border-line bg-surface p-4 shadow-card transition hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift has-[.badge]:border-highlight @md/card:grid @md/card:grid-cols-[auto_1fr_auto] @md/card:items-center @md/card:gap-x-6">
              <span class="mb-2 text-3xl leading-none @md/card:row-span-2 @md/card:mb-0 @md/card:text-5xl" aria-hidden="true">🍞</span>
              <h3 class="mb-1 font-heading text-xl font-bold text-accent @md/card:col-start-2">Sourdough loaf</h3>
              <span class="badge">Bestseller</span>
              <p class="mb-1 @md/card:col-start-2">Slow-risen, with a crackly crust and a soft middle.</p>
              <p class="mt-auto text-lg font-bold text-accent @md/card:col-span-1 @md/card:col-start-3 @md/card:row-span-2 @md/card:row-start-1 @md/card:m-0 @md/card:text-2xl">$6.00</p>
            </article>
          </li>
          <li class="@container/card">
            <article class="relative flex h-full flex-col rounded-xl border border-line bg-surface p-4 shadow-card transition hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift has-[.badge]:border-highlight @md/card:grid @md/card:grid-cols-[auto_1fr_auto] @md/card:items-center @md/card:gap-x-6">
              <span class="mb-2 text-3xl leading-none @md/card:row-span-2 @md/card:mb-0 @md/card:text-5xl" aria-hidden="true">🥐</span>
              <h3 class="mb-1 font-heading text-xl font-bold text-accent @md/card:col-start-2">Butter croissant</h3>
              <p class="mb-1 @md/card:col-start-2">Flaky layers, golden on the outside, tender inside.</p>
              <p class="mt-auto text-lg font-bold text-accent @md/card:col-span-1 @md/card:col-start-3 @md/card:row-span-2 @md/card:row-start-1 @md/card:m-0 @md/card:text-2xl">$3.50</p>
            </article>
          </li>
          <li class="@container/card">
            <article class="relative flex h-full flex-col rounded-xl border border-line bg-surface p-4 shadow-card transition hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift has-[.badge]:border-highlight @md/card:grid @md/card:grid-cols-[auto_1fr_auto] @md/card:items-center @md/card:gap-x-6">
              <span class="mb-2 text-3xl leading-none @md/card:row-span-2 @md/card:mb-0 @md/card:text-5xl" aria-hidden="true">🧁</span>
              <h3 class="mb-1 font-heading text-xl font-bold text-accent @md/card:col-start-2">Carrot cupcake</h3>
              <span class="badge">New</span>
              <p class="mb-1 @md/card:col-start-2">Spiced sponge, cream-cheese frosting and a tiny candied carrot.</p>
              <p class="mt-auto text-lg font-bold text-accent @md/card:col-span-1 @md/card:col-start-3 @md/card:row-span-2 @md/card:row-start-1 @md/card:m-0 @md/card:text-2xl">$4.00</p>
            </article>
          </li>
          <li class="@container/card">
            <article class="relative flex h-full flex-col rounded-xl border border-line bg-surface p-4 shadow-card transition hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift has-[.badge]:border-highlight @md/card:grid @md/card:grid-cols-[auto_1fr_auto] @md/card:items-center @md/card:gap-x-6">
              <span class="mb-2 text-3xl leading-none @md/card:row-span-2 @md/card:mb-0 @md/card:text-5xl" aria-hidden="true">🍪</span>
              <h3 class="mb-1 font-heading text-xl font-bold text-accent @md/card:col-start-2">Oat and raisin cookie</h3>
              <p class="mb-1 @md/card:col-start-2">Chewy in the middle, crisp at the edge.</p>
              <p class="mt-auto text-lg font-bold text-accent @md/card:col-span-1 @md/card:col-start-3 @md/card:row-span-2 @md/card:row-start-1 @md/card:m-0 @md/card:text-2xl">$2.50</p>
            </article>
          </li>
          <li class="@container/card">
            <article class="relative flex h-full flex-col rounded-xl border border-line bg-surface p-4 shadow-card transition hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift has-[.badge]:border-highlight @md/card:grid @md/card:grid-cols-[auto_1fr_auto] @md/card:items-center @md/card:gap-x-6">
              <span class="mb-2 text-3xl leading-none @md/card:row-span-2 @md/card:mb-0 @md/card:text-5xl" aria-hidden="true">🍩</span>
              <h3 class="mb-1 font-heading text-xl font-bold text-accent @md/card:col-start-2">Cinnamon bun</h3>
              <p class="mb-1 @md/card:col-start-2">Warm, sticky and swirled with brown sugar.</p>
              <p class="mt-auto text-lg font-bold text-accent @md/card:col-span-1 @md/card:col-start-3 @md/card:row-span-2 @md/card:row-start-1 @md/card:m-0 @md/card:text-2xl">$4.00</p>
            </article>
          </li>
          <li class="@container/card">
            <article class="relative flex h-full flex-col rounded-xl border border-line bg-surface p-4 shadow-card transition hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift has-[.badge]:border-highlight @md/card:grid @md/card:grid-cols-[auto_1fr_auto] @md/card:items-center @md/card:gap-x-6">
              <span class="mb-2 text-3xl leading-none @md/card:row-span-2 @md/card:mb-0 @md/card:text-5xl" aria-hidden="true">🍓</span>
              <h3 class="mb-1 font-heading text-xl font-bold text-accent @md/card:col-start-2">Strawberry tart</h3>
              <p class="mb-1 @md/card:col-start-2">Crisp pastry, vanilla cream and fresh strawberries.</p>
              <p class="mt-auto text-lg font-bold text-accent @md/card:col-span-1 @md/card:col-start-3 @md/card:row-span-2 @md/card:row-start-1 @md/card:m-0 @md/card:text-2xl">$5.00</p>
            </article>
          </li>
          <li class="@container/card">
            <article class="relative flex h-full flex-col rounded-xl border border-line bg-surface p-4 shadow-card transition hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift has-[.badge]:border-highlight @md/card:grid @md/card:grid-cols-[auto_1fr_auto] @md/card:items-center @md/card:gap-x-6">
              <span class="mb-2 text-3xl leading-none @md/card:row-span-2 @md/card:mb-0 @md/card:text-5xl" aria-hidden="true">🍋</span>
              <h3 class="mb-1 font-heading text-xl font-bold text-accent @md/card:col-start-2">Lemon loaf cake</h3>
              <p class="mb-1 @md/card:col-start-2">Zesty lemon sponge under a thin, crackly sugar glaze.</p>
              <p class="mt-auto text-lg font-bold text-accent @md/card:col-span-1 @md/card:col-start-3 @md/card:row-span-2 @md/card:row-start-1 @md/card:m-0 @md/card:text-2xl">$4.50</p>
            </article>
          </li>
        </ul>
        <aside class="my-6 rounded-e-xl border-s-6 border-highlight bg-highlight-soft p-4">
          <h3 class="font-heading text-xl font-bold text-accent">Bunny's tip</h3>
          <p>Bread tastes best on the day it is baked. The next day, toast it with butter.</p>
        </aside>
      </section>

      <section id="story" class="grid scroll-mt-20 gap-x-8 gap-y-4 py-8 md:grid-cols-2 md:items-center" aria-labelledby="story-title">
        <h2 id="story-title" class="font-heading text-title font-bold text-accent text-balance md:col-span-2">Our story</h2>
        <figure>
          <picture>
            <source
              media="(min-width: 48rem)"
              srcset="images/story-wide-640.webp 640w, images/story-wide-1280.webp 1280w"
              sizes="(min-width: 68rem) 520px, 45vw"
              width="1280"
              height="720">
            <img
              class="rounded-xl"
              src="images/story-square-800.webp"
              srcset="images/story-square-400.webp 400w, images/story-square-800.webp 800w"
              sizes="calc(100vw - 2rem)"
              alt="Bunny in a chef's hat pointing at a glowing oven, with fresh loaves cooling on a table beside it"
              width="800"
              height="800"
              loading="lazy">
          </picture>
          <figcaption class="mt-1 text-ink-soft italic">Bunny checks the first loaves of the morning.</figcaption>
        </figure>
        <div>
          <p class="mb-4 max-w-prose text-pretty">
            Bunny learned to bake in her grandmother's kitchen, standing on a wooden box
            to reach the counter. Her first loaf was a little flat, and everybody ate it anyway.
          </p>
          <p class="max-w-prose text-pretty">
            Today she gets up before the sun to start the ovens, so that the first warm
            bread is on the shelf when the neighbours walk by. Every recipe is still made
            the slow, careful way she was taught.
          </p>
        </div>
      </section>

      <section id="visit" class="grid scroll-mt-20 gap-x-8 py-8 md:grid-cols-2" aria-labelledby="visit-title">
        <h2 id="visit-title" class="mb-2 font-heading text-title font-bold text-accent text-balance md:col-span-2">Visit us</h2>
        <div>
          <h3 class="mb-2 font-heading text-xl font-bold text-accent">Opening hours</h3>
          <table class="mb-6 w-full">
              <caption class="py-2 text-start font-bold">Our weekly opening times</caption>
              <thead>
                <tr class="*:border-b *:border-line *:px-3 *:py-2 *:text-start">
                  <th scope="col">Day</th>
                  <th scope="col">Opens</th>
                  <th scope="col">Closes</th>
                </tr>
              </thead>
              <tbody>
                <tr class="*:border-b *:border-line *:px-3 *:py-2 *:text-start hover:bg-highlight-soft">
                  <th scope="row">Monday to Friday</th>
                  <td>7:00</td>
                  <td>18:00</td>
                </tr>
                <tr class="*:border-b *:border-line *:px-3 *:py-2 *:text-start hover:bg-highlight-soft">
                  <th scope="row">Saturday</th>
                  <td>8:00</td>
                  <td>16:00</td>
                </tr>
                <tr class="*:border-b *:border-line *:px-3 *:py-2 *:text-start hover:bg-highlight-soft">
                  <th scope="row">Sunday</th>
                  <td>8:00</td>
                  <td>13:00</td>
                </tr>
              </tbody>
            </table>
        </div>
        <div>
          <h3 class="mb-2 font-heading text-xl font-bold text-accent">Find us</h3>
          <address class="not-italic">
            Bunny Bakery<br>
            12 Carrot Lane<br>
            Meadowtown<br>
            <a class="text-accent underline" href="tel:+15550123">+1&nbsp;555&nbsp;0123</a><br>
            <a class="text-accent underline" href="mailto:hello@bunnybakery.example">hello@bunnybakery.example</a>
          </address>
          <p class="mt-4">
            <a class="text-accent underline after:content-['_↗']" href="https://www.openstreetmap.org/search?query=Carrot%20Lane" target="_blank" rel="noopener">Open the map</a>
            (opens in a new tab)
          </p>
        </div>
      </section>

      <section id="order" class="scroll-mt-20 py-8" aria-labelledby="order-title">
        <h2 id="order-title" class="mb-2 font-heading text-title font-bold text-accent text-balance">Order a box</h2>
        <p class="mb-4 max-w-prose">Choose your treats and tell us when you will come by. We will have your box ready.</p>

        <section class="overflow-x-auto" tabindex="0" aria-label="Our boxes (scrolls sideways on small screens)">
          <table class="mb-6 w-full">
              <caption class="py-2 text-start font-bold">Our boxes</caption>
              <thead>
                <tr class="*:border-b *:border-line *:px-3 *:py-2 *:text-start">
                  <th scope="col">Box</th>
                  <th scope="col">Treats</th>
                  <th scope="col">Great for</th>
                  <th scope="col">Price</th>
                </tr>
              </thead>
              <tbody>
                <tr class="*:border-b *:border-line *:px-3 *:py-2 *:text-start hover:bg-highlight-soft">
                  <th scope="row">Small box</th>
                  <td>4</td>
                  <td>Breakfast for two</td>
                  <td>$14</td>
                </tr>
                <tr class="*:border-b *:border-line *:px-3 *:py-2 *:text-start hover:bg-highlight-soft">
                  <th scope="row">Large box</th>
                  <td>8</td>
                  <td>A family treat</td>
                  <td>$26</td>
                </tr>
                <tr class="*:border-b *:border-line *:px-3 *:py-2 *:text-start hover:bg-highlight-soft">
                  <th scope="row">Party box</th>
                  <td>16</td>
                  <td>Birthdays and office parties</td>
                  <td>$48</td>
                </tr>
              </tbody>
            </table>
        </section>

        <form method="get" class="print:hidden">
          <p class="mb-4">Fields marked with <strong>*</strong> are required.</p>
          <fieldset class="mb-6 grid grid-cols-[repeat(auto-fit,minmax(min(14rem,100%),1fr))] gap-4 rounded-xl border border-line p-4">
            <legend class="px-2 font-bold">About you</legend>
            <div>
              <label class="mb-1 block font-semibold" for="name">Your name</label>
              <input class="field" id="name" name="name" type="text" autocomplete="name" required>
            </div>
            <div>
              <label class="mb-1 block font-semibold" for="email">Email</label>
              <input class="field" id="email" name="email" type="email" autocomplete="email" required>
            </div>
            <div>
              <label class="mb-1 block font-semibold" for="phone">Phone (optional)</label>
              <input class="field" id="phone" name="phone" type="tel" autocomplete="tel">
            </div>
          </fieldset>

          <fieldset class="mb-6 grid grid-cols-[repeat(auto-fit,minmax(min(14rem,100%),1fr))] gap-4 rounded-xl border border-line p-4">
            <legend class="px-2 font-bold">Your box</legend>
            <fieldset class="col-span-full grid grid-cols-[repeat(auto-fit,minmax(min(14rem,100%),1fr))] gap-4 rounded-xl border border-line p-4">
              <legend class="px-2 font-bold">Size</legend>
              <div class="rounded-xl border-2 border-line px-4 py-2 has-checked:border-accent has-checked:bg-highlight-soft">
                <input class="accent-accent" id="size-small" name="size" type="radio" value="small">
                <label for="size-small">Small box (4 treats)</label>
              </div>
              <div class="rounded-xl border-2 border-line px-4 py-2 has-checked:border-accent has-checked:bg-highlight-soft">
                <input class="accent-accent" id="size-large" name="size" type="radio" value="large" checked>
                <label for="size-large">Large box (8 treats)</label>
              </div>
              <div class="rounded-xl border-2 border-line px-4 py-2 has-checked:border-accent has-checked:bg-highlight-soft">
                <input class="accent-accent" id="size-party" name="size" type="radio" value="party">
                <label for="size-party">Party box (16 treats)</label>
              </div>
            </fieldset>
            <div>
              <label class="mb-1 block font-semibold" for="favourite">Favourite treat</label>
              <select class="field" id="favourite" name="favourite">
                <option value="sourdough">Sourdough loaf</option>
                <option value="croissant">Butter croissant</option>
                <option value="cupcake" selected>Carrot cupcake</option>
                <option value="cookie">Oat and raisin cookie</option>
                <option value="bun">Cinnamon bun</option>
                <option value="tart">Strawberry tart</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block font-semibold" for="boxes">How many boxes?</label>
              <input class="field" id="boxes" name="boxes" type="number" min="1" max="10" value="1" required>
            </div>
            <div>
              <label class="mb-1 block font-semibold" for="pickup">Pick-up day</label>
              <input class="field" id="pickup" name="pickup" type="date" required>
            </div>
            <div class="col-span-full">
              <label class="mb-1 block font-semibold" for="notes">Anything we should know? (allergies, a birthday&hellip;)</label>
              <textarea class="field max-w-none" id="notes" name="notes" rows="4"></textarea>
            </div>
            <div class="col-span-full">
              <input class="accent-accent" id="sms" name="sms" type="checkbox" value="yes">
              <label for="sms">Text me when my box is ready</label>
            </div>
          </fieldset>

          <button class="btn" type="submit">Send my order</button>
        </form>
      </section>
    </main>

    <footer class="bg-footer py-6 text-on-footer print:hidden">
      <div class="mx-auto flex w-full max-w-page flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4">
        <p>&copy; 2026 Bunny Bakery. Made with &hearts; and a lot of butter.</p>
        <p><a class="text-highlight underline" href="#top">Back to the top</a></p>
      </div>
    </footer>
  </body>
</html>
```

Save, watch the terminal rebuild, and open `index.html`. **It looks exactly like the plain version.** Resize the window, open the menu on a phone-sized window, press **Tab** to see the skip link, switch to dark mode, print preview: everything you built in Lessons 5 to 16 works. ### Build the final CSS

When you are done, stop the watcher (`Ctrl+C`) and make the real, **minified** file that you would upload with the site:

```bash
npm run build
```

`dist/output.css` now holds the whole site's CSS, including Tailwind's reset and your theme: about 23 KB. Open it and look for your own names (`.btn`, `.badge`, `--color-accent`).

## 4. Where did my CSS go? A translation guide

Here is each idea of the course in plain CSS (left) and in this page (right). Open both projects side by side.

### Layout

| Plain CSS | Tailwind |
|-----------|----------|
| `.container { max-width: 68rem; margin-inline: auto; padding-inline: 1rem }` | `mx-auto w-full max-w-page px-4` |
| `.header-inner { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem 1.5rem }` | `flex flex-wrap items-center justify-between gap-x-6 gap-y-2` |
| `body { display: flex; flex-direction: column; min-height: 100dvh }` and `main { flex: 1 }` | `flex min-h-dvh flex-col` and `flex-1` |
| `.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr)); gap: 1rem }` | `grid grid-cols-[repeat(auto-fit,minmax(min(16rem,100%),1fr))] gap-4` (an arbitrary value) |
| `.featured { grid-column: 1 / -1 }` | `col-span-full` |
| `.story { display: grid; ... } @media (min-width: 48rem) { grid-template-columns: 1fr 1fr }` | `grid gap-x-8 gap-y-4 md:grid-cols-2 md:items-center` |
| `.hero { grid-template-columns: 1.1fr 1fr }` at 48rem | `md:grid-cols-[1.1fr_1fr]` (underscore = space) |

### Responsive design and preferences

| Plain CSS | Tailwind |
|-----------|----------|
| `@media (min-width: 48rem) { ... }` | the `md:` prefix on any class |
| `@container card (min-width: 28rem) { ... }` | `@container/card` on the wrapper, and `@md/card:` on the children |
| `clamp(2rem, 1.4rem + 2.6vw, 3rem)` | `text-hero` (a theme token) |
| `.nav-toggle { display: none }` at 48rem | `md:hidden` |
| `nav[popover] { position: static; display: block; ... }` at 48rem | `md:static md:block md:border-0 md:bg-transparent md:p-0 md:shadow-none` |
| `html { scroll-behavior: smooth }` unless reduced motion | `motion-safe:scroll-smooth` on `<html>` |
| `@media print { .site-header { display: none } }` | `print:hidden` |
| `@media (hover: hover) { .card:hover { ... } }` | `hover:...` (in Tailwind v4, `hover:` already means "only on devices that can hover") |
| `light-dark(...)` tokens | the same tokens, in `@theme` |

### States, pseudo-classes and pseudo-elements

| Plain CSS | Tailwind |
|-----------|----------|
| `.button:hover { ... }` | `hover:bg-accent-strong` |
| `.button:active { transform: translateY(2px) }` | `active:translate-y-0.5` |
| `.card:has(.badge) { border-color: ... }` | `has-[.badge]:border-highlight` |
| `div:has(input:checked) { ... }` | `has-checked:border-accent has-checked:bg-highlight-soft` |
| `input:user-invalid { ... }` | `user-invalid:border-error` (inside `.field`) |
| `.brand:hover img { animation: wiggle ... }` | `group` on the link, `group-hover:animate-wiggle` on the image |
| `.hero::before { content: ""; position: absolute; ... }` | `before:absolute before:-end-24 before:-top-24 before:-z-10 before:size-80 before:rounded-full ...` |
| `a[target="_blank"]::after { content: " ↗" }` | `after:content-['_↗']` |
| `tbody tr:hover { background: ... }` and `th, td { padding: ... }` | `hover:bg-highlight-soft` and `*:px-3 *:py-2` (`*:` styles every direct child) |
| `.skip-link` hidden until `:focus` | `sr-only focus:not-sr-only focus:absolute ...` |

### Spacing and typography

| Plain CSS | Tailwind |
|-----------|----------|
| `padding: 1rem` | `p-4` |
| `margin: 0 0 1rem` | `mb-4` |
| `max-width: 65ch` | `max-w-prose` |
| `font-family: var(--font-heading)` | `font-heading` |
| `font-weight: 700` | `font-bold` |
| `text-wrap: balance` | `text-balance` |
| `border-inline-start: 6px solid ...` | `border-s-6 border-highlight` |
| `border-start-end-radius` and `border-end-end-radius` | `rounded-e-xl` |

Notice that **logical properties** are built in (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `rounded-s-`, `border-e`...): the RTL test from Lesson 16 works here too. Try it: put `dir="rtl"` on `<html>`.

## 5. Three details worth a second look

### 1. `@container/card` and `@md/card:`

```html
<li class="@container/card">                 <!-- the container, named "card" -->
  <article class="flex flex-col ... @md/card:grid @md/card:grid-cols-[auto_1fr_auto]">  <!-- adapts to it -->
```

Same idea as Lesson 14: the wrapper is the container; the card adapts when the container is at least `28rem` (that is what `@md` means) wide.

### 2. The popover menu with only utilities

The browser's own styles say a closed popover is `display: none` and a popover is `position: fixed` with `inset: 0`. The classes `fixed inset-x-4 top-[4.5rem] m-0 h-auto w-auto ...` place it as a drop-down panel on phones, and the `md:` classes turn it back into a normal row from 768px up. It's **exactly** the CSS of Lesson 14, written as classes. Utilities beat the browser's own styles in the same way your CSS did.

### 3. Conflicting classes

If you write `class="bg-accent bg-transparent"`, which wins? Not the *last one in the attribute*: the one that comes **last in the generated CSS file**, and Tailwind decides that order, not you. **Don't put two conflicting utilities on one element.** That is why `.btn-outline` is a separate component declared *after* `.btn`: component rules follow the normal CSS order. And, in the rare case that you really need to force a utility, add `!` at the **end** of its name (`bg-transparent!` means "important").

## 6. Repetition: the honest downside

Look at the menu cards in the HTML: the same long class list appears seven times. In a real project, that is **not** copy-pasted; it lives **once**, in a **component** of the framework or template system you use (a React component, a Vue component, an Astro or Eleventy template, a Jinja or PHP include...), and the page loops over the data:

```jsx
cards.map((card) => <Card key={card.title} {...card} />)   // the classes are written once
```

So the rule is:

| If you repeat it... | Do this |
|---------------------|---------|
| Once or twice | Leave it |
| Several times in **one place** (a list) | Use a loop or a template component. The class list lives once |
| Several times across the **site**, in plain HTML, without any template tool | `@apply` in `@layer components` (like `.btn`, `.field`) |
| A one-off special case | A utility on the element |

In this course there is no template tool, so we wrote the cards out. **Don't take the repetition as a feature of Tailwind: it is a result of using plain static HTML.**

## 7. Tailwind and plain CSS: an honest comparison for this site

You now have both. Open both folders and compare (the sizes were measured on the finished projects):

| | Plain CSS | Tailwind |
|---|-----------|----------|
| Files you write for style | `styles.css` | `src/input.css` (theme + a few components) |
| CSS you wrote by hand | about 770 lines | about 110 lines |
| HTML file | 12 KB, tidy: classes like `card`, `hero` | 22 KB: long `class` attributes |
| CSS shipped to visitors | the file you wrote: 15 KB (4.5 KB compressed) | one generated, minified file: 23 KB (5.5 KB compressed), partly Tailwind's reset and variables |
| Needs a build step | No | Yes (Node and the CLI) |
| Changing the look | Edit the rule, in one place | Edit the classes where they are used (or the theme) |
| Naming things | You must | Almost never |
| Consistency | By discipline and tokens | Built in |
| Works without any tool | Yes | No |
| Learning curve | CSS | CSS **and** the utility vocabulary |

**Neither is "better".** Utility-first is great for teams, for component-based frameworks and for fast prototypes. Plain, well-organised CSS is great for small sites, long-lived content, and when you want nothing between you and the browser. The CSS knowledge you gained in Lessons 5 to 16 is exactly what you need to use **either** well: Tailwind is a way of writing CSS, not a replacement for knowing it.

## 8. If a class does not work

1. **Is the build running?** (`npm run dev`) Look at its terminal for errors. Is `dist/output.css` linked in the page?
2. **Is the class name complete and spelled correctly?** `text-accent` works; `text-acent` does not (no error: it just doesn't exist). IntelliSense underlines unknown classes.
3. **Was it built from pieces?** `class={"text-" + colour}` will not work: write full names.
4. **Is the file scanned?** Tailwind scans your project, but ignores what is in `.gitignore` and `node_modules`. A file outside the project needs `@source "../path"` in `input.css`.
5. **Is another utility fighting it?** Open DevTools → Styles: the loser is crossed out. Remove the conflicting class.
6. **Is it a variant problem?** `md:hidden` means "hidden from 768px up". Mobile-first: unprefixed first, then `md:`.
7. **Is the order of layers or your own CSS the cause?** Plain CSS you write *outside* any `@layer` always beats utilities (Lesson 16).

## 🧪 Try it yourself

1. Change `--color-accent` in `src/input.css` (light value) to teal `#0f766e`. The whole site changes: headings, buttons, prices, focus rings, stars. How many HTML lines did you edit?
2. Change `--container-page` to `80rem`. What changes?
3. Add `dir="rtl"` to `<html>` and compare with Lesson 16.
4. Add `dark:brightness-90` to the two pictures. Emulate dark mode in DevTools: are they dimmer?
5. Make the "Order a box" button a different colour only in dark mode: `dark:bg-highlight dark:text-on-highlight`. (You will need the `btn` on that element to be overridden: why does a utility beat the `.btn` component?)
6. Change the number of cards that are `col-span-full`: give the cinnamon bun card `col-span-full` too. Does it switch to the horizontal layout? Why?
7. Remove `has-[.badge]:border-highlight` from the cards. Which cards lose their golden edge?
8. Resize to 1024px and check the popover menu is hidden, then to 700px and open it. Which classes make the difference?
9. Add a new section ("Gift boxes") by copying the style of the "Our story" section. How long did it take compared with the plain version?
10. Use the browser's **Coverage** tool (DevTools → More tools → Coverage) on both versions. How much of each CSS file is used by the page?

## ✅ Check yourself

<details>
<summary>1. Where would you put a button style that is used on six different pages of a static site with no templates?</summary>

In `@layer components` as a class built with `@apply` (like `.btn`), so that the class list is written once and the pages only use `class="btn"`.
</details>

<details>
<summary>2. What does <code>@md/card:grid</code> mean?</summary>

"When the container named `card` is at least `28rem` wide, make this element `display: grid`." It is a container query variant.
</details>

<details>
<summary>3. Two utilities that set the same property are on one element. Which one wins?</summary>

The one that comes later in the generated CSS file, not the one written last in the `class` attribute. Avoid putting conflicting utilities on one element.
</details>

<details>
<summary>4. When should you write plain CSS in a Tailwind project?</summary>

When utilities become awkward: complex selectors (such as `label:has(+ input:required)::after`), global base rules (focus ring, reduced motion), keyframes, and anything long that is used in many places and is clearer with a name.
</details>

<details>
<summary>5. Why can the plain-CSS knowledge of Lessons 5 to 16 be used with Tailwind?</summary>

Tailwind generates ordinary CSS. Every utility is a normal CSS declaration, so you need to understand the box model, Flexbox, Grid, the cascade, responsive design and so on to use it well. DevTools shows the real CSS.
</details>

## Recap

- A Tailwind site is the same HTML with utility classes, a theme (tokens) in `input.css`, and a few components.
- Every plain-CSS idea has a direct translation: `md:` for media queries, `@container` and `@md:` for container queries, `has-*` for `:has()`, `group-hover`, `before:`/`after:`, `print:`, `motion-safe:`, `dark:`, and arbitrary values with brackets.
- Components (`@layer components` with `@apply`) and template loops solve repetition. Plain CSS in `@layer base` is fine for global rules.
- Don't mix conflicting utilities; check the build, spelling, and whether classes are complete names.
- Tailwind is a way to write CSS. The best developers know CSS *and* the tool.

➡️ **Next:** [Lesson 19 – Graduation day, checklists and cheat sheets](19-graduation-checklists-and-cheat-sheets.md)
