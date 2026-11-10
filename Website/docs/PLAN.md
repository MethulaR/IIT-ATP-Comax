# CoMax landing page: build plan

## Stack (pinned in package.json)

vite 8.3.6, react and react-dom 19.3.1, react-router-dom 7.18.5, gsap 3.15.1 (ScrollTrigger, SplitText), lenis 1.3.27, @fontsource-variable/inter-tight 5.3.0, @fontsource-variable/inter 5.3.0, typescript 7.0.2. Dev tools: @vitejs/plugin-react 6.2.1, @playwright/test 1.64.1 (driving the local Chrome), sharp 0.35.5 (icons, OG image, screenshot conversion).

## Typography

**Inter Tight** for display. It is a grotesk drawn for tight tracking at large sizes, so 120px headlines stay dense without letters colliding. It is variable from 100 to 900, which lets the metal headlines use 600 and the labels 650 from one file, and it has true tabular figures for the loader counter, scores and ranks. **Inter** for body at 17 to 18px with 1.6 line height. They are one family, so the page needs two self-hosted variable files and nothing else. Metric-adjusted Arial fallbacks keep CLS near zero.

## Headline

"Run every event. Score every round. One platform." with **One platform.** in maroon metal.

Alternatives:

1. "Every round, every score, every edition. One platform."
2. "From first sign up to final result. One platform."

## Loader exit: the lens

Glass shutters are a common exit. The lens grows out of the mark itself, so it is the stronger choice:

1. The C of the monogram becomes a silver rim.
2. A radial mask opens from inside the C and the rim scales with it, so the hero is revealed through a growing lens.
3. The hero headline starts its SplitText reveal 50 ms into the exit, so the intro and the hero play as one shot.

The hero is prerendered underneath from the first frame, so LCP is not held back by the loader.

## Sections and motion

| Section | Motion idea (what it explains) |
| --- | --- |
| Loader | Silver stroke draws the mark, liquid maroon metal rises inside with a rolling wave, a glint crosses, the counter follows real loading, then the lens exit. |
| Nav | Liquid glass pill with refraction. Hides on scroll down, returns on scroll up, firmer glass after the hero. |
| Hero | Word reveal mid lens. Idle float plus mouse parallax by depth. Scrubbed exit: the headline blurs away, the portal cards fly outward, and the dashboard scales to fill the screen and becomes the next section. |
| Problem | Pinned scrub. Spreadsheet cells, red rows, a form, a chat, a pasted leaderboard and duplicate tabs fly in tilted, straighten, turn into clean CoMax widgets and snap into one glass board. Three captions swap, then "Now it all lives in CoMax." |
| Portals | Pinned horizontal track of four glass panels. A metal progress bar and counter, mocks drifting against their panels, and a tilt driven by Lenis velocity. |
| Features | Sticky glass device on the left, six blocks on the right. Screens crossfade with a blur as each block crosses the centre, and each screen runs its own loop: verification flip, tests ticking green, a judge slider, totals counting up, a QR scan line, search typing. |
| Scoring | Removed in change request 3. How marking works is up to each organizer. |
| How it works | A vertical SVG line draws with the scroll and a glowing tip rides it. Nodes turn maroon as the tip reaches them, and titles alternate between wipe and word reveals. |
| Trust | Full-bleed maroon. A beam of light travels down the section and cards light up as it passes. Silver metal chars headline, metal icons with an SVG sheen. |
| Partner | Calm. The card settles in, a light band sweeps across the VisioNEX logo placeholder, and the reserved slots fade up. |
| Marquee | Two rows in outline and metal, opposite directions. Skew and speed follow scroll velocity and settle to zero. |
| Team | Staggered rise with a slight rotateX, and a pointer tilt on hover. |
| Contact | Character reveal on the closing headline. Glass form with inline validation and a focused success state. |
| Footer | Outlined CoMax wordmark that fills with maroon metal as it scrolls in. |

## Testing

- Playwright screenshots at 1440×900 and 390×844 at several scroll positions per section. I reviewed them after each section and fixed issues before committing.
- `scripts/check.mjs` covers:
  - horizontal overflow and console errors at six widths
  - loader timing and the repeat visit
  - refraction
  - keyboard path
  - landmarks, headings and alt text
  - route change cleanup
  - reduced motion
  - form states
- Lighthouse on the production preview, mobile and desktop.
