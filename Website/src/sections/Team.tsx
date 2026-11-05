import { useRef } from 'react'
import { TEAM } from '../config/copy'
import { Glass } from '../components/Glass'
import { Reveal } from '../components/Reveal'
import { gsap } from '../motion/gsap'
import { useGsap } from '../motion/useGsap'
import { EASE } from '../motion/motion'
import { fadeIn } from '../motion/reveals'
import s from './Team.module.css'

const initials = (name: string) =>
  name
    .replace(/[^A-Za-z ]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .filter((_, i, a) => i === 0 || i === a.length - 1)
    .join('')

export function Team() {
  const root = useRef<HTMLElement>(null)
  useGsap(root, (q, el) => {
    const $ = gsap.utils.selector(el)
    const cards = $('[data-member]') as HTMLElement[]
    if (q.reduce) {
      fadeIn(cards, el)
      return
    }
    gsap.from(cards, {
      y: 80,
      rotateX: 14,
      opacity: 0,
      duration: 1.3,
      ease: EASE.out,
      stagger: { each: 0.09, grid: 'auto', from: 'start' },
      scrollTrigger: { trigger: $('[data-grid]')[0], start: 'top 80%', once: true },
    })
    if (!q.finePointer) return
    // Hover tilt, a few degrees, following the pointer.
    const offs = cards.map((c) => {
      const rx = gsap.quickTo(c, 'rotationX', { duration: 0.6, ease: 'power3.out' })
      const ry = gsap.quickTo(c, 'rotationY', { duration: 0.6, ease: 'power3.out' })
      const move = (e: PointerEvent) => {
        const r = c.getBoundingClientRect()
        ry(((e.clientX - r.left) / r.width - 0.5) * 10)
        rx(-((e.clientY - r.top) / r.height - 0.5) * 10)
      }
      const leave = () => {
        rx(0)
        ry(0)
      }
      c.addEventListener('pointermove', move)
      c.addEventListener('pointerleave', leave)
      return () => {
        c.removeEventListener('pointermove', move)
        c.removeEventListener('pointerleave', leave)
      }
    })
    return () => offs.forEach((o) => o())
  }, [])

  return (
    <section ref={root} id="team" className={s.team} aria-labelledby="team-title">
      <div className="container">
        <div className={s.head}>
          <p className="eyebrow">{TEAM.eyebrow}</p>
          <Reveal id="team-title" variant="words" className={s.title}>
            {TEAM.title}
          </Reveal>
        </div>
        <ul className={s.grid} role="list" data-grid>
          {TEAM.members.map((m) => (
            <li key={m.name} className={s.cell}>
              <Glass radius="l" className={s.card} data-member>
                <span className={s.avatar} aria-hidden="true">
                  {initials(m.name)}
                </span>
                <span className={s.text}>
                  <span className={s.name}>{m.name}</span>
                  <span className={s.role}>{m.role}</span>
                </span>
              </Glass>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
