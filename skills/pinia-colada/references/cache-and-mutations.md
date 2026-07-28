# Cache and mutations

Use this reference for writes, invalidation, direct cache work, prefetching, and optimistic updates. Confirm exact callback signatures against the installed package.

## Mutations

Use mutations for asynchronous operations with side effects:

```ts
import { useMutation } from '@pinia/colada'

const createTodo = useMutation({
  mutation: (text: string) => api.todos.create({ text }),
})
```

- `mutate(variables)` starts the operation and handles the rejected promise through mutation state and hooks.
- `mutateAsync(variables)` returns a promise; use it when surrounding control flow must await or catch the result.
- Keep mutation inputs explicit so `variables` and hook arguments remain useful and typed.
- Use `state.status` for result state and `asyncStatus` for active work.
- Configure `onMutate`, `onSuccess`, `onError`, and `onSettled` according to the installed version.
- Hooks may return promises. Awaiting invalidation in a hook keeps the mutation loading until dependent data is refreshed.

Mutations are not global by default. Add a mutation key when another component needs to find matching entries through the mutation cache.

## Query cache

Resolve the cache in an injection context:

```ts
import { useQueryCache } from '@pinia/colada'

const queryCache = useQueryCache()
```

Use key factories shared with query definitions. Common operations include:

```ts
queryCache.getQueryData(contactKeys.detail(id))
queryCache.setQueryData(contactKeys.detail(id), updatedContact)
queryCache.invalidateQueries({ key: contactKeys.root })
queryCache.invalidateQueries({ key: contactKeys.detail(id), exact: true })
queryCache.cancelQueries({ key: contactKeys.detail(id) })
```

- Prefix filters include descendant keys; use `exact: true` for one entry.
- Invalidation marks matching entries stale and normally refetches active matches.
- Inactive invalidated entries refresh when they become active.
- Pass the installed version's refetch mode only when inactive entries must also refetch immediately.
- Prefer invalidation to removal. Remove entries only for deliberate eviction, and cancel in-flight work first.
- Never replace internal cache structures directly.

Use direct writes when the server response already contains authoritative updated data. Use invalidation when related server state may have changed beyond the returned object.

## Prefetching

Prefetch with the query cache and the same defined options used by the eventual component:

```ts
await queryCache.refresh(queryCache.ensure(contactQuery(id)))
```

Prefetch likely next routes or hover targets only when the extra request has a clear UX benefit. Fresh cached data should prevent an unnecessary duplicate request.

## Mutation consistency strategies

Choose the narrowest strategy that preserves consistency:

1. Set exact cache data from the mutation response when it is complete and authoritative.
2. Invalidate affected query prefixes when the server may have changed derived lists or aggregates.
3. Apply an optimistic update only when immediate feedback matters and rollback is reliable.
4. Combine a direct response write with invalidation when progressive correctness is useful.

Example using authoritative response data and invalidation:

```ts
const updateContact = useMutation({
  mutation: (input: UpdateContactInput) => api.contacts.update(input),
  onSuccess(contact) {
    queryCache.setQueryData(contactKeys.detail(contact.id), contact)
  },
  onSettled(_data, _error, input) {
    return queryCache.invalidateQueries({ key: contactKeys.list(input.filters) })
  },
})
```

Adjust hook parameters to the locally installed declarations.

## Optimistic update checklist

An optimistic cache update needs all of the following:

1. Snapshot the previous value.
2. Construct a complete optimistic value without mutating cached objects in place.
3. Write the optimistic value.
4. Cancel related in-flight queries that could overwrite it.
5. Return rollback context from `onMutate`.
6. On error, restore only if the optimistic value is still current; another mutation may have superseded it.
7. On success, merge or replace with the server response.
8. On settled, invalidate the relevant keys to reconcile with the server.

```ts
const patchContact = useMutation({
  mutation: api.contacts.patch,
  onMutate(input) {
    const key = contactKeys.detail(input.id)
    const previous = queryCache.getQueryData<Contact>(key)
    const optimistic = previous && { ...previous, ...input }

    if (optimistic) {
      queryCache.setQueryData(key, optimistic)
      queryCache.cancelQueries({ key, exact: true })
    }

    return { key, previous, optimistic }
  },
  onError(_error, _input, context) {
    if (
      context.optimistic &&
      queryCache.getQueryData(context.key) === context.optimistic
    ) {
      queryCache.setQueryData(context.key, context.previous)
    }
  },
  onSuccess(contact, _input, context) {
    queryCache.setQueryData(context.key, contact)
  },
  onSettled(_data, _error, _input, context) {
    return queryCache.invalidateQueries({ key: context.key, exact: true })
  },
})
```

Avoid optimistic updates when rollback would be ambiguous, the server applies complex transformations, or concurrent edits cannot be reconciled safely. A pending UI row driven by mutation `variables` is often simpler than modifying the cache.

Official topics: [Mutations](https://pinia-colada.esm.dev/guide/mutations.html), [Query invalidation](https://pinia-colada.esm.dev/guide/query-invalidation.html), and [Query cache](https://pinia-colada.esm.dev/advanced/query-cache.html).
