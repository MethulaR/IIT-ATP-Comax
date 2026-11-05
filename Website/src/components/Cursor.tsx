import { useEffect, useRef } from 'react'
import { gsap } from '../motion/gsap'
import { MQ } from '../motion/motion'
import s from './Cursor.module.css'

/** Dot plus lagging ring. Desktop fine pointers only, never on touch, off under reduced motion. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const fine = window.matchMedia(MQ.finePointer)
    const reduce = window.matchMedia(MQ.reduce)
    if (!fine.matches || reduce.matches || !dot.current || !ring.current) return
    const root = document.documentElement
    root.classList.add('has-cursor')
    const d = dot.current
    const r = ring.current
    gsap.set([d, r], { xPercent: -50, yPercent: -50, opacity: 0 })
    const dx = gsap.quickTo(d, 'x', { duration: 0.12, ease: 'power3.out' })
    const dy = gsap.quickTo(d, 'y', { duration: 0.12, ease: 'power3.out' })
    const rx = gsap.quickTo(r, 'x', { duration: 0.55, ease: 'power3.out' })
    const ry = gsap.quickTo(r, 'y', { duration: 0.55, ease: 'power3.out' })
    let shown = false
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      if (!shown) {
        shown = true
        gsap.set([d, r], { x: e.clientX, y: e.clientY })
        gsap.to([d, r], { opacity: 1, duration: 0.3 })
      }
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)
    }
    const interactive = 'a, button, [role="button"], label, summary, [data-cursor]'
    const onOver = (e: PointerEvent) => {
      const t = e.target as Element
      const hit = t.closest?.(interactive)
      const text = t.closest?.('input, textarea, select')
      r.dataset.state = text ? 'text' : hit ? 'link' : ''
      d.dataset.state = r.dataset.state
    }
    const onLeave = () => {
      shown = false
      gsap.to([d, r], { opacity: 0, duration: 0.3 })
    }
    const onDown = () => gsap.to(r, { scale: 0.8, duration: 0.2 })
    const onUp = () => gsap.to(r, { scale: 1, duration: 0.4, ease: 'expo.out' })
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    return () => {
      root.classList.remove('has-cursor')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])
  return (
    <>
      <div ref={ring} className={s.ring} aria-hidden="true" />
      <div ref={dot} className={s.dot} aria-hidden="true" />
    </>
  )
}
