// Scroll spy check: puts each section in view (down, then back up), screenshots, and reads the active link.
// Usage: node scripts/v2-spy.mjs [baseUrl] [--out=docs/screenshots/v2] [--reduced]
import { chromium } from '@playwright/test'
import path from 'node:path'

const args = process.argv.slice(2)
const base = args.find((a) => a.startsWith('http')) || 'http://127.0.0.1:5173'
const out = (args.find((a) => a.startsWith('--out=')) || '--out=docs/screenshots/v2').replace('--out=', '')
const reduced = args.includes('--reduced')
const EXPECT = [
  ['top', null], ['platform', 'platform'], ['product', 'platform'], ['portals', 'portals'], ['features', 'features'],
  ['how', 'how'], ['trust', 'how'], ['partners', 'partners'], ['team', 'team'],
]
const browser = await chromium.launch({ channel: 'chrome' })
let fails = 0
for (const vp of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.hasTouch, deviceScaleFactor: vp.deviceScaleFactor || 1, reducedMotion: reduced ? 'reduce' : 'no-preference' })
  const p = await ctx.newPage()
  const errs = []
  p.on('pageerror', (e) => errs.push(e.message))
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
  await p.goto(base)
  await p.waitForFunction(() => document.documentElement.dataset.hydrated === 'true' && !document.documentElement.classList.contains('is-loading'), null, { timeout: 9000 })
  await p.waitForTimeout(1200)
  const order = [...EXPECT, ...EXPECT.slice(0, -1).reverse()]
  for (let i = 0; i < order.length; i++) {
    const [id, want] = order[i]
    const dir = i < EXPECT.length ? 'down' : 'up'
    await p.evaluate((id) => {
      const el = document.getElementById(id)
      const box = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el
      // Middle of the section's scroll range, past the top center line.
      const top = box.getBoundingClientRect().top + scrollY
      const y = Math.max(0, top + Math.min(box.offsetHeight * 0.4, box.offsetHeight - innerHeight * 0.4) - innerHeight * 0.3)
      const l = window.__comax?.lenis
      const to = (v) => (l ? l.scrollTo(v, { immediate: true, force: true }) : scrollTo(0, v))
      // Land a little below, then nudge up: the nav hides on scroll down and returns on scroll up.
      to(id === 'top' ? 0 : y + 60)
      window.__target = id === 'top' ? 0 : y
    }, id)
    await p.waitForTimeout(250)
    await p.evaluate(() => {
      const l = window.__comax?.lenis
      l ? l.scrollTo(window.__target, { immediate: true, force: true }) : scrollTo(0, window.__target)
    })
    await p.waitForTimeout(800)
    if (vp.name === 'mobile') {
      await p.click('[aria-controls="mobile-menu"]')
      await p.waitForTimeout(250)
    }
    const got = await p.evaluate((m) => {
      const sel = m ? '#mobile-menu a[aria-current="true"]' : 'nav[aria-label="Main"] a[aria-current="true"]'
      const a = document.querySelector(sel)
      const pill = document.querySelector('[class*="_pill_"]')
      return { id: a ? a.getAttribute('href').replace(/^\/?#/, '') : null, pill: pill?.dataset.on, color: a ? getComputedStyle(a).color : null }
    }, vp.name === 'mobile')
    const pass = got.id === want && (vp.name === 'mobile' || (got.pill === 'true') === !!want)
    if (!pass) fails++
    console.log(`${pass ? 'PASS' : 'FAIL'} ${vp.name} ${dir} #${id}: active ${got.id} (want ${want}) pill ${got.pill} ${got.color ?? ''}`)
    if (i < EXPECT.length || id === 'top' || id === 'product')
      await p.screenshot({ path: path.join(out, `1-nav-${vp.name}-${dir}-${String(i).padStart(2, '0')}-${id}${reduced ? '-reduced' : ''}.png`), clip: { x: 0, y: 0, width: vp.width, height: vp.name === 'mobile' ? 560 : 120 } })
    if (vp.name === 'mobile') {
      await p.click('[aria-controls="mobile-menu"]')
      await p.waitForTimeout(150)
    }
  }
  // Click test: from the top, click Team; sample the pill on every frame while it scrolls.
  if (vp.name === 'desktop') {
    await p.evaluate(() => window.__comax?.lenis?.scrollTo(0, { immediate: true, force: true }) ?? scrollTo(0, 0))
    await p.waitForTimeout(500)
    await p.evaluate(() => {
      window.__seen = []
      const tick = () => {
        const a = document.querySelector('nav[aria-label="Main"] a[aria-current="true"]')
        window.__seen.push(a ? a.getAttribute('href') : 'none')
        if (window.__seen.length < 200) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
    await p.click('nav[aria-label="Main"] a[href="#team"]')
    await p.waitForTimeout(3500)
    const seen = await p.evaluate(() => [...new Set(window.__seen)])
    const end = await p.evaluate(() => document.querySelector('nav[aria-label="Main"] a[aria-current="true"]')?.getAttribute('href'))
    const pass = seen.filter((x) => x !== 'none').every((x) => x === '#team') && end === '#team'
    if (!pass) fails++
    console.log(`${pass ? 'PASS' : 'FAIL'} click Team: states seen ${seen.join(' > ')}, settled ${end}`)
    await p.screenshot({ path: path.join(out, `1-nav-desktop-click-team${reduced ? '-reduced' : ''}.png`), clip: { x: 0, y: 0, width: 1440, height: 120 } })
  }
  if (errs.length) { fails++; console.log('ERRORS', errs.join(' / ')) }
  await ctx.close()
}
await browser.close()
process.exitCode = fails ? 1 : 0
