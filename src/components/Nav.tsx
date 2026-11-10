import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Glass } from './Glass'
import { Logo } from './Monogram'
import { Button } from './Button'
import { NAV_LINKS, PORTAL_URL } from '../config/site'
import { gsap, ScrollTrigger } from '../motion/gsap'
import { scrollToTarget } from '../motion/scroll'
import { spy } from '../motion/spy'
import s from './Nav.module.css'

export function Nav() {
  const bar = useRef<HTMLElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const pill = useRef<HTMLSpanElement>(null)
  const progress = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  const menuBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => spy.subscribe(setActive), [])

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
        progress.current?.style.setProperty('--p', self.progress.toFixed(4))
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

  // The pill slides to the active link. It only moves x and width; CSS handles the ease.
  useLayoutEffect(() => {
    const ul = list.current
    const p = pill.current
    if (!ul || !p) return
    const place = () => {
      const a = active && ul.querySelector<HTMLElement>(`a[href$="#${active}"]`)
      if (!a) {
        p.dataset.on = 'false'
        return
      }
      const wasOn = p.dataset.on === 'true'
      // Appearing from nothing: jump into place, then fade in. Only moves between links slide.
      if (!wasOn) p.style.transition = 'none'
      p.style.transform = `translate3d(${a.offsetLeft}px, 0, 0)`
      p.style.width = `${a.offsetWidth}px`
      if (!wasOn) {
        void p.offsetWidth
        p.style.transition = ''
      }
      p.dataset.on = 'true'
    }
    place()
    const ro = new ResizeObserver(place)
    ro.observe(ul)
    return () => ro.disconnect()
  }, [active])

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
    // Show the target straight away and hold it until the scroll ends, so the pill never flickers past other links.
    spy.lock(hash.slice(1))
    const navHeight = bar.current?.offsetHeight ?? 64
    scrollToTarget(hash, { offset: -navHeight, onComplete: () => spy.unlock() })
    history.replaceState(null, '', hash)
  }

  const isActive = (hash: string) => onHome && active === hash.slice(1)

  return (
    <header className={s.wrap}>
      <Glass as="nav" ref={bar} refract radius="pill" className={s.bar} aria-label="Main" data-solid="false">
        <Link to="/" className={s.logo} aria-label="CoMax home" onClick={(e) => {
          setOpen(false)
          if (onHome) { e.preventDefault(); scrollToTarget(0) }
        }}>
          <Logo />
        </Link>
        <div ref={list} className={s.links}>
          <span ref={pill} className={s.pill} data-on="false" aria-hidden="true" />
          <ul role="list">
          {NAV_LINKS.map((l) => (
            <li key={l.hash}>
              <a href={onHome ? l.hash : `/${l.hash}`} onClick={go(l.hash)} aria-current={isActive(l.hash) ? 'true' : undefined}>
                {l.label}
              </a>
            </li>
          ))}
          </ul>
        </div>
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
        <span ref={progress} className={s.progress} aria-hidden="true" />
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
              <a href={onHome ? l.hash : `/${l.hash}`} onClick={go(l.hash)} aria-current={isActive(l.hash) ? 'true' : undefined}>
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
