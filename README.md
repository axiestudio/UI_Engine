# UI workspace

78 presets, organized by role in the page — `UI/<category>/<preset>/` (package names unchanged; import by name).

| Category | Role / "when do I use it" |
|---|---|
| `chrome/` (16) | The page chassis & system surfaces: 6 header variants, footer, drawer, sticky action bar, announcement, search, consent, notifications, status, error, empty-state |
| `hero/` (8) | Opening statements: classic/scroll/ink/manifesto/product/ticker/cards heroes + the zigzag scroll tunnel |
| `content/` (31) | Proof and narrative sections: features, bento, stats, steps, team & expert spotlights, timeline, gallery, blog, events, careers, changelog/roadmap, testimonials, FAQ, tables, newsletter & letter… |
| `commerce/` (11) | Offers and conversion: cta, pricing, offer (flip-clock countdown), gift (flip card), vault (value receipt), menu, download, waitlist, poll, review ask, aftercare recap |
| `engage/` (12) | Do-the-thing & trust: contact, auth, upload, choice, stepper, visit-us, schedule (hours+slots), place, facts, ritual, ambiance, promise |

Authoritative map: [`CATEGORIES.json`](./CATEGORIES.json) (read by the engine sidebar grouping and `scripts/create-preset.py --cat`).

## Path invariants (do not regress)
- Engine Tailwind scans **`../UI/*/*/src/**/*.{ts,tsx}`** — one wildcard, survives any future regrouping.
- Package names (npm identifiers) are the stable key; workspace scripts address them **by name** (`--workspace=<name>`), never by path.
- New presets: `python3 scripts/create-preset.py NAME --cat content …` then add to `CATEGORIES.json`, root `workspaces` is already glob-based.
