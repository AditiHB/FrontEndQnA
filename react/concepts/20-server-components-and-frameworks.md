# 20. Server Components & Frameworks

> **Like I'm 5:** A normal React app cooks the meal in the browser, after the recipe arrives. With server components, the kitchen (server) cooks the parts that don't need the browser, and only the finished food is sent. The browser then adds the interactive sprinkles.

## Rendering strategies

| Strategy | Where HTML is built | Good for |
|----------|---------------------|----------|
| Client-side rendering (CSR) | Browser | Dashboards, apps behind login |
| Server-side rendering (SSR) | Server, per request | SEO, fast first paint |
| Static generation (SSG) | Build time | Blogs, docs, marketing pages |
| Server components (RSC) | Server, no JavaScript sent for the component | Data-heavy pages with less client code |

## Server Components

- Run only on the server. They can read databases and files directly.
- Send no JavaScript to the browser for their own code.
- Cannot use state, effects, or browser APIs.
- Can render Client Components, which are marked with `'use client'`.

```tsx
// app/products/page.tsx (Server Component by default in Next.js App Router)
import { db } from '@/lib/db';

export default async function ProductsPage() {
  const products = await db.product.findMany();
  return <ProductList products={products} />;
}
```

```tsx
// components/AddToCart.tsx
'use client';
import { useState } from 'react';

export function AddToCart({ id }: { id: string }) {
  const [added, setAdded] = useState(false);
  return <button onClick={() => setAdded(true)}>{added ? 'Added' : 'Add'}</button>;
}
```

## Next.js

Next.js is the most common React framework. It provides routing, data loading, server components, image optimization, and deployment targets.

- **App Router**: file-based routing in `app/`, with layouts and server components.
- **Caching**: fetch and route caches; check the docs for the version you use, since defaults have changed.
- **Server Actions**: functions marked `'use server'` that the client can call.

## Hydration

After SSR or SSG, React attaches to the server HTML. If the server and client output differ, React reports a hydration mismatch.

Common causes: `Date.now()` or `Math.random()` during render, `window` checks during render, and browser-only extensions that change the HTML.

## Important points
- Keep client components small, and push `'use client'` down the tree.
- Don't pass non-serializable values (functions, class instances) from server to client components.
- Choose the framework based on the needs: SEO, data, team skills, and hosting.
