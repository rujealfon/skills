# Ask an agent

Answer a question read-only, delegating to a read-only subagent when the coding agent supports one.

## Version

- Skill version: **1.0.0**. See [CHANGELOG.md](CHANGELOG.md)
- Tracks: none, process skill with no upstream package
- Docs: none

## Installation

Install the skill with:

```bash
npx skills add rujealfon/skills --skill ask-an-agent
```

Then ask your agent:

```text
Use $ask-an-agent to explain how authentication works in this repo, without changing any files.
```

## Coverage

Turn the question into a self-contained assignment, hand it to a read-only subagent (or investigate directly with read-only tools), verify the claims that matter, and answer with file references. Never edits files or runs state-changing commands. Works in any coding agent.

## Contents

- [SKILL.md](SKILL.md) contains the core agent workflow.

## License

Repository content is available under the root [MIT License](../../LICENSE).
