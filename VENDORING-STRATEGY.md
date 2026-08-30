# Vendor or depend? — The two risks in this repo, and what to do about them

Context: every package in `UI/` already **vendors** its component source — shadcn/ui items are copied in from `ui.shadcn.com` with provenance headers, Motion-Primitives files are copied from a pinned GitHub snapshot, and each package's `package.json` records the exact registry URLs under `presetSources`. Nothing is fetched at runtime or at install time. Watermelon packages (other workstream) work the same way.

---

## Verified 2026-08-30 (evidence, not promises)

| Claim | Proof |
|---|---|
| Source lives in this repo | 118 vendored `.tsx` files across our 19 packages; every one carries a provenance header (exact upstream URL + fetch date) |
| No network at runtime | `grep` for `fetch(/axios/XMLHttpRequest/WebSocket/http-imports` across all 19 packages' `src`: **0 hits** |
| No fetch at build time | `vite.config.ts` / `postcss.config.js` / `tailwind.config.js` contain **0** registry URLs — those exist only in comments and `presetSources` metadata |
| No registry npm packages | `node_modules` contains **no** watermelon / aicanvas / motion-primitives packages — only standard infra (react, motion, radix-ui, cmdk, cva, clsx, tailwind-merge, lucide) |
| Local install works | `engine` consumes every preset via `file:../UI/<name>` → npm symlinks in root `node_modules` point back into this repo |
| Works with the internet unplugged | dist bundle is self-contained (only react/motion/radix-ui/cva/clsx/tailwind-merge as external *infra* imports); `import('UI/steps/dist/steps.es.js')` in Node exports `Steps`, `TextEffect`, `BorderTrail`, … and they run |
| Consumers own the source | `files: ["dist", "src", "README.md"]` — `npm pack` ships the **raw editable `.tsx`** alongside compiled dist, so `npm install steps` gives consumers both a drop-in build *and* the source to fork |

---

## Concern 1 — "The UI components will just vanish"

**The fear:** we build on watermelon.sh / aicanvas.me / motion-primitives, and one day the registry is gone, gated (aicanvas already requires an account to fetch real source), pivots to paid, changes license, or the solo maintainer quits — and our UI breaks or can't be rebuilt.

**The reality in this repo: it cannot break, because the code is already ours.**
Vendored files are ordinary `.tsx` in our git history. If every registry on the internet died today, `npm run build` still works, forever. This is the shadcn model, and it *is* industry standard now: shadcn/ui's own pitch is "the code is yours — we don't even ship a component npm package." Registries are distribution channels, not runtime dependencies.

**Residual risks that remain even with vendoring (be honest about these):**

1. **License rot.** Motion-Primitives is MIT ✓, shadcn/ui is MIT-style ✓, but a provenance header per file is what makes a future license audit a 5-minute job instead of an archaeology dig. Keep the header discipline — it's the whole insurance policy.
2. **Stale copies.** A vendored component never gets upstream bug fixes. Mitigation: `presetSources` URLs make an upstream-diff a `curl` away. Refresh deliberately, review the diff, don't auto-update.
3. **Security fixes land upstream, not in our copies.** The vendored surface here is presentational (no network, no crypto, no server). The *runtime* deps below are where CVEs actually matter — update those like normal packages.

**Verdict:** vanish-risk is solved by what we already do. Do not fetch from registries at build time; do not `npm install` registry-owned component packages. Pin + vendor + provenance header.

---

## Concern 2 — "Too many dependencies"

**The fear:** 19 packages × (react, motion, radix-ui, cva, clsx, tailwind-merge, lucide-react, cmdk…) — doesn't that balloon?

**The reality:** count what a consumer actually installs. Our packages declare these as **peerDependencies**, not bundled deps:

| shared peer | used by |
|---|---|
| `react`, `react-dom` | everything (consumer has it anyway) |
| `motion` | everything |
| `clsx`, `tailwind-merge`, `class-variance-authority` | everything |
| `radix-ui` | packages with shadcn primitives (slot/switch/dialog/checkbox…) |
| `lucide-react` | packages with icons |
| `cmdk` | `search` only |

A consumer who installs several presets pays for **no duplicated copies** — npm peers resolve each of these once. The dist of any single preset is ~5–18 KB JS + ~4–9 KB CSS (gzip ~2–5 KB). The dependency count is *wide but shallow and shared* — that's the correct shape. Dependency bloat is when packages *bundle* their own copies of react/motion/lodash-etc (the thing peerDeps + `rollupOptions.external` prevent, which our vite configs do).

**Where this repo genuinely has redundancy worth cleaning (real, but small):**

1. **Two animation libraries.** Root has `motion` *and* `framer-motion`. Pick `motion` (framer-motion v11+ re-publishes as `motion`); drop the other.
2. **Three icon systems.** Watermelon packages use `react-icons`, our packages use `lucide-react`, root also pulls `@hugeicons`. Converge on `lucide-react` and the tree shrinks meaningfully.
3. **Radix split-brain.** Older packages peer on individual `@radix-ui/react-*` packages; ours use the unified `radix-ui`. Over time, migrate the old ones — one package, one import surface.

**Verdict:** no bloat problem in the consumer path; three dedupe cleanups worth doing at the repo level.

---

## So: install locally (vendor) or npm install? — Decision rule

- **Design/section code that we own the look of** → **vendor + own it.** That's every `UI/*` preset. Not vendoring here would mean trusting a third party to never change the pixels you ship.
- **Invisible infrastructure with a real maintainer** → **npm dependency.** `radix-ui` (accessibility primitives), `cmdk`, `motion`. These need upstream CVE fixes and behavior fixes we don't want to own.
- **Never** → runtime registry fetching, auto-updating component installs, or npm packages that bundle React/motion inside themselves.

**Consumer ownership (the "same logic later" you asked about) is now three-sided — all three channels work off the same vendored sources:**

1. **Compiled library:** `npm install steps` → `dist/` (es/cjs + css + **`index.d.ts` types**), tree-shakeable, drop-in. Fixed 2026-08-30: dts plugin now emits real declarations (`outDir`/`entryRoot`/`insertTypesEntry`), and every package carries a `"license": "MIT"` field + `LICENSE` file (npm would otherwise warn / shipping would be legally ambiguous).
2. **Source in the tarball:** `files: ["dist", "src", "README.md", "LICENSE"]` — the raw editable `.tsx` rides along. A consumer can lift the source into their project whenever they want. They own it.
3. **shadcn-style registry (the true "own the source" channel):** `UI/registry/` contains `registry.json` + `r/<name>.json` for all 19 presets, generated by `registry/generate.py` straight from the vendored sources (118 files). Host that folder on any static host (GitHub Pages/Vercel) and consumers run `npx shadcn add https://<host>/r/steps.json` — the CLI writes the `.tsx` into their repo and installs the infra deps. No npm package needed at all; the code lands as theirs. Regenerate with one command after editing sources.

This repo is already on the industry-standard side of the 2024+ shadcn-era consensus: **own your design code, depend on maintained primitives, keep peer deps shallow and shared.** The two things left to do are cosmetic: keep writing provenance headers, and dedupe motion/icon/radix packages at the root.
