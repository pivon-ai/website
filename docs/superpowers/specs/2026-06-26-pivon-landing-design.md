# Pivon — Landing Page Design Spec & Build Contract

**Date:** 2026-06-26 · **Status:** approved direction, building
**Stack:** vanilla HTML/CSS/JS, no framework, no build step, portable static.

---

## 1. Subject & the page's one job

**Pivon** — an AI & generative-AI consulting agency. Logo = a brain split into a
blue/cyan **left hemisphere of circuit / data-flow traces** (data, logic, systems)
and a violet/magenta **right hemisphere of organic folds** (creativity). Pivon
*is* the bridge between the two: technical AI capability → creative business
outcomes.

**One job of the page:** get a company (whether new to AI or already scaling) to
trust Pivon to take them **0 → 100 on AI**, and **book a discovery call**.

## 2. Decisions (from the interview)

- **Audience:** broad — non-tech companies new to AI *and* technical teams scaling. Copy accessible but credible to engineers.
- **Case studies:** **illustrative**, clearly labelled "Illustrative engagement" (Pivon is new; no real clients to name yet).
- **Team:** **small real team** — use realistic role cards with `[Name]` placeholders + a swap note; founder swaps real names/photos later.
- **Personality:** **bold + creative AND premium + technical.** White mode. Avoid generic SaaS-gradient-wash.
- **Lead capture:** a **self-built appointment picker** (custom calendar + time slots + details). **Mock backend = `console.log` only** for now (clearly stubbed for a real endpoint).
- **Deployment:** portable static (deploy anywhere).
- **Brand:** palette + brain/data-flow concept taken from the supplied logo (`PHOTO-2026-05-06-22-05-04.jpg`). Accent = the brand's neural gradient.

## 3. Design system — TOKEN CONTRACT (every section uses these verbatim)

```css
:root{
  /* surfaces */
  --paper:#FFFFFF; --paper-2:#F6F8FB; --paper-3:#EEF2F8;
  /* ink */
  --ink:#16202E; --slate:#5A6B7E; --mist:#8A98A8; --line:#E6EAF0; --line-2:#D7DEE8;
  /* neural gradient (THE accent — left-brain blue → right-brain magenta) */
  --cyan:#22C7F2; --blue:#2F6BEC; --violet:#7A3CEE; --magenta:#E5258E; --pink:#F62C7B;
  --grad:linear-gradient(100deg,#22C7F2,#2F6BEC,#7A3CEE,#E5258E);
  --grad-soft:linear-gradient(100deg,rgba(34,199,242,.14),rgba(122,60,238,.14),rgba(229,37,142,.14));
  /* type */
  --f-display:'Space Grotesk',system-ui,sans-serif;
  --f-body:'Inter',system-ui,sans-serif;
  --f-mono:'JetBrains Mono',ui-monospace,monospace;
  /* radius */
  --r-sm:10px; --r:14px; --r-lg:22px; --r-pill:999px;
  /* shadow */
  --shadow-card:0 30px 60px -40px rgba(22,32,46,.40);
  --shadow-pop:0 16px 40px -18px rgba(22,32,46,.45);
  /* motion */
  --t-fast:160ms; --t:240ms; --t-slow:600ms;
  --ease:cubic-bezier(.22,.61,.36,1); --ease-emph:cubic-bezier(.65,.05,.36,1);
  /* layout */
  --container:1200px; --gutter:clamp(20px,5vw,48px);
  --section-y:clamp(76px,10vw,140px);
}
```

**Fonts (Google Fonts link, all pages):**
`Space Grotesk` 500/700 (display), `Inter` 400/500/600 (body), `JetBrains Mono` 400/500 (labels/data).

**Type scale:** h1 `clamp(2.5rem,6.2vw,5.25rem)`/lh1.02/ls-.02em · h2 `clamp(1.9rem,4vw,3rem)`/lh1.05/ls-.02em · h3 `clamp(1.2rem,2vw,1.55rem)` · body 1.0625rem/lh1.6 · eyebrow = mono .8rem uppercase ls.18em var(--slate) · "data" labels = mono .72–.8rem ls.06em var(--mist).

