# 11. Forms & Controlled Inputs

> **Like I'm 5:** A controlled input is a puppet. React holds the string, and the input can only show what React tells it to show. An uncontrolled input is a free-thinking kid who remembers what they typed, and you ask them for it later.

## Controlled input

```tsx
import { useState } from 'react';

export function NameForm() {
  const [name, setName] = useState('');

  return (
    <form onSubmit={e => { e.preventDefault(); save(name); }}>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button type="submit">Save</button>
    </form>
  );
}
```

## Uncontrolled input with FormData

```tsx
export function SignUp() {
  async function action(formData: FormData) {
    await api.signUp({ email: String(formData.get('email')) });
  }
  return (
    <form action={action}>
      <input name="email" type="email" required />
      <button>Sign up</button>
    </form>
  );
}
```

React 19 accepts a function as `action`, which handles the submit event and pending state. See [19-react-19-features.md](19-react-19-features.md).

## Validation

```tsx
const [errors, setErrors] = useState<{ email?: string }>({});

function validate(values: { email: string }) {
  const next: typeof errors = {};
  if (!values.email.includes('@')) next.email = 'Enter a valid email';
  return next;
}
```

Show errors after the user leaves the field or submits, not on the first render.

## Form libraries

For large forms, libraries such as React Hook Form (performance-focused) and Formik reduce boilerplate. Pair them with a schema library like Zod for validation.

## Accessibility
- Every input needs a `<label>` connected with `htmlFor` and `id`.
- Use `aria-invalid` and `aria-describedby` to link error messages.
- Use real `<button>` elements for actions.

## Important points
- Controlled inputs make the form state explicit and easy to test.
- Keep server validation as the source of truth.
- Avoid storing the same value in state and in the DOM.
