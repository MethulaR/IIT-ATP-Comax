import { useRef } from 'react'
import { SCORING } from '../config/copy'
import { Reveal } from '../components/Reveal'
import { Orbs } from '../components/Orbs'
import { gsap } from '../motion/gsap'
import { useGsap } from '../motion/useGsap'
import { EASE, PIN } from '../motion/motion'
import s from './Scoring.module.css'

const TOTAL = SCORING.segments.reduce((a, b) => a + b.points, 0)
const GAP = 3 // degrees between segments
const R = 150

/** Segment geometry in degrees, starting at 12 o'clock. */
const ARCS = (() => {
  const usable = 360 - GAP * SCORING.segments.length
  let at = GAP / 2
  return SCORING.segments.map((seg) => {
    const len = (seg.points / TOTAL) * usable
    const arc = { start: at, len, mid: at + len / 2 }
    at += len + GAP
    return arc
  })
})()

export function Scoring() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, (q, el) => {
    const $ = gsap.utils.selector(el)
    const segs = $('[data-seg]') as unknown as SVGCircleElement[]
    const labels = $('[data-label]')
    const legend = $('[data-legend]')
    const num = $('[data-total]')[0] as HTMLElement
    const sheen = $('[data-sheen]')

    const finished = () => {
      gsap.set(segs, { attr: { 'stroke-dashoffset': 0 } })
      num.textContent = String(TOTAL)
      legend.forEach((l) => l.setAttribute('data-done', ''))
    }
    if (q.reduce) {
      finished()
      return
    }

    const counter = { v: 0 }
    const tl = gsap.timeline({
      defaults: { ease: EASE.scrub },
      scrollTrigger: q.desktop
        ? { trigger: el, start: 'top top', end: `+=${PIN.short * 100}%`, scrub: 1, pin: true, anticipatePin: 1 }
        : { trigger: $('[data-ring]')[0], start: 'top 80%', end: 'bottom 45%', scrub: 1 },
    })
    let t = 0
    SCORING.segments.forEach((seg, i) => {
      const d = seg.points / TOTAL
      tl.fromTo(segs[i], { attr: { 'stroke-dashoffset': ARCS[i].len } }, { attr: { 'stroke-dashoffset': 0 }, duration: d }, t)
      // The label and legend row land as their segment completes, and reverse if you scroll back.
      tl.fromTo(labels[i], { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.05 }, t + d - 0.02)
      tl.call(() => legend[i].toggleAttribute('data-done', tl.scrollTrigger ? tl.scrollTrigger.direction > 0 : true), [], t + d - 0.01)
      t += d
    })
    tl.fromTo(counter, { v: 0 }, { v: TOTAL, duration: t, onUpdate: () => (num.textContent = String(Math.round(counter.v))) }, 0)
    tl.fromTo(sheen, { rotate: 0 }, { rotate: 360, duration: t, svgOrigin: '200 200' }, 0)
    tl.to({}, { duration: 0.15 })
  }, [])

  return (
    <section ref={root} id="scoring" className={s.scoring} aria-labelledby="scoring-title">
      <a className="skip-section" href="#how">
        Skip to how it works
      </a>
      <Orbs orbs={[{ x: '72%', y: '50%', size: '50vmax', tone: 'rose' }, { x: '15%', y: '20%', size: '30vmax', tone: 'silver' }]} />
      <div className={`container ${s.inner}`}>
        <div className={s.copy}>
          <p className="eyebrow">{SCORING.eyebrow}</p>
          <Reveal id="scoring-title" variant="lines" className={s.title}>
            {SCORING.title}
          </Reveal>
          <p className={s.body}>{SCORING.body}</p>
          <ol className={s.legend} role="list" aria-label="Example scoring setup">
            {SCORING.segments.map((seg) => (
              <li key={seg.name} data-legend>
                <span className={s.swatch} aria-hidden="true" />
                <span>
                  {seg.round}, {seg.name}
                </span>
                <span className="num">{seg.points}</span>
              </li>
            ))}
            <li className={s.legendTotal}>
              <span />
              <span>Total</span>
              <span className="num">{TOTAL}</span>
            </li>
          </ol>
        </div>

        <div className={s.ringWrap} data-ring aria-hidden="true">
          <svg viewBox="0 0 400 400" className={s.ring}>
            <defs>
              <linearGradient id="seg-metal" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#B8475C" />
                <stop offset="0.3" stopColor="#8E1B30" />
                <stop offset="0.55" stopColor="#3D0A14" />
                <stop offset="0.75" stopColor="#8E1B30" />
                <stop offset="1" stopColor="#6B1424" />
              </linearGradient>
              <linearGradient id="seg-sheen" x1="200" y1="40" x2="200" y2="360" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
                <stop offset="0.25" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle cx="200" cy="200" r={R} fill="none" stroke="#D4D4D9" strokeOpacity="0.6" strokeWidth="30" />
            <circle cx="200" cy="200" r={R - 26} fill="none" stroke="#C9CBD1" strokeOpacity="0.7" strokeWidth="1" />
            <circle cx="200" cy="200" r={R + 26} fill="none" stroke="#C9CBD1" strokeOpacity="0.7" strokeWidth="1" />
            {ARCS.map((a, i) => (
              <g key={i} transform={`rotate(${a.start - 90} 200 200)`}>
                <circle
                  data-seg
                  cx="200"
                  cy="200"
                  r={R}
                  fill="none"
                  stroke="url(#seg-metal)"
                  strokeWidth="30"
                  pathLength={360}
                  strokeDasharray={`${a.len} 360`}
                  strokeDashoffset={0}
                />
              </g>
            ))}
            <circle data-sheen cx="200" cy="200" r={R} fill="none" stroke="url(#seg-sheen)" strokeWidth="30" style={{ mixBlendMode: 'screen' }} />
          </svg>
          {ARCS.map((a, i) => {
            const rad = ((a.mid - 90) * Math.PI) / 180
            const seg = SCORING.segments[i]
            return (
              <span
                key={seg.name}
                data-label
                className={s.label}
                style={{ left: `${50 + Math.cos(rad) * 49}%`, top: `${50 + Math.sin(rad) * 49}%` }}
              >
                <small>{seg.round}</small>
                {seg.name} <b className="num">{seg.points}</b>
              </span>
            )
          })}
          <div className={s.centre}>
            <span className={`num ${s.total}`} data-total>
              {TOTAL}
            </span>
            <span className={s.centreLabel}>total points</span>
          </div>
        </div>
      </div>
    </section>
  )
}
