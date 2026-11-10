import { useRef } from 'react'
import { HOW } from '../config/copy'
import { Reveal } from '../components/Reveal'
import { gsap, ScrollTrigger } from '../motion/gsap'
import { useGsap } from '../motion/useGsap'
import { DUR, EASE } from '../motion/motion'
import { fadeIn, splitReveal } from '../motion/reveals'
import s from './HowItWorks.module.css'

export function HowItWorks() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, (q, el) => {
    const $ = gsap.utils.selector(el)
    const steps = $('[data-step]') as HTMLElement[]
    const track = $('[data-track]')[0] as HTMLElement
    if (q.reduce) {
      steps.forEach((st) => st.setAttribute('data-lit', ''))
      gsap.set($('[data-line]'), { attr: { 'stroke-dashoffset': 0 } })
      fadeIn(steps, el)
      return
    }
    // The line draws itself with the scroll. Its tip rides the 60% mark of the viewport.
    const draw = { trigger: track, start: 'top 60%', end: 'bottom 60%', scrub: 0.6 }
    gsap.fromTo($('[data-line]'), { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, ease: EASE.scrub, scrollTrigger: draw })
    gsap.fromTo($('[data-tip]'), { y: 0 }, { y: () => track.offsetHeight, ease: EASE.scrub, scrollTrigger: { ...draw, invalidateOnRefresh: true } })

    // A node lights up once the line's tip (60% of the viewport) has reached it, and goes dark if you
    // scroll back above it. Read from positions each update, so fast scrolls never skip one.
    const nodes = steps.map((st) => st.querySelector('[data-node]') as HTMLElement)
    const light = () => {
      const tip = window.innerHeight * 0.6
      nodes.forEach((n, i) => {
        const r = n.getBoundingClientRect()
        steps[i].toggleAttribute('data-lit', r.top + r.height / 2 < tip)
      })
    }
    ScrollTrigger.create({ trigger: track, start: 'top bottom', end: 'bottom top', onUpdate: light, onRefresh: light })
    steps.forEach((st, i) => {
      const node = nodes[i]
      splitReveal(st.querySelector('h3') as HTMLElement, { variant: i % 2 ? 'words' : 'wipe', trigger: node, start: 'center 64%' })
      gsap.from(st.querySelector('p'), {
        opacity: 0,
        y: 16,
        duration: DUR.m,
        ease: EASE.out,
        delay: 0.15,
        scrollTrigger: { trigger: node, start: 'center 64%', once: true },
      })
    })
  }, [])

  return (
    <section ref={root} id="how" className={s.how} aria-labelledby="how-title">
      <div className="container">
        <div className={s.head}>
          <p className="eyebrow">{HOW.eyebrow}</p>
          <Reveal id="how-title" variant="words" className={s.title}>
            {HOW.title}
          </Reveal>
        </div>
        <div className={s.track} data-track>
          <svg className={s.line} viewBox="0 0 4 100" preserveAspectRatio="none" aria-hidden="true">
            <line x1="2" y1="0" x2="2" y2="100" stroke="#D4D4D9" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <line
              data-line
              x1="2"
              y1="0"
              x2="2"
              y2="100"
              stroke="url(#how-metal)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="0"
            />
            <defs>
              <linearGradient id="how-metal" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#B8475C" />
                <stop offset="0.5" stopColor="#6B1424" />
                <stop offset="1" stopColor="#8E1B30" />
              </linearGradient>
            </defs>
          </svg>
          <span className={s.tip} data-tip aria-hidden="true" />
          <ol className={s.steps} role="list">
            {HOW.steps.map(([title, body], i) => (
              <li key={title} className={s.step} data-step>
                <span className={s.node} data-node aria-hidden="true">
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                </span>
                <div className={s.text}>
                  <h3 className={s.stepTitle}>{title}</h3>
                  <p className={s.stepBody}>{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
