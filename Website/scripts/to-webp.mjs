// Converts the PNG screenshots in docs/screenshots to WebP (quality 82) and removes the PNGs.
import sharp from 'sharp'
import { readdir, unlink } from 'node:fs/promises'
import path from 'node:path'

const dir = 'docs/screenshots'
for (const f of (await readdir(dir)).filter((f) => f.endsWith('.png'))) {
  const src = path.join(dir, f)
  await sharp(src).webp({ quality: 82 }).toFile(src.replace(/\.png$/, '.webp'))
  await unlink(src)
}
console.log('converted')
