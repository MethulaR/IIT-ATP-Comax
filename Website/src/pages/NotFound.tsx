import { Footer } from '../components/Footer'
import { Button } from '../components/Button'
import s from './Page.module.css'

export default function NotFound() {
  return (
    <>
      <section className={`container ${s.page} ${s.notFound}`} aria-labelledby="nf-title">
        <p className={s.code} aria-hidden="true">
          <span className="metal">404</span>
        </p>
        <h1 id="nf-title" className={s.nfTitle}>
          This page is not on the schedule.
        </h1>
        <p className={s.lead}>The link may be old, or the page has moved. Everything else is still running.</p>
        <Button href="/" size="l" icon>
          Back to the homepage
        </Button>
      </section>
      <Footer />
    </>
  )
}
