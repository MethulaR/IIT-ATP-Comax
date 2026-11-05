/** SVG filter referenced by backdrop-filter: url(#liquid-glass). Only Chromium honours it. */
export function LiquidFilter() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
      <filter id="liquid-glass" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="7" result="noise" />
        <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
        <feDisplacementMap in="SourceGraphic" in2="soft" scale="38" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  )
}

/** Turn refraction on only where it actually renders. Safari and Firefox keep plain blur. */
export function detectRefraction() {
  const ua = navigator.userAgent
  const chromium = /Chrome\/|Chromium\/|Edg\//.test(ua) && !/Firefox\//.test(ua)
  const supports = typeof CSS !== 'undefined' && CSS.supports('backdrop-filter', 'url(#liquid-glass) blur(2px)')
  if (chromium && supports) document.documentElement.classList.add('has-refraction')
}
