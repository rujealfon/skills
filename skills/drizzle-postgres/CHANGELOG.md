# Changelog

Versions here track this skill's own content (instructions and references), not the `drizzle-orm`/`drizzle-kit` package versions — see the [README](README.md#version) for which lines this skill was last verified against.

## Unreleased

Add `references/migration-0.45-to-1.0.md` covering the Drizzle 1.0 breaking changes, verified against `drizzle-orm`/`drizzle-kit` 1.0.0-rc.4: casing moved from the global `casing` option to per-table `snakeCase.table(...)`/`camelCase.table(...)` builders, the legacy `relations()` export removed in favour of `defineRelations`, and the reduced `DrizzleConfig` shape (with the new `jit` flag).

Make the version-sensitive guidance in `SKILL.md`, `references/schema.md`, `references/migrations.md`, and `references/relations.md` state which line it applies to, so the skill stays correct on 0.45.x while covering 1.0.

0.45.x remains the primary target — this is groundwork for when 1.0 ships stable, not a switch to it.

## 1.0.0 - 2026-08-22

Initial versioned release. Covers schema definition, both the legacy `relations()` and newer `defineRelations()` relational APIs, queries, migrations, connections, and Postgres-specific features (indexes, RLS, extensions, etc.). Verified against `drizzle-orm` 0.45.2 / `drizzle-kit` 0.31.10.
