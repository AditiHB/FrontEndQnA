# 1. What Is React & Setup

> **Like I'm 5:** React is a painter who redraws only the part of the picture that changed. You describe what the picture should look like, and React figures out the brush strokes.

## Key concepts
- React describes the UI as a function of data: `UI = f(state)`.
- It is a **library** for the view layer. Routing, data fetching, and build tools are usually added separately, or come from a framework such as Next.js or React Router.
- React updates the page efficiently by comparing a virtual tree of elements with the previous one (reconciliation).

## Create a project

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev        # dev server with hot reload
npm run build      # production build
```

Vite is a common choice for single-page apps. Next.js and React Router framework mode are common for full-stack apps.

## Your first component

```tsx
export default function App() {
  return <h1>Hello, React!</h1>;
}
```

```tsx
// main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- `createRoot` attaches React to a DOM node.
- `StrictMode` runs extra checks in development, such as double-invoking effects to find cleanup bugs.

## Important points
- Components are functions that return JSX. Names start with a capital letter.
- Keep the main entry file small and move features into folders.
- Use TypeScript (`react-ts`) for safer props and state.
