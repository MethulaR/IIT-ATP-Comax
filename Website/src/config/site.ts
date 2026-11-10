/**
 * Site wide config. Change the portal URL in .env (VITE_PORTAL_URL), not here.
 * All visible copy for the sections lives in src/config/copy.ts.
 */
export const PORTAL_URL: string = import.meta.env.VITE_PORTAL_URL || '#contact'
export const SITE_URL: string = (import.meta.env.VITE_SITE_URL || 'https://comaxdigital.com').replace(/\/$/, '')
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

export const CONTACT = {
  email: 'comax.digital@gmail.com',
  emailHref: 'mailto:comax.digital@gmail.com',
  phone: '077 439 0896',
  phoneHref: 'tel:+94774390896',
  social: [
    { key: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/comax.digital' },
    { key: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/comax.digital' },
    { key: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/company/comax.digital' },
  ],
} as const
