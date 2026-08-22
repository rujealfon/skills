# Drizzle Postgres Skill

Build, migrate, query, and troubleshoot PostgreSQL data layers with Drizzle
ORM and Drizzle Kit.

## Version

- Skill version: **1.0.0** — see [CHANGELOG.md](CHANGELOG.md)
- Tracks: `drizzle-orm` 0.45.x — verified against 0.45.2 on 2026-08-22
- Tracks: `drizzle-kit` 0.31.x — verified against 0.31.10 on 2026-08-22
- **Pending upstream: `drizzle-orm` 1.0** is in release candidate (1.0.0-rc.5, 2026-08-12). The skill still treats 0.45.x as the primary target, since that is what remains stable, but 1.0's breaking changes are documented in [references/migration-0.45-to-1.0.md](references/migration-0.45-to-1.0.md) and the version-sensitive guidance elsewhere now covers both lines. When 1.0 ships stable, re-verify that reference against the release build, flip the primary target, and bump the tracked line.

## Installation

Install the skill with:

```bash
npx skills add rujealfon/skills --skill drizzle-postgres
```

Then ask your agent:

```text
Use $drizzle-postgres to add a users/posts schema with relations to this Postgres project.
```

## Coverage

The skill provides focused guidance for:

- Schema declaration: `pgTable`, Postgres column types, identity/serial columns, enums
- Relations: both the legacy `relations()`/`one()`/`many()` API and the newer `defineRelations()`/`r.one`/`r.many` API, plus the relational query API (`db.query`)
- Queries: select, insert, update, delete, operators, joins, transactions, set operations, dynamic query building
- Migrations: `drizzle.config.ts`, Drizzle Kit commands (`generate`, `migrate`, `push`, `pull`, `check`, `studio`, `export`), custom SQL migrations, seeding
- Driver setup: node-postgres, postgres.js, Neon, Supabase, Vercel Postgres, PGlite, and other providers
- Postgres-specific features: indexes/constraints, views, generated columns, custom types, Row-Level Security, sequences, extensions (pgvector/PostGIS), batch API, read replicas, and Zod/Valibot validation integration

The target project's installed `drizzle-orm`/`drizzle-kit` versions and local
type declarations remain the authority for version-specific APIs — the skill
directs agents to check what's actually installed before relying on a
reference, since the relations API in particular changed between versions.

## Contents

- [SKILL.md](SKILL.md) contains the core agent workflow.
- [references/schema.md](references/schema.md) covers table/column declaration and Postgres column types.
- [references/relations.md](references/relations.md) covers relation declarations and the relational query API.
- [references/queries.md](references/queries.md) covers CRUD, operators, joins, and transactions.
- [references/migrations.md](references/migrations.md) covers Drizzle Kit config, commands, and seeding.
- [references/connections.md](references/connections.md) covers driver setup per provider.
- [references/postgres-advanced.md](references/postgres-advanced.md) covers RLS, sequences, extensions, and validation integration.
- [references/migration-0.45-to-1.0.md](references/migration-0.45-to-1.0.md) covers the 0.45.x → 1.0 breaking changes and migration checklist.

## License

Repository content is available under the root [MIT License](../../LICENSE).
