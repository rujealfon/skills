# Agent Skills

A skills.sh-compatible catalog of reusable agent skills maintained in this
repository.

## Available skills

| Skill | Description | Version | Tracks |
| --- | --- | --- | --- |
| [Audit Skill](skills/audit-skill/README.md) | Audit catalog skills against official upstream docs and this repo's skill-design bar. | 1.0.1 | none |
| [Drizzle Postgres](skills/drizzle-postgres/README.md) | Build, migrate, query, and troubleshoot PostgreSQL data layers with Drizzle ORM and Drizzle Kit. | 1.1.0 | `drizzle-orm` 0.45.x / `drizzle-kit` 0.31.x (2026-08-23) |
| [Pinia Colada](skills/pinia-colada/README.md) | Build, review, migrate, test, and troubleshoot async data workflows with Pinia Colada in Vue and Nuxt applications. | 1.0.1 | `@pinia/colada` 1.x (2026-08-23) |
| [Zod](skills/zod/README.md) | Define, validate, and parse data with Zod (v4) — schemas, refinements/transforms, error handling, codecs, JSON Schema conversion, and Zod 3 → 4 migration. | 1.1.0 | `zod` 4.x (2026-08-23) |

## Versioning

Each skill carries two independent version signals, recorded in its own `README.md` and `CHANGELOG.md` — never in `SKILL.md`'s frontmatter, since that gets loaded into context every time the skill triggers and neither number affects triggering:

- **Skill version** — semver for the skill's own content (the instructions and references we wrote), bumped by us. Patch for wording/reference fixes, minor for new coverage, major for a restructure or a breaking convention change.
- **Tracks** — the major (or, for pre-1.0 packages, minor) line of the upstream package the skill was last verified against, plus the date of that check. This is what tells you whether a skill is due for a refresh: if the installed package has moved to a new major/minor since the "tracks" date, re-verify the skill's guidance against the current docs before trusting it blindly, and bump both the tracked line and the skill version when you update it.

When adding a new skill, start it at `1.0.0`, record what you verified it against, and add a `CHANGELOG.md` alongside its `README.md`.

### Adding a skill

1. `skills/<name>/SKILL.md` with `name` + `description` (include `Use when the user runs /<name>`). Keep supporting docs in that directory.
2. `README.md` with skill version, `- Tracks:` (or `none`), and `- Docs:` (llms.txt URL, or `none`).
3. `CHANGELOG.md` starting at `1.0.0`.
4. `agents/openai.yaml` if the skill should be implicitly invokable for OpenAI agents.
5. One row in the **Available skills** table above.

### Declaring tracked packages

Each skill README declares its tracked packages as one line per package, in this exact form so they can be checked automatically:

```text
- Tracks: `<package>` <line> — verified against <version> on <YYYY-MM-DD>
```

`<line>` is `4.x` for a package past 1.0 (a major line), or `0.45.x` for a pre-1.0 package where minor bumps are breaking. A skill tracking several packages gets several `- Tracks:` lines. A process skill with no upstream package declares `- Tracks: none` instead, so the checker skips it instead of treating a missing package line as an error.

The official docs map is one line, required on every package skill:

```text
- Docs: https://zod.dev/llms.txt
```

Process skills declare `- Docs: none`. The checker requires a `https://` Docs line whenever it sees a package Tracks line; it does not fetch the URL.

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

It exits non-zero on `STALE` (or an unreadable README) so it can gate CI, and zero on `WATCH`/`BEHIND`/`SKIP` since none of those mean the skill is currently wrong.

CI (`.github/workflows/check-versions.yml`) runs the script every Monday and on pull requests that touch a skill README or the script itself. The Monday (and manual) run also opens or updates a single GitHub issue titled `skills WATCH/STALE` so a coming break is visible even though `WATCH` does not fail the job; it closes that issue when nothing is WATCH or STALE.

## Installation

Install a skill by its directory name:

```bash
npx skills add rujealfon/skills --skill <skill-name>
```

For example:

```bash
npx skills add rujealfon/skills --skill pinia-colada
```

## License

Original repository content is available under the [MIT License](LICENSE).
