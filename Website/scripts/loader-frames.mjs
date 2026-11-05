import { chromium } from '@playwright/test'
const out = process.argv[2] || 'docs/screenshots'
const b = await chromium.launch({ channel: 'chrome' })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errs = []
p.on('console', m => m.type()==='error' && errs.push(m.text()))
p.on('pageerror', e => errs.push(e.message))
await p.goto('http://127.0.0.1:5173/')
const t0 = Date.now()
for (const t of [1300, 1750, 2050, 2350, 2700]) {
  await p.waitForTimeout(Math.max(0, t - (Date.now() - t0)))
  await p.screenshot({ path: `${out}/lf-${t}.png` })
}
// Repeat visit: short version
await p.reload()
await p.waitForTimeout(250)
await p.screenshot({ path: `${out}/lf-repeat-250.png` })
console.log('errors', errs)
await b.close()
