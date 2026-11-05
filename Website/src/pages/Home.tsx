import { lazy, Suspense, useEffect, useState } from 'react'
import { Hero } from '../sections/Hero'
import { ScrollTrigger } from '../motion/gsap'

// Everything below the fold is one code split chunk, so its ScrollTriggers are created in page order.
const BelowFold = lazy(() => import('./BelowFold'))

export function Home() {
  // The chunk mounts after hydration. Server HTML and the first client render both show the placeholder.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    return () => {
      // Belt and braces on route change: nothing from the home page may survive.
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])
  const placeholder = <div style={{ minHeight: '100vh' }} aria-hidden="true" />
  return (
    <>
      <Hero />
      {mounted ? <Suspense fallback={placeholder}><BelowFold /></Suspense> : placeholder}
    </>
  )
}
