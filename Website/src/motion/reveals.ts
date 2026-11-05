import { gsap, SplitText } from './gsap'
import { DUR, EASE, STAGGER } from './motion'

export type RevealVariant = 'words' | 'chars' | 'wipe' | 'lines'

type RevealOpts = {
  variant?: RevealVariant
  /** Element that triggers the reveal. Defaults to the text itself. */
  trigger?: Element
  start?: string
  delay?: number
  /** When false, returns a paused timeline and adds no ScrollTrigger. */
  scroll?: boolean
}

/**
 * Split a headline and reveal it. SplitText handles aria (the parent keeps an aria-label,
 * pieces are aria-hidden) and re-splits on resize and font load via autoSplit.
 */
export function splitReveal(el: HTMLElement, opts: RevealOpts = {}) {
  const { variant = 'words', trigger = el, start = 'top 86%', delay = 0, scroll = true } = opts
  let tl: gsap.core.Timeline | null = null
  let played = false

  const split = SplitText.create(el, {
    type: variant === 'chars' ? 'lines,words,chars' : variant === 'words' ? 'lines,words' : 'lines',
    mask: 'lines',
    linesClass: 'split-line',
    wordsClass: 'split-word',
    charsClass: 'split-char',
    aria: 'auto',
    autoSplit: true,
    onSplit(self) {
      tl = gsap.timeline({
        paused: !scroll && !played,
        delay: played ? 0 : delay,
        scrollTrigger: scroll ? { trigger, start, once: true } : undefined,
      })
      if (variant === 'words') {
        tl.from(self.words, {
          yPercent: 110,
          rotate: 4,
          filter: 'blur(8px)',
          opacity: 0,
          duration: DUR.l,
          ease: EASE.out,
          stagger: STAGGER.words,
          transformOrigin: '0% 100%',
        })
      } else if (variant === 'chars') {
        tl.from(self.chars, {
          yPercent: 115,
          opacity: 0,
          filter: 'blur(6px)',
          duration: DUR.m,
          ease: EASE.out,
          stagger: STAGGER.chars,
        })
      } else if (variant === 'wipe') {
        // Transform only wipe: the mask slides right while the line inside slides back,
        // so a hard edge sweeps across the text without animating clip-path.
        const masks = (self as unknown as { masks: Element[] }).masks
        tl.from(masks, { xPercent: -101, duration: DUR.l, ease: EASE.out, stagger: STAGGER.lines }, 0)
        tl.from(self.lines, { xPercent: 101, duration: DUR.l, ease: EASE.out, stagger: STAGGER.lines }, 0)
      } else {
        tl.from(self.lines, { yPercent: 105, opacity: 0, duration: DUR.l, ease: EASE.out, stagger: STAGGER.lines })
      }
      return tl
    },
  })

  return {
    split,
    play: () => {
      played = true
      tl?.play()
    },
    get timeline() {
      return tl
    },
  }
}

/** The reduced motion entrance: a plain fade, nothing moves. */
export function fadeIn(targets: gsap.TweenTarget, trigger?: Element) {
  return gsap.from(targets, {
    opacity: 0,
    duration: DUR.s,
    ease: 'power1.out',
    stagger: 0.05,
    scrollTrigger: trigger ? { trigger, start: 'top 90%', once: true } : undefined,
  })
}

/** Rise and settle for cards and blocks. */
export function riseIn(targets: gsap.TweenTarget, trigger: Element, extra: gsap.TweenVars = {}) {
  return gsap.from(targets, {
    y: 48,
    opacity: 0,
    duration: DUR.l,
    ease: EASE.out,
    stagger: STAGGER.items,
    scrollTrigger: { trigger, start: 'top 82%', once: true },
    ...extra,
  })
}
