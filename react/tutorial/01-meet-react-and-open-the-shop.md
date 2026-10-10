# Lesson 1: Meet React and Open the Shop

> **Like I'm 5:** React is a painter who only repaints the part of the picture that changed. You tell the painter what the picture should look like. The painter works out the brush strokes.

| | |
|---|---|
| **Concept reference** | [01 – What React is & setup](../concepts/01-what-is-react-and-setup.md) |
| **You will learn** | What React is, how to create a project with Vite, what `createRoot` and `StrictMode` do, what the Virtual DOM is |
| **We build** | A page that says "Hello, Tiny Toy Shop!" running in your browser |
| **Time** | About 30 minutes |

## The story

You are about to open an online toy shop. People will look at toys, search for them, put them in a cart and pay. That is a lot of buttons and lists that change all the time.

React is the tool that keeps all of that tidy. In this first lesson we only do the very first thing: **open the shop door** (create the project and see something on the screen).

## 1. What is React, really?

Think about a picture frame on a wall.

- **Without React**, whenever something changes, *you* take a pencil and erase and redraw parts of the picture yourself. Easy for one change, a mess for a hundred.
- **With React**, you write down what the picture *should* look like for the current data. React is the painter. When the data changes, the painter compares the new picture to the old one and repaints **only the parts that are different**.

Programmers write that idea like this:

```text
UI = f(state)
```

Read it as: *the screen is a recipe (a function) that uses the current data (state) to make the picture.* Change the data, and the picture follows. You never say "go and change that one paragraph". You only say what the page should look like for the data you have right now.

Three more facts to remember:

- React is a **library** for drawing the screen. Things like page navigation (routing), loading data and building the final files are added separately. We add each of them in later lessons.
- A **component** is a small piece of the screen, like a LEGO brick. We build the whole shop out of bricks.
- The painter's trick has a name: **reconciliation**. We look at it closer at the end of this lesson.

## 2. Check your tools

You need three things:

