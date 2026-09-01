# _registry — the library stack (offline snapshots + engine contracts)

This is **what we build with** — the registry of libraries and frameworks behind
every preset. It exists because of one rule from [`UI/DESIGN_PRICIPLE.md`](../DESIGN_PRICIPLE.md):

> **Libraries solve technical problems. Our design system solves visual problems.**

We never rebuild carousel mechanics, positioning logic, chart UI, or animation
engines. We vendor/snapshot the library, compose it, and spend our effort on
design. Not a workspace package (no package.json).

**23 sources = the libraries of [`UI/PRINCIPLE_READ_ME.md`](../PRINCIPLE_READ_ME.md)** Machine-readable index + decision router:
[`LIBRARIES.json`](./LIBRARIES.json).

---

## Reading a folder

Every source folder is self-describing via **`library.json`**:

| Field | Meaning |
|---|---|
| `kind` | `registry` (shadcn-style item JSONs) · `source-snapshot` (upstream source files) · `engine` (npm peer — never copied) · `in-repo` (authored here) |
| `tier` | foundation / animation / interaction / visualization / design-system — mirrors the principle docs |
| `responsibility` | the ONE thing this library owns for us |
| `reachFor` / `avoid` | when to use it, and what *not* to hand it (anti-duplication, principle §11) |
| `packages` / `externals` | npm peers + rollup externals wired by `create-preset.py --lib` |
| `recipes` | proven wiring helpers, vendored into presets as `src/hooks/` |

Machine-readable index incl. the decision router + tiers: [`LIBRARIES.json`](./LIBRARIES.json).

---

## The stack

### Foundation — shadcn/ui via Watermelon (`watermelon/`)
`kind: registry` — snapshot of https://registry.watermelon.sh (shadcn-compatible).
- `registry.json` — full index (1073 items). `r/<item>.json` — item snapshots with
  raw TSX `content`. Refresh: `curl -s https://registry.watermelon.sh/r/<name>.json -o UI/_registry/watermelon/r/<name>.json`
- Kit names (`button`, `card`, `dialog`, …) are the **shadcn base kit** — vendored to
  `src/components/ui/`; section blocks go to `src/components/watermelon/`.
- Consume: `create-preset.py --wm item1,ui/button,card`

### Website design — React Bits (`react-bits/`) · Cult UI (`cult-ui/`) · Animata (`animata/`)
The actual visual design of the website (principle docs: **HIGH importance**).
- `react-bits/` — `kind: registry`, full index mirrored, TS-TW variant only
  (171 items, names like `SplitText-TS-TW.json`). Upstream: reactbits.dev/r/.
- `cult-ui/` — `kind: registry`, 157 items + demos with contents. Upstream site
  bot-checks scripts — snapshot taken from the official repo (MIT).
- `animata/` — `kind: source-snapshot`, the repo's `animata/` component tree
  (414 TSX, no registry API exists). Stories files are dev-only, never vendored.
- Consume: `create-preset.py --reg react-bits:AnimatedContent` etc. (registry names
  resolve locally; shadcn-kit deps route to watermelon).

### Presentation — Eldora UI (`eldora-ui/`) · Tailark (`tailark/`)
- `eldora-ui/` — `kind: registry`, 114 items with contents (device/browser mockups:
  iPhone, iPad, MacBook Pro, Safari). HIGH importance for hero/showcase sections.
- `tailark/` — `kind: inspiration`, **deliberately not snapshotted** (principle §6:
  not every resource becomes a dependency). Browse for layout direction only.

### Animation — Motion Primitives (`motion-primitives/`) · GSAP (`gsap/`) · Anime.js (`animejs/`) · Lenis (`lenis/`) · React Spring (`react-spring/`)
- `motion-primitives/` — `kind: source-snapshot` — components/core of
  github.com/ibelick/motion-primitives (MIT, (c) 2024 ibelick), fetched from
  `main` 2026-08-30. Their live registry sits behind a Vercel bot check — use
  this snapshot. Consume: `--mp in-view,spotlight --hooks useClickOutside`.
- `gsap/` — `kind: engine`, npm peer `gsap ^3.15.0`. Timelines, ScrollTrigger
  scrub, Flip, Draggable+Inertia, SplitText (plugins free since 3.13). The
  deliberate escalation when Motion Primitives doesn't reach far enough.
