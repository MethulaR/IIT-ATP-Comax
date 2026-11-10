import { forwardRef, useImperativeHandle, useRef, type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import { usePointerVars } from './usePointer'
import s from './Glass.module.css'

type GlassProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType
  /** light: 0.42 fill, strong: 0.62 fill for text heavy surfaces, dark: for maroon sections */
  tone?: 'light' | 'strong' | 'dark'
  /** Bend what sits behind (Chromium only, falls back to blur). Use sparingly, it costs GPU. */
  refract?: boolean
  /** Pointer following specular highlight */
  specular?: boolean
  radius?: 's' | 'm' | 'l' | 'xl' | 'pill'
  children?: ReactNode
}

/** Liquid glass surface used for the nav, floating cards and panels. */
export const Glass = forwardRef<HTMLElement, GlassProps>(function Glass(
  { as: Tag = 'div', tone = 'light', refract = false, specular = true, radius = 'l', className, children, ...rest },
  forwarded,
) {
  const ref = useRef<HTMLElement>(null)
  useImperativeHandle(forwarded, () => ref.current as HTMLElement)
  usePointerVars(ref, specular)
  return (
    <Tag
      ref={ref}
      data-refract={refract || undefined}
      className={[s.glass, s[tone], s[`r-${radius}`], specular && s.specular, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  )
})
