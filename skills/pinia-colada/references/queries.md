# Queries

Use this reference for query design, keys, reusable definitions, pagination, and query-state rendering. Confirm exact option and return types against the installed `@pinia/colada` declarations.

## Basic query

Use queries for asynchronous reads:

```ts
import { useQuery } from '@pinia/colada'

const {
  state,
  data,
  error,
  status,
  asyncStatus,
  refresh,
  refetch,
} = useQuery({
  key: ['todos'],
  query: () => api.todos.list(),
})
```

- `state.status` describes the cached data: `pending`, `success`, or `error`.
- `asyncStatus` describes current work: `idle` or `loading`.
- Existing data can remain available while a background refresh is loading or fails.
- `refresh()` deduplicates work and respects freshness.
- `refetch()` forces a new request regardless of freshness.
- Use the grouped `state` discriminated union when TypeScript must narrow `data` or `error`.

Throw or reject from the query function for Pinia Colada to enter an error state. Native `fetch()` does not reject on HTTP 4xx/5xx, so check `response.ok` unless non-success responses intentionally belong in `data`.

## Reactive inputs and keys

Put every value used by the query function into the key. Use a getter when any segment is reactive:

```ts
const route = useRoute()

const contact = useQuery({
  key: () => ['contacts', route.params.id as string],
  query: () => api.contacts.get(route.params.id as string),
  enabled: () => typeof route.params.id === 'string',
})
```

Keys must be non-empty, serializable arrays. Structure them from broad to specific so prefix matching is useful. Object property order does not change key identity, but array order and primitive types do.

Create key factories and reusable options once a project has more than a few queries:

```ts
import { defineQueryOptions } from '@pinia/colada'

export const contactKeys = {
  root: ['contacts'] as const,
  list: (filters: ContactFilters) =>
    [...contactKeys.root, 'list', filters] as const,
  detail: (id: string) => [...contactKeys.root, 'detail', id] as const,
}

export const contactQuery = defineQueryOptions((id: string) => ({
  key: contactKeys.detail(id),
  query: () => api.contacts.get(id),
}))
```

Consume dynamic options through a getter when their inputs are reactive:

```ts
const result = useQuery(() => contactQuery(route.params.id as string))
```

Do not mechanically refactor a small project solely to introduce factories. Preserve an established key convention when it is already consistent and safe.

## Freshness and lifetime

- `staleTime` controls how long successful data is fresh.
- `gcTime` controls how long an inactive cache entry remains before collection.
- `enabled` pauses automatic fetching; use it when required inputs are absent or a query must not run during SSR.
- Prefer `refresh()` for normal lifecycle refreshes and `refetch()` for explicit force-refresh UX.
- Avoid putting long-lived `useQuery()` calls in stores unless intentional. A store may keep a query active indefinitely; read the cache from the store when lifecycle ownership should stay with components.

Inspect installed types before assuming option defaults because defaults can change between versions.

## Placeholder and paginated data

For numbered pagination, include the page and filters in the key so each page is independently cached:

```ts
useQuery({
  key: () => ['contacts', 'page', page.value],
  query: () => api.contacts.page(page.value),
  placeholderData: (previousData) => previousData,
})
```

Treat placeholder data as display continuity, not confirmed data for the new key. Use `isPlaceholderData` when controls or messaging depend on that distinction.

Use `useInfiniteQuery()` when pages form one growing result:

```ts
const feed = useInfiniteQuery({
  key: ['feed'],
  query: ({ pageParam }) => api.feed.list({ cursor: pageParam }),
  initialPageParam: null as string | null,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})
```

- The cache stores pages and page parameters together.
- Changing the key creates a different infinite-query entry.
- Define `getPreviousPageParam` before calling `loadPreviousPage()`.
- Guard load-more controls with the returned loading and availability state.
- Flatten pages only for presentation; retain the page structure for cache behavior.

## Reusable queries

Use `defineQueryOptions()` for reusable query configuration. Use `defineQuery()` only when a reusable query also needs colocated computed state, watchers, or methods:

```ts
export const useCurrentUser = defineQuery(() => {
  const query = useQuery({
    key: ['users', 'current'],
    query: api.users.current,
  })

  const displayName = computed(() => query.data.value?.name ?? 'Guest')
  return { ...query, displayName }
})
```

Call defined queries within component setup, a store, or an active effect scope so their reactive effects can be disposed.

## Cancellation

Treat cancellation as cooperative. Use the abort signal or cancellation mechanism exposed by the installed version inside the request function, and avoid committing results from obsolete requests. Cancel relevant in-flight work before an optimistic cache write when an older response could overwrite it.

Official topics: [Queries](https://pinia-colada.esm.dev/guide/queries.html), [Query keys](https://pinia-colada.esm.dev/guide/query-keys.html), and [Infinite queries](https://pinia-colada.esm.dev/guide/infinite-queries.html).
