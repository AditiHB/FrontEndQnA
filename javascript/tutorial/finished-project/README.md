# Lemonade Stand (the finished project)

This is the complete project you build in the [JavaScript tutorial](../README.md), exactly as it should look after **Step 22**. Use it to compare with your own code if you get stuck.

It is a small shop with a command-line version, a web page, a tiny orders API, a Web Worker, and automatic tests.

## Run it

You need **Node.js 22 or newer**.

```bash
npm install          # download the helper tools (creates node_modules)
npm run check        # lint + format check + 69 tests + production build
```

### The command-line stand

```bash
node cli.js                # place two orders and watch the kitchen
node cli.js --receipt      # also print two receipts
node cli.js --banner       # also print a banner
node report-cli.js         # the end-of-day report (blocking vs chunked)
```

### The web page

Open **two** terminals in this folder.

```bash
npm run api          # terminal 1: the tiny orders API and file server (http://localhost:3000)
npm run dev          # terminal 2: Vite, with live updates (http://localhost:5173)
```

Open **http://localhost:5173**. Add a lemonade, place an order, and watch the kitchen board.

Other pages and commands:

| Command                                              | What it does                                                                          |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `http://localhost:3000` (with `npm run api` running) | The same page, served by `tools/serve.js` **with the Content-Security-Policy header** |
| `npm run build`                                      | Make the production site in `dist/`                                                   |
| `npm run preview`                                    | Serve `dist/` at http://localhost:4173 (keep `npm run api` running)                   |
| `npm test`                                           | Run the 69 tests once (`npm run test:watch` re-runs on every save)                    |
| `npm run lint`                                       | ESLint                                                                                |
| `npm run format` / `npm run format:check`            | Prettier: fix / only check                                                            |

## What is where

| Folder or file                                           | What it is                                                                                                                                                                                  |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/`                                                   | The stand. Pure logic (cart, order, store, money, format, security) and the "shell" that touches the outside world (`api.js`, `storage.js`, `ui.js`, `board.js`, `sections.js`, `main.js`). |
| `tests/`                                                 | Nine Vitest files: unit tests, an integration test, a mocked `fetch`, and fake timers.                                                                                                      |
| `tools/serve.js`, `tools/headers.js`                     | A tiny web server with an orders API, and the security headers it sends.                                                                                                                    |
| `cli.js`, `report-cli.js`                                | The command-line programs.                                                                                                                                                                  |
| `index.html`, `styles.css`                               | The web page.                                                                                                                                                                               |
| `package.json`, `package-lock.json`                      | Scripts, dev tools, and the exact versions installed.                                                                                                                                       |
| `eslint.config.js`, `.prettierrc.json`, `vite.config.js` | Tool settings.                                                                                                                                                                              |

For the full map, and which step created each file, see [Step 23](../23-graduation.md).
