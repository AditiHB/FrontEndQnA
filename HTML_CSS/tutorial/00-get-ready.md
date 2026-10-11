# Lesson 0: Get Ready

> **Like I'm 5:** Before we build a house we need a pencil, some paper and a table to draw on. A web page is the same: you only need a **text editor**, a **browser** and a **folder**. No installing, no magic.

| | |
|---|---|
| **You will learn** | What HTML, CSS and JavaScript each do, how to set up your tools, and how to open the browser's built-in "X-ray glasses" (DevTools) |
| **You will build** | An empty project folder, ready for the **Bunny Bakery** website |
| **Time** | About 20 minutes |

## The story

A friendly baker called **Bunny** wants a website for her new bakery. She needs a page that shows her treats, tells her story, lists her opening hours, lets people order a box, and **looks good on a phone, a tablet and a big computer**.

You will build exactly that, from a blank file, in this course.

## 1. What are HTML and CSS?

A web page is built from three layers. Think of a person:

| Layer | Person | What it does | Used in this course |
|-------|--------|--------------|---------------------|
| **HTML** | The **skeleton** | The *content and structure*: "this is a heading, this is a list, this is a picture" | Lessons 1 to 4 |
| **CSS** | The **clothes and posture** | The *look and layout*: colours, fonts, spacing, where things sit, how they change on a small screen | Lessons 5 to 19 |
| **JavaScript** | The **muscles** | The *behaviour*: things that move or react | Not needed here |

HTML says **what** things are. CSS says **how** they look. You should always do them in that order: write the structure first, then style it.

> **Responsive design** means one website that fits **every screen size**, from a small phone to a huge monitor, by letting the layout bend instead of breaking. It is a big part of this course (Lessons 13 to 15).

## 2. Your tools

You need only three things.

### A modern browser

Use the latest **Chrome**, **Edge**, **Firefox** or **Safari**. They all follow the same web standards. This course uses current features (like container queries and `:has()`), and every one of them is available in all four browsers.

### A code editor

[Visual Studio Code](https://code.visualstudio.com/) is free and friendly. Any plain-text editor works (not a word processor like Word: those add hidden formatting).

Useful VS Code extensions (optional):

- **Live Server**: refreshes the browser automatically every time you save.
- **Prettier**: tidies the way your code is laid out.

### A folder

All your files live in one folder. We will make it in Lesson 1.

## 3. How you will work

The whole course follows one loop:

```text
   edit a file  ──►  save (Ctrl+S / Cmd+S)  ──►  refresh the browser  ──►  look
        ▲                                                                     │
        └─────────────────────────────────────────────────────────────────────┘
```

To open your page, double-click `index.html` (it opens in your browser), or right-click it in VS Code and choose **Open with Live Server**. The address bar will show something like `file:///…/bunny-bakery/index.html`. That is fine: the course needs no web server.

## 4. Meet DevTools: your X-ray glasses

Every browser has built-in tools for looking inside a page. You will use them in **every** lesson.

**Open them:** press **F12**, or `Ctrl+Shift+I` (Windows/Linux), or `Cmd+Option+I` (Mac), or right-click anything on a page and choose **Inspect**.

The three most useful parts:

| Part | What it shows | Used for |
|------|---------------|----------|
| **Elements** (or *Inspector*) | The page's HTML as a tree. Click an element and the **Styles** pane shows the CSS that applies to it | Finding out *why* something looks the way it does |
| **Computed** | The final values after all the CSS rules fought it out | Checking sizes and colours |
| **Device toolbar** (a phone-and-tablet icon, or `Ctrl+Shift+M`) | Pretends your screen is a phone, a tablet or any width you type | **Testing responsive design** |

### Try it right now

1. Open any website. Press **F12**.
2. Click the little arrow icon in the DevTools corner and then click a heading on the page. The **Elements** tab jumps to that heading's HTML.
3. Double-click the heading's text in the Elements tab, type something silly and press Enter. The page changes!
4. Reload the page. Everything goes back. (You only changed the copy in your browser, never the real website.)
5. Click the **device toolbar** icon and choose "iPhone" or similar. The page shrinks to a phone. Drag the edge of the preview to resize it live.

This "poke it and see" habit is the fastest way to learn CSS. You can safely try anything in DevTools.

## 5. Where the files and the pictures are

Everything in this course is in the folder [`HTML_CSS/tutorial`](.) of this repository:

- the lesson files (`00-…md` to `19-…md`),
- [`finished-project/`](finished-project/): the **complete websites** to compare with when you are stuck. `bunny-bakery/` is the plain HTML and CSS site, and `bunny-bakery-tailwind/` is the same site built with Tailwind CSS,
- [`playgrounds/`](playgrounds/): small interactive pages for practising Flexbox and Grid (Lessons 10 and 11).

The bakery needs some pictures: a logo and some illustrations in several sizes. They are in `finished-project/bunny-bakery/images/`. In Lesson 2 you will copy that folder into your own project.

## 6. How to read the lessons

Each lesson has the same parts:

| Part | What it is |
|------|------------|
| 🧒 **Like I'm 5** | One picture to hold in your head |
| **Steps** | Short explanations followed by code to type |
| **What just happened?** | The idea behind the code |
| 🧪 **Try it yourself** | Experiments. Break things on purpose! |
| ✅ **Check yourself** | Questions with hidden answers (click to open) |
| **Recap** | The lesson in a few bullets |

How code is shown:

- 📄 **`path/to/file`** *(new file)*: create this file with exactly this code.
- 📄 **`path/to/file`** *(replace everything)*: select all the old text and replace it.
- 📄 **`path/to/file`** *(add to the bottom)*: add the code at the end of the file.
- 📄 **`path/to/file`** *(edit these lines)* with a `diff` block: lines starting with **`-`** (red) are removed, lines starting with **`+`** (green) are added, lines without a sign just show you where you are, and `@@` separates different places in the file. Do not type the `-` and `+` signs.
- `bash` blocks are terminal commands. There are only a few. Wherever you see one you can do the same thing with your file explorer (new folder, copy, delete).

## 🧪 Try it yourself

1. Open DevTools on a website you like. Find the **Styles** pane. Change a colour by clicking a colour swatch.
2. Open the device toolbar and check how that website looks on a phone. Does anything look broken?
3. Find the `<title>` of the page in the Elements tab (it is inside `<head>`). Where do you see that text in the browser?

## ✅ Check yourself

<details>
<summary>1. What are the jobs of HTML, CSS and JavaScript?</summary>

HTML is the content and structure, CSS is the look and layout, JavaScript is the behaviour.
</details>

<details>
<summary>2. Why can you safely edit things in DevTools?</summary>

DevTools changes only the copy of the page in your own browser. Reloading brings the original back, and the real website is untouched.
</details>

<details>
<summary>3. What does "responsive" mean?</summary>

A page that adapts its layout to fit any screen size, from phones to big monitors, instead of needing a separate site for each.
</details>

## Recap

- HTML is the skeleton, CSS the clothes, JavaScript the muscles. This course covers the first two (plus Tailwind, a way of writing CSS).
- You need a browser, an editor and a folder. No server.
- The work loop: edit, save, refresh, look.
- DevTools (F12) lets you inspect, change and test any page, including the phone view.

➡️ **Next:** [Lesson 1 – Your first web page](01-your-first-web-page.md)
