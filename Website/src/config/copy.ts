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
  captions: ['Marks typed into separate sheets.', 'Registrations spread across forms and inboxes.', 'No record of who won last year.'],
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
