# 15. Data Fetching & Caching

> **Like I'm 5:** Fetching data is asking the shop for groceries. Caching is keeping the groceries in your fridge, so you don't walk to the shop every time you are hungry. Stale data is milk that is past its date: it can still be used, but you should buy fresh milk soon.

## Why not plain `useEffect` everywhere?

Hand-written fetching often misses:
- Cancelling old requests when the input changes.
- Sharing one request among many components.
- Caching, retries, and refetching on focus.
- Loading, error, and empty states in a consistent way.

## TanStack Query

```bash
npm install @tanstack/react-query
```

```tsx
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

// in main.tsx
<QueryClientProvider client={queryClient}><App /></QueryClientProvider>

function Orders({ customerId }: { customerId: string }) {
  const { data, isPending, error } = useQuery({
    queryKey: ['orders', customerId],
    queryFn: ({ signal }) => fetch(`/api/customers/${customerId}/orders`, { signal }).then(r => r.json()),
    staleTime: 60_000,   // treat data as fresh for one minute
  });

  if (isPending) return <Spinner />;
  if (error) return <p>Could not load orders</p>;
  return <OrderList orders={data} />;
}
```

## Mutations and cache invalidation

```tsx
function AddOrder() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (order: NewOrder) => api.createOrder(order),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
  return <button onClick={() => mutation.mutate({ item: 'pen' })}>Add</button>;
}
```

## Key ideas
- **queryKey**: identifies the cached data. Include every variable the query depends on.
- **staleTime**: how long data is considered fresh.
- **gcTime**: how long unused data stays in memory.
- **Invalidation**: marks data as stale after a change so the UI refetches.

## Optimistic updates

```tsx
useMutation({
  mutationFn: toggleTodo,
  onMutate: async (id) => {
    await qc.cancelQueries({ queryKey: ['todos'] });
    const previous = qc.getQueryData<Todo[]>(['todos']);
    qc.setQueryData<Todo[]>(['todos'], old => old?.map(t => t.id === id ? { ...t, done: !t.done } : t));
    return { previous };
  },
  onError: (_err, _id, ctx) => qc.setQueryData(['todos'], ctx?.previous),
});
```

## Server state vs client state
- **Server state**: data owned by the backend (orders, users). Use a query library.
- **Client state**: UI state (open menu, selected tab). Use `useState` or a store.

## Important points
- Never keep copies of server data in `useState` when a query library can own it.
- Set realistic `staleTime` for your data.
- Handle loading, error, and empty states explicitly.
