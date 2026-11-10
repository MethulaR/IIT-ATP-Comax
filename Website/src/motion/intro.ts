/** The loader announces when its exit starts so the hero can begin its reveal mid exit. */
type Listener = () => void
let started = false
const listeners = new Set<Listener>()

export function signalIntro() {
  if (started) return
  started = true
  listeners.forEach((l) => l())
  listeners.clear()
}

export function onIntro(fn: Listener) {
  if (started) {
    fn()
    return () => {}
  }
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export const introStarted = () => started
