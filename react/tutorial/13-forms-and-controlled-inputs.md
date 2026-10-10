# Lesson 13: Forms – Puppets and Free-Thinking Kids

> **Like I'm 5:** A controlled input is a puppet. React holds the string, and the input can only show what React tells it to show. An uncontrolled input is a free-thinking kid who remembers what they typed, and you ask them for it later.

| | |
|---|---|
| **Concept reference** | [11 – Forms & controlled inputs](../concepts/11-forms-and-controlled-inputs.md) |
| **You will learn** | Controlled inputs, uncontrolled inputs with `FormData` and the React 19 form `action`, validation (when to show errors), accessible labels and error messages, form libraries |
| **We build** | An "Add a toy" form (controlled, with validation) and a "Checkout" form (uncontrolled) |
| **Time** | About 90 minutes |

## The story

Two new jobs for the shop:

1. **The shopkeeper** wants to add a new toy to the shelf.
2. **The customer** wants to check out: type a name and an address.

Both are forms. React gives two ways to handle them, and each is good at something.

## 1. Two kinds of inputs

| | Controlled (the puppet) | Uncontrolled (the free kid) |
|---|---|---|
| Who holds the text? | **React state** | **The browser** (the DOM) |
| How do you read it? | It's in your state variable | Ask for it when the form is sent (`FormData`) |
| Typed letters | `onChange` → `setState` → input shows it | The browser just shows them |
| Good for | Live validation, formatting, enabling/disabling buttons as you type | Simple forms where you only need the values at the end |

```tsx
// Controlled: the value always comes from state
<input value={name} onChange={event => setName(event.target.value)} />

// Uncontrolled: no value prop; the browser keeps it. Read it at submit.
<input name="name" />
```

> **A common bug:** giving an input a `value` but no `onChange`. The input becomes frozen. It is a puppet with nobody pulling the strings.

## 2. A helper that wires labels and errors

Every field needs the same things: a `<label>` connected to the input, and an error message connected to it for screen readers. Typing that 8 times is no fun, so we make a `Field` brick.

It uses a **render prop** (Lesson 12) to give the input the right `id` and `aria-` attributes, and `useId` to make unique ids.

📄 **`src/components/Field.tsx`** (new file)

```tsx
import { useId, type ReactNode } from 'react';
import './Form.css';

interface InputA11yProps {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby'?: string;
}

interface FieldProps {
  label: string;
  error?: string;
  children: (props: InputA11yProps) => ReactNode;
}

export function Field({ label, error, children }: FieldProps) {
  const id = useId(); // unique, stable id
  const errorId = `${id}-error`;

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children({
        id,
        'aria-invalid': Boolean(error), // tells screen readers the value is wrong
        'aria-describedby': error ? errorId : undefined, // links the error text
      })}
      {error && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
```

📄 **`src/components/Form.css`** (new file)

```css
:root {
  --color-danger-text: #c92a2a;
}

[data-theme='dark'] {
  --color-danger-text: #ff8787;
}

.field {
  display: grid;
  gap: var(--space-1);
  margin-bottom: var(--space-3);
}

.field label {
  font-weight: 600;
}

.field .text-input {
  width: 100%;
}

.field [aria-invalid='true'] {
  border-color: var(--color-danger);
}

.field__error {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-danger-text);
}

.form-actions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
}

.form-check {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}
```

## 3. The "Add a toy" form (controlled)

The plan:

1. **One state object** holds all the values: `{ name, price, emoji, … }`.
2. **Validation is a plain function** `validate(values)` that returns the errors. We call it while drawing and never store the errors (derived values, Lesson 5).
3. **Show errors at the right time.** An error should not shout at you on the first render when the form is empty. We show an error for a field only **after the visitor has left that field** (`touched`) or **tried to submit**.

📄 **`src/components/AddToyForm.tsx`** (new file)

