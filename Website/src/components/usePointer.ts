import { useEffect, type RefObject } from 'react'

/**
 * Writes the pointer position inside an element to --mx / --my (percent),
 * batched in requestAnimationFrame. Drives specular highlights and sheens.
 */
export function usePointerVars(ref: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled || !window.matchMedia('(hover: hover)').matches) return
    let raf = 0
    let x = 50
    let y = 50
    const write = () => {
      raf = 0
      el.style.setProperty('--mx', `${x.toFixed(1)}%`)
      el.style.setProperty('--my', `${y.toFixed(1)}%`)
    }
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      x = ((e.clientX - r.left) / r.width) * 100
      y = ((e.clientY - r.top) / r.height) * 100
      if (!raf) raf = requestAnimationFrame(write)
    }
    el.addEventListener('pointermove', onMove)
    return () => {
      el.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [ref, enabled])
}
