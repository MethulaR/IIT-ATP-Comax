import { useRef } from 'react'
import { Button } from '../components/Button'
import { Orbs } from '../components/Orbs'
import { DashboardMock } from '../mocks/DashboardMock'
import { PORTAL_URL } from '../config/site'
import { HERO } from '../config/copy'
import { gsap } from '../motion/gsap'
import { useGsap } from '../motion/useGsap'
import { DUR, EASE } from '../motion/motion'
import { onIntro } from '../motion/intro'
import { splitReveal } from '../motion/reveals'
import s from './Hero.module.css'

/** Scale the dashboard starts at. It is laid out at full screen size, so it only ever scales down. */
const START_SCALE = 0.72
/** The expansion takes one screen of scroll, then holds at full screen for 40% more. */
const EXPAND = 1
const HOLD = 0.4

/** Stats count up, bars grow from the bottom, leaderboard rows slide in. Paused, played on arrival. */
function arrival(scope: HTMLElement) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.out } })
  scope.querySelectorAll<HTMLElement>('[data-count]').forEach((n, i) => {
    const to = Number(n.dataset.count)
    const v = { n: 0 }
    tl.fromTo(v, { n: 0 }, { n: to, duration: 1.1, onUpdate: () => { n.textContent = String(Math.round(v.n)) } }, i * 0.06)
  })
  tl.fromTo(scope.querySelectorAll('[data-bars] > span'), { scaleY: 0 }, { scaleY: 1, duration: 0.9, stagger: 0.05 }, 0.05)
  tl.fromTo(scope.querySelectorAll('[data-row]'), { x: -28, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, stagger: 0.07 }, 0.15)
  tl.progress(0)
  return tl
}

/** The dashboard variant CSS is showing at this width. */
const visibleVariant = (el: HTMLElement) =>
  [...el.querySelectorAll<HTMLElement>('[data-variant]')].find((v) => getComputedStyle(v).display !== 'none') ?? null

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
      tl.from($('[data-dash-in]'), { y: 140, duration: 1.6, ease: EASE.out }, 0.45)
    })

    if (q.desktop) {
      // Pinned: the dashboard grows from its frame under the buttons to the full viewport.
      // It is built at full size and starts at scale 0.72, so it always settles at its native resolution.
      const dash = $('[data-dash]')[0] as HTMLElement
      const frame = $('[data-frame]')[0] as HTMLElement
      const actions = $('[data-actions]')[0] as HTMLElement
      const variant = visibleVariant(el)
      const arrive = variant ? arrival(variant) : null
      // Top edge sits clearly below the buttons and peeks into the first screen. Layout offsets, not transforms.
      const layoutTop = (n: HTMLElement) => {
        let y = 0
        for (let c: HTMLElement | null = n; c && c !== el; c = c.offsetParent as HTMLElement | null) y += c.offsetTop
        return y
      }
      const startY = () => Math.round(Math.min(layoutTop(actions) + actions.offsetHeight + 56, window.innerHeight - 150))
      const total = EXPAND + HOLD
      let arrived = false
      // No will-change on the dashboard. Measured in Chrome (scripts/v2-dashboard.mjs): with will-change: transform
      // the layer keeps a raster from another scale and text softens mid scrub (sharpness 1634 against 3361 fresh).
      // Without it Chrome re-rasters the text at each scale, so every frame matches a fresh render.
      dash.style.willChange = 'auto'
      const tl = gsap.timeline({
        defaults: { ease: EASE.scrub },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: `+=${total * 100}%`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate(self) {
            const now = self.progress >= EXPAND / total - 0.005
            if (now === arrived) return
            arrived = now
            if (now) arrive?.play()
            else arrive?.reverse()
          },
        },
      })
      tl.to($('[data-copy]'), { yPercent: -30, autoAlpha: 0, filter: 'blur(10px)', duration: 0.45 }, 0)
      tl.fromTo(
        dash,
        { y: startY, scale: START_SCALE },
        // Whole pixels for y, so text never sits on a half pixel.
        { y: 0, scale: 1, duration: EXPAND, ease: 'power1.inOut', snap: { y: 1 } },
        0,
      )
      // The frame's corner radius (24px on screen at the start), outer ring and shadow shrink away. The browser chrome stays.
      tl.fromTo(
        frame,
        { borderRadius: 24 / START_SCALE, boxShadow: '0 0 0 14px rgba(255,255,255,0.55), 0 0 0 15px rgba(212,212,217,0.9), 0 40px 90px -30px rgba(61,10,20,0.35)' },
        { borderRadius: 0, boxShadow: '0 0 0 0px rgba(255,255,255,0), 0 0 0 0px rgba(212,212,217,0), 0 0px 0px 0px rgba(61,10,20,0)', duration: EXPAND, ease: 'power1.inOut' },
        0,
      )
      tl.to($('[data-orbs]'), { yPercent: -20, opacity: 0.4, duration: EXPAND }, 0)
      tl.to({}, { duration: HOLD }) // hold at full screen so it can be read
    } else {
      // Compact: no pin. The copy fades lightly and the stacked dashboard animates once it is on screen.
      gsap.to($('[data-copy]'), {
        y: -40,
        opacity: 0.2,
        ease: EASE.scrub,
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
      })
      const variant = visibleVariant(el)
      if (variant) {
        const arrive = arrival(variant)
        gsap.timeline({
          scrollTrigger: {
            trigger: variant,
            start: 'top 75%',
            onEnter: () => arrive.play(),
            onLeaveBack: () => arrive.reverse(),
          },
        })
      }
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
        <div className={s.actions} data-intro data-actions>
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
            <div className={s.frame} data-frame>
              {/* Both layouts ship in the HTML. CSS picks one, so nothing jumps on hydration. */}
              <div className={s.wide} data-variant="wide">
                <DashboardMock fill />
              </div>
              <div className={s.narrow} data-variant="narrow">
                <DashboardMock compact />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
