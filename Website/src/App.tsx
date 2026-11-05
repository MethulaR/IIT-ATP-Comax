import { lazy, Suspense, useEffect, useLayoutEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Nav } from './components/Nav'
import { Cursor } from './components/Cursor'
import { LiquidFilter, detectRefraction } from './components/LiquidFilter'
import { Loader } from './sections/Loader'
import { Home } from './pages/Home'
import { ScrollTrigger } from './motion/gsap'
import { bindNativeSheen, scrollState, scrollToTarget, startSmoothScroll } from './motion/scroll'

const Privacy = lazy(() => import('./pages/Privacy'))
const NotFound = lazy(() => import('./pages/NotFound'))

function useRouteScroll() {
  const { pathname, hash } = useLocation()
  useLayoutEffect(() => {
    if (hash) {
      // Wait for the target section to mount (below the fold content is code split).
      let tries = 0
      const tryScroll = () => {
        const el = document.querySelector(hash)
        if (el) scrollToTarget(hash, { immediate: true })
        else if (tries++ < 40) window.setTimeout(tryScroll, 50)
      }
      window.setTimeout(tryScroll, 0)
    } else {
      scrollState.lenis ? scrollState.lenis.scrollTo(0, { immediate: true, force: true }) : window.scrollTo(0, 0)
    }
  }, [pathname, hash])
}

export function App() {
  const { pathname } = useLocation()
  useRouteScroll()

  useEffect(() => {
    detectRefraction()
    const lenis = startSmoothScroll()
    const unbind = lenis ? () => {} : bindNativeSheen()
    // Positions depend on fonts and images. Refresh once they are in.
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh, { once: true })
    return () => {
      unbind()
      window.removeEventListener('load', refresh)
    }
  }, [])

  useEffect(() => {
    document.title =
      pathname === '/'
        ? 'CoMax | Events and competitions, managed'
        : pathname === '/privacy'
          ? 'Privacy policy | CoMax'
          : 'Page not found | CoMax'
  }, [pathname])

  return (
    <>
      <Loader />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <LiquidFilter />
      <Nav />
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <div className="noise" aria-hidden="true" />
      <Cursor />
    </>
  )
}
