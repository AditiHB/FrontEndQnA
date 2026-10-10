# Step 0: Get Ready - Open Your Toy Box

> **Like I'm 5:** Before we build a sandcastle, we need a bucket, a spade, and a flat spot on the beach. This step collects the bucket and the spade. We do not write any real JavaScript yet.

| | |
|---|---|
| **Time** | About 20 minutes |
| **You will learn** | How to install the tools, open a terminal, make a project folder, and read an error message |
| **Concept lessons used** | None yet. This is the warm-up. |
| **Next** | [Step 1: How JavaScript runs](01-how-javascript-runs.md) |

---

## 1. What are we going to build?

We are going to build a **Lemonade Stand**. 🍋

It starts as a tiny program that adds up how much money you made. From Step 16 it is a real web page where customers pick drinks, add them to a cart, place an order, and watch the kitchen make it. By Step 22 it also has tests, a code checker, and a build step, just like a real project at a real company.

```text
┌──────────────────────────────────────────────────────────┐
│  🍋 Sunny Lemonade Stand                      Table 5    │
├───────────────────────────────────┬──────────────────────┤
│  MENU                             │  YOUR CART           │
│  🍋 Lemonade        ₹40.00 [Add]  │  🍋 Lemonade  - 2 +  │
│  🥭 Mango Juice     ₹60.00 [Add]  │  🍪 Cookie    - 1 +  │
│  🧊 Iced Tea        ₹50.00 [Add]  │                      │
│  🍪 Choc Cookie     ₹25.00 [Add]  │  Total: ₹105.00      │
│  🥪 Cheese Sandwich ₹80.00 [Add]  │  [ Place order ]     │
├───────────────────────────────────┴──────────────────────┤
│  KITCHEN BOARD                                           │
│  ✔ 🍋 Lemonade x2 is ready                               │
│  ⏳ 🍪 Choc Cookie x1 ... ready in 3, 2, 1               │
└──────────────────────────────────────────────────────────┘
```

Every step teaches **one idea** from the [concepts folder](../concepts/README.md) and then uses it to add one piece to the stand. There are 22 ideas, so there are 22 lesson steps, one for each concept lesson (plus this warm-up and a graduation step at the end). The numbers match:

> **Step 5 teaches [Concept 5: Closures](../concepts/05-closures.md).**
> **Step 12 teaches [Concept 12: Promises & async/await](../concepts/12-promises-and-async-await.md).**

That is the whole rule. Easy to remember.

---

## 2. The three things you need

