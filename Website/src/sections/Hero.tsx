import { useRef } from 'react'
import { Glass } from '../components/Glass'
import { Button } from '../components/Button'
import { Orbs } from '../components/Orbs'
import { Fit } from '../components/Fit'
import { DashboardMock } from '../mocks/DashboardMock'
import { PORTAL_URL } from '../config/site'
import { HERO } from '../config/copy'
import { gsap } from '../motion/gsap'
import { useGsap } from '../motion/useGsap'
import { DUR, EASE } from '../motion/motion'
import { onIntro } from '../motion/intro'
import { splitReveal } from '../motion/reveals'
import { QR } from '../mocks/qr'
import u from '../mocks/ui.module.css'
import s from './Hero.module.css'

/** Four glass cards, one per portal, floating in depth around the dashboard. */
function PortalCards() {
  return (
    <>
      <div className={`${s.slot} ${s.c1}`} data-fly="-1,-0.6">
        <div data-depth="1.4">
          <div data-float>
            <Glass className={s.card} radius="m" refract>
              <p className={s.cardKicker}>Public event page</p>
              <p className={s.cardTitle}>Results are live</p>
              <div className={u.rows} aria-hidden="true">
                <div className={u.row}><span className={u.rank}>1</span><span>Team Aurora</span><span>274</span></div>
                <div className={u.row}><span className={u.rank}>2</span><span>Team Kestrel</span><span>261</span></div>
              </div>
            </Glass>
          </div>
        </div>
      </div>
      <div className={`${s.slot} ${s.c2}`} data-fly="-1.1,0.5">
        <div data-depth="0.8">
          <div data-float>
            <Glass className={s.card} radius="m">
              <p className={s.cardKicker}>Participants</p>
              <div className={s.idRow}>
                <div className={u.qr} aria-hidden="true" style={{ width: 44 }}>
                  {QR.map((on, i) => <i key={i} data-off={!on || undefined} />)}
                </div>
                <div>
                  <p className={s.cardTitle}>Digital ID</p>
                  <span className={u.chip} data-tone="ok"><span className={u.dot} /> Checked in</span>
                </div>
              </div>
            </Glass>
          </div>
        </div>
      </div>
      <div className={`${s.slot} ${s.c3}`} data-fly="1,-0.7">
        <div data-depth="1.2">
          <div data-float>
            <Glass className={s.card} radius="m" refract>
              <p className={s.cardKicker}>Judges</p>
              <p className={s.cardTitle}>Innovation, 30%</p>
              <div className={u.track} aria-hidden="true"><span className={u.fill} style={{ width: '78%' }} /></div>
              <p className={s.cardMeta}><span>Score</span><span className="num">7.8 / 10</span></p>
            </Glass>
          </div>
        </div>
      </div>
      <div className={`${s.slot} ${s.c4}`} data-fly="1.1,0.6">
        <div data-depth="0.7">
          <div data-float>
            <Glass className={s.card} radius="m">
              <p className={s.cardKicker}>Organizers</p>
              <p className={s.cardTitle}>Institutions verified</p>
              <div className={u.track} aria-hidden="true"><span className={u.fill} style={{ width: '88%' }} /></div>
              <p className={s.cardMeta}><span>42 of 48</span><span>Review 6</span></p>
            </Glass>
          </div>
        </div>
      </div>
    </>
  )
}

