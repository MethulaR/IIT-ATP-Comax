import { useRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useMagnetic } from './useMagnetic'
import { usePointerVars } from './usePointer'
import { scrollToTarget } from '../motion/scroll'
import s from './Button.module.css'

type Common = {
  variant?: 'primary' | 'glass' | 'ghost' | 'silver'
  size?: 'm' | 'l'
  magnetic?: boolean
  icon?: boolean
  children: ReactNode
}
type AsLink = Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
type AsButton = Common & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }

function Arrow() {
  return (
    <svg className={s.arrow} viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M3 8h9.5M8.5 3.5 13 8l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Button(props: AsLink | AsButton) {
  const { variant = 'primary', size = 'm', magnetic = true, icon = false, children, className, ...rest } = props
  const wrap = useRef<HTMLSpanElement>(null)
  const surface = useRef<HTMLElement>(null)
  useMagnetic(wrap, magnetic ? 0.28 : 0)
  usePointerVars(surface)
  const cls = [s.btn, s[variant], s[size], 'sheen', className].filter(Boolean).join(' ')
  const inner = (
    <>
      <span className={s.label}>{children}</span>
      {icon && <Arrow />}
    </>
  )

  let el: ReactNode
  if ('href' in rest && typeof rest.href === 'string') {
    const { href, onClick, ...a } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
    const isHash = href.startsWith('#') || href.startsWith('/#')
    const isInternal = href.startsWith('/') && !href.startsWith('//')
    if (isHash) {
      el = (
        <a
          ref={surface as React.RefObject<HTMLAnchorElement>}
          className={cls}
          href={href}
          onClick={(e) => {
            onClick?.(e)
            const hash = href.slice(href.indexOf('#'))
            if (document.querySelector(hash)) {
              e.preventDefault()
              scrollToTarget(hash)
              history.replaceState(null, '', hash)
            }
          }}
          {...a}
        >
          {inner}
        </a>
      )
    } else if (isInternal) {
      el = (
        <Link ref={surface as React.RefObject<HTMLAnchorElement>} className={cls} to={href} {...a}>
          {inner}
        </Link>
      )
    } else {
      el = (
        <a ref={surface as React.RefObject<HTMLAnchorElement>} className={cls} href={href} rel="noopener" {...a}>
          {inner}
        </a>
      )
    }
  } else {
    el = (
      <button ref={surface as React.RefObject<HTMLButtonElement>} className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
        {inner}
      </button>
    )
  }
  return (
    <span ref={wrap} className={s.magnet}>
      {el}
    </span>
  )
}
