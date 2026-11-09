import { useEffect, useRef } from 'react'
import { gsap } from '../motion/gsap'
import { MQ } from '../motion/motion'
import s from './Cursor.module.css'

const TRAIL = 16 // points kept for the ink ribbon
const INK = [107, 20, 36] // --maroon-700

/**
 * A maroon marker with an ink trail. The diamond leans into the direction of travel and stretches with speed,
 * a tapered ribbon follows and dries up when the pointer rests, links turn it into a square target frame,
 * and a click throws four small sparks. Desktop fine pointers only, never on touch, off under reduced motion.
 */
export function Cursor() {
  const head = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const fine = window.matchMedia(MQ.finePointer)
    const reduce = window.matchMedia(MQ.reduce)
    const h = head.current
    const cv = canvas.current
    if (!fine.matches || reduce.matches || !h || !cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const root = document.documentElement
    root.classList.add('has-cursor')

    let dpr = 1
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      cv.width = Math.round(window.innerWidth * dpr)
      cv.height = Math.round(window.innerHeight * dpr)
    }
    size()
    window.addEventListener('resize', size)

    // Pointer target, smoothed head position, trail points and sparks.
    let tx = -100, ty = -100, x = -100, y = -100
    let shown = false
    let link = false
    let angle = 0
    let idle = true
    const pts: Array<{ x: number; y: number }> = []
    const sparks: Array<{ x: number; y: number; vx: number; vy: number; life: number }> = []
    gsap.set(h, { opacity: 0 })

    const tick = () => {
      // Head follows with a little lag, so it feels drawn rather than glued on.
      const px = x, py = y
      x += (tx - x) * 0.35
      y += (ty - y) * 0.35
      const vx = x - px, vy = y - py
      const speed = Math.hypot(vx, vy)
      if (speed > 0.6) angle = Math.atan2(vy, vx)
      const stretch = link ? 1 : 1 + Math.min(speed / 18, 0.9)
      const deg = link ? 0 : (angle * 180) / Math.PI + 45
      h.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${deg}deg) scale(${stretch}, ${1 / Math.sqrt(stretch)})`

      // Ink ribbon: add a point while moving, let the tail dry up when resting.
      if (shown && speed > 0.3) pts.unshift({ x, y })
      else if (pts.length) pts.pop()
      if (pts.length > TRAIL) pts.length = TRAIL

      // Nothing to draw: clear once and skip the canvas until something moves again.
      if (!pts.length && !sparks.length) {
        if (!idle) {
          ctx.setTransform(1, 0, 0, 1, 0, 0)
          ctx.clearRect(0, 0, cv.width, cv.height)
          idle = true
        }
        return
      }
      idle = false
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      ctx.lineCap = 'round'
      for (let i = 1; i < pts.length; i++) {
        const t = 1 - i / TRAIL
        ctx.strokeStyle = `rgba(${INK[0]}, ${INK[1]}, ${INK[2]}, ${(t * 0.38).toFixed(3)})`
        ctx.lineWidth = Math.max(0.5, t * 5)
        ctx.beginPath()
        ctx.moveTo(pts[i - 1].x, pts[i - 1].y)
        ctx.lineTo(pts[i].x, pts[i].y)
        ctx.stroke()
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i]
        sp.x += sp.vx
        sp.y += sp.vy
        sp.vx *= 0.88
        sp.vy *= 0.88
        sp.life -= 0.05
        if (sp.life <= 0) {
          sparks.splice(i, 1)
          continue
        }
        ctx.fillStyle = `rgba(${INK[0]}, ${INK[1]}, ${INK[2]}, ${sp.life.toFixed(3)})`
        ctx.save()
        ctx.translate(sp.x, sp.y)
        ctx.rotate(Math.PI / 4)
        const r = 2.5 * sp.life + 0.5
        ctx.fillRect(-r, -r, r * 2, r * 2)
        ctx.restore()
      }
    }
    gsap.ticker.add(tick)

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      tx = e.clientX
      ty = e.clientY
      if (!shown) {
        shown = true
        x = tx
        y = ty
        gsap.to(h, { opacity: 1, duration: 0.3 })
      }
    }
    const interactive = 'a, button, [role="button"], label, summary, [data-cursor]'
    const onOver = (e: PointerEvent) => {
      const t = e.target as Element
      const text = !!t.closest?.('input, textarea, select')
      link = !text && !!t.closest?.(interactive)
      h.dataset.state = text ? 'text' : link ? 'link' : ''
    }
    const onLeave = () => {
      shown = false
      gsap.to(h, { opacity: 0, duration: 0.3 })
    }
    const onDown = () => {
      // Four sparks, one from each corner of the diamond.
      for (let i = 0; i < 4; i++) {
        const a = Math.PI / 4 + (i * Math.PI) / 2
        sparks.push({ x, y, vx: Math.cos(a) * 4.5, vy: Math.sin(a) * 4.5, life: 1 })
      }
      h.dataset.down = 'true'
    }
    const onUp = () => {
      delete h.dataset.down
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    return () => {
      gsap.ticker.remove(tick)
      root.classList.remove('has-cursor')
      window.removeEventListener('resize', size)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])
  return (
    <>
      <canvas ref={canvas} className={s.ink} aria-hidden="true" />
      <div ref={head} className={s.head} aria-hidden="true">
        <span className={s.mark} />
      </div>
    </>
  )
}
