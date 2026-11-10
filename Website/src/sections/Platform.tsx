import { useRef } from 'react'
import { Glass } from '../components/Glass'
import { Orbs } from '../components/Orbs'
import { Reveal } from '../components/Reveal'
import { DashboardMock } from '../mocks/DashboardMock'
import { PLATFORM } from '../config/copy'
import { gsap, ScrollTrigger } from '../motion/gsap'
import { useGsap } from '../motion/useGsap'
import { DUR, EASE } from '../motion/motion'
import { fadeIn } from '../motion/reveals'
import s from './Platform.module.css'

/**
 * Stats count up, bars grow and leaderboard rows stagger in. Built only when the card is in view, so the
 * prerendered final numbers stay on screen at rest if this never runs.
 */
function playArrival(scope: HTMLElement) {
  const tl = gsap.timeline({ defaults: { ease: EASE.out } })
  scope.querySelectorAll<HTMLElement>('[data-count]').forEach((n, i) => {
    const to = Number(n.dataset.count)
    const v = { n: 0 }
    tl.fromTo(v, { n: 0 }, { n: to, duration: 1.1, onUpdate: () => { n.textContent = String(Math.round(v.n)) } }, i * 0.06)
  })
  tl.fromTo(scope.querySelectorAll('[data-bars] > span'), { scaleY: 0 }, { scaleY: 1, duration: 0.9, stagger: 0.05 }, 0.05)
  tl.fromTo(scope.querySelectorAll('[data-row]'), { x: -24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, stagger: 0.07 }, 0.15)
  return tl
}

export function Platform() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, (q, el) => {
    const $ = gsap.utils.selector(el)
    if (q.reduce) {
      fadeIn($('[data-fade]'), el)
      return
    }
    const card = $('[data-card]')[0] as HTMLElement
    // The card rises into place and settles from 0.96 to 1, scrubbed lightly over its entrance. Never above 1.
    gsap.fromTo(
      card,
      { y: 90, scale: 0.96 },
      { y: 0, scale: 1, ease: 'power1.out', scrollTrigger: { trigger: card, start: 'top bottom', end: 'top 55%', scrub: 0.6 } },
    )
    gsap.from($('[data-fade]'), { y: 24, opacity: 0, duration: DUR.m, ease: EASE.out, stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 75%', once: true } })
    gsap.from($('[data-point]'), { y: 16, opacity: 0, duration: DUR.m, ease: EASE.out, stagger: 0.08, scrollTrigger: { trigger: $('[data-points]')[0], start: 'top 92%', once: true } })
    // Count up once the visible dashboard is well in view.
    const variant = $('[data-variant]').find((v) => getComputedStyle(v).display !== 'none') as HTMLElement | undefined
    if (variant) ScrollTrigger.create({ trigger: variant, start: 'top 70%', once: true, onEnter: () => playArrival(variant) })
  }, [])

  return (
    <section ref={root} id="platform" className={s.platform} aria-labelledby="platform-title">
      <Orbs
        orbs={[
          { x: '15%', y: '35%', size: '40vmax', tone: 'silver' },
          { x: '85%', y: '60%', size: '36vmax', tone: 'rose' },
        ]}
      />
      <div className={s.inner}>
        <div className={s.head}>
          <p className="eyebrow" data-fade>
            {PLATFORM.eyebrow}
          </p>
          <Reveal id="platform-title" variant="words" className={s.title}>
            {PLATFORM.title}
          </Reveal>
          <p className={`lead ${s.sub}`} data-fade>
            {PLATFORM.sub}
          </p>
        </div>

        <Glass className={s.card} tone="strong" radius="xl" specular={false} data-card>
          <div className={s.screen}>
            {/* Both layouts ship in the HTML. CSS picks one, so nothing jumps on hydration. */}
            <div className={s.wide} data-variant="wide">
              <DashboardMock fill />
            </div>
            <div className={s.narrow} data-variant="narrow">
              <DashboardMock compact />
            </div>
          </div>
        </Glass>

        <ul className={s.points} role="list" data-points>
          {PLATFORM.points.map((p) => (
            <li key={p} data-point>
              <span className={s.tick} aria-hidden="true" />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
