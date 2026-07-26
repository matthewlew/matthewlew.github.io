#!/usr/bin/env node
// Validate docs/lew-design-system/decisions.md.
//
//   node scripts/check-decisions.mjs          check, exit 1 on problems
//   node scripts/check-decisions.mjs --fix    rewrite the generated split line
//
// The grammar lives in docs/lew-design-system/decisions-parser.mjs and is shared
// with decisions.html, so this checks the record against the same rules the page
// renders it with. A second copy of the regex here would drift, and then the
// record could pass its own checks while displaying something else.
//
// WHAT THIS CANNOT DO: judge whether the reasoning is any good, or whether the
// "Ruled out" line names something real. That is the whole value of the document
// and it is not automatable. This checks structure only. Treat a green run as
// "well-formed", never as "well-reasoned".

import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  parse, validate, split, splitSentence, SPLIT_RE, isDecision
} from '../docs/lew-design-system/decisions-parser.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const MD = join(ROOT, 'docs/lew-design-system/decisions.md')
const fix = process.argv.includes('--fix')

let md = readFileSync(MD, 'utf8')
const entries = parse(md)
const problems = validate(entries, md)

// Referenced commits must actually exist. A hash that has been rebased away
// turns the entry's evidence into a dead end, silently.
const commits = [...new Set(entries.filter(e => e.meta?.commit).map(e => e.meta.commit))]
for (const c of commits) {
  try {
    execFileSync('git', ['cat-file', '-e', `${c}^{commit}`], { cwd: ROOT, stdio: 'ignore' })
  } catch {
    problems.push({ line: null, title: '', msg: `commit ${c} is referenced but not in this repo` })
  }
}

const s = split(entries)

if (fix) {
  const want = splitSentence(s)
  if (SPLIT_RE.test(md) && md.match(SPLIT_RE)[0] !== want) {
    md = md.replace(SPLIT_RE, want)
    writeFileSync(MD, md)
    console.log(`fixed: ${want}`)
  } else {
    console.log('split line already correct')
  }
  process.exit(0)
}

const counts = entries.reduce((a, e) => {
  const k = !e.meta ? 'unparseable' : e.meta.area
  a[k] = (a[k] || 0) + 1
  return a
}, {})

console.log(`decisions.md — ${entries.length} entries, ${s.total} decisions`)
console.log(`  ${s.human} human · ${s.measured} measured · ${s.ai} ai`)
console.log(`  reversals: ${entries.filter(e => e.meta?.quality === 'reversal').length}`)
console.log(`  areas: ${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(', ')}`)
console.log(`  commits referenced: ${commits.length}, all resolve: ${
  problems.some(p => p.msg.includes('not in this repo')) ? 'no' : 'yes'}`)

if (!problems.length) {
  console.log('\nOK — structure valid. (Says nothing about whether the reasoning is sound.)')
  process.exit(0)
}

console.error(`\n${problems.length} problem${problems.length === 1 ? '' : 's'}:\n`)
for (const p of problems) {
  const where = p.line ? `decisions.md:${p.line}` : 'decisions.md'
  console.error(`  ${where}${p.title ? ` — "${p.title}"` : ''}\n      ${p.msg}\n`)
}
console.error('Run with --fix to regenerate the split line. Everything else is by hand.')
process.exit(1)
