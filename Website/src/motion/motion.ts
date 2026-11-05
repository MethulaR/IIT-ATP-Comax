/** One shared motion language. Change a value here and the whole site follows. */
export const EASE = {
  /** Entrances. Fast start, long settle. */
  out: 'expo.out',
  /** Transitions between two states. */
  inOut: 'power3.inOut',
  /** Anything scrubbed by scroll. Scroll is the easing. */
  scrub: 'none',
  /** Idle loops. */
  idle: 'sine.inOut',
} as const

export const DUR = { s: 0.6, m: 0.9, l: 1.2 } as const

export const STAGGER = { chars: 0.018, words: 0.04, lines: 0.09, items: 0.08 } as const

/** gsap.matchMedia conditions used by every section. */
export const MQ = {
  motion: '(prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
  /** Pinned, scrubbed storytelling only runs here. */
  desktop: '(min-width: 1024px) and (min-height: 560px)',
  /** Everything else gets the stacked versions. */
  compact: '(max-width: 1023px), (max-height: 559px)',
  finePointer: '(hover: hover) and (pointer: fine)',
} as const

export type MQState = { motion: boolean; reduce: boolean; desktop: boolean; compact: boolean; finePointer: boolean }

/** How far a pinned section holds, as a multiple of viewport height. Kept in the 150 to 250% range. */
export const PIN = { short: 1.5, medium: 2, long: 2.4 } as const

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia(MQ.reduce).matches

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
