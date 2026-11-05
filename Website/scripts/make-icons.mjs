// Builds the favicon set and the 1200x630 Open Graph image from the CoMax monogram.
// Run: npm run icons   (needs the local Google Chrome for the OG render)
import sharp from 'sharp'
import { writeFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const MARK = 'M46.72 15.65 A22 22 0 1 0 46.72 48.35 L32 25.5 L17.28 48.35'
const grad = `<linearGradient id="g" x1="8" y1="6" x2="58" y2="60" gradientUnits="userSpaceOnUse">
  <stop offset="0" stop-color="#B8475C"/><stop offset="0.45" stop-color="#8E1B30"/><stop offset="0.8" stop-color="#6B1424"/><stop offset="1" stop-color="#3D0A14"/></linearGradient>`

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs>${grad}</defs>
<rect width="64" height="64" rx="14" fill="#F7F7F8"/>
<path d="${MARK}" transform="translate(32 32) scale(0.86) translate(-32 -32)" fill="none" stroke="url(#g)" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`

await writeFile('public/favicon.svg', favicon)
const svg = Buffer.from(favicon)
await sharp(svg, { density: 384 }).resize(32, 32).png().toFile('public/favicon-32.png')
await sharp(svg, { density: 768 }).resize(180, 180).flatten({ background: '#F7F7F8' }).png().toFile('public/apple-touch-icon.png')
await sharp(svg, { density: 768 }).resize(192, 192).png().toFile('public/icon-192.png')
await sharp(svg, { density: 1536 }).resize(512, 512).png().toFile('public/icon-512.png')
await writeFile(
  'public/site.webmanifest',
  JSON.stringify(
    {
      name: 'CoMax',
      short_name: 'CoMax',
      description: 'Events and competitions, managed.',
      start_url: '/',
      display: 'standalone',
      background_color: '#F7F7F8',
      theme_color: '#6B1424',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  ) + '\n',
)

// Open Graph image, rendered with the real brand fonts.
// Fonts are inlined as data URLs: a page made with setContent cannot load file:// fonts.
const font = (pkg, file) =>
  'data:font/woff2;base64,' + readFileSync(path.resolve('node_modules/@fontsource-variable', pkg, 'files', file)).toString('base64')
const html = `<!doctype html><html><head><style>
@font-face{font-family:IT;src:url(${font('inter-tight', 'inter-tight-latin-wght-normal.woff2')}) format('woff2');font-weight:100 900}
@font-face{font-family:I;src:url(${font('inter', 'inter-latin-wght-normal.woff2')}) format('woff2');font-weight:100 900}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:#F7F7F8;font-family:I;position:relative}
.o{position:absolute;border-radius:50%}
.a{width:900px;height:900px;left:620px;top:-260px;background:radial-gradient(closest-side,rgba(142,27,48,.38),rgba(142,27,48,.12) 50%,transparent)}
.b{width:700px;height:700px;left:-240px;top:260px;background:radial-gradient(closest-side,rgba(201,203,209,.95),rgba(201,203,209,.3) 55%,transparent)}
.glass{position:absolute;right:72px;top:150px;width:330px;height:330px;border-radius:44px;background:rgba(255,255,255,.45);backdrop-filter:blur(20px) saturate(180%);
box-shadow:inset 0 1px 0 #fff,inset 0 -1px 0 rgba(107,20,36,.15),0 40px 90px -40px rgba(61,10,20,.45);display:grid;place-items:center}
.glass::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1.5px;background:linear-gradient(150deg,#fff,rgba(201,203,209,.5),rgba(140,143,152,.35),#fff);
-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor}
.c{position:absolute;left:72px;top:72px;right:460px}
.brand{display:flex;align-items:center;gap:14px;font-family:IT;font-weight:650;font-size:34px;letter-spacing:-.03em;color:#1A1A1E}
h1{margin-top:70px;font-family:IT;font-weight:620;font-size:76px;line-height:.98;letter-spacing:-.045em;color:#1A1A1E}
.m{background:linear-gradient(100deg,#3D0A14,#6B1424 25%,#B8475C 48%,#6B1424 65%,#3D0A14);-webkit-background-clip:text;color:transparent}
p{margin-top:34px;font-size:24px;color:#4A4A52;letter-spacing:-.005em}
</style></head><body><span class="o a"></span><span class="o b"></span>
<div class="glass"><svg width="210" height="210" viewBox="0 0 64 64"><defs>${grad.replace('id="g"', 'id="g2"')}</defs><path d="${MARK}" fill="none" stroke="url(#g2)" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
<div class="c"><div class="brand"><svg width="40" height="40" viewBox="0 0 64 64"><defs>${grad}</defs><path d="${MARK}" fill="none" stroke="url(#g)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>CoMax</div>
<h1>Run every event. Score every round. <span class="m">One platform.</span></h1>
<p>Events and competitions, managed.</p></div></body></html>`
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html, { waitUntil: 'load' })
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: 'public/og-image.png' })
await browser.close()
console.log('icons and og-image written to public/')
