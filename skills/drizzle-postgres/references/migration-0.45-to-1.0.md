# Migrating Drizzle 0.45.x → 1.0

> **Status: draft, written against `drizzle-orm`/`drizzle-kit` 1.0.0-rc.4.** As of 2026-08-22 the stable release is still 0.45.x, and 1.0 is in release candidate. Everything below was verified by inspecting and running the installed RC, but an RC can still change before it ships. Treat the installed package as the authority, and prefer 0.45.x guidance for any project that hasn't deliberately opted into the RC.

Drizzle 1.0 is the first release to break the schema-definition API in a way that silently changes generated SQL rather than producing a type error. The two changes that matter most — casing and relations — are covered first.

## Contents

- [Casing moved from config to table builders](#casing-moved-from-config-to-table-builders)
- [RQBv1 removed: `relations()` is gone](#rqbv1-removed-relations-is-gone)
- [`drizzle()` config shape changed](#drizzle-config-shape-changed)
- [Additive changes worth knowing](#additive-changes-worth-knowing)
- [Migration checklist](#migration-checklist)

## Casing moved from config to table builders

In 0.45.x, camelCase→snake_case column mapping was a single global setting, passed to `drizzle()` and to `drizzle.config.ts`:

```typescript
// 0.45.x — one global switch
const db = drizzle(client, { schema, casing: 'snake_case' });
```

In 1.0 that option no longer exists in either place. Casing is chosen per table by importing a casing-specific builder from `drizzle-orm/pg-core`:

```typescript
// 1.0 — casing is a property of the table
import { snakeCase, camelCase, pgTable, text, integer } from 'drizzle-orm/pg-core';

export const users = snakeCase.table('users', {
  firstName: text(),      // -> "first_name"
  userId: integer(),      // -> "user_id"
  explicit: text('kept_as_is'),  // explicit names always win
});
```

Verified behavior for a column declared without an explicit name:

| Builder | `firstName` becomes |
| --- | --- |
| `pgTable` | `firstName` (no transform) |
| `snakeCase.table` | `first_name` |
| `camelCase.table` | `firstName` |

An explicitly named column (`text('kept_as_is')`) is never transformed, under any builder.

`snakeCase` and `camelCase` each expose `.table`, `.view`, `.materializedView`, and `.schema` — so a whole schema can adopt one convention via `snakeCase.schema('app')`.

**Why this is the dangerous one:** a project that upgrades to 1.0 while leaving `casing: 'snake_case'` in its config loses the option silently. Every `pgTable` with unnamed columns starts emitting camelCase identifiers, which don't match the existing database. This surfaces as `column "firstName" does not exist` at runtime, not as a type error. When migrating, convert the tables *before* running anything against a real database, and diff a generated migration to confirm no column renames appear.

Note that `drizzle.config.ts` still has an `introspect.casing` option (`'camel' | 'preserve'`) — that is unrelated. It controls how `drizzle-kit pull` names properties in the TypeScript it generates, not how your schema maps to SQL.

### Column builders are single-use

Relevant when writing the migration mechanically: column builder objects are mutable and record their resolved name on first use. Sharing one column-definition object across two tables silently gives the second table the first table's naming:

```typescript
const cols = { firstName: text() };
pgTable('a', cols);          // "firstName"
snakeCase.table('b', cols);  // still "firstName" — the builder was already named
```

Build a fresh object per table (a factory function if the shape repeats).

## RQBv1 removed: `relations()` is gone

In 1.0.0-rc.4, `relations` is no longer exported from `drizzle-orm` or `drizzle-orm/pg-core` — it is `undefined`, so legacy relation blocks fail at import. `defineRelations` is the only relations API.

```typescript
// 0.45.x — removed in 1.0
import { relations } from 'drizzle-orm';

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));
export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
}));
```

```typescript
// 1.0 — one block for the whole schema
import { defineRelations } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
  users: {
    posts: r.many.posts(),
  },
  posts: {
    author: r.one.users({
      from: r.posts.authorId,
      to: r.users.id,
    }),
  },
}));
```

The shape differences that trip people up: `defineRelations` takes the whole schema and returns one object keyed by table (rather than one exported `relations()` call per table), and the field mapping is `from`/`to` rather than `fields`/`references`.

See [relations.md](relations.md) for the full `defineRelations` reference.

## `drizzle()` config shape changed

`DrizzleConfig` in 1.0.0-rc.4 accepts exactly these keys:

```typescript
{
  logger?: boolean | Logger;
  schema?: TSchema;
  relations?: TRelationConfigs;
  cache?: Cache;
  jit?: boolean;
}
```

Compared with 0.45.x: `casing` is gone (see above), and `jit` is new — it toggles the just-in-time compiled row mappers, which the release notes credit with a 25–30% latency reduction on row mapping.

## Additive changes worth knowing

These don't break existing code, but they change what the best answer looks like on a 1.0 project. None are verified in depth here — check the installed types before relying on specifics.

- **Codecs** — unified encode/decode handling for column types across drivers and contexts (plain selects, JSON, arrays), with particular attention to Postgres.
- **SQLCommenter** — `sqlCommenter` is exported from `drizzle-orm`, and queries accept `.comment({ ... })` for attaching metadata to emitted SQL. Useful for tracing a slow query in `pg_stat_statements` back to application code.
- **JIT mappers** — see the `jit` config flag above.
- **Drizzle Kit** — machine-readable JSON output, a programmatic SDK for running migrations, and an MCP server.
- **New drivers** — Turso serverless, Netlify DB, and Effect SQL drivers.

## Migration checklist

1. Confirm the installed version actually is 1.0 (`node -p "require('drizzle-orm/package.json').version"`) — don't migrate a project still on 0.45.x.
2. Find every `casing` option in `drizzle()` calls and `drizzle.config.ts`. For each, decide the equivalent table builder; leaving the option in place is a silent no-op, not an error.
3. Convert `pgTable` → `snakeCase.table` (or `camelCase.table`) for every table that relied on the global setting. Check views, materialized views, and `pgSchema` too.
4. Replace every `relations()` block with a single `defineRelations(schema, ...)`, converting `fields`/`references` to `from`/`to`.
5. Run `drizzle-kit generate` and **read the resulting SQL**. A correct migration should be empty or contain only the changes you intended. Any unexpected `ALTER TABLE ... RENAME COLUMN` means a casing conversion was missed.
6. Run the project's typecheck, then exercise a query per converted table against a real database — casing mistakes are runtime errors, so typecheck alone will not catch them.
