import { useEffect } from 'react'
import { ScrollTrigger } from '../motion/gsap'

export default function BelowFold() {
  useEffect(() => {
    ScrollTrigger.refresh()
  }, [])
  return <div style={{ height: '200vh' }} />
}
