# Chapter 33: Build and bundling

> **Like I'm 5:** Before a trip you pack a suitcase. At home you can leave everything out on the bed, messy and easy to look at. For the trip you fold things small, leave out the clothes you will never wear, and put a label on every bag. The **build** is packing the suitcase for the trip. The messy bed is the **development** version. The folded suitcase is the **production** version.

Concept reference: [32. Build and bundling](../concepts/32-build-and-bundling.md)

[Back: Chapter 32](32-micro-frontends.md) · Next: [Chapter 34: Environments and configuration](34-environments-and-configuration.md)

## What we build today

We do not add a new page to the shop. Today we **look inside the suitcase**:

1. Compare the development build with the production build, with real numbers.
2. Learn what every line of the build report means.
3. Protect the shop from growing too big with **budgets**, and make a budget fail on purpose.
4. Write a tiny script that tells us **which libraries make the download big** (`npm run analyze`).
5. Run an experiment that shows **tree shaking** at work.

## The big idea

`ng build` takes everything you wrote (TypeScript, HTML templates, CSS, images) and everything you borrowed (Angular, Material, RxJS) and turns it into plain files a browser understands. For the Toy Shop it uses the **application builder** (`@angular/build:application`), which is built on a fast tool called **esbuild**. It makes two folders: `browser/` (what the visitor downloads) and `server/` (what Node uses for server rendering, Chapter 28).

| Word | Plain words |
|------|-------------|
| **AOT** (ahead of time) | Angular turns your templates into plain JavaScript **during the build**, not in the visitor's browser. |
| **Bundle** | One output file that holds many of your files glued together. |
| **Chunk** | A bundle piece. Lazy routes (Chapter 17) become their own chunks. |
| **Minify** | Remove spaces and comments, shorten names. Same behaviour, smaller file. |
| **Tree shaking** | Shake the tree, and the dead leaves (code nobody uses) fall off and are not packed. |
| **Hashing** | Put a fingerprint in the file name (`main-QGEUPIQV.js`). New content gives a new name, so browsers never keep an old copy by mistake. |
| **Source map** | A file that connects the squeezed code back to your original lines, for debugging. |
| **Budget** | A size limit. If the build is bigger than the limit, the build warns or fails. |

Two build **configurations** live in `angular.json`: `development` (easy to debug) and `production` (small and fast). In our project the production one is the default, which is why a plain `ng build` makes the production suitcase.

## Step 1: Pack it both ways

Open a terminal in the Toy Shop and run the default (production) build:

```bash
ng build
```

The browser part of the report:

```
Browser bundles      
Initial chunk files   | Names            |  Raw size | Estimated transfer size
chunk-B9cvqPPE.js     | -                | 239.23 kB |                70.37 kB
chunk-Cp5Ixod5.js     | -                | 198.50 kB |                49.19 kB
main-QGEUPIQV.js      | main             | 153.89 kB |                33.46 kB
chunk-CTbhmv6S.js     | -                |  60.09 kB |                16.15 kB
styles-PP25RTXV.css   | styles           |  10.81 kB |                 1.92 kB
polyfills-CGB46XCN.js | polyfills        | 537 bytes |               537 bytes

                      | Initial total    | 663.05 kB |               171.62 kB
```

Now the development build:

```bash
ng build --configuration development
```

```
Browser bundles     
Initial chunk files  | Names            |  Raw size
chunk-VA3KSFUP.js    | -                |   1.03 MB | 
chunk-WH7QADFY.js    | -                | 591.27 kB | 
...
main.js              | main             | 120.14 kB | 
styles.css           | styles           |  12.47 kB | 
...
                     | Initial total    |   2.33 MB
```

Side by side, from our real builds:

| | Development | Production |
|--|-------------|------------|
| Initial download (raw) | **2.33 MB** | **663.05 kB** |
| Initial download (compressed, estimated) | not shown | **171.62 kB** |
| File names | `main.js` (no fingerprint) | `main-QGEUPIQV.js` (fingerprint) |
| Source maps (`.map` files) | **43** files | **0** files |
| Size of the `browser/` folder | 6.9 MB | 1.1 MB |

