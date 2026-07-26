// decisions.md — the grammar, in one place.
//
// Two consumers import this: decisions.html renders from it, and
// scripts/check-decisions.mjs validates against it. That is the whole point of
// the file. A validator with its own copy of the regex would drift from the
// renderer, and then the record would pass its own checks while displaying
// something else — the exact failure mode this document exists to prevent.
//
// Pure: takes a string, returns data. No fs, no fetch, no DOM, so it runs
// unchanged in Node and in the browser.

export const ATTRIBUTION = ['human', 'measured', 'ai']
export const QUALITY = ['reversal', 'structural', 'notable', 'minor']

export const WHO = { human: 'Human', measured: 'Measured', ai: 'AI' }
export const QUAL = {
  minor: 'Minor', notable: 'Notable', structural: 'Structural', reversal: 'Reversal'
}
export const WHO_LONG = {
  human: 'a human call',
  measured: 'settled by measurement',
  ai: 'AI-proposed, human-approved'
}

// `date` · `area` · `who` · `quality?` · `commit?`
// Quality and commit are optional so an entry is never rejected for omitting
// them; quality defaults to notable at render time.
export const META =
  /^`(\d{4}-\d{2}(?:-\d{2})?)`\s*·\s*`([a-z-]+)`\s*·\s*`(human|measured|ai)`(?:\s*·\s*`(minor|notable|structural|reversal)`)?(?:\s*·\s*`([0-9a-f]{7,40})`)?$/

// Areas that are not decisions and are exempt from the Ruled-out requirement.
export const MILESTONE = 'milestone'
export const PREHISTORY = 'prehistory'

export const isDecision = e =>
  e.meta && e.meta.area !== MILESTONE && e.meta.area !== PREHISTORY

export function parse (md) {
  const lines = md.split('\n')
  const entries = []
  let section = null, cur = null
  const close = () => { if (cur) { entries.push(cur); cur = null } }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      close()
      const raw = line.slice(3).trim()
      const m = /^(\d+)\.\s*(.+)$/.exec(raw)
      section = m ? { num: m[1], name: m[2] } : { num: null, name: raw }
      continue
    }

    if (line.startsWith('### ')) {
      close()
      cur = { title: line.slice(4).trim(), section, raw: [], meta: null, line: i + 1 }
      // Metadata is the next non-blank line. A miss is surfaced, never
      // swallowed: silent drops are the failure this document prevents.
      let j = i + 1
      while (j < lines.length && !lines[j].trim()) j++
      const m = META.exec((lines[j] || '').trim())
      if (m) {
        cur.meta = {
          date: m[1], area: m[2], attribution: m[3],
          quality: m[4] || null, commit: m[5] || null
        }
        cur.metaRaw = (lines[j] || '').trim()
        i = j
      } else {
        cur.metaRaw = (lines[j] || '').trim()
      }
      continue
    }

    if (cur) cur.raw.push(line)
  }
  close()

  for (const e of entries) {
    const body = [], fields = {}
    let sink = body
    for (const l of e.raw) {
      const m = /^\*\*(Ruled out|Cost):\*\*\s*(.*)$/.exec(l)
      if (m) { sink = fields[m[1]] = [m[2]]; continue }
      if (sink === body) body.push(l)
      else if (l.trim()) sink.push(l)
      else sink = body
    }
    e.body = body
    e.ruled = fields['Ruled out'] || null
    e.cost = fields['Cost'] || null
  }
  return entries
}

// The attribution split, so the prose in the header can be generated rather
// than hand-maintained. It drifted three times in a single afternoon.
export function split (entries) {
  const out = { human: 0, measured: 0, ai: 0, total: 0 }
  for (const e of entries.filter(isDecision)) {
    out.total++
    out[e.meta.attribution]++
  }
  return out
}

export const SPLIT_RE =
  /The split as it stands, across the \d+ decisions: \*\*\d+ human · \d+ measured · \d+ ai\*\*\./

export const splitSentence = s =>
  `The split as it stands, across the ${s.total} decisions: ` +
  `**${s.human} human · ${s.measured} measured · ${s.ai} ai**.`

// Structural problems only. Nothing here judges whether the reasoning is any
// good — that cannot be automated, and pretending otherwise would be worse
// than not checking at all.
export function validate (entries, md = '') {
  const problems = []
  const add = (entry, msg) =>
    problems.push({ line: entry ? entry.line : null, title: entry ? entry.title : '', msg })

  const seen = new Map()

  for (const e of entries) {
    if (!e.meta) {
      add(e, `metadata line does not parse: ${JSON.stringify(e.metaRaw || '(missing)')}`)
      continue
    }
    const { area, quality, date } = e.meta

    if (isDecision(e) && !e.ruled) {
      add(e, 'no "**Ruled out:**" — if it ruled nothing out it is a fact, not a decision')
    }
    if (isDecision(e) && !quality) {
      add(e, 'no quality field (defaults to notable, but say it explicitly)')
    }
    if (!e.body.some(l => l.trim())) {
      add(e, 'no body — the reasoning is the point')
    }
    if (/^\d{4}-\d{2}$/.test(date) && area !== PREHISTORY) {
      add(e, `month-precision date ${date} is only allowed for prehistory`)
    }

    const key = e.title.toLowerCase()
    if (seen.has(key)) add(e, `duplicate title, also at line ${seen.get(key)}`)
    else seen.set(key, e.line)
  }

  if (md) {
    const s = split(entries)
    const found = md.match(SPLIT_RE)
    if (!found) problems.push({ line: null, title: '', msg: 'header split sentence missing' })
    else if (found[0] !== splitSentence(s)) {
      problems.push({
        line: null, title: '',
        msg: `header split is stale.\n      is:     ${found[0]}\n      should: ${splitSentence(s)}`
      })
    }
  }

  return problems
}
