# blinds-slat

Venetian slat wipe between before/after states on scrub

**Dual-surface preset.** Ship it as a website *section* or wrap the same component as a webapp *feature* — the engine view for this preset exposes a `SECTION | FEATURE` toggle so you can see both against real content.

Category `content` · motion via `motion/react` · brand tokens in `src/index.css` (`:root` + `.dark`).

## Install & build

From the repo root: `npm run build:blinds-slat` (or `npm run build:presets`). Engine consumes it via the `file:` dependency.

## Vendoring model

Original design work; only the in-repo `handcraft` kit + `motion-primitives` snapshots (when listed in `presetSources`) are vendored — MIT. See `UI/VENDORING-STRATEGY.md`.
