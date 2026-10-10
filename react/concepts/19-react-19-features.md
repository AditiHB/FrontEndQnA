# 19. React 19 Features

> **Like I'm 5:** React 19 gave the kitchen some new helpers. Actions are a waiter who takes your order and tells the kitchen whether it's cooking. `use` is a way to unwrap a food box that's still being delivered. `useOptimistic` writes "on the way" on the menu before the food arrives.

## Actions

An action is a function passed to a `<form>` or a transition. React tracks the pending state for you.

```tsx
import { useActionState } from 'react';

async function signUp(prevState: { error?: string } | null, formData: FormData) {
  const email = String(formData.get('email'));
  try {
    await api.signUp(email);
    return { error: undefined };
  } catch {
    return { error: 'Sign up failed' };
  }
}

export function SignUp() {
  const [state, formAction, isPending] = useActionState(signUp, null);
  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      <button disabled={isPending}>{isPending ? 'Saving…' : 'Sign up'}</button>
      {state?.error && <p role="alert">{state.error}</p>}
    </form>
  );
}
```

## `useFormStatus`

A child of a form can read the pending state of its parent form.

```tsx
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>Submit</button>;
}
```

## `useOptimistic`

```tsx
const [optimisticTodos, addOptimistic] = useOptimistic(todos, (current, newTodo: Todo) => [...current, newTodo]);

async function add(formData: FormData) {
  const todo = { id: crypto.randomUUID(), title: String(formData.get('title')) };
  addOptimistic(todo);            // shows immediately
  await api.saveTodo(todo);       // if it fails, the optimistic item disappears
}
```

## `use`

`use` reads a promise or a context during render. For promises, pair it with Suspense.

```tsx
function Comments({ promise }: { promise: Promise<Comment[]> }) {
  const comments = use(promise);
  return <ul>{comments.map(c => <li key={c.id}>{c.text}</li>)}</ul>;
}
```

`use` can be called conditionally, unlike other hooks.

## `ref` as a prop

Function components receive `ref` directly. `forwardRef` is no longer required for new code.

## Other changes
- Document metadata: `<title>` and `<meta>` can be rendered anywhere in the tree.
- Improved error reporting and hydration error messages.
- Removed APIs such as `ReactDOM.render`, `defaultProps` for function components, and legacy context. Check the upgrade guide.

## Important points
- Actions simplify form handling and pending states.
- Optimistic updates need a rollback path when the server fails.
- Check the official React docs for the exact API in your version.
