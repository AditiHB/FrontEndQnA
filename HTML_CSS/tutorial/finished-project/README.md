# Finished projects

Two complete versions of the **Bunny Bakery** website, to open and compare with when you are stuck.

| Folder | What it is | How to open it |
|--------|------------|----------------|
| [`bunny-bakery/`](bunny-bakery) | The site as it is **at the end of Lesson 16**: plain HTML and CSS. Files: `index.html`, `styles.css`, `site.js` (the three lines that close the mobile menu) and the `images/` folder | Double-click `index.html` |
| [`bunny-bakery-tailwind/`](bunny-bakery-tailwind) | The same site **at the end of Lesson 18**, built with Tailwind CSS v4. Files: `index.html`, `site.js`, `src/input.css` (the theme and components), `dist/output.css` (the generated CSS), `images/` and `package.json` | Double-click `index.html` |

How to compare: open your own folder and the finished one side by side in VS Code (right-click a file and choose **Select for Compare**, then **Compare with Selected**), or use your editor's "diff" tool. The two folders were produced by following the lessons exactly, in order, from an empty folder.

## Working on the Tailwind version

The page already links the generated `dist/output.css`, so it opens as it is. To change classes and rebuild the CSS you need [Node.js](https://nodejs.org/) 20 or newer:

```bash
cd bunny-bakery-tailwind
npm install          # installs Tailwind and its command line tool into node_modules
npm run dev          # builds the CSS again every time you save (stop with Ctrl+C)
npm run build        # one-time build, minified
```

`node_modules` is not stored here: `npm install` creates it.

## The pictures

All the pictures are in `bunny-bakery/images/` (the Tailwind folder has its own copy, so that each project opens on its own). They are drawings made for this course: a logo (`logo.svg`), a shop front in three widths (`hero-400/800/1200.webp`, with a `.png` fallback), a kitchen scene (`story-wide-640/1280.webp`), and a square crop of the kitchen (`story-square-400/800.webp`) that the story section shows on phones. See Lesson 15 for how they are used.
