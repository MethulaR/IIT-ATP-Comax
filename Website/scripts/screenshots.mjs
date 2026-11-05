// Playwright screenshots of every section at desktop and mobile, plus layout checks.
// Usage: node scripts/screenshots.mjs [baseUrl] [--only=hero,problem] [--out=docs/screenshots] [--reduced]
// Uses the locally installed Google Chrome (channel: 'chrome').
import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const args = process.argv.slice(2)
const base = args.find((a) => a.startsWith('http')) || 'http://127.0.0.1:5173'
const only = (args.find((a) => a.startsWith('--only=')) || '').replace('--only=', '').split(',').filter(Boolean)
const out = (args.find((a) => a.startsWith('--out=')) || '--out=docs/screenshots').replace('--out=', '')
const reduced = args.includes('--reduced')
const vpArg = (args.find((a) => a.startsWith('--vp=')) || '').replace('--vp=', '')

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
].filter((v) => !vpArg || v.name === vpArg)

// Each section: element id and fractions of its scroll range to capture.
const SECTIONS = [
  { name: 'hero', id: 'top', at: [0, 0.35, 0.7] },
  { name: 'problem', id: 'product', at: [0, 0.3, 0.6, 0.95] },
  { name: 'portals', id: 'portals', at: [0, 0.35, 0.7, 0.98] },
  { name: 'features', id: 'features', at: [0, 0.2, 0.5, 0.85] },
  { name: 'scoring', id: 'scoring', at: [0, 0.5, 0.95] },
  { name: 'how', id: 'how', at: [0, 0.5, 0.9] },
  { name: 'trust', id: 'trust', at: [0, 0.5] },
  { name: 'partners', id: 'partners', at: [0, 0.5] },
  { name: 'marquee', id: 'marquee', at: [0] },
  { name: 'team', id: 'team', at: [0, 0.5] },
  { name: 'contact', id: 'contact', at: [0, 0.5] },
  { name: 'footer', id: 'footer', at: [0, 1] },
]
  .map((s, i) => ({ ...s, n: i + 1 }))
  .filter((s) => !only.length || only.includes(s.name))

await mkdir(out, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const errors = []

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.deviceScaleFactor || 1,
    isMobile: vp.isMobile,
    hasTouch: vp.hasTouch,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  })
  const page = await ctx.newPage()
  page.on('console', (m) => m.type() === 'error' && errors.push(`[${vp.name}] ${m.text()}`))
  page.on('pageerror', (e) => errors.push(`[${vp.name}] pageerror ${e.message}`))

  await page.goto(base, { waitUntil: 'networkidle' })
  if (!only.length || only.includes('loader')) {
    await page.waitForTimeout(900)
    await page.screenshot({ path: path.join(out, `${vp.name}-00-loader${reduced ? '-reduced' : ''}.png`) })
  }
  // Wait for the loader to finish (max 3.2s plus the lens exit).
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true' && !document.documentElement.classList.contains('is-loading'), null, { timeout: 8000 })
  await page.waitForTimeout(1600)

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  if (overflow > 0) errors.push(`[${vp.name}] horizontal overflow ${overflow}px`)

  for (const s of SECTIONS) {
    for (const f of s.at) {
      const y = await page.evaluate(
        ({ id, f }) => {
          const el = document.getElementById(id)
          if (!el) return null
          // A pinned section's scroll range is its pin spacer height minus the viewport.
          const box = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el
          const top = box.getBoundingClientRect().top + window.scrollY
          const range = Math.max(0, box.offsetHeight - window.innerHeight)
          return Math.round(top + range * f)
        },
        { id: s.id, f },
      )
      if (y === null) {
        errors.push(`[${vp.name}] missing #${s.id}`)
        break
      }
      await page.evaluate((y) => {
        const l = window.__comax?.lenis
        if (l) l.scrollTo(y, { immediate: true, force: true })
        else window.scrollTo(0, y)
      }, y)
      await page.waitForTimeout(1300)
      const file = `${vp.name}-${String(s.n).padStart(2, '0')}-${s.name}-${Math.round(f * 100)}${reduced ? '-reduced' : ''}.png`
      await page.screenshot({ path: path.join(out, file) })
    }
  }
  await ctx.close()
}

await browser.close()
if (errors.length) {
  console.log('ISSUES:\n' + errors.join('\n'))
} else console.log('OK no console errors, no horizontal overflow')
