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
| curtain-call | a closed stage before the page | held breath | verbatim engine-gate port: twin panels scrub apart, statement scales 0.96→1.12, seam fades; peel done at 85% so nothing pops at sticky release; scene unmounts fully at open — hero is all that remains | ✅ |
| departure-board | deliver live info with authority | institutional calm | split-flap char scramble settling row by row; re-flushes on prop change | ✅ |
| film-strip-wind | tell a history as reels | nostalgic focus | frame-by-frame scrub with dim/scale falloff + sprocket progress rail | ✅ |
| switchboard-reveal | route people to the right human | competence-through-objects | self-drawing SVG patch cable, lamp green on connect, radio group under it | ✅ |
| stamp-fold | make "confirmed" a moment | ceremony | wax-drop squash then paper fold-up; aria-live status | ✅ |
| boarding-pass-gate | issue offers like tickets | ownership | scanline mutates barcode→QR, perforation notches, hard-offset shadow | ✅ |
| applause-meter | prove rating socially | warmth | center-weighted amplitude bars lean to score; tap-to-rate radios; ovation ring | ✅ |
| spotlight-pickup | make a list into an event | being the scanner | cursor-punched dark sheet reveals cells; tap-supported; text always present | ✅ |
| vault-dial | gate a reveal behind intent | tactile suspense | pointer-drag dial snaps to detents, bolts retract, code is real text; slider semantics | ✅ |
| encore-bows | introduce people as cast | warm recognition | staggered rotateX bow on enter + floor spotlight ellipse | ✅ |
| blinds-slat | reveal transformation physically | patience | 12-14 staggered rotateX slats each carrying a registered slice; controlled 0↔1 for app privacy | ✅ |
| elevator-floors | make tiers rideable | trust in machinery | brass button grid + cable indicator + door sweep on floor change | ✅ |
| intermission-card | pace long pages like acts | playful ceremony | clip-path circle iris wipe + double-frame intertitle card | ✅ |
| gallery-rails | display work as curated | hush | pendulum swing-in on wire origin + engraved plates | ✅ |
| marquee-lights | announce premieres | electricity | bulb-ring chase/twinkle, live status speeds the chase | ✅ |
| signal-flags | CTA that waves back | grin + competence | real semaphore code positions, replay wave on hover/click | ✅ |
| ticket-rush | show scarcity honestly | pressure | odometer cells stagger right-to-left, LED glass texture, sold-out state | ✅ |
| airlock-cycle | give auth a safety identity | procedural trust | outer iris + pressurize bar + inner doors that refuse early; controlled 2FA stage | ✅ |
| house-programme | list what's on with typographic weight | institutional pride | playbill rules, act ordinals, credit columns, scissors perforated stub CTA | ✅ |
| ink-bloom | land one quiet promise | stillness | blur14→0 soak-in via radial mask, scroll-scrubbed (site) or mount-animated (app) | ✅ |
| typewriter-manifesto | force linear reading | being addressed | per-char typing with caret beat; console chrome variant for app logs | ✅ |
| stage-lights-up | open a page like a show | held breath | three beam cones sweep in, converge, snap off; pool-of-light settles up | ✅ |
| projection-burn | tell a page through a projector | borrowed evening | lamp-flicker opacity beats on the screen + drifting dust motes in the beam cone | ✅ |
| aperture-hero | look through a camera, not at a hero | control through glass | 8 wedge blades rotate/scale open on scrub; click moves the focus reticle | ✅ |
| countdown-flare | make launch time the protagonist | T-minus air | LED flip cells burn down; at zero the horizon lifts with an exhaust flash, slot fills | ✅ |
| red-carpet-scroll | welcome someone important | being expected | velvet unrolls on scrub/controlled progress; brass stanchions spring in, rope catenaries sag | ✅ |
| neon-beacon | announce availability like a storefront | rain outside, tubes on | letter-by-letter ignition stutter with glow drop-shadows; OPEN⇄CLOSED relight, real switch role | ✅ |
| zip-reveal | make a reveal physical | parcel anticipation | draggable pull (role=slider) clips the kraft flap; magnets snap sealed/fully open | ✅ |
| vinyl-spin | give a quote a ritual object | analog weight | disc slides from sleeve with groove rings and CSS spin; quote appears while playing | ✅ |
| page-turn | pace chapters like a book | bound authority | 3D leaf flips over the spine (rotateY, preserve-3d) with paper shadow; stack-edge depth counts pages | ✅ |
| finale-confetti | finish success with a moment | the room goes off | seeded physics confetti from two rakes, banner unfurl, self-harvest + Esc; reduced = banner only | ✅ |

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
