# Step 1: How JavaScript Runs - Meet the One-Handed Cook

> **Like I'm 5:** JavaScript is a cook with one pair of hands. The cook does one dish at a time, but while a dish is in the oven, the cook can start another one. The cook's to-do list is the event loop.

| | |
|---|---|
| **Concept lesson** | [1. How JavaScript runs](../concepts/01-how-javascript-runs.md) |
| **Time** | About 30 minutes |
| **You will build** | Your first JavaScript file, running in **two places**: Node.js and the browser |
| **Files you touch** | `hello.js`, `index.html`, `playground.js` |
| **Before** | [Step 0: Get ready](00-get-ready.md) |

## Words to know

| Word | Like I'm 5 |
|------|------------|
| **Engine** | The cook's brain. It reads your JavaScript and does what it says. Chrome and Node.js use an engine called **V8**. Firefox uses **SpiderMonkey**. Safari uses **JavaScriptCore**. |
| **Runtime** | The kitchen around the cook: the oven, the timer, the phone. The browser is one kitchen. Node.js is another kitchen. |
| **Single-threaded** | The cook has only **one pair of hands**. One thing at a time. |
| **Console** | A notice board where your program can write notes for you to read. |

---

## 1. The big idea

A web page is made of three friends:

- **HTML** is the picture.
- **CSS** is the paint.
- **JavaScript** is the magic that makes the picture move.

JavaScript can run in two kitchens:

| Kitchen | What is in it |
|---------|---------------|
| **The browser** | The page (`document`), the window (`window`), buttons and clicks, timers, `fetch` |
| **Node.js** | Files on your computer (`fs`), the program itself (`process`), networking, timers, `fetch` |

The cook (the engine) is the same. The kitchen is different. So the same JavaScript words work in both, but some tools only exist in one kitchen.

---

## 2. Say hello in Node.js

📄 **Create `hello.js`**

```js
// hello.js - our very first JavaScript file
console.log('Welcome to the Lemonade Stand! 🍋');
console.log('I am running in:', typeof window === 'undefined' ? 'Node.js' : 'the browser');
```

▶️ **Run:** `node hello.js`

👀 **You should see:**

```text
Welcome to the Lemonade Stand! 🍋
I am running in: Node.js
```

You just ran a program. `console.log(...)` writes a note on the notice board. The second line asks a question: "Is there a `window` here?" We explain `typeof` in Step 3. For now it means "what kind of thing is this?". In Node there is no `window`, so the answer is "Node.js".

---

## 3. Say hello in the browser (same file!)

Now we make a web page that loads the very same file.

📄 **Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Lemonade Stand</title>
    <script src="hello.js" defer></script>
  </head>
  <body>
    <h1>Lemonade Stand 🍋</h1>
  </body>
</html>
```

Open it in Chrome: double-click `index.html`, or drag it onto a Chrome window.

Then open the **developer tools**. Press `F12` (or `Ctrl+Shift+I`, or `Cmd+Option+I` on a Mac). Click the **Console** tab.

▶️ **Run (skip):** open `index.html` in Chrome and look at the Console tab

👀 **You should see something like:**

```text
Welcome to the Lemonade Stand! 🍋
I am running in: the browser
```

**The same file said a different answer.** That is the engine and the kitchen at work. `typeof window` was `'undefined'` in Node (no window in that kitchen) and `'object'` in the browser (there is a window).

---

## 4. Who is in each kitchen?

Let's ask both kitchens about their tools. We use the scribble pad.

📄 **Create `playground.js`**

```js
console.log('window     :', typeof window);
console.log('document   :', typeof document);
console.log('process    :', typeof process);
console.log('globalThis :', typeof globalThis);
console.log('fetch      :', typeof fetch);
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
window     : undefined
document   : undefined
process    : object
globalThis : object
fetch      : function
```

Now open the browser Console (on any page) and paste those five lines. You get:

| Name | Node.js | Browser |
|------|---------|---------|
| `window` | `undefined` | `object` |
| `document` | `undefined` | `object` |
| `process` | `object` | `undefined` |
| `globalThis` | `object` | `object` |
| `fetch` | `function` | `function` |

- `window` and `document` (the page) live **only** in the browser.
- `process` (the running program) lives **only** in Node.
- `globalThis` is the **shared name** for "the biggest box that holds everything". It works in both. Use it when you must write code for both kitchens.
- `fetch` (asking another computer for things) works in both in modern versions.

If you use `document` in Node, you get an error. That is not a bug in your code. It is the wrong kitchen:

```text
ReferenceError: document is not defined
```

---

## 5. One pair of hands

JavaScript is **single-threaded**. It has one call stack, which is a to-do pile with a single cook working on the top item. It cannot do two things at the *exact* same moment.

But the cook is clever. When something is slow, like a timer or a network trip, the cook hands it to the **kitchen** (the runtime) and keeps going. When the slow thing finishes, the kitchen puts a note back on the to-do list.

### Experiment A: the oven (non-blocking)

📄 **Replace `playground.js`**

```js
console.log('1. Put cookies in the oven');

setTimeout(() => {
  console.log('3. Ding! Cookies are ready');
}, 1000);