**Gradient discipline:** mostly white + ink. Gradient appears ONLY in: the brain mark, key words ("0 to 100"), the neural-field background, the console caret/active states, hover/active accents, section-index numerals, and the booking selection. Never as a full background wash.

**Shared primitives (in `style.css`, used by all sections):**
- `.container{max-width:var(--container);margin-inline:auto;padding-inline:var(--gutter)}`
- `.section{padding-block:var(--section-y)}`
- `.eyebrow` (mono eyebrow with a short gradient tick before it)
- `.btn` base; `.btn-primary` (solid var(--ink), white text, gradient sheen on hover); `.btn-ghost` (1px var(--line) border, ink text)
- `.card` (bg var(--paper), 1px var(--line), radius var(--r), hover lifts + gradient hairline)
- `.chip`/`.tag` (mono, pill, var(--paper-2))
- `.grad-text` util (background:var(--grad);background-clip:text;color:transparent)
- `.reveal` (opacity/translateY → animated in by IntersectionObserver; reduced-motion = visible immediately)

## 4. Signature — "Generative Console (C) on a Neural Field (A)"

The chosen hero is **Direction C** (the prompt console that *generates* output)
floating on **Direction A's living neural-field/data-graph** as an ambient
background. Two motifs, carried through the page:

1. **Generate / input→output** (from C): the structural device. The hero console
   types `pivon> …` and streams a generated headline + service chips. Reused as a
   structural metaphor: services & case studies framed as *prompt → result*
   (problem in → what Pivon ships out).
2. **Neural field / data-graph** (from A): the ambient atmosphere. A subtle,
   full-bleed animated canvas — drifting nodes + connecting edges on the left
   reading as **blue circuit/data**, on the right as **violet/magenta organic
   flow**, low-opacity behind content. Cursor-reactive in the hero; calmer/again
   subtler in later sections. **Must stay behind text at low contrast; never hurt
   legibility. Honors `prefers-reduced-motion` (renders one static frame).**

**LCP/a11y rule:** the hero H1 is plain styled HTML, painted immediately. The
console *enhances* on top; its final generated text also exists in the HTML so
no-JS / reduced-motion users see a finished state.

## 5. Page structure + copy

**Nav (sticky, blur):** `◧ pivon` (brain glyph + wordmark) · Services · Work · Team · Approach · **[Book a call]**. Mobile: slide-down menu.

**1 · Hero** — eyebrow `AI & GENERATIVE-AI CONSULTING`; H1 **Take your company from `0 to 100` on AI.** (gradient on "0 to 100"); subhead *"Pivon finds the use cases worth chasing, builds the solutions that ship, and leaves your team running AI like they always did it — whether you're just starting or already scaling."*; primary **Book a discovery call →**, secondary **See how we work ↓**. Right: generative console (sample prompts: "we're starting from zero" / "find our best use cases" / "build us a support agent"). Background: neural field.

**2 · Approach-at-a-glance strip** — thin mono band: `0 — DISCOVER → EVALUATE → BUILD → 100 — YOURS`. Doubles as teaser + anchor to Approach.

**3 · Services — "What we do"** — eyebrow `WHAT WE DO`, h2 *"Four ways we move you forward."* 4 cards (input→output framing):
- **AI Consulting** — *Strategy, roadmaps, and honest answers about where AI pays off.* (in: "where do we even start?" → out: a costed roadmap)
- **Use-Case Evaluation** — *We rank opportunities by impact and effort, and hand you a costed shortlist.* (in: 30 ideas → out: the 5 worth doing)
- **Solution Building** — *Design, build, and ship the AI solution, wired into your stack.* (in: a shortlisted use case → out: a deployed tool)
- **0→100 AI Boost** — *Not using AI yet? We stand it up, train your team, and hand over the keys.* (in: zero AI → out: an AI-native team)

**4 · Approach — "0 → 100"** — eyebrow `HOW WE WORK`, h2 *"From zero to AI-native, on a clear track."* Real ordered sequence (numbering justified): **00 Discover** (we learn your business, data, and constraints) → **01 Evaluate** (rank + cost the use cases) → **02 Build** (design, build, ship) → **100 Handover** (train your team; we leave, it stays). The neural-field/data line threads the four steps.

