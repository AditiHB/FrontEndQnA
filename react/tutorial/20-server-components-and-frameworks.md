# Lesson 20: Server Components and Frameworks – A Trip to the Real Kitchen

> **Like I'm 5:** A normal React app cooks the meal in the browser, after the recipe arrives. With server components, the kitchen (server) cooks the parts that don't need the browser, and only the finished food is sent. The browser then adds the interactive sprinkles.

| | |
|---|---|
| **Concept reference** | [20 – Server Components & frameworks](../concepts/20-server-components-and-frameworks.md) |
| **You will learn** | CSR, SSR, SSG and Server Components, what a framework adds to React, Server vs Client Components and `'use client'`, Server Actions, hydration and why it can go wrong, and how to choose a framework |
| **We build** | A small **Next.js** version of the toy shop where the toy list is cooked on the server and only the buttons run in the browser |
| **Time** | About 75 minutes |

> **A different kind of lesson.** Our Vite shop is a *single-page app*: it can't run Server Components, because it has no server. So in this lesson we take a short trip: we create a **second, tiny project** next to the first one, using the most popular React framework, Next.js. Nothing in `toy-shop` changes. After this lesson you go back to it for testing and deployment (Lessons 21 to 23).

## The story

Open the toy shop and "View page source". You'll see an almost empty page: `<div id="root"></div>` and a script. The toys are only drawn **after** the browser downloads, parses and runs all the JavaScript. On a slow phone that means a blank screen for a while, and a search engine robot may see nothing at all.

What if the **server** drew the toy list and sent finished HTML? The first paint is instant, and the browser needs JavaScript only for the parts that are interactive (the buttons). That is what frameworks like Next.js make easy.

## 1. Four ways to draw a page

| Strategy | Where HTML is built | When | Good for |
|----------|---------------------|------|----------|
| **Client-side rendering (CSR)** | In the browser | Every visit | Dashboards, apps behind a login (our Vite shop) |
| **Server-side rendering (SSR)** | On the server | **Every request** | SEO and a fast first paint, with fresh data |
| **Static generation (SSG)** | On the server | **At build time** (once) | Blogs, docs, marketing pages |
| **Server Components (RSC)** | On the server, and **no JavaScript is sent for that component** | Per request or at build | Data-heavy pages with less browser code |

The restaurant picture:

- **CSR**: we send you the ingredients and a recipe; you cook at your table.
- **SSR**: the kitchen cooks your meal when you order.
- **SSG**: the meal was cooked in the morning and is waiting in a warming drawer.
- **Server Components**: the kitchen cooks everything it can; the only thing delivered to your table that needs *you* is the sauce bottle (a button) you have to squeeze yourself.

## 2. What a framework adds

React draws the screen. A **framework** puts a whole house around it:

- **Routing** (files and folders become URLs),
- **Server rendering**, Server Components and Server Actions,
- **Data loading** and caching,
- Image/font optimization, bundling and deployment targets.

Popular choices: **Next.js** (App Router), **React Router in framework mode** (loaders and actions), **Astro** (mostly static content, with React islands), or a plain **Vite SPA** like our shop.

## 3. Create the second project

Open a terminal in the folder that **contains** `toy-shop` (go one level up from it), and create a Next.js project next to it. The flags answer all the setup questions for us: TypeScript yes, App Router yes, Tailwind no, ESLint no, no `src/` folder, default import alias.

```bash
cd ..
npx create-next-app@latest toy-shop-next --ts --app --no-tailwind --no-eslint --no-src-dir --import-alias "@/*" --use-npm --yes
cd toy-shop-next
```

You now have two sibling folders: `toy-shop/` (Vite) and `toy-shop-next/` (Next.js).

> The project generator changes with every Next.js version and may add extra files (like `AGENTS.md`). Ignore anything we don't mention.

Take a look inside `toy-shop-next/app/`. In the **App Router**, folders and files inside `app/` *are* the routes:

| File | Meaning |
|------|---------|
| `app/layout.tsx` | The frame around every page (like our `RootLayout`) |
| `app/page.tsx` | The page for `/` |
| `app/about/page.tsx` | (would be) the page for `/about` |

Let's clean up and bring in our toys. The JSON catalogue is copied from the Vite project, and `server-only` is a tiny package that makes the build **fail** if client code ever imports a server-only file:

