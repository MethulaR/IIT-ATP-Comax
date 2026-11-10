import { Monogram } from '../components/Monogram'
import { QR } from './qr'
import u from './ui.module.css'
import s from './PortalMocks.module.css'

function Chrome({ url }: { url: string }) {
  return (
    <div className={u.chrome}>
      <i />
      <i />
      <i />
      <span className={u.url}>{url}</span>
    </div>
  )
}

export function PublicMock() {
  return (
    <div className={u.screen} aria-hidden="true">
      <Chrome url="springhackathon2027.comaxdigital.com" />
      <div className={s.pub}>
        <div className={s.pubHero}>
          <span className={s.pubKicker}>Spring Hackathon 2027</span>
          <span className={s.pubTitle}>Build for your city.</span>
          <span className={s.pubMeta}>12 to 14 March, Main Hall and online</span>
          <div className={s.tabs}>
            <span data-on>Schedule</span>
            <span>Categories</span>
            <span>Results</span>
            <span>Past winners</span>
          </div>
        </div>
        <div className={s.pubList}>
          {[
            ['09.00', 'Opening and briefing', 'Main Hall'],
            ['10.30', 'Round 1, Design review', 'Studios A to D'],
            ['14.00', 'Round 2, Coding', 'Online'],
            ['17.30', 'Finalists announced', 'Main Hall'],
          ].map(([t, n, v]) => (
            <div key={t} className={s.pubRow}>
              <span className="num">{t}</span>
              <span>{n}</span>
              <span className={u.sub}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ParticipantMock() {
  return (
    <div className={u.screen} aria-hidden="true">
      <Chrome url="app.comaxdigital.com/me" />
      <div className={s.part}>
        <div className={s.idCard}>
          <div className={s.idTop}>
            <Monogram size={16} tone="silver" />
            <span>Participant ID</span>
          </div>
          <div className={u.qr} style={{ width: 92, background: '#fff', padding: 6, borderRadius: 8 }}>
            {QR.map((on, i) => (
              <i key={i} data-off={!on || undefined} />
            ))}
          </div>
          <span className={s.idName}>Team Aurora</span>
          <span className={s.idSub}>Riverside College</span>
        </div>
        <div className={s.partMain}>
          <div className={u.head}>
            <span className={u.title}>Your rounds</span>
            <span className={u.chip} data-tone="ok">
              <span className={u.dot} /> Checked in
            </span>
          </div>
          {[
            ['Round 1', 'Design review', 'Marks released', 'ok'],
            ['Round 2', 'Coding round', 'Open now', ''],
            ['Round 3', 'Final pitch', 'Opens Friday', 'muted'],
          ].map(([r, n, st, tone]) => (
            <div key={r} className={u.card} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className={u.cardTitle} style={{ margin: 0 }}>{r}</div>
                <div className={u.sub}>{n}</div>
              </div>
              <span className={u.chip} data-tone={tone || undefined}>{st}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function JudgeMock() {
  return (
    <div className={u.screen} aria-hidden="true">
      <Chrome url="app.comaxdigital.com/judge" />
      <div className={s.judge}>
        <div className={u.head}>
          <div>
            <div className={u.title}>Team Kestrel</div>
            <div className={u.sub}>Round 1, Design review</div>
          </div>
          <span className={u.chip} data-tone="muted">Entry 7 of 12</span>
        </div>
        {[
          ['Innovation', '30%', 78],
          ['Design quality', '25%', 84],
          ['Technical depth', '25%', 70],
          ['Presentation', '20%', 90],
        ].map(([c, w, v]) => (
          <div key={c as string} className={s.crit}>
            <div className={s.critHead}>
              <span>{c}</span>
              <span className={u.sub}>weight {w}</span>
              <span className="num">{((v as number) / 10).toFixed(1)}</span>
            </div>
            <div className={u.track}>
              <span className={u.fill} style={{ width: `${v}%` }} />
            </div>
          </div>
        ))}
        <div className={s.judgeFoot}>
          <span className={u.chip} data-tone="ok">No conflict of interest</span>
          <span className={s.submit}>Submit and lock</span>
        </div>
      </div>
    </div>
  )
}

export function OrganizerMock() {
  return (
    <div className={u.screen} aria-hidden="true">
      <Chrome url="app.comaxdigital.com/organizer" />
      <div className={s.org}>
        <div className={u.tiles} style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          {[
            ['Verified', '42 of 48'],
            ['Checked in', '186'],
            ['Marks in', '91%'],
          ].map(([l, v]) => (
            <div key={l} className={u.tile}>
              <div className={u.tileLabel}>{l}</div>
              <div className={u.tileValue} style={{ fontSize: 19 }}>{v}</div>
            </div>
          ))}
        </div>
        <div className={u.card}>
          <div className={u.cardTitle}>Verification queue</div>
          {[
            ['Lakeview Academy', 'Institution'],
            ['Hillcrest School', '3 participants'],
            ['Northgate College', 'Coordinator'],
          ].map(([n, t]) => (
            <div key={n} className={s.queue}>
              <span>{n}</span>
              <span className={u.sub}>{t}</span>
              <span className={s.approve}>Verify</span>
            </div>
          ))}
        </div>
        <div className={s.release}>
          <span>Release Round 1 results</span>
          <span className={s.toggle} />
        </div>
      </div>
    </div>
  )
}
