import { useEffect } from 'react'
import { ScrollTrigger } from '../motion/gsap'
import { MQ } from '../motion/motion'
import { createSpy, killSpy } from '../motion/spy'
import { Problem } from '../sections/Problem'
import { Portals } from '../sections/Portals'
import { Features } from '../sections/Features'
import { HowItWorks } from '../sections/HowItWorks'
import { Trust } from '../sections/Trust'
import { Partner } from '../sections/Partner'
import { Marquee } from '../sections/Marquee'
import { Team } from '../sections/Team'
import { Contact } from '../sections/Contact'
import { Footer } from '../components/Footer'

/** Everything below the hero, in page order, as one code split chunk. */
export default function BelowFold() {
  useEffect(() => {
    // All below the fold ScrollTriggers now exist, in page order. Measure once more.
    // The nav scroll spy is created last, so it measures the pin spacers that now exist.
    let id = requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      createSpy()
    })
    // Pins are rebuilt when the media state changes, so the spy is too.
    const queries = [MQ.desktop, MQ.reduce].map((q) => window.matchMedia(q))
    const rebuild = () => {
      cancelAnimationFrame(id)
      id = requestAnimationFrame(createSpy)
    }
    queries.forEach((q) => q.addEventListener('change', rebuild))
    return () => {
      cancelAnimationFrame(id)
      queries.forEach((q) => q.removeEventListener('change', rebuild))
      killSpy()
    }
  }, [])
  return (
    <>
      <Problem />
      <Portals />
      <Features />
      <HowItWorks />
      <Trust />
      <Partner />
      <Marquee />
      <Team />
      <Contact />
      <Footer />
    </>
  )
}
