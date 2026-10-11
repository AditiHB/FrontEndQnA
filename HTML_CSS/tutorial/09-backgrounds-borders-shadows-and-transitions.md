# Lesson 9: Backgrounds, Borders, Shadows and Transitions

> **Like I'm 5:** Now we decorate the gift boxes. We paint the *paper* (background), round the *corners*, add a *soft shadow* so the box looks like it sits on the table, and make it *hop up a little* when you point at it.

| | |
|---|---|
| **You will learn** | Background colours, gradients and images, `border-radius`, `box-shadow`, `object-fit`, `transition`, `transform`, `@keyframes` animation, and `prefers-reduced-motion` |
| **You will build** | A gradient hero, rounded cards that lift on hover, pill-shaped buttons, a wiggling logo, shadows and soft corners |
| **Time** | About 75 minutes |

## The story

Bunny's page is tidy but flat, like a form from an office. She wants it to feel warm and a bit playful: soft round shapes, gentle shadows, and things that respond when people point at them.

## 1. Backgrounds

You know `background-color`. The `background-*` family can paint more:

| Property | What it does | Example |
|----------|--------------|---------|
| `background-color` | A solid colour | `var(--cream)` |
| `background-image` | A picture **or a gradient** | `url("pattern.svg")`, `linear-gradient(…)` |
| `background-size` | How big the picture is | `cover` (fill, cropping), `contain` (fit, no cropping), `40px` |
| `background-position` | Where it sits | `center`, `top right` |
| `background-repeat` | Tiling | `no-repeat`, `repeat-x` |
| `background` | **Shorthand** for all of them | `url(a.png) center / cover no-repeat` |

**Gradients are images drawn by CSS**: no download, perfectly sharp at any size.

```css
background: linear-gradient(135deg, #ffe4d1 0%, #fff8f0 75%);   /* a line at 135deg, from peach to cream */
background: radial-gradient(circle at top right, #ffd166, transparent 60%);   /* a glow in a corner */
```

```text
 linear-gradient(90deg, red, blue)      90deg = to the right    180deg = to the bottom   (or write "to right")
   red ─────────────────────► blue
 Colour stops: "red 0%, blue 100%" or add as many as you like: "red, yellow 40%, blue"
```

**`<img>` or CSS background?** If the picture is *content* (a photo of the shop, a menu item) use `<img>` with `alt`: screen readers and search engines see it. If it is *decoration* (a pattern, a gradient, a texture), use a CSS background: it carries no meaning.

You can stack several backgrounds, separated by commas (the first one is on top):

```css
background:
  radial-gradient(circle at 20% 20%, rgb(255 255 255 / 0.6), transparent 40%),
  linear-gradient(135deg, #ffe4d1, #fff8f0);
```

## 2. Borders and rounded corners

```css
border: 2px solid var(--berry);       /* all four sides: width style colour */
border-bottom: 1px dashed gray;       /* one side */
border-radius: 0.75rem;                /* all four corners */
border-radius: 999px;                  /* a "pill": as round as it can be */
border-radius: 50%;                    /* a circle (on a square box) */
border-radius: 1rem 0 1rem 0;          /* top-left, top-right, bottom-right, bottom-left */
outline: 3px solid red;                /* like a border, but takes NO space and follows focus */
```

`border-radius` also **clips the background and the child pictures if the parent has `overflow: hidden`**. A rounded border follows the corner, even if the box has no border at all.

## 3. Shadows

```css
box-shadow: 0 4px 12px rgb(0 0 0 / 0.2);
/*          │ │   │    └── colour (use transparency: black at 20%)
/*          │ │   └── blur: how soft the edge is
/*          │ └── y offset: down (positive) or up
/*          └── x offset: right (positive) or left
```

- A fifth number is the **spread** (grows or shrinks the shadow). `inset` as the first word puts the shadow **inside** the box.
- Real shadows are soft and subtle. Use **low-opacity colours** and large blur. Try two layers: a small tight one and a bigger soft one, separated by a comma.
- `text-shadow` is the same for letters. `filter: drop-shadow(…)` follows the *shape* of a transparent PNG/SVG (a `box-shadow` is always a rectangle).
- Shadows take no room in the layout and do not affect other boxes.

## 4. Picture boxes: `object-fit` and `aspect-ratio`

When you give a picture a box of a different shape from the picture, it normally stretches. `object-fit` fixes that:

| Value | Result |
|-------|--------|
| `fill` | Stretches (the default; looks squashed) |
| `contain` | The whole picture fits inside, with gaps if needed |
| `cover` | The picture **fills** the box, and the extra is cropped. Great for thumbnails |
| `object-position` | Which part stays visible when cropped (`center top`) |

`aspect-ratio: 4 / 3;` makes a box keep a shape (4 wide for every 3 tall) whatever its width.

## 5. Transitions: smooth, not sudden

Normally when a property changes (on `:hover`, say), it jumps. A **transition** makes it glide:

```css
.button {
  background-color: var(--berry);
  transition: background-color 0.2s ease;     /* what | how long | how it speeds up */
}
.button:hover {
  background-color: var(--berry-dark);         /* the browser animates the change */
}
```

```text
 transition: <property> <duration> <timing-function> <delay>
              │           │           │                └── wait before starting (rarely needed)
              │           │           └── ease (default), linear, ease-in, ease-out, ease-in-out, cubic-bezier(…)
              │           └── 0.2s (200 ms) feels snappy. Longer than 0.5s feels sluggish
              └── one property, a comma-separated list, or "all" (convenient but sloppy)
```

- Put the `transition` on the **resting** state (the base rule), not on `:hover`: then it also glides *back*.
- Colours, sizes, shadows, transforms and opacity can transition. `display` can't.

### Transforms: move, spin, grow

```css
transform: translateY(-4px);   /* move up 4px */
transform: scale(1.05);         /* 5% bigger */
transform: rotate(-8deg);       /* turn */
transform: translateY(-4px) scale(1.02);   /* combine them */
```

A transform changes how an element is **drawn**, not where it **sits in the layout**: its neighbours do not move, and it is very cheap for the browser. That makes `transform` and `opacity` the best properties to animate: animating `width`, `margin` or `top` forces the page to re-layout on every frame.

### Animations: a recipe with steps

For things that move on their own, name a sequence of **keyframes** and play it with `animation`:

```css
@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25%      { transform: rotate(-8deg); }
  75%      { transform: rotate(8deg); }
}

.brand:hover img {
  animation: wiggle 0.6s ease-in-out;     /* name | duration | timing */
}
```

Useful extras: `animation-iteration-count: infinite;`, `animation-delay`, `animation-fill-mode: forwards` (stay on the last frame), `animation-direction: alternate`.

### Be kind to people who feel sick with motion

Some people get dizzy or distracted by movement. Their operating system has a "reduce motion" setting, and CSS can see it with the media query **`prefers-reduced-motion`**. Respect it:

```css
@media (prefers-reduced-motion: reduce) {
  /* turn animation and transition off (or nearly) */
}
```

Never let motion carry information alone, and nothing should flash more than three times a second.

## 6. Make the bakery lovely

We will change the stylesheet in a handful of places. First the new tokens: a peach colour, a corner radius, two shadows:

📄 **`styles.css`** (edit these lines)

```diff
   --cream: #fff8f0;
+  --peach: #ffe4d1;
   --white: #fff;
@@
   /* Sizes */
   --page-width: 68rem;
+
+  /* Shape and depth */
+  --radius: 0.75rem;
+  --radius-pill: 999px;
+  --shadow-s: 0 1px 2px rgb(74 44 23 / 0.08), 0 2px 8px rgb(74 44 23 / 0.08);
+  --shadow-m: 0 10px 30px rgb(74 44 23 / 0.18);
 }
```

Now the header (a soft shadow under it), the buttons (pills that glide and press down), the cards (round, shadowed, lifting on hover), the tip box and the form fields:

📄 **`styles.css`** (edit these lines)

```diff
   background-color: var(--white);
   border-bottom: 1px solid var(--line);
+  box-shadow: var(--shadow-s);
 }
@@
   margin: 0 var(--space-s) var(--space-s) 0;
   border: 2px solid var(--berry);
+  border-radius: var(--radius-pill);
   background-color: var(--berry);
   color: var(--white);
   font-weight: 700;
   text-decoration: none;
+  transition: background-color 0.2s, border-color 0.2s, color 0.2s, transform 0.1s;
 }
@@
 .button:hover {
   background-color: var(--berry-dark);
   border-color: var(--berry-dark);
 }
+
+.button:active {
+  transform: translateY(2px);
+}
@@
   background-color: var(--white);
   border: 1px solid var(--line);
+  border-radius: var(--radius);
+  box-shadow: var(--shadow-s);
+  transition: transform 0.2s, box-shadow 0.2s;
 }
+
+.cards li:hover {
+  transform: translateY(-4px);
+  box-shadow: var(--shadow-m);
+}
@@
   background-color: var(--butter-pale);
   border-left: 6px solid var(--butter);
+  border-radius: 0 var(--radius) var(--radius) 0;
@@
   padding: var(--space-m);
   border: 1px solid var(--line);
+  border-radius: var(--radius);
@@
   border: 1px solid var(--line-strong);
+  border-radius: 0.5rem;
   background-color: var(--white);
```

Finally, a new block at the bottom of the file: the hero gradient, the rounded pictures, table rows that light up, the wiggling logo, and the "reduce motion" safety net.

📄 **`styles.css`** (add to the bottom)

