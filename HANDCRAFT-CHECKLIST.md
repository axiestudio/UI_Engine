# Handcraft checklist — autonomous-phase UI → crafted UI

The framework applied to **every** preset before it counts as crafted:

```
JOB        What is this section's single job on the page?
EMOTION    What should the visitor feel in the first 2 seconds?
SIGNATURE  The ONE move someone remembers (no preset ships without one).
TYPOGRAPHY Hand-picked scale + tracking; one serif-italic turn where voice matters.
RHYTHM     Asymmetric grids and hand-picked widths (760/920/1120/1280) — never a
           default 1280 centered box.
TEXTURE    Grain / dots / rails / corner ticks / perforation — layered, never flat.
MOTION     One choreography per section (stagger, draw, settle, sweep) — motion
           must mean something, not decorate.
DETAILS    Sign-off rules, ordinals ("01 /"), stamps, punch-throughs, sheens.
A11Y+DKM   Tokens only (no hardcoded hex/rgba except deliberate overlay maths),
           focus-visible, reduce-motion, aria — dark mode flips every token and
           must look intentional, not inverted-broken.
```

**Tone model (the "ink stone" question):** `tone="paper" | "ink"` is **not dark mode**. It is an intentional *inverted band* — `ink` paints the section `bg-foreground text-background`. In dark mode the tokens flip, so the band becomes light-on-dark — still a deliberate contrast band, never a bug. Real dark mode is the `.dark` class in each package's `index.css`, which swaps every HSL token; all 51 packages ship it. Rule for components: **never hardcode hex/rgba for anything token-able** — shadows use `currentColor`, overlays use tokens or deliberately transparent white/black only where the maths needs them.

Status: ✅ crafted · 🔧 surgical pass · ⬜ pending

## Mine (rounds 1–7)

| Preset | JOB | EMOTION | SIGNATURE | Status |
|---|---|---|---|---|
| hero | land the 5-second promise | confident inevitability | asymmetric 5/6 grid; magnetic glow CTA + sheen; visual pinned −1.5° with ticks; grain+dots bottom-left only | ✅ |
| steps | remove fear of process | momentum | numerals cropped by card corners; letterpress hover; self-drawing connector; sign-off rule | ✅ |
| auth | trust at the door | quiet competence | ink aside: grain + ruled rails + serif quote + sign-off diamond | 🔧 |
| consent | compliance without annoyance | respect | cornered ink slip, slide-up choreography, ledger switches | ✅ |
| changelog | show momentum | "they ship" | true rail with square nodes (filled=latest), ledger rows, shimmering "● Latest", "end of log" | ✅ |
| error | recover with dignity | calm, slightly wry | clipped outlined code plate; incident-report strip; ordinal links | ✅ |
| marquee | ambient proof | pulse | odometer of items ◆ separators; progressive-blur edge dissolve; mono label | 🔧 |
| newsletter | trade email for value | considered | mailed subscription slip: dashed tear, rotated stamp, signing-line input, hard-offset magnetic button | ✅ |
| showcase | tangible product | desire | browser frame with corner ticks + grain + sheen; film-strip tabs | 🔧 |
| search | navigate fast | mastery | ⌘K palette; hard-offset kbd stamp on mono trigger | ✅ |
| video-demo | proof in motion | credibility | chrome frame + play plate | ⬜ |
| compare | honest contrast | clarity | lifted highlight column: gradient top bar + side rails + "This product" stamp | 🔧 |
| roadmap | credible plan | transparency | transit-map nodes (pulse=Now, hollow=queued), dashed rails, odometer votes | ✅ |
| careers | recruit trust | welcome | ledger rows with ordinals, slide-on-hover, department counts, "write us anyway" sign-off | ✅ |
| events | urgency + concreteness | anticipation | printed tickets: perforated date block, punched notches, −0.5° settle, rotated LIVE stamp | ✅ |
| waitlist | anticipation | held breath | odometer counter in digit cells; pulsing beacon; dotted horizon; oversized tight-tracked type | ✅ |
| help-center | orientation | reassurance | signing-line search as hero, masked dots, ticked index cards | ✅ |
| case-study | proof | conviction | 260px serif quote mark bleeding off the corner; serif-italic quote; report tiles | ✅ |
| empty-state | guide the next step | patience | slow-spinning dashed ring icon, numbered tips ledger | ✅ |

## Other agent's autonomous set

| Preset | JOB | EMOTION | SIGNATURE | Status |
|---|---|---|---|---|
| cta | convert | readiness | cornered ink panel + sheen button + ticks | 🔧 |
| stats | credibility at a glance | solidity | count-up tiles as hairline band w/ ordinals (SectionShell) | 🔧 |
| announcement | interrupt politely | urgency | printed-ribbon corner ticks + shimmering border trail | 🔧 |
| bento | breadth of capability | curiosity | ⬜ | ⬜ |
| blog | editorial authority | trust | ⬜ | ⬜ |
| features | explain the product | confidence | ⬜ | ⬜ |
| gallery | show the space | warmth | ⬜ | ⬜ |
| logos | borrowed trust | belonging | ⬜ | ⬜ |
| pricing | decision clarity | fairness | ⬜ | ⬜ |
| schedule | concreteness of booking | ease | ⬜ | ⬜ |
| team | faces behind it | familiarity | ⬜ | ⬜ |
| timeline | history/progress | momentum | ⬜ | ⬜ |

**Definition of done (per preset):** all framework rows consciously decided · builds green · engine demo green · dark mode flips cleanly · no hardcoded token-able colors · registry regenerated.
