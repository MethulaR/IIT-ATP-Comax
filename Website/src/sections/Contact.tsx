import { useId, useRef, useState } from 'react'
import { CONTACT_COPY } from '../config/copy'
import { FORM_ENDPOINT, PORTAL_URL } from '../config/site'
import { Glass } from '../components/Glass'
import { Button } from '../components/Button'
import { Orbs } from '../components/Orbs'
import { gsap } from '../motion/gsap'
import { useGsap } from '../motion/useGsap'
import { fadeIn, splitReveal } from '../motion/reveals'
import { ContactRows, SocialIcons } from '../components/ContactLinks'
import s from './Contact.module.css'

type Field = 'name' | 'email' | 'organisation' | 'message'
type Values = Record<Field, string>
const EMPTY: Values = { name: '', email: '', organisation: '', message: '' }

function validate(v: Values): Partial<Record<Field, string>> {
  const e: Partial<Record<Field, string>> = {}
  if (!v.name.trim()) e.name = 'Please tell us your name.'
  if (!v.email.trim()) e.email = 'Please add your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'That email address does not look right.'
  if (!v.organisation.trim()) e.organisation = 'Which school, university or company are you with?'
  if (v.message.trim().length < 10) e.message = 'A sentence or two about your event helps us prepare.'
  return e
}

export function Contact() {
  const root = useRef<HTMLElement>(null)
  const id = useId()
  const [values, setValues] = useState<Values>(EMPTY)
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const successRef = useRef<HTMLHeadingElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const errors = validate(values)

  useGsap(root, (q, el) => {
    const $ = gsap.utils.selector(el)
    const h = $('[data-headline]')[0] as HTMLElement
    if (q.reduce) {
      fadeIn([h, ...$('[data-fade]')], el)
      return
    }
    splitReveal(h, { variant: 'chars', start: 'top 80%' })
    gsap.from($('[data-fade]'), { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: h, start: 'top 75%', once: true } })
  }, [])

  const set = (f: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [f]: e.target.value }))
  const blur = (f: Field) => () => setTouched((t) => ({ ...t, [f]: true }))
  const show = (f: Field) => (touched[f] ? errors[f] : undefined)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, email: true, organisation: true, message: true })
    const first = (Object.keys(errors) as Field[])[0]
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    setStatus('sending')
    try {
      if (FORM_ENDPOINT) {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(values),
        })
        if (!res.ok) throw new Error(String(res.status))
      } else {
        await new Promise((r) => setTimeout(r, 600))
      }
      setStatus('sent')
      requestAnimationFrame(() => successRef.current?.focus())
    } catch {
      setStatus('error')
    }
  }

  const input = (f: Field, label: string, type = 'text', auto?: string) => {
    const err = show(f)
    return (
      <div className={s.field}>
        <label htmlFor={`${id}-${f}`}>{label}</label>
        {f === 'message' ? (
          <textarea
            id={`${id}-${f}`}
            name={f}
            rows={4}
            value={values[f]}
            onChange={set(f)}
            onBlur={blur(f)}
            aria-invalid={!!err}
            aria-describedby={err ? `${id}-${f}-err` : undefined}
            required
          />
        ) : (
          <input
            id={`${id}-${f}`}
            name={f}
            type={type}
            autoComplete={auto}
            value={values[f]}
            onChange={set(f)}
            onBlur={blur(f)}
            aria-invalid={!!err}
            aria-describedby={err ? `${id}-${f}-err` : undefined}
            required
          />
        )}
        <p id={`${id}-${f}-err`} className={s.error} aria-live="polite">
          {err}
        </p>
      </div>
    )
  }

  return (
    <section ref={root} id="contact" className={s.contact} aria-labelledby="contact-title">
      <Orbs orbs={[{ x: '80%', y: '30%', size: '46vmax', tone: 'maroon' }, { x: '10%', y: '80%', size: '36vmax', tone: 'silver' }]} />
      <div className={`container ${s.inner}`}>
        <div className={s.copy}>
          <h2 id="contact-title" data-headline className={s.title}>
            Ready to run your <span className="metal">next event?</span>
          </h2>
          <p className={s.body} data-fade>
            {CONTACT_COPY.body}
          </p>
          <div data-fade>
            <Button href={PORTAL_URL === '#contact' ? '#contact-form' : PORTAL_URL} size="l" icon>
              Request a demo
            </Button>
          </div>
          <dl className={s.meta} data-fade>
            <div>
              <dt>Get in touch</dt>
              <dd>
                <ContactRows />
              </dd>
            </div>
            <div>
              <dt>Follow CoMax</dt>
              <dd>
                <SocialIcons />
              </dd>
            </div>
          </dl>
        </div>

        <Glass tone="strong" radius="xl" className={s.formCard} data-fade>
          {status === 'sent' ? (
            <div className={s.success} role="status">
              <span className={s.check} aria-hidden="true" />
              <h3 ref={successRef} tabIndex={-1}>
                Thanks, {values.name.trim().split(' ')[0]}.
              </h3>
              <p>We will get back to you at {values.email.trim()} to set up your demo.</p>
              {!FORM_ENDPOINT && <p className={s.demo}>This preview does not deliver messages yet.</p>}
              <Button
                variant="glass"
                onClick={() => {
                  setValues(EMPTY)
                  setTouched({})
                  setStatus('idle')
                }}
              >
                Send another message
              </Button>
            </div>
          ) : (
            <form id="contact-form" ref={formRef} className={s.form} onSubmit={onSubmit} noValidate aria-describedby={`${id}-note`}>
              <h3 className={s.formTitle}>Request a demo</h3>
              <p id={`${id}-note`} className={s.note}>
                All fields are required.
              </p>
              <div className={s.row}>
                {input('name', 'Name', 'text', 'name')}
                {input('email', 'Email', 'email', 'email')}
              </div>
              {input('organisation', 'Organisation', 'text', 'organization')}
              {input('message', 'Tell us about your event')}
              {status === 'error' && (
                <p className={s.error} role="alert">
                  Something went wrong sending that. Please try again in a moment.
                </p>
              )}
              <Button type="submit" size="l" disabled={status === 'sending'} magnetic={false}>
                {status === 'sending' ? 'Sending' : 'Send request'}
              </Button>
            </form>
          )}
        </Glass>
      </div>
    </section>
  )
}
