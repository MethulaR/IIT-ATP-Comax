import { Monogram } from '../components/Monogram'
import u from './ui.module.css'

const NAV = ['Overview', 'Registrations', 'Teams', 'Rounds', 'Judging', 'Results', 'Attendance', 'History']
const LEADERS = [
  ['1', 'Team Aurora', '274'],
  ['2', 'Team Kestrel', '261'],
  ['3', 'Byte Club', '248'],
  ['4', 'Northwind', '239'],
]

/** The organizer overview for a generic event. Decorative, described by its label. */
export function DashboardMock({ compact = false }: { compact?: boolean }) {
  return (
    <div className={u.screen} role="img" aria-label="CoMax organizer dashboard for Spring Hackathon 2027, showing teams, judges, rounds, check ins and a live leaderboard">
      <div className={u.chrome} aria-hidden="true">
        <i />
        <i />
        <i />
        <span className={u.url}>app.comax.lk/springhackathon2027</span>
      </div>
      <div className={u.body} aria-hidden="true" style={compact ? { gridTemplateColumns: '1fr' } : undefined}>
        {!compact && (
          <div className={u.side}>
            <div className={u.brand}>
              <Monogram size={16} />
              CoMax
            </div>
            {NAV.map((n, i) => (
              <div key={n} className={u.navItem} data-active={i === 0 || undefined}>
                {n}
              </div>
            ))}
          </div>
        )}
        <div className={u.main}>
          <div className={u.head}>
            <div>
              <div className={u.title}>Spring Hackathon 2027</div>
              <div className={u.sub}>Organizer overview</div>
            </div>
            <span className={u.chip}>
              <span className={u.dot} /> Round 2 live
            </span>
          </div>
          <div className={u.tiles} style={compact ? { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' } : undefined}>
            {[
              ['Teams', '48'],
              ['Judges', '12'],
              ['Rounds', '4'],
              ['Checked in', '186'],
            ].map(([l, v]) => (
              <div key={l} className={u.tile}>
                <div className={u.tileLabel}>{l}</div>
                <div className={u.tileValue}>{v}</div>
              </div>
            ))}
          </div>
          <div className={u.cols} style={compact ? { gridTemplateColumns: '1fr' } : undefined}>
            <div className={u.card}>
              <div className={u.cardTitle}>Registrations by category</div>
              <div className={u.bars} data-bars>
                {[62, 84, 48, 72, 38, 90, 56].map((h, i) => (
                  <span key={i} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            <div className={u.card}>
              <div className={u.cardTitle}>Leaderboard</div>
              <div className={u.rows}>
                {LEADERS.map(([r, n, p]) => (
                  <div key={n} className={u.row}>
                    <span className={u.rank}>{r}</span>
                    <span>{n}</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
