# 10. Lists, Keys & Conditional Rendering

> **Like I'm 5:** Each item in a list needs a name tag. When the list is shuffled, React uses the name tags to find the right item, instead of guessing by position.

## Rendering lists

```tsx
function TodoList({ todos }: { todos: Todo[] }) {
  if (todos.length === 0) return <p>No todos yet</p>;

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

## Keys

- A key must be stable, unique among siblings, and tied to the data, such as a database ID.
- Don't use the array index when items can be reordered, inserted, or removed. It causes wrong state to stick to the wrong item.
- Keys are not passed as props. Use another name if the child needs the value.

```tsx
// Bad when the list can change
{items.map((item, i) => <Row key={i} item={item} />)}

// Good
{items.map(item => <Row key={item.id} item={item} />)}
```

## Conditional rendering

```tsx
{isLoading && <Spinner />}
{error ? <ErrorMessage error={error} /> : null}
{user ? <Profile user={user} /> : <LoginButton />}
```

Be careful with `&&` and numbers. `{count && <List />}` renders `0` when `count` is zero. Use `count > 0 &&`.

## Early returns

```tsx
if (status === 'loading') return <Skeleton />;
if (status === 'error') return <Retry />;
return <Content data={data} />;
```

Early returns keep the main markup readable.

## Lookup tables for many cases

```tsx
const views = { home: <Home />, about: <About /> };
return views[page] ?? <NotFound />;
```

## Important points
- Keys belong on the element returned by `map`, not on children inside it.
- Large lists need virtualization (see [17-performance.md](17-performance.md)).
