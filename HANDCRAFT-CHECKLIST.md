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

## Webapp family (waves 3 — 50 `app`-category presets)

Webapp surface PRIMARY (the engine wraps each in an app window with real studio-domain data); on websites they power the "real product" proof sections. One shared APP SYSTEM brandkit (`--ok/--warn/--err/--info`, `--app-line`, `--app-code`) makes them read as one product in light + dark. The curtain-call motion contract carries over: no pops — every animated thing ends in a state it can hold.

| preset | job | emotion | the one move | craft |
|---|---|---|---|---|
| cmd-palette | find/act without leaving the keyboard | flow state | fuzzy grouped results + recents rail + inline `=` scratch calculator | ✅ |
| inline-edit-cell | change one value with zero ceremony | confidence | in-place swap, optimistic spinner, rejection rings the cell red and replays your old value | ✅ |
| tree-grid-table | browse unlimited nesting without loading the ocean | exploration | async child fetch with inline skeleton row + height spring reveal | ✅ |
| bulk-select-bar | act on many rows from where you are | control | dock springs up with count math and hands off to undo | ✅ |
| filter-token-builder | make query logic readable to non-authors | clarity | type field op value — it SNAPS into a coloured token; operator toggles live | ✅ |
| sticky-group-list | scan a long grouped list | orientation | pure-CSS sticky header stack, next header pushes the old one | ✅ |
| async-multiselect | pick N from a million | reach | paged sentinel fetch, debounced query, flying pills, Create row | ✅ |
| mention-textarea | pull people in mid-sentence | attention | caret-anchored roster via mirror div, slash commands, ring counter on send | ✅ |
| token-input | typed lists that clean themselves | tidiness | paste splits & dedups, dupes shake, two-stage backspace-delete guard | ✅ |
| password-meter | coach strength without lecturing | care | criteria rungs light individually, cap-lock whisper, breach flag | ✅ |
| stepper-form | collect structured data in steps | progress | fuse-filling rail, revisitable finished chips, invalid Continue focuses first bad field | ✅ |
| upload-queue | move files and say what happened | receipts | per-file progress ring, retry chip with tries, bytes+eta footer | ✅ |
| drag-number-field | fine-tune numbers fast | precision | drag/velocity scrub with Shift/Alt multipliers on a real spinbutton | ✅ |
| copy-secret-field | read, copy, rotate a secret | safety | character-morph unmask, copy→✓ morph, rotation blur swap | ✅ |
| segmented-control | switch the same data's view | snap | spring-measured shared thumb, roving arrows/Home/End | ✅ |
| date-range-presets | choose ranges like an analyst | speed | one-click presets with subtext, live painting span, compare ghost | ✅ |
| cron-preview | author schedules by feel | doubt-removal | human sentence recomputes as you type + next-five-runs strip | ✅ |
| permission-matrix | show what roles may do | governance | tri-state cells cycle allow→ask→deny with dirty dot | ✅ |
| sparkline-cell | put trend inside a row | oversight | path draws in on view; crosshair hover; z>2.4 anomalies pulse red | ✅ |
| activity-heatmap | time as texture | streaks | week-column bloom + whole-column hover lift with count readout | ✅ |
| kpi-tile-live | keep digits legible as they change | pulse | odometer wheels roll only the digits that moved; trend chip per update | ✅ |
| funnel-stage-bars | show conversion honestly | gravity | stages expand from the previous edge with labelled drop-off wedges | ✅ |
| storage-ring-meter | answer 'where did quota go' | accountability | stacked arc; legend hover lifts its segment and dims the rest | ✅ |
| radial-gauge | grade one number vs its band | read | needle overshoots then rests; zones colour the arc rail | ✅ |
| event-timeline-day | scan what happened across days | memory | day medallions; rail of staggered slide-in cards colour-keyed by kind | ✅ |
| diff-pane-split | review text changes | decision | unified/split on the SAME data; ins/del semantics; sticky hunks | ✅ |
| code-snippet-panel | ship code with manners | trust | lang badge auto-detect; copy morphs label to 'copied'; gutter lights | ✅ |
| toast-stack | say 'saved' without interrupting | respect | stacking physics, swipe-dismiss with velocity throw, hover pauses timer | ✅ |
| offline-queue-banner | tell sync truth | honesty | pending count ticks; reconnect morphs to pushing strip; vanishes empty | ✅ |
| merge-conflict-panel | settle incoming vs current with two hands free | closure | keys 1/2/3 resolve; resolved card launches away; counter climbs | ✅ |
| undo-history-slider | scrub versions without fear | time | ghost preview dissolve on hover; restore chip springs under the rail | ✅ |
| keyboard-map-overlay | answer 'what are the keys here' | mastery | press ? — combos flash the matching card in the overlay | ✅ |
| smart-skeleton | load with the truth | patience | shape-true shimmer + late 'why is this slow' chip + rise-reveal handoff | ✅ |
| job-tray | watch background work from anywhere | calm | pills merge to one dock; rows with progress bars and tail-follow logs | ✅ |
| product-tour-spotlight | teach inside the live app | arrival | SVG mask hole hops element-to-element on a spring | ✅ |
| ai-prompt-composer | compose requests worth answering | intent | token ring on send, dice-cycling model chip, fanned attachments | ✅ |
| ai-answer-toolbar | give answers an afterlife | judgement | bar rises when stream ends; thumbs morph; regenerate spins once | ✅ |
| citation-hover-card | show receipts on generated claims | trust | sup markers; pointer-tracking source card with quoted snippet | ✅ |
| ghost-suggest-input | finish typing without interrupting | pairing | aria-hidden ghost tail after caret; Tab absorbs; latency badge honest | ✅ |
| ai-change-review | accept machine edits in pieces | consent | per-hunk accept folds the diff away; reject slides out with 4s undo | ✅ |
| breadcrumb-collapse | show deep location in shallow space | geography | ResizeObserver math; middle folds into tail-first menu; home pinned | ✅ |
| tabs-overflow-strip | work on many records at once | continuity | pinned tabs survive; overflow chevron lists the hidden; middle-click closes | ✅ |
| detail-drawer-split | inspect without losing the list | focus | live resize handle (real slider semantics), prev/next rail walk, width persists | ✅ |
| context-menu-stack | operate on what's under the cursor | directness | typeahead jumps, flyout flips at viewport edge, Menu-key/Shift-F10 opens | ✅ |
| status-health-strip | answer 'is it us' at a glance | assurance | pips row + region filter + unrolling incident rows | ✅ |
| grouped-search-results | answer with entities, not links | order | per-kind fuzzy marking + layoutId active rail | ✅ |
| annotation-pin-layer | comment on places, not timestamps | exacting | collision fanning on a spring arc; long-press canvas adds pins | ✅ |
| pipeline-run-graph | follow a run without four tabs | night ops | node strip + stage log drawer that tails; failed node rings | ✅ |
| chat-thread-virtual | read live threads calmly | continuity | stick-to-bottom logic + 'new ↓N' pill; streaming caret; edit window | ✅ |
| inbox-snooze-center | clear a day of pings quickly | zero | right-swipe = done (counter bumps); left-swipe = snooze chips; button twins | ✅ |
| switch-audit-trail | show who changed what | accountability | field-level old→new rows; revert RE-stamps truthfully at top | ✅ |


## Device stage family (showcase mockups — 5 presets)

| Preset | JOB | EMOTION | SIGNATURE | Status |
|---|---|---|---|---|
| device-desktop | show the site at full size | "that could be mine" | power-on scanline sweep + real browser chrome (tabs, address pill, monochrome lights) | ✅ |
| device-mobile | the pocket version | intimate, alive | floating grip — pointer tilt with answering grip shadow; real island/side buttons | ✅ |
| device-tablet | flip product screens on one canvas | curated demo table | film-strip thumbnails drive a crossfade + ordinal caption slide | ✅ |
| device-laptop | present on the real machine | unboxing | hinge: lid swings open on in-view, screen wakes mid-swing, glass sheen settles | ✅ |
| device-responsive | prove every viewport holds | control | draggable viewport scrubber — magnetic breakpoint snap, live ruler, reel mode, `role="slider"` keyboard | ✅ |

Hardware (bezel/island/deck) is a deliberate physical constant — black like real devices in every theme; screens take `src` screenshots or live `children`.
