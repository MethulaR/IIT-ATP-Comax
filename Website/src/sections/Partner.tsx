import { useRef } from 'react'
import { PARTNER } from '../config/copy'
import { Glass } from '../components/Glass'
import { Reveal } from '../components/Reveal'
import { Orbs } from '../components/Orbs'
import { gsap } from '../motion/gsap'
import { useGsap } from '../motion/useGsap'
import { DUR, EASE } from '../motion/motion'
import { fadeIn } from '../motion/reveals'
import logo480 from '../assets/visionex-logo-480.webp'
import logo960 from '../assets/visionex-logo-960.webp'
import iit240 from '../assets/iit-logo-240.webp'
import iit480 from '../assets/iit-logo-480.webp'
import s from './Partner.module.css'

export function Partner() {
  const root = useRef<HTMLElement>(null)
  useGsap(root, (q, el) => {
    const $ = gsap.utils.selector(el)
    if (q.reduce) {
      fadeIn($('[data-fade]'), el)
      return
    }
    const card = $('[data-card]')[0]
    const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 78%', once: true } })
    tl.from(card, { y: 70, scale: 0.96, opacity: 0, duration: DUR.l, ease: EASE.out })
    // A band of light sweeps across the logo once, like metal catching a lamp.
    tl.fromTo($('[data-sweep]'), { xPercent: -120 }, { xPercent: 120, duration: 1.4, ease: EASE.inOut }, 0.35)
    tl.from($('[data-line]'), { y: 20, opacity: 0, duration: DUR.m, ease: EASE.out, stagger: 0.08 }, 0.4)
    tl.from($('[data-slot]'), { opacity: 0, y: 20, duration: DUR.m, ease: EASE.out, stagger: 0.08 }, 0.6)
  }, [])

  return (
    <section ref={root} id="partners" className={s.partner} aria-labelledby="partner-title">
      <Orbs orbs={[{ x: '30%', y: '60%', size: '44vmax', tone: 'rose' }, { x: '80%', y: '40%', size: '36vmax', tone: 'silver' }]} />
      <div className={`container ${s.inner}`}>
        <div className={s.head}>
          <p className="eyebrow" data-fade>
            {PARTNER.eyebrow}
          </p>
          <Reveal id="partner-title" variant="wipe" className={s.title}>
            {PARTNER.title}
          </Reveal>
        </div>

        <Glass as="article" tone="strong" radius="xl" className={s.card} data-card aria-label={`${PARTNER.name}, ${PARTNER.role}`}>
          <div className={s.logoBox}>
            <div className={s.logo}>
              <img
                className={s.logoImg}
                src={logo960}
                srcSet={`${logo480} 480w, ${logo960} 960w`}
                sizes="(min-width: 860px) 380px, 80vw"
                width={960}
                height={279}
                alt="VisioNEX logo"
                loading="lazy"
                decoding="async"
              />
              <span className={s.sweep} data-sweep aria-hidden="true" />
            </div>
          </div>
          <div className={s.copy}>
            <p className={s.role} data-line>
              {PARTNER.role}
            </p>
            <p className={s.about} data-line>
              {PARTNER.about}
            </p>
            <p className={s.context} data-line>
              {PARTNER.context}
            </p>
            <ul className={s.cities} role="list" aria-label="Host cities" data-line>
              {PARTNER.cities.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <div className={s.org} data-line>
              <span className={s.orgLabel}>Organised by</span>
              <img
                className={s.orgLogo}
                src={iit480}
                srcSet={`${iit240} 240w, ${iit480} 480w`}
                sizes="150px"
                width={480}
                height={197}
                alt="Informatics Institute of Technology"
                loading="lazy"
                decoding="async"
              />
            </div>
            <blockquote className={s.quote} data-line>
              <p>{PARTNER.quote}</p>
            </blockquote>
          </div>
        </Glass>

        <div className={s.slots} aria-label="Space reserved for future partners" role="group">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={s.slot} data-slot>
              <span>Future partner</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
