#!/usr/bin/env node
// Prerenders one static Open Graph page per gradient into palette/g/<slug>.html.
//
// GitHub Pages serves these as real text/html, so link crawlers (iMessage,
// Instagram DMs, Slack, etc.) read the OG tags and show a rich card; the page
// then redirects humans on to the app at /palette/#<slug>. The og:image points
// at the Supabase Edge Function, which renders the gradient PNG.
//
// Run:  node scripts/gen-previews.mjs
// No secrets needed — the anon key is public (it already ships in the app
// bundle) and only grants row reads.

import { mkdir, writeFile, readdir, rm } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nkmfbeihddctwmtfbvkr.supabase.co'
const ANON_KEY = process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rbWZiZWloZGRjdHdtdGZidmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NzU4NDcsImV4cCI6MjEwMDU1MTg0N30.uomVGnx9u5Na8y2YBqvOo23QJDzhhOFPxVaj1MP6UvQ'

const APP_BASE = 'https://matthewlew.github.io/palette'
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'palette', 'g')

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ))
}

function page({ slug, name }) {
  const title = esc(name || slug)
  const appUrl = `${APP_BASE}/#${encodeURIComponent(slug)}`
  const ogImage = `${SUPABASE_URL}/functions/v1/preview/og/${encodeURIComponent(slug)}.png`
  const desc = 'A gradient made in palette. Tap to open, remix, and share.'
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title} · palette</title>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:image" content="${ogImage}"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:url" content="${appUrl}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${title}"/>
<meta name="twitter:description" content="${esc(desc)}"/>
<meta name="twitter:image" content="${ogImage}"/>
<link rel="canonical" href="${appUrl}"/>
<meta http-equiv="refresh" content="0; url=${appUrl}"/>
<script>location.replace(${JSON.stringify(appUrl)})</script>
</head><body>Opening ${title}… <a href="${appUrl}">Open palette</a>.</body></html>
`
}

async function fetchAll() {
  const rows = []
  const pageSize = 1000
  for (let from = 0; ; from += pageSize) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/palettes?select=slug,display_name&order=created_at.asc`,
      {
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
          Range: `${from}-${from + pageSize - 1}`,
        },
      },
    )
    if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`)
    const batch = await res.json()
    rows.push(...batch)
    if (batch.length < pageSize) break
  }
  return rows
}

const rows = (await fetchAll()).filter((r) => r.slug)
await rm(OUT_DIR, { recursive: true, force: true })
await mkdir(OUT_DIR, { recursive: true })

let written = 0
for (const r of rows) {
  // Guard against path traversal from any malformed slug.
  if (!/^[a-z0-9-]+$/.test(r.slug)) continue
  await writeFile(join(OUT_DIR, `${r.slug}.html`), page({ slug: r.slug, name: r.display_name }))
  written++
}

const files = await readdir(OUT_DIR)
console.log(`Wrote ${written} preview page(s) to palette/g/ (${files.length} files total).`)
