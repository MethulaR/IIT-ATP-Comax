import { useRef } from 'react'
import { MARQUEE } from '../config/copy'
import { gsap } from '../motion/gsap'
import { useGsap } from '../motion/useGsap'
import { clamp } from '../motion/motion'
import { scrollState } from '../motion/scroll'
import s from './Marquee.module.css'

function Row({ variant }: { variant: 'outline' | 'metal' }) {
  const items = [...MARQUEE, ...MARQUEE]
  return (
    <div className={s.row} data-row aria-hidden="true">
      <div className={s.strip} data-strip>
        {items.map((w, i) => (
          <span key={i} className={variant === 'outline' ? (i % 2 ? `${s.word} metal` : `${s.word} ${s.outline}`) : i % 2 ? `${s.word} ${s.outline}` : `${s.word} metal`}>
            {w}
            <i className={s.sep}>·</i>
          </span>
        ))}
      </div>
    </div>
  )
}

export function Marquee() {
  const root = useRef<HTMLElement>(null)
  useGsap(root, (q, el) => {
    if (q.reduce) return
    const $ = gsap.utils.selector(el)
    const strips = $('[data-strip]')
    // Each strip holds the list twice. Moving it by half its width loops seamlessly.
    const loops = strips.map((st, i) =>
      gsap.fromTo(st, { xPercent: i ? -50 : 0 }, { xPercent: i ? 0 : -50, duration: 38, ease: 'none', repeat: -1 }),
    )
    const skew = $('[data-row]').map((r) => gsap.quickTo(r, 'skewX', { duration: 0.5, ease: 'power3.out' }))
    const tick = () => {
      const v = scrollState.velocity
      skew.forEach((k) => k(clamp(-v * 0.4, -10, 10)))
      const speed = 1 + Math.min(Math.abs(v) * 0.12, 4)
      loops.forEach((l) => l.timeScale(speed * (v < -0.5 ? -1 : 1)))
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  return (
    <section ref={root} id="marquee" className={s.marquee} aria-label="What CoMax runs">
      <ul className="sr-only">
        {MARQUEE.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      <Row variant="outline" />
      <Row variant="metal" />
    </section>
  )
}
