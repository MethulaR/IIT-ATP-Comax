import { useRef } from 'react'
import { Glass } from '../components/Glass'
import { Fit } from '../components/Fit'
import { Reveal } from '../components/Reveal'
import { FEATURES } from '../config/copy'
import { FEATURE_SCREENS } from '../mocks/FeatureScreens'
import { gsap, ScrollTrigger } from '../motion/gsap'
import { useGsap } from '../motion/useGsap'
import { fadeIn, riseIn } from '../motion/reveals'
import u from '../mocks/ui.module.css'
import s from './Features.module.css'

const W = 720
const H = 420

function Screen({ k, label }: { k: keyof typeof FEATURE_SCREENS; label: string }) {
  const C = FEATURE_SCREENS[k]
  return (
    <div className={u.screen} style={{ gridTemplateRows: '1fr' }} role="img" aria-label={label}>
      <div aria-hidden="true" style={{ height: '100%' }}>
        <C />
      </div>
    </div>
  )
}

export function Features() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, (q, el) => {
    const $ = gsap.utils.selector(el)
    const blocks = $('[data-block]') as HTMLElement[]
    const screens = $('[data-screen]') as HTMLElement[]
    const inline = $('[data-inline]') as HTMLElement[]

    if (q.reduce) {
      fadeIn(blocks, el)
      screens.forEach((sc, i) => (sc.toggleAttribute('data-active', i === 0)))
      inline.forEach((sc) => sc.setAttribute('data-active', ''))
      return
    }

    if (!q.desktop) {
      blocks.forEach((b) => riseIn(b, b))
      // Run each inline screen's loop only while it is on screen.
      inline.forEach((sc) =>
        ScrollTrigger.create({ trigger: sc, start: 'top 90%', end: 'bottom 10%', onToggle: (self) => sc.toggleAttribute('data-active', self.isActive) }),
      )
      return
    }

    // Desktop: the section pins. The heading and the device stay still; only the text column moves.
    const column = $('[data-column]')[0] as HTMLElement
    const viewport = column.parentElement as HTMLElement
    const last = blocks.length - 1
    gsap.set(screens, { autoAlpha: 0 })
    gsap.set(screens[0], { autoAlpha: 1 })
    screens[0].setAttribute('data-active', '')
    let current = -1
    const show = (i: number) => {
      if (i === current) return
      blocks.forEach((b, j) => b.toggleAttribute('data-current', j === i))
      $('[data-dot]').forEach((d, j) => d.toggleAttribute('data-on', j === i))
      // Only the screen crossfades. The frame never moves.
      screens.forEach((sc, j) => {
        sc.toggleAttribute('data-active', j === i)
        gsap.to(sc, { autoAlpha: j === i ? 1 : 0, duration: 0.4, ease: 'power1.inOut', overwrite: true })
      })
      current = i
    }
    // y that puts a block's centre on the centre of the text viewport.
    const centreY = (b: HTMLElement) => viewport.clientHeight / 2 - (b.offsetTop + b.offsetHeight / 2)
    // The active feature is the one nearest the vertical centre, measured on every update.
    const sync = () => {
      const mid = viewport.getBoundingClientRect().top + viewport.clientHeight / 2
      let best = 0
      let dist = Infinity
      blocks.forEach((b, j) => {
        const r = b.getBoundingClientRect()
        const d = Math.abs(r.top + r.height / 2 - mid)
        if (d < dist) {
          dist = d
          best = j
        }
      })
      show(best)
    }
    gsap.fromTo(
      column,
      { y: () => centreY(blocks[0]) },
      {
        y: () => centreY(blocks[last]),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          // About 60% of the viewport per feature.
          end: `+=${blocks.length * 60}%`,
          scrub: 0.5,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: { snapTo: 1 / last, duration: { min: 0.2, max: 0.6 }, delay: 0.1, ease: 'power1.inOut', inertia: false },
          onRefresh: sync,
        },
        // Measured from the column's own frames, so the active feature follows the smoothed scrub.
        onUpdate: sync,
      },
    )
    show(0)
  }, [])

  return (
    <section ref={root} id="features" className={s.features} aria-labelledby="features-title">
      <a className="skip-section" href="#how">
        Skip to how it works
      </a>
      <div className="container">
        <div className={s.head}>
          <p className="eyebrow">{FEATURES.eyebrow}</p>
          <Reveal id="features-title" variant="words" className={s.title}>
            {FEATURES.title}
          </Reveal>
        </div>
        <div className={s.layout}>
          <div className={s.sticky}>
            <div className={s.perspective}>
              <Glass className={s.device} radius="xl" data-device specular={false}>
                <div className={s.deviceBar} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <span>app.comaxdigital.com</span>
                </div>
                <div className={s.deviceScreen}>
                  <Fit w={W} h={H}>
                    {FEATURES.items.map((it) => (
                      <div key={it.key} className={s.screenLayer} data-screen>
                        <Screen k={it.key as keyof typeof FEATURE_SCREENS} label={it.label} />
                      </div>
                    ))}
                  </Fit>
                </div>
              </Glass>
              <div className={s.dots} aria-hidden="true">
                {FEATURES.items.map((it, i) => (
                  <span key={it.key} data-dot data-on={i === 0 || undefined} />
                ))}
              </div>
            </div>
          </div>
          <div className={s.viewport}>
          <ol className={s.blocks} role="list" data-column>
            {FEATURES.items.map((it, i) => (
              <li key={it.key} className={s.block} data-block>
                <p className={s.num} aria-hidden="true">
                  <span data-num className="num">
                    0{i + 1}
                  </span>
                </p>
                <h3 className={s.blockTitle}>{it.title}</h3>
                <p className={s.blockBody}>{it.body}</p>
                <div className={s.inline} data-inline>
                  <Fit w={W} h={H}>
                    <Screen k={it.key as keyof typeof FEATURE_SCREENS} label={it.label} />
                  </Fit>
                </div>
              </li>
            ))}
          </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
