import { CONTACT } from '../config/site'
import s from './ContactLinks.module.css'

type IconName = 'email' | 'phone' | 'facebook' | 'instagram' | 'linkedin'

/** Simple 24px line and brand glyphs, drawn in currentColor. */
export function Icon({ name }: { name: IconName }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', 'aria-hidden': true, focusable: false } as const
  switch (name) {
    case 'email':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      )
    case 'phone':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.6 3.5h2.6l1.5 4-2 1.3a11 11 0 0 0 6.5 6.5l1.3-2 4 1.5v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" />
        </svg>
      )
    case 'facebook':
      return (
        <svg {...common} fill="currentColor">
          <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9Z" />
        </svg>
      )
    case 'instagram':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg {...common} fill="currentColor">
          <path d="M5.3 8.6h3V19h-3V8.6Zm1.5-4.8a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5ZM10.2 8.6h2.9V10h.1c.4-.8 1.4-1.7 3-1.7 3.1 0 3.7 2.1 3.7 4.8V19h-3v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V19h-3V8.6Z" />
        </svg>
      )
  }
}

/** Email and phone as icon rows. */
export function ContactRows({ className }: { className?: string }) {
  return (
    <ul className={[s.rows, className].filter(Boolean).join(' ')} role="list">
      <li>
        <a href={CONTACT.emailHref}>
          <span className={s.badge}>
            <Icon name="email" />
          </span>
          {CONTACT.email}
        </a>
      </li>
      <li>
        <a href={CONTACT.phoneHref}>
          <span className={s.badge}>
            <Icon name="phone" />
          </span>
          {CONTACT.phone}
        </a>
      </li>
    </ul>
  )
}

/** Round icon buttons for the social pages. They open in a new tab. */
export function SocialIcons({ className }: { className?: string }) {
  return (
    <ul className={[s.social, className].filter(Boolean).join(' ')} role="list">
      {CONTACT.social.map((so) => (
        <li key={so.key}>
          <a href={so.href} target="_blank" rel="noopener noreferrer" aria-label={`CoMax on ${so.label} (opens in a new tab)`} title={so.label}>
            <Icon name={so.key} />
          </a>
        </li>
      ))}
    </ul>
  )
}
