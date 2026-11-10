# CoMax landing page: change request 2

Branch `feature/comax-landing-v2`, one commit per item. Screenshots are in `docs/screenshots/v2` (1440×900 and 390×844), with the full page set in `docs/screenshots/v2/full`.

## 1. Nav shows the active section

- **Detection:** `src/motion/spy.ts` creates one ScrollTrigger per section, from `top center` to `bottom center`, and sets the active id in `onToggle`. It is created after all pins exist, and a pinned section is measured by its pin spacer, so the section stays active for its whole scrub. It is rebuilt when the media state changes.
- **Indicator:** one decorative glass pill (`aria-hidden`) sits behind the active link. It slides x and width over 0.45s and moves instantly in reduced motion. The active link turns `--maroon-700` and gets `aria-current="true"`. Inactive links are grey. The focus ring is separate and unchanged.
- **No link in view:** on the hero and loader there is no pill.
- **Sections without a link:** scoring, trust and the marquee have no link of their own, so they keep the link above them active: Features, How it works and Partners. Otherwise the pill would vanish and reappear between links.
- **Clicks:** the target lights at once, the spy is locked while Lenis scrolls with `offset: -navHeight`, and it unlocks in `onComplete`.
- **Mobile:** the menu highlights the same item, and a thin maroon progress line runs under the collapsed bar.
- **Checked:** `scripts/v2-spy.mjs` passes on desktop, mobile and reduced motion. It puts every section in view going down, then going back up, and checks the active link each time. A click on Team from the top recorded only `none > #team`, sampled every frame, so the pill never passes through other links.

## 2. Hero cards removed

- **Removed:** the four floating cards, their idle float, the mouse parallax, their fly-out tweens, and the unused imports and styles (`QR`, `ui.module.css` in the hero, and the `slot`, `card` and `c1` to `c4` rules).
- **Kept:** the eyebrow, headline, sub line, both buttons, the orbs and the cursor.
- **Spacing:** the headline block stays centred. The dashboard's top edge sits 56px below the buttons and peeks into the first screen (measured, never lower than 150px from the bottom).

## 3. Dashboard grows to full screen, sharp the whole way

- **Built at final size:** the dashboard is real HTML and CSS, laid out at full viewport size. Mock sizes now use a `--u` unit, about 1.22px per design px at 1440 wide, so text is about 14.6px. It starts at `scale(0.72)` under the buttons and scrubs to `scale(1)`, so it never scales above 1 and settles at native resolution. I chose scale over `clip-path`, because clipping a full-size dashboard would crop it at the start and not show a framed miniature.
- **Motion:**
  - The hero pins for `+=140%`: one screen of expansion, then a 40% hold.
  - The corner radius goes from 24px on screen to 0, and the outer ring and shadow shrink away. The browser chrome stays visible.
  - y snaps to whole pixels.
  - On arrival the stats count up (48, 12, 4, 186), the bars grow from the bottom and the leaderboard rows slide in. They reverse when scrolling back.
  - After the hold, the pin releases and the dashboard moves up into the next section.
- **Removed from the dashboard:** the Glass frame (backdrop filter), the intro opacity and scale, the paper veil fade and the old cover scale-up. Only the orbs behind it are blurred.
- **will-change: deliberately not used on the dashboard.** The brief suggested setting it while the trigger is active. Measured in Chrome, that made the layer reuse a raster from another scale: at 75% the live text scored 1634 on sharpness against 3361 for a fresh render. Without it, Chrome rasterises the text at each scale.
- **How sharpness was confirmed** (`scripts/v2-dashboard.mjs`, results in `3-dashboard-sharpness.txt`):
  - At 0, 25, 50, 75 and 100% of the scrub, it screenshots a crop around the dashboard title and stats.
  - It then forces a fresh raster of the same frame (will-change removed, layer rebuilt) and screenshots again.
  - The two are pixel-identical at every position (mean and max difference 0).
  - The transforms land on whole pixels (y 718, 628, 359, 90, 0).
  - The `-zoom` images are 3× nearest-neighbour enlargements of those crops for visual checking.
- **Mobile:** no pin. The stacked layout (stats 2 × 2, chart, leaderboard) shows at full width at real size (13px text), and the count-up and bars play when it scrolls into view.
- **Reduced motion:** the dashboard is shown at full size in the page straight away.

## 4. Problem section: shorter, clearer captions

- **Length:** the pin is `+=150%`, down from 240%. Logged: start 2160px, end 3510px, distance 1350px, which is 1.5 screens at 900px.
- **Snap:** snaps to `[0, 0.33, 0.66, 1]` (0.4s, power2.out), one readable state per caption plus the assembled board. It uses `inertia: false`, so a fast flick cannot skip a caption.
- **Captions:**
  - One caption at a time on a frosted `<Glass>` backing at 0.8 fill, centred under the headline.
  - Sized from about 28px to 48px (44px at 1440), `--ink`, weight 600.
  - Key words are in maroon: "separate sheets", "forms and inboxes", "No record".
  - The outgoing line rises and fades, then the incoming line rises from a mask, with no overlap.
  - A step indicator shows three dots plus "1 of 3", with the current dot in maroon.
- **Safe zone:**
  - Cards now scatter sideways and down only.
  - Each card's start y is pushed below the measured headline and caption block, plus room for its tilt.
  - Cards sit behind the caption layer and dim to 0.85 while a caption shows.
  - The registration form no longer starts on the headline.
- **Mobile and reduced motion:** no pin. Three caption blocks, each with one small illustration (the marks sheet, the registration form and the duplicate tabs), then "Now it all lives in CoMax." and the assembled board.
- **Checked:** `scripts/v2-problem.mjs`, results in `4-problem-checks.txt`.
  - At each of the four beats, no card overlaps the headline or caption box.
  - Contrast is 16.4:1 for the ink and 11.3:1 for the maroon highlight, measured on the rendered backing.
  - The step label matches the caption.
  - Snap settles on a beat from 0.2, 0.45 and 0.8. It snaps in the direction of the last scroll.

## Whole page

- `npm run check`: 29 of 29 pass on the production build. That covers no horizontal scroll and no console errors at six widths, the loader, keyboard, accessibility, reduced motion and the form.
- No console errors in any of the v2 scripts.

### Lighthouse (12.2.1, production build, reports in `docs/lighthouse/v2`)

| Page | Performance | Accessibility | Best Practices | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| Home, mobile | 78 to 82 | 100 | 100 | 100 | 2.6 to 2.9 s | 0.004 |
| Home, desktop | 91 | 100 | 100 | 100 | 0.5 s | 0 |
| Privacy, mobile | 98 | 100 | 100 | 100 | 2.3 s | 0 |
| Privacy, desktop | 100 | 100 | 100 | 100 | 0.5 s | 0 |

**Home performance is below the 93 and 100 recorded on 5 November, but this branch did not cause the drop.** I rebuilt the previous commit (`e982347`) and ran it against this branch, alternating runs on the same machine at the same time:

| Build | Mobile performance | Mobile TBT | Desktop performance | Desktop TBT |
| --- | --- | --- | --- | --- |
| Before (`e982347`) | 82, 82 | 570, 600 ms | 92, 92 | 240, 240 ms |
| This branch | 82, 82 | 600, 580 ms | 91, 91 | 250, 240 ms |

The scores match within run-to-run noise. The machine is currently slower than it was on 5 November: the hydration task is the same in both builds and takes longer now. Accessibility, Best Practices and SEO stay at 100 on every page.