```tsx
import { useState, type FormEvent } from 'react';
import { categoryInfo, categoryList } from '../lib/categories';
import type { Category, Toy } from '../types';
import { Button } from './Button';
import { Field } from './Field';
import { TextInput } from './TextInput';

interface FormValues {
  name: string;
  price: string; // inputs always give text; we convert at the end
  emoji: string;
  category: Category;
  description: string;
  inStock: boolean;
}

const emptyValues: FormValues = {
  name: '',
  price: '',
  emoji: '🧸',
  category: 'blocks',
  description: '',
  inStock: true,
};

type Errors = Partial<Record<'name' | 'price' | 'emoji' | 'description', string>>;

// A plain function: values in, errors out. Easy to test (Lesson 21).
function validate(values: FormValues): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 3) {
    errors.name = 'Give the toy a name with at least 3 letters.';
  }
  const price = Number(values.price);
  if (values.price.trim() === '' || Number.isNaN(price) || price <= 0) {
    errors.price = 'Enter a price above 0, like 9.99.';
  }
  if (values.emoji.trim() === '') {
    errors.emoji = 'Pick an emoji, like 🚂.';
  }
  if (values.description.trim().length < 10) {
    errors.description = 'Tell us a little more (at least 10 letters).';
  }
  return errors;
}

interface AddToyFormProps {
  onAdd: (toy: Toy) => void;
}

export function AddToyForm({ onAdd }: AddToyFormProps) {
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  // Derived: recalculated on every render, never stored.
  const errors = validate(values);

  // Only show an error once the visitor left the field or tried to submit.
  function errorFor(field: keyof Errors) {
    return submitted || touched[field] ? errors[field] : undefined;
  }

  function update<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues(prev => ({ ...prev, [field]: value }));
  }

  function markTouched(field: keyof FormValues) {
    setTouched(prev => ({ ...prev, [field]: true }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // don't reload the page!
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return; // stay and show the errors

    onAdd({
      id: `custom-${crypto.randomUUID()}`,
      name: values.name.trim(),
      price: Number(values.price),
      emoji: values.emoji.trim(),
      category: values.category,
      inStock: values.inStock,
      description: values.description.trim(),
    });
    setValues(emptyValues);
    setTouched({});
    setSubmitted(false);
  }

  return (
    // noValidate: we show our own friendly messages instead of the browser's.
    <form onSubmit={handleSubmit} noValidate>
      <Field label="Toy name" error={errorFor('name')}>
        {a11y => (
          <TextInput
            {...a11y}
            value={values.name}
            onChange={event => update('name', event.target.value)}
            onBlur={() => markTouched('name')}
            autoComplete="off"
          />
        )}
      </Field>

      <Field label="Price in dollars" error={errorFor('price')}>
        {a11y => (
          <TextInput
            {...a11y}
            type="number"
            step="0.01"
            min="0"
            value={values.price}
            onChange={event => update('price', event.target.value)}
            onBlur={() => markTouched('price')}
          />
        )}
      </Field>

      <Field label="Emoji picture" error={errorFor('emoji')}>
        {a11y => (
          <TextInput
            {...a11y}
            value={values.emoji}
            onChange={event => update('emoji', event.target.value)}
            onBlur={() => markTouched('emoji')}
            maxLength={4}
          />
        )}
      </Field>

      <Field label="Category">
        {a11y => (
          <select
            {...a11y}
            className="text-input"
            value={values.category}
            onChange={event => update('category', event.target.value as Category)}
          >
            {categoryList.map(category => (
              <option key={category} value={category}>
                {categoryInfo[category].emoji} {categoryInfo[category].label}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field label="Description" error={errorFor('description')}>
        {a11y => (
          <textarea
            {...a11y}
            className="text-input"
            rows={3}
            value={values.description}
            onChange={event => update('description', event.target.value)}
            onBlur={() => markTouched('description')}
          />
        )}
      </Field>

      <label className="form-check">
        <input
          type="checkbox"
          checked={values.inStock}
          onChange={event => update('inStock', event.target.checked)}
        />
        In stock
      </label>

      <div className="form-actions">
        <Button type="submit">Add to the shelf</Button>
      </div>
    </form>
  );
}
```

Things to notice:

- **One `update(field, value)` function** serves every field. The `[field]: value` syntax uses the variable as the key.
- **Checkboxes** use `checked` / `event.target.checked`, not `value`.
- A `<select>` and a `<textarea>` are controlled with `value` too.
- `event.preventDefault()` stops the browser from reloading the page when a form is submitted.
- `noValidate` turns off the browser's own pop-up messages, so ours show instead.
- The form never stores `errors`. It calls `validate(values)` each time it draws.

## 4. The "Checkout" form (uncontrolled)

For checkout we just need the answers at the end, and the browser can validate simple things like "this field is required". In **React 19**, you can pass a **function** to a form's `action`. React calls it with the form's data (`FormData`) when the visitor submits, and handles `preventDefault` for you. When the function finishes, React clears the form's fields for you, too.

📄 **`src/components/CheckoutForm.tsx`** (new file)

