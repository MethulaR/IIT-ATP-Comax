import s from './Orbs.module.css'

type Orb = { x: string; y: string; size: string; tone: 'maroon' | 'silver' | 'rose'; speed?: number; drift?: 1 | 2 | 3 }

/** Soft maroon and silver light behind glass. Pure gradients, no filter blur, drift on the compositor. */
export function Orbs({ orbs, className }: { orbs: Orb[]; className?: string }) {
  return (
    <div className={[s.layer, className].filter(Boolean).join(' ')} aria-hidden="true">
      {orbs.map((o, i) => (
        <span
          key={i}
          className={[s.orb, s[o.tone], s[`d${o.drift ?? ((i % 3) + 1)}`]].join(' ')}
          data-speed={o.speed ?? 0.2}
          style={{ left: o.x, top: o.y, width: o.size, height: o.size }}
        />
      ))}
    </div>
  )
}
