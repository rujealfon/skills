---
name: audit-skill
description: Audit agent skills in a skills.sh catalog against official upstream docs: llms.txt, Context7, and live API pages, plus the skill-design bar. Use when the user says "audit our skills", "full audit", "refresh this skill against the docs", "is this skill stale", or runs /audit-skill. Also use when check-versions reports STALE or WATCH and the skill content needs a docs-backed refresh, not just a date bump.
---

# Audit catalog skills

Audit the skills in this catalog against current official docs, or just the named subset, then apply ranked fixes unless the user asked for a report only.

## Start from the catalog

1. List `skills/*/SKILL.md`. If the user named skills, restrict to those; otherwise audit every skill that declares a `- Tracks:` package line. Skip process skills that declare `- Tracks: none`.
2. Run `node scripts/check-versions.mjs` when that script exists. `CURRENT` still gets a docs pass if the user asked for a full audit; `BEHIND` is usually a date/changelog skim; `WATCH` means document the coming break without flipping the primary target; `STALE` means re-verify before trusting the skill.
3. For each target, read `SKILL.md`, `README.md` with its `- Tracks:`, `- Docs:`, and won't-add lines, `CHANGELOG.md`, and every `references/*.md`. The `- Docs:` URL is that skill's coverage map. Start there instead of rediscovering the llms.txt path.

## Read the relevant reference

- [references/findings.md](references/findings.md): finding tags, ranking, skip classes, how to apply and version.

## Audit against official docs

For each target skill, treat this order as the source of truth for API claims:

1. The skill's tracked line. Installed types in a consumer repo remain the runtime authority the skill already teaches.
2. The `- Docs:` URL in that skill's README as the coverage map, usually an `llms.txt`. Verify every URL you cite returns 200. Dialect-prefixed paths in an llms.txt can 404.
3. Context7 for executable examples, using `resolve-library-id` then `query-docs`.
4. The live official page when a claim is version-sensitive: a new major, an RC, or a method the llms.txt lists but the tracked line does not ship.

Tag every finding `wrong`, `gap`, `stale`, `design`, or `skip` as defined in [references/findings.md](references/findings.md). Confirm suspected findings against the source; do not treat the previous audit's memory as evidence.

Do not copy official docs into the skill. Add a fact only when it changes what the agent would write.

## Apply unless report-only

Ranked: `wrong`/`stale` first, then agent-useful `gap`, then cheap `design`. Leave `skip` in that skill's CHANGELOG as a one-line "Won't add" so the next run does not rediscover it.

Keep the target skill's workflow shape. New facts go in the reference that already owns the topic. Re-check `skill-design-principles` on the diff so each fact lives in one place and no sentence does nothing.

## Verify

- `node scripts/check-versions.mjs` still parses every README.
- Every URL added in this pass returns 200.
- Code samples match the official page or Context7, not memory.
- CHANGELOG/README Tracks date and skill version match the apply rules.
