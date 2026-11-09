# CoMax landing page

Marketing site for **CoMax**, a platform for running events and competitions: hackathons, school and university competitions, quiz contests, coding and design challenges, sports meets. CW1 landing page deliverable for module 5COSC021C, ATP Group 15.

Vite, React 19, TypeScript, GSAP 3 (ScrollTrigger, SplitText), Lenis, plain CSS Modules, self-hosted Inter Tight and Inter.

## Run it

```bash
npm install
npm run dev        # http://127.0.0.1:5173
```

Node 20 or newer.

## Build

```bash
npm run build      # typecheck, client build, SSR build, prerender
npm run preview    # serves dist/ on http://127.0.0.1:4173
```

`npm run build` writes a static site to `dist/`:

- `index.html`, `privacy.html` and `404.html` are **prerendered**, so the hero, loader and copy paint before any JavaScript runs. The app then hydrates.
- The entry CSS is inlined and the two Latin font files are preloaded.
- `robots.txt` and `sitemap.xml` are generated from `VITE_SITE_URL`.

## Deploy

It is a plain static site. Any of these work with no server code:

| Host | Settings |
| --- | --- |
| **Vercel** | Framework: Vite. Build `npm run build`, output `dist`. `vercel.json` sets clean URLs and cache headers. |
| **Netlify** | Build `npm run build`, publish `dist`. `public/_headers` sets the headers. `/privacy` serves `privacy.html` and unknown paths get `404.html`. |
| **Cloudflare Pages** | Build `npm run build`, output `dist`. `_headers` and `404.html` are picked up automatically. |

For the custom domain (`.com` or `.lk`), add it in the host's dashboard and point DNS at the host (a CNAME for `www`, plus the A or ALIAS record the host gives you for the apex). All three issue HTTPS certificates automatically. Then set `VITE_SITE_URL` to the final origin and redeploy, so the canonical, Open Graph and sitemap URLs match.

## Configuration

Set these in `.env` (committed defaults), `.env.local` (your machine) or the host's environment settings:

| Variable | What it does | Default |
| --- | --- | --- |
| `VITE_PORTAL_URL` | Where every **Request a demo** button points. Change it to the live CoMax portal later. | `#contact` |
| `VITE_SITE_URL` | Canonical origin for canonical, Open Graph, robots and sitemap. | `https://comax.lk` |
| `VITE_FORM_ENDPOINT` | URL that receives the contact form as JSON (Formspree, Basin, your API). **Leave it empty and the form runs in preview mode: it validates and shows success, but sends nothing.** Set it before launch. | empty |

## Where to change things

| What | Where |
| --- | --- |
| All section copy | `src/config/copy.ts` |
| Nav links, contact email, social links | `src/config/site.ts` |
| Colours, type scale, spacing, glass and metal tokens | `src/styles/tokens.css` |
| Shared eases, durations, breakpoints, pin lengths | `src/motion/motion.ts` |
| Product mock screens | `src/mocks/` |
| Privacy policy text | `src/pages/Privacy.tsx` |
| Favicons and OG image | `npm run icons` (`scripts/make-icons.mjs`) |

### Placeholders still to replace

- `[contact email]` and the social links: `CONTACT` in `src/config/site.ts`
- The privacy policy marks itself `[Draft, to be reviewed before launch]` and has a `[date]`

## How it is built

```
src/
  config/      copy.ts (all words), site.ts (URLs, nav, contact)
  styles/      tokens.css, base.css, metal.css
  motion/      gsap.ts (plugins, registered once), motion.ts (eases, durations, media queries),
               scroll.ts (Lenis on the GSAP ticker, shared velocity), spy.ts (nav scroll spy),
               useGsap.ts, reveals.ts, intro.ts
  components/  Glass, Button (magnetic, sheen), Monogram, Nav, Footer, Orbs, Fit, Reveal
  mocks/       coded product screens with generic event data
  sections/    Loader, Hero, Problem, Portals, Features, HowItWorks, Trust, Partner, Marquee, Team, Contact
  pages/       Home, BelowFold (one code split chunk), Privacy, NotFound
  entry-server.tsx   used only by the build to prerender
scripts/       prerender, icons, screenshots, checks, recording
```

