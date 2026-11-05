import { useEffect, useRef } from 'react'
import { TRUST } from '../config/copy'
import { Glass } from '../components/Glass'
import { Reveal } from '../components/Reveal'
import { gsap, ScrollTrigger } from '../motion/gsap'
import { useGsap } from '../motion/useGsap'
import { EASE } from '../motion/motion'
import { fadeIn } from '../motion/reveals'
import s from './Trust.module.css'

const ICONS: Record<string, React.ReactNode> = {
  verified: (
    <>
      <path d="M20 4 33 9v10c0 8-5.6 14.4-13 17C12.6 33.4 7 27 7 19V9l13-5Z" />
      <path d="m14 19.5 4.2 4.2L26.5 15" />
    </>
  ),
  roles: (
    <>
      <circle cx="14" cy="13" r="5" />
      <path d="M5 31c0-5 4-9 9-9s9 4 9 9" />
      <path d="M26 12h9M26 18h9M29 24h6" />
    </>
  ),
  audit: (
    <>
      <rect x="8" y="5" width="24" height="30" rx="4" />
      <path d="M14 13h12M14 19h12M14 25h7" />
      <circle cx="29" cy="29" r="6" />
      <path d="M29 26.5V29l1.8 1.5" />
    </>
  ),
  sandbox: (
    <>
      <path d="M20 4 34 12v16l-14 8-14-8V12l14-8Z" />
      <path d="m6 12 14 8 14-8M20 20v16" />
    </>
  ),
  privacy: (
    <>
      <rect x="9" y="17" width="22" height="17" rx="4" />
      <path d="M14 17v-4a6 6 0 0 1 12 0v4" />
      <circle cx="20" cy="25" r="2.4" />
    </>
  ),
}

export function Trust() {
  const root = useRef<HTMLElement>(null)
  const defs = useRef<SVGSVGElement>(null)

  // The SMIL sheen in the icons ignores CSS, so pause it by hand under reduced motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) defs.current?.pauseAnimations()
  }, [])

  useGsap(root, (q, el) => {
    const $ = gsap.utils.selector(el)
    const cards = $('[data-card]') as HTMLElement[]
    if (q.reduce) {
      cards.forEach((c) => c.setAttribute('data-lit', ''))
      fadeIn(cards, el)
      return
    }
    // A beam of light travels down the section. Each card lights up as the beam passes it.
    gsap.fromTo(
      $('[data-beam]'),
      { yPercent: 0 },
      { yPercent: 100, ease: EASE.scrub, scrollTrigger: { trigger: el, start: 'top 60%', end: 'bottom 40%', scrub: 0.8 } },
    )
    gsap.fromTo($('[data-glow]'), { yPercent: -20 }, { yPercent: 20, ease: EASE.scrub, scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
    // Cards light up once the beam (62% of the viewport) has passed their top edge.
    const light = () => {
      const beam = window.innerHeight * 0.62
      cards.forEach((c) => c.toggleAttribute('data-lit', c.getBoundingClientRect().top < beam))
    }
    ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onUpdate: light, onRefresh: light })
    cards.forEach((c, i) => {
      gsap.from(c, {
        y: 50,
        rotateX: -12,
        opacity: 0,
        duration: 1.2,
        ease: EASE.out,
        delay: (i % 3) * 0.08,
        scrollTrigger: { trigger: c, start: 'top 88%', once: true },
      })
    })
  }, [])

  return (
    <section ref={root} id="trust" className={s.trust} aria-labelledby="trust-title">
      <svg ref={defs} width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="trust-metal" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#8C8F98" />
            <stop offset="0.4" stopColor="#C9CBD1" />
            <stop offset="0.5" stopColor="#FDFDFD" />
            <stop offset="0.6" stopColor="#C9CBD1" />
            <stop offset="1" stopColor="#8C8F98" />
            <animateTransform attributeName="gradientTransform" type="translate" values="-40 -40; 40 40; 40 40" keyTimes="0; 0.6; 1" dur="5s" repeatCount="indefinite" />
          </linearGradient>
        </defs>
      </svg>
      <div className={s.glow} data-glow aria-hidden="true" />
      <div className={s.beamTrack} aria-hidden="true">
        <span className={s.beam} data-beam />
      </div>
      <div className={`container ${s.inner}`}>
        <div className={s.head}>
          <p className={`eyebrow ${s.eyebrow}`}>{TRUST.eyebrow}</p>
          <Reveal id="trust-title" variant="chars" className={`${s.title} metal metal--silver`}>
            {TRUST.title}
          </Reveal>
          <p className={s.body}>{TRUST.body}</p>
        </div>
        <ul className={s.grid} role="list">
          {TRUST.points.map((p) => (
            <li key={p.title} className={s.cell}>
              <Glass tone="dark" radius="l" className={s.card} data-card>
                <svg className={s.icon} viewBox="0 0 40 40" aria-hidden="true">
                  <g fill="none" stroke="url(#trust-metal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {ICONS[p.icon]}
                  </g>
                </svg>
                <h3 className={s.cardTitle}>{p.title}</h3>
                <p className={s.cardBody}>{p.body}</p>
              </Glass>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
