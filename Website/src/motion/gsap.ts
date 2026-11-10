import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

// Register once. Every module imports gsap from here so plugins are always present.
gsap.registerPlugin(ScrollTrigger, SplitText)
ScrollTrigger.config({ ignoreMobileResize: true })
gsap.config({ nullTargetWarn: false })

export { gsap, ScrollTrigger, SplitText }
