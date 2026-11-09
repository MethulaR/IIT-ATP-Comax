import { ScrollTrigger } from './gsap'
import { NAV_LINKS } from '../config/site'

/**
 * Scroll spy for the nav. One ScrollTrigger per section, from "top center" to "bottom center".
 * A pinned section is measured by its pin spacer, so it stays active for its whole scrub.
 */
type Listener = (id: string | null) => void

let active: string | null = null
let locked = false
const listeners = new Set<Listener>()
let triggers: Array<{ st: ScrollTrigger; id: string }> = []

const emit = (id: string | null) => {
  if (id === active) return
  active = id
  listeners.forEach((l) => l(id))
}
const inView = () => triggers.find((t) => t.st.isActive)?.id ?? null

export const spy = {
  get: () => active,
  subscribe(fn: Listener) {
    listeners.add(fn)
    return () => {
      listeners.delete(fn)
    }
  },
  /** A nav click: show the target now and ignore the sections passed on the way. */
  lock(id: string) {
    locked = true
    emit(id)
  },
  unlock() {
    locked = false
    emit(inView())
  },
}

/** The section's box in the page: its pin spacer when pinned. */
const box = (id: string) => {
  const el = document.getElementById(id)
  if (!el) return null
  const parent = el.parentElement
  return parent?.classList.contains('pin-spacer') ? parent : el
}

export function createSpy() {
  killSpy()
  NAV_LINKS.forEach((link) => {
    const id = link.hash.slice(1)
    link.sections.forEach((section) => {
      const el = box(section)
      if (!el) return
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom center',
        onToggle(self) {
          if (locked) return
          if (self.isActive) emit(id)
          else if (active === id) emit(inView())
        },
      })
      triggers.push({ st, id })
    })
  })
  if (!locked) emit(inView())
}

export function killSpy() {
  triggers.forEach((t) => t.st.kill())
  triggers = []
  locked = false
  emit(null)
}