**5 · Work — case study previews** — eyebrow `SELECTED WORK`, h2 *"What good looks like."* Each card tagged **Illustrative engagement**:
- **Support that answers itself** — *Logistics SMB · Customer Ops* — a gen-AI support agent deflected **60% of tickets in 6 weeks**.
- **From spreadsheets to forecasts** — *Regional retailer · Operations* — demand-forecasting models cut **stockouts 30%**.
- **A studio that never sleeps** — *Marketing agency · Creative* — a generative content pipeline **5×'d output** at constant headcount.
- **Zero to AI-native in 90 days** — *Manufacturer · 0→100* — 4 tools live, team self-sufficient, **no vendor lock-in**.
Small honest disclaimer near section: *"Illustrative scenarios that reflect the kind of work and outcomes Pivon delivers."*

**6 · Team — "Two founders. Two hemispheres."** — eyebrow `THE TEAM`, h2 *"Two founders. Two hemispheres."* TWO founder cards that literally form the split brain — Alex's card tinted blue/left, Andreas's violet-magenta/right, meeting at a gradient seam:
- **Alex — Senior Software Engineer & Solutions Architect** — LEFT hemisphere (blue/cyan · circuits, data, build). *Designs and ships the architecture, models, and integrations that make AI actually run in your stack.*
- **Andreas — Lead, Business Enablement & Innovation (AI)** — RIGHT hemisphere (violet/magenta · creative, business). *Deep business understanding — finds where AI creates value and makes it land with real teams and customers.*
(Bios are first-draft; founders confirm/edit. Photos optional — fallback = gradient brain-half avatar.)

**7 · Booking — "Book a discovery call"** — the appointment picker (§6). eyebrow `LET'S TALK`, h2 *"Start the first run."* Left: value line + what to expect ("30 min · no slides · we'll tell you the honest version"). Right: the picker.

**8 · Footer** — wordmark + one-liner, nav repeat, email `hello@pivon.ai` (placeholder), socials, © 2026 Pivon, illustrative-work disclaimer.

## 6. Appointment picker spec (custom, mock backend)

- **Step 1 — Date:** a month calendar (current + next month nav). Weekends + past days disabled. ~next 14 business days selectable.
- **Step 2 — Time:** on date pick, show slots (e.g., 09:00–16:30, 30-min, a few "taken"/disabled for realism).
- **Step 3 — Details:** name, email (validated), company, "What do you want to talk about?" (textarea), optional team-size select.
- **Submit:** validate → `console.log({date,time,name,email,company,topic,...})` → show a confirmation state ("You're booked — pretend-confirmed. We'll wire this to a real calendar next."). Clearly comment the stub + where a real endpoint goes.
- On-brand: selection states use the gradient; uses console/generate motif ("scheduling…" → confirmed). Reduced-motion safe; fully keyboard-operable; ARIA on the calendar grid.

## 7. Tech & build plan

**Files:** `index.html` (semantic sections + all copy) · `style.css` (token contract + globals + per-section styles, delimited) · `script.js` (neural-field canvas, reveals, nav, hero console, appointment picker; one reduced-motion guard) · inline SVG brain mark. No deps except Google Fonts.

**Subagent fan-out (sonnet), against this contract:**
- Orchestrator (me) writes the **foundation**: `style.css` :root + reset + primitives + nav + footer; `script.js` core (neural-field bg, reveal observer, reduced-motion helper, nav); `index.html` skeleton with section placeholders + hero (signature — built carefully).
- Parallel sonnet subagents, one per content section — **Services, Approach, Work, Team, Booking** — each writes self-contained partials to `build/<section>.{html,css,js}` using the token contract + the copy above. No shared-file writes (assembled after).
- Assembly step concatenates partials → final `style.css`/`script.js` and injects HTML into `index.html`.
- QA in-browser (chrome-devtools): full-page screenshot desktop + mobile, console clean, reduced-motion, keyboard focus. Iterate.

## 8. Quality floor (non-negotiable)

Responsive 360 → 1440px+. `prefers-reduced-motion` respected everywhere (no looping motion; finished static state). Visible keyboard focus. Hero H1 paints immediately (LCP). Animate transform/opacity only; 60fps; no console errors. Semantic landmarks + alt text + labelled form controls.
