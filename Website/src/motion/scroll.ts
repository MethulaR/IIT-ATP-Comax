import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'
import { prefersReducedMotion } from './motion'

/** Shared scroll state. Lenis writes it, marquees and tilting panels read it. */
export const scrollState = {
  lenis: null as Lenis | null,
  /** px per frame, signed. Settles back to 0 when scrolling stops. */
  velocity: 0,
}

let tick: ((time: number) => void) | null = null

/** Lenis on the GSAP ticker so ScrollTrigger and Lenis share one frame loop. */
export function startSmoothScroll() {
  if (scrollState.lenis || prefersReducedMotion()) return scrollState.lenis
  const lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1,
    smoothWheel: true,
    syncTouch: false,
    autoRaf: false,
    anchors: false,
  })
  scrollState.lenis = lenis
  const root = document.documentElement
  lenis.on('scroll', (l: Lenis) => {
    scrollState.velocity = l.velocity
    ScrollTrigger.update()
    root.style.setProperty('--scroll-sheen', `${(l.progress * 140).toFixed(1)}%`)
  })
  tick = (time: number) => {
    lenis.raf(time * 1000)
    // Lenis stops emitting once at rest. Make sure velocity readers see the settle.
    if (!lenis.isScrolling) scrollState.velocity = 0
  }
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  ;(window as unknown as { __comax?: object }).__comax = { lenis }
  return lenis
}

export function stopSmoothScroll() {
  if (tick) gsap.ticker.remove(tick)
  scrollState.lenis?.destroy()
  scrollState.lenis = null
  tick = null
}

type ScrollOpts = { immediate?: boolean; offset?: number; onComplete?: () => void }

/** Scroll to an element or y position, smooth when Lenis is running. */
export function scrollToTarget(target: string | HTMLElement | number, opts: ScrollOpts = {}) {
  const lenis = scrollState.lenis
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
  if (el === null) return
  const offset = opts.offset ?? 0
  if (lenis) {
    lenis.scrollTo(el as HTMLElement | number, { offset, immediate: opts.immediate, duration: 1.4, onComplete: opts.onComplete })
    if (opts.immediate) opts.onComplete?.()
    return
  }
  const top = typeof el === 'number' ? el : el.getBoundingClientRect().top + window.scrollY
  window.scrollTo({ top: top + offset, behavior: 'auto' })
  if (opts.onComplete) requestAnimationFrame(() => requestAnimationFrame(opts.onComplete!))
}

/** Native scroll fallback for the metal sheen when Lenis is off. */
export function bindNativeSheen() {
  const root = document.documentElement
  let raf = 0
  const onScroll = () => {
    if (raf) return
    raf = requestAnimationFrame(() => {
      raf = 0
      const max = root.scrollHeight - window.innerHeight || 1
      root.style.setProperty('--scroll-sheen', `${((window.scrollY / max) * 140).toFixed(1)}%`)
    })
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => window.removeEventListener('scroll', onScroll)
}
