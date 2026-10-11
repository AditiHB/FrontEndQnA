# Playgrounds and games

Four interactive pages for practising layout. They work **offline**: just double-click a file. No installation, no server.

| Page | What it is | Used in |
|------|------------|---------|
| [`flexbox-playground.html`](flexbox-playground.html) | Change `flex-direction`, `justify-content`, `align-items`, `flex-wrap`, `gap` and more. Click a box to change `flex-grow`, `flex-shrink`, `flex-basis`, `align-self` and `order` for that box. Drag the corner of the dashed area to resize it. The CSS you made is written below, ready to copy | [Lesson 10](../10-flexbox.md) |
| [`flexbox-challenges.html`](flexbox-challenges.html) | A game with **8 levels**. You write CSS, and the page compares the position of every box with the goal | [Lesson 10](../10-flexbox.md) |
| [`grid-playground.html`](grid-playground.html) | Type your own `grid-template-columns` and `-rows`, change gaps and alignment, make an item span, and see the grid lines drawn over the result | [Lesson 11](../11-css-grid.md) |
| [`grid-challenges.html`](grid-challenges.html) | A game with **9 levels**, from "three columns" to a page layout with named areas | [Lesson 11](../11-css-grid.md) |

## How the games work

- You type CSS in the box. The page applies it only to the **"Your result"** area, so you can't break anything.
- The page measures the position and size of every box in your result and in the **goal**. When all of them match (within a pixel or two), the level is solved.
- Each level also asks you to **use the idea it teaches** (for example `justify-content`). If your picture matches but you got there another way, such as with `position: absolute`, the page tells you to try the intended tool.
- **Hint** shows a clue, **Show the answer** types the solution for you, and **Start the level again** resets the box. The numbered circles jump to a level, and the levels you solved are remembered in your browser (they stay if you reload; clearing site data resets them).
- You can link to a level directly: `flexbox-challenges.html#4`.
- The games are visual. If you use a screen reader, the text of each level describes the goal in words.

## What is in the folder

| File | What it is |
|------|------------|
| `playground.css` | The shared look of the four pages (written in the same plain CSS as the course) |
| `challenge-engine.js` | The small game engine behind the two challenge pages (plain JavaScript, no libraries). Each challenge page defines its levels at the bottom of its HTML |
| `*.html` | The four pages. Open one in your editor to see how it works: there is nothing hidden |
