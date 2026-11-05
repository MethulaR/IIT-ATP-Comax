import { Footer } from '../components/Footer'
import { Reveal } from '../components/Reveal'
import s from './Page.module.css'

export default function Privacy() {
  return (
    <>
      <article className={`container ${s.page}`} aria-labelledby="privacy-title">
        <p className="eyebrow">Legal</p>
        <Reveal as="h1" id="privacy-title" variant="words" className={s.title}>
          Privacy policy
        </Reveal>
        <p className={s.lead}>
          This policy explains what this website collects and why. It covers the CoMax marketing site only. The CoMax platform has its own
          policy for event data. <strong>[Draft, to be reviewed before launch]</strong>
        </p>
        <div className={s.prose}>
          <h2>Who we are</h2>
          <p>CoMax is built by ATP Group 15 at IIT, Sri Lanka. You can reach us at [contact email].</p>
          <h2>What we collect</h2>
          <p>
            When you use the contact form we collect your name, email address, organisation and your message. We use them only to reply to
            you and arrange a demo. We do not sell or share them.
          </p>
          <p>
            This site stores one small value in your browser session so the intro animation only plays in full once. It does not use
            advertising or tracking cookies.
          </p>
          <h2>How long we keep it</h2>
          <p>We keep contact form messages for up to 12 months, then delete them unless we are still talking with you.</p>
          <h2>Children and young people</h2>
          <p>
            CoMax is used for school competitions, so some participants are under 18. This website is meant for organizers. Event data about
            participants is handled inside the platform under its own safeguards.
          </p>
          <h2>Your rights</h2>
          <p>
            Under Sri Lanka&rsquo;s Personal Data Protection Act No. 9 of 2022 you can ask to see, correct or delete the personal data we
            hold about you, and withdraw consent at any time. Contact us at [contact email] and we will respond within a reasonable time.
          </p>
          <h2>Changes</h2>
          <p>If this policy changes we will update this page and the date below.</p>
          <p className={s.updated}>Last updated: [date]</p>
        </div>
      </article>
      <Footer />
    </>
  )
}
