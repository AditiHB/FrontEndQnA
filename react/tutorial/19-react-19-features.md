# Lesson 19: React 19 Features – New Helpers in the Kitchen

> **Like I'm 5:** React 19 gave the kitchen some new helpers. Actions are a waiter who takes your order and tells the kitchen whether it's cooking. `use` is a way to unwrap a food box that's still being delivered. `useOptimistic` writes "on the way" on the menu before the food arrives.

| | |
|---|---|
| **Concept reference** | [19 – React 19 features](../concepts/19-react-19-features.md) |
| **You will learn** | Actions, `useActionState`, `useFormStatus`, `useOptimistic`, the `use` function for promises and context, `ref` as a prop (a reminder), document metadata (`<title>`, `<meta>`), and what was removed |
| **We build** | A checkout that sends the order and shows progress and errors, toy **reviews** that appear the moment you post them, and page titles written as plain JSX |
| **Time** | About 90 minutes |

## The story

Your customers are making orders (slow) and writing reviews (also slow, since they go to a server). Two annoyances:

- When you press **Place order**, nothing happens for a second, and you might press it twice.
- When you post a review, you stare at an empty box until the server answers.

React 19 added tools to make this kind of work simple: **Actions** and friends.

## 1. What is an Action?

An **Action** is a function (often `async`) that you give to a `<form action={…}>` or run inside a transition. React tracks it for you:

- whether it is **pending**,
- its **result** or **error**,
- and it **resets the form** when done.

You saw the simplest version already (Lessons 13 and 14: `action={placeOrder}` with `FormData`). Now we add the missing pieces: `useActionState` (result and pending), `useFormStatus` (pending for children of the form), and `useOptimistic` (show the result before the server confirms).

## 2. A pretend order desk (and an address that doesn't exist)

📄 **`src/api/ordersApi.ts`** (new file)

```ts
const FAKE_DELAY_MS = import.meta.env.MODE === 'test' ? 0 : 800;
const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export interface Order {
  name: string;
  address: string;
  itemCount: number;
}

// Pretend to send the order to a server. It refuses addresses in "nowhere".
export async function submitOrder(order: Order): Promise<void> {
  await delay(FAKE_DELAY_MS);
  if (order.address.toLowerCase().includes('nowhere')) {
    throw new Error('Sorry, we cannot deliver to "nowhere" 🗺️');
  }
}
```

## 3. `useActionState`: result + pending, in one hook

```tsx
const [state, formAction, isPending] = useActionState(action, initialState);
```

| Piece | Meaning |
|-------|---------|
| `action(previousState, formData)` | Your function. What it **returns** becomes the new `state` |
| `state` | The latest result (starts as `initialState`) |
| `formAction` | The thing to put in `<form action={formAction}>` |
| `isPending` | `true` while the action is running |

### `useFormStatus`: the form's pending flag for its children

A button deep inside a form can learn whether the **parent form** is submitting, without any props, by calling `useFormStatus()`. (It must be called in a component rendered *inside* the `<form>`, so it gets its own little brick.)

📄 **`src/components/SubmitButton.tsx`** (new file)

```tsx
import type { ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from './Button';

export function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus(); // is the parent <form> submitting right now?

  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Sending… ⏳' : children}
    </Button>
  );
}
```

### The new checkout

A gotcha first: after an action finishes, React **resets** the form's uncontrolled fields. That is great after success, but after an *error* the visitor would lose everything they typed. So the action returns the values it received, and the inputs use them as `defaultValue` (the value a reset goes back to).

📄 **`src/components/CheckoutForm.tsx`** (replace everything)

