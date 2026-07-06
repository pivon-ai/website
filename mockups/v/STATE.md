# Pivon build — section-by-section interview state

**Goal:** Decide the design section by section (granular, coarse-to-fine), then one
final assembly into coherent `index.html`/`style.css`/`script.js`. Spec of record:
`docs/superpowers/specs/2026-06-26-pivon-landing-design.md`.

## How each round works
- User wants MANY small decisions, not 4 finished designs. So: **coarse-to-fine.**
  - **Round 1** of a section = the ONE dominant fork (e.g. card *format/structure*).
    Hold copy/type/everything-else IDENTICAL across variants — only the forked axis varies.
  - **Refinement rounds** = small elements (hover, in→out treatment, icon vs none,
    divider style, mono density, emphasis). Tell user each round what's fixed vs varying.
- Show variants in the local chooser (4+ options). Mix-and-match via the notes box.

## Coherence rule (critical for final assembly)
- Services' chosen card format = the inherited **card language** for Work + Team.
  Later-section rounds INHERIT it; only vary section-specific bits. Don't re-fork cards.
- Pick Services format with an eye on whether **in→out** generalizes to Work
  (case studies as problem→outcome) and Team (cards form the split brain).
- Trivial sections (approach strip §2, footer §8) = 2 quick options or fold into assembly.

## Section order (hero already DECIDED: C console + A neural-field bg)
1. Services §3  ← START HERE (sets card language)
2. Work §5 (inherits cards)
3. Team §6 (inherits cards, split-brain)
4. Approach §4 (0→100 sequence)
5. Booking §7 (appointment picker)
6. Approach strip §2 + Footer §8 (quick)
7. FINAL assembly + in-browser QA

## Harness (mockups/v/)
- `tokens.css` — token contract + primitives (btn/chip/eyebrow/grad-text). All variants link it.
- `field.js` — neural-field bg engine (verbatim from heroA). No-op without #neural-canvas.
- `console.js` — NOT yet created; harvest from heroC if a section reuses the console motif.
- `preview.py` — one-shot chooser server on :7321, serves v/. POST /decide appends to
  decisions.jsonl {section,choice,note,ts}, prints, exits (exit = notifies agent round done).
  Run: `python3 mockups/v/preview.py` (background). URL: http://localhost:7321/chooser.html
- `chooser.html` — reads section.json, renders variants as scaled top-left iframe thumbnails
  (desktop/mobile toggle), notes box, Choose buttons.
- `section.json` — per-round manifest: {section,title,blurb,round,variants:[{id,file,name,blurb}]}.
- `decisions.jsonl` — append-only decision log (source of truth for assembly).

## Per-round loop
1. Write variant files + section.json for the round.
2. Start preview.py (background). Give user the URL.
3. User clicks Choose → server writes decisions.jsonl + exits → agent re-invoked.
4. Append decision to this file's log below. Next round or refinement.

## Decisions log
- Hero: Direction C (generative console) + Direction A neural-field as animated bg. (locked)
- Services R1 (card format): **Editorial list** chosen (svc4-editorial). No boxes, big display
  names, heavy rules, in/out as a typographic caption. No notes. → inherited card language for Work + Team.
- Services R2 (refinement): **Broadsheet** chosen (er2-broadsheet). Heavy 2px ink rules, NO index,
  biggest display names, two-line `in / out` mono caption (out word in gradient). No notes.
  → row/divider/in-out language inherited by Work + Team.

## Wake mechanism (IMPORTANT — don't poll)
- Launch `python3 mockups/v/preview.py` with run_in_background. It serves the round, and on the
  user's click it appends to decisions.jsonl, prints `PIVON_DECISION {json}`, and EXITS.
  The process exit triggers a task-notification = my wake. So: launch, hand user the URL, END TURN.
  On wake, read the last line of decisions.jsonl (cumulative — never rm it). No sleep/cat polling.

## Decisions log (cont.)
- Work R1 (case-study format): **Context eyebrow** chosen (wk4-eyebrow). Sector·function as a
  gradient-tick eyebrow up top + "Illustrative engagement" tag right; big title; metric as a
  `setup → result` mono caption (result in gradient). 2px ink rules. No grid. No notes.
- Team R1 (split-brain duo): **Mirrored convergence** chosen (tm2-mirror). Text mirrors inward,
  half-disc avatars meet at a central gradient seam to literally form one brain. Centered header.
  Hemisphere mono eyebrows (blue-left / violet-right). No notes.
- Approach R1 (0→100 sequence): **0→100 scale** chosen (ap3-scale). A literal gradient meter,
  `Zero` → `AI-native · yours` bookends, four graduated stops (00/01/02/100 numerals + node + title + desc).
  Mobile = vertical rail. No notes.
- Booking R1 (appointment picker): **Stepped wizard** chosen (bk2-wizard). Centered card, stepper
  `1 Date · 2 Time · 3 Details` with gradient active-underline + numbered nodes (active=ink fill),
  one step at a time, "✓ chosen-date · change" summary chip, time slots as a 4-col chip grid,
  back / Continue footer. No notes.

