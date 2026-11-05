/**
 * Site wide config. Change the portal URL in .env (VITE_PORTAL_URL), not here.
 * All visible copy for the sections lives in src/config/copy.ts.
 */
export const PORTAL_URL: string = import.meta.env.VITE_PORTAL_URL || '#contact'
export const SITE_URL: string = (import.meta.env.VITE_SITE_URL || 'https://comax.lk').replace(/\/$/, '')
export const FORM_ENDPOINT: string = import.meta.env.VITE_FORM_ENDPOINT || ''

export const NAV_LINKS = [
  { label: 'Product', hash: '#product' },
  { label: 'Portals', hash: '#portals' },
  { label: 'Features', hash: '#features' },
  { label: 'How it works', hash: '#how' },
  { label: 'Partners', hash: '#partners' },
  { label: 'Team', hash: '#team' },
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
