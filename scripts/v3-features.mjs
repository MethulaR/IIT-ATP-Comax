// Features check: screenshots with features 1, 3 and 6 active. The device must not move; only the text column moves.
// Usage: node scripts/v3-features.mjs [baseUrl] [--out=docs/screenshots/v3]
import { chromium } from '@playwright/test'
import path from 'node:path'

const args = process.argv.slice(2)
const base = args.find((a) => a.startsWith('http')) || 'http://127.0.0.1:5173'
const out = (args.find((a) => a.startsWith('--out=')) || '--out=docs/screenshots/v3').replace('--out=', '')
const browser = await chromium.launch({ channel: 'chrome' })
let fails = 0
const ok = (pass, msg) => {
  if (!pass) fails++
  console.log(`${pass ? 'PASS' : 'FAIL'} ${msg}`)
}
const ready = (p) =>
  p.waitForFunction(() => document.documentElement.dataset.hydrated === 'true' && !document.documentElement.classList.contains('is-loading'), null, { timeout: 9000 })

for (const vp of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.hasTouch, deviceScaleFactor: vp.deviceScaleFactor || 1 })
  const p = await ctx.newPage()
  const errs = []
  p.on('pageerror', (e) => errs.push(e.message))
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
  await p.goto(base)
  await ready(p)
  await p.waitForSelector('#features')
  await p.waitForTimeout(1200)
  if (vp.name === 'desktop') {
    const range = await p.evaluate(() => {
      const el = document.getElementById('features')
      const sp = el.parentElement
      const start = Math.round(sp.getBoundingClientRect().top + scrollY)
      return { start, distance: sp.offsetHeight - el.offsetHeight, pinned: sp.classList.contains('pin-spacer') }
    })
    ok(range.pinned, `features pinned for ${range.distance}px (${(range.distance / vp.height).toFixed(2)} screens)`)
    const seen = []
    for (const n of [1, 3, 6]) {
      await p.evaluate((y) => window.__comax.lenis.scrollTo(y, { immediate: true, force: true }), Math.round(range.start + ((n - 1) / 5) * range.distance))
      await p.waitForTimeout(1500)
      const r = await p.evaluate(() => {
        const d = document.querySelector('[data-device]').getBoundingClientRect()
        const col = document.querySelector('[data-column]').getBoundingClientRect()
        const blocks = [...document.querySelectorAll('[data-block]')]
        const active = blocks.findIndex((b) => b.hasAttribute('data-current'))
        const screens = [...document.querySelectorAll('[data-screen]')]
        const shown = screens.findIndex((s) => Number(getComputedStyle(s).opacity) > 0.99)
        const dot = [...document.querySelectorAll('#features [data-dot]')].findIndex((x) => x.hasAttribute('data-on'))
        const ops = blocks.map((b) => Number(getComputedStyle(b).opacity).toFixed(2))
        return { device: [Math.round(d.left), Math.round(d.top), Math.round(d.width), Math.round(d.height)].join(','), col: Math.round(col.top), active, shown, dot, ops }
      })
      seen.push(r)
      ok(r.active === n - 1 && r.shown === n - 1 && r.dot === n - 1, `feature ${n}: active ${r.active + 1}, screen ${r.shown + 1}, dot ${r.dot + 1}, opacities ${r.ops.join(' ')}, device ${r.device}, text column top ${r.col}`)
      await p.screenshot({ path: path.join(out, `5-features-desktop-feature${n}.png`) })
    }
    ok(new Set(seen.map((r) => r.device)).size === 1, `device in the same place for all three (${seen[0].device})`)
    ok(new Set(seen.map((r) => r.col)).size === 3, `only the text column moved (${seen.map((r) => r.col).join(', ')})`)
  } else {
    const pinned = await p.evaluate(() => document.getElementById('features').parentElement.classList.contains('pin-spacer'))
    ok(!pinned, 'mobile: no pin')
    for (const n of [1, 3, 6]) {
      await p.evaluate((i) => {
        const b = document.querySelectorAll('[data-block]')[i]
        scrollTo(0, b.getBoundingClientRect().top + scrollY - 100)
      }, n - 1)
      await p.waitForTimeout(1100)
      await p.screenshot({ path: path.join(out, `5-features-mobile-feature${n}.png`) })
    }
  }
  if (errs.length) ok(false, `${vp.name} console errors: ${errs.join(' / ')}`)
  await ctx.close()
}
await browser.close()
process.exitCode = fails ? 1 : 0
