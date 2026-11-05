import { lazy, Suspense, useEffect } from 'react'
import { Hero } from '../sections/Hero'
import { ScrollTrigger } from '../motion/gsap'

// Everything below the fold is one code split chunk, so its ScrollTriggers are created in page order.
const BelowFold = lazy(() => import('./BelowFold'))

export function Home() {
  useEffect(() => {
    return () => {
      // Belt and braces on route change: nothing from the home page may survive.
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])
  return (
    <>
      <Hero />
      <Suspense fallback={<div style={{ minHeight: '100vh' }} aria-hidden="true" />}>
        <BelowFold />
      </Suspense>
    </>
  )
}
