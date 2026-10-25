---
name: ask-an-agent
description: Answer a question read-only, delegating to a read-only subagent when the tool supports one, with no file edits. Use when the user says "ask an agent", "ask-an-agent", "just answer", "don't change anything", "read-only question", or asks how/where/why something works in the codebase and wants an answer without code changes, even if they don't name the skill.
---

# Ask an Agent

Answer the user's question using read-only means only. Do not edit, write, move, or delete files, and do not run commands that change state (no installs, commits, formatters, migrations). The user wants information, so changes would surprise them.

## Steps

1. Restate the question as a self-contained assignment: objective, relevant paths or terms, and the evidence expected (file:line references, doc links).
2. If your coding agent (CLI, IDE, or app) can spawn subagents, hand the assignment to one restricted to read-only tools (search, read, web lookup). Choose by question type:
   - Lookup, factual check, or docs question: a lightweight search/lookup agent.
   - Tracing behavior across many files: an exploration agent. Paste in any project constraints that matter, since some built-in agents skip the project's instruction files.
   - Design or trade-off question: a reasoning/consulting agent. Gather the relevant files first and put them in the assignment.
   If no subagent is available, investigate yourself with read-only tools.
3. Tell the agent it is read-only and must not delegate further. Give a tool-call budget for narrow questions.
4. Check the claims that matter against the cited code or sources, then answer concisely with `file_path:line_number` references.

## Boundaries

- If answering seems to require a change, describe the change in prose and ask whether to proceed. Do not make it.
- If the agent returns partial or no results, ask it to report from what it has, listing what it did not verify. Do not restart it.
- Say plainly when something could not be verified.
