# zigzag

Zig-zag tunnel with water — continuous scrub, left|tunnel|right.

Standalone shadcn copy of `Habesha-Restaurang-Kaffe-Jönköping/src/components/ZigZagVehicle.tsx` (860vh wrapper, zig-zag vehicle `LEFT→DOWN→RIGHT→DOWN…`, continuous 160 frames `platter→culture`, water inside tunnel). Built to ship to npm.

- **Scrub** — `height="860vh"` sticky container, scroll `0→1` → `frameIndex` on `<canvas>` (DPR-aware `drawImage` cover). Single continuous progress (80 platter + 80 culture = 160, or any `frames` length).
- **Vehicle** — travels invisible zig-zag track (9 keys ±27vw desktop, ×0.32 mobile). `translate3d(xvw, yvh) + rotate` with `will-change-transform`. Card `250×340` mobile / `380×520` desktop, `rounded-[24px]/[32px]`, `shadow-warm` + `hero-gradient #1d0d07→#39150f` + `bg-grain` + radial water + sheen. Poster fallback under canvas, progress bar at bottom, shadow ellipse.
- **Layout** — `left|tunnel|right`. Panels opposite vehicle. Desktop: absolute alternating `left-[6%]` vs `left-[58%]` (`w-[360–390px]`), last center `w-[440px]`. Mobile: all centered `w-[92%] max-w-[360px]`. Height comes from content amount (860vh for 9 panels, ~95vh/panel). Invisible track only faint dots (dashed line removed), plus global bottom bar and optional debug badge.
- **Water** — `hero-gradient` + `bg-grain opacity-30` + `radial #3a9ad9 68% opacity-[0.08]` + `from-transparent via-white/[0.05] to-white/[0.09] mix-blend-overlay` inside the tunnel card.
- **Generic** — not Habesha-specific. Pass `frames` (continuous) or legacy `platterFrames`+`cultureFrames`, `poster`, `panels: ZigZagPanelDef[]` or custom `children`. No dashed line unless you add it. Uses Habesha tokens `hero-gradient`, `bg-grain`, `shadow-warm`, `text-gradient-warm`, `spice oklch(55% 0.18 30)`.

## Design tokens

From `Habesha/src/styles/globals.css` — warm cream `36 33% 98%` bg, terracotta `18 82% 38%` primary, `spice oklch(55% 0.18 30)`, `gold oklch(72% 0.13 70)`. Tunnel:

```css
.hero-gradient { background: linear-gradient(135deg, #1d0d07, #39150f); }
.bg-grain      { background-image: radial-gradient(#321b130f 1px, #0000 1px); background-size: 4px 4px; }
.shadow-warm   { box-shadow: 0 30px 60px -20px #321b1340, 0 8px 20px -8px #c5382926; }
```

Fonts: `Fraunces` display + `Inter` sans + `JetBrains Mono` mono. All in `src/index.css` `:root`.

## Install

```bash
npm install zigzag
# peer: react, react-dom, tailwindcss
# optional: lucide-react for demo panels/icons
```

Tailwind — add to `tailwind.config.js`:

```js
content: ["./src/**/*.{ts,tsx}", "./node_modules/zigzag/dist/**/*.{js}"]
```

Tokens — either import compiled CSS or copy `:root`:

```css
@import "zigzag/styles.css";
/* or copy src/index.css :root vars to your globals.css */
@tailwind base; @tailwind components; @tailwind utilities;
```

Import fonts (like Habesha `index.astro`):

```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@600&display=swap" rel="stylesheet" />
```

## Usage

### Basic — continuous frames (recommended)

```tsx
import { ZigZag } from "zigzag"
import "zigzag/styles.css"

const frames = Array.from({ length: 160 }, (_, i) =>
  `/frames/frame_${String(i + 1).padStart(4, "0")}.webp`
)
// or split legacy:
// const platter = Array.from({length:80}, (_,i)=> `/frames-platter/frame_${String(i+1).padStart(4,"0")}.webp`)
// const culture = Array.from({length:80}, (_,i)=> `/frames-culture/frame_${String(i+1).padStart(4,"0")}.webp`)

export default function Page() {
  return (
    <ZigZag
      frames={frames}
      // platterFrames={platter} cultureFrames={culture}  // legacy alt
      poster="/frames/poster.webp"
      height="860vh" // 9 panels; was 580vh for 6 — elongated by content
      panels={[
        { anchor: 0.05,  kicker: "TRUST • 4.8★", title: "32 Google • 4.8★", description: "Rated 4.8 on Google. 32 verified." },
        { anchor: 0.16,  kicker: "01 — MORE THAN A MEAL", title: "More than a meal — a way of gathering.", description: "Slow-simmered stews, hand-torn injera and a coffee ceremony." },
        { anchor: 0.27,  kicker: "02 — WHAT WE SERVE", title: "Shared injera. Rich wats.", description: "Authentic • Coffee • Gatherings — 3 cards inside.", side: "right" },
        { anchor: 0.38,  kicker: "TODAY'S SPECIAL", title: "Doro Wat — Slow-braised chicken", description: "Berbere-spiced with egg. Festmat.", side: "left" },
        { anchor: 0.495, kicker: "03 — SIGNATURE", title: "Reserve to taste them all →", description: "Vegetarian Combo • Doro Wat • Kitfo — 189/189/195 kr" },
        { anchor: 0.60,  kicker: "04 — GUESTS ARE TALKING • 4.8★", title: "Rated 4.8 on Google.", description: "“Habesha was one of the best.” — Simon Busk" },
        { anchor: 0.72,  kicker: "REVIEWS • CONTINUED", title: "Perfect food & service", description: "“Would come every week.” — Lea • “A genuine gem.” — Ruth" },
        { anchor: 0.83,  kicker: "05 — OUR STORY", title: "Recipes carried across continents.", description: "Every wat built from in-house spices…" },
        { anchor: 0.93,  kicker: "06 — VISIT", title: "Come hungry. Leave like family.", description: "Klostergatan 15 • Daily 11am • Book today.", side: "center" },
      ]}
    />
  )
}
```