## 🔄🔄 REDESIGN V2 (2026-07-06 evening) — full redesign, hero concept only survivor
Direction-mock round 1 (d1/d2/d3 below) was SCRAPPED before decision: user pivoted to a full
redesign keeping only the hero console CONCEPT. Interview done in-chat. Locked brief:
**Bold AI studio · light & electric (white, huge ink type) · 2-stop gradient (pair TBD by mocks)
· massive tight grotesque · cinematic scroll (GSAP) · one page + case pages · new blocks:
engagement models, honest proof (nothing real yet — swap-ready slots), POV/insights; no FAQ
· copy rewritten bolder · final build = Astro + GSAP ScrollTrigger + Lenis.**
Anchors: Lenis-site/Koto type courage × Superlist light scroll-cinema × Basement attitude
(attitude only, not palette) × Attio finish. Chooser now = full-screen tabbed viewer (rewritten
after thumbnail feedback-loop bug: 100svh hero × scrollHeight sizing = runaway height).
- SHOWCASE (2026-07-07): `make showcase` (Makefile at repo root) serves mockups/ on :7322 and opens
  v/showcase.html — the full design history as a horizontal timeline (rounds →, editions ↓),
  28 tiles as live 1280×800 iframes scaled ×0.25 (fixed size = no scrollHeight feedback loop),
  lazy-loaded, status chips (shipped/chosen/explored/current), click opens full page in new tab.
  v1-site.html = shell serving the assembled v1 from the harness. Keep ROUNDS array in
  showcase.html up to date when new rounds are added.
- R1e (user REJECTED all of R1d; rebuild w/ only ~50% parent adherence): n1-spectrum (color as
  system — everything plotted on a thinking(cyan)→shipping(magenta) line: tinted hero thesis,
  spectrum instrument w/ markers 0.15/0.50/0.85, three tinted offering fields, cases w/ locator
  dots, founders = the two ends, gradient CTA surface; Schibsted), n2-pasteup (studio-poster
  collage: giant gradient disc + outline 'ships.', rotated stickers, manifesto highlight blocks,
  fanned offering cards, tilted receipts, disc-half founders, CTA = 100-sun w/ orbiting dashed
  ring; Archivo, violet→magenta), n3-split (structural: THINK|SHIP columns w/ one gradient seam
  down the whole page, pinned col headers, design card ON the seam w/ gradient border, cases
  alternate by leading side, founders face each other, CTA = seam widens to full gradient;
  Inter Tight, blue→magenta). Fix: n2 'ships.' was white-on-white → 3px ink stroke. QA'd.
- R1d (user: 3 more A3×C2 fusions, story REIMAGINED — only founders real; offerings = consulting ·
  design · AI solutions, all else flexible): m1-machine (page = processing line INPUT→PROCESS→OUTPUT,
  dashed pipe, 3 chambers w/ meters, output ink bands, spec plate, operator ID cards; violet→magenta),
  m2-manual (site = oversized operator's manual: cover, dotted TOC, CH.01 warning box, CH.02
  exploded-view layers, CH.03 parts list w/ '0× lock-in', FIG plates, authors, colophon;
  blue→magenta), m3-gallery (gallery of useful AI: console = Exhibit No.000 on plinth, 3 wings,
  collection w/ museum plaques + cursor spotlight, curator's notes, private-viewing CTA;
  cyan→magenta). Copy rewritten per story, illustrative labels kept. Bugfix: inline <span> cards
  needed display:block (m3 .art, m2 .cap). section.json: 3 new + parents A3/C2. QA'd.
- R1c (user: likes A + C, but sections "boring, not visually playful" → 2 upgraded versions each,
  same identity, every section gets its own mechanic): a2-playful (ghost numerals, staircase,
  zigzag tilting metrics, staggered sticker cards, marker POV, full-gradient CTA), a3-sculpted
  (poster-fitted hero, giant bleeding section words, accordion services, center-rail zigzag
  timeline, alternating ink work bands, rotated stickers, ink CTA + outline marquee), c2-blueprint
  (animated SVG schematic hero, impact×effort quadrant services, segmented gauge→100%, bar-chart
  work, YAML engagement files, severity-badge POV, IC-chip team), c3-matrix (dot-grid paper, live
  canvas plotter drawing 0→100 w/ readout, punch-card services, SMIL dot traveling route, dot-meter
  work, perforated tickets, receipt POV). section.json: 4 new first, orig A/C tabs 5-6. QA'd.
- R1b (user asked for 3 MORE: A×C merged & rethought, not recombined): ac1-redline (editorial
  statement annotated like an engineering drawing — ruler, margin rails, dimension brackets;
  violet→magenta), ac2-ledger (whole page = one ruled operating document, giant type in cells,
  TOTAL row sums to 100; blue→magenta), ac3-command (console as page grammar — every section
  = typed command → output at editorial scale, commands type on scroll; cyan→magenta).
  section.json shows AC1-3 as tabs 1-3, originals A/B/C kept as tabs 4-6. QA'd via chooser.
