# Chapter 0: Welcome to the Toy Shop

> **Like I'm 5:** We are going to build a toy shop out of LEGO bricks. Every chapter hands you one new kind of brick and shows you what it is for. When the last chapter is done, you will have a whole shop that you built yourself, and you will know what every brick does.

[Back to the tutorial map](README.md) · Next: [Chapter 1: Set up and meet the CLI](01-set-up-and-meet-the-cli.md)

## What you will build

A small online shop called **Toy Shop**. It has:

- a home page with toy cards, a search box, and group buttons (cars, soft toys, puzzles, games)
- a page for each toy, and a cart that remembers what you picked
- a login, a checkout form, and a list of your orders
- a wish list you can re-order by dragging
- a hidden admin corner, only for admins
- Hindi and English, keyboard and screen-reader friendly, and it works offline

That is a lot of shop! We will not build it in one go. We build it in **37 small chapters** (this welcome is chapter 0), and after every chapter the shop works.

## Why a toy shop?

Because a toy shop has everything a real business website has: a list of things, a detail page, a cart, a login, forms, money, and people who make mistakes. Real enough to be useful, small enough to fit in your head.

## How each chapter works

Every chapter has the same parts, so you always know where you are:

| Part | What it is |
|------|------------|
| **Like I'm 5** | One or two sentences, the simplest picture of the idea |
| **What we build today** | The goal of the chapter, plus a picture of the result |
| **The big idea** | A short story, then the "grown-up words" for the same thing |
| **Steps** | Numbered steps with the exact commands and code to type |
| **Check it works** | A command to run, and what you should see |
| **What you learned** | A short recap |
| **Try it yourself** | Small challenges to do without help |
| **If something goes wrong** | Real error messages and how to fix them |

Each chapter is linked to one page in the [concepts reference](../concepts/README.md). The tutorial teaches by building. The concepts pages are the deeper "encyclopedia" for the same idea. Read the chapter first, then the concept page when you want the details.

## What you need

| Thing | Version | How to check |
|-------|---------|--------------|
| Node.js | 22.22.3 or newer 22, 24.15 or newer, or 26+ | `node -v` |
| npm | comes with Node | `npm -v` |
| A code editor | [VS Code](https://code.visualstudio.com/) is a good choice | |
| A browser | Chrome or Edge (we use its developer tools a lot) | |
| Git | any recent version | `git --version` |

Those Node versions are what Angular 22 asks for. If `node -v` prints something older, install a newer Node first. A tool called `nvm` makes switching versions easy.

You do **not** need to know Angular. It helps if you know a little HTML, CSS, and JavaScript. If you do not know TypeScript yet, that is fine too. TypeScript is JavaScript with labels on things, and we explain each label when we meet it. The [TypeScript concepts](../../typescript/concepts/README.md) are there if you get curious.

## How to type the code

1. **Type it, do not paste it.** Typing makes your fingers remember. (Pasting is fine when you are in a hurry.)
2. **Save the file after every change.** The browser refreshes by itself.
3. **Run `git commit` at the end of each chapter.** Then you can always see what a chapter changed with `git diff`, and you can go back if you break something.
4. **Read error messages.** They look scary, but they usually say exactly what is wrong. Angular's errors even have codes, such as `NG0201`, that you can search for.
5. **Stuck?** The finished project is in [`toy-shop-final`](toy-shop-final/). Compare your file with the one in there.

## The code is real

Every code listing in this tutorial was taken from a real project that was built chapter by chapter. After each chapter the author ran the build and the tests (and, in later chapters, the browser tests and a real browser). When a chapter says "you should see 7 passing tests", that is the number that really appeared. Where something could not be tested, for example a GitHub workflow that runs on GitHub's computers, the chapter says so.

This tutorial uses **Angular 22**. Angular changes fast, so you will notice a few things that older tutorials do not show:

- File names are short: `product-card.ts`, not `product-card.component.ts`.
- New apps run **without `zone.js`** ("zoneless"), and components update only when something tells them to.
- Tests run on **Vitest**, not Karma or Jasmine.
- Services use the new `@Service()` decorator.

We explain each of these when it appears. If an old blog post disagrees with this tutorial, trust the tutorial. It was run on the real thing.

## The map

The whole map, with the concept page for each chapter, is in the [tutorial README](README.md). The short version:

| Chapters | Theme |
|----------|-------|
| 1-10 | **The bricks**: CLI, components, templates, communication, control flow, directives, pipes, lifecycle, services, signals |
| 11-15 | **Moving and talking**: routing, RxJS, HTTP, interceptors, forms |
| 16-22 | **Making it good**: change detection, lazy loading, state, animations, Material, accessibility, translations |
| 23-27 | **Making it safe and strong**: errors, tests, debugging, security, speed |
| 28-32 | **Going further**: server rendering, offline app, libraries and schematics, web components, micro-frontends |
| 33-37 | **Shipping**: build, settings, CI/CD, upgrades, graduation |

## Ready?

Open a terminal. Let's meet the tool that builds everything: the Angular CLI.

Next: [Chapter 1: Set up and meet the CLI](01-set-up-and-meet-the-cli.md)
