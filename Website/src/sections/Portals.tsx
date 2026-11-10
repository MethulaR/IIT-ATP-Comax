import { useRef } from 'react'
import { Glass } from '../components/Glass'
import { Fit } from '../components/Fit'
import { Reveal } from '../components/Reveal'
import { Orbs } from '../components/Orbs'
import { PORTALS } from '../config/copy'
import { PublicMock, ParticipantMock, JudgeMock, OrganizerMock } from '../mocks/PortalMocks'
import { gsap } from '../motion/gsap'
import { useGsap } from '../motion/useGsap'
import { EASE, PIN, clamp } from '../motion/motion'
import { scrollState } from '../motion/scroll'
import { fadeIn, riseIn } from '../motion/reveals'
import s from './Portals.module.css'

const MOCKS = { public: PublicMock, participant: ParticipantMock, judge: JudgeMock, organizer: OrganizerMock } as const

export function Portals() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, (q, el) => {
    const $ = gsap.utils.selector(el)
    const panels = $('[data-panel]') as HTMLElement[]
    if (q.reduce) {
      fadeIn(panels, el)
      return
    }
    if (!q.desktop) {
      panels.forEach((p) => riseIn(p, p))
      return
    }

    const track = $('[data-track]')[0] as HTMLElement
    const bar = $('[data-bar]')[0] as HTMLElement
    const count = $('[data-count]')[0] as HTMLElement
    const distance = () => track.scrollWidth - window.innerWidth

    const tl = gsap.timeline({
      defaults: { ease: EASE.scrub },
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: `+=${PIN.long * 100}%`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          const i = Math.min(panels.length, Math.floor(self.progress * panels.length * 0.999) + 1)
          count.textContent = String(i).padStart(2, '0')
        },
      },
    })
    tl.to(track, { x: () => -distance(), duration: 1 }, 0)
    tl.fromTo(bar, { scaleX: 0.25 }, { scaleX: 1, duration: 1 }, 0)
    // Each mock drifts a little against the panel for depth.
    panels.forEach((p) => {
      tl.fromTo(p.querySelector('[data-mock]'), { xPercent: 6 }, { xPercent: -6, duration: 1 }, 0)
    })

    // Velocity tilt: panels lean into the scroll and settle when it stops.
    const tilts = panels.map((p) => gsap.quickTo(p, 'rotationY', { duration: 0.6, ease: 'power3.out' }))
    const skews = panels.map((p) => gsap.quickTo(p, 'z', { duration: 0.6, ease: 'power3.out' }))
    const tick = () => {
      const v = scrollState.velocity
      const deg = clamp(-v * 0.35, -7, 7)
      tilts.forEach((t) => t(deg))
      skews.forEach((t) => t(-Math.abs(deg) * 6))
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  return (
    <section ref={root} id="portals" className={s.portals} aria-labelledby="portals-title">
      <a className="skip-section" href="#features">
        Skip to features
      </a>
      <Orbs
        orbs={[
          { x: '20%', y: '70%', size: '40vmax', tone: 'maroon' },
          { x: '75%', y: '25%', size: '36vmax', tone: 'silver' },
          { x: '95%', y: '85%', size: '30vmax', tone: 'rose' },
        ]}
      />
      <div className={s.inner}>
        <div className={s.head}>
          <div>
            <p className="eyebrow">{PORTALS.eyebrow}</p>
            <Reveal id="portals-title" variant="chars" className={s.title}>
              {PORTALS.title}
            </Reveal>
          </div>
          <div className={s.progress} aria-hidden="true">
            <span className={`num ${s.count}`}>
              <span data-count>01</span> / 04
            </span>
            <span className={s.rail}>
              <span className={s.bar} data-bar />
            </span>
          </div>
        </div>
        <div className={s.viewport}>
          <ol className={s.track} data-track role="list">
            {PORTALS.panels.map((p, i) => {
              const Mock = MOCKS[p.key as keyof typeof MOCKS]
              return (
                <li key={p.key} className={s.item}>
                  <Glass as="article" className={s.panel} tone="strong" radius="xl" data-panel aria-labelledby={`portal-${p.key}`}>
                    <div className={s.text}>
                      <p className={s.index}>
                        <span className="num">0{i + 1}</span> {p.name}
                      </p>
                      <h3 id={`portal-${p.key}`} className={s.panelTitle}>
                        {p.title}
                      </h3>
                      <p className={s.body}>{p.body}</p>
                      <ul className={s.points} role="list">
                        {p.points.map((pt) => (
                          <li key={pt}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                    <div className={s.mock} data-mock>
                      <Fit w={640} h={440}>
                        <Mock />
                      </Fit>
                    </div>
                  </Glass>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