console.log('2. Meanwhile, make lemonade');
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
1. Put cookies in the oven
2. Meanwhile, make lemonade
3. Ding! Cookies are ready
```

Line 3 is written **first** in the file but prints **last**. `setTimeout` means "ring a bell after 1000 milliseconds". The cook did not stand at the oven staring. The cook carried on with line 2 and came back when the bell rang. That is how JavaScript stays quick even though it has one pair of hands. (Step 13 explains exactly how the bell works.)

### Experiment B: staring at the pot (blocking)

What if the cook *does* stand and stare? 

📄 **Replace `playground.js`**

```js
console.log('Start stirring...');

const start = Date.now();
while (Date.now() - start < 2000) {
  // The cook stares at the pot for 2 seconds and does NOTHING else.
}

console.log('Done stirring after 2 seconds');
```

▶️ **Run:** `node playground.js`

👀 **You should see:**

```text
Start stirring...
Done stirring after 2 seconds
```

It looks fine in the terminal, but there is a hidden problem. For those 2 seconds **nothing else could happen**. No bell could ring. No other work could run. In a browser it is much worse: **the whole page freezes**. Buttons will not click, scrolling sticks, and animations stop. That is called **blocking** the page.

> **Remember:** Long, slow, synchronous work blocks the page. Keep heavy work short, break it into pieces (Step 13), or move it to a Web Worker (Step 17).

---

## 6. How a web page loads your script

In the browser, the order matters. The browser reads your HTML from top to bottom. If it meets a `<script>` before it has built the `<h1>`, the script cannot see the `<h1>` yet.

Let's catch that in the act.

📄 **Replace `playground.js`**

```js
console.log('The big title is:', document.querySelector('h1'));
```

(`document.querySelector('h1')` means "find the first `<h1>` on the page". Step 16 explains it. This file only works in the browser, so we do not run it with Node.)

### Experiment C: no `defer`

In `index.html`, temporarily change the script line in the `<head>`:

```html
<script src="playground.js"></script>
```

Refresh the page and look at the Console. You get:

```text
The big title is: null
```

`null` means "nothing found". The script ran **before** the `<h1>` existed.

### Experiment D: with `defer`

Now add the word `defer`:

```html
<script src="playground.js" defer></script>
```

Refresh. Now the Console shows the real `<h1>` element. `defer` means "download this script now, but run it **after** the whole page is built".

### The three ways to load a script

```html
<script src="app.js" defer></script>          <!-- runs after the HTML is parsed, in order -->
<script src="analytics.js" async></script>    <!-- runs as soon as it downloads, in any order -->
<script type="module" src="main.js"></script> <!-- a modern ES module, deferred by default -->
```

| Attribute | When it runs | Use it for |
|-----------|--------------|------------|
| `defer` | After the page is parsed. Keeps order. | Your own scripts |
| `async` | The moment it downloads. Order not promised. | Independent things like analytics |
| `type="module"` | Deferred automatically. Can use `import`. | Modern code (we switch to this in Step 16) |

**Put `index.html` back** the way it was in section 3 (with `hello.js` and `defer`):

📄 **Replace `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Lemonade Stand</title>
    <script src="hello.js" defer></script>
  </head>
  <body>
    <h1>Lemonade Stand 🍋</h1>
  </body>
</html>
```

---

## 7. What just happened?

- Your JavaScript is read by an **engine** (V8 in Chrome and Node). The engine only knows the language itself.
- The **runtime** gives the engine extra powers: the browser adds `document`, clicks and `fetch`. Node adds files, `process` and networking.
- JavaScript is **single-threaded**: one pair of hands. Slow jobs (timers, network, clicks) are handled by the runtime, and their results come back through the **event loop** (Step 13).
- Blocking the single thread freezes the page.
- In HTML, `defer` and `type="module"` wait for the page to be built before your script runs.

## 🧪 Try it yourself

1. Change `hello.js` so it prints the name of **your** stand (invent one!). Run it in Node and in the browser.
2. In the browser Console, type `typeof require`. Then do the same in Node (`node -e "console.log(typeof require)"`). What is different? (Hint: `require` is a Node-only helper. Step 9 shows the modern way.)
3. **Predict first, then run.** What does this print? Write your guess on paper.
   ```js
   setTimeout(() => console.log('A'), 0);
   console.log('B');
   ```
   Even with a delay of **0** milliseconds, which comes first? (Answer in Step 13: the bell can only ring after the cook finishes the current job.)

## ⚠️ Mistakes everyone makes

| Mistake | What you see | Fix |
|---------|--------------|-----|
| Running `node hello.js` from the wrong folder | `Error: Cannot find module '.../hello.js'` | `cd` into `lemonade-stand` first |
| Using `document` or `window` in a Node file | `ReferenceError: document is not defined` | That code is for the browser only |
| Forgetting `defer` | `null` instead of your element | Add `defer` to the `<script>` |
| Editing but not saving | Old output appears | Save the file (Ctrl+S) |

## ✅ Checkpoint

- [ ] `node hello.js` prints two lines ending in `Node.js`
- [ ] `index.html` shows the same two lines in the browser Console, ending in `the browser`
- [ ] I can say what an **engine** is and what a **runtime** is
- [ ] I know `window` and `document` are browser-only, and `process` is Node-only
- [ ] I can explain why "3. Ding!" printed last in Experiment A
- [ ] I know why long work freezes a page

**Files in your project now:** `hello.js`, `index.html`, `playground.js`

**Next:** [Step 2: Variables & scope](02-variables-and-scope.md)
