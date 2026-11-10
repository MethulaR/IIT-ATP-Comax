import { useLayoutEffect, useRef, type DependencyList, type RefObject } from 'react'
import { gsap } from './gsap'
import { MQ, type MQState } from './motion'

type Setup = (q: MQState, scope: HTMLElement) => void | (() => void)

/**
 * Runs GSAP setup inside gsap.matchMedia, scoped to an element.
 * Everything created inside (tweens, ScrollTriggers, SplitTexts) is reverted
 * when the media state changes or the component unmounts.
 */
export function useGsap(scope: RefObject<HTMLElement | null>, setup: Setup, deps: DependencyList = []) {
  const setupRef = useRef(setup)
  setupRef.current = setup
  useLayoutEffect(() => {
    const el = scope.current
    if (!el) return
    const mm = gsap.matchMedia(el)
    mm.add(MQ, (ctx) => setupRef.current(ctx.conditions as MQState, el))
    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
