import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '../motion/gsap'
import { DUR, EASE, prefersReducedMotion } from '../motion/motion'
import { signalIntro } from '../motion/intro'
import { scrollState } from '../motion/scroll'
import { MARK_PATH } from '../components/Monogram'
import s from './Loader.module.css'

const SEEN_KEY = 'comax:intro-seen'
const MIN_MS = 1600
const MAX_MS = 3200
const MARK_PX = 132
/** Radius of the C inside the mark, in px, so the lens opens exactly from the ring. */
const C_RADIUS = (22 / 64) * MARK_PX

/** Real loading signals, weighted. Fonts and the window load event. */
function trackProgress(onProgress: (p: number) => void) {
  let p = 0.15
  const add = (w: number) => {
    p = Math.min(1, p + w)
    onProgress(p)
  }
  onProgress(p)
  const fonts = document.fonts?.ready ?? Promise.resolve()
  fonts.then(() => add(0.5))
  if (document.readyState === 'complete') add(0.35)
  else window.addEventListener('load', () => add(0.35), { once: true })
}

function seenBefore() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}
function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    /* private mode, fine */
  }
}

export function Loader() {
  const [done, setDone] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const counter = useRef<HTMLSpanElement>(null)
  const exitRef = useRef<(fast?: boolean) => void>(() => {})

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const html = document.documentElement
    html.classList.add('is-loading')
    scrollState.lenis?.stop()

    const q = gsap.utils.selector(el)
    const reduce = prefersReducedMotion()
    const quick = seenBefore()
    let exited = false
    // Measured from navigation start, so the intro never holds the page past MAX_MS in total.
    const t0 = 0

    const finish = () => {
      html.classList.remove('is-loading')
      scrollState.lenis?.start()
      markSeen()
      setDone(true)
    }

    const ctx = gsap.context(() => {
      // Reduced motion: no drawing, no lens. A quick fade.
      if (reduce) {
        gsap.set(q('[data-draw]'), { strokeDashoffset: 0 })
        gsap.set(q('[data-liquid]'), { y: -10 })
        exitRef.current = () => {
          if (exited) return
          exited = true
          signalIntro()
          gsap.to(el, { opacity: 0, duration: 0.3, ease: 'power1.out', onComplete: finish })
        }
        gsap.delayedCall(quick ? 0.1 : 0.35, () => exitRef.current())
        return
      }

      // The lens exit, shared by the full and the quick version.
      const lensExit = (fast: boolean) => {
        if (exited) return
        exited = true
        markSeen()
        const R = Math.hypot(window.innerWidth, window.innerHeight) / 2 + 60
        const lens = { r: C_RADIUS }
        const dur = fast ? 0.4 : DUR.l
        const tl = gsap.timeline({ onComplete: finish })
        tl.to(q('[data-copy]'), { y: 16, opacity: 0, duration: fast ? 0.2 : DUR.s, ease: EASE.inOut }, 0)
        tl.to(q('[data-mark]'), { scale: 1.18, opacity: 0, duration: fast ? 0.25 : 0.5, ease: EASE.inOut }, 0)
        tl.set(q('[data-ring]'), { opacity: 1 }, 0)
        tl.to(
          lens,
          {
            r: R,
            duration: dur,
            ease: EASE.inOut,
            onUpdate() {
              el.style.setProperty('--lens', `${lens.r.toFixed(1)}px`)
              gsap.set(q('[data-ring]'), { scale: lens.r / C_RADIUS })
            },
          },
          fast ? 0 : 0.12,
        )
        tl.to(q('[data-ring]'), { opacity: 0, duration: dur * 0.5, ease: 'power2.in' }, fast ? dur * 0.5 : 0.12 + dur * 0.5)
        // The hero starts revealing while the lens is still opening: one continuous shot.
        tl.call(signalIntro, [], fast ? 0 : 0.05)
      }
      exitRef.current = (fast = false) => lensExit(fast)

      if (quick) {
        gsap.set(q('[data-draw]'), { strokeDashoffset: 0 })
        gsap.set(q('[data-liquid]'), { y: -10 })
        gsap.set(q('[data-copy]'), { opacity: 0 })
        gsap.delayedCall(0.05, () => lensExit(true))
        return
      }

      // 1. A thin silver line draws the mark.
      const intro = gsap.timeline()
      intro.fromTo(q('[data-draw]'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: EASE.inOut })
      // 2. Liquid maroon metal rises inside it, the wave rolling as it climbs.
      intro.fromTo(q('[data-liquid]'), { y: 66 }, { y: -10, duration: 1.15, ease: 'power2.inOut' }, 0.55)
      intro.fromTo(q('[data-wave]'), { x: 0 }, { x: -32, duration: 1.15, ease: 'none' }, 0.55)
      // 3. A highlight glints across the metal.
      intro.fromTo(q('[data-glint]'), { attr: { x1: -40, x2: -10 } }, { attr: { x1: 70, x2: 100 }, duration: 0.8, ease: EASE.inOut }, 1.35)
      intro.from(q('[data-copy]'), { y: 14, opacity: 0, duration: DUR.m, ease: EASE.out, stagger: 0.08 }, 0.15)

      // 4. The counter follows real progress, never faster than MIN_MS, never longer than MAX_MS.
      let target = 0
      let shown = 0
      trackProgress((p) => (target = p))
      const tick = () => {
        const elapsed = performance.now() - t0
        const timeCap = Math.min(1, elapsed / MIN_MS)
        const goal = elapsed >= MAX_MS ? 1 : Math.min(target, timeCap)
        shown += (goal - shown) * 0.16
        if (goal === 1 && shown > 0.995) shown = 1
        if (counter.current) counter.current.textContent = String(Math.round(shown * 100)).padStart(3, '0')
        if (shown === 1 && elapsed >= MIN_MS) {
          gsap.ticker.remove(tick)
          lensExit(false)
        }
      }
      gsap.ticker.add(tick)
      return () => gsap.ticker.remove(tick)
    }, el)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exitRef.current(true)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      ctx.revert()
      html.classList.remove('is-loading')
    }
  }, [])

  // Safety net: never block the page, whatever happens.
  useEffect(() => {
    const id = window.setTimeout(() => exitRef.current(true), MAX_MS + 1500)
    return () => window.clearTimeout(id)
  }, [])

  if (done) return null

  return (
    <div ref={root} className={s.loader} style={{ ['--mark' as string]: `${MARK_PX}px` }}>
      <div className={s.glow} aria-hidden="true" />
      <div className={s.ring} data-ring aria-hidden="true" />
      <div className={s.mark} data-mark aria-hidden="true">
        <svg viewBox="0 0 64 64" width={MARK_PX} height={MARK_PX}>
          <defs>
            <linearGradient id="ld-silver" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#FDFDFD" />
              <stop offset="0.5" stopColor="#8C8F98" />
              <stop offset="1" stopColor="#C9CBD1" />
            </linearGradient>
            <linearGradient id="ld-maroon" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#B8475C" />
              <stop offset="0.35" stopColor="#8E1B30" />
              <stop offset="0.7" stopColor="#6B1424" />
              <stop offset="1" stopColor="#3D0A14" />
            </linearGradient>
            <linearGradient id="ld-glint" data-glint x1="-40" y1="0" x2="-10" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <clipPath id="ld-liquid">
              {/* Only shapes are allowed inside clipPath, so the wave path carries both x and y. */}
              <path data-liquid data-wave d="M-32 4 Q-24 0 -16 4 T0 4 T16 4 T32 4 T48 4 T64 4 T80 4 T96 4 T112 4 V90 H-32 Z" />
            </clipPath>
          </defs>
          <path
            data-draw
            d={MARK_PATH}
            pathLength={1}
            fill="none"
            stroke="url(#ld-silver)"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1"
            strokeDashoffset="1"
          />
          <g clipPath="url(#ld-liquid)">
            <path d={MARK_PATH} fill="none" stroke="url(#ld-maroon)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={MARK_PATH} fill="none" stroke="url(#ld-glint)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" style={{ mixBlendMode: 'screen' }} />
          </g>
        </svg>
      </div>

      <div className={s.brand} data-copy aria-hidden="true">
        <span className={s.word}>CoMax</span>
        <span className={s.line}>Events and competitions, managed</span>
      </div>
      <div className={s.count} data-copy aria-hidden="true">
        <span ref={counter} className="num">
          000
        </span>
      </div>
      <button type="button" className={s.skip} data-copy onClick={() => exitRef.current(true)}>
        Skip intro
      </button>
    </div>
  )
}