The same shop, the same code. Production is about **3.5 times smaller** to download. That is why we never measure speed or size on the development build, and never deploy it.

### How to read the report

- **Initial chunk files**: everything the browser must download **before** the first page can start.
- **Lazy chunk files**: pieces downloaded **later**, when the visitor goes there (`wishlist`, `cart`, `checkout`, ...). The name in the second column comes from the route's file (Chapter 17).
- **Raw size**: the size on disk. **Estimated transfer size**: roughly the size on the wire after the server compresses it. The second number is what a visitor pays on a slow phone.
- The report also has a **Server bundles** part. Those files never go to the browser.

## Step 2: Source maps

A squeezed file is almost unreadable. When an error happens in production, the line it points at is something like `main-QGEUPIQV.js:1:48213`. A **source map** says "that is really line 42 of `cart.ts`".

Our production build makes **no** source maps. Try it with one:

```bash
ng build --source-map
```

```
Initial total | 663.87 kB | 171.77 kB
```

The initial size hardly changes (the browser only fetches a `.map` file when someone opens DevTools), but the output folder goes from **1.1 MB to 5.0 MB** and 34 `.map` files appear. The last line of each JavaScript file now says where its map is:

```
//# sourceMappingURL=main-NYHPJCBO.js.map
```

What do you do with them?

- **Development**: always on (this is why the development build had 43 of them).
- **Production**: keep them **off the public site**. Anyone could read your original code with them. A common plan is to upload them to your error-tracking tool (Sentry and friends) so it can show readable errors, and not publish them to visitors.

## Step 3: Budgets

A shop grows slowly: one more library here, one more picture there, and one day the page is twice as heavy. A **budget** is a smoke alarm for this. It is part of the production configuration in `angular.json`:

```json
"budgets": [
  { "type": "initial", "maximumWarning": "700kB", "maximumError": "1MB" },
  { "type": "anyComponentStyle", "maximumWarning": "4kB", "maximumError": "8kB" }
]
```

- `initial`: the total of everything in the "Initial chunk files" table (our **663.05 kB** is under the 700 kB warning).
- `anyComponentStyle`: the CSS of one component.
- A **warning** prints a message. An **error** makes `ng build` fail, so the build server (Chapter 35) stops the release.

Let us see them go off. Lower the warning to `500kB` and build again:

```
▲ [WARNING] bundle initial exceeded maximum budget. Budget 500.00 kB was not met by 163.05 kB with a total of 663.05 kB.
```

Now also lower the error limit (`maximumError`) to `600kB`:

```
Application bundle generation failed. [7.096 seconds]

▲ [WARNING] bundle initial exceeded maximum budget. Budget 500.00 kB was not met by 163.05 kB with a total of 663.05 kB.

✘ [ERROR] bundle initial exceeded maximum budget. Budget 600.00 kB was not met by 63.05 kB with a total of 663.05 kB.
```

The command also exits with a failure code, which is what a CI server looks at. **Put the limits back** (`700kB` and `1MB`) before you go on.

Tips for budgets: set them a little **above** today's size, not far above, and when one trips, find out **why** before you raise it.

## Step 4: Who is making the suitcase heavy?

A report with chunk names does not say *which library* is big. So we add a tiny script that adds up the bytes by package. First, the build can write a detailed file called the **stats file**:

```bash
ng build --stats-json
```

(It writes `dist/toy-shop/browser-stats.json`.) Our script reads it:

**`scripts/bundle-report.mjs`**

```js
// usage: node bundle-report.mjs dist/toy-shop/browser-stats.json
// Adds up how many bytes each package (and each of our own folders) puts in the download.
import { readFileSync } from 'node:fs';

const stats = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const totals = new Map();

for (const output of Object.values(stats.outputs)) {
  for (const [file, info] of Object.entries(output.inputs ?? {})) {
    const m = file.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
    const owner = m ? m[1] : file.startsWith('src/app/') ? 'our code: ' + file.split('/').slice(0, 3).join('/') : 'other';
    totals.set(owner, (totals.get(owner) ?? 0) + info.bytesInOutput);
  }
}

const rows = [...totals].sort((a, b) => b[1] - a[1]).slice(0, 12);
for (const [name, bytes] of rows) console.log((bytes / 1024).toFixed(1).padStart(8) + ' kB  ' + name);
```

