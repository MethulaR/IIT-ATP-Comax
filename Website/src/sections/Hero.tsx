import { useRef } from 'react'
import { Button } from '../components/Button'
import { Orbs } from '../components/Orbs'
import { PORTAL_URL } from '../config/site'
import { HERO } from '../config/copy'
import { gsap } from '../motion/gsap'
import { useGsap } from '../motion/useGsap'
import { DUR, EASE } from '../motion/motion'
import { onIntro } from '../motion/intro'
import { splitReveal } from '../motion/reveals'
import s from './Hero.module.css'

export function Hero() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, (q, el) => {
    const $ = gsap.utils.selector(el)
    const h1 = $('h1')[0] as HTMLElement

    if (q.reduce) return // Everything is already visible. The loader fades over it.

    // Intro: plays as the loader lens opens. The headline is plain text until now, which keeps LCP early.
    const off = onIntro(() => {
      const reveal = splitReveal(h1, { variant: 'words', scroll: false })
      const tl = gsap.timeline()
      tl.add(() => reveal.play(), 0)
      tl.from($('[data-intro]'), { y: 26, opacity: 0, filter: 'blur(6px)', duration: DUR.l, ease: EASE.out, stagger: 0.08 }, 0.35)
    })

    // A light scrubbed fade as the hero scrolls away. No pin.
    gsap.to($('[data-copy]'), {
      y: -40,
      opacity: 0.2,
      ease: EASE.scrub,
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
    })
    return off
  }, [])

  return (
    <section ref={root} id="top" className={s.hero} aria-labelledby="hero-title">
      <div data-orbs className={s.orbs}>
        <Orbs
          orbs={[
            { x: '18%', y: '30%', size: '46vmax', tone: 'silver' },
            { x: '82%', y: '22%', size: '38vmax', tone: 'maroon' },
            { x: '60%', y: '86%', size: '52vmax', tone: 'rose' },
            { x: '12%', y: '92%', size: '30vmax', tone: 'maroon' },
          ]}
        />
      </div>
      <div className={s.copy} data-copy>
        <p className="eyebrow" data-intro>
          {HERO.eyebrow}
        </p>
        <h1 id="hero-title" className={s.title}>
          {HERO.title[0]} <br className={s.br} />
          {HERO.title[1]} <br className={s.br} />
          <span className="metal">{HERO.title[2]}</span>
        </h1>
        <p className={`lead ${s.lead}`} data-intro>
          {HERO.sub}
        </p>
        <div className={s.actions} data-intro>
          <Button href={PORTAL_URL} size="l" icon>
            Request a demo
          </Button>
          <Button href="#how" variant="glass" size="l">
            See how it works
          </Button>
        </div>
      </div>

    </section>
  )
}
