import { useRef } from 'react'
import { Glass } from '../components/Glass'
import { Monogram } from '../components/Monogram'
import { Orbs } from '../components/Orbs'
import { PROBLEM } from '../config/copy'
import { gsap } from '../motion/gsap'
import { useGsap } from '../motion/useGsap'
import { DUR, EASE, PIN } from '../motion/motion'
import { fadeIn, splitReveal } from '../motion/reveals'
import u from '../mocks/ui.module.css'
import s from './Problem.module.css'

type Piece = {
  key: string
  /** Scatter offset as fractions of the viewport, plus a small rotation in degrees. */
  scatter: [number, number, number]
  messy: React.ReactNode
  clean: React.ReactNode
}

const PIECES: Piece[] = [
  {
    key: 'marks',
    scatter: [-0.3, -0.2, -9],
    messy: (
      <div className={s.sheet}>
        <div className={s.file}>marks_final_v3.xlsx</div>
        <div className={s.cells}>
          {['Team', 'J1', 'J2', 'Total', 'Aurora', '8', '7', '15', 'Kestrel', '9', '', '#REF!', 'Byte Club', '7', '8', '15'].map((c, i) => (
            <span key={i} data-bad={c === '#REF!' || (i > 7 && i < 12) || undefined}>{c}</span>
          ))}
        </div>
      </div>
    ),
    clean: (
      <div className={s.cleanCard}>
        <div className={u.cardTitle}>Round 2 marks</div>
        <div className={u.rows}>
          <div className={u.row}><span className={u.rank}>1</span><span>Team Aurora</span><span>86.5</span></div>
          <div className={u.row}><span className={u.rank}>2</span><span>Team Kestrel</span><span>84.0</span></div>
          <div className={u.row}><span className={u.rank}>3</span><span>Byte Club</span><span>79.5</span></div>
        </div>
      </div>
    ),
  },
  {
    key: 'form',
    scatter: [0.02, -0.34, 6],
    messy: (
      <div className={s.form}>
        <div className={s.file}>Registration form (copy 2)</div>
        <div className={s.field}><i />Institution name</div>
        <div className={s.field}><i />Team members</div>
        <div className={s.field}><i />Category</div>
        <div className={s.responses}>61 responses, 9 duplicates</div>
      </div>
    ),
    clean: (
      <div className={s.cleanCard}>
        <div className={u.cardTitle}>Registrations</div>
        <div className={s.list}>
          <span>Riverside College</span><span className={u.chip} data-tone="ok">Verified</span>
          <span>Hillcrest School</span><span className={u.chip} data-tone="ok">Verified</span>
          <span>Lakeview Academy</span><span className={u.chip} data-tone="muted">Pending</span>
        </div>
      </div>
    ),
  },
  {
    key: 'chat',
    scatter: [0.32, -0.16, 10],
    messy: (
      <div className={s.chat}>
        <p className={s.bubble}>who has the latest marks?</p>
        <p className={s.bubble} data-me>check the other sheet</p>
        <p className={s.bubble}>which one, there are three</p>
      </div>
    ),
    clean: (
      <div className={s.cleanCard}>
        <div className={u.cardTitle}>Announcements</div>
        <p className={s.notice}>Round 3 starts at 2.00 pm in Hall B. Teams have been notified.</p>
        <span className={u.chip}>Sent to 48 teams</span>
      </div>
    ),
  },
  {
    key: 'board',
    scatter: [-0.34, 0.2, 7],
    messy: (
      <div className={s.paste}>
        <div className={s.file}>leaderboard (copied).txt</div>
        <p>1. Aurora 15</p>
        <p>2. Byte Club 15 ??</p>
        <p data-strike>3. Kestrel</p>
        <p className={s.scrawl}>is this updated?</p>
      </div>
    ),
    clean: (
      <div className={s.cleanCard}>
        <div className={u.cardTitle}>Live leaderboard</div>
        <div className={u.bars} style={{ height: 70 }}>
          {[92, 86, 78, 70, 61].map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}
        </div>
      </div>
    ),
  },
  {
    key: 'tabs',
    scatter: [0.04, 0.3, -6],
    messy: (
      <div className={s.tabs}>
        <span>Marks FINAL</span>
        <span>Marks FINAL (2)</span>
        <span>Registrations old</span>
        <span>Winners 2025?</span>
      </div>
    ),
    clean: (
      <div className={s.cleanCard}>
        <div className={u.cardTitle}>History</div>
        <div className={s.editions}>
          <span>2025 edition</span><span>2026 edition</span><span data-now>2027 edition</span>
        </div>
        <p className={u.sub}>Every winner, team and contact, searchable.</p>
      </div>
    ),
  },
  {
    key: 'rows',
    scatter: [0.33, 0.22, -10],
    messy: (
      <div className={s.redrows}>
        <div className={s.file}>attendance.csv</div>
        <p data-bad>Duplicate entry, row 14</p>
        <p data-bad>Missing ID, row 22</p>
        <p>Signed sheet, page 3</p>
      </div>
    ),
    clean: (
      <div className={s.cleanCard}>
        <div className={u.cardTitle}>Attendance</div>
        <div className={u.tileValue}>186</div>
        <p className={u.sub}>Checked in by QR, Round 2</p>
        <div className={u.track}><span className={u.fill} style={{ width: '91%' }} /></div>
      </div>
    ),
  },
]

