# 14. Routing

> **Like I'm 5:** A router is the signboard in the hallway. The URL is the arrow on the sign, and the router shows the right room (component) for each arrow.

## Setup with React Router

```bash
npm install react-router
```

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Home } from './pages/Home';
import { Product } from './pages/Product';
import { Root } from './Root';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: 'products/:id', element: <Product /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
```

Package names and APIs have changed across React Router versions. Check the docs for the version you use.

## Links and outlets

```tsx
import { Link, NavLink, Outlet } from 'react-router';

function Root() {
  return (
    <>
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/products/42">Product</NavLink>
      </nav>
      <Outlet />   {/* the matched child route renders here */}
    </>
  );
}
```

Use `Link` and `NavLink`, not `<a href>`, so navigation stays inside the app.

## Reading params

```tsx
import { useParams, useSearchParams } from 'react-router';

function Product() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') ?? 'details';
  return <h1>Product {id} ({tab})</h1>;
}
```

## Programmatic navigation

```tsx
const navigate = useNavigate();
navigate('/login', { replace: true });
```

## Protected routes

```tsx
function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}
```

Route guards in the client are for user experience. The server must enforce access.

## Data loading per route

Modern routers can load data before the page renders, with `loader` and `action` functions. This avoids loading spinners in the middle of the page.

## Important points
- Keep route definitions in one place, or near feature folders for large apps.
- Use lazy loading for big pages (see [17-performance.md](17-performance.md)).
- Handle unknown URLs with a catch-all route that shows a not-found page.
