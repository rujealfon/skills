# Agent Skills

A skills.sh-compatible catalog of reusable agent skills maintained in this
repository.

## Available skills

| Skill | Description | Version | Tracks |
| --- | --- | --- | --- |
| [Drizzle Postgres](skills/drizzle-postgres/README.md) | Build, migrate, query, and troubleshoot PostgreSQL data layers with Drizzle ORM and Drizzle Kit. | 1.1.0 | `drizzle-orm` 0.45.x / `drizzle-kit` 0.31.x (2026-08-23) |
| [Pinia Colada](skills/pinia-colada/README.md) | Build, review, migrate, test, and troubleshoot async data workflows with Pinia Colada in Vue and Nuxt applications. | 1.0.1 | `@pinia/colada` 1.x (2026-08-23) |
| [Zod](skills/zod/README.md) | Define, validate, and parse data with Zod (v4) — schemas, refinements/transforms, error handling, codecs, JSON Schema conversion, and Zod 3 → 4 migration. | 1.1.0 | `zod` 4.x (2026-08-23) |

## Versioning

Each skill carries two independent version signals, recorded in its own `README.md` and `CHANGELOG.md` — never in `SKILL.md`'s frontmatter, since that gets loaded into context every time the skill triggers and neither number affects triggering:

- **Skill version** — semver for the skill's own content (the instructions and references we wrote), bumped by us. Patch for wording/reference fixes, minor for new coverage, major for a restructure or a breaking convention change.
- **Tracks** — the major (or, for pre-1.0 packages, minor) line of the upstream package the skill was last verified against, plus the date of that check. This is what tells you whether a skill is due for a refresh: if the installed package has moved to a new major/minor since the "tracks" date, re-verify the skill's guidance against the current docs before trusting it blindly, and bump both the tracked line and the skill version when you update it.

When adding a new skill, start it at `1.0.0`, record what you verified it against, and add a `CHANGELOG.md` alongside its `README.md`.

### Declaring tracked packages

Each skill README declares its tracked packages as one line per package, in this exact form so they can be checked automatically:

```text
- Tracks: `<package>` <line> — verified against <version> on <YYYY-MM-DD>
```

`<line>` is `4.x` for a package past 1.0 (a major line), or `0.45.x` for a pre-1.0 package where minor bumps are breaking. A skill tracking several packages gets several `- Tracks:` lines.

### Checking for updates

```bash
node scripts/check-versions.mjs          # human-readable
node scripts/check-versions.mjs --json   # machine-readable
```

The script reads the `- Tracks:` lines out of every skill README — they stay the single source of truth — and compares them against what npm currently publishes. Each package lands in one of four states:

| State | Meaning | Action |
| --- | --- | --- |
| `CURRENT` | Latest stable is the version we verified against | None |
| `BEHIND` | Newer release within the tracked line | Skim the changelog; usually a metadata-only refresh |
| `WATCH` | A prerelease of a *newer* line exists upstream | A break is coming — don't rewrite yet, but plan for it |
| `STALE` | Latest stable has moved off the tracked line | Re-verify the skill's guidance before trusting it |

It exits non-zero on `STALE` (or an unreadable README) so it can gate CI, and zero on `WATCH`/`BEHIND` since neither means the skill is currently wrong.

## Installation

Install a skill by its directory name:

```bash
npx skills add rujealfon/skills --skill <skill-name>
```

For example:

```bash
npx skills add rujealfon/skills --skill pinia-colada
```

## Adding a skill

Place each skill in its own `skills/<skill-name>/` directory with a
`SKILL.md`. Keep skill-specific usage, installation examples, and supporting
documentation inside that directory.

When adding another skill, add one row to the **Available skills** table above
and link to its README.

## License

Original repository content is available under the [MIT License](LICENSE).
