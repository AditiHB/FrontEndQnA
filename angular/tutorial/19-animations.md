# Chapter 19: Animations

> **Like I'm 5:** When a toy arrives on the shelf it can pop in softly, like a magic trick. When you take a toy out of the cart it can slide away before it disappears. Animations make changes feel friendly instead of sudden. But some children get dizzy from moving things, so we also need a "please keep still" switch.

Concept reference: [17. Animations](../concepts/17-animations.md)

[Back: Chapter 18](18-state-management.md) · Next: [Chapter 20: Angular Material and the CDK](20-material-and-cdk.md)

## What we build today

Four small touches of motion:

1. Toy cards **fade in** when they appear on the shelf.
2. The "Added: ..." message **pops**.
3. A line in the cart **slides away** before it is removed.
4. Moving from page to page **cross-fades** smoothly.

And one rule: if a person asked their device to **reduce motion**, we respect it.

## The big idea

There are two kinds of animation in a web app:

1. **State changes** (a button changes colour on hover): plain CSS `transition`. No Angular needed.
2. **Elements arriving and leaving** (a card appears, a cart line is removed). This is harder, because when `@if` or `@for` removes an element, it is gone *at once*. There is no time left to play a goodbye animation. Angular solves it with two attributes:

| Attribute | What Angular does |
|-----------|-------------------|
| `animate.enter="my-class"` | When the element is **added**, put the class `my-class` on it. Your CSS animation plays. |
| `animate.leave="my-class"` | When the element is about to be **removed**, put the class on it first, **wait for its animation to finish**, and only then remove it. |

That is all! The animation itself is ordinary CSS (`@keyframes`). Angular only handles the timing. No extra package, no special language.

> **A note on older tutorials.** You will see `@angular/animations` (with `trigger`, `state`, `transition`, `provideAnimations`). That older package is **deprecated** in Angular 22. Its npm page says: *"@angular/animations is deprecated. Use `animate.enter` and `animate.leave` instead."* We do not install it.

A third tool animates **whole pages**: `withViewTransitions()` for the router uses the browser's View Transitions API to cross-fade the old page into the new one.

**The golden rules of animation:**

- **Animate `transform` and `opacity`.** The browser can do these cheaply. Animating `width`, `height`, or `top` makes the page jump around and is slow.
- **Keep it short** (150 to 400 ms).
- **Respect `prefers-reduced-motion`.** Some people get sick from motion.

**Grown-up words:**

- **`@keyframes`**: a CSS description of an animation (from here to there).
- **View Transitions API**: a browser feature that takes a "photo" of the old page and the new page and blends them.
- **`prefers-reduced-motion`**: a setting in the operating system that the page can read with a CSS media query.

## Step 1: The animation classes

All animations are plain CSS in the global stylesheet, so any component can use them. Add this to the end of `src/styles.css`:

**`src/styles.css`** (what changed)

```diff
@@ -81,3 +81,61 @@ a {
   outline: 3px solid var(--color-accent);
   outline-offset: 2px;
 }
+
+/* ---------- Animations ----------
+   Angular adds these classes when an element arrives (animate.enter)
+   and waits for them to finish before removing it (animate.leave). */
+.fade-in {
+  animation: fade-in 300ms ease-out;
+}
+
+.slide-in {
+  animation: slide-in 300ms ease-out;
+}
+
+.slide-out {
+  animation: slide-out 250ms ease-in forwards;
+}
+
+.pop {
+  animation: pop 250ms ease-out;
+}
+
+@keyframes fade-in {
+  from {
+    opacity: 0;
+    transform: translateY(8px);
+  }
+}
+
+@keyframes slide-in {
+  from {
+    opacity: 0;
+    transform: translateX(-24px);
+  }
+}
+
+@keyframes slide-out {
+  to {
+    opacity: 0;
+    transform: translateX(24px);
+  }
+}
+
+@keyframes pop {
+  from {
+    transform: scale(0.8);
+    opacity: 0;
+  }
+}
+
+/* Some people get dizzy from motion. Their device can say "please reduce motion". */
+@media (prefers-reduced-motion: reduce) {
+  *,
+  *::before,
+  *::after {
+    animation-duration: 0.01ms !important;
+    animation-iteration-count: 1 !important;
+    transition-duration: 0.01ms !important;
+  }
+}
```

- `.fade-in` slides up 8 pixels while fading in.
- `.slide-in` and `.slide-out` move a cart line from the left, and out to the right.
- `.pop` scales from 80 percent.
- `forwards` on `slide-out` means "stay in the final state (transparent, moved) at the end", so the line does not flash back before it is removed.
- The last block is the **reduced motion** switch: when the device asks for it, every animation lasts 0.01 ms and plays once, effectively off.

## Step 2: Use them in templates

Cards fade in; the "added" message pops:

**`src/app/pages/home/home.html`** (what changed)