1. **Node.js** (the engine that runs our build tools). Version **22.22 or newer**.
2. **A code editor.** [Visual Studio Code](https://code.visualstudio.com/) is a friendly choice.
3. **A terminal** (Terminal on Mac, PowerShell or Windows Terminal on Windows). VS Code has one built in: open it with ``Ctrl+` ``.

Check Node:

```bash
node -v
npm -v
```

You should see a version number such as `v22.22.0`. If you see "command not found" or a number lower than 22, install the current LTS version from [nodejs.org](https://nodejs.org/) first.

> `npm` is Node's helper that downloads code other people wrote (called *packages*) so we don't have to write everything ourselves.

## 3. Create the project

We use **Vite** (say "veet", French for "quick"). It sets up a React project with TypeScript and starts a quick development server.

Open your terminal in the folder where you keep projects, and run:

```bash
npm create vite@latest toy-shop -- --template react-ts
```

What each word means:

| Piece | Meaning |
|-------|---------|
| `npm create vite@latest` | "Please run the newest Vite project maker" |
| `toy-shop` | The name of the new folder |
| `--template react-ts` | "Make it a React project that uses TypeScript" |

> If the tool asks *"Install with npm and start now?"*, choose **No**. We will do those steps by hand so you can see each one.

Now go into the folder and install the packages the project needs:

```bash
cd toy-shop
npm install
```

`npm install` reads `package.json` (the shopping list of packages) and downloads them into a folder called `node_modules`. It can take a minute.

## 4. Start the shop

```bash
npm run dev
```

The terminal prints a local address, usually `http://localhost:5173/`. Open it in your browser. You will see a demo page with a counter button.

Leave the terminal running. It is the **dev server**: whenever you save a file, the browser updates by itself (this is called *hot reload*). To stop it later, press `Ctrl+C` in the terminal.

## 5. A tour of the folders

Open the `toy-shop` folder in your editor. Here is what matters:

| File or folder | What it is for |
|----------------|----------------|
| `index.html` | The one and only HTML page. It has an empty `<div id="root">` and loads our code. |
| `src/main.tsx` | The **front door**. It tells React where to draw. |
| `src/App.tsx` | The first component. The top brick of the whole shop. |
| `src/index.css` | Styles for the whole page. |
| `public/` | Files that are served as they are (icons, later our toy list). |
| `package.json` | The project's name, scripts (`dev`, `build`, `lint`) and shopping list of packages. |
| `vite.config.ts` | Settings for Vite. |
| `tsconfig*.json` | Settings for TypeScript, the tool that catches typing mistakes. |
| `.oxlintrc.json` | Settings for the linter (a spell-checker for code). |
| `node_modules/` | Downloaded packages. Never edit this folder. |

## 6. Clear away the demo

The template comes with a demo page full of pictures. We want a clean workspace.

Delete the demo files. In the terminal (stop the dev server with `Ctrl+C` first, or open a second terminal):

```bash
rm -r src/assets src/App.css public/icons.svg
```

> On Windows PowerShell use `Remove-Item -Recurse src/assets, src/App.css, public/icons.svg`, or just delete them in your editor's file list.

Now replace four files. Copy each code block **completely**; they replace everything that was in the file.

📄 **`index.html`** (replace everything)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tiny Toy Shop</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

📄 **`src/index.css`** (replace everything)

```css
/* Design tokens: every colour and size lives here, in one place. */
:root {
  --color-bg: #fffaf0;
  --color-surface: #ffffff;
  --color-text: #2d2a32;
  --color-muted: #5f5a68;
  --color-brand: #c2410c;
  --color-brand-soft: #ffe8d6;
  --color-brand-text: #c2410c;
  --color-accent: #1971c2;
  --color-link: #1971c2;
  --color-border: #eadfce;
  --color-danger: #c92a2a;
  --color-success: #2b8a3e;
  --radius: 14px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2rem;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
  background: var(--color-bg);
  color: var(--color-text);
}

h1,
h2,
h3 {
  line-height: 1.2;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 var(--space-3);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
```

📄 **`src/main.tsx`** (replace everything)

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

📄 **`src/App.tsx`** (replace everything)

```tsx
export default function App() {
  return <h1>Hello, Tiny Toy Shop!</h1>;
}
```

Look at your browser. The demo is gone and you should see the greeting. You just wrote your first React component. 🎉

## 7. What just happened?

Follow the path of one tiny page from file to screen:

```text
index.html            main.tsx                       App.tsx
┌──────────────┐     ┌─────────────────────────┐    ┌──────────────────────────┐
│ <div id=root>│ ←── │ createRoot(...).render( │ ←─ │ function App() {         │
│  (empty)     │     │   <App />               │    │   return <h1>Hello…</h1> │
└──────────────┘     │ )                       │    │ }                        │
                     └─────────────────────────┘    └──────────────────────────┘
```

Line by line, `main.tsx` says:

- `document.getElementById('root')` finds the empty frame in `index.html`.
- The `!` after it is TypeScript's "I promise this is not empty". (If the frame were missing, React could not draw.)
- `createRoot(frame)` hangs the painter (React) on that frame.
- `.render(<App />)` tells the painter: "Paint the `App` component."
- `<StrictMode>` is a **safety inspector** that only works while you are developing. It runs some things twice on purpose to catch bugs early (more about this in Lesson 6). It does nothing in the finished site.
- `import './index.css'` loads our styles.

And `App.tsx` is a **component**: a plain function that **returns** what that piece of the screen should look like. Two rules already:

1. The function name starts with a **capital letter** (`App`, not `app`). That's how React tells a component from a normal HTML tag.
2. It returns **JSX**, the HTML-looking text. We study JSX next lesson.

## 8. Make a change and watch

With `npm run dev` running, change the text in `src/App.tsx`:

```tsx
export default function App() {
  return <h1>Hello, Tiny Toy Shop! We are open!</h1>;
}
```

Save the file. The browser changes instantly without you reloading. Change it back afterwards, or keep it; the next lesson replaces this file anyway.

## 9. How does the painter work? (Virtual DOM)

The browser keeps the page as a tree of boxes called the **DOM**. Changing the real DOM is slowish. So React keeps its own light-weight copy: the **Virtual DOM**, a simple description of what the page should look like.

When your data changes:

```text
 old description          new description         what React does
 ───────────────          ───────────────         ───────────────
 <h1>Hello</h1>           <h1>Hello</h1>          (same, leave it alone)
 <p>Cart: 1</p>    ──►    <p>Cart: 2</p>    ──►   change only the text "1" to "2"
 <footer>…</footer>       <footer>…</footer>      (same, leave it alone)
```

React builds the new description, **compares** it with the old one (that is *reconciliation*), and only changes the real page where they differ. That is the "painter who only repaints what changed".

## 10. A quick look at the finished product

Our dev server is for developing. For the real internet we make a small, fast **production build**:

```bash
npm run build
npm run preview
```

- `npm run build` checks the types with TypeScript and then creates a folder called `dist/` with the final files (HTML, one JavaScript file, one CSS file).
- `npm run preview` serves `dist/` locally so you can see what visitors would get.

We will come back to this in Lesson 23 when we put the shop on the internet. `dist/` is made by the build, so you never edit it.

## 🧪 Try it yourself

1. Change the `<h1>` to an `<h2>`. What changes?
2. In `main.tsx`, change `<App />` to `<app />` (lower case). Look at your editor and the browser. React now thinks `app` is a plain HTML tag, so TypeScript complains and nothing shows. Undo it!
3. Run `npm run lint`. It should print no problems. Linters become useful when code grows.

## ✅ Check yourself

<details>
<summary>1. In one sentence, what does React do when the data changes?</summary>

It builds a new description of the screen, compares it with the old one, and updates only the parts of the real page that are different.
</details>

<details>
<summary>2. Why do component names start with a capital letter?</summary>

So React can tell them apart from plain HTML tags like `<h1>`. `<App />` is a component, `<app>` would be treated as an HTML tag.
</details>

<details>
<summary>3. What does <code>StrictMode</code> do?</summary>

During development it runs extra checks (for example, it runs effects twice) to help you find bugs early. It does nothing in the production build.
</details>

## Recap

- React draws the screen from data: `UI = f(state)`.
- We created a project with Vite and React + TypeScript.
- `main.tsx` hangs React on the `#root` frame with `createRoot`; `App` is our first component.
- The Virtual DOM lets React update only what changed.

➡️ **Next:** [Lesson 2 – JSX: writing HTML inside JavaScript](02-jsx-html-inside-javascript.md)
