// Records a scroll through the whole page with real wheel input (Lenis smoothing on) and saves it
// as an animated WebP, so no ffmpeg is needed. Usage: node scripts/record.mjs [baseUrl]
import { chromium } from '@playwright/test'
import sharp from 'sharp'

const base = process.argv[2] || 'http://127.0.0.1:4173'
const W = 960
const H = 600
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
await page.goto(base)
const frames = []
const grab = async () => frames.push(await sharp(await page.screenshot({ type: 'jpeg', quality: 70 })).resize(W, H).raw().toBuffer())
// Loader and intro
for (let i = 0; i < 22; i++) {
  await grab()
  await page.waitForTimeout(90)
}
await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true' && !document.documentElement.classList.contains('is-loading'), null, { timeout: 10000 })
await page.mouse.move(640, 400)
const height = await page.evaluate(() => document.documentElement.scrollHeight)
const step = 260
for (let y = 0; y < height; y += step) {
  await page.mouse.wheel(0, step)
  await page.waitForTimeout(110)
  await grab()
}
await browser.close()
const strip = Buffer.concat(frames)
await sharp(strip, { raw: { width: W, height: H * frames.length, channels: 3, pageHeight: H } })
  .webp({ quality: 60, loop: 0, delay: frames.map(() => 90), effort: 4 })
  .toFile('docs/screenshots/scroll-desktop.webp')
console.log(`saved docs/screenshots/scroll-desktop.webp (${frames.length} frames)`)
