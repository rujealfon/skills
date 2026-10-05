# Resolving merge conflicts

Resolve an in-progress git merge or rebase conflict.

## Version

- Skill version: **1.0.0**. See [CHANGELOG.md](CHANGELOG.md)
- Tracks: none, process skill with no upstream package
- Docs: none

## Installation

Install the skill with:

```bash
npx skills add rujealfon/skills --skill resolving-merge-conflicts
```

Then ask your agent:

```text
Use $resolving-merge-conflicts to finish this in-progress merge or rebase.
```

## Coverage

Read the conflicted state, trace each side to its source, preserve both intents, run the project's checks, and finish the merge or rebase.

## Contents

- [SKILL.md](SKILL.md) contains the core agent workflow.

## License

Repository content is available under the root [MIT License](../../LICENSE).
