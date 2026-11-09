import { readdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const lists = await Promise.all(
    entries.map((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name))),
  )
  return lists.flat()
}
const files = (await walk('dist')).filter((f) => !f.endsWith('sw.js')).sort()
const hash = createHash('sha256')
for (const f of files) hash.update(await readFile(f))
const cacheName = `paradise-${hash.digest('hex').slice(0, 16)}`
const urls = files.map((f) => '/' + path.relative('dist', f).replaceAll('\\', '/'))
await writeFile(
  'dist/sw.js',
  `
const CACHE = ${JSON.stringify(cacheName)};
const ASSETS = ${JSON.stringify(urls)};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('paradise-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(caches.open(CACHE).then(cache => cache.match('/index.html')).then(cached => cached || fetch(event.request)));
    return;
  }
  // Static same-origin assets are identical regardless of the Origin header.
  // Module-script requests carry it; precache requests may not (Vary: Origin).
  event.respondWith(caches.open(CACHE).then(cache => cache.match(event.request, { ignoreVary: true })).then(cached => cached || fetch(event.request)));
});
`,
)
console.log(`Offline cache: ${urls.length} assets, ${cacheName}`)
