# UI workspace

426 preset packages, organized by role in the page — `UI/<category>/<preset>/`
(package names unchanged; import by name). The engine sidebar shows 427 presets
(426 + home); **all 426 ship to the shadcn registry** (see Install below).

| Category | Count | Role / "when do I use it" |
|---|---|---|
| `chrome/` | 38 | The page chassis & system surfaces: header variants, footer, drawer, sticky action bar, announcement, search, consent, notifications, status, error, empty-state |
| `hero/` | 75 | Opening statements: classic/scroll/ink/manifesto/product/ticker heroes, curtain intros, type animators + the zigzag scroll tunnel |
| `content/` | 159 | Proof and narrative sections: features, bento, stats, steps, team & expert spotlights, timeline, gallery, blog, events, careers, changelog/roadmap, testimonials, FAQ, tables, newsletter & letter… plus the **device stage family** (desktop / laptop / tablet / mobile / responsive mockups) and the composable **stack-proof** |
| `commerce/` | 50 | Offers and conversion: cta, pricing, offer (flip-clock countdown), gift (flip card), vault (value receipt), menu, download, waitlist, poll, review ask, aftercare recap — plus the **layer-stack family** (burger builder / pricing card / receipt) |
| `engage/` | 35 | Do-the-thing & trust: contact, auth, upload, choice, stepper, visit-us, schedule (hours+slots), place, facts, ritual, ambiance, promise |
| `dnd/` | 24 | Drag & drop systems: kanban, sortable lists/grids/trees, form & page builders (dnd-kit) |
| `sidebar/` | 1 | Sidebar systems: solid rail — a complete `[sidebar \| content]` app shell: workspace switcher, primary nav, presence select, account menu, collapsible rail; built-in mobile (off-canvas below `md`), `mobile={false}` pins the desktop rail so hosts can mount it in their own sheet |
| `branding/` | 25 | Brand & identity surfaces: logo systems, palette tools, tone/voice strips |
| `insight/` | 19 | Analytics & observation decks |

Authoritative map: [`CATEGORIES.json`](./CATEGORIES.json) (read by the engine sidebar grouping and `scripts/create-preset.py --cat`).

## Install any preset (shadcn registry — one command, own the source)

In any shadcn-initialized project (aliases + `cn()` + theme tokens):

```sh
npx shadcn@latest add https://ui-engine.pages.dev/r/footer-cta.json
```

The CLI writes the raw `.tsx` into your repo (`@components/`, `@ui/`), installs
the npm deps from the item manifest (`motion`, `lucide-react`, …), and asks
before overwriting files you already have. The code is yours after that:
editable, no runtime registry, no npm package. Every preset also carries a
companion CSS file when it needs more than theme tokens (`@import` it — the
manifest `description` says so).

Regenerate after editing any package's sources (single source of truth:
`UI/*/src` — never hand-edit generated JSON):

```sh
bun run --cwd engine generate:distribution
```

This writes `UI/registry/r/*.json` (+ `registry.json` index) and mirrors the
same bytes to `engine/public/r/` (dev-server DRY RUN + engine deploy).
Details: [`UI/registry/README.md`](./registry/README.md).

## Path invariants (do not regress)
- Engine Tailwind scans **`../UI/*/*/src/**/*.{ts,tsx}`** — one wildcard, survives any future regrouping.
- Package names (npm identifiers) are the stable key; workspace scripts address them **by name** (`--workspace=<name>`), never by path.
- New presets: `python3 scripts/create-preset.py NAME --cat content …` then add to `CATEGORIES.json`, root `workspaces` is already glob-based. Then wire into `engine/package.json` (`file:../UI/<cat>/<name>`), build its `dist/`, and regenerate sources + registry so sidebar, source panel, and shadcn all see it.

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
