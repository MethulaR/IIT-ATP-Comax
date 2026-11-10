// Writes static HTML for each route so the hero, loader and copy paint before any JS runs.
// Runs after `vite build` and `vite build --ssr src/entry-server.tsx --outDir dist-ssr`.
import { readFile, writeFile, rm, readdir } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const { render } = await import(pathToFileURL(path.resolve('dist-ssr/entry-server.js')).href)
let template = await readFile('dist/index.html', 'utf8')

// Inline the entry stylesheet (about 8 kB gzipped) so first paint needs no extra round trip.
const cssLink = template.match(/<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/)
if (cssLink) {
  const css = await readFile(path.join('dist', cssLink[1]), 'utf8')
  template = template.replace(cssLink[0], `<style>${css}</style>`)
}
// The page is fully prerendered, so the app bundle is fetched after the first frame:
// bandwidth goes to HTML, CSS and fonts first, then hydration takes over.
const entry = template.match(/<script type="module" crossorigin src="(\/assets\/[^"]+\.js)"><\/script>/)
if (entry) {
  template = template.replace(entry[0], '')
  template = template.replace(
    '</body>',
    `  <script>requestAnimationFrame(function(){setTimeout(function(){var s=document.createElement('script');s.type='module';s.crossOrigin='';s.src='${entry[1]}';document.head.appendChild(s)},0)})</script>\n  </body>`,
  )
}
// Preload both Latin font files so the web fonts arrive with the first paint (no swap shift).
const assets = await readdir('dist/assets')
const fonts = assets.filter((f) => /^inter(-tight)?-latin-wght-normal-.*\.woff2$/.test(f))
template = template.replace(
  '<meta name="theme-color"',
  fonts.map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`).join('\n    ') + '\n    <meta name="theme-color"',
)
const site = (template.match(/<link rel="canonical" href="([^"]+?)\/?"/) || [])[1] || ''

const routes = [
  { url: '/', file: 'index.html' },
  { url: '/privacy', file: 'privacy.html', title: 'Privacy policy | CoMax', description: 'How the CoMax website handles your data.' },
  { url: '/404', file: '404.html', title: 'Page not found | CoMax', noindex: true },
]

for (const r of routes) {
  const html = render(r.url)
  let page = template.replace('<div id="root"></div>', `<div id="root" data-route="${r.url}">${html}</div>`)
  if (r.title) page = page.replace(/<title>[^<]*<\/title>/, `<title>${r.title}</title>`).replaceAll(/content="CoMax \| Events and competitions, managed"/g, `content="${r.title}"`)
  if (r.description) page = page.replace(/<meta\s+name="description"\s+content="[^"]*"/, `<meta name="description" content="${r.description}"`)
  if (r.url !== '/') page = page.replaceAll(`href="${site}/"`, `href="${site}${r.url}"`).replaceAll(`content="${site}/"`, `content="${site}${r.url}"`)
  if (r.noindex) page = page.replace('<meta name="theme-color"', '<meta name="robots" content="noindex" />\n    <meta name="theme-color"')
  await writeFile(path.join('dist', r.file), page)
  console.log(`prerendered ${r.url} -> dist/${r.file} (${(html.length / 1024).toFixed(1)} kB)`)
}
await rm('dist-ssr', { recursive: true, force: true })
