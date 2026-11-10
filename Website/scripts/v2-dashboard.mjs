// Dashboard expansion check: screenshots at 0, 25, 50, 75 and 100% of the scrub, a zoomed text crop at each,
// and a sharpness test: the live frame is compared with the same frame after forcing a fresh raster
// (will-change removed, layer rebuilt). If the live text came from stretched pixels, the two differ.
// Usage: node scripts/v2-dashboard.mjs [baseUrl] [--out=docs/screenshots/v2]
import { chromium } from '@playwright/test'
import sharp from 'sharp'
import path from 'node:path'

const args = process.argv.slice(2)
const base = args.find((a) => a.startsWith('http')) || 'http://127.0.0.1:5173'
const out = (args.find((a) => a.startsWith('--out=')) || '--out=docs/screenshots/v2').replace('--out=', '')
const browser = await chromium.launch({ channel: 'chrome' })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const p = await ctx.newPage()
const errs = []
p.on('pageerror', (e) => errs.push(e.message))
p.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
await p.goto(base)
await p.waitForFunction(() => document.documentElement.dataset.hydrated === 'true' && !document.documentElement.classList.contains('is-loading'), null, { timeout: 9000 })
await p.waitForTimeout(1800)

/** Variance of the Laplacian: higher means crisper edges. */
async function sharpness(buf) {
  const { data, info } = await sharp(buf).greyscale().raw().toBuffer({ resolveWithObject: true })
  const w = info.width, h = info.height
  let sum = 0, sq = 0, n = 0
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x
    const l = 4 * data[i] - data[i - 1] - data[i + 1] - data[i - w] - data[i + w]
    sum += l; sq += l * l; n++
  }
  return sq / n - (sum / n) ** 2
}
async function diff(a, b) {
  const A = await sharp(a).greyscale().raw().toBuffer()
  const B = await sharp(b).greyscale().raw().toBuffer()
  let max = 0, tot = 0
  for (let i = 0; i < A.length; i++) { const d = Math.abs(A[i] - B[i]); tot += d; if (d > max) max = d }
  return { mean: +(tot / A.length).toFixed(3), max }
}

const rows = []
for (const f of [0, 0.25, 0.5, 0.75, 1]) {
  await p.evaluate((f) => {
    // The expansion is the first 100vh of the pin, then it holds for 40vh.
    const y = Math.round(f * innerHeight)
    window.__comax.lenis.scrollTo(y, { immediate: true, force: true })
  }, f)
  await p.waitForTimeout(f === 1 ? 2200 : 1400)
  const box = await p.evaluate(() => {
    const t = [...document.querySelectorAll('[data-variant="wide"] [class*="_title_"]')][0]
    const r = t.getBoundingClientRect()
    const dash = document.querySelector('[data-dash]')
    return { x: Math.max(0, Math.floor(r.left) - 8), y: Math.max(0, Math.floor(r.top) - 6), w: Math.ceil(r.width * 2.2) + 16, h: Math.ceil(r.height * 3.2) + 12, will: dash.style.willChange || 'unset', transform: getComputedStyle(dash).transform }
  })
  const clip = { x: box.x, y: box.y, width: Math.min(box.w, 1440 - box.x), height: Math.min(box.h, 900 - box.y) }
  const tag = `3-dashboard-desktop-${String(Math.round(f * 100)).padStart(3, '0')}`
  await p.screenshot({ path: path.join(out, `${tag}.png`) })
  const live = await p.screenshot({ clip })
  // Fresh raster of the exact same frame.
  await p.evaluate(() => {
    const d = document.querySelector('[data-dash]')
    d.dataset.keepWill = d.style.willChange
    d.style.willChange = 'auto'
    d.style.outline = '0.01px solid transparent'
    void d.offsetWidth
  })
  await p.waitForTimeout(300)
  const fresh = await p.screenshot({ clip })
  await p.evaluate(() => {
    const d = document.querySelector('[data-dash]')
    d.style.willChange = d.dataset.keepWill
    d.style.outline = ''
  })
  await sharp(live).resize({ width: clip.width * 3, kernel: 'nearest' }).toFile(path.join(out, `${tag}-zoom.png`))
  const d = await diff(live, fresh)
  rows.push({ scrub: `${f * 100}%`, transform: box.transform, willChange: box.will, sharpLive: Math.round(await sharpness(live)), sharpFresh: Math.round(await sharpness(fresh)), diffMean: d.mean, diffMax: d.max })
}
console.table(rows)
if (errs.length) console.log('ERRORS', errs)
await browser.close()
