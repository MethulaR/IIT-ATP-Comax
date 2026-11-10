// Platform section check: screenshots before the card enters, mid entrance and at rest; no stat shows 0 at rest;
// the fixed nav does not overlap the card at rest. Also checks the stats show real numbers with no JavaScript motion.
// Usage: node scripts/v3-platform.mjs [baseUrl] [--out=docs/screenshots/v3]
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

const state = (p) =>
  p.evaluate(() => {
    const card = document.querySelector('#platform [data-card]').getBoundingClientRect()
    const nav = document.querySelector('nav[aria-label="Main"]').getBoundingClientRect()
    const v = [...document.querySelectorAll('#platform [data-variant]')].find((x) => getComputedStyle(x).display !== 'none')
    const stats = [...v.querySelectorAll('[data-count]')].map((n) => n.textContent)
    return { cardTop: Math.round(card.top), navBottom: Math.round(nav.bottom), stats, transform: getComputedStyle(document.querySelector('#platform [data-card]')).transform }
  })

for (const reduced of [false, true]) {
  for (const vp of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  ]) {
    const tag = `${vp.name}${reduced ? '-reduced' : ''}`
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.hasTouch, deviceScaleFactor: vp.deviceScaleFactor || 1, reducedMotion: reduced ? 'reduce' : 'no-preference' })
    const p = await ctx.newPage()
    const errs = []
    p.on('pageerror', (e) => errs.push(e.message))
    p.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
    await p.goto(base)
    await ready(p)
    await p.waitForSelector('#platform [data-card]')
    await p.waitForTimeout(1000)
    const to = (y) => p.evaluate((y) => (window.__comax?.lenis ? window.__comax.lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y)), y)
    const cardY = await p.evaluate(() => {
      const c = document.querySelector('#platform [data-card]')
      let y = 0
      for (let n = c; n; n = n.offsetParent) y += n.offsetTop
      return y
    })
    const shots = reduced
      ? [['rest', cardY - 120]]
      : [
          ['before', cardY - vp.height - 40],
          ['mid', cardY - vp.height * 0.75],
          ['rest', cardY - 120],
        ]
    for (const [name, y] of shots) {
      // Land a little below, then nudge up: the nav hides on scroll down and shows on scroll up.
      await to(Math.max(0, Math.round(y) + 60))
      await p.waitForTimeout(200)
      await to(Math.max(0, Math.round(y)))
      await p.waitForTimeout(name === 'rest' ? 2200 : 900)
      const s = await state(p)
      await p.screenshot({ path: path.join(out, `8-platform-${tag}-${name}.png`) })
      if (name === 'rest') {
        ok(s.stats.every((v) => Number(v) > 0), `${tag} at rest: stats ${s.stats.join(', ')}`)
        ok(s.cardTop >= s.navBottom, `${tag} at rest: nav bottom ${s.navBottom}px, card top ${s.cardTop}px (${s.transform})`)
      } else {
        console.log(`     ${tag} ${name}: card top ${s.cardTop}px, ${s.transform}, stats ${s.stats.join(', ')}`)
      }
    }
    // Scroll away and back: stats still show real numbers.
    await to(0)
    await p.waitForTimeout(500)
    await to(Math.round(cardY - 120))
    await p.waitForTimeout(1600)
    const back = await state(p)
    ok(back.stats.every((v) => Number(v) > 0), `${tag} after scrolling away and back: stats ${back.stats.join(', ')}`)
    if (errs.length) ok(false, `${tag} console errors: ${errs.join(' / ')}`)
    await ctx.close()
  }
}
await browser.close()
process.exitCode = fails ? 1 : 0