**Motion system.** Every section calls `useGsap(ref, setup)`. It runs inside `gsap.matchMedia` scoped to the section, so tweens, ScrollTriggers and SplitTexts are reverted on unmount or when the media state changes. Setups branch on `reduce`, `desktop` and `finePointer`:

- **Desktop:** pinned, scrubbed sequences.
- **Compact screens:** stacked versions.
- **Reduced motion:** content only fades in. No smooth scroll, pinning, parallax or scrub.

Lenis runs on the GSAP ticker and calls `ScrollTrigger.update` on every scroll, so they share one frame loop. Its velocity drives the marquee skew and the portal tilt.

**Liquid glass.** `<Glass>` gives blur, saturation, a translucent fill, a 1px metal rim, a maroon bottom edge and a pointer-following highlight. In Chromium it adds an SVG `feTurbulence` + `feDisplacementMap` filter through `backdrop-filter: url(#liquid-glass)`. This is feature-detected in `LiquidFilter.tsx`, and Safari and Firefox keep plain blur.

## Testing

Start `npm run preview` (or `npm run dev`), then:

```bash
npm run check                       # definition of done checks (widths, console, loader, keyboard, a11y, reduced motion, form)
npm run shots -- http://127.0.0.1:4173 --out=docs/screenshots
node scripts/to-webp.mjs            # shrink the screenshots
node scripts/record.mjs             # animated WebP of a full scroll
node scripts/v2-spy.mjs             # nav scroll spy: every section down and up, plus a link click
node scripts/v2-dashboard.mjs       # hero dashboard: scrub screenshots and the sharpness test
node scripts/v2-problem.mjs         # problem section: beats, overlaps, contrast, scroll length, snap
node scripts/v3-features.mjs        # features: pinned device, only the text moves
node scripts/v3-platform.mjs        # platform section: entrance, real numbers at rest, nav clearance
```

All scripts drive the locally installed Google Chrome through Playwright.

### Results (production build, 5 November 2026)

Lighthouse 12. Reports are in `docs/lighthouse/`.

| Page | Performance | Accessibility | Best Practices | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| Home, mobile | 93 | 100 | 100 | 100 | 2.6 s simulated, 0.12 s observed | 0.004 |
| Home, desktop | 100 | 100 | 100 | 100 | 0.5 s | 0 |
| Privacy, mobile | 98 | 100 | 100 | 100 | 2.3 s | 0 |
| Privacy, desktop | 100 | 100 | 100 | 100 | 0.5 s | 0 |

**Home on mobile, LCP.** The headline is in the prerendered HTML and paints in the first frame (observed LCP about 120 ms). Lighthouse's simulated slow 4G estimate is 2.6 s, just over the 2.5 s target. It counts the preloaded fonts and the app bundle, which download alongside the first paint. Dropping the font preloads made it worse (FCP 2.3 s).

`npm run check` passes every item:

- no horizontal scroll and no console errors at 360, 390, 768, 1024, 1440 and 1920 px
- the loader follows real progress, finishes within 3.2 s of navigation, and is quick on repeat visits
- refraction is active in Chrome
- Escape skips the loader, and the skip links work
- the keyboard reaches every region
- images have alt text and headings are in order
- pins are removed on route change
- in reduced motion nothing is pinned and all text is visible
- form validation works, and the success state is announced and focused

## Change requests

What changed and how each item was checked: [`docs/CHANGES-v2.md`](docs/CHANGES-v2.md) and [`docs/CHANGES-v3.md`](docs/CHANGES-v3.md). Screenshots are in `docs/screenshots/v2` and `v3`.

## Notes

- **Mock screens are coded, not images.** The wireframe images and `VisioNEX_Website_Context.md` were not in the repo when this was built. The mocks in `src/mocks/` follow the feature list in the brief, use generic data ("Spring Hackathon 2027") and brand colours, and stay sharp at every size. To use the wireframes instead, drop AVIF or WebP files into `src/assets/` and render them inside `<Fit>`.
- **Phase 2 WebGL hero object is not built.** The hero uses the CSS orb fallback. The structure leaves room for a lazy React Three Fiber canvas behind the hero copy.
- **The screen recording is an animated WebP** (`docs/screenshots/scroll-desktop.webp`), because Playwright's video capture needs an extra ffmpeg download. Run `npx playwright install ffmpeg` if you want WebM.
