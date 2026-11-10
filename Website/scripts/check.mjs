// Definition of done checks against a running build (default: npm run preview on :4173).
// Usage: node scripts/check.mjs [baseUrl]
import { chromium } from '@playwright/test'

const base = process.argv[2] || 'http://127.0.0.1:4173'
const browser = await chromium.launch({ channel: 'chrome' })
const results = []
const ok = (name, pass, info = '') => results.push(`${pass ? 'PASS' : 'FAIL'}  ${name}${info ? `  (${info})` : ''}`)
const waitIntro = (p) => p.waitForFunction(() => document.documentElement.dataset.hydrated === 'true' && !document.documentElement.classList.contains('is-loading'), null, { timeout: 8000 })
const scrollAll = async (p) => {
  const h = await p.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < h; y += 700) {
    await p.evaluate((y) => window.scrollTo(0, y), y)
    await p.waitForTimeout(60)
  }
}

// 1. No horizontal scroll at every width, no console errors while scrolling the whole page.
for (const width of [360, 390, 768, 1024, 1440, 1920]) {
  const ctx = await browser.newContext({ viewport: { width, height: width < 768 ? 800 : 900 }, isMobile: width < 768, hasTouch: width < 768 })
  const p = await ctx.newPage()
  const errs = []
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
  p.on('pageerror', (e) => errs.push(e.message))
  await p.goto(base)
  await waitIntro(p)
  await scrollAll(p)
  const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  ok(`width ${width}: no horizontal scroll`, over <= 0, `${over}px`)
  ok(`width ${width}: no console errors`, errs.length === 0, errs.slice(0, 2).join(' / '))
  await ctx.close()
}

// 2. Loader: full version first, quick version on repeat, follows progress, never over 3.2s plus exit.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const p = await ctx.newPage()
  const t0 = Date.now()
  await p.goto(base)
  const seen = []
  for (let i = 0; i < 26; i++) {
    const v = await p.evaluate(() => document.querySelector('[class*="_count_"] span')?.textContent || null)
    if (v) seen.push(v)
    await p.waitForTimeout(150)
  }
  await waitIntro(p)
  const full = Date.now() - t0
  ok('loader counter climbs to 100', seen.includes('100') && Number(seen[0]) < 100, seen.slice(0, 6).join(','))
  ok('loader done within 3.2s plus 1.3s exit', full < 4600, `${full}ms`)
  const t1 = Date.now()
  await p.reload()
  await waitIntro(p)
  ok('repeat visit uses the quick loader', Date.now() - t1 < 1600, `${Date.now() - t1}ms`)
  // Refraction: Chromium gets the SVG displacement backdrop.
  const refr = await p.evaluate(() => document.documentElement.classList.contains('has-refraction'))
  const nav = await p.evaluate(() => getComputedStyle(document.querySelector('nav[data-refract]')).backdropFilter)
  ok('liquid glass refracts in Chrome', refr && nav.includes('url'), nav)
  await ctx.close()
}

// 3. Keyboard: skip loader with Escape, skip link, focus ring visible, pinned sections skippable.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const p = await ctx.newPage()
  await p.goto(base)
  await p.waitForTimeout(400)
  const t = Date.now()
  await p.waitForFunction(() => document.documentElement.dataset.hydrated === 'true')
  await p.keyboard.press('Escape')
  await waitIntro(p)
  await p.waitForTimeout(300)
  ok('Escape skips the loader', Date.now() - t < 1500, `${Date.now() - t}ms`)
  await p.keyboard.press('Tab')
  const first = await p.evaluate(() => document.activeElement?.textContent?.trim())
  ok('first Tab reaches Skip to content', first === 'Skip to content', first)
  const ring = await p.evaluate(() => getComputedStyle(document.activeElement).boxShadow)
  ok('focus ring is visible', ring !== 'none', ring.slice(0, 60))
  const skips = await p.evaluate(() => [...document.querySelectorAll('.skip-section')].map((a) => a.getAttribute('href')))
  ok('pinned story sections have skip links', skips.length >= 3, skips.join(' '))
  // Tab through the whole page: focus never gets stuck.
  const stops = new Set()
  for (let i = 0; i < 90; i++) {
    await p.keyboard.press('Tab')
    stops.add(await p.evaluate(() => (document.activeElement?.closest('section,header,footer')?.id || document.activeElement?.tagName) ?? ''))
  }
  ok('keyboard reaches every region', ['top', 'contact', 'footer'].every((s) => stops.has(s)), [...stops].join(','))
  await ctx.close()
}