- `animejs/` — `kind: engine`, npm peer `animejs ^4.5.0` (**v4**: named exports,
  one package, no plugin matrix). Full engine — timeline, Draggable with spring
  release, ScrollObserver, SVG morph/draw, text split/scramble, layout
  transitions. The ergonomic middle ground between Motion Primitives and GSAP.
- `lenis/` — `kind: engine`, npm peer `lenis ^1.3.26`. Smooth page scroll — one
  instance per page, page-level concern; pairs with GSAP ScrollTrigger.
- `react-spring/` — `kind: engine`, npm peer `@react-spring/web ^10.1.2`.
  Physics-based motion that follows React state, interruptible.

### Interaction — Floating UI (`floating-ui/`) · Embla (`embla/`) · Vaul (`vaul/`) · Sonner (`sonner/`)
`kind: engine` — **npm peers, never vendored code.** The folders hold the
*contract*: manifest, API notes (`NOTES.md`), and proven recipes distilled from
this repo's own presets (vendored as `src/hooks/`).
- Floating UI → tooltips/popovers/toolbars positioning + interaction wiring.
  Peer `@floating-ui/react ^0.27.20`.
- Embla → carousels, galleries, draggable rails. Peer `embla-carousel-react ^8.6.0`.
- Vaul → draggable drawers/bottom sheets (Radix Dialog semantics). Peer `vaul ^1.1.2`.
- Sonner → toasts, mounted once at the shell root. Peer `sonner ^2.0.8`.
- Consume: `create-preset.py --lib floating-ui` (etc.)

### Visualization — Bklit (`bklit/`) · Recharts (`recharts/`) · ECharts (`echarts/`)
- `bklit/` — `kind: registry`, full snapshot of https://ui.bklit.com (shadcn-
  compatible, `@bklit` namespace): `registry.json` (56 items) + `r/<item>.json`
  with contents. Design-engineered charts. `@bklit/*` deps resolve **locally**;
  plain names (`card`, `badge`) resolve from watermelon. Consume: `--bk area-chart,legend`.
- `recharts/` — `kind: engine`, npm peer `recharts ^3.10.1` — plain utility charts
  (already in use: `app/kpi-tile-live`).
- `echarts/` — `kind: engine`, npm peer `echarts ^6.1.0` — heavyweight canvas
  visualization for large datasets; tree-shake via `echarts/core`.

### 3D / Advanced visuals — Three.js (`threejs/`) · React Three Fiber (`react-three-fiber/`) · Rive (`rive/`) · Lottie (`lottie/`)
`kind: engine`. Principle §9: 3D supports the design, never becomes the design.
Principle §10: Rive = animation that responds to interaction/state; Lottie =
animation assets that play.
- R3F is the only sanctioned Three.js route inside React presets
  (`three ^0.185.1` + `@react-three/fiber ^9.7.0`); Rive peer
  `@rive-app/react-canvas ^4.33.0`; Lottie peer `lottie-react ^3.1.1`.

### Design system — Handcraft (`handcraft/`) — RETIRED
The shared shell/texture kit (SectionShell/Grain/Sheen/…) was retired by design
decision: a unifying kit makes presets uniform. Sections are now composed
**per preset** directly from tokens — own container width, own vertical rhythm,
own heading voice. Buttons come from the shadcn/watermelon registry; motion from
the motion-primitives registry. The `handcraft/` folder remains on disk marked
`retired` — do not import it in new work.
---

## Convention for new presets (see UI/footer, UI/visit-us, …)

- Vendored files keep a **provenance header** naming the exact registry item /
  GitHub path / snapshot file.
- Declared per package in `package.json` under `presetSources`.
- Engine libraries appear as `peerDependencies` + rollup externals — code stays
  theirs, design stays ours.
- **Type strictness note:** preset tsconfigs enable `verbatimModuleSyntax`; some
  upstream sources (react-bits, cult-ui, mp snapshots) use value-style type
  imports, so `tsc -b` flags TS1484 in vendored files. Known repo-wide condition
  — the engine builds via vite; fix type imports opportunistically, never
  restructure upstream logic.

## Decision order (before writing ANY component)

1. shadcn? 2. watermelon? 3. React Bits / Cult UI / Animata? 4. a specialized
library above? 5. compose, don't copy → only then write bespoke design markup with tokens (no shared kit).

> **Reuse first. Compose second. Customize third. Rebuild last.**
