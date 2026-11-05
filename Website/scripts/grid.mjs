// Tile screenshots into one image for quick review: node scripts/grid.mjs out.png a.png b.png ...
import sharp from 'sharp'
const [out, ...files] = process.argv.slice(2)
const cols = 2, w = 720
const metas = await Promise.all(files.map(async (f) => sharp(f).resize({ width: w }).png().toBuffer({ resolveWithObject: true })))
const h = Math.max(...metas.map((m) => m.info.height))
const rows = Math.ceil(files.length / cols)
await sharp({ create: { width: cols * w, height: rows * h, channels: 3, background: '#fff' } })
  .composite(metas.map((m, i) => ({ input: m.data, left: (i % cols) * w, top: Math.floor(i / cols) * h })))
  .png().toFile(out)
