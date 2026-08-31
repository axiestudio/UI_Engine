# UI workspace

486 presets, organized by role in the page — `UI/<category>/<preset>/` (package names unchanged; import by name).

| Category | Role / "when do I use it" |
|---|---|
| `chrome/` (34) | The page chassis & system surfaces: header variants, footer, drawer, sticky action bar, announcement, search, consent, notifications, status, error, empty-state |
| `hero/` (72) | Opening statements: classic/scroll/ink/manifesto/product/ticker heroes, curtain intros, type animators + the zigzag scroll tunnel |
| `content/` (140) | Proof and narrative sections: features, bento, stats, steps, team & expert spotlights, timeline, gallery, blog, events, careers, changelog/roadmap, testimonials, FAQ, tables, newsletter & letter… plus the **device stage family** (desktop / laptop / tablet / mobile / responsive mockups) |
| `commerce/` (37) | Offers and conversion: cta, pricing, offer (flip-clock countdown), gift (flip card), vault (value receipt), menu, download, waitlist, poll, review ask, aftercare recap |
| `engage/` (28) | Do-the-thing & trust: contact, auth, upload, choice, stepper, visit-us, schedule (hours+slots), place, facts, ritual, ambiance, promise |
| `dnd/` (24) | Drag & drop systems: kanban, sortable lists/grids/trees, form & page builders (dnd-kit) |
| `app/` (101) | Webapp surfaces: command palette, data tables, meters & KPIs, AI surfaces, desk layouts — one shared APP SYSTEM brandkit |
| `branding/` (23) | Brand & identity surfaces: logo systems, palette tools, tone/voice strips |
| `insight/` (14) | Analytics & observation decks |
| `learn/` (13) | Educational & course surfaces |

Authoritative map: [`CATEGORIES.json`](./CATEGORIES.json) (read by the engine sidebar grouping and `scripts/create-preset.py --cat`).

## Path invariants (do not regress)
- Engine Tailwind scans **`../UI/*/*/src/**/*.{ts,tsx}`** — one wildcard, survives any future regrouping.
- Package names (npm identifiers) are the stable key; workspace scripts address them **by name** (`--workspace=<name>`), never by path.
- New presets: `python3 scripts/create-preset.py NAME --cat content …` then add to `CATEGORIES.json`, root `workspaces` is already glob-based.

## Embedding fixed chrome in constrained shells
Standalone sites want cookie/consent bars, headers and action bars pinned to the **viewport** —
that is the default (`--fixed-inset-left/right` fall back to `0px`). Hosts with their own
chrome (app shells, dashboards, the UI Engine's sidebar) can re-anchor any fixed preset to
their content column by setting two custom properties on **any ancestor**:

```css
--fixed-inset-left: 300px;  /* width of your own rail, if any */
--fixed-inset-right: 0px;
```

Presets honoring this contract: `header` (fixed mode), `header-pill`, `header-minimal`,
`sticky-cookie`, `consent`, `action-bar`. Position stays `fixed` — pinning, hide-on-scroll
and portal behavior are untouched.

## Vendored primitives — tokenization contract
`components/primitives/{text-shimmer,glow-effect,border-trail}.tsx` are vendored from
motion-primitives (MIT) with ONE deliberate local craft change everywhere: hardcoded
demo/zinc hexes are replaced by the shadcn token set, per [`HANDCRAFT-CHECKLIST.md`](./HANDCRAFT-CHECKLIST.md)
("never hardcode hex for anything token-able"). Copies are kept byte-identical across all
presets — sync from the canonical copy when adopting upstream changes, don't hand-edit one.
