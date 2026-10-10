# 24. React A to Z Glossary

> **Like I'm 5:** This is a picture dictionary of React words. Find a word, read its one-line meaning, then follow the link for the full lesson.

| Letter | Term | Meaning | Lesson |
|--------|------|---------|--------|
| **A** | Action | A function passed to a form or transition that React tracks for pending state. | [19](19-react-19-features.md) |
| **A** | `useActionState` | Hook that connects an action to state and pending status. | [19](19-react-19-features.md) |
| **B** | Batching | React groups several state updates into one render. | [04](04-state-with-usestate.md) |
| **C** | Component | A function that returns UI. | [03](03-components-and-props.md) |
| **C** | Context | Shares a value down the tree without passing props. | [07](07-context-and-prop-drilling.md) |
| **C** | Controlled input | An input whose value comes from React state. | [11](11-forms-and-controlled-inputs.md) |
| **C** | Custom hook | A function starting with `use` that shares logic. | [13](13-custom-hooks.md) |
| **C** | Concurrent rendering | React can pause and resume rendering work. | [18](18-concurrency-suspense-and-error-boundaries.md) |
| **D** | Derived state | Values computed from other state during render. | [04](04-state-with-usestate.md) |
| **D** | Dependency array | The list that tells an effect when to run again. | [05](05-effects-useeffect.md) |
| **D** | `useDeferredValue` | Lets a value lag behind for non-urgent rendering. | [18](18-concurrency-suspense-and-error-boundaries.md) |
| **E** | Effect (`useEffect`) | Runs code after render to sync with the outside world. | [05](05-effects-useeffect.md) |
| **E** | Error boundary | Catches render errors in its children. | [18](18-concurrency-suspense-and-error-boundaries.md) |
| **F** | Fragment | Groups elements without an extra DOM node. | [02](02-jsx.md) |
| **H** | Hook | A function starting with `use` that adds React features. | [13](13-custom-hooks.md) |
| **H** | Hydration | Attaching React to server-rendered HTML. | [20](20-server-components-and-frameworks.md) |
| **I** | Immutability | Create new objects and arrays instead of changing them. | [04](04-state-with-usestate.md) |
| **I** | `useImperativeHandle` | Exposes a controlled API from a child through a ref. | [06](06-refs-and-the-dom.md) |
| **J** | JSX | HTML-like syntax that compiles to JavaScript. | [02](02-jsx.md) |
| **K** | Key | A stable identifier for items in a list. | [10](10-lists-keys-and-conditional-rendering.md) |
| **L** | `lazy` | Loads a component only when it's first rendered. | [17](17-performance.md) |
| **L** | Lifting state up | Moving state to a parent so siblings can share it. | [04](04-state-with-usestate.md) |
| **M** | `memo` | Skips re-rendering when props haven't changed. | [09](09-memoization.md) |
| **M** | Memoization | Caching results to avoid repeated work. | [09](09-memoization.md) |
| **N** | Nested routes | Child routes rendered inside a parent layout. | [14](14-routing.md) |
| **O** | `useOptimistic` | Shows an expected result before the server confirms it. | [19](19-react-19-features.md) |
| **P** | Portal | Renders children in a different part of the DOM with `createPortal`. | [06](06-refs-and-the-dom.md) |
| **P** | Props | Inputs passed from parent to child. | [03](03-components-and-props.md) |
| **Q** | Query (TanStack Query) | A library that caches and manages server data. | [15](15-data-fetching-and-caching.md) |
| **R** | Re-render | React calls a component function again to update the UI. | [17](17-performance.md) |
| **R** | Reconciliation | How React compares old and new trees to update the DOM. | [01](01-what-is-react-and-setup.md) |
| **R** | Reducer | A pure function that computes new state from an action. | [08](08-reducers-and-usereducer.md) |
| **R** | Ref | A stable container for a DOM node or a value. | [06](06-refs-and-the-dom.md) |
| **R** | React Router | A library for URL-based navigation. | [14](14-routing.md) |
| **S** | Server Component | A component that runs only on the server. | [20](20-server-components-and-frameworks.md) |
| **S** | State | Data that changes over time and causes re-renders. | [04](04-state-with-usestate.md) |
| **S** | StrictMode | Development checks that find unsafe effects and patterns. | [05](05-effects-useeffect.md) |
| **S** | Suspense | Shows a fallback while something is loading. | [18](18-concurrency-suspense-and-error-boundaries.md) |
| **T** | `useTransition` | Marks an update as non-urgent. | [18](18-concurrency-suspense-and-error-boundaries.md) |
| **U** | `use` | Reads a promise or context during render. | [19](19-react-19-features.md) |
| **U** | `'use client'` | Marks a file as client-side in frameworks. | [20](20-server-components-and-frameworks.md) |
| **V** | Virtual DOM | A lightweight description of the UI that React compares. | [01](01-what-is-react-and-setup.md) |
| **V** | Virtualization | Renders only visible rows of a long list. | [17](17-performance.md) |
| **W** | Wrapper component | A component that adds layout or behavior around children. | [12](12-composition-and-children.md) |
| **X** | XSS protection | React escapes text by default. Avoid `dangerouslySetInnerHTML`. | [02](02-jsx.md) |
| **Y** | Your own hook | A custom hook you write to share logic. | [13](13-custom-hooks.md) |
| **Z** | Zustand | A small store library for client state. | [16](16-state-management-libraries.md) |
