# Audit Skill

Audit agent skills in a skills.sh catalog against official upstream docs
and this repo's skill-design bar.

## Version

- Skill version: **1.0.1** — see [CHANGELOG.md](CHANGELOG.md)
- Tracks: none — process skill, no upstream package
- Docs: none

## Installation

Install the skill with:

```bash
npx skills add rujealfon/skills --skill audit-skill
```

Then ask your agent:

```text
Use $audit-skill to audit every skill in this catalog against official docs and apply ranked fixes.
```

## Coverage

The workflow: clock (`scripts/check-versions.mjs` when present), coverage map from the library `llms.txt`, Context7 examples, live pages for version-sensitive claims, tagged findings (`wrong`/`gap`/`stale`/`design`/`skip`), ranked apply, CHANGELOG "Won't add".

## Contents

- [SKILL.md](SKILL.md) contains the core agent workflow.
- [references/findings.md](references/findings.md) covers finding tags, skip classes, and how to version the result.

## License

Repository content is available under the root [MIT License](../../LICENSE).
