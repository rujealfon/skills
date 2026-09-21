# Audit skill

Audit agent skills in a skills.sh catalog against official upstream docs
and this repo's skill-design bar.

## Version

- Skill version: **1.0.1**. See [CHANGELOG.md](CHANGELOG.md)
- Tracks: none, process skill with no upstream package
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

The workflow runs `scripts/check-versions.mjs` when present, reads the library `llms.txt` as the coverage map, queries Context7 for examples, checks live pages for version-sensitive claims, tags findings as `wrong`, `gap`, `stale`, `design`, or `skip`, applies fixes in rank order, and records "Won't add" in the CHANGELOG.

## Contents

- [SKILL.md](SKILL.md) contains the core agent workflow.
- [references/findings.md](references/findings.md) covers finding tags, skip classes, and how to version the result.

## License

Repository content is available under the root [MIT License](../../LICENSE).
