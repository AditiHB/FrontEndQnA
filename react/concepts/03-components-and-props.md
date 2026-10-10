# 3. Components & Props

> **Like I'm 5:** A component is a LEGO brick with labelled slots on it. Props are the pieces you snap into the slots when you use the brick. The brick can't change the pieces you gave it, but it can show them.

## Function components with props

```tsx
interface ProductCardProps {
  name: string;
  price: number;
  onAdd: (id: string) => void;
  id: string;
  badge?: string;       // optional
}

export function ProductCard({ id, name, price, badge = 'New', onAdd }: ProductCardProps) {
  return (
    <article>
      <h3>{name}</h3>
      <p>{price.toFixed(2)}</p>
      {badge && <span>{badge}</span>}
      <button onClick={() => onAdd(id)}>Add to cart</button>
    </article>
  );
}
```

```tsx
<ProductCard id="p1" name="Shoe" price={49.9} onAdd={addToCart} />
```

## Props are read-only

Never change `props` inside a component. If the child needs to change something, the parent owns the state and passes a callback.

## Children

```tsx
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

<Card title="Orders"><OrderList /></Card>
```

## Default props

Use JavaScript default parameters (`badge = 'New'`). The older `defaultProps` for function components is deprecated.

## Component rules
- Components must be pure in their rendering: the same props and state give the same output.
- Don't define a component inside another component. It gets recreated each render and loses its state.
- Name components with PascalCase and export one main component per file for clarity.

## Important points
- Props flow down. Events flow up through callback props.
- Keep components small and focused. Split when a component handles more than one job.