```bash
npm install server-only
mkdir -p data lib components
cp ../toy-shop/public/toys.json data/toys.json
rm app/page.module.css
```

## 4. Server Components (the default!)

In the App Router, **every component is a Server Component unless you say otherwise**. A Server Component:

- runs **only on the server** (at build time or per request),
- can read files, databases and secrets directly,
- sends **no JavaScript** to the browser for its own code,
- **cannot** use state, effects, event handlers or browser APIs,
- can *render* Client Components.

### Reading data on the server

📄 **`lib/toys.ts`** (new file)

```ts
import 'server-only'; // the build fails if a Client Component imports this file
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export interface Toy {
  id: string;
  name: string;
  price: number;
  emoji: string;
  category: string;
  inStock: boolean;
  description: string;
}

export async function getToys(): Promise<Toy[]> {
  'use cache'; // see the box below
  const file = path.join(process.cwd(), 'data', 'toys.json');
  const text = await readFile(file, 'utf8');
  return JSON.parse(text) as Toy[];
}
```

Look at how normal this is. It's plain Node code that reads a file, which would be impossible in the browser. In a real shop this would be a database query.

> **About `'use cache'`.** The newest Next.js versions prepare pages *ahead of time* by default. If a page reads data that Next.js doesn't know is stable, the build stops with an error like *"Next.js encountered uncached or runtime data during prerendering"* and lists the fixes. Marking the data function with `'use cache'` says "this result may be reused", so the page can be prepared ahead of time. This is also what the lesson means by "defaults have changed between versions": always read the docs for **your** version, and read the error messages: they are good.

### A server component draws the card

📄 **`components/ToyCard.tsx`** (new file)

```tsx
import type { Toy } from '@/lib/toys';
import { AddToCartButton } from './AddToCartButton';

// No 'use client' → a Server Component. No JavaScript for this file goes to the browser.
export function ToyCard({ toy }: { toy: Toy }) {
  return (
    <article className="card">
      <div className="emoji" aria-hidden="true">
        {toy.emoji}
      </div>
      <h3>{toy.name}</h3>
      <p>${toy.price.toFixed(2)}</p>
      <AddToCartButton name={toy.name} />
    </article>
  );
}
```

### A client component for the part that must be interactive

A button that counts clicks needs **state** and an **event handler**, which only exist in the browser. A file that starts with `'use client'` marks the **boundary**: that file and everything it imports run in the browser.

📄 **`components/AddToCartButton.tsx`** (new file)

```tsx
'use client'; // from here on, this runs in the browser (and is also pre-drawn on the server)

import { useState } from 'react';

export function AddToCartButton({ name }: { name: string }) {
  const [added, setAdded] = useState(0);

  return (
    <button type="button" onClick={() => setAdded(n => n + 1)} aria-label={`Add ${name} to cart`}>
      {added === 0 ? 'Add to cart' : `In cart: ${added}`}
    </button>
  );
}
```

### The page: an `async` component

Because a Server Component runs on the server, it can simply be `async` and `await` data, with no `useEffect`, no `useState`, no loading flags:

📄 **`app/page.tsx`** (replace everything)

```tsx
import { ToyCard } from '@/components/ToyCard';
import { getToys } from '@/lib/toys';

export default async function HomePage() {
  const toys = await getToys(); // runs on the server

  return (
    <main>
      <h1>🧸 Tiny Toy Shop (Next.js)</h1>
      <ul className="grid">
        {toys.map(toy => (
          <li key={toy.id}>
            <ToyCard toy={toy} />
          </li>
        ))}
      </ul>
    </main>
  );
}
```

And the frame and some basic styles:

📄 **`app/layout.tsx`** (replace everything)

```tsx
import type { Metadata } from 'next';
import './globals.css';

// Next.js turns this into the <title> and <meta> tags on the server.
export const metadata: Metadata = {
  title: 'Tiny Toy Shop (Next.js)',
  description: 'The toy shop, served by Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

📄 **`app/globals.css`** (replace everything)

```css
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  background: #fffaf0;
  color: #2d2a32;
}

main {
  max-width: 960px;
  margin: 0 auto;
  padding: 1rem;
}

