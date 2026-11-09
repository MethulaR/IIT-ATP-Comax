/**
 * Site wide config. Change the portal URL in .env (VITE_PORTAL_URL), not here.
 * All visible copy for the sections lives in src/config/copy.ts.
 */
export const PORTAL_URL: string = import.meta.env.VITE_PORTAL_URL || '#contact'
export const SITE_URL: string = (import.meta.env.VITE_SITE_URL || 'https://comax.lk').replace(/\/$/, '')
export const FORM_ENDPOINT: string = import.meta.env.VITE_FORM_ENDPOINT || ''

/**
 * Nav links and the sections each one covers for the scroll spy.
 * A link stays active while any of its sections crosses the middle of the screen.
 * Sections with no link of their own (trust, marquee) belong to the link above them.
 */
export const NAV_LINKS = [
  { label: 'Product', hash: '#platform', sections: ['platform', 'product'] },
  { label: 'Portals', hash: '#portals', sections: ['portals'] },
  { label: 'Features', hash: '#features', sections: ['features'] },
  { label: 'How it works', hash: '#how', sections: ['how', 'trust'] },
  { label: 'Partners', hash: '#partners', sections: ['partners', 'marquee'] },
  { label: 'Team', hash: '#team', sections: ['team'] },
] as const

/** Placeholders until the team confirms real handles. */
export const CONTACT = {
  email: '[contact email]',
  emailHref: '#contact',
  social: [
    { label: 'LinkedIn', href: '#contact', note: 'link coming soon' },
    { label: 'Instagram', href: '#contact', note: 'link coming soon' },
    { label: 'GitHub', href: '#contact', note: 'link coming soon' },
  ],
} as const
