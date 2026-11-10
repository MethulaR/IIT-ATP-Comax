import { useRef, type ElementType, type ReactNode } from 'react'
import { useGsap } from '../motion/useGsap'
import { splitReveal, fadeIn, type RevealVariant } from '../motion/reveals'

type Props = {
  as?: ElementType
  variant?: RevealVariant
  className?: string
  id?: string
  start?: string
  delay?: number
  children: ReactNode
}

/** A heading or paragraph that reveals itself with SplitText. Reduced motion gets a fade. */
export function Reveal({ as: Tag = 'h2', variant = 'words', className, id, start, delay, children }: Props) {
  const ref = useRef<HTMLElement>(null)
  useGsap(ref, (q, el) => {
    if (q.reduce) {
      fadeIn(el, el)
      return
    }
    splitReveal(el, { variant, start, delay })
  })
  return (
    <Tag ref={ref} className={className} id={id}>
      {children}
    </Tag>
  )
}
