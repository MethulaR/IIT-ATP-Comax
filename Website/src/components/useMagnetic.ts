import { useEffect, type RefObject } from 'react'
import { gsap } from '../motion/gsap'
import { MQ } from '../motion/motion'

/** Pulls an element slightly toward the cursor. Fine pointers only, never under reduced motion. */
export function useMagnetic(ref: RefObject<HTMLElement | null>, strength = 0.3) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!window.matchMedia(MQ.finePointer).matches || window.matchMedia(MQ.reduce).matches) return
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' })
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * strength)
      yTo((e.clientY - (r.top + r.height / 2)) * strength)
    }
    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)', overwrite: true })
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      gsap.killTweensOf(el)
      gsap.set(el, { clearProps: 'x,y' })
    }
  }, [ref, strength])
}
