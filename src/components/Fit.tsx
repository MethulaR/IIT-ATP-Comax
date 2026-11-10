import { useLayoutEffect, useRef, type ReactNode } from 'react'

/**
 * Renders a mock screen at its design size and scales it to the container width,
 * so product mocks stay pixel exact from 360px phones to 1920px screens.
 */
export function Fit({ w, h, children, className }: { w: number; h: number; children: ReactNode; className?: string }) {
  const box = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const set = () => el.style.setProperty('--fit', String(el.clientWidth / w))
    set()
    const ro = new ResizeObserver(set)
    ro.observe(el)
    return () => ro.disconnect()
  }, [w])
  return (
    <div
      ref={box}
      className={className}
      style={{ position: 'relative', width: '100%', aspectRatio: `${w} / ${h}`, borderRadius: 'inherit', overflow: 'hidden' }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: w,
          height: h,
          transform: 'scale(var(--fit, 1))',
          transformOrigin: '0 0',
          borderRadius: 'inherit',
        }}
      >
        {children}
      </div>
    </div>
  )
}
