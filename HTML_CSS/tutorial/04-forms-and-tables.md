# Lesson 4: Forms and Tables

> **Like I'm 5:** A **table** is a timetable on the wall: rows and columns of facts. A **form** is a paper order slip with boxes to fill in and a button that says "send".

| | |
|---|---|
| **You will learn** | Tables for data (`table`, `caption`, `th`, `td`, `scope`), and forms (`form`, `label`, `input` types, `select`, `textarea`, `radio`, `checkbox`, `button`, `fieldset`, built-in validation) |
| **You will build** | The opening-hours table, a table of box sizes, and the order form |
| **Time** | About 60 minutes |

## The story

Bunny's opening hours are a list of times, which is really a small table. And she wants customers to order boxes of treats from the page. Both are classics: **tables** show data, **forms** collect data.

## 1. Tables: for data, never for layout

A table is for information that has rows *and* columns, like a timetable. (In the old days people used tables to position things on the page. Don't: Lessons 10 and 11 show how to do layout properly.)

```text
<table>                        the whole table
  <caption>                    its title
  <thead> … </thead>           the header rows
  <tbody> … </tbody>           the body rows
    <tr>                       one row
      <th scope="row">         a header cell (describes its row or column)
      <td>                     a data cell
```

| Element | Meaning |
|---------|---------|
| `<table>` | The table |
| `<caption>` | A title for the table, read first by screen readers |
| `<thead>`, `<tbody>`, `<tfoot>` | Groups of rows: header, body, footer |
| `<tr>` | **T**able **r**ow |
| `<th>` | **T**able **h**eader cell: bold and centred by default |
| `<td>` | **T**able **d**ata cell |
| `scope="col"` or `scope="row"` | Says whether a `<th>` describes its column or its row. Screen readers use it to read "Saturday, opens, 8:00" |
| `colspan` / `rowspan` | A cell that spans several columns or rows |

### The opening hours

Replace the list of opening hours with a table:

📄 **`index.html`** (edit these lines)

```diff
         <h3>Opening hours</h3>
-        <ul>
-          <li>Monday to Friday: 7:00 to 18:00</li>
-          <li>Saturday: 8:00 to 16:00</li>
-          <li>Sunday: 8:00 to 13:00</li>
-        </ul>
+        <table>
+          <caption>Our weekly opening times</caption>
+          <thead>
+            <tr>
+              <th scope="col">Day</th>
+              <th scope="col">Opens</th>
+              <th scope="col">Closes</th>
+            </tr>
+          </thead>
+          <tbody>
+            <tr>
+              <th scope="row">Monday to Friday</th>
+              <td>7:00</td>
+              <td>18:00</td>
+            </tr>
+            <tr>
+              <th scope="row">Saturday</th>
+              <td>8:00</td>
+              <td>16:00</td>
+            </tr>
+            <tr>
+              <th scope="row">Sunday</th>
+              <td>8:00</td>
+              <td>13:00</td>
+            </tr>
+          </tbody>
+        </table>
         <h3>Find us</h3>
```

Refresh. The browser shows rows and columns, with the header cells in bold. There are no borders yet: that is CSS (Lesson 9).

## 2. Forms: how people send things to you

A form is a group of **controls** (boxes, buttons, menus) wrapped in a `<form>` element. When the visitor presses the submit button, the browser sends the values to an address. In a real shop that address belongs to a server, which is a different course. Here we only need the HTML part: **if you can build the form, a developer (or a form service) can connect it later.**

```html
<form method="get">
  <label for="name">Your name</label>
  <input id="name" name="name" type="text">
  <button type="submit">Send</button>
</form>
```

The most important trio:

| Piece | What it does |
|-------|--------------|
| `<label for="name">` | The **visible text** that names a control. `for` must match the control's `id` |
| `id="name"` | A unique name on the page, so the label can find the control |
| `name="name"` | The **key** that is sent with the value. No `name`, nothing is sent |

**Always use a `<label>`.** Clicking a label puts the cursor in its box (a bigger target for fingers), and a screen reader reads the label when the control gets focus. A `placeholder` is *not* a label: it vanishes when you type and is often too pale to read.

### Types of `<input>`

One element, many looks, chosen by `type`:

| `type` | Used for | Bonus |
|--------|----------|-------|
| `text` | Short free text | (the default) |
| `email` | Email address | Checks for an `@`; phones show an `@` keyboard |
| `tel` | Phone number | Phones show a number pad |
| `number` | A number | `min`, `max`, `step` |
| `date` | A date | A date picker |
| `checkbox` | Yes/no, or many choices | `checked` |
| `radio` | Pick **one** of several | Same `name` groups them |
| `password` | Hidden text | Dots instead of letters |
| `search`, `url`, `time`, `color`, `range`, `file`, `hidden` | Other jobs | |

Other controls:

| Element | Used for |
|---------|----------|
| `<select>` + `<option>` | A drop-down list |
| `<textarea>` | Several lines of text |
| `<button type="submit">` | Sends the form. (`type="button"` does nothing by itself; `type="reset"` clears it) |
| `<fieldset>` + `<legend>` | Groups related controls with a title: great for radio buttons |

### Built-in validation (free!)

Attributes like `required`, `min`, `max`, `minlength`, `maxlength` and `pattern` make the browser check the input *before* sending, and show a message. No JavaScript.

### Helping people fill the form faster

`autocomplete="name"`, `autocomplete="email"`, `autocomplete="tel"`… let browsers fill in the person's details. It's a big help on phones.

## 3. A table of box sizes

Before the form, give customers the facts they need to choose. A box has a size, a number of treats, a recommended occasion and a price: that is table data. Put the table and the form inside the "Order a box" section. Replace the placeholder comment:

📄 **`index.html`** (edit these lines)

```diff
         <p>Choose your treats and tell us when you will come by. We will have your box ready.</p>
-        <!-- The order form arrives in Lesson 4 -->
+
+        <table>
+          <caption>Our boxes</caption>
+          <thead>
+            <tr>
+              <th scope="col">Box</th>
+              <th scope="col">Treats</th>
+              <th scope="col">Great for</th>
+              <th scope="col">Price</th>
+            </tr>
+          </thead>
+          <tbody>
+            <tr>
+              <th scope="row">Small box</th>
+              <td>4</td>
+              <td>Breakfast for two</td>
+              <td>$14</td>
+            </tr>
+            <tr>
+              <th scope="row">Large box</th>
+              <td>8</td>
+              <td>A family treat</td>
+              <td>$26</td>
+            </tr>
+            <tr>
+              <th scope="row">Party box</th>
+              <td>16</td>
+              <td>Birthdays and office parties</td>
+              <td>$48</td>
+            </tr>
+          </tbody>
+        </table>
+
+        <!-- The order form -->
       </section>
```

## 4. The order form

Now the form itself. Replace the `<!-- The order form -->` comment with it. Read the code first: it is long, but every part is something you have just met.

📄 **`index.html`** (edit these lines)

```diff
-        <!-- The order form -->
+        <form method="get">
+          <fieldset>
+            <legend>About you</legend>
+            <div>
+              <label for="name">Your name</label>
+              <input id="name" name="name" type="text" autocomplete="name" required>
+            </div>
+            <div>
+              <label for="email">Email</label>
+              <input id="email" name="email" type="email" autocomplete="email" required>
+            </div>
+            <div>
+              <label for="phone">Phone (optional)</label>
+              <input id="phone" name="phone" type="tel" autocomplete="tel">
+            </div>
+          </fieldset>
+
+          <fieldset>
+            <legend>Your box</legend>
+            <fieldset>
+              <legend>Size</legend>
+              <div>
+                <input id="size-small" name="size" type="radio" value="small">
+                <label for="size-small">Small box (4 treats)</label>
+              </div>
+              <div>
+                <input id="size-large" name="size" type="radio" value="large" checked>
+                <label for="size-large">Large box (8 treats)</label>
+              </div>
+              <div>
+                <input id="size-party" name="size" type="radio" value="party">
+                <label for="size-party">Party box (16 treats)</label>
+              </div>
+            </fieldset>
+            <div>
+              <label for="favourite">Favourite treat</label>
+              <select id="favourite" name="favourite">
+                <option value="sourdough">Sourdough loaf</option>
+                <option value="croissant">Butter croissant</option>
+                <option value="cupcake" selected>Carrot cupcake</option>
+                <option value="cookie">Oat and raisin cookie</option>
+                <option value="bun">Cinnamon bun</option>
+                <option value="tart">Strawberry tart</option>
+              </select>
+            </div>
+            <div>
+              <label for="boxes">How many boxes?</label>
+              <input id="boxes" name="boxes" type="number" min="1" max="10" value="1" required>
+            </div>
+            <div>
+              <label for="pickup">Pick-up day</label>
+              <input id="pickup" name="pickup" type="date" required>
+            </div>
+            <div>
+              <label for="notes">Anything we should know? (allergies, a birthday&hellip;)</label>
+              <textarea id="notes" name="notes" rows="4"></textarea>
+            </div>
+            <div>
+              <input id="sms" name="sms" type="checkbox" value="yes">
+              <label for="sms">Text me when my box is ready</label>
+            </div>
+          </fieldset>
+
+          <button type="submit">Send my order</button>
+        </form>
```

Save and refresh. A plain, working form! Try it:

1. Press **Send my order** with everything empty. The browser stops you and points at the first missing field ("Please fill out this field"). That is the `required` attribute at work.
2. Type `bunny` in the email box and send. The browser says the address needs an `@`: that is `type="email"`.
3. Click on the words **"Your name"**. The cursor jumps into the box: that is `<label for>`.
4. Click the radio labels. Only one can be selected at a time, because they share the same `name="size"`.
5. Fill everything in and send. Look at the **address bar**: it changed to something like
   `index.html?name=Bunny&email=bunny%40example.com&phone=&size=large&favourite=cupcake&boxes=1&pickup=2026-12-24&notes=&sms=yes`
   That is **exactly what a server would receive**: each `name` and its value, joined with `&`. You are seeing `method="get"` at work.

## 5. What just happened?

```text
  you fill in ──►  press Send  ──►  browser checks required / type / min / max
                                           │
                       a problem? ◄────────┤────────► no problem
                       show a message                      │
                       (stop here)                         ▼
                                       build  name=value&name=value…
                                       send it to the form's action
                                       (no action here: the same page)
```

- `method="get"` puts the data in the address. `method="post"` puts it in the body of the request (used for anything private or that changes something, like orders and logins). There is no server in this course, so `get` lets us see the result.
- Only the **checked** radio button and checkboxes, and every control with a `name`, are sent.
- A group of radio buttons shares one `name`. Their `value`s are the different answers.
- `<fieldset>` and `<legend>` group the controls, and a screen reader says "Size, group" before each radio. For radio buttons this matters a lot, because otherwise "Small box" has no question attached to it.

## 6. Tables: good habits

- Use a **`<caption>`**. Use `<th scope>` for every header cell.
- **Don't use tables for layout.** Don't merge cells unless you must.
- Tables are wide by nature: on phones they may overflow. We solve it in Lesson 14.

## 🧪 Try it yourself

1. Remove `required` from the name field and submit. Then restore it.
2. Change `type="email"` to `type="text"` and type nonsense. What did the browser stop doing?
3. Add `placeholder="e.g. Bunny"` to the name input, and look at it. Why is that *not* a replacement for the label?
4. Give the number input `step="2"`. What numbers does it now allow?
5. Add `minlength="3"` to the name input. Try a two-letter name.
6. Remove `for` and `id` from one label. Does clicking the text still focus the box?
7. Change `method="get"` to `method="post"` and submit. Where did the data go? (The address bar no longer shows it. Many browsers show an error because there is no server.) Change it back.
8. Add a `colspan` to a table: make a last row of the opening-hours table with one cell that spans three columns and says "Closed on public holidays".
9. Use only the keyboard to fill and send the whole form: Tab between fields, arrow keys inside the radio group, Space to tick the checkbox, Enter to send.

## ✅ Check yourself

<details>
<summary>1. What does the <code>for</code> attribute of a label connect to?</summary>

The `id` of the control it describes. Clicking the label then focuses or toggles that control, and screen readers read it.
</details>

<details>
<summary>2. Why do radio buttons in one group share the same <code>name</code>?</summary>

The shared `name` makes them one group, so only one can be chosen, and the chosen button's `value` is what gets sent under that name.
</details>

<details>
<summary>3. Is <code>placeholder</code> a good replacement for <code>&lt;label&gt;</code>?</summary>

No. It disappears as soon as you type, is often low-contrast, and is not reliably read as a label. Use a label, and a placeholder only for an *example*.
</details>

<details>
<summary>4. Why would a form control send no data at all?</summary>

It has no `name` attribute (or it's disabled, or an unchecked checkbox/radio).
</details>

<details>
<summary>5. When is a table the right element?</summary>

When you have data with rows and columns that belong together (timetables, prices, comparisons). Never for page layout.
</details>

## Recap

- Tables: `table`, `caption`, `thead`, `tbody`, `tr`, `th scope`, `td`. For data, not for layout.
- Forms: `form` with `method`; each control has a `name` (what is sent), a `label` tied by `for`/`id` (what people read) and often validation (`required`, `min`, `max`, `type`).
- Pick the right `type` (`email`, `tel`, `number`, `date`…) for free checks, better keyboards and pickers.
- `fieldset` and `legend` group related controls, especially radio buttons.
- Your HTML is complete. From now on the page is only getting **prettier**.

➡️ **Next:** [Lesson 5 – Hello, CSS](05-hello-css.md)
