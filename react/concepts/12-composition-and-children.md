# 12. Composition & Children

> **Like I'm 5:** Instead of building a new box for every toy, you build one box with a slot. Then you put any toy you like in the slot. That is composition.

## Children

```tsx
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

<Panel title="Profile">
  <Avatar />
  <Bio />
</Panel>
```

## Named slots with props

```tsx
function Layout({ header, sidebar, children }: {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <header>{header}</header>
      <aside>{sidebar}</aside>
      <main>{children}</main>
    </>
  );
}
```

## Render props

A component receives a function and calls it to decide what to render.

```tsx
<DataSource url="/api/items">
  {({ data, loading }) => loading ? <Spinner /> : <List items={data} />}
</DataSource>
```

Hooks have replaced most render props, but the pattern still appears in libraries.

## Specialization

```tsx
function DangerButton(props: React.ComponentProps<typeof Button>) {
  return <Button {...props} variant="danger" />;
}
```

Build specific components from general ones.

## Compound components

```tsx
<Tabs>
  <Tabs.List>
    <Tabs.Tab>One</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel>...</Tabs.Panel>
</Tabs>
```

Parts share state through context, and the user composes the layout they need.

## Important points
- Prefer composition over inheritance. React has no need for class inheritance between components.
- Use `children` for the content, and named props for multiple slots.
- Keep the wrapper focused on layout or behavior, and let the parent decide the content.