No `frames`? Falls back to `poster` only (no canvas scrub).

### Custom panel JSX

```tsx
<ZigZag
  frames={frames}
  poster="/frames/poster.webp"
  panels={[
    {
      anchor: 0.05,
      side: "left",
      content: (
        <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
          <p className="font-mono text-xs font-bold tracking-widest text-[var(--spice)]">CUSTOM</p>
          <h3 className="font-display text-xl font-semibold">Fully custom card</h3>
          <p className="text-xs text-muted-foreground">Any JSX — badges, buttons, images, etc.</p>
        </div>
      ),
    },
  ]}
/>
```

### Fully freeform children

```tsx
<ZigZag frames={frames} poster="/poster.webp">
  {/* absolute overlay — you own the layout */}
  <div className="absolute left-[6%] top-[20%] hidden lg:block">…</div>
</ZigZag>
```

### Props

```ts
type ZigZagProps = {
  frames?: string[]               // unified continuous (preferred)
  platterFrames?: string[]        // legacy split 80
  cultureFrames?: string[]        // legacy split 80
  poster?: string                 // fallback under canvas
  alt?: string                    // default "Zig-zag vehicle — continuous scrub"
  height?: string                 // default "860vh" (was 580vh for 6 panels)
  panels?: ZigZagPanelDef[]       // 9 ideal, any length OK
  children?: ReactNode            // custom overlay alternative
  showDots?: boolean               // default true (faint dots on track)
  showProgress?: boolean           // default true (bottom + vehicle bar + footer tint)
  showScrollHint?: boolean         // default true (desktop pill)
  showDebugBadge?: boolean         // default true (top center ZIG-ZAG • VEHICLE • % • frame)
  className?: string
  hideBorder?: boolean
}

type ZigZagPanelDef = {
  id?: string
  anchor: number                  // 0–1 where panel is most opaque (window ~0.125)
  side?: "left" | "right" | "center" // desktop side; mobile always centered. Auto-alternates if omitted.
  kicker?: string
  title?: string
  description?: string
  content?: ReactNode            // if present, kicker/title/description ignored
  className?: string
}
```

Panel fade: `opacity 0.14→1`, `blur 1.1→0`, `y 12→0`, `scale 0.97→1` when `|progress - anchor| < 0.125`.

Vehicle: `KEYS` 9 points `x:-27..+27vw`, `y:-34..+36vh`, mobile `x*0.32 y*0.92`, tilt `±4deg` easing. Exported as `ZIGZAG_KEYS`/`KEYS` + helper `getPos(p)` for custom vehicles.

### Exports

```ts
import { ZigZag, ZigZagVehicle, ZIGZAG_KEYS, KEYS, getPos } from "zigzag"
import type { ZigZagProps, ZigZagPanelDef, ZigZagKey } from "zigzag"
import { Button, Badge, cn } from "zigzag"
import "zigzag/styles.css"
```

`ZigZagVehicle` is a back-compat alias for `ZigZag`.

## MP4 → WebP frames (for scrub)

Same as `hero-scroll` — scrub needs WebP frames (not MP4 seek). One request per frame, `canvas.drawImage` per scroll. Progressive: first frame shows in ~50KB, rest stream.

```bash
# put master at ./video.mp4
./scripts/mp4-to-webp.sh ./video.mp4 ./src/public/frames 24 1920 75
node scripts/mp4-to-webp.mjs ./video.mp4 ./src/public/frames 24 1920 75

# → src/public/frames/frame_0000.webp … frame_0159.webp + manifest.json
# for Habesha split: run twice for platter.mp4 and culture.mp4 into frames-platter / frames-culture
```

Requires `ffmpeg` with `libwebp`:

```bash
brew install ffmpeg
sudo apt install ffmpeg
```

Consumer keeps frames in `public/frames` or CDN — `dist` stays light (JS + CSS only).

## Develop

```bash
npm run build       # tsc -b && vite build → dist/zigzag.es.js + zigzag.css + index.d.ts
npm run type-check
npm run lint
```

Engine preview in `../engine` if present.

## Source

Copied from `Habesha-Restaurang-Kaffe-Jönköping/src/components/ZigZagVehicle.tsx` (580vh→860vh, 9 panels, invisible track, water tunnel `left|tunnel|right`), `CentralTunnel.tsx` water overlay concept, `Site.tsx` hero integration, `index.astro` usage (`platterFrames 80 + cultureFrames 80 → continuous 160`), and `styles/globals.css` tokens (`hero-gradient #1d0d07→#39150f`, `bg-grain`, `shadow-warm`). Stripped Habesha data (`RESTAURANT`/`MENU_GROUPS`/`FEATURED_REVIEWS`/`ABOUT_COPY`) for generic `panels` prop.

## License

Same as source project.