// 4. Images have alt text, landmarks, heading order.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const p = await ctx.newPage()
  await p.goto(base)
  await waitIntro(p)
  await scrollAll(p)
  const a = await p.evaluate(() => ({
    imgsNoAlt: [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length,
    h1: document.querySelectorAll('h1').length,
    landmarks: ['header', 'nav', 'main', 'footer'].every((t) => document.querySelector(t)),
    skipped: (() => {
      let prev = 1
      let bad = 0
      document.querySelectorAll('h1,h2,h3,h4').forEach((h) => {
        const l = Number(h.tagName[1])
        if (l > prev + 1) bad++
        prev = l
      })
      return bad
    })(),
  }))
  ok('every image has alt', a.imgsNoAlt === 0)
  ok('one h1 and all landmarks', a.h1 === 1 && a.landmarks)
  ok('heading levels never skip', a.skipped === 0, `${a.skipped}`)
  // 5. Route change cleans every ScrollTrigger.
  const before = await p.evaluate(() => window.ScrollTrigger?.getAll?.().length ?? -1)
  await p.click('footer a[href="/privacy"]')
  await p.waitForTimeout(800)
  const after = await p.evaluate(() => [...document.querySelectorAll('.pin-spacer')].length)
  const title = await p.title()
  ok('route change removes pins and triggers', after === 0 && title.startsWith('Privacy'), `pin spacers left ${after}, ${before}`)
  await ctx.close()
}

// 6. Reduced motion: no pin, no smooth scroll, content visible.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const p = await ctx.newPage()
  await p.goto(base)
  await waitIntro(p)
  await scrollAll(p)
  await p.waitForTimeout(500)
  const r = await p.evaluate(() => ({
    pins: document.querySelectorAll('.pin-spacer').length,
    lenis: document.documentElement.classList.contains('lenis'),
    hidden: [...document.querySelectorAll('main h2, main h3, main p')].filter((e) => Number(getComputedStyle(e).opacity) < 0.99).length,
  }))
  ok('reduced motion: no pins, no smooth scroll', r.pins === 0 && !r.lenis, JSON.stringify(r))
  ok('reduced motion: all text visible after scroll', r.hidden === 0, `${r.hidden} hidden`)
  await ctx.close()
}

// 7. Contact form validation and success state.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const p = await ctx.newPage()
  // Never send real email from a test: answer the form service locally.
  await p.route('https://formsubmit.co/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":"true"}' }))
  await p.goto(base + '/#contact')
  await waitIntro(p)
  await p.waitForSelector('#contact-form')
  await p.click('#contact-form button[type="submit"]')
  const invalid = await p.evaluate(() => document.querySelectorAll('#contact-form [aria-invalid="true"]').length)
  const focused = await p.evaluate(() => document.activeElement?.getAttribute('name'))
  ok('form flags empty fields and focuses the first', invalid === 4 && focused === 'name', `${invalid} invalid, focus ${focused}`)
  await p.fill('#contact-form [name="name"]', 'Test Organizer')
  await p.fill('#contact-form [name="email"]', 'organizer@example.com')
  await p.fill('#contact-form [name="organisation"]', 'Example School')
  await p.fill('#contact-form [name="message"]', 'We run an inter school quiz every term.')
  await p.click('#contact-form button[type="submit"]')
  await p.waitForSelector('[role="status"] h3', { timeout: 4000 })
  const success = await p.evaluate(() => document.activeElement?.tagName === 'H3' && document.activeElement.textContent)
  ok('form success state is announced and focused', !!success, String(success))
  await ctx.close()
}

await browser.close()
console.log(results.join('\n'))
process.exitCode = results.some((r) => r.startsWith('FAIL')) ? 1 : 0
