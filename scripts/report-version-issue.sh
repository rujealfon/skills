#!/usr/bin/env bash
# Open, update, or close the single "skills WATCH/STALE" issue from
# check-versions --json output. Used by the Monday workflow, not by PRs.
set -euo pipefail

TITLE='skills WATCH/STALE'
JSON="${1:-versions.json}"

if [[ ! -f "$JSON" ]]; then
  echo "missing $JSON" >&2
  exit 1
fi

needs=$(JSON="$JSON" node --input-type=module -e '
import { readFileSync } from "node:fs"
const results = JSON.parse(readFileSync(process.env.JSON, "utf8"))
const hits = results.filter((r) => r.status === "WATCH" || r.status === "STALE")
process.stdout.write(hits.length ? "yes" : "no")
')

body=$(JSON="$JSON" node --input-type=module -e '
import { readFileSync } from "node:fs"
const results = JSON.parse(readFileSync(process.env.JSON, "utf8"))
const run = process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
  ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
  : null
const lines = [
  "Tracked skills need attention.",
  "",
  run ? `Run: ${run}` : `Checked: ${new Date().toISOString().slice(0, 10)}`,
  "",
]
for (const r of results.filter((s) => s.status === "WATCH" || s.status === "STALE")) {
  lines.push(`- **${r.skill}** — ${r.status}`)
  for (const p of r.packages ?? []) {
    if (p.status === "WATCH" || p.status === "STALE") {
      lines.push(`  - \`${p.pkg}\` ${p.line}: ${p.detail}`)
    }
  }
}
lines.push("", "Next: \`/audit-skill\`. Do not flip a primary target on WATCH.")
process.stdout.write(lines.join("\n") + "\n")
')

existing=$(gh issue list --state all --limit 50 --json number,title,state \
  --jq ".[] | select(.title==\"$TITLE\") | [.number,.state] | @tsv" | head -n 1)

if [[ "$needs" == "yes" ]]; then
  tmp=$(mktemp)
  printf '%s' "$body" > "$tmp"
  if [[ -z "$existing" ]]; then
    gh issue create --title "$TITLE" --body-file "$tmp"
  else
    number=${existing%%$'\t'*}
    state=${existing#*$'\t'}
    if [[ "$state" == "CLOSED" ]]; then
      gh issue reopen "$number"
    fi
    gh issue edit "$number" --body-file "$tmp"
  fi
  rm -f "$tmp"
else
  if [[ -n "$existing" ]]; then
    number=${existing%%$'\t'*}
    state=${existing#*$'\t'}
    if [[ "$state" == "OPEN" ]]; then
      gh issue close "$number" --comment "All tracked skills are CURRENT, BEHIND, or SKIP."
    fi
  fi
fi
