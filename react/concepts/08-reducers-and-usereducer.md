# 8. Reducers & `useReducer`

> **Like I'm 5:** A reducer is a rule book for a game. You don't change the score directly. You write down what happened ("player scored 2 points"), and the rule book works out the new score.

## Basic reducer

```tsx
import { useReducer } from 'react';

type State = { count: number };
type Action = { type: 'increment' } | { type: 'decrement' } | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };
    case 'decrement': return { count: state.count - 1 };
    case 'reset':     return { count: 0 };
    default: {
      const _exhaustive: never = action;
      return state;
    }
  }
}

export function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  return (
    <>
      <p>{state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
    </>
  );
}
```

## When to choose `useReducer` over `useState`
- Several related values that change together.
- The next state depends on the previous state in complex ways.
- You want all transitions in one place, which helps testing and reading.

## Rules for reducers
- Pure: no side effects, no network calls, no random values.
- Return a new state object; don't mutate.
- Handle every action type. The `never` check catches a missing case.

## Reducer with context

Pair `useReducer` with context to share state and dispatch without prop drilling:

```tsx
const StateCtx = createContext<State | null>(null);
const DispatchCtx = createContext<React.Dispatch<Action> | null>(null);
```

Splitting state and dispatch means components that only dispatch don't re-render on each state change.

## Important points
- Actions describe what happened, not how to change the state.
- Keep the reducer in its own file so it can be unit tested without rendering.