```tsx
import { useState } from 'react';
import { cartCount, cartTotal } from '../context/cartReducer';
import { useCart, useCartDispatch } from '../context/CartContext';
import { formatPrice } from '../lib/formatPrice';
import { Button } from './Button';
import { Field } from './Field';
import { TextInput } from './TextInput';

export function CheckoutForm({ onDone }: { onDone: () => void }) {
  const items = useCart();
  const dispatch = useCartDispatch();
  const [thanksName, setThanksName] = useState<string | null>(null);

  // React 19 calls this with the form's data when the visitor submits.
  function placeOrder(formData: FormData) {
    const name = String(formData.get('name') ?? '');
    // Later lessons send the order to a server. For now we just empty the cart.
    dispatch({ type: 'cleared' });
    setThanksName(name);
  }

  if (thanksName !== null) {
    return (
      <div>
        <p>
          Thank you, <strong>{thanksName}</strong>! 🎉
        </p>
        <p>Your toys are on their way.</p>
        <Button onClick={onDone}>Done</Button>
      </div>
    );
  }

  return (
    <form action={placeOrder}>
      <p>
        You are buying {cartCount(items)} {cartCount(items) === 1 ? 'toy' : 'toys'} for{' '}
        <strong>{formatPrice(cartTotal(items))}</strong>.
      </p>

      <Field label="Your name">
        {a11y => <TextInput {...a11y} name="name" required autoComplete="name" />}
      </Field>

      <Field label="Delivery address">
        {a11y => (
          <TextInput {...a11y} name="address" required autoComplete="street-address" />
        )}
      </Field>

      <label className="form-check">
        <input type="checkbox" name="gift" />
        This is a gift 🎁
      </label>

      <div className="form-actions">
        <Button type="submit">Place order</Button>
      </div>
    </form>
  );
}
```

Notice: there is **no `value`, no `onChange`, no state** for the fields. `name="..."` is what makes `formData.get('name')` work. `required` lets the browser stop an empty submit with its own message.

Add a **Checkout** button to the cart (and make sure the "click outside" rule waits while the checkout window is open):

📄 **`src/components/CartDropdown.tsx`** (replace everything)

```tsx
import { useRef, useState } from 'react';
import { cartCount, cartTotal } from '../context/cartReducer';
import { useCart, useCartDispatch } from '../context/CartContext';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { formatPrice } from '../lib/formatPrice';
import { Button, DangerButton } from './Button';
import { CheckoutForm } from './CheckoutForm';
import { Modal } from './Modal';
import { QuantityPicker } from './QuantityPicker';
import './CartDropdown.css';

export function CartDropdown() {
  const items = useCart();
  const dispatch = useCartDispatch();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(rootRef, () => setOpen(false), open && !confirmOpen && !checkoutOpen);

  const count = cartCount(items);
  const total = cartTotal(items);

  function emptyCart() {
    dispatch({ type: 'cleared' });
    setConfirmOpen(false);
    setOpen(false);
  }

  return (
    <div className="cart" ref={rootRef}>
      <button
        type="button"
        className="cart__button"
        aria-expanded={open}
        aria-controls="cart-panel"
        onClick={() => setOpen(isOpen => !isOpen)}
      >
        🛒 {count} {count === 1 ? 'item' : 'items'} · {formatPrice(total)}
      </button>

      {open && (
        <div id="cart-panel" className="cart__panel">
          {items.length === 0 ? (
            <p>Your cart is empty. Go find a toy! 🧸</p>
          ) : (
            <>
              <ul className="cart__list">
                {items.map(item => (
                  <li key={item.toyId} className="cart-row">
                    <span className="cart-row__name">
                      {item.emoji} {item.name}
                    </span>
                    <QuantityPicker
                      qty={item.qty}
                      onChange={qty =>
                        dispatch({ type: 'quantityChanged', toyId: item.toyId, qty })
                      }
                    />
                    <span className="cart-row__price">
                      {formatPrice(item.price * item.qty)}
                    </span>
                    <button
                      type="button"
                      className="cart-row__remove"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => dispatch({ type: 'removed', toyId: item.toyId })}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              <p className="cart__total">
                Total: <strong>{formatPrice(total)}</strong>
              </p>
              <div className="cart__confirm-buttons">
                <Button onClick={() => setCheckoutOpen(true)}>Checkout</Button>
                <DangerButton onClick={() => setConfirmOpen(true)}>Clear cart</DangerButton>
              </div>
            </>
          )}
        </div>
      )}

      {confirmOpen && (
        <Modal title="Empty the cart?" onClose={() => setConfirmOpen(false)}>
          <p>
            All {count} {count === 1 ? 'toy goes' : 'toys go'} back on the shelf.
          </p>
          <div className="cart__confirm-buttons">
            <DangerButton onClick={emptyCart}>Yes, empty it</DangerButton>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Keep shopping
            </Button>
          </div>
        </Modal>
      )}

      {checkoutOpen && (
        <Modal title="Checkout" onClose={() => setCheckoutOpen(false)}>
          <CheckoutForm
            onDone={() => {
              setCheckoutOpen(false);
              setOpen(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
```