export function Problem() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, (q, el) => {
    const $ = gsap.utils.selector(el)
    const title = $('[data-title]')[0] as HTMLElement
    if (q.reduce) {
      fadeIn($('[data-fade]'), el)
      return
    }
    splitReveal(title, { variant: 'wipe' })

    const pieces = $('[data-piece]') as HTMLElement[]
    const scatterOf = (p: HTMLElement) => (p.dataset.scatter || '0,0,0').split(',').map(Number)

    if (q.desktop) {
      const tl = gsap.timeline({
        defaults: { ease: EASE.scrub },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: `+=${PIN.long * 100}%`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      // Chaos: pieces start scattered across the viewport, tilted, in their old tools.
      pieces.forEach((p, i) => {
        const [sx, sy, rot] = scatterOf(p)
        tl.fromTo(
          p,
          { x: () => sx * window.innerWidth * 0.78, y: () => sy * window.innerHeight * 0.8, rotate: rot, scale: 0.92 },
          { x: 0, y: 0, rotate: 0, scale: 1, duration: 0.62 },
          0.04 + i * 0.025,
        )
        tl.fromTo(p.querySelector('[data-messy]'), { opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(4px)', duration: 0.12 }, 0.5 + i * 0.02)
        tl.fromTo(p.querySelector('[data-clean]'), { opacity: 0 }, { opacity: 1, duration: 0.12 }, 0.54 + i * 0.02)
      })
      // Order: the frame appears around the pieces as they snap in.
      tl.fromTo($('[data-frame]'), { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.2 }, 0.58)
      // Captions swap with the scroll.
      const caps = $('[data-cap]')
      tl.fromTo(caps[0], { opacity: 1, yPercent: 0 }, { opacity: 0, yPercent: -60, duration: 0.06 }, 0.26)
      tl.fromTo(caps[1], { opacity: 0, yPercent: 60 }, { opacity: 1, yPercent: 0, duration: 0.06 }, 0.3)
      tl.to(caps[1], { opacity: 0, yPercent: -60, duration: 0.06 }, 0.5)
      tl.fromTo(caps[2], { opacity: 0, yPercent: 60 }, { opacity: 1, yPercent: 0, duration: 0.06 }, 0.54)
      tl.to(caps[2], { opacity: 0, yPercent: -60, duration: 0.06 }, 0.74)
      tl.fromTo(caps[3], { opacity: 0, yPercent: 60, filter: 'blur(8px)' }, { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.08 }, 0.78)
      tl.to({}, { duration: 0.12 }) // hold the finished board before releasing the pin
    } else {
      // Compact: no pin. The board assembles once as it enters.
      const tl = gsap.timeline({ scrollTrigger: { trigger: $('[data-frame]')[0], start: 'top 75%', once: true } })
      pieces.forEach((p, i) => {
        const [sx, sy, rot] = scatterOf(p)
        tl.from(p, { x: sx * 120, y: sy * 160, rotate: rot, opacity: 0, duration: DUR.l, ease: EASE.out }, i * 0.06)
        tl.fromTo(p.querySelector('[data-messy]'), { opacity: 1 }, { opacity: 0, duration: DUR.s, ease: EASE.inOut }, 0.7 + i * 0.06)
        tl.fromTo(p.querySelector('[data-clean]'), { opacity: 0 }, { opacity: 1, duration: DUR.s, ease: EASE.inOut }, 0.75 + i * 0.06)
      })
      $('[data-cap]').forEach((c) => {
        gsap.from(c, { y: 24, opacity: 0, duration: DUR.m, ease: EASE.out, scrollTrigger: { trigger: c, start: 'top 88%', once: true } })
      })
    }
  }, [])

  return (
    <section ref={root} id="product" className={s.problem} aria-labelledby="problem-title">
      <a className="skip-section" href="#portals">
        Skip to portals
      </a>
      <div className={s.inner}>
        <div className={s.head}>
          <p className="eyebrow" data-fade>
            {PROBLEM.eyebrow}
          </p>
          <h2 id="problem-title" data-title data-fade className={s.title}>
            {PROBLEM.title}
          </h2>
          <div className={s.captions} data-fade>
            {PROBLEM.captions.map((c) => (
              <p key={c} className={s.cap} data-cap>
                {c}
              </p>
            ))}
            <p className={`${s.cap} ${s.capEnd}`} data-cap>
              Now it all lives in <span className="metal">CoMax.</span>
            </p>
          </div>
        </div>

        <div className={s.stage}>
          <Orbs
            className={s.orbs}
            orbs={[
              { x: '12%', y: '30%', size: '34vmax', tone: 'rose' },
              { x: '88%', y: '70%', size: '30vmax', tone: 'maroon' },
              { x: '50%', y: '110%', size: '40vmax', tone: 'silver' },
            ]}
          />
          <Glass className={s.frame} radius="xl" data-frame aria-hidden="true">
            <div className={s.frameBar}>
              <Monogram size={18} />
              <span>CoMax</span>
              <span className={s.frameEvent}>Spring Hackathon 2027</span>
            </div>
          </Glass>
          <div className={s.grid} role="img" aria-label="Scattered spreadsheets, forms, chats and copied leaderboards come together into one CoMax dashboard with marks, registrations, announcements, a live leaderboard, history and attendance">
            {PIECES.map((p) => (
              <div key={p.key} className={s.piece} data-piece data-scatter={p.scatter.join(',')} aria-hidden="true">
                <div className={s.messy} data-messy>
                  {p.messy}
                </div>
                <div className={s.clean} data-clean>
                  {p.clean}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
