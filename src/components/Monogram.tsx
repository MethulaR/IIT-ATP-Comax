import { useId } from 'react'

/**
 * The CoMax mark. One continuous stroke: a C sweeps round the left and, where it would close,
 * turns up into a peak. Co for together, the peak for max.
 */
export const MARK_PATH = 'M46.72 15.65 A22 22 0 1 0 46.72 48.35 L32 25.5 L17.28 48.35'

type Props = { size?: number; tone?: 'maroon' | 'silver' | 'ink'; title?: string; className?: string }

export function Monogram({ size = 32, tone = 'maroon', title, className }: Props) {
  const id = useId().replace(/:/g, '')
  const stops =
    tone === 'silver'
      ? ['#FDFDFD', '#C9CBD1', '#8C8F98', '#FDFDFD']
      : tone === 'ink'
        ? ['#1A1A1E', '#4A4A52', '#1A1A1E', '#4A4A52']
        : ['#8E1B30', '#6B1424', '#3D0A14', '#B8475C']
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={`m${id}`} x1="8" y1="6" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={stops[0]} />
          <stop offset="0.45" stopColor={stops[1]} />
          <stop offset="0.75" stopColor={stops[2]} />
          <stop offset="1" stopColor={stops[3]} />
        </linearGradient>
      </defs>
      <path d={MARK_PATH} fill="none" stroke={`url(#m${id})`} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Logo({ tone = 'maroon', className }: { tone?: 'maroon' | 'silver'; className?: string }) {
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <Monogram size={28} tone={tone} />
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 650,
          fontSize: '1.1875rem',
          letterSpacing: '-0.03em',
          color: tone === 'silver' ? 'var(--silver-hi)' : 'var(--ink)',
        }}
      >
        CoMax
      </span>
    </span>
  )
}