| Tool | What it is (like I'm 5) | What to get |
|------|-------------------------|-------------|
| **Node.js** | The kitchen where your JavaScript cooks when it is not inside a web page | Install the **LTS** version from [nodejs.org](https://nodejs.org). You need version **22 or newer**. |
| **A code editor** | A notebook made for writing code. It colours the words so they are easier to read. | [Visual Studio Code](https://code.visualstudio.com) (free) |
| **A web browser** | The place where web pages come alive | Chrome, Edge, or Firefox. We say "Chrome" in this tutorial. |

Node.js also installs **npm**, a shop that hands out ready-made code parts. We use it in Step 22.

---

## 3. The terminal: a chat window with your computer

The **terminal** is a window where you type a command and the computer answers. You will use it all the time. You only need five commands:

| Command | What it does | Like I'm 5 |
|---------|--------------|------------|
| `pwd` | Show which folder you are in | "Where am I?" |
| `ls` | List the files in this folder | "What is in this room?" |
| `cd folder-name` | Walk into a folder | "Go into that room" |
| `cd ..` | Walk back out | "Go back out the door" |
| `mkdir folder-name` | Make a new folder | "Build a new room" |

On Windows, open **PowerShell**. These commands work there too. (On Mac or Linux, open **Terminal**.)

### Check that Node.js is ready

▶️ **Run (skip):** `node --version`

```text
v22.12.0
```

Your number can be different. If it starts with `v22` or a bigger number, you are good. If you see "command not found", close the terminal, open a new one, and try again. If it is still missing, install Node.js again.

---

## 4. Make your project folder

Pick a place you can find again, like your Documents folder. Then:

▶️ **Run (skip):** `mkdir lemonade-stand`

▶️ **Run (skip):** `cd lemonade-stand`

Open the folder in your editor. With VS Code you can type:

▶️ **Run (skip):** `code .`

(The dot means "this folder".) You should see an empty folder in the editor. This is your **project folder**. Every file in this tutorial goes inside it.

> **Tip:** Keep your terminal open inside `lemonade-stand` for the whole tutorial. Run every command from there.

---

## 5. How this tutorial talks to you

You will see the same little signs in every step. Learn them once:

| Sign | What it means |
|------|---------------|
| 📄 **Create `file.js`** | Make a new file with this name and type in the code below it. |
| 📄 **Replace `file.js`** | Select everything in that file, delete it, and type in the code below. |
| 📄 **Add to the bottom of `file.js`** | Keep what is there. Add these lines at the very end. |
| ▶️ **Run:** | Type this command in the terminal and press Enter. |
| 👀 **You should see:** | This is what the computer should print. If yours is different, see "Getting unstuck" below. |
| 🧪 **Try it yourself** | A little challenge. Do not skip these. Your fingers learn faster than your eyes. |
| ✅ **Checkpoint** | A checklist. Tick every box before you move on. |

### Two kinds of files

1. **`playground.js` is your scribble pad.** In most steps we play with the new idea here first. We replace it again and again, and it never becomes part of the stand.
2. **Every other file is part of the stand.** We build it a little at a time.

Type the code instead of copy-pasting it, at least for the first few steps. Typing is slow on purpose. Your brain notices every word.

---

## 6. How to read an error (it is a helpful note, not a scolding)

Sooner or later your code will break. That is normal. Programmers break code all day. An **error message** is the computer telling you exactly where it got confused.

Imagine a file called `oops.js` with these two lines:

```js
console.log('Hello');
console.log(lemons);
```

Running it prints this:

```text
Hello
/home/you/lemonade-stand/oops.js:2
console.log(lemons);
            ^

ReferenceError: lemons is not defined
    at Object.<anonymous> (/home/you/lemonade-stand/oops.js:2:13)
    ... (more lines about Node's insides)

Node.js v22.12.0
```

Read it from the top like a treasure map:

| Part | What it tells you |
|------|-------------------|
| `Hello` | Line 1 worked fine. It ran before the crash. |
| `oops.js:2` | The problem is in file `oops.js`, **line 2**. |
| The code line with `^` | The little arrow points at the exact spot. |
| `ReferenceError: lemons is not defined` | **The important sentence.** The kind of problem, then a plain-English reason. We asked for `lemons`, but nobody ever made one. |
| The `at ...` lines | The trail of footprints. The first one is usually the one you care about. Ignore the ones about `node:internal`. |

**Three questions to ask every time:**
1. Which file and which line? (Look for `file.js:LINE`.)
2. What is the sentence after the error name?
3. Did I spell it exactly right? (Capital letters matter! `Lemons` and `lemons` are different words.)

---

## 7. Getting unstuck

If your output does not match the tutorial:

1. **Did you save the file?** (Most common problem! Look for a dot or circle on the editor tab.)
2. **Are you in the right folder?** Type `pwd` and check it ends in `lemonade-stand`.
3. **Did you copy every line?** One missing bracket `}` or quote `'` breaks everything.
4. **Read the error message** using the treasure map above.
5. **Compare with the finished project.** This repository has the complete, working Lemonade Stand in [`finished-project/`](finished-project/). Open the matching file side by side with yours.

---

## ✅ Checkpoint

- [ ] `node --version` shows `v22` or higher
- [ ] I have a code editor
- [ ] I made a folder called `lemonade-stand` and opened it in the editor
- [ ] I know what 📄, ▶️, 👀, 🧪, and ✅ mean
- [ ] I know how to read an error: file, line, and the sentence after the error name

Ready? Let's go.

**Next:** [Step 1: How JavaScript runs](01-how-javascript-runs.md)
