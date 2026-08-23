# Findings and apply rules

## Tags

- `wrong:` contradicts current docs or types **on the tracked line**. Fix.
- `gap:` official topic an agent will hit that the skill omits or waves at. Add only if it changes agent behavior.
- `stale:` version, date, link, or status that has drifted (including RC notes written against an older RC).
- `design:` sprawl, duplication, no-ops, weak description, missing slash-command trigger (`/skill-name`), fact living in two files.
- `skip:` official topic we will not add. One-line why, then record it under **Won't add** in that skill's CHANGELOG.

A live-docs API that is **not in the tracked version** is `skip` (or a WATCH note), not `gap`. Canary/RC-only features stay off the stable recipe.

## Rank and apply

1. `wrong` / `stale`
2. agent-useful `gap`
3. cheap `design`

No standing `AUDIT.md`. Findings that ship become CHANGELOG entries. `skip` becomes a **Won't add** line on that skill.

## Skip classes

These almost never earn a page: ecosystem/community catalogs, blog posts, lint/GraphQL extras outside the skill's stated scope, flipping a primary target while `check-versions` still says `WATCH`.

## Versioning (this catalog)

Skill version and Tracks live in that skill's `README.md` / `CHANGELOG.md`, never in `SKILL.md` frontmatter.

- **Patch** (`1.0.1`) — wording, link, or accuracy fixes on the same coverage.
- **Minor** (`1.1.0`) — new coverage on the same tracked line.
- **Major** — restructure or a breaking convention change.
- Refresh the `- Tracks:` verified-on date only for packages actually re-checked.
- `WATCH`: keep the current line as the primary target; put the coming break in the existing migration/notes file.
- `STALE`: re-verify, then flip the tracked line.

Process skills declare `- Tracks: none` so `scripts/check-versions.mjs` skips them. Package skills declare `- Docs: https://...` (the official llms.txt or equivalent); process skills declare `- Docs: none`.

Align `agents/openai.yaml` `default_prompt` with the README "Then ask your agent" example — one home.

## Description bar

A model-invoked skill description states what it does, the distinct trigger branches, and `Use when the user runs /<name>`.
