import { useEffect } from 'react'
import { ScrollTrigger } from '../motion/gsap'
import { Problem } from '../sections/Problem'
import { Portals } from '../sections/Portals'

export default function BelowFold() {
  useEffect(() => {
    // All below the fold ScrollTriggers now exist, in page order. Measure once more.
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [])
  return (
    <>
      <Problem />
      <Portals />
      <div style={{ height: '100vh' }} />
    </>
  )
}
