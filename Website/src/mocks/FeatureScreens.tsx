import { QR } from './qr'
import u from './ui.module.css'
import f from './FeatureScreens.module.css'

function Head({ title, sub, chip }: { title: string; sub: string; chip?: React.ReactNode }) {
  return (
    <div className={u.head}>
      <div>
        <div className={u.title}>{title}</div>
        <div className={u.sub}>{sub}</div>
      </div>
      {chip}
    </div>
  )
}

export function RegisterScreen() {
  return (
    <div className={f.pad}>
      <Head title="Registrations" sub="Spring Hackathon 2027" chip={<span className={u.chip} data-tone="muted">48 institutions</span>} />
      <div className={f.split}>
        <div className={u.card}>
          <div className={u.cardTitle}>Verification</div>
          {['Riverside College', 'Hillcrest School', 'Lakeview Academy', 'Northgate College'].map((n, i) => (
            <div key={n} className={f.vrow}>
              <span>{n}</span>
              {i === 2 ? (
                <span className={f.swap}>
                  <span className={`${u.chip} ${f.swapA}`} data-tone="muted">Pending</span>
                  <span className={`${u.chip} ${f.swapB}`} data-tone="ok">Verified</span>
                </span>
              ) : (
                <span className={u.chip} data-tone={i === 3 ? 'muted' : 'ok'}>{i === 3 ? 'Pending' : 'Verified'}</span>
              )}
            </div>
          ))}
        </div>
        <div className={u.card}>
          <div className={u.cardTitle}>Categories by preference</div>
          {[
            ['Web track', '18 of 20', 90],
            ['Mobile track', '12 of 20', 60],
            ['AI track', '20 of 20', 100],
          ].map(([n, c, w], i) => (
            <div key={n as string} className={f.cap}>
              <div className={f.capHead}><span>{n}</span><span className="num">{c}</span></div>
              <div className={u.track}><span className={`${u.fill} ${f.grow}`} style={{ width: `${w}%`, animationDelay: `${i * 0.25}s` }} /></div>
            </div>
          ))}
          <p className={u.sub}>AI track is full. New teams go to their next choice.</p>
        </div>
      </div>
    </div>
  )
}

export function RoundsScreen() {
  const tests = ['returns ranked list', 'handles ties', 'ignores late entries', 'runs under 2 seconds']
  return (
    <div className={f.pad}>
      <Head title="Rounds" sub="Build the format your event uses" />
      <div className={f.split} style={{ gridTemplateColumns: '0.9fr 1.1fr' }}>
        <div className={f.stack}>
          {[
            ['Round 1', 'Judged presentation'],
            ['Round 2', 'Design review'],
            ['Round 3', 'Quiz'],
            ['Round 4', 'Coding round'],
          ].map(([r, n], i) => (
            <div key={r} className={u.card} data-on={i === 3 || undefined} style={i === 3 ? { boxShadow: 'inset 0 0 0 1.5px var(--maroon-500)' } : undefined}>
              <div className={u.cardTitle} style={{ margin: 0 }}>{r}</div>
              <div className={u.sub}>{n}{i === 3 ? ', registered teams only' : ''}</div>
            </div>
          ))}
        </div>
        <div className={f.code}>
          <div className={f.codeBar}>solution.py</div>
          <pre className={f.pre}>
            <span className={f.k}>def</span> rank(teams):{'\n'}
            {'    '}scores = [t.total <span className={f.k}>for</span> t <span className={f.k}>in</span> teams]{'\n'}
            {'    '}<span className={f.k}>return</span> sorted(teams, key=score){'\n'}
          </pre>
          <div className={f.tests}>
            {tests.map((t, i) => (
              <div key={t} className={f.test} style={{ animationDelay: `${0.5 + i * 0.55}s` }}>
                <span className={f.tick} style={{ animationDelay: `${0.5 + i * 0.55}s` }} />
                {t}
              </div>
            ))}
          </div>
          <div className={f.score}>Auto scored, all tests passed</div>
        </div>
      </div>
    </div>
  )
}