## 5. Wire up "Add a toy" in `App`

The new toys live in `App`'s state for now (they vanish when you reload; Lesson 15 fixes that with a "server"). The "toy of the day" is picked from the **original** catalogue only, so adding a toy doesn't change it.

📄 **`src/App.tsx`** (replace everything)

```tsx
import { useCallback, useMemo, useRef, useState } from 'react';
import { AddToyForm } from './components/AddToyForm';
import { Button } from './components/Button';
import { CategoryFilter } from './components/CategoryFilter';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Modal } from './components/Modal';
import { PageLayout } from './components/PageLayout';
import { PageTitle } from './components/PageTitle';
import { SaleBanner } from './components/SaleBanner';
import { SearchBox, type SearchBoxHandle } from './components/SearchBox';
import { Section } from './components/Section';
import { SplitView } from './components/SplitView';
import { ToyList } from './components/ToyList';
import { ToyRoulette } from './components/ToyRoulette';
import { useCartDispatch } from './context/CartContext';
import { useDebounce } from './hooks/useDebounce';
import { useFetch } from './hooks/useFetch';
import type { CategoryChoice, Toy } from './types';
import './App.css';

const NO_TOYS: Toy[] = [];

export default function App() {
  const dispatch = useCartDispatch();

  const { data, error, loading, reload } = useFetch<Toy[]>('/toys.json');
  const catalogue = data ?? NO_TOYS;

  // Toys the shopkeeper added in this visit (kept only in memory for now).
  const [addedToys, setAddedToys] = useState<Toy[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const toys = useMemo(() => [...catalogue, ...addedToys], [catalogue, addedToys]);

  const [category, setCategory] = useState<CategoryChoice>('all');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [luckySeed] = useState(() => Math.random());
  const searchRef = useRef<SearchBoxHandle>(null);

  const visibleToys = useMemo(
    () =>
      toys.filter(toy => {
        const matchesCategory = category === 'all' || toy.category === category;
        const matchesQuery = toy.name
          .toLowerCase()
          .includes(debouncedQuery.trim().toLowerCase());
        return matchesCategory && matchesQuery;
      }),
    [toys, category, debouncedQuery],
  );

  const toyOfTheDay =
    catalogue.length > 0 ? catalogue[Math.floor(luckySeed * catalogue.length)] : undefined;

  const handleAdd = useCallback(
    (toy: Toy, qty: number) => dispatch({ type: 'added', toy, qty }),
    [dispatch],
  );

  function handleNewToy(toy: Toy) {
    setAddedToys(prev => [...prev, toy]);
    setAddOpen(false);
  }

  return (
    <PageLayout header={<Header title="Tiny Toy Shop" />} footer={<Footer />}>
      <PageTitle />
      <SaleBanner />

      {toyOfTheDay && (
        <p className="toy-of-the-day">
          ⭐ Toy of the day: {toyOfTheDay.emoji} <strong>{toyOfTheDay.name}</strong>
        </p>
      )}

      {toys.length > 0 && <ToyRoulette toys={toys} />}

      <SplitView
        side={
          <>
            <SearchBox ref={searchRef} value={query} onChange={setQuery} />
            {query !== '' && (
              <Button variant="ghost" onClick={() => searchRef.current?.clear()}>
                Clear search
              </Button>
            )}
            <CategoryFilter selected={category} onSelect={setCategory} />
            <Button variant="ghost" onClick={() => setAddOpen(true)}>
              ➕ Add a toy
            </Button>
          </>
        }
      >
        <Section title={data ? `Our toys (${visibleToys.length})` : 'Our toys'}>
          {loading && <p>Opening the toy box… 📦</p>}

          {error && (
            <div role="alert">
              <p>Oh no! The toy truck got lost on the way. 🚚💨</p>
              <Button onClick={reload}>Try again</Button>
            </div>
          )}

          {data && <ToyList toys={visibleToys} onAdd={handleAdd} />}
        </Section>
      </SplitView>

      {addOpen && (
        <Modal title="Add a toy" onClose={() => setAddOpen(false)}>
          <AddToyForm onAdd={handleNewToy} />
        </Modal>
      )}
    </PageLayout>
  );
}
```

