# Changelog

This skill is a process skill with no upstream package. See the [README](README.md#version).

## 1.0.1 - 2026-10-25

Narrow the implicit trigger to questions where the user says they want no code changes, name the Claude Code subagents (`runner`, `Explore`, `consultant`) per question type, and spell out the read-only tool set in the README.

## 1.0.0 - 2026-10-25

Initial version. Answer a question read-only: delegate to a read-only subagent when the coding agent has one, otherwise investigate with read-only tools, verify key claims, and never edit files.