.grid {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.card {
  background: white;
  border: 1px solid #eadfce;
  border-radius: 14px;
  padding: 1rem;
  text-align: center;
}

.emoji {
  font-size: 3rem;
}
```

## 5. Server Actions: a function that runs on the server

A **Server Action** is a function marked `'use server'`. You can pass it to a form (Lesson 19), and when the visitor submits, the browser calls it **over the network**, but the code runs on the server. You get form handling without writing an API endpoint.

📄 **`app/actions.ts`** (new file)

```ts
'use server';

export interface SubscribeState {
  message: string;
}

// Runs ON THE SERVER, even though the browser triggers it from a form.
export async function subscribe(
  _previous: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const email = String(formData.get('email') ?? '').trim();

  // Always validate on the server. Anybody can call this action, not only our form.
  if (!email.includes('@')) {
    return { message: 'Please type a real email address.' };
  }

  // A real shop would save the email in a database here.
  return { message: `Thank you! We will write to ${email}.` };
}
```

The form itself is interactive (it shows "Sending…"), so it's a Client Component that uses `useActionState` from Lesson 19:

📄 **`components/SubscribeForm.tsx`** (new file)

```tsx
'use client';

import { useActionState } from 'react';
import { subscribe } from '@/app/actions';

export function SubscribeForm() {
  const [state, formAction, isPending] = useActionState(subscribe, { message: '' });

  return (
    <form action={formAction}>
      <h2>Toy news</h2>
      <label htmlFor="email">Your email </label>
      <input id="email" name="email" type="email" required />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Sending…' : 'Subscribe'}
      </button>
      {state.message && <p role="status">{state.message}</p>}
    </form>
  );
}
```

Add it to the page, under the toy list:

📄 **`app/page.tsx`** (edit these lines)

```diff
+import { SubscribeForm } from '@/components/SubscribeForm';
 import { ToyCard } from '@/components/ToyCard';
@@
       </ul>
+      <SubscribeForm />
     </main>
```

## 6. Run it

```bash
npm run dev
```

Open `http://localhost:3000`. It looks just like a shop. Now the interesting experiments:

1. **View page source** (right-click → *View Page Source*, not the Elements tab). The toy names are right there in the HTML! The server already drew them. In the Vite shop the same view was empty.
2. Click **Add to cart** on a card a few times: "In cart: 3". The client component *hydrated* and works.
3. Try the email form with a valid email.
4. Open the **Network** tab, reload, and look at the JavaScript files. The code of `ToyCard`, `getToys` and the page isn't in there: only React, Next.js and the two Client Components.

Finally make a production build and run it, like the real thing:

```bash
npm run build
npm run start
```

The build prints a table of routes with `○ (Static)`: the page was prepared ahead of time, at build, like a meal in the warming drawer.

## 7. Hydration: when the sprinkles stick

**Hydration** is the step where the browser takes the HTML the server sent and React **attaches** to it, adding event handlers so buttons start working. For this to work, what the browser draws first must be **the same** as what the server sent. If they differ, React reports a **hydration mismatch** and has to throw away the server's HTML and redraw it.

The typical causes:

- `Date.now()`, `new Date()` or `Math.random()` used while drawing (server and browser get different values),
- checking `window` or `localStorage` while drawing (`typeof window !== 'undefined' ? … : …`),
- invalid HTML nesting (a `<div>` inside a `<p>`),
- browser extensions that change the page before React sees it.

### Break it on purpose

Create a temporary client component:

```tsx
// components/WhereAmI.tsx
'use client';

export function WhereAmI() {
  return <p>I am running in the {typeof window === 'undefined' ? 'server' : 'browser'}.</p>;
}
```

Render it somewhere in `app/page.tsx`, and with `npm run dev` look at the browser console. React reports:

```text
Hydration failed because the server rendered text didn't match the client...
```

because the server wrote "server" and the browser's first draw said "browser".

### Fix it: wait until the browser has hydrated

Do the browser-only thing in an **effect**, which never runs on the server:

```tsx
'use client';

import { useEffect, useState } from 'react';

export function WhereAmI() {
  const [where, setWhere] = useState('server'); // same on server and in the first browser draw
  useEffect(() => setWhere('browser'), []);      // after hydration, update

  return <p>I am running in the {where}.</p>;
}
```

The newest Next.js even catches the `new Date()` mistake **while building** and tells you to move it into an effect or an event handler. Remove the experiment when you're done. (For rare, harmless differences like a timestamp, React lets you add `suppressHydrationWarning` to that single element. Use it sparingly.)

## 8. Rules for the server/client boundary

- **Keep client components small and push `'use client'` down the tree.** We made only the *button* a client component, not the whole card, and not the page. Everything else stays free of browser JavaScript.
- **Props that cross from server to client must be serializable**: strings, numbers, booleans, arrays, plain objects, dates. Functions and class instances can't be sent over the network. Try making `ToyCard` pass an `onAdd` function to `AddToCartButton` and the build stops with *"Event handlers cannot be passed to Client Component props."*
- **Server secrets stay on the server.** Because `lib/toys.ts` imports `server-only`, accidentally importing it into a client file makes the build fail instead of leaking.
- A Client Component can't `import` a Server Component (but it can *receive one as `children`*, the composition trick from Lesson 12).
- **Check the docs for your version.** Caching defaults (what is remembered, for how long) have changed more than once in Next.js. When something is stale or surprisingly fresh, caching is the first suspect.

## 9. How to choose a framework

| Question | Leans toward |
|----------|--------------|
| Does SEO or first-paint speed matter (a public shop, a blog)? | A framework with SSR/SSG (Next.js, React Router framework mode, Astro) |
| Is it an app behind a login with lots of interaction (dashboard)? | A Vite SPA is perfectly fine |
| Is the content mostly static with little interaction? | Astro or static generation |
| Do you want the server and browser code in one project? | Next.js or React Router framework mode |
| What does the team already know, and where will it be hosted? | The best framework is one your team can run |

Our Vite toy shop stays a SPA. A natural next step for a real product would be to move the public pages (shelves, toy pages) to a framework and keep the cart interactive on the client.

## 🧪 Try it yourself

1. **No-JS test.** In the browser dev tools, disable JavaScript and reload the Next.js shop. What still works? What doesn't? Do the same with the Vite shop.
2. **Remove `'use cache'`** from `getToys` and run `npm run build`. Read the error message to the end.
3. **Move the boundary.** Put `'use client'` at the top of `ToyCard.tsx`. Run `npm run build` and compare the JavaScript size with before. Why did it grow?
4. **Add a page.** Create `app/about/page.tsx` that returns a heading. Open `/about`. How many lines of routing code did you write?
5. **Try the function-prop mistake** from section 8 and read the error.
6. **Server-only import.** Import `getToys` from inside `AddToCartButton.tsx` and read the `server-only` build error.

## ✅ Check yourself

<details>
<summary>1. What is the difference between SSR and SSG?</summary>

SSR builds the HTML on the server for every request; SSG builds it once at build time and serves the same file to everyone.
</details>

<details>
<summary>2. What can a Server Component do that a Client Component can't, and the reverse?</summary>

A Server Component can read files, databases and secrets directly and sends no JavaScript for itself. A Client Component can use state, effects, event handlers and browser APIs.
</details>

<details>
<summary>3. What does <code>'use client'</code> do?</summary>

It marks the boundary where code starts running in the browser. That file and the modules it imports are included in the client bundle.
</details>

<details>
<summary>4. Why can't you pass a function from a Server Component to a Client Component?</summary>

Props are sent over the network as data, and functions can't be serialized. Use a Server Action (a function marked <code>'use server'</code>) if the client needs to trigger server code.
</details>

<details>
<summary>5. What is a hydration mismatch and how do you avoid it?</summary>

It happens when the first browser render differs from the HTML the server sent. Avoid random or time-based values and browser-only checks during rendering; do them in effects.
</details>

## Recap

- CSR draws in the browser, SSR on every request, SSG at build time; Server Components run only on the server and send no JavaScript for themselves.
- A framework (Next.js, React Router framework mode, Astro) adds routing, data loading, server rendering and deployment targets.
- In the App Router components are server components by default; `'use client'` marks the browser boundary. Keep client components small.
- Server Actions (`'use server'`) are functions the browser can call that run on the server. Always validate on the server.
- Hydration needs identical first output on server and browser; do browser-only things in effects.
- Choose a framework by SEO needs, data needs, team skills and hosting.

➡️ **Next:** [Lesson 21 – Testing: the vending machine](21-testing.md)  (back in the Vite `toy-shop` project)
