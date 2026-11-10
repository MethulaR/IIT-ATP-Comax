import { useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Logo } from './Monogram'
import { NAV_LINKS } from '../config/site'
import { ContactRows, SocialIcons } from './ContactLinks'
import { gsap } from '../motion/gsap'
import { useGsap } from '../motion/useGsap'
import { EASE } from '../motion/motion'
import s from './Footer.module.css'

export function Footer() {
  const root = useRef<HTMLElement>(null)
  const { pathname } = useLocation()
  const onHome = pathname === '/'

  useGsap(root, (q, el) => {
    const $ = gsap.utils.selector(el)
    if (q.reduce) {
      gsap.set($('[data-fill]'), { yPercent: 0 })
      gsap.set($('[data-fill-inner]'), { yPercent: 0 })
      return
    }
    // Liquid metal rises inside the outlined wordmark as it scrolls into view.
    const st = { trigger: $('[data-word]')[0], start: 'top bottom', end: 'bottom bottom', scrub: 1 }
    gsap.fromTo($('[data-fill]'), { yPercent: 100 }, { yPercent: 0, ease: EASE.scrub, scrollTrigger: st })
    gsap.fromTo($('[data-fill-inner]'), { yPercent: -100 }, { yPercent: 0, ease: EASE.scrub, scrollTrigger: st })
  }, [pathname])

  return (
    <footer ref={root} id="footer" className={s.footer}>
      <div className={`container ${s.top}`}>
        <div className={s.brand}>
          <Logo />
          <p>Events and competitions, managed.</p>
        </div>
        <nav aria-label="Footer" className={s.cols}>
          <ul role="list">
            {NAV_LINKS.map((l) => (
              <li key={l.hash}>
                <a href={onHome ? l.hash : `/${l.hash}`}>{l.label}</a>
              </li>
            ))}
          </ul>
          <ul role="list">
            <li>
              <Link to="/privacy">Privacy policy</Link>
            </li>
          </ul>
        </nav>
        <div className={s.reach}>
          <ContactRows />
          <SocialIcons />
        </div>
      </div>
      <div className={`container ${s.bottom}`}>
        <p>&copy; ATP Group 15, IIT, 2026</p>
        <p>Built for module 5COSC021C</p>
      </div>
      <div className={s.word} data-word aria-hidden="true">
        <span className={s.outline}>CoMax</span>
        <span className={s.fill} data-fill>
          <span className={`${s.fillInner} metal`} data-fill-inner>
            CoMax
          </span>
        </span>
      </div>
    </footer>
  )
}