```tsx
import { useActionState } from 'react';
import { submitOrder } from '../api/ordersApi';
import { formatPrice } from '../lib/formatPrice';
import { selectCount, selectTotal, useCartStore } from '../store/cartStore';
import { Field } from './Field';
import { SubmitButton } from './SubmitButton';
import { TextInput } from './TextInput';

interface OrderFormState {
  error?: string;
  values: { name: string; address: string }; // what the visitor typed
}

const emptyState: OrderFormState = { values: { name: '', address: '' } };

export function CheckoutForm({ onPlaced }: { onPlaced: (name: string) => void }) {
  const count = useCartStore(selectCount);
  const total = useCartStore(selectTotal);

  // The Action: React calls it with the previous state and the form's data.
  async function placeOrder(
    _previous: OrderFormState,
    formData: FormData,
  ): Promise<OrderFormState> {
    const values = {
      name: String(formData.get('name') ?? ''),
      address: String(formData.get('address') ?? ''),
    };

    try {
      await submitOrder({ ...values, itemCount: count });
      onPlaced(values.name);
      return emptyState;
    } catch (error) {
      // Return the values too, so the fields keep what was typed.
      return { error: error instanceof Error ? error.message : 'Something went wrong', values };
    }
  }

  const [state, formAction, isPending] = useActionState(placeOrder, emptyState);

  return (
    <form action={formAction}>
      <p>
        You are buying {count} {count === 1 ? 'toy' : 'toys'} for{' '}
        <strong>{formatPrice(total)}</strong>.
      </p>

      {/* A disabled fieldset switches off all inputs inside while we send. */}
      <fieldset disabled={isPending} className="form-fieldset">
        <Field label="Your name">
          {a11y => (
            <TextInput
              {...a11y}
              name="name"
              required
              autoComplete="name"
              defaultValue={state.values.name}
            />
          )}
        </Field>

        <Field label="Delivery address">
          {a11y => (
            <TextInput
              {...a11y}
              name="address"
              required
              autoComplete="street-address"
              defaultValue={state.values.address}
            />
          )}
        </Field>

        <label className="form-check">
          <input type="checkbox" name="gift" />
          This is a gift 🎁
        </label>
      </fieldset>

      {state.error && (
        <p role="alert" className="field__error">
          {state.error}
        </p>
      )}

      <div className="form-actions">
        <SubmitButton>Place order</SubmitButton>
      </div>
    </form>
  );
}
```

📄 **`src/components/Form.css`** (add to the bottom)

```css
.form-fieldset {
  border: 0;
  margin: 0;
  padding: 0;
}
```

Try it. Fill the checkout on the cart page and press **Place order**. The button changes to "Sending… ⏳" and can't be pressed twice. Then try the address `Nowhere Street`: the error appears, **and your typed text is still in the boxes**.

## 4. `use`: unwrapping a promise during render

`use(promise)` reads the value of a promise **while rendering**. If the promise isn't done, the component *suspends* (Lesson 18), so the nearest `<Suspense>` shows its fallback; when it resolves, React draws again with the value. No `useEffect`, no `isLoading` state.

```tsx
function Comments({ promise }: { promise: Promise<Comment[]> }) {
  const comments = use(promise);          // waits here if not ready
  return <ul>{comments.map(c => <li key={c.id}>{c.text}</li>)}</ul>;
}
```

Two rules that matter:

