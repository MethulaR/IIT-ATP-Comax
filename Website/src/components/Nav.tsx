import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Glass } from './Glass'
import { Logo } from './Monogram'
import { Button } from './Button'
import { NAV_LINKS, PORTAL_URL } from '../config/site'
import { gsap, ScrollTrigger } from '../motion/gsap'
import { scrollToTarget } from '../motion/scroll'
import s from './Nav.module.css'

export function Nav() {
  const bar = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  const menuBtn = useRef<HTMLButtonElement>(null)

  // Hide on scroll down, return on scroll up, firmer glass once past the hero.
  useEffect(() => {
    const el = bar.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let hidden = false
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate(self) {
        const y = self.scroll()
        el.dataset.solid = y > window.innerHeight * 0.85 ? 'true' : 'false'
        const hide = self.direction === 1 && y > 240 && !el.matches(':focus-within')
        if (hide !== hidden) {
          hidden = hide
          gsap.to(el, { yPercent: hide ? -170 : 0, duration: reduce ? 0 : 0.6, ease: 'expo.out', overwrite: true })
        }
      },
    })
    return () => {
      st.kill()
      gsap.set(el, { clearProps: 'transform' })
    }
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        menuBtn.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (hash: string) => (e: React.MouseEvent) => {
    setOpen(false)
    if (!onHome) return
    e.preventDefault()
    scrollToTarget(hash)
    history.replaceState(null, '', hash)
  }

  return (
    <header className={s.wrap}>
      <Glass as="nav" ref={bar} refract radius="pill" className={s.bar} aria-label="Main" data-solid="false">
        <Link to="/" className={s.logo} aria-label="CoMax home" onClick={(e) => {
          setOpen(false)
          if (onHome) { e.preventDefault(); scrollToTarget(0) }
        }}>
          <Logo />
        </Link>
        <ul className={s.links} role="list">
          {NAV_LINKS.map((l) => (
            <li key={l.hash}>
              <a href={onHome ? l.hash : `/${l.hash}`} onClick={go(l.hash)}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className={s.cta}>
          <Button href={PORTAL_URL} size="m">
            Request a demo
          </Button>
        </div>
        <button
          ref={menuBtn}
          type="button"
          className={s.menuBtn}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span className={s.burger} data-open={open} aria-hidden="true" />
        </button>
      </Glass>
      <Glass
        as="div"
        id="mobile-menu"
        tone="strong"
        radius="xl"
        className={s.sheet}
        data-open={open}
        hidden={!open}
      >
        <ul role="list">
          {NAV_LINKS.map((l) => (
            <li key={l.hash}>
              <a href={onHome ? l.hash : `/${l.hash}`} onClick={go(l.hash)}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <Button href={PORTAL_URL} size="l" magnetic={false} onClick={() => setOpen(false)}>
          Request a demo
        </Button>
      </Glass>
    </header>
  )
}