export function Hero() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, (q, el) => {
    const $ = gsap.utils.selector(el)
    const h1 = $('h1')[0] as HTMLElement

    if (q.reduce) return // Everything is already visible. The loader fades over it.
    const cleanups: Array<() => void> = []

    // Intro: plays as the loader lens opens. The headline is plain text until now, which keeps LCP early.
    const off = onIntro(() => {
      const reveal = splitReveal(h1, { variant: 'words', scroll: false })
      const tl = gsap.timeline()
      tl.add(() => reveal.play(), 0)
      tl.from($('[data-intro]'), { y: 26, opacity: 0, filter: 'blur(6px)', duration: DUR.l, ease: EASE.out, stagger: 0.08 }, 0.35)
      // Intro tweens sit on their own wrappers so they never fight the scroll and parallax transforms.
      tl.from($('[data-dash-in]'), { y: 140, opacity: 0, scale: 0.94, duration: 1.6, ease: EASE.out }, 0.45)
      tl.from($('[data-float] > *'), { yPercent: 40, opacity: 0, scale: 0.92, duration: 1.5, ease: EASE.out, stagger: 0.09 }, 0.6)
    })
    cleanups.push(off)

    // Idle float: slow, small, never in sync.
    $('[data-float]').forEach((n, i) => {
      gsap.to(n, { y: i % 2 ? 10 : -12, duration: 3.4 + i * 0.6, ease: EASE.idle, yoyo: true, repeat: -1, delay: i * 0.3 })
    })

    if (q.finePointer) {
      // Mouse parallax, deeper layers move further.
      const layers = $('[data-depth]').map((n) => ({
        d: parseFloat((n as HTMLElement).dataset.depth || '1'),
        x: gsap.quickTo(n, 'x', { duration: 1.1, ease: 'power3.out' }),
        y: gsap.quickTo(n, 'y', { duration: 1.1, ease: 'power3.out' }),
      }))
      const onMove = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5
        const ny = e.clientY / window.innerHeight - 0.5
        layers.forEach((l) => {
          l.x(nx * 26 * l.d)
          l.y(ny * 18 * l.d)
        })
      }
      window.addEventListener('pointermove', onMove, { passive: true })
      cleanups.push(() => window.removeEventListener('pointermove', onMove))
    }

    if (q.desktop) {
      // Scrubbed exit: headline drifts up and blurs, cards fly out, dashboard grows to fill the screen.
      const dash = $('[data-dash]')[0] as HTMLElement
      const stage = dash.parentElement as HTMLElement
      // Measured from layout (offsets), not from transforms, so the intro tween never skews it.
      const cover = () => Math.max(window.innerWidth / dash.offsetWidth, window.innerHeight / dash.offsetHeight) * 1.08
      const toCenter = () => window.innerHeight / 2 - (stage.offsetTop + dash.offsetTop + dash.offsetHeight / 2)
      const tl = gsap.timeline({
        defaults: { ease: EASE.scrub },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: '+=110%',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      tl.to($('[data-copy]'), { yPercent: -40, opacity: 0, filter: 'blur(12px)', duration: 0.5 }, 0)
      $('[data-fly]').forEach((n) => {
        const [fx, fy] = ((n as HTMLElement).dataset.fly || '0,0').split(',').map(Number)
        tl.to(n, { x: () => fx * window.innerWidth * 0.45, y: () => fy * window.innerHeight * 0.6, opacity: 0, duration: 0.6 }, 0)
      })
      tl.to(dash, { y: toCenter, scale: cover, duration: 1 }, 0.05)
      tl.to($('[data-dash-veil]'), { opacity: 1, duration: 0.35 }, 0.7)
      tl.to($('[data-orbs]'), { yPercent: -20, opacity: 0.4, duration: 1 }, 0)
    } else {
      // Compact: a light scrubbed fade, no pin.
      gsap.to($('[data-copy]'), {
        y: -40,
        opacity: 0.2,
        ease: EASE.scrub,
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
      })
    }
    return () => cleanups.forEach((c) => c())
  }, [])

  return (
    <section ref={root} id="top" className={s.hero} aria-labelledby="hero-title">
      <div data-orbs className={s.orbs}>
        <Orbs
          orbs={[
            { x: '18%', y: '30%', size: '46vmax', tone: 'silver' },
            { x: '82%', y: '22%', size: '38vmax', tone: 'maroon' },
            { x: '60%', y: '86%', size: '52vmax', tone: 'rose' },
            { x: '12%', y: '92%', size: '30vmax', tone: 'maroon' },
          ]}
        />
      </div>
      <div className={s.copy} data-copy>
        <p className="eyebrow" data-intro>
          {HERO.eyebrow}
        </p>
        <h1 id="hero-title" className={s.title}>
          {HERO.title[0]} <br className={s.br} />
          {HERO.title[1]} <br className={s.br} />
          <span className="metal">{HERO.title[2]}</span>
        </h1>
        <p className={`lead ${s.lead}`} data-intro>
          {HERO.sub}
        </p>
        <div className={s.actions} data-intro>
          <Button href={PORTAL_URL} size="l" icon>
            Request a demo
          </Button>
          <Button href="#how" variant="glass" size="l">
            See how it works
          </Button>
        </div>
      </div>

      <div className={s.stage}>
        <div className={s.dash} data-dash>
          <div data-depth="0.35" className={s.dashInner}>
            <div data-dash-in className={s.dashIn}>
              <Glass className={s.dashGlass} radius="xl" specular={false}>
                <div className={s.dashScreen}>
                  {/* Both layouts ship in the HTML. CSS picks one, so nothing jumps on hydration. */}
                  <div className={s.wide}>
                    <Fit w={1040} h={640}>
                      <DashboardMock />
                    </Fit>
                  </div>
                  <div className={s.narrow}>
                    <Fit w={560} h={520}>
                      <DashboardMock compact />
                    </Fit>
                  </div>
                </div>
              </Glass>
              <div className={s.veil} data-dash-veil aria-hidden="true" />
            </div>
          </div>
        </div>
        <PortalCards />
      </div>
    </section>
  )
}