export function JudgingScreen() {
  return (
    <div className={f.pad}>
      <Head title="Evaluate: Team Kestrel" sub="Round 1, Design review" chip={<span className={u.chip} data-tone="ok">No conflict of interest</span>} />
      <div className={f.split}>
        <div className={u.card}>
          {[
            ['Innovation', 78, 0],
            ['Design quality', 84, 1],
            ['Technical depth', 70, 0],
            ['Presentation', 90, 0],
          ].map(([c, v, a]) => (
            <div key={c as string} className={f.crit}>
              <div className={f.capHead}><span>{c}</span></div>
              <div className={f.slider}>
                <span className={u.fill} style={{ width: `${v}%` }} />
                <i className={a ? f.knobMove : undefined} style={{ left: `${v}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className={f.stack}>
          <div className={u.card}>
            <div className={u.cardTitle}>Head judge weighting</div>
            <p className={u.sub}>Set by the organizer for each round</p>
          </div>
          <div className={u.card}>
            <div className={u.cardTitle}>Mark correction</div>
            <p className={u.sub}>Requested by Judge 4, awaiting head judge approval</p>
            <span className={u.chip} data-tone="warn" style={{ marginTop: 6 }}>Pending approval</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ResultsScreen() {
  const rows = [
    ['1', 'Team Aurora', 274, true],
    ['2', 'Team Kestrel', 261, true],
    ['3', 'Byte Club', 248, true],
    ['4', 'Northwind', 239, false],
    ['5', 'Team Quill', 226, false],
  ] as const
  return (
    <div className={f.pad}>
      <Head title="Results" sub="All rounds, weighted" chip={<span className={u.chip}>Marks hidden from teams</span>} />
      <div className={u.card}>
        <div className={f.tableHead}><span>Rank</span><span>Team</span><span>Finalist</span><span>Total</span></div>
        {rows.map(([r, n, t, fin]) => (
          <div key={n} className={f.trow}>
            <span className={u.rank}>{r}</span>
            <span>{n}</span>
            <span>{fin ? <span className={u.chip} data-tone="ok">Finalist</span> : null}</span>
            <span className={`num ${f.count}`} style={{ ['--to' as string]: t }} />
          </div>
        ))}
      </div>
      <div className={f.release}>
        <span>Release marks and certificates</span>
        <span className={f.toggle} />
      </div>
    </div>
  )
}

export function AttendanceScreen() {
  return (
    <div className={f.pad}>
      <Head title="Attendance" sub="Round 2, Coding, Lab 3" chip={<span className={u.chip} data-tone="ok"><span className={u.dot} /> Scanning</span>} />
      <div className={f.split} style={{ gridTemplateColumns: '0.8fr 1.2fr' }}>
        <div className={f.scanner}>
          <div className={f.qrWrap}>
            <div className={u.qr}>
              {QR.map((on, i) => <i key={i} data-off={!on || undefined} />)}
            </div>
            <span className={f.scanLine} />
          </div>
          <p className={u.sub}>Hold the ID inside the frame</p>
        </div>
        <div className={u.card}>
          <div className={u.cardTitle}>Checked in</div>
          {['Team Aurora, 4 of 4', 'Byte Club, 3 of 3', 'Team Kestrel, 4 of 4', 'Northwind, 2 of 3'].map((n, i) => (
            <div key={n} className={f.checkin} style={{ animationDelay: `${i * 0.6}s` }}>
              <span className={f.tickStatic} />
              {n}
            </div>
          ))}
          <div className={f.capHead} style={{ marginTop: 10 }}><span>Session total</span><span className="num">186</span></div>
        </div>
      </div>
    </div>
  )
}

export function HistoryScreen() {
  return (
    <div className={f.pad}>
      <Head title="Teams and history" sub="Every edition, on record" />
      <div className={f.split}>
        <div className={u.card}>
          <div className={u.cardTitle}>Team Aurora, member changes</div>
          {[
            ['Registered with 4 members', 'Jan'],
            ['Member replaced, approved', 'Feb'],
            ['Coordinator changed', 'Mar'],
          ].map(([e, d]) => (
            <div key={e} className={f.hist}>
              <span className={f.node} />
              <span>{e}</span>
              <span className={u.sub}>{d}</span>
            </div>
          ))}
        </div>
        <div className={u.card}>
          <div className={f.search}>
            <span className={f.typed}>2026 winners</span>
          </div>
          {[
            ['2026', 'Team Lumen', 'Winner'],
            ['2026', 'Hexa', 'Runner up'],
            ['2025', 'Team Aurora', 'Winner'],
          ].map(([y, n, p]) => (
            <div key={n} className={f.result}>
              <span className="num">{y}</span>
              <span>{n}</span>
              <span className={u.chip} data-tone="muted">{p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const FEATURE_SCREENS = {
  register: RegisterScreen,
  rounds: RoundsScreen,
  judging: JudgingScreen,
  results: ResultsScreen,
  attendance: AttendanceScreen,
  history: HistoryScreen,
} as const