- v2 art-direction R1 variants (self-contained files, same new copy in all three):
  dir-a-type (Archivo, violet→magenta, editorial rows), dir-b-scene (Inter Tight, cyan→violet,
  GSAP scenes/counters/scrubbed rail), dir-c-technical (Schibsted Grotesk, blue→magenta,
  visible grid + SEC.xx bars + terminal hero). Booking = CTA section in mocks; real wizard
  returns in final build. QA'd via chooser 2026-07-06. Awaiting decision.

## 🔄 REDESIGN PASS (2026-07-06) — "modern bleeding edge" + per-section uniqueness (SCRAPPED)
User brief: overall modernize; sections currently read "all the same" — make each distinguishable.
Interview restarts, coarse-to-fine. Rounds: 1) overall direction → 2) services mechanic →
3) work mechanic → 4) polish extras (multi). Variants are LIVE full pages: shared body
`d-body.html` (extracted from root index.html) + `base-style.css`/`base-script.js` (copies of
root files) + per-direction override file. Injection via fetch; calls parent.fitAll() to refit
chooser thumbnail after async load.
- Direction R1 variants: d1-journey (0→100 light→dark page + nav counter/hairline + dark-nav flip),
  d2-kinetic (all-light; marquee strip, h2 decode, svc hover flood, rail draw, metric count-up),
  d3-console (sections as workspace panels w/ chrome+path, $ strip, fixed OS status bar w/ progress).
- QA'd all three in Chrome desktop 2026-07-06. Awaiting user decision via chooser.

## ✅✅ ASSEMBLY COMPLETE (2026-06-26)
Built `index.html` / `style.css` / `script.js` in repo root from the brief below.
All sections scoped by #id (no collisions). QA in Chrome desktop+mobile+reduced-motion:
hero console+neural field, services broadsheet, approach meter, work, team mirror,
booking wizard (real picker: past/weekends disabled, validated email, console.log stub
→ confirmation). Console clean (inline SVG favicon). Bugs found+fixed during QA:
(1) booking ISO date used toISOString() → UTC day-shift; now local isoLocal().
(2) `.stepper`/`.nav-menu` had display:grid/flex overriding the [hidden] attr → added
`[hidden]{display:none}` rules. Server for QA: `python3 -m http.server 7400`.

## ✅ ALL SECTIONS DECIDED — FINAL ASSEMBLY BRIEF
Build ONE coherent static site. No build step, no deps but Google Fonts. Files:
`index.html` (semantic sections + all copy + inline SVG brain mark),
`style.css` (token contract as :root + globals + per-section styles, delimited by section),
`script.js` (neural-field canvas + hero console + scroll reveals + nav + appointment picker; ONE reduced-motion guard).

Chosen source files to port (all in repo). Read each, lift its markup+CSS, normalize tokens:
- HERO (locked): `heroC.html` (generative console, right) floating on `heroA.html` neural-field bg
  (the engine is already extracted to `mockups/v/field.js` — reuse verbatim). Copy from spec §Hero.
- SERVICES: `mockups/v/er2-broadsheet.html` — eyebrow "What we do", h2 "Four ways we move you forward.",
  4 services, 2px ink rules, NO index, big display names, two-line `in / out` mono (out word gradient).
- WORK: `mockups/v/wk4-eyebrow.html` — eyebrow "Selected work", h2 "What good looks like.",
  sector·function gradient-tick eyebrow + "Illustrative engagement" tag, big title, `setup → result`
  caption (result gradient), 2px ink rules, disclaimer line. 4 illustrative case studies.
- TEAM: `mockups/v/tm2-mirror.html` — centered header "Two founders. Two hemispheres.", mirrored
  halves, half-disc gradient avatars meeting at a central vertical gradient seam, hemisphere mono eyebrows.
- APPROACH: `mockups/v/ap3-scale.html` — eyebrow "How we work", h2 "From zero to AI-native, on a clear
  track.", horizontal gradient meter, `Zero`/`AI-native · yours` bookends, 4 stops 00/01/02/100.
- BOOKING: `mockups/v/bk2-wizard.html` for LAYOUT; wire the REAL working picker per spec §6
  (month calendar w/ prev/next, weekends+past disabled, ~14 business days; time slots 09:00–16:30 30-min
  w/ a few taken; details form name/email(validated)/company/topic/team-size; submit → console.log({...})
  → confirmation state "You're booked — pretend-confirmed…"; comment the stub + real-endpoint spot;
  gradient selection states; ARIA on grid; keyboard-operable; reduced-motion safe).
- APPROACH STRIP §2 (quick, from spec): `0 — DISCOVER → EVALUATE → BUILD → 100 — YOURS`.
- FOOTER §8 (quick, from spec): wordmark + one-liner, nav repeat, email hello@pivon.ai (placeholder),
  socials, © 2026 Pivon, illustrative-work disclaimer.
- NAV (sticky, blur): `◧ pivon` brain glyph + wordmark · Services · Work · Team · Approach · [Book a call].
- tokens.css = the contract → becomes :root in style.css. Spec of record has all copy verbatim.
- COHERENCE: every section already shares broadsheet rules / gradient / mono eyebrows. Keep section
  vertical rhythm = --section-y. QA in Chrome at desktop+mobile before declaring done.
