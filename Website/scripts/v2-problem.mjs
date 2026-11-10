// Problem section check: screenshots at each caption beat, overlap test (no card inside the headline or caption box),
// caption contrast, the ScrollTrigger start and end in px, and snap settling.
// Usage: node scripts/v2-problem.mjs [baseUrl] [--out=docs/screenshots/v2]
import { chromium } from '@playwright/test'
import sharp from 'sharp'
import path from 'node:path'

const args = process.argv.slice(2)
const base = args.find((a) => a.startsWith('http')) || 'http://127.0.0.1:5173'
const out = (args.find((a) => a.startsWith('--out=')) || '--out=docs/screenshots/v2').replace('--out=', '')
const browser = await chromium.launch({ channel: 'chrome' })
let fails = 0
const ok = (pass, msg) => {
  if (!pass) fails++
  console.log(`${pass ? 'PASS' : 'FAIL'} ${msg}`)
}

const lum = ([r, g, b]) => {
  const f = (c) => {
    c /= 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}
const rgb = (s) => s.match(/\d+/g).slice(0, 3).map(Number)
const ready = (p) =>
  p.waitForFunction(() => document.documentElement.dataset.hydrated === 'true' && !document.documentElement.classList.contains('is-loading'), null, { timeout: 9000 })

// Desktop
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const p = await ctx.newPage()
  const errs = []
  p.on('pageerror', (e) => errs.push(e.message))
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
  await p.goto(base)
  await ready(p)
  await p.waitForSelector('#product')
  await p.waitForTimeout(1500)
  const range = await p.evaluate(() => {
    const el = document.getElementById('product')
    const sp = el.parentElement
    const start = Math.round(sp.getBoundingClientRect().top + scrollY)
    const end = start + (sp.offsetHeight - el.offsetHeight)
    return { start, end, distance: end - start, screens: +((end - start) / innerHeight).toFixed(2) }
  })
  console.log(`ScrollTrigger start ${range.start}px, end ${range.end}px, distance ${range.distance}px = ${range.screens} screens`)
  ok(Math.abs(range.screens - 1.5) < 0.02, 'section completes in 1.5 screens of scroll')

  const beats = [0, 0.33, 0.66, 1]
  for (let b = 0; b < beats.length; b++) {
    const y = Math.round(range.start + beats[b] * range.distance)
    await p.evaluate((y) => window.__comax.lenis.scrollTo(y, { immediate: true, force: true }), y)
    await p.waitForTimeout(1600)
    const r = await p.evaluate(() => {
      const rect = (n) => {
        const r = n.getBoundingClientRect()
        return { l: r.left, t: r.top, r: r.right, b: r.bottom }
      }
      const hit = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t
      const title = rect(document.getElementById('problem-title'))
      const boxEl = document.querySelector('[data-capbox]')
      const box = rect(boxEl)
      const pieces = [...document.querySelectorAll('[data-piece]')].map(rect)
      const overlaps = pieces.filter((pc) => hit(pc, title) || hit(pc, box)).length
      const caps = [...document.querySelectorAll('[data-cap]')]
      const shown = caps.findIndex((c) => {
        const cr = c.getBoundingClientRect()
        return Math.abs(cr.top - box.t) < 40 && Number(getComputedStyle(c).opacity) > 0.95
      })
      const cap = caps[Math.max(0, shown)]
      const key = cap.querySelector('[class*="_key_"]')
      return {
        overlaps,
        shown,
        label: document.querySelector('[data-step-label]').textContent,
        ink: getComputedStyle(cap).color,
        key: key ? getComputedStyle(key).color : null,
        box,
        fontSize: getComputedStyle(cap).fontSize,
        gridOpacity: getComputedStyle(document.querySelector('[data-grid]')).opacity,
      }
    })
    const file = path.join(out, `4-problem-desktop-beat${b + 1}.png`)
    await p.screenshot({ path: file })
    // Background behind the caption text: the backing's padding area, left edge, mid height.
    const px = await sharp(file)
      .extract({ left: Math.round(r.box.l + 6), top: Math.round((r.box.t + r.box.b) / 2), width: 1, height: 1 })
      .raw()
      .toBuffer()
    const bg = [px[0], px[1], px[2]]
    const cInk = contrast(rgb(r.ink), bg)
    const cKey = r.key ? contrast(rgb(r.key), bg) : null
    ok(r.overlaps === 0, `beat ${b + 1}: no card overlaps the headline or caption (caption ${r.shown + 1}, step "${r.label}", ${r.fontSize}, cards opacity ${r.gridOpacity})`)
    ok(cInk >= 4.5 && (cKey === null || cKey >= 4.5), `beat ${b + 1}: contrast ink ${cInk.toFixed(1)}:1${cKey ? `, highlight ${cKey.toFixed(1)}:1` : ''} on rgb(${bg})`)
  }
  // Snap: stop between captions, it should settle on a beat.
  for (const f of [0.2, 0.45, 0.8]) {
    await p.evaluate((y) => window.__comax.lenis.scrollTo(y, { immediate: true, force: true }), Math.round(range.start + f * range.distance))
    await p.waitForTimeout(80)
    await p.mouse.move(700, 450)
    await p.mouse.wheel(0, 2)
    await p.waitForTimeout(2200)
    const prog = await p.evaluate(({ s, d }) => (scrollY - s) / d, { s: range.start, d: range.distance })
    const near = [0, 0.33, 0.66, 1].some((b) => Math.abs(prog - b) < 0.02)
    ok(near, `snap from ${f} settles on a beat (${prog.toFixed(3)})`)
  }
  if (errs.length) ok(false, 'console errors ' + errs.join(' / '))
  await ctx.close()
}

// Mobile: no pin, three blocks, then the board.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
  const p = await ctx.newPage()
  await p.goto(base)
  await ready(p)
  await p.waitForSelector('#product')
  await p.waitForTimeout(800)
  const pinned = await p.evaluate(() => document.getElementById('product').parentElement.classList.contains('pin-spacer'))
  ok(!pinned, 'mobile: section is not pinned')
  const n = await p.locator('[data-mstep]').count()
  for (let i = 0; i < n; i++) {
    await p.evaluate((i) => {
      const el = document.querySelectorAll('[data-mstep]')[i]
      scrollTo(0, el.getBoundingClientRect().top + scrollY - 120)
    }, i)
    await p.waitForTimeout(1100)
    await p.screenshot({ path: path.join(out, `4-problem-mobile-step${i + 1}.png`) })
  }
  await p.evaluate(() => document.querySelector('[data-grid]').scrollIntoView({ block: 'center' }))
  await p.waitForTimeout(2200)
  await p.screenshot({ path: path.join(out, `4-problem-mobile-board.png`) })
  await ctx.close()
}
await browser.close()
process.exitCode = fails ? 1 : 0
