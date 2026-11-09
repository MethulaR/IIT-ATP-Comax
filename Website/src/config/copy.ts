/**
 * All visible marketing copy. Edit words here, not in the components.
 * House rules: short, confident, human, no dashes, no invented numbers or names.
 */
export const HERO = {
  eyebrow: 'Events and competitions, managed',
  title: ['Run every event.', 'Score every round.', 'One platform.'],
  sub: 'CoMax takes your competition from first registration to final results, then keeps every edition on record.',
}

export const PROBLEM = {
  eyebrow: 'The problem',
  title: 'From spreadsheets to one platform',
  /** key: the words highlighted in maroon. Must appear in text exactly. */
  captions: [
    { text: 'Marks typed into separate sheets.', key: 'separate sheets' },
    { text: 'Registrations spread across forms and inboxes.', key: 'forms and inboxes' },
    { text: 'No record of who won last year.', key: 'No record' },
  ],
  end: 'Now it all lives in CoMax.',
}

export const PORTALS = {
  eyebrow: 'Four portals',
  title: 'One event. Four ways in.',
  panels: [
    {
      key: 'public',
      name: 'Public event page',
      title: 'Your event, out in the open.',
      body: 'A home for your event that anyone can visit, from the first announcement to the last result.',
      points: ['Schedule, venues and rounds', 'Categories and tracks', 'Results the moment you release them', 'Past winners from every edition'],
    },
    {
      key: 'participant',
      name: 'Participant portal',
      title: 'Everything an entrant needs.',
      body: 'For teams, students or individual entrants, plus the coordinator who looks after them at their institution.',
      points: ['Register and build a team', 'A digital ID for every session', 'Submit work for each round', 'See marks once they are released'],
    },
    {
      key: 'judge',
      name: 'Judges portal',
      title: 'Score with focus.',
      body: 'Judges see only the entries assigned to them, with your criteria and weightings built into every form.',
      points: ['Assigned entries only', 'Criteria and weightings built in', 'Conflict of interest checks', 'Submit, lock and request corrections'],
    },
    {
      key: 'organizer',
      name: 'Organizer portal',
      title: 'The whole event, at a glance.',
      body: 'Verify, allocate, run rounds, scan attendance and release results from one place.',
      points: ['Verify institutions and participants', 'Build rounds and scoring', 'Track attendance live', 'Release results, awards and certificates'],
    },
  ],
}

export const FEATURES = {
  eyebrow: 'Features',
  title: 'Everything your event needs, in the order it happens.',
  items: [
    {
      key: 'register',
      title: 'Registration and verification',
      body: 'Institutions and participants sign up, organizers verify them, and categories or tracks are allocated by preference with caps.',
      label: 'Registration screen with institutions being verified and category caps filling up',
    },
    {
      key: 'rounds',
      title: 'Any round format',
      body: 'Build rounds the way your event runs: judged presentations, design reviews, quizzes, or a built in coding round only registered teams can open, scored automatically.',
      label: 'Round builder with a coding round where test cases pass one by one',
    },
    {
      key: 'judging',
      title: 'Digital judging',
      body: 'Custom criteria and weightings, head judge weighting, conflict of interest checks and controlled mark corrections.',
      label: 'Judging form with weighted criteria, head judge weighting and a conflict of interest check',
    },
    {
      key: 'results',
      title: 'Results in seconds',
      body: 'Totals, rankings, finalists and controlled release of marks, plus awards and certificates.',
      label: 'Results table with totals counting up and finalists marked',
    },
    {
      key: 'attendance',
      title: 'QR attendance',
      body: 'Every participant gets a digital ID that is scanned at each session and round.',
      label: 'QR scanner checking participants in to a session',
    },
    {
      key: 'history',
      title: 'Teams and history',
      body: 'Member changes recorded with full history, and every past edition, winner and contact stays searchable.',
      label: 'Team history timeline and a search across past editions',
    },
  ],
}

export const SCORING = {
  eyebrow: 'Scoring you configure',
  title: 'Your rounds, your weights. CoMax does the maths.',
  body: 'An example of a scoring setup an organizer could build. Change the rounds, the points and the weights to match your event.',
  segments: [
    { round: 'Round 1', name: 'Design', points: 100 },
    { round: 'Round 2', name: 'Coding', points: 50 },
    { round: 'Round 3', name: 'Final pitch', points: 100 },
    { round: 'Extra', name: 'Workshops', points: 50 },
  ],
}

export const HOW = {
  eyebrow: 'How it works',
  title: 'From first idea to final record.',
  steps: [
    ['Create your event', 'Name it, set the dates, add categories and rounds.'],
    ['Open registration', 'Institutions and participants sign up on your public page.'],
    ['Verify and allocate categories', 'Approve accounts and place teams by preference, within caps.'],
    ['Run the rounds', 'Presentations, quizzes, design reviews or coding, each in its own window.'],
    ['Judge and score', 'Judges mark against your criteria and totals add up as they go.'],
    ['Finale', 'Finalists, schedule and attendance in one view on the big day.'],
    ['Release results and awards', 'Publish marks when you are ready, with certificates for everyone.'],
    ['Saved to history', 'Every edition, winner and contact stays on record for next year.'],
  ] as [string, string][],
}

export const TRUST = {
  eyebrow: 'Security and care',
  title: 'Built for trust.',
  body: 'Competitions run on fairness. CoMax is built so every mark, account and record can be trusted.',
  points: [
    { icon: 'verified', title: 'Verified accounts', body: 'Institutions and participants are checked by organizers before they can take part.' },
    { icon: 'roles', title: 'Role based access', body: 'Participants, coordinators, judges and organizers each see only what their role allows.' },
    { icon: 'audit', title: 'Audit log of every mark', body: 'Every mark change is recorded with who made it, when and why.' },
    { icon: 'sandbox', title: 'Sandboxed code execution', body: 'Coding round submissions run in an isolated sandbox, apart from everything else.' },
    { icon: 'privacy', title: 'Data protection built in', body: 'Designed with care for participants under 18 and around Sri Lanka’s Personal Data Protection Act.' },
  ],
}

export const PARTNER = {
  eyebrow: 'Partners',
  title: 'Trusted by organizers who run real events.',
  name: 'VisioNEX',
  role: 'Launch partner',
  about: 'A school hackathon by IIT Sri Lanka, held in Colombo, Galle and Kurunegala.',
  context: 'VisioNEX brings together schools across Sri Lanka for a multi round hackathon. CoMax was shaped around how it runs.',
  cities: ['Colombo', 'Galle', 'Kurunegala'],
  quote: '[Partner quote, awaiting approval]',
}

export const MARQUEE = ['Hackathons', 'Quiz contests', 'Design challenges', 'Coding rounds', 'Judging', 'Attendance', 'Results']

export const TEAM = {
  eyebrow: 'ATP Group 15',
  title: 'The team behind CoMax',
  members: [
    'Methula Ranaweera',
    'G. C. Rajarathna',
    'Qumair Qwamy',
    'Vadithya Odaka',
    'Pesandi Hettiarachchi',
    'Ravidu Abhimana',
  ].map((name) => ({ name, role: '[Role]' })),
}

export const CONTACT_COPY = {
  title: 'Ready to run your next event?',
  body: 'Tell us about your hackathon, quiz, design challenge or meet. We will show you how it would run on CoMax.',
}
