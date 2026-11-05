import { useRef } from 'react'
import { Glass } from '../components/Glass'
import { Fit } from '../components/Fit'
import { Reveal } from '../components/Reveal'
import { FEATURES } from '../config/copy'
import { FEATURE_SCREENS } from '../mocks/FeatureScreens'
import { gsap, ScrollTrigger } from '../motion/gsap'
import { useGsap } from '../motion/useGsap'
import { DUR, EASE } from '../motion/motion'
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

    // Desktop: the device stays put, screens swap as each block crosses the centre.
    gsap.set(screens, { autoAlpha: 0 })
    gsap.set(screens[0], { autoAlpha: 1 })
    screens[0].setAttribute('data-active', '')
    let current = 0
    const show = (i: number) => {
      if (i === current) return
      const dir = i > current ? 1 : -1
      const prev = screens[current]
      const next = screens[i]
      prev.removeAttribute('data-active')
      next.setAttribute('data-active', '')
      gsap.to(prev, { autoAlpha: 0, yPercent: -6 * dir, scale: 0.98, duration: DUR.s, ease: EASE.inOut, overwrite: true })
      gsap.fromTo(
        next,
        { autoAlpha: 0, yPercent: 8 * dir, scale: 1.02, filter: 'blur(6px)' },
        { autoAlpha: 1, yPercent: 0, scale: 1, filter: 'blur(0px)', duration: DUR.m, ease: EASE.out, overwrite: true },
      )
      $('[data-dot]').forEach((d, j) => d.toggleAttribute('data-on', j === i))
      current = i
    }
    // The active block is the last one whose top has crossed 55% of the viewport.
    // Derived from positions on every update, so fast scrolls and jumps can never leave a stale screen.
    const sync = () => {
      const line = window.innerHeight * 0.55
      let i = 0
      blocks.forEach((b, j) => {
        if (b.getBoundingClientRect().top < line) i = j
      })
      blocks.forEach((b, j) => b.toggleAttribute('data-current', j === i))
      show(i)
    }
    ScrollTrigger.create({ trigger: $('ol')[0], start: 'top bottom', end: 'bottom top', onUpdate: sync, onRefresh: sync })
    blocks[0].setAttribute('data-current', '')
    blocks.forEach((b) => {
      gsap.from(b.querySelector('[data-num]'), {
        yPercent: 100,
        duration: DUR.m,
        ease: EASE.out,
        scrollTrigger: { trigger: b, start: 'top 70%', once: true },
      })
    })
    // The device leans in as the section arrives, then settles.
    gsap.fromTo(
      $('[data-device]'),
      { rotateX: 12, y: 60, scale: 0.94 },
      { rotateX: 0, y: 0, scale: 1, ease: EASE.scrub, scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 15%', scrub: 1 } },
    )
  }, [])

  return (
    <section ref={root} id="features" className={s.features} aria-labelledby="features-title">
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
                  <span>app.comax.lk</span>
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
          <ol className={s.blocks} role="list">
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
    </section>
  )
}
