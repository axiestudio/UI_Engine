# switchboard-reveal

Patch-cable contact routing — lights follow each jack until the line connects

**Dual-surface preset.** Ship it as a website *section* or wrap the same component as a webapp *feature* — the engine view for this preset exposes a `SECTION | FEATURE` toggle so you can see both against real content.

Category `engage` · motion via `motion/react` · brand tokens in `src/index.css` (`:root` + `.dark`).

## Install & build

From the repo root: `npm run build:switchboard-reveal` (or `npm run build:presets`). Engine consumes it via the `file:` dependency.

## Vendoring model

Original design work; only the in-repo `handcraft` kit + `motion-primitives` snapshots (when listed in `presetSources`) are vendored — MIT. See `UI/VENDORING-STRATEGY.md`.