1. **The promise must be stable.** If you create a new promise on every render (`use(fetchComments())`), React never sees the same one twice and loops forever. Create it **once** (in a parent that doesn't suspend, in state, in a cache, or in a framework/server component) and pass it down.
2. **`use` may be called conditionally** or in loops, unlike other hooks. It can also read context: `const theme = use(ThemeContext)`.

## 5. `useOptimistic`: show it before it's true

```tsx
const [shown, addOptimistic] = useOptimistic(realList, (current, draft) => [...current, draft]);
```

- `realList` is the **truth** (from the server).
- `addOptimistic(draft)` temporarily shows `realList + draft`. Call it inside an Action.
- When the action finishes, `shown` goes back to `realList` automatically. If the action succeeded and you updated `realList`, the real item replaces the draft. If it **failed**, the draft simply disappears: the rollback is built in.

### The reviews "server"

📄 **`src/api/reviewsApi.ts`** (new file)

```ts
const FAKE_DELAY_MS = import.meta.env.MODE === 'test' ? 0 : 700;
const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export interface Review {
  id: string;
  author: string;
  text: string;
  pending?: boolean; // true only for the optimistic draft
}

const starterReviews: Review[] = [
  { id: 'r-start', author: 'Maya', text: 'My little one carries it everywhere!' },
];
const reviewsByToy = new Map<string, Review[]>(); // the pretend database

export async function fetchReviews(toyId: string): Promise<Review[]> {
  await delay(FAKE_DELAY_MS);
  return [...(reviewsByToy.get(toyId) ?? starterReviews)];
}

export async function addReview(
  toyId: string,
  input: { author: string; text: string },
): Promise<Review> {
  await delay(FAKE_DELAY_MS);
  if (/spam/i.test(input.text)) {
    throw new Error('Our review robot thinks that looks like spam 🤖');
  }
  const review: Review = { id: `r-${crypto.randomUUID()}`, ...input };
  reviewsByToy.set(toyId, [...(reviewsByToy.get(toyId) ?? starterReviews), review]);
  return review;
}
```

### The reviews section

Read it from the top. It combines everything in this lesson: `use`, Suspense, an Action and `useOptimistic`.

📄 **`src/components/ToyReviews.tsx`** (new file)

```tsx
import { Suspense, use, useOptimistic, useState } from 'react';
import { addReview, fetchReviews, type Review } from '../api/reviewsApi';
import { SubmitButton } from './SubmitButton';
import './ToyReviews.css';

export function ToyReviews({ toyId }: { toyId: string }) {
  // Start loading ONCE. The parent gives this component a key={toy.id},
  // so a different toy means a fresh component and a fresh promise.
  const [reviewsPromise] = useState(() => fetchReviews(toyId));

  return (
    <section className="reviews">
      <h3>Reviews</h3>
      <Suspense fallback={<p>Loading reviews… ⏳</p>}>
        <ReviewsBody toyId={toyId} reviewsPromise={reviewsPromise} />
      </Suspense>
    </section>
  );
}

function ReviewsBody({
  toyId,
  reviewsPromise,
}: {
  toyId: string;
  reviewsPromise: Promise<Review[]>;
}) {
  const initialReviews = use(reviewsPromise); // waits here if the promise isn't done
  const [reviews, setReviews] = useState(initialReviews); // the truth
  const [error, setError] = useState<string | null>(null);

  // What we SHOW: the truth plus any draft that is still being saved.
  const [shownReviews, addOptimisticReview] = useOptimistic(
    reviews,
    (current: Review[], draft: Review) => [...current, draft],
  );

  async function postReview(formData: FormData) {
    const text = String(formData.get('text') ?? '').trim();
    if (!text) return;

    addOptimisticReview({ id: `draft-${crypto.randomUUID()}`, author: 'You', text, pending: true });

    try {
      const saved = await addReview(toyId, { author: 'You', text });
      setReviews(previous => [...previous, saved]); // now the truth contains it
      setError(null);
    } catch (problem) {
      // Nothing to undo: when the action ends the draft disappears by itself.
      setError(problem instanceof Error ? problem.message : 'Could not save your review');
    }
  }

  return (
    <>
      <ul className="reviews__list">
        {shownReviews.map(review => (
          <li key={review.id} className={review.pending ? 'reviews__item is-pending' : 'reviews__item'}>
            <strong>{review.author}</strong>: {review.text}
            {review.pending && <em> (sending…)</em>}
          </li>
        ))}
      </ul>

      <form action={postReview} className="reviews__form">
        <label htmlFor={`review-${toyId}`} className="visually-hidden">
          Write a review
        </label>
        <textarea
          id={`review-${toyId}`}
          name="text"
          className="text-input"
          rows={2}
          placeholder="Write a review…  (the word “spam” gets rejected)"
          required
        />
        {error && (
          <p role="alert" className="field__error">
            {error}
          </p>
        )}
        <SubmitButton>Post review</SubmitButton>
      </form>
    </>
  );
}
```

📄 **`src/components/ToyReviews.css`** (new file)

```css
.reviews {
  margin-top: var(--space-4);
}

.reviews__list {
  list-style: none;
  margin: 0 0 var(--space-3);
  padding: 0;
}

.reviews__item {
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
}

.reviews__item.is-pending {
  opacity: 0.55;
}

.reviews__form {
  display: grid;
  gap: var(--space-2);
  justify-items: start;
}

.reviews__form textarea {
  width: 100%;
}
```

## 6. Document metadata: `<title>` and `<meta>` as plain JSX

Until now we changed the tab title with an **effect** (`document.title = …`). React 19 can **hoist** `<title>`, `<meta>` and `<link>` elements you render anywhere in the tree up into the page's `<head>`. No effect, no helper library.

Our `PageTitle` becomes a one-liner:

📄 **`src/components/PageTitle.tsx`** (replace everything)

```tsx
import { selectCount, useCartStore } from '../store/cartStore';

// React 19 moves this <title> into <head> for us.
export function PageTitle() {
  const count = useCartStore(selectCount);
  return <title>{count > 0 ? `(${count}) Tiny Toy Shop` : 'Tiny Toy Shop'}</title>;
}
```

And each toy page gets its own title and description (good for sharing links and for search engines):

📄 **`src/pages/ToyPage.tsx`** (edit these lines)

```diff
 import { ToyDetails } from '../components/ToyDetails';
+import { ToyReviews } from '../components/ToyReviews';
@@
     <article>
+      <title>{`${toy.name} · Tiny Toy Shop`}</title>
+      <meta name="description" content={toy.description} />
       <h2>
@@
         </Button>
       </div>
+      <ToyReviews toyId={toy.id} />
     </article>
```

Visit a toy page and look at the tab title ("Cuddly Bear · Tiny Toy Shop") and, in the dev tools Elements tab, at `<head>`: the `<meta name="description">` is there. Go back to the shop and the title returns to the cart title. (If several components render a `<title>`, they all end up in `<head>`; in our shop the toy page's title wins while you are on that page. In bigger apps give each page exactly one.)

## 7. Try the new toy page

1. Open a toy. "Loading reviews…" shows for a moment, then Maya's review (the `use` + Suspense).
2. Type "Great fun!" and press **Post review**. Your review **appears at once, greyed out with "(sending…)"**, becomes solid after the server answers, and the box clears (`useOptimistic` + the form reset).
3. Type "this is spam" and post. The grey review appears... then **disappears** and an error shows (the built-in rollback).
4. Go to the cart and test the checkout again (Nowhere Street).

## 8. What just happened?

```text
<form action={postReview}>   ── submit ──►  Action starts (isPending = true)
                                  │
                       addOptimisticReview(draft)   → screen shows draft now
                                  │
                      await addReview(...)  (server work)
                                  │
              success: setReviews([... , saved])    failure: setError(...)
                                  │
        Action ends → optimistic state resets to "reviews" (truth)
                      (draft replaced by saved, or gone)
```

- **Actions** give you pending state, results and form resets for free.
- **`useActionState`** keeps the latest result; **`useFormStatus`** lets a child button know about its form.
- **`useOptimistic`** shows an expected result at once, with the rollback built in. Always keep a way to show an error message.
- **`use`** unwraps a promise (needs Suspense around it) or reads context, and can be called conditionally.
- **`ref` as a prop** (Lesson 7): `forwardRef` is no longer needed for new code. React 19 also lets callback refs return a cleanup, and you can render `<Context value={…}>` without `.Provider`.

### Other changes and removed APIs

- Better error reporting, including clearer **hydration** mismatch messages.
- Support for custom elements (Web Components).
- Removed or changed APIs: `ReactDOM.render` (use `createRoot`), `defaultProps` on function components (use default parameters), legacy context and string refs. If you upgrade an old project, follow the official upgrade guide and its codemods.

> The details of these APIs can change a little between versions. When in doubt, check the official React docs for the version you use.

## 🧪 Try it yourself

1. **Slow it down.** Increase the delay in `reviewsApi.ts` to 3000 ms. Post a review and watch the grey draft stay visible for three seconds. Is it comfortable? What would you add to tell the visitor it's still saving?
2. **Break `use`.** In `ReviewsBody`, change `use(reviewsPromise)` to `use(fetchReviews(toyId))` (this creates a brand-new promise on every attempt). Open a toy: "Loading reviews…" never goes away, because React keeps meeting a different, unfinished promise. (TypeScript will also say `reviewsPromise` is unused; ignore it for the experiment.) Put it back.
3. **Pending without props.** Use `useFormStatus` to show a small spinner next to the review box without passing any prop to it.
4. **useActionState for reviews.** Rewrite `postReview` to return `{ error?: string }` and use `useActionState` instead of the separate `error` state.
5. **Meta tags.** Add `<meta property="og:title" content={toy.name} />` to the toy page and check `<head>`.
6. **Read context with `use`.** In a small component, call `use(SomeContext)` after an `if` check. Why would `useContext` in the same place be an error?

## ✅ Check yourself

<details>
<summary>1. What does <code>useActionState</code> return?</summary>

A triple: the latest state (what the action returned), a `formAction` to pass to `<form action>`, and `isPending`.
</details>

<details>
<summary>2. Why must <code>useFormStatus</code> live in a child of the form?</summary>

It reads the status of the *parent* `<form>`. Called in the same component that renders the form, it has no parent form to report on.
</details>

<details>
<summary>3. What happens to an optimistic item when the action fails?</summary>

It disappears automatically when the action ends, because the optimistic state falls back to the real state. You should still show an error message.
</details>

<details>
<summary>4. Why must the promise you give to <code>use</code> be stable?</summary>

If you create a new promise each render, React never gets to see the same promise resolve, and it keeps suspending. Create it once and pass it down, or use a cache/framework.
</details>

<details>
<summary>5. How can <code>use</code> differ from other hooks?</summary>

It can be called conditionally or in loops, and it can read promises as well as context.
</details>

## Recap

- Actions are async functions for forms and transitions; React tracks pending state, results, and form reset.
- `useActionState` + `useFormStatus` handle submit results and pending UI.
- `useOptimistic` shows the expected result immediately, with automatic rollback.
- `use(promise)` + Suspense replaces effect-and-loading-state code (keep promises stable).
- `<title>`, `<meta>` and `<link>` can be rendered anywhere and React moves them into `<head>`.

➡️ **Next:** [Lesson 20 – Server Components and frameworks: a trip to Next.js](20-server-components-and-frameworks.md)
