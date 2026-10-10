# 1. React Fundamentals

### Q1. What is React, and what problem does it solve? `Core`

> **Like I'm 5:** React is a LEGO kit for web pages. You build with small bricks, and when one brick changes, only that brick is redrawn.

**Answer:** React is a library for building user interfaces from components. You describe what the UI should look like for a given state, and React updates the DOM efficiently when the state changes. It doesn't include routing or data fetching by default.

---

### Q2. What is the Virtual DOM, and does React need it? `Core`

> **Like I'm 5:** Before repainting a wall, you draw the change on a tracing paper first, compare it with the old drawing, and only repaint the spots that differ.

**Answer:** The Virtual DOM is a lightweight tree of React elements. On each render, React compares the new tree with the previous one (reconciliation) and applies the minimal DOM changes. Other frameworks skip the virtual tree, but the goal is the same: predictable, efficient updates.

---

### Q3. What is JSX? Is it required? `Core`

> **Like I'm 5:** JSX is a sketch that looks like HTML but sits inside JavaScript. It's not required, but it's the easiest way to draw.

**Answer:** JSX is syntax that compiles to function calls. It's not required, since you can call `createElement` directly, but nearly every React project uses it. JSX prevents injection by escaping values by default.

---

### Q4. What are props, and why are they read-only? `Core`

> **Like I'm 5:** Props are toys handed to you by a friend. You can play with them, but you can't repaint the friend's toy.

**Answer:** Props are the inputs to a component. React treats them as immutable so a child can't change the parent's data. Children communicate upward by calling callback props.

---

### Q5. What is "lifting state up"? `Core`

> **Like I'm 5:** Two kids want to share one crayon. The teacher keeps the crayon on her desk and hands it to whichever kid is drawing.

**Answer:** When sibling components need the same state, move the state to their closest common parent and pass it down with props and callbacks.

---

### Q6. Why do keys matter in lists? `Core`

> **Like I'm 5:** Name tags help the teacher know which child is which when they line up again.

**Answer:** Keys let React match list items between renders. Stable keys preserve state and DOM for each item. Using the index as the key breaks state when items are reordered or removed.

---

### Q7. What is the difference between a controlled and an uncontrolled component? `Core`

> **Like I'm 5:** A controlled input is a puppet on strings held by React. An uncontrolled input remembers its own text in the DOM.

**Answer:** A controlled component gets its value from React state and reports changes through `onChange`. An uncontrolled component keeps its value in the DOM, and you read it with a ref or `FormData`.

---

### Q8. What is the difference between a component and an element? `Advanced`

> **Like I'm 5:** A component is the cookie cutter. An element is one description of a cookie that React is about to bake.

**Answer:** A component is a function or class that returns UI. An element is a plain object describing what to render, created when you write JSX such as `<Button />`.

---

### Q9. Why must component names start with a capital letter? `Core`

> **Like I'm 5:** Lowercase tags are words in the old book, like `div`. Capital tags are your own new characters.

**Answer:** JSX treats lowercase names as built-in DOM elements (`<div>`) and capitalized names as component references (`<Button />`).

---

### Q10. What is `StrictMode`, and why does React run effects twice in development? `Advanced`

> **Like I'm 5:** A safety drill. The fire alarm rings twice so you can check that the exit door works both times.

**Answer:** `StrictMode` helps find unsafe code. In development, React mounts, unmounts, and remounts components to check that effects clean up properly. Production builds don't do this.

---

### Q11. How does React decide when to re-render? `Advanced`

> **Like I'm 5:** A teacher redraws the board only when someone writes a new word on it, or when a new student walks in with a new message.

**Answer:** A component re-renders when its state changes, its parent re-renders with new props, or a context it reads changes. Re-rendering a component doesn't necessarily change the DOM. React compares the result before updating.

---

### Q12. What are the rules of hooks? `Core`

> **Like I'm 5:** Hooks are like a shopping list. You must check off items in the same order every time, or the store clerk gets confused.

**Answer:** Call hooks only at the top level of a component or custom hook, and only from React functions. React relies on the order of hook calls to keep state connected to the right hook.
