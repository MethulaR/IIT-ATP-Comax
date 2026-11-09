import { useRef } from 'react'
import { Glass } from '../components/Glass'
import { Button } from '../components/Button'
import { Orbs } from '../components/Orbs'
import { Fit } from '../components/Fit'
import { DashboardMock } from '../mocks/DashboardMock'
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
      // Intro tweens sit on their own wrapper so they never fight the scroll transforms.
      tl.from($('[data-dash-in]'), { y: 140, opacity: 0, scale: 0.94, duration: 1.6, ease: EASE.out }, 0.45)
    })

    if (q.desktop) {
      // Scrubbed exit: headline drifts up and blurs, dashboard grows to fill the screen.
      const dash = $('[data-dash]')[0] as HTMLElement
      const stage = dash.parentElement as HTMLElement
      // Measured from layout (offsets), not from transforms, so the intro tween never skews it.
      const cover = () => Math.max(window.innerWidth / dash.offsetWidth, window.innerHeight / dash.offsetHeight) * 1.08
      const toCenter = () => window.innerHeight / 2 - (stage.offsetTop + dash.offsetTop + dash.offsetHeight / 2)
      const tl = gsap.timeline({
        defaults: { ease: EASE.scrub },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: '+=110%',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      tl.to($('[data-copy]'), { yPercent: -40, opacity: 0, filter: 'blur(12px)', duration: 0.5 }, 0)
      tl.to(dash, { y: toCenter, scale: cover, duration: 1 }, 0.05)
      tl.to($('[data-dash-veil]'), { opacity: 1, duration: 0.35 }, 0.7)
      tl.to($('[data-orbs]'), { yPercent: -20, opacity: 0.4, duration: 1 }, 0)
    } else {
      // Compact: a light scrubbed fade, no pin.
      gsap.to($('[data-copy]'), {
        y: -40,
        opacity: 0.2,
        ease: EASE.scrub,
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
      })
    }
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

      <div className={s.stage}>
        <div className={s.dash} data-dash>
            <div data-dash-in className={s.dashIn}>
              <Glass className={s.dashGlass} radius="xl" specular={false}>
                <div className={s.dashScreen}>
                  {/* Both layouts ship in the HTML. CSS picks one, so nothing jumps on hydration. */}
                  <div className={s.wide}>
                    <Fit w={1040} h={640}>
                      <DashboardMock />
                    </Fit>
                  </div>
                  <div className={s.narrow}>
                    <Fit w={560} h={520}>
                      <DashboardMock compact />
                    </Fit>
                  </div>
                </div>
              </Glass>
              <div className={s.veil} data-dash-veil aria-hidden="true" />
            </div>
        </div>
      </div>
    </section>
  )
}