```css
/* ========== Looks and motion ========== */
.hero {
  margin: var(--space-l) 0 var(--space-m);
  padding: var(--space-xl);
  background: linear-gradient(135deg, var(--peach) 0%, var(--cream) 75%);
  border-radius: calc(var(--radius) * 2);
}

.hero-img,
figure img {
  border-radius: var(--radius);
}

.hero-img {
  box-shadow: var(--shadow-m);
}

tbody tr {
  transition: background-color 0.15s;
}

tbody tr:hover {
  background-color: var(--butter-pale);
}

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

.brand:hover img {
  animation: wiggle 0.6s ease-in-out;
}

/* People who asked their device for less motion get (almost) none */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

(`!important` is normally a bad idea, as you saw in Lesson 6. Here it is deliberate: this rule must beat **every** animation and transition anywhere. This is one of the few good uses.)

Save and refresh. Look at everything:

- **The hero** is now a soft peach-to-cream card with rounded corners; the shop picture has rounded corners and a shadow.
- **Cards** are rounded and sit on a soft shadow. **Hover over one:** it lifts up and the shadow grows.
- **Buttons** are pills. Hover (they glide to the dark colour) and press (they sink by 2px).
- **Hover over the logo:** it wiggles.
- **Hover over a table row:** it lights up in butter.
- The tip box has rounded corners on the right, and form fields are softly rounded.

## 7. What just happened?

```text
          at rest                          hovering                    how the browser got there
   ┌───────────────┐   mouse over   ┌───────────────┐
   │ translateY(0) │ ─────────────► │ translateY(-4px)│         0.2 s, many tiny steps ("frames")
   │ shadow small  │   (:hover)     │ shadow large  │         using the transition on the base rule
   └───────────────┘ ◄───────────── └───────────────┘
                      mouse leaves (also animated, because the transition is on the base rule)
```

- You wrote the **start** and the **end**. The browser invented the middle.
- Shadows and radii live in **tokens** (`--shadow-s`, `--radius`), so the whole site stays consistent and can be changed in one place.
- Motion is *gentle and meaningful*: it shows what you can interact with.

## 🧪 Try it yourself

1. In DevTools, edit the `box-shadow` of a card. Click the little shadow icon next to it to open the shadow editor.
2. Change `--radius` to `0` and then to `2rem`. How does the site's personality change?
3. Make the hero background a radial gradient: `background: radial-gradient(circle at top right, var(--butter), var(--cream) 60%);`.
4. Change `transition: transform 0.2s` of the cards to `1s`. Hover. Now try `ease-in-out` and `linear`.
5. Add `.cards li:hover { transform: translateY(-4px) rotate(1deg) scale(1.02); }`. Remove the transform from `.cards li` (not the hover): does the card still animate back smoothly? (It does, because the `transition` is on the base rule.)
6. Move `transition` from `.cards li` to `.cards li:hover` only. Hover and un-hover. What is different? Why?
7. Add `animation: wiggle 1s ease-in-out infinite;` to `.brand img`. Now turn on "Emulate CSS media feature prefers-reduced-motion: reduce" in DevTools (Command menu → "Rendering" → emulate). Does it stop?
8. Give the shop picture `aspect-ratio: 1 / 1; object-fit: cover;`. How is it cropped? Add `object-position: left bottom;`.
9. Write the border-radius `border-radius: 50%;` on the logo image. What shape is it?
10. Try `box-shadow: inset 0 0 0 3px var(--berry);` on a button. How is it different from a border?

## ✅ Check yourself

<details>
<summary>1. When should a picture be an <code>&lt;img&gt;</code> and when a CSS background?</summary>

An `<img>` (with `alt`) when it carries content or meaning; a CSS background when it is only decoration.
</details>

<details>
<summary>2. Explain every number in <code>box-shadow: 0 4px 12px rgb(0 0 0 / 0.2)</code>.</summary>

0 = horizontal offset, 4px = vertical offset (down), 12px = blur radius, and the colour is black at 20% opacity.
</details>

<details>
<summary>3. Why does the <code>transition</code> usually go on the base rule, not on <code>:hover</code>?</summary>

Because the transition used is the one on the element's *current* state. With it on the base rule, the element glides both to the hover state and back. With it on `:hover` only, it would animate forward but jump back.
</details>

<details>
<summary>4. Why are <code>transform</code> and <code>opacity</code> the best properties to animate?</summary>

They don't change the layout, so the browser does not have to re-measure the page on each frame, and they can be handled by the graphics hardware. Animating `width`, `margin` or `top` is much heavier.
</details>

<details>
<summary>5. What does <code>object-fit: cover</code> do?</summary>

It scales the picture to completely fill its box, keeping its proportions, and crops whatever sticks out.
</details>

## Recap

- Backgrounds: colour, `linear-gradient`/`radial-gradient`, images (`cover`, `contain`). Use `<img>` for content and CSS for decoration.
- `border-radius` rounds corners (`999px` = pill, `50%` = circle); `box-shadow` adds depth without taking space.
- `object-fit` and `aspect-ratio` make pictures fit boxes of any shape.
- `transition` animates between two states; `transform` and `opacity` are cheap to animate; `@keyframes` plus `animation` for sequences.
- Always respect `prefers-reduced-motion`.

➡️ **Next:** [Lesson 10 – Flexbox](10-flexbox.md)
