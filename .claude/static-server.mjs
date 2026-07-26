// Minimal static file server for previewing this site locally.
// Root is absolute and every path is resolved against it, so the server never
// depends on the cwd it was spawned in (the preview harness spawns from a
// directory this process may not be allowed to read).
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const PORT = Number(process.env.PORT || process.argv[2] || 3000)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

createServer(async (req, res) => {
  // Strip the query, decode, and normalize before joining so a request can't
  // escape ROOT with '..' segments.
  let path = normalize(decodeURIComponent(req.url.split('?')[0]))
  if (path.endsWith('/')) path += 'index.html'
  const file = join(ROOT, path)
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end('Forbidden')
    return
  }
  try {
    const body = await readFile(file)
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found')
  }
}).listen(PORT, () => console.log(`serving ${ROOT} on http://localhost:${PORT}`))