It looks at every piece that went into every output file (`inputs`), uses the path to decide who owns it (`node_modules/<package>`, or one of our own folders), and adds up `bytesInOutput`. Wire it up as an npm script:

**`package.json`** (what changed)

```diff
@@ -9,7 +9,8 @@
     "test": "ng test",
     "test:coverage": "ng test --watch=false --coverage",
     "e2e": "playwright test",
-    "serve:ssr:toy-shop": "node dist/toy-shop/server/server.mjs"
+    "serve:ssr:toy-shop": "node dist/toy-shop/server/server.mjs",
+    "analyze": "ng build --stats-json && node scripts/bundle-report.mjs dist/toy-shop/browser-stats.json"
   },
   "private": true,
   "packageManager": "npm@10.9.4",
```

Run it:

```bash
npm run analyze
```

```
   265.9 kB  @angular/core
   168.1 kB  @angular/cdk
   101.1 kB  @angular/router
   100.4 kB  @angular/common
    94.6 kB  @angular/material
    56.4 kB  @angular/forms
    39.1 kB  our code: src/app/pages
    32.5 kB  rxjs
    16.7 kB  @angular/platform-browser
    16.6 kB  our code: src/app/components
    10.6 kB  other
     6.9 kB  our code: src/app/admin
```

(These sizes add up **all** output files, lazy chunks included, after minifying but before compression.)

Look at what it says:

- **Most of the shop's weight is the framework and its helper libraries**, not our own code. All our pages together are 39 kB; Angular core alone is 266 kB.
- `@angular/cdk` is 168 kB. It comes from the drag-and-drop list, the virtual scroll, the dialog and the overlay behind snackbars (Chapter 20). It is the biggest thing we chose on purpose, so it is the first place to look when someone asks "can we make it smaller?"
- `@angular/material` is only 95 kB even though Material is a huge library. We only import the buttons, dialog, snackbar, and so on that we use, and the build leaves out the rest. That is tree shaking.

> **Rule of thumb:** never guess what is heavy. Measure. People spend days making their own code smaller when the real weight is one library import.

## Step 5: Tree shaking, with a real experiment

Does the builder *really* leave out code nobody uses? We check, in a throwaway copy. Make a file with two functions, each returning a recognisable text:

```ts
// src/app/shake/tools.ts
export function usedTool(): string {
  return 'USED_TOOL_MARKER';
}

export function unusedTool(): string {
  return 'UNUSED_TOOL_MARKER';
}
```

And a file that does something **just by being loaded** (a "side effect"):

```ts
// src/app/shake/legacy.ts
(globalThis as Record<string, unknown>)['legacyPlugin'] = 'LEGACY_MARKER_STRING';
```

In `src/main.ts` we use only one function, and import the other file for its side effect:

```ts
import { usedTool } from './app/shake/tools';
import './app/shake/legacy';

console.log(usedTool());
```

Build for production, then search the output files for the three texts:

| Text | Found in the bundle? |
|------|----------------------|
| `USED_TOOL_MARKER` | **yes** |
| `UNUSED_TOOL_MARKER` | **no**: the unused function was shaken off |
| `LEGACY_MARKER_STRING` | **yes**: a bare `import './legacy'` is kept, because the builder must assume it does something |

That is tree shaking: the builder follows who imports what, and drops exported things nobody imports. Some rules follow from this:

- It works with **ES modules** (`import` and `export`). Old `require()` libraries (CommonJS) cannot be shaken well, so prefer packages that ship ES modules.
- Import **only the part you need**. `import { debounceTime } from 'rxjs'` is fine. A whole-library "namespace" object that is used dynamically can pull in everything.
- `providedIn: 'root'` services (Chapter 9) are only included if somebody injects them.
- **Side-effect-only imports stay.** If you know your own files have none, you can tell the builder with `"sideEffects": false` in `package.json`. We tried it on our experiment: after we added `"sideEffects": false`, `LEGACY_MARKER_STRING` was **gone** from the bundle. That is powerful and dangerous: with that flag a bare `import './legacy'` is deleted, even if it was *supposed* to run. Use it only when it is true (libraries often do), and never to "make the bundle smaller" without testing.

