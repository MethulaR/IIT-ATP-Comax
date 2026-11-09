# CoMax landing page: change request 3

Branch `feature/comax-landing-v3`, one commit per item. Screenshots (1440×900 and 390×844) are in `docs/screenshots/v3`.

## 5. Features: mockup pinned, only the text scrolls

- The section pins for 360% (60% of the viewport per feature) and snaps gently to each feature.
- The heading and the device stay still. A scrubbed `y` moves only the text column, through a masked viewport.
- The feature nearest the centre is fully opaque with its maroon side line, and the others sit at 0.35.
- The screen crossfades in 0.4s and the dots follow. The frame never moves.
- Mobile and reduced motion: no pin, each feature's text followed by its screen.
- **Checked** (`scripts/v3-features.mjs`):
  - With features 1, 3 and 6 active, the device stayed at 100, 352 (637 × 406) in all three shots.
  - The text column top moved from 396 to −288 to −1314.
  - The active block, screen and dot matched each time.

## 6. Scoring section removed

- Deleted the section (ring chart, 300 counter, rounds list), its ScrollTrigger, styles and `SCORING` data.
- The scroll spy entry for the section went too. It never had a nav link of its own.
- Features now flows straight into How it works: 0px gap at both widths (`6-features-to-how-*`).
- **Mark breakdown search:** none remain in the page copy. Three remained in the feature mocks, and these are now removed:
  - the judging criteria percentages
  - the head judge multiplier (1.5x)
  - "50 / 50" on the coding round, which now reads "all tests passed"
- "Custom criteria and weightings" stays.

## 7. Partners: placeholders removed

- The quote placeholder and the four future partner slots are gone, along with their animation and data.
- The VisioNEX card is kept with its context line, cities and organiser. It is centred and a little narrower, so it reads as complete on its own.

## 8. Platform section replaces the full screen dashboard

- **Hero:** no longer pins or expands anything. It is the copy, the buttons and the orbs, centred on the first screen.
- **New section** `#platform`:
  - eyebrow "THE PLATFORM"
  - word reveal headline "Your whole event, on one screen."
  - the sub line
  - the existing organizer dashboard markup in a glass card styled like the portal panels, laid out at real size (about 14px text at 1440)
  - three check points under the card
- **Motion:**
  - The card rises and settles from scale 0.96 to 1, scrubbed over its entrance. There is no pin.
  - Once the card is in view, the stats count up, the bars grow and the rows stagger in.
  - Until then the prerendered final numbers stay, so 0 never shows at rest.
- **Nav:** the Product link now points to `#platform` and covers both the platform and problem sections.
- **Mobile:** a full width card with the stacked dashboard (stats 2 × 2, chart, leaderboard).
- **Checked** (`scripts/v3-platform.mjs`, desktop, mobile and reduced motion):
  - Shots before the card enters, mid entrance and at rest.
  - Stats at rest read 48, 12, 4, 186, and again after scrolling away and back.
  - With the nav showing, its bottom is at 78px and the card top at 120px, so they don't overlap.

## Team

- Ravidu Abhimana is removed.
- Roles are set:
  - G. C. Rajarathna: ML and AI
  - Methula Ranaweera: Backend
  - Qumair Qwamy: DevOps
  - Pesandi Hettiarachchi: Frontend, ML and AI
  - Vadithya Odaka: Frontend and backend

## Whole page

- `npm run check`: all pass on the production build. That covers no horizontal scroll and no console errors at six widths, the loader, keyboard, accessibility, reduced motion and the form.
- The nav scroll spy (`scripts/v2-spy.mjs`, updated for the new sections) passes going down and back up, on link click, and in reduced motion.

## Cursor

The dot and lagging ring are replaced by a maroon diamond marker that leans into its direction of travel and stretches with speed, with a tapered maroon ink trail that dries up at rest. Over links it opens into a square target frame, and a click throws four small sparks. Desktop fine pointers only; off on touch and in reduced motion. Screenshots: `cursor-moving`, `cursor-link`, `cursor-click`.
