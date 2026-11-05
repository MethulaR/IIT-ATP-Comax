import { useEffect } from 'react'
import { ScrollTrigger } from '../motion/gsap'
import { Problem } from '../sections/Problem'
import { Portals } from '../sections/Portals'
import { Features } from '../sections/Features'
import { Scoring } from '../sections/Scoring'
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
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [])
  return (
    <>
      <Problem />
      <Portals />
      <Features />
      <Scoring />
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