Try both forms:

1. Click **➕ Add a toy**. Press **Add to the shelf** with the form empty. Errors appear, with the cursor still in the form. Fix them one by one and watch each message vanish as you type. A new card appears on the shelf.
2. Add a few toys to the cart, open the cart and press **Checkout**. Try to submit empty: the browser stops you. Fill it in and submit.

## 6. What just happened?

### The controlled loop

```text
 you type "R"
     │
     ▼
 onChange → update('name', 'R') → setValues(...)
     │
     ▼
 React draws AddToyForm again → <input value="R" />
```

The input never decides what it shows. React does. That makes things like "force upper case", "disable the button until valid" and "clear the form" very easy: change the state.

### Validation, step by step

- **Shape of the rule:** `validate(values)` is a pure function: values in, errors out. It can be tested without drawing anything.
- **When to show it:** after leaving the field (`onBlur` → `touched`) or after pressing submit. Not on the very first draw.
- **Server is the boss.** Browser checks are for friendliness. A real server must **re-check everything**, because anybody can skip your form.

### Accessibility (a11y) checklist

- Every input has a `<label>` connected with `htmlFor` and `id`. That's what `Field` does.
- Errors are linked to inputs with `aria-describedby`, and the input says `aria-invalid`.
- Use real `<button>` elements. A `type="submit"` button inside a `<form>` makes the Enter key work.
- Don't rely on colour alone to show an error: we also write words.

### Which one when?

- **Controlled** → live validation, input masks, dependent fields, anything that reacts as you type.
- **Uncontrolled + `FormData`** → simple forms where you need the values only at the end.
- **Don't** keep the same value in state *and* in the DOM. Choose one owner.

### Form libraries

Big forms get repetitive. Libraries such as **React Hook Form** (fast: it mostly uses uncontrolled inputs and refs) and **Formik** remove the boilerplate, and a schema library like **Zod** describes the rules once. This is not part of our shop, only a taste:

```tsx
const schema = z.object({
  name: z.string().min(3, 'At least 3 letters'),
  description: z.string().min(10, 'Tell us more'),
});
type Values = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors } } =
  useForm<Values>({ resolver: zodResolver(schema) });

<form onSubmit={handleSubmit(values => save(values))}>
  <input {...register('name')} />
  {errors.name && <p>{errors.name.message}</p>}
  {/* ... */}
</form>
```

Install with `npm install react-hook-form zod @hookform/resolvers` if you want to try it on your own.

## 🧪 Try it yourself

1. **The frozen input.** In `TextInput` usage for the name, delete the `onChange` line. Try typing. The input is frozen (a puppet with no strings). Put it back.
2. **A new rule.** Make the price at most `500`. Add the message and watch it appear live.
3. **Disable the button.** Make "Add to the shelf" `disabled` while `validate(values)` has errors. Is that better or worse for users? (Many designers prefer to leave the button enabled and explain what's wrong. Why?)
4. **Show the error immediately.** Change `errorFor` to always show the error. Notice how rude the empty form feels.
5. **Gift note.** In the checkout, add a textarea `giftNote` that only appears if "This is a gift" is checked. Hint: you now need that checkbox to be *controlled* (state), because something else on screen depends on it.

## ✅ Check yourself

<details>
<summary>1. What makes an input "controlled"?</summary>

Its `value` (or `checked`) comes from React state and every change is written back with `onChange`.
</details>

<details>
<summary>2. Why call <code>event.preventDefault()</code> in a submit handler?</summary>

Without it the browser reloads the page when the form is submitted. (With React 19 `action` functions React does this for you.)
</details>

<details>
<summary>3. Why don't we store <code>errors</code> in state?</summary>

They can be computed from `values` while drawing. Storing them risks the errors and values getting out of sync.
</details>

<details>
<summary>4. Does client-side validation make a form secure?</summary>

No. It only helps users. The server must validate again because requests can be sent without your form.
</details>

## Recap

- Controlled inputs: React state holds the value (`value` + `onChange`). Uncontrolled: the DOM holds it and you read `FormData`.
- React 19 lets `<form action={fn}>` take a function.
- Keep validation as a pure function; show errors after blur or submit.
- Connect labels and errors for accessibility (`htmlFor`, `aria-invalid`, `aria-describedby`).
- Big forms can use libraries like React Hook Form with Zod. The server remains the source of truth.

➡️ **Next:** [Lesson 14 – Routing: the signboard in the hallway](14-routing.md)
