#!/usr/bin/env node
// Checks each skill's tracked upstream packages against what npm currently publishes.
//
// Each skill README declares its tracked packages, one per line, in the form:
//   - Tracks: `<package>` <line> — verified against <version> on <YYYY-MM-DD>
// where <line> is `4.x` (major line) or `0.45.x` (major.minor line, for pre-1.0
// packages where minor bumps are breaking). The README is the single source of
// truth; this script only reads it.
//
// Usage: node scripts/check-versions.mjs [--json]

import { execFile } from 'node:child_process'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const SKILLS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills')

const TRACKS_RE =
  /^- Tracks: `(?<pkg>[^`]+)` (?<line>[\d.]+\.x) — verified against (?<version>\S+) on (?<date>\d{4}-\d{2}-\d{2})/gm

const PRERELEASE_RE = /-(?:alpha|beta|rc|canary|next|dev)/

/** Split "1.2.3" into [1, 2, 3]. Returns null for anything non-numeric. */
function parseVersion(version) {
  const core = version.split('-')[0]
  const parts = core.split('.').map(Number)
  return parts.length === 3 && parts.every(Number.isInteger) ? parts : null
}

/** "0.45.x" -> [0, 45]; "4.x" -> [4]. The prefix a version must match to be in-line. */
function parseLine(line) {
  return line
    .split('.')
    .filter((part) => part !== 'x')
    .map(Number)
}

function isInLine(version, linePrefix) {
  const parsed = parseVersion(version)
  if (!parsed) return false
  return linePrefix.every((part, i) => parsed[i] === part)
}

/** Sort comparator for semver-ish cores, ignoring prerelease ordering. */
function compareVersions(a, b) {
  const pa = parseVersion(a)
  const pb = parseVersion(b)
  if (!pa || !pb) return 0
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i]
  }
  return 0
}

async function npmView(pkg, field) {
  const { stdout } = await execFileAsync('npm', ['view', pkg, field, '--json'], {
    maxBuffer: 32 * 1024 * 1024,
  })
  return JSON.parse(stdout)
}

async function readTrackedPackages() {
  const entries = await readdir(SKILLS_DIR, { withFileTypes: true })
  const skills = []

  for (const entry of entries.filter((e) => e.isDirectory()).sort()) {
    const readmePath = join(SKILLS_DIR, entry.name, 'README.md')
    let readme
    try {
      readme = await readFile(readmePath, 'utf8')
    } catch {
      skills.push({ skill: entry.name, error: 'no README.md' })
      continue
    }

    const tracked = [...readme.matchAll(TRACKS_RE)].map((m) => m.groups)
    if (tracked.length === 0) {
      // Loud rather than silent: an unparseable README means this skill is
      // invisible to the check, which is exactly the failure we want to catch.
      skills.push({ skill: entry.name, error: 'no parseable "- Tracks:" line' })
      continue
    }
    skills.push({ skill: entry.name, tracked })
  }

  return skills
}

async function checkPackage({ pkg, line, version, date }) {
  const linePrefix = parseLine(line)
  const [times, distTags] = await Promise.all([
    npmView(pkg, 'time'),
    npmView(pkg, 'dist-tags'),
  ])

  const published = Object.keys(times).filter((v) => v !== 'created' && v !== 'modified')
  const stable = published.filter((v) => !PRERELEASE_RE.test(v))

  const latestStable = distTags.latest
  const newestInLine = stable
    .filter((v) => isInLine(v, linePrefix))
    .sort(compareVersions)
    .at(-1)

  // A prerelease of a *newer* line is the early-warning signal: upstream is
  // preparing a break that will invalidate skill content once it ships stable.
  const pendingNewerLine = published
    .filter((v) => PRERELEASE_RE.test(v) && !isInLine(v, linePrefix))
    .filter((v) => compareVersions(v, latestStable) > 0)
    .sort(compareVersions)
    .at(-1)

  let status
  let detail
  if (!isInLine(latestStable, linePrefix)) {
    status = 'STALE'
    detail = `latest stable ${latestStable} has moved off the tracked ${line} line`
  } else if (newestInLine && compareVersions(newestInLine, version) > 0) {
    status = 'BEHIND'
    detail = `${newestInLine} available in-line (verified against ${version})`
  } else if (pendingNewerLine) {
    status = 'WATCH'
    detail = `${pendingNewerLine} in prerelease — a breaking line is coming`
  } else {
    status = 'CURRENT'
    detail = `up to date with ${latestStable}`
  }

  return {
    pkg,
    line,
    verifiedVersion: version,
    verifiedOn: date,
    latestStable,
    newestInLine,
    pendingNewerLine,
    status,
    detail,
  }
}

const ICONS = { CURRENT: '✓', BEHIND: '↑', WATCH: '⚠', STALE: '✗', ERROR: '!' }

async function main() {
  const asJson = process.argv.includes('--json')
  const skills = await readTrackedPackages()
  const results = []

  for (const skill of skills) {
    if (skill.error) {
      results.push({ skill: skill.skill, status: 'ERROR', detail: skill.error, packages: [] })
      continue
    }
    const packages = await Promise.all(skill.tracked.map(checkPackage))
    // A skill is only as current as its least-current dependency.
    const worst = ['STALE', 'WATCH', 'BEHIND', 'CURRENT'].find((s) =>
      packages.some((p) => p.status === s),
    )
    results.push({ skill: skill.skill, status: worst, packages })
  }

  if (asJson) {
    console.log(JSON.stringify(results, null, 2))
  } else {
    for (const result of results) {
      console.log(`${ICONS[result.status]} ${result.skill} — ${result.status}`)
      if (result.detail) console.log(`    ${result.detail}`)
      for (const p of result.packages) {
        console.log(`    ${ICONS[p.status]} ${p.pkg} ${p.line}: ${p.detail}`)
      }
      console.log()
    }
  }

  // Non-zero only when something genuinely needs a human: a tracked line that
  // no longer exists upstream, or a README this script cannot read.
  const needsAction = results.some((r) => r.status === 'STALE' || r.status === 'ERROR')
  process.exit(needsAction ? 1 : 0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