When you are done, delete the experiment files. We left nothing of it in the project.

## Step 6: What else changes the size

You have already met the big levers in earlier chapters. This is where they pay off:

| Lever | Chapter | Effect |
|-------|---------|--------|
| Lazy routes (`loadComponent`, `loadChildren`) | 17 | Heavy pages leave the initial download (`wishlist` is 59.8 kB, `cart` 34.5 kB, and neither is in the initial 663 kB). |
| `@defer` blocks | 5, 27 | The same idea inside one page. |
| Optimised images (`NgOptimizedImage`) | 27 | Pictures are usually the heaviest part of a real shop. |
| Compression on the server | 35 | The "estimated transfer size" column becomes real. |
| Fewer or lighter libraries | this chapter | Use `npm run analyze` to find them. |
| `localize` builds | 22 | One build per language (our `hi` configuration builds Hindi). |

## Check it works

```bash
npx ng test --watch=false
```

```
 Test Files  38 passed (38)
      Tests  96 passed (96)
```

(No new tests today. The scripts and the budget are the safety net.)

- [ ] `ng build` prints `Initial total ... 663.05 kB` (your number may differ by a little).
- [ ] `ng build --configuration development` is far bigger and its files have no fingerprint.
- [ ] After lowering `maximumError` to `600kB`, `ng build` **fails** with the budget message. After you put it back, it works.
- [ ] `npm run analyze` prints a table with `@angular/core` at the top.
- [ ] `git status` shows no leftover experiment files.

## What you learned

- `ng build` uses the **application builder** (esbuild) and makes `browser/` and `server/` folders.
- **Production** builds do AOT, minify, tree-shake, hash names, split lazy chunks, and (for us) make no source maps. Development builds are bigger and easier to debug.
- The report separates **initial** and **lazy** chunks, and raw from transferred size.
- **Budgets** turn growth into a warning or a failed build.
- A stats file plus a tiny script tells you which packages weigh the most. **Measure before you optimise.**
- **Tree shaking** drops unused exports; bare side-effect imports are kept unless `sideEffects` says otherwise.
- Source maps are for you, not for visitors.

## Try it yourself

1. Run `ng build --stats-json`, then open `dist/toy-shop/browser-stats.json` and find the biggest input file. Which package is it from?
2. Lower the `anyComponentStyle` warning to `1kB`. Which components trip it? Put it back.
3. Run the tree-shaking experiment again, but let `usedTool` call `unusedTool`. Which markers are in the bundle now? Why?
4. Compare `ng build` with `ng build --configuration development` for the **lazy** chunks. Which is bigger, and by how much?
5. Change `outputHashing` to `none` for a build and look at the file names. Why is the default `all` safer for a real site?

## If something goes wrong

**`bundle initial exceeded maximum budget`:** the build is bigger than the limit. Run `npm run analyze` to see why. If the growth is on purpose, raise the budget in a commit that says so.

**The `dist` folder looks half empty after a build:** the build was cut short. If you pipe the build into another command (for example `ng build | head -30`), the pipe closes early and can stop the build. We saw this. Run the build on its own, then read the output.

**`npm run analyze` says `ENOENT ... browser-stats.json`:** the stats file was not written. Check that the script runs `ng build --stats-json` first, and that your `outputPath` is `dist/toy-shop`.

**The production site breaks but development works:** build production locally and serve it before you release (`npm run build` then `npm run serve:ssr:toy-shop`, Chapter 28). The two builds are not the same program.

**An error in production shows `main-QGEUPIQV.js:1:48213`:** that is a minified position. Use a source map (kept private) to translate it.

Next: [Chapter 34: Environments and configuration](34-environments-and-configuration.md)
