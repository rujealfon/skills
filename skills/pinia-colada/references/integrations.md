# Integrations, testing, and migration

Use this reference for application setup, Nuxt, custom SSR, plugins, persistence, testing, and migrations.

## Vue application setup

Install Pinia before Pinia Colada:

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { PiniaColada } from '@pinia/colada'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(PiniaColada, {
  queryOptions: {
    staleTime: 0,
  },
  mutationOptions: {},
  plugins: [],
})

app.mount('#app')
```

Preserve an application's existing bootstrap structure. Install optional development tools only when requested or consistent with the repository; do not add production devtools automatically.

## Nuxt

Use the official Nuxt modules:

```ts
export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '@pinia/colada-nuxt'],
})
```

Check the installed module names and configuration types before editing because module packaging may vary by version. Put Pinia Colada options in `colada.options.ts` when supported:

```ts
import type { PiniaColadaOptions } from '@pinia/colada'

export default {
  queryOptions: {
    staleTime: 30_000,
  },
} satisfies PiniaColadaOptions
```

In Nuxt, `useQuery()` participates in SSR through server-prefetch integration, so it generally does not need top-level `await`. Await `refresh()` only when navigation must block until data resolves. Use `enabled` to suppress a query on the server or until required inputs exist.

Use Nuxt-native `useFetch`/`useAsyncData` for simple page-local requests when their lifecycle is sufficient. Prefer Pinia Colada for shared cached data, mutations, optimistic updates, invalidation, or cross-component deduplication.

## Custom SSR

Follow Pinia SSR setup first. A custom renderer must additionally serialize and hydrate Pinia Colada's query-cache tree with the installed helpers such as `isQueryCache`, `serializeQueryCache`, and `hydrateQueryCache`.

Install Pinia and Pinia Colada before hydrating. Treat custom errors as custom serialized types.

Prevent server garbage-collection timers from surviving a request:

```ts
import {
  PiniaColada,
  PiniaColadaSSRNoGc,
  useQueryCache,
} from '@pinia/colada'

app.use(PiniaColada, {
  plugins: [PiniaColadaSSRNoGc()],
})

// Clear the request-scoped cache after rendering.
useQueryCache(pinia).caches.clear()
```

The Nuxt module handles SSR cache serialization, disables server GC timers, and clears request cache automatically. In custom SSR, never share one Pinia/query cache across user requests.

## Plugins

Register plugins during `PiniaColada` installation. Order matters when plugins observe or extend the same cache actions.

Built-in query hooks can centralize logging, analytics, and declarative error messages stored in query `meta`. Optional official packages cover retry, auto-refetch, loading delay, and cache persistence. Inspect the installed plugin package's types before using its options.

Keep these constraints in mind:

- Retry only failures that are safe and likely transient; avoid retrying validation or most authorization errors.
- Give auto-refetch a meaningful interval or `staleTime`, and avoid server timers.
- Use loading delay to prevent refresh flicker without hiding the initial pending state.
- Persist only serializable, non-sensitive entries. Version or invalidate persisted data when schemas or user identity change.
- Apply persistence filters so user-specific or short-lived data does not leak across sessions.

Write a custom plugin only when behavior truly belongs at the cache layer. Prefer public hooks and APIs over direct mutation of internal entries.

## Testing

For component tests, mount with a new Pinia and Pinia Colada instance for every test:

```ts
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { PiniaColada } from '@pinia/colada'
import type { Component } from 'vue'

export function mountWithData(component: Component) {
  return mount(component, {
    global: {
      plugins: [createPinia(), PiniaColada],
    },
  })
}
```

- Do not reuse the query cache between tests.
- Prefer MSW or the project's existing network boundary for integration-like component tests.
- Use mocked query/mutation functions for narrow unit tests.
- Flush promises after initial query execution, mutations, invalidation, and refetches.
- Assert pending/loading, success, and error states.
- For cache behavior, verify deduplication, stale/fresh behavior, invalidation scope, and cleanup.
- For optimistic mutations, test success reconciliation, rollback, and overlapping operations.
- For SSR, verify no cross-request cache reuse and correct hydration without a duplicate request.

## Migration

When migrating from TanStack Vue Query:

1. Inventory query keys, default options, lifecycle callbacks, cache calls, infinite queries, persistence, and SSR behavior.
2. Move keys into serializable hierarchical arrays and shared factories.
3. Convert reads to `useQuery()` and writes to `useMutation()`.
4. Map freshness and garbage-collection semantics deliberately; do not assume option names share identical defaults.
5. Replace per-query side-effect callbacks with mutation hooks, query-hook plugins, watchers, or component logic as appropriate.
6. Convert invalidation filters and optimistic updates against Pinia Colada's cache API.
7. Migrate infinite-query page parameters and direction behavior explicitly.
8. Run both implementations behind targeted tests before removing the old provider and dependencies.

Use compatibility helpers only as a temporary bridge when the installed Pinia Colada version provides them. Avoid preserving an abstraction that hides semantic differences indefinitely.

Official topics: [Nuxt](https://pinia-colada.esm.dev/nuxt.html), [SSR](https://pinia-colada.esm.dev/guide/ssr.html), and [Testing](https://pinia-colada.esm.dev/cookbook/testing.html).