```diff
@@ -36,7 +36,7 @@
 
 <p class="added" aria-live="polite">
   @if (lastAdded()) {
-    Added: {{ lastAdded() }}
+    <span animate.enter="pop">Added: {{ lastAdded() }}</span>
   }
 </p>
 
@@ -54,6 +54,7 @@
 <div class="grid">
   @for (p of pageItems(); track p.id) {
     <app-product-card
+      animate.enter="fade-in"
       [product]="p"
       [liked]="wishlist.has(p.id)"
       (likeToggled)="wishlist.toggle($event.id)"
```

Cart lines slide in and slide out:

**`src/app/pages/cart/cart.html`** (what changed)

```diff
@@ -5,7 +5,7 @@
 } @else {
   <ul class="lines">
     @for (item of cart.items(); track item.product.id) {
-      <li class="line">
+      <li class="line" animate.enter="slide-in" animate.leave="slide-out">
         <span class="emoji" aria-hidden="true">{{ item.product.emoji }}</span>
         <a [routerLink]="['/product', item.product.id]">{{ item.product.name }}</a>
         <span>{{ item.product.price | currency }}</span>
```

No imports, no TypeScript changes: `animate.enter` and `animate.leave` work on any element.

## Step 3: Smooth pages

Add one more option to the router in `app.config.ts`:

**`src/app/app.config.ts`** (what changed)

```diff
@@ -5,6 +5,7 @@ import {
   withComponentInputBinding,
   withInMemoryScrolling,
   withPreloading,
+  withViewTransitions,
 } from '@angular/router';
 import { routes } from './app.routes';
 import { authInterceptor } from './interceptors/auth-interceptor';
@@ -22,6 +23,8 @@ export const appConfig: ApplicationConfig = {
       withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
       // Quietly download the pages marked data: { preload: true } in the background.
       withPreloading(SelectivePreload),
+      // Let the browser fade smoothly from one page to the next.
+      withViewTransitions(),
     ),
     provideHttpClient(
       withFetch(),
```

`withViewTransitions()` makes the browser cross-fade between pages. You can style the transition with CSS (`::view-transition-old(root)` and `::view-transition-new(root)`), but the default is already pleasant. Browsers without the feature simply skip the effect, so nothing breaks.

## Check it works

```bash
npx ng test --watch=false
```

```
 Test Files  28 passed (28)
      Tests  73 passed (73)
```

(No new tests; animations are visual.) In the browser:

- [ ] Reload the home page: the cards fade in.
- [ ] Press **Add to cart**: the "Added: ..." message pops.
- [ ] Open the cart with two toys and press **Remove** on one: the line slides to the right, then disappears.
- [ ] Click between **Toys** and **Cart** in the header: the pages cross-fade.

We timed the cart line in a real browser (it checks the line's CSS classes every 40 ms after pressing **Remove**):

```
normal motion  -> 37ms: line | 80ms: line slide-out | ... | 254ms: line slide-out | 298ms: GONE
reduced motion -> 29ms: line | 72ms: GONE
```

With normal motion the line has the class `slide-out` for about **250 ms** (the length of the animation) and is removed only after. With "reduce motion" switched on in the operating system, it is gone within about **70 ms**. Angular waited for the animation, and the animation was switched off, exactly as designed.

To test the reduced-motion switch yourself, open DevTools, press `Ctrl+Shift+P` (or `Cmd+Shift+P`), type `Emulate CSS prefers-reduced-motion`, and choose **reduce**.

## What you learned

- For elements that arrive and leave, use `animate.enter` and `animate.leave` plus a CSS `@keyframes` class. Angular waits for the leave animation before removing the element.
- Page-to-page motion comes from `withViewTransitions()`.
- Simple hover effects need only CSS `transition`.
- Animate `transform` and `opacity`, keep animations short, and honour `prefers-reduced-motion`.
- `@angular/animations` is the older, deprecated way.

## Try it yourself

1. Make `.fade-in` last 600 ms. Do you like it better? Why is shorter usually nicer?
2. Add `animate.leave="fade-out"` to the cards in the home page, and a `fade-out` keyframes. What do you see when you switch groups?
3. Add a CSS `transition: transform 150ms` and `.btn:hover { transform: translateY(-2px); }` to `styles.css` for a hover lift on buttons.
4. Style the page transition: `::view-transition-old(root) { animation-duration: 600ms; }`. Does it matter in a browser without View Transitions?

## If something goes wrong

**The leave animation does not play:** the class must define an `animation` (or `transition`) with a duration. If the element has no animation, Angular removes it immediately. Check the class name has no typo.

**The element flashes back before it disappears:** add `forwards` to the leave animation, so it keeps its last frame.

**The animation is jerky:** you are animating layout properties (`height`, `margin`). Use `transform` and `opacity`.

**People say the app makes them dizzy:** make sure your `prefers-reduced-motion` block is in the CSS, and that it is not overridden.

Next: [Chapter 20: Angular Material and the CDK](20-material-and-cdk.md)
